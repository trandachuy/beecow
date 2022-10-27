import './ToolbarView.sass'

import React, {useContext, useRef, useState} from 'react'
import PropTypes from 'prop-types'
import i18next from 'i18next'
import $ from 'jquery'
import {ThemeMakingContext} from '../context/ThemeMakingContext'
import GSButton from '../../../../components/shared/GSButton/GSButton'
import GSImg from '../../../../components/shared/GSImg/GSImg'
import GSComponentTooltip from '../../../../components/shared/GSComponentTooltip/GSComponentTooltip'
import GSTooltip from '../../../../components/shared/GSTooltip/GSTooltip'
import mediaService, {MediaServiceDomain} from '../../../../services/MediaService'
import {ThemeEngineService} from '../../../../services/ThemeEngineService'
import {GSToast} from '../../../../utils/gs-toast'
import {generatePath} from 'react-router-dom'
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation'
import {ImageUtils} from '../../../../utils/image'
import LoadingScreen from '../../../../components/shared/LoadingScreen/LoadingScreen'
import {LoadingStyle} from '../../../../components/shared/Loading/Loading'
import ThemeEngineUtils from '../ThemeEngineUtils'
import {iframeScrollTo} from '../editor/HtmlEditor'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import ConfirmModal from '../../../../components/shared/ConfirmModal/ConfirmModal'
import {TokenUtils} from '../../../../utils/token'
import storageService from '../../../../services/storage'
import Constants from '../../../../config/Constant'
import AlertModal from '../../../../components/shared/AlertModal/AlertModal'
import {AlertInlineType} from '../../../../components/shared/AlertInline/AlertInline'
import beehiveService from '../../../../services/BeehiveService'
import RenameThemeModal from '../renameThemeModal/RenameThemeModal'
import GSDropDownButton, {GSDropdownItem} from '../../../../components/shared/GSButton/DropDown/GSDropdownButton'
import ThemeEngineConstants from '../ThemeEngineConstants'
import i18n from '../../../../config/i18n'
import {GSAlertModalType} from '../../../../components/shared/GSAlertModal/GSAlertModal'
import {v4 as uuidv4} from 'uuid'

const ACTIONS = {
    SAVE: 'SAVE',
    PUBLISH: 'PUBLISH'
}

const ToolbarView = (props) => {
    const { state, dispatch } = useContext(ThemeMakingContext.context)

    const hasPermissions = TokenUtils.hasThemeEnginePermission()
    const EDIT_CLAZZ = ['gs-html-editor-disabled-events', 'gs-html-editor-active', 'section-min-height', 'page-load-error', 'error-title', 'validate-error']

    const [stLoading, setStLoading] = useState(false)
    const [stToggleRename, setStToggleRename] = useState(false)
    const [stDefaultThemeName, setStDefaultThemeName] = useState('')
    const [stRenameCallbackAction, setStRenameCallbackAction] = useState()

    let refConfirmModal = useRef()
    let refAlertModal = useRef()

    const onChangeView = (platform) => {
        dispatch(ThemeMakingContext.actions.setPlatform(platform))
    }

    const convertBlobURLToFile = (URL) => {
        return fetch(URL)
            .then(r => r.blob())
            .then(blobFile => {
                const [, extension] = blobFile.type.split('/')

                return new File([blobFile], uuidv4() + '.' + extension, { type: blobFile.type })
            })
    }

    const consecutivePromises = (promises) => {
        return promises.reduce((acc, promiseFunc) => acc.then(prev => promiseFunc().then(next => [...prev, next])), Promise.resolve([]))
    }

    const formatHtmlContent = htmlContent => {
        //removed styles by editor
        htmlContent.find('head').find('style#iframe-editor-style').remove()
        htmlContent.find('head').find('style#iframe-editor-style-responsive').remove()
        htmlContent.find('head').find('style#iframe-editor-style-platform-mobile').remove()

        //removed new empty element created by editor
        htmlContent.find('body').find('section[gs-component-add-local-section]').remove()

        //removed toolbar editor dom and script
        htmlContent.find('head').find('script#iframe-toolbar-editor-script').remove()
        htmlContent.find('body').find('div#iframe-toolbar-editor').remove()
        htmlContent.find('body').find('section[cp]').removeClass(EDIT_CLAZZ.join(' '))

        //removed appended styles after changeview
        htmlContent.find('body').find('[platformvisible="mobile"],[platformvisible="web"]').css('display', '')

        return htmlContent.html()
    }

    const processValidateComponents = htmlContent => {
        const {
            COMPONENT_KEY,
            FRAGMENT_KEY,
            COMPONENT_SCHEMA_KEY,
            COMPONENT_DATA_VALUE_KEY,
            COMPONENT_MOCK_VALUE_KEY,
            COMPONENT_HASH
        } = ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY

        return Promise.resolve()
            .then(() => {
                let error = false
                let result
                let scrollTop = 0

                htmlContent.find(`section[${ COMPONENT_KEY }]:not([${ FRAGMENT_KEY }])`)
                    .each((index, el) => {
                        const schema = $(el).attr(COMPONENT_SCHEMA_KEY)
                        const value = $(el).attr(COMPONENT_DATA_VALUE_KEY)
                        const mock = $(el).attr(COMPONENT_MOCK_VALUE_KEY)

                        if (!schema) {
                            return
                        }

                        const jsonSchema = ThemeEngineUtils.parseString(schema)
                        const jsonMock = ThemeEngineUtils.parseString(mock)
                        let jsonValue = ThemeEngineUtils.parseString(value)

                        if (!jsonValue && jsonSchema) {
                            //Don't have value, need to pick value from mock
                            jsonValue = ThemeEngineUtils.mergeValueFromSchema(jsonSchema, jsonMock)

                            const stringValue = JSON.stringify(jsonValue).replace(/'/g, '&apos;')

                            htmlContent
                                .find(`section[${ COMPONENT_KEY }]:not([${ FRAGMENT_KEY }])`)[index]
                                .setAttribute(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_DATA_VALUE_KEY, stringValue)
                        }

                        const isValidate = ThemeEngineUtils.validateValueFromSchema(jsonSchema, jsonValue)
                        const componentHash = $(el).attr(COMPONENT_HASH)
                        const domEl = htmlContent.find('body').find(`section[${ COMPONENT_HASH }='${ componentHash }']`)
                        const errorEl = $('iframe#gs_iframe_editor').contents().find(`section[${ COMPONENT_HASH }='${ componentHash }']`)

                        if (!error && !isValidate) {
                            error = true


                            if (errorEl && errorEl.length) {
                                const { top } = errorEl.offset()

                                scrollTop = top
                            }
                        }

                        if (isValidate) {
                            domEl.removeClass('validate-error')
                        } else {
                            errorEl.addClass('validate-error')
                        }
                    })

                if (error) {
                    result = 'component.toolbarView.validate.error'
                    iframeScrollTo(scrollTop)
                } else {
                    result = formatHtmlContent(htmlContent)
                }

                return Promise[error ? 'reject' : 'resolve'](result)
            })
    }

    const processUploadImages = (content) => {
        return Promise.resolve()
            .then(() => {
                const blobReg = /(blob:)(http[s]?:\/\/(?:www\.)?)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*(\.[a-z]{2,5})?(:[0-9]{1,5})?(\/[a-zA-Z0-9-]*)?/gi
                const matchedBlobs = _.uniqBy(content.match(blobReg), match => match)
                const promises = []

                matchedBlobs.forEach(blob => {
                    const promiseFunc = () => {
                        return convertBlobURLToFile(blob)
                            .then(file => {
                                return mediaService.uploadFileWithDomain(file, MediaServiceDomain.GENERAL)
                            })
                            .then(imgModel => ({
                                origin: blob,
                                upstream: ImageUtils.getImageFromImageModel(imgModel)
                            }))
                    }

                    promises.push(promiseFunc)
                })

                return consecutivePromises(promises)
            })
            .then(imageEntries => {
                for (const { origin, upstream } of imageEntries) {
                    content = content.replaceAll(origin, upstream)
                }

                return content
            })
    }

    const processPreSavePages = (data) => {
        return Promise.resolve(ThemeEngineConstants.PRE_REMOVABLE_LINKS.reduce((acc, cur) => acc.replaceAll(cur, ''), data))
    }

    const processSavePages = (data, customName) => {
        const lstPages = state.listEditPages
        const themeType = state.themeType
        const page = state.page

        //save theme page at first time
        if (lstPages && themeType === ThemeEngineConstants.THEME_TYPE.MASTER) {
            return ThemeEngineService.saveMasterPageContent(lstPages.masterThemeId, [{
                id: page.id,
                content: data
            }], customName)
        } else if (themeType === ThemeEngineConstants.THEME_TYPE.STORE) {
            const storeThemeId = state.themeId
            if (page.type === ThemeEngineConstants.PAGE_TYPE.CUSTOM) {
                return ThemeEngineService.saveCustomPageOnStoreTheme(storeThemeId, [{
                    id: page.id,
                    content: data
                }])
            }
            return ThemeEngineService.saveStorePageContent([{
                id: page.id,
                content: data
            }], customName)
        }
    }

    const processRenameTheme = (action) => {
        setStRenameCallbackAction(action)

        return new Promise((resolve) => {
            const themeType = state.themeType

            if (themeType === ThemeEngineConstants.THEME_TYPE.MASTER) {
                const masterThemeId = state.listEditPages.masterThemeId

                return ThemeEngineService.getMasterThemeById(masterThemeId)
                    .then(masterTheme => {
                        setStDefaultThemeName(masterTheme.name)
                        setStToggleRename(true)

                        return resolve(true)
                    })
            } else if (themeType === ThemeEngineConstants.THEME_TYPE.STORE) {
                const storeThemeId = state.themeId

                return ThemeEngineService.getStoreThemesById(storeThemeId)
                    .then(storeTheme => {
                        if (storeTheme.customName) {
                            return resolve(false)
                        }

                        const masterThemeId = storeTheme.masterThemeId

                        return ThemeEngineService.getMasterThemeById(masterThemeId)
                            .then(masterTheme => {
                                setStDefaultThemeName(masterTheme.name)
                                setStToggleRename(true)

                                return resolve(true)
                            })
                    })
            }
        })
    }

    const processCompletedSave = (storeThemeId) => {
        GSToast.commonUpdate()
        const lstPages = state.listEditPages
        const themeType = state.themeType

        //save theme page at first time
        if (lstPages && themeType === ThemeEngineConstants.THEME_TYPE.MASTER) {
            window.open(generatePath(NAV_PATH.themeEngine.making, {
                themeId: storeThemeId,
                themeType: ThemeEngineConstants.THEME_TYPE.STORE
            }), '_self')
        }
    }

    const handleSavePages = (customName) => {
        setStLoading(true)
        const htmlContent = $('iframe#gs_iframe_editor').contents().find('html').clone()

        return processValidateComponents(htmlContent)
            .then(html => processUploadImages(html))
            .then(data => processPreSavePages(data))
            .then(data => processSavePages(data, customName))
            .then(res => {
                processCompletedSave(res.data.storeThemeId)

                return res
            })
            .catch((e) => {
                GSToast.commonError()
            })
            .finally(() => {
                setStLoading(false)
            })
    }

    const onClickSave = () => {
        return processRenameTheme(ACTIONS.SAVE)
            .then(isRename => {
                if (!isRename) {
                    return handleSavePages()
                }
            })
    }

    const handlePublish = (justPublish, customName) => {
        const lstPages = state.listEditPages
        const themeType = state.themeType
        let storeThemeId

        return (
            justPublish
                ? Promise.resolve(false)
                : processRenameTheme(ACTIONS.PUBLISH)
        )
            .then(isRename => {
                if (isRename) {
                    return Promise.reject(true)
                }
            })
            .then(() => {
                return handleSavePages(customName)
            })
            .then((resp) => {
                storeThemeId = resp.data.storeThemeId

                if (themeType === ThemeEngineConstants.THEME_TYPE.STORE) {
                    storeThemeId = state.themeId
                }

                if (!storeThemeId) {
                    return Promise.reject()
                }

                return ThemeEngineService.publishStoreTheme(storeThemeId)
            })
            .then(() => {
                return beehiveService.buildWebSsr(storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID))
            })
            .then(() => {
                if (!storeThemeId) {
                    return Promise.reject()
                }

                refAlertModal.current.openModal({
                    type: AlertInlineType.SUCCESS,
                    messages: i18next.t('page.themeEngine.management.publish.success'),
                    closeCallback: () => {
                        //save theme page at first time
                        if (lstPages && themeType === ThemeEngineConstants.THEME_TYPE.MASTER) {
                            return window.open(generatePath(NAV_PATH.themeEngine.making, {
                                themeId: storeThemeId,
                                themeType: ThemeEngineConstants.THEME_TYPE.STORE
                            }), '_self')
                        }
                        return window.location.reload()
                    }
                })
            })
            .catch(isValid => {
                if (isValid) {
                    return
                }

                refAlertModal.current.openModal({
                    type: AlertInlineType.ERROR,
                    messages: i18next.t('page.themeEngine.management.publish.failed')
                })
            })
            .finally(() => {
                setStLoading(false)
            })
    }

    const onClickPublish = () => {
        refConfirmModal.openModal({
            messages: i18next.t('page.themeEngine.management.button.publish.hint'),
            okCallback: handlePublish
        })
    }

    const handleRenameChanged = (customName) => {
        if (stRenameCallbackAction === ACTIONS.SAVE) {
            handleSavePages(customName)
        } else if (stRenameCallbackAction === ACTIONS.PUBLISH) {
            handlePublish(true, customName)
        }
        setStToggleRename(false)
        setStRenameCallbackAction(null)
    }

    const toggleTranslation = () => {
        if (!state.returnComponent) {
            dispatch(ThemeMakingContext.actions.toggleTranslateMode(true))

            return
        }

        refConfirmModal.openModal({
            modalTitle: i18n.t('common.txt.confirm.modal.title'),
            messages: i18n.t('component.product.addNew.cancelHint'),
            modalAcceptBtn: i18n.t('common.txt.alert.modal.btn'),
            modalCloseBtn: i18n.t('common.btn.alert.modal.close'),
            type: GSAlertModalType.ALERT_TYPE_SUCCESS,
            okCallback: () => {
                dispatch(ThemeMakingContext.actions.toggleTranslateMode(true))
            }
        })
    }

    const handleSelectLanguage = (lang) => {
        if (lang === state.selectedStoreLang) {
            return
        }

        if (!state.returnComponent) {
            dispatch(ThemeMakingContext.actions.setSelectedStoreLanguage(lang))

            return
        }

        refConfirmModal.openModal({
            modalTitle: i18n.t('common.txt.confirm.modal.title'),
            messages: i18n.t('page.themeEngine.modal.confirm.change.language.text'),
            modalAcceptBtn: i18n.t('common.txt.alert.modal.btn'),
            modalCloseBtn: i18n.t('common.btn.alert.modal.close'),
            type: GSAlertModalType.ALERT_TYPE_SUCCESS,
            okCallback: () => {
                dispatch(ThemeMakingContext.actions.setSelectedStoreLanguage(lang))
            }
        })
    }

    const handleCloseTranslation = () => {
        if (!state.returnComponent) {
            dispatch(ThemeMakingContext.actions.toggleTranslateMode(false))

            return
        }

        refConfirmModal.openModal({
            modalTitle: i18n.t('common.txt.confirm.modal.title'),
            messages: i18n.t('component.product.addNew.cancelHint'),
            modalAcceptBtn: i18n.t('common.txt.alert.modal.btn'),
            modalCloseBtn: i18n.t('common.btn.alert.modal.close'),
            type: GSAlertModalType.ALERT_TYPE_SUCCESS,
            okCallback: () => {
                dispatch(ThemeMakingContext.actions.toggleTranslateMode(false))
            }
        })
    }

    const handleSaveTranslation = () => {
        onClickSave()
            .then(() => {
                dispatch(ThemeMakingContext.actions.setReturnComponent(null))
            })
    }

    const renderEditButtonGroup = () => {
        return (
            <div className={ 'd-flex justify-content-end platform-action' }>
                { <>
                    <GSButton success marginRight
                              className={ 'text-uppercase' }
                              onClick={ onClickSave }>
                        <GSTrans t="page.themeEngine.editor.button.save"/>
                    </GSButton>
                    <GSButton outline success marginLeft
                              className={ 'text-uppercase gs-cancel-btn' }
                              onClick={ e => {
                                  onClickPublish()
                              } }>
                        <GSTrans t="page.themeEngine.editor.button.publish"/>
                    </GSButton>
                </> }
            </div>
        )
    }

    const renderPreviewButtonGroup = () => {
        return (
            <div className={ 'd-flex justify-content-end platform-action' }>
                <GSButton success marginRight
                          className={ 'text-uppercase' }
                          disabled={ !hasPermissions }
                          onClick={ (e) => {
                              window.open(generatePath(NAV_PATH.themeEngine.making, {
                                  themeId: state.themeId,
                                  themeType: ThemeEngineConstants.THEME_TYPE.MASTER
                              }), '_self')
                          } }>
                    <GSTrans t="page.themeEngine.editor.button.customize"/>
                </GSButton>
            </div>
        )
    }

    const renderTranslationButtonGroup = () => {
        return (
            <div className={ 'd-flex justify-content-end platform-action' }>
                { <>
                    <GSButton success marginRight
                              className={ 'text-uppercase' }
                              onClick={ handleSaveTranslation }>
                        <GSTrans t="page.themeEngine.editor.button.save"/>
                    </GSButton>
                    <GSButton outline success marginLeft
                              className={ 'text-uppercase gs-cancel-btn' }
                              onClick={ handleCloseTranslation }>
                        <GSTrans t="page.themeEngine.editor.button.close"/>
                    </GSButton>
                </> }
            </div>
        )
    }

    return (
        <>
            <ConfirmModal ref={ (el) => {
                refConfirmModal = el
            } }/>
            <AlertModal ref={ refAlertModal }/>
            <RenameThemeModal
                isToggle={ stToggleRename }
                defaultValue={ stDefaultThemeName }
                onChange={ handleRenameChanged }
                onClose={ () => setStToggleRename(false) }/>

            { stLoading && <LoadingScreen loadingStyle={ LoadingStyle.DUAL_RING_WHITE }/> }

            {/*TRANSLATION BUTTON*/ }
            <div
                className={ 'd-flex vw-75 h-100 m-0 p-0 justify-content-center align-items-center toolbar-view-layout' }>

                {
                    state.storeLanguages.length > 1 && (
                        !state.controller.isTranslate
                            ? <button
                                className="translate-button"
                                onClick={ toggleTranslation }
                            >
                                <GSTrans t="page.themeEngine.editor.button.editTranslation">Edit Translation</GSTrans>
                            </button>
                            : <GSDropDownButton className="translate-dropdown" button={
                                ({ onClick }) => (
                                    <div className="d-flex translate-dropdown__button" onClick={ onClick }>
                                        <GSTrans t={ `page.setting.languages.${ state.selectedStoreLang.langCode }` }/>
                                        &nbsp;
                                        <i className="fa fa-angle-down ml-auto mt-auto mb-auto" aria-hidden="true"></i>
                                    </div>
                                )
                            }>
                                {
                                    state.storeLanguages.filter(lang => !lang.isInitial).map(lang => (
                                        <GSDropdownItem key={ lang.id } className="pl-4 pr-4"
                                                        onClick={ () => handleSelectLanguage(lang) }>
                                            <GSTrans t={ `page.setting.languages.${ lang.langCode }` }/>
                                        </GSDropdownItem>
                                    ))
                                }
                            </GSDropDownButton>
                    )
                }
                {/*END TRANSLATION BUTTON*/ }

                {/*RESPONSIVE REGION*/ }
                { !state.controller.isTranslate && <div className={ 'd-flex justify-content-center platform-type' }>
                    <GSComponentTooltip message={ i18next.t('component.toolbarView.tooltip.desktop') }
                                        theme={ GSTooltip.THEME.LIGHT }>
                        <GSButton
                            className={ 'view-button' }
                            onClick={ e => {
                                onChangeView(ThemeEngineConstants.PLATFORM_TYPE.DESKTOP)
                            } }>
                            <GSImg
                                className={ 'view-icon' }
                                src={ `/assets/images/icon-desktop-${ (state.platform === ThemeEngineConstants.PLATFORM_TYPE.DESKTOP) ? 'active' : 'inactive' }.png` }
                                height={ 30 }>
                            </GSImg>
                        </GSButton>
                    </GSComponentTooltip>
                    <GSComponentTooltip message={ i18next.t('component.toolbarView.tooltip.mobile') }
                                        theme={ GSTooltip.THEME.LIGHT }>
                        <GSButton marginLeft
                                  className={ 'view-button' }
                                  onClick={ e => {
                                      onChangeView(ThemeEngineConstants.PLATFORM_TYPE.RESPONSIVE)
                                  } }>
                            <GSImg
                                className={ 'view-icon' }
                                src={ `/assets/images/icon-responsive-${ (state.platform === ThemeEngineConstants.PLATFORM_TYPE.RESPONSIVE) ? 'active' : 'inactive' }.png` }
                                height={ 30 }>
                            </GSImg>
                        </GSButton>
                    </GSComponentTooltip>
                    <span className="toolbar-view-indicator"></span>
                    <GSComponentTooltip message={ i18next.t('component.toolbarView.tooltip.app') }
                                        theme={ GSTooltip.THEME.LIGHT }>
                        <GSButton marginLeft
                                  className={ 'view-button' }
                                  onClick={ e => {
                                      onChangeView(ThemeEngineConstants.PLATFORM_TYPE.MOBILE)
                                  } }>
                            <GSImg
                                className={ 'view-icon' }
                                src={ `/assets/images/icon-app-${ (state.platform === ThemeEngineConstants.PLATFORM_TYPE.MOBILE) ? 'active' : 'inactive' }.png` }
                                height={ 30 }>
                            </GSImg>
                        </GSButton>
                    </GSComponentTooltip>
                </div> }
                {/*END RESPONSIVE REGION*/ }

                {/*SAVE BUTTON*/ }
                {
                    !state.isPreview
                        ? !state.controller.isTranslate
                            ? renderEditButtonGroup()
                            : renderTranslationButtonGroup()
                        : renderPreviewButtonGroup()
                }
                {/*END SAVE BUTTON*/ }

            </div>
        </>
    )
}

ToolbarView.propTypes = {
    onSwitchView: PropTypes.func,
    onEdit: PropTypes.func,
    onSave: PropTypes.func,
    onPublish: PropTypes.func
}

export default ToolbarView

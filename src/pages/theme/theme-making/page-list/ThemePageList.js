import './ThemePageList.sass'
import React, {useContext, useEffect, useRef, useState} from 'react'
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {ThemeEngineService} from "../../../../services/ThemeEngineService";
import {GSToast} from "../../../../utils/gs-toast";
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import i18n from '../../../../config/i18n';
import GSAlertModal, {GSAlertModalType} from '../../../../components/shared/GSAlertModal/GSAlertModal';
import ThemeEngineConstants from "../ThemeEngineConstants";


const ThemePageList = (props) => {

    let confirmChangePage = useRef()
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const [stPages, setStPages] = useState([])
    const [stCustomPages, setStCustomPages] = useState([])
    const [stActivePage, setStActivePage] = useState(null)
    const [stToggle, setStToggle] = useState(false)
    const [stAttachActivePage, setStAttachActivePage] = useState({pageType: null, pageId: null})

    const refAddPageInput = useRef()

    const resolveGetThemeFunction = (themeType, isPreview) => {
        if (isPreview || themeType === ThemeEngineConstants.THEME_TYPE.MASTER) {
            return ThemeEngineService.getMasterPagesByMasterThemeId
        } else if (themeType === ThemeEngineConstants.THEME_TYPE.STORE) {
            return ThemeEngineService.getStorePagesByStoreThemeId
        }

        return new Promise((resolve, reject) => reject)
    }

    const activePageByParam = () => {
        let url = new URL(document.location);
        const pageType = url.searchParams.get("pageType");
        const pageId = url.searchParams.get("pageId");
        if (pageType && pageId) {
            setStAttachActivePage({pageType: pageType, pageId: pageId});
        }
    }

    const sortPagesForUser = (pages) => {
        const indexedPages = pages.map(page => {
            switch (page.type) {
                case 'HOME':
                    page.sortIndex = 1
                    break

                case 'PRODUCT_DETAIL':
                    page.sortIndex = 2
                    break

                case 'SERVICE_DETAIL':
                    page.sortIndex = 3
                    break

                default:
                    page.sortIndex = 99
            }

            return page
        })

        return _.sortBy(indexedPages, [page => page.sortIndex])
    }

    useEffect(() => {
        if (!state.themeId || !state.themeType) {
            return
        }

        resolveGetThemeFunction(state.themeType, state.isPreview)(state.themeId, {
            ignoreContent: true,
            editable: true,
        })
            .then(pages => {
                if (!pages.length) {
                    return
                }

                const sortedPages = sortPagesForUser(pages)

                setStPages(sortedPages)
                let activePage = {...sortedPages[0]};
                const {pageType} = stAttachActivePage;
                if (pageType !== ThemeEngineConstants.PAGE_TYPE.CUSTOM) {
                    setStActivePage({
                        ...activePage,
                        pageType: ThemeEngineConstants.PAGE_TYPE.DEFAULT,
                    })
                }

                /* if(state.themeType === ThemeEngineConstants.THEME_TYPE.STORE) {
                    return resolveGetCustomPage(0, 100, activePage);
                } */
            })
            .then(({pages, activePage} = {}) => {
                if (!pages) {
                    return;
                }
                setStCustomPages(pages);
                const {masterPageId, storeThemeId, storeId} = activePage;
                const {pageId, pageType} = stAttachActivePage;
                if (pageId && pageType === ThemeEngineConstants.PAGE_TYPE.CUSTOM) {
                    const viewPage = pages.find(page => page.id === +pageId );
                    if (viewPage) {
                        const newActivePage = {
                            ...viewPage,
                            masterPageId: masterPageId,
                            storeThemeId: storeThemeId,
                            storeId: storeId,
                            type: ThemeEngineConstants.PAGE_TYPE.CUSTOM,
                            pageType: ThemeEngineConstants.PAGE_TYPE.CUSTOM
                        };
                        setStActivePage(newActivePage);
                    }
                }
            })
            .catch((e) => {
                console.log(e);
                GSToast.commonError();
            })

    }, [state.themeId, state.themeType])

    useEffect(() => {
        if (stActivePage) {
            if (state.controller.isTranslate) {
                dispatch(ThemeMakingContext.actions.setSettingTab(ThemeEngineConstants.SETTING_TAB.TRANSLATE_HINT))
            } else {
                dispatch(ThemeMakingContext.actions.setSettingTab(ThemeEngineConstants.SETTING_TAB.GENERAL_SETTING))
            }
            dispatch(ThemeMakingContext.actions.setPage(stActivePage))
        }
    }, [stActivePage])

    useEffect(() => {
        activePageByParam();
    }, [])

    useEffect(() => {
        $('.theme-page-dropdown')[stToggle ? 'slideDown' : 'slideUp'](150)

        if (stToggle) {
            $('#theme-page-dropdown').focus()
        }
    }, [stToggle])

    const togglePageList = () => {
        setStToggle(toggle => !toggle)
    }

    const openPageList = () => {
        setStToggle(true)
    }

    const closePageList = () => {
        setStToggle(false)
    }

    const handleLockPage = async () => {
        dispatch(ThemeMakingContext.actions.setLockChangePage(true));
    }

    const handlePage = (id, pageType) => {
        const {storeId, storeThemeId, masterPageId} = stPages[0];
        let isPageChanged = false;

        if (pageType === ThemeEngineConstants.PAGE_TYPE.DEFAULT) {
            const activePage = stPages.find(page => page.id === id)

            setStActivePage({
                ...activePage,
                pageType: ThemeEngineConstants.PAGE_TYPE.DEFAULT
            })
            isPageChanged = true;
        } else if (pageType === ThemeEngineConstants.PAGE_TYPE.CUSTOM) {
            const activePage = stCustomPages.find(page => page.id === id)

            setStActivePage({
                ...activePage,
                masterPageId: masterPageId,
                storeThemeId: storeThemeId,
                storeId: storeId,
                type: ThemeEngineConstants.PAGE_TYPE.CUSTOM,
                pageType: ThemeEngineConstants.PAGE_TYPE.CUSTOM
            })
            isPageChanged = true;
        }

        if (isPageChanged) {
            handleLockPage();
        }
    }

    const findRequestPage = (pageType) => {
        if (stPages) {
            const activePage = stPages.find(page => page.type === pageType)

            setStActivePage({
                ...activePage,
                pageType: ThemeEngineConstants.PAGE_TYPE.DEFAULT
            })
        }
    }

    const confirmSwitchPage = (id, pageType, e) => {
        if (state.lockChangePage) {
            e && e.preventDefault()
            return
        }

        if (state.isPreview || !state.returnComponent) {
            handlePage(id, pageType);
            closePageList()

            return
        }

        confirmChangePage.openModal({
            modalTitle: i18n.t('common.txt.confirm.modal.title'),
            messages: i18n.t("page.themeEngine.modal.confirm.change.page.text"),
            modalAcceptBtn: i18n.t('common.txt.alert.modal.btn'),
            modalCloseBtn: i18n.t('common.btn.alert.modal.close'),
            type: GSAlertModalType.ALERT_TYPE_SUCCESS,
            acceptCallback: () => {
                handlePage(id, pageType);
            },
            closeCallback: openPageList
        })
    }

    const validateInput = () => {
        if (!refAddPageInput.current.value.trim()) {
            return true
        }

        return false
    }

    const handleAddPage = () => {
        if (validateInput()) {
            return
        }
    }

    return (
        <>
            {stActivePage &&
            <div className='h-100 theme-page-list' tabIndex="0" onBlur={closePageList}>
                <div className='d-flex align-items-center h-100 p-3 cursor--pointer theme-page-list__button' onClick={togglePageList}>
                    <span className='text-gray font-weight-bold theme-page-list__button__title'>
                        <GSTrans t='page.themeEngine.editor.pageList.title'/>
                    </span>
                    <div className='w-100 d-flex pl-3 text-white'>
                        <span className='text-truncate font-weight-bold'>
                            <GSTrans t={`page.themeEngine.editor.pageList.${stActivePage.name}.title`}>
                                {stActivePage.name}
                            </GSTrans>
                        </span>
                        <i className="fa fa-chevron-down ml-auto" aria-hidden="true"></i>
                    </div>
                </div>

                <div id='theme-page-dropdown' className='position-relative'>
                    <div className='theme-page-dropdown'>
                        <div className='text-uppercase theme-page-dropdown__section'>
                            <GSTrans t='page.themeEngine.editor.pageList.section.site'/>
                        </div>
                        {stPages.map(page => (
                            <div key={page.id} 
                                onClick={e => confirmSwitchPage(page.id, ThemeEngineConstants.PAGE_TYPE.DEFAULT, e)}
                                className={[
                                     'd-flex theme-page-dropdown__item p-0',
                                     stActivePage.pageType === ThemeEngineConstants.PAGE_TYPE.DEFAULT && stActivePage.id === page.id
                                         ? 'theme-page-dropdown__item--active'
                                         : '',
                                    state.lockChangePage ? 'disabled' : ''
                                 ].join(' ')}>
                                <span className='theme-page-dropdown__item__name'>
                                    <GSTrans
                                        t={`page.themeEngine.editor.pageList.${page.name}.title`}>{page.name}</GSTrans>
                                </span>
                            </div>
                        ))}
                        {!state.isPreview && (stCustomPages.length > 0) &&
                        <>
                            <div className='text-uppercase theme-page-dropdown__section'>
                                <GSTrans t='page.themeEngine.editor.pageList.section.custom'/>
                            </div>
                            {stCustomPages.map(page => (
                                <div key={page.id}
                                    onClick={e => confirmSwitchPage(page.id, ThemeEngineConstants.PAGE_TYPE.CUSTOM, e)}
                                     className={[
                                         'd-flex theme-page-dropdown__item p-0',
                                         stActivePage.pageType === ThemeEngineConstants.PAGE_TYPE.CUSTOM && stActivePage.id === page.id
                                             ? 'theme-page-dropdown__item--active'
                                             : ''
                                     ].join(' ')}>
                                    <span className='theme-page-dropdown__item__name text-truncate'>
                                        {page.name}
                                    </span>
                                </div>
                            ))}
                        </>}
                    </div>
                </div>
            </div>}
            <GSAlertModal ref={(el) => {
                confirmChangePage = el
            }}/>
        </>
    )
}

export default ThemePageList

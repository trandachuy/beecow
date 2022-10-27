import './FbPageConfiguration.sass'
import React, {useEffect, useRef, useState} from 'react'
import {CredentialUtils} from '../../../utils/credential'
import {RouteUtils} from '../../../utils/route'
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer'
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader'
import GSContentBody from '../../../components/layout/contentBody/GSContentBody'
import GSButton from '../../../components/shared/GSButton/GSButton'
import PropTypes from 'prop-types'
import facebookService from '../../../services/FacebookService'
import i18next from 'i18next'
import GSTrans from '../../../components/shared/GSTrans/GSTrans'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import GSWidget from '../../../components/shared/form/GSWidget/GSWidget'
import GSWidgetHeader from '../../../components/shared/form/GSWidget/GSWidgetHeader'
import GSWidgetContent from '../../../components/shared/form/GSWidget/GSWidgetContent'
import GSWidgetFooter from '../../../components/shared/form/GSWidget/GSWidgetFooter'
import {UikCheckbox} from '../../../@uik'
import GSLearnMoreFooter from '../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter'
import GSFakeLink from '../../../components/shared/GSFakeLink/GSFakeLink'
import {PERMISSION_SCOPE_REQUEST} from '../intro/FbChatIntro'
import {useRecoilState, useRecoilValue, useResetRecoilState} from 'recoil'
import {FbPageConfigurationRecoil} from './FbPageConfigurationRecoil'
import {NavigationPath} from '../../../config/NavigationPath'
import {GSToast} from '../../../utils/gs-toast'
import GSWidgetEmptyContent from '../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent'
import {useHistory} from 'react-router-dom'
import _ from 'lodash'
import AlertModal, {AlertModalType} from '../../../components/shared/AlertModal/AlertModal'
import GSAlertModal, {GSAlertModalType} from '../../../components/shared/GSAlertModal/GSAlertModal'
import {TokenUtils} from "../../../utils/token";


const PAGE_ENUM = {
    CONNECTED_LIST: 0,
    UNCONNECTED_LIST: 1,
    CONNECTING: 2
}
export const FbPageStatus = {
    UNCONNECTED: 'UNCONNECTED',
    WAITING_FOR_APPROVE: 'WAITING_FOR_APPROVE',
    APPROVE: 'APPROVED'
}
const LEARN_MORE_URL = 'https://huongdan.gosell.vn/'
const FbPageConfiguration = props => {
    const [stMainPage, setStMainPage] = useRecoilState(FbPageConfigurationRecoil.mainPageState);
    const [stPageList, setStPageList] = useRecoilState(FbPageConfigurationRecoil.fbSavedPageListState)
    const [stFbAuth, setStFbAuth] = useRecoilState(FbPageConfigurationRecoil.fbUserState)
    const [stLoading, setStLoading] = useRecoilState(FbPageConfigurationRecoil.loadingState)
    const [stSaving, setStSaving] = useRecoilState(FbPageConfigurationRecoil.savingState)
    const resetMainPage = useResetRecoilState(FbPageConfigurationRecoil.mainPageState);

    useEffect(() => {
        setStLoading(true)
        const isExistGoSocial = CredentialUtils.getIsExistGoSocial()

        if (!isExistGoSocial) {
            RouteUtils.redirectWithoutReload(props, NavigationPath.goSocial.PATH_GOSOCIAL_INTRO)
        }

        fetchConfiguration()
        return () => {
            resetMainPage()
        }
    }, [])

    const onTogglePage = () => {
        setStMainPage(state => state === PAGE_ENUM.CONNECTED_LIST ? PAGE_ENUM.UNCONNECTED_LIST : PAGE_ENUM.CONNECTED_LIST)
    }

    const fetchConfiguration = () => {
        const storeConfig = CredentialUtils.getFbChatLogin()

        if (!storeConfig?.isLogged) {
            RouteUtils.redirectWithoutReload(props, NavigationPath.goSocial.PATH_GOSOCIAL_INTRO)
            return
        }

        setStFbAuth(storeConfig)

        facebookService.getSavedPageList()
            .then(pageList => {
                setStPageList(pageList)
                if (pageList.filter(page => page.usingStatus === FbPageStatus.APPROVE).length === 0) {
                    setStMainPage(PAGE_ENUM.UNCONNECTED_LIST)
                }
            })
            .catch(e => {
                RouteUtils.redirectWithoutReload(props, NavigationPath.goSocial.PATH_GOSOCIAL_INTRO)
            })
            .finally(() => setStLoading(false))
    }

    const onClickLogout = () => {
        facebookService.logout()
            .then(() => {
                window.FB.logout()
                RouteUtils.redirectWithoutReload(props, NavigationPath.goSocial.PATH_GOSOCIAL_INTRO)
            })
    }

    return <>
        <GSContentContainer className="fb-page-configuration" isLoading={stLoading} isSaving={stSaving}>
            {/*CONNECTING PAGE*/}
            {stMainPage === PAGE_ENUM.CONNECTING &&
                <GSContentBody size={GSContentBody.size.MAX} className="d-flex flex-column justify-content-center align-items-center h-100 gs-ani__fade-in">
                    <img src="/assets/images/connecting-fb-page.png" alt="connecting" style={{width: '80%'}}/>
                    <h4 className="mt-5 gsa--glow-effect" style={{color: '#4051B6'}}>
                        <GSTrans t="page.livechat.config.pleaseWait"/>
                    </h4>
                    <p>
                        <GSTrans t="page.livechat.config.connectingToGoChat"/>
                    </p>
                </GSContentBody>
            }

            {/*CONFIG PAGE*/}
                <GSContentBody className={stMainPage !== PAGE_ENUM.CONNECTING ? 'd-flex h-100' : 'd-none'} size={GSContentBody.size.LARGE}>
                    {/*PAGE LIST*/}
                    <section className='fb-page-configuration__page-list-section'>
                        {stMainPage === PAGE_ENUM.CONNECTED_LIST &&
                        <ConnectedPageList onSwitchPage={onTogglePage}

                        />
                        }
                        <UnconnectedPageList className={stMainPage !== PAGE_ENUM.UNCONNECTED_LIST ? 'd-none' : ''} onSwitchPage={onTogglePage}/>
                    </section>
                    {/*ACCOUNT*/}
                    <section className='fb-page-configuration__account-section pl-3'>
                        <GSWidget className="p-3" style={{
                            marginTop: stMainPage === PAGE_ENUM.CONNECTED_LIST ? '3.7rem' : '6.1rem'
                        }}>
                            <img src={stFbAuth.fbAvatar || '/assets/images/avatar-supplier.svg'} width="112" style={{borderRadius: '50%',margin: '0 auto',display: 'block'}} alt="avatar"/>
                            <div className="text-center mt-3 color-gray">
                            <span>
                                <GSTrans t="page.learning.welcomePage.hello"/>
                            </span>
                            </div>
                            <div className="text-center" style={{
                                fontSize: '1.5rem'
                            }}>
                                <h3 className="mb-0">{stFbAuth.fbName}</h3>
                            </div>
                        </GSWidget>
                        <GSButton primary outline className="mt-3 w-100" onClick={onClickLogout}>
                            <GSTrans t="common.txt.alert.modal.logout"/>
                        </GSButton>
                    </section>
                </GSContentBody>

                <GSLearnMoreFooter text={i18next.t('page.livechat.config.learnMore')}
                                   linkTo={LEARN_MORE_URL}
                                   className="align-self-center"
                                   marginBottom
                />
        </GSContentContainer>
    </>
}

const ConnectedPageList = (props) => {
    const stConnectedPageList = useRecoilValue(FbPageConfigurationRecoil.fbSavedPageConnectedListState)
    const [stSelected, setStSelected] = useState([]);
    const [stSaving, setStSaving] = useRecoilState(FbPageConfigurationRecoil.savingState)
    const [stPageList, setStPageList] = useRecoilState(FbPageConfigurationRecoil.fbSavedPageListState)
    const [stMainPage, setStMainPage] = useRecoilState(FbPageConfigurationRecoil.mainPageState);


    // reset checkbox if page list changed
    useEffect(() => {
        setStSelected([])
    }, [stPageList])


    const onCheckedAll = (e) => {
        const checked = e.currentTarget.checked
        if (checked) {
            const resultSet = stConnectedPageList.map(page => page.pageId)
            setStSelected(resultSet)
        } else {
            setStSelected([])
        }
    }

    const onCheckedChange = (e, pageId) => {
        const checked = e.currentTarget.checked
        const resultSet = new Set(stSelected)
        if (checked) {
            resultSet.add(pageId)
        } else {
            resultSet.delete(pageId)
        }
        setStSelected([...resultSet])
    }

    const isChecked = (pageId) => {
        return stSelected.includes(pageId)
    }

    const handleAddPage = () => {
        if (TokenUtils.isStaff()) {
            GSToast.error("page.livechat.config.notAllow.msg", true);
            return;
        }
        props.onSwitchPage()
    }

    const onClickDisconnectPage = (e) => {
        setStSaving(true)
        facebookService.unClaimPages(stSelected)
            .then((unClaimPageList) => {
                let newPageList = _.cloneDeep(stPageList)
                for (const unclaimedPage of unClaimPageList) {
                    const id = unclaimedPage.id
                    let page = newPageList.find(p => p.id === id)
                    if (page) {
                        page.usingStatus = unclaimedPage.usingStatus
                    }
                }
                setStPageList(newPageList)
                if (newPageList.filter(p => p.usingStatus === FbPageStatus.UNCONNECTED).length === stPageList.length) {
                    setStMainPage(PAGE_ENUM.UNCONNECTED_LIST)
                }
            })
            .catch((e) => {
                console.error(e)
                GSToast.commonError()
            })
            .finally(() => setStSaving(false))
    }

    return (
        <section className=" gs-ani__fade-in">
            <GSContentHeader title={i18next.t('page.livechat.config.connectingFacebookPages')}
                rightEl={
                    <GSButton success onClick={handleAddPage} icon={<FontAwesomeIcon icon="plus" />}>
                        <GSTrans t="component.page.addNew.title"/>
                    </GSButton>
                }
            >
            </GSContentHeader>
            <GSWidget className="fb-page-configuration__page-list-container">
            <GSWidgetHeader bg={GSWidgetHeader.TYPE.GRAY}
                                title={i18next.t('page.livechat.config.listConnectedPage')}
                                rightEl={
                                    <UikCheckbox className="fb-page-configuration__page-checkbox"
                                                 onChange={onCheckedAll}
                                                 checked={stSelected.length > 0 && stSelected.length === stConnectedPageList.length}
                                                 disabled={!stConnectedPageList.length}
                                    />
                                }
                >

                </GSWidgetHeader>
                <GSWidgetContent className="gs-atm__scrollbar-1">
                    {stConnectedPageList.map(page => (
                        <PageRow page={page}
                                 key={page.pageId}
                                 onChangeChecked={(e) => onCheckedChange(e, page.pageId)}
                                 checked={isChecked(page.pageId)}
                        />
                    ))}
                    {stConnectedPageList.length === 0 &&
                        <GSWidgetEmptyContent text={i18next.t("page.livechat.config.noPageFound")}
                                                iconSrc="/assets/images/fb-page-list-empty.svg"
                                              className="h-100 background-color-white"

                        />
                    }
                </GSWidgetContent>
                <GSWidgetFooter className="d-flex justify-content-between align-items-center">
                    <span>
                        <GSTrans t="page.livechat.config.selectedPage" values={{
                            x: stSelected.length
                        }}>
                            <strong>Selected:</strong> s
                        </GSTrans>
                    </span>
                    <span>
                        <GSButton danger outline onClick={onClickDisconnectPage} disabled={!stSelected.length || TokenUtils.isStaff()}>
                            <GSTrans t="lazada.account.author.disconnect"/>
                        </GSButton>
                    </span>
                </GSWidgetFooter>
            </GSWidget>

            <PagePermissionAdjust/>
        </section>
    )
}

ConnectedPageList.propTypes = {
    onSwitchPage: PropTypes.func
}


const UnconnectedPageList = (props) => {
    const [stSelected, setStSelected] = useState([]);
    const stUnconnectedPageList = useRecoilValue(FbPageConfigurationRecoil.fbSavedPageUnconnectedListState)
    const stConnectedPageList = useRecoilValue(FbPageConfigurationRecoil.fbSavedPageConnectedListState)
    const [stMainPage, setStMainPage] = useRecoilState(FbPageConfigurationRecoil.mainPageState);
    const [stPageList, setStPageList] = useRecoilState(FbPageConfigurationRecoil.fbSavedPageListState)

    const refAlertModel = useRef(null);
    const refGSAlertModal = useRef(null);
    let history = useHistory();

    // reset checkbox if page list changed
    useEffect(() => {
        setStSelected([])
    }, [stPageList])


    const onCheckedChange = (e, pageId) => {
        const checked = e.currentTarget.checked
        const resultSet = new Set(stSelected)
        if (checked) {
            resultSet.add(pageId)
        } else {
            resultSet.delete(pageId)
        }
        setStSelected([...resultSet])
    }

    const isChecked = (pageId) => {
        return stSelected.includes(pageId)
    }

    const onCheckedAll = (e) => {
        const checked = e.currentTarget.checked
        if (checked) {
            const resultSet = stUnconnectedPageList.map(page => page.pageId)
            setStSelected(resultSet)
        } else {
            setStSelected([])
        }
    }

    const handleConfirmForceConnect = () => {
        refGSAlertModal.current.openModal({
            type: GSAlertModalType.ALERT_TYPE_SUCCESS,
            messages: i18next.t('page.livechat.confirm.forceConnect'),
            acceptCallback: () => onClickConnectPage(true),
            modalCloseBtn: i18next.t('common.btn.cancel'),
            modalAcceptBtn: i18next.t('common.btn.connect')
        })
    }

    const onClickConnectPage = (forceConnect) => {
        // validate max connected page
        if (stConnectedPageList.length + stSelected.length > 5) {
            refAlertModel.current.openModal({
                messages: i18next.t("page.livechat.config.addUpTo5Pages"),
                type: AlertModalType.ALERT_TYPE_SUCCESS,
                modalBtn: i18next.t("common.btn.alert.modal.ok")
            })
            return
        }

        // start connect
        setStMainPage(PAGE_ENUM.CONNECTING)
        facebookService.claimPages(stSelected, { forceConnect })
            .then(() => {
                setTimeout(() => {
                    GSToast.success("page.livechat.config.connectedSuccessfully", true)
                    history.push(NavigationPath.goSocial.PATH_GOSOCIAL_CONVERSATION)
                }, 2500)
            })
            .catch((e) => {
                if (e.response?.data?.errorKey === 'storeChat.connect.already') {
                    handleConfirmForceConnect()
                } else {
                    console.error(e)
                    GSToast.commonError()
                }

                setStMainPage(PAGE_ENUM.UNCONNECTED_LIST)
            })
    }

    return (
        <section className={["gs-ani__fade-in", props.className].join(' ')}>
            <AlertModal ref={refAlertModel}/>
            <GSAlertModal ref={ refGSAlertModal }/>
            <GSContentHeader title={i18next.t('page.livechat.config.connectingFacebookPages')}
                             subTitle={i18next.t('page.livechat.config.selectToConnectToGoChat')}
                             backLinkText={i18next.t('page.livechat.config.backToConnect')}
                             backLinkOnClick={props.onSwitchPage}
                             subTitleStyle={{
                                 marginTop: '0'
                             }}
            >
            </GSContentHeader>
            <GSWidget className="fb-page-configuration__page-list-container">
                <GSWidgetHeader bg={GSWidgetHeader.TYPE.GRAY}
                                title={i18next.t('page.livechat.config.listUnconnectedPage')}
                                rightEl={
                                    <UikCheckbox className="fb-page-configuration__page-checkbox"
                                                 onChange={onCheckedAll}
                                                 checked={stSelected.length > 0 && stSelected.length === stUnconnectedPageList.length}
                                                 disabled={!stUnconnectedPageList.length}
                                    />
                                }
                >

                </GSWidgetHeader>
                <GSWidgetContent className="gs-atm__scrollbar-1">
                    {stUnconnectedPageList.map((page, index) => (
                        <PageRow page={page}
                                 key={page.pageId + index}
                                 onChangeChecked={(e) => onCheckedChange(e, page.pageId)}
                                 checked={isChecked(page.pageId)}
                        />
                    ))}
                    {stUnconnectedPageList.length === 0 &&
                    <GSWidgetEmptyContent text={i18next.t("page.livechat.config.noPageFound")}
                                          iconSrc="/assets/images/fb-page-list-empty.svg"
                                          className="h-100 background-color-white"

                    />
                    }
                </GSWidgetContent>
                <GSWidgetFooter className="d-flex justify-content-between align-items-center">
                    <span>
                        <GSTrans t="page.livechat.config.selectedPage" values={{
                            x: stSelected.length
                        }}>
                            <strong>Selected:</strong> s
                        </GSTrans>
                    </span>
                    <span>
                        <GSButton primary onClick={() => onClickConnectPage()} disabled={!stSelected.length || TokenUtils.isStaff()}>
                            <GSTrans t="page.livechat.config.btn.connect"/>
                        </GSButton>
                    </span>
                </GSWidgetFooter>
            </GSWidget>

            <PagePermissionAdjust/>
        </section>
    )
}


UnconnectedPageList.propTypes = {
    onSwitchPage: PropTypes.func,
    pageList: PropTypes.array,
}

const PageRow = (props) => {

    const {page, ...rest} = props
    return (
        <div key={page.pageId} className="fb-page-configuration__page-row d-flex align-items-center mb-3 pb-3" style={{
            borderBottom: '1px solid #E2E2E2'
        }}>
            <img width="50" style={{borderRadius: '50%', marginRight: '.5rem'}} src={page.avatar} alt="page"/>
            <div className="mr-auto">
                <strong>{page.pageName}</strong>
                <br/>
                <span>
                    {page.usingStatus === FbPageStatus.APPROVE &&
                    <span style={{color: '#7ab24a'}}><GSTrans t="page.livechat.config.connected"  /></span>
                    }
                    {page.usingStatus === FbPageStatus.UNCONNECTED &&
                    <span style={{color: '#686A6E'}}> <GSTrans t="page.livechat.config.disconnected"/> </span>
                    }
                </span>
            </div>
            <UikCheckbox className="fb-page-configuration__page-checkbox" checked={props.checked} onChange={props.onChangeChecked}/>
        </div>
    )
}

PageRow.propTypes = {
    checked: PropTypes.bool,
    page: PropTypes.object,
    onChangeChecked: PropTypes.func,
}

const PagePermissionAdjust = (props) => {
    const [stPageList, setStPageList] = useRecoilState(FbPageConfigurationRecoil.fbSavedPageListState)
    const stConnectedPageList = useRecoilValue(FbPageConfigurationRecoil.fbSavedPageConnectedListState)
    const [stFbAuth, setStFbAuth] = useRecoilState(FbPageConfigurationRecoil.fbUserState)
    const [stMainPage, setStMainPage] = useRecoilState(FbPageConfigurationRecoil.mainPageState);
    const [stSaving, setStSaving] = useRecoilState(FbPageConfigurationRecoil.savingState)

    const adjustPermission = () => {
        window.FB.login((response) => {
            if (response.status === 'connected') {
                const token = response.authResponse.accessToken
                const userID = response.authResponse.userID
                obtainsFacebookPages(token, userID)
            }
        }, {
            scope: PERMISSION_SCOPE_REQUEST,
            auth_type: 'rerequest'
        })
    }

    const obtainsFacebookPages = (accessToken, fbUserId) => {
        setStSaving(true)
        facebookService.addPageToConnectionList(accessToken, fbUserId)
            .then(() => facebookService.getStoreConfig())
            .then(storeConfig => {
                CredentialUtils.setFbChatLogin(storeConfig)

                if (!storeConfig?.isLogged) {
                    return Promise.reject()
                }

                resetPageList()
            })
            .finally(() => {
                setStSaving(false)
            })
    }

    const resetPageList = () => {
        facebookService.getSavedPageList()
            .then(pageList => {
                if (pageList.filter(p => p.usingStatus === FbPageStatus.UNCONNECTED).length === stPageList.length) {
                    setStMainPage(PAGE_ENUM.UNCONNECTED_LIST)
                }
                setStPageList(pageList)
            })
            .finally(() => {
                setStSaving(false)
            })
    }

    return (
        <div className="d-flex align-items-center align-self-center" style={{
            margin: '1rem auto',
            width: 'fit-content'
        }}>
            <img src="/assets/images/fb-config.svg" alt="fb-config"/>
            <div className="ml-3">
                <GSTrans t="page.livechat.config.addUpToCustom" values={{
                    x: stConnectedPageList.length,
                    total: 5
                }}>
                    You can add up to <strong>0</strong>
                </GSTrans>
                <br/>
                <GSFakeLink onClick={adjustPermission}>
                    <GSTrans t="page.livechat.config.addPageOrChangePermission">
                    </GSTrans>
                </GSFakeLink>
            </div>
        </div>
    )
}

PagePermissionAdjust.propTypes = {
}

FbPageConfiguration.defaultProps = {

}

FbPageConfiguration.propTypes = {

}

export default FbPageConfiguration
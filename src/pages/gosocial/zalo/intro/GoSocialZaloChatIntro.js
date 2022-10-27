import './GoSocialZaloChatIntro.sass'
import React, {useEffect, useRef, useState, useLayoutEffect} from 'react'
import GSContentContainer from '../../../../components/layout/contentContainer/GSContentContainer'
import GSLearnMoreFooter from '../../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter'
import GSContentBody from '../../../../components/layout/contentBody/GSContentBody'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import i18next from 'i18next'
import GSImg from '../../../../components/shared/GSImg/GSImg'
import zaloService from '../../../../services/ZaloService'
import {RouteUtils} from '../../../../utils/route'
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation'
import {CredentialUtils} from '../../../../utils/credential'
import {NavigationPath} from "../../../../config/NavigationPath";
import {GSToast} from "../../../../utils/gs-toast";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import {AgencyService} from '../../../../services/AgencyService'

const GoSocialZaloChatIntro = props => {
    const [stIsProcessing, setStIsProcessing] = useState(false);
    const refAlertModal = useRef(null);
    const refConfirmModal = useRef(null);


    useLayoutEffect(() => {
        setStIsProcessing(true)

        const isExistGoSocial = CredentialUtils.getIsExistGoSocial()

        if (isExistGoSocial) {
            zaloService.getStoreChatConfig()
                .then(store => {
                    if (store.status === 'CONNECTED') {
                        const {oaId, accessToken} = store

                        CredentialUtils.setZaloPageId(oaId)
                        CredentialUtils.setZaloPageAccessToken(accessToken)

                        RouteUtils.redirectWithoutReload(props, NAV_PATH.goSocial.PATH_GOSOCIAL_ZALO_CHAT_CONVERSATION)
                    } else {
                        if (refAlertModal.current) {
                            refAlertModal.current.openModal({
                                messages: i18next.t('page.gosocial.zalo.tokenExpired'),
                                type: AlertModalType.ALERT_TYPE_SUCCESS,
                                modalBtn: 'Ok',
                                closeCallback: () => {
                                    onClickConnect()
                                }
                            })
                        }

                    }
                })
                .finally(() => setStIsProcessing(false))
        } else {
            setStIsProcessing(false)
        }
    }, [])

    const onClickConnect = () => {
        zaloService.requestPermission()
            .then(result => {
                // redirect to conversations
                RouteUtils.redirectWithoutReload(props, NavigationPath.goSocial.PATH_GOSOCIAL_ZALO_CHAT_CONVERSATION)
            })
            .catch((e) => {
                if (e.response?.data?.detail === 'oa.belong.another.store' || e.response?.data === 'oa.belong.another.store'  ) {
                    refConfirmModal.current.openModal({
                        messages: i18next.t("page.gosocial.zalo.conflictStoreConfirmRemove"),
                        okCallback: () => { // disconnect zalo account with previously connected account
                            zaloService.clearAccessToken(e.oaId)
                                .then(() => {
                                    // re-redeem
                                    return zaloService.redeemAccessToken(e.code, e.oaId)
                                })
                                .then(() => {
                                    // redirect to conversations
                                    RouteUtils.redirectWithoutReload(props, NavigationPath.goSocial.PATH_GOSOCIAL_ZALO_CHAT_CONVERSATION)
                                })
                                .catch(() => {
                                    GSToast.commonError()
                                })
                        }
                    })
                } else {
                    GSToast.commonError()
                }
            })
    }

    return (
        <>
            <AlertModal ref={refAlertModal}/>
            <ConfirmModal ref={refConfirmModal}/>
            <GSContentContainer className="go-social-zalo-chat-intro" isLoading={stIsProcessing}>

                <GSContentBody size={GSContentBody.size.LARGE} className="notification-intro__body">
                    <div className="row mb-4">
                        <div className="col-12 col-md-6 notification-intro__left-col">
                            <div className="notification-intro__title">
                                <GSTrans t='page.gosocial.zalo.intro.header' values={{xxx:CredentialUtils.textStoreXxxOrGo()}}/>
                            </div>
                            <div className="notification-intro__description">
                                <GSTrans t="page.gosocial.zalo.intro.message" values={{xxx:CredentialUtils.textStoreXxxOrGo()}}/>
                            </div>
                            <div className="text">
                                <div className="icon-circle"></div>
                                <p>{i18next.t("page.gosocial.zalo.intro.content1",{provider:AgencyService.getDashboardName()})}</p>
                            </div>
                            <div className="text">
                                <div className="icon-circle"></div>
                                <p>{i18next.t("page.gosocial.zalo.intro.content2")}</p>
                            </div>
                            <div className="text">
                                <div className="icon-circle"></div>
                                <p>{i18next.t("page.gosocial.zalo.intro.content3")}</p>
                            </div>
                            <div className="text">
                                <div className="icon-circle"></div>
                                <p>{i18next.t("page.gosocial.zalo.intro.content4")}</p>
                            </div>
                            <div className="text">
                                <div className="icon-circle"></div>
                                <p>{i18next.t("page.gosocial.zalo.intro.content5")}</p>
                            </div>
                            <div className='btn-connect' onClick={onClickConnect}>
                                <GSImg src='/assets/images/gosocial/zalo.svg'/>
                                <span className='ml-3'><GSTrans t='page.gosocial.zalo.intro.connect'/></span>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 notification-intro__right-col">
                            <GSImg src='/assets/images/gosocial/zalo_background.svg' className='notification-intro__background' alt='background'/>
                        </div>
                    </div>
                </GSContentBody>

                <GSLearnMoreFooter text={i18next.t("title.[/gosocial/zalo/intro]",{xxx:CredentialUtils.textStoreXxxOrGo()})}
                                   linkTo={'https://huongdan.gosell.vn/faq_category/gochat-goweb/'}
                                   marginTop marginBottom/>
            </GSContentContainer>
        </>

    );
};

GoSocialZaloChatIntro.propTypes = {};

export default GoSocialZaloChatIntro;

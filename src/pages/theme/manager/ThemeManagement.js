import './ThemeManagement.sass';

import React, {useEffect, useRef, useState} from 'react';
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import i18next from "i18next";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {Col, Row} from "reactstrap";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSImg from "../../../components/shared/GSImg/GSImg";
import GSDropDownButton, {GSDropdownItem} from "../../../components/shared/GSButton/DropDown/GSDropdownButton";
import {ThemeEngineService} from "../../../services/ThemeEngineService";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {generatePath, withRouter} from "react-router-dom";
import {AlertInlineType} from "../../../components/shared/AlertInline/AlertInline";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import AlertModal from "../../../components/shared/AlertModal/AlertModal";
import Constants from "../../../config/Constant";
import {TokenUtils} from "../../../utils/token";
import storageService from '../../../services/storage';
import beehiveService from '../../../services/BeehiveService';
import {GSToast} from "../../../utils/gs-toast";
import GSAlertModal, {GSAlertModalType} from '../../../components/shared/GSAlertModal/GSAlertModal';
import ThemeEngineConstants from "../theme-making/ThemeEngineConstants";
import {RouteUtils} from "../../../utils/route";
import {AgencyService} from "../../../services/AgencyService";
import HintPopupVideo from "../../../components/shared/HintPopupVideo/HintPopupVideo";
import {CredentialUtils} from "../../../utils/credential";

const ThemeManagement = (props) => {
    const [stIsFetching, setStIsFetching] = useState(true)
    const [stActiveTheme, setStActiveTheme] = useState(null)
    const [stStoreThemes, setStStoreThemes] = useState([])

    const refConfirmModal = useRef(null)
    const refDeleteModal = useRef(null)
    const refAlertModal = useRef(null)

    useEffect(() => {
        ThemeEngineService.getStoreThemesByStoreId()
            .then(storeThemes => {
                if (storeThemes.length) {
                    return storeThemes
                }

                //apply default theme for new store
                return ThemeEngineService.cloneFromMasterThemeById(Constants.DEFAULT_MASTER_THEME_ID)
                    .then(() => {
                        return ThemeEngineService.getStoreThemesByStoreId()
                    })
            })
            .then((storeThemes) => {
                const activeThemeIndex = storeThemes.findIndex(theme => theme.published)

                if (activeThemeIndex !== -1) {
                    setStActiveTheme(storeThemes[activeThemeIndex])
                    storeThemes.splice(activeThemeIndex, 1)
                }

                const sortedStoreThemes = _.orderBy(storeThemes, 'lastModifiedDate', 'desc')

                setStStoreThemes(sortedStoreThemes)
            })
            .catch(() => {
                GSToast.commonError()
            })
            .finally(() => {
                setStIsFetching(false)
            })
    }, [])

    const handlePublish = (id) => {
        refConfirmModal.current.openModal({
            messages: i18next.t('page.themeEngine.management.button.publish.hint'),
            okCallback: () => {
                ThemeEngineService.publishStoreTheme(id)
                    .then(() => {
                        refAlertModal.current.openModal({
                            type: AlertInlineType.SUCCESS,
                            messages: i18next.t('page.themeEngine.management.publish.success'),
                            closeCallback: () => {
                                RouteUtils.redirectWithoutReload(props, NAV_PATH.themeEngine.management)
                            }
                        })
                        beehiveService.buildWebSsr(storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID));
                    })
                    .catch(() => {
                        refAlertModal.current.openModal({
                            type: AlertInlineType.ERROR,
                            messages: i18next.t('page.themeEngine.management.publish.failed'),
                        })
                    })
                CredentialUtils.setThemeEngine(true);
                storageService.removeLocalStorage("themePublished");
                storageService.removeLocalStorage("useNewThemeMenu");
            }
        })
    }

    const handleCustomize = (id) => {
        window.open(generatePath(NAV_PATH.themeEngine.making, {
            themeId: id,
            themeType: ThemeEngineConstants.THEME_TYPE.STORE
        }), '_blank')
    }

    const handleRemove = (id) => {
        refDeleteModal.current.openModal({
            messages: i18next.t('page.themeEngine.management.button.remove.hint'),
            modalTitle: i18next.t('page.themeEngine.management.button.remove.title'),
            modalAcceptBtn: i18next.t('common.btn.delete'),
            modalCloseBtn: i18next.t('common.btn.cancel'),
            type: GSAlertModalType.ALERT_TYPE_DANGER,
            acceptCallback: () => {
                ThemeEngineService.removeStoreTheme(id)
                    .then(() => {
                        refAlertModal.current.openModal({
                            type: AlertInlineType.SUCCESS,
                            messages: i18next.t('page.themeEngine.management.remove.success'),
                            closeCallback: () => {
                                RouteUtils.redirectWithoutReload(props, NAV_PATH.themeEngine.management)
                            }
                        })
                    })
                    .catch(() => {
                        refAlertModal.current.openModal({
                            type: AlertInlineType.ERROR,
                            messages: i18next.t('page.themeEngine.management.remove.failed'),
                        })
                    })
            },
            closeCallback: () => {}
        })
    }

    const handleVisit = () => {
        props.history.push(NAV_PATH.themeEngine.library)
    }

    const emptyActiveTheme = stActiveTheme === null;
    const hasAtLeastOneThemeInStore = emptyActiveTheme && stStoreThemes.length === 1;

    return (
        <>
            <AlertModal ref={refAlertModal}/>
            <ConfirmModal ref={refConfirmModal}/>
            <GSAlertModal ref={refDeleteModal}/>
            <GSContentContainer className="theme-management" isLoading={stIsFetching}>
                <GSContentHeader title={i18next.t("page.themeEngine.management.title")} size={GSContentBody.size.MAX}
                                 className='theme-management__title'>
                    <HintPopupVideo title={'Themes'} category={'THEME_MANAGERMENT'}/>

                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX}>
                    <Row>
                        <Col md={2} className='p-0 font-weight-bold align-items-center'>
                            <div className='theme-management-section__title'>
                                <GSTrans t={"page.themeEngine.management.activeTheme.title"}/>
                            </div>
                        </Col>
                        <Col md={10} className='p-0 theme-management-section__container d-flex flex-column'>
                            <div className='theme-management-section__header'>
                                <span className='font-weight-bold'>{emptyActiveTheme ? "" : stActiveTheme.customName || stActiveTheme.masterTheme.name}</span>
                                <GSButton
                                    success className='ml-auto'
                                    onClick={() => handleCustomize(stActiveTheme.id)}
                                    disabled={emptyActiveTheme ? true : !TokenUtils.hasThemeEnginePermission(stActiveTheme.masterTheme.id)}
                                >
                                    <GSTrans t={"page.themeEngine.management.button.customize"}/>
                                </GSButton>
                            </div>
                            {!emptyActiveTheme &&
                            <div className='theme-management-section__body'>
                                <div className='theme-management-section__body__img'>
                                    <GSImg src={stActiveTheme.masterTheme.thumbnail} className='m-auto mw-100 mh-100'
                                           alt='active theme'/>
                                </div>
                            </div>}
                        </Col>
                    </Row>
                    <Row className='mt-4' hidden={!stStoreThemes.length}>
                        <Col md={2} className='p-0 font-weight-bold align-items-center'>
                            <div className='theme-management-section__title'>
                                <GSTrans t={"page.themeEngine.management.storefront.title"}/>
                            </div>
                        </Col>
                        <Col md={10} className='p-0 theme-management-section__container'>
                            <div className='d-flex flex-column theme-management-section__body'>
                                {stStoreThemes.map(theme => (
                                    <div key={theme.id} className='d-flex align-items-center'>
                                        {theme.customName || theme.masterTheme.name}
                                        <GSDropDownButton button={
                                            ({onClick}) => (
                                                <i className="fa fa-ellipsis-h theme-management-section__header__actions"
                                                   aria-hidden="true" onClick={onClick}></i>
                                            )
                                        } className='ml-auto'>
                                            <GSDropdownItem className='pl-4 pr-4'
                                                            onClick={() => handlePublish(theme.id)}>
                                                <GSTrans t={"page.themeEngine.management.button.publish"}/>
                                            </GSDropdownItem>
                                            <GSDropdownItem
                                                className='pl-4 pr-4'
                                                onClick={() => handleCustomize(theme.id)}
                                                disabled={!TokenUtils.hasThemeEnginePermission() && stActiveTheme}
                                            >
                                                <GSTrans t={"page.themeEngine.management.button.customize"}/>
                                            </GSDropdownItem>
                                            <GSDropdownItem className='pl-4 pr-4'
                                                            onClick={() => handleRemove(theme.id)}
                                                            disabled={hasAtLeastOneThemeInStore}>
                                                <GSTrans t={"page.themeEngine.management.button.remove"}/>
                                            </GSDropdownItem>
                                        </GSDropDownButton>
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>
                    <Row className='mt-4'>
                        <Col md={2} className='p-0 font-weight-bold align-items-center'>
                            <div className='theme-management-section__title'>
                                <GSTrans t={"page.themeEngine.management.library.title"}/>
                            </div>
                        </Col>
                        <Col md={10} className='p-0 theme-management-section__container'>
                            <div className='d-flex theme-management-section__body align-items-center'>
                                <span><GSTrans t='page.themeEngine.management.library.content'
                                    values={{provider: AgencyService.getDashboardName()}}
                                /></span>
                                <GSButton className="btn-create ml-auto" success onClick={handleVisit}>
                                    <GSTrans t={"page.themeEngine.management.button.visit"}/>
                                </GSButton>
                            </div>
                        </Col>
                    </Row>
                    <div className='reserve-bottom'></div>
                </GSContentBody>
            </GSContentContainer>
        </>
    )
}

export default withRouter(ThemeManagement)

import React, {useEffect, useState} from 'react';
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import GSTrans from "../GSTrans/GSTrans";
import GSImg from "../GSImg/GSImg";
import GSButton from "../GSButton/GSButton";
import {TokenUtils} from "../../../utils/token";
import Constants from "../../../config/Constant";
import storageService from "../../../services/storage";
import storeService from "../../../services/StoreService";
import {AgencyService} from "../../../services/AgencyService";
import {NavigationPath} from "../../../config/NavigationPath";
import {RouteUtils} from '../../../utils/route'

const TurnOffGoFreeModal = props => {
    const [stModalTurnOfGoFree, setStModalTurnOfGoFree] = useState(false);
    const [stIconCloseModal, setStIconCloseModal] = useState(false);
    const [stCurPath, setStCurPath] = useState(undefined);
    const EXCLUDE_PREFIX_PATH_FOR_FREE_GOSELL_STORE = [...Constants.EXCLUDE_PATHS.EXCLUDE_GO_FREE_MODAL_PATHS, NavigationPath.setting.ROOT];
    const EXCLUDE_PREFIX_PATH_FOR_FREE_GOMUA_STORE = [...EXCLUDE_PREFIX_PATH_FOR_FREE_GOSELL_STORE, NavigationPath.products, NavigationPath.productCreate
        , NavigationPath.productEdit, NavigationPath.productPrintBarCode , NavigationPath.orders];
    const EXCLUDE_CONTAIN_PATH_FOR_FREE_GOMUA_STORE = [NavigationPath.variationDetail];
    const PREFIX_PATH_ALLOW_CLOSE_FOR_FREE_GOMUA_STORE = [NavigationPath.home];

    useEffect(() => {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        if (storeId !== null) {
            if (storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_DOMAIN) === null) {
                storeService.getStoreInfo(storeId).then(response => {
                    let domain = response.domain ? response.domain : "";
                    storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_DOMAIN, domain);
                    checkShowTurnOfGoFreeModal(domain);
                })
            } else {
                checkShowTurnOfGoFreeModal(storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_DOMAIN));
            }
        }
    });

    const checkShowTurnOfGoFreeModal = (domain) => {
        const curPath = window.location.pathname;
        if (TokenUtils.onlyFreePackage() && TokenUtils.hasValidPackage() && curPath !== stCurPath) {
            setStCurPath(curPath);
            if (domain === Constants.STORE_DOMAIN.GOMUA) {
                let validPath = EXCLUDE_PREFIX_PATH_FOR_FREE_GOMUA_STORE.find(x => curPath.startsWith(x));
                if (!validPath) {
                    let isValidContainPath = EXCLUDE_CONTAIN_PATH_FOR_FREE_GOMUA_STORE.find(x => curPath.indexOf(x) > -1);
                    if (!isValidContainPath) {
                        setStModalTurnOfGoFree(true);
                        sessionStorage.setItem(Constants.SHOW_MODAL_TURN_OF_GO_FREE, true);
                        setStIconCloseModal(!!PREFIX_PATH_ALLOW_CLOSE_FOR_FREE_GOMUA_STORE.find(x => curPath.startsWith(x)));
                    }
                }
            } else {
                let validPath = EXCLUDE_PREFIX_PATH_FOR_FREE_GOSELL_STORE.find(x => curPath.startsWith(x));
                if (!validPath) {
                    setStModalTurnOfGoFree(true);
                    sessionStorage.setItem(Constants.SHOW_MODAL_TURN_OF_GO_FREE, true);
                    setStIconCloseModal(false);
                }
            }
        }
    }

    const closeModalTurnOfGoFree = () => {
        setStModalTurnOfGoFree(false);
        sessionStorage.setItem(Constants.SHOW_MODAL_TURN_OF_GO_FREE, false);
        setStIconCloseModal(false);
    }

    const upgradePackage = () => {
        sessionStorage.setItem(Constants.SHOW_MODAL_TURN_OF_GO_FREE, false);
        RouteUtils.redirectWithReload(NavigationPath.settingsPlans)
    }

    return (
        <Modal isOpen={stModalTurnOfGoFree} className={"alert-modal"} centered={true} fade={false} zIndex={99999}>
            <ModalHeader className={'modal-success'}>
                <GSTrans t={'common.txt.confirm.modal.title'}/>
                {stIconCloseModal && <GSImg height={18}
                                            className="cursor--pointer float-right"
                                            src="/assets/images/icon-close.svg"
                                            onClick={closeModalTurnOfGoFree}/>}
            </ModalHeader>
            <ModalBody>
                <GSTrans t={'modal.turn.off.go.free.text'} values={{provider: AgencyService.getDashboardName()}}/>
            </ModalBody>
            <ModalFooter>
                <GSButton theme={GSButton.THEME.SUCCESS} onClick={upgradePackage}><GSTrans
                    t={'modal.turn.off.go.free.button.text'}/></GSButton>
            </ModalFooter>
        </Modal>
    )
}

export default TurnOffGoFreeModal;

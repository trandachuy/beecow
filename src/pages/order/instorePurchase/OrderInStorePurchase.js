/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useReducer, useRef, useState} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import i18next from "i18next";
import './OrderInStorePurchase.sass';
import {OrderInStorePurchaseContext} from "./context/OrderInStorePurchaseContext";
import OrderInStorePurchaseCart from "./cart/OrderInStorePurchaseCart";
import OrderInStorePurchaseSummary from "./complete/OrderInStorePurchaseComplete";
import OrderInStorePurchaseCustomer from "./customer/OrderInStorePurchaseCustomer";
import Modal from "reactstrap/es/Modal";
import ModalBody from "reactstrap/es/ModalBody";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink";
import beehiveService from "../../../services/BeehiveService";
import GSImg from "../../../components/shared/GSImg/GSImg";
import {UikSelect, UikToggle, UikTopBar, UikTopBarSection} from '../../../@uik';
import {Trans} from "react-i18next";
import {CredentialUtils} from "../../../utils/credential";
import {TokenUtils} from "../../../utils/token";
import storeService from "../../../services/StoreService";
import _ from "lodash";
import {GSToast} from "../../../utils/gs-toast";
import {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import i18n from "../../../config/i18n";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import Constants from "../../../config/Constant";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import accountService from "../../../services/AccountService";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {OrderInStorePurchaseRecoil} from "./recoil/OrderInStorePurchaseRecoil";
import OrderInStorePurchaseTabSelector from "./TabSelector/OrderInStorePurchaseTabSelector";
import {Helmet} from "react-helmet/es/Helmet";
import {AgencyService} from "../../../services/AgencyService";
import {Link, Prompt} from "react-router-dom";
import store from '../../../config/redux/ReduxStore'
import {icoGoSell} from '../../../components/shared/gsIconsPack/gssvgico'

const PLAY_STORE_DL_URL = 'https://play.google.com/store/apps/details?id=com.mediastep.gosellseller'
const APP_STORE_DL_URL = 'https://apps.apple.com/us/app/goseller/id1504792843'
const OrderInStorePurchase = props => {
    const currentOrder = useRecoilValue(OrderInStorePurchaseRecoil.currentOrderSelector)
    const orderList = useRecoilValue(OrderInStorePurchaseRecoil.orderListState)
    const updateCurrentOrderSelector = useSetRecoilState(OrderInStorePurchaseRecoil.updateCurrentOrderSelector)
    const [storeBranch, setStoreBranch] = useRecoilState(OrderInStorePurchaseRecoil.storeBranchState)
    const currentOrderIndexState = useRecoilValue(OrderInStorePurchaseRecoil.currentOrderIndexState)
    const resetOrderList = useSetRecoilState(OrderInStorePurchaseRecoil.resetSelector)
    const [loyaltySetting, setLoyaltySetting] = useRecoilState(OrderInStorePurchaseRecoil.loyaltySettingState)
    const [printerState, setPrinterState] = useRecoilState(OrderInStorePurchaseRecoil.printerState)

    const [orderState, dispatch] = useReducer(OrderInStorePurchaseContext.reducer, currentOrder? currentOrder.state: OrderInStorePurchaseContext.initState);
    const [stBranches, setStBranches] = useState([]);
    const [stFilterBranchBy, setStFilterBranchBy] = useState();
    const [stShowFilter, setStShowFilter] = useState(false);
    const [stNameStaff, setStNameStaff] = useState()

    let refStaffConfirm = useRef(null);
    let refConfirmSwitchBranch = useRef(null);
    let wrapperRef = useRef();

    const [stTitle, setStTitle] = useState(AgencyService.getDashboardName());

    // init setting
    useEffect(() => {
        beehiveService.getLoyaltyPointSettingByStore()
            .then(result => {
                const {enabled, checkouted, exchangeAmount} = result
                setLoyaltySetting({
                    enabledPoint: enabled,
                    isUsePointEnabled: enabled && checkouted,
                    exchangeAmount: exchangeAmount
                })
            })
    }, [])

    // side effect when select order
    useEffect(() => {
        if (currentOrder) {
            const {index, state} = currentOrder
            dispatch(OrderInStorePurchaseContext.actions.setState(state))
            setStTitle(resolveTitle)
        }
    }, [currentOrderIndexState]);

    useEffect(() => {
        updateCurrentOrderSelector(orderState)
    }, [orderState]);

    useEffect(() => {
        resetOrderList()
    }, [storeBranch]);



    useEffect(() => {
        fetchBranch();
        getNameStaff();
    },[])

    const resolveTitle = () => {
       return AgencyService.getDashboardName() + ' - ' + i18next.t('page.order.instorePurchase.orderTabHeader', {index: currentOrderIndexState + 1}) + ' | ' + i18next.t('page.order.list.create')
    }

    const onClickDownloadLater = () => {
        window.history.back()
    }

    const getNameStaff = () => {
        accountService.getUserById(CredentialUtils.getUserId())
            .then((result) => {
                setStNameStaff(result.displayName)
            })
            .catch(() => GSToast.commonError())
    }

    const fetchBranch = async (page, size) => {
        try {
            const result = await storeService.getActiveStoreBranches();
            if(!_.isEmpty(result)) {
                const branches = result.map((branch) => {
                    // get default working branch from local first -> unless get default branch from server
                    const localDefaultBranch = CredentialUtils.getStoreDefaultBranch()
                    if (localDefaultBranch) {
                        setStFilterBranchBy({value: parseInt(localDefaultBranch)});
                        setStoreBranch({value: parseInt(localDefaultBranch)})
                    } else {
                        if(branch.isDefault === true) {
                            setStFilterBranchBy({value: branch.id});
                            setStoreBranch({value: branch.id})
                        }
                    }
                    return {value: branch.id, label: branch.name};
                })
                //in case staff login without default branch in there
                if(!stFilterBranchBy) {
                    setStFilterBranchBy({value: branches[0].value});
                    setStoreBranch({value: branches[0].value})
                }
                setStBranches(branches);
            }
        } catch(e) {
            GSToast.commonError();
        }
    }

    const checkStaff = (branchId, fnCallback, e) => {
        storeService.checkStaffPermissionOnBranch(branchId, true)
            .then((data) => {
                if(_.isEmpty(data)) {
                    openStaffAccess();
                } else if(fnCallback) {
                    fnCallback(e);
                }
            }).catch((error) => {
            openStaffAccess();
            })
    }

    const openStaffAccess = () => {
        if(refStaffConfirm) {
            refStaffConfirm.openModal({
                type: AlertModalType.ALERT_TYPE_SUCCESS,
                title: i18n.t("page.product.modal.branch.staff.permission.title"),
                messages: i18n.t("page.product.modal.branch.staff.permission.notallow"),
                modalBtn: i18n.t("page.product.modal.branch.staff.permission.logout"),
                closeCallback: () => {
                    RouteUtils.redirectTo(NAV_PATH.logout);
                }
            });
        }
    }

    const onSwitchBranch = (e) => {
        const isShow = localStorage.getItem(Constants.UTILITY.ORDER_CONFIRM_MODAL_SWITCH_BRANCH_NOT_SHOW);
        const oneMore = stBranches && stBranches.length > 1? true: false;
        if(refConfirmSwitchBranch && Boolean(isShow) === false && oneMore) {
            refConfirmSwitchBranch.openModal({
                messageHtml: true,
                messages: <ConfirmModalContent name={e.label} handleClick={onClickDontShowItAgain} />,
                okCallback: () => {
                    dispatch(OrderInStorePurchaseContext.actions.reset());
                    dispatch(OrderInStorePurchaseContext.actions.setStoreBranch(e));
                    setStFilterBranchBy(e);
                    setStoreBranch(e)
                }
            });
        } else {
            dispatch(OrderInStorePurchaseContext.actions.reset());
            dispatch(OrderInStorePurchaseContext.actions.setStoreBranch(e));
            setStFilterBranchBy(e);
            setStoreBranch(e)
        }
    }

    const onClickDontShowItAgain = (isChecked) => {
        if(isChecked) {
            return localStorage.setItem(Constants.UTILITY.ORDER_CONFIRM_MODAL_SWITCH_BRANCH_NOT_SHOW, true);
        }
        return localStorage.removeItem(Constants.UTILITY.ORDER_CONFIRM_MODAL_SWITCH_BRANCH_NOT_SHOW, false);
    }

    const togglePrintModal = () => {
        const isOpen = !stShowFilter;
        dispatch(OrderInStorePurchaseContext.actions.showModalPrintComplete(isOpen));
    }

    const toggleOnOrOff = (e) => {
        const checked = e.target.checked
        CredentialUtils.setCheckedOrder(checked)
        setPrinterState({
            ...printerState,
            printEnabled: checked
        })
    }

    const handleSelected = (e) => {
        const selectPrint = e.value;
        CredentialUtils.setSelectOrder(selectPrint)
        setPrinterState({
            ...printerState,
            printPageSize: selectPrint
        })
    }

    const InstallAppModal = () => {
        return (
            <Modal isOpen={true} wrapClassName="d-block d-sm-block d-md-none">
                <ModalBody className="order-in-store-purchase__mobile-modal container-fluid">
                    <div className="order-in-store-purchase__container-fluid">
                        <div className="item1">
                            <h5 className="order-in-store-purchase__text--primary">
                                <GSTrans t="page.order.list.createQuotation"/>
                            </h5>
                        </div>
                        <div className="item2">
                            <img  alt="gosellapp" className="img-responsive img-rounded" style={{"height":"250px"}} src="/assets/images/gosell-app.png" />
                        </div>
                        <div className="item3">
                            <a href={PLAY_STORE_DL_URL} target="_blank" rel="noopener noreferrer">
                                <img className="img-responsive" src="/assets/images/gosell-in-chplay.svg" alt="google-play"/>
                            </a>
                            <span style={{"padding": "5px 0 5px 0"}} />
                            <a href={APP_STORE_DL_URL} target="_blank" rel="noopener noreferrer">
                                <img className="img-responsive" src="/assets/images/gosell-in-applestore.svg" alt="apple-store"/>
                            </a>
                            <span style={{"padding": "5px 0 10px 0"}} />
                            <GSFakeLink style={{"fontWeight": "bold"}} onClick={onClickDownloadLater}>
                                <GSTrans t="page.order.instorePurchase.mobileDownloadModal.downloadLater"/>
                            </GSFakeLink>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        )
    }

    const isShowConfirmOnLeave = () => {
        if (orderList.length > 1) return true // has multiple tab
        const currentOrderState = {...currentOrder.state, storeInfo: OrderInStorePurchaseContext.initState.storeInfo}
        if (!_.isEqual(currentOrderState, OrderInStorePurchaseContext.initState)) { // has change
            return true
        }
        return false
    }

    return (
        <section className="d-flex flex-column vh-100 order-instore-purchase">
            <Prompt when={isShowConfirmOnLeave()} message={i18next.t('component.product.addNew.cancelHint')}/>
            <Helmet>
                <title>{stTitle}</title>
            </Helmet>
            <OrderInStorePurchaseContext.provider value={{state: orderState, dispatch}}>

            <UikTopBar className="layout-top-bar">
                <UikTopBarSection className="section-app-name">
                    <div
                        className="layout-top-bar__title-wrapper d-desktop-exclude-tablet-flex">
                        <Link to='/'>
                            <GSImg
                                id="tutorialBtn"
                                className="cursor--pointer"
                                src={store.getState().whiteLogo || store.getState().logo || icoGoSell}
                                style={{
                                    padding: "0px 6px"
                                }}
                                height={30}

                            />
                        </Link>
                    </div>
                </UikTopBarSection>
                <OrderInStorePurchaseTabSelector/>
                <UikTopBarSection
                    className="header-right d-desktop-exclude-tablet-inline-flex flex-shrink-0" style={{
                    borderLeft: '2px solid #556CE7'
                }}>
                    <div className="header-right__ele-right">
                        {/*BRANCH*/}
                        <div className="d-flex align-items-center justify-content-start">
                            <div style={{
                                backgroundImage: `url(/assets/images/POS-location.png)`,
                                width: '1.1rem',
                                height: '1.1rem',
                                backgroundPosition: 'center',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat'
                            }}/>
                            <UikSelect
                                onChange={(e) => {
                                    const branchId = e.value;
                                    if(stBranches.length === 1) {
                                        setStFilterBranchBy(e);
                                        setStoreBranch(e)
                                        return;
                                    }
                                    if(TokenUtils.isStaff()) {
                                        return checkStaff(branchId, onSwitchBranch, e);
                                    }
                                    return onSwitchBranch(e);
                                }}
                                style={{
                                    width: '100px',
                                    marginLeft: "10px"
                                }}
                                className="pos-selector"
                                position="bottomRight"
                                value={[stFilterBranchBy]}
                                options={stBranches}
                            />
                        </div>

                        {/*ACCOUNT*/}
                        <span className="account_info">
                            <div style={{
                                backgroundImage: `url(/assets/images/POS-account.png)`,
                                width: '1.1rem',
                                height: '1.1rem',
                                backgroundPosition: 'center',
                                backgroundSize: 'contain',
                                marginRight: '.5em',
                                backgroundRepeat: 'no-repeat'
                            }}>
                            </div>
                            <span className="title_storeName">{stNameStaff ? stNameStaff : ''}</span>
                        </span>

                        <div className="print-order" ref={wrapperRef}>
                            <div className="position-relative print-order_around">
                                <div className="btn-print-order" onClick={togglePrintModal}>
                                    <span>
                                      <GSImg
                                          id="supportBtn"
                                          className="cursor--pointer"
                                          src="/assets/images/POS-setting.png"
                                          height={20}
                                          style={{
                                              marginLeft: "30px",
                                              padding: "0px 6px"
                                          }}
                                      />
                                    </span>
                                </div>

                                {stShowFilter &&
                                <>
                                    <div
                                        className="dropdown-menu dropdown-menu-right d-desktop-flex"
                                    >
                                        <GSWidgetContent>
                                            <div className="print-order_panel">
                                                <div className="print-order__receipt">
                                                    <Trans i18nKey="page.order.create.printOrder">
                                                    </Trans>
                                                    <PrivateComponent>
                                                        <UikToggle
                                                            className="print-order__toggle"
                                                            defaultChecked={printerState.printEnabled}
                                                            onChange={(e) => toggleOnOrOff(e)}
                                                        />
                                                    </PrivateComponent>

                                                </div>
                                                <div className="print-order__select">
                                                    <PrivateComponent wrapperDisplay={"block"}>
                                                        <UikSelect
                                                            onChange={e => handleSelected(e)}
                                                            className="w-100"
                                                            position="bottomRight"
                                                            defaultValue={printerState.printPageSize}
                                                            options={[
                                                                {
                                                                    value: Constants.PAGE_SIZE.K57,
                                                                    label: i18next.t("page.order.create.complete.print.size.K57")
                                                                },
                                                                {
                                                                    value: Constants.PAGE_SIZE.K80,
                                                                    label: i18next.t("page.order.create.complete.print.size.K80")
                                                                },
                                                                {
                                                                    value: Constants.PAGE_SIZE.A4,
                                                                    label: i18next.t("page.order.create.complete.print.size.A4")
                                                                }
                                                            ]}
                                                        />
                                                    </PrivateComponent>
                                                </div>

                                            </div>
                                        </GSWidgetContent>
                                    </div>
                                </>}
                            </div>
                        </div>
                    </div>
                </UikTopBarSection>
            </UikTopBar>

            <GSContentContainer className="flex-grow-1 order-in-store-purchase" isSaving={orderState.processing}  style={{background: '#F2F2F2'}}>
                <InstallAppModal/>
                    <GSContentBody size={GSContentBody.size.MAX} className="flex-grow-1">
                        <div className="row h-100" style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 30rem'
                        }}>
                            <div className="order-pos__pane order-pos__pane--left">
                                <OrderInStorePurchaseCart/>
                            </div>
                            <div className="p-0 pl-3 order-pos__pane order-pos__pane--right">
                                <OrderInStorePurchaseCustomer/>
                                <OrderInStorePurchaseSummary history={props.history}/>
                            </div>
                        </div>

                    </GSContentBody>

            </GSContentContainer>
            <ConfirmModal
                ref={(el) => {
                    refConfirmSwitchBranch = el;
                }}/>

            </OrderInStorePurchaseContext.provider>
        </section>

    );
};

const ConfirmModalContent = props => {

    const clickOnCheckbox = (e) => {
        if(props.handleClick) {
            props.handleClick(e.target.checked);
        }
    }

    return (<>
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
        }}>
            <p>{i18n.t("page.product.modal.branch.confirm.body", {name: props.name})}</p>
            <div style={{display: "inline-table"}}>
                <input
                    type="checkbox"
                    name="dontshowitagain"
                    id="dontshowitagain"
                    style={{
                        marginRight: "10px",
                        height: "20px",
                        width: "20px",
                        verticalAlign: "sub",
                        color: "var(--primary)"
                    }}
                    onClick={clickOnCheckbox}/>
                <label for="dontshowitagain">{i18n.t("page.product.modal.branch.confirm.notaskingagain")}</label>
            </div>
        </div>
    </>);
}

OrderInStorePurchase.propTypes = {

};


export default OrderInStorePurchase;

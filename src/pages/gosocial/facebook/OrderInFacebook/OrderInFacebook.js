/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useReducer, useRef, useState} from 'react';
import i18next from "i18next";
import './OrderInFacebook.sass';
import _ from "lodash";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import beehiveService from "../../../../services/BeehiveService";
import {CredentialUtils} from "../../../../utils/credential";
import storeService from "../../../../services/StoreService";
import {AgencyService} from "../../../../services/AgencyService";
import accountService from "../../../../services/AccountService";
import {GSToast} from "../../../../utils/gs-toast";
import {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import {RouteUtils} from "../../../../utils/route";
import i18n from "i18next";
import {NAV_PATH} from "../../../../components/layout/navigation/AffiliateNavigation";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import Constants from "../../../../config/Constant";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import OrderInFacebookCart from "../CartFacebook/OrderInFacebookCart";
import OrderInFacebookComplete from "../../facebook/CompleteFacebook/OrderInFacebookComplete";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {TokenUtils} from "../../../../utils/token";
import {UikCheckbox, UikSelect} from '../../../../@uik'
import FacebookInformation from "./FacebookInfo/FacebookInformation";
import {OrderInFacebookRecoil} from "../../facebook/recoil/OrderInFacebookRecoil";
import {FbMessengerContext} from "../context/FbMessengerContext";
import PropTypes from "prop-types";


const OrderInFacebook = props => {
    const updateCurrentOrderSelector = useSetRecoilState(OrderInFacebookRecoil.updateCurrentOrderSelector)
    const [storeBranch, setStoreBranch] = useRecoilState(OrderInFacebookRecoil.storeBranchState)
    const resetOrderList = useSetRecoilState(OrderInFacebookRecoil.resetSelector)

    const { state, dispatch } = useContext(FbMessengerContext.context);
    const [stBranches, setStBranches] = useState([]);
    const [stFilterBranchBy, setStFilterBranchBy] = useState();
    const [stShowOrder, setStShowOrder] = useState(false);
    const [stCustomerProfile, setStCustomerProfile] = useState(false);
    const [stCssDisplayNone, setStCssDisplayNone] = useState(true);
    const [shippingCodeSelectedId, setShippingCodeSelectedId] = useState(14);
    const [stSubTotalPrice, setStSubtotalPrice] = useState(0);

    let refStaffConfirm = useRef(null);
    let refConfirmSwitchBranch = useRef(null);
    let refOrderInFacebookComplete = useRef();

    useEffect(() => {
        updateCurrentOrderSelector(state)
    }, [state]);

    useEffect(() => {
        resetOrderList()
    }, [storeBranch]);

    useEffect(() => {
        fetchBranch();
    },[])

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
                    dispatch(FbMessengerContext.actions.resetOrder());
                    setStFilterBranchBy(e);
                    setStoreBranch(e)
                    getPinCustomerProfile()
                }
            });
        } else {
            dispatch(FbMessengerContext.actions.resetOrder());
            setStFilterBranchBy(e);
            setStoreBranch(e)
            getPinCustomerProfile()
        }
    }

    const onClickDontShowItAgain = (isChecked) => {
        if(isChecked) {
            return localStorage.setItem(Constants.UTILITY.ORDER_CONFIRM_MODAL_SWITCH_BRANCH_NOT_SHOW, true);
        }
        return localStorage.removeItem(Constants.UTILITY.ORDER_CONFIRM_MODAL_SWITCH_BRANCH_NOT_SHOW, false);
    }



   
    const showOrder = () =>{
        setStShowOrder(isShow=>!isShow)
        props.showOrder()
        setStCssDisplayNone(false)
    }
    
    const closeOrder = (isShow) =>{
        setTimeout(() => {
            setStCssDisplayNone(true)
        }, 500);
        setStShowOrder(isShow)
        props.showOrder()
        return isShow
    }
    
    
    const getPinCustomerProfile = () =>{
        setStCustomerProfile(profile=>!profile)
    }
    
    const handleCalcShippingFee  = (id = 14) => {
        setShippingCodeSelectedId(id)
    }

    const getSubTotalPrice = (value) => {
        if(!value) return
        setStSubtotalPrice(value)
    }

    return (
        <section className="d-flex flex-column h-100 order-facebook">
            <GSContentContainer className="flex-grow-1 order-in-facebook p-0" isSaving={state.processing}  style={{background: '#F2F2F2'}}>
                    <GSContentBody size={GSContentBody.size.MAX} className="flex-grow-1">
                        <div className="row h-100">
                            <div style={{display: stCssDisplayNone ? "none" : "flex" }}  className={stShowOrder ? "order-pos__pane order-pos__pane--left showOrder" : "order-pos__pane order-pos__pane--left"}>
                                <div className="header-right__ele-right">
                                    {/*BRANCH*/}
                                    <div className="d-flex align-items-center justify-content-between">
                                        <p onClick={()=>closeOrder(false)}
                                              className="font-weight-bold m-0 d-block text-capitalize cursor--pointer"
                                        style={{fontSize:"16px",color:"white"}}
                                        >
                                            &#8592; <GSTrans t="page.gochat.facebook.conversations.CreateOrder"/>
                                        </p>
                                        
                                        <div className="d-flex align-items-center">
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
                                    </div>
                                </div>
                                <OrderInFacebookCart/>
                                <OrderInFacebookComplete ref={refOrderInFacebookComplete} history={props.history} shippingCodeSelectedId={shippingCodeSelectedId} subTotalPrice={(value) => getSubTotalPrice(value)}  />
                            </div>
                            <div className={stShowOrder ? "p-0 ml-2 order-pos__pane order-pos__pane--right showOrder" : "p-0 order-pos__pane order-pos__pane--right"} 
                            style={{height:props.heightContent}}
                            >
                                <FacebookInformation
                                    showOrder = {showOrder}
                                    closeOrder = {stShowOrder}
                                    customerProfile = {stCustomerProfile}
                                    storeBranch = {storeBranch}
                                    defaultDeliveryServiceId={(e) => handleCalcShippingFee(e)}
                                    subTotalPrice={stSubTotalPrice}
                                    getTotalPrice={() => refOrderInFacebookComplete.current.getTotalPrice()}
                                />
                            </div>
                        </div>
                </GSContentBody>
            </GSContentContainer>
            <ConfirmModal
                ref={(el) => {
                    refConfirmSwitchBranch = el;
                }}/>
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

OrderInFacebook.propTypes = {
    showOrder: PropTypes.func
};


export default OrderInFacebook;

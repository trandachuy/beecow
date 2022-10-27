/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/12/2020
 * Author: Dinh Vo <dinh.vo@mediastep.com>
 *******************************************************************************/
import React, {Component,useEffect,useReducer} from 'react';
import i18next from "i18next";
import {Prompt} from 'react-router-dom'
import {UikFormInputGroup, UikInput, UikRadio, UikSelect, UikTag} from "../../../@uik";
import {Trans} from "react-i18next";
import Modal from "reactstrap/es/Modal";
import ModalBody from "reactstrap/es/ModalBody";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import {ContextQuotation} from "./context/ContextQuotation"
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import OrderInStoreQuotationCart from "./cart/OrderInStoreQuotationCart"
import "./InstoreQuotation.sass"
import SearchCustomer from './customer/SearchCustomer';
import QuotationComplete from './complete/QuotationComplete';
const PLAY_STORE_DL_URL = 'https://play.google.com/store/apps/details?id=com.mediastep.gosellseller'

const APP_STORE_DL_URL = 'https://apps.apple.com/us/app/goseller/id1504792843'

const InstoreQuotation = props => {
    const [state, dispatch] = useReducer(ContextQuotation.reducer, ContextQuotation.initState);

    const onClickDownloadLater = () => {
        window.history.back()
    }

    return (
        <GSContentContainer confirmWhen={state.productList.length!=0} confirmWhenRedirect={true} confirmMessage={i18next.t('page.order.list.unsaveQuotation')} className="quotation-in-store-purchase" isSaving={state.processing} >
            {/* <Prompt when={state.productList.length!=0} message={(location)=>`All unsaved data will be lost.`}/> */}
            <Modal isOpen={true} wrapClassName="d-block d-sm-block d-md-none wrap-mobile">
            <ModalBody className="container-fluid text-center" s>
            <div>
            <div style={{textAlign: 'right'}}><a href="/order/list"><img src="/assets/images/icon-closepop-up.png" alt="gosellapp"style={{width:'17px'}}/></a></div>
        
       
            <img  alt="gosellapp" className="img-responsive img-rounded img-fluid" src="/assets/images/Not-available.png" />
            <h6  style={{padding: '0 2rem'}}>{i18next.t('page.order.list.titleNotAvailableModile')}</h6>   
            </div>         
            </ModalBody>
        </Modal>
        <GSContentHeader title={i18next.t('page.order.list.createQuotation')}></GSContentHeader>
        <ContextQuotation.provider value={{state, dispatch}}>
            <GSContentBody size={GSContentBody.size.MAX}>
                <div className="row">
                    <div className="col-12 col-sm-12 col-md-9 p-0 quotation-in-store-purchase__pane quotation-in-store-purchase__pane--left">
                        <OrderInStoreQuotationCart />
                    </div>
                    <div className="col-12 col-sm-12 col-md-3 p-0 pl-3 quotation-in-store-purchase__pane quotation-in-store-purchase__pane--right">
                        <SearchCustomer history={props.history}/>
                        <QuotationComplete />
                    </div>
                </div>
            </GSContentBody>
        </ContextQuotation.provider>
        </GSContentContainer>
    )
}
export default InstoreQuotation;
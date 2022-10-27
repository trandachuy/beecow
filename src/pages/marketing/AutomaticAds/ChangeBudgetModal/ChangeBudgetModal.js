/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 25/07/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";

import './ChangeBudgetModal.sass'
import {Trans} from "react-i18next";
import facebookService from "../../../../services/FacebookService";
import i18next from "i18next";
import {UikButton} from '../../../../@uik'
import {GSToast} from "../../../../utils/gs-toast";
import Label from "reactstrap/es/Label";
import CryStrapInput from "../../../../components/shared/form/CryStrapInput/CryStrapInput";


class ChangeBudgetModal extends Component {

    constructor(props) {
        super(props);

        this.refDailyBudget = React.createRef();

        this.onClose = this.onClose.bind(this);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    onClose(action){

        if(action === 'cancel'){
            this.props.onClose('cancel')

        }else if(action === 'done'){

            if(this.refDailyBudget.current.isValid() == false){
                return
            }

            let request = {
                currentBudget : this.props.dailyBudget,
                dailyBudget : this.refDailyBudget.current.getValue()
            }

            facebookService.updateDailyBudget(request).then(res =>{
                if(this.props.hasCampaign){
                    GSToast.success(i18next.t('component.automatic_ads.change_budget_screen.change_success'))
                }
                this.props.onClose('done')

            }).catch(e =>{
                if(e.response.status === 400 && e.response.data && e.response.data.errorKey === 'not.enough.budget'){
                    GSToast.error(i18next.t('component.automatic_ads.change_budget_screen.not_enough_money'))
                }else{
                    GSToast.commonError()
                }
            })
        }
    }

    render() {
        return (
 
               <Modal isOpen={this.props.showChangeBudgetModal} className="change-budget__modal">
                    <ModalHeader className="change-budget__header">
                        <div className="header-title">
                            <Trans i18nKey="component.automatic_ads.change_budget_screen.change_budget">
                                Change Budget
                            </Trans>
                        </div>
                        <div className="header-sub__title">
                            <Trans i18nKey="component.automatic_ads.change_budget_screen.change_budget_text">
                                Set amount to spend daily on Automatic Ads
                            </Trans>
                        </div>
                        <i 
                            className="btn-close__icon"
                            onClick={() => this.onClose('cancel')}
                        ></i>
                    </ModalHeader>
                    <ModalBody>
                            <div className="change-budget-form__group">
                                
                                <Label for={'productPrice'} className="gs-frm-control__title">
                                    {
                                        i18next.t('component.automatic_ads.change_budget_screen.daily_budget') +
                                        ' (' +
                                            i18next.t('component.automatic_ads.change_budget_screen.min') + 
                                            ': 250,000đ - ' + 
                                            i18next.t('component.automatic_ads.change_budget_screen.max') +
                                            ': 2,000,000đ' +
                                        ')'
                                    }
                                </Label>
                                <CryStrapInput
                                    className="daily-budget__input"
                                    ref={this.refDailyBudget}
                                    name={'dailyBudget'}
                                    thousandSeparator=","
                                    precision="0"
                                    unit={'đ'}
                                    default_value={
                                        this.props.dailyBudget
                                    }
                                    min_value={250000}
                                    max_value={2000000}
                                />
                                
                            </div>

                            <div className="gs-atm__flex-row--flex-end change-budget-btn__group">
                                <button 
                                    className="btn btn-outline-secondary" 
                                    onClick={() => this.onClose('cancel')}>
                                    <Trans i18nKey="common.btn.cancel"
                                />
                                </button>
                                <UikButton 
                                    success 
                                    className={"ml-3"}
                                    onClick={() => this.onClose('done')}
                                >
                                    <Trans i18nKey="common.btn.done"/>
                                </UikButton>
                            </div>
                    </ModalBody>
            </Modal>
        );
    }
}


/**
 * onClose: callback function when modal is closed
 * editLinkPrefix: redirect link to edit page when choose product
 */
ChangeBudgetModal.propTypes = {
    onClose: PropTypes.func
};

export default ChangeBudgetModal;

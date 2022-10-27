/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import './SettingPlansPlanCard.sass'

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ImageUtils} from "../../../../utils/image";
import {Trans} from "react-i18next";
import {CurrencyUtils} from "../../../../utils/number-format";
import {UikTag} from '../../../../@uik'
import GSButton from "../../../../components/shared/GSButton/GSButton";

class SettingPlansPlanCard extends Component {

    state = {
        isShowDetail: false
    }

    constructor(props) {
        super(props);

        this.renderPlanImage = this.renderPlanImage.bind(this);
        this.showDetail = this.showDetail.bind(this);
        this.showDetailWithoutCallback = this.showDetailWithoutCallback.bind(this);
        this.renderTrial = this.renderTrial.bind(this);
        this.onClickChooseThisPlan = this.onClickChooseThisPlan.bind(this);
    }



    renderPlanImage() {
        if (this.props.cardInfo.image && this.props.cardInfo.image.imageId !== '') {
            return (
                <img className="plan-card__image" src={ImageUtils.getImageFromImageModel(this.props.cardInfo.image)} />
            )
        } else {
            switch (this.props.cardInfo.level) {
                case 1:
                    return <img className="plan-card__image" src="/assets/images/setting_plans/basic.svg" />
                case 2:
                    return <img className="plan-card__image" src="/assets/images/setting_plans/advance.svg" />
                case 3:
                    return <img className="plan-card__image" src="/assets/images/setting_plans/pro.svg" />
            }
        }
    }

    renderTrial() {
        if (this.props.trial) {
            return (
                <UikTag color="blue" fill className="trial-tag">
                    <Trans i18nKey="page.setting.plans.step1.planDetail.trial"/>
                </UikTag>
            )
        }
    }

    render() {
        return (
            <div className="setting-plans-plan-card col-4">
                <div className="">
                    <div className={"plan-card plan-card--" + this.props.cardInfo.level}>
                        <div className="plan-card__title-block">
                            <h6 className="plan-card__title">{this.props.cardInfo.name}</h6>
                            {this.renderPlanImage()}
                            {this.renderTrial()}
                        </div>

                        <div className="plan-card__pricing-block">
                            <div className="plan-card__price plan-card__price-per-month">
                                <Trans i18nKey="page.setting.plans.step1.planDetail.perMonth"/>
                                <div>
                                    <b className="plan-card__price-value">
                                        {CurrencyUtils.formatMoneyVND(this.props.cardInfo.perMonth)}
                                    </b>
                                    <b>{' / '}<Trans i18nKey="page.setting.plans.step1.planDetail.month"/> </b>
                                </div>
                            </div>
                            <div className="plan-card__price plan-card__price-per-annually">
                                <Trans i18nKey="page.setting.plans.step1.planDetail.annually"/>
                                <div>
                                    <b className="plan-card__price-value">
                                        {CurrencyUtils.formatMoneyVND(this.props.cardInfo.annuallyPerMonth)}
                                    </b>
                                    <b>{' / '}<Trans i18nKey="page.setting.plans.step1.planDetail.month"/> </b>
                                </div>
                                <b className="plan-card__price-per-year">
                                    {CurrencyUtils.formatMoneyVND(this.props.cardInfo.annuallyPerMonth * 12)}
                                    {' / '}<Trans i18nKey="page.setting.plans.step1.planDetail.year"/>
                                </b>
                            </div>
                            <div className="plan-card__price plan-card__price-per-biannually">
                                <Trans i18nKey="page.setting.plans.step1.planDetail.biannually"/>
                                <div>
                                    <b className="plan-card__price-value">
                                        {CurrencyUtils.formatMoneyVND(this.props.cardInfo.biannuallyPerMonth)}
                                    </b>
                                    <b>{' / '}<Trans i18nKey="page.setting.plans.step1.planDetail.month"/> </b>
                                </div>
                                <b className="plan-card__price-per-year">
                                    {CurrencyUtils.formatMoneyVND(this.props.cardInfo.biannuallyPerMonth * 12)}
                                    {' / '}<Trans i18nKey="page.setting.plans.step1.planDetail.year"/>
                                </b>
                                <GSButton primary className="btn-choose-this-plan"
                                onClick={this.onClickChooseThisPlan}>
                                    <Trans i18nKey="page.setting.plans.step1.planDetail.btn.chooseThisPlan"/>
                                </GSButton>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="show-detail">
                    {!this.state.isShowDetail &&
                    <div className="show-detail__btn-show-detail"
                    onClick={this.showDetail}>
                        <b>
                            <Trans i18nKey="page.setting.plans.step1.planDetail.btn.showDetail"/>
                        </b>
                    </div>}
                    {this.state.isShowDetail &&
                    <div className="show-detail__detail-table">
                        <div className="show-detail__details-container">
                            { this.props.cardInfo.details.map( (detail, index) => (
                                <div key={index} className="show-detail__detail-item-block">
                                    <div className="show-detail__group-name">
                                        {detail.groupName}
                                    </div>
                                    {detail.features.map( (features, index) => (
                                        <div key={index} className="show-detail__group-item">
                                            {features !== ''? features:
                                                (<div className="show-detail__group-item-blank">
                                                </div>)}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>}
                </div>
            </div>


        );
    }

    showDetail() {
        this.setState( {
            isShowDetail: true
        })
        if (this.props.onClickShowDetail) {
            this.props.onClickShowDetail()
        }
    }

    showDetailWithoutCallback() {
        this.setState( {
            isShowDetail: true
        })
    }

    onClickChooseThisPlan() {
        if (this.props.onClickChooseThisPlan) {
            this.props.onClickChooseThisPlan(this.props.cardInfo)
        }
    }

}

SettingPlansPlanCard.propTypes = {
    cardInfo: PropTypes.object.isRequired,
    trial: PropTypes.bool,
    onClickShowDetail: PropTypes.func,
    onClickChooseThisPlan: PropTypes.func
};

export default SettingPlansPlanCard;

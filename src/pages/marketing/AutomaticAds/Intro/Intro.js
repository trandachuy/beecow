/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/07/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import './Intro.sass'
import {Trans} from "react-i18next";
import facebookService from "../../../../services/FacebookService";
import i18next from "i18next";
import Constants from "../../../../config/Constant";
import {GSToast} from '../../../../utils/gs-toast';
import GSButton from "../../../../components/shared/GSButton/GSButton";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSLearnMoreFooter from "../../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import GSContentFooter from "../../../../components/layout/GSContentFooter/GSContentFooter";

class Intro extends Component {

    state = {
        // is processing
        isProcessing : false,

        isApproved : !this.props.isApproved
    }

    constructor(props) {
        super(props);

        this.requestUsingAutomaticAds = this.requestUsingAutomaticAds.bind(this)
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    requestUsingAutomaticAds() {
        this.setState({
            isProcessing : true
        })

        facebookService.requestToUseAutomaticAds().then(res => {
            this.setState({
                isProcessing : false,
                isApproved : true
            })
        }).catch(e =>{
            this.setState({
                isProcessing : false
            })

            GSToast.commonError();
        })
    }

    render() {
        return (
            <GSContentContainer>
                {this.state.isProcessing && <LoadingScreen />}
                <GSContentBody size={GSContentBody.size.LARGE} centerChildren>
                    <GSWidget className="automatic-ads-container__intro">
                        <GSWidgetContent className="automatic-ads">
                            <div className="automatic-ads__text">
                                <span className="title">
                                    <Trans i18nKey="component.automatic_ads.intro.f1" />
                                </span>
                                <span className="subTitle">
                                    <Trans i18nKey="component.automatic_ads.intro.f2" />
                                </span>
                                <span className="ft">
                                    <Trans i18nKey="component.automatic_ads.intro.f3" />
                                </span>
                                <span className="ft">
                                    <Trans i18nKey="component.automatic_ads.intro.f4" />
                                </span>
                                <span className="ft">
                                    <Trans i18nKey="component.automatic_ads.intro.f5" />
                                </span>
                                <span className="ft">
                                    <Trans i18nKey="component.automatic_ads.intro.f6" />
                                </span>
                                <span className="subTitle sub-footer">
                                    <Trans i18nKey="component.automatic_ads.intro.f7" />
                                </span>
                                {
                                    !this.state.isApproved &&
                                    <GSButton primary className="gs-button  gs-button__green btn-save" onClick={this.requestUsingAutomaticAds}>
                                        <Trans i18nKey="component.automatic_ads.intro.button.request"/>
                                    </GSButton>
                                }

                                {
                                    this.state.isApproved && 
                                    <span className="status-waiting"><Trans i18nKey="component.automatic_ads.intro.text.waiting_approve" /></span>
                                }
                            </div>
                            <div className="automatic-ads__banner">

                            </div>
                            
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
                <GSContentFooter>
                    <GSLearnMoreFooter
                        text={i18next.t("component.automatic_ads.intro.learn_more")}
                        linkTo={Constants.UrlRefs.LEARN_MORE_MARKETING_AUTOMATIC_ADS} />
                </GSContentFooter>
            </GSContentContainer>
        );
    }
}


export default Intro;

import React, {Component} from 'react';
import {setRegisterInfo} from "../../../config/redux/Reducers";
import {connect} from "react-redux";
import colorService from "../../../services/ColorService";
import {UikButton} from '../../../@uik';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Trans} from "react-i18next";
import i18next from "../../../config/i18n";

import StepBar from "./StepBar";
import ColorPicker from "../../../components/shared/ColorPicker/ColorPicker";
import './Step4.sass'
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {Redirect} from "react-router-dom";
import StoreModel from "../../../components/shared/model/StoreModel";
import PropTypes from "prop-types";
import WizardLayout from "./layout/WizardLayout";

class Step4 extends Component {

    currentStep = 4;

    constructor(props) {
        super(props);
        if (!this.props.store) {
            // Not have store (load from redux context), mean navigate direct to this page
            // So redirect back to step 1
            window.location.href = NAV_PATH.wizard + '/2';
        }

        this.store = this.props.store;

        this.back = this.back.bind(this);
        this.skip = this.skip.bind(this);
        this.next = this.next.bind(this);
        this.handleSelectColor = this.handleSelectColor.bind(this);

        this.state = {
            colors: [],
            colorPrimary: this.store.colorPrimary,
            colorSecondary: this.store.colorSecondary,
            nextStep: this.currentStep
        }
    }

    componentDidMount() {
        colorService.getColors({}).then(values => {
            let colors = values;
            this.setState({colors: colors});

            // Select 1st color as default
            this.colorPicker.setColor(colors[0]);
        });
    }

    handleSelectColor(selectedColor) {
        this.setState({colorPrimary: selectedColor.primary});
        this.setState({colorSecondary: selectedColor.secondary});
    }

    back(){
        // store the color
        this.store.colorPrimary = this.state.colorPrimary;
        this.store.colorSecondary = this.state.colorSecondary;

        // Change back step
        this.setState({nextStep: 3});

        // store throw all step
        this.props.dispatch(setRegisterInfo({
            store: this.store,
            warnings: this.props.warnings,
            expId: this.props.expId,
            pkgId: this.props.pkgId
        }));
    }

    skip(){
        // Change next step
        this.setState({nextStep: 5});
    }

    next(){
        // store the color
        this.store.colorPrimary = this.state.colorPrimary;
        this.store.colorSecondary = this.state.colorSecondary;

        // Change next step
        this.setState({nextStep: 5});

        // store throw all step
        this.props.dispatch(setRegisterInfo({
            store: this.store,
            warnings: this.props.warnings,
            expId: this.props.expId,
            pkgId: this.props.pkgId
        }));
    }

    render() {
        if (this.state.nextStep !== this.currentStep) {
            let path = NAV_PATH.wizard + '/' + this.state.nextStep;
            return <Redirect to={{
                pathname: path
            }}/>
        }
        return (
            <WizardLayout title={i18next.t('welcome.wizard.step4.title')}>
            <div className="step4-page__wrapper">
                <div className="step-page__container">
                    <StepBar 
                        step="4"
                        title={i18next.t('welcome.wizard.step4.title')}
                    />
                    <div className="step-page__content">
                        <div className="color-picker__group">
                            <ColorPicker 
                                ref={(el) => { this.colorPicker = el }}
                                colors={this.state.colors} size={3}
                                onChange={this.handleSelectColor}
                                value={this.state.colorPrimary}
                            />
                            <div className="color-picker__suggest">
                                <Trans i18nKey="welcome.wizard.step4.suggest">
                                    A look at how color matters in your store. It ca either help to sell your products. Choose minutely.
                                </Trans>
                            </div>
                        </div>
                        <div className="button-group">
                            <UikButton
                                className="btn btn-back"
                                transparent="true"
                                icon={(
                                    <FontAwesomeIcon
                                        className="btn-back__icon"
                                        icon="arrow-alt-circle-left"
                                    />
                                )}
                                onClick={()=>this.back()}
                            >
                                <Trans i18nKey="common.btn.back">
                                    Back
                                </Trans>
                            </UikButton>                            
                            {/*<UikButton*/}
                            {/*    className="btn btn-skip"*/}
                            {/*    transparent="true"*/}
                            {/*    onClick={()=>this.skip()}*/}
                            {/*>*/}
                            {/*    <Trans i18nKey="common.btn.skip">*/}
                            {/*        Skip*/}
                            {/*    </Trans>*/}
                            {/*</UikButton>*/}
                            <UikButton
                                className="btn btn-next"
                                iconRight
                                transparent="true"
                                icon={(
                                    <FontAwesomeIcon
                                        className="btn-next__icon"
                                        icon="arrow-alt-circle-right"
                                    />
                                )}
                                onClick={()=>this.next()}
                            >
                                <Trans i18nKey="common.btn.next">
                                    Next
                                </Trans>
                            </UikButton>
                        </div>
                    </div>
                </div>
            </div>
            </WizardLayout>
        );
    }
}

const mapRegisterInfo = (state) => {
    return {
        store: state.registerInfo.store,
        warnings: state.registerInfo.warnings,
        pkgId: state.registerInfo.pkgId,
        expId: state.registerInfo.expId
    }
};

export default connect(mapRegisterInfo)(Step4);

Step4.propTypes = {
    store: PropTypes.instanceOf(StoreModel)
};

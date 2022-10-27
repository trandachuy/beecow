import React, {Component} from 'react';
import {setRegisterInfo} from "../../../config/redux/Reducers";
import {connect} from "react-redux";
import {Redirect} from "react-router-dom";
import {UikButton} from '../../../@uik';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Trans} from "react-i18next";
import i18next from "../../../config/i18n";

import StepBar from "./StepBar";
import './Step3.sass'
import StoreModel from "../../../components/shared/model/StoreModel";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import PropTypes from "prop-types";
import WizardLayout from "./layout/WizardLayout";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";

class Step3 extends Component {

    currentStep = 3;
    MAX_FILE_SIZE_MB = 1;

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
        this.onUploaderChange = this.onUploaderChange.bind(this);
        this.onClickAddImage = this.onClickAddImage.bind(this);
        this.deleteImage = this.deleteImage.bind(this);

        this.refInputFile = React.createRef();

        this.state = {
            file: this.store.file,
            fileName: this.store.fileName,
            message: '',
            nextStep: this.currentStep
        }
    }

    back(){
        // store the file
        this.store.file = this.state.file;

        // store name file
        this.store.fileName = this.state.fileName;

        // Change back step
        this.setState({nextStep: 2});

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
        this.setState({nextStep: 4});
    }

    next(){
        // store the file
        this.store.file = this.state.file;

        // store name file
        this.store.fileName = this.state.fileName;

        // Change next step
        this.setState({nextStep: 4});

        // store throw all step
        this.props.dispatch(setRegisterInfo({
            store: this.store,
            warnings: this.props.warnings,
            expId: this.props.expId,
            pkgId: this.props.pkgId
        }));
    }

    onClickAddImage() {
        this.refInputFile.current.click(function(e){e.preventDefault();}).click();
    }

    onUploaderChange(event) {
        let file = event.target.files[0];

        // check max file size (50kb)
        if(file.size/(1024 * 1024) > this.MAX_FILE_SIZE_MB){
            event.preventDefault();
            this.setState({message: i18next.t('welcome.wizard.step3.logo.upload.validation', {maxSize: this.MAX_FILE_SIZE_MB})});
            return;

        }else{
            // file type
            let fileType = file['type'];

            // only allow jpeg or png
            let validImageTypes = ['image/jpeg', 'image/png'];

            if (!validImageTypes.includes(fileType)) {
                event.preventDefault();
                this.setState({message: i18next.t('welcome.wizard.step3.logo.upload.validation')});
                return;
            }
        }

        this.setState({
            file: URL.createObjectURL(file)
        });

        this.setState({
            fileName: file.name
        });

        this.setState({message: ''});
    }

    deleteImage(){
        this.setState({
            file: null
        });

        this.setState({
            fileName: ''
        });

        this.refInputFile.current.value = "";
    }

    render() {
        if (this.state.nextStep !== this.currentStep) {
            let path = NAV_PATH.wizard + '/' + this.state.nextStep;
            return <Redirect to={{
                pathname: path
            }}/>
        }
        return (
            <WizardLayout title={i18next.t('welcome.wizard.step3.title')}>
            <div className="step3-page__wrapper">
                <div className="step-page__container">
                    <StepBar 
                        step="3"
                        title={i18next.t('welcome.wizard.step3.title')}
                    />
                    <div className="step-page__content">
                        <div className="logo-upload">
                            <div hidden={this.state.file}>
                                <FontAwesomeIcon
                                    className="logo-upload__icon"
                                    icon="upload"
                                />
                                <input type="file"
                                    multiple={false}
                                    accept="image/png,image/jpeg"
                                    ref={this.refInputFile}
                                    onChange={(event) => this.onUploaderChange(event)}
                                />
                            </div>
                            { this.state.file &&
                            <div className="logo-preview">
                                <FontAwesomeIcon
                                    className="logo-preview__close"
                                    icon="times-circle"
                                    transparent="false"
                                    onClick={()=>this.deleteImage()}
                                />
                                <img src={this.state.file} className="logo-preview__show"/>
                            </div>
                            }
                            <div className="logo-upload__text">
                                <GSTrans t="welcome.wizard.step3.logo.upload.text" values={{maxSize: this.MAX_FILE_SIZE_MB}}>
                                    Jpeg or png format max 50kbs
                                </GSTrans>
                            </div>
                            <div className="logo-upload__error">
                                {this.state.message}
                            </div>
                            <div className="logo-upload__suggest">
                                <Trans i18nKey="welcome.wizard.step3.logo.upload.suggest" ></Trans>
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

export default connect(mapRegisterInfo)(Step3);

Step3.propTypes = {
    store: PropTypes.instanceOf(StoreModel)
};

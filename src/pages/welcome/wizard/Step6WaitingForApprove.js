import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from "prop-types";

import './Step6.sass'
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import StoreModel from "../../../components/shared/model/StoreModel";
import WizardLayout from "./layout/WizardLayout";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {RouteUtils} from "../../../utils/route";
import GSButton from "../../../components/shared/GSButton/GSButton";

class Step6 extends Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount() {

    }

    render() {
        const {name} = this.props.location.state.planObj
        return (
            <WizardLayout hideTitle>

            <div className="step6-page__wrapper ">
                <div className="step-page__container align-items-center d-flex flex-column">
                    <img 
                        src={'/assets/images/startup.svg'}
                        style={{
                            marginBottom: '2em'
                        }}
                        // width="50%"
                        // height="50%"
                    />
                    {/*<div className="congratulation">*/}
                    {/*    <Trans i18nKey="welcome.wizard.step6.title">*/}
                    {/*        Congratulation*/}
                    {/*    </Trans>*/}
                    {/*</div>*/}
                    <div className="suggest">
                        <span className="font-size-1rem">
                            <GSTrans t="page.wizard.payment.activatedPackage" values={{packageName: name}}>
                                <b className="text-uppercase" style={{
                                    fontSize: '1.2rem',
                                    color: '#556CE7'
                                }}>1</b>2
                            </GSTrans>
                        </span>

                    </div>
                    <div className="mb-2">
                        <GSTrans t="page.wizard.payment.relogin"/>
                    </div>
                    <GSButton success
                              className="w-auto"
                              onClick={() => RouteUtils.redirectWithoutReload(this.props, NAV_PATH.logout)}>
                        <GSTrans t="common.btn.reLogin"/>
                    </GSButton>
                </div>
            </div>
            </WizardLayout>

        );
    }
}

const mapRegisterInfo = (state) => {
    return {
        store: state.registerInfo.store
    }
};

export default connect(mapRegisterInfo)(Step6);

Step6.propTypes = {
    store: PropTypes.instanceOf(StoreModel)
};


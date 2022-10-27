import React, {Component} from 'react';
import {Trans} from "react-i18next";
import './StepBar.sass'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

class StepBar extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="step-bar__wrapper">
                    {
                        this.props.step == 1 ? (
                            <div className="step-title__sub">
                                <p style={{fontSize: 0.9 + 'rem', color: '#9EA0A5'}}><Trans i18nKey="login.beecow">You can
                                    use <span style={{color: '#1f1f57'}}>Beecow</span> to login</Trans></p>
                            </div>
                        ):(
                            <div className="step-progress">
                                <div className="line">
                                </div>
                                {this.props.step <= 1 ? (
                                    <div className="step step-uncheck">
                                        <span className='d-mobile-none d-desktop-block'>
                                            <Trans i18nKey="welcome.wizard.step">
                                                    Step
                                            </Trans>&nbsp;
                                        </span>1
                                    </div>
                                ) : (
                                    <div className="step step-checked">
                                        <FontAwesomeIcon
                                            className="step-checked__icon"
                                            icon="check"
                                        />
                                    </div>
                                )}
                                {this.props.step <= 2 ? (
                                    <div className="step step-uncheck">
                                        <span className='d-mobile-none d-desktop-block'>
                                            <Trans i18nKey="welcome.wizard.step">
                                                    Step
                                            </Trans>&nbsp;
                                        </span>2
                                    </div>
                                ) : (
                                    <div className="step step-checked">
                                        <FontAwesomeIcon
                                            className="step-checked__icon"
                                            icon="check"
                                        />
                                    </div>
                                )}
                                {this.props.step <= 3 ? (
                                    <div className="step step-uncheck">
                                        <span className='d-mobile-none d-desktop-block'>
                                            <Trans i18nKey="welcome.wizard.step">
                                                    Step
                                            </Trans>&nbsp;
                                        </span>3
                                    </div>
                                ) : (
                                    <div className="step step-checked">
                                        <FontAwesomeIcon
                                            className="step-checked__icon"
                                            icon="check"
                                        />
                                    </div>
                                )}
                                {this.props.step <= 4 ? (
                                    <div className="step step-uncheck">
                                        <span className='d-mobile-none d-desktop-block'>
                                            <Trans i18nKey="welcome.wizard.step">
                                                    Step
                                            </Trans>&nbsp;
                                        </span>4
                                    </div>
                                ) : (
                                    <div className="step step-checked">
                                        <FontAwesomeIcon
                                            className="step-checked__icon"
                                            icon="check"
                                        />
                                    </div>
                                )}
                            </div>
                    )}
            </div>
        );
    }
}

export default StepBar;

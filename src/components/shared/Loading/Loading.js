/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 15/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import './Loading.sass'
import PropTypes from "prop-types";
import {Trans} from "react-i18next";
import GSButton from "../GSButton/GSButton";
import GSTrans from "../GSTrans/GSTrans";

export default class Loading extends React.Component {

    constructor(props) {
        super(props);

        this.renderLoading = this.renderLoading.bind(this);
    }


    renderLoading() {
        if (!this.props.style) { // --> default
            return (
                <div className="lds-dual-ring">
                </div>
            )
        }

        switch (this.props.style) {
            case LoadingStyle.DUAL_RING:
                return (
                    <div className="lds-dual-ring">
                    </div>
                )
            case LoadingStyle.DUAL_RING_WHITE:
                return (
                    <div className="lds-dual-ring-white">
                    </div>
                )
            case LoadingStyle.DUAL_RING_GREY:
                return (
                    <div className="lds-dual-ring-grey">
                    </div>
                )
            case LoadingStyle.ELLIPSIS:
                return (
                    <div className="lds-ellipsis">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                )
            case LoadingStyle.ELLIPSIS_GREY:
                return (
                    <div className="lds-ellipsis--grey">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                )
            case LoadingStyle.RING:
                return (
                    <div className="lds-ring">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                )
            case LoadingStyle.ROLLER:
                return (
                    <div className="lds-roller">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                )
            case LoadingStyle.RIPPLE:
                return (
                    <div className="lds-ripple">
                        <div></div>
                        <div></div>
                    </div>
                )
        }
    }

    render() {
        return (
            <>
                {!this.props.retry &&
                <div className={["loading", this.props.className].join(' ')} hidden={this.props.hidden} style={{
                    ...this.props.cssStyle
                }}>
                    {this.renderLoading()}
                </div>}
                {this.props.retry &&
                    <div className="reload-wrapper">
                        <span className="reload-text">
                            <GSTrans t={"common.txt.cantLoadPage"}/>
                        </span>
                        <GSButton secondary onClick={this.props.onRetry} outline>
                            <Trans i18nKey="common.btn.retry"/>
                        </GSButton>

                    </div>}
            </>
        )
    }
}


export const LoadingStyle = {
    DUAL_RING: 'dual_ring',
    DUAL_RING_GREY: 'dual_ring_grey',
    DUAL_RING_WHITE: 'dual_ring_white',
    ELLIPSIS: 'ellipsis',
    ELLIPSIS_GREY: 'ellipsis_grey',
    RING: 'ring',
    ROLLER: 'roller',
    RIPPLE: 'ripple'
}

Loading.propTypes = {
  style: PropTypes.oneOf(Object.values(LoadingStyle)),
    retry: PropTypes.bool,
    onRetry: PropTypes.func,
    className: PropTypes.string,
    cssStyle: PropTypes.any
}

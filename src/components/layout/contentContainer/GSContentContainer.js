/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Prompt} from "react-router-dom";
import i18next from "../../../config/i18n";
import Loading, {LoadingStyle} from "../../shared/Loading/Loading";
import './ContentContainer.sass'
import LoadingScreen from "../../shared/LoadingScreen/LoadingScreen";
import {cn} from "../../../utils/class-name";
import Constants from '../../../config/Constant';
import PubSub from 'pubsub-js';

export default class GSContentContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            confirmWhen: this.props.confirmWhen,
            confirmWhenRedirect: this.props.confirmWhenRedirect
        }
    }

    componentDidUpdate(prevProp) {
        if (this.props.confirmWhen === undefined) {
          PubSub.publish(Constants.SUB_PUB_TOPIC.TOUR.PING_CREATE_PRODUCT.TOUR_PENDING, Constants.SUB_PUB_TOPIC.TOUR.PING_CREATE_PRODUCT.TOUR_PENDING);
        }
    }

    render() {
        const {className, isSaving, onRetry, confirmMessage, confirmWhen, confirmWhenRedirect,
            isLoading, isRetry, loadingStyle, minWidthFitContent, loadingZIndex,loadingClassName, ...other} = this.props
        return (
            <>
            { !this.props.isLoading ?
                <div
                    className={[
                        "content-container--fadeIn",
                        "content-container",
                        "gs-page-container-max",
                        this.props.className,
                        this.props.minWidthFitContent? 'content-container--min-width-fit-content':''
                    ].join(" ")}
                    {...other}
                >

                    {this.props.confirmWhenRedirect &&
                    <Prompt
                        when={this.props.confirmWhen}
                        message={this.props.confirmMessage ? this.props.confirmMessage : i18next.t('component.product.addNew.cancelHint')}
                    />}
                    {this.props.children}
                </div>
                :
                <div className={cn("content-container__loading-wrapper", loadingClassName)}>
                    <Loading
                        style={this.props.loadingStyle? this.props.loadingStyle:LoadingStyle.DUAL_RING_GREY}
                        className={"content-container__loading " + this.props.isLoading? '':'content-container__loading--zoom-out'}
                        retry={this.props.isRetry}
                        onRetry={this.props.onRetry}
                    >
                    </Loading>
                </div>
            }
                {this.props.isSaving && <LoadingScreen zIndex={this.props.loadingZIndex}/>}
            </>
        )
    }
}

GSContentContainer.defaultProps = {
    loadingClassName: ''
}

/*
To show confirm popup when redirect add 'confirmWhenRedirect' to attribute
Popup will show if confirmWhen is 'true'
confirmMessage: if not set, it will be default
*/
GSContentContainer.propTypes = {
  confirmWhenRedirect: PropTypes.bool,
    confirmWhen: PropTypes.bool,
    confirmMessage: PropTypes.string,
    className: PropTypes.string,
    isLoading: PropTypes.bool,
    loadingStyle: PropTypes.oneOf(Object.values(LoadingStyle)),
    isSaving: PropTypes.bool,
    isRetry: PropTypes.bool,
    onRetry: PropTypes.func,
    minWidthFitContent: PropTypes.bool,
    loadingZIndex: PropTypes.number,
    loadingClassName: PropTypes.string,
}

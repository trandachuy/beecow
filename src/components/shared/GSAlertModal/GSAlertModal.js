import React, {Component} from 'react';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import PropTypes from 'prop-types';
import i18next from "../../../config/i18n";
import _ from 'lodash';
import "./GSAlertModal.sass"
import GSButton from "../GSButton/GSButton";

class GSAlertModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            modalTitle: props.modalTitle ? props.modalTitle : i18next.t('common.txt.alert.modal.title'),
            modalCloseBtn: props.btnCloseText? props.btnCloseText:i18next.t('common.btn.alert.modal.close'),
            modalAcceptBtn: props.btnAcceptText? props.btnAcceptText:i18next.t('common.btn.delete')
        };

        this.closeModal = this.closeModal.bind(this);
        this.acceptModal = this.acceptModal.bind(this);
    }

    isOpen(){
        return this.state.open;
    }

    openModal(options) {
        /* options JSON structure
        {
            type: AlertModalType,
            messages: string,
            closeCallback: function,
            acceptCallback: function,
            title: string | default,
            modalCloseBtn: string | default,
            modalAcceptBtn: string | default
        }
         */

        let classNameHeader = '';
        let classNameBtn = '';
        let classNameCloseBtn = '';
        switch (options.type) {
            case GSAlertModalType.ALERT_TYPE_DANGER:
                classNameHeader = 'modal-danger';
                classNameBtn = GSButton.THEME.DANGER;
                classNameCloseBtn = GSButton.THEME.DANGER;
                break;
            case GSAlertModalType.ALERT_TYPE_WARNING:
                classNameHeader = 'modal-warning';
                classNameBtn = GSButton.THEME.WARN;
                classNameCloseBtn = GSButton.THEME.WARN;
                break;
            case GSAlertModalType.ALERT_TYPE_SUCCESS:
                classNameHeader = 'modal-success';
                classNameBtn = GSButton.THEME.SUCCESS;
                classNameCloseBtn = GSButton.THEME.SUCCESS;
                break;
            case GSAlertModalType.ALERT_TYPE_OK:
                classNameHeader = 'modal-success';
                classNameBtn = GSButton.THEME.SUCCESS;
                classNameCloseBtn = GSButton.THEME.SUCCESS;

                break;
            case GSAlertModalType.OK:
                classNameHeader = 'modal-success';
                classNameBtn = GSButton.THEME.SUCCESS;
                classNameCloseBtn = GSButton.THEME.SUCCESS;

                break;
            case GSAlertModalType.ALERT_TYPE_INFO:
                classNameHeader = 'modal-info';
                classNameBtn = GSButton.THEME.INFO;
                classNameCloseBtn = GSButton.THEME.INFO;

                break;
            default:
                classNameHeader = 'modal-info';
                classNameBtn = GSButton.THEME.INFO;
                classNameCloseBtn = GSButton.THEME.INFO;
        }

        this.setState(_.extend({
            modal: true,
        }, options, {
            classNameHeader: classNameHeader,
            classNameBtn: classNameBtn,
            classNameCloseBtn: classNameCloseBtn,
        }));
    }

    closeModal() {
        this.setState({
            modal: false
        },
        () => {
            if (this.state.closeCallback) {
                this.state.closeCallback()
            }
        });

    }

    acceptModal() {
        this.setState({
            modal: false
        },
        () => {
            if (this.state.acceptCallback) {
                this.state.acceptCallback()
            }
        });

    }

    render() {
        return (
            <div>
                <Modal isOpen={this.state.modal} className={"alert-modal"} centered={true} fade={false} {...this.props} data-sherpherd="tour-guide-alert-modal">
                    <ModalHeader className={this.state.classNameHeader}>{this.state.modalTitle}</ModalHeader>
                    <ModalBody>
                        {this.state.messages}
                    </ModalBody>
                    <ModalFooter>
                        <GSButton marginRight outline theme={this.state.classNameCloseBtn} onClick={this.closeModal} data-sherpherd="tour-guide-alert-button-close">{this.state.modalCloseBtn}</GSButton>
                        <GSButton marginLeft theme={this.state.classNameBtn} onClick={this.acceptModal} data-sherpherd="tour-guide-alert-button-close">{this.state.modalAcceptBtn}</GSButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export const createAlertModalOption = (message, type = GSAlertModalType.ALERT_TYPE_SUCCESS, closeCallBack = null, acceptCallback = null) => {
    return {
        messages: message,
        closeCallback: closeCallBack,
        acceptCallback: acceptCallback,
        type: type
    }
}


export const GSAlertModalType = {
    ALERT_TYPE_DANGER: 'danger',
    ALERT_TYPE_WARNING: 'warning',
    ALERT_TYPE_SUCCESS: 'success',
    ALERT_TYPE_INFO: 'info',
    ALERT_TYPE_OK: 'ok',
    OK: 'ok_only'
}

export default GSAlertModal;

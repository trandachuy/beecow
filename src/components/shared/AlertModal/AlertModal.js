import React, { Component } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import i18next from "../../../config/i18n";
import _ from "lodash";
import "./AlertModal.sass";
import GSButton from "../GSButton/GSButton";

class AlertModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            showCloseHeaderButton: false,
            modalTitle: props.modalTitle
                ? props.modalTitle
                : i18next.t("common.txt.alert.modal.title"),
            modalBtn: props.btnText
                ? props.btnText
                : i18next.t("common.btn.alert.modal.close"),
        };

        this.closeModal = this.closeModal.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    isOpen() {
        return this.state.open;
    }

    openModal(options) {
        /* options JSON structure
        {
            type: AlertModalType,
            messages: string,
            closeCallback: function
            title: string | default,
            modalBtn: string | default,
            showCloseHeaderButton: boolean
        }
         */

        let classNameHeader = "";
        let classNameBtn = "";
        switch (options.type) {
            case AlertModalType.ALERT_TYPE_DANGER:
                classNameHeader = "modal-danger";
                classNameBtn = GSButton.THEME.DANGER;
                break;
            case AlertModalType.ALERT_TYPE_WARNING:
                classNameHeader = "modal-warning";
                classNameBtn = GSButton.THEME.WARN;
                break;
            case AlertModalType.ALERT_TYPE_SUCCESS:
                classNameHeader = "modal-success";
                classNameBtn = GSButton.THEME.SUCCESS;
                break;
            case AlertModalType.ALERT_TYPE_OK:
                classNameHeader = "modal-success";
                classNameBtn = GSButton.THEME.SUCCESS;
                this.setState({
                    modalBtn: i18next.t("common.btn.ok"),
                });
                break;
            case AlertModalType.OK:
                classNameHeader = "modal-success";
                classNameBtn = GSButton.THEME.SUCCESS;
                this.setState({
                    modalBtn: i18next.t("common.btn.ok"),
                });
                break;
            case AlertModalType.ALERT_TYPE_INFO:
                classNameHeader = "modal-info";
                classNameBtn = GSButton.THEME.INFO;
                break;
            default:
                classNameHeader = "modal-info";
                classNameBtn = GSButton.THEME.INFO;
        }

        this.setState(
            _.extend(
                {
                    modal: true,
                },
                options,
                {
                    classNameHeader: classNameHeader,
                    classNameBtn: classNameBtn,
                }
            )
        );
    }

    toggle() {
        this.setState({
            modal: false,
        });
    }

    closeModal() {
        this.setState(
            {
                modal: false,
            },
            () => {
                if (this.state.closeCallback) {
                    this.state.closeCallback();
                }
            }
        );
    }

    render() {
        return (
            <div>
                <Modal
                    isOpen={this.state.modal}
                    className={"alert-modal"}
                    centered={true}
                    fade={false}
                    {...this.props}
                    data-sherpherd="tour-guide-alert-modal"
                >
                    {this.state.showCloseHeaderButton ? (
                        <ModalHeader
                            className={this.state.classNameHeader}
                            toggle={this.toggle}
                        >
                            {this.state.modalTitle}
                        </ModalHeader>
                    ) : (
                        <ModalHeader className={this.state.classNameHeader}>
                            {this.state.modalTitle}
                        </ModalHeader>
                    )}
                    <ModalBody>{this.state.messages}</ModalBody>
                    <ModalFooter>
                        <GSButton
                            theme={this.state.classNameBtn}
                            onClick={this.closeModal}
                            data-sherpherd="tour-guide-alert-button-close"
                        >
                            {this.state.modalBtn}
                        </GSButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export const createAlertModalOption = (message, type = AlertModalType.ALERT_TYPE_SUCCESS, closeCallBack = null) => {
    return {
        messages: message,
        closeCallback: closeCallBack,
        type: type
    }
}

/**
 *
 * @param ref
 * @param {{
 *        type: AlertModalType,
            messages: string,
            closeCallback: function
            title: string ,
            modalBtn: string
 * }} options
 */
const openModal = (ref, options) => {
    if (ref) {
        let finalRef = ref
        if (ref.current) {
            finalRef = ref.current
        }
        finalRef.openModal(options)
    }
}

export const AlertModalUtils = {
    openModal
}

export const AlertModalType = {
    ALERT_TYPE_DANGER: 'danger',
    ALERT_TYPE_WARNING: 'warning',
    ALERT_TYPE_SUCCESS: 'success',
    ALERT_TYPE_INFO: 'info',
    ALERT_TYPE_OK: 'ok',
    OK: 'ok_only'
}

export default AlertModal;

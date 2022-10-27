import React, { Component } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import _ from "lodash";
import parse from "html-react-parser";
import "./ConfirmModal.sass";
import GSButton from "../GSButton/GSButton";
import PropTypes from "prop-types";
import GSTrans from "../GSTrans/GSTrans";

class ConfirmModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            modalTitle: <GSTrans t={"common.txt.confirm.modal.title"} />,
            modalBtnOk: this.props.textBtnOk || <GSTrans t={"common.btn.ok"} />,
            modalBtnCancel: this.props.textBtnCancel || (
                <GSTrans t={"common.btn.cancel"} />
            ),
            classNameHeader: "modal-success",
            classNameBtnOk: "btn-success",
            classNameBtnCancel: "btn btn-outline-secondary",
            modalClass: this.props.modalClass,
            messageHtml: false,
            typeBtnOk: {
                success: true,
            },
            showButtonCancel: true,
        };

        this.cancelModal = this.cancelModal.bind(this);
        this.okModal = this.okModal.bind(this);
    }

    /**
     *
     * @param {
     * {
     *       messages: string,
             messageHtml: string,
             cancelCallback: function,
             okCallback: function,
             modalBtnOk: text,
             modalBtnCancel: text,
             modalTitle: string,
             classNameHeader:
             showButtonCancel: boolean,
     * }
     * } options
     */
    openModal(options) {
        this.setState(
            _.extend(
                {
                    modal: true,
                },
                options
            )
        );
    }

    cancelModal() {
        this.setState(
            {
                modal: false,
            },
            () => {
                if (this.state.cancelCallback) {
                    this.state.cancelCallback();
                }
            }
        );
    }

    okModal() {
        this.setState(
            {
                modal: false,
            },
            () => {
                if (this.state.okCallback) {
                    this.state.okCallback();
                }
            }
        );
    }

    render() {
        return (
            <div>
                <Modal
                    isOpen={this.state.modal}
                    className={`confirm-modal ${
                        this.state.modalClass ? this.state.modalClass : ""
                    }`}
                >
                    <ModalHeader
                        className={this.state.classNameHeader}
                        toggle={this.closeModal}
                    >
                        {this.state.modalTitle}
                    </ModalHeader>
                    <ModalBody>
                        {this.state.messageHtml &&
                        typeof this.state.messages === "string"
                            ? parse(this.state.messages)
                            : this.state.messages}
                    </ModalBody>
                    <ModalFooter>
                        {this.state.showButtonCancel && (
                            <GSButton secondary outline onClick={this.cancelModal}>
                                {this.state.modalBtnCancel}
                            </GSButton>
                        )}
                        <GSButton
                            {...this.state.typeBtnOk}
                            marginLeft
                            onClick={this.okModal}
                        >
                            {this.state.modalBtnOk}
                        </GSButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

ConfirmModal.propTypes = {
    textBtnOk: PropTypes.string,
    textBtnCancel: PropTypes.string,
    modalClass: PropTypes.string,
}

/**
 *
 * @param {
 * {
 *       messages: string,
             messageHtml: string,
             cancelCallback: function,
             okCallback: function,
             modalBtnOk: text,
             modalBtnCancel: text,
             modalTitle: text
 * }
 * } options
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

export const ConfirmModalUtils = {
    openModal
}

export default ConfirmModal;

import React, {Component} from 'react';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import i18next from "../../../config/i18n";
import _ from 'lodash';
import './ConfirmModalChildren.sass'
import GSButton from "../GSButton/GSButton";

class ConfirmModalChildren extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            modalTitle: i18next.t('common.txt.confirm.modal.title'),
            modalBtnOk: this.props.btnOkName,
            modalBtnCancel: this.props.btnCancelName,
            classNameHeader: 'modal-success',
            classNameBtnOk: 'btn-success',
            classNameBtnCancel: 'btn btn-outline-secondary'
        };

        this.cancelModal = this.cancelModal.bind(this);
        this.okModal = this.okModal.bind(this);
    }

    openModal(options) {
        this.setState(_.extend({
            modal: true,
        }, options));
    }

    cancelModal() {
        this.setState({
            modal: false
        },
        () => {
            if (this.state.cancelCallback) {
                this.state.cancelCallback()
            }
        });

    }

    okModal() {
        this.setState({
                modal: false
            },
            () => {
                if (this.state.okCallback) {
                    this.state.okCallback()
                }
            });

    }

    render() {
        return (
            <div>
                <Modal isOpen={this.state.modal} className={'confirm-modal'}>
                    <ModalHeader className={this.state.classNameHeader} toggle={this.closeModal}>{this.state.modalTitle}</ModalHeader>
                    <ModalBody>
                        {this.props.children}
                    </ModalBody>
                    <ModalFooter>
                        <GSButton secondary outline onClick={this.cancelModal}>{this.state.modalBtnCancel}</GSButton>
                        <GSButton success marginLeft onClick={this.okModal}>{this.state.modalBtnOk}</GSButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}


export default ConfirmModalChildren;

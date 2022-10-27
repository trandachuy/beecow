import React, {Component} from 'react';
import {Modal, ModalBody, ModalFooter} from 'reactstrap';
import i18next from "../../../config/i18n";
import _ from 'lodash';
import './ConfirmModalCheckBox.sass'
import GSButton from "../GSButton/GSButton";

class ConfirmModalCheckBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            modalTitle: i18next.t('common.txt.confirm.modal.title'),
            modalBtnOk: i18next.t('common.btn.ok'),
            modalBtnCancel: i18next.t('common.btn.cancel'),
            classNameHeader: 'modal-success',
            classNameBtnOk: 'btn-success',
            classNameBtnCancel: 'btn btn-outline-secondary',
            checked: false
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
                    this.state.okCallback(this.state.checked)
                }
            });

    }

    isDelete(){
        this.state.checked = !this.state.checked;
    }
    render() {
        return (

            <Modal isOpen={this.state.modal} className={'confirm-modal'}>
                {/* <ModalHeader className={this.state.classNameHeader} toggle={this.closeModal}>{this.state.modalTitle}</ModalHeader> */}
                <ModalBody>
                {/* <UikCheckbox
                    onChange={()=>{this.isDelete()}}
                    color="white"/>
                    {this.state.messages} */}
                    {this.state.modalTitle}
                </ModalBody>
                <ModalFooter>
                    <GSButton secondary outline  onClick={this.cancelModal}>{this.state.modalBtnCancel}</GSButton>
                    <GSButton success marginLeft onClick={this.okModal}>{this.state.modalBtnOk}</GSButton>
                </ModalFooter>
            </Modal>

        );
    }
}


export default ConfirmModalCheckBox;

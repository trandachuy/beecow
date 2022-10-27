import React, {Component} from "react";
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import i18next from "../../../../config/i18n";
import {RouteUtils} from "../../../../utils/route";
import GSButton from "../../../shared/GSButton/GSButton";
import {NAV_PATH} from "../../navigation/Navigation";
import "./ConfirmSwitchPopup.sass";
import storageService from "../../../../services/storage"
import {withRouter} from 'react-router-dom'

class ConfirmSwitchPopup extends Component {

    constructor() {
        super();
        this.state = {
            modalOpen: true
        }
        this.closePopup = this.closePopup.bind(this);
    }

    closePopup() {
        storageService.removeLocalStorage("showOpenThemesPopup");
        RouteUtils.redirectWithoutReload(this.props, NAV_PATH.themeEngine.management)
    }

    render() {
        const { modalOpen } = this.state;
        return (
            <div>
                <Modal isOpen={modalOpen} className="confirm-modal">
                    <ModalHeader className="modal-header">
                        { i18next.t("common.txt.confirm.modal.title") }
                    </ModalHeader>
                    <ModalBody>
                        { i18next.t("notification.themeEngine.switch.success.popup") }
                    </ModalBody>
                    <ModalFooter>
                        <GSButton success marginLeft onClick={this.closePopup}>
                            { i18next.t("notification.themeEngine.switch.popup.buttonOpenTheme") }
                        </GSButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default withRouter(ConfirmSwitchPopup)
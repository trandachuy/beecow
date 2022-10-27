import './RenameThemeModal.sass'
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import React, {useRef, useState} from "react";
import {AvField, AvForm} from "availity-reactstrap-validation";
import i18next from "i18next";
import {bool, func, string} from "prop-types";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {FormValidate} from "../../../../config/form-validate";
import GSButton from "../../../../components/shared/GSButton/GSButton";

const RenameThemeModal = (props) => {
    const {isToggle, defaultValue, onChange, onClose} = props

    const refSubmit = useRef(null);

    const toggle = () => {
        onClose()
    }

    const handleValidSubmit = (event, {customeName}) => {
        onChange(customeName)
    };

    return (
        <Modal isOpen={isToggle} className='rename-theme-modal' size='lg'>
            <ModalHeader toggle={toggle} className="rename-theme-modal__header" close>
                <GSTrans t='component.renameTheme.title'/>
            </ModalHeader>
            <ModalBody className="rename-theme-modal__body">
                <AvForm onValidSubmit={handleValidSubmit} autoComplete="off">
                    <button ref={refSubmit} hidden/>
                    <AvField
                        label={i18next.t("component.renameTheme.customName")}
                        name={"customeName"}
                        value={defaultValue}
                        validate={{
                            ...FormValidate.required(),
                            ...FormValidate.maxLength(100, true),
                        }}
                    />
                </AvForm>
            </ModalBody>
            <ModalFooter className="rename-theme-modal__footer">
                <GSButton success onClick={() => refSubmit.current.click()}>
                    <GSTrans t={"common.btn.save"}/>
                </GSButton>
            </ModalFooter>
        </Modal>
    )
}

RenameThemeModal.defaultProps = {
    isToggle: false,
    defaultValue: '',
    onChange: function () {
    },
    onClose: function () {
    }
}

RenameThemeModal.propTypes = {
    isToggle: bool,
    defaultValue: string,
    onChange: func,
    onClose: func,
}

export default RenameThemeModal
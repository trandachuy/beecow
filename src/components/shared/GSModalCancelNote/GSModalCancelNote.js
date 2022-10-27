import React, {useRef, useState} from 'react';
import {bool, func} from 'prop-types';
import ModalHeader from "reactstrap/es/ModalHeader";
import GSTrans from "../GSTrans/GSTrans";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSButton from "../GSButton/GSButton";
import Modal from "reactstrap/es/Modal";
import './GSModalCancelNote.sass'
import Label from "reactstrap/es/Label";
import {Trans} from "react-i18next";
import {AvForm} from "availity-reactstrap-validation";
import AvFieldCountable from "../form/CountableAvField/AvFieldCountable";

const GSModalCancelNote = props => {
    const {isToggle, onClose, onSubmitData , text, placeholderNote, title, maxLength} = props


    const [valueInfoState, setValueInfoState] = useState("")

    const refPrintReceiptModal = useRef()


    const toggle = () => {
        onClose()
    }

    const handleValidSubmit = (e, data) => {
        onSubmitData(data)
    }

    const handleChange = (e) => {
        const value = e.currentTarget.value
        setValueInfoState(value)
    }

    return (
        <Modal isOpen={isToggle} toggle={toggle} className='gs-cancel-note-modal'>
            <ModalHeader className='text-success' toggle={toggle}>
                {title}
            </ModalHeader>
            <ModalBody>
                <AvForm autoComplete="off" className='d-flex text-left mt-3'
                        onValidSubmit={handleValidSubmit} ref={ref => refPrintReceiptModal.current = ref}>
                    <div className='d-flex flex-column w-100'>
                        <div>
                            <Label for={'note'} className="gs-frm-control__title">
                                {text}
                            </Label>
                            <AvFieldCountable
                                name={'note'}
                                type={'textarea'}
                                minLength={0}
                                maxLength={maxLength || 500}
                                value={''}
                                rows={3}
                                placeholder={placeholderNote}
                                value={valueInfoState}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>
                </AvForm>
            </ModalBody>
            <ModalFooter>
                <GSButton default onClick={toggle}>
                    <GSTrans t={"common.btn.cancel"}/>
                </GSButton>
                <GSButton danger marginLeft onClick={() => refPrintReceiptModal.current.submit()}>
                    <GSTrans t={"common.btn.ok"}/>
                </GSButton>
            </ModalFooter>
        </Modal>
    );
};

GSModalCancelNote.defaultProps = {
    isToggle: false,
    onClose: () => {},
    onPrint: () => {},
}

GSModalCancelNote.propTypes = {
    isToggle: bool,
    onClose: func,
    onPrint: func,
}

export default GSModalCancelNote;

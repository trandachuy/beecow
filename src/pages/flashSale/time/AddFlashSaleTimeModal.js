import './AddFlashSaleTimeModal.sass'
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import React, {useEffect, useRef, useState} from "react";
import {bool, func, number, string} from "prop-types";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {UikSelect} from "../../../@uik";
import _ from "lodash";

const HOURS = [..._.range(0, 24)].map(hour => ({
    value: hour,
    label: ('0' + hour).slice(-2)
}))

const MINUTES = [..._.range(0, 60)].map(minute => ({
    value: minute,
    label: ('0' + minute).slice(-2)
}))

const TIME = {
    START_HOUR: 'startHour',
    START_MINUTE: 'startMinute',
    END_HOUR: 'endHour',
    END_MINUTE: 'endMinute',
}

const AddFlashSaleTimeModal = (props) => {
    const {isToggle, onSave, onClose} = props

    const [stTime, setStTime] = useState({
        startHour: 0,
        startMinute: 0,
        endHour: 0,
        endMinute: 0,
    })
    const [stError, setStError] = useState('')

    const toggle = () => {
        onClose()
    }

    const handleTimeChange = (key, {value}) => {
        setStTime(time => ({
            ...time,
            [key]: value
        }))
    }

    const isValid = () => {
        setStError('')

        if (stTime.endHour < stTime.startHour
            || (stTime.endHour === stTime.startHour
                && stTime.endMinute <= stTime.startMinute)) {
            setStError('component.AddFlashSaleTimeModal.error')

            return false
        }

        return true
    }

    const handleValidSubmit = () => {
        if (!isValid()) {
            return
        }

        onSave(stTime)
    };

    return (
        <Modal isOpen={isToggle} className='add-flash-sale-time-modal' size='lg'>
            <ModalHeader toggle={toggle} className="add-flash-sale-time-modal__header">
                <GSTrans t='component.AddFlashSaleTimeModal.title'>Add Time</GSTrans>
            </ModalHeader>

            <ModalBody className="add-flash-sale-time-modal__body">
                <label htmlFor="start-at" className='section'>
                    <GSTrans t='component.AddFlashSaleTimeModal.startAt'>Start At:</GSTrans></label>
                <div id='start-at'>
                    <label htmlFor="start-at-hour"><GSTrans
                        t='component.AddFlashSaleTimeModal.hour'>Hour:</GSTrans></label>
                    <UikSelect
                        defaultValue={HOURS[0].value}
                        options={HOURS}
                        onChange={e => handleTimeChange(TIME.START_HOUR, e)}
                    />
                    <label htmlFor="start-at-minute" className='ml-4'>
                        <GSTrans t='component.AddFlashSaleTimeModal.minute'>Minute:</GSTrans></label>
                    <UikSelect
                        defaultValue={MINUTES[0].value}
                        options={MINUTES}
                        onChange={e => handleTimeChange(TIME.START_MINUTE, e)}
                    />
                </div>

                <label htmlFor="end-at" className='section mt-3'>
                    <GSTrans t='component.AddFlashSaleTimeModal.endAt'>End At:</GSTrans>
                </label>
                <div id='end-at'>
                    <label htmlFor="end-at-hour">
                        <GSTrans t='component.AddFlashSaleTimeModal.hour'>Hour:</GSTrans>
                    </label>
                    <UikSelect
                        className={stError ? 'input-error' : ''}
                        defaultValue={HOURS[0].value}
                        options={HOURS}
                        onChange={e => handleTimeChange(TIME.END_HOUR, e)}
                    />
                    <label htmlFor="end-at-minute" className='ml-4'>
                        <GSTrans t='component.AddFlashSaleTimeModal.minute'>Minute:</GSTrans>
                    </label>
                    <UikSelect
                        className={stError ? 'input-error' : ''}
                        defaultValue={MINUTES[0].value}
                        options={MINUTES}
                        onChange={e => handleTimeChange(TIME.END_MINUTE, e)}
                    />
                </div>
                <span className='error'><GSTrans t={stError}/></span>
            </ModalBody>
            <ModalFooter className="add-flash-sale-time-modal__footer">
                <GSButton success onClick={handleValidSubmit}>
                    <GSTrans t={"common.btn.save"}/>
                </GSButton>
            </ModalFooter>
        </Modal>
    )
}

AddFlashSaleTimeModal.defaultProps = {
    isToggle: false,
    onSave: function () {
    },
    onClose: function () {
    },
}

AddFlashSaleTimeModal.propTypes = {
    isToggle: bool,
    onSave: func,
    onClose: func,
}

export default AddFlashSaleTimeModal
/*******************************************************************************
 * Copyright 2022 (C) Mediastep Software Inc.
 *
 * Created on : 29/07/2022
 * Author: An Hoang <an.hoang.nguyen@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import Modal from 'reactstrap/es/Modal'
import ModalHeader from 'reactstrap/es/ModalHeader'
import {Trans} from 'react-i18next'
import ModalBody from 'reactstrap/es/ModalBody'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import ModalFooter from 'reactstrap/es/ModalFooter'
import GSButton from '../../../../components/shared/GSButton/GSButton'
import {array, bool, func} from 'prop-types';
import {UikInput} from '../../../../@uik'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import i18next from 'i18next'
import './AssignStaffModal.sass'
import GSWidgetEmptyContent from '../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent'
import {AvForm, AvRadio, AvRadioGroup} from 'availity-reactstrap-validation'

const AssignStaffModal = (props) => {

    const { isToggle, onClose, onAssign, listStaff } = props
    const [stStaffList, setStStaffList] = useState(listStaff)
    const [stStaffChecked, setStStaffChecked] = useState(null)
    const refSubmit = useRef(null);

    useEffect(() => {
        setStStaffList(listStaff)
    }, [listStaff])

    const toggle = () => {
        onReset()
        onClose()
    }

    const handleCheckUserId = (value) => {
        setStStaffChecked(value)
    }

    const onInputSearch = (e) => {
        const value = e.target.value.toLowerCase()
        if (value) {
            const filterStaff = listStaff.filter(item => item.name.toLowerCase().indexOf(value) != -1)
            setStStaffList(filterStaff)
        } else {
            setStStaffList(listStaff)
        }
        e.preventDefault();
    }

    const handleValidSubmit = (e, value) => {
        onReset()
        onAssign(value.idStaffChecked)
    }

    const onReset = () => {
        setStStaffList(listStaff)
        setStStaffChecked(null)
    }

    return (
        <Modal isOpen={ isToggle } toggle={ toggle } className="assign-staff-modal">
            <ModalHeader toggle={ toggle }>
                <Trans i18nKey="page.customer.assign-staff-modal.title"></Trans>
            </ModalHeader>
            <ModalBody>
                <div autoComplete="off" className="d-flex flex-column text-left">
                    <div className="search-filter-staff">
                        <UikInput
                            icon={ (
                                <FontAwesomeIcon icon="search"/>
                            ) }
                            placeholder={ i18next.t('social.zalo.filter.staff.search.hint') }
                            onChange={ onInputSearch }
                        />
                    </div>
                    <div className="d-flex flex-column w-100 list-staff pt-2">
                        <AvForm onValidSubmit={ handleValidSubmit }>
                            <button ref={ refSubmit } hidden/>
                            { stStaffList.length > 0 &&
                            <AvRadioGroup
                                name='idStaffChecked'
                                className='staff-row'
                            >
                                { stStaffList.map((data, index) => (
                                    <AvRadio
                                        key={ index }
                                        customInput
                                        label={ data.name }
                                        value={ data.userId }
                                        onClick={ () => handleCheckUserId(data.userId) }
                                    />
                                )) }
                            </AvRadioGroup>
                            }
                        </AvForm>
                        { stStaffList.length === 0 &&
                        <GSWidgetEmptyContent
                            iconSrc="/assets/images/icon-Empty.svg"
                            text={ i18next.t('page.staff.list.table.empty.text') }/>
                        }
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <GSButton default onClick={ toggle }>
                    <GSTrans t={ 'common.btn.cancel' }/>
                </GSButton>
                <GSButton success marginLeft onClick={ () => refSubmit.current.click() } disabled={!stStaffChecked}>
                    <GSTrans t={ 'common.btn.confirm' }/>
                </GSButton>
            </ModalFooter>
        </Modal>

    );
}

AssignStaffModal.defaultProps = {
    isToggle: false,
    listStaff: [],
    onClose: () => {
    },
    onAssign: () => {
    }
}

AssignStaffModal.propTypes = {
    listStaff: array,
    isToggle: bool,
    onClose: func,
    onAssign: func
}


export default AssignStaffModal;

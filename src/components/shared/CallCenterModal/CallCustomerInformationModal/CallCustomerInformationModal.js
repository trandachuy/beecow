import './CallCustomerInformationModal.sass'

import ModalHeader from "reactstrap/es/ModalHeader";
import GSTrans from "../../GSTrans/GSTrans";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSButton from "../../GSButton/GSButton";
import Modal from "reactstrap/es/Modal";
import React, {useEffect, useState} from "react";
import {array, bool, func, number, string} from "prop-types";
import {AvForm, AvRadio, AvRadioGroup} from "availity-reactstrap-validation";
import i18next from "i18next";
import callCenterService from "../../../../services/CallCenterService";
import {GSToast} from "../../../../utils/gs-toast";
import {CredentialUtils} from "../../../../utils/credential";
import GSImg from "../../GSImg/GSImg";
import {NAV_PATH} from "../../../layout/navigation/Navigation";
import beehiveService from "../../../../services/BeehiveService";
import storeService from "../../../../services/StoreService";
import accountService from "../../../../services/AccountService";

const CallCustomerInformationModal = (props) => {
    const {isToggle, contacts, callHistoryId, phoneNumber, onClose, onCreateContact, onCallAssigned} = props

    const [stSelect, setStSelect] = useState()

    useEffect(() => {
        if (!contacts.length) {
            return
        }

        setStSelect(contacts[0].id)
    }, [contacts])

    const toggle = () => {
        onClose()
    }

    const closeBtn = (
        <button className="close" style={{
            position: 'absolute', top: '0', right: '0', margin: 0, fontSize: '2em', padding: '0.2em 0.3em'
        }} onClick={toggle}>&times;</button>
    )

    const handleCreate = (e) => {
        e.preventDefault()

        onCreateContact()
    }

    const handleSelect = (e) => {
        e.persist()

        const value = e.currentTarget.value

        setStSelect(value)
    }

    const handleSave = () => {
        const index = _.findIndex(contacts, (contact) => contact.id == stSelect)

        if (index > -1) {
            const {id, fullName} = contacts[index]

            callCenterService.assignCustomerToCall({
                id: callHistoryId,
                storeId: parseInt(CredentialUtils.getStoreId()),
                customerId: id,
                customerName: fullName,
            })
                .then(() => {
                    onCallAssigned()
                    GSToast.commonUpdate()
                    onClose()
                })
                .catch(() => GSToast.commonError())
        }
    }

    const viewAccount = (id, saleChannel) => {
        beehiveService.getCustomerDetail(id)
            .then((result) => {
                window.open(NAV_PATH.customers.CUSTOMERS_EDIT + `/${id}/${result.userName}/${saleChannel}`)
            })
            .catch(() => GSToast.commonError())
    }

    return (
        <Modal isOpen={isToggle} className='call-customer-info-modal' size='lg'>
            <ModalHeader toggle={toggle} close={closeBtn} className="call-customer-info-modal__header">
                <GSTrans t='component.callCustomerInfoModal.title'/>
            </ModalHeader>
            <ModalBody className="call-customer-info-modal__body">
                <span>
                    <GSTrans t='component.callCustomerInfoModal.description' values={{phoneNumber}}>
                        GoSELL found customer(s) in your store that have phone number: <strong>{phoneNumber}</strong><br/>You can save this call to a customer
                    </GSTrans>
                </span>
                <div className='call-customer-info-modal__body__contact-group'>
                    <span>
                        <GSTrans t='component.callCustomerInfoModal.selectContact'>
                            Select an existing customer or <a href='#' onClick={handleCreate}>Create New</a> one
                        </GSTrans>
                    </span>
                    {contacts && contacts.length && <AvForm>
                        <AvRadioGroup
                            required
                            name='contact-radio-group'
                            className='call-customer-info-modal__body__contact-group__radio'
                            defaultValue={contacts[0].id}
                        >
                            {
                                contacts.map((contact, index) => (
                                    <div key={index + JSON.stringify(contact)}>
                                        <div className='call-customer-info-modal__body__contact-group__radio--item'>
                                            <AvRadio
                                                customInput
                                                label={contact.fullName}
                                                value={contact.id}
                                                onClick={(e) => handleSelect(e)}
                                            />
                                            <GSImg onClick={()=>viewAccount(contact.id, contact.saleChannel)} src="/assets/images/profile.png"/>
                                        </div>
                                        <div className='call-customer-info-modal__body__contact-group__contact'>
                                            <div
                                                className={["call-customer-info-modal__body__contact-group__contact-type", contact.guest ? "guest-type" : "mem-type"].join(' ')}>
                                                {contact.guest
                                                    ? i18next.t('page.livechat.customer.details.search.user_type.contact')
                                                    : i18next.t('page.livechat.customer.details.search.user_type.member')}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </AvRadioGroup>
                    </AvForm>}
                </div>
            </ModalBody>
            <ModalFooter className="call-customer-info-modal__footer">
                <GSButton className='mr-3' onClick={() => onClose()}>
                    <GSTrans t={"common.btn.cancel"}/>
                </GSButton>
                <GSButton success onClick={() => handleSave()}>
                    <GSTrans t={"common.btn.save"}/>
                </GSButton>
            </ModalFooter>
        </Modal>
    )
}

CallCustomerInformationModal.defaultProps = {
    isToggle: false,
    contacts: [],
    phoneNumber: '',
    onClose: function () {
    },
    onCreateContact: function () {
    },
    onCallAssigned: function () {
    }
}

CallCustomerInformationModal.propTypes = {
    isToggle: bool,
    contacts: array,
    callHistoryId: number,
    phoneNumber: string,
    onClose: func,
    onCreateContact: func,
    onCallAssigned: func,
}

export default CallCustomerInformationModal

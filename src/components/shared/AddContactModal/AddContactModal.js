import './AddContactModal.sass'
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import GSTrans from "../GSTrans/GSTrans";
import ModalFooter from "reactstrap/es/ModalFooter";
import React, {useRef, useState} from "react";
import GSButton from "../GSButton/GSButton";
import {AvField, AvForm} from "availity-reactstrap-validation";
import i18next from "i18next";
import {FormValidate} from "../../../config/form-validate";
import GSTags from "../form/GSTags/GSTags";
import {TokenUtils} from "../../../utils/token";
import {CredentialUtils} from "../../../utils/credential";
import beehiveService from "../../../services/BeehiveService";
import {GSToast} from "../../../utils/gs-toast";
import {ValidateUtils} from "../../../utils/validate";
import {bool, func, number, string} from "prop-types";
import callCenterService from "../../../services/CallCenterService";

const AddContactModal = (props) => {
    const {isToggle, callHistoryId, phoneNumber, onCallAssigned, onClose} = props

    const [stTags, setStTags] = useState([]);

    const refSubmit = useRef(null);

    const toggle = () => {
        onClose()
    }

    const handleValidSubmit = (event, value) => {
        /**
         * @type {CreateCustomerProfileRequestModel}
         * */
        const requestBody = {
            fullName: value.fullName,
            phone: value.phone,
            email: value.email,
            note: value.note,
            tags: stTags && stTags.length > 0 ? stTags.map(tagObj => tagObj.value ? tagObj.value : tagObj) : []
        };

        // check staff
        if (TokenUtils.isStaff() && CredentialUtils.getOmiCallEnabled()) {
            requestBody.responsibleStaffUserId = CredentialUtils.getUserId()
        }

        beehiveService.createCustomerDetail(requestBody)
            .then(result => {
                const {id, fullName} = result

                setStTags([]);
                GSToast.success("page.livechat.customer.details.add.success.msg", true);
                onClose()

                return callCenterService.assignCustomerToCall({
                    id: callHistoryId,
                    storeId: parseInt(CredentialUtils.getStoreId()),
                    customerId: id,
                    customerName: fullName,
                })
            })
            .then(() => {
                onCallAssigned()
            })
            .catch(e => {
                if (e.response && e.response.data) {
                    if (e.response.data.errorKey === 'customer.exist') {
                        GSToast.error("page.livechat.customer.details.add.exist.msg", true);
                    } else if (e.response.data.errorKey === 'customer.email.exist') {
                        GSToast.error("page.livechat.customer.details.add.email.exist.msg", true);
                    } else if (e.response.data.errorKey === 'customer.phone.exist') {
                        GSToast.error("page.livechat.customer.details.add.phone.exist.msg", true);
                    } else {
                        GSToast.commonError();
                    }
                } else {
                    GSToast.commonError();
                }
            })
    };

    const changeCustomerProfileInfo = () => {
    };

    const onChangeTags = (value) => {
        setStTags(value);
        changeCustomerProfileInfo();
    };

    const phoneValidate = (value, ctx, input, cb) => {
        ValidateUtils.phoneValidate(i18next, value, ctx, input, cb);
    };

    const closeBtn = (
        <button className="close" style={{
            position: 'absolute', top: '0', right: '0', margin: 0, fontSize: '2em', padding: '0.2em 0.3em'
        }} onClick={toggle}>&times;</button>
    )

    return (
        <Modal isOpen={isToggle} className='add-contact-modal' size='lg'>
            <ModalHeader toggle={toggle} close={closeBtn} className="add-contact-modal__header">
                <GSTrans t='component.AddContactModal.title'/>
            </ModalHeader>
            <ModalBody className="add-contact-modal__body">
                <AvForm onValidSubmit={handleValidSubmit} autoComplete="off">
                    <button ref={refSubmit} hidden/>
                    {/*FULL NAME*/}
                    <AvField
                        label={i18next.t("page.customers.edit.fullName")}
                        name={"fullName"}
                        validate={{
                            ...FormValidate.required(),
                            ...FormValidate.maxLength(100, true),
                        }}
                        onChange={changeCustomerProfileInfo}
                    />
                    {/*EMAIL*/}
                    <AvField
                        label={i18next.t("page.customers.edit.email")}
                        name={"email"}
                        type={"email"}
                        validate={{
                            ...FormValidate.email(),
                            ...FormValidate.maxLength(100),
                        }}
                        onChange={changeCustomerProfileInfo}
                    />
                    {/*PHONE*/}
                    <AvField
                        label={i18next.t("page.customers.edit.phone")}
                        name={"phone"}
                        validate={{
                            ...FormValidate.required(),
                            ...FormValidate.maxLength(1_000_000, false),
                            ...FormValidate.pattern.numberOrEnter(),
                            async: phoneValidate,
                        }}
                        defaultValue={phoneNumber}
                        onChange={changeCustomerProfileInfo}
                    />
                    {/*TAGS*/}
                    <div className='form-group'>
                        <label className="gs-frm-input__label">
                            <GSTrans t={"page.customers.edit.tags"}/>
                        </label>
                        <GSTags
                            className='add-contact-modal__body__tag'
                            defaultValue={stTags}
                            onChange={onChangeTags}
                        />
                    </div>
                    {/*NOTE*/}
                    <AvField
                        label={i18next.t("page.customers.edit.note")}
                        name={"note"}
                        type={"textarea"}
                        validate={{
                            ...FormValidate.maxLength(1_000, true)
                        }}
                        onChange={changeCustomerProfileInfo}
                    />
                </AvForm>
            </ModalBody>
            <ModalFooter className="add-contact-modal__footer">
                <GSButton success onClick={() => refSubmit.current.click()}>
                    <GSTrans t={"common.btn.save"}/>
                </GSButton>
            </ModalFooter>
        </Modal>
    )
}

AddContactModal.defaultProps = {
    isToggle: false,
    phoneNumber: '',
    onCallAssigned: function () {
    },
    onClose: function () {
    }
}

AddContactModal.propTypes = {
    isToggle: bool,
    callHistoryId: number,
    phoneNumber: string,
    onCallAssigned: func,
    onClose: func,
}

export default AddContactModal
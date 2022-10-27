import React, { useRef, useState } from 'react';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import GSButton from '../../../../components/shared/GSButton/GSButton';
import { AvCheckbox, AvCheckboxGroup, AvForm } from 'availity-reactstrap-validation';
import { FormValidate } from '../../../../config/form-validate';
import i18next from 'i18next';
import {LIST_COLUMN_KEY} from '../OrderList';
import './OrderSettingColumn.sass';
import _ from 'lodash';
import PropTypes from "prop-types";

const OrderSettingColumnModal = (props) => {
    const {defaultSetting, isOpen, ...others} = props;
    const refBtnSubmit = useRef(null);
    const refForm = useRef(null);
    const [stSettingColumnList, setStSettingColumnList] = useState(LIST_COLUMN_KEY)
    
    const handleShippingModal = (e, type) => {
        if ('CANCEL' === type) {
            props.modalHandle(type);
        } else {
            refBtnSubmit.current.click();
        }
    }

    const handleValidSubmit = (event, values) => {
        if(!values || !values.columnSetting.length) return
        let defaultList = _.cloneDeep(stSettingColumnList);
        let setData = defaultList.filter(r => values.columnSetting.includes(r.code)).map(r => r.code)
        props.modalHandle('OK', setData)
    }
    
    const onChangeColumn = (event, item) => {
        // TODO SOMETHING
        if(!item) return
        let checked = event.target.checked
        setStSettingColumnList(list => {
            let column = list.find(r => r.value === item.value)
            if(column) column.checked = checked
            return [...list]
        })
    }

    return(
        <>
            {isOpen && <Modal 
                isOpen={ isOpen }
                size="lg"
                key={ 'order-column-setting-modal-' + isOpen }
            >
                <ModalHeader className="bg-light-gray">
                    <p className="text-dark">
                        <GSTrans t="page.order.detail.information.title"/>
                    </p>
                </ModalHeader>
                <ModalBody>
                    <AvForm className="form-order-column-setting gs-atm__scrollbar-1"
                            onValidSubmit={ handleValidSubmit }
                            model={{columnSetting: defaultSetting}}
                            ref={ refForm }
                    >
                        <button ref={ refBtnSubmit } hidden>
                            submit
                        </button>
                        <AvCheckboxGroup
                                name="columnSetting"
                                validate={{
                                    ...FormValidate.required("page.order.column.setting.Error"),
                                }}
                            >
                                <div className='row w-100'>
                                    <div className="col-lg-6 col-md-6 col-sm-12 col-12 text-left">
                                        {stSettingColumnList?.filter(r => r.col === 'left').map((item, index) => {
                                            return(
                                                <div className='p-2' key={`col-left-setting-${index}`}>
                                                    <AvCheckbox
                                                        key={`checkbox-${item.code}`}
                                                        label={i18next.t(
                                                            `page.order.column.${item.code}`
                                                        )}
                                                        className="text-dark"
                                                        value={item.code}
                                                        onChange={(e) => onChangeColumn(e, item)}
                                                        customInput
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 col-12 text-left">
                                        {stSettingColumnList?.filter(r => r.col === 'right').map((item, index) => {
                                            return(
                                                <div className={'p-2'} key={`col-right-setting-${index}`}>
                                                    <AvCheckbox
                                                        key={`checkbox-${item.code}`}
                                                        label={i18next.t(
                                                            `page.order.column.${item.code}`
                                                        )}
                                                        className="text-dark"
                                                        value={item.code}
                                                        onChange={(e) => onChangeColumn(e, item)}
                                                        customInput
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </AvCheckboxGroup>
                    </AvForm>
                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={ (e) => handleShippingModal(e, 'CANCEL') }>
                        <GSTrans t="common.btn.cancel"/>
                    </GSButton>
                    <GSButton
                        success
                        marginLeft
                        onClick={ (e) => handleShippingModal(e, 'OK') }
                    >
                        <GSTrans t="common.btn.ok"/>
                    </GSButton>
                </ModalFooter>
            </Modal>}
        </>
    )
}
OrderSettingColumnModal.propTypes = {
    isOpen: PropTypes.bool,
    defaultSetting: PropTypes.array,
    modalHandle: PropTypes.func
};
export default OrderSettingColumnModal; 

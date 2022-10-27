import React, {useEffect, useLayoutEffect, useRef, useState} from 'react'
import './SelectSettingColumn.sass'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import i18next from 'i18next'
import GSImg from '../../../../components/shared/GSImg/GSImg'
import {AvField, AvForm} from 'availity-reactstrap-validation'
import {FormValidate} from '../../../../config/form-validate'
import DatePicker from 'react-datepicker'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import GSTags from '../../../../components/shared/form/GSTags/GSTags'
import style from '../../Edit/CustomerEditor.module.sass'
import {UikCheckbox} from '../../../../@uik'
import GSTooltip, {GSTooltipIcon, GSTooltipPlacement} from '../../../../components/shared/GSTooltip/GSTooltip'
import GSButton from '../../../../components/shared/GSButton/GSButton'
import {bool, func} from 'prop-types'
import {CurrencyUtils} from '../../../../utils/number-format'
import catalogService from '../../../../services/CatalogService'
import beehiveService from '../../../../services/BeehiveService'
import Constants from '../../../../config/Constant'
import {ValidateUtils} from '../../../../utils/validate'
import {DateTimeUtils} from '../../../../utils/date-time'
import moment from 'moment'
import useDebounceEffect from '../../../../utils/hooks/useDebounceEffect'


const SelectSettingColumn = props => {
    const { isOpen, onFinishSelect, lstSelected} = props

    const[getSelectedColumn, setSelectedColumn] = useState(lstSelected)
    const[getIsShowError, setIsShowError] = useState(false)

    useEffect(() => {
        
    }, [])

    const onClosed = () => {
        setSelectedColumn(...lstSelected);
        if(getSelectedColumn.filter(data => data.show === true).length > 0){
            setIsShowError(false)
        }else {
            setIsShowError(true)
        }
        onFinishSelect('CANCELLED', null)
    }

    const onFinished = () => {
        if(getSelectedColumn.filter(data => data.show === true).length > 0){
            setIsShowError(false)
            onFinishSelect('SELECTED', getSelectedColumn)
        }else {
            setIsShowError(true)
        }
    }

    const selectColumn = (event, name) => {
        const checked = event.target.checked;
        let data = [...getSelectedColumn];
        data.forEach(column => {
            if(column.name === name){
                column.show = checked
            }
        })

        setSelectedColumn(data);
    }

    return (
        <Modal isOpen={isOpen} toggle={onClosed} className="customer-select-column">
                <ModalHeader toggle={onClosed}>{i18next.t("page.reservation.detail.customer_information")}</ModalHeader>
                
                       
                <ModalBody className='d-flex'>
                    
                        <div className="content">
                            <div className="half-left">   
                                {
                                    getSelectedColumn.map((column, index) => {
                                            if(index < 10)
                                            return (
                                                <div className='form-group align-items-center check-box'>
                                                    <UikCheckbox
                                                        key={`checkbox_${column.name}_${column.show}`}
                                                        checked={column.show}
                                                        onChange={e => selectColumn(e, column.name)}
                                                        className="custom-check-box"
                                                    />
                                                    <span className="check-box-wrapper__label">{i18next.t(`page.customers.setting.column.${column.name}`)}</span>
                                                </div>
                                            
                                            )
                                    })
                                        
                                } 
                            </div>

                            <div className="half-right">   
                                {
                                    getSelectedColumn.map((column, index) => {
                                            if(index > 9)
                                            return (
                                                <div className='form-group align-items-center check-box'>
                                                    <UikCheckbox
                                                        key={`checkbox_${column.name}_${column.show}`}
                                                        checked={column.show}
                                                        onChange={e => selectColumn(e, column.name)}
                                                        className="custom-check-box"
                                                    />
                                                    <span className="check-box-wrapper__label">{i18next.t(`page.customers.setting.column.${column.name}`)}</span>
                                                </div>
                                            
                                            )
                                    })
                                        
                                } 
                            </div>   


                        </div>
                        <div style={{marginBottom : "30px"}}>
                            {
                                getIsShowError && 
                                <span style={{color : "red", fontStyle: "italic"}}>
                                    <GSTrans t={"page.customers.setting.column.error.required"}/>
                                </span>
                            }
                        </div>

                        <ModalFooter>
                            <GSButton default buttonType="button" onClick={onClosed}>
                                <GSTrans t={"common.btn.cancel"}/>
                            </GSButton>
                            <GSButton marginLeft success onClick={onFinished}>
                                <GSTrans t={"common.btn.add"}/>
                            </GSButton>
                        </ModalFooter>
                    
                </ModalBody>
                
            </Modal>
    )
}

SelectSettingColumn.defaultProps = {

}

SelectSettingColumn.propTypes = {

}

export default SelectSettingColumn 
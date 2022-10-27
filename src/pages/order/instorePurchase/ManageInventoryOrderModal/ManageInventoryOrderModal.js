import React, {Component, useContext, useEffect, useRef, useState} from 'react';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import i18next from "i18next";
import PropTypes, {arrayOf, bool, func, number, oneOf, shape, string} from "prop-types";
import Constants from "../../../../config/Constant";
import "./ManageInventoryOrderModal.sass";
import {ItemUtils} from "../../../../utils/item-utils";
import style from "../../../customers/Edit/CustomerEditor.module.sass";
import CreatableSelect from "react-select";
import useDebounceEffect from "../../../../utils/hooks/useDebounceEffect";
import {ItemService} from "../../../../services/ItemService";
import {OrderInStorePurchaseContext} from "../context/OrderInStorePurchaseContext";

const SIZE_PER_PAGE = 9999

const ManageInventoryOrderModal = (props) => {
    const {dispatch} = useContext(OrderInStorePurchaseContext.context);
    const [stSelectedOnlyCodes, setStSelectedOnlyCodes] = useState([]);
    const [stSelectedCodes, setStSelectedCodes] = useState(props.defaultCodes.map(x => {
        return {
            label: x,
            value: x
        }
    }));
    const [stCodes, setStCodes] = useState([]);
    const [stKeyword, setStKeyword] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPage: 0,
        itemCount: 0
    });

    useDebounceEffect(() => {
        if (props.isOpenModal) {
            fetchCode();
        }
    }, 0, [props.isOpenModal, pagination.currentPage, stKeyword])

    const fetchCode = () => {
        ItemService.searchItemModelCodeForStore({
            itemId: props.itemId,
            modelId: props.modelId,
            branchId: props.branchId,
            keyword: stKeyword,
            status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE,
            page: pagination.currentPage - 1,
            size: SIZE_PER_PAGE
        }).then(result => {
            let arr = [...stCodes, ...result.data];
            let stSelectedOnlyCodes = props.defaultCodes
            setStSelectedCodes(props.defaultCodes.map(x => {
                return {
                    label: x,
                    value: x
                }
            }))
            setStCodes(arr.map(x => {
                return {
                    ...x,
                    classSelected: stSelectedOnlyCodes.indexOf(x.code) > -1 ? 'selected' : ''
                }
            }));

            setPagination(stPagination => ({
                ...stPagination,
                totalPage: Math.ceil(parseInt(result.headers['x-total-count']) / SIZE_PER_PAGE),
                itemCount: parseInt(result.headers['x-total-count'])
            }))
        })
    }

    const toggle = (e) => {
        e.preventDefault()
        setStCodes([])
        props.cancelCallback()
    };

    const handleCancel = () => {
        setStCodes([])
        setStSelectedOnlyCodes([])
        props.cancelCallback()
    }

    const handleSave = () => {
        setStCodes([])
        props.saveCallback(stSelectedOnlyCodes);
    }

    const scrollCodeList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && pagination.currentPage < pagination.totalPage) {
            setPagination({
                ...pagination,
                currentPage: pagination.currentPage + 1
            })
        }
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const onInputChange = (value, action) => {
        if (action.action !== "input-blur" && action.action !== "menu-close") {
            setStCodes([]);
            setStKeyword(value);
            setPagination({
                ...pagination,
                currentPage: 1
            })
        }
    }

    const handleChange = (value, action) => {
        if (action.action === 'remove-value') {
            setStSelectedCodes(stSelectedCodes.filter(x => x.value !== action.removedValue.value));
            let onlyCodes = stSelectedOnlyCodes.filter(x => x !== action.removedValue.value);
            setStSelectedOnlyCodes(onlyCodes);
            setStCodes(stCodes.map(x => {
                return {
                    ...x,
                    classSelected: onlyCodes.indexOf(x.code) > -1 ? 'remove-imei' : ''
                }
            }));
        }
    }

    const selectCode = (code) => {
        if (!stSelectedCodes.find(x => x.value === code) && stSelectedOnlyCodes.length < props.quantity) {
            dispatch(OrderInStorePurchaseContext.actions.checkErrorIMEI(false))
            setStSelectedCodes([...stSelectedCodes, ...[{label: code, value: code}]]);
            let onlyCodes = [...stSelectedOnlyCodes, ...[code]];
            setStSelectedOnlyCodes(onlyCodes);
            setStCodes(stCodes.map(x => {
                return {
                    ...x,
                    classSelected: onlyCodes.indexOf(x.code) > -1 ? 'selected' : ''
                }
            }));
        }

    }

    return(
        <>
            <Modal isOpen={props.isOpenModal} toggle={toggle} className="managed-inventory-POS-modal">
                    <ModalHeader toggle={toggle}>
                        <div className="POS-translate__titleHeader">
                            <p>{ i18next.t('component.managedInventoryPOSModal.updateStock.title') }</p>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <div className="table m-0">
                            <table>
                                <thead>
                                <tr>
                                    <th>{i18next.t('component.managedInventoryPOSModal.updateStock.table.product')}</th>
                                    <th>{i18next.t('component.managedInventoryPOSModal.updateStock.table.IMEI')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>
                                        <p className='name'>{props.name}</p>
                                        {props.modelName &&
                                        <span className='modelName'>{ItemUtils.escape100Percent(props.modelName).replace(/\|/gm, ' | ')}</span>
                                        }
                                    </td>
                                    <td>
                                            <div className="input-code">
                                                <div className='title-input-code'>
                                                    <div className='selected-inventory-POS'>
                                                        <GSTrans t={'component.managedInventoryPOSModal.updateStock.selected'} values={{
                                                            x: stSelectedCodes.length
                                                        }}/>
                                                    </div>
                                                    <div className='selected-max-POS'>
                                                        <GSTrans t={'component.managedInventoryPOSModal.updateStock.selectedMax'} values={{
                                                            x: props.quantity
                                                        }}/>
                                                    </div>
                                                </div>
                                                <CreatableSelect
                                                    className={'code-selected'}
                                                    classNamePrefix={'code'}
                                                    inputValue={stKeyword}
                                                    isMulti={true}
                                                    isClearable={false}
                                                    isSearch={false}
                                                    onInputChange={onInputChange}
                                                    onChange={handleChange}
                                                    placeholder={i18next.t('component.managedInventoryPOSModal.updateStock.search')}
                                                    noOptionsMessage={() => null}
                                                    value={stSelectedCodes}
                                                    style={{
                                                        ...style,
                                                        cursor: 'text'
                                                    }}
                                                    styles={{
                                                        clearIndicator: (base, state) => ({
                                                            ...base,
                                                            cursor: 'pointer !important'
                                                        }),
                                                        multiValueRemove: (base, state) => ({
                                                            ...base,
                                                            cursor: 'pointer !important'
                                                        }),
                                                        multiValueLabel: (base) => ({
                                                            ...base,
                                                            'white-space': 'pre-line',
                                                            'word-break': 'break-word'
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="code" onScroll={scrollCodeList}>
                                                {stCodes.length === 0 &&
                                                    <div className={'iemi-not-found'}>
                                                        <p>{ i18next.t('component.managedInventoryPOSModal.updateStock.notfound') }</p>
                                                    </div>

                                                }
                                                {
                                                    stCodes.map((code, index) => {
                                                        return (
                                                            <div key={index} className={"content " + code.classSelected}
                                                                 onClick={() => selectCode(code.code)}>
                                                                <p>{code.code}</p>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </ModalBody>

                    <ModalFooter>
                        <GSButton onClick={handleCancel} >
                            <GSTrans t={ 'common.btn.cancel' }/>
                        </GSButton>
                        <GSButton success marginLeft onClick={handleSave}>
                            <GSTrans t={ 'common.btn.save' }/>
                        </GSButton>
                    </ModalFooter>
                </Modal>
        </>
    )
}

ManageInventoryOrderModal.defaultProps = {
}

ManageInventoryOrderModal.propTypes = {
    isOpenModal:PropTypes.bool,
    name: PropTypes.string,
    modelName: PropTypes.string,
    itemId: PropTypes.number,
    modelId: PropTypes.number,
    branchId: PropTypes.number,
    defaultCodes: PropTypes.array,
    quantity: PropTypes.any,
    cancelCallback: PropTypes.func,
    saveCallback: PropTypes.func
}

export default ManageInventoryOrderModal

import React, {useEffect, useMemo, useState} from 'react'
import styled from 'styled-components'
import './SelectIMEISerialModal.sass'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import i18next from 'i18next'
import {AvForm} from 'availity-reactstrap-validation'
import GSButton from '../../GSButton/GSButton'
import GSTrans from '../../GSTrans/GSTrans'
import {arrayOf, bool, func, number, oneOf, shape, string} from 'prop-types'
import Constants from '../../../../config/Constant'
import {InventoryEnum} from '../../../../pages/products/InventoryList/InventoryEnum'
import {ItemService} from '../../../../services/ItemService'
import CreatableSelect from 'react-select'
import style from '../../../../pages/customers/Edit/CustomerEditor.module.sass'

const ProductNameLabel = styled.div`
  font-size: 13px;
`
const ModelNameLabel = styled.div`
  font-weight: 500;
  font-size: 13px;
`
const QuantityLabel = styled.div`
  font-size: 12px;
  margin-bottom: 11px;
`

const SHOW_AT_SCREEN = {
    PURCHASE_ORDER_FORM_EDITOR: 'PURCHASE_ORDER_FORM_EDITOR',
    INVENTORY_LIST: 'INVENTORY_LIST',
    TRANSFER_TO_BRANCH: 'TRANSFER_TO_BRANCH'
}

const SelectIMEISerialModal = (props) => {
    const {
        disabled,
        editorMode,
        toggle,
        itemId,
        modelId,
        selectedBranchIds,
        productName,
        modelName,
        maxQuantity,
        itemModelCodes,
        onToggle,
        onCancel,
        onSave
    } = props

    const [stSelectedBranchId, setStSelectedBranchId] = useState()
    const [stAvailableSerials, setStAvailableSerials] = useState([])
    const [stSearchResult, setStSearchResult] = useState([])
    const [stSearchPaging, setStSearchPaging] = useState({
        page: 0,
        size: 9999,
        total: 0,
        keyword: undefined
    })
    const [stErrorToast, setStErrorToast] = useState({
        error: '',
        isToast: false
    })

    const availableSerialLabels = useMemo(() => {
        return stAvailableSerials.map(c => ({
            label: c,
            value: c
        }))
    }, [stAvailableSerials])

    useEffect(() => {
        const branchIds = selectedBranchIds.filter(b => b)

        if (!branchIds.length) {
            return
        }

        setStSelectedBranchId(branchIds[0])
    }, [selectedBranchIds])

    useEffect(() => {
        if (!itemModelCodes.length) {
            return
        }

        setStAvailableSerials(itemModelCodes.map(({ code }) => code))
    }, [itemModelCodes])

    useEffect(() => {
        const { keyword, page, size } = stSearchPaging

        if (!itemId || !stSelectedBranchId || !toggle) {
            return
        }

        ItemService.searchItemModelCodeForStore({
            itemId: itemId,
            modelId: modelId,
            branchId: stSelectedBranchId,
            keyword: keyword,
            status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE,
            page: page,
            size: size
        })
            .then(({ data, headers }) => {
                const transferringCodes = itemModelCodes.filter(({ code }) => code.includes(keyword || ''))

                setStSearchResult(_.uniq([...data, ...transferringCodes].map(({ code }) => code)))
                setStSearchPaging(paging => ({
                    ...paging,
                    total: Math.ceil(parseInt(headers['x-total-count']) / size)
                }))
            })
    }, [stSearchPaging.keyword, stSearchPaging.page, stSearchPaging.size, stSelectedBranchId, toggle])

    useEffect(() => {
        if (!stErrorToast.error) {
            return
        }

        $('.error-toast').show(300)

        setTimeout(() => {
            $('.error-toast').hide(300)
        }, 3000)
    }, [stErrorToast.isToast])

    const handleToggle = () => {
        setStAvailableSerials([])
        onToggle()
    }

    const handleCancel = () => {
        setStAvailableSerials([])
        onCancel()
    }

    const handleSave = () => {
        if (stAvailableSerials.length) {
            onSave([{
                branchId: stSelectedBranchId,
                serial: stAvailableSerials
            }])
        }
    }

    const showToast = (error, options = {}) => {
        setStErrorToast(toast => ({
            isToast: !toast.isToast,
            error: <GSTrans t={ error } values={ { value: options.value } }/>
        }))
    }

    const onInputChange = (value, action) => {
        if (action.action !== 'menu-close') {
            setStSearchPaging(current => ({
                ...current,
                keyword: value
            }))
        }
    }

    const handleChange = (value, action) => {
        if (action.action === 'remove-value') {
            setStAvailableSerials(list => list.filter(l => l !== action.removedValue.value))
            setStSearchPaging(current => ({
                ...current,
                keyword: current.keyword == undefined ? null : undefined
            }))
        }
    }

    const handleSelectSerial = (value) => {
        if (stAvailableSerials.length > 1000000) {
            return
        }

        if (maxQuantity !== undefined && stAvailableSerials.length >= maxQuantity) {
            showToast('component.selectIMEISerialModal.error.exceed')
            return
        }

        setStAvailableSerials(list => [...list, value])
        setStSearchPaging(current => ({
            ...current,
            keyword: undefined
        }))
    }

    const renderNoBranchTable = () => {
        return (
            <div className="table">
                <table>
                    <thead>
                    <tr>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="no-branch">{ i18next.t('component.RemainingSoldItemModal.error.noBranch') }</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <Modal isOpen={ toggle } toggle={ handleToggle } className="select-imei-serial-modal"
               size="xl">
            <div className="error-toast">
                { stErrorToast.error }
            </div>
            <ModalHeader toggle={ handleToggle }>
                <div className="product-translate__titleHeader">
                    <p>{ i18next.t('page.product.allProduct.productDetail.select.IMEISerial') }</p>
                </div>
            </ModalHeader>
            <ModalBody>
                <div className="d-flex">
                    {
                        !!stSelectedBranchId &&
                        <div className="table left">
                            <table>
                                <thead>
                                <tr>
                                    <th>{ i18next.t('page.order.detail.confirm.imei.modal.productName') }</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>
                                        <ProductNameLabel>{ productName }</ProductNameLabel>
                                        <ModelNameLabel>{ modelName }</ModelNameLabel>
                                        <div className="mobile-view">
                                            <td>
                                                <AvForm
                                                    className="in-purchase"
                                                    autoComplete="off"
                                                >
                                                    <div className="input-code">
                                                        {
                                                            <QuantityLabel>
                                                                <GSTrans
                                                                    t="component.managedInventoryModal.quantity.select"
                                                                    values={ {
                                                                        currentQty: stAvailableSerials.length
                                                                    } }/>
                                                            </QuantityLabel>
                                                        }
                                                        <CreatableSelect
                                                            className="code-selected"
                                                            classNamePrefix="code"
                                                            placeholder={ i18next.t('component.managedInventoryPOSModal.updateStock.search') }
                                                            value={ availableSerialLabels }
                                                            isMulti={ true }
                                                            isClearable={ false }
                                                            isSearch={ false }
                                                            noOptionsMessage={ () => null }
                                                            onKeyDown={ (e) => {
                                                                e.key === 'Enter' && e.preventDefault()
                                                            } }
                                                            onInputChange={ onInputChange }
                                                            onChange={ handleChange }
                                                            style={ {
                                                                ...style,
                                                                cursor: 'text'
                                                            } }
                                                            styles={ {
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
                                                            } }
                                                        />
                                                    </div>
                                                    <div className="code-wrapper">
                                                        {
                                                            !stSearchResult.length &&
                                                            <div className="not-found-wrapper">
                                                                <div className="not-found">
                                                                    { i18next.t('component.managedInventoryPOSModal.updateStock.notfound') }
                                                                </div>
                                                            </div>
                                                        }
                                                        <div className="code in-purchase">
                                                            {
                                                                stSearchResult.map((code, index) => {
                                                                    return (
                                                                        <div
                                                                            key={ index }
                                                                            className="content"
                                                                            onMouseDown={ () => handleSelectSerial(code) }
                                                                        >
                                                                            <p>{ code }</p>
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                </AvForm>
                                            </td>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    }
                    {
                        !!stSelectedBranchId &&
                        <div className="table right desktop-view overflow-unset">
                            <table>
                                <thead>
                                <tr>
                                    <th>
                                        <GSTrans t={ 'component.managedInventoryModal.header' }/>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>
                                        <AvForm
                                            className="in-purchase"
                                            autoComplete="off"
                                        >
                                            <div className="input-code">
                                                {
                                                    <QuantityLabel>
                                                        <GSTrans
                                                            t="component.managedInventoryModal.quantity.select"
                                                            values={ {
                                                                currentQty: stAvailableSerials.length
                                                            } }/>
                                                    </QuantityLabel>
                                                }
                                                <CreatableSelect
                                                    className="code-selected"
                                                    classNamePrefix="code"
                                                    placeholder={ i18next.t('component.managedInventoryPOSModal.updateStock.search') }
                                                    value={ availableSerialLabels }
                                                    isMulti={ true }
                                                    isClearable={ false }
                                                    isSearch={ false }
                                                    noOptionsMessage={ () => null }
                                                    onKeyDown={ (e) => {
                                                        e.key === 'Enter' && e.preventDefault()
                                                    } }
                                                    onInputChange={ onInputChange }
                                                    onChange={ handleChange }
                                                    style={ {
                                                        ...style,
                                                        cursor: 'text'
                                                    } }
                                                    styles={ {
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
                                                    } }
                                                />
                                            </div>
                                            <div className="code-wrapper">
                                                {
                                                    !stSearchResult.length &&
                                                    <div className="not-found-wrapper">
                                                        <div className="not-found">
                                                            { i18next.t('component.managedInventoryPOSModal.updateStock.notfound') }
                                                        </div>
                                                    </div>
                                                }
                                                <div className="code in-purchase">
                                                    {
                                                        stSearchResult.filter(c => !_.includes(stAvailableSerials, c)).map((code, index) => {
                                                            return (
                                                                <div
                                                                    key={ index }
                                                                    className="content"
                                                                    onMouseDown={ () => handleSelectSerial(code) }
                                                                >
                                                                    <p>{ code }</p>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </AvForm>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    }
                    {
                        !stSelectedBranchId && renderNoBranchTable()
                    }
                </div>
            </ModalBody>

            {
                !disabled && <ModalFooter>
                    <GSButton onClick={ handleCancel }>
                        <GSTrans t={ 'common.btn.cancel' }/>
                    </GSButton>
                    <GSButton success marginLeft onClick={ handleSave }>
                        <GSTrans t={ 'common.btn.save' }/>
                    </GSButton>
                </ModalFooter>
            }
        </Modal>
    )
}

SelectIMEISerialModal.mapSaveDataToItemModelCodes = function (itemId, modelId, itemModelCodes = [],
                                                              data) {
    const result = itemModelCodes.filter(({ status }) => status !== Constants.ITEM_MODE_CODE_STATUS.AVAILABLE)

    data.forEach(({ branchId, serial }) => {
        const codes = serial.map(inputCode => {
            const currentCode = itemModelCodes.find(({ code }) => code === inputCode)

            return {
                ...currentCode,
                itemId,
                modelId,
                branchId,
                code: inputCode,
                status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE
            }
        })

        result.push(...codes)
    })

    return result
}

SelectIMEISerialModal.mapSaveDataToInventoryList = function (itemId, modelId, oldItemModelCodes,
                                                             data) {
    return data.map(({ branchId, serial }) => ({
        branchId: branchId,
        inventoryCurrent: oldItemModelCodes.filter(i => i.itemId === itemId && i.modelId === modelId && i.branchId === branchId).length,
        inventoryStock: serial.length,
        inventoryType: InventoryEnum.ACTIONS.SET_STOCK
    }))
}

SelectIMEISerialModal.SHOW_AT_SCREEN = SHOW_AT_SCREEN

SelectIMEISerialModal.defaultProps = {
    selectedBranchIds: [],
    modelName: '',
    itemModelCodes: [],
    onToggle: function () {
    },
    onCancel: function () {
    },
    onSave: function () {
    }
}

SelectIMEISerialModal.propTypes = {
    toggle: bool,
    disabled: bool,
    itemId: number.isRequired,
    modelId: number.isRequired,
    selectedBranchIds: arrayOf(number),
    productName: string,
    modelName: string,
    maxQuantity: number,
    itemModelCodes: arrayOf(shape({
        id: number,
        itemId: number,
        modelId: number,
        branchId: number,
        code: string,
        status: oneOf(Object.values(Constants.ITEM_MODE_CODE_STATUS))
    })),
    onToggle: func,
    onCancel: func,
    onSave: func
}


export default SelectIMEISerialModal

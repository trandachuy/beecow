import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import './IMEISerialModal.sass'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import i18next from 'i18next'
import {AvField, AvForm} from 'availity-reactstrap-validation'
import GSDropdownMultipleSelect from '../../GSDropdownMultipleSelect/GSDropdownMultipleSelect'
import {FormValidate} from '../../../../config/form-validate'
import GSButton from '../../GSButton/GSButton'
import GSTrans from '../../GSTrans/GSTrans'
import {arrayOf, bool, func, number, oneOf, shape, string} from 'prop-types'
import Constants from '../../../../config/Constant'
import {InventoryEnum} from '../../../../pages/products/InventoryList/InventoryEnum'
import {ItemService} from '../../../../services/ItemService'
import SelectIMEISerialModal from '../SelectIMEISerialModal/SelectIMEISerialModal'

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
    TRANSFER_TO_BRANCH: 'TRANSFER_TO_BRANCH',
    TRANSFER_TO_PARTNER: 'TRANSFER_TO_PARTNER'
}

const IMEISerialModal = (props) => {
    const {
        disabled,
        toggle,
        itemId,
        selectedBranchIds,
        branchList,
        currentScreen,
        productName,
        modelLabel,
        modelName,
        maxQuantity,
        itemModelCodes,
        onToggle,
        onCancel,
        onSave
    } = props

    const [stSelectedBranchIds, setStSelectedBranchIds] = useState([])
    const [stBranchesAndSerials, setStBranchesAndSerials] = useState([])
    const [stSerialCodes, setStSerialCodes] = useState([])
    const [stErrorToast, setStErrorToast] = useState({
        error: '',
        isToast: false
    })

    useEffect(() => {
        setStSelectedBranchIds(selectedBranchIds)
    }, [selectedBranchIds])

    useEffect(() => {
        if (!itemModelCodes.length) {
            return
        }

        const branchesAndSerials = []
        const serialCodes = []

        itemModelCodes.forEach(({ branchId, code, status }) => {
            serialCodes.push(code)

            const index = branchesAndSerials.findIndex(({ branchId: id }) => id === branchId)

            if (index < 0) {
                // Not add yet
                branchesAndSerials.push({
                    branchId,
                    serial: [code]
                })
            } else {
                // Added already
                branchesAndSerials[index].serial.push(code)
            }
        })

        setStBranchesAndSerials(branchesAndSerials)
        setStSerialCodes(serialCodes)
    }, [itemModelCodes])

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
        setStBranchesAndSerials([])
        setStSerialCodes([])
        onToggle()
    }

    const handleCancel = () => {
        setStBranchesAndSerials([])
        setStSerialCodes([])
        onCancel()
    }

    const handleSave = () => {
        if (stBranchesAndSerials.length) {
            onSave(stBranchesAndSerials)
        }
    }

    const handleChangeBranches = (branches) => {
        setStSelectedBranchIds(branches.sort((a, b) => a - b))
    }

    const showToast = (error, options = {}) => {
        setStErrorToast(toast => ({
            isToast: !toast.isToast,
            error: <GSTrans t={ error } values={ { value: options.value } }/>
        }))
    }

    const clearInputValue = (branchId) => {
        setTimeout(() => {
            Array.from(document.getElementsByClassName(`input-serial-${ branchId }`)).forEach(el => el.value = '')
        }, 10)
    }

    const handleInputCode = async (e, branchId) => {
        if (e.key !== 'Enter' || disabled) {
            return
        }

        e.preventDefault()

        const value = e.currentTarget.value.trim()
        const indexBranchId = stBranchesAndSerials.findIndex(b => b.branchId === branchId)

        if (value === '' || stBranchesAndSerials[indexBranchId]?.serial.length > 1000000) {
            return
        }

        if (maxQuantity !== undefined && stSerialCodes.length >= maxQuantity) {
            showToast('component.managedInventoryModal.error.exceed')
            return
        }

        const indexListCode = stSerialCodes.findIndex(code => code === value)

        if (indexListCode !== -1) {
            showToast('component.managedInventoryModal.error.exist', { value: `{${ value }}` })
            return
        }

        const isValid = await ItemService.checkValidCode(itemId, value)

        if (!isValid) {
            showToast('component.managedInventoryModal.error.exist', { value: `{${ value }}` })
            return
        }

        const branchIndex = stBranchesAndSerials.findIndex(id => id.branchId === branchId)

        setStSerialCodes(codes => [...codes, value])

        if (branchIndex === -1) {
            setStBranchesAndSerials(list => [...list, {
                branchId: branchId,
                serial: [value]
            }])
        } else {
            setStBranchesAndSerials(list => {
                list[branchIndex].serial.push(value)

                return [...list]
            })
        }

        clearInputValue(branchId)
    }

    const handleDeleteSerial = (branchId, serial) => {
        const index = stBranchesAndSerials.findIndex(id => id.branchId === branchId)
        setStBranchesAndSerials(list => {
            list[index] = {
                ...list[index],
                serial: [...list[index].serial.filter(l => l !== serial)]
            }

            return list
        })
        setStSerialCodes(codes => [...codes.filter(c => c !== serial)])
    }

    const renderModalAtScreen = () => {
        switch (currentScreen) {
            case SHOW_AT_SCREEN.PURCHASE_ORDER_FORM_EDITOR:
                return renderModalAtPurchaseOrderFormEditor()
            case SHOW_AT_SCREEN.INVENTORY_LIST:
                return renderModalAtInventoryList()
            case SHOW_AT_SCREEN.TRANSFER_TO_BRANCH:
            case SHOW_AT_SCREEN.TRANSFER_TO_PARTNER:
                return renderModalAtTransferToBranchOrPartner()
        }
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

    const renderModalAtPurchaseOrderFormEditor = () => {
        return (
            <Modal isOpen={ toggle } toggle={ handleToggle } className="imei-serial-modal" size="xl">
                <div className="error-toast">
                    { stErrorToast.error }
                </div>
                <ModalHeader toggle={ handleToggle }>
                    <div className="product-translate__titleHeader">
                        <p>{ i18next.t('page.product.allProduct.productDetail.add.IMEISerial') }</p>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="d-flex">
                        {
                            !!stSelectedBranchIds.length &&
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
                                                {
                                                    stSelectedBranchIds.map(id => {
                                                        const branchesAndSerialList = stBranchesAndSerials.find(b => b.branchId == id)

                                                        return (
                                                            <td key={ id }>
                                                                <AvForm
                                                                    className="in-purchase"
                                                                    autoComplete="off"
                                                                >
                                                                    <div className="input-code">
                                                                        {
                                                                            <QuantityLabel>
                                                                                <GSTrans
                                                                                    t="component.managedInventoryModal.quantity.add"
                                                                                    values={ {
                                                                                        currentQty: branchesAndSerialList?.serial.length || 0,
                                                                                        maxQty: maxQuantity
                                                                                    } }/>
                                                                            </QuantityLabel>
                                                                        }
                                                                        <AvField
                                                                            id={ `input-serial-${ id }` }
                                                                            className={ [`input-serial-${ id }`, disabled ? 'disabled' : ''].join(' ') }
                                                                            name="serial"
                                                                            placeholder={ i18next.t('component.managedInventoryModal.hint') }
                                                                            validate={ {
                                                                                ...FormValidate.maxLength(65)
                                                                            } }
                                                                            onKeyPress={ e => handleInputCode(e, id) }
                                                                        />
                                                                    </div>
                                                                    <div className="code in-purchase">
                                                                        {
                                                                            branchesAndSerialList?.serial?.map((serial, index) => {
                                                                                return (
                                                                                    <div key={ index }
                                                                                         className="content">
                                                                                        <p>{ serial }</p>
                                                                                        <i onClick={ () => handleDeleteSerial(id, serial) }
                                                                                           className="fa fa-times"></i>
                                                                                    </div>
                                                                                )
                                                                            })
                                                                        }
                                                                    </div>
                                                                </AvForm>
                                                            </td>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        }
                        {
                            !!stSelectedBranchIds.length &&
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
                                        {
                                            stSelectedBranchIds.map(id => {
                                                const branchesAndSerialList = stBranchesAndSerials.find(b => b.branchId == id)

                                                return (
                                                    <td key={ id }>
                                                        <AvForm
                                                            className="in-purchase"
                                                            autoComplete="off"
                                                        >
                                                            <div className="input-code">
                                                                {
                                                                    <QuantityLabel>
                                                                        <GSTrans
                                                                            t="component.managedInventoryModal.quantity.add"
                                                                            values={ {
                                                                                currentQty: branchesAndSerialList?.serial.length || 0,
                                                                                maxQty: maxQuantity
                                                                            } }/>
                                                                    </QuantityLabel>
                                                                }
                                                                <AvField
                                                                    id={ `input-serial-${ id }` }
                                                                    className={ [`input-serial-${ id }`, disabled ? 'disabled' : ''].join(' ') }
                                                                    name="serial"
                                                                    placeholder={ i18next.t('component.managedInventoryModal.hint') }
                                                                    validate={ {
                                                                        ...FormValidate.maxLength(65)
                                                                    } }
                                                                    onKeyPress={ e => handleInputCode(e, id) }
                                                                />
                                                            </div>
                                                            <div className="code in-purchase">
                                                                {
                                                                    branchesAndSerialList?.serial?.map((serial, index) => {
                                                                        return (
                                                                            <div key={ index } className="content">
                                                                                <p>{ serial }</p>
                                                                                {
                                                                                    !disabled &&
                                                                                    <i onClick={ () => handleDeleteSerial(id, serial) }
                                                                                       className="fa fa-times"/>
                                                                                }
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </AvForm>
                                                    </td>
                                                )
                                            })
                                        }
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        }
                        {
                            !stSelectedBranchIds.length && renderNoBranchTable()
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

    const renderModalAtInventoryList = () => {
        return (
            <Modal isOpen={ toggle } toggle={ handleToggle } className="imei-serial-modal" size="xl">
                <div className="error-toast">
                    { stErrorToast.error }
                </div>
                <ModalHeader toggle={ handleToggle }>
                    <div className="product-translate__titleHeader">
                        <p>{ i18next.t('component.managedInventoryModal.title.update') }</p>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="branch">
                        <h3>
                            <GSTrans t="page.home.card.branchFilter.title"/>
                        </h3>
                        <GSDropdownMultipleSelect
                            key={ stSelectedBranchIds }
                            items={ branchList.map(branch => (
                                { label: branch.name, value: branch.id }
                            )) }
                            name="branches"
                            selected={ stSelectedBranchIds }
                            headerSelectedI18Text={ 'page.product.create.updateStockModal.selectedBranches' }
                            headerSelectedAllText={ 'page.product.create.updateStockModal.selectedBranches' }
                            className="product-multiple-branch-stock_editor_modal__mlp-select"
                            onChange={ handleChangeBranches }
                            position="bottomLeft"
                        />
                    </div>
                    <div className="d-flex">
                        {
                            !!stSelectedBranchIds.length
                            && <div className="table left">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>{ i18next.t('page.order.detail.confirm.imei.modal.productName') }</th>
                                        {
                                            modelLabel.split('|').map(l => <th>{ l }</th>)
                                        }
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td>
                                            <ProductNameLabel>{ productName }</ProductNameLabel>
                                        </td>
                                        {
                                            modelName.split('|').map(n =>
                                                <td>
                                                    <ProductNameLabel>{ n }</ProductNameLabel>
                                                </td>
                                            )
                                        }
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        }
                        {
                            !!stSelectedBranchIds.length &&
                            <div className="table right">
                                <table>
                                    <thead>
                                    <tr>
                                        {
                                            stSelectedBranchIds?.map(id => {
                                                const branch = branchList.find(b => b.id === id)

                                                return (
                                                    <th key={ branch?.id }>{ branch?.name }</th>
                                                )
                                            })
                                        }
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        {
                                            stSelectedBranchIds.map(id => {
                                                const branchesAndSerialList = stBranchesAndSerials.find(b => b.branchId == id)

                                                return (
                                                    <td key={ id }>
                                                        <AvForm
                                                            autoComplete="off"
                                                        >
                                                            <div className="input-code">
                                                                <AvField
                                                                    id={ `input-serial-${ id }` }
                                                                    className={ [`input-serial-${ id }`, disabled ? 'disabled' : ''].join(' ') }
                                                                    name="serial"
                                                                    placeholder={ i18next.t('component.managedInventoryModal.hint') }
                                                                    validate={ {
                                                                        ...FormValidate.maxLength(65)
                                                                    } }
                                                                    onKeyPress={ e => handleInputCode(e, id) }
                                                                />
                                                            </div>
                                                            <div className="code">
                                                                {
                                                                    branchesAndSerialList?.serial?.map((serial, index) => {
                                                                        return (
                                                                            <div key={ index } className="content">
                                                                                <p>{ serial }</p>
                                                                                <i onClick={ () => handleDeleteSerial(id, serial) }
                                                                                   className="fa fa-times"></i>
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </AvForm>
                                                    </td>
                                                )
                                            })
                                        }
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        }
                        {
                            !stSelectedBranchIds.length && renderNoBranchTable()
                        }
                    </div>
                </ModalBody>

                <ModalFooter>
                    <GSButton onClick={ handleToggle }>
                        <GSTrans t={ 'common.btn.cancel' }/>
                    </GSButton>
                    <GSButton success marginLeft onClick={ handleSave }>
                        <GSTrans t={ 'common.btn.save' }/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }

    const renderModalAtTransferToBranchOrPartner = () => {
        return (
            <SelectIMEISerialModal
                { ...props }
            />
        )
    }

    return (
        renderModalAtScreen()
    )
}

IMEISerialModal.mapSaveDataToItemModelCodes = function (itemId, modelId, itemModelCodes = [], data) {
    const result = []

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

IMEISerialModal.mapSaveDataToInventoryList = function (itemId, modelId, oldItemModelCodes, data) {
    return data.map(({ branchId, serial }) => ({
        branchId: branchId,
        inventoryCurrent: oldItemModelCodes.filter(i => i.itemId === itemId && i.modelId === modelId && i.branchId === branchId).length,
        inventoryStock: serial.length,
        inventoryType: InventoryEnum.ACTIONS.SET_STOCK
    }))
}

IMEISerialModal.SHOW_AT_SCREEN = SHOW_AT_SCREEN

IMEISerialModal.defaultProps = {
    selectedBranchIds: [],
    branchList: [],
    currentScreen: SHOW_AT_SCREEN.PURCHASE_ORDER_FORM_EDITOR,
    modelLabel: '',
    modelName: '',
    itemModelCodes: [],
    onToggle: function () {
    },
    onCancel: function () {
    },
    onSave: function () {
    }
}

IMEISerialModal.propTypes = {
    toggle: bool,
    disabled: bool,
    itemId: number.isRequired,
    selectedBranchIds: arrayOf(number),
    branchList: arrayOf(shape({
        id: number,
        name: string
    })),
    currentScreen: oneOf(Object.values(SHOW_AT_SCREEN)).isRequired,
    productName: string,
    modelLabel: string,
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


export default IMEISerialModal

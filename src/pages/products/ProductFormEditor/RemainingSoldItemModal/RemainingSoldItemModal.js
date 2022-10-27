import './RemainingSoldItemModal.sass'
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import React, {useEffect, useState} from "react";
import {array, arrayOf, bool, func, number, object, shape, string} from "prop-types";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSDropDownButton, {GSDropdownItem} from "../../../../components/shared/GSButton/DropDown/GSDropdownButton";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import AvCustomCheckbox from "../../../../components/shared/AvCustomCheckbox/AvCustomCheckbox";
import {AvForm} from 'availity-reactstrap-validation';
import i18next from "i18next";
import Constants from "../../../../config/Constant";

const ALL_BRANCH = {
    NAME: 'ALL_BRANCH',
    LABEL: 'All Branch'
}

const DEPOSIT = {
    LABEL: i18next.t('page.product.create.variation.deposit'),
}

const RemainingSoldItemModal = (props) => {
    const {isToggle, item, branchList, modalType, onClose} = props

    const [stSelected, setStSelected] = useState([]);
    const [stBranchData, setStBranchData] = useState([]);
    const [stOrgBranchData, setStOrgBranchData] = useState([]);
    const [stSelectedAllBranch, setStSelectedAllBranch] = useState(true);
    const [stError, setStError] = useState('');

    useEffect(() => {
        if (!item || !isToggle) {
            return
        }

        const branchData = branchList.map(branch => ({
            id: branch.id,
            name: branch.name,
            value: getValueByBranchId(branch.id)
        }))

        setStBranchData(branchData)
        setStOrgBranchData(branchData)
        setStSelected(branchList.map(branch => branch.id))
        setStSelectedAllBranch(true)
    }, [branchList, item, isToggle])

    useEffect(() => {
        let filterBranches = []

        setStError('')

        if (stSelected.length) {
            stSelected.forEach(selected => {
                const branch = stOrgBranchData.find(branch => branch.id === selected)

                if (!branch) {
                    return
                }

                filterBranches.push(branch)
            })
        } else {
            setStError('component.RemainingSoldItemModal.error.noBranch')
        }

        setStSelectedAllBranch(stSelected.length === branchList.length)
        setStBranchData(filterBranches)
    }, [stSelected])

    const getValueByBranchId = (branchId) => {
        if (item.hasModel) {
            return item.models.map(model => {
                const labels = model.label.split('|')
                const names = model.orgName.split('|')
                const models = labels.map((label, i) => ({
                    label: label === Constants.DEPOSIT_CODE.CODE ? DEPOSIT.LABEL : label,
                    name: names[i] === Constants.DEPOSIT_CODE.FULL ? '' : names[i],
                }))

                const branchInventory = model.branches.find(inv => inv.branchId === branchId)

                if (!branchInventory) {
                    return {
                        models,
                        value: 0
                    }
                }

                return {
                    models,
                    value: (modalType === RemainingSoldItemModal.MODAL_TYPE.REMAINING_STOCK ? branchInventory.totalItem : branchInventory.soldItem) || 0
                }
            })
        }

        const branchInventory = item.branches.find(inv => inv.branchId === branchId)

        if (!branchInventory) {
            return 0
        }

        return (modalType === RemainingSoldItemModal.MODAL_TYPE.REMAINING_STOCK ? branchInventory.totalItem : branchInventory.soldItem) || 0
    }

    const toggle = () => {
        onClose()
    }

    const onSelect = (e) => {
        const {name, value} = e.currentTarget

        if (value) {
            const fillSelected = stOrgBranchData.filter(branch => stSelected.includes(branch.id) || branch.id === name).map(branch => branch.id)

            setStSelected(fillSelected)
        } else {
            const index = stSelected.findIndex(selected => selected === name)

            setStSelected(selected => {
                selected.splice(index, 1)

                return [...selected]
            })
        }
    }

    const isSelected = (id) => {
        return stSelected.findIndex(selected => selected === id) > -1
    }

    const readyForRender = () => {
        if (!stBranchData || !stBranchData.length || !stBranchData[0].value || !stBranchData[0].value.length) {
            return false
        }

        return true
    }

    const onSelectAllBranch = (e) => {
        const {value} = e.currentTarget

        if (value) {
            setStSelectedAllBranch(true)
            setStSelected(branchList.map(branch => branch.id))
        } else {
            setStSelectedAllBranch(false)
            setStSelected([])
        }
    }

    const renderCommonTable = () => {
        return (
            <div className='remaining-sold-item-modal__body__common__table'>
                <table className='remaining-sold-item-modal__body__table'>
                    <tbody>
                    {stBranchData.map(row => (
                        <tr key={Math.random()}>
                            <td className='remaining-sold-item-modal__body__table--name'>{row.name}</td>
                            <td>{row.value}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )
    }

    const renderHasModelTable = () => {
        return (
            <>
                {readyForRender() && <div className='remaining-sold-item-modal__body__variable-table'>

                    {/*MODEL TABLE*/}
                    <div className='remaining-sold-item-modal__body__model__table'>
                        <table className='remaining-sold-item-modal__body__table table-small'>
                            <thead>
                            <tr>
                                {
                                    stBranchData[0].value[0].models.map(model => (
                                        <th>{model.label}</th>
                                    ))
                                }
                            </tr>
                            </thead>
                            <tbody>
                            {
                                stBranchData[0].value.map(branch => (
                                    <tr>
                                        {
                                            branch.models.map(model => (
                                                <td>{model.name}</td>
                                            ))
                                        }
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>

                    {/*BRANCH TABLE*/}
                    <div className='remaining-sold-item-modal__body__branch__table'>
                        <table className='remaining-sold-item-modal__body__table'>
                            <thead>
                            <tr>
                                {
                                    stBranchData.map(branch => (
                                        <th>{branch.name}</th>
                                    ))
                                }
                            </tr>
                            </thead>
                            <tbody>
                            {
                                stBranchData[0].value.map((v, i) => (
                                    <tr>
                                        {
                                            stBranchData.map(branch => (
                                                <td className='text-center'>{branch.value[i].value}</td>
                                            ))
                                        }
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>}
            </>
        )
    }

    return (
        <Modal isOpen={isToggle} className='remaining-sold-item-modal' size='xl'>
            <ModalHeader toggle={toggle} className="remaining-sold-item-modal__header">
                <GSTrans t={
                    modalType === RemainingSoldItemModal.MODAL_TYPE.REMAINING_STOCK
                        ? 'component.RemainingSoldItemModal.remaining.title'
                        : 'component.RemainingSoldItemModal.sold.title'
                }/>
            </ModalHeader>
            <ModalBody className="remaining-sold-item-modal__body">
                <GSDropDownButton className='remaining-sold-item-modal__body__dropdown' button={
                    ({onClick}) => (
                        <GSButton default
                                  dropdownIcon
                                  onClick={onClick}
                        >
                            <GSTrans values={{quantity: stSelected.length}}
                                     t={stSelected.length === branchList.length
                                         ? "component.RemainingSoldItemModal.allBranch"
                                         : "component.RemainingSoldItemModal.selected"}/>
                        </GSButton>)
                }>
                    <GSDropdownItem className='remaining-sold-item-modal__body__dropdown--item'>
                        <AvForm>
                            <AvCustomCheckbox
                                key={stSelectedAllBranch}
                                classWrapper='p-2'
                                name={ALL_BRANCH.NAME}
                                color="blue"
                                label={ALL_BRANCH.LABEL}
                                value={stSelectedAllBranch}
                                onChange={onSelectAllBranch}
                            />
                            {
                                branchList.map(branch => (
                                    <AvCustomCheckbox
                                        key={branch.id + '-' + isSelected(branch.id)}
                                        classWrapper='p-2'
                                        name={branch.id}
                                        color="blue"
                                        label={branch.name}
                                        value={isSelected(branch.id)}
                                        onChange={onSelect}
                                    />
                                ))
                            }
                        </AvForm>
                    </GSDropdownItem>
                </GSDropDownButton>
                {
                    !item.hasModel
                        ? renderCommonTable()
                        : renderHasModelTable()
                }
                <div className='remaining-sold-item-modal__body__error'><GSTrans t={stError}/></div>
            </ModalBody>
        </Modal>
    )
}

RemainingSoldItemModal.defaultProps = {
    isToggle: false,
    branchList: [],
    onClose: function () {
    }
}

RemainingSoldItemModal.propTypes = {
    isToggle: bool,
    item: shape({
        id: number,
        createdDate: string,
        lastModifiedDate: string,
        name: string,
        currency: string,
        description: string,
        cateId: number,
        categories: [
            {
                id: number,
                cateId: number,
                level: number,
                itemId: number
            }
        ],
        author: {
            userId: number,
            displayName: string,
            avatarImage: {
                imageUUID: string,
                urlPrefix: string,
                extension: string,
                id: number
            },
            type: string,
            city: string,
            rate: number,
            hideChat: bool
        },
        itemType: string,
        orgPrice: number,
        discount: number,
        newPrice: number,
        bcoin: number,
        commissionPercent: number,
        commissionAmount: number,
        hasCommission: bool,
        totalItem: number,
        soldItem: number,
        totalSoldItem: number,
        images: arrayOf(object),
        shippingInfo: {
            id: number,
            weight: number,
            width: number,
            height: number,
            length: number,
            itemId: number,
            freeShippingV2: {
                enable: bool
            },
            deliveryProviders: [
                {
                    storeId: number,
                    providerName: string,
                    allowedLocations: arrayOf(string)
                }
            ]

        },
        deleted: bool,
        models: [
            {
                id: number,
                name: string,
                sku: string,
                orgPrice: number,
                discount: number,
                newPrice: number,
                totalItem: number,
                soldItem: number,
                quantityChangedDate: string,
                commissionPercent: string,
                commissionAmount: string,
                itemId: string,
                label: string,
                orgName: string,
                description: string,
                barcode: string,
                versionName: string,
                useProductDescription: bool,
                newStock: number,
                lstInventory: arrayOf(shape({
                    branchId: number,
                    inventoryActionType: number,
                    inventoryCurrent: number,
                    inventoryStock: number,
                    inventoryType: string
                }))
            }
        ],
        hasModel: bool,
        parentSku: string,
        isSelfDelivery: bool,
        priority: number,
        showOutOfStock: bool,
        lstInventory: arrayOf(shape({
            branchId: number,
            inventoryActionType: number,
            inventoryCurrent: number,
            inventoryStock: number,
            inventoryType: string
        }))
    }),
    modalType: string,
    branchList: array,
    onClose: func,
}

RemainingSoldItemModal.MODAL_TYPE = {
    REMAINING_STOCK: 'REMAINING_STOCK',
    SOLD_COUNT: 'SOLD_COUNT'
}

export default RemainingSoldItemModal

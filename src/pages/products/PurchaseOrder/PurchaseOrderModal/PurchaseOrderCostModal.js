import React, {useEffect, useRef, useState} from 'react'
import {AvField, AvForm} from "availity-reactstrap-validation";
import {FormValidate} from "../../../../config/form-validate";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {arrayOf, func, number, oneOf, shape, string} from "prop-types";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import i18next from "i18next";
import {CurrencyUtils} from "../../../../utils/number-format";
import ModalFooter from "reactstrap/es/ModalFooter";
import _ from "lodash";
import Constants from "../../../../config/Constant";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";

const PurchaseOrderCostModal = props => {
    const {openModalPrice, closeModalPrice, getListCost, purchaseCosts, editorMode, currency, ...others} = props;

    const [stListCostNameModal, setStListCostNameModal] = useState([{name: "", costValue: 0}]);
    const [stListCostName, setStListCostName] = useState([]);
    const [stTotalCostModal, setStTotalCostModal] = useState(0);
    const [stTotalCost, setStTotalCost] = useState(0);
    const [checkCurrencyVN, setCheckCurrencyVN] = useState(true)

    const refCostForm = useRef()

    useEffect(() => {
        if (!purchaseCosts || !purchaseCosts.length) {
            return
        }
        let total = purchaseCosts.reduce((total, value) => {
            return total + +(value.costValue)
        }, 0)
        setListCostAndTotal(purchaseCosts,total)
        setListCostAndTotalInModal(purchaseCosts,total)
        getListCost(total, purchaseCosts)
    }, [purchaseCosts])

    useEffect(() => {
        if(currency !== Constants.CURRENCY.VND.SYMBOL && currency !== Constants.CURRENCY.VND.SYMBOL){
            setCheckCurrencyVN(false)
        }
    }, [])

    const setListCostAndTotal = (listCost,total) =>{
        setStListCostName(listCost)
        setStTotalCost(total)
    }

    const setListCostAndTotalInModal = (listCost,total) =>{
        setStListCostNameModal(listCost)
        setStTotalCostModal(total)
    }

    const handleCancelPriceModal = (e) => {
        e.preventDefault(); // avoid fire submit action

        if (stListCostName.length < 1) {
            setStListCostNameModal([{name: "", costValue: 0}])

        } else {
            setStListCostNameModal(_.cloneDeep(stListCostName))
        }
        setStTotalCostModal(stTotalCost)
        closeModalPrice(false)
    }


    const handleSubmitPrice = () => {
        setListCostAndTotal(_.cloneDeep(stListCostNameModal),stTotalCostModal)
        closeModalPrice(false)
        getListCost(stTotalCostModal, _.cloneDeep(stListCostNameModal))
    }

    const handleChangeDataListCost = (e, index) => {
        if (editorMode === Constants.PURCHASE_ORDER_MODE.WIZARD) {
            return
        }

        if (e.currentTarget.name === 'codeName-' + index) {
            stListCostNameModal[index].name = e.currentTarget.value
            setStListCostNameModal(_.cloneDeep(stListCostNameModal))
            return
        }
        stListCostNameModal[index].costValue = e.currentTarget.value
        setStListCostNameModal(_.cloneDeep(stListCostNameModal))

        let total = stListCostNameModal.reduce((total, value) => {
            return total + +(value.costValue)
        }, 0)
        setStTotalCostModal(total)
    }

    const handleDeleteCostName = (index) => {
        if (stListCostNameModal.length > 1) {
            stListCostNameModal.splice(index, 1)
            let total = stListCostNameModal.reduce((total, value) => {
                return total + +(value.costValue)
            }, 0)
            setListCostAndTotalInModal([...stListCostNameModal],total)
        }
    }

    const handleAddCostName = () => {
        setStListCostNameModal([...stListCostNameModal, {name: "", costValue: 0}])
    }

    return (
        <>
            <Modal isOpen={openModalPrice} className="modal-discount">
                <ModalHeader toggle={handleCancelPriceModal}>
                    {
                        editorMode === Constants.PURCHASE_ORDER_MODE.WIZARD && i18next.t("page.purchaseOrderFormEditor.table.modalCost.title")
                    }
                    {
                        editorMode === Constants.PURCHASE_ORDER_MODE.CREATE && i18next.t("page.purchaseOrderFormEditor.table.modalCost.title")
                    }
                    {
                        editorMode === Constants.PURCHASE_ORDER_MODE.EDIT && i18next.t("page.purchaseOrderFormEditor.table.modalCost.title")
                    }
                </ModalHeader>
                <ModalBody>
                    <AvForm
                        ref={refCostForm}
                        onValidSubmit={handleSubmitPrice}
                    >
                        <div className="pl-4 pr-4">


                            <div className="list-price">
                                <h3>
                                    <GSTrans t='page.purchaseOrderFormEditor.table.summary.costName'/>
                                </h3>

                                {
                                    stListCostNameModal.map((codeName, index) => {
                                        return (
                                            <div key={index} className="d-flex mb-3">
                                                <div className="list-price-content">
                                                    <AvField
                                                        disabled={editorMode === Constants.PURCHASE_ORDER_MODE.WIZARD}
                                                        className="code-name"
                                                        value={codeName.name}
                                                        name={"codeName-" + index}
                                                        placeholder={i18next.t('page.purchaseOrderFormEditor.table.summary.costName')}
                                                        validate={{
                                                            ...FormValidate.required(),
                                                            ...FormValidate.maxLength(30),
                                                        }}
                                                        onChange={(e) => {
                                                            handleChangeDataListCost(e, index)
                                                        }}

                                                    />
                                                    <AvFieldCurrency
                                                        disabled={editorMode === Constants.PURCHASE_ORDER_MODE.WIZARD}
                                                        className="price"
                                                        name={"price-" + index}
                                                        value={codeName.costValue}
                                                        placeholder={CurrencyUtils.formatMoneyByCurrency(0, currency)}
                                                        type="number"
                                                        validate={{
                                                            ...FormValidate.required(),
                                                            ...FormValidate.minValue(0),
                                                            ...FormValidate.maxValue(999_999_999, true)
                                                        }}
                                                        onChange={(e) => {
                                                            handleChangeDataListCost(e, index)
                                                        }}
                                                        precision={!checkCurrencyVN && '2' }
                                                        decimalScale={!checkCurrencyVN &&  2 }

                                                    />
                                                </div>
                                                {
                                                    editorMode !== Constants.PURCHASE_ORDER_MODE.WIZARD && <div className="d-flex align-items-center">
                                                        {
                                                            index > 0 ?
                                                                <div className="detele-code" onClick={() => {
                                                                    handleDeleteCostName(index)
                                                                }}>
                                                                    <img
                                                                        src="https://dm4fv4ltmsvz0.cloudfront.net/storefront-images/haiphungicon/Icon-ionic-ios-close.svg"
                                                                        alt="Icon-ionic-ios-close"/>
                                                                </div>
                                                                :
                                                                <div className="detele-code"
                                                                     style={{"marginLeft": "27.5px"}}>

                                                                </div>
                                                        }
                                                    </div>
                                                }
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            {
                                editorMode !== Constants.PURCHASE_ORDER_MODE.WIZARD && <div className="add-code">
                                    <div onClick={handleAddCostName}>
                                        <div className="img"></div>
                                        <GSTrans t='page.purchaseOrderFormEditor.table.summary.addCost'/>
                                    </div>
                                </div>
                            }
                            <div className="total-cost">
                                <p className="title m-0">
                                    <GSTrans t='page.purchaseOrderFormEditor.table.summary.totalCost'/>:
                                </p>
                                <p className="price m-0">
                                    {CurrencyUtils.formatMoneyByCurrency(stTotalCostModal, currency)}
                                </p>
                            </div>
                        </div>
                        {
                            editorMode !== Constants.PURCHASE_ORDER_MODE.WIZARD && <ModalFooter>
                                <GSButton default
                                          onClick={handleCancelPriceModal}

                                >
                                    <GSTrans t={"common.btn.cancel"}/>
                                </GSButton>
                                <GSButton success marginLeft onClick={e => {
                                    e.preventDefault()
                                    refCostForm.current.submit()
                                }}>
                                    <GSTrans t={editorMode === Constants.PURCHASE_ORDER_MODE.CREATE ? "common.btn.add" : 'common.btn.update'}/>
                                </GSButton>
                            </ModalFooter>
                        }
                    </AvForm>
                </ModalBody>

            </Modal>
        </>
    )
}

PurchaseOrderCostModal.defaultProps = {
    editorMode: Constants.PURCHASE_ORDER_MODE.CREATE,
    purchaseCosts: [],
    currency: CurrencyUtils.getLocalStorageSymbol()
}

PurchaseOrderCostModal.propTypes = {
    editorMode: oneOf(Object.keys(Constants.PURCHASE_ORDER_MODE)),
    purchaseCosts: arrayOf(shape({
        name: string,
        costValue: number
    })),
    closeModalPrice: func,
    getListCost: func,
    currency: string
}

export default PurchaseOrderCostModal

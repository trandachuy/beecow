import React, {useEffect, useState} from "react";
import ModalHeader from "reactstrap/es/ModalHeader";
import GSButton from "../GSButton/GSButton";
import {Trans} from "react-i18next";
import ModalBody from "reactstrap/es/ModalBody";
import {UikCheckbox, UikFormInputGroup} from "../../../@uik";
import Modal from "reactstrap/es/Modal";
import i18next from "i18next";
import GSActionButton, {GSActionButtonIcons,} from "../GSActionButton/GSActionButton";
import './AddVariationModal.sass';
import {ItemUtils} from "../../../utils/item-utils";
import _ from 'lodash';

const AddVariationModal = (props) => {
    const [stHasVariations, setStHasVariations] = useState(false);

    const [defaultPrice, setDefaultPrice] = useState(0);
    const [allSelectedVarIds, setAllSelectedVarIds] = useState([
        ...props.allSelectedVarIds,
    ]);
    const [models, setModels] = useState([
        ...props.models,
    ]);
    const [stSelectedByModels, setStSelectedByModels] = useState([
        ...props.selectedByModel,
    ]);
    const [stCheckAllValue, setStCheckAllValue] = useState(false);
    const [checkErrs, setCheckErrs] = useState("")

    useEffect(()=>{
        if(props.hasModel) setStHasVariations(true)
        if(props.models) setModels(props.models)
        if(props.selectedByModel){
            let item = props.models.find(r => r.id === props.selectedByModel[0])
            if(item){
                setDefaultPrice(item.newPrice)
            }
        }
    },[])

    const onClose = (selectType) => {
        if (props.onClose) {
          props.onClose(selectType === "cancel" ? null : stSelectedByModels);
        }
    };

    const handleCheckPriceInModels = (segmentIds, newPrice) => {
        let err = ''
        let data = models.filter(r => segmentIds.includes(r.id))
        const checkPrice = data.some( (r) => r.newPrice !== data[0].newPrice )
        if(checkPrice) err = i18next.t('component.wholesalePrice.configure.must_have_same_price_to_add_wholesale')
        else{
            if(parseFloat(newPrice) < parseFloat(defaultPrice)){
                err = i18next.t('component.wholesalePrice.error.wholesale_price_higher_sale_price')
            }
        }
        return err
    }

    const selectAll = (value, checked) => {
        let listSegmentByModels = [...stSelectedByModels];
        let err = ''
        if(checked){
            let litsIds = []
            if(allSelectedVarIds){
                let availableVars = models.filter(r => !allSelectedVarIds.includes(r.id))
                if(availableVars) litsIds = availableVars
            }else{
                litsIds = models
            }
            for (const {id} of litsIds ){
                listSegmentByModels.push(id)
            }
            let priceErr = handleCheckPriceInModels(listSegmentByModels)
            if(priceErr){
                setCheckErrs(priceErr)
                return
            }
            setStCheckAllValue(true)
        }else{
            listSegmentByModels = []
            setStCheckAllValue(false)
            setCheckErrs(i18next.t('component.wholesalePrice.error.has.no.variation'))
        }
        setCheckErrs(err)
        setStSelectedByModels(listSegmentByModels)
    }
    const onSelect = (id, newPrice, checked, itemId) => {
        let error = ""
        let status = false
        let listSegmentByModels = [...stSelectedByModels]
        if (checked) {
            listSegmentByModels.push(id)
        } else {
            listSegmentByModels = listSegmentByModels.filter((p) => p !== id);
        }
        setStSelectedByModels(listSegmentByModels)
        setAllSelectedVarIds(prev =>{
            prev = prev.filter((p) => p !== id)
            return [...prev]
        })
        if(listSegmentByModels.length === 0){
            error = i18next.t('component.wholesalePrice.error.has.no.variation')
        }else{
            if(checked){
                let totalSegmentSelected = _.cloneDeep(allSelectedVarIds)
                if(props.models.length === totalSegmentSelected.length + 1){
                    status = true
                }
            }else{
                status = false
            }
            error = handleCheckPriceInModels(listSegmentByModels, newPrice)
        }
        setStCheckAllValue(status)
        setCheckErrs(error)
    };

    return(
        <>
        {stHasVariations &&
            <Modal isOpen={stHasVariations} className="select-variation-modal modal-mw-500px modal-v2">
            {/* check width modal for responsive*/}
                <ModalHeader
                    close={
                        <div className="mobile-header-btn d-mobile-flex d-desktop-none">
                            <i
                                className="btn-close__icon  d-mobile-none d-desktop-inline"
                                onClick={() => onClose("cancel")}
                            />
                            <GSButton
                                success
                                marginRight
                                onClick={() => onClose("select")}
                            >
                                <Trans i18nKey="common.btn.ok" />
                            </GSButton>
                            <GSButton secondary outline onClick={() => onClose("cancel")}>
                                <Trans i18nKey="common.btn.cancel" />
                            </GSButton>
                        </div>
                    }
                    className="d-flex justify-content-around"
                >
                    <h5 className="text-dark"><Trans i18nKey="component.product.addNew.variations.add" /></h5>
                    <span className="font-size-14px font-weight-normal">

                        <GSActionButton
                            icon={GSActionButtonIcons.CLOSE}
                            width={"1rem"}
                            style={{ marginLeft: "1rem" }}
                            onClick={() => onClose("cancel")}
                            className="d-mobile-none d-desktop-inline-block"
                        />
                    </span>
                </ModalHeader>
                {checkErrs && (
                    <div className="text-danger ml-3 mr-3 border-top pt-3 mb-0">
                        <p className="mb-0">{checkErrs}</p>
                        {/* <GSTrans
                            t="component.wholesalePrice.configure.must_have_same_price_to_add_wholesale"
                        /> */}
                    </div>
                )}

                <ModalBody className="p-3">
                    <section className="gs-atm__scrollbar-1 modal-group-content border bg-lotion">
                        <div className="bg-bright-gray d-block p-2 pt-3 border-bottom">
                            <UikCheckbox
                                name="check_all"
                                className="select-segment-row__discount d-flex justify-content-start font-weight-bold"
                                checked={stCheckAllValue}
                                onChange={(e) => selectAll('ALL', e.currentTarget.checked)} // have not finished, notes: check all by group models
                                disabled={models.length === allSelectedVarIds.length?true:false}
                                label={i18next.t('page.setting.shippingAndPayment.selectProvinces.selectAll')}
                            />
                        </div>
                        <div className="product-list pl-2 pt-3">
                            <UikFormInputGroup>
                                {props.models.map((item, index) => {
                                    let isCheckedBtn = false
                                    let isEnabledBtn = true
                                    let segment = allSelectedVarIds.includes(item.id)
                                    const isSelectedByModel = stSelectedByModels.includes(item.id)
                                    if(isSelectedByModel){
                                        isCheckedBtn = true
                                    }else{
                                        if(segment) isEnabledBtn = false
                                    }
                                    return(
                                        <section
                                        key={item.id + "_" + index}
                                        className="gs-table-body-items d-flex justify-content-start"
                                        >
                                        <div className="gs-table-body-item pl-0">
                                            <UikCheckbox
                                                defaultChecked={props.isExist}
                                                className="select-segment-row__discount"
                                                disabled={isEnabledBtn ? false : true}
                                                checked={isCheckedBtn ? true : false}
                                                onClick={(e) => onSelect(item.id, item.newPrice, e.currentTarget.checked, item.itemId)}
                                                label={
                                                    <div className="segment-name">
                                                        {/* <span>{item.orgName}-{item.id}-{item.newPrice}</span> */}
                                                        <span>
                                                            {ItemUtils.escape100Percent(item.orgName)}
                                                        </span>
                                                    </div>
                                                }
                                                name="rgroup"
                                            />
                                        </div>
                                        </section>
                                    )
                                })}

                            </UikFormInputGroup>
                        </div>
                    </section>
                    <div className="gs-atm__flex-row--flex-end footer-btn d-mobile-none d-desktop-flex justify-content-center mt-3">
                        <GSButton
                            secondary
                            outline
                            style={{ minWidth: "6rem" }}
                            onClick={() => onClose("cancel")}
                        >
                            <Trans i18nKey="common.btn.cancel" />
                        </GSButton>

                        <GSButton
                            success
                            style={{ minWidth: "6rem", marginLeft: ".5rem" }}
                            onClick={() => onClose("select")}
                            disabled={checkErrs}
                        >
                            <Trans i18nKey="common.btn.ok" />
                        </GSButton>
                    </div>

                </ModalBody>
            </Modal>
        }
        </>
    );
}
export default AddVariationModal;

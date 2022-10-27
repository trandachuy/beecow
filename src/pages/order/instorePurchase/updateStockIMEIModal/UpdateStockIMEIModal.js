import React, {useCallback, useEffect, useRef, useState} from 'react';
import { useLocation } from "react-router-dom";
import "./UpdateStockIMEIModal.sass"
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import i18next from "i18next";
import {AvField, AvForm} from "availity-reactstrap-validation";
import {FormValidate} from "../../../../config/form-validate";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import PropTypes, {array, bool, func, number, object, string} from "prop-types";
import {ItemService} from "../../../../services/ItemService";
import storeService from "../../../../services/StoreService";
import {ItemUtils} from "../../../../utils/item-utils";
import Constants from "../../../../config/Constant";


function UpdateStockIMEIModal(props) {
    const refValue = useRef(null)

    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    const [stBrancheAndSerialList, setStBrancheAndSerialList] = useState([]);
    const [stSaveManageInventory, setStSaveManageInventory] = useState([]);
    const [stErrorExistSerial, setStErrorExistSerial] = useState({
        error:false,
        value:""
    });
    const [stManageInventoryListModal, setStManageInventoryListModal] = useState([]);
    const [stListAllCode, setStListAllCode] = useState([]);
    const [stListBranch, setStListBranch] = useState([]);
    const [stCurrentStock, setStCurrentStock] = useState(0);


    useEffect(()=>{
        storeService.getActiveStoreBranches()
            .then((result)=>{
                setStListBranch(result)
            })
        const itemId = props.modelId ? [`${props.itemId}-${props.modelId}`] : [`${props.itemId}`]
        ItemService.getCodeByItemModelIds(itemId,Constants.ITEM_MODE_CODE_STATUS.AVAILABLE)
            .then((models)=>{
                let listModelId = []
                models.forEach((model)=>{
                    if (model.branchId == props.branchId){
                        listModelId.push(model.code)
                    }
                })

                setStCurrentStock(listModelId.length)

                setStBrancheAndSerialList(list=>[...list,{
                    branchId:props.branchId,
                    serial:listModelId
                }])

                setStSaveManageInventory(list=>[...list,{
                    branchId:props.branchId,
                    serial:listModelId
                }])
            })

    },[props.isOpenModal])


    const toggle = (e) => {
        e.preventDefault()
        handleShowValidCodeError("",false)
        props.callback()
    };


    const onSearchKeyPress = async (e,branchId) =>{

        if (e.key !== 'Enter') {
            return
        }

        e.preventDefault()

        const value = e.currentTarget.value.trim()

        if (value === "" || stBrancheAndSerialList?.serial?.length >= 1000000){
            return
        }

        const index = stBrancheAndSerialList.findIndex(id => id.branchId === branchId)
        let indexListCode = stListAllCode.findIndex(code=>code.toUpperCase() == value.toUpperCase())

        if(index == -1){
            const checkValidCode = await ItemService.checkValidCode(props.itemId,value);
            if (!checkValidCode|| indexListCode != -1){
                handleShowValidCodeError(value,true)
                return;
            }else {
                setStListAllCode(code=>[...code,value])
                handleShowValidCodeError("",false)
            }

            setStBrancheAndSerialList(list=>[...list,{
                branchId:branchId,
                serial:[value]
            }])
            forceUpdate()
        }else {
            const checkValidCode = await ItemService.checkValidCode(props.itemId,value);
            if (!checkValidCode || indexListCode != -1){
                handleShowValidCodeError(value,true)
                return;
            }else {
                setStListAllCode([value,...stListAllCode])
                handleShowValidCodeError("",false)
            }

            setStBrancheAndSerialList(list=>{
                list[index].serial.unshift(value)
                return list
            })
            forceUpdate()
        }

        setTimeout(()=>{
            handleClearValue(branchId)
        },10)
    }

    const handleSaveManageInventory = () =>{
        if (stBrancheAndSerialList.length > 0){
            setStSaveManageInventory(_.cloneDeep(stBrancheAndSerialList))
            props.onSubmit(_.cloneDeep(stBrancheAndSerialList),stCurrentStock)
            props.callback()

            if(props.indexVariation || props.indexVariation === 0){
                const list = {
                    index:props.indexVariation,
                    brancheAndSerialList:_.cloneDeep(stBrancheAndSerialList)
                }

               const index = stManageInventoryListModal.findIndex(index => index.index === props.indexVariation)
                if(index === -1){
                    setStManageInventoryListModal([list,...stManageInventoryListModal])
                }
            }
            handleShowValidCodeError("",false)
        }else {
            props.callback()
            handleShowValidCodeError("",false)
        }
    }

    const handleCancelManageInventory = () =>{
        setStBrancheAndSerialList(_.cloneDeep(stSaveManageInventory))
        forceUpdate()
        handleShowValidCodeError("",false)
        props.callback()
    }

    const handleDeleteSerial = (branchId, serial) =>{
        const index = stBrancheAndSerialList.findIndex(id => id.branchId === branchId)
        stBrancheAndSerialList[index].serial =  stBrancheAndSerialList[index].serial.filter(imel=>imel != serial)
        setStBrancheAndSerialList(_.cloneDeep(stBrancheAndSerialList))
    }

    const handleClearValue = (branchId) =>{
        document.getElementById(branchId).value =''
    }
    const handleShowValidCodeError = (value,onOff) =>{
        setStErrorExistSerial({
            error:onOff,
            value:value
        })
    }
    return (
        <>
            <Modal isOpen={props.isOpenModal} toggle={handleCancelManageInventory} className=" managed-inventory-modal">
                {stErrorExistSerial.error &&
                    <div dangerouslySetInnerHTML={{__html: i18next.t("component.managedInventoryModal.error.exist",{value:stErrorExistSerial.value})}}  className="errorExist"></div>
                }
                <ModalHeader toggle={handleCancelManageInventory}>
                    <div className="product-translate__titleHeader">
                        <p>{i18next.t("page.product.allProduct.productDetail.add.IMEISerial")}</p>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="table">
                        <table>
                            <thead>
                            <tr>
                                <th>{i18next.t('productList.tbheader.productName')}</th>
                                <th>{stListBranch?.find(branchId => branchId.id === props.branchId)?.name}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>{props?.prodName}
                                    <span className='modelName'>{ItemUtils.escape100Percent(props.modelName)?.replace(/\|/gm, ' | ')}</span>
                                </td>

                                {
                                    <td>
                                        <AvForm
                                            // onValidSubmit={handleValidSubmit}
                                            autoComplete="off"
                                        >
                                            <div className="input-code">
                                                <AvField
                                                    ref={refValue}
                                                    id={props.branchId}
                                                    className="VATmodal__input-field__hint"
                                                    name="serial"
                                                    placeholder={i18next.t('page.order.detail.modal.IMEI/Serial')}
                                                    validate={{
                                                        ...FormValidate.maxLength(65)
                                                    }}
                                                    onKeyPress={e=>onSearchKeyPress(e,props.branchId)}
                                                />
                                            </div>
                                            <div className="code">
                                                {
                                                    stBrancheAndSerialList[0]?.serial?.map((serial,index)=>{
                                                        return(
                                                            <div key={index} className="content">
                                                                <p>{serial}</p>
                                                                <i onClick={()=>handleDeleteSerial(props.branchId,serial)} className="fa fa-times"></i>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </AvForm>
                                    </td>
                                }
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <GSButton
                        onClick={handleCancelManageInventory}
                    >
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                    <GSButton success marginLeft
                        onClick={handleSaveManageInventory}
                    >
                        <GSTrans t={"common.btn.save"}/>
                    </GSButton>
                </ModalFooter>


            </Modal>
        </>
    )
}

UpdateStockIMEIModal.defaultProps = {
}

UpdateStockIMEIModal.propTypes = {
    isOpenModal: bool,
    callback: func,
    prodName: string,
    onSubmit: func,
    branchId:number,
    modelName:string,
    itemId:number
}


export default UpdateStockIMEIModal;

import React, {useCallback, useEffect, useRef, useState} from 'react';
import { useLocation } from "react-router-dom";
import "./ManagedInventoryModal.sass"
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import i18next from "i18next";
import {AvField, AvForm} from "availity-reactstrap-validation";
import {FormValidate} from "../../../../config/form-validate";
import GSDropdownMultipleSelect from "../../../../components/shared/GSDropdownMultipleSelect/GSDropdownMultipleSelect";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import PropTypes from "prop-types";
import {ItemService} from "../../../../services/ItemService";
import Constant from "../../../../config/Constant";


function ManagedInventoryModal(props) {
    const refValue = useRef(null)

    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    const [stSelectedBranches, setStSelectedBranches] = useState([]);
    const [stBrancheAndSerialList, setStBrancheAndSerialList] = useState([]);
    const [stSaveManageInventory, setStSaveManageInventory] = useState([]);
    const [stErrorExistSerial, setStErrorExistSerial] = useState({
        error:false,
        value:""
    });
    const [stManageInventoryListModal, setStManageInventoryListModal] = useState([]);
    const [stShowNameAndLabel, setStShowNameAndLabel] = useState([]);
    const [stListAllCode, setStListAllCode] = useState([]);
    const [stGetAllItemModelCode, setStGetAllItemModelCode] = useState([]);
    useEffect(()=>{
        setStSelectedBranches([])
        setStBrancheAndSerialList([])
        setStManageInventoryListModal([])
    },[props.removeVariation])
    useEffect(() => {
        if (props.mode === 'edit' && props.modeVariation && props.isOpenModal){
            ItemService.getAllItemModelCode(props?.itemId?.itemId ? props.itemId.itemId : +(window.location.pathname.split('/product/edit/').join('')))
                .then(itemModelCodeDTOS=>{
                    const itemModelCode = props?.itemId?.itemId ? itemModelCodeDTOS.filter(item=> item.branchId === props.branchList[0].id) : itemModelCodeDTOS

                   props.models.map(model=>{
                       model.itemModelCodeDTOS = model.itemModelCodeDTOS?.length > 0 ? model.itemModelCodeDTOS : itemModelCode.filter(imc=>imc.itemModelId.split("-").length == 2).filter(imc=> imc.modelId === model.id)
                       return model;
                   })
                    let selectedBranches = []
                    let brancheAndSerialList = []
                    if(props.indexVariation != null && props?.models?.length > 0){
                        if(props.models[props.indexVariation]?.itemModelCodeDTOS){
                            props.models[props.indexVariation].itemModelCodeDTOS.forEach(item=>{
                                const index = selectedBranches.findIndex(branch=> branch === item.branchId)
                                if(index === -1){
                                    selectedBranches.push(item.branchId)
                                    brancheAndSerialList.push({
                                        branchId:item.branchId,
                                        serial:[item.code]
                                    })
                                }else {
                                    brancheAndSerialList[index].serial.push(item.code)
                                }
                            })
                        }
                    }

                    setStSelectedBranches(selectedBranches.length === 0 ? props.branchList.map(branch=>{return branch.id}) : selectedBranches)
                    setStBrancheAndSerialList(brancheAndSerialList)
                    forceUpdate()
                })
        }
        setStShowNameAndLabel(props.variationTable)
    }, [props.isOpenModal,props.indexVariation]);
    useEffect(() => {
        if((props.indexVariation || props.indexVariation === 0) && props.mode !== 'edit'){
            let cloneDataManageInventory = [];
            props.variationTable.forEach((variation,index)=>{
                let selectedBranches = [];
                let brancheAndSerialList = [];
                if(variation.itemModelCodeDTOS){
                    variation.itemModelCodeDTOS.forEach(itemModelCode=>{
                        const index = selectedBranches.findIndex(branch=> branch === itemModelCode.branchId)
                        if(index === -1){
                            selectedBranches.push(itemModelCode.branchId)
                            brancheAndSerialList.push({
                                branchId:itemModelCode.branchId,
                                serial:[itemModelCode.code]
                            })
                        }else {
                            brancheAndSerialList[index].serial.push(itemModelCode.code)
                        }
                    })
                }
                cloneDataManageInventory.push({
                    index: index,
                    brancheAndSerialList: brancheAndSerialList,
                    selectedBranches: selectedBranches
                })
            })

            const findDataManageInventory = cloneDataManageInventory.find(manageInventory=>manageInventory.index === props.indexVariation);

            if(findDataManageInventory){
                onChangeBranches(findDataManageInventory.selectedBranches)
                setStBrancheAndSerialList(findDataManageInventory.brancheAndSerialList)
            }else {
                setStSelectedBranches([])
                setStBrancheAndSerialList([])
            }

        }
    }, [props.isOpenModal,props.indexVariation]);
    useEffect(() => {
        if (props.mode === 'edit' && !props.modeVariation && props.isOpenModal){
            ItemService.getAllItemModelCode(+(window.location.pathname.split('/product/edit/').join('')))
                .then(itemModelCodeDTOS=>{
                    setStGetAllItemModelCode(itemModelCodeDTOS)
                    let selectedBranches = []
                    let brancheAndSerialList = []
                    if(props.editItemModelCodeDTOS.length === 0){
                        itemModelCodeDTOS.forEach(item=>{
                            const index = selectedBranches.findIndex(branch=> branch === item.branchId)
                            if(index === -1){
                                selectedBranches.push(item.branchId)
                                brancheAndSerialList.push({
                                    branchId:item.branchId,
                                    serial:[item.code]
                                })
                            }else {
                                brancheAndSerialList[index].serial.push(item.code)
                            }
                        })
                    }else {
                        props.editItemModelCodeDTOS.forEach(item=>{
                            const index = selectedBranches.findIndex(branch=> branch === item.branchId)
                            if(index === -1){
                                selectedBranches.push(item.branchId)
                                brancheAndSerialList.push({
                                    branchId:item.branchId,
                                    serial:[item.code]
                                })
                            }else {
                                brancheAndSerialList[index].serial.push(item.code)
                            }
                        })
                    }
                    setStBrancheAndSerialList(brancheAndSerialList)
                    setStSelectedBranches(selectedBranches)
                    if (props.modeVariation){
                        let branchIdList = []
                        props.branchList.forEach(branch=>{
                            branchIdList.push(branch.id)
                        })
                        setStSelectedBranches(branchIdList)
                    }else {
                        setStSelectedBranches(props.branchId)
                    }
                })
        }else {
            if (props.modeVariation){
                let branchIdList = []
                props.branchList.forEach(branch=>{
                    branchIdList.push(branch.id)
                })
                setStSelectedBranches(branchIdList)
            }else {
                setStSelectedBranches(props.branchId)
            }
        }
    }, [props.isOpenModal]);
    const toggle = (e) => {
        e.preventDefault()
        handleCancelManageInventory()
    };
    const onChangeBranches = (branches) => {
        setStSelectedBranches(branches);
    }
    const onSearchKeyPress = async (e,branchId) =>{
        if (e.key === 'Enter') {
            e.preventDefault()
            const value = e.currentTarget.value.trim()
            if (value === "" || stBrancheAndSerialList?.serial?.length >= 1000000){
                return
            }
            const index = stBrancheAndSerialList.findIndex(id => id.branchId === branchId)
            let indexListCode = stListAllCode.findIndex(code=>code == value)
            let dataSerial = {
                branchId:branchId,
                serial:[value]
            }
            // create product
            if (props.mode !== 'edit'){
                if(index == -1){
                    if (indexListCode != -1){
                        handleShowValidCodeError(value,true)
                        return;
                    }else {
                        setStListAllCode([value,...stListAllCode])
                        handleShowValidCodeError("",false)
                    }
                    setStBrancheAndSerialList([...stBrancheAndSerialList, dataSerial])
                }else {
                    if (indexListCode != -1){
                        handleShowValidCodeError(value,true)
                        return;
                    }else {
                        setStListAllCode([value,...stListAllCode])
                        handleShowValidCodeError("",false)
                    }
                    stBrancheAndSerialList[index].serial = [value,...stBrancheAndSerialList[index].serial]
                    setStBrancheAndSerialList(_.cloneDeep(stBrancheAndSerialList))
                    forceUpdate()
                }
                setTimeout(()=>{
                    handleClearValue(branchId)
                },10)
            }
            // edit product
            if(props.mode === 'edit'){
                if(index == -1){
                    let checkValidCode;
                    if(props?.itemId?.itemId){
                         checkValidCode = await ItemService.checkValidCode(props?.itemId.itemId,value);
                    }else {
                         checkValidCode = await ItemService.checkValidCode(+(window.location.pathname.split('/product/edit/').join('')),value);
                    }
                    if (checkValidCode && indexListCode === -1){
                        setStBrancheAndSerialList([...stBrancheAndSerialList, dataSerial])
                        setStListAllCode([value,...stListAllCode])
                        handleShowValidCodeError("",false)
                    }else {
                        handleShowValidCodeError(value,true)
                    }
                }else {
                    let checkValidCode;
                    if(props?.itemId?.itemId){
                        checkValidCode = await ItemService.checkValidCode(props?.itemId.itemId,value);
                    }else {
                        checkValidCode = await ItemService.checkValidCode(+(window.location.pathname.split('/product/edit/').join('')),value);
                    }
                    if (checkValidCode && indexListCode === -1){
                        stBrancheAndSerialList[index].serial = [...stBrancheAndSerialList[index].serial, value]
                        setStBrancheAndSerialList(stBrancheAndSerialList)
                        setStListAllCode([value,...stListAllCode])
                        handleShowValidCodeError("",false)
                        forceUpdate()
                    }else {
                        handleShowValidCodeError(value,true)
                    }
                }
            }
            setTimeout(()=>{
                handleClearValue(branchId)
            },10)
        }
    }
    const handleSaveManageInventory = () =>{
        if (stBrancheAndSerialList.length > 0){
            setStSaveManageInventory(_.cloneDeep(stBrancheAndSerialList))
            props.dataTable(_.cloneDeep(stBrancheAndSerialList), stGetAllItemModelCode)
            props.callback()
            if(props.indexVariation || props.indexVariation === 0){
                const list = {
                    index:props.indexVariation,
                    brancheAndSerialList:_.cloneDeep(stBrancheAndSerialList),
                    selectedBranches:_.cloneDeep(stSelectedBranches)
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
        let listAllCode = []
        stSaveManageInventory.forEach(manageInventory=>{
            manageInventory.serial.forEach(serial=>listAllCode.push(serial))
        })
        setStListAllCode(listAllCode)
        setStBrancheAndSerialList(_.cloneDeep(stSaveManageInventory))
        forceUpdate()
        handleShowValidCodeError("",false)
        props.callback()
    }
    const handleDeleteSerial = (branchId, serial) =>{
        const index = stBrancheAndSerialList.findIndex(id => id.branchId === branchId)
        stBrancheAndSerialList[index].serial =  stBrancheAndSerialList[index].serial.filter(imel=>imel != serial)
        setStBrancheAndSerialList(_.cloneDeep(stBrancheAndSerialList))
        setStListAllCode(lac=>{
            return lac.filter(code=>code !== serial)
        })
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
            <Modal isOpen={props.isOpenModal} toggle={toggle} className=" managed-inventory-modal">
                {stErrorExistSerial.error &&
                    <div dangerouslySetInnerHTML={{__html: i18next.t("component.managedInventoryModal.error.exist",{value:stErrorExistSerial.value})}}  className="errorExist"></div>
                }
                <ModalHeader toggle={toggle}>
                    <div className="product-translate__titleHeader">
                        <p>{i18next.t("page.product.allProduct.productDetail.add.IMEISerial")}</p>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="branch">
                        <h3>{i18next.t('component.purchase.order.list.table.branch')}</h3>
                        <GSDropdownMultipleSelect
                            key={stSelectedBranches}
                            items={props.branchList.map(branch => (
                                {label: branch.name, value: branch.id}
                            ))}
                            name="branches"
                            selected={stSelectedBranches}
                            headerSelectedI18Text={"page.product.create.updateStockModal.selectedBranches"}
                            headerSelectedAllText={"page.product.create.updateStockModal.selectedBranches"}
                            className="product-multiple-branch-stock_editor_modal__mlp-select"
                            onChange={onChangeBranches}
                            position="bottomLeft"
                        />
                    </div>
                    <div className="table">
                        <table>
                            <thead>
                            <tr>
                                {stSelectedBranches.length === 0 &&
                                <>
                                    <th></th>
                                </>
                                }
                                {stSelectedBranches.length > 0 &&
                                    <>
                                        <th>{i18next.t('productList.tbheader.productName')}</th>
                                        {props.modeVariation && Array.isArray(stShowNameAndLabel[props.indexVariation]?.label) &&
                                            stShowNameAndLabel[props.indexVariation]?.label?.map(label=>{
                                                if(label != Constant.DEPOSIT.DEPOSIT_CODE)
                                                return(
                                                    <th className="label">{label}</th>
                                                )
                                            })
                                        }
                                        {props.modeVariation && !Array.isArray(stShowNameAndLabel[props.indexVariation]?.label) &&
                                            stShowNameAndLabel[props.indexVariation]?.label?.split('|').map(label=>{
                                                if(label != Constant.DEPOSIT.DEPOSIT_CODE)
                                                return(
                                                    <th className="label">{label}</th>
                                                )
                                        })
                                        }
                                        {props.modeVariation && stShowNameAndLabel?.arrLabel &&
                                        stShowNameAndLabel?.arrLabel?.map(label=>{
                                            if(label != Constant.DEPOSIT.DEPOSIT_CODE)
                                            return(
                                                <th className="label">{label}</th>
                                            )
                                        })
                                        }
                                    </>
                                }
                                {
                                    stSelectedBranches?.map(branchId =>{
                                        const branch = props.branchList.find(b => b.id == branchId)
                                        return (
                                            <th key={branchId}>{branch?.name}</th>
                                        )
                                    })
                                }
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                {stSelectedBranches.length === 0 &&
                                <td className="no-branch">{i18next.t('component.RemainingSoldItemModal.error.noBranch')}</td>
                                }
                                {stSelectedBranches.length > 0 &&
                                    <>
                                        <td>{props?.prodName}</td>
                                        {props.modeVariation &&
                                            stShowNameAndLabel[props.indexVariation]?.tId?.split('-').map(orgName=>{
                                                if(orgName != Constant.DEPOSIT.PERCENT_100)
                                                return(
                                                    <td>{orgName}</td>
                                                )
                                            })
                                        }
                                        {props.modeVariation && stShowNameAndLabel?.arrLabel &&
                                        stShowNameAndLabel?.orgName?.split('|').map((orgName,index)=>{
                                            if(orgName !== Constant.DEPOSIT.PERCENT_100
                                                && stShowNameAndLabel?.label?.split('|').findIndex(label=>label === Constant.DEPOSIT.DEPOSIT_CODE) !== index)
                                            return(
                                                <td>{orgName}</td>
                                            )
                                        })
                                        }
                                    </>
                                }
                                {
                                    stSelectedBranches?.map(branchId =>{
                                        const brancheAndSerialList = stBrancheAndSerialList.find(b => b.branchId == branchId)
                                        return (
                                            <td key={branchId}>
                                                <AvForm
                                                    // onValidSubmit={handleValidSubmit}
                                                    autoComplete="off"
                                                >
                                                    <div className="input-code">
                                                        <AvField
                                                            ref={refValue}
                                                            id={branchId}
                                                            className="VATmodal__input-field__hint"
                                                            name="serial"
                                                            placeholder={i18next.t('page.product.allProduct.productDetail.add.IMEISerial.enter')}
                                                            validate={{
                                                                ...FormValidate.maxLength(65)
                                                            }}
                                                            onKeyPress={e=>onSearchKeyPress(e,branchId)}
                                                        />
                                                    </div>
                                                    <div className="code">
                                                        {
                                                            brancheAndSerialList?.serial?.map((serial,index)=>{
                                                                return(
                                                                    <div key={index} className="content">
                                                                        <p>{serial}</p>
                                                                        <i onClick={()=>handleDeleteSerial(branchId,serial)} className="fa fa-times"></i>
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
ManagedInventoryModal.defaultProps = {
    editItemModelCodeDTOS:[],
    models:[]
}
ManagedInventoryModal.propTypes = {
    indexVariation: PropTypes.number,
    editItemModelCodeDTOS:PropTypes.array,
    mode:PropTypes.string,
    models:PropTypes.array,
    variationTable:PropTypes.array,
    modeVariation:PropTypes.bool,
    dataTable:PropTypes.func,
    branchList:PropTypes.array,
    callback:PropTypes.func,
    isOpenModal:PropTypes.bool,
    prodName:PropTypes.string,
    removeVariation:PropTypes.bool,
    branchId:PropTypes.array
}
export default ManagedInventoryModal;

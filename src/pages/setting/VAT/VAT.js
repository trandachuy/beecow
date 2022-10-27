import React, {Component, useEffect, useState} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import {UikCheckbox, UikSelect, UikWidget, UikWidgetContent, UikWidgetHeader} from "../../../@uik";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import i18next from "i18next";
import GSWidgetHeader from "../../../components/shared/form/GSWidget/GSWidgetHeader";
import {GSLayoutCol6, GSLayoutRow} from "../../../components/layout/GSLayout/GSLayout";
import GSTable from "../../../components/shared/GSTable/GSTable";
import GSActionButton, {GSActionButtonIcons} from "../../../components/shared/GSActionButton/GSActionButton";
import './VAT.sass';
import GSTooltip, {GSTooltipIcon} from "../../../components/shared/GSTooltip/GSTooltip";
import storeService from "../../../services/StoreService";
import {GSToast} from "../../../utils/gs-toast";
import {AvField, AvForm, AvRadio, AvRadioGroup} from "availity-reactstrap-validation";
import {FormValidate} from "../../../config/form-validate";
import {CredentialUtils} from "../../../utils/credential";
import {Label,Button, Modal, ModalHeader, ModalBody, ModalFooter} from "reactstrap";

import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import CrispChat from "../../crisp/CrispChat";
import GSImg from "../../../components/shared/GSImg/GSImg";
import {TokenUtils} from "../../../utils/token";


const taxType=[
    {
        label:"Sell",
        value:"SELL"
    },
    {
        label:"Import Goods",
        value:"IMPORT_GOODS"
    }
]

const VAT = props => {
    const [stVATs, setStVATs] = useState([])
    const [stVATSell,setStVATSell]=useState([])
    const [stDefaultVAT, setStDefaultVAT] = useState({
        value: ''
    });
    const [stChecked, setStChecked] = useState(null);
    const [modal, setModal] = useState(false);
    const [idDelete, setIdDelete] = useState(null);
    const toggle = () => setModal(!modal);
    const [modalDelete, setModalDelete] = useState(false);



    const toggleModalDelete = () => {
        setModalDelete(!modalDelete)

    };

    const changeIdDelete = (event, item) =>{
        event.preventDefault();
        event.stopPropagation();
        setIdDelete(item.id)
        setModalDelete(!modalDelete)
    }

    useEffect(() => {
        setValueVAT()
        getSatusShowTax()
    }, [])

    const setValueVAT = () => {
        storeService.getListVAT()
            .then((result) => {
                const vatSELL=result.filter(vat=>vat.taxType==="SELL")
                setStVATSell(vatSELL)
                setStVATs(result)

                const defaultVAT = result.find(vat => vat.useDefault)
                if (defaultVAT) {
                    setStDefaultVAT({
                        label: defaultVAT.name == 'tax.value.include' ? i18next.t('page.setting.VAT.table.defaultValue') : defaultVAT.name,
                        value: defaultVAT.id
                    })
                }else {
                    setStDefaultVAT({
                        label: '',
                        value: ''
                    })
                }

            })
            .catch(() => GSToast.commonError())


    }

    const getSatusShowTax =() =>{
        storeService.getStatusShowTax()
            .then((result) => {
                setStChecked(result.showTax)
            })
            .catch(() => GSToast.commonError())
    }

    const handleSelected = (event) => {
        const selectedVAT = event.value;
        setStDefaultVAT(event)
        storeService.changeStatusVAT(selectedVAT)
            .then(()=>{
                GSToast.commonUpdate()
            })
            .catch(() => GSToast.commonError())
    }

    const handleCheckedVAT = (event) =>{
        const checkedVAT = event.target.checked;
        storeService.changeStatusCheckedVAT(checkedVAT)
            .then(()=>{
                setStChecked(checkedVAT)
                GSToast.commonUpdate()
            })
            .catch(() => GSToast.commonError())

    }

    const onClickDelete = () => {

        const clearId = idDelete

        storeService.deleteVAT(clearId)
            .then(()=>{
                GSToast.commonDelete()
                setValueVAT()
                toggleModalDelete()

            })
            .catch(() => GSToast.commonError())

    }

    const handleValidSubmit = (event, values) => {
        const obj =
            {
                "description": values.description,
                "name": values.name,
                "rate": +(values.rate),
                "storeId": +(values.id),
                "taxType": values.taxType,
                "useDefault": false
            }
        storeService.addTaxSettings(obj)
            .then((result)=>{
                const arrStVATs = [...stVATs,result]
                const arrStVATsSell=arrStVATs.filter(vat=>vat.taxType==='SELL')
                setStVATSell(arrStVATsSell)
                setStVATs(arrStVATs)
                GSToast.commonCreate()
            })
            .catch(() => GSToast.commonError())


      toggle()
    }
    const {
        buttonLabel,
        className
    } = props;

    const renderTaxType=(value)=>{
        switch (value){
            case "SELL":
                return i18next.t("page.setting.VAT.table.sell")
            case "IMPORT_GOODS":
                return i18next.t("page.setting.VAT.table.importGoods")
        }
    }

    const renderTable = () =>{
        return stVATs.map((item, index)=>{
            if (item.name == 'tax.value.include'){
                return (<tr key={item.id}>
                    <td><Trans i18nKey="page.setting.VAT.table.defaultValue"></Trans></td>
                    <td>{renderTaxType(item.taxType)}</td>
                    <td>-</td>
                    <td></td>
                </tr>)
            }else {
                return(<tr  key={item.id}>
                    <td >{item.name}</td>
                    <td>{renderTaxType(item.taxType)}</td>
                    <td>{item.description}</td>
                    <td >{item.rate}</td>
                    <td>
                        <div>
                            <GSActionButton
                                icon={GSActionButtonIcons.DELETE}
                                onClick={(event) => {toggleModalDelete();changeIdDelete(event,item)}}
                            />
                        </div>
                    </td>
                </tr>)
            }

        })
    }

    const onClickCancelAddStaff = (e) => {
        e.preventDefault(); // avoid fire submit action
        toggle();
    };






    return (
        <>
            <GSContentContainer className="VAT">
                <GSWidget>
                    <GSWidgetHeader className="gs-widget__header">
                        <Trans i18nKey="page.setting.VAT.title">
                        </Trans>
                    </GSWidgetHeader>
                    <GSWidgetContent>
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE,PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                          wrapperDisplay={"block"}
                        >
                        <UikCheckbox
                            checked={stChecked}
                            onChange={e => handleCheckedVAT(e)}
                            className="custom-check-box"
                        />

                        <span className="check-box-wrapper__label">{i18next.t("page.setting.VAT.titleCheckbox")}</span>
                        <GSTooltip message={i18next.t("page.setting.VAT.showing.hindText")} icon={GSTooltipIcon.INFO_CIRCLE}/>
                        </PrivateComponent>
                    </GSWidgetContent>
                    <GSLayoutRow>
                        <GSLayoutCol6>

                            <div className="form-group">
                                <Label className="gs-frm-control__title">
                                    <Trans i18nKey="page.setting.VAT.titleSelect"></Trans>
                                </Label>
                                <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE,PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                                  wrapperDisplay={"block"}
                                >
                                <UikSelect
                                    className='w-100'
                                    value={[stDefaultVAT]}
                                    options={stVATSell.map(item => (
                                        {
                                        value: item.id,
                                        label: item.name == 'tax.value.include' ? i18next.t('page.setting.VAT.table.defaultValue') : item.name
                                        }
                                    ))}
                                    onChange={e => handleSelected(e)}
                                />
                                </PrivateComponent>
                            </div>



                        </GSLayoutCol6>
                    </GSLayoutRow>
                </GSWidget>

                {/*VAT*/}

                <UikWidget className="gs-widget">
                    <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE,PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                      wrapperDisplay={"block"}
                    >
                    <UikWidgetHeader className="gs-widget__header"
                                     rightEl={
                                         // hasFreeOrLeadPackage()?
                                         <GSButton
                                             success
                                             onClick={toggle}
                                         >
                                             <GSTrans t={"page.setting.VAT.titleAdd"}/>
                                         </GSButton>
                                     }
                    >
                        <Trans i18nKey="page.setting.VAT.titleBox">
                        </Trans>



                        <Modal isOpen={modal} toggle={toggle} className={`VATmodal ${className}`}>
                            <ModalHeader toggle={toggle}>{i18next.t("page.setting.VAT.titleAdd")}</ModalHeader>
                            <ModalBody>
                                <AvForm onValidSubmit={handleValidSubmit} >
                                    <div className="pl-4 pr-4">
                                        <AvField name="id" value={CredentialUtils.getStoreId()} hidden/>
                                        <AvField
                                            className="VATmodal__input-field__hint"
                                            label={`${i18next.t("page.setting.VAT.table.name")} *`}
                                            name="name"
                                            placeholder={i18next.t("page.setting.VAT.table.exampleName")}
                                            validate={{
                                                ...FormValidate.required(),
                                                ...FormValidate.maxLength(60),
                                            }}
                                        />

                                        <AvField
                                            className="VATmodal__input-field__hint"
                                            label={`${i18next.t("page.setting.VAT.table.tax")} *`}
                                            name="rate"
                                            type="number"
                                            placeholder={i18next.t("page.setting.VAT.table.examplevalue")}
                                            validate={{
                                                ...FormValidate.maxValue(100),
                                                ...FormValidate.required(),
                                                ...FormValidate.minValue(0),
                                                ...FormValidate.integerNumberVATOfStore()
                                            }}

                                        />

                                        <AvField
                                            className="VATmodal__input-field__hint"
                                            label={i18next.t("page.setting.VAT.table.description")}
                                            name="description"
                                            validate={{
                                                ...FormValidate.maxLength(60),
                                            }}

                                        />

                                        {

                                        <AvRadioGroup
                                            label={<label>{i18next.t("page.setting.VAT.table.taxType")} *</label>}
                                            required
                                            name='taxType'
                                            className='tax-type-group__radio'
                                            defaultValue={taxType[0].value}
                                        >
                                            {
                                                taxType.map((item, index) => (
                                                    <div key={index + JSON.stringify(item)} className={'tax-type-group__radio--item'}>
                                                        <div>
                                                            {
                                                                <AvRadio
                                                                    disabled={!TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.POS_PACKAGE]) && index!=0}
                                                                    customInput
                                                                    label={renderTaxType(item.value)}
                                                                    value={item.value}
                                                                />
                                                            }

                                                        </div>

                                                    </div>
                                                ))
                                            }
                                        </AvRadioGroup>
                                                }

                                    </div>
                                    <ModalFooter>
                                        <GSButton default onClick={onClickCancelAddStaff}>
                                            <GSTrans t={"common.btn.cancel"}/>
                                        </GSButton>
                                        <GSButton success marginLeft>
                                            <GSTrans t={"common.btn.add"}/>
                                        </GSButton>
                                    </ModalFooter>
                                </AvForm>
                            </ModalBody>

                        </Modal>

                        <Modal isOpen={modalDelete} toggle={toggleModalDelete} className={`VATmodalDelete ${className}`}>
                            <ModalHeader toggle={toggle}>{i18next.t("page.setting.VAT.delete.title")}</ModalHeader>
                            <ModalBody>
                                {i18next.t("page.setting.VAT.delete.description")}
                            </ModalBody>

                            <ModalFooter>
                                <GSButton default onClick={toggleModalDelete}>
                                    <GSTrans  t={"common.btn.cancel"}/>
                                </GSButton>
                                <GSButton danger marginLeft onClick={onClickDelete}>
                                    <GSTrans t={"common.btn.delete"}/>
                                </GSButton>
                            </ModalFooter>
                        </Modal>





                    </UikWidgetHeader>

                    <UikWidgetContent
                        className="gs-widget__content body">
                        <div className={"branch-list-desktop d-mobile-none d-desktop-flex"}>
                            <GSTable>
                                <thead>
                                <tr>
                                    <th>
                                        <GSTrans t={"page.setting.VAT.table.name"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.setting.VAT.table.taxType"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.setting.VAT.table.description"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.setting.VAT.table.tax"}/>
                                    </th>
                                    <th>
                                        <GSTrans/>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>

                                {renderTable()}

                                </tbody>
                            </GSTable>
                        </div>

                    </UikWidgetContent>
                    </PrivateComponent>
                </UikWidget>


            </GSContentContainer>
        </>
    );
}


export default VAT;
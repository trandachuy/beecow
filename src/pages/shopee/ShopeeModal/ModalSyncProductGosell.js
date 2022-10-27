import React, {useEffect, useState} from 'react'
import "./ModalCreateProductGosell.sass"

import {array, bool, func} from "prop-types";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import i18next from "i18next";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {Trans} from "react-i18next";
import {UikCheckbox} from "../../../@uik";
import shopeeService from "../../../services/ShopeeService";
import {GSToast} from "../../../utils/gs-toast";

function ModalSyncProductGosell(props) {
    const {selectedProducts, toggle, onClose, syncModalBcItemId} = props

    const [stCheckedSelectSync, setStCheckedSelectSync] = useState(false);
    const [stDataFields, setStDataFields] = useState([])
    const [stShopeeSetting, setStShopeeSetting] = useState(false)
    const [stfields, SetStfields] = useState([]);
    const [settingsSync, setSettingsSync] = useState(null);

    const [stOptionSync, setStOptionSync] = useState({
        id: null,
        storeId: null,
        name: null,
        description: null,
        price: null,
        stock: null,
    })


    const DEFAULT_FILTER = {
        STATUS: {value: '', label: i18next.t('page.shopeeProduct.management.filter.status.ALL_STATUS')},
        ACCOUNT: {value: '', label: i18next.t('page.shopeeProduct.management.filter.account.ALL_ACCOUNT')},
    }
    const STATUS_FILTER = {
        ALL_STATUS: DEFAULT_FILTER.STATUS,
        LINK: {value: 'LINK', label: i18next.t('page.shopeeProduct.management.filter.status.LINK')},
        SYNC: {value: 'SYNC', label: i18next.t('page.shopeeProduct.management.filter.status.SYNC')},
        UNLINK: {value: 'UNLINK', label: i18next.t('page.shopeeProduct.management.filter.status.UNLINK')},
    }

    const OPTION_FIELDS = {
        fieldName: 'FIELD_NAME',
        fieldPrice: 'FIELD_PRICE',
        fieldDescription: 'FIELD_DESCRIPTION',
        fieldStock: 'FIELD_STOCK',
        fieldAll: 'ALL'

    }


    useEffect(() => {
        shopeeService.loadShopeeSetting()
            .then(data => {
                setStShopeeSetting(data.settingObject.autoSynStock)
                if (data.settingObject.autoSynStock) {
                    setStDataFields(["FIELD_STOCK"])
                    SetStfields(["FIELD_STOCK"])
                }
            })
            .catch(_e => GSToast.commonError());
    }, []);

    useEffect(() => {
        shopeeService.getProductSettingsSyncByStoreId()
            .then(result => {
                if (result.headers["x-error-key"] === "setting.syncs.not.found") {
                    return shopeeService.createDefaultProductSettingsSync();
                }
                return result.data;
            })
            .then(data => setSettingsSync(data), GSToast.commonError);
    }, []);

    useEffect(() => {
        if (!settingsSync) {
            return;
        }

        const { id, storeId, name, price, stock, description } = settingsSync;
        let dataFields = [];
        if (stock === true) {
            dataFields.push("FIELD_STOCK");
        }
        if (stShopeeSetting && !stock){
            dataFields.push("FIELD_STOCK");
        }

        if (name === true){
            dataFields.push("FIELD_NAME");
        }
        if (description === true){
            dataFields.push("FIELD_DESCRIPTION");
        }
        if (price === true){
            dataFields.push("FIELD_PRICE");
        }
        if(dataFields.length === 0) {
            dataFields.push("ALL");
        }

        setStDataFields(dataFields);
        SetStfields(dataFields)
        setStOptionSync({
            id,
            storeId,
            name,
            description,
            price,
            stock: stock || stShopeeSetting,
        });
    }, [settingsSync, stShopeeSetting])

    const getSyncModalStatus = () => {
        const status = {
            isLink: false,
            isUnLink: false,
            isSync: false,
            totalSync: 0,
            totalUnLink: 0

        }


        selectedProducts.forEach(prod => {
            switch (prod.gosellStatus) {
                case STATUS_FILTER.SYNC.value:
                    status.isSync = true
                    status.totalSync++
                    break

                case STATUS_FILTER.LINK.value:
                    status.isLink = true
                    status.totalSync++
                    break

                case STATUS_FILTER.UNLINK.value:
                    status.isUnLink = true
                    status.totalUnLink++
                    break
            }
        })

        return status
    }


    const handleSelectSync = (e) => {
        const checked = e.target.checked
        setStCheckedSelectSync(checked)
    }


    const renderSyncModal = () => {
        const {isLink, isUnLink, isSync, totalSync} = getSyncModalStatus()
        if ((isSync || isLink) && isUnLink) {
            return (
                <Modal isOpen={toggle} toggle={toggleSync} className="toggleSync">
                    <ModalHeader className="notice"
                                 toggle={toggleSync}>{i18next.t('page.shopee.products.modal.notice')}</ModalHeader>
                    <ModalBody>
                        <p className="mb-2">{i18next.t('page.shopee.products.modal.notice.description')}</p>
                        {i18next.t('page.shopee.products.modal.notice.description2')}

                    </ModalBody>
                    <ModalFooter>
                        <GSButton onClick={toggleSync} success>
                            <GSTrans t={"common.txt.alert.modal.btn"}/>
                        </GSButton>
                    </ModalFooter>
                </Modal>
            )
        }

        if (isUnLink) {
            return (
                <Modal isOpen={toggle} toggle={toggleSync} className="toggleSync">
                    <ModalHeader className="notice"
                                 toggle={toggleSync}>{i18next.t('page.shopee.products.modal.notice')}</ModalHeader>
                    <ModalBody>
                        <p className="mb-2">{i18next.t('page.shopee.products.modal.notice.description')}</p>
                        {i18next.t('page.shopee.products.modal.notice.description2')}

                    </ModalBody>
                    <ModalFooter>
                        <GSButton onClick={toggleSync} success>
                            <GSTrans t={"common.txt.alert.modal.btn"}/>
                        </GSButton>
                    </ModalFooter>
                </Modal>
            )
        }

        if ((isSync || isLink) && syncModalBcItemId()) {
            return (
                <Modal isOpen={toggle} toggle={toggleSync} className="toggleSync">
                    <ModalHeader className="notice"
                                 toggle={toggleSync}>{i18next.t('page.shopee.products.modal.notice')}</ModalHeader>
                    <ModalBody>
                        <p className="mb-2">{i18next.t('page.shopee.products.modal.notice.description3')}</p>
                    </ModalBody>
                    <ModalFooter>
                        <GSButton onClick={toggleSync} success>
                            <GSTrans t={"common.txt.alert.modal.btn"}/>
                        </GSButton>
                    </ModalFooter>
                </Modal>
            )
        }


        return (
            <Modal isOpen={toggle} toggle={toggleSync} className="toggleSync">
                <ModalHeader toggle={toggleSync}>{i18next.t('page.setting.VAT.delete.title')}</ModalHeader>
                <ModalBody>
                    <p className="mb-2">
                        <Trans i18nKey="page.shopee.products.modal.description.synced" values={{y: totalSync}}></Trans>
                    </p>

                    <div className="d-flex justify-content-center align-items-center">
                        <UikCheckbox
                            className='m-0'
                            onChange={(e) => handleSelectSync(e)}
                            checked={stCheckedSelectSync}
                        />{i18next.t('page.shopee.products.modal.action')}
                    </div>

                    <div hidden={!stCheckedSelectSync}>
                        <div className="row actionSelectSync">
                            <div className='checkbox col-6 d-flex justify-content-start align-items-center'>
                                <UikCheckbox
                                    className='m-0'
                                    onChange={(e) => handleSelectOptionSync(e)}
                                    name="name"
                                    checked={stOptionSync.name}
                                />
                                {i18next.t('page.shopee.products.modal.action.name')}
                            </div>
                            <div className='checkbox col-6 d-flex justify-content-start align-items-center'>
                                <UikCheckbox
                                    className='m-0'
                                    onChange={(e) => handleSelectOptionSync(e)}
                                    name="description"
                                    checked={stOptionSync.description}

                                />
                                {i18next.t('page.shopee.products.modal.action.description')}
                            </div>
                            <div className='checkbox col-6 d-flex justify-content-start align-items-center'>
                                <UikCheckbox
                                    className='m-0'
                                    onChange={(e) => handleSelectOptionSync(e)}
                                    name="price"
                                    checked={stOptionSync.price}

                                />
                                {i18next.t('page.shopee.products.modal.action.price')}
                            </div>
                            <div className={stShopeeSetting ? 'checkbox color__gray col-6 d-flex justify-content-start align-items-center': 'checkbox col-6 d-flex justify-content-start align-items-center'}>
                                <UikCheckbox
                                    className='m-0'
                                    onChange={(e) => handleSelectOptionSync(e)}
                                    name="stock"
                                    checked={stOptionSync.stock}
                                    disabled={stShopeeSetting}

                                />
                                {i18next.t('page.shopee.products.modal.action.stock')}
                            </div>

                        </div>

                        <div>
                            <span className="sync-notice"><Trans
                                i18nKey="page.shopee.products.modal.notice"></Trans>{': '}
                            </span>

                            <span className="description-notice"><Trans
                                i18nKey="product.update.notice.incomplete.transfer"></Trans>
                            </span>
                        </div>

                        <div>
                            <span hidden={!stShopeeSetting}  className="sync-notice"><Trans
                                i18nKey="page.shopee.products.modal.notice"></Trans>{': '}
                            </span>

                            <span hidden={!stShopeeSetting}
                            className="description-notice"><Trans
                            i18nKey="page.shopee.products.modal.notice.linked"></Trans>
                            </span>
                        </div>
                    </div>

                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={toggleSync}>
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                    <GSButton onClick={actionSelectOptionSync} marginLeft success>
                        <GSTrans t={"common.txt.alert.modal.btn"}/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }

    const handleSelectOptionSync = (e) => {
        setStOptionSync({...stOptionSync, [e.target.name]: e.target.checked});

        let targetName = ""
        switch (e.target.name) {
            case "name":
                targetName = "FIELD_NAME"
                break;
            case "description":
                targetName = "FIELD_DESCRIPTION"
                break;
            case "price":
                targetName = "FIELD_PRICE"
                break;
            case "stock":
                targetName = "FIELD_STOCK"
                break;
        }
        let field = [...stfields]
        let index = stfields.findIndex(item => item === targetName)
        if (index === -1) {
            if (stfields[0] === "ALL"){
                field = [...[], targetName]
                SetStfields(field)
            }else {
                field = [...stfields, targetName]
                SetStfields(field)
            }


        } else {
            field.splice(index, 1)
            SetStfields(field)
        }


        if (field.length === 0) {
            field = ["ALL"]
        }

        setStDataFields(field)


    }

    const actionSelectOptionSync = () => {

        shopeeService.editProductSettingsSyncs(stOptionSync)
            .then(data => {
            })
        if(props.isSynchronizing){
            toggleSync()
            GSToast.warning(i18next.t('page.shopee.products.label.status.is_synchronizing'))
            return;
        }

        const data = {
            fields: stDataFields,
            shopeeItemIds: selectedProducts.map(prod => prod.id)
        }



        shopeeService.addSynToGosell(data)
            .then(data => {
                // set status is synchronizing
                props.onClose({isHronizing:true})
            })
            .catch(e => {
                if (e.response.status === 400 && e.response.data && e.response.data.errorKey === "synchronizing.exist") {
                    GSToast.error(i18next.t('page.shopee.products.status.is_synchronizing'));
                } else {
                    GSToast.commonError()
                }

                props.onClose({isHronizing:false})
            })
    }

    const toggleSync = (isSynchronizing) => {
        onClose(isSynchronizing)
    }

    return (
        <div>
            {renderSyncModal()}
        </div>
    )
}

ModalSyncProductGosell.propTypes = {
    syncModalBcItemId: func,
    shopeeProducts: array,
    selectedProducts: array,
    toggle: bool,
    onClose: func,
}

export default ModalSyncProductGosell;


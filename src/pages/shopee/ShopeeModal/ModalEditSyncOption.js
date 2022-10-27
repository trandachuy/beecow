import React, {useEffect, useState} from 'react';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import i18next from "i18next";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {UikCheckbox} from "../../../@uik";
import "./ModalEditSyncOption.sass"
import shopeeService from "../../../services/ShopeeService";
import {GSToast} from "../../../utils/gs-toast";

function ModalEditSyncOption() {


    const [modal, setModal] = useState(false);
    const [stCheckedSelectSync, setStCheckedSelectSync] = useState(false);

    const [stOptionSync, setStOptionSync] = useState({
        id: null,
        storeId: null,
        name: null,
        description: null,
        price: null,
        stock: null,
    })


    useEffect(() => {
        shopeeService.getProductSettingsSyncByStoreId()
            .then(data => {
                const {id,storeId,name,description,price,stock} = data.data
                setStOptionSync({
                    id,
                    storeId,
                    name,
                    description,
                    price,
                    stock,
                });
            })
            .catch(() => GSToast.commonError())
    }, [])


    const handleSelectSync = (e) => {
        const checked = e.target.checked
        setStCheckedSelectSync(checked)
    }

    const handleSelectOptionSync = (e) => {
        setStOptionSync({...stOptionSync, [e.target.name]: e.target.checked});
        const data = stOptionSync
        data[e.target.name] = e.target.checked

        shopeeService.editProductSettingsSyncs(data)
            .then(data => {
                GSToast.commonUpdate()
            })
            .catch(() => GSToast.commonError())

    }

    const toggle = () => {
        setModal(modal => {
            return !modal
        });
    }

    return (
        <div>
            <GSButton onClick={toggle} success marginLeft>
                <GSTrans t={"page.shopee.products.modal.sync"}/>
            </GSButton>
            <Modal isOpen={modal} toggle={toggle} className="toggleEditSync">
                <ModalHeader toggle={toggle}>{i18next.t('page.setting.VAT.delete.title')}</ModalHeader>
                <ModalBody>
                    <div className="d-flex justify-content-center align-items-center">
                        <UikCheckbox
                            className='m-0'
                            checked={stCheckedSelectSync}
                            onChange={(e) => handleSelectSync(e)}
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
                            <div className='checkbox col-6 d-flex justify-content-start align-items-center'>
                                <UikCheckbox
                                    className='m-0'
                                    onChange={(e) => handleSelectOptionSync(e)}
                                    name="stock"
                                    checked={stOptionSync.stock}
                                />
                                {i18next.t('page.shopee.products.modal.action.stock')}
                            </div>

                        </div>

                    </div>

                </ModalBody>
                <ModalFooter>
                    <GSButton success marginLeft onClick={toggle}>
                        <GSTrans t={"common.txt.alert.modal.btn"}/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        </div>
    )
}


export default ModalEditSyncOption;
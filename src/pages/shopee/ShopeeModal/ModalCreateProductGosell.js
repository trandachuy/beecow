import React, { useState } from 'react'
import "./ModalCreateProductGosell.sass"
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import i18next from "i18next";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {Trans} from "react-i18next";
import shopeeService from "../../../services/ShopeeService";
import {GSToast} from "../../../utils/gs-toast";
import {array, bool, func} from "prop-types";
import { UikCheckbox } from "../../../@uik";

function ModalCreateProductGosell(props) {
    const {selectedProducts, toggle, onClose} = props

    const [shouldCreateCollection, setShouldCreateCollection] = useState(false);

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

    const getSyncModalStatus = () => {
        const status = {
            isLink: false,
            isUnLink: false,
            isSync: false,
            totalSync: 0,
            totalUnLink: 0

        }
        selectedProducts.forEach(prod => {
            if (!prod) {
                return
            }
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


    const renderCreateModal = () => {
        const {isLink, isUnLink, isSync, totalUnLink} = getSyncModalStatus()

        if ((isSync || isLink) && isUnLink) {
            return (
                <Modal isOpen={toggle} toggle={toggleCreate} className="toggleSync">
                    <ModalHeader className="notice"
                                 toggle={toggleCreate}>{i18next.t('page.shopee.products.modal.notice')}</ModalHeader>
                    <ModalBody>
                        <p className="mb-2">{i18next.t('page.shopee.products.modal.notice.description')}</p>
                        {i18next.t('page.shopee.products.modal.notice.description2')}

                    </ModalBody>
                    <ModalFooter>
                        <GSButton onClick={toggleCreate} success>
                            <GSTrans t={"common.txt.alert.modal.btn"}/>
                        </GSButton>
                    </ModalFooter>
                </Modal>
            )
        }

        if (isSync || isLink) {
            return (
                <Modal isOpen={toggle} toggle={toggleCreate} className="toggleSync">
                    <ModalHeader className="notice"
                                 toggle={toggleCreate}>{i18next.t('page.shopee.products.modal.notice')}</ModalHeader>
                    <ModalBody>
                        <p className="mb-2">{i18next.t('page.shopee.products.modal.notice.description')}</p>
                        {i18next.t('page.shopee.products.modal.notice.description2')}

                    </ModalBody>
                    <ModalFooter>
                        <GSButton onClick={toggleCreate} success>
                            <GSTrans t={"common.txt.alert.modal.btn"}/>
                        </GSButton>
                    </ModalFooter>
                </Modal>
            )
        }

        return (
            <Modal isOpen={toggle} toggle={toggleCreate} className="toggleSync">
                <ModalHeader toggle={toggleCreate}>{i18next.t('page.setting.VAT.delete.title')}</ModalHeader>
                <ModalBody>
                    <Trans i18nKey="page.shopee.products.modal.description.created" values={{x: totalUnLink}}></Trans>
                    <div className="create-gsproduct-checkbox">
                        <UikCheckbox
                            // defaultChecked={stChecked}
                            className="mt-4 font-italic"
                            label={i18next.t("page.shopeeProduct.management.create.action.checkbox")}
                            color={"blue"}
                            onChange={e => setShouldCreateCollection(e.currentTarget.checked)}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={toggleCreate}>
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                    <GSButton onClick={handleCreateToGosell} success marginLeft>
                        <GSTrans t={"common.txt.alert.modal.btn"}/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }

    const handleCreateToGosell = () => {

        if(props.isSynchronizing){
            toggleCreate()
            GSToast.warning(i18next.t('page.shopee.products.label.status.is_synchronizing'))
            return;
        }

        const data = {
            shopeeItemIds: selectedProducts.map(prod => prod.id),
            shouldCreateCollection,
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

    const toggleCreate = (isSynchronizing) => {
        onClose(isSynchronizing);
    }

    return (
        <div>
            {renderCreateModal()}
        </div>
    )
}

ModalCreateProductGosell.propTypes = {
    selectedProducts:array,
    toggle: bool,
    onClose: func,
}

export default ModalCreateProductGosell;

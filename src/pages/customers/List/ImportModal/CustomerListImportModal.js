/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 07/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import Dropzone from "react-dropzone";
import './CustomerListImportModal.sass';
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import {GSToast} from "../../../../utils/gs-toast";
import i18next from "../../../../config/i18n";
import {ImageUtils} from "../../../../utils/image";
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import beehiveService from "../../../../services/BeehiveService";
import {TokenUtils} from "../../../../utils/token";
import {CredentialUtils} from "../../../../utils/credential";
import BranchesSelector, {
    BRANCH_SELECT_MODE_IMPORT,
    BranchContext
} from "../../../../components/shared/BranchesSelect/BranchesSelector";

const MAXIMUM_CSV_SIZE_BY_MB = 2
const MAXIMUM_CSV_ROW = 10_000
const CustomerListImportModal = props => {
    const {isOpen,cancelCallback, importCallback, ...other} = props

    const [stFile, setStFile] = useState(null);
    const refImportAlert = useRef(null);
    const [stIsLoading, setStIsLoading] = useState(false);
    const [stIsOpen, setStIsOpen] = useState(isOpen);
    const [selectedBranches, setSelectedBranches] = useState([]);

    useEffect(() => {
        // change status from parent -> reset file
        setStIsOpen(isOpen)
        setStFile(null)
    }, [props.isOpen]);


    const onImageUploaded = (files) => {
        const file = files[0]

        // check file type && file size
        const allowedFileType = ['application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!allowedFileType.includes(file.type)) {
            GSToast.error(i18next.t("component.product.addNew.images.wrongFileType", {
                fileName: file.name
            }))
            return
        }

        if (file.size / 1024 / 1024 > MAXIMUM_CSV_SIZE_BY_MB) {
            GSToast.error(i18next.t("component.product.addNew.images.maximumSize", {
                fileName: file.name,
                size: MAXIMUM_CSV_SIZE_BY_MB
            }))
            return
        }

        // => Ok
        setStFile(file)

    }

    const onClickCancel = () => {
        if (cancelCallback) cancelCallback()
    }

    const onClickImport = () => {
        setStIsLoading(true)
        setStIsOpen(false)

        let staffUserId = null
        if (TokenUtils.isStaff() && CredentialUtils.getOmiCallEnabled()) {
            staffUserId = CredentialUtils.getUserId()
        }

        beehiveService.importCustomerListExcel(stFile, staffUserId, selectedBranches)
            .then(result => {
                refImportAlert.current.openModal({
                            type: AlertModalType.ALERT_TYPE_SUCCESS,
                            messages: i18next.t('page.customers.list.importModal.successfulMessage', {x: result['successCnt'], total: result['totalCnt']}),
                            closeCallback: onClickCancel
                        })
                setStIsLoading(false)
                if (importCallback && result['successCnt'] > 0) importCallback(true)
            })
            .catch(e => {
                if (e.response.data.title === 'exceed.max.row') {
                    refImportAlert.current.openModal({
                        type: AlertModalType.ALERT_TYPE_DANGER,
                        messages: i18next.t("page.customers.list.importModal.failedMessageExceedMaxRow"),
                        closeCallback: () => setStIsOpen(true)
                    })
                } else {
                    refImportAlert.current.openModal({
                        type: AlertModalType.ALERT_TYPE_DANGER,
                        messages: i18next.t('page.customers.list.importModal.failedMessage'),
                        closeCallback: () => setStIsOpen(true)
                    })
                }

                setStIsLoading(false)
                if (importCallback) importCallback(false)

            })


    }

    const onClickDownloadTemplate = () => {
        //DownloadUtils.saveDataToFile(CSVTemplates.CUSTOMER_LIST, 'customer-list-template.xlsx')
        beehiveService.getProfileImportTemplate().then(res => {
            const url = window.URL.createObjectURL(new Blob([res]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'customer-template-import.xlsx');
            document.body.appendChild(link);
            link.click();
        }).catch(() => {
            GSToast.commonError();
        });
    };

    const renderFileSize = (size) => {
        if (size < 1024 * 1024) {
            return parseFloat(size / 1024).toFixed(2) + ' KB'
        } else {
            return parseFloat(size / 1024 / 1024).toFixed(2) + ' MB'

        }
    }

    const onClickDelete = () => {
        setStFile(null)
    }


    return (
        <>
            <AlertModal ref={refImportAlert}/>
            {stIsLoading && <LoadingScreen zIndex={9999}/>}
            <Modal isOpen={stIsOpen} {...other} centered={true} fade={true} className="customer-list-import-modal">
                <ModalHeader>
                    <GSTrans t="page.customers.list.importModal.title"/>
                </ModalHeader>
                <ModalBody>
                    <BranchContext.Provider value={[selectedBranches, setSelectedBranches]}>
                        <BranchesSelector mode={BRANCH_SELECT_MODE_IMPORT} />
                    </BranchContext.Provider>
                    {!stFile &&
                        <Dropzone onDrop={onImageUploaded}>
                            {({ getRootProps, getInputProps }) => (
                                    <div {...getRootProps()} className="customer-list-import-modal__drop-zone mb-3">
                                        <input {...getInputProps()}
                                               accept=".xlsx"
                                               multiple={false}
                                        />
                                        <span className="customer-list-import-modal__icon-upload"/>
                                        <p>
                                            <GSTrans t="page.customers.list.importModal.uploadFileHint"/>
                                            <br/>
                                            <GSTrans t="page.customers.list.importModal.uploadFileSupportHint"/>
                                        </p>
                                    </div>
                            )}
                        </Dropzone>
                    }

                    {stFile &&
                        <div className="customer-list-import-modal__file-zone mb-3">
                            <img src="/assets/images/icon-CSVfile.svg"
                                 alt="csv-icon"
                                 className="customer-list-import-modal__icon-csv"
                            />
                            <div className="ml-2">
                                <span className="customer-list-import-modal__file-name">
                                    {ImageUtils.ellipsisFileName(stFile.name, 20)}
                                </span>
                                <span className="customer-list-import-modal__file-size">
                                    {renderFileSize(stFile.size)}
                                </span>
                            </div>
                            <div  className="customer-list-import-modal__btn-delete">
                                <GSActionButton icon={GSActionButtonIcons.DELETE} onClick={onClickDelete}/>
                            </div>
                        </div>
                    }

                    <span className="customer-list-import-modal__download-template-text">
                        <GSTrans t="page.customers.list.importModal.dontHaveFile"/>
                        {' '}
                        <GSFakeLink onClick={onClickDownloadTemplate}>
                            <GSTrans t="page.customers.list.importModal.downloadTemplate"/>
                        </GSFakeLink>
                    </span>
                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={onClickCancel}>
                        <GSTrans t="common.btn.cancel"/>
                    </GSButton>
                    <GSButton success marginLeft disabled={!stFile || selectedBranches.length < 1} onClick={onClickImport}>
                        <GSTrans t="page.customers.list.import"/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        </>
    );
};

CustomerListImportModal.propTypes = {
    isOpen: PropTypes.bool,
    cancelCallback: PropTypes.func,
    importCallback: PropTypes.func,
};

export default CustomerListImportModal;

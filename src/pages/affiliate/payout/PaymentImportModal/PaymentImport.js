import i18next from "i18next";
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import Dropzone from "react-dropzone";
import Modal from "reactstrap/es/Modal";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import ModalHeader from "reactstrap/es/ModalHeader";
import AlertModal, { AlertModalType } from "../../../../components/shared/AlertModal/AlertModal";
import GSActionButton, { GSActionButtonIcons } from "../../../../components/shared/GSActionButton/GSActionButton";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import AffiliateService from "../../../../services/AffiliateService";
import { GSToast } from '../../../../utils/gs-toast';
import { ImageUtils } from "../../../../utils/image";
import './PaymentImport.sass';

const MAXIMUM_CSV_SIZE_BY_MB = 2

const IMPORT_COMMON = {
    totalProduct: 0,
    hasError: false,
    lstError: []
}

const PaymentImport = props => {

    const {isOpen,cancelCallback, importCallback, ...other} = props

    const refImportAlert = useRef(null);

    const [stFile, setStFile] = useState(null);
    const [stIsLoading, setStIsLoading] = useState(false);
    const [stIsOpen, setStIsOpen] = useState(isOpen);
    const [getImportResponse, setImportResponse] = useState(IMPORT_COMMON);

    useEffect(() => {
        // change status from parent -> reset file
        setStIsOpen(isOpen)
        setStFile(null)
        setImportResponse(IMPORT_COMMON);
    }, [props.isOpen]);

    const onExcelUploaded = (files) => {
        const file = files[0]

        // check file type && file size
        //const allowedFileType = ['text/csv','application/vnd.ms-excel','text/x-csv','application/csv','application/x-csv','text/comma-separated-values','text/x-comma-separated-values','text/tab-separated-values']
        const allowedFileType = ['application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
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
        cancelCallback();
    }

    const onClickImport = () => {
        setStIsLoading(true)

        AffiliateService.importPayment(stFile)
            .then(result => {

                if(result.hasError){
                    // has error -> show message error
                    setImportResponse(result);

                }else{
                    // close import modal
                    setStIsOpen(false)

                    // open success modal
                    // refImportAlert.current.openModal({
                    //     type: AlertModalType.ALERT_TYPE_SUCCESS,
                    //     messages: i18next.t('productList.modal.importModal.successMessage', {total: result.totalProduct}),
                    //     closeCallback: onClickCancel
                    // })

                    importCallback(true)

                }

                setStIsLoading(false)
            })
            .catch(e => {
                GSToast.commonError();
                setStIsLoading(false)
            })
    }

    const onClickDownloadTemplate = () => {
        //DownloadUtils.saveDataToFile(CSVTemplates.ITEM_LIST, 'item-list-template.csv')
        AffiliateService.getPaymentImportTemplate().then(res => {
            const url = window.URL.createObjectURL(new Blob([res]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'payout-template-import.xlsx');
            document.body.appendChild(link);
            link.click();
        }).catch(e => {
            GSToast.commonError();
        });

    }

    const renderFileSize = (size) => {
        if (size < 1024 * 1024) {
            return parseFloat(size / 1024).toFixed(2) + ' KB'
        } else {
            return parseFloat(size / 1024 / 1024).toFixed(2) + ' MB'

        }
    }

    const onClickDelete = () => {
        setStFile(null);
        setImportResponse(IMPORT_COMMON);
    }

    return (
        <>
            <AlertModal ref={refImportAlert}/>
            {stIsLoading && <LoadingScreen zIndex={9999}/>}
            <Modal isOpen={stIsOpen} {...other} centered={true} fade={true} className="item-payment-list-import-modal">
                <ModalHeader>
                    <GSTrans t="page.affiliate.payout.import.modal.title"/>
                </ModalHeader>
                <ModalBody>
                    <div style={{fontWeight: "bold"}}>
                        <GSTrans t="page.affiliate.payout.import.modal.guideline"/>
                    </div>
                    <div className="guide-line-group">
                        <div className="guide-line-row">
                            <span className="guide-line-row-left">1.</span>
                            <span className="guide-line-row-right"><GSTrans t="page.affiliate.payout.import.modal.title1"/></span>
                        </div>
                        <div className="guide-line-row">
                            <span className="guide-line-row-left">2.</span>
                            <span className="guide-line-row-right"><GSTrans t="page.affiliate.payout.import.modal.title2"/></span>
                        </div>
                        <div className="guide-line-row">
                            <span className="guide-line-row-left">3.</span>
                            <span className="guide-line-row-right"><GSTrans t="page.affiliate.payout.import.modal.title3"/></span>
                        </div>
                    </div> 
                    
                    {!stFile &&
                        <Dropzone onDrop={onExcelUploaded}>
                            {({ getRootProps, getInputProps }) => (
                                    <div {...getRootProps()} className="item-list-import-modal__drop-zone mb-3">
                                        <input {...getInputProps()}
                                               accept=".xlsx"
                                               multiple={false}
                                        />
                                        <span className="item-list-import-modal__icon-upload"/>
                                        <p>
                                            <GSTrans t="page.customers.list.importModal.uploadFileHint"/>
                                            <br/>
                                            <GSTrans t="productList.modal.importModal.uploadFileSupportHint"/>
                                        </p>
                                    </div>
                            )}
                        </Dropzone>
                    }

                    {stFile &&
                        <div className="item-list-import-modal__file-zone mb-3">
                            <img src="/assets/images/icon-CSVfile.svg"
                                 alt="csv-icon"
                                 className="item-list-import-modal__icon-csv"
                            />
                            <div className="ml-2">
                                <span className="item-list-import-modal__file-name">
                                    {ImageUtils.ellipsisFileName(stFile.name, 20)}
                                </span>
                                <span className="item-list-import-modal__file-size">
                                    {renderFileSize(stFile.size)}
                                </span>
                            </div>
                            <div  className="item-list-import-modal__btn-delete">
                                <GSActionButton icon={GSActionButtonIcons.DELETE} onClick={onClickDelete}/>
                            </div>
                        </div>
                    }

                    {/* <span className="item-list-import-modal__download-template-text">
                        <GSTrans t="page.customers.list.importModal.dontHaveFile"/>
                        {' '}
                        <GSFakeLink onClick={onClickDownloadTemplate}>
                            <GSTrans t="productList.modal.importModal.downloadTemplate"/>
                        </GSFakeLink>
                    </span> */}

                    {
                        getImportResponse.hasError &&
                        <div className="item-list-import-modal-error-list">
                            <div className="item-list-import-modal-error-list-title">
                                <GSTrans t="" />
                                {i18next.t("page.affiliate.payout.import.modal.error_title")}
                            </div>
                            <div className="item-list-import-modal-error-list-list gs-atm__scrollbar-1">
                                {
                                    getImportResponse.lstError.map(error =>{
                                        return (
                                            <span>
                                                {error}
                                            </span>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    }

                </ModalBody>
                <ModalFooter>
                    <GSButton danger onClick={onClickCancel}>
                        <GSTrans t="common.btn.cancel"/>
                    </GSButton>
                    <GSButton success marginLeft disabled={!stFile} onClick={onClickImport}>
                        <GSTrans t="page.customers.list.import"/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        </>
    );
};

PaymentImport.propTypes = {
    isOpen: PropTypes.bool,
    cancelCallback: PropTypes.func,
    importCallback: PropTypes.func,
};

export default PaymentImport;

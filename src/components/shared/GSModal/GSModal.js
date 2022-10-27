/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/07/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useImperativeHandle, useState} from 'react';
import PropTypes from 'prop-types';
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import './GSModal.sass'
import i18next from "../../../config/i18n";
import ModalCustom from './ModelCustom'

/**
 * @deprecated
 */
const GSModal = (props, ref) => {

    const [stIsShowModal, setStIsShowModal] = useState(false);

    useImperativeHandle(ref,
        () => ({
            open: () => {
                open()
            },
            close: () => {
                close()
            }
        })
    );


    const open = () => {
        setStIsShowModal(true)
    }
    const close = () => {
        setStIsShowModal(false)
    }

    const mapThemeToClassName = () => {
        let classNameHeader, classNameBtn
        switch (props.theme) {
            case GSModalTheme.DANGER:
                classNameHeader = 'modal-danger';
                classNameBtn = 'btn-danger';
                break;
            case GSModalTheme.WARNING:
                classNameHeader = 'modal-warning';
                classNameBtn = 'btn-warning';
                break;
            case GSModalTheme.SUCCESS:
                classNameHeader = 'modal-success';
                classNameBtn = 'btn-success';
                break;
            case GSModalTheme.OK:
                classNameHeader = 'modal-success';
                classNameBtn = 'btn-success';
                break;
            case GSModalTheme.INFO:
                classNameHeader = 'modal-info';
                classNameBtn = 'btn-info';
                break;
            case GSModalTheme.CUSTOM:
                classNameHeader = 'modal-custom';
                classNameBtn = 'btn-custom';
                break;
            default:
                classNameHeader = 'modal-info';
                classNameBtn = 'btn-info';
        }
        return {
            classNameHeader: classNameHeader
        }
    }

    // render
    const {classNameHeader} = mapThemeToClassName()

    return (

        <div className="gs-modal" onClick={() => setStIsShowModal(true)}>
            {props.children}
            {
                props.isCustom &&
                <ModalCustom size="lg" style={{margin: 'auto'}}
                       isOpen={stIsShowModal} centered={true} fade={false}>
                    <ModalHeader toggle={close} className={classNameHeader} style={{background: '#546ce7', color:'#FFFFFF'}} charCode="x">
                        {props.title}
                    </ModalHeader>
                    <ModalBody>
                        {props.content}
                    </ModalBody>
                    <ModalFooter>
                        {props.footer &&
                        props.footer
                        }
                    </ModalFooter>
                </ModalCustom>
            }
            {
                !props.isCustom &&
                    <Modal isOpen={stIsShowModal} className={"alert-modal"} centered={true} fade={false}>
                        <ModalHeader className={classNameHeader}>
                            {props.title}
                        </ModalHeader>
                        <ModalBody>
                            {props.content}
                        </ModalBody>
                        <ModalFooter>
                            {props.footer &&
                            props.footer
                            }
                        </ModalFooter>
                    </Modal>
            }
        </div>
    );
};

export const GSModalTheme = {
    DANGER: 'danger',
    WARNING: 'warning',
    SUCCESS: 'success',
    INFO: 'info',
    OK: 'ok',
    CUSTOM: 'custom'
}

export const GSModalTitle = {
    ALERT: i18next.t('common.txt.alert.modal.title'),
    CONFIRM:  i18next.t('common.txt.confirm.modal.title')
}

GSModal.defaultProps = {
    isCustom: false
}
GSModal.propTypes = {
    title: PropTypes.any,
    content: PropTypes.any,
    footer: PropTypes.any,
    theme: PropTypes.oneOf(Object.values(GSModalTheme)),
    isCustom: PropTypes.bool
};



export default React.forwardRef(GSModal);

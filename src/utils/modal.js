/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 30/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/


import React, {useLayoutEffect, useRef} from "react";
import ReactDOM from "react-dom";
import AlertModal from "../components/shared/AlertModal/AlertModal";
import ConfirmModal from "../components/shared/ConfirmModal/ConfirmModal";

const PORTAL_DOM = document.getElementById("modal-root")

const ModalProvider = (props) => {
    const ref = useRef(null);

    useLayoutEffect(() => {
        if (ref.current) {
            ref.current.openModal(props.options)
        }
        return () => {
            PORTAL_DOM.innerHTML = ''
        }
    }, [ref.current])

    return props.children(ref)
}

/**
 *
 * @param {{
 *      type: AlertModalType,
 *      messages: string,
 *      closeCallback: function,
 *      title: string,
 *      modalBtn: string,
 *      showCloseHeaderButton: boolean
 * }} options
 */
const alert = (options) => {
    ReactDOM.render(
        <ModalProvider options={options}>
            {(ref) => <AlertModal ref={ref}/>}
        </ModalProvider>,
        PORTAL_DOM)
}

/**
 * Open confirm modal
 * @param {{
 *             messages: string,
*              messageHtml: string,
*              cancelCallback: function,
*              okCallback: function,
*              modalBtnOk: text,
*              modalBtnCancel: text,
*              modalTitle: string,
*              classNameHeader: string
 * }} options
 */
const confirm = (options) => {
    ReactDOM.render(
        <ModalProvider options={options}>
            {(ref) => <ConfirmModal ref={ref}/>}
        </ModalProvider>,
        PORTAL_DOM)
}

export const ModalPortal = {
    alert, confirm
}
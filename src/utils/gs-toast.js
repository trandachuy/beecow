/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 13/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import {toast} from "react-toastify";
import i18next from "i18next";

const error = (text, i18n = false) => {
    // toast(i18n? i18next.t(text):text, {type: "error"})
    toast(i18n? i18next.t(text):text, {type: "error"})
}
const commonError = (e) => {
    e && console.log(e)
    process.env.NODE_ENV === 'development' && console.error(new Error().stack);
    toast(i18next.t("common.api.failed"), {type: "error"})
}
const success = (text, i18n = false) => {
    toast(i18n? i18next.t(text):text, {type: "success"})
}
const warning = (text, i18n = false) => {
    toast(i18n? i18next.t(text):text, {type: "warning"})
}
const info = (text, i18n = false) => {
    toast(i18n? i18next.t(text):text, {type: "info"})
}
const normal = (text, i18n = false) => {
    toast(i18n? i18next.t(text):text, {type: "default"})
}

const commonCreate = () => {
    success("toast.create.success", true)
}

const commonUpdate = () => {
    success("toast.update.success", true)
}
const commonDelete = () => {
    success("toast.delete.success", true)
}

export const GSToast = {
    error, success, warning, info, normal, commonError,commonCreate, commonUpdate, commonDelete
}

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 09/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import {useState} from "react";

export const useSaving = (defaultValue = false) => {
    const [isSaving, setSaving] = useState(defaultValue);

    const stopSaving = () => {
        setSaving(false)
    }

    const startSaving = () => {
        setSaving(true)
    }

    return [isSaving, startSaving, stopSaving]
}
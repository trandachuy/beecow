/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 09/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import {useState} from "react";

export const useLoading = (defaultValue = false) => {
    const [isLoading, setLoading] = useState(defaultValue);

    const stopLoading = () => {
        setLoading(false)
    }

    const startLoading = () => {
        setLoading(true)
    }

    return [isLoading, startLoading, stopLoading]
}
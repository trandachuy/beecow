/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
const createAction = (type, payload) => {
    return {
        type: type,
        payload: payload
    }
}

export const ContextUtils = {
    createAction
}

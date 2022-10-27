/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 21/05/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
export default function useOnScrollDown(callback) {
    return (event) => {
        const obj = event.currentTarget
        if ((obj.scrollTop >= (obj.scrollHeight - obj.offsetHeight))) {
            callback(event)
        }
    }
}

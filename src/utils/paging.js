/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 25/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
const getTotalPageFromHeaders = (headers, sizePerPage) => {
    return Math.ceil(headers['x-total-count']/sizePerPage)
}

export const PagingUtils = {
    getTotalPageFromHeaders
}

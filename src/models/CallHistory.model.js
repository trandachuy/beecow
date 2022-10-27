/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/05/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
/**
 * @typedef CallHistoryModel
 * @type {{
 *     id: number,
 *     duration: number,
 *     storeId: number,
 *     customerId: number,
 *     customerName: string,
 *     toNumberPhone: string,
 *     status: {("SUCCESSFUL"|"DECLINED"|"NON_SUCCESSFUL")},
 *     type: {("OUTBOUND"|"INBOUND")},
 *     recordingUrl: string,
 *     fromExtension: number,
 *     callBy: string,
 *     callById: number,
 *     callId: number,
 *     timeStarted: string,
 *     timeEnd: string
 * }}
 */

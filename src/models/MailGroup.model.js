/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/


/**
 * @typedef MailGroupModel
 * @type {{
 *  id: number,
 *  name: string,
 *  createdBy: string,
 *  createdDate: string,
 *  description: string,
 *  lastModifiedBy: string,
 *  lastModifiedDate: string,
 *  mailTemplates: {
 *      id: number,
 *      mailId: string,
 *      name: string,
 *      description: string,
 *      content: string,
 *      createdBy: string,
 *      createdDate: string,
 *  }[]
 * }}
 */
export const MailGroupModel = {}

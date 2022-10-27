/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import apiClient from "../config/api";
import Constants from "../config/Constant";
import {CredentialUtils} from "../utils/credential";

const getMailGroup = () => {
  return new Promise((resolve, reject) => {
    apiClient
      .get(`${Constants.MAIL_SERVICE}/api/mail-groups`, {
        params: {
          page: 0,
          size: 1000,
          langKey: CredentialUtils.getLangKey(),
        },
      })
      .then((result) => {
        resolve(result.data);
      })
      .catch((e) => {});
  });
};

const getMailTemplateByGroup = (groupId, page, size = 12) => {
  return new Promise((resolve, reject) => {
    apiClient
      .get(`${Constants.MAIL_SERVICE}/api/mail-templates/by-group`, {
        params: {
          groupId,
          page,
          size,
          langKey: CredentialUtils.getLangKey(),
        },
      })
      .then((res) => {
        resolve({
          data: res.data,
          totalItem: parseInt(res.headers["x-total-count"]),
        });
      })
      .catch(reject);
  });
};

/**
 * Create / Update mail
 * @param {StoreMailRequestModel} request
 */
const saveMailService = (request) => {
  return new Promise((resolve, reject) => {
    const storeId = CredentialUtils.getStoreId()
    apiClient.put(`${Constants.MAIL_SERVICE}/api/store-mails/${storeId}`, request)
        .then(result => {
          resolve(result.data)
        })
        .catch(reject)
  })
}

/**
 * saveAndSendMailService
 * @param {StoreMailRequestModel} request
 */
const saveAndSendMailService = (request) => {
  return new Promise((resolve, reject) => {
    const storeId = CredentialUtils.getStoreId()
    apiClient.put(`${Constants.MAIL_SERVICE}/api/store-mails/${storeId}?send=true`, request)
        .then(result => {
          resolve(result.data)
        })
        .catch(reject)
  })
}

const getStoreMail = (id) => {
  return new Promise((resolve, reject) => {
    apiClient.get(`${Constants.MAIL_SERVICE}/api/store-mails/${id}`)
        .then(result => {
          resolve(result.data)
        })
        .catch(reject)
  })
}

const getMailTemplate = (id) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.MAIL_SERVICE}/api/mail-templates/${id}`)
            .then(result => {
                resolve(result.data)
            })
            .catch(reject)
    })
}

const getStoreMailByStore = (page, size, ignoreContent = false, searchParams) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`${Constants.MAIL_SERVICE}/api/store-mails/storeId/${storeId}`, {
            params: {
                ignoreContent,
                page,
                size,
                sort: 'lastModifiedDate,desc',
                ...searchParams
            }
        })
            .then(result => {
                resolve({
                    totalItem: parseInt(result.headers['x-total-count']),
                    data: result.data
                })
            })
            .catch(reject)
    })
}

const deleteStoreMail = (id) => {
    return new Promise((resolve, reject) => {
        apiClient.delete(`${Constants.MAIL_SERVICE}/api/store-mails/delete/${CredentialUtils.getStoreId()}/${id}`)
            .then(resolve)
            .catch(reject)
    })
}
const cloneStoreMail = (id) => {
    return new Promise((resolve, reject) => {
        apiClient.post(`${Constants.MAIL_SERVICE}/api/store-mails/clone/${CredentialUtils.getStoreId()}/${id}`)
            .then(resolve)
            .catch(reject)
    })
}

let blacklistDomains = [];
const getBlacklistDomains = async () => {
    if (blacklistDomains.length === 0) {
        const response = await apiClient.get(`${Constants.MAIL_SERVICE}/api/mails/domain/blacklist`);
        if (Constants.HTTP_STATUS_SUCCESS.includes(response.status)) {
            blacklistDomains = response.data;
        }
    }
    return blacklistDomains;
}

export const MailService = {
    getMailGroup,
    getMailTemplateByGroup,
    saveMailService,
    getStoreMail,
    saveAndSendMailService,
    getStoreMailByStore,
    getMailTemplate,
    deleteStoreMail,
    cloneStoreMail,
    getBlacklistDomains
};

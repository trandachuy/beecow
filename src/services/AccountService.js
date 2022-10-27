import apiClient from '../config/api';

class AccountService {
    getAccount() {
        return new Promise((resolve, reject) => {
            apiClient.get(`api/account`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(e => {
                    reject(e)
                });
        })
    }

    updateAccount(account) {
        return new Promise((resolve, reject) => {
            apiClient.post(`api/account2`, account)
                .then(
                    (result) => {
                        if (!!result && !!result.data) {
                            resolve(result.data)
                        }
                    },
                    (e) => {
                        reject(e)
                    }
                )
                // .catch(e => {
                //     reject(e)
                // })
        })
    }

    changePassword(passwordBody) {
        return new Promise((resolve, reject) => {
            apiClient.put(`api/account/change_password`, passwordBody)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(e => {
                    reject(e)
                })
        })
    }

    updateUserLanguage(langKey) {
        return new Promise((resolve, reject) => {
            apiClient.put(`api/users/updateUserLang/?langKey=${langKey}`)
                .then(result => {
                    resolve(result)
                })
                .catch(e => {
                    reject(e)
                })
        })
    }

    getUserById(id) {
        return new Promise((resolve, reject) => {
            apiClient.get(`api/users/id/${id}`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(e => {
                    reject(e)
                });
        })
    }

    getUserByIds(ids) {
        return new Promise((resolve, reject) => {
            apiClient.get(`api/users/ids`, {
                params: {
                    ids
                }
            })
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(e => {
                    reject(e)
                });
        })
    }

    getUserNameByIds(ids) {
        return new Promise((resolve, reject) => {
            apiClient.post(`api/users/get-user-info`, ids)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(e => {
                    reject(e)
                })
        })
    }

}

const accountService = new AccountService();
export default accountService;

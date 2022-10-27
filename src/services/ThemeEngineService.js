import apiClient from "../config/api";
import {CredentialUtils} from "../utils/credential";
import Constants from "../config/Constant";

const getMasterThemeLibrary = (storeId, {page, size, sort}) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/master-themes/library/store/${storeId}?page=${page}&size=${size}&sort=${sort}`)
            .then(result => {
                resolve(result);
            })
            .catch(reject)
    })
}

const getAllMasterThemes = ({page, size, sort}) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/master-themes?page=${page}&size=${size}&sort=${sort}`)
            .then(result => {
                resolve(result);
            })
            .catch(reject)
    })
}

const getStoreThemesById = (storeThemeId) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/store-themes/${storeThemeId}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const getStoreThemesByStoreId = () => {
    const storeId = CredentialUtils.getStoreId()

    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/store-themes/store/${storeId}/management`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const getStoreThemesForTransfer = () => {
    const storeId = CredentialUtils.getStoreId()

    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/store-themes/store/${storeId}/transfer`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const publishStoreTheme = (storeThemeId) => {
    const storeId = CredentialUtils.getStoreId()

    return new Promise((resolve, reject) => {
        apiClient.put(`${Constants.SSR_STOREFRONT}/api/store-themes/store/${storeId}/publish`, storeThemeId)
            .then(resolve)
            .catch(reject)
    })
}

const publishStorePage = (storePageId) => {
    const storeId = CredentialUtils.getStoreId()

    return new Promise((resolve, reject) => {
        apiClient.put(`${Constants.SSR_STOREFRONT}/api/store-pages/store/${storeId}/publish/${storePageId}`)
            .then(resolve)
            .catch(reject)
    })
}

const checkPublishNewTheme = _ => {
    const storeId = CredentialUtils.getStoreId();
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/store-themes/store/${storeId}/publish`)
            .then(result => resolve(result.data.published))
            .catch(reject)
    });
}

const previewMasterTheme = (masterThemeId) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/master-themes/preview`, {masterThemeId})
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const getComponentMaster = (platform) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/master-components/search?platform=${platform}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, error => {
                console.log(error);
                reject(error);
            })
    })
}

const getComponentMasterType = (platform, isVisible = false, targetPage) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/master-components/type-list?platform=${platform}&isVisible=${isVisible}&targetPage=${targetPage}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, error => {
                console.log(error);
                reject(error);
            })
    })
}

const getComponentMasterByType = (platform, type, isVisible, targetPage) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/master-components/get-by-type?platform=${platform}&cpType=${type}&isVisible=${isVisible}&targetPage=${targetPage}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, error => {
                console.log(error);
                reject(error);
            })
    })
}

const removeStoreTheme = (storeThemeId) => {
    return new Promise((resolve, reject) => {
        apiClient.delete(`${Constants.SSR_STOREFRONT}/api/store-themes/${storeThemeId}`)
            .then(resolve)
            .catch(reject)
    })
}

const getMasterPagesByMasterThemeId = (masterThemeId, options = {
    ignoreContent: false,
    editable: false,
}) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/master-pages/theme/${masterThemeId}?ignoreContent=${options.ignoreContent}&editable=${options.editable}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const getStorePagesByStoreThemeId = (storeThemeId, options = {
    ignoreContent: false,
    editable: false,
}) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/store-pages/theme/${storeThemeId}?ignoreContent=${options.ignoreContent}&editable=${options.editable}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const modifiedPageByThemeId = (masterThemeId, lang = "vi") => {
    const storeId = CredentialUtils.getStoreId();
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/store-themes/store/${storeId}/load-theme?lang=${lang}&masterThemeId=${masterThemeId}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const modifiedClonePageByStoreIdAndThemeId = (masterThemeId, storeThemeId, lang = "vi") => {
    const storeId = CredentialUtils.getStoreId();

    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/store-themes/store/${storeId}/load-theme?lang=${lang}&masterThemeId=${masterThemeId}&storeThemeId=${storeThemeId}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const modifiedPageByStoreId = (storeThemeId, pageType, lang = "vi") => {
    const storeId = CredentialUtils.getStoreId()

    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/store-themes/store/${storeId}/load-theme?lang=${lang}&type=EDIT&storeThemeId=${storeThemeId}&pageType=${pageType}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const getUIComponent = (data = {storeId: "", content: ""}, lang = "vi") => {
    const storeId = CredentialUtils.getStoreId();
    data.storeId = storeId;

    return new Promise((resolve, reject) => {
        apiClient.post(`${Constants.SSR_STOREFRONT}/api/preview/internal-components?lang=${lang}`, data)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const saveStorePageContent = (data = [{id: "", content: ""}], customName) => {
    const storeId = CredentialUtils.getStoreId();
    //save using theme
    return new Promise((resolve, reject) => {
        apiClient.put(`${Constants.SSR_STOREFRONT}/api/preview/store-pages/store/${storeId}`, {pages: data, customName})
            .then(resolve)
            .catch(reject)
    })
}

const saveMasterPageContent = (masterThemeId, data = [{id: "", content: ""}], customName) => {
    const storeId = CredentialUtils.getStoreId();
    //save using theme
    return new Promise((resolve, reject) => {
        apiClient.post(`${Constants.SSR_STOREFRONT}/api/preview/store-pages/store/${storeId}`, {
            masterThemeId,
            pages: data,
            customName
        })
            .then(resolve)
            .catch(reject)
    })
}

const saveNewPageTheme = (data = {id: "", content: ""}) => {
    const storeId = CredentialUtils.getStoreId();
    //save new theme
    return new Promise((resolve, reject) => {
        apiClient.post(`${Constants.SSR_STOREFRONT}/api/preview/store-pages/store/${storeId}`, {pages: [data]})
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const cloneFromMasterThemeById = (masterThemeId) => {
    const storeId = CredentialUtils.getStoreId();

    return new Promise((resolve, reject) => {
        apiClient.post(`${Constants.SSR_STOREFRONT}/api/store-pages/${storeId}/clone-from/theme-id/${masterThemeId}`)
            .then(result => {
                resolve(result);
            })
            .catch(reject)
    })
}

const getCustomPageInThemeEngine = (storeThemeId, pageType, customPageId, lang = "vi") => {
    const storeId = CredentialUtils.getStoreId();

    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/store-themes/store/${storeId}/load-custom-page?lang=${lang}&type=EDIT&storeThemeId=${storeThemeId}&pageType=${pageType}&pageId=${customPageId}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const saveCustomPageOnStoreTheme = (storeThemeId, data = [{id: "", content: ""}]) => {
    const storeId = CredentialUtils.getStoreId();
    //save using theme
    return new Promise((resolve, reject) => {
        apiClient.put(`${Constants.SSR_STOREFRONT}/api/preview/store-pages/store/${storeId}/custom-page/${storeThemeId}`, {pages: data})
            .then(resolve)
            .catch(reject)
    })
}

const getMasterThemeById = (masterThemeId) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.SSR_STOREFRONT}/api/master-themes/${masterThemeId}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(reject)
    })
}

const validateSeoLink = (url, params) => {
    return new Promise((resolve, reject) => {
        if (!url) {
            return resolve()
        }

        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`${ Constants.SSR_STOREFRONT }/api/seo-links/validate/store/${ storeId }`, {
            params: { url, ...params }
        })
            .then(resolve)
            .catch(reject)
    })
}

const getPreviewMasterPage = (viewName, themeId) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`${ Constants.SSR_STOREFRONT }/api/preview/master-pages/${ viewName }/themes/${ themeId }/store/${ storeId }`, {}, {
            responseType: 'blob'
        })
            .then(({ data }) => resolve(URL.createObjectURL(data.slice(0, data.size, 'text/html'))))
            .catch(reject)
    })
}

export const ThemeEngineService = {
    getAllMasterThemes,
    getStoreThemesById,
    getMasterThemeLibrary,
    getStoreThemesByStoreId,
    getStoreThemesForTransfer,
    publishStoreTheme,
    previewMasterTheme,
    getComponentMaster,
    removeStoreTheme,
    getMasterPagesByMasterThemeId,
    getStorePagesByStoreThemeId,
    getComponentMasterType,
    getComponentMasterByType,
    modifiedPageByThemeId,
    modifiedClonePageByStoreIdAndThemeId,
    modifiedPageByStoreId,
    getUIComponent,
    saveStorePageContent,
    saveMasterPageContent,
    saveNewPageTheme,
    publishStorePage,
    cloneFromMasterThemeById,
    getCustomPageInThemeEngine,
    saveCustomPageOnStoreTheme,
    getMasterThemeById,
    checkPublishNewTheme,
    validateSeoLink,
    getPreviewMasterPage
}

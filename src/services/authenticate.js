import apiClient from '../config/api';
import storageService from './storage';
import Constant from "../config/Constant";
import {UserDomainModel} from "../components/shared/model/index";
import SwitchProfileModel from "../components/shared/model/SwitchProfileModel";
import RefreshTokenModel from "../components/shared/model/RefreshTokenModel";
import i18next from "i18next";
import {CredentialUtils} from "../utils/credential";
import storeService from "./StoreService";
import StoreService from "./StoreService";
import {ImageUtils} from "../utils/image";
import beehiveService from "./BeehiveService";
import $ from 'jquery';

class Authenticate {

    checkAuthenticate() {
        return new Promise((resolve, reject) => {
            apiClient.get('/api/authenticate')
                .then(result => {
                    console.log('====>' + JSON.stringify(result));
                    if (result.data) {
                        resolve(result);
                    } else {
                        result['message'] = 'err.required.login';
                        reject(result);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    forgotEmail(email) {
        return new Promise((resolve, reject) => {
            const body = {email: email};
            apiClient.post('/api/account/reset_password/email/gosell', body)
                .then(() => {
                    resolve();
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    forgotPhone(countryCode, phoneNumber) {
        return new Promise((resolve, reject) => {
            const body = {
                "countryCode": countryCode,
                "phoneNumber": phoneNumber
            };
            apiClient.post('/api/account/reset_password/mobile/gosell', body)
                .then(() => {
                    resolve();
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    reset(key, password) {
        return new Promise((resolve, reject) => {
            const body = {
                key: key,
                newPassword: password
            };
            this.doLoginProcess(resolve, reject, '/api/account/reset_password/finish/gosell', body);
        });
    }

    loginEmail(username, password, isRemember) {
        return new Promise((resolve, reject) => {
            const body = {
                username: username,
                password: password,
                rememberMe: isRemember
            };
            this.doLoginProcess(resolve, reject, '/api/authenticate/store/email/gosell', body);
        });
    }

    loginPhone(countryCode, phoneNumber, password, isRemember) {
        return new Promise((resolve, reject) => {
            const body = {
                mobile: {
                    countryCode: countryCode,
                    phoneNumber: phoneNumber
                },
                password: password,
                rememberMe: isRemember
            };
            this.doLoginProcess(resolve, reject, '/api/authenticate/store/phone/gosell', body);
        });
    }

    loginFacebook(accessToken, langKey) {
        return new Promise((resolve, reject) => {
            const body = {
                token: accessToken,
                langKey: langKey
            };
            this.doLoginProcess(resolve, reject, '/api/social/signin/store/facebook?domain=gosell', body);
        });
    }

    staffLogin(username, password, storeId, isRemember) {
        return new Promise((resolve, reject) => {
            const body = {
                username: username,
                password: password,
                rememberMe: isRemember
            };
            this.doLoginProcess(resolve, reject, `/api/authenticate/store/${storeId}/staff`, body);
        });
    }

    staffLoginByUrl(username, password, storeUrl, isRemember) {
        return new Promise((resolve, reject) => {
            const body = {
                username: username,
                password: password,
                rememberMe: isRemember,
                url: storeUrl
            };
            this.doLoginProcess(resolve, reject, `/api/authenticate/store/staff`, body);
        });
    }

    preStaffLogin(username, password, isRemember) {
        return new Promise((resolve, reject) => {
            const body = {
                username: username,
                password: password,
                rememberMe: isRemember
            };
            apiClient.post(`/api/authenticate/mobile`, body)
                .then(response => {
                    this.setCredential(response.data.accessToken, response.data.refreshToken);
                    storageService.setToLocalStorage(Constant.STORAGE_KEY_USER_ID, response.data.id);
                    resolve(response);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    switchToStaffOfStore( storeId) {
        return new Promise((resolve, reject) => {
            this.doLoginProcess(resolve, reject, `/api/authenticate/store/${storeId}/switch-staff`);
        });
    }

    async doLoginProcess(resolve, reject, url, body) {
        try {
            let response = await apiClient.post(url, body);
            this.setCredential(response.data.accessToken, response.data.refreshToken);
            storageService.setToLocalStorage(Constant.STORAGE_KEY_USER_ID, response.data.id);
            storageService.setToLocalStorage(Constant.STORAGE_KEY_LANG_KEY, response.data.langKey);
            i18next.changeLanguage(response.data.langKey);

            let warnings = [], store;
            // Check warning NO STORE
            if (!response.data.store) {
                warnings.push('no-store');
            } else {
                store = response.data.store;
                storageService.setToLocalStorage(Constant.STORAGE_KEY_STORE_ID, response.data.store.id);

                // get the initial language
                StoreService.getInitialLanguage(response.data.store.id).then(res => {
                    if(res){
                        storageService.setToLocalStorage(Constant.STORAGE_KEY_INITIAL_LANGUAGE, res.langCode);
                    }else{
                        storageService.setToLocalStorage(Constant.STORAGE_KEY_INITIAL_LANGUAGE, "vi");
                    }
                }).catch(e => {
                    storageService.setToLocalStorage(Constant.STORAGE_KEY_INITIAL_LANGUAGE, "vi");
                });
            }
            // Check warning NO DOMAIN
            if (!response.data.settings.domain || response.data.settings.domain.indexOf('gosell') === -1) {
                warnings.push('no-domain');
            }

            // Check warning NO CONFIG
            if (!response.data.settings.mobileConfig) {
                warnings.push('no-config');
            }

            // Check warning 2fa required
            if (response.data.settings.warnings === 'accountVerifyRequired') {
                warnings.push('accountVerifyRequired')
            }

            //BH-8602 Check password's changed
            if (response.data.settings.warnings === 'passwordChanged') {
                storageService.setToSessionStorage(Constant.STORAGE_KEY_FORCE_LOGOUT, true);
                storageService.setToSessionStorage(Constant.STORAGE_KEY_FORCE_LOGOUT_REASON_PASSWORD_CHANGED, true);
            }

            // In case of Login Successful

            // Store reseller information
            if (response.data.settings.reseller) {
                storageService.setToSessionStorage(Constant.STORAGE_KEY_RESELLER_FROM_STORE_NAME,
                        response.data.settings.reseller.resellerFromStoreName
                    )
                storageService.setToSessionStorage(Constant.STORAGE_KEY_RESELLER_FROM_STORE_ID,
                        response.data.settings.reseller.resellerFromStoreId
                    )
            }

            // For AppRouter logic
            if (warnings.length === 0) {
                storageService.setToLocalStorage(Constant.STORAGE_KEY_STORE_FULL, Constant.STORAGE_KEY_STORE_FULL);
                // get data in first time
                const storeRes = await storeService.getStoreInfo(response.data.store.id)
                CredentialUtils.setStoreOwnerId(storeRes.ownerId)
                CredentialUtils.setStoreName(storeRes.name)
                CredentialUtils.setStoreUrl(storeRes.url)

                if (storeRes.showSupportChat && process.env.ENABLE_INTERCOM == 'true') {
                    window.Intercom('show');
                    storeService.showSupportChat();
                }

                const storeLogoRes = await storeService.getLogos()
                CredentialUtils.setStoreImage(ImageUtils.getImageFromImageModel(storeLogoRes.shopLogo))

                const role = await beehiveService.getCurrentPlan()
                CredentialUtils.setPackageName(role.packageName)
                CredentialUtils.setExpiredTimeInMS(role.userFeature.expiredPackageDate)
                CredentialUtils.setRegTime(role.userFeature.registerPackageDate)
                CredentialUtils.setPackageType(role.userFeature.packagePay)
                CredentialUtils.setPackageId(role.userFeature.packageId)

                // reduxStore.dispatch(setStoreInfo({
                //     name: storeRes.name,
                //     url: storeRes.url,
                //     image: ImageUtils.getImageFromImageModel(storeLogoRes.shopLogo)
                // }))
            }
            resolve({
                warnings: warnings,
                store: store,
                email: response.data.email,
                phone: response.data.mobile ? response.data.mobile.countryCode + response.data.mobile.phoneNumber : undefined
            });
        }
        catch (e) {
            reject(e);
        }
    }

    signUpEmail(email, password, displayName, langKey) {
        return new Promise((resolve, reject) => {
            const body = {
                email: email,
                password: password,
                displayName: displayName,
                locationCode: 'VN-SG',
                langKey: langKey,
            };
            apiClient.post('/api/register/gosell', body)
                .then(response => {
                    this.setCredential(response.data.accessToken, response.data.refreshToken);
                    storageService.setToLocalStorage(Constant.STORAGE_KEY_USER_ID, response.data.id);
                    resolve(response);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }



    signUpPhone(countryCode, phoneNumber, password, displayName, langKey) {
        return new Promise((resolve, reject) => {
            const body = {
                password: password,
                displayName: displayName,
                locationCode: 'VN-SG',
                langKey: langKey,
                mobile: {
                    countryCode: countryCode, // Default for Vietnam
                    phoneNumber: phoneNumber
                }
            };
            apiClient.post('/api/register/gosell', body)
                .then(response => {
                    this.setCredential(response.data.accessToken, response.data.refreshToken);
                    storageService.setToLocalStorage(Constant.STORAGE_KEY_USER_ID, response.data.id);
                    resolve(response);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    activate(userId, activationCode) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/api/activate/gosell?userId=${userId}&key=${activationCode}`)
                .then(response => {
                    this.setCredential(response.data.accessToken, response.data.refreshToken);
                    storageService.setToLocalStorage(Constant.STORAGE_KEY_USER_ID, response.data.id);
                    storageService.setToLocalStorage(Constant.STORAGE_KEY_LANG_KEY, response.data.langKey);
                    let warnings = [], store;
                    // Check warning NO STORE
                    if (!response.data.store) {
                        warnings.push('no-store');
                    } else {
                        store = response.data.store;
                        storageService.setToLocalStorage(Constant.STORAGE_KEY_STORE_ID, response.data.store.id);

                        // get the initial language
                        StoreService.getInitialLanguage(response.data.store.id).then(res => {
                            if(res){
                                storageService.setToLocalStorage(Constant.STORAGE_KEY_INITIAL_LANGUAGE, res.langCode);
                            }else{
                                storageService.setToLocalStorage(Constant.STORAGE_KEY_INITIAL_LANGUAGE, "vi");
                            }
                        }).catch(e => {
                            storageService.setToLocalStorage(Constant.STORAGE_KEY_INITIAL_LANGUAGE, "vi");
                        });
                    }
                    // Check warning NO DOMAIN
                    if (!response.data.settings.domain || response.data.settings.domain.indexOf('gosell') === -1) {
                        warnings.push('no-domain');
                    }

                    // Check warning NO CONFIG
                    if (!response.data.settings.mobileConfig) {
                        warnings.push('no-config');
                    }

                    // In case of Login Successful
                    // For AppRouter logic
                    if (warnings.length === 0) {
                        storageService.setToLocalStorage(Constant.STORAGE_KEY_STORE_FULL, Constant.STORAGE_KEY_STORE_FULL);
                    }
                    resolve({
                        warnings: warnings,
                        store: store,
                        email: response.data.email,
                        phone: response.data.mobile ? response.data.mobile.countryCode + response.data.mobile.phoneNumber : undefined
                    });
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    resendActivationCode(userId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/api/resend-activation-code/gosell?userId=${userId}`)
                .then(response => {
                    resolve();
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    addBeehiveDomain(userId) {
        return new Promise((resolve, reject) => {
            const body = new UserDomainModel(null, 'gosell', userId);
            apiClient.post('/api/user-domains', body)
                .then(response => {
                    resolve(response);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    getCredential() {
        return storageService.get(Constant.STORAGE_KEY_ACCESS_TOKEN);
    }

    getStoreId() {
        return storageService.get(Constant.STORAGE_KEY_STORE_ID);
    }

    setCredential(accessToken, refreshToken) {
        storageService.setToLocalStorage(Constant.STORAGE_KEY_REFRESH_TOKEN, refreshToken);
        storageService.setToLocalStorage(Constant.STORAGE_KEY_ACCESS_TOKEN, accessToken);
    }

    signOut() {
        apiClient.get('/api/logout')
            .then(response => {

            });
        storageService.removeAll()

        if (process.env.ENABLE_INTERCOM == 'true') {
            $('#supportBtnArrow').fadeOut();
            window.Intercom('hide');
            window.Intercom('shutdown');
        }
    }

    switchProfile(pageId, authorType) {
        return new Promise((resolve, reject) => {
            const body = new SwitchProfileModel(pageId, authorType);
            apiClient.post('/api/authenticate/switch-profile', body)
                .then(response => resolve(response.data))
                .catch(e => {
                    console.error(e);
                    reject(e);
                });
        });
    }

    refreshJwt(refreshToken) {
        return new Promise((resolve, reject) => {
            const body = new RefreshTokenModel(refreshToken);
            this.doLoginProcess(resolve, reject, '/api/authenticate/refresh', body);
        });
    }

    verifyAccount(verifyCode) {
        return new Promise((resolve, reject) => {
            this.doLoginProcess(resolve, reject, '/api/verify/store', {verifyCode: verifyCode});
        });
    }

    resendVerifyCode() {
        return new Promise((resolve, reject) => {
            apiClient.post(`/api/verify/store/resend`)
                .then(response => {
                    resolve();
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
}

const authenticate = new Authenticate();
export default authenticate;

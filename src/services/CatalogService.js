import apiClient from '../config/api';
import Constants from "../config/Constant";
import storageService from "./storage";

class CatalogService {

    /** @typedef {object} CountryVM
     * @property {string} code
     * @property {number} countryId
     * @property {string} currencyCode
     * @property {string} currencySymbol
     * @property {ImageDTO} flag
     * @property {number} id
     * @property {string} inCountry
     * @property {string} name
     * @property {string} outCountry
     * @property {number} phoneCode
     * @property {boolean} show
     */

    /** @typedef {object} ImageDTO
     * @property {string} emoji
     * @property {number} id
     * @property {number} imageId
     * @property {string} urlPrefix
     */

    /**
     *
     * @param params
     * @return {Promise<unknown>}
     */
    getCategories(params) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/terms/tree`, {
                params: params
            })
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    /**
     *
     * @param options
     * @param paging
     * @return {Promise<unknown>}
     */
    getCountries(options = {
        withCities: false
    }, paging = {
        page: 0,
        size: 300,
        sort: 'outCountry,asc'
    }) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/countries`, {
                params: {
                    ...paging,
                    ...options
                }
            })
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                })
                .catch(reject);
        });
    }

    getCitesOfCountry(countryCode) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/country/${countryCode}/cities`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getDistrictsOfCity(cityCode) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/city/${cityCode}/districts`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getWardsOfDistrict(districtCode) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/district/${districtCode}/wards`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getDistrict(districtCode) {
        let _districts = JSON.parse(storageService.getFromSessionStorage('_districts')) || [];
        let cached = _districts.find(x => x.code === districtCode)
        if (cached)
            return Promise.resolve(cached.value)

        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/districts/code/${districtCode}`)
                .then(result => {
                    if (result.data) {
                        // Get again
                        _districts = JSON.parse(storageService.getFromSessionStorage('_districts')) || [];
                        _districts.push({code: districtCode, value: result.data});
                        storageService.setToSessionStorage('_districts', JSON.stringify(_districts));
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getWard(wardCode) {
        let _wards = JSON.parse(storageService.getFromSessionStorage('_wards')) || [];
        let cached = _wards.find(x => x.code === wardCode)
        if (cached)
            return Promise.resolve(cached.value)

        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/wards/code/${wardCode}`)
                .then(result => {
                    if (result.data) {
                        // Get again
                        _wards = JSON.parse(storageService.getFromSessionStorage('_wards')) || [];
                        _wards.push({code: wardCode, value: result.data});
                        storageService.setToSessionStorage('_wards', JSON.stringify(_wards));
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getCity(cityCode) {
        let _cities = JSON.parse(storageService.getFromSessionStorage('_cities')) || [];
        let cached = _cities.find(x => x.code === cityCode)
        if (cached)
            return Promise.resolve(cached.value)

        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/city/${cityCode}`)
                .then(result => {
                    if (result.data) {
                        // Get again
                        _cities = JSON.parse(storageService.getFromSessionStorage('_cities')) || [];
                        _cities.push({code: cityCode, value: result.data});
                        storageService.setToSessionStorage('_cities', JSON.stringify(_cities));
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getCountry(countryCode) {
        let _countries = JSON.parse(storageService.getFromSessionStorage('_countries')) || [];
        let cached = _countries.find(x => x.code === countryCode)
        if (cached)
            return Promise.resolve(cached.value)

        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/countries/code/${countryCode}?withCities=false`)
                .then(result => {
                    if (result.data) {
                        // Get again
                        _countries = JSON.parse(storageService.getFromSessionStorage('_countries')) || [];
                        _countries.push({code: countryCode, value: result.data});
                        storageService.setToSessionStorage('_countries', JSON.stringify(_countries));
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getCitiesTreeByCountryCode(countryCode) {
        let _country_cities_tree = JSON.parse(storageService.getFromSessionStorage('_country_cities_tree')) || [];
        let cached = _country_cities_tree.find(x => x.code === countryCode)
        if (cached)
            return Promise.resolve(cached.value)

        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/country/${countryCode}/cities/tree`)
                .then(result => {
                    if (result.data) {
                        // Get again
                        _country_cities_tree = JSON.parse(storageService.getFromSessionStorage('_country_cities_tree')) || [];
                        _country_cities_tree.push({code: countryCode, value: result.data});
                        storageService.setToSessionStorage('_country_cities_tree', JSON.stringify(_country_cities_tree));
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getListBankInfo() {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/bank-infos`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    exchangeRateVN(currencyCode) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/package-currencies/currency-code/${currencyCode}`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getShippingProviderList() {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CATALOG_SERVICE}/api/paypal-carriers/search`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
}

const catalogService = new CatalogService();
export default catalogService;

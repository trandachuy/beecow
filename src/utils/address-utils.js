import catalogService from '../services/CatalogService'
import i18next from 'i18next'

const buildAddress = (address, districtCode, wardCode, cityCode, options = {
    fullAddress: true,
    langCode: null
}) => {
    return buildAddressInside(address, districtCode, wardCode, cityCode, null, options)
}

const buildAddressWithCountry = (address, districtCode, wardCode, cityCode, countryCode, options = {
    fullAddress: true,
    langCode: null,
    // In case of orders, API GET returns names instead of codes for district, ward & city
    // So if isOrderShippingAddress = true, districtCode, wardCode & cityCode are names instead of codes
    isOrderShippingAddress: false,
}, optionalFields = {
    address2: '',
    city: '',
    zipCode: ''
}) => {
    if (countryCode && countryCode !== 'VN') {
        return buildAddressOutside(address, optionalFields.address2, cityCode, countryCode, optionalFields.city, optionalFields.zipCode, options)
    }

    return buildAddressInside(address, districtCode, wardCode, cityCode, countryCode, options)
}

const buildAddressInside = (address, districtCode, wardCode, cityCode, countryCode, options) => {
    return Promise.resolve()
        .then(() => {
            //ACTUALLY DISTRICT_CODE IS WARD_CODE
            // if (!address) {
            //     return
            // }

            let allPromise = []

            options = {
                fullAddress: true,
                ...options
            }
            address && allPromise.push({
                inCountry: address,
                outCountry: address
            })
            // isNames means that wardCode, districtCode, cityCode are names, not codes
            let isNames = options.isOrderShippingAddress;
            wardCode && allPromise.push(isNames? Promise.resolve({inCountry: wardCode, outCountry: wardCode}) : catalogService.getWard(wardCode))
            districtCode && allPromise.push(isNames? Promise.resolve({inCountry: districtCode, outCountry: districtCode}) : catalogService.getDistrict(districtCode))
            cityCode && allPromise.push(isNames? Promise.resolve({inCountry: cityCode, outCountry: cityCode}) : catalogService.getCity(cityCode))
            countryCode && allPromise.push(catalogService.getCountry(countryCode))

            return Promise.all(allPromise)
        })
        .then(values => {
            if (!values?.length) return ''

            const addressNames = values.map(item => (options.langCode || i18next.language) === 'vi' ? item.inCountry : item.outCountry)

            if (!options.fullAddress) {
                const [address, wardName, districtName, cityName, countryName] = addressNames

                return {
                    address,
                    wardName,
                    districtName,
                    cityName,
                    countryName
                }
            }
            return addressNames.filter(Boolean).join(', ')
        })
}

const buildAddressOutside = (address, address2, stateCode, countryCode, city, zipCode, options) => {
    return Promise.resolve()
        .then(() => {
            //ACTUALLY DISTRICT_CODE IS WARD_CODE
            // if (!address) {
            //     return
            // }

            let allPromise = []

            options = {
                fullAddress: true,
                ...options
            }
            address && allPromise.push({
                inCountry: address,
                outCountry: address
            })
            address2 && allPromise.push({
                inCountry: address2,
                outCountry: address2
            })
            city && allPromise.push({
                inCountry: city,
                outCountry: city
            })
            stateCode && allPromise.push(catalogService.getCity(stateCode))
            zipCode && allPromise.push({
                inCountry: zipCode,
                outCountry: zipCode
            })
            countryCode && allPromise.push(catalogService.getCountry(countryCode))

            return Promise.all(allPromise)
        })
        .then(values => {
            if (!values?.length) return ''

            const addressNames = values.map(item => item.outCountry)

            if (!options.fullAddress) {
                const [address, address2, city, cityName, zipCode, countryName] = addressNames

                return {
                    address,
                    address2,
                    city,
                    cityName,
                    zipCode,
                    countryName
                }
            }

            return addressNames.filter(Boolean).join(', ')
        })
}

// Get customer addresses from List<CustomerProfile> items
const fetchAddresses = async items => {
    const promises = items.map(item => {
        let address = item?.customerAddress;
        if (!address)
            return Promise.resolve('');
        else return AddressUtils.buildAddressWithCountry(
            address.address,
            address.districtCode,
            address.wardCode,
            address.locationCode,
            address.countryCode,
            {fullAddress: true},
            {
                address2: address.address2,
                city: address.city,
                zipCode: address.zipCode
            })
            .then(fullAddress => item.fullAddress = fullAddress)
            .catch(_ => item.fullAddress = '');
    });
    await Promise.all(promises);
    return items;
}

const getAddressInsiteName = (wardCode, districtCode, cityCode) => {
    return Promise.resolve()
        .then(() => {
            let allPromise = []
            wardCode && allPromise.push(catalogService.getWard(wardCode))
            districtCode && allPromise.push(catalogService.getDistrict(districtCode))
            cityCode && allPromise.push(catalogService.getCity(cityCode))
            return Promise.all(allPromise)
        })
}
export const AddressUtils = {
    buildAddress,
    buildAddressWithCountry,
    getAddressInsiteName,
    fetchAddresses
}

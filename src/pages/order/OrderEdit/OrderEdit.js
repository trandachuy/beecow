import React, {useCallback, useEffect, useRef, useState} from 'react'
import './OrderEdit.sass'
import i18next from 'i18next'
import {Trans} from 'react-i18next'
import {AvField, AvForm, AvRadio, AvRadioGroup} from 'availity-reactstrap-validation'
import _ from 'lodash'
import {SEARCH_BY_ENUM} from '../../customers/List/BarcodePrinter/CustomerListBarcodePrinter'
import ConfirmModal from '../../../components/shared/ConfirmModal/ConfirmModal'
import AlertModal from '../../../components/shared/AlertModal/AlertModal'
import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen'
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer'
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader'
import GSContentBody from '../../../components/layout/contentBody/GSContentBody'
import Constants from '../../../config/Constant'
import GSWidgetHeader from '../../../components/shared/form/GSWidget/GSWidgetHeader'
import GSWidget from '../../../components/shared/form/GSWidget/GSWidget'
import GSWidgetContent from '../../../components/shared/form/GSWidget/GSWidgetContent'
import GSTable from '../../../components/shared/GSTable/GSTable'
import {CurrencyUtils, NumberUtils} from '../../../utils/number-format'
import GSTrans from '../../../components/shared/GSTrans/GSTrans'
import GSButton from '../../../components/shared/GSButton/GSButton'
import {FormValidate} from '../../../config/form-validate'
import AvFieldCurrency from '../../../components/shared/AvFieldCurrency/AvFieldCurrency'
import {RouteUtils} from '../../../utils/route'
import GSFakeLink from '../../../components/shared/GSFakeLink/GSFakeLink'
import {NAV_PATH} from '../../../components/layout/navigation/AffiliateNavigation'
import {ItemUtils} from '../../../utils/item-utils'
import GSImg from '../../../components/shared/GSImg/GSImg'
import Loading from '../../../components/shared/Loading/Loading'
import GSSearchInput from '../../../components/shared/GSSearchInput/GSSearchInput'
import GSContentHeaderRightEl
    from '../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl'
import {GSToast} from '../../../utils/gs-toast'
import {ItemService} from '../../../services/ItemService'
import useDebounceEffect from '../../../utils/hooks/useDebounceEffect'
import {UikSelect} from '../../../@uik'
import {Link} from 'react-router-dom'
import {BCOrderService} from '../../../services/BCOrderService'
import beehiveService from '../../../services/BeehiveService'
import {Label, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import catalogService from '../../../services/CatalogService'
import {OrderService} from '../../../services/OrderService'
import {CredentialUtils} from '../../../utils/credential'
import authenticate from '../../../services/authenticate'
import storageService from '../../../services/storage'
import PropTypes from "prop-types";

const SEARCH_TYPE = {
    PRODUCT: {
        value: SEARCH_BY_ENUM.PRODUCT,
        label: i18next.t('inventoryList.tbheader.variationName')
    },
    BARCODE: {
        value: SEARCH_BY_ENUM.BARCODE,
        label: i18next.t('page.product.list.printBarCode.barcode')
    },
    SKU: {
        value: 'SKU',
        label: 'SKU'
    }
}

const HEADER = {
    SKU: i18next.t('page.orders.returnOrder.table.SKU'),
    PRODUCT_NAME: i18next.t('page.orders.returnOrder.table.productName'),
    QUANTITY: i18next.t('page.orders.returnOrder.table.returnQuantity'),
    ORDERED_PRICE: i18next.t('page.orders.returnOrder.table.orderedPrice'),
    TOTAL: i18next.t('page.orders.returnOrder.table.total')
}

const SEARCH_PAGE_SIZE = 20

const VALIDATE_INPUT = {
    MIN: 0,
}

const OrderEdit = props => {
    const {currency, ...others} = props
    const bcOrderId = props.match?.params?.bcOrderId

    const [stIsSaving, setStIsSaving] = useState(false)
    const [stIsEdited, setStIsEdited] = useState(false)
    const [stEditorMode, setStEditorMode] = useState(Constants.PURCHASE_ORDER_MODE.CREATE)
    const [stSelectedDestination, setStSelectedDestination] = useState({value: undefined})
    const [stFilter, setStFilter] = useState({
        searchType: SEARCH_TYPE.PRODUCT,
        page: 0,
        size: SEARCH_PAGE_SIZE,
        total: 0,
        isScroll: false
    })
    const [stSearchResult, setStSearchResult] = useState()
    const [stSelectedProducts, setStSelectedProducts] = useState([])
    const [stIsSearching, setStIsSearching] = useState(false)
    const [stShowLoading, setStShowLoading] = useState(false)
    const [stOrderDetail, setStOrderDetail] = useState({})
    const [stCustomerProfile, setStCustomerProfile] = useState({})
    const [stVAT, setStVAT] = useState(0)
    const [stmodalAddCustomer, setStmodalAddCustomer] = useState(false);
    const [stCheckedNumberPhone, setStCheckedNumberPhone] = useState(false);
    const [stCustomerCountryOutside, setStCustomerCountryOutside] = useState('VN');
    const [stCountries, setStCountries] = useState([])
    const [stProvince, setStProvince] = useState([])
    const [stDistrict, setStDistrict] = useState([])
    const [stWard, setStWard] = useState([])
    const [stCustomerAddress, setStCustomerAddress] = useState('');
    const [stCustomerAddress2, setStCustomerAddress2] = useState('');
    const [stCustomerLocation, setStCustomerLocation] = useState('');
    const [stCustomerDistrict, setStCustomerDistrict] = useState('');
    const [stCustomerWard, setStCustomerWard] = useState('');
    const [stCustomerLocationOutside, setStCustomerLocationOutside] = useState('');
    const [stCustomerCityOutside, setStCustomerCityOutside] = useState('');
    const [stCustomerZipCodeOutside, setStCustomerZipCodeOutside] = useState('');
    const [stRequiredAddress, setStRequiredAddress] = useState(false);
    const [stDefaultShippingFee, setStDefaultShippingFee] = useState(null);
    const [stFeeSelfDelivery, setStFeeSelfDelivery] = useState([]);
    const [stDefaultValueFeeSelfDelivery, setStDefaultValueFeeSelfDelivery] = useState(0);
    const [stValueFeeSelfDelivery, setStValueFeeSelfDelivery] = useState(0);
    const [stEarnedPoint, setStEarnedPoint] = useState(0);
    const [stDebtAmount, setStDebtAmount] = useState(0);
    const [stLoyaltyPoints, setStLoyaltyPoints] = useState(0);
    const [stDataWholeSale, setStDataWholeSale] = useState([]);
    const [stDataMembership, setStDataMembership] = useState({});
    const [stDataWholesalePrice, setStDataWholesalePrice] = useState([]);
    const [stNote, setStNote] = useState('')
    const [stGetStockProduct, setStGetStockProduct] = useState([])
    const [stInsufficientErrorGroup, setStInsufficientErrorGroup] = useState([])
    const [stIsButtonUpdateChanges, setStIsButtonUpdateChanges] = useState(false)

    const [, updateState] = useState()
    const forceUpdate = useCallback(() => updateState({}), [])

    const refConfirmModal = useRef()
    const refAlertModal = useRef()
    const refForm = useRef()
    const refSearchInput = useRef()
    const refIsScrolled = useRef(false)
    const refAddCustomerForm = useRef(null);

    useEffect(() => {
        catalogService.getCitesOfCountry(Constants.CountryCode.VIETNAM).then(res => setStProvince(res))

        catalogService.getCountries()
            .then(countries => {
                setStCountries(countries)
            })
    }, [])

    useEffect(() => {
        getVAT(stSelectedProducts)
        fetchCalculateLoyaltyEarnPoint(stOrderDetail, stSelectedProducts)
        fetchCheckMembership(stSelectedProducts.map(p=>({...p,price:findWholesalePrice(p) ? findWholesalePrice(p).price : p.price,branchId: stOrderDetail.storeBranch.id})), 
            stOrderDetail.customerInfo?.userId)
    }, [stDataWholesalePrice])


    useEffect(() => {
        setStShowLoading(true)
        BCOrderService.getOrderDetail(bcOrderId).then(order => {
            if (order.orderInfo.status !== Constants.ORDER_STATUS_TO_SHIP
                || order.orderInfo.deliveryName !== Constants.DeliveryNames.SELF_DELIVERY) {
                RouteUtils.redirectWithoutReload(props, NAV_PATH.notFound)
                return
            }
            if (order.orderInfo.pointAmount > 0 ||
                (order.orderInfo.discount.totalDiscount > 0
                    && order.orderInfo.discount.discountType !== 'WHOLE_SALE' && !order.orderInfo.membershipInfo)) {
                RouteUtils.redirectWithoutReload(props, NAV_PATH.notFound)
                return
            }

            fetchGetStockOrderEdit(order.items.map(item => {
                    return item.variationId ? `${item.itemId}-${item.variationId}` : item.itemId
                }).toString(),
                order.storeBranch.id ? order.storeBranch.id : 'ALL')
            fetchCustomerSummary(order.customerInfo.userId, order.orderInfo.channel)
            fetchAllCalculatedLoyaltyPointTypes(order.customerInfo.userId)
            beehiveService.getCustomerProfile(order.customerInfo.userId, order.orderInfo.channel).then(customer => {
                setStCustomerProfile(customer)
            })
            fetchCheckWholeSale(order.items.map(item => {
                return {...item, branchId: order.storeBranch.id, modelId: item?.variationId}
            }), order.customerInfo.userId, order.storeBranch.id)

            const total = order.items.reduce((acc, obj) => {
                return acc + (obj.quantity * obj.price)
            }, 0)

            setStSelectedProducts(order.items.map(i => ({
                ...i,
                modelId: i.variationId,
                quantity: i.quantity,
                maxQuantity: i.quantity
            })))

            setStSelectedDestination({
                id: order.storeBranch.id,
                label: order.storeBranch.name,
                value: order.storeBranch.id,
                isDefault: true
            })
            setStOrderDetail(order)
            setStCustomerCountryOutside(order.shippingInfo.countryCode)
            setStValueFeeSelfDelivery(order.orderInfo.shippingFee)
            setStDefaultValueFeeSelfDelivery(order.orderInfo.shippingFee)
            setStDefaultShippingFee({
                country: order.shippingInfo.countryCode,
                fullName: order.shippingInfo.contactName,
                phone: order.shippingInfo.phone,
                selfDeliveryFee: order.orderInfo.shippingFee,
                address: order.shippingInfo.address1,
                cityCode: order.shippingInfo.insideCityCode,
                districtCode: order.shippingInfo.district,
                wardCode: order.shippingInfo.ward,
                address2: order.shippingInfo.address2,
                province: order.shippingInfo.insideCityCode,
                city: order.shippingInfo.outSideCity,
                zipCode: order.shippingInfo.zipCode
            })
            if (order.shippingInfo.countryCode === 'VN') {
                fetchShippingInfoInside(order.shippingInfo.countryCode, order.shippingInfo.address1
                    , order.shippingInfo.insideCityCode, order.shippingInfo.district, order.shippingInfo.ward, total)
            } else {
                fetchShippingInfoOutside(order.shippingInfo.countryCode, order.shippingInfo.address1,
                    order.shippingInfo.address2, order.shippingInfo.insideCityCode, order.shippingInfo.outSideCity, order.shippingInfo.zipCode)
            }

        }).finally(()=>{
            setStShowLoading(false)
        })
    }, [])

    const fetchGetStockOrderEdit = (itemModelIds, branchId) => {
        ItemService.getStockOrderEdit(itemModelIds, branchId)
            .then(data => {
                setStGetStockProduct(data)
            })
        // .catch(GSToast.commonError);

    }

    const fetchCheckWholesalePrice = (prod, userId, checkWholeSale) => {
        const request = prod.map(item => {
            return {
                itemId: item.itemId,
                itemModelIds: item.modelId ? `${item.itemId}_${item.modelId}` : item.itemId,
                quantity: item.quantity,
                userId: userId,
                storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
                saleChannel: Constants.SaleChannels.GOSELL,
                branchId: item.branchId
            }
        })


        if (userId) {
            ItemService.listWholesalePrice(request)
                .then(result => {
                    if(_.isEmpty(result)){
                        setStDataWholesalePrice([])
                        return
                    }
                    setStDataWholesalePrice(result)
                })
        }
    }

    const fetchCheckMembership = (productList, userId, storeBranchId) => {
        if (userId) {
            if(stDataWholeSale.length > 0){
                setStDataMembership({})
                return
            }
            BCOrderService.checkMembership(productList, userId, storeBranchId)
                .then(data => {
                    setStDataMembership(data)
                })
            // .catch(GSToast.commonError);
        }
    }

    const fetchCheckWholeSale = (productList, userId) => {
        if (userId) {
            BCOrderService.checkWholeSale(productList, userId)
                .then(data => {
                    setStDataWholeSale(data)
                    fetchCheckWholesalePrice(productList, userId)
                })
            // .catch(GSToast.commonError);
        }
    }

    const fetchAllCalculatedLoyaltyPointTypes = (userId) => {
        if (userId) {
            BCOrderService.getAllCalculatedLoyaltyPointTypes(authenticate.getStoreId(), userId)
                .then(data => {
                    const availablePoint = data.find(item => item.event === "EARN");
                    if (availablePoint && availablePoint.value) {
                        setStLoyaltyPoints(availablePoint.value);
                    }
                })
                .catch(GSToast.commonError);
        }
    }

    const fetchCustomerSummary = (userId, siteCode) => {
        if (userId) {
            BCOrderService.getCustomerSummary(userId, siteCode)
                .then((result) => {
                    setStDebtAmount(result?.debtAmount)
                })
        }
    }

    const fetchShippingInfoInside = (countryCode, address1, insideCityCode, district, ward, total) => {
        if (countryCode === 'VN') {
            setStCustomerAddress(address1)
            setStCustomerLocation(insideCityCode)
            catalogService.getDistrictsOfCity(insideCityCode).then(districts => {
                setStDistrict(districts);
                setStCustomerDistrict(district)
            })

            catalogService.getWardsOfDistrict(district).then(wardList => {
                setStWard(wardList);
                setStCustomerWard(ward);
            })
            fetchFeeSelfDelivery(insideCityCode, total)
        }
    }


    const fetchShippingInfoOutside = (countryCode, address1, address2, insideCityCode, outSideCity, zipCode) => {
        if (countryCode !== 'VN') {
            setStCustomerAddress(address1)
            setStCustomerAddress2(address2)
            catalogService.getCitesOfCountry(countryCode).then(res => {
                setStProvince(res)
                setStCustomerLocationOutside(insideCityCode)
                setStCustomerCityOutside(outSideCity)
                setStCustomerZipCodeOutside(zipCode)
            })
        }
    }

    const fetchFeeSelfDelivery = (insideCityCode, total) => {
        let request = {
            deliveryAddress: {
                locationCode: insideCityCode,
                districtCode: 10,
                wardCode: 10,
            },
            packageInfo: {
                length: 10, // set a unknow value -> no need on server
                width: 10, // set a unknow value -> no need on server
                height: 10, // set a unknow value -> no need on server
                weight: 10, // set a unknow value -> no need on server
                totalPrice: total
            },
        };

        OrderService.checkShippingFeeSelfDelivery(request)
            .then((res) => {
                setStFeeSelfDelivery(res)
            })
            .catch((e) => {
                GSToast.commonError();
            });
    }

    const fetchCalculateLoyaltyEarnPoint = (order, productList) => {
        if (!order.customerInfo?.userId) {
            return
        }
        BCOrderService.calculateLoyaltyEarnPoint({
            storeId: CredentialUtils.getStoreId(),
            langKey: CredentialUtils.getLangKey(),
            platform: "IN_STORE",
            userId: order.customerInfo?.userId,
            earnPointType: "IN_STORE",
            usePoint: null,
            earnPointItems: productList.map(product => ({
                itemId: product.itemId,
                modelId: !_.isNil(product.modelId) ? product.modelId : null,
                price: findWholesalePrice(product) ? findWholesalePrice(product).price : product.price,
                quantity: product.quantity,
                branchId: order.storeBranch.id,
                wholesalePricingId: findWholesalePrice(product) ? findWholesalePrice(product).id : null
            }))
        })
            .then(result => {
                setStEarnedPoint(result.earnPoint)
            })
            .catch(() => {
                // GSToast.error(i18next.t("common.api.failed"))
            })
    }

    useEffect(() => {
        let isRequired = stCustomerAddress !== '' || stCustomerLocation !== ''
            || stCustomerDistrict !== '' || stCustomerWard !== '' || stCustomerCountryOutside !== '' || stCustomerLocationOutside !== ''
            || stCustomerCityOutside !== '' || stCustomerZipCodeOutside !== '';
        setStRequiredAddress(isRequired);
        if (refAddCustomerForm.current) {
            refAddCustomerForm.current.setTouched('address');
            refAddCustomerForm.current.setTouched('cityCode');
            refAddCustomerForm.current.setTouched('districtCode');
            refAddCustomerForm.current.setTouched('wardCode');
            refAddCustomerForm.current.setTouched('country');
            refAddCustomerForm.current.setTouched('province');
            refAddCustomerForm.current.setTouched('city');
            refAddCustomerForm.current.setTouched('zipCode');
            if (!isRequired) {
                refAddCustomerForm.current.validateAll();
            }
        }
    }, [stCustomerAddress, stCustomerLocation, stCustomerDistrict, stCustomerWard,
        stCustomerCountryOutside, stCustomerLocationOutside, stCustomerCityOutside, stCustomerZipCodeOutside]);


    useDebounceEffect(() => {
        if (stEditorMode === Constants.PURCHASE_ORDER_MODE.WIZARD) {
            return
        }

        if (!stSelectedDestination.value) {
            return
        }

        setStIsSearching(true)

        const {page, size, searchType, keyword, isScroll} = stFilter

        if (!isScroll) {
            setStSearchResult()
        }

        ItemService.getProductSuggestionByName(page, size, searchType.value, keyword, false, stSelectedDestination.value, {
            includeConversion: true
        })
            .then(result => {
                const total = parseInt(result.headers['x-total-count'])

                setStSearchResult(current => isScroll ? [...(current || []), ...result.data] : result.data)
                setStFilter(filter => ({
                    ...filter,
                    total
                }))
            })
            .catch(() => GSToast.commonError())
            .finally(() => {
                setStIsSearching(false)
                refIsScrolled.current = false
            })
    }, 500, [stFilter.searchType, stFilter.keyword, stFilter.page, stSelectedDestination.value])

    const getPlaceHolderSearch = () => {
        let translatedText = ''
        switch (stFilter.searchType.value) {
            case SEARCH_BY_ENUM.PRODUCT:
                translatedText = 'page.product.list.printBarCode.searchByProduct'
                break
            case SEARCH_BY_ENUM.BARCODE:
                translatedText = 'page.product.list.printBarCode.searchByBarcode'
                break
            case 'SKU':
                translatedText = 'page.product.list.printBarCode.searchBySKU'
                break
            default:
                break
        }
        return i18next.t(translatedText)
    }

    const findWholesalePrice = (product) => {
        const findWholeSale = stDataWholeSale.find(item => item.modelId ? handleParseInt(item.modelId) === handleParseInt(product.modelId) :
            handleParseInt(item.itemId) === handleParseInt(product.itemId))
        if (findWholeSale) {
            return null;
        }

        const findWholesalePrice = stDataWholesalePrice?.find(item => product?.modelId ? handleParseInt(item?.itemModelIds.split('_')[1]) === handleParseInt(product?.modelId) :
            handleParseInt(item?.itemId) === handleParseInt(product?.itemId))
        return findWholesalePrice;
    }
    const handleParseInt = (id) =>{
        return parseInt(id)
    }

    const getProductTotalRow = (product) => {
        const totalProduct = stSelectedProducts.find(p => p.id === product.id)
        return CurrencyUtils.formatMoneyByCurrency(totalProduct.quantity * (findWholesalePrice(product) ? findWholesalePrice(product).price : totalProduct.price), currency)
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop)

        return afterCal <= (el.clientHeight + 1)
    }

    const handleOnValidSubmit = (e, data) => {
        if (stSelectedProducts.length === 0) {
            GSToast.error("page.order.edit.empty", true)
            return
        }
        const request = {
            bcOrderId: bcOrderId,
            cartItemVMs:
                stSelectedProducts.map(item => {
                    return {
                        itemId: item.itemId,
                        modelId: item.modelId ? item.modelId : null,
                        quantity: item.quantity,
                        branchId: stOrderDetail.storeBranch.id
                    }
                }),
            deliveryInfo: {
                address: stDefaultShippingFee.address,
                contactName: stDefaultShippingFee.fullName,
                districtCode: stDefaultShippingFee.districtCode,
                email: stCustomerProfile.email,
                locationCode: stDefaultShippingFee.country === "VN" ? stDefaultShippingFee.cityCode : stDefaultShippingFee.city,
                phoneNumber: stDefaultShippingFee.phone,
                wardCode: stDefaultShippingFee.wardCode,
                countryCode: stDefaultShippingFee.country,
                city: stDefaultShippingFee.country === "VN" ? stDefaultShippingFee.cityCode : stDefaultShippingFee.city,
                province: stDefaultShippingFee.province,
                address2: stDefaultShippingFee.address2,
                zipCode: stDefaultShippingFee.zipCode,
            },
            deliveryServiceId: 14,
            selfDeliveryFee: stDefaultShippingFee.selfDeliveryFee,
            editNote: stNote
        }

        setStShowLoading(true)
        BCOrderService.editOrder(request)
            .then(result => {
                setStIsEdited(false)
                RouteUtils.redirectWithoutReload(props, NAV_PATH.orderDetail + '/' + stOrderDetail?.orderInfo?.channel.toLowerCase() + '/' + bcOrderId)
                GSToast.commonUpdate()
            })
            .catch(e => {
                if (e.response.data && e.response.data.params && e.response.data.params.itemErrors && e.response.data.params.itemErrors.length > 0) {
                    const deletedItemListFromResponse = e.response.data.params.itemErrors.filter(res => res.message === 'error.item.notFound' || res.message === 'error.item.deleted')
                    const outStockProductFromResponse = e.response.data.params.itemErrors.filter(res => res.message === 'error.item.outOfStock');
                    const quantityInvalidFromResponse = e.response.data.params.itemErrors.filter(res => res.message === 'error.order.orderItems.quantity.invalid');
                    const insufficientStockFromResponse = e.response.data.params.itemErrors.filter(res => res.message === 'error.item.insufficientStock');

                    // first: detect deleted product
                    if (deletedItemListFromResponse.length > 0) {
                        let deletedItemList = []

                        for (const deletedItem of deletedItemListFromResponse) {
                            const matchedItems = stSelectedProducts.filter(product => {
                                const detail = deletedItem.params
                                return detail.itemId === +(product.itemId)
                            })
                            if (matchedItems.length > 0) {
                                matchedItems.forEach(item => {
                                    const indexDeletedItem = _.findIndex(deletedItemList, (p => p.id === item.id))
                                    if (indexDeletedItem === -1) {
                                        deletedItemList.push({
                                            ...item,
                                            deleted: true
                                        })
                                    }
                                })

                            }
                        }
                        let productNewList = _.cloneDeep(stSelectedProducts)
                        deletedItemList.forEach(item => {
                            let index = _.findIndex(productNewList, (p => p.id === item.id))
                            // if quantity is invalid -> reset previous value
                            const orgQuantity = productNewList[index].quantity
                            productNewList[index] = item
                            productNewList[index].quantity = productNewList[index].quantity < 1 ? orgQuantity : productNewList[index].quantity
                        })
                        setStSelectedProducts(productNewList)
                        GSToast.error('page.order.instorePurchase.productHasBeenDeletedWarning', true)
                        return
                    }

                    // if has no deleted product -> check outstock
                    if (outStockProductFromResponse.length > 0) {
                        let outOfStockItemList = []
                        for (const product of stSelectedProducts) {
                            const outStockProduct = outStockProductFromResponse.find(p => {
                                const detail = p.params
                                if (detail.modelId) {
                                    return detail.itemId == product.itemId && detail.modelId == product.modelId
                                } else {
                                    return detail.itemId == product.itemId
                                }
                            })
                            if (outStockProduct) {
                                outOfStockItemList.push({
                                    ...product,
                                    maxQuantity: outStockProduct.params.remainingQuantity,
                                    quantity: outStockProduct.params.quantity
                                })
                                setStGetStockProduct(objId => {
                                    delete objId[outStockProduct.params.modelId
                                        ? `${outStockProduct.params.itemId}-${outStockProduct.params.modelId}` : outStockProduct.params.itemId]
                                    return objId
                                })
                            }
                        }
                        let updateProductList = _.cloneDeep(stSelectedProducts)
                        for (let product of updateProductList) {
                            const outOfStockProduct = outOfStockItemList.find(({id}) => id === product.id)
                            if (outOfStockProduct) {
                                product.itemStock = outOfStockProduct.quantity
                                product.maxQuantity = outOfStockProduct.maxQuantity
                                product.quantity = outOfStockProduct.quantity
                            }
                        }
                        setStSelectedProducts(updateProductList);
                        GSToast.error('page.order.create.complete.quantityModal.subTitle', true)
                        return
                    }

                    // check invalid
                    if (quantityInvalidFromResponse.length > 0) {
                        GSToast.error('page.order.instorePurchase.productInvalidQuantity', true);
                        return;
                    }

                    // check insufficent stock
                    // check insufficent stock
                    if (insufficientStockFromResponse.length > 0) {
                        const insufficientGroup = insufficientStockFromResponse.map(i => i.params.itemModelIds)

                        setStInsufficientErrorGroup(insufficientGroup)
                        GSToast.error('page.order.instorePurchase.productInsufficientStock', true)
                        return
                    }

                    return
                }

                if (e.response.data.description === "Not support already paid"){
                    GSToast.error('page.orders.orderList.detail.editOrder.notAllowATM', true)
                    return;
                }
                
                GSToast.commonError()
            })
            .finally(() => {
                setStShowLoading(false)
            })
    }

    const handleScroll = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!refIsScrolled.current) {
            const totalPage = parseInt(stFilter.total / stFilter.size)

            if (isBottom(e.currentTarget) && stFilter.page < totalPage) {
                refIsScrolled.current = true

                setStFilter(filter => ({
                    ...filter,
                    isScroll: true,
                    page: filter.page + 1
                }))
            }
        }
    }

    const handleSelectProduct = (product) => {
        const index = stSelectedProducts.findIndex(p => p.modelId ? p.modelId == product.modelId : p.itemId == product.itemId)

        //WHY? To collapse search result list
        $('.edit-order-form .search-result').blur()
        setStIsButtonUpdateChanges(true)
        if (index !== -1) {
            if (stSelectedProducts[index].flashSale){
                return
            }
            stSelectedProducts[index].quantity = stSelectedProducts[index].quantity + 1
            let rest = stSelectedProducts.filter((_, idx) =>  idx !== index);
            setStSelectedProducts([stSelectedProducts[index], ...rest])
            forceUpdate()
            return
        }
        setStSelectedProducts(products => [{
            ...product,
            quantity: 1,
            maxQuantity: product.itemStock,
            isFirstMaxQuantity:+(product.itemStock) === 0 ?  true : false
        }, ...products])
        setStIsEdited(true)
        setStIsButtonUpdateChanges(true)
    }

    const handleDeleteProduct = (e, prod) => {
        e.preventDefault()

        const products = stSelectedProducts.filter(product => product.id !== prod.id)

        setStSelectedProducts(products)
        setStGetStockProduct(objId => {
            delete objId[prod.modelId ? `${prod.itemId}-${prod.modelId}` : prod.itemId]
            return objId
        })
        setStIsButtonUpdateChanges(true)
        setStIsEdited(true)
        handleClearInsufficientErrorGroup(prod)
    }

    const getVAT = (productList) => {
        if (productList.length > 0) {
            BCOrderService.checkVAT(productList.map(p => {
                return {
                    itemId: p.itemId,
                    price: findWholesalePrice(p) ? findWholesalePrice(p).price : p.price,
                    modelId: p.modelId,
                    quantity: p.quantity,
                    wholesalePricingId: findWholesalePrice(p) ? findWholesalePrice(p).id : null
                }
            })).then(vatRes => {
                const totalVATAmount = vatRes.totalVATAmount || 0
                return setStVAT(totalVATAmount)
            })
        } else {
            // reset VAT
            return setStVAT(0)
        }
    }

    const getSubtotal = () => {
        if (stSelectedProducts.length > 0) {
            return stSelectedProducts.reduce((acc, obj) => {
                return acc + (obj.quantity * (findWholesalePrice(obj) ? findWholesalePrice(obj)?.price : obj.price))
            }, 0)
        }
    }

    const getTotal = () => {
        return (getSubtotal() + +(stDefaultShippingFee?.selfDeliveryFee) + stVAT) - getDiscount()
    }

    const handleClearInsufficientErrorGroup = ({itemId, modelId}) => {
        const id = ItemUtils.computeItemModelIdV2(itemId, modelId)
        setStInsufficientErrorGroup(group => group.filter(i => !i.includes(id)))
    }

    const handleChangeQuantity = (e, id) => {

        let quantity = +(e.target.value)
        const index = stSelectedProducts.findIndex(qt => qt.id === id)
        
        if (index !== -1) {
            setStSelectedProducts(state => {
                state[index].quantity = quantity < 1 ? 1 : quantity
                state[index].isFirstMaxQuantity = false
                return state
            })
        }
        setStIsButtonUpdateChanges(true)
        forceUpdate()
    }

    const onClickCustomerInformation = (customerProfile) => {
        let url = `${NAV_PATH.customers.CUSTOMERS_EDIT}/${customerProfile.id}/${customerProfile.userId}/${customerProfile.saleChannel}`
        RouteUtils.openNewTab(url)
    }

    const handleSave = () => {
        handleOnValidSubmit()
    }

    const handleUpdateChanges = () => {
        fetchCheckWholeSale(stSelectedProducts.map(item => {
                return {...item, branchId: stOrderDetail.storeBranch.id}
            })
            , stOrderDetail.customerInfo.userId)
        setStIsButtonUpdateChanges(false)
        handleCheckProductDelete()
    }

    const getDiscount = () => {
        return stDataWholeSale.length > 0 ? stDataWholeSale.reduce((acc, obj) => {
            return acc + obj.discountAmount
        }, 0) : (stDataMembership.promoAmount || 0)
    }

    const handleValidShippingFeeSubmit = (event, value) => {
        setStValueFeeSelfDelivery(+(value.selfDeliveryFee))
        setStDefaultValueFeeSelfDelivery(+(value.selfDeliveryFee))
        setStDefaultShippingFee(value)
        toggleModalCustomer()
    };

    const toggleModalCustomer = (e) => {
        if (e) e.stopPropagation()
        setStCheckedNumberPhone(false)
        setStmodalAddCustomer(!stmodalAddCustomer)

        fetchShippingInfoInside(stDefaultShippingFee.country, stDefaultShippingFee.address
            , stDefaultShippingFee.cityCode, stDefaultShippingFee.districtCode, stDefaultShippingFee.wardCode, getSubtotal())

        fetchShippingInfoOutside(stDefaultShippingFee.country, stDefaultShippingFee.address,
            stDefaultShippingFee.address2, stDefaultShippingFee.province, stDefaultShippingFee.city, stDefaultShippingFee.zipCode)

    };

    const handleCountry = (countryCode) => {
        if (!countryCode) {
            return
        }

        catalogService.getCitesOfCountry(countryCode).then(res => setStProvince(res))
        setStCustomerCountryOutside(countryCode)
        if (countryCode === 'VN') {
            fetchFeeSelfDelivery(stCustomerLocation, getSubtotal())
        } else {
            setStFeeSelfDelivery([])
        }

    }


    const onClickCancelAddCustomer = (e) => {
        e.preventDefault(); // avoid fire submit action
        setStCheckedNumberPhone(false);
        toggleModalCustomer();

        fetchShippingInfoInside(stDefaultShippingFee.country, stDefaultShippingFee.address
            , stDefaultShippingFee.cityCode, stDefaultShippingFee.districtCode, stDefaultShippingFee.wardCode, getSubtotal())

        fetchShippingInfoOutside(stDefaultShippingFee.country, stDefaultShippingFee.address,
            stDefaultShippingFee.address2, stDefaultShippingFee.province, stDefaultShippingFee.city, stDefaultShippingFee.zipCode)

        setStValueFeeSelfDelivery(stDefaultValueFeeSelfDelivery)
        setStDefaultShippingFee(state => ({
            ...state,
            selfDeliveryFee: stDefaultValueFeeSelfDelivery,
        }))

    };

    const onChangeFeeSelfDelivery = (e) => {
        const value = +(e.target.value)
        setStValueFeeSelfDelivery(value)
        setStDefaultShippingFee(state => ({
            ...state,
            selfDeliveryFee: value,
        }))
    }

    const handleStyleErrorDelete = (css, deleted) => {
        if (deleted) {
            return `${css} error-delete`
        } else {
            return `${css}`
        }
    }
    
    const handleCheckProductDelete = () =>{
        const requestItems = {
            bcOrderId: bcOrderId,
            editOrderItems: stSelectedProducts.map(item => {
                return {
                    itemId: item.itemId,
                    modelId: item.modelId,
                    quantity: item.quantity,
                    branchId: stOrderDetail.storeBranch.id
                }
            })
        }

        BCOrderService.validateOrderItemDeleted(requestItems)
            .catch(e => {
                if (e.response.data && e.response.data.params && e.response.data.params.itemErrors && e.response.data.params.itemErrors.length > 0) {
                    const deletedItemListFromResponse = e.response.data.params.itemErrors.filter(res => res.message === 'error.item.notFound' || res.message === 'error.item.deleted')

                    // first: detect deleted product
                    if (deletedItemListFromResponse.length > 0) {
                        let deletedItemList = []

                        for (const deletedItem of deletedItemListFromResponse) {
                            const matchedItems = stSelectedProducts.filter(product => {
                                const detail = deletedItem.params
                                return detail.modelId ? detail.modelId === +(product.modelId) : detail.itemId === +(product.itemId)
                            })
                            if (matchedItems.length > 0) {
                                matchedItems.forEach(item => {
                                    const indexDeletedItem = _.findIndex(deletedItemList, (p => p.id === item.id))
                                    if (indexDeletedItem === -1) {
                                        deletedItemList.push({
                                            ...item,
                                            deleted: true
                                        })
                                    }
                                })

                            }
                        }
                        let productNewList = _.cloneDeep(stSelectedProducts)
                        deletedItemList.forEach(item => {
                            let index = _.findIndex(productNewList, (p => p.id === item.id))
                            // if quantity is invalid -> reset previous value
                            productNewList[index] = item
                            productNewList[index].quantity = productNewList[index].maxQuantity
                        })
                        setStSelectedProducts(productNewList)
                        GSToast.error('page.order.instorePurchase.productHasBeenDeletedWarning', true)
                        return
                    }

                    return
                }
            })
            .finally(() => handleClearInsufficientErrorGroup(stSelectedProducts[index]))
    }

    const renderInsufficientStockError = ({itemId, modelId}) => {
        if (stInsufficientErrorGroup.some(i => i.includes(ItemUtils.computeItemModelIdV2(itemId, modelId)))) {
            return <span className='error'><GSTrans t='page.orders.POS.InstorePurchase.error.insufficientStock'/></span>
        }
    }

    const renderHeader = () => {
        return (
            <div className="edit-order-form-header">
                <div className="title">
                    <Link
                        to={NAV_PATH.orderDetail + '/' + stOrderDetail?.orderInfo?.channel.toLowerCase() + '/' + bcOrderId}
                        className="color-gray mb-2 d-block text-capitalize">
                        &#8592; <GSTrans t="page.order.edit.backToOrderDetail"/>
                    </Link>
                    <h5 className="gs-page-title">
                        {
                            i18next.t('page.order.edit.editOrder', {x: bcOrderId})
                        }
                    </h5>
                </div>


                <GSContentHeaderRightEl className="d-flex">
                    {!stIsButtonUpdateChanges &&
                    <GSButton success marginLeft
                              onClick={handleSave}
                    >
                        <Trans i18nKey="common.btn.save" className="sr-only">
                            Cancel
                        </Trans>
                    </GSButton>
                    }
                    {stIsButtonUpdateChanges &&
                    <GSButton success marginLeft
                              onClick={handleUpdateChanges}
                    >
                        <Trans i18nKey="page.order.editOrder.updateChanges" className="sr-only">
                            Cancel
                        </Trans>
                    </GSButton>
                    }
                    
                    <GSButton onClick={
                        () => {
                            refConfirmModal.current.openModal({
                                messages: <GSTrans t="page.order.edit.unsaved"/>,
                                okCallback: () => {
                                    RouteUtils.redirectWithoutReload(props, NAV_PATH.orderDetail + '/' + stOrderDetail?.orderInfo?.channel.toLowerCase() + '/' + bcOrderId)
                                }
                            })
                        }
                    } secondary outline marginLeft>
                        <Trans i18nKey="common.btn.cancel"/>
                    </GSButton>
                </GSContentHeaderRightEl>
            </div>
        )
    }

    const renderSearchBox = () => {
        return (
            <div className="search-box-wrapper">
                <span className="search-box">
                    <GSSearchInput
                        ref={refSearchInput}
                        liveSearchOnMS={500}
                        className="flex-grow-1"
                        style={{
                            height: '38px'
                        }}
                        wrapperProps={{
                            style: {
                                height: '38px',
                                width: '100%'
                            }
                        }}
                        defaultValue={stFilter.keyword}
                        placeholder={getPlaceHolderSearch()}
                        onSearch={(keyword, e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setStFilter(filter => ({
                                ...filter,
                                isScroll: false,
                                page: 0,
                                keyword
                            }))
                        }}
                    />
                    {
                        stSearchResult
                            ? <div className="search-result"
                                   style={{zIndex: 5}}
                                   tabIndex="0"
                                   onScroll={handleScroll}>
                                {
                                    stSearchResult.map(r => {
                                        return (
                                            <div key={r.id}
                                                 className={[
                                                     "search-item gsa-hover--gray cursor--pointer",
                                                     r.parentId ? "conversion-item" : ""
                                                 ].join(' ')}
                                                 onClick={() => handleSelectProduct(r)}
                                            >
                                                <GSImg src={r.itemImage} width={70} height={70}/>
                                                <div className="d-flex flex-column ml-3">
                                                    <span className='white-space-pre'>{r.itemName}</span>
                                                    {r.barcode && <span
                                                        className="color-gray font-size-_8rem">{r.barcode.split('-').join(' - ')}</span>}
                                                    {r.modelName && <span
                                                        className="font-size-_8rem">{r.modelName.split('|').filter(n => n !== Constants.DEPOSIT_CODE.FULL).join(' | ')}</span>}
                                                </div>
                                                <span
                                                    className="ml-auto mb-auto font-size-_8em text-right d-flex flex-column font-weight-500">
                                                    <span>{CurrencyUtils.formatMoneyByCurrency(r.price, r.currency)}</span>
                                                    <span>
                                                    <GSTrans t="page.purchaseOrderFormEditor.search.inventory"/>:&nbsp;
                                                        <strong>{r.modelStock}</strong>
                                                    </span>
                                                    {
                                                        r.conversionUnitName &&
                                                        <span className="unit">
                                                            <span>{i18next.t('page.transfer.stock.table.column.unit')}: </span> {r.conversionUnitName}
                                                        </span>
                                                    }
                                                </span>
                                            </div>
                                        )
                                    })
                                }
                                {
                                    stSearchResult.length === 0 &&
                                    <p className="text-center mb-0">
                                        <GSTrans t={'common.noResultFound'}/>
                                    </p>
                                }
                                {
                                    stIsSearching && <Loading className="mt-3"/>
                                }
                            </div>
                            : stIsSearching &&
                            <div className="search-result" style={{zIndex: 5}}><Loading/></div>
                    }
                </span>
                <UikSelect
                    onChange={searchType => setStFilter(filter => ({
                        ...filter,
                        isScroll: false,
                        page: 0,
                        searchType
                    }))}
                    position={'bottomRight'}
                    value={[stFilter.searchType]}
                    style={{
                        width: '100px'
                    }}
                    className="ml-0 ml-sm-2 mt-2 mt-sm-0"
                    options={Object.values(SEARCH_TYPE)}
                />
            </div>
        )
    }

    const renderDiscountLabel = (prod) => {
        const findWholeSale = stDataWholeSale.find(item => item.modelId ? item.modelId == prod.modelId : item.itemId == prod.itemId)
        // have membership wholeSale

        if (prod.flashSale) {
            return (
                <>
                    <img src="/assets/images/icon-discount.png" alt="discount" className="mr-1" width="12"
                         height="12"/>
                    <span className="gs-frm-input__label text-uppercase" style={{fontSize: "9px"}}>
                            <GSTrans t={'component.navigation.flashSale'}/>
                        </span>
                </>
            )
        } else if (findWholeSale) {
            return (
                <>
                    <img src="/assets/images/icon-sf-shoppingcart.svg" alt="discount" className="mr-1" width="12"
                         height="12"/>
                    <span className="gs-frm-input__label" style={{fontSize: "9px"}}>
                    <GSTrans t="page.order.instorePurchase.wholeSaleDiscount" values={{
                        discount: findWholeSale.wholesaleValue + '%'
                    }}/>
                </span>
                </>
            )
        } else {
            // have membership
            if (Object.keys(stDataMembership).length !== 0) {
                return (
                    <>
                        <img src="/assets/images/icon-discount.png" alt="discount" className="mr-1" width="12"
                             height="12"/>
                        <span className="gs-frm-input__label text-uppercase" style={{fontSize: "9px"}}>
                            <GSTrans t={'page.order.instorePurchase.membershipLabel'}/>
                        </span>
                    </>
                )
            }
        }

        return null
    }

    const renderWholesalePrice = (prod) => {
        if (prod.flashSale) {
            return
        }

        const findWholeSale = stDataWholeSale.find(item => item.modelId ? item.modelId == prod.modelId : item.itemId == prod.itemId)
        if (!findWholeSale) {
            if (findWholesalePrice(prod))
                return (
                    <>
                        <img src="/assets/images/icon-wholesale-price.png" alt="discount" className="mr-1" width="12"
                             height="12"/>
                        <span style={{fontSize: '10px'}} className="gs-frm-input__label text-uppercase">
                            {i18next.t('page.gosocial.wholesalePrice.percent',
                                {x: findWholesalePrice(prod)?.salePercent})}
                        </span>
                    </>
                )
        }

        return null
    }
    const renderProductRow = (prod) => {
        return (
            <tr key={prod.id} className="background-color-white">
                <td className={handleStyleErrorDelete("gs-table-body-item vertical-align-baseline", prod.deleted)}>
                    <div className="col-data">
                        <GSFakeLink
                            onClick={() => RouteUtils.openNewTab(NAV_PATH.productEdit + '/' + prod.itemId)}>{prod.sku || '_'}</GSFakeLink>
                    </div>
                </td>
                <td className="gs-table-body-item">
                    <div className={handleStyleErrorDelete("d-flex align-items-center", prod.deleted)}>
                        <div className="product-image">
                            <GSImg src={prod.itemImage || prod.imageUrl} width={70} height={70}/>
                        </div>
                        <div className="d-flex flex-column ml-3">
                            <span className="product-name">{prod.itemName || prod.name}</span>
                            {(prod.variationName) && <span
                                className="font-size-_8rem white-space-pre"> {prod.variationName.replace('|' + Constants.DEPOSIT_CODE.FULL, '')} </span>}

                            {(prod.modelName) && <span
                                className="font-size-_8rem white-space-pre">{ItemUtils.buildFullModelName(prod.modelLabel, prod.modelName)}</span>}

                        </div>
                    </div>
                    {prod.deleted &&
                    <span className="error mt-2">{i18next.t('page.order.edit.productDeleted')}</span>
                    }
                </td>
                <td className={handleStyleErrorDelete("gs-table-body-item vertical-align-baseline", prod.deleted)}>
                    <div className="d-flex flex-column justify-content-center">
                        <AvField
                            name={`quantity-${prod.id}`}
                            validate={prod.quantity >= 999 && (
                                stGetStockProduct?.find(product => product.itemModelId === ItemUtils.computeItemModelId(prod.itemId, prod.modelId)) ?
                                    (stGetStockProduct.find(product => product.itemModelId === ItemUtils.computeItemModelId(prod.itemId, prod.modelId)).stock + prod.maxQuantity) >= 999
                                    : prod.maxQuantity >= 999
                            ) ? {
                                ...FormValidate.required(),
                                ...FormValidate.minValue(1),
                                ...FormValidate.maxValueQuantityExceed(Constants.VALIDATIONS.PRODUCT.MAX_QUANTITY),
                                ...FormValidate.integerNumber()
                            } : {
                                ...FormValidate.required(),
                                ...FormValidate.minValue(1),
                                ...FormValidate.maxValueAvailableStock(stGetStockProduct?.find(product => product.itemModelId === ItemUtils.computeItemModelId(prod.itemId, prod.modelId)) ?
                                    stGetStockProduct.find(product => product.itemModelId === ItemUtils.computeItemModelId(prod.itemId, prod.modelId)).stock + prod.maxQuantity
                                    : prod.maxQuantity),
                                ...FormValidate.integerNumber()
                            }}
                            value={String(prod.quantity)}
                            type="number"
                            onBlur={e => handleChangeQuantity(e, prod.id)}
                            disabled={prod.flashSale || prod.deleted}
                        />
                        {renderInsufficientStockError(prod)}
                        <span className='mt-1 font-style-italic'>
                            {prod.conversionUnitName}
                        </span>
                        {prod.isFirstMaxQuantity && prod.quantity > prod.maxQuantity &&
                        <span className='error mt-0'>
                            {i18next.t('common.validation.number.max.availableStock')}{prod.maxQuantity}
                        </span>
                        }
                    </div>
                </td>
                <td className={handleStyleErrorDelete("gs-table-body-item vertical-align-baseline", prod.deleted)}>
                    <div className="col-data input">
                        <div className="number m-auto">
                            <div className="col-data justify-content-center p-0">
                                {CurrencyUtils.formatMoneyByCurrency(findWholesalePrice(prod) ? findWholesalePrice(prod).price : prod.price, prod.currency)}
                            </div>
                            <div className="justify-content-center">
                                <p className="m-0">
                                    {renderDiscountLabel(prod)}
                                </p>
                                <p className="m-0">
                                    {renderWholesalePrice(prod)}
                                </p>
                            </div>
                        </div>
                    </div>
                </td>
                <td className={handleStyleErrorDelete("gs-table-body-item vertical-align-baseline", prod.deleted)}>
                    <div className="col-data justify-content-end">
                        <span>{getProductTotalRow(prod)}</span>
                    </div>
                </td>
                <td className={handleStyleErrorDelete("gs-table-body-item", prod.deleted)}>
                    <div className="col-data">
                        <img className="delete" onClick={(e) => handleDeleteProduct(e, prod)} src="/assets/images/icon-delete.png" alt="remove product"/>
                    </div>
                </td>
            </tr>
        )
    }

    const renderProductList = () => {
        return (
            <GSWidget className="product-list">
                <GSWidgetHeader className="title"
                                title={i18next.t('page.purchaseOrderFormEditor.productInformation.header')}
                                subTitle={<div key={stSelectedDestination}>
                                    <img src="/assets/images/icon-map.png" alt=""/>
                                    <strong>Branch:</strong> {stSelectedDestination?.label}</div>}


                />

                {/*PRODUCT LIST*/}
                <GSWidgetContent className="d-flex flex-column">
                    {renderSearchBox()}
                    {
                        <div className="table">
                            <GSTable>
                                <colgroup>
                                    <col style={{width: '15%'}}/>
                                    <col style={{width: '35%'}}/>
                                    <col style={{width: '25%'}}/>
                                    <col style={{width: '25%'}}/>
                                    <col style={{width: '5%'}}/>
                                </colgroup>
                                <thead>
                                <tr>
                                    <th>{HEADER.SKU}</th>
                                    <th>{HEADER.PRODUCT_NAME}</th>
                                    <th className="text-center">{HEADER.QUANTITY}</th>
                                    <th className="text-center">{HEADER.ORDERED_PRICE}</th>
                                    <th>{HEADER.TOTAL}</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    stSelectedProducts.map(prod => (
                                        renderProductRow(prod)
                                    ))
                                }
                                </tbody>
                            </GSTable>
                        </div>
                    }
                </GSWidgetContent>
            </GSWidget>
        )
    }

    const renderCustomerInformation = (customerInfo) => {
        return (
            <GSWidget className="customer-information">
                <GSWidgetHeader title={i18next.t('page.orders.returnOrder.customerInformation')}/>
                <GSWidgetContent className="d-flex flex-column">
                    <div className="d-flex flex-column box-order-info-group">

                        <div className="order-info-group">
                            <div
                                className="order-information__left-label">{i18next.t('page.orders.returnOrder.customerInformation.name')}
                            </div>

                            <div className="order-information__right-value cursor--pointer font-weight-bold"
                                 style={{color: '#1E69D5'}}
                                 onClick={() => onClickCustomerInformation(stCustomerProfile)}>
                                {customerInfo?.name}
                            </div>
                        </div>

                        <div className="order-info-group">
                            <div
                                className="order-information__left-label">{i18next.t('page.orders.returnOrder.customerInformation.phoneNumber')}</div>
                            <div className="order-information__right-value">
                                {customerInfo?.phone}
                            </div>
                        </div>

                        <div className="order-info-group">
                            <div
                                className="order-information__left-label">{i18next.t('page.reservation.detail.point')}:
                            </div>
                            <div className="order-information__right-value">
                                {stLoyaltyPoints} {i18next.t('page.orders.returnOrder.orderInformation.points')}
                            </div>
                        </div>

                        <div className="order-info-group">
                            <div
                                className="order-information__left-label">{i18next.t('page.customers.debt')}:
                            </div>
                            <div className="order-information__right-value">
                                {CurrencyUtils.formatMoneyByCurrency(stDebtAmount, currency)}
                            </div>
                        </div>

                    </div>
                </GSWidgetContent>
            </GSWidget>
        )
    }

    const renderOrderInformation = () => {
        return (
            <GSWidget className="order-information">
                <GSWidgetHeader title={i18next.t('page.order.detail.information.title')}/>
                <GSWidgetContent className="d-flex flex-column">
                    <div className="d-flex flex-column box-order-info-group">

                        <div className="order-info-group subtotal d-flex justify-content-between">
                            <div
                                className="order-information__left-label">
                                <p>{i18next.t('page.order.detail.items.subTotal')}</p>
                                <span>{i18next.t('productList.countProduct', {total: stSelectedProducts.length})}</span>
                            </div>
                            <div className="order-information__right-value font-weight-bold">
                                {CurrencyUtils.formatMoneyByCurrency(getSubtotal(), currency)}
                            </div>
                        </div>

                        <div className="order-info-group d-flex justify-content-between">
                            <div
                                className="order-information__left-label">{i18next.t('page.setting.VAT.titleBox')}</div>
                            <div className="order-information__right-value">
                                {CurrencyUtils.formatMoneyByCurrency(stVAT, currency)}
                            </div>
                        </div>

                        <div className="order-info-group d-flex justify-content-between">
                            <div
                                className="order-information__left-label">{i18next.t('page.analytics.order.revenue.summary.discount.amount')}</div>
                            <div className="order-information__right-value">
                                -{CurrencyUtils.formatMoneyByCurrency(getDiscount(), currency)}
                            </div>
                        </div>

                        <div className="order-info-group d-flex justify-content-between">
                            <div
                                className="order-information__left-label cursor--pointer"
                                onClick={toggleModalCustomer}
                            >{i18next.t('page.analytics.order.revenue.summary.shipping.fee')} <img
                                src="/assets/images/icon-edit-blue.png" alt="" className="ml-2"/></div>
                            <div className="order-information__right-value">
                                {CurrencyUtils.formatMoneyByCurrency(stDefaultShippingFee?.selfDeliveryFee, currency)}
                            </div>
                        </div>

                        <div className="order-info-group d-flex justify-content-between order-total">
                            <div
                                className="order-information__left-label">{i18next.t('page.order.edit.orderTotal')}</div>
                            <div className="order-information__right-value">
                                {CurrencyUtils.formatMoneyByCurrency(getTotal(), currency)}
                            </div>
                        </div>

                        <div className="order-info-group d-flex flex-column order-note">
                            <div
                                className="order-information__left-label font-weight-bold">{i18next.t('page.order.detail.noteFromBuyer')}</div>
                            <div className="order-information__right-value">
                                <AvField
                                    className="order-edit__note-input"
                                    name="note"
                                    placeHolder={i18next.t("page.order.create.complete.inputNote")}
                                    type="textarea"
                                    rows={1}
                                    wrap="hard"
                                    maxlength="150"
                                    value={stNote}
                                    onChange={(e) => {
                                        setStNote(e.target.value)
                                        setStIsEdited(true)
                                    }}/>
                            </div>
                        </div>

                        {
                            stOrderDetail?.customerInfo?.userId && stEarnedPoint > 0 &&
                            <div className="order-info-group d-flex flex-column order-point">
                                <div
                                    className="order-information__left-label">
                                    <img src="/assets/images/icon-point.png" className="mr-2" alt=""/>
                                    <GSTrans t="page.order.create.cart.loyaltyPoint" values={{
                                        points: NumberUtils.formatThousand(stEarnedPoint)
                                    }}
                                    >
                                        0<strong className="color-red">1</strong>2
                                    </GSTrans>
                                </div>

                            </div>
                        }
                    </div>
                </GSWidgetContent>
            </GSWidget>
        )
    }


    const renderInsideAddressForm = () => {
        return <>
            <div className="address">
                {/*ADDRESS*/}
                <AvField
                    label={i18next.t("page.customers.edit.address")}
                    placeHolder={i18next.t("page.customer.addAddress.enterAddress")}
                    name={"address"}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(255)
                    }}
                    onChange={e => {
                        setStCustomerAddress(e.target.value)
                    }}
                    value={stCustomerAddress}
                />
            </div>
            <div className="d-flex box-city">
                <AvField
                    type="select"
                    name="cityCode"
                    label={<div className="label-required">{i18next.t("page.products.supplierPage.province")}</div>}
                    onChange={async e => {
                        fetchFeeSelfDelivery(e.target.value, getSubtotal())
                        setStCustomerLocation(e.target.value);
                        if (e.target.value !== '') {
                            const districtList = await catalogService.getDistrictsOfCity(e.target.value)
                            setStDistrict(districtList);
                            setStWard([]);
                        } else {
                            setStDistrict([]);
                            setStWard([]);
                        }
                        setStCustomerDistrict('');
                        setStCustomerWard('');
                    }}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                    }}
                    value={stCustomerLocation}
                >
                    <option value={""}>{i18next.t("page.customer.addAddress.selectCity")}</option>
                    {
                        stProvince && stProvince.map((x, index) =>
                            <option value={x.code} key={index}>{x.inCountry}</option>
                        )
                    }
                </AvField>
                <AvField
                    type="select"
                    name="districtCode"
                    label={<div className="label-required">{i18next.t("page.products.supplierPage.district")}</div>}
                    onChange={async e => {
                        setStCustomerDistrict(e.target.value);
                        if (e.target.value !== '') {
                            const wardList = await catalogService.getWardsOfDistrict(e.target.value)
                            setStWard(wardList);
                        } else {
                            setStWard([]);
                        }
                        setStCustomerWard('');
                    }}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                    }}
                    value={stCustomerDistrict}
                >
                    <option value={""}>{i18next.t("page.customer.addAddress.selectDistrict")}</option>
                    {
                        stDistrict && stDistrict.map((x, index) =>
                            <option value={x.code} key={index}>{x.inCountry}</option>
                        )
                    }
                </AvField>
                <AvField
                    type="select"
                    name="wardCode"
                    label={<div className="label-required">{i18next.t("page.products.supplierPage.ward")}</div>}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                    }}
                    onChange={e => {
                        setStCustomerWard(e.target.value)
                    }}
                    value={stCustomerWard}>
                    <option value={""}>{i18next.t("page.customer.addAddress.selectWard")}</option>
                    {
                        stWard && stWard.map((x, index) =>
                            <option value={x.code} key={index}>{x.inCountry}</option>
                        )
                    }
                </AvField>
            </div>
        </>
    }

    const renderOutsideAddressForm = () => {
        return <>
            <div className="d-flex address2">
                {/*ADDRESS*/}
                <AvField
                    disabled={props.disabled}
                    label={i18next.t('page.customers.edit.streetAddress')}
                    name={'address'}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(255)
                    }}
                    placeHolder={i18next.t('page.customer.addAddress.enterAddress')}
                    onBlur={e => {
                        setStCustomerAddress(e.target.value)
                    }}
                    value={stCustomerAddress}
                />
                <AvField
                    disabled={props.disabled}
                    label={i18next.t('page.customers.edit.address2')}
                    name={'address2'}
                    validate={{
                        ...FormValidate.maxLength(65)
                    }}
                    placeHolder={i18next.t('page.customer.addAddress.enterAddress2')}
                    onBlur={e => {
                        setStCustomerAddress2(e.target.value)
                    }}
                    value={stCustomerAddress2}
                />
            </div>
            <div className="d-flex box-city">
                <AvField
                    type="select"
                    name="province"
                    label={i18next.t('page.customers.edit.state')}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        )
                    }}
                    onChange={async e => {
                        setStCustomerLocationOutside(e.target.value)
                        fetchFeeSelfDelivery(e.target.value, getSubtotal())
                    }}
                    disabled={props.disabled}
                    value={stCustomerLocationOutside}
                >
                    <option value={''}>{i18next.t('page.customer.addAddress.selectState')}</option>
                    {
                        stProvince && stProvince.map((x, index) =>
                            <option value={x.code} key={index}>{x.outCountry}</option>
                        )
                    }
                </AvField>
                <AvField
                    disabled={props.disabled}
                    label={i18next.t('page.customers.edit.city')}
                    name={'city'}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(65)
                    }}
                    placeHolder={i18next.t('page.customer.addAddress.enterCity')}
                    onChange={e => {
                        setStCustomerCityOutside(e.target.value)
                    }}
                    value={stCustomerCityOutside}
                />
                <AvField
                    disabled={props.disabled}
                    label={i18next.t('page.customers.edit.zipCode')}
                    name={'zipCode'}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(25)
                    }}
                    placeHolder={i18next.t('page.customer.addAddress.enterZipCode')}
                    onChange={e => {
                        setStCustomerZipCodeOutside(e.target.value)
                    }}
                    value={stCustomerZipCodeOutside}
                />
            </div>
        </>
    }


    const renderShippingFeeModal = () => {
        return (
            <>
                {/*MODAL ADD CUSTOMER*/}
                <Modal isOpen={stmodalAddCustomer} toggle={toggleModalCustomer} className="customerModalList">
                    <ModalHeader
                        toggle={toggleModalCustomer}>{i18next.t("page.order.edit.deliveryInformation")}</ModalHeader>
                    <ModalBody className='d-flex'>
                        <AvForm onValidSubmit={handleValidShippingFeeSubmit} autoComplete="off"
                                ref={refAddCustomerForm}>
                            <div className="content">
                                {/*COUNTRY*/}
                                <AvField
                                    type="select"
                                    name="country"
                                    label={`${i18next.t("page.customers.edit.country")}`}
                                    className='dropdown-box country'
                                    value={stDefaultShippingFee?.country || "VN"}
                                    onChange={e => handleCountry(e.target.value)}
                                    disabled={!(stOrderDetail.orderInfo?.inStore === "GO_SOCIAL"
                                        || stOrderDetail.orderInfo?.paymentMethod === "DEBT"
                                        || stOrderDetail.orderInfo?.paymentMethod === "PAYPAL")}

                                >
                                    {stCountries.map(country => {
                                        return (
                                            <option key={country.code} value={country.code}>
                                                {country.outCountry}
                                            </option>
                                        )
                                    })}
                                </AvField>
                                <div className="d-flex">

                                    <div className='full-name'>
                                        <AvField
                                            label={i18next.t("page.customers.edit.fullName")}
                                            name={"fullName"}
                                            validate={{
                                                ...FormValidate.required(),
                                                ...FormValidate.maxLength(100, true)
                                            }}
                                            value={stDefaultShippingFee?.fullName}
                                            placeholder={i18next.t("page.customers.placeholder.fullName")}
                                        />
                                    </div>

                                    <div className="phone" style={{width: "47%"}}>
                                        {/*PHONE*/}
                                        <AvField
                                            label={i18next.t("page.customers.edit.phone")}
                                            name={"phone"}
                                            className={stCheckedNumberPhone ? "isBorderCheck" : ""}
                                            validate={{
                                                ...FormValidate.required(),
                                                ...FormValidate.maxLength(1_000_000, false),
                                                ...FormValidate.pattern.numberOrEnterOrPlus()
                                            }}
                                            value={stDefaultShippingFee?.phone}
                                            placeholder={i18next.t("page.customers.placeholder.phone")}
                                        />
                                        {stCheckedNumberPhone && <div
                                            className="invalid-check">{i18next.t("common.validation.check.phone")}</div>}
                                    </div>
                                </div>

                                {stCustomerCountryOutside === 'VN' && renderInsideAddressForm()}
                                {stCustomerCountryOutside !== 'VN' && renderOutsideAddressForm()}

                                <div className="shipping-address d-flex">
                                    <div className="shipping">
                                        <Label
                                            for={"shipping_option"}
                                            className="gs-frm-control__title"
                                        >
                                            <Trans i18nKey="page.order.create.shipping.option.option"/>
                                        </Label>
                                        <AvField
                                            type="select"
                                            name="shipping_option"
                                            value={""}
                                        >
                                            <option value="">
                                                {i18next.t(
                                                    "page.order.create.shipping.option.by.self_delivery"
                                                )}
                                            </option>
                                        </AvField>
                                    </div>

                                    <div className="self-delivery-fee">
                                        <Label
                                            for={"selfDeliveryFee"}
                                            className="gs-frm-control__title"
                                        >
                                            <Trans i18nKey="page.order.create.shipping.option.self_delivery"/>
                                        </Label>
                                        <div className="right">
                                            <AvFieldCurrency
                                                name="selfDeliveryFee"
                                                unit={currency}
                                                validate={{
                                                    ...FormValidate.minValue(VALIDATE_INPUT.MIN),
                                                }}
                                                value={stDefaultShippingFee?.selfDeliveryFee}
                                                parentClassName="order-in-store-shipping-fee"
                                                position={CurrencyUtils.isPosition(currency)}
                                                precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                                                decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {stOrderDetail.orderInfo?.inStore !== "GO_SOCIAL" && stFeeSelfDelivery.length > 0 &&
                                <AvRadioGroup
                                    className="w-100"
                                    onChange={onChangeFeeSelfDelivery}
                                    name="feeSelfDelivery"
                                    value={stValueFeeSelfDelivery}
                                >
                                    <>
                                        <div className="fee-self-delivery col-12 row">
                                            {stFeeSelfDelivery.sort((a, b) => {
                                                return a.fee - b.fee
                                            }).map((item, index) => {
                                                return (
                                                    <div key={index} className="content col-6">
                                                        <AvRadio
                                                            customInput
                                                            value={item.fee}
                                                            label={item.deliveryService.serviceName}
                                                        />
                                                        <p>{CurrencyUtils.formatMoneyByCurrency(item.fee, currency)}</p>
                                                        <span>Shop will contact and ship this order</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </>
                                </AvRadioGroup>
                                }

                                {stOrderDetail.orderInfo?.inStore !== "GO_SOCIAL" && stFeeSelfDelivery.length === 0 &&
                                <div className="shipping-fee-not-found">
                                    <p className="error">
                                        {i18next.t('page.orders.returnOrder.shippingFeeNotFound')}
                                    </p>
                                </div>
                                }

                            </div>

                            <ModalFooter>
                                <GSButton default buttonType="button" onClick={onClickCancelAddCustomer}>
                                    <GSTrans t={"common.btn.cancel"}/>
                                </GSButton>
                                <GSButton marginLeft success disabled={stCheckedNumberPhone}>
                                    <GSTrans t={"common.btn.add"}/>
                                </GSButton>
                            </ModalFooter>
                        </AvForm>
                    </ModalBody>
                </Modal>
            </>
        )
    }

    return (
        <>
            <ConfirmModal ref={refConfirmModal}/>
            <AlertModal ref={refAlertModal}/>
            {stShowLoading && <LoadingScreen zIndex={9999}/>}
            <GSContentContainer confirmWhenRedirect
                                confirmWhen={stIsEdited && stEditorMode !== Constants.PURCHASE_ORDER_MODE.WIZARD}
                                isSaving={stIsSaving}
                                className="edit-order-form">
                {renderShippingFeeModal()}
                <GSContentHeader>
                    {renderHeader()}
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX}>
                    <AvForm ref={refForm} onValidSubmit={handleOnValidSubmit} autoComplete="off"
                            className="content-wrapper">
                        <div className="clearfix">
                            <div className="product-list-wrapper">
                                {renderProductList()}
                            </div>
                            <div className="order-information-wrapper">
                                {renderCustomerInformation(stOrderDetail.customerInfo)}
                            </div>
                            <div className="order-information-wrapper">
                                {renderOrderInformation()}
                            </div>
                        </div>

                    </AvForm>
                </GSContentBody>
            </GSContentContainer>
        </>
    )
}

OrderEdit.defaultProps = {
    currency: CurrencyUtils.getLocalStorageSymbol()
}

OrderEdit.propTypes = {
    currency: PropTypes.string,
}

export default OrderEdit

import React, {useEffect, useRef, useState} from 'react';

import './CreateFlashSaleCampaign.sass'
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSWidgetHeader from "../../../components/shared/form/GSWidget/GSWidgetHeader";
import {AvForm} from "availity-reactstrap-validation";
import Constants from "../../../config/Constant";
import {UikSelect} from "../../../@uik";
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink";
import {ImageUtils} from "../../../utils/image";
import i18next from "i18next";
import ProductModal from "../../products/CollectionSelectProductModal/ProductModal";
import {CurrencyUtils, NumberUtils} from "../../../utils/number-format";
import GSTable from "../../../components/shared/GSTable/GSTable";
import CryStrapInput, {
    NumericSymbol
} from "../../../components/shared/form/CryStrapInput/CryStrapInput";
import GSTooltip, {GSTooltipIcon} from "../../../components/shared/GSTooltip/GSTooltip";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {FormValidate} from "../../../config/form-validate";
import AvFieldCountable from "../../../components/shared/form/CountableAvField/AvFieldCountable";
import {Link} from "react-router-dom";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import GSDateTimePicker from "../../../components/shared/GSDateTimePicker/GSDateTimePicker";
import moment from 'moment'
import {ItemService} from "../../../services/ItemService";
import {GSToast} from "../../../utils/gs-toast";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import {RouteUtils} from "../../../utils/route";
import AvFieldCurrency from "../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import GSImg from "../../../components/shared/GSImg/GSImg";

const HEADERS = {
    productName: i18next.t('page.flashSale.create.table.header.productName'),
    price: i18next.t('page.flashSale.create.table.header.price'),
    flashSalePrice: i18next.t('page.flashSale.create.table.header.flashSalePrice'),
    remainingStock: i18next.t('page.flashSale.create.table.header.remainingStock'),
    flashSaleStock: {
        label: i18next.t('page.flashSale.create.table.header.flashSaleStock'),
        hint: i18next.t('page.flashSale.create.table.header.flashSaleStock.hint')
    },
    maxPurchaseLimit: {
        label: i18next.t('page.flashSale.create.table.header.maxPurchaseLimit'),
        hint: i18next.t('page.flashSale.create.table.header.maxPurchaseLimit.hint')
    },
}
const FLASH_SALE_PROPS = {
    FLASH_SALE_PRICE: 'flashSalePrice',
    FLASH_SALE_STOCK: 'flashSaleStock',
    MAX_PURCHASE_LIMIT: 'maxPurchaseLimit',
}
const SIZE_PER_PAGE = 50;

const CreateEditFlashSaleCampaign = props => {
    const {campaignId} = props.match.params

    const [stIsFetching, setStIsFetching] = useState(false)
    const [stShowProductModal, setStShowProductModal] = useState(false)
    const [stFlashSaleProducts, setStFlashSaleProducts] = useState([])
    const [stFilterTimes, setStFilterTimes] = useState([])
    const [stCampaignName, setStCampaignName] = useState('')
    const [stSelectedProducts, setStSelectedProducts] = useState([])
    const [stSelectedDate, setStSelectedDate] = useState(moment())
    const [stSelectedTime, setStSelectedTime] = useState({
        startHour: null,
        startMinute: null,
        endHour: null,
        endMinute: null,
    })
    const [stIsEdited, setStIsEdited] = useState(false)
    const [stIsSaving, setStIsSaving] = useState(false)
    const [stCampaign, setStCampaign] = useState()
    const [stProductError, setStProductError] = useState()
    const [stTimeError, setStTimeError] = useState()

    const refForm = useRef()

    const formatTime = (hour, minute) => {
        return ('0' + hour).slice(-2) + ':' + ('0' + minute).slice(-2)
    }

    useEffect(() => {
        setStIsFetching(true)
        const promises = []

        if (campaignId) {
            //EDIT
            promises.push(
                ItemService.getFlashSaleCampaignDetail(campaignId)
                    .then(campaign => {
                        const {name, startDate, items} = campaign

                        //MAPPING FOR PRODUCT MODAL
                        const selectedProducts = items.map(item => ({
                            id: item.itemModelId,
                            image: item.image,
                            itemName: item.itemName,
                            modelName: item.modelValue,
                            price: item.merchantNewPrice,
                            newPrice: item.newPrice,
                            purchaseLimitStock: item.purchaseLimitStock,
                            modelStock: item.remaining,
                            saleStock: item.saleStock,
                            currency: item.currency,
                        }))

                        setStSelectedProducts(selectedProducts)
                        setStCampaign(campaign)
                        setStCampaignName(name)
                        setStSelectedDate(moment(startDate))
                    })
            )
        }

        promises.push(
            ItemService.getFlashSaleTimeOfStore(0, 500)
                .then(({data, total}) => {
                    if (!data.length) {
                        return
                    }

                    const times = data.map(time => {
                        const {startHour, startMinute, endHour, endMinute} = time

                        return {
                            value: {
                                startHour,
                                startMinute,
                                endHour,
                                endMinute,
                            },
                            label: formatTime(startHour, startMinute) + ' - ' + formatTime(endHour, endMinute),
                        }
                    })

                    setStFilterTimes(times)
                })
        )
        Promise.all(promises)
            .catch(() => GSToast.commonError())
            .finally(() => setStIsFetching(false))
    }, [])

    useEffect(() => {
        if (!stCampaign) {
            return
        }

        if (moment().isBefore(stCampaign.startDate)) {
            return
        }

        RouteUtils.toNotFound(props)
    }, [stCampaign])

    useEffect(() => {
        if (!stFilterTimes.length || !stCampaign) {
            return
        }

        const {startDate, endDate} = stCampaign
        const campStartHour = moment(startDate).hours()
        const campStartMinute = moment(startDate).minutes()
        const campEndHour = moment(endDate).hours()
        const campEndMinute = moment(endDate).minutes()
        const index = stFilterTimes.findIndex(time => {
            const {startHour, startMinute, endHour, endMinute} = time.value

            return startHour === campStartHour
                && startMinute === campStartMinute
                && endHour === campEndHour
                && campEndMinute === endMinute
        })

        if (index < 0) {
            return
        }

        setStSelectedTime(stFilterTimes[index].value)
    }, [stFilterTimes, stCampaign])

    useEffect(() => {
        if (!stFilterTimes.length || campaignId) {
            return
        }

        setStSelectedTime(stFilterTimes[0].value)
    }, [stFilterTimes])

    useEffect(() => {
        //HANDLE MAP SELECTED PRODUCTS TO FLASH SALE PRODUCT
        const filterFlashSaleProducts = stSelectedProducts.map(prod => {
            const [itemId, modelId] = prod.id.split('-')
            const currentFlashSaleProduct = stFlashSaleProducts.find(fsProduct => fsProduct.id === prod.id) || {}

            return {
                id: prod.id,
                itemId: itemId,
                modelId: modelId,
                image: prod.image,
                name: prod.itemName,
                modelName: prod.modelName,
                newPrice: prod.price,
                remainingStock: prod.modelStock,
                currency: prod.currency,
                [FLASH_SALE_PROPS.FLASH_SALE_PRICE]: currentFlashSaleProduct[FLASH_SALE_PROPS.FLASH_SALE_PRICE] || prod.newPrice,
                [FLASH_SALE_PROPS.MAX_PURCHASE_LIMIT]: currentFlashSaleProduct[FLASH_SALE_PROPS.MAX_PURCHASE_LIMIT] || prod.purchaseLimitStock,
                //Get value of campaign's product if edit or will get default value in create case
                [FLASH_SALE_PROPS.FLASH_SALE_STOCK]: currentFlashSaleProduct[FLASH_SALE_PROPS.FLASH_SALE_STOCK] || prod.saleStock || prod.modelStock,
            }
        })

        setStFlashSaleProducts(filterFlashSaleProducts)
    }, [stSelectedProducts])

    const isValid = (campaignName, errors) => {
        setStTimeError()

        let isValid = true

        if (!campaignName || errors.length) {
            isValid = false
        }

        setStProductError()

        if (!stSelectedProducts.length) {
            setStProductError(i18next.t('page.flashSale.create.error.productEmpty'))

            isValid = false
        }

        return isValid
    }

    const handleOnSubmit = (event, errors, values) => {
        const campaignName = values['campaign-name']

        if (!isValid(campaignName, errors)) {
            return
        }

        const startDate = moment(stSelectedDate, 'DD/MM/YYYY').set({
            hour: stSelectedTime.startHour,
            minute: stSelectedTime.startMinute
        })

        if (!startDate.isValid()) {
            return
        }

        const endDate = moment(stSelectedDate, 'DD/MM/YYYY').set({
            hour: stSelectedTime.endHour,
            minute: stSelectedTime.endMinute
        })

        if (!endDate.isValid()) {
            return
        }

        const items = stSelectedProducts.map(prod => {
            const product = stFlashSaleProducts.find(_prod => _prod.id === prod.id)

            return {
                itemId: product.itemId,
                limitPurchaseStock: product[FLASH_SALE_PROPS.MAX_PURCHASE_LIMIT],
                modelId: product.modelId,
                price: product[FLASH_SALE_PROPS.FLASH_SALE_PRICE],
                saleStock: product[FLASH_SALE_PROPS.FLASH_SALE_STOCK]
            }
        })

        const request = {
            name: campaignName,
            startDate: startDate.utc(),
            endDate: endDate.utc(),
            items: items
        }
        let updatePromise

        setStIsSaving(true)

        if (!campaignId) {
            //CREATE CAMPAIGN
            updatePromise = ItemService.createCampaign(request)
        } else {
            //EDIT CAMPAIGN
            updatePromise = ItemService.editCampaign({...request, id: campaignId})
        }

        updatePromise
            .then(() => {
                RouteUtils.redirectWithoutReload(props, NAV_PATH.flashSale)
                campaignId
                    ? GSToast.commonUpdate()
                    : GSToast.commonCreate()
            })
            .catch(e => {
                const {duplicateName, errorKey} = e.response.data

                if (errorKey === 'campaign.duplicated' || errorKey === 'campaign.past') {
                    setStTimeError(
                        i18next.t(`error.${errorKey}`, {
                            campaignName: duplicateName
                        })
                    )
                } else {
                    GSToast.commonError()
                }
            })
            .finally(() => setStIsSaving(false))
    }

    const handleProductModalClose = products => {
        setStShowProductModal(false)

        if (!products) {
            return
        }

        setStSelectedProducts(products)
    }

    const handleOnBlur = (key, id, value) => {
        if (!value) {
            return
        }

        setStIsEdited(true)
        setStFlashSaleProducts(prods => {
            const i = prods.findIndex(prod => prod.id === id)

            if (i < 0) {
                return prods
            }

            prods[i] = {
                ...prods[i],
                [key]: value
            }

            return [
                ...prods
            ]
        })
    }

    const getVariableLabel = (orgName) => {
        if (!orgName) {
            return
        }

        return orgName.split('|').filter(name => name !== Constants.DEPOSIT_CODE.FULL).map(name => _.upperFirst(name)).join(' | ')
    }

    const handleDeleteProduct = (e, productId) => {
        e.preventDefault()

        const products = stSelectedProducts.filter(prod => prod.id !== productId)

        setStSelectedProducts(products)
    }

    const handleSelectTime = ({value}) => {
        if (!value) {
            RouteUtils.redirectWithoutReload(props, NAV_PATH.flashSaleTime)
        }

        setStSelectedTime(value)
        setStIsEdited(true)
    }

    const renderProductRow = (prod) => {
        return (
            <tr key={prod.id}>
                <td className="gs-table-body-item">
                    <div className='d-flex align-items-center'>
                        <GSImg
                            src={prod.image ? ImageUtils.getImageFromImageModel(prod.image, 100) : ''}
                            width={70} height={70}/>
                        <div className='d-flex flex-column ml-3'>
                            <span className='row-product-name'>{prod.name}</span>
                            {prod.modelName &&
                            <span className='row-product-variable'>{getVariableLabel(prod.modelName)}</span>}
                        </div>
                    </div>
                </td>
                <td className="gs-table-body-item">
                    <div className='col-data flex-column'>
                        <span
                            className='fix-number'>{CurrencyUtils.formatMoneyByCurrency(prod.newPrice, prod.currency)}</span>
                        {prod.newPrice <= (prod.currency === Constants.CURRENCY.VND.SYMBOL ?  1000 : 0) &&
                        <div className='error'>{prod.currency === Constants.CURRENCY.VND.SYMBOL ? <GSTrans t='page.flashSale.create.error.minPrice'/> :
                            <GSTrans t='page.flashSale.create.error.minPrice.outside' values={{x:prod.currency}}/>}</div>}
                    </div>
                </td>
                <td className="gs-table-body-item">
                    <div className='col-data input'>
                        <AvFieldCurrency
                            name={FLASH_SALE_PROPS.FLASH_SALE_PRICE + "_" + prod.id}
                            thousandSeparator=","
                            unit={prod.currency}
                            value={prod[FLASH_SALE_PROPS.FLASH_SALE_PRICE]}
                            validate={{
                                ...FormValidate.required(),
                                ...FormValidate.minValue(0, true),
                                ...FormValidate.maxValue(prod.newPrice - 0.01, true, 'page.flashSale.create.error.gtProductPrice')
                            }}
                            onBlur={e => handleOnBlur(FLASH_SALE_PROPS.FLASH_SALE_PRICE, prod.id, e.currentTarget.value)}
                            position={CurrencyUtils.isPosition(prod.currency)}
                            precision={CurrencyUtils.isCurrencyInput(prod.currency) && '2'}
                            decimalScale={CurrencyUtils.isCurrencyInput(prod.currency) && 2}
                        />
                    </div>
                </td>
                <td className="gs-table-body-item">
                    <div className='col-data flex-column'>
                        <span className='fix-number'>{NumberUtils.formatThousand(prod.remainingStock)}</span>
                        {prod.remainingStock < 1 &&
                        <div className='error'><GSTrans t='page.flashSale.create.error.outOfStock'/></div>}
                    </div>
                </td>
                <td className="gs-table-body-item">
                    <div className='col-data'>
                        <div className='number'>
                            <AvFieldCurrency
                                name={FLASH_SALE_PROPS.FLASH_SALE_STOCK + "_" + prod.id}
                                thousandSeparator=","
                                unit={NumericSymbol.NONE}
                                value={prod[FLASH_SALE_PROPS.FLASH_SALE_STOCK]}
                                validate={{
                                    ...FormValidate.required(),
                                    ...FormValidate.minValue(1, true),
                                    ...FormValidate.maxValue(prod.remainingStock, true, 'page.flashSale.create.error.gtRemainingStock')
                                }}
                                onBlur={e => handleOnBlur(FLASH_SALE_PROPS.FLASH_SALE_STOCK, prod.id, e.currentTarget.value)}
                                precision={'0'}
                                decimalScale={0}
                            />
                        </div>
                    </div>
                </td>
                <td className="gs-table-body-item">
                    <div className='col-data'>
                        <div className='number'>
                            <AvFieldCurrency
                                name={FLASH_SALE_PROPS.MAX_PURCHASE_LIMIT + "_" + prod.id}
                                unit={NumericSymbol.NONE}
                                value={prod[FLASH_SALE_PROPS.MAX_PURCHASE_LIMIT]}
                                validate={{
                                    ...FormValidate.minValue(1, true),
                                    ...FormValidate.maxValue(prod[FLASH_SALE_PROPS.FLASH_SALE_STOCK], true, 'page.flashSale.create.error.gtFlashSaleStock')
                                }}
                                onBlur={e => handleOnBlur(FLASH_SALE_PROPS.MAX_PURCHASE_LIMIT, prod.id, e.currentTarget.value)}
                                precision={'0'}
                                decimalScale={0}
                            />
                        </div>
                        <GSButton className='delete' onClick={(e) => handleDeleteProduct(e, prod.id)}>
                            <img src="/assets/images/icon-delete.png"/>
                        </GSButton>
                    </div>
                </td>
            </tr>
        )
    }

    return (
        <>
            {
                stShowProductModal && <ProductModal
                    productSelectedList={stSelectedProducts}
                    onClose={handleProductModalClose}
                    type={Constants.ITEM_TYPE.BUSINESS_PRODUCT}
                    typeModal={Constants.TYPE_PRODUCT_MODAL.FLASH_SALE}
                    
                />
            }
            {
                stIsFetching
                    ? <Loading className='m-auto' style={LoadingStyle.DUAL_RING_GREY}/>
                    : <GSContentContainer confirmWhenRedirect
                                          confirmWhen={!stIsSaving && stIsEdited}
                                          isSaving={stIsSaving}
                                          className='create-flash-sale-campaign'>
                        <Link to={NAV_PATH.flashSale} className="color-gray mb-2 align-self-start">
                            &#8592; <GSTrans t="page.flashSale.create.header.back"/>
                        </Link>
                        <GSContentHeader title={i18next.t('page.flashSale.create.header')}>

                            <GSContentHeaderRightEl className="d-flex">
                                <GSButton success onClick={() => refForm.current.submit()}>
                                    <Trans i18nKey="common.btn.save" className="sr-only">
                                        Save
                                    </Trans>
                                </GSButton>
                                <GSButton success outline marginLeft
                                          onClick={() => RouteUtils.redirectWithoutReload(props, NAV_PATH.flashSale)}>
                                    <Trans i18nKey="common.btn.cancel" className="sr-only">
                                        Cancel
                                    </Trans>
                                </GSButton>
                            </GSContentHeaderRightEl>
                        </GSContentHeader>
                        <GSContentBody size={GSContentBody.size.MAX}>
                            <AvForm ref={refForm} onSubmit={handleOnSubmit} autoComplete="off" className='content-wrapper'>
                                <GSWidget className='information'>
                                    {/*PRODUCT INFORMATION*/}
                                    <GSWidgetHeader title={i18next.t('page.flashSale.create.productInformation.header')}>
                                    </GSWidgetHeader>
                                    <GSWidgetContent className='d-flex flex-column'>
                                <span className='title'><GSTrans
                                    t='page.flashSale.create.productInformation.campaignName'/></span>
                                        <AvFieldCountable
                                            value={stCampaignName}
                                            name='campaign-name'
                                            isRequired
                                            minLength={3}
                                            maxLength={50}
                                            onChange={({value}) => {
                                                setStCampaignName(value)
                                                setStIsEdited(true)
                                            }}/>
                                    </GSWidgetContent>
                                </GSWidget>
                                <GSWidget className='time'>
                                    {/*TIME*/}
                                    <GSWidgetHeader title={i18next.t('page.flashSale.create.time.header')}>
                                    </GSWidgetHeader>
                                    <GSWidgetContent className='d-flex flex-column'>
                                        <span className='title'><GSTrans t='page.flashSale.create.time.selectDate'/></span>
                                        <GSDateTimePicker
                                            dateTime={stSelectedDate}
                                            minDate={moment()}
                                            mode={GSDateTimePicker.MODE.MODE_DATE}
                                            onChange={v => {
                                                setStSelectedDate(v)
                                                setStIsEdited(true)
                                            }}
                                        />
                                        <h3 className='title'><GSTrans t='page.flashSale.create.time.selectTime'/></h3>
                                        <UikSelect
                                            className={stTimeError ? 'input-error' : ''}
                                            key={JSON.stringify(stSelectedTime)}
                                            defaultValue={stSelectedTime}
                                            options={
                                                stFilterTimes.length
                                                    ? stFilterTimes
                                                    : [{
                                                        value: '',
                                                        label: <div>
                                                            <GSTrans t='page.flashSale.create.time.empty'>You don't have flash
                                                                sale time yet.</GSTrans>
                                                            <br/>
                                                            <GSFakeLink
                                                                onClick={() => RouteUtils.redirectWithoutReload(props, NAV_PATH.flashSaleTime)}>
                                                                <GSTrans t='page.flashSale.create.time.createNow'>Create
                                                                    now.</GSTrans>
                                                            </GSFakeLink>
                                                        </div>
                                                    }]
                                            }
                                            onChange={handleSelectTime}
                                        />
                                        <span className='error'>{stTimeError}</span>
                                    </GSWidgetContent>
                                </GSWidget>
                                <GSWidget className='product'>
                                    {/*SELECT PRODUCT*/}
                                    <GSWidgetHeader className='title'>
                                        <span><GSTrans
                                            t='page.flashSale.create.selectProduct.header'/></span>
                                        <GSFakeLink onClick={() => {
                                            setStShowProductModal(true)
                                            setStIsEdited(true)
                                        }}>
                                            <Trans i18nKey='page.flashSale.create.selectProduct.addProduct'>
                                                Add product
                                            </Trans>
                                        </GSFakeLink>
                                    </GSWidgetHeader>
                                    <GSWidgetContent className='d-flex flex-column'>
                                        {
                                            stFlashSaleProducts.length
                                                ? <div className='table'>
                                                    <GSTable>
                                                        <thead>
                                                        <tr>
                                                            <th>{HEADERS.productName}</th>
                                                            <th>{HEADERS.price}</th>
                                                            <th>{HEADERS.flashSalePrice}</th>
                                                            <th>{HEADERS.remainingStock}</th>
                                                            <th>
                                                                {HEADERS.flashSaleStock.label}
                                                                <GSTooltip
                                                                    icon={GSTooltipIcon.QUESTION_CIRCLE}
                                                                    message={HEADERS.flashSaleStock.hint}/>
                                                            </th>
                                                            <th>
                                                                {HEADERS.maxPurchaseLimit.label}
                                                                <GSTooltip
                                                                    icon={GSTooltipIcon.QUESTION_CIRCLE}
                                                                    message={HEADERS.maxPurchaseLimit.hint}/>
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {

                                                            stFlashSaleProducts.map(prod => (
                                                                renderProductRow(prod)
                                                            ))
                                                        }
                                                        </tbody>
                                                    </GSTable>
                                                </div>
                                                : <>
                                                    <span className='empty'><GSTrans
                                                        t='page.flashSale.create.table.empty'/></span>
                                                    <span className='error d-block m-auto'>{stProductError}</span>
                                                </>
                                        }
                                    </GSWidgetContent>
                                </GSWidget>
                            </AvForm>
                        </GSContentBody>
                    </GSContentContainer>
            }
        </>
    )
}

export default CreateEditFlashSaleCampaign;
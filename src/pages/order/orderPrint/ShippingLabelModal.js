import React, {useEffect, useRef, useState} from 'react';
import './ShippingLabelModal.sass'
import {BCOrderService} from '../../../services/BCOrderService';
import {delay} from '../../../utils/promise';
import {GSToast} from '../../../utils/gs-toast';
import PrintListShippingLabel from './OrderPrintShippingLabelList';
import storageService from '../../../services/storage';
import Constants from '../../../config/Constant';
import {AgencyService} from '../../../services/AgencyService';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import GSTrans from '../../../components/shared/GSTrans/GSTrans';
import GSImg from '../../../components/shared/GSImg/GSImg';
import GSButton from '../../../components/shared/GSButton/GSButton';
import {Trans} from 'react-i18next';
import {UikFormInputGroup, UikRadio} from '../../../@uik';
import i18next from 'i18next';
import PropTypes from 'prop-types';
import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import shopeeService from '../../../services/ShopeeService';
import {lazadaService} from '../../../services/LazadaService';
import {CredentialUtils} from '../../../utils/credential';
import {RouteUtils} from '../../../utils/route';
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import {withRouter} from 'react-router-dom';
import {AddressUtils} from '../../../utils/address-utils'

const ShippingLabelModal = props => {
    const CHANNEL = {
        GOSELL: "GOSELL",
        SHOPEE: "SHOPEE",
        LAZADA: "LAZADA",
        GOMUA: "BEECOW"
    }
    const KEY_PRINT_K57 = "K57";
    const [stHasError, setStHasError] = useState(false);
    const [stOpenModal, setStOpenModal] = useState(props.openModal);
    const [stSelectedChannel, setStSelectedChannel] = useState(CHANNEL.GOSELL);
    const refPrintShippingLabelRef = useRef(null);
    const [stIsShowLoading, setStIsShowLoading] = useState(false);
    const [stChannels] = useState([
        {
            value: CHANNEL.GOSELL,
            label: AgencyService.getDashboardName(i18next.t("component.button.selector.saleChannel.gosell")),
        },
        {
            value: CHANNEL.SHOPEE,
            label: i18next.t("component.button.selector.saleChannel.shopee"),
        },
        {
            value: CHANNEL.LAZADA,
            label: i18next.t("component.button.selector.saleChannel.lazada"),
        }
    ]);
    const [printReceiptList, setPrintReceiptList] = useState({
        langCode: 'vi',
        printSize: KEY_PRINT_K57,
        orderList: [],
        storeInfo: {
            storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
            storeDomain: AgencyService.getStorefrontDomain(),
            storeUrl: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_URL),
            storeImage: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_IMAGE),
            storeName: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME),
            storePhone: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_PHONE),
            storeAddress: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ADDRESS),
        },
        catalog: [],
    });

    const buildAddress = (address, wardCode, districtCode, cityCode, countryCode, optionalFields = {
        address2: '',
        city: '',
        zipCode: ''
    }) => {
        return AddressUtils.buildAddressWithCountry(address, districtCode, wardCode, cityCode, countryCode, {
            fullAddress: true
        }, optionalFields)
    }

    const onShippingLabelValidSubmit = async () => {
        let targetChannel = [stSelectedChannel];
        if (stSelectedChannel === CHANNEL.GOSELL) {
            targetChannel.push(CHANNEL.GOMUA);
        }
        const listOrder = filterSelectedOrderByChannel(targetChannel);
        if (listOrder.length <= 0) {
            setStHasError(true);
            return;
        }
        try {
            setStIsShowLoading(true);
            if (stSelectedChannel === CHANNEL.GOSELL) {
                const orderDetails = await BCOrderService.getListBcOrderDetail(printReceiptList.langCode, listOrder);

                if (!orderDetails) {
                    return;
                }

                Promise.all(orderDetails.map(order =>
                    Promise.all([
                        buildAddress(
                            order.storeBranch.address,
                            order.storeBranch.ward,
                            order.storeBranch.district,
                            order.storeBranch.city
                        ),
                        order.shippingInfo && buildAddress(
                            order.shippingInfo.address1,
                            order.shippingInfo.ward,
                            order.shippingInfo.district,
                            order.shippingInfo.country,
                            order.shippingInfo.countryCode,
                            {
                                address2: order.shippingInfo.address2,
                                city: order.shippingInfo.outSideCity,
                                zipCode: order.shippingInfo.zipCode
                            }
                        )
                    ])
                        .then(([sellerAddress, buyerAddress]) => ({ ...order, sellerAddress, buyerAddress }))
                ))
                    .then(orders => {
                        setPrintReceiptList({
                            ...printReceiptList,
                            orderList: orders
                        })
                        setTimeout(async () => {
                            refPrintShippingLabelRef.current.firePrintOrder()
                            await delay(50 * orderDetails.length)
                        }, 500)
                    })
            } else if (stSelectedChannel === CHANNEL.SHOPEE) {
                const validOrderShopee = filterSelectedOrderByChannel([stSelectedChannel], [Constants.ORDER_STATUS_WAITING_FOR_PICKUP]);
                if (validOrderShopee.length <= 0) {
                    setStHasError(true);
                    return;
                }
                let fileName = validOrderShopee[0];
                let fileType = validOrderShopee.length > 1 ? 'zip' : 'pdf';
                let result = await shopeeService.downloadShippingDocument({orderSns: validOrderShopee, fileName: fileName, fileType: fileType});
                const url = window.URL.createObjectURL(new Blob([result.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName + '.' + fileType);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(function () {
                    URL.revokeObjectURL(link.href);
                }, 1500);
            } else if (stSelectedChannel === CHANNEL.LAZADA) {
                const data = {
                    "accessToken" : CredentialUtils.getLazadaToken(),
                    "orderIds" : listOrder
                }
                let base64URLs = await lazadaService.downloadShippingDocument(data);
                base64URLs.forEach(e => {RouteUtils.redirectWithoutReloadWithData(props, NAV_PATH.printLazadaShippingLabel,
                    {data: e})});
            }
            closeModal();
        } catch (error) {
            console.log(error)
            GSToast.commonError()
        } finally {
            setStIsShowLoading(false);
        }
    }

    const filterSelectedOrderByChannel = (channels = [], statues = []) => {
        const lstOrderByChannel = props.orderList.filter(or => {
            return (channels.length > 0 ? channels.indexOf(or.channel) > -1 : true) &&
                (statues.length > 0 ? statues.indexOf(or.status) > -1 : true);
        }).map(or => or.id);
        return props.selectedOrderIds.filter(id => {
            return lstOrderByChannel.indexOf(id) !== -1;
        });
    }

    const closeModal = () => {
        setStOpenModal(false);
        props.closeCallback();
    }

    const onChangeFilter = (value) => {
        setStHasError(false);
        setStSelectedChannel(value);
    }

    useEffect(() => {
        setStOpenModal(props.openModal);
        setStHasError(false);
        setStSelectedChannel(CHANNEL.GOSELL);
    }, [props.openModal]);

    return (
        <>
            {stIsShowLoading && <LoadingScreen zIndex={99999}/>}
            <Modal isOpen={stOpenModal} className={"shipping-label-modal"} centered={true} fade={false} zIndex={99999}>
                <ModalHeader className={'modal-success'}>
                    <GSTrans t={'modal.print.shipping.label.title'}/>
                    <GSImg height={18}
                           className="cursor--pointer float-right"
                           src="/assets/images/icon-close.svg"
                           onClick={closeModal}/>
                </ModalHeader>
                <ModalBody>
                    <div className={'d-block mb-3'}>
                        <Trans i18nKey={'modal.print.shipping.label.description'}/>
                    </div>
                    <div className="d-block">
                        <UikFormInputGroup direction="horizontal">
                            {stChannels.map(option => {
                                return (
                                    <UikRadio
                                        defaultChecked={option.value === stSelectedChannel}
                                        key={option.value}
                                        value={option.value}
                                        label={option.label}
                                        name={'channel'}
                                        onClick={() => onChangeFilter(option.value)}
                                    />
                                )
                            })}
                        </UikFormInputGroup>
                    </div>
                    {stSelectedChannel === CHANNEL.SHOPEE && <div className={"common-note mt-1 font-size-_9rem"}>
                        {i18next.t('common.txt.notice')}: {i18next.t('modal.print.shipping.label.shopee.notice')}
                    </div>
                    }
                    {stHasError &&
                    <div className={'d-block mt-3 color-red'}>
                        <Trans i18nKey={'modal.print.shipping.label.error.no.order'} values={{
                            channel: stSelectedChannel
                        }}/>
                    </div>
                    }
                </ModalBody>
                <ModalFooter>
                    <GSButton secondary outline onClick={closeModal}>
                        <Trans i18nKey={'common.btn.cancel'}/>
                    </GSButton>

                    <GSButton success marginLeft onClick={onShippingLabelValidSubmit}>
                        <Trans i18nKey={'common.btn.ok'}/>
                    </GSButton>
                </ModalFooter>
            </Modal>
            <PrintListShippingLabel
                hidden
                ref={refPrintShippingLabelRef}
                langCode={printReceiptList.langCode}
                printPageSize={printReceiptList.printSize}
                storeInfo={printReceiptList.storeInfo}
                orderList={printReceiptList.orderList}
                catalog={printReceiptList.catalog}
            />
        </>
    )
}

export default withRouter (ShippingLabelModal);

ShippingLabelModal.propTypes = {
  closeCallback: PropTypes.func,
  openModal: PropTypes.bool.isRequired,
  orderList: PropTypes.array.isRequired,
  selectedOrderIds: PropTypes.array.isRequired
}

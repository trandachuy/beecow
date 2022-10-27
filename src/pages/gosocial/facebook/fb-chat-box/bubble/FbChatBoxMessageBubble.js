import React, {useContext, useMemo, useState} from 'react';
import './FbChatBoxMessageBubble.sass'
import {DateTimeUtils} from '../../../../../utils/date-time';
import moment from 'moment';
import Emoji from 'react-emoji-render'
import {OrderService} from '../../../../../services/OrderService';
import Constants from '../../../../../config/Constant';
import beehiveService from '../../../../../services/BeehiveService';
import GoSocialOrderSummaryMessage from '../../../zalo/OrderInZalo/OrderSummaryMessage/GoSocialOrderSummaryMessage';
import {FbMessengerContext} from '../../context/FbMessengerContext';
import ThemeEngineUtils from '../../../../theme/theme-making/ThemeEngineUtils'
import Loading, {LoadingStyle} from '../../../../../components/shared/Loading/Loading';
import {AddressUtils} from '../../../../../utils/address-utils'
import login from '../../../../welcome/login'
import imgThemeManagement
    from '../../../../../../public/assets/images/switch-theme-engine-notification/sliders/1_theme_management.png'
import {DropdownItem} from 'reactstrap'

const FbChatBoxMessageBubble = props => {
    const chat = props.data
    const messaging = ThemeEngineUtils.parseString(chat.messageObject);
    const [stOrderDetail, setStOrderDetail] = useState()
    const [stCustomerProfile, setStCustomerProfile] = useState()
    const [stShippingAddress, setStShippingAddress] = useState()
    const { state, dispatch } = useContext(FbMessengerContext.context);
    const [stIsOrderFetching, setStIsOrderFetching] = useState(false);


    const isShowAvatar = () => {
        // if has no next message -> show
        if (!props.nextMessage) {
            return true
        }
        // if next message has a same from id and sent time < 60s -> hide
        if (chat.senderPage === props.nextMessage.senderPage) {
            // next created_time - current created_time
            const timeDiff = moment(props.nextMessage.messageTime).diff(chat.messageTime, 'seconds')
            if (timeDiff < 60) {
                return false
            }
        }
        return true
    }

    const getAvatar = (customerAvatar) => {
        if (customerAvatar) {
            return customerAvatar;
        }
        return '/assets/images/go-chat-default-avatar.png';
    }

    const renderOrderSummary = (msgObj) => useMemo(() => {
        const orderId = msgObj.attachment.payload.order_number
        setStIsOrderFetching(true)
        OrderService.getOrderDetail(Constants.SITE_CODE_GOSELL, orderId)
            .then(orderDetail => {
                if (!orderDetail) {
                    return
                }

                setStOrderDetail(orderDetail)
                setStIsOrderFetching(false)

                return Promise.all([
                    beehiveService.getCustomerProfile(orderDetail.customerInfo.userId, Constants.SITE_CODE_GOSELL),
                    AddressUtils.buildAddress(orderDetail.shippingInfo.address1, orderDetail.shippingInfo.district, orderDetail.shippingInfo.ward, orderDetail.shippingInfo.country)
                ])
            })
            .then(([customerProfile, shippingAddress]) => {
                setStCustomerProfile(customerProfile)
                setStShippingAddress(shippingAddress)
            })
            .catch(() => {
            })
            .finally(() => {
                setStIsOrderFetching(false)
            })

        return stOrderDetail && <GoSocialOrderSummaryMessage data={ {
            orderId: orderId,
            sellerName: state.storeInfo.storeName,
            sellerImage: state.storeInfo.storeImage,
            buyerName: stOrderDetail.customerInfo.name,
            buyerPhone: stCustomerProfile?.phone,
            shippingAddress: stShippingAddress,
            paymentMethod: stOrderDetail.orderInfo.paymentMethod,
            note: stOrderDetail.orderInfo.note,
            productList: stOrderDetail.items.map(({ name, variationName, imageUrl, price, quantity }) => ({
                name,
                modelName: variationName,
                image: imageUrl,
                newPrice: price,
                quantity
            })),
            subTotal: stOrderDetail.orderInfo.subTotal,
            vat: stOrderDetail.orderInfo.totalTaxAmount,
            discount: stOrderDetail.orderInfo.discount.totalDiscount,
            shipping: stOrderDetail.orderInfo.shippingFee,
            total: stOrderDetail.orderInfo.totalPrice
        } }/>

    }, [chat.mid, stOrderDetail?.orderInfo?.orderId, stCustomerProfile?.phone, stShippingAddress])

    const renderMessageTemplate = (msgObj) => {
        const data = msgObj.message.attachment.payload
        switch (data.template_type) {
            case 'generic':
                return (<div className="box-generic">
                    { data.elements.map(data => {
                        return (
                            <div className="render-generic">
                                <div className='box-generic-content'>
                                    <div className='generic-img'>
                                        <img src={ data.image_url } width={ 200 }/>
                                    </div>
                                    <div className="generic-content">
                                        <p className="generic-title">{ data.title }</p>
                                        <p className="generic-subtitle">{ data.subtitle }</p>
                                    </div>
                                </div>
                                <div className='box-button-generic'>
                                    { data.buttons.map(data => {
                                        return (
                                            <a href={ data.url } target="_blank"
                                               className="generic-button">{ data.title }</a>
                                        )
                                    }) }
                                </div>
                            </div>
                        )
                    }) }
                </div>)
                break
            case 'button':
                return (<div className="box-button">
                    <span className="text-button">{ data.text }</span>
                    { data.buttons.map(data => {
                        return (
                            <div className="render-button">
                                <a href={ data.url } target="_blank" className="button-title">{ data.title }</a>
                            </div>)
                    }) }
                </div>)
                break
            case 'media':
                return (
                    <div className="render-media">
                        <img src={ data.url } width={ 200 }/>
                    </div>
                )
                break
        }
    }

    const formatContent = (position) => {
        let msgObj = messaging
        if (typeof messaging === 'string') {
            msgObj = JSON.parse(messaging)
        }
        return (
            <>
                {/*NORMAL TEXT*/ }
                { msgObj.text &&
                <div className={ 'content-text-common content-text-' + position }>
                    <Emoji text={ msgObj.text }/>
                </div>
                }

                {/*STICKER*/ }
                { msgObj.sticker &&
                <img src={ msgObj.sticker } alt="sticker" className="content-sticker" style={ { maxHeight: '100px' } }/>
                }

                {/*SINGLE ATTACHMENT*/ }
                { msgObj.attachment &&
                <div>
                    { (msgObj.attachment.type === 'template' && msgObj.attachment.payload.template_type === 'receipt') && renderOrderSummary(msgObj) }
                </div>
                }
                {/*RENDER MESSAGE TEMPLATE*/ }
                { (msgObj.message?.attachment && msgObj.message.attachment.type === 'template') && renderMessageTemplate(msgObj) }

                {/*IMAGE VIDEO FILES*/ }
                { msgObj.attachments &&
                <div>
                    { msgObj.attachments.map(attachment => {
                        //{/*IMAGE*/}
                        if (attachment.type === 'image') {
                            return (
                                <a href={ attachment.payload.url } target="_blank" key={ attachment.payload.url }>
                                    <img src={ attachment.payload.url } alt="sticker" className="content-image"/>
                                </a>
                            )
                        }

                        // VIDEO
                        if (attachment.type === 'video') {
                            return (
                                <video src={ attachment.payload.url }
                                       className="content-video"
                                       style={ {
                                           maxWidth: '400px'
                                       } }
                                />
                            )
                        }

                        // AUDIO
                        if (attachment.type === 'audio') {
                            return (
                                <audio src={ attachment.payload.url }
                                    //width={attachment.video_data.width}
                                       controls
                                       className="content-audio"
                                       style={ {
                                           border: '1px solid gray',
                                           borderRadius: '99999px'
                                       } }
                                />
                            )
                        }

                        // FILE
                        if (attachment.type === 'file') {
                            const nameFilePure = attachment.payload.url.split('?')[0];
                            const nameFile = nameFilePure.split('/');
                            return (
                                <div className={ 'content-text-common content-file-' + position }>
                                    <a href={ attachment.payload.url } target="_blank" style={ {
                                        color: 'inherit',
                                        textDecoration: 'underline'
                                    } }>{ nameFile[nameFile.length - 1] }</a>
                                </div>
                            )
                        }
                    }) }
                </div>
                }
            </>
        )
    }

    return (
        <div className="fb-chat-box-message">
            {/* MESSAGE TIME */ }
            { isShowAvatar() &&
            <div className="message-time">
                { DateTimeUtils.formatFromNow(chat.messageTime) }
            </div>
            }

            {/* MESSAGE FROM CUSTOMER */ }
            { chat.isSellerSend === false &&
            <div className="chat-left">
                <img alt="sender-ava" src={ getAvatar(props.customerAvatar) } className="chat-avatar"
                     style={ { opacity: isShowAvatar() ? '1' : '0' } }/>
                { formatContent('left') }
            </div>
            }

            {/* MESSAGE FROM SELLER */ }
            { chat.isSellerSend === true &&
            <div className="chat-right">
                { stIsOrderFetching &&
                <div>
                    <Loading style={ LoadingStyle.ELLIPSIS }/>
                </div>
                }
                { formatContent('right') }
            </div>
            }

        </div>
    );
};

export default FbChatBoxMessageBubble;

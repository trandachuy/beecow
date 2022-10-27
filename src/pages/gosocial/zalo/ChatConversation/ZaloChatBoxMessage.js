/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 06/10/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useMemo, useState} from 'react';
import {OrderInZaloContext} from '../context/OrderInZaloContext';
import {OrderService} from '../../../../services/OrderService';
import Constants from '../../../../config/Constant';
import beehiveService from '../../../../services/BeehiveService';
import GoSocialOrderSummaryMessage from '../OrderInZalo/OrderSummaryMessage/GoSocialOrderSummaryMessage';
import {ZaloChatEnum} from '../../../live-chat/zalo/ZaloChatEnum';
import Emoji from 'react-emoji-render';
import moment from 'moment';
import {DateTimeUtils} from '../../../../utils/date-time';
import PropTypes from 'prop-types';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import styled from 'styled-components'
import i18n from 'i18next';
import Loading, {LoadingStyle} from '../../../../components/shared/Loading/Loading';
import GSImg from '../../../../components/shared/GSImg/GSImg';
import {AddressUtils} from '../../../../utils/address-utils'

const MessageTimeDiv = styled.div.attrs(props => ({
    fromSeller: props.fromSeller? 'flex-end':'flex-start'
}))`
  color: grey;
  text-align: right;
  padding-left: 3rem;
  padding-right: 2px;
  justify-content: ${props => props.fromSeller} !important;
`

const ZaloChatBoxMessage = props => {
    const { state, dispatch } = useContext(OrderInZaloContext.context)

    const [stOrderDetail, setStOrderDetail] = useState()
    const [stCustomerProfile, setStCustomerProfile] = useState()
    const [stShippingAddress, setStShippingAddress] = useState()
    const [stIsOrderFetching, setStIsOrderFetching] = useState(false);

    /**
     * @type {ChatHistoryDTO}
     */
    const conversation = props.data

    const resolveStickerUrl = () => {
        return props.data.url.replace('https://api.zalo.me/', 'https://api.zaloapp.com/')
    }

    const renderOrderSummary = (position) => useMemo(() => {
        const orderId = conversation.orderSummaryId
        setStIsOrderFetching(true)
        OrderService.getOrderDetail(Constants.SITE_CODE_GOSELL, orderId)
            .then(orderDetail => {
                if (!orderDetail) {
                    return
                }

                setStOrderDetail(orderDetail)
                setStIsOrderFetching(false)

                return Promise.allSettled([
                    beehiveService.getCustomerProfile(orderDetail.customerInfo.userId, Constants.SITE_CODE_GOSELL),
                    AddressUtils.buildAddress(orderDetail.shippingInfo.address1, orderDetail.shippingInfo.district, orderDetail.shippingInfo.ward, orderDetail.shippingInfo.country)
                ])
            })
            .then(([{ value: customerProfile }, { value: shippingAddress }]) => {
                setStCustomerProfile(customerProfile)
                setStShippingAddress(shippingAddress)
            })
            .finally(() => {
                setStIsOrderFetching(false)
            })

        return stOrderDetail && <GoSocialOrderSummaryMessage data={{
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
        }} />

    }, [conversation.mid, stOrderDetail?.orderInfo?.orderId, stCustomerProfile?.phone, stShippingAddress])

    // const message = props.data.message.replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, '<a href="$&">$&</a>')
    const formatContent = (position) => {
        try {
            switch (conversation.msgType) {
                case ZaloChatEnum.MESSAGE_TYPE.UN_SUPPORT:
                    return (
                        <div className={'live-chat-chat-box-message-bubble__blank-mess-' + position}>
                           <em><GSTrans t="page.gosocial.zalo.unSupporedMessage"/></em>
                        </div>
                    )
                case ZaloChatEnum.MESSAGE_TYPE.TEXT:
                    return (
                        <div className={'white-space-pre  live-chat-chat-box-message-bubble__blank-mess-' + position}>
                            <Emoji text={conversation.messageObject.text} />
                        </div>
                    )
                case ZaloChatEnum.MESSAGE_TYPE.STICKER:
                    const stickerUrl = conversation.messageObject.attachments[0]?.payload.url
                    return (
                        <img src={stickerUrl} alt="sticker" className="ml-3" style={{ maxHeight: '100px' }} />
                    )
                case ZaloChatEnum.MESSAGE_TYPE.IMAGE:
                    const imageUrl = conversation.messageObject.attachments[0]?.payload.url
                    const imageThumbnail = conversation.messageObject.attachments[0]?.payload.thumbnail
                    return (
                        <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="ml-3">
                            <GSImg src={imageThumbnail || imageUrl}
                                 alt="image-msg"
                                 className={" message-image"}

                            />
                        </a>
                    )
                case ZaloChatEnum.MESSAGE_TYPE.FILE:
                    const fileUrl = conversation.messageObject.attachments[0]?.payload.url
                    const fileName = conversation.messageObject.attachments[0]?.payload.name
                    const fileType = conversation.messageObject.attachments[0]?.payload.type
                    const fileSize = conversation.messageObject.attachments[0]?.payload.size
                    return (
                        <div className={'d-flex align-items-center live-chat-chat-box-message-bubble__blank-mess-' + position}>
                            <div>
                            <span>
                                <strong>{fileName}</strong>
                            </span>
                                <br/>
                                <span className="color-gray ">
                                {fileType && <>
                                    {fileType.toUpperCase()}{fileType? ' • ':''}
                                </>}
                                    { (fileSize/1024/102).toFixed(1) + 'MB'}
                                    {' • '}
                                    <a href={fileUrl} target="_blank" rel="noreferrer noopener">
                                    <GSTrans t="page.gosocial.chat.downloadFile"/>
                                </a>
                            </span>
                            </div>

                        </div>
                    )
                case ZaloChatEnum.MESSAGE_TYPE.VIDEO:
                    const videoUrl = conversation.messageObject.attachments[0]?.payload.url
                    return (
                        <video src={videoUrl} controls className="ml-3" style={{
                            borderRadius: '.5rem',
                            maxWidth: '200px'
                        }}/>
                    )
                case ZaloChatEnum.MESSAGE_TYPE.LIST:
                    return conversation.messageObject.attachments.map(({payload, type}) => (
                        <a href={payload.url} rel="noreferrer noopener" target="_blank"
                           className={'live-chat-chat-box-message-bubble__link live-chat-chat-box-message-bubble__blank-mess-' + position}>
                            <img src={payload.thumbnail} alt="link" className="d-block mb-2"/>
                            <strong>{conversation.messageObject.text}</strong>
                            <br/>
                            <span>{payload.description}</span>
                        </a>
                    ))
                case ZaloChatEnum.MESSAGE_TYPE.AUDIO:
                    const audioUrl = conversation.messageObject.attachments[0]?.payload.url
                    return (
                        <div className={'d-flex align-items-center live-chat-chat-box-message-bubble__blank-mess-' + position}>
                            <div>
                            <span>
                                <strong>{i18n.t('component.zalo.chat.messageType.AUDIO')}</strong>
                            </span>
                                <br/>
                                <span className="color-gray ">
                                <a href={audioUrl} target="_blank" rel="noreferrer noopener">
                                    <GSTrans t="page.gosocial.chat.downloadFile"/>
                                </a>
                            </span>
                            </div>

                        </div>
                    )
                case ZaloChatEnum.MESSAGE_TYPE.BUSINESS:
                    const businessName = conversation.messageObject.text
                    const businessAvatar = conversation.messageObject.attachments[0].payload.thumbnail
                    let businessPhone
                    let businessLink
                    if (conversation.messageObject.attachments[0].payload.description) {
                        const description = JSON.parse(conversation.messageObject.attachments[0].payload.description)
                        businessPhone = description.phone
                        businessLink = 'https://' + conversation.messageObject.attachments[0].payload.url + '/' + businessPhone
                    }
                    return (
                        <div className={'live-chat-chat-box-message-bubble__blank-mess-' + position}>
                            <div className="d-flex align-items-center" style={{
                                minWidth: '15rem'
                            }}>
                                <img src={businessAvatar} alt="business" style={{
                                    borderRadius: '50%',
                                    width: 50,
                                    height: 50,
                                    marginRight: '.5rem'
                                }}/>
                                <div>
                                    <span className="color-gray font-size-_8rem">
                                        <GSTrans t="component.zalo.chat.messageType.BUSINESS"/>
                                    </span>
                                    <br/>
                                    <span className="font-size-1rem font-weight-500">
                                        {businessName}
                                    </span>
                                    <br/>
                                    {businessPhone &&
                                        <div className="d-flex align-items-center color-gray">
                                            <span className="pr-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                     fill="currentColor" className="bi bi-card-heading" viewBox="0 0 16 16">
                                                <path
                                                    d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                                                <path
                                                    d="M3 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0-5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-1z"/>
                                            </svg>
                                            </span>
                                            <span style={{
                                                lineHeight: 0
                                            }}>
                                                {businessPhone}
                                            </span>
                                        </div>
                                    }
                                </div>
                                {businessLink &&
                                <div className="ml-auto">
                                    <a href={businessLink} target="_blank" rel="noopener noreferrer" style={{
                                        borderRadius: '.25rem',
                                        border: '1px solid lightgray',
                                        padding: '.5rem',
                                        backgroundColor: 'white'
                                    }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                             className="bi bi-chat-left-dots" viewBox="0 0 16 16">
                                            <path
                                                d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                            <path
                                                d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                                        </svg>
                                    </a>
                                </div>
                                }
                            </div>
                        </div>
                    )
                case ZaloChatEnum.MESSAGE_TYPE.ORDER:
                    return renderOrderSummary()
                case ZaloChatEnum.MESSAGE_TYPE.LOCATION:
                default:
                    return null
            }

        } catch (e) {
            console.error(e)
            return null
        }
    }

    const isShowAvatar = () => {
        // if has no next message -> show
        if (!props.nextMessage) {
            return true
        }
        // if next message has a same src and sent time < 60s -> hide
        if (props.data.isSellerSend === props.nextMessage.isSellerSend) {
            // next created_time - current created_time
            const timeDiff = moment(props.nextMessage.messageTime).diff(props.data.messageTime, 'seconds')
            if (timeDiff < 60) {
                return false
            }
        }
        return true
    }

    return (
        <div>


            {/*MESSAGE FROM CUSTOMER*/}
            {!conversation.isSellerSend &&
            <div className={[' live-chat-chat-box-message-bubble live-chat-chat-box-message-bubble--left'].join(' ')}>
                <img alt="sender-ava"
                     src={props.userAvatar}
                     className="live-chat-chat-box-message-bubble__avatar"
                     style={{
                         opacity: isShowAvatar() ? '1' : '0'
                     }}
                />
                {formatContent('left')}
            </div>
            }

            {/*MESSAGE FROM OA*/}
            {/*message*/}
            {conversation.isSellerSend &&
            <div className={['live-chat-chat-box-message-bubble live-chat-chat-box-message-bubble--right'].join(' ')}>
                {stIsOrderFetching &&
                    <div>
                        <Loading style={LoadingStyle.ELLIPSIS}/>
                    </div>
                }
                {formatContent('right')}
            </div>
            }

            {/*time*/}
            {isShowAvatar() &&
            <MessageTimeDiv className="message-time" fromSeller={conversation.isSellerSend}>
                {DateTimeUtils.formatTimeOrDateTime(props.data.messageTime)}
            </MessageTimeDiv>
            }


        </div>
    )
}


ZaloChatBoxMessage.propTypes = {
    userAvatar: PropTypes.string,
    nextMessage: PropTypes.any,
    data: PropTypes.object,
}

export default ZaloChatBoxMessage
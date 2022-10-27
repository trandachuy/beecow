import GSImg from "../../GSImg/GSImg"
import PropTypes, {bool, func, number, object, string} from "prop-types"
import Row from "reactstrap/es/Row"
import Col from "reactstrap/es/Col"
import Modal from "reactstrap/es/Modal"
import ModalBody from "reactstrap/es/ModalBody"
import ModalHeader from "reactstrap/es/ModalHeader"
import ModalFooter from "reactstrap/es/ModalFooter"
import React, {createRef, useEffect, useRef, useState} from 'react'
import GSTrans from "../../GSTrans/GSTrans"
import Constants from "../../../../config/Constant"
import Constant from "../../../../config/Constant"
import beehiveService from "../../../../services/BeehiveService"

import "./CallCenterListener.sass"
import i18next from "i18next"
import {v4 as uuidv4} from 'uuid'
import storage from "../../../../services/storage"
import { CredentialUtils } from "../../../../utils/credential"
import { TokenUtils } from "../../../../utils/token"
import AddContactModal from "../../AddContactModal/AddContactModal"
import { GSToast } from "../../../../utils/gs-toast"
import callCenterService from "../../../../services/CallCenterService"
import CallCustomerInformationModal from "../CallCustomerInformationModal/CallCustomerInformationModal";
import CallCenterSDK from "../CallCenterSDK"
import PubSub from 'pubsub-js';


const callStatusMapping = {
    outbound: Constants.CALL_TYPE.OUTBOUND,
    inbound: Constants.CALL_TYPE.INBOUND,
}

const CallCenterListener = props => {

    const { resetModal, onClose, onCallAssigned} = props
    const [stOmiCallConfig, setStOmiCallConfig] = useState({sipUser: null, domain: null, password: null})

    const [stCallInfo, setStCallInfo] = useState({
        callId: '',
        toNumber: 0,
        toName: null,
        toID: null,
        type: Constants.CALL_TYPE.OUTBOUND,
        state: Constant.CALL_STATE.NON_SUCCESSFUL,
        startTime: null,
        duration: null,
        endTime: null
    })
    const [stCallTime, setStCallTime] = useState({
        m: 0,
        s: 0,
        toString: function () {
            return (this.m < 10 ? '0' + this.m.toString() : this.m) + ':' + (this.s < 10 ? '0' + this.s.toString() : this.s)
        }
    },)
    const [stCallMessage, setStCallMessage] = useState('')
    const [stIsMuted, setStIsMuted] = useState(false)
    const [stOmiData, setStOmiData] = useState(null)

    const [stIsConnecting, setStIsConnecting] = useState(false)
    const [callModal, setCallModal] = useState(false)
    const [hideAnswerButton, setHideAnswerButton] = useState(false)
    const [stToggleAddContact, setStToggleAddContact] = useState(false)
    const [stToNumber, setStToNumber] = useState('')
    const [stToId, setStToId] = useState()
    const [stContacts, setStContacts] = useState([])
    const [stRejectCall, setStRejectCall] = useState(false)
    const [stToggleAssignContact, setStToggleAssignContact] = useState(false)
    const [subTokens, setSubTokens] = useState([])

    const refCallHistoryId = useRef(null)
    const omiSDKRef = createRef()
    const callTimerRef = useRef()
    const fetchRef = useRef()
    const refIsLoading = useRef(false)

    useEffect(() => {
        reInitCallInfo()
    }, [resetModal])

    useEffect(() => {
        if (!stCallInfo.startTime) {
            return
        }
        createOrUpdateCallHistory(stCallInfo)
    }, [stCallInfo.startTime])

    useEffect(() => {
        if (!stCallInfo.endTime) {
            return
        }
        createOrUpdateCallHistory(stCallInfo)
    }, [stCallInfo.endTime])

    useEffect(() => {
        if (stCallInfo.toNumber.length > 3 && !stCallInfo.toName) {
            debounce(() => handleFetchContact(stCallInfo.toNumber), 300)
        }
    }, [stCallInfo.toNumber])

    useEffect(() => {
        if(stOmiData && stRejectCall === false) {
            debounce(() => handleCallEnd(stOmiData), 300);
        }
    }, [stOmiData])

    useEffect(() => {
        onRegister()
        return () => {
            stopOmi()
            unRegister()
        }
    }, [])

    const onRegister = () => {
        reInitCallInfo()
        const tokenEndCall = PubSub.subscribe(Constants.SUB_PUB_TOPIC.CALL_CENTER.END_CALL, function(name, data) {
            console.log(`CallCenterListener ${name}`);
            onEndCall(data)
        });
        const tokenOtherAcceptCall = PubSub.subscribe(Constants.SUB_PUB_TOPIC.CALL_CENTER.OTHER_ACCEPT_CALL, function(name, data) {
            console.log(`CallCenterModal ${name}`);
            onAcceptOther(data)
        });
        const tokenIncomingCall = PubSub.subscribe(Constants.SUB_PUB_TOPIC.CALL_CENTER.INCOMING_CALL, function(name, data) {
            console.log(`CallCenterModal ${name}`);
            onIncomingCall(data)
        });
        setSubTokens([tokenEndCall, tokenOtherAcceptCall, tokenIncomingCall])
    }

    const unRegister = () => {
        subTokens.forEach(token => {
            PubSub.unsubscribe(token)
        })
    }

    const reInitCallInfo = () => {
        setStCallInfo({
            callId: '',
            toNumber: '',
            toName: '',
            toID: '',
            type: Constants.CALL_TYPE.INBOUND,
            state: Constant.CALL_STATE.NON_SUCCESSFUL,
            startTime: null,
            duration: null,
            endTime: null
        })
        setStIsMuted(false)
        setStCallMessage('')
        setStIsMuted(false)
    }

    const toggle = () => {
        declineCall()
        onClose()
        setCallModal(false)
    }

    const timer = {
        start: () => {
            let s = 0,
                m = 0

            callTimerRef.current = setInterval(() => {
                if (s === 59) {
                    m += 1
                    s = 0
                } else {
                    s += 1
                }
                setStCallTime(callTime => ({
                    ...callTime,
                    m,
                    s,
                }))
            }, 1000)
        },
        stop: () => {
            callTimerRef.current && clearInterval(callTimerRef.current)
            setStCallTime(callTime => ({
                ...callTime,
                m: 0,
                s: 0,
            }))
        }
    }

    const updateCallInfo = (obj) => {
        setStCallInfo(info => Object.assign({}, info, obj))
    }

    const createOrUpdateCallHistory = async (callData) => {
        const {callId, toNumber, toName, toID, type, state, startTime, duration, endTime} = callData

        let body = {
            callId,
            storeId: +storage.get(Constants.STORAGE_KEY_STORE_ID),
            customerId: toID,
            customerName: toName,
            toNumberPhone: toNumber,
            type: type,
            fromExtension: CredentialUtils.getOmiCallExtension(),
            callBy: TokenUtils.getDisplayName(),
            callById: +storage.get(Constants.STORAGE_KEY_USER_ID),
            timeStarted: startTime && new Date(startTime).toISOString(),
            duration: duration,
            timeEnd: endTime && new Date(endTime).toISOString(),
            status: state,
        }

        setStToId(toID)
        setStToNumber(toNumber)

        if (refCallHistoryId.current) {
            body = {
                ...body,
                id: refCallHistoryId.current,
            }
        }

        refIsLoading.current = true
        callCenterService[!refCallHistoryId.current ? 'createCallHistory' : 'updateCallHistory'](body)
            .then((result) => {
                if (endTime) {
                    resetModal(reset => !reset)
                    refCallHistoryId.current = null
                } else {
                    refCallHistoryId.current = result.id
                }
            })
            // .catch(() => GSToast.commonError())
            .finally(() => refIsLoading.current = false)

    }

    const handleFetchContact = async (phoneNumber) => {
        try {
            let id, fullName;
            const {data} = await beehiveService.getCustomerListByPhone(0, 100, phoneNumber);
            if (data && data.length  > 0) {
                setStContacts(data)
                if(data.length === 1) {
                    id = data[0].id;
                    fullName = data[0].fullName;
                    setStToId(id);
                }
            }
            return updateCallInfo({...stCallInfo, toName: fullName, toID: id})
        } catch (error) {
            console.log(error)
        }
        return updateCallInfo({...stCallInfo})
    }

    const formatPhoneNumber = (value) => {
        value = value? value : "";
        const cleaned = value.replace(/\s/g, '')
        let match,
            phoneNumber

        switch (cleaned.length) {
            case 4:
                match = cleaned.match(/^(\d{3})(\d{1})$/)

                break
            case 5:
                match = cleaned.match(/^(\d{3})(\d{2})$/)

                break
            case 6:
                match = cleaned.match(/^(\d{3})(\d{3})$/)

                break
            case 7:
                match = cleaned.match(/^(\d{3})(\d{3})(\d{1})$/)

                break
            case 8:
                match = cleaned.match(/^(\d{3})(\d{3})(\d{2})$/)

                break
            case 9:
                match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{1})$/)

                break
            case 10:
                match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/)

                break
        }
        if (match && match.length) {
            phoneNumber = match.slice(1, match.length).join(' ')
        } else if (cleaned.length > 10) {
            phoneNumber = cleaned
        } else {
            phoneNumber = value
        }

        return phoneNumber
    }

    const debounce = (fn, delay) => {
        clearTimeout(fetchRef.current)
        fetchRef.current = setTimeout(fn, delay)
    }

    const handleCallEnd = (data) => {
        console.log("handle call end: ", data);
        const {uuid, startTime, endTime, duration} = data
        setStCallMessage("component.callCenter.state.callend")

        updateCallInfo({
            callId: uuid,
            duration: duration,
            startTime: startTime,
            endTime: endTime
        })
        setStIsConnecting(false)
        setHideAnswerButton(false);
        if(stContacts.length === 0 && stRejectCall === false) {
            setStToggleAddContact(true);
        }else if(stContacts.length > 1 && stRejectCall === false){
            setStToggleAssignContact(true);
        }
        setStRejectCall(false);
    }

    const setDialNumber = (mode, value) => {
        if (stCallInfo.startTime) {
            return
        }

        switch (mode) {
            case -1:
                setStCallInfo((info) => ({
                    ...info,
                    toNumber: info.toNumber.slice(0, -1),
                }))

                break
            case 0:
                setStCallInfo((info) => ({
                    ...info,
                    toNumber: value,
                }))

                break
            case 1:
                setStCallInfo((info) => ({
                    ...info,
                    toNumber: info.toNumber + value,
                }))

                break
        }
    }

    const getConfigOmiCall = () => {
        const config = {
            register_fn: function (data) { //Sự kiện xảy ra khi ghi danh tổng đài
                console.log(data)
            },
            incall_fn: function (data) { //Sự kiện xảy ra khi thay đổi trạng thái trong cuộc gọi
                console.log(data)
            },
            accept_fn: function (data) { //Sự kiện xảy ra khi cuộc gọi được chấp nhận
                console.log(data)
            },
            invite_fn: onIncomingCall, //Sự kiện xảy ra khi có một cuộc gọi tới
            ping_fn: function (data) { //Kiểm tra tính hiệu cuộc gọi
                console.log(data)
            },
            accept_out_fn: onAcceptOther, //Sự kiện xảy ra khi cuộc gọi được chấp nhận ở thiết bị khác
            endcall_fn: onEndCall //Sự kiện xảy ra khi cuộc gọi kết thúc
        }

        return config
    }

    const acceptOmi = (number = stCallInfo.toNumber) => {

        setStIsConnecting(true)
        setStCallMessage("component.callCenter.state.incoming")
        timer.start()
        updateCallInfo({
            startTime: new Date().toISOString()
        })

        try {
            omiSDKRef.current && omiSDKRef.current.acceptCall()
            setHideAnswerButton(true)
            setStRejectCall(false)
        } catch (e) {
            console.log(e);
        }
    }

    const stopOmi = () => {
        omiSDKRef.current && omiSDKRef.current.rejectCall()
        setCallModal(false)
    }

    const declineCall = () => {
        omiSDKRef.current && omiSDKRef.current.stopCall()
        setCallModal(false)
        setStRejectCall(true);
    }

    const onIncomingCall = (data) => {
        console.log('incoming call', data)
        const {direction, startTime, phone, uuid} = data;

        setStToNumber(phone)
        setCallModal(true)

        updateCallInfo({
            callId: uuid,
            type: callStatusMapping[direction],
            state: Constants.CALL_STATE.SUCCESSFUL,
            startTime: startTime,
            toNumber: phone,
        })
    }

    const onAcceptOther = (data) => {
        console.log('accepted incoming call from other device', data)
        const {direction} = data;

        if(callStatusMapping[direction] === callStatusMapping.inbound) {
            setStCallMessage("component.callCenter.state.callend")
            setCallModal(false);
            setStRejectCall(true);
        }
    }

    const onEndCall = (data) => {
        console.log('call end', data);
        const {direction} = data
        if(callStatusMapping[direction] === callStatusMapping.inbound) {
            timer.stop()
            setCallModal(false);
            setHideAnswerButton(false);
            setStOmiData(data);
        }
    }

    //UI region
    const closeBtn = (
        <button className="close" style={{
            position: 'absolute', top: '0', right: '0', transform: 'translate(50%, -50%)', margin: 0,
            background: 'black', color: 'white', fontSize: '1.1em', padding: '0.4em 0.6em', borderRadius: '50%'
        }} onClick={toggle}>&times;</button>
    )
    const SearchBox = () => (<>
        <h2 className="call-center__body__to__number__input">
            <bdi>{formatPhoneNumber(stCallInfo.toNumber)}</bdi>
        </h2>
        {!stCallInfo.startTime && <GSImg src="/assets/images/call_center/label.svg"
                                         width={40}
                                         height={40}
                                         className="call-center__body__to__number__backspace p-2"
                                         onClick={() => setDialNumber(-1)}/>}
    </>)

    return (
        <>
            <CallCenterSDK
                ref={omiSDKRef}
            />
            <>
                <Modal isOpen={callModal}>
                    <ModalHeader toggle={toggle} close={closeBtn} className="call-center__header">
                        {stCallInfo.startTime && <GSImg
                            src={"/assets/images/call_center/" + (stIsMuted ? "technology-3.svg" : "communications-2.svg")}
                            width={30}
                            height={30}
                            onClick={() => setStIsMuted(!stIsMuted)}/>}
                    </ModalHeader>
                    <ModalBody className="call-center__body">
                        {stCallInfo.startTime && <div>
                            <span className="call-center__body__outgoing">
                                <GSTrans t={stCallMessage}/>
                            </span>
                        </div>}
                        <div>
                            <GSImg src="/assets/images/call_center/avatar.svg"
                                width={100}
                                height={100}
                                className="mt-5 mb-5"/>
                            <h5 className="mb-1">{stCallInfo.toName}</h5>
                            <div className="call-center__body__to__number mb-4">
                                <SearchBox/>
                            </div>
                        </div>
                        <h6 className="mb-3">{stIsConnecting && stCallTime.toString()}</h6>
                    </ModalBody>
                    <ModalFooter className="call-center__footer">
                        {<GSImg
                            hidden={hideAnswerButton}
                            src={"/assets/images/call_center/icon_1.svg"}
                            width={90}
                            height={90}
                            className={["call-center__footer__answer"].join(' ')}
                            onClick={acceptOmi}/>
                        }
                        {<GSImg
                            src={"/assets/images/call_center/icon_2.svg"}
                            width={90}
                            height={90}
                            className={["call-center__footer__decline", (hideAnswerButton)? "call-center__footer__decline__onlyone":""].join(' ')}
                            onClick={(hideAnswerButton)? stopOmi:declineCall}/>
                        }
                    </ModalFooter>
                </Modal>
            </>
            <AddContactModal
                isToggle={stToggleAddContact}
                callHistoryId={refCallHistoryId.current}
                phoneNumber={stToNumber.trim()}
                onCallAssigned={onCallAssigned}
                onClose={() => setStToggleAddContact(false)}
            />
            <CallCustomerInformationModal
                isToggle={stToggleAssignContact}
                contacts={stContacts}
                callHistoryId={refCallHistoryId.current}
                phoneNumber={stToNumber.trim()}
                onClose={() => setStToggleAssignContact(false)}
                onCreateContact={() => {
                    setStToggleAssignContact(false)
                    setStToggleAddContact(true)
                }}
                onCallAssigned={onCallAssigned}
            />
        </>
    )
}

CallCenterListener.defaultProps = {
    isAutoCall: false,
    onClose: () => {
    },
    resetModal: () => {
    },
    onCallAssigned: () => {
    }
}

CallCenterListener.propTypes = {
    toID: number,
    toNumber: string,
    toName: string,
    isAutoCall: PropTypes.bool,
    onClose: PropTypes.func,
    resetModal: PropTypes.func,
    onCallAssigned: func,
    revertColor: bool,
    style: object,
    disabled: bool,
    onCallDisconnected: func

}

export default CallCenterListener

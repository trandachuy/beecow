import GSImg from "../GSImg/GSImg"
import PropTypes, {number, oneOfType, string} from "prop-types"
import Row from "reactstrap/es/Row"
import Col from "reactstrap/es/Col"
import Modal from "reactstrap/es/Modal"
import GSTrans from "../GSTrans/GSTrans"
import ModalBody from "reactstrap/es/ModalBody"
import Constants from "../../../config/Constant"
import Constant from "../../../config/Constant"
import ModalHeader from "reactstrap/es/ModalHeader"
import ModalFooter from "reactstrap/es/ModalFooter"
import React, {createRef, useEffect, useRef, useState} from 'react'
import beehiveService from "../../../services/BeehiveService"

import "./CallCenterModal.sass"
import i18next from "i18next"
import {Prompt} from "react-router-dom"
import CallCenterSDK from "./CallCenterSDK"
import PubSub from 'pubsub-js';

const SIZE_PER_PAGE = 10

const callStatusMapping = {
    outbound: Constants.CALL_TYPE.OUTBOUND,
    inbound: Constants.CALL_TYPE.INBOUND,
}

const CallCenterModal = props => {
    
    const {domain, username, password, toID, toNumber, toName, isAutoCall, callModal, resetModal, onClose, createOrUpdateCallHistory} = props

    const [stCallInfo, setStCallInfo] = useState({
        callId: '',
        toNumber,
        toName,
        toID,
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
    const [stIsDisabled, setStIsDisabled] = useState(true)

    const [stIsSuggestSearch, setStIsSuggestSearch] = useState(false)
    const [stCustomerProfiles, setStCustomerProfiles] = useState([])
    const [stCanloadMore, setStCanloadMore] = useState(false)
    const [stPage, setStPage] = useState(0)
    const [stIsConnecting, setStIsConnecting] = useState(false)
    const [subTokens, setSubTokens] = useState([])
    const [hasRegister, setRegister] = useState(false);

    let omiSDKRef = useRef()
    const callTimerRef = useRef()
    const fetchRef = useRef()
    
    useEffect(() => {
        if (callModal) {

            reInitCallInfo()

            if (isAutoCall) {
                setTimeout(callOmi, 300)
            }
            
            window.addEventListener('keypress', handleOnkeypress)
            window.addEventListener('keydown', handleOnKeyDown)

            return () => {
                window.removeEventListener('keypress', handleOnkeypress)
                window.removeEventListener('keydown', handleOnKeyDown)
            }
        }
    }, [callModal])

    useEffect(() => {
        reInitCallInfo()
    }, [resetModal])

    useEffect(() => {
        if (!stCallInfo.startTime) {
            return
        }
        createOrUpdateCallHistory(stCallInfo)
        window.addEventListener('beforeunload', handleLeavePage)

        return () => {
            window.removeEventListener('beforeunload', handleLeavePage)
        }
    }, [stCallInfo.startTime])

    useEffect(() => {
        if (!stCallInfo.endTime) {
            return
        }

        createOrUpdateCallHistory(stCallInfo)
    }, [stCallInfo.endTime])

    useEffect(() => {
        setStIsDisabled(!stCallInfo.toNumber)

        if (stCallInfo.toNumber.length > 3 && !stCallInfo.toName) {
            debounce(() => fetchData(0), 300)
        } else {
            setStIsSuggestSearch(false)
        }
    }, [stCallInfo.toNumber])

    useEffect(() => {
        //todo handle mute call
    }, [stIsMuted])

    useEffect(() => {
        
        if (!hasRegister) {
            setRegister(true);
            onRegister()
        }

        return () => {
            stopOmi()
            unRegister()
        }
    }, [])

    const onRegister = () => {
        const tokenEndCall = PubSub.subscribe(Constants.SUB_PUB_TOPIC.CALL_CENTER.END_CALL, function(name, data) {
            console.log(`CallCenterModal ${name}`);
            onDialStopped(data)
        });
        const tokenAcceptCall = PubSub.subscribe(Constants.SUB_PUB_TOPIC.CALL_CENTER.ACCEPT_CALL, function(name, data) {
            console.log(`CallCenterModal ${name}`);
            onDialAccepted(data)
        });
        const tokenChangeState = PubSub.subscribe(Constants.SUB_PUB_TOPIC.CALL_CENTER.CHANGE_STATE, function(name, data) {
            console.log(`CallCenterModal ${name}`);
            onChangeState(data)
        });
        setSubTokens([tokenEndCall,tokenAcceptCall,tokenChangeState])
    }

    const unRegister = () => {
        subTokens.forEach(token => {
            PubSub.unsubscribe(token)
        })
    }

    const reInitCallInfo = () => {
        setStCallInfo({
            callId: '',
            toNumber: toNumber,
            toName: toName,
            toID: toID,
            type: Constants.CALL_TYPE.OUTBOUND,
            state: Constant.CALL_STATE.NON_SUCCESSFUL,
            startTime: null,
            duration: null,
            endTime: null
        })
        setStIsMuted(false)
        setStCallMessage('')
        setStIsMuted(false)
        setStIsDisabled(true)
    }
    const toggle = () => {
        stopOmi()

        onClose()
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
    const isBottom = (el) => {
        const afterCall = Math.floor(el.scrollHeight - el.scrollTop)

        return afterCall <= el.clientHeight
    }
    const formatPhoneNumber = (value) => {
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

    const fetchData = (page) => {
        const pageIndex = page === 0 ? page : stPage

        setStCanloadMore(false)
        beehiveService.getCustomerListByPhone(pageIndex, SIZE_PER_PAGE, stCallInfo.toNumber)
            .then(result => {
                setStIsSuggestSearch(!!result.data.length)
                setStCustomerProfiles((profiles) => {
                    const oldProfiles = pageIndex === 0 ? [] : stCustomerProfiles

                    return [
                        ...oldProfiles,
                        ...result.data.map(profile => ({
                            id: profile.id,
                            name: profile.fullName,
                            phone: profile.phoneBackup && profile.phoneBackup.split(',').find((value) => (value && value.indexOf(stCallInfo.toNumber) >= 0)),
                        }))
                    ]
                })

                if ((result.data.length + (pageIndex * SIZE_PER_PAGE)) < result.total) {
                    setStCanloadMore(true)
                } else {
                    setStCanloadMore(false)
                }
                setStPage(p => page === 0 ? 1 : (p + 1))
            })
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

    const onChangeState = (data) => {
        setStIsDisabled(false)
        const {status} = data
        switch (status) {
            case 183:
                onDialStarted(data)
                console.log(data)
                break
            case -1:
                break;
        }

        if (status === -1) {
            return
        }
    }

    const callOmi = (number = stCallInfo.toNumber) => {
        updateCallInfo({
            startTime: new Date().toISOString()
        })
        try {
            omiSDKRef.current && omiSDKRef.current.makeCall(number)
        } catch (e) {
            reInitCallInfo()
        }
    }

    const stopOmi = () => {
        omiSDKRef.current && omiSDKRef.current.stopCall()
    }

    const onDialStarted = (data) => {
        const {direction, start_time} = data

        if(callStatusMapping[direction] === callStatusMapping.outbound) {
            setStCallMessage("component.callCenter.state.outgoing")
    
            updateCallInfo({
                type: callStatusMapping[direction],
                startTime: start_time
            })
        }
    }
    const onDialAccepted = (data) => {
        console.log('accept', data)
        const {direction} = data;

        if(callStatusMapping[direction] === callStatusMapping.outbound) {
            setStIsConnecting(true)
            setStCallMessage("component.callCenter.state.connect")
            timer.start()

            updateCallInfo({
                state: Constants.CALL_STATE.SUCCESSFUL
            })
        }
    }
    const onDialStopped = (data) => {
        console.log('stopped', data)

        const {uuid, startTime, endTime, direction, duration} = data

        if(callStatusMapping[direction] === callStatusMapping.outbound) {
            timer.stop()

            updateCallInfo({
                callId: uuid,
                duration: duration,
                startTime: startTime,
                endTime: endTime
            })
            setStIsConnecting(false)
            setStIsDisabled(true)
        }
    }

    const onScroll = (e) => {
        if (isBottom(e.currentTarget) && stCanloadMore) {
            fetchData()
        }
    }
    const onSelectCustomerProfile = (e, profile) => {
        const {id, name, phone} = profile

        updateCallInfo({
            toID: id,
            toName: name,
            toNumber: phone,
        })

        callOmi(phone)
    }

    const handleOnkeypress = (ev) => {
        if (!stCallInfo.startTime && (!isNaN(ev.key) || ev.key === '*' || ev.key === '#')) {
            setDialNumber(1, ev.key)
        }
    }
    const handleOnKeyDown = (ev) => {
        if (!stCallInfo.startTime && (ev.key === 'Backspace' || ev.key === 'Delete')) {
            setDialNumber(-1)
        }
    }
    const handleLeavePage = (ev) => {
        stopOmi()
        ev.preventDefault()
        ev.returnValue = ''
    }

    //UI region
    const DialBtn = props => (
        <button onClick={() => setDialNumber(1, props.text)}>
            {props.text}{props.subText && <span className="call-center__body__sub-text"><br/>{props.subText}</span>}
        </button>
    )
    const closeBtn = (
        <button className="close" style={{
            position: 'absolute', top: '0', right: '0', transform: 'translate(50%, -50%)', margin: 0,
            background: 'black', color: 'white', fontSize: '1.1em', padding: '0.4em 0.6em', borderRadius: '50%'
        }} onClick={toggle}>&times;</button>
    )
    const formatPhoneUI = (value) => {
        if (value.length <= 10) {
            const formatPhone = formatPhoneNumber(value),
                formatToNumber = formatPhoneNumber(stCallInfo.toNumber)

            return <>
                <span style={{color: 'rgb(111, 129, 229)'}}>{formatPhone.substring(0, formatToNumber.length)}</span>
                <span>{formatPhone.substring(formatToNumber.length, formatPhone.length)}</span>
            </>
        }

        const toNumberLength = stCallInfo.toNumber.length

        return <>
            <span style={{color: 'rgb(111, 129, 229)'}}>{value.substring(0, toNumberLength)}</span>
            <span>{value.substring(toNumberLength, value.length)}</span>
        </>
    }
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
    //UI end region

    return (
        <>
            <CallCenterSDK
                ref={omiSDKRef}
            />
            <Prompt
                when={!!stCallInfo.startTime}
                message={(location, action) => {
                    if (action === 'POP') {
                        stopOmi()
                    }

                    return i18next.t('component.product.addNew.cancelHint')
                }}
            />
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

                    {stIsSuggestSearch && !stCallInfo.startTime && stCallInfo.toNumber.length > 3
                        ? <>
                            <div className="call-center__body__to__number text-left border-bottom pt-2 pb-2">
                                <SearchBox/>
                            </div>
                            <ul style={{minHeight: '12.1em', height: '12.1em', overflowX: 'hidden'}}
                                onScroll={onScroll}>
                                {stCustomerProfiles.map((profile) => (
                                    <li className="border-bottom text-left pt-2 pb-2"
                                        key={profile.id}
                                        onClick={(ev) => onSelectCustomerProfile(ev, profile)}>
                                        <div><span className="font-weight-bold">{profile.name}</span></div>
                                        <div>{formatPhoneUI(profile.phone)}</div>
                                    </li>
                                ))}
                            </ul>
                        </>
                        : <>
                            <GSImg src="/assets/images/call_center/avatar.svg"
                                   width={100}
                                   height={100}
                                   className="mt-5 mb-5"/>
                            <h6 className="mb-0">{stCallInfo.toName}</h6>
                            <div className="call-center__body__to__number mb-4">
                                <SearchBox/>
                            </div>
                        </>}
                    <h6 className="mb-3">{stIsConnecting && stCallTime.toString()}</h6>
                    {!stCallInfo.startTime && <div className="mb-4">
                        <Row className="mb-3">
                            <Col md={4} sm={4} xs={4}>
                                <DialBtn text={1}/>
                            </Col>
                            <Col md={4} sm={4} xs={4}>
                                <DialBtn text={2} subText={'ABC'}/>
                            </Col>
                            <Col md={4} sm={4} xs={4}>
                                <DialBtn text={3} subText={'DEF'}/>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={4} sm={4} xs={4}>
                                <DialBtn text={4} subText={'GHI'}/>
                            </Col>
                            <Col md={4} sm={4} xs={4}>
                                <DialBtn text={5} subText={'JKL'}/>
                            </Col>
                            <Col md={4} sm={4} xs={4}>
                                <DialBtn text={6} subText={'MNO'}/>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={4} sm={4} xs={4}>
                                <DialBtn text={7} subText={'PQRS'}/>
                            </Col>
                            <Col md={4} sm={4} xs={4}>
                                <DialBtn text={8} subText={'TUV'}/>
                            </Col>
                            <Col md={4} sm={4} xs={4}>
                                <DialBtn text={9} subText={'WXYZ'}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4} sm={4} xs={4}>
                                <DialBtn text={"*"}/>
                            </Col>
                            <Col md={4} sm={4} xs={4}>
                                <DialBtn text={0} subText={'+'}/>
                            </Col>
                            <Col md={4} sm={4} xs={4}>
                                <DialBtn text={'#'}/>
                            </Col>
                        </Row>
                    </div>}
                </ModalBody>
                <ModalFooter className="call-center__footer">
                    {<GSImg
                        src={"/assets/images/call_center/" + (!stCallInfo.startTime ? "icon_1.svg" : "icon_2.svg")}
                        width={90}
                        height={90}
                        className={["call-center__footer__dial", stIsDisabled ? 'call-center__footer__dial--disabled' : ''].join(' ')}
                        onClick={() => stCallInfo.startTime
                            ? stopOmi()
                            : callOmi()}/>}
                </ModalFooter>
            </Modal>
        </>
    )
}

CallCenterModal.defaultProps = {
    toNumber: '',
    toName: '',
    isAutoCall: false,
    onClose: () => {
    },
    createOrUpdateCallHistory: () => {
    }
}

CallCenterModal.propTypes = {
    domain: string.isRequired,
    username: oneOfType([string, number]).isRequired,
    password: string.isRequired,
    toID: PropTypes.number,
    toNumber: PropTypes.string,
    toName: PropTypes.string,
    isAutoCall: PropTypes.bool,
    callModal: PropTypes.bool,
    onClose: PropTypes.func,
    createOrUpdateCallHistory: PropTypes.func,
}

export default CallCenterModal

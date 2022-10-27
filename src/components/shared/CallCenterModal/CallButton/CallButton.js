import {bool, func, number, object, string} from "prop-types"
import {v4 as uuidv4} from 'uuid'
import GSImg from "../../GSImg/GSImg"
import GSButton from "../../GSButton/GSButton"
import CallCenterModal from "../CallCenterModal"
import storage from "../../../../services/storage"
import {TokenUtils} from "../../../../utils/token"
import Constants from "../../../../config/Constant"
import React, {useEffect, useRef, useState} from "react"
import {CredentialUtils} from "../../../../utils/credential"
import callCenterService from "../../../../services/CallCenterService"

import "./CallButton.sass"
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from "../../../layout/navigation/Navigation";
import { withRouter } from "react-router-dom";
import i18next from "i18next";
import GSTooltip from "../../GSTooltip/GSTooltip";
import GSComponentTooltip from "../../GSComponentTooltip/GSComponentTooltip";
import AddContactModal from "../../AddContactModal/AddContactModal";
import beehiveService from "../../../../services/BeehiveService";
import CallCustomerInformationModal from "../CallCustomerInformationModal/CallCustomerInformationModal";
import {GSToast} from "../../../../utils/gs-toast";

const CallButton = (props) => {
    const {sipUser, domain, password} = CredentialUtils.getOmiCallData() || {}
    const {revertColor, disabled, isAutoCall, onCallDisconnected, onCallAssigned, style, ...others} = props

    const [stCallModal, setStCallModal] = useState(false)
    const [stResetModal, setStResetModal] = useState(false)
    const [stToggleAddContact, setStToggleAddContact] = useState(false)
    const [stToggleAssignContact, setStToggleAssignContact] = useState(false)
    const [stToNumber, setStToNumber] = useState('')
    const [stToId, setStToId] = useState()
    const [stContacts, setStContacts] = useState([])
    const [stCallHistoryId, setStCallHistoryId] = useState()

    const refUniqueKey = useRef(uuidv4())
    const refCallButton = useRef(null)
    const refCallHistoryId = useRef(null)
    const refIsLoading = useRef(false)

    useEffect(() => {
        if (!refCallButton.current) {
            refCallButton.current = document.getElementById("callBtn__" + refUniqueKey.current)
        }

        if (refCallButton.current) {
            refCallButton.current.addEventListener("click", toggle, true)

            return () => {
                refCallButton.current.removeEventListener("click", toggle)
            }
        }
    }, [])

    const toggle = (ev) => {
        ev.preventDefault()
        ev.stopPropagation()

        if (!CredentialUtils.getOmiCallEnabled() && !CredentialUtils.getOmiCallRenewing()) {
            RouteUtils.redirectWithoutReload(props, NAV_PATH.callCenter.PATH_CALL_CENTER_INTRO)
        }

        setStCallModal(modal => !modal)
    }

    const createOrUpdateCallHistory = (call) => {
        if (!refCallHistoryId.current && refIsLoading.current) {
            callStopped()

            return
        }

        const {callId, toNumber, toName, toID, type, state, startTime, duration, endTime} = call

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
                    callStopped()
                } else {
                    refCallHistoryId.current = result.id
                }
            })
            .catch(() => GSToast.commonError())
            .finally(() => refIsLoading.current = false)
    }

    const callStopped = () => {
        setStResetModal(reset => !reset)
        onCallDisconnected()

        if (isAutoCall) {
            setStCallModal(false)
        } else {
            handleContact(refCallHistoryId.current)
        }

        refCallHistoryId.current = null
    }

    const handleContact = (callHistoryId) => {
        if (!callHistoryId) {
            return
        }

        setStCallHistoryId(callHistoryId)

        beehiveService.getCustomerListByPhone(0, 100000, stToNumber)
            .then(({data}) => {
                if (data.length) {
                    if (data.length > 1 || !stToId) {
                        setStContacts(data)
                        setStToggleAssignContact(true)
                    }
                } else {
                    setStToggleAddContact(true)
                }
            })
    }

    const getOmiToastMessage = () => {
        if (CredentialUtils.getOmiCallRenewing()) {
            return
        }
        if (CredentialUtils.getOmiCallExpired()) {
            return 'page.callcenter.intro.connect.expiredCCHint'
        }
        if (!TokenUtils.onlyFreePackage()) {
            return 'page.callcenter.intro.connect.expiredHint'
        }

        return 'page.callcenter.intro.connect.goFreeHint'
    }

    const isDisableCallButton = () => {
        return disabled
            || (CredentialUtils.getOmiCallEnabled() && TokenUtils.onlyFreePackage() && !TokenUtils.isStaff())
            || CredentialUtils.getOmiCallExpired()
            || !CredentialUtils.getOmiCallData()
            || !CredentialUtils.getOmiCallData().sipUser
    }

    return <>
        <GSComponentTooltip message={i18next.t(getOmiToastMessage())}
                            theme={GSTooltip.THEME.DARK}
                            disabled={CredentialUtils.getOmiCallEnabled() && (!TokenUtils.onlyFreePackage() || !TokenUtils.isStaff())}>
            <GSButton
                marginLeft
                success={!revertColor}
                id={"callBtn__" + refUniqueKey.current}
                className={["call-button", revertColor && "call-button--pColor"].join(' ')}
                style={style}
                disabled={isDisableCallButton()}
            >
                <GSImg
                    className={revertColor && "call-button__img"}
                    src={"/assets/images/call_center/phone.svg"}
                    height={20}/>
            </GSButton>
        </GSComponentTooltip>
        <CallCenterModal
            domain={domain}
            username={sipUser}
            password={password}
            isAutoCall={isAutoCall}
            callModal={stCallModal}
            onClose={() => setStCallModal(false)}
            createOrUpdateCallHistory={createOrUpdateCallHistory}
            resetModal={stResetModal}
            {...others}
        />
        <AddContactModal
            isToggle={stToggleAddContact}
            callHistoryId={stCallHistoryId}
            phoneNumber={stToNumber.trim()}
            onCallAssigned={onCallAssigned}
            onClose={() => setStToggleAddContact(false)}
        />
        <CallCustomerInformationModal
            isToggle={stToggleAssignContact}
            contacts={stContacts}
            callHistoryId={stCallHistoryId}
            phoneNumber={stToNumber.trim()}
            onClose={() => setStToggleAssignContact(false)}
            onCreateContact={() => {
                setStToggleAssignContact(false)
                setStToggleAddContact(true)
            }}
            onCallAssigned={onCallAssigned}
        />
    </>
}

CallButton.defaultProps = {
    style: {},
    disabled: false,
    onCallDisconnected: () => {
    },
    onCallAssigned: () => {
    },
}

CallButton.propTypes = {
    toID: number,
    toNumber: string,
    toName: string,
    revertColor: bool,
    isAutoCall: bool,
    style: object,
    disabled: bool,
    onCallDisconnected: func,
    onCallAssigned: func,
}

export default withRouter(CallButton)

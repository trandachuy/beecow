import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'
import {CredentialUtils} from '../../../utils/credential'
import {TokenUtils} from '../../../utils/token'
import Constants from '../../../config/Constant'
import PubSub from 'pubsub-js'

const CallCenterSDK = forwardRef((props, ref) => {

  const [stOmiCallConfig, setStOmiCallConfig] = useState({sipUser: null, domain: null, password: null})
  const [stRegister, setStRegister] = useState({hasRegister: false})
  const omiSDKRef = useRef(window.omiSDK)

  useEffect(() => {
    const isRegister = !!document.querySelectorAll("div[data-cc-core=call-center-core]")[0];
    setStRegister({hasRegister: isRegister})
  },[])

  useEffect(() => {
    //check permission by gosell user
    if(stRegister.hasRegister === false) {
      checkCallCenterPermission();
    }
  }, [stRegister])

    useEffect(() => {
        const { domain, sipUser, password } = stOmiCallConfig

        if (!domain || !sipUser || !password) {
            return
        }
        if (!omiSDKRef.current) {
            omiSDKRef.current = window.omiSDK
        }

        if (omiSDKRef.current.getStatus() !== 'unregistered') {
            return
        }

        if (navigator.mediaDevices.getUserMedia) {
            try {
                //request access microphone
                navigator.mediaDevices.getUserMedia({ audio: true })
            } catch (error) {
                console.log(error)
            }
        }

        const config = getOmiCallConfig()

        omiSDKRef.current.init(config, () => {
            /** Cấu hình >> Tổng đài >> Số nội bộ **/
            const params = {
                domain,
                username: sipUser,
                password
            }

            omiSDKRef.current.register(params)
        })
    }, [stOmiCallConfig])

  useImperativeHandle(ref, () => ({
    stopCall: () => {
        try {
            omiSDKRef.current.stopCall();
        } catch (e) {
            // throw exception when stopped a call already but call stop call again like close popup
            console.log(e)
        }
    },
    rejectCall: () => {
      omiSDKRef.current.rejectCall();
    },
    acceptCall: () => {
      omiSDKRef.current.acceptCall();
    },
    makeCall: (phone) => {
      omiSDKRef.current.makeCall(phone);
    },
    playAudio: () => {
      omiSDKRef.current.playAudio();
    },
    stopAudio: () => {
      omiSDKRef.current.stopAudio();
    },
    getOmiSDK: () => {
      return omiSDKRef.current;
    }
  }));

  const checkCallCenterPermission = () => {
    const activeOmiCall = CredentialUtils.getOmiCallEnabled();
    const freePackage = TokenUtils.onlyFreePackage();
    const hasOmiCallPermision = (activeOmiCall && !freePackage);
    const expiredOmiCall = CredentialUtils.getOmiCallExpired();
    const omiCallUser = CredentialUtils.getOmiCallData();
    console.debug("OmiCall configured: ", {hasOmiCallPermision, freePackage, expiredOmiCall, omiCallUser});

    if (hasOmiCallPermision && !expiredOmiCall && !!omiCallUser && !!omiCallUser.sipUser) {
      setStOmiCallConfig({domain: omiCallUser.domain, sipUser: omiCallUser.sipUser, password: omiCallUser.password});
    }
  }

  const getOmiCallConfig = () => {

    const config = {
        incall_fn: function (data) { //Sự kiện xảy ra khi thay đổi trạng thái trong cuộc gọi
            console.debug('incall_fn', data)
            fnChangeState(data)
        },
        callbacks: {
            register: function (data) { //Sự kiện xảy ra khi ghi danh tổng đài
                console.debug('register', data)
                fnRegister(data)
            },
            accept_fn: function (data) { //Sự kiện xảy ra khi cuộc gọi được chấp nhận
                console.debug('accept_fn', data)
                fnAcceptCall(data)
            },
            accepted: function (data) { //Sự kiện xảy ra khi cuộc gọi được chấp nhận
                console.debug('accept_fn', data)
                fnAcceptCall(data)
            },
            invite: function (data) {  //Sự kiện xảy ra khi có một cuộc gọi tới
                console.debug('invite_fn', data)
                fnInComing(data)
            },
            ping_fn: function (data) { //Kiểm tra tính hiệu cuộc gọi
                console.debug('ping_fn', data)
                fnPing(data)
            },
            incall: function (data) { //Kiểm tra tính hiệu cuộc gọi
                console.debug('ping_fn', data)
                fnPing(data)
            },
            acceptedByOther: function (data) { //Sự kiện xảy ra khi cuộc gọi được chấp nhận ở thiết bị khác
                console.debug('accept_out_fn', data)
                fnOtherAccept(data)
            },
            ended: function (data) {  //Sự kiện xảy ra khi cuộc gọi kết thúc
                console.debug('endcall_fn', data)
                fnEndCall(data)
            }
        }
    }

      return config
  }

  const fnRegister = (data) => {
    PubSub.publish(Constants.SUB_PUB_TOPIC.CALL_CENTER.REGISTER, data);
  }

  const fnChangeState = (data) => {
    PubSub.publish(Constants.SUB_PUB_TOPIC.CALL_CENTER.CHANGE_STATE, data);
  }

  const fnAcceptCall = (data) => {
    PubSub.publish(Constants.SUB_PUB_TOPIC.CALL_CENTER.ACCEPT_CALL, data);
  }

  const fnEndCall = (data) => {
    PubSub.publish(Constants.SUB_PUB_TOPIC.CALL_CENTER.END_CALL, data);
  }

  const fnOtherAccept = (data) => {
    PubSub.publish(Constants.SUB_PUB_TOPIC.CALL_CENTER.OTHER_ACCEPT_CALL, data);
  }

  const fnInComing = (data) => {
    PubSub.publish(Constants.SUB_PUB_TOPIC.CALL_CENTER.INCOMING_CALL, data);
  }

  const fnPing = (data) => {
    PubSub.publish(Constants.SUB_PUB_TOPIC.CALL_CENTER.PING, data);
  }


  return (
    <div data-cc-core="call-center-core" hidden>
    </div>
  )
});

CallCenterSDK.defaultProps = {
}

CallCenterSDK.propTypes = {
}

export default CallCenterSDK


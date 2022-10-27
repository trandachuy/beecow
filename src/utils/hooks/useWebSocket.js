/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import {useRef, useState} from "react";

const logError = msg => console.log('useWebSocket: '+msg)

export const useWebSocket = (wsUrl, reconnectDelay) => {
    const refConnection = useRef(null);
    const [lockedRequest, setLockedRequest] = useState(false);


    const connect = () => {
        return new Promise( (resolve, reject) => {
            if (!refConnection.current && !lockedRequest) {
                setLockedRequest(true)
                let socket = new SockJS(wsUrl);
                let stompClient = Stomp.over(socket);
                stompClient.reconnect_delay = reconnectDelay
                refConnection.current = stompClient
                refConnection.current.connect({}, () => {
                    console.log('WS Connected: ' + wsUrl)
                    setLockedRequest(false)
                    resolve()
                }, e => {
                    refConnection.current = null
                    setLockedRequest(false)
                    reject(e)
                });
            } else {
                reject('Already connected!')
                logError('Already connected!')
            }
        })
    }

    const subscribe = (destination, callback, headers = {}) => {
        if (refConnection.current) {
            refConnection.current.subscribe(destination, (msg) => {
                callback(msg)
            }, headers)
        } else {
            logError('subscribe: Connection not found!')
        }
    }

    const tryDisconnect = (count) => {
        if (count > 5) {
            return
        }
        try {
            refConnection.current.disconnect()
            refConnection.current = null
        } catch (e) {
            logError('retry disconnect ' + count + 1)
            setTimeout(() => {
                tryDisconnect(count + 1)
            }, 5000)
        }
    }

    const disconnect = () => {
        if (refConnection.current) {
            tryDisconnect(0)
        } else {
            logError('disconnect: Connection not found!')
        }
    }

    return [connect, subscribe, disconnect]
}
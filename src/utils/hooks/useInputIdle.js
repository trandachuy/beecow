/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 10/05/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import {useEffect, useRef, useState} from "react";
import {useWindowEventListener} from "./useWindowEventListener";

export const useInputIdle = (timeOutBySecond) => {
    const refTimer = useRef(null);
    const [stLastUpdatedTime, setStLastUpdatedTime] = useState(Date.now());
    const [stIsIdle, setIsIdle] = useState(false);


    const inputEvents = useWindowEventListener(['keydown','mousedown','mousemove'])

    useEffect(() => {
        resetTimer()
        setStLastUpdatedTime(Date.now())
        setIsIdle(false)
    }, [inputEvents]);


    const setResult = () => {
        const current  = Date.now()

        if (current - stLastUpdatedTime > timeOutBySecond * 1000) {
            setIsIdle(true) // still is idle
        } else {
            setIsIdle(false)
        }
    }


    const resetTimer = () => {
        if (refTimer.current) {
            clearTimeout(refTimer.current)
        }
        refTimer.current = setTimeout( setResult, timeOutBySecond * 1000)
    }


    return stIsIdle
}

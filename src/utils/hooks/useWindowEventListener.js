/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/05/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/


const {useEffect} = require("react");
const {useState} = require("react");
export const useWindowEventListener = (eventNames = []) => {
    const [setEvent, setStEvent] = useState({});

    const updateEvent = (eventName, event) => {
        setStEvent(state => ({
            ...state,
            [eventName]: event
        }))
    }

    useEffect(() => {
        // register event to window listener
        for (const eventName of eventNames) {
            window.addEventListener(eventName, (e) => updateEvent(eventName, e));
        }

        return () => {
            for (const eventName of eventNames) {
                window.addEventListener(eventName, (e) => updateEvent(eventName, e));
            }
        };
    }, []);

    return setEvent
}

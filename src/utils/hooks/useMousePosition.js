/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 10/05/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
const {useEffect} = require("react");
const {useState} = require("react");

export const useMousePosition = () => {
    const [stPosition, setStPosition] = useState({x:0, y:0});

    useEffect(() => {
        const setFromEvent = (e) => setStPosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", setFromEvent);

        return () => {
            window.removeEventListener("mousemove", setFromEvent);
        };
    }, []);

    return stPosition
}

import React, {useEffect} from 'react';
import {useLocation} from "react-router-dom";

const DownloadFile = () => {
    const location = useLocation()

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const path = params.get('path')
        window.location.href = path;
    }, [])
    
    return (<></>)
};

export default DownloadFile


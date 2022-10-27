import React, {useEffect, useState} from 'react';
import {withRouter} from "react-router-dom";

const PrintLazadaShippingLabel = props => {
const [stContent, setStContent] = useState()
    useEffect(() => {
        const content = props.location.state ? props.location.state.data : null
        if (content) {
            setStContent(content)
        }
        setTimeout(function () {
            window.print();
        }, 1000);
    }, [])


    return (
        <>
            <div dangerouslySetInnerHTML={{__html: stContent}}/>
        </>
    );
}

export default withRouter (PrintLazadaShippingLabel);
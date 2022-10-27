/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 10/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';

const ComponentOverflowDetector = props => {
    const childrenRef = useRef(null);

    const isOverflow = (e) => {
        return e.offsetHeight < e.scrollHeight || e.offsetWidth < e.scrollWidth;
    }

    useEffect(() => {
        if (childrenRef.current) {
            props.onOverflow(isOverflow(childrenRef.current))
        }
    }, []);


    const {children} = props
    return (
        <>
            {React.Children.map(children, (child, index) =>
                React.cloneElement(child, {
                    ref: childrenRef,
                    key: child.key + index
                })
            )}
        </>
    );
};

ComponentOverflowDetector.propTypes = {
    onOverflow: PropTypes.func,
};

export default ComponentOverflowDetector;

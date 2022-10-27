/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/09/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {UikTabContainer, UikTabItem} from "../../../../@uik";
import {cn} from "../../../../utils/class-name";

const GSTab = props => {
    const [stActiveTab, setStActiveTab] = useState(props.items[0]? props.items[0].value:null);

    const onChange = (value) => {
        setStActiveTab(value)
        if (props.onChangeTab) props.onChangeTab(value)
    }

    useEffect(() => {
        setStActiveTab(props.active)
    }, [props.active]);


    const {items, defaultActive, onChangeTab, itemMaxWidth,...other} = props
    return (
        <UikTabContainer {...other}>
            {
                props.items.map((item, index) => {
                    return (
                        <UikTabItem active={item.value === stActiveTab}
                                onClick={() => onChange(item.value)}
                                className = {cn({
                                    'gs-atm--disable': item.disabled,
                                }, {
                                    [props.className]: !!props.className
                                })}
                                    extra={item.extra? item.extra:null}
                                    key={index}
                                    style={{
                                        flex: props.itemMaxWidth? 1:undefined
                                    }}
                        >
                            {item.title}
                        </UikTabItem>
                    )
                })
            }
        </UikTabContainer>
    );
};

export const createItem = (title, value, extra = null, disabled = false) => {
    return  {
        title,value,disabled,extra
    }
}
GSTab.propTypes = {
    items: PropTypes.array,
    onChangeTab: PropTypes.func,
    itemMaxWidth: PropTypes.bool,
    active: PropTypes.string,
    className: PropTypes.string,
};

export default GSTab;

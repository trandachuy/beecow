/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/04/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import './GSMegaFilterRow.sass'
import {GSMegaFilterContext} from "../GSMegaFilterContext";
import i18next from "i18next";
import GSMegaFilter from '../GSMegaFilter'
import { SIZE } from '../GSMegaFilterConstant'

const GSMegaFilterRow = props => {
    const {state, dispatch} = useContext(GSMegaFilterContext.context);
    const [stValue, setStValue] = useState(state[props.name]? state[props.name].value:'');

    const onChangeFilter = (value) => {
        dispatch(GSMegaFilterContext.actions.setFilterValue(props.name, value, props.ignoreCountValue))
        if (props.onChange) {
            props.onChange(value)
        }
    }

    useEffect(() => {
        // register
        onChangeFilter(props.defaultValue || '')
    }, []);

    useEffect(() => {
        // must binding to state to re-render
        if (state[props.name]) {
            setStValue(state[props.name].value)
        }
    }, [state[props.name]]);

    const getClassName = (position) => {
        switch (position) {
            case 'left':
                switch (props.size) {
                    case SIZE.SMALL:
                        return 'col-md-3 px-md-3'
                    case SIZE.MEDIUM:
                        return 'col-md-4 px-md-4'
                    case SIZE.LARGE:
                        return 'col-md-5 px-md-5'
                }
            case 'right':
                switch (props.size) {
                    case SIZE.SMALL:
                        return 'col-md-9 px-md-3'
                    case SIZE.MEDIUM:
                        return 'col-md-8 px-md-4'
                    case SIZE.LARGE:
                        return 'col-md-7 px-md-5'
                }
        }
    }

    return (
        <div className="row gs-mega-filter-row">
            <div className={[
                "col-12 filter-title px-0",
                getClassName('left')
            ].join(' ')}>
                {props.i18Key ? i18next.t(props.i18Key) : props.title}
            </div>
            <div className={[
                "col-12 px-0",
                getClassName('right')
            ].join(' ')}>
                {props.children(onChangeFilter, stValue)}
            </div>

        </div>
    );
};

GSMegaFilterRow.defaultProps = {
    size: SIZE.MEDIUM
}

GSMegaFilterRow.propTypes = {
    title: PropTypes.string,
    i18Key: PropTypes.string,
    name: PropTypes.string.isRequired,
    defaultValue: PropTypes.any,
    ignoreCountValue: PropTypes.any,
    onChange: PropTypes.func,
    size: PropTypes.oneOf(Object.values(SIZE))
};

export default GSMegaFilterRow;

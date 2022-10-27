/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/04/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import './GSMegaFilterRowSelect.sass'
import React from 'react';
import PropTypes from 'prop-types';
import GSMegaFilterRow from "./GSMegaFilterRow";
import {UikSelect} from "../../../../@uik";

const GSMegaFilterRowSelect = props => {

    const {options, ...rest} = props
    return (
        <GSMegaFilterRow {...rest}>
            { (onChangeFilter, value) =>
                <>
                    <UikSelect
                        value={[{value}]}
                        options={props.options}
                        onChange={(item) => onChangeFilter(item.value)}
                        position={"bottomRight"}
                        className="d-none d-md-inline-block gs-mega-filter-row-select"
                    />
                    <div className="d-block d-md-none">
                        <select value={value}
                                className="form-control"
                                onChange={event => onChangeFilter(event.currentTarget.value)}
                        >
                            {props.options.map(option =>
                                <option key={`${props.name}-${option.value}`} value={option.value}>{option.label}</option>
                            )}
                        </select>
                    </div>
                </>

            }
        </GSMegaFilterRow>
    );
};

GSMegaFilterRowSelect.propTypes = {
    title: PropTypes.string,
    i18Key: PropTypes.string,
    name: PropTypes.string.isRequired,
    defaultValue: PropTypes.any,
    ignoreCountValue: PropTypes.any,
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.any,
        label: PropTypes.any,
    }).isRequired,),
    onChange: PropTypes.func,
};

export default GSMegaFilterRowSelect;

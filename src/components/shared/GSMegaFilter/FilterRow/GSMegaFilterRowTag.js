/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/04/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import GSMegaFilterRow from "./GSMegaFilterRow";
import {UikFormInputGroup, UikRadio} from "../../../../@uik";
import {cn} from "../../../../utils/class-name";

const GSMegaFilterRowTag = props => {
    const {options, ...rest} = props
    return (
        <GSMegaFilterRow {...rest}>
                { (onChangeFilter, value) => (
                    <>
                        <div className="d-md-flex d-none flex-wrap">
                            {
                                options.map(v => {
                                    return (
                                        <div key={v.value}
                                             className={cn("filter-option",
                                                 {"selected": value === v.value})}
                                             onClick={() => onChangeFilter(v.value)}>
                                            {v.label}
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="d-md-none d-block">
                            <UikFormInputGroup key={value}>
                                {options.map(option => {
                                    return (
                                        <UikRadio
                                            defaultChecked={option.value === value}
                                            key={option.value}
                                            value={option.value}
                                            label={option.label}
                                            name={props.name}
                                            onClick={() => onChangeFilter(option.value)}
                                        />
                                    )
                                })}
                            </UikFormInputGroup>
                        </div>
                    </>

                )
                }
        </GSMegaFilterRow>
    );
};

GSMegaFilterRowTag.propTypes = {
    title: PropTypes.string,
    i18Key: PropTypes.string,
    name: PropTypes.string.isRequired,
    defaultValue: PropTypes.any,
    ignoreCountValue: PropTypes.any,
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.any,
        label: PropTypes.any,
    }).isRequired,),
};

export default GSMegaFilterRowTag;

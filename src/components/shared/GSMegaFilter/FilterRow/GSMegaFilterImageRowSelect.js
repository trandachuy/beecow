/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/04/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import './GSMegaFilterImageRowSelect.sass'
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import GSMegaFilterRow from "./GSMegaFilterRow";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";

const GSMegaFilterImageRowSelect = props => {

    const [stToggle, setStToggle] = useState(false);

    const {options, ...rest} = props

    const handleToggle = () => {
        setStToggle(toggle => !toggle)
    }
    
    return (
        <GSMegaFilterRow {...rest}>
            { (onChangeFilter, value) =>
                <>
                    <Dropdown className="page-selector"
                              isOpen={stToggle} 
                              toggle={handleToggle}
                    >
                        <DropdownToggle
                            className={["page-selector__button"].join(' ')} caret>
                            <span className='page-selector__button__label d-flex align-items-center'>
                                {props.options?.find(option => option.value === value)?.avatar &&
                                    <img src={props.options.find(option => option.value === value).avatar} width="30" height="30"/>   
                                }
                                {props.options?.find(option => option.value === value)?.label}
                                
                            </span>
                        </DropdownToggle>
                        <DropdownMenu className='page-selector__dropdown'>
                            {
                                props.options.map((item, index) => (
                                    <DropdownItem
                                        className='collection-selector__dropdown__item line-clamp-2'
                                        key={index}
                                        onClick={() => onChangeFilter(item.value)}
                                    >
                                        {item?.avatar && <img src={item.avatar} width="30" height="30"/>}
                                        {item.label}
                                    </DropdownItem>
                                ))
                            }
                        </DropdownMenu>
                    </Dropdown>
                    
                    {/*<div className="d-block d-md-none">*/}
                    {/*    <select value={value}*/}
                    {/*            className="form-control"*/}
                    {/*            onChange={event => onChangeFilter(event.currentTarget.value)}*/}
                    {/*    >*/}
                    {/*        {props.options.map(option =>*/}
                    {/*            <option key={`${props.name}-${option.value}`} value={option.value}>{option.label}</option>*/}
                    {/*        )}*/}
                    {/*    </select>*/}
                    {/*</div>*/}
                </>

            }
        </GSMegaFilterRow>
    );
};

GSMegaFilterImageRowSelect.propTypes = {
    title: PropTypes.string,
    i18Key: PropTypes.string,
    name: PropTypes.string.isRequired,
    defaultValue: PropTypes.any,
    ignoreCountValue: PropTypes.any,
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.any,
        label: PropTypes.any,
        avatar: PropTypes.string
    }).isRequired,),
    onChange: PropTypes.func,
};

export default GSMegaFilterImageRowSelect;

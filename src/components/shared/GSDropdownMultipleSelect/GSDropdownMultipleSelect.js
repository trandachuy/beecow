/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/11/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/


import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import './GSDropdownMultipleSelect.sass'
import GSDropDownButton, {GSDropdownItem} from "../GSButton/DropDown/GSDropdownButton";
import {UikCheckbox, UikSelect} from "../../../@uik";
import i18next from "i18next";
import {cn} from "../../../utils/class-name";

const GSDropdownMultipleSelect = props => {

    const [stSelectedList, setStSelectedList] = useState(props.selected);


    useEffect(() => {
        if (props.onChange) {
            props.onChange(stSelectedList)
        }
    }, [stSelectedList])


    const onChecked = (e, {label, value}) => {
        const checked = e.currentTarget.checked
        if (checked) {
            setStSelectedList(state => [...state, value])
        } else {
            const selectedList = stSelectedList.filter(it => it !== value)
            setStSelectedList(selectedList)
        }
    }

    const onCheckedAll = (e) => {
        const checked = e.currentTarget.checked
        if (checked) {
            setStSelectedList(props.items.map(it => it.value))
        } else {
            setStSelectedList([])
        }
    }

    return (
        <>
            <GSDropDownButton className={cn("gs-dropdown-multiple-select", props.className)}
                              position={props.position}
                              button={({onClick}) => {
                return (
                <div onClick={e => {
                    e.preventDefault()
                    onClick(e)
                }}>
                    <UikSelect
                        className="gs-dropdown-multiple-select__drop-header"
                        options={[
                            {
                                label: <>
                                    {stSelectedList.length === props.items.length ?
                                        i18next.t(props.headerSelectedAllText, {
                                            selected: stSelectedList.length
                                        }) :
                                        i18next.t(props.headerSelectedI18Text, {
                                                selected: stSelectedList.length
                                            })
                                    }
                                        </>
                                ,
                                value: 0
                            }
                        ]}
                        defaultValue={0}
                        position={props.position}
                    >

                    </UikSelect>
                </div>
                )}} >
                {props.allowSelectedAll &&
                <GSDropdownItem className="d-flex align-items-center" key={-1}>
                    <UikCheckbox
                        checked={stSelectedList.length === props.items.length}
                        className="m-0 p-0"
                        label={i18next.t(props.selectedAllText || 'common.btn.selectAll')}
                        value={-1}
                        onChange={onCheckedAll}
                    />
                </GSDropdownItem>}
                {props.items.map(item => {

                    return (
                        <GSDropdownItem className="d-flex align-items-center" key={item.value}>
                            <UikCheckbox
                                checked={stSelectedList.find(it => it == item.value)}
                                className="m-0 p-0"
                                label={<span className="gs-dropdown-multiple-select__opt-label">{item.label}</span>}
                                value={item.value}
                                onChange={(e) => onChecked(e, item)}
                                key={item.value + '-' + stSelectedList.find(it => it == item.value)}
                            />
                        </GSDropdownItem>
                    )
                })
                }
            </GSDropDownButton>
        </>
    );
};

GSDropdownMultipleSelect.defaultProps = {
    item: [],
    selected: [],
    allowSelectedAll: true,
    headerSelectedI18Text: 'common.selected',
    headerSelectedAllText: 'common.selected',
    selectedAllText: 'common.btn.selectAll',
    position: 'bottomRight'
}

GSDropdownMultipleSelect.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.any
    }),),
    selected: PropTypes.array,
    onChange: PropTypes.func,
    selectedAllText: PropTypes.string,
    allowSelectedAll: PropTypes.bool,
    headerSelectedAllText: PropTypes.string,
    headerSelectedI18Text: PropTypes.string,
    position: PropTypes.string,
};

export default GSDropdownMultipleSelect;

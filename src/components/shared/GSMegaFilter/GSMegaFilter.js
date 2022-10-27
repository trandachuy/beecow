/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/04/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useReducer, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import GSTrans from "../GSTrans/GSTrans";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import './GSMegaFilter.sass';
import GSButton from "../GSButton/GSButton";
import GSModalFullBodyMobile from "../GSModalFullBodyMobile/GSModalFullBodyMobile";
import i18next from "i18next";
import {GSMegaFilterContext} from "./GSMegaFilterContext";
import {cn} from "../../../utils/class-name";
import { SIZE } from './GSMegaFilterConstant'

const GSMegaFilter = props => {
    const [state, dispatch] = useReducer(GSMegaFilterContext.reducer, GSMegaFilterContext.initState);

    const [stFilterCount, setStFilterCount] = useState(0);
    const [stShowFilter, setStShowFilter] = useState(props.isShow);
    
    const refIsDesktop = useRef(window.screen.width >= 768);

    useEffect(() => {
        setStFilterCount(countFilter())
    }, [state]);

    useEffect(() => {
        if (props.isCountNumber){
            setStShowFilter(props.isShow)
            setStFilterCount(props.countNumber)   
        }
    }, [props.isShow]);


    const toggleFilterModal = () => {
        const isOpen = !stShowFilter;
        setStShowFilter(isOpen);
    }

    const countFilter = () => {
        let count = 0
        for (let filterName in state) {
            const {value, ignoreCount} = state[filterName]

            if (value !== ignoreCount) {
                count++
            }
        }
        return count
    }

    const onSubmitFilter = () => {
        toggleFilterModal();
        let result = {}

        for (let filterName in state) {
            const {value, ignoreCount} = state[filterName]

            result = {
                ...result,
                [filterName]: value
            }
        }

        if(props.onSubmit) {
            props.onSubmit(result);
        }
    }


    return (
        <GSMegaFilterContext.provider value={{state, dispatch}}>
            <div className={cn("mega-filter-container", `size-${props.size}`)}>
                <div className="position-relative mega-filter-container_around">
                    {props.displayFilterAction &&
                    <div className="btn-filter-action" onClick={toggleFilterModal}>
                        <span>
                          <GSTrans t="component.gsMegaFilter.filter.header.title" values={{countNumber: props.isCountNumber ? props.countNumber : stFilterCount}}>
                              <span></span>
                          </GSTrans>
                        </span>
                        <FontAwesomeIcon size="xs" color="gray" className="icon-filter" icon="filter"/>
                    </div>
                    }

                    {stShowFilter &&
                    <>
                        {/* DISPLAY ON DESKTOP */}
                        {
                            refIsDesktop.current && <div className="dropdown-menu dropdown-menu-right d-desktop-block d-mobile-none"
                                 style={{top: '40px'}}
                            >
                                {React.Children.map(props.children, c => React.cloneElement(c, {size: props.size}))}
                                {/*SUBMIT*/}
                                <div className="row">
                                    <div className="col-12">
                                        <GSButton success size={"small"} onClick={onSubmitFilter}>
                                            <GSTrans t={"common.btn.done"}/>
                                        </GSButton>
                                    </div>
                                </div>
                            </div>
                        }

                        {/* DISPLAY ON MOBILE */}
                        {
                            !refIsDesktop.current && <div className="mega-filter-container_mobile_panel d-mobile-flex d-desktop-none">
                                <GSModalFullBodyMobile title={i18next.t("productList.filter.header.title")}
                                                       rightEl={
                                                           <GSButton success onClick={onSubmitFilter}>
                                                               <GSTrans t={"common.btn.done"}/>
                                                           </GSButton>
                                                       }>
                                    <div className="filter-modal-wrapper">
                                        {props.children}
                                    </div>
                                </GSModalFullBodyMobile>
                            </div>
                        }
                    </>}
                </div>
            </div>
        </GSMegaFilterContext.provider>
    );
};

GSMegaFilter.defaultProps = {
    isShow: false,
    displayFilterAction: true,
    size: SIZE.MEDIUM,
    isCountNumber: false
}

GSMegaFilter.propTypes = {
    isShow: PropTypes.bool,
    displayFilterAction: PropTypes.bool,
    onSubmit: PropTypes.func,
    size: PropTypes.oneOf(Object.values(SIZE)),
    countNumber: PropTypes.number,
    isCountNumber: PropTypes.bool
};

export default GSMegaFilter;

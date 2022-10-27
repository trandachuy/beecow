
import React, {useEffect, useReducer, useState} from 'react';
import PropTypes from 'prop-types';
import GSTrans from "../GSTrans/GSTrans";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import './GSMegaFilter.sass';
import GSButton from "../GSButton/GSButton";
import GSModalFullBodyMobile from "../GSModalFullBodyMobile/GSModalFullBodyMobile";
import i18next from "i18next";
import {GSMegaFilterContext} from "./GSMegaFilterContext";
import {cn} from "../../../utils/class-name";

const GSMegaMobileFilter = props => {
    const [state, dispatch] = useReducer(GSMegaFilterContext.reducer, GSMegaFilterContext.initState);

    const [stFilterCount, setStFilterCount] = useState(0);
    const [stShowFilter, setStShowFilter] = useState(props.isShow);

    useEffect(() => {
        setStFilterCount(countFilter())
    }, [state]);


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
            <div className={cn("", `size-${props.size}`)}>
                <div className="position-relative mega-filter-container_around">
                    {props.displayFilterAction &&
                    <div className="btn-filter-action" onClick={toggleFilterModal} style={{paddingTop: '7px'}}>
                        <img src="/assets/images/mobile-filter.svg"/>
                    </div>
                    }

                    {stShowFilter &&
                    <>
                        {/* DISPLAY ON DESKTOP */}
                        <div className="dropdown-menu dropdown-menu-right d-desktop-block d-mobile-none"
                             style={{top: '40px'}}
                        >
                            {props.children}
                            {/*SUBMIT*/}
                            <div className="row">
                                <div className="col-12">
                                    <GSButton success size={"small"} onClick={onSubmitFilter}>
                                        <GSTrans t={"common.btn.done"}/>
                                    </GSButton>
                                </div>
                            </div>
                        </div>

                        {/* DISPLAY ON MOBILE */}
                        <div className="mega-filter-container_mobile_panel d-mobile-flex d-desktop-none">
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
                    </>}
                </div>
            </div>
        </GSMegaFilterContext.provider>
    );
};

GSMegaMobileFilter.defaultProps = {
    isShow: false,
    displayFilterAction: true,
    size: 'medium'
}

GSMegaMobileFilter.propTypes = {
    isShow: PropTypes.bool,
    displayFilterAction: PropTypes.bool,
    onSubmit: PropTypes.func,
    size: PropTypes.oneOf(['small','medium','large'])
};

export default GSMegaMobileFilter;

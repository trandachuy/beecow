import './FilterRowSelectSegment.sass'
import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import GSMegaFilterRow from "./../GSMegaFilterRow";
import {UikInput, UikSelect} from "../../../../../@uik";
import GSTrans from "../../../GSTrans/GSTrans";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import i18next from "i18next";
import Loading, {LoadingStyle} from "../../../Loading/Loading";
import beehiveService from "../../../../../services/BeehiveService";
const SEGMENT_SIZE_PER_PAGE = 20

const FilterRowSelectSegment = props => {
    const onSearch = useRef(false);
    
    const [stSegmentList, setStSegmentList] = useState([]);
    const [stSegmentPaging, setStSegmentPaging] = useState({
        currentPage: 0,
        totalPage: 0,
        isLoading: false
    });
    const [stSegmentFilter, setStSegmentFilter] = useState({
        keyword: ''
    });
    const [stIsShowSegmentModal, setStIsShowSegmentModal] = useState(false);
    const {options, ...rest} = props


    useEffect( () => {
        const params = {
            page: stSegmentPaging.currentPage,
            size: SEGMENT_SIZE_PER_PAGE,
            ['name.contains']: stSegmentFilter.keyword,
        }
        beehiveService.getListSegmentWithKeyword(params)
            .then(result => {
                if (onSearch.current) {
                    if (stSegmentFilter.keyword  === '') {
                        onSearch.current = false
                    }
                    if (stSegmentPaging.currentPage === 0) { // => if this is first page -> clear all previous list
                        setStSegmentList(result.data.map(s => ({
                            value: s.id,
                            label: s.name
                        })))
                    } else { // => if this is not first page -> append to previous list
                        setStSegmentList([...stSegmentList, ...result.data.map(s => ({
                            value: s.id,
                            label: s.name
                        }))])
                    }
                } else {
                    setStSegmentList([...stSegmentList, ...result.data.map(s => ({
                        value: s.id,
                        label: s.name
                    }))])
                }

                setStSegmentPaging({
                    ...stSegmentPaging,
                    isLoading: false,
                    totalPage: Math.ceil(parseInt(result.headers['x-total-count']) / SEGMENT_SIZE_PER_PAGE)
                })
            })
    }, [stSegmentPaging.currentPage, stSegmentFilter])

    const onKeyPressSegmentSearch = (e) => {
        if (e.key === 'Enter') {
            onSearch.current = true

            setStSegmentPaging({
                ...stSegmentPaging,
                currentPage: 0
            })
            setStSegmentFilter({
                keyword: e.currentTarget.value
            })
            e.preventDefault()
        }
    }

    const onSelectSegment = () => {
        setStIsShowSegmentModal(false)
        onSearch.current = true
        setStSegmentPaging({
            ...stSegmentPaging,
            currentPage: 0
        })
        setStSegmentFilter({
            keyword: ''
        })
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const onScrollSegmentList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && stSegmentPaging.currentPage < stSegmentPaging.totalPage) {
            setStSegmentPaging({
                ...stSegmentPaging,
                isLoading: true,
                currentPage: stSegmentPaging.currentPage + 1
            })
        }
    }
    
    return (
        <GSMegaFilterRow {...rest}>
            { (onChangeFilter, value) => {
                return(<>
                    <div className="dropdown filter-segments-dropdown-wrapper" key={value}>
                        <div className="uik-select__wrapper"
                             onClick={e => {
                                 e.preventDefault()
                             }}
                             id="dropdownSegmentsButton"
                             data-toggle="dropdown"
                             aria-haspopup="true"
                             aria-expanded="false">
                            <button className="btn-segments uik-btn__base uik-select__valueRendered">
                                        <span className="uik-btn__content">
                                            <div className="uik-select__valueRenderedWrapper">
                                                <div className="uik-select__valueWrapper">
                                                    {stSegmentList.length === 0 && <GSTrans t={"page.customer.segment.noSegment"}/>}
                                                    {!(typeof value === 'object') && stSegmentList.length !== 0 && <GSTrans t={"page.customer.segment.allSegments"}/>}
                                                    {value && (typeof value === 'object') && value.label}
                                                </div>
                                                <div className="uik-select__arrowWrapper"/>
                                            </div>
                                        </span>
                            </button>
                        </div>
                        <div className="dropdown-menu dropdown-menu-right filter-segments-dropdown" aria-labelledby="dropdownSegmentsButton">
                            <div className="segments-search">
                                <UikInput
                                    onKeyPress={onKeyPressSegmentSearch}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18next.t("page.customers.segments.list.searchByName")}
                                />
                            </div>
                            <hr/>
                            <div className="segments-item-list" onScroll={onScrollSegmentList}>
                                {stSegmentList.length === 0 &&
                                <div className="found-result">
                                    {stSegmentFilter.keyword ? i18next.t("common.noResultFound"):i18next.t("page.customer.segment.haveNoSegment")}
                                </div>
                                }
                                {/*CURRENT SEGMENT*/}
                                {stSegmentList.length > 0 && value !== 'ALL' &&
                                <div
                                    className="segments-item-row"
                                    onClick={() => {
                                        onSelectSegment()
                                        onChangeFilter(value)
                                    }}
                                >
                                    {value.label}
                                    <div className="select__check"/>
                                </div>
                                }


                                {/*ALL SEGMENT*/}
                                {stSegmentList.length > 0 &&
                                <div
                                    className="segments-item-row"
                                    onClick={() => {
                                        onSelectSegment()
                                        onChangeFilter('ALL')
                                    }}
                                >
                                    <GSTrans t={"page.customer.segment.allSegments"} />
                                    {!(typeof value === 'object') && <div className="select__check"/>}
                                </div>
                                }
                                {/*LIST*/}
                                {stSegmentList.map(segment => {
                                    if (value && value.value === segment.value) return null
                                    return (
                                        <div key={segment.value}
                                             className="segments-item-row"
                                             onClick={() => {
                                                 onSelectSegment()
                                                 onChangeFilter(segment)
                                             }}
                                        >
                                            {segment.label}
                                        </div>
                                    )
                                })}
                                {stSegmentPaging.isLoading &&
                                <div className="segments-item-row loading-row">
                                    <Loading style={LoadingStyle.ELLIPSIS_GREY}/>
                                </div>
                                }
                            </div>
                        </div>
                    </div>







                    {/*<UikSelect*/}
                    {/*    value={[{value}]}*/}
                    {/*    options={props.options}*/}
                    {/*    onChange={(item) => onChangeFilter(item.value)}*/}
                    {/*    position={"bottomRight"}*/}
                    {/*    className="d-none d-md-inline-block gs-mega-filter-row-select"*/}
                    {/*/>*/}
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
                </>)
            }}
        </GSMegaFilterRow>
    );
};

FilterRowSelectSegment.propTypes = {
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

export default FilterRowSelectSegment;

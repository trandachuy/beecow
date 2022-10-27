import React, {useEffect, useRef, useState} from 'react'
import i18next from "i18next";
import './DropdownMultiSelect.sass'
import PropTypes from 'prop-types';
import beehiveService from "@services/BeehiveService";
import _ from 'lodash';

const SIZE_PER_PAGE = 50

const DropdownMultiSelect = (props) => {
    const refOutsideClick = useRef(null)
    const [stSelectedSegment, setStSelectedSegment]= useState([props.segmentIds]);
    const [stListChecked, setStListChecked] = useState(['ALL']);
    const [closedExpanded, setClosedExpanded] = useState(true);
    const [stListSegment, setStListSegment] = useState([{id:"ALL", name: i18next.t('component.navigation.customers.allCustomers')}]);
    const [stSegmentPaging, setStSegmentPaging] = useState({
        currentPage: 0,
        totalPage: 0,
        totalCount: 0,
        isLoading: false
    });
    const [stSegmentFilter, setStSegmentFilter] = useState({
        keyword: ''
    });
    const [isFetching, setIsFetching] = useState(false)
    const onSearch = useRef(false);

    const fetchCustomerSegmentList = (page = 0, keyword = '') => {
        let getParams = {
            page: page,
            size: SIZE_PER_PAGE,
            ['name.contains']: keyword,
        }
        setIsFetching(true)
        beehiveService.getListSegmentWithKeyword(getParams)
        .then(result => {
            if (keyword  === '') {
                onSearch.current = false
            }
            if (page === 0) { // => if this is first page -> clear all previous list
                setStListSegment([{id: 'ALL', name: 'All Customer'}, ...result.data])
            } else { // => if this is not first page -> append to previous list
                setStListSegment([...stListSegment, ...result.data])
            }

            setStSegmentPaging({
                ...stSegmentPaging,
                isLoading: false,
                totalPage: Math.ceil(parseInt(result.headers['x-total-count']) / SIZE_PER_PAGE),
                totalCount: parseInt(result.headers['x-total-count'])
            })
            setIsFetching(false)
        })
        .catch((e) => {
            console.log(e)
        })
    }

    const handleGetPage = (page) => {
        if(page < stSegmentPaging.totalPage){
            setStSegmentPaging({
                ...stSegmentPaging,
                currentPage: page
            })
            fetchCustomerSegmentList(page, '')
        }
    }

    const handleGetValueSearch = (value) =>{
        setStSegmentFilter({
            ...stSegmentFilter,
            keyword: value
        })
        setStSegmentPaging({
            ...stSegmentPaging,
            currentPage: 0
        })
        fetchCustomerSegmentList(0, value)
    }

    useEffect(()=>{
        if(props.listDataChecked){
            let data = []
            let getList = props.listDataChecked.split(',')
            if(props.listDataChecked === 'ALL'){
                setStListChecked(['ALL'])
            }else{
                if(getList){
                    getList = getList.filter(clear => clear !== 'ALL')
                    for(const value of getList){
                        if(value !== '') data.push(parseInt(value))
                    }
                    setStListChecked(data)
                }
            }
        }

    },[])

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const scrollProductList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom) {
            handleGetPage(stSegmentPaging.currentPage + 1)
        }
    }

    const handleChecked = (e, segmentId) => {
        //let listChecked = [...stListChecked]
        const id = e.target.name === 'ALL' ? 'ALL' : +(e.target.name)
        if (e.target.checked){
            if(e.target.name === 'ALL'){
                setStSelectedSegment(['ALL'])
                setStListChecked(['ALL'])
                return;
            }else {
                setStListChecked(lc=>{
                    return [...lc, id].filter(clearAll => clearAll !== 'ALL')
                })
                return;
            }
        }else {
            let listChecked = _.cloneDeep(stListChecked)
            let filter = listChecked.filter(item => item !== id)
            if(filter.length === 0){
                setStListChecked(['ALL'])
            }else{
                setStListChecked(lc=>{
                    return lc.filter(item => item !== id)
                })
            }
        }
        // props.setData(listChecked)
    }

    const onKeyPressSearch = (e) => {
        if (e.key === 'Enter') {
            handleGetValueSearch(e.target.value)
            e.preventDefault()
        }
    }

    const useOutsideClick = (ref, callback) => {
        const handleClick = e => {
            if (ref.current && !ref.current.contains(e.target)) {
                callback();
            }
        };

        useEffect(() => {
            document.addEventListener("click", handleClick);

            return () => {
                document.removeEventListener("click", handleClick);
            };
        });
    };

    useOutsideClick(refOutsideClick, () => {
        if(!closedExpanded){
            props.onClose(stListChecked?stListChecked: null)
            setClosedExpanded(true)
        }
    });

    const handleDropdownList = () => {
        setClosedExpanded(state => !state)
        props.onClose(stListChecked?stListChecked: null)
        fetchCustomerSegmentList(0, '')
    }

    return (
        <div className="dropdown-search-checkbox-custom">
            <div className={!closedExpanded? `select-customer-options z-index-999 ${props.className} `:`select-customer-options ${props.className}`}>
                <div className="options-checked"
                    onClick={() => handleDropdownList()}
                >
                    {stListChecked.filter(clearAll => clearAll !== 'ALL').length
                        ?
                        <span>
                            {i18next.t('component.wholesalePrice.selected.customer.segment',{x:stListChecked.length})}
                        </span>

                        : (props.id && !props.segmentIds)? <span className="text-danger">{i18next.t('component.wholesalePrice.selected.customer.segment',{x:0})}</span>: i18next.t('component.navigation.customers.allCustomers')
                    }
                </div>
                {!closedExpanded && (
                    <div className="options-rate border-gray-200 border border-solid"
                        ref={refOutsideClick}
                    >
                        <>
                            <div className="search-box">
                                <input type="text"
                                    placeholder="Search Customers"
                                    onKeyPress={onKeyPressSearch}
                                />
                            </div>
                            <div className={'label-list gs-atm__scrollbar-1'} onScroll={(e) => scrollProductList(e)} >
                                {
                                    stListSegment.map((item, index) => {
                                        return(
                                            <div key={index} className="label">
                                                <input
                                                    key={item}
                                                    checked={stListChecked.includes(item.id)?true:false}
                                                    id={item.id?item.id:item.index}
                                                    type="checkbox"
                                                    name={item.id?item.id:item.index}
                                                    value={item.id?item.id:item.index}
                                                    onChange={(e) => handleChecked(e, item.id)}
                                                    className="m-2 cursor-pointer"
                                                />

                                                <label htmlFor={item.id}
                                                    className="block m-0">
                                                    {item.name}
                                                </label>
                                            </div>
                                        )
                                    })
                                }
                                {isFetching && stListSegment.length < 2 &&  (
                                    <div className='d-flex justify-content-center align-items-center p-2'>
                                        <div className="spinner-border spinner-border-sm text-center" role="status" />
                                    </div>
                                )}
                            </div>
                        </>

                    </div>
                )}
            </div>

        </div>
    )
}
DropdownMultiSelect.propTypes = {
    listDataCheckbox: PropTypes.array,
    setPage:PropTypes.func,
    page:PropTypes.number,
    setData:PropTypes.func,
    setValueSearch:PropTypes.func,
    listDataChecked:PropTypes.string
}
export default DropdownMultiSelect;

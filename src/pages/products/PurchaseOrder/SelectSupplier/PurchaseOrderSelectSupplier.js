import './PurchaseOrderSelectSuppler.sass'
import React, {useEffect, useRef, useState} from 'react'

import i18next from "i18next";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {ItemService} from "../../../../services/ItemService";
import GSSearchInput from "../../../../components/shared/GSSearchInput/GSSearchInput";
import Loading from "../../../../components/shared/Loading/Loading";
import useDebounceEffect from "../../../../utils/hooks/useDebounceEffect";
import {GSToast} from "../../../../utils/gs-toast";
import GSImg from "../../../../components/shared/GSImg/GSImg";
import {bool, func, object, oneOf, string} from "prop-types";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";


const PurchaseOrderSelectSupplier = props => {
    const {supplier, disabled} = props

    const SEARCH_PAGE_SIZE = 20
    const [stSupplierFilter, setStSupplierFilter] = useState({
        page: 0,
        size: SEARCH_PAGE_SIZE,
        total: 0,
        isScroll: false,
        sort: 'name,asc'
    })
    const [stFilter, setStFilter] = useState({
        page: 0,
        size: SEARCH_PAGE_SIZE,
        total: 0,
        isScroll: false
    })
    const [stIsSupplierSearching, setStIsSupplierSearching] = useState(false)
    const [stSupplierSearchResult, setStSupplierSearchResult] = useState()
    const [stSelectedSupplier, setStSelectedSupplier] = useState()
    const [stHideSupplierSearchBox, setStHideSupplierSearchBox] = useState(true)

    const refSearchSupplierInput = useRef()
    const refIsSupplierScrolled = useRef(false)

    useEffect(() => {
        if (!supplier) {
            return
        }

        setStSelectedSupplier(supplier)
    }, [supplier])

    useEffect(() => {
        setStHideSupplierSearchBox(stSelectedSupplier || disabled)
    }, [stSelectedSupplier, disabled])

    useDebounceEffect(() => {
        if (disabled) {
            return
        }

        setStIsSupplierSearching(true)

        const {page, size, keyword, isScroll, sort} = stSupplierFilter

        if (!isScroll) {
            setStSupplierSearchResult()
        }

        ItemService.searchSupplier(page, size, sort, keyword)
            .then(result => {
                setStSupplierSearchResult(current => isScroll ? [...(current || []), ...result.data] : result.data)
            })
            .catch(() => GSToast.commonError())
            .finally(() => {
                setStIsSupplierSearching(false)
                refIsSupplierScrolled.current = false
            })
    }, 500, [stSupplierFilter.keyword, stSupplierFilter.page])

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop)

        return afterCal <= (el.clientHeight + 1)
    }

    const handleScroll = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!refIsSupplierScrolled.current) {
            const totalPage = parseInt(stFilter.total / stFilter.size)

            if (isBottom(e.currentTarget) && stFilter.page < totalPage) {
                refIsSupplierScrolled.current = true

                setStFilter(filter => ({
                    ...filter,
                    isScroll: true,
                    page: filter.page + 1
                }))
            }
        }
    }

    const handleDeleteSupplier = (e) => {
        if (disabled) {
            return
        }

        e.preventDefault()
        setStSelectedSupplier()
        props.onSelect()
    }

    const handleSelectSupplier = (supplier) => {
        //WHY? To collapse search result list
        $('.purchase-order-form-editor .search-result').blur()
        setStSelectedSupplier(supplier)
        props.onSelect(supplier)
    }

    const renderSupplierSearchBox = () => {
        return (
            <span className='search-box'>
                    <GSSearchInput
                        ref={refSearchSupplierInput}
                        liveSearchOnMS={500}
                        className="flex-grow-1"
                        style={{
                            height: '38px',
                        }}
                        wrapperProps={{
                            style: {
                                height: '38px',
                                width: '100%'
                            }
                        }}
                        defaultValue={stFilter.keyword}
                        placeholder={i18next.t('page.purchaseOrderFormEditor.supplierInformation.search')}
                        onSearch={(keyword, e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setStSupplierFilter(filter => ({
                                ...filter,
                                isScroll: false,
                                page: 0,
                                keyword
                            }))
                        }}
                    />
                {
                    stSupplierSearchResult
                        ? <div className="search-result"
                               style={{zIndex: 5}}
                               tabIndex="0"
                               onScroll={handleScroll}>
                            {
                                stSupplierSearchResult.map(r => {
                                    return (
                                        <div key={r.id}
                                             className="search-item gsa-hover--gray cursor--pointer"
                                             onClick={() => handleSelectSupplier(r)}>
                                            <GSImg src='/assets/images/avatar-supplier.svg' width={30} height={30}/>
                                            <div className='d-flex flex-column ml-3'>
                                                {r.name.length > 20 ? r.name.slice(0, 20) + '...' : r.name}
                                            </div>
                                            <span
                                                className='ml-auto mb-auto font-weight-normal font-size-_8em'>
                                                    <strong>{r.phoneNumber}</strong>
                                                </span>
                                        </div>
                                    )
                                })
                            }
                            {
                                stSupplierSearchResult.length === 0 &&
                                <p className="text-center mb-0">
                                    <GSTrans t={"component.search.supplier.noResultFound"}/>
                                </p>
                            }
                            {
                                stIsSupplierSearching && <Loading className='mt-3'/>
                            }
                        </div>
                        : stIsSupplierSearching &&
                        <div className="search-result" style={{zIndex: 5}}><Loading/></div>
                }
                </span>
        )
    }

    const renderSupplierRow = (supplier) => {
        return (
            <div>
                <div className='d-mobile-none d-desktop-flex'
                     style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div className="title">
                        <a href={`/supplier/edit/${supplier.id}`} target='_blank'>
                            {supplier.name.length > 20 ? supplier.name.slice(0, 20) + '...' : supplier.name}
                        </a>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', paddingRight: '5%'}}>
                        <div className="phone_number">
                            {supplier.phoneNumber}
                        </div>
                        {
                            !disabled && <div className="button" style={{paddingLeft: '25%'}}>
                                <div onClick={(e) => handleDeleteSupplier(e)}>
                                    <img src="/assets/images/remove-supplier.svg" alt="remove supplier"/>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                <div className='d-mobile d-desktop-none'>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <a href={`/supplier/edit/${supplier.id}`} target='_blank'>
                            {supplier.name.length > 20 ? supplier.name.slice(0, 20) + '...' : supplier.name}
                        </a>
                        {
                            !disabled && <div className="button">
                                <div onClick={(e) => handleDeleteSupplier(e)}>
                                    <img src="/assets/images/remove-supplier.svg" alt="remove supplier"/>
                                </div>
                            </div>
                        }
                    </div>
                    <div className="phone_number" style={{paddingTop: '10px'}}>
                        {supplier.phoneNumber}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <GSWidget className='product-list'>
            <GSWidgetHeader className='title'
                            title={i18next.t('page.purchaseOrderFormEditor.supplierInformation.header')}>
            </GSWidgetHeader>
            <GSWidgetContent className='d-flex flex-column'>
                {!stHideSupplierSearchBox && renderSupplierSearchBox()}
                {
                    stSelectedSupplier && renderSupplierRow(stSelectedSupplier)
                }
                <div className='error'>{props.error}</div>
            </GSWidgetContent>
        </GSWidget>
    )
}

PurchaseOrderSelectSupplier.defaultProps = {
    disabled: false,
    onSelect: () => {
    }
}

PurchaseOrderSelectSupplier.propTypes = {
    error: string,
    disabled: bool,
    supplier: object,
    onSelect: func
}

export default PurchaseOrderSelectSupplier

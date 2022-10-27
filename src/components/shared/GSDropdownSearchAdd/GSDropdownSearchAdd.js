import './GSDropdownSearchAdd.sass'
import React, {useEffect, useRef, useState} from 'react'
import {AvField} from 'availity-reactstrap-validation'
import {FormValidate} from '../../../config/form-validate'
import GSTrans from '../GSTrans/GSTrans'
import GSImg from '../GSImg/GSImg'
import Loading from '../Loading/Loading'
import {arrayOf, bool, func, number, oneOf, oneOfType, shape, string} from 'prop-types'
import {attemptToFindElement} from '../../../utils/class-name'

const GSDropdownSearchAdd = props => {
    const {
        disabled,
        required,
        placeholder,
        defaultValue,
        searchResult,
        filter,
        onSearch,
        onChange
    } = props
    const { page, size, total, isLoading, isNoResult, isScroll, isAdd } = filter

    const [stDefaultValue, setStDefaultValue] = useState({})

    const refTimeOut = useRef()

    useEffect(() => {
        if (!defaultValue) {
            return
        }

        const index = searchResult.findIndex(r => r.value === defaultValue.value)

        setStDefaultValue(index < 0 ? defaultValue : searchResult[index])
    }, [defaultValue, searchResult])

    function debounce(func, timeout = 300) {
        return (...args) => {
            clearTimeout(refTimeOut.current)
            refTimeOut.current = setTimeout(() => {
                func.apply(this, args)
            }, timeout)
        }
    }

    const handleSearch = debounce(keyword => {
        onSearch({
            page: 0,
            keyword,
            showAdd: false,
            isNoResult: false,
            isSearching: true,
            isScroll: false
        })
        $('.gs-dropdown-search-add input').focus()
    }, 500)

    const handleFocus = (isFocus) => {
        attemptToFindElement('.gs-dropdown-search-add .search-result', el => {
            el[isFocus
                ? 'addClass'
                : 'removeClass']('expanded')
        })
    }

    const isBottom = (top, height) => {
        let afterCal = Math.floor(height - top)

        return afterCal - 256 <= 0
    }

    const handleScroll = _.debounce((top, height) => {
        const totalPage = parseInt(total / size)

        if (!isLoading && isBottom(top, height) && page < totalPage) {
            onSearch({
                ...filter,
                isScroll: true,
                page: filter.page + 1
            })
        }
    }, 300)

    return (
        <span className={ ['gs-dropdown-search-add', disabled ? 'disabled' : ''].join(' ') }
              onFocus={ () => handleFocus(true) }
              onBlur={ () => handleFocus(false) }
        >
                <AvField
                    key={ JSON.stringify(stDefaultValue) }
                    className="value"
                    autoComplete="off"
                    name="gs-dropdown-search-add"
                    placeholder={ placeholder }
                    value={ stDefaultValue.label }
                    onChange={ e => handleSearch(e.currentTarget.value) }
                    validate={
                        required
                            ? {
                                ...FormValidate.required
                            }
                            : null
                    }
                />
                <div className="icon"/>
            {
                <div className="search-result"
                     onScroll={ e => handleScroll(e.currentTarget.scrollTop, e.currentTarget.scrollHeight) }>
                    {
                        (!isLoading || isScroll) && !isNoResult && searchResult.map(r => {
                            return (
                                <div key={ r.value }
                                     className="search-item gsa-hover--gray cursor--pointer"
                                     onMouseDown={ () => onChange(r) }
                                     onMouseUp={ () => handleFocus(false) }
                                >
                                    { r.label }
                                </div>
                            )
                        })
                    }
                    {
                        !isLoading && isNoResult &&
                        <p className="no-result">
                            <GSTrans t="page.cashbook.receiptPaymentModal.noResultFound"/>
                        </p>
                    }
                    {
                        !isLoading && isAdd &&
                        <p className="add-new"
                           onClick={ () => handleFocus(false) }>
                            <GSImg src="/assets/images/cashbook/icon-add.png" alt="add"/>
                            <GSTrans t="page.cashbook.receiptPaymentModal.addRecipient"
                                     values={ { n: filter.keyword } }>
                                <span className="add">Add</span>
                            </GSTrans>
                        </p>
                    }
                    {
                        isLoading && <Loading className="loading"/>
                    }
                </div>
            }
        </span>
    )
}

GSDropdownSearchAdd.defaultProps = {
    defaultValue: {},
    filter: {
        page: 0,
        size: 20,
        total: 0,
        isLoading: false,
        isNoResult: false,
        isAdd: false,
        isScroll: false
    },
    onSearch: () => {
    },
    onChange: () => {
    }
}

GSDropdownSearchAdd.propTypes = {
    disabled: bool,
    required: bool,
    placeholder: string,
    defaultValue: shape({
        label: string,
        value: oneOfType([string, number])
    }),
    searchResult: arrayOf(shape({
        label: string,
        value: oneOfType([string, number])
    })),
    filter: shape({
        page: number,
        size: number,
        total: number,
        isLoading: bool,
        isNoResult: bool,
        isAdd: bool,
        isScroll: bool
    }),
    onSearch: func,
    onChange: func
}

export default GSDropdownSearchAdd
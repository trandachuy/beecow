import './GSDropdownSearch.sass'
import React, {useEffect, useRef, useState} from 'react'
import {AvField} from 'availity-reactstrap-validation'
import {FormValidate} from '../../../config/form-validate'
import GSTrans from '../GSTrans/GSTrans'
import Loading from '../Loading/Loading'
import {arrayOf, bool, func, number, oneOf, oneOfType, shape, string} from 'prop-types'
import GSImg from '../GSImg/GSImg'
import {attemptToFindElement} from '../../../utils/class-name'

const GSDropdownSearch = props => {
    const {
        disabled,
        required,
        placeholder,
        placeholderSearch,
        defaultValue,
        searchResult,
        filter,
        onSearch,
        onChange
    } = props
    const { page, size, total, isLoading, isScroll, isNoResult } = filter

    const [stDefaultValue, setStDefaultValue] = useState({})

    useEffect(() => {
        if (!defaultValue) {
            return
        }

        const index = searchResult.findIndex(r => r.value === defaultValue.value)

        setStDefaultValue(index < 0 ? defaultValue : searchResult[index])
    }, [defaultValue, searchResult])

    const isBottom = (top, height) => {
        let afterCal = Math.floor(height - top)

        return afterCal - 300 <= 0
    }

    const handleFocus = (isFocus) => {
        attemptToFindElement('.gs-dropdown-search .search-result', el => {
            el[isFocus
                ? 'addClass'
                : 'removeClass']('expanded')
        })
    }

    const handleScroll = _.debounce((top, height) => {
        const totalPage = parseInt(
            total / size)

        if (!isLoading && isBottom(top, height) && page < totalPage) {

            onSearch({
                ...filter,
                isScroll: true,
                page: filter.page + 1
            })
        }
    }, 300)

    const handleSearch = _.debounce(keyword => {
        onSearch({
            page: 0,
            keyword: keyword,
            showAdd: false,
            isNoResult: false,
            isSearching: true,
            isScroll: false
        })
    }, 500)

    return (
        <span className={ ['gs-dropdown-search', disabled ? 'disabled' : ''].join(' ') }
              onFocus={ () => handleFocus(true) }
              onBlur={ () => handleFocus(false) }
        >
            <AvField
                key={ JSON.stringify(stDefaultValue) }
                className="value"
                autoComplete="off"
                name="gs-dropdown-search"
                placeholder={ placeholder }
                value={ stDefaultValue.label }
                validate={
                    required
                        ? {
                            ...FormValidate.required
                        }
                        : null
                }
                onKeyDown={ e => e.preventDefault() }
            />
            <div className="icon"/>
            <div className="search-result">
                <div className="search-box">
                    <GSImg src="/assets/images/icon-search.png" width={ 15 } height={ 15 } alt="search"/>
                    <input
                        name="search-input"
                        autoComplete="off"
                        placeholder={ placeholderSearch }
                        onChange={ e => handleSearch(e.target.value) }
                    />
                </div>
                <div className="search-list"
                     onScroll={ e => handleScroll(e.currentTarget.scrollTop, e.currentTarget.scrollHeight) }>
                    {
                        (!isLoading || isScroll) && !isNoResult && searchResult.map((r, index) => {
                            return (
                                <div key={ r.value + '_' + index }
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
                            <GSTrans t="component.gsDropdownSearch.noResultFound"/>
                        </p>
                    }
                    {
                        isLoading && <Loading className="loading"/>
                    }
                </div>
            </div>
        </span>
    )
}

GSDropdownSearch.defaultProps = {
    defaultValue: {},
    filter: {
        page: 0,
        size: 20,
        total: 0,
        isLoading: false,
        isNoResult: false,
        isScroll: false
    },
    onSearch: () => {
    },
    onChange: () => {
    }
}

GSDropdownSearch.propTypes = {
    disabled: bool,
    required: bool,
    placeholder: string,
    placeholderSearch: string,
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
        isScroll: bool
    }),
    onSearch: func,
    onChange: func
}

export default GSDropdownSearch
import './GSMegaFilterRowSelectScroll.sass'
import React, {useEffect, useState} from 'react'
import {any, arrayOf, func, number, shape, string} from 'prop-types'
import GSMegaFilterRow from './GSMegaFilterRow'
import GSTrans from '../../GSTrans/GSTrans'
import Loading from '../../Loading/Loading'

const GSMegaFilterRowSelectScroll = props => {
    const { options, paging, onSearch, ...rest } = props
    const { page, size, total, isLoading, isScroll, isNoResult } = paging

    const [stSelect, setStSelect] = useState()
    const [stValue, setStValue] = useState()

    useEffect(() => {
        if (!stValue) {
            return
        }

        const index = options.findIndex(r => r.value === stValue)

        if (index > -1) {
            setStSelect(options[index])
        }
    }, [stValue])

    const isBottom = (top, height) => {
        let afterCal = Math.floor(height - top)

        return afterCal - 226 <= 0
    }

    const handleClick = e => {
        const el = $(e.currentTarget).find('.option-list')
        const isExpanded = el.hasClass('expanded')

        el[isExpanded ? 'removeClass' : 'addClass']('expanded')
    }

    const handleBlur = e => {
        $(e.currentTarget).find('.option-list').removeClass('expanded')
    }

    const handleScroll = _.debounce((top, height) => {
        const totalPage = parseInt(
            total / size)

        if (!isLoading && isBottom(top, height) && page < totalPage) {
            onSearch({
                ...paging,
                isScroll: true,
                page: page + 1
            })
        }
    }, 300)

    return (
        <GSMegaFilterRow { ...rest }>
            { (onChangeFilter, value) => {
                setStValue(value)

                return (
                    <div className="gs-mega-filter-row-select-scroll"
                         tabIndex="0"
                         onClick={ handleClick }
                         onBlur={ handleBlur }
                    >
                        <div className="option">
                            { stSelect?.label }
                        </div>
                        <div className="icon"/>
                        <div className="option-list"
                             onScroll={ e => handleScroll(e.currentTarget.scrollTop, e.currentTarget.scrollHeight) }>
                            {
                                (!isLoading || isScroll) && !isNoResult && options.map((o, index) => {
                                    return (
                                        <div key={ o.value + '_' + index }
                                             className={ [
                                                 'option-item',
                                                 stSelect?.value === o.value ? 'selected' : ''
                                             ].join(' ') }
                                             onMouseDown={ () => onChangeFilter(o.value) }
                                        >
                                            { o.label }
                                            <div className='d-flex align-items-center'>
                                                {o.code && <span style={{color:'#9EA0A5',fontSize:'12px'}}>{ o.code }</span>}
                                                {
                                                    stSelect?.value === o.value && <div className="selected"/>
                                                }
                                            </div>
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
                                isLoading && <Loading className="loading"/>
                            }
                        </div>
                    </div>
                )
            } }
        </GSMegaFilterRow>
    )
}

GSMegaFilterRowSelectScroll.defaultProps = {
    paging: {
        page: 0,
        size: 20,
        total: 0
    },
    onSearch: function () {

    },
    onChange: function () {

    }
}

GSMegaFilterRowSelectScroll.propTypes = {
    title: string,
    i18Key: string,
    name: string.isRequired,
    defaultValue: any,
    ignoreCountValue: any,
    options: arrayOf(shape({
        value: any,
        label: any,
        code: any
    }).isRequired),
    paging: shape({
        page: number,
        size: number,
        total: number
    }),
    onSearch: func,
    onChange: func
}

export default GSMegaFilterRowSelectScroll

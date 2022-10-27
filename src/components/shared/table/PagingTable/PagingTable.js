/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 4/3/19
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react'
import PropTypes, {bool, number} from 'prop-types'
import './PagingTable.sass'
import {UikCheckbox} from "../../../../@uik";
import renderHTML from 'react-render-html';
import DropdownAction from "../../DropdownAction/DropdownAction";
import {GSActionButtonIcons} from "../../GSActionButton/GSActionButton";
import GSTooltip, {GSTooltipIcon, GSTooltipPlacement} from "../../GSTooltip/GSTooltip";
import i18next from "i18next";

export default class PagingTable extends Component {

    constructor(props) {
        super(props)

        this.renderPageNumber = this.renderPageNumber.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
    }

    onChangePage(pageIndex) {
        if (this.props.onChangePage) {
            this.props.onChangePage(pageIndex)
        }
    }

    renderPageNumber() {
        const totalPage = this.props.totalPage
        const currentPage = this.props.currentPage
        const maxPage = this.props.maxShowedPage

        if (totalPage === 1) return

        let btnPageList = []

        // previous btn
        if (currentPage > 1) {
            btnPageList.push(
                <li className={"page-item " + (currentPage === 1 ? 'page-item--disable' : '')}
                    key={'pre-btn'}
                    onClick={() => this.onChangePage(currentPage - 1)}>
                    <a className={"page-link " + (currentPage === 1 ? 'page-link--disable' : '')}
                       aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
            )
        }


        const pushPageToList = (pageNumber) => {
            btnPageList.push(
                <li className={'page-item ' + (currentPage === (pageNumber)? 'active':'')}
                    onClick={() => this.onChangePage(pageNumber)}
                    key={pageNumber}>
                    <a className="page-link">{pageNumber}</a>
                </li>
            )
        }


        const pushDivider = () => {
            btnPageList.push(
                <li className="page-item page-item--disable" key={'blank-' + (Math.random() * 100)}>
                    <a className="page-link page-link--disable">...</a>
                </li>
            )
        }


        // page list
        if (totalPage <= maxPage) {
            for (let i = 0; i < totalPage; i++) {
                btnPageList.push(
                    <li className={'page-item ' + (currentPage === (i+1)? 'active':'')}
                        key={i+1}
                        onClick={() => this.onChangePage(i+1)}>
                        <a className="page-link">{i+1}</a>
                    </li>
                )
            }
        } else {
            const half = maxPage / 2
            const half2 = Math.floor(half/2)
            const half4 = Math.floor(half2/2)
            const padding = 1
            const paddingMiddle = 2
            let lastIndex = 0, lastIndex2 = 0

            // padding first
            if (currentPage > padding) {
                for (let i = 1; i <= padding; i++) {
                    lastIndex = i
                    pushPageToList(i)
                }
            }


            pushDivider()


            // find around
            for (let i = currentPage - paddingMiddle; i < currentPage + paddingMiddle; i++) {
                if (i-lastIndex === 1) btnPageList.pop()
                if (i < 1 || i > totalPage) continue
                if ( (currentPage > (padding) && i <= padding )
                || (currentPage <= totalPage - padding && i > totalPage - padding)) continue
                pushPageToList(i)
                lastIndex2 = i
            }

            if (lastIndex2 < totalPage - padding) {
                pushDivider()
            }


            // padding last
            if (currentPage <= totalPage - (padding)) {
                for (let i = totalPage - (padding - 1); i <= totalPage; i++) {
                    pushPageToList(i)
                }
            }
        }


        // next btn
        if (currentPage < totalPage) {
            btnPageList.push(
                <li className={"page-item " + (currentPage===totalPage? 'page-item--disable':'')}
                    key={'next-btn'}
                    onClick={() => this.onChangePage(currentPage+1)}>
                    <a className={"page-link " + (currentPage===totalPage? 'page-link--disable':'')}
                       aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            )
        }


        return btnPageList
    }

    render() {
        return (
            // <div className="paging-table-wrapper">

            //     <div className="paging-table">
            //         <div className={["paging-table__table","gs-atm__scrollbar-1",
            //             this.props.rowHoverEffect? 'row-hover-effect':'',
            //             this.props.pointerCursor? 'pointer-cursor':''].join(' ')} style={{
            //             height: this.props.scrollableBodyWhenHeightOver? this.props.scrollableBodyWhenHeightOver:'unset',
            //             overflow: this.props.scrollableBodyWhenHeightOver? 'auto':'unset'
            //         }}>
            //             <UikWidgetTable>
            //                 <thead>
            //                     <tr>
            //                         {this.props.headers.map( (header, index) =>
            //                             <th key={index} className={["gs-table__th", this.props.headersAlign && this.props.headersAlign[index] ? this.props.headersAlign[index]:PagingTableAlign.CENTER].join(' ')}>
            //                                 {header}
            //                             </th>)}
            //                     </tr>
            //                 </thead>
            //                 <tbody>
            //                     {this.props.children}
            //                 </tbody>
            //             </UikWidgetTable>
            //         </div>

            //     </div>


            // </div>
            <>
                <section className={["gs-table", this.props.className].join(' ')} style={this.props.style}>
                    <div className={this.props.overflow ? 'table-overflow' : ''}>
                        <section className="gs-table-header">
                            {this.props.headers &&
                                this.props.headers.map((dataRow, idx) => {
                                    if (dataRow === 'check_box_all') {
                                        return <section key={idx} className="gs-table-header-item">
                                            <div className="checkbox-border">
                                                <UikCheckbox
                                                    color='green'
                                                    onChange={e => this.props.onChangeAllCheckbox(e.target.checked)}
                                                    className="custom-check-box"
                                                />
                                                <DropdownAction
                                                    key={`dropdown-${idx}`}
                                                    icon={GSActionButtonIcons.DROPDOWN}
                                                    actions={this.props.actionsForCheckbox}
                                                    disabled={this.props.disabledCheckbox}
                                                />
                                            </div>
                                        </section>
                                    }
                                    return <section key={idx} className="gs-table-header-item"><span>{renderHTML(dataRow)}</span>

                                        {this.props.tooltip?.find(i=>i.index ===idx) &&
                                            <GSTooltip message={i18next.t(this.props.tooltip.find(i=>i.index ===idx)?.message)} icon={GSTooltipIcon.QUESTION_CIRCLE} placement={GSTooltipPlacement.BOTTOM}/>
                                        }
                                    </section>
                                })
                            }
                        </section>
                        { this.props.totalItems > 0 &&
                            <section className="gs-table-body">
                                {this.props.children}
                            </section>
                        }
                    </div>

                    { this.props.isShowPagination === true && this.props.totalItems > 0 &&
                        <div className="paging-table__footer">
                            <nav>
                                <ul className="pagination paging-table__pagination">
                                    {this.renderPageNumber()}
                                </ul>
                            </nav>
                        </div>
                    }
                </section>
            </>
        )
    }
}

PagingTable.defaultProps = {
    isShowPagination: true,
    rowHoverEffect: true,
    pointerCursor: true,
    overflow: false,
}

export const PagingTableAlign = {
    LEFT: 'text-left !important',
    CENTER: 'text-center !important',
    RIGHT: 'text-right !important'
}

PagingTable.propTypes = {
    headers: PropTypes.array,
    headersAlign: PropTypes.array,
    totalPage: PropTypes.number,
    currentPage: PropTypes.number,
    maxShowedPage: PropTypes.number,
    onChangePage: PropTypes.func,
    hidePagingEmpty: PropTypes.bool,
    totalItems: PropTypes.number,
    isShowPagination: PropTypes.bool,
    scrollableBodyWhenHeightOver: PropTypes.any,
    rowHoverEffect: PropTypes.bool,
    pointerCursor: PropTypes.bool,
    onChangeAllCheckbox: PropTypes.any,
    actionsForCheckbox: PropTypes.array,
    disabledCheckbox: PropTypes.bool,
    overflow: PropTypes.bool,
    tooltip:PropTypes.arrayOf(
        PropTypes.shape({
            toggle:PropTypes.bool,
            index:PropTypes.number,
            message:PropTypes.string
        })
    )
}



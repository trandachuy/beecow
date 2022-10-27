/*
 * ******************************************************************************
 *  * Copyright 2017 (C) MediaStep Software Inc.
 *  *
 *  * Created on : 14/12/2021
 *  * Author: Minh Tran <minh.tran@mediastep.com>
 *  ******************************************************************************
 */

import React, {useEffect, useRef, useState} from 'react'
import styled from 'styled-components'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import i18next from 'i18next'
import GSTrans from '../GSTrans/GSTrans'
import GSButton from '../GSButton/GSButton'
import {arrayOf, bool, func, string} from 'prop-types'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {UikCheckbox, UikInput} from '../../../@uik'
import GSImg from '../GSImg/GSImg'
import GSTable from '../GSTable/GSTable'
import {RouteUtils} from '../../../utils/route'
import facebookService from '../../../services/FacebookService'
import moment from 'moment'
import Loading from '../Loading/Loading'

const ModalWrapper = styled.div`
  .modal-header {
    padding: 0;
    background-color: #F8F8F8;
    padding-top: 10px;

    .modal-title p {
      margin: 0;
      color: black;
      font-size: 18px;
      font-weight: 500;
      text-align: initial;
      margin-left: 15px;
      padding-bottom: 10px;
    }

    button.close {
      margin: -25px -10px !important;
    }
  }

  .modal-body {
    padding: 0 !important;
    min-width: 888px;
  }

  @media (max-width: 992px) {
    .modal-body {
      min-width: 0px;
    }
  }


  .modal-footer {
    justify-content: flex-end !important;
    margin-top: 12px !important;
  }
`
const FilterWrapper = styled.div`
  padding: 12px;
`
const SelectedLabel = styled.div`
  text-transform: uppercase;
  font-weight: 500;
  font-size: 12px;
  text-align: left;
  margin-top: 10px;
`
const TableWrapper = styled.div`
  tr {
    th {
      background: #F7F7F7;
      color: black;
    }

    td, th {
      flex-basis: auto !important;
      flex-grow: 0;
    }

    td:nth-child(1),
    th:nth-child(1) {
      flex-basis: 7% !important;
    }

    td:nth-child(2),
    th:nth-child(2) {
      flex-basis: 12% !important;
    }

    td:nth-child(3),
    th:nth-child(3) {
      flex-grow: 10 !important;
      flex-basis: 5% !important;
    }

    td:nth-child(4),
    th:nth-child(4) {
      flex-basis: 20% !important;
    }

    td:nth-child(5),
    th:nth-child(5) {
      flex-basis: 8% !important;
    }
  }

  label {
    margin-top: 0;
  }
`
const TableBody = styled.tbody`
  height: ${ props => props.clientHeight - 250 + 'px' };
  overflow-y: auto;
  max-height: 461px;
`
const NotFound = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  span {
    font-size: 10px;
    margin-top: 12px;
  }
`
const LoadingWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const SelectFbPostModal = props => {
    const { toggle, pageId, defaultValue, onToggle, onSave } = props

    const [stPaging, setStPaging] = useState({
        pageId: pageId,
        after: undefined,
        limit: 100,
        postId: undefined,
        isScrolling: false,
        isLoading: false
    })
    const [stSelectedPosts, setStSelectedPosts] = useState([])
    const [stPostResult, setStPostResult] = useState([])
    const [stAfter, setStAfter] = useState()

    const refIsScrolled = useRef(false)

    useEffect(() => {
        if (!pageId) {
            setStPostResult([])
        } else {
            setStPaging(paging => ({
                ...paging,
                pageId,
                after: paging.after === undefined ? null : undefined,
                isScrolling: false
            }))
        }
    }, [pageId])

    useEffect(() => {
        const { pageId, isScrolling, postId, after, limit } = stPaging

        if (!pageId) {
            return
        }

        setStPaging(p => ({
            ...p,
            isLoading: true
        }))

        facebookService.getFbPosts(pageId, { postId, after, limit })
            .then(({ data, paging }) => {
                if (isScrolling) {
                    setStPostResult(p => [...p, ...data])
                } else {
                    setStPostResult(data)
                }
                setStAfter(paging?.cursors?.after)
            })
            .finally(() => {
                refIsScrolled.current = false
                setStPaging(p => ({
                    ...p,
                    isScrolling: false,
                    isLoading: false
                }))
            })
    }, [stPaging.after, stPaging.limit, stPaging.postId, stPaging.pageId])

    useEffect(() => {
        setStSelectedPosts(defaultValue)
    }, [defaultValue, toggle])

    const handleToggle = () => {
        onToggle()
    }

    const handleSearch = _.debounce(keyword => {
        const pattern = new RegExp('^(?:https?:\\/\\/)?(-\\.)?(?:[^\\s\\/?\\.#]+\\.?)+(?:\\/[^\\s]*)?\\/posts\\/([^\\s\\/]+)', 'i')
        const regGroup = pattern.exec(keyword) || []

        setStPaging(paging => ({
            ...paging,
            after: undefined,
            postId: regGroup[2] || keyword || undefined
        }))
    }, 300)

    const handleSelectAll = e => {
        const checked = e.target.checked

        setStSelectedPosts(() => {
            if (checked) {
                return stPostResult
            }

            return []
        })
    }

    const handleSelect = (e, post) => {
        const checked = e.target.checked

        setStSelectedPosts(posts => {
            const index = posts.findIndex(p => p.postId === post.postId)

            if (checked) {
                if (index < 0) {
                    return [...posts, post]
                }
            } else {
                if (index > -1) {
                    posts.splice(index, 1)

                    return [...posts]
                }
            }

            return posts
        })
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop)

        return afterCal == (el.clientHeight + 1)
    }

    const handleScroll = e => {
        e.preventDefault()
        e.stopPropagation()

        if (!refIsScrolled.current && stAfter && isBottom(e.currentTarget)) {
            refIsScrolled.current = true

            setStPaging(filter => ({
                ...filter,
                isScrolling: true,
                after: stAfter
            }))
        }
    }

    const handleSave = () => {
        onSave(stSelectedPosts)
    }

    return (
        <Modal isOpen={ toggle } toggle={ handleToggle } size="xl">
            {/*<div className="error-toast">*/ }
            {/*    { stErrorToast.error }*/ }
            {/*</div>*/ }
            <ModalWrapper>
                <ModalHeader toggle={ handleToggle }>
                    <p>{ i18next.t('component.selectFbPostModal.title') }</p>
                </ModalHeader>
                <ModalBody>
                    <FilterWrapper>
                        <UikInput
                            icon={ (
                                <FontAwesomeIcon icon={ 'search' }/>
                            ) }
                            iconPosition="left"
                            placeholder={ i18next.t('component.selectFbPostModal.searchHint') }
                            onChange={ e => handleSearch(e.currentTarget.value) }
                        />
                        <SelectedLabel>
                            <GSTrans t="component.selectFbPostModal.selected" values={ { x: stSelectedPosts.length } }/>
                        </SelectedLabel>
                    </FilterWrapper>
                    <div className="table table-header-fix">
                        <TableWrapper>
                            <GSTable>
                                <thead>
                                <tr>
                                    <th>
                                        <UikCheckbox
                                            name="check_all"
                                            className="select-collection-row"
                                            checked={ stSelectedPosts.length && stPostResult.length && !_.difference(stPostResult.map(({ id }) => id), stSelectedPosts.map(({ id }) => id)).length }
                                            onChange={ handleSelectAll }
                                        />
                                    </th>
                                    <th className="white-space-nowrap"><GSTrans
                                        t="component.selectFbPostModal.header.postName"/></th>
                                    <th></th>
                                    <th className="white-space-nowrap"><GSTrans
                                        t="component.selectFbPostModal.header.time"/></th>
                                    <th></th>
                                </tr>
                                </thead>
                                <TableBody clientHeight={ document.documentElement.clientHeight }
                                           onScroll={ handleScroll }>
                                    {
                                        stPaging.isLoading && !stPaging.isScrolling &&
                                        <LoadingWrapper><Loading className="mt-2"/></LoadingWrapper>
                                    }
                                    {
                                        !stPaging.isLoading && !stPostResult.length &&
                                        <NotFound>
                                            <GSImg src="/assets/images/select_fb_post_modal/icon_notfound.png"
                                                   alt="not found"/>
                                            <span><GSTrans t="component.selectFbPostModal.notfound"/></span>
                                        </NotFound>
                                    }
                                    {
                                        (!stPaging.isLoading || stPaging.isScrolling) &&
                                        stPostResult.map(post => (
                                            <tr key={ post.postId }>
                                                <td>
                                                    <UikCheckbox
                                                        name="check_all"
                                                        className="select-collection-row"
                                                        checked={ stSelectedPosts.findIndex(p => p.postId === post.postId) > -1 }
                                                        onChange={ e => handleSelect(e, post) }
                                                    />
                                                </td>
                                                <td>
                                                    <GSImg src={ post.full_picture } width={ 61 } height={ 61 }
                                                           alt="post"/>
                                                </td>
                                                <td>
                                                    <span className="line-clamp-2">{ post.message }</span>
                                                </td>
                                                <td className="white-space-nowrap">
                                                    { moment(post.created_time).format('HH:mm') }
                                                    <br/>
                                                    { moment(post.created_time).format('DD-MM-YYYY') }
                                                </td>
                                                <td>
                                                    <GSImg
                                                        className="cursor--pointer"
                                                        src="/assets/images/select_fb_post_modal/icon_external.png"
                                                        alt="external"
                                                        onClick={ () => RouteUtils.openNewTab(post.permalink_url) }
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    }
                                    {
                                        stPaging.isScrolling && <Loading className="mt-2"/>
                                    }
                                </TableBody>
                            </GSTable>
                        </TableWrapper>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <GSButton success marginLeft onClick={ handleSave }>
                        <GSTrans t="common.btn.select"/>
                    </GSButton>
                </ModalFooter>
            </ModalWrapper>
        </Modal>
    )
}

SelectFbPostModal.defaultProps = {
    toggle: false,
    defaultValue: [],
    onToggle: function () {
    },
    onSave: function () {
    }
}

SelectFbPostModal.propTypes = {
    pageId: string.isRequired,
    toggle: bool,
    defaultValue: arrayOf(string),
    onToggle: func,
    onSave: func
}

export default SelectFbPostModal

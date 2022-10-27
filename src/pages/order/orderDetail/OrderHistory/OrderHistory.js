/*
 * ******************************************************************************
 *  * Copyright 2017 (C) MediaStep Software Inc.
 *  *
 *  * Created on : 08/03/2022
 *  * Author: Minh Tran <minh.tran@mediastep.com>
 *  ******************************************************************************
 */

import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {UikWidget} from '../../../../@uik'
import i18next from 'i18next'
import GSWidgetHeader from '../../../../components/shared/form/GSWidget/GSWidgetHeader'
import {Modal, ModalBody, ModalHeader} from 'reactstrap'
import {Trans} from 'react-i18next'
import GSTable from '../../../../components/shared/GSTable/GSTable'
import moment from 'moment'
import {BCOrderService} from '../../../../services/BCOrderService'
import {number} from 'prop-types'

const HEADER = {
    date: i18next.t('component.orderHistory.header.date'),
    createdBy: i18next.t('component.orderHistory.header.createdBy'),
    action: i18next.t('component.orderHistory.header.action'),
    note: i18next.t('component.orderHistory.header.note')
}

const StlTitle = styled.div`
  cursor: pointer;
  color: #1E69D5
`
const StlModalWrapper = styled.div`
  width: 708px;

  .note-mobile {
    display: none;
    padding: 0 !important;
    border-bottom: 1px solid #E5E5E5;

    td {
      padding: 0 !important;

      > div {
        background-color: #F9F9F9;
        margin: 0 7px 14px 7px;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 10px;

        > div {
          font-weight: 500;
        }
      }
    }
  }

  @media (max-width: 992px) {
    width: 100%;

    .note-desktop {
      display: none;
    }

    .note-mobile {
      display: table-row;
    }

    td {
      border: none !important;
    }
  }

  .modal-body {
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 0;

    .scroll {
      height: 320px;
      overflow-y: auto;
    }

    table {
      tr {
        vertical-align: middle;
        padding-top: 1rem;
        padding-bottom: 1rem;

        > th {
          white-space: nowrap;
          background-color: #F6F6F6;
          color: #000000;
        }

        > td:not(:last-child) {
          white-space: nowrap;
        }
      }
    }
  }

  .modal-header {
    border-bottom: none;
    padding-bottom: unset;

    .modal-title {
      text-align: left !important;
      color: #000000 !important;
      font-weight: 500 !important;
    }
  }
`

const OrderHistory = props => {
    const { bcOrderId } = props

    const [stToggle, setStToggle] = useState()
    const [stHistories, setStHistories] = useState([])
    const [stLoading, setStLoading] = useState(true)

    useEffect(() => {
        if (!stToggle || !bcOrderId) {
            return
        }

        setStLoading(true)

        BCOrderService.getOrderHistoriesByBcOrderId(bcOrderId)
            .then(histories => setStHistories(histories))
            .finally(() => setStLoading(false))
    }, [stToggle])

    const toggleModal = () => {
        setStToggle(toggle => !toggle)
    }
    const getOrderHistoryNote = (history) => {
        if (history.action === 'PICKUP_FAILED') {
            return i18next.t('component.orderHistory.note.pickup_failed')
        } else {
            return history.note ? history.note : '-'
        }
    }

    const renderHistoryModal = () => {
        return (
            <Modal isOpen={ stToggle } size="xl">
                <StlModalWrapper>
                    <ModalHeader toggle={ toggleModal }>
                        <Trans i18nKey="component.orderHistory.title">
                            Purchase Order History
                        </Trans>
                    </ModalHeader>
                    <ModalBody>
                        <div className="scroll">
                            <GSTable isLoading={ stLoading }>
                                <thead>
                                <tr>
                                    <th>{ HEADER.date }</th>
                                    <th>{ HEADER.createdBy }</th>
                                    <th>{ HEADER.action }</th>
                                    <th className="note-desktop">{ HEADER.note }</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    stHistories.map(history => {
                                        return (
                                            <>
                                                <tr key={ history.id } className="row-align-item">
                                                    <td className="vertical-align-baseline">
                                                        <div>
                                                            { moment(history.createdDate).format('HH:mm') }
                                                        </div>
                                                        <div>
                                                            { moment(history.createdDate).format('YYYY-MM-DD') }
                                                        </div>
                                                    </td>
                                                    <td className="vertical-align-baseline">
                                                        { history.staffName === '[shop0wner]' ? i18next.t('page.order.detail.information.shopOwner') : history.staffName }
                                                    </td>
                                                    <td className="vertical-align-baseline">
                                                        { i18next.t(`component.orderHistory.action.${ history.action.toLowerCase() }`) }
                                                    </td>
                                                    <td className="vertical-align-baseline note-desktop">
                                                        {getOrderHistoryNote(history)}
                                                    </td>
                                                </tr>
                                                <tr className="note-mobile">
                                                    <td colSpan={ 3 }>
                                                        <div>
                                                            <div>{ HEADER.note }</div>
                                                            { getOrderHistoryNote(history) }
                                                        </div>
                                                    </td>
                                                </tr>
                                            </>
                                        )
                                    })
                                }
                                </tbody>
                            </GSTable>
                        </div>
                    </ModalBody>
                </StlModalWrapper>
            </Modal>
        )
    }

    return (
        <UikWidget className="gs-widget">
            {
                renderHistoryModal()
            }
            <GSWidgetHeader className="widget__header widget__header--text-align-right text-capitalize">
                <StlTitle onClick={ toggleModal }>
                    { i18next.t('component.orderHistory.title') }
                </StlTitle>
            </GSWidgetHeader>
        </UikWidget>
    )
}

OrderHistory.defaultProps = {}

OrderHistory.propTypes = {
    bcOrderId: number.isRequired
}

export default OrderHistory

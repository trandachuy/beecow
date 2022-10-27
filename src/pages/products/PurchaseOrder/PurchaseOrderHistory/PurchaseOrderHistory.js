import {Modal, ModalBody, ModalHeader} from "reactstrap";
import {Trans} from "react-i18next";
import GSTable from "../../../../components/shared/GSTable/GSTable";
import moment from "moment";
import i18next from "i18next";
import React, {useEffect, useState} from "react";
import {ItemService} from "../../../../services/ItemService";
import {GSToast} from "../../../../utils/gs-toast";
import PropTypes from "prop-types";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import './PurchaseOrderHistory.sass'

const PURCHASE_ORDER_HISTORY_HEADERS = {
    date: i18next.t('page.purchase.order.history.column.date'),
    staff: i18next.t('page.purchase.order.history.column.staff'),
    action: i18next.t('page.purchase.order.history.column.action'),
    note: i18next.t('page.purchase.order.history.column.note')
}

const PurchaseOrderHistory = props => {
    const [stOpenHistory, setStOpenHistory] = useState(false);
    const [stHistories, setStHistories] = useState([]);

    useEffect(() => {
        if (stOpenHistory) {
            getPurchaseOrderHistory();
        }
        return () => {
        };
    }, [stOpenHistory]);

    const getPurchaseOrderHistory = async () => {
        try {
            const data = await ItemService.getPurchaseOrderHistory(props.purchaseOrderId);
            setStHistories(data);
        } catch (error) {
            console.log('error to get purchase order history by id ' + props.purchaseOrderId);
            GSToast.commonError();
        }
    }

    const openHistory = () => {
        setStOpenHistory(true)
    }

    const closeHistory = () => {
        setStOpenHistory(false)
    }

    return (
        <GSWidget className={"purchase-order-history"}>
            <GSWidgetHeader className={'widget__header widget__header--text-align-right text-capitalize'}>
                <div className="purchase-order-history-header" onClick={openHistory}>
                    {i18next.t("page.purchase.order.wizard.history")}
                </div>
            </GSWidgetHeader>
            <Modal wrapClassName="purchase-order-history-modal" isOpen={stOpenHistory}>
            <ModalHeader toggle={closeHistory}>
                <Trans i18nKey="page.purchase.order.wizard.history">
                    Purchase Order History
                </Trans>
            </ModalHeader>
            <ModalBody>
                <div>
                    <GSTable>
                        <thead>
                        <tr>
                            <th>{PURCHASE_ORDER_HISTORY_HEADERS.date}</th>
                            <th>{PURCHASE_ORDER_HISTORY_HEADERS.staff}</th>
                            <th>{PURCHASE_ORDER_HISTORY_HEADERS.action}</th>
                            <th>{PURCHASE_ORDER_HISTORY_HEADERS.note}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            stHistories.map(history => {
                                return (
                                    <tr key={history.id} className="row-align-item">
                                        <td className="vertical-align-baseline">
                                            <div>
                                                {moment(history.createdDate).format('HH:mm:ss')}
                                            </div>
                                            <div>
                                                {moment(history.createdDate).format('YYYY-MM-DD')}
                                            </div>
                                        </td>
                                        <td className="vertical-align-baseline">
                                            <div>
                                                {history.staffName}
                                            </div>
                                        </td>
                                        <td className="vertical-align-baseline">
                                            <div>
                                                {i18next.t(`page.purchase.order.history.status.${history.status.toLowerCase()}`)}
                                            </div>
                                        </td>
                                        <td className="vertical-align-baseline">
                                            <div>
                                                {history.note}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </GSTable>
                </div>
            </ModalBody>
        </Modal>
        </GSWidget>
    )
}

export default PurchaseOrderHistory;

PurchaseOrderHistory.propTypes = {
  purchaseOrderId: PropTypes.number.isRequired
}

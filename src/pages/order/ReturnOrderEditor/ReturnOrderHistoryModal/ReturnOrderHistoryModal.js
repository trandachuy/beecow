import React, { useEffect, useState } from 'react';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSTable from '../../../../components/shared/GSTable/GSTable';
import i18next from 'i18next'
import moment from 'moment';
import './ReturnOrderHistoryModal.sass';
import CloseCircleIcon from '../../../../components/shared/GSSvgIcon/CloseCircle';

const ReturnOrderHistoryModal = (props) => {
    const [stReturnOrderHistory, setStReturnOrderHistory] = useState([])
    useEffect(()=>{
        if(props.orderProcessingHistory){
            setStReturnOrderHistory(props.orderProcessingHistory)
        }
    })

    return (
        <>
            <Modal isOpen={props.isOpenModal} className="return-order-history-modal" size="lg" key={props.isOpen}>
                <ModalHeader toggle={props.onCancel} className='font-weight-bold text-secondary'>
                    <h6><GSTrans t="page.orders.returnOrder.return.order.history"/></h6>
                    <div onClick={props.onCancel} className="cursor--pointer">
                        <CloseCircleIcon/>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className='return-order-history-detail gs-atm__scrollbar-1'>
                        <GSTable>
                            <thead className='gs-widget__header--gray'>
                                <tr className="white-space-nowrap text-center">
                                    <th>
                                        <GSTrans t={ 'page.order.create.print.date' }/>
                                    </th>
                                    <th>
                                        <GSTrans t={ 'page.orders.returnOrder.history.create.by' }/>
                                    </th>
                                    <th>
                                        <GSTrans t={ 'component.page.table.header.action' }/>
                                    </th>
                                    <th>
                                        <GSTrans t={ 'page.order.detail.noteFromBuyer' }/>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            {stReturnOrderHistory.map((item, index) => {
                                return (
                                    <tr key={index}
                                        className={ [
                                            'gsa-hover--gray cursor--pointer'
                                        ].join(' ') }
                                        // onMouseDown={ (e) => onClickRow(e, item) }
                                    >
                                        <td>{moment(item.createdDate).format('hh:mm DD/MM/YYYY')}</td>
                                        <td>{item.staffName === '[shop0wner]' ? i18next.t('page.order.detail.information.shopOwner') : item.staffName}</td>
                                        <td>{i18next.t(`page.orders.returnOrder.actionStatus.${item.actionStatus}`)}</td>
                                        <td style={{overflowWrap: 'break-word', minWidth: '5rem', maxWidth: '30rem'}}>
                                            <p className={item.note?'text-left mb-0':'text-center'}>{item.note ? item.note : '-'}</p>
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
        </>
    );
}
export default ReturnOrderHistoryModal

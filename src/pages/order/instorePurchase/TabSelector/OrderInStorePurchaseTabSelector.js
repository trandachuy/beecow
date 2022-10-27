import React, {useContext, useEffect, useRef} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {cn} from "../../../../utils/class-name";
import {OrderInStorePurchaseRecoil} from "../recoil/OrderInStorePurchaseRecoil";
import './OrderInStorePurchaseTabSelector.sass'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {UikTopBarSection} from '../../../../@uik'
import {ChevronLeft, ChevronRight, X} from "react-bootstrap-icons";
import _ from "lodash";
import {OrderInStorePurchaseContext} from "../context/OrderInStorePurchaseContext";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import i18n from "i18next";
import DragToScroll from "../../../../components/shared/DragToScroll/DragToScroll";

const OrderInStorePurchaseTabSelector = props => {
    const refTabHeaderContainer = useRef(null);
    const refTabHeaderBackBtn = useRef(null);
    const refTabHeaderForwardBtn = useRef(null);
    const refTabHeaderSelectorSection = useRef(null);
    const refConfirmModal = useRef(null);
    const orderList = useRecoilValue(OrderInStorePurchaseRecoil.orderListState)

    const createNewOrder = useSetRecoilState(OrderInStorePurchaseRecoil.createNewOrderSelector)
    const deleteOrder = useSetRecoilState(OrderInStorePurchaseRecoil.deleteOrderSelector)
    const resetCurrentOrder = useSetRecoilState(OrderInStorePurchaseRecoil.resetCurrentOrderSelector)
    const [currentOrderIndex, setCurrentOrderIndex] = useRecoilState(OrderInStorePurchaseRecoil.currentOrderIndexState)

    const {state, dispatch} = useContext(OrderInStorePurchaseContext.context);




    const onClickCreateNewOrder = (e) => {
        e.preventDefault()
        e.stopPropagation()
        createNewOrder()
        // scroll to last
        setTimeout(() => {
            refTabHeaderContainer.current.scrollTo({
                top: 0,
                left: refTabHeaderContainer.current.offsetWidth * 2,
                behavior: 'smooth'
            })
        }, 100)

    }

    const onClickSelectOrder = (e, index) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentOrderIndex(index)
    }

    const onClickScrollForward = (e) => {
        if (e) e.preventDefault()
        refTabHeaderContainer.current.scrollTo({
            top: 0,
            left: refTabHeaderContainer.current.scrollLeft + 160,
            behavior: 'smooth'
        })

    }

    const onClickScrollBack = (e) => {
        if (e) e.preventDefault()
        refTabHeaderContainer.current.scrollTo({
            top: 0,
            left: refTabHeaderContainer.current.scrollLeft - 160,
            behavior: 'smooth'
        })
    }

    const onClickDeleteOrder = (e, orderIndex) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.button !== DragToScroll.MOUSE_BUTTON.MAIN && e.button !== DragToScroll.MOUSE_BUTTON.AUXILIARY) return
        const deletedOrder = orderList.find(({index}) => index === orderIndex)

        const resetStateOrder = {
            ...deletedOrder.state,
            storeInfo: OrderInStorePurchaseContext.initState.storeInfo
        }

        // compare state
        if (_.isEqual(resetStateOrder, OrderInStorePurchaseContext.initState)) { // has no change
            deleteOrder(orderIndex)
        } else { // has been changed
            refConfirmModal.current.openModal({
                messages: i18n.t('page.order.instorePurchase.confirmDeleteOrderHint'),
                modalTitle: i18n.t('page.order.instorePurchase.confirmDeleteOrder'),
                okCallback: () => {

                    // if is not current tab -> just remove
                    if (currentOrderIndex !== orderIndex) {
                        deleteOrder(orderIndex)
                    } else { // current tab
                        if (currentOrderIndex !== 0 || orderList.length > 1) {
                            deleteOrder(orderIndex)
                        } else {
                            dispatch(OrderInStorePurchaseContext.actions.reset())
                        }
                    }
                }
            })
        }
    }

    useEffect(() => {
       if (refTabHeaderContainer.current) {
           const {scrollWidth, offsetWidth, scrollLeft} = refTabHeaderContainer.current
           const isOverflow = offsetWidth < scrollWidth

           if (isOverflow) {
               refTabHeaderBackBtn.current.removeAttribute('hidden')
               refTabHeaderForwardBtn.current.removeAttribute('hidden')
               refTabHeaderSelectorSection.current.classList.add('is-overflow')
           } else {
               refTabHeaderBackBtn.current.setAttribute('hidden', true)
               refTabHeaderForwardBtn.current.setAttribute('hidden', true)
               refTabHeaderSelectorSection.current.classList.remove('is-overflow')
           }
       }
    }, [orderList]);


    return (
        <>
            <ConfirmModal ref={refConfirmModal} />
            <div className="order-in-store-purchase__tab-selector-wrapper d-flex align-self-stretch align-items-end pr-0 overflow-hidden"  ref={refTabHeaderContainer}>
                <div className="order-in-store-purchase__tab-nav-btn order-in-store-purchase__tab-nav-btn-back"
                     ref={refTabHeaderBackBtn}
                    onClick={onClickScrollBack}
                >
                    <ChevronLeft/>
                </div>
                <div className="d-flex order-in-store-purchase__tab-selector px-3" ref={refTabHeaderSelectorSection}>
                    {
                        orderList.map(({index, state}) => (
                            <div className={cn('order-in-store-purchase__tab-header', {
                                'order-in-store-purchase__tab-header--active': currentOrderIndex === index
                            })} onMouseDown={(e) => {
                                console.log('mouse down')
                                switch (e.button) {
                                    case DragToScroll.MOUSE_BUTTON.MAIN:
                                        onClickSelectOrder(e, index)
                                        break
                                    case DragToScroll.MOUSE_BUTTON.AUXILIARY:
                                        onClickDeleteOrder(e, index)
                                        break
                                }
                            }} key={index}>
                                <GSTrans t="page.order.instorePurchase.orderTabHeader" values={{index: index + 1 }}/>

                                <span className="order-in-store-purchase__tab-close-btn" onMouseDown={(e) => onClickDeleteOrder(e, index)}>
                                    <X size={24}/>
                                </span>
                            </div>
                        ))
                    }

                </div>
                <div  className="order-in-store-purchase__tab-nav-btn order-in-store-purchase__tab-nav-btn-forward"
                      ref={refTabHeaderForwardBtn}
                      onClick={onClickScrollForward}
                >
                    <ChevronRight/>

                </div>
            </div>
            <UikTopBarSection className="p-0 flex-grow-1" >
                {orderList.length < 20 &&
                    <span onClick={onClickCreateNewOrder}
                       className="order-in-store-purchase__tab-new-btn align-self-center px-3">
                     <FontAwesomeIcon icon="plus"/>
                </span>
                }
            </UikTopBarSection>
        </>


    );
};

OrderInStorePurchaseTabSelector.propTypes = {

};

export default OrderInStorePurchaseTabSelector;

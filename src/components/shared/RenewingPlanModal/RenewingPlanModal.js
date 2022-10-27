import './RenewingPlanModal.sass'
import React from "react";
import {bool, func} from "prop-types";
import GSTrans from "../GSTrans/GSTrans";
import GSImg from "../GSImg/GSImg";

const RenewingPlanModal = (props) => {
    const {toggle, onClose} = props

    return (
        <>
            {toggle && <div className="renewing-plan-modal">
                <div className="renewing-plan-modal__wrapper">
                    <div className="renewing-plan-modal__wrapper__body">
                        <div className='renewing-plan-modal__wrapper__body__content'>
                            <GSImg className='d-none d-xl-block'
                                   src='/assets/images/expired_plan_modal/Developer activity-rafiki.svg' width={350}/>
                            <span className='renewing-plan-modal__wrapper__body__content--title'><GSTrans
                                t='component.renewingPlanModal.title'/></span>
                            <span className='renewing-plan-modal__wrapper__body__content--description'><GSTrans
                                t='component.renewingPlanModal.description'/></span>
                        </div>
                        <div className='renewing-plan-modal__wrapper__body__information'>
                            <GSTrans t='component.expiredPlanModal.information'>
                                Hotline: <a className='renewing-plan-modal__wrapper__body__information--item'
                                            href='tel:+02873030800'>02873030800</a> -
                                Email: <a className='renewing-plan-modal__wrapper__body__information--item'
                                          href='mailto:hotro@gosell.vn'>hotro@gosell.vn</a>
                            </GSTrans>
                        </div>
                    </div>
                </div>
            </div>}
        </>
    )
}

RenewingPlanModal.defaultProps = {
    toggle: false,
    onClose: function () {
    }
}

RenewingPlanModal.propTypes = {
    toggle: bool,
    onClose: func,
}

export default RenewingPlanModal

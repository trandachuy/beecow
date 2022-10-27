import './ExpiredPlanModal.sass'
import React from "react";
import {bool, func} from "prop-types";
import GSTrans from "../GSTrans/GSTrans";
import GSImg from "../GSImg/GSImg";
import {Link} from "react-router-dom";
import {NAV_PATH} from "../../layout/navigation/Navigation";

const ExpiredPlanModal = (props) => {
    const {toggle, onClose} = props

    return (
        <>
            {toggle && <div className="expired-plan-modal">
                <div className="expired-plan-modal__wrapper">
                    <div className="expired-plan-modal__wrapper__body">
                        <div className='expired-plan-modal__wrapper__body__content'>
                            <GSImg className='d-none d-xl-block'
                                   src='/assets/images/expired_plan_modal/404 Error Page not Found.svg' width={400}/>
                            <span className='expired-plan-modal__wrapper__body__content--title'><GSTrans
                                t='component.expiredPlanModal.title'/></span>
                            <span className='expired-plan-modal__wrapper__body__content--description'><GSTrans
                                t='component.expiredPlanModal.description'/></span>
                        </div>
                        <div className="expired-plan-modal__wrapper__body__actions">
                            <Link to={NAV_PATH.settingsPlans} className="gsa-text--non-underline">
                                <button className="expired-plan-modal__wrapper__body__actions--seePlan" onClick={() => {
                                }}>
                                    <GSTrans t='component.expiredPlanModal.seePlan'/>
                                </button>
                            </Link>
                        </div>
                        <span className='expired-plan-modal__wrapper__body__information'>
                            <GSTrans t='component.expiredPlanModal.information'>
                                Hotline: <a className='expired-plan-modal__wrapper__body__information--item'
                                            href='tel:+02873030800'>02873030800</a> -
                                Email: <a className='expired-plan-modal__wrapper__body__information--item'
                                          href='mailto:hotro@gosell.vn'>hotro@gosell.vn</a>
                            </GSTrans>
                        </span>
                    </div>
                </div>
            </div>}
        </>
    )
}

ExpiredPlanModal.defaultProps = {
    toggle: false,
    onClose: function () {
    }
}

ExpiredPlanModal.propTypes = {
    toggle: bool,
    onClose: func,
}

export default ExpiredPlanModal

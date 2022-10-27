import React from "react";
import './AnalyticsOrdersEmptyData.sass';
import GSImg from "../../../../components/shared/GSImg/GSImg";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import PropTypes from "prop-types";

const AnalyticsOrdersEmptyData = props => {
    return (
        <>
            {props.isEmptyData ?
                <div className='d-flex flex-column justify-content-center align-items-center mt-3 mb-3'>
                    <GSImg src='/assets/images/analytics_no_data.png'/>
                    <span className='top-sales-staff__table__no-data'>
                                    <GSTrans t='page.analytics.order.all.noData'/>
                                </span>
                </div>
                : props.children
            }
        </>
    );
};


AnalyticsOrdersEmptyData.propTypes = {
    isEmptyData: PropTypes.bool
};

export default AnalyticsOrdersEmptyData;

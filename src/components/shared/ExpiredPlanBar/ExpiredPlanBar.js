/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 13/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import './ExpiredPlanBar.sass'

import React, {Component} from 'react';
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../layout/navigation/Navigation";
import {withRouter} from "react-router-dom";
import {TokenUtils} from "../../../utils/token";
import GSTrans from "../GSTrans/GSTrans";
import GSButton from "../GSButton/GSButton";
import PropTypes from 'prop-types'

class ExpiredPlanBar extends Component {

    constructor(props) {
        super(props);
        this.isShow = this.isShow.bind(this);
        this.onClickUpgrade = this.onClickUpgrade.bind(this);
    }


    onClickUpgrade() {
        RouteUtils.linkTo(this.props, NAV_PATH.settings)
    }


    isShow() {
        return TokenUtils.hasExpiredPackage(this.props.daysLeft)
    }

    render() {
        return (
            <>
            {this.isShow() &&
            <div className={["expired-plan-bar", this.props.className].join(' ')}>
                <span className="expired-text mr-3 pl-3">
                    <GSTrans t={'component.expiredPlanBar.expiredText'}/>
                </span>
                <GSButton primary onClick={this.onClickUpgrade}>
                    <GSTrans t={'common.btn.view'}/>
                </GSButton>
            </div>
            }
            </>
        );
    }


}

ExpiredPlanBar.defaultProps = {
    daysLeft: 15,
}

ExpiredPlanBar.propTypes = {
    daysLeft: PropTypes.number,
};

export default withRouter(ExpiredPlanBar);


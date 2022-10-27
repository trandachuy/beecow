/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 02/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import {Trans} from "react-i18next";
import s from './LogoutButton.module.sass'
import {Link} from "react-router-dom";
import ConfirmModal from "../../shared/ConfirmModal/ConfirmModal";
import i18next from "i18next";
import PropTypes from 'prop-types'
import {icoLogout} from "../../shared/gsIconsPack/gssvgico";


export default class LogoutButton extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            isSignOutClicked: false
        }

        this.onClickLogout = this.onClickLogout.bind(this)
    }

    onClickLogout() {
        if (this.props.confirmRequired) {
            this.confirm.openModal({
                messages: i18next.t("component.logout.modal.question"),
                okCallback: this.signOut
            })
        } else {
            this.signOut()
        }
    }


    render() {
        return(
            <>
                {/*{ this.state.isSignOutClicked && <Redirect to="/login" />}*/}
                <Link to="/logout">
                    <span className={[s.logoutButton, this.props.className].join(' ')}>
                        <div style={{
                            backgroundImage: `url(${icoLogout})`,
                            width: '1em',
                            height: '1em',
                            backgroundPosition: 'center',
                            backgroundSize: 'contain',
                            marginRight: '.5em'
                        }}>
                        </div>
                        <Trans i18nKey="component.logout.label.logout"/>
                        {/*<FontAwesomeIcon icon="sign-out-alt"*/}
                        {/*className="logout-button__icon"/>*/}
                        {/*<span className="logout-button__text">*/}
                        {/*<Trans i18nKey="component.logout.label.logout"*/}
                        {/*/>*/}
                        {/*</span>*/}
                    </span>
                </Link>
                <ConfirmModal ref={(el) => {this.confirm = el}}/>
            </>
        )
    }

}

LogoutButton.propTypes = {
  confirmRequired: PropTypes.bool
}

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import {UikSelect} from '../../../@uik'
import './LanguageSelector.sass'
import PropTypes from 'prop-types'
import storageService from "../../../services/storage";
import Constants from "../../../config/Constant";
import i18next from "i18next";
import accountService from "../../../services/AccountService";
import {cancelablePromise} from "../../../utils/promise";
import {icoFlagEn, icoFlagVi} from "../../shared/gsIconsPack/gssvgico";

export default class LanguageSelector extends React.Component {

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this)
    }


    async onChange(value) {
        // Update language key to server
        this.pmUpdateLanguage = cancelablePromise(accountService.updateUserLanguage(value.value))
        const result = await this.pmUpdateLanguage.promise

        storageService.setToLocalStorage(Constants.STORAGE_KEY_LANG_KEY, value.value)

        // i18next.changeLanguage(value.value)
        // Refresh page
        if (this.props.onChange) {
            this.props.onChange(value)
        }
        window.location.reload()
    }


    componentWillUnmount() {
        if (this.pmUpdateUserLanguage) this.pmUpdateUserLanguage.cancel()
    }


    render() {
        return (
            <UikSelect
                onChange={this.onChange}
                className={["language-selector", this.props.className].join(' ')}
                position="bottomRight"
                defaultValue={i18next.language}
                options={[
                    {
                        value: 'en',
                        label: (
                            <span>
                                <span className="selected-flag"
                                      style={{background: `url(${icoFlagEn}) no-repeat center`}}/> ENG
                            </span>
                        )
                    },
                    {
                        value: 'vi',
                        label: (
                            <span>
                                <span className="selected-flag"
                                      style={{background: `url(${icoFlagVi}) no-repeat center`}}/> VIE
                            </span>
                        )
                    },
                ]}
            />
        )
    }
}

LanguageSelector.propTypes = {
    onChange: PropTypes.any
}

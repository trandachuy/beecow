/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/06/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './GSLearnMoreFooter.sass'
import GSTrans from "../GSTrans/GSTrans";
import {Link} from "react-router-dom";
import {CredentialUtils} from '../../../utils/credential'

class GSLearnMoreFooter extends Component {
    render() {
        const { className, linkTo, text, style, marginTop,marginBottom, ...other} = this.props
        if (CredentialUtils.isStoreXxxOrGoSell()){
            return <div></div>; 
        }
        return (
            <div className={['gs-learn-more-footer', className].join(' ')} {...other}
                style={{
                    ...style,
                    marginTop: marginTop? '1.5rem':'0',
                    marginBottom: marginBottom? '1.5rem':'0'
                }}
            >
                <img alt="question" className="icon-question" src="/assets/images/question.svg"/>
                <span>
                    <GSTrans t="component.learnMoreFooter.learnMoreAbout"/>
                </span>

                <a href={linkTo} target="_blank">
                    {text}
                </a>
            </div>
        );
    }
}

GSLearnMoreFooter.propTypes = {
    className: PropTypes.string,
    text: PropTypes.string.isRequired,
    linkTo: PropTypes.string.isRequired,
    marginTop: PropTypes.bool,
    marginBottom: PropTypes.bool,
};

export default GSLearnMoreFooter;

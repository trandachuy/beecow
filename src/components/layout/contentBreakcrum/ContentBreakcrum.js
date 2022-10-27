/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 21/4/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */
import React, {Component} from 'react';
import PropTypes from "prop-types";
import './ContentBreakcrum.sass';
import {Link} from "react-router-dom";
import {Trans} from "react-i18next";

export class Breakcrum {
    name;
    url;

    constructor(name, url) {
        this.name = name;
        this.url = url;
    }
}
Breakcrum.propTypes = {
    name: PropTypes.string,
    url: PropTypes.string
};

class ContentBreakcrum extends Component {

    breakcrumList = [];
    constructor(props) {
        super(props);
        this.breakcrumList = props.breakcrumList;
    }

    render() {
        return (
            <span className='gs-breakcrum'>
                {
                    this.props.breakcrumList.map((value, index) => {
                        return index === 0 ?
                            (<span key={index}><Link to={value.url}><Trans i18nKey={value.name} /></Link></span>) :
                            (<span key={index}> / <Link to={value.url}><Trans i18nKey={value.name} /></Link></span>);
                    })
                }
            </span>
        );
    }

    renderItem(index, breakcrumItem) {
        if (index === 0) {
            return (
                <span key={index}>
                    <Link to={breakcrumItem.url}><Trans i18nKey={breakcrumItem.name} /></Link>
                </span>
            );
        }
    }
}
ContentBreakcrum.propTypes = {
   breakcrumList: PropTypes.arrayOf(PropTypes.instanceOf(Breakcrum))
};
export default ContentBreakcrum;

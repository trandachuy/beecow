/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import './GSContentHeader.sass'
import GSContentBody from "../contentBody/GSContentBody";
import {Link} from "react-router-dom";
import GSContentHeaderRightEl from "./ContentHeaderRightEl/GSContentHeaderRightEl";
import GSFakeLink from "../../shared/GSFakeLink/GSFakeLink";

export default class GSContentHeader extends Component {
    render() {
        const {className, titleExpand,navigation, size, title, rightEl, subTitleStyle, backLinkOnClick, backLinkText, subTitle, classSubTitle, ...other} = this.props
        return(
            <div className={['gss-content-header', 'gs-atm__flex-col--flex-center', 'gss-content-header--' + this.props.size, className].join(' ')} {...other}>
                {this.props.navigation &&
                <ul className="navigation">
                    {this.props.navigation.map((nav, index) => {
                        return (
                            <li key={index} > {nav.link ? <Link to={nav.link}>{nav.title}</Link> : <span>{nav.title}</span>}</li>
                        )
                    })}
                </ul>}
                {/*ROW 1*/}
                <div className="gs-atm__flex-row--flex-start gs-atm__flex-align-items--center d-desktop-flex d-mobile-block">
                    { this.props.title &&
                        <>
                            <div>
                                {this.props.overSubTitle}
                                {backLinkText && this.props.backLinkTo &&
                                    <Link to={this.props.backLinkTo} className="color-gray mb-2 d-block">
                                        &#8592; {backLinkText}
                                    </Link>
                                }
                                {backLinkText && !this.props.backLinkTo && backLinkOnClick &&
                                <GSFakeLink onClick={backLinkOnClick} className="color-gray mb-2 d-block gsa-hover--fadeOut cursor--pointer">
                                    &#8592; {backLinkText}
                                </GSFakeLink>
                                }
                                <h5 className="gs-page-title">
                                    {this.props.title}
                                </h5>
                            </div>

                            {this.props.titleExpand &&
                                <span className="title-expand">
                                    {this.props.titleExpand}
                                </span>
                            }
                        </>
                    }
                    {this.props.rightEl? <GSContentHeaderRightEl>{this.props.rightEl}</GSContentHeaderRightEl> : this.props.children}
                </div>

                {/*ROW 2*/}
                { subTitle &&
                    <span className={['sub-title', this.props.classSubTitle, className].join(' ')} style={subTitleStyle}>
                        {subTitle}
                    </span>
                }
            </div>
        )
    }
}

GSContentBody.size = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    EXTRA: 'extra',
    MAX: 'max'
};

GSContentHeader.defaultProps = {
    subTitleStyle: {}
}

GSContentHeader.propTypes = {
    size: PropTypes.oneOf(Object.values(GSContentBody.size)),
    title: PropTypes.any,
    subTitle: PropTypes.any,
    titleExpand: PropTypes.any,
    navigation: PropTypes.array,
    overSubTitle: PropTypes.any,
    backLinkText: PropTypes.string,
    backLinkTo: PropTypes.string,
    backLinkOnClick: PropTypes.func,
    subTitleStyle: PropTypes.object,
    rightEl: PropTypes.any,
    classSubTitle: PropTypes.string,
};

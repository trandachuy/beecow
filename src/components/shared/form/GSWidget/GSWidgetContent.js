/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {UikWidgetContent} from '../../../../@uik'

class GSWidgetContent extends Component {
    state = {
        isShow: !this.props.isCollapsed
    }

    constructor(props) {
        super(props);

        this.collapseToggle = this.collapseToggle.bind(this);
    }


    collapseToggle() {
        this.setState(state => {
            return {
                isShow: !state.isShow
            }

        })
    }

    render() {
        const {className,isCollapsed, ...other} = this.props
        return (
            <>
                {this.state.isShow && <UikWidgetContent className={["gs-widget__content", className].join(' ')} {...other}>
                    {this.props.children}
                </UikWidgetContent>}
            </>
        );
    }
}

GSWidgetContent.propTypes = {
    className: PropTypes.string,
    isCollapsed: PropTypes.bool
};

export default GSWidgetContent;

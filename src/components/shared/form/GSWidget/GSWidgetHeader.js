/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {UikWidgetHeader} from '../../../../@uik'
import GSWidgetHeaderSubtitle from "./GSWidgetHeaderSubtitle";

class GSWidgetHeader extends Component {

    constructor(props) {
        super(props);

        this.state = {
            defaultOpen: this.props.defaultOpen
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.defaultOpen && this.props.defaultOpen !== prevProps.defaultOpen) {
            this.setState({
                defaultOpen: this.props.defaultOpen
            });
        }
    }


    render() {
        const {className, bg, onChangeCollapsedState, showCollapsedButton, onClick, rightEl,...other} = this.props
        return (
            <UikWidgetHeader className={["gs-widget__header", className, bg].join(' ')} {...other}
                             onClick={() => {
                                 if (showCollapsedButton) {
                                     this.setState(state => ({
                                         defaultOpen: !state.defaultOpen
                                     }));
                                     if (onChangeCollapsedState) onChangeCollapsedState()
                                 }
                                 if (onClick) onClick();
                             }}
                             rightEl={rightEl? rightEl:showCollapsedButton &&
                                     <i
                                         className={['collapse-icon-wrapper', this.state.defaultOpen ?  "icon-expand" : "icon-collapse"].join(' ')}
                                     />
                                }
            >
                {this.props.title? this.props.title:this.props.children}
                {this.props.subTitle &&
                <GSWidgetHeaderSubtitle>
                    {this.props.subTitle}
                </GSWidgetHeaderSubtitle>}
            </UikWidgetHeader>
        );
    }
}

GSWidgetHeader.TYPE = {
    GRAY: 'gs-widget__header--gray',
    WHITE: 'gs-widget__header--white'
}

GSWidgetHeader.propTypes = {
    className: PropTypes.string,
    bg: PropTypes.oneOf(Object.values(GSWidgetHeader.TYPE)),
    title: PropTypes.string,
    showCollapsedButton: PropTypes.bool,
    onChangeCollapsedState: PropTypes.func,
    defaultOpen: PropTypes.bool,
    rightEl: PropTypes.any,
    subTitle: PropTypes.any
};

export default GSWidgetHeader;


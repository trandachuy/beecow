/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 15/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import React, {Component} from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import './AlertInline.sass'
import PropTypes from 'prop-types'

class AlertInline extends Component {

    constructor(props) {
        super(props)

        switch (this.props.type) {
            case AlertInlineType.ERROR:
                this.color = '#dc3545'
                this.icon = 'exclamation-circle'
                break
            case AlertInlineType.WARN:
                this.color = '#FF9800'
                this.icon = 'exclamation-triangle'
                break
            case AlertInlineType.SUCCESS:
                this.color = 'green'
                this.icon = 'check-circle'
                break
        }
    }

    render() {
        const {children,hidden,className,icon,nonIcon,padding,textAlign, text, type, style, ...other} = this.props
        return (
            <div style={{color: this.color, padding: this.props.padding? 10:0, ...style}}
                 className={["alert__wrapper",
                     this.props.className,
                     `alert__wrapper--align-${this.props.textAlign}`
                 ].join(' ')}
                 hidden={this.props.hidden}
                 {...other}
            >
                { !this.props.nonIcon &&
                    <FontAwesomeIcon icon={this.icon}/>
                } {this.props.text}
            </div>
        )
    }
}

export const AlertInlineType = {
    ERROR: 'error',
    WARN: 'warn',
    SUCCESS: 'success'
}

AlertInline.defaultProps = {
    textAlign: 'center',
    type: AlertInlineType.SUCCESS,
    padding: true
}


AlertInline.propTypes = {
    className: PropTypes.any,
    icon: PropTypes.string,
    nonIcon: PropTypes.bool,
    text: PropTypes.string,
    textAlign: PropTypes.oneOf(['left','right','center']),
    type: PropTypes.string,
    padding: PropTypes.bool,
    style: PropTypes.any,
}



export default AlertInline

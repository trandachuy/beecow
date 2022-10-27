/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 31/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, { Component } from "react";
import PropTypes from "prop-types";
import GSTooltip, { GSTooltipPlacement } from "../GSTooltip/GSTooltip";
import { Tooltip } from "react-tippy";
import "./GSComponentTooltip.sass";

class GSComponentTooltip extends Component {
    render() {
        return (
            <>
                {this.props.message || this.props.html ? (
                    <>
                        <span
                            className="gs-component-tooltip"
                            onClick={
                                this.props.onClick ? this.props.onClick : null
                            }
                        >
                            <Tooltip
                                disabled={this.props.disabled}
                                arrow
                                title={
                                    this.props.message && !this.props.disabled
                                        ? this.props.message
                                        : null
                                }
                                html={this.props.html ? this.props.html : null}
                                position={
                                    this.props.placement
                                        ? this.props.placement
                                        : GSTooltipPlacement.TOP
                                }
                                animation={
                                    this.props.animation
                                        ? this.props.animation
                                        : GSTooltip.ANIMATION.FADE
                                }
                                interactive={this.props.interactive}
                                theme={this.props.theme}
                                trigger={
                                    this.props.trigger ||
                                    GSComponentTooltipTrigger.MOUSE_ENTER
                                }
                                style={{
                                    display: this.props.display,
                                    ...this.props.style,
                                }}
                                inertia={this.props.inertia}
                                className={this.props.className}
                                open={this.props.open}
                            >
                                {this.props.children}
                            </Tooltip>
                        </span>
                    </>
                ) : (
                    <>{this.props.children}</>
                )}
            </>
        );
    }
}

GSComponentTooltip.defaultProps = {
    display: 'block'
}

GSComponentTooltip.propTypes = {
    ...GSTooltip.propTypes,
    disabled: PropTypes.bool,
    style: PropTypes.string, // set display to block if tooltip show too far
    open: PropTypes.bool,
    display: PropTypes.oneOf(['inline-block', 'block']),
    theme: PropTypes.oneOf(['dark', 'light', 'transparent']),
};

export const GSComponentTooltipPlacement = {
    RIGHT: 'right',
    LEFT: 'left',
    TOP: 'top',
    BOTTOM: 'bottom'
}

export const GSComponentTooltipTrigger = {
    MOUSE_ENTER: 'mouseenter',
    FOCUS: 'focus',
    CLICK: 'click',
    MANUAL: 'manual'
}


export default GSComponentTooltip;


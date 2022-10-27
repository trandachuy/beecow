import React from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'
import './HelpTooltip.sass'
import {Tooltip} from 'react-tippy'

/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 25/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

export default class GSTooltip extends React.Component{

    render() {
        return(
            <div className={"help__wrapper " + (this.props.className? this.props.className:'')}>
                <Tooltip
                    arrow
                    title={this.props.message? this.props.message:null}
                    html={this.props.html? this.props.html:null}
                    position={this.props.placement? this.props.placement:GSTooltipPlacement.RIGHT}
                    animation={this.props.animation? this.props.animation:GSTooltip.ANIMATION.FADE}
                    interactive={this.props.interactive}
                    theme={this.props.theme}
                >

                <FontAwesomeIcon icon={this.props.icon? this.props.icon:GSTooltipIcon.QUESTION_CIRCLE}
                                 // id={'htt-'+id}
                                 style={{color: this.props.color? this.props.color:GSTooltipColor.GREY}}/>

                </Tooltip>
                {/*<UncontrolledTooltip*/}
                {/*    placement={this.props.placement? this.props.placement:GSTooltipPlacement.RIGHT}*/}
                {/*    target={'htt-'+id}*/}
                {/*    >*/}
                {/*    {this.props.message}*/}
                {/*</UncontrolledTooltip>*/}
            </div>
        )
    }

}

GSTooltip.ANIMATION = {
    SHIFT: 'shift',
    PERSPECTIVE: 'perspective',
    FADE: 'fade',
    SCALE: 'scale',
    NONE: 'none'
}

GSTooltip.THEME = {
    DARK: 'dark',
    LIGHT: 'light',
    TRANSPARENT: 'transparent'
}

GSTooltip.PLACEMENT = {
    RIGHT: 'right',
    LEFT: 'left',
    TOP: 'top',
    BOTTOM: 'bottom',
    TOP_LEFT: 'top-start',
    TOP_RIGHT: 'top-end',
    BOTTOM_LEFT: 'bottom-start',
    BOTTOM_RIGHT: 'bottom-end',
}

GSTooltip.propTypes = {
    icon: PropTypes.string,
    message: PropTypes.string,
    placement: PropTypes.oneOf(Object.values(GSTooltip.PLACEMENT)),
    color: PropTypes.string,
    className: PropTypes.string,
    interactive: PropTypes.bool,
    animation: PropTypes.oneOf(Object.values(GSTooltip.ANIMATION)),
    theme: PropTypes.oneOf(Object.values(GSTooltip.THEME)),
    html: PropTypes.any
}



export const GSTooltipPlacement = {
    RIGHT: 'right',
    LEFT: 'left',
    TOP: 'top',
    BOTTOM: 'bottom',
    TOP_LEFT: 'top-start',
    TOP_RIGHT: 'top-end',
    BOTTOM_LEFT: 'bottom-start',
    BOTTOM_RIGHT: 'bottom-end',
}

export const GSTooltipIcon = {
    QUESTION_CIRCLE: 'question-circle',
    INFO_CIRCLE: 'info-circle',
    QUESTION: 'question',
    INFO: 'info'
}

export const GSTooltipColor = {
    WHITE: 'white',
    BLACK: 'black',
    GREY: 'grey'
}

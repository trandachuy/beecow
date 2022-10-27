/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 10/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import {UikTag} from "../../../../@uik";
import {animated, useSpring} from "react-spring";
import {NumberUtils} from "../../../../utils/number-format";
import AnimatedNumber from '../../../shared/AnimatedNumber/AnimatedNumber'

const GSContentHeaderTitleWithExtraTag = props => {
    const {className, extra, title, settingIcon ,...other} = props
    return (
        <div className={["gs-atm__flex-row--flex-start","gs-atm__flex-align-items--center", className].join(' ')} {...other}>
            {title}
            {extra !== undefined &&
            <UikTag style={{backgroundColor: 'white', marginLeft: '.5em'}}>
                   <AnimatedNumber>{props.extra}</AnimatedNumber>
            </UikTag>}
            {settingIcon}
        </div>
    );
};

GSContentHeaderTitleWithExtraTag.propTypes = {
    title: PropTypes.any,
    extra: PropTypes.any,
    className: PropTypes.string,
};

export default GSContentHeaderTitleWithExtraTag;

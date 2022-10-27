/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 20/09/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import './GSModalFullBodyMobile.sass'

const GSModalFullBodyMobile = props => {


    const {className, rightEl, title, ...other} = props
    return (
        <div className={['gs-modal-fullscreen-mobile', 'gs-modal-fullscreen-mobile--open', className].join(' ')} {...other}>
            {title &&
                <div className='gs-modal-fullscreen-mobile__header'>
                    <span className='gs-modal-fullscreen-mobile__title'>
                        {title}
                    </span>
                    <span>
                        {rightEl}
                    </span>
                </div>
            }
            <div className='gs-modal-fullscreen-mobile__body'>
                {props.children}
            </div>
        </div>
    );
};

GSModalFullBodyMobile.propTypes = {
    className: PropTypes.string,
    title: PropTypes.any,
    rightEl: PropTypes.any,
};

export default GSModalFullBodyMobile;

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 07/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import {ImageUtils} from "../../../utils/image";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import './GSButtonUploadFeedBack.sass'

const GSButtonUploadFeedBack = props => {

    const onClickRemove = () => {
        if (props.onRemove) props.onRemove()
    }

    return (
        <div className={['gs-button-upload-feedback', props.className].join(' ')}>
            {props.file && props.file.name && ImageUtils.ellipsisFileName(props.file.name, props.ellipsisAt)}
            {props.file && !props.file.name && ImageUtils.ellipsisFileName(props.file, props.ellipsisAt)}
            {props.src && ImageUtils.ellipsisFileName(props.src, props.ellipsisAt)}
            {props.removable &&
                <FontAwesomeIcon icon="times-circle"
                    className="btn-remove-image"
                                 onClick={onClickRemove}
                />
            }
        </div>
    );
};

GSButtonUploadFeedBack.defaultProps = {
    ellipsisAt: 20,
    removable: true
}

GSButtonUploadFeedBack.propTypes = {
    file: PropTypes.object,
    ellipsisAt: PropTypes.number,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    className: PropTypes.string,
    src: PropTypes.string,
};

export default GSButtonUploadFeedBack;

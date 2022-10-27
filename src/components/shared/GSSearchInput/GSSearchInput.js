/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 21/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, { useImperativeHandle, useRef } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UikInput } from "../../../@uik";

const GSSearchInput = React.forwardRef((props, ref) => {
    const refSearchTimer = useRef(null);
    const refInput = useRef(null);

    useImperativeHandle(ref, () => ({
        clearInput: () => {
            refInput.current.setValue("");
        },
    }));

    const onSearchKeyPress = (e) => {
        const keyword = e.currentTarget.value;
        if ((!keyword && props.ignoreSearchWithBlankKeyword) || (props.maxLength && keyword?.length > props.maxLength)) {
            e.preventDefault();
            return;
        }
        const key = e.key;
        if (key === "Enter") {
            props.onSearch(keyword, e);
        }
        if (props.liveSearchOnMS) {
            clearTimeout(refSearchTimer.current);
            refSearchTimer.current = setTimeout(() => {
                props.onSearch(keyword, e);
            }, props.liveSearchOnMS);
        }
    };

    const {
        ignoreSearchWithBlankKeyword,
        onSearch,
        icon,
        liveSearchOnMS,
        placeholder,
        ...other
    } = props;
    return (
        <UikInput
            onKeyUp={onSearchKeyPress}
            icon={props.icon}
            placeholder={placeholder}
            type={props.type}
            ref={refInput}
            className="clear-up-down-btn"
            {...other}
        />
    );
});

GSSearchInput.defaultProps = {
    icon: <FontAwesomeIcon icon="search"/>,
    ignoreSearchWithBlankKeyword: false,
    placeholder: '',
    type: 'text'
}

GSSearchInput.propTypes = {
    className: PropTypes.string,
    icon: PropTypes.any,
    placeholder: PropTypes.string,
    onSearch: PropTypes.func,
    liveSearchOnMS: PropTypes.number,
    ignoreSearchWithBlankKeyword: PropTypes.bool,
    type: PropTypes.string,
};

export default GSSearchInput;

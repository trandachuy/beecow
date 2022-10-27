/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 13/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, { useState } from "react";
import PropTypes from "prop-types";
import { UikCheckbox } from "../../../@uik";
import "./AvCustomCheckbox.sass";
import { AvGroup, AvInput } from "availity-reactstrap-validation";

const AvCustomCheckbox = (props) => {
    const [stChecked, setStChecked] = useState(props.value);
    const { value, color, label, type, onChange, disabled, ...other } = props;
    return (
        <div
            className={[
                props.classWrapper,
                disabled ? "av-custom-checkbox-disabled" : "",
            ].join(" ")}
        >
            <UikCheckbox
                disabled={disabled}
                defaultChecked={stChecked}
                label={label}
                color={color}
                onChange={(e) => {
                    const checked = e.currentTarget.checked;
                    if (onChange)
                        onChange({
                            ...e,
                            currentTarget: {
                                name: props.name,
                                value: checked,
                            },
                        });
                    setStChecked(checked);
                }}
                className="custom-check-box"
            />
            <label className={"custom-check-box-sub-title"}>
                {props.description}
            </label>

            <AvGroup check hidden>
                <AvInput
                    {...other}
                    key={stChecked}
                    type="checkbox"
                    value={stChecked}
                />
            </AvGroup>
        </div>
    );
};

AvCustomCheckbox.defaultProps = {
    checked: false,
    color: 'green',
};

AvCustomCheckbox.propTypes = {
    checked: PropTypes.bool,
    classWrapper: PropTypes.string,
    color: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    type: PropTypes.any,
    value: PropTypes.bool,
    description: PropTypes.string,
    disabled: PropTypes.bool
};

export default AvCustomCheckbox;

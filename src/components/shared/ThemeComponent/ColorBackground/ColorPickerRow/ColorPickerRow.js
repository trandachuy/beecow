/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import './ColorPickerRow.sass'

const ColorPickerRow = props => {

    const onClickSelectColor = (color) => {
        if (props.onChange) props.onChange(color)
    }

    const {colors, colorSize, onChange, value, className, ...other} = props
    return (
        <div className={["color-picker-row", className].join(' ')} {...other}>
            {colors.map(color => {
                return (
                    <div className={["color-items", value === color.primary? 'active':''].join(' ')} key={color.primary + color.secondary}
                        style={{
                            backgroundColor: `#${color.primary}`,
                            width: colorSize? `${colorSize}px`:undefined,
                            height: colorSize? `${colorSize}px`:undefined,
                        }}
                         onClick={() => onClickSelectColor(color)}
                    >

                    </div>
                )
            })}
        </div>
    );
};

ColorPickerRow.defaultProps = {
    colorSize: 30
}

ColorPickerRow.propTypes = {
    colorSize: PropTypes.number,
    colors: PropTypes.array,
    onChange: PropTypes.func,
    value: PropTypes.any,
    className: PropTypes.string,
}

export default ColorPickerRow;

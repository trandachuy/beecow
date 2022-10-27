import './GSDateTimePicker.sass'

import React, {useState} from "react"
import {any, array, bool, func, instanceOf, oneOf, string} from "prop-types"
import moment from 'moment'
import DateTimeField from "./src/DateTimeField";
import './css/bootstrap-datetimepicker.min.css'

const MODE = {
    MODE_DATE: "date",
    MODE_DATETIME: "datetime",
    MODE_TIME: "time",
}
const VIEW_MODE = {
    DAYS: "days",
    MONTHS: "months",
    YEARS: "years",
}
const SIZE = {
    SM: "sm",
    MD: "md",
    LG: "lg",
}

const GSDateTimePicker = (props) => {
    return (
        <div className='position-relative'>
            <DateTimeField {...props}/>
        </div>
    )
}

GSDateTimePicker.defaultProps = {
    format: 'DD/MM/YYYY',
    inputFormat: 'DD/MM/YYYY',
    onChange: () => {
    }
}

GSDateTimePicker.propTypes = {
    dateTime: string,
    format: string,
    inputFormat: string,
    onChange: func,
    showToday: bool,
    size: oneOf(Object.values(SIZE)),
    daysOfWeekDisabled: array,
    viewMode: oneOf(Object.values(VIEW_MODE)),
    inputProps: any,
    minDate: instanceOf(moment),
    maxDate: instanceOf(moment),
    mode: oneOf(Object.values(MODE)),
    defaultText: string,
}

GSDateTimePicker.SIZE = SIZE
GSDateTimePicker.VIEW_MODE = VIEW_MODE
GSDateTimePicker.MODE = MODE

export default GSDateTimePicker
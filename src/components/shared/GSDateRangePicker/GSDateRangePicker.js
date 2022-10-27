/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/09/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker'
import i18next from "i18next";
import Constants from "../../../config/Constant";
import {CredentialUtils} from "../../../utils/credential";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import moment from "moment";
import PropTypes from "prop-types";
import $ from 'jquery'

/**
 * GSDateRangePicker
 * @description Wrapper component of Bootstrap Date range picker
 *              more options at http://www.daterangepicker.com/#config
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
const GSDateRangePicker = props => {
    const refDateRangePicker = useRef(null);
    const {children, fromDate, toDate,resultToString, containerStyles, onCancel,readOnly,...rest} = props

    /**
     * moment object
     */
    const [stValues, setStValues] = useState({
        fromDate, toDate
    });


    useEffect(() => {
        if (resultToString) {
            setStValues({
                fromDate: fromDate? moment(props.fromDate): fromDate,
                toDate: toDate? moment(props.toDate): toDate
            })
        } else {
            setStValues({
                fromDate: props.fromDate,
                toDate: props.toDate
            })
        }
    }, [props.fromDate, props.toDate]);

    useEffect(() => {
        refineUI({type: 'show'})
    });

    useEffect(() => {
        let scriptTag = document.createElement('script')
        scriptTag.innerHTML = `
            function refineGSDateRangePicker() {
                $('.hourselect').each(function () {
                       $(this).attr('size', 1)
                           .attr('onfocus', 'this.size=5;')
                           .attr('onblur', 'this.size=1;')
                           .attr('onchange', "this.size=1; this.blur(); setTimeout(() => refineGSDateRangePicker(), 200);")
                })
                $('.minuteselect').each(function () {
                       $(this).attr('size', 1)
                           .attr('onfocus', 'this.size=5;')
                           .attr('onblur', 'this.size=1;')
                           .attr('onchange', "this.size=1; this.blur(); setTimeout(() => refineGSDateRangePicker(), 200);")
                })
                $('.calendar-table td').each(function () {
                    $(this).attr('onmousedown', "setTimeout(() => refineGSDateRangePicker(), 200);")
                })
            }
        `
        document.body.appendChild(scriptTag);
    }, []);



    const refineUI = (event) => {
       if (event.type === 'show') {
           $('.hourselect').each(function () {
               $(this).attr('size', 1)
                   .attr('onfocus', 'this.size=5;')
                   .attr('onblur', 'this.size=1;')
                   .attr('onchange', "this.size=1; this.blur(); setTimeout(() => refineGSDateRangePicker(), 200);")
           })
           $('.minuteselect').each(function () {
               $(this).attr('size', 1)
                   .attr('onfocus', 'this.size=5;')
                   .attr('onblur', 'this.size=1;')

           })
           $('.calendar-table td').each(function () {
               $(this).attr('onmousedown', "setTimeout(() => refineGSDateRangePicker(), 200);")

           })
       }

    }

    const getTimePattern = () => {
        let pattern = 'DD-MM-YYYY'
        if (props.timePicker) {
            if (props.timePicker24Hour) {
                pattern = 'HH:mm DD-MM-YYYY'
            } else {
                pattern = 'hh:mmA DD-MM-YYYY'
            }
        }
        return pattern;
    }

    const renderTimePickerText = () => {
        let pattern = getTimePattern()

        if (stValues.fromDate && stValues.toDate) {
            return moment(stValues.fromDate).format(pattern) + ' - ' + moment(stValues.toDate).format(pattern) ;
        }
        if (stValues.fromDate && !stValues.toDate) {
            return stValues.fromDate.format(pattern)
        }
        if (props.timePickerDay){
            return "dd/mm/yyyy";
        }
            return i18next.t("component.order.all.time");
    }

    const onPreApply = (event, picker) => {
        if (resultToString) {
            const fromDate = moment.utc(picker.startDate.set({
                'hour': 0,
                'minute': 0,
                'second': 0,
                'millisecond': 999
            })).format();
            const endDate = moment.utc(picker.endDate.set({
                'hour': 23,
                'minute': 59,
                'second': 59,
                'millisecond': 999
            })).format();
            props.onApply(event, {
                ...picker,
                startDate: fromDate,
                endDate: endDate,
            })
            return
        }
        if (props.onApply) {
            props.onApply(event, picker)
        }
    }

    const onPreCancel = (event, picker) => {
        if (props.onCancel) {
            props.onCancel(event, picker)
        }
    }

    const getContainerStyles = () => {
        let style = {}
        if (props.readOnly) {
            style = {
                cursor: 'pointer'
            }
        }


        return ({
            display: 'inline-block',
            position: 'relative',
            ...containerStyles,
            ...style
        })
    }

    const renderChildren = () => {
        if (typeof(children) === "function") {
            return children(stValues)
        }
        return children
    }

    return (
        <DateRangePicker {...rest}
                        ref={refDateRangePicker}
                         containerStyles={getContainerStyles()}
                         containerClass={props.disabled? 'gs-atm--disable date-ranger-picker':'date-ranger-picker'}
                         onApply={onPreApply}
                         onCancel={onPreCancel}
                         onEvent={refineUI}
                         startDate={stValues.fromDate}
                         endDate={stValues.toDate}
                         locale={{
                             applyLabel: i18next.t("component.order.date.range.apply"),
                             cancelLabel: i18next.t("component.order.date.range.cancel"),
                             ...Constants.DATETIME_PICKER_LOCATE[CredentialUtils.getLangKey().toUpperCase()],
                             ...rest.locale
                         }}
        >
            {children? renderChildren():
                <>
                    <input type="text"
                           value={renderTimePickerText()}
                           className={`form-control ${props.className}`}
                           style={
                               props.readOnly? {
                                   userSelect: 'none',
                                   pointerEvents: 'none',
                               }: {}
                           }
                    />
                    <GSDateRangePicker.CalendarIcon/>
                </>
            }
        </DateRangePicker>
    );
};

GSDateRangePicker.CalendarIcon = () => <FontAwesomeIcon  icon={['far', 'calendar-alt']} color="#939393" style={{
    position: 'absolute',
    right: '1rem',
    top: 'calc(50% - 7px)'
}}/>

GSDateRangePicker.defaultProps = {
    resultToString: false,
    readOnly: false,
    className:''
}

GSDateRangePicker.propTypes = {
    fromDate: PropTypes.any,
    toDate: PropTypes.any,
    resultToString: PropTypes.bool, // time will be set from 00:00:00 to 23:59:59
    onApply: PropTypes.func,
    onCancel: PropTypes.func,
    containerStyles: PropTypes.any,
    readOnly: PropTypes.bool,
    opens: PropTypes.oneOf(['right','left','center']),
    drops: PropTypes.oneOf(['down','up','auto']),
    maxDate: PropTypes.string, // MM/DD/YYYY
    minDate: PropTypes.string, // MM/DD/YYYY
    maxYear: PropTypes.string, // YYYY
    minYear: PropTypes.string, // YYYY
    maxSpan: PropTypes.shape({
        days: PropTypes.number,
    }),
    timePicker: PropTypes.bool,
    timePickerDay: PropTypes.bool,
    timePicker24Hour: PropTypes.bool,
    timePickerSeconds: PropTypes.bool,
    singleDatePicker: PropTypes.bool,
    timePickerIncrement: PropTypes.number,
    disabled: PropTypes.bool,
    input: PropTypes.any,
    className: PropTypes.string
};

export default GSDateRangePicker;

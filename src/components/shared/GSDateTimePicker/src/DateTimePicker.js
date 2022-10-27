import React, { Component } from "react";
import classnames from "classnames";
import DateTimePickerDate from "./DateTimePickerDate.js";
import DateTimePickerTime from "./DateTimePickerTime.js";
import Constants from "./Constants.js";
import {any, array, arrayOf, bool, func, number, oneOf, oneOfType, string} from "prop-types";

export default class DateTimePicker extends Component {
  static propTypes = {
    showDatePicker: bool,
    showTimePicker: bool,
    subtractMonth: func.isRequired,
    addMonth: func.isRequired,
    viewDate: any.isRequired,
    selectedDate: any.isRequired,
    showToday: bool,
    viewMode: oneOfType([
      string,
      number
    ]),
    mode: oneOf([Constants.MODE_DATE, Constants.MODE_DATETIME, Constants.MODE_TIME]),
    daysOfWeekDisabled: array,
    setSelectedDate: func.isRequired,
    subtractYear: func.isRequired,
    addYear: func.isRequired,
    setViewMonth: func.isRequired,
    setViewYear: func.isRequired,
    subtractHour: func.isRequired,
    addHour: func.isRequired,
    subtractMinute: func.isRequired,
    addMinute: func.isRequired,
    addDecade: func.isRequired,
    subtractDecade: func.isRequired,
    togglePeriod: func.isRequired,
    minDate: any,
    maxDate: any,
    widgetClasses: any,
    widgetStyle: any,
    togglePicker: func,
    setSelectedHour: func,
    setSelectedMinute: func
  }

  renderDatePicker = () => {
    if (this.props.showDatePicker) {
      return (
      <li>
        <DateTimePickerDate
              addDecade={this.props.addDecade}
              addMonth={this.props.addMonth}
              addYear={this.props.addYear}
              daysOfWeekDisabled={this.props.daysOfWeekDisabled}
              maxDate={this.props.maxDate}
              minDate={this.props.minDate}
              selectedDate={this.props.selectedDate}
              setSelectedDate={this.props.setSelectedDate}
              setViewMonth={this.props.setViewMonth}
              setViewYear={this.props.setViewYear}
              showToday={this.props.showToday}
              subtractDecade={this.props.subtractDecade}
              subtractMonth={this.props.subtractMonth}
              subtractYear={this.props.subtractYear}
              viewDate={this.props.viewDate}
              viewMode={this.props.viewMode}
        />
      </li>
      );
    }
  }

  renderTimePicker = () => {
    if (this.props.showTimePicker) {
      return (
      <li>
        <DateTimePickerTime
              addHour={this.props.addHour}
              addMinute={this.props.addMinute}
              mode={this.props.mode}
              selectedDate={this.props.selectedDate}
              setSelectedHour={this.props.setSelectedHour}
              setSelectedMinute={this.props.setSelectedMinute}
              subtractHour={this.props.subtractHour}
              subtractMinute={this.props.subtractMinute}
              togglePeriod={this.props.togglePeriod}
              viewDate={this.props.viewDate}
        />
      </li>
      );
    }
  }

  renderSwitchButton = () => {
      return this.props.mode === Constants.MODE_DATETIME ?
          (
              <li>
                <span className="btn picker-switch" onClick={this.props.togglePicker} style={{width: "100%"}} ><i className={classnames("fa", this.props.showTimePicker ? "fa-calendar" : "fa-clock-o")} style={{color: '#939393'}}/></span>
              </li>
          ) :
          null;
  }

  render() {
    return (
      <div className={classnames(this.props.widgetClasses)} style={this.props.widgetStyle}>

        <ul className="list-unstyled">

          {this.renderDatePicker()}

          {this.renderSwitchButton()}

          {this.renderTimePicker()}

        </ul>

      </div>

    );
  }
}


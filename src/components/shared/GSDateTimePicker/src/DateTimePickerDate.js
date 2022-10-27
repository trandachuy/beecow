import React, { Component } from "react";
import DateTimePickerDays from "./DateTimePickerDays";
import DateTimePickerMonths from "./DateTimePickerMonths";
import DateTimePickerYears from "./DateTimePickerYears";
import {any, array, arrayOf, bool, func, number, oneOf, oneOfType, string} from "prop-types";

export default class DateTimePickerDate extends Component {
  static propTypes = {
    subtractMonth: func.isRequired,
    addMonth: func.isRequired,
    viewDate: any.isRequired,
    selectedDate: any.isRequired,
    showToday: bool,
    viewMode: oneOfType([
      string,
      number
    ]),
    daysOfWeekDisabled: array,
    setSelectedDate: func.isRequired,
    subtractYear: func.isRequired,
    addYear: func.isRequired,
    setViewMonth: func.isRequired,
    setViewYear: func.isRequired,
    addDecade: func.isRequired,
    subtractDecade: func.isRequired,
    minDate: any,
    maxDate: any
  }

  constructor(props) {
    super(props);
    const viewModes = {
      "days": {
        daysDisplayed: true,
        monthsDisplayed: false,
        yearsDisplayed: false
      },
      "months": {
        daysDisplayed: false,
        monthsDisplayed: true,
        yearsDisplayed: false
      },
      "years": {
        daysDisplayed: false,
        monthsDisplayed: false,
        yearsDisplayed: true
      }
    };
    this.state = viewModes[this.props.viewMode] || viewModes[Object.keys(viewModes)[this.props.viewMode]] || viewModes.days;
  }

  showMonths = () => {
    return this.setState({
      daysDisplayed: false,
      monthsDisplayed: true
    });
  }

  showYears = () => {
    return this.setState({
      monthsDisplayed: false,
      yearsDisplayed: true
    });
  }

  setViewYear = (e) => {
    this.props.setViewYear(e.target.innerHTML);
    return this.setState({
      yearsDisplayed: false,
      monthsDisplayed: true
    });
  }

  setViewMonth = (e) => {
    this.props.setViewMonth(e.target.innerHTML);
    return this.setState({
      monthsDisplayed: false,
      daysDisplayed: true
    });
  }

  renderDays = () => {
    if (this.state.daysDisplayed) {
      return (
      <DateTimePickerDays
            addMonth={this.props.addMonth}
            daysOfWeekDisabled={this.props.daysOfWeekDisabled}
            maxDate={this.props.maxDate}
            minDate={this.props.minDate}
            selectedDate={this.props.selectedDate}
            setSelectedDate={this.props.setSelectedDate}
            showMonths={this.showMonths}
            showToday={this.props.showToday}
            subtractMonth={this.props.subtractMonth}
            viewDate={this.props.viewDate}
      />
      );
    } else {
      return null;
    }
  }

  renderMonths = () => {
    if (this.state.monthsDisplayed) {
      return (
      <DateTimePickerMonths
            addYear={this.props.addYear}
            selectedDate={this.props.selectedDate}
            setViewMonth={this.setViewMonth}
            showYears={this.showYears}
            subtractYear={this.props.subtractYear}
            viewDate={this.props.viewDate}
      />
      );
    } else {
      return null;
    }
  }

  renderYears = () => {
    if (this.state.yearsDisplayed) {
      return (
      <DateTimePickerYears
            addDecade={this.props.addDecade}
            selectedDate={this.props.selectedDate}
            setViewYear={this.setViewYear}
            subtractDecade={this.props.subtractDecade}
            viewDate={this.props.viewDate}
      />
      );
    } else {
      return null;
    }
  }

  render() {
    return (
    <div className="datepicker">
      {this.renderDays()}

      {this.renderMonths()}

      {this.renderYears()}
    </div>
    );
  }
}


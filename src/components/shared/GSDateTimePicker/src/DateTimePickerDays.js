import React, { Component } from "react";
import moment from "moment";
import classnames from "classnames";
import {any, array, arrayOf, bool, func, number, oneOf, oneOfType, string} from "prop-types";

export default class DateTimePickerDays extends Component {
  static propTypes = {
    subtractMonth: func.isRequired,
    addMonth: func.isRequired,
    viewDate: any.isRequired,
    selectedDate: any.isRequired,
    showToday: bool,
    daysOfWeekDisabled: array,
    setSelectedDate: func.isRequired,
    showMonths: func.isRequired,
    minDate: any,
    maxDate: any
  }

  static defaultProps = {
    showToday: true
  }

  renderDays = () => {
    var cells, classes, days, html, month, nextMonth, prevMonth, minDate, maxDate, row, year;
    year = this.props.viewDate.year();
    month = this.props.viewDate.month();
    prevMonth = this.props.viewDate.clone().subtract(1, "months");
    days = prevMonth.daysInMonth();
    prevMonth.date(days).startOf("week");
    nextMonth = moment(prevMonth).clone().add(42, "d");
    minDate = this.props.minDate ? this.props.minDate.clone().subtract(1, "days") : this.props.minDate;
    maxDate = this.props.maxDate ? this.props.maxDate.clone() : this.props.maxDate;
    html = [];
    cells = [];
    while (prevMonth.isBefore(nextMonth)) {
      classes = {
        day: true
      };
      if (prevMonth.year() < year || (prevMonth.year() === year && prevMonth.month() < month)) {
        classes.old = true;
      } else if (prevMonth.year() > year || (prevMonth.year() === year && prevMonth.month() > month)) {
        classes.new = true;
      }
      if (prevMonth.isSame(moment({
        y: this.props.selectedDate.year(),
        M: this.props.selectedDate.month(),
        d: this.props.selectedDate.date()
      }))) {
        classes.active = true;
      }
      if (this.props.showToday) {
        if (prevMonth.isSame(moment(), "day")) {
          classes.today = true;
        }
      }
      if ((minDate && prevMonth.isBefore(minDate)) || (maxDate && prevMonth.isAfter(maxDate))) {
        classes.disabled = true;
      }
      if (this.props.daysOfWeekDisabled.length > 0) classes.disabled = this.props.daysOfWeekDisabled.indexOf(prevMonth.day()) !== -1;
      cells.push(<td className={classnames(classes)} key={prevMonth.month() + "-" + prevMonth.date()} onClick={this.props.setSelectedDate}>{prevMonth.date()}</td>);
      if (prevMonth.weekday() === moment().endOf("week").weekday()) {
        row = <tr key={prevMonth.month() + "-" + prevMonth.date()}>{cells}</tr>;
        html.push(row);
        cells = [];
      }
      prevMonth.add(1, "d");
    }
    return html;
  }

  render() {
    return (
    <div className="datepicker-days" style={{display: "block"}}>
        <table className="table-condensed">
          <thead>
            <tr>
              <th className="prev" onClick={this.props.subtractMonth}><i className="fa fa-chevron-left" style={{color: '#939393'}}/></th>

              <th className="switch" colSpan="5" onClick={this.props.showMonths}>{moment.months()[this.props.viewDate.month()]} {this.props.viewDate.year()}</th>

              <th className="next" onClick={this.props.addMonth}><i className="fa fa-chevron-right" style={{color: '#939393'}}/></th>
            </tr>

            <tr>
              <th className="dow">Su</th>

              <th className="dow">Mo</th>

              <th className="dow">Tu</th>

              <th className="dow">We</th>

              <th className="dow">Th</th>

              <th className="dow">Fr</th>

              <th className="dow">Sa</th>
            </tr>
          </thead>

          <tbody>
            {this.renderDays()}
          </tbody>
        </table>
      </div>
    );
  }
}


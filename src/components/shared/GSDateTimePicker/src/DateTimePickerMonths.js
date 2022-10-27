import React, { Component } from "react";
import classnames from "classnames";
import moment from "moment";
import {any, array, arrayOf, bool, func, number, oneOf, oneOfType, string} from "prop-types";

export default class DateTimePickerMonths extends Component {
  static propTypes = {
    subtractYear: func.isRequired,
    addYear: func.isRequired,
    viewDate: any.isRequired,
    selectedDate: any.isRequired,
    showYears: func.isRequired,
    setViewMonth: func.isRequired
  }

  renderMonths = () => {
    var classes, i, month, months, monthsShort;
    month = this.props.selectedDate.month();
    monthsShort = moment.monthsShort();
    i = 0;
    months = [];
    while (i < 12) {
      classes = {
        month: true,
        "active": i === month && this.props.viewDate.year() === this.props.selectedDate.year()
      };
      months.push(<span className={classnames(classes)} key={i} onClick={this.props.setViewMonth}>{monthsShort[i]}</span>);
      i++;
    }
    return months;
  }

  render() {
    return (
    <div className="datepicker-months" style={{display: "block"}}>
          <table className="table-condensed">
            <thead>
              <tr>
                <th className="prev" onClick={this.props.subtractYear}>‹</th>

                <th className="switch" colSpan="5" onClick={this.props.showYears}>{this.props.viewDate.year()}</th>

                <th className="next" onClick={this.props.addYear}>›</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="7">{this.renderMonths()}</td>
              </tr>
            </tbody>
          </table>
        </div>
    );
  }
}


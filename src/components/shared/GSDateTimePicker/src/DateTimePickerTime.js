import React, { Component } from "react";
import DateTimePickerMinutes from "./DateTimePickerMinutes";
import DateTimePickerHours from "./DateTimePickerHours";
import Constants from "./Constants.js";
import {any, array, arrayOf, bool, func, number, oneOf, oneOfType, string} from "prop-types";

export default class DateTimePickerTime extends Component {
  static propTypes = {
    setSelectedHour: func.isRequired,
    setSelectedMinute: func.isRequired,
    subtractHour: func.isRequired,
    addHour: func.isRequired,
    subtractMinute: func.isRequired,
    addMinute: func.isRequired,
    viewDate: any.isRequired,
    selectedDate: any.isRequired,
    togglePeriod: func.isRequired,
    mode: oneOf([Constants.MODE_DATE, Constants.MODE_DATETIME, Constants.MODE_TIME])
  }

  state = {
    minutesDisplayed: false,
    hoursDisplayed: false
  }

  goBack = () => {
    return this.setState({
      minutesDisplayed: false,
      hoursDisplayed: false
    });
  }

  showMinutes = () => {
    return this.setState({
      minutesDisplayed: true
    });
  }

  showHours = () => {
    return this.setState({
      hoursDisplayed: true
    });
  }

  renderMinutes = () => {
    if (this.state.minutesDisplayed) {
      return <DateTimePickerMinutes {...this.props} onSwitch={this.goBack} />;
    } else {
      return null;
    }
  }

  renderHours = () => {
    if (this.state.hoursDisplayed) {
      return <DateTimePickerHours {...this.props} onSwitch={this.goBack} />;
    } else {
      return null;
    }
  }

  renderPicker = () => {
    if (!this.state.minutesDisplayed && !this.state.hoursDisplayed) {
      return (
      <div className="timepicker-picker">
        <table className="table-condensed">
          <tbody>
            <tr>
              <td><a className="btn" style={{
                height: 'fit-content',
                width: 'fit-content',
                boxShadow: 'none',
              }} onClick={this.props.addHour}><span className="fa fa-chevron-up" style={{color: '#939393'}}/></a></td>

              <td className="separator"></td>

              <td><a className="btn" style={{
                height: 'fit-content',
                width: 'fit-content',
                boxShadow: 'none',
              }} onClick={this.props.addMinute}><span className="fa fa-chevron-up" style={{color: '#939393'}}/></a></td>

              <td className="separator"></td>
            </tr>

            <tr>
              <td><span className="timepicker-hour" onClick={this.showHours}>{this.props.selectedDate.format("h")}</span></td>

              <td className="separator">:</td>

              <td><span className="timepicker-minute" onClick={this.showMinutes}>{this.props.selectedDate.format("mm")}</span></td>

              <td className="separator"></td>

              <td style={{
                width: '54px',
                height: '54px',
                padding: '5px'
              }}>
                <button className="btn btn-primary" style={{minWidth: 0}} onClick={this.props.togglePeriod}
                        type="button">{this.props.selectedDate.format("A")}</button>
              </td>
            </tr>

            <tr>
              <td><a className="btn" style={{
                height: 'fit-content',
                width: 'fit-content',
                boxShadow: 'none',
              }} onClick={this.props.subtractHour}><span className="fa fa-chevron-down" style={{color: '#939393'}}/></a></td>

              <td className="separator"></td>

              <td><a className="btn" style={{
                height: 'fit-content',
                width: 'fit-content',
                boxShadow: 'none',
              }} onClick={this.props.subtractMinute}><span className="fa fa-chevron-down" style={{color: '#939393'}}/></a></td>

              <td className="separator"></td>
            </tr>
          </tbody>
        </table>
      </div>
      );
    } else {
      return "";
    }
  }

  render() {
    return (
        <div className="timepicker">
          {this.renderPicker()}

          {this.renderHours()}

          {this.renderMinutes()}
        </div>
    );
  }
}

module.exports = DateTimePickerTime;

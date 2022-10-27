import React, { Component } from "react";
import Constants from "./Constants.js";
import {any, array, arrayOf, bool, func, number, oneOf, oneOfType, string} from "prop-types";

export default class DateTimePickerHours extends Component {
  static propTypes = {
    setSelectedHour: func.isRequired,
    onSwitch: func.isRequired,
    mode: string.isRequired
  }

  renderSwitchButton = () => {
    return this.props.mode === Constants.MODE_TIME ?
        (
            <ul className="list-unstyled">
              <li>
                <span className="btn picker-switch" onClick={this.props.onSwitch} style={{width: "100%"}} ><i className="fa fa-clock-o" style={{color: '#939393'}}/></span>
              </li>
            </ul>
        ) :
        null;
  }

  render() {
    return (
      <div className="timepicker-hours" data-action="selectHour" style={{display: "block"}}>
        {this.renderSwitchButton()}
        <table className="table-condensed">
          <tbody>
            <tr>
              <td className="hour" onClick={this.props.setSelectedHour}>01</td>

              <td className="hour" onClick={this.props.setSelectedHour}>02</td>

              <td className="hour" onClick={this.props.setSelectedHour}>03</td>

              <td className="hour" onClick={this.props.setSelectedHour}>04</td>
            </tr>

            <tr>
              <td className="hour" onClick={this.props.setSelectedHour}>05</td>

              <td className="hour" onClick={this.props.setSelectedHour}>06</td>

              <td className="hour" onClick={this.props.setSelectedHour}>07</td>

              <td className="hour" onClick={this.props.setSelectedHour}>08</td>
            </tr>

            <tr>
              <td className="hour" onClick={this.props.setSelectedHour}>09</td>

              <td className="hour" onClick={this.props.setSelectedHour}>10</td>

              <td className="hour" onClick={this.props.setSelectedHour}>11</td>

              <td className="hour" onClick={this.props.setSelectedHour}>12</td>
            </tr>

            <tr>
              <td className="hour" onClick={this.props.setSelectedHour}>13</td>

              <td className="hour" onClick={this.props.setSelectedHour}>14</td>

              <td className="hour" onClick={this.props.setSelectedHour}>15</td>

              <td className="hour" onClick={this.props.setSelectedHour}>16</td>
            </tr>

            <tr>
              <td className="hour" onClick={this.props.setSelectedHour}>17</td>

              <td className="hour" onClick={this.props.setSelectedHour}>18</td>

              <td className="hour" onClick={this.props.setSelectedHour}>19</td>

              <td className="hour" onClick={this.props.setSelectedHour}>20</td>
            </tr>

            <tr>
              <td className="hour" onClick={this.props.setSelectedHour}>21</td>

              <td className="hour" onClick={this.props.setSelectedHour}>22</td>

              <td className="hour" onClick={this.props.setSelectedHour}>23</td>

              <td className="hour" onClick={this.props.setSelectedHour}>24</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}


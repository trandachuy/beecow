import React from "react";
import PropTypes from "prop-types";
import Label from "reactstrap/es/Label";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index";
import AvFieldLink from "../../../../components/shared/form/LinkAvField/AvFieldLink";


export default class SocialRow extends React.Component{

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    onChange(e, v) {
        if (this.props.onChange) {
            this.props.onChange(v);
        }
    }

    onBlur(e, v) {
        if (this.props.onBlur) {
            this.props.onBlur(this.props.name, v);
        }
    }

    render() {
        return (
            <div className={'row-social ' + this.props.name.toLowerCase()}>
                <span className={'icon'}>
                    <FontAwesomeIcon icon={this.props.faIcon} size={this.props.faSize} color={this.props.faColor}/>
                </span>
                <Label for={this.props.name} className="gs-frm-control__title">
                    {this.props.title}
                </Label>
                <AvFieldLink name={this.props.name}
                             value={this.props.value}
                             onBlur={this.onBlur}
                             onChange={this.onChange}
                             extendPattern={this.props.extendPattern}
                />
            </div>
        );
    }

}

SocialRow.propTypes = {
  extendPattern: PropTypes.string,
  faColor: PropTypes.string,
  faIcon: PropTypes.object,
  faSize: PropTypes.string,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onInputUrlBlur: PropTypes.func,
  title: PropTypes.string,
  value: PropTypes.string
}

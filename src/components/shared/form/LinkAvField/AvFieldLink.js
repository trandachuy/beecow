import React from "react";
import {AvField} from "availity-reactstrap-validation";
import Constants from "../../../../config/Constant";
import PropTypes from "prop-types";
import i18next from "../../../../config/i18n";


export default class AvFieldLink extends React.Component{

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
            <AvField value={this.props.value}
                     name={this.props.name}
                     onChange={this.onChange}
                     onBlur={this.onBlur}
                     validate={{
                         required: {value: this.props.isRequired ? this.props.isRequired : false,
                             errorMessage: i18next.t("common.validation.required")},
                         url: {
                             value: true,
                             errorMessage: this.props.msg ? this.props.msg : i18next.t('common.validation.invalid.url.format')
                         },
                         pattern: {
                             value: this.props.extendPattern ? this.props.extendPattern : Constants.EXTEND_URL_PATTERN,
                             errorMessage: this.props.msgPattern ? this.props.msgPattern : i18next.t('common.validation.invalid.url.format')
                         },
                         maxLength: {
                             value: this.props.maxLength ? this.props.maxLength : 255,
                             errorMessage: i18next.t('common.validation.char.max.length', {x: this.props.maxLength ? this.props.maxLength : 255})
                         }
                     }} />
        );
    }

}

AvFieldLink.propTypes = {
  extendPattern: PropTypes.string,
  isRequired: PropTypes.bool,
  maxLength: PropTypes.number,
  msg: PropTypes.string,
  msgPattern: PropTypes.string,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  value: PropTypes.string
}

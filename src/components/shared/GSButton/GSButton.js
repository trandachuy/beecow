/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/07/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import PropTypes from "prop-types";
import "./GSButton.sass";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Link} from "react-router-dom";

const GSButton = (props) => {
  const mapPropsToColor = () => {
    let prefix = "gs-button__";
    if (props.color) {
      return prefix + props.color;
    }
    if (props.theme) {
      return prefix + props.theme;
    }

    if (props.primary) {
      return prefix + GSButton.THEME.PRIMARY;
    }
    if (props.success) {
      return prefix + GSButton.THEME.SUCCESS;
    }
    if (props.secondary) {
      return prefix + GSButton.THEME.SECONDARY;
    }
    if (props.warning) {
      return prefix + GSButton.THEME.WARN;
    }
    if (props.danger) {
      return prefix + GSButton.THEME.DANGER;
    }
    if (props.info) {
      return prefix + GSButton.THEME.INFO;
    }
    if (props.default) {
      return prefix + GSButton.THEME.DEFAULT;
    }

    return prefix + GSButton.THEME.DEFAULT;
  };

  const onClick = (e) => {
    if (props.preventDefault) {
      e.preventDefault();
    }
    if (props.onClick) props.onClick(e);
  };

  const {
    color,
    theme,
    type,
    className,
    disabled,
    success,
    primary,
    marginLeftRight,
    marginTopBottom,
    marginTop,
    outline,
    info,
    danger,
    warning,
    direction,
    icon,
    marginAll,
    marginBottom,
    marginLeft,
    marginRight,
    secondary,
    buttonType,
    size,
    linkToTarget,
    linkToStyle,
    linkToClassName,
    ...other
  } = props;
  const btnClass = mapPropsToColor();
  const renderMainButton = () => (
    <button
      id={props.id}
      type={props.buttonType}
      className={[
        "gs-button",
        disabled ? "gs-atm--disable" : "",
        btnClass +
          (type === GSButton.TYPE.OUTLINE || props.outline ? "--outline" : ""),
        `gs-button--${props.size}`,
        className,
      ].join(" ")}
      style={{
        margin: props.marginAll
          ? ".5em"
          : props.marginTopBottom
          ? ".5em 0"
          : props.marginLeftRight
          ? "0 .5em"
          : "0",
        marginTop: props.marginTop ? ".5em" : "0",
        marginRight: props.marginRight ? ".5em" : "0",
        marginBottom: props.marginBottom ? ".5em" : "0",
        marginLeft: props.marginLeft ? ".5em" : "0",
        display: "flex",
        flexDirection: props.flexDirection ? props.flexDirection : "row",
        alignItems: "center",
        justifyContent: "space-around",
        ...props.style,
      }}
      onClick={onClick}
      {...other}
    >
      <div
        style={{
          display: "flex",
          flexDirection: props.flexDirection ? props.flexDirection : "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {props.icon && (
          <span style={{ marginRight: ".5em" }}>{props.icon}</span>
        )}
        {props.children}
        {props.dropdownIcon && (
          <FontAwesomeIcon
            icon={"sort-down"}
            color="white"
            className="ml-2"
            style={{
              paddingBottom: ".2rem",
            }}
          />
        )}
      </div>
    </button>
  );

  return (
      props.linkTo?
        <Link to={props.linkTo} className={"gsa-text--non-underline " + props.linkToClassName} target={props.linkToTarget} style={props.linkToStyle}>
          {renderMainButton()}
        </Link>
      :
        renderMainButton()
  )
};

GSButton.COLOR = {
  BLUE: "blue",
  GREEN: "green",
  CYAN: "cyan",
  RED: "red",
  YELLOW: "yellow",
  BLACK: "black",
  GRAY: "gray",
  WHITE: "white",
};
GSButton.THEME = {
  PRIMARY: "blue",
  SECONDARY: "gray",
  SUCCESS: "green",
  DANGER: "red",
  WARN: "yellow",
  INFO: "cyan",
  DEFAULT: "white",
};
GSButton.TYPE = {
  SOLID: "solid",
  OUTLINE: "outline",
};

GSButton.DIRECTION = {
  ROW: "row",
  COLUMN: "column",
};

GSButton.defaultProps = {
  linkToClassName: ''
}

GSButton.propTypes = {
  color: PropTypes.oneOf(Object.values(GSButton.COLOR)),
  theme: PropTypes.oneOf(Object.values(GSButton.THEME)),
  type: PropTypes.oneOf(Object.values(GSButton.TYPE)),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.any,
  direction: PropTypes.oneOf(Object.values(GSButton.DIRECTION)),

  primary: PropTypes.bool,
  success: PropTypes.bool,
  warning: PropTypes.bool,
  info: PropTypes.bool,
  danger: PropTypes.bool,
  secondary: PropTypes.bool,
  buttonType: PropTypes.string,
  default: PropTypes.bool,
  outline: PropTypes.bool,

  marginAll: PropTypes.bool,
  marginTopBottom: PropTypes.bool,
  marginLeftRight: PropTypes.bool,
  marginLeft: PropTypes.bool,
  marginRight: PropTypes.bool,
  marginTop: PropTypes.bool,
  marginBottom: PropTypes.bool,

  dropdownIcon: PropTypes.bool,
  size: PropTypes.oneOf(["small", "normal", "large"]),
  id: PropTypes.string,
  style: PropTypes.object,
  preventDefault: PropTypes.bool,
  linkTo: PropTypes.string,
  linkToTarget: PropTypes.string,
  linkToStyle: PropTypes.object,
  linkToClassName: PropTypes.string,
};

export default GSButton;

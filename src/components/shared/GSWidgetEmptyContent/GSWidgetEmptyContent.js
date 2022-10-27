/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 25/09/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import PropTypes from "prop-types";
import "./GSWidgetEmptyContent.sass";

const verticalStyle = {
    wrapper: {
        display: "flex",
        flexDirection: "column",
    },
    img: {
        width: "70px",
        marginBottom: "1rem",
    },
};

const horizontalStyle = {
  wrapper: {
    display: 'flex',
    flexDirection: 'row'
  },
  img: {
    width: '25px',
    marginRight: '.5rem'
  }
}

const GSWidgetEmptyContent = (props) => {
  const onClick = () => {
    if (props.onClick) {
      props.onClick();
    }
  };

  const wrapperStyle = props.mode === 'vertical'? verticalStyle.wrapper:horizontalStyle.wrapper
  const imgStyle = props.mode === 'vertical'? verticalStyle.img:horizontalStyle.img

  const { className, iconSrc, text, ...other } = props;
  return (
    <div
      className={[
        "gs-widget-empty-content gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center",
        className,
      ].join(" ")}
      {...other}
    >
      <div
        className="gs-widget-empty-content__content-wrapper"
        onClick={onClick}
        style={{
          ...wrapperStyle,
          cursor: props.onClick ? "pointer" : "",
        }}
      >
        <img
          src={iconSrc}
          className="gs-widget-empty-content__icon"
          alt="empty-icon"
          style={{
            ...imgStyle
          }}
        />
        <span className="gs-widget-empty-content__text">{text}</span>
      </div>
    </div>
  );
};

GSWidgetEmptyContent.defaultProps = {
  mode: 'vertical'
}

GSWidgetEmptyContent.propTypes = {
    iconSrc: PropTypes.string,
    text: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
    style: PropTypes.object,
    mode: PropTypes.oneOf(['vertical', 'horizontal'])
};

export default GSWidgetEmptyContent;

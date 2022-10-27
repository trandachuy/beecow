/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 25/09/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import PropTypes from "prop-types";
import Loading, {LoadingStyle} from "../Loading/Loading";


const GSWidgetLoadingContent = (props) => {
  const { className, iconSrc, text, style, loadingStyle, ...other } = props;
  return (
    <div
      className={[
        "gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center",
        className,
      ].join(" ")}
      {...other}
        style={{
          ...style,
          margin: '0 -14px -14px -14px'
        }}
    >
        <Loading style={loadingStyle}/>
    </div>
  );
};

GSWidgetLoadingContent.defaultProps = {
  loadingStyle: LoadingStyle.DUAL_RING_GREY
}

GSWidgetLoadingContent.propTypes = {
  className: PropTypes.string,
  loadingStyle: PropTypes.string,
};

export default GSWidgetLoadingContent;

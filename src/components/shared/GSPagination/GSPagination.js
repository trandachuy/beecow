/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import PropTypes from "prop-types";
import PagingTable from "../table/PagingTable/PagingTable";

const GSPagination = (props) => {
  return (
    <PagingTable
      totalItems={props.totalItem}
      totalPage={Math.ceil(props.totalItem / props.pageSize)}
      maxShowedPage={props.maxShowedPage}
      onChangePage={props.onChangePage}
      currentPage={props.currentPage}
      className={props.className}
      style={props.style}
    />
  );
};

GSPagination.defaultProps = {
  pageSize: 20,
  maxShowedPage: 10,
  currentPage: 1,
  onChangePage: () => {},
};

GSPagination.propTypes = {
  /**
   * @description total
   */
  totalItem: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  maxShowedPage: PropTypes.number,
  onChangePage: PropTypes.func,
  currentPage: PropTypes.number,
  style: PropTypes.object,
  className: PropTypes.string
};

export default GSPagination;

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 25/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import PropTypes from "prop-types";
import "../PagingTable/PagingTable.sass";

/**
 * @deprecated
 * @param props
 * @return {*}
 * @constructor
 */
const GSPagination = (props) => {
  const onChangePage = (page) => {
    return props.onChangePage(page + props.pageOffset);
  };

  const renderPageNumber = () => {
    const totalPage = props.totalPage;
    const currentPage = props.currentPage - props.pageOffset;
    const maxPage = props.maxShowedPage;

    if (totalPage === 1) return;

    let btnPageList = [];

    // previous btn
    if (currentPage > 1) {
      btnPageList.push(
        <li
          className={
            "page-item " + (currentPage === 1 ? "page-item--disable" : "")
          }
          key={"pre-btn"}
          onClick={() => onChangePage(currentPage - 1)}
        >
          <a
            className={
              "page-link " + (currentPage === 1 ? "page-link--disable" : "")
            }
            aria-label="Previous"
          >
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
      );
    }

    const pushPageToList = (pageNumber) => {
      btnPageList.push(
        <li
          className={
            "page-item " + (currentPage === pageNumber ? "active" : "")
          }
          onClick={() => onChangePage(pageNumber)}
          key={pageNumber}
        >
          <a className="page-link">{pageNumber}</a>
        </li>
      );
    };

    const pushDivider = () => {
      btnPageList.push(
        <li className="page-item page-item--disable" key={"blank"}>
          <a className="page-link page-link--disable">...</a>
        </li>
      );
    };

    // page list
    if (totalPage <= maxPage) {
      for (let i = 0; i < totalPage; i++) {
        btnPageList.push(
          <li
            className={"page-item " + (currentPage === i + 1 ? "active" : "")}
            key={i + 1}
            onClick={() => onChangePage(i + 1)}
          >
            <a className="page-link">{i + 1}</a>
          </li>
        );
      }
    } else {
      const half = maxPage / 2;
      const half2 = Math.floor(half / 2);
      const half4 = Math.floor(half2 / 2);
      const padding = 1;
      const paddingMiddle = 2;
      let lastIndex = 0,
        lastIndex2 = 0;

      // padding first
      if (currentPage > padding) {
        for (let i = 1; i <= padding; i++) {
          lastIndex = i;
          pushPageToList(i);
        }
      }

      pushDivider();

      // find around
      for (
        let i = currentPage - paddingMiddle;
        i < currentPage + paddingMiddle;
        i++
      ) {
        if (i - lastIndex === 1) btnPageList.pop();
        if (i < 1 || i > totalPage) continue;
        if (
          (currentPage > padding && i <= padding) ||
          (currentPage <= totalPage - padding && i > totalPage - padding)
        )
          continue;
        pushPageToList(i);
        lastIndex2 = i;
      }

      if (lastIndex2 < totalPage - padding) {
        pushDivider();
      }

      // padding last
      if (currentPage <= totalPage - padding) {
        for (let i = totalPage - (padding - 1); i <= totalPage; i++) {
          pushPageToList(i);
        }
      }
    }

    // next btn
    if (currentPage < totalPage) {
      btnPageList.push(
        <li
          className={
            "page-item " +
            (currentPage === totalPage ? "page-item--disable" : "")
          }
          key={"next-btn"}
          onClick={() => onChangePage(currentPage + 1)}
        >
          <a
            className={
              "page-link " +
              (currentPage === totalPage ? "page-link--disable" : "")
            }
            aria-label="Next"
          >
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      );
    }

    return btnPageList;
  };

  const {
    className,
    currentPage,
    maxShowedPage,
    totalPage,
    pageOffset,
    ...other
  } = props;
  return (
    <div
      className={["paging-table__footer", "gs-pagination", className].join(" ")}
      {...other}
    >
      <nav className="d-flex justify-content-center">
        <ul className="pagination paging-table__pagination">
          {renderPageNumber()}
        </ul>
      </nav>
    </div>
  );
};

GSPagination.defaultProps = {
  pageOffset: -1,
  maxShowedPage: 10,
};

GSPagination.propTypes = {
  currentPage: PropTypes.number,
  maxShowedPage: PropTypes.number,
  totalPage: PropTypes.number,
  onChangePage: PropTypes.func,
  className: PropTypes.func,
  pageOffset: PropTypes.number,
};

export default GSPagination;

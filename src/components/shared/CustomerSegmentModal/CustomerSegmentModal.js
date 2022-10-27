import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import "./CustomerSegmentModal.sass";
import AlertModal, {AlertModalType} from "../AlertModal/AlertModal";
import ModalHeader from "reactstrap/es/ModalHeader";
import GSButton from "../GSButton/GSButton";
import {Trans} from "react-i18next";
import ModalBody from "reactstrap/es/ModalBody";
import {UikCheckbox, UikFormInputGroup} from "../../../@uik";
import PagingTable from "../table/PagingTable/PagingTable";
import Loading, {LoadingStyle} from "../Loading/Loading";
import Modal from "reactstrap/es/Modal";
import GSTrans from "../GSTrans/GSTrans";
import {NAV_PATH} from "../../layout/navigation/Navigation";
import {GSToast} from "../../../utils/gs-toast";
import SegmentRow from "./SegmentRow/SegmentRow";
import beehiveService from "../../../services/BeehiveService";
import {cancelablePromise} from "../../../utils/promise";
import i18next from "i18next";
import GSSearchInput from "../GSSearchInput/GSSearchInput";
import GSFakeLink from "../GSFakeLink/GSFakeLink";
import GSActionButton, {GSActionButtonIcons,} from "../GSActionButton/GSActionButton";

const ON_INPUT_CUSTOMER_SEGMENT_DELAY = 500;
const SIZE_PER_PAGE_CUSTOMER_SEGMENT = 10;
const MAX_PAGE_SHOW_CUSTOMER_SEGMENT = 10;

const CustomerSegmentModal = (props) => {
  const [stHasSegment, setStHasSegment] = useState(false);
  const [stSelectedItems, setStSelectedItems] = useState([
    ...props.selectedItems,
  ]);
  const [stCheckAllValue, setStCheckAllValue] = useState(false);
  const [stSegmentInCurrentPage, setStSegmentInCurrentPage] = useState([]);
  const [stSearchKeyword, setStSearchKeyword] = useState("");
  const [stTotalItem, setStTotalItem] = useState(0);
  const [stCurrentPage, setStCurrentPage] = useState(0);
  const [stTotalPage, setStTotalPage] = useState(0);
  const [stLoadingWhenPaging, setStLoadingWhenPaging] = useState(false);
  const [stIsSearching, setIsSearching] = useState(false);

  const refAlert = useRef(null);

  useEffect(() => {
    // component did mount
    fetchDataSegmentModal(0);

    return () => {
      // component will unmount
      if (this.pmFetch) this.pmFetch.cancel();
    };
  }, [stSearchKeyword]);

  const onClose = (selectType) => {
    if (props.onClose) {
      props.onClose(selectType === "cancel" ? null : stSelectedItems);
    }
  };

  const selectOnItemForAPage = (e) => {
    let checked = e.target.checked;
    let selectedItems = stSelectedItems;

    stSegmentInCurrentPage.forEach((item) => {
      if (!checked) {
        // remove all segment in this page from selected segment
        selectedItems = selectedItems.filter((item2) => item.id !== item2.id);
      } else if (selectedItems.filter((item2) => item.id === item2.id).length === 0) {
        // add missing segment to selected segment
        selectedItems.push(item);
      }
    });
    setStSelectedItems(selectedItems);
    setStCheckAllValue(checked);
  };

  const onInputSearch = (keyword) => {
    if (this.stoSearch) clearTimeout(this.stoSearch);
    this.stoSearch = setTimeout(() => {
      setIsSearching(true);
      setStSearchKeyword(keyword);
    }, ON_INPUT_CUSTOMER_SEGMENT_DELAY);
  };

  const fetchDataSegmentModal = (page) => {
    setStCheckAllValue(false);
    setStLoadingWhenPaging(true);
    const params = {
      page: page,
      size: SIZE_PER_PAGE_CUSTOMER_SEGMENT,
    };
    if (stSearchKeyword !== "") {
      params["name.contains"] = stSearchKeyword;
    }

    this.pmFetch = cancelablePromise(
      beehiveService.getListSegmentWithKeyword(params)
    );
    this.pmFetch.promise.then(
      (result) => {
        const totalItem = parseInt(result.headers["x-total-count"]);
        setStLoadingWhenPaging(false);
        if (page === 0 && result.data.length === 0 && !stIsSearching) {
          setStHasSegment(false);
          refAlert.current.openModal({
            messages: (
              <GSTrans
                t={
                  "page.marketing.discounts.coupons.customer_segment_modal.noContent"
                }
              >
                a<a href={NAV_PATH.customers.SEGMENT_CREATE}>a</a>
              </GSTrans>
            ),
            type: AlertModalType.ALERT_TYPE_SUCCESS,
            closeCallback: props.onClose,
          });
        } else {
          setIsSearching(false);
          setStHasSegment(true);
          setStSegmentInCurrentPage(result.data);
          setStTotalItem(totalItem);
          setStCurrentPage(page + 1);
          setStTotalPage(Math.ceil(totalItem / SIZE_PER_PAGE_CUSTOMER_SEGMENT));
        }
      },
      () => {
        setStLoadingWhenPaging(false);
        GSToast.error(i18next.t("common.api.failed"));
        props.onClose();
      }
    );
  };

  const onChangeListPage = (pageIndex) => {
    setStCurrentPage(pageIndex);
    fetchDataSegmentModal(pageIndex - 1);
  };

  const onSelect = (product, checked) => {
    let lstProduct = [...stSelectedItems];

    if (checked !== true) {
      // uncheck => remove from list
      lstProduct = lstProduct.filter((p) => p.id !== product.id);
    } else if (lstProduct.filter((p) => p.id === product.id).length === 0) {
      // if checked
      // only push if not exist
      lstProduct.push(product);
    }

    setStSelectedItems(lstProduct);
  };

  const onClickUnCheckAll = () => {
    setStSelectedItems([]);
    setStCheckAllValue(false);
  };

  return (
    <>
      {!stHasSegment && <AlertModal ref={refAlert} />}
      {stHasSegment && (
        <Modal isOpen={stHasSegment} className="select-segment-modal">
          <ModalHeader
            close={
              <>
                <div className="mobile-header-btn d-mobile-flex d-desktop-none">
                  <i
                    className="btn-close__icon  d-mobile-none d-desktop-inline"
                    onClick={() => onClose("cancel")}
                  />
                  <GSButton
                    success
                    marginRight
                    onClick={() => onClose("select")}
                  >
                    <Trans i18nKey="common.btn.ok" />
                  </GSButton>
                  <GSButton secondary outline onClick={() => onClose("cancel")}>
                    <Trans i18nKey="common.btn.cancel" />
                  </GSButton>
                </div>
              </>
            }
            className="select-segment-modal__header"
          >
            <Trans i18nKey="page.marketing.discounts.coupons.customer_segment_modal.title" />
            <span className="font-size-14px font-weight-normal">
              {stSelectedItems.length > 0 && (
                <>
                  <GSTrans
                    t="page.marketing.email.editor.customerSummary"
                    values={{
                      segmentsLength: stSelectedItems.length,
                      user: stSelectedItems
                        .map((item) => item.userCount)
                        .reduce((a, b) => a + b),
                    }}
                  >
                    Selected:{" "}
                    <strong>segmentsLength segment(s)/ user user(s)</strong>
                  </GSTrans>
                  {" | "}
                  <GSFakeLink onClick={onClickUnCheckAll}>
                    <strong>
                      <GSTrans
                        t={"page.product.list.printBarCode.unCheckAll"}
                      />
                    </strong>
                  </GSFakeLink>
                </>
              )}

              <GSActionButton
                icon={GSActionButtonIcons.CLOSE}
                width={"1rem"}
                style={{ marginLeft: "1rem" }}
                onClick={() => onClose("cancel")}
                className="d-mobile-none d-desktop-inline-block"
              />
            </span>
          </ModalHeader>
          <ModalBody className="p-3">
            <div className="select-segment-modal__search-group d-flex align-items-center flex-md-row flex-column">
              <span className="check-all_apage">
                <UikCheckbox
                  name="check_all"
                  className="select-segment-row__discount"
                  checked={stCheckAllValue}
                  onChange={selectOnItemForAPage}
                />
              </span>
              <span className="search w-100">
                {/*<UikInput*/}
                {/*    className="search-input"*/}
                {/*    icon={(*/}
                {/*        <FontAwesomeIcon icon={"search"}/>*/}
                {/*    )}*/}
                {/*    iconPosition="left"*/}
                {/*    placeholder={i18next.t("page.marketing.discounts.coupons.customer_segment_modal.search_hint")}*/}
                {/*    onChange={onInputSearch}*/}
                {/*/>*/}

                <GSSearchInput
                  liveSearchOnMS={500}
                  style={{
                    height: "38px",
                  }}
                  wrapperProps={{
                    style: {
                      height: "38px",
                      width: "100%",
                      marginRight: ".25rem",
                    },
                  }}
                  onSearch={onInputSearch}
                  placeholder={i18next.t(
                    "page.marketing.discounts.coupons.customer_segment_modal.search_hint"
                  )}
                />
              </span>
            </div>
            <div className="product-list">
              <UikFormInputGroup>
                <PagingTable
                  headers={[]}
                  totalPage={stTotalPage}
                  maxShowedPage={MAX_PAGE_SHOW_CUSTOMER_SEGMENT}
                  currentPage={stCurrentPage}
                  onChangePage={onChangeListPage}
                  totalItems={stTotalItem}
                  scrollableBodyWhenHeightOver={"50vh"}
                  hidePagingEmpty
                >
                  {stLoadingWhenPaging && (
                    <Loading style={LoadingStyle.DUAL_RING_GREY} />
                  )}
                  {!stLoadingWhenPaging &&
                    stSegmentInCurrentPage.map((item, index) => {
                      let isExist =
                        stSelectedItems.filter((p) => p.id === item.id).length >
                        0;
                      return (
                        <section
                          key={item.id + "_" + index + isExist}
                          className="gs-table-body-items"
                        >
                          <div className="gs-table-body-item pl-0">
                            <SegmentRow
                              data={item}
                              onSelect={onSelect}
                              isExist={isExist}
                            />
                          </div>
                        </section>
                      );
                    })}
                </PagingTable>
              </UikFormInputGroup>
            </div>
            <div className="gs-atm__flex-row--flex-end footer-btn d-mobile-none d-desktop-flex">
              <GSButton
                secondary
                outline
                style={{ minWidth: "6rem" }}
                onClick={() => onClose("cancel")}
              >
                <Trans i18nKey="common.btn.cancel" />
              </GSButton>

              <GSButton
                success
                style={{ minWidth: "6rem", marginLeft: ".5rem" }}
                onClick={() => onClose("select")}
              >
                <Trans i18nKey="common.btn.ok" />
              </GSButton>
            </div>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

CustomerSegmentModal.propTypes = {
  onClose: PropTypes.func,
  selectedItems: PropTypes.any,
};

export default CustomerSegmentModal;

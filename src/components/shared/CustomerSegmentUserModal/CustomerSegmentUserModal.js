import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import "./CustomerSegmentUserModal.sass";
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
import LoadingScreen from "../LoadingScreen/LoadingScreen";

const ON_INPUT_CUSTOMER_SEGMENT_DELAY = 500;
const SIZE_PER_PAGE_CUSTOMER_SEGMENT = 10;
const MAX_PAGE_SHOW_CUSTOMER_SEGMENT = 10;

const CustomerSegmentUserModal = (props) => {
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
  const [stIsLoading, setStIsLoading] = useState(false);

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
    setStIsLoading(true)
    const params = {
      page: page,
      size: SIZE_PER_PAGE_CUSTOMER_SEGMENT,
    };
    params["segmentName"] = stSearchKeyword;

    this.pmFetch = cancelablePromise(
      beehiveService.getListSegmentUser(params)
    );
    this.pmFetch.promise.then(
      (result) => {
        setStLoadingWhenPaging(false);
        setStIsLoading(true)
        if (page === 0 && result.data.lstSegment.length === 0 && !stIsSearching) {
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
          setStSegmentInCurrentPage(result.data.lstSegment);
          setStTotalItem(result.data.totalPage);
          setStCurrentPage(page + 1);
          setStTotalPage(result.data.totalPage);
        }
      },
      () => {
        setStLoadingWhenPaging(false);
        GSToast.error(i18next.t("common.api.failed"));
        setStIsLoading(false)
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
      {stIsLoading && <LoadingScreen/>}
      {!stHasSegment && <AlertModal ref={refAlert} />}
      {stHasSegment && (
        <Modal isOpen={stHasSegment} className="select-segment-modal">
          <ModalHeader
            className="select-segment-modal__header"
          >
            <Trans i18nKey="page.marketing.discounts.coupons.customer_segment_modal.title" />
            <span className="font-size-14px font-weight-normal d-flex">
              {stSelectedItems.length > 0 && (
                <>
                  <div>
                    <GSTrans
                        t="page.facebook.broadcast.detail.customerSummary"
                    >
                  </GSTrans>
                    <span className="font-weight-bold">
                      {stSelectedItems.length}
                    </span>
                  </div>
                  <span className="ml-1 mr-1">|</span>
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
                className="d-desktop-inline-block"
              />
            </span>
          </ModalHeader>
          <ModalBody>
            <div className="select-segment-modal__search-group d-flex align-items-center flex-row">
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
                    height: "45px",
                  }}
                  wrapperProps={{
                    style: {
                      height: "45px",
                      width: "100%",
                      marginRight: ".25rem",
                    },
                  }}
                  icon={<img src="/assets/images/Icon-search-light.png" alt="promotion-code"/>}
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
            <div className="justify-content-center footer-btn d-desktop-flex">
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

CustomerSegmentUserModal.propTypes = {
  onClose: PropTypes.func,
  selectedItems: PropTypes.any,
};

export default CustomerSegmentUserModal;

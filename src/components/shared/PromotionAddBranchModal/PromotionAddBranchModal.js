import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import Modal from 'reactstrap/es/Modal';
import ModalBody from 'reactstrap/es/ModalBody';
import ModalHeader from 'reactstrap/es/ModalHeader';
import { UikCheckbox, UikFormInputGroup } from "../../../@uik";
import storeService from '../../../services/StoreService';
import GSActionButton, { GSActionButtonIcons } from '../GSActionButton/GSActionButton';
import GSButton from '../GSButton/GSButton';
import GSFakeLink from '../GSFakeLink/GSFakeLink';
import GSSearchInput from '../GSSearchInput/GSSearchInput';
import GSTrans from "../GSTrans/GSTrans";
import PagingTable from '../table/PagingTable/PagingTable';
import "./PromotionAddBranchModal.sass";

export const BUTTON_TYPE_SELECT = "select";
export const BUTTON_TYPE_CANCEL = "cancel";
const SIZE_PER_PAGE_ADD_BRANCH_MODAL = 10;

const PromotionAddBranchModal = props => {

  const { onClose, selectedItems } = props;

  const [selectedBranch, setSelectedBranch] = useState([...selectedItems]);
  const [branchesInActivePage, setSelectedBranchActivePage] = useState([]);
  const [allStoreBranches, setAllStoreBranches] = useState(null);
  const [storeBranches, setStoreBranches] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBranch, setTotalBranch] = useState(null);

  useEffect(() => {
    fetchStoreBranches();
  }, []);

  useEffect(() => {
    if (allStoreBranches != null) {
      fetchStoreBranches(1);
    }
  }, [allStoreBranches]);

  const fetchStoreBranches = (page = 1, keyword) => {
    if (allStoreBranches === null) {
      storeService.getFullStoreBranches()
        .then(result => {
          setTotalBranch(result.data.length);
          const branches = result.data.filter(branch => branch.branchStatus === 'ACTIVE').map(branch => ({ id: branch.id, name: branch.name }));
          setAllStoreBranches(branches);
        })
    }
    else {
      let branches = [];
      setCurrentPage(page);
      if (keyword && keyword.trim()) {
        branches = allStoreBranches.filter(branch => branch.name.search(keyword) >= 0);
      }
      else {
        branches = Array.from(allStoreBranches)
          .splice(SIZE_PER_PAGE_ADD_BRANCH_MODAL * (page - 1), SIZE_PER_PAGE_ADD_BRANCH_MODAL);
      }

      setStoreBranches(branches);
      setSelectedBranchActivePage(branches);
    }
  }

  const uncheckAll = () => {
    setSelectedBranch([]);
    setCheckAll(false);
  }

  const itemIsNotFound = (arr, id) => {
    return arr.find(item => item.id === id) === undefined;
  }

  const onCheckAll = checked => {
    setCheckAll(checked);
    const tmpBranches = [...selectedBranch];
    if (checked) { // checked all
      storeBranches.forEach(branch => {
        if (selectedBranch.find(item => item.id === branch.id) === undefined) { // not checked
          tmpBranches.push(branch);
        }
      });
      setSelectedBranch(tmpBranches);
    }
    else { // unchecked all in current branch
      const remainingBranch = selectedBranch.filter(branch => {
        return itemIsNotFound(branchesInActivePage, branch.id);
      });
      setSelectedBranch(remainingBranch);
    }
  }

  const onClickCheckbox = (branch, checked) => {
    setCheckAll(false);
    setSelectedBranch(checked
      ? [...selectedBranch, branch]
      : selectedBranch.filter(tmpBranch => tmpBranch.id !== branch.id));
  }

  const changePage = index => {
    fetchStoreBranches(index);
    setCheckAll(false);
    setSelectedBranchActivePage([]);
  }

  const onInputSearch = keyword => {
    fetchStoreBranches(0, keyword);
  }

  return (
    <Modal isOpen={true} className="promotion-add-branch-modal">
      <ModalHeader
        close={
          <div className="d-mobile-flex d-desktop-none">
            <ModalButtons
              className="gs-atm__flex-row--flex-end footer-btn"
              onClose={mode => { onClose(selectedBranch, mode) }} />
          </div>
        }
        className="select-segment-modal__header">
        <PopupHeader
          onClose={onClose}
          selected={selectedBranch}
          uncheckAll={uncheckAll}
        />
      </ModalHeader>
      <ModalBody>
        <BranchSearchInput checkedAll={checkAll} onCheckAll={onCheckAll} onSearch={onInputSearch} />
        <div className="branch-list gs-atm__scrollbar-1">
          <UikFormInputGroup>
            <PagingTable
              headers={[]}
              totalItems={totalBranch}
              totalPage={Math.ceil(totalBranch / SIZE_PER_PAGE_ADD_BRANCH_MODAL)}
              scrollableBodyWhenHeightOver={"50vh"}
              hidePagingEmpty
              maxShowedPage={10}
              currentPage={currentPage}
              onChangePage={changePage}
            >
              {storeBranches.map(item => {
                const checked = selectedBranch.find(branch => branch.id === item.id) !== undefined;
                return (
                  <section className="gs-table-body-items">
                    <div className="gs-table-body-item pl-0">
                      <BranchItem data={item} onClickCheckbox={onClickCheckbox} checked={checked} />
                    </div>
                  </section>
                );
              })}
            </PagingTable>
          </UikFormInputGroup>
        </div>
        <ModalButtons className="gs-atm__flex-row--flex-end footer-btn d-mobile-none d-desktop-flex"
          onClose={mode => { onClose(selectedBranch, mode) }} />
      </ModalBody>
    </Modal>
  );
}

const PopupHeader = props => {
  const { onClose, selected, uncheckAll } = props;

  const selectedBranchSumary = () => {
    const branchSelected = selected.length;
    return branchSelected === 1
      ? branchSelected + i18next.t("page.marketing.discounts.coupons.create.applicableBranch.singleBranch")
      : branchSelected + i18next.t("page.marketing.discounts.coupons.create.applicableBranch.pluralBranch");
  }

  return (
    <div className="row justify-content-between w-100">
      <GSTrans t={"page.marketing.discounts.coupons.create.applicableBranch.add"} />
      <div className="row justify-content-end">
        {selected.length > 0 &&
          <span className="branch-selection-sumary">
            <GSTrans t={"common.branch.selected"} values={{ x_branch: selectedBranchSumary() }} />
            {" | "}

            <GSFakeLink onClick={uncheckAll}>
              <strong><GSTrans t={"page.product.list.printBarCode.unCheckAll"} /></strong>
            </GSFakeLink>
          </span>}

        <GSActionButton
          icon={GSActionButtonIcons.CLOSE}
          width={"1rem"}
          style={{ marginLeft: "1rem" }}
          onClick={onClose}
          className="d-mobile-none d-desktop-inline-block" />
      </div>
    </div>
  );
}

const BranchSearchInput = props => {
  const { checkedAll, onCheckAll, onSearch } = props;
  return (
    <div className="select-branch-modal__search-group d-flex align-items-center flex-md-row flex-column">
      <span className="check-all-branch">
        <UikCheckbox
          className="select-branch-row__discount"
          checked={checkedAll}
          name="check_all"
          onClick={e => onCheckAll(e.target.checked)} />
      </span>
      <span className="search-branch">
        <GSSearchInput
          liveSearchOnMS={500}
          onSearch={onSearch}
          placeholder={i18next.t("page.marketing.discounts.coupons.create.applicableBranch.search")} />
      </span>
    </div>
  );
}

const ModalButtons = props => {
  const { onClose, className } = props;

  return (
    <div className={className}>
      <GSButton secondary marginRight outline onClick={() => onClose(BUTTON_TYPE_CANCEL)}>
        <GSTrans t={"common.btn.cancel"} />
      </GSButton>

      <GSButton success marginRight onClick={() => onClose(BUTTON_TYPE_SELECT)}>
        <GSTrans t={"common.btn.ok"} />
      </GSButton>
    </div>
  );
}

const BranchItem = props => {
  const { data, onClickCheckbox, checked } = props;
  return (
    <UikCheckbox
      checked={checked}
      className="select-branch-row__discount select-branch-item-row"
      onClick={e => { onClickCheckbox(data, e.target.checked) }}
      label={
        <div className="branch-name">
          {data.name}
        </div>
      }
      name="rgroup"
    />
  );
}

export default PromotionAddBranchModal;

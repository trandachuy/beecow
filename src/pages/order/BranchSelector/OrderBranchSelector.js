/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {AvForm, AvRadio, AvRadioGroup} from 'availity-reactstrap-validation'
import './OrderBranchSelector.sass'
import AvCustomCheckbox from "../../../components/shared/AvCustomCheckbox/AvCustomCheckbox";
import i18next from "i18next";
import {CredentialUtils} from "../../../utils/credential";
import GSButton from "../../../components/shared/GSButton/GSButton";

const OrderBranchSelector = props => {
    const [stSelectedBranch, setStSelectedBranch] = useState(-1);
    const [stCheckedDontShowAgain, setStCheckDontShowAgain] = useState(CredentialUtils.getDontShowDefaultBranch());

    useEffect(() => {
        if (props.branchList && props.branchList.length > 0) {
            let localBranchId =CredentialUtils.getStoreDefaultBranch();
            if (localBranchId) {
                // check default branch still existed
                localBranchId = parseInt(localBranchId)
                const existedBranch = props.branchList.find(b => b.value === localBranchId)
                if (existedBranch) {
                    setStSelectedBranch(localBranchId)
                } else { // if stored existed branch was not existed -> choose first branch
                    setStSelectedBranch(props.branchList[0].value)
                }
            } else {
                setStSelectedBranch(props.branchList[0].value)
            }
        }
    }, [props.branchList])


    const onChangeSelectedBranch = (e, branchId) => {
        setStSelectedBranch(branchId)
    }

    const onChangeCbDontShowAgain = (e) => {
        setStCheckDontShowAgain(e.currentTarget.value)
    }

    const onClickOk = () => {
        if (props.onOk) {
            props.onOk({
                selected: stSelectedBranch,
                checkedDontShowAgain: stCheckedDontShowAgain
            })
        }
    }

    return (
        <Modal isOpen={props.isOpen} wrapClassName="order-branch-selector" size="lg">
            <ModalHeader>
                <GSTrans t="page.order.instorePurchase.chooseBranchConfirm"/>
            </ModalHeader>
            <ModalBody>
                <strong>
                    <GSTrans t="page.order.instorePurchase.chooseWorkingBranch"/>
                </strong>
                <AvForm>
                    <AvRadioGroup name="branch-selector" value={stSelectedBranch} onChange={onChangeSelectedBranch}>
                        <div className="order-branch-selector__option-container background-color-lightgray2 gs-atm__scrollbar-1">
                            {props.branchList.map((branch, index) => {
                                return (
                                    <div style={{height: '3rem'}}
                                         className="d-flex align-items-center order-branch-selector__option-wrapper gsa-hover--fadeOut"
                                         key={"branch-" + branch.id}
                                    >
                                            <AvRadio label={branch.label}
                                                     value={branch.value}
                                                     customInput
                                                     className="order-branch-selector__option"
                                            />
                                    </div>
                                )
                            })}
                        </div>
                    </AvRadioGroup>
                        <AvCustomCheckbox
                            name="cb-dont-show"
                            label={i18next.t`page.product.modal.branch.confirm.notaskingagain`}
                            classWrapper="d-flex align-items-center"
                            onChange={onChangeCbDontShowAgain}
                            checked={stCheckedDontShowAgain}
                        />
                </AvForm>
            </ModalBody>
            <ModalFooter>
                <GSButton success onClick={onClickOk}>
                    <GSTrans t="common.btn.ok"/>
                </GSButton>
            </ModalFooter>
        </Modal>
    );
};

OrderBranchSelector.propTypes = {
    branchList: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.any,
    })),
    isOpen: PropTypes.bool,
    onOk: PropTypes.func,
};

export default OrderBranchSelector;

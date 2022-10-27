import {Modal, ModalBody, ModalHeader} from "reactstrap";
import GSTable from "../../../../components/shared/GSTable/GSTable";
import i18next from "i18next";
import React, {useState} from "react";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import {Trans} from "react-i18next";
import './BranchListModal.sass'
const BranchListModal = props => {
    const [stOpenList, setStOpenList] = useState(props.onOpen);
    const [stBranchList, setStBranchList] = useState(props.branchList);

    return (
        <Modal wrapClassName="item-branch-list-modal" isOpen={props.onOpen} key={props.onOpen}>
            <ModalHeader toggle={props.onCancel} />
            <ModalBody>
                <div className="gs-atm__scrollbar-1 branch-list-wrapper">
                    <GSTable>
                        <thead>
                            <tr>
                                <th className="col-8"><Trans i18nKey="component.variationDetail.branch.title"/></th>
                                <th className="col-4"><Trans i18nKey="productList.tbheader.productSKU"/></th>
                            </tr>
                        </thead>
                        <tbody>
                        {stBranchList?.map((branch, index) => {
                                return (
                                    <tr key={index}
                                        className={ [
                                            'gsa-hover--gray cursor--pointer'
                                        ].join(' ') }
                                    >
                                        <td className="col-8">{branch.name} {branch.isDefault?`- ${i18next.t("common.txt.default")}`:''}</td>
                                        <td className="col-4">{branch.sku}</td>
                                    </tr>
                                );
                            })
                        }
                        </tbody>
                    </GSTable>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default BranchListModal;


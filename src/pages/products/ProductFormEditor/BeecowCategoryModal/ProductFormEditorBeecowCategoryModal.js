/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import './ProductFormEditorBeecowCategoryModal.sass'
import {Modal} from "reactstrap";
import ModalHeader from "reactstrap/es/ModalHeader";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {GomuaCategorySelector} from "../../ProductAddNew/GomuaCategorySelector";

const ProductFormEditorBeecowCategoryModal = props => {
    const refCategorySelector = useRef(null);


    const onClickOk = (e) => {
        const cateId = refCategorySelector.current.getCateId()
        refCategorySelector.current.getCategories()
            .then(categories => {
                if (props.okCallback) props.okCallback(cateId, categories)
            })
    }

    return (
        <Modal isOpen={props.isOpen} className="product-form-editor-beecow-category-modal">
            <ModalHeader className="color-green">
                <GSTrans t={"common.txt.alert.modal.title"}/>
            </ModalHeader>
            <ModalBody>
                <p>
                    <GSTrans t="page.product.create.beecow.chooseCategories"/>
                </p>
                <GomuaCategorySelector ref={refCategorySelector} defaultCateId={props.defaultCateId}/>
            </ModalBody>
            <ModalFooter>
                <GSButton default marginRight onClick={props.cancelCallback}>
                    <GSTrans t={"common.btn.cancel"}/>
                </GSButton>
                <GSButton success onClick={onClickOk}>
                    <GSTrans t={"common.btn.ok"}/>
                </GSButton>
            </ModalFooter>
        </Modal>
    );
};

ProductFormEditorBeecowCategoryModal.propTypes = {
    isOpen: PropTypes.bool,
    okCallback: PropTypes.func,
    cancelCallback: PropTypes.func,
    defaultCateId: PropTypes.number,
};

export default ProductFormEditorBeecowCategoryModal;

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 28/04/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import GSSearchInput from "../../../../components/shared/GSSearchInput/GSSearchInput";
import './ProductFormCollectionSelector.sass'
import {CollectionType} from "../../CollectionFormEditor/CollectionFormEditor";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import i18next from "i18next";
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import GSModal, {GSModalTheme, GSModalTitle} from "../../../../components/shared/GSModal/GSModal";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import _ from "lodash"

const ProductFormCollectionSelector2 = props => {
    const refModal = useRef(null);

    const [stShowResult, setStShowResult] = useState(false);
    const [stSearchResult, setStSearchResult] = useState([]);
    const [stKeyword, setStKeyword] = useState('');
    const [stSelected, setStSelected] = useState(props.collectionDefaultList);

    useEffect(() => {
        if (!_.isEqual(stSelected, props.collectionDefaultList)) {
            onChange()
        }
    }, [stSelected]);



    const onSearch = (keyword) => {
        const result = props.collectionList.filter(co =>
            co.collectionType === CollectionType.MANUAL && co.name.toLowerCase().includes(keyword.toLowerCase())
            && !stSelected.map(c => c.id).includes(co.id)
        )
        setStSearchResult(result)
        setStKeyword(keyword)

        setStShowResult(true)

        // if (keyword) {
        //     setStShowResult(true)
        // } else {
        //     setStShowResult(false)
        // }

    }


    const onClickSearch = () => {
        onSearch(stKeyword)
    }


    const selectCollection = (collection) => {
        setStSelected([...stSelected, collection])
        setStShowResult(false)
    }

    const removeCollection = (collection) => {
        const nList = [...stSelected]
        const index = nList.findIndex(c => c.id === collection.id)
        nList.splice(index, 1)
        setStSelected(nList)
    }

    const onCreateNewCollectionBtn = () => {
        refModal.current.open()
    }

    const onChange = () => {
        /* split to addList and removeList
        addList: contains in e but stCollectionDefault
        removeList: contain in stCollectionDefault but e
        */
        const e = stSelected
        let addList = e.filter(item => props.collectionDefaultList.filter(i => i.id === item.id).length === 0 )
        let removeList = props.collectionDefaultList.filter(item =>{
            const findCol =  e.filter(i => i.id === item.id)
            return findCol.length === 0
        })

        props.onChange({
            addList: addList.map(i => i.id),
            removeList: removeList.map(i => i.id)
        })
    }

    const onYesClick = () => {
        if (props.redirectWithSave) {
            props.redirectWithSave()
            refModal.current.close()
        }
    }

    const onNoClick = () => {
        if (props.redirectWithoutSave) {
            props.redirectWithoutSave()
        }
    }

    const onCancelClick = () => {
        refModal.current.close()
    }


    const closeResult = () => {
        setStShowResult(false)
    }


    return (
        <>
            {stShowResult &&
                <div style={{
                    position: 'fixed',
                    height: '100%',
                    width: '100%',
                    top: '0',
                    left: '0',
                    zIndex: 4
                }} onClick={closeResult}>

                </div>
            }
            <div className="product-form-collection-selector2">
           {props.collectionList.length > 0 &&
           <>
                <GSSearchInput onSearch={onSearch}
                               onClick={onClickSearch}
                               liveSearchOnMS={500}
                               placeholder={i18next.t('component.collection.list.search_name')}
                />
                {stShowResult &&
                    <div className="product-form-collection-selector2__search-result" style={{zIndex: 5}}>
                        {stSearchResult.map(r => {
                            return (
                                <div key={r.id}
                                     className="product-form-collection-selector2__search-item gsa-hover--gray cursor--pointer"
                                     onClick={() => selectCollection(r)}
                                >
                                    {r.name}
                                </div>
                            )
                        })}
                        {stSearchResult.length === 0 &&
                            <p className="text-center mb-0">
                                <GSTrans t={"common.noResultFound"}/>
                            </p>
                        }
                    </div>
                }
                <div className="product-form-collection-selector2__selected-container">
                    {stSelected.map(co => {
                        return (
                            <div key={co.id} className="product-form-collection-selector2__selected-item">
                                <span className="product-form-collection-selector2__selected-item-name">
                                    {co.name? co.name:co.collectionName}
                                </span>
                                {co.collectionType === CollectionType.MANUAL &&
                                    <GSActionButton icon={GSActionButtonIcons.CLOSE}
                                                    width={'12px'}
                                                    onClick={() => removeCollection(co)}
                                    />
                                }
                            </div>
                        )
                    })}
                </div>
            </>}
            {/*=================== BLANK ======================*/}
            {props.collectionList.length === 0 &&
                <div className="no-content">
                    <GSTrans t={"component.product.addNew.productInformation.collection.noContent"}>
                        You haven't created any collections yet.<GSFakeLink onClick={onCreateNewCollectionBtn}>Create collection</GSFakeLink>.
                    </GSTrans>
                </div>
            }
        </div>
        <GSModal title={GSModalTitle.CONFIRM}
                 ref={refModal}
                 theme={GSModalTheme.INFO}
                 content={i18next.t("component.product.addNew.productInformation.collection.confirm")}
                 footer={
                     <>
                         <GSButton secondary outline onClick={onCancelClick}>
                             <GSTrans t={"common.btn.cancel"}/>
                         </GSButton>
                         <GSButton warning outline marginLeft onClick={onNoClick}>
                             <GSTrans t={"common.btn.no"}/>
                         </GSButton>
                         <GSButton success marginLeft onClick={onYesClick}>
                             <GSTrans t={"common.btn.yes"}/>
                         </GSButton>
                     </>
                 }/>
        </>
    );
};

ProductFormCollectionSelector2.propTypes = {
    redirectWithoutSave: PropTypes.func,
    redirectWithSave: PropTypes.func,
    collectionList: PropTypes.array,
    collectionDefaultList: PropTypes.array,
    itemId: PropTypes.any,
    onChange: PropTypes.func,
    onFetchingComplete: PropTypes.func
};

export default ProductFormCollectionSelector2;

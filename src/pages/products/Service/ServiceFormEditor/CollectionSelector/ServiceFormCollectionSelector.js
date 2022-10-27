/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/07/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import GSSelect from "../../../../../components/shared/form/GSSelect/GSSelect";
import i18next from "i18next";
import './ServiceFormCollectionSelector.sass'
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import GSModal, {GSModalTheme, GSModalTitle} from "../../../../../components/shared/GSModal/GSModal";
import GSFakeLink from "../../../../../components/shared/GSFakeLink/GSFakeLink";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import {CollectionType} from "../../../CollectionFormEditor/CollectionFormEditor";

const ServiceFormCollectionSelector = (props) => {

    const refModal = useRef();

    const [stCollectionList, setStCollectionList] = useState([]);
    const [stCollectionDefault, setStCollectionDefault] = useState([]);
    const [stValue, setStValue] = useState([]);
    const [stIsFetching, setStIsFetching] = useState(false);
    const [collections, setCollections] = useState(props.collectionList)
    // componentDidMount
    useEffect(() => {
        // remove automated collection from collectionList but keep only automated default collection
        const colList = props.collectionList
            .filter(col =>
                col.collectionType === CollectionType.MANUAL ||
                    props.collectionDefaultList.filter( dCol => dCol.id === col.id).length > 0
            )
        setStCollectionList(colList)
        if (props.collectionDefaultList) {
            setStCollectionDefault(props.collectionDefaultList)

            setStValue(props.collectionDefaultList
                .map(col => {return {value: col.id, label: col.collectionName, type: col.collectionType}}))
        }
        setStIsFetching(false)
        // componentWillUnmount
        return () => {
        };
    }, [props.collectionList]);

    const onCreateNewCollectionBtn = () => {
        refModal.current.open()
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

    const onChange = (e) => {
        setStValue(e)
        /* split to addList and removeList
        addList: contains in e but stCollectionDefault
        removeList: contain in stCollectionDefault but e
        */
        let addList = e.filter(item => stCollectionDefault.filter(i => i.id === item.value).length === 0 )
        let removeList = stCollectionDefault.filter(item =>{
            const findCol =  e.filter(i => i.value === item.id)
            return findCol.length === 0
        })

        props.onChange({
            addList: addList.map(i => i.value),
            removeList: removeList.map(i => i.id)
        })
    }

    return (
        <>
            {!stIsFetching &&
            <div className="product-form-collection-selector">
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


                {stCollectionList.length > 0 &&
                <GSSelect options={ stCollectionList.map( col => { return {value: col.id, label: col.name, type: col.collectionType} })}
                          isMulti
                          isSearchable
                          isClearable={false}
                          placeholder={i18next.t("component.product.addNew.productInformation.collection.select")}
                          noOptionsMessage={i18next.t("component.gs.select.noOptions")}
                          onChange = {onChange}
                          value={stValue}
                          backspaceRemovesValue={false}
                          styleMultiValueRemove={(styles, {data}) => ({
                                  ...styles,
                                  display: data.type === CollectionType.AUTOMATED? 'none':'block',
                                  color: '#9EA0A5',
                                  ':hover': {
                                      color: 'red',
                                  },
                              })
                          }
                          styleMultiValueLabel={(styles, {data}) => ({
                              ...styles,
                              color: 'black',
                              paddingRight: data.type === CollectionType.AUTOMATED? '6px':'3px',
                          })}
                />}

                {stCollectionList.length === 0 &&
                <div className="no-content">
                    <GSTrans t={"component.product.addNew.productInformation.collection.noContent"}>
                        You haven't created any collections yet. <GSFakeLink onClick={onCreateNewCollectionBtn}>Create collection</GSFakeLink>.
                    </GSTrans>
                </div>}

            </div>}

        </>
    );
};

ServiceFormCollectionSelector.propTypes = {
    redirectWithoutSave: PropTypes.func,
    redirectWithSave: PropTypes.func,
    collectionList: PropTypes.array,
    collectionDefaultList: PropTypes.array,
    itemId: PropTypes.any,
    onChange: PropTypes.func,
    onFetchingComplete: PropTypes.func
};

export default ServiceFormCollectionSelector;

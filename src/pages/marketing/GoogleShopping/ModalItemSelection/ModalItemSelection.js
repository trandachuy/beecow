/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 21/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import Modal from "reactstrap/es/Modal";
import './ModalItemSelection.sass'
import GSSearchInput from "../../../../components/shared/GSSearchInput/GSSearchInput";
import {UikCheckbox, UikSelect} from '../../../../@uik'
import i18next from "i18next";
import ProductRow from "./Row/ProductRow";
import _ from 'lodash'
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {AvForm} from 'availity-reactstrap-validation'
import {ItemService} from "../../../../services/ItemService";
import {PagingUtils} from "../../../../utils/paging";
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";

export const SEARCH_BY_ENUM = {
    PRODUCT: 'PRODUCT_NAME'
}

export const SCREENS_ENUM = {
    SEARCH_RESULT: 'SEARCH_RESULT',
    INSERTED_LIST: 'INSERTED_LIST'
}

const SIZE_PER_PAGE = 20
const ModalItemSelection = props => {
    const [stProductList, setStProductList] = useState([]);
    const [stSelectedList, setStSelectedList] = useState([]);
    const [stSearchBy, setStSearchBy] = useState({
        value: SEARCH_BY_ENUM.PRODUCT
    });
    const [stScreen, setStScreen] = useState(SCREENS_ENUM.SEARCH_RESULT);
    const [stSearchKeyword, setStSearchKeyword] = useState('');
    const [stPaging, setStPaging] = useState({
        current: 1,
        total: 0
    });
    const [stIsLoading, setStIsLoading] = useState(false);


    useEffect(() => {
        setStSearchKeyword('')
        setStSearchBy({
            value: SEARCH_BY_ENUM.PRODUCT
        })
        setStSelectedList([])

        if (!props.isOpen) {
            setStPaging({
                ...stPaging,
                current: 1,
            })
            setStScreen(SCREENS_ENUM.SEARCH_RESULT)
        }
    }, [props.isOpen])

    useEffect(() => {
        setStIsLoading(true)

        ItemService.getProductSuggestionByName(stPaging.current - 1, SIZE_PER_PAGE, stSearchBy.value, stSearchKeyword)
            .then(response => {
                const {data, headers} = response
                setStPaging({
                    current: 1,
                    total: PagingUtils.getTotalPageFromHeaders(headers, SIZE_PER_PAGE)
                })
                setStProductList(data.map(p => ({...p, quantity: 1})))
            })
            .finally(() => {
                setStIsLoading(false)
            })
    }, [stSearchKeyword, stSearchBy]);

    useEffect(() => {
        setStIsLoading(true)

        ItemService.getProductSuggestionByName(stPaging.current - 1, SIZE_PER_PAGE, stSearchBy.value, stSearchKeyword)
            .then(response => {
                const {data, headers} = response
                setStPaging({
                    ...stPaging,
                    total: PagingUtils.getTotalPageFromHeaders(headers, SIZE_PER_PAGE)
                })
                setStProductList(data.map(p => ({...p, quantity: 1})))
            })
            .finally(() => {
                setStIsLoading(false)
            })
    }, [stPaging.current]);

    const onCheckProduct = (product) => {
        setStSelectedList(stSelectedList => [...stSelectedList, product])
    }

    const onUncheckProduct = (product) => {

        setStSelectedList(stSelectedList => {
            const productIndex = stSelectedList.findIndex(p => {
                return product.barcode == p.barcode
            })
            const newProductList = _.clone(stSelectedList)
            newProductList.splice(productIndex, 1)
            if (newProductList.length === 0 && stScreen === SCREENS_ENUM.INSERTED_LIST) {
                setStScreen(SCREENS_ENUM.SEARCH_RESULT)
            }
            return newProductList
        })

    }

    const onUpdateProduct = (product) => {

        setStSelectedList(stSelectedList => {
            const productIndex = stSelectedList.findIndex(p => {
                return product.barcode == p.barcode
            })
            const newProductList = _.clone(stSelectedList)
            newProductList.splice(productIndex, 1, product)
            return newProductList
        })
    }

    const onCheckAll = (event) => {
        const checked = event.currentTarget.checked
        const checkedList = _.clone(stSelectedList)
        if (checked) {
            for (const product of stProductList) {
                if (isChecked(product)) continue
                checkedList.push(product)
            }
        } else {
            for (const product of stProductList) {
                const productIndex = checkedList.findIndex(p => {
                    return product.barcode == p.barcode
                })
                checkedList.splice(productIndex, 1)
            }
        }

        setStSelectedList(checkedList)
    }

    const isChecked = (product) => {
        return !!stSelectedList.find(p => p.barcode == product.barcode)
    }

    const isCheckedAll = () => {
        if (stProductList.length === 0) {
            return false
        }
        for (const product of stProductList) {
            if (!stSelectedList.find(p => p.barcode == product.barcode)) {
                return false
            }
        }
        return true
    }


    const onChangeSearchBy = (e) => {
        setStSearchBy(e)
    }

    const switchScreen = (destinationScreen) => {
        setStScreen(destinationScreen)
    }

    const onChangePage = (pageNumber) => {
        setStPaging({
            ...stPaging,
            current: pageNumber
        })
    }

    const onClickNextSummary = () => {
        const selected = stSelectedList;
        props.doExport(stSelectedList);
    }

    return (
        <>
            <Modal isOpen={props.isOpen} contentClassName="product-list-barcode-printer">
                <ModalHeader className="text-left" children={
                    <>
                        <GSTrans t="component.storefont.preference.gss.modal.title"/>

                        <span className="product-list-barcode-printer__selected font-size-14px font-weight-normal">
                            {stSelectedList.length > 0 && 
                            <>
                                <GSTrans t="component.storefont.preference.gss.modal.product.selected" values={{quantity: stSelectedList.length}}>
                                    0<b>1</b>
                                </GSTrans>
                            </>}
                            <GSActionButton icon={GSActionButtonIcons.CLOSE}
                                            width={'1rem'}
                                            style={{marginLeft: '1rem'}}
                                            onClick={props.onClose}
                            />
                        </span>
                    </>
                }>
                </ModalHeader>
                <ModalBody>
                    {stScreen === SCREENS_ENUM.SEARCH_RESULT &&
                        <>
                            <div className="d-flex align-items-center flex-md-row flex-column product-list-barcode-printer__search-wrapper">
                                <UikCheckbox onChange={onCheckAll} defaultChecked={isCheckedAll()} key={isCheckedAll()}/>
                                <GSSearchInput liveSearchOnMS={500}
                                               onSearch={setStSearchKeyword}
                                               className="flex-grow-1"
                                               style={{
                                                   height: '38px',
                                               }}
                                               wrapperProps={{
                                                   style: {
                                                       height: '38px',
                                                       width: '100%',
                                                       marginRight: '.25rem'
                                                   }
                                               }}
                                               defaultValue={stSearchKeyword}
                                               placeholder={i18next.t(stSearchBy.value === SEARCH_BY_ENUM.PRODUCT? 'page.product.list.printBarCode.searchByProduct':'page.product.list.printBarCode.searchByBarcode')}
                                />
                                {/* <UikSelect
                                    onChange={onChangeSearchBy}
                                    position={'bottomRight'}
                                    value={[stSearchBy]}
                                    style={{
                                        width: '100px'
                                    }}
                                    className='product-list-barcode-printer__search-by-selector'
                                    options={ [
                                        {
                                            value: SEARCH_BY_ENUM.PRODUCT,
                                            label: i18next.t('page.product.list.printBarCode.product'),
                                        }
                                    ] }
                                /> */}
                            </div>
                            {!stIsLoading &&
                            <div className="product-list-barcode-printer__product-list">
                                {stProductList.map(product => {
                                    return (
                                        <ProductRow
                                            product={product}
                                            checked={isChecked(product)}
                                            key={product.barcode}
                                            onSelect={onCheckProduct}
                                            onDeselect={onUncheckProduct}
                                            screen={stScreen}
                                        />
                                    )
                                })}
                            </div>}
                            {!stIsLoading && stProductList.length === 0 &&
                            <div className="my-3">
                                <GSTrans t="common.noResultFound"/>
                            </div>
                            }
                            {!stIsLoading &&
                                <PagingTable totalPage={stPaging.total}
                                             onChangePage={onChangePage}
                                             currentPage={stPaging.current}
                                             maxShowedPage={10}
                                             isShowPagination={true}
                                             totalItems={1}
                                />
                            }
                            {stIsLoading &&
                                <Loading style={LoadingStyle.DUAL_RING_GREY} className="d-flex justify-content-center align-items-center" cssStyle={{
                                    height: '50vh',
                                }}/>
                            }
                        </>
                    }
                    {stScreen === SCREENS_ENUM.INSERTED_LIST &&
                        <AvForm>
                            <div className="product-list-barcode-printer__product-list product-list-barcode-printer__inserted-list">
                                {stSelectedList.map(product => {
                                    return (
                                        <ProductRow
                                            product={product}
                                            onDeselect={onUncheckProduct}
                                            screen={stScreen}
                                            onUpdate={onUpdateProduct}
                                            checked={true}
                                            key={product.id}
                                        />
                                    )
                                })}
                            </div>
                        </AvForm>
                    }
                </ModalBody>
                <ModalFooter>
                    {stScreen === SCREENS_ENUM.SEARCH_RESULT &&
                    <>
                        <GSButton secondary outline onClick={props.onClose}>
                            <GSTrans t="component.storefont.preference.gss.modal.button.cancel"/>
                        </GSButton>
                        <GSButton success
                                  disabled={stSelectedList.length === 0}
                                  marginLeft
                                  onClick={() => stSelectedList.length > 0 && switchScreen(SCREENS_ENUM.INSERTED_LIST)}
                        >
                            <GSTrans t="component.storefont.preference.gss.modal.button.done"/>
                        </GSButton>
                    </>}
                    {stScreen === SCREENS_ENUM.INSERTED_LIST &&
                    <>
                        <GSButton secondary outline onClick={() => switchScreen(SCREENS_ENUM.SEARCH_RESULT)}>
                            <GSTrans t="common.btn.back"/>
                        </GSButton>

                        <GSButton success marginLeft onClick={onClickNextSummary}>
                            <GSTrans t="component.storefont.preference.gss.modal.button.export"/>
                        </GSButton>

                    </>}
                </ModalFooter>
            </Modal>
        </>
    );
};

ModalItemSelection.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    doExport: PropTypes.func,
};

export default ModalItemSelection;

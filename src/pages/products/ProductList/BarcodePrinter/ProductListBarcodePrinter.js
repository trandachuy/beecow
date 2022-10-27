/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 21/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import Modal from "reactstrap/es/Modal";
import './ProductListBarcodePrinter.sass'
import GSSearchInput from "../../../../components/shared/GSSearchInput/GSSearchInput";
import {UikCheckbox, UikSelect} from '../../../../@uik'
import i18next from "i18next";
import ProductListBarcodePrinterProductRow from "./Row/ProductListBarcodePrinterProductRow";
import _ from 'lodash'
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {AvForm} from 'availity-reactstrap-validation'
import {ProductListBarcodePrinterTemplateHTML} from "./PrintTemplate/ProductListBarcodePrinterTemplate";
import {ItemService} from "../../../../services/ItemService";
import {PagingUtils} from "../../../../utils/paging";
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";
import {WindowUtils} from "../../../../utils/download";
import {NumberUtils} from "../../../../utils/number-format";

export const SEARCH_BY_ENUM = {
    PRODUCT: 'PRODUCT_NAME',
    BARCODE: 'BARCODE',
    SKU: 'SKU'
}

export const SCREENS_ENUM = {
    SEARCH_RESULT: 'SEARCH_RESULT',
    INSERTED_LIST: 'INSERTED_LIST'
}

const PAGE_SIZE = {
    A4_38MM_21MM: 'A4 38mm x 21mm',
    A2_75IN_0_87IN: '70mm x 22mm',

}

const PRINT_PAGE_SIZE_OPTIONS = [
    {
        value: 'A4_38MM_21MM',
        label: PAGE_SIZE.A4_38MM_21MM
    },
    {
        value:'A2_75IN_0_87IN',
        label: PAGE_SIZE.A2_75IN_0_87IN
    }
]

const SIZE_PER_PAGE = 20
const ProductListBarcodePrinter = props => {
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
    const [stPageSize, setStPageSize] = useState(PRINT_PAGE_SIZE_OPTIONS[1]);

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
        if(!props.isOpen){
            return;
        }

        if (props.branchIds.length === 0) return
        setStIsLoading(true)
        ItemService.getProductSuggestionByName(stPaging.current - 1, SIZE_PER_PAGE, stSearchBy.value, stSearchKeyword, false, '', {
            branchIds: props.branchIds,
            includeConversion: true
        })
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
    }, [stSearchKeyword, stSearchBy.value, props.branchIds]);

    useEffect(() => {
        if(!props.isOpen){
            return;
        }

        if (props.branchIds.length === 0) return
        setStIsLoading(true)

        ItemService.getProductSuggestionByName(stPaging.current - 1, SIZE_PER_PAGE, stSearchBy.value, stSearchKeyword, false, '', {
            branchIds: props.branchIds
        })
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

    const unCheckAllPage= () => {
        setStSelectedList([])
        if (stScreen === SCREENS_ENUM.INSERTED_LIST) {
            setStScreen(SCREENS_ENUM.SEARCH_RESULT)
        }
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

    const onClickPrint = () => {
        const htmlTemplate = ProductListBarcodePrinterTemplateHTML(stSelectedList, stPageSize)
        WindowUtils.openFileInNewTab(htmlTemplate)
    }

    return (
        <>
            <Modal isOpen={props.isOpen} contentClassName="product-list-barcode-printer">
                <ModalHeader className="text-left" children={
                    <>
                        <GSTrans t="page.product.list.printBarCode.printProductBarCode"/>

                        <span className="product-list-barcode-printer__selected font-size-14px font-weight-normal">
                            {stSelectedList.length > 0 &&<>
                                <GSTrans t="page.product.list.printBarCode.selected" values={{quantity: stSelectedList.length}}>
                                    0<b>1</b>
                                </GSTrans>
                                {' | '}
                                {stScreen === SCREENS_ENUM.SEARCH_RESULT &&
                                    <GSFakeLink className="font-weight-bold" onClick={unCheckAllPage}>
                                        <GSTrans t="page.product.list.printBarCode.unCheckAll"/>
                                    </GSFakeLink>
                                }
                                {stScreen === SCREENS_ENUM.INSERTED_LIST &&
                                    <span className="font-weight-bold">
                                        <GSTrans t="page.product.list.printBarCode.quantityCodes" values={{
                                            quantity: NumberUtils.formatThousand(stSelectedList.map(product => parseInt(product.quantity)).reduce((sum, quantity) => sum + quantity))
                                        }}/>
                                    </span>
                                }
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
                            <div className="d-flex align-items-center flex-md-row product-list-barcode-printer__search-wrapper">
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
                                <UikSelect
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
                                            label: i18next.t('page.product.list.printBarCode.productName'),
                                        },
                                        {
                                            value: SEARCH_BY_ENUM.BARCODE,
                                            label: i18next.t('page.product.list.printBarCode.barcode'),
                                        }
                                    ] }
                                />
                            </div>
                            
                            {!stIsLoading &&
                            <div className="product-list-barcode-printer__product-list">
                                <div className='title-barcode-wrapper bg-light-white w-100 d-flex p-2'>
                                    <div className='title-checkbox'></div>
                                    <div className='title-image'><GSTrans t="page.notification.detail.image"/></div>
                                    <div className='title-productName'><GSTrans t="page.discount.create.select_product.product_name"/></div>
                                    <div className='title-unit'><GSTrans t="component.product.addNew.unit.title"/></div>
                                </div>
                                {stProductList.map(product => {
                                    return (
                                        <ProductListBarcodePrinterProductRow
                                            className={product.parentId? "bg-light-gray" : ""}
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
                                        <ProductListBarcodePrinterProductRow
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
                            <GSTrans t="common.btn.cancel"/>
                        </GSButton>
                        <GSButton success
                                  disabled={stSelectedList.length === 0}
                                  marginLeft
                                  onClick={() => stSelectedList.length > 0 && switchScreen(SCREENS_ENUM.INSERTED_LIST)}
                        >
                            <GSTrans t="page.product.list.printBarCode.insertProducts"/>
                        </GSButton>
                    </>}
                    {stScreen === SCREENS_ENUM.INSERTED_LIST &&
                    <>
                        <GSButton secondary outline onClick={() => switchScreen(SCREENS_ENUM.SEARCH_RESULT)}>
                            <GSTrans t="common.btn.back"/>
                        </GSButton>
                        <UikSelect
                            options={PRINT_PAGE_SIZE_OPTIONS}
                            defaultValue={stPageSize.value}
                            onChange={setStPageSize}
                            className="ml-auto product-list-barcode-printer__page-size-selector"
                        />

                        <GSButton success marginLeft onClick={onClickPrint}>
                            <GSTrans t="page.product.list.printBarCode.btn.print"/>
                        </GSButton>

                    </>}
                </ModalFooter>
            </Modal>
        </>
    );
};

ProductListBarcodePrinter.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
};

export default ProductListBarcodePrinter;

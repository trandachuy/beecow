import React, {useEffect, useRef, useState} from 'react';
import {GSAlertModalType} from "../../../components/shared/GSAlertModal/GSAlertModal";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import i18next from "i18next";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {UikCheckbox, UikInput, UikSelect} from "../../../@uik";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import GSTable from "../../../components/shared/GSTable/GSTable";
import GSPagination from "../../../components/shared/GSPagination/GSPagination";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import {ImageUtils} from "../../../utils/image";
import moment from 'moment';
import GSTrans from "../../../components/shared/GSTrans/GSTrans";

import './ShopeeProductManagement.sass';
import shopeeService from "../../../services/ShopeeService";
import {GSToast} from "../../../utils/gs-toast";
import {NumberUtils} from "../../../utils/number-format";
import {Trans} from "react-i18next";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {RouteUtils} from '../../../utils/route';
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import _ from 'lodash';
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import GSImg from "../../../components/shared/GSImg/GSImg";
import ModalCreateProductGosell from "../ShopeeModal/ModalCreateProductGosell";
import ModalSyncProductGosell from "../ShopeeModal/ModalSyncProductGosell";
import $ from 'jquery';
import AlertModal from "../../../components/shared/AlertModal/AlertModal";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import GSDropdownAction from "../../../components/shared/GSDropdownAction/GSDropdownAction";
import Constants from "../../../config/Constant";

const DEFAULT_FILTER = {
    STATUS: {value: '', label: i18next.t('page.shopeeProduct.management.filter.status.ALL_STATUS')},
    ACCOUNT: {value: '', label: i18next.t('page.shopeeProduct.management.filter.account.ALL_ACCOUNT')},
};
const SHOPEE_STATUS = {
    LINK: 'LINK',
    SYNC: 'SYNC',
    UNLINK: 'UNLINK'
};
const STATUS_FILTER = {
    ALL_STATUS: DEFAULT_FILTER.STATUS,
    LINK: {value: SHOPEE_STATUS.LINK, label: i18next.t('page.shopeeProduct.management.filter.status.LINK')},
    SYNC: {value: SHOPEE_STATUS.SYNC, label: i18next.t('page.shopeeProduct.management.filter.status.SYNC')},
    UNLINK: {value: SHOPEE_STATUS.UNLINK, label: i18next.t('page.shopeeProduct.management.filter.status.UNLINK')},
};
const HEADERS = {
    ID: i18next.t('page.shopeeProduct.management.table.header.ID'),
    THUMBNAIL: i18next.t('page.shopeeProduct.management.table.header.THUMBNAIL'),
    NAME: i18next.t('page.shopeeProduct.management.table.header.NAME'),
    STOCK: i18next.t('page.shopeeProduct.management.table.header.STOCK'),
    STATUS: i18next.t('page.shopeeProduct.management.table.header.STATUS'),
    ACCOUNT: i18next.t('page.shopeeProduct.management.table.header.ACCOUNT'),
    LAST_UPDATED: i18next.t('page.shopeeProduct.management.table.header.LAST_UPDATED'),
};

const MAX_PAGE_SIZE = 100;
const MAX_SELECT_SIZE = 200;

const ShopeeProductManagement = (props) => {
    const [stPaging, setStPaging] = useState({
        page: 0,
        size: MAX_PAGE_SIZE,
        total: 0
    });

    const OPTION_DELETE = [{
        key: "OPT_1",
        value: false
    },
        {
            key: "OPT_2",
            value: false
        }];
    const [stShopeeProducts, setStShopeeProducts] = useState([]);
    const [stFilter, setStFilter] = useState({});
    const [stFilterAccounts, setStFilterAccounts] = useState([DEFAULT_FILTER.ACCOUNT]);
    const [stIsFetching, setStIsFetching] = useState(false);
    const [stIsShowLoading, setStIsShowLoading] = useState(false);
    const [stSelectedProducts, setStSelectedProducts] = useState([]);
    const [stSelectedShopeeItemIds, setStSelectedShopeeItemIds] = useState({});
    const [stActionToggle, setStActionToggle] = useState(false);
    const [stDeleteModalToggle, setStDeleteModalToggle] = useState(false);
    const [stSyncModalToggle, setStSyncModalToggle] = useState(false);
    const [stCreateModalToggle, setStCreateModalToggle] = useState(false);
    const [stOptDelete, setStOptDelete] = useState({
        [OPTION_DELETE[0].key]: OPTION_DELETE[0].value,
        [OPTION_DELETE[1].key]: OPTION_DELETE[1].value
    });
    const [stIsSynchronizing, setStIsSynchronizing] = useState(false);
    const [stTicker, setStTicker] = useState(moment.now());
    const [stIsDownloadingAProduct, setStIsDownloadingAProduct] = useState(false);

    const refAlertModal = useRef();
    const refConfirmModal = useRef();

    useEffect(() => {
        // get status of the synchronizing
        shopeeService.getProductDownloadingOrSynchronizing().then(res => {
            setStIsSynchronizing(res.isInProgress);
        }).catch(e => {
            // do nothing here
        });
    }, []);

    useEffect(() => {
        checkShopeeAccount();
        return () => {
        };
    }, []);

    useEffect(() => {
        shopeeService.getAllShopeeAccount()
            .then(response => {
                if (_.isEmpty(response)) {
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeeAccountIntro);
                }
            })
            .then(() => shopeeService.getConnectedShops())
            .then(accounts => {
                const filterAccounts = accounts.map(account => ({
                    value: account.shopId,
                    label: account.shopName
                }));

                setStFilterAccounts([
                    DEFAULT_FILTER.ACCOUNT,
                    ...filterAccounts
                ]);
            })
            .catch(() => GSToast.commonError())
    }, []);

    useEffect(() => {
        fetchData();
    }, [stPaging.page, stPaging.size, stFilter]);

    // useEffect(() => {
    //     if (!stIsDownloadingAProduct) {
    //         shopeeService.checkStoreIsDownloadingProduct()
    //             .then(isDownLoading => {
    //                 let products = _.cloneDeep(stShopeeProducts);
    //                 setStShopeeProducts(products.map(x => {
    //                     return {...x, isDownLoading: isDownLoading};
    //                 }));
    //             }).catch(
    //             () => {
    //                 let products = _.cloneDeep(stShopeeProducts);
    //                 setStShopeeProducts(products.map(x => {
    //                     return {...x, isDownLoading: true};
    //                 }));
    //             });
    //     }
    // }, [stTicker, stIsDownloadingAProduct]);
    //
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setStTicker(moment.now());
    //     }, Constants.SHOPEE_INTERVAL_TIME_VALUE);
    //     return () => clearInterval(interval);
    // }, []);

    const toggleModalDelete = () => {
        setStDeleteModalToggle(toggle => !toggle);
    };

    const checkShopeeAccount = () => {
        shopeeService.getAllShopeeAccount()
            .then(response => {
                if (_.isEmpty(response)) {
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeeAccountIntro);
                }
            });
    };

    const handleDeleteOption = (e) => {
        const {value, checked} = e.target;
        let optSelected = {...stOptDelete, ...{[value]: checked}};
        setStOptDelete(optSelected);
        return e;
    };

    const onClickDelete = () => {
        if (stSelectedProducts.length > 0) {
            toggleModalDelete();
            const shopeeShopIds = Object.keys(stSelectedShopeeItemIds);
            shopeeShopIds.forEach((shopeeId) => {
                let shopeeItemIds = stSelectedShopeeItemIds[shopeeId].filter(function (id, pos, self) {
                    return self.indexOf(id) === pos;
                });
                deleteProductShopee(shopeeId, shopeeItemIds);
                setStSelectedProducts([]);
            });
        }
    };

    const deleteProductShopee = (shopeeId, shopeeItemIds) => {
        setStIsFetching(true);
        const isDeleteGS = stOptDelete[OPTION_DELETE[0].key];
        const isDeleteSP = stOptDelete[OPTION_DELETE[1].key];
        shopeeService.deleteProductShopee(shopeeId, shopeeItemIds, isDeleteSP, isDeleteGS)
            .then((resp) => {
                GSToast.commonDelete();
                fetchData();
            })
            .catch((errResponse) => {
                const response = errResponse.response;
                const status = response.status;
                if (Constants.HTTP_STATUS_BAD_REQUEST === status && response?.data?.title === 'SHOP_NOT_FOUND') {
                    GSToast.error('shopee.alert.reconnect', true);
                } else {
                    GSToast.commonError()
                }
            })
            .finally(() => {
                setStIsFetching(false);
            });
    };

    const fetchData = () => {
        setStIsFetching(true);

        //Clear falsy props in object
        const filter = _.omitBy(stFilter, v => _.isUndefined(v) || _.isNull(v) || v === '');

        shopeeService.checkStoreIsDownloadingProduct().then(isDownloading => {
            shopeeService.getItemOfBcStore(stPaging.page, stPaging.size, filter)
                .then(({data, total}) => {
                    setStShopeeProducts(data.map(x => {
                        return {...x, isDownloading: isDownloading};
                    }));
                    setStPaging(paging => ({
                        ...paging,
                        total
                    }));
                })
                .catch(() => GSToast.commonError())
                .finally(() => setStIsFetching(false));
        });
    };

    const onSearch = _.debounce(keyword => {
        setStFilter(filters => ({
            ...filters,
            keyword: keyword
        }));
    }, 500);

    const handlePaging = (page) => {
        setStPaging(paging => ({
            ...paging,
            page: page - 1
        }));
    };

    const isSelectAllProducts = () => {
        if (!stShopeeProducts.length || !stSelectedProducts.length) {
            return;
        }

        const shopeeProdIds = stShopeeProducts.map(prod => prod.id);
        const without = _.without(shopeeProdIds, ...stSelectedProducts.map(prod => prod.id));

        return !without.length;
    };

    const handleSelectAllProduct = (e) => {
        const checked = e.target.checked;

        if (checked) {
            const selectedProduct = _.unionBy(stShopeeProducts, stSelectedProducts, 'id');

            if (selectedProduct.length > MAX_SELECT_SIZE) {
                openLimitSelectModal();

                return;
            }

            setStSelectedProducts(selectedProduct);
        } else {
            let selectedProducts = _.cloneDeep(stSelectedProducts);

            stShopeeProducts.forEach(prod => {
                _.remove(selectedProducts, selectedProd => selectedProd.id === prod.id);
            });

            setStSelectedProducts(selectedProducts);
        }

        handleSelectAllProductForDelete(e);
    };

    const handleSelectAllProductForDelete = (e) => {
        const checked = e.target.checked;

        if (checked) {
            let selectedShopeeItemIds = {};
            stShopeeProducts.forEach(prod => {
                if (selectedShopeeItemIds[prod.shopeeShopId]) {
                    selectedShopeeItemIds[prod.shopeeShopId].push(prod.id);
                } else {
                    selectedShopeeItemIds[prod.shopeeShopId] = [prod.id];
                }
            });
            setStSelectedShopeeItemIds(selectedShopeeItemIds);
        } else {
            setStSelectedShopeeItemIds([]);
        }
    };

    const isSelectedProduct = (prodId) => {
        return stSelectedProducts.findIndex(prod => prod.id === prodId) > -1;
    };

    const openLimitSelectModal = () => {
        refAlertModal.current.openModal({
            type: GSAlertModalType.ALERT_TYPE_WARNING,
            messages: i18next.t('page.shopeeProduct.management.limitSelect'),
        });
    };

    const handleSelectProduct = (e, product) => {
        const checked = e.target.checked;

        if (checked) {
            if (stSelectedProducts.length === MAX_SELECT_SIZE) {
                openLimitSelectModal();

                return;
            }

            setStSelectedProducts(prods => [...prods, product]);

            return;
        }

        const index = stSelectedProducts.findIndex(prod => prod.id === product.id);

        if (index < 0) {
            return;
        }

        setStSelectedProducts(prods => {
            prods.splice(index, 1);

            return [...prods];
        });
    };

    const handleSelectProductForDelete = (e, itemId, shopeeShopId) => {
        const checked = e.target.checked;
        let stSelected = {...stSelectedShopeeItemIds};
        if (checked) {
            if (stSelected[shopeeShopId]) {
                stSelected[shopeeShopId].push(itemId);
            } else {
                stSelected[shopeeShopId] = [itemId];
            }
        } else {
            const isExisted = stSelected[shopeeShopId].indexOf(itemId);
            if (isExisted !== -1) {
                stSelected[shopeeShopId].splice(isExisted, 1);
            }
        }
        setStSelectedShopeeItemIds(stSelected);
    };

    const getSyncModalBcItemId = () => {
        const selectedProductsHasBcItem = stSelectedProducts.filter(prod => prod.hasOwnProperty('bcItemId'));
        const selectedProductIdsHasBcItemNoDup = _.uniqBy(selectedProductsHasBcItem, prod => prod.bcItemId);

        return selectedProductIdsHasBcItemNoDup.length !== selectedProductsHasBcItem.length;
    };

    const renderDeleteModal = () => {
        return (
            <Modal isOpen={stDeleteModalToggle} toggle={toggleModalDelete} modalClassName={`modalDeleteProduct`}>
                <ModalHeader toggle={toggleModalDelete}><Trans
                    i18nKey="page.shopee.account.DeleteProduct.title"></Trans></ModalHeader>
                <ModalBody>
                    <p><Trans i18nKey="page.shopee.account.DeleteProduct.title2"
                              values={{quantity: stSelectedProducts.length}}></Trans></p>
                    <div className={`boxCheckedDelete`}>
                        <UikCheckbox
                            checked={stOptDelete[OPTION_DELETE[0].key]}
                            value={OPTION_DELETE[0].key}
                            key={OPTION_DELETE[0].key}
                            onChange={e => handleDeleteOption(e)}
                            className="custom-check-box"
                        />
                        <span>{i18next.t("page.shopee.account.DeleteProduct.description1")}</span>
                    </div>
                    <div className={`boxCheckedDelete`}>
                        <UikCheckbox
                            checked={stOptDelete[OPTION_DELETE[1].key]}
                            value={OPTION_DELETE[1].key}
                            key={OPTION_DELETE[1].key}
                            onChange={e => handleDeleteOption(e)}
                            className="custom-check-box"
                        />
                        <span>{i18next.t("page.shopee.account.DeleteProduct.description2")}</span>
                    </div>
                    <div className={"common-note mt-1 font-size-_9rem"}>
                        {i18next.t('common.txt.notice')}: {i18next.t('product.delete.notice.incomplete.transfer')}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={toggleModalDelete}>
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                    <GSButton success marginLeft onClick={onClickDelete}>
                        <GSTrans t={"common.txt.alert.modal.btn"}/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        );
    };

    const toggleSync = () => {
        setStSyncModalToggle(toggle => {
            return !toggle;
        });
    };

    const toggleSyncClose = (isSynchronizing) => {
        if (isSynchronizing && isSynchronizing.isHronizing === true) {
            setStIsSynchronizing(isSynchronizing);
        }
        setStSyncModalToggle(false);
    };

    const toggleCreate = () => {
        setStCreateModalToggle(toggle => {
            return !toggle;
        });
    };

    const toggleCreateClose = (isSynchronizing) => {
        if (isSynchronizing && isSynchronizing.isHronizing === true) {
            setStIsSynchronizing(isSynchronizing);
        }

        setStCreateModalToggle(false);
    };

    const downloadShopeeProduct = (shopeeShopId, shopeeItemId) => {
        setStIsShowLoading(true);
        setStIsDownloadingAProduct(true);
        shopeeService.downloadAProduct(shopeeShopId, shopeeItemId)
            .then(() => {
                fetchData();
            })
            .catch(() => GSToast.commonError())
            .finally(() => {
                setStIsDownloadingAProduct(false);
                setStIsShowLoading(false);
            });
    };

    return (
        <>
            {stIsShowLoading && <LoadingScreen/>}
            <AlertModal ref={refAlertModal}/>
            <ConfirmModal ref={refConfirmModal}/>
            {renderDeleteModal()}

            <ModalCreateProductGosell
                toggle={stCreateModalToggle}
                selectedProducts={stSelectedProducts}
                onClose={toggleCreateClose}
                isSynchronizing={stIsSynchronizing}
            />

            <ModalSyncProductGosell
                toggle={stSyncModalToggle}
                selectedProducts={stSelectedProducts}
                syncModalBcItemId={getSyncModalBcItemId}
                onClose={toggleSyncClose}
                isSynchronizing={stIsSynchronizing}
            />

            <GSContentContainer className='shopee-product-management'>
                <GSContentHeader title={
                    <GSContentHeaderTitleWithExtraTag title={i18next.t('page.shopeeProduct.management.header')}
                                                      extra={stPaging.total}
                    />
                }>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX} className='h-100'>
                    <GSWidget>
                        <GSWidgetContent className='d-flex flex-column'>
                            <div className='d-flex'>
                                <UikInput
                                    onChange={(e) => onSearch(e.currentTarget.value)}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18next.t("page.shopeeProduct.management.search.placeholder")}
                                    maxLength={150}
                                />
                                {
                                    stIsSynchronizing &&
                                    <div className="synchronize-status">
                                        <FontAwesomeIcon className="image-status__grey image-rotate" icon="sync-alt"/>
                                        <span
                                            class="synchronize-status-text">{i18next.t('page.shopee.products.label.status.is_synchronizing')}</span>
                                    </div>
                                }

                                <div className='ml-auto'>
                                    <UikSelect
                                        className='pr-0 pr-sm-2'
                                        defaultValue={DEFAULT_FILTER.STATUS.value}
                                        options={Object.values(STATUS_FILTER)}
                                        onChange={({value}) => {
                                            setStSelectedProducts([])
                                            setStFilter(filter => ({
                                                ...filter,
                                                gosellStatus: [value]
                                            }))
                                        }}
                                    />
                                    <UikSelect
                                        key={stFilterAccounts}
                                        className='mt-2 mt-sm-0 pr-0 pr-sm-2'
                                        defaultValue={DEFAULT_FILTER.ACCOUNT.value}
                                        options={stFilterAccounts}
                                        onChange={({value}) => {
                                            setStSelectedProducts([])
                                            setStFilter(filter => ({
                                                ...filter,
                                                shopeeShopIds: value ? [value] : value
                                            }))
                                        }}
                                    />
                                </div>
                            </div>
                            {
                                !!stSelectedProducts.length &&
                                <div className='d-flex mt-3 font-weight-500 gsa__uppercase font-size-_9em'>
                                    <span>
                                        <GSTrans t='page.shopeeProduct.management.selected'
                                                 values={{number: stSelectedProducts.length}}/>
                                    </span>
                                    <GSDropdownAction
                                        className='ml-4'
                                        toggle={stActionToggle}
                                        onToggle={toggle => setStActionToggle(toggle)}
                                        actions={[{
                                            label: i18next.t('page.shopeeProduct.management.actions.createToGS'),
                                            onAction: toggleCreate
                                        }, {
                                            label: i18next.t('page.shopeeProduct.management.actions.syncToGS'),
                                            onAction: toggleSync
                                        }, {
                                            label: i18next.t('page.shopeeProduct.management.actions.delete'),
                                            onAction: toggleModalDelete
                                        }]}
                                    />
                                </div>
                            }
                            <div className='overflow-x-auto mt-3'>
                                {stIsFetching
                                    ? <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                                    : <>
                                        <GSTable className='table'>
                                            <colgroup>
                                                <col style={{width: '15%'}}/>
                                                <col style={{width: '10%'}}/>
                                                <col style={{width: '15%'}}/>
                                                <col style={{width: '10%'}}/>
                                                <col style={{width: '10%'}}/>
                                                <col style={{width: '10%'}}/>
                                                <col style={{width: '9%'}}/>
                                                <col style={{width: '3%'}}/>
                                            </colgroup>
                                            <thead>
                                            <tr>
                                                <th>
                                                    <UikCheckbox
                                                        className='m-0'
                                                        checked={isSelectAllProducts()}
                                                        onChange={handleSelectAllProduct}
                                                    />
                                                    {HEADERS.ID}
                                                </th>
                                                <th>{HEADERS.THUMBNAIL}</th>
                                                <th>{HEADERS.NAME}</th>
                                                <th>{HEADERS.STOCK}</th>
                                                <th>{HEADERS.STATUS}</th>
                                                <th>{HEADERS.ACCOUNT}</th>
                                                <th>{HEADERS.LAST_UPDATED}</th>
                                                <th>&nbsp;</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                stShopeeProducts.map((prod) => (
                                                    <tr key={`${prod.id}-${prod.isDownLoading}`}
                                                        className="gs-table-body-items cursor--pointer gsa-hover--gray"
                                                        onClick={(e) => {
                                                            if (!$(e.target).closest('td').hasClass('no-redirect')) {
                                                                if (prod.gosellStatus === "LINK" || prod.gosellStatus === "SYNC") {
                                                                    RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeeEditProduct + "/" + prod.bcItemId);

                                                                }
                                                                // RouteUtils.redirectWithoutReload(props, `${NAV_PATH.shopeeEditProduct}/form/${prod.id}`);
                                                            }
                                                        }}
                                                    >
                                                        <td className="gs-table-body-item no-redirect">
                                                            <UikCheckbox
                                                                className='m-0'
                                                                name={'checkbox_' + prod.id}
                                                                checked={isSelectedProduct(prod.id)}
                                                                label={prod.shopeeItemId}
                                                                onChange={(e) => {
                                                                    handleSelectProduct(e, prod);
                                                                    handleSelectProductForDelete(e, prod.id, prod.shopeeShopId);
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="gs-table-body-item">
                                                            <GSImg src={
                                                                prod.thumbnail
                                                                    ? ImageUtils.getImageFromImageModel(ImageUtils.mapImageUrlToImageModel(prod.thumbnail), 100)
                                                                    : '/assets/images/default_image.png'
                                                            } width={70} height={70}/>
                                                        </td>
                                                        <td className="gs-table-body-item">
                                                            <span>{prod.shoppeeItemName}</span>
                                                        </td>
                                                        <td className="gs-table-body-item">
                                                            <span>{NumberUtils.formatThousand(prod.stock)}</span>
                                                        </td>
                                                        <td className="gs-table-body-item white-space-nowrap">
                                                        <span>
                                                            <GSImg className='mr-2 mb-1'
                                                                   src={`/assets/images/_${prod.gosellStatus}.svg`}></GSImg>
                                                            <GSTrans
                                                                t={`page.shopeeProduct.management.filter.status.${prod.gosellStatus}`}/>
                                                        </span>
                                                            {prod.hasLinkErrorStatus && <GSComponentTooltip
                                                                message={i18next.t('page.shopeeProduct.management.status.warning.hint')}
                                                                placement={GSComponentTooltipPlacement.BOTTOM}
                                                            >
                                                                <GSImg className='ml-3 mb-1'
                                                                       src='/assets/images/warning.svg'></GSImg>
                                                            </GSComponentTooltip>}
                                                        </td>
                                                        <td className="gs-table-body-item">
                                                            <span>{prod.shopeeShopName}</span>
                                                        </td>
                                                        <td className="gs-table-body-item">
                                                            {
                                                                moment(prod.lastSyncDate).format('DD-MM-YYYY')
                                                            }
                                                        </td>
                                                        <td className="gs-table-body-item no-redirect">
                                                            <FontAwesomeIcon onClick={() => downloadShopeeProduct(prod.shopeeShopId, prod.shopeeItemId)}
                                                                className={prod.isDownLoading === true ? 'gs-atm--disable' : ''}
                                                                icon="download"></FontAwesomeIcon>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                            </tbody>
                                        </GSTable>
                                        <GSPagination
                                            totalItem={stPaging.total}
                                            currentPage={stPaging.page + 1}
                                            pageSize={stPaging.size}
                                            onChangePage={handlePaging}
                                        >
                                        </GSPagination>
                                    </>
                                }
                            </div>
                            {/*{*/}
                            {/*    !stIsFetching && !stCampaigns.length && <GSWidgetEmptyContent*/}
                            {/*        className="m-auto flex-grow-1 background-color-white"*/}
                            {/*        text={i18next.t("page.flashSale.management.table.empty")}*/}
                            {/*        iconSrc={"/assets/images/flashsale_empty.png"}*/}
                            {/*    />*/}
                            {/*}*/}
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
            </GSContentContainer>
        </>
    );
};

ShopeeProductManagement.defaultProps = {};

ShopeeProductManagement.propTypes = {};

export default ShopeeProductManagement;

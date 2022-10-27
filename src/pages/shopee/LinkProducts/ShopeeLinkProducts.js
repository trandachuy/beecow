import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import i18next from "i18next";
import _ from 'lodash';
import React, {useEffect, useRef, useState} from 'react';
import {Trans} from "react-i18next";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {UikCheckbox, UikInput, UikSelect} from "../../../@uik";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSAlertModal from "../../../components/shared/GSAlertModal/GSAlertModal";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSImg from "../../../components/shared/GSImg/GSImg";
import GSPagination from "../../../components/shared/GSPagination/GSPagination";
import GSTable from "../../../components/shared/GSTable/GSTable";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import shopeeService from "../../../services/ShopeeService";
import {GSToast} from "../../../utils/gs-toast";
import {RouteUtils} from '../../../utils/route';
import LinkProductSearchBox from "./LinkProductSearchBox.js";
import ProductVariationMappingModal, {VariationContext} from "./ProductVariationMappingModal.js";
import './ShopeeLinkProducts.sass';
import {AgencyService} from "../../../services/AgencyService";
import GSDropdownAction from "../../../components/shared/GSDropdownAction/GSDropdownAction";

const DEFAULT_FILTER = {
    STATUS: {value: '', label: i18next.t('page.shopeeProduct.management.filter.status.ALL_STATUS')},
    ACCOUNT: {value: '', label: i18next.t('page.shopeeProduct.management.filter.account.ALL_ACCOUNT')},
}
const SHOPEE_STATUS = {
    LINK: 'LINK',
    SYNC: 'SYNC',
    UNLINK: 'UNLINK'
}
const STATUS_FILTER = {
    ALL_STATUS: DEFAULT_FILTER.STATUS,
    LINK: {value: SHOPEE_STATUS.LINK, label: i18next.t('page.shopeeProduct.management.filter.status.LINK')},
    UNLINK: {value: SHOPEE_STATUS.UNLINK, label: i18next.t('page.shopeeProduct.management.filter.status.UNLINK')},
}


const ShopeeLinkProducts = (props) => {
    const [stPaging, setStPaging] = useState({
        page: 1,
        size: 100,
        total: 0
    })
    const HEADERS = {
        ID: i18next.t('page.shopeeProduct.management.table.header.ID'),
        THUMBNAIL: i18next.t('page.shopeeProduct.management.table.header.THUMBNAIL'),
        NAME: i18next.t('page.shopeeProduct.management.table.header.NAME'),
        GSPRODUCTNAME: i18next.t('page.shopeeProduct.linkProduct.table.header.GSPRODUCTNAME', {provider: AgencyService.getDashboardName()}),
        GSPRODUCTID: i18next.t('page.shopeeProduct.linkProduct.table.header.GSPRODUCTID', {provider: AgencyService.getDashboardName()}),
    }
    const [stShopeeProducts, setStShopeeProducts] = useState([])
    const [stFilter, setStFilter] = useState({})
    const [stFilterAccounts, setStFilterAccounts] = useState([DEFAULT_FILTER.ACCOUNT])
    const [stIsFetching, setStIsFetching] = useState(false)
    const [stSelectedProductIds, setStSelectedProductIds] = useState([])
    const [stActionToggle, setStActionToggle] = useState(false)
    const [disableModal, setDisableModal] = useState(false);
    const [listUnlinkItem,] = useState([]);
    const [stSyncModalToggle, setStSyncModalToggle] = useState(false);
    const [stCheckedSelectSync, setStCheckedSelectSync] = useState(false);
    const [listPostItem,] = useState([]);
    const [isVariationMismatched, setIsVariationMismatched] = useState(null);
    const [selectedBcItem, setSelectedBcItem] = useState(null);
    const [processingSpItem, setProcessingSpItem] = useState(null);
    const [shopeeItemAndShopId,setShopeeItemAndShopId]=useState({})
    const [stLoading,setStLoading]=useState(false)
    const [mapVariations, setMapVariations] = useState({});

    const refAlertModal = useRef()
    const refConfirmModal = useRef()

    useEffect(() => {
        getAllShopeeAccount();
    }, [])

    useEffect(() => {
        shopeeService.getConnectedShops()
            .then(accounts => {
                const filterAccounts = accounts.map(account => ({
                    value: account.shopId,
                    label: account.shopName
                }))

                setStFilterAccounts([
                    DEFAULT_FILTER.ACCOUNT,
                    ...filterAccounts
                ])
            })
            .catch(() => GSToast.commonError())
    }, [])

    useEffect(() => {
        fetchData()
    }, [stPaging.page, stPaging.size, stFilter])


    const getAllShopeeAccount = () => {
        shopeeService.getAllShopeeAccount()
            .then(response => {

                response.map(x => {
                    listPostItem.push({
                        shopId: x.shopId,
                        listItem: []
                    });
                })
                if (_.isEmpty(response)) {
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeeAccountIntro);
                }
            })

    }


    const fetchData = () => {
        setStIsFetching(true)

        //Clear falsy props in object
        const filter = _.omitBy(stFilter, v => _.isUndefined(v) || _.isNull(v) || v === '')

        shopeeService.getItemOfBcStore(stPaging.page - 1, stPaging.size, {
            ...filter,
            getBcItemName: true,
            sort: 'update_time,DESC'
        })
            .then(({data, total}) => {
                const items = data;

                setStShopeeProducts(items)
                setStPaging(paging => ({
                    ...paging,
                    total
                }))
            })
            .catch(() => GSToast.commonError())
            .finally(() => setStIsFetching(false))
    }

    const onSearch = _.debounce(keyword => {
        setStFilter(filters => ({
            ...filters,
            keyword: keyword
        }))
    }, 500)

    const handlePaging = (page) => {
        setStPaging(paging => ({
            ...paging,
            page
        }))
    }

    const isSelectAllProducts = () => {
        if (!stShopeeProducts.length || stSelectedProductIds.length < stShopeeProducts.length) {
            return
        }

        const shopeeProdIds = stShopeeProducts.map(prod => prod.id)
        const without = _.without(shopeeProdIds, ...stSelectedProductIds)

        return !without.length
    }

    const handleSelectAllProduct = (e) => {
        const checked = e.target.checked
        const selectedProdId = [];
        if (checked) {
            stShopeeProducts.map(prod => (prod.gosellStatus != "UNLINK") ? (selectedProdId.push(prod.id)) : (null))

            setStSelectedProductIds(selectedProdId)
        } else {
            setStSelectedProductIds([])
        }
    }

    const isSelectedProduct = (prodId) => {
        return stSelectedProductIds.includes(prodId)
    }

    const handleSelectProduct = (e, prodId, status) => {
        const checked = e.target.checked
        if (checked) {
            setStSelectedProductIds(prods => [...prods, prodId])

            return
        }

        const index = stSelectedProductIds.indexOf(prodId)

        if (index < 0) {
            return
        }

        setStSelectedProductIds(prods => {
            prods.splice(index, 1)

            return [...prods]
        })
    }

    const handleSelectSync = (e) => {
        const checked = e.target.checked
        setStCheckedSelectSync(checked)
    }

    const getSyncModalStatus = () => {
        const status = {
            isLink: false,
            isUnLink: false,
            isSync: false,
        }

        stSelectedProductIds.forEach(prodId => {
            const prod = stShopeeProducts.find(prod => prod.id === prodId)

            if (!prod) {
                return
            }

            switch (prod.gosellStatus) {
                case SHOPEE_STATUS.SYNC:
                    status.isSync = true
                    break

                case SHOPEE_STATUS.LINK:
                    status.isLink = true
                    break

                case SHOPEE_STATUS.UNLINK:
                    status.isUnLink = true
                    break
            }
        })

        return status
    }

    const openModalUnlink = () => {
        refConfirmModal.current.openModal({
            messages: i18next.t("page.shopeeProduct.linkProduct.unlink.modal.title", {
                x: stSelectedProductIds.length
            }),
            okCallback:async function () {
                setStLoading(true)
                listPostItem.map(x => {
                    x.listItem.splice(0, x.listItem.length);
                });
                listUnlinkItem.splice(0, listUnlinkItem.length);
                stShopeeProducts.filter(product => {
                    !stSelectedProductIds.find(idItem => {
                        if (product.id == idItem) {
                            listUnlinkItem.push({
                                shopeeItemId: product.shopeeItemId,
                                shopeeShopId: product.shopeeShopId
                            })

                        }
                    });
                });
                listUnlinkItem.map(item => {
                    listPostItem[listPostItem.findIndex(x => x.shopId == item.shopeeShopId)].listItem.push(item.shopeeItemId);

                });

                let result= await listPostItem.map(item => {
                    shopeeService.unlinkShopeeItems(item.shopId, item.listItem)

                });
                setStLoading(false)
                window.location.reload()
            }

        });
    };
    const clickUnlinkItem = (shopeeItemId, shopeeShopId, bcItemName, shopeeItemName) => {
        setShopeeItemAndShopId({
            bcItemName: bcItemName,
            shopeeItemName: shopeeItemName,
            shopeeItemId: shopeeItemId,
            shopeeShopId: shopeeShopId
        })
        setDisableModal(true)

    }
    const clickAcceptUnlink=()=>{
        setStLoading(true)
        stShopeeProducts.find(product => (product.shopeeItemId === shopeeItemAndShopId.shopeeItemId) ? (product.gosellStatus = "UNLINK") : (null));
        shopeeService.unlinkShopeeItems(shopeeItemAndShopId.shopeeShopId, shopeeItemAndShopId.shopeeItemId).finally(setStLoading(false));

        setDisableModal(false)
    }
    const RenderSyncModal = () => {
        const {isLink, isUnLink, isSync} = getSyncModalStatus()

        if ((isSync || isLink) && isUnLink) {
            return (
                <Modal isOpen={stSyncModalToggle} toggle={toggleSync} className="toggleSync">
                    <ModalHeader toggle={toggleSync}>{i18next.t('page.setting.VAT.delete.title')}</ModalHeader>
                    <ModalBody>
                        <p className="mb-2">{i18next.t('page.shopee.products.modal.description.created')}</p>
                        <p className="mb-2">{i18next.t('page.shopee.products.modal.description.synced')}</p>

                        <div className="d-flex justify-content-center align-items-center">
                            <UikCheckbox
                                className='m-0'
                                onChange={(e) => handleSelectSync(e)}
                            />{i18next.t('page.shopee.products.modal.action')}
                        </div>

                        <div className="row actionSelectSync" hidden={!stCheckedSelectSync}>
                            <div className='checkbox col-6 d-flex justify-content-start align-items-center'>
                                <UikCheckbox
                                    className='m-0'
                                />
                                {i18next.t('page.shopee.products.modal.action.name')}
                            </div>
                            <div className='checkbox col-6 d-flex justify-content-start align-items-center'>
                                <UikCheckbox
                                    className='m-0'
                                />
                                {i18next.t('page.shopee.products.modal.action.description')}
                            </div>
                            <div className='checkbox col-6 d-flex justify-content-start align-items-center'>
                                <UikCheckbox
                                    className='m-0'
                                />
                                {i18next.t('page.shopee.products.modal.action.price')}
                            </div>
                            <div className='checkbox col-6 d-flex justify-content-start align-items-center'>
                                <UikCheckbox
                                    className='m-0'
                                />
                                {i18next.t('page.shopee.products.modal.action.stock')}
                            </div>

                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <GSButton success>
                            <GSTrans t={"common.txt.alert.modal.btn"}/>
                        </GSButton>
                    </ModalFooter>
                </Modal>
            )
        }

        if (isSync || isLink) {
            return (
                <Modal isOpen={stSyncModalToggle} toggle={toggleSync} className="toggleSync">
                    <ModalHeader toggle={toggleSync}>{i18next.t('page.setting.VAT.delete.title')}</ModalHeader>
                    <ModalBody>
                        <p className="mb-2">{i18next.t('page.shopee.products.modal.description.synced')}</p>

                        <div className="d-flex justify-content-center align-items-center">
                            <UikCheckbox
                                className='m-0'
                                onChange={(e) => handleSelectSync(e)}
                            />{i18next.t('page.shopee.products.modal.action')}
                        </div>

                        <div className="row actionSelectSync" hidden={!stCheckedSelectSync}>
                            <div className='checkbox col-6 d-flex justify-content-start align-items-center'>
                                <UikCheckbox
                                    className='m-0'
                                />
                                {i18next.t('page.shopee.products.modal.action.name')}
                            </div>
                            <div className='checkbox col-6 d-flex justify-content-start align-items-center'>
                                <UikCheckbox
                                    className='m-0'
                                />
                                {i18next.t('page.shopee.products.modal.action.description')}
                            </div>
                            <div className='checkbox col-6 d-flex justify-content-start align-items-center'>
                                <UikCheckbox
                                    className='m-0'
                                />
                                {i18next.t('page.shopee.products.modal.action.price')}
                            </div>
                            <div className='checkbox col-6 d-flex justify-content-start align-items-center'>
                                <UikCheckbox
                                    className='m-0'
                                />
                                {i18next.t('page.shopee.products.modal.action.stock')}
                            </div>

                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <GSButton success>
                            <GSTrans t={"common.txt.alert.modal.btn"}/>
                        </GSButton>
                    </ModalFooter>
                </Modal>
            )
        }

        return (
            <Modal isOpen={stSyncModalToggle} toggle={toggleSync} className="toggleSync">
                <ModalHeader toggle={toggleSync}>{i18next.t('page.setting.VAT.delete.title')}</ModalHeader>
                <ModalBody>
                    {i18next.t('page.shopee.products.modal.description.created')}
                </ModalBody>
                <ModalFooter>
                    <GSButton success>
                        <GSTrans t={"common.txt.alert.modal.btn"}/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }

    const toggleSync = () => {
        setStSyncModalToggle(toggle => {
            return !toggle
        });
    }

    return (
        <>
            <GSAlertModal ref={refAlertModal}/>
            <ConfirmModal ref={refConfirmModal}/>
            {isVariationMismatched === true && selectedBcItem &&
                <VariationContext.Provider value={{
                    processingSpItem,
                    selectedBcItem,
                    setIsVariationMismatched,
                    stShopeeProducts,
                    setStShopeeProducts,
                    mapVariations,
                    setMapVariations
                }}>
                <ProductVariationMappingModal/>
            </VariationContext.Provider>
            }
            {RenderSyncModal()}

            <GSContentContainer className='shopee-link-product'>
                <GSContentHeader title={
                    <GSContentHeaderTitleWithExtraTag title={i18next.t('page.shopeeProduct.linkProduct.header', {
                        provider: AgencyService.getDashboardName()
                    })}
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

                                <div className='ml-auto'>
                                    <UikSelect
                                        className='pr-0 pr-sm-2'
                                        defaultValue={DEFAULT_FILTER.STATUS.value}
                                        options={Object.values(STATUS_FILTER)}
                                        onChange={({value}) => {
                                            const statuses = [value]

                                            if (value === SHOPEE_STATUS.LINK) {
                                                statuses.push(SHOPEE_STATUS.SYNC)
                                            }

                                            setStFilter(filter => ({
                                                ...filter,
                                                gosellStatus: statuses
                                            }))
                                        }}
                                    />
                                    <UikSelect
                                        key={stFilterAccounts}
                                        className='mt-2 mt-sm-0 pr-0 pr-sm-2'
                                        defaultValue={DEFAULT_FILTER.ACCOUNT.value}
                                        options={stFilterAccounts}
                                        onChange={({value}) => setStFilter(filter => ({
                                            ...filter,
                                            shopeeShopIds: value ? [value] : value
                                        }))}
                                    />
                                </div>
                            </div>
                            {
                                !!stSelectedProductIds.length &&
                                <div className='d-flex mt-3 font-weight-500 gsa__uppercase font-size-_9em'>
                                    <span>
                                        <GSTrans t='page.shopeeProduct.management.selected'
                                                 values={{number: stSelectedProductIds.length}}/>
                                    </span>
                                    <GSDropdownAction
                                        className='ml-4'
                                        toggle={stActionToggle}
                                        onToggle={toggle => setStActionToggle(toggle)}
                                        actions={[{
                                            label: i18next.t('page.shopeeProduct.management.actions.unlink'),
                                            onAction: openModalUnlink
                                        }]}
                                    />
                                </div>
                            }
                            <div className='overflow-x-auto mt-3'>
                                {
                                    (stIsFetching || stLoading)
                                    ? <Loading style={LoadingStyle.DUAL_RING_GREY} />
                                    : <>
                                        <GSTable className='table'>
                                            <colgroup>
                                                <col style={{width: '1%'}}/>
                                                <col style={{width: '15%'}}/>
                                                <col style={{width: '10%'}}/>
                                                <col style={{width: '15%'}}/>
                                                <col style={{ width: '5%' }} />
                                                <col style={{width: '5%'}}/>
                                                <col style={{width: '15%'}}/>
                                                <col style={{ width: '15%' }} />
                                            </colgroup>
                                                <thead>
                                                <tr>
                                                    <th>
                                                        <UikCheckbox
                                                            className='m-0'
                                                            checked={isSelectAllProducts()}
                                                            onChange={handleSelectAllProduct}
                                                        />
                                                    </th>
                                                    <th>{HEADERS.ID}</th>
                                                    <th>{HEADERS.THUMBNAIL}</th>
                                                    <th>{HEADERS.NAME}</th>
                                                    <th></th>
                                                    <th></th>
                                                    <th>{HEADERS.GSPRODUCTNAME}</th>
                                                    <th>{HEADERS.GSPRODUCTID}</th>
                                                </tr>
                                                </thead>
                                                <tbody>{
                                                    stShopeeProducts.map((shopeeItem) => {
                                                        return (
                                                        <tr key={shopeeItem.id}>
                                                            <td>
                                                                <UikCheckbox
                                                                    disabled={(shopeeItem.gosellStatus != 'UNLINK') ? (false) : (true)}
                                                                    className='m-0 gs-table-body-item'
                                                                    name={'checkbox_' + shopeeItem.id}
                                                                    checked={isSelectedProduct(shopeeItem.id)}
                                                                    onChange={(e) => handleSelectProduct(e, shopeeItem.id, shopeeItem.gosellStatus)}
                                                                />
                                                            </td>
                                                            <td className="gs-table-body-item">
                                                                <span>{shopeeItem.shopeeItemId}</span>
                                                            </td>
                                                            <td className="gs-table-body-item">
                                                                    <img src={shopeeItem.thumbnail
                                                                        ? shopeeItem.thumbnail
                                                                        : '/assets/images/default_image.png'}
                                                                        width={70} height={70} />
                                                            </td>
                                                            <td className="gs-table-body-item">
                                                                <span>{shopeeItem.shoppeeItemName}</span>
                                                            </td>
                                                            {
                                                                shopeeItem.gosellStatus == "LINK" || shopeeItem.gosellStatus == "SYNC" ? (
                                                                    <td className="gs-table-body-item"
                                                                        style={{textAlign: 'center'}}>
                                                                        <GSImg
                                                                            onClick={() => clickUnlinkItem(shopeeItem.shopeeItemId, shopeeItem.shopeeShopId, shopeeItem.bcItemName, shopeeItem.shoppeeItemName)}
                                                                            className="cursor--pointer"
                                                                            src="/assets/images/broken-link.svg"/>
                                                                    </td>) : (<td className="gs-table-body-item"></td>)
                                                            }
                                                            <td className="gs-table-body-item">
                                                                {(shopeeItem.gosellStatus == "LINK" || shopeeItem.gosellStatus == "SYNC") &&
                                                                    <img src={shopeeItem.bcItemThumbnail
                                                                        ? shopeeItem.bcItemThumbnail
                                                                        : '/assets/images/default_image.png'} width={70} height={70} />
                                                                }
                                                            </td>
                                                            <td className="gs-table-body-item">
                                                                {
                                                                    (shopeeItem.gosellStatus == "LINK" || shopeeItem.gosellStatus == "SYNC")
                                                                        ? <p>{shopeeItem.bcItemName}</p>
                                                                        : <LinkProductSearchBox
                                                                                key={shopeeItem.id}
                                                                                onClick={() => setProcessingSpItem(shopeeItem)}
                                                                                shopeeItem={shopeeItem}
                                                                                setIsVariationMismatched={setIsVariationMismatched}
                                                                                setSelectedBcItem={setSelectedBcItem}
                                                                                stShopeeProducts={stShopeeProducts}
                                                                                setStShopeeProducts={setStShopeeProducts} />
                                                                }

                                                            </td>
                                                            <td className="gs-table-body-item">
                                                                {
                                                                    (shopeeItem.gosellStatus == "LINK" || shopeeItem.gosellStatus == "SYNC") ? (
                                                                        <p>{shopeeItem.bcItemId}</p>) : (null)
                                                                }

                                                            </td>
                                                        </tr>
                                                        );
                                                    })
                                                }
                                                </tbody>
                                            </GSTable>
                                            <GSPagination
                                                totalItem={stPaging.total}
                                                currentPage={stPaging.page}
                                                pageSize={stPaging.size}
                                                onChangePage={handlePaging}
                                            >
                                            </GSPagination>
                                        </>
                                }
                            </div>

                            <Modal isOpen={disableModal}
                                   modalClassName={`modalDeleteProduct`}>
                                <ModalHeader><Trans
                                    i18nKey="page.shopeeProduct.linkProduct.notification.title"></Trans></ModalHeader>
                                <ModalBody>
                                    <p><Trans i18nKey="page.shopeeProduct.linkProduct.notification.title2"
                                    ></Trans></p>
                                    <ul className="text-left" style={{paddingLeft: '15px'}}>
                                        <li style={{
                                            fontWeight: '300',
                                            fontSize: '14px'
                                        }}>{shopeeItemAndShopId.shopeeItemName}</li>
                                        <li style={{
                                            fontWeight: '300',
                                            fontSize: '14px'
                                        }}>{shopeeItemAndShopId.bcItemName}</li>
                                    </ul>


                                </ModalBody>
                                <ModalFooter>
                                    <GSButton className='mr-3' onClick={() => setDisableModal(false)}>
                                        <GSTrans t={"common.btn.cancel"}/>
                                    </GSButton>
                                    <GSButton success marginLeft
                                              onClick={() => clickAcceptUnlink()}
                                    >
                                        <GSTrans t={"common.txt.alert.modal.btn"}/>
                                    </GSButton>
                                </ModalFooter>
                            </Modal>
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
            </GSContentContainer>
        </>
    )
}

ShopeeLinkProducts.defaultProps = {}

ShopeeLinkProducts.propTypes = {}

export default ShopeeLinkProducts

import React, {useState} from "react";
import "./AffiliateInventory.sass";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import i18next from "i18next";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import {UikInput, UikSelect} from "../../../@uik";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSTable from "../../../components/shared/GSTable/GSTable";
import GSWidgetEmptyContent from "../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import GSPagination from "../../../components/shared/GSPagination/GSPagination";
import useDebounceEffect from "../../../utils/hooks/useDebounceEffect";
import {GSToast} from "../../../utils/gs-toast";
import PropTypes from "prop-types";
import {ItemService} from "../../../services/ItemService";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {ImageUtils} from "../../../utils/image";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import {RouteUtils} from '../../../utils/route'
import {STAFF_PERMISSIONS} from "../../../config/staff-permissions";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import { CurrencyUtils } from "../../../utils/number-format";

const AffiliateInventory = (props) => {

    const filterSearchType = [
        {
            value: 'PRODUCT',
            label: i18next.t("component.button.selector.searchType.affiliate.product"),
        },
        {
            value: 'PARTNER',
            label: i18next.t("component.button.selector.searchType.affiliate.partner"),
        }
    ]

    const onFilterSearchType = (type) => {
        setStSearchType(type)
    }

    const SIZE_PER_PAGE = 50;
    const [stIsFetching, setStIsFetching] = useState(false);
    const [stSearchType, setStSearchType] = useState('PRODUCT')
    const [stSearch, setStSearch] = useState();

    const [stItemList, setStItemList] = useState([]);
    const [stPaging, setStPaging] = useState({
        totalItem: 0,
        page: 0,
    });

    useDebounceEffect(() => {
        fetchData();
    }, 300, [stPaging.page, stSearch]);

    const fetchData = () => {
        setStIsFetching(true);
        Promise.all([
            ItemService.getPartnerProductInventory(stPaging.page, SIZE_PER_PAGE, stSearch),
        ])
            .then(([rs]) => {
                setStItemList(rs.data)
                setStPaging((state) => ({
                    ...state,
                    totalItem: new Number(rs.headers['x-total-count'] || 0),
                }))
                setStIsFetching(false)
            })
            .catch(() => GSToast.commonError())
    };

    const onChangePage = (page) => {
        setStPaging((state) => ({
            ...state,
            page: page - 1,
        }));
    };

    const handleSearch = (e) => {
        const keyword = e.currentTarget.value

        if (stSearchType === 'PARTNER') {
            setStSearch({
                partnerSearchValue : keyword
            })
        }
        else {
            setStSearch({
                productSearchValue : keyword
            })
        }
    }

    return (
        <GSContentContainer className="affiliate-payout-history">
            <GSContentHeader
                title={
                    <GSContentHeaderTitleWithExtraTag
                        title={i18next.t(
                            "page.affiliate.partner.inventory.title"
                        )}
                        extra={stPaging.totalItem}
                    />
                }
            >
                <GSContentHeaderRightEl>
                    <PrivateComponent hasStaffPermission={[STAFF_PERMISSIONS.PRODUCTS, STAFF_PERMISSIONS.MARKETING]}
                                      wrapperDisplay={"block"}
                    >
                        <GSButton success onClick={() => RouteUtils.redirectWithoutReload(props, NAV_PATH.partnerTransferStockCreate)}
                                  className="btn-save">
                            <i className="icon-plus"></i>
                            <Trans i18nKey="page.affiliate.partner.inventory.transfer.btn" className="sr-only">
                            </Trans>
                        </GSButton>
                    </PrivateComponent>
                </GSContentHeaderRightEl>
            </GSContentHeader>
            <GSContentBody
                size={GSContentBody.size.MAX}
                className="d-flex flex-column flex-grow-1"
            >
                <GSWidget className="flex-grow-1 d-flex flex-column mb-0 justify-content-center">
                    {stIsFetching &&
                    <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                    }
                    {!stIsFetching &&
                    <GSWidgetContent className="d-flex flex-column flex-grow-1">
                        {/*FILTER*/}
                        <div
                            className={
                                "affiliate-payout__filter-container" +
                                (stIsFetching ? "gs-atm--disable" : "")
                            }
                        >
                            {/*SEARCH*/}
                            <div className="d-flex mb-2 mb-md-0">
                                <div className="search">
                                    <UikInput
                                        className="search-input"
                                        icon={
                                            <FontAwesomeIcon icon={"search"}/>
                                        }
                                        iconPosition="left"
                                        placeholder={i18next.t(
                                            "common.input.searchBy",
                                            {
                                                by: i18next.t(
                                                    `page.affiliate.inventory.${stSearchType}`
                                                ),
                                            }
                                        )}
                                        onBlur={handleSearch}
                                        style={{
                                            width: '20em',
                                            height: "38px",
                                        }}
                                    />
                                </div>
                            </div>
                            {/* FILTER SEARCH TYPE */}
                            <div style={{'marginLeft': '7px'}}/>
                            <UikSelect
                                defaultValue={filterSearchType[0].value}
                                options={filterSearchType}
                                onChange={(item) => onFilterSearchType(item.value)}
                            />
                        </div>
                        {/*DATA TABLE*/}
                        <div className="d-flex flex-column flex-grow-1 mt-3 affiliate-payout__table">
                            <GSTable>
                                <colgroup>
                                    <col style={{width: '12%'}}/>
                                    <col style={{width: '10%'}}/>
                                    <col style={{width: '20%'}}/>
                                    <col style={{width: '12%'}}/>
                                    <col style={{width: '12%'}}/>
                                    <col style={{width: '12%'}}/>
                                    <col style={{width: '12%'}}/>
                                </colgroup>
                                <thead>
                                <tr>
                                    <th>
                                        <GSTrans t="page.affiliate.inventory.header.productId"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.inventory.header.image"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.inventory.header.productName"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.inventory.header.transferTotal"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.inventory.header.partnerSold"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.inventory.header.RemainingStock"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.inventory.header.partnerCode"/>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {stItemList && stItemList.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            {item.productId}
                                        </td>
                                        <td>
                                            {
                                                item.image?.urlPrefix &&
                                                <img src={ImageUtils.getImageFromImageModel(item.image, 100)}
                                                    style={{
                                                        width: '4em',
                                                        height: '4em'
                                                    }}
                                                    alt=""
                                                />
                                            }
                                            {!item.image?.urlPrefix &&
                                            <img src={"/assets/images/default_image.png"}
                                                style={{
                                                    width: '4em',
                                                    height: '4em'
                                                }}
                                                alt=""
                                            />
                                            }
                                        </td>
                                        <td className='affiliate-inventory-product-name'>
                                            <div className='name'>{item.itemName}</div>
                                            <div style={{'color': '#969696'}}>{item.modelName}</div>
                                        </td>
                                        <td>
                                            {item.transferTotal}
                                        </td>
                                        <td>
                                            {item.partnerSold}
                                        </td>
                                        <td>
                                            {item.remainingStock}
                                        </td>
                                        <td>
                                            {item.partnerCode}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </GSTable>
                            {stItemList && stItemList.length === 0 && !stIsFetching && (
                                <GSWidgetEmptyContent
                                    iconSrc="/assets/images/affiliate/partner-inventory-empty.svg"
                                    text={i18next.t(
                                        "page.affiliate.partner-inventory.empty"
                                    )}
                                    className="flex-grow-1"
                                />
                            )}

                            <GSPagination
                                totalItem={stPaging.totalItem}
                                currentPage={stPaging.page + 1}
                                onChangePage={onChangePage}
                                pageSize={SIZE_PER_PAGE}
                            />
                        </div>

                    </GSWidgetContent>
                    }
                </GSWidget>
            </GSContentBody>
        </GSContentContainer>
    );
};

AffiliateInventory.defaultProps = {
    currency: CurrencyUtils.getLocalStorageSymbol()
};

AffiliateInventory.propTypes = {
    currency: PropTypes.string,
};

export default AffiliateInventory
import React, { useContext, useEffect, useState } from "react";
import "./AffiliatePayoutHistory.sass";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSContentHeaderTitleWithExtraTag from "../../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import i18next from "i18next";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import { CurrencyUtils, NumberUtils } from "../../../../utils/number-format";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import PropTypes from "prop-types";
import { UikInput } from "../../../../@uik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GSTable from "../../../../components/shared/GSTable/GSTable";
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import GSPagination from "../../../../components/shared/GSPagination/GSPagination";
import moment from "moment";
import GSDateRangePicker from "../../../../components/shared/GSDateRangePicker/GSDateRangePicker";
import { AffiliateContext } from "../../context/AffiliateContext";
import GSContentHeaderRightEl from "../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSTooltip from "../../../../components/shared/GSTooltip/GSTooltip";
import GSComponentTooltip from "../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import affiliateService from "../../../../services/AffiliateService";
import { GSToast } from "../../../../utils/gs-toast";
import useDebounceEffect from "../../../../utils/hooks/useDebounceEffect";
import AnimatedNumber from '../../../../components/shared/AnimatedNumber/AnimatedNumber'
import Constants from "../../../../config/Constant";

const SEARCH_BY = {
    PARTNER: "PARTNER",
};

const SIZE_PER_PAGE = 50;

const STORE_CURRENCY_SYMBOL = CurrencyUtils.getLocalStorageSymbol()

const AffiliatePayoutHistory = (props) => {
    const {state} = useContext(AffiliateContext.context);

    const [stIsFetching, setStIsFetching] = useState(false);
    const [stSearch, setStSearch] = useState({
        keyword: "",
        by: SEARCH_BY.PARTNER,
    });
    const [stPayoutList, setStPayoutList] = useState([]);
    const [stPaging, setStPaging] = useState({
        totalItem: 0,
        page: 0,
        fromDate: undefined,
        toDate: undefined,
        keyword: '',
        totalPaidAmount: 0
    });
    const [stDefaultPrecision, setStDefaultPrecision] = useState()

    useEffect(() => {
        if(STORE_CURRENCY_SYMBOL !== Constants.CURRENCY.VND.SYMBOL){
            setStDefaultPrecision(2)
        }else{
            setStDefaultPrecision(0)
        }
    },[])

    useDebounceEffect(() => {
        fetchData();
    }, 300, [stPaging.page, stPaging.fromDate, stPaging.toDate, stPaging.keyword]);

    const fetchData = () => {
        const {page, fromDate, toDate, keyword} = stPaging
        const options = {
            fromDate,
            toDate,
            searchKeywords: keyword
        }

        Promise.all([
            affiliateService.getPayoutHistories(page, SIZE_PER_PAGE, options),
            affiliateService.getTotalPaidAmountOfPayoutHistory(options)
        ])
            .then(([rs, paidAmount]) => {
                setStPayoutList(rs.data)
                setStPaging((state) => ({
                    ...state,
                    totalItem: new Number(rs.headers['x-total-count'] || 0),
                    totalPaidAmount: paidAmount
                }))
            })
            .catch(() => GSToast.commonError())
    };

    const onChangePage = (page) => {
        setStPaging((state) => ({
            ...state,
            page: page - 1,
        }));
    };

    const onFilterByDateChange = (event, picker) => {
        if (event.type === "cancel") {
            setStPaging((state) => ({
                ...state,
                fromDate: undefined,
                toDate: undefined,
            }));
        } else {
            const fromDate = picker.startDate;
            const toDate = picker.endDate;
            setStPaging((state) => ({
                ...state,
                fromDate,
                toDate,
            }));
        }
    };

    const handleSearch = (e) => {
        const keyword = e.currentTarget.value
        setStPaging((state) => ({
            ...state,
            keyword
        }))
    }

    const renderLongString = (s, maxLength) => {
        const string = new String(s || '')

        if (!string || string.length <= maxLength) {
            return string
        }

        return (
            <GSComponentTooltip
                message={string}
                placement={GSTooltip.PLACEMENT.BOTTOM}
            >
                {string.substring(0, 25)}...
            </GSComponentTooltip>
        )
    }

    return (
        <GSContentContainer className="affiliate-payout-history">
            <GSContentHeader
                title={
                    <GSContentHeaderTitleWithExtraTag
                        title={i18next.t(
                            "page.affiliate.payoutHistory.title"
                        )}
                        extra={stPaging.totalItem}
                    />
                }
            >
                <GSContentHeaderRightEl>
                    <div className="affiliate-payout__widget-header-title">
                        <span className="font-size-1rem affiliate-payout__widget-header-revenue-count">
                            <img
                                src="/assets/images/affiliate/revenue-count.svg"
                                alt="payout-count"
                                width={28}
                                height={28}
                            />
                            <span
                                className="font-weight-500 color-gray pl-2  pr-3 affiliate-payout__widget-header-count-title">
                                <GSTrans t="page.affiliate.payoutHistory.paidAmount"/>
                                :&nbsp;
                            </span>

                            <AnimatedNumber className="font-weight-bold" 
                                currency={ props.currency }
                                precision={ stDefaultPrecision }
                            >
                                { stPaging.totalPaidAmount }
                            </AnimatedNumber>
                        </span>
                    </div>
                </GSContentHeaderRightEl>
            </GSContentHeader>
            <GSContentBody
                size={GSContentBody.size.MAX}
                className="d-flex flex-column flex-grow-1"
            >
                <GSWidget className="flex-grow-1 d-flex flex-column mb-0">
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
                                                    `page.affiliate.payoutHistory.${stSearch.by}`
                                                ),
                                            }
                                        )}
                                        onChange={handleSearch}
                                        style={{
                                            width: '20em',
                                            height: "38px",
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="ml-auto d-flex">
                                {/*DATE TIME*/}
                                <GSDateRangePicker
                                    minimumNights={0}
                                    onApply={onFilterByDateChange}
                                    onCancel={onFilterByDateChange}
                                    containerStyles={{
                                        width: "220px",
                                        marginRight: ".5rem",
                                    }}
                                    fromDate={stPaging.fromDate}
                                    toDate={stPaging.toDate}
                                    resultToString
                                    opens={"left"}
                                    readOnly
                                />
                            </div>
                        </div>
                        {/*DATA TABLE*/}
                        <div className="d-flex flex-column flex-grow-1 mt-3 affiliate-payout__table">
                            <GSTable>
                                <colgroup>
                                    <col style={{width: '10%'}}/>
                                    <col style={{width: '12%'}}/>
                                    <col style={{width: '6%'}}/>
                                    <col style={{width: '10%'}}/>
                                    <col style={{width: '20%'}}/>
                                    <col style={{width: '10%'}}/>
                                    <col style={{width: '20%'}}/>
                                </colgroup>
                                <thead>
                                <tr>
                                    <th>
                                        <GSTrans t="page.affiliate.payoutHistory.header.partnerCode"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.payoutHistory.header.partnerName"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.payoutHistory.header.date"/>
                                    </th>
                                    <th className="text-right">
                                        <GSTrans t="page.affiliate.payoutHistory.header.paidAmount"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.payoutHistory.header.bankName"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.payoutHistory.header.accountNumber"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.payoutHistory.header.note"/>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {stPayoutList && stPayoutList.map((payout) => (
                                    <tr
                                        key={payout.id}
                                    >
                                        <td>
                                            {payout.partnerCode}
                                        </td>
                                        <td>
                                            {renderLongString(payout.partnerName, 30)}
                                        </td>
                                        <td>
                                            {moment(payout.paidDate).format('HH:mm')}
                                            <br/>
                                            {moment(payout.paidDate).format('DD/MM/YYYY')}
                                        </td>
                                        <td className="text-right">
                                            {CurrencyUtils.formatDigitMoneyByCustom(payout.paidAmount, STORE_CURRENCY_SYMBOL, stDefaultPrecision)}
                                        </td>
                                        <td>
                                            {renderLongString(payout.bankName, 25)}
                                        </td>
                                        <td>
                                            {renderLongString(payout.accountNumber, 25)}
                                        </td>
                                        <td>
                                            {renderLongString(payout.note, 25)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </GSTable>
                            {stPayoutList && stPayoutList.length === 0 && !stIsFetching && (
                                <GSWidgetEmptyContent
                                    iconSrc="/assets/images/affiliate/icon_payouts.svg"
                                    text={i18next.t(
                                        "page.affiliate.payoutHistory.empty"
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
                </GSWidget>
            </GSContentBody>
        </GSContentContainer>
    );
};

AffiliatePayoutHistory.defaultProps = {
    currency: CurrencyUtils.getLocalStorageSymbol(),
};

AffiliatePayoutHistory.propTypes = {
    currency: PropTypes.string,
};

export default AffiliatePayoutHistory;

import "./AffiliatePayoutInformation.sass";
import React, {useEffect, useState} from "react";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSContentHeaderTitleWithExtraTag
    from "../../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import i18next from "i18next";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {UikInput} from "../../../../@uik";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSTable from "../../../../components/shared/GSTable/GSTable";
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import GSPagination from "../../../../components/shared/GSPagination/GSPagination";
import GSDateRangePicker from "../../../../components/shared/GSDateRangePicker/GSDateRangePicker";
import GSContentHeaderRightEl
    from "../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSTooltip from "../../../../components/shared/GSTooltip/GSTooltip";
import GSComponentTooltip from "../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import affiliateService from "../../../../services/AffiliateService";
import {GSToast} from "../../../../utils/gs-toast";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import PaymentImport from '../PaymentImportModal/PaymentImport';
import useDebounceEffect from "../../../../utils/hooks/useDebounceEffect";
import "./AffiliatePayoutInformation.sass";
import {AffiliateConstant} from "../../context/AffiliateConstant";
import AnimatedNumber from '../../../../components/shared/AnimatedNumber/AnimatedNumber'
import { CurrencyUtils, NumberUtils } from "../../../../utils/number-format";
import Constants from "../../../../config/Constant";

const SEARCH_BY = {
    PARTNER: "PARTNER",
};

const SIZE_PER_PAGE = 50;

const STORE_CURRENCY_SYMBOL = CurrencyUtils.getLocalStorageSymbol()

const AffiliatePayoutInformation = (props) => {
    const [stIsFetching, setStIsFetching] = useState(false);
    const [stLoading, setStLoading] = useState(false);
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
    });
    const [stStatisticData, setStStatisticData] = useState({
        totalCommission: 0,
        approvedAmount: 0,
        paidAmount: 0,
        payableAmount: 0
    });
    const [stDefaultPrecision, setStDefaultPrecision] = useState()

    useDebounceEffect(() => {
        fetchData();
        fetchStatistic();
    }, 300, [stPaging.page, stPaging.fromDate, stPaging.toDate, stPaging.keyword]);

    useEffect(() => {
        if(STORE_CURRENCY_SYMBOL !== Constants.CURRENCY.VND.SYMBOL){
            setStDefaultPrecision(2)
        }else{
            setStDefaultPrecision(0)
        }
    },[])

    const fetchData = () => {
        const {page, fromDate, toDate, keyword} = stPaging
        affiliateService.getPayoutInformation(page, SIZE_PER_PAGE, {
            fromDate,
            toDate,
            searchKeywords: keyword
        })
        .then(result => {
            setStPayoutList(result.data)
            setStPaging((state) => ({
                ...state,
                totalItem: new Number(result.headers['x-total-count']),
            }))
        })
        .catch(() => GSToast.commonError())
    };

    const fetchStatistic = () => {
        const {page, fromDate, toDate, keyword} = stPaging
        affiliateService.getPayoutStatistic(page, SIZE_PER_PAGE, {
            fromDate,
            toDate,
        })
        .then(result => {
            if (result.data) {
                setStStatisticData((state) => ({
                    ...state,
                    totalCommission: result.data.totalCommission,
                    approvedAmount: result.data.approvedAmount,
                    paidAmount: result.data.paidAmount,
                    payableAmount: result.data.payableAmount
                }))
            }
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
        const string = new String(s)

        if (!string || string.length <= maxLength) {
            return string
        }

        return (
            <GSComponentTooltip
                message={string}
                placement={GSTooltip.PLACEMENT.BOTTOM}
            >
                {string.substring(1, 25)}...
            </GSComponentTooltip>
        )
    }

    const [getIsOpenImportPopup, setIsOpenImportPopup] = useState(false);

    const exportPayment = () => {
        setStLoading(true);
        affiliateService
            .exportPayoutToExcel(stPaging.fromDate, stPaging.toDate, stPaging.keyword || undefined)
            .then((result) => {
                const fileName = `payout-export-${new Date()
                    .toJSON()
                    .replace(/T|-|:|\./gi, "")
                    .slice(0, -1)}.xlsx`;
                const url = window.URL.createObjectURL(new Blob([result]), {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(function () {
                    URL.revokeObjectURL(link.href);
                }, 1500);
            })
            .catch((e) => {
                GSToast.commonError();
            })
            .finally(() => {
                setStLoading(false);
            });
    };

    const showImportPaymentModal = () => {
        setIsOpenImportPopup(true);
    };

    const closeImportPaymentModal = () => {
        setIsOpenImportPopup(false);
    };

    const onImportCallback = () => {
        setIsOpenImportPopup(false)
    };

    const renderPartnerType = (type) => {
        let partnerType;
        if (type == AffiliateConstant.PARTNER_TYPE.RESELLER) {
            partnerType = i18next.t('page.affiliate.partner.filter.partnerType.RESELLER')

        } else {
            partnerType = i18next.t('page.affiliate.commission.partners.dropShipping')
        }
            return (
                <span>{partnerType}</span>
            )
    }

    const formatNumberCustom = (number) => {
        if(CurrencyUtils.isCurrencyInput(STORE_CURRENCY_SYMBOL)){
            number = NumberUtils.formatThousandFixed(number, stDefaultPrecision)
        }else{
            number = CurrencyUtils.formatThousand(number)
        }
        return number
    }

    return (
        <>
            {/*IMPORT MODAL*/}
            <PaymentImport
                isOpen={getIsOpenImportPopup}
                cancelCallback={closeImportPaymentModal}
                importCallback={onImportCallback}
            />
            <GSContentContainer
                className="affiliate-payout-history"
                isSaving={stLoading}
            >
                <GSContentHeader
                    title={
                        <GSContentHeaderTitleWithExtraTag
                            title={i18next.t(
                                "page.affiliate.payoutInfo.title"
                            )}
                            extra={stPaging.totalItem}
                        />
                    }
                >
                    <GSContentHeaderRightEl className="d-flex">
                        <div className="ml-md-auto d-flex payout-header">
                            <GSDateRangePicker
                                minimumNights={0}
                                onApply={onFilterByDateChange}
                                onCancel={onFilterByDateChange}
                                containerStyles={{
                                    marginRight: ".5rem",
                                }}
                                fromDate={stPaging.fromDate}
                                toDate={stPaging.toDate}
                                resultToString
                                opens={"left"}
                                readOnly
                            />
                        </div>
                        <GSButton success marginLeft onClick={exportPayment}>
                            <Trans i18nKey="page.affiliate.payout.export.button" className="sr-only">
                                Export
                            </Trans>
                        </GSButton>
                        <GSButton success marginLeft onClick={showImportPaymentModal}>
                            <Trans i18nKey="page.affiliate.payout.import.button" className="sr-only">
                                Import
                            </Trans>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody
                    size={GSContentBody.size.MAX}
                    className="d-flex flex-column flex-grow-1"
                >
                    <GSWidget className="flex-grow-1 d-flex flex-column mb-0">
                        <GSWidgetContent className="d-flex flex-column flex-grow-1">
                            <div className="box_row row mb-3">
                                <div className="col-md-3 col-6 item_partner">
                                    <div className="item_box">
                                        <div className="image_partner d-flex align-items-center">
                                            <img src="/assets/images/affiliate/icon_payout_1.svg" alt=""/>
                                            <span className="box-title">{i18next.t("page.affiliate.info.totalCommission")}</span>
                                        </div>
                                        <p className="box-amount totalCommission">
                                            <AnimatedNumber
                                                currency={STORE_CURRENCY_SYMBOL} 
                                                precision={stDefaultPrecision}
                                            >
                                                { stStatisticData.totalCommission }
                                            </AnimatedNumber>
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 item_partner ">
                                    <div className="item_box">
                                        <div className="image_partner d-flex align-items-center">
                                            <img src="/assets/images/affiliate/icon_payout_2.svg" alt=""/>
                                            <span className="box-title">{i18next.t("page.affiliate.payout.approvedAmount")}</span>
                                        </div>
                                        <p className="box-amount">
                                            <AnimatedNumber 
                                                currency={STORE_CURRENCY_SYMBOL} 
                                                precision={stDefaultPrecision}
                                            >
                                                { stStatisticData.approvedAmount }
                                            </AnimatedNumber>
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 item_partner">
                                    <div className="item_box">
                                        <div className="image_partner d-flex align-items-center">
                                            <img src="/assets/images/affiliate/icon_payout_3.svg" alt=""/>
                                            <span className="box-title">{i18next.t("page.affiliate.payout.paidAmount")}</span>
                                        </div>
                                        <p className="box-amount">
                                            <AnimatedNumber
                                                currency={STORE_CURRENCY_SYMBOL}
                                                precision={stDefaultPrecision}
                                            >
                                                { stStatisticData.paidAmount }
                                            </AnimatedNumber>
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 item_partner">
                                    <div className="item_box">
                                        <div className="image_partner d-flex align-items-center">
                                            <img src="/assets/images/affiliate/icon_payout_4.svg" alt=""/>
                                            <span className="box-title">{i18next.t("page.affiliate.payout.pendingAmount")}</span>
                                        </div>
                                        <p className="box-amount">
                                            <AnimatedNumber 
                                                currency={STORE_CURRENCY_SYMBOL} 
                                                precision={stDefaultPrecision}
                                            >
                                                { stStatisticData.payableAmount }
                                            </AnimatedNumber>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={
                                    "affiliate-payout__filter-container" +
                                    (stIsFetching ? "gs-atm--disable" : "")
                                }
                            >
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
                            </div>
                            {/*DATA TABLE*/}
                            <div className="d-flex flex-column flex-grow-1 mt-3 affiliate-payout__table">
                                <GSTable>
                                    <colgroup>
                                        <col style={{width: '12%'}}/>
                                        <col style={{width: '12%'}}/>
                                        <col style={{width: '12%'}}/>
                                        <col style={{width: '12%'}}/>
                                        <col style={{width: '12%'}}/>
                                        <col style={{width: '12%'}}/>
                                        <col style={{width: '12%'}}/>
                                        <col style={{width: '12%'}}/>
                                    </colgroup>
                                    <thead>
                                    <tr>
                                        <th>
                                            <GSTrans t="page.affiliate.payoutInfo.header.partnerCode"/>
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.payoutInfo.header.partnerName"/>
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.payoutInfo.header.partnerType"/>
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.payoutInfo.header.revenue"/>
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.payoutInfo.header.totalCommission"/>
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.payoutInfo.header.approvedAmount"/>
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.payoutInfo.header.paidAmount"/>
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.payoutInfo.header.payableAmount"/>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {stPayoutList.map((payout) => (
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
                                                {renderPartnerType(payout.partnerType)}
                                            </td>
                                            <td>
                                                {payout.revenue ? formatNumberCustom(payout.revenue): 0}
                                            </td>
                                            <td>
                                                {payout.totalCommission ? formatNumberCustom(payout.totalCommission): 0}
                                            </td>
                                            <td>
                                                {payout.approvedAmount ? formatNumberCustom(payout.approvedAmount): 0}
                                            </td>
                                            <td>
                                                {payout.paidAmount ? formatNumberCustom(payout.paidAmount): 0}
                                            </td>
                                            <td>
                                                {payout.payableAmount ? formatNumberCustom(payout.payableAmount): 0}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </GSTable>
                                {stPayoutList.length === 0 && !stIsFetching && (
                                    <GSWidgetEmptyContent
                                        iconSrc="/assets/images/affiliate/payout_empty.svg"
                                        text={i18next.t(
                                            "page.affiliate.payoutInfo.empty"
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
        </>
    );
};

AffiliatePayoutInformation.defaultProps = {}

AffiliatePayoutInformation.propTypes = {}

export default AffiliatePayoutInformation;

import React, {useEffect, useMemo, useRef, useState, useCallback} from "react";
import "./AffiliatePartner.sass";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import {NAV_PATH} from "../../../components/layout/navigation/AffiliateNavigation";
import affiliateService from "../../../services/AffiliateService";
import AlertModal from "../../../components/shared/AlertModal/AlertModal";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import i18next from "i18next";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSComponentTooltip, {
    GSComponentTooltipPlacement,
} from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import Loading, {
    LoadingStyle,
} from "../../../components/shared/Loading/Loading";
import {UikInput} from "../../../@uik";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import moment from "moment";
import GSMegaFilter from "../../../components/shared/GSMegaFilter/GSMegaFilter";
import GSMegaFilterRowSelect from "../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowSelect";
import GSMegaFilterRowTag from "../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowTag";
import {RouteUtils} from "../../../utils/route";
import {Trans} from "react-i18next";
import GSMegaMobileFilter from "../../../components/shared/GSMegaFilter/GSMegaMobileFilter";
import {AffiliateConstant} from "../context/AffiliateConstant";
import ConfirmModal, {
    ConfirmModalUtils,
} from "../../../components/shared/ConfirmModal/ConfirmModal";
import {GSToast} from "../../../utils/gs-toast";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {AvField, AvForm} from "availity-reactstrap-validation";
import {CredentialUtils} from "../../../utils/credential";
import {FormValidate} from "../../../config/form-validate";
import {Link} from "react-router-dom";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {CurrencyUtils} from "../../../utils/number-format";
import GSWidgetEmptyContent from "../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";

const tableConfig = {
    headerList: [
        // 'check_box_all',
        i18next.t("page.affiliate.commission.partners.partnerCode"),
        i18next.t("page.affiliate.commission.name"),
        i18next.t("page.affiliate.commission.partners.table.commission"),
        i18next.t("page.affiliate.commission.partners.table.revenue"),
        i18next.t("component.custom.page.table.header.status"),
        i18next.t("page.affiliate.commission.partners.table.registerDate"),
        i18next.t("page.affiliate.commission.action"),
    ],
};


const tableCommission = {
    headerList: [
        // 'check_box_all',
        i18next.t("page.affiliate.commission.commission.name"),
        i18next.t("page.affiliate.commission.commission.type"),
        i18next.t("page.affiliate.commission.commission.rate"),
    ]
};


const SIZE_PER_PAGE = 50

const STORE_CURRENCY_SYMBOL = CurrencyUtils.getLocalStorageSymbol()

const AffiliatePartner = (props) => {

    const refAlert = useRef(null)
    const refRejectModal = useRef(null)
    const refOutsideClick = useRef();


    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    const [stPartners, setStPartners] = useState([])
    const [isFetching, setFetching] = useState(false);
    const [stCommissionRateList, setStCommissionRateList] = useState([
        {label: i18next.t('page.affiliate.partner.filter.commissionRate.all'), value: 'ALL'},
    ]);
    const [stSearchParams, setStSearchParams] = useState({
        keyword: '',
        partnerStatus: 'ALL',
        partnerType: 'ALL',
        commissionType: 'ALL',
        commissionRate: 'ALL',
        sort: 'createdDate,desc'
    })
    const [modal, setModal] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [selections, setSelections] = useState([]);
    const [stDisabledInputModal, setStDisabledInputModal] = useState([]);

    const [stPartnerList, setStPartnerList] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [stTotalCount, setStTotalCount] = useState(0);
    const [stPaging, setStPaging] = useState({
        totalItem: 0,
        page: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [stIsFetching, setStIsFetching] = useState(false);
    const [stRegexPartnerCode, setStRegexPartnerCode] = useState(false);
    const [stCheckPartnerCode, setStCheckPartnerCode] = useState(false);
    const [selectionsCommissionRate, setSelectionsCommissionRate] = useState([]);
    const [stAllCommissions, setStAllCommissions] = useState([])

    const [stPartnerId, setStPartnerId] = useState(null)
    const [stCheckActivatePartner, setStCheckActivatePartner] = useState(
        {
            numberOfPartner: null,
            hasApproval: true
        }
    )
    const [stPartnerType, setStPartnerType] = useState(null)
    const [stIsLoading, setStIsLoading] = useState(false);
    const [stLoadingCommission, setStLoadingCommission] = useState(false);
    const [stConflictCommission, setStConflictCommission] = useState(
        {
            commission1: '',
            commission2: '',
            isChecked: false
        }
    );
    const [stHasPackagePlanDropship, setStHasPackagePlanDropship] = useState(false);
    const [stHasPackagePlanReseller, setStHasPackagePlanReseller] = useState(false);

    const FILTER_STATUS_OPTIONS = useMemo(() => [
        {
            label: i18next.t`page.analytics.order.filter.all`,
            value: 'ALL'
        },
        {
            label: i18next.t`page.affiliate.partner.filter.status.PENDING`,
            value: AffiliateConstant.STATUS.PENDING
        },
        {
            label: i18next.t`page.affiliate.partner.filter.status.ACTIVATED`,
            value: AffiliateConstant.STATUS.ACTIVATED
        },
        {
            label: i18next.t`page.affiliate.partner.filter.status.DEACTIVATED`,
            value: AffiliateConstant.STATUS.DEACTIVATED
        },
        {
            label: i18next.t`page.affiliate.partner.filter.status.REJECTED`,
            value: AffiliateConstant.STATUS.REJECTED
        }
    ], [])

    const FILTER_PARTNER_TYPE_OPTIONS = useMemo(() => [
        {
            label: i18next.t`page.analytics.order.filter.all`,
            value: 'ALL'
        },
        {
            label: i18next.t`page.affiliate.partner.filter.partnerType.RESELLER`,
            value: AffiliateConstant.PARTNER_TYPE.RESELLER
        },
        {
            label: i18next.t`page.affiliate.commission.partners.dropShipping`,
            value: AffiliateConstant.PARTNER_TYPE.DROP_SHIP
        }
    ], [])

    const FILTER_COMMISSION_TYPE_OPTIONS = useMemo(() => [
        {
            label: i18next.t`page.analytics.order.filter.all`,
            value: 'ALL'
        },
        {
            label: i18next.t`page.affiliate.partner.filter.commissionType.All_PRODUCTS`,
            value: AffiliateConstant.COMMISSION_TYPE.All_PRODUCT
        },
        {
            label: i18next.t`page.affiliate.partner.filter.commissionType.SPECIFIC_PRODUCTS`,
            value: AffiliateConstant.COMMISSION_TYPE.SPECIFIC_PRODUCT
        },
        {
            label: i18next.t`page.affiliate.partner.filter.commissionType.SPECIFIC_COLLECTION`,
            value: AffiliateConstant.COMMISSION_TYPE.SPECIFIC_COLLECTION
        }
    ], [])
    const refApproveSaveForm = useRef()

    useEffect(() => {
        fetchData(0)
    }, [stSearchParams])

    useEffect(() => {
        fetchData()
    }, [stPaging.page]);

    useEffect(() => {
        affiliateService.getAllCommissionsByStore().then(allCommissionsByStore => {
            setStAllCommissions(allCommissionsByStore.data)
            setStCommissionRateList(prevState => [...prevState, ...allCommissionsByStore.data.map(b => ({
                label: b.name,
                value: b.id
            }))])
        })


        affiliateService.activatePartner(AffiliateConstant.PARTNER_TYPE.RESELLER)
            .then(activatePartner=>{
                setStHasPackagePlanReseller(activatePartner.data.hasPackagePlan)
            })
        affiliateService.activatePartner(AffiliateConstant.PARTNER_TYPE.DROP_SHIP)
            .then(activatePartner=>{
                setStHasPackagePlanDropship(activatePartner.data.hasPackagePlan)
            })
    }, [])


    const fetchData = (page) => {
        setStIsFetching(true)
        const requestParams = buildRequest()

        affiliateService.getListPartnerByStore(requestParams, page || stPaging.page, SIZE_PER_PAGE)
            .then(res => {
                setStPartnerList(res.data)
                setStPaging({
                    page: page === undefined ? stPaging.page : page,
                    totalItem: res.length
                })
                setStTotalCount(+(res.totalCount))
                setTotalPage(Math.ceil(res.totalCount / SIZE_PER_PAGE))
            })
            .finally(() => {
                setStIsFetching(false)
            })
    }

    const buildRequest = () => {
        const request = {
            ...stSearchParams
        }
        for (let requestKey in request) {
            if (request[requestKey] === 'ALL') {
                delete request[requestKey]
            }
        }
        return request
    }

    const onChangePage = (page) => {
        setStPaging(state => ({
            ...state,
            page: page - 1
        }))
        setCurrentPage(page)
    }

    const onMegaFilterChange = (values) => {
        setStSearchParams({
            ...stSearchParams,
            ...values
        })

    }


    const openApproveModal = (status, id, type) => {
        setStPartnerId(id)
        setStDisabledInputModal(status)
        setStPartnerType(type)
        if (status === AffiliateConstant.STATUS.DEACTIVATED) {
            affiliateService.getPartnerById(id).then(result => {
                affiliateService.getAllCommissionsByStore()
                    .then(allCommissionsByStore => {
                        let commissionIDs = []
                        result.data.commissions.forEach(commission => {
                            if (allCommissionsByStore.data.find(id => id.id === commission.id)) {
                                commissionIDs = [...commissionIDs, commission.id]
                            }
                        })
                        setSelectionsCommissionRate(commissionIDs)
                    })
            })
        }
        toggle()
    }

    const openRejectModal = (id, status) => {

        ConfirmModalUtils.openModal(refRejectModal, {
            messages: <>
                <p className="reject-description">{i18next.t("page.affiliate.partner.modal.cancel.description")}</p>
                {status != "ACTIVATED" &&
                <p className="reject-description">{i18next.t("page.affiliate.partner.modal.cancel.description2")}</p>}
            </>,
            modalTitle: i18next.t`page.affiliate.list.deleteConfirmText`,
            modalBtnOk: i18next.t`common.btn.yes2`,
            modalBtnCancel: i18next.t`common.btn.no`,
            okCallback: () => {
                setStIsLoading(true)
                affiliateService.rejectPartner(id).then(result => {
                    setStIsLoading(false)
                    let index = stPartnerList.findIndex(partners => partners.id === id)
                    if (index != -1) {
                        stPartnerList[index] = result
                        setStPartnerList(stPartnerList)
                        forceUpdate()
                        GSToast.success()

                    }
                })
            }
        })
    }

    const handlePartnerCode = (e) => {
        let regexPartnerCode = new RegExp("^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
        setStRegexPartnerCode(!regexPartnerCode.test(e.target.value.toUpperCase()))
        if (e.target.value != "") {
            affiliateService.checkPartnerCode(e.target.value.toUpperCase()).then(checkCode => {
                setStCheckPartnerCode(!checkCode.data)
            })
        }

    }


    const changeCommissionRate = event => {
        if (event.target.checked) {
            setStLoadingCommission(true)
            let commissions = [...selectionsCommissionRate, +(event.target.name)]
            let commissionEvent = event.target.name
            affiliateService.checkCommissionsConflict(commissions).then(result => {
                setStLoadingCommission(false)
                if (Object.keys(result).length > 0) {
                    const filtered = selectionsCommissionRate.filter(name => name !== +(commissionEvent));
                    setSelectionsCommissionRate(filtered);
                    document.getElementById(commissionEvent).checked = false

                    setStConflictCommission(
                        {
                            commission1: result[Object.keys(result)[0]][0],
                            commission2: Object.keys(result)[0],
                            isChecked: true
                        }
                    )

                } else {
                    setSelectionsCommissionRate([...selectionsCommissionRate, +(commissionEvent)]);
                    setStConflictCommission(
                        {
                            commission1: "",
                            commission2: "",
                            isChecked: false
                        }
                    )
                }
            }).catch(() => {
                setStLoadingCommission(false)
                const filtered = selectionsCommissionRate.filter(name => name !== +(commissionEvent));
                setSelectionsCommissionRate(filtered);
                document.getElementById(commissionEvent).checked = false
                GSToast.commonError()
            }).finally(() => {
                setStLoadingCommission(false)
            })

            return
        }
        setStConflictCommission(
            {
                commission1: "",
                commission2: "",
                isChecked: false
            }
        )
        const filtered = selectionsCommissionRate.filter(name => name !== +(event.target.name));
        return setSelectionsCommissionRate(filtered);
    };


    const handleApprovePartnerSubmit = (event, value) => {

        const request = {
            id: stPartnerId,
            storeId: +(CredentialUtils.getStoreId()),
            partnerCode: value.partnerCode,
            commissionIds: selectionsCommissionRate
        }

        if (selectionsCommissionRate.length > 0) {
            setStIsLoading(true)
            affiliateService.activatePartner(stPartnerType).then(activatePartner => {
                setStCheckActivatePartner(activatePartner.data)
                if (activatePartner.data.hasApproval) {
                    affiliateService.approvePartner(stPartnerId, request).then(result => {
                        affiliateService.getCommissionsByStoreIdAndPartnerId(stPartnerId)
                            .then(commissionsList => {
                                setStIsLoading(false)
                                let index = stPartnerList.findIndex(partners => partners.id === stPartnerId)
                                result['commissions'] = commissionsList
                                if (index != -1) {
                                    stPartnerList[index] = result
                                    setStPartnerList(stPartnerList)
                                    setSelectionsCommissionRate([])
                                    GSToast.success()
                                    toggle()
                                }
                            })
                            .finally(() => {
                                setStIsLoading(false)
                            })

                    })
                }
            })
        }


    }

    const handlePaymentPackage = (serviceType) => {
        RouteUtils.redirectWithReload(NAV_PATH.settingsAffiliatePlans, {
            serviceType
        })
    }

    const onSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (e.currentTarget.value === '') {
                setStSearchParams({
                    ...stSearchParams,
                    keyword: ''
                })
                fetchData(0)
            } else {
                setStSearchParams({
                    ...stSearchParams,
                    keyword: e.currentTarget.value
                })
            }
        }
    }

    const onSearchBlur = (e) => {
            if (e.currentTarget.value === '') {
                setStSearchParams({
                    ...stSearchParams,
                    keyword: ''
                })
                fetchData(0)
            } else {
                setStSearchParams({
                    ...stSearchParams,
                    keyword: e.currentTarget.value
                })
            }

    }

    const buildUrlLink = () => {
        const prefix = window.location.origin
        let url = prefix + NAV_PATH.affiliateCommissionCreate
        return url
    }

    const toggle = () => setModal(modal => !modal);


    const useOutsideClick = (ref, callback) => {
        const handleClick = e => {
            if (ref.current && !ref.current.contains(e.target)) {
                callback();
            }
        };

        useEffect(() => {
            document.addEventListener("click", handleClick);

            return () => {
                document.removeEventListener("click", handleClick);
            };
        });
    };

    useOutsideClick(refOutsideClick, () => {
        setExpanded(false)
        setStConflictCommission(
            {
                commission1: "",
                commission2: "",
                isChecked: false
            }
        )
    });

    const renderStyleTableBodyItems = (partnerType) => {
        return (
            !stHasPackagePlanDropship && partnerType === AffiliateConstant.PARTNER_TYPE.DROP_SHIP ? {opacity: "0.5"} :
                !stHasPackagePlanReseller && partnerType === AffiliateConstant.PARTNER_TYPE.RESELLER ? {opacity: "0.5"} : {}
        )
    }

    const renderStyleLink = (partnerType) => {
        return (
            !stHasPackagePlanDropship && partnerType === AffiliateConstant.PARTNER_TYPE.DROP_SHIP ? {display: "none"} :
                !stHasPackagePlanReseller && partnerType === AffiliateConstant.PARTNER_TYPE.RESELLER ? {display: "none"} : {}
        )
    }

    const renderApproveModal = () => {
        return (
            <Modal isOpen={modal} toggle={toggle} className={`partner-approve-modal`}>
                <ModalHeader toggle={toggle}>{i18next.t("page.affiliate.partner.approvePartner")}</ModalHeader>
                <ModalBody>
                    <AvForm
                        ref={refApproveSaveForm}
                        onValidSubmit={handleApprovePartnerSubmit}
                    >
                        <div className="pl-4 pr-4">
                            <AvField
                                label={`${i18next.t("page.affiliate.commission.partners.partnerCode")}`}
                                name="partnerCode"
                                type="text"
                                placeholder={""}
                                value={stPartnerList?.find(partnerId => partnerId.id == stPartnerId)?.partnerCode}
                                validate={{
                                    ...FormValidate.minLength(8, true, 'page.affiliate.partner.partnerCode.error'),
                                    ...FormValidate.maxLength(8),
                                    ...FormValidate.withCondition(
                                        stRegexPartnerCode,
                                        FormValidate.pattern.custom(/^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})+$/, 'page.affiliate.partner.validation.partnerCode')
                                    ),
                                    ...FormValidate.withCondition(
                                        stCheckPartnerCode,
                                        FormValidate.step(true, 'page.affiliate.partner.validation.exists.partnerCode')
                                    ),
                                }}
                                onBlur={handlePartnerCode}
                                disabled={stDisabledInputModal === AffiliateConstant.STATUS.PENDING ? false : true}
                            />
                            <p className="description">{i18next.t("page.affiliate.partner.modal.description")}</p>

                            <div className="commission-rate">
                                <p className="commission-title">{i18next.t("page.affiliate.commission.partners.commissionRate")}</p>
                                <div
                                    className={selectionsCommissionRate.length == 0 ? "commission-options validation" : "commission-options"}>
                                    <div onClick={() => {
                                        setExpanded((expanded) => !expanded)
                                        affiliateService.getAllCommissionsByStore()
                                            .then(allCommissionsByStore => {
                                                setStAllCommissions(allCommissionsByStore.data)
                                            })

                                    }}>
                                        <div className="options-checked"
                                        >
                                            {selectionsCommissionRate.length
                                                ?
                                                <span>
                                                    {selectionsCommissionRate.length} {i18next.t("page.affiliate.commission.partners.commission")}
                                                </span>

                                                : i18next.t("page.affiliate.commission.partners.selectCommission")}
                                        </div>
                                    </div>
                                    {expanded && (
                                        <div className="options-rate border-gray-200 border border-solid"
                                             ref={refOutsideClick}
                                        >
                                            {stLoadingCommission &&
                                            <Loading/>
                                            }
                                            {stAllCommissions.length === 0 &&
                                            <div className="label">
                                                {i18next.t("page.affiliate.partner.commission.create")}
                                                <a className="font-weight-bold font-italic ml-1"
                                                   href={`${buildUrlLink()}`}
                                                   target="_blank">{i18next.t("page.affiliate.partner.commission.create2")}</a>
                                            </div>
                                            }

                                            {
                                                stAllCommissions.length > 0 &&
                                                <>
                                                    <div className={'label-list'}>
                                                        {stAllCommissions.map(commissionRate => (
                                                            <div className="label" key={commissionRate.id}>
                                                                <input
                                                                    checked={selectionsCommissionRate.find(checked => checked == commissionRate.id)}
                                                                    id={commissionRate.id}
                                                                    type="checkbox"
                                                                    name={commissionRate.id}
                                                                    value={commissionRate.id}
                                                                    onChange={changeCommissionRate}
                                                                    className="m-2 cursor-pointer"
                                                                />

                                                                <label htmlFor="one" htmlFor={commissionRate.id}
                                                                       className="block m-0">
                                                                    {commissionRate.name}
                                                                </label>
                                                            </div>

                                                        ))}
                                                    </div>

                                                    <div className="modal-footer-commission">
                                                        {stConflictCommission.isChecked &&
                                                        <p>
                                                            {i18next.t("page.affiliate.partner.modal.error", {
                                                                x1: stConflictCommission.commission1,
                                                                x2: stConflictCommission.commission2
                                                            })}
                                                        </p>
                                                        }
                                                        <GSButton onClick={() => {
                                                            setExpanded(false)
                                                            setStConflictCommission(
                                                                {
                                                                    commission1: "",
                                                                    commission2: "",
                                                                    isChecked: false
                                                                }
                                                            )
                                                        }} success
                                                                  className="btn-save"
                                                                  marginRight style={{marginLeft: 'auto'}}>
                                                            <Trans i18nKey={'common.btn.done'} className="sr-only">
                                                                Save
                                                            </Trans>
                                                        </GSButton>
                                                    </div>
                                                </>
                                            }
                                        </div>
                                    )}

                                    {
                                        selectionsCommissionRate.length == 0 &&
                                        <div className={'validation-commission'}>
                                            <span>{i18next.t('page.affiliate.partner.create.nullCommission')}</span>
                                            <br/>
                                        </div>
                                    }
                                </div>

                            </div>

                        </div>
                        <ModalFooter>
                            {
                                !stCheckActivatePartner?.hasApproval &&
                                <div>
                                    <span>{i18next.t('page.affiliate.partner.modal.approve.description', {x: stCheckActivatePartner.numberOfPartner})}</span>
                                    <span className={'link'} onClick={() => handlePaymentPackage(stPartnerType)}>Upgrade now</span>
                                </div>
                            }


                            <GSButton danger onClick={(e) => {
                                e.preventDefault()
                                toggle()
                            }}>
                                <GSTrans t={"common.btn.no"}/>
                            </GSButton>
                            <GSButton success marginLeft
                                      onClick={(e) => {
                                          e.preventDefault()
                                          refApproveSaveForm.current.submit()
                                      }}
                            >
                                <GSTrans t={"common.btn.yes2"}/>
                            </GSButton>
                        </ModalFooter>
                    </AvForm>
                </ModalBody>

            </Modal>
        )
    }

    return (
        <>
            <ConfirmModal ref={refRejectModal} modalClass={"partner-approve-modal"}/>
            {stIsLoading &&
            <LoadingScreen zIndex={9999}/>
            }
            {renderApproveModal()}
            <GSContentContainer minWidthFitContent className="affiliate-partner-list-page">
                <GSContentHeader title={
                    <GSContentHeaderTitleWithExtraTag
                        title={i18next.t("page.affiliate.commission.partners.partnerManagement")}
                        extra={stTotalCount}
                    />
                }
                >
                    <GSContentHeaderRightEl>
                        {(stHasPackagePlanDropship || stHasPackagePlanReseller) &&
                        <GSButton success linkTo={NAV_PATH.affiliatePartnerCreate}>
                            <GSTrans t="page.affiliate.commission.partners.table.addPartner"/>
                        </GSButton>
                        }

                        {!stHasPackagePlanDropship && !stHasPackagePlanReseller &&
                        <GSComponentTooltip
                            placement={GSComponentTooltipPlacement.LEFT}
                            interactive
                            style={{
                                display: 'inline'
                            }}
                            html={
                                <GSTrans
                                    t="page.affiliate.partner.expired"
                                >
                                </GSTrans>
                            }>
                            <GSButton disabled success>
                                <GSTrans t="page.affiliate.commission.partners.table.addPartner"/>
                            </GSButton>
                        </GSComponentTooltip>
                        }
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX}
                               className="affiliate-partner-order-list__body-desktop d-mobile-none d-desktop-flex">
                    {/*SUPPLIER LIST*/}
                    <GSWidget>
                        <GSWidgetContent className="affiliate-partner-order-list-widget">

                            <div
                                className={"n-filter-container d-mobile-none d-desktop-flex " + (isFetching ? 'gs-atm--disable' : '')}>
                                {/*SEARCH*/}
                                <span style={{
                                    marginRight: 'auto'
                                }} className="gs-search-box__wrapper">
                                <UikInput
                                    onKeyPress={onSearchKeyPress}
                                    onBlur={onSearchBlur}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18next.t("page.affiliate.partner.filter.search")}
                                    maxLength={50}
                                />

                            </span>
                                <div className="ml-auto d-flex partner-filter">

                                    <GSMegaFilter size="medium" onSubmit={onMegaFilterChange}>
                                        <GSMegaFilterRowTag name="partnerStatus"
                                                            i18Key="component.custom.page.table.header.status"
                                                            options={FILTER_STATUS_OPTIONS}
                                                            defaultValue={stSearchParams.partnerStatus}
                                                            ignoreCountValue={'ALL'}

                                        />

                                        <GSMegaFilterRowTag name="partnerType"
                                                            i18Key="page.affiliate.partners.filter.type"
                                                            options={FILTER_PARTNER_TYPE_OPTIONS}
                                                            defaultValue={stSearchParams.partnerType}
                                                            ignoreCountValue={'ALL'}

                                        />

                                        <GSMegaFilterRowTag name="commissionType"
                                                            i18Key="page.affiliate.commission.partners.commissionType"
                                                            options={FILTER_COMMISSION_TYPE_OPTIONS}
                                                            defaultValue={stSearchParams.commissionType}
                                                            ignoreCountValue={'ALL'}

                                        />

                                        <GSMegaFilterRowSelect name="commissionRate"
                                                               i18Key="page.affiliate.commission.partners.commissionRate"
                                                               options={stCommissionRateList}
                                                               defaultValue={stSearchParams.commissionRate}
                                                               ignoreCountValue={'ALL'}
                                        />

                                    </GSMegaFilter>
                                </div>
                            </div>
                            {!isFetching &&
                            <>
                                <PagingTable
                                    headers={tableConfig.headerList}
                                    totalPage={totalPage}
                                    maxShowedPage={10}
                                    currentPage={currentPage}
                                    onChangePage={onChangePage}
                                    totalItems={stPartnerList.length}
                                    hidePagingEmpty
                                    className="d-mobile-none d-desktop-flex"
                                >
                                    {stPartnerList.map((item, index) => {
                                        return (
                                            <>
                                                <section
                                                    key={index}
                                                    className="gs-table-body-items gsa-hover--gray"
                                                    style={renderStyleTableBodyItems(item.partnerType)}

                                                >

                                                    <div className="shortest-row">

                                                        <div className={`gs-table-body-item`}>
                                                            <Link
                                                                to={NAV_PATH.affiliatePartnerEdit + `/${item.id}`}
                                                                style={renderStyleLink(item.partnerType)}
                                                            ></Link>


                                                            {!stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                <GSComponentTooltip
                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                    interactive
                                                                    style={{
                                                                        display: 'inline'
                                                                    }}
                                                                    html={
                                                                        <GSTrans
                                                                            t="page.affiliate.partner.expired"
                                                                        >
                                                                        </GSTrans>
                                                                    }>
                                                                    {item.partnerCode}
                                                                </GSComponentTooltip> :
                                                                !stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                    <GSComponentTooltip
                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                        interactive
                                                                        style={{
                                                                            display: 'inline'
                                                                        }}
                                                                        html={
                                                                            <GSTrans
                                                                                t="page.affiliate.partner.expired"
                                                                            >
                                                                            </GSTrans>
                                                                        }>
                                                                        {item.name}
                                                                    </GSComponentTooltip> : item.partnerCode
                                                            }
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            <Link
                                                                to={NAV_PATH.affiliatePartnerEdit + `/${item.id}`}
                                                                style={renderStyleLink(item.partnerType)}
                                                            ></Link>


                                                            {!stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                <GSComponentTooltip
                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                    interactive
                                                                    style={{
                                                                        display: 'inline'
                                                                    }}
                                                                    html={
                                                                        <GSTrans
                                                                            t="page.affiliate.partner.expired"
                                                                        >
                                                                        </GSTrans>
                                                                    }>
                                                                    {item.name}
                                                                </GSComponentTooltip> :
                                                                !stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                    <GSComponentTooltip
                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                        interactive
                                                                        style={{
                                                                            display: 'inline'
                                                                        }}
                                                                        html={
                                                                            <GSTrans
                                                                                t="page.affiliate.partner.expired"
                                                                            >
                                                                            </GSTrans>
                                                                        }>
                                                                        {item.name}
                                                                    </GSComponentTooltip> : item.name
                                                            }
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            <Link
                                                                to={NAV_PATH.affiliatePartnerEdit + `/${item.id}`}
                                                                style={renderStyleLink(item.partnerType)}
                                                            ></Link>
                                                            {item?.commissions?.length > 0 ?
                                                                <GSComponentTooltip
                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                    inertia={true}
                                                                    style={{
                                                                        display: 'inline'
                                                                    }}
                                                                    html={
                                                                        <>
                                                                            <PagingTable
                                                                                headers={tableCommission.headerList}
                                                                                totalItems={item?.commissions?.length}
                                                                                style={{minWidth: '500px'}}

                                                                            >
                                                                                {
                                                                                    item?.commissions?.map((item, index) => {
                                                                                        return <section
                                                                                            key={index + "_" + item.id}
                                                                                            className="gs-table-body-items"
                                                                                            data-id={item.id}>
                                                                                            <div
                                                                                                className={`gs-table-body-item`}>
                                                                                                {item.name}
                                                                                            </div>
                                                                                            <div
                                                                                                className={`gs-table-body-item`}>

                                                                                                {i18next.t(`page.affiliate.partner.filter.commissionType.${item.type}`)}
                                                                                            </div>
                                                                                            <div
                                                                                                className={`gs-table-body-item`}>
                                                                                                {item.rate}%
                                                                                            </div>

                                                                                        </section>
                                                                                    })
                                                                                }
                                                                            </PagingTable>
                                                                        </>
                                                                    }>
                                                                    {i18next.t("page.affiliate.partner.assignment", {x: item?.commissions?.length})}
                                                                </GSComponentTooltip> :
                                                                "-"
                                                            }
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            <Link
                                                                to={NAV_PATH.affiliatePartnerEdit + `/${item.id}`}
                                                                style={renderStyleLink(item.partnerType)}
                                                            ></Link>

                                                            {!stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                <GSComponentTooltip
                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                    interactive
                                                                    style={{
                                                                        display: 'inline'
                                                                    }}
                                                                    html={
                                                                        <GSTrans
                                                                            t="page.affiliate.partner.expired"
                                                                        >
                                                                        </GSTrans>
                                                                    }>
                                                                    {item.totalRevenue ? CurrencyUtils.formatMoneyByCurrency(item.totalRevenue, STORE_CURRENCY_SYMBOL) : CurrencyUtils.formatMoneyByCurrency(0, STORE_CURRENCY_SYMBOL)}
                                                                </GSComponentTooltip> :
                                                                !stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                    <GSComponentTooltip
                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                        interactive
                                                                        style={{
                                                                            display: 'inline'
                                                                        }}
                                                                        html={
                                                                            <GSTrans
                                                                                t="page.affiliate.partner.expired"
                                                                            >
                                                                            </GSTrans>
                                                                        }>
                                                                        {item.name}
                                                                    </GSComponentTooltip> : item.totalRevenue ? CurrencyUtils.formatMoneyByCurrency(item.totalRevenue, STORE_CURRENCY_SYMBOL) : CurrencyUtils.formatMoneyByCurrency(0, STORE_CURRENCY_SYMBOL)
                                                            }
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            <Link
                                                                to={NAV_PATH.affiliatePartnerEdit + `/${item.id}`}
                                                                style={renderStyleLink(item.partnerType)}
                                                            ></Link>
                                                            {!stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                <GSComponentTooltip
                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                    interactive
                                                                    style={{
                                                                        display: 'inline'
                                                                    }}
                                                                    html={
                                                                        <GSTrans
                                                                            t="page.affiliate.partner.expired"
                                                                        >
                                                                        </GSTrans>
                                                                    }>
                                                                    {i18next.t(`page.affiliate.partner.filter.status.${item.partnerStatus}`)}
                                                                </GSComponentTooltip> :
                                                                !stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                    <GSComponentTooltip
                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                        interactive
                                                                        style={{
                                                                            display: 'inline'
                                                                        }}
                                                                        html={
                                                                            <GSTrans
                                                                                t="page.affiliate.partner.expired"
                                                                            >
                                                                            </GSTrans>
                                                                        }>
                                                                        {item.name}
                                                                    </GSComponentTooltip> : i18next.t(`page.affiliate.partner.filter.status.${item.partnerStatus}`)
                                                            }
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            <Link
                                                                to={NAV_PATH.affiliatePartnerEdit + `/${item.id}`}
                                                                style={renderStyleLink(item.partnerType)}
                                                            ></Link>
                                                            {!stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                <GSComponentTooltip
                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                    interactive
                                                                    style={{
                                                                        display: 'inline'
                                                                    }}
                                                                    html={
                                                                        <GSTrans
                                                                            t="page.affiliate.partner.expired"
                                                                        >
                                                                        </GSTrans>
                                                                    }>
                                                                    {moment(item.createdDate).format('DD-MM-YYYY')}
                                                                </GSComponentTooltip> :
                                                                !stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                    <GSComponentTooltip
                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                        interactive
                                                                        style={{
                                                                            display: 'inline'
                                                                        }}
                                                                        html={
                                                                            <GSTrans
                                                                                t="page.affiliate.partner.expired"
                                                                            >
                                                                            </GSTrans>
                                                                        }>
                                                                        {item.name}
                                                                    </GSComponentTooltip> : moment(item.createdDate).format('DD-MM-YYYY')
                                                            }
                                                        </div>

                                                        <div className={`gs-table-body-item status`}>
                                                            {
                                                                item.partnerStatus === AffiliateConstant.STATUS.PENDING &&

                                                                <>
                                                                    {stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                        <>
                                                                            <GSComponentTooltip
                                                                                placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                interactive
                                                                                style={{
                                                                                    display: 'inline'
                                                                                }}
                                                                                html={

                                                                                    <GSTrans
                                                                                        t="page.affiliate.partner.icon.approve"
                                                                                    >
                                                                                    </GSTrans>
                                                                                }>
                                                                                <div
                                                                                    onClick={() => openApproveModal(AffiliateConstant.STATUS.PENDING, item.id, item.partnerType)}
                                                                                    className="button-check">

                                                                                </div>
                                                                            </GSComponentTooltip>

                                                                            <GSComponentTooltip
                                                                                placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                interactive
                                                                                style={{
                                                                                    display: 'inline'
                                                                                }}
                                                                                html={

                                                                                    <GSTrans
                                                                                        t="page.affiliate.commission.partners.table.reject"
                                                                                    >
                                                                                    </GSTrans>
                                                                                }>
                                                                                <div
                                                                                    onClick={() => {
                                                                                        openRejectModal(item.id, item.partnerStatus)
                                                                                    }}
                                                                                    className="button-cancel">

                                                                                </div>
                                                                            </GSComponentTooltip>
                                                                        </>
                                                                        :
                                                                        stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                            <>
                                                                                <GSComponentTooltip
                                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                    interactive
                                                                                    style={{
                                                                                        display: 'inline'
                                                                                    }}
                                                                                    html={

                                                                                        <GSTrans
                                                                                            t="page.affiliate.partner.icon.approve"
                                                                                        >
                                                                                        </GSTrans>
                                                                                    }>
                                                                                    <div
                                                                                        onClick={() => openApproveModal(AffiliateConstant.STATUS.PENDING, item.id, item.partnerType)}
                                                                                        className="button-check">

                                                                                    </div>
                                                                                </GSComponentTooltip>

                                                                                <GSComponentTooltip
                                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                    interactive
                                                                                    style={{
                                                                                        display: 'inline'
                                                                                    }}
                                                                                    html={

                                                                                        <GSTrans
                                                                                            t="page.affiliate.commission.partners.table.reject"
                                                                                        >
                                                                                        </GSTrans>
                                                                                    }>
                                                                                    <div
                                                                                        onClick={() => {
                                                                                            openRejectModal(item.id, item.partnerStatus)
                                                                                        }}
                                                                                        className="button-cancel">

                                                                                    </div>
                                                                                </GSComponentTooltip>
                                                                            </> :
                                                                            <>
                                                                                <GSComponentTooltip
                                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                    interactive
                                                                                    style={{
                                                                                        display: 'inline'
                                                                                    }}
                                                                                    html={

                                                                                        <GSTrans
                                                                                            t="page.affiliate.partner.expired"
                                                                                        >
                                                                                        </GSTrans>
                                                                                    }>
                                                                                    <div
                                                                                        className="button-check">

                                                                                    </div>
                                                                                </GSComponentTooltip>

                                                                                <GSComponentTooltip
                                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                    interactive
                                                                                    style={{
                                                                                        display: 'inline'
                                                                                    }}
                                                                                    html={

                                                                                        <GSTrans
                                                                                            t="page.affiliate.partner.expired"
                                                                                        >
                                                                                        </GSTrans>
                                                                                    }>
                                                                                    <div
                                                                                        className="button-cancel">

                                                                                    </div>
                                                                                </GSComponentTooltip>
                                                                            </>

                                                                    }
                                                                </>
                                                            }

                                                            {
                                                                item.partnerStatus === AffiliateConstant.STATUS.ACTIVATED &&
                                                                <>
                                                                    {stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                        <GSComponentTooltip
                                                                            placement={GSComponentTooltipPlacement.BOTTOM}
                                                                            interactive
                                                                            style={{
                                                                                display: 'inline'
                                                                            }}
                                                                            html={

                                                                                <GSTrans
                                                                                    t="page.affiliate.commission.partners.table.reject.activated"
                                                                                >
                                                                                </GSTrans>
                                                                            }>
                                                                            <div
                                                                                onClick={() => {
                                                                                    openRejectModal(item.id, item.partnerStatus)
                                                                                }}
                                                                                className="button-cancel m-0">

                                                                            </div>
                                                                        </GSComponentTooltip> :
                                                                        stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                            <GSComponentTooltip
                                                                                placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                interactive
                                                                                style={{
                                                                                    display: 'inline'
                                                                                }}
                                                                                html={

                                                                                    <GSTrans
                                                                                        t="page.affiliate.commission.partners.table.reject.activated"
                                                                                    >
                                                                                    </GSTrans>
                                                                                }>
                                                                                <div
                                                                                    onClick={() => {
                                                                                        openRejectModal(item.id, item.partnerStatus)
                                                                                    }}
                                                                                    className="button-cancel m-0">

                                                                                </div>
                                                                            </GSComponentTooltip> :
                                                                            <GSComponentTooltip
                                                                                placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                interactive
                                                                                style={{
                                                                                    display: 'inline'
                                                                                }}
                                                                                html={

                                                                                    <GSTrans
                                                                                        t="page.affiliate.partner.expired"
                                                                                    >
                                                                                    </GSTrans>
                                                                                }>
                                                                                 <div
                                                                                    className="button-cancel m-0">

                                                                                </div>
                                                                            </GSComponentTooltip>

                                                                    }
                                                                </>
                                                            }

                                                            {
                                                                item.partnerStatus === AffiliateConstant.STATUS.DEACTIVATED &&
                                                                <>

                                                                    {
                                                                        stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                            <GSComponentTooltip
                                                                                placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                interactive
                                                                                style={{
                                                                                    display: 'inline'
                                                                                }}
                                                                                html={

                                                                                    <GSTrans
                                                                                        t="page.affiliate.partner.icon.approve.deactivated"
                                                                                    >
                                                                                    </GSTrans>
                                                                                }>
                                                                                <div
                                                                                    onClick={() => openApproveModal(AffiliateConstant.STATUS.DEACTIVATED, item.id, item.partnerType)}
                                                                                    className="button-check">

                                                                                </div>
                                                                            </GSComponentTooltip> :
                                                                            stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                                <GSComponentTooltip
                                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                    interactive
                                                                                    style={{
                                                                                        display: 'inline'
                                                                                    }}
                                                                                    html={

                                                                                        <GSTrans
                                                                                            t="page.affiliate.partner.icon.approve.deactivated"
                                                                                        >
                                                                                        </GSTrans>
                                                                                    }>
                                                                                    <div
                                                                                        onClick={() => openApproveModal(AffiliateConstant.STATUS.DEACTIVATED, item.id, item.partnerType)}
                                                                                        className="button-check">

                                                                                    </div>
                                                                                </GSComponentTooltip> :
                                                                                <GSComponentTooltip
                                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                    interactive
                                                                                    style={{
                                                                                        display: 'inline'
                                                                                    }}
                                                                                    html={

                                                                                        <GSTrans
                                                                                            t="page.affiliate.partner.expired"
                                                                                        >
                                                                                        </GSTrans>
                                                                                    }>
                                                                                    <div className="button-check">

                                                                                    </div>
                                                                                </GSComponentTooltip>

                                                                    }


                                                                </>
                                                            }


                                                        </div>

                                                    </div>

                                                </section>
                                            </>
                                        )
                                    })
                                    }
                                </PagingTable>

                                {stPartnerList.length === 0 &&

                                <GSWidgetEmptyContent
                                    iconSrc="/assets/images/icon-purchase-order-empty.png"
                                    text={i18next.t(
                                        "page.affiliate.partner.empty"
                                    )}
                                    className="flex-grow-1"
                                    style={{height: "60vh"}}
                                />

                                }
                            </>
                            }
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
                <GSContentBody size={GSContentBody.size.MAX}
                               className="affiliate-partner-order-list__body-mobile d-mobile-flex d-desktop-none">
                    {/*SUPPLIER LIST*/}
                    <GSWidget>
                        <GSWidgetContent className="affiliate-partner-order-list-widget">
                            {isFetching &&
                            <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                            }
                            <div
                                className={"n-filter-container--mobile d-mobile-flex d-desktop-none " + (isFetching ? 'gs-atm--disable' : '')}>
                                {/*SEARCH*/}
                                <div className="row w-100">
                                    <div className="col-12 col-sm-12 d-flex justify-content-between align-items-center">
                                    <span style={{
                                        marginRight: 'auto'
                                    }} className="gs-search-box__wrapper">
                                    <UikInput
                                        icon={(
                                            <FontAwesomeIcon icon="search"/>
                                        )}
                                        placeholder={i18next.t("page.affiliate.partner.filter.search")}
                                        maxLength={50}
                                    />

                                </span>
                                        <div className="ml-auto d-flex">

                                            <div className="mr-3"/>
                                            <GSMegaFilter size="medium" onSubmit={onMegaFilterChange}>

                                                <GSMegaFilterRowTag name="partnerStatus"
                                                                    i18Key="component.custom.page.table.header.status"
                                                                    options={FILTER_STATUS_OPTIONS}
                                                                    defaultValue={stSearchParams.partnerStatus}
                                                                    ignoreCountValue={'ALL'}

                                                />

                                                <GSMegaFilterRowTag name="partnerType"
                                                                    i18Key="page.affiliate.commission.partners.type"
                                                                    options={FILTER_PARTNER_TYPE_OPTIONS}
                                                                    defaultValue={stSearchParams.partnerType}
                                                                    ignoreCountValue={'ALL'}

                                                />

                                                <GSMegaFilterRowTag name="commissionType"
                                                                    i18Key="page.affiliate.commission.partners.commissionType"
                                                                    options={FILTER_COMMISSION_TYPE_OPTIONS}
                                                                    defaultValue={stSearchParams.commissionType}
                                                                    ignoreCountValue={'ALL'}

                                                />

                                                <GSMegaFilterRowSelect name="commissionRate"
                                                                       i18Key="page.affiliate.commission.partners.commissionRate"
                                                                       options={stCommissionRateList}
                                                                       defaultValue={stSearchParams.commissionRate}
                                                                       ignoreCountValue={'ALL'}
                                                />


                                            </GSMegaFilter>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {!isFetching &&
                            <>
                                <PagingTable
                                    headers={tableConfig.headerList}
                                    totalPage={totalPage}
                                    maxShowedPage={10}
                                    currentPage={currentPage}
                                    onChangePage={onChangePage}
                                    totalItems={stPartnerList.length}
                                    hidePagingEmpty
                                    className="m-paging d-mobile-flex d-desktop-none">
                                    <div className="mobile-review-list-list-container d-mobile-flex d-desktop-none">
                                        {
                                            stPartnerList.map((item, index) => {
                                                return (
                                                    <div key={index}
                                                         className="m-review-row gsa-hover--gray"
                                                         style={renderStyleTableBodyItems(item.partnerType)}
                                                    >
                                                        <div className="m-review-row__short">

                                                            <div className={`gs-table-body-item`}>
                                                                <Link
                                                                    to={NAV_PATH.affiliatePartnerEdit + `/${item.id}`}
                                                                    style={renderStyleLink(item.partnerType)}
                                                                ></Link>
                                                                {!stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                    <GSComponentTooltip
                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                        interactive
                                                                        style={{
                                                                            display: 'inline'
                                                                        }}
                                                                        html={
                                                                            <GSTrans
                                                                                t="page.affiliate.partner.expired"
                                                                            >
                                                                            </GSTrans>
                                                                        }>
                                                                        {item.partnerCode}
                                                                    </GSComponentTooltip> :
                                                                    !stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                        <GSComponentTooltip
                                                                            placement={GSComponentTooltipPlacement.BOTTOM}
                                                                            interactive
                                                                            style={{
                                                                                display: 'inline'
                                                                            }}
                                                                            html={
                                                                                <GSTrans
                                                                                    t="page.affiliate.partner.expired"
                                                                                >
                                                                                </GSTrans>
                                                                            }>
                                                                            {item.name}
                                                                        </GSComponentTooltip> : item.partnerCode
                                                                }
                                                            </div>
                                                            <div className={`gs-table-body-item`}>
                                                                <Link
                                                                    to={NAV_PATH.affiliatePartnerEdit + `/${item.id}`}
                                                                    style={renderStyleLink(item.partnerType)}
                                                                ></Link>


                                                                {!stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                    <GSComponentTooltip
                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                        interactive
                                                                        style={{
                                                                            display: 'inline'
                                                                        }}
                                                                        html={
                                                                            <GSTrans
                                                                                t="page.affiliate.partner.expired"
                                                                            >
                                                                            </GSTrans>
                                                                        }>
                                                                        {item.name}
                                                                    </GSComponentTooltip> :
                                                                    !stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                        <GSComponentTooltip
                                                                            placement={GSComponentTooltipPlacement.BOTTOM}
                                                                            interactive
                                                                            style={{
                                                                                display: 'inline'
                                                                            }}
                                                                            html={
                                                                                <GSTrans
                                                                                    t="page.affiliate.partner.expired"
                                                                                >
                                                                                </GSTrans>
                                                                            }>
                                                                            {item.name}
                                                                        </GSComponentTooltip> : item.name
                                                                }
                                                            </div>
                                                            <div className={`gs-table-body-item`}>
                                                                <Link
                                                                    to={NAV_PATH.affiliatePartnerEdit + `/${item.id}`}
                                                                    style={renderStyleLink(item.partnerType)}
                                                                ></Link>
                                                                {item?.commissions?.length > 0 ? <GSComponentTooltip
                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                        interactive
                                                                        style={{
                                                                            display: 'inline'
                                                                        }}
                                                                        html={
                                                                            <>
                                                                                <PagingTable
                                                                                    headers={tableCommission.headerList}
                                                                                    totalItems={item?.commissions?.length}

                                                                                >
                                                                                    {
                                                                                        item?.commissions?.map((item, index) => {
                                                                                            return <section
                                                                                                key={index + "_" + item.id}
                                                                                                className="gs-table-body-items"
                                                                                                data-id={item.id}>
                                                                                                <div
                                                                                                    className={`gs-table-body-item`}>
                                                                                                    {item.name}
                                                                                                </div>
                                                                                                <div
                                                                                                    className={`gs-table-body-item`}>
                                                                                                    {i18next.t(`page.affiliate.partner.filter.commissionType.${item.type}`)}
                                                                                                </div>
                                                                                                <div
                                                                                                    className={`gs-table-body-item`}>
                                                                                                    {item.rate}%
                                                                                                </div>

                                                                                            </section>
                                                                                        })
                                                                                    }
                                                                                </PagingTable>
                                                                            </>
                                                                        }>
                                                                        {i18next.t("page.affiliate.partner.assignment", {x: item?.commissions?.length})}
                                                                    </GSComponentTooltip> :
                                                                    "-"
                                                                }
                                                            </div>
                                                            <div className={`gs-table-body-item`}>
                                                                <Link
                                                                    to={NAV_PATH.affiliatePartnerEdit + `/${item.id}`}
                                                                    style={renderStyleLink(item.partnerType)}
                                                                ></Link>
                                                                {!stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                    <GSComponentTooltip
                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                        interactive
                                                                        style={{
                                                                            display: 'inline'
                                                                        }}
                                                                        html={
                                                                            <GSTrans
                                                                                t="page.affiliate.partner.expired"
                                                                            >
                                                                            </GSTrans>
                                                                        }>
                                                                        {item.totalRevenue ? CurrencyUtils.formatMoneyByCurrency(item.totalRevenue, STORE_CURRENCY_SYMBOL) : CurrencyUtils.formatMoneyByCurrency(0, STORE_CURRENCY_SYMBOL)}
                                                                    </GSComponentTooltip> :
                                                                    !stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                        <GSComponentTooltip
                                                                            placement={GSComponentTooltipPlacement.BOTTOM}
                                                                            interactive
                                                                            style={{
                                                                                display: 'inline'
                                                                            }}
                                                                            html={
                                                                                <GSTrans
                                                                                    t="page.affiliate.partner.expired"
                                                                                >
                                                                                </GSTrans>
                                                                            }>
                                                                            {item.name}
                                                                        </GSComponentTooltip> : item.totalRevenue ? CurrencyUtils.formatMoneyByCurrency(item.totalRevenue, STORE_CURRENCY_SYMBOL) : CurrencyUtils.formatMoneyByCurrency(0, STORE_CURRENCY_SYMBOL)
                                                                }
                                                            </div>
                                                            <div className={`gs-table-body-item`}>
                                                                <Link
                                                                    to={NAV_PATH.affiliatePartnerEdit + `/${item.id}`}
                                                                    style={renderStyleLink(item.partnerType)}
                                                                ></Link>
                                                                {!stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                    <GSComponentTooltip
                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                        interactive
                                                                        style={{
                                                                            display: 'inline'
                                                                        }}
                                                                        html={
                                                                            <GSTrans
                                                                                t="page.affiliate.partner.expired"
                                                                            >
                                                                            </GSTrans>
                                                                        }>
                                                                        {i18next.t(`page.affiliate.partner.filter.status.${item.partnerStatus}`)}
                                                                    </GSComponentTooltip> :
                                                                    !stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                        <GSComponentTooltip
                                                                            placement={GSComponentTooltipPlacement.BOTTOM}
                                                                            interactive
                                                                            style={{
                                                                                display: 'inline'
                                                                            }}
                                                                            html={
                                                                                <GSTrans
                                                                                    t="page.affiliate.partner.expired"
                                                                                >
                                                                                </GSTrans>
                                                                            }>
                                                                            {item.name}
                                                                        </GSComponentTooltip> : i18next.t(`page.affiliate.partner.filter.status.${item.partnerStatus}`)
                                                                }
                                                            </div>
                                                            <div className={`gs-table-body-item`}>
                                                                <Link
                                                                    to={NAV_PATH.affiliatePartnerEdit + `/${item.id}`}
                                                                    style={renderStyleLink(item.partnerType)}
                                                                ></Link>
                                                                {!stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                    <GSComponentTooltip
                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                        interactive
                                                                        style={{
                                                                            display: 'inline'
                                                                        }}
                                                                        html={
                                                                            <GSTrans
                                                                                t="page.affiliate.partner.expired"
                                                                            >
                                                                            </GSTrans>
                                                                        }>
                                                                        {moment(item.createdDate).format('DD-MM-YYYY')}
                                                                    </GSComponentTooltip> :
                                                                    !stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                        <GSComponentTooltip
                                                                            placement={GSComponentTooltipPlacement.BOTTOM}
                                                                            interactive
                                                                            style={{
                                                                                display: 'inline'
                                                                            }}
                                                                            html={
                                                                                <GSTrans
                                                                                    t="page.affiliate.partner.expired"
                                                                                >
                                                                                </GSTrans>
                                                                            }>
                                                                            {item.name}
                                                                        </GSComponentTooltip> : moment(item.createdDate).format('DD-MM-YYYY')
                                                                }
                                                            </div>

                                                            <div className={`gs-table-body-item status`}>
                                                                {
                                                                    item.partnerStatus === AffiliateConstant.STATUS.PENDING &&

                                                                    <>
                                                                        {stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                            <>
                                                                                <div
                                                                                    onClick={() => openApproveModal(AffiliateConstant.STATUS.PENDING, item.id, item.partnerType)}
                                                                                    className="button-check">

                                                                                </div>

                                                                                <div
                                                                                    onClick={() => {
                                                                                        openRejectModal(item.id, item.partnerStatus)
                                                                                    }}
                                                                                    className="button-cancel">

                                                                                </div>
                                                                            </>
                                                                            :
                                                                            stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                                <>
                                                                                    <div
                                                                                        onClick={() => openApproveModal(AffiliateConstant.STATUS.PENDING, item.id, item.partnerType)}
                                                                                        className="button-check">

                                                                                    </div>

                                                                                    <div
                                                                                        onClick={() => {
                                                                                            openRejectModal(item.id, item.partnerStatus)
                                                                                        }}
                                                                                        className="button-cancel">

                                                                                    </div>
                                                                                </> :
                                                                                <>
                                                                                    <GSComponentTooltip
                                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                        interactive
                                                                                        style={{
                                                                                            display: 'inline'
                                                                                        }}
                                                                                        html={

                                                                                            <GSTrans
                                                                                                t="page.affiliate.partner.expired"
                                                                                            >
                                                                                            </GSTrans>
                                                                                        }>
                                                                                        <div
                                                                                            className="button-check">

                                                                                        </div>
                                                                                    </GSComponentTooltip>

                                                                                    <GSComponentTooltip
                                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                        interactive
                                                                                        style={{
                                                                                            display: 'inline'
                                                                                        }}
                                                                                        html={

                                                                                            <GSTrans
                                                                                                t="page.affiliate.partner.expired"
                                                                                            >
                                                                                            </GSTrans>
                                                                                        }>
                                                                                        <div
                                                                                            className="button-cancel">

                                                                                        </div>
                                                                                    </GSComponentTooltip>

                                                                                </>

                                                                        }
                                                                    </>
                                                                }

                                                                {
                                                                    item.partnerStatus === AffiliateConstant.STATUS.ACTIVATED &&
                                                                    <>
                                                                        {stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                            <div
                                                                                onClick={() => {
                                                                                    openRejectModal(item.id, item.partnerStatus)
                                                                                }}
                                                                                className="button-cancel m-0">

                                                                            </div> :
                                                                            stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                                <div
                                                                                    onClick={() => {
                                                                                        openRejectModal(item.id, item.partnerStatus)
                                                                                    }}
                                                                                    className="button-cancel m-0">

                                                                                </div> :
                                                                                <GSComponentTooltip
                                                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                    interactive
                                                                                    style={{
                                                                                        display: 'inline'
                                                                                    }}
                                                                                    html={

                                                                                        <GSTrans
                                                                                            t="page.affiliate.partner.expired"
                                                                                        >
                                                                                        </GSTrans>
                                                                                    }>
                                                                                     <div
                                                                                        className="button-cancel m-0">

                                                                                    </div>
                                                                                </GSComponentTooltip>


                                                                        }
                                                                    </>
                                                                }

                                                                {
                                                                    item.partnerStatus === AffiliateConstant.STATUS.DEACTIVATED &&
                                                                    <>

                                                                        {
                                                                            stHasPackagePlanDropship && item.partnerType == AffiliateConstant.PARTNER_TYPE.DROP_SHIP ?
                                                                                <div
                                                                                    onClick={() => openApproveModal(AffiliateConstant.STATUS.DEACTIVATED, item.id, item.partnerType)}
                                                                                    className="button-check">

                                                                                </div> :
                                                                                stHasPackagePlanReseller && item.partnerType == AffiliateConstant.PARTNER_TYPE.RESELLER ?
                                                                                    <div
                                                                                        onClick={() => openApproveModal(AffiliateConstant.STATUS.DEACTIVATED, item.id, item.partnerType)}
                                                                                        className="button-check">

                                                                                    </div> :
                                                                                    <GSComponentTooltip
                                                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                                                        interactive
                                                                                        style={{
                                                                                            display: 'inline'
                                                                                        }}
                                                                                        html={

                                                                                            <GSTrans
                                                                                                t="page.affiliate.partner.expired"
                                                                                            >
                                                                                            </GSTrans>
                                                                                        }>
                                                                                        <div className="button-check">

                                                                                        </div>
                                                                                    </GSComponentTooltip>

                                                                        }


                                                                    </>
                                                                }


                                                            </div>

                                                        </div>

                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </PagingTable>

                                {stPartnerList.length === 0 &&
                                <GSWidgetEmptyContent
                                    iconSrc="/assets/images/icon-purchase-order-empty.png"
                                    text={i18next.t(
                                        "page.affiliate.partner.empty"
                                    )}
                                    className="flex-grow-1"
                                    style={{height: "60vh"}}
                                />
                                }
                            </>

                            }

                            <div className="paging__footer">
                                <PagingTable
                                    totalPage={totalPage}
                                    maxShowedPage={10}
                                    currentPage={currentPage}
                                    onChangePage={onChangePage}
                                    totalItems={stPartnerList.length}
                                    hidePagingEmpty
                                    className="m-paging d-mobile-flex d-desktop-none">
                                    <div className="mobile-review-list-list-container d-mobile-flex d-desktop-none">

                                    </div>
                                </PagingTable>
                            </div>
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
            </GSContentContainer>
            <AlertModal ref={refAlert}/>
        </>
    )
}


AffiliatePartner.defaultProps = {}

AffiliatePartner.propTypes = {}

export default AffiliatePartner

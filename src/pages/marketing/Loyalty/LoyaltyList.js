import React, {useEffect, useState} from 'react';
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import './LoyaltyList.sass';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {Trans} from "react-i18next";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import i18next from "i18next";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {CredentialUtils} from '../../../utils/credential';
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import GSButton from "../../../components/shared/GSButton/GSButton";
import beehiveService from "../../../services/BeehiveService";
import {CurrencyUtils} from "../../../utils/number-format";
import {NumericSymbol} from "../../../components/shared/form/CryStrapInput/CryStrapInput";
import GSImg from "../../../components/shared/GSImg/GSImg";
import {ImageUtils} from "../../../utils/image";
import HintPopupVideo from "../../../components/shared/HintPopupVideo/HintPopupVideo";
import PropTypes from "prop-types";

const LoyaltyList = (props) => {
    const {currency, ...others} = props
    const tableConfig = {
        headerList: [
            i18next.t("component.loyalty.tbl.priority"),
            i18next.t("component.loyalty.tbl.icon"),
            i18next.t("component.loyalty.tbl.name"),
            i18next.t("component.loyalty.form.discountPercent"),
            i18next.t("component.loyalty.form.discountMaxAmount"),
            i18next.t("component.discount.tbl.actions")
        ]
    };
    const SIZE_PER_PAGE = 20;

    const [isFetching, setIsFetching] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [data, setData] = useState([]);

    useEffect(()=>{
        if(data.length === 0){
            fetchData(1, SIZE_PER_PAGE);
        }
    }, [])

    const fetchData = (page, size) => {
        beehiveService.getMemberships({
            sellerId: CredentialUtils.getStoreId(),
            sort: "priority,asc",
            page: page - 1,
            size: size
        }).then(res => {
            const totalItem = parseInt(res.headers['x-total-count']);
            setData(res.data);
            setTotalPage(Math.ceil(totalItem / SIZE_PER_PAGE));
            setIsFetching(false);
        })
    }
    const redirectToEdit = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        RouteUtils.linkToWithObject(props, NAV_PATH.marketing.LOYALTY_EDIT + "/" + item.id, {data: {loyalties: data, loyalty: item}});
    }

    const openDeleteModal = (e, data) => {
        e.stopPropagation();
        let item = data;
        this.refConfirmModalChildren.openModal({
            messages: i18next.t("component.loyalty.modal.remove.hint"),
            okCallback: () => {
                removeLoyaltyLevel(item.id);
            }
        })
    }

    const removeLoyaltyLevel = (membershipId) =>{
        setIsFetching(true);
        beehiveService.removeMembershipById(membershipId).then(res => {
            if (res.status === 200) {
                setCurrentPage(1);
                setIsFetching(false);
                fetchData(1, SIZE_PER_PAGE);
            }
        })
    }

    const moveDown = (event, item) =>{
        event.preventDefault();
        event.stopPropagation();
        let ele = document.querySelectorAll(`[data-id="${item.id}"]`)[0];
        let nextSibling = ele.nextElementSibling;
        if(nextSibling){
            const currentEle = data.find(item => item.id === parseInt(ele.attributes['data-id'].value));
            const nextEle = data.find(item => item.id === parseInt(nextSibling.attributes['data-id'].value));
            currentEle.priority = currentEle.priority + 1;
            nextEle.priority = nextEle.priority - 1;
            
            beehiveService.saveMemberShips([currentEle, nextEle]).then(res =>{
                fetchData(1, SIZE_PER_PAGE);
            })
        }
    }
    const moveTop = (event, item) => {
        event.stopPropagation();
        let ele = document.querySelectorAll(`[data-id="${item.id}"]`)[0];
        let previousElement = ele.previousElementSibling;
        if(previousElement){
            const currentEle = data.find(item => item.id === parseInt(ele.attributes['data-id'].value));
            const previousEle = data.find(item => item.id === parseInt(previousElement.attributes['data-id'].value));
            currentEle.priority = currentEle.priority - 1;
            previousEle.priority = previousEle.priority + 1;
            beehiveService.saveMemberShips([currentEle, previousEle]).then(res =>{
                fetchData(1, SIZE_PER_PAGE);
            })
        }
    }

    const redirectToCreate = () => {
        if(data.length >=5 ){
            this.alertModal.openModal({
                type: AlertModalType.ALERT_TYPE_INFO,
                messages: i18next.t("component.loyalty.error.exceeded"),
                closeCallback: () => {}
            })
        }
        else{
            RouteUtils.linkToWithObject(props, NAV_PATH.marketing.LOYALTY_CREATE, {data: {loyalties: data}})
        }
    }
    return (
        <GSContentContainer className="loyalty">
            <GSContentHeader className="loyalty-header" title={i18next.t("component.navigation.loyalty")} >
                <HintPopupVideo title={"Loaylty page"} category={"LOYALTY_PROGRAM"}/>
                <GSButton success
                    className="btn-save"
                    onClick={() => redirectToCreate()}>
                    <Trans i18nKey="page.marketing.loyalty.btn.create" className="sr-only">
                        Create Membership Level
                </Trans>
                </GSButton>
            </GSContentHeader>

            <GSContentBody className="loyalty-content-body" size={GSContentBody.size.MAX}>
                <GSWidget>
                    <GSWidgetContent>
                        {isFetching && <LoadingScreen />}
                        <PagingTable
                            headers={tableConfig.headerList}
                            totalPage={totalPage}
                            maxShowedPage={10}
                            currentPage={currentPage}
                            totalItems={data.length}
                            hidePagingEmpty>
                            {data.map((item, index) => {
                                return (
                                    <section key={index + "_" + item.id} className="gs-table-body-items cursor--pointer gsa-hover--gray"
                                    data-id={item.id}
                                        onClick={(e, data) => { redirectToEdit(e, item) }}>
                                        <div className={`gs-table-body-item`}>
                                            <span>{item.priority}</span>
                                        </div>
                                        <div className="gs-table-body-item image">
                                            <GSImg src={item.image && ImageUtils.getImageFromImageModel(item.image)}/>
                                        </div>
                                        <div className="gs-table-body-item name">
                                            <span>{item.name}</span>
                                        </div>
                                        <div className="gs-table-body-item">
                                            <span>{item.discountPercent ? item.discountPercent + NumericSymbol.PERCENTAGE : ''}</span>
                                        </div>
                                        <div className="gs-table-body-item">
                                            <span>{item.discountMaxAmount ? CurrencyUtils.formatMoneyByCurrency(item.discountMaxAmount, currency) : ''}</span>
                                        </div>
                                        <div className="gs-table-body-item action">
                                            <section className="icon-moves">
                                                <i className="icon-up" onClick={(event) => moveTop(event, item)}></i>
                                                <i className="icon-down" onClick={(event) => moveDown(event, item)}></i>
                                            </section>
                                            <i className="icon-delete" onClick={(e) => openDeleteModal(e, item)}></i>
                                        </div>
                                    </section>
                                )
                            })
                            }
                        </PagingTable>
                    </GSWidgetContent>
                    {data.length === 0 && (
                        <div className="empty">
                            <i className="icon-empty"></i><span>{i18next.t("component.loyalty.empty")}</span>
                        </div>
                    )}
                </GSWidget>
                <AlertModal ref={(el) => { this.alertModal = el }} />
                <ConfirmModal ref={(el) => { this.refConfirmModalChildren = el }}></ConfirmModal>
            </GSContentBody>
        </GSContentContainer>
    )
}

LoyaltyList.defaultProps = {
    currency: CurrencyUtils.getLocalStorageSymbol()
}

LoyaltyList.propTypes = {
    currency: PropTypes.string,
}
export default LoyaltyList;

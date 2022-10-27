import React, {useEffect, useRef, useState} from 'react';
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import './BuyLink.sass'
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {Trans} from "react-i18next";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import i18next from "i18next";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {CredentialUtils} from '../../../utils/credential';
import GSButton from "../../../components/shared/GSButton/GSButton";
import {TokenUtils} from '../../../utils/token';
import moment from "moment";
import {BuyLinkService} from '../../../services/BuyLinkService';
import GSAlertModal, {GSAlertModalType} from '../../../components/shared/GSAlertModal/GSAlertModal';
import {GSToast} from '../../../utils/gs-toast';
import storeService from '../../../services/StoreService';
import {Tooltip} from 'react-tippy';
import BuyLinkCreatedModal from "./BuyLinkCreatedModal/BuyLinkCreatedModal";
import {NumberUtils} from "../../../utils/number-format";
import GSActionButton, {GSActionButtonIcons} from "../../../components/shared/GSActionButton/GSActionButton";
import HintPopupVideo from "../../../components/shared/HintPopupVideo/HintPopupVideo";

const BuyLink = (props) => {

    // check intro
    if (!CredentialUtils.getIsExploredBuyLink()) {
        // => redirect to intro page
        RouteUtils.linkTo(props,NAV_PATH.marketing.BUY_LINK_INTRO)
    }

    const tableConfig = {
        headerList: [
            '#',
            i18next.t("component.buylink.tbl.url"),
            i18next.t("component.buylink.tbl.coupon"),
            i18next.t("component.buylink.tbl.createdDate"),
            i18next.t("component.buylink.tbl.action")
        ]
    };
    const SIZE_PER_PAGE = 100;
    const refDeleteModal = useRef(null);
    const [isFetching, setIsFetching] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [data, setData] = useState([]);
    const [sfUrlPrefix, setSfUrlPrefix] = useState("");
    const isHasPermission = TokenUtils.hasThemingPermission();
    const [stIsOpenCreateBuyLinkModal, setStIsOpenCreateBuyLinkModal] = useState(false);
    const [stCurrentEditBuyLink, setStCurrentEditBuyLink] = useState(null);

    useEffect(()=>{
        getCopyBuyLinkUrlPrefix();
        if(data.length === 0){
            fetchData(0);
        }
    }, [])

    const getCopyBuyLinkUrlPrefix = () => {
        storeService.getSfFullDomain().then((data) => {
            //https://shop_domain/shopping-cart/checkout/quick/
            const url = "https://"+ data +"/shopping-cart/checkout/quick/";
            setSfUrlPrefix(url);
        })
    }

    const fetchData = (page, size = SIZE_PER_PAGE) => {
        setIsFetching(true);
        if(page > 0) {
            page = currentPage - 1;
        }
        BuyLinkService.getBuyLink({page: page, size: size, sort: 'createdDate,desc'})
        .then(resp => {
            const totalCount = resp.headers['x-total-count'];
            const totalPage = Math.ceil(parseInt(totalCount / size));
            setTotalPage(totalPage);
            setData(resp.data);
        })
        .finally(() => {
            setIsFetching(false);
        })
    }

    const onClickDelete = (event, item) => {
        event.preventDefault();
        event.stopPropagation();
        const buyId = item.id;
        refDeleteModal.current.openModal({
            messages: i18next.t('component.buylink.delete.modal.body'),
            modalTitle: i18next.t('component.buylink.delete.modal.header'),
            modalAcceptBtn: i18next.t('common.btn.delete'),
            modalCloseBtn: i18next.t('common.btn.cancel'),
            type: GSAlertModalType.ALERT_TYPE_DANGER,
            acceptCallback: () => {
                BuyLinkService.removeBuyLink(buyId)
                .then(() => {
                    GSToast.commonUpdate();
                })
                .catch(() => {
                    GSToast.commonError();
                })
                .finally(() => {
                    fetchData(0);
                });
            },
            closeCallback: () => {}
        })
    }

    const onClickEdit = (event, item) =>{
        event.preventDefault();
        event.stopPropagation();
        //to do edit
        setStCurrentEditBuyLink(item)
        setStIsOpenCreateBuyLinkModal(true)
    }

    const onClickCopy = (event, item) => {
        event.preventDefault();
        event.stopPropagation();
        //create text area and append to document
        let textArea = document.createElement("textarea");
        //has full url path to copy
        textArea.value = sfUrlPrefix + item.url;
        document.body.appendChild(textArea);
        //select textarea
        textArea.select();
        //working on mobile
        textArea.setSelectionRange(0, 99999);
        document.execCommand("Copy");
        //removed textarea from document
        textArea.remove();
        GSToast.success("component.buylink.copy.success", true);
    }
    
    const onClickCreate = () => {
        setStIsOpenCreateBuyLinkModal(true)
    }

    const onCloseCreateModal = () => {
        setStIsOpenCreateBuyLinkModal(false)
        setStCurrentEditBuyLink(null)
        fetchData(0);
    }

    return (
        <GSContentContainer className="buylink">
            <BuyLinkCreatedModal isOpen={stIsOpenCreateBuyLinkModal}
                onClose={onCloseCreateModal}
                                 model={stCurrentEditBuyLink}
            />
            <GSContentHeader className="buylink-header" title={i18next.t("component.buylink.header.title")} >
                <HintPopupVideo title={'Buy link management'} category={'BUY_LINK'}/>
                <GSButton success
                    className="btn-save"
                    disabled={!isHasPermission}
                    onClick={() => onClickCreate()}>
                    <Trans i18nKey="component.buylink.btn.create" className="sr-only">
                        Create Buy Link
                    </Trans>
                </GSButton>
            </GSContentHeader>

            <GSContentBody className="buylink-content-body" size={GSContentBody.size.MAX}>
                <GSWidget>
                    <GSWidgetContent>
                        {isFetching && <LoadingScreen />}
                        <PagingTable
                            headers={tableConfig.headerList}
                            totalPage={totalPage}
                            maxShowedPage={10}
                            currentPage={currentPage}
                            totalItems={data.length}
                            onChangePage={this.fetchData}
                            hidePagingEmpty>
                            {data.map((item, index) => {
                                return (
                                    <section key={item.id + "_" + index} className="gs-table-body-items">
                                        <div className="gs-table-body-item" style={{maxWidth: '3rem'}}>
                                            <span>{NumberUtils.formatThousand( ((currentPage - 1) * SIZE_PER_PAGE) + (index + 1))}</span>
                                        </div>
                                        <div className={`gs-table-body-item text-truncate`}>
                                            <span>{ `${sfUrlPrefix}${item.url}`}</span>
                                        </div>
                                        <div className="gs-table-body-item image">
                                            <span>{item.couponCode}</span>
                                        </div>
                                        <div className="gs-table-body-item name">
                                            <span>{moment(item.createdDate).format('YYYY-MM-DD')}</span>
                                        </div>
                                        <div className="gs-table-body-item action text-center">
                                            <Tooltip  arrow position={"bottom"} title={i18next.t("page.buylink.intro.btn.copy.tooltip")}>
                                                <GSActionButton icon={GSActionButtonIcons.COPY_LINK} onClick={(event) => onClickCopy(event, item)}/>
                                            </Tooltip>
                                            <Tooltip arrow position={"bottom"} title={i18next.t("page.buylink.intro.btn.edit.tooltip")}>
                                                <GSActionButton icon={GSActionButtonIcons.EDIT} onClick={(event) => onClickEdit(event, item)}/>

                                            </Tooltip>
                                            <Tooltip  arrow position={"bottom"} title={i18next.t("page.buylink.intro.btn.delete.tooltip")}>
                                                <GSActionButton icon={GSActionButtonIcons.DELETE} onClick={(event) => onClickDelete(event, item)}/>
                                            </Tooltip>
                                        </div>
                                    </section>
                                )
                            })
                            }
                        </PagingTable>
                    </GSWidgetContent>
                    {data.length === 0 && (
                        <div className="empty">
                            <i className="icon-empty"></i><span>{i18next.t("component.buylink.empty")}</span>
                        </div>
                    )}
                </GSWidget>
            </GSContentBody>
            <GSAlertModal ref={refDeleteModal}/>
        </GSContentContainer>
    )
}
export default BuyLink;

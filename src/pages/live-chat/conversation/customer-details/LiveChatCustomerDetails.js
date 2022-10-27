/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './LiveChatCustomerDetails.sass'
import PropTypes from "prop-types";
import CustomerEditor from "../../../customers/Edit/CustomerEditor";
import {UikInput} from "../../../../@uik";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSComponentTooltip from "../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import i18next from "i18next";
import {Trans} from "react-i18next";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {cancelablePromise} from "../../../../utils/promise";
import beehiveService from "../../../../services/BeehiveService";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import {LiveChatConversationContext} from "../context/LiveChatConversationContext"
import {GSToast} from '../../../../utils/gs-toast';
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import LoadingScreen from '../../../../components/shared/LoadingScreen/LoadingScreen';
import {Prompt} from "react-router-dom";
import style from "../../../customers/Edit/CustomerEditor.module.sass";
import {AvField, AvForm} from "availity-reactstrap-validation";
import {FormValidate} from "../../../../config/form-validate";
import GSTags from "../../../../components/shared/form/GSTags/GSTags";
import {ValidateUtils} from "../../../../utils/validate";
import {TokenUtils} from "../../../../utils/token";
import {CredentialUtils} from "../../../../utils/credential";

const SIZE_PER_PAGE = 100;
const PAGE_TYPE_SEARCH = 'search';
const PAGE_TYPE_CUSTOMER_EDITOR = 'customerEditor';
const PAGE_TYPE_ADD_CUSTOMER = 'addCustomer';

const LiveChatCustomerDetails = props => {

    const refShowComfirm = useRef(null);
    const refCustomerEditor = useRef (null);
    const {state, dispatch} = useContext(LiveChatConversationContext.context)
    const [isShow, stIsShow] = useState(props.isShow);
    const [isPin, stIsPin] = useState(false);
    const [stDisabledSave, setStDisabledSave] = useState(true);
    const [stShowResult, setStShowResult] = useState(false);
    const [stIsFetching, setStIsFetching] = useState(true);
    const [stIsPinning, setStIsPinning] = useState(false);
    const [stItemList, setStItemList] = useState([]);
    const [stPaging, setStPaging] = useState({
        totalPage: 0,
        totalItem: 0,
        currentPage: 1
    });
    const [stFilterConfig, setStFilterConfig] = useState({
        keyword: ''
    });
    const [stKeywordTemp, setStKeywordTemp] = useState('');
    const [stMatch, setStMatch] = useState({
        params: {
        }
    });
    const [stFbUserId, setStFbUserId] = useState('');
    const [stCurrentPage, setStCurrentPage] = useState(PAGE_TYPE_SEARCH);
    const [stTags, setStTags] = useState([]);
    const refSubmit = useRef(null);
    const {className, ...other} = props;
    const [stDisabledSaveNewCustomer, setStDisabledSaveNewCustomer] = useState(true);

    const pin = (profileId) => {
        //stIsPin(true);
        if(stFbUserId){

            setStIsPinning(true)

            if(stMatch.params.hasPin && stMatch.params.hasPin === true ){
                // show popup here
                refShowComfirm.current.openModal({
                    messages: (<GSTrans t="page.livechat.customer.details.pin.pinned">
                                    This customer is already pinned with other Facebook user. <strong>Do you want to continue connect?</strong>
                                </GSTrans>),
                    okCallback: () => {
                        // link facebookec user with the customer profile
                        beehiveService.linkFacebookUserToCustomerProfile(profileId, stFbUserId, "PIN").then(res => {
                            stIsPin(true);
                            setStIsPinning(false)
                        }).catch( e => {
                            stIsPin(false);
                            setStIsPinning(false)
                            GSToast.commonError();
                        })
                    },
                    cancelCallback: () => {
                        stIsPin(false);
                        setStIsPinning(false)
                    }
                })
            }else{
                // link facebookec user with the customer profile
                beehiveService.linkFacebookUserToCustomerProfile(profileId, stFbUserId, "PIN").then(res => {
                    stIsPin(true);
                    setStIsPinning(false)
                }).catch( e => {
                    stIsPin(false);
                    setStIsPinning(false)
                    GSToast.commonError();
                })
            }
        }  
    };

    const unpin = (profileId) => {
        //stIsPin(false);
        if(stFbUserId){
            setStIsPinning(true)
            // link facebookec user with the customer profile
            beehiveService.linkFacebookUserToCustomerProfile(profileId, stFbUserId, "UNPIN").then(res => {
                stIsPin(false);
                setStIsPinning(false)
            }).catch( e => {
                stIsPin(true);
                setStIsPinning(false)
                GSToast.commonError();
            })
        }
    };

    const close = () => {
        props.onToggleCustomerDetail()
    };

    const returnSearch = () => {
        setStMatch({
            ...stMatch,
            params: {
                ...stMatch.params,
                customerId: undefined,
                userId: undefined,
                saleChannel: undefined,
                hasPin: false
            }
        });
        setStCurrentPage(PAGE_TYPE_SEARCH);
    };

    const closeCustomerEditor = () => {
        if (state.isChangedCustomerProfile) {
            refShowComfirm.current.openModal({
                messages: (<GSTrans t="page.livechat.customer.details.leave.without.save">
                    <strong>Do you want to proceed?</strong> All unsaved data will be lost.
                </GSTrans>),
                okCallback: () => {
                    dispatch(LiveChatConversationContext.actions.changeCustomerProfileInfo(false));
                    if (isPin) {
                        close();
                    } else {
                        returnSearch();
                    }
                }
            });
        } else {
            if (isPin) {
                close();
            } else {
                returnSearch();
            }
        }
    };

    const closeAddNewCustomer = () => {
        if (state.isAddNewCustomer) {
            refShowComfirm.current.openModal({
                messages: (<GSTrans t="page.livechat.customer.details.add.leave.without.save">
                    Customer information are not saved. <strong>Do you want to leave without saving?</strong>
                </GSTrans>),
                okCallback: () => {
                    dispatch(LiveChatConversationContext.actions.addNewCustomer(false));
                    returnSearch();
                }
            });
        } else {
            returnSearch();
        }
    };

    useEffect(() => {
        stIsShow(props.isShow)
    }, [props.isShow])

    useEffect(() => {
        if (stShowResult) {
            fetchData()
        }
    }, [stShowResult, stFilterConfig, stPaging.currentPage]);

    useEffect(() => {

        resetSearchList()

        if (state.currentConversation && state.currentConversation.senders && state.currentConversation.senders.data[0]) {
            const fbUserId = state.currentConversation.senders.data[0].id;
            setStFbUserId(fbUserId);
            getUserLinkWithCustomerProfile(fbUserId);
        } else {
            setStFbUserId('')
        }
    }, [state.currentConversation]);

    const getUserLinkWithCustomerProfile = (fbUserId) => {
        setStMatch({
            ...stMatch,
            params: {}
        });

        // reload customer profile that map with facebook user id
        beehiveService.getUserLinkWithCustomerProfile(fbUserId).then(res => {
            setStMatch({
                ...stMatch,
                params: {
                    ...stMatch.params,
                    customerId: res.id,
                    userId: res.userId,
                    saleChannel: res.saleChannel,
                    hasPin: true
                }
            });
            setStCurrentPage(''); // reset first
            setStCurrentPage(PAGE_TYPE_CUSTOMER_EDITOR);

            stIsPin(true)

        }).catch( e => {
            stIsPin(false)
            setStMatch({
                ...stMatch,
                params: {}
            });
            setStCurrentPage(''); // reset first
            setStCurrentPage(PAGE_TYPE_SEARCH);
        })
    };

    useEffect(() => {
        setStDisabledSave(!state.isChangedCustomerProfile);
    }, [state.isChangedCustomerProfile]);

    useEffect(() => {
        setStDisabledSaveNewCustomer(!state.isAddNewCustomer);
    }, [state.isAddNewCustomer]);


    const onKeyPressSearch = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setStFilterConfig({
                ...stFilterConfig,
                keyword: e.currentTarget.value
            });
            setStPaging({
                ...stPaging,
                currentPage: 1
            });
            setStShowResult(true);
        }
    };

    const onSearchChange = (e) => {
        setStKeywordTemp(e.currentTarget.value);
    };

    const search = () => {
        setStFilterConfig({
            ...stFilterConfig,
            keyword: stKeywordTemp
        });
        setStPaging({
            ...stPaging,
            currentPage: 1
        });
        setStShowResult(true);
    };

    const fetchData = () => {
        setStIsFetching(true);
        const pmGetCustomerList = cancelablePromise(
            beehiveService.getCustomerList(stPaging.currentPage - 1,
                SIZE_PER_PAGE,
                stFilterConfig.keyword,
                undefined,
                '',
                {
                    segmentId: undefined
                }
            )
        );
        pmGetCustomerList.promise
            .then(itemList => {
                setStItemList(itemList.data);
                setStPaging({
                    ...stPaging,
                    totalPage: Math.ceil(itemList.total / SIZE_PER_PAGE),
                    totalItem: itemList.total
                });
                setStIsFetching(false);

            })
            .catch(() => [
                setStIsFetching(false)
            ])

    };

    const onClickCustomerRow = (id, userId, saleChannel, hasPin) => {
        setStMatch({
            ...stMatch,
            params: {
                ...stMatch.params,
                customerId: id,
                userId: userId,
                saleChannel: saleChannel,
                hasPin: hasPin > 0
            }
        });
        setStCurrentPage(PAGE_TYPE_CUSTOMER_EDITOR);
    };

    const onChangePage = (pageNumber) => {
        setStPaging({
            ...stPaging,
            currentPage: pageNumber
        });
    };

    const resetSearchList = () => {
        setStFilterConfig({
            ...stFilterConfig,
            keyword: ''
        });
        setStPaging({
            ...stPaging,
            totalItem: 0,
            totalPage: 0,
            currentPage: 1
        });
        setStItemList([]);
        setStShowResult(false)
        setStIsFetching(false)
    };

    const onClickAddNewCustomer = () => {
        setStCurrentPage(PAGE_TYPE_ADD_CUSTOMER);
    };

    const changeCustomerProfileInfo = () => {
        dispatch(LiveChatConversationContext.actions.addNewCustomer(true));
    };

    const onChangeTags = (value) => {
        setStTags(value);
        changeCustomerProfileInfo();
    };

    const handleValidSubmit = (event, value) => {
        /**
         * @type {CreateCustomerProfileRequestModel}
         * */
        const requestBody = {
            fbUserId: stFbUserId,
            fullName: value.fullName,
            phone: value.phone,
            email: value.email,
            note: value.note,
            tags: stTags && stTags.length > 0? stTags.map(tagObj => tagObj.value? tagObj.value:tagObj):[]
        };

        // check staff
        if (TokenUtils.isStaff() && CredentialUtils.getOmiCallEnabled()) {
            requestBody.responsibleStaffUserId = CredentialUtils.getUserId()
        }

        beehiveService.createCustomerDetail(requestBody)
            .then(result => {
                setStTags([]);
                getUserLinkWithCustomerProfile(stFbUserId);
                dispatch(LiveChatConversationContext.actions.addNewCustomer(false));
                GSToast.success("page.livechat.customer.details.add.success.msg", true);
            })
            .catch(e => {
                if (e.response && e.response.data) {
                    if (e.response.data.errorKey === 'customer.exist') {
                        GSToast.error("page.livechat.customer.details.add.exist.msg", true);
                    } else if (e.response.data.errorKey === 'customer.email.exist') {
                        GSToast.error("page.livechat.customer.details.add.email.exist.msg", true);
                    } else if (e.response.data.errorKey === 'customer.phone.exist') {
                        GSToast.error("page.livechat.customer.details.add.phone.exist.msg", true);
                    } else {
                        GSToast.commonError();
                    }
                } else {
                    GSToast.commonError();
                }
            })
    };

    const phoneValidate = (value, ctx, input, cb) => {
        ValidateUtils.phoneValidate(i18next, value, ctx, input, cb);
    };

    const phoneOrEmail = (value, ctx, input, cb) => {
        ValidateUtils.phoneOrEmail(i18next, value, ctx, input, cb);
    };

    return (
        <>
            <ConfirmModal ref={refShowComfirm}/>
        {
            <div className={["live-chat-customer-details gs-atm__scrollbar-1", className, 'live-chat-customer-details--' + (isShow? 'opened':'closed')].join(' ')} {...other}>
                {stCurrentPage === PAGE_TYPE_SEARCH &&
                    <div className={'customer-details-search'}>
                        <div className={'search-header'}>
                        <span>
                            <GSTrans t="page.livechat.customer.details.view.customer.information">
                              View Customer Information
                            </GSTrans>
                        </span>
                            <span className={'btn-close'} onClick={close}>
                            <i className="icon-close "/>
                        </span>
                        </div>
                        <div className={'search-params'}>
                            <div className={'search-hint'}>
                                <GSTrans t="page.livechat.customer.details.search.description">
                                    Enter one of the customer parameters to get more customer information
                                </GSTrans>
                            </div>
                            <div className={'search-parameter'}>
                                <GSTrans t="page.livechat.customer.details.search.parameter">
                                    PARAMETER
                                </GSTrans>
                            </div>
                            <div>
                            <span style={{
                                marginRight: 'auto'
                            }} className="gs-search-box__wrapper">
                                <UikInput
                                    defaultValue={stFilterConfig.keyword}
                                    onChange={onSearchChange}
                                    onKeyPress={onKeyPressSearch}
                                    iconPosition="right"
                                    icon={(
                                        <GSButton success onClick={search}>
                                            <Trans i18nKey="page.customers.search">
                                                Search
                                            </Trans>
                                        </GSButton>
                                    )}
                                    placeholder={i18next.t("page.customers.searchByName")}
                                    key={stFilterConfig.keyword}
                                />
                            </span>
                            </div>
                            <div className={'search-add-new'}>
                                <GSButton default icon={<i className="btn-addNewCustomer__icon"/>} onClick={onClickAddNewCustomer}>
                                    <GSTrans t={"page.livechat.customer.details.search.addNewCustomer"}/>
                                </GSButton>
                            </div>
                        </div>
                        { stShowResult &&
                            <div className={'search-result'}>
                                <div className={'result-header'}><GSTrans t="page.livechat.customer.details.search.result">
                                    RESULT
                                </GSTrans></div>
                                {stItemList.length > 0 && !stIsFetching &&
                                <section className="gs-mobile-list-container">
                                    {stItemList.map(item => {
                                        return (
                                            <div className="gs-mobile-list__row"
                                                 key={'m' + item.id}
                                                 onClick={() => onClickCustomerRow(item.id, item.userId, item.saleChannel, item.fbUsers ? item.fbUsers.length : 0)}>
                                                <div className="mobile-customer-profile-row__info">
                                                    <div className="mobile-customer-profile-row__left">
                                                        <div className="full-name">{item.fullName}</div>
                                                        <div className="pin-cnt">{item.fbUsers.length} <GSTrans t="page.livechat.customer.details.pinned">pinned</GSTrans>
                                                        </div>
                                                    </div>
                                                    <div className="mobile-customer-profile-row__right">
                                                         ID: {item.id}
                                                    </div>
                                                    <div className={["user-type ", item.guest ? "guest-type" : "mem-type"].join('')}>
                                                        {item.guest ? i18next.t('page.livechat.customer.details.search.user_type.contact') : i18next.t('page.livechat.customer.details.search.user_type.member')}
                                                    </div>
                                                </div>
                                                <div className="mobile-customer-profile-row__info gs-atm__flex-align-items--end">
                                                    <span className="mobile-customer-profile-row__left">
                                                        {item.phoneBackup && item.phoneBackup.split(',')[0]}
                                                    </span>
                                                    <span className="mobile-customer-profile-row__right">
                                                        {item.email}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </section>}
                                {stIsFetching &&
                                <Loading style={LoadingStyle.DUAL_RING_GREY}
                                         className="loading-list"
                                />
                                }

                                <PagingTable
                                    totalPage={stPaging.totalPage}
                                    maxShowedPage={1}
                                    currentPage={stPaging.currentPage}
                                    onChangePage={onChangePage}
                                    totalItems={stItemList.length}
                                    className="m-paging"
                                />

                                {stItemList.length === 0 && !stIsFetching &&
                                <GSWidgetEmptyContent
                                    iconSrc="/assets/images/icom-empty-customerdetails.svg"
                                    text={i18next.t("page.livechat.customer.details.search.no.result")}/>
                                }
                            </div>
                        }
                    </div>
                }
                {stCurrentPage === PAGE_TYPE_CUSTOMER_EDITOR &&
                    <div className={'customer-details-editor'}>
                        <Prompt
                            when={!stDisabledSave}
                            message={i18next.t('page.livechat.customer.details.leave.without.save.html')}
                        />
                        {stIsPinning &&
                            <LoadingScreen loadingStyle={LoadingStyle.DUAL_RING_WHITE}
                            />
                        }
                        <div className={"editor-header"}>
                            <div className="left">
                                {!isPin &&
                                <GSButton
                                    success
                                    // className={["btn btn-pin", ''].join(' ')}
                                    // transparent="true"
                                    icon={(
                                        <i className="icon-pin"/>
                                    )}
                                    onClick={() => pin(stMatch.params.customerId)}
                                >
                                    <GSTrans t="page.livechat.customer.details.pin">
                                        Pin
                                    </GSTrans>
                                </GSButton>}
                                {isPin &&
                                <GSButton
                                    success
                                    // className={["btn btn-unpin", ''].join(' ')}
                                    // transparent="true"
                                    icon={(
                                        <i className="icon-unpin"/>
                                    )}
                                    onClick={() => unpin(stMatch.params.customerId)}
                                >
                                    <GSTrans t="page.livechat.customer.details.unpin">
                                        Unpin
                                    </GSTrans>
                                </GSButton>
                                }
                                <span className={'btn-information'}>
                                <GSComponentTooltip
                                    interactive
                                    html={
                                        <>
                                            <GSTrans t="page.livechat.customer.details.pin.toolTips">
                                                Pin helps to view customer information quickly without searching again
                                            </GSTrans>
                                        </>
                                    }
                                >
                                    <i className="icon-information"/>
                                </GSComponentTooltip>
                            </span>
                            </div>
                            <span className={'btn-close'} onClick={closeCustomerEditor}>
                            <i className="icon-close"/>
                        </span>
                        </div>
                        <CustomerEditor ref={refCustomerEditor}
                                        match={stMatch}
                                        history={props.history}
                                        disabled={false}
                                        disabledConfirmWhenRedirect={true}
                                        openOrderNewTab={true}
                                        noRedirectAfterSave={true}
                                        embeddedFrom={"FB"}
                        />
                        <div className={'editor-footer'}>
                            <GSButton disabled={stDisabledSave} success onClick={()=>{refCustomerEditor.current.onClickBtnSave()}} marginLeft className="btn-save">
                                <GSTrans t={"common.btn.save"}/>
                            </GSButton>
                        </div>
                    </div>
                }
                {stCurrentPage === PAGE_TYPE_ADD_CUSTOMER &&
                <div className={'add-customer-container'}>
                    <Prompt
                        when={!stDisabledSaveNewCustomer}
                        message={i18next.t('page.livechat.customer.details.add.leave.without.save.html')}
                    />
                    <div className={'add-customer-header'}>
                        <span>
                            <GSTrans t="page.livechat.customer.details.add.new.customer.title">
                              Add New Customer
                            </GSTrans>
                        </span>
                        <span className={'btn-close'} onClick={closeAddNewCustomer}>
                            <i className="icon-close "/>
                        </span>
                    </div>
                    <div className={'add-customer-body'}>
                        <AvForm onValidSubmit={handleValidSubmit} autoComplete="off">
                            <button ref={refSubmit} hidden/>
                            {/*FULL NAME*/}
                            <AvField
                                disabled={props.disabled}
                                label={i18next.t("page.customers.edit.fullName")}
                                name={"fullName"}
                                validate={{
                                    ...FormValidate.maxLength(100, true)
                                }}
                                onChange={changeCustomerProfileInfo}
                            />
                            {/*EMAIL*/}
                            <AvField
                                disabled={props.disabled}
                                label={i18next.t("page.customers.edit.email")}
                                name={"email"}
                                type={"email"}
                                validate={{
                                    ...FormValidate.email(),
                                    ...FormValidate.maxLength(100),
                                    myValidation: phoneOrEmail
                                }}
                                onChange={changeCustomerProfileInfo}
                            />
                            {/*PHONE*/}
                            <AvField
                                disabled={props.disabled}
                                label={i18next.t("page.customers.edit.phone")}
                                name={"phone"}
                                validate={{
                                    ...FormValidate.maxLength(1_000_000, false),
                                    ...FormValidate.pattern.numberOrEnter(),
                                    async: phoneValidate,
                                    myValidation: phoneOrEmail
                                }}
                                onChange={changeCustomerProfileInfo}
                            />
                            {/*TAGS*/}
                            <div className='form-group'>
                                <label className="gs-frm-input__label">
                                    <GSTrans t={"page.customers.edit.tags"} />
                                </label>
                                <GSTags disabled={props.disabled}
                                        placeholer={''}
                                        className={style.gsTag}
                                        onChange={onChangeTags}
                                        defaultValue={stTags}
                                />
                            </div>
                            {/*NOTE*/}
                            <AvField
                                disabled={props.disabled}
                                label={i18next.t("page.customers.edit.note")}
                                name={"note"}
                                type={"textarea"}
                                validate={{
                                    ...FormValidate.maxLength(1_000, true)
                                }}
                                onChange={changeCustomerProfileInfo}
                            />
                        </AvForm>
                    </div>
                    <div className={'add-customer-footer'}>
                        <GSButton disabled={stDisabledSaveNewCustomer} success onClick={()=>{refSubmit.current.click()}} marginLeft className="btn-save">
                            <GSTrans t={"common.btn.save"}/>
                        </GSButton>
                    </div>
                </div>
                }
            </div>
        }
        </>
    );
};

LiveChatCustomerDetails.propTypes = {
    className: PropTypes.string,
    history: PropTypes.any,
    isShow: PropTypes.bool,
    onToggleCustomerDetail: PropTypes.func,
};

export default LiveChatCustomerDetails;

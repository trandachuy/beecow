import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import './AssignStaff.sass';
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import {UikInput} from "../../../@uik";
import i18n from "../../../config/i18n";
import {AvForm, AvRadio, AvRadioGroup} from "availity-reactstrap-validation";
import style from "../../affiliate/commission/CouponEditor.module.sass";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import storeService from "../../../services/StoreService";
import accountService from "../../../services/AccountService";
import {CredentialUtils} from "../../../utils/credential";
import useDebounceEffect from "../../../utils/hooks/useDebounceEffect";
import i18next from "i18next";
import GSWidgetEmptyContent from "../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import {TokenUtils} from "../../../utils/token";
import {ROLES} from "../../../config/user-roles";

const MAX_STAFF_PAGE_SIZE = 8;

const AssignStaff = (props) => {
    const [stShowAssign, setStShowAssign] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [stStaffList, setStStaffList] = useState([]);
    const [stStoreOwner, setStStoreOwner] = useState(null);
    const [stSearchText, setStSearchText] = useState('');
    const refInputSearch = useRef(null);
    const [stPaging, setStPaging] = useState({
        totalPage: 0,
        totalItem: 0,
        currentPage: 0
    });

    useEffect(() => {
        accountService.getUserById(CredentialUtils.getStoreOwnerId()).then(data => {
            let storeOwner = {
                id: data.id,
                userId: data.id,
                name: data.displayName,
                staffIsSeller: true
            };
            fetchData(storeOwner);
        });
    }, []);

    const fetchData = (storeOwner) => {
        setIsSearching(true);
        storeService.getStaffsForGoChat({
            page: stPaging.currentPage,
            size: MAX_STAFF_PAGE_SIZE,
            keyword: stSearchText,
            enabled: true
        }).then(data => {
            let list = [];
            if (storeOwner != null) {
                setStStoreOwner(storeOwner);
                list = [storeOwner];
            }
            setStStaffList([...list, ...stStaffList, ...data.data.map(x => {return {...x, staffIsSeller: false}})]);

            const totalItem = parseInt(data.headers["x-total-count"]);
            setStPaging({
                ...stPaging,
                totalPage: Math.ceil(totalItem / MAX_STAFF_PAGE_SIZE),
                totalItem: totalItem
            });
            setIsSearching(false);
        })
    }

    const onClickUnAssign = () => {
        if (props.unAssignCallback) {
            props.unAssignCallback();
        }
        toggleAssignStaffModal();
    }

    const onClickAssignToMe = () => {
        if (props.assignCallback) {
            if (TokenUtils.isHasRole(ROLES.ROLE_GOSELL_STAFF)) {
                storeService.getStaffByUserOfStore(CredentialUtils.getUserId()).then(data => {
                    props.assignCallback({
                        id: data.id,
                        userId: data.userId,
                        name: data.name,
                        staffIsSeller: false
                    });
                });
            } else {
                props.assignCallback(stStoreOwner);
            }
        }
        toggleAssignStaffModal();
    }

    const onClickAssign = (staff) => {
        if (props.assignCallback) {
            props.assignCallback(staff);
        }
        toggleAssignStaffModal();
    }

    const toggleAssignStaffModal = () => {
        setStShowAssign(!stShowAssign)
    }

    const onSearchChange = (e) => {
        const keyword = e.currentTarget.value
        setStSearchText(keyword);
        setStPaging({
            ...stPaging,
            currentPage: 0
        });
        setStStaffList([]);
    };

    useDebounceEffect(() => {
        if (stStoreOwner != null) {
            fetchData(null);
        }
    }, 500, [stSearchText, stPaging.currentPage]);

    const scrollStaffList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && stPaging.currentPage < stPaging.totalPage) {
            setStPaging({
                ...stPaging,
                currentPage: stPaging.currentPage + 1
            })
        }
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    return (
        <div className={'assign-staff-container position-relative'} onBlur={toggleAssignStaffModal}>
            <div className="btn-assign" onClick={toggleAssignStaffModal}>
                <span className='mr-2'>
                    {props.assignStaffName ? props.assignStaffName : <GSTrans t="page.livechat.staff.unassigned"/>}
                </span>
                {!stShowAssign &&
                <FontAwesomeIcon size="xs" color="gray" className="icon-filter"
                                 icon="angle-down"/>
                }
                {stShowAssign &&
                <FontAwesomeIcon size="xs" color="gray" className="icon-filter"
                                 icon="angle-up"/>
                }
            </div>
            {stShowAssign &&
            <>
                {/* POPUP ASSIGN STAFF */}
                <div className="dropdown-menu d-desktop-block d-mobile-none">
                    <GSWidgetContent>
                        {/*SEARCH*/}
                        <div className="search-assign-staff">
                            <UikInput
                                ref={refInputSearch}
                                onChange={onSearchChange}
                                icon={(
                                    <FontAwesomeIcon icon="search"/>
                                )}
                                placeholder={i18n.t("productList.search.staff.placeholder")}
                                value={stSearchText}
                            />
                        </div>
                        <div className='box_list-staff'
                             onScroll={scrollStaffList}>
                            {stStaffList.length === 0 && !isSearching &&
                                <GSWidgetEmptyContent
                                iconSrc="/assets/images/search-not-found.png"
                                text={i18next.t("common.noResults")}/>
                            }
                            <AvForm>
                                <AvRadioGroup
                                    className={["gs-frm-radio"].join(" ")}
                                    name="staffType"
                                    defaultValue={props.assignStaffId}
                                    value={props.assignStaffId}
                                >
                                    {stStaffList.map((staff, index) => {
                                        return (
                                            <div className='staff-row' key={props.assignStaffId + staff.id}>
                                                <AvRadio
                                                    className={style.customRadio}
                                                    customInput
                                                    label={staff.name}
                                                    value={staff.id}
                                                    onClick={() => onClickAssign(staff)}
                                                />
                                            </div>
                                        )
                                    })}
                                </AvRadioGroup>
                            </AvForm>

                        </div>
                        <div className='box_button-assign'>
                            <GSButton className='ml-3' onClick={onClickUnAssign}>
                                <Trans i18nKey="common.btn.unassign" className="sr-only">
                                    Unassign
                                </Trans>
                            </GSButton>
                            <GSButton className='mr-3' success onClick={onClickAssignToMe}>
                                <Trans i18nKey="common.btn.assign" className="sr-only">
                                    Assign to me
                                </Trans>
                            </GSButton>
                        </div>
                    </GSWidgetContent>
                </div>
            </>}
        </div>
    )
}
export default AssignStaff;

AssignStaff.propTypes = {
  assignCallback: PropTypes.func,
  assignStaffId: PropTypes.number,
  assignStaffName: PropTypes.string,
  unAssignCallback: PropTypes.func
}

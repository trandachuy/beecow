/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/09/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import './BlogArticleList.sass'
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSContentHeaderRightEl
    from "../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {withRouter} from "react-router-dom";
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import {cn} from "../../../../utils/class-name";
import GSSearchInput from "../../../../components/shared/GSSearchInput/GSSearchInput";
import i18next from "i18next";
import {UikSelect} from "../../../../@uik";
import beehiveService from "../../../../services/BeehiveService";
import GSTable from "../../../../components/shared/GSTable/GSTable";
import GSPagination from "../../../../components/shared/GSPagination/GSPagination";
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import GSWidgetLoadingContent from "../../../../components/shared/GSWidgetLoadingContent/GSWidgetLoadingContent";
import GSImg from "../../../../components/shared/GSImg/GSImg";
import moment from 'moment'
import {CredentialUtils} from "../../../../utils/credential";
import accountService from "../../../../services/AccountService";
import HintPopupVideo from "../../../../components/shared/HintPopupVideo/HintPopupVideo";

const SIZE_PER_PAGE = 20
const BlogArticleList = props => {
    const refSearchInput = useRef(null);
    const [stPaging, setStPaging] = useState({
        totalItem: 0,
        page: 0
    });
    const [stSearchParams, setStSearchParams] = useState({
        'title.contains': undefined,
        'authorId.equals': undefined,
        'catId.equals': undefined,
        'sort': 'lastModifiedDate,desc'
    })
    const [stItemList, setStItemList] = useState([]);
    const [stIsFetching, setStIsFetching] = useState(false);
    const [stStaffList, setStStaffList] = useState([]);
    const [stCatList, setStCatList] = useState([]);

    const updateSearchParams = (param, value) => {
        setStSearchParams(state => ({
            ...state,
            [param]: value
        }))
    }

    const onClickBtnCreateArticle = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.articleCreate)
    }

    const onClickBtnCategoryManagement = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.blogCategoryManagement)
    }

    const onChangeFilter = (value, name) => {
        updateSearchParams(name, value === 'all'? undefined:value)
    }

    useEffect(() => {
        beehiveService.getBlogArticleAvailableAuthor()
            .then(staffList => {
                accountService.getUserByIds([CredentialUtils.getStoreOwnerId(), ...staffList])
                    .then(authorList => {
                        setStStaffList(authorList)
                    })
            })
            .finally(() => {
                setStIsFetching(false)
            })
    }, []);

    const setArticleList = (articleList) => {
        articleList.forEach(ar => {
            const matchedStaff = stStaffList.find(staff => staff.id == ar.authorId)
            if (matchedStaff) {
                ar.authorName = matchedStaff.displayName
            }
        })
        setStItemList(articleList)
    }

    useEffect(() => {
        fetchData()
    }, [stPaging.page, stStaffList]);

    useEffect(() => {
        fetchData(0)
    }, [stSearchParams])

    useEffect(() => {
        getAllCategories()
    }, [])

    const getAllCategories = () => {
        beehiveService.getAllCategoryByFilter({page: 0, size: 9999})
        .then(resp => {
            let cats = resp.content.filter(r => r.deleted === false)
            setStCatList(cats);
        })
    }

    const fetchData = (page) => {
        setStIsFetching(true)
        beehiveService.getBlogArticleList(stSearchParams, page || stPaging.page, SIZE_PER_PAGE)
            .then(res => {
                setStPaging({
                    page: page === undefined? stPaging.page:page,
                    totalItem: res.totalItem
                })
                setArticleList(res.data)
                setStIsFetching(false)
            })
    }

    const onChangePage = (page) => {
        setStPaging(state => ({
            ...state,
            page: page - 1
        }))
    }

    return (
        <GSContentContainer>
            <GSContentHeader title={<GSTrans t={'page.storeFront.blog.management'}/>}>
                <HintPopupVideo title={'Blog managerment'} category={'BLOG_MANAGERMENT'}/>
                <GSContentHeaderRightEl className="d-flex">
                    <GSButton success onClick={onClickBtnCreateArticle}>
                        <GSTrans t={'page.storeFront.blog.createArticle'}/>
                    </GSButton>
                    <GSButton success outline marginLeft onClick={onClickBtnCategoryManagement}>
                        <GSTrans t={'page.storeFront.blog.category.management'} />
                    </GSButton>
                </GSContentHeaderRightEl>
            </GSContentHeader>
            <GSContentBody size={GSContentBody.size.MAX} className="d-flex flex-column flex-grow-1">
                <GSWidget className="flex-grow-1 d-flex flex-column">
                    <GSWidgetContent className="flex-grow-1 d-flex flex-column">
                        <section className={cn("d-flex justify-content-between align-items-center", {
                            'user-disabled': stIsFetching
                        })}>
                            <div className="d-flex align-items-center">
                                <GSSearchInput
                                    liveSearchOnMS={500}
                                    ref={refSearchInput}
                                    placeholder={i18next.t(
                                        "page.storeFront.blog.management.filter.search.blog"
                                    )}
                                    style={{
                                        width: "300px",
                                        height: '38px'
                                    }}
                                    onSearch={(value) => updateSearchParams('title.contains', value)}
                                />
                            </div>

                            <div>

                                <UikSelect
                                    style={{
                                        width: '150px'
                                    }}
                                    position="top-right"
                                    className="ml-2"
                                    defaultValue={stSearchParams['catId.equals'] || 'all'}
                                    key={'catId-' + (stSearchParams['catId.equals'] || 'all')}
                                    onChange={({value}) => onChangeFilter(value, 'catId.equals')}
                                    options={[
                                        {
                                            value: "all",
                                            label: i18next.t("page.storeFront.blog.management.filter.allCate"),
                                        },
                                        ...stCatList.map(cat => ({
                                            value: cat.id,
                                            label: cat.title
                                        }))
                                    ]}
                                />

                                <UikSelect
                                    style={{
                                        width: '150px'
                                    }}
                                    position="top-right"
                                    className="ml-2"
                                    defaultValue={stSearchParams['authorId.equals'] || 'all'}
                                    key={'authorId-' + (stSearchParams['authorId.equals'] || 'all')}
                                    onChange={({value}) => onChangeFilter(value, 'authorId.equals')}
                                    options={[
                                        {
                                            value: "all",
                                            label: i18next.t("page.storeFront.blog.management.filter.allAuthor"),
                                        },
                                        ...stStaffList.map(staff => ({
                                            value: staff.id,
                                            label: staff.displayName
                                        }))
                                    ]}
                                />
                                {/*
                                <UikSelect
                                    style={{
                                        width: '150px',
                                    }}
                                    className="ml-2 d-none"
                                    position="top-right"
                                    defaultValue={stSearchParams['status.equals'] || 'all'}
                                    key={'status-' + (stSearchParams['status.equals'] || 'all')}
                                    onChange={({value}) => onChangeFilter(value, 'status.equals')}
                                    options={[
                                        {
                                            value: "all",
                                            label: i18next.t("page.storeFront.blog.management.filter.allStatus"),
                                        },
                                        {
                                            value: BlogArticleEnum.ARTICLE_STATUS.PUBLISHED,
                                            label: i18next.t("page.storeFront.blog.management.filter.status.published"),
                                        }
                                    ]}
                                /> */}

                                <UikSelect
                                    style={{
                                        width: '150px',
                                    }}
                                    className="ml-2"
                                    position="top-right"
                                    defaultValue={stSearchParams['sort'] || 'all'}
                                    key={'sort-' + (stSearchParams['sort'] || 'all')}
                                    onChange={({value}) => onChangeFilter(value, 'sort')}
                                    options={[
                                        {
                                            value: "all",
                                            label: i18next.t("page.storeFront.blog.management.filter.date"),
                                        },
                                        {
                                            value: 'lastModifiedDate,asc',
                                            label: i18next.t("page.storeFront.blog.management.filter.date.oldest"),
                                        },
                                        {
                                            value: 'lastModifiedDate,desc',
                                            label: i18next.t("page.storeFront.blog.management.filter.date.newest"),
                                        }
                                    ]}
                                />
                            </div>
                        </section>
                        <GSTable className="mt-3">
                            <thead>
                            <tr>
                                <th>
                                    <GSTrans t={"page.storeFront.blog.management.table.thumbnail"}/>
                                </th>
                                <th>
                                    <GSTrans t={"page.storeFront.blog.management.table.articleName"}/>
                                </th>
                                <th className="white-space-nowrap px-5 text-center">
                                    <GSTrans t={"page.storeFront.blog.management.table.author"}/>
                                </th>
                                <th className="white-space-nowrap px-5">
                                    <GSTrans t={"page.storeFront.blog.management.table.lastModified"}/>
                                </th>

                            </tr>
                            </thead>
                            <tbody>
                            {!stIsFetching && stItemList.map(item => {
                                return (
                                    <tr key={item.id} className="gsa-hover--gray cursor--pointer" onClick={() => {
                                        RouteUtils.redirectWithoutReload(props, NAV_PATH.articleEdit + '/' + item.id)
                                    }}>
                                        <td style={{width: '4rem'}}>
                                            <GSImg alt="item" src={item.imageUrl} style={{
                                                width: '3rem',
                                                height: '3rem'
                                            }}/>
                                        </td>
                                        <td>
                                            <strong>{item.title}</strong>
                                        </td>
                                        <td  className="white-space-nowrap text-center">
                                            {item.authorName}
                                        </td>
                                        <td className="pl-5">
                                            <span>
                                                {moment(item.lastModifiedDate).format('HH:mm')}
                                            </span>
                                            <br/>
                                            <span className="white-space-nowrap">
                                                {moment(item.lastModifiedDate).format('DD-MM-YYYY')}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}

                            </tbody>

                        </GSTable>
                        {!stIsFetching && stItemList.length > 0 &&
                        <GSPagination totalItem={stPaging.totalItem}
                                       currentPage={stPaging.page + 1}
                                       onChangePage={onChangePage}
                                       pageSize={SIZE_PER_PAGE}
                        />}

                        {stItemList.length === 0 && !stIsFetching &&
                        <GSWidgetEmptyContent className="flex-grow-1"
                                              iconSrc="/assets/images/icon-Empty.svg"
                                              text={i18next.t("common.noResultFound")}
                                              mode="horizontal"
                        />}

                        {stIsFetching &&
                        <GSWidgetLoadingContent/>
                        }
                    </GSWidgetContent>
                </GSWidget>
            </GSContentBody>
        </GSContentContainer>
    );
};

BlogArticleList.propTypes = {

};

export default withRouter(BlogArticleList);

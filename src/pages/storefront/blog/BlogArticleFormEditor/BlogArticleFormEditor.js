/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/09/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import {AvField, AvForm} from 'availity-reactstrap-validation';
import i18next from 'i18next';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import {withRouter} from 'react-router-dom';
import GSContentBody from '../../../../components/layout/contentBody/GSContentBody';
import GSContentContainer from '../../../../components/layout/contentContainer/GSContentContainer';
import GSContentHeaderRightEl
    from '../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl';
import GSContentHeader from '../../../../components/layout/contentHeader/GSContentHeader';
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation';
import ConfirmModal from '../../../../components/shared/ConfirmModal/ConfirmModal';
import AvFieldCountable from '../../../../components/shared/form/CountableAvField/AvFieldCountable';
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget';
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent';
import GSWidgetHeader from '../../../../components/shared/form/GSWidget/GSWidgetHeader';
import GSButton from '../../../../components/shared/GSButton/GSButton';
import GSButtonUpload from '../../../../components/shared/GSButtonUpload/GSButtonUpload';
import GSButtonUploadFeedBack from '../../../../components/shared/GSButtonUploadFeedBack/GSButtonUploadFeedBack';
import GSEditor from '../../../../components/shared/GSEditor/GSEditor';
import GSFakeLink from '../../../../components/shared/GSFakeLink/GSFakeLink';
import GSImg from '../../../../components/shared/GSImg/GSImg';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import Constants from '../../../../config/Constant.js';
import {FormValidate} from '../../../../config/form-validate';
import accountService from '../../../../services/AccountService';
import beehiveService from '../../../../services/BeehiveService';
import mediaService, {MediaServiceDomain} from '../../../../services/MediaService';
import storeService from '../../../../services/StoreService.js';
import {CredentialUtils} from '../../../../utils/credential';
import {GSToast} from '../../../../utils/gs-toast';
import {ImageUtils} from '../../../../utils/image';
import {RouteUtils} from '../../../../utils/route';
import {StringUtils} from '../../../../utils/string';
import SEOEditor from '../../../seo/SEOEditor';
import {BlogArticleEnum} from '../BlogArticleEnum';
import ArticleTranslateModal from './ArticleTranslateModal.js';
import './BlogArticleFormEditor.sass';
import CategorySelector from './CategorySelector.js';
import {ItemUtils} from '../../../../utils/item-utils'
import storageService from '../../../../services/storage'
import HocSEOEditor from '../../../seo/hoc/HocSEOEditor'

const BlogArticleFormEditor = props => {
    const refBtnSubmit = useRef(null);
    const refConfirmModal = useRef(null);
    const [stIsLoading, setStIsLoading] = useState(props.mode === BlogArticleEnum.MODE.EDIT);
    const [stIsSaving, setStIsSaving] = useState(false);
    const [stOnFormChanged, setStOnFormChanged] = useState(false);
    const [boughtLanguagePackage, setBoughtLanguagePackage] = useState(false);

    const [stArticle, setStArticle] = useState({
        id: undefined,
        title: '',
        content: '',
        featuredText: '',
        imageUrl: '',
        authorId: '',
        status: 'PUBLISHED',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        seoUrl: '',
        deleted: false,
        createdBy: '',
        createDate: '',
        lastModifiedBy: '',
        lastModifiedDate: '',
        categoryIds: []
    });

    const [stTempArticle, setStTempArticle] = useState({
        authorName: ''
    });

    const [stUploadedImage, setStUploadedImage] = useState(null);
    const [stIsShowImageRequiredMsg, setStIsShowImageRequiredMsg] = useState(false);
    const [stOnViewPost, setStOnViewPost] = useState(false);

    const refSEOUrl = useRef()

    useEffect(() => {
        storeService.getActiveOrderPackageByStoreId({ channel: Constants.PACKAGE_PRICE_CHANNEL.MULTI_LANGUAGE })
            .then(orderDetails => setBoughtLanguagePackage(Boolean(orderDetails)), GSToast.commonError);
    }, []);

    useEffect(() => {
        if (props.mode === BlogArticleEnum.MODE.CREATE) {
            setStArticle({
                ...stArticle,
                authorId: CredentialUtils.getUserId()
            })
        } else {
            beehiveService.getBlogArticle(props.articleId)
                .then(articleObj => {
                    setStArticle(articleObj)
                    setStIsLoading(false)
                })
        }
    }, [props.articleId])

    // update author information
    useEffect(() => {
        if (stArticle.authorId) {
            accountService.getUserById(stArticle.authorId)
                .then(res => {
                    setStTempArticle({
                        ...stTempArticle,
                        authorName: res.displayName
                    })
                })
        }
    }, [stArticle.authorId])

    useEffect(() => {
        if (stOnViewPost) {
            refBtnSubmit.current.click();
        }
    }, [stOnViewPost])


    const onChangeImageUpload = (files) => {
        const file = files[0]
        if (file) {
            setStUploadedImage(file)
            setStArticle({
                ...stArticle,
                imageUrl: null
            })
            setOnFormChange();
            setStIsShowImageRequiredMsg(false)
        }
    }

    const onRemoveImage = () => {
        setStUploadedImage(null)
        setStArticle({
            ...stArticle,
            imageUrl: null
        })
        setOnFormChange();
    }

    const onClickBtnSave = () => {
        setStIsShowImageRequiredMsg(false);
        refBtnSubmit.current.click()
    }

    const onClickBtnCancel = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.blog)
    }

    const onClickBtnDelete = () => {
        refConfirmModal.current.openModal({
            messages: i18next.t('page.storeFront.blog.article.removeHint'),
            okCallback: deleteArticle

        })
    }

    const deleteArticle = async () => {
        setStIsSaving(true)
        try {
            const deletedRes = await beehiveService.deleteBlogArticle(stArticle.id)
            setStOnFormChanged(false)
            setTimeout(() => {
                RouteUtils.redirectWithoutReload(props, NAV_PATH.blog)
            }, 200)
        } catch (e) {

        } finally {
            setStIsSaving(false)
        }
    }

    const onInvalidSubmit = () => {
        setStOnViewPost(false)
    }

    const onValidSubmit = async (event, values) => {
        const isSEOUrlValidRes = refSEOUrl.current && await refSEOUrl.current.isValid()

        if (!isSEOUrlValidRes) {
            return
        }

        setStIsSaving(true)

        let requestBody = {...stArticle, ...values}
        requestBody.seoUrl = requestBody.seoUrl ? ItemUtils.changeNameToLink(requestBody.seoUrl) : undefined
        // upload new image
        if (stUploadedImage) {
            const imgObj = await mediaService.uploadFileWithDomain(stUploadedImage, MediaServiceDomain.GENERAL)
            const imgUrl = ImageUtils.getImageFromImageModel(imgObj)
            requestBody.imageUrl = imgUrl
        }
        // request to update
        try {
            // remove audit fields
            requestBody.lastModifiedDate = undefined

            requestBody = _.pickBy(requestBody, _.identity())
            let res = null
            switch (props.mode) {
                case BlogArticleEnum.MODE.CREATE:
                    res = await beehiveService.createBlogArticle(requestBody)
                    setStOnFormChanged(false)
                    setTimeout(() => {
                        const {id} = res
                        RouteUtils.redirectWithoutReload(props, NAV_PATH.articleEdit + '/' + id)
                        GSToast.commonCreate()
                    }, 200)
                    break;
                case BlogArticleEnum.MODE.EDIT:
                    res = await beehiveService.updateBlogArticle(requestBody)
                    GSToast.commonUpdate()
                    setStArticle(res)
                    setStOnFormChanged(false)
                    break;
            }
            if (res && stOnViewPost) {
                const slug = res.seoUrl || StringUtils.toSlugs(res.title)
                window.open(CredentialUtils.getStoreFullUrl() + '/article/' + slug + '-a' + res.id, '_blank')
            }
        } catch (e) {
            GSToast.commonError()
        } finally {
            setStIsSaving(false)
            setStOnViewPost(false)
        }
    }

    const setOnFormChange = () => {
        if (!stOnFormChanged) {
            setStOnFormChanged(true)
        }
    }

    const onClickViewArticle = () => {
        setStOnViewPost(true)
    }

    const updateSelectedCategories = (values) => {
        const categoryIds = values.map(val => {
            const { id, deleted, description, title, seoDescription, seoKeywords, seoTitle, seoUrl, stooreId } = val.entity;
            return { id, deleted, description, title, seoDescription, seoKeywords, seoTitle, seoUrl, stooreId };
        });
        setStArticle({ ...stArticle, categories: categoryIds });
    }

    return (
        <GSContentContainer className="blog-article-form-editor"
                            confirmWhenRedirect
                            confirmWhen={stOnFormChanged}
                            isSaving={stIsSaving}
                            isLoading={stIsLoading}
        >
            <ConfirmModal ref={refConfirmModal} />
            <GSContentHeader
                title={props.mode === BlogArticleEnum.MODE.CREATE
                    ? i18next.t('page.storeFront.blog.article.createNewArticle')
                    : (
                        <span className="text-overflow-ellipsis d-inline-block" style={{ maxWidth: '55vw' }}>
                            {stArticle.title}
                        </span>
                    )
                }
                backLinkTo={NAV_PATH.blog}
                backLinkText={i18next.t('page.storeFront.blog.nav')}
            >
                <GSContentHeaderRightEl className="d-flex">
                    {boughtLanguagePackage && props.mode === BlogArticleEnum.MODE.EDIT &&
                        <ArticleTranslateModal articleId={props.articleId} initialContent={stArticle} />}

                    <GSButton success marginLeft onClick={onClickBtnSave}>
                        <GSTrans t={'common.btn.save'}/>
                    </GSButton>
                    {props.mode === BlogArticleEnum.MODE.EDIT &&
                    <GSButton danger outline marginLeft onClick={onClickBtnDelete}>
                        <GSTrans t={'common.btn.delete'}/>
                    </GSButton>}
                    <GSButton secondary outline marginLeft onClick={onClickBtnCancel}>
                        <GSTrans t={'common.btn.cancel'}/>
                    </GSButton>

                </GSContentHeaderRightEl>
            </GSContentHeader>

            <GSContentBody size={GSContentBody.size.MAX}>
                <AvForm onValidSubmit={onValidSubmit}
                        onInvalidSubmit={onInvalidSubmit}
                        autocomplete="off"
                        onChange={setOnFormChange}
                >
                    <button ref={refBtnSubmit} hidden>submit</button>
                    <section className="d-flex">
                        <section className="blog-article-form-editor__col--left flex-grow-1">
                            <GSWidget>
                                <GSWidgetHeader rightEl={
                                    <span className=" gsa-hover--fadeOut pointer">
                                        {/*<img src="/assets/images/icon-view.png" width="16" alt="view-post-btn" style={{verticalAlign: 'baseline'}}/>*/}
                                        <GSFakeLink className="pl-2"  onClick={onClickViewArticle}>
                                           <GSTrans t={'page.storeFront.blog.article.viewPost1'}/>
                                        </GSFakeLink>
                                        {/*
                                        {' | '}
                                        <GSFakeLink>
                                           <GSTrans t={'page.storeFront.blog.article.viewPost'}/>
                                        </GSFakeLink>
                                         */}
                                    </span>}>
                                    <GSTrans t={'page.storeFront.blog.article.information'}/>
                                </GSWidgetHeader>
                                <GSWidgetContent>
                                    <AvField name="title"
                                             label={i18next.t('page.storeFront.blog.article.titleName')}
                                             validate={{
                                                 ...FormValidate.maxLength(300),
                                                 ...FormValidate.required()
                                             }}
                                             value={stArticle.title}
                                             onChange={e => setStArticle(article => ({...article, title: e.currentTarget.value}))}
                                    />

                                    <GSEditor name="content"
                                              label={i18next.t('page.storeFront.blog.article.content')}
                                              minLength={0}
                                              maxLength={100_000}
                                              validate={{
                                                  ...FormValidate.required()
                                              }}
                                              onChange={setOnFormChange}
                                              value={stArticle.content}

                                    />
                                    <FeatureText value={stArticle.featuredText} />
                                </GSWidgetContent>
                            </GSWidget>
                            <HocSEOEditor ref={ refSEOUrl }
                                          langKey={ storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE) }
                                          type={ Constants.SEO_DATA_TYPE.ARTICLE }
                                          data={ stArticle.id }>
                                <SEOEditor
                                    key={ stArticle.seoTitle + stArticle.seoDescription + stArticle.seoKeywords + stArticle.seoUrl }
                                    defaultValue={ {
                                        seoTitle: stArticle.seoTitle || '',
                                        seoDescription: stArticle.seoDescription || '',
                                        seoKeywords: stArticle.seoKeywords || '',
                                        seoUrl: stArticle.seoUrl || ''
                                    } }
                                    prefix="article/"
                                    middleSlug={ ItemUtils.changeNameToLink(stArticle.title || '') }
                                    postfix={ (props.mode === BlogArticleEnum.MODE.EDIT ? `-b${ stArticle.id }` : '') }
                                    assignDefaultValue={ false }
                                    enableLetterOrNumberOrHyphen={ false }
                                />
                            </HocSEOEditor>
                        </section>
                        <section className="blog-article-form-editor__col--right ">
                            <CategorySelector
                                editorMode={props.mode}
                                updateSelectedValues={updateSelectedCategories}
                                selectedCategories={stArticle.categories} />
                            <GSWidget>
                                <GSWidgetHeader>
                                    <GSTrans t="page.storeFront.blog.article.featuredImage"/>

                                </GSWidgetHeader>
                                <GSWidgetContent className="d-flex flex-column align-items-center">

                                    <GSImg src={stUploadedImage? stUploadedImage:stArticle.imageUrl} width={100} height={100}/>
                                    {(!stUploadedImage && !stArticle.imageUrl) &&
                                    <GSButtonUpload onUploaded={onChangeImageUpload}
                                                     marginTop
                                                     marginBottom
                                    />}
                                    {(stUploadedImage || stArticle.imageUrl) &&
                                    <GSButtonUploadFeedBack file={stUploadedImage}
                                                            src={stArticle.imageUrl}
                                                            onRemove={onRemoveImage}
                                                            className="blog-article-form-editor__upload-feedback"
                                    />
                                    }
                                    <em className="color-gray font-size-_8rem">
                                        <GSTrans t="page.storeFront.blog.article.featuredImage.hint"/>
                                    </em>
                                    {/*{stIsShowImageRequiredMsg &&*/}
                                    {/*<AlertInline type={AlertInlineType.ERROR}*/}
                                    {/*             nonIcon*/}
                                    {/*              text={i18next.t('page.storeFront.blog.article.uploadImageRequired')}/>*/}
                                    {/*}*/}
                                </GSWidgetContent>
                            </GSWidget>
                            <GSWidget>
                                <GSWidgetHeader>
                                    <GSTrans t={"component.discount.tbl.status"}/>
                                </GSWidgetHeader>
                                <GSWidgetContent>
                                    <table className="blog-article-form-editor__status-table font-weight-500">
                                        {/*AUTHOR*/}
                                        <tr>
                                            <td>
                                                <img src="/assets/images/writer.svg"
                                                     alt="writer"
                                                     width="20px"
                                                     className="vertical-align-baseline pr-2"/>
                                                <GSTrans t="page.storeFront.blog.article.author"/>
                                            </td>
                                            <td className="pl-3 text-gray">
                                                {stTempArticle.authorName || '-'}
                                            </td>
                                        </tr>
                                        {/*STATUS*/}
                                        <tr>
                                            <td>
                                                <img src="/assets/images/status.svg"
                                                     alt="writer"
                                                     width="20px"
                                                     className="vertical-align-baseline pr-2"/>
                                                <GSTrans t="component.discount.tbl.status"/>
                                            </td>
                                            <td className="pl-3 text-gray">
                                                {props.mode === BlogArticleEnum.MODE.CREATE? '-':i18next.t('page.storeFront.blog.management.filter.status.' + stArticle.status.toLowerCase())}
                                            </td>
                                        </tr>
                                        {/*CREATED DATE*/}
                                        <tr>
                                            <td>
                                                <img src="/assets/images/created-date.svg"
                                                     alt="writer"
                                                     width="20px"
                                                     className="vertical-align-baseline pr-2"/>
                                                <GSTrans t="component.review_product.list.table.created_date"/>
                                            </td>
                                            <td className="pl-3 text-gray">
                                                {props.mode  === BlogArticleEnum.MODE.CREATE? '-':moment(stArticle.createdDate).format('HH:mm DD-MM-YYYY')}
                                            </td>
                                        </tr>
                                        {/*LAST MODIFIED DATE*/}
                                        <tr>
                                            <td>
                                                <img src="/assets/images/last-modified.svg"
                                                     alt="writer"
                                                     width="20px"
                                                     className="vertical-align-baseline pr-2"/>
                                                <GSTrans t="page.storeFront.blog.article.lastModified"/>
                                            </td>
                                            <td className="pl-3 text-gray" key={stArticle.lastModifiedDate}>
                                                {props.mode  === BlogArticleEnum.MODE.CREATE? '-':moment(stArticle.lastModifiedDate).format('HH:mm DD-MM-YYYY')}
                                            </td>
                                        </tr>
                                    </table>
                                </GSWidgetContent>
                            </GSWidget>
                        </section>
                    </section>
                </AvForm>
            </GSContentBody>
        </GSContentContainer>
    );
};

BlogArticleFormEditor.propTypes = {
    mode: PropTypes.oneOf(Object.entries(BlogArticleEnum.MODE)),
    articleId: PropTypes.number,
};

export default withRouter(BlogArticleFormEditor);

export function FeatureText({ value }) {
    return (
        <div className="blog-article-form-editor__featured-text">
            <AvFieldCountable name="featuredText"
                type="textarea"
                label={i18next.t('page.storeFront.blog.article.featuredText')}
                maxLength="168"
                minLength="0"
                isRequired={false}
                validate={{...FormValidate.maxLength(168)}}
                value={value}
                className="pr-5"
            />
        </div>
    );
}

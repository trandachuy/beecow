import {AvField, AvForm} from 'availity-reactstrap-validation';
import i18next from 'i18next';
import React, {useEffect, useRef, useState} from 'react';
import {withRouter} from 'react-router-dom/cjs/react-router-dom.min';
import GSContentBody from '../../../../components/layout/contentBody/GSContentBody';
import GSContentContainer from '../../../../components/layout/contentContainer/GSContentContainer';
import GSContentHeaderRightEl
  from '../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl';
import GSContentHeader from '../../../../components/layout/contentHeader/GSContentHeader';
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation';
import AvFieldCountable from '../../../../components/shared/form/CountableAvField/AvFieldCountable';
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget';
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent';
import GSButton from '../../../../components/shared/GSButton/GSButton';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import {FormValidate} from '../../../../config/form-validate';
import beehiveService from '../../../../services/BeehiveService';
import {GSToast} from '../../../../utils/gs-toast';
import {RouteUtils} from '../../../../utils/route';
import SEOEditor from '../../../seo/SEOEditor';
import './BlogCategoryEditor.sass';
import {BlogCategoryEditorEnum} from './BlogCategoryEditorEnum';
import BlogCategoryTranslateModal from "../BlogCategoryTranslateModal/BlogCategoryTranslateModal";
import storageService from '../../../../services/storage'
import Constants from '../../../../config/Constant'
import HocSEOEditor from '../../../seo/hoc/HocSEOEditor'
import {ItemUtils} from '../../../../utils/item-utils'

const BlogCategoryEditor = props => {

  const btnSubmit = useRef(null);

  const [stOnFormChanged, setStOnFormChanged] = useState(false);

  const [blogCategory, setBlogCategory] = useState({
    id: undefined,
    title: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoUrl: '',
    deleted: false,
  });

  const [blankInput, setBlankInput] = useState(true);

  const refSEOUrl = useRef()

  useEffect(_ => {
    if (BlogCategoryEditorEnum.MODE.EDIT === props.mode) {
      beehiveService.getBlogCategoryById(props.categoryId)
        .then(data => {
          setBlogCategory(data);
          setBlankInput(false);
        })
        .catch(_ => { GSToast.commonError() });
    }
  }, []);

  const onClickSave = () => {
    btnSubmit.current.click();
  }

  const onValidSubmit = async (_, values) => {
    const isSEOUrlValidRes = refSEOUrl.current && await refSEOUrl.current.isValid()

    if (!isSEOUrlValidRes) {
      return
    }

    const requestBody = { ...blogCategory, ...values };
    requestBody.seoUrl = requestBody.seoUrl ? ItemUtils.changeNameToLink(requestBody.seoUrl) : undefined
    if (BlogCategoryEditorEnum.MODE.CREATE === props.mode) {
      beehiveService.createBlogCategory(requestBody)
        .then(_ => {
          setStOnFormChanged(false);
          RouteUtils.redirectWithoutReload(props, NAV_PATH.blogCategoryManagement);
          GSToast.commonCreate();
        })
        .catch(_ => { GSToast.commonError() });
    }
    else if (BlogCategoryEditorEnum.MODE.EDIT === props.mode) {
      beehiveService.updateBlogCategory(requestBody)
        .then(_ => { GSToast.commonUpdate() })
        .catch(_ => { GSToast.commonError() });
    }
  }

  const onClickCancel = () => {
    RouteUtils.redirectWithoutReload(props, NAV_PATH.blogCategoryManagement)
  }

  const onTitleChange = (e) => {
    const title = e.target.value

    setBlankInput(!title);
    setBlogCategory(blog => ({...blog, title}))
  }

  const setOnFormChange = () => {
    if (!stOnFormChanged) {
      setStOnFormChanged(true);
    }
  }

  return (
    <GSContentContainer confirmWhenRedirect confirmWhen={stOnFormChanged}>
      <GSContentHeader title={BlogCategoryEditorEnum.MODE.CREATE === props.mode
        ? i18next.t("page.storeFront.blog.category.create")
        : i18next.t("page.storeFront.blog.category.edit")}

        backLinkTo={NAV_PATH.blogCategoryManagement}
        backLinkText={i18next.t("page.storeFront.blog.category.management")}>
        <GSContentHeaderRightEl className="d-flex">
          {props.mode === BlogCategoryEditorEnum.MODE.EDIT &&
            <BlogCategoryTranslateModal
              categoryId={blogCategory.id}
            />
          }

          <GSButton success disabled={blankInput} onClick={onClickSave}>
            <GSTrans t={"common.btn.save"} />
          </GSButton>
          <GSButton secondary outline marginLeft disabled={blankInput} onClick={onClickCancel}>
            <GSTrans t={"common.btn.cancel"} />
          </GSButton>
        </GSContentHeaderRightEl>
      </GSContentHeader>

      <GSContentBody size={GSContentBody.size.LARGE}>
        <AvForm onValidSubmit={onValidSubmit} autocomplete="off" onChange={setOnFormChange}>
          <button hidden ref={btnSubmit}>submit</button>
          <GSWidget>
            <GSWidgetContent>
              <AvField
                name="title"
                label={i18next.t('page.storeFront.blog.category.formEditor.categoryName')}
                validate={{ ...FormValidate.maxLength(50), ...FormValidate.required() }}
                value={blogCategory.title}
                onChange={onTitleChange}
              />

              <AvFieldCountable className="blog-category-form-editor__description-text"
                name="description"
                label={i18next.t('page.storeFront.blog.category.formEditor.description')}
                validate={{ ...FormValidate.maxLength(200) }}
                type="textarea"
                maxLength="200"
                minLength="0"
                isRequired={false}
                value={blogCategory.description}
              />
            </GSWidgetContent>
          </GSWidget>
          <HocSEOEditor ref={ refSEOUrl }
                        langKey={ storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE) }
                        type={ Constants.SEO_DATA_TYPE.BLOG }
                        data={ blogCategory.id }>
            <SEOEditor
                key={ blogCategory.seoTitle + blogCategory.seoDescription + blogCategory.seoKeywords + blogCategory.seoUrl }
                defaultValue={ {
                  seoTitle: blogCategory.seoTitle || '',
                  seoDescription: blogCategory.seoDescription || '',
                  seoKeywords: blogCategory.seoKeywords || '',
                  seoUrl: blogCategory.seoUrl || ''
                } }
                prefix="blog/"
                middleSlug={ ItemUtils.changeNameToLink(blogCategory.title || '') }
                postfix={ (props.mode === BlogCategoryEditorEnum.MODE.EDIT ? `-ct${ blogCategory.id }` : '') }
                assignDefaultValue={ false }
                enableLetterOrNumberOrHyphen={ false }
            />
          </HocSEOEditor>
        </AvForm>
      </GSContentBody>
    </GSContentContainer>
  );
}

export default withRouter(BlogCategoryEditor);

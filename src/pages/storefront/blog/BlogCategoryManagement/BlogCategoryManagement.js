import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import i18next from 'i18next';
import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
import GSContentBody from '../../../../components/layout/contentBody/GSContentBody';
import GSContentContainer from '../../../../components/layout/contentContainer/GSContentContainer';
import GSContentHeaderRightEl from '../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl';
import GSContentHeader from '../../../../components/layout/contentHeader/GSContentHeader';
import { NAV_PATH } from '../../../../components/layout/navigation/Navigation';
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget';
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent';
import GSAlertModal, { GSAlertModalType } from '../../../../components/shared/GSAlertModal/GSAlertModal';
import GSButton from '../../../../components/shared/GSButton/GSButton';
import GSPagination from '../../../../components/shared/GSPagination/GSPagination';
import GSTable from '../../../../components/shared/GSTable/GSTable';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import beehiveService from "../../../../services/BeehiveService";
import { CredentialUtils } from '../../../../utils/credential';
import { GSToast } from '../../../../utils/gs-toast';
import { RouteUtils } from '../../../../utils/route';
import { StringUtils } from '../../../../utils/string';
import "./BlogCategoryManagement.sass";

const SIZE_PER_PAGE = 20;
const BlogCategoryManagement = props => {

  const [categories, setCategories] = useState([]);
  const confirmDeleteModal = useRef(null);
  const [pagination, setPagination] = useState({
    totalItem: 0,
    page: 0,
  });

  useEffect(_ => { fetchData() }, [pagination.page]);

  const fetchData = page => {
    beehiveService.getBlogCategoriesOrderByCreatedDesc(page || pagination.page, SIZE_PER_PAGE)
      .then(data => {
        const categories = data.content.map(category => {
          return { id: category.id, title: category.title, description: category.description, seoUrl: category.seoUrl }
        });
        setCategories(categories);
        setPagination({
          totalItem: data.totalElements,
          page: page === undefined ? pagination.page : page,
        })
      })
      .catch(_ => { GSToast.commonError() });
  }

  const createNewBlogCategory = _ => {
    RouteUtils.redirectWithoutReload(props, NAV_PATH.blogCategoryCreate);
  }

  const EmptyBlogCategoryTable = _ => {
    return (
      <tr>
        <td colSpan="100%">
          <div className="empty-blog-catgr-body">
            <img src="/assets/images/icon_empty_blog_category.svg" />
            <h3><GSTrans t={'page.storeFront.blog.category.management.tbl.body.empty'} /></h3>
          </div>
        </td>
      </tr>
    );
  }

  const editCategory = categoryId => {
    RouteUtils.redirectWithoutReload(props, NAV_PATH.blogCategoryEdit + `/${categoryId}`);
  }

  const confirmDeleteCategory = categoryId => {
    beehiveService.deleteBlogCategoryById(categoryId)
      .then(deletedCategory => {
        const newCategories = categories.filter(category => category.id != deletedCategory.id);
        setCategories(newCategories);
        setPagination({ totalItem: pagination.totalItem - 1 });
        GSToast.commonDelete();
      })
      .catch(_ => { GSToast.commonError() });
  }

  const deleteCategory = categoryId => {
    confirmDeleteModal.current.openModal({
      messages: i18next.t("page.storeFront.blog.category.management.delete.confirm.description"),
      modalTitle: i18next.t("page.storeFront.blog.category.management.delete.confirm.title"),
      modalAcceptBtn: i18next.t("common.btn.delete"),
      modalCloseBtn: i18next.t("common.btn.cancel"),
      type: GSAlertModalType.ALERT_TYPE_DANGER,
      acceptCallback: _ => confirmDeleteCategory(categoryId)
    });
  }

  const onChangePage = page => {
    setPagination(_ => ({
      page: page - 1,
    }));
  }

  const BlogCategoryTable = _ => {
    return (
      categories.map(category => {
        return (
          <tr key={category.id}>
            <td className="centered">{category.title}</td>
            <td className="centered">{category.description}</td>
            <td className="centered">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`${CredentialUtils.getStoreFullUrl()}/blog/${category.seoUrl || StringUtils.toSlugs(category.title)}-ct${category.id}`}
              >
                <FontAwesomeIcon icon="eye" className="font-large no-link-deco margin-right-sm" />
              </a>
              <FontAwesomeIcon icon="pen" className="font-large pointer margin-right-sm" onClick={_ => editCategory(category.id)} />
              <FontAwesomeIcon icon="trash-alt" className="font-large pointer" onClick={_ => deleteCategory(category.id)} />
            </td>
          </tr>
        );
      })
    )
  }

  return (
    <GSContentContainer>
      <GSAlertModal ref={confirmDeleteModal} />
      <GSContentHeader title={i18next.t("page.storeFront.blog.category.management")}>
        <GSContentHeaderRightEl>
          <GSButton success onClick={createNewBlogCategory}>
            <GSTrans t={"page.storeFront.blog.category.management.btn.create"} />
          </GSButton>
        </GSContentHeaderRightEl>
      </GSContentHeader>

      <GSContentBody size={GSContentBody.size.EXTRA}>
        <GSWidget>
          <GSWidgetContent>
            <GSTable className="blog-category-table">
              <thead>
                <tr>
                  <th className="centered md-width"><GSTrans t={"page.storeFront.blog.category.management.tbl.header.name"} /></th>
                  <th className="centered"><GSTrans t={"page.storeFront.blog.category.management.tbl.header.description"} /></th>
                  <th className="centered sm-width"><GSTrans t={"page.storeFront.blog.category.management.tbl.header.action"} /></th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? <EmptyBlogCategoryTable /> : <BlogCategoryTable />}
              </tbody>
            </GSTable>

            {pagination.totalItem > SIZE_PER_PAGE &&
              <GSPagination
                totalItem={pagination.totalItem}
                currentPage={pagination.page + 1}
                pageSize={SIZE_PER_PAGE}
                onChangePage={onChangePage}
              />}
          </GSWidgetContent>
        </GSWidget>
      </GSContentBody>
    </GSContentContainer>
  );
}

export default withRouter(BlogCategoryManagement);

import React from 'react';
import {withRouter} from "react-router-dom/cjs/react-router-dom.min";
import BlogCategoryEditor from '../BlogCategoryEditor/BlogCategoryEditor';
import {BlogCategoryEditorEnum} from '../BlogCategoryEditor/BlogCategoryEditorEnum';
import "./BlogCategoryCreate.sass"

const BlogCategoryCreate = () => {
  return (
    <BlogCategoryEditor mode={BlogCategoryEditorEnum.MODE.CREATE} />
  );
}

export default withRouter(BlogCategoryCreate);

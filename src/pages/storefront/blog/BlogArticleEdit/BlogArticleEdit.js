/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/09/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import BlogArticleFormEditor from "../BlogArticleFormEditor/BlogArticleFormEditor";
import {BlogArticleEnum} from "../BlogArticleEnum";

const BlogArticleEdit = props => {

    const {articleId} = props.match.params
    return (
        <BlogArticleFormEditor mode={BlogArticleEnum.MODE.EDIT} articleId={articleId}/>

    );
};

BlogArticleEdit.propTypes = {

};

export default BlogArticleEdit;

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/09/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import BlogArticleFormEditor from "../BlogArticleFormEditor/BlogArticleFormEditor";
import {BlogArticleEnum} from "../BlogArticleEnum";

const BlogArticleCreate = props => {
    return (
        <BlogArticleFormEditor mode={BlogArticleEnum.MODE.CREATE}/>
    );
};

BlogArticleCreate.propTypes = {

};

export default BlogArticleCreate;

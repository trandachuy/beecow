import React from 'react';
import BlogCategoryEditor from '../BlogCategoryEditor/BlogCategoryEditor';
import {BlogCategoryEditorEnum} from '../BlogCategoryEditor/BlogCategoryEditorEnum';

const BlogCategoryEdit = props => {
    const { categoryId } = props.match.params;
    return (
        <BlogCategoryEditor mode={BlogCategoryEditorEnum.MODE.EDIT} categoryId={categoryId} />
    );
}

export default BlogCategoryEdit;

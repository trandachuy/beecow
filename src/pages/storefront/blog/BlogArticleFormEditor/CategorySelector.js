import i18next from 'i18next';
import React, {useEffect, useState} from 'react';
import GSSelect from '../../../../components/shared/form/GSSelect/GSSelect';
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget';
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent';
import GSWidgetHeader from '../../../../components/shared/form/GSWidget/GSWidgetHeader';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import beehiveService from "../../../../services/BeehiveService";
import {BlogArticleEnum} from '../BlogArticleEnum';

const mapCategoryObj = category => {
  return {
    value: category.id,
    label: category.title,
    entity: category
  };
}

const CategorySelector = props => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    props.editorMode === BlogArticleEnum.MODE.EDIT
      ? props.selectedCategories.map(category => mapCategoryObj(category))
      : []);

  const updateSelectedValues = values => {
    props.updateSelectedValues(values);
    setSelectedCategories(values);
  }

  useEffect(() => {
    beehiveService.getBlogCategories()
      .then(data => {
        const categories = data.map(category => {
          return { value: category.id, label: category.title, entity: category }
        });
        setCategories(categories);
      });
  }, []);

  return (
    <GSWidget>
      <GSWidgetHeader>
        <GSTrans t="page.storeFront.blog.category" />
      </GSWidgetHeader>
      <GSWidgetContent>
        <GSSelect options={categories.map(category => { return { value: category.value, label: category.label, entity: category.entity } })}
          isMulti
          noOptionsMessage={i18next.t("component.gs.select.noOptions")}
          placeholder={i18next.t("page.storeFront.blog.category.select.defaultValue")}
          onChange={updateSelectedValues}
          value={selectedCategories}
        />
      </GSWidgetContent>
    </GSWidget>
  );
}

export default CategorySelector;

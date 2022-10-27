import i18next from 'i18next';
import React, {useContext, useEffect, useState} from 'react';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import beehiveService from '../../../../services/BeehiveService';
import {ThemeMakingContext} from '../context/ThemeMakingContext';
import SharedBody from './shared/SharedBody';
import SharedContainer from './shared/SharedContainer';
import "./SubElementBlogCategorySelect.sass";

const defaultCategory = {
    LATEST_ARTICLES: -999999
}

const getDefaultCategory = defaultCategory => {
    const key = Object.keys(defaultCategory)[0];
    const val = Object.values(defaultCategory)[0];
    return [{
        label: i18next.t(`component.themeEditor.subElement.collection.${key}.all`),
        value: val
    }]
}

const SubElementBlogCategorySelect = props => {
    const {state, dispatch} = useContext(ThemeMakingContext.context);

    const [collection, setCollection] = useState(getDefaultCategory(defaultCategory));
    const [toggle, setToggle] = useState(false);

    const {path, value} = props;

    useEffect(_ => {
        beehiveService.getBlogCategories()
            .then(data => {
                const categories = data.map(category => ({label: category.title, value: category.id}))
                setCollection([
                    ...getDefaultCategory(defaultCategory),
                    ...categories]);
            })
    }, []);

    const handleSelectCategory = selectedCategory => {
        if (state.controller.isTranslate) {
            return
        }

        dispatch(ThemeMakingContext.actions.editSubElementReturn({
            path,
            changes: {
                value: selectedCategory.value
            }
        }));
    }

    const handleToggle = _ => {
        setToggle(toggle => !toggle);
    }

    const getLabelFromValue = (value) => {
        if (collection.length === 0) {
            return "";
        }

        const objValues = Object.values(collection);
        if (collection.length === 1) {
            return objValues[0].label;
        }

        let objSelected = objValues.find(category => category.value === value);
        if (objSelected === undefined) {
            objSelected = objValues[0];
        }
        return objSelected.label;
    };

    return (
        <div className={state.controller.isTranslate ? 'disabled' : ''}>
            <SharedContainer>
                <SharedBody className="w-100">
                    <Row className="w-100 align-items-center justify-content-start">
                        <Col md={4}>
                            <span className="category-selector-text-label"><GSTrans t="page.storeFront.blog.category"/></span>
                        </Col>
                        <Col md={8}>
                            <Dropdown className="category-selector" isOpen={toggle} toggle={handleToggle}>
                                <DropdownToggle caret>
                <span className="category-selector__label">
                  {getLabelFromValue(value)}
                </span>
                                </DropdownToggle>
                                <DropdownMenu className="category-selector__dropdown">
                                    {
                                        collection.map(category => (
                                            <DropdownItem
                                                key={category.value}
                                                onClick={_ => handleSelectCategory(category)}
                                            >
                                                <span>{category.label}&nbsp;</span>
                                            </DropdownItem>
                                        ))
                                    }
                                </DropdownMenu>
                            </Dropdown>
                        </Col>
                    </Row>
                </SharedBody>
            </SharedContainer>
        </div>
    );
}

export default SubElementBlogCategorySelect;

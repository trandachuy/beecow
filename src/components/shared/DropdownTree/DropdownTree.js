import React from 'react';
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import "./DropdownTree.sass";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import {Trans} from "react-i18next";
import Constants from "../../../config/Constant";
import tikiService from "../../../services/TikiService";
import LoadingScreen from "../LoadingScreen/LoadingScreen";

export default class DropdownTree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: this.props.categories,
            subCategories: new Map(),
            categoryId: this.props.categoryId,
            data: [],
            dropdownOpen: false,
            categorySlug: [],
            categoryBorderAlert: false,
            onSelectCategory: this.props.onSelectCategory,
            dropdownItemClose: true,
            isTikiChannel: this.props.channel === Constants.SaleChannels.TIKI,
            isFetching: false,
        }
        this.refProdCategory = React.createRef();

        this.onSelect = this.onSelect.bind(this);
        this.reduceArray = this.reduceArray.bind(this);
        this.findCategory = this.findCategory.bind(this);
        this.toggle = this.toggle.bind(this);
        this.formatCategories = this.formatCategories.bind(this);
    }

    componentWillUnmount() {
    }

    componentDidMount() {
        this.init();
    }

    toggle() {
        const cateSlugLng = this.state.categorySlug.length;

        if (this.state.dropdownOpen && this.state.isTikiChannel && cateSlugLng > 0) {
            this.setState({
                categoryBorderAlert: !this.state.categorySlug[cateSlugLng - 1].primary,
                dropdownOpen: false,
            })
            return
        }

        if(cateSlugLng > 0 && this.state.categorySlug[cateSlugLng -1].hasChildren){
            return;
        }
        if(!this.state.dropdownItemClose && !this.state.dropdownOpen){
            this.setState({dropdownOpen: true});
        }
        else if(this.state.dropdownItemClose && this.state.dropdownOpen){
            if(!this.state.categoryId){
                this.setState({categoryBorderAlert : true});
            }else{
                this.setState({categoryBorderAlert : false});
            }
            this.setState({dropdownOpen: false});
        }
        else if(this.state.dropdownItemClose){
            this.setState({dropdownOpen: true});
        }
        else if(!this.state.dropdownItemClose){
            if(!this.state.categoryId){
                this.setState({categoryBorderAlert : true});
            }else{
                this.setState({categoryBorderAlert : false});
            }
            this.setState({dropdownOpen: false});
        }
    }
    init() {
        //only for tiki, root category id is 2
        const rootCategoryId = this.state.isTikiChannel ? 2 : 0
        const data = this.reduceArray(this.state.categories, rootCategoryId);
        let slug = new Array();
        this.findCategory(data, this.state.categoryId, slug);
        slug.reverse();
        this.setState({ data: data });
        this.setState({ categorySlug: slug });
        const subCates = [{ id: 1, categories: data }];
        this.setState({ subCategories: subCates });
    }

    findCategory(categories, categoryId, slug) {
        categories.some(element => {
            if (element.categoryId !== categoryId) {
                return this.findCate(element, categoryId, false, slug);
            }
            return slug.push(element);
        });
    }

    findCate(element, categoryId, flag, slug) {
        let list = element.categories.slice();
        while (list.length > 0 && !flag) {
            let ele = list.shift();
            if (ele.categoryId === categoryId) {
                slug.push(ele);
                flag = true;
            } else
                flag = this.findCate(ele, categoryId, flag, slug);
        }
        if (flag)
            slug.push(element);
        return flag;
    }

    reduceArray(categories, categoryId) {
        return categories.reduce((pre, current) => {
            if (current.parentId === categoryId) {
                current.categories = this.reduceArray(categories, current.categoryId);
                pre.push(current);
            }
            return pre;
        }, []);
    }

    onSelect(item) {
        if (this.props.disable) {
            return
        }

        let categorySlug = this.state.categorySlug.slice();
        categorySlug.push(item);
        this.setState({ categorySlug: categorySlug });
        this.setState({ dropdownItemClose: false});
        this.setState({ 
            categoryId: item.categoryId,
            categorySlug: categorySlug,
            categoryBorderAlert : false,
            dropdownOpen: false
        });
        this.state.onSelectCategory(item.categoryId);
    }

    onSelectTikiItem(item, tabIndex) {
        if (this.props.disable) {
            return
        }

        let categorySlug = [...this.state.categorySlug];

        categorySlug.splice(tabIndex - 1, categorySlug.length)
        categorySlug.push(item);

        this.setState({
            categoryId: item.categoryId,
            categoryBorderAlert : false,
            dropdownOpen: false,
            dropdownItemClose: false,
            categorySlug: categorySlug
        });
        this.state.onSelectCategory(item.categoryId);
    }

    expandChildren(category, tabIndex) {
        let categorySlug = this.state.categorySlug.slice();
        let subCates = this.state.subCategories.slice();
        subCates.splice(tabIndex, subCates.length - 1);

        //only for tiki, get child categories when select category
        if (this.state.isTikiChannel) {
            if (category.primary) {
                this.state.onSelectCategory(category.categoryId);
            }
            this.setState({isFetching: true})
            tikiService.getCategories({'parent.equals': category.categoryId})
                .then((categories) => {
                    subCates.push({id: tabIndex + 1, categories: this.formatCategories(categories)})
                    this.setState({subCategories: subCates});
                })
                .finally(() => this.setState({isFetching: false}))
        } else {
            subCates.push({id: tabIndex + 1, categories: category.categories})
            this.setState({subCategories: subCates});
        }

        categorySlug.splice(tabIndex - 1, categorySlug.length)
        categorySlug.push(category);
        this.setState({categorySlug : categorySlug});

    }

    formatCategories(categories) {
        return categories.map((category) => ({
            categoryId: category.id,
            categoryName: category.name,
            parentId: category.parent,
            primary: category.primary,
            hasChild: category.hasChild,
            categories: [],
        }))
    }

    getCategorySlug(categorySlug) {
        return categorySlug.map(cate => cate.categoryName).join(" > ");
    }

    render() {
        const categories = this.state.subCategories;
        let self = this;
        return (
            <>
                {this.state.isFetching && <LoadingScreen/>}
                <div ref={this.refProdCategory}
                     className={this.state.categoryBorderAlert && !this.state.categoryId
                         ? 'red-alert__border' :
                         this.props.disable ? 'dropdown-tree--disable' : ''}>
                    <Dropdown isOpen={this.state.dropdownOpen} toggle={() => this.toggle()}>
                        <DropdownToggle>
                            {this.getCategorySlug(this.state.categorySlug)
                                ? <span>{this.getCategorySlug(this.state.categorySlug)}</span>
                                : <span className="category-not__selected">
                                    <Trans i18nKey="page.shopee.product.edit.categoryselect.title">
                                        Select categories
                                </Trans>
                                </span>
                            }
                        </DropdownToggle>
                        <div className="category-menu">
                        {categories.length > 0 && (
                            categories.map((res, index) => {
                                return <DropdownMenu key={res.id} tabIndex={res.id}>{
                                    res.categories.map((category) => {
                                        return category.categories.length > 0 || category.hasChild
                                            ?
                                            (
                                                <div key={category.categoryId} className={self.state.categorySlug[index] ? self.state.categorySlug[index].categoryId === category.categoryId ?'category-color__index' : '': ''}>
                                                <DropdownItem
                                                    toggle={false}
                                                    key={category.categoryId}
                                                    onClick={() => this.expandChildren(category, res.id)}>
                                                    <span style={!category.primary ? {opacity: 0.7} : {}}>
                                                        {category.categoryName}
                                                    </span>
                                                    <FontAwesomeIcon icon="angle-right" className="storefront-view" />
                                                </DropdownItem>
                                            </div>
                                            )
                                            :
                                            <div key={category.categoryId} className={self.state.categorySlug[index] ? self.state.categorySlug[index].categoryId === category.categoryId ?'category-color__index' : '': ''}>
                                                <DropdownItem
                                                    key={category.categoryId}
                                                    onClick={() => this.state.isTikiChannel ? this.onSelectTikiItem(category, res.id) : this.onSelect(category)}>
                                                    <span>{category.categoryName}</span>
                                                </DropdownItem>
                                            </div>
                                    })
                                }
                                </DropdownMenu>
                            })
                        )}
                        </div>
                    </Dropdown>
                </div>
            </>
        );
    }
}

DropdownTree.propTypes = {
    categories: PropTypes.any,
    categoryId: PropTypes.number,
    channel: PropTypes.oneOf([...Object.values(Constants.SaleChannels)]),
    onSelectCategory: PropTypes.any,
    disable: PropTypes.bool,
}

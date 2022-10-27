import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import './FilterStaffZalo.sass'
import GSContentContainer from '../../../../components/layout/contentContainer/GSContentContainer'
import GSContentBody from '../../../../components/layout/contentBody/GSContentBody'
import {UikWidget, UikWidgetContent, UikInput} from '../../../../@uik';
import {AvForm} from "availity-reactstrap-validation";
import GSButton from '../../../../components/shared/GSButton/GSButton';
import i18n from '../../../../config/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AvCheckboxGroup from 'availity-reactstrap-validation/lib/AvCheckboxGroup';
import AvCheckbox from 'availity-reactstrap-validation/lib/AvCheckbox';
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';

const dummy = [{id: 1, name: "Tran Huynh"},
{id: 2, name: "Chi Nguyen"},
{id: 3, name: "Nam Anh"},
{id: 4, name: "Long Ho"},
{id: 5, name: "Phi Vu"}
];

const FilterStaffZalo = (props) => {

    const {holdData, staffs, modal, onFilterStaff, onFilterTags, conversation, tags} = props
    const { header, modelClassName } = {...FilterStaffZalo.defaultProps.modal, ...modal}
    const [stShowFilterStaff, setStShowFilterStaff] = useState(false)
    const [stSearchKeywordStaff, setStSearchKeywordStaff] = useState()
    const [stCheckAllStaff, setStCheckAllStaff] = useState(false)
    const [stCheckUnAssignedStaff, setStCheckUnAssignedStaff] = useState(false)
    const [stStaffList, setStStaffList] = useState([])
    const [stStaffCheckedList, setStStaffCheckedList] = useState([])
    const [stNumberFilter, setStNumberFilter] = useState(0)
    const [stShowResetFilter, setStShowResetFilter] = useState(false)
    const [stShowFilterTags, setStShowFilterTags] = useState(false)
    const [stTagsList, setStTagsList] = useState([]);
    const [stListTagsDefault, setListTagsDefault] = useState([]);
    const [stCheckUnAssignedTags, setStCheckUnAssignedTags] = useState(false);
    const [stTagsCheckedList, setStTagsCheckedList] = useState([]);
    const [stSearchKeywordTag, setStSearchKeywordTag] = useState();
    const [stCheckAllTags, setStCheckAllTags] = useState(false)

    useEffect(() => {
        loadDataListFilter()
    }, [staffs, tags, conversation])

    const onChangeAllStaff = (e) => {
        const {checked} = e.target;
        setStCheckAllStaff(checked)
        if(checked) {
            let staffList = staffs.slice(0);
            const ids = staffList.map(stf => stf.id);
            setStStaffCheckedList(ids);
            setStCheckUnAssignedStaff(true);
        } else {
            setStStaffCheckedList([]);
            setStCheckUnAssignedStaff(false);
        }
    }

    const onChangeAllTags = (e) => {
        const {checked} = e.target;
        setStCheckAllTags(checked)
        if(checked) {
            let tagsList = stTagsList.slice(0);
            const ids = tagsList.map(stf => stf.id);
            setStTagsCheckedList(ids)
            setStCheckUnAssignedTags(true);
        } else {
            setStTagsCheckedList([]);
            setStCheckUnAssignedTags(false);
        }
    }

    const loadDataListFilter = async () => {
        setStStaffList(staffs);
        loadDataListTags(conversation, tags)
    }

    const loadDataListTags = (conversation, tags) => {
        if (conversation){
            let array = []
            let brray = []
            for (const c of conversation) {
                let tag = tags[c.userPage]
                if (tag){
                    array = [...array, tag]
                }
            }
            for(const a of array) {
                brray = brray.concat(a)
            }
            const namesArr = [...new Map(brray.map(b => [JSON.stringify(b), b])).values()]
            setStTagsList(namesArr)
            setListTagsDefault(namesArr)
        }
    }

    const onToogleTagStatus = async () => {
        const isShow = stShowResetFilter || stShowFilterStaff
        setStShowResetFilter(!isShow)
        setStShowFilterStaff(false)
        setStShowFilterTags(false)
    }

    const onHandleBack = async () => {
        setStShowResetFilter(true)
        setStShowFilterStaff(false)
        setStShowFilterTags(false)
    }
    
    const onCloseFilter = async () => {
        setStShowResetFilter(false)
        setStShowFilterStaff(false)
        setStShowFilterTags(false)
    }

    const handleValidSubmit = (e, value) => {
    }

    const handleValidSubmitFilterTags = (e, value) => {
    }

    const onClickApplyStaff = (e) => {
        const oFilter = {staffs: stStaffCheckedList, unassigned: stCheckUnAssignedStaff, holdData};
        onFilterStaff(oFilter)
        onCloseFilter();
        countFilter();

    }

    const onClickApplyTags = (e) => {
        const oFilter = {tags: stTagsCheckedList, untagged: stCheckUnAssignedTags, holdData};
        onFilterTags(oFilter)
        onCloseFilter();
        countFilter();
    }

    const onSeachChangeStaff = (e) => {
        let {value} = e.currentTarget || {value:""};

        value = value.trim();
        setStSearchKeywordStaff(value);
        onLocalSearchStaff(value)
        e.preventDefault()
    }

    const onSeachChangeTag = (e) => {
        let {value} = e.currentTarget || {value:""};

        value = value.trim();
        setStSearchKeywordTag(value);
        onLocalSearchTag(value)
        e.preventDefault()
    }

    const onCheckedStaff = (staff, checked) => {
        const {id} = staff;
        let staffList = stStaffCheckedList.slice(0);
        if(checked === true) {
            staffList.push(id)
        } else {
            const found = staffList.indexOf(id);
            if(found > -1) {
                staffList.splice(found, 1);
            }
        }
        setStStaffCheckedList(staffList);
    }

    const onCheckedTags = (tags, checked) => {
        const {id} = tags;
        let tagsList = stTagsCheckedList.slice(0);
        if(checked) {
            tagsList.push(id)
        } else {
            const found = tagsList.indexOf(id);
            if(found > -1) {
                tagsList.splice(found, 1);
            }
        }
        setStTagsCheckedList(tagsList);
    }

    const onLocalSearchStaff = async (value) => {
        value = value || "";
        if(value.length  === 0) {
            setStStaffList(staffs);    
        }
        value = value.toLowerCase();
        const lstStaff = await staffs.filter(staff => staff.name.toLowerCase().search(value) > -1);
        setStStaffList(lstStaff);
    }

    const onLocalSearchTag = async (value) => {
        value = value || "";
        let tags = stListTagsDefault
        if(value.length === 0) {
            setStTagsList(tags);
        } else {
            value = value.toLowerCase();
            const lstTag = await tags.filter(tags => tags.tagName.toLowerCase().search(value) > -1);
            setStTagsList(lstTag);
        }
    }

    const countFilter = () => {
        let count = 0
        const lstCheckedListStaff = stCheckUnAssignedStaff || stStaffCheckedList.length > 0
        const lstCheckedListTags = stCheckUnAssignedTags || stTagsCheckedList.length > 0
        if (lstCheckedListStaff && lstCheckedListTags){
            count = 2
        } else if (lstCheckedListTags) {
            count = 1
        } else if (lstCheckedListStaff) {
            count = 1
        }
        setStNumberFilter(count);
        return count;
    }

    const filterAllStaff = () => {
        if(stCheckAllStaff) {
            let staffList = staffs.slice(0);
            const ids = staffList.map(stf => stf.id);
            setStStaffCheckedList(ids);
            setStCheckUnAssignedStaff(true);
        } else {
            setStStaffCheckedList([]);
            setStCheckUnAssignedStaff(false);
        }
    }

    const filterAllTags = () => {
        if(stCheckAllTags) {
            let tagsList = stTagsList.slice(0);
            const ids = tagsList.map(stf => stf.id);
            setStTagsCheckedList(ids)
            setStCheckUnAssignedTags(true);
        } else {
            setStTagsCheckedList([]);
            setStCheckUnAssignedTags(false);
        }
    }

    const handleOpenListStaff = async () => {
        setStShowResetFilter(false);
        setStShowFilterStaff(true);
    }

    const handleOpenListTags = async () => {
        setStShowResetFilter(false);
        setStShowFilterTags(true);
    }

    const onReset = async () => {
        setStStaffCheckedList([]);
        setStShowResetFilter(false);
        setStShowFilterStaff(false);
        setStCheckAllStaff(false);
        setStCheckUnAssignedStaff(false);
        setStSearchKeywordStaff("");
        setStTagsCheckedList([]);
        setStCheckAllTags(false);
        setStCheckUnAssignedTags(false);
        setStSearchKeywordTag("");
        setStNumberFilter(0);
        onFilterStaff({staffs: [], unassigned: false})
        onFilterTags({tags: [], untagged: false})
        loadDataListFilter();
    }

    return (
    <>
        <GSContentContainer className="gs-social-filter-staff-container-wrapper">
            <GSContentBody size={GSContentBody.size.MAX}>
                <UikWidget className={"gs-widget"}>
                    <UikWidgetContent>
                        <section className="social-filter-staff-container">
                            <div className="filter-staff-lead" 
                                onClick={onToogleTagStatus}>
                                <i className="more" data-badge={stNumberFilter}/>
                            </div>
                            {stShowResetFilter && <div className="dropdown-menu box_reset d-desktop-block d-mobile-none p-0">
                                <GSWidgetContent>
                                    <div className='box_reset-staff'>
                                        <div className='title-filter-reset'>
                                            <span className={'title-filter'}><GSTrans t="page.livechat.filter.staff.title"/></span>
                                            <span onClick={onReset} className={'title-reset'}><GSTrans t="page.livechat.filter.staff.reset"/></span>
                                        </div>
                                        <div className='title-assigned-staff' onClick={handleOpenListStaff}>
                                            <img className='mr-2' src="/assets/images/icon_customer.png" width={14} height={14}/>
                                            <div className='assigned-staff'>
                                                <p className='m-0'><GSTrans t="page.livechat.filter.staff.assigned"/></p>
                                                <FontAwesomeIcon size="xs" color="gray" className="icon-filter"
                                                                icon="angle-right" />
                                            </div>
                                        </div>
                                        <div className='title-assigned-tags' onClick={handleOpenListTags}>
                                            <img className='mr-2' src="/assets/images/icon_tags.png" width={14} height={14}/>
                                            <div className='assigned-tags'>
                                                <p className='m-0'><GSTrans t="page.livechat.filter.staff.tags"/></p>
                                                <FontAwesomeIcon size="xs" color="gray" className="icon-filter"
                                                                 icon="angle-right" />
                                            </div>
                                        </div>
                                    </div>
                                </GSWidgetContent>
                            </div>}
                            {/*FILLTER STAFF ASSIGNED*/}
                            <div className={`filter-staff-content ${stShowFilterStaff? "active":""}`}>
                                <AvForm onValidSubmit={handleValidSubmit} autoComplete="off"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                    }}>
                                    <section className={`filter-staff-content-section ${modelClassName}`}>
                                        <header className="header-content"
                                            onClick={onHandleBack}>
                                            {i18n.t(header)}
                                        </header>
                                        <main className="body-content">
                                            <div className="row">
                                                <AvCheckboxGroup name={"default-staff"}>
                                                    <AvCheckbox
                                                        customInput
                                                        name={"check-all"}
                                                        checked={stCheckAllStaff}
                                                        onChange={(e) => onChangeAllStaff(e)}
                                                    />
                                                </AvCheckboxGroup>
                                                <div className="search-box">
                                                    <UikInput
                                                        defaultValue={stSearchKeywordStaff}
                                                        onChange={onSeachChangeStaff}
                                                        icon={(
                                                            <FontAwesomeIcon icon="search"/>
                                                        )}
                                                        placeholder={i18n.t("social.zalo.filter.staff.search.hint")}
                                                    />
                                                </div>
                                            </div>
                                            <div className='box-list-assigned'>
                                                <div className="row">
                                                    <AvCheckboxGroup name={"Unassigned-staff"}>
                                                        <AvCheckbox
                                                            customInput
                                                            name={"check-unassigned"}
                                                            checked={stCheckUnAssignedStaff}
                                                            onChange={(e) => {
                                                                const {checked} = e.target;
                                                                setStCheckUnAssignedStaff(checked);
                                                            }}
                                                        />
                                                    </AvCheckboxGroup>
                                                    <div className="staff-name">{i18n.t("social.zalo.filter.staff.unassigned")}</div>
                                                </div>
                                                {stStaffList && stStaffList.map((staff, index) => {
                                                    const {name, id} = staff;
                                                    return (<div key={index} className="row">
                                                        <AvCheckboxGroup name={`${staff}-${id}`}>
                                                            <AvCheckbox
                                                                customInput
                                                                name={`checked-${name}-${id}`}
                                                                checked={stStaffCheckedList.indexOf(id) > -1}
                                                                onChange={(e) => {
                                                                    const {checked} = e.target;
                                                                    onCheckedStaff(staff, checked);
                                                                }}
                                                            />
                                                        </AvCheckboxGroup>
                                                        <div className="staff-name">{name}</div>
                                                    </div>)
                                                })}
                                            </div>
                                        </main>
                                        <footer className="footer-content">
                                            <GSButton size={"small"} secondary outline marginRight onClick={onCloseFilter}>{i18n.t("common.btn.cancel")}</GSButton>
                                            <GSButton size={"small"} success marginRight onClick={onClickApplyStaff}>{i18n.t("common.btn.ok")}</GSButton>
                                        </footer>
                                    </section>
                                </AvForm>
                            </div>

                            {/*FILLTER TAGS ASSIGNED*/}
                            <div className={`filter-tags-content ${stShowFilterTags? "active":""}`}>
                                <AvForm onValidSubmit={handleValidSubmitFilterTags()} autoComplete="off"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                        }}>
                                    <section className={`filter-staff-content-section ${modelClassName}`}>
                                        <header className="header-content"
                                                onClick={onHandleBack}>
                                            {i18n.t("page.livechat.filter.staff.tags")}
                                        </header>
                                        <main className="body-content">
                                            <div className="row">
                                                <AvCheckboxGroup name={"default-tags"}>
                                                    <AvCheckbox
                                                        customInput
                                                        name={"check-all-tags"}
                                                        checked={stCheckAllTags}
                                                        onChange={(e) => onChangeAllTags(e)}
                                                    />
                                                </AvCheckboxGroup>
                                                <div className="search-box">
                                                    <UikInput
                                                        defaultValue={stSearchKeywordTag}
                                                        onChange={onSeachChangeTag}
                                                        icon={(
                                                            <FontAwesomeIcon icon="search"/>
                                                        )}
                                                        placeholder={i18n.t("productList.search.tag.placeholder")}
                                                    />
                                                </div>
                                            </div>
                                            <div className='box-list-assigned'>
                                                <div className="row">
                                                    <AvCheckboxGroup name={"Unassigned-tag"}>
                                                        <AvCheckbox
                                                            customInput
                                                            name={"check-unassigned"}
                                                            checked={stCheckUnAssignedTags}
                                                            onChange={(e) => {
                                                                const {checked} = e.target;
                                                                setStCheckUnAssignedTags(checked);
                                                            }}
                                                        />
                                                    </AvCheckboxGroup>
                                                    <div className="tag-name">{i18n.t("social.zalo.filter.tags.unassigned")}</div>
                                                </div>
                                                {stTagsList && stTagsList.map((tag, index) => {
                                                    return (<div key={index} className="row">
                                                        <AvCheckboxGroup name={`${tag}-${tag.id}`}>
                                                            <AvCheckbox
                                                                customInput
                                                                name={`checked-${tag.name}-${tag.id}`}
                                                                checked={stTagsCheckedList.indexOf(tag.id) > -1}
                                                                onChange={(e) => {
                                                                    const {checked} = e.target;
                                                                    onCheckedTags(tag, checked);
                                                                }}
                                                            />
                                                        </AvCheckboxGroup>
                                                        <div className="tag-name">{tag.tagName}</div>
                                                    </div>)
                                                })}
                                            </div>
                                        </main>
                                        <footer className="footer-content">
                                            <GSButton size={"small"} secondary outline marginRight onClick={onCloseFilter}>{i18n.t("common.btn.cancel")}</GSButton>
                                            <GSButton size={"small"} success marginRight onClick={onClickApplyTags}>{i18n.t("common.btn.ok")}</GSButton>
                                        </footer>
                                    </section>
                                </AvForm>
                            </div>
                        </section>
                    </UikWidgetContent>
                </UikWidget>
            </GSContentBody>
        </GSContentContainer>
    </>
    )
}

FilterStaffZalo.defaultProps = {
    modal: {
        header: "social.facebook.filter.staff.header",
        modelClassName: "",
    },
    staffs: dummy,
    onFilterStaff: (data) => {
    },
    onFilterTags: (data) => {
    }
}

FilterStaffZalo.propTypes = {
    staffs: PropTypes.any,
    tags: PropTypes.any,
    conversation: PropTypes.any,
    onFilterStaff: PropTypes.func,
    onFilterTags: PropTypes.func,
}

export default FilterStaffZalo;

import React, {useContext, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import './FilterStaff.sass';
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {UikInput} from "../../../../@uik";
import i18n from "../../../../config/i18n";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import {AvForm} from "availity-reactstrap-validation";
import AvCheckbox from "availity-reactstrap-validation/lib/AvCheckbox";
import AvCheckboxGroup from "availity-reactstrap-validation/lib/AvCheckboxGroup";
import Constants from "../../../../config/Constant";
import beehiveService from "../../../../services/BeehiveService";

const FilterStaff = (props) => {
    const {holdData, staffs, onFilterStaff, onFilterTags} = props;
    const [stShowFilter, setStShowFilter] = useState(props.isShow);
    const [stShowFilterListStaff, setStShowFilterListStaff] = useState(props.isShow);
    const [stStaffList, setStStaffList] = useState([]);
    const [stCheckUnAssignedStaff, setStCheckUnAssignedStaff] = useState(false);
    const [stStaffCheckedList, setStStaffCheckedList] = useState([]);
    const [stCheckAllStaff, setStCheckAllStaff] = useState(false);
    const [stSearchKeywordStaff, setStSearchKeywordStaff] = useState();
    const [stShowFilterListTags, setStShowFilterListTags] = useState(props.isShow);
    const [stTagsList, setStTagsList] = useState([]);
    const [stListTagsDefault, setListTagsDefault] = useState([]);
    const [stCheckUnAssignedTags, setStCheckUnAssignedTags] = useState(false);
    const [stTagsCheckedList, setStTagsCheckedList] = useState([]);
    const [stCheckAllTags, setStCheckAllTags] = useState(false);
    const [stSearchKeywordTag, setStSearchKeywordTag] = useState();
    const [stNumberFilter, setStNumberFilter] = useState(0);

    useEffect(() => {
        loadDataListFilter()
    }, [staffs, stShowFilterListTags])

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
        loadDataListTags()
    }

    const loadDataListTags = () => {
        beehiveService.getAllFbUserTagByStore()
            .then(result => {
                setStTagsList(result)
                setListTagsDefault(result)
            })
            .catch(e => console.log(e))
    }

    const toggleFilterStaffModal = () => {
        const isOpen = stShowFilter || stShowFilterListStaff;
        setStShowFilter(!isOpen)
        setStShowFilterListStaff(false)
        setStShowFilterListTags(false)
    }

    const handleOpenListStaff = () => {
        const isOpen = !stShowFilterListStaff;
        setStShowFilterListStaff(isOpen)
        setStShowFilter(false)
    }

    const handleOpenListTags = () => {
        const isOpen = !stShowFilterListTags;
        setStShowFilterListTags(isOpen)
        setStShowFilter(false)
    }

    const backToPrevious = () => {
        setStShowFilterListStaff(false)
        setStShowFilterListTags(false)
        setStShowFilter(true)
    }

    const onClickCancel = () => {
        setStShowFilterListStaff(false)
        setStShowFilterListTags(false)
    }

    const onClickSaveFilterStaff = (e) => {
        const oFilter = {staffs: stStaffCheckedList, unassigned: stCheckUnAssignedStaff, holdData};
        onFilterStaff(oFilter)
        onClickCancel();
        countFilter()
    }

    const onClickSaveFilterTags = (e) => {
        const oFilter = {tags: stTagsCheckedList, unassigned: stCheckUnAssignedTags, holdData};
        onFilterTags(oFilter)
        onClickCancel();
        countFilter()
    }

    const onSearchChangeStaff = (e) => {
        let {value} = e.currentTarget || {value:""};
        value = value.trim();
        setStSearchKeywordStaff(value);
        onLocalSearchStaff(value)
        e.preventDefault()
    }

    const onSearchChangeTag = (e) => {
        let {value} = e.currentTarget || {value:""};
        value = value.trim();
        setStSearchKeywordTag(value);
        onLocalSearchTag(value)
        e.preventDefault()
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
        if(value.length  === 0) {
            setStTagsList(tags);
        } else {
            value = value.toLowerCase();
            const lstTag = await tags.filter(tags => tags.tagName.toLowerCase().search(value) > -1);
            setStTagsList(lstTag);
        }
    }

    const onCheckedStaff = (staff, checked) => {
        const {id} = staff;
        let staffList = stStaffCheckedList.slice(0);
        if(checked) {
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

    const onReset = async () => {
        setStStaffCheckedList([]);
        setStCheckAllStaff(false);
        setStCheckUnAssignedStaff(false);
        setStSearchKeywordStaff("");
        setStTagsCheckedList([]);
        setStCheckAllTags(false)
        setStCheckUnAssignedTags(false);
        setStSearchKeywordTag("");
        setStNumberFilter(0);
        setStShowFilter(false);
        onFilterStaff({staffs: [], unassigned: false})
        onFilterTags({tags: [], unassigned: false})
        loadDataListFilter();
    }

    const handleValidSubmitFilterStaff = (e, value) => {
    }

    const handleValidSubmitFilterTags = (e, value) => {
    }

    return (
        <div>
            {stNumberFilter === 0 &&
                <div className='iconSetting position-relative' onClick={toggleFilterStaffModal}>
                    <img src="/assets/images/icon_setting_fb.png"/>
                </div>
            }
            {stNumberFilter > 0 &&
                <div className='iconFilter position-relative' onClick={toggleFilterStaffModal}>
                    <img src="/assets/images/icon_filter_fb.png"/>
                    <p className='total-filter'>
                        {stNumberFilter}
                    </p>
                </div>
            }
            {stShowFilter &&
                /* POPUP FILTER STAFF */
                <div className="dropdown-menu box_reset d-desktop-block d-mobile-none p-0">
                    <GSWidgetContent>
                        <div className='box_reset'>
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

            {stShowFilterListStaff &&
                /* POPUP LIST FILTER STAFF */
                <div className="dropdown-menu box_list-filter d-desktop-block d-mobile-none p-0">
                    <AvForm onValidSubmit={handleValidSubmitFilterStaff} autoComplete="off"
                            style={{
                                width: "100%",
                                height: "100%",
                            }}>
                        <GSWidgetContent>
                            <div className='box_list-staff'>
                                <div className='title-list'>
                                    <img src="/assets/images/icon-arrow-back.png" onClick={backToPrevious} className={'cursor--pointer'}/>
                                    <GSTrans t="page.livechat.filter.staff.assigned"/>
                                </div>
                                {/*SEARCH*/}
                                <div className="search-filter-staff">
                                    <div className='check-all'>
                                        <AvCheckboxGroup name={"default-staff"}>
                                            <AvCheckbox
                                                customInput
                                                name={"check-all-staff"}
                                                checked={stCheckAllStaff}
                                                onChange={(e) => { onChangeAllStaff(e)}}
                                            />
                                        </AvCheckboxGroup>
                                    </div>
                                    <UikInput
                                        defaultValue={stSearchKeywordStaff}
                                        onChange={onSearchChangeStaff}
                                        icon={(
                                            <FontAwesomeIcon icon="search"/>
                                        )}
                                        placeholder={i18n.t("productList.search.staff.placeholder")}
                                    />
                                </div>
                                <div className='box-staff'>
                                    <div className='staff-row'>
                                        <AvCheckboxGroup name={"Unassigned"}>
                                            <AvCheckbox
                                                customInput
                                                name={"check-unassigned"}
                                                checked={stCheckUnAssignedStaff}
                                                onChange={(e) => {
                                                    const {checked} = e.target;
                                                    setStCheckUnAssignedStaff(checked)
                                                }}
                                            />
                                        </AvCheckboxGroup>
                                        <div className="staff-name">{i18n.t("social.zalo.filter.staff.unassigned")}</div>
                                    </div>
                                    {stStaffList && stStaffList.map((staff, index) => {
                                        const {name, id} = staff;
                                        return (
                                            <div className='staff-row' key={staff.id}>
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
                                            </div>
                                        )
                                    })}

                                </div>
                                <div className='box_button-filter'>
                                    <GSButton className='mr-1' onClick={onClickCancel}>
                                        <Trans i18nKey="common.btn.cancel" className="sr-only">
                                            Cancel
                                        </Trans>
                                    </GSButton>
                                    <GSButton className='mr-2' success onClick={onClickSaveFilterStaff}>
                                        <Trans i18nKey="common.btn.save" className="sr-only">
                                            Save
                                        </Trans>
                                    </GSButton>
                                </div>
                            </div>
                        </GSWidgetContent>
                    </AvForm>
                </div>}

            {stShowFilterListTags &&
            /* POPUP LIST FILTER TAGS */
            <div className="dropdown-menu box_list-filter d-desktop-block d-mobile-none p-0">
                <AvForm onValidSubmit={handleValidSubmitFilterTags()} autoComplete="off"
                        style={{
                            width: "100%",
                            height: "100%",
                        }}>
                    <GSWidgetContent>
                        <div className='box_list-staff'>
                            <div className='title-list'>
                                <img src="/assets/images/icon-arrow-back.png" onClick={backToPrevious} className={'cursor--pointer'}/>
                                <GSTrans t="page.livechat.filter.staff.tags"/>
                            </div>

                            {/*SEARCH*/}
                            <div className="search-filter-staff">
                                <div className='check-all'>
                                    <AvCheckboxGroup name={"default-tags"}>
                                        <AvCheckbox
                                            customInput
                                            name={"check-all-tags"}
                                            checked={stCheckAllTags}
                                            onChange={(e) => { onChangeAllTags(e)}}
                                        />
                                    </AvCheckboxGroup>
                                </div>
                                <UikInput
                                    defaultValue={stSearchKeywordTag}
                                    maxLength={30}
                                    onChange={onSearchChangeTag}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18n.t("productList.search.tag.placeholder")}
                                />
                            </div>
                            <div className='box-staff'>
                                <div className='staff-row'>
                                    <AvCheckboxGroup name={"Unassigned"}>
                                        <AvCheckbox
                                            customInput
                                            name={"check-unassigned"}
                                            checked={stCheckUnAssignedTags}
                                            onChange={(e) => {
                                                const {checked} = e.target;
                                                setStCheckUnAssignedTags(checked)
                                            }}
                                        />
                                    </AvCheckboxGroup>
                                    <div className="staff-name">{i18n.t("social.zalo.filter.tags.unassigned")}</div>
                                </div>
                                {stTagsList && stTagsList.map((tag, index) => {
                                    return (
                                        <div className='staff-row' key={index.id}>
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

                                            <div className="staff-name">{tag.tagName}</div>
                                        </div>
                                    )
                                })}

                            </div>
                            <div className='box_button-filter'>
                                <GSButton className='mr-1' onClick={onClickCancel}>
                                    <Trans i18nKey="common.btn.cancel" className="sr-only">
                                        Cancel
                                    </Trans>
                                </GSButton>
                                <GSButton className='mr-2' success onClick={onClickSaveFilterTags}>
                                    <Trans i18nKey="common.btn.save" className="sr-only">
                                        Save
                                    </Trans>
                                </GSButton>
                            </div>
                        </div>
                    </GSWidgetContent>
                </AvForm>
            </div>}
        </div>
    )
}


FilterStaff.defaultProps = {
    onFilterStaff: (data) => {
    },
    onFilterTags: (data) => {
    }
}

FilterStaff.propTypes = {
    staffs: PropTypes.any,
    onFilterStaff: PropTypes.func,
    onFilterTags: PropTypes.func,
}

export default FilterStaff;

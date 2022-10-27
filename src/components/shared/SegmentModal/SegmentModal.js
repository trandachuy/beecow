import React, {useEffect, useState} from 'react';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import {UikInput} from '../../../@uik'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index";
import './SegmentModal.sass'
import {Trans} from "react-i18next";
import {AvForm, AvRadio, AvRadioGroup} from 'availity-reactstrap-validation';
import i18next from "i18next";
import GSButton from "../GSButton/GSButton";
import beehiveService from "../../../services/BeehiveService";
import {NumberUtils} from '../../../utils/number-format';

const SegmentModal = (props) => {
    const SIZE_PER_PAGE = 10;
    const ON_INPUT_DELAY = 500;

    const [segments, setSegmentsList] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [selectedSegmentIndices, setSelectedSegmentIndices] = useState(props.selectedSegments);
    const [selectedItem, setSelectedItem] = useState(props.selectedSegment);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState();
    const [totalPage, setTotalPage] = useState(0);
    const [isOpen, setIsOpen] = useState(true);
    const [selectedItemDefault, setSelectedItemDefault] = useState(props.selectedSegment);
    
    useEffect(() => {
        if(segments.length === 0){
            fetchDataOfDashboard({page: 0, size: SIZE_PER_PAGE, "name.contains": searchKeyword});
        }
    },[searchKeyword])

    const onInputSearch = (event) => {
        const keyword = event.currentTarget.value
        if (this.stoSearch) clearTimeout(this.stoSearch)
        this.stoSearch = setTimeout(() => {
            this.scrolled = true;
            setIsFetching(true);
            setSegmentsList([])
            setCurrentPage(-1);
            setSearchKeyword(keyword);
        }, ON_INPUT_DELAY)
    }

    const onChangeListPage = () => {
        let page = currentPage + 1;
        setCurrentPage(page);
        fetchDataOfDashboard({page: page, size: SIZE_PER_PAGE, "name.contains": searchKeyword});
    }

    const onClose = (selectType) => {
        if (selectType === 'cancel' && props.onClose) {
            props.onClose();
        }
    }

    const fetchDataOfDashboard = (params) => {
        beehiveService.getListSegmentWithKeyword(params).then((res) => {
            const totalItem = parseInt(res.headers['x-total-count']);
            if (res.data.length !== 0) {
                setSegmentsList([...segments, ...res.data]);
                setCurrentPage(params.page);
                setTotalPage(Math.ceil(totalItem / SIZE_PER_PAGE) - 1) 
            }
            setIsFetching(false);
            this.scrolled = false;
            this.stoSearch = false;
        })
    }

    const onFormChange = (event) => {
        event.persist();
        const segment = segments.find(seg => seg.id === parseInt(event.target.value));
        if(segment){
            setSelectedItem(segment);
            setSelectedItemDefault(null);
        }
    }
    const isSegmentSelected = (segment) => {
        return selectedSegmentIndices.find(id => id === segment.id) ? true : false;
    }
    const onScroll = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if(!this.scrolled){
            if(isBottom(event.currentTarget) && currentPage < totalPage){
                setIsFetching(true);
                this.scrolled = true;
                event.currentTarget.classList.add('scroll-y-invisible');  
                this.timeOut = setTimeout( () => {
                    onChangeListPage()
                    }, 1500)   
            }  
        }
    }

    const isBottom = (el) =>{
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }
    const renderUserCount = (userCount) => {
        return NumberUtils.formatThousand(userCount) + (userCount > 1 ? ' users' : ' user');
    }
    const onSubmit = (event, values) =>{
        event.preventDefault();
        if(segments.length === 0){
            window.open(window.location.origin + "/customers/segments/create", "_blank")
            return
        }
        if (props.onSubmit) {
            props.onSubmit(selectedItem)
        }
    }
    const renderRadio = (segment, index) =>{
        if(selectedItemDefault && segment.id === selectedItemDefault.id){
           return 
        }
        else{
            const isSelected = isSegmentSelected(segment);
            return (
                <div className={['segments-row', isSelected ? 'disabled' : ''].join(' ')} >
                    <AvRadio customInput key={segment.id + '_' + index}
                        label={segment.name}
                        value={segment.id} disabled={isSelected} />
                    <span className="segment-users">{renderUserCount(segment.userCount)}</span>
                </div>
            )
        }
    }
    return (
        <Modal isOpen={isOpen} className="select-segment-modal">
            <AvForm onValidSubmit={onSubmit} onKeyDown={(e)=> e.keyCode == 13 ? e.preventDefault(): ''}>
                <ModalHeader close={
                    <div className="mobile-header-btn d-mobile-flex d-desktop-none">
                        <i className="btn-close__icon  d-mobile-none d-desktop-inline" onClick={() => onClose('cancel')} />
                        <GSButton submit success marginRight>
                            {segments.length > 0 ? <Trans i18nKey="common.btn.ok" /> : <Trans i18nKey="page.customers.segments.createSegment" />}
                        </GSButton>
                        <GSButton secondary outline onClick={() => onClose('cancel')}>
                            <Trans i18nKey="common.btn.cancel" />
                        </GSButton>
                    </div>}>
                    <Trans i18nKey="page.marketing.discounts.coupons.collection_modal.title" />
                    <i className="btn-close__icon d-mobile-none d-desktop-inline" onClick={() => onClose('cancel')}></i>
                </ModalHeader>
                <ModalBody>
                    <div className="search-group">
                        <span className="search">
                            <UikInput
                                className="search-input"
                                icon={(<FontAwesomeIcon icon={"search"} />)}
                                iconPosition="left"
                                placeholder={i18next.t("page.marketing.discounts.coupons.create.usageLimits.searchCollectionByName")}
                                onChange={onInputSearch} />
                        </span>
                    </div>
                   
                    <AvRadioGroup 
                        name="segmentSelected" className={["segments", isFetching ? "loading": ""].join(' ')} onScroll={onScroll}
                        onChange={onFormChange}
                        defaultValue={selectedItem && selectedItem.id}>
                        {
                            selectedItemDefault && (
                            <div className="segments-row">
                                <AvRadio customInput key={selectedItemDefault.id}
                                    label={selectedItemDefault.name}
                                    value={selectedItemDefault.id}/>
                                <span className="segment-users">{renderUserCount(selectedItemDefault.userCount)}</span>
                            </div>)
                        }
                        {segments.length > 0 && segments.map((segment, index) => {return renderRadio(segment, index);})}
                        {segments.length === 0 && (
                            <div className="empty">
                                <i className="icon-empty"></i><span>{i18next.t("page.customer.segment.haveNoSegment")}</span>
                            </div>)}
                    </AvRadioGroup>
                    <div className="gs-atm__flex-row--flex-end footer-btn d-mobile-none d-desktop-flex">
                        <GSButton secondary outline onClick={() => onClose('cancel')}>
                            <Trans i18nKey="common.btn.cancel" />
                        </GSButton>

                        <GSButton submit success marginLeft>
                            {segments.length > 0 ? <Trans i18nKey="common.btn.ok" /> : <Trans i18nKey="page.customers.segments.createSegment" />}
                        </GSButton>
                    </div>
                </ModalBody>
            </AvForm>
        </Modal>
    );

}

export default SegmentModal;

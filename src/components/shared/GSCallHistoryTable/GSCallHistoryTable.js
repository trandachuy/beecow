import React, {Component} from 'react';
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import i18next from "i18next";
import './GSCallHistoryTable.sass'
import {UikFormInputGroup, UikInput, UikRadio, UikSelect, UikTag} from "../../../@uik";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import DropdownBox from "./SearchDropdown/DropdownBox";
import {GSToast} from "../../../utils/gs-toast";
import callCenterService from "../../../services/CallCenterService";
import {CredentialUtils} from "../../../utils/credential";
import Constants from "../../../config/Constant";
import {DateTimeUtils} from "../../../utils/date-time";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import GSInputDuration from "./input-duration/GSInputDuration";
import Recording from "./Recording/Recording";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {cn} from "../../../utils/class-name";

const tableConfig = {
    headerList: [
        i18next.t("component.callcenter.history.name"),
        i18next.t("component.callcenter.history.phonenumber"),
        i18next.t("component.callcenter.history.type"),
        i18next.t("component.callcenter.history.duration"),
        i18next.t("component.callcenter.history.status"),
        i18next.t("component.callcenter.history.time"),
        i18next.t("component.callcenter.history.recording"),
        i18next.t("component.callcenter.history.callby"),
    ]
};
// const fieldOptions = {
//     duration: 'selectedDuration',
//     status: 'selectedStatus',
//     callBy: 'selectedCallBy'
// }
const statusOptions = [
    {value: 'ALL', label: i18next.t('component.call.history.status.all')},
    {value: 'SUCCESSFUL', label: i18next.t('component.call.history.status.successful'), css: 'successfuly'},
    {value: 'DECLINED', label: i18next.t('component.call.history.status.declined'), css: 'declined'},
    {value: 'NON_SUCCESSFUL', label: i18next.t('component.call.history.status.nonsuccessful'), css: 'non_successfuly'}
];
const durationOptions = [
    {value: 'ALL', label: i18next.t('component.call.history.duration.all')},
    {value: 'equals', label: i18next.t('component.call.history.duration.equals')},
    {value: 'greaterThan', label: i18next.t('component.call.history.duration.greater')},
    {value: 'lessThan', label: i18next.t('component.call.history.duration.less')}
];
const callByOptions = [
    {value: 'ALL', label: i18next.t('component.call.history.callBy.all')},
]
const callHistoryOptions = [
    {value: 'ALL', label:  i18next.t('component.call.history.type.all')},
    {value: 'OUTBOUND', label : i18next.t('component.call.history.type.outbound')},
    {value: 'INBOUND', label : i18next.t('component.call.history.type.inbound')}
];
const labels = {
    minutes: i18next.t("component.callcenter.history.minutes"),
    seconds: i18next.t("component.callcenter.history.seconds"),
}

class GSCallHistoryTable extends Component {
    ON_INPUT_DELAY = 500;

    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1,
            isOpenStaff: false,
            isOpenStatus: false,
            isOpenDuration: false,

            searchFilter: '',
            selectedStatus: 'ALL',
            selectedDuration: 'ALL',
            duration: -1,
            selectedCallBy: 'ALL',
            selectedCallHistory: 'ALL',

            filterCount: 0,

            
            totalPage: 0,
            callByList: callByOptions,
            
            data: [],
            showProgress: true,
            audios: [],

            // for mobile
            isFilterMobileShow: false,
            isFilterDesktopShow: false
        }
        this.fetchCallHistory = this.fetchCallHistory.bind(this);
        this.onKeyPressFilterSearch = this.onKeyPressFilterSearch.bind(this);
        this.openLoadingScreen = this.openLoadingScreen.bind(this);
        this.reloadPage = this.reloadPage.bind(this);
        this.getLabelForStatus = this.getLabelForStatus.bind(this);
        this.createParamsFilter = this.createParamsFilter.bind(this);
        this.refeshTableByFilter = this.refeshTableByFilter.bind(this);
        this.onChooseFilter = this.onChooseFilter.bind(this);
        this.fetchListCallBy = this.fetchListCallBy.bind(this);
        this.convertDurationToString = this.convertDurationToString.bind(this);
        this.onSelectedDuration = this.onSelectedDuration.bind(this);
        this.onChangePage = this.onChangePage.bind(this);
        this.pushRecordingList = this.pushRecordingList.bind(this);
        this.setCurrentPlay = this.setCurrentPlay.bind(this);
        this.toggleFilterDesktopModal = this.toggleFilterDesktopModal.bind(this);
        this.toggleFilterMobileModal = this.toggleFilterMobileModal.bind(this);       
        this.doneSearchPanel = this.doneSearchPanel.bind(this); 
    }

    componentDidMount() {
        if (this.props.defaultFilterSearch) {
            this.fetchCallHistory(this.props.defaultFilterSearch, Constants.SIZE_PER_PAGE, 1)
        } else {
            this.fetchCallHistory({}, Constants.SIZE_PER_PAGE, 1);
        }
        if (this.props.optionSearch) {
            this.fetchListCallBy();
        }
    }

    onSelectedDuration(duration) {
        this.setState({
            duration: duration
        }, () => {
            if ((this.state.selectedDuration && this.state.selectedDuration.value != '' && this.state.duration != -1)) {
                this.refeshTableByFilter(1)
            }
        })
    }

    fetchListCallBy() {
        callCenterService.getListCallBy()
            .then(res => {
                this.setState({
                    callByList: [...callByOptions, ...res]
                })
            }).catch(() => {
            GSToast.commonError();
        })
    }

    openLoadingScreen() {
        this.setState({
            isFetching: true
        })
    }

    getLabelForStatus(value) {
        let status = statusOptions.find(status => status.value === value);
        return status;
    }

    fetchCallHistory(params, size, page) {
        this.openLoadingScreen();
        let query = {
            ...{
                "storeId.equals": CredentialUtils.getStoreId(),
                page: page - 1,
                size: size,
                sort: 'timeStarted,desc'
            }, ...params
        }
        if (this.props.defaultFilterSearch) {
            query = {...query, ...this.props.defaultFilterSearch}
        }
        callCenterService.getCallCenterHistories(query)
            .then(res => {
                const totalItem = parseInt(res.headers['x-total-count']);
                this.setState(state => ({
                    ...state,
                    data: res.data,
                    totalPage: Math.ceil(totalItem / Constants.SIZE_PER_PAGE),
                    isFetching: false
                }));
            }).catch((e) => {
            GSToast.commonError();
        })
    }

    get outReloadPageCallBack() {
        this.reloadPage();
    }

    reloadPage() {
        let PAGE = (this.state.data.length === 1) ? (this.state.currentPage === 1 ? 1 : (this.state.currentPage - 1)) : this.state.currentPage;
        this.refeshTableByFilter(PAGE)
    }

    createParamsFilter() {
        let params = {};
        let filter = 0;
        if (this.state.searchFilter && this.state.searchFilter != '') {
            params['searchFilter.contains'] = this.state.searchFilter;
        }
        if (this.state.selectedCallBy && this.state.selectedCallBy != 'ALL') {
            params['callById.equals'] = this.state.selectedCallBy;
            filter++;
        }
        if (this.state.selectedStatus && this.state.selectedStatus != 'ALL') {
            params['status.equals'] = this.state.selectedStatus;
            filter++;
        }
        if (this.state.selectedCallHistory && this.state.selectedCallHistory != 'ALL') {
            params['type.equals'] = this.state.selectedCallHistory;
            filter++;
        }
        if (this.state.duration != -1 && this.state.selectedDuration != 'ALL') {
            params[`duration.${this.state.selectedDuration}`] = this.state.duration;
            filter++;
        }
        
        this.setState({filterCount: filter})
        return params;
    }

    onChangePage(page) {
        this.setState({
            currentPage: page
        }, () => {
            this.reloadPage();
        })
    }

    refeshTableByFilter(page) {
        this.fetchCallHistory(this.createParamsFilter(), Constants.SIZE_PER_PAGE, page);
    }

    onKeyPressFilterSearch(event) {
        let value = event.currentTarget.value;
        if (value != '' || value != undefined) {
            if (this.stoSearch) clearTimeout(this.stoSearch)
            this.stoSearch = setTimeout(() => {
                this.setState({
                    searchFilter: value
                }, () => {
                    this.refeshTableByFilter(1)
                })
            }, this.ON_INPUT_DELAY)
        } else {
            this.setState({
                searchFilter: ''
            })
        }
    }

    onChooseFilter(field, obj) {
        // this.setState({
        //     [field]: obj
        // }, () => {
        //     if (field === fieldOptions.status || field === fieldOptions.callBy || ((field === fieldOptions.duration && this.state.duration != -1) || this.state.selectedDuration.key == '')) {
        //         this.refeshTableByFilter(1)
        //     }
        // })
    }

    convertDurationToString(duration) {
        if (duration) {
            let value = '';
            let minute = Math.floor(duration / 60);
            let second = duration % 60;
            if (minute != 0) {
                value = value.concat(`${minute} ${labels.minutes}`);
            }
            if (second) {
                if (minute != 0) {
                    value = value.concat(', ')
                }
                value = value.concat(`${second} ${labels.seconds}`);
            }
            return value;
        }
        return '-';
    }

    pushRecordingList(ref) {
        if (ref) {
            let arr = this.state.audios;
            arr.push(ref)
            this.setState({
                audios: arr
            })
        }
    }

    setCurrentPlay(audio) {
        let arr = this.state.audios;
        arr.forEach(value => {
            if (value.audio !== audio) {
                value.audio.pause();
                value.changeIcon();
            }
        })
    }

    changeCallBy(data){
        this.setState({
            selectedCallBy: data
        });
    }

    changeStatus(data){
        this.setState({
            selectedStatus: data
        });
    }

    changeDuration(data){
        this.setState({
            selectedDuration: data
        });
    }

    changeCallHistory(data){
        this.setState({
            selectedCallHistory: data
        });
    }

    doneSearchPanel(){
        this.refeshTableByFilter(1)
        if (this.state.isFilterMobileShow) {
            this.toggleFilterMobileModal();
        } else {
            this.toggleFilterDesktopModal(false);

        }
    }

    toggleFilterDesktopModal(reset = true){
        if (!this.state.isFilterDesktopShow) { // preparing for open
            this.setState(state => ({
                filterPaneCache: {
                    channel: this.state.channel,
                    platform: this.state.platform,
                    status: this.state.status,
                    branchIds: this.state.branchIds,
                    shopeeAccount: this.state.shopeeAccount
                },
                isFilterDesktopShow: true
            }))
        } else { // => close
            this.setState(state => ({
                isFilterDesktopShow: false
            }))
            if (reset) {
                this.onChangeFilterChannel(this.state.filterPaneCache.channel)
                this.onChangeFilterPlatform(this.state.filterPaneCache.platform)
                this.onChangeFilterStatus(this.state.filterPaneCache.status)
                this.onChangeFilterByBranch(this.state.filterPaneCache.branchIds)
                this.onChangeFilterByShopeeAccount(this.state.filterPaneCache.shopeeAccount)
            }
        }
    }

    // for mobile filter
    toggleFilterMobileModal(){
        this.setState(state => ({
            isFilterMobileShow: !state.isFilterMobileShow
            })
        )
    }

    render() {
        return (
            <>
                <section className={'top-search ' + (this.state.isFetching ? 'gs-atm--disable' : '')}>
                        <span className='search gs-search-box__wrapper' hidden={!this.props.filterSearch}>
                                    <UikInput
                                        className="search-input"
                                        icon={(
                                            <FontAwesomeIcon icon={"search"}/>
                                        )}
                                        iconPosition="left"
                                        placeholder={i18next.t("component.callcenter.history.search")}
                                        onChange={this.onKeyPressFilterSearch}
                                    />
                                </span>
                    <section className='group-combobox' hidden={!this.props.optionSearch}>
                        {/* <DropdownBox
                            items={this.state.callByList}
                            onSelected={this.onChooseFilter}
                            field={fieldOptions.callBy}
                        /> */}
                        {/* <DropdownBox
                            items={statusOptions}
                            onSelected={this.onChooseFilter}
                            field={fieldOptions.status}
                        />
                        <DropdownBox
                            items={durationOptions}
                            onSelected={this.onChooseFilter}
                            field={fieldOptions.duration}
                        /> */}


































                        {/*FILTER PANE*/}
                        <div className="position-relative  ml-2">
                                        <div className="btn-filter-desk" onClick={this.toggleFilterDesktopModal}>
                                            <span>
                                            <GSTrans t="productList.filter.header.title"/>
                                                {' '}
                                                (
                                                {this.state.filterCount}
                                                )
                                            </span>
                                            <FontAwesomeIcon size="xs" color="gray" className="icon-filter" icon="filter"/>
                                        </div>

                                        {this.state.isFilterDesktopShow &&
                                        <div className="dropdown-menu dropdown-menu-right order-page__filter-pane"
                                              style={{display: 'block', top: '40px'}}
                                             // onBlur={this.toggleFilterDesktopModal}
                                        >
                                            {/*CALL BY*/}
                                            <div className="row order-page__filter-section">
                                                <div className="col-12 col-md-3 order-page__filter-title">
                                                    <GSTrans t={"component.callcenter.history.callby"}/>
                                                </div>
                                                <div className="col-12 col-md-9">
                                                    <UikSelect
                                                        defaultValue={'ALL'}
                                                        options={this.state.callByList}
                                                        onChange={(item) => this.changeCallBy(item.value)}
                                                        position={"bottomRight"}
                                                    />
                                                </div>

                                            </div>

                                            {/*STATUS*/}
                                            <div className="row order-page__filter-section">
                                                <div className="col-12 col-md-3 order-page__filter-title">
                                                    <GSTrans
                                                        t={"component.callcenter.history.status"}/>
                                                </div>
                                                <div className="col-12 col-md-9 d-flex flex-wrap">
                                                    {statusOptions.map(v => {
                                                        return (
                                                            <div key={v.value}
                                                                 className={cn("order-page__filter-option", {"selected": this.state.selectedStatus === v.value})}
                                                                 onClick={() => this.changeStatus(v.value)}>
                                                                {v.label}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            {/*DURATION*/}
                                            <div className="row order-page__filter-section">
                                                <div className="col-12 col-md-3 order-page__filter-title">
                                                    <GSTrans t={"component.callcenter.history.duration"}/>
                                                </div>
                                                <div className="col-12 col-md-9 ">
                                                    <div className="d-flex flex-wrap">
                                                        {durationOptions.map(duration => {
                                                            return (
                                                                <div key={duration.value}
                                                                     className={cn("order-page__filter-option", {"selected": this.state.selectedDuration === duration.value})}
                                                                     onClick={() => this.changeDuration(duration.value)}>
                                                                    {duration.label}
                                                                </div>
                                                            )
                                                        })}
                                                        
                                                    </div>
                                                    <GSInputDuration
                                                            onSelectedDuration={this.onSelectedDuration}
                                                        />
                                                </div>
                                                
                                            </div>

                                            {/*CALL HISTORY*/}
                                            <div className="row order-page__filter-section">
                                                <div className="col-12 col-md-3 order-page__filter-title">
                                                    <GSTrans t={"component.callcenter.history.type"}/>
                                                </div>
                                                <div className="col-12 col-md-9 d-flex flex-wrap">
                                                    {callHistoryOptions.map(v => {
                                                        return (
                                                            <div key={v.value}
                                                                 className={cn("order-page__filter-option", {"selected": this.state.selectedCallHistory === v.value})}
                                                                 onClick={() => this.changeCallHistory(v.value)}>
                                                                {v.label}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            {/*BUTTONS*/}
                                            <div className="row">
                                                <div className="col-12">
                                                    <GSButton success size={"small"} onClick={this.doneSearchPanel}>
                                                        <GSTrans t={"common.btn.done"}/>
                                                    </GSButton>
                                                </div>
                                            </div>
                                        </div>}
                                    </div>



































                        
                    </section>
                </section>
                {this.state.isFetching && <Loading style={LoadingStyle.DUAL_RING_GREY}/>}
                {!this.state.isFetching &&
                <>
                    <PagingTable
                        headers={tableConfig.headerList}
                        totalPage={this.state.totalPage}
                        maxShowedPage={10}
                        currentPage={this.state.currentPage}
                        rowHoverEffect={false}
                        totalItems={this.state.data.length}
                        onChangePage={this.onChangePage}
                        hidePagingEmpty>
                        {this.state.data.map((item, index) => {
                            return (
                                <section key={index + "_" + item.id} className="gs-table-body-items"
                                         data-id={item.id}>
                                    <div className={`gs-table-body-item  name text-wrap`}>
                                        <span className={'text-wrap'}>{item.customerName}</span>
                                    </div>
                                    <div className="gs-table-body-item phone text-wrap">
                                        <span>{item.toNumberPhone}</span>
                                    </div>
                                    <div className="gs-table-body-item type">
                                        <span>{i18next.t(`component.callcenter.history.type.${item.type}`)}</span>
                                    </div>
                                    <div className="gs-table-body-item duration">
                                        <span>{this.convertDurationToString(item.duration)}</span>
                                    </div>
                                    <div className="gs-table-body-item status">
                                        <UikTag fill
                                                className={`toolbar__status--${this.getLabelForStatus(item.status) ? this.getLabelForStatus(item.status).css : ''}`}>
                                            {this.getLabelForStatus(item.status) ? this.getLabelForStatus(item.status).label : ''}
                                        </UikTag>
                                    </div>
                                    <div className="gs-table-body-item time text-wrap">
                                        <p className={'text-black-50'}>
                                            <span>{item.timeStarted && DateTimeUtils.formatHHmma(item.timeStarted)}</span>
                                        </p>
                                        <h6>
                                            <span>{item.timeStarted && DateTimeUtils.formatDDMMYYY(item.timeStarted)}</span>
                                        </h6>
                                    </div>
                                    <div className="gs-table-body-item auditon text-wrap">
                                        {
                                            item.recordingUrl &&
                                            <Recording
                                                key={`${item.id}-${item.duration}`}
                                                src={item.recordingUrl}
                                                ref={this.pushRecordingList}
                                                currentPlay={this.setCurrentPlay}
                                            />
                                        }
                                    </div>
                                    <div className="gs-table-body-item call-by text-wrap">
                                        <span>{item.callBy}</span>
                                    </div>
                                </section>
                            )
                        })
                        }
                    </PagingTable>
                </>
                }
                {!this.state.isFetching &&
                this.state.data.length === 0
                && <div className="empty">
                    <i className="icon-empty"></i><span>{i18next.t("component.call.history.empty")}</span>
                </div>
                }
            </>
        )
    }
}

export default GSCallHistoryTable;

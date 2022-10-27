import React, {Component} from 'react';
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import DropdownAction from "../../../components/shared/DropdownAction/DropdownAction";
import i18next from "i18next";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import Constants from "../../../config/Constant";
import {ThemeService} from "../../../services/ThemeService";
import {CredentialUtils} from "../../../utils/credential";
import './LandingPage.sass';
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {DateTimeUtils} from "../../../utils/date-time";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import GSActionButton, {GSActionButtonIcons} from "../../../components/shared/GSActionButton/GSActionButton";
import {LANDING_PAGE_ENUM} from "../../landing-page/enum/LandingPageEnum";
import {GSToast} from "../../../utils/gs-toast";
import {
    LANDING_PAGE_DOMAIN_OPTIONS,
    LANDING_PAGE_SUB_DOMAIN_OPTIONS
} from "../../landing-page/editor/LandingPageEditor";
import {LANDING_PAGE_SUB_DOMAIN} from "../../landing-page/editor/setting/LandingPageEditorSetting";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import _ from "lodash";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {AgencyService} from '../../../services/AgencyService'

const tableConfig = {
    headerList: [
        // 'check_box_all',
        i18next.t("component.landing.tbl.name"),
        i18next.t("component.landing.tbl.status"),
        i18next.t("component.landing.tbl.lastmodified"),
        i18next.t("component.landing.tbl.actions")
    ]
};
const actionNames = {
    EDIT: 'edit',
    VIEW: 'view',
    PUBLISH: 'publish',
    DRAFT: 'draft',
    DELETE: 'delete',
    CLONE: 'clone',
    CREATE: 'create'
}
const stateStatus = [
    {key: '', name: i18next.t('component.marketing.landing.dropdown.status.all')},
    {key: 'PUBLISH', name: i18next.t('component.marketing.landing.dropdown.status.publish')},
    {key: 'DRAFT', name: i18next.t('component.marketing.landing.dropdown.status.draft')}
    ];

class LandingPage extends Component {
    state = {
        data : [],
        totalPage: 0,
        isFetching: true,
        stateStatusDropDownOpen: false,
        stateSelectStatus: stateStatus[0],
        currentPage: 1,
        disabledActionCheckbox: true,
        checkboxIdList: []

    };
    actions = {
        defaultAction: [
            {
                name: GSActionButtonIcons.VIEW,
                action: (e, item) => this.redirectToEditOrViewOrCreate(e, item, actionNames.VIEW)
            },
            {
                name: GSActionButtonIcons.EDIT,
                action: (e, item) => this.redirectToEditOrViewOrCreate(e, item, actionNames.EDIT)
            }
        ],
        dropdownAction: [
            {
                name: actionNames.PUBLISH,
                text: i18next.t('component.marketing.landing.dropdown.action.publish'),
                action: (e, item) => this.excutedPublish(e, item)
            },
            {
                name: actionNames.DRAFT,
                text: i18next.t('component.marketing.landing.dropdown.action.unpublish'),
                action: (e, item) => this.excutedDraft(e, item)
            },
            {
                name: actionNames.CLONE,
                text: i18next.t('component.marketing.landing.dropdown.action.clone'),
                action: (e, item) => this.excutedClone(e, item)
            },
            {
                name: actionNames.DELETE,
                text: i18next.t('component.marketing.landing.dropdown.action.delete'),
                action: (e, item) => this.openModelDelete(e, item)
            }
        ],
        actionsForCheckbox: [
            {
                name: actionNames.DELETE,
                text: i18next.t('component.marketing.landing.dropdown.action.delete'),
                action: (e) => this.openModelDeleteMultiCheckbox(e)
            }
        ]
    };
    constructor(props) {
        super(props);
        this.fetchData = this.fetchData.bind(this);
        this.onToggleStatus = this.onToggleStatus.bind(this);
        this.onSelectStatus = this.onSelectStatus.bind(this);

        this.onChangeOneCheckbox = this.onChangeOneCheckbox.bind(this);
        this.onChangeAllCheckbox = this.onChangeAllCheckbox.bind(this);
        this.resetItemRow = this.resetItemRow.bind(this);
        this.searchDataByQuery = this.searchDataByQuery.bind(this);
        this.openLoadingScreen = this.openLoadingScreen.bind(this);
        this.openModelDelete = this.openModelDelete.bind(this);
        this.excutedClone = this.excutedClone.bind(this);
        this.excutedPublish = this.excutedPublish.bind(this);
        this.excutedDraft = this.excutedDraft.bind(this);
        this.redirectToEditOrViewOrCreate = this.redirectToEditOrViewOrCreate.bind(this);
        this.resolveStatusText = this.resolveStatusText.bind(this);
        this.openModelDeleteMultiCheckbox = this.openModelDeleteMultiCheckbox.bind(this);
        this.reloadPage = this.reloadPage.bind(this);
        this.onChangePage = this.onChangePage.bind(this);
    }
    componentDidMount() {
        this.fetchData(1, Constants.SIZE_PER_PAGE)
    }

    openModelDeleteMultiCheckbox(e) {
        e.stopPropagation()
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: <GSTrans t={"component.marketing.landing.multi.delete.message"} values={{total: this.state.checkboxIdList.length}}>a<b>a</b></GSTrans>,
            okCallback: () => {
                ThemeService.multiDeleteLandingPage({
                    ids: this.state.checkboxIdList,
                }).then((request) => {
                    this.alertSeccessModel(i18next.t('toast.delete.success'));
                }, e => {
                    GSToast.commonError()
                })
            }
        })
    }

    openModelDelete (e, item){
        e.stopPropagation()
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: <GSTrans t={"component.marketing.landing.delete.message"} values={{name: item.title}}>a<b>a</b></GSTrans>,
            okCallback: () => {
                ThemeService.deleteLandingPage({
                    id : item.id,
                    storeId: CredentialUtils.getStoreId()
                }).then((request) => {
                    this.alertSeccessModel(i18next.t('toast.delete.success'));
                }, e => {
                    GSToast.commonError()
                })
            }
        })
    }
    excutedClone  (e, item) {
         e.stopPropagation()
         e.preventDefault()
        this.refConfirmModal.openModal({
            messages: <GSTrans t={"component.marketing.landing.clone.message"} values={{name: item.title}}>a<b>a</b></GSTrans>,
            okCallback: () => {
                ThemeService.cloneLandingPage({
                    id : item.id,
                    storeId: CredentialUtils.getStoreId()
                }).then(result => {
                    this.alertSeccessModel(i18next.t('toast.clone.success'));
                }, e => {
                    GSToast.commonError()
                })
            }
        })
    }
    excutedPublish (e, item) {
         e.stopPropagation()
         e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t("page.landingPage.editor.modal.publishConfirm"),
            okCallback: () => {
                ThemeService.publishLandingPage({
                    id : item.id,
                    storeId: CredentialUtils.getStoreId()
                }).then(result => {
                    GSToast.commonUpdate()
                    this.reloadPage();
                }, e => {
                    if(e.response.data && e.response.data.errorKey) {
                        GSToast.error(i18next.t(`toast.publish.${e.response.data.errorKey}.error`))
                    } else {
                        GSToast.commonError()
                    }
                })
            }
        })
    }
    excutedDraft(e, item) {
         e.stopPropagation()
         e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t('page.landingPage.editor.modal.deactivateConfirm'),
            okCallback: () => {
                ThemeService.draftLandingPage({
                    id : item.id,
                    storeId: CredentialUtils.getStoreId()
                }) .then(result => {
                    GSToast.commonUpdate()
                    this.reloadPage();
                }, e => {
                    GSToast.commonError()
                })
            }
        })
    }
    alertSeccessModel(messages) {
        this.alertModal.openModal({
            type: AlertModalType.ALERT_TYPE_SUCCESS,
            messages: messages,
            closeCallback: () =>{
                this.reloadPage();
            }
        })
    }
    reloadPage() {
        let PAGE = (this.state.data.length === 1) ? (this.state.currentPage === 1 ? 1 : (this.state.currentPage - 1) ): this.state.currentPage
        this.searchDataByQuery(this.state.stateSelectStatus.key ? {
            "status.equals": this.state.stateSelectStatus.key
        }:{}, PAGE, this.SIZE_PER_PAGE)
    }

    redirectToEditOrViewOrCreate (e, item, key) {
        e.stopPropagation()
        e.preventDefault()

        const resolveUrl = () => {
            const protocol = 'https://'

            // free domain
            if (item.domainType === LANDING_PAGE_DOMAIN_OPTIONS.FREE) {
                if (item.freeDomainType === LANDING_PAGE_SUB_DOMAIN_OPTIONS.LANDING_GOSELL) {
                    if (item.id) {
                        return protocol + LANDING_PAGE_SUB_DOMAIN + '/' + item.slug + `-p${item.id}`
                    }
                }
            }

            // custom domain
            if (item.domainType === LANDING_PAGE_DOMAIN_OPTIONS.CUSTOM) {
                return protocol + item.domain + (_.endsWith(item.domain, "/") ? '' : '/') + item.slug + '.html'
            }
        }

        switch (key) {
            case actionNames.VIEW:
                window.open(resolveUrl(), '_blank')
                break;
            case actionNames.EDIT:
                RouteUtils.linkTo(this.props, NAV_PATH.marketing.LANDING_PAGE_EDIT + '/' + item.id);
                break;
            case actionNames.CREATE:
                RouteUtils.linkTo(this.props, NAV_PATH.marketing.LANDING_PAGE_CREATE);
                break;
        }
    }
    fetchData(page, size) {
        this.searchDataByQuery({},page, size)
    }
    searchDataByQuery(params, page, size) {
        this.openLoadingScreen();
        let query = {...{
                "storeId.equals": CredentialUtils.getStoreId(),
                sort: "title,asc",
                page: page - 1,
                size: size
            }, ...params}
        ThemeService.getLandingPageByStore(query).then(res => {
            const totalItem = parseInt(res.headers['x-total-count']);
            this.setState(state => ({
                ...state,
                data : res.data,
                checkboxIdList: [],
                totalPage: Math.ceil(totalItem / Constants.SIZE_PER_PAGE),
                isFetching: false
            }));
        })
    }
    onToggleStatus()  {
        this.setState({
            stateStatusDropDownOpen: !this.state.stateStatusDropDownOpen
        })
    };
    openLoadingScreen() {
        this.setState({
            isFetching: true
        })
    }
    onSelectStatus(status){
        this.setState({
            stateSelectStatus: status
        }, () => {
            this.searchDataByQuery(status.key ? {
                "status.equals": status.key
            }:{},1, Constants.SIZE_PER_PAGE);
        })
    };

    onChangeOneCheckbox(checked,  item) {
        let items = this.state.data;
        let checkboxIdList = this.state.checkboxIdList;
        items.forEach((value, index) => {
            if(value.id == item.id)  {
                if(checked) {
                    checkboxIdList.push(value.id)
                } else {
                    _.remove(checkboxIdList,x => x === value.id)
                }
                value.isChecked = checked
                return;
            }
        })
        this.resetItemRow(items, checkboxIdList);
    }
    onChangeAllCheckbox(checked) {
        let items = this.state.data;
        let checkboxIdList = [];
        items.forEach((value, index) => {
            if(value.status !== actionNames.PUBLISH.toUpperCase()) {
                if(checked) {
                    checkboxIdList.push(value.id)
                }
                value.isChecked = checked
            }
        })
        this.resetItemRow(items, checkboxIdList);
    }
    resetItemRow(items, checkboxIdList) {
        this.setState({
            data: items,
            checkboxIdList: checkboxIdList,
            disabledActionCheckbox: checkboxIdList.length > 0 ? false : true
        })
    }
    onChangePage(page){
        this.setState({
            currentPage: page
        },()=>{
            this.reloadPage();
        })
    }

    resolveStatusText (status) {
        switch (status) {
            case LANDING_PAGE_ENUM.PAGE_STATUS.DRAFT:
                return i18next.t('page.landingPage.editor.status.draft')
            case LANDING_PAGE_ENUM.PAGE_STATUS.PUBLISH:
                return i18next.t('page.landingPage.editor.status.published')
        }
    }

    render() {
        return (
            <GSContentContainer className="planding gsa-min-width--fit-content" >
                <GSContentHeader className="planding-header" title={i18next.t("component.navigation.landing")} >
                    <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.FEATURE_0339]}
                                      wrapperDisplay={"block"}
                    >
                        <GSButton success
                                  onClick = {(e)=>this.redirectToEditOrViewOrCreate(e, {}, actionNames.CREATE)}
                            className="btn-save">
                            <i className="icon-plus"></i>
                            <Trans i18nKey="page.marketing.landing.btn.create" className="sr-only">
                                Create New Landing Page
                            </Trans>
                        </GSButton>
                    </PrivateComponent>
                </GSContentHeader>
                <GSContentBody className="planding-content-body" size={GSContentBody.size.MAX}>
                    <GSWidget>
                        <GSWidgetContent>
                            <section className='top-search'>
                                <section className='group-combobox'>
                                    <Dropdown className='dropdown-box' isOpen={this.state.stateStatusDropDownOpen} toggle={this.onToggleStatus}>
                                        <DropdownToggle className="gs-button" caret>
                                            <span>{this.state.stateSelectStatus.name}</span>
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {
                                                stateStatus.map((item) =>{
                                                    return (
                                                        <DropdownItem className='btn' key={'filter-status-' + item.key} onClick={() => this.onSelectStatus(item)}>
                                                            <span>{item.name}</span>
                                                        </DropdownItem>
                                                    )
                                                })
                                            }
                                        </DropdownMenu>
                                    </Dropdown>
                                </section>
                            </section>
                            {this.state.isFetching && <LoadingScreen />}
                            <PagingTable
                                headers={tableConfig.headerList}
                                totalPage={this.state.totalPage}
                                maxShowedPage={10}
                                currentPage={this.state.currentPage}
                                totalItems={this.state.data.length}
                                onChangeAllCheckbox={this.onChangeAllCheckbox}
                                rowHoverEffect={false}
                                actionsForCheckbox={this.actions.actionsForCheckbox}
                                disabledCheckbox={this.state.disabledActionCheckbox}
                                onChangePage={this.onChangePage}
                                hidePagingEmpty>
                                {this.state.data.map((item, index) => {
                                    return (
                                        <section key={index + "_" + item.id} className="gs-table-body-items"
                                                 data-id={item.id}>
                                            {/*<div className={`gs-table-body-item`}>*/}
                                            {/*    <UikCheckbox*/}
                                            {/*        key={`check-box-${item.id}`}*/}
                                            {/*        checked={item.isChecked}*/}
                                            {/*        color='blue'*/}
                                            {/*        onChange={e => this.onChangeOneCheckbox(e.target.checked, item)}*/}
                                            {/*        className="custom-check-box"*/}
                                            {/*        disabled={item.status === actionNames.PUBLISH.toUpperCase()}*/}
                                            {/*    />*/}
                                            {/*</div>*/}
                                            <div className={`gs-table-body-item  name`}>
                                                <img src={'/assets/images/icon-file-landing.png'}/>
                                                 <div>
                                                        <h3 className={'text-wrap'}>
                                                            {item.title}
                                                        </h3>
                                                        <span className={'text-wrap'}>
                                                            {item.description}
                                                        </span>
                                                 </div>
                                            </div>
                                            <div className="gs-table-body-item image">
                                                <span>{this.resolveStatusText(item.status)}</span>
                                            </div>
                                            <div className="gs-table-body-item time">
                                                <div><span>{item.lastModifiedDate && DateTimeUtils.formatHHmm(item.lastModifiedDate)}</span></div>
                                                <div><span>{item.lastModifiedDate && DateTimeUtils.formatDDMMYYY(item.lastModifiedDate)}</span></div>
                                            </div>
                                            <div className="gs-table-body-item action">
                                                {
                                                    this.actions.defaultAction.map((act, index)=> {
                                                        const disabled = act.name === GSActionButtonIcons.VIEW && item.status === LANDING_PAGE_ENUM.PAGE_STATUS.DRAFT
                                                        return (
                                                          <span key={act.name} >
                                                              <GSActionButton
                                                                  key={`gs-button-${item.id}-${act.name}`}
                                                                  icon={act.name}
                                                                  onClick={(e) =>  act.action(e, item)}
                                                                  disabled={disabled}
                                                              />
                                                          </span>
                                                        )
                                                    })
                                                }
                                                <DropdownAction key={`dropdown-${item.id}`} item={item}
                                                                icon={GSActionButtonIcons.DOTS}
                                                                hidenFields={[item.status, item.status === actionNames.PUBLISH.toUpperCase() ? actionNames.DELETE.toUpperCase() : 'none']}
                                                                actions={ this.actions.dropdownAction}
                                                            />
                                            </div>
                                        </section>
                                    )
                                })
                                }
                            </PagingTable>
                        </GSWidgetContent>
                        {this.state.data.length === 0 && (
                            <div className="empty">
                                {CredentialUtils.isStoreXxxOrGoSell() ? <img src={AgencyService.getBlueLogo()}/> :
                                    <i className="icon-empty"></i>}
                                <span>{i18next.t("component.landing.empty")}</span>
                            </div>
                        )}
                    </GSWidget>
                    <AlertModal ref={(el) => { this.alertModal = el }} />
                    <ConfirmModal ref={(el) => { this.refConfirmModal = el }} />
                </GSContentBody>
            </GSContentContainer>
        )
    }
}

export default LandingPage;

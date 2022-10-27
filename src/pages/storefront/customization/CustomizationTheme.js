import React, { Component } from 'react';
import { connect } from "react-redux";
import Col from "reactstrap/es/Col";
import Row from "reactstrap/es/Row";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import { NAV_PATH } from '../../../components/layout/navigation/Navigation';
import Constants from "../../../config/Constant";
import i18next from "../../../config/i18n";
import { default as storage, default as storageService } from "../../../services/storage";
import { ThemeService } from "../../../services/ThemeService";
import { CredentialUtils } from "../../../utils/credential";
import { cancelablePromise } from "../../../utils/promise";
import { RouteUtils } from '../../../utils/route';
import './CustomizationTheme.sass';
import ThemeCard from "./ThemeCard/ThemeCard";
import { ThemeModal } from "./ThemeModal/ThemeModal";


class CustomizationTheme extends Component {
    SIZE_PER_PAGE = 9;
    constructor(props) {
        super(props);

        this.state = {
            themeList: [],
            currentPage: 1,
            isFetching: false,
            storeId: CredentialUtils.getStoreId(),
            activeThemeId: 0,
            hasMore: false,
            locale: storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY),
            isShowDetailModal: false,
            dataModal: null
        };

        this.fetchData = this.fetchData.bind(this);
        this.showDetailModal = this.showDetailModal.bind(this);
        this.closeDetailModal = this.closeDetailModal.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.loadMore !== this.props.loadMore && this.state.hasMore) {
            this.fetchData();
        }
    }

    componentDidMount() {
        this.activeTheme = ThemeService.getActiveThemeOfStore(this.state.storeId);
        this.themeList = ThemeService.fetchListByStore(this.state.storeId, {
            sort: this.state.sort,
            page: this.state.currentPage - 1,
            size: this.SIZE_PER_PAGE,
            lang: this.state.locale
        });
        this.pmFetch = cancelablePromise(Promise.all([this.themeList,this.activeTheme]));
        this.pmFetch.promise
            .then(result => {
                if (result[1] && result[1] !== "") {
                    this.setState({
                        activeThemeId: result[1].themeId
                    });
                } else {
                    this.setState({
                        activeThemeId: result[0].data[0].id
                    });
                }
                this.resolveResultList(result[0]);
            })
            .catch(e => {
                this.setState({
                    isLoading: false
                })
            })

    }

    fetchData() {
        this.setState({
            isFetching: true
        });
        ThemeService.fetchListByStore(this.state.storeId, {
            sort: this.state.sort,
            page: this.state.currentPage - 1,
            size: this.SIZE_PER_PAGE,
            lang: this.state.locale
        }).then(result => {
            this.resolveResultList(result);
        }, () => {
            this.setState({
                isFetching: false
            })
        })
    }

    resolveResultList(result) {
        let totalList = this.state.themeList.concat(result.data);
        let hasMore = totalList.length < result.total;
        this.setState({
            themeList: totalList,
            isFetching: false,
            hasMore: hasMore,
            currentPage: hasMore ? this.state.currentPage + 1 : this.state.currentPage
        });
        this.props.cancelScrolling();
    }

    showDetailModal(data){
        this.setState({
            isShowDetailModal: true,
            dataModal: data
        });
    }

    closeDetailModal(){
        this.setState({
            isShowDetailModal: false
        });
    }

    componentWillUnmount() {
        if (this.pmFetch) this.pmFetch.cancel();
    }

    render() {
        const useNewThemeEngine = CredentialUtils.getThemeEngine();
        if (useNewThemeEngine) {
            RouteUtils.redirectWithReload(NAV_PATH.themeEngine.management);
            return;
        }

        return (
            <GSContentContainer className="theme-container" isSaving={this.state.isFetching}>
                <div className='header'>
                    <h3>{i18next.t("component.storefront.customization")}</h3>
                </div>
                <GSContentBody size={GSContentBody.size.MAX}>
                    <Row>
                        {this.state.themeList.map((dataRow, index) => {
                            return (
                                <Col md={4} className='mgb-15' key={index} >
                                    <ThemeCard data={dataRow}
                                               isActive={dataRow.id === this.state.activeThemeId}
                                               showDetailModal={this.showDetailModal}
                                    />
                                </Col>
                            )
                        })
                        }
                    </Row>
                </GSContentBody>

                {this.state.isShowDetailModal &&
                <ThemeModal
                    onClose={this.closeDetailModal}
                    data={this.state.dataModal}
                />
                }
            </GSContentContainer>
        );
    }
}

export default connect()(CustomizationTheme);

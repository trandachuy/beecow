import React from "react";
import './ThemeCard.sass'
import {Card, CardBody, CardImg} from "reactstrap";
import PropTypes from "prop-types";
import CardTitle from "reactstrap/es/CardTitle";
import {Trans} from "react-i18next";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {Link} from "react-router-dom";
import i18next from "i18next";
import Constants from "../../../../config/Constant";
import {TokenUtils} from "../../../../utils/token";
import PrivateComponent from "../../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../../config/package-features";


export default class ThemeCard extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            subTitle: this.props.data.name,
            link: this.props.data.themeId === Constants.STOREFRONT_DEFAULT ? '/channel/storefront/customization/design' : '/channel/storefront/customization/design?id=' + this.props.data.id
        };

        this.onClickViewDetail = this.onClickViewDetail.bind(this);
    }

    onClickViewDetail() {
        this.props.showDetailModal(this.props.data);
    }

    render() {
        const isAllowEdit = TokenUtils.hasThemingPermission(this.props.isActive);
        return (
            <Card className={this.props.isActive ? 'theme-card active' : 'theme-card'}>
                <div className='theme-card-img'>
                    <CardImg top width="100%" src={this.props.data.thumbnail} alt="Card image cap"
                             className="fix-width"/>
                    <div className="background-hover" />
                    <div className={this.props.isActive ? 'btn-hover active' : 'btn-hover'}>
                        {!this.props.isActive && <GSButton outline={true} color={'white'} onClick={this.onClickViewDetail}>
                            <Trans i18nKey="common.btn.view.details">
                                View Details
                            </Trans>
                        </GSButton>}
                        {/*ONLY EDIT FOR WEB AND APP*/}
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE]}
                                          public={this.props.data.themeId === Constants.STOREFRONT_DEFAULT }
                            wrapperDisplay={"block"}
                        >
                            <Link to={this.state.link}>
                                <GSButton outline={true} color={'white'} className="gsa-text--non-underline">
                                    <Trans i18nKey="common.btn.edit">
                                        Edit
                                    </Trans>
                                </GSButton>
                            </Link>
                        </PrivateComponent>

                    </div>
                </div>
                <CardBody>
                    <CardTitle>{this.state.subTitle} <span
                        className="status">{this.props.isActive ? ('(' + i18next.t('common.txt.active') + ')') : ''}</span></CardTitle>
                </CardBody>
            </Card>
        );
    }

}

ThemeCard.propTypes = {
  data: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  showDetailModal: PropTypes.func
}

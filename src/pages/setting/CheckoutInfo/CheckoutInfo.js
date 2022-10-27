import React, {Component} from 'react';
import './CheckoutInfo.sass'
import {Trans} from "react-i18next";
import {UikToggle, UikWidgetHeader} from "../../../@uik";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import storeService from "../../../services/StoreService";
import {cancelablePromise} from "../../../utils/promise";
import {GSToast} from "../../../utils/gs-toast";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";

class CheckoutInfo extends Component {
    state = {
        toggleBoool: false
    }

    constructor(props) {
        super(props);
        this.toggleOnOrOff = this.toggleOnOrOff.bind(this);
    }

    componentDidMount() {
        // fetch checkout info
        this.pmFetching = cancelablePromise(storeService.getCheckoutInfo())

        this.pmFetching.promise.then(result => {
            this.setState({toggleBoool : result})
        }).catch((e) => {
        });
    }

    componentWillUnmount() {
        if (this.pmFetching) this.pmFetching.cancel()
    }

    toggleOnOrOff(e) {
        const checked = e.target.checked
        storeService.updateCheckoutInfo(checked).then(result => {
            this.setState({
                toggleBoool: checked
            });
        }).catch(e => {
            GSToast.commonError()
            this.setState({
                toggleBoool: !checked
            });
        })
    }

    render() {
        const bankInfo = this.state.bankInfo;
        return (
            <GSContentContainer className="checkout-information">
                    <GSWidget>
                        <UikWidgetHeader className="gs-widget__header">
                            <Trans i18nKey="page.setting.checkout.title">
                                Guest Checkout
                            </Trans>
                        </UikWidgetHeader>
                        <GSWidgetContent>
                            <div className="checkout-information__body">
                                <Trans i18nKey="page.setting.checkout.description">
                                    Customers can complete a purchase without logging in.
                                </Trans>
                                <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0272]}>
                                    <UikToggle
                                        className="checkout-information__toggle"
                                        checked={this.state.toggleBoool}
                                        onChange={(e) => this.toggleOnOrOff(e)}
                                    />
                                </PrivateComponent>

                            </div>

                        </GSWidgetContent>
                    </GSWidget>
            </GSContentContainer>

        )
    }
}

export default CheckoutInfo;

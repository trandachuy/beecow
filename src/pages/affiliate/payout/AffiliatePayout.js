import React, { useState } from "react";
import "./AffiliatePayout.sass";
import i18next from "i18next";
import PropTypes from "prop-types";
import GSTab, { createItem } from "../../../components/shared/form/GSTab/GSTab";
import AffiliatePayoutHistory from "./history/AffiliatePayoutHistory";
import AffiliatePayoutInformation from "./information/AffiliatePayoutInformation";
import { CurrencyUtils } from "../../../utils/number-format";

const TAB = {
    INFORMATION: "INFORMATION",
    HISTORY: "HISTORY",
};

const AffiliatePayout = (props) => {
    const TABS = [
        createItem(i18next.t("page.affiliate.payout.information"), TAB.INFORMATION, null),
        createItem(i18next.t("page.affiliate.payout.history"), TAB.HISTORY, null),
    ]
    const [stCurrentTab, setStCurrentTab] = useState(TAB.INFORMATION)

    const onChangeTab = (tabValue) => {
        setStCurrentTab(tabValue)
    }

    return (
        <div className='affiliate-payout'>
            <GSTab
                items={TABS}
                active={stCurrentTab}
                onChangeTab={onChangeTab}
            />

            {stCurrentTab === TAB.INFORMATION && <AffiliatePayoutInformation/>}
            {stCurrentTab === TAB.HISTORY && <AffiliatePayoutHistory/>}
        </div>
    );
};

AffiliatePayout.defaultProps = {
    currency: CurrencyUtils.getLocalStorageSymbol(),
};

AffiliatePayout.propTypes = {
    currency: PropTypes.string,
};

export default AffiliatePayout;

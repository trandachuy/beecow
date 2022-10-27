/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/09/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, { useState } from "react";
import PropTypes from "prop-types";
import Navigation from "../AffiliateNavigation";
import "./AffiliateNavigationLeft.sass";
import { icoGoSell } from "../../../shared/gsIconsPack/gssvgico";

const NavigationLeft = (props) => {
    const [stIsOpen, setStIsOpen] = useState(true);

    const onClosePanel = () => {
        setStIsOpen(false);
        setTimeout(() => {
            props.onClose();
        }, 300);
    };

    const handleChildOnClick = (e) => {
        e.stopPropagation();
    };

    const { active, className, ...other } = props;
    return (
        <div
            {...other}
            className={[
                "navigation-left",
                !stIsOpen ? "navigation-left--closed" : "",
                className,
            ].join(" ")}
            onClick={onClosePanel}
        >
            <div
                className={[
                    "left-panel-wrapper",
                    !stIsOpen ? "left-panel-wrapper--closed" : "",
                ].join(" ")}
                onClick={handleChildOnClick}
            >
                <div className="logo">
                    <div
                        style={{
                            backgroundImage: `url(${icoGoSell})`,
                            backgroundPosition: "center",
                            backgroundSize: "contain",
                            width: "100px",
                            height: "50px",
                            marginLeft: "1em",
                            backgroundRepeat: "no-repeat",
                        }}
                    />
                </div>
                <Navigation
                    active={active}
                    className="left-panel"
                    collapsible={true}
                />
            </div>
        </div>
    );
};

NavigationLeft.propTypes = {
    className: PropTypes.string,
    active: PropTypes.string,
    onClose: PropTypes.func,
};

export default NavigationLeft;

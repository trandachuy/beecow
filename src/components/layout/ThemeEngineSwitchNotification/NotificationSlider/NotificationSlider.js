import React, { Component, useState } from "react";
import Carousel from 'react-bootstrap/Carousel';
import i18next from "../../../../config/i18n";
import "./NotificationSlider.sass";
import imgThemeManagement from "../../../../../public/assets/images/switch-theme-engine-notification/sliders/1_theme_management.png";
import imgThemeLibrary from "../../../../../public/assets/images/switch-theme-engine-notification/sliders/2_theme_library.png";
import imgThemeEditor from "../../../../../public/assets/images/switch-theme-engine-notification/sliders/3_theme_editor.png";
import imgElementsStyle from "../../../../../public/assets/images/switch-theme-engine-notification/sliders/4_elements_style.png";

function GsCarousel() {
    const [index, setIndex] = useState(0);
    const handleSelect = (selectedIndex, e) => {
        setIndex(selectedIndex);
    };

    return (
        <Carousel
            activeIndex={ index }
            onSelect={ handleSelect }
            controls={ true }
            prevIcon={ <span aria-hidden="true"/> }
            nextIcon={ <span aria-hidden="true"/> }
            wrap= { false }
            indicators={ false }
            interval={ null }
        >
            <Carousel.Item>
                <img src={ imgThemeManagement } alt="Theme management img" />
                <Carousel.Caption className="custom-carousel-caption">
                    <strong>{ i18next.t("notification.themeEngine.switch.caption.themeManagement.header") }</strong>
                    <div className="caption-details">
                      { i18next.t("notification.themeEngine.switch.caption.themeManagement.text") }
                    </div>
                </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
                <img src={ imgThemeLibrary } alt="Theme library img" />
                <Carousel.Caption className="custom-carousel-caption">
                    <strong>{ i18next.t("notification.themeEngine.switch.caption.themeLibrary.header") }</strong>
                    <div className="caption-details">
                      { i18next.t("notification.themeEngine.switch.caption.themeLibrary.text") }
                    </div>
                </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
                <img src={ imgThemeEditor } alt="Theme editor img" />
                <Carousel.Caption className="custom-carousel-caption">
                    <strong>{ i18next.t("notification.themeEngine.switch.caption.themeEditor.header") }</strong>
                    <div className="caption-details">
                      { i18next.t("notification.themeEngine.switch.caption.themeEditor.text") }
                    </div>
                </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
                <img src={ imgElementsStyle } alt="Elements style img" />
                <Carousel.Caption className="custom-carousel-caption">
                    <strong>{ i18next.t("notification.themeEngine.switch.caption.elementsStyle.header") }</strong>
                    <div className="caption-details">
                      { i18next.t("notification.themeEngine.switch.caption.elementsStyle.text") }
                    </div>
                </Carousel.Caption>
            </Carousel.Item>
        </Carousel>
    );
}

/**
 * @deprecated not using on PROD anymore
 */
export class NotificationSlider extends Component {

    render() {
        return (
            <div className="notification-slider-container">
                <GsCarousel />
          </div>
        );
    }

}

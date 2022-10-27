import './LandingPagePreview.sass'
import React, {useEffect, useLayoutEffect, useState} from 'react'
import PlatformSelector from "./platform-selector/PlatformSelector";
import ThemeEngineConstants from "../../../theme/theme-making/ThemeEngineConstants";
import {ThemeService} from "../../../../services/ThemeService";
import $ from "jquery";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import {LoadingStyle} from "../../../../components/shared/Loading/Loading";

const LandingPagePreview = (props) => {
    const [stPlatform, setStPlatform] = useState(ThemeEngineConstants.PLATFORM_TYPE.DESKTOP)
    const [stContent, setStContent] = useState()
    const [stLoading, setStLoading] = useState(false)

    useEffect(() => {
        const themeId = props.match.params.themeId;

        setStLoading(true)
        ThemeService.getLandingPageTemplate(themeId)
            .then(landingPage => {
                if (!landingPage) {
                    return
                }

                setStContent(landingPage.content)
            })
            .finally(() => setStLoading(false))
    }, [])

    useLayoutEffect(() => {
        if (!stContent) {
            return
        }

        const className = 'landing-page-preview__iframe landing-page-preview__iframe--' + stPlatform.toLowerCase()

        // remove gs-script before render
        const srcDoc = stContent.replace(/<script( *?)id="gs-script">(.*?)<\/script>/s, '')

        $('#landing-page-preview__iframe').remove();
        $("#landing-page-preview").append($("<iframe />").attr({
            "srcdoc": srcDoc,
            "id": "landing-page-preview__iframe",
            "class": className,
            'scrolling': 'yes'
        }));

        $("#landing-page-preview__iframe").on('load', function () {
            const body = $("#landing-page-preview__iframe").contents().find("body")

            // prevent events for a, button tag
            body.find('a, button').on('click', function (e) {
                e.preventDefault();
            })

            // show all modal
            // body.find('[gspopup]').each(function (index, popup) {
            //     $(popup).toggleClass('modal fade')
            // })
        });
    }, [stContent, stPlatform]);

    return (
        <>
            {stLoading && <LoadingScreen loadingStyle={LoadingStyle.DUAL_RING_WHITE}/>}
            <div className="landing-page-preview" style={{fontSize: "16px"}}>
                <div className="landing-page-preview-grid">
                    <div className="platform-head-toolbar">
                        <PlatformSelector
                            platform={stPlatform}
                            onChange={platform => setStPlatform(platform)}
                            hiddenResponsive
                        />
                    </div>
                    <div className="landing-page-preview-body">
                        <section id="landing-page-preview" className={["landing-page-preview__html-parser",
                            'landing-page-preview__html-parser--' + stPlatform.toLowerCase()
                        ].join(' ')}/>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LandingPagePreview

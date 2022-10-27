import React, {useLayoutEffect, useContext} from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser from 'react-html-parser';
import './LandingPageEditorLivePreviewHtmlParser.sass'
import $ from 'jquery'
import {LANDING_PAGE_ENUM} from "../../../enum/LandingPageEnum";
import {LandingPageEditorContext} from "../../context/LandingPageEditorContext";
import {ColorUtils} from "../../../../../utils/color";
import {LANDING_PAGE_EDITOR_MODE} from "../../LandingPageEditor";

const createSelectedComponent = (tagName, jqueryDOM, attributes) => {
    return {
        tagName,
        jqueryDOM,
        attributes
    }
}
const LandingPageEditorLivePreviewHtmlParser = props => {
    const {state, dispatch} = useContext(LandingPageEditorContext.context);


    const toggleSectionByHtmlId = () => {
        const body = $("#ldp-live-preview__iframe").contents().find("body")
        // get toggle section
        const section = body.find('#ldp-content  > section') // find first level section
        $.each(section, (i, s) => {

            if (state.setting.currentTemplateHtmlId !== s.id) {
                $(s).attr('hidden', 'true')
            } else {
                $(s).removeAttr('hidden')
            }
        })
    }

    const scanPrimaryColor = (jqueryBodyDom) => {
        let color;
        // scan by background color
        color = jqueryBodyDom.find('.gs-background-color')
            .first()
            .css('background-color')
        if (color) return ColorUtils.rgb2hex(color)

        color = jqueryBodyDom.find('.gs-border-color')
            .first()
            .css('border-color')
        if (color) return ColorUtils.rgb2hex(color)

        color = jqueryBodyDom.find('.gs-font-color')
            .first()
            .css('color')
        if (color) return ColorUtils.rgb2hex(color)

        return '#000000'
    }

    useLayoutEffect(() => {
        const newColor = state.primaryColor;
        const styleDOM = $("#ldp-live-preview__iframe").contents().find("body").find('style')
        if (!styleDOM || !styleDOM.html()) return
        let styleStr = styleDOM.html()
        const filter = ColorUtils.hexToFilter(newColor).replace(';', '')
        styleStr = styleStr.replace(/.gs-background-color{background-color: (.*?);}/g, `.gs-background-color{background-color: ${newColor} !important;}`)
        styleStr = styleStr.replace(/.gs-border-color{border-color: (.*?);}/g, `.gs-border-color{border-color: ${newColor} !important;}`)
        styleStr = styleStr.replace(/.gs-font-color{color: (.*?);}/g, `.gs-font-color{color: ${newColor} !important;}`)
        styleStr = styleStr.replace(/.gs-filter-color{filter: (.*?);}/g, `.gs-filter-color{filter: ${filter} !important;}`)
        styleDOM.html(styleStr)
    }, [state.primaryColor])

    useLayoutEffect(() => {
        const className = 'ldp-live-preview__iframe ldp-live-preview__iframe--' + props.previewMode.toLowerCase()

        $('#ldp-live-preview__iframe').attr('class', className)

    }, [props.previewMode])

    useLayoutEffect(() => {
        toggleSectionByHtmlId();
    }, [props.currentHtmlId])

    useLayoutEffect(() => {
        const className = 'ldp-live-preview__iframe ldp-live-preview__iframe--' + props.previewMode.toLowerCase()

        // remove gs-script before render
        const srcDoc = props.html.replace(/<script( *?)id="gs-script">(.*?)<\/script>/s, '')

        $('#ldp-live-preview__iframe').remove();
        $("#ldp-live-preview").append($("<iframe />").attr({"srcdoc":srcDoc, "id":"ldp-live-preview__iframe", "class":className, 'scrolling': 'yes'}));

        $("#ldp-live-preview__iframe").on('load', function() {
            const body = $("#ldp-live-preview__iframe").contents().find("body")

            // prevent events for a, button tag
            body.find('a, button').on('click', function (e) {
                e.preventDefault();
            })
            
            const handleClick = function (e) {
                console.log($(this))
                e.preventDefault();

                // remove gs-selected for previous element
                body.find('.gs-selected').each( function (index, selected) {
                    $(selected).removeClass('gs-selected')
                })

                // save to state
                const jQueryDom = $(this)
                jQueryDom.addClass('gs-selected')
                $(this).each(function() {
                    const attr = []
                    $.each(this.attributes,function(i,a){
                        attr.push({
                            [a.name]: a.value
                        })
                    })
                    const selectedDom = createSelectedComponent(jQueryDom.prop('tagName'), jQueryDom, attr)
                    dispatch(LandingPageEditorContext.actions.setSelectedElement(selectedDom))
                })
            }

            // setup click event
            body.find('[gscp]').on('click', _.throttle(handleClick, 50, {
                leading: true,
                trailing: false
            }))
            
            const handleHover = function() {
                body.find('[gscp]').removeClass('hover');
                $(this).addClass('hover');
            }

            body.find('[gscp]').mouseover(_.throttle(handleHover, 5, {
                leading: true,
                trailing: false
            }))
            
            // add style support for editor
            let primaryColor;
            if (props.editMode === LANDING_PAGE_EDITOR_MODE.CREATE) {
                primaryColor = scanPrimaryColor(body)
            } else {
                primaryColor = state.primaryColor
            }

            const filter = ColorUtils.hexToFilter(primaryColor).replace(';', '')

            body.append(
                $('<style>').html(`
                
                    #ldp-content {
                        max-width: unset;
                    }
                
                    .gs-background-color{background-color: ${primaryColor} !important;}
                    .gs-border-color{border-color: ${primaryColor} !important;}
                    .gs-font-color{color: ${primaryColor} !important;}
                    .gs-filter-color{filter: ${filter} !important;}
                    
                    .gs-background-color{
                        transition: background-color .3s;
                    }
                    .gs-border-color{
                        transition: border-color .3s;
                    }
                    .gs-font-color{
                        transition: color .3s;
                    }
                    
                    .gs-selected {
                       border: 1px solid red !important;
                       cursor: pointer;
                       animation: selected 1s infinite;
                       
                    }
                    
                    @keyframes selected {
                        0% {
                            opacity: 1;
                        }
                        100% {
                            opacity: .8;
                        }
                    }
                    
                    [gscp] {
                        border: 1px dashed transparent;
                        padding: 1px;
                        transition: color .3s;
                    }
                    
                    [gscp].hover {
                       box-sizing: border-box;
                       -moz-box-sizing: border-box;
                       -webkit-box-sizing: border-box;
                       border: 1px dashed red;
                       cursor: pointer;
                    }
                    [gscode] {
                        position: relative;
                    }
                    
                    [gscode]:hover:before {
                       content: "</>";
                       position: absolute;
                       top: -20px;
                       right: 0px;
                       background-color: white;
                       font-family: monospace;
                       padding: 0 .5rem;
                       border-radius: .25rem .25rem 0 0;
                    }
                    
                    [gscode]:hover:before:hover {
                        font-weight: bold;
                    }
                `)
            )

            // scan primary color
            dispatch(LandingPageEditorContext.actions.setPrimaryColor(primaryColor))

            // show all modal
            body.find('[gspopup]').each( function (index, popup) {
                $(popup).toggleClass('modal fade')
            })

            // toggle section
            toggleSectionByHtmlId()

        });
    }, [props.html]);


    return (
        <section id="ldp-live-preview" className={["landing-page-editor-live-preview-html-parser",
            'landing-page-editor-live-preview-html-parser--' + props.previewMode.toLowerCase()
        ].join(' ')}>

        </section>
    );
};

LandingPageEditorLivePreviewHtmlParser.propTypes = {
    html: PropTypes.string,
    previewMode: PropTypes.oneOf(Object.values(LANDING_PAGE_ENUM.PREVIEW_MODE)),
    currentHtmlId: PropTypes.string,
};

export default LandingPageEditorLivePreviewHtmlParser;

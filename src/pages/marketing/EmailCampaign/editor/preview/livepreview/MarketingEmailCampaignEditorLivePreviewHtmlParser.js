/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useLayoutEffect} from "react";
import PropTypes from "prop-types";
import "./MarketingEmailCampaignEditorLivePreviewHtmlParser.sass";
import {MarketingEmailCampaignEnum} from "../../../MarketingEmailCampaignEnum";
import {ColorUtils} from "../../../../../../utils/color";
import $ from "jquery";
import {MarketingEmailCampaignEditorContext} from "../../context/MarketingEmailCampaignEditorContext";

const createSelectedComponent = (tagName, jqueryDOM, attributes) => {
  return {
    tagName,
    jqueryDOM,
    attributes,
  };
};
const MarketingEmailCampaignEditorLivePreviewHtmlParser = (props) => {
  const { state, dispatch } = useContext(
    MarketingEmailCampaignEditorContext.context
  );

  const scanPrimaryColor = (jqueryBodyDom) => {
    let color;
    // scan by background color
    color = jqueryBodyDom
      .find(".gs-background-color")
      .first()
      .css("background-color");
    if (color) return ColorUtils.rgb2hex(color);

    color = jqueryBodyDom.find(".gs-border-color").first().css("border-color");
    if (color) return ColorUtils.rgb2hex(color);

    color = jqueryBodyDom.find(".gs-font-color").first().css("color");
    if (color) return ColorUtils.rgb2hex(color);
    return "#000000";
  };

  /**
   * Update primary color from state to UI
   */
  useLayoutEffect(() => {
    const newColor = state.primaryColor;
    const styleDOM = $("#mail-live-preview__iframe")
      .contents()
      .find("body")
      .find("style");
    if (!styleDOM || !styleDOM.html()) return;
    let styleStr = styleDOM.html();
    const filter = ColorUtils.hexToFilter(newColor).replace(";", "");
    styleStr = styleStr.replace(
      /.gs-background-color{background-color: (.*?);}/g,
      `.gs-background-color{background-color: ${newColor} !important;}`
    );
    styleStr = styleStr.replace(
      /.gs-border-color{border-color: (.*?);}/g,
      `.gs-border-color{border-color: ${newColor} !important;}`
    );
    styleStr = styleStr.replace(
      /.gs-font-color{color: (.*?);}/g,
      `.gs-font-color{color: ${newColor} !important;}`
    );
    styleStr = styleStr.replace(
      /.gs-filter-color{filter: (.*?);}/g,
      `.gs-filter-color{filter: ${filter} !important;}`
    );
    styleDOM.html(styleStr);
  }, [state.primaryColor]);

  useLayoutEffect(() => {
    const className =
      "mail-live-preview__iframe mail-live-preview__iframe--" +
      props.previewMode.toLowerCase();

    $("#mail-live-preview__iframe").attr("class", className);
  }, [props.previewMode]);

  useLayoutEffect(() => {
    const className =
      "mail-live-preview__iframe mail-live-preview__iframe--" +
      props.previewMode.toLowerCase();

    // remove gs-script before render
    const srcDoc = props.html.replace(
      /<script( *?)id="gs-script">(.*?)<\/script>/s,
      ""
    );
    
    $("#mail-live-preview__iframe").remove();
    $("#mail-live-preview").append(
      $("<iframe />").attr({
        srcdoc: srcDoc,
        id: "mail-live-preview__iframe",
        class: className,
        scrolling: "yes",
      })
    );

    $("#mail-live-preview__iframe").on("load", function () {
      const body = $("#mail-live-preview__iframe").contents().find("body");

      // prevent events for a, button tag
      body.find("a, button").on("click", function (e) {
        e.preventDefault();
      });

      // setup click event
      body.find("[gscp]").on("click", function (e) {
        e.preventDefault();

        // remove gs-selected for previous element
        body.find(".gs-selected").each(function (index, selected) {
          $(selected).removeClass("gs-selected");
        });

        // save to state
        const jQueryDom = $(this);
        jQueryDom.addClass("gs-selected");
        $(this).each(function () {
          const attr = [];
          $.each(this.attributes, function (i, a) {
            attr.push({
              [a.name]: a.value,
            });
          });
          const selectedDom = createSelectedComponent(
            jQueryDom.prop("tagName"),
            jQueryDom,
            attr
          );
          dispatch(
            MarketingEmailCampaignEditorContext.actions.setSelectedElement(
              selectedDom
            )
          );
        });
      });

      // add style support for editor
      let primaryColor;
      // if (props.mode === MarketingEmailCampaignEnum.PAGE_MODE.CREATE) {
        primaryColor = scanPrimaryColor(body);
      // } else {
      //   primaryColor = state.primaryColor;
      // }

      const filter = ColorUtils.hexToFilter(primaryColor).replace(";", "");

      body.append(
        $("<style>").html(`
                
                
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
                    
                    [gscp]:hover {
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
      );

      // scan primary color
      dispatch(
        MarketingEmailCampaignEditorContext.actions.setPrimaryColor(
          primaryColor
        )
      );
    });
  }, [props.html]);

  return (
    <section
      id="mail-live-preview"
      className={[
        "marketing_email_campaign_editor_live_preview_html_parser",
        "marketing_email_campaign_editor_live_preview_html_parser--" +
          props.previewMode.toLowerCase(),
      ].join(" ")}
    ></section>
  );
};

MarketingEmailCampaignEditorLivePreviewHtmlParser.propTypes = {
  html: PropTypes.string,
  previewMode: PropTypes.oneOf(
    Object.values(MarketingEmailCampaignEnum.PREVIEW_MODE)
  ),
  mode: PropTypes.string,
};

export default MarketingEmailCampaignEditorLivePreviewHtmlParser;

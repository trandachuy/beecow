import React, {useEffect, useState} from "react";
import {AvField, AvForm} from "availity-reactstrap-validation";
import "./LandingPageElements.sass";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSImg from "../../../../../components/shared/GSImg/GSImg";
import GSDropdownNumber from "../../../../../components/shared/GSDropdownNumber/GSDropdownNumber";
import GSButtonUpload from "../../../../../components/shared/GSButtonUpload/GSButtonUpload";
import {ColorUtils} from "../../../../../utils/color";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import i18next from "i18next";
import {ContextUtils} from "../../../../../utils/context";
import {UikSelect, UikToggle, UikWidget, UikWidgetContent, UikWidgetHeader,UikCheckbox} from "../../../../../@uik";

export const ElementEditorPrimaryColor = (props) => {
  const { state, dispatch } = props.context;

  const onChangeColor = (e) => {
    const { value } = e.currentTarget;
    dispatch(ContextUtils.createAction("SET_PRIMARY_COLOR", value));
  };

  return (
    <div className="landing-page-element">
      <div className="landing-page-element__title d-flex align-items-center">
        <FontAwesomeIcon icon="fill" />
        <h5>
          <GSTrans t="page.landingPage.editor.elementEditor.theme" />
        </h5>
      </div>
      <div className="landing-page-element__content-container d-flex flex-column">
        <div className="landing-page-element__content landing-page-element__content--color-picker">
          <span className="gs-frm-input__label">
            <GSTrans t="page.landingPage.editor.elementEditor.primaryColor" />
          </span>
          <input
            type="color"
            value={state.primaryColor}
            onChange={onChangeColor}
          />
        </div>
      </div>
    </div>
  );
};

// export const ElementEditorTime = (props) => {
//   const { state, dispatch } = props.context;

//   const onChangeTime = (e) => {
//     const {value} = e.currentTarget;
//     dispatch(ContextUtils.createAction("SET_POPUP_SETTING_TIME", value));
//   };

//   return (
//     <div className="landing-page-element">
//       <div className="landing-page-element__title d-flex align-items-center">
//         <FontAwesomeIcon icon="clock" />
//         <h5>
//           <GSTrans t="page.landingPage.editor.elementEditor.popup_time" />
//         </h5>
//       </div>
//       <div className="landing-page-element__content-container d-flex flex-column">
//         <div className="landing-page-element__content landing-page-element__content--color-picker">
//           <span className="gs-frm-input__label">
//             <GSTrans t="page.landingPage.editor.elementEditor.popup_time_in_second" />
//           </span>

//           <GSDropdownNumber 
//             value={state.popupSettingTime}
//             fromValue={3}
//             toValue={90}
//             onChangeNumber={onChangeTime}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

export const ElementEditorPopupShow = (props) => {
  const { state, dispatch } = props.context;

  const onChangeShow = (e) => {
    const checked = e.target.checked;
    dispatch(ContextUtils.createAction("SET_POPUP_SETTING_SHOW", checked));
  };

  const onChangeTime = (e) => {
    const {value} = e.currentTarget;
    dispatch(ContextUtils.createAction("SET_POPUP_SETTING_TIME", value));
  };

  return (
    <div className="landing-page-element">
      <div className="landing-page-element__title d-flex align-items-center">
        <FontAwesomeIcon icon="tv" />
        <h5>
          <GSTrans t="page.landingPage.editor.elementEditor.popup_display" />
        </h5>
      </div>
      <div className="landing-page-element__content-container d-flex flex-column">
        <div className="landing-page-element__content landing-page-element__content--color-picker">
          <span className="gs-frm-input__label">
            <GSTrans t="page.landingPage.editor.elementEditor.popup_display_title" />
          </span>
          <span>
          <UikCheckbox
            name="check_to_show_time"
            className="select-collection-row__discount"
            checked={state.popupSettingShow}
            onChange={(e) => onChangeShow(e)}
          />
          </span>
          
        </div>
      </div>


      {state.popupSettingShow &&
      <>
      <div className="landing-page-element__title d-flex align-items-center">
        <FontAwesomeIcon icon="clock" />
        <h5>
          <GSTrans t="page.landingPage.editor.elementEditor.popup_time" />
        </h5>
      </div>
      <div className="landing-page-element__content-container d-flex flex-column">
        <div className="landing-page-element__content landing-page-element__content--color-picker">
          <span className="gs-frm-input__label">
            <GSTrans t="page.landingPage.editor.elementEditor.popup_time_in_second" />
          </span>

          <GSDropdownNumber 
            value={state.popupSettingTime}
            fromValue={3}
            toValue={90}
            onChangeNumber={onChangeTime}
          />
        </div>
      </div>
      </>
      }


    </div>
  );
};

export const ElementEditorImg = ({ jqueryDOM, context }) => {
  const [stSrc, setStSrc] = useState(jqueryDOM.attr("src"));
  const { state, dispatch } = context;

  const onUploaded = (files) => {
    const file = files[0];
    const tUrl = URL.createObjectURL(file);
    setStSrc(tUrl);
    dispatch(
      ContextUtils.createAction("ADD_IMAGE_TO_POOL", {
        file,
        tUrl,
      })
    );
    jqueryDOM.attr("src", tUrl);
  };

  return (
    <div className="landing-page-element">
      <div className="landing-page-element__title d-flex align-items-center">
        <FontAwesomeIcon icon="image" />
        <h5>
          <GSTrans t="page.landingPage.editor.elementEditor.image" />
        </h5>
      </div>
      <div className="landing-page-element__content-container d-flex flex-column">
        <div className="landing-page-element__content landing-page-element__content--image d-flex flex-column align-items-center">
          <GSImg src={stSrc} width={150} height={150} />
          <GSButtonUpload marginTop onUploaded={onUploaded} multiple={false} />
        </div>
      </div>
    </div>
  );
};

export const ElementEditorBackground = ({ jqueryDOM, context }) => {
  const [stSrc, setStSrc] = useState(jqueryDOM.css("background-image"));
  const { state, dispatch } = context;

  const onUploaded = (files) => {
    const file = files[0];
    const tUrl = URL.createObjectURL(file);
    setStSrc(tUrl);
    dispatch(
        ContextUtils.createAction("ADD_IMAGE_TO_POOL", {
          file,
          tUrl,
        })
    );
    jqueryDOM.css("background-image", `url(${tUrl})`);
  };

  return (
      <div className="landing-page-element">
        <div className="landing-page-element__title d-flex align-items-center">
          <FontAwesomeIcon icon="image"/>
          <h5>
            <GSTrans t="page.landingPage.editor.elementEditor.image"/>
          </h5>
        </div>
        <div className="landing-page-element__content-container d-flex flex-column">
          <div
              className="landing-page-element__content landing-page-element__content--image d-flex flex-column align-items-center">
            <div style={ {
              backgroundImage: stSrc,
              backgroundSize: 'cover',
              width: '150px',
              height: '150px'
            } }/>
            <GSButtonUpload marginTop onUploaded={ onUploaded } multiple={ false }/>
          </div>
        </div>
      </div>
  );
};

export const ElementEditorText = ({ jqueryDOM }) => {
  const onChangeText = (e) => {
    const value = e.currentTarget.value;
    jqueryDOM.text(value?.trim());
  };

  const onChangeColor = (e) => {
    const value = e.currentTarget.value;
    jqueryDOM.css("color", value);
  };

  return (
    <div className="landing-page-element">
      <div className="landing-page-element__title d-flex align-items-center">
        <FontAwesomeIcon icon="font" />
        <h5>
          <GSTrans t="page.landingPage.editor.elementEditor.text" />
        </h5>
      </div>
      <div className="landing-page-element__content-container d-flex flex-column">
        <div className="landing-page-element__content">
          <AvForm autoComplete="off">
            <AvField
              name="ldp-ele-text"
              label={i18next.t("page.landingPage.editor.elementEditor.content")}
              type="text"
              value={jqueryDOM.text()?.trim()}
              onChange={onChangeText}
            />
          </AvForm>
          <div
            className="landing-page-element__content landing-page-element__content--color-picker"
            key={jqueryDOM.css("color")}
          >
            <span className="gs-frm-input__label">
              <GSTrans t="page.landingPage.editor.elementEditor.color" />
            </span>
            <input
              type="color"
              onChange={onChangeColor}
              defaultValue={ColorUtils.rgb2hex(jqueryDOM.css("color"))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ElementEditorParagraph = ({ jqueryDOM }) => {
  const onChangeText = (e) => {
    const value = e.currentTarget.value;
    jqueryDOM.text(value);
  };

  const onChangeColor = (e) => {
    const value = e.currentTarget.value;
    jqueryDOM.css("color", value);
  };

  return (
    <div className="landing-page-element">
      <div className="landing-page-element__title d-flex align-items-center">
        <FontAwesomeIcon icon="paragraph" />
        <h5>
          <GSTrans t="page.landingPage.editor.elementEditor.paragraph" />
        </h5>
      </div>
      <div className="landing-page-element__content-container d-flex flex-column">
        <div className="landing-page-element__content">
          <AvForm autoComplete="off">
            <AvField
              name="ldp-ele-text"
              label={i18next.t("page.landingPage.editor.elementEditor.content")}
              type="textarea"
              value={jqueryDOM.text()}
              onChange={onChangeText}
            />
          </AvForm>
          <div className="landing-page-element__content landing-page-element__content--color-picker">
            <span className="gs-frm-input__label">
              <GSTrans t="page.landingPage.editor.elementEditor.color" />
            </span>
            <input
              type="color"
              onChange={onChangeColor}
              defaultValue={ColorUtils.rgb2hex(jqueryDOM.css("color"))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ElementEditorCode = ({ jqueryDOM }) => {
  const onChangeHtml = (e) => {
    const { value } = e.currentTarget;
    // check change
    if (value !== jqueryDOM.html().trim()) {
      jqueryDOM.html(value);
    }
  };

  return (
    <div className="landing-page-element">
      <div className="landing-page-element__title d-flex align-items-center">
        <FontAwesomeIcon icon="code" />
        <h5>
          <GSTrans t="page.landingPage.editor.elementEditor.code" />
        </h5>
      </div>
      <div className="landing-page-element__content-container d-flex flex-column">
        <div className="landing-page-element__content">
          <AvForm autoComplete="off">
            <AvField
              name="ldp-ele-code"
              className="ldp-ele-code"
              type="textarea"
              value={jqueryDOM.html().trim()}
              onBlur={onChangeHtml}
            />
          </AvForm>
        </div>
      </div>
    </div>
  );
};

export const ElementEditorLink = ({ jqueryDOM }) => {
  const onChangeText = (e) => {
    const value = e.currentTarget.value;
    jqueryDOM.text(value);
  };

  const onChangeHref = (e) => {
    const value = e.currentTarget.value;
    jqueryDOM.attr("href", value);
  };

  const onChangeColor = (e) => {
    const value = e.currentTarget.value;
    jqueryDOM.css("color", value);
  };

  return (
    <div className="landing-page-element">
      <div className="landing-page-element__title d-flex align-items-center">
        <FontAwesomeIcon icon="link" />
        <h5>
          <GSTrans t="page.landingPage.editor.elementEditor.link" />
        </h5>
      </div>
      <div className="landing-page-element__content-container d-flex flex-column">
        <div className="landing-page-element__content">
          <AvForm autoComplete="off">
            <AvField
              name="ldp-ele-text"
              label={i18next.t("page.landingPage.editor.elementEditor.content")}
              type="text"
              value={jqueryDOM.text()}
              onChange={onChangeText}
            />
            <AvField
              name="ldp-ele-href"
              label="Url"
              type="text"
              value={jqueryDOM.attr("href")}
              onChange={onChangeHref}
            />
          </AvForm>
          <div
            className="landing-page-element__content landing-page-element__content--color-picker"
            key={jqueryDOM.css("color")}
          >
            <span className="gs-frm-input__label">
              <GSTrans t="page.landingPage.editor.elementEditor.color" />
            </span>
            <input
              type="color"
              defaultValue={ColorUtils.rgb2hex(jqueryDOM.css("color"))}
              onChange={onChangeColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

import React, {useContext} from "react";
import "./LandingPageElementEditor.sass";
import {ElementEditorPrimaryColor, ElementEditorTime, ElementEditorPopupShow} from "./elements/ElementsEditor";
//import {ElementEditorPrimaryColor, ElementEditorTime, ElementEditorPopupShow} from "./elements/ElementsEditor";
import {LandingPageEditorContext} from "../context/LandingPageEditorContext";
import HTMLElementEditorFactory from "./elements/HTMLElementEditorFactory";
import {AvForm} from "availity-reactstrap-validation";
import PrivateComponent from "../../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../../config/package-features";

const LandingPageElementEditor = (props) => {
  const { state, dispatch } = useContext(LandingPageEditorContext.context);
  return (
    <div className="landing-page-editor-element-editor d-flex flex-column">
      <AvForm autoComplete="off">
        {state.contentHtml && (
          <>
            <ElementEditorPrimaryColor context={{ state, dispatch }} />
            <hr />
            {
              state.popupHasSetting && 
              <>
                <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0339]}>
                  <ElementEditorPopupShow context={{ state, dispatch }} />
                  <hr />
                </PrivateComponent>
                
                {/* <ElementEditorTime context={{ state, dispatch }} />
                <hr /> */}
              </>
            }
            
            
          </>
        )}
        {state.selectedElement && (
          <HTMLElementEditorFactory
            context={{ state, dispatch }}
            element={state.selectedElement}
          />
        )}
      </AvForm>
    </div>
  );
};

LandingPageElementEditor.propTypes = {};

export default LandingPageElementEditor;

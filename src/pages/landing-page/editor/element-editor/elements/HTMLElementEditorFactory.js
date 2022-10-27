import React from "react";
import PropTypes from "prop-types";
import {
  ElementEditorBackground,
  ElementEditorCode,
  ElementEditorImg,
  ElementEditorLink,
  ElementEditorParagraph,
  ElementEditorText
} from './ElementsEditor';

const HTMLElementEditorFactory = ({ element, context }) => {
  const attrs = element.attributes.map((atrr) => Object.keys(atrr)[0]);
  const jqueryDOM = element.jqueryDOM;
  if (attrs.includes("gsimg")) {
    return (
      <ElementEditorImg
        context={context}
        key={jqueryDOM.attr("src")}
        jqueryDOM={jqueryDOM}
      />
    );
  }
  if (attrs.includes("gstext")) {
    return (
      <ElementEditorText
        context={context}
        key={jqueryDOM.text() + "-" + jqueryDOM.css("color")}
        jqueryDOM={jqueryDOM}
      />
    );
  }
  if (attrs.includes("gsparagraph")) {
    return (
      <ElementEditorParagraph
        context={context}
        jqueryDOM={jqueryDOM}
        key={jqueryDOM.text() + "-" + jqueryDOM.css("color")}
      />
    );
  }
  if (attrs.includes("gscode")) {
    return (
      <ElementEditorCode
        context={context}
        key={jqueryDOM.html()}
        jqueryDOM={jqueryDOM}
      />
    );
  }
  if (attrs.includes("gslink")) {
    return (
      <ElementEditorLink
        context={context}
        key={
          jqueryDOM.text() +
          "-" +
          jqueryDOM.attr("href") +
          "-" +
          jqueryDOM.css("color")
        }
        jqueryDOM={jqueryDOM}
      />
    );
  }
  if (attrs.includes("gsbackground")) {
    return (
        <ElementEditorBackground
            context={context}
            key={jqueryDOM.css('background-image')}
            jqueryDOM={jqueryDOM}
        />
    );
  }
  return null;
};

HTMLElementEditorFactory.propTypes = {
  element: PropTypes.shape({
    tagName: PropTypes.string,
    jqueryDOM: PropTypes.object,
    attributes: PropTypes.array,
  }),
  context: PropTypes.object,
};

export default HTMLElementEditorFactory;

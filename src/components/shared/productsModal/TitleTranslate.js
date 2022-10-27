import React from 'react'
import "./TranslateModal.sass"
import PropTypes from "prop-types";
import TranslateModal from "./TranslateModal";


function TitleTranslate(props) {
    return (
        <div className="product-translate__titleBody">
            <h3>{props.title}</h3>
        </div>
    )
}


TitleTranslate.propTypes = {
    title:PropTypes.string,
}


export default TitleTranslate;




import React from 'react'
import "./TranslateServiceModal.sass"
import PropTypes from "prop-types";
import TranslateServiceModal from "./TranslateServiceModal";


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




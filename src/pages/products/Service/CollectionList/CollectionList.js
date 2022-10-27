import React from 'react';
import CollectionList from "../../CollectionList/CollectionList";
import {connect} from "react-redux";
import Constants from "../../../../config/Constant";

const ServiceCollectionList = (props) => {
    return(
        <CollectionList itemType={Constants.ITEM_TYPE.SERVICE} history={props.history}></CollectionList>
    )
}


export default connect()(ServiceCollectionList);

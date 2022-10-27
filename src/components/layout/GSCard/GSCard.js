/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 14/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import GSWidget from "../../shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../shared/form/GSWidget/GSWidgetContent";

const GSCard = props => {
    return (
        <GSWidget className={`${props.className}`}>
            <GSWidgetContent>
                {props.children}
            </GSWidgetContent>
        </GSWidget>
    );
};

GSCard.propTypes = {
  className: PropTypes.string
}

export default GSCard;

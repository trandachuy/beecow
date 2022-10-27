/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/04/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import {UikWidgetTable} from '../../../@uik'
import PropTypes from 'prop-types'
import Loading, {LoadingStyle} from "../Loading/Loading";

const GSTable = props => {

    const {isLoading} = props
    return (
        <UikWidgetTable {...props} style={isLoading ? {border: 'none'} : {}}>
            {isLoading || props.children}
            {isLoading &&
                <section>
                    <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                </section>
            }
        </UikWidgetTable>
    );
};

GSTable.defaultProps = {
    isLoading: false
}

GSTable.propTypes = {
    isLoading: PropTypes.bool,
};

export default GSTable;

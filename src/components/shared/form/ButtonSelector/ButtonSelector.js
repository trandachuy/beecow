import {UikButton} from "../../../../@uik";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import i18next from "i18next";

export default class ButtonSelector extends Component{
    constructor(props){
        super(props);
        this.state = {
            selected: this.props.defaultPosition
        }
        this.onSelected = this.onSelected.bind(this);
        this.getSelected = this.getSelected.bind(this);
    }

    onSelected(index){
        this.setState({
            selected: index
        })
        this.props.onSelected(this.props.btnList[index]);
    }

    getSelected(){
        return this.props.btnList[this.state.selected];
    }

    render(){
        return(
            <div>
                {this.props.btnList.map((item, index) => {
                    return(
                        <UikButton
                            primary={this.state.selected === index}
                            onClick={() => this.onSelected(index)}
                            key={index}>
                            { this.props.i18nextPrefix? i18next.t(this.props.i18nextPrefix + '.' + item):item}
                        </UikButton>
                    )
                })}
            </div>
        )
    }
}

ButtonSelector.propTypes = {
    i18nextPrefix: PropTypes.string,
    btnList: PropTypes.array,
    defaultPosition: PropTypes.number
}

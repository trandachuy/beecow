import React, {Component} from 'react';
import {UikSelect} from "../../../../@uik";

class DropdownBox extends Component{
    constructor(props) {
        super(props);
        this.state = {
            selected: this.props.defaultValue || this.props.items[0],
        }
    }
    onSelected(item) {
        if (this.props.disable) {
            return
        }

        this.setState({
            selected : item
        }, () =>{
            this.props.onSelected(this.props.field, item)
        })
    }
    render() {
        return (
            <div style={this.props.disable ? {opacity: 0.5, pointerEvents: 'none'} : {
                ...this.props.style
            }}>
                <UikSelect
                    className={'dropdown-box ' + this.props.className}
                    defaultValue={this.state.selected.value}
                    options={this.props.items}
                    onChange={ (item) => this.onSelected(item)}
                />
            </div>
        )
    }
}

export default DropdownBox;

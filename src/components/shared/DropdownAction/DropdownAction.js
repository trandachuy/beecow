import React from 'react';
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import PropTypes from "prop-types";
import GSActionButton from "../GSActionButton/GSActionButton";

export default class DropdownAction extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stateActionDropdownOpen: false
        }
        this.onToggleAction = this.onToggleAction.bind(this);
    }

    onToggleAction() {
        this.setState({
            stateActionDropdownOpen: !this.state.stateActionDropdownOpen
        })
    }

    render() {
        return (
            <Dropdown disabled={this.props.disabled} isOpen={this.props.disabled ? false : this.state.stateActionDropdownOpen} toggle={this.onToggleAction}>
                <DropdownToggle
                    tag={'span'}
                >
                    <GSActionButton
                        icon={this.props.icon}
                    />
                </DropdownToggle>
                <DropdownMenu>
                    {
                        this.props.actions.map((act, index) => {
                            if(!this.props.hiddenFields ||!this.props.hiddenFields.includes(act.name.toUpperCase())) {
                                return (
                                    <DropdownItem key={act.name} onClick={(e)=>act.action(e, this.props.item)}>{act.text}</DropdownItem>
                                )
                            }
                        })
                    }
                </DropdownMenu>
            </Dropdown>
        );
    }
}

DropdownAction.propTypes = {
    actions: PropTypes.any,
    item: PropTypes.any,
    hiddenFields: PropTypes.array,
    icon: PropTypes.string,
    disabled: PropTypes.bool,
}

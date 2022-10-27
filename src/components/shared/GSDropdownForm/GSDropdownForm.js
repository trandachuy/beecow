import './GSDropdownForm.sass';

import i18next from 'i18next';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import {UikInput, UikSelect} from '../../../@uik';

export const LIMIT_LENGTH = 30;
export default class GSDropdownForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            changeMode: false,
            inputValue: "",
            isDisabled: false,
            isHidden: true,
            opts: this.props.options
        }
        
        this.onStopDefAction = this.onStopDefAction.bind(this);
        this.onHandleDefAction = this.onHandleDefAction.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onClickChange = this.onClickChange.bind(this);
    }

    onStopDefAction(evt) {
        //stop form submit and onlick in parent element
        if(!evt || typeof evt.preventDefault != "function") return;
        evt.preventDefault();
        evt.stopPropagation();
        window.focus();
    }

    onHandleDefAction(evt) {
        //stop form submit and onlick in parent element
        if(!evt || typeof evt.preventDefault != "function") return;
        evt.preventDefault();
        evt.stopPropagation();
        window.focus();
        if($(evt.target).hasClass("dropdown_action_remove")) {
            const pos = $(evt.target).attr("data-position") || "-1";
            if(+pos !== -1) {
                const opts = this.state.opts;
                opts.splice(+pos, 1);
                this.setState({opts: opts});
            }
        }
        if($(evt.target).hasClass("add")) {
            const item = {
                builtIn: false,
                name: this.hasName(this.state.inputValue),
                value: this.hasValue(this.state.inputValue)
            };
            const opts = this.state.opts;
            opts.push(item);
            this.setState({opts: opts, isHidden: true, inputValue: ""});
        }
    }

    onClickChange(evt, isChange) {
        //stop form submit and onlick in parent element
        if(!evt || typeof evt.preventDefault != "function") return;
        evt.preventDefault();
        evt.stopPropagation();
        this.setState({changeMode: isChange});
        
        if(isChange) {
            $(".uik-btn__base.uik-select__option").bind("click onkeyup onkeydown", this.onHandleDefAction);
        } else {
            $(".uik-btn__base.uik-select__option").unbind("click onkeyup onkeydown", this.onHandleDefAction);
        }
    }

    onInputChange(evt) {
        //stop form submit and onlick in parent element
        if(!evt || typeof evt.preventDefault != "function") return;
        evt.preventDefault();
        evt.stopPropagation();
    }

    onInputNewValue(evt, that) {
        //stop form submit and onlick in parent element
        if(!evt || typeof evt.preventDefault != "function") return;
        evt.preventDefault();
        evt.stopPropagation();
        const value = evt.currentTarget.value;
        that.setState({inputValue: value});
        window.focus();
    }

    hasName(value) {
        return String(value).trim().replace(/\s+/gi,"").toUpperCase();
    }

    hasValue(value) {
        return (!value)? "":String(value).trim();
    }

    checkValidValue(evt) {
        const value = evt.currentTarget.value;
        if(!value || String(value).trim().length === 0) {            
            return false;
        }
        return true;
    }

    checkActiveSave(item) {
        let isValid = true;
        if(item) {
            isValid = (!item.value || String(item.value).trim().length === 0)? false: true;
        }
        const found = this.state.opts.find((e) => {
            if(!e.value || String(e.value).trim().length === 0) {
                return e;
            }
        });
        if(found) {
            isValid = false;
        }
        this.setState({isDisabled: !isValid});
    }

    render() {
        const {changeMode, inputValue, isHidden, isDisabled, opts} = this.state;
        let self = this;
        return (
            <div>
                <UikSelect
                    onChange={(evt) => {
                        if (evt.value === 'btnChange' || evt.value === 'btnAction' || changeMode === true) {
                            $('div.uik-select__valueWrapper').children().hide();
                            return;
                        } else {
                            $('div.uik-select__valueWrapper').children().show();
                        }
                        evt.name="userStatus";
                        this.props.onChange(evt);
                    }}
                    className={`dropdownform-selector ${changeMode? 'dropdownform-selector-disbaled': ''}`}
                    position="bottomRight"
                    defaultValue={self.props.value}
                    options={opts.map((opt, index) => {
                        return ({
                            value: (opt.value),
                            label: (!changeMode?
                            (<div className="dropdown_item_select">
                                <span>
                                 {opt.builtIn? String(i18next.t(`page.customers.edit.status.${(opt.name).toLowerCase()}`)).toLowerCase(): opt.value}
                                </span>
                            </div>):
                            (<div className={"dropdown_item_block"} 
                                onClick={self.onStopDefAction}>
                                <UikInput
                                    disabled={opt.builtIn || String(this.props.value).toUpperCase() === opt.name}
                                    defaultValue={opt.builtIn? i18next.t(`page.customers.edit.status.${(opt.name).toLowerCase()}`): opt.value}
                                    maxLength={LIMIT_LENGTH}
                                    onClick={self.onStopDefAction}
                                    onChange={(evt) => {
                                        self.onInputChange(evt);
                                        const isValid = self.checkValidValue(evt);
                                        $(evt.target).toggleClass("input_value_error", !isValid);
                                        evt.preventDefault();
                                        evt.stopPropagation();
                                    }}
                                    onKeyDown={
                                        (evt) => {
                                            if(evt.keyCode === 13 || 
                                            //evt.keyCode === 32 ||
                                            evt.keyCode === 9) {
                                                evt.preventDefault();
                                                evt.stopPropagation();
                                            }
                                        }
                                    }
                                    onBlur={(evt) => {
                                        const val = evt.target.value;
                                        const newOpt = {
                                            builtIn: false,
                                            name: self.hasName(opt.name),
                                            value: self.hasValue(val)
                                        };
                                        opts.splice(index, 1, newOpt);
                                        self.setState({opts: opts});
                                        self.checkActiveSave(newOpt);
                                    }}
                                />
                                <div hidden={opt.builtIn}
                                    className={"dropdown_action_remove"}
                                    style={{
                                        "fontSize": "large",
                                        "fontWeight": "bold",
                                        "padding-left": "10px"
                                    }}
                                    data-position={index}
                                    onClick={
                                        (evt) => {
                                            /* self.onStopDefAction(evt);
                                            opts.splice(index, 1);
                                            self.setState({opts: opts}); */
                                        }
                                    }>x</div>
                            </div>))
                        })
                    }).concat((function(){

                            if(!changeMode)  {
                                return([{
                                    value: "btnChange",
                                    label: (<div className={"dropdown_action_change"}>
                                    <button
                                        onClick={(e) => self.onClickChange(e, true)}>
                                        {`${i18next.t("common.btn.change")}...`}
                                    </button>
                                </div>)
                                }]);
                            }

                            return [{
                                value: "btnChange",
                                label: (<div className={"dropdown_action_add"} 
                                onClick={self.onStopDefAction}>
                                <UikInput
                                    value={inputValue}
                                    placeholder={i18next.t("page.customers.status.placeholder")}
                                    onClick={self.onStopDefAction}
                                    maxLength={LIMIT_LENGTH}
                                    onChange={(evt) => {
                                        self.onInputNewValue(evt, self);
                                        const isValid = self.checkValidValue(evt);
                                        self.setState({isHidden: !isValid});
                                        $(evt.target).toggleClass("input_value_error", !isValid);
                                    }}
                                    onKeyDown={
                                        (evt) => {
                                            if(evt.keyCode === 13 || 
                                            //evt.keyCode === 32 ||
                                            evt.keyCode === 9) {
                                                evt.preventDefault();
                                                evt.stopPropagation();
                                                return false;
                                            }
                                        }
                                    }/>
                                <button 
                                    className={"add"}
                                    hidden={isHidden}
                                    onClick={
                                        (evt) => {
                                            /* self.onStopDefAction(evt);
                                            const item = {
                                                builtIn: false,
                                                name: self.hasName(inputValue),
                                                value: self.hasValue(inputValue)
                                            };
                                            opts.push(item);
                                            self.setState({
                                                inputValue: ""
                                            });
                                            self.setState({isHidden: true});
                                            self.setState({opts: opts}); */
                                        }
                                }>{i18next.t("common.btn.add")}</button>
                            </div>)
                            },{ 
                                value: "btnAction",
                                label: (<div className="dropdown_action_block">
                                <button className="cancel" onClick={
                                    (evt) => {
                                        self.onClickChange(evt, false);
                                        self.props.onFinish(evt);
                                    }
                                }>{i18next.t("common.btn.cancel")}</button>
                                <button className="save" disabled={isDisabled}
                                    onClick={
                                    (evt) => {
                                        self.onClickChange(evt, false);
                                        self.props.onUpdate(evt, opts);
                                    }
                                }>{i18next.t("common.btn.save")}</button>
                            </div>
                        )}];
                    }()))}
                />
            </div>
        );
    }
}

GSDropdownForm.defaultProps = {
    options: [{
        name: "",
        value: "",
        builtIn: false
    }],
    defaultValue: ""
}

GSDropdownForm.propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    add: PropTypes.func,
    remove: PropTypes.func,
    updateValue: PropTypes.func,
    onFinish: PropTypes.func,
    onUpdate: PropTypes.func,
    className: PropTypes.string,
    options: PropTypes.array,
    defaultValue: PropTypes.string
}

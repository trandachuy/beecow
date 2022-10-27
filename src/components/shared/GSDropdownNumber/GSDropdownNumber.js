import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import './GSDropdownNumber.sass'
import {UikCheckbox, UikSelect} from "../../../@uik";
import i18next from "i18next";
import {cn} from "../../../utils/class-name";

const GSDropdownNumber = props => {

    const [getValue, setValue] = useState(props.value ? props.value : props.fromValue);

    useEffect(() => {
    })

    return (
        <div class="gs-dropdow-number-shared">
            <input type="number"
                className="form-control"
                defaultValue={getValue}
                min={props.fromValue}
                max={props.toValue}
                key={'number_of_value'}
                onChange={props.onChangeNumber}
            />
        </div>
    );
};


export default GSDropdownNumber;

import React from 'react'
import SharedContainer from "./SharedContainer";
import SharedBody from "./SharedBody";
import {bool, func, string} from "prop-types";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import AvCustomCheckbox from "../../../../../components/shared/AvCustomCheckbox/AvCustomCheckbox";
import {AvForm} from 'availity-reactstrap-validation';

import './CheckboxInput.sass'

const CheckboxInput = (props) => {
    const {defaultValue, title, disabled, onChange} = props

    const handleChange = (e) => {
        if (disabled) {
            return
        }

        const value = e.currentTarget.value

        onChange(value)
    }

    return (
        <SharedContainer>
            <SharedBody className='check-box-input'>
                <Row className='w-100 align-items-center justify-content-start'>
                    <Col md={6}>
                        <span className='check-box-input__label'>
                            {title}
                        </span>
                    </Col>
                    <Col>
                        <AvForm>
                            <AvCustomCheckbox
                                name='check-box'
                                classWrapper='d-flex'
                                disabled={disabled}
                                value={defaultValue}
                                onChange={handleChange}
                            />
                        </AvForm>
                    </Col>
                </Row>
            </SharedBody>
        </SharedContainer>
    )
}

CheckboxInput.defaultProps = {
    title: '',
    defaultValue: true,
    disabled: false,
    onChange: () => {
    }
}

CheckboxInput.propTypes = {
    title: string,
    defaultValue: bool,
    disabled: bool,
    onChange: func
}

export default CheckboxInput
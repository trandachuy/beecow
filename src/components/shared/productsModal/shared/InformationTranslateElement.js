import React from 'react'
import i18next from "i18next";
import TitleTranslate from "../TitleTranslate";
import {FormValidate} from "../../../../config/form-validate";
import {AvField} from "availity-reactstrap-validation";
import GSEditor from "../../GSEditor/GSEditor";
import {bool, func, shape, string} from 'prop-types';

const InformationTranslateElement = (props) => {
    const {name, description, controller, onNameChange} = props

    return (
        <div>
            <TitleTranslate title={i18next.t('component.translate.information.title')}/>
            {controller.hasName && <AvField
                name='informationName'
                label={`${i18next.t("component.translate.information.name")}`}
                value={name}
                validate={{
                    ...FormValidate.required(),
                    ...FormValidate.minLength(0),
                    ...FormValidate.maxLength(100),
                }}
                onChange={onNameChange}
            />}
            <GSEditor
                name='informationDescription'
                label={`${i18next.t("component.translate.information.description")}`}
                isRequired={false}
                minLength={1}
                maxLength={100000}
                tabIndex={2}
                value={description}
            />
        </div>
    )
}

InformationTranslateElement.defaultProps = {
    name: '',
    description: '',
    controller: {
        hasName: true,
    },
    onNameChange: function () {}
}

InformationTranslateElement.propTypes = {
    name: string,
    description: string,
    controller: shape({
        hasName: bool,
    }),
    onNameChange: func
}

export default InformationTranslateElement
import './ElementEditorCommonBackground.sass'
import React, {useContext, useEffect, useRef, useState} from 'react';
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import {ImageUploadType} from "../../../../components/shared/form/ImageUploader/ImageUploader";
import GSButtonUpload from "../../../../components/shared/GSButtonUpload/GSButtonUpload";
import ThemeEngineUtils from "../ThemeEngineUtils";
import i18next from "i18next";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {bool, object} from "prop-types";

const IMAGE_RECOMMEND = {
    WIDTH: 1000,
    HEIGHT: 1000,
    ACCEPT: [{
        name: 'JPEG',
        enum: ImageUploadType.JPEG
    }, {
        name: 'PNG',
        enum: ImageUploadType.PNG
    }, {
        name: 'GIF',
        enum: ImageUploadType.GIF

    }, {
        name: 'GIF',
        enum: ImageUploadType.GIF

    }]
}
const BACKGROUND_TYPE = {
    IMAGE: 'IMAGE',
    COLOR: 'COLOR',
}

const ElementEditorCommonBackground = (props) => {
    const {currentComponent, disabled} = props
    const {dispatch} = useContext(ThemeMakingContext.context)

    const [stCurrentBackground, setStCurrentBackground] = useState()

    const refPickerColor = useRef(null);

    useEffect(() => {
        if (currentComponent && currentComponent.componentStyle) {
            const style = currentComponent.componentStyle;
            const backgroundStyle = ThemeEngineUtils.getStylesByKeys(style, ['background-color', 'background-image'])

            if (backgroundStyle['background-image']) {
                setStCurrentBackground(backgroundStyle['background-image'])
            } else if (backgroundStyle['background-color']) {
                setStCurrentBackground(backgroundStyle['background-color'])
            }
        } else {
            setStCurrentBackground(null)
        }
    }, [currentComponent]);

    const onOpenPickerColor = () => {
        refPickerColor.current.click();
    }

    const updateBackgroundStyle = (style) => {
        if (disabled) {
            return
        }

        dispatch(ThemeMakingContext.actions.setReturnComponent({
            ...currentComponent,
            componentStyle: ThemeEngineUtils.upsertStyleByValues(currentComponent.componentStyle, style)
        }));
    }

    const onChangeColor = _.debounce((event) => {
        updateBackgroundStyle(`background-color: ${refPickerColor.current.value}`)
        setStCurrentBackground(refPickerColor.current.value)
    }, 300)

    const onFileUploaded = (files) => {
        const link = URL.createObjectURL(files[0]);
        updateBackgroundStyle(`background-image: url('${link}');background-repeat: no-repeat;background-position: center;background-size: 100% 100%;`)
        setStCurrentBackground(`url(${link})`)
    }

    const getBackgroundType = () => {
        const colorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/

        if (colorRegex.test(stCurrentBackground)) {
            return BACKGROUND_TYPE.COLOR
        }

        return BACKGROUND_TYPE.IMAGE
    }

    return (
        <div className={[
            "element-editor-common-background",
            disabled ? "disabled" : ""
        ].join(' ')}>
            <div className="label">
                <GSTrans t='component.themeEditor.subElement.img.title'/>
            </div>

            <div className="btn-change-background">
                <GSButtonUpload
                    className="btn-change"
                    icon={true}
                    text={i18next.t('component.themeEditor.imagePicker.button.image')}
                    onUploaded={onFileUploaded}
                    accept={IMAGE_RECOMMEND.ACCEPT.map(item => item.enum)}
                />
                <div className="btn-change color" onClick={onOpenPickerColor}>
                    <input className='d-none' type="color" ref={refPickerColor}
                           onChange={e => onChangeColor(e)}/>
                    <GSTrans t='component.themeEditor.imagePicker.button.color'/>
                </div>
                <div className="back-ground-preview" style={{
                    backgroundImage: getBackgroundType() === BACKGROUND_TYPE.IMAGE && `${stCurrentBackground}`,
                    backgroundColor: getBackgroundType() === BACKGROUND_TYPE.COLOR && stCurrentBackground,
                    backgroundSize: 'auto 100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }}/>
            </div>
        </div>
    );
};

ElementEditorCommonBackground.defaultProps = {
    currentComponent: {},
    disabled: false
}

ElementEditorCommonBackground.propTypes = {
    currentComponent: object,
    disabled: bool
}


export default ElementEditorCommonBackground

import './EmbeddedCodeInput.sass'

import React, {useEffect, useRef, useState} from 'react'
import SharedContainer from './SharedContainer';
import SharedHeader from './SharedHeader';
import GSTrans from '../../../../../components/shared/GSTrans/GSTrans';
import SharedBody from './SharedBody';
import {bool, func, number, string} from 'prop-types';
import GSEditor from '../../../../../components/shared/GSEditor/GSEditor';
import {AvForm} from 'availity-reactstrap-validation';
import GSModal from '../../../../../components/shared/GSModal/GSModal';
import GSButton from '../../../../../components/shared/GSButton/GSButton';
import ThemeEngineConstants from '../../ThemeEngineConstants';
import ThemeEngineUtils from '../../ThemeEngineUtils';
import {v4 as uuidv4} from 'uuid'

const EmbeddedCodeInput = (props) => {
    const {rows, defaultValue, title, onChange, preValidate, required, codeType} = props

    const refModal = useRef()
    const [stError, setStError] = useState()
    const [stValue, setStValue] = useState()
    const [stHtmlMode, setStHtmlMode] = useState(true)

    const validate = (value) => {
        setStError()

        const errorText = ThemeEngineUtils.checkHTML(value)

        if (preValidate(value) && !errorText) {
            if (!required) {
                return false
            }
            if (_.isString(value)) {
                const clean = value.trim()

                if (!_.isEmpty(clean)) {
                    return false
                }
            }
        }

        setStError(errorText)

        return true
    }

    useEffect(() => {
        setStValue(defaultValue)
        validate(defaultValue)
    }, [defaultValue])

    const handleText = (value) => {
        return Promise.resolve(value)
            .then(html => html.replaceAll('&nbsp;', ' '))
            .then(html => ThemeEngineUtils.closingHtmlTag(html))
            .then(html => {
                setStValue(html);

                if (validate(html)) {
                    return Promise.reject()
                }

                onChange(html);
            })
    }

    const okModal = () => {
        handleText(stValue)
            .then(() => refModal.current.close())
    }

    const cancelModal = () => {
        refModal.current.close();
    }

    const openModal = () => {
        setStHtmlMode(true)
        refModal.current.open();
    }

    return (
        <>
            <SharedContainer>
                <SharedHeader hidden={codeType === ThemeEngineConstants.CODE_TYPE.FREE_HTML.id}>
                    {title || <GSTrans t='component.themeEditor.embeddedCodeInput.title'/>}
                </SharedHeader>
                <SharedBody>
                    {
                        codeType === 'FREE_HTML'
                        ? <textarea
                            className={['embedded-code-input__input cursor--pointer', stError ? 'embedded-code-input__error' : ''].join(' ')}
                            rows={rows}
                            defaultValue={defaultValue}
                            value={stValue}
                            onClick={openModal}
                        />
                        : <div className="d-flex flex-column">
                                <textarea
                                    className={ ['embedded-code-input__input', stError ? 'embedded-code-input__error' : ''].join(' ') }
                                    rows={ rows }
                                    defaultValue={ defaultValue }
                                    onBlur={ (e) => handleText(e.target.value) }
                                />
                                {
                                    stError && <span className="error">{ stError }</span>
                                }
                            </div>
                    }
                </SharedBody>
            </SharedContainer>
            <GSModal
                ref={refModal}
                isCustom={true}
                title={<div style={{"color": "#fff"}}>
                    <GSTrans t='component.themeEditor.embeddedCodeInput.modal.title'/>
                    <br/>
                    <GSTrans t='component.themeEditor.embeddedCodeInput.title1'/>
                </div>}
                footer={<>
                    <GSButton secondary outline onClick={cancelModal}>
                        <GSTrans t={"component.themeEditor.embeddedCodeInput.modal.cancel"}/>
                    </GSButton>
                    <GSButton key={uuidv4()} disabled={stHtmlMode} success marginLeft onClick={okModal}>
                        <GSTrans t={"component.themeEditor.embeddedCodeInput.modal.apply"}/>
                    </GSButton>
                </>}
                content={<AvForm className='w-100'>
                    <GSEditor
                        viewCode = "html"
                        isHtmlView = {(isHtml) => {
                            setStHtmlMode(isHtml);
                        }}
                        name='embeddedCode'
                        className={['embedded-code-input__input', stError ? 'embedded-code-input__error' : ''].join(' ')}
                        error={ stError }
                        value={defaultValue}
                        onChange={handleText}/>
                </AvForm>}
            ></GSModal>
        </>
    )
}

EmbeddedCodeInput.defaultProps = {
    rows: 6,
    required: false,
    defaultValue: '',
    title: '',
    preValidate: () => true,
    codeType: '',
    onChange: () => {
    }
}

EmbeddedCodeInput.propTypes = {
    rows: number,
    required: bool,
    defaultValue: string,
    title: string,
    preValidate: func,
    codeType: string,
    onChange: func
}

export default EmbeddedCodeInput

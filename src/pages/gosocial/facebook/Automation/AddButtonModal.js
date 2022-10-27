import React, {useEffect, useRef, useState} from 'react';
import "./AddButtonModal.sass"
import PropTypes, {array, bool, func, number, string} from 'prop-types';
import i18next from "i18next";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import {AvField, AvForm} from "availity-reactstrap-validation";
import {FormValidate} from "../../../../config/form-validate";
import {Button, Overlay, OverlayTrigger, Popover, Tooltip} from "react-bootstrap";

const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

const AddButtonModal = props => {

    const [stListButton, setStListButton] = useState([])
    const [stListButtonModal, setStListButtonModal] = useState([])
    const [stDropdown, setStDropdown] = useState(null)
    const [stDataModal, setStDataModal] = useState({})
    const [stCountButton, setStCountButton] = useState(1)
    


    const refMouseLeave = useRef(false)
    const refIsButton0 = useRef(null)
    const refIsButton1 = useRef(null)
    const refIsButton2 = useRef(null)
    
    useEffect(()=>{
        if (props.listButton){
            setStListButtonModal(_.cloneDeep(props.listButton))
            setStListButton(_.cloneDeep(props.listButton))
        }
    },[props.listButton])

    useEffect(()=>{
        setStListButtonModal(_.cloneDeep(stListButton))
        switch (stDropdown) {
            case 0:
                refIsButton0.current.click()
                setStDropdown(null)
                break
            case 1:
                refIsButton1.current.click()
                setStDropdown(null)
                break
            case 2:
                refIsButton2.current.click()
                setStDropdown(null)
                break
        }
    },[props.onScrollMessenger])

    const handleAddButtonText = (e) =>{
        e.preventDefault()
        if(props.campaignStatus){
            return;
        }
        // const textNumber = stListButtonText.filter(textId=>textId.id ===id).length + 1
        const dataButtontext = {
            title:`Button #${stCountButton}`,
            url:"https://www.gosell.vn/"
        }

        setStListButtonModal(lbt=> {
            setStListButton(_.cloneDeep([...lbt,dataButtontext]))
            props.submitButton(_.cloneDeep([...lbt,dataButtontext]),props.index,props.productIndex,props.status)
            return [...lbt,dataButtontext]
        })

        setStCountButton(num=> num + 1)


    }

    const handleOpenPopupBtn = (e,value,index) =>{
        e.preventDefault()
        switch (stDropdown) {
            case 0:
                refIsButton0.current.click()
                break
            case 1:
                refIsButton1.current.click()
                break
            case 2:
                refIsButton2.current.click()
                break
        }
        setStDropdown(index)
        setStDataModal(value)
    }

    const handleSubmit = (e) => {
        if(props.campaignStatus){
            return;
        }
        
        if(!isValidURL(stListButtonModal[stDropdown].url) &&
            stListButtonModal[stDropdown].url &&
            stListButtonModal[stDropdown].url != ""){
            return
        }

        if(stListButtonModal[stDropdown].url === ""){
            return;
        }
        
        
        switch (stDropdown) {
            case 0:
                refIsButton0.current.click()
                setStDropdown(null)
                break
            case 1:
                refIsButton1.current.click()
                setStDropdown(null)
                break
            case 2:
                refIsButton2.current.click()
                setStDropdown(null)
                break
        }
        props.submitButton(_.cloneDeep(stListButtonModal),props.index,props.productIndex,props.status)
        setStListButton(_.cloneDeep(stListButtonModal))
    }
    

    const handleCancel = (e) => {
        e.preventDefault(); // avoid fire submit action
        setStListButtonModal(_.cloneDeep(stListButton))
        switch (stDropdown) {
            case 0:
                refIsButton0.current.click()
                setStDropdown(null)
                break
            case 1:
                refIsButton1.current.click()
                setStDropdown(null)
                break
            case 2:
                refIsButton2.current.click()
                setStDropdown(null)
                break
        }
    }

    const handleDelete = (e) => {
        e.preventDefault(); // avoid fire submit action

        if(props.campaignStatus){
            return;
        }
        
        setStListButtonModal(lbt => {
            lbt.splice(_.cloneDeep(stDropdown), 1)
            setStListButton(_.cloneDeep(lbt))
            return lbt;
        })
        

        switch (_.cloneDeep(stDropdown)) {
            case 0:
                refIsButton0.current.click()
                setStDropdown(null)
                break
            case 1:
                refIsButton1.current.click()
                setStDropdown(null)
                break
            case 2:
                refIsButton2.current.click()
                setStDropdown(null)
                break
        }

        props.submitButton(_.cloneDeep(stListButtonModal),props.index,props.productIndex,props.status)
    }

    const handleChangeTitle = (e) =>{
        const value = e.target.value
        setStListButtonModal(lbt=>{
            lbt[stDropdown].title = value
            return lbt
        })
    }

    const handleChangeUrl = (e) =>{
        const value = e.target.value
        setStListButtonModal(lbt=>{
            lbt[stDropdown].url = value
            return lbt
        })
    }

    const isValidURL = (string) => {
        let res = string.match(/(https?):\/\/(-\.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        return (res !== null)
    };
    
    
    
    const renderButton = (value, index) =>{
        switch (index) {
            case 0:
                return (
                    <button ref={refIsButton0} className="btn btned" onClick={e =>handleOpenPopupBtn(e, value, index)}>{value.title}</button>
                )
                break
            case 1:
                return (
                    <button ref={refIsButton1} className="btn btned" onClick={e =>handleOpenPopupBtn(e, value, index)}>{value.title}</button>
                )
                break
            case 2:
                return (
                    <button ref={refIsButton2} className="btn btned" onClick={e =>handleOpenPopupBtn(e, value, index)}>{value.title}</button>
                )
                break
        }
    }


    const renderModalBtn = (value, index) =>{
        return(
            <AvForm
                key={index}
                tabIndex="0"
                onMouseLeave={() => refMouseLeave.current = true}
                onMouseEnter={() => refMouseLeave.current = false}
                onBlur={e => refMouseLeave.current && handleCancel(e)}
            >
                <div className='d-flex align-items-center cursor--pointer'>
                    <div className="dropdown w-100 p-0">
                        <OverlayTrigger
                            trigger="click"
                            placement={getWindowDimensions().width > 1159 ? 'right' : "top"}
                            overlay={
                                <Popover id={`popover-positioned`}>
                                    <div
                                        className="box-modal-button"
                                    >
                                        <h3 className="m-0">
                                            {i18next.t('page.gochat.facebook.automation.replyInMessenger.button')}
                                        </h3>
                                        <div className="container">
                                            <AvField
                                                disabled={props.campaignStatus}
                                                name="title"
                                                label={i18next.t('page.gochat.facebook.automation.replyInMessenger.button.title')}
                                                value={stDataModal?.title}
                                                validate={{
                                                    ...FormValidate.maxLength(20)
                                                }}
                                                onChange={e=>handleChangeTitle(e)}
                                            />

                                            <AvField
                                                disabled={props.campaignStatus}
                                                name="url"
                                                label={i18next.t('page.gochat.facebook.automation.replyInMessenger.button.linkURL')}
                                                placeholder={i18next.t('page.gochat.facebook.automation.replyInMessenger.button.linkURL')}
                                                onBlur={e=>handleChangeUrl(e)}
                                                value={stDataModal.url}
                                                validate={{
                                                    ...FormValidate.required(),
                                                    ...FormValidate.withCondition(
                                                        true,
                                                        FormValidate.pattern.custom(/(https?):\/\/(-\.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
                                                            'page.gochat.facebook.automation.replyInMessenger.urlValid')
                                                    ),
                                                }}

                                            />
                                        </div>

                                        <div className="gsButton">
                                            <GSButton onClick={handleDelete} secondary outline>
                                                <Trans i18nKey="common.btn.delete"/>
                                            </GSButton>
                                            <GSButton onClick={(e)=>{
                                                handleSubmit(e)
                                                e.preventDefault()
                                            }} success marginLeft >
                                                <Trans i18nKey="common.btn.done"/>
                                            </GSButton>
                                        </div>

                                    </div>
                                </Popover>
                            }
                        >
                            
                            {renderButton(value, index)}
                            
                        </OverlayTrigger>
                    </div>
                </div>
            </AvForm>
        )

    }

    return (
        <div className="add-button-auto-response">
            {
                stListButton.map((value,index) => {
                    return(
                        <div className="container-add-button" key={index}>
                            {renderModalBtn(value,index)}
                        </div>

                    )
                })
            }
            {stListButton.length < 3 &&
            <div className={props.switchCampaignStatus && !props.isButton ? "add-btn add-btn-error" : "add-btn" }>
                <button disabled={props.campaignStatus} className="btn" onClick={e =>handleAddButtonText(e)}>+ {i18next.t('page.gochat.facebook.automation.replyInMessenger.addButton')}</button>
            </div>
            }
            {props.switchCampaignStatus && !props.isButton &&
            <div className="add-error">
                {props.type === 'text' &&
                    <p>{i18next.t('page.facebook.broadcast.replyInMessenger.button.error')}</p>
                }
                {props.type === 'product' &&
                <p>{i18next.t('page.facebook.broadcast.replyInMessenger.button.error2')}</p>
                }
            </div>}
        </div>
    );
};


AddButtonModal.defaultProps = {}

AddButtonModal.propTypes = {
    submitButton: func,
    index:number,
    status:string,
    productIndex:number,
    listButton:array,
    campaignStatus:bool,
    isButton:bool,
    switchCampaignStatus:bool,
    onScrollMessenger:number,
    type:string
}

export default AddButtonModal;

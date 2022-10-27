/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/05/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types'
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import moment from "moment";
import {CallHistoryStatusEnum} from "../../../../../models/CallHistoryStatusEnum";
import GSStatusTag from "../../../../../components/shared/GSStatusTag/GSStatusTag";
import i18next from "i18next";
import './CustomerEditorActivityItem.sass'
import GSFakeLink from "../../../../../components/shared/GSFakeLink/GSFakeLink";
import {cn} from "../../../../../utils/class-name";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import callCenterService from "../../../../../services/CallCenterService";
import GSComponentTooltip from "../../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import {ImageUploadType} from "../../../../../components/shared/form/ImageUploader/ImageUploader";
import {GSToast} from "../../../../../utils/gs-toast";
import GSImg from "../../../../../components/shared/GSImg/GSImg";
import GSActionButton, {GSActionButtonIcons} from "../../../../../components/shared/GSActionButton/GSActionButton";
import {ImageUtils} from "../../../../../utils/image";
import mediaService, {MediaServiceDomain} from "../../../../../services/MediaService";

const MAX_NOTE_SIZE = 5
const CustomerEditorActivityItem = props => {
    const [stCommentMode, setStCommentMode] = useState(false);
    const [stCmtList, setStCmtList] = useState(props.history.comments);
    const [stCmtValue, setStCmtValue] = useState('');
    const [stCmtType, setStCmtType] = useState('TEXT');
    const [stOnViewMore, setStOnViewMore] = useState(false);
    const [stSending, setStSending] = useState(false);
    const [stUploadedImage, setStUploadedImage] = useState(null);

    const refTextArea = useRef(null);
    const refInputFile = useRef(null);


    useEffect(() => {
        if (stCmtList.length >= MAX_NOTE_SIZE) {
            setStCommentMode(false)
        }
    }, [stCmtList]);


    const renderStatusTag = (status) => {
        let tagStyle
        switch (status) {
            case CallHistoryStatusEnum.SUCCESSFUL:
                tagStyle = GSStatusTag.STYLE.SUCCESS
                break
            case CallHistoryStatusEnum.DECLINED:
                tagStyle = GSStatusTag.STYLE.DANGER
                break
            case CallHistoryStatusEnum.NON_SUCCESSFUL:
                tagStyle = GSStatusTag.STYLE.WARNING
                break
            default:
                tagStyle = GSStatusTag.STYLE.LIGHT
        }

        return <GSStatusTag text={i18next.t(`component.call.history.status.${status.toLowerCase()}`)} tagStyle={tagStyle}/>
    }

    /**
     * @param {CallHistoryNoteModel} note
     * */
    const renderNote = (note) => {
        switch (note.contentType) {
            case 'TEXT':
                return (
                    <p className="mb-2">
                        {note.content}
                    </p>
                )
            case 'IMAGE':
                return (
                    <p>
                        <a href={note.content} rel="noopener noreferrer" target="_blank" className="cursor--pointer">
                            <GSImg src={note.content} height={100}/>
                        </a>
                    </p>

                )
            case 'MD':
                let imageUrl = note.content.match(/(\!\[alt text\]\()(.*?)(\))/g)[0]
                imageUrl = imageUrl.replace(/(\!\[alt text\]\()|(\))/g, '')
                const content = note.content.replace(/(\!\[alt text\]\()(.*?)(\))/g, '')
                return (
                        <p>
                            <span style={{maxWidth: '20rem', display: 'inline-block'}}>
                                {content}
                            </span>
                            <a href={imageUrl} rel="noopener noreferrer" target="_blank" className="cursor--pointer d-block">
                                <GSImg src={imageUrl} height={100}/>
                            </a>
                        </p>
                )
        }
    }

    const toggleCommentMode = () => {
        if (stCmtList.length >= MAX_NOTE_SIZE) return
        setStCommentMode(mode => !mode)
    }


    const onCancelNote = (e) => {
        e.preventDefault()
        toggleCommentMode()
    }

    const onUploaderChange = (e, v) => {
        let files = refInputFile.current.files
        if (!Array.isArray(files)) {
            files = [...files]
        }
        //filter wrong extension
        files = files.filter(file => {
            if ( [ImageUploadType.JPEG, ImageUploadType.PNG].includes(file.type)) { // => correct
                return true
            } else {
                GSToast.error(i18next.t("component.product.addNew.images.wrongFileType", {
                    fileName: file.name
                }))
                return false
            }
        })
        // filter size
        files = files.filter(file => {
            const sizeByMB = file.size / 1024 / 1024
            if (sizeByMB < 10) { // => correct
                return true
            } else {
                GSToast.error(i18next.t("component.product.addNew.images.maximumSize", {
                    fileName: file.name,
                    size: 10
                }))
                return false
            }
        })

        setStUploadedImage(files[0])
        setStCmtType('IMAGE')
    }


    const onChangeCmtValue = (value) => {
        setStCmtValue(value)
    }

    const onBlurTextArea = (e) => {
        const {value} = e.currentTarget
        onChangeCmtValue(value)
    }

    const onSendNote = async (e) => {
        e.preventDefault()

        /**
         * @type {CallHistoryNoteRequestModel}
         */
        const requestBody = {
            callHistoryId: props.history.id,
        }

        setStSending(true)
        requestBody.content = stCmtValue
        requestBody.contentType = 'TEXT'

        if (stUploadedImage) {
            try {
                const imgObj = await mediaService.uploadFileWithDomain(stUploadedImage, MediaServiceDomain.GENERAL)


                if (stCmtValue) {
                    requestBody.content += `![alt text](${ImageUtils.getImageFromImageModel(imgObj)})`
                    requestBody.contentType = 'MD'
                } else {
                    requestBody.content += ImageUtils.getImageFromImageModel(imgObj)
                    requestBody.contentType = 'IMAGE'
                }

            } catch (e) {
                GSToast.commonError()
                return
            }
        }





        callCenterService.sendCallHistoryNote(requestBody)
            .then(result => {
                setStCmtList([...stCmtList, result])
                if (refTextArea.current) {
                    refTextArea.current.value = ''
                }
                if (refInputFile.current) {
                    refInputFile.current.value = ''
                    setStUploadedImage(null)
                }

            })
            .finally(() => {
                setStSending(false)
            })
    }

    const toggleViewMore = () => {
        setStOnViewMore(viewMore => !viewMore)
    }

    const onClickUploadImage = () => {
        refInputFile.current.click()
    }

    const onClickRemoveImage = () => {
        setStUploadedImage(null)
        refInputFile.current.value = ''
        setStCmtType('TEXT')
    }

    const canSave = () => {
        if (stUploadedImage) { // => image mode
            return true
        } else { // text mode -> check text length
            if (stCmtValue.length > 0) {
                return true
            }
        }
        return false
    }

    return (
        <div className="customer-editor-activity-list__item customer-editor-activity-item mb-3">
            <div>
                <strong className="customer-editor-activity-list__history-type">
                    <GSTrans t={`component.call.history.type.${props.history.type}`}/>
                </strong>

                {renderStatusTag(props.history.status)}

                <strong className="pl-3 customer-editor-activity-list__history-start-time color-gray">
                    {moment(props.history.timeStarted).format('HH:mm a')}
                </strong>
            </div>
            <div className="mt-2">
                <strong className="customer-editor-activity-item__outgoing-to">
                    <GSTrans t="page.customers.edit.activity.outgoingTo"
                             values={{
                                 phone: props.history.toNumberPhone
                             }}/>
                </strong>
            </div>
            {props.history.status === CallHistoryStatusEnum.SUCCESSFUL &&
                <div className="mt-2 color-gray">
                    {props.history.recordingUrl && <a href={props.history.recordingUrl} target="_blank" rel="noreferrer noopener">
                        <img src="/assets/images/icon_CallRecording.svg"
                             alt="call"
                             width="18px"
                             className="mr-2 gsa-hover--fadeOut cursor--pointer"
                        />
                    </a>}
                    <GSTrans t="page.customers.edit.activity.duration" values={{
                        m: Math.floor(props.history.duration / 60),
                        s: props.history.duration % 60
                    }}/>
                </div>
            }
            <div className="mt-2 d-flex">
                <GSComponentTooltip message={i18next.t(stCmtList.length >= MAX_NOTE_SIZE? 'page.customers.edit.activity.maximumNotes':'page.customers.edit.activity.createNote')}>
                    <img src="/assets/images/icon-material-chat.svg"
                         width="15px"
                         alt="comments"
                         className={cn("customer-editor-activity-item__comment-icon align-self-start",
                             {
                                 'customer-editor-activity-item__comment-icon--active': stCommentMode,
                             },
                             {
                                 'customer-editor-activity-item__comment-icon--max': stCmtList.length >= MAX_NOTE_SIZE,
                             })}
                         onClick={toggleCommentMode}
                    />
                </GSComponentTooltip>

                <div className="px-2 w-100">
                    {stCmtList.length > 0 && !stOnViewMore &&
                        renderNote(stCmtList[stCmtList.length-1])
                    }
                    {stCmtList.length > 1 && !stOnViewMore &&
                        <GSFakeLink onClick={toggleViewMore}>
                            <GSTrans t="page.customers.edit.activity.viewMore" values={{size: stCmtList.length}}/>
                        </GSFakeLink>
                    }

                    {stOnViewMore &&
                        stCmtList.map( (cmt, index) => {
                            return (
                                <div key={cmt.id}>
                                    {renderNote(cmt)}
                                    {index < stCmtList.length && <hr/>}
                                </div>
                            )
                        })
                    }
                    {stCmtList.length > 1 && stOnViewMore &&
                    <GSFakeLink onClick={toggleViewMore}>
                        <GSTrans t="page.customers.edit.activity.viewLess"/>
                    </GSFakeLink>
                    }
                    {stCommentMode && stCmtList.length < MAX_NOTE_SIZE &&
                        <>
                            <hr/>
                            <div className={cn("mt-2", {
                                'gsa--glow-effect': stSending
                            })}
                            >
                                {
                                    <textarea className="form-control " maxLength="100" onChange={onBlurTextArea} ref={refTextArea}>
                                    </textarea>
                                }

                                {stUploadedImage &&
                                    <div className="customer-editor-activity-item__image-wrapper mt-3">
                                        <GSImg src={stUploadedImage} height={100}/>
                                    </div>
                                }

                                <div className="d-flex justify-content-between mt-2">
                                    <input type="file"
                                           accept={ImageUploadType.JPEG + ',' + ImageUploadType.PNG}
                                           ref={refInputFile}
                                           hidden
                                           onChange={onUploaderChange}
                                    />
                                    {!stUploadedImage &&
                                        <img src="/assets/images/default_image.png"
                                             width="16px"
                                             height="16px"
                                             className="mt-2 gsa-hover--fadeOut cursor--pointer"
                                             alt="upload"
                                             onClick={onClickUploadImage}
                                        />
                                    }
                                    {stUploadedImage &&
                                        <span className="d-flex align-items-center">
                                            <GSActionButton icon={GSActionButtonIcons.CLOSE}
                                                            width="12px"
                                                            onClick={onClickRemoveImage}
                                                            className="mr-2"
                                            />
                                            {ImageUtils.ellipsisFileName(stUploadedImage.name)}
                                        </span>
                                    }
                                    <div className="d-flex">
                                        <GSButton success size="small" onClick={onSendNote} disabled={!canSave()}>
                                            {stSending &&
                                                <div className="spinner-border spinner-border-sm text-light mr-2"/>
                                            }
                                            <GSTrans t={"common.btn.send"}/>
                                        </GSButton>
                                        <GSButton secondary outline marginLeft onClick={onCancelNote}  size="small">
                                            <GSTrans t={"common.btn.cancel"}/>
                                        </GSButton>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                </div>
            </div>

        </div>
    );
};



CustomerEditorActivityItem.propTypes = {
    /**
     * @type {CallHistoryIncludeNote}
     */
    history: PropTypes.shape({
        id: PropTypes.string,
        duration: PropTypes.number,
        storeId: PropTypes.number,
        customerId: PropTypes.number,
        customerName: PropTypes.string,
        toNumberPhone: PropTypes.string,
        status: PropTypes.string,
        type: PropTypes.string,
        recordingUrl: PropTypes.string,
        fromExtension: PropTypes.string,
        callBy: PropTypes.string,
        callById: PropTypes.number,
        callId: PropTypes.number,
        timeStarted: PropTypes.string,
        timeEnd: PropTypes.string,
        comments: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number,
            callHistoryId: PropTypes.number,
            content: PropTypes.string,
            contentType: PropTypes.string,
            createdBy: PropTypes.string,
            createdDate: PropTypes.string,
            lastModifiedBy: PropTypes.string,
            lastModifiedDate: PropTypes.string
        }),),
    }),
};

export default CustomerEditorActivityItem;

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/09/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import React, {useImperativeHandle, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import i18n from "../../../../config/i18n";
import GSImg from "../../../../components/shared/GSImg/GSImg";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {ZaloChatService} from "../../../../services/ZaloChatService";
import {GSToast} from "../../../../utils/gs-toast";
import {ImageUploadType} from "../../../../components/shared/form/ImageUploader/ImageUploader";
import i18next from "i18next";
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";
import {ImageUtils} from "../../../../utils/image";
import styled from 'styled-components'
import LiveChatEmojiSelector from "../../../live-chat/conversation/chat-box/emoji/LiveChatEmojiSelector";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const ChatInput = styled.input`
  border: unset !important;
  outline: none !important;
  padding: 0 .5rem 0 .25rem;
  width: 100%;
`

const ChatExtendButton = styled.div`
  margin: 0 .25rem;
  cursor: pointer;
  
  &:hover {
    opacity: .8;
  }
  
  img {
    height: 22px;
    width: 22px;
  }
`

const ChatEmojiWrapper = styled.section.attrs(props => ({
    isOpen: props.isOpen
}))`
  position: absolute;
  right: 0;
  top: ${props => props.isOpen? '-275px':'-265px'};
  opacity: ${props => props.isOpen? '1':'0'};
  padding: .7rem;
  border-radius: 0 5px 0 0;
  background-color: white;
  max-width: 300px;
  border: 1px solid #E2E5ED;
  transition-duration: 200ms;
  transition-property: all;
  transition-timing-function: ease-in-out;
  z-index: 2;
  display:  ${props => props.isOpen? 'block':'none'};;
`

const ChatWrapper = styled.section`
  display: flex;
  align-items: center;
  padding: .5rem;
  background-color: white;
  height: 74px;
  position: relative;
  z-index: 2;
`

const ChatBoxImagePreview = styled.section`
  display: flex;
  align-items: center;
  
  img {
    border-radius: .5rem;
    width: 2.5rem;
    height: 2.5rem;
    margin-left: .25rem;
  }
  
  svg {
    transform: scale(1.5);
    color: lightgrey;
  }
  
  span {
    border-radius: .5rem;
    border: 1px solid lightgray;
    width: 2.5rem;
    height: 2.5rem;
    margin-left: .25rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`


const GoSocialChatBoxFooter = React.forwardRef( (props, ref) => {
    const refInputImageFile = useRef(null);
    const refInputAnyFile = useRef(null);
    const refInputMessage = useRef(null);
    const [stImageFile, setStImageFile] = useState(null);
    const [stAnyFile, setStAnyFile] = useState(null);
    const [stIsShowEmoji, setStIsShowEmoji] = useState(false);
    const [stSending, setStSending] = useState(false);

    useImperativeHandle(ref, () => ({
        reset: reset,
        startSending: startSending,
        stopSending: stopSending
    }));

    const reset = () => {
        if (refInputMessage.current) refInputMessage.current.value = ""
        if (refInputImageFile.current) refInputImageFile.current.value = ""
        if (refInputAnyFile.current) refInputAnyFile.current.value = ""
        setStAnyFile(null)
        setStImageFile(null)
        setStSending(false)
        setStIsShowEmoji(false)
    }
    
    const startSending = () => {
        setStSending(true)
    }    
    
    const stopSending = () => {
        setStSending(false)
    }

    const onKeyPressInputChatBox = (e) => {
        const key = e.key;
        if (key === 'Enter') {
            onSend('text')
        }
    }

    const onSelectEmoji = (emoji) => {
        refInputMessage.current.value = refInputMessage.current.value + emoji
        if (stIsShowEmoji) toggleEmoji()
    }

    const toggleEmoji = () => {
        setStIsShowEmoji(!stIsShowEmoji)
    }

    const onChangeChatBoxImage = (event) => {
        const file = event.currentTarget.files[0]
        if (file) {
            if ( [ImageUploadType.JPEG, ImageUploadType.PNG].includes(file.type)) { // => correct

            } else {
                GSToast.error(i18next.t("component.product.addNew.images.wrongFileType", {
                    fileName: file.name
                }))
                return false
            }

            const sizeByByte = file.size
            if (sizeByByte / 1024 / 1024 <= 2) {
                setStImageFile(file)
            } else {
                refInputImageFile.current.value = ""
                GSToast.error(i18next.t("common.validation.editor.image.size", {x: 2}))
            }
        }
    }

    const onChangeChatBoxAnyFile = (event) => {
        const file = event.currentTarget.files[0]
        if (file) {
            if ( [ImageUploadType.JPEG, ImageUploadType.PNG].includes(file.type)) { // => image
                onChangeChatBoxImage(event)
                return
            }

            const sizeByByte = file.size
            if (sizeByByte / 1024 / 1024 <= 5) {
                setStAnyFile(file)
            } else {
                refInputAnyFile.current.value = ""
                GSToast.error(i18next.t("common.validation.editor.image.size", {x: 5}))
            }
        }
    }


    /**
     * onSend
     * @param {'text'|'file'} type
     */
    const onSend = (type) => {
        if (type === "text") {
            props.onSendText(refInputMessage.current.value)
        }
        if (type === "file") {
            if (stImageFile) {
                props.onSendImage(stImageFile)

            }
            if (stAnyFile) {
                props.onSendFile(stAnyFile)

            }
        }
    }

    if (props.expired) {
        if (props.expiredComponent) {
            return props.expiredComponent
        } else {
            return (
                <div className='chat_footer'>
                    <div className='expired'>
                        <GSImg src='/assets/images/gosocial/warning.svg'/>
                        <div className='text'>
                        <span>
                            <GSTrans t='page.gosocial.conversation.error.expired'/>
                            &nbsp;
                            <a href='https://www.facebook.com/messages' target="_blank"><GSTrans t='page.gosocial.conversation.error.viewOnFb'/></a>
                        </span>
                        </div>
                    </div>
                </div>
            )
        }
    }

    if (!props.expired) {
        return (
            <ChatWrapper>
                <ChatEmojiWrapper isOpen={stIsShowEmoji}>
                    <LiveChatEmojiSelector
                        onSelect={onSelectEmoji}
                    />
                </ChatEmojiWrapper>
                {/*INPUT*/}
                {!stSending &&
                    <div className="flex-grow-1">
                        {!stImageFile && !stAnyFile && <ChatInput ref={refInputMessage}
                                                                  type="text"
                                                                  placeholder={i18n.t("social.facebook.title.chat")}
                                                                  onKeyPress={onKeyPressInputChatBox}
                                                                  onClick={() => {
                                                                      if (stIsShowEmoji) toggleEmoji()
                                                                  }}
                        />}

                        {stImageFile &&
                        <ChatBoxImagePreview>
                            <img src={URL.createObjectURL(stImageFile)} alt="preview"/>
                            <div className="ml-2">
                                {ImageUtils.ellipsisFileName(stImageFile.name, 30)}
                            </div>
                        </ChatBoxImagePreview>
                        }

                        {stAnyFile &&
                        <ChatBoxImagePreview>
                                    <span>
                                       <FontAwesomeIcon icon="file-alt"/>
                                    </span>
                            <div className="ml-2">
                                {ImageUtils.ellipsisFileName(stAnyFile.name, 30)}
                            </div>
                        </ChatBoxImagePreview>
                        }
                    </div>
                }
                {stSending &&
                    <div className="flex-grow-1">
                        <div className="spinner-border text-secondary" role="status" style={{
                            width: '1.2rem',
                            height: '1.2rem'
                        }}>
                        </div>
                        <span className="pl-2">
                            <GSTrans t="component.marketing.notification.dropdown.status.sending"/>{'...'}
                        </span>
                    </div>
                }
                {/*BUTTONS*/}
                {!stSending &&
                <div className="d-flex justify-content-around">
                    {!stImageFile && !stAnyFile &&
                    <>
                        <ChatExtendButton>
                            <input type="file"
                                   ref={refInputAnyFile}
                                   onChange={onChangeChatBoxAnyFile}
                                   hidden
                            />
                            <img src="/assets/images/icon_add_fb.png"
                                 alt="file"
                                 onClick={() => {
                                     refInputAnyFile.current.click()
                                     if (stIsShowEmoji) toggleEmoji()
                                 }}
                            />
                        </ChatExtendButton>
                        <ChatExtendButton>
                            <input type="file"
                                   ref={refInputImageFile}
                                   accept="image/png, image/jpeg"
                                   onChange={onChangeChatBoxImage}
                                   hidden
                            />
                            <img src="/assets/images/icon_image_fb.png"
                                 onClick={() => {
                                     refInputImageFile.current.click()
                                     if (stIsShowEmoji) toggleEmoji()
                                 }}
                                 alt="image"
                            />
                        </ChatExtendButton>
                        <ChatExtendButton onClick={toggleEmoji}>
                            <img src="/assets/images/icon_smile_fb.png" alt="emoji"/>
                        </ChatExtendButton>
                    </>
                    }

                    {(stImageFile || stAnyFile) &&
                    <>
                        <ChatExtendButton>
                            <img src="/assets/images/icon-delete.png" alt="file"
                                 onClick={() => {
                                     reset()
                                 }}
                            />
                        </ChatExtendButton>
                        <ChatExtendButton onClick={() => onSend('file')}>
                            <img src="/assets/images/gosocial-send.svg" alt="emoji"/>
                        </ChatExtendButton>
                    </>
                    }
                </div>}
            </ChatWrapper>
        )
    }
});

GoSocialChatBoxFooter.defaultProps = {
    onSendText: () => {},
    onSendImage: () => {},
    onSendFile: () => {},
}

GoSocialChatBoxFooter.propTypes = {
    expired: PropTypes.bool,
    expiredComponent: PropTypes.element,
    onSendText: PropTypes.func,
    onSendImage: PropTypes.func,
    onSendFile: PropTypes.func,
};

export default GoSocialChatBoxFooter;

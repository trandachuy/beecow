/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 23/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import './LiveChatEmojiSelector.sass'
import Emoji from 'react-emoji-render'
import emojiData from './emoji.json'

const EMOJI =  emojiData


const LiveChatEmojiSelector = props => {
    const [stCurrentTab, setStCurrentTab] = useState(Object.keys(EMOJI)[0]);

    const onChangeTab = (key) => {
        setStCurrentTab(key)
    }

    const onSelect = (emoji) => {
        props.onSelect(emoji)
    }

    return (
        <div className="live-chat-emoji-selector">
            {Object.keys(EMOJI).map(objectKey => {
                return (
                    <>
                        {objectKey === stCurrentTab &&
                        <div className="live-chat-emoji-selector__emoji-group" key={'groups-' + objectKey}>
                            {
                                EMOJI[objectKey].data.split(' ').map((emoji, index) => {
                                return (
                                    <span className="live-chat-emoji-selector__emoji"
                                            key={objectKey + index}
                                          onClick={() => onSelect(emoji)}
                                    >
                                        <Emoji text={emoji}/>
                                    </span>
                                )})
                            }
                        </div>
                        }
                    </>
                )
            })}
            <div className="live-chat-emoji-selector__emoji-group-selector">
                {
                    Object.keys(EMOJI).map((objectKey, index) => {
                        return (
                            <span className={"live-chat-emoji-selector__emoji-group-icon " + (objectKey === stCurrentTab? 'live-chat-emoji-selector__emoji-group-icon--active':'')}
                                  key={objectKey}
                                  onClick={() => onChangeTab(objectKey)}
                            >
                                <Emoji text={EMOJI[objectKey].icon}/>
                            </span>
                        )
                    })
                }
            </div>
        </div>
    );
};

LiveChatEmojiSelector.propTypes = {
    onSelect: PropTypes.func,
};

export default LiveChatEmojiSelector;

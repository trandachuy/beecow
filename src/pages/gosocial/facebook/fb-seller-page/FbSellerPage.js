import React, {useReducer, useRef, useState, useContext} from 'react';
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import PropTypes from "prop-types";
import './FbSellerPage.sass'
import {FbMessengerContext} from "../context/FbMessengerContext";
import Constants from "../../../../config/Constant";

const FbSellerPage = props => {
    const {state, dispatch} = useContext(FbMessengerContext.context)
    const {listPageChat} = props;
    const [stToggle, setStToggle] = useState(false);
    const [stDefaultPageChat, setStDefaultPageChat] = useState(false);


    const handleToggle = () => {
        setStToggle(toggle => !toggle)
    }

    const handleChange = (item) => {
        setStDefaultPageChat(true)
        localStorage.setItem(Constants.STORAGE_KEY_LIVE_CHAT_PAGE_ID, item.pageId);
        dispatch(FbMessengerContext.actions.setfbUserDetail(item))
    }

    return (
        <>
                    <Dropdown className="page-selector" isOpen={stToggle} toggle={handleToggle}>
                        <DropdownToggle
                            className={["page-selector__button"].join(' ')} caret>
                            <span className='page-selector__button__label d-flex align-items-center'>
                                <img src={stDefaultPageChat ? state.fbUserDetail.avatar : listPageChat[0]?.avatar} width="30" height="30"/>
                                {stDefaultPageChat ? state.fbUserDetail.pageName : listPageChat[0]?.pageName}
                            </span>
                        </DropdownToggle>
                        <DropdownMenu className='page-selector__dropdown'>
                            {
                                listPageChat.map((item, index) => (
                                    <DropdownItem
                                        className='collection-selector__dropdown__item'
                                        key={index}
                                        onClick={() => handleChange(item)}
                                    >
                                        <img src={item.avatar} width="30" height="30"/>
                                        {item.pageName}
                                    </DropdownItem>
                                ))
                            }
                        </DropdownMenu>
                    </Dropdown>
                    <div className='header-name'>
                        <img src={stDefaultPageChat ? state.fbUserDetail.avatar : listPageChat[0]?.avatar} width="30" height="30"/>
                        <p className='title' style={{marginRight: '10px', marginBottom: '0'}}>
                            {stDefaultPageChat ? state.fbUserDetail.pageName : listPageChat[0]?.pageName}
                        </p>
                        {
                            state.unreadConversationNumber > 0 && <p className='total-chat'>
                                {state.unreadConversationNumber >= 10 ? '9+' : state.unreadConversationNumber}
                            </p>
                        }
                    </div>
        </>
    );
};

FbSellerPage.propTypes = {
    listPageChat: PropTypes.any
}

export default FbSellerPage;

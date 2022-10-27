import React, {useContext, useEffect, useRef, useState} from 'react';
import './NoteGosocial.sass';
import Constants from "../../../config/Constant";
import {Trans} from "react-i18next";
import PropTypes from 'prop-types';
import {AvField, AvForm} from "availity-reactstrap-validation";
import {FormValidate} from "../../../config/form-validate";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import storage from "../../../services/storage";
import facebookService from "../../../services/FacebookService";
import {GSToast} from "../../../utils/gs-toast";
import moment from "moment";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import Loading from "../../../components/shared/Loading/Loading";
import ConfirmModal, {ConfirmModalUtils} from "../../../components/shared/ConfirmModal/ConfirmModal";
import i18next from "i18next";
import zaloService from "../../../services/ZaloService";

const SIZE_PER_PAGE = 15

const NoteZalo = (props) => {
    const refDeteleNoteModal = useRef()
    
    const [stIsEditNote, setStIsEditNote] = useState([]);
    const [stNote, setStNote] = useState("");
    const [stNoteList, setStNoteList] = useState([]);
    const [stIsFetching, setStIsFetching] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [itemCount, setItemCount] = useState(0); 
    const [stLoadingNoteList, setStLoadingNoteList] = useState(false);
    const [stErroNote, setStErroNote] = useState(false);
    

    const backToPrevious = (callback) => {
        if (props.callback) {
            props.callback(callback);
        }
    }

    useEffect(() => {
        fetchNoteList(props.profileId,currentPage,SIZE_PER_PAGE)
    }, [])

    const fetchNoteList = (profileId,page,size) =>{
        zaloService.getAllNoteZalo(profileId,page,size).then(noteList=>{
            setItemCount(+(noteList.totalCount))
            setTotalPage(Math.ceil(parseInt(noteList.totalCount)/SIZE_PER_PAGE))
            setStNoteList([...stNoteList,...noteList.data])
        }).finally(()=>setStLoadingNoteList(false))
    }

    const handleValidSubmitNote = (event, value) =>{
        setStIsFetching(true)
        const dataNote = {
            createdDate:new Date(),
            profileId: props.profileId,
            storeId: +(storage.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)),
            note: value.note
        }

        zaloService.createNoteZalo(dataNote).then((note)=>{
            setStNote("")
            setStNoteList([note,...stNoteList])
            setItemCount(count=>count+1)
            GSToast.commonCreate()
            backToPrevious(false)
        })
            .catch(error => {
            if (error.response.data.message === "error.maximum.note"){
                setStErroNote(true)
            }
        })
            .finally(()=>{
            setStIsFetching(false)
        })
    }


    const handleValidSubmitEditNote = (event, value) =>{
        setStIsFetching(true)

        zaloService.updateNoteZalo(value).then((note)=>{
            let index = stNoteList.findIndex(id => id.id === note.id)
            if (index != -1){
                stNoteList[index] = note
                setStNoteList(stNoteList)
                handleCancelEditNote(event,note.id)
                GSToast.commonUpdate()
                backToPrevious(false)
            }
        }).finally(()=>{
            setStIsFetching(false)
        })
    }
    
    const handleChangeNote = (e) =>{
        setStNote(e.target.value)
    } 
    const handleEditNote = (id) =>{
        setStIsEditNote([...stIsEditNote,id])
    }
    
    const handleDeleteNote = (id) =>{
        ConfirmModalUtils.openModal(refDeteleNoteModal, {
            messages: <>
                <p className="">{i18next.t("gosocial.facebook.conversations.delete.modal.text")}</p>
            </>,
            modalTitle: i18next.t`common.txt.confirm.modal.title`,
            okCallback: () => {
                setStIsFetching(true)
                zaloService.deleteNoteZalo(id)
                    .then(()=>{
                        let filtered = stNoteList.filter((idNote)=> idNote.id !== id);
                        setStNoteList(filtered)
                        setItemCount(count=>count-1)
                        GSToast.commonDelete()
                        backToPrevious(false)
                        
                    }).finally(()=>setStIsFetching(false))
            },
        })
    }
    
    const handleCancelEditNote = (e,id) =>{
        e.preventDefault()
        const filtered = stIsEditNote.filter(idNote => idNote !== id);
        setStIsEditNote(filtered)
    }
    
    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }
    
    const scrollNoteList = (e) =>{
        const bottom = isBottom(e.currentTarget)
        if(bottom && currentPage <= totalPage && !stLoadingNoteList){
            setStLoadingNoteList(true)
            setCurrentPage(currentPage=>currentPage+1)
            fetchNoteList(props.profileId, currentPage+1 ,SIZE_PER_PAGE)
        }
    }


    return (
        <div className={'gosocial-chat-note'}>
            <ConfirmModal ref={refDeteleNoteModal} modalClass={"delete-note-facebook-modal"}/>
            {stIsFetching && <LoadingScreen zIndex={9999}/>}
            <div className='page-header d-flex pl-2 mb-3'>
                <img src="/assets/images/icon-arrow-back.png" onClick={()=>backToPrevious(true)}  className={'cursor--pointer'}/>
                <span className="section-title">
                    <Trans i18nKey="page.transfer.stock.list.note"/>{itemCount > 0 && `(${itemCount})`}
                </span>
            </div>
            <AvForm onValidSubmit={handleValidSubmitNote} autoComplete="off">
                <div className="pl-2 pr-2 w-100">
                    <AvField
                        name={"note"}
                        type={"textarea"}
                        validate={{
                            ...FormValidate.maxLength(300, true)
                        }}
                        onChange={handleChangeNote}
                        value={stNote}
                    />
                </div>
                { stErroNote &&
                    <p className="errorNote">{i18next.t("page.gosocial.error.note")}</p>
                }
                {stNote.length > 0 &&
                <div className={'d-flex justify-content-end mb-2'}>
                    <GSButton default buttonType="button"
                              onClick={e=>
                              {
                                  e.preventDefault()
                                  setStNote("")
                                  setStErroNote(false)
                              }
                              }>
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                    <GSButton marginLeft success>
                        <GSTrans t={"common.btn.save"}/>
                    </GSButton>
                </div>
                }
               
            </AvForm>

            <div onScroll={scrollNoteList} className='box_card gosocial-info-note'>
                {
                    stNoteList?.map((itemNote)=>{
                        return(
                            <div key={itemNote.id} className="gosocial-info-note-list">

                                {stIsEditNote != itemNote.id &&
                                <>
                                    <p>{itemNote.note}</p>
                                    <div className="d-flex justify-content-between">
                                        <div className="article-meta">
                                                    <span className="article-author">
                                                        {itemNote.staffName === '[shop0wner]' ? i18next.t('page.order.detail.information.shopOwner') : itemNote.staffName}
                                                    </span>
                                            <span className="article-publish pl-3">
                                                        {moment(itemNote.createdDate).format('HH:mm')}
                                                |
                                                {moment(itemNote.createdDate).format('DD/MM/YYYY')}
                                                    </span>
                                        </div>
                                        <div className='actions btn-group__action'>
                                            <i onClick={()=>handleEditNote(itemNote.id)} className="action-button first-button"></i>
                                            <i onClick={()=>handleDeleteNote(itemNote.id)} className="action-button lastest-button"></i>
                                        </div>
                                    </div>
                                </>
                                }

                                {stIsEditNote.find(idNote=>idNote===itemNote.id) &&
                                <>
                                    <AvForm onValidSubmit={handleValidSubmitEditNote} autoComplete="off">
                                        <div className="pl-2 pr-2 w-100">
                                            <AvField
                                                className="d-none"
                                                name={'createdDate'}
                                                value={new Date()}
                                            />
                                            <AvField
                                                className="d-none"
                                                name={"id"}
                                                value={itemNote.id}
                                            />
                                            <AvField
                                                className="d-none"
                                                name={"profileId"}
                                                value={itemNote.profileId}
                                            />
                                            <AvField
                                                className="d-none"
                                                name={"storeId"}
                                                value={itemNote.storeId}
                                            />
                                            <AvField
                                                name={"note"}
                                                type={"textarea"}
                                                validate={{
                                                    ...FormValidate.required(),
                                                    ...FormValidate.maxLength(300, true)
                                                }}
                                                value={itemNote.note}
                                            />
                                        </div>
                                        <div className={'d-flex justify-content-end mb-2'}>
                                            <GSButton default buttonType="button"
                                                      onClick={e=>handleCancelEditNote(e,itemNote.id)}>
                                                <GSTrans t={"common.btn.cancel"}/>
                                            </GSButton>
                                            <GSButton marginLeft success>
                                                <GSTrans t={"common.btn.save"}/>
                                            </GSButton>
                                        </div>
                                    </AvForm>
                                </>
                                }


                            </div>
                        )
                    })
                }

                {stLoadingNoteList &&
                <Loading />
                }

            </div>
            
        </div>
    )
}

export default NoteZalo;

NoteZalo.propTypes = {
    callback: PropTypes.func,
    profileId: PropTypes.number
}

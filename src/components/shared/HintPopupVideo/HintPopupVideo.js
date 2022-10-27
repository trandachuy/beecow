import React, {useEffect, useState} from "react";
import {Modal, ModalBody} from "reactstrap";
import './HintPopupVideo.sass'
import GSImg from "../GSImg/GSImg";
import PropTypes from "prop-types";
import {CredentialUtils} from '@utils/credential'

const SIZE_VIDEO={
    WIDTH:711,
    HEIGHT:400
}
const SIZE_THUMBNAIL={
    WIDTH: 180,
    HEIGHT: 140
}

const HintPopupVideo =(props)=>{
    const [isOpen, setIsOpen] = useState(false);
    const [urlVideo,setUrlVideo]=useState('');
    const [urlWiki,setUrlWiki]=useState('')
    const [urlThumbnail,setUrlThumbnail]=useState('');
    useEffect(()=>{

        switch (props.category){
            case 'CREATE_PRODUCT':
                setUrlVideo('https://www.youtube.com/embed/7KNK0yZk9hg')
                setUrlWiki('https://huongdan.gosell.vn/faq_category/quan-ly-san-pham-goweb/')
                break;
            case 'ADD_DEPOSIT':
                setUrlVideo("https://www.youtube.com/embed/dhm7_2_9zfQ")
                setUrlWiki('https://huongdan.gosell.vn/faq_category/quan-ly-san-pham-goweb/')
                break
            case 'INVENTORY_LIST':
                setUrlVideo("https://www.youtube.com/embed/x7ofcN0fVC0")
                setUrlWiki("https://huongdan.gosell.vn/faq_category/kho-hang-goweb/")
                break
            case 'PRODUCT_MANAGER':
                setUrlVideo("https://www.youtube.com/embed/FhSsBOw_6LU")
                setUrlWiki("https://huongdan.gosell.vn/faq_category/quan-ly-san-pham-goweb/")
                break
            case 'CREATE_SERVICE':
                setUrlVideo("https://www.youtube.com/embed/PhY-M_giqZU")
                setUrlWiki("https://huongdan.gosell.vn/faq_category/quan-ly-dich-vu-goweb/")
                break
            case 'ORDER':
                setUrlVideo("https://www.youtube.com/embed/mMmzmG1BLAc")
                setUrlWiki("https://huongdan.gosell.vn/faq_category/don-hang-goweb/")
                break
            case 'RESERVATION_MANAGEMENT':
                setUrlVideo("https://www.youtube.com/embed/vIz6NgaWhAA")
                setUrlWiki("https://huongdan.gosell.vn/faq_category/quan-ly-dich-vu-goweb/")
                break
            case 'PROMOTION_PRODUCT':
                setUrlVideo("https://www.youtube.com/embed/J75iwHe0DIU")
                setUrlWiki("https://huongdan.gosell.vn/faq_category/giam-gia-goweb/")
                break
            case 'PROMOTION_SERVICE':
                setUrlVideo('https://www.youtube.com/embed/5Jk7bcagB1c')
                setUrlWiki('https://huongdan.gosell.vn/faq/tao-ma-giam-gia-cho-dich-vu/')
                break
            case 'WHOLE_SALE_PRODUCT':
                setUrlVideo('https://www.youtube.com/embed/9Qep9oRVssM')
                setUrlWiki('https://huongdan.gosell.vn/faq_category/giam-gia-goweb/')
                break
            case 'WHOLE_SALE_SERVICE':
                setUrlVideo('https://www.youtube.com/embed/JeXyUDT0Aow')
                setUrlWiki('https://huongdan.gosell.vn/faq_category/giam-gia-goweb/')
                break
            case 'CUSTOMER_MANAGERMENT':
                setUrlVideo('https://www.youtube.com/embed/1-amjVdIsI4')
                setUrlWiki('https://huongdan.gosell.vn/faq_category/quan-ly-khach-hang-crm/')
                break
            case 'CREATE_SEGMENTS':
                setUrlVideo('https://www.youtube.com/embed/kPjTzoCrJyo')
                setUrlWiki('https://huongdan.gosell.vn/faq_category/phan-loai-doi-tuong-khach-hang/')
                break
            case 'CALL_CENTER':
                setUrlVideo('https://www.youtube.com/embed/02NK4UhnSvQ')
                setUrlWiki('https://huongdan.gosell.vn/gocall/')
                break
            case 'BUY_LINK':
                setUrlVideo('https://www.youtube.com/embed/X9_5zPqxFkc')
                setUrlWiki('https://huongdan.gosell.vn/faq/huong-dan-thiet-lap-link-mua-hang/')
                break
            case "EMAIL_CAMPAIGN":
                setUrlVideo('https://www.youtube.com/embed/ShJYiQtBaW0')
                setUrlWiki('https://huongdan.gosell.vn/faq/chien-dich-email-marketing-la-gi/')
                break
            case "PUSH_NOTIFICATIONS":
                setUrlVideo('https://www.youtube.com/embed/Kjlky56zvQ4')
                setUrlWiki('https://huongdan.gosell.vn/faq/goi-thong-bao-cho-khach-hang-chuong-trinh-khuyen-giam-gia-uu-dai-khuyen-mai/')
                break
            case "LOYALTY_PROGRAM":
                setUrlVideo("https://www.youtube.com/embed/9Q9EKqpWzVA")
                setUrlWiki("https://huongdan.gosell.vn/faq/huong-dan-tao-chuong-trinh-thanh-vien-than-thiet-2/")
                break
            case 'GOOGLE_ANALYTICS':
                setUrlVideo('https://www.youtube.com/embed/df5G7IXeojU')
                setUrlWiki('https://huongdan.gosell.vn/faq/cai-dat-google-analytics-website/')
                break
            case 'GOOGLE_SHOPPING':
                setUrlVideo('https://www.youtube.com/embed/iG4d-dZaxWc')
                setUrlWiki('https://huongdan.gosell.vn/faq/huong-dan-cai-dat-google-shopping-vao-website/')
                break
            case 'THEME_MANAGERMENT':
                setUrlVideo('https://www.youtube.com/embed/10mWTU4hSXE')
                setUrlWiki('https://huongdan.gosell.vn/faq_category/giao-dien-website/')
                break
            case 'BLOG_MANAGERMENT':
                setUrlVideo('https://www.youtube.com/embed/jDYKn25grhw')
                setUrlWiki('https://huongdan.gosell.vn/faq/huong-dan-tao-bai-viet-trong-blog-quan-ly-danh-muc-blog/')
                break
            case 'PAGE_MANAGERMENT':
                setUrlVideo('https://www.youtube.com/embed/y2Q7nH1sSE8')
                setUrlWiki('https://huongdan.gosell.vn/tao-trang-noi-dung-them-trang-noi-dung-moi/')
                break
            case 'REWARD_SECTION':
                setUrlVideo('https://www.youtube.com/embed/83b7UqfP8mw')
                setUrlWiki('https://huongdan.gosell.vn/faq_category/giam-gia-goweb/')
                break
            case 'BUY_LINK':
                setUrlVideo('https://www.youtube.com/embed/X9_5zPqxFkc')
                setUrlWiki('https://huongdan.gosell.vn/faq/huong-dan-thiet-lap-link-mua-hang/')
                break
            case 'ORDERS':
                setUrlVideo('https://www.youtube.com/embed/mMmzmG1BLAc')
                setUrlWiki('https://huongdan.gosell.vn/faq_category/don-hang-goweb/')
                break
        }
    },[])
    useEffect(()=>{
        setUrlThumbnail(`https://img.youtube.com/vi/${getIdVideoYoutube(urlVideo)}/0.jpg`)
    },[urlVideo])
    const getIdVideoYoutube=(url)=>{
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = url.match(regExp);
        return (match&&match[7].length==11)? match[7] : false;
    }
    const openPopupVideo=()=>{

        return <Modal isOpen={isOpen} className={"tutorial_video"}>
                <span className="close_modal" onClick={()=>setIsOpen(false)}></span>
            <ModalBody>
                <iframe width={SIZE_VIDEO.WIDTH} height={SIZE_VIDEO.HEIGHT} src={urlVideo}
                        title={props.title} frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen></iframe>
            </ModalBody>
        </Modal>
    }
    const showThumbnail=()=>{
        return <div className='thumbnail' >
            <div className={'triangle'}></div>
            <div className={'border-thumbnail'}>
                <div className='thumbnail_image' onClick={()=>setIsOpen(true)}>
                    <GSImg src={urlThumbnail}/>
                </div>
                <h6 onClick={()=>setIsOpen(true)}>{props.title}</h6>
                <a href={urlWiki} target="_blank">View more in wiki</a>
            </div>

        </div>
    }
    return (
       <div className="hint-popup-video">
           {!CredentialUtils.isStoreXxxOrGoSell() && <>
               <img src={"/assets/images/icon_video.svg"} className="fas fa-play" onClick={()=>setIsOpen(true)} alt="" />
               {showThumbnail()}
               {openPopupVideo()}
           </>}
       </div>
    )
}
HintPopupVideo.defaultProps = {
    title:'',
    category:''
}
HintPopupVideo.propTypes={
    title:PropTypes.string,
    category:PropTypes.string
}
export default HintPopupVideo;

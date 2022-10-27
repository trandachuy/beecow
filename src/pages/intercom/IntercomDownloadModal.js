import './IntercomDownloadModal.sass'

import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import GSImg from "../../components/shared/GSImg/GSImg"
import phoneScreen from '../../../public/assets/images/intercom/phone.png'
import googlePlay from '../../../public/assets/images/intercom/google_play.png'
import appStore from '../../../public/assets/images/intercom/appstore.png'
import GSFakeLink from "../../components/shared/GSFakeLink/GSFakeLink";
import GSTrans from "../../components/shared/GSTrans/GSTrans";
import {Modal, ModalBody, ModalHeader} from 'reactstrap';

const IntercomDownloadModal = (props) => {
    const [stIsShow, setStIsShow] = useState(props.isShow)

    useEffect(() => {
        setStIsShow(props.isShow)
    }, [props.isShow])

    const toggle = () => {
        props.onClose();
    }

    const handleAppStoreClick = () => {
        window.open('https://apps.apple.com/us/app/goseller/id1504792843', '_blank')
    }

    const handleGooglePlayClick = () => {
        window.open('https://play.google.com/store/apps/details?id=com.mediastep.gosellseller', '_blank')
    }

    const closeBtn = (<button className="close" style={{
        position: 'absolute', top: '0', right: '0', transform: 'translate(50%, -50%)', margin: 0,
        background: 'black', color: 'white', fontSize: '1.1em', padding: '0.2em 0.4em', borderRadius: '50%'
    }} onClick={toggle}>&times;</button>);

    return (
        <Modal isOpen={stIsShow} size="lg" className="intercom-download-modal">
            <ModalHeader toggle={toggle} close={closeBtn} className="">
            </ModalHeader>
            <ModalBody>
                <div className='row'>
                    <div className='d-none d-xl-block col-xl-4 text-center'><GSImg src={phoneScreen}/></div>
                    <div className='col-12 col-xl-8 d-flex flex-column justify-content-center align-items-center'>
                        <h3 className='font-weight-bold'>
                            <GSTrans t='component.intercom.download.title'>Download GoSELLER app</GSTrans>
                        </h3>
                        <div className='intercom-download-modal__indicator mt-2'/>
                        <h4 className='mt-3 font-weight-lighter text-left'>
                            <GSTrans t='component.intercom.download.message'>Get in touch with our customer support
                                directly
                                from Goseller app and
                                enjoy numerous features
                                helping
                                you manage your shop conveniently.
                            </GSTrans>
                        </h4>
                        <div className='row mt-3 text-center'>
                            <div className='col-lg-6'><GSImg src={appStore} className='cursor--pointer mw-100'
                                                             onClick={handleAppStoreClick}/></div>
                            <div className='col-lg-6'><GSImg src={googlePlay} className='cursor--pointer mw-100'
                                                             onClick={handleGooglePlayClick}/></div>
                        </div>
                        <h5 className='font-weight-bold mt-4'>
                            <GSFakeLink onClick={toggle}
                                        className='text-white text-decoration-none intercom-download-modal__later'>
                                <GSTrans t='component.intercom.download.later'>Download later</GSTrans>
                            </GSFakeLink>
                        </h5>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

IntercomDownloadModal.propTypes = {
    isShow: PropTypes.bool,
    onClose: PropTypes.func,
}

export default IntercomDownloadModal

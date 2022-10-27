import React from "react";
import {ImageUtils} from "../../../../utils/image";
import {UikButton} from "../../../../@uik";
import {Trans} from "react-i18next";
import './ImageBox.sass';

export default class ImageBox extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isSetMainCoverShow: false,
            o9n: 1,
            imageObj: null
        }
        this.onShowModalCallback = this.props.onShowModalCallback;
        this.onChooseSetMainCallback = this.props.onChooseSetMainCallback;
        this.onMouseEnterImageView = this.onMouseEnterImageView.bind(this)
        this.onMouseLeaveImageView = this.onMouseLeaveImageView.bind(this)
        this.createImageObject = this.createImageObject.bind(this)
    }

    componentDidMount() {
        this.createImageObject(this.props.src)
    }

    componentWillReceiveProps(props) {
        if(!props.src.imageId || (props.src.imageId && props.src.imageId !== this.props.src.imageId)) {
            this.createImageObject(props.src);
        }
    }
    onMouseEnterImageView() {
        this.setState({
            isSetMainCoverShow: true
        })
    }

    onMouseLeaveImageView() {
        this.setState({
            isSetMainCoverShow: false
        })
    }

    createImageObject(src) {
        if (src.itemId) {
            // if(src.imageId == -99999) {
            //     this.setState({
            //         imageObj:  `/${src.imageUUID}.${src.extension}`
            //     })
            // }else {
            //     this.setState({
            //         imageObj: src.urlPrefix + '/' + src.imageId + '.jpg'
            //     })
            // }
            if(src.extension){
                this.setState({
                    imageObj: src.urlPrefix + '/' + src.imageUUID + '.'+ src.extension
                })
            }
            else{
                this.setState({
                    imageObj: src.urlPrefix + '/' + src.imageId + '.jpg'
                })
            }
            
        }
        else {
            ImageUtils.getOrientation(src, (o9n => {
                this.setState({
                    o9n: o9n,
                    imageObj: URL.createObjectURL(src)
                })
            }))

        }
    }

    render() {
        return (
            <>
            <div className={'image-view image-widget__image-item ' + (this.props.isMain ? 'image-widget__image-item--main' : '')}
                 onMouseEnter={this.onMouseEnterImageView}
                 onMouseLeave={this.onMouseLeaveImageView}
                 onTouchStart={this.onMouseEnterImageView}
                 onTouchCancel={this.onMouseLeaveImageView}
            >
                <div hidden={this.props.isMain}>
                <div className="image-widget__set-main-cover" hidden={!this.state.isSetMainCoverShow}>
                    <UikButton transparent
                               className="image-widget__btn-set-main"
                               onClick={!this.props.formModal ? this.onShowModalCallback : this.onChooseSetMainCallback}>
                        <Trans i18nKey={!this.props.formModal ? 'component.product.addNew.imageView.Edit' : "common.text.select"}/>
                    </UikButton>
                </div>
                </div>
                <img className={"photo " + 'photo--o9n-' + this.state.o9n}
                     width="137px"
                     height="137px"
                     src={this.state.imageObj} />
            </div>
           </>
        )
    }
}

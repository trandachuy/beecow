import React, { Component } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Trans } from "react-i18next";
import {UikButton} from "../../@uik";
import { ImageUtils } from "../../utils/image";

export default class LazadaImageView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            prodImageList: props.prodImageList,
            prodImageMain: 0
        }
        this.onRemoveCallback = this.props.onRemoveCallback;
        this.onRemoveImage = this.onRemoveImage.bind(this);
        this.onSelectMainImage = this.onSelectMainImage.bind(this);
    }

    onRemoveImage(index) {
        this.props.prodImageList.splice(index, 1)
        let prodImageMain = this.state.prodImageMain
        if (this.state.prodImageList.length === 0) {
            prodImageMain = -1
        } else {
            if (prodImageMain === index) {
                prodImageMain = 0;
            }
        }

        this.setState({
            prodImageList: this.props.prodImageList,
            prodImageMain: prodImageMain,
            //isValidImageAmount: this.state.prodImageList.length >= 3
        })
        this.onRemoveCallback(this.props.prodImageList);
    };

    isMainImage(index) {
        if (this.state.prodImageMain === -1) {
            if (index === 0) {
                this.setState({
                    prodImageMain: 0
                })
                return true
            }
        } else {
            if (this.state.prodImageMain === index) return true
            return false
        }
    }

    onSelectMainImage(index) {
        this.setState({
            prodImageMain: index
        })
    };

    render() {
       
        return (
                this.props.prodImageList.map((item, index) =>{
                    return (
                    <div className={'image-view image-widget__image-item ' + (this.state.prodImageMain === index ? 'image-widget__image-item--main' : '')}>
                        <a className="image-widget__btn-remove" onClick={() => { this.onRemoveImage(index) }}>
                            <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                        </a>
                        <img className={"photo " + 'photo--o9n-' + item.o9n}
                            key={index}
                            width="137px"
                            height="137px"
                            src={item.image} />
                        <div hidden={!this.isMainImage(index)} className="image-widget__main-cover">
                            <Trans i18nKey="component.product.addNew.imageView.mainPhoto">
                                Main photo
                            </Trans>
                        </div>
    
                        <div className="image-widget__set-main-cover">
                            <UikButton transparent
                                className="image-widget__btn-set-main"
                                onClick={() => this.onSelectMainImage(index)}>
                                <Trans i18nKey="component.product.addNew.imageView.setMain">
                                    Set Main
                                </Trans>
                            </UikButton>
                        </div>
                </div>)
                })
        )
    }
}

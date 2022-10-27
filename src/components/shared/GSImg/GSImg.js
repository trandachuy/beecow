/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {ImageUtils} from "../../../utils/image";

// Show image with orientation
const GSImg = props => {
    // console.log('render img')

    const [stImg, setStImg] = useState({
        o9n: 1,
        imageObj: null
    });

    useEffect(() => {
        // console.log('effect img')
        if (props.src) {
            if ( typeof props.src === "string" ) { // -> URL
                setStImg({
                    ...stImg,
                    o9n: 1,
                    imageObj: props.src
                })
            } else if (typeof props.src === "object" && (props.src.imageId || props.src.imageUUID)) { // -> IMAGE DTO
                setStImg({
                    o9n: 1,
                    imageObj: ImageUtils.getImageFromImageModel(props.src)
                })
            } else { // -> FILE
                ImageUtils.getOrientation(props.src, o9n => {
                    setStImg({
                        ...stImg,
                        o9n: o9n,
                        imageObj: URL.createObjectURL(props.src)
                    })
                })
            }
        } else { // => default
            setStImg({
                ...stImg,
                imageObj: null
            })
        }

        return () => {

        };
    }, [props.src]);

    const {src, className, alt, showDefault, showDefaultS3, ...other} = props
    return (
        <>
            {stImg.imageObj &&
                <img alt={alt} src={stImg.imageObj} {...other} className={['photo ','photo--o9n-' + stImg.o9n, className].join(' ')} onClick={() => props.onClick && props.onClick()}/>
            }

            {!stImg.imageObj &&
                <img alt={alt} src={props.showDefaultS3 ? 'https://dm4fv4ltmsvz0.cloudfront.net/storefront-images/default_image2.png' : '/assets/images/default_image2.png'} {...other}
                    className={className}
                    style={{
                        ...props.style,
                        opacity: showDefault? 1:0
                    }}
                    onClick={() => props.onClick && props.onClick()}
                />
            }
        </>
    );
};

GSImg.defaultProps = {
    showDefault: true,
    showDefaultS3: false
}

GSImg.propTypes = {
    src: PropTypes.any,
    alt: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    className: PropTypes.string,
    showDefault: PropTypes.bool,
    showDefaultS3: PropTypes.bool,
    onClick: PropTypes.func,
};

export default GSImg;

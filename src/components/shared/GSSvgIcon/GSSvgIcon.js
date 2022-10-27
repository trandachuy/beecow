import * as React from 'react';
import PropTypes from 'prop-types';

const SvgIcon = (props) => {
    const { 
        children, className, titleAccess, width, height, viewBox='0 0 24 24', color, style, fontSize=24,
        ...rest
    } = props;

    return (
        <svg
            style={style}
            className={`svgicon ${className}`}
            focusable={viewBox}
            width={width}
            height={height}
            preserveAspectRatio="xMidYMid meet"
            color={color}
            fontSize={fontSize}
            aria-hidden={titleAccess ? 'false': 'true'}
            role={titleAccess ? 'img': 'presentation'}
            {...rest}

        >
            {children}
            {titleAccess ? <title>{titleAccess}</title>: null}

        </svg>
    );
}
SvgIcon.propTypes = {
    listDataCheckbox: PropTypes.array,
    setPage:PropTypes.func,
    page:PropTypes.number,
    setData:PropTypes.func,
    setValueSearch:PropTypes.func,
    listDataChecked:PropTypes.array
}
export default SvgIcon;

export function createSvgIcon(path, displayName){
    const Icon = (props) => <SvgIcon {...props}>{path}</SvgIcon>
    Icon.displayName = `${displayName}Icon`
    return React.memo(Icon)
}

/*
how to use
import React from 'react';
import SvgIcon from './SvgIcon';

export default (props) => {

    return(
        <SvgIcon
            viewBox='0 0 15 8'
            fontSize="18px"
            color="cyan"
            {...props}
        >
        <path d="M5.5,... Z"/>
        </SvgIcon>
    )
}
*/
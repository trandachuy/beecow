import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';


const DragToScroll = props => {
    const refTarget = useRef(null);
    const [stFirstPoint, setStFirstPoint] = useState({ top: 0, left: 0, x: 0, y: 0 });
    const [stDowned, setStDowned] = useState(false);


    const onMouseMove = (e) => {
        if (stDowned) {
            const ele = refTarget.current

            // How far the mouse has been moved
            const dx = e.clientX - stFirstPoint.x;
            const dy = e.clientY - stFirstPoint.y;

            // Scroll the element
            ele.scrollTop = stFirstPoint.top - dy;
            ele.scrollLeft = stFirstPoint.left - dx;
        }

    }

    const onMouseUp = (e) => {
        setStDowned(false)
        const ele = refTarget.current
        ele.style.cursor = 'unset'
    }

    const onMouseDown = (e) => {
        if (props.triggeredButtons.includes(e.button)) {
            const ele = refTarget.current
            ele.style.cursor = 'move'
            const pos = {
                // The current scroll
                left: ele.scrollLeft,
                top: ele.scrollTop,
                // Get the current mouse position
                x: e.clientX,
                y: e.clientY,
            };
            setStDowned(true)
            setStFirstPoint(pos)
        }
    }

    return (
        React.cloneElement(props.children, {
            ref: refTarget,
            onMouseMove: onMouseMove,
            onMouseUp: onMouseUp,
            onMouseDown: onMouseDown
        })
    );
};

DragToScroll.MOUSE_BUTTON = {
    MAIN: 0,
    AUXILIARY: 1,
    SECONDARY: 2,
    FOURTH: 4,
    FIFTH: 5
}

DragToScroll.defaultProps = {
    triggeredButtons: [DragToScroll.MOUSE_BUTTON.AUXILIARY],
    cursor: true
}



DragToScroll.propTypes = {
    triggeredButtons: PropTypes.array,
    cursor: PropTypes.bool,
};

export default DragToScroll;

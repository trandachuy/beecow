
import React from 'react';
import PropTypes from 'prop-types';

const BlockComponent = props => {

    const blockEvent = (e) => {
        e.preventDefault()
    }
    return (
        <>
            {props.public? props.children:
                        <span className={["gs-atm--disable", props.className].join(' ')} style={{
                        }}>
                            {props.allowUserEvents ?
                                props.children
                                :
                                React.Children.map(props.children, (child => {
                                        if (child) {
                                            return  React.cloneElement(child, {
                                                onClick: blockEvent,
                                                onFocus: blockEvent,
                                                onKeyDown: blockEvent,
                                                onBlur: blockEvent,
                                                onInput: blockEvent,
                                                onKeyPress: blockEvent,
                                                defaultChecked: false,
                                                ...props.childrenProps
                                            })
                                        }
                                        return null
                                    }
                                ))
                            }
              </span>
            }
        </>
    );
};


BlockComponent.defaultProps = {
    public: false,
}

BlockComponent.propTypes = {
    public: PropTypes.bool,
};

export default BlockComponent;
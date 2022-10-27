import React from 'react';
import './ColorPicker.sass'
import {any, string} from 'prop-types';


const ColorPicker = React.forwardRef((props, ref) => {
    const onChangeColor = (event, colorType) => {
        const {value} = event.currentTarget;
        props.chooseColorCallback(value, colorType);
    }

    return (

            <div className="color-picker">
                <div className="picker-title">
                    {props.text}
                </div>
                <div className="">
                    <input 
                        type="color" 
                        value={props.value} 
                        name="color"
                        onChange={(value) => onChangeColor(value, props.colorType)} />
                </div>
                
            </div>
        

        
    );
});

export default ColorPicker

ColorPicker.propTypes = {
    colorType: string,
    value: string,
    text: string,
    chooseColorCallback: any
};

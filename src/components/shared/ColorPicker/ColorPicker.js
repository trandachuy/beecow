import React, {Component} from 'react';
import {Chunk} from 'react-lodash'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

class ColorPicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedColor: this.props.value
        }
    }

    setDefaultColor(primary){
        this.setState({ selectedColor: primary });
    }

    setColor(color) {
        this.setState({ selectedColor: color.primary });
        this.props.onChange(color);
    }

    render() {
        return (
            <div className="palette">
                <Chunk array={this.props.colors} size={this.props.size}>
                    {result => {
                                    const rows = [];

                                    for (let i = 0; i < result.length; i++) {
                                        const cols = [];
                                        let colors = result[i];
                                        for (let j = 0; j < colors.length; j++) {
                                            let color = colors[j];
                                            cols.push(
                                                <div key={i + '' + j}
                                                     className="palette__col"
                                                     onClick={
                                                         () => this.setColor(color)
                                                     }
                                                     style={{
                                                         backgroundColor: '#' + color.primary
                                                     }}>

                                                    <span className={this.state.selectedColor === color.primary ? '' : 'hidden'}>
                                                        <FontAwesomeIcon
                                                            icon={'check-circle'}/>
                                                    </span>
                                                </div>
                                            )
                                        }
                                        rows.push(
                                            <div className="palette__row" key={i}>
                                                {cols}
                                            </div>
                                        );
                                    }
                                    return rows;

                                }
                    }</Chunk>
            </div>
        );
    }
}

export default ColorPicker;

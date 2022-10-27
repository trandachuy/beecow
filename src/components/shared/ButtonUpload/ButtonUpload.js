import React, {Component} from "react";
import {Button} from "reactstrap";
import {Trans} from "react-i18next";

export default class ButtonUpload extends Component {

    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.onUploaderChange = this.onUploaderChange.bind(this);
        this.onChangeCallback = this.props.onChangeCallback.bind(this);

        this.refInputFile = React.createRef()
    }

    onClick() {
        this.refInputFile.current.click()
    }

    onUploaderChange() {
        this.props.onChangeCallback.call(this, this.refInputFile.current.files, this.props.fieldName);
    }

    render() {
        return(
            <span>
                <Button color="success" onClick={this.onClick}><Trans i18nKey="common.btn.upload">Upload</Trans></Button>
                <input type="file"
                    multiple={this.props.multiple}
                    accept={this.props.accept.join(', ')}
                    ref={this.refInputFile}
                       onChange={this.onUploaderChange} />
            </span>
        )
    }
}

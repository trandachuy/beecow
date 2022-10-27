import React from 'react';
// Require Editor JS files.
import FroalaEditor from 'react-froala-wysiwyg';

import $ from "jquery";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/js/froala_editor.pkgd.min.js";
// Require Font Awesome.
import './GSEditor.sass'
import i18next from 'i18next'
import {AvField} from 'availity-reactstrap-validation';
import PropTypes from 'prop-types';

window.$ = $;



export default class GSEditor extends React.Component {
    constructor (props) {
        super(props);

        this.handleModelChange = this.handleModelChange.bind(this);
        this.setDefaultView = this.setDefaultView.bind(this);
        this.getHtmlData = this.getHtmlData.bind(this);

        this.state = {
            model: this.props.value ? this.props.value.replace(/\n/g, '<br>') : '',
            currentLength: 0
        };

        const imageMaxSize = this.props.imageMaxSize ? this.props.imageMaxSize : process.env.IMAGE_MAX_SIZE;
        
        this.config = {
            placeholderText: '',
            attribution: false,
            heightMin: this.props.heightMin ? this.props.heightMin : 200,
            charCounterCount : this.props.charCounterCount ? this.props.charCounterCount : false,
            charCounterMax : this.props.maxLength ? this.props.maxLength : 100000,
            toolbarButtons : this.props.toolbarButtons ? this.props.toolbarButtons : ['fullscreen', 'bold', 'italic', 'underline', 'fontFamily', 'fontSize', 'align', 'formatOL', 'formatUL',
                'insertLink', 'insertImage', 'html', 'undo', 'redo'],
            toolbarButtonsMD : this.props.toolbarButtonsMD ? this.props.toolbarButtonsMD : ['fullscreen', 'bold', 'italic', 'underline', 'fontFamily', 'fontSize', 'align', 'formatOL', 'formatUL',
                'insertLink', 'insertImage', 'html', 'undo', 'redo'],
            toolbarButtonsXS : this.props.toolbarButtonsXS ? this.props.toolbarButtonsXS : ['bold', 'italic', 'underline', 'fontFamily', 'fontSize', 'align', 'formatOL', 'formatUL',
                'insertLink', 'insertImage', 'html', 'undo', 'redo'],
            quickInsertButtons : this.props.quickInsertButtons ? this.props.quickInsertButtons : ['image', 'embedly', 'ul', 'ol', 'hr', 'html'],
            table : this.props.table ? this.props.table : false,
            events : this.props.events ? this.props.events : {
                'froalaEditor.image.error' : function (e, editor, error, response) {
                    let popup = editor.popups.get('image.insert');
                    let layer = popup.find('.fr-image-progress-bar-layer');
                    if (error.code === 1 || error.code === 2
                        || error.code === 3 || error.code === 4 || error.code === 7) {
                        layer.find('h3').text(i18next.t('common.message.server.response'));
                    } else if (error.code === 5) {
                        // Image too text-large.
                        layer.find('h3').text(i18next.t('common.validation.editor.image.size', {x: imageMaxSize}));
                    } else if (error.code === 6) {
                        // Invalid image type.
                        layer.find('h3').text(i18next.t('common.validation.editor.image.type'));
                    }
                },
                'froalaEditor.initialized' : this.setDefaultView,
                //'input': this.getHtmlData
            },
            imageAllowedTypes : this.props.imageAllowedTypes ? this.props.imageAllowedTypes : ['jpeg', 'jpg', 'png', 'gif'],
            imageMaxSize : 1024 * 1024 * parseInt(imageMaxSize),
            imageUploadParam : this.props.imageUploadParam ? this.props.imageUploadParam : 'files',
            imageUploadParams : {domain: this.props.domain ? this.props.domain : 'EDITOR'},
            imageUploadURL: process.env.API_BASE_URL + '/mediaservices/api/uploads/editor',
            key : process.env.FROALA_EDITOR_KEY,
            enter: $.FroalaEditor.ENTER_BR,
            entities: ''
        }
    }

    componentDidMount() {
        const that = this;
        $("div.fr-toolbar button[data-cmd=html]").on("click", function(e) {
            const isPress = $(e.currentTarget).attr("aria-pressed");
            that.onChangeViewMode(String(isPress).toLowerCase() == "true");
        })
    }

    onChangeViewMode(isHtml) {
        if (this.props.isHtmlView) {
            this.props.isHtmlView(isHtml);
        }
    }

    setDefaultView(e, editor, error, response){
        if(this.props.viewCode && this.props.viewCode === 'html'){
            editor.codeView.toggle();
        }
    }

    getHtmlData(e){
        this.handleModelChange(e.target.value);
    }

    componentDidUpdate(prevProps, prevState) {
        if (_.isString(this.props.value) && this.props.value !== prevProps.value) {
            this.setState({
                model: this.props.value
            });
        }
        if (this.state.model !== prevState.model) {
            if (this.props.onChange) this.props.onChange(this.state.model)
        }
    }

    handleModelChange (model) {
        this.setState({
            model: model,
            currentLength: model ? model.length : 0
        });
    }

    render () {
        const {label, isRequired, error, ...other } = this.props;
        return <div {...other}>
            {label &&
                <label className="gs-frm-control__title">
                    {label}
                </label>
            }
            <FroalaEditor
                model={this.state.model}
                config={this.config}
                onModelChange={this.handleModelChange}
                tabIndex={this.props.tabIndex}/>
            {
                error && <span className="error">{ error }</span>
            }
            <AvField type={'hidden'}
                   value={this.state.model}
                   name={this.props.name}
                   validate={{
                       ...this.props.validate,
                       required: {value: this.props.isRequired,
                           errorMessage: i18next.t("common.validation.required")},
                       maxLength: {value: this.props.maxLength,
                           errorMessage: i18next.t("common.validation.editor.text.size", {x: this.state.currentLength, y: this.props.maxLength})}
                   }}
            />
        </div>
    }
}

GSEditor.propTypes = {
    charCounterCount: PropTypes.number,
    domain: PropTypes.string,
    events: PropTypes.object,
    heightMin: PropTypes.number,
    imageAllowedTypes: PropTypes.array,
    imageMaxSize: PropTypes.number,
    imageUploadParam: PropTypes.string,
    isRequired: PropTypes.bool,
    maxLength: PropTypes.number,
    minLength: PropTypes.number,
    name: PropTypes.string,
    quickInsertButtons: PropTypes.array,
    table: PropTypes.bool,
    toolbarButtons: PropTypes.array,
    toolbarButtonsMD: PropTypes.array,
    toolbarButtonsXS: PropTypes.array,
    validate: PropTypes.object,
    value: PropTypes.string,
    tabIndex: PropTypes.number,
    onChange: PropTypes.func,
    label: PropTypes.string,
    isHtmlView: PropTypes.func,
    error: PropTypes.string
};

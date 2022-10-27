import React, {Component} from 'react';
import PropTypes from 'prop-types';

import SwaggerUi  from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import './styles.sass'
import SWaggerUiStandalonePreset from "swagger-ui/dist/swagger-ui-standalone-preset.js";
import Cookies from 'js-cookie';
const API_BASE_URL = Cookies.get('apiBaseUrl');
const URLS = [
    {url: `${API_BASE_URL}/api/open-docs`, name: 'Gateway'},
    {url: `${API_BASE_URL}/catalogservices/api/open-docs`, name: 'Catalog Service'},
    {url: `${API_BASE_URL}/storeservice/api/open-docs`, name: 'Store Service'},
    {url: `${API_BASE_URL}/itemservice/api/open-docs`, name: 'Item Service'},
    {url: `${API_BASE_URL}/beehiveservices/api/open-docs`, name: 'Customer / Blog & Article Service'},
    {url: `${API_BASE_URL}/affiliateservice/api/open-docs`, name: 'Affiliate Service'},
    {url: `${API_BASE_URL}/orderservices2/api/open-docs`, name: 'Order Service'},
    // {url: `${API_BASE_URL}/ssrstorefront/v2/api-docs?group=external`, name: 'ssrstorefront public'},
]
class ApiDocs extends Component {

    componentDidMount() {
        SwaggerUi({
            dom_id: '#swaggerContainer',
            // url: this.props.url,
            urls: this.props.urls,
            plugins: [SWaggerUiStandalonePreset],
            layout: "StandaloneLayout",
            supportedSubmitMethods: this.props.supportedSubmitMethods,
            defaultModelsExpandDepth: this.props.defaultModelsExpandDepth,
            filter: this.props.filter,
        });
    }

    render() {
        return (
            <div className='container'>
                <div id="swaggerContainer" />
            </div>
        );
    }
}

ApiDocs.propTypes = {
    url: PropTypes.string,
    urls: PropTypes.array,
    spec: PropTypes.object,
    enableCORS: PropTypes.bool,
    supportedSubmitMethods:  PropTypes.array,
    defaultModelsExpandDepth: PropTypes.number,
    filter: PropTypes.bool,
    maxDisplayedTags: PropTypes.number,
};

ApiDocs.defaultProps = {
    // url: `${API_BASE_URL}/v2/api-doc`,
    url: `http://localhost:8286/v2/api-docs`,
    urls: URLS,
    enableCORS: false,
    supportedSubmitMethods: ['get','post','put','delete'],
    defaultModelsExpandDepth: -1,
    filter: true
};

export default ApiDocs;

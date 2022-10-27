import React, {useState} from 'react';
import './SearchByShippingAddress.sass'
import {UikInput} from '../../../@uik'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import i18next from 'i18next'
import Loading, {LoadingStyle} from '../../../components/shared/Loading/Loading'
import useDebounceEffect from '../../../utils/hooks/useDebounceEffect'
import beehiveService from '../../../services/BeehiveService'
import LocationIcon from '../../../components/shared/GSSvgIcon/LocationIcon'
import PropTypes from 'prop-types'
import Constant from '../../../config/Constant'
import {StringUtils} from '../../../utils/string'

const SIZE_PER_PAGE = 100;
const ON_INPUT_DELAY = 500


const SearchByShippingAddress = props => {
    const {optionApiUrl, callback, defaultValue } = props;

    const [stNotLoadApiFirst, setStNotLoadApiFirst] = useState(true);
    const [stSearchText, setStSearchText] = useState('');
    const [stIsLoadMore, setStIsLoadMore] = useState(false);
    const [stIsSearch, setStIsSearch] = useState(false);
    const [stPaging, setStPaging] = useState({
        totalPage: 0,
        totalItem: 0,
        currentPage: 1
    });
    const [stAddressList, setStAddressList] = useState([]);
    const [stExpanded, setStExpanded] = useState(false);
    const [stIsSelectAddress, setStIsSelectAddress] = useState(false);

    useDebounceEffect(() => {
        fetchData(stPaging.currentPage);
    }, 500, [stSearchText, stPaging.currentPage]);


    const fetchData = (page) => {
        if (stNotLoadApiFirst) {
            setStNotLoadApiFirst(false)
            return
        }
        handleOptionApiUrl(optionApiUrl)
            .then(result => {
                const data = result.data?.map(d => {
                    return {
                        value: d
                    }
                })
                let mapData = data
                if(stIsLoadMore){
                    mapData = [...stAddressList, ...data]
                }

                setStPaging({
                    totalPage: Math.ceil(result.total / SIZE_PER_PAGE),
                    totalItem: +(result.total),
                    currentPage: page === undefined ? stPaging.currentPage : page
                })

                setStAddressList(mapData)
            })
            .finally(() => {
                setStIsSearch(false)
                setStIsLoadMore(false)
            })
    }
    
    const handleOptionApiUrl = (url) => {
        switch (url) {
            case Constant.OPTION_API_URL_ADDRESS.getShippingAddress:
               return beehiveService.getShippingAddress(
                    stPaging.currentPage - 1,
                    SIZE_PER_PAGE,
                    stSearchText
                )
                break
            
            case Constant.OPTION_API_URL_ADDRESS.getAddressCustomer:
               return beehiveService.getAddressCustomer(
                    stPaging.currentPage - 1,
                    SIZE_PER_PAGE,
                    stSearchText
                )
                break
        }
    }

    const onChangeSearch = (e) => {
        setStIsSearch(true)
        const keyword = e.currentTarget.value
        if (keyword !== '') {
            setStExpanded(true)
        } else {
            setStExpanded(false)
        }
        setStSearchText(keyword)
        reset()
    }

    const onKeyPressSearch = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            callback(stSearchText)
        }
    }

    const handleSelectAddress = (e, objAddress, makeBoldWordsFromString) => {
        e.preventDefault()
        setStIsSelectAddress(state => !state)
        let text = ''
        if (makeBoldWordsFromString === true) {
            text = objAddress.value
        } else {
            text = objAddress.value.keyword
        }
        setStSearchText(text)
        setStExpanded(false)
        reset()
        callback(text)
    }

    const closeSearch = (e) => {
        if (e.relatedTarget) {
            setStExpanded(true)
        } else {
            setStExpanded(false)
        }
    }

    const scrollAddressList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && stPaging.currentPage < stPaging.totalPage) {
            setStIsLoadMore(true)
            setStPaging({
                ...stPaging,
                currentPage: stPaging.currentPage + 1
            })
        }
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const reset = () => {
        setStPaging({
            ...stPaging,
            currentPage: 1
        })
    }

    const makeBoldWordsFromString = (str, wordArray) => {
        wordArray.forEach((word) => {
            const wordReg = StringUtils.escapeRegExp(word)
            str = str.replace(RegExp(`(${wordReg})`, 'gmi'), `<b>$1</b>`);
        });
        return str;
    }

    return (
        <section className='sarch-by-shipping-address'>
            <div className="search">
                <UikInput
                    key={ stIsSelectAddress }
                    className="search-input"
                    icon={ (
                        <FontAwesomeIcon icon={ 'search' }/>
                    ) }
                    defaultValue={ stSearchText || defaultValue }
                    iconPosition="left"
                    placeholder={ i18next.t('common.txt.searchKeyword') }
                    onKeyPress={ onKeyPressSearch }
                    onChange={ onChangeSearch }
                    onBlur={ closeSearch }
                    onClick={ (e) => {
                        setStExpanded(true)
                        setStSearchText(e.currentTarget.value)
                    } }
                />
                { stSearchText &&
                <div onScroll={ scrollAddressList } className='list-shipping-address' hidden={ !stExpanded }
                     onBlur={ closeSearch }
                >
                    { !stIsSearch && stAddressList?.map((address, index) =>
                        <div tabIndex={ 0 } key={ index }
                             className="list-row"
                             onClick={ (e) => handleSelectAddress(e, address, props.makeBoldWordsFromString) }>
                            <LocationIcon/>
                            <p className='line-clamp-1'
                               dangerouslySetInnerHTML={ { __html: props.makeBoldWordsFromString ?
                                       makeBoldWordsFromString(address.value, stSearchText.split(' ').filter(s => !!s)) :
                                       address.value.highlight} }/>
                        </div>
                    ) }

                    { !stIsSearch && stAddressList?.length === 0 &&
                    <div className="list-row empty">
                        <LocationIcon/>
                        <p>{i18next.t('page.order.list.noAddressFound')}</p>
                    </div>
                    }

                    { (stIsLoadMore || stIsSearch) &&
                    <Loading style={ LoadingStyle.ELLIPSIS_GREY }/>
                    }
                </div>
                }
            </div>
        </section>
    );
};

SearchByShippingAddress.defaultProps = {
    makeBoldWordsFromString: true
}

SearchByShippingAddress.propTypes = {
    optionApiUrl: PropTypes.string,
    callback: PropTypes.func,
    defaultValue: PropTypes.string,
    makeBoldWordsFromString: PropTypes.bool
};

export default SearchByShippingAddress;

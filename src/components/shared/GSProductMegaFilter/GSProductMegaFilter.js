import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import './GSProductMegaFilter.sass';
import GSTrans from '../GSTrans/GSTrans';
import {UikFormInputGroup, UikRadio, UikSelect} from "../../../@uik";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import GSButton from '../GSButton/GSButton';
import {cn} from "@utils/class-name";
import QueryString from 'qs';
import i18next from 'i18next';
import shopeeService from '@services/ShopeeService';
import Constants from '@config/Constant';
import {ItemService} from '@services/ItemService';
import GSModalFullBodyMobile from '../GSModalFullBodyMobile/GSModalFullBodyMobile';
import GSWidgetContent from '../form/GSWidget/GSWidgetContent';

const GSProductMegaFilter = forwardRef((props, ref) => {
  
  const defaultKeyword = "ALL";

  let initFilterConfig = {
    channel: defaultKeyword,
    status: defaultKeyword,
    collection: defaultKeyword,
    branch: defaultKeyword,
    shopeeAccount: defaultKeyword,
    platform: defaultKeyword,
  }

  let wrapperRef = useRef();

  const [elAction, setElAction] = useState(null);
  const [firstTime, setFirstTime] = useState(false);
  const [fixedStyle, setFixedStyle] = useState({});
  const [stFilterCount, setStFilterCount] = useState(0);
  const [stShowFilter, setStShowFilter] = useState(false);
  const [filterSaleChannelValues, setFilterSaleChannelValues] = useState([]);
  const [filterSalePlatformValues, setFilterSalePlatformValues] = useState([]);
  const [filterStatusValues, setFilterStatusValues] = useState([]);
  
  const [filterCollectionValues, setFilterCollectionValues] = useState([
    {label : i18next.t('component.gsMegaFilter.filterLabel.collection.all'), value : defaultKeyword}
  ]);
  const [filterShopeeAccountValues, setFilterShopeeAccountValues] = useState([
    {label : i18next.t('component.gsMegaFilter.filterLabel.shopeeAccount.all'), value : defaultKeyword}
  ]);
  const [filterBranchValues, setFilterBranchValues] = useState([
    {label : i18next.t('component.gsMegaFilter.filterLabel.branch.all'), value : defaultKeyword}
  ]);

  const [filterConfig, setFilterConfig] = useState(initFilterConfig);
  
  useEffect(() => {
    const currentSearch = props && props.location? {...filterConfig, ...props.location}: filterConfig;
    const {channel, status, collection, branch, shopeeAccount, platform} = QueryString.parse(currentSearch);
    let filter = {channel, status, collection, branch, shopeeAccount, platform};
    //filter.status = (param && param.status) ? param.status : defaultKeyword;
    setFilterConfig(filter);
    fetchData();
    return () => {
      // console.log("GSProductMegaFilter is unmounting...");
    };
  }, []);

  useEffect(() => {
    const storeBranch = props.storeBranch

    if (!storeBranch.length) {
      return
    }

    setFilterConfig({
      ...filterConfig,
      branch: storeBranch[0]?.value
    })
    setFilterBranchValues(storeBranch);
  }, [props.storeBranch])

  useEffect(() => {
    countFilter();
    if(props.defaultDataFilter){
      setFilterConfig(props.defaultDataFilter)
    }
  }, [filterConfig])

  useEffect(() => {
    if(firstTime === false) return;
    setFirstTime(false);
    firstTimeAction();
  }, [firstTime])

  useEffect(() => {
    //cache filter count number
    if(typeof props.onFilter === "function" && stFilterCount > 0 && props.filterCount === 0) {
      props.onFilter({
        count: stFilterCount,
        filter: filterConfig
      })
    }
  }, [props.filterCount])

  useEffect(() => {
    if(stShowFilter === true) {
      window.addEventListener('click', handleClickOutside);
    } else {
      window.removeEventListener('click', handleClickOutside);
    }
  }, [stShowFilter])

  useImperativeHandle(ref,
    () => ({
        open: ($el) => {
          openFilterModal($el)
        },
        close: () => {
          closeFilterModal()
        },
        clear: () => {
          clearFilterConfig()
        }
    })
  );

  const handleClickOutside = (event) => {
    const isDiffer = elAction? elAction.contains(event.target): false;
    if (wrapperRef && wrapperRef.current 
        && !wrapperRef.current.contains(event.target)
        && !isDiffer) {
        //closeFilterModal();
        if(typeof props.onClickOutSide === 'function') {
          props.onClickOutSide(filterConfig);
        }
    }
  }

  const createSelectList = (arr, i18Next) => {
    return arr.map( item => {
        return {
          value: item,
          label: i18next.t(`${i18Next}.${item.toLowerCase()}`)
        }
    })
  }

  const firstTimeAction = async () => {
    //run filter action at first time
    if(typeof props.onAccepted === "function") {
      props.onAccepted({
        count: stFilterCount,
        filter: filterConfig
      });
    }
    //update init filter config for branches
    initFilterConfig = {...filterConfig};
  }

  const fetchData = async () => {
    try {
      //get list filter status
      const lstStatus = createSelectList([defaultKeyword, ...Constants.PRODUCT_STATUS_LIST], 
      'component.gsMegaFilter.filterLabel.status');
      setFilterStatusValues(lstStatus);
      //get list filter channel 
      const lstChannel = createSelectList([defaultKeyword, ...Constants.PRODUCT_CHANNEL_LIST], 
      'component.gsMegaFilter.filterLabel.saleChannel');
      setFilterSaleChannelValues(lstChannel);

      //get list filter channel 
      const lstPlatform = createSelectList([defaultKeyword, ...Constants.PRODUCT_PLATFORM_LIST], 
        'component.gsMegaFilter.filterLabel.salePlatform');
        setFilterSalePlatformValues(lstPlatform);
      
      //fetch list shopee account
      fetchShopeeAccount();
      
      //fetch list collection
      fetchCollection()
      
      //do first time action
      setFirstTime(true);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchCollection = async () => {
    try {
      const lstCollection = await ItemService.getSimpleCollectionsList('BUSINESS_PRODUCT');
      const collections = lstCollection.map((col) => {
        return {value: col.id, label: col.collectionName};
      })
      setFilterCollectionValues(filterCollectionValues.concat(collections));
    } catch(error) {
      console.log(error);
    }
  }

  const fetchShopeeAccount = async () => {
    try {
      const shopeeAccounts = await shopeeService.getConnectedShops();
      const accounts = shopeeAccounts.map((account) => {
        return {value: account.shopId, label: account.shopName};
      });
      setFilterShopeeAccountValues(filterShopeeAccountValues.concat(accounts));
    } catch(error) {
      console.log(error);
    }
  }

  const openFilterModal = async ($el) => {
    if($el) {
      const target = $el.currentTarget;
      setElAction(target);
      const {right, top} = target.getBoundingClientRect();
      const position = {
        right: $(window).innerWidth()- right - 10,
        top: top - $(target).outerHeight() + 5
      };
      setFixedStyle(position);
    }
    setStShowFilter(true);
  }

  const closeFilterModal = () => {
    setStShowFilter(false);
  }

  const toggleFilterModal = () => {
    const isOpen = !stShowFilter;
    setStShowFilter(isOpen);
  }

  const clearFilterConfig = () => {
    setFilterConfig(initFilterConfig);
  }

  const countFilter = () => {
    let filterCount = 0;

    if (filterConfig.channel && filterConfig.channel !== defaultKeyword){
      filterCount++;
    }

    if (filterConfig.status && filterConfig.status !== defaultKeyword){
      filterCount++;
    }

    if (filterConfig.branch && filterConfig.branch !== filterBranchValues[0].value){
      filterCount++;
    }

    if (filterConfig.collection && filterConfig.collection !== defaultKeyword){
      filterCount++;
    }

    if (filterConfig.platform && filterConfig.platform !== defaultKeyword){
      filterCount++;
    }

    setStFilterCount(filterCount);
    if(typeof props.onFilter === "function") {
      props.onFilter({
        count: filterCount,
        filter: filterConfig
      })
    }
  }

  const onChangeFilterByBranch = (value) => {
    if (props.defaultDataFilter){
      const data = filterConfig
      data.branch = value
      setFilterConfig({
        data
      });
    }else {
      setFilterConfig({
        ...filterConfig,
        branch:value

      });
    }

    if(typeof props.onFilterEvery === "function") {
      props.onFilterEvery({
        name: "branch",
        value: value
      })
    }
  }

  const onChangeFilterByCollection = (value) => {
    if (props.defaultDataFilter){
    const data = filterConfig
    data.collection = value
    setFilterConfig({
      data
    })
    }else {
      setFilterConfig({
        ...filterConfig,
        collection:value
      })
    }



    if(typeof props.onFilterEvery === "function") {
      props.onFilterEvery({
        name: "collection",
        value: value
      })
    }
  }

  const onChangeFilterPlatform = (value) => {
    if (props.defaultDataFilter){
    const data = filterConfig
    data.platform = value
    setFilterConfig({
      data
    })
    }else {
      setFilterConfig({
        ...filterConfig,
        platform:value
      })
    }
    if(typeof props.onFilterEvery === "function") {
      props.onFilterEvery({
        name: "platform",
        value: value
      })
    }
  }

  const onChangeFilterChannel = (value) => {
    if (props.defaultDataFilter){
    const data = filterConfig
    data.channel = value
    setFilterConfig({
      data
    })
    }else {
      setFilterConfig({
        ...filterConfig,
        channel:value
      })
    }
    if(typeof props.onFilterEvery === "function") {
      props.onFilterEvery({
        name: "channel",
        value: value
      })
    }
  }

  const onChangeFilterByShopeeAccount = (value) => {
    if (props.defaultDataFilter){
    const data = filterConfig
    data.shopeeAccount = value
    setFilterConfig({
      data
    })
    }else {
      setFilterConfig({
        ...filterConfig,
        shopeeAccount:value
      })
    }
    if(typeof props.onFilterEvery === "function") {
      props.onFilterEvery({
        name: "shopeeAccount",
        value: value
      })
    }
  }

  const onChangeFilterStatus = (value) => {
    if (props.defaultDataFilter){
    const data = filterConfig
    data.status = value
    setFilterConfig({
      data
    })
    }else {
      setFilterConfig({
        ...filterConfig,
        status:value
      })
    }
    if(typeof props.onFilterEvery === "function") {
      props.onFilterEvery({
        name: "status",
        value: value
      })
    }
  }

  const onSubmitFilter = () => {
    toggleFilterModal();
    if(typeof props.onAccepted === 'function') {
      props.onAccepted({
        count: stFilterCount,
        filter: filterConfig
      });
    }
  }

  return (
    <div className="product-mega-filter-container" ref={wrapperRef}>
      <div className="position-relative mega-filter-container_around">
        <div className="btn-filter-action" onClick={toggleFilterModal} hidden={!props.displayFilterAction}>
            <span>
              <GSTrans t="component.gsMegaFilter.filter.header.title" values={{countNumber: stFilterCount}}>
                  <span></span>
              </GSTrans>
            </span>
            <FontAwesomeIcon size="xs" color="gray" className="icon-filter" icon="filter"/>
        </div>

        {stShowFilter && 
        <>
          {/* DISPLAY ON DESKTOP */}
          <div 
            className="dropdown-menu dropdown-menu-right d-desktop-flex d-mobile-none"
            style={fixedStyle}
          >
            <GSWidgetContent>
              <div className="mega-filter-container_panel">
              {/*BRANCH*/}
              <div className="panel_section section_branch">
                  <div className="section_panel_title">
                      <GSTrans t={"component.gsMegaFilter.filterLabel.branch"}/>
                  </div>
                  <div className="section_branch_filter">
                      <UikSelect
                          value={[{value: String(filterConfig.branch) && String(filterConfig.branch).split(",").length !== 1 ? filterConfig.branch : +(filterConfig.branch)}]}
                          options={filterBranchValues}
                          onChange={(item) => onChangeFilterByBranch(item.value)}
                          position={"bottomRight"}
                      />
                  </div>
              </div>

              {/*COLLECTION*/}
              <div className="panel_section section_collection">
                <div className="section_panel_title">
                    <GSTrans t={"component.gsMegaFilter.filterLabel.collection"}/>
                </div>
                <div className="section_collection_filter">
                    <UikSelect
                        value={[{value: filterConfig.collection === 'ALL' ? filterConfig.collection : +(filterConfig.collection)}]}
                        options={filterCollectionValues}
                        onChange={(item) => onChangeFilterByCollection(item.value)}
                        position={"bottomRight"}
                    />
                </div>
              </div>

              {/*SALE PlATFORM*/}
              <div className="panel_section section_platform">
                  <div className="section_panel_title">
                      <GSTrans t={"component.gsMegaFilter.filterLabel.salePlatform"}/>
                  </div>
                  <div className="section_platform_filter">
                      <div className="d-flex flex-wrap">
                          {filterSalePlatformValues.map(salePlatform => {
                              return (
                                  <div key={salePlatform.value}
                                        className={cn("section__filter-optional",
                                            {"selected": filterConfig.platform === salePlatform.value})}
                                        onClick={() => onChangeFilterPlatform(salePlatform.value)}>
                                      {salePlatform.label}
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              </div>

              {/*SALE CHANNEL*/}
              <div className="panel_section section_channel">
                  <div className="section_panel_title">
                      <GSTrans t={"component.gsMegaFilter.filterLabel.saleChannel"}/>
                  </div>
                  <div className="section_channel_filter">
                      <div className="d-flex flex-wrap">
                          {filterSaleChannelValues.map(saleChannel => {
                              return (
                                  <div key={saleChannel.value}
                                        className={cn("section__filter-optional",
                                            {"selected": filterConfig.channel === saleChannel.value})}
                                        onClick={() => onChangeFilterChannel(saleChannel.value)}>
                                      {saleChannel.label}
                                  </div>
                              )
                          })}
                      </div>
                      {filterConfig.channel === 'SHOPEE' &&
                      <div>
                          <span className="color-gray pr-2">
                              <GSTrans t={"component.gsMegaFilter.filterLabel.shopeeAccount"}/>
                          </span>
                          <UikSelect
                              value={[{value: filterConfig.shopeeAccount === 'ALL' ?filterConfig.shopeeAccount : +(filterConfig.shopeeAccount)}]}
                              options={filterShopeeAccountValues}
                              onChange={(item) => onChangeFilterByShopeeAccount(item.value)}
                              position={"bottomRight"}
                          />
                      </div>
                      }
                  </div>
              </div>

              {/*STATUS*/}
              <div className="panel_section section_status">
                <div className="section_panel_title">
                    <GSTrans t={"component.marketing.notification.tbl.status"}/>
                </div>
                <div className="section_status_filter">
                  {filterStatusValues.map(v => {
                    return (
                      <div key={v.value}
                        className={cn("section__filter-optional",
                            {"selected": filterConfig.status === v.value})}
                        onClick={() => onChangeFilterStatus(v.value)}>
                        {v.label}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/*BUTTONS*/}
              <div className="panel_section section_complete d-mobile-none d-desktop-flex">
                <div className="complete_action-left">
                  <GSButton success size={"normal"} onClick={onSubmitFilter}>
                      <GSTrans t={"common.btn.done"}/>
                  </GSButton>
                </div>
              </div>
            </div>
          </GSWidgetContent>
        </div>

        {/* DISPLAY ON MOBILE */}
        <div className="mega-filter-container_mobile_panel d-mobile-flex d-desktop-none">
          <GSModalFullBodyMobile title={i18next.t("productList.filter.header.title")}
            rightEl={
              <GSButton success onClick={onSubmitFilter}>
                  <GSTrans t={"common.btn.done"}/>
              </GSButton>
            }>
              <div className="filter-modal-wrapper">
                {/*BRANCH*/}
                <div className="filter-session">
                    <b className="filter-modal__title">
                      <GSTrans t={"page.home.card.branchFilter.title"}/>
                    </b>
                    <div className="section_branch_filter">
                      <UikSelect
                          value={[{value: String(filterConfig.branch) && String(filterConfig.branch).split(",").length !== 1  ? filterConfig.branch : +(filterConfig.branch)}]}
                        options={filterBranchValues}
                        onChange={(item) => onChangeFilterByBranch(item.value)}
                        position={"bottomRight"}
                      />
                    </div>
                </div>

                {/*COLLECTION*/}
                <div className="filter-session">
                    <b className="filter-modal__title">
                      <GSTrans t={"component.gsMegaFilter.filterLabel.collection"}/>
                    </b>
                    <div className="section_collection_filter">
                      <UikSelect
                          value={[{value: filterConfig.collection === 'ALL' ? filterConfig.collection : +(filterConfig.collection)}]}
                        options={filterCollectionValues}
                        onChange={(item) => onChangeFilterByCollection(item.value)}
                        position={"bottomRight"}
                      />
                    </div>
                </div>

                {/*PLATFORM FILTER*/}
                <div className="filter-session">
                    <b className="filter-modal__title">
                      <GSTrans t={"page.home.card.salePlatform.title"}/>
                    </b>
                    <UikFormInputGroup>
                      {filterSalePlatformValues.map(salePlatform => {
                        return (
                          <>
                            <UikRadio
                              defaultChecked={filterConfig.platform === salePlatform.value.toUpperCase()}
                              key={salePlatform.value}
                              value={salePlatform.value}
                              label={salePlatform.label}
                              name="salePlatformFilterGr"
                              onClick={() => onChangeFilterPlatform(salePlatform.value)}
                            />
                          </>
                        )
                      })}
                    </UikFormInputGroup>
                </div>

                {/*CHANNEL FILTER*/}
                <div className="filter-session">
                    <b className="filter-modal__title">
                      <GSTrans t={"page.home.card.saleChannels.title"}/>
                    </b>
                    <UikFormInputGroup>
                      {filterSaleChannelValues.map(saleChannel => {
                        return (
                          <>
                            <UikRadio
                              defaultChecked={filterConfig.channel === saleChannel.value.toUpperCase()}
                              key={saleChannel.value}
                              value={saleChannel.value}
                              label={saleChannel.label}
                              name="saleChannelFilterGr"
                              onClick={() => onChangeFilterChannel(saleChannel.value)}
                            />
                            {filterConfig.channel === 'SHOPEE' && filterConfig.channel === saleChannel.value.toUpperCase() &&
                            <select className="form-control" value={filterConfig.shopeeAccount}
                                    onChange={(e) => onChangeFilterByShopeeAccount(e.currentTarget.value)}
                            >
                              {filterShopeeAccountValues.map(v => (
                                  <option value={v.value}>{v.label}</option>
                              ))
                              }
                            </select>
                            }
                          </>
                        )
                      })}
                    </UikFormInputGroup>
                </div>
                {/*STATUS FILTER*/}
                <div className="filter-session">
                  <b className="filter-modal__title">
                    <GSTrans t={"component.discount.tbl.status"}/>
                  </b>
                  <UikFormInputGroup>
                    {filterStatusValues.map(status => {
                      return (
                        <UikRadio
                            defaultChecked={filterConfig.status === status.value.toUpperCase()}
                            key={status.value}
                            value={status.value}
                            label={status.label}
                            name="statusFilterGr"
                            onClick={() => onChangeFilterStatus(status.value)}
                        />
                      )
                    })}
                  </UikFormInputGroup>
                </div>
              </div>
            </GSModalFullBodyMobile>
          </div>
        </>}
      </div>
    </div>
  );
});

GSProductMegaFilter.defaultProps = {
  displayFilterAction: true,
  filterCount: 0,
  runFirstTime: false,
  storeBranch: []
}

GSProductMegaFilter.propTypes = {
  runFirstTime: PropTypes.bool,
  filterCount: PropTypes.number,
  displayFilterAction: PropTypes.bool,
  isShowFilter: PropTypes.bool,
  storeBranch: PropTypes.arrayOf(PropTypes.string),
  onFilter: PropTypes.func,
  onFilterEvery: PropTypes.func,
  onAccepted: PropTypes.func,
  defaultDataFilter:PropTypes.object
};

export default GSProductMegaFilter;
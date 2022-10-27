/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {RouteUtils} from '../../../utils/route';
import {TokenUtils} from "../../../utils/token";
import storeService from "../../../services/StoreService";
import {ItemService} from "../../../services/ItemService";
import './GSTourGuide.sass';
import Shepherd from 'shepherd.js';
import productStepConfig from './GSProductTourSteps';
import 'shepherd.js/dist/css/shepherd.css';
import Constants from '../../../config/Constant';
import PubSub from 'pubsub-js';
import {connect} from "react-redux";
import $ from 'jquery'
import {NavigationPath} from "../../../config/NavigationPath";

const defaultOptions = {
  defaultStepOptions: {
    classes: "shadow-md bg-purple-dark gs-tour-guide-product",
    cat: "ANY",
    scrollTo: {behavior: 'smooth', block: 'center'},
    exitOnEsc: false,
    keyboardNavigation: false,
    canClickTarget: true,
    popperOptions: {
      modifiers: [{ 
          name: "offset",
          options: { offset: [0, 20] }
      }],
    },/* 
    styleVariables: {
      shepherdElementZIndex: 20000,
    }, */
    clickTargetAction: "next",
    navTo: function(path) {
      if (!!sessionStorage.getItem(Constants.SHOW_MODAL_TURN_OF_GO_FREE)) return;
      if( path && path.indexOf(window.location.pathname) === -1){
        RouteUtils.redirectTo(path[0])
      }
    },
    dataStep: {},
    autoFocus: function() {
      const { target } = this;
      target.focus();
    },
    disabledTabKey: function(target) {
      target.addEventListener('keydown', function (e) {
        if (e.which === 9) {
            e.preventDefault();
        }
      });
    },
    cancelIcon: {
      enabled: false,
      label: "skip-product-tour"
    },
    actionClose: function(tour) {
      $(document).ready(function() {
          let close = $('button[aria-label="skip-product-tour"].shepherd-button-cancel-icon');
          if(close && close.length > 0) {
            $(close).bind("click", tour.options, function(){
              const {steps} = tour;
              steps.forEach((step) => {
                step.destroy();
              });
              tour.steps.length = 0;
              tour.options.completeTour(tour.options);
            });
          }
      });
    }
  },
  highlightClass: "highlight",
  exitOnEsc: false,
  useModalOverlay: true,
  disableScroll: true,
  updateTour: function() {
    const data = JSON.stringify(this.dataTour);
    try {
      storeService.updateStoreGuide({
        id: this.dataTour.id,
        storeId: this.dataTour.storeId,
        enabled: this.dataTour.enabled,
        guideProcess: data
      });
    } catch (error) {
      console.error(error);
    }
  },
  completeTour: function() {
    try {
      this.dataTour.enabled = false;
      storeService.updateStoreGuideEnabled({
        id: this.dataTour.id,
        storeId: this.dataTour.storeId,
        enabled: false,
      });
      PubSub.publish(this.topic.tour_complete);
    } catch (error) {
      console.error(error);
    }
  },
  dataTour: {},
  topic: {
    create_product_success: Constants.SUB_PUB_TOPIC.TOUR.CREATE_PRODUCT_SUCCESS,
    tour_pending: Constants.SUB_PUB_TOPIC.TOUR.PING_CREATE_PRODUCT.TOUR_PENDING,
    tour_complete: Constants.SUB_PUB_TOPIC.TOUR.PING_CREATE_PRODUCT.TOUR_COMPLETE,
    tour_running: Constants.SUB_PUB_TOPIC.TOUR.PING_CREATE_PRODUCT.TOUR_RUNNING,
    tour_escape: Constants.SUB_PUB_TOPIC.TOUR.PING_CREATE_PRODUCT.TOUR_ESCAPE,
  }
};

class GSTourGuide extends Component {

  STATUS = {
    START: "START",
    RUNNING: "RUNNING",
    PENDING: "PENDING",
    ESCAPE: "ESCAPE",
    COMPLETE: "COMPLETE"
  }

  constructor(props) {
    super(props);
    this.state = {
      firstTime: false,
      countItem: 0,
      guideEnabled: false,
      guideProcess: '{}',
      guideData: {},
      tourStatus: this.STATUS.START,
      pubsubTokens: []
    }
    this.changeScreenSize = this.changeScreenSize.bind(this);
    const config = productStepConfig(props.provider);
    this.tour = new Shepherd.Tour(defaultOptions);
    this.tour.addSteps(config);
    this.timerID = 0;
  }

  componentDidMount() {
    this.timerID = setTimeout(
      () => this.startTourGuide(),
      1000
    );
  }

  componentWillUnmount() {
    clearTimeout(this.timerID);
  }

  changeScreenSize() {
    if( ( window.innerWidth <= 785 ) && this.tour){
      this.tour.hide();
    } else if( this.tour ) {
      const {options} = this.tour;
      const sId = options.dataTour.from;
      this.tour.show(sId);
    }
  }

  startTourGuide() {
    //only apply tutorial guide for GoFREE
    if(!TokenUtils.onlyFreePackage() || window.location.pathname === NavigationPath.settingsPlans) return;
    Promise.all([ItemService.fetchDashboardItems({
      page: 0,
      size: 1,
      searchItemName: "",
      bhStatus: 'ACTIVE',
      itemType: "BUSINESS_PRODUCT"
    }), storeService.getStoreGuide()]).then((values) => {
      const totalItem = parseInt(values[0].headers['x-total-count']);
      const result = values[1];
      this.setState({countItem: totalItem});
      this.setState({guideEnabled: result.enabled});
      this.setState({guideProcess: result.guideProcess});
      this.setState({guideData: result});
      if(result.enabled && totalItem < 2) {
        this.getGuideProgress(result.guideProcess, this.tour);
        this.startTourFrom();
      }
    });
  }

  /**
   * 
   * @param {*} guideProcess 
   * @param {*} stepCongfig 
   * @returns {id: "", enabled: true, storeId: 0, from: "stepId", steps: {"stepId": {id: "stepId", cat: "", completed: false}}}
   */
  getGuideProgress(guideProcess, tour) {
    let oGuideProcess = JSON.parse(guideProcess || '{}');
    if(!oGuideProcess.hasOwnProperty("steps")) {
      //initial value
      oGuideProcess = {
        id: this.state.guideData.id,
        enabled: this.state.guideData.enabled,
        storeId: this.state.guideData.storeId,
        from: "create-product-tour-step-1",
        steps: {}
      }
    }
    const {steps} = tour;
    steps.forEach(step => {
        let {id, cat} = step.options;
        if(id && String(id) !== "undefined" && !oGuideProcess.steps.hasOwnProperty(id)) {
          oGuideProcess.steps[id] = {
            id: id,
            category: cat,
            completed: false,
          };
          step.updateStepOptions({dataStep: {
            id: id,
            category: cat,
            completed: false,
          }});
        }
    });
    if(oGuideProcess.steps[oGuideProcess.from].category === "CREATE_PRODUCT") {
      //it should restart from create new product
      if((oGuideProcess.from === "create-product-tour-step-9" ||
         oGuideProcess.from === "create-product-tour-step-10") &&
         this.state.countItem > 0) {
        oGuideProcess.from = "create-product-tour-step-11";
      } else {
        oGuideProcess.from = "create-product-tour-step-4";
      }
    }
    tour.options.dataTour = oGuideProcess;
    return oGuideProcess;
  }

  startTourFrom() {
    window.addEventListener('resize', this.changeScreenSize);
    const {steps, options} = this.tour;
    this.clearTourSubcription(this.tour);
    const sId = options.dataTour.from;
    const currentStep = steps.find(step => {return (step.id === sId)});
    if(currentStep.options && currentStep.options.path && currentStep.options.navTo) {
      currentStep.options.navTo(currentStep.options.path);
    }
    if(currentStep) {
      if( !(window.innerWidth <= 785) ) {
        this.tour.show(sId);
      }
    }
    this.pingCompleteTour(this.tour);
  }

  pingCompleteTour(tour) {
    let that = this;
    //register subscribers follow tour status
    PubSub.subscribe(tour.options.topic.tour_complete, function() {
      that.clearTourSubcription(tour);
      PubSub.unsubscribe(tour.options.topic.tour_complete);
      window.removeEventListener('resize', that.changeScreenSize);
    });
    PubSub.subscribe(tour.options.topic.tour_pending, function() {
      PubSub.unsubscribe(tour.options.topic.tour_pending);
      const currentStep = tour.getCurrentStep();
      if(currentStep.options && currentStep.options.path && currentStep.options.navTo) {
        currentStep.options.navTo(currentStep.options.path);
      }
    });
    PubSub.subscribe(tour.options.topic.tour_running, function() {
      PubSub.unsubscribe(tour.options.topic.tour_running);
    });
  }

  clearTourSubcription(tour) {
    PubSub.unsubscribe(tour.options.topic.tour_running);
    PubSub.unsubscribe(tour.options.topic.tour_pending);
    PubSub.unsubscribe(tour.options.topic.tour_complete);
    PubSub.unsubscribe(tour.options.topic.create_product_success);
  }

  render() {
    return (
      <>
      </>
    )
  }
};

GSTourGuide.defaultProps = {
    steps: [],
    step: {}
}

GSTourGuide.propTypes = {
    onStart: PropTypes.func,
    start: PropTypes.bool,
    steps: PropTypes.array,
    step: PropTypes.object
};

export default connect()(GSTourGuide);

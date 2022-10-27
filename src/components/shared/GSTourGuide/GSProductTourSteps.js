import $ from 'jquery';
import i18next from "./../../../config/i18n";
import {NAV_PATH} from "../../layout/navigation/Navigation";
import PubSub from 'pubsub-js';

const productStepConfig = (provider) => {
	return [{
			id: 'create-product-tour-step-1',
			path: [NAV_PATH.home, NAV_PATH.products],
			attachTo: {
				element: 'a[data-sherpherd="tour-product-step-1"]',
				on: 'auto-start'
			},
			beforeShowPromise: function() {
				if(this.navTo && this.path) this.navTo(this.path);
				return new Promise(function(resolve) {
					$(document).ready(function () {
						setTimeout(function () {
							resolve();
						}, 500);
					});
				})
			},
			buttons: [{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			},{
				classes: 'shepherd-button-next-icon',
				label: 'next',
				type: "next",
				text: "",
				action: function(event) {
					const {target} = this.getCurrentStep();
					target.click();
					this.show('create-product-tour-step-3');
				}
			}],
			text: [i18next.t("tour.guide.product.step1.content", {provider: provider})],
			when: {
				show: function() {
					const { options, target, tour } = this;
					options.actionClose(tour);
					if (target && options.clickTargetAction) {
						target.addEventListener("click", tour[options.clickTargetAction]);
					}
					//set completed this step
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				},
				hide: function() {
					const { options, target, tour } = this;
					if (target && options.clickTargetAction) {
						target.removeEventListener("click", tour[options.clickTargetAction]);
					}
				},
				next: function() {
					const { options, tour } = this;
					const nextStep = tour.getById("create-product-tour-step-3");
					if(nextStep.options && nextStep.options.path && options.navTo) {
						//options.navTo(nextStep.options.path);
					}
				}
			}
		},
		{
			id: 'create-product-tour-step-3',
			path: [NAV_PATH.products],
			attachTo: {
				element: 'button[data-sherpherd="tour-product-step-3"]',
				on: 'bottom-start'
			},
			beforeShowPromise: function() {
				//if(this.navTo && this.path) this.navTo(this.path);
				return new Promise(function(resolve) {
					$(document).ready(function () {
						setTimeout(function () {
							resolve();
						}, 500);
					});
				})
			},
			canClickTarget: true,
			buttons: [{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			},{
				classes: 'shepherd-button-next-icon',
				label: 'next',
				type: "next",
				text: "",
				action: function(event) {
					const {target} = this.getCurrentStep();
					target.click();
					this.show('create-product-tour-step-4');
				}
			}],
			text: [i18next.t("tour.guide.product.step3.content")],
			when: {
				show: function() {
					const { options, target, tour } = this;
					options.actionClose(tour);
					if (target && options.clickTargetAction) {
						target.addEventListener("click", tour[options.clickTargetAction]);
					}
					//set completed this step
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				},
				hide: function() {
					const { options, target, tour } = this;
					if (target && options.clickTargetAction) {
						target.removeEventListener("click", tour[options.clickTargetAction]);
					}
				},
				next: function() {
					const { options, tour } = this;
					const nextStep = tour.getById("create-product-tour-step-4");
					if(nextStep.options && nextStep.options.path && options.navTo) {
						//options.navTo(nextStep.options.path);
					}
				}
			}
		},
		{
			id: 'create-product-tour-step-4',
			path: [NAV_PATH.productCreate],
			cat: "CREATE_PRODUCT",
			attachTo: {
				element: 'input[data-sherpherd="tour-product-step-4"]',
				on: 'top'
			},
			beforeShowPromise: function() {
				//if(this.navTo && this.path) this.navTo(this.path);
				return new Promise(function(resolve) {
					$(document).ready(function () {
						setTimeout(function () {
							resolve();
						}, 500);
					});
				})
			},
			buttons: [{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			},{
				classes: 'shepherd-button-next-icon',
				label: 'next',
				type: "next",
				text: "",
				action: function() {
					this.show('create-product-tour-step-5');
				}
			}],
			text: [i18next.t("tour.guide.product.step4.content")],
			when: {
				show: function() {
					const { options, target, tour } = this;
					options.actionClose(tour);
					//set completed this step
					if (target && target.focus) {
						target.focus();
					}
					if (target && options.disabledTabKey) {
						options.disabledTabKey(target);
					}
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				},
				hide: function() {
				},
				complete: function() {
				}
			}
		},
		{
			id: 'create-product-tour-step-5',
			path: [NAV_PATH.productCreate],
			cat: "CREATE_PRODUCT",
			attachTo: {
				element: 'div[data-sherpherd="tour-product-step-5"]',
				on: 'top'
			},
			beforeShowPromise: function() {
				if(this.navTo && this.path) this.navTo(this.path);
				return new Promise(function(resolve) {
					$('section[class*="product-form-page"]').ready(function () {
						setTimeout(function () {
							resolve();
						}, 500);
					});
				})
			},
			buttons: [{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			},{
				classes: 'shepherd-button-back-icon',
				label: 'back',
				type: "back",
				text: "",
				action: function() {
					this.back();
				}
			},{
				classes: 'shepherd-button-next-icon',
				label: 'next',
				type: "next",
				text: "",
				action: function(event) {
					//const {target} = this.getCurrentStep();
					//target.click();
					this.show('create-product-tour-step-6');
				}
			}],
			text: [i18next.t("tour.guide.product.step5.content")],
			when: {
				show: function() {
					const { options, target, tour } = this;
					options.actionClose(tour);
					if (target && target.focus) {
						target.focus();
					}
					if (target && options.disabledTabKey) {
						options.disabledTabKey(target);
					}
					//set completed this step
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				},
				hide: function() {
				}
			}
		},
		{
			id: 'create-product-tour-step-6',
			path: [NAV_PATH.productCreate],
			cat: "CREATE_PRODUCT",
			attachTo: {
				element: 'div[data-sherpherd="tour-product-step-6"]',
				on: 'top'
			},
			beforeShowPromise: function() {
				if(this.navTo && this.path) this.navTo(this.path);
				return new Promise(function(resolve) {
					$('section[class*="product-form-page"]').ready(function () {
						setTimeout(function () {
							resolve();
						}, 500);
					});
				})
			},
			buttons: [{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			},{
				classes: 'shepherd-button-back-icon',
				label: 'back',
				type: "back",
				text: "",
				action: function() {
					this.back();
				}
			},{
				classes: 'shepherd-button-next-icon',
				label: 'next',
				type: "next",
				text: "",
				action: function(event) {
					this.show('create-product-tour-step-7.1');
				}
			}],
			scrollTo: {
				top: 400,
				behavior: 'smooth',
			},
			text: [i18next.t("tour.guide.product.step6.content")],
			when: {
				show: function() {
					const { options, target, tour } = this;
					options.actionClose(tour);
					//set completed this step
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				},
				hide: function() {
				}
			}
		},
		{
			id: 'create-product-tour-step-7.1',
			path: [NAV_PATH.productCreate],
			cat: "CREATE_PRODUCT",
			attachTo: {
				element: 'div[data-sherpherd="tour-product-step-7.1"]',
				on: 'top'
			},
			beforeShowPromise: function() {
				if(this.navTo && this.path) this.navTo(this.path);
				return new Promise(function(resolve) {
					$('section[class*="product-form-page"]').ready(function () {
						setTimeout(function () {
							resolve();
						}, 500);
					});
				})
			},
			buttons: [{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			},{
				classes: 'shepherd-button-back-icon',
				label: 'back',
				type: "back",
				text: "",
				action: function() {
					this.back();
				}
			},{
				classes: 'shepherd-button-next-icon',
				label: 'next',
				type: "next",
				text: "",
				action: function(event) {
					this.show('create-product-tour-step-7.2');
				}
			}],
			scrollTo: {
				top: 500,
				behavior: 'smooth',
			},
			text: [i18next.t("tour.guide.product.step7.1.content")],
			when: {
				show: function() {
					const { options, target, tour } = this;
					options.actionClose(tour);
					if (target && target.focus) {
						target.focus();
					}
					if (target && options.disabledTabKey) {
						options.disabledTabKey(target);
					}
					//set completed this step
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				},
				hide: function() {
				}
			}
		},
		{
			id: 'create-product-tour-step-7.2',
			path: [NAV_PATH.productCreate],
			cat: "CREATE_PRODUCT",
			attachTo: {
				element: 'div[data-sherpherd="tour-product-step-7.2"]',
				on: 'top'
			},
			beforeShowPromise: function() {
				if(this.navTo && this.path) this.navTo(this.path);
				return new Promise(function(resolve) {
					$('section[class*="product-form-page"]').ready(function () {
						setTimeout(function () {
							resolve();
						}, 500);
					});
				})
			},
			buttons: [{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			},{
				classes: 'shepherd-button-back-icon',
				label: 'back',
				type: "back",
				text: "",
				action: function() {
					this.back();
				}
			},{
				classes: 'shepherd-button-next-icon',
				label: 'next',
				type: "next",
				text: "",
				action: function(event) {
					this.show('create-product-tour-step-7.3');
				}
			}],
			scrollTo: {
				top: 500,
				behavior: 'smooth',
			},
			text: [i18next.t("tour.guide.product.step7.2.content")],
			when: {
				show: function() {
					const { options, target, tour } = this;
					options.actionClose(tour);
					if (target && target.focus) {
						target.focus();
					}
					if (target && options.disabledTabKey) {
						options.disabledTabKey(target);
					}
					//set completed this step
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				},
				hide: function() {
				}
			}
		},
		{
			id: 'create-product-tour-step-7.3',
			path: [NAV_PATH.productCreate],
			cat: "CREATE_PRODUCT",
			attachTo: {
				element: 'div[data-sherpherd="tour-product-step-7.3"]',
				on: 'top'
			},
			beforeShowPromise: function() {
				if(this.navTo && this.path) this.navTo(this.path);
				return new Promise(function(resolve) {
					$('section[class*="product-form-page"]').ready(function () {
						setTimeout(function () {
							resolve();
						}, 500);
					});
				})
			},
			buttons: [{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			},{
				classes: 'shepherd-button-back-icon',
				label: 'back',
				type: "back",
				text: "",
				action: function() {
					this.back();
				}
			},{
				classes: 'shepherd-button-next-icon',
				label: 'next',
				type: "next",
				text: "",
				action: function(event) {
					this.show('create-product-tour-step-8');
				}
			}],
			scrollTo: {
				top: 500,
				behavior: 'smooth',
			},
			text: [i18next.t("tour.guide.product.step7.3.content")],
			when: {
				show: function() {
					const { options, target, tour } = this;
					options.actionClose(tour);
					if (target && target.focus) {
						target.focus();
					}
					if (target && options.disabledTabKey) {
						options.disabledTabKey(target);
					}
					//set completed this step
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				},
				hide: function() {
				}
			}
		},
		{
			id: 'create-product-tour-step-8',
			path: [NAV_PATH.productCreate],
			cat: "CREATE_PRODUCT",
			attachTo: {
				element: 'div[data-sherpherd="tour-product-step-8"]',
				on: 'top'
			},
			beforeShowPromise: function() {
				if(this.navTo && this.path) this.navTo(this.path);
				return new Promise(function(resolve) {
					$('section[class*="product-form-page"]').ready(function () {
						setTimeout(function () {
							resolve();
						}, 500);
					});
				})
			},
			buttons: [{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			},{
				classes: 'shepherd-button-back-icon',
				label: 'back',
				type: "back",
				text: "",
				action: function() {
					this.back();
				}
			},{
				classes: 'shepherd-button-next-icon',
				label: 'next',
				type: "next",
				text: "",
				action: function(event) {
					//const {target} = this.getCurrentStep();
					//target.click();
					this.show('create-product-tour-step-9');
				}
			}],
			text: [i18next.t("tour.guide.product.step8.content")],
			when: {
				show: function() {
					const { options, target, tour } = this;
					options.actionClose(tour);
					if (target && target.focus) {
						target.focus();
					}
					if (target && options.disabledTabKey) {
						options.disabledTabKey(target);
					}
					//set completed this step
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				},
				hide: function() {
				}
			}
		},
		{
			id: 'create-product-tour-step-9',
			path: [NAV_PATH.productCreate],
			cat: "CREATE_PRODUCT",
			attachTo: {
				element: 'button[data-sherpherd="tour-product-step-create-success"]',
				on: 'bottom-end'
			},
			beforeShowPromise: function() {
				if(this.navTo && this.path) this.navTo(this.path);
				return new Promise(function(resolve) {
					$(document).ready(function () {
						setTimeout(function () {
							resolve();
						}, 500);
					});
				})
			},
			buttons: [{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			},{
				classes: 'shepherd-button-back-icon',
				label: 'back',
				type: "back",
				text: "",
				action: function() {
					this.back();
				}
			}],
			text: [i18next.t("tour.guide.product.step9.content")],
			subpubToken: "",
			when: {
				show: function() {
					const { options, target, tour } = this;
					options.actionClose(tour);
					if (target && options.clickTargetAction) {
						target.addEventListener("click", function() {
								PubSub.unsubscribe(tour.options.topic.create_product_success);
								options.subpubToken = PubSub.subscribeOnce(tour.options.topic.create_product_success, function() {
									PubSub.publish(tour.options.topic.tour_running);
									tour.show("create-product-tour-step-10");
								});
								//PubSub.publish(tour.options.topic.tour_pending);
								tour.cancel();
						});
					}
					//set completed this step
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				},
				hide: function() {
					const { options, target, tour } = this;
					if (target && options.clickTargetAction) {
						target.removeEventListener("click", tour[options.clickTargetAction]);
					}
				}
			}
		},
		{
			id: 'create-product-tour-step-10',
			path: [NAV_PATH.productCreate],
			cat: "CREATE_PRODUCT",
			attachTo: {
				element: 'button[data-sherpherd="tour-guide-alert-button-close"]',
				on: 'bottom-end'
			},
			beforeShowPromise: function() {
				return new Promise(function(resolve) {
					$('div[data-sherpherd="tour-guide-alert-modal"]').ready(function () {
						setTimeout(function () {
							resolve();
						}, 500);
					});
				})
			},
			buttons:[{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			}],
			text: [i18next.t("tour.guide.product.step10.content")],
			when: {
				show: function() {
					const { options, target, tour } = this;
					options.actionClose(tour);
					const prevTour = tour.getById("create-product-tour-step-9");
					if(prevTour && prevTour.options) {
						//PubSub.unsubscribe(prevTour.options.subpubToken);
					}
					PubSub.unsubscribe(tour.options.topic.create_product_success);
					if (target && options.clickTargetAction) {
						target.addEventListener("click", tour["next"]);
					}
					//set completed this step
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				},
				hide: function() {
					const { options, target, tour } = this;
					if (target && options.clickTargetAction) {
						target.removeEventListener("click", tour["next"]);
					}
				}
			}
		},
		{
			id: 'create-product-tour-step-11',
			path: [NAV_PATH.products],
			attachTo: {
				element: 'section.gs-table-body section:first-child',
				on: 'bottom-start'
			},
			beforeShowPromise: function() {
				return new Promise(function(resolve) {
					$(document).ready(function () {
						setTimeout(function () {
							resolve();
						}, 1000);
					});
				})
			},
			buttons: [{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			},{
				classes: 'shepherd-button-next-icon',
				label: 'next',
				type: "next",
				text: "",
				action: function() {
					this.show('create-product-tour-step-12');
				}
			}],
			canClickTarget: false,
			text: [i18next.t("tour.guide.product.step11.content")],
			when: {
				show: function() {
					const { options, tour } = this;
					options.actionClose(tour);
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				}
			}
		},
		{
			id: 'create-product-tour-step-12',
			path: [NAV_PATH.products, NAV_PATH.home, NAV_PATH.productCreate],
			attachTo: {
				element: 'div[class*="uik-top-bar-section__wrapper header-right"] div[class*="store-front-info"] div[class*="store-detail"]  > span[data-sherpherd="tour-guide-store-front-url"]',
				on: 'bottom-end'
			},
			beforeShowPromise: function() {
				return new Promise(function(resolve) {
					$(document).ready(function () {
						setTimeout(function () {
							resolve();
						}, 100);
					});
				})
			},
			canClickTarget: true,
			buttons: [{
				classes: 'shepherd-button-cancel-icon shepherd-button-primary',
				label: 'skip-product-tour',
				type: "cancel",
				text: i18next.t("tour.guide.product.button.skip"),
				action: function() {
					this.cancel();
				}
			}],
			text: [i18next.t("tour.guide.product.step12.content")],
			when: {
				show: function() {
					//set completed this step
					window.scrollTo(0, 0);
					const { options, target, tour } = this;
					options.actionClose(tour);
					PubSub.publish(tour.options.topic.tour_complete);
					if (target && options.clickTargetAction) {
						target.addEventListener("click", function(){
							tour.complete();
							tour.options.completeTour();
						});
					}
					options.dataStep.completed = true;
					tour.options.dataTour.from = options.id;
					tour.options.dataTour.steps[options.dataStep.id] = options.dataStep;
					tour.options.updateTour();
				},
				hide: function() {
					const { options, target } = this;
					if (target && options.clickTargetAction) {
						target.removeEventListener("click",  function(){
							const { tour } = this;
							tour.options.completeTour();
						});
					}
				}
			}
		}];
}

export default productStepConfig;

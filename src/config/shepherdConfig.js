import $ from 'jquery';
import i18next from "./i18n";


const steps = [
	{
		id: 'click-products-menu',
		attachTo: {
			element: 'a[data-sherpherd="tour-product-step-1"]',
			on: 'auto-start'
		},
		beforeShowPromise: function() {
			return new Promise(function(resolve) {
				$(".gs-page-content").ready(function () {
					setTimeout(function () {
						resolve();
					}, 1000);
				});
			})
		},
		buttons: [{
			classes: 'shepherd-button-primary',
			label: 'product-step-1',
			text: i18next.t("Next"),
			type: "next",
			action: function(event) {
				const {target} = this.getCurrentStep();
				target.click();
				this.show('click-products-list');
			}
		}],
		title: 'Click on product menu!',
		text: ['Arcu vitae elementum curabitur vitae nunc sed velit dignissim sodales ut eu sem integer vitae justo eget magna fermentum iaculis'],
		when: {
			show: (event) => {
				const currentStepElement =  this;
				/*const header = currentStepElement.querySelector('.shepherd-header');
				const progress = document.createElement('span');
				progress.style['margin-right'] = '315px';
				progress.innerText = `${this.steps.indexOf(this.currentStep) + 1}/${this.steps.length}`;
				header.insertBefore(progress, currentStepElement.querySelector('.shepherd-cancel-icon')); */
			},
			hide: (event) => {
			}
		}
	},
	{
		id: 'click-products-list',
		attachTo: {
			element: 'a[data-sherpherd="tour-product-step-2"]',
			on: 'auto-start'
		},
		beforeShowPromise: function() {
			return new Promise(function(resolve) {
				$(".gs-page-content").ready(function () {
					setTimeout(function () {
						resolve();
					}, 1000);
				});
			})
		},
		buttons: [{
			classes: 'shepherd-button-primary',
			label: 'product-step-2',
			text: i18next.t("Next"),
			type: 'next',
			action: function() {
				this.show("click-product-create");
			}
		}],
		scrollTo: false,
		title: 'Click on product management!',
		text: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
		when: {
			show: (shepherd) => {
				/* const currentStepElement = shepherd.currentStep.el;
				const header = currentStepElement.querySelector('.shepherd-header');
				const progress = document.createElement('span');
				progress.style['margin-right'] = '315px';
				progress.innerText = `${shepherd.steps.indexOf(shepherd.currentStep) + 1}/${shepherd.steps.length}`;
				header.insertBefore(progress, currentStepElement.querySelector('.shepherd-cancel-icon'));   */
			},
			hide: () => {
			}
		}
	},
	{
		id: 'click-product-create',
		attachTo: {
			element: 'button[data-sherpherd="tour-product-step-3"]',
			on: 'bottom-start'
		},
		beforeShowPromise: function() {
			return new Promise(function(resolve) {
				$(".gs-page-content").ready(function () {
					setTimeout(function () {
						resolve();
					}, 1000);
				});
			})
		},
		buttons: [{
			classes: 'shepherd-button-primary',
			label: 'product-step-3',
			text: i18next.t("Next"),
			type: 'next',
			action: function() {
				//const {target} = this.getCurrentStep();
				//target.click();
				this.show("click-product-create-fieldName");
			}
		}],
		scrollTo: false,
		title: 'Click on create product!',
		text: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
		when: {
			show: (shepherd) => {
			},
			hide: () => {
			}
		}
	},
	{
		id: 'click-product-create-fieldName',
		attachTo: {
			element: 'input[data-sherpherd="tour-product-step-4"]',
			on: 'left-start'
		},
		beforeShowPromise: function() {
			return new Promise(function(resolve) {
				$('section[class*="product-form-page"]').ready(function () {
					setTimeout(function () {
						resolve();
					}, 1000);
				});
			})
		},
		buttons: [{
			classes: 'shepherd-button-primary',
			label: 'product-step-4',
			text: i18next.t("Next"),
			type: 'next',
			action: function() {
				//const {target} = this.getCurrentStep();
				//target.value = "Giày sandal nữ";
				this.show("click-product-create-fieldDesc");
			}
		}],
		scrollTo: false,
		title: 'Input product name!',
		text: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
		when: {
			show: (shepherd) => {
			},
			hide: () => {
			}
		}
	},
	{
		id: 'click-product-create-fieldDesc',
		attachTo: {
			element: 'div[data-sherpherd="tour-product-step-5"]',
			on: 'left-start'
		},
		beforeShowPromise: function() {
			return new Promise(function(resolve) {
				$('section[class*="product-form-page"]').ready(function () {
					setTimeout(function () {
						resolve();
					}, 1000);
				});
			})
		},
		buttons: [{
			classes: 'shepherd-button-primary',
			label: 'product-step-4',
			text: i18next.t("Next"),
			type: 'next',
			action: function() {
				const {target} = this.getCurrentStep();
				target.lastElementChild.firstElementChild.value = "gravida arcu ac tortor dignissim convallis aenean et tortor at risus viverra adipiscing at in tellus integer feugiat scelerisque varius morbi enim nunc faucibus a pellentesque sit amet porttitor eget dolor morbi non arcu risus quis varius quam quisque id diam vel quam elementum pulvinar etiam non quam lacus suspendisse faucibus interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit duis tristique sollicitudin nibh sit amet commodo nulla facilisi nullam vehicula ipsum a arcu cursus vitae congue mauris rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas maecenas pharetra convallis posuere morbi leo urna molestie at elementum";
				this.show("click-product-create-fieldImage");
			}
		}],
		scrollTo: false,
		title: 'Enter description of product!',
		text: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
		when: {
			show: (shepherd) => {
			},
			hide: () => {
			}
		}
	},
	{
		id: 'click-product-create-fieldImage',
		attachTo: {
			element: 'div[data-sherpherd="tour-product-step-6"]',
			on: 'left-start'
		},
		beforeShowPromise: function() {
			return new Promise(function(resolve) {
				$('section[class*="product-form-page"]').ready(function () {
					setTimeout(function () {
						resolve();
					}, 1000);
				});
			})
		},
		buttons: [{
			classes: 'shepherd-button-primary',
			label: 'product-step-4',
			text: i18next.t("Next"),
			type: 'next',
			action: function() {
				//const {target} = this.getCurrentStep();
				//const file = target.querySelector("input[type='file'][multiple]");
				//file.src = "/assets/images/gosell-logo.svg";
				//file.filename = "gosell-logo.svg";
				this.show("click-product-create-fieldPrice");
			}
		}],
		scrollTo: false,
		title: 'Select images of product!',
		text: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
		when: {
			show: (shepherd) => {
			},
			hide: () => {
			}
		}
	},
	{
		id: 'click-product-create-fieldPrice',
		attachTo: {
			element: 'div[data-sherpherd="tour-product-step-7"]',
			on: 'left-start'
		},
		beforeShowPromise: function() {
			return new Promise(function(resolve) {
				$('section[class*="product-form-page"]').ready(function () {
					setTimeout(function () {
						resolve();
					}, 1000);
				});
			})
		},
		buttons: [{
			classes: 'shepherd-button-primary',
			label: 'product-step-7',
			text: i18next.t("Next"),
			type: 'next',
			action: function() {
				//const {target} = this.getCurrentStep();
				//target.value = 20000;
				this.show("click-product-create-fieldStockQ");
			}
		}],
		scrollTo: true,
		title: 'Input price of product!',
		text: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
		when: {
			show: (shepherd) => {
			},
			hide: () => {
			}
		}
	},
	{
		id: 'click-product-create-fieldStockQ',
		attachTo: {
			element: 'div[data-sherpherd="tour-product-step-8"]',
			on: 'left-start'
		},
		beforeShowPromise: function() {
			return new Promise(function(resolve) {
				$('section[class*="product-form-page"]').ready(function () {
					setTimeout(function () {
						resolve();
					}, 1000);
				});
			})
		},
		buttons: [{
			classes: 'shepherd-button-primary',
			label: 'product-step-8',
			text: i18next.t("Next"),
			type: 'next',
			action: function() {
				//const {target} = this.getCurrentStep();
				//target.value = 20;
				this.show("click-product-create-success");
			}
		}],
		scrollTo: true,
		title: 'Input quantity of product!',
		text: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
		when: {
			show: (shepherd) => {
			},
			hide: () => {
			}
		}
	},
	{
		id: 'click-product-create-success',
		attachTo: {
			element: 'button[data-sherpherd="tour-product-step-create-success"]',
			on: 'right-end'
		},
		beforeShowPromise: function() {
			return new Promise(function(resolve) {
				$('section[class*="product-form-page"]').ready(function () {
					setTimeout(function () {
						resolve();
					}, 1000);
				});
			})
		},
		buttons: [{
			classes: 'shepherd-button-primary',
			label: 'product-step-create-success',
			text: i18next.t("Next"),
			type: 'next',
			action: function() {
				//const {target} = this.getCurrentStep();
				//target.click();
				this.next("select-product-firstrow");
			}
		}],
		scrollTo: true,
		title: 'Save new product!',
		text: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
		when: {
			show: (shepherd) => {
			},
			hide: () => {
			}
		}
	},
	{
		id: 'select-product-firstrow',
		attachTo: {
			element: 'button[data-sherpherd="tour-product-step-create-success"]',
			on: 'right-end'
		},
		beforeShowPromise: function() {
			return new Promise(function(resolve) {
				$(".gs-page-content").ready(function () {
					setTimeout(function () {
						resolve();
					}, 1000);
				});
			})
		},
		buttons: [{
			classes: 'shepherd-button-primary',
			label: 'product-step-create-success',
			text: i18next.t("Next"),
			type: 'next',
			action: function() {
				//const {target} = this.getCurrentStep();
				this.complete("click-product-create-fieldPrice");
			}
		}],
		scrollTo: true,
		title: 'list of product!',
		text: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
		when: {
			show: (shepherd) => {
			},
			hide: () => {
			}
		}
	}
];

export default steps;
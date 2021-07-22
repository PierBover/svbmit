import {ValidationStates, ValidateOn, FieldTypes, FormStates, FormEvents, InputTypes} from './enums/index.js';
import {getFormInputElements, getValueOrDefault} from './utils/index.js';
import HtmlField from './HtmlField.js';
import GroupField from './GroupField.js';

const {VALID, INVALID, PENDING} = ValidationStates;
const {INSTANT_AFTER_SUBMIT} = ValidateOn;

export default class FormController {
	constructor (config) {

		this.stores = {};
		this.fields = [];

		this.formSubmitState = FormStates.UNSUBMITTED;
		this.formValidationState = PENDING;

		// Bind handlers
		this.onSubmitEvent = this.onSubmitEvent.bind(this);

		// Settings
		this.settings = {};
		this.settings.errorMessages = config.errorMessages || {};
		this.settings.onSubmitCallback = config.onSubmit;
		this.settings.useNativeErrorTooltips = getValueOrDefault(config.useNativeErrorTooltips, false);
		this.settings.validClass = getValueOrDefault(config.validClass, 'valid');
		this.settings.invalidClass = getValueOrDefault(config.invalidClass, 'invalid');
		this.settings.validateOn = getValueOrDefault(config.validateOn, INSTANT_AFTER_SUBMIT);
		this.settings.clearErrorsOnInput = getValueOrDefault(config.clearErrorsOnInput, true);
		this.settings.hideErrorsOnChange = getValueOrDefault(config.hideErrorsOnChange, false);
		this.settings.addValidClassToAllInputs = getValueOrDefault(config.addValidClassToAllInputs, false);
		this.settings.instantValidationTimeout = getValueOrDefault(config.instantValidationTimeout, 250);

		this.initFieldsSettings(config.fields || {});
		this.initFields();

		// Init form
		this.formElement = config.form;

		// Disable native error tooltips
		if (!this.settings.useNativeErrorTooltips) this.formElement.setAttribute('novalidate', true);

		this.formElement.addEventListener('submit', this.onSubmitEvent);

		// DOM Mutation Observer
		this.observer = new MutationObserver(this.onDOMMutation.bind(this));
		this.observer.observe(this.formElement, {attributes: false, childList: true, subtree: true});

		this.updateFieldsFromDom();
		this.stores.formState = config.formState;
		this.stores.errors = config.errors;
		this.updateFormState();
	}

	destroy () {}

	onSubmitEvent (event) {

		event.preventDefault();

		this.validateAllFields();
		this.updateFormState();

		if (this.formValidationState === VALID) {
			this.formSubmitState = FormStates.SUBMITTED;
			this.settings.onSubmitCallback(this.getFormValues());
		}
	}

	onDOMMutation (event) {
		window.requestAnimationFrame(() => {
			this.updateFieldsFromDom();
			this.updateFormState();
		})
	}

	// STATE

	getFormState () {
		const state = {
			state: this.formSubmitState,
			validationState: this.formValidationState,
			touched: false
		}

		this.fields
		// Get the group fields value last
		.sort((field) => {
			if (field.type === FieldTypes.GROUP) return -1;
			return 1
		})
		.forEach((field) => {
			if (!field.isOrphan) {
				const fieldState = field.getState();
				state[field.name] = fieldState;
			}

			if (field.touched) state.touched = true;
		});

		return state;
	}

	getDisplayedErrors () {
		const errors = {};

		this.fields.forEach((field) => {
			if (!field.isOrphan && field.displayError && field.error) errors[field.name] = field.error;
		});

		return errors;
	}

	updateFormValidationState () {
		let newValidationState = VALID;

		this.fields.forEach((field) => {
			// Ignore orphan fields
			if (field.isOrphan) return;
			// If the form has been set to invalid we don't need to check any other fields
			if (newValidationState !== INVALID) {
				if (field.validationState !== VALID) newValidationState = field.validationState;
			}
		});

		this.formValidationState = newValidationState;
	}

	updateFormState () {
		this.updateFormValidationState();
		this.updateStores();
	}

	updateStores () {
		if (this.stores.formState) {
			const formState = this.getFormState();
			this.stores.formState.set(formState);
		}

		if (this.stores.errors) this.stores.errors.set(this.getFormErrors());
	}

	getFormErrors (formState) {
		const errors = {};

		this.fields.forEach((field) => {
			if (field.error) errors[field.name] = field.error;
		});

		return errors;
	}

	// FIELDS

	initFieldsSettings (fieldsSettings) {
		this.fieldsSettings = Object.keys(fieldsSettings).map((name) => {

			const settings = fieldsSettings[name];

			settings.name = name;
			settings.type = FieldTypes.HTML;
			settings.controller = this;

			if (!settings.validateOn) settings.validateOn = this.settings.validateOn;

			if (settings.fields) {
				settings.type = FieldTypes.GROUP;
			}

			return settings;
		});
	}

	// Init the fields in the settings config

	initFields() {
		const groups = [];

		this.fieldsSettings.forEach((settings) => {

			switch (settings.type) {
				case FieldTypes.HTML:
					settings.parentGroupField = this.getParentGroupField(settings.name);
					this.fields.push(new HtmlField(settings));
					break;
				case FieldTypes.GROUP:
					this.fields.push(new GroupField(settings));
					break;
			}
		});
	}

	getFieldByName (name) {
		return this.fields.find((field) => field.name === name);
	}

	// Create or update fields for each form element
	updateFieldsFromDom () {
		const inputElements = getFormInputElements(this.formElement);

		const radioGroups = {};

		// Get all radio groups

		inputElements.forEach((element) => {
			if (element.type === InputTypes.RADIO) {
				const name = element.name;

				if (!radioGroups[name]) {
					radioGroups[name] = [element];
				} else {
					radioGroups[name].push(element);
				}
			}
		});

		inputElements.forEach((element) => {

			let elements;

			if (element.type === InputTypes.RADIO) {
				let group = radioGroups[element.name];
				if (!group) return;
				elements = group;
				group = null;
			} else {
				elements = [element];
			}

			const field = this.getFieldByName(elements[0].name);

			if (field && field.type === FieldTypes.HTML) {
				// If the field already exists, just update the element
				field.updateElements(elements);
			} else {
				// If not, create a new field and use config settings (if any)
				let settings = this.fieldsSettings.find((settings) => settings.name === element.name);

				// If there are no settings for this field, create blank settings
				if (!settings) {
					settings = {
						name: element.name,
						type: FieldTypes.HTML,
						controller: this,
						validateOn: this.settings.validateOn,
						parentGroupField: this.getParentGroupField(element.name)
					};
				}

				settings.elements = elements;

				this.fields.push(new HtmlField(settings));
			}
		});
	}

	getParentGroupField (childName) {
		for (let i = 0; i < this.fields.length; i++) {
			const field = this.fields[i];
			if (field.type === FieldTypes.GROUP && field.fields.indexOf(childName) !== -1) return field;
		}
	}

	validateAllFields () {
		this.fields
		// Validate the group fields value last
		.sort((field) => {
			if (field.type === FieldTypes.GROUP) return -1;
			return 1
		})
		.forEach((field) => {
			field.onEvent({type: FormEvents.SUBMIT});
		});
	}

	getFormValues () {
		const values = {};

		this.fields.forEach((field) => {
			values[field.name] = field.value
		});

		return values;
	}
}
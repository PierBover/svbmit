import {ValidationStates, ValidateOn, FieldTypes, FormStates, FormEvents, InputTypes} from './enums/index.js';
import {getFormInputElements, getValueOrDefault} from './utils/index.js';
import HtmlField from './HtmlField.js';
import GroupField from './GroupField.js';

const {VALID, INVALID, PENDING} = ValidationStates;
const {INSTANT_AFTER_SUBMIT} = ValidateOn;

export default class ValidationController {

	static defaultSettings = {
		useNativeErrorTooltips: false,
		validClass: 'valid',
		invalidClass: 'invalid',
		validateOn: INSTANT_AFTER_SUBMIT,
		addValidClassToAllInputs: false,
		removeValidationClassesOnSubmit: true,
		aliasAttributeName: 'data-alias'
	};

	static setDefaultSettings (settings) {
		for (const [key, value] of Object.entries(settings)) {
			if (this.defaultSettings.hasOwnProperty(key)) this.defaultSettings[key] = value;
		}
	}

	constructor (config) {
		
		this.stores = {};
		this.fields = [];
		
		this.formSubmitState = FormStates.UNSUBMITTED;
		this.formValidationState = PENDING;
		
		// Bind handlers
		this.onSubmitEvent = this.onSubmitEvent.bind(this);
		
		// Settings
		this.settings = {};
		this.settings.onSubmitCallback = config.onSubmit;
		this.settings.useNativeErrorTooltips = getValueOrDefault(config.useNativeErrorTooltips, ValidationController.defaultSettings.useNativeErrorTooltips);
		this.settings.validClass = getValueOrDefault(config.validClass, ValidationController.defaultSettings.validClass);
		this.settings.invalidClass = getValueOrDefault(config.invalidClass, ValidationController.defaultSettings.invalidClass);
		this.settings.validateOn = getValueOrDefault(config.validateOn, ValidationController.defaultSettings.validateOn);
		// Setting to force valid class on checkboxes, radio buttons, and selects
		this.settings.addValidClassToAllInputs = getValueOrDefault(config.addValidClassToAllInputs, ValidationController.defaultSettings.addValidClassToAllInputs);
		this.settings.removeValidationClassesOnSubmit = getValueOrDefault(config.removeValidationClassesOnSubmit, ValidationController.defaultSettings.removeValidationClassesOnSubmit);
		this.settings.aliasAttributeName = getValueOrDefault(config.aliasAttributeName, ValidationController.defaultSettings.aliasAttributeName);
		
		this.initFieldsSettings(config.fields || {});
		this.initGroupFields();
		
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
			if (this.settings.removeValidationClassesOnSubmit) this.removeCssClassesFromHtmlInputs();
			this.formSubmitState = FormStates.SUBMITTED;
			this.settings.onSubmitCallback(this.getFormValues());
		}
	}
	
	onDOMMutation (event) {
		window.requestAnimationFrame(() => {
			this.updateFieldsFromDom();
			this.updateFormState();
		});
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
	
	// Init the fields' settings

	initFieldsSettings (fieldsSettings) {
		this.fieldsSettings = Object.keys(fieldsSettings).map((name) => {
			
			const settings = fieldsSettings[name];
			
			settings.name = name;
			settings.controller = this;
			
			if (!settings.validateOn) settings.validateOn = this.settings.validateOn;
			
			if (settings.fields) {
				settings.type = FieldTypes.GROUP;
			} else {
				settings.type = FieldTypes.HTML;
			}
			
			return settings;
		});
	}
	
	initGroupFields() {		
		this.fieldsSettings.forEach((settings) => {
			if (settings.type === FieldTypes.GROUP) {
				this.fields.push(new GroupField(settings));
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
		
		// Get all radio inputs and put them in a group
		
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
				elements = radioGroups[element.name];
				if (!elements) return;
			} else {
				elements = [element];
			}
			
			const field = this.getFieldByName(elements[0].name);

			// If the field already exists, just update the element
			if (field && field.type === FieldTypes.HTML) {				
				field.updateElements(elements);
			} else {
				// If not, create a new field and use config settings (if any)
				let settings = this.getSettingsForInput(elements[0]);
				
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

		// Delete orphaned fields after removing HTML elements from the DOM
		this.removeOrphannedFields();

	}

	getSettingsForInput (element) {

		const alias = element.getAttribute(this.settings.aliasAttributeName);

		if (alias) {
			return this.fieldsSettings.find((settings) => settings.name === alias);
		} else {
			return this.fieldsSettings.find((settings) => settings.name === element.name);
		}		
	}

	removeOrphannedFields () {
		this.fields = this.fields.filter((field) => {
			if (field instanceof HtmlField) {
				// Check if all the elements of the field are present in the DOM
				// There could be more than one element because of radio groups
				for (let i = 0; i < field.elements.length; i++) {
					if (!document.body.contains(field.elements[i]))	return false;
				}
			}

			return field;
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
	
	removeCssClassesFromHtmlInputs () {
		this.fields.forEach((field) => {
			if (field instanceof HtmlField) field.removeCssClasses();
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
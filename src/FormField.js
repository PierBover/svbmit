import {FieldTypes, ValidationStates, ValidateOn, FormInputEvents, InputTypes, FormEvents} from './enums/index.js';
import {getInputElementState} from './utils/index.js';

const {HTML, VIRTUAL, CUSTOM, GROUP} = FieldTypes;
const {PENDING, VALID, INVALID} = ValidationStates;
const {INSTANT, BLUR, INSTANT_AFTER_SUBMIT} = ValidateOn;

export default class HtmlField {
	constructor (settings) {
		this.validationState = PENDING;

		this.name = settings.name;
		this.validators = settings.validators;
		this.validateOn = settings.validateOn;
		this.controller = settings.controller;

		this.touched = false;
		this.error = null;
		this.value = settings.value;
		this.hasSubmitted = false;

		this.parentGroupField = settings.parentGroupField;

		this.isOrphan = false;
		this.isGroupChild = settings.parentGroupField ? true : false;
	}

	onEvent (event) {

		this.updateValue();

		switch (event.type) {
			case FormInputEvents.INPUT:
				this.touched = true;
				if (this.validateOn === INSTANT) this.validate();
				else if (this.hasSubmitted && this.validateOn === INSTANT_AFTER_SUBMIT) this.validate();
				else this.clearValidation();
				break;
			case FormInputEvents.BLUR:
				if (this.validateOn === BLUR || this.validateOn === INSTANT) this.validate();
				break;
			case FormInputEvents.FOCUS:
				break;
			case FormEvents.SUBMIT:
				this.hasSubmitted = true;
				this.validate();
				break;
		}

		// if (this.isGroupChild) this.parentGroupField.onEvent(event);
		// else if (event.type !== FormEvents.SUBMIT) this.controller.updateFormState();

		if (event.type !== FormEvents.SUBMIT) this.controller.updateFormState();

	}

	// Methods to be overriden by sub classes
	updateValue () {}
	validate () {}
	getState () {}

	clearValidation () {
		this.error = null;
		this.validationState = PENDING;
	}

	customValidate () {
		if (this.validators) {
			for (let i = 0; i < this.validators.length; i++) {
				const validator = this.validators[i];
				const result = validator(this.value, this.controller.getFormState());

				if (result.then) throw `Custom sync validators can't return a promise`;

				// We stop once a validator returns anything but true
				if (result !== true) return result;
			}
		}

		return true;
	}

	updateValidationState () {
		// If there's an error it's invalid
		if (this.error) {
			this.validationState = INVALID;
		} else {
			this.validationState = VALID;
		}
	}
}
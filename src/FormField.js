import {FieldTypes, ValidationStates, ValidateOn, FormInputEvents, FormEvents} from './enums/index.js';

const {HTML, VIRTUAL, CUSTOM, GROUP} = FieldTypes;
const {PENDING, VALID, INVALID} = ValidationStates;
const {INSTANT, BLUR, INSTANT_AFTER_SUBMIT, INSTANT_VALID} = ValidateOn;

export default class FormField {
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

		if (this.isOrphan) return;

		switch (event.type) {
			case FormInputEvents.INPUT:
				this.touched = true;
				this.updateValue();
				this.clearValidation();

				if (
					this.validateOn === INSTANT ||
					(this.hasSubmitted && this.validateOn === INSTANT_AFTER_SUBMIT)
				) {
					this.updateValidationState();
				} else if (this.validateOn === INSTANT_VALID) {
					const {state, error} = this.getValidationState();
					if (state === VALID) this.setValidationState({state, error});
				}
				break;
			case FormInputEvents.BLUR:
				if (
					this.validationState !== VALID &&
					(this.validateOn === BLUR || this.validateOn === INSTANT)
				) this.updateValidationState();
				break;
			case FormInputEvents.FOCUS:
				break;
			case FormEvents.SUBMIT:
				this.hasSubmitted = true;
				this.updateValidationState();
				break;
		}

		// if (this.isGroupChild) this.parentGroupField.onEvent(event);
		// else if (event.type !== FormEvents.SUBMIT) this.controller.updateFormState();

		if (event.type !== FormEvents.SUBMIT) this.controller.updateFormState();

	}

	// Methods to be overriden by sub classes
	updateValue () {}
	getValidationState () {}
	getState () {}
	setCssClassToGroupFields () {}


	updateValidationState () {
		const state = this.getValidationState();
		this.setValidationState(state);
	}

	setValidationState ({state, error}) {
		this.error = error;
		this.validationState = state;

		if (this.type === HTML) {
			// If the field is group child and valid remove the css class so that
			// it can bet set by the group field
			if (this.isGroupChild && state === VALID) this.setCssClass(null);
			else this.setCssClass(state);

			if (this.isGroupChild) this.parentGroupField.updateValidationState();
		}

		if (this.type === GROUP && state !== PENDING) this.setCssClassToGroupFields(state);
	}

	clearValidation () {
		this.setValidationState({state: PENDING, error: null});
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
}
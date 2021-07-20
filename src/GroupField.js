import {FieldTypes, ValidationStates, ValidateOn, FormInputEvents, InputTypes, FormEvents} from './enums/index.js';
import FormField from './FormField.js';

const {GROUP} = FieldTypes;
const {PENDING, VALID, INVALID} = ValidationStates;
const {INSTANT, BLUR, INSTANT_AFTER_SUMIT} = ValidateOn;

export default class GroupField extends FormField {
	constructor (settings) {
		super(settings);
		this.type = GROUP;
		this.fields = settings.fields;
		this.computedValue = settings.computedValue;
	}

	updateValue () {
		const groupValues = this.getGroupValues();
		this.value = this.computedValue(groupValues);
	}

	getGroupFields () {
		return this.fields.map((fieldName) => this.controller.getFieldByName(fieldName));
	}

	getGroupValues () {
		const fields = this.getGroupFields();
		const values = {};

		fields.forEach((field) => {
			values[field.name] = field.value;
		});

		return values;
	}

	clearValidation () {
		this.error = null;
		this.validationState = PENDING;
	}

	validate () {

		// First check all fields in the group are VALID
		// otherwise the validation of the whole group will be PENDING
		const fields = this.getGroupFields();

		for (const field of fields) {
			if (field.validationState !== VALID) {
				this.error = null;
				this.validationState = PENDING;
				return;
			}
		}


		const result = this.customValidate();

		if (result !== true) {
			this.error = result;
			this.validationState = INVALID;
			this.setCssClassToGroupFields(INVALID);
			return;
		}

		this.error = null;
		this.validationState = VALID;
		this.setCssClassToGroupFields(VALID);
	}

	setCssClassToGroupFields (validationState) {
		const fields = this.getGroupFields();
		for (const field of fields) {
			field.setCssClass(validationState);
		}
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

		// if (this.isGroupChild) {
		// 	this.groupValidationState = this.parentGroupField.validationState;
		// }

		// if (this.type === GROUP) {

		// 	const childFields = this.fields.map((name) => this.controller.getFieldByName(name));

		// 	childFields.forEach((childField) => {
		// 		if (
		// 			this.validationState === VALID &&
		// 			childField.validationState === INVALID
		// 		) {
		// 			this.validationState = INVALID;
		// 		}
		// 	});

		// 	childFields.forEach((childField) => {
		// 		childField.groupValidationState = this.validationState;
		// 		childField.displayError = this.displayError;
		// 		childField.updateCssClasses();
		// 	});
		// }
	}

	getState () {
		this.updateValue();

		const state = {
			error: this.error || undefined,
			value: this.value,
			validationState: this.validationState
		}

		return state;
	}
}
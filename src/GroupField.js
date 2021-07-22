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

	getValidationState () {

		// First check all fields in the group are VALID
		// otherwise the validation of the whole group will be PENDING
		const fields = this.getGroupFields();

		for (const field of fields) {
			if (field.validationState !== VALID) {
				return {
					error: null,
					state: PENDING
				};
			}
		}


		const result = this.customValidate();

		if (result !== true) {
			return {
				error: result,
				state: INVALID
			};
		}

		return {
			error: null,
			state: VALID
		};
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
import {FieldTypes, ValidationStates, ValidateOn, FormInputEvents, InputTypes, FormEvents} from './enums/index.js';
import {getInputElementState} from './utils/index.js';
import FormField from './FormField.js';

const {HTML} = FieldTypes;
const {PENDING, VALID, INVALID} = ValidationStates;

export default class HtmlField extends FormField {
	constructor (settings) {

		super(settings);

		// Bind handler
		this.onEvent = this.onEvent.bind(this);

		// this.groupValidationState = PENDING;

		this.type = HTML;

		if (settings.element) {
			this.element = settings.element;
			this.initFieldFromElement();
		} else {
			this.isOrphan = true;
		}
	}

	updateElement (element) {
		this.isOrphan = false;
		this.element = element;
		this.initFieldFromElement();
	}

	initFieldFromElement () {
		this.elementType = this.element.type;
		const {name, value} = getInputElementState(this.element);
		this.name = name;
		this.value = value;
		this.addEventListeners();
	}

	addEventListeners () {
		this.element.addEventListener('input', this.onEvent);
		this.element.addEventListener('focus', this.onEvent);
		this.element.addEventListener('blur', this.onEvent);
	}

	removeEventListeners () {
		this.element.removeEventListener('input', this.onEvent);
		this.element.removeEventListener('blur', this.onEvent);
		this.element.removeEventListener('focus', this.onEvent);
	}

	updateValue () {
		const {value} = getInputElementState(this.element);
		this.value = value;
	}

	validate () {

		// Native browser validation
		const {nativeError} = getInputElementState(this.element);

		if (nativeError) {
			this.error = nativeError;
			this.validationState = INVALID;
			this.setCssClass(INVALID);
			return;
		}

		// Custom validation
		const result = this.customValidate();

		if (result !== true) {
			this.error = result;
			this.validationState = INVALID;
			this.setCssClass(INVALID);
			return;
		}

		this.error = null;
		this.validationState = VALID;
		if (!this.isGroupChild) this.setCssClass(VALID);
		else  this.setCssClass(null);

		if (this.isGroupChild) this.parentGroupField.validate();
	}

	getState () {
		const state = {
			error: this.error || undefined,
			value: this.value,
			validationState: this.validationState,
			touched: this.touched
		}

		if (this.isGroupChild) state.groupValidationState = this.groupValidationState;

		return state;
	}

	setCssClass (validationState) {

		const {validClass, invalidClass, addValidClassToAllInputs} = this.controller.settings;
		this.element.classList.remove(validClass, invalidClass);

		if (!validationState || validationState === PENDING) return;

		if (
			validationState === INVALID &&
			invalidClass
		) {
			this.element.classList.add(invalidClass);
			return;
		}

		if (
			validationState === VALID &&
			validClass &&
			(
				addValidClassToAllInputs ||
				(
					this.elementType !== InputTypes.CHECKBOX &&
					this.elementType !== InputTypes.RADIO &&
					this.elementType !== InputTypes.SELECT &&
					this.elementType !== InputTypes.SELECT_MULTIPLE
				)
			)
		) {
			this.element.classList.add(validClass);
			return;
		}
	}
}
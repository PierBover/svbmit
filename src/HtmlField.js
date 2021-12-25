import {FieldTypes, ValidationStates, InputTypes} from './enums/index.js';
import {getInputElementsState} from './utils/index.js';
import FormField from './FormField.js';

const {HTML} = FieldTypes;
const {PENDING, VALID, INVALID} = ValidationStates;

export default class HtmlField extends FormField {
	constructor (settings) {

		super(settings);

		this.elements = [];
		this.type = HTML;

		// Bind handler
		this.onEvent = this.onEvent.bind(this);

		if (settings.elements) {
			this.elements.push(...settings.elements);
			this.initFieldFromElements();
		} else {
			this.isOrphan = true;
		}
	}

	updateElements (elements) {
		this.isOrphan = false;
		this.elements = elements;
		this.initFieldFromElements();
	}

	initFieldFromElements () {

		const {name, value, type} = getInputElementsState(this.elements);
		this.name = name;
		this.value = value;
		this.elementType = type;

		for (const element of this.elements) {
			this.addEventListenersToElement(element);
		}
	}

	addEventListenersToElement (element) {
		element.addEventListener('input', this.onEvent);

		if (this.elementType !== InputTypes.RADIO) {
			element.addEventListener('focus', this.onEvent);
			element.addEventListener('blur', this.onEvent);
		}
	}

	removeEventListenersFromElement (element) {
		element.removeEventListener('input', this.onEvent);

		if (this.elementType !== InputTypes.RADIO) {
			element.removeEventListener('blur', this.onEvent);
			element.removeEventListener('focus', this.onEvent);
		}
	}

	updateValue () {
		const {value} = getInputElementsState(this.elements);
		this.value = value;
	}

	getValidationState () {

		// Native browser validation
		const {nativeError} = getInputElementsState(this.elements);

		if (nativeError) {
			return {
				error: nativeError,
				state: INVALID
			};
		}

		// Custom validation
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

	setCssClassFromValidationState (validationState) {
		const {validClass, invalidClass, addValidClassToAllInputs} = this.controller.settings;

		this.removeCssClasses();

		if (!validationState || validationState === PENDING) return;

		if (
			validationState === INVALID &&
			invalidClass
		) {
			this.setCssClass(invalidClass);
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
			this.setCssClass(validClass);
		}
	}

	removeCssClasses () {
		const {validClass, invalidClass} = this.controller.settings;
		for (const element of this.elements) element.classList.remove(validClass, invalidClass);
	}

	setCssClass (className) {
		for (const element of this.elements) element.classList.add(className);
	}
}
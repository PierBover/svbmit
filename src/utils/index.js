import {InputTypes, NativeValidationErrors} from '../enums/index.js';

export function getFormInputElements (form) {
	const htmlCollection = form.elements;
	const inputs = [];

	for (var i = 0; i < htmlCollection.length; i++) {
		if (htmlCollection[i].type === InputTypes.SUBMIT) continue;
		inputs.push(htmlCollection[i]);
	}

	return inputs;
}

export function getInputElementState (input) {
	let {name: inputName, type, value, checked} = input;

	switch (type) {
		case InputTypes.CHECKBOX:
			value = checked;
		case InputTypes.RADIO:
			if (!checked) value = '';
			break;
	}

	const name = inputName;

	// const {name, alias} = parseInputName(inputName);

	const inputState = {name, value, type};

	if (!input.validity.valid) {
		inputState.nativeError = getErrorFromValidity(input.validity);
	}

	return inputState;
}

export function getValueOrDefault (value, defaultValue) {
	if (typeof value !== 'undefined') return value;
	else return defaultValue;
}

export function getErrorFromValidity (validity) {
	if (validity.valueMissing) return NativeValidationErrors.VALUE_MISSING;
	if (validity.typeMismatch) return NativeValidationErrors.TYPE_MISMATCH;
	if (validity.badInput) return NativeValidationErrors.BAD_INPUT;
	if (validity.patternMismatch) return NativeValidationErrors.PATTERN_MISMATCH;
	if (validity.rangeOverflow) return NativeValidationErrors.RANGE_OVERFLOW;
	if (validity.rangeUnderflow) return NativeValidationErrors.RANGE_UNDERFLOW;
	if (validity.stepMismatch) return NativeValidationErrors.STEP_MISMATCH;
	if (validity.tooLong) return NativeValidationErrors.TOO_LONG;
	if (validity.tooShort) return NativeValidationErrors.TOO_SHORT;

	throw 'Unknown native validation error';
}
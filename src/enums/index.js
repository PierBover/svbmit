export const InputTypes = {
	SUBMIT: 'submit',
	CHECKBOX: 'checkbox',
	RADIO: 'radio',
	SELECT: 'select',
	SELECT_MULTIPLE: 'select-multiple'
}

export const NativeValidationErrors = {
	BAD_INPUT: 'badInput',
	PATTERN_MISMATCH: 'patternMismatch',
	RANGE_OVERFLOW: 'rangeOverflow',
	RANGE_UNDERFLOW: 'rangeUnderflow',
	STEP_MISMATCH: 'stepMismatch',
	TOO_LONG: 'tooLong',
	TOO_SHORT: 'tooShort',
	TYPE_MISMATCH: 'typeMismatch',
	VALUE_MISSING: 'valueMissing'
}

export const ValidationStates = {
	VALID: 'VALID',
	INVALID: 'INVALID',
	PENDING: 'PENDING'
}

export const FormStates = {
	UNSUBMITTED: 'UNSUBMITTED',
	SUBMITTED: 'SUBMITTED'
}

export const ValidateOn = {
	INSTANT: 'INSTANT',
	SUBMIT: 'SUBMIT',
	BLUR: 'BLUR',
	INSTANT_VALID: 'INSTANT_VALID',
	INSTANT_AFTER_SUBMIT: 'INSTANT_AFTER_SUBMIT'
}

export const FormEvents = {
	INPUT: 'INPUT',
	SUBMIT: 'SUBMIT',
	BLUR: 'BLUR',
	FOCUS: 'FOCUS',
	INIT: 'INIT'
}

export const FormInputEvents = {
	INPUT: 'input',
	FOCUS: 'focus',
	BLUR: 'blur'
}

export const FieldTypes = {
	HTML: 'HTML',
	VIRTUAL: 'VIRTUAL',
	CUSTOM: 'CUSTOM',
	GROUP: 'GROUP'
}
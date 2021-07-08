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

export const DisplayErrorsOn = {
	INSTANT: 'INSTANT',
	SUBMIT: 'SUBMIT',
	BLUR: 'BLUR'
}
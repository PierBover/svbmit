<script>
	import {controller, NativeValidationErrors, DisplayErrorsOn} from 'svbmit';
	import {writable} from 'svelte/store';

	const {VALUE_MISSING, TOO_SHORT} = NativeValidationErrors;

	let submittedValues;

	const controllerState = writable(null);
	const displayedErrors = writable({});

	function samePassword (value, controllerState) {
		if (value === controllerState.fields.password.value) return true;
		return 'Not the same password!';
	}

	const settings = {
		async onSubmit (values) {
			submittedValues = values;
		},
		validClass: 'is-valid',
		invalidClass: 'is-invalid',
		controllerState,
		displayedErrors,
		displayErrorsOn: DisplayErrorsOn.INSTANT,
		fields: {
			confirmPassword: {
				validators: [samePassword]
			}
		},
		errorMessages: {
			[VALUE_MISSING]: 'This field is required',
			[TOO_SHORT]: 'The password must be at least 5 characters'
		}
	}
</script>

<div class="wrap">
	<h1 class="mb-4">Confirm password</h1>

	<form use:controller={settings} class="mb-5" autocomplete="off">
		<div class="mb-3">
			<label for="input-password" class="form-label">Password</label>
			<input type="password" name="password" class="form-control" id="input-password" required minlength="5">
			{#if $displayedErrors.password}
				<div class="invalid-feedback">{$displayedErrors.password}</div>
			{/if}
		</div>
		<div class="mb-3">
			<label for="input-confirm-password" class="form-label">Confirm password</label>
			<input type="password" name="confirmPassword" class="form-control" id="input-confirm-password" required minlength="5">
			{#if $displayedErrors.confirmPassword}
				<div class="invalid-feedback">{$displayedErrors.confirmPassword}</div>
			{/if}
		</div>
		<button type="submit" class="btn btn-primary">Submit</button>
	</form>

	{#if submittedValues}
		<h3>Submitted values</h3>
		<pre>
			{JSON.stringify(submittedValues, null, 2)}
		</pre>
	{/if}

	{#if $controllerState}
		<h3>Controller state</h3>
		<pre>
			{JSON.stringify($controllerState, null, 2)}
		</pre>
	{/if}
</div>

<style>
	.wrap {
		max-width: 30rem;
		margin: 0 auto;
	}
</style>
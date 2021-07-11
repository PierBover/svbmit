<script>
	import {controller, NativeValidationErrors, DisplayErrorsOn} from 'svbmit';
	import {writable} from 'svelte/store';

	const {VALUE_MISSING, TOO_SHORT} = NativeValidationErrors;

	let submittedValues;

	const displayedErrors = writable({});
	const controllerState = writable(null);

	const regexNumbers = /[0-9]/;
	const regexUppercase = /[A-Z]/;

	export function checkPassword (value) {
		const testNumbers = regexNumbers.test(value);
		const testUppercase = regexUppercase.test(value);

		if (testNumbers && testUppercase) return true;
		if (!testUppercase && !testNumbers) return 'Please include at least a number and an uppercase letter';
		if (testNumbers && !testUppercase) return 'Please include at least an uppercase letter';
		if (!testNumbers && testUppercase) return 'Please include at least a number';
	}

	const formControllerSettings = {
		async onSubmit (values) {
			submittedValues = values;
		},
		validClass: 'is-valid',
		invalidClass: 'is-invalid',
		displayedErrors,
		controllerState,
		displayErrorsOn: DisplayErrorsOn.INSTANT,
		fields: {
			password: {
				validators: [checkPassword],
				displayErrorsOnChange: true
			}
		}
	}

</script>

<div class="wrap">
	<h1 class="mb-4">Custom sync validation</h1>

	<form use:controller={formControllerSettings} class="mb-5" autocomplete="off">
		<div class="mb-3">
			<label for="exampleInputPassword1" class="form-label">Password</label>
			<input type="password" name="password" class="form-control" id="exampleInputPassword1" required minlength="12">

			{#if !$displayedErrors.password}
				<div class="valid-feedback">Looking good!</div>
			{:else if $displayedErrors.password === VALUE_MISSING}
				<div class="invalid-feedback">Please write a password</div>
			{:else if $displayedErrors.password === TOO_SHORT}
				<div class="invalid-feedback">Your password must be at least 12 characters long</div>
			{:else}
				<div class="invalid-feedback">{$displayedErrors.password}</div>
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

	{#if $displayedErrors}
		<h3>Displayed errors</h3>
		<pre>
			{JSON.stringify($displayedErrors, null, 2)}
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
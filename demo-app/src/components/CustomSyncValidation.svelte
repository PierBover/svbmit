<script>
	import {onMount} from 'svelte';
	import {writable} from 'svelte/store';
	import {FormController, ValidationStates, NativeValidationErrors, ValidateOn} from 'svbmit';

	const {VALUE_MISSING, TOO_SHORT} = NativeValidationErrors;
	const {VALID} = ValidationStates;

	let submittedValues, passwordIsValid, formController, form;
	const formState = writable({});
	const errors = writable({});

	function checkPassword (value) {
		const testNumbers = /[0-9]/.test(value);
		const testUppercase = /[A-Z]/.test(value);

		if (testNumbers && testUppercase) return true;
		if (!testUppercase && !testNumbers) return 'Please include at least a number and an uppercase letter';
		if (testNumbers && !testUppercase) return 'Please include at least an uppercase letter';
		if (!testNumbers && testUppercase) return 'Please include at least a number';
	}

	onMount(() => {
		formController = new FormController({
			form,
			formState,
			errors,
			validateOn: ValidateOn.INSTANT,
			validClass: 'is-valid',
			invalidClass: 'is-invalid',
			onSubmit: (values) => {
				submittedValues = values;
			},
			fields: {
				password: {
					validators: [checkPassword]
				}
			}
		});
	});

	$: passwordIsValid = $formState.password?.validationState === VALID;
</script>

<div class="wrap">
	<h1 class="mb-4">Custom sync validation</h1>

	<form bind:this={form} class="mb-5" autocomplete="off">
		<div class="mb-3">
			<label for="exampleInputPassword1" class="form-label">Password</label>
			<input type="password" name="password" class="form-control" id="exampleInputPassword1" required minlength="12" maxlength="25">

			{#if passwordIsValid}
				<div class="valid-feedback">Looking good!</div>
			{:else if $errors.password === VALUE_MISSING}
				<div class="invalid-feedback">Please write a password</div>
			{:else if $errors.password === TOO_SHORT}
				<div class="invalid-feedback">Your password must be at least 12 characters long</div>
			{:else}
				<div class="invalid-feedback">{$errors.password}</div>
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

	{#if $formState}
		<h3>Form state</h3>
		<pre>
			{JSON.stringify($formState, null, 2)}
		</pre>
	{/if}
</div>

<style>
	.wrap {
		max-width: 30rem;
		margin: 0 auto;
	}
</style>
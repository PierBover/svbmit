<script>
	import {onMount} from 'svelte';
	import {writable} from 'svelte/store';
	import {FormController, NativeValidationErrors, ValidateOn} from 'svbmit';

	const {VALUE_MISSING, TOO_SHORT} = NativeValidationErrors;

	let submittedValues, form, formController;
	const formState = writable({});
	const errors = writable({});

	function samePassword (value, formState) {
		if (value === formState.password.value) return true;
		return `The passwords don't match`;
	}

	onMount(() => {
		formController = new FormController({
			form,
			formState,
			errors,
			validClass: 'is-valid',
			invalidClass: 'is-invalid',
			fields: {
				confirmPassword: {
					validators: [samePassword]
				}
			},
			validateOn: ValidateOn.INSTANT,
			onSubmit: (values) => {
				submittedValues = values;
			}
		});
	});

</script>

<div class="wrap">
	<h1 class="mb-4">Confirm password</h1>

	<form bind:this={form} class="mb-5" autocomplete="off">
		<div class="mb-3">
			<label for="input-password" class="form-label">Password</label>
			<input type="password" name="password" class="form-control" id="input-password" required minlength="5">
			{#if $errors.password === VALUE_MISSING}
				<div class="invalid-feedback">Please write a password</div>
			{:else if $errors.password === TOO_SHORT}
				<div class="invalid-feedback">Your password must be at least 5 characters long</div>
			{/if}
		</div>
		<div class="mb-3">
			<label for="input-confirm-password" class="form-label">Confirm password</label>
			<input type="password" name="confirmPassword" class="form-control" id="input-confirm-password" required minlength="5">
			{#if $errors.confirmPassword === VALUE_MISSING}
				<div class="invalid-feedback">Please write a password</div>
			{:else if $errors.confirmPassword === TOO_SHORT}
				<div class="invalid-feedback">Your password must be at least 5 characters long</div>
			{:else if $errors.confirmPassword}
				<div class="invalid-feedback">{$errors.confirmPassword}</div>
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
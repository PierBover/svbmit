<script>
	import {controller, NativeValidationErrors} from 'svbmit';
	import {writable} from 'svelte/store';

	const {VALUE_MISSING, TYPE_MISMATCH} = NativeValidationErrors;

	let submittedValues;

	const displayedErrors = writable({});
	const controllerState = writable(null);

	const settings = {
		async onSubmit (values) {
			submittedValues = values;
		},
		validClass: 'is-valid',
		invalidClass: 'is-invalid',
		displayedErrors,
		controllerState
	}
</script>

<div class="wrap">
	<h1 class="mb-4">Form with errors</h1>

	<form use:controller={settings} class="mb-5" autocomplete="off">
		<div class="mb-3">
			<label for="exampleInputEmail1" class="form-label">Email address</label>
			<input type="email" name="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" required>
			{#if $displayedErrors.email === VALUE_MISSING}
				<div class="invalid-feedback">The email is required</div>
			{:else if $displayedErrors.email === TYPE_MISMATCH}
				<div class="invalid-feedback">Please write a valid email</div>
			{:else}
				<div class="valid-feedback">Looks good!</div>
			{/if}
		</div>
		<div class="mb-3">
			<label for="exampleInputPassword1" class="form-label">Password</label>
			<input type="password" name="password" class="form-control" id="exampleInputPassword1" required>
			{#if $displayedErrors.password}
				<div class="invalid-feedback">The password is required</div>
			{:else}
				<div class="valid-feedback">Looks good!</div>
			{/if}
		</div>
		<div class="mb-3 form-check">
			<input type="checkbox" name="accept" class="form-check-input" id="accept" required>
			<label class="form-check-label" for="accept">I accept the terms and conditions</label>
			{#if $displayedErrors.accept}
				<div class="invalid-feedback">You must agree before submitting</div>
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
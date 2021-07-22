<script>
	import {onMount} from 'svelte';
	import {writable} from 'svelte/store';
	import {FormController, NativeValidationErrors, ValidateOn} from 'svbmit';

	const {VALUE_MISSING, TYPE_MISMATCH, TOO_SHORT} = NativeValidationErrors;

	let submittedValues, form, formController, passwordCharacters = 0;
	const formState = writable({});
	const errors = writable({});

	onMount(() => {
		formController = new FormController({
			form,
			formState,
			errors,
			validClass: 'is-valid',
			invalidClass: 'is-invalid',
			onSubmit: (values) => {
				submittedValues = values;
			},
			validateOn: ValidateOn.INSTANT_VALID
		});
	});

	$: passwordCharacters = $formState.password?.value ? $formState.password?.value.length : 0;
</script>

<div class="wrap">
	<h1 class="mb-4">Form with errors</h1>

	<form bind:this={form} class="mb-5" autocomplete="off">
		<div class="mb-3">
			<label for="exampleInputEmail1" class="form-label">Email address</label>
			<input type="email" name="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" required>
			{#if $errors.email === VALUE_MISSING}
				<div class="invalid-feedback">The email is required</div>
			{:else if $errors.email === TYPE_MISMATCH}
				<div class="invalid-feedback">Please write a valid email</div>
			{/if}
		</div>
		<div class="mb-3 position-relative">
			{#if passwordCharacters > 0 && passwordCharacters < 5}
				<small class="text-muted position-absolute top-0 end-0">{5 - passwordCharacters} more characters</small>
			{/if}
			<label for="exampleInputPassword1" class="form-label">Password</label>
			<input type="password" name="password" class="form-control" id="exampleInputPassword1" required minlength="5">
			{#if $errors.password === VALUE_MISSING}
				<div class="invalid-feedback">The password is required</div>
			{:else if $errors.password === TOO_SHORT}
				<div class="invalid-feedback">Password must be at least 5 characters long</div>
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

	<h3>Errors</h3>
	<pre>
		{JSON.stringify($errors, null, 2)}
	</pre>

	<h3>Form state</h3>
	<pre>
		{JSON.stringify($formState, null, 2)}
	</pre>
</div>

<style>
	.wrap {
		max-width: 30rem;
		margin: 0 auto;
	}
</style>
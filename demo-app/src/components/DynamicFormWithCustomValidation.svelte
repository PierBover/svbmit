<script>
	import {svbmit, NativeValidationErrors, ValidationStates} from 'svbmit';
	import {writable} from 'svelte/store';

	const {VALID, INVALID, PENDING} = ValidationStates;

	let submittedValues, passwordError, passwordValidationState;

	const formState = writable({});
	const errors = writable({});

	const products = [
		{
			id: '1233',
			name: 'GAMING LAPTOP'
		},
		{
			id: '4645',
			name: 'SMARTPHONE'
		},
		{
			id: '34553',
			name: 'TABLET'
		}
	];

	const regexLowercase = /[a-z]/;

	function isAllCaps (value) {
		const testLowercase = regexLowercase.test(value);

		if (testLowercase) return 'Only use uppercase letters';
		return true;
	}

	const settings = {
		async onSubmit (values) {
			submittedValues = values;
		},
		validClass: 'is-valid',
		invalidClass: 'is-invalid',
		formState,
		errors,
		fields: {
			product: {
				validators: [isAllCaps],
				displayErrorsOnChange: true
			}
		}
	}

</script>

<div class="wrap">
	<h1 class="mb-4">Dynamic form with custom validation</h1>

	<form use:svbmit={settings} class="mb-5" autocomplete="off">
		{#each products as product}
			<div class="mb-3">
				<label for={'input-product-' + product.id} class="form-label">Name</label>
				<input type="text" name={'product|' + product.id} class="form-control" id={'input-product-' + product.id} value={product.name} required>
				{#if $errors[product.id]}
					<div class="invalid-feedback">{$errors[product.id]}</div>
				{/if}
			</div>
		{/each}
		<button type="submit" class="btn btn-primary">Submit</button>
	</form>

	{#if submittedValues}
		<h3>Submitted values</h3>
		<pre>
			{JSON.stringify(submittedValues, null, 2)}
		</pre>
	{/if}

	{#if $errors}
		<h3>Displayed errors</h3>
		<pre>
			{JSON.stringify($errors, null, 2)}
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
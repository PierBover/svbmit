<script>
	import {onMount} from 'svelte';
	import {writable} from 'svelte/store';
	import {FormController} from 'svbmit';

	let form, submittedValues, formController;
	const formState = writable({});

	onMount(() => {

		formController = new FormController({
			form,
			formState,
			validClass: 'is-valid',
			invalidClass: 'is-invalid',
			onSubmit: (values) => {
				submittedValues = values;
			}
		});
	});
</script>

<div class="wrap">
	<h1 class="mb-4">Basic form</h1>

	<form bind:this={form} class="mb-5" autocomplete="off">
		<div class="mb-3">
			<label for="input-email" class="form-label">Email address</label>
			<input type="email" name="email" class="form-control" id="input-email" required>
		</div>
		<div class="mb-3">
			<label for="input-password" class="form-label">Password</label>
			<input type="password" name="password" class="form-control" id="input-password" required>
		</div>
		<div class="mb-3 form-check">
			<input type="checkbox" name="accept" class="form-check-input" id="accept" required>
			<label class="form-check-label" for="accept">I accept the terms and conditions</label>
		</div>
		<button type="submit" class="btn btn-primary">Submit</button>
	</form>

	{#if submittedValues}
		<h3>Submitted values</h3>
		<pre>
			{JSON.stringify(submittedValues, null, 2)}
		</pre>
	{/if}

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
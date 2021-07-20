<script>
	import {svbmit} from 'svbmit';
	import {writable} from 'svelte/store';

	let submittedValues;

	const errors = writable({});
	const formState = writable({});

	const settings = {
		async onSubmit (values) {
			submittedValues = values;
		},
		validClass: 'is-valid',
		invalidClass: 'is-invalid',
		errors,
		formState
	}

</script>

<div class="wrap">
	<h1 class="mb-4">Dynamic form</h1>

	<form use:svbmit={settings} class="mb-5" autocomplete="off">
		<div class="mb-4">
			<h4 class="mb-2">Do you agree?</h4>
			<div class="form-check">
				<input class="form-check-input" type="radio" name="agree" id="radio-yes" value="yes" required>
				<label class="form-check-label" for="radio-yes">Yes</label>
			</div>
			<div class="form-check">
				<input class="form-check-input" type="radio" name="agree" id="radio-no" value="no" required>
				<label class="form-check-label" for="radio-no">No</label>
			</div>
		</div>

		{#if $formState.fields?.agree.value}
			<div class="mb-4">
				<h4 class="mb-2">Why?</h4>
				<select class="form-select" name="reason" required>
					<option hidden value="" selected disabled>Please select an option</option>
					<option value="because">Because that's the way it is</option>
					<option value="dont-know">I don't know</option>
					<option value="custom">Another reason</option>
				</select>
			</div>
		{/if}

		{#if $formState.fields?.reason?.value === 'custom'}
			<div class="mb-4">
				<label for="input-custom-reason" class="form-label">Reason why</label>
				<input type="text" name="custom-reason" class="form-control" id="input-custom-reason" required>
			</div>
		{/if}

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
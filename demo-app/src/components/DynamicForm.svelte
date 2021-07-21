<script>
	import {onMount} from 'svelte';
	import {writable} from 'svelte/store';
	import {FormController, NativeValidationErrors, ValidateOn} from 'svbmit';

	const {VALUE_MISSING} = NativeValidationErrors;
	const {INSTANT} = ValidateOn;

	let submittedValues, form, formController, scaleIsValid, scaleHasValue;
	const formState = writable({});
	const errors = writable({});

	function checkScale (value) {
		const testNumbers = /[0-9]/.test(value);
		if (!testNumbers) return 'Please use only numbers';
		if (value < 1 || value > 10) return 'Pease use a number between 1 and 10';
		return true;
	}

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
			fields: {
				'scale-agree': {
					validators: [checkScale],
					validateOn: INSTANT
				},
				'scale-disagree': {
					validators: [checkScale],
					validateOn: INSTANT
				}
			}
		});
	});

	$: scaleHasValue = $formState['scale-agree']?.value || $formState['scale-disagree']?.value;
	$: scaleIsValid = !$errors['scale-agree'] && !$errors['scale-disagree'];

</script>

<div class="wrap">
	<h1 class="mb-4">Dynamic form</h1>

	<form bind:this={form} class="mb-5" autocomplete="off">
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

		{#if $formState.agree?.value === 'yes'}
			<div class="mb-4">
				<h4 class="mb-2">How much do you agree?</h4>
				<label for="input-scale-agree" class="form-label">Use a number from 1 to 10</label>
				<input type="text" name="scale-agree" class="form-control" id="input-scale-agree" required>
				{#if $errors['scale-agree'] === VALUE_MISSING}
					<div class="invalid-feedback">Please enter a value</div>
				{:else if $errors['scale-agree']}
					<div class="invalid-feedback">{$errors['scale-agree']}</div>
				{/if}
			</div>
		{/if}

		{#if $formState.agree?.value === 'no'}
			<div class="mb-4">
				<h4 class="mb-2">How much do you disagree?</h4>
				<label for="input-scale-disagree" class="form-label">Use a number from 1 to 10</label>
				<input type="text" name="scale-disagree" class="form-control" id="input-scale-disagree" required>
				{#if $errors['scale-disagree'] === VALUE_MISSING}
					<div class="invalid-feedback">Please enter a value</div>
				{:else if $errors['scale-disagree']}
					<div class="invalid-feedback">{$errors['scale-disagree']}</div>
				{/if}
			</div>
		{/if}

		{#if scaleHasValue && scaleIsValid}
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

		{#if $formState.reason?.value === 'custom'}
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
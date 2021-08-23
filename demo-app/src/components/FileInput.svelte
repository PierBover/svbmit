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
				console.log(values);
			}
		});
	});
</script>

<div class="wrap">
	<h1 class="mb-4">File input</h1>

	<form bind:this={form} class="mb-5" autocomplete="off">
		<div class="mb-3">
			<label for="input-files" class="form-label">Files to upload</label>
			<input type="file" name="files" class="form-control" id="input-files" required>
		</div>
		<button type="submit" class="btn btn-primary">Submit</button>
	</form>

	{#if submittedValues}
		<h3>Submitted values</h3>
		<p>See the console</p>
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
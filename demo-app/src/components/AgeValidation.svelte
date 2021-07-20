<script>
	import {onMount} from 'svelte';
	import {writable} from 'svelte/store';
	import {FormController, ValidationStates} from 'svbmit';

	const {VALID, PENDING, INVALID} = ValidationStates;

	let submittedValues, ageIsValid, form, formController;
	const formState = writable({});
	const errors = writable({});

	function age (values) {

		const {year, day, month} = values;

		if (year === '') return null;

		const date = new Date(year, month - 1, day);
		const timestamp = date.getTime();
		const now = Date.now();
		const age = (now - timestamp) / 1000 / 60 / 60 / 24 / 365;
		return Math.floor(age);
	}

	function overEighteen (value) {
		if (!value) return 'Invalid date';
		if (value < 18) return `You're only ${Math.floor(value)} years old`;
		return true;
	}

	onMount(() => {
		formController = new FormController({
			form,
			formState,
			errors,
			validClass: 'is-valid',
			invalidClass: 'is-invalid',
			validateOn: 'INSTANT',
			fields: {
				age: {
					computedValue: age,
					// Any field with a fields property will be considered of type GROUP
					fields: ['day', 'month', 'year'],
					validators: [overEighteen]
				}
			},
			onSubmit: (values) => {
				submittedValues = values;
			}
		});
	});

</script>

<div class="wrap">
	<h1 class="mb-4">Age Validation</h1>

	<form bind:this={form} class="mb-5" autocomplete="off">
		<div class="row g-2 mb-3">
			<div class="col-sm">
				<label for="input-day" class="form-label">Day</label>
				<select class="form-select" id="input-day" name="day" required>
					<option value="1">1</option>
					<option value="2">2</option>
					<option value="3">3</option>
					<option value="4">4</option>
					<option value="5">5</option>
					<option value="6">6</option>
					<option value="7">7</option>
					<option value="8">8</option>
					<option value="9">9</option>
					<option value="10">10</option>
					<option value="11">11</option>
					<option value="12">12</option>
					<option value="13">13</option>
					<option value="14">14</option>
					<option value="15">15</option>
					<option value="16">16</option>
					<option value="17">17</option>
					<option value="18">18</option>
					<option value="19">19</option>
					<option value="20">20</option>
					<option value="21">21</option>
					<option value="22">22</option>
					<option value="23">23</option>
					<option value="24">24</option>
					<option value="25">25</option>
					<option value="26">26</option>
					<option value="27">27</option>
					<option value="28">28</option>
					<option value="29">29</option>
					<option value="30">30</option>
					<option value="31">31</option>
				  </select>
			</div>
			<div class="col-sm-6">
				<label for="input-month" class="form-label">Month</label>
				<select class="form-select" id="input-month" name="month" required>
					<option value="1">January</option>
					<option value="2">February</option>
					<option value="3">March</option>
					<option value="4">April</option>
					<option value="5">May</option>
					<option value="6">June</option>
					<option value="7">July</option>
					<option value="8">August</option>
					<option value="9">September</option>
					<option value="10">October</option>
					<option value="11">November</option>
					<option value="12">December</option>
				  </select>
			</div>
			<div class="col-sm">
				<label for="input-year" class="form-label">Year</label>
				<input type="number" name="year" class="form-control" id="input-year" required  max="2021" min="1900" placeholder="yyyy">
			</div>
		</div>

		{#if $errors.age}
			<div class="text-danger mb-3">{$errors.age}</div>
		{/if}

		<button type="submit" class="btn btn-primary">Submit</button>
	</form>

	{#if submittedValues}
		<h3>Submitted values</h3>
		<pre>{JSON.stringify(submittedValues, null, 2)}</pre>
	{/if}

	<h3>Errors</h3>
	<pre>{JSON.stringify($errors, null, 2)}</pre>

	<h3>Form state</h3>
	<pre>{JSON.stringify($formState, null, 2)}</pre>
</div>

<style>
	.wrap {
		max-width: 30rem;
		margin: 0 auto;
	}
</style>
<script>
	import {link, active} from 'pluma-svelte-router';
</script>

<div class="mb-4">
	<a href="/" use:link use:active>Basic form</a>
	<a href="/with-errors" use:link use:active>Form with errors</a>
	<a href="/custom-sync-validation" use:link use:active>Custom sync validation</a>
	<a href="/confirm-password" use:link use:active>Confirm password</a>
	<!-- <a href="/async-validation" use:link use:active>Async validation</a> -->
	<a href="/dynamic-form" use:link use:active>Dynamic form</a>
	<!-- <a href="/dynamic-form-validation" use:link use:active>Dynamic form with custom validation</a> -->
	<a href="/age-validation" use:link use:active>Age validation</a>
	<a href="/file-input" use:link use:active>File input</a>
</div>
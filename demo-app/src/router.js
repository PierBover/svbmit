import BasicForm from './components/BasicForm.svelte';
import FormWithErrors from './components/FormWithErrors.svelte';
import CustomSyncValidation from './components/CustomSyncValidation.svelte';
import ConfirmPassword from './components/ConfirmPassword.svelte';
// import AsyncValidation from './components/AsyncValidation.svelte';
// import DynamicForm from './components/DynamicForm.svelte';
// import DynamicFormWithCustomValidation from './components/DynamicFormWithCustomValidation.svelte';
import AgeValidation from './components/AgeValidation.svelte';

export default {
	routes: [
		{ path: '/', component: BasicForm },
		{ path: '/with-errors', component: FormWithErrors },
		{ path: '/custom-sync-validation', component: CustomSyncValidation },
		{ path: '/confirm-password', component: ConfirmPassword },
		// { path: '/async-validation', component: AsyncValidation },
		// { path: '/dynamic-form', component: DynamicForm },
		// { path: '/dynamic-form-validation', component: DynamicFormWithCustomValidation },
		{ path: '/age-validation', component: AgeValidation }
	]
};
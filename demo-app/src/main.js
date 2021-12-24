import {initRouter} from 'pluma-svelte-router';
import FormController from '../../src/FormController.js';
import App from './components/App.svelte';
import routerConfig from './router.js';

// This is how you could set global default settings
// FormController.setDefaultSettings({
// 	validClass: 'is-valid',
// 	invalidClass: 'is-invalid'
// });

initRouter(routerConfig);

const app = new App({
	target: document.getElementById('app')
});
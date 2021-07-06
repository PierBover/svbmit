<p align="center"><img src="./graphics/svbmit-logo.svg" width="250"></p>

# Svbmit

This is a client-side form library for Svelte. It's in early developement so expect bugs, changes, and dragons.

Demo app: https://svbmit.netlify.app/

To install:

```
npm i svbmit
```

## Main features
* Lightweight (aprox 3kB gzip).
* No dependencies other than Svelte.
* HTML-first approach.
* The DOM is the ultimate source of truth for values. You have total freedom to modify the DOM for complex forms. This library will figure it out.
* You can use in-browser native validation for the most common use cases (eg: required fields).
* Validation is sync (custom or native).
* You can add per-field external validation. This allows you to implement cancealable async validators.
* Control when errors are displayed to custom-tailor the user experience.

## Simple example
To configure Svbmit, we need to define a settings object along with the `use:controller` action.

In this example, the `onSubmit` function will only be triggered once all fields are valid. The validation is based on the attributes of the `<input>` tags (eg: `required` and `email`).

```svelte
<script>
  import {controller} from 'svbmit';

  const settings = {
    async onSubmit (values) {
      console.log(values)
    }
  };
</script>

<form use:controller={settings}>
  <input type="email" name="email" required>
  <input type="password" name="password" required>
  <button type="submit">Submit</button>
</form>
```

## Reactive controller state
To get a better understanding of what's going on, we can pass an optional `writable` to the controller which will be updated whenever anything changes in the form.

```svelte
<script>
  import {controller} from 'svbmit';
  import {writable} from 'svelte/store';

  const controllerState = writable(null);

  const settings = {
    async onSubmit (values) {
      console.log(values)
    },
    controllerState
  };

  $: console.log($controllerState);
</script>

<form use:controller={settings}>
  <input type="email" name="email" required>
  <input type="password" name="password" required>
  <button type="submit">Submit</button>
</form>
```

The writable will be updated with information about the state of the form and its fields:

```js
{
  validationState: "INVALID",
  fields: {
    email: {
      dirty: false,
      error: "valueMissing",
      name: "email",
      type: "email",
      validationState: "INVALID",
      value: ""
    },
    password: {
      dirty: false,
      error: "valueMissing",
      name: "password",
      type: "password",
      validationState: "INVALID",
      value: ""
    }
  }
}
```

## Displaying errors

Although Svbmit knows at all times when a field is valid or invalid, you probably don't want to display errors all the time.

There's nothing more annoying than getting an invalid email error when you haven't finished writing your email, right?

If you pass a `displayedErrors` writable to the controller, it will be updated at certain points in the validation flow:

```js
import {controller} from 'svbmit';
import {writable} from 'svelte/store';

const displayedErrors = writable(null);

const settings = {
  async onSubmit (values) {
    console.log(values)
  },
  displayedErrors
};
```

By default, errors will be added to the `displayedErrors` writable when submitting the form and will be removed when the field's value changes.

To customize this behavior, see the controller settings API.

It's up to you to decide how to implement the `displayedErrors` writable in your form. Here's a simple example of how you could do it:

```svelte
<script>
  import {controller} from 'svbmit';
  import {writable} from 'svelte/store';

  let emailIsValid, showEmailError;
  const displayedErrors = writable(null);

  const settings = {
    async onSubmit (values) {
      console.log(values)
    },
    displayedErrors
  };
</script>

<form use:controller={settings}>
  <input type="email" name="email" required>
  {#if $displayedErrors?.email}
    <div>Please use a valid email address</div>
  {/if}
  <button type="submit">Submit</button>
</form>
```

See the [form with errors](demo-app/src/components/FormWithErrors.svelte) example from the demo app for a more complex implementation.

### Valid and invalid CSS classes

Once a field is considered to be valid or invalid, and the error is deemed to be displayed, the input will be marked with a CSS class. By default these are `valid` and `invalid` but you can configure custom CSS class names (eg: `is-valid` and `is-invalid` if you're using Bootstrap).

You can completely deactivate this behavior by using `null` for the `validClass` and/or `invalidClass` settings.

The valid CSS class will not be applied to checkboxes, select, and radio inputs. You can change this behavior with the `addValidClassToAllInputs` setting.

### Sync validators

When configuring a field you can add any number of custom sync validators:

```js
function isAllCaps (value) {
  const regexLowercase = /[a-z]/;
  const testLowercase = regexLowercase.test(value);

  if (testLowercase) return 'Only use uppercase letters';
  return true;
}

const formControllerSettings = {
  async onSubmit (values) {},
  fields: {
    titleInCaps: {
      validators: [isAllCaps]
    }
  }
}
```

In your validator, return `true` if the value is valid. Anything other than `true` will mark the field as invalid, and whatever you return will be available in the `controllerState` and `displayedErrors` stores.

### External validators

You can add a per-field external validator which will have full control over the validation of a field:

```js
function checkDomainIsAvailable (fieldState, eventType, update) {
  // do your thing
}

const formControllerSettings = {
  async onSubmit (values) {},
  fields: {
    domain: {
      externalValidator: checkDomainIsAvailable
    }
  }
}
```

* `fieldState` is the current state of the field (value, etc)
* `eventType` is whatever event that triggered the external validator ('submit', 'input', etc).
* `update` is a function you can use to update the state of the field such as marking it valid, invalid, etc.

See the [async validation form](demo-app/src/components/AsyncValidation.svelte) for a full example on how to implement async validation with promise cancelation.

## Dynamic forms

Because the DOM is the ultimate source of truth, you can alter it in any way you need. You can add and remove fields dynamically and the state of the library will be updated magically.

See the [dynamic form demo](demo-app/src/components/DynamicForm.svelte) for an example of a dynamic form.

### Name aliases

Field settings are connected to a particular input using its name attribute. This works for the vast majority of use cases, but there are some complex scenarios where this breaks.

For example, imagine you had a field called `productName` with a custom validator to ensure the name is properly formatted:

```js
const formControllerSettings = {
  async onSubmit (values) {},
  fields: {
    productName: {
      validators: [checkNameFormat]
    }
  }
}
```

By default, the `productName` settings would only be applied to this input:

```html
<input type="text" name="productName"/>
```

So far so good, but what if you wanted to edit multiple products in the same form? What if the number of products was dynamic, and you didn't know how many you'd want to edit?

The solution is using name aliases so that you can apply a particular setting to any input:

```html
<input type="text" name="productName|3b761efe-f253-484c-9b56-febf9dcb7268"/>
<input type="text" name="productName|f52ddac8-d46a-42cd-9de3-f84275e786b2"/>
<input type="text" name="productName|9329ff26-90e7-4b01-a1c8-f0ef0d0b0d3a"/>
```

Now all those inputs will use the `productName` settings, but will be treated as different inputs with their own name. In this example, the product id.

See the [dynamic form with custom validation demo](demo-app/src/components/DynamicFormWithCustomValidation.svelte) for a full example on how to use aliases.

## `controller` action settings

Required:
* `onSubmit` a callback function that will be triggered when all validation has passed and the form is submitted.

Optional:
* `fields` an object with field configurations
* `validClass` custom CSS class that will be applied to valid input elements. The default is `valid`. If set to `null` no class will be applied.
* `invalidClass` custom CSS class that will be applied to invalid input elements. The default is `invalid`. If set to `null` no class will be applied.
* `useNativeErrorTooltips` use the browser's error tooltips. Defaults to `false`.
* `displayedErrors` a [Svelte writable](https://svelte.dev/docs#svelte_store) that will be updated with displayed errors
* `controllerState` a [Svelte writable](https://svelte.dev/docs#svelte_store) that will be updated with the controller state
* `displayErrorsOnBlur` display field errors on `blur` events. The default is `false`.
* `displayErrorsOnChange` display field errors on `change` and `input` events. The default is `false`.
* `hideErrorsOnChange` hide field errors on `change` and `input` events. The default is `false`.
* `addValidClassToAllInputs` add the `validClass` too all types of inputs. The default is `false`.

### Field settings
All optional:
* `validators` an array with sync functions that will be used to validate the value of the field after the native validators have passed.
* `externalValidator` a sync function that will be used for all validation. When using this option, no validation will be performed by the library itself.
* `displayErrorsOnChange` show field errors on `input` and `change` events. The default is `false`.
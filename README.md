# Parley.js

## An oversimplified library for HTML5 dialogs

Parley.js is a small utility replacing `window.prompt` and `window.confirm`.

## Minimum requirements

The `Parley` class cannot be placed inside a module. It must be globally available.

|            | Needs      | Version | MDN                           |
| ---------- | ---------- | ------- | ----------------------------- |
| ECMAScript | `Promise`  | ES2015  | [see](https://mdn.io/Promise) |
| HTML       | `<dialog>` | HTML5   | [see](https://mdn.io/dialog)  |

If you do not use transpiler like Babel or TypeScript, note that code uses ES6 class.

## API

Everything starts with `<script>` tag:

```html
<script src="https://unpkg.com/parley.js"></script>
```

Note it must be a classic script, not a module.

You should also include CSS:

```html
<link rel="stylesheet" href="https://unpkg.com/parley.js/dist/default.css" />
```

### `Parley.fire`

It takes configuration and responds with a Promise. Depending on the input type, configuration and
output vary. But if the parley was cancelled (by the cancel button or the escape key) the output is
always false.

#### Base configuration

| Name                | Description                                  | Default     |
| ------------------- | -------------------------------------------- | ----------- |
| `title`             | The title displayed in parley. Supports HTML | `""`        |
| `message`           | The HTML message of the parley.              | `""`        |
| `cancelButtonHTML`  | The HTML content of the cancel button.       | `Cancel"`   |
| `confirmButtonHTML` | The HTML content of the confirm button.      | `"OK"`      |
| `value`             | The default value.                           | `undefined` |
| `inputOptions`      | The input-type-specific; see bellow          | {}          |

#### Input options

| Input types                                        | Configuration type | Output / Defaut value type        |
| -------------------------------------------------- | ------------------ | --------------------------------- |
| `"number"` `"range"`                               | `NumberOptions`    | `number`                          |
| `"textarea"`                                       | `TextareaOptions`  | `string`                          |
| `"tel"` `"text"` `"email"` `"search"` `"password"` | `TextOptions`      | `string`                          |
| `"checkbox"` `"select"` `"radio"`                  | `SelectOptions`    | `string`, `string[]` for checkbox |
| `"none`                                            | `never`            | `boolean`                         |

```ts
interface NumberOptions {
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
}

interface TextareaOptions {
    rows?: number;
    cols?: number;
    placeholder?: string;
}

interface TextOptions {
    /**
     * Regular expression used to validate the input
     */
    pattern?: RegExp;
    placeholder?: string;
}

interface SelectionOptions {
    /**
     * The key is the value of the input.
     * The value is the label html of the input.
     */
    [value: string]: string;
}
```

### `Parley.close` and `Parley.cancel`

Both functions close the parley immediately. While `Parley.cancel()` causes to return `false`,
`Parley.close()` returns the user value.

# Parley.js

## An oversimplified library for HTML5 dialogs

Parley.js is a small utility replacing `window.prompt` and `window.confirm`.

## Minimum requirements

|            | Needs      | Version | MDN                           |
| ---------- | ---------- | ------- | ----------------------------- |
| ECMAScript | `Promise`  | ES2015  | [see](https://mdn.io/Promise) |
| HTML       | `<dialog>` | HTML5   | [see](https://mdn.io/dialog)  |

Without Babel, code also needs `async` and `await` keywords (ES2017).

## Usage

```js
import Parley from "parley.js";
import "parley.js/dist/default.css";
// ...
```

Also, you can use UNPKG:

```html
<link rel="stylesheet" href="https://unpkg.com/parley.js/dist/default.css" />
<script type="module">
    import Parley from "https://unpkg.com/parley.js";
    // ...
</script>
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

### Constructing other dialogs

Sometimes, you need to theme multiple dialogs. You can use the `Dialog` class to create a dialog

```js
import {Dialog} from "parley.js";

const dialog = new Dialog("system");

// Dialog has class "system"
// Loader has class "system-loader"
```
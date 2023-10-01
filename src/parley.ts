const element = document.createElement("dialog");
const title = document.createElement("h2");
const form = document.createElement("form");
const message = document.createElement("p");
const confirmButton = document.createElement("button");
const cancelButton = document.createElement("button");
const id = "c" + Date.now().toString(36);

/**
 * Type guard for input types.
 * @param options options to check
 * @param inputs allowed inputs
 * @returns if the input is one of the allowed inputs
 */
export function isInputType<I extends keyof Inputs>(options: Options, ...inputs: I[]): options is Options<I> {
	return inputs.indexOf(options.input) !== -1;
}

/**
 * Initializes the dialog DOM. Automatically called
 * by {@link fire} if you have not initialized yet
 * @param root The root element to append the dialog to. Defaults to body.
 */
export function init(root?: Element | null) {
	(root || document.body).appendChild(element);
}

/**
 * Creates a prompt dialog.
 * @template I The input type.
 * @param options The options of the dialog.
 * @returns A promise that resolves to the input value or false if the dialog was cancelled.
 */
export async function fire<I extends keyof Inputs>(options: Options<I>) {
	if (!element.parentElement) {
		init();
	} else {
		form.innerHTML = "";
	}

	if (isInputType(options, "select")) {
		const select = document.createElement("select");
		select.name = "string";

		for (const option in options.inputOptions) {
			const optionElement = document.createElement("option");
			optionElement.value = option;
			optionElement.innerHTML = options.inputOptions[option];
			select.appendChild(optionElement);
		}

		form.appendChild(select);
	}

	if (isInputType(options, "textarea")) {
		const textarea = document.createElement("textarea");
		textarea.name = "string";
		if (options.inputOptions) {
			if (options.inputOptions.placeholder) {
				textarea.placeholder = options.inputOptions.placeholder;
			}
			if (options.inputOptions.cols) {
				textarea.cols = options.inputOptions.cols;
			}
			if (options.inputOptions.rows) {
				textarea.rows = options.inputOptions.rows;
			}
		}
		if (options.value) {
			textarea.value = options.value;
		}
		form.appendChild(textarea);
	}

	if (isInputType(options, "checkbox", "radio")) {
		for (const option in options.inputOptions) {
			const label = document.createElement("label");
			const input = document.createElement("input");
			label.innerHTML = options.inputOptions[option];

			input.type = options.input;
			input.value = option;

			if (options.input === "radio") {
				input.name = "string";
				input.checked = options.value === option;
			} else {
				input.name = "array";
				input.checked = options.value?.indexOf(option) !== -1;
			}

			label.prepend(input);
			form.appendChild(label);
		}
	}

	if (isInputType(options, "number", "range")) {
		const input = document.createElement("input");
		input.type = options.input;
		input.name = "number";
		if (options.inputOptions) {
			if (options.inputOptions.placeholder) {
				input.placeholder = options.inputOptions.placeholder;
			}
			if (options.inputOptions.min) {
				input.min = options.inputOptions.min.toString();
			}
			if (options.inputOptions.max) {
				input.max = options.inputOptions.max.toString();
			}
			if (options.inputOptions.step) {
				input.step = options.inputOptions.step.toString();
			}
		}
		if (options.value) {
			input.value = `${options.value}`;
		}
		form.appendChild(input);
	}

	if (isInputType(options, "tel", "email", "search", "text", "password")) {
		const input = document.createElement("input");
		if (options.inputOptions) {
			if (options.inputOptions.placeholder) {
				input.placeholder = options.inputOptions.placeholder;
			}
			if (options.inputOptions.pattern) {
				input.pattern = options.inputOptions.pattern.source;
			}
		}
		if (options.value) {
			input.value = options.value;
		}
		input.type = options.input;
		input.name = "string";
		form.appendChild(input);
	}

	title.innerHTML = options.title || "";

	cancelButton.innerHTML = options.cancelButtonHTML || "";
	confirmButton.innerHTML = options.confirmButtonHTML ?? "OK";

	confirmButton.style.background = "var(--parley-primary)";
	cancelButton.style.background = "var(--parley-inactive)";

	const buttonContainer = document.createElement("div");
	buttonContainer.appendChild(confirmButton);
	buttonContainer.appendChild(cancelButton);
	buttonContainer.className = "button-container";

	element.showModal();

	if (options.builder) {
		message.innerHTML = "<div class='loader'></div>";
		const body = await options.builder();
		message.innerHTML = "";
		message.append(body);
	} else if (options.body) {
		message.innerHTML = "";
		message.append(options.body);
	}

	form.appendChild(buttonContainer);

	return new Promise<Inputs[I][0] | false>(resolve => {
		element.addEventListener(
			"close",
			function () {
				resolve(JSON.parse(this.returnValue || "false"));
				this.returnValue = "";
			},
			{once: true}
		);
	});
}

/**
 * Programatically closes the dialog.
 */
export function close() {
	const data = new FormData(form);

	if (data.has("number")) {
		element.close(`${data.get("number") || "0"}`);
	} else if (data.has("string")) {
		element.close(JSON.stringify(data.get("string")));
	} else if (data.has("array")) {
		element.close(JSON.stringify(data.getAll("array")));
	} else if (form.querySelector("input")) {
		element.close("[]");
	} else {
		element.close("true");
	}
}

/**
 * Closes the dialog and returns with `false`.
 */
export function cancel() {
	element.close();
}

/**
 * Is dialog open?
 */
export function isOpen() {
	return element.open;
}

element.id = id;
element.appendChild(title);
element.appendChild(message);
element.appendChild(form);
element.classList.add("parley");

form.action = `javascript:${id}.close();`;
Object.assign(globalThis, {[id]: {close}});

cancelButton.formMethod = "dialog";
cancelButton.type = "submit";
cancelButton.value = "false";
confirmButton.type = "submit";

/**
 * Map of input types to their options.
 */
export interface Inputs {
	none: [boolean, never];
	range: [number, NumberOptions];
	number: [number, NumberOptions];
	tel: [string, TextOptions];
	text: [string, TextOptions];
	email: [string, TextOptions];
	search: [string, TextOptions];
	password: [string, TextOptions];
	radio: [string, SelectionOptions];
	select: [string, SelectionOptions];
	textarea: [string, TextareaOptions];
	checkbox: [string[], SelectionOptions];
}

export interface Options<I extends keyof Inputs = any> {
	/**
	 * The HTML title of the dialog.
	 * @default ""
	 */
	title?: string;
	/**
	 * The body of the dialog.
	 * Does not support HTML
	 * but supports DOM elements.
	 * @default ""
	 */
	body?: string | Element;
	/**
	 * Async function that returns the body of the dialog.
	 * `body` property is ignored if this is set.
	 * While this function is running,
	 * the dialog shows a loading indicator.
	 * @returns The body of the dialog.
	 */
	builder?: () => Promise<string | Element>;
	/**
	 * The HTML content of the dialog.
	 * @default "Cancel"
	 */
	cancelButtonHTML?: string;
	/**
	 * The HTML content of the dialog.
	 * @default "OK"
	 */
	confirmButtonHTML?: string;
	/**
	 * The input type of the dialog.
	 */
	input: I;
	/**
	 * The default value of the input.
	 */
	value?: Inputs[I][0];
	/**
	 * The options of the input.
	 * It is required for these types:
	 * * select
	 * * checkbox
	 * * radio
	 */
	inputOptions?: Inputs[I][1];
	/**
	 * Whether to reverse the buttons.
	 * @default false
	 */
	reverseButtons?: boolean;
}

export interface NumberOptions {
	min?: number;
	max?: number;
	step?: number;
	placeholder?: string;
}

export interface TextareaOptions {
	rows?: number;
	cols?: number;
	placeholder?: string;
}

export interface TextOptions {
	/**
	 * Regular expression used to validate the input
	 */
	pattern?: RegExp;
	placeholder?: string;
}

export interface SelectionOptions {
	/**
	 * The key is the value of the input.
	 * The value is the label html of the input.
	 */
	[value: string]: string;
}
/**
 * @license MIT
 * @version 1.1.0
 * @description A simple dialog utility for the web.
 * @example
 * ```ts
 * const result = await Parley.fire({
 * 	title: "Enter a number",
 * 	message: "Enter a number between 1 and 10",
 * 	input: "number",
 * 	inputOptions: {
 * 		min: 1,
 * 		max: 10
 * 	}
 * });
 * ```
 */
/**
 * Parley is a **static** class
 * providing the {@link Parley.fire fire} method
 */
class Parley {
	protected static element = document.createElement("dialog");
	protected static title = document.createElement("h2");
	protected static form = document.createElement("form");
	protected static message = document.createElement("p");
	/**
	 * Initializes the dialog DOM. Automatically called
	 * by {@link fire} if you have not initialized yet
	 * @param root The root element to append the dialog to. Defaults to body.
	 */
	public static init(root?: Element | null) {
		this.element.appendChild(this.title);
		this.element.appendChild(this.message);
		this.element.appendChild(this.form);
		this.element.classList.add("parley");

		this.form.action = `javascript:${this.name}.close();`;
		(root || document.body).appendChild(this.element);
	}

	/**
	 * Creates a prompt dialog.
	 * @template I The input type.
	 * @param options The options of the dialog.
	 * @returns A promise that resolves to the input value or false if the dialog was cancelled.
	 */
	public static async fire<I extends keyof Parley.Inputs>(options: Parley.Options<I>) {
		if (!this.element.parentElement) {
			this.init();
		} else {
			this.form.innerHTML = "";
		}

		if (this.isInputType(options, "select")) {
			const select = document.createElement("select");
			select.name = "string";

			for (const option in options.inputOptions) {
				const optionElement = document.createElement("option");
				optionElement.value = option;
				optionElement.innerHTML = options.inputOptions[option];
				select.appendChild(optionElement);
			}

			this.form.appendChild(select);
		}

		if (this.isInputType(options, "textarea")) {
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
			this.form.appendChild(textarea);
		}

		if (this.isInputType(options, "checkbox", "radio")) {
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
				this.form.appendChild(label);
			}
		}

		if (this.isInputType(options, "number", "range")) {
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
			this.form.appendChild(input);
		}

		if (this.isInputType(options, "tel", "email", "search", "text", "password")) {
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
			this.form.appendChild(input);
		}

		this.title.innerHTML = "";
		options.title && this.title.append(options.title);

		const buttonContainer = document.createElement("div");
		buttonContainer.className = "button-container";

		if (options.cancelButton !== false) {
			const cancelButton = document.createElement("button");
			cancelButton.formMethod = "dialog";
			cancelButton.type = "submit";
			cancelButton.value = "false";
			cancelButton.style.background = "var(--parley-inactive)";
			cancelButton.append(options.cancelButton ?? "Cancel");
			buttonContainer.appendChild(cancelButton);
		}

		if (options.confirmButton !== false) {
			const confirmButton = document.createElement("button");
			confirmButton.formMethod = "dialog";
			confirmButton.type = "submit";
			confirmButton.value = "true";
			confirmButton.style.background = "var(--parley-primary)";
			confirmButton.append(options.confirmButton ?? "OK");
			buttonContainer.appendChild(confirmButton);
		}

		this.element.showModal();

		if (options.builder) {
			this.message.innerHTML = "<div class='parley-loader'></div>";
			const body = await options.builder();
			this.message.innerHTML = "";
			this.message.append(body);
		} else if (options.body) {
			this.message.innerHTML = "";
			this.message.append(options.body);
		}

		this.form.appendChild(buttonContainer);

		return new Promise<Parley.Inputs[I][0] | false>(resolve => {
			this.element.addEventListener(
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
	public static close() {
		const data = new FormData(this.form);

		if (data.has("number")) {
			this.element.close(`${data.get("number") || "0"}`);
		} else if (data.has("string")) {
			this.element.close(JSON.stringify(data.get("string")));
		} else if (data.has("array")) {
			this.element.close(JSON.stringify(data.getAll("array")));
		} else if (this.form.querySelector("input")) {
			this.element.close("[]");
		} else {
			this.element.close("true");
		}
	}
	/**
	 * Closes the dialog and returns with `false`.
	 */
	public static cancel() {
		this.element.close();
	}
	protected static isInputType<I extends keyof Parley.Inputs>(
		options: Parley.Options,
		...inputs: I[]
	): options is Parley.Options<I> {
		return inputs.indexOf(options.input) !== -1;
	}
	/**
	 * Is dialog open?
	 */
	public static isOpen() {
		return this.element.open;
	}
	/**
	 * Never construct Parley class!
	 * @throws {TypeError}
	 */
	private constructor() {
		throw new TypeError("Illegal constructor");
	}
}

declare namespace Parley {
	type Property<T> = T | (() => T) | Promise<T> | (() => Promise<T>);

	/**
	 * Map of input types to their options.
	 */
	interface Inputs {
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

	interface Options<I extends keyof Inputs = any> {
		/**
		 * The title of the dialog.
		 * Does not support HTML strings,
		 * but supports DOM elements.
		 * If not set, the title will not be shown.
		 */
		title?: string | HTMLElement;
		/**
		 * The body of the dialog.
		 * Does not support HTML strings,
		 * but supports DOM elements.
		 * @default ""
		 */
		body?: string | HTMLElement;
		/**
		 * Async function that returns the body of the dialog.
		 * `body` property is ignored if this is set.
		 * While this function is running,
		 * the dialog shows a loading indicator.
		 * @returns The body of the dialog.
		 */
		builder?: () => Promise<string | Element>;
		/**
		 * Cancel button content.
		 * If string, creates a button with the text.
		 * If HTMLElement, appends the element to the but.
		 * If false, the button will not be shown.
		 * @default "Cancel"
		 */
		cancelButton?: string | HTMLElement | false;
		/**
		 * Confirm button content.
		 * If string, creates a button with the text.
		 * If HTMLElement, appends the element to the dialog.
		 * If false, the button will not be shown.
		 * @default "OK"
		 */
		confirmButton?: string | HTMLElement | false;
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
	}

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
}
class Dialog {
    private readonly element = document.createElement("dialog");
    private readonly title = document.createElement("h2");
    private readonly form = document.createElement("form");
    private readonly message = document.createElement("p");
    private readonly confirmButton = document.createElement("button");
    private readonly cancelButton = document.createElement("button");

    /**
     * Constructs a new dialog.
     * 
     * @param className The class name of the dialog ("parley" by default)
     */
    public constructor(private readonly className: string) {
        this.element.classList.add(className);
        this.element.appendChild(this.title);
        this.element.appendChild(this.message);
        this.element.appendChild(this.form);

        const id = "close" + Math.random().toString(36).slice(2);
        Object.assign(globalThis, {[id]: this.close.bind(this)});
        this.form.action = `javascript:${id}();`;

        this.cancelButton.formMethod = "dialog";
        this.cancelButton.type = "submit";
        this.cancelButton.value = "false";
        this.confirmButton.type = "submit";

        this.confirmButton.classList.add("primary");
        this.cancelButton.classList.add("secondary");
    }

    /**
     * Initializes the dialog DOM. Automatically called
     * by {@link fire} if you have not initialized yet
     * @param root The root element to append the dialog to. Defaults to body.
     */
    public init(root?: Element | null) {
        (root || document.body).appendChild(this.element);
    }

    /**
     * Type guard for input types.
     * @param options options to check
     * @param inputs allowed inputs
     * @returns if the input is one of the allowed inputs
     */
    private isInputType<I extends keyof Dialog.Inputs>(
        options: Dialog.Options<keyof Dialog.Inputs>, 
        ...inputs: I[]
    ): options is Dialog.Options<I> {
        return inputs.indexOf(options.input as I) !== -1;
    }

    /**
     * Creates a prompt dialog.
     * @template I The input type.
     * @param options The options of the dialog.
     * @returns A promise that resolves to the input value or false if the dialog was cancelled.
     */
    public async fire<I extends keyof Dialog.Inputs>(options: Dialog.Options<I>) {
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

        this.title.innerHTML = options.title || "";

        this.cancelButton.innerHTML = options.cancelButtonHTML || "";
        this.confirmButton.innerHTML = options.confirmButtonHTML ?? "OK";

        const buttonContainer = document.createElement("div");
        buttonContainer.appendChild(this.confirmButton);
        buttonContainer.appendChild(this.cancelButton);
        buttonContainer.className = "button-container";

        this.element.showModal();

        if (options.builder) {
            this.message.innerHTML = `<div class="${this.className}-loader"></div>`;
            const body = await options.builder(); 
            this.message.innerHTML = "";
            this.message.append(body);
        } else if (options.body) {
            this.message.innerHTML = "";
            this.message.append(options.body);
        }

        this.form.appendChild(buttonContainer);

        return new Promise<Dialog.Inputs[I][0] | false>(resolve => {
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

    /** Programatically closes the dialog. */
    public close() {
        const data = new FormData(this.form);

        if (data.has("number")) {
            this.element.close(`${data.get("number") || 0}`);
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

    /** Closes the dialog and returns with `false` */
    public cancel() {
        this.element.close();
    }

    /**
     * Checks if the dialog is open.
     * @returns `true` if the dialog is open.
     */
    public isOpen() {
        return this.element.open;
    }
}

declare namespace Dialog {
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

    export interface Options<I extends keyof Inputs> {
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
        body?: string | HTMLElement;
        /**
         * Async function that returns the body of the dialog.
         * `body` property is ignored if this is set.
         * While this function is running,
         * the dialog shows a loading indicator.
         * @returns The body of the dialog.
         */
        builder?: () => Promise<string | HTMLElement>;
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
}

export default Dialog;
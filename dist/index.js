"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Parley {
    static init(root) {
        this.element.appendChild(this.title);
        this.element.appendChild(this.message);
        this.element.appendChild(this.form);
        this.element.classList.add("parley");
        this.form.action = `javascript:${this.name}.close();`;
        (root || document.body).appendChild(this.element);
    }
    static fire(options) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.element.parentElement) {
                this.init();
            }
            else {
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
                    }
                    else {
                        input.name = "array";
                        input.checked = ((_a = options.value) === null || _a === void 0 ? void 0 : _a.indexOf(option)) !== -1;
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
                cancelButton.append((_b = options.cancelButton) !== null && _b !== void 0 ? _b : "Cancel");
                buttonContainer.appendChild(cancelButton);
            }
            if (options.confirmButton !== false) {
                const confirmButton = document.createElement("button");
                confirmButton.formMethod = "dialog";
                confirmButton.type = "submit";
                confirmButton.value = "true";
                confirmButton.style.background = "var(--parley-primary)";
                confirmButton.append((_c = options.confirmButton) !== null && _c !== void 0 ? _c : "OK");
                buttonContainer.appendChild(confirmButton);
            }
            this.element.showModal();
            if (options.builder) {
                this.message.innerHTML = "<div class='parley-loader'></div>";
                const body = yield options.builder();
                this.message.innerHTML = "";
                this.message.append(body);
            }
            else if (options.body) {
                this.message.innerHTML = "";
                this.message.append(options.body);
            }
            this.form.appendChild(buttonContainer);
            return new Promise(resolve => {
                this.element.addEventListener("close", function () {
                    resolve(JSON.parse(this.returnValue || "false"));
                    this.returnValue = "";
                }, { once: true });
            });
        });
    }
    static close() {
        const data = new FormData(this.form);
        if (data.has("number")) {
            this.element.close(`${data.get("number") || "0"}`);
        }
        else if (data.has("string")) {
            this.element.close(JSON.stringify(data.get("string")));
        }
        else if (data.has("array")) {
            this.element.close(JSON.stringify(data.getAll("array")));
        }
        else if (this.form.querySelector("input")) {
            this.element.close("[]");
        }
        else {
            this.element.close("true");
        }
    }
    static cancel() {
        this.element.close();
    }
    static isInputType(options, ...inputs) {
        return inputs.indexOf(options.input) !== -1;
    }
    static isOpen() {
        return this.element.open;
    }
    constructor() {
        throw new TypeError("Illegal constructor");
    }
}
Parley.element = document.createElement("dialog");
Parley.title = document.createElement("h2");
Parley.form = document.createElement("form");
Parley.message = document.createElement("p");
//# sourceMappingURL=index.js.map
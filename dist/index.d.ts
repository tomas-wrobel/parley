declare class Parley {
    protected static element: HTMLDialogElement;
    protected static title: HTMLHeadingElement;
    protected static form: HTMLFormElement;
    protected static message: HTMLParagraphElement;
    static init(root?: Element | null): void;
    static fire<I extends keyof Parley.Inputs>(options: Parley.Options<I>): Promise<false | Parley.Inputs[I][0]>;
    static close(): void;
    static cancel(): void;
    protected static isInputType<I extends keyof Parley.Inputs>(options: Parley.Options, ...inputs: I[]): options is Parley.Options<I>;
    static isOpen(): boolean;
    private constructor();
}
declare namespace Parley {
    type Property<T> = T | (() => T) | Promise<T> | (() => Promise<T>);
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
        title?: string | HTMLElement;
        body?: string | HTMLElement;
        builder?: () => Promise<string | Element>;
        cancelButton?: string | HTMLElement | false;
        confirmButton?: string | HTMLElement | false;
        input: I;
        value?: Inputs[I][0];
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
        pattern?: RegExp;
        placeholder?: string;
    }
    interface SelectionOptions {
        [value: string]: string;
    }
}
//# sourceMappingURL=index.d.ts.map
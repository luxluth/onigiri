class Accelerator {
    // Accelerator is a class that represents a keyboard shortcut.

    // The key code of the key.
    public readonly code: string;
    callback: () => void;
    constructor(code: string, callback: () => void) {
        this.code = code;
        this.callback = callback;
    }

    // Returns a string representation of the accelerator.
    public toString(): string {
        return this.code;
    }

    activate(): void {
        // add an event listener to the document
        // that listens for the keydown event
        // and if the keydown event matches the accelerator
        // then call the callback
        document.addEventListener('keydown', (event) => {
            if (event.code === this.code) {
                this.callback();
            }
        });
    }

}

export { Accelerator };

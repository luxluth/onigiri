import { Accelerator } from './accelerator';
import { Icon } from './icon';


class MenuItem {
    // MenuItem is a class that represents a menu item.
    private _accelerator: Accelerator | null = null;
    private _callback: () => void | null = () => {};

    label = '';
    icon : Icon | null = null;
    tooltip = '';
    disabled = false;
    active = false;

    constructor(label: string, callback: () => void) {
        this.label = label;
        this._callback = callback;
    }

    setIcon(icon: Icon): void {
        // Sets the icon of the menu item.
        this.icon = icon;
    }

    setTooltip(tooltip: string): void {
        // Sets the tooltip of the menu item.
        this.tooltip = tooltip;
    }

    setDisabled(disabled: boolean): void {
        // Sets the menu item to disabled or enabled.
        this.disabled = disabled;
    }

    toggle(): void {
        // Toggles the menu item.
        this.active = !this.active;
    }

    setAccelerator(accelerator: Accelerator): void {
        // Sets the accelerator of the menu item.
        this._accelerator = accelerator;
    }

}

class CheckBoxMenuItem extends MenuItem {
    // CheckBoxMenuItem is a class that represents a check box menu item.
    private _checked: boolean = false;

    checked(): boolean {
        // Returns true if the check box is checked.
        return this._checked;
    }

    setChecked(checked: boolean): void {
        // Sets the check box to checked or unchecked.
        this._checked = checked;
    }

    toggleChecked(): void {
        // Toggles the check box.
        this._checked = !this._checked;
    }
}


class SubMenu extends MenuItem {
    // SubMenu is a class that represents a sub menu. A node in the menu tree.
    private _next: MenuItem | null = null;
    private _parent: MenuItem | null = null;

    constructor(label: string, callback: () => void) {
        super(label, callback);
    }

    setNext(next: MenuItem): void {
        // Sets the next menu item.
        this._next = next;
    }

    setParent(parent: MenuItem): void {
        // Sets the parent menu item.
        this._parent = parent;
    }

    getNext(): MenuItem | null {
        // Returns the next menu item.
        return this._next;
    }

    getParent(): MenuItem | null {
        // Returns the parent menu item.
        return this._parent;
    }

}

export { MenuItem, CheckBoxMenuItem, Accelerator};

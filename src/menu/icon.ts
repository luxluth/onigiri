import { menuIcon } from '../types';

class Icon {
    // Icon is a class that represents an icon.
    private _icon: menuIcon = {
        type: 'image',
        src: '',
    };

    constructor(icon: menuIcon) {
        this._icon = icon;
    }

    setIcon(icon: menuIcon): void {
        // Sets the icon of the menu item.
        this._icon = icon;
    }

    getIcon(): menuIcon {
        // Returns the icon of the menu item.
        return this._icon;
    }
}

export { Icon };

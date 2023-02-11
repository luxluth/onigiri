import { MenuItem } from './menuItem';

class TreeMenu {
    // example:
    // Settings (menuBuilder)
    // |_ pip (menuItem)
    // |_ airplay (menuItem)
    // |_ fullscreen (menuItem)
    // |_ advanced (menuItem)
    //   |_ captions (subMenu -> parent: advanced -> next: quality)
    //   |_ quality (subMenu -> parent: advanced -> next: speed)
    //   |_ speed (subMenu -> parent: advanced -> next: null)
    // |_ next (menuItem)

    // that gives us:
    // {
    //     'settings': {
    //         'pip': {},
    //         'airplay': {},
    //         'fullscreen': {},
    //         'advanced': {
    //             'captions': {},
    //             'quality': {},
    //             'speed': {},
    //         },
    //         'next': {},
    //     },
    // }

    // TreeMenu is a class that represents a menu tree.
    // It is used to build the menu.
    // It is used to build the settings menu.
    private _root: MenuItem | null = null;
    private _current: MenuItem | null = null;
    

}

class Menu {
    // Menu is a class that represents a menu.
    // It is a collection of menu items.
    // It is used to build the menu.
    // It is used to build the settings menu.
    items: MenuItem[] = [];
    constructor (treeMenu?: TreeMenu) {}

    public append(item: MenuItem): void {
        // Append a menu item to the menu.
        this.items.push(item);
    }
}

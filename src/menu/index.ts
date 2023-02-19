class Item {
    label: string
    icon: string | null
    nested: Item | null = null
    constructor(label: string, icon: string | null=null) {
        this.label = label
        this.icon = icon
        return this
    }

    nest(item: Item) {
        this.nested = item
        return this
    }
}

class Choice {
    label: string | null = null
    icon: string | null = null
    value: any

    constructor(label: string | null, icon: string | null, value: any) {
        this.label = label
        this.icon = icon
        this.value = value
    }
}

class RangeItem extends Item {
    maxRange: number;
    defaultRange: number;
    constructor(
        label: string, 
        icon: string | null=null, 
        maxRange: number=1, 
        defaultRange: number=0.5
    ) {
        super(label, icon)
        this.maxRange = maxRange
        this.defaultRange = defaultRange
    }
}

class ChoiceItem extends Item {
    choices: Choice[]
    currentChoice: number | null

    constructor(
        label: string,
        icon: string | null = null,
        choices: Choice[] = [],
        currentChoice: number | null = null 
    ) {
        super(label, icon)
        this.choices = choices
        this.currentChoice = currentChoice
    }
    
    getCurrent() {
        if (this.currentChoice) { return this.choices[this.currentChoice] }
        return null
    }

    getChoice(id: number) {
        if (this.choices.length < id) { return this.choices[id] }
        return null
    }

    setChoice(choice: number | Choice) { return choice };
}

class ToogleItem extends Item {
    title: string = "Toogle" 
    states: [any, any]
    activeState: number

    constructor(
        title: string, 
        icon: string | null = null,
        states: [any, any], 
        activeState: number = 0
    ) {
        super(title, icon)
        this.title = title
        this.states = states
        this.activeState = activeState
    }

    toogle() {
        this.activeState == 0 ? this.activeState = 1 : this.activeState = 0
    }
}

class Menu {
    items: Item[]
    constructor() {
        this.items = [];
    }

    addItem(item: Item) {
        this.items = [...this.items, item] 
    }

}

class MenuBuilder {
    menu: Menu

    constructor() {
        this.menu = new Menu()
        return this
    }

    addItem(label: string, icon?: string) {
        icon? this.menu.addItem(new Item(label, icon)) : this.menu.addItem(new Item(label, null))
        return this
    }

    addRange(
        label: string, 
        icon: string | null=null, 
        maxRange: number=1, 
        defaultRange: number=0.5
    ) {
        this.menu.addItem(new RangeItem(label, icon, maxRange, defaultRange))
        return this
    }

    addChoice(
        label: string,
        icon: string | null = null,
        choices: Choice[] = [],
        currentChoice: number | null = null 
    ) {
        this.menu.addItem(new ChoiceItem(label, icon, choices, currentChoice))
        return this
    }

    addToogle(
        title: string, 
        icon: string | null = null,
        states: [any, any], 
        activeState: number = 0
    ) {
        this.menu.addItem(new ToogleItem(title, icon, states, activeState))
        return this
    }
    
    add(item: Item) {
        this.menu.addItem(item)
        return this
    }
    
    addListOfItems(items: Item[]) {
        items.forEach((item) => {
            this.menu.addItem(item)
        })
        return this
    }
    
    build() {
        return this.menu
    }
    
}

let nestedItem = new Item("top")
nestedItem.nest(new Item("in"))
nestedItem.nested?.nest(new Item("deeper").nest(new Item("even deeper")))

let menu = new MenuBuilder()
        .addItem("lol")
        .addItem("mdr")
        .addRange("volume", null)
        .add(nestedItem)
        .build()

console.log(menu.items)   


export {
    Item,
    Choice,
    ChoiceItem,
    RangeItem,
    ToogleItem,
    Menu,
    MenuBuilder
}

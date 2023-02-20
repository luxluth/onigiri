class Item {
    label: string
    icon: string | null
    html: HTMLDivElement | null = null
    constructor(label: string, icon: string | null=null) {
        this.label = label
        this.icon = icon
        return this
    }

    render(): HTMLDivElement {
        this.html = new HTMLDivElement()
        this.html.className = "onigiri-menu-item"

        if (this.icon) {
            let ic = new HTMLDivElement()
            let iconImage = new HTMLImageElement()
            iconImage.src = this.icon
            ic.append(iconImage)
            this.html.append(ic)
        }

        let dscrp = new HTMLDivElement()
        dscrp.innerText = this.label
        
        this.html.append(dscrp)
        
        this.html.addEventListener("click", () => {
            // Send a custom event itemClick
            this.html?.dispatchEvent(new CustomEvent("itemClick", { detail: this }))
        })

        return this.html
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

    render(): HTMLDivElement {
        this.html = new HTMLDivElement()
        this.html.className = "onigiri-menu-item-range"

        if (this.icon) {
            let ic = new HTMLDivElement()
            let iconImage = new HTMLImageElement()
            iconImage.src = this.icon
            ic.append(iconImage)
            this.html.append(ic)
        }

        
        let dscrp = new HTMLDivElement()
        dscrp.innerText = this.label

        let range = new HTMLInputElement()
        range.type = "range"
        range.min = "0"
        range.max = this.maxRange.toString()
        range.value = this.defaultRange.toString()

        this.html.append(dscrp)

        this.html.append(range)

        this.html.addEventListener("click", () => {
            // Send a custom event itemClick
            this.html?.dispatchEvent(new CustomEvent("itemClick", { detail: this }))
        })

        return this.html
    }
}

class ChoiceItem extends Item {
    choices: Choice[]
    currentChoice: number | null
    activated: boolean = false

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

    setChoice(choice: number | Choice) {
        if (typeof choice == "number") {
            if (this.choices.length < choice) { this.currentChoice = choice }
        } else {
            this.currentChoice = this.choices.indexOf(choice)
        }
    }

    render(): HTMLDivElement {
        this.html = new HTMLDivElement()
        this.html.className = "onigiri-menu-item-choice"

        if (this.icon) {
            let ic = new HTMLDivElement()
            let iconImage = new HTMLImageElement()
            iconImage.src = this.icon
            ic.append(iconImage)
            this.html.append(ic)
        }

        let dscrp = new HTMLDivElement()
        dscrp.innerText = this.label

        let choice = new HTMLDivElement()
        choice.className = "onigiri-menu-item-choice-current"
        let current = this.getCurrent()
        choice.innerText = current?.label || "Unknown"
        
        let openIcon = new HTMLDivElement()
        openIcon.className = "onigiri-menu-item-choice-open"
        let openIconImage = new SVGElement()
        openIconImage.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
        `
        this.html.append(dscrp)

        this.html.append(choice)
        this.html.append(openIcon)

        this.html.addEventListener("click", () => {
            this.activated = true
            let choices = new HTMLDivElement()
            choices.className = "onigiri-menu-item-choice-choices"
            this.choices.forEach((choice, i) => {
                let choiceDiv = new HTMLDivElement()
                choiceDiv.className = "onigiri-menu-item-choice-choice"
                choiceDiv.innerText = choice.label || "Unknown"
                choiceDiv.addEventListener("click", () => {
                    this.currentChoice = i
                    this.html?.dispatchEvent(new CustomEvent("itemClick", { detail: this }))
                })
                choices.append(choiceDiv)
            })
            this.html?.dispatchEvent(new CustomEvent("itemChoices", { detail: choices }))
        })

        return this.html

    }
}

class ToogleItem extends Item {
    title: string = "Toogle" 
    state: boolean = true 

    constructor(
        title: string, 
        icon: string | null = null,
        state: boolean
    ) {
        super(title, icon)
        this.title = title
        this.state = state    
    }

    toogle() {
        this.state = !this.state
    }

    render(): HTMLDivElement {
        this.html = new HTMLDivElement()
        this.html.className = "onigiri-menu-item-toogle"

        if (this.icon) {
            let ic = new HTMLDivElement()
            let iconImage = new HTMLImageElement()
            iconImage.src = this.icon
            ic.append(iconImage)
            this.html.append(ic)
        }

        let dscrp = new HTMLDivElement()
        dscrp.innerText = this.title

        let switchElem = new HTMLLabelElement()
        switchElem.className = "onigiri-menu-item-toogle-switch"
        let switchInput = new HTMLInputElement()
        switchInput.type = "checkbox"
        switchInput.checked = this.state
        let switchSpan = new HTMLSpanElement()
        switchSpan.className = "onigiri-menu-item-toogle-slider"
        switchElem.append(switchInput)
        switchElem.append(switchSpan)
        
        this.html.append(dscrp)
        this.html.append(switchElem)

        this.html.addEventListener("click", () => {
            this.toogle()
            this.html?.dispatchEvent(new CustomEvent("itemClick", { detail: this }))
        })

        return this.html

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

    removeItem(item: Item) {
        this.items = this.items.filter(i => i != item)
    }

    render(): HTMLDivElement {
        let menu = new HTMLDivElement()
        menu.className = "onigiri-menu"

        this.items.forEach(item => {
            menu.append(item.render())
        })

        return menu
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
        state: boolean = true
    ) {
        this.menu.addItem(new ToogleItem(title, icon, state))
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

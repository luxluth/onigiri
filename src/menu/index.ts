class Item {
    label: string
    icon: string
    html: HTMLDivElement | null = null
    constructor(label: string, icon?: string) {
        this.label = label
        this.icon = icon || ""
        return this
    }

    render(): HTMLDivElement {
        this.html = document.createElement("div") as HTMLDivElement
        this.html.className = "onigiri-menu-item"

        if (this.icon) {
            let ic = document.createElement("div") as HTMLDivElement
            let iconImage = document.createElement("img") as HTMLImageElement
            iconImage.src = this.icon
            ic.append(iconImage)
            this.html.append(ic)
        }

        let dscrp = document.createElement("div") as HTMLDivElement
        dscrp.innerText = this.label

        this.html.append(dscrp)

        this.html.addEventListener("click", () => {
            this.html?.dispatchEvent(new CustomEvent("itemClick", { detail: this }))
        })

        return this.html
    }

}

class Choice {
    label: string
    icon: string
    value: any

    constructor(label: string, value: any, icon?: string) {
        this.label = label
        this.icon = icon || ""
        this.value = value
    }
}

class RangeItem extends Item {
    maxRange: number;
    defaultRange: number;
    constructor(
        label: string,
        maxRange?: number,
        defaultRange?: number,
        icon?: string,
    ) {
        super(label, icon || "")
        this.maxRange = maxRange || 100
        this.defaultRange = defaultRange || 0
    }

    render(): HTMLDivElement {
        this.html = document.createElement("div") as HTMLDivElement
        this.html.className = "onigiri-menu-item-range"

        if (this.icon) {
            let ic = document.createElement("div") as HTMLDivElement
            let iconImage = document.createElement("img") as HTMLImageElement
            iconImage.src = this.icon
            ic.append(iconImage)
            this.html.append(ic)
        }


        let dscrp = document.createElement("div") as HTMLDivElement
        dscrp.innerText = this.label

        let range = document.createElement("input") as HTMLInputElement
        range.type = "range"
        range.min = "0"
        range.max = this.maxRange.toString()
        range.value = this.defaultRange.toString()

        this.html.append(dscrp)

        this.html.append(range)

        this.html.addEventListener("click", () => {
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
        choices: Choice[] = [],
        currentChoice: number,
        icon?: string,
    ) {
        super(label, icon || "")
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
        this.html = document.createElement("div") as HTMLDivElement
        this.html.className = "onigiri-menu-item-choice"

        if (this.icon) {
            let ic = document.createElement("div") as HTMLDivElement
            let iconImage = document.createElement("img") as HTMLImageElement
            iconImage.src = this.icon
            ic.append(iconImage)
            this.html.append(ic)
        }

        let dscrp = document.createElement("div") as HTMLDivElement
        dscrp.innerText = this.label

        let choice = document.createElement("div") as HTMLDivElement
        choice.className = "onigiri-menu-item-choice-current"
        let current = this.getCurrent()
        choice.innerText = current?.label || "Unknown"

        let openIcon = document.createElement("div") as HTMLDivElement
        openIcon.className = "onigiri-menu-item-choice-open"
        let openIconImage = document.createElement("svg") as unknown as SVGElement
        // create attributes
        openIconImage.setAttribute("viewBox", "0 0 500 500")
        openIconImage.setAttribute("xmlns", "http://www.w3.org/2000/svg")
        openIconImage.innerHTML = `<path d="M 299.942 371.135 L 356.022 143.033 L 120.674 143.033 C 110.619 143.033 102.468 134.882 102.468 124.827 C 102.468 114.772 110.619 106.621 120.674 106.621 L 375.959 106.621 C 378.44 106.153 381.058 106.197 383.669 106.839 C 393.433 109.239 399.403 119.101 397.002 128.865 L 335.301 379.828 C 332.9 389.592 323.039 395.562 313.275 393.161 C 303.511 390.761 297.541 380.899 299.942 371.135 Z" style="" transform="matrix(0.738433, 0.674327, -0.674327, 0.738433, 233.973549, -103.190291)"/>
        `
        openIcon.append(openIconImage)

        this.html.append(dscrp)

        this.html.append(choice)
        this.html.append(openIcon)

        this.html.addEventListener("click", () => {
            this.activated = true
            let choices = document.createElement("div") as HTMLDivElement
            choices.className = "onigiri-menu-item-choice-choices"
            this.choices.forEach((choice, i) => {
                let choiceDiv = document.createElement("div") as HTMLDivElement
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
    title: string
    state: boolean

    constructor(
        title: string,
        state: boolean,
        icon?: string
    ) {
        super(title, icon || "")
        this.title = title
        this.state = state
    }

    toogle() {
        this.state = !this.state
    }

    render(): HTMLDivElement {
        this.html = document.createElement("div") as HTMLDivElement
        this.html.className = "onigiri-menu-item-toogle"

        if (this.icon) {
            let ic = document.createElement("div") as HTMLDivElement
            let iconImage = document.createElement("img") as HTMLImageElement
            iconImage.src = this.icon
            ic.append(iconImage)
            this.html.append(ic)
        }

        let dscrp = document.createElement("div") as HTMLDivElement
        dscrp.innerText = this.title

        let switchElem = document.createElement("label") as HTMLLabelElement
        switchElem.className = "onigiri-menu-item-toogle-switch"
        let switchInput = document.createElement("input") as HTMLInputElement
        switchInput.type = "checkbox"
        switchInput.checked = this.state
        let switchSpan = document.createElement("span") as HTMLSpanElement
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
        let menu = document.createElement("div") as HTMLDivElement
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
        icon? this.menu.addItem(new Item(label, icon)) : this.menu.addItem(new Item(label))
        return this
    }

    addRange(
        label: string,
        maxRange: number=1,
        defaultRange: number=0.5,
        icon?: string,
    ) {
        this.menu.addItem(new RangeItem(label, maxRange, defaultRange, icon))
        return this
    }

    addChoice(
        label: string,
        choices: Choice[],
        currentChoice: number,
        icon?: string,
    ) {
        this.menu.addItem(new ChoiceItem(label, choices, currentChoice, icon))
        return this
    }

    addToogle(
        title: string,
        state: boolean,
        icon?: string,
    ) {
        this.menu.addItem(new ToogleItem(title, state, icon))
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

const menuBuilder = () => {
    return new MenuBuilder()
}

export {
    Item,
    Choice,
    ChoiceItem,
    RangeItem,
    ToogleItem,
    Menu,
    menuBuilder,
    MenuBuilder,
}

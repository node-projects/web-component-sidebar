import { BaseCustomWebComponentConstructorAppendLazyReady, css, html, TypedEvent } from "@node-projects/base-custom-webcomponent";

export class SidebarMenu extends BaseCustomWebComponentConstructorAppendLazyReady {
    static readonly style = css`
        :host {
            --main-bg-color: #fefefe;
            --main-font-color: #000;
            --hover-bg-color: #eee;
            --selected-font-color: #000;
            --submenu-border-color: #eee;
            --icon-bg-color: transparent;
            --sidebar-cell-height: 80px;
            --sidebar-icon-height: 60px;
            --sidebar-cell-minwidth: 250px;
            --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            --font-size: 1.1rem;
        }
    
        * {
            font-family: var(--font-family);
            font-size: var(--font-size);
            color: var(--main-font-color);
        }

        nav.sidebar {
            height: calc(100% - 40px);
            background-color: var(--main-bg-color);
            display: flex;
            flex-direction: column;
            box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
        }

        div.sidebar-cell {
            display: grid;
            grid-template-columns: 1fr 30px;
            align-items: center;
            gap: 15px;

            padding: 10px 10px 10px 30px;
            cursor: pointer;
            white-space: nowrap;
            height: var(--sidebar-cell-height);
        }

        div.sidebar-cell.has-icon {
            grid-template-columns: var(--sidebar-icon-height) 1fr 25px;
        }

        nav.sidebar.compact>div.sidebar-cell {
            grid-template-columns: var(--sidebar-icon-height) 25px;
            gap: 0px;
        }

        nav.sidebar.compact>div.sidebar-cell>div.sidebar-cell-text {
            display: none;
        }

        div.sidebar-cell:hover {
            background-color: var(--hover-bg-color);
        }

        div#subMenu {
            position: absolute;
            background-color: var(--main-bg-color);
            border-left: 3px solid var(--submenu-border-color);
            min-width: var(--sidebar-cell-minwidth);
            visibility: hidden;
            box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
        }

        div#subMenu.sidebar-menu-visible {
            visibility: visible;
        }

        #collapse {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 30px;
            background-color: var(--main-bg-color);
            color: var(--main-font-color);
            padding: 5px;
        }

        #collapse{
            rotate: 180deg;
        }

        #collapse.turned {
            rotate: 0deg;
        }

        #collapse > * {
            height: 100%;
        }

        #icon {
            background-color: var(--icon-bg-color);
            border-radius: 10px;
            height: var(--sidebar-icon-height);
        }

        #icon > * {
            margin: 10%;
            height: calc(100% - 20%);
            width: calc(100% - 20%);
        }
    `;

    static readonly template = html`
        <nav id="sidebar" class="sidebar"></nav>
        <span id="collapse"></span>
    `;

    static readonly properties = {
        imagesRoot: "",
        menuItems: Object
    }

    public sidebarItemPressed = new TypedEvent<SideBarMenuChild>;

    public menuItems: SideBarMenuChild[] = [];
    public imagesRoot: string;
    private sidebar: HTMLDivElement;
    private collapseElem: HTMLElement;


    private _isCompact: boolean = false;
    public isCompact = () => this.switchSidebarCompactness();

    constructor() {
        super();
        this._restoreCachedInititalValues();
        this.collapseAllMenu = this.collapseAllMenu.bind(this);
    }

    ready() {
        this._parseAttributesToProperties();
        this.sidebar = this._getDomElement<HTMLDivElement>("sidebar");
        this.buildMenu(this.menuItems, this.sidebar);

        this.collapseElem = this._getDomElement<HTMLElement>("collapse")
        this.collapseElem.appendChild(SidebarMenu.expanderIcon.content.cloneNode(true));
        this.collapseElem.onpointerdown = () => this.switchSidebarCompactness();
    }

    private buildMenu(menuItems: SideBarMenuChild[], host: HTMLElement) {
        for (let item of menuItems) {
            host.appendChild(this.buildItem(item, 1))
        }
    }

    private collapseAllMenu(event: MouseEvent) {
        let elem = <HTMLElement>event.composedPath()[0];
        if (!this.isSubNodeOf(elem, this.sidebar)) {
            this.collapseMenuTillDepth(0);
        }
    }

    private collapseMenuTillDepth(depth: number) {
        let elements = this._getDomElements<HTMLElement>("div#subMenu");
        for (let el of elements) {
            if (!el["$depth"] || el["$depth"] > depth)
                el.classList.remove("sidebar-menu-visible");
        }
    }

    private isSubNodeOf(element: HTMLElement, potParent: HTMLElement): boolean {
        if (element == potParent) return true;
        while (element.parentElement != null) {
            if (element.parentElement == potParent) return true;
            element = element.parentElement;
        }
        return false;
    }

    private buildItem(item: SideBarMenuChild, depth: number): HTMLElement {
        let elem: HTMLElement;
        if (depth == 1) {
            elem = !item.children || item.children.length < 1
                ? (<DocumentFragment>SidebarMenu.sidebarTopItem.content.cloneNode(true)).children[0] as HTMLElement
                : (<DocumentFragment>SidebarMenu.sidebarTopItemWithChildren.content.cloneNode(true)).children[0] as HTMLElement;
        } else {
            elem = !item.children || item.children?.length < 1
                ? (<DocumentFragment>SidebarMenu.sidebarMenuItem.content.cloneNode(true)).children[0] as HTMLElement
                : (<DocumentFragment>SidebarMenu.sidebarMenuItemWithChildren.content.cloneNode(true)).children[0] as HTMLElement;
        }

        let content = elem.querySelector("#content");
        let icon = elem.querySelector("#icon");

        content.innerHTML = item.displayName;

        if (item.icon?.length > 0) {
            icon.appendChild(this.buildImageFromPath(item.icon));
        }

        elem["$data"] = item;

        if (item.children && item.children.length > 0) {
            elem.appendChild((<HTMLElement>SidebarMenu.expanderIcon.content.cloneNode(true)).children[0]);
            let frac = document.createDocumentFragment();
            for (let it of item.children) {
                frac.appendChild(this.buildItem(it as SideBarMenuChild, depth + 1));
            }
            let subMenu = elem.querySelector("div#subMenu") as HTMLElement;
            subMenu["$depth"] = depth;
            subMenu.appendChild(frac);
        }

        elem.onpointerdown = (e) => {
            if (!e.defaultPrevented)
                this.menuItemPressed(elem, /*e*/);
            e.preventDefault();
        }

        return elem;
    }

    private menuItemPressed(element: HTMLElement, /*event: MouseEvent*/) {
        if (!element["$data"].children || element["$data"].children.length < 1) {
            this.sidebarItemPressed.emit(element["$data"]);
            this.collapseMenuTillDepth(0);
        } else {
            // Close all SubMenus, where depth lt higher new depth
            this.collapseMenuTillDepth(element.parentElement["$depth"] ?? 0);
            // Expand
            let rect = element.getBoundingClientRect();
            let subMenu = element.querySelector("div#subMenu") as HTMLElement;
            subMenu.classList.add("sidebar-menu-visible");
            subMenu.style.top = rect.top + "px";
            subMenu.style.left = rect.width + "px";
        }
    }

    private buildImageFromPath(iconPath: string): HTMLImageElement {
        let image = document.createElement("img");
        image.src = this.imagesRoot + "/" + iconPath;
        return image;
    }

    private switchSidebarCompactness() {
        this._isCompact = !this._isCompact;
        if (this._isCompact) {
            this.sidebar.classList.add("compact");
            this.collapseElem.classList.add("turned");
        } else {
            this.sidebar.classList.remove("compact");
            this.collapseElem.classList.remove("turned");
        }
    }

    static readonly sidebarTopItem = html`
        <div class="sidebar-cell has-icon">
            <div class="sidebar-cell-icon" id="icon"></div>
            <div class="sidebar-cell-text" id="content"></div>
        </div>
    `;

    static readonly sidebarTopItemWithChildren = html`
        <div class="sidebar-cell has-icon">
            <div class="sidebar-cell-icon" id="icon"></div>
            <div class="sidebar-cell-text" id="content"></div>
            <div id="subMenu"></div>
        </div>
    `;

    static readonly sidebarMenuItem = html`
        <div class="sidebar-cell">
            <div class="sidebar-cell-text" id="content"></div>
        </div>
    `;

    static readonly sidebarMenuItemWithChildren = html`
        <div class="sidebar-cell">
            <div class="sidebar-cell-text" id="content"></div>
            <div id="subMenu"></div>
        </div>
    `;

    static readonly expanderIcon = html`
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="1.5"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier"> <path d="M9 6L15 12L9 18" stroke="var(--main-font-color)" stroke-width="1.5"></path></g>
        </svg>
    `;

    connectedCallback() {
        window.addEventListener("click", this.collapseAllMenu)
    }

    disconnectedCallback() {
        window.removeEventListener("click", this.collapseAllMenu)
    }
}
customElements.define("sidebar-menu", SidebarMenu);
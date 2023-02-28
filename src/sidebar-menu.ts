import { BaseCustomWebComponentConstructorAppendLazyReady, css, html, TypedEvent } from "@node-projects/base-custom-webcomponent";

export class SidebarMenu extends BaseCustomWebComponentConstructorAppendLazyReady {
    static readonly style = css`
        nav.sidebar {
            height: 100%;
            min-width: 80px;
            max-width: 250px;
            background-color: #21333D;
            display: flex;
            flex-direction: column;
        }

        div.sidebar-cell {
            display: grid;
            grid-template-columns: 80px 1fr 20px;
            padding-right: 10px;
            height: 80px;
            align-items: center;
            justify-content: left;
            cursor: pointer;
            color: white;
        }

        div.sidebar-cell:hover {
            background-color: #2E4A5A;
        }

        div.sidebar-cell-icon {
            width: 80px;
            height: 80px;
        }

        div.sidebar-cell-text {
            padding-right: 20px;
        }

        div#subMenu {
            position: absolute;
            background-color: #21333D;
            // min-width: 230px;
            border-left: 3px solid #2E4A5A;
            flex-direction: column;
            visibility: hidden;
        }

        div#subMenu.sidebar-menu-visible {
            visibility: visible;
        }
    `;

    static readonly template = html`
        <nav id=sidebar class="sidebar"></nav>
    `;

    static readonly properties = {
        menuItems: Object
    }

    public sidebarItemPressed = new TypedEvent<SideBarMenuChild>;

    public menuItems: SideBarMenuChildWithIcon[] = [];
    private sidebar: HTMLDivElement;

    constructor() {
        super();
        this._restoreCachedInititalValues();
        this.collapseMenu = this.collapseMenu.bind(this);
    }

    connectedCallback() {
        window.addEventListener("click", this.collapseMenu)
    }

    disconnectedCallback() {
        window.removeEventListener("click", this.collapseMenu)
    }

    ready() {
        this._parseAttributesToProperties();
        this.sidebar = this._getDomElement<HTMLDivElement>("sidebar");
        this.buildMenu(this.menuItems, this.sidebar);
    }

    buildMenu(menuItems: SideBarMenuChildWithIcon[], host: HTMLElement) {
        for (let item of menuItems) {
            host.appendChild(this.buildItem(item, 0))
        }
    }

    private collapseMenu(event: MouseEvent) {
        let elem = <HTMLElement>event.composedPath()[0];
        if (this.isSubNodeOf(elem, this.sidebar)) {

        } else {
            let elements = this._getDomElements<HTMLElement>("div#subMenu");
            for (let el of elements) {
                el.classList.remove("sidebar-menu-visible");
            }
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


    private buildItem(item: SideBarMenuChildWithIcon, depth: number): HTMLElement {
        let elem = item.children?.length < 1
            ? (<DocumentFragment>SidebarMenu.sidebarMenuItem.content.cloneNode(true)).children[0] as HTMLElement
            : (<DocumentFragment>SidebarMenu.sidebarMenuItemWithChildren.content.cloneNode(true)).children[0] as HTMLElement;
        let content = elem.querySelector("#content");
        let icon = elem.querySelector("#icon");

        content.innerHTML = item.displayName;
        icon.innerHTML = item.iconIsHtml ? item.icon : "";

        elem["$data"] = item;

        elem.onmousedown = (e) => { this.menuItemPressed(elem, e) }

        if (item.children && item.children.length > 0) {
            elem.appendChild((<HTMLElement>SidebarMenu.expanderIcon.content.cloneNode(true)).children[0]);
            let frac = document.createDocumentFragment();
            for (let it of item.children) {
                frac.appendChild(this.buildItem(it as SideBarMenuChildWithIcon, depth++));
            }
            let subMenu = elem.querySelector("div#subMenu") as HTMLElement;
            subMenu.appendChild(frac);
        }

        return elem;
    }

    private menuItemPressed(element: HTMLElement, event: MouseEvent) {
        if (!element["$data"].children || element["$data"].children.length < 1) {
            this.sidebarItemPressed.emit(element["$data"]);
        } else {
            // Expand
            let rect = element.getBoundingClientRect();
            let subMenu = element.querySelector("div#subMenu") as HTMLElement;
            subMenu.classList.add("sidebar-menu-visible");
            subMenu.style.top = rect.top + "px";
            subMenu.style.left = rect.width + "px";
        }
    }

    static readonly sidebarMenuItem = html`
        <div class="sidebar-cell" style="height: 80px;">
            <div class="sidebar-cell-icon" id="icon"></div>
            <div class="sidebar-cell-text" id="content"></div>
        </div>
    `;

    static readonly sidebarMenuItemWithChildren = html`
        <div class="sidebar-cell" style="height: 80px;">
            <div class="sidebar-cell-icon" id="icon"></div>
            <div class="sidebar-cell-text" id="content"></div>
            <div id="subMenu"></div>
        </div>
    `;

    static readonly expanderIcon = html`
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier"> <path d="M9 6L15 12L9 18" stroke="#FFFFFF" stroke-width="2"></path></g>
        </svg>
    `
}
customElements.define("sidebar-menu", SidebarMenu);
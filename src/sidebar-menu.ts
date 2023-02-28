import { BaseCustomWebComponentConstructorAppendLazyReady, css, html, TypedEvent } from "@node-projects/base-custom-webcomponent";

export class SidebarMenu extends BaseCustomWebComponentConstructorAppendLazyReady {
    static readonly style = css`
        * {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 1.1rem;
            color: white;
        }

        nav.sidebar {
            height: calc(100% - 40px);
            background-color: #21333D;
            display: flex;
            flex-direction: column;
            box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
        }

        div.sidebar-cell {
            display: grid;
            padding: 10px;
            align-items: center;
            cursor: pointer;
            color: white;
            grid-template-columns: 1fr 20px;
            gap: 10px;
            white-space: nowrap;
            height: 100px;
        }

        div.sidebar-cell.has-icon {
            grid-template-columns: 80px 1fr 20px;
        }

        nav.sidebar.compact>div.sidebar-cell {
            grid-template-columns: 80px 20px;
            gap: 0px;
        }
        nav.sidebar.compact>div.sidebar-cell>div.sidebar-cell-text {
            display: none;
        }

        div.sidebar-cell:hover {
            background-color: #2E4A5A;
        }

        div.sidebar-cell-text {
            padding-right: 20px;
        }

        div#subMenu {
            position: absolute;
            background-color: #21333D;
            border-left: 3px solid #2E4A5A;
            flex-direction: column;
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
            background-color: #21333D;
            padding: 5px;
        }

        #collapse.turned {
            rotate: 180deg;
        }

        #collapse > * {
            height: 100%;
        }

        #icon {
            background-color: gray;
            border-radius: 10px;
        }
    `;

    static readonly template = html`
        <nav id="sidebar" class="sidebar"></nav>
        <span id="collapse"><span>
    `;

    static readonly properties = {
        menuItems: Object
    }

    public sidebarItemPressed = new TypedEvent<SideBarMenuChild>;

    public menuItems: SideBarMenuChildWithIcon[] = [];
    private sidebar: HTMLDivElement;
    private collapseElem: HTMLElement;


    private isCompact: boolean = false;

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
        this.collapseElem.onpointerdown = () => this.switchBetweenSidebarCompactness();
    }

    private buildMenu(menuItems: SideBarMenuChildWithIcon[], host: HTMLElement) {
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

    private buildItem(item: SideBarMenuChildWithIcon, depth: number): HTMLElement {
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

        if (icon) icon.innerHTML = item.iconIsHtml ? item.icon : "";

        elem["$data"] = item;

        if (item.children && item.children.length > 0) {
            elem.appendChild((<HTMLElement>SidebarMenu.expanderIcon.content.cloneNode(true)).children[0]);
            let frac = document.createDocumentFragment();
            for (let it of item.children) {
                frac.appendChild(this.buildItem(it as SideBarMenuChildWithIcon, depth + 1));
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

    private switchBetweenSidebarCompactness() {
        this.isCompact = !this.isCompact;
        if (this.isCompact) {
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
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier"> <path d="M9 6L15 12L9 18" stroke="#FFFFFF" stroke-width="2"></path></g>
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
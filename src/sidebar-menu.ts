import { BaseCustomWebComponentConstructorAppendLazyReady, css, html } from "@node-projects/base-custom-webcomponent";
import { dom } from "@fortawesome/fontawesome-svg-core";

export class SidebarMenu extends BaseCustomWebComponentConstructorAppendLazyReady {
    static readonly style = css`
        .sidebar {
            height: 100%;
            width: 80px;
            background-color: #21333D;
            display: flex;
            flex-direction: column;

            // transition: width 0.15s;
        }

        .sidebar-cell-icon > svg {
            margin: 25px;
            font-size: 1.5em;
            color: #fff;
        }

        .sidebar-cell {
            display: flex;
            height: 80px;
            width: 100%;
            align-items: center;
            justify-content: left;
            cursor: pointer;
        }

        // .sidebar-cell[hidden=false] > sidebar-cell-icon {
        //     width: 100%;
        //     height: 100%;
        // }

        .sidebar-cell-icon {
            width: 80px;
            height: 80px;
        }
        .sidebar-cell-text {
            flex-grow: 1;
            font-size: 1.2em;
            font-weight: bolder;
            color: white;
        }

        #overlay {
            position: absolute;
            background-color: #21333D;
            min-width: 200px;
            // height: 100%;
            border-left: 3px solid #2E4A5A;
            display: flex;
            flex-direction: column;
        }

        #sub-menu-content {
            height: 80px;
            padding: 0px 15px;
            cursor: pointer;
            font-size: 1.2em;
            font-weight: bolder;
            color: white;
            display: flex;
            align-items: center;
        }

        .sidebar-cell-selected {
            background-color: #2E4A5A;
            // border-radius: 5px;
        }
    `;

    static readonly template = html`
        <div class="sidebar" id="sidebar">
            
        </div>
    `;

    static readonly cellTemplate = html`
        <div class="sidebar-cell" style="height: 80px;">
            <div class="sidebar-cell-icon" id="icon">
            </div>
            <div class="sidebar-cell-text" hidden id="content">
            </div>
        </div>
    `;

    static readonly overlayRowTemplate = html`
        <span id="sub-menu-content"></span>
    `;

    private sidebarWidth = { slim: 80, extended: 250 }

    private menuItems: SideBarMenuChildWithIcon[] = [];
    private overlays: SideBarOverlayWrapper[] = [];

    private sidebar: HTMLDivElement;

    private previoslySelected: HTMLElement;

    constructor() {
        super();

        this.menuItems = [
            {
                id: "WMS",
                displayName: "WMS",
                icon: '<i class="fa-solid fa-warehouse"></i>',
                iconIsHtml: true,
                children: [
                    {
                        id: "WMS1",
                        displayName: "WMS1",
                        children: [
                            {
                                id: "WMS1",
                                displayName: "WMS1",
                            },
                            {
                                id: "WMS2",
                                displayName: "WMS2",
                            },
                            {
                                id: "WMS3",
                                displayName: "WMS3",
                            },
                            {
                                id: "WMS4",
                                displayName: "WMS4",
                            },
                        ]
                    },
                    {
                        id: "WMS2",
                        displayName: "WMS2",
                    },
                    {
                        id: "WMS3",
                        displayName: "WMS3",
                    }
                ]
            },
            {
                id: "MFLOW",
                displayName: "MFlow",
                icon: '<i class="fa-solid fa-pallet"></i>',
                iconIsHtml: true,
            },
            {
                id: "MWork",
                displayName: "MWork",
                icon: '<i class="fa-solid fa-barcode"></i>',
                iconIsHtml: true,
            },
            {
                id: "Service",
                displayName: "Service",
                icon: '<i class="fa-solid fa-wrench"></i>',
                iconIsHtml: true,
            }
        ]
    }

    ready() {
        this.sidebar = this._getDomElement<HTMLDivElement>('sidebar')

        dom.i2svg({ node: this.sidebar })
        dom.watch();

        this.buildMenuItems().forEach(el => this.sidebar.appendChild(el));
        this._getDomElements<HTMLElement>('.sidebar-cell').forEach(cell => {
            cell.onclick = () => {
                if (this.previoslySelected) this.previoslySelected.classList.remove('sidebar-cell-selected');

                this.overlays[0].pinned = true;
                this.extendMenuItem(cell);

                this.previoslySelected = cell;
                cell.classList.add('sidebar-cell-selected');
            }
        });

        this.overlays.push({
            element: this.sidebar,
            pinned: false,
            depth: 0,
        })

        this.sidebar.onmouseover = () => this.mouseOverSidebar(true);
        this.sidebar.onmouseout = () => this.mouseOverSidebar(false);
    }


    private mouseOverSidebar(isSlim: boolean = true) {
        // this.sidebar.innerHTML = '';
        // this.buildMenuItems().forEach(el => this.sidebar.appendChild(el));
        if (this.overlays[0].pinned) return;
        this.toggleDisplayNameVisibility();
        if (isSlim) {
            this.sidebar.style.width = this.sidebarWidth.extended + "px";
            return;
        }
        this.sidebar.style.width = this.sidebarWidth.slim + "px";
    }

    private buildMenuItems(): HTMLElement[] {
        // this.sidebar.innerHTML = '';
        if (!this.menuItems || this.menuItems.length === 0) return null;
        let cells = [];
        for (let item of this.menuItems) {
            let cell = SidebarMenu.cellTemplate.content.cloneNode(true) as HTMLElement;
            let icon = cell.querySelector('#icon');

            if (item.iconIsHtml) {
                icon.innerHTML = item.icon;
            } else {
                let img = document.createElement('img');
                img.src = item.icon;
                icon.appendChild(img);
            }

            let content = cell.querySelector('#content');
            content.innerHTML = item.displayName;

            dom.i2svg({ node: cell })
            dom.watch();

            cell.firstElementChild["$item-data"] = item;

            cells.push(cell);
        }

        return cells;
    }

    private extendMenuItem(cell: HTMLElement) {

        let item = cell["$item-data"];
        if (!item || !item.children || item.children.length === 0) return;

        if (this.overlays.length > 0)
            this.overlays[this.overlays.length].pinned = true;

        cell.classList.add('sidebar-cell-selected');

        let overlay = document.createElement('div');
        overlay.id = "overlay";
        let combinedWidth = 0;
        this._getDomElements<HTMLDivElement>('#overlay').forEach(el => combinedWidth += el.getBoundingClientRect().width);
        overlay.style.left = (combinedWidth + this.sidebarWidth.extended) + "px";

        for (let child of item.children) {
            let row = SidebarMenu.overlayRowTemplate.content.cloneNode(true) as HTMLElement;
            let content = row.querySelector('#sub-menu-content') as HTMLElement;
            content.innerHTML = child.displayName;

            content["$item-data"] = child;
            content.onclick = () => { this.extendMenuItem(content); }
            overlay.appendChild(row);
        }

        let overlayW: SideBarOverlayWrapper = {
            element: overlay,
            pinned: false,
            depth: 0
        };
        this.overlays.push(overlayW);

        overlayW.element.onmouseleave = () => { if (!overlayW.pinned) overlayW.element.remove(); }
        this.sidebar.appendChild(overlay);
    }

    private toggleDisplayNameVisibility() {
        // if(this.overlays[0].pinned) return;
        let content = this._getDomElements<HTMLDivElement>('#content');
        if (!content || content.length === 0) return;
        for (let el of content) {
            el.hidden = !el.hidden;
        }
    }
}
customElements.define("sidebar-menu", SidebarMenu);

// export class 

interface SideBarMenuChild {
    id?: string;
    displayName: string;
    children?: SideBarMenuChild[];
}

interface SideBarMenuChildWithIcon extends SideBarMenuChild {
    icon: string;
    iconIsHtml?: boolean;
    children?: SideBarMenuChild[];
}

interface SideBarOverlayWrapper {
    element: HTMLElement;
    pinned: boolean;
    depth: number;
}
import { BaseCustomWebComponentConstructorAppendLazyReady, css, html } from "@node-projects/base-custom-webcomponent";
import { dom } from "@fortawesome/fontawesome-svg-core";

export class SidebarMenu extends BaseCustomWebComponentConstructorAppendLazyReady {
    static readonly style = css`

        * {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .sidebar {
            height: 100%;
            width: 80px;
            background-color: #21333D;
            display: flex;
            flex-direction: column;
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

        .sidebar-cell * {
            pointer-events: none;
        }

        .sidebar-cell:hover {
            background-color: #2E4A5A;
        }

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
            min-width: 230px;
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
            <div class="sidebar-cell-text" id="content">
            </div>
        </div>
    `;

    static readonly overlayRowTemplate = html`
        <div class="sidebar-cell"></div>
    `;

    private sidebarWidth = { slim: 80, extended: 250 }

    private menuItems: SideBarMenuChildWithIcon[] = [];
    private overlays: SideBarOverlayWrapper[] = [];

    private sidebar: HTMLDivElement;

    private previoslySelected: HTMLElement;

    private extendedDepth: number = 0;
    private insetAmount: number = 10;

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
                children: [
                    {
                        id: "MVISU",
                        displayName: "MVISU",
                        children: [
                            {
                                id: "MVISU",
                                displayName: "MVISU",
                            },
                            {
                                id: "MVISU",
                                displayName: "MVISU",
                            },
                            {
                                id: "MVISU",
                                displayName: "MVISU",
                            },
                            {
                                id: "MVISU",
                                displayName: "MVISU",
                            },
                        ]
                    },
                    {
                        id: "MVISU",
                        displayName: "MVISU",
                    },
                    {
                        id: "MVISU",
                        displayName: "MVISU",
                    }
                ]
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

        this.buildMenuItems().forEach(el => this.sidebar.appendChild(el));
        this._getDomElements<HTMLElement>('.sidebar-cell').forEach(cell => {
            cell.onmouseenter = () => {
                this.clearAllOverlays();
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
            mouseOver: false
        })

        this.sidebar.onmouseenter = () => this.mouseOverSidebar(true);
        this.sidebar.onmouseleave = () => this.mouseOverSidebar(false);

        dom.i2svg({ node: this.sidebar })
        dom.watch();
    }

    private mouseOverSidebar(isSlim: boolean = true) {
        // if (this.overlays[0].pinned) return;
        // this.toggleDisplayNameVisibility();
        if (isSlim) {
            this.sidebar.style.width = this.sidebarWidth.extended + "px";
            return;
        }
        this.sidebar.style.width = this.sidebarWidth.slim + "px";
    }

    private buildMenuItems(): HTMLElement[] {
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
        this.extendedDepth++;

        let item = cell["$item-data"];
        if (!item || !item.children || item.children.length === 0) return;

        cell.classList.add('sidebar-cell-selected');

        let overlay = document.createElement('div');
        overlay.id = "overlay";
        let combinedWidth = 0;
        this._getDomElements<HTMLDivElement>('#overlay').forEach(el => combinedWidth += el.getBoundingClientRect().width - this.insetAmount);
        overlay.style.left = (combinedWidth + this.sidebarWidth.extended - this.insetAmount) + "px";

        for (let child of item.children) {
            let row = SidebarMenu.cellTemplate.content.cloneNode(true) as HTMLElement;
            let content = row.querySelector('#content') as HTMLElement;
            content.innerHTML = child.displayName;
            content.style.display = 'block';

            let sidebarCell = content.parentElement;
            sidebarCell["$item-data"] = child;
            sidebarCell.onmouseenter = () => { this.extendMenuItem(sidebarCell); }
            overlay.appendChild(row);
        }

        let overlayW: SideBarOverlayWrapper = {
            element: overlay,
            pinned: false,
            depth: this.extendedDepth,
            mouseOver: true,
        };
        this.overlays.push(overlayW);

        overlayW.element.onmouseleave = () => { this.handleMouseLeaveOverlay(overlayW); }
        this.sidebar.appendChild(overlay);
    }

    handleMouseLeaveOverlay(overlayLeft: SideBarOverlayWrapper) {
        overlayLeft.mouseOver = false;

        let noHover = true;
        this.overlays.sort((a, b) => b.depth - a.depth);
        for (let overlay of this.overlays) {
            if (overlay.mouseOver) {
                this.extendedDepth = overlay.depth;
                noHover = false;
                break;
            }
        }

        if (noHover) this.extendedDepth = 0;

        for (let i = this.overlays.length - 1; i >= 0; i--) {
            if (this.extendedDepth >= this.overlays[i].depth || this.overlays[i].depth == 0) continue;
            this.overlays[i].element.remove();
            this.overlays.splice(i, 1);

        }

        // for (let overlay of this.overlays) {
        //     if (overlay.depth == 0 || this.extendedDepth > overlay.depth) continue;
        //     overlay.element.remove();
        //     this.overlays.splice(this.overlays.indexOf(overlay), 1);
        // }
    }

    // private toggleDisplayNameVisibility() {
    //     let content = this._getDomElements<HTMLDivElement>('#content');
    //     if (!content || content.length === 0) return;
    //     for (let el of content) {
    //         el.hidden = !el.hidden;
    //     }
    // }

    private clearAllOverlays() {
        // for(let i = this.overlays.length - 1; i > 0; i--){
        //     this.overlays[i].element.remove();
        //     this.overlays.splice(i, 1);
        // }
        for (let overlay of this.overlays) {
            if (overlay.depth == 0) continue;
            overlay.element.remove();
            this.overlays.splice(this.overlays.indexOf(overlay), 1);
        }
    }
}
customElements.define("sidebar-menu", SidebarMenu);
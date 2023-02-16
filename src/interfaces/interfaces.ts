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
    mouseOver: boolean;
}
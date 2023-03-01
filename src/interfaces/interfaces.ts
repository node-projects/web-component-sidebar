interface SideBarMenuChild {
    id?: string;
    displayName: string;
    children?: SideBarMenuChild[];
    icon: string;
}
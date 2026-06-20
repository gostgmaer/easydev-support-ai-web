export const containerSizes = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
} as const;

export const contentWidths = {
  narrow: '640px',
  reading: '720px',
  standard: '960px',
  wide: '1200px',
  full: '100%',
} as const;

export const sidebarWidths = {
  collapsed: '64px',
  compact: '200px',
  default: '280px',
  expanded: '320px',
} as const;

/** Multi-pane workspace sizing (e.g. the agent inbox: list / thread / context). */
export const workspaceLayoutSizes = {
  listPane: '360px',
  detailPaneMin: '480px',
  contextPanel: '320px',
  aiPanel: '360px',
} as const;

export const panelSizes = {
  drawerSm: '320px',
  drawerMd: '480px',
  drawerLg: '640px',
  modalSm: '400px',
  modalMd: '560px',
  modalLg: '720px',
  modalXl: '960px',
} as const;

export type ContainerSizeKey = keyof typeof containerSizes;
export type ContentWidthKey = keyof typeof contentWidths;
export type SidebarWidthKey = keyof typeof sidebarWidths;
export type WorkspaceLayoutSizeKey = keyof typeof workspaceLayoutSizes;
export type PanelSizeKey = keyof typeof panelSizes;

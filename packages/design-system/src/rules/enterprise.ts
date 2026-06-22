import { spacing } from '../tokens/spacing';
import { panelSizes, workspaceLayoutSizes } from '../tokens/layout';

export const tableRules = {
  rowHeight: { compact: spacing[8], comfortable: spacing[12] },
  headerHeight: spacing[10],
  stickyHeader: true,
  zebraStriping: false,
  borderStyle: 'horizontal',
  selectionColumnWidth: '40px',
  sortIndicatorPosition: 'after-label',
  maxVisibleColumnsBeforeOverflow: 8,
  pagination: { defaultPageSize: 25, pageSizeOptions: [25, 50, 100] },
} as const;

export const filterRules = {
  layout: 'toolbar',
  maxVisibleQuickFilters: 5,
  overflowBehavior: 'more-menu',
  chipRemovable: true,
  applyMode: 'instant',
  savedViewsEnabled: true,
} as const;

export const formRules = {
  labelPosition: 'top',
  requiredIndicator: 'asterisk',
  fieldSpacing: spacing[4],
  sectionSpacing: spacing[8],
  inlineValidation: true,
  errorDisplay: 'below-field',
  destructiveActionConfirmation: true,
} as const;

export const dialogRules = {
  sizes: {
    sm: panelSizes.modalSm,
    md: panelSizes.modalMd,
    lg: panelSizes.modalLg,
    xl: panelSizes.modalXl,
  },
  closeOnOverlayClick: true,
  closeOnEscape: true,
  focusFirstField: true,
  maxStackDepth: 2,
} as const;

export const drawerRules = {
  position: 'right',
  sizes: { sm: panelSizes.drawerSm, md: panelSizes.drawerMd, lg: panelSizes.drawerLg },
  closeOnOverlayClick: true,
  closeOnEscape: true,
  persistOnNavigation: false,
} as const;

export const bulkActionRules = {
  triggerThreshold: 1,
  stickyToolbarPosition: 'bottom',
  maxBatchSize: 500,
  confirmDestructiveAbove: 10,
} as const;

export const analyticsDashboardRules = {
  gridColumns: 12,
  widgetMinHeight: '240px',
  defaultRefreshIntervalSeconds: 60,
  chartColorSequence: ['primary', 'info', 'success', 'warning', 'danger', 'secondary', 'accent', 'neutral'],
} as const;

export const inboxLayoutRules = {
  panes: ['list', 'thread', 'context'],
  listPaneWidth: workspaceLayoutSizes.listPane,
  detailPaneMinWidth: workspaceLayoutSizes.detailPaneMin,
  contextPanelWidth: workspaceLayoutSizes.contextPanel,
  collapsibleContextPanel: true,
  unreadIndicatorStyle: 'dot',
  densityDefault: 'comfortable',
} as const;

export const knowledgeViewRules = {
  layout: 'two-pane',
  searchPosition: 'top',
  showSourceConfidence: true,
  chunkPreviewLines: 3,
} as const;

export const workflowBuilderRules = {
  canvasGridPx: 16,
  nodeMinWidth: '220px',
  nodeMinHeight: '72px',
  connectorStyle: 'bezier',
  zoomRange: [0.25, 2] as [number, number],
  autoLayoutDirection: 'horizontal',
} as const;

export const enterpriseRules = {
  tables: tableRules,
  filters: filterRules,
  forms: formRules,
  dialogs: dialogRules,
  drawers: drawerRules,
  bulkActions: bulkActionRules,
  analyticsDashboards: analyticsDashboardRules,
  inboxLayouts: inboxLayoutRules,
  knowledgeViews: knowledgeViewRules,
  workflowBuilders: workflowBuilderRules,
} as const;

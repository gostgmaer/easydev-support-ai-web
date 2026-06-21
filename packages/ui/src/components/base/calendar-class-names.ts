export const calendarClassNames = {
  root: 'p-3',
  months: 'flex gap-4',
  month: 'space-y-3',
  month_caption: 'flex items-center justify-center px-8 text-sm font-medium text-foreground',
  caption_label: 'text-sm font-medium',
  nav: 'flex items-center justify-between absolute inset-x-1 top-3',
  button_previous:
    'h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50',
  button_next:
    'h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50',
  month_grid: 'w-full border-collapse',
  weekdays: 'flex',
  weekday: 'w-9 text-center text-xs font-medium text-muted-foreground',
  week: 'flex w-full mt-1',
  day: 'h-9 w-9 text-center text-sm p-0 relative',
  day_button:
    'h-9 w-9 rounded-md text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  range_start: '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:rounded-l-md',
  range_end: '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:rounded-r-md',
  range_middle: '[&>button]:bg-primary/15 [&>button]:rounded-none',
  selected: '[&>button]:bg-primary [&>button]:text-primary-foreground',
  today: '[&>button]:border [&>button]:border-primary',
  outside: 'text-muted-foreground opacity-50',
  disabled: 'text-muted-foreground opacity-30',
  hidden: 'invisible',
};

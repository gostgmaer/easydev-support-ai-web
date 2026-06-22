import * as React from 'react';
import { Bookmark, Plus, Trash2, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../base/Dropdown';
import { Button } from '../base/Button';
import type { SavedView } from '../../types/table';

export interface SavedViewsProps {
  views: SavedView[];
  activeViewId?: string;
  onSelect: (view: SavedView) => void;
  onSaveAs: () => void;
  onDelete?: (view: SavedView) => void;
}

export function SavedViews({ views, activeViewId, onSelect, onSaveAs, onDelete }: SavedViewsProps) {
  const activeView = views.find((view) => view.id === activeViewId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" leadingIcon={<Bookmark className="h-4 w-4" />}>
          {activeView?.name ?? 'All views'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Saved views</DropdownMenuLabel>
        {views.map((view) => (
          <DropdownMenuItem key={view.id} onSelect={() => onSelect(view)} className="justify-between">
            <span className="flex items-center gap-2">
              {view.name}
              {view.isShared && <Users className="h-3.5 w-3.5 text-muted-foreground" aria-label="Shared view" />}
            </span>
            {onDelete && !view.isDefault && (
              <button
                type="button"
                aria-label={`Delete ${view.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(view);
                }}
                className="text-muted-foreground hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSaveAs}>
          <Plus className="h-4 w-4" />
          Save current as new view
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

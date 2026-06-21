import * as React from 'react';
import { Plug } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../layout/Card';
import { Button } from '../base/Button';
import { ConnectorHealthIndicator } from './ConnectorHealthIndicator';
import type { ConnectorSummary } from '../../types/connector';

export interface ConnectorCardProps {
  connector: ConnectorSummary;
  onInstall: () => void;
  onConfigure: () => void;
}

export function ConnectorCard({ connector, onInstall, onConfigure }: ConnectorCardProps) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-3">
          {connector.iconUrl ? (
            <img src={connector.iconUrl} alt={connector.name} className="h-9 w-9 rounded-md object-contain" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Plug className="h-4 w-4" />
            </span>
          )}
          <div>
            <p className="text-sm font-semibold text-foreground">{connector.name}</p>
            <p className="text-xs text-muted-foreground">{connector.category}</p>
          </div>
        </div>
        {connector.description && <p className="text-xs text-muted-foreground">{connector.description}</p>}
        {connector.isInstalled && <ConnectorHealthIndicator health={connector.health} />}
      </CardContent>
      <CardFooter>
        {connector.isInstalled ? (
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={onConfigure}>
            Configure
          </Button>
        ) : (
          <Button type="button" size="sm" className="w-full" onClick={onInstall}>
            Install
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

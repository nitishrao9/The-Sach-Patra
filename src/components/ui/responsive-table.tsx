import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface ResponsiveTableColumn<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (item: T, value: any) => React.ReactNode;
  mobileRender?: (item: T, value: any) => React.ReactNode;
  hideOnMobile?: boolean;
  sortable?: boolean;
}

export interface ResponsiveTableAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  className?: string;
  hideOnMobile?: boolean;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: ResponsiveTableColumn<T>[];
  actions?: ResponsiveTableAction<T>[];
  keyExtractor: (item: T) => string | number;
  emptyState?: {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
  };
  className?: string;
  cardClassName?: string;
  mobileCardRender?: (item: T, actions?: ResponsiveTableAction<T>[]) => React.ReactNode;
}

function ResponsiveTable<T>({
  data,
  columns,
  actions = [],
  keyExtractor,
  emptyState,
  className,
  cardClassName,
  mobileCardRender
}: ResponsiveTableProps<T>) {
  const getValue = (item: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], item as any);
    }
    return item[key as keyof T];
  };

  const renderEmptyState = () => {
    if (!emptyState) return null;
    
    const Icon = emptyState.icon;
    
    return (
      <div className="text-center py-12">
        {Icon && <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        <p className="text-gray-500 text-lg mb-2">{emptyState.title}</p>
        {emptyState.description && (
          <p className="text-sm text-gray-400">{emptyState.description}</p>
        )}
      </div>
    );
  };

  const renderDesktopTable = () => (
    <div className="hidden md:block">
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            {actions.length > 0 && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)}>
                {renderEmptyState()}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={keyExtractor(item)}>
                {columns.map((column) => {
                  const value = getValue(item, column.key);
                  return (
                    <TableCell key={String(column.key)} className={column.className}>
                      {column.render ? column.render(item, value) : value}
                    </TableCell>
                  );
                })}
                {actions.length > 0 && (
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {actions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                          <Button
                            key={index}
                            variant={action.variant || 'ghost'}
                            size="sm"
                            onClick={() => action.onClick(item)}
                            className={cn('touch-target', action.className)}
                            title={action.label}
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                            {!Icon && action.label}
                          </Button>
                        );
                      })}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderMobileCards = () => (
    <div className="md:hidden space-y-4">
      {data.length === 0 ? (
        renderEmptyState()
      ) : (
        data.map((item) => {
          if (mobileCardRender) {
            return (
              <Card key={keyExtractor(item)} className={cn('p-4 hover:shadow-md transition-shadow', cardClassName)}>
                {mobileCardRender(item, actions)}
              </Card>
            );
          }

          return (
            <Card key={keyExtractor(item)} className={cn('p-4 hover:shadow-md transition-shadow', cardClassName)}>
              <div className="space-y-3">
                {columns
                  .filter(column => !column.hideOnMobile)
                  .map((column) => {
                    const value = getValue(item, column.key);
                    const content = column.mobileRender 
                      ? column.mobileRender(item, value)
                      : column.render 
                        ? column.render(item, value)
                        : value;

                    return (
                      <div key={String(column.key)} className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500 min-w-0 flex-shrink-0 mr-3">
                          {column.header}:
                        </span>
                        <div className="text-sm text-gray-900 min-w-0 flex-1 text-right">
                          {content}
                        </div>
                      </div>
                    );
                  })}
                
                {actions.length > 0 && (
                  <div className="flex space-x-2 pt-3 border-t">
                    {actions
                      .filter(action => !action.hideOnMobile)
                      .map((action, index) => {
                        const Icon = action.icon;
                        return (
                          <Button
                            key={index}
                            variant={action.variant || 'outline'}
                            size="sm"
                            onClick={() => action.onClick(item)}
                            className={cn('flex-1 touch-target', action.className)}
                          >
                            {Icon && <Icon className="h-4 w-4 mr-2" />}
                            {action.label}
                          </Button>
                        );
                      })}
                  </div>
                )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <div>
      {renderDesktopTable()}
      {renderMobileCards()}
    </div>
  );
}

export default ResponsiveTable;

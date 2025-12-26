'use client';

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileText, Sheet, File } from 'lucide-react';

export type ExportFormat = 'pdf' | 'excel' | 'csv';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => Promise<void> | void;
  formats?: ExportFormat[];
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

/**
 * Export Button Component
 * Provides dropdown menu with PDF, Excel, and CSV export options
 */
export function ExportButton({
  onExport,
  formats = ['pdf', 'excel', 'csv'],
  className = '',
  disabled = false,
  isLoading = false,
}: ExportButtonProps) {
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setLoadingFormat(format);
    try {
      await onExport(format);
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
    } finally {
      setLoadingFormat(null);
    }
  };

  const formatConfig = {
    pdf: {
      label: 'PDF',
      icon: FileText,
      color: 'text-red-500',
    },
    excel: {
      label: 'Excel',
      icon: Sheet,
      color: 'text-green-500',
    },
    csv: {
      label: 'CSV',
      icon: File,
      color: 'text-blue-500',
    },
  };

  const visibleFormats = formats.filter((f) => f in formatConfig);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isLoading}
          className={className}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export As</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {visibleFormats.map((format) => {
          const config = formatConfig[format];
          const Icon = config.icon;
          const isLoading = loadingFormat === format;

          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              <Icon className={`mr-2 h-4 w-4 ${config.color}`} />
              <span>{config.label}</span>
              {isLoading && <span className="ml-auto text-xs">...</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportButton;

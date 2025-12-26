import { Button } from '@ui/components/Button';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function PaginationControls({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  isLoading = false,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
      <div className="text-sm text-gray-600">
        Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage || isLoading}
          className="h-8 px-3"
        >
          Previous
        </Button>

        <div className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded">
          {page}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isLoading}
          className="h-8 px-3"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

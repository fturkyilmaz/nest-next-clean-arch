'use client';

import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { PaginationMeta } from '@diet/shared/pagination';

/**
 * Pagination Controls Component
 * Displays page numbers and navigation buttons
 */
interface PaginationControlsProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export function PaginationControls({
    meta,
    onPageChange,
    isLoading = false,
}: PaginationControlsProps) {
    const getPageNumbers = () => {
        const pages = [];
        const maxPages = 5; // Show max 5 page numbers
        let start = Math.max(1, meta.page - Math.floor(maxPages / 2));
        let end = Math.min(meta.pages, start + maxPages - 1);

        if (end - start + 1 < maxPages) {
            start = Math.max(1, end - maxPages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(meta.page - 1)}
                disabled={!meta.hasPrev || isLoading}
                className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
            >
                <ChevronLeftIcon className="h-5 w-5" />
            </button>

            {/* Page Numbers */}
            {meta.page > 1 + Math.floor(5 / 2) && (
                <>
                    <button
                        onClick={() => onPageChange(1)}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                        1
                    </button>
                    {meta.page > 2 + Math.floor(5 / 2) && (
                        <span className="text-gray-500">...</span>
                    )}
                </>
            )}

            {pageNumbers.map(pageNum => (
                <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-md border ${
                        pageNum === meta.page
                            ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {pageNum}
                </button>
            ))}

            {meta.page < meta.pages - Math.floor(5 / 2) && (
                <>
                    {meta.page < meta.pages - 1 - Math.floor(5 / 2) && (
                        <span className="text-gray-500">...</span>
                    )}
                    <button
                        onClick={() => onPageChange(meta.pages)}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                        {meta.pages}
                    </button>
                </>
            )}

            {/* Next Button */}
            <button
                onClick={() => onPageChange(meta.page + 1)}
                disabled={!meta.hasNext || isLoading}
                className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
            >
                <ChevronRightIcon className="h-5 w-5" />
            </button>

            {/* Page Info */}
            <div className="text-sm text-gray-600 ml-2">
                Page <span className="font-medium">{meta.page}</span> of{' '}
                <span className="font-medium">{meta.pages}</span>
            </div>
        </div>
    );
}

/**
 * Limit Selector Component
 * Allows user to choose items per page
 */
interface LimitSelectorProps {
    currentLimit: number;
    onLimitChange: (limit: number) => void;
    options?: number[];
}

export function LimitSelector({
    currentLimit,
    onLimitChange,
    options = [10, 20, 50, 100],
}: LimitSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <label htmlFor="limit" className="text-sm font-medium text-gray-700">
                Items per page:
            </label>
            <select
                id="limit"
                value={currentLimit}
                onChange={e => onLimitChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {options.map(option => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

/**
 * Sort Controls Component
 * Allows user to sort by field and direction
 */
interface SortControlsProps {
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    sortableFields: { value: string; label: string }[];
}

export function SortControls({
    sortBy,
    sortOrder,
    onSortChange,
    sortableFields,
}: SortControlsProps) {
    return (
        <div className="flex items-center gap-2">
            <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">
                Sort by:
            </label>
            <select
                id="sortBy"
                value={sortBy || ''}
                onChange={e => onSortChange(e.target.value, sortOrder)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Default</option>
                {sortableFields.map(field => (
                    <option key={field.value} value={field.value}>
                        {field.label}
                    </option>
                ))}
            </select>

            <button
                onClick={() =>
                    onSortChange(
                        sortBy || 'createdAt',
                        sortOrder === 'asc' ? 'desc' : 'asc',
                    )
                }
                className={`px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                    sortOrder === 'asc'
                        ? 'bg-blue-50 text-blue-600 border-blue-300'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title={`Current order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
                {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
            </button>
        </div>
    );
}

/**
 * Search Input Component
 * For paginated list search
 */
interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isLoading?: boolean;
}

export function SearchInput({
    value,
    onChange,
    placeholder = 'Search...',
    isLoading = false,
}: SearchInputProps) {
    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
            {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
            )}
        </div>
    );
}

/**
 * Pagination Toolbar Component
 * Combines search, sort, limit, and pagination controls
 */
interface PaginationToolbarProps {
    meta: PaginationMeta;
    searchValue: string;
    onSearchChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    sortableFields: { value: string; label: string }[];
    isLoading?: boolean;
}

export function PaginationToolbar({
    meta,
    searchValue,
    onSearchChange,
    onPageChange,
    onLimitChange,
    sortBy,
    sortOrder,
    onSortChange,
    sortableFields,
    isLoading = false,
}: PaginationToolbarProps) {
    return (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {/* Search */}
            <SearchInput
                value={searchValue}
                onChange={onSearchChange}
                isLoading={isLoading}
            />

            {/* Controls Row */}
            <div className="flex flex-wrap gap-4 items-end">
                <SortControls
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={onSortChange}
                    sortableFields={sortableFields}
                />
                <LimitSelector
                    currentLimit={meta.limit}
                    onLimitChange={onLimitChange}
                />
            </div>

            {/* Results Info */}
            <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span> to{' '}
                <span className="font-medium">
                    {Math.min(meta.page * meta.limit, meta.total)}
                </span>{' '}
                of <span className="font-medium">{meta.total}</span> results
            </div>

            {/* Pagination Controls */}
            <PaginationControls
                meta={meta}
                onPageChange={onPageChange}
                isLoading={isLoading}
            />
        </div>
    );
}

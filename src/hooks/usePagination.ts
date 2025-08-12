/**
 * Pagination hooks for Shopify data
 */

import { useState, useMemo } from "react";

export interface PaginationOptions {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startIndex: number;
    endIndex: number;
  };
}

/**
 * Hook for client-side pagination
 */
export function usePagination<T>(
  items: T[],
  initialPageSize: number = 25
): PaginationResult<T> & {
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  currentPage: number;
  pageSize: number;
} {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginationResult = useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        pageSize,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        startIndex: startIndex + 1, // 1-based indexing for display
        endIndex,
      },
    };
  }, [items, currentPage, pageSize]);

  return {
    ...paginationResult,
    setCurrentPage,
    setPageSize,
    currentPage,
    pageSize,
  };
}

/**
 * Hook for server-side pagination (for API calls)
 */
export function useServerPagination(
  initialPage: number = 1,
  initialPageSize: number = 25
) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const resetPagination = () => {
    setCurrentPage(1);
    setPageSize(initialPageSize);
  };

  return {
    currentPage,
    pageSize,
    goToPage,
    changePageSize,
    resetPagination,
    setCurrentPage,
    setPageSize,
  };
}

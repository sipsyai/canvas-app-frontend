/**
 * useTableState Hook
 *
 * Manages table state (pagination, sorting, filtering)
 */

import { useState } from 'react';

interface TableStateConfig {
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useTableState = (config: TableStateConfig = {}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.pageSize ?? 50);
  const [sortBy, setSortBy] = useState(config.sortBy ?? 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(config.sortOrder ?? 'desc');
  const [searchQuery, setSearchQuery] = useState('');

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    searchQuery,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    setSearchQuery,
  };
};

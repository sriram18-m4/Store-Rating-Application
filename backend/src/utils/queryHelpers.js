const normalizePagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset
  };
};

const buildSort = (sortBy, sortOrder, allowedColumns, defaultKey) => {
  const selectedColumn = allowedColumns[sortBy] || allowedColumns[defaultKey];
  const selectedOrder = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  return `${selectedColumn} ${selectedOrder}`;
};

const addIlikeFilter = (conditions, params, column, value) => {
  if (!value) {
    return;
  }

  params.push(`%${value}%`);
  conditions.push(`${column} ILIKE $${params.length}`);
};

module.exports = {
  normalizePagination,
  buildSort,
  addIlikeFilter
};

export const paginate = async (query, dataFn) => {
  let { page = 1, limit = 20 } = query;

  // Sanitize inputs
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const offset = (page - 1) * limit;
  const data = await dataFn(limit, offset);
  const total = data.length > 0 ? data[0].total : 0;
  const totalPages = Math.ceil(total / limit);
  const hasMore = page * limit < total;
 console.log(data[0].total+"dddddddddddddddddddddddddddddddd");
  // Remove `total` field from each item
  const cleanedData = data.map(({ total, ...rest }) => rest);

  return {
    data: cleanedData,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasMore,
    },
  };
};

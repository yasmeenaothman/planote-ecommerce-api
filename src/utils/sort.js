export const getOrderBy = (sort) => {
  if (!sort) return "created_at DESC";
  switch (sort.toLowerCase()) {
    case "higestprice":
      return "price DESC";
    case "lowestprice":
      return "price ASC";
    default:
      return "created_at DESC";
  }
};

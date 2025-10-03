export const successResponse = (
  res,
  status = 200,
  message = "Success",
  data = {}
) => {
  return res.status(status).json({
    success: true,
    statusCode: status,
    message,
    data,
    errors: [],
  });
};

export const errorResponse = (
  res,
  status = 500,
  message = "Something went wrong",
  errors = []
) => {
  return res.status(status).json({
    success: false,
    statusCode: status,
    message,
    data: {},
    errors,
  });
};

// Pagination implemented through middleware
function paginate(defaultLimit = 10, maxLimit = 100) {
  return (req, res, next) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || defaultLimit;

    if (page < 1) page = 1;
    if (limit < 1) limit = defaultLimit;
    if (limit > maxLimit) limit = maxLimit;

    req.pagination = {
      page,
      limit,
      offset: (page - 1) * limit,
    };

    next();
  };
}

module.exports = paginate;

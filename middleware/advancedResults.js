const advancedResults =
  (model, ...populate) =>
  async (req, res, next) => {
    let query;
    // Copy req.query
    const reqQuery = { ...req.query };
    // Remove keyword such as 'select', 'sort',etc from reqQuery
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((param) => delete reqQuery[param]);

    const queryString = JSON.stringify(reqQuery);
    const replaceString = queryString.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
    query = model.find(JSON.parse(replaceString));
    if (populate) {
      query = query.populate(populate);
    }

    // Select fields
    // https://mongoosejs.com/docs/api/query.html#query_Query-select
    if (req.query.select) {
      const selectString = req.query.select.split(',').join(' ');
      query = query.select(selectString);
    }

    // Sort by field
    // https://mongoosejs.com/docs/api/query.html#query_Query-sort
    if (req.query.sort) {
      const sortString = req.query.sort.split(',').join(' ');
      query = query.sort(sortString);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    // https://mongoosejs.com/docs/api/query.html#query_Query-skip
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
    query = query.skip(startIndex).limit(limit);

    const results = await query;
    const pagination = {};
    console.log(endIndex);
    console.log(total);
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results,
    };
    next();
  };
module.exports = advancedResults;

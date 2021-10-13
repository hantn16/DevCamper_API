const express = require('express');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const {
  getReviews,
  getReview,
  createReview,
} = require('../controllers/reviews');
const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getReviews
  )
  .post(protect, authorize('admin', 'user'), createReview);
router.route('/:id').get(getReview);
//   .put(protect, updateCourse)
//   .delete(protect, deleteCourse);

module.exports = router;

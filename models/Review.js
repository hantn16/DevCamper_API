const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
  title: {
    type: String,
    trim: true,
    maxlength: 100,
    required: [true, 'Please add a review title'],
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add rating star between 1 and 10'],
  },
  bootcamp: {
    type: Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent user from submitting more than one review per bootcamp
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get avg of rating
reviewSchema.statics.getAverageRating = async function (bootcampId) {
  // console.log(`Calculating average rating of bootcamp with id of ${bootcampId}`);
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
  ]).group({
    _id: '$bootcamp',
    averageRating: { $avg: '$rating' },
  });
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', { document: true, query: false }, function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating after findOneAndUpdate
reviewSchema.post('findOneAndUpdate', async function () {
  const doc = await this.model.findOne(this.getQuery());
  this.model.getAverageRating(doc.bootcamp);
});

// Call getAverageRating after remove
reviewSchema.post('remove', { document: true, query: false }, function () {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', reviewSchema);

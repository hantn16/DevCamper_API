const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please add description of the course'],
  },
  weeks: {
    type: Number,
    required: [true, 'Please add the number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add tuition cost of the course'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarhipsAvailable: {
    type: Boolean,
    default: false,
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

// Static method to get avg of course tuition
courseSchema.statics.getAverageCost = async function (bootcampId) {
  // console.log(`Calculating average cost of bootcamp with id of ${bootcampId}`);
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
  ]).group({
    _id: '$bootcamp',
    averageCost: { $avg: '$tuition' },
  });
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost),
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
courseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});
// Call getAverageRating after findOneAndUpdate
courseSchema.post('findOneAndUpdate', async function () {
  const course = await this.model.findOne(this.getQuery());
  this.model.getAverageRating(course.bootcamp);
});
// Call getAverageCost after remove
courseSchema.post('remove', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', courseSchema);

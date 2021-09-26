const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const Bootcamp = require('./models/Bootcamp');

// Connect database
mongoose.connect(process.env.MONGO_URI);

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

// Import to database
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    console.log('Data has been imported'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Destroy database
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    console.log('Data has been deleted'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}

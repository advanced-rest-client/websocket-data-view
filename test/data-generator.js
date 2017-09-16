/* global chance */
const DataGenerator = {};
var LAST_TIME = Date.now();

DataGenerator.genMessageObject = function() {
  LAST_TIME -= chance.integer({min: 1.8e+6, max: 8.64e+7});
  var result = {
    message: chance.paragraph(),
    time: LAST_TIME,
    direction: chance.bool() ? 'in' : 'out',
    isBinary: chance.bool({likelihood: 15})
  };
  if (result.isBinary) {
    result.message = new Blob([result.message], {type: 'text/plain'});
  }
  return result;
};

DataGenerator.generateData = function(size) {
  size = size || 25;
  var result = [];
  for (var i = 0; i < size; i++) {
    result.push(DataGenerator.genMessageObject());
  }
  return result;
};

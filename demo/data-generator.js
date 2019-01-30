/* global chance */
const DataGenerator = {};
let LAST_TIME = Date.now();

DataGenerator.genMessageObject = function() {
  LAST_TIME -= chance.integer({min: 1.8e+6, max: 8.64e+7});
  const isBinary = chance.bool({likelihood: 15});
  const data = chance.paragraph();
  const message = isBinary ? new Blob([data], {type: 'text/plain'}) : data;
  const result = {
    time: LAST_TIME,
    direction: chance.bool() ? 'in' : 'out',
    message,
    isBinary
  };
  return result;
};

DataGenerator.generateData = function(size) {
  size = size || 25;
  const result = [];
  for (let i = 0; i < size; i++) {
    result.push(DataGenerator.genMessageObject());
  }
  return result;
};

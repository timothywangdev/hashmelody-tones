export const randomIntBetween = (min, max) => window.random.random_int(min, max);

export const isNumeric = (value) => !isNaN(value - parseFloat(value));

export const randomFromArray = (array) => array[randomIntBetween(0, array.length - 1)];

export const coinToss = () => Math.floor(window.random.random_num(0,1) * 2);

export const shuffleArray = (array) => {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    const index = Math.floor(window.random.random_num(0,1) * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    const temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
};

export const runFunctionUntilCheckPasses = (fn, check, isDone, dispatch, getState) => {
  if (isDone) return;
  const promise = fn();
  return promise.then((data) => runFunctionUntilCheckPasses(fn, check, check(dispatch, getState, data), dispatch));
};

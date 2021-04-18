/**
 * @description Use Fisher-Yates shuffe algorithm to shuffe the array
 * @param {object} array
 * @returns {object} shuffled array
 */
const shuffleArray = (array) => {
    if (!array || typeof array !== 'object' || array.length == 0) return null;
    let currentIndex = array.length, temporyValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        temporyValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporyValue;
    }

    return array;
};

/**
 * @description Sleep for x miliseconds
 * @param {number} miliseconds
 * @returns {promises} void
 */
const sleep = async (miliseconds) => {
    return new Promise((res) => setTimeout(res, miliseconds));
};

/**
 * @description Calculate points based on time
 * @param {number} answeredTime in timestamp
 * @param {number} endedTime in timestamp
 * @returns {number} points gained
 */
const getPoints = (answeredTime, endedTime) => {
    const returnStuff = Math.floor((endedTime - answeredTime) / 1000) || 1;
    if (!returnStuff) return 1;
    return returnStuff;
};

/**
 * @description calc averange number in array of numbers
 * @param {array} array of number
 * @returns {number}
 */

const calcAvg = (array) => {
    return (array.reduce((a, b) => a + b) / array.length).toFixed(2);
};

/**
 * @description Format numbers
 * @param {number}
 * @returns {array}
 */

const fancyNumber = (num) => {
    const pattern = /\B(?=(\d{3})+(?!\d))/g;
    return num.toString().replace(pattern, ',');
};

module.exports = {
    shuffleArray,
    sleep,
    getPoints,
    calcAvg,
    fancyNumber,
};
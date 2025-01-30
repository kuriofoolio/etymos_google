// words to put as pangrams
// MASOCHISM
// mandioca
// BABUSHKA
// chivari syn

// EASTER
// "scudo",
//   "dulia",
//   "narthex",
//   "laetare",
//   'simnel',
//   "fanon",
//   "stoup",
//   "hymnary",
//   "cierge",
//   "versicle",
//   'seraph', 'cherub'

wordList = [
  "hafiz",
  "kenaf",
  "cafila",
  "sakia",
  "rayah",
  "khamsin",
  "kamseen",
  "sakia",
  "kalam",
  "intifadeh",
  "intifadah",
  "sheriat",
  "shariah",
  "minaret",
  "mastaba",
  "burkini",
  "caffila",
  "realgar",
  "sakiyeh",
];
// import cron from 'node-cron';

// const cron = require('node-cron');

const standardConfig = {
  // mainPangram: wordList[wordList.length-1].toUpperCase(),
  // MATATU KONGONI
  mainPangram: "SPORTIF",

  someLetters: "SPORTIF",

  get letters() {
    return getWordLetters(this.mainPangram);
    // return [... (mainPangram)].sort().join("");
    
  }, 

  get bubbleCount() {
    return this.letters.length;
    // return this.mainPangram.length;
  },

  variant: variants.standard,
  minWordLen: 2,
  validationMethod: [standardValidation, centerLetterValidation],
};
const easyConfig = {
  bubbleCount: 10,
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  variant: variants.easy,
  minWordLen: 3,
  validationMethod: [easyValidation],
};

function standardValidation(word) {
  if (word.length < standardConfig.minWordLen) return false;
  return true;
}

function centerLetterValidation(word) {
  if (!word.includes(centerLetter)) return false;
  return true;
}

function easyValidation(word) {
  if (word.length < easyConfig.minWordLen) return false;
  return true;
}

function getWordLetters(word) {
  //remove duplicates, sort the letters, join them into a list

  // returns a set
  return [...new Set(word)].sort().join("");

  // returns a list
  // return [... (word)].sort().join("");
}

function hasUniqueLetters(word) {
  // return new Set(standardConfig.letters).size === standardConfig.letters.length;
  return getWordLetters(word) === [...word].sort().join("");
}

// Function to update mainPangram with the next word in the list
function updateMainPangram() {
  // Get the current date and time
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();
  const currentSecond = currentDate.getSeconds();

  // Check if the current time is 12:00 AM
  if (currentHour === 0 && currentMinute === 0 && currentSecond === 0) {
    // Get the index of the next word
    const currentIndex = wordList.indexOf(standardConfig.mainPangram);
    const nextIndex = (currentIndex + 1) % wordList.length;

    // Update mainPangram with the next word
    standardConfig.mainPangram = wordList[nextIndex].toUpperCase();
    // console.log('mainPangram updated:', standardConfig.mainPangram);
  }
}

// Function to start the interval
function startInterval() {
  // Check every minute
  setInterval(updateMainPangram, 60000); // 60000 milliseconds = 1 minute
}

// Start the interval
// startInterval();

// Schedule the task to run every minute
// cron.schedule('0 0 * * *', updateMainPangram);

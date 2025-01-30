// Access the p tag inside the modal
let modal = document.getElementById("pangramModal");
let pTag = modal.querySelector(".modal-content p");
let gameCaption = document.getElementById("game-caption");

function performRedirect() {
  window.location.replace("https://etymos.netlify.app");
}

function showVictoryMessage() {
  //display final score plus new words learnt
  alert(
    `Good job 🤜🏾🤛🏾!\nYou scored ${pointsScored} out of ${randomWords.length} 🎉\n\nNew words learnt: ${newWordsLearnt}`
  );
}

// Function to show the pangram modal
function showPangramModal(pointsScored, randomWords, newWordsLearnt) {
  // Apply textContent to the p tag
  pTag.textContent = `Good job 🤜🏾🤛🏾!\nYou scored ${pointsScored} out of ${randomWords.length} 🎉\n\nNew words learnt: ${newWordsLearnt}`;

  $("#pangramModal").css("display", "block");
}

// Function to close the pangram modal
function closePangramModal() {
  performRedirect();
  $("#pangramModal").css("display", "none");
}

function provisionAudio(audioFile) {
  // sound effect for when a letter is deleted from the card
  let audio = new Audio(`audio/${audioFile}.mp3`);
  audio.play();
}

// Get the module value from the URL
const dynamicParamKey = "module";
const moduleValue = getParameterByName(dynamicParamKey);

gameCaption.textContent = `Connect with the CSW24 ${moduleValue} 🌍`;

// Construct the URL with the dynamic parameter
let dynamicUrl = "csw24.html?" + dynamicParamKey + "=" + moduleValue;

// variable for quiz count
let quizCount = 5;

// words to use in the quiz
var words = getWordsByCategory(moduleValue);

// lowercase all words
var words = words.map((word) => word.toLowerCase());
// get unique words
var words = [...new Set(words)];

// hold the words that have pictures
let words_with_pictures = [];

const imageContainer = document.getElementById("image-container");
const image = document.getElementById("image");

//a function to get random words from the array above
function getRandomWordsFromArray(arr, count) {
  const shuffledArr = arr.sort(() => 0.5 - Math.random()); // Shuffle the original array
  return shuffledArr.slice(0, count); // Return the first 'count' elements
}

//retrieve random words for the quiz
const randomWords = getRandomWordsFromArray(words, quizCount);
// const randomWords = words.slice(0, words.length);

//element that renders word to be solved
const wordText = document.querySelector(".word");

//element that renders word to be solved
let hintText = document.querySelector(".hint span");

//element that holds user input
let inputField = document.querySelector("input");

inputField.addEventListener("keydown", (event) => {
  // If the key pressed is backspace or delete, play a different sound
  if (event.key === "Backspace" || event.key === "Delete") {
    provisionAudio("delete_letter");
  } else if (event.key === "Enter") {
    checkWord();
  } else {
    provisionAudio("add_letter");
  }
});

//button to shuffle word to be solved
let refreshBtn = document.querySelector(".btn_shuffle_letters");

//button to check answer
let checkBtn = document.querySelector(".check-word");

//element that shows how much time is left
let timeText = document.querySelector(".time b");

//variable that shows the answer
let correctWord,
  //variable that holds the timer functionality
  timer,
  //variable that holds the index of the current word from randomWords
  current_index = -1;

//variable that holds correct words scored by the player; each correct answer = 1 point
let pointsScored = randomWords.length;

// variable that holds failed questions; failed question= new word
const newWordsLearnt = [];

//function that sets the time for each question
const initTimer = (maxTime) => {
  clearInterval(timer);
  timer = setInterval(() => {
    if (maxTime > 0) {
      maxTime--;
      return (timeText.textContent = maxTime);
    }
    clearInterval(timer);
    alert(`Time up!\n${correctWord.toUpperCase()} is the answer`);
    imageContainer.style.display = "none";

    //add each failed question as a new word
    newWordsLearnt.push(randomWords[current_index]);
    pointsScored--;
    initGame();
  }, 1000);
};

//function that starts the game
const initGame = () => {
  current_index++;
  if (current_index === randomWords.length) {
    //capitalize each word in newWordsLearnt
    for (let index = 0; index < newWordsLearnt.length; index++) {
      newWordsLearnt[index] = newWordsLearnt[index].toUpperCase();
    }

    provisionAudio("victory");
    showPangramModal(pointsScored, randomWords, newWordsLearnt);
  }
  initTimer(15);

  //variable that holds the current word from randomWords
  let randomObj = randomWords[current_index];

  //variable that holds individual letters of randomObj
  let wordArray = randomObj.split("");

  //shuffle the letters to make it hard for player to guess
  for (let i = wordArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
  }

  // join the shuffled letters into a word
  wordText.textContent = wordArray.join("");

  //display meaning of randomObj
  hintText.textContent = getWordMeaning(randomObj, moduleValue);

  // defineWord(randomObj).then((definition) => {
  //   hintText.textContent = definition;
  // });

  //call image_generator to show picture as hint
  // imageGenerator(randomObj, imageContainer,image);
  imageGenerator(getWordMeaning(randomObj, moduleValue), imageContainer, image);

  //variable that checks against user input
  correctWord = randomObj.toLowerCase();

  //empty the input field when time is null
  inputField.value = "";

  //restrict user input to the length of the the correct word
  inputField.setAttribute("maxlength", correctWord.length);
};

//start the game until all words in randomWords are done
initGame();

//function to check whether user input is correct
const checkWord = () => {
  // get user's input and convert to lowercase
  let userWord = inputField.value.toLowerCase();

  //when there's no user trial
  if (!userWord) return alert("Please enter a word to check");

  //if user input is not correct
  if (userWord !== correctWord) return alert("not correct");
  //if user input is correct
  else {
    alert("correct");
    imageContainer.style.display = "";
  }

  //continue to the next question
  initGame();
};

//function that allows player to shuffle the rack at their leisure
const shuffleRack = (wordArray) => {
  for (let i = wordArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
  }

  // join the shuffled letters into a word
  wordText.textContent = wordArray.join("");
};

// Pass the current rack as an array to the shuffleRack function
refreshBtn.addEventListener("click", () => {
  provisionAudio("shuffle_bubbles");
  shuffleRack([...wordText.textContent]);
});

//call checkWord when checkBtn is clicked
checkBtn.addEventListener("click", checkWord);

// function to create dynamic url
function createDynamicUrl() {
  // Get the current URL
  let currentUrl = window.location.href;

  // Set the dynamic parameter key and value
  let dynamicParamKey = "module";

  // Check if the URL already contains query parameters
  let urlSeparator = currentUrl.includes("?") ? "&" : "?";

  // Construct the URL with the dynamic parameter
  let dynamicUrl =
    currentUrl + urlSeparator + dynamicParamKey + "=" + moduleValue;

  // Set the content attribute of the meta tag to the dynamic URL
  document.getElementById("og-url").setAttribute("content", dynamicUrl);
}

function customAlert() {
  alert("Copied to clipboard. Eid Mubarak 🙏🏾");
}

$(".close").on("click", (e) => {
  closePangramModal();
});

$(".btn-share").on("click", async (e) => {
  // Define an object to hold word-definition pairs
  const wordPair = {};

  const gameLink = window.location.href;

  if (newWordsLearnt.length === 0) {
    alert(`Play with me at ${gameLink} 👾`);
    return;
  }

  // Loop through each found word and fetch its definition
  for (const word of newWordsLearnt) {
    // Fetch the definition
    const definition = await getFullDefinition(word);
    // Add the word-definition pair to wordPair
    wordPair[word] = definition;
  }

  // Create the message string by concatenating all word-definition pairs
  let message = "";
  for (const word in wordPair) {
    message += `${word}: ${wordPair[word]}\n\n`;
  }

  // Create a textarea element to copy the message
  const textarea = document.createElement("textarea");
  textarea.value = `I've learnt these words from Etymos 🥳:\n\n${message}\nLog in to beat me ⬇️\n${gameLink}`;

  // Append the textarea to the document
  document.body.appendChild(textarea);

  // Select the text in the textarea
  textarea.select();
  textarea.setSelectionRange(0, 99999); // For mobile devices

  // Copy the text to the clipboard
  // Use the Clipboard API to copy the message to the clipboard
  navigator.clipboard
    .writeText(textarea.value)
    .then(() => {
      console.log("Text copied to clipboard");
      alert("Copied to clipboard. Happy Learning 🚀");
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });

  // Remove the textarea and bubble container from the document
  document.body.removeChild(textarea);
});

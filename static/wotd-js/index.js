let gameLink = "https://etymos.netlify.app/games";

// array that holds random letters
let randomLetterArr = [];

// word in the assembly line
let LALWord = "";

// variable for the center letter
let centerLetter = "";

// config variable
let config = {};
let mainPangram = "";

let foundWords = [];

function startup() {
  //specify game mode
  config = standardConfig;

  // main pangram variable
  mainPangram = config.mainPangram;
}

// this function populates randomLetterArr with random letters
function populateRandomLetterArr() {
  // get a new array of length of config.bubbleCount
  randomLetterArr = [];

  for (let index = 0; index < config.bubbleCount; index++) {
    let randomLetter = getRandomLetter();

    // if the letter being pushed is in the array, get another letter
    // and if randomLetterArr still has space, add more letters

    // && randomLetterArr.length<config.letters.length
    while (randomLetterArr.includes(randomLetter)) {
      randomLetter = getRandomLetter();
    }

    // else put the letter
    randomLetterArr.push(randomLetter);
  }

  // keeping track of center letter in standard mode
  if (config.variant == variants.standard) {
    centerLetter = randomLetterArr[getMiddleBubbleIndex()];
  }
}

// this function gets a random letter
function getRandomLetter() {
  return config.letters[Math.floor(Math.random() * config.letters.length)];
}

// this function creates multiple bubbles
function cloneBubbleTemplate() {
  for (let index = 0; index < config.bubbleCount - 1; index++) {
    $(".bubble").first().clone().appendTo("#BubbleContainer");
  }
}

// this function adds a random letter from randomLetterArr to each bubble
function populateBubblesWithRandomLetters() {
  $(".bubble").each((index, bubble) => {
    // console.log(index,bubble);
    $(bubble).html(randomLetterArr[index]);
  });
}

// this function checks for duplicate letters in randomLetterArr
function hasDuplicateLetter(arr) {
  let tempArray = [];
  for (i = 0; i < arr.length; i++) {
    if (!tempArray.includes(arr[i])) {
      tempArray.push(arr[i]);
    } else {
      return true;
    }
  }
  return false;
}

// this function creates multiple buttons
function cloneButtonTemplate() {
  for (let index = 0; index < 2; index++) {
    $(".btn").first().clone().appendTo(".buttons");
  }
}

function provisionAudio(audioFile) {
  // sound effect for when a letter is deleted from the card
  let audio = new Audio(`audio/${audioFile}.mp3`);
  audio.play();
}

function refreshLAL() {
  $("#LAL").html(LALWord.length === 0 ? "<wbr>" : LALWord);
}

function popLALWord() {
  LALWord = LALWord.slice(0, -1);

  provisionAudio("delete_letter");

  // refresh rack
  refreshLAL();
}

function configGameModeOptions() {
  switch (config.variant) {
    case variants.standard:
      // console.log("standard mode");
      initStandardGame();

      break;
    case variants.easy:
      // console.log("easy mode");
      initEasyGame();

      break;
    default:
      console.log("none found");
      break;
  }
}

function initStandardGame() {
  //  console.log("standard mode");
  //  console.log ($('.bubble')[3])

  // wrap using jquery wrapper
  $($(".bubble")[getMiddleBubbleIndex()])
    .removeClass("bg-primary")
    .addClass("bg-danger");
}

function initEasyGame() {
  console.log("easy mode");
  //  console.log ($('.bubble')[3])

  // wrap using jquery wrapper
  // $($('.bubble')[getMiddleBubbleIndex()]).removeClass('bg-primary').addClass('bg-danger')
}

function getMiddleBubbleIndex() {
  return Math.floor(config.letters.length / 2);
  // return Math.floor(config.bubbleCount / 2);

  // with the line below, center letter is pointing to first letter when game first loads
  // which is wrong

  // return Math.floor($(".bubble").length / 2);
}

function shuffleBubbles() {
  let currentIndex = randomLetterArr.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [randomLetterArr[currentIndex], randomLetterArr[randomIndex]] = [
      randomLetterArr[randomIndex],
      randomLetterArr[currentIndex],
    ];
  }

  // preserves center letter
  if (config.variant == variants.standard) {
    randomLetterArr.swapItems(
      getMiddleBubbleIndex(),
      randomLetterArr.indexOf(centerLetter)
    );
  }

  // return randomLetterArr;

  // updates UI
  populateBubblesWithRandomLetters();
}

// remove the letters in LAL when a new word is coming up
function clearLAL() {
  LALWord = "";
  refreshLAL();
}

function hasMinimumWordLength() {
  return config.validationMethod[0](LALWord);
}

function hasCenterLetter() {
  return config.validationMethod[1](LALWord);
}

async function getDefinitionFromMerriamApi(word) {
  return $.ajax({
    method: "get",
    url: `${merriamApi}/${word}?key=${merriamApiKey}`,
  });

  // .fail((error) => {
  //   console.log(`Error: ${error} `);
  // });
}

async function getDefinitionFromWordnikApi(word) {
  return fetch(`${wordnikApi}/${word.toLowerCase()}/${wordnikParams}`)
    .then((response) => response.json())
    .then((data) => {
      if (data && data[0] && data[0].text) {
        let text = data[0].text;
        return text.replace(/(<([^>]+)>)/gi, "");
      }
    })
    .catch((error) => console.error(error));
}

async function getFullDefinition(word) {
  let merriamDefinition = await getDefinitionFromMerriamApi(word);
  let wordnikDefinition = await getDefinitionFromWordnikApi(word);

  if (wordnikDefinition) {
    return wordnikDefinition;
  } else {
    return merriamDefinition[0].shortdef;
  }

  // return "(Swahili) in Africa, the Government";
}

async function saveWord() {
  // the word has already been found
  if (foundWords.includes(LALWord)) {
    alert(`${LALWord} is already found`);
  }
  //the word hasnt yet been found
  else {
    //check if its a pangram
    if (isPangram(LALWord)) {
      if (isMainPangramFound(LALWord)) {
        provisionAudio("victory");
        showPangramModal();
      } else {
        alert(`You found another pangram: ${LALWord}`);
      }
    }
    foundWords.push(LALWord);
    $(".word-badge")
      .first()
      .clone()
      .appendTo("#SavedWordContainer")
      .html(LALWord);
  }
}

function customAlert() {
  alert("Copied to clipboard. Grow with Etymos 🚀 ");
  // 🚀 🏐 ⚽ 🎾
}

function showMainPangramDefinition() {
  getFullDefinition(mainPangram)
    .then((mainPangramDefinition) => {
      // Now you can update the HTML or perform other actions
      $("#pangram").html(`Hint: ${mainPangramDefinition}`);
    })
    .catch((error) => {
      console.error("Error fetching pangram definition:", error);
    });
}

function isPangram(word) {
  const alphabet = config.letters;
  // const letters = new Set(word.toUpperCase());
  const wordLetters = new Set(word.toUpperCase());
  for (const letter of alphabet) {
    if (!wordLetters.has(letter)) {
      return false;
    }
  }

  return true;
}

function isMainPangramFound(LALWord) {
  // return foundWords.includes(mainPangram);
  return LALWord === mainPangram;
}

// Function to show the pangram modal
function showPangramModal() {
  // const modal = document.getElementById("pangramModal");
  // modal.style.display = "block";

  $("#pangramModal").css("display", "block");
}

// Function to close the pangram modal
function closePangramModal() {
  $("#pangramModal").css("display", "none");
}

// Function to handle "Find More Words" button click
function shareResults() {
  // Letters of the word of the day
  const lettersOfTheDay = config.letters;

  // Message to be shared
  const message = `${lettersOfTheDay}\n\n"I found today's pangram 🥳\nCan you find it?" ⬇️\n\n${window.location.href}`;

  // Create a container for the bubble buttons
  const bubbleContainer = document.createElement("div");
  bubbleContainer.classList.add("bubble-container");

  // Append the container to the document
  document.body.appendChild(bubbleContainer);

  // Create bubble buttons for each letter
  for (const letter of lettersOfTheDay) {
    const bubbleButton = document.createElement("button");
    bubbleButton.classList.add("bubble-button");
    bubbleButton.textContent = letter;

    // Append the bubble button to the container
    bubbleContainer.appendChild(bubbleButton);
  }

  // Create a textarea element to copy the message
  const textarea = document.createElement("textarea");
  textarea.value = message;

  // Append the textarea to the document
  document.body.appendChild(textarea);
  // bubbleContainer.appendTo(textarea);

  // Select the text in the textarea
  textarea.select();
  textarea.setSelectionRange(0, 99999); // For mobile devices

  // Copy the text to the clipboard
   // Copy the text to the clipboard
  // Use the Clipboard API to copy the message to the clipboard
  navigator.clipboard.writeText(textarea.value)
    .then(() => {
      console.log('Text copied to clipboard');
      customAlert();
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });


  // Remove the textarea and bubble container from the document
  document.body.removeChild(textarea);
  document.body.removeChild(bubbleContainer);

  // Notify the user that the message has been copied
  // customAlert();
}

// function for swapping 2 items
Array.prototype.swapItems = function (a, b) {
  this[a] = this.splice(b, 1, this[a])[0];
  return this;
};

// EVENT LISTENERS
// when the application is ready do the following
//same as document.ready()

function addPlaceholderToLal() {
  $("#LAL").text("Click letters to form word").css({
    color: "#999", // Placeholder text color
    "font-style": "italic", // Placeholder text style
    "font-size": "10dp",
  });
}

$(() => {
  startup();
  showMainPangramDefinition();
  populateRandomLetterArr();
  cloneBubbleTemplate();
  populateBubblesWithRandomLetters();
  configGameModeOptions();
  // provisionAudio("background_arabic");
  addPlaceholderToLal();
});

$("#shareWordList").on("click", async (e) => {
  // Define an object to hold word-definition pairs
  const wordPair = {};

  if (foundWords.length === 0) {
    alert("You haven't found any words yet");
    return;
  }

  // Loop through each found word and fetch its definition
  for (const word of foundWords) {
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
  textarea.value = `I've learnt these words from Etymos:\n${message}\nPlay with me at ${gameLink} 👾`;

  // Append the textarea to the document
  document.body.appendChild(textarea);
  // bubbleContainer.appendTo(textarea);

  // Select the text in the textarea
  textarea.select();
  textarea.setSelectionRange(0, 99999); // For mobile devices

  // Copy the text to the clipboard
  document.execCommand("copy");

  // Remove the textarea and bubble container from the document
  document.body.removeChild(textarea);


  customAlert();
});

$(".close").on("click", (e) => {
  closePangramModal();
});

$(".btn-share").on("click", (e) => {
  shareResults();
});

$(".btn-continue").on("click", (e) => {
  
  customAlert();
  closePangramModal();
});

$("#delete").on("click", (e) => {
  // pop a letter from  LALWord
  // if ($('#LAL').text().trim() === '') {
  //   addPlaceholderToLal();
    
  // } 
  popLALWord();
});

$("#refresh").on("click", (e) => {
  populateRandomLetterArr();
  populateBubblesWithRandomLetters();
  clearLAL();
});

$("#shuffle").on("click", (e) => {
  provisionAudio("shuffle_bubbles");
  shuffleBubbles();
});

$("#submit").on("click", async (e) => {
  if (LALWord.length === 0) {
    alert("Enter a word !");
    clearLAL();
    return;
  } else if (!hasMinimumWordLength(LALWord)) {
    alert("word is too short");
    clearLAL();
    return;
  } else if (!hasCenterLetter(LALWord)) {
    alert("word must contain center letter");
    clearLAL();
    return;
  }

  try {
    // console.log("foo");
    let merriamDefinition = await getDefinitionFromMerriamApi(LALWord);
    let wordnikDefinition = await getDefinitionFromWordnikApi(LALWord);
    // console.log("bar"); //shows  im not waiting for a response from server

    if (merriamDefinition[0].shortdef || wordnikDefinition) {
      saveWord();
    } else {
      // provisionAudio("invalid_word");

      // // Delay showing the alert for a short period to ensure the sound starts playing
      // setTimeout(() => {
      //   alert(`${LALWord} is invalid`);
      // }, 100); // Adjust the delay time as needed (in milliseconds)
      alert(`${LALWord} is invalid`);
    }

    // clear LAL for new word entry
    clearLAL();
  } catch (error) {
    console.log(`Error: ${error}`);
  }
});

// event lives in container, clicking children triggers event
$("#BubbleContainer").on("click", ".bubble", (e) => {
  // pick the letter being clicked
  const letter = $(e.target).html();

  LALWord += letter;

  provisionAudio("add_letter");

  refreshLAL();
});
// Get the module value from the URL
const wordSearched = getParameterByName("q");

// Create the anchor element
const quizLink = document.createElement("a");

// Set the ID and target attributes
quizLink.id = "quiz-link";
quizLink.target = "_blank";

// Set the text content
quizLink.textContent = "Quiz these words";

// Append the link to the desired element (replace 'body' with your desired parent)
document.body.appendChild(quizLink);

// create a p tag to display the words per category
let p = document.createElement("p");
p.textContent = displayWordsRelatedByOrigin(wordSearched);
document.body.appendChild(p);

quizWordsBasedOnWordSearched(wordSearched);

function displayWordsRelatedByOrigin(wordSearched) {
  for (let category in categories) {
    if (categories.hasOwnProperty(category)) {
      // Check if the wordSearched is in the array for the current category
      if (categories[category].includes(wordSearched)) {
        // console.log(`Category: ${category}, Words: ${categories[category]}`);
        return `Category: ${category}, Words: ${categories[category]}`;
      }
    }
  }
}

function quizWordsBasedOnWordSearched(wordSearched) {
  for (let category in categories) {
    if (categories.hasOwnProperty(category)) {
      if (categories[category].includes(wordSearched)) {
        // Construct the query parameter with the found category
        const queryParams = new URLSearchParams({ module: category });
        // Set the href attribute of the quizLink with the constructed URL
        quizLink.href = `game.html?${queryParams.toString()}`;
        // Break out of the loop since we found a match
        break;
      }
    }
  }
}

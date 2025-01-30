const merriamApi = `https://dictionaryapi.com/api/v3/references/collegiate/json`;
const merriamApiKey = "8e15aedf-5851-4fce-9399-de38e8a3399c";

const wordnikApi = `https://api.wordnik.com/v4/word.json`;
const wordnikApiKey = `nh1cb9m4yspcmwq687www9qn7j3ix3dmppv7a0ot4mn0bwr3v`;
const wordnikParams = `definitions?limit=200&partOfSpeech=noun&includeRelated=false&sourceDictionaries=wiktionary&useCanonical=false&includeTags=false&api_key=${wordnikApiKey}`;

const unsplashApiKey = "6N66jNUBwOB5x9U6vVty9q2dCBQ8ujXmXaSqKhyT40U";
const unsplashApi = `https://api.unsplash.com/search/photos?query=`;

const pexelsApiKey = "tQpDfpLRG8sqtiAC3jNwRruItlvPniKNMfexeEL19vIdJZXB9QDw394N";

// Function to get URL parameters by name
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// this function removes markups from a string
function removeMarkups(text) {
  // Remove html tags from a string
  const cleanHtml = /<.*?>/g;
  text = text.replace(cleanHtml, "");

  // Handle the specific format {bc}
  const cleanBc = /\{bc\}/g;
  text = text.replace(cleanBc, "");

  // Handle the specific format {sx|...||}
  const cleanSx = /\{sx\|([^|]+)\|\|\}/g;
  text = text.replace(cleanSx, "$1");

  // Handle the specific format {dx}...{/dx}
  const cleanDx = /\{dx\}.*?\{\/dx\}/g;
  text = text.replace(cleanDx, "");

  // Handle the specific format {it}{/it}
  const cleanIt = /\{it\}(.*?)\{\/it\}/g;
  text = text.replace(cleanIt, "$1");

  return text;
}

//a function that defines a word from Merriam Webster API
async function meaningFromMerriamWebster(wordToSearch) {
  return fetch(`${merriamApi}/${wordToSearch}?key=${merriamApiKey}`)
    .then((response) => response.json())
    .then((data) => {
      // return data[0].shortdef;

      for (let i = 0; i < data.length; i++) {
        const definitions = data[i]["def"];

        for (const d of definitions) {
          const sequences = d["sseq"];

          for (let j = 0; j < sequences.length; j++) {
            const outerSseq = sequences[j];

            for (let k = 0; k < outerSseq.length; k++) {
              const innerSseq = outerSseq[k];

              const meaning = removeMarkups(innerSseq[1]["dt"][0][1]);
              return meaning;
            }
          }
        }
      }
    })
    .catch((error) => console.error(error));
}

//function that defines a word from Wordnik API
async function defineWord(word_to_search) {
  let trimmed_word = word_to_search.toLowerCase().trim();
  return fetch(`${wordnikApi}/${trimmed_word}/${wordnikParams}`)
    .then((response) => response.json())
    .then((data) => {
      if (data && data[0] && data[0].text) {
        let text = data[0].text;
        return text.replace(/(<([^>]+)>)/gi, "");
      } else {
        return meaningFromMerriamWebster(word_to_search);
      }
    })
    .catch((error) => console.error(error));
}

//function that gets audio pronunciation of a word from Wordnik API
async function getWordAudioFromWordnik(word_to_search) {
  let trimmed_word = word_to_search.toLowerCase().trim();
  let wordnikParams = `audio?limit=200&useCanonical=false&includeTags=false&api_key=${wordnikApiKey}`;
  return fetch(`${wordnikApi}/${trimmed_word}/${wordnikParams}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      else{return response.json();}
    })
    .then((data) => {
      if (data[0] && data[0].fileUrl) {
        // return data[0].fileUrl;
        console.log(data[0].fileUrl)
        
      } else {
        throw new Error('No audio file found for the word.');
      }
    })
    .catch((error) => {
      console.error('Error fetching word audio:', error);
      return null; // Or handle the error differently
    });
}

async function defineList(wordList) {
  let wordsWithMeanings = [];
  for (let word of wordList) {
    let definition = await getFullDefinition(word);
    if (typeof definition === "string") {
      wordsWithMeanings.push(word);
      // wordsWithMeanings.push({ word: word, meaning: definition });
    }
  }
  return wordsWithMeanings;
}

// Read a JSON file
function readJson(jsonFileName, callback) {
  fs.readFile(`${jsonFileName}.json`, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      callback(err, null);
    } else {
      try {
        // Parse JSON string to object
        const jsonData = JSON.parse(data);
        callback(null, jsonData);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        callback(parseError, null);
      }
    }
  });
}

//OTHER FUNCTIONS

// this function isnt working for lowercase input
function sentenceCase(str) {
  // Convert the string to lowercase
  let lowerCaseStr = str.toLowerCase().trim();

  // Capitalize the first letter of the string
  let result = lowerCaseStr.charAt(0).toUpperCase() + lowerCaseStr.slice(1);

  // Find periods followed by a space and capitalize the next letter
  result = result.replace(/\. +./g, function (match) {
    return match.toUpperCase();
  });

  return result;
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
}



// this function retrieves images of a word using unsplash api
function imageGenerator(word) {
  //word is The word you want to search for

  const defaultImagePath = "css/images/modules_poster_no_links.png";

  fetch(`${unsplashApi}${word}`, {
    headers: {
      Authorization: `Client-ID ${unsplashApiKey}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.results.length > 0) {
        data.results.forEach((result) => {
          const galleryItem = document.createElement("div");
          galleryItem.className =
            "col-12 col-sm-6 col-md-4 col-lg-3 gallery-item";

          const imageElement = document.createElement("img");
          imageElement.className = "img-fluid";
          imageElement.src = result.urls.regular;

          galleryItem.appendChild(imageElement);
          imageContainer.appendChild(galleryItem);
        });
      } else {
        // If there's no image, set a default image from the file system
        image.src = defaultImagePath;

        // Show the image container with the default image
        imageContainer.style.display = "block";
      }
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
      // If there's an error, set a default image from the file system
      image.src = defaultImagePath; // Replace with your actual file path

      // Show the image container with the default image
      imageContainer.style.display = "block";
    });
}

// this function makes use of unsplash api to only retrieve the image link for a word that will later be assigned  to the source variable
async function imageGenerator(searchWord,imageContainer,image) {
  //searchWord is The word you want to search for
  const defaultImagePath = "../css/images/etymos_no_picture.png";

  fetch(`${unsplashApi}${searchWord}`, {
    headers: {
      Authorization: `Client-ID ${unsplashApiKey}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.results.length > 0) {
        const imageUrl = data.results[0].urls.regular;
        image.src = imageUrl;
        // Show the image container with the default image
        imageContainer.style.display = "block";

        // return imageUrl;
        // return `${searchWord}: ${imageUrl }`;
        // console.log(`${searchWord}: ${imageUrl }`);
      } else {
        
        image.src = defaultImagePath;
      }
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
      return defaultImagePath;
    });
}

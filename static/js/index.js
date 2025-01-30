// elements from index.html
let nameInput = document.querySelector("#name-input");
let nameButton = document.querySelector("#name-button");
let meaningDiv = document.querySelector("#name-meaning");
const imageContainer = document.getElementById("gallery-row");
const searchedWordData = {};
const fileName = "word_data.json";
const appUrl = "https://etymos.netlify.app ";
const soundUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const sound = document.getElementById("sound");
const result = document.getElementById("result");

$("#result").css("display", "none");

nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    retrieveMeaning();
  }
});

// nameButton.addEventListener("click", async function retrieveMeaning  () {
async function retrieveMeaning() {
  const loader = document.getElementById("searchLoader");

  // Validate input
  if (!nameInput.value.trim()) {
    alert("Please enter a search query");
    return;
  }

  // Show loader
  loader.style.display = "block";
  let meaning = await defineWord(nameInput.value);
  imageContainer.innerHTML = "";

  // Check if the meaning is not empty or undefined
  if (meaning) {
    loader.style.display = "none";
    // Set the text content of the wordMeaning div to include the meaning
    meaningDiv.textContent = `Meaning: ${meaning}`;
    searchedWordData.searchedWord = nameInput.value;
    searchedWordData.searchedWordMeaning = meaning;

    createRelatedPagesHyperlink();
    imageGenerator(nameInput.value);
    let imageLink = retrieveImageLink(nameInput.value);
    searchedWordData.searchedWordImage = imageLink;

    fetch(`${soundUrl}${nameInput.value}`)
      .then((response) => response.json())
      .then((data) => {
        // result.innerHTML= `
        //  <button title="btn" onclick="playSound()" >
        //     <i class="fa fa-volume-up" aria-hidden="true"></i>
        //   </button>
        //   `

        // result.body.display= none ;
        $("#result").css("display", "block");
        console.log(data);
        phonetics = data[0].phonetics;
        for (let index = 0; index < phonetics.length; index++) {
          if (phonetics[index].audio === "") {
            continue;
          } else {
            sound.setAttribute("src", `${phonetics[index].audio}`);
            provisionAudio(sound.src);

            break;
          }
        }
      })
      .catch((error) => console.error(error));
  } else {
    loader.style.display = "none";
    // If meaning is empty or undefined, display a message
    meaningDiv.textContent = "Meaning not found.";
  }
}
// });

function provisionAudio(audioFile) {
  let audio = new Audio(audioFile);
  audio.play();
}

function createRelatedPagesHyperlink() {
  //create a hyperlink element
  let relatedPagesHyperlink = document.createElement("a");

  relatedPagesHyperlink.href = "/relatedInfo.html?q=" + nameInput.value; //set the href attribute to the search query

  relatedPagesHyperlink.target = "_blank"; //open in new tab
  relatedPagesHyperlink.textContent = `See related info about ${nameInput.value}`; //set the text content of the hyperlink

  // Create a div to hold the hyperlink
  let hyperlinkDiv = document.createElement("div");
  hyperlinkDiv.appendChild(relatedPagesHyperlink);

  //append hyperlinkDiv to  meaningDiv
  meaningDiv.appendChild(hyperlinkDiv);
}

// this function retrieves images of a word using unsplash api
function imageGenerator(word) {
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
        retrieveImagesFromPexels(word);
      }
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
      // If there's an error, set a default image from the file system
      image.src = defaultImagePath;

      // Show the image container with the default image
      imageContainer.style.display = "block";
    });
}

// this function retrieves images using the pexels api
function retrieveImagesFromPexels(word) {
  const apiKey = pexelsApiKey;

  fetch(`https://api.pexels.com/v1/search?query=${word}`, {
    headers: {
      Authorization: apiKey,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.photos.length > 0) {
        data.photos.forEach((result) => {
          const galleryItem = document.createElement("div");
          galleryItem.className =
            "col-12 col-sm-6 col-md-4 col-lg-3 gallery-item";

          const imageElement = document.createElement("img");
          imageElement.className = "img-fluid";
          imageElement.src = result.src.medium;

          galleryItem.appendChild(imageElement);
          imageContainer.appendChild(galleryItem);
        });
      } else {
        console.log(`image for ${word} not found`);
        // Create a new paragraph element
        const p = document.createElement("p");

        // Set the text content of the paragraph to the desired message
        p.textContent = `Image for ${word} not found`;

        // Get the gallery-row div
        const galleryRow = document.getElementById("gallery-row");

        // Append the paragraph to the gallery-row div
        galleryRow.appendChild(p);
      }
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
    });
}

// Function to show the pangram modal
function showPangramModal() {
  let modalContent = document.querySelector(".modal-content p");
  let pangramModal = document.querySelector("#pangramModal");

  const word = searchedWordData.searchedWord.toUpperCase();
  const meaning = searchedWordData.searchedWordMeaning;
  const imageLink = searchedWordData.searchedWordImage;

  let modalMessage = `
<b>Share this word:</b><br>

WORD OF THE DAY<br>
Word: ${word}<br>
Meaning: ${meaning}<br><br>

Powered by Etymos
`;

  const shareButtonsContainer = document.querySelector(".share-buttons");

  // Access all social media link elements
  const shareLinks = shareButtonsContainer.querySelectorAll("a");

  // Access specific elements using their index in the list (0-based indexing)
  const facebookLink = shareLinks[0];
  const twitterLink = shareLinks[1];
  const linkedInLink = shareLinks[2];
  const whatsAppLink = shareLinks[3];
  const emailLink = shareLinks[4];

  $("#pangramModal").css("display", "block");

  $(".modal-content p").html(modalMessage);

  modalMessage = $(".modal-content p").text();

  facebookLink.onclick = function () {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      appUrl
    )}&quote=${encodeURIComponent(modalMessage)}`;
    window.open(facebookUrl, "_blank");
  };

  twitterLink.onclick = function () {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      appUrl
    )}&text=${encodeURIComponent(modalMessage)}`;
    window.open(twitterUrl, "_blank");
  };

  linkedInLink.onclick = function () {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      appUrl
    )}&title=${encodeURIComponent(modalMessage)}&summary=${encodeURIComponent(
      "Powered by Etymos"
    )} &text=${encodeURIComponent(modalMessage)}`;
    window.open(linkedInUrl, "_blank");
  };

  whatsAppLink.onclick = function () {
    const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      modalMessage
    )}`;

    window.open(whatsAppUrl, "_blank");
  };

  emailLink.onclick = function () {
    const subject = encodeURIComponent("Check out this African Word");
    const body = encodeURIComponent(modalMessage);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

    window.open(mailtoUrl, "_blank");
  };
}

// Function to close the pangram modal
function closePangramModal() {
  $("#pangramModal").css("display", "none");
}

$(".close").on("click", (e) => {
  closePangramModal();
});

$("#shareButton").on("click", (e) => {
  if (nameInput.value === "") {
    alert("Search a word first");
  } else {
    showPangramModal();
  }
});

// the array list below contains info of the words to be featured for different modules
const featuredInfo = [
  {
    word: "Couscous",
    definition:
      "A pasta of North African origin made of crushed and steamed semolina.",
    imageUrl:
      "https://images.unsplash.com/photo-1518744304015-0ce3e2fcbd8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTYzODl8MHwxfHNlYXJjaHwxfHxDb3VzY291c3xlbnwwfHx8fDE3MjM3MjYzOTR8MA&ixlib=rb-4.0.3&q=80&w=1080",
  },
  {
    word: "Dashiki",
    definition: "A loose and brightly colored African shirt.",
    imageUrl:
      "https://images.unsplash.com/photo-1561764981-1925f98905f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTYzODl8MHwxfHNlYXJjaHwxfHxEYXNoaWtpfGVufDB8fHx8MTcyMzcyNjM5NXww&ixlib=rb-4.0.3&q=80&w=1080",
  },

  {
    word: "Franc",
    definition:
      "The currency issued between 1805 and 1808 of Lucca in Tuscany, Italy.",
    imageUrl:
      "https://images.unsplash.com/photo-1527014054578-59ecef09abfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTYzODl8MHwxfHNlYXJjaHwxfHxmcmFuY3xlbnwwfHx8fDE3MjQwMDAwNDV8MA&ixlib=rb-4.0.3&q=80&w=1080",
  },

  {
    word: "Fynbos",
    definition:
      "Vegetation unique to the Cape Floral Kingdom made up chiefly of proteaceae, restios and Ericaceae.",
    imageUrl:
      "https://images.unsplash.com/photo-1607664675739-40ba5b75982d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTYzODl8MHwxfHNlYXJjaHwxfHxGeW5ib3N8ZW58MHx8fHwxNzIzNzI2Mzk2fDA&ixlib=rb-4.0.3&q=80&w=1080",
  },

  {
    word: "Indri",
    definition: "One of the largest living lemurs (Indri indri).",
    imageUrl:
      "https://images.unsplash.com/photo-1591824579767-0d4f02b45a36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTYzODl8MHwxfHNlYXJjaHwxfHxJbmRyaXxlbnwwfHx8fDE3MjM3MjYzOTZ8MA&ixlib=rb-4.0.3&q=80&w=1080",
  },

  {
    word: "Uhuru",
    definition: "freedom",
    imageUrl:
      "https://images.unsplash.com/photo-1621414050946-1b936a78491f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTYzODl8MHwxfHNlYXJjaHwxfHx1aHVydXxlbnwwfHx8fDE3MjQwMDA4NTN8MA&ixlib=rb-4.0.3&q=80&w=1080",
  },
];

// this function assigns respective info to each part of the word grid
function assignWordGridInfo(featuredInfo) {
  // reference the word grid
  const wordGridItems = document.querySelectorAll(".col-12.col-sm-6.col-lg-4");

  // iterate through the word grid and pick each item
  for (const item of wordGridItems) {
    const imageContainer = item.querySelector(".card-img-container");
    const wordContainer = item.querySelector(".card-body");
    const image = imageContainer.querySelector("img");
    const wordTitle = wordContainer.querySelector(".card-title");
    const wordText = wordContainer.querySelector(".card-text");

    // check if the word in the DOM exists in the array list
    const foundInfo = featuredInfo.find(
      (info) => info.word === wordTitle.textContent
    );

    // assign the respective info if it exists
    if (foundInfo) {
      wordText.textContent = foundInfo.definition;

      // handle words without appropriate images
      if (foundInfo.imageUrl) {
        image.src = foundInfo.imageUrl;
      } else {
        image.src = "css/images/etymos_no_picture.png";
      }
    }

    //handle non existence of featured info
    else {
      console.warn(`Definition not found for: ${wordTitle.textContent}`);
    }

    console.log(`${wordTitle.textContent}: ${wordText.textContent}\n`);
  }
}
// call the function
assignWordGridInfo(featuredInfo);

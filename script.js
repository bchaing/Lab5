// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
let text_top;
let text_bottom;

const synth = window.speechSynthesis;
const voices = synth.getVoices();
let utterance;

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener("load", () => {
  // get canvas context
  const canvas = document.getElementById("user-image");
  const ctx = canvas.getContext("2d");

  // clear canvas context
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // toggle buttons
  document.querySelector("button[type='submit']").disabled = false;
  document.querySelector("button[type='reset']").disabled = true;
  document.querySelector("button[type='button']").disabled = true;
  document.getElementById("voice-selection").disabled = true;

  // fill canvas black
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw image
  const imgDimm = 
    getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, imgDimm.startX, imgDimm.startY, imgDimm.width, imgDimm.height);

  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

const image_input = document.getElementById("image-input");
image_input.addEventListener("change", (event) => {
  img.src = URL.createObjectURL(image_input.files[0]); // load selected image
  img.alt = event.target.value.replace("C:\\fakepath\\", ""); // set alt text of image
});

const form_input = document.getElementById("generate-meme");
form_input.addEventListener("submit", (event) => {
  // grab text from inputs
  text_top = document.getElementById("text-top").value;
  text_bottom = document.getElementById("text-bottom").value;

  // get canvas
  const canvas = document.getElementById("user-image");
  const ctx = canvas.getContext("2d");

  // style for text
  ctx.font = "50px Impact";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  // add text to canvas
  ctx.fillText(text_top, canvas.width / 2, canvas.height * 0.13);
  ctx.fillText(text_bottom, canvas.width / 2, canvas.height * 0.95);

  // add stroke to text
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  ctx.strokeText(text_top, canvas.width / 2, canvas.width * 0.13);
  ctx.strokeText(text_bottom, canvas.width / 2, canvas.height * 0.95);

  // toggle buttons
  document.querySelector("button[type='submit']").disabled = true;
  document.querySelector("button[type='reset']").disabled = false;
  document.querySelector("button[type='button']").disabled = false;
  document.getElementById("voice-selection").disabled = false;

  // create utterance
  utterance = new SpeechSynthesisUtterance(`${text_top} ${text_bottom}`);

  // prevent refresh on form submit
  event.preventDefault();
});

const clear_btn = document.querySelector("button[type='reset']");
clear_btn.addEventListener("click", () => {
  // get canvas
  const canvas = document.getElementById("user-image");
  const ctx = canvas.getContext("2d");

  // clear canvas context
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // clear text fields
  text_top = "";
  text_bottom = "";

  // toggle buttons
  document.querySelector("button[type='submit']").disabled = false;
  document.querySelector("button[type='reset']").disabled = true;
  document.querySelector("button[type='button']").disabled = true;
  document.getElementById("voice-selection").disabled = true;
})

// read text button event
const read_text = document.querySelector("button[type='button']");
read_text.addEventListener("click", () => {
  // get slected voice
  const voiceSelect = document.getElementById("voice-selection");
  const selectedVoice = voiceSelect.selectedOptions[0].getAttribute('data-name');
 
  // find selected voice
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedVoice) {
      utterance.voice = voices[i];
    }
  }

  // speak
  synth.speak(utterance); 
});

// populate voices
window.addEventListener("load", () => {
  // get speech voices
  const voiceSelect = document.getElementById("voice-selection");

  // remove default option
  if (voices.length) {
    voiceSelect.remove(0);
  }

  // populate select element
  for(var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    // add options
    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.add(option);
  }

  // toggle buttons
  document.querySelector("button[type='submit']").disabled = false;
  document.querySelector("button[type='reset']").disabled = true;
  document.querySelector("button[type='button']").disabled = true;
  document.getElementById("voice-selection").disabled = true;
});

document.getElementById("volume-group").addEventListener("input", () => {
  // get volume from slider
  const range = document.querySelector("input[type='range']");
  const volume = range.value;

  // set utterance volume
  if (utterance) {
    utterance.volume = volume / 100;
  }

  // set volume icon
  const icon = document.querySelector("#volume-group img");
  if (volume > 67) {
    icon.src = "icons/volume-level-3.svg";
    icon.alt = "Volume Level 3"
  } else if (volume > 34) {
    icon.src = "icons/volume-level-2.svg";
    icon.alt = "Volume Level 2"
  } else if (volume > 1) {
    icon.src = "icons/volume-level-1.svg";
    icon.alt = "Volume Level 1"
  } else {
    icon.src = "icons/volume-level-0.svg";
    icon.alt = "Volume Level 0"
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { width: width, height: height, startX: startX, startY: startY };
}

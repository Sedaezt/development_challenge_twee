let handpose; //ml5.js opslaan
let video;  // webcam
let predictions = []; //voorspellingen handpost
let bubbles = []; 
let bubbleImage;  // afbeelding
let bubbleSize = 50;
let bubbleSpeeds = [];
let numRemovedBubbles = 0;
let startTime;
let maxTime = 30;
let handDetected = false;
let gameEnded = false;

function preload() {
  bubbleImage = loadImage('bubble.png'); // afbeelding
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);  //webcam
  video.hide();     //video verbergen
  handpose = ml5.handpose(video, modelReady);   // roep modelready als de functie klaar is
  handpose.on('predict', gotHands);
}

function modelReady() {
  console.log("Model ready!");  // weten wnr model ready is 
}

function gotHands(results) {
  predictions = results;
  if (predictions.length > 0 && !handDetected) {
    handDetected = true;
    startTime = millis();
  }
}

function draw() {
  if (handDetected && !gameEnded) {  //handdetectie + spel niet geëindigd
    let elapsedTime = (millis() - startTime) / 1000;  //omzetten naar sec.
    // gameover als de tijd 0 is
    if (elapsedTime >= maxTime) {
      if (numRemovedBubbles < 12) {
        gameOver();
      } else {
        youWon();
      }
    } else {
      background(255, 204, 204); // Lichtroze achtergrondkleur
      image(video, 0, 0, width, height);
      drawBubbles();
      moveBubbles();
      removeBubblesOnHand();
      displayTime(elapsedTime);
      displayScore();
    }
  } else {
    background(255, 204, 204); // Lichtroze achtergrondkleur
    fill(0); // Zet de tekstkleur op zwart
    textSize(24); // Aangepaste tekstgrootte
    textAlign(CENTER, CENTER);
    if (gameEnded) {
      if (numRemovedBubbles >= 12) { // Aangepast naar 12
        text("You won! Score: " + numRemovedBubbles, width / 2, height / 2);
      } else {
        text("Game Over :(", width / 2, height / 2);
      }
    } else {
      text("Please, wait a few seconds till the game start", width / 2, height / 2 - 40);
      text("Pop more than 12 bubbels in 30 seconds to win!", width / 2, height / 2 + 40);
    }
  }
}
// cirkels op het scherm
function drawBubbles() {
  for (let i = 0; i < bubbles.length; i++) {
    image(bubbleImage, bubbles[i].x, bubbles[i].y, bubbleSize, bubbleSize);
  }
  while (bubbles.length < 10) { // Voeg cirkels toe totdat we er 5 hebben
    let bubbleX = random(width - bubbleSize);
    let bubbleY = random(-height, -bubbleSize); // Start van boven
    bubbles.push({ x: bubbleX, y: bubbleY });
    bubbleSpeeds.push(random(2, 5)); // Willekeurige snelheid tussen 2 en 5
  }
}
// bewegen cirkels
function moveBubbles() {
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].y += bubbleSpeeds[i]; // Beweeg bubbel naar beneden
    // Als de bubbel buiten het scherm gaat, plaats deze bovenaan opnieuw
    if (bubbles[i].y > height + bubbleSize) {
      bubbles[i].y = random(-height, -bubbleSize);
      bubbles[i].x = random(width - bubbleSize);
    }
  }
}

function removeBubblesOnHand() {
  for (let i = 0; i < predictions.length; i++) {
    let landmarks = predictions[i].landmarks;
    let handX = landmarks[8][0];
    let handY = landmarks[8][1];
    for (let j = bubbles.length - 1; j >= 0; j--) {
      if (handX > bubbles[j].x && handX < bubbles[j].x + bubbleSize &&
        handY > bubbles[j].y && handY < bubbles[j].y + bubbleSize) {
        bubbles.splice(j, 1);
        bubbleSpeeds.splice(j, 1);
        numRemovedBubbles++;
      }
    }
  }
}
// tijd
function displayTime(time) {
  fill(0); // Zet de tekstkleur op zwart
  textSize(20);
  textAlign(LEFT, TOP);
  text("Time: " + nf(maxTime - time, 0, 1), 10, 10);
}
// score laten zien 
function displayScore() {
  fill(0); // Zet de tekstkleur op zwart
  textSize(20);
  textAlign(RIGHT, TOP);
  text("Score: " + numRemovedBubbles, width - 10, 10);
}

// game over scherm
function gameOver() {
  gameEnded = true;
}

// je hebt gewonnen scherm
function youWon() {
  gameEnded = true;
}
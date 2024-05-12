let handpose; //ml5.js opslaan
let video;  // webcam
let predictions = []; //voorspellingen handpost
let bubbles = []; 
let bubbleImage;  // afbeelding
let bubbleSize = 50;
let bubbleSpeeds = [];
let numRemovedBubbles = 0; // Aantal verwijderde bubbels
let startTime;  // timer
let maxTime = 30; // tijd
let handDetected = false;
let gameEnded = false;

function preload() {
  bubbleImage = loadImage('bubble.png'); // afbeelding
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);  //webcam
  video.hide();     //video verbergen
  handpose = ml5.handpose(video, modelReady);    // roep modelready als de functie klaar is
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
      if (handDetected && !gameEnded) { //handdetectie + spel niet geëindigd
        let elapsedTime = (millis() - startTime) / 1000;  //omzetten naar sec.
        // gameover als de tijd 0 is
        if (numRemovedBubbles >= 5) {
          youWon();
        } else if (elapsedTime >= maxTime) {
          gameOver();
        } else {
          image(video, 0, 0, width, height);
          drawBubbles();
          moveBubbles();
          removeBubblesOnHand();
          displayTime(elapsedTime);
          displayScore();
        }
  } 
  else {
  background(0);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
    if (gameEnded) {
      if (numRemovedBubbles >= 5) {
        text("You won!", width / 2, height / 2);
      } 
      else {
      text("Game Over", width / 2, height / 2);
      }
    } 
      else {
      text("Please show your hand to start", width / 2, height / 2);
      }
  }
}

// cirkels op het scherm
function drawBubbles() {
  for (let i = 0; i < bubbles.length; i++) {
    image(bubbleImage, bubbles[i].x, bubbles[i].y, bubbleSize, bubbleSize);
  }
  while (bubbles.length < 5) { // Voeg cirkels toe totdat we er 5 hebben
    let bubbleX = random(width - bubbleSize);
    let bubbleY = random(-height, -bubbleSize); // Start van boven
    bubbles.push({ x: bubbleX, y: bubbleY });
    bubbleSpeeds.push(random(1, 3)); // Willekeurige snelheid tussen 1 en 3
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
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text("Time: " + nf(maxTime - time, 0, 1), 10, 10); // Toon de resterende tijd
}

// score laten zien 
function displayScore() {
  fill(255);
  textSize(20);
  textAlign(RIGHT, TOP);
  text("Score: " + numRemovedCircles, width - 10, 10); // Toon het aantal verwijderde cirkels
}

// game over scherm
function gameOver() {
  gameEnded = true;
}

// je hebt gewonnen scherm
function youWon() {
  gameEnded = true;
}
let handpose; //ml5.js opslaan
let video;  // webcam
let predictions = []; //voorspellingen handpost
let circles = []; // Array om cirkels bij te houden
let circleSpeed = 0.1; // snelheid cirkels
let numRemovedCircles = 0; // Aantal verwijderde cirkels
let startTime;  // timer
let maxTime = 30; // tijd
let handDetected = false;
let gameEnded = false;
let canvasWidth = 900;
let canvasHeight = 900;
let removedCircles = [];


function setup() {
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.position((windowWidth - canvasWidth) / 2, (windowHeight - canvasHeight) / 2);
  video = createCapture(VIDEO); //webcam
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
  
    if (handDetected && circles.length > 0) {
      let landmarks = predictions[0].landmarks; // kenmerken van de gedetecteerde hand opslagen
      let handX = 0;
      let handY = 0;
      for (let j = 0; j < landmarks.length; j++) {
        handX += landmarks[j][0];
        handY += landmarks[j][1];
      }
      // gemiddelde x en y coördinaat berekenen
      handX /= landmarks.length;
      handY /= landmarks.length;
  
      
      for (let j = circles.length - 1; j >= 0; j--) {
        // midden van de hand en het midden van elk cirkel berekenen
        let d = dist(handX, handY, circles[j].x, circles[j].y);
        if (d < 25) { // afstand kleiner dan 25px
          removedCircles.push(circles.splice(j, 1)[0]); 
          circleSpeeds.splice(j, 1);
          numRemovedCircles++;  // aantal verwijderde cirkels verhogen
          if (numRemovedCircles >= 2) {
            handDetected = false;
            break;
          }
        }
      }
    }
  }

function draw() {
  if (handDetected && !gameEnded) { //handdetectie + spel niet geëindigd
    let elapsedTime = (millis() - startTime) / 1000;    //omzetten naar sec.
    // gameover als de tijd 0 is
    if (numRemovedCircles >= 5) {
      youWon();
    } else if (elapsedTime >= maxTime) {
      gameOver();
    } else if (numRemovedCircles >= 2) {
      youWon();
    } else {
      image(video, 0, 0, width, height);
      drawCircles();
      moveCircles();
      removeCirclesOnHand(); // We moeten de functie hier aanroepen
      displayTime(elapsedTime);
      displayScore();
    }
  } else {
    background(0);
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    let textX = canvasWidth / 2;
    let textY = canvasHeight / 2;
    if (gameEnded) {
      if (numRemovedCircles >= 5) {
        text("You won!", textX, textY);
      } else {
        text("Game Over", textX, textY);
      }
    } else {
      text("Please show your hand to start", textX, textY);
    }
  }
}

// cirkels op het scherm
function drawCircles() {
  fill(255, 0, 0);
  noStroke();
  while (circles.length < 5) { // Voeg cirkels toe totdat we er 5 hebben
    let circleX = random(width);
    let circleY = random(-100, -50); // Start van boven
    let speed = random(1, 3); // Willekeurige snelheid
    circle(circleX, circleY, 50);
    circles.push({ x: circleX, y: circleY }); // Voeg cirkel toe
    circleSpeeds.push(speed); // Voeg snelheid toe
  }
}

// bewegen cirkels
function moveCircles() {
  for (let i = 0; i < circles.length; i++) {
    circles[i].y += circleSpeeds[i]; // Verhoog y-positie
    let circleSize = random(30, 60);
    circle(circles[i].x, circles[i].y, circleSize);
    if (circles[i].y > height + 50) {
      circles[i].y = random(-100, -50);
    }
  }
}

function removeCirclesOnHand() {
  for (let i = 0; i < predictions.length; i++) {
    let landmarks = predictions[i].landmarks;
    let handX = 0;
    let handY = 0;
    for (let j = 0; j < landmarks.length; j++) {
      handX += landmarks[j][0];
      handY += landmarks[j][1];
    }
    handX /= landmarks.length;
    handY /= landmarks.length;
    for (let j = circles.length - 1; j >= 0; j--) {
      let d = dist(handX, handY, circles[j].x, circles[j].y);
      if (d < 25) {
        circles.splice(j, 1);
        circleSpeeds.splice(j, 1);
        numRemovedCircles++;
      }
    }
  }
}

// tijd
function displayTime(time) {
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text("Time: " + nf(maxTime - time, 0, 1), 10, 10); // Toon de resterende tijd
}

// score laten zien 
function displayScore() {
  fill(255);
  textSize(18);
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
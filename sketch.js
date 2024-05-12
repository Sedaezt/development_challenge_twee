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

function setup() {
  createCanvas(640, 480);
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
    startTime = millis();   // timer starten bij detectie van hand
  }
}

function draw() {
  if (handDetected && !gameEnded) { //handdetectie + spel niet geëindigd
    let elapsedTime = (millis() - startTime) / 1000;    //omzetten naar sec.
    // gameover als de tijd 0 is
    if (elapsedTime >= maxTime) {
      gameOver(); 
    // spel gaat door  
    } else {
      image(video, 0, 0, width, height);
      drawCircles();
      moveCircles();
      removeCirclesOnHand();
      displayTime(elapsedTime);
      displayScore();
    }
  } else {
    background(0);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    if (gameEnded) {
      if (numRemovedCircles >= 5) { // meer dan 5 cirkels verwijdert
        text("You won!", width / 2, height / 2);
      } else {
        text("Game Over", width / 2, height / 2);
      }
    } else {
      text("Please show your hand to start", width / 2, height / 2);
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
    circle(circles[i].x, circles[i].y, 50);
    if (circles[i].y > height + 50) { // Als cirkel onderaan is, opnieuw beginnen
      circles[i].y = random(-100, -50);
    }
  }
}

function removeCirclesOnHand() {
  for (let i = 0; i < predictions.length; i++) {
    let landmarks = predictions[i].landmarks;
    let tipIndex = 8; // wijsvinger
    let tip = landmarks[tipIndex];
    let tipX = tip[0];
    let tipY = tip[1];
    for (let j = circles.length - 1; j >= 0; j--) { 
      let d = dist(tipX, tipY, circles[j].x, circles[j].y);
      if (d < 25) {// Als de wijsvinger dichtbij de cirkel is
        // Verwijder de cirkel en bijbehorende snelheid
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
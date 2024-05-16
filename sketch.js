let handpose;
let video;
let predictions = [];
let bubbles = [];
let bombs = [];
let bubbleImage;
let bombImage;
let bubbleSize = 50;
let bombSize = 50;
let bubbleSpeeds = [];
let bombSpeeds = [];
let numRemovedBubbles = 0;
let numTouchedBombs = 0; 
let startTime;
let maxTime = 30;
let handDetected = false;
let gameEnded = false;

function preload() {
  bubbleImage = loadImage('bubble.png');
  bombImage = loadImage('bom.webp');
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', gotHands);
}

function modelReady() {
  console.log("Model ready!");
}

function gotHands(results) {
  predictions = results;
  if (predictions.length > 0 && !handDetected) {
    handDetected = true;
    startTime = millis();
  }
}

function draw() {
  if (handDetected && !gameEnded) {
    let elapsedTime = (millis() - startTime) / 1000;
    if (elapsedTime >= maxTime) {
      if (numRemovedBubbles < 12) {
        gameOver();
      } else {
        youWon();
      }
    } else {
      background(255, 204, 204);
      image(video, 0, 0, width, height);
      drawBubbles();
      drawBombs();
      moveBubbles();
      moveBombs();
      removeBubblesOnHand();
      touchBombs();
      displayTime(elapsedTime);
      displayScore();
      displayTouchedBombs(); 
    }
  } else {
    background(152, 117, 161);
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    if (gameEnded) {
      if (numRemovedBubbles >= 18) {
        text("You won! Score: " + numRemovedBubbles, width / 2, height / 2);
      } else {
        text("Game Over :(", width / 2, height / 2);
      }
    } else {
      text("Please, wait a few seconds till the game start", width / 2, height / 2 - 40);
      text("Pop more than 12 bubbles in 30 seconds to win, \n but be carefull there are boms!!", width / 2, height / 2 + 40);
    }
  }
}

function drawBubbles() {
  for (let i = 0; i < bubbles.length; i++) {
    image(bubbleImage, bubbles[i].x, bubbles[i].y, bubbleSize, bubbleSize);
  }
  while (bubbles.length < 10) {
    let bubbleX = random(width - bubbleSize);
    let bubbleY = random(-height, -bubbleSize);
    bubbles.push({ x: bubbleX, y: bubbleY });
    bubbleSpeeds.push(random(2, 5));
  }
}

function drawBombs() {
  for (let i = 0; i < bombs.length; i++) {
    image(bombImage, bombs[i].x, bombs[i].y, bombSize, bombSize);
  }
  while (bombs.length < 3) { 
    let bombX = random(width - bombSize);
    let bombY = random(-height, -bombSize);
    bombs.push({ x: bombX, y: bombY });
    bombSpeeds.push(random(2, 5));
  }
}

function moveBubbles() {
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].y += bubbleSpeeds[i];
    if (bubbles[i].y > height + bubbleSize) {
      bubbles[i].y = random(-height, -bubbleSize);
      bubbles[i].x = random(width - bubbleSize);
    }
  }
}

function moveBombs() {
  for (let i = 0; i < bombs.length; i++) {
    bombs[i].y += bombSpeeds[i];
    if (bombs[i].y > height + bombSize) {
      bombs[i].y = random(-height, -bombSize);
      bombs[i].x = random(width - bombSize);
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

function touchBombs() {
  for (let i = 0; i < predictions.length; i++) {
    let landmarks = predictions[i].landmarks;
    let handX = landmarks[8][0];
    let handY = landmarks[8][1];
    for (let j = bombs.length - 1; j >= 0; j--) {
      if (handX > bombs[j].x && handX < bombs[j].x + bombSize &&
        handY > bombs[j].y && handY < bombs[j].y + bombSize) {
        bombs.splice(j, 1);
        bombSpeeds.splice(j, 1);
        numTouchedBombs++;
        if (numTouchedBombs >= 3) { 
          gameOver();
        }
      }
    }
  }
}

function displayTime(time) {
  fill(0);
  textSize(20);
  textAlign(LEFT, TOP);
  text("Time: " + nf(maxTime - time, 0, 1), 10, 10);
}

function displayScore() {
  fill(0);
  textSize(20);
  textAlign(RIGHT, TOP);
  text("Score: " + numRemovedBubbles, width - 10, 10);
}

function displayTouchedBombs() {
  let bombIconSize = 30;
  for (let i = 0; i < 3; i++) {
    if (i < numTouchedBombs) {
      tint(255, 0, 0); 
    } else {
      noTint(); 
    }
    image(bombImage, 10 + i * (bombIconSize + 5), height - bombIconSize - 10, bombIconSize, bombIconSize);
  }
}

function gameOver() {
  gameEnded = true;
}

function youWon() {
  gameEnded = true;
}

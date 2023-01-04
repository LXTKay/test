"use strict"

const circle = Math.PI * 2;
const turn = circle / 16;
const canvas = document.createElement("canvas");
let messageBox;
let panic = false;

function createCanvas(){
  document.body.style.backgroundColor = "rgb(81, 81, 81)";
  document.body.style.display = "flex";
  document.body.style.minHeight = "100%";
  document.body.style.alignItems = "center";
  document.body.style.justifyContent = "center";
  document.body.style.margin = "0px";

  let container = document.createElement("div");
  container.id = "cont";
  container.style.display = "grid";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.width = "fit-content";
  container.style.height = "fit-content";
  container.style.gridTemplateColumns = "auto auto";
  container.style.gridTemplateRows = "auto";
  container.style.fontFamily = "Arial";
  document.body.append(container);

  canvas.width = 700;
  canvas.height = 700;
  canvas.style.backgroundColor = "aquamarine";
  canvas.style.padding = 0;
  canvas.style.borderStyle = "solid";
  canvas.style.borderColor = "black";
  canvas.style.borderWidth = "3px";
  canvas.style.margin = "5px";
  canvas.style.gridColumn = "1";
  canvas.style.gridRow = "1";
  document.getElementById("cont").append(canvas);

  let infoArea = document.createElement("div");
  infoArea.id = "infoArea";
  infoArea.style.display = "flex";
  infoArea.style.height = "100%";
  infoArea.style.width = "fit-content";
  infoArea.style.flexDirection = "column";
  document.getElementById("cont").append(infoArea);

  let stopButton = document.createElement("button");
  stopButton.type = "button";
  stopButton.innerHTML = "Stop";
  stopButton.style.margin = "5px";
  stopButton.style.width = "100px";
  stopButton.style.height = "30px";
  stopButton.style.borderStyle = "solid";
  stopButton.style.borderColor = "black";
  stopButton.style.borderWidth = "3px";
  stopButton.style.fontFamily = "Arial";
  stopButton.style.fontWeight = "bold";
  stopButton.style.backgroundColor = "white";
  stopButton.style.cursor = "pointer";
  document.getElementById("infoArea").append(stopButton);
  stopButton.addEventListener("mousedown", (event) => stopEverything(event));
  stopButton.addEventListener("mouseup", (event) => stopEverything(event));

  let msgBox = document.createElement("div");
  msgBox.style.display = "grid";
  msgBox.style.gridTemplateRows = "repeat(10, 1fr)";
  msgBox.style.gridColumn = "auto";
  msgBox.style.borderStyle = "solid";
  msgBox.style.borderColor = "black";
  msgBox.style.borderWidth = "2px";
  msgBox.style.width = "300px";
  msgBox.style.height = "200px";
  msgBox.style.backgroundColor = "gray";
  msgBox.style.margin = "5px";
  msgBox.style.overflow = "auto";
  msgBox.style.fontSize = "11pt";

  document.getElementById("infoArea").prepend(msgBox);
  messageBox = msgBox;

  return canvas.getContext("2d");
};

const ctx = createCanvas();

let log = {
  content : [],
  newMsg(msg){
    if (this.content.length == 0){
      for(let i = 0; i < 10; i++){
        this.content[i] = "";
      };
    };
    this.content.push(this.newTimestamp() + msg);
    if (this.content.length > 10) this.content.shift();
    messageBox.innerHTML = null;
    for(let i = 0; i < 10; i++) {
      let newMsgElement = document.createElement("div");
      newMsgElement.append(this.content[i]);
      newMsgElement.style.marginLeft = "2px";
      newMsgElement.style.alignSelf = "end";
      messageBox.append(newMsgElement);
    };
  },
  newTimestamp(){
    let curTime = new Date();
    let stamp = "[" + this.oneToDoubleDigit(curTime.getHours()) + ":" + this.oneToDoubleDigit(curTime.getMinutes()) + ":" + this.oneToDoubleDigit(curTime.getSeconds()) + "]:";
    return stamp;
  },
  oneToDoubleDigit(dig){
    if (dig > 9) return dig;
    return "0" + dig;
  }
};

function stopEverything(e){
  if (e.type == "mousedown"){
    e.target.style.backgroundColor = "red";
    if (panic){
      log.newMsg("Already aborted. Please reload.");
      return;
    };
    log.newMsg("Everything has been stopped!");
    panic = true;
  } else if (e.type == "mouseup"){
    e.target.style.backgroundColor = "white";
  };
};

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
};

function clear(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

function run(){
  let updating = setInterval(() => {
    if (panic) clearInterval(updating);
    //hierupdate code
  },1000/60);
};

function update(){
  clear();
  movement.next(testUnits);
  drawTestUnits(testUnits);
  if(panic) return;
  requestAnimationFrame(update);
};


//Testcode

class TestUnit{
  constructor(x,y){
    this.x = x;
    this.y = y;
  };
  radius = 30;
  color = "#c28f04";
  direction = 0;
  speed = 1;
  acuity = 100;
  collisionToken = false;
};

function createTestUnit(num){
  let arr = [];
  for(let i = 0; i < num; i++){
    arr[i] = new TestUnit(randomNumberBetween(1, canvas.width), randomNumberBetween(1, canvas.height));
  };
  return arr;
};

let testUnits = createTestUnit(10);

function drawTestUnits(arrmitunits){
  for(let i of arrmitunits){
    ctx.beginPath();
    ctx.arc(i.x, i.y, i.radius, 0, circle);
    ctx.fillStyle = i.color;
    ctx.fill();
    ctx.closePath();
  };
};

let token = 0;

let movement = {
  next(units){
    for(let unit of units){
      this.turn(unit);
      this.drawRay(unit);
      this.move(unit);
      this.borderCollision(unit);
      this.unitCollision(unit, units);
    };
  },
  turn(unit){
    if (unit.collisionToken) return;
    if(Math.random() > 0.5) return;
    if(unit.direction / turn > 15) unit.direction -= (16 * turn);
    if(unit.direction / turn < -15) unit.direction += (16 * turn);
    unit.direction += turn * randomNumberBetween(-1, 1);
    unit.direction = Math.round(unit.direction / turn) * turn;
  },
  sight(unit){
    let vecX = unit.x + unit.acuity * Math.cos(unit.direction - (4 * turn));
    let vecY = unit.y + unit.acuity * Math.sin(unit.direction + (4 * turn));
    return [vecX, vecY];
  },
  drawRay(unit){
    let vecs = this.sight(unit);
    ctx.beginPath();
    ctx.moveTo(unit.x,unit.y)
    ctx.lineTo(vecs[0], vecs[1])
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();
  },
  move(unit){
    //let oldpos = "Alt: x:" + unit.x.toFixed(3) + " / y:" + unit.y.toFixed(3);
    unit.x = unit.x + (unit.speed * Math.sin(unit.direction));
    unit.y = unit.y + (unit.speed * Math.cos(unit.direction));
    //console.log(oldpos);
    //console.log("Neu: x:" + unit.x.toFixed(3) + " / y:" + unit.y.toFixed(3));
  },
  borderCollision(unit){
    if (unit.x + unit.radius > canvas.width) unit.x = canvas.width - unit.radius;
    if (unit.x - unit.radius < 0) unit.x = unit.radius;
    if (unit.y + unit.radius > canvas.height) unit.y = canvas.height - unit.radius;
    if (unit.y - unit.radius < 0) unit.y = unit.radius;
  },
  unitCollision(unit, units){
    for (let i = 0; i < units.length; i++){
      if (unit == units[i]) continue;
      let distance = this.getDistance(unit.x, unit.y, units[i].x, units[i].y) - units[i].radius - unit.radius;
      //console.log("Unit 1: "+ unit.x + "/" + unit.y + "\n" + "Unit 2: " + units[i].x + "/" + units[i].y + "\n" + "Distance: " + distance);
      if (!(distance < 0)) continue;
      console.log("collided!");
      this.resolveCollision(unit, units[i]);
    };
  },
  resolveCollision(u1, u2) {
    let collisionMoment = new Promise(function(resolve, reject){
      u1.collisionToken = true;
      u2.collisionToken = true;
      u1.speed *= -1;
      u2.speed *= -1;
      setTimeout(
        () => resolve(1),
        1000
      );
    });
    collisionMoment.then(
      function(){
        u1.collisionToken = false;
        u2.collisionToken = false;
        u1.speed *= -1;
        u2.speed *= -1;
      },
      error => alert(error)
    );
  },
  getDistance(x1, y1, x2, y2){
    let xDist = x2 - x1;
    let yDist = y2 - y1;
    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
  }
};

update();
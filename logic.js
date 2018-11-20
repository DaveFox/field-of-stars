const dpi = window.devicePixelRatio;
const NUM_STARS = 100;
const starsList = [];
const drawObjects = [];
let isStarSelected = false;
let selectedStar = {};
let validState = false;

function main() {
  document.addEventListener('main-start', hideMenuShowCanvas);
}

function hideMenuShowCanvas() {
  const menu = document.getElementById('start'); //button list eventually
  const canvas = document.getElementById('game-screen');

  menu.style.display = 'none';
  canvas.style.display = 'block';

  setupCanvas(canvas);
  initaliseStars(canvas);

  setInterval(() => {
    draw();
  }, 100)

  //tick up
  setInterval(() => {
    for(let i=0; i<NUM_STARS; i++) {
      const currStar = starsList[i];
      if(currStar.owned) {
        currStar.fleets += currStar.econ;
        if(currStar.fleets > 100) currStar.fleets = 100;
      }
    }
    validState = false;
  }, 2000)
}

function setupCanvas(canvas) {
  const c = canvas.getContext('2d');
  const style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
  const style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);

  //scale canvas
  canvas.setAttribute('height', style_height * dpi);
  canvas.setAttribute('width', style_width * dpi);

  c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);

  canvas.addEventListener('mousedown', canvasSelection);
}

function resetStarField() {
  const canvas = document.getElementById('game-screen');
  const c = canvas.getContext('2d');

  //reset canvas
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);
}

function initaliseStars(canvas) {
  const playerSystem = Math.floor(Math.random() * Math.floor(NUM_STARS));
  const c = canvas.getContext('2d');
  c.translate(0.5, 0.5);

  for(let i=0; i<NUM_STARS; i++) {
    const start = Math.floor(Math.random() * Math.floor(canvas.width))+i;
    const end = Math.floor(Math.random() * Math.floor(canvas.height))+i;

    if(i === playerSystem) {
      console.log('DEBUG player system: ', i);

      starsList.push({
        id: `${i}`,
        name: 'Homeworld', //todo randomise from list
        location: [start, end],
        owned: true,
        econ: 2,
        fleets: 1
      });
    } else {
      starsList.push({
        id: `${i}`,
        name: `UXS-${i}`, //todo randomise from list
        location: [start, end],
        owned: false,
        fleets: Math.floor(Math.random()*100 + 1),
        econ: 0
      });
    }
  }

  addNormalDrawToStars(c);
  addPlayerOwnedDrawToStar(starsList[playerSystem], c);
}

function addNormalDrawToStars(context) {
  const starsLeng = starsList.length;

  for(let i=0; i<starsLeng; i++) {
    starsList[i].draw = function() {
      context.beginPath();
      context.arc(this.location[0], this.location[1], 2.3, 0, 2*Math.PI);
      context.fillStyle = 'white';
      context.strokeStyle = 'white';
      context.fill();
      context.stroke();
    }
  }
}

function addPlayerOwnedDrawToStar(star, context) {
  star.draw = function() {
    context.beginPath();
    context.arc(this.location[0], this.location[1], 2.3, 0, 2*Math.PI);
    context.fillStyle = 'red';
    context.strokeStyle = 'red';
    context.fill();
    context.stroke();

    context.font = "12px Arial";
    context.fillText(`${star.fleets}`,star.location[0]-4, star.location[1]+15);
  }
}

function canvasSelection(e) {
  //left click selection
  if(!isStarSelected && e.which !== 1) return;

  const canvas = document.getElementById('game-screen');
  const c = canvas.getContext('2d');
  const tollerance = 5;
  const starsLeng = starsList.length;

  for(let i=0; i<starsLeng; i++) {
    if(starsList[i].location[0] >= e.offsetX-tollerance &&
       starsList[i].location[0] <= e.offsetX+tollerance &&
       starsList[i].location[1] >= e.offsetY-tollerance &&
       starsList[i].location[1] <= e.offsetY+tollerance) {
     
        if(e.which === 1) {
          deselectStar(c);
          removeMoveLine();
          
          isStarSelected = true; 
          selectedStar = starsList[i];
          selectStar(starsList[i], c);
          validState = false;
          showStarInfo(selectedStar);
          return;
        } else if(e.which === 3) {
          removeMoveLine();
          drawPathBetweenStars(selectedStar, starsList[i], c, 'moveline');
          validState = false;
          return;
        }
    } 
  }

  //nothing selected
  deselectStar(c);
  removeMoveLine();
  hideStarInfo();

  isStarSelected = false;
  selectedStar = {};
  validState = false;
}

function selectStar(star, context) {
  star.draw = function() {
    context.beginPath();
    context.arc(this.location[0], this.location[1], 2.3, 0, 2*Math.PI);
    context.fillStyle = 'red';
    context.fill();
    context.strokeStyle = 'red';
    context.stroke();

    context.beginPath();
    context.arc(this.location[0], this.location[1], 6.3, 0, 2*Math.PI);
    context.stroke();
  }
}

function deselectStar(context) {
  if(selectedStar.owned){
    addPlayerOwnedDrawToStar(selectedStar, context);
  } else {
    selectedStar.draw = function() {
      context.beginPath();
      context.arc(this.location[0], this.location[1], 2.3, 0, 2*Math.PI);
      context.fillStyle = 'white';
      context.strokeStyle = 'white';
      context.fill();
      context.stroke();
    }
  }
}

function showStarInfo(star) {
  const systemMenu = document.getElementById('system-menu');
  const systemNameText = document.getElementById('system-name');
  const systemFleetText = document.getElementById('fleet-size');
  const systemEconText = document.getElementById('econ-size');

  systemNameText.innerHTML = star.name;
  systemFleetText.innerHTML = star.fleets;
  systemEconText.innerHTML = star.econ;

  systemMenu.style.display = 'block';
}

function hideStarInfo(star) {
  const systemMenu = document.getElementById('system-menu');

  systemMenu.style.display = 'none';
}

function drawPathBetweenStars(star1, star2, context, specialName) {
  const linePath = {
    id: specialName || `${star1.id}_${star2.id}`,
    draw: function() {
      context.beginPath();
      context.moveTo(star1.location[0], star1.location[1]);
      context.lineTo(star2.location[0], star2.location[1]);
      context.strokeStyle = 'red';
      context.stroke();
    }
  }

  drawObjects.push(linePath)
}

function removeMoveLine() {
  const existingLine = drawObjects.find((item) => {
    return item.id = 'moveline';
  });

  if(existingLine){
    drawObjects.splice(drawObjects.indexOf(existingLine), 1);
  }
}

function draw() {
  if(validState) return;

  resetStarField();

  const toDrawObjects = [...starsList, ...drawObjects];
  const drawObjectsLeng = toDrawObjects.length;

  for(let i=0; i< drawObjectsLeng; i++) {
    toDrawObjects[i].draw();
  }

  validState = true;
}

main();
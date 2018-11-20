const dpi = window.devicePixelRatio;
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
  const c = canvas.getContext('2d');
  c.translate(0.5, 0.5);

  for(let i=0; i<100; i++) {
    const start = Math.floor(Math.random() * Math.floor(canvas.width))+i;
    const end = Math.floor(Math.random() * Math.floor(canvas.height))+i;
    starsList.push({
      id: `${i}`,
      location: [start, end],
      owned: false
    });
  }

  addNormalDrawToStars(c);
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
          //todo show menu for star
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
  selectedStar.draw = function() {
    context.beginPath();
    context.arc(this.location[0], this.location[1], 2.3, 0, 2*Math.PI);
    context.fillStyle = 'white';
    context.strokeStyle = 'white';
    context.fill();
    context.stroke();
  }
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
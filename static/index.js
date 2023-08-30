const control = document.getElementById('control');
const light = document.getElementById('light');
const play = document.getElementById('play');
const pause = document.getElementById('pause');
const audioIn = document.getElementById('audioIn');
const audio = new Audio();
let pickr;

// adding elements for a button component
const upArrow = document.getElementById('upArrow');
const downArrow = document.getElementById('downArrow');
const circleCounter = document.getElementById('circleCounter');

let t = 0; // Time variable for Perlin noise

let prevCounter = 0;
// let isClientUpdate = false;

const socket = io();

socket.on('connect', () => {
  socket.on('hex', (val) => {document.body.style.backgroundColor = val})
  socket.on('audio', (val) => {getSound(encodeURI(val));})
  socket.on('pauseAudio', (val) => {audio.pause();})


    socket.on('updateCircleCounter', (val) => {
      counter = val;
      circleCounter.innerText = counter;
      console.log("this is the circle counter:" + counter)

      console.log("this is the circle length:" + circles.length )

      // Synchronize the number of circles with the server counter
      //  I THINK THIS IS WHERE THE ISSUE IS
      if(circles.length < counter) {
        addCircle();
      }
      if(circles.length > counter) {
        removeCircle();
      }
    
      prevCounter = counter;
    });
  

});

// enter controller mode
control.onclick = () => {
  console.log('control')
  // make sure you're not in fullscreen
  if (document.fullscreenElement) {
    document.exitFullscreen()
      .then(() => console.log('exited full screen mode'))
      .catch((err) => console.error(err));
  }
  // make buttons and controls visible
  document.getElementById('user').classList.remove('fadeOut');
  document.getElementById('controlPanel').style.opacity = 0.6;
  if (!pickr) {
    // create our color picker. You can change the swatches that appear at the bottom
    pickr = Pickr.create({
      el: '.pickr',
      theme: 'classic',
      showAlways: true,
      swatches: [
        'rgba(255, 255, 255, 1)',
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(103, 58, 183, 1)',
        'rgba(63, 81, 181, 1)',
        'rgba(33, 150, 243, 1)',
        'rgba(3, 169, 244, 1)',
        'rgba(0, 188, 212, 1)',
        'rgba(0, 150, 136, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(139, 195, 74, 1)',
        'rgba(205, 220, 57, 1)',
        'rgba(255, 235, 59, 1)',
        'rgba(255, 193, 7, 1)',
        'rgba(0, 0, 0, 1)',
      ],
      components: {
        preview: false,
        opacity: false,
        hue: true,
      },
    });

    pickr.on('change', (e) => {
      // when pickr color value is changed change background and send message on ws to change background
      const hexCode = e.toHEXA().toString();
      document.body.style.backgroundColor = hexCode;
      socket.emit('hex', hexCode)
    });
  }
};

light.onclick = () => {
  // safari requires playing on input before allowing audio
  audio.muted = true;
  audio.play().then(audio.muted=false)

  // in light mode make it full screen and fade buttons
  document.documentElement.requestFullscreen();
  document.getElementById('user').classList.add('fadeOut');
  // if you were previously in control mode remove color picker and hide controls
  if (pickr) {
    // this is annoying because of the pickr package
    pickr.destroyAndRemove();
    document.getElementById('controlPanel').append(Object.assign(document.createElement('div'), { className: 'pickr' }));
    pickr = undefined;
  }
  document.getElementById('controlPanel').style.opacity = 0;
};


const getSound = (query, loop = false, random = false) => {
  const url = `https://freesound.org/apiv2/search/text/?query=${query}+"&fields=name,previews&token=U5slaNIqr6ofmMMG2rbwJ19mInmhvCJIryn2JX89&format=json`;
  fetch(url)
    .then((response) => response.clone().text())
    .then((data) => {
      console.log(data);
      data = JSON.parse(data);
      if (data.results.length >= 1) var src = random ? choice(data.results).previews['preview-hq-mp3'] : data.results[0].previews['preview-hq-mp3'];
      audio.src = src;
      audio.play();
      console.log(src);
		  })
    .catch((error) => console.log(error));
};

play.onclick = () => {
  socket.emit('audio', audioIn.value)
  getSound(encodeURI(audioIn.value));
};
pause.onclick = () => {
  socket.emit('pauseAudio', audioIn.value)
  audio.pause();
};
audioIn.onkeyup = (e) => { if (e.keyCode === 13) { play.click(); } };




let circles = []; 
let circleIdCounter = 0; 
let counter = 0; 

const addCircle = () => {
 
  const circle = Object.assign(document.createElement("div"), {
    className: "circle",
    style: `width: 50px; height: 50px; background-color: white; position: absolute;`
  });

  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  const vx = (Math.random() - 0.5) * 10;
  const vy = (Math.random() - 0.5) * 10;

  circle.style.left = x + "px";
  circle.style.top = y + "px";

  const circleId = circleIdCounter++;
  circles.push({ id: circleId, element: circle, x, y, vx, vy });

 
  document.getElementById("circleWrapper").appendChild(circle);
  document.body.appendChild(circle);
  counter++;
  circleCounter.innerText = counter; 

 
  // isClientUpdate = true;  // Set the flag before emitting
  socket.emit('addCircle', counter);
  console.log("adding a circle from client");

};


const removeCircle = () => {
  if (circles.length > 0) {
    const removedCircle = circles.pop();
    removedCircle.element.remove();
    counter--;
    circleCounter.innerText = counter;
   
   // isClientUpdate = true;  // Set the flag before emitting
   // socket.emit('removeCircle', counter);

  }
};

// Function to move circles
const moveCircles = () => {
  circles.forEach(circle => {
    circle.vx += (Math.random() - 0.5) * 2;
    circle.vy += (Math.random() - 0.5) * 2;

    circle.vx = Math.min(Math.max(circle.vx, -5), 5);
    circle.vy = Math.min(Math.max(circle.vy, -5), 5);

    circle.x += circle.vx;
    circle.y += circle.vy;

    if (circle.x < 0 || circle.x > window.innerWidth - 50) circle.vx *= -1;
    if (circle.y < 0 || circle.y > window.innerHeight - 50) circle.vy *= -1;

    circle.element.style.left = circle.x + 'px';
    circle.element.style.top = circle.y + 'px';
  });

  requestAnimationFrame(moveCircles);
};

// Initialize moving circles
moveCircles();


upArrow.onclick = addCircle;
downArrow.onclick = removeCircle;

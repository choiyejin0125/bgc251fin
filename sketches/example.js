const { Responsive } = P5Template;

let cam; // 웹캠
let fogLayer; // 뿌연 효과 레이어
let handModel; // 손 모델
let handResults = []; // 손 위치 결과
let waterDrops = []; // 물방울 목록

const camW = 640;
const camH = 480;
const canvasW = 800;
const canvasH = 600;

function setup() {
  let layout = new Responsive();
  layout.createResponsiveCanvas(canvasW, canvasH, 'contain', true);

  cam = createCapture(VIDEO);
  cam.size(camW, camH);
  cam.hide();

  fogLayer = createGraphics(canvasW, canvasH);
  fogLayer.noStroke();
  fogLayer.fill(255, 200);
  fogLayer.rect(0, 0, canvasW, canvasH);
  fogLayer.filter(BLUR, 6);

  handModel = ml5.handpose(cam, function () {});
  handModel.on('predict', function (results) {
    handResults = results;
  });
}

function draw() {
  background(0);

  push();
  translate(canvasW, 0);
  scale(-1, 1);
  image(cam, 0, 0, canvasW, canvasH);
  pop();

  image(fogLayer, 0, 0);

  if (frameCount % 5 === 0) {
    restoreFog(fogLayer, 200, 4); // maxOpacity = 200, fadeSpeed = 4
  }

  if (handResults.length > 0) {
    let landmarks = handResults[0].landmarks;
    fogLayer.loadPixels();

    for (let i = 1; i <= 20; i++) {
      if (!landmarks[i]) continue;

      let pos = toCanvasCoords(
        landmarks[i][0],
        landmarks[i][1],
        camW,
        camH,
        canvasW,
        canvasH
      );

      let flippedX = canvasW - pos.x;

      eraseCircle(fogLayer, flippedX, pos.y, 18, 0.7, 60); // brushSize=18, minOpacity=60

      if (i % 2 === 1 && frameCount % 5 === 0 && waterDrops.length < 5) {
        waterDrops.push({
          x: flippedX,
          y: pos.y,
          brushSize: random(10, 20),
          fallSpeed: random(2, 4),
          col: color(100, 180, 255, random(100, 200)),
        });
      }
    }

    fogLayer.updatePixels();
  }

  updateWaterDrops(waterDrops, canvasH);
}

function toCanvasCoords(x, y, camW, camH, canvasW, canvasH) {
  return {
    x: map(x, 0, camW, 0, canvasW),
    y: map(y, 0, camH, 0, canvasH),
  };
}

function restoreFog(layer, maxOpacity, fadeSpeed) {
  layer.loadPixels();

  for (let i = 3; i < layer.pixels.length; i += 4) {
    if (layer.pixels[i] < maxOpacity) {
      layer.pixels[i] = layer.pixels[i] + fadeSpeed;
      if (layer.pixels[i] > maxOpacity) {
        layer.pixels[i] = maxOpacity;
      }
    }
  }

  layer.updatePixels();
}

function eraseCircle(layer, cx, cy, brushSize, fade, minOpacity) {
  let d = layer.pixelDensity();
  let w = layer.width;
  let h = layer.height;
  let r2 = brushSize * brushSize;

  for (
    let x = Math.max(0, int(cx - brushSize));
    x < Math.min(w, int(cx + brushSize));
    x++
  ) {
    for (
      let y = Math.max(0, int(cy - brushSize));
      y < Math.min(h, int(cy + brushSize));
      y++
    ) {
      let dx = x - cx;
      let dy = y - cy;
      if (dx * dx + dy * dy < r2) {
        for (let i = 0; i < d; i++) {
          for (let j = 0; j < d; j++) {
            let idx = 4 * ((y * d + j) * w * d + (x * d + i));
            let a = layer.pixels[idx + 3];
            let newOpacity = a * fade;
            if (newOpacity < minOpacity) newOpacity = minOpacity;
            layer.pixels[idx + 3] = newOpacity;
          }
        }
      }
    }
  }
}

function updateWaterDrops(waterDrops, canvasHeight) {
  for (let i = waterDrops.length - 1; i >= 0; i--) {
    let drop = waterDrops[i];

    fill(drop.col);
    noStroke();
    ellipse(drop.x, drop.y, drop.brushSize, drop.brushSize);

    drop.y += drop.fallSpeed;
    drop.fallSpeed += 0.1;

    if (drop.y - drop.brushSize > canvasHeight) {
      waterDrops.splice(i, 1);
    }
  }
}

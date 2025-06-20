const { Responsive } = P5Template;

let webcam; // 웹캠
let fogLayer; // 뿌연 김 효과 (수증기)
let handTracker; // 손 추적 모델
let handPoints = []; // 손 위치 저장

let waterDrops = []; // 큰 물방울
let splashCircles = []; // 튀는 작은 물방울들

const webcamWidth = 640;
const webcamHeight = 480;
const canvasWidth = 800;
const canvasHeight = 600;

function setup() {
  let layout = new Responsive();
  layout.createResponsiveCanvas(canvasWidth, canvasHeight, 'contain', true);

  // 웹캠 설정
  webcam = createCapture(VIDEO);
  webcam.size(webcamWidth, webcamHeight);
  webcam.hide();

  // 뿌연 수증기 레이어 만들기
  fogLayer = createGraphics(canvasWidth, canvasHeight);
  fogLayer.noStroke();
  fogLayer.fill(255, 200); // 살짝 투명한 흰색
  fogLayer.rect(0, 0, canvasWidth, canvasHeight);
  fogLayer.filter(BLUR, 6); // 흐림 효과 주기

  // 손 인식 모델 준비
  handTracker = ml5.handpose(webcam, function () {});
  handTracker.on('predict', function (results) {
    handPoints = results;
  });
}

function draw() {
  background(0); // 배경 검정

  // 1. 좌우반전된 웹캠 영상 보여주기
  push();
  translate(canvasWidth, 0);
  scale(-1, 1);
  image(webcam, 0, 0, canvasWidth, canvasHeight);
  pop();

  // 2. 뿌연 수증기 레이어 그리기
  image(fogLayer, 0, 0);

  // 3. 시간이 지나면 서서히 다시 뿌옇게 되게 하기
  if (frameCount % 5 === 0) {
    slowlyRestoreFog(fogLayer, 200, 4);
  }

  // 4. 손가락 위치에 따라 닦기 효과 + 물방울 떨어뜨리기
  if (handPoints.length > 0) {
    let finger = handPoints[0].landmarks;
    fogLayer.loadPixels();

    for (let i = 1; i <= 20; i++) {
      if (!finger[i]) continue;

      let screenPos = convertToCanvasCoords(
        finger[i][0],
        finger[i][1],
        webcamWidth,
        webcamHeight,
        canvasWidth,
        canvasHeight
      );

      let flippedX = canvasWidth - screenPos.x;

      // 손가락 자국 닦기
      eraseCircle(fogLayer, flippedX, screenPos.y, 18, 0.7, 60);

      // 물방울 떨어뜨리기 (홀수번호만)
      if (i % 2 === 1 && frameCount % 5 === 0 && waterDrops.length < 5) {
        waterDrops.push({
          x: flippedX,
          y: screenPos.y,
          size: random(10, 20),
          speedY: random(2, 4),
          color: color(100, 180, 255, random(100, 200)),
        });
      }
    }
    fogLayer.updatePixels();
  }

  // 5. 물방울과 퍼지는 원 그리기
  updateWaterDrops(waterDrops, canvasHeight);
  updateSplashCircles();
}

// 웹캠 위치 → 캔버스 위치로 바꾸기
function convertToCanvasCoords(x, y, camW, camH, canvasW, canvasH) {
  return {
    x: map(x, 0, camW, 0, canvasW),
    y: map(y, 0, camH, 0, canvasH),
  };
}

// 수증기 레이어 서서히 복원하기
function slowlyRestoreFog(layer, maxAlpha, step) {
  layer.loadPixels();
  for (let i = 3; i < layer.pixels.length; i += 4) {
    if (layer.pixels[i] < maxAlpha) {
      layer.pixels[i] = min(layer.pixels[i] + step, maxAlpha);
    }
  }
  layer.updatePixels();
}

// 손가락으로 둥글게 닦는 효과
function eraseCircle(layer, centerX, centerY, radius, fade, minAlpha) {
  let d = layer.pixelDensity();
  let w = layer.width;
  let h = layer.height;
  let radiusSquared = radius * radius;

  for (
    let x = max(0, int(centerX - radius));
    x < min(w, int(centerX + radius));
    x++
  ) {
    for (
      let y = max(0, int(centerY - radius));
      y < min(h, int(centerY + radius));
      y++
    ) {
      let dx = x - centerX;
      let dy = y - centerY;
      if (dx * dx + dy * dy < radiusSquared) {
        for (let i = 0; i < d; i++) {
          for (let j = 0; j < d; j++) {
            let idx = 4 * ((y * d + j) * w * d + (x * d + i));
            let currentAlpha = layer.pixels[idx + 3];
            layer.pixels[idx + 3] = max(currentAlpha * fade, minAlpha);
          }
        }
      }
    }
  }
}

// 물방울 움직이기 + 바닥에 닿으면 작은 물방울 퍼짐
function updateWaterDrops(dropList, canvasH) {
  for (let i = dropList.length - 1; i >= 0; i--) {
    let drop = dropList[i];

    fill(drop.color);
    noStroke();
    ellipse(drop.x, drop.y, drop.size);

    drop.y += drop.speedY;
    drop.speedY += 0.1;

    // 바닥에 닿으면 퍼지는 원 5개 생성
    if (drop.y + drop.size / 2 > canvasH) {
      for (let j = 0; j < 5; j++) {
        splashCircles.push({
          x: drop.x,
          y: canvasH - random(1, 5),
          size: random(3, 6),
          vx: random(-2, 2),
          vy: random(-3, -1),
          alpha: 200,
          color: drop.color,
        });
      }
      dropList.splice(i, 1);
    }
  }
}

// 작은 물방울들 퍼지고 사라지게 하기
function updateSplashCircles() {
  for (let i = splashCircles.length - 1; i >= 0; i--) {
    let circle = splashCircles[i];
    circle.x += circle.vx;
    circle.y += circle.vy;
    circle.vy += 0.1;
    circle.alpha -= 5;

    fill(
      red(circle.color),
      green(circle.color),
      blue(circle.color),
      circle.alpha
    );
    noStroke();
    ellipse(circle.x, circle.y, circle.size);

    if (circle.alpha <= 0) {
      splashCircles.splice(i, 1);
    }
  }
}

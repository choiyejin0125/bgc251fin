const { Responsive, Scroll, Title, References } = P5jsTemplate;

function setup() {
  Responsive.createResponsiveCanvas(
    800,
    600,
    '#canvas-container',
    'fill',
    false
  );
  Scroll.init();
  Title.init(
    '키스의 고유 조건은 입술끼리 만나야 하고 특별한 기술은 필요치 않다',
    '손우성',
    '2025'
  );
  References.init([
    {
      title: 'What was Coding like 40 years ago?',
      authors: ['Daniel Shiffman'],
      year: '2022',
      publisher: 'The Coding Train - YouTube',
      url: 'https://www.youtube.com/watch?v=7r83N3c2kPw',
    },
    {
      title: '250425a',
      authors: ['Okazz'],
      year: '2025',
      publisher: 'OpenProcessing',
      url: 'https://openprocessing.org/sketch/2625827',
    },
    {
      title:
        'Nature of Code 자연계 법칙을 디지털 세계로 옮기는 컴퓨터 프로그래밍 전략',
      authors: ['다니엘 쉬프만'],
      translator: ['윤인성'],
      year: '2015',
      publisher: '한빛미디어',
    },
  ]);
}

function draw() {
  background('#000000');
  noStroke();
  fill('red');
  circle(mouseX, mouseY, 100);
  Responsive.drawReferenceGrid('#ffffff');
}

function mouseWheel() {
  console.log('wheel');
}

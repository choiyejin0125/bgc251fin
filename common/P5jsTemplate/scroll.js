let sectionCanvas = document.querySelector('#section-canvas');
function setSectionCanvas(selector) {
  const elem = document.querySelector(selector);
  const functionName = 'setSectionCanvas';
  if (!elem) {
    console.error(
      `@${functionName}(): "${selector}"와 일치하는 HTML 요소가 없습니다. 번째 매개변수 selector를 확인하세요.`
    );
    return;
  }
  sectionCanvas = elem;
}

let sectionControl = document.querySelector('#section-control');
function setSectionControl(selector) {
  const elem = document.querySelector(selector);
  const functionName = 'setSectionControl';
  if (!elem) {
    console.error(
      `@${functionName}(): "${selector}"와 일치하는 HTML 요소가 없습니다. 번째 매개변수 selector를 확인하세요.`
    );
    return;
  }
  sectionControl = elem;
}

let buttonScroll = document.querySelector('#button-scroll');
function setButtonScroll(selector) {
  const elem = document.querySelector(selector);
  const functionName = 'setButtonScroll';
  if (!elem) {
    console.error(
      `@${functionName}(): "${selector}"와 일치하는 HTML 요소가 없습니다. 번째 매개변수 selector를 확인하세요.`
    );
    return;
  }
  buttonScroll = elem;
}

let gate = false;
let gateInitCnt = 0;
let prevIntersectionStateA = false;
let prevIntersectionStateB = false;

/**
 * 지정한 요소의 스크롤을 비활성화.
 * 'wheel' 및 'touchmove' 이벤트의 기본 동작을 막아 스크롤을 방지.
 *
 * @param {HTMLElement} elem - 스크롤을 비활성화할 HTML 요소.
 */
function disableScroll(elem) {
  elem.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );
  elem.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );
}

function scrollToTop(timeoutDuration = 1000) {
  sectionCanvas.scrollIntoView({ behavior: 'smooth' });
  gate = false;
  setTimeout(() => {
    gate = true;
  }, timeoutDuration);
}

function scrollToBottom(timeoutDuration = 1000) {
  sectionControl.scrollIntoView({ behavior: 'smooth' });
  gate = false;
  setTimeout(() => {
    gate = true;
  }, timeoutDuration);
}

function registerButtonEvent() {
  buttonScroll.addEventListener('click', () => {
    const towardDown = buttonScroll.dataset.toward === 'down';
    if (towardDown) {
      scrollToBottom();
    } else {
      scrollToTop();
    }
  });
}

function observe() {
  const intersectionObserverA = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!prevIntersectionStateA && gate) scrollToTop();
        gateInitCnt++;
        if (gateInitCnt === 2) gate = true;
      } else {
        if (prevIntersectionStateB) buttonScroll.dataset.toward = 'up';
      }
      prevIntersectionStateA = entry.isIntersecting;
    },
    { threshold: [0, 1], rootMargin: '-2px 0px 0px 0px' }
  );
  intersectionObserverA.observe(sectionCanvas);

  const intersectionObserverB = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (prevIntersectionStateA) {
          if (gate) scrollToBottom();
          buttonScroll.dataset.toward = 'down';
        }
        gateInitCnt++;
        if (gateInitCnt === 2) gate = true;
      }
      prevIntersectionStateB = entry.isIntersecting;
    },
    { threshold: [0, 1], rootMargin: '0px 0px -2px 0px' }
  );
  intersectionObserverB.observe(sectionCanvas);
}

function init() {
  disableScroll(sectionCanvas);
  disableScroll(sectionControl);
  registerButtonEvent();
  observe();
}

export {
  setSectionCanvas,
  setSectionControl,
  setButtonScroll,
  disableScroll,
  registerButtonEvent,
  observe,
  init,
};

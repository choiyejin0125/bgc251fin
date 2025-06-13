let title = '키스의 고유 조건은 입술끼리 만나야 하고 특별한 기술은 필요치 않다';
let designer = '손우성';
let year = '2025';

function setTitle(_title) {
  const functionName = 'setTitle';
  if (typeof _title !== 'string') {
    console.error(`@${functionName}(): 매개변수 _title은 문자열이어야 합니다.`);
    return;
  }
  title = _title;
}

function setDesigner(_designer) {
  const functionName = 'setDesigner';
  if (typeof _designer !== 'string') {
    console.error(
      `@${functionName}(): 매개변수 _designer는 문자열이어야 합니다.`
    );
    return;
  }
  designer = _designer;
}

function setYear(_year) {
  const functionName = 'setYear';
  if (typeof _year !== 'string') {
    console.error(`@${functionName}(): 매개변수 _year는 문자열이어야 합니다.`);
    return;
  }
  year = _year;
}

function setHtmlTitle() {
  document.title = `${designer} - ${title}`;
}

function setHtmlBody(selectorTitle = '.title', selectorAuthor = '.author') {
  document
    .querySelectorAll(selectorTitle)
    .forEach((el) => (el.textContent = title));

  document
    .querySelectorAll(selectorAuthor)
    .forEach((el) => (el.textContent = `${designer} (${year})`));
}

function init(_title, _designer, _year) {
  setTitle(_title);
  setDesigner(_designer);
  setYear(_year);
  setHtmlTitle();
  setHtmlBody();
}

export { setTitle, setDesigner, setYear, setHtmlTitle, setHtmlBody, init };

import "./index.html";
import "@/assets/styles/base.scss";

const dragEls = document.querySelectorAll(".ui-drag");
const dropAreaEls = document.querySelectorAll(".dropArea");

/**
 * 绑定拖拽目标
 *
 */
Array.from(dragEls).forEach(dragEl => {
  dragEl.addEventListener("dragstart", function(event) {
    event.dataTransfer.effectAllowed = "copy";
  });
});

let hideTimeout = null;

/**
 * Overlay
 *
 * @param: {String} param description
 * @return: {String} return
 */
class Overlay {
  constructor(
    { className = "ui-overlay", color = "blue" } = {
      className: "ui-overlay",
      color: "blue"
    }
  ) {
    this.className = className;
    this.color = color;
    this.width = "2px";
    this.elem = this.createElement();
    document.body.appendChild(this.elem);
  }
  createElement() {
    this.elem = document.createElement("div");
    this.elem.className = this.className;
    this.elem.style.color = this.color;
    this.elem.style.position = "absolute";
    this.elem.style.display = "none";
    return this.elem;
  }
  getElement() {
    return this.elem;
  }
  show({ top, left, length, mode = "horizontal" }) {
    overlayEl.style.top = top;
    overlayEl.style.left = left;
    if (mode === "vertical") {
      overlayEl.style.width = this.width;
      overlayEl.style.height = length;
      removeClass(this.elem, "s-horizontal");
      addClass(this.elem, "s-vertical");
    } else {
      overlayEl.style.width = length;
      overlayEl.style.height = this.width;
      removeClass(this.elem, "s-vertical");
      addClass(this.elem, "s-horizontal");
    }
    this.elem.style.display = "block";
  }
  hide() {
    this.elem.style.display = "none";
  }
}

let overlay = new Overlay();
let overlayEl = overlay.getElement();
overlayEl.addEventListener("dragenter", function(event) {
  clearTimeout(hideTimeout);
  overlayEl.style.display = "block";
});
overlayEl.addEventListener("dragover", function(event) {
  event.preventDefault();
  clearTimeout(hideTimeout);
  overlayEl.style.display = "block";
});

/**
 * 绑定放置目标
 *
 */
Array.from(dropAreaEls).forEach(dropAreaEl => {
  dropAreaEl.style.position = "relative";

  dropAreaEl.addEventListener("dragover", function(event) {
    event.preventDefault();
    event.stopPropagation();
    let currElem = event.target;
    let { offsetLeft: baseLeft, offsetTop: baseTop } = getOffsetByBody(
      dropAreaEl
    );
    addClass(currElem, "s-dragover");
    if (
      currElem !== event.currentTarget &&
      currElem.className.indexOf("ui-drag") > -1
    ) {
      let currElemDetail = getElementDetail(currElem);
      console.log(currElemDetail);
      let direction = getPosition(currElem, event.offsetX, event.offsetY);
      if (direction === "left" || direction === "right") {
        if (direction === "left") {
          overlay.show({
            mode: "vertical",
            length: `${currElemDetail.height}px`,
            top: `${baseTop + currElemDetail.y}px`,
            left: `${baseLeft + currElemDetail.x}px`
          });
        } else {
          overlay.show({
            mode: "vertical",
            length: `${currElemDetail.height}px`,
            top: `${baseTop + currElemDetail.y}px`,
            left: `${baseLeft + currElemDetail.x + currElemDetail.width}px`
          });
        }
        clearTimeout(hideTimeout);
        overlayEl.style.display = "block";
      } else if (direction === "top" || direction === "bottom") {
        if (direction === "top") {
          overlay.show({
            length: `${currElemDetail.width}px`,
            top: `${baseTop + currElemDetail.y}px`,
            left: `${baseLeft + currElemDetail.x}px`
          });
        } else {
          overlay.show({
            length: `${currElemDetail.width}px`,
            top: `${baseTop + currElemDetail.y + currElemDetail.height}px`,
            left: `${baseLeft + currElemDetail.x}px`
          });
        }
        clearTimeout(hideTimeout);
      } else {
        overlay.hide();
      }
    } else if (currElem.className.indexOf("dropArea") > -1) {
      let dragEls = Array.from(currElem.childNodes).filter(
        item => item.nodeType === 1 && item.className.indexOf("ui-drag") > -1
      );
      if (dragEls.length > 0) {
        let lastElemDetail = getElementDetail(dragEls[dragEls.length - 1]);
        overlay.show({
          length: `${lastElemDetail.width}px`,
          top: `${baseTop + lastElemDetail.y + lastElemDetail.height}px`,
          left: `${baseLeft + lastElemDetail.x}px`
        });
      }
    }
  });

  dropAreaEl.addEventListener("dragleave", function(event) {
    hideTimeout = setTimeout(() => {
      overlay.hide();
    }, 500);
    removeClass(event.target, "s-dragover");
  });

  dropAreaEl.addEventListener("drop", function(event) {
    overlay.hide();
    removeClass(event.target, "s-dragover");
  });
});

/**
 * 获取鼠标在元素的定位
 *
 * @param: {Object} elem 元素
 * @param: {Number} offsetX 鼠标x
 * @param: {Number} offsetY 鼠标y
 * @return: {String} left|right|top|bottom|null
 */
function getPosition(elem, offsetX, offsetY) {
  const { width, height } = getElementDetail(elem);
  const THRESHOLD = 20;
  let widthPos = [0, THRESHOLD, width - THRESHOLD, width];
  let heightPos = [0, THRESHOLD, height - THRESHOLD, height];
  let direction = null;
  if (width > height) {
    let index = widthPos.findIndex(val => val > offsetX) - 1;
    direction = ["left", null, "right"][index];
    if (direction === null) {
      let index = heightPos.findIndex(val => val > offsetY) - 1;
      direction = ["top", null, "bottom"][index];
    }
  } else {
    index = heightPos.findIndex(val => val > offsetY) - 1;
    direction = ["top", null, "bottom"][index];
    if (direction === null) {
      let index = widthPos.findIndex(val => val > offsetX) - 1;
      direction = ["left", null, "right"][index];
    }
  }
  return direction;
}

/**
 * 获取元素信息
 *
 */
function getElementDetail(elem) {
  const x = elem.offsetLeft;
  const y = elem.offsetTop;
  const width = elem.offsetWidth;
  const height = elem.offsetHeight;
  return { width, height, x, y };
}

function getOffsetByBody(elem) {
  let offsetTop = 0;
  let offsetLeft = 0;
  while (elem && elem.tagName !== "BODY") {
    offsetTop += elem.offsetTop;
    offsetLeft += elem.offsetLeft;
    elem = elem.offsetParent;
  }
  return {
    offsetTop,
    offsetLeft
  };
}

/**
 * 增加类名
 *
 * @param: {String} param description
 * @return: {String} return
 */
function addClass(elem, name) {
  let classArrs = elem.className.split(" ");
  if (!classArrs.includes(name)) {
    classArrs.push(name);
    elem.className = classArrs.join(" ");
  }
}

/**
 * 移出类名
 *
 * @param: {String} param description
 * @return: {String} return
 */
function removeClass(elem, name) {
  let classArrs = elem.className.split(" ");
  let index = classArrs.findIndex(val => val === name);
  if (index > -1) {
    classArrs.splice(index, 1);
    elem.className = classArrs.join(" ");
  }
}

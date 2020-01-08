import "./index.html";
import "@/assets/styles/base.scss";

const dragEls = document.querySelectorAll(".ui-drag");
const dropAreaEls = document.querySelectorAll(".dropArea");

/**
 * Overlay
 *
 * @param: {String} param description
 * @return: {String} return
 */
class Overlay {
  constructor(
    { className = "ui-overlay", color = "#3396fb" } = {
      className: "ui-overlay",
      color: "#3396fb"
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
let throttle = new Throttle();
let overlay = new Overlay();
let overlayEl = overlay.getElement();
overlayEl.addEventListener("dragenter", function(event) {
  console.log("overlay enter");
  throttle(() => {
    overlayEl.style.display = "block";
  }, true);
});
overlayEl.addEventListener("dragover", function(event) {
  event.preventDefault();
  console.log("overlay over");
  throttle(() => {
    overlayEl.style.display = "block";
  }, true);
});
overlayEl.addEventListener("dragleave", function(event) {
  console.log("overlay leave");
  throttle(() => {
    overlayEl.style.display = "block";
  }, true);
});

class Dnd {
  constructor({
    dragSelector = ".ui-drag",
    dropSelector = ".dropArea",
    onDragStart = function() {}
  }) {
    this.dragSelector = dragSelector;
    this.dropSelector = dropSelector;
    this.onDragStart = onDragStart;
    this.direction = null;
    this.currDragElem = null;
    this.currDropElem = null;
    this.init();
  }
  init() {
    this.dragstartEvent();
    this.dragendEvent();
    this.dragoverEvent();
    this.dragleaveEvent();
    this.dropEvent();
  }
  bindEvent(selector, event, callback) {
    Array.from(document.querySelectorAll(selector)).forEach(elem => {
      elem.addEventListener(event, function(event) {
        typeof callback === "function" && callback.call(this, event);
      });
    });
  }
  dragstartEvent() {
    this.bindEvent(this.dragSelector, "dragstart", event => {
      this.currDragElem = event.currentTarget;
    });
  }
  dragendEvent() {
    this.bindEvent(this.dragSelector, "dragend", event => {
      throttle(() => {
        this.currDragElem = null;
        overlay.hide();
      }, true);
    });
  }
  dragoverEvent() {
    this.bindEvent(this.dropSelector, "dragover", event => {
      let currentTarget = event.currentTarget;
      event.preventDefault();
      event.stopPropagation();
      console.log("over");
      throttle(() => {
        console.log("over>>>");
        this.currDropElem = event.target;
        this.direction = null;
        let { offsetLeft: baseLeft, offsetTop: baseTop } = getOffsetByBody(
          currentTarget
        );
        console.log("addClass");
        addClass(this.currDropElem, "s-dragover");
        if (
          this.currDropElem !== event.currentTarget &&
          this.currDropElem.className.indexOf("ui-drag") > -1
        ) {
          let currElemDetail = getElementDetail(this.currDropElem);
          this.direction = getPosition(
            this.currDropElem,
            event.offsetX,
            event.offsetY
          );
          switch (this.direction) {
            case "left":
              overlay.show({
                mode: "vertical",
                length: `${currElemDetail.height}px`,
                top: `${baseTop + currElemDetail.y}px`,
                left: `${baseLeft + currElemDetail.x}px`
              });
              break;
            case "right":
              overlay.show({
                mode: "vertical",
                length: `${currElemDetail.height}px`,
                top: `${baseTop + currElemDetail.y}px`,
                left: `${baseLeft + currElemDetail.x + currElemDetail.width}px`
              });
              break;
            case "top":
              overlay.show({
                length: `${currElemDetail.width}px`,
                top: `${baseTop + currElemDetail.y}px`,
                left: `${baseLeft + currElemDetail.x}px`
              });
              break;
            case "bottom":
              overlay.show({
                length: `${currElemDetail.width}px`,
                top: `${baseTop + currElemDetail.y + currElemDetail.height}px`,
                left: `${baseLeft + currElemDetail.x}px`
              });
              break;
            default:
              overlay.hide();
              break;
          }
        } else if (this.currDropElem.className.indexOf("dropArea") > -1) {
          let dragEls = Array.from(this.currDropElem.childNodes).filter(
            item =>
              item.nodeType === 1 && item.className.indexOf("ui-drag") > -1
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
    });
  }
  dragleaveEvent() {
    this.bindEvent(this.dropSelector, "dragleave", event => {
      event.stopPropagation();
      throttle(() => {
        removeClass(event.target, "s-dragover");
      }, true);
    });
  }
  dropEvent() {
    this.bindEvent(this.dropSelector, "drop", event => {
      event.stopPropagation();
      console.log(event.currentTarget);
      console.log(this.currDropElem);
      console.log(this.direction);
      console.log(this.currDragElem);
      removeClass(event.target, "s-dragover");
    });
  }
}

new Dnd({});

/**
 * 绑定拖拽目标
 *
 */
// Array.from(dragEls).forEach(dragEl => {
//   dragEl.addEventListener("dragstart", function(event) {});
//   dragEl.addEventListener("dragend", function(event) {
//     throttle(() => {
//       overlay.hide();
//     }, true);
//   });
// });

/**
 * 绑定放置目标
 *
 */
// Array.from(dropAreaEls).forEach(dropAreaEl => {
//   dropAreaEl.style.position = "relative";
//   let direction = null;
//   let currDropElem = null;
//   dropAreaEl.addEventListener("dragover", function(event) {
//     event.preventDefault();
//     event.stopPropagation();
//     console.log("over");
//     throttle(() => {
//       console.log("over>>>");
//       currDropElem = event.target;
//       direction = null;
//       let { offsetLeft: baseLeft, offsetTop: baseTop } = getOffsetByBody(
//         dropAreaEl
//       );
//       console.log("addClass");
//       addClass(currDropElem, "s-dragover");
//       if (
//         currDropElem !== event.currentTarget &&
//         currDropElem.className.indexOf("ui-drag") > -1
//       ) {
//         let currElemDetail = getElementDetail(currDropElem);
//         direction = getPosition(currDropElem, event.offsetX, event.offsetY);
//         if (direction === "left" || direction === "right") {
//           if (direction === "left") {
//             overlay.show({
//               mode: "vertical",
//               length: `${currElemDetail.height}px`,
//               top: `${baseTop + currElemDetail.y}px`,
//               left: `${baseLeft + currElemDetail.x}px`
//             });
//           } else {
//             overlay.show({
//               mode: "vertical",
//               length: `${currElemDetail.height}px`,
//               top: `${baseTop + currElemDetail.y}px`,
//               left: `${baseLeft + currElemDetail.x + currElemDetail.width}px`
//             });
//           }
//           overlayEl.style.display = "block";
//         } else if (direction === "top" || direction === "bottom") {
//           if (direction === "top") {
//             overlay.show({
//               length: `${currElemDetail.width}px`,
//               top: `${baseTop + currElemDetail.y}px`,
//               left: `${baseLeft + currElemDetail.x}px`
//             });
//           } else {
//             overlay.show({
//               length: `${currElemDetail.width}px`,
//               top: `${baseTop + currElemDetail.y + currElemDetail.height}px`,
//               left: `${baseLeft + currElemDetail.x}px`
//             });
//           }
//         } else {
//           overlay.hide();
//         }
//       } else if (currDropElem.className.indexOf("dropArea") > -1) {
//         let dragEls = Array.from(currDropElem.childNodes).filter(
//           item => item.nodeType === 1 && item.className.indexOf("ui-drag") > -1
//         );
//         if (dragEls.length > 0) {
//           let lastElemDetail = getElementDetail(dragEls[dragEls.length - 1]);
//           overlay.show({
//             length: `${lastElemDetail.width}px`,
//             top: `${baseTop + lastElemDetail.y + lastElemDetail.height}px`,
//             left: `${baseLeft + lastElemDetail.x}px`
//           });
//         }
//       }
//     });
//   });

//   dropAreaEl.addEventListener("dragleave", function(event) {
//     event.stopPropagation();
//     throttle(() => {
//       removeClass(event.target, "s-dragover");
//     }, true);
//   });

//   dropAreaEl.addEventListener("drop", function(event) {
//     event.stopPropagation();
//     console.log(dropAreaEl);
//     console.log(currDropElem);
//     console.log(direction);
//     removeClass(event.target, "s-dragover");
//   });
// });

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

/**
 * 节流
 *
 * @param: {String} param description
 * @return: {String} return
 */
function Throttle() {
  const DURATION = 150;
  let timer;
  let firstTime = true; //记录是否是第一次执行的flag

  return (fn, isReset = false) => {
    let args = arguments; //解决闭包传参问题

    if (firstTime || isReset) {
      //若是第一次，则直接执行
      fn.apply(this, args);
      if (isReset) {
        clearTimeout(timer);
        timer = null;
        firstTime = true;
      } else {
        return (firstTime = false);
      }
    }
    if (timer) {
      //定时器存在，说明有事件监听器在执行，直接返回
      return false;
    }
    timer = setTimeout(() => {
      clearTimeout(timer);
      timer = null;
      fn.apply(this, args);
    }, DURATION);
  };
}

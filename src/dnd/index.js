import "@/assets/styles/base.scss";
import Throttle from "./throttle";
import Overlay from "./overlay";
import uuidv4 from "uuid/v4";
import { addClass, removeClass } from "./common";

let throttle = new Throttle();

class Dnd {
  constructor(
    {
      dragSelector = ".ui-drag",
      dropSelector = ".dropArea",
      onDragStart = function() {}
    } = { dragSelector: ".ui-drag", dropSelector: ".dropArea" }
  ) {
    this.dragSelector = dragSelector;
    this.dropSelector = dropSelector;
    this.onDragStart = onDragStart;
    this.direction = null;
    this.currDragElem = null;
    this.currDropElem = null;
    this.throttle = new Throttle();
    this.overlayPlaceholder = null;
    this.overlayHovermask = null;
    this.init();
  }
  init() {
    this.createOverlay();
    this.mouseenterEvent();
    this.mouseleaveEvent();
    this.clickEvent();
    this.dragstartEvent();
    this.dragendEvent();
    this.dragoverEvent();
    this.dragleaveEvent();
    this.dropEvent();
  }
  createOverlay() {
    let overlay = Overlay.init();
    this.overlayPlaceholder = overlay.placeholder;
    this.overlayHovermask = overlay.hovermask;
    this.overlayActivemask = overlay.activemask;
    let overlayEl = this.overlayPlaceholder.elem;
    overlayEl.addEventListener("dragenter", function(event) {
      throttle(() => {
        overlayEl.style.display = "block";
      }, true);
    });
    overlayEl.addEventListener("dragover", function(event) {
      event.preventDefault();
      throttle(() => {
        overlayEl.style.display = "block";
      }, true);
    });
    overlayEl.addEventListener("dragleave", function(event) {
      throttle(() => {
        overlayEl.style.display = "block";
      }, true);
    });
  }
  bindEvent(selector, event, callback, useCapture = false) {
    Array.from(document.querySelectorAll(selector)).forEach(elem => {
      elem.addEventListener(
        event,
        function(event) {
          typeof callback === "function" && callback.call(this, event);
        },
        useCapture
      );
    });
  }
  mouseenterEvent() {
    this.bindEvent(
      `${this.dropSelector} ${this.dragSelector}`,
      "mouseenter",
      event => {
        let currentTarget = event.currentTarget;
        let currElemDetail = getElementDetail(currentTarget);
        let currElemOffset = getElementPageOffset(currentTarget);
        addClass(currentTarget, "s-mouseenter");
        this.overlayHovermask.show({
          left: currElemOffset.offsetLeft,
          top: currElemOffset.offsetTop,
          width: currElemDetail.width,
          height: currElemDetail.height
        });
      }
    );
  }
  mouseleaveEvent() {
    this.bindEvent(this.dragSelector, "mouseleave", event => {
      removeClass(event.currentTarget, "s-mouseenter");
      this.overlayHovermask.hide();
    });
  }
  clickEvent() {
    this.bindEvent(this.dragSelector, "click", event => {
      event.stopPropagation();
      let currentTarget = event.currentTarget;
      let currElemDetail = getElementDetail(currentTarget);
      let currElemOffset = getElementPageOffset(currentTarget);
      Array.from(document.querySelectorAll(this.dragSelector)).forEach(elem => {
        removeClass(elem, "s-active");
      });
      addClass(currentTarget, "s-active");
      this.overlayActivemask.show({
        left: currElemOffset.offsetLeft,
        top: currElemOffset.offsetTop,
        width: currElemDetail.width,
        height: currElemDetail.height
      });
    });
  }
  dragstartEvent() {
    this.bindEvent(this.dragSelector, "dragstart", event => {
      this.currDragElem = event.currentTarget;
      removeClass(event.currentTarget, "s-mouseenter");
      this.overlayHovermask.hide();
    });
  }
  dragendEvent() {
    this.bindEvent(this.dragSelector, "dragend", event => {
      throttle(() => {
        this.currDragElem = null;
        this.overlayPlaceholder.hide();
      }, true);
    });
  }
  dragoverEvent() {
    this.bindEvent(this.dropSelector, "dragover", event => {
      let currentTarget = event.currentTarget;
      event.preventDefault();
      event.stopPropagation();
      throttle(() => {
        this.currDropElem = event.target;
        this.direction = null;
        let { offsetLeft: baseLeft, offsetTop: baseTop } = getElementPageOffset(
          currentTarget
        );
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
              this.overlayPlaceholder.show({
                mode: "vertical",
                length: currElemDetail.height,
                top: baseTop + currElemDetail.y,
                left: baseLeft + currElemDetail.x
              });
              break;
            case "right":
              this.overlayPlaceholder.show({
                mode: "vertical",
                length: currElemDetail.height,
                top: baseTop + currElemDetail.y,
                left: baseLeft + currElemDetail.x + currElemDetail.width
              });
              break;
            case "top":
              this.overlayPlaceholder.show({
                length: currElemDetail.width,
                top: baseTop + currElemDetail.y,
                left: baseLeft + currElemDetail.x
              });
              break;
            case "bottom":
              this.overlayPlaceholder.show({
                length: currElemDetail.width,
                top: baseTop + currElemDetail.y + currElemDetail.height,
                left: baseLeft + currElemDetail.x
              });
              break;
            default:
              this.overlayPlaceholder.hide();
              break;
          }
        } else if (this.currDropElem.className.indexOf("dropArea") > -1) {
          let dragEls = Array.from(this.currDropElem.childNodes).filter(
            item =>
              item.nodeType === 1 && item.className.indexOf("ui-drag") > -1
          );
          if (dragEls.length > 0) {
            let lastElemDetail = getElementDetail(dragEls[dragEls.length - 1]);
            this.overlayPlaceholder.show({
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
      const id = getElementId(this.currDragElem);
      if (id === null) {
        this.currDragElem.setAttribute("data-id", uuidv4());
      }
      console.log(event.currentTarget);
      console.log(this.currDropElem);
      console.log(this.direction);
      console.log(this.currDragElem);
      removeClass(event.target, "s-dragover");
    });
  }
}

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

/**
 * 获取元素相对页面的offset
 *
 */
function getElementPageOffset(element) {
  var actualLeft = element.offsetLeft;
  var actualTop = element.offsetTop;
  var current = element.offsetParent;

  while (current !== null) {
    actualLeft += current.offsetLeft;
    actualTop += current.offsetTop;
    current = current.offsetParent;
  }
  return {
    offsetLeft: actualLeft,
    offsetTop: actualTop
  };
}

/**
 * 获取元素id
 *
 */
function getElementId(element) {
  return element.getAttribute("data-id") || null;
}

export default Dnd;

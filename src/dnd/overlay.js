/**
 * @name: Overlay
 * @description: 拖拽遮罩
 * @author: lizijie
 * @update:
 */
import { addClass, removeClass } from "./common";

let placeholder = {
  elem: null,
  width: 2,
  createElement(
    { className = "ui-overlay-placeholder", color = "#3396fb" } = {
      className: "ui-overlay-placeholder",
      color: "#3396fb"
    }
  ) {
    this.elem = document.createElement("div");
    this.elem.className = className;
    this.elem.style.color = color;
    this.elem.style.position = "absolute";
    this.elem.style.display = "none";
    document.body.appendChild(this.elem);
  },
  show({ top, left, length, mode = "horizontal" }) {
    this.elem.style.top = combinePx(top);
    this.elem.style.left = combinePx(left);
    if (mode === "vertical") {
      this.elem.style.width = combinePx(this.width);
      this.elem.style.height = combinePx(length);
      removeClass(this.elem, "s-horizontal");
      addClass(this.elem, "s-vertical");
    } else {
      this.elem.style.width = combinePx(length);
      this.elem.style.height = combinePx(this.width);
      removeClass(this.elem, "s-vertical");
      addClass(this.elem, "s-horizontal");
    }
    this.elem.style.display = "block";
  },
  hide() {
    this.elem.style.display = "none";
  }
};

let hovermask = {
  elem: null,
  topLineEl: null,
  bottomLineEl: null,
  leftLineEl: null,
  rightLineEl: null,
  width: 2,
  createElement(
    { className = "ui-overlay-hovermask", color = "#3396fb" } = {
      className: "ui-overlay-hovermask",
      color: "#3396fb"
    }
  ) {
    this.elem = document.createElement("div");
    this.elem.className = className;
    this.elem.style.color = color;
    this.elem.style.opacity = "0.5";
    this.elem.style.position = "absolute";
    this.elem.style.width = "0";
    this.elem.style.height = "0";
    this.elem.style.display = "none";
    this.topLineEl = document.createElement("div");
    this.bottomLineEl = document.createElement("div");
    this.leftLineEl = document.createElement("div");
    this.rightLineEl = document.createElement("div");
    this.topLineEl.className = `${className}-line ${className}-topline`;
    this.bottomLineEl.className = `${className}-line ${className}-bottomline`;
    this.leftLineEl.className = `${className}-line ${className}-leftline`;
    this.rightLineEl.className = `${className}-line ${className}-rightline`;
    this.elem.appendChild(this.topLineEl);
    this.elem.appendChild(this.bottomLineEl);
    this.elem.appendChild(this.leftLineEl);
    this.elem.appendChild(this.rightLineEl);
    document.body.appendChild(this.elem);
  },
  show({ top, left, width, height }) {
    let topPx = combinePx(top);
    let leftPx = combinePx(left);
    let widthPx = combinePx(width);
    let heightPx = combinePx(height);
    let borderWidthPx = combinePx(this.width);
    this.topLineEl.style.width = widthPx;
    this.topLineEl.style.borderTopWidth = borderWidthPx;
    this.topLineEl.style.top = topPx;
    this.topLineEl.style.left = leftPx;
    this.bottomLineEl.style.width = widthPx;
    this.bottomLineEl.style.borderTopWidth = borderWidthPx;
    this.bottomLineEl.style.top = combinePx(top + height);
    this.bottomLineEl.style.left = leftPx;
    this.leftLineEl.style.width = heightPx;
    this.leftLineEl.style.borderTopWidth = borderWidthPx;
    this.leftLineEl.style.top = topPx;
    this.leftLineEl.style.left = combinePx(left + this.width);
    this.rightLineEl.style.width = heightPx;
    this.rightLineEl.style.borderTopWidth = borderWidthPx;
    this.rightLineEl.style.top = topPx;
    this.rightLineEl.style.left = combinePx(left + width);
    this.elem.style.display = "block";
  },
  hide() {
    this.elem.style.display = "none";
  },
  bindEvent() {},
  mouseleaveEvent() {
    this.elem.addEventListener("mouseleave", event => {
      this.hide();
    });
  }
};

/**
 * 拼接px
 *
 * @param: {Number} number 值
 */
function combinePx(number) {
  return (number + "").indexOf("px") > -1 ? number : `${number}px`;
}

function init() {
  placeholder.createElement();
  hovermask.createElement();
  return {
    placeholder,
    hovermask
  };
}

export default {
  init
};

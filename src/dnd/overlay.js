/**
 * @name: Overlay
 * @description: 拖拽遮罩
 * @author: lizijie
 * @update:
 */
import { addClass, removeClass } from './common'

/**
 * 占位遮罩层
 *
 */
let placeholder = {
  elem: null,
  borderWidth: 2,
  createElement(
    { className = 'dnd-overlay-placeholder', containerSelector = 'body' } = {
      className: 'dnd-overlay-placeholder',
      containerSelector: 'body'
    }
  ) {
    this.elem = document.createElement('div')
    this.elem.className = className
    this.elem.style.display = 'none'
    document.querySelector(containerSelector).appendChild(this.elem)
  },
  show({ top, left, length, mode = 'horizontal' }) {
    this.elem.style.top = combinePx(top)
    this.elem.style.left = combinePx(left)
    if (mode === 'vertical') {
      this.elem.style.width = combinePx(this.borderWidth)
      this.elem.style.height = combinePx(length)
      removeClass(this.elem, 's-horizontal')
      addClass(this.elem, 's-vertical')
    } else {
      this.elem.style.width = combinePx(length)
      this.elem.style.height = combinePx(this.borderWidth)
      removeClass(this.elem, 's-vertical')
      addClass(this.elem, 's-horizontal')
    }
    this.elem.style.display = 'block'
  },
  hide() {
    this.elem.style.display = 'none'
  }
}

/**
 * 鼠标经过遮罩层
 *
 */
let hovermask = {
  elem: null,
  topLineEl: null,
  bottomLineEl: null,
  leftLineEl: null,
  rightLineEl: null,
  borderWidth: 1,
  createElement(
    { className = 'dnd-overlay-hovermask', containerSelector = 'body' } = {
      className: 'dnd-overlay-hovermask',
      containerSelector: 'body'
    }
  ) {
    this.elem = document.createElement('div')
    this.elem.className = className
    this.elem.style.display = 'none'
    this.topLineEl = document.createElement('div')
    this.bottomLineEl = document.createElement('div')
    this.leftLineEl = document.createElement('div')
    this.rightLineEl = document.createElement('div')
    this.topLineEl.className = `${className}-line ${className}-topline`
    this.bottomLineEl.className = `${className}-line ${className}-bottomline`
    this.leftLineEl.className = `${className}-line ${className}-leftline`
    this.rightLineEl.className = `${className}-line ${className}-rightline`
    this.elem.appendChild(this.topLineEl)
    this.elem.appendChild(this.bottomLineEl)
    this.elem.appendChild(this.leftLineEl)
    this.elem.appendChild(this.rightLineEl)
    document.querySelector(containerSelector).appendChild(this.elem)
  },
  show({ top, left, width, height }) {
    let topPx = combinePx(top)
    let leftPx = combinePx(left)
    let widthPx = combinePx(width)
    let heightPx = combinePx(height)
    this.topLineEl.style.width = widthPx
    this.topLineEl.style.top = topPx
    this.topLineEl.style.left = leftPx
    this.bottomLineEl.style.width = widthPx
    this.bottomLineEl.style.top = combinePx(top + height)
    this.bottomLineEl.style.left = leftPx
    this.leftLineEl.style.width = heightPx
    this.leftLineEl.style.top = topPx
    this.leftLineEl.style.left = combinePx(left + this.borderWidth)
    this.rightLineEl.style.width = heightPx
    this.rightLineEl.style.top = topPx
    this.rightLineEl.style.left = combinePx(left + width)
    this.elem.style.display = 'block'
  },
  hide() {
    this.elem.style.display = 'none'
  }
}

/**
 * 激活遮罩层
 *
 */
let activemask = {
  elem: null,
  topLineEl: null,
  bottomLineEl: null,
  leftLineEl: null,
  rightLineEl: null,
  buttonGroupEl: null,
  borderWidth: 2,
  createElement(
    { className = 'dnd-overlay-activemask', containerSelector = 'body' } = {
      className: 'dnd-overlay-activemask',
      containerSelector: 'body'
    }
  ) {
    this.elem = document.createElement('div')
    this.elem.className = className
    this.elem.style.display = 'none'
    this.topLineEl = document.createElement('div')
    this.bottomLineEl = document.createElement('div')
    this.leftLineEl = document.createElement('div')
    this.rightLineEl = document.createElement('div')
    this.buttonGroupEl = document.createElement('div')
    this.topLineEl.className = `${className}-line ${className}-topline`
    this.bottomLineEl.className = `${className}-line ${className}-bottomline`
    this.leftLineEl.className = `${className}-line ${className}-leftline`
    this.rightLineEl.className = `${className}-line ${className}-rightline`
    this.buttonGroupEl.className = `${className}-buttons`
    this.buttonGroupEl.innerHTML = '<span>复制</span> | <span>删除</span>'
    this.elem.appendChild(this.topLineEl)
    this.elem.appendChild(this.bottomLineEl)
    this.elem.appendChild(this.leftLineEl)
    this.elem.appendChild(this.rightLineEl)
    this.elem.appendChild(this.buttonGroupEl)
    document.querySelector(containerSelector).appendChild(this.elem)
  },
  show({ top, left, width, height }) {
    let topPx = combinePx(top)
    let leftPx = combinePx(left)
    let widthPx = combinePx(width)
    let heightPx = combinePx(height)
    this.topLineEl.style.width = widthPx
    this.topLineEl.style.top = topPx
    this.topLineEl.style.left = leftPx
    this.bottomLineEl.style.width = widthPx
    this.bottomLineEl.style.top = combinePx(top + height)
    this.bottomLineEl.style.left = leftPx
    this.leftLineEl.style.width = heightPx
    this.leftLineEl.style.top = topPx
    this.leftLineEl.style.left = combinePx(left + this.borderWidth)
    this.rightLineEl.style.width = heightPx
    this.rightLineEl.style.top = topPx
    this.rightLineEl.style.left = combinePx(left + width)
    this.buttonGroupEl.style.left = combinePx(left + width - 80)
    if (top > 30) {
      this.buttonGroupEl.style.top = combinePx(top - 30)
    } else {
      this.buttonGroupEl.style.top = combinePx(top + height)
    }
    this.elem.style.display = 'block'
  },
  hide() {
    this.elem.style.display = 'none'
  }
}

/**
 * 拖拽图片
 *
 */
let dragCanvas = {}

/**
 * 拼接px
 *
 * @param: {Number} number 值
 */
function combinePx(number) {
  return (number + '').indexOf('px') > -1 ? number : `${number}px`
}

function init({ containerSelector } = {}) {
  placeholder.createElement({ containerSelector })
  hovermask.createElement({ containerSelector })
  activemask.createElement({ containerSelector })
  return {
    placeholder,
    hovermask,
    activemask
  }
}

export default {
  init
}

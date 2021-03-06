/**
 * @name: Overlay
 * @description: 拖拽遮罩
 * @author: lizijie
 * @update:
 */
import Utils from '@/helper/utils'
import html2canvas from 'html2canvas'

/**
 * 占位遮罩层
 *
 */
let placeholder = {
  elem: null,
  borderWidth: 2,
  createElement (
    { className = 'dnd-overlay-placeholder', containerEl } = {
      className: 'dnd-overlay-placeholder'
    }
  ) {
    this.elem = document.createElement('div')
    this.elem.className = className
    this.elem.style.display = 'none'
    containerEl.appendChild(this.elem)
  },
  show ({ top, left, length, mode = 'horizontal' }) {
    this.elem.style.top = combinePx(top)
    this.elem.style.left = combinePx(left)
    if (mode === 'vertical') {
      this.elem.style.width = combinePx(this.borderWidth)
      this.elem.style.height = combinePx(length)
      Utils.removeClass(this.elem, 's-horizontal')
      Utils.addClass(this.elem, 's-vertical')
    } else {
      this.elem.style.width = combinePx(length)
      this.elem.style.height = combinePx(this.borderWidth)
      Utils.removeClass(this.elem, 's-vertical')
      Utils.addClass(this.elem, 's-horizontal')
    }
    this.elem.style.display = 'block'
  },
  hide () {
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
  createElement (
    { className = 'dnd-overlay-hovermask', containerEl } = {
      className: 'dnd-overlay-hovermask'
    }
  ) {
    this.elem = document.createElement('div')
    this.elem.className = className
    this.elem.style.display = 'none'
    containerEl.appendChild(this.elem)
  },
  show ({ top, left, width, height }) {
    let topPx = combinePx(top)
    let leftPx = combinePx(left)
    let widthPx = combinePx(width)
    let heightPx = combinePx(height)
    this.elem.style.width = widthPx
    this.elem.style.height = heightPx
    this.elem.style.transform = `translate(${leftPx},${topPx})`
    this.elem.style.display = 'block'
  },
  hide () {
    this.elem.style.display = 'none'
  }
}

/**
 * 激活遮罩层
 *
 */
let activemask = {
  elem: null,
  activeId: null,
  parentId: null,
  topLineEl: null,
  bottomLineEl: null,
  leftLineEl: null,
  rightLineEl: null,
  buttonGroupEl: null,
  borderWidth: 2,
  status: 1, // 0-显示 1-隐藏
  createElement (
    {
      className = 'dnd-overlay-activemask',
      containerEl,
      onDelete = function () {},
      onCopy = function () {}
    } = {
      className: 'dnd-overlay-activemask'
    }
  ) {
    this.onDelete = onDelete
    this.onCopy = onCopy
    this.elem = document.createElement('div')
    this.elem.className = className
    this.elem.style.display = 'none'
    this.buttonGroupEl = document.createElement('div')
    this.buttonGroupEl.className = `${className}-buttons`
    this.buttonGroupEl.innerHTML = `<span class="${className}-copy">复制</span> | <span class="${className}-delete">删除</span>`
    this.elem.appendChild(this.buttonGroupEl)
    this.containerEl = containerEl
    containerEl.appendChild(this.elem)
    this.bindEvent()
  },
  show ({ top, left, width, height, activeId, parentId }) {
    let topPx = combinePx(top)
    let leftPx = combinePx(left)
    let widthPx = combinePx(width)
    let heightPx = combinePx(height)
    this.activeId = activeId
    this.parentId = parentId
    this.buttonGroupEl.style.left = combinePx(width - 80)
    if (top > 30) {
      this.buttonGroupEl.style.top = combinePx(-30)
    } else {
      this.buttonGroupEl.style.top = combinePx(height)
    }
    this.elem.style.width = widthPx
    this.elem.style.height = heightPx
    this.elem.style.transform = `translate(${leftPx},${topPx})`
    this.elem.style.display = 'block'
    this.status = 0
  },
  hide () {
    this.elem.style.display = 'none'
    this.status = 1
  },
  bindEvent () {
    let deleteButtonEl = this.containerEl.querySelector(
      `.${this.elem.className}-delete`
    )
    let copyButtonEl = this.containerEl.querySelector(
      `.${this.elem.className}-copy`
    )
    deleteButtonEl.addEventListener('click', event => {
      event.stopPropagation()
      typeof this.onDelete === 'function' &&
        this.onDelete(this.activeId, this.parentId, func => {
          this.hide()
          typeof func === 'function' && func()
        })
    })
    copyButtonEl.addEventListener('click', event => {
      event.stopPropagation()
      let dragId = Utils.guid()
      typeof this.onCopy === 'function' &&
        this.onCopy(this.parentId, dragId, this.activeId)
      this.hide()
    })
  }
}

/**
 * 拖拽图片
 *
 */
let dragcanvas = {
  elem: null,
  ctx: null,
  createElement ({ containerEl }) {
    this.elem = document.createElement('canvas')
    this.elem.style.position = 'relative'
    this.elem.style.zIndex = 10
    this.elem.style.left = '-1000px'
    this.ctx = this.elem.getContext('2d')
    containerEl.appendChild(this.elem)
  },
  change (name) {
    let width = Math.max(name.length * 30, 200)
    this.elem.width = width
    this.elem.height = '40'
    this.ctx.fillStyle = '#ddd'
    this.ctx.fillRect(0, 0, width, 40)
    this.ctx.fillStyle = '#333'
    this.ctx.font = '14px Georgia'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(name, width / 2, 20)
  }
}

/**
* 模糊层
*
*/
let fuzzylayer = {
  elem: null,
  topLineEl: null,
  bottomLineEl: null,
  leftLineEl: null,
  rightLineEl: null,
  borderWidth: 1,
  createElement (
    { className = 'dnd-overlay-fuzzylayer', containerEl } = {
      className: 'dnd-overlay-fuzzylayer'
    }
  ) {
    this.elem = document.createElement('div')
    this.elem.className = className
    this.elem.style.display = 'none'
    containerEl.appendChild(this.elem)
  },
  async show ({ elem, top, left, width, height }) {
    let topPx = combinePx(top)
    let leftPx = combinePx(left)
    let widthPx = combinePx(width)
    let heightPx = combinePx(height)
    this.elem.innerHTML = ''
    this.elem.appendChild(elem.cloneNode(true))
    this.elem.style.width = widthPx
    this.elem.style.height = heightPx
    this.elem.style.transform = `translate(${leftPx},${topPx})`
    this.elem.style.display = 'block'
  },
  async getDragElemImage (elem) {
    let canvas = await html2canvas(elem)
    return canvas.toDataURL()
  },
  hide () {
    this.elem.style.display = 'none'
  }
}

/**
 * 拼接px
 *
 * @param: {Number} number 值
 */
function combinePx (number) {
  return (number + '').indexOf('px') > -1 ? number : `${number}px`
}

/**
 * 创建container
 *
 */
function createContainer (containerSelector = 'body') {
  let containerEl = document.createElement('div')
  containerEl.className = 'fd-dnd-overlay'
  document.querySelector(containerSelector).appendChild(containerEl)
  return containerEl
}

function init ({
  containerSelector,
  onDelete = function () {},
  onCopy = function () {}
} = {}) {
  if (document.querySelector('.fd-dnd-overlay')) {
    document
      .querySelector(containerSelector)
      .removeChild(document.querySelector('.fd-dnd-overlay'))
  }
  let containerEl = createContainer(containerSelector)
  placeholder.createElement({ containerEl })
  hovermask.createElement({ containerEl })
  activemask.createElement({ containerEl, onDelete, onCopy })
  dragcanvas.createElement({ containerEl })
  fuzzylayer.createElement({ containerEl })
  return {
    placeholder,
    hovermask,
    activemask,
    dragcanvas,
    fuzzylayer
  }
}

export default {
  init
}

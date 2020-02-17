import './dnd.scss'
import Throttle from './throttle'
import Overlay from './overlay'
import Utils from '@/helper/utils'

let throttle = new Throttle()

class Dnd {
  constructor (
    {
      dragSelector = '.dnd-drag',
      dropSelector = '.dnd-droparea',
      dropContainerSelector,
      onDragbefore = function () {},
      onDragstart = function () {},
      onDragend = function () {},
      onDragover = function () {},
      onDragleave = function () {},
      onDrop = function () {},
      onActive = function () {},
      onDelete = function () {},
      onCopy = function () {}
    } = { dragSelector: '.dnd-drag', dropSelector: '.dnd-droparea' }
  ) {
    this.dragSelector = dragSelector
    this.dropSelector = dropSelector
    this.dropContainerSelector = dropContainerSelector
    this.onDragbefore = onDragbefore
    this.onDragstart = onDragstart
    this.onDragend = onDragend
    this.onDragover = onDragover
    this.onDragleave = onDragleave
    this.onDrop = onDrop
    this.onActive = onActive
    this.onDelete = onDelete
    this.onCopy = onCopy
    this.direction = null
    this.currDragElem = null
    this.relativeDragElem = null
    this.currActiveElem = null
    this.overlayPlaceholder = null
    this.overlayHovermask = null
    this.overlayFuzzylayer = null
    this.init()
    return this
  }
  init () {
    this.initDraggable()
    this.createOverlay()
    this.mouseoverEvent()
    this.mouseoutEvent()
    this.clickEvent()
    this.dragstartEvent()
    this.dragendEvent()
    this.dragoverEvent()
    this.dragleaveEvent()
    this.dropEvent()
    this.resizeEvent()
    if (this.currActiveElem) {
      this.activeHandle(this.currActiveElem)
    }
  }
  initDraggable () {
    Array.from(document.querySelectorAll(this.dragSelector)).forEach(elem => {
      let elemPosition = getComputedStyle(elem).getPropertyValue('position')
      elem.setAttribute('draggable', true)
      elemPosition === 'static' && (elem.style.position = 'relative')
    })
  }
  createOverlay () {
    let overlay = Overlay.init({
      containerSelector: this.dropContainerSelector,
      onDelete: this.onDelete,
      onCopy: this.onCopy
    })
    this.overlayPlaceholder = overlay.placeholder
    this.overlayHovermask = overlay.hovermask
    this.overlayActivemask = overlay.activemask
    this.overlayDragcanvas = overlay.dragcanvas
    this.overlayFuzzylayer = overlay.fuzzylayer
    let overlayPlaceholderEl = this.overlayPlaceholder.elem
    if (this.dropContainerSelector !== void 0) {
      let containerEl = document.querySelector(this.dropContainerSelector)
      let containerPosition = getComputedStyle(containerEl).getPropertyValue(
        'position'
      )
      if (containerEl && containerPosition === 'static') {
        containerEl.style.position = 'relative'
      }
    }
    overlayPlaceholderEl.addEventListener('dragenter', function (event) {
      throttle(() => {
        overlayPlaceholderEl.style.display = 'block'
      }, true)
    })
    overlayPlaceholderEl.addEventListener('dragover', function (event) {
      event.preventDefault()
      throttle(() => {
        overlayPlaceholderEl.style.display = 'block'
      }, true)
    })
    overlayPlaceholderEl.addEventListener('dragleave', function (event) {
      throttle(() => {
        overlayPlaceholderEl.style.display = 'block'
      }, true)
    })
  }
  bindEvent (selector, event, func, useCapture = false) {
    Array.from(document.querySelectorAll(selector)).forEach(elem => {
      elem.addEventListener(event, func, useCapture)
    })
  }
  removeEvent (selector, event, func, useCapture = false) {
    Array.from(document.querySelectorAll(selector)).forEach(elem => {
      elem.removeEventListener(event, func, useCapture)
    })
  }
  mouseoverEvent () {
    this.bindEvent(
      `${this.dropSelector} ${this.dragSelector}`,
      'mouseover',
      event => {
        event.stopPropagation()
        if (this.currDragElem === null) {
          let currentTarget = event.currentTarget
          let currElemDetail = getElementDetail(currentTarget)
          let currElemOffset = getElementContainerOffset(
            currentTarget,
            this.dropContainerSelector
          )
          this.overlayHovermask.show({
            left: currElemOffset.offsetLeft,
            top: currElemOffset.offsetTop,
            width: currElemDetail.width,
            height: currElemDetail.height
          })
        }
      }
    )
  }
  mouseoutEvent () {
    this.bindEvent(
      `${this.dropSelector} ${this.dragSelector}`,
      'mouseout',
      event => {
        Utils.removeClass(event.currentTarget, 's-mouseover')
        this.overlayHovermask.hide()
      }
    )
  }
  clickEvent () {
    this.bindEvent(
      `${this.dropSelector} ${this.dragSelector}`,
      'click',
      event => {
        event.stopPropagation()
        this.activeHandle(event.currentTarget)
      }
    )
  }
  activeHandle (elem, resize = false) {
    let activeId = getElementId(this.currActiveElem)
    if (elem && (this.currActiveElem !== elem || resize || this.overlayActivemask.status === 1)) {
      this.currActiveElem = elem
      let currElemDetail = getElementDetail(this.currActiveElem)
      let currElemOffset = getElementContainerOffset(
        this.currActiveElem,
        this.dropContainerSelector
      )
      let parentId = getElementId(findDragItem(this.currActiveElem))
      Array.from(document.querySelectorAll(this.dragSelector)).forEach(elem => {
        Utils.removeClass(elem, 's-active')
      })
      Utils.addClass(this.currActiveElem, 's-active')
      activeId = getElementId(this.currActiveElem)
      this.overlayActivemask.show({
        left: currElemOffset.offsetLeft,
        top: currElemOffset.offsetTop,
        width: currElemDetail.width,
        height: currElemDetail.height,
        activeId,
        parentId
      })
    } else if (elem === null) {
      activeId = null
    }
    typeof this.onActive === 'function' && this.onActive(activeId, event)
  }
  dragstartEvent () {
    this.bindEvent(this.dragSelector, 'dragstart', event => {
      event.stopPropagation()
      this.currDragElem = event.currentTarget
      let dragId = getElementId(this.currDragElem)
      let type = 'change'
      let index = null
      if (dragId === null) {
        type = 'add'
        index = this.currDragElem.getAttribute('data-key')
      }
      if (type === 'change') {
        let currElemDetail = getElementDetail(this.currDragElem)
        let currElemOffset = getElementContainerOffset(
          this.currDragElem,
          this.dropContainerSelector
        )
        this.overlayFuzzylayer.show({
          elem: this.currDragElem,
          left: currElemOffset.offsetLeft,
          top: currElemOffset.offsetTop,
          width: currElemDetail.width,
          height: currElemDetail.height
        })
      }
      if (typeof this.onDragbefore === 'function') {
        this.onDragbefore({ type, dragId, index }, name => {
          this.overlayDragcanvas.change(name || '拖拽中组件')
          event.dataTransfer.setDragImage(this.overlayDragcanvas.elem, 30, 20)
        })
      }
      Utils.removeClass(this.currDragElem, 's-mouseover')
      this.overlayHovermask.hide()
      this.overlayActivemask.hide()
      typeof this.onDragstart === 'function' && this.onDragstart(event)
    })
  }
  dragendEvent () {
    this.bindEvent(this.dragSelector, 'dragend', event => {
      throttle(() => {
        this.currDragElem = null
        this.overlayPlaceholder.hide()
        this.overlayFuzzylayer.hide()
        if (this.currActiveElem) {
          this.activeHandle(this.currActiveElem)
        }
        typeof this.onDragend === 'function' && this.onDragend(event)
      }, true)
    })
  }
  dragoverEvent () {
    this.bindEvent(this.dropSelector, 'dragover', event => {
      event.preventDefault()
      event.stopPropagation()
      let currentTarget = event.currentTarget
      throttle(() => {
        let currDropElem = event.target
        let {
          offsetLeft: baseLeft,
          offsetTop: baseTop
        } = getElementContainerOffset(currentTarget, this.dropContainerSelector)
        this.relativeDragElem = findDragItem(event.target, true)
        let { offsetX, offsetY } = findDragOffset(event)
        this.direction = null
        if (this.relativeDragElem) {
          Utils.addClass(this.relativeDragElem, 's-dragover')
        }
        Utils.addClass(currentTarget, 's-dragover')
        if (this.relativeDragElem && currDropElem !== currentTarget) {
          let currElemDetail = getElementDetail(this.relativeDragElem)
          this.direction = getPosition(this.relativeDragElem, offsetX, offsetY)
          switch (this.direction) {
            case 'left':
              this.overlayPlaceholder.show({
                mode: 'vertical',
                length: currElemDetail.height,
                top: baseTop + currElemDetail.y,
                left: baseLeft + currElemDetail.x
              })
              break
            case 'right':
              this.overlayPlaceholder.show({
                mode: 'vertical',
                length: currElemDetail.height,
                top: baseTop + currElemDetail.y,
                left: baseLeft + currElemDetail.x + currElemDetail.width - this.overlayPlaceholder.borderWidth
              })
              break
            case 'top':
              this.overlayPlaceholder.show({
                length: currElemDetail.width,
                top: baseTop + currElemDetail.y,
                left: baseLeft + currElemDetail.x
              })
              break
            case 'bottom':
              this.overlayPlaceholder.show({
                length: currElemDetail.width,
                top: baseTop + currElemDetail.y + currElemDetail.height - this.overlayPlaceholder.borderWidth,
                left: baseLeft + currElemDetail.x
              })
              break
            default:
              this.overlayPlaceholder.hide()
              break
          }
        } else if (
          Array.from(document.querySelectorAll(this.dropSelector)).includes(
            currDropElem
          )
        ) {
          let dragEls = Array.from(currDropElem.childNodes).filter(
            item =>
              item.nodeType === 1 && item.getAttribute('draggable') === 'true'
          )
          if (dragEls.length > 0) {
            let lastElem = dragEls[dragEls.length - 1]
            let lastElemDetail = getElementDetail(lastElem)
            this.overlayPlaceholder.show({
              length: `${lastElemDetail.width}px`,
              top: `${baseTop + lastElemDetail.y + lastElemDetail.height}px`,
              left: `${baseLeft + lastElemDetail.x}px`
            })
            this.relativeDragElem = lastElem
            this.direction = 'bottom'
          }
        }
        typeof this.onDragover === 'function' && this.onDragover(event)
      })
    })
  }
  dragleaveEvent () {
    this.bindEvent(this.dropSelector, 'dragleave', event => {
      event.stopPropagation()
      throttle(() => {
        Utils.removeClass(event.target, 's-dragover')
        typeof this.onDragleave === 'function' && this.onDragleave(event)
      }, true)
    })
  }
  dropEvent () {
    this.bindEvent(this.dropSelector, 'drop', event => {
      event.stopPropagation()
      let dragId = getElementId(this.currDragElem)
      let type = 'change'
      let index = null
      if (dragId === null) {
        type = 'add'
        dragId = Utils.guid()
        index = this.currDragElem.getAttribute('data-key')
      }
      // 放置目标是否布局控件
      let parentId = getElementId(findDragItem(event.currentTarget))
      // 放置位置相对于的拖拽项目
      let siblingId = getElementId(this.relativeDragElem)
      // 放置位置
      let relativePos =
        this.direction === 'left' || this.direction === 'top' ? 'prev' : 'next'
      Utils.removeClass(event.target, 's-dragover')
      typeof this.onDrop === 'function' &&
        this.onDrop(
          {
            type,
            parentId,
            dragId,
            siblingId,
            relativePos,
            index: +index
          },
          event
        )
    })
  }
  resizeEvent () {
    window.addEventListener('resize', event => {
      if (this.currActiveElem) {
        this.activeHandle(this.currActiveElem, true)
      }
    })
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
function getPosition (elem, offsetX, offsetY) {
  const { width, height } = getElementDetail(elem)
  const THRESHOLD = 20
  let direction = null
  if (width > height) {
    let verticalThreshold = height / 2
    let widthPos = [0, THRESHOLD, width - THRESHOLD, width]
    let heightPos = [0, verticalThreshold, height - verticalThreshold, height]
    let index = widthPos.findIndex(val => val > offsetX) - 1
    direction = ['left', null, 'right'][index]
    if (direction === null) {
      let index = heightPos.findIndex(val => val > offsetY) - 1
      direction = ['top', null, 'bottom'][index]
    }
  } else {
    let horizontalThreshold = width / 2
    let widthPos = [0, horizontalThreshold, width - horizontalThreshold, width]
    let heightPos = [0, THRESHOLD, height - THRESHOLD, height]
    let index = heightPos.findIndex(val => val > offsetY) - 1
    direction = ['top', null, 'bottom'][index]
    if (direction === null) {
      let index = widthPos.findIndex(val => val > offsetX) - 1
      direction = ['left', null, 'right'][index]
    }
  }
  return direction
}

/**
 * 获取元素信息
 *
 */
function getElementDetail (elem) {
  const x = elem.offsetLeft
  const y = elem.offsetTop
  const width = elem.offsetWidth
  const height = elem.offsetHeight
  return { width, height, x, y }
}

/**
 * 获取元素相对container的offset
 *
 */
function getElementContainerOffset (elem, containerSelector) {
  let actualLeft = 0
  let actualTop = 0
  let current = elem
  let containerEl = document.querySelector(containerSelector)
  while (current && current !== containerEl) {
    actualLeft += current.offsetLeft
    actualTop += current.offsetTop
    current = current.offsetParent
  }
  return {
    offsetLeft: actualLeft,
    offsetTop: actualTop
  }
}

/**
 * 获取元素id
 *
 */
function getElementId (elem) {
  return (elem && elem.id) || null
}

/**
 * 查找放置目标所在拖拽项目
 *
 */
function findDragItem (elem, includeSelf = false) {
  let current = includeSelf ? elem : elem.parentNode
  let parentDragItem = null
  while (current && current.tagName !== 'BODY') {
    if (current.getAttribute('draggable') === 'true') {
      parentDragItem = current
      break
    }
    current = current.parentNode
  }
  return parentDragItem
}

/**
 * 查找鼠标坐在拖拽项目坐标
 *
 */
function findDragOffset (event) {
  let current = event.target
  let offsetX = event.offsetX
  let offsetY = event.offsetY
  while (current && current.tagName !== 'BODY') {
    if (current.getAttribute('draggable') === 'true') {
      break
    }
    offsetX += current.offsetLeft
    offsetY += current.offsetTop
    current = current.parentNode
  }
  return {
    offsetX,
    offsetY
  }
}

export default Dnd

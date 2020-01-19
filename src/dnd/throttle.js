/**
 * 节流
 *
 * @param: {Number} duration 间隔时长
 * @return: {Function} 节流方法
 *    @param: {Function} fn 函数
 *    @param: {Boolean} isReset 是否重置
 */
const DURATION = 150
export default class Throttle {
  constructor ({ duration = DURATION } = { duration: DURATION }) {
    this.duration = duration
    this.timer = null
    this.firstTime = true // 记录是否是第一次执行的flag
    return this.handler.bind(this)
  }
  handler (fn, isReset = false) {
    let args = arguments // 解决闭包传参问题

    if (this.firstTime || isReset) {
      // 若是第一次，则直接执行
      fn.apply(this, args)
      if (isReset) {
        clearTimeout(this.timer)
        this.timer = null
        this.firstTime = true
      } else {
        return (this.firstTime = false)
      }
    }
    if (this.timer) {
      // 定时器存在，说明有事件监听器在执行，直接返回
      return false
    }
    this.timer = setTimeout(() => {
      clearTimeout(this.timer)
      this.timer = null
      fn.apply(this, args)
    }, this.duration)
  }
}

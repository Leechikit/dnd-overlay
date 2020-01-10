/**
 * 增加类名
 *
 * @param: {String} param description
 * @return: {String} return
 */
export function addClass(elem, name) {
  let classArrs = elem.className.split(' ')
  if (!classArrs.includes(name)) {
    classArrs.push(name)
    elem.className = classArrs.join(' ')
  }
}

/**
 * 移出类名
 *
 * @param: {String} param description
 * @return: {String} return
 */
export function removeClass(elem, name) {
  let classArrs = elem.className.split(' ')
  let index = classArrs.findIndex(val => val === name)
  if (index > -1) {
    classArrs.splice(index, 1)
    elem.className = classArrs.join(' ')
  }
}

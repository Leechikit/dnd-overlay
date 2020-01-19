import uuid4 from 'uuid/v4'
import uuid5 from 'uuid/v5'
const toString = Object.prototype.toString
const Utils = {
  types: ['String', 'Function', 'Object'],
  isType (type) {
    return (o) => toString.call(o) === `[object ${type}]`
  },
  isPlainObject (o) {
    return Utils.isObject(o) && Object.keys(o).length === 0
  },
  guid () {
    return 'fd' + uuid4().split('-')[0]
  },
  namespace (str) {
    return 'fd' + uuid5(str, uuid5.DNS).split('-')[0]
  },
  forIn (o, cb) {
    const length = o.length
    const isArray = Array.isArray(o)
    let value
    let k = 0
    if (isArray) {
      for (; k < length; k++) {
        value = cb.call(o[k], o[k], k)
        if (value === false) {
          break
        }
      }
    } else {
      for (k in o) {
        value = cb.call(o[k], o[k], k)
        if (value === false) {
          break
        }
      }
    }
  },
  traverse (source, target) {
    let result = null
    for (const item of source) {
      if (item.id === target) {
        result = item
        break
      } else {
        const { children } = item
        if (children) {
          result = Utils.traverse(children, target)
        }
      }
    }
    return result
  },
  addClass (elem, name) {
    const classList = elem.className.split(' ')
    if (!classList.includes(name)) {
      classList.push(name)
      elem.className = classList.join(' ')
    }
  },
  removeClass (elem, name) {
    const classList = elem.className.split(' ')
    const index = classList.findIndex(val => val === name)
    if (index > -1) {
      classList.splice(index, 1)
      elem.className = classList.join(' ')
    }
  },
  deepClone (obj) {
    if (!Utils.isObject(obj)) return obj
    return JSON.parse(JSON.stringify(obj))
  }
}

Utils.forIn(Utils.types, (type) => {
  Utils[`is${type}`] = Utils.isType(type)
})

export default Utils

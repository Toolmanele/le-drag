/**
 * 依赖 le-dom.js
 * el : 需要施加 drag 逻辑的元素
 * drag : 主要逻辑 {start,moving,end,click,handler,target }
 * options: 补充逻辑 {passiveTouchMove,disableContextmenu,clickConfig,mousebtn,keypress}
 */

function addLeDrag(el, drag, options) {
  // 防止出现意外
  // 屏蔽默认的情况
  // select 和 默认的 touch
  el.style['user-select'] = 'none'
  el.style['touch-action'] = 'none'

  if (options) {
    // 是否全局屏蔽 手机浏览器的手势
    if (options.passiveTouchMove) {
      passiveTouchMove()
    }
    // 是否屏蔽 系统默认的邮件菜单
    if (options.disableContextmenu) {
      window.oncontextmenu = function (e) {
        return false
      }
    }
  }
  const btnArrs = ['left', 'middle', 'right']
  // sX sY 记录初始状态
  // type 记录鼠标/touch 当前的状态,防止混乱
  // target 表示谁要 moving
  // button 代表触发的是哪个 [左,中,右] [0,1,2] ?
  // stop 代表是否阻止冒泡 默认为不阻止
  // keypress 代表是哪个 按键按下了, 是 [ctrl,alt,shift]
  let sX,
    sY,
    type,
    target,
    button =
      options && typeof options.mousebtn === 'number' ? options.mousebtn : 0,
    stop = options && options.stop,
    keypress = options && options.keypress ? options.keypress : []

  // 一致性匹配
  function checkKeyPress(controlKeyPress, keypress) {
    let results = []
    for (let key in controlKeyPress) {
      if (checkKeyPress[key] && keypress.include(key)) {
        results.push(key)
      }
    }
    return results.length === keypress.length
  }
  // 鼠标按下
  el.on('mousedown', (e) => {
    e.preventDefault()
    // 鼠标按键判断 , 不符合不生效
    if (e.button !== button) return

    // 是否冒泡
    if (stop) {
      e.stopPropagation()
    }
    const controlKeyPress = {
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
    }
    if (!checkKeyPress(controlKeyPress, keypress)) return

    sX = e.clientX
    sY = e.clientY
    pd(e.target)
    if (!target) return
    if (type) return
    type = 'mouse'
    document.on('mousemove', pmm)
    document.on('mouseup', pum)
  })
  // 触屏按下
  el.on('touchstart', (e) => {
    // e.preventDefault()
    if (options && options.stop) {
      e.stopPropagation()
    }

    if (e.touches.length !== 1) return
    // touches /targetTouches
    // sX = e.targetTouches[0].clientX
    // sY = e.targetTouches[0].clientY
    let tt = e.targetTouches[e.targetTouches.length - 1]
    sX = tt.clientX
    sY = tt.clientY
    pd(e.target)
    if (!target) return
    if (type) return
    type = 'touch'
    document.on('touchmove', pmt)
    document.on('touchend', put)
  })

  function pd(t) {
    // 如果设定了 handler ,那么鼠标到 handler 的时候才会反应

    if (
      typeof drag.handler === 'string' ||
      typeof drag.handler === 'function'
    ) {
      let handler
      if (typeof drag.handler === 'string') {
        handler = (t) => t.matches(drag.handler)
      } else if (typeof drag.handler === 'string') {
        handler = drag.handler
      }

      if (handler(t) || findParent(t, handler, el)) {
        if (typeof drag.target === 'string') {
          target = findParent(t, (t) => t.matches(drag.target), el)
        } else if (typeof drag.target === 'function') {
          target = findParent(t, drag.target, el)
        } else {
          target = el
        }
      }
    } else {
      if (typeof drag.target === 'string') {
        target = findParent(t, (t) => t.matches(drag.target), el)
      } else if (typeof drag.target === 'function') {
        target = findParent(t, drag.target, el)
      } else {
        target = el
      }
    }
    if (target && typeof drag.start === 'function') {
      drag.start(target, sX, sY)
    }
  }
  // 最多匹配到end
  function findParent(t, cond, end) {
    let p = t
    while (p != end) {
      if (cond(p)) {
        return p
      }
      p = p.parentElement
    }
  }
  // if (typeof resize === 'function') {
  //   // 执行程序
  // }
  function pmm(e) {
    let mX = e.clientX
    let mY = e.clientY
    let dX = mX - sX
    let dY = mY - sY
    // 低于 5,就算误触吧
    if (typeof drag.moving === 'function') {
      // 执行程序
      drag.moving(target, mX, mY, dX, dY, e)
    }
  }
  function pum(e) {
    type = null
    if (typeof drag.end === 'function') {
      // 执行程序
      drag.end(target)
    }
    target = null
    document.off('mousemove', pmm)
    document.off('mouseup', pum)
  }
  function pmt(e) {
    if (e.touches.length !== 1) {
      put(e)
    } else {
      // dX = e.targetTouches[0].clientX - sX
      // dY = e.targetTouches[0].clientY - sY
      let tt = e.targetTouches[e.targetTouches.length - 1]
      let mX = tt.clientX
      let mY = tt.clientY
      let dX = mX - sX
      let dY = mY - sY
      if (typeof drag.moving === 'function') {
        // 执行程序
        drag.moving(target, mX, mY, dX, dY, e)
      }
    }
  }

  function put(e) {
    type = null
    if (typeof drag.end === 'function') {
      // 执行程序
      drag.end(target)
    }
    target = null
    document.off('touchmove', pmt)
    document.off('touchend', put)
  }

  // 取消浏览器的默认事件
  function passiveTouchMove() {
    window.addEventListener(
      'touchmove',
      (ev) => {
        ev.preventDefault()
        ev.stopImmediatePropagation()
      },
      { passive: false }
    )
  }
}

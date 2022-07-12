// 让人快乐的 DOM 写法
// addEventListener/removeEventListener 太长了 , on off 替换
EventTarget.prototype.on = EventTarget.prototype.addEventListener
EventTarget.prototype.off = EventTarget.prototype.removeEventListener

// 模拟 Jquery 使用 $
// 最简易的选择器
function $() {
  var a = arguments
  var l = a.length
  if (l === 1) {
    // $('.panel')
    return document.querySelector(a[0])
  } else if (l === 2) {
    // $(body,'.panel')
    return a[0].querySelector(a[1])
  }
}

// 复选
// $s('.abc')
// $s{parent,'.abc'}
function $s(){
  var args = arguments
  var len = args.length

  if(len === 1){
    return document.querySelectorAll(args[0])
  }else if(len === 2) {
    return args[0].querySelectorAll(args[1])
  }
}

// 批量的 setAttribute 写烦了
function setAttrs(el, attrsObj) {
  for (let key in attrsObj) {
    el.setAttribute(key, attrsObj[key])
  }
}

// 批量的 style 写烦了
function setStyles(el,stylesObj){
  for (let key in stylesObj) {
    el.style[key] = stylesObj[key]
  }
}

// 可以接收两种参数
// 一种是直接的元素
// 一种是 selector 都可以用
function getElement(selector){
  if(typeof selector === 'string')){
    return $(selector)
  }else if(selector instanceof Element)){
    return selector
  }
}




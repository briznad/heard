// plugins






// local






/* Zepto v1.1 - zepto event ajax form ie - zeptojs.com/license */


var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]*)$/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = function(parent, node) {
    return parent !== node && parent.contains(node)
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = (text === undefined) ? '' : ''+text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (value === undefined) ?
        (this[0] && this[0][name]) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + name.replace(capitalRE, '-$1').toLowerCase(), value)
      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return arguments.length === 0 ?
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        ) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0], computedStyle = getComputedStyle(element, '')
        if(!element) return
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property: [property], function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          traverseNode(parent.insertBefore(node, target), function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var $$ = $.zepto.qsa, _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // items in the collection might not be DOM elements
      if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/=\?/, '=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = null
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred()
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)
    if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

    var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        baseHeaders = { },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(), abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
    baseHeaders['Accept'] = mime || '*/*'
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
    settings.headers = $.extend(baseHeaders, settings.headers || {})

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    var hasData = !$.isFunction(data)
    return {
      url:      url,
      data:     hasData  ? data : undefined,
      success:  !hasData ? data : $.isFunction(success) ? success : undefined,
      dataType: hasData  ? dataType || success : success
    }
  }

  $.get = function(url, data, success, dataType){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(url, data, success, dataType){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(url, data, success){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function ($) {
  $.fn.serializeArray = function() {
    var result = [], el
    $([].slice.call(this.get(0).elements)).each(function(){
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function(){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})()

//     Zepto.js
//     (c) 2010-2013 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  // Create a collection of callbacks to be fired in a sequence, with configurable behaviour
  // Option flags:
  //   - once: Callbacks fired at most one time.
  //   - memory: Remember the most recent context and arguments
  //   - stopOnFalse: Cease iterating over callback list
  //   - unique: Permit adding at most one instance of the same callback
  $.Callbacks = function(options) {
    options = $.extend({}, options)

    var memory, // Last fire value (for non-forgettable lists)
        fired,  // Flag to know if list was already fired
        firing, // Flag to know if list is currently firing
        firingStart, // First callback to fire (used internally by add and fireWith)
        firingLength, // End of the loop when firing
        firingIndex, // Index of currently firing callback (modified by remove if needed)
        list = [], // Actual callback list
        stack = !options.once && [], // Stack of fire calls for repeatable lists
        fire = function(data) {
          memory = options.memory && data
          fired = true
          firingIndex = firingStart || 0
          firingStart = 0
          firingLength = list.length
          firing = true
          for ( ; list && firingIndex < firingLength ; ++firingIndex ) {
            if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
              memory = false
              break
            }
          }
          firing = false
          if (list) {
            if (stack) stack.length && fire(stack.shift())
            else if (memory) list.length = 0
            else Callbacks.disable()
          }
        },

        Callbacks = {
          add: function() {
            if (list) {
              var start = list.length,
                  add = function(args) {
                    $.each(args, function(_, arg){
                      if (typeof arg === "function") {
                        if (!options.unique || !Callbacks.has(arg)) list.push(arg)
                      }
                      else if (arg && arg.length && typeof arg !== 'string') add(arg)
                    })
                  }
              add(arguments)
              if (firing) firingLength = list.length
              else if (memory) {
                firingStart = start
                fire(memory)
              }
            }
            return this
          },
          remove: function() {
            if (list) {
              $.each(arguments, function(_, arg){
                var index
                while ((index = $.inArray(arg, list, index)) > -1) {
                  list.splice(index, 1)
                  // Handle firing indexes
                  if (firing) {
                    if (index <= firingLength) --firingLength
                    if (index <= firingIndex) --firingIndex
                  }
                }
              })
            }
            return this
          },
          has: function(fn) {
            return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length))
          },
          empty: function() {
            firingLength = list.length = 0
            return this
          },
          disable: function() {
            list = stack = memory = undefined
            return this
          },
          disabled: function() {
            return !list
          },
          lock: function() {
            stack = undefined;
            if (!memory) Callbacks.disable()
            return this
          },
          locked: function() {
            return !stack
          },
          fireWith: function(context, args) {
            if (list && (!fired || stack)) {
              args = args || []
              args = [context, args.slice ? args.slice() : args]
              if (firing) stack.push(args)
              else fire(args)
            }
            return this
          },
          fire: function() {
            return Callbacks.fireWith(this, arguments)
          },
          fired: function() {
            return !!fired
          }
        }

    return Callbacks
  }
})(Zepto)

//     Zepto.js
//     (c) 2010-2013 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
//
//     Some code (c) 2005, 2013 jQuery Foundation, Inc. and other contributors

;(function($){
  var slice = Array.prototype.slice

  function Deferred(func) {
    var tuples = [
          // action, add listener, listener list, final state
          [ "resolve", "done", $.Callbacks({once:1, memory:1}), "resolved" ],
          [ "reject", "fail", $.Callbacks({once:1, memory:1}), "rejected" ],
          [ "notify", "progress", $.Callbacks({memory:1}) ]
        ],
        state = "pending",
        promise = {
          state: function() {
            return state
          },
          always: function() {
            deferred.done(arguments).fail(arguments)
            return this
          },
          then: function(/* fnDone [, fnFailed [, fnProgress]] */) {
            var fns = arguments
            return Deferred(function(defer){
              $.each(tuples, function(i, tuple){
                var fn = $.isFunction(fns[i]) && fns[i]
                deferred[tuple[1]](function(){
                  var returned = fn && fn.apply(this, arguments)
                  if (returned && $.isFunction(returned.promise)) {
                    returned.promise()
                      .done(defer.resolve)
                      .fail(defer.reject)
                      .progress(defer.notify)
                  } else {
                    var context = this === promise ? defer.promise() : this,
                        values = fn ? [returned] : arguments
                    defer[tuple[0] + "With"](context, values)
                  }
                })
              })
              fns = null
            }).promise()
          },

          promise: function(obj) {
            return obj != null ? $.extend( obj, promise ) : promise
          }
        },
        deferred = {}

    $.each(tuples, function(i, tuple){
      var list = tuple[2],
          stateString = tuple[3]

      promise[tuple[1]] = list.add

      if (stateString) {
        list.add(function(){
          state = stateString
        }, tuples[i^1][2].disable, tuples[2][2].lock)
      }

      deferred[tuple[0]] = function(){
        deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments)
        return this
      }
      deferred[tuple[0] + "With"] = list.fireWith
    })

    promise.promise(deferred)
    if (func) func.call(deferred, deferred)
    return deferred
  }

  $.when = function(sub) {
    var resolveValues = slice.call(arguments),
        len = resolveValues.length,
        i = 0,
        remain = len !== 1 || (sub && $.isFunction(sub.promise)) ? len : 0,
        deferred = remain === 1 ? sub : Deferred(),
        progressValues, progressContexts, resolveContexts,
        updateFn = function(i, ctx, val){
          return function(value){
            ctx[i] = this
            val[i] = arguments.length > 1 ? slice.call(arguments) : value
            if (val === progressValues) {
              deferred.notifyWith(ctx, val)
            } else if (!(--remain)) {
              deferred.resolveWith(ctx, val)
            }
          }
        }

    if (len > 1) {
      progressValues = new Array(len)
      progressContexts = new Array(len)
      resolveContexts = new Array(len)
      for ( ; i < len; ++i ) {
        if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
          resolveValues[i].promise()
            .done(updateFn(i, resolveContexts, resolveValues))
            .fail(deferred.reject)
            .progress(updateFn(i, progressContexts, progressValues))
        } else {
          --remain
        }
      }
    }
    if (!remain) deferred.resolveWith(resolveContexts, resolveValues)
    return deferred.promise()
  }

  $.Deferred = Deferred
})(Zepto)

//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

;(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.2';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from an array.
  // If **n** is not specified, returns a single random element from the array.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (arguments.length < 2 || guard) {
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, value, context) {
      var result = {};
      var iterator = value == null ? _.identity : lookupIterator(value);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) {
      return array[array.length - 1];
    } else {
      return slice.call(array, Math.max(array.length - n, 0));
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function() {
        var last = (new Date()) - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

/*!
 * Davis - http://davisjs.com - JavaScript Routing - 0.9.9
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */
;
/**
 * Convinience method for instantiating a new Davis app and configuring it to use the passed
 * routes and subscriptions.
 *
 * @param {Function} config A function that will be run with a newly created Davis.App as its context,
 * should be used to set up app routes, subscriptions and settings etc.
 * @namespace
 * @returns {Davis.App}
 */
Davis = function (config) {
  var app = new Davis.App
  config && config.call(app)
  Davis.$(function () { app.start() })
  return app
};

/**
 * Stores the DOM library that Davis will use.  Can be overriden to use libraries other than jQuery.
 */
if (window.Zepto) {
  Davis.$ = Zepto
} else if (window.jQuery) {
  Davis.$ = jQuery
} else {
  Davis.$ = null
};

/**
 * Checks whether Davis is supported in the current browser
 *
 * @returns {Boolean}
 */
Davis.supported = function () {
  return (typeof window.history.pushState == 'function')
}

/*!
 * A function that does nothing, used as a default param for any callbacks.
 *
 * @private
 * @returns {Function}
 */
Davis.noop = function () {}

/**
 * Method to extend the Davis library with an extension.
 *
 * An extension is just a function that will modify the Davis framework in some way,
 * for example changing how the routing works or adjusting where Davis thinks it is supported.
 *
 * Example:
 *     Davis.extend(Davis.hashBasedRouting)
 *
 * @param {Function} extension the function that will extend Davis
 *
 */
Davis.extend = function (extension) {
  extension(Davis)
}

/*!
 * the version
 */
Davis.version = "0.9.9";/*!
 * Davis - utils
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

/*!
 * A module that provides wrappers around modern JavaScript so that native implementations are used
 * whereever possible and JavaScript implementations are used in those browsers that do not natively
 * support them.
 */
Davis.utils = (function () {

  /*!
   * A wrapper around native Array.prototype.every.
   *
   * Falls back to a pure JavaScript implementation in browsers that do not support Array.prototype.every.
   * For more details see the full docs on MDC https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
   *
   * @private
   * @param {array} the array to loop through
   * @param {fn} the function to that performs the every check
   * @param {thisp} an optional param that will be set as fn's this value
   * @returns {Array}
   */
  if (Array.prototype.every) {
    var every = function (array, fn) {
      return array.every(fn, arguments[2])
    }
  } else {
    var every = function (array, fn) {
      if (array === void 0 || array === null) throw new TypeError();
      var t = Object(array);
      var len = t.length >>> 0;
      if (typeof fn !== "function") throw new TypeError();

      var thisp = arguments[2];
      for (var i = 0; i < len; i++) {
        if (i in t && !fn.call(thisp, t[i], i, t)) return false;
      }

      return true;
    }
  };

  /*!
   * A wrapper around native Array.prototype.forEach.
   *
   * Falls back to a pure JavaScript implementation in browsers that do not support Array.prototype.forEach.
   * For more details see the full docs on MDC https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
   *
   * @private
   * @param {array} the array to loop through
   * @param {fn} the function to apply to every element of the array
   * @param {thisp} an optional param that will be set as fn's this value
   * @returns {Array}
   */
  if (Array.prototype.forEach) {
    var forEach = function (array, fn) {
      return array.forEach(fn, arguments[2])
    }
  } else {
    var forEach = function (array, fn) {
      if (array === void 0 || array === null) throw new TypeError();
      var t = Object(array);
      var len = t.length >>> 0;
      if (typeof fn !== "function") throw new TypeError();


      var thisp = arguments[2];
      for (var i = 0; i < len; i++) {
        if (i in t) fn.call(thisp, t[i], i, t);
      }
    };
  };

  /*!
   * A wrapper around native Array.prototype.filter.
   * Falls back to a pure JavaScript implementation in browsers that do not support Array.prototype.filter.
   * For more details see the full docs on MDC https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
   *
   * @private
   * @param {array} the array to filter
   * @param {fn} the function to do the filtering
   * @param {thisp} an optional param that will be set as fn's this value
   * @returns {Array}
   */
  if (Array.prototype.filter) {
    var filter = function (array, fn) {
      return array.filter(fn, arguments[2])
    }
  } else {
    var filter = function(array, fn) {
      if (array === void 0 || array === null) throw new TypeError();
      var t = Object(array);
      var len = t.length >>> 0;
      if (typeof fn !== "function") throw new TypeError();


      var res = [];
      var thisp = arguments[2];
      for (var i = 0; i < len; i++) {
        if (i in t) {
          var val = t[i]; // in case fn mutates this
          if (fn.call(thisp, val, i, t)) res.push(val);
        }
      }

      return res;
    };
  };

  /*!
   * A wrapper around native Array.prototype.map.
   * Falls back to a pure JavaScript implementation in browsers that do not support Array.prototype.map.
   * For more details see the full docs on MDC https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
   *
   * @private
   * @param {array} the array to map
   * @param {fn} the function to do the mapping
   * @param {thisp} an optional param that will be set as fn's this value
   * @returns {Array}
   */

  if (Array.prototype.map) {
    var map = function (array, fn) {
      return array.map(fn, arguments[2])
    }
  } else {
    var map = function(array, fn) {
      if (array === void 0 || array === null)
        throw new TypeError();

      var t = Object(array);
      var len = t.length >>> 0;
      if (typeof fn !== "function")
        throw new TypeError();

      var res = new Array(len);
      var thisp = arguments[2];
      for (var i = 0; i < len; i++) {
        if (i in t)
          res[i] = fn.call(thisp, t[i], i, t);
      }

      return res;
    };
  };

  /*!
   * A convinience function for converting arguments to a proper array
   *
   * @private
   * @param {args} a functions arguments
   * @param {start} an integer at which to start converting the arguments to an array
   * @returns {Array}
   */
  var toArray = function (args, start) {
    return Array.prototype.slice.call(args, start || 0)
  }

  /*!
   * Exposing the public interface to the Utils module
   * @private
   */
  return {
    every: every,
    forEach: forEach,
    filter: filter,
    toArray: toArray,
    map: map
  }
})()

/*!
 * Davis - listener
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

/**
 * A module to bind to link clicks and form submits and turn what would normally be http requests
 * into instances of Davis.Request.  These request objects are then pushed onto the history stack
 * using the Davis.history module.
 *
 * This module uses Davis.$, which by defualt is jQuery for its event binding and event object normalization.
 * To use Davis with any, or no, JavaScript framework be sure to provide support for all the methods called
 * on Davis.$.
 *
 * @module
 */
Davis.listener = function () {

  /*!
   * Methods to check whether an element has an href or action that is local to this page
   * @private
   */
  var originChecks = {
    A: function (elem) {
      return elem.host !== window.location.host || elem.protocol !== window.location.protocol
    },

    FORM: function (elem) {
      var a = document.createElement('a')
      a.href = elem.action
      return this.A(a)
    }
  }

  /*!
   * Checks whether the target of a click or submit event has an href or action that is local to the
   * current page.  Only links or targets with local hrefs or actions will be handled by davis, all
   * others will be ignored.
   * @private
   */
  var differentOrigin = function (elem) {
    if (!originChecks[elem.nodeName.toUpperCase()]) return true // the elem is neither a link or a form
    return originChecks[elem.nodeName.toUpperCase()](elem)
  }

  var hasModifier = function (event) {
    return (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
  }

  /*!
   * A handler that creates a new Davis.Request and pushes it onto the history stack using Davis.history.
   *
   * @param {Function} targetExtractor a function that will be called with the event target jQuery object and should return an object with path, title and method.
   * @private
   */
  var handler = function (targetExtractor) {
    return function (event) {
      if (hasModifier(event)) return true
      if (differentOrigin(this)) return true

      var request = new Davis.Request (targetExtractor.call(Davis.$(this)));
      Davis.location.assign(request)
      event.stopPropagation()
      event.preventDefault()
      return false;
    };
  };

  /*!
   * A handler specialized for click events.  Gets the request details from a link elem
   * @private
   */
  var clickHandler = handler(function () {
    var self = this

    return {
      method: 'get',
      fullPath: this.prop('href'),
      title: this.attr('title'),
      delegateToServer: function () {
        window.location = self.prop('href')
      }
    };
  });

  /*!
   * A handler specialized for submit events.  Gets the request details from a form elem
   * @private
   */
  var submitHandler = handler(function () {
    var self = this
    return {
      method: this.attr('method'),
      fullPath: (this.serialize() ? [this.prop('action'), this.serialize()].join("?") : this.prop('action')),
      title: this.attr('title'),
      delegateToServer: function () {
        self.submit()
      }
    };
  });

  /**
   * Binds to both link clicks and form submits using jQuery's deleagate.
   *
   * Will catch all current and future links and forms.  Uses the apps settings for the selector to use for links and forms
   *
   * @see Davis.App.settings
   * @memberOf listener
   */
  this.listen = function () {
    Davis.$(document).delegate(this.settings.formSelector, 'submit', submitHandler)
    Davis.$(document).delegate(this.settings.linkSelector, 'click', clickHandler)
  }

  /**
   * Unbinds all click and submit handlers that were attatched with listen.
   *
   * Will efectivley stop the current app from processing any requests and all links and forms will have their default
   * behaviour restored.
   *
   * @see Davis.App.settings
   * @memberOf listener
   */
  this.unlisten = function () {
    Davis.$(document).undelegate(this.settings.linkSelector, 'click', clickHandler)
    Davis.$(document).undelegate(this.settings.formSelector, 'submit', submitHandler)
  }
}
/*!
 * Davis - event
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

 /**
  * A plugin that adds basic event capabilities to a Davis app, it is included by default.
  *
  * @module
  */
Davis.event = function () {

  /*!
   * callback storage
   */
  var callbacks = {}

  /**
   * Binds a callback to a named event.
   *
   * The following events are triggered internally by Davis and can be bound to
   *
   *  * start : Triggered when the application is started
   *  * lookupRoute : Triggered before looking up a route. The request being looked up is passed as an argument
   *  * runRoute : Triggered before running a route. The request and route being run are passed as arguments
   *  * routeNotFound : Triggered if no route for the current request can be found. The current request is passed as an arugment
   *  * requestHalted : Triggered when a before filter halts the current request. The current request is passed as an argument
   *  * unsupported : Triggered when starting a Davis app in a browser that doesn't support html5 pushState
   *
   * Example
   *
   *     app.bind('runRoute', function () {
   *       console.log('about to run a route')
   *     })
   *
   * @param {String} event event name
   * @param {Function} fn callback
   * @memberOf event
   */
  this.bind = function (event, fn) {
    (callbacks[event] = callbacks[event] || []).push(fn);
    return this;
  };

  /**
   * Triggers an event with the given arguments.
   *
   * @param {String} event event name
   * @param {Mixed} ...
   * @memberOf event
   */
  this.trigger = function (event) {
    var args = Davis.utils.toArray(arguments, 1),
        handlers = callbacks[event];

    if (!handlers) return this

    for (var i = 0, len = handlers.length; i < len; ++i) {
      handlers[i].apply(this, args)
    }

    return this;
  };
}
/*!
 * Davis - logger
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

/**
 * A plugin for enhancing the standard logging available through the console object.
 * Automatically included in all Davis apps.
 *
 * Generates log messages of varying severity in the format
 *
 * `[Sun Jan 23 2011 16:15:21 GMT+0000 (GMT)] <message>`
 *
 * @module
 */
Davis.logger = function () {

  /*!
   * Generating the timestamp portion of the log message
   * @private
   */
  function timestamp(){
    return "[" + Date() + "]";
  }

  /*!
   * Pushing the timestamp onto the front of the arguments to log
   * @private
   */
  function prepArgs(args) {
    var a = Davis.utils.toArray(args)
    a.unshift(timestamp())
    return a.join(' ');
  }

  var logType = function (logLevel) {
    return function () {
      if (window.console) console[logLevel](prepArgs(arguments));
    }
  }


  /**
   * Prints an error message to the console if the console is available.
   *
   * @params {String} All arguments are combined and logged to the console.
   * @memberOf logger
   */
   var error = logType('error')

  /**
   * Prints an info message to the console if the console is available.
   *
   * @params {String} All arguments are combined and logged to the console.
   * @memberOf logger
   */
   var info = logType('info')

  /**
   * Prints a warning message to the console if the console is available.
   *
   * @params {String} All arguments are combined and logged to the console.
   * @memberOf logger
   */
   var warn = logType('warn')

  /*!
   * Exposes the public methods of the module
   * @private
   */
  this.logger = {
    error: error,
    info: info,
    warn: warn
  }
}/*!
 * Davis - Route
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

Davis.Route = (function () {

  var pathNameRegex = /:([\w\d]+)/g;
  var pathNameReplacement = "([^\/]+)";

  var splatNameRegex = /\*([\w\d]+)/g;
  var splatNameReplacement = "(.*)";

  var nameRegex = /[:|\*]([\w\d]+)/g

/**
 * Davis.Routes are the main part of a Davis application.  They consist of an HTTP method, a path
 * and a callback function.  When a link or a form that Davis has bound to are clicked or submitted
 * a request is pushed on the history stack and a route that matches the path and method of the
 * generated request is run.
 *
 * The path for the route can consist of placeholders for attributes, these will then be available
 * on the request.  Simple variables should be prefixed with a colan, and for splat style params use
 * an asterisk.
 *
 * Inside the callback function 'this' is bound to the request.
 *
 * Example:
 *
 *     var route = new Davis.Route ('get', '/foo/:id', function (req) {
 *       var id = req.params['id']
 *       // do something interesting!
 *     })
 *
 *     var route = new Davis.Route ('get', '/foo/*splat', function (req) {
 *       var id = req.params['splat']
 *       // splat will contain everything after the /foo/ in the path.
 *     })
 *
 * You can include any number of route level 'middleware' when defining routes.  These middlewares are
 * run in order and need to explicitly call the next handler in the stack.  Using route middleware allows
 * you to share common logic between routes and is also a good place to load any data or do any async calls
 * keeping your main handler simple and focused.
 *
 * Example:
 *
 *     var loadUser = function (req, next) {
 *       $.get('/users/current', function (user) {
 *         req.user = user
 *         next(req)
 *       })
 *     }
 *
 *     var route = new Davis.Route ('get', '/foo/:id', loadUser, function (req) {
 *       renderUser(req.user)
 *     })
 *
 * @constructor
 * @param {String} method This should be one of either 'get', 'post', 'put', 'delete', 'before', 'after' or 'state'
 * @param {String} path This string can contain place holders for variables, e.g. '/user/:id' or '/user/*splat'
 * @param {Function} callback One or more callbacks that will be called in order when a request matching both the path and method is triggered.
 */
  var Route = function (method, path, handlers) {
    var convertPathToRegExp = function () {
      if (!(path instanceof RegExp)) {
        var str = path
          .replace(pathNameRegex, pathNameReplacement)
          .replace(splatNameRegex, splatNameReplacement);

        // Most browsers will reset this to zero after a replace call.  IE will
        // set it to the index of the last matched character.
        path.lastIndex = 0;

        return new RegExp("^" + str + "$", "gi");
      } else {
        return path;
      };
    };

    var convertMethodToRegExp = function () {
      if (!(method instanceof RegExp)) {
        return new RegExp("^" + method + "$", "i");
      } else {
        return method
      };
    }

    var capturePathParamNames = function () {
      var names = [], a;
      while ((a = nameRegex.exec(path))) names.push(a[1]);
      return names;
    };

    this.paramNames = capturePathParamNames();
    this.path = convertPathToRegExp();
    this.method = convertMethodToRegExp();

    if (typeof handlers === 'function') {
      this.handlers = [handlers]
    } else {
      this.handlers = handlers;
    }
  }

  /**
   * Tests whether or not a route matches a particular request.
   *
   * Example:
   *
   *     route.match('get', '/foo/12')
   *
   * @param {String} method the method to match against
   * @param {String} path the path to match against
   * @returns {Boolean}
   */
  Route.prototype.match = function (method, path) {
    this.reset();
    return (this.method.test(method)) && (this.path.test(path))
  }

  /**
   * Resets the RegExps for method and path
   */
  Route.prototype.reset = function () {
    this.method.lastIndex = 0;
    this.path.lastIndex = 0;
  }

  /**
   * Runs the callback associated with a particular route against the passed request.
   *
   * Any named params in the request path are extracted, as per the routes path, and
   * added onto the requests params object.
   *
   * Example:
   *
   *     route.run(request)
   *
   * @params {Davis.Request} request
   * @returns {Object} whatever the routes callback returns
   */
  Route.prototype.run = function (request) {
    this.reset();
    var matches = this.path.exec(request.path);
    if (matches) {
      matches.shift();
      for (var i=0; i < matches.length; i++) {
        request.params[this.paramNames[i]] = matches[i];
      };
    };

    var handlers = Davis.utils.map(this.handlers, function (handler, i) {
      return function (req) {
        return handler.call(req, req, handlers[i+1])
      }
    })

    return handlers[0](request)
  }

  /**
   * Converts the route to a string representation of itself by combining the method and path
   * attributes.
   *
   * @returns {String} string representation of the route
   */
  Route.prototype.toString = function () {
    return [this.method, this.path].join(' ');
  }

  /*!
   * exposing the constructor
   * @private
   */
  return Route;
})()
/*!
 * Davis - router
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

/**
 * A decorator that adds convinience methods to a Davis.App for easily creating instances
 * of Davis.Route and looking up routes for a particular request.
 *
 * Provides get, post put and delete method shortcuts for creating instances of Davis.Routes
 * with the corresponding method.  This allows simple REST styled routing for a client side
 * JavaScript application.
 *
 * ### Example
 *
 *     app.get('/foo/:id', function (req) {
 *       // get the foo with id = req.params['id']
 *     })
 *
 *     app.post('/foo', function (req) {
 *       // create a new instance of foo with req.params
 *     })
 *
 *     app.put('/foo/:id', function (req) {
 *       // update the instance of foo with id = req.params['id']
 *     })
 *
 *     app.del('/foo/:id', function (req) {
 *       // delete the instance of foo with id = req.params['id']
 *     })
 *
 * As well as providing convinience methods for creating instances of Davis.Routes the router
 * also provides methods for creating special instances of routes called filters.  Before filters
 * run before any matching route is run, and after filters run after any matched route has run.
 * A before filter can return false to halt the running of any matched routes or other before filters.
 *
 * A filter can take an optional path to match on, or without a path will match every request.
 *
 * ### Example
 *
 *     app.before('/foo/:id', function (req) {
 *       // will only run before request matching '/foo/:id'
 *     })
 *
 *     app.before(function (req) {
 *       // will run before all routes
 *     })
 *
 *     app.after('/foo/:id', function (req) {
 *       // will only run after routes matching '/foo/:id'
 *     })
 *
 *     app.after(function (req) {
 *       // will run after all routes
 *     })
 *
 * Another special kind of route, called state routes, are also generated using the router.  State routes
 * are for requests that will not change the current page location.  Instead the page location will remain
 * the same but the current state of the page has changed.  This allows for states which the server will not
 * be expected to know about and support.
 *
 * ### Example
 *
 *     app.state('/foo/:id', function (req) {
 *       // will run when the app transitions into the '/foo/:id' state.
 *     })
 *
 * Using the `trans` method an app can transition to these kind of states without changing the url location.
 *
 * For convinience routes can be defined within a common base scope, this is useful for keeping your route
 * definitions simpler and DRYer.  A scope can either cover the whole app, or just a subset of the routes.
 *
 * ### Example
 *
 *     app.scope('/foo', function () {
 *       this.get('/:id', function () {
 *         // will run for routes that match '/foo/:id'
 *       })
 *     })
 *
 * @module
 */
Davis.router = function () {

  /**
   * Low level method for adding routes to your application.
   *
   * If called with just a method will return a partially applied function that can create routes with
   * that method.  This is used internally to provide shortcuts for get, post, put, delete and state
   * routes.
   *
   * You normally want to use the higher level methods such as get and post, but this can be useful for extending
   * Davis to work with other kinds of requests.
   *
   * Example:
   *
   *     app.route('get', '/foo', function (req) {
   *       // will run when a get request is made to '/foo'
   *     })
   *
   *     app.patch = app.route('patch') // will return a function that can be used to handle requests with method of patch.
   *     app.patch('/bar', function (req) {
   *       // will run when a patch request is made to '/bar'
   *     })
   *
   * @param {String} method The method for this route.
   * @param {String} path The path for this route.
   * @param {Function} handler The handler for this route, will be called with the request that triggered the route.
   * @returns {Davis.Route} the route that has just been created and added to the route list.
   * @memberOf router
   */
  this.route = function (method, path) {
    var createRoute = function (path) {
      var handlers = Davis.utils.toArray(arguments, 1),
          scope = scopePaths.join(''),
          fullPath, route

      (typeof path == 'string') ? fullPath = scope + path : fullPath = path

      route = new Davis.Route (method, fullPath, handlers)

      routeCollection.push(route)
      return route
    }

    return (arguments.length == 1) ? createRoute : createRoute.apply(this, Davis.utils.toArray(arguments, 1))
  }

  /**
   * A convinience wrapper around `app.route` for creating get routes.
   *
   * @param {String} path The path for this route.
   * @param {Function} handler The handler for this route, will be called with the request that triggered the route.
   * @returns {Davis.Route} the route that has just been created and added to the route list.
   * @see Davis.router.route
   * @memberOf router
   */
  this.get  = this.route('get')

  /**
   * A convinience wrapper around `app.route` for creating post routes.
   *
   * @param {String} path The path for this route.
   * @param {Function} handler The handler for this route, will be called with the request that triggered the route.
   * @returns {Davis.Route} the route that has just been created and added to the route list.
   * @see Davis.router.route
   * @memberOf router
   */
  this.post = this.route('post')

  /**
   * A convinience wrapper around `app.route` for creating put routes.
   *
   * @param {String} path The path for this route.
   * @param {Function} handler The handler for this route, will be called with the request that triggered the route.
   * @returns {Davis.Route} the route that has just been created and added to the route list.
   * @see Davis.router.route
   * @memberOf router
   */
  this.put  = this.route('put')

  /**
   * A convinience wrapper around `app.route` for creating delete routes.
   *
   * delete is a reserved word in javascript so use the `del` method when creating a Davis.Route with a method of delete.
   *
   * @param {String} path The path for this route.
   * @param {Function} handler The handler for this route, will be called with the request that triggered the route.
   * @returns {Davis.Route} the route that has just been created and added to the route list.
   * @see Davis.router.route
   * @memberOf router
   */
  this.del  = this.route('delete')

  /**
   * Adds a state route into the apps route collection.
   *
   * These special kind of routes are not triggered by clicking links or submitting forms, instead they
   * are triggered manually by calling `trans`.
   *
   * Routes added using the state method act in the same way as other routes except that they generate
   * a route that is listening for requests that will not change the page location.
   *
   * Example:
   *
   *     app.state('/foo/:id', function (req) {
   *       // will run when the app transitions into the '/foo/:id' state.
   *     })
   *
   * @param {String} path The path for this route, this will never be seen in the url bar.
   * @param {Function} handler The handler for this route, will be called with the request that triggered the route
   * @memberOf router
   *
   */
  this.state = this.route('state');

  /**
   * Modifies the scope of the router.
   *
   * If you have many routes that share a common path prefix you can use scope to reduce repeating
   * that path prefix.
   *
   * You can use `scope` in two ways, firstly you can set the scope for the whole app by calling scope
   * before defining routes.  You can also provide a function to the scope method, and the scope will
   * only apply to those routes defined within this function. It is  also possible to nest scopes within
   * other scopes.
   *
   * Example
   *
   *     // using scope with a function
   *     app.scope('/foo', function () {
   *       this.get('/bar', function (req) {
   *         // this route will have a path of '/foo/bar'
   *       })
   *     })
   *
   *     // setting a global scope for the rest of the application
   *     app.scope('/bar')
   *
   *     // using scope with a function
   *     app.scope('/foo', function () {
   *       this.scope('/bar', function () {
   *         this.get('/baz', function (req) {
   *           // this route will have a path of '/foo/bar/baz'
   *         })
   *       })
   *     })
   *
   * @memberOf router
   * @param {String} path The prefix to use as the scope
   * @param {Function} fn A function that will be executed with the router as its context and the path
   * as a prefix
   *
   */
  this.scope = function (path, fn) {
    scopePaths.push(path)
    if (arguments.length == 1) return

    fn.call(this, this)
    scopePaths.pop()
  }

  /**
   * Transitions the app into the state identified by the passed path parameter.
   *
   * This allows the app to enter states without changing the page path through a link click or form submit.
   * If there are handlers registered for this state, added by the `state` method, they will be triggered.
   *
   * This method generates a request with a method of 'state', in all other ways this request is identical
   * to those that are generated when clicking links etc.
   *
   * States transitioned to using this method will not be able to be revisited directly with a page load as
   * there is no url that represents the state.
   *
   * An optional second parameter can be passed which will be available to any handlers in the requests
   * params object.
   *
   * Example
   *
   *     app.trans('/foo/1')
   *
   *     app.trans('/foo/1', {
   *       "bar": "baz"
   *     })
   *
   *
   * @param {String} path The path that represents this state.  This will not be seen in the url bar.
   * @param {Object} data Any additional data that should be sent with the request as params.
   * @memberOf router
   */
  this.trans = function (path, data) {
    if (data) {
      var fullPath = [path, decodeURIComponent(Davis.$.param(data))].join('?')
    } else {
      var fullPath = path
    };

    var req = new Davis.Request({
      method: 'state',
      fullPath: fullPath,
      title: ''
    })

    Davis.location.assign(req)
  }

  /*!
   * Generating convinience methods for creating filters using Davis.Routes and methods to
   * lookup filters.
   */
  this.filter = function (filterName) {
    return function () {
      var method = /.+/;

      if (arguments.length == 1) {
        var path = /.+/;
        var handler = arguments[0];
      } else if (arguments.length == 2) {
        var path = scopePaths.join('') + arguments[0];
        var handler = arguments[1];
      };

      var route = new Davis.Route (method, path, handler)
      filterCollection[filterName].push(route);
      return route
    }
  }

  this.lookupFilter = function (filterType) {
    return function (method, path) {
      return Davis.utils.filter(filterCollection[filterType], function (route) {
        return route.match(method, path)
      });
    }
  }

  /**
   * A convinience wrapper around `app.filter` for creating before filters.
   *
   * @param {String} path The optionl path for this filter.
   * @param {Function} handler The handler for this filter, will be called with the request that triggered the route.
   * @returns {Davis.Route} the route that has just been created and added to the route list.
   * @memberOf router
   */
  this.before = this.filter('before')

  /**
   * A convinience wrapper around `app.filter` for creating after filters.
   *
   * @param {String} path The optionl path for this filter.
   * @param {Function} handler The handler for this filter, will be called with the request that triggered the route.
   * @returns {Davis.Route} the route that has just been created and added to the route list.
   * @memberOf router
   */
  this.after = this.filter('after')

  /**
   * A convinience wrapper around `app.lookupFilter` for looking up before filters.
   *
   * @param {String} path The optionl path for this filter.
   * @param {Function} handler The handler for this filter, will be called with the request that triggered the route.
   * @returns {Davis.Route} the route that has just been created and added to the route list.
   * @memberOf router
   */
  this.lookupBeforeFilter = this.lookupFilter('before')

  /**
   * A convinience wrapper around `app.lookupFilter` for looking up after filters.
   *
   * @param {String} path The optionl path for this filter.
   * @param {Function} handler The handler for this filter, will be called with the request that triggered the route.
   * @returns {Davis.Route} the route that has just been created and added to the route list.
   * @memberOf router
   */
  this.lookupAfterFilter  = this.lookupFilter('after')

  /*!
   * collections of routes and filters
   * @private
   */
  var routeCollection = [];
  var filterCollection = {
    before: [],
    after: []
  };
  var scopePaths = []

  /**
   * Looks for the first route that matches the method and path from a request.
   * Will only find and return the first matched route.
   *
   * @param {String} method the method to use when looking up a route
   * @param {String} path the path to use when looking up a route
   * @returns {Davis.Route} route
   * @memberOf router
   */
  this.lookupRoute = function (method, path) {
    return Davis.utils.filter(routeCollection, function (route) {
      return route.match(method, path)
    })[0];
  };
}
/*!
 * Davis - history
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

/**
 * A module to normalize and enhance the window.pushState method and window.onpopstate event.
 *
 * Adds the ability to bind to whenever a new state is pushed onto the history stack and normalizes
 * both of these events into an onChange event.
 *
 * @module
 */
Davis.history = (function () {

  /*!
   * storage for the push state handlers
   * @private
   */
  var pushStateHandlers = [];

  /*!
   * keep track of whether or not webkit like browsers have fired their initial
   * page load popstate
   * @private
   */
  var popped = false

  /*!
   * Add a handler to the push state event.  This event is not a native event but is fired
   * every time a call to pushState is called.
   *
   * @param {Function} handler
   * @private
   */
  function onPushState(handler) {
    pushStateHandlers.push(handler);
  };

  /*!
   * Simple wrapper for the native onpopstate event.
   *
   * @param {Function} handler
   * @private
   */
  function onPopState(handler) {
    window.addEventListener('popstate', handler, true);
  };

  /*!
   * returns a handler that wraps the native event given onpopstate.
   * When the page first loads or going back to a time in the history that was not added
   * by pushState the event.state object will be null.  This generates a request for the current
   * location in those cases
   *
   * @param {Function} handler
   * @private
   */
  function wrapped(handler) {
    return function (event) {
      if (event.state && event.state._davis) {
        handler(new Davis.Request(event.state._davis))
      } else {
        if (popped) handler(Davis.Request.forPageLoad())
      };
      popped = true
    }
  }

  /*!
   * provide a wrapper for any data that is going to be pushed into the history stack.  All
   * data is wrapped in a "_davis" namespace.
   * @private
   */
  function wrapStateData(data) {
    return {"_davis": data}
  }

  /**
   * Bind to the history on change event.
   *
   * This is not a native event but is fired any time a new state is pushed onto the history stack,
   * the current history is replaced or a state is popped off the history stack.
   * The handler function will be called with a request param which is an instance of Davis.Request.
   *
   * @param {Function} handler a function that will be called on push and pop state.
   * @see Davis.Request
   * @memberOf history
   */
  function onChange(handler) {
    onPushState(handler);
    onPopState(wrapped(handler));
  };

  /*!
   * returns a function for manipulating the history state and optionally calling any associated
   * pushStateHandlers
   *
   * @param {String} methodName the name of the method to manipulate the history state with.
   * @private
   */
  function changeStateWith (methodName) {
    return function (request, opts) {
      popped = true
      history[methodName](wrapStateData(request.toJSON()), request.title, request.location());
      if (opts && opts.silent) return
      Davis.utils.forEach(pushStateHandlers, function (handler) {
        handler(request);
      });
    }
  }

  /**
   * Pushes a request onto the history stack.
   *
   * This is used internally by Davis to push a new request
   * resulting from either a form submit or a link click onto the history stack, it will also trigger
   * the onpushstate event.
   *
   * An instance of Davis.Request is expected to be passed, however any object that has a title
   * and a path property will also be accepted.
   *
   * @param {Davis.Request} request the location to be assinged as the current location.
   * @memberOf history
   */
  var assign = changeStateWith('pushState')

  /**
   * Replace the current state on the history stack.
   *
   * This is used internally by Davis when performing a redirect.  This will trigger an onpushstate event.
   *
   * An instance of Davis.Request is expected to be passed, however any object that has a title
   * and a path property will also be accepted.
   *
   * @param {Davis.Request} request the location to replace the current location with.
   * @memberOf history
   */
  var replace = changeStateWith('replaceState')

  /**
   * Returns the current location for the application.
   *
   * Davis.location delegates to this method for getting the apps current location.
   *
   * @memberOf history
   */
  function current() {
    return window.location.pathname + (window.location.search ? window.location.search : '')
  }

  /*!
   * Exposing the public methods of this module
   * @private
   */
  return {
    onChange: onChange,
    current: current,
    assign: assign,
    replace: replace
  }
})()
/*!
 * Davis - location
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

/**
 * A module that acts as a delegator to any locationDelegate implementation.  This abstracts the details of
 * what is being used for the apps routing away from the rest of the library.  This allows any kind of routing
 * To be used with Davis as long as it can respond appropriatly to the given delegate methods.
 *
 * A routing module must respond to the following methods
 *
 *  * __current__ : Should return the current location for the app
 *  * __assign__ : Should set the current location of the app based on the location of the passed request.
 *  * __replace__ : Should at least change the current location to the location of the passed request, for full compatibility it should not add any extra items in the history stack.
 *  * __onChange__ : Should add calbacks that will be fired whenever the location is changed.
 *
 * @module
 *
 */
Davis.location = (function () {

  /*!
   * By default the Davis uses the Davis.history module for its routing, this gives HTML5 based pushState routing
   * which is preferrable over location.hash based routing.
   */
  var locationDelegate = Davis.history

  /**
   * Sets the current location delegate.
   *
   * The passed delegate will be used for all Davis apps.  The delegate
   * must respond to the following four methods `current`, `assign`, `replace` & `onChange`.
   *
   * @param {Object} the location delegate to use.
   * @memberOf location
   */
  function setLocationDelegate(delegate) {
    locationDelegate = delegate
  }

  /**
   * Delegates to the locationDelegate.current method.
   *
   * This should return the current location of the app.
   *
   * @memberOf location
   */
  function current() {
    return locationDelegate.current()
  }

  /*!
   * Creates a function which sends the location delegate the passed message name.
   * It handles converting a string path to an actual request
   *
   * @returns {Function} a function that calls the location delegate with the supplied method name
   * @memberOf location
   * @private
   */
  function sendLocationDelegate (methodName) {
    return function (req, opts) {
      if (typeof req == 'string') req = new Davis.Request (req)
      locationDelegate[methodName](req, opts)
    }
  }

  /**
   * Delegates to the locationDelegate.assign method.
   *
   * This should set the current location for the app to that of the passed request object.
   *
   * Can take either a Davis.Request or a string representing the path of the request to assign.
   *
   *
   *
   * @param {Request} req the request to replace the current location with, either a string or a Davis.Request.
   * @param {Object} opts the optional options object that will be passed to the location delegate
   * @see Davis.Request
   * @memberOf location
   */
  var assign = sendLocationDelegate('assign')

  /**
   * Delegates to the locationDelegate.replace method.
   *
   * This should replace the current location with that of the passed request.
   * Ideally it should not create a new entry in the browsers history.
   *
   * Can take either a Davis.Request or a string representing the path of the request to assign.
   *
   * @param {Request} req the request to replace the current location with, either a string or a Davis.Request.
   * @param {Object} opts the optional options object that will be passed to the location delegate
   * @see Davis.Request
   * @memberOf location
   */
  var replace = sendLocationDelegate('replace')

  /**
   * Delegates to the locationDelegate.onChange method.
   *
   * This should add a callback that will be called any time the location changes.
   * The handler function will be called with a request param which is an instance of Davis.Request.
   *
   * @param {Function} handler callback function to be called on location chnage.
   * @see Davis.Request
   * @memberOf location
   *
   */
  function onChange(handler) {
    locationDelegate.onChange(handler)
  }

  /*!
   * Exposing the public methods of this module
   * @private
   */
  return {
    setLocationDelegate: setLocationDelegate,
    current: current,
    assign: assign,
    replace: replace,
    onChange: onChange
  }
})()
/*!
 * Davis - Request
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

Davis.Request = (function () {

/**
 * Davis.Requests are created from click and submit events.  Davis.Requests are passed to Davis.Routes
 * and are stored in the history stack.  They are instantiated by the Davis.listener module.
 *
 * A request will have a params object which will contain all query params and form params, any named
 * params in a routes path will also be added to the requests params object.  Also included is support
 * for rails style nested form params.
 *
 * By default the request method will be taken from the method attribute for forms or will be defaulted
 * to 'get' for links, however there is support for using a hidden field called _method in your forms
 * to set the correct reqeust method.
 *
 * Simple get requests can be created by just passing a path when initializing a request, to set the method
 * or title you have to pass in an object.
 *
 * Each request will have a timestamp property to make it easier to determine if the application is moving
 * forward or backward through the history stack.
 *
 * Example
 *
 *     var request = new Davis.Request ("/foo/12")
 *
 *     var request = new Davis.Request ("/foo/12", {title: 'foo', method: 'POST'})
 *
 *     var request = new Davis.Request({
 *       title: "foo",
 *       fullPath: "/foo/12",
 *       method: "get"
 *     })
 *
 * @constructor
 * @param {String} fullPath
 * @param {Object} opts An optional object with a title or method proprty
 *
 */
  var Request = function (fullPath, opts) {
    if (typeof fullPath == 'object') {
      opts = fullPath
      fullPath = opts.fullPath
      delete opts.fullPath
    }

    var raw = Davis.$.extend({}, {
      title: "",
      fullPath: fullPath,
      method: "get",
      timestamp: +new Date ()
    }, opts)

    raw.fullPath = raw.fullPath.replace(/\+/g, '%20')

    var self = this;
    this.raw = raw;
    this.params = {};
    this.title = raw.title;
    this.queryString = raw.fullPath.split("?")[1];
    this.timestamp = raw.timestamp;
    this._staleCallback = function () {};

    if (this.queryString) {
      Davis.utils.forEach(this.queryString.split("&"), function (keyval) {
        var paramName = decodeURIComponent(keyval.split("=")[0]),
            paramValue = keyval.split("=")[1],
            nestedParamRegex = /^(\w+)\[(\w+)?\](\[\])?/,
            nested;
        if (nested = nestedParamRegex.exec(paramName)) {
          var paramParent = nested[1];
          var paramName = nested[2];
          var isArray = !!nested[3];
          var parentParams = self.params[paramParent] || {};

          if (isArray) {
            parentParams[paramName] = parentParams[paramName] || [];
            parentParams[paramName].push(decodeURIComponent(paramValue));
            self.params[paramParent] = parentParams;
          } else if (!paramName && !isArray) {
            parentParams = self.params[paramParent] || []
            parentParams.push(decodeURIComponent(paramValue))
            self.params[paramParent] = parentParams
          } else {
            parentParams[paramName] = decodeURIComponent(paramValue);
            self.params[paramParent] = parentParams;
          }
        } else {
          self.params[paramName] = decodeURIComponent(paramValue);
        };

      });
    };

    raw.fullPath = raw.fullPath.replace(/^https?:\/\/.+?\//, '/');

    this.method = (this.params._method || raw.method).toLowerCase();

    this.path = raw.fullPath
      .replace(/\?(.|[\r\n])+$/, "")  // Remove the query string
      .replace(/^https?:\/\/[^\/]+/, ""); // Remove the protocol and host parts

    this.fullPath = raw.fullPath;

    this.delegateToServer = raw.delegateToServer || Davis.noop;
    this.isForPageLoad = raw.forPageLoad || false;

    if (Request.prev) Request.prev.makeStale(this);
    Request.prev = this;

  };

  /**
   * Redirects the current request to a new location.
   *
   * Calling redirect on an instance of Davis.Request will create a new request using the path and
   * title of the current request. Redirected requests always have a method of 'get'.
   *
   * The request created will replace the current request in the history stack.  Redirect is most
   * often useful inside a handler for a form submit.  After succesfully handling the form the app
   * can redirect to another path.  This means that the current form will not be re-submitted if
   * navigating through the history with the back or forward buttons because the request that the
   * submit generated has been replaced in the history stack.
   *
   * Example
   *
   *     this.post('/foo', function (req) {
   *       processFormRequest(req.params)  // do something with the form request
   *       req.redirect('/bar');
   *     })
   *
   * @param {String} path The path to redirect the current request to
   * @param {Object} opts The optional options object that will be passed through to the location
   * @memberOf Request
   */
  Request.prototype.redirect = function (path, opts) {
    Davis.location.replace(new Request ({
      method: 'get',
      fullPath: path,
      title: this.title
    }), opts);
  };

  /**
   * Adds a callback to be called when the request is stale.
   * A request becomes stale when it is no longer the current request, this normally occurs when a
   * new request is triggered.  A request can be marked as stale manually if required.  The callback
   * passed to whenStale will be called with the new request that is making the current request stale.
   *
   * Use the whenStale callback to 'teardown' the objects required for the current route, this gives
   * a chance for views to hide themselves and unbind any event handlers etc.
   *
   * Example
   *
   *     this.get('/foo', function (req) {
   *       var fooView = new FooView ()
   *       fooView.render() // display the foo view
   *       req.whenStale(function (nextReq) {
   *         fooView.remove() // stop displaying foo view and unbind any events
   *       })
   *     })
   *
   * @param {Function} callback A single callback that will be called when the request becomes stale.
   * @memberOf Request
   *
   */
  Request.prototype.whenStale = function (callback) {
    this._staleCallback = callback;
  }

  /**
   * Mark the request as stale.
   *
   * This will cause the whenStale callback to be called.
   *
   * @param {Davis.Request} req The next request that has been recieved.
   * @memberOf Request
   */
  Request.prototype.makeStale = function (req) {
    this._staleCallback.call(req, req);
  }

  /**
   * Returns the location or path that should be pushed onto the history stack.
   *
   * For get requests this will be the same as the path, for post, put, delete and state requests this will
   * be blank as no location should be pushed onto the history stack.
   *
   * @returns {String} string The location that the url bar should display and should be pushed onto the history stack for this request.
   * @memberOf Request
   */
  Request.prototype.location = function () {
    return (this.method === 'get') ? decodeURI(this.fullPath) : ''
  }

  /**
   * Converts the request to a string representation of itself by combining the method and fullPath
   * attributes.
   *
   * @returns {String} string representation of the request
   * @memberOf Request
   */
  Request.prototype.toString = function () {
    return [this.method.toUpperCase(), this.path].join(" ")
  };

  /**
   * Converts the request to a plain object which can be converted to a JSON string.
   *
   * Used when pushing a request onto the history stack.
   *
   * @returns {Object} a plain object representation of the request.
   * @memberOf Request
   */
  Request.prototype.toJSON = function () {
    return {
      title: this.raw.title,
      fullPath: this.raw.fullPath,
      method: this.raw.method,
      timestamp: this.raw.timestamp
    }
  }

  /**
   * Creates a new request for the page on page load.
   *
   * This is required because usually requests are generated from clicking links or submitting forms
   * however this doesn't happen on a page load but should still be considered a request that the
   * JavaScript app should handle.
   *
   * @returns {Davis.Request} A request representing the current page loading.
   * @memberOf Request
   */
  Request.forPageLoad = function () {
    return new this ({
      method: 'get',
      // fullPath: window.location.pathname,
      fullPath: Davis.location.current(),
      title: document.title,
      forPageLoad: true
    });
  }

  /*!
   * Stores the last request
   * @private
   */
  Request.prev = null

  return Request

})()
/*!
 * Davis - App
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

Davis.App = (function () {

  /**
   * Constructor for Davis.App
   *
   * @constructor
   * @returns {Davis.App}
   */
  function App() {
    this.running = false;
    this.boundToInternalEvents = false;

    this.use(Davis.listener)
    this.use(Davis.event)
    this.use(Davis.router)
    this.use(Davis.logger)
  };

  /**
   * A convinience function for changing the apps default settings.
   *
   * Should be used before starting the app to ensure any new settings
   * are picked up and used.
   *
   * Example:
   *
   *     app.configure(function (config) {
   *       config.linkSelector = 'a.davis'
   *       config.formSelector = 'form.davis'
   *     })
   *
   * @param {Function} config This function will be executed with the context bound to the apps setting object, this will also be passed as the first argument to the function.
   */
  App.prototype.configure = function(config) {
    config.call(this.settings, this.settings);
  };

  /**
   * Method to include a plugin in this app.
   *
   * A plugin is just a function that will be evaluated in the context of the app.
   *
   * Example:
   *     app.use(Davis.title)
   *
   * @param {Function} plugin The plugin to use
   *
   */
  App.prototype.use = function(plugin) {
    plugin.apply(this, Davis.utils.toArray(arguments, 1))
  };

  /**
   * Method to add helper properties to all requests in the application.
   *
   * Helpers will be added to the Davis.Request.prototype.  Care should be taken not to override any existing Davis.Request
   * methods.
   *
   * @param {Object} helpers An object containing helpers to mixin to the request
   */
  App.prototype.helpers = function(helpers) {
    for (property in helpers) {
      if (helpers.hasOwnProperty(property)) Davis.Request.prototype[property] = helpers[property]
    }
  };

  /**
   * Settings for the app.  These may be overriden directly or by using the configure
   * convinience method.
   *
   * `linkSelector` is the jquery selector for all the links on the page that you want
   * Davis to respond to.  These links will not trigger a normal http request.
   *
   * `formSelector` is similar to link selector but for all the forms that davis will bind to
   *
   * `throwErrors` decides whether or not any errors will be caugth by Davis.  If this is set to true
   * errors will be thrown so that the request will not be handled by JavaScript, the server will have
   * to provide a response.  When set to false errors in a route will be caught and the server will not
   * receive the request.
   *
   * `handleRouteNotFound` determines whether or not Davis should handle requests when there is no matching
   * route.  If set to false Davis will allow the request to be passed to your server to handle if no matching
   * route can be found.
   *
   * `generateRequestOnPageLoad` determines whether a request should be generated for the initial page load.
   * by default this is set to false. A Davis.Request will not be generated with the path of the current
   * page.  Setting this to true will cause a request to be passed to your app for the inital page load.
   *
   * @see #configure
   */

  App.prototype.settings = {
    linkSelector: 'a',
    formSelector: 'form',
    throwErrors: true,
    handleRouteNotFound: false,
    generateRequestOnPageLoad: false
  };

  /**
   * Starts the app's routing.
   *
   * Apps created using the convinience Davis() function are automatically started.
   *
   * Starting the app binds all links and forms, so clicks and submits
   * create Davis requests that will be pushed onto the browsers history stack.  Browser history change
   * events will be picked up and the request that caused the change will be matched against the apps
   * routes and filters.
   */
   App.prototype.start = function(){
    var self = this;

    if (this.running) return

    if (!Davis.supported()) {
      this.trigger('unsupported')
      return
    };

    var runFilterWith = function (request) {
      return function (filter) {
        var result = filter.run(request, request);
        return (typeof result === "undefined" || result);
      }
    }

    var beforeFiltersPass = function (request) {
      return Davis.utils.every(
        self.lookupBeforeFilter(request.method, request.path),
        runFilterWith(request)
      )
    }

    var handleRequest = function (request) {
      if (beforeFiltersPass(request)) {
        self.trigger('lookupRoute', request)
        var route = self.lookupRoute(request.method, request.path);
        if (route) {
          self.trigger('runRoute', request, route);

          try {
            route.run(request)
            self.trigger('routeComplete', request, route)
          } catch (error) {
            self.trigger('routeError', request, route, error)
          }

          Davis.utils.every(
            self.lookupAfterFilter(request.method, request.path),
            runFilterWith(request)
          );

        } else {
          self.trigger('routeNotFound', request);
        }
      } else {
        self.trigger('requestHalted', request)
      }
    }

    var bindToInternalEvents = function () {
      self
        .bind('runRoute', function (request) {
          self.logger.info("runRoute: " + request.toString());
        })
        .bind('routeNotFound', function (request) {
          if (!self.settings.handleRouteNotFound && !request.isForPageLoad) {
            self.stop()
            request.delegateToServer()
          };
          self.logger.warn("routeNotFound: " + request.toString());
        })
        .bind('start', function () {
          self.logger.info("application started")
        })
        .bind('stop', function () {
          self.logger.info("application stopped")
        })
        .bind('routeError', function (request, route, error) {
          if (self.settings.throwErrors) throw(error)
          self.logger.error(error.message, error.stack)
        });

      Davis.location.onChange(function (req) {
        handleRequest(req)
      });

      self.boundToInternalEvents = true
    }

    if (!this.boundToInternalEvents) bindToInternalEvents()

    this.listen();
    this.trigger('start')
    this.running = true;

    if (this.settings.generateRequestOnPageLoad) handleRequest(Davis.Request.forPageLoad())

  };

  /**
   * Stops the app's routing.
   *
   * Stops the app listening to clicks and submits on all forms and links found using the current
   * apps settings.
   */
  App.prototype.stop = function() {
    this.unlisten();
    this.trigger('stop')
    this.running = false
  };

  return App;
})()

var aWindow;

aWindow = aWindow || {};

aWindow.log = function(msg1, msg2) {
  'use strict';
  if ((typeof console !== "undefined" && console !== null) && (console.log != null)) {
    if (msg2) {
      return console.log(msg1, msg2);
    } else {
      return console.log(msg1);
    }
  }
};

aWindow.DB = function(key) {
  var store;
  store = window.localStorage || {};
  return {
    get: function() {
      return JSON.parse(store[key] || '{}');
    },
    put: function(data) {
      return store[key] = JSON.stringify(data);
    }
  };
};

var aWindow;

aWindow = aWindow || {};

aWindow.cache = {
  $window: $(window),
  $document: $(document),
  $html: $(document.documentElement),
  $body: $(document.body),
  $title: $('title')
};

var aWindow;

aWindow = aWindow || {};

aWindow.template = {
  primary: _.template($('#primaryTemplate').html()),
  contactPartial: _.template($('#contactPartial').html()),
  homepageDisplayPartial: _.template($('#homepageDisplayPartial').html()),
  metaListPartial: _.template($('#metaListPartial').html())
};

$('script[type="text/html"]').remove();

var aWindow;

aWindow = aWindow || {};

aWindow.modelBuildr = (function() {
  'use strict';
  var createCleanModel, getData, init;
  init = function(callback) {
    return getData(callback);
  };
  getData = function(callback) {
    var contentSpreadsheetID, request;
    contentSpreadsheetID = '0AvY0yhzqHzgSdDRjV1UzcUxfQnRmSDNKcEhkUDlKeHc';
    request = $.ajax({
      url: 'https://spreadsheets.google.com/feeds/list/' + contentSpreadsheetID + '/od6/public/values?alt=json-in-script',
      dataType: 'jsonp'
    });
    request.done(function(data) {
      return createCleanModel(data, callback);
    });
    return request.fail(function(data) {
      aWindow.model = {
        status: 'error',
        description: 'unable to talk to Google',
        data: data
      };
      return callback();
    });
  };
  createCleanModel = function(data, callback) {
    var postProcessing, processGeneral, sortRawInput;
    aWindow.model = {};
    sortRawInput = function(obj) {
      var key, tempCleanObj;
      key = obj.gsx$newpagetype.$t;
      tempCleanObj = processGeneral(obj, key);
      switch (key) {
        case 'edition':
          aWindow.model.settings = aWindow.model.settings || {};
          aWindow.model.settings.currentEdition = tempCleanObj.normalized;
          tempCleanObj = _.extend(tempCleanObj, {
            items: [],
            collaborators: [],
            location: obj['gsx$edition-location']['$t'].replace(/\n/g, '<br/>'),
            hours: obj['gsx$edition-hours']['$t'].replace(/\n/g, '<br/>'),
            contact: {
              email: obj['gsx$edition-contact-email']['$t'],
              phone: obj['gsx$edition-contact-phone']['$t']
            }
          });
          break;
        case 'collaborator':
          tempCleanObj = _.extend(tempCleanObj, {
            associatedWithEditions: [],
            items: []
          });
          break;
        case 'item':
          tempCleanObj = _.extend(tempCleanObj, {
            creator: obj['gsx$item-creator']['$t'],
            edition: obj['gsx$item-edition']['$t'],
            price: obj['gsx$item-price']['$t'],
            madeToOrder: obj['gsx$item-madetoorder']['$t'] === 'TRUE' ? true : false,
            productionRun: obj['gsx$item-productionrun']['$t'],
            timeToShip: obj['gsx$item-timetoship']['$t'],
            windowDisplay: {
              media: obj['gsx$item-windowdisplaymedia']['$t'],
              position: {
                top: obj['gsx$item-windowdisplaymediaposition-top']['$t'] !== '' ? obj['gsx$item-windowdisplaymediaposition-top']['$t'] : 0,
                left: obj['gsx$item-windowdisplaymediaposition-left']['$t'] !== '' ? obj['gsx$item-windowdisplaymediaposition-left']['$t'] : 0
              }
            }
          });
      }
      aWindow.model[key] = aWindow.model[key] || {};
      return aWindow.model[key][tempCleanObj.normalized] = tempCleanObj;
    };
    processGeneral = function(obj, key) {
      return {
        type: key,
        title: obj['gsx$' + key + '-title']['$t'],
        normalized: obj['gsx$' + key + '-normalized']['$t'],
        description: obj['gsx$' + key + '-description']['$t'].replace(/\n/g, '<br/>'),
        media: obj['gsx$' + key + '-media']['$t']
      };
    };
    postProcessing = function(callback) {
      aWindow.model.meta.root = {
        type: 'meta',
        title: 'Root',
        normalized: 'root',
        description: 'This is the homepage.'
      };
      aWindow.model.meta.editions = {
        type: 'meta',
        title: 'Editions',
        normalized: 'editions',
        description: 'This is the Editions list.',
        displayOrder: _.keys(aWindow.model.edition)
      };
      aWindow.model.meta.collaborators = {
        type: 'meta',
        title: 'Collaborators',
        normalized: 'collaborators',
        description: 'This is the Collaborators list.',
        displayOrder: _.keys(aWindow.model.collaborator).sort()
      };
      _.each(aWindow.model.item, function(value, key) {
        aWindow.model.edition[value.edition].items.push(key);
        aWindow.model.edition[value.edition].collaborators.push(value.creator);
        return aWindow.model.collaborator[value.creator].items.push(key);
      });
      _.each(aWindow.model.edition, function(value, key) {
        value.collaborators.sort();
        return value.items.sort();
      });
      _.each(aWindow.model.collaborator, function(value, key) {
        return value.items.sort();
      });
      return callback();
    };
    if (data.feed.entry) {
      _.each(data.feed.entry, sortRawInput);
      return postProcessing(function() {
        return callback();
      });
    } else {
      aWindow.model = {
        status: 'error',
        description: 'no "entry" object returned',
        data: data
      };
      return callback();
    }
  };
  return {
    init: init
  };
})();

var aWindow;

aWindow = aWindow || {};

aWindow.router = function() {
  var beforePageRefresh, routes, sendContactForm, updateCurrentPage;
  beforePageRefresh = function() {
    if (aWindow.model.settings.currentPage) {
      return aWindow.cache.$body.removeClass(aWindow.model.settings.currentPage.type + ' ' + aWindow.model.settings.currentPage.titleNormalized);
    }
  };
  updateCurrentPage = function(type, titleNormalized) {
    var pageTitle;
    aWindow.model.settings.currentPage = _.extend(aWindow.model.settings.currentPage || {}, {
      type: type,
      titleNormalized: titleNormalized
    });
    pageTitle = type !== 'meta' && titleNormalized !== 'root' ? '{a window] | ' + type + ' | ' + aWindow.model[type][titleNormalized].title : titleNormalized === 'root' ? '{a window]' : '{a window] | ' + aWindow.model[type][titleNormalized].title;
    aWindow.cache.$title.text(pageTitle);
    aWindow.cache.$body.addClass(type + ' ' + titleNormalized);
    return $('#primaryContainer').html(aWindow.template.primary({
      data: aWindow.model,
      currentType: type,
      currentTitleNormalized: titleNormalized,
      currentPageTitle: pageTitle
    }));
  };
  sendContactForm = function(req) {
    var contactReq;
    return contactReq = $.ajax({
      type: 'POST',
      url: req.path,
      data: req.params,
      success: function(data) {
        return console.log(data);
      },
      error: function(data) {
        return console.log(data);
      }
    });
  };
  routes = Davis(function() {
    this.configure(function(config) {
      return config.generateRequestOnPageLoad = true;
    });
    this.before(beforePageRefresh);
    this.get('/', function() {
      return updateCurrentPage('meta', 'root');
    });
    this.get('/:titleNormalized', function(req) {
      return updateCurrentPage('meta', req.params.titleNormalized);
    });
    this.get('/:type/:titleNormalized', function(req) {
      return updateCurrentPage(req.params.type, req.params.titleNormalized);
    });
    return this.post('/contact', sendContactForm);
  });
  return {
    routes: routes
  };
};

var aWindow;

aWindow = aWindow || {};

aWindow.init = (function() {
  'use strict';
  aWindow.store = aWindow.store || aWindow.DB('heardApp');
  return aWindow.modelBuildr.init(function() {
    return aWindow.router();
  });
})();

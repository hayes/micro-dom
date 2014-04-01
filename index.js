var htmlparser = require('htmlparser2')
  , dom = require('dom-lite')

module.exports = dom

var document = dom.document

var el_proto = Object.getPrototypeOf(document.createElement('p'))
  , node_proto = Object.getPrototypeOf(el_proto)
  , doc_proto = Object.getPrototypeOf(document)

Object.defineProperty(node_proto, 'innerHTML', {
    get: get_html
  , set: set_html
})

Object.defineProperty(el_proto, 'attributes', {
    get: get_attributes
})

doc_proto.createElementNS = createElementNS

function get_html() {
  return node_proto.toString.call(this)
}

function set_html(html) {
  var parser = new htmlparser.Parser(new htmlparser.DomHandler(parsed))
    , self = this

  parser.write(html)
  parser.end()

  function parsed(err, nodes) {
    if(err) {
      throw err
    }

    self.childNodes = []
    add_children(self, nodes)
  }
}

function add_children(root, nodes) {
  var attrs
    , el

  for(var i = 0, l = nodes.length; i < l; ++i) {
    if(nodes[i].type === 'text') {
      el = document.createTextNode(nodes[i].data)
    } else if(nodes[i].type === 'comment') {
      el = document.createComment(nodes[i].data)
    } else if(nodes[i].type === 'tag') {
      el = document.createElement(nodes[i].name)
      attrs = Object.keys(nodes[i].attribs)

      for(var j = 0, l2 = attrs.length; j < l2; ++j) {
        el.setAttribute(attrs[j], nodes[i].attribs[attrs[j]])
      }

      add_children(el, nodes[i].children)
    } else {
      continue
    }

    root.appendChild(el)
  }
}

function get_attributes() {
  var self = this

  var keys = Object.keys(this).filter(el_proto.hasAttribute.bind(self))

  return keys.map(function(key) {
    return {
        name: key
      , value: self[key]
    }
  })
}

function createElementNS(ns, tag) {
  return this.createElement(tag)
}

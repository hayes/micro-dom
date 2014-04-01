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

      for(var j = 0, l = attrs.length; j < l; ++j) {
        el.setAttribute(attrs[j], nodes[i].attribs[attrs[j]])
      }

      add_children(el, nodes[i].children)
    } else {
      continue
    }

    root.appendChild(el)
  }
}

function createElementNS(ns, tag) {
  return this.createElement(tag)
}

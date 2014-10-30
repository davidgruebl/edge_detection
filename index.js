require('pixastic.laplace')
require('pixastic.edges')
require('pixastic.edges2')
var $ = require('jquery')
var Pixastic = require('pixastic')
var imagesLoaded = require('imagesloaded')

var lib = require('./lib')

var Filters = lib.Filters

var img = $('#orig')[0]

var canvas = document.createElement('canvas')
canvas.width = 336
canvas.height = 336

function process(name, options) {
    var dom = img = $('#pixeltastic' + require('capitalize')(name))[0]
    Pixastic.revert(dom)
    Pixastic.process(dom, name, options)
}

process('edges')
process('edges2')
process('laplace', {
    invert: true
})

imagesLoaded(img, function() {
    var canvases = $('#customFilter')[0].getElementsByTagName('canvas')
    for (var i = 0; i < canvases.length; i++) {
        var c = canvases[i]
        c.parentNode.insertBefore(img.cloneNode(true), c)
        c.style.display = 'none'
    }

    var grayscale = function() {
        lib.runFilter('grayscale', Filters.grayscale)
    }

    var sobel = function() {
        lib.runFilter('sobel', function(px) {
            px = Filters.grayscale(px)
            var vertical = Filters.convoluteFloat32(px,
                    [-1, -2, -1,
                        0, 0, 0,
                        1, 2, 1] )
            var horizontal = Filters.convoluteFloat32(px,
                    [-1, 0, 1,
                        -2, 0, 2,
                        -1, 0, 1] )
            var id = Filters.createImageData(vertical.width, vertical.height)
            for (var i = 0; i < id.data.length; i += 4) {
                var v = Math.abs( vertical.data[i] )
                id.data[i] = v
                var h = Math.abs(horizontal.data[i])
                id.data[i + 1] = h
                id.data[i + 2] = (v + h) / 4
                id.data[i + 3] = 255
            }
            return id
        })
    }
    sobel()

    var custom = function() {
        var inputs = $('#customMatrix input')
        var arr = []
        for (var i = 0; i < inputs.length; i++) {
            arr.push(parseFloat(inputs[i].value))
        }
        lib.runFilter('custom', Filters.convolute, arr, true)
    }
    custom()

}, false)
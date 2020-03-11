import makerjs from 'makerjs';
import { load } from 'opentype.js';
import { SVG } from '@svgdotjs/svg.js'

function App() {
  var _this = this;
  this.renderCurrent = function() {
    _this.render(_this.font, _this.textInput.value)
  };
  this.changeFont = function() {
    _this.randomizeFont();
    _this.renderCurrent();
  }
}
App.prototype.handleEvents = function() {
  this.changeButton.onclick = this.changeFont;
  this.downloadButton.onclick = this.downloadSVG;
  this.printButton.onclick = this.printSVG;
  this.textInput.onchange = this.textInput.onkeyup = this.renderCurrent;
}

App.prototype.downloadSVG = function() {
  var dl = document.createElement("a");
  document.body.appendChild(dl);
  var svgXML = (new XMLSerializer).serializeToString(document.getElementById("svg-nametag"));
  var dataURL = "data:image/svg+xml," + encodeURIComponent(svgXML);
  dl.setAttribute("href", dataURL);
  dl.setAttribute("download", "nametag.svg")
  dl.click();
}

App.prototype.printSVG = function() {
  console.log("printing svg");
  modal = document.querySelector("#modal-control");
  modal.checked = true;
  var xhr = new XMLHttpRequest();
  var ti = document.querySelector('#input-text');
  var svgXML = (new XMLSerializer).serializeToString(document.getElementById("svg-nametag"));
  var data = JSON.stringify({"text": ti.value, "svg": svgXML});
  var url = "http://localhost:5000/";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(data);
  ti.value = "Next!";
  window.app.renderCurrent();
}

App.prototype.randomizeFont = function() {
  this.font = this.fontList[Math.floor(Math.random()*this.fontList.length)];
}

App.prototype.init = function() {
  this.textInput = document.querySelector('#input-text');
  this.changeButton = document.querySelector('#change-button');
  this.downloadButton = document.querySelector('#dl-button');
  this.printButton = document.querySelector('#print-button');
  this.renderDiv = document.querySelector('#svg-render');
  this.getFontList();
  this.handleEvents();
}
App.prototype.getFontList = function() {
  var _this = this;
  var xhr = new XMLHttpRequest();
  xhr.open('get', 'fonts/all.json', true);
  xhr.onloadend = function() {
    _this.fontList = JSON.parse(xhr.responseText).files;
    _this.randomizeFont();
    _this.renderCurrent();
  };
  xhr.send();
}

function waveMaker(start, end, midpoints, offset, start_up=false) {
  const points = [start]
  dx = end[0] - start[0];
  dy = end[1] - start[1];
  step = 1/midpoints;
  var i;
  var up = start_up;
  for (i = step; i < 1; i += step) {
    var y = start[1] + dy*i;
    if (up) {
      y += offset;
    } else {
      y -= offset;
    }
    up = !up;
    points.push([start[0] + dx*i, y])
  }
  points.push(end);
  //console.log(points);
  return new makerjs.models.BezierCurve(points);
}

App.prototype.render = function(font, text) {
  var _this = this;
  var url = "fonts/" + font;
  load(url, function (err, font) {
    var textModel = new makerjs.models.Text(font, text, 100, false, false, undefined);
    textModel.units = makerjs.unitType.Inch;
    
    var measure = makerjs.measure.modelExtents(textModel);
    // console.log(measure);
    
    yScale = 4/measure.height;
    xScale = 7/measure.width;
    textModel = makerjs.model.scale(textModel, Math.min(yScale, xScale));
    makerjs.model.center(textModel);

    // console.log("after scaling");
    measure = makerjs.measure.modelExtents(textModel);
    //console.log(measure);

    var y_off = (5 - measure.height) / 4;
    

    var model = {
      paths: {},
      models: {
        text: textModel,
      }
    }

    var startx = measure.low[0] - 0.1;
    var endx = measure.high[0] + 0.1;
    var halfwidth = (endx - startx) / 2;
    var y1 = measure.high[1] + y_off
    var y2 = measure.low[1] - y_off

    model.paths.topline = new makerjs.paths.Line( 
      [startx, y1], [endx, y1]
    );
      
    model.paths.bottomline = new makerjs.paths.Line(
      [startx, y2], [endx, y2]
    );

    model.models.topsina = waveMaker([startx, y1], [startx+halfwidth, y1], 3, y_off/1.5)
    model.models.topsinb = waveMaker([startx+halfwidth, y1], [endx, y1], 3, y_off/1.5)
    model.models.bottomsina = waveMaker([startx, y2], [startx+halfwidth, y2], 3, y_off/1.5, true)
    model.models.bottomsinb = waveMaker([startx+halfwidth, y2], [endx, y2], 3, y_off/1.5, true)
     
    // console.log(model);

    makerjs.model.center(model)
    measure = makerjs.measure.modelExtents(model);

    var svg = makerjs.exporter.toSVG(model, {svgAttrs: {id: "svg-nametag"} });

    _this.renderDiv.innerHTML = svg;
    svg = document.getElementById("svg-nametag");
    svg.setAttribute("height", "5in")
    svg.setAttribute("width", "8in");
    svg.setAttribute("viewBox", "0 0 8 5");

    _this.svgjs = SVG(svg)
    var path = _this.svgjs.findOne('path');
    path.move((8-measure.width)/2, (5-measure.height)/2);

    // TODO add doodles above and below scaled by free space
    // leaves, hashed lines, sin waves, beagles rotating, manhattan distance random walk
    // perimiter box at 0.75 around
    // circles around perimiter
  });
}

var app = new App();
window.addEventListener("load", function () { app.init() }, false);

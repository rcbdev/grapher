(function (window, undefined) {
  var document = window.document
  
  , grapher = function (selector, options) {
    return new grapher.prototype.init(selector, options);
  }
  
  , defaults = {
    barColours: [
      '#7BCAE1'
      , '#FFBBBB'
      , '#FFFF99'
      , '#8CEFFD'
      , '#FF86FF'
      , '#B4D1B6'
    ]
    , lineColour: '#0072B5'
    , lineWidth: 2
    , axisColour: '#000000'
    , axisWidth: 2
    , wagonColours: [
      ''
      , '#FFFFFF'
      , '#CF54FF'
      , '#FFFF2B'
      , '#1428FC'
      , '#FCAB14'
      , '#FF0D0D'
    ]
    , wagonBackground: '#7CD14B'
    , wagonWidth: 2
    , pieColours: [
      '#7BCAE1'
      , '#FFBBBB'
      , '#FFFF99'
      , '#8CEFFD'
      , '#FF86FF'
      , '#B4D1B6'
    ]
    , pieBorderColour: '#000000'
    , pieBorderWidth: 2
  }
  
  , combineObjects = function (object1, object2) {
    var key, object = {};
    
    for (key in object1) {
      if (object1.hasOwnProperty(key)) {
        if (object2.hasOwnProperty(key)) {
          object[key] = object2[key];
        }
        else {
          object[key] = object1[key];
        }
      }
    }
    return object;
  }
  
  , axesOffset = 20
  
  , getMousePosition = function(e, elem) {
    var mousePos, elemPos, style
    
    mousePos = {x: 0, y: 0};
    elemPos = {x: elem.offsetLeft, y: elem.offsetTop};
    
    while (elem = elem.offsetParent) {
      if (elem.offsetLeft || elem.offsetTop) {
        elemPos.x += elem.offsetLeft;
        elemPos.y += elem.offsetTop;
      }
    }
    
    if (window.getComputedStyle) {
      style = getComputedStyle(document.body);
    }
    else {
      style = document.body.currentStyle;
    }
    
    elemPos.x += parseInt(style.marginLeft);
    elemPos.y += parseInt(style.marginTop);
    
    if (e.pageX || e.pageY) {
      mousePos.x = e.pageX;
      mousePos.y = e.pageY;
    }
    else if (e.clientX || e.clientY) {
      mousePos.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      mousePos.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    
    mousePos.x -= elemPos.x;
    mousePos.y -= elemPos.y;
    
    return mousePos;
  }
  
  , mouseMoveHandle = function(e) {
    var i, len;
    
    for (i = 0, len = this.g.chartTypes.length; i < len; i++) {
      switch (this.g.chartTypes[i]) {
        case 'pie':
          pieMouseMove.call(this, e);
          break;
      }
    }
  }
  
  , mouseOutHandle = function(e) {
    var i, len;
    
    for (i = 0, len = this.g.chartTypes.length; i < len; i++) {
      switch (this.g.chartTypes[i]) {
        case 'pie':
          pieMouseOut.call(this, e);
          break;
      }
    }
  }
  
  , pieMouseMove = function(e) {
    if (this.g.piePixelData) {
      var mousePos, idx, i, len, ctx;
      
      mousePos = getMousePosition(e, this);
      
      idx = 4 * (mousePos.x + mousePos.y * this.width) + 3;
      
      if (this.g.pieMouseOvers) {
        for (i = 0, len = this.g.pieMouseOvers.length; i < len; i++) {
          if (this.g.pieMouseOvers[i].pixels[idx]) {
            if (this.getContext) {
              ctx = this.getContext('2d');
              
              ctx.clearRect(0, 0, this.width, this.height);
              
              ctx.putImageData(this.g.piePixelData, 0, 0);
              
              ctx.save();
              
              ctx.strokeStyle = this.g.options.pieBorderColour;
              ctx.lineWidth = this.g.options.pieBorderWidth;
              
              ctx.beginPath();
              ctx.moveTo(this.g.pieMouseOvers[i].x1, this.g.pieMouseOvers[i].y1);
              ctx.lineTo(this.g.pieMouseOvers[i].xc, this.g.pieMouseOvers[i].yc);
              ctx.lineTo(this.g.pieMouseOvers[i].x2, this.g.pieMouseOvers[i].y2);
              
              ctx.stroke();
              
              ctx.font = '32px Calibri';
              
              ctx.fillStyle = '#000000';
              
              ctx.textAlign = 'right';
              ctx.textBaseline = 'bottom';
              
              ctx.fillText(this.g.pieMouseOvers[i].value, this.width - 15, this.height - 15);
              
              ctx.restore();
            }
            return;
          }
        }
      }
      
      if (this.getContext) {
        ctx = this.getContext('2d');
        
        ctx.clearRect(0, 0, this.width, this.height);
        
        ctx.putImageData(this.g.piePixelData, 0, 0);
      }
    }
  }
  
  , pieMouseOut = function(e) {
    if (this.g.piePixelData) {
      var ctx;
      
      if (this.getContext) {
        ctx = this.getContext('2d');
        
        ctx.clearRect(0, 0, this.width, this.height);
        
        ctx.putImageData(this.g.piePixelData, 0, 0);
      }
    }
  };
  
  grapher.fn = grapher.prototype = {
    init: function (selector, options) {
      var elem;
      
      this.options = combineObjects(defaults, options || {});
      
      if (selector.nodeType) {
        elem = selector;
      }
      else if (typeof selector === 'string') {
        elem = document.getElementById(selector);
      }
      
      this.element = elem;
      this.element.g = this;
      this.chartTypes = [];
      
      if(document.addEventListener)
      {
        elem.addEventListener('mousemove', mouseMoveHandle, false);
        elem.addEventListener('mouseout', mouseOutHandle, false);
      }
      else if(document.attachEvent)
      {
        elem.attachEvent('onmousemove', function(){ return mouseMoveHandle.call(elem, window.event); });
        elem.attachEvent('onmouseout', function(){ return mouseOutHandle.call(elem, window.event); });
      }
      
      return this;
    }
    
    , drawAxes: function(data) {
      var i, len, gHeight, gWidth, x, y, tickLength, letters, start;
      
      if(data.maxX) { this.maxX = data.maxX; }
      if(data.maxY) { this.maxY = data.maxY; }
      
      if (this.element.getContext) {
        gHeight = this.element.height - axesOffset;
        gWidth = this.element.width - axesOffset;
        
        ctx = this.element.getContext('2d');
        
        ctx.save();
        
        ctx.strokeStyle = this.options.axisColour;
        ctx.lineWidth = this.options.axisWidth;
        ctx.fillStyle = this.options.axisColour;
        
        ctx.beginPath();
        
        ctx.moveTo(axesOffset, 0);
        ctx.lineTo(axesOffset, gHeight);
        ctx.lineTo(this.element.width, gHeight);
        
        if (data.ticks) {
          if (this.maxY) {
            for (i = 1; i < this.maxY + 1; i++) {
              tickLength = data.bigTickY && i % data.bigTickY == 0 ? 6 : 3;
              
              x = axesOffset;
              y = gHeight - gHeight * i / (this.maxY);
              ctx.moveTo(x, y);
              ctx.lineTo(x - tickLength, y);
            }
          }
          if (this.maxX) {
            for (i = 1; i < this.maxX + 1; i++) {
              tickLength = data.bigTickX && i % data.bigTickX == 0 ? 6 : 3;
              
              x = axesOffset + gWidth * i / (this.maxX);
              y = gHeight;
              ctx.moveTo(x, y);
              ctx.lineTo(x, y + tickLength);
            }
          }
        }
        
        ctx.stroke();
        
        ctx.font = '12px Calibri';
        
        if (data.titleX) {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(data.titleX, axesOffset + gWidth / 2, gHeight + 7);
        }
        if (data.titleY) {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          letters = data.titleY.split('');
          start = gHeight / 2 - letters.length / 2 * 12;
          for(i = 0, len = letters.length; i < len; i++) {
            ctx.fillText(letters[i], 2, start + i * 12);
          }
        }
        
        ctx.restore();
      }
      
      return this;
    }
    
    , bar: function (data) {
      var i, len, gWidth, gHeight, bWidth, bHeight, ctx, max, start;
      
      start = { x: Math.round(axesOffset + this.options.axisWidth / 2), y: Math.round(axesOffset + this.options.axisWidth / 2) };
      gWidth = this.element.width - start.x;
      gHeight = this.element.height - start.y;
      max = { x: 0, y: 0 };
      
      if (this.maxX && this.maxY) {
        max.x = this.maxX;
        max.y = this.maxY;
      }
      else {
        for (i = 0, len = data.length; i < len; i++) {
          if (data[i] > max.y) { max.y = data[i]; }
        }
        max.x = data.length;
        this.drawAxes({ maxX: max.x, maxY: max.y, ticks: true, bigTickX: 5, bigTickY: 5 });
      }
      
      bWidth = gWidth / max.x;
      
      if (this.element.getContext) {
        ctx = this.element.getContext('2d');
        
        ctx.save();
        
        for (i = 0, len = data.length; i < len; i++) {
          bHeight = Math.round(gHeight * data[i] / max.y);
          ctx.fillStyle = this.options.barColours[i % this.options.barColours.length];
          ctx.fillRect(start.x + i * bWidth, gHeight - bHeight, bWidth, bHeight);
        }
        
        ctx.restore();
      }
      
      return this;
    }
    
    , line: function (data) {
      var i, len, gWidth, gHeight, ctx, max, x, y, start;
      
      start = { x: Math.round(axesOffset + this.options.axisWidth / 2), y: Math.round(axesOffset + this.options.axisWidth / 2) };
      gWidth = this.element.width - start.x;
      gHeight = this.element.height - start.y;
      max = { x: 0, y: 0 };
      
      if (this.maxX && this.maxY) {
        max.x = this.maxX;
        max.y = this.maxY;
      }
      else {
        for (i = 0, len = data.length; i < len; i++) {
          if (data[i].x > max.x) { max.x = data[i].x }
          if (data[i].y > max.y) { max.y = data[i].y }
        }
        this.drawAxes({ maxX: max.x, maxY: max.y, ticks: true, bigTickX: 5, bigTickY: 5 });
      }
      
      if (this.element.getContext) {
        ctx = this.element.getContext('2d');
        
        ctx.save();
        
        ctx.strokeStyle = this.options.lineColour;
        ctx.lineWidth = this.options.lineWidth;
        
        ctx.beginPath();
        
        x = Math.round(gWidth * data[0].x / max.x) + start.x;
        y = Math.round(gHeight - gHeight * data[0].y / max.y);
        
        ctx.moveTo(x, y);
        
        for (i = 1, len = data.length; i < len; i++) {
          x = Math.round(gWidth * data[i].x / max.x) + start.x;
          y = Math.round(gHeight - gHeight * data[i].y / max.y);
          
          ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        
        ctx.restore();
      }
      
      return this;
    }
    
    , wagon: function (data) {
      var center, gRad, i, len, ctx, angle, x, y, length;
      
      center = {
        x: this.element.width / 2,
        y: this.element.height / 2
      };
      
      gRad = Math.min(center.x, center.y) - 10;
      
      center.x = gRad + 10;
      center.y = gRad + 10;
      
      if (this.element.getContext) {
        ctx = this.element.getContext('2d');
        
        ctx.save();
        
        ctx.fillStyle = this.options.wagonBackground;
        
        ctx.beginPath();
        ctx.arc(center.x, center.y, gRad, 0, Math.PI * 2, true);
        
        ctx.fill();
        
        ctx.font = '12px Calibri';
          
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        ctx.fillStyle = '#000000';
        
        ctx.fillText('Runs', this.element.width - 28, 6);
        
        for (i = 1; i < 7; i++) {
          ctx.fillStyle = this.options.wagonColours[i];
          
          ctx.beginPath();
          ctx.arc(this.element.width - 15, 12 * i + 8, 4, 0, Math.PI * 2, true);
          
          ctx.fill();
          ctx.stroke();
          
          ctx.fillStyle = '#000000';
          
          ctx.fillText(i, this.element.width - 8, 12 * i + 8);
        }
        
        ctx.restore();
        
        ctx.save();
        
        ctx.lineWidth = this.options.wagonWidth;
        
        for (i = 0, len = data.length; i < len; i++) {
          if(data[i].runs > 0) {
            angle = data[i].angle / 180 * Math.PI;
            length = data[i].length * gRad;
            
            x = center.x + Math.sin(angle) * length;
            y = center.y - Math.cos(angle) * length;
            
            ctx.strokeStyle = this.options.wagonColours[data[i].runs];
            
            ctx.beginPath();
            
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(x, y);
            
            ctx.stroke();
          }
        }
        
        ctx.restore();
      }
      
      return this;
    }
    
    , pie: function(data) {
      var center, gRad, i, len, j,
        len2, ctx, angle, lastAngle,
        total, x1, y1, x2, y2,
        tempCanvas, tempCtx, tempPixels,
        txtOffset;
      
      center = {
        x: this.element.width / 2,
        y: this.element.height / 2
      };
      
      gRad = Math.min(center.x, center.y) - 10;
      lastAngle = 0;
      total = 0;
      
      center.x = gRad + 10;
      center.y = gRad + 10;
      
      x1 = center.x + gRad;
      y1 = center.y;
      
      this.pieMouseOvers = [];
      
      for (i = 0, len = data.length; i < len; i++) {
        total += data[i].value;
      }
      
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.element.width;
      tempCanvas.height = this.element.height;
      
      if (!tempCanvas.getContext && G_vmlCanvasManager) {
        G_vmlCanvasManager.initElement(tempCanvas);
      }
      
      if (this.element.getContext) {
        tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.fillStyle = '#000000';
        
        ctx = this.element.getContext('2d');
        
        ctx.save();
        
        ctx.font = '12px Calibri';
        
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        for (i = 0, len = data.length; i < len; i++) {
          angle = lastAngle + Math.PI * 2 * data[i].value / total;
          
          ctx.fillStyle = this.options.pieColours[i];
          
          x2 = center.x + Math.cos(angle) * gRad;
          y2 = center.y + Math.sin(angle) * gRad;
          
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(x1, y1);
          ctx.arc(center.x, center.y, gRad, lastAngle, angle, false);
          ctx.lineTo(center.x, center.y);
          
          ctx.fill();
          
          if (tempCtx.getImageData) {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.beginPath();
            tempCtx.moveTo(center.x, center.y);
            tempCtx.lineTo(x1, y1);
            tempCtx.arc(center.x, center.y, gRad, lastAngle, angle, false);
            tempCtx.lineTo(center.x, center.y);
            
            tempCtx.fill();
            
            txtOffset = tempCtx.measureText(data[i].key).width + 15;
            
            tempCtx.fillRect(this.element.width - txtOffset, 12 * i + 2, txtOffset, 12);
            
            tempPixels = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
            
            this.pieMouseOvers.push({
              value: data[i].value
              , x1: x1
              , y1: y1
              , x2: x2
              , y2: y2
              , xc: center.x
              , yc: center.y
              , pixels: {}
            });
            
            for (j = 3, len2 = tempPixels.length; j < len2; j+=4) {
              if (tempPixels[j]) {
                this.pieMouseOvers[i].pixels[j] = 1;
              }
            }
          }
          
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          
          ctx.beginPath();
          ctx.arc(this.element.width - 8, 12 * i + 8, 4, 0, Math.PI * 2, true);
          
          ctx.fill();
          ctx.stroke();
          
          ctx.fillStyle = '#000000';
          
          ctx.fillText(data[i].key, this.element.width - 15, 12 * i + 8);
          
          lastAngle = angle;
          x1 = x2;
          y1 = y2;
        }
        
        ctx.strokeStyle = this.options.pieBorderColour;
        ctx.lineWidth = this.options.pieBorderWidth;
        
        ctx.beginPath();
        ctx.arc(center.x, center.y, gRad, 0, Math.PI * 2, true);
        
        ctx.stroke();
        
        if (ctx.getImageData) {
          this.piePixelData = ctx.getImageData(0, 0, this.element.width, this.element.height);
        }
        
        ctx.restore();
      }
      
      tempCanvas = null;
      
      this.chartTypes.push('pie');
      
      return this;
    }
    
    , clear: function() {
      if (this.element.getContext) {
        ctx = this.element.getContext('2d');
        
        ctx.clearRect(0, 0, this.element.width, this.element.height);
      }
      
      if (this.pieMouseOvers) {
        this.pieMouseOvers = undefined;
      }
      
      if (this.chartTypes) {
        this.chartTypes = [];
      }
      
      if (this.piePixelData) {
        this.piePixelData = undefined;
      }
      
      return this;
    }
    
    , resetAxes: function() {
      this.maxX = undefined;
      this.maxY = undefined;
      
      return this;
    }
  }
  
  grapher.fn.init.prototype = grapher.fn;
  
  window.g = grapher;
})(this);
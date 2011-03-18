Oozi = function() {
	this.canvas = document.getElementsByName("myCanvas")[0];
	this.context = this.canvas.getContext("2d");
	this.cssBox = document.getElementById("myCSSBox");
	this.grid = null;
	this.aligner = align_grid;
	this.sprites = [];
	/*
	function align_staircase() {
		//console.log("aligning as a staircase");
		
    var bounds = { h: 0, w: 0 };
    var highest, longest = null;
    
    // find boundaries
    $.each(sprites, function(idx, sprite) {
      highest = (!highest || highest.h < sprite.h) ? sprite : highest;
      longest = (!longest || longest.w < sprite.w) ? sprite : longest;
    });
    
    bounds.h = highest.h; bounds.w = longest.w;
    
    Oozi.log("Boundaries determined: Width: " + bounds.w + ", Height: " + bounds.h);
    
    // split our sprites into their respective containers
    aligned = { hor: [], ver: [] };
    $.each(sprites, function(idx, sprite) {
      // if the sprite's height > width, then we add it to the vertical
      // list, else to the horizontal
      list = (sprite.h > sprite.w) ? "ver" : "hor";
      aligned[list].push(sprite);
    });
    
    Oozi.log("We have " + aligned.hor.length + " horizontal elements");
    Oozi.log("We have " + aligned.ver.length + " vertical elements");
    
    // align our sprites by their length descending
    aligned.hor.sort(function(a, b) { b.w - a.w });
    aligned.ver.sort(function(a, b) { b.h - a.h });
    
    aligned.all = [];
    
    // now one by one, let's place our sprites, first vertically then horizontally
    for (var i = 0; i < sprites.length; i) {
      if (aligned.ver.length != 0) {
        aligned.all.push(aligned.ver[0]);
        aligned.ver.shift();
        ++i;
      }
      
      if (aligned.hor.length != 0) {
        aligned.all.push(aligned.hor[0]);
        aligned.hor.shift();
        ++i;
      }
    }
    
    offset = { x: 0, y: 0 };
    $.each(aligned.all, function(idx, sprite) {
      sprite.x = offset.x;
      sprite.y = offset.y;

      if (idx % 2 == 0) {
        // vertical
        offset.x += sprite.w;
      } else {
        // horizontal
        if (offset.y + sprite.h < bounds.w
            && idx+1 != aligned.all.length 
            && bounds.w - ( offset.y + sprite.h ) > aligned.all[idx+1].h)
        {
          
          //console.log("offset y : " + offset.y + ", sprite h : " + sprite.h);
        } else { 
          //console.log("offset y : " + offset.y);
          offset.y += sprite.h;
        }
      }
      
    });
		
		Oozi.canvas.width = offset.x + aligned.all[aligned.all.length-1].w;
		Oozi.canvas.height = offset.y;
		
    return true;
  }; // align()
	*/
	function align_grid() {
		//console.log("aligning on a grid");
		
		this.grid = new Grid(this.sprites);
		this.grid.align();
		Oozi.canvas.height = this.grid.size.y * this.grid.cell_size.y;		
	}
	
	function align() {
		aligner();
	}
	
	function generateCSS() {
		myCSSBox.innerHTML = "";
		for (var i = 0; i < this.sprites.length; ++i) {
			var sprite = this.sprites[i];
			var p = document.createElement("p");
			sprite.render(context);
					
			//html = '<p id="' + sprite.name + '">';
			html = "";
			html += '<label for="' + sprite.name + '">.' + sprite.name + ' {</label>';
			html += '<br /><span>background-position: -' + sprite.x + 'px -' + sprite.y + 'px;</span>';
			html += '<br /><span>background-image: url(IMAGE_NAME.png);</span>';
			html += '<br /><span>background-repeat: no-repeat;</span>';
			html += '<br /><span>width: ' + sprite.w + 'px;</span>';
			html += '<br /><span>height: ' + sprite.h + 'px;</span>';
			html += '<br />}</p>';
			p.innerHTML = html;
			myCSSBox.appendChild(p);
		};		
	};
	
	function clearCanvas() {
	  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	  var w = this.canvas.width;
	  this.canvas.width = 1;
	  this.canvas.width = w;
	}
	
  return {
    log: function(msg) {
      console.log(msg);
    },
		reset: function() {
			grid = null;
			sprites = [];
			clearCanvas();
			myCSSBox.innerHTML = "<p><label>.null {</label><br /><span>foo: bar;</span><br /> }</p>";
			document.getElementById("overlay").style.display = "block";
		},
		
		addSprite: function(image) {
			sprite = new Sprite(image, image.name);
			sprites.push(sprite);
		},
		
		render: function() {
			if (sprites.length == 0)
				return;
			
			clearCanvas();
			align();
			for (var i = 0; i < sprites.length; ++i) {
				sprites[i].render(context);
			};
			generateCSS();
		},
		
		canvas: this.canvas,
		context: this.context
  }
}();
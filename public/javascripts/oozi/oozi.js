var myCanvas = document.getElementById("myCanvas");
var myContext = myCanvas.getContext("2d");

Oozi = function() {
	this.aligner = align_grid;
	this.sprites = [];
	this.grid = null;
	
	function align_staircase() {
		console.log("aligning as a staircase");
		
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
          
          console.log("offset y : " + offset.y + ", sprite h : " + sprite.h);
        } else { 
          console.log("offset y : " + offset.y);
          offset.y += sprite.h;
        }
      }
      
    });
		
		myCanvas.width = offset.x + aligned.all[aligned.all.length-1].w;
		myCanvas.height = offset.y;
		
    return true;
  }; // align()

	function align_grid() {
		console.log("aligning on a grid");
		
		this.grid = new Grid(sprites);
		this.grid.align();
		myCanvas.height = this.grid.size.y * this.grid.cell_size.y;		
	}
	
	function align() {
		this.aligner();
	}
	
	function generateCSS() {
		var myCSSBox = $("#myCSSBox");
		myCSSBox.empty();
		$.each(this.sprites, function(idx, sprite) {
			sprite.render(myContext);
			html = "<p class='css-class' id='" + sprite.name + "'>";
			html += "<label for='" + sprite.name + "'>." + sprite.name + " {</label>";
			html += "<br /><span class='css-directive'>background-position: " + sprite.x + " " + sprite.y + ";</span>";
			html += "<br /><span class='css-directive'>background-image: url(IMAGE_NAME.png);</span>"
			html += "<br /><span class='css-directive'>background-repeat: no-repeat;</span>"
			html += "<br /><span class='css-directive'>width: " + this.w + ";</span>"
			html += "<br /><span class='css-directive'>height: " + this.h + ";</span>"
			html += "<br />}</p>"
			myCSSBox.append(html);
		});		
	};
	
	function clearCanvas(context, canvas) {
	  myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
	  var w = myCanvas.width;
	  myCanvas.width = 1;
	  myCanvas.width = w;
	}
	
  return {
    log: function(msg) {
      console.log(msg);
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
			$.each(sprites, function(idx, sprite) {
				sprite.render(myContext);
			});
			generateCSS();
		},
		
		chooseScheme: function(scheme) {
			if (scheme == "vertical") {
				aligner = align_vertically;
			} else if (scheme == "staircase") {
				aligner = align_staircase;
			} else {
				aligner = align_grid;
			}
			
			myCanvas.width = 600;
			myCanvas.height = 480;
			this.render();
		},
		sprites: this.sprites,
		grid: this.grid,
		aligner: this.aligner
  }
}();
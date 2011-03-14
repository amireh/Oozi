function Grid(in_sprites) {
  this.cell_size = { x: 12, y: 12 };
  this.size = { x: 0, y: 0 };
  this.cells = [];
  this.sprites = sprites;
	this.cell_spacing = 0;
	this.max_width = 600;
	
};

Grid.prototype = {
	optimize: function() {
		// attempt to locate an empty row, and if successful, truncate
		// the grid from that row (it's unused space)
		var row_empty = true;
		var empty_row = 0;
		var last_full_column = 0;
    for (var y=0; y < this.size.y; ++y) {
			row_empty = true;
      for (var x=0; x < this.size.x; ++x) {
				if (!this.cells[y][x].free) {
					row_empty = false;
					break;				
				}
			}
			if (row_empty)
				break;
		}
		
		empty_row = y;
		if (empty_row != 0) {
			this.size.y = empty_row;
			myCanvas.height = this.size.y * this.cell_size.y;			
		}

    for (var y=0; y < this.size.y; ++y) {
      for (var x=0; x < this.size.x; ++x) {
				if (!this.cells[y][x].free && x > last_full_column) {
					last_full_column = x;
					//console.log("rightmost full column: " + x);
				}
			}
		}
		if (last_full_column != 0) {
			this.size.x = last_full_column+1;
			myCanvas.width = this.size.x * this.cell_size.x;
		}
				
		//console.log("last full column is at " + last_full_column);
		// now let's clear horizontal space if we can
		
		return 0;
	},
  calc_size: function() {
		var smallest = null;
    var count = { w: 0, h: 0 };
    $.each(this.sprites, function(idx, sprite) {
			if (!smallest || (sprite.w < smallest.w && sprite.h < smallest.h)) {
				smallest = sprite;
			}
      count.w += sprite.w;
      count.h += sprite.h;
    });
    
		this.cell_size.x = smallest.w + (smallest.w % 2) + this.cell_spacing;
		this.cell_size.y = smallest.h + (smallest.h % 2) + this.cell_spacing;
		
		if (count.w > this.max_width)
			count.w = this.max_width;
		
    this.size.x = parseInt(Math.ceil(count.w / this.cell_size.x));
    this.size.y = parseInt(Math.ceil(count.h / this.cell_size.y));
    
    //Oozi.log("Grid dimensions are " + this.size.x + "x" + this.size.y + "" +
    //         " and cells are " + this.cell_size.x + "x" + this.cell_size.y + "px wide");
  },
  
  // based on grid size, prepares the cells for holding sprites
  build: function() {
    for (var y=0; y < this.size.y; ++y) {
      this.cells[y] = [];
      for (var x=0; x < this.size.x; ++x) {
        this.cells[y][x] = { free: true, sprite: null }; 
      }
    }  
  },
  
  // finds the optimum position for the sprite in the grid based on its dimensions
  find_pos: function(sprite) {
  
		dim = sprite.toGrid(this.cell_size);
		//console.log(sprite);
		
    // find first empty cell in row
    candidates = [];
    for (var y=0; y <= this.size.y-dim.h; ++y) {
      for (var x=0; x <= this.size.x-dim.w; ++x) {
        if (this.cells[y][x].free) {
          //console.log("found a free cell at " + y + ", " + x);
          candidates.push({ x: x, y: y });
          break;
        }
      }
    }
        
    for (var foo = 0; foo < candidates.length; ++foo) {
      var candidate = candidates[foo];
      cell = this.cells[candidate.y][candidate.x];
      
			
      var cols_available = true;
      var rows_available = true;
      
     
      // now let's check the rows below [i-height]
      for (var x=candidate.x; x < dim.w; ++x) {
        for (var y=candidate.y; y < dim.h; ++y) {
          if (!this.cells[y][x].free) {
            rows_available = false;
            break;
          }
        }
        if (!rows_available) // there's no need to go on
          break;
      }
      
      if (!rows_available)
        continue;
      
      // okay if we're here, then there is room for it, let's place it
      sprite.x = candidate.x * this.cell_size.x;
      sprite.y = candidate.y * this.cell_size.y;
      // now we have mark all the cells as full
			//console.log("should be placing @ " + candidate.x + ", " + candidate.y);
      for (var y=candidate.y; y < candidate.y+dim.h; ++y)
        for (var x=candidate.x; x < candidate.x+dim.w; ++x) {
          this.cells[y][x].free = false;
          this.cells[y][x].sprite = sprite;
					//console.log("marked cell " + y + ", " + x + " as full");
        }
      
      cell.free = false;
      //console.log("placed sprite at " + sprite + ", candidate was " + candidate.x + ", " + candidate.y);
      return; // no need to check other candidates, we're done;
    };
      
    // really shouldn't be here, display a message to the user
		//console.log("WARNING: SHOULD NOT BE HERE");
    return { x: 0, y: 0 };
  },
  
  // attaches sprite to a position on the grid and locks it
  place: function(sprite) {
    this.find_pos(sprite);
    //sprite.x = pos.x * this.cell_size.x; 
    //sprite.y = pos.y * this.cell_size.y;
    //this.cells[pos.x][pos.y] = { free: false, sprite: sprite }; 
  },
  
  align: function() {
    this.calc_size();
    this.build();
		// sort by largest first
		sprites = this.sprites.sort(function(a, b) { return (b.w + b.h) > (a.w + a.h) ? 1 : -1 });
    var self = this;
    $.each(sprites, function(idx, sprite) {
      self.place(sprite);
    });
		this.optimize();
  }
};
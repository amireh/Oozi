function Grid(in_sprites) {
  this.cell_size = { x: 12, y: 12 };
  this.size = { x: 0, y: 0 };
  this.cells = [];
  this.sprites = in_sprites;
	this.cell_spacing = 0;
	this.max_width = 600;
	
};

Grid.prototype = {
	
	// resizes the grid based on the empty cells
	optimize: function() {
		var row_empty = true;
		var empty_row = 0; // index of the empty row, if any
		// truncate vertically based on the first row with empty
		// cells to be found
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
			Oozi.canvas.height = this.size.y * this.cell_size.y;			
		}

		var last_full_column = 0; // index to the empty column, if any
		// find the first column that is empty in all rows
		// and use it as the horizontal truncating threshold
    for (var y=0; y < this.size.y; ++y)
      for (var x=0; x < this.size.x; ++x)
				if (!this.cells[y][x].free && x > last_full_column)
					last_full_column = x;
			
		
		if (last_full_column != 0) {
			this.size.x = last_full_column+1;
			Oozi.canvas.width = this.size.x * this.cell_size.x;
		}

		return 0;
	},
	
	// determines how many cells we need based on the area of all sprites
  calc_size: function() {
		var smallest = null;
    var count = { w: 0, h: 0 };
		for (var i=0; i < this.sprites.length; ++i) {
			var sprite = this.sprites[i];
			if (!smallest || (sprite.w < smallest.w && sprite.h < smallest.h))
				smallest = sprite;
			
      count.w += sprite.w;
      count.h += sprite.h;
    }
    
		this.cell_size.x = smallest.w + (smallest.w % 2) + this.cell_spacing;
		this.cell_size.y = smallest.h + (smallest.h % 2) + this.cell_spacing;
		
		//if (count.w > this.max_width)
		//	count.w = this.max_width;
		
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
  place: function(sprite) {
		dim = sprite.toGrid(this.cell_size);
		
    // find first empty cell in row
    candidates = [];
    for (var y=0; y <= this.size.y-dim.h; ++y) {
      for (var x=0; x <= this.size.x-dim.w; ++x) {
        if (this.cells[y][x].free) {
          candidates.push({ x: x, y: y });
          break; // if this cell is a candidate, then so will be all the remaining ones in row[y]
        }
      }
    }
    
		var i,x,y;
    for (i = 0; i < candidates.length; ++i) {
      var candidate = candidates[i];
      cell = this.cells[candidate.y][candidate.x];
      
      var cols_available = true;
      var rows_available = true;
      
      // now let's check the rows below [i-height]
      for (x = candidate.x; x < dim.w; ++x) {
        for (y = candidate.y; y < dim.h; ++y) {
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

      // now we have to mark all the cells we used
      for (y = candidate.y; y < candidate.y+dim.h; ++y)
        for (x = candidate.x; x < candidate.x+dim.w; ++x) {
          this.cells[y][x].free = false;
          this.cells[y][x].sprite = sprite;
        }
      
      cell.free = false;
      return; // no need to check other candidates, we're done
    };
      
    // really shouldn't be here, display a message to the user
		//console.log("WARNING: SHOULD NOT BE HERE");
    sprite.x = 0; sprite.y = 0;
  },
  
  align: function() {
    this.calc_size();
    this.build();

		// sort by largest area first
		var sorted = this.sprites.sort(function(a, b) { return (b.w + b.h) > (a.w + a.h) ? 1 : -1 });
		for (var i=0; i < sorted.length; ++i) {
			this.place(sorted[i]);
		}
		sorted = [];
		
		this.optimize();
  }
};
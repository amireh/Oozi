function Sprite() {
  this.w = 0;
  this.h = 0;
  this.x = 0;
  this.y = 0;
  
  this.aligned = false;
};

Sprite.prototype = {
  to_grid: function() {
    var size = { x: 12, y: 12 };
    return { 
      x: Math.ceil(this.x / size.x), 
      y: Math.ceil(this.y / size.y),
      w: Math.ceil(this.w / size.x),
      h: Math.ceil(this.h / size.y)
    }
  },
  toString: function() {
    return "[" + this.x + "," + this.y + "]";
  }
};

function Grid(in_sprites) {
  this.cell_size = { x: 12, y: 12 };
  this.size = { x: 0, y: 0 };
  this.cells = [];
  this.sprites = sprites;
};

Grid.prototype = {
  calc_size: function(sprites) {
    var count = { w: 0, h: 0 };
    $.each(this.sprites, function(idx, sprite) {
      count.w += sprite.w;
      count.h += sprite.h;
    });
    
    this.size.x = Math.ceil(count.w / this.cell_size.x);
    this.size.y = Math.ceil(count.h / this.cell_size.y);
    
    Oozi.log("Grid dimensions are " + this.size.x + "x" + this.size.y + "" +
             " and cells are " + this.cell_size.x + "x" + this.cell_size.y + "px wide");
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
  
    // find first empty cell in row
    candidates = [];
    for (var y=0; y < this.size.y-1; ++y) {
      for (var x=0; x < this.size.x-1; ++x) {
        if (this.cells[y][x].free) {
          //console.log("found a free cell at " + y + ", " + x);
          candidates.push({ x: x, y: y });
          break;
        }
      }
    }
    
    //var dim = sprite.to_grid();
    //console.log("sprite grid dim " + dim.w + "x" + dim.h);
    console.log("found " + candidates.length + " candidates");
    
    for (var foo = 0; foo < candidates.length; ++foo) {
      var candidate = candidates[foo];
      cell = this.cells[candidate.y][candidate.x];
      
      var cols_available = true;
      var rows_available = true;
      
      // see if there are enough columns in row to hold sprite [i-width]
      dim = sprite.to_grid();
      if (this.size.x - candidate.x < dim.w)
        continue; // there aren't, skip this candidate
      
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
      for (var y=candidate.y; y < dim.h; ++y)
        for (var x=candidate.x; x < dim.w; ++x) {
          this.cells[y][x].free = false;
          this.cells[y][x].sprite = sprite;
        }
      
      cell.free = false;
      console.log("placed sprite at " + sprite + ", candidate was " + candidate.x + ", " + candidate.y);
      break; // no need to check other candidates, we're done;
    };
      
      
      // if cells are available, place it
    // if there are no empty cells in row, move to next row (y+1)
    // if there is not enough space in current row, move to next row (y+1)
    
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
    var self = this;
    $.each(this.sprites, function(idx, sprite) {
      self.place(sprite);
    });
  }
};

Oozi = function() {
  this.colors = ["yellow", "red", "orange", "green", "blue", "black", "gray"];
  this.last_color = -1;
  this.zoom = 4;
  this.sprites = [];
  
  next_color = function() {
    if (this.last_color == this.colors.length-1)
      this.last_color = -1;
    
    this.last_color += 1;
    
    return this.colors[this.last_color];
  };
  
  return {
    sprites: this.sprites,
    zoom: this.zoom,
    log: function(msg) {
      console.log(msg);
    },
    
    populate: function() {
      var zoom = this.zoom;
      console.log(zoom);
      $.each(sprites, function(index, sprite) {
        
        h_sprite = $(".content").append("<div class='sprite'></div>").find(".sprite:last");
        h_sprite.css({
          "width": sprite.w * zoom, 
          "height": sprite.h * zoom, 
          "left": sprite.x * zoom,
          "top": sprite.y * zoom
        });
        h_sprite.css({ "background" : next_color() });
      });
      
      return true;
    }, // populate()

    align_grid: function() {
      grid = new Grid(sprites);
      grid.align();
      
      return true;
    },
    align: function() {
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
      return true;
    } // align()
  }
}();

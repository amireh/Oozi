Sprite = function(inImage, inName) {
	this.name = sanitize(inName);
	this.img = inImage;
  this.w = this.img.width;
  this.h = this.img.height;
  this.x = 0;
  this.y = 0;
  
  this.aligned = false;

	// strip the extension and remove all non-alphanumeric letters
	function sanitize(str) {
		return str.slice(0, str.lastIndexOf(".")).toLowerCase().replace("-", "_").replace(/\W/g, "");
	};
};

Sprite.prototype = {
  toGrid: function(cell_size) {
    var size = cell_size;
    return { 
      x: Math.ceil(this.x / size.x), 
      y: Math.ceil(this.y / size.y),
      w: Math.ceil(this.w / size.x),
      h: Math.ceil(this.h / size.y)
    }
  },
	// for convenience
  toString: function() {
    return "[" + this.x + "," + this.y + "], my dimensions are [" + this.w + "," + this.h + "]";
  },
	render: function(context) {
		context.drawImage(this.img, this.x, this.y);
	}
};
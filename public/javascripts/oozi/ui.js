/*
 *
 * Thanks to Jacob Seidelin for the snippet that exports the canvas
 * to an image file, Canvas2Image (http://www.nihilogic.dk/labs/canvas2image/)
 *
 * Credit for the HTML5 File API code goes to:
 *   Robert Nyman
 *   Web Page: http://robertnyman.com/html5/fileapi-upload/fileapi-upload.html
 */

window.onload = function() {
	
	var filesUpload = document.getElementById("files-upload"),
		dropArea = document.getElementById("dropbox"),
		infoTab = document.getElementById("info"),
		overlay = document.getElementById("overlay"),
		mySaveButton = document.getElementById("save");

	// will be used to track multi-image uploads (et la "batch")
	// so we render them all at once
	var last_batch_size = 0;
	var processed = 0;
	
  mySaveButton.addEventListener("click", function() {
    Canvas2Image.saveAsPNG(Oozi.canvas);
    return false;
  }, false);
  
	function uploadFile (file) {

		// if the file is an image and the web browser supports FileReader,
		// present a preview in the file list
		if (typeof FileReader !== "undefined" && (/image/i).test(file.type)) {
			img = new Image();
			reader = new FileReader();
			reader.onload = (function (theImg) {
				return function (evt) {
					theImg.src = evt.target.result;
					theImg.onload = function() {
						theImg.name = file.name;
						Oozi.addSprite(theImg);
						if (++processed == last_batch_size) {
							Oozi.render();
							last_batch_size = 0;
							processed = 0;
						}
					}
				};
			}(img));
			reader.readAsDataURL(file);
		}
	}

	function traverseFiles (files) {
		overlay.style.display = "none";
		if (typeof files !== "undefined") {
			last_batch_size = files.length;
			for (var i=0, l=files.length; i<l; i++) {
				uploadFile(files[i]);
			}			
		}
		else {
			dropArea.innerHTML = "No support for the File API in this web browser";
		}
	}

	filesUpload.addEventListener("change", function () {
		traverseFiles(this.files);
	}, false);

	dropArea.addEventListener("dragleave", function (evt) {
		var target = evt.target;
		this.className = this.className.replace(" over", "");
		if (target && target === dropArea) {
		}
		evt.preventDefault();
		evt.stopPropagation();
	}, false);

	dropArea.addEventListener("dragenter", function (evt) {
		//this.className += " over";
		this.className += " over";
		evt.preventDefault();
		evt.stopPropagation();
	}, false);

	dropArea.addEventListener("dragover", function (evt) {
		evt.preventDefault();
		evt.stopPropagation();
	}, false);

	dropArea.addEventListener("drop", function (evt) {
		this.className = this.className.replace(" over", "");
		traverseFiles(evt.dataTransfer.files);
		evt.preventDefault();
		evt.stopPropagation();
	}, false);
	
	document.getElementById("reset").addEventListener("click", function(evt) {
		Oozi.reset();		
	}, false);
	
	var captions = { 
		canvas: document.getElementById("canvas-caption"), 
		info: document.getElementById("info-caption")
	};
	
	captions["info"].addEventListener("click", function(evt) {
		
		dropArea.style.display = "none";
		infoTab.style.display = "block";
		
		captions["info"].className += " selected";
		captions["canvas"].className = captions["canvas"].className.replace(" selected", "");
	}, false);
	
	
	captions["canvas"].addEventListener("click", function(evt) {
		dropArea.style.display = "block";
		infoTab.style.display = "none";
		
		captions["canvas"].className += " selected";
		captions["info"].className = captions["info"].className.replace(" selected", "");
	}, false);
	
	SI.Files.stylizeAll();
};
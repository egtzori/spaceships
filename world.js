// create a world

// world from image
function world(image, times_x, times_y, view_w, view_h) {
	this.times_x = times_x;
	this.times_y = times_y;
	this.image = image;
	this.total_width = this.image.width * times_x;
	this.total_height= this.image.height * times_y;
	this.half_width = this.total_width / 2;
	this.half_height = this.total_height / 2;
	this.view_w = view_w;
	this.view_h = view_h;
	this.view_hw = view_w/2;
	this.view_hh = view_h/2;

	// bg image offsets
	this.offset_x = 0;
	this.offset_y = 0;

	// all objects
	this.objects = {};

	this.ui = false; // true = update divs/
	this.debug = false;

	console.log("new world (%d/%d) from %s", this.total_width, this.total_height, this.image.src);
}

world.prototype.create_div = function() {
	this.div = creatediv("", null, this.view_w, this.view_h, false, false, false);
	this.div.style.backgroundImage = "url('" + this.image.src + "')";
	this.div.style.overflow = "hidden";
	if (true === this.debug) {
		var span = document.createElement("span");
		span.className = "obj_debug";
		span.style.zIndex = 2;
		this.div.appendChild(span);
		this.debug_span = span;
	}
}

world.prototype.set_offset = function(ofs_x, ofs_y) {
	this.offset_x = ofs_x;
	this.offset_y = ofs_y;
	this.div.style.backgroundPosition = ofs_x + "px " + ofs_y + "px";
	//console.log("new offset %d %d", ofs_x, ofs_y);
}

world.prototype.add_offset = function (add_x, add_y) {
	this.offset_x += add_x;
	this.offset_y += add_y;
	this.offset_x %= this.total_width;
	this.offset_y %= this.total_height;
	this.set_offset(this.offset_x, this.offset_y);
}

world.prototype.add_object = function(obj) {
	this.objects[obj.guid] = obj;
	if (true == this.ui) {
		this.update_object_world_pos(obj);
		this.div.appendChild(obj.div);
	}
}

world.prototype.remove_object = function(obj) {
	if ("undefined" !== typeof obj && "undefined" !== typeof obj.guid &&  "undefined" !== typeof this.objects[obj.guid]) {
		delete this.objects[obj.guid];
		if (true == this.ui) {
			this.div.removeChild(obj.div);
		}
	}
}

world.prototype.wrap_coords = function(c, total) {
	//console.log("wrap %d %d = %d", c, total, (c + total) % total);
	return (c + total) % total;
}

world.prototype.centerview_on_object = function(obj) {
	var new_x = (this.total_width + -obj.x +this.view_hw - obj.hw) % this.total_width;
	var new_y = (this.total_height + -obj.y +this.view_hh - obj.hh) % this.total_height;

	//console.log("centerview on %s[%s] = %d/%d", obj.name, obj.guid, new_x, new_y);
	//console.log("obj pos %d/%d", obj.x, obj.y);
	this.set_offset(new_x, new_y);

	this.update_world_positions();
}

// update screen pos of object's element
world.prototype.update_object_world_pos = function(obj) {
	obj.div.style.left = (this.total_width + obj.x - obj.hw + this.offset_x) % this.total_width + "px";
	obj.div.style.top = (this.total_height + obj.y - obj.hh + this.offset_y) % this.total_height + "px";

	//console.log("LEFT %s", obj.div.style.left);
	//console.log("new obj pos %s %s / %d %d", obj.div.style.left, obj.div.style.top, obj.x, obj.y);
}

// updates objects' div.top/left
world.prototype.update_world_positions = function() {
	//for (var i=0; i<this.objects.length; i++) {
	//	var obj = this.objects[i];
	for(var key in this.objects) {
		var obj = this.objects[key];
		this.update_object_world_pos(obj);
	}
}

// every frame. move objects
world.prototype.frame_move = function() {
	//for (var i=0; i<this.objects.length; i++) {
	//	var obj = this.objects[i];

	for(var key in this.objects) {
		var obj = this.objects[key];
		//console.log("obj %s @%d/%d + %d/%d", obj.name, obj.x, obj.y, obj.xyspeed.x, obj.xyspeed.y);
		obj.x += obj.xyspeed.x;
		obj.y += obj.xyspeed.y;
		obj_fix_coords(obj, this.total_width, this.total_height);
		if (true == this.debug) obj_debug(obj);
		if (typeof obj.frame_logic !== 'undefined'){
			//console.log("do frame_logic for type %s", obj.objtype);
			switch (obj.frame_logic(obj)) {
				case 0: // all ok
					break;
				case -1:
					//console.log("object %s[%s] for removal", obj.name, obj.guid);
					this.remove_object(obj);
					break;
			}
		}
		if (this.ui) this.update_object_world_pos(obj);
	}
	
	if (true === this.debug) {
		var txt = "<span class='obj_debug'>" + this.offset_x.toFixed(1) + " " + this.offset_y.toFixed(1) + "</span>";
		this.debug_span.innerHTML = txt;
	}
}


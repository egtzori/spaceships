// object stuff

// TODO detect browser and use proper styles

function object(obj_type, obj_name) {
	this.type = obj_type;
	this.name = obj_name;
}

function obj_rotate(obj, deg) {
	//obj.div.style.webkitTransform = 'rotate(' + (360 + deg - 90) % 360 + 'deg)';
	var r = 'rotate(' + deg + 'deg)';
	var use_div = obj.div;
	if ("undefined" !== typeof obj.div2) use_div = obj.div2; // !ship hack .div2
	use_div.style.webkitTransform = r;
	use_div.style.MozTransform = r;
}

function obj_fix_coords(obj, mx, my) {
	obj.x = (mx + obj.x) % mx;
	obj.y = (my + obj.y) % my;
}

object.prototype.create_div = function() {
	this.w = this.image.width;
	this.h = this.image.height;
	this.hw = this.image.width/2;
	this.hh = this.image.height/2;
	this.div = creatediv("", null, this.w, this.h, 1, 1, false);
	this.div.style.backgroundImage = "url('" + this.image.src + "')";
}


function fl_shot(obj) {
	//console.log("in fl_shot()");
	if (obj.lives>0) obj.lives--;
	if (obj.lives == 0) {
		return -1; // = dead
	}
	return 0;
}

function obj_debug(obj) {
	var txt = "<span class='obj_debug'>" + obj.x.toFixed(1) + " " + obj.y.toFixed(1) + " </span>";
	txt += "<span class='obj_debug'>" + obj.xyspeed.x.toFixed(2) + " " + obj.xyspeed.y.toFixed(2) + " </span>";
	//txt += "<span class='obj_debug'>" + obj.div.style.left + " " + obj.div.style.top + " </span>";
	obj.div.innerHTML=txt;
}

// ship object

function ship(ship_type, name) {
	this.type = ship_type;
	this.hp = this.type.hp;
	this.max_hp = this.hp;
	this.w = config_ship_div_width;
	this.h = config_ship_div_height;
	this.hw = config_ship_div_width/2;
	this.hh = config_ship_div_height/2;
	this.name = name;
	this.xyspeed = xyspeed_zero;

	this.rotate = 0; // orientation
	this.x = 0; this.y = 0;

	console.log("new ship: %s(%s) hp: %d", this.name, this.type.name, this.hp);
}

ship.prototype.draw = function() {
	//?
}

ship.prototype.update_hp = function() {
	var hpp = (100 * this.hp / this.max_hp).toFixed();
	this.div_hp2.style.width = hpp + "%";
	var cg = (hpp * 255/100).toFixed();
	var cr = 255 - cg;
	this.div_hp2.style.backgroundColor = "rgb("+cr+","+cg+",0)";
	//console.log("update hp:%s, color:%s", hpp+"", "" + this.div_hp2.style.backgroundColor);
}

ship.prototype.set_name = function(name) {
	//this.name = name; // izlishno
	this.span_name.innerHTML = this.name;
}

ship.prototype.create_div = function() {
	if (typeof this.image === 'undefined') this.image = images[this.type.image];
	this.div = creatediv("", null, this.w, this.h, 10, 10, false);
	this.div.style.backgroundImage = "url('" + images[ fraction_border_images[this.fraction] ].src + "')";
	//this.div.style.border="1px dashed orange";

	// name
	var span_name = document.createElement("span");
	span_name.className = "sp_name";
	span_name.style.color = fraction_name_colors[this.fraction];
	this.div.appendChild(span_name);
	this.span_name = span_name;

	// inner (ship) div
	this.div2 = creatediv("", null, this.w - 20, this.h - 20, 10, 10, false);
	this.div2.style.backgroundImage = "url('" + this.image.src + "')";
	this.div.appendChild(this.div2);

	// hp div
	this.div_hp = document.createElement("div");
	this.div_hp.className = "hp";
	this.div.appendChild(this.div_hp);
	this.div_hp2 = document.createElement("div");
	this.div_hp2.className = "hp2";
	this.div_hp.appendChild(this.div_hp2);
	return;
		//creatediv("", null, this.w-12, 8, 6, 80-8 /**/ -4, false); // holder, for style.width=XX%
	//this.div_hp.style.border = "1px solid green";
	this.div.appendChild(this.div_hp);
	this.div_hp2 = creatediv("", null, this.w-8, 8, 0, 0, false);
	this.div_hp.appendChild(this.div_hp2);

	return;
	////
	this.div_hp = creatediv("", null, this.w-12, 8, 6, 80-8 /**/ -4, false); // holder, for style.width=XX%
	//this.div_hp.style.border = "1px solid green";
	this.div.appendChild(this.div_hp);
	this.div_hp2 = creatediv("", null, this.w-8, 8, 0, 0, false);
	this.div_hp2.style.backgroundColor = "green";
	this.div_hp.appendChild(this.div_hp2);

}



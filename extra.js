
function rect(ctx, x, y, w, h, color) {
ctx.fillStyle = color;
ctx.fillRect(x, y, w, h)
}

function addLoadEvent(func) {
	var oldonload = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() {
			if (oldonload) {
				oldonload();
			}
			func();
		}
	}
}

/**
 * @brief  distance
 */
function get_distance(x1, y1, x2, y2)
{
	return Math.floor( Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)))
}

// return world distance dx, dy
function get_man_distance_world(x1, y1, x2, y2, wrapx,  wrapy) {
	var xd = x2 - x1;
	var yd = y2 - y1;
	xd = Math.abs(xd) <= wrapx/2 ? xd : -wrapx + Math.abs(xd);
	yd = Math.abs(yd) <= wrapy/2 ? yd : -wrapy + Math.abs(yd);
	//console.log("man_dist_world(%d, %d, %d, %d, %d, %d) = { %d, %d }", x1, y1, x2, y2, wrapx, wrapy, xd, yd);
	return { xd : xd, yd : yd };
}

function get_distance_ships(s1, s2, wrapx,  wrapy) {
	var xd = s1.x - s2.x ;
	var yd = s1.y - s2.y ;
	xd = Math.abs(xd) < wrapx/2 ? xd : wrapx  - Math.abs(xd);
	yd = Math.abs(yd) < wrapy/2 ? yd : wrapy  - Math.abs(yd);
	return Math.floor(Math.sqrt( xd*xd + yd*yd));
}

// return closest distance for a1 to become as a2
function angle_delta(a1, a2) {
	return (360 + 180 +  a1 - a2) % 360;
}

/**
 * @brief format array with commas
 *
 * @param arr
 *
 * @return string
 */
function array_print(arr) {
	var ret = "";

	for (i=0; i<arr.length; i++) {
		ret += arr[i]; ret += ",";
	}

	return ret;
}


/* global log */
var log = "";

/**
 * @brief add log
 *
 * @param str
 */
function log2(str) {
	log += str;
	log += "<br>";
}

function printlog() {
	document.write(log);
}

function javascript_abort(str)
{
	log2(str);
	//printlog();
	throw new Error(str);
}

function rand ( n )
{
	return ( Math.floor ( Math.random ( ) * n) );
}

/*
 * http://it.toolbox.com/wiki/index.php/Dynamically_Creating_a_Div_in_Javascript
 */
function creatediv(id, html, width, height, left, top, parent) {

	var newdiv = document.createElement('div'); 
	newdiv.setAttribute('id', id); 
	if (width) { newdiv.style.width = sprintf("%dpx", width); } 
	if (height) { newdiv.style.height = sprintf("%dpx", height); } 
	if ((left || top) || (left && top)) {
		newdiv.style.position = "absolute"; 
		if (left) { newdiv.style.left = sprintf("%dpx", left); } 
		if (top) { newdiv.style.top = sprintf("%dpx", top); }
	} 
	//newdiv.style.background = "#00C"; 
	//newdiv.style.border = "1px solid #000";
	if (html) newdiv.innerHTML = html; 

	if (parent) parent.appendChild(newdiv);

	return newdiv;
}

function create_canvas(id, use_class, width, height, left, top, parent, use_z) {

	var newcanvas = document.createElement('canvas'); 

	/*
	 * http://stackoverflow.com/questions/1635419/excanvas-for-dynamically-created-canvas-elements
	 */
	if(typeof G_vmlCanvasManager  != 'undefined' )
	{
		newcanvas = G_vmlCanvasManager.initElement(newcanvas);
	}

	if (id) {
		newcanvas.setAttribute('id', id); 
	}

	newcanvas.setAttribute("width", width);
	newcanvas.setAttribute("height", height);

	//if (width) { newcanvas.style.width = sprintf("%dpx", width); } 
	//if (height) { newcanvas.style.height = sprintf("%dpx", height); } 
	newcanvas.style.position = "absolute";
	//if ((left || top) || (left && top)) {
		if (left) { newcanvas.style.left = sprintf("%dpx", left); } 
		if (top) { newcanvas.style.top = sprintf("%dpx", top); }
 	//} 

	//newcanvas.style.border = "1px solid #000";

	/* set Z order */
	newcanvas.style.zIndex = use_z;

 	if (use_class) {
		newcanvas.thediv.className = use_class; 
	} 
	
	parent.appendChild(newcanvas);
	//document.body.appendChild(newcanvas);

	return newcanvas;
}

function create_canvas2(id, use_class, width, height, left, top, parent, use_z) {

	var newcanvas = document.createElement('canvas'); 
	newcanvas.setAttribute('id', id); 
	if (width) { newcanvas.style.width = sprintf("%dpx", width); } 
	if (height) { newcanvas.style.height = sprintf("%dpx", height); } 
	newcanvas.style.position = "asolute";  /* ne raboti, set-va se otvyn */
	//if ((left || top) || (left && top)) {
		if (left) { newcanvas.style.left = sprintf("%dpx", left); } 
		if (top) { newcanvas.style.top = sprintf("%dpx", top); }
 	//} 

	//newcanvas.style.border = "1px solid #000";

	/* set Z order */
	newcanvas.style.zIndex = use_z;

 	if (use_class) {
		newcanvas.thediv.className = use_class; 
	} 
	
	parent.appendChild(newcanvas);
	//document.body.appendChild(newcanvas);

	return newcanvas;
}

/*----------------------------------------------*/ 
/*
 * http://www.webtoolkit.info/javascript-sprintf.html
 */

/**
 *
 *  Javascript sprintf
 *  http://www.webtoolkit.info/
 *
 *
 **/

var sprintfWrapper = {

init : function () {

				 if (typeof arguments == "undefined") { return null; }
				 if (arguments.length < 1) { return null; }
				 if (typeof arguments[0] != "string") { return null; }
				 if (typeof RegExp == "undefined") { return null; }

				 var string = arguments[0];
				 var exp = new RegExp(/(%([%]|(\-)?(\+|\x20)?(0)?(\d+)?(\.(\d)?)?([bcdfosxX])))/g);
				 var matches = new Array();
				 var strings = new Array();
				 var convCount = 0;
				 var stringPosStart = 0;
				 var stringPosEnd = 0;
				 var matchPosEnd = 0;
				 var newString = '';
				 var match = null;

				 while (match = exp.exec(string)) {
					 if (match[9]) { convCount += 1; }

					 stringPosStart = matchPosEnd;
					 stringPosEnd = exp.lastIndex - match[0].length;
					 strings[strings.length] = string.substring(stringPosStart, stringPosEnd);

					 matchPosEnd = exp.lastIndex;
					 matches[matches.length] = {
match: match[0],
			 left: match[3] ? true : false,
			 sign: match[4] || '',
			 pad: match[5] || ' ',
			 min: match[6] || 0,
			 precision: match[8],
			 code: match[9] || '%',
			 negative: parseInt(arguments[convCount]) < 0 ? true : false,
			 argument: String(arguments[convCount])
					 };
				 }
				 strings[strings.length] = string.substring(matchPosEnd);

				 if (matches.length == 0) { return string; }
				 if ((arguments.length - 1) > convCount) { return null; }

				 var code = null;
				 var match = null;
				 var i = null;

				 for (i=0; i<matches.length; i++) {

					 if (matches[i].code == '%') { substitution = '%' }
					 else if (matches[i].code == 'b') {
						 matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(2));
						 substitution = sprintfWrapper.convert(matches[i], true);
					 }
					 else if (matches[i].code == 'c') {
						 matches[i].argument = String(String.fromCharCode(parseInt(Math.abs(parseInt(matches[i].argument)))));
						 substitution = sprintfWrapper.convert(matches[i], true);
					 }
					 else if (matches[i].code == 'd') {
						 matches[i].argument = String(Math.abs(parseInt(matches[i].argument)));
						 substitution = sprintfWrapper.convert(matches[i]);
					 }
					 else if (matches[i].code == 'f') {
						 matches[i].argument = String(Math.abs(parseFloat(matches[i].argument)).toFixed(matches[i].precision ? matches[i].precision : 6));
						 substitution = sprintfWrapper.convert(matches[i]);
					 }
					 else if (matches[i].code == 'o') {
						 matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(8));
						 substitution = sprintfWrapper.convert(matches[i]);
					 }
					 else if (matches[i].code == 's') {
						 matches[i].argument = matches[i].argument.substring(0, matches[i].precision ? matches[i].precision : matches[i].argument.length)
							 substitution = sprintfWrapper.convert(matches[i], true);
					 }
					 else if (matches[i].code == 'x') {
						 matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
						 substitution = sprintfWrapper.convert(matches[i]);
					 }
					 else if (matches[i].code == 'X') {
						 matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
						 substitution = sprintfWrapper.convert(matches[i]).toUpperCase();
					 }
					 else {
						 substitution = matches[i].match;
					 }

					 newString += strings[i];
					 newString += substitution;

				 }
				 newString += strings[i];

				 return newString;

			 },

convert : function(match, nosign){
						if (nosign) {
							match.sign = '';
						} else {
							match.sign = match.negative ? '-' : match.sign;
						}
						var l = match.min - match.argument.length + 1 - match.sign.length;
						var pad = new Array(l < 0 ? 0 : l).join(match.pad);
						if (!match.left) {
							if (match.pad == "0" || nosign) {
								return match.sign + pad + match.argument;
							} else {
								return pad + match.sign + match.argument;
							}
						} else {
							if (match.pad == "0" || nosign) {
								return match.sign + match.argument + pad.replace(/0/g, ' ');
							} else {
								return match.sign + match.argument + pad;
							}
						}
					}
}

var sprintf = sprintfWrapper.init;

/* end sprintf code */


function clone_object(obj) {
	var clone = {};
	for(var i in obj) {
		if(typeof(obj[i])=="object")
			clone[i] = clone_object(obj[i]);
		else
			clone[i] = obj[i];
	}
	return clone;
}

/*
Array.prototype.key_to_index = function(k) {
	var i = 0;
	for (var key in this) {
		if (k == key) {
			return i;
		}
		i++;
	}
	return -1;
}

Array.prototype.index_to_key = function(idx) {
	var i = 0;
	for (var key in this) {
		if (i == idx) {
			return key;
		}
		i++;
	}
	return null;
}
*/

/* get element position */
function get_position(obj) {
	var left = 0, top = 0;
	var save = obj;
	if (obj.offsetParent) {
		do {
			left += obj.offsetLeft;
			top += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}

	return { x : left, y : top , w : save.offsetWidth, h : save.offsetHeight };
}

function print_object(obj) {
	console.log("print_object == ");
	for (var i in obj) {
		console.log("%s = %s", i, obj[i]);
	}
}

// sets properties in obj from "from", whitelist is comma separated list of properties
function set_object_props(obj, from, whitelist) {
	var wl = whitelist.split(",");
	for(var i=0; i<wl.length; i++) {
		var prop = wl[i];
		if (undefined !== obj[prop] && undefined !== from[prop]) {
			//console.log("WL update prop %s obj:%s -> to %s", prop, obj[prop], from[prop]);
			obj[prop] = from[prop];
		}
	}
}

// only check if prop exists in 'from'
function set_object_props2(obj, from, whitelist) {
	var wl = whitelist.split(",");
	for(var i=0; i<wl.length; i++) {
		var prop = wl[i];
		if (undefined !== from[prop]) {
			//console.log("WL update prop %s obj:%s -> to %s", prop, obj[prop], from[prop]);
			obj[prop] = from[prop];
		}
	}
}


function deg_to_rad(deg) {
	return deg * (Math.PI / 180);
}

function rad_to_deg(rad) {
	return rad * (180 / Math.PI);
}

// spd = hypotenuse
function speed_deg_to_xyspeed(spd, deg) {
	var rad = deg_to_rad(deg);
	var o = (Math.sin(rad) * spd);//.toFixed(3) // FIXME ne tuk ? a predi da pishe x + "deg" ?
	var a = (Math.cos(rad) * spd);//.toFixed(3);
	return {x:a, y:o};
}

function get_guid2() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

// return unique guid proprty for object
function get_guid(obj) {
	if (typeof obj === 'undefined') return null;
	do {
		var r = get_guid2();
	} while (typeof obj[r] !== 'undefined');
	return r;
}

// return radians so my_object(mx,my) will face target(tx,ty)
function face_target_rad(mx, my, tx, ty) {
	var rad_angle = Math.atan(Math.abs(ty-my)/(Math.abs(tx-mx)==0?0.00001:Math.abs(tx-mx)) );
	if (tx<mx) rad_angle=Math.PI-rad_angle;
	if (ty<my) rad_angle=2*Math.PI-rad_angle;
	return rad_angle;
}

/* return radian angle to face target */
function face_target_deltas_rad(dx, dy) {
	var rad_angle = Math.atan(Math.abs(dy)/(Math.abs(dx)==0?0.00001:Math.abs(dx)) ); // !DIV0
	if (dx<0) rad_angle=Math.PI-rad_angle;
	if (dy<0) rad_angle=2*Math.PI-rad_angle;
	return rad_angle;
}

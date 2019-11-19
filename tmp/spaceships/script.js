
/* image list */
var images_preload = [
{name : "korab_03", url : "img/korab_03.png" },
{name : "ship_skull", url : "img/korab_4erep.png" },
{name : "ship_carrot", url : "img/ship_carrot.png" },
{name : "ship_skull2", url : "img/korab_4erep_02.png" },
{name : "korab_04", url : "img/korab_04.png" },
{name : "korab_05", url : "img/korab_05.png" },

{name : "stars1", url : "img/stars1.jpg" },

{name : "kur6ujm_01", url : "img/kur6ujm_01.png" },
{name : "kur6ujm_02", url : "img/kur6ujm_02.png" },
{name : "kur6ujm_03", url : "img/kur6ujm_03.png" },
{name : "kur6ujm_04", url : "img/kur6ujm_04.png" },
{name : "shot_01", url : "img/shot_01.png" },
{name : "shot_02", url : "img/shot_02.png" },

{name : "border_01", url : "img/fraction_border_01.png" },
{name : "border_02", url : "img/fraction_border_02.png" },
];

var images = [];
// load images
for (var i=0; i<images_preload.length; i++) {
	if (undefined === images_preload[i]) continue;
	var this_image = images_preload[i];
	images[this_image.name] = new Image();
	images[this_image.name].src = this_image.url;
	//console.log("img preload:%s [%s]", this_image.name, this_image.url);
}

/*----------------------------------------------*/ 
// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;

var connection = new WebSocket( config_ws_address );

connection.onopen = function () {
	// connection is opened and ready to use
	console.log("connected..");
};
function send_helo_btn() {
	var el_select = document.getElementById("fraction");
	var el_name = document.getElementById("name");
	send_helo(connection, el_name.value.substring(0, config_ship_max_name_len), el_select.selectedIndex);
}

connection.onerror = function (error) {
	// an error occurred when sending/receiving data
	console.log("error " + error);
};

var ws_closed;
connection.onclose = function (error) {
	// an error occurred when sending/receiving data
	console.log("closed " + error);
	ws_closed = error;
};

connection.onmessage = function (message) {
	// try to decode json (I assume that each message from server is json)
	try {
		var json = JSON.parse(message.data);
	} catch (e) {
		console.log('This doesn\'t look like a valid JSON: ', message.data);
		return;
	}
	// handle incoming message
	switch (json.type) {
	case 'guid':
		if (null === my_guid) {
			my_guid = json.data;
			console.log("MY_GUID[%s]", my_guid);
		}
		break;

	case 'remove':
		//console.log("remove guid %s", json.data);
		var obj = w.objects[json.data];
		w.remove_object(obj);
		break;

	case 'dead':
		console.log("dead guid %s", json.data);
		var obj = w.objects[json.data];
		//TODO: onDead ??
		if (json.data === my_guid) {
			console.log("i died..");
			my_guid = null;
		}
		break;

	case 'ship': //new/update ship // !! staro, ne se polzva
		console.log("!!!ERR message type: ship ");
		return;
		var sh = undefined;
		if (undefined === w.objects[json.data.guid]) {
			console.log("new ship message %s %s", json.data.ship, json.data.name );
			console.log("ships:%s [%s]", ships, ships[json.data.name]);
			sh = new ship( ships[json.data.subtype], json.data.name );
			set_object_props2(sh, json.data, "fraction,guid,objtype,owner"); // first
			sh.create_div();
			w.add_object(sh);
		} else {
			sh = w.objects[json.data.guid];
		}
		set_object_props(sh, json.data, "x,y,rotate,xyspeed,hp"); // update
		//console.log("S update [%s] hp:%d hp%:%d", sh.guid, sh.hp, 100 * sh.hp / sh.max_hp);
		sh.div_hp2.style.width = (100 * sh.hp / sh.max_hp).toFixed() + "%";
		obj_rotate(sh, sh.rotate);
		//print_object(json.data);
		break;

	case 'ships': //new/update ship
		for (var k in json.data) {
			//if ("key_to_index" === k || "index_to_key" === k) { }
			obj = json.data[k];

			var sh = undefined;
			if (undefined === w.objects[obj.guid]) {
				console.log("new ship message %s %s", obj.guid, obj.name );
				console.log("subtype:%s [%s]", obj.subtype, ships[obj.subtype].name);
				sh = new ship( ships[obj.subtype], obj.name );
				set_object_props2(sh, obj, "fraction,guid,objtype,owner"); // first
				sh.create_div();
				sh.set_name(this.name);
				w.add_object(sh);
			} else {
				sh = w.objects[obj.guid];
			}
			set_object_props(sh, obj, "x,y,rotate,xyspeed,hp"); // update
			//console.log("S update[%s] hp:%d hp%:%d", sh.name, sh.hp, 100 * sh.hp / sh.max_hp);
			//sh.div_hp2.style.width = (100 * sh.hp / sh.max_hp).toFixed() + "%";
			sh.update_hp();
			obj_rotate(sh, sh.rotate);
		}
		break;

	case 'projectile':
		var sh = undefined;
		if (undefined === w.objects[json.data.guid]) {
			//console.log("new shot[%s]: %s [%s]", json.data.guid, json.data.name, shots[json.data.name]);
			var shot_template = shots[json.data.subtype];
			sh = new object( shot_template.name, json.data.name );
			set_object_props2(sh, shot_template, "speed,lives,objtype,frame_logic");
			set_object_props2(sh, json.data, "speed,lives,xyspeed,rotate,x,y,guid,objtype,owner");
			//print_object(shot_template);
			sh.image = images[ shot_template.image ];
			sh.create_div();
			w.add_object(sh);
		} else {
			console.log("!! panic, shot alredy in objects list");
			javascript_abort("panic");
			return;
		}
		obj_rotate(sh, sh.rotate);
		break;

	case 'error':
		console.log("error from server [%s]", json.data);
		break;

	case 'pong':
		var elapsed = (new Date).getTime() - last_ping;
		var elm_latency = document.getElementById("latency"); // TODO: cache element
		elm_latency.innerHTML = elapsed+"ms";
		//console.log("elapsed: %d", elapsed);
		break;

	case 'chat':
		var msg = json.from + ": " + json.msg;
		chat.add_message(msg);
		break;

	default:
		console.log("got msg type: %s/%s", json.type, message.type);
	}
};
/*----------------------------------------------*/ 

function check_latency() {
	last_ping = (new Date).getTime();
	connection.send(JSON.stringify({ type: "ping", data: "" }));
}

console.log("script.js done");

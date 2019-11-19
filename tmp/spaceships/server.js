// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
//"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-spaceships';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
var vm = require('vm');

function include(path) {
	var code = fs.readFileSync(path, 'utf-8');
	vm.runInThisContext(code, path);
}
// includes
include('config.js');
include('object.js');
include('protocol.js');
include('extra.js');
include('ship.js');
include('world.js');
include('frame.js');
include('data.js');


/**
 * Global variables
 */
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = {};
var clients_online = 0;



// INIT
images=[];
var img = { width: 304, height: 234, src:"" };
images['stars1'] = img;

init_data();
var w = world_1;

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
		.replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
	// Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
	console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
	// WebSocket server is tied to a HTTP server. WebSocket request is just
	// an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
	httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
	console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

	// accept connection - you should check 'request.origin' to make sure that
	// client is connecting from your website
	// (http://en.wikipedia.org/wiki/Same_origin_policy)
	var connection = request.accept(null, request.origin); 
	var key = request.key;
	clients[key] = {};
	clients[key].connection = connection;
	clients_online++;
	var userName = false;
	var userColor = false;
	var user_guid = false;

	console.log((new Date()) + ' Connection accepted.');

	// send back chat history
	if (history.length > 0) {
		connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
	}

	// user sent some message
	connection.on('message', function(message) {
		if (message.type !== 'utf8' || undefined === message.utf8Data) { // accept only text
			console.log("unknown message.type");
			for (var i in message) {
				console.log("%s = %s", i, message[i]);
			}
			return;
		}

		//console.log("msg: [%s/%s]", message.type, message.utf8Data);
		var json = JSON.parse(message.utf8Data);
		var use_guid = clients[key].guid;
		var use_ship = w.objects[use_guid];

		switch (json.type) {
		case 'helo': // new player, create ship/name
			//TODO: sanity check
			if ("undefined" !== typeof use_ship) { // socket has ship
				connection.send(JSON.stringify({ type:'error', data: "has ship" }));
				return;
			}

			// blacklisted names
			if ("server" === json.data.name) {
				connection.send(JSON.stringify({ type:'error', data: "name reserved" }));
				return;
			}
			
			json.data.name = json.data.name.substring(0, config_ship_max_name_len); // strip name

			var rand_ship = ships[ships_list[rand(ships_list.length)]];
			var ship = new global.ship(rand_ship/**/, json.data.name);
			ship.x = rand(w.total_width);
			ship.y = rand(w.total_height);
			ship.rotate = rand(360);
			ship.xyspeed = {x:0, y:0}; //xyspeed_zero;
			ship.fraction = parseInt(json.data.fraction);
			ship.guid = get_guid(w.objects);
			ship.objtype = ship_one.objtype;
			ship.projectiles = rand_ship.projectiles; // FIXME: referece ?
			user_guid = ship.guid;
			clients[key].guid = ship.guid; // guid known after helo
			ship.owner = ship.guid; // player's ship owns himself
			//TODO: set subtype
			ship.subtype = rand_ship.name;
			clients[key].ship = ship;
			w.add_object(ship, false);

			// send player's guid
			connection.send(JSON.stringify({ type:'guid', data: ship.guid }));
			// and players ship // nee nuzhno
			//connection.send( ship_to_string(ship) );
			console.log("new player/ship[%s] %s: %s", ship.guid, ship.name, json.data.name);

			server_bcast_chat_msg("server", "new ship for team " + fraction_names[ship.fraction] + ": " + ship.name);

			// TODO: send all objects now ? flying projectiles are hidden to new ships

			break;

		case 'ping':
			var now = (new Date).getTime();
			connection.send(JSON.stringify({ type: "pong", data: now }));
			break;
		}

		if ("undefined" === typeof use_ship) {
			console.log("!! move/ command w/o ship, ignoring");
			return;
		}
		// needs ship
		switch (json.type) {
		case 'chat':
			server_bcast_chat_msg(use_ship.name, json.msg);
			console.log("chat msg from: %s: %s", use_ship.name, json.msg);
			break;

		case 'move':
			console.log("move for %s", use_ship.guid);
			switch (json.data) {
			case 'left':
				use_ship.rotate -= config_kbd_rotate_deg;
				use_ship.rotate = (360 + use_ship.rotate) % 360;
				break;

			case 'right':
				use_ship.rotate += config_kbd_rotate_deg;
				use_ship.rotate = (360 + use_ship.rotate) % 360;
				break;

			case 'up':
				var thrust = speed_deg_to_xyspeed(2, use_ship.rotate);
				var oldx = use_ship.xyspeed.x;
				var oldy = use_ship.xyspeed.y;
				if ( Math.abs(use_ship.xyspeed.x + thrust.x) < 12) use_ship.xyspeed.x += thrust.x;
				if ( Math.abs(use_ship.xyspeed.y + thrust.y) < 12) use_ship.xyspeed.y += thrust.y;
				console.log("UP new spd: %d %d", use_ship.xyspeed.x.toFixed(2), use_ship.xyspeed.y.toFixed(2));
			break;

			case 'brake':
				console.log("90% speeds = %d %d", use_ship.xyspeed.x * 0.9, use_ship.xyspeed.y * 0.9);
				var p = use_ship.xyspeed.x * 0.9;
				if (Math.abs(p) < 1) use_ship.xyspeed.x = 0; else use_ship.xyspeed.x *= 0.9;
				p = use_ship.xyspeed.y * 0.9;
				if (Math.abs(p) < 1) use_ship.xyspeed.y = 0; else use_ship.xyspeed.y *= 0.9;
			break;

			case 'down':
				var thrust = speed_deg_to_xyspeed(1, use_ship.rotate);
				var oldx = use_ship.xyspeed.x;
				var oldy = use_ship.xyspeed.y;
				if ( Math.abs(use_ship.xyspeed.x - thrust.x) < 12) use_ship.xyspeed.x -= thrust.x;
				if ( Math.abs(use_ship.xyspeed.y - thrust.y) < 12) use_ship.xyspeed.y -= thrust.y;
				console.log("DOWN new spd: %d %d", use_ship.xyspeed.x.toFixed(2), use_ship.xyspeed.y.toFixed(2));
				break;

			}
			break;

		case 'fire':
			switch (json.data) {
			case '1':
				var shot_template = shots[ use_ship.projectiles[0] ];
				server_new_shot("shot", shot_template, use_ship);
				break;

			case '2':
				var shot_template = shots[ use_ship.projectiles[0] ];
				use_ship.rotate -= 7;
				server_new_shot("shot", shot_template, use_ship);
				use_ship.rotate += 14;
				server_new_shot("shot", shot_template, use_ship);
				use_ship.rotate -= 7;
				server_new_shot("shot", shot_template, use_ship);
				break;
			}
			break;


		default:
			console.log("got msg type: %s/%s", json.type, message.type);
		}

	});

	// user disconnected
	connection.on('close', function(connection) {
		clients_online--;
		console.log("== on close!, %d online, key[%s]", clients_online, key);

		if ('undefined' !== typeof clients[key] && 'undefined' !== typeof clients[key].guid) { // delete client with guid (got helo message)
			console.log("remove player %s", clients[key].guid);
			delete w.objects[ clients[key].guid ];
			// bcast removed guid
			clients_bcast(JSON.stringify( { type: 'remove', data: clients[key].guid } ));
		}

		///
		delete clients[key];
		if (userName !== false && userColor !== false) {
			console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
			colors.push(userColor);
		}
	});

	connection.on('end', function(connection) {
		console.log("connection END");
	});

	connection.on('disconnect', function(connection) {
		console.log("====!!! disconnect");
	});

}); // wsServer


// ship obj to json, 
function ship_to_string(use_ship) {
	return JSON.stringify(
			{ type: use_ship.objtype, 
				data: {
				objtype: use_ship.objtype,
			 	name: use_ship.name,
			 	fraction: use_ship.fraction,
				guid: use_ship.guid,
				owner: use_ship.owner,
				subtype: use_ship.subtype,
				projectiles: use_ship.projectiles,
				hp: use_ship.hp,
				x: use_ship.x,
				y: use_ship.y,
				rotate: use_ship.rotate,
				xyspeed: use_ship.xyspeed,
				}
			});
}

function obj_to_string(use_obj) {
	return JSON.stringify(
			{ type: use_obj.objtype, 
				data: {
				name: use_obj.name,
				objtype: use_obj.objtype,
				fraction: use_obj.fraction,
				guid: use_obj.guid,
				owner: use_obj.owner,
				subtype: use_obj.subtype,
				x: use_obj.x,
				y: use_obj.y,
				rotate: use_obj.rotate,
				xyspeed: use_obj.xyspeed,
				hp: use_obj.hp,
				}
			});
}

function obj_to_string2(use_obj) {
	return JSON.stringify(
			{
				 name: use_obj.name,
				 objtype: use_obj.objtype,
				 fraction: use_obj.fraction,
				 guid: use_obj.guid,
				 owner: use_obj.owner,
				 subtype: use_obj.subtype,
				 x: use_obj.x,
				 y: use_obj.y,
				 rotate: use_obj.rotate,
				 xyspeed: use_obj.xyspeed,
				 hp: use_obj.hp,
			});
}

/*----------------TIMERS--------------------*/ 

//// server timers
setInterval( function() { ships_frame(w); }, 33);

// server: bcast objects
setInterval( function() { 
	if (typeof w === 'undefined') {
		console.log("w undefined?");
		return;
	}
	var objcount=0;
	var ships_array = [];
	for(var key in w.objects) {
		objcount++;
		var obj = w.objects[key];
		if (obj.objtype === "projectile") continue;
		//console.log("do[%s] %s tn:%s spd%d/%d", key, obj.name, obj.objtype, obj.xyspeed.x.toFixed(2), obj.xyspeed.y.toFixed(2));
		ships_array.push(obj);
	}
	if (0 == objcount) return;

	var packet = JSON.stringify({ type: "ships", data: ships_array });
	clients_bcast(packet);
}, 66);

// server: projectiles
setInterval( function() { 
	if (typeof w === 'undefined') { console.log("w undefined?"); return; }
	// TODO? cache all projectiles/ships in two arrays ?
	for(var key in w.objects) {
		var obj = w.objects[key];
		if ("projectile" !== obj.objtype) continue; // only projectiles

		for(var key2 in w.objects) {
			var obj2 = w.objects[key2];
			if (obj.guid === obj2.guid) continue; // skip same
			if (obj.fraction === obj2.fraction) continue; // no friendly fire, faction
			//if (obj.owner === obj2.owner) continue; // no friendly fire, check faction aswell !same owner has same fraction

			var xd = Math.pow(Math.abs(obj.x - obj2.x), 2);
			var yd = Math.pow(Math.abs(obj.y - obj2.y), 2);
			var dist = xd + yd;
			//var dist = Math.sqrt(xd + yd);

			//console.log("dist(%d - %d) = %d", xd, yd, dist);
			if (dist < 500) {
				// collision
				// TODO hp on projectiles or, explode on impact

				// remove projectile
				clients_bcast(JSON.stringify( { type: 'remove', data: obj.guid } ));

				// + explode
				switch  (obj2.objtype) {
				case "projectile":
					// two projectiles collide
					clients_bcast(JSON.stringify( { type: 'remove', data: obj2.guid } ));
					delete w.objects[ obj2.guid ];
					break;

				case "ship":
					obj2.hp -= 20; //FIXME use projectile damage/hp
					if (obj2.hp <= 0) {
						// ship dead, TODO+ explode
						console.log("ship %s[%s] DEAD", obj2.guid, obj2.name);
						clients_bcast(JSON.stringify( { type: 'dead', data: obj2.guid } ));
						clients_bcast(JSON.stringify( { type: 'remove', data: obj2.guid } ));
						server_bcast_chat_msg("server", obj2.name + " was slain by " + w.objects[obj.owner].name + ".");
						delete w.objects[ obj2.guid ];
					}
					break;
				}


				delete w.objects[ obj.guid ];

				// TODO stop here? if no, will hit all ships in range
			}
		}
	}

}, 33);


/*----------------------------------------------*/ 

// message to all clients
function clients_bcast(string) {
	for (var k in clients) {
		var conn = clients[k].connection;
		conn.send(string);
	}
}

/////// debug/
function print_ships_speeds() {
	for(var key in w.objects) {
		var obj = w.objects[key];
		if (obj.objtype === "projectile") continue;
		console.log("PRINT[%s][%s] spd%d/%d", key, obj.guid, obj.xyspeed.x.toFixed(2), obj.xyspeed.y.toFixed(2));
	}
}

function server_bcast_chat_msg(from, msg) {
	var message = { type: 'chat', from: from, msg: msg }
	clients_bcast(JSON.stringify(message));
}


function server_new_shot(type, shot_template, use_ship) {
	var shot = new global.object(type, shot_template.name);
	set_object_props2(shot, shot_template, "speed,lives,objtype,frame_logic");
	shot.rotate = use_ship.rotate;
	shot.xyspeed = speed_deg_to_xyspeed(shot.speed, shot.rotate);
	var xyspeed_shipwide = speed_deg_to_xyspeed(80/* ship outer div*/, shot.rotate);
	shot.x = use_ship.x + xyspeed_shipwide.x; shot.y = use_ship.y + xyspeed_shipwide.y;
	shot.guid = get_guid(w.objects);
	shot.subtype = shot_template.name;
	shot.fraction = use_ship.fraction;
	if (true) { // add ships speed
		shot.xyspeed.x += use_ship.xyspeed.x;
		shot.xyspeed.y += use_ship.xyspeed.y;
	}
	shot.owner = use_ship.guid;
	console.log("new shot[%s], rotate=%d, speed[%d/%d], lives=%d, speed:%d", shot.guid, shot.rotate, shot.xyspeed.x.toFixed(2), shot.xyspeed.y.toFixed(2), shot.lives, shot.speed);
	w.add_object(shot, false);

	//connection.send(obj_to_string(shot));
	clients_bcast(obj_to_string(shot));
}

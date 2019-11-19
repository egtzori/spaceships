
process.title = 'node-bot';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var WebSocket = require('ws');
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

/*----------------------------------------------*/ 
images = [];
images['stars1'] = { width: 304, height: 234, src:"" };
init_data();
var w = world_1;
/*----------------------------------------------*/ 
console.log("run %d bots..", process.argv[2]);

ships = [];
var ws = [];
setInterval( function() { stupid_interval(); }, 166);

var use_fraction = process.argv[3];
if (undefined === use_fraction) {
	console.log("distribute fractions");
} else {
	console.log("use fraciton: %d", use_fraction);
}

for (var botnum = 0; botnum < process.argv[2]; botnum++) {
	console.log("do bot #%d", botnum);

	ws[botnum] = new WebSocket(config_ws_address);
	ws[botnum].rng_botname = "bot_" + (50 + rand(200));
	ws[botnum].rng_botfraction = (undefined !== use_fraction) ? parseInt(use_fraction) : rand(2);
	//ws[botnum].rng_botfraction = botnum % 2;
	ws[botnum].my_guid = null;

	ws[botnum].on('open', function() {
		console.log("onopen");
		send_helo(this, this.rng_botname, this.rng_botfraction);


	});

	ws[botnum].on('message', function(data, flags) {
		//console.log("got message: %s", data);

		try {
			var json = JSON.parse(data);
		} catch (e) {
			console.log('This doesn\'t look like a valid JSON: ', message.data);
			return;
		}

		// handle incoming message
		switch (json.type) {
			case 'guid':
				if (null === this.my_guid) {
					this.my_guid = json.data;
					console.log("MY_GUID[%s]", this.my_guid);
				}
				break;

			case 'remove':
				//console.log("remove guid %s", json.data);
				//var obj = w.objects[json.data];
				//w.remove_object(obj);
				break;

			case 'dead':
				//TODO: onDead ??
				if (json.data === this.my_guid) {
					console.log("i died.. resurrect in 2s");
					this.my_guid = null;
					var ref = this;
					setTimeout( function() { send_helo(ref, ref.rng_botname, ref.rng_botfraction); }, 2000);
					//send_helo(ws, ws.rng_botname, ws.rng_botfraction);
				} else {
					console.log("dead guid %s", json.data);
				}
				delete ships[json.data];
				break;

			case 'ships': //track hostile ships
				for (var k in json.data) {
					obj = json.data[k];
					if (this.my_guid === obj.guid) {
						this.my_ship = obj;
					}
					if (this.rng_botfraction !== obj.fraction) {
						ships[obj.guid] = obj;
					}
				}
				break;

			case 'error':
				console.log("error from server [%s]", json.data);
				break;


		} // switch (json.type)

	});


} // for botnum


function stupid_interval() {
	var rng = rand(10);
	
	for (var i=0; i<process.argv[2]; i++) {

		var shortdist = 999999999;
		var enemy = undefined;
		for (var k in ships) {
			var s = ships[k];
			var dist = get_distance_ships(s, ws[i].my_ship, w.total_width, w.total_height);
			//console.log("[%s]do %s.. dist=%d", k, s.name, dist);
			if (dist < shortdist) {
				shortdist = dist;
				enemy = s;
			}
		}
		if (undefined === enemy) return; // no hostile ships around
		//console.log("done. closest is %s dist %d", enemy.name, dist);

		// rotate to face and/or fire
		var wdist = get_man_distance_world(ws[i].my_ship.x, ws[i].my_ship.y, enemy.x, enemy.y, w.total_width, w.total_height);
		var face_enemy_angle = rad_to_deg( face_target_deltas_rad(wdist.xd, wdist.yd) );
		//console.log("dists = %d %d | face rad = %d", wdist.xd, wdist.yd, face_target_deltas_rad(wdist.xd, wdist.yd) );
		var ang_diff = ws[i].my_ship.rotate - face_enemy_angle;

		if (ang_diff > 0) {
			ws[i].send(JSON.stringify({ type:'move', data: 'left' }));
		} else {
			ws[i].send(JSON.stringify({ type:'move', data: 'right' }));
		}

		if (Math.abs(ang_diff) < 20) {
			ws[i].send(JSON.stringify({ type:'fire', data: '1' }));
		}

	}

	return;
}

ships = [];
ships_list = [];
xyspeed_zero = {x:0, y:0};
shots = [];
shots_list = [];
fraction_name_colors = ["#D90404", "#00D2F2"];
fraction_names = ["Red", "Blue"];
fraction_border_images = ["border_01", "border_02"];
my_guid = null;

max_distance = 0;

chat = undefined; 
last_ping = undefined;

function init_data() {
	//FIXME image my name! not <img> object
	ship_one = { objtype: "ship", name: "ship1", image: "korab_03", hp: 200, projectiles: ["kur6ujm_01"] };
	ship_skull = { objtype: "ship", name: "skull", image: "ship_skull", hp: 200, projectiles: ["kur6ujm_02"] };
	ship_skull2 = { objtype: "ship", name: "skull2", image: "ship_skull2", hp: 200, projectiles: ["kur6ujm_04"] };
	ship_carrot = { objtype: "ship", name: "carrot", image: "ship_carrot", hp: 200, projectiles: ["kur6ujm_03"] };
	ship_korab_04 = { objtype: "ship", name: "korab_04", image: "korab_04", hp: 200, projectiles: ["shot_01"] };
	ship_korab_05 = { objtype: "ship", name: "korab_05", image: "korab_05", hp: 200, projectiles: ["shot_02"] };
	ships[ship_one.name] = ship_one;
	ships[ship_skull.name] = ship_skull;
	ships[ship_skull2.name] = ship_skull2;
	ships[ship_carrot.name] = ship_carrot;
	ships[ship_korab_04.name] = ship_korab_04;
	ships[ship_korab_05.name] = ship_korab_05;
	ships_list = ["ship1", "skull", "skull2", "carrot", "korab_04", "korab_05"];
/*----------------------------------------------*/ 

	k1 = { objtype: "projectile", name: "kur6ujm_01", image: "kur6ujm_01", speed: 25, lives: 40, frame_logic: fl_shot };
	k2 = { objtype: "projectile", name: "kur6ujm_02", image: "kur6ujm_02", speed: 28, lives: 40, frame_logic: fl_shot };
	k3 = { objtype: "projectile", name: "kur6ujm_03", image: "kur6ujm_03", speed: 30, lives: 40, frame_logic: fl_shot };
	k4 = { objtype: "projectile", name: "kur6ujm_04", image: "kur6ujm_04", speed: 32, lives: 40, frame_logic: fl_shot };
	k5 = { objtype: "projectile", name: "shot_01", image: "shot_01", speed: 28, lives: 40, frame_logic: fl_shot };
	k6 = { objtype: "projectile", name: "shot_02", image: "shot_02", speed: 28, lives: 40, frame_logic: fl_shot };
	shots[k1.name] = k1;
	shots[k2.name] = k2;
	shots[k3.name] = k3;
	shots[k4.name] = k4;
	shots[k5.name] = k5;
	shots[k6.name] = k6;
	shots_list = [ "kur6ujm_01", "kur6ujm_02", "kur6ujm_03", "kur6ujm_04", "shot_01", "shot_02"]

	// world 1
	world_1 = new world(images["stars1"], 10, 12, 1024, 768);
	max_distance = get_distance(0, 0, world_1.total_width, world_1.total_height)
}

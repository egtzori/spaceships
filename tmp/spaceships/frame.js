
function ships_frame(use_world) {
	//console.log("ships_frame: %d ships", clients_online);
	use_world.frame_move();
	/*
	if (typeof global === 'undefined') {
		w.frame_move();
	} else {
		print_object(global.w);
		global.w.frame_move();
	}
	*/
}

function frame_view() {
	if (null === my_guid || "undefined" === typeof w.objects[my_guid]) return;
	//console.log("CV on guid %d", w.objects[my_guid]);
	w.centerview_on_object(w.objects[my_guid]);
}

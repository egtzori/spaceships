var keysdown = {};
function keydown(e) {
	var e=window.event || e;
	console.log("keydown value: %d ", e.keyCode);

	if (13 === e.keyCode)  {
		console.log("13, %s", chat.input.disabled);
		chat.input_toggle();
		if (true === chat.input.disabled) {
			chat.send_message();
			chat.input.blur();
		} else {
			chat.input.focus();
		}
	}

	if (false === chat.input.disabled) return; // wont fire while chatting

	if (true === keysdown[e.keyCode]) return; // repeat
	keysdown[e.keyCode] = true;
}

function keyup(e) {
	var e=window.event || e;
	keysdown[e.keyCode] = false;
}

function timer_keyboard() {
	if (null === my_guid) return;
	var gamekeys = [
		{code:37, type:'move', data:'left'},
		{code:38, type:'move', data:'up'},
		{code:39, type:'move', data:'right'},
		{code:40, type:'move', data:'down'},
		{code:32, type:'move', data:'brake'}, // space
		{code:81, type:'fire', data:'1'}, // Q
		{code:87, type:'fire', data:'2'}, // W
	];

	for(var c in gamekeys) {
		var key = gamekeys[c];
		if (true == keysdown[key.code]) 
			connection.send(JSON.stringify({ type:key.type, data: key.data }));
	}
}


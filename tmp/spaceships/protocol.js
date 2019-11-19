
function send_helo(ws_obj, name, fraction) {
	// send new player
	ws_obj.send(JSON.stringify(
				{ type:'helo', 
					data: {
						name: name,
						fraction: fraction,
						ship: 'random',
					}
				}));
};

function client_send_chat(msg) {
	connection.send(JSON.stringify({ type: 'chat', msg: msg}));
}

try{
  var config_ws_address = (undefined !== window && window.location.host)
} catch (ex) {
  config_ws_address = process.env['WS_ADDRESS'];
}

config_ws_address = "ws://" + config_ws_address + ":1337";
console.log("use address: %s", config_ws_address);

var config_ship_width = 60;
var config_ship_width = 60;
var config_ship_div_width = 80;
var config_ship_div_height = 80;
var config_ship_max_name_len = 8;

var config_kbd_rotate_deg = 9;

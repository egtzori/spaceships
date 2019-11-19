function chatui(chat_div_id) {
	this.el = document.getElementById(chat_div_id);
	this.messages = [];
	this.msg_max = 7;

	this.input = document.createElement("input");
	this.input.className = "chat";
	this.el.appendChild(this.input);
	this.input_disable(true);

	for (var i=0; i<this.msg_max; i++) this.add_message(""+i); // fill chat with empty msgs

}

chatui.prototype.add_message = function(msg) {
	var p = document.createElement("p");
	p.innerHTML = msg;
	p.className = "chat";
	this.el.insertBefore(p, this.input);
	this.messages.push(p);
	this.cleanup();
}

chatui.prototype.cleanup = function() {
	var count = this.messages.length;
	while (count > this.msg_max){
		//console.log("max: %d, count: %d.. remove1[%s]", this.msg_max, count, this.messages[0].innerHTML);
		this.el.removeChild(this.messages[0]); // remove 1
		this.messages.shift();
		count = this.messages.length;
	}
}

chatui.prototype.input_disable = function(disable) {
	//(true === (this.input_enabled = enable)) ? this.input.removeAttribute("disabled") : this.input.setAttribute("disabled", "true");
	(true === (this.input.disabled = disable)) ? this.input.disabled = true : this.input.disabled = false;
}

chatui.prototype.input_toggle = function() {
	this.input_disable(!this.input.disabled);
}

chatui.prototype.send_message = function() {
	var msg = this.input.value;
	if ("" === msg) return;
	client_send_chat(msg);
	this.input.value = "";
}

var msgtest = 0;
function test_chat() {
	chat.add_message("msg " + msgtest);
	msgtest++;
}


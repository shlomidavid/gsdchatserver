
$(function(){
   	//make connection
	var socket = io.connect('http://localhost:3000')

	//buttons and inputs
	var message = $("#message")
	var username = $("#username")
	var send_message = $("#send_message")
	var send_username = $("#send_username")
	var chatroom = $("#chatroom")
	var feedback = $("#feedback")

	//Emit message
	send_message.click(function(){
		socket.emit('new_message', {text : message.val()})
	})

	//Listen on new_message
	socket.on("new_message", (data) => {
            console.log(data);
		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'>" + data.created_user_id + ": " + data.text + "</p>")
	})

	//Emit a username
	send_username.click(function(){
		socket.emit('login', {user_id : username.val()})
	})

	//Emit typing
	message.bind("keypress", () => {
		socket.emit('typing')
	})

	//Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})
});



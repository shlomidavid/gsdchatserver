/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


const express = require('express')
const app = express()
const mysql = require('mysql')
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'chat'
});
connection.connect()


//Listen on port 3000
const server = app.listen(3000)
//socket.io instantiation
const io = require("socket.io")(server)

io.on('connection', (client) => {
    
    connection.query('SELECT * FROM `chats`', function (err, rows, fields) {
        if (err) throw err
        io.sockets.emit('room_list_updated', rows)
    })

    client.on('connected', (data) => {
        console.log('connected', data)
        connection.query('SELECT * FROM `chats`', function (err, rows, fields) {
            if (err) throw err
            io.sockets.emit('room_list_updated', rows)
        })
    })
    
    client.on('disconnect', (data) => {
        console.log('disconnect', data)
    })
    
    client.on('create_room', (data) => {
        console.log('create_room', data)
    })
	
    client.on('join_room', (data) => {
        console.log('join_room', data)
    })
	
    client.on('leave_room', (data) => {
        console.log('join_room', data)
    })
	
	//listen on new_message
    client.on('new_message', (data) => {
        connection.query('SELECT * FROM `chats`', function (err, rows, fields) {
            if (err) throw err
            console.log(rows)
            io.sockets.emit('room_list_updated', rows)
        })
		var sql = "INSERT INTO `messages`(`created_user_id`, `to_chat_id`, `text`) " +
							"VALUES ('1','1','testing')";
		connection.query(sql, function (err, result) {
			if (err) throw err
			//broadcast the new message
			io.sockets.emit('new_message', {message : data.message});
		})
        
    })
})
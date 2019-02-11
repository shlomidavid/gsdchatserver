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

//set the template engine ejs
app.set('view engine', 'ejs')

//middlewares
app.use(express.static('public'))

//routes
app.get('/', (req, res) => {
	res.render('index')
})

//Listen on port 3000
const server = app.listen(3000)
//socket.io instantiation
const io = require("socket.io")(server)

io.on('connection', (client) => {
    
    client.user_id = null;
    
    client.on('connected', (data) => {
        console.log('connected', data)
        connection.query('SELECT * FROM `rooms`', function (err, rows, fields) {
            if (err) throw err
            io.sockets.emit('room_list_updated', rows)
        })
    })
    
    client.on('disconnect', (data) => {
        console.log('disconnect', data)
    })
    
    client.on('login', (data) => {
        console.log('login', data)
        client.user_id = data.user_id;
        connection.query('SELECT * FROM `user_room` WHERE user_id='+client.user_id, function (err, rows, fields) {
            if (err) throw err
            
            for(var i in rows) {
                console.log(rows[i]);
                client.join(rows[i].room_id);
            }
        })
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
        var user_id = client.user_id;
        var text = data.text;
        var sql = "INSERT INTO `messages`(`created_user_id`, `to_room_id`, `text`) VALUES ('"+user_id+"','1','"+text+"')";
        connection.query(sql, function (err, result) {
            if (err) throw err
            
            console.log(result.insertId);
            if(result.insertId) {
                connection.query('SELECT * FROM `messages` WHERE id=' + result.insertId, function (err, rows, fields) {
                    if (err) throw err
                    
                    for(var i in rows) {
                        console.log(rows[i]);
                        //broadcast the new message
                        client.broadcast.to(rows[i].to_room_id).emit('new_message', rows[i]);
                    }
                })
            }
            
            
            //io.sockets.emit('new_message', {message : data.message});
        })
    })
})
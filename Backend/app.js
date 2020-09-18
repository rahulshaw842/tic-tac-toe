const Express = require('express')();
const http = require('http').Server(Express);
const Socket = require("socket.io")(http);
const cors = require('cors');

Express.use(cors());

let PORT = process.env.PORT || 3000;
let board = [
    ['','',''],
    ['','',''],
    ['','',''],
  ]

let boardObject = {}

http.listen(PORT, () =>{
    console.log("port is running at 3000");
})

Socket.on("connection", socket =>{
    socket.emit("data",board );
    socket.on("play", update =>{
         this.board = update;
         Socket.emit("data", this.board);
    });

    socket.on("check-room", roomId =>{
        socket.emit("room-status", checkRoomExistance(roomId));
    })

    socket.on("join-room", ({roomId, user}) => {
        var clients = Socket.sockets.adapter.rooms[roomId];
        if(!clients){
            socket.join(roomId);
            boardObject[roomId] = new Object();
            boardObject[roomId].user = [];
            boardObject[roomId].board = board;
            user.isAdmin = true;
            boardObject[roomId].user.push(user)
            Socket.in(roomId).emit("board", boardObject[roomId]);
        } else if(clients.length < 2){
            if(!Socket.sockets.adapter.sids[socket.id][roomId]){
                socket.join(roomId);
                if(boardObject[roomId].user.length < 2){
                    user.isAdmin = false;
                    boardObject[roomId].user.push(user)
                }
            }
            Socket.in(roomId).emit("board", boardObject[roomId]);
        } else{
            socket.emit("moreuser", "more that 2");
        }
        
        socket.on("multiplayer", data =>{
            boardObject[data.room].board = data.board;
            data.isDraw = false;
            
            data.isGameWon = checkGameStatus(data.board);
            if(data.isGameWon){
                boardObject[data.room].board = board;
                console.log(data.isGameWon);
            }
            Socket.in(data.room).emit("roomdata", data)
        });

        socket.on("restart", data =>{
            boardObject[data.roomId].board = board;
            boardObject[data.roomId].user = data.userData;
            Socket.in(data.roomId).emit("board", boardObject[data.roomId]);
            Socket.in(data.roomId).emit("closeAlert", true)
        })

    });

    function checkGameStatus(board) {
        //Horizontal check
        for(let i=0; i<3; i++){
          if(board[i][0] !=='' && (board[i][1] === board[i][0] && board[i][2] === board[i][0])){
            return board[i][0];
          }
        }
        //vertical check
        for(let i=0; i<3; i++){
          if(board[0][i] !=='' && (board[1][i] === board[0][i] && board[2][i] === board[0][i])){
            return  board[0][i];
          }
        }
        
        //diagonal check
        if(board[0][0] !=='' && (board[1][1] === board[0][0] && board[2][2] === board[0][0])){
          return  board[0][0];
        }
        if(board[0][2] !=='' && (board[1][1] === board[0][2] && board[2][0] === board[0][2])){
            return board[0][2];
        }
        
        let available = 0;
        for(let i=0; i<3; i++){
            for(let j=0; j<3; j++){
                if(board[i][j] === ''){
                    available++;
                }
            }
        }

        if(!available){
            return 2;
        }
    
        return 0;
      }

    function checkRoomExistance(roomid) {
       return boardObject[roomid] ?  true :  false
    }
})
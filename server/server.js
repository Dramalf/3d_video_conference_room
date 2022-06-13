// const fs = require('fs');
// const  app = require('express')();
// const options = {
//   key: fs.readFileSync('/home/cert/dramalf.xyz.key'),
//   cert: fs.readFileSync('/home/cert/dramalf.xyz.pem')
//   };
// const https=require('https');
// const  server = https.createServer(options,app).listen(8080,function(){
//   console.log("SERVER LISTENING");
// });
// const io= require("socket.io")(8080, {
//     cors: {
//       origin: ["https://116.62.218.178:80"]
//     }
//   })

const { Console } = require("console");

const io = require("socket.io")(8080, {
  cors: {
    origin: ["http://localhost:3000"]
  }
})

let connectionList = []
const CLIENT_RTC_EVENT = 'CLIENT_RTC_EVENT';
const SERVER_RTC_EVENT = 'SERVER_RTC_EVENT';

const CLIENT_USER_EVENT = 'CLIENT_USER_EVENT';
const SERVER_USER_EVENT = 'SERVER_USER_EVENT';

const CLIENT_USER_EVENT_LOGIN = 'CLIENT_USER_EVENT_LOGIN';
const SERVER_USER_EVENT_UPDATE_USERS = 'SERVER_USER_EVENT_UPDATE_USERS';

const CLIENT_USER_EVENT_SEND_MESSAGE = "CLIENT_USER_EVENT_SEND_MESSAGE"
const SERVER_USER_EVENT_BROADCAST_MESSAGE='SERVER_USER_EVENT_BROADCAST_MESSAGE';
const CLIENT_USER_EVENT_INTERACTION='CLIENT_USER_EVENT_INTERACTION';
function getOnlineUsers() {
  let arr=connectionList.map(connection => {
    const { userName, roomID } = connection
    return {
      userName,
      roomID
    }
  })
  return JSON.parse(JSON.stringify(arr))
}

function updateUsers(socket, roomID, userName) {
  socket.join(roomID)
  console.log('updates',getOnlineUsers().map(c=>c.userName))
  socket.to(roomID).emit(SERVER_USER_EVENT,
    {
      type: SERVER_USER_EVENT_UPDATE_USERS,
      payload: {
        onlineUsers: getOnlineUsers(),
        newEnterUserName: userName
      }
    })
}
function broadcastTextMsg(socket,payload){
  const {roomID}=payload
  socket.join(roomID)
  socket.to(roomID).emit(SERVER_USER_EVENT,
     
    {
      type:SERVER_USER_EVENT_BROADCAST_MESSAGE,
      payload
    }) 

}
io.on("connection", socket => {
  const id = socket.id
  socket.on('ASK_LIST',()=>{
    // console.log('send online users list')
    // socket.emit("FIRSTASKLIST",{
    //   onlineUsers: getOnlineUsers(),
    //   newEnterUserName: ""
    // })
  })
 
  socket.on(CLIENT_USER_EVENT, (jsonString) => {

    const msg = JSON.parse(jsonString);
    const { type, payload } = msg;
    if (type === CLIENT_USER_EVENT_LOGIN) {
      const { loginName, roomID } = payload
      console.log(loginName,'enter room>>',roomID)
      connectionList.push({ 
        userName: loginName,
        socket: socket,
        roomID: roomID
      })
      updateUsers(socket, roomID, loginName)
      let data=JSON.stringify({
        onlineUsers: getOnlineUsers(),
        newEnterUserName: loginName
      })
      setTimeout(() => {
        socket.emit("FIRSTASKLIST",data)
      }, 0);
      
    }
    else if (type === CLIENT_USER_EVENT_SEND_MESSAGE) {
      broadcastTextMsg(socket,payload)
      console.log('broadcast',connectionList)
    }else if(type===CLIENT_USER_EVENT_INTERACTION){
      const {from,to}=msg.payload;
      let socket=findSocketByUserName(to);
      if(socket!=='not find'){
        
        socket.emit('INTERACTION_EVENT',from);
      }
    }
  })

  socket.on(CLIENT_RTC_EVENT, function(jsonString) {
    const msg = JSON.parse(jsonString);
    const {payload} = msg;
    //.log(msg)
    const target = payload.target;
      //socket.to(target).emit(SERVER_RTC_EVENT, msg)
 
    const targetConn = connectionList.find(item => {
      return item.userName === target;
    });
    if (targetConn) {
      targetConn.socket.emit(SERVER_RTC_EVENT, msg);
    }
  });


  function findUserNameBySocket(socket) {
    let userName = 'not find'
    connectionList.some(connection => {
      if (connection.socket.id === socket.id) {
        userName = connection.userName
        return true
      }
    })
    return userName
  }
  function findSocketByUserName(name) {
    let socket ='not find';
    console.log(connectionList)
    connectionList.some(connection => {
     // console.log('111',connection.userName, name)
      if (connection.userName === name) {
        socket = connection.socket
        return true
      }
    })
    return socket
  }
  function userLeaveRoom(socket){
    connectionList=connectionList.filter(c=>{
      if(c.socket==socket){
        socket.join(100)
        socket.to(100).emit('user_leave',c.userName)
      }
      return c.socket!=socket
    })
  }
  socket.on("disconnect", roomId => {
    let leaveName=findUserNameBySocket(socket)
    console.log(leaveName, " >>leave>> ??", roomId)
    
    socket.emit("user_leave", leaveName)
    userLeaveRoom(socket)
  })
  socket.on("sendNewMsg", (textMsg, roomId) => {
    socket.join(roomId)
    socket.to(roomId).emit("msgrcv", textMsg, senderId = socket.id)
  })
  socket.on(CLIENT_RTC_EVENT, function (jsonString) {
    const msg = JSON.parse(jsonString);
    const { payload } = msg;
    const target = payload.target;

    const targetConn = connectionList.find(item => {
      return item === target;
    });
    if (targetConn) {
      targetConn.socket.emit(SERVER_RTC_EVENT, msg);
    }
  });


})
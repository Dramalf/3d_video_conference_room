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
function getOnlineUsers() {
  return connectionList.map(connection => {
    const { userName, roomID } = connection
    return {
      userName,
      roomID
    }
  })
}

function updateUsers(socket, roomID, userName) {
  socket.join(roomID)
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
  socket.emit("FIRSTASKLIST",{
    onlineUsers: getOnlineUsers(),
    newEnterUserName: ""
  })
  console.log('send online users list')
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
    }
    else if (type === CLIENT_USER_EVENT_SEND_MESSAGE) {
      broadcastTextMsg(socket,payload)
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
  function userLeaveRoom(socket){
    connectionList=connectionList.filter(c=>c.socket!=socket)
  }
  socket.on("disconnect", roomId => {
    console.log(findUserNameBySocket(socket), " >>leave>> ", roomId)
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

  socket.on('disconnect', function () {
    connectionList = connectionList.filter(item => {
      return item !== socket.id;
    });
    connectionList.forEach(item => {
      // item.socket.emit(SERVER_USER_EVENT, { type: SERVER_USER_EVENT_UPDATE_USERS, payload: getOnlineUser()});
      //   updateUsers(item.socket);
    });
  });
})
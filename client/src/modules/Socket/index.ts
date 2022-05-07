import { io } from "socket.io-client"
const socket = io("https://www.dramalf.xyz")
// const socket = io("http://localhost:8080")
export default socket
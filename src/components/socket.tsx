import { io , Socket} from "socket.io-client";
const Url = "https://minimalisticbackend.onrender.com"
const socket:Socket = io(Url);
export default socket;
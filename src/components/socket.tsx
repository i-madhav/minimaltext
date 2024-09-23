import { io , Socket} from "socket.io-client";
const Url = "http://localhost:8000/"
const socket:Socket = io(Url);

export default socket;
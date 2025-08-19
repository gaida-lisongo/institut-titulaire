import Titulaire from "./Titulaire";
import User from "./User";

const userApi = new User("http://172.20.10.2:3000/api");
const titulaireApi = new Titulaire("http://172.20.10.2:3000/api");
export { userApi, titulaireApi };
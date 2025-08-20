import Titulaire from "./Titulaire";
import User from "./User";

const userApi = new User("http://153.92.210.104:9001/api");
const titulaireApi = new Titulaire("http://153.92.210.104:9001/api");
export { userApi, titulaireApi };
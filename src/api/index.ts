import Titulaire from "./Titulaire";
import User from "./User";

const userApi = new User("https://institut.he-section.site/api");
const titulaireApi = new Titulaire("https://institut.he-section.site/api");
export { userApi, titulaireApi };
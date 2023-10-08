import DiscordProvider from "./provider/DiscordProvider";
const { prefix, token } = require("../../config/config.json");

const provider = new DiscordProvider();
provider.login(token);
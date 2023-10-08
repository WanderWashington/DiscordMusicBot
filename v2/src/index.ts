import VoiceController from './controller/VoiceController';
import DiscordEngine, { Command } from './engine/DiscordEngine';
const { prefix, token } = require('../../config/config.json');

const controller = new VoiceController();
const commandHandler: Command = {
    "play": controller.execute,
  };
const engine = new DiscordEngine(prefix, commandHandler);

engine.login("YOUR-TOKEN");

engine.messageCreate();

import { Client, GatewayIntentBits } from 'discord.js';

export default class DiscordProvider {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
      ]
    });
  }

  login(token: string): void {
    this.client.login(token);
  }
}

import { Client, GatewayIntentBits } from 'discord.js';

export interface Command {
  [key: string]: (message: any, serverQueue: any) => void;
}

export default class DiscordEngine {
  private client: Client;
  private prefix: string;
  private command: Command;
  private queue = new Map();

  constructor(prefix: string, command: Command) {
    this.prefix = prefix;
    this.command = command;

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
  
  public async login  (token: string): Promise<string> {
    return await this.client.login(token);
  }

  messageCreate() {
    this.client.once('ready', () => {
      console.log('Ready!');
    });
    
    this.client.once('reconnecting', () => {
      console.log('Reconnecting!');
    });
    
    this.client.once('disconnect', () => {
      console.log('Disconnect!');
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith(this.prefix)) return;
    
      console.log(`Content:: ${message.content}`);

      let serverQueue = this.queue.get(message?.guild?.id);
      this.processCommand(message, serverQueue);
    });
  }

  processCommand(message: any, serverQueue: any) { 
    let action = message.content.split(" ")[0].replace(this.prefix, "");
    let handler = this.command[action];
    console.log(action);
    if (typeof handler === 'function') {
      handler(message, serverQueue);
    }
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var DiscordProvider = /** @class */ (function () {
    function DiscordProvider() {
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.GuildVoiceStates,
                discord_js_1.GatewayIntentBits.GuildMembers,
                discord_js_1.GatewayIntentBits.MessageContent,
            ],
        });
    }
    DiscordProvider.prototype.login = function (token) {
        this.client.login(token);
    };
    return DiscordProvider;
}());
exports.default = DiscordProvider;

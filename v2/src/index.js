"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DiscordProvider_1 = require("./provider/DiscordProvider");
var _a = require("../../config/config.json"), prefix = _a.prefix, token = _a.token;
var provider = new DiscordProvider_1.default();
provider.login(token);

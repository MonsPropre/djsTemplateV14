const {
	Client,
	GatewayIntentBits,
	Partials,
	Collection,
} = require("discord.js");
require('dotenv').config()
const path = require('path');

const {loadEvents} = require("./Handlers/eventHandler");
const {loadCommands} = require("./Handlers/commandHandler");
const {loadConfig} = require("./Handlers/configHandler");
const chalk = require("chalk");
const moment = require("moment/moment");
const initLogger = require("./utils/initLogger");

const client = new Client({
	intents: [Object.keys(GatewayIntentBits)],
	partials: [Object.keys(Partials)],
});

client.on("unhandledRejection", (reason, p) => {
	console.error("Unhandled promise rejection:", reason, p);
});

client.commands = new Collection();

module.exports = client;

client.login(process.env.TOKEN).then(async () => {
	loadConfig(client);
	loadEvents(client);
	loadCommands(client);
	initLogger(client.config.Logger);
}).catch(err => {
	console.error(err);
});

client.on("interactionCreate", async interaction => {
	if (interaction.isAutocomplete()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			return;
		}

		try {
			await command.autocomplete(interaction);
		} catch (err) {
			return;
		}
	}
})

process.on('exit', code => {
	console.log(chalk.yellow(`The process exited with code: ${code}!`));
});

process.on("unhandledRejection", async (err) => {
	console.log(chalk.red.bold("[ANTI - CRASH] Unhandled Rejection: "), err);
});

process.on('uncaughtException', (err) => {
	console.log(chalk.red.bold("[ANTI - CRASH] Uncaught Exception: "), err);
});

process.on('warning', (...args) => {
	console.log(chalk.magenta("[WARNING]"), ...args);
});

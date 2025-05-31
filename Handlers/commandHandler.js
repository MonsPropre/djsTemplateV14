function loadCommands(client) {
	const ascii = require("ascii-table");
	const fs = require("fs");
	const table = new ascii().setHeading("File Name", "Folder", "Status");
	const chalk = require("chalk");

	let commandsArray = [];
	let commandRow = [];

	const commandsFolder = fs.readdirSync("./Commands");
	for (const folder of commandsFolder) {
		const commandFiles = fs
			.readdirSync(`./Commands/${folder}`)
			.filter((file) => file.endsWith(".js"));

		for (const file of commandFiles) {
			commandRow.push(`${folder}/${file}`)
			try {
				// Clear the cache for this file
				delete require.cache[require.resolve(`../Commands/${folder}/${file}`)];

				const commandFile = require(`../Commands/${folder}/${file}`);

				const properties = {folder, ...commandFile};
				client.commands.set(commandFile.data.name, properties);

				commandsArray.push(commandFile.data.toJSON());

				table.addRow(file, folder, "✅  Loaded");
			} catch (err) {
				table.addRow(file, folder, "❌  Error");
			}
		}
	}

	// Register commands with Discord API
	client.application.commands.set(commandsArray).then();

	// Display the ASCII table only if there is at least one command
	if (commandRow.length > 0) {
		console.log(table.toString());
	} else {
		console.log(chalk.yellow("No commands found in ./Commands."));
	}
}

module.exports = {loadCommands};

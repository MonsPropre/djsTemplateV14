const ascii = require("ascii-table");

function loadEvents(client) {
	const ascii = require("ascii-table");
	const fs = require("fs");
	const table = new ascii().setHeading("Event File", "Folder", "Status");
	const moment = require("moment");
	const chalk = require("chalk");
	const path = require("path");

	const folders = fs
		.readdirSync("./Events", {withFileTypes: true})
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	let eventRow = [];

	// Remove all existing event listeners
	client.removeAllListeners();

	for (const folder of folders) {
		const files = fs
			.readdirSync(`./Events/${folder}`)
			.filter((file) => file.endsWith(".js"));

		for (const file of files) {
			const filePath = path.resolve(`./Events/${folder}/${file}`);

			// Remove the module from cache
			delete require.cache[require.resolve(filePath)];

			// Reload the module
			const event = require(filePath);

			eventRow.push(`${folder}/${file}`)
			try {
				if (event.rest) {
					if (event.once)
						client.rest.once(event.name, (...args) =>
							event.execute(...args, client)
						);
					else
						client.rest.on(event.name, (...args) =>
							event.execute(...args, client)
						);
				} else {
					if (event.once)
						client.once(event.name, (...args) =>
							event.execute(...args, client)
						);
					else
						client.on(event.name, (...args) =>
							event.execute(...args, client)
						);
				}
				table.addRow(file, folder, "✅  Loaded");
				// eventRow.push(
				//     `${chalk.hex("#a9a9a9")(
				//         `[${moment().format("DD/MM - HH:mm:ss")}]`
				//     )} ${chalk.bgRed("[EVT]")} - ${file.slice(0, file.length - 3)} loaded successfully`
				// );
			} catch (err) {
				table.addRow(file, folder, "❌  Error");
				// eventRow.push(
				//     `${chalk.hex("#a9a9a9")(
				//         `[${moment().format("DD/MM - HH:mm:ss")}]`
				//     )} ${chalk.bgRed("[EVT]")} - ${file.slice(0, file.length - 3)} ${chalk.red("Failed to load: " + err.message)}`
				// );
			}
		}
	}

	// Display the ASCII table
	console.log(table.toString());

	// Display detailed logs
	if (eventRow.length < 0) {
		console.log(chalk.yellow("No events found in ./Events."));
	}
}

module.exports = {loadEvents};

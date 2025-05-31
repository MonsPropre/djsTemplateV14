const ascii = require("ascii-table");
const fs = require("fs");
const path = require("path");

function loadConfig(client) {
	const table = new ascii().setHeading("Config File", "Status");
	const configs = {};

	const configFolder = fs.readdirSync("./Config").filter(file => file.endsWith(".json"));

	for (const file of configFolder) {
		try {
			const filePath = path.resolve("./Config", file);
			delete require.cache[require.resolve(filePath)];

			const configData = require(filePath);

			if (file === "global.json") {
				Object.assign(configs, configData);
			} else {
				const configName = file.slice(0, file.length - 5);
				configs[configName] = configData;
			}

			table.addRow(file, "✅  Loaded");
		} catch (err) {
			table.addRow(file, "❌  Error");
		}
	}

	client.config = configs;

	console.log(table.toString());

	return configs;
}

module.exports = { loadConfig };

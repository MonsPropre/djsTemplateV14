require("dotenv").config();
const chalk = require("chalk");

module.exports = {
	name: "ready",
	once: true,
	async execute(client) {
		console.log(
			`${chalk.hex("#141414").bgHex("#1E5B9C")(
				"[CLIENT]"
			)} - ${client.user.username} Ready to use!`
		);
	}
}
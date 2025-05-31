const {
	EmbedBuilder,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	ActionRowBuilder,
	ComponentType,
	MessageFlags
} = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Displays the list of bot commands"),
	async execute(interaction) {
		const categories = [
			...new Set(interaction.client.commands.map(cmd => cmd.folder)),
		].map(directory => {
			const commands = interaction.client.commands
				.filter(cmd => cmd.folder === directory)
				.map(cmd => ({
					name: cmd.data.name,
					description: cmd.data.description || "No description.",
				}));
			return { directory, commands };
		});

		const embed = new EmbedBuilder()
			.setDescription("Select a category from the dropdown menu.")
			.setColor("Blurple");

		const components = (disabled) => [
			new ActionRowBuilder().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId("help-menu")
					.setPlaceholder("Select a category")
					.setDisabled(disabled)
					.addOptions(
						categories.map(cat => ({
							label: cat.directory,
							value: cat.directory.toLowerCase(),
							description: `Commands from the ${cat.directory} category`,
						}))
					)
			),
		];

		const reply = await interaction.reply({
			embeds: [embed],
			components: components(false),
			flags: MessageFlags.Ephemeral,
		});

		const filter = i => i.user.id === interaction.user.id;
		const collector = interaction.channel.createMessageComponentCollector({
			filter,
			componentType: ComponentType.StringSelect,
			time: 60_000,
		});

		collector.on("collect", i => {
			const [directory] = i.values;
			const category = categories.find(cat => cat.directory.toLowerCase() === directory);

			const categoryEmbed = new EmbedBuilder()
				.setTitle(`Commands: ${category.directory}`)
				.setColor("Blurple")
				.setDescription(
					category.commands.map(cmd => `\`${cmd.name}\`: ${cmd.description}`).join("\n")
				);

			i.update({
				embeds: [categoryEmbed],
				components: components(false),
				ephemeral: true,
			});
		});

		collector.on("end", () => {
			reply.edit({
				components: components(true),
			});
		});
	},
};

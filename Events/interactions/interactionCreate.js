const {
    EmbedBuilder,
    MessageFlags,
} = require("discord.js");

const checkPermissions = require("../../utils/checkPermissions");

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        const errEmbed = new EmbedBuilder().setColor("Red");
        const { Ephemeral } = MessageFlags;

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            const { whitelisted, whitelistedRoles, userPermission, botPermission } = command;

            if (
                whitelistedRoles &&
                interaction.member &&
                interaction.member.roles &&
                interaction.member.roles.cache &&
                !whitelistedRoles.some((roleId) =>
                    interaction.member.roles.cache.has(roleId)
                )
            )
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FF0000")
                            .setTitle("Error")
                            .setDescription(
                                "This command is under roles whitelist."
                            ),
                    ],
                    flags: Ephemeral,
                });
            if (
                whitelisted &&
                !whitelisted.includes(interaction.member.id)
            )
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FF0000")
                            .setTitle("Error")
                            .setDescription("Commands is under whitelist."),
                    ],
                    flags: Ephemeral,
                });
            if (
                userPermission &&
                !checkPermissions(
                    interaction.guild,
                    interaction.member.id,
                    userPermission
                )
            )
                return interaction.reply({
                    content: `Error, You don't have the permission ${userPermission}.`,
                    flags: Ephemeral,
                });
            if (botPermission) {
                console.log(botPermission);
                const unallowedPermission = [];
                for (const permission of botPermission) {
                    if (
                        !checkPermissions(
                            interaction.guild,
                            client.user.id,
                            permission
                        )
                    ) {
                        unallowedPermission.push(permission);
                    }
                }
                if (unallowedPermission.length > 0) {
                    console.log(errEmbed);
                    errEmbed
                        .setDescription(
                            "⛔ | Whoops! I don't have permissions for that!"
                        )
                        .addFields({
                            name: "Permissions",
                            value: unallowedPermission.join("\n"),
                            inline: false,
                        });
                    return interaction.reply({
                        embeds: [errEmbed],
                        flags: Ephemeral,
                    });
                }
            }

            if (!command) {
                return interaction.reply({
                    content: "⛔ | Whoops! This command doesn't exist.",
                    flags: Ephemeral,
                });
            }

            command.execute(interaction, client);
        }

        if (interaction.isUserContextMenuCommand()) {
            const command = client.commands.get(interaction.commandName);
            command.execute(interaction, client);
        }

        if (interaction.isMessageContextMenuCommand()) {
            const command = client.commands.get(interaction.commandName);
            command.execute(interaction, client);
        }

        if (interaction.isModalSubmit()) {
            return;
        }

        if (interaction.isButton()) {
            return;
        }

        if (interaction.isStringSelectMenu()) {
            return;
        }

        if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                console.error(
                    `No command matching ${interaction.commandName} was found.`
                );
                return;
            }

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        }
    },
};

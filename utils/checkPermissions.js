const { PermissionsBitField, Client, IntentsBitField, Partials } = require('discord.js');

const client = new Client({
    intents:  [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildMembers
    ],
    partials: [Partials.Channel]
});


module.exports = function(guild, userId, permission) {
    // const guild = client.guilds.cache.get(guildId); // Récupère l'objet Guild de la guilde
    const member = guild.members.cache.get(userId); // Récupère l'objet GuildMember de l'utilisateur

    if (member) {
        const hasPermissions = member.permissions.has(permission);
    
        if (hasPermissions) {
            return true;
        } else {
            return false;
        }
    } else {
        return 'Error';
    }
}
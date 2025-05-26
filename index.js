const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const TOKEN = process.env['DISCORD_TOKEN'];

const commands = [
  {
    name: 'avatar',
    description: 'Get user avatar',
    options: [{
      name: 'user',
      type: 6,
      description: 'The user to get avatar from',
      required: false
    }]
  },
  {
    name: 'help',
    description: 'Show all available commands'
  },
  {
    name: 'mute',
    description: 'Mute a user',
    options: [{
      name: 'user',
      type: 6,
      description: 'The user to mute',
      required: true
    }, {
      name: 'duration',
      type: 4,
      description: 'Mute duration in minutes',
      required: true
    }, {
      name: 'reason',
      type: 3,
      description: 'Reason for the mute',
      required: false
    }]
  },
  {
    name: 'lock',
    description: 'Lock a channel',
    options: [{
      name: 'channel',
      type: 7,
      description: 'The channel to lock',
      required: false
    }]
  },
  {
    name: 'unlock',
    description: 'Unlock a channel',
    options: [{
      name: 'channel',
      type: 7,
      description: 'The channel to unlock',
      required: false
    }]
  },
  {
    name: 'ban',
    description: 'Ban a user',
    options: [{
      name: 'user',
      type: 6,
      description: 'The user to ban',
      required: true
    }, {
      name: 'reason',
      type: 3,
      description: 'Reason for the ban',
      required: false
    }]
  },
  {
    name: 'kick',
    description: 'Kick a user',
    options: [{
      name: 'user',
      type: 6,
      description: 'The user to kick',
      required: true
    }, {
      name: 'reason',
      type: 3,
      description: 'Reason for the kick',
      required: false
    }]
  },
  {
    name: 'unmute',
    description: 'Unmute a user',
    options: [{
      name: 'user',
      type: 6,
      description: 'The user to unmute',
      required: true
    }]
  },
  {
    name: 'ping',
    description: 'Check bot latency'
  },
  {
    name: 'uptime',
    description: 'Check bot uptime'
  },
  {
    name: 'stats',
    description: 'Show bot statistics'
  },
  {
    name: 'invite',
    description: 'Get bot invite link'
  },
  {
    name: 'listroles',
    description: 'List all roles in the server'
  },
  {
    name: 'updatechannel',
    description: 'Send update message to channels in all servers (Bot owner only)',
    options: [{
      name: 'message',
      type: 3,
      description: 'The update message to send',
      required: true
    }]
  },
];

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '9' }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('Slash commands registered');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  const embed = new EmbedBuilder()
    .setColor('0099ff')
    .setTimestamp();

  switch (commandName) {
    case 'ban':
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({ content: 'You do not have permission to ban members!', ephemeral: true });
      }

      const banUser = interaction.options.getUser('user');
      const banReason = interaction.options.getString('reason') || 'No reason provided';

      try {
        await interaction.guild.members.ban(banUser, { reason: banReason });
        embed.setTitle('User Banned')
          .setDescription(`${banUser.tag} has been banned\nReason: ${banReason}`);
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({ content: 'Failed to ban user!', ephemeral: true });
      }
      break;

    case 'kick':
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        return interaction.reply({ content: 'You do not have permission to kick members!', ephemeral: true });
      }

      const kickUser = interaction.options.getUser('user');
      const kickReason = interaction.options.getString('reason') || 'No reason provided';

      try {
        const member = await interaction.guild.members.fetch(kickUser.id);
        await member.kick(kickReason);
        embed.setTitle('User Kicked')
          .setDescription(`${kickUser.tag} has been kicked\nReason: ${kickReason}`);
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({ content: 'Failed to kick user!', ephemeral: true });
      }
      break;

    case 'unmute':
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.reply({ content: 'You do not have permission to unmute members!', ephemeral: true });
      }

      const unmuteUser = interaction.options.getUser('user');

      try {
        const member = await interaction.guild.members.fetch(unmuteUser.id);
        await member.timeout(null);
        embed.setTitle('User Unmuted')
          .setDescription(`${unmuteUser.tag} has been unmuted`);
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({ content: 'Failed to unmute user!', ephemeral: true });
      }
      break;

    case 'ping':
      const ping = Math.round(client.ws.ping);
      embed.setTitle('🏓 Pong!')
        .setDescription(`Latency: ${ping}ms`);
      await interaction.reply({ embeds: [embed] });
      break;

    case 'uptime':
      const uptime = Math.round(client.uptime / 1000);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;

      embed.setTitle('Bot Uptime')
        .setDescription(`${hours}h ${minutes}m ${seconds}s`);
      await interaction.reply({ embeds: [embed] });
      break;

    case 'mute':
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.reply({ content: 'You do not have permission to mute members!', ephemeral: true });
      }

      const muteUser = interaction.options.getUser('user');
      const duration = interaction.options.getInteger('duration');
      const muteReason = interaction.options.getString('reason') || 'No reason provided';

      try {
        const member = await interaction.guild.members.fetch(muteUser.id);
        await member.timeout(duration * 60 * 1000, muteReason);
        embed.setTitle('User Muted')
          .setDescription(`${muteUser.tag} has been muted for ${duration} minutes\nReason: ${muteReason}`);
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({ content: 'Failed to mute user!', ephemeral: true });
      }
      break;
    case 'lock':
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return interaction.reply({ content: 'You do not have permission to lock channels!', ephemeral: true });
      }

      const lockChannel = interaction.options.getChannel('channel') || interaction.channel;

      try {
        await lockChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SendMessages: false
        });
        embed.setTitle('Channel Locked')
          .setDescription(`${lockChannel} has been locked`);
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({ content: 'Failed to lock channel!', ephemeral: true });
      }
      break;

    case 'unlock':
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return interaction.reply({ content: 'You do not have permission to unlock channels!', ephemeral: true });
      }

      const unlockChannel = interaction.options.getChannel('channel') || interaction.channel;

      try {
        await unlockChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SendMessages: null
        });
        embed.setTitle('Channel Unlocked')
          .setDescription(`${unlockChannel} has been unlocked`);
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({ content: 'Failed to unlock channel!', ephemeral: true });
      }
      break;

    case 'avatar':
      const targetUser = interaction.options.getUser('user') || interaction.user;
      embed.setTitle(`${targetUser.username}'s Avatar`)
        .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 4096 }));
      await interaction.reply({ embeds: [embed] });
      break;

    case 'help':
      const commandList = commands.map(cmd => `**/${cmd.name}** - ${cmd.description}`).join('\n');
      embed.setTitle('Available Commands')
        .setDescription(commandList);
      await interaction.reply({ embeds: [embed] });
      break;

    case 'stats':
      const guildCount = client.guilds.cache.size;
      const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
      const channelCount = client.channels.cache.size;
      const botUptime = Math.round(client.uptime / 1000);
      const uptimeHours = Math.floor(botUptime / 3600);
      const uptimeMinutes = Math.floor((botUptime % 3600) / 60);
      const uptimeSeconds = botUptime % 60;

      embed.setTitle('📊 Bot Statistics')
        .addFields(
          { name: '🏠 Servers', value: guildCount.toString(), inline: true },
          { name: '👥 Users', value: userCount.toString(), inline: true },
          { name: '📺 Channels', value: channelCount.toString(), inline: true },
          { name: '🏓 Latency', value: `${Math.round(client.ws.ping)}ms`, inline: true },
          { name: '⏱️ Uptime', value: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`, inline: true },
          { name: '💾 Memory Usage', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true }
        );
      await interaction.reply({ embeds: [embed] });
      break;

    case 'invite':
      const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
      embed.setTitle('Bot Invite Link')
        .setDescription(`[Click here to invite me to your server!](${inviteUrl})`);
      await interaction.reply({ embeds: [embed] });
      break;

    case 'listroles':
      const roles = interaction.guild.roles.cache
        .filter(role => role.name !== '@everyone')
        .sort((a, b) => b.position - a.position)
        .map(role => `${role} - ${role.members.size} members`)
        .slice(0, 20);

      embed.setTitle('Server Roles')
        .setDescription(roles.length > 0 ? roles.join('\n') : 'No roles found');
      await interaction.reply({ embeds: [embed] });
      break;

    case 'updatechannel':
      // Replace with your Discord user ID
      const channelBotOwnerId = '1142053791781355561';

      if (interaction.user.id !== channelBotOwnerId) {
        return interaction.reply({ content: 'Only the bot owner can use this command!', ephemeral: true });
      }

      const channelUpdateMessage = interaction.options.getString('message');
      let channelSuccessCount = 0;
      let channelFailCount = 0;

      await interaction.deferReply({ ephemeral: true });

      const channelUpdateEmbed = new EmbedBuilder()
        .setColor('0099ff')
        .setTitle('📢 Bot Update')
        .setDescription(channelUpdateMessage)
        .setTimestamp()
        .setFooter({ text: `Update from ${client.user.tag}` });

      for (const guild of client.guilds.cache.values()) {
        try {
          // Find the first text channel the bot can send messages to
          const channels = guild.channels.cache.filter(ch => ch.type === 0);
          const channel = channels
            .filter(ch => ch.permissionsFor(guild.members.me)?.has(PermissionsBitField.Flags.SendMessages))
            .first();

          if (channel) {
            await channel.send({ embeds: [channelUpdateEmbed] });
            channelSuccessCount++;
            console.log(`Channel update sent to #${channel.name} in ${guild.name}`);
          } else {
            channelFailCount++;
            console.log(`No suitable channel found in ${guild.name}`);
          }
        } catch (error) {
          channelFailCount++;
          console.log(`Failed to send channel update to ${guild.name}: ${error.message}`);
        }
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const channelResultEmbed = new EmbedBuilder()
        .setColor('0099ff')
        .setTitle('Channel Update Results')
        .addFields(
          { name: '✅ Successful', value: channelSuccessCount.toString(), inline: true },
          { name: '❌ Failed', value: channelFailCount.toString(), inline: true },
          { name: '📊 Total Servers', value: client.guilds.cache.size.toString(), inline: true }
        );

      await interaction.editReply({ embeds: [channelResultEmbed] });
      break;
  }
});

// Send online notification when bot starts
client.once('ready', async () => {
  await sendOnlineNotification();
});

// Send notification when bot joins a server
client.on('guildCreate', async (guild) => {
  console.log(`Bot joined server: ${guild.name}`);
  await sendServerJoinNotification(guild);
});

// Send notification when bot leaves/is removed from a server
client.on('guildDelete', async (guild) => {
  console.log(`Bot removed from server: ${guild.name}`);
  await sendServerLeaveNotification(guild);
});

// Send offline message when bot disconnects
client.on('disconnect', async () => {
  console.log('Bot is going offline, sending notifications...');
  await sendOfflineMessage();
});

// Send offline message on process termination
process.on('SIGINT', async () => {
  console.log('Bot is shutting down, sending offline notifications...');
  await sendOfflineMessage();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Bot is shutting down, sending offline notifications...');
  await sendOfflineMessage();
  process.exit(0);
});

async function sendOnlineNotification() {
  const onlineEmbed = new EmbedBuilder()
    .setColor('00FF00')
    .setTitle('🟢 Bot Online')
    .setDescription('The bot is now online and ready to serve!')
    .setTimestamp()
    .setFooter({ text: `${client.user.tag} - Online Notification` });

  try {
    const channel = await client.channels.fetch('1335597135202353224');
    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [onlineEmbed] });
      console.log(`Online notification sent to channel ${channel.name}`);
    }
  } catch (error) {
    console.log(`Failed to send online notification: ${error.message}`);
  }
}

async function sendServerJoinNotification(guild) {
  const joinEmbed = new EmbedBuilder()
    .setColor('00FF00')
    .setTitle('🎉 Bot Added to New Server')
    .setDescription(`The bot has been added to **${guild.name}**`)
    .addFields(
      { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
      { name: '🆔 Server ID', value: guild.id, inline: true },
      { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: `${client.user.tag} - Server Join Notification` });

  if (guild.iconURL()) {
    joinEmbed.setThumbnail(guild.iconURL({ dynamic: true }));
  }

  try {
    const channel = await client.channels.fetch('1335597135202353224');
    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [joinEmbed] });
      console.log(`Server join notification sent to channel ${channel.name}`);
    }
  } catch (error) {
    console.log(`Failed to send server join notification: ${error.message}`);
  }
}

async function sendServerLeaveNotification(guild) {
  const leaveEmbed = new EmbedBuilder()
    .setColor('FF4444')
    .setTitle('👋 Bot Removed from Server')
    .setDescription(`The bot has been removed from **${guild.name}**`)
    .addFields(
      { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
      { name: '🆔 Server ID', value: guild.id, inline: true },
      { name: '📅 Joined', value: `<t:${Math.floor(guild.joinedTimestamp / 1000)}:R>`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: `${client.user.tag} - Server Leave Notification` });

  if (guild.iconURL()) {
    leaveEmbed.setThumbnail(guild.iconURL({ dynamic: true }));
  }

  try {
    const channel = await client.channels.fetch('1335597135202353224');
    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [leaveEmbed] });
      console.log(`Server leave notification sent to channel ${channel.name}`);
    }
  } catch (error) {
    console.log(`Failed to send server leave notification: ${error.message}`);
  }
}

async function sendOfflineMessage() {
  const offlineEmbed = new EmbedBuilder()
    .setColor('FF0000')
    .setTitle('🔴 Bot Going Offline')
    .setDescription('The bot is going offline for maintenance or updates. It will be back online soon!')
    .setTimestamp()
    .setFooter({ text: `${client.user.tag} - Offline Notification` });

  try {
    const channel = await client.channels.fetch('1335597135202353224');
    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [offlineEmbed] });
      console.log(`Offline notification sent to channel ${channel.name}`);
    }
  } catch (error) {
    console.log(`Failed to send offline notification: ${error.message}`);
  }
}

client.login(TOKEN);

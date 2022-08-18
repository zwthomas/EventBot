// Require the necessary discord.js classes
const Sequelize = require('sequelize');
const { Client, GatewayIntentBits } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');

const CONSTANTS = require("./constants.js")

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });


// DB reference https://discordjs.guide/sequelize/#why-use-an-orm
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const Event = sequelize.define('event', {
	member: {
		type: Sequelize.STRING,
		unique: true,
	},
	status: Sequelize.STRING,
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  Event.sync()
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {

  if (interaction.isButton()) {
    let memberId = interaction.member.id
    let status = interaction.customId

    // Get response if exists
    const member = await Event.findOne({ where: { member: memberId } });

    // Previously Responded
    if (member) {
      console.log("Update memeber status")
      const affectedRows = await Event.update({ status: status }, { where: { member: memberId } });

    // New Response
    } else {
      console.log("Add new member")
      const newMember = await Event.create({
				member: memberId,
				status: status,
			});
      // await newMember.save()
    }

    // Update Embed

    // Get all responses
    const dbAccepted = await Event.findAll( { where: { status: CONSTANTS.ACCEPT } });
    let accepted = "..."
    if (dbAccepted.length > 0) {
      accepted = dbAccepted.map(e => interaction.guild.members.cache.get(e.member).displayName).join("\n")
    } 

    const dbDecline = await Event.findAll( { where: { status: CONSTANTS.DECLINE } });
    let declined = "..."
    if (dbDecline.length > 0) {
      declined = dbDecline.map(e => interaction.guild.members.cache.get(e.member).displayName).join("\n")
    } 
    const dbTentative = await Event.findAll( { where: { status: CONSTANTS.TENTATIVE } });
    let tentative = "..."
    if (dbTentative.length > 0) {
      tentative = dbTentative.map(e => interaction.guild.members.cache.get(e.member).displayName).join("\n")
    } 

    const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Some title')
			.setURL('https://discord.js.org')
			.setDescription('Some description here')
      .addFields(
        { name: 'Accept', value: accepted, inline: true},
        { name: 'Decline', value: declined, inline: true },
        { name: 'Tentative', value: tentative, inline: true },
      )
      ;
    interaction.update({ embeds: [embed] });
    return;
  }
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		const row = new ActionRowBuilder()
			.addComponents(
        new ButtonBuilder()
					.setCustomId(CONSTANTS.ACCEPT)
					.setLabel("Accept")
					.setStyle(ButtonStyle.Success),
          new ButtonBuilder()
					.setCustomId(CONSTANTS.DECLINE)
					.setLabel("Decline")
					.setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
					.setCustomId(CONSTANTS.TENTATIVE)
					.setLabel("Tentative")
					.setStyle(ButtonStyle.Primary),
      );

		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Some title')
			.setURL('https://discord.js.org')
			.setDescription('Some description here')
      .addFields(
        { name: 'Accept', value: 'Some value here\nhello', inline: true},
        { name: 'Decline', value: 'Some value here', inline: true },
        { name: 'Tentative', value: 'Some value here', inline: true },
      );
    
    let channelId = interaction.channel.id
    let channel = interaction.channel
    // channel.send("hello, world")


    console.log(interaction.channel.id)

		await interaction.reply({ content: 'Pong!', ephemeral: true, embeds: [embed], components: [row] });
	
	} else if (commandName === 'server') {
		await interaction.reply('Server info.');
	} else if (commandName === 'user') {
		await interaction.reply('User info.');
	}
});

// Login to Discord with your client's token
client.login(token);
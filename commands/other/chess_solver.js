const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const axios = require("axios");
const util = require("util");
const execAsync = util.promisify(require("child_process").exec);
const client = require("../../index.js");

async function fetchImage(imageAttachment) {
    const response = await axios.get(imageAttachment.url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary");
}

async function execute() {
    const { stdout, stderr } = await execAsync("python ./commands/other/chess_solver.py");

    if (!stdout) return [];

    const moves = stdout.trim().split("\r\n");
    return moves;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("chess_solver")
        .setDescription("Gives the best chess move based on an image using stockfish")
        .addAttachmentOption((option) =>
            option.setName("image").setDescription("Attach a chess board image").setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const imageAttachment = interaction.options.getAttachment("image");
        const move = interaction.options.getString("move");

        const image = await fetchImage(imageAttachment);
        const imagePath = "./data/image.png";
        fs.writeFileSync(imagePath, image);

        const result = await execute();
        if (result.length == 0) return interaction.followUp("No valid chessboard detected.");

        let reply = "";
        reply += `Best move for white: **${result[0]}**\n`;
        reply += `Best move for black: **${result[1]}**`;

        await interaction.followUp({
            content: reply,
            files: [{ attachment: imagePath }],
        });
    },
};

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const imageAttachment = message.attachments.first();
    if (!imageAttachment) return;

    const image = await fetchImage(imageAttachment);
    const imagePath = "./data/image.png";
    fs.writeFileSync(imagePath, image);

    const result = await execute();
    if (result.length == 0) return;

    let reply = "";
    reply += `Best move for white: **${result[0]}**\n`;
    reply += `Best move for black: **${result[1]}**`;

    await message.reply({
        content: reply,
        files: [{ attachment: imagePath }],
    });
});

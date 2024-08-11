const { SlashCommandBuilder } = require("discord.js");
const { Fishy } = require("discord-gamecord");

module.exports = {
    data: new SlashCommandBuilder().setName("fishy").setDescription("Play Fishy"),

    async execute(interaction) {
        const Game = new Fishy({
            message: interaction,
            isSlashGame: true,
            player: player,
            embed: {
                title: "Fishy Inventory",
                color: "#5865F2",
            },
            fishes: {
                junk: { emoji: "🔧", price: 5 },
                common: { emoji: "🐟", price: 10 },
                uncommon: { emoji: "🐠", price: 20 },
                rare: { emoji: "🐡", price: 50 },
            },
            fishyRodPrice: 10,
            catchMessage: "You caught a {fish}. You paid {amount} for the fishing rod.",
            sellMessage: "You sold {amount}x {emoji} {type} items for a total of {price}.",
            noBalanceMessage: "You don't have enough balance to rent a fishing rod.",
            invalidTypeMessage: "Fish type can only be junk, common, uncommon or rare.",
            invalidAmountMessage: "Amount must be between 0 and fish max amount.",
            noItemMessage: "You don't have any of this item in your inventory.",
        });

        // Catch Fish
        Game.catchFish();
        Game.on("catchFish", (fishy) => {
            player = fishy.player;
        });

        // Sell Fish
        Game.sellFish(fishType, amount);
        Game.on("sellFish", (fishy) => {
            player = fishy.player;
        });
        // FishType: junk || common || uncommon || rare

        // PLayer Inventory
        Game.fishyInventory();
    },
};

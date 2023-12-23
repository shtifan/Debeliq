const { SlashCommandBuilder } = require('discord.js');
const client = require('../../main.js');

let cases = [
    { number: 1, value: 0.01 },
    { number: 2, value: 1 },
    { number: 3, value: 5 },
    { number: 4, value: 10 },
    { number: 5, value: 25 },
    { number: 6, value: 50 },
    { number: 7, value: 75 },
    { number: 8, value: 100 },
    { number: 9, value: 200 },
    { number: 10, value: 300 },
    { number: 11, value: 400 },
    { number: 12, value: 500 },
    { number: 13, value: 750 },
    { number: 14, value: 1000 },
    { number: 15, value: 5000 },
    { number: 16, value: 10000 },
    { number: 17, value: 25000 },
    { number: 18, value: 50000 },
    { number: 19, value: 75000 },
    { number: 20, value: 100000 },
    { number: 21, value: 200000 },
    { number: 22, value: 300000 },
    { number: 23, value: 400000 },
    { number: 24, value: 500000 },
    { number: 25, value: 750000 },
    { number: 26, value: 1000000 },
];

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i].value, arr[j].value] = [arr[j].value, arr[i].value];
    }
}

function remove(number, arr) {
    const index = arr.findIndex(_case => _case.number == number);
    arr.splice(index, 1);
}

function getOffer(cases) {
    const totalValue = cases.reduce((sum, _case) => sum + _case.value, 0);
    const averageValue = totalValue / cases.length;

    const offerPercentage = 0.8;

    const bankerOffer = averageValue * offerPercentage;

    return Math.floor((bankerOffer * 100) / 100);
}

function remainingCases(cases) {
    let remainingValues = cases.map(_case => _case.value);
    let sortedValues = remainingValues
        .sort((a, b) => a - b)
        .map(_case => `$${_case}`)
        .join('\n');

    return `Remaining values:\n${sortedValues}`;
}

function remainingNumbers(cases) {
    let numbers = '';

    cases.forEach(_case => {
        numbers += `${_case.number}, `;
    });

    numbers = numbers.slice(0, -2);

    return `Remaining numbers: ${numbers}`;
}

function swapCase(yourCase, finalCase) {
    let remainingCases = cases.filter(_case => _case.number != yourCase);
    return remainingCases.length > 0 ? remainingCases[0].number : finalCase;
}

let gamedeal = false;
let yourCase = 0;

module.exports = {
    data: new SlashCommandBuilder().setName('deal').setDescription('Play deal or no deal'),

    async execute(interaction) {
        interaction.deferReply();
        interaction.deleteReply();
        gamedeal = true;
        interaction.channel.send('The deal or no deal game has started.');
        interaction.channel.send('These are all the briefcases:');
        let remaining = remainingCases(cases);
        interaction.channel.send(remaining);
        shuffle(cases);
        interaction.channel.send('The briefcases have been shuffled.');
        interaction.channel.send('Choose your briefcase:');
    },
};

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!gamedeal) return;

    let input = parseInt(message.content);
    if (input < 1 || input > 26) return;

    let index = 0;
    let flag = false;
    try {
        index = cases.findIndex(_case => _case.number == input);
        test = cases[index].number;
    } catch (error) {
        flag = true;
    }

    if (flag) return;
    if (input == yourCase) return;

    if (yourCase == 0) {
        yourCase = input;
        message.channel.send('Now choose 6 briefcases to reveal:');
    } else {
        remove(input, cases);
        message.channel.send(`Behind case ${input} there were $${cases[index].value}`);

        let special = [20, 15, 11, 8, 5, 2];
        if (special.includes(cases.length)) {
            message.channel.send(`The banker offer is $${getOffer(cases)}`);
            message.channel.send('Do you accept the deal?');
        }

        if (cases.length == 1) message.channel.send('Do you want to switch your case with the last remaining?');

        if (!(special.includes(cases.length) || cases.length == 1)) {
            let remaining = remainingCases(cases);
            message.channel.send(remaining);
            let numbers = remainingNumbers(cases);
            message.channel.send(numbers);
        }
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!gamedeal) return;

    let input = message.content;

    if (input.toLowerCase() == 'yes') {
        if (cases.length == 1) {
            let finalCase = swapCase(yourCase, cases[0].number);
            let index = cases.findIndex(_case => _case.number == finalCase);
            let value = cases[index].value;
            message.channel.send(`Congratulations! You win $${value}`);
            gamedeal = false;
        } else {
            message.channel.send(`Congratulations! You win $${getOffer(cases)}`);
            gamedeal = false;
        }
    } else if (input.toLowerCase() == 'no') {
        if (cases.length == 1) {
            let index = cases.findIndex(_case => _case.number == yourCase);
            let value = cases[index].value;
            message.channel.send(`Congratulations! You win $${value}`);
            gamedeal = false;
        } else {
            let special = [20, 15, 11, 8, 5, 2];
            if (special.includes(cases.length)) {
                let remainingCases = cases.length - special[special.indexOf(cases.length) + 1];
                message.channel.send(`Now choose ${remainingCases} more cases:`);
            } else {
                message.channel.send('You declined the dealer offer');
                gamedeal = false;
            }
        }
    }
});

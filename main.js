// Core Constants and State
const COLORS = ['Red', 'Green', 'Blue', 'Yellow'];
const SPECIALS = ['Skip', 'Reverse', 'Draw Two', 'Wild', 'Wild_Draw_4'];
let gameDeck = [];
let userHand = [];
let botHand = [];
let activeCard = null;
let isGameOn = true;
let chosenColor = null;

// Helpers
const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[randomIndex]] = [deck[randomIndex], deck[i]];
    }
    return deck;
};

const generateCardImage = (card) => {
    if (['Wild', 'Wild_Draw_4'].includes(card.value)) {
        return `cards/${card.value}.jpg`;  // Updated to match first code
    } else if (card.value === 'Draw Two') {
        return `cards/${card.color}_Draw_2.jpg`;  // Updated to match first code
    } else {
        return `cards/${card.color}_${card.value}.jpg`;
    }
};

const showMessage = (text) => {
    document.getElementById('message').innerText = text;
};

// Game Initialization
const buildDeck = () => {
    gameDeck = [];
    COLORS.forEach((color) => {
        for (let num = 0; num <= 9; num++) {
            gameDeck.push({ color, value: num.toString() });
            if (num > 0) gameDeck.push({ color, value: num.toString() });
        }
        SPECIALS.forEach((special) => {
            const cardColor = special.includes('Wild') ? 'Wild' : color;
            gameDeck.push({ color: cardColor, value: special });
        });
    });
    shuffleDeck(gameDeck);
};

const dealInitialCards = () => {
    userHand = gameDeck.splice(-7);
    botHand = gameDeck.splice(-7);
    activeCard = gameDeck.pop();
    refreshUI();
};

// UI Updates
const refreshUI = () => {
    const cardHTML = generateCardImage(activeCard);
    document.getElementById('current-card').innerHTML = `<img src="${cardHTML}" alt="${activeCard.color} ${activeCard.value}" class="card-image">`;

    document.getElementById('player-hand').innerHTML = userHand
        .map((card) => {
            const image = generateCardImage(card);
            return `<img src="${image}" alt="${card.color} ${card.value}" class="card-image" onclick="attemptPlay('${card.color}', '${card.value}')">`;
        })
        .join('');

    document.getElementById('bot-hand').innerHTML = botHand
        .map(() => '<img src="cards/back.jpg" alt="Bot card" class="card-image">')
        .join('');

    showMessage('');
};

// Game Logic
const attemptPlay = (color, value) => {
    const selectedCard = { color, value };

    if (!userHand.some((card) => card.color === activeCard.color || card.value === activeCard.value || card.value === 'Wild' || card.value === 'Wild_Draw_4')) {
        alert("Invalid play! Pick another card.");
        return;
    }

    if (!userHand.some((card) => card.color === color && card.value === value)) {
        alert("You don't have this card!");
        return;
    }

    if (['Wild', 'Wild_Draw_4'].includes(value)) {
        chosenColor = prompt("Pick a color (Red, Green, Blue, Yellow):");
        if (!COLORS.includes(chosenColor)) {
            alert("Invalid color!");
            return;
        }
        activeCard = { color: chosenColor, value };
        if (value === 'Wild_Draw_4') drawCards(botHand, 4);
    } else if (value === 'Draw Two') {
        drawCards(botHand, 2);
        activeCard = selectedCard;
    } else {
        activeCard = selectedCard;
    }

    userHand = userHand.filter((card) => !(card.color === color && card.value === value));
    refreshUI();
    checkGameStatus();
    if (isGameOn) botMove();
};

const drawCards = (hand, count) => {
    for (let i = 0; i < count; i++) {
        if (gameDeck.length > 0) {
            hand.push(gameDeck.pop());
        }
    }
    refreshUI();
};

const botMove = () => {
    const validCards = botHand.filter(
        (card) =>
            card.color === activeCard.color ||
            card.value === activeCard.value ||
            ['Wild', 'Wild_Draw_4'].includes(card.value)
    );

    if (validCards.length > 0) {
        const botCard = validCards[0];
        if (botCard.value === 'Wild' || botCard.value === 'Wild_Draw_4') {
            activeCard = { color: COLORS[Math.floor(Math.random() * COLORS.length)], value: botCard.value };
            if (botCard.value === 'Wild_Draw_4') drawCards(userHand, 4);
        } else if (botCard.value === 'Draw Two') {
            drawCards(userHand, 2);
            activeCard = botCard;
        } else {
            activeCard = botCard;
        }
        botHand = botHand.filter((card) => !(card.color === botCard.color && card.value === botCard.value));
    } else if (gameDeck.length > 0) {
        botHand.push(gameDeck.pop());
    }

    refreshUI();
    checkGameStatus();
};

const checkGameStatus = () => {
    if (userHand.length === 0) {
        showMessage('🎉 You win! Congrats!');
        isGameOn = false;
    } else if (botHand.length === 0) {
        showMessage('😞 Bot wins! Try again!');
        isGameOn = false;
    }
};

// Event Handlers
const startGame = () => {
    buildDeck();
    dealInitialCards();
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('game').style.display = 'flex';
    isGameOn = true;
};

document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('draw-card').addEventListener('click', () => {
    if (gameDeck.length > 0 && isGameOn) {
        userHand.push(gameDeck.pop());
        refreshUI();
    } else {
        showMessage('No cards left to draw!');
    }
});
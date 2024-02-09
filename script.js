document.addEventListener('DOMContentLoaded', function () {
    const playerForm = document.getElementById('player-form');
    const startButton = document.getElementById('start-game');
    const bingoBoard = document.getElementById('bingo-board');
    const drawButton = document.getElementById('draw-number');
    const currentNumber = document.getElementById('current-number');

    let currentPlayer = 0;
    let turnCounter = 0;
    let bingoNumbers = [];
    let victories = JSON.parse(localStorage.getItem('victories')) || {};

    playerForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const playerNames = document.getElementById('player-names').value;
        const boardSize = parseInt(document.getElementById('board-size').value);

        if (playerNames && boardSize >= 3 && boardSize <= 5) {
            const players = playerNames.split(',').map(name => name.trim());
            const totalPlayers = players.length;
            const bingoCards = generateBingoCards(totalPlayers, boardSize);
            startGame(players, bingoCards);
        } else {
            alert('Por favor, ingresa nombres de jugadores y un tamaño de cartón válido.');
        }
    });

    drawButton.addEventListener('click', function () {
        const randomNum = getRandomNumber();
        currentNumber.textContent = `Número obtenido: ${randomNum}`;
        checkAndUpdateCards(randomNum);
        turnCounter++;
        if (turnCounter >= 25) {
            endGame();
        }
    });

    function generateBingoCards(numPlayers, size) {
        const cards = [];
        for (let i = 0; i < numPlayers; i++) {
            const card = [];
            for (let row = 0; row < size; row++) {
                const rowNumbers = [];
                for (let col = 0; col < size; col++) {
                    const randomNum = Math.floor(Math.random() * 50) + 1;
                    rowNumbers.push(randomNum);
                }
                card.push(rowNumbers);
            }
            cards.push(card);
        }
        return cards;
    }

    function startGame(players, cards) {
        console.log('¡Juego de Bingo iniciado!');
        console.log('Jugadores:', players);
        console.log('Cartones:', cards);

        // Mostrar los cartones de cada jugador
        for (let i = 0; i < players.length; i++) {
            const playerCard = createBingoCard(cards[i], players[i]);
            bingoBoard.appendChild(playerCard);
        }
    }

    function createBingoCard(card, playerName) {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('bingo-card');

        for (const row of card) {
            const rowContainer = document.createElement('div');
            rowContainer.classList.add('bingo-row');
            for (const num of row) {
                const numElement = document.createElement('span');
                numElement.textContent = num;
                numElement.classList.add('bingo-number');
                rowContainer.appendChild(numElement);
            }
            cardContainer.appendChild(rowContainer);
        }
        const playerNameElement = document.createElement('p');
        playerNameElement.textContent = `Jugador: ${playerName}`;
        cardContainer.appendChild(playerNameElement);

        return cardContainer;
    }


    function checkAndUpdateCards(number) {
        const allCards = document.querySelectorAll('.bingo-card');

        for (let card of allCards) {
            const cardNumbers = card.querySelectorAll('.bingo-number');
            for (let numElement of cardNumbers) {
                if (parseInt(numElement.textContent) === number) {
                    numElement.classList.add('matched-number');
                }
            }
        }
        checkGameStatus();
    }

    function checkGameStatus() {
        const allCards = document.querySelectorAll('.bingo-card');

        for (let i = 0; i < allCards.length; i++) {
            const cardNumbers = allCards[i].querySelectorAll('.bingo-number');
            let cardCompleted = true;

            for (const numElement of cardNumbers) {
                if (!numElement.classList.contains('matched-number')) {
                    cardCompleted = false;
                    break;
                }
            }

            if (cardCompleted) {
                endGame();
                return;
            }
        }
    }

    function endGame() {
        console.log('Partida finalizada. Calculando puntos...');
        const allCards = document.querySelectorAll('.bingo-card');

        let maxPoints = -1;
        let winnerName = '';

        for (let i = 0; i < allCards.length; i++) {
            const cardNumbers = allCards[i].querySelectorAll('.bingo-number');
            const size = Math.sqrt(cardNumbers.length);

            let rows = Array.from({ length: size }, () => 0);
            let cols = Array.from({ length: size }, () => 0);
            let diagonal1 = 0;
            let diagonal2 = 0;
            let totalPoints = 0;

            for (let j = 0; j < cardNumbers.length; j++) {
                const numElement = cardNumbers[j];
                if (numElement.classList.contains('matched-number')) {
                    const rowIndex = Math.floor(j / size);
                    const colIndex = j % size;

                    rows[rowIndex]++;
                    cols[colIndex]++;

                    if (rowIndex === colIndex) {
                        diagonal1++;
                    }

                    if (rowIndex + colIndex === size - 1) {
                        diagonal2++;
                    }
                }
            }

            if (rows.every(row => row === size)) {
                totalPoints += 1;
            }

            if (cols.every(col => col === size)) {
                totalPoints += 1;
            }

            if (diagonal1 === size || diagonal2 === size) {
                totalPoints += 3;
            }

            victories[`Jugador ${i + 1}`] = totalPoints;

            if (totalPoints > maxPoints) {
                maxPoints = totalPoints;
                winnerName = `Jugador ${i + 1}`;
            }
        }

        console.log(`El jugador con más puntos es: ${winnerName}`);
        console.log(`Puntos obtenidos: ${maxPoints}`);
    }
    
    
    

    // Otras funciones auxiliares

    function getRandomNumber() {
        return Math.floor(Math.random() * 50) + 1;
    }
});
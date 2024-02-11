document.addEventListener('DOMContentLoaded', function () {
    const playerForm = document.getElementById('player-form');
    const startButton = document.getElementById('start-game');
    const bingoBoard = document.getElementById('bingo-board');
    const drawButton = document.getElementById('draw-number');
    const currentNumber = document.getElementById('current-number');
    const counter = document.getElementById('counter');
    drawButton.style.display = 'none';

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
            drawButton.style.display = 'initial';
            startGame(players, bingoCards);
        } else {
            alert('Por favor, ingresa nombres de jugadores y un tamaño de cartón válido.');
        }
    });

    drawButton.addEventListener('click', function () {
        const randomNum = getRandomNumber();
        currentNumber.textContent = `Número obtenido: ${randomNum}`;
        turnCounter++;
        counter.textContent = `Turno: ${turnCounter}`;
        checkAndUpdateCards(randomNum);
        if (turnCounter >= 25) {
            endGame();
        }
    });

    function generateBingoCards(numPlayers, size) {
        const cards = [];
        for (let i = 0; i < numPlayers; i++) {
            const card = [];
            const selectedNumbers = new Set();
            for (let row = 0; row < size; row++) {
                const rowNumbers = [];
                for (let col = 0; col < size; col++) {
                    let randomNum;
                    do {
                        randomNum = Math.floor(Math.random() * 50) + 1;
                    } while (selectedNumbers.has(randomNum));
                    selectedNumbers.add(randomNum);
                    rowNumbers.push(randomNum);
                }
                card.push(rowNumbers);
            }
            cards.push(card);
        }
        return cards;
    }
    

    function startGame(players, cards) {
        startButton.style.display = 'none';
        playerForm.style.display = 'none';
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Nueva Partida';
        restartButton.addEventListener('click', function(){
            window.location.href = 'index.html';
        });
        drawButton.parentNode.appendChild(restartButton);
        // Mostrar los cartones de cada jugador
        for (let i = 0; i < players.length; i++) {
            const playerCard = createBingoCard(cards[i], players[i]);
            bingoBoard.appendChild(playerCard);
        }
    }

    function createBingoCard(card, playerName) {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('bingo-card');
        const playerNameElement = document.createElement('p');
        playerNameElement.textContent = `Jugador: ${playerName}`;
        cardContainer.appendChild(playerNameElement);

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
        const allCards = document.querySelectorAll('.bingo-card');
        let maxPoints = -1;
        let winnerName = '';
        let puntosJugadores = {}; // Objeto para almacenar los puntos de cada jugador
    
        allCards.forEach(card => {
            const playerName = card.querySelector('p').textContent.split(": ")[1];
            const cardNumbers = card.querySelectorAll('.bingo-number');
            const size = Math.sqrt(cardNumbers.length);
            let rows = Array.from({ length: size }, () => 0);
            let cols = Array.from({ length: size }, () => 0);
            let diagonal1 = 0;
            let diagonal2 = 0;
            let full = 0;
            let totalPoints = 0;
    
            cardNumbers.forEach((numElement, index) => {
                if (numElement.classList.contains('matched-number')) {
                    const rowIndex = Math.floor(index / size);
                    const colIndex = index % size;
                    rows[rowIndex]++;
                    cols[colIndex]++;
                    if (rowIndex === colIndex) {
                        diagonal1++;
                    }
                    if (rowIndex + colIndex === size - 1) {
                        diagonal2++;
                    }
    
                    if(rows[rowIndex] === size){
                        totalPoints += 1;
                        full += 1;
                    }
    
                    if(cols[colIndex] === size){
                        totalPoints += 1;
                    }
                }
            });
    
            if (diagonal1 === size) {
                totalPoints += 3; 
            }
    
            if (diagonal2 === size) {
                totalPoints += 3; 
            }
    
            if (full === size){
                totalPoints += 5;
            }
    
            if (puntosJugadores[playerName]) {
                puntosJugadores[playerName] += totalPoints;
            } else {
                puntosJugadores[playerName] = totalPoints;
            }
    
            if (puntosJugadores[playerName] > maxPoints) {
                maxPoints = puntosJugadores[playerName];
                winnerName = playerName;
            }
        });
    
        if (victories[winnerName]) {
            victories[winnerName]++;
        } else {
            victories[winnerName] = 1;
        }      
    
        localStorage.setItem('victories', JSON.stringify(victories));
    
        const drawButton = document.getElementById('draw-number');
        drawButton.style.display = 'none';
    
        if(maxPoints <= 0){
            document.getElementById('winner-display').textContent = `Nadie gano, todos obtuvieron 0 puntos.`;
        }else{
            document.getElementById('winner-display').textContent = `El ganador es: ${winnerName} con ${maxPoints} puntos. 🏆`;
        }

        const playerScoresElement = document.getElementById('player-scores');
        playerScoresElement.innerHTML = '';


        const playerScore = document.createElement('table');
        const headerRow = playerScore.insertRow();
        const playerNameHeader = headerRow.insertCell();
        playerNameHeader.textContent = 'Jugador';
        const pointsHeader = headerRow.insertCell();
        pointsHeader.textContent = 'Puntos Obtenidos'
        for (const playerName in puntosJugadores) {
            const row = playerScore.insertRow();
            const playerNameCell = row.insertCell();
            playerNameCell.textContent = playerName;
            const pointsCell = row.insertCell();
            pointsCell.textContent = puntosJugadores[playerName];   
        }

        playerScoresElement.appendChild(playerScore);


        const sortedPlayers = [...new Set([...Object.keys(puntosJugadores), ...Object.keys(victories)])].sort((a, b) => victories[b] - victories[a]);

        const tableButton = document.createElement('button');
        tableButton.textContent = 'Victorias Acumuladas';
        tableButton.addEventListener('click', function(){
            bingoBoard.style.display = 'none';
            drawButton.style.display = 'none';
            counter.style.display = 'none';
            currentNumber.style.display = 'none';
            startButton.style.display = 'none';
            playerForm.style.display = 'none';
            tableButton.style.display = 'none';
            document.getElementById('winner-display').style.display = 'none';
            playerScoresElement.style.display = 'none';

            const tableContainer = document.createElement('div');
            const table = document.createElement('table');
            table.classList.add('player-table')
            const headerRow = table.insertRow();
            const playerNameHeader = headerRow.insertCell(0);
            playerNameHeader.textContent = 'Jugador';
            const victoriesHeader = headerRow.insertCell(1);
            victoriesHeader.textContent = 'Victorias acumuladas';
    
            sortedPlayers.forEach(playerName => {
                if (victories[playerName] > 0) {
                    const row = table.insertRow();
                    const playerNameCell = row.insertCell(0);
                    playerNameCell.textContent = playerName;
                    const victoriesCell = row.insertCell(1);
                    victoriesCell.textContent = victories[playerName];
                }
            });
    
            tableContainer.appendChild(table);
            
            drawButton.parentNode.appendChild(tableContainer);
        });
    
        playerScoresElement.appendChild(tableButton);
    }
    
    function getRandomNumber() {
        let randomNum;
        do{
            randomNum = Math.floor(Math.random() * 50) + 1;
        }while (bingoNumbers.includes(randomNum));
         bingoNumbers.push(randomNum);
         return randomNum;
    }
});
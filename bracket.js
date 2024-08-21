document.addEventListener('DOMContentLoaded', function() {
    const players = JSON.parse(localStorage.getItem('tournamentPlayers')) || [];

    if (players.length < 2) {
        document.getElementById('bracket-container').innerHTML = '<p>No hay suficientes participantes para generar un torneo.</p>';
        return;
    }

    const shuffledPlayers = shuffleArray(players);
    const rounds = generateBracket(shuffledPlayers);

    localStorage.setItem('tournamentRounds', JSON.stringify(rounds));
    displayBracket(rounds, document.getElementById('bracket-container'));
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateBracket(players) {
    let rounds = [];
    let currentRound = [];

    for (let i = 0; i < players.length; i += 2) {
        const player1 = players[i];
        const player2 = players[i + 1] || 'BYE';  // 'BYE' representa un pase automático a la siguiente ronda
        currentRound.push([player1, player2]);
    }

    rounds.push(currentRound);

    while (currentRound.length > 1) {
        let nextRound = new Array(Math.ceil(currentRound.length / 2)).fill([null, null]);
        rounds.push(nextRound);
        currentRound = nextRound;
    }

    return rounds;
}

function displayBracket(rounds, container) {
    rounds.forEach((round, roundIndex) => {
        const roundElement = document.createElement('div');
        roundElement.className = 'round';
        roundElement.style.minHeight = `${Math.pow(2, rounds.length - roundIndex - 1) * 100}px`;  // Ajuste de altura

        round.forEach((match, matchIndex) => {
            const matchElement = document.createElement('div');
            matchElement.className = 'match';

            const player1 = match[0] || '';
            const player2 = match[1] || '';

            matchElement.innerHTML = `
                <div class="player" onclick="selectWinner(${roundIndex}, ${matchIndex}, 0)">${player1}</div>
                <div class="vs">vs</div>
                <div class="player" onclick="selectWinner(${roundIndex}, ${matchIndex}, 1)">${player2}</div>
            `;

            roundElement.appendChild(matchElement);
        });

        container.appendChild(roundElement);
    });
}

function selectWinner(roundIndex, matchIndex, playerIndex) {
    const rounds = JSON.parse(localStorage.getItem('tournamentRounds'));
    const currentMatch = rounds[roundIndex][matchIndex];
    const winner = currentMatch[playerIndex];

    if (!winner) return;

    if (roundIndex + 1 < rounds.length) {
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const nextSlotIndex = matchIndex % 2;
        rounds[roundIndex + 1][nextMatchIndex][nextSlotIndex] = winner;
    } else {
        localStorage.setItem('tournamentWinner', winner);
        window.location.href = 'winner.html';
        return;
    }

    localStorage.setItem('tournamentRounds', JSON.stringify(rounds));
    document.getElementById('bracket-container').innerHTML = '';
    displayBracket(rounds, document.getElementById('bracket-container'));
}

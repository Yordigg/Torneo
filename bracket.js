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
    const totalPlayers = players.length;
    const rounds = [];
    
    // Encontrar la potencia de 2 más cercana por debajo del número de jugadores
    const targetPowerOfTwo = getLowerPowerOfTwo(totalPlayers);
    const extraPlayers = totalPlayers - targetPowerOfTwo;
    // Si hay jugadores extra, crear ronda preliminar
    if (extraPlayers > 0) {
        const preliminaryMatches = [];
        const playersNeededToRemove = (totalPlayers - targetPowerOfTwo) * 2;
        const remainingPlayers = [...players];
        const preliminaryPlayers = remainingPlayers.splice(0, playersNeededToRemove);
        
        // Crear matches preliminares
        for (let i = 0; i < preliminaryPlayers.length; i += 2) {
            preliminaryMatches.push([
                preliminaryPlayers[i],
                preliminaryPlayers[i + 1] || 'BYE'
            ]);
        }
        
        rounds.push(preliminaryMatches);
        
        // Crear el bracket principal con espacios para los ganadores de preliminares
        let mainBracketPlayers = [];
        const spacesNeeded = preliminaryMatches.length;
        
        // Distribuir los espacios vacíos uniformemente
        const interval = Math.floor(targetPowerOfTwo / spacesNeeded);
        let currentIndex = 0;
        
        for (let i = 0; i < targetPowerOfTwo; i++) {
            if (i % interval === 0 && currentIndex < spacesNeeded) {
                mainBracketPlayers.push(null); // Espacio para ganador de preliminar
                currentIndex++;
            } else if (remainingPlayers.length > 0) {
                mainBracketPlayers.push(remainingPlayers.shift());
            }
        }
        
        // Rellenar los espacios restantes
        while (remainingPlayers.length > 0) {
            for (let i = 0; i < mainBracketPlayers.length; i++) {
                if (mainBracketPlayers[i] === null && remainingPlayers.length > 0) {
                    mainBracketPlayers[i] = remainingPlayers.shift();
                }
            }
        }
        
        players = mainBracketPlayers;
    }
    
    // Generar el resto del bracket
    let currentRound = [];
    for (let i = 0; i < players.length; i += 2) {
        currentRound.push([
            players[i] || null,
            players[i + 1] || null
        ]);
    }
    rounds.push(currentRound);
    
    // Generar rondas subsiguientes
    while (currentRound.length > 1) {
        let nextRound = [];
        for (let i = 0; i < currentRound.length; i += 2) {
            nextRound.push([null, null]);
        }
        rounds.push(nextRound);
        currentRound = nextRound;
    }
    
    return rounds;
}

// Función auxiliar para obtener la potencia de 2 más cercana por debajo
function getLowerPowerOfTwo(n) {
    let power = 1;
    while (power * 2 <= n) {
        power *= 2;
    }
    return power;
}

// Función auxiliar para obtener la siguiente potencia de 2
function getNextPowerOfTwo(n) {
    let power = 1;
    while (power < n) {
        power *= 2;
    }
    return power;
}

function displayBracket(rounds, container) {
    container.innerHTML = '';
    const bracketWrapper = document.createElement('div');
    bracketWrapper.className = 'bracket-wrapper';

    // Nombres de las rondas según la cantidad total
    const roundNames = getRoundNames(rounds.length);

    rounds.forEach((round, roundIndex) => {
        const roundElement = document.createElement('div');
        roundElement.className = 'round';
        roundElement.dataset.round = roundIndex + 1;
        roundElement.dataset.roundName = roundNames[roundIndex];

        round.forEach((match, matchIndex) => {
            const matchElement = document.createElement('div');
            matchElement.className = 'match';

            const player1 = match[0] || '-----';
            const player2 = match[1] || '-----';

            const player1Clickable = player1 !== 'BYE' && player1 !== '-----';
            const player2Clickable = player2 !== 'BYE' && player2 !== '-----';

            const matchWrapper = document.createElement('div');
            matchWrapper.className = 'match-wrapper';
            matchWrapper.innerHTML = `
                <div class="player ${player1Clickable ? 'clickable' : ''}" 
                     ${player1Clickable ? `onclick="selectWinner(${roundIndex}, ${matchIndex}, 0)"` : ''}>
                    ${player1}
                </div>
                <div class="vs">VS</div>
                <div class="player ${player2Clickable ? 'clickable' : ''}"
                     ${player2Clickable ? `onclick="selectWinner(${roundIndex}, ${matchIndex}, 1)"` : ''}>
                    ${player2}
                </div>
            `;

            matchElement.appendChild(matchWrapper);
            roundElement.appendChild(matchElement);
        });

        bracketWrapper.appendChild(roundElement);
    });

    container.appendChild(bracketWrapper);
}

function getRoundNames(totalRounds) {
    const names = [];
    for (let i = 0; i < totalRounds; i++) {
        if (i === 0 && totalRounds > 3) {
            names.push('Ronda Preliminar');
        } else if (i === totalRounds - 1) {
            names.push('Final');
        } else if (i === totalRounds - 2) {
            names.push('Semifinal');
        } else if (i === totalRounds - 3) {
            names.push('Cuartos de Final');
        } else {
            names.push(`Ronda ${i}`);
        }
    }
    return names;
}

function selectWinner(roundIndex, matchIndex, playerIndex) {
    const rounds = JSON.parse(localStorage.getItem('tournamentRounds'));
    const currentMatch = rounds[roundIndex][matchIndex];
    const winner = currentMatch[playerIndex];

    if (!winner || winner === 'BYE' || winner === '-----') return;

    if (roundIndex + 1 < rounds.length) {
        if (roundIndex === 0 && rounds.length > 2) {
            // Encontrar el siguiente espacio vacío disponible en la ronda principal
            const nextRound = rounds[1];
            let placed = false;
            
            for (let i = 0; i < nextRound.length && !placed; i++) {
                for (let j = 0; j < 2; j++) {
                    if (nextRound[i][j] === null) {
                        nextRound[i][j] = winner;
                        placed = true;
                        break;
                    }
                }
            }
        } else {
            // Bracket normal
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const nextSlotIndex = matchIndex % 2;
            rounds[roundIndex + 1][nextMatchIndex][nextSlotIndex] = winner;
        }
    } else {
        localStorage.setItem('tournamentWinner', winner);
        window.location.href = 'winner.html';
        return;
    }

    localStorage.setItem('tournamentRounds', JSON.stringify(rounds));
    displayBracket(rounds, document.getElementById('bracket-container'));
}

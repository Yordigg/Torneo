// Constantes para configuración
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 32;
const REMOVE_ANIMATION_DURATION = 500;

// Elementos del DOM que se usan frecuentemente
const playerInput = document.getElementById('player-input');
const playersContainer = document.getElementById('players-container');
const participantCount = document.getElementById('participant-count');
const generateTournamentBtn = document.getElementById('generate-tournament-btn');

// Manejador de entrada de jugadores
playerInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const playerName = this.value.trim();
        if (playerName) {
            addPlayer(playerName);
            this.value = '';
        }
    }
});

// Manejador para generar torneo
generateTournamentBtn.addEventListener('click', function() {
    const players = Array.from(playersContainer.querySelectorAll('.player span'))
                        .map(player => player.textContent);

    if (players.length < MIN_PLAYERS) {
        alert(`¡Debes agregar al menos ${MIN_PLAYERS} participantes para generar un torneo!`);
        return;
    }

    localStorage.setItem('tournamentPlayers', JSON.stringify(players));
    window.location.href = 'generar.html';
});

// Función mejorada para agregar jugador con validación
function addPlayer(name) {
    if (!name || typeof name !== 'string') return;
    
    // Validar si el jugador ya existe
    const existingPlayers = Array.from(playersContainer.querySelectorAll('.player span'))
                                .map(span => span.textContent.toLowerCase());
    
    if (existingPlayers.includes(name.toLowerCase())) {
        alert('Este jugador ya está registrado');
        return;
    }

    // Validar número máximo de jugadores
    if (existingPlayers.length >= MAX_PLAYERS) {
        alert(`No se pueden agregar más de ${MAX_PLAYERS} jugadores`);
        return;
    }
    
    const playerElement = document.createElement('div');
    playerElement.className = 'player';
    
    const playerContent = `
        <span>${name}</span>
        <button class="remove-btn" aria-label="Eliminar jugador">X</button>
    `;
    
    playerElement.innerHTML = playerContent;
    playerElement.querySelector('.remove-btn').addEventListener('click', function() {
        removePlayer(playerElement);
    });
    
    playersContainer.appendChild(playerElement);
    updateParticipantCount();
}

// Función mejorada para remover jugador con animación
function removePlayer(playerElement) {
    if (!playerElement) return;
    
    playerElement.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    playerElement.style.transform = 'scale(0)';
    playerElement.style.opacity = '0';
    
    setTimeout(() => {
        playerElement.remove();
        updateParticipantCount();
    }, REMOVE_ANIMATION_DURATION);
}

// Función para actualizar contador de participantes
function updateParticipantCount() {
    const count = playersContainer.children.length;
    participantCount.textContent = `Participantes añadidos: ${count}`;
}

function handlePlayerClick(player, match) {
    if (!player || !match) return;
    
    // Verificar si el jugador ya avanzó a la siguiente ronda
    if (player.dataset.advanced === 'true') {
        return; // Si ya avanzó, no permitir seleccionarlo
    }
    
    const currentRound = match.closest('.round');
    const nextRound = currentRound.nextElementSibling;
    
    if (!nextRound) return;
    
    const nextMatch = nextRound.querySelector('.match-wrapper');
    if (!nextMatch) return;
    
    const nextPlayer = nextMatch.querySelector('.player:not(.filled)');
    if (!nextPlayer) return;
    
    // Marcar el jugador como avanzado
    player.dataset.advanced = 'true';
    
    // Copiar el nombre del jugador
    nextPlayer.textContent = player.textContent;
    nextPlayer.classList.add('filled');
    
    // Marcar el jugador actual como seleccionado
    player.classList.add('selected');
    
    // Guardar el movimiento para poder deshacerlo
    lastMove = {
        player: player,
        nextPlayer: nextPlayer,
        match: match
    };
    
    // Actualizar el estado de los participantes
    updateParticipantsState();
}

function undoLastMove() {
    if (!lastMove) return;
    
    const { player, nextPlayer, match } = lastMove;
    
    // Limpiar el jugador en la siguiente ronda
    nextPlayer.textContent = '';
    nextPlayer.classList.remove('filled');
    
    // Desmarcar el jugador actual como seleccionado
    player.classList.remove('selected');
    
    // Marcar el jugador como no avanzado
    player.dataset.advanced = 'false';
    
    // Limpiar el último movimiento
    lastMove = null;
    
    // Actualizar el estado de los participantes
    updateParticipantsState();
}

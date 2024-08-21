document.getElementById('player-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const playerName = this.value.trim();
        if (playerName !== '') {
            addPlayer(playerName);
            this.value = '';
        }
    }
});

document.getElementById('generate-tournament-btn').addEventListener('click', function() {
    const playersContainer = document.getElementById('players-container');
    const players = [];
    playersContainer.querySelectorAll('.player span').forEach(player => {
        players.push(player.textContent);
    });

    if (players.length < 2) {
        alert('¡Debes agregar al menos 2 participantes para generar un torneo!');
        return;
    }

    console.log('Participantes:', players);  // Verifica que los nombres se estén guardando correctamente
    localStorage.setItem('tournamentPlayers', JSON.stringify(players));
    window.location.href = 'generar.html';
});

function addPlayer(name) {
    const playersContainer = document.getElementById('players-container');
    const playerElement = document.createElement('div');
    playerElement.className = 'player';
    playerElement.innerHTML = `
        <span>${name}</span>
        <button onclick="removePlayer(this)">X</button>
    `;
    playersContainer.appendChild(playerElement);
    updateParticipantCount();
}

function removePlayer(button) {
    const playerElement = button.parentElement;
    playerElement.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    playerElement.style.transform = 'scale(0)';
    playerElement.style.opacity = '0';
    setTimeout(() => {
        playerElement.remove();
        updateParticipantCount();
    }, 500);
}

function updateParticipantCount() {
    const playersContainer = document.getElementById('players-container');
    const count = playersContainer.children.length;
    document.getElementById('participant-count').textContent = `Participantes añadidos: ${count}`;
}

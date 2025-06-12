// ===== CLASSES =====
class Card {
    constructor(name, cost, type, value, description) {
        this.name = name;
        this.cost = cost;
        this.type = type;  // 'damage' ou 'block'
        this.value = value;
        this.description = description;
    }

    // Método para criar o elemento HTML da carta
    createElement() {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerHTML = `
            <div class="cost">${this.cost}</div>
            <div class="name">${this.name}</div>
            <div class="effect">${this.description}</div>
        `;
        
        // Guardar referência à carta no elemento
        cardDiv.cardData = this;
        
        return cardDiv;
    }
}

class EnergyManager {
    constructor(maxEnergy) {
        this.current = maxEnergy;
        this.max = maxEnergy;
        this.updateDisplay();
    }
    
    canPlayCard(cost) {
        return this.current >= cost;
    }
    
    spendEnergy(cost) {
        this.current = Math.max(0, this.current - cost);
        this.updateDisplay();
    }
    
    refillEnergy() {
        this.current = this.max;
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('current-energy').textContent = this.current;
        
        // Atualizar visual das cartas baseado na energia disponível
        this.updateCardStates();
    }
    
    updateCardStates() {
        const cards = document.querySelectorAll('.hand .card');
        cards.forEach(card => {
            const cardData = card.cardData;
            if (cardData && !this.canPlayCard(cardData.cost)) {
                card.classList.add('unplayable');
            } else {
                card.classList.remove('unplayable');
            }
        });
    }
}

class Enemy {
    constructor(maxHp, name = 'Slime') {
        this.name = name;
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.block = 0; // ADICIONAR
        this.nextAction = null;
        this.generateNextAction();
    }
    
    generateNextAction() {
        // 70% chance de atacar, 30% de defender
        const rand = Math.random();
        if (rand < 0.7) {
            this.nextAction = {
                type: 'attack',
                value: Math.floor(Math.random() * 5) + 5 // 5-9 de dano
            };
        } else {
            this.nextAction = {
                type: 'defend',
                value: Math.floor(Math.random() * 3) + 3 // 3-5 de block
            };
        }
        this.updateIntentDisplay();
    }
    
    updateIntentDisplay() {
        let intentDiv = document.querySelector('.enemy-intent');
        if (!intentDiv) {
            intentDiv = document.createElement('div');
            intentDiv.className = 'enemy-intent';
            document.querySelector('.enemy-area').appendChild(intentDiv);
        }
        
        if (this.nextAction.type === 'attack') {
            intentDiv.innerHTML = `⚔️ ${this.nextAction.value}`;
            intentDiv.style.background = '#e94560';
        } else {
            intentDiv.innerHTML = `🛡️ ${this.nextAction.value}`;
            intentDiv.style.background = '#4dabf7';
        }
    }
    
    takeDamage(damage) {
        // ADICIONAR LÓGICA DE BLOCK
        let actualDamage = damage;
        
        // Primeiro reduz do block
        if (this.block > 0) {
            const blocked = Math.min(this.block, damage);
            this.block -= blocked;
            actualDamage -= blocked;
            
            if (blocked > 0) {
                showMessage(`Enemy blocked ${blocked} damage!`, 'block');
            }
        }
        
        // Aplicar dano restante
        if (actualDamage > 0) {
            this.currentHp = Math.max(0, this.currentHp - actualDamage);
        }
        
        // Atualizar displays
        this.updateDisplay();
        
        // Shake animation apenas se tomou dano real
        if (actualDamage > 0) {
            const enemyArea = document.querySelector('.enemy-area');
            enemyArea.classList.add('shake');
            setTimeout(() => enemyArea.classList.remove('shake'), 500);
        }
    }
    
    // NOVO MÉTODO
    addBlock(amount) {
        this.block += amount;
        this.updateDisplay();
    }
    
    // NOVO MÉTODO
    startNewTurn() {
        this.block = 0; // Block reseta no início do turno
        this.updateDisplay();
    }
    
    // NOVO MÉTODO
    updateDisplay() {
        // Atualizar HP
        document.getElementById('enemy-hp').textContent = this.currentHp;
        
        // Atualizar barra de vida
        const healthPercentage = (this.currentHp / this.maxHp) * 100;
        document.getElementById('enemy-health-fill').style.width = healthPercentage + '%';
        
        // Atualizar block
        const blockDisplay = document.getElementById('enemy-block-display');
        if (this.block > 0) {
            blockDisplay.classList.add('show');
            document.getElementById('enemy-block').textContent = this.block;
        } else {
            blockDisplay.classList.remove('show');
        }
    }
    
    executeAction() {
        const action = this.nextAction;
        this.generateNextAction(); // Preparar próxima ação
        return action;
    }
}

class Player {
    constructor(maxHp) {
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.block = 0;
        this.updateDisplay();
    }
    
    
    addBlock(amount) {
        this.block += amount;
        this.updateDisplay();
    }
    
  takeDamage(damage) {
    // ADICIONAR LÓGICA DE BLOCK
    let actualDamage = damage;
    
    // Primeiro reduz do block
    if (this.block > 0) {
        const blocked = Math.min(this.block, damage);
        this.block -= blocked;
        actualDamage -= blocked;
        
        if (blocked > 0) {
            // REMOVIDO: showMessage(`Enemy blocked ${blocked} damage!`, 'block');
            // Podemos adicionar um número visual de block se quiser
        }
    }
    
    // Aplicar dano restante
    if (actualDamage > 0) {
        this.currentHp = Math.max(0, this.currentHp - actualDamage);
    }
    
    // Atualizar displays
    this.updateDisplay();
    
    // Shake animation apenas se tomou dano real
    if (actualDamage > 0) {
        const enemyArea = document.querySelector('.enemy-area');
        enemyArea.classList.add('shake');
        setTimeout(() => enemyArea.classList.remove('shake'), 500);
    }
}

    
    startNewTurn() {
        this.block = 0; // Block reseta no início do turno
        this.updateDisplay();
    }
    
   updateDisplay() {
    // Atualizar HP
    document.getElementById('player-hp').textContent = this.currentHp;
    
    // Atualizar barra de vida
    const healthPercentage = (this.currentHp / this.maxHp) * 100;
    document.getElementById('player-health-fill').style.width = healthPercentage + '%';
    
    // Atualizar block
    const blockDisplay = document.getElementById('player-block-display');
    if (this.block > 0) {
        blockDisplay.classList.add('show');
        document.getElementById('player-block').textContent = this.block;
    } else {
        blockDisplay.classList.remove('show');
    }
}
}

// Mostrar dano no player
function showPlayerDamageNumber(damage) {
    const playerArea = document.querySelector('.player-area');
    const damageDiv = document.createElement('div');
    damageDiv.className = 'damage-number';
    damageDiv.textContent = `-${damage}`;
    playerArea.appendChild(damageDiv);
    
    setTimeout(() => damageDiv.remove(), 1000);
}

// Mostrar block ganho
function showBlockNumber(amount) {
    const playerArea = document.querySelector('.player-area');
    const blockDiv = document.createElement('div');
    blockDiv.className = 'block-number';
    blockDiv.textContent = `+${amount}`;
    playerArea.appendChild(blockDiv);
    
    setTimeout(() => blockDiv.remove(), 1000);
}

// Mostrar dano bloqueado
function showBlockedNumber(blocked) {
    const playerArea = document.querySelector('.player-area');
    const blockedDiv = document.createElement('div');
    blockedDiv.className = 'blocked-number';
    blockedDiv.textContent = `Blocked ${blocked}`;
    playerArea.appendChild(blockedDiv);
    
    setTimeout(() => blockedDiv.remove(), 1000);
}

// ===== VARIÁVEIS GLOBAIS =====
let deck = []; // Pilha de compra
let discardPile = []; // Pilha de descarte
let hand = [];
let cartaArrastando = null;
let offsetX = 0;
let offsetY = 0;
let energyManager = null;
let enemy = null;
let player = null;
let turnCount = 1;
let isTargeting = false;
let targetingCard = null;
let cardStartPosition = { x: 0, y: 0 };

// ===== FUNÇÕES DE GERENCIAMENTO DE CARTAS =====
function addCardToHand(card, index = 0) {
    hand.push(card);
    const cardElement = card.createElement();
    
    // Pegar posição da pilha de compra
    const deckPile = document.querySelector('.deck-pile');
    const deckRect = deckPile.getBoundingClientRect();
    
    // Calcular posição final na mão (antes de adicionar ao DOM)
    const handWidth = window.innerWidth;
    const spacing = Math.min(150, handWidth / 5); // Assumindo 5 cartas
    const totalWidth = 5 * spacing;
    const startX = (handWidth - totalWidth) / 2;
    const finalLeft = startX + (index * spacing);
    const finalBottom = 20;
    
    // Começar a carta na pilha de compra (pequena e sem rotação)
    cardElement.style.position = 'absolute';
    cardElement.style.left = (deckRect.left + deckRect.width / 2 - 60) + 'px';
    cardElement.style.top = (deckRect.top + deckRect.height / 2 - 80) + 'px';
    cardElement.style.transform = 'scale(0.1)';
    cardElement.style.opacity = '0';
    cardElement.style.zIndex = '100';
    cardElement.style.transition = 'none';
    
    document.getElementById('hand').appendChild(cardElement);
    
    // Forçar reflow
    cardElement.offsetHeight;
    
    // Animar para a posição final
    setTimeout(() => {
        cardElement.style.transition = 'all 0.4s ease-out';
        cardElement.style.left = finalLeft + 'px';
        cardElement.style.top = 'auto';
        cardElement.style.bottom = finalBottom + 'px';
        cardElement.style.transform = `scale(1) rotate(${(index - 2) * 3}deg)`; // Rotação do leque
        cardElement.style.opacity = '1';
        
        // Limpar depois da animação
        setTimeout(() => {
            cardElement.style.transition = '';
            cardElement.style.zIndex = index;
        }, 400);
    }, 50 + (index * 50)); // Delay baseado no índice para efeito cascata
}

function reorganizeHand() {
    const cards = document.querySelectorAll('.hand .card');
    const handWidth = window.innerWidth;
    const cardWidth = 120;
    const spacing = Math.min(150, handWidth / cards.length);
    const totalWidth = cards.length * spacing;
    const startX = (handWidth - totalWidth) / 2;
    
    cards.forEach((card, index) => {
        // Resetar qualquer transform anterior
        card.style.transition = 'none';
        card.style.transform = '';
        
        // Forçar reflow
        card.offsetHeight;
        
        // Aplicar nova transição
        card.style.transition = 'all 0.3s ease-out';
        
        // Posicionar horizontalmente
        card.style.left = `${startX + (index * spacing)}px`;
        card.style.bottom = '20px';
        card.style.top = 'auto'; // Garantir que top está resetado
        
        // Adicionar rotação para efeito "leque"
        const rotation = (index - (cards.length - 1) / 2) * 3;
        card.style.transform = `rotate(${rotation}deg)`;
        
        // Z-index para sobreposição correta
        card.style.zIndex = index;
        
        // Remover transition depois
        setTimeout(() => {
            card.style.transition = '';
        }, 300);
    });
}

// ===== FUNÇÕES DE DRAG & DROP =====
function iniciarDrag(e) {
    const card = e.target.closest('.card');
    if (!card) return;
    
    // Não permitir arrastar cartas sem energia
    if (card.classList.contains('unplayable')) {
        showMessage('Not enough energy!', 'error');
        return;
    }
    
    cartaArrastando = card;
    const rect = card.getBoundingClientRect();
    
    // Guardar offset do mouse em relação à carta
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // Guardar posição original da carta
    cartaArrastando.startX = rect.left;
    cartaArrastando.startY = rect.top;
    
    // Adicionar classe para visual de arraste
    card.classList.add('dragging');
    document.body.classList.add('dragging-active'); // ADICIONAR ESTA LINHA
    
    // Usar transform para mover a carta (não alterar left/top)
    card.style.zIndex = 1000;
}

function arrastar(e) {
    if (!cartaArrastando || isTargeting) return;
    
    // Calcular quanto mover desde a posição original
    const deltaX = e.clientX - offsetX - cartaArrastando.startX;
    const deltaY = e.clientY - offsetY - cartaArrastando.startY;
    
    // Usar transform para mover (preserva posição original)
    cartaArrastando.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(-5deg)`;
    
    // Verificar se está acima da área de manipulação
    const manipulationArea = window.innerHeight - 250; // 250px é a altura da área
    
    if (e.clientY < manipulationArea) {
        const cardData = cartaArrastando.cardData;
        
        // APENAS cartas de DANO iniciam targeting automaticamente
        if (cardData.type === 'damage') {
            // Carta de dano - iniciar targeting imediatamente
            console.log('Iniciando targeting automaticamente');
            startTargeting(cartaArrastando, e);
            
            // Limpar referência para evitar problemas
            cartaArrastando = null;
            document.body.style.cursor = 'default';
        } 
        // REMOVER o else if para cartas de block
        // Cartas de defesa continuam sendo arrastadas normalmente
        else {
            document.body.style.cursor = 'crosshair';
        }
    } else {
        // Está dentro da área de manipulação
        document.body.style.cursor = 'grab';
    }
}

function soltarCarta(e) {
    if (!cartaArrastando) return;
    
    const manipulationArea = window.innerHeight - 250;
    const cardData = cartaArrastando.cardData;
    
    // Se está acima da área de manipulação E é uma carta de defesa
    if (e.clientY < manipulationArea && cardData.type === 'block') {
        console.log('Aplicando defesa ao soltar');
        playCard(cartaArrastando);
    } else {
        // Se não, volta para a mão
        console.log('Voltando carta para a mão');
        cartaArrastando.classList.remove('dragging');
        returnCardToHand(cartaArrastando);
    }
    
    // Limpar estados
    cartaArrastando.style.zIndex = '';
    cartaArrastando = null;
    document.body.style.cursor = 'default';
}

function startTargeting(card, e) {
    isTargeting = true;
    targetingCard = card;
    targetingCard.targetStartTime = e.timeStamp;
    
    // Adicionar classe de targeting
    card.classList.add('targeting');
    card.classList.remove('dragging');
    
    // Calcular o centro da área das cartas na mão
    const cards = document.querySelectorAll('.hand .card');
    let leftMost = Infinity;
    let rightMost = -Infinity;
    
    cards.forEach(c => {
        const rect = c.getBoundingClientRect();
        leftMost = Math.min(leftMost, rect.left);
        rightMost = Math.max(rightMost, rect.right);
    });
    
    // Centro horizontal da mão
    const handCenterX = (leftMost + rightMost) / 2 - 60; // 60 = metade da largura da carta
    
    // Posição Y um pouco elevada em relação às outras cartas
    const baseBottom = parseInt(window.getComputedStyle(card).bottom) || 20;
    const elevatedBottom = baseBottom + 100; // Elevar 100px acima das outras
    
    // Converter bottom para top para a animação
    const windowHeight = window.innerHeight;
    const cardHeight = 160; // altura da carta
    const topPosition = windowHeight - elevatedBottom - cardHeight;
    
    // Mover carta para o centro da mão com destaque
    card.style.transition = 'all 0.3s ease-out';
    card.style.left = handCenterX + 'px';
    card.style.top = topPosition + 'px';
    card.style.bottom = 'auto';
    card.style.transform = 'scale(1.3) rotate(0deg)';
    card.style.zIndex = '1000';
    
    // Após a carta chegar à posição, mostrar targeting
    setTimeout(() => {
        // Atualizar posição de início da linha
        const rect = card.getBoundingClientRect();
        cardStartPosition = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        
        // Mostrar linha e cursor
        document.getElementById('targeting-line').style.display = 'block';
        document.getElementById('targeting-cursor').style.display = 'block';
        
        // Adicionar listeners temporários
        document.addEventListener('mousemove', updateTargeting);
        document.addEventListener('click', confirmTarget);
        document.addEventListener('keydown', cancelTargeting);
        
        // Adicionar classe ao body para efeitos visuais
        document.body.classList.add('targeting-mode');
        
        updateTargeting(e);
    }, 300); // Esperar a animação da carta terminar
}

function updateTargeting(e) {
    if (!isTargeting) return;
    
    // Atualizar posição do cursor
    const cursor = document.getElementById('targeting-cursor');
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Desenhar linha curva
    const svg = document.querySelector('#targeting-line svg');
    const path = document.getElementById('targeting-path');
    
    // Calcular pontos para curva de Bézier
    const startX = cardStartPosition.x;
    const startY = cardStartPosition.y;
    const endX = e.clientX;
    const endY = e.clientY;
    
    // Ponto de controle para a curva
    const controlX = (startX + endX) / 2;
    const controlY = Math.min(startY, endY) - 100; // Curva para cima
    
    // Criar path SVG
    const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
    path.setAttribute('d', pathData);
}

function confirmTarget(e) {
    if (!isTargeting || !targetingCard) return; // Adicionar verificação extra
    
    // Prevenir que o clique inicial conte como confirmação
    if (e.timeStamp - (targetingCard.targetStartTime || 0) < 100) {
        return;
    }
    
    // Verificar se clicou no inimigo
    const enemyArea = document.querySelector('.enemy-area');
    const enemyRect = enemyArea.getBoundingClientRect();
    
    if (e.clientX > enemyRect.left && e.clientX < enemyRect.right &&
        e.clientY > enemyRect.top && e.clientY < enemyRect.bottom) {
        
        // Acertou o inimigo - jogar a carta
        playCard(targetingCard);
    } else {
        // Errou - voltar carta para a mão
        targetingCard.classList.remove('targeting');
        returnCardToHand(targetingCard);
    }
    
    endTargeting();
}

function cancelTargeting(e) {
    if (!isTargeting) return;
    
    if (e.key === 'Escape') {
        targetingCard.classList.remove('targeting');
        
        // Resetar a posição para valores originais da mão
        targetingCard.style.transition = 'all 0.3s ease-out';
        targetingCard.style.top = 'auto';
        targetingCard.style.bottom = '20px';
        
        // Reorganizar a mão para garantir posições corretas
        setTimeout(() => {
            reorganizeHand();
        }, 50);
        
        endTargeting();
    }
}

// Limpar targeting
function endTargeting() {
    isTargeting = false;
    
    // Esconder elementos
    document.getElementById('targeting-line').style.display = 'none';
    document.getElementById('targeting-cursor').style.display = 'none';
    
    // Remover classe do body
    document.body.classList.remove('targeting-mode');
    
    // Remover listeners
    document.removeEventListener('mousemove', updateTargeting);
    document.removeEventListener('click', confirmTarget);
    document.removeEventListener('keydown', cancelTargeting);
    
    targetingCard = null;
}

// ===== FUNÇÕES DE GAMEPLAY =====
function returnCardToHand(cardElement) {
    // Remover classes que podem interferir
    cardElement.classList.remove('targeting');
    cardElement.classList.remove('dragging');
    
    // Resetar para usar bottom em vez de top
    cardElement.style.transition = 'all 0.3s ease-out';
    cardElement.style.top = 'auto';
    cardElement.style.bottom = '20px';
    
    // Reorganizar todas as cartas da mão
    setTimeout(() => {
        reorganizeHand();
    }, 50);
}

function playCard(cardElement) {
    const cardData = cardElement.cardData;
    
    // Verificar se tem energia suficiente
    if (!energyManager.canPlayCard(cardData.cost)) {
        // Não tem energia - mostrar feedback
        showMessage('Not enough energy!', 'error');
        returnCardToHand(cardElement);
        return;
    }
    
    console.log(`Jogando carta: ${cardData.name}`);
    
    // Gastar energia
    energyManager.spendEnergy(cardData.cost);
    
    // Remover carta do array
    const index = hand.findIndex(c => c === cardData);
    if (index > -1) {
        hand.splice(index, 1);
        
        // Aplicar efeito da carta IMEDIATAMENTE
        applyCardEffect(cardData);
        
        // Animar direto para o descarte da posição atual
        const discardIcon = document.querySelector('.discard-pile');
        const discardRect = discardIcon.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();
        
        const deltaX = discardRect.left + discardRect.width / 2 - cardRect.left - cardRect.width / 2;
        const deltaY = discardRect.top + discardRect.height / 2 - cardRect.top - cardRect.height / 2;
        
        cardElement.style.transition = 'all 0.4s ease-in';
        cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.1) rotate(360deg)`;
        cardElement.style.opacity = '0';
        cardElement.style.zIndex = '1000';
        
        setTimeout(() => {
            cardElement.remove();
            reorganizeHand();
        }, 400);
        
        // Adicionar ao descarte
        discardCard(cardData);
    }
}

// ===== FUNÇÕES DE UI/FEEDBACK =====
function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 2000);
}

function applyCardEffect(card) {
    if (card.type === 'damage') {
        // Adicionar animação de ataque do player
        const playerArea = document.querySelector('.player-area');
        playerArea.classList.add('attacking');
        setTimeout(() => playerArea.classList.remove('attacking'), 500);
        
        // Pequeno delay para sincronizar com a animação
        setTimeout(() => {
            // Calcular dano real ANTES de aplicar
            let actualDamage = card.value;
            if (enemy.block > 0) {
                actualDamage = Math.max(0, card.value - enemy.block);
            }
            
            enemy.takeDamage(card.value);
            
            // Mostrar apenas o dano real aplicado
            if (actualDamage > 0) {
                showDamageNumber(actualDamage);
            } else {
                // Se todo dano foi bloqueado, mostrar "Blocked!"
                showBlockedEnemyNumber();
            }
        }, 150);
        
        // Verificar vitória
        if (enemy.currentHp <= 0) {
            setTimeout(() => {
                showMessage('Victory! 🎉', 'victory');
                disableGame();
            }, 500);
        }
    } else if (card.type === 'block') {
        player.addBlock(card.value);
        showBlockNumber(card.value);
    }
}

function showBlockedEnemyNumber() {
    const enemyArea = document.querySelector('.enemy-area');
    const blockedDiv = document.createElement('div');
    blockedDiv.className = 'blocked-number';
    blockedDiv.textContent = 'Blocked!';
    enemyArea.appendChild(blockedDiv);
    
    setTimeout(() => blockedDiv.remove(), 1000);
}

function showDamageNumber(damage) {
    const enemyArea = document.querySelector('.enemy-area');
    const damageDiv = document.createElement('div');
    damageDiv.className = 'damage-number';
    damageDiv.textContent = `-${damage}`;
    enemyArea.appendChild(damageDiv);
    
    setTimeout(() => damageDiv.remove(), 1000);
}

// ===== SISTEMA DE DECK =====
function initializeDeck() {
    // Deck inicial: exatamente 10 cartas
    deck = [
        // 5 Strikes básicos (6 de dano, custo 1)
        ...Array(5).fill().map(() => new Card('Strike', 1, 'damage', 6, 'Deal 6 damage')),
        // 4 Defends (5 de armadura, custo 1)
        ...Array(4).fill().map(() => new Card('Defend', 1, 'block', 5, 'Gain 5 block')),
        // 1 Bash (8 de dano, custo 2)
        new Card('Bash', 2, 'damage', 8, 'Deal 8 damage')
    ];
    
    // Embaralhar deck
    shuffleDeck();
    updateDeckCounters();
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function updateDeckCounters() {
    const deckCount = document.getElementById('deck-count');
    const discardCount = document.getElementById('discard-count');
    
    if (deckCount) {
        deckCount.textContent = deck.length;
        // Adicionar animação
        deckCount.classList.add('animated');
        setTimeout(() => deckCount.classList.remove('animated'), 300);
    }
    
    if (discardCount) {
        discardCount.textContent = discardPile.length;
        // Adicionar animação
        discardCount.classList.add('animated');
        setTimeout(() => discardCount.classList.remove('animated'), 300);
    }
}

function drawCard() {
    // Se o deck estiver vazio, reembaralhar a pilha de descarte
    if (deck.length === 0) {
        if (discardPile.length === 0) {
            console.log("No cards to draw!");
            showMessage('No cards left!', 'error');
            return null;
        }
        
        // Mover descarte para deck e embaralhar
        deck = [...discardPile];
        discardPile = [];
        shuffleDeck();
        showMessage('Deck reshuffled!', 'info');
        
        // Animar o reshuffle
        animateReshuffle();
    }
    
    // Animar a pilha quando compra
    const deckPile = document.querySelector('.deck-pile');
    deckPile.style.transform = 'scale(0.95)';
    setTimeout(() => {
        deckPile.style.transform = '';
    }, 200);
    
    // Comprar carta do topo
    const card = deck.pop();
    updateDeckCounters();
    return card;
}

function discardCard(cardData) {
    discardPile.push(cardData);
    updateDeckCounters();
}


function discardHand() {
    // Guardar referência das cartas antes de limpar o array
    const cardsToDiscard = [...hand];
    const handElement = document.getElementById('hand');
    const cards = handElement.querySelectorAll('.card');
    
    // Limpar array de mão imediatamente
    hand = [];
    
    // Animar cartas indo para o descarte
    cards.forEach((card, index) => {
        setTimeout(() => {
            const discardIcon = document.querySelector('.discard-pile');
            const discardRect = discardIcon.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            
            const deltaX = discardRect.left + discardRect.width / 2 - cardRect.left - cardRect.width / 2;
            const deltaY = discardRect.top + discardRect.height / 2 - cardRect.top - cardRect.height / 2;
            
            card.style.transition = 'all 0.4s ease-in';
            card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.1) rotate(-360deg)`;
            card.style.opacity = '0';
            card.style.zIndex = '100';
            
            setTimeout(() => {
                card.remove();
            }, 400);
        }, index * 50); // Pequeno delay entre cada carta
    });
    
    // Adicionar cartas ao descarte após um delay
    setTimeout(() => {
        cardsToDiscard.forEach(cardData => discardCard(cardData));
    }, 200);
}

function animateReshuffle() {
    const deckPile = document.querySelector('.deck-pile');
    const discardPileElement = document.querySelector('.discard-pile');
    
    // Animação visual de cartas movendo do descarte para o deck
    discardPileElement.style.transform = 'scale(0.8)';
    deckPile.style.transform = 'scale(1.2)';
    
    setTimeout(() => {
        discardPileElement.style.transform = '';
        deckPile.style.transform = '';
    }, 300);
}

function drawNewHand() {
    // Esperar as cartas antigas saírem completamente
    setTimeout(() => {
        // Limpar array de mão primeiro
        const cardsToDrawCount = 5;
        const newCards = [];
        
        // Comprar todas as cartas primeiro
        for (let i = 0; i < cardsToDrawCount; i++) {
            const card = drawCard();
            if (card) {
                newCards.push(card);
            }
        }
        
        // Agora adicionar todas com animação
        newCards.forEach((card, index) => {
            addCardToHand(card, index);
        });
        
        // Atualizar estados após todas as animações
        setTimeout(() => {
            energyManager.updateCardStates();
        }, 600);
        
    }, 500); // Esperar cartas antigas saírem
}

// ===== SISTEMA DE TURNOS =====
function endTurn() {
    console.log('Ending turn', turnCount);
    
    // Desabilitar botão temporariamente
    const endTurnBtn = document.getElementById('end-turn-btn');
    endTurnBtn.disabled = true;
    
    // RESETAR BLOCK DO INIMIGO ANTES DA AÇÃO DELE
    enemy.startNewTurn();
    
    // Executar ação do inimigo
    setTimeout(() => {
        const enemyAction = enemy.executeAction();

        if (enemyAction.type === 'attack') {
    // REMOVIDO: showMessage(`Enemy attacks for ${enemyAction.value}!`, 'damage');
    
    // Adicionar animação de ataque do inimigo
    const enemyArea = document.querySelector('.enemy-area');
    enemyArea.classList.add('attacking');
    setTimeout(() => enemyArea.classList.remove('attacking'), 500);
    
    // Delay para sincronizar dano com animação
    setTimeout(() => {
        player.takeDamage(enemyAction.value);
    }, 150);
} else {
    // REMOVIDO: showMessage(`Enemy defends for ${enemyAction.value}!`, 'block');
    enemy.addBlock(enemyAction.value);
}
        
        if (enemyAction.type === 'attack') {
            showMessage(`Enemy attacks for ${enemyAction.value}!`, 'damage');
            
            // Adicionar animação de ataque do inimigo
            const enemyArea = document.querySelector('.enemy-area');
            enemyArea.classList.add('attacking');
            setTimeout(() => enemyArea.classList.remove('attacking'), 500);
            
            // Delay para sincronizar dano com animação
            setTimeout(() => {
                player.takeDamage(enemyAction.value);
            }, 150);
        } else {
            // Inimigo ganha block NOVO
            showMessage(`Enemy defends for ${enemyAction.value}!`, 'block');
            enemy.addBlock(enemyAction.value);
        }
        
        // Verificar se jogador morreu
        if (player.currentHp <= 0) {
            disableGame();
            return;
        }
        
        // Iniciar novo turno
        setTimeout(() => {
            startNewTurn();
        }, 1000);
        
    }, 500);
}

function startNewTurn() {
    turnCount++;
    console.log('Starting turn', turnCount);
    
    // Reset do jogador (mantém)
    player.startNewTurn();
    
    // NÃO RESETAR O BLOCK DO INIMIGO AQUI
    // enemy.startNewTurn(); // REMOVER ESTA LINHA
    
    // Recarregar energia
    energyManager.refillEnergy();
    
    // Descartar mão antiga e comprar nova
    discardHand();
    drawNewHand();
    
    // Reabilitar botão
    document.getElementById('end-turn-btn').disabled = false;
    
    showMessage(`Turn ${turnCount}`, 'info');
}

function disableGame() {
    document.getElementById('end-turn-btn').disabled = true;
    // Remover event listeners se necessário
}

// ===== EVENT LISTENERS =====
document.addEventListener('mousedown', iniciarDrag);
document.addEventListener('mousemove', arrastar);
document.addEventListener('mouseup', soltarCarta);

// ===== INICIALIZAÇÃO =====
window.onload = () => {
    // Criar entidades do jogo
    energyManager = new EnergyManager(3);
    enemy = new Enemy(50, 'Slime');
    player = new Player(80);
    
    // Inicializar deck com 10 cartas específicas
    initializeDeck();
    
    // Comprar mão inicial de 5 cartas COM ANIMAÇÃO
    const initialCards = [];
    for (let i = 0; i < 5; i++) {
        const card = drawCard();
        if (card) {
            initialCards.push(card);
        }
    }
    
    // Adicionar cartas com animação
    initialCards.forEach((card, index) => {
        addCardToHand(card, index);
    });
    
    // Atualizar estados após as animações
    setTimeout(() => {
        energyManager.updateCardStates();
    }, 600);
    
    // Adicionar listener ao botão End Turn
    document.getElementById('end-turn-btn').addEventListener('click', endTurn);
    
    // Adicionar tooltips aos clicar nas pilhas
    document.querySelector('.deck-pile').addEventListener('click', () => {
        showMessage(`${deck.length} cards in draw pile`, 'info');
    });
    
    document.querySelector('.discard-pile').addEventListener('click', () => {
        if (discardPile.length > 0) {
            const cardNames = discardPile.map(c => c.name).join(', ');
            showMessage(`Discard: ${cardNames}`, 'info');
        } else {
            showMessage('Discard pile is empty', 'info');
        }
    });
};


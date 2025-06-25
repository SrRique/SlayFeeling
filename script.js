
class Card {
    constructor(name, cost, type, value, description) {
        this.name = name;
        this.cost = cost;
        this.type = type;  
        this.value = value;
        this.description = description;
    }

    
    createElement() {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    
    
    let emoji = '';
    if (this.name === 'Strike') {
        emoji = '🗡️';
    } else if (this.name === 'Bash') {
        emoji = '🪓';
    } else if (this.name === 'Defend') {
        emoji = '🛡️';
    }
    
    cardDiv.innerHTML = `
        <div class="cost">${this.cost}</div>
        <div class="card-emoji">${emoji}</div>
        <div class="name">${this.name}</div>
        <div class="effect">${this.description}</div>
    `;
    
    
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
        this.block = 0; 
        this.nextAction = null;
        this.generateNextAction();
    }
    
    generateNextAction() {
        
        const rand = Math.random();
        if (rand < 0.7) {
            this.nextAction = {
                type: 'attack',
                value: Math.floor(Math.random() * 5) + 5 
            };
        } else {
            this.nextAction = {
                type: 'defend',
                value: Math.floor(Math.random() * 3) + 3 
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
    
    let actualDamage = damage;
    
    
    if (this.block > 0) {
        const blocked = Math.min(this.block, damage);
        this.block -= blocked;
        actualDamage -= blocked;
        
        
        
        
        
    }
    
    
    if (actualDamage > 0) {
        this.currentHp = Math.max(0, this.currentHp - actualDamage);
    }
    
    
    this.updateDisplay();
    
    
    if (actualDamage > 0) {
        const enemyArea = document.querySelector('.enemy-area');
        enemyArea.classList.add('shake');
        setTimeout(() => enemyArea.classList.remove('shake'), 500);
    }
}
    
    
    addBlock(amount) {
        this.block += amount;
        this.updateDisplay();
    }
    
    
    startNewTurn() {
        this.block = 0; 
        this.updateDisplay();
    }
    
    
    updateDisplay() {
        
        document.getElementById('enemy-hp').textContent = this.currentHp;
        
        
        const healthPercentage = (this.currentHp / this.maxHp) * 100;
        document.getElementById('enemy-health-fill').style.width = healthPercentage + '%';
        
        
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
        this.generateNextAction(); 
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
    
    if (this.block > 0) {
        const blocked = Math.min(this.block, damage);
        this.block -= blocked;
        damage -= blocked;
    }
    
    
    if (damage > 0) {
        this.currentHp = Math.max(0, this.currentHp - damage);
        
        
        showPlayerDamageNumber(damage); 
        
        
        const playerArea = document.querySelector('.player-area');
        playerArea.classList.add('shake');
        setTimeout(() => playerArea.classList.remove('shake'), 500);
    }
    
    this.updateDisplay();
    
    
    if (this.currentHp <= 0) {
        setTimeout(() => {
            showMessage('Defeat... 💀', 'error');
            disableGame();
        }, 500);
    }
}

    
    startNewTurn() {
        this.block = 0; 
        this.updateDisplay();
    }
    
   updateDisplay() {
    
    document.getElementById('player-hp').textContent = this.currentHp;
    
    
    const healthPercentage = (this.currentHp / this.maxHp) * 100;
    document.getElementById('player-health-fill').style.width = healthPercentage + '%';
    
    
    const blockDisplay = document.getElementById('player-block-display');
    if (this.block > 0) {
        blockDisplay.classList.add('show');
        document.getElementById('player-block').textContent = this.block;
    } else {
        blockDisplay.classList.remove('show');
    }
}
}


function showPlayerDamageNumber(damage) {
    const playerArea = document.querySelector('.player-area');
    const damageDiv = document.createElement('div');
    damageDiv.className = 'damage-number';
    damageDiv.textContent = `-${damage}`;
    playerArea.appendChild(damageDiv);
    
    setTimeout(() => damageDiv.remove(), 1000);
}


function showBlockNumber(amount) {
    const playerArea = document.querySelector('.player-area');
    const blockDiv = document.createElement('div');
    blockDiv.className = 'block-number';
    blockDiv.textContent = `+${amount}`;
    playerArea.appendChild(blockDiv);
    
    setTimeout(() => blockDiv.remove(), 1000);
}


function showBlockedNumber(blocked) {
    const playerArea = document.querySelector('.player-area');
    const blockedDiv = document.createElement('div');
    blockedDiv.className = 'blocked-number';
    blockedDiv.textContent = `Blocked ${blocked}`;
    playerArea.appendChild(blockedDiv);
    
    setTimeout(() => blockedDiv.remove(), 1000);
}


let deck = []; 
let discardPile = []; 
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


function addCardToHand(card, index = 0) {
    hand.push(card);
    const cardElement = card.createElement();
    
    
    const deckPile = document.querySelector('.deck-pile');
    const deckRect = deckPile.getBoundingClientRect();
    
    
    const handWidth = window.innerWidth;
    const spacing = Math.min(150, handWidth / 5); 
    const totalWidth = 5 * spacing;
    const startX = (handWidth - totalWidth) / 2;
    const finalLeft = startX + (index * spacing);
    const finalBottom = 20;
    
    
    cardElement.style.position = 'absolute';
    cardElement.style.left = (deckRect.left + deckRect.width / 2 - 60) + 'px';
    cardElement.style.top = (deckRect.top + deckRect.height / 2 - 80) + 'px';
    cardElement.style.transform = 'scale(0.1)';
    cardElement.style.opacity = '0';
    cardElement.style.zIndex = '100';
    cardElement.style.transition = 'none';
    
    document.getElementById('hand').appendChild(cardElement);
    
    
    cardElement.offsetHeight;
    
    
    setTimeout(() => {
        cardElement.style.transition = 'all 0.4s ease-out';
        cardElement.style.left = finalLeft + 'px';
        cardElement.style.top = 'auto';
        cardElement.style.bottom = finalBottom + 'px';
        cardElement.style.transform = `scale(1) rotate(${(index - 2) * 3}deg)`; 
        cardElement.style.opacity = '1';
        
        
        setTimeout(() => {
            cardElement.style.transition = '';
            cardElement.style.zIndex = index;
        }, 400);
    }, 50 + (index * 50)); 
}

function reorganizeHand() {
    const cards = document.querySelectorAll('.hand .card');
    const handWidth = window.innerWidth;
    const cardWidth = 120;
    const spacing = Math.min(150, handWidth / cards.length);
    const totalWidth = cards.length * spacing;
    const startX = (handWidth - totalWidth) / 2;
    
    cards.forEach((card, index) => {
        
        card.style.transition = 'none';
        card.style.transform = '';
        
        
        card.offsetHeight;
        
        
        card.style.transition = 'all 0.3s ease-out';
        
        
        card.style.left = `${startX + (index * spacing)}px`;
        card.style.bottom = '20px';
        card.style.top = 'auto'; 
        
        
        const rotation = (index - (cards.length - 1) / 2) * 3;
        card.style.transform = `rotate(${rotation}deg)`;
        
        
        card.style.zIndex = index;
        
        
        setTimeout(() => {
            card.style.transition = '';
        }, 300);
    });
}


function iniciarDrag(e) {
    const card = e.target.closest('.card');
    if (!card) return;
    
    
    if (card.classList.contains('unplayable')) {
        showMessage('Not enough energy!', 'error');
        return;
    }
    
    cartaArrastando = card;
    const rect = card.getBoundingClientRect();
    
    
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    
    cartaArrastando.startX = rect.left;
    cartaArrastando.startY = rect.top;
    
    
    card.classList.add('dragging');
    document.body.classList.add('dragging-active'); 
    
    
    card.style.zIndex = 1000;
}

function arrastar(e) {
    if (!cartaArrastando || isTargeting) return;
    
    
    const deltaX = e.clientX - offsetX - cartaArrastando.startX;
    const deltaY = e.clientY - offsetY - cartaArrastando.startY;
    
    
    cartaArrastando.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(-5deg)`;
    
    
    const manipulationArea = window.innerHeight - 250; 
    
    if (e.clientY < manipulationArea) {
        const cardData = cartaArrastando.cardData;
        
        
        if (cardData.type === 'damage') {
            
            console.log('Iniciando targeting automaticamente');
            startTargeting(cartaArrastando, e);
            
            
            cartaArrastando = null;
            document.body.style.cursor = 'default';
        } 
        
        
        else {
            document.body.style.cursor = 'crosshair';
        }
    } else {
        
        document.body.style.cursor = 'grab';
    }
}

function soltarCarta(e) {
    if (!cartaArrastando) return;
    
    const manipulationArea = window.innerHeight - 250;
    const cardData = cartaArrastando.cardData;
    
    
    if (e.clientY < manipulationArea && cardData.type === 'block') {
        console.log('Aplicando defesa ao soltar');
        playCard(cartaArrastando);
    } else {
        
        console.log('Voltando carta para a mão');
        cartaArrastando.classList.remove('dragging');
        returnCardToHand(cartaArrastando);
    }
    
    
    cartaArrastando.style.zIndex = '';
    cartaArrastando = null;
    document.body.style.cursor = 'default';
}

function startTargeting(card, e) {
    isTargeting = true;
    targetingCard = card;
    targetingCard.targetStartTime = e.timeStamp;
    
    
    card.classList.add('targeting');
    card.classList.remove('dragging');
    
    
    const cards = document.querySelectorAll('.hand .card');
    let leftMost = Infinity;
    let rightMost = -Infinity;
    
    cards.forEach(c => {
        const rect = c.getBoundingClientRect();
        leftMost = Math.min(leftMost, rect.left);
        rightMost = Math.max(rightMost, rect.right);
    });
    
    
    const handCenterX = (leftMost + rightMost) / 2 - 60; 
    
    
    const baseBottom = parseInt(window.getComputedStyle(card).bottom) || 20;
    const elevatedBottom = baseBottom + 100; 
    
    
    const windowHeight = window.innerHeight;
    const cardHeight = 160; 
    const topPosition = windowHeight - elevatedBottom - cardHeight;
    
    
    card.style.transition = 'all 0.3s ease-out';
    card.style.left = handCenterX + 'px';
    card.style.top = topPosition + 'px';
    card.style.bottom = 'auto';
    card.style.transform = 'scale(1.3) rotate(0deg)';
    card.style.zIndex = '1000';
    
    
    setTimeout(() => {
        
        const rect = card.getBoundingClientRect();
        cardStartPosition = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        
        
        document.getElementById('targeting-line').style.display = 'block';
        document.getElementById('targeting-cursor').style.display = 'block';
        
        
        document.addEventListener('mousemove', updateTargeting);
        document.addEventListener('click', confirmTarget);
        document.addEventListener('keydown', cancelTargeting);
        
        
        document.body.classList.add('targeting-mode');
        
        updateTargeting(e);
    }, 300); 
}

function updateTargeting(e) {
    if (!isTargeting) return;
    
    
    const cursor = document.getElementById('targeting-cursor');
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    
    const svg = document.querySelector('#targeting-line svg');
    const path = document.getElementById('targeting-path');
    
    
    const startX = cardStartPosition.x;
    const startY = cardStartPosition.y;
    const endX = e.clientX;
    const endY = e.clientY;
    
    
    const controlX = (startX + endX) / 2;
    const controlY = Math.min(startY, endY) - 100; 
    
    
    const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
    path.setAttribute('d', pathData);
}

function confirmTarget(e) {
    if (!isTargeting || !targetingCard) return; 
    
    
    if (e.timeStamp - (targetingCard.targetStartTime || 0) < 100) {
        return;
    }
    
    
    const enemyArea = document.querySelector('.enemy-area');
    const enemyRect = enemyArea.getBoundingClientRect();
    
    if (e.clientX > enemyRect.left && e.clientX < enemyRect.right &&
        e.clientY > enemyRect.top && e.clientY < enemyRect.bottom) {
        
        
        playCard(targetingCard);
    } else {
        
        targetingCard.classList.remove('targeting');
        returnCardToHand(targetingCard);
    }
    
    endTargeting();
}

function cancelTargeting(e) {
    if (!isTargeting) return;
    
    if (e.key === 'Escape') {
        targetingCard.classList.remove('targeting');
        
        
        targetingCard.style.transition = 'all 0.3s ease-out';
        targetingCard.style.top = 'auto';
        targetingCard.style.bottom = '20px';
        
        
        setTimeout(() => {
            reorganizeHand();
        }, 50);
        
        endTargeting();
    }
}


function endTargeting() {
    isTargeting = false;
    
    
    document.getElementById('targeting-line').style.display = 'none';
    document.getElementById('targeting-cursor').style.display = 'none';
    
    
    document.body.classList.remove('targeting-mode');
    
    
    document.removeEventListener('mousemove', updateTargeting);
    document.removeEventListener('click', confirmTarget);
    document.removeEventListener('keydown', cancelTargeting);
    
    targetingCard = null;
}


function returnCardToHand(cardElement) {
    
    cardElement.classList.remove('targeting');
    cardElement.classList.remove('dragging');
    
    
    cardElement.style.transition = 'all 0.3s ease-out';
    cardElement.style.top = 'auto';
    cardElement.style.bottom = '20px';
    
    
    setTimeout(() => {
        reorganizeHand();
    }, 50);
}

function playCard(cardElement) {
    const cardData = cardElement.cardData;
    
    
    if (!energyManager.canPlayCard(cardData.cost)) {
        
        showMessage('Not enough energy!', 'error');
        returnCardToHand(cardElement);
        return;
    }
    
    console.log(`Jogando carta: ${cardData.name}`);
    
    
    energyManager.spendEnergy(cardData.cost);
    
    
    const index = hand.findIndex(c => c === cardData);
    if (index > -1) {
        hand.splice(index, 1);
        
        
        applyCardEffect(cardData);
        
        
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
        
        
        discardCard(cardData);
    }
}


function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 2000);
}

function applyCardEffect(card) {
    if (card.type === 'damage') {
        
        const playerArea = document.querySelector('.player-area');
        playerArea.classList.add('attacking');
        setTimeout(() => playerArea.classList.remove('attacking'), 500);
        
        
        setTimeout(() => {
            enemy.takeDamage(card.value);
            showDamageNumber(card.value);
            
            
            setTimeout(() => {
                if (enemy.currentHp <= 0) {
                    showMessage('Victory! 🎉', 'victory');
                    disableGame();
                }
            }, 100); 
            
        }, 150);
        
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


function initializeDeck() {
    
    deck = [
        
        ...Array(5).fill().map(() => new Card('Strike', 1, 'damage', 6, 'Deal 6 damage')),

        ...Array(4).fill().map(() => new Card('Defend', 1, 'block', 5, 'Gain 5 block')),
        
        new Card('Bash', 2, 'damage', 15, 'Deal 15 damage')
    ];
        
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
        
        deckCount.classList.add('animated');
        setTimeout(() => deckCount.classList.remove('animated'), 300);
    }
    
    if (discardCount) {
        discardCount.textContent = discardPile.length;
        
        discardCount.classList.add('animated');
        setTimeout(() => discardCount.classList.remove('animated'), 300);
    }
}

function drawCard() {
    
    if (deck.length === 0) {
        if (discardPile.length === 0) {
            console.log("No cards to draw!");
            showMessage('No cards left!', 'error');
            return null;
        }
        
        
        deck = [...discardPile];
        discardPile = [];
        shuffleDeck();
        showMessage('Deck reshuffled!', 'info');
        
        
        animateReshuffle();
    }
    
    
    const deckPile = document.querySelector('.deck-pile');
    deckPile.style.transform = 'scale(0.95)';
    setTimeout(() => {
        deckPile.style.transform = '';
    }, 200);
    
    
    const card = deck.pop();
    updateDeckCounters();
    return card;
}

function discardCard(cardData) {
    discardPile.push(cardData);
    updateDeckCounters();
}


function discardHand() {
    
    const cardsToDiscard = [...hand];
    const handElement = document.getElementById('hand');
    const cards = handElement.querySelectorAll('.card');
    
    
    hand = [];
    
    
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
        }, index * 50); 
    });
    
    
    setTimeout(() => {
        cardsToDiscard.forEach(cardData => discardCard(cardData));
    }, 200);
}

function animateReshuffle() {
    const deckPile = document.querySelector('.deck-pile');
    const discardPileElement = document.querySelector('.discard-pile');
    
    
    discardPileElement.style.transform = 'scale(0.8)';
    deckPile.style.transform = 'scale(1.2)';
    
    setTimeout(() => {
        discardPileElement.style.transform = '';
        deckPile.style.transform = '';
    }, 300);
}

function drawNewHand() {
    
    setTimeout(() => {
        
        const cardsToDrawCount = 5;
        const newCards = [];
        
        
        for (let i = 0; i < cardsToDrawCount; i++) {
            const card = drawCard();
            if (card) {
                newCards.push(card);
            }
        }
        
        
        newCards.forEach((card, index) => {
            addCardToHand(card, index);
        });
        
        
        setTimeout(() => {
            energyManager.updateCardStates();
        }, 600);
        
    }, 500); 
}


function endTurn() {
    console.log('Ending turn', turnCount);
    
    
    const endTurnBtn = document.getElementById('end-turn-btn');
    endTurnBtn.disabled = true;
    
    
    enemy.startNewTurn();
    
    
    setTimeout(() => {
        const enemyAction = enemy.executeAction();
        
        if (enemyAction.type === 'attack') {
            
            
            
            
            const enemyArea = document.querySelector('.enemy-area');
            enemyArea.classList.add('attacking');
            setTimeout(() => enemyArea.classList.remove('attacking'), 500);
            
            
            setTimeout(() => {
                player.takeDamage(enemyAction.value);
            }, 150);
        } else {
            
            
            enemy.addBlock(enemyAction.value);
        }
        
        
        if (player.currentHp <= 0) {
            disableGame();
            return;
        }
        
        
        setTimeout(() => {
            startNewTurn();
        }, 1000);
        
    }, 500);
}

function startNewTurn() {
    turnCount++;
    console.log('Starting turn', turnCount);
    
    
    player.startNewTurn();
    
    
    
    
    
    energyManager.refillEnergy();
    
    
    discardHand();
    drawNewHand();
    
    
    document.getElementById('end-turn-btn').disabled = false;
    
    showMessage(`Turn ${turnCount}`, 'info');
}

function disableGame() {
    document.getElementById('end-turn-btn').disabled = true;
    
}


document.addEventListener('mousedown', iniciarDrag);
document.addEventListener('mousemove', arrastar);
document.addEventListener('mouseup', soltarCarta);


window.onload = () => {
    
    energyManager = new EnergyManager(3);
    enemy = new Enemy(50, 'Slime');
    player = new Player(80);
    
    
    initializeDeck();

    


const starsContainer = document.querySelector('.stars');
if (starsContainer) {
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}
    
    
    const initialCards = [];
    for (let i = 0; i < 5; i++) {
        const card = drawCard();
        if (card) {
            initialCards.push(card);
        }
    }
    
    
    initialCards.forEach((card, index) => {
        addCardToHand(card, index);
    });
    
    
    setTimeout(() => {
        energyManager.updateCardStates();
    }, 600);
    
    
    document.getElementById('end-turn-btn').addEventListener('click', endTurn);
    
    
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
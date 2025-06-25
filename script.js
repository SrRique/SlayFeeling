
// Card class representing individual cards in the game
class Card {
    constructor(name, cost, type, value, description) {
        this.name = name;           // Card name (Strike, Defend, Bash)
        this.cost = cost;           // Energy cost to play
        this.type = type;           // 'damage' or 'block'
        this.value = value;         // Damage dealt or block gained
        this.description = description; // Card effect text
    }

    // Creates and returns the DOM element for this card
    createElement() {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        
        // Assign emoji based on card name
        let emoji = '';
        if (this.name === 'Strike') {
            emoji = '🗡️';
        } else if (this.name === 'Bash') {
            emoji = '🪓';
        } else if (this.name === 'Defend') {
            emoji = '🛡️';
        }
        
        // Build card HTML structure
        cardDiv.innerHTML = `
            <div class="cost">${this.cost}</div>
            <div class="card-emoji">${emoji}</div>
            <div class="name">${this.name}</div>
            <div class="effect">${this.description}</div>
        `;
        
        // Store reference to card data on the DOM element
        cardDiv.cardData = this;
        
        return cardDiv;
    }
}

// Manages energy system for playing cards
class EnergyManager {
    constructor(maxEnergy) {
        this.current = maxEnergy;   // Current available energy
        this.max = maxEnergy;       // Maximum energy per turn
        this.updateDisplay();
    }
    
    // Check if player has enough energy to play a card
    canPlayCard(cost) {
        return this.current >= cost;
    }
    
    // Deduct energy when playing a card
    spendEnergy(cost) {
        this.current = Math.max(0, this.current - cost);
        this.updateDisplay();
    }
    
    // Restore energy to max at start of turn
    refillEnergy() {
        this.current = this.max;
        this.updateDisplay();
    }
    
    // Update UI to show current energy
    updateDisplay() {
        document.getElementById('current-energy').textContent = this.current;
        
        // Update visual state of all cards
        this.updateCardStates();
    }
    
    // Update card appearance based on playability
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

// Enemy class managing enemy stats and AI
class Enemy {
    constructor(maxHp, name = 'Slime') {
        this.name = name;
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.block = 0;             // Current armor/block value
        this.nextAction = null;     // Intent for next turn
        this.generateNextAction();
    }
    
    // Generate enemy's next action (70% attack, 30% defend)
    generateNextAction() {
        const rand = Math.random();
        if (rand < 0.7) {
            // Attack action: 5-9 damage
            this.nextAction = {
                type: 'attack',
                value: Math.floor(Math.random() * 5) + 5
            };
        } else {
            // Defend action: 3-5 block
            this.nextAction = {
                type: 'defend',
                value: Math.floor(Math.random() * 3) + 3
            };
        }
        this.updateIntentDisplay();
    }
    
    // Update the visual intent indicator above enemy
    updateIntentDisplay() {
        let intentDiv = document.querySelector('.enemy-intent');
        if (!intentDiv) {
            intentDiv = document.createElement('div');
            intentDiv.className = 'enemy-intent';
            document.querySelector('.enemy-area').appendChild(intentDiv);
        }
        
        // Show attack or defend intent with appropriate styling
        if (this.nextAction.type === 'attack') {
            intentDiv.innerHTML = `⚔️ ${this.nextAction.value}`;
            intentDiv.style.background = '#e94560';
        } else {
            intentDiv.innerHTML = `🛡️ ${this.nextAction.value}`;
            intentDiv.style.background = '#4dabf7';
        }
    }
    
    // Process incoming damage (reduced by block)
    takeDamage(damage) {
        let actualDamage = damage;
        
        // Apply block reduction
        if (this.block > 0) {
            const blocked = Math.min(this.block, damage);
            this.block -= blocked;
            actualDamage -= blocked;
        }
        
        // Apply remaining damage to HP
        if (actualDamage > 0) {
            this.currentHp = Math.max(0, this.currentHp - actualDamage);
        }
        
        // Update visual displays
        this.updateDisplay();
        
        // Trigger shake animation if damage was dealt
        if (actualDamage > 0) {
            const enemyArea = document.querySelector('.enemy-area');
            enemyArea.classList.add('shake');
            setTimeout(() => enemyArea.classList.remove('shake'), 500);
        }
    }
    
    // Add block/armor to enemy
    addBlock(amount) {
        this.block += amount;
        this.updateDisplay();
    }
    
    // Reset block at start of new turn
    startNewTurn() {
        this.block = 0;
        this.updateDisplay();
    }
    
    // Update all visual elements for enemy
    updateDisplay() {
        // Update HP text
        document.getElementById('enemy-hp').textContent = this.currentHp;
        
        // Update health bar width
        const healthPercentage = (this.currentHp / this.maxHp) * 100;
        document.getElementById('enemy-health-fill').style.width = healthPercentage + '%';
        
        // Show/hide block display
        const blockDisplay = document.getElementById('enemy-block-display');
        if (this.block > 0) {
            blockDisplay.classList.add('show');
            document.getElementById('enemy-block').textContent = this.block;
        } else {
            blockDisplay.classList.remove('show');
        }
    }
    
    // Execute the planned action and generate next one
    executeAction() {
        const action = this.nextAction;
        this.generateNextAction(); // Plan next action
        return action;
    }
}

// Player class managing player stats
class Player {
    constructor(maxHp) {
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.block = 0;
        this.updateDisplay();
    }
    
    // Add block/armor to player
    addBlock(amount) {
        this.block += amount;
        this.updateDisplay();
    }
    
    // Process incoming damage (reduced by block)
    takeDamage(damage) {
        // Apply block reduction
        if (this.block > 0) {
            const blocked = Math.min(this.block, damage);
            this.block -= blocked;
            damage -= blocked;
        }
        
        // Apply remaining damage to HP
        if (damage > 0) {
            this.currentHp = Math.max(0, this.currentHp - damage);
            
            // Show floating damage number
            showPlayerDamageNumber(damage);
            
            // Trigger shake animation
            const playerArea = document.querySelector('.player-area');
            playerArea.classList.add('shake');
            setTimeout(() => playerArea.classList.remove('shake'), 500);
        }
        
        this.updateDisplay();
        
        // Check for defeat
        if (this.currentHp <= 0) {
            setTimeout(() => {
                showMessage('Defeat... 💀', 'error');
                disableGame();
            }, 500);
        }
    }
    
    // Reset block at start of new turn
    startNewTurn() {
        this.block = 0;
        this.updateDisplay();
    }
    
    // Update all visual elements for player
    updateDisplay() {
        // Update HP text
        document.getElementById('player-hp').textContent = this.currentHp;
        
        // Update health bar width
        const healthPercentage = (this.currentHp / this.maxHp) * 100;
        document.getElementById('player-health-fill').style.width = healthPercentage + '%';
        
        // Show/hide block display
        const blockDisplay = document.getElementById('player-block-display');
        if (this.block > 0) {
            blockDisplay.classList.add('show');
            document.getElementById('player-block').textContent = this.block;
        } else {
            blockDisplay.classList.remove('show');
        }
    }
}

// Show floating damage number on player
function showPlayerDamageNumber(damage) {
    const playerArea = document.querySelector('.player-area');
    const damageDiv = document.createElement('div');
    damageDiv.className = 'damage-number';
    damageDiv.textContent = `-${damage}`;
    playerArea.appendChild(damageDiv);
    
    setTimeout(() => damageDiv.remove(), 1000);
}

// Show floating block number on player
function showBlockNumber(amount) {
    const playerArea = document.querySelector('.player-area');
    const blockDiv = document.createElement('div');
    blockDiv.className = 'block-number';
    blockDiv.textContent = `+${amount}`;
    playerArea.appendChild(blockDiv);
    
    setTimeout(() => blockDiv.remove(), 1000);
}

// Show blocked damage indicator on player
function showBlockedNumber(blocked) {
    const playerArea = document.querySelector('.player-area');
    const blockedDiv = document.createElement('div');
    blockedDiv.className = 'blocked-number';
    blockedDiv.textContent = `Blocked ${blocked}`;
    playerArea.appendChild(blockedDiv);
    
    setTimeout(() => blockedDiv.remove(), 1000);
}

// Global game state variables
let deck = [];              // Cards available to draw
let discardPile = [];       // Cards that have been played
let hand = [];              // Current cards in hand
let cartaArrastando = null; // Currently dragging card
let offsetX = 0;            // Mouse offset for dragging
let offsetY = 0;
let energyManager = null;   // Energy system instance
let enemy = null;           // Enemy instance
let player = null;          // Player instance
let turnCount = 1;          // Current turn number
let isTargeting = false;    // Whether in targeting mode
let targetingCard = null;   // Card being targeted with
let cardStartPosition = { x: 0, y: 0 }; // Position for targeting line start

// Add a card to the player's hand with animation
function addCardToHand(card, index = 0) {
    hand.push(card);
    const cardElement = card.createElement();
    
    // Get deck pile position for animation start
    const deckPile = document.querySelector('.deck-pile');
    const deckRect = deckPile.getBoundingClientRect();
    
    // Calculate final position in hand
    const handWidth = window.innerWidth;
    const spacing = Math.min(150, handWidth / 5);
    const totalWidth = 5 * spacing;
    const startX = (handWidth - totalWidth) / 2;
    const finalLeft = startX + (index * spacing);
    const finalBottom = 20;
    
    // Start card at deck position (small and invisible)
    cardElement.style.position = 'absolute';
    cardElement.style.left = (deckRect.left + deckRect.width / 2 - 60) + 'px';
    cardElement.style.top = (deckRect.top + deckRect.height / 2 - 80) + 'px';
    cardElement.style.transform = 'scale(0.1)';
    cardElement.style.opacity = '0';
    cardElement.style.zIndex = '100';
    cardElement.style.transition = 'none';
    
    document.getElementById('hand').appendChild(cardElement);
    
    // Force browser to render initial state
    cardElement.offsetHeight;
    
    // Animate to final position
    setTimeout(() => {
        cardElement.style.transition = 'all 0.4s ease-out';
        cardElement.style.left = finalLeft + 'px';
        cardElement.style.top = 'auto';
        cardElement.style.bottom = finalBottom + 'px';
        cardElement.style.transform = `scale(1) rotate(${(index - 2) * 3}deg)`; // Fan effect
        cardElement.style.opacity = '1';
        
        // Reset transition after animation
        setTimeout(() => {
            cardElement.style.transition = '';
            cardElement.style.zIndex = index;
        }, 400);
    }, 50 + (index * 50)); // Stagger cards
}

// Reorganize hand positions after card removal
function reorganizeHand() {
    const cards = document.querySelectorAll('.hand .card');
    const handWidth = window.innerWidth;
    const cardWidth = 120;
    const spacing = Math.min(150, handWidth / cards.length);
    const totalWidth = cards.length * spacing;
    const startX = (handWidth - totalWidth) / 2;
    
    cards.forEach((card, index) => {
        // Reset transform to prevent accumulation
        card.style.transition = 'none';
        card.style.transform = '';
        
        // Force reflow
        card.offsetHeight;
        
        // Apply smooth transition
        card.style.transition = 'all 0.3s ease-out';
        
        // Set new position
        card.style.left = `${startX + (index * spacing)}px`;
        card.style.bottom = '20px';
        card.style.top = 'auto';
        
        // Apply fan rotation
        const rotation = (index - (cards.length - 1) / 2) * 3;
        card.style.transform = `rotate(${rotation}deg)`;
        
        // Update z-index for proper layering
        card.style.zIndex = index;
        
        // Clean up transition
        setTimeout(() => {
            card.style.transition = '';
        }, 300);
    });
}

// Initialize drag operation when mousedown on card
function iniciarDrag(e) {
    const card = e.target.closest('.card');
    if (!card) return;
    
    // Prevent dragging unplayable cards
    if (card.classList.contains('unplayable')) {
        showMessage('Not enough energy!', 'error');
        return;
    }
    
    cartaArrastando = card;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse offset within card
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // Store starting position for animation
    cartaArrastando.startX = rect.left;
    cartaArrastando.startY = rect.top;
    
    // Apply dragging styles
    card.classList.add('dragging');
    document.body.classList.add('dragging-active');
    
    // Bring card to front
    card.style.zIndex = 1000;
}

// Handle mouse movement while dragging
function arrastar(e) {
    if (!cartaArrastando || isTargeting) return;
    
    // Calculate movement delta
    const deltaX = e.clientX - offsetX - cartaArrastando.startX;
    const deltaY = e.clientY - offsetY - cartaArrastando.startY;
    
    // Apply transform to move card
    cartaArrastando.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(-5deg)`;
    
    // Check if card is above manipulation area (250px from bottom)
    const manipulationArea = window.innerHeight - 250;
    
    if (e.clientY < manipulationArea) {
        const cardData = cartaArrastando.cardData;
        
        // Auto-start targeting for attack cards
        if (cardData.type === 'damage') {
            console.log('Iniciando targeting automaticamente');
            startTargeting(cartaArrastando, e);
            
            // Clear dragging state
            cartaArrastando = null;
            document.body.style.cursor = 'default';
        } 
        // Show crosshair for other cards
        else {
            document.body.style.cursor = 'crosshair';
        }
    } else {
        // Normal grab cursor in hand area
        document.body.style.cursor = 'grab';
    }
}

// Handle mouse release to drop card
function soltarCarta(e) {
    if (!cartaArrastando) return;
    
    const manipulationArea = window.innerHeight - 250;
    const cardData = cartaArrastando.cardData;
    
    // If releasing block card above manipulation area, play it
    if (e.clientY < manipulationArea && cardData.type === 'block') {
        console.log('Aplicando defesa ao soltar');
        playCard(cartaArrastando);
    } else {
        // Otherwise return card to hand
        console.log('Voltando carta para a mão');
        cartaArrastando.classList.remove('dragging');
        returnCardToHand(cartaArrastando);
    }
    
    // Reset dragging state
    cartaArrastando.style.zIndex = '';
    cartaArrastando = null;
    document.body.style.cursor = 'default';
}

// Enter targeting mode for attack cards
function startTargeting(card, e) {
    isTargeting = true;
    targetingCard = card;
    targetingCard.targetStartTime = e.timeStamp; // Store time to prevent immediate click
    
    // Switch visual states
    card.classList.add('targeting');
    card.classList.remove('dragging');
    
    // Calculate center of all cards in hand
    const cards = document.querySelectorAll('.hand .card');
    let leftMost = Infinity;
    let rightMost = -Infinity;
    
    cards.forEach(c => {
        const rect = c.getBoundingClientRect();
        leftMost = Math.min(leftMost, rect.left);
        rightMost = Math.max(rightMost, rect.right);
    });
    
    const handCenterX = (leftMost + rightMost) / 2 - 60; // Center minus half card width
    
    // Calculate elevated position for targeting card
    const baseBottom = parseInt(window.getComputedStyle(card).bottom) || 20;
    const elevatedBottom = baseBottom + 100;
    
    // Convert bottom position to top position
    const windowHeight = window.innerHeight;
    const cardHeight = 160;
    const topPosition = windowHeight - elevatedBottom - cardHeight;
    
    // Animate card to center elevated position
    card.style.transition = 'all 0.3s ease-out';
    card.style.left = handCenterX + 'px';
    card.style.top = topPosition + 'px';
    card.style.bottom = 'auto';
    card.style.transform = 'scale(1.3) rotate(0deg)';
    card.style.zIndex = '1000';
    
    // After animation completes, set up targeting UI
    setTimeout(() => {
        // Get card center position for line start
        const rect = card.getBoundingClientRect();
        cardStartPosition = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        
        // Show targeting UI elements
        document.getElementById('targeting-line').style.display = 'block';
        document.getElementById('targeting-cursor').style.display = 'block';
        
        // Add targeting event listeners
        document.addEventListener('mousemove', updateTargeting);
        document.addEventListener('click', confirmTarget);
        document.addEventListener('keydown', cancelTargeting);
        
        // Add targeting mode class to body
        document.body.classList.add('targeting-mode');
        
        updateTargeting(e);
    }, 300);
}

// Update targeting line and cursor position
function updateTargeting(e) {
    if (!isTargeting) return;
    
    // Move cursor to mouse position
    const cursor = document.getElementById('targeting-cursor');
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Update curved line path
    const svg = document.querySelector('#targeting-line svg');
    const path = document.getElementById('targeting-path');
    
    // Line endpoints
    const startX = cardStartPosition.x;
    const startY = cardStartPosition.y;
    const endX = e.clientX;
    const endY = e.clientY;
    
    // Control point for quadratic bezier curve
    const controlX = (startX + endX) / 2;
    const controlY = Math.min(startY, endY) - 100; // Curve upward
    
    // Create SVG path
    const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
    path.setAttribute('d', pathData);
}

// Handle click during targeting to confirm target
function confirmTarget(e) {
    if (!isTargeting || !targetingCard) return;
    
    // Prevent immediate click after starting targeting
    if (e.timeStamp - (targetingCard.targetStartTime || 0) < 100) {
        return;
    }
    
    // Check if clicking on enemy
    const enemyArea = document.querySelector('.enemy-area');
    const enemyRect = enemyArea.getBoundingClientRect();
    
    if (e.clientX > enemyRect.left && e.clientX < enemyRect.right &&
        e.clientY > enemyRect.top && e.clientY < enemyRect.bottom) {
        
        // Play the attack card
        playCard(targetingCard);
    } else {
        // Cancel targeting and return card
        targetingCard.classList.remove('targeting');
        returnCardToHand(targetingCard);
    }
    
    endTargeting();
}

// Handle ESC key to cancel targeting
function cancelTargeting(e) {
    if (!isTargeting) return;
    
    if (e.key === 'Escape') {
        targetingCard.classList.remove('targeting');
        
        // Animate card back to hand
        targetingCard.style.transition = 'all 0.3s ease-out';
        targetingCard.style.top = 'auto';
        targetingCard.style.bottom = '20px';
        
        // Reorganize hand after animation
        setTimeout(() => {
            reorganizeHand();
        }, 50);
        
        endTargeting();
    }
}

// Clean up targeting mode
function endTargeting() {
    isTargeting = false;
    
    // Hide targeting UI elements
    document.getElementById('targeting-line').style.display = 'none';
    document.getElementById('targeting-cursor').style.display = 'none';
    
    // Remove targeting mode class
    document.body.classList.remove('targeting-mode');
    
    // Remove event listeners
    document.removeEventListener('mousemove', updateTargeting);
    document.removeEventListener('click', confirmTarget);
    document.removeEventListener('keydown', cancelTargeting);
    
    targetingCard = null;
}

// Return card to hand with animation
function returnCardToHand(cardElement) {
    // Remove special states
    cardElement.classList.remove('targeting');
    cardElement.classList.remove('dragging');
    
    // Animate back to hand position
    cardElement.style.transition = 'all 0.3s ease-out';
    cardElement.style.top = 'auto';
    cardElement.style.bottom = '20px';
    
    // Reorganize all cards in hand
    setTimeout(() => {
        reorganizeHand();
    }, 50);
}

// Play a card (spend energy, apply effect, discard)
function playCard(cardElement) {
    const cardData = cardElement.cardData;
    
    // Check energy cost
    if (!energyManager.canPlayCard(cardData.cost)) {
        showMessage('Not enough energy!', 'error');
        returnCardToHand(cardElement);
        return;
    }
    
    console.log(`Jogando carta: ${cardData.name}`);
    
    // Spend energy
    energyManager.spendEnergy(cardData.cost);
    
    // Remove from hand array
    const index = hand.findIndex(c => c === cardData);
    if (index > -1) {
        hand.splice(index, 1);
        
        // Apply card effect
        applyCardEffect(cardData);
        
        // Animate card to discard pile
        const discardIcon = document.querySelector('.discard-pile');
        const discardRect = discardIcon.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();
        
        const deltaX = discardRect.left + discardRect.width / 2 - cardRect.left - cardRect.width / 2;
        const deltaY = discardRect.top + discardRect.height / 2 - cardRect.top - cardRect.height / 2;
        
        cardElement.style.transition = 'all 0.4s ease-in';
        cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.1) rotate(360deg)`;
        cardElement.style.opacity = '0';
        cardElement.style.zIndex = '1000';
        
        // Remove element and reorganize hand
        setTimeout(() => {
            cardElement.remove();
            reorganizeHand();
        }, 400);
        
        // Add to discard pile
        discardCard(cardData);
    }
}

// Show temporary message to player
function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 2000);
}

// Apply the effect of a played card
function applyCardEffect(card) {
    if (card.type === 'damage') {
        // Animate player attack
        const playerArea = document.querySelector('.player-area');
        playerArea.classList.add('attacking');
        setTimeout(() => playerArea.classList.remove('attacking'), 500);
        
        // Deal damage after animation starts
        setTimeout(() => {
            enemy.takeDamage(card.value);
            showDamageNumber(card.value);
            
            // Check for victory
            setTimeout(() => {
                if (enemy.currentHp <= 0) {
                    showMessage('Victory! 🎉', 'victory');
                    disableGame();
                }
            }, 100);
            
        }, 150);
        
    } else if (card.type === 'block') {
        // Add block to player
        player.addBlock(card.value);
        showBlockNumber(card.value);
    }
}

// Show blocked indicator on enemy (unused in current version)
function showBlockedEnemyNumber() {
    const enemyArea = document.querySelector('.enemy-area');
    const blockedDiv = document.createElement('div');
    blockedDiv.className = 'blocked-number';
    blockedDiv.textContent = 'Blocked!';
    enemyArea.appendChild(blockedDiv);
    
    setTimeout(() => blockedDiv.remove(), 1000);
}

// Show floating damage number on enemy
function showDamageNumber(damage) {
    const enemyArea = document.querySelector('.enemy-area');
    const damageDiv = document.createElement('div');
    damageDiv.className = 'damage-number';
    damageDiv.textContent = `-${damage}`;
    enemyArea.appendChild(damageDiv);
    
    setTimeout(() => damageDiv.remove(), 1000);
}

// Initialize the starting deck
function initializeDeck() {
    // Create initial deck: 5 Strike, 4 Defend, 1 Bash
    deck = [
        // 5 Strike cards
        ...Array(5).fill().map(() => new Card('Strike', 1, 'damage', 6, 'Deal 6 damage')),
        // 4 Defend cards
        ...Array(4).fill().map(() => new Card('Defend', 1, 'block', 5, 'Gain 5 block')),
        // 1 Bash card
        new Card('Bash', 2, 'damage', 15, 'Deal 15 damage')
    ];
        
    shuffleDeck();
    updateDeckCounters();
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Update visual counters for deck and discard pile
function updateDeckCounters() {
    const deckCount = document.getElementById('deck-count');
    const discardCount = document.getElementById('discard-count');
    
    if (deckCount) {
        deckCount.textContent = deck.length;
        // Animate count change
        deckCount.classList.add('animated');
        setTimeout(() => deckCount.classList.remove('animated'), 300);
    }
    
    if (discardCount) {
        discardCount.textContent = discardPile.length;
        // Animate count change
        discardCount.classList.add('animated');
        setTimeout(() => discardCount.classList.remove('animated'), 300);
    }
}

// Draw a card from the deck
function drawCard() {
    // If deck is empty, reshuffle discard pile
    if (deck.length === 0) {
        if (discardPile.length === 0) {
            console.log("No cards to draw!");
            showMessage('No cards left!', 'error');
            return null;
        }
        
        // Move discard to deck and shuffle
        deck = [...discardPile];
        discardPile = [];
        shuffleDeck();
        showMessage('Deck reshuffled!', 'info');
        
        // Visual feedback for reshuffle
        animateReshuffle();
    }
    
    // Animate deck pile
    const deckPile = document.querySelector('.deck-pile');
    deckPile.style.transform = 'scale(0.95)';
    setTimeout(() => {
        deckPile.style.transform = '';
    }, 200);
    
    // Draw top card
    const card = deck.pop();
    updateDeckCounters();
    return card;
}

// Add card to discard pile
function discardCard(cardData) {
    discardPile.push(cardData);
    updateDeckCounters();
}

// Discard entire hand at end of turn
function discardHand() {
    // Store cards before clearing hand
    const cardsToDiscard = [...hand];
    const handElement = document.getElementById('hand');
    const cards = handElement.querySelectorAll('.card');
    
    // Clear hand array
    hand = [];
    
    // Animate each card to discard pile
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

// Visual feedback for deck reshuffle
function animateReshuffle() {
    const deckPile = document.querySelector('.deck-pile');
    const discardPileElement = document.querySelector('.discard-pile');
    
    // Scale animations to show transfer
    discardPileElement.style.transform = 'scale(0.8)';
    deckPile.style.transform = 'scale(1.2)';
    
    setTimeout(() => {
        discardPileElement.style.transform = '';
        deckPile.style.transform = '';
    }, 300);
}

// Draw a new hand of 5 cards
function drawNewHand() {
    // Delay to allow discard animation to complete
    setTimeout(() => {
        const cardsToDrawCount = 5;
        const newCards = [];
        
        // Draw cards from deck
        for (let i = 0; i < cardsToDrawCount; i++) {
            const card = drawCard();
            if (card) {
                newCards.push(card);
            }
        }
        
        // Add each card to hand with staggered animation
        newCards.forEach((card, index) => {
            addCardToHand(card, index);
        });
        
        // Update card states after all cards are drawn
        setTimeout(() => {
            energyManager.updateCardStates();
        }, 600);
        
    }, 500); // Wait for discard animations
}

// End the player's turn
function endTurn() {
    console.log('Ending turn', turnCount);
    
    // Disable end turn button
    const endTurnBtn = document.getElementById('end-turn-btn');
    endTurnBtn.disabled = true;
    
    // Reset enemy block for new turn
    enemy.startNewTurn();
    
    // Execute enemy action after delay
    setTimeout(() => {
        const enemyAction = enemy.executeAction();
        
        if (enemyAction.type === 'attack') {
            // Enemy attacks player
            const enemyArea = document.querySelector('.enemy-area');
            enemyArea.classList.add('attacking');
            setTimeout(() => enemyArea.classList.remove('attacking'), 500);
            
            // Deal damage after animation starts
            setTimeout(() => {
                player.takeDamage(enemyAction.value);
            }, 150);
        } else {
            // Enemy gains block
            enemy.addBlock(enemyAction.value);
        }
        
        // Check for player defeat
        if (player.currentHp <= 0) {
            disableGame();
            return;
        }
        
        // Start new turn after enemy action completes
        setTimeout(() => {
            startNewTurn();
        }, 1000);
        
    }, 500);
}

// Start a new turn
function startNewTurn() {
    turnCount++;
    console.log('Starting turn', turnCount);
    
    // Reset player block for new turn
    player.startNewTurn();
    
    // Refill energy to maximum
    energyManager.refillEnergy();
    
    // Discard current hand and draw new cards
    discardHand();
    drawNewHand();
    
    // Re-enable end turn button
    document.getElementById('end-turn-btn').disabled = false;
    
    showMessage(`Turn ${turnCount}`, 'info');
}

// Disable game controls when game ends
function disableGame() {
    document.getElementById('end-turn-btn').disabled = true;
    // Additional cleanup could be added here
}

// Set up event listeners for drag and drop
document.addEventListener('mousedown', iniciarDrag);
document.addEventListener('mousemove', arrastar);
document.addEventListener('mouseup', soltarCarta);

// Initialize game when page loads
window.onload = () => {
    // Create game instances
    energyManager = new EnergyManager(3);
    enemy = new Enemy(50, 'Slime');
    player = new Player(80);
    
    // Initialize deck
    initializeDeck();

    // Create background stars
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
    
    // Draw initial hand
    const initialCards = [];
    for (let i = 0; i < 5; i++) {
        const card = drawCard();
        if (card) {
            initialCards.push(card);
        }
    }
    
    // Add cards to hand with animation
    initialCards.forEach((card, index) => {
        addCardToHand(card, index);
    });
    
    // Update card states after initial draw
    setTimeout(() => {
        energyManager.updateCardStates();
    }, 600);
    
    // Set up end turn button
    document.getElementById('end-turn-btn').addEventListener('click', endTurn);
    
    // Set up deck pile click to show count
    document.querySelector('.deck-pile').addEventListener('click', () => {
        showMessage(`${deck.length} cards in draw pile`, 'info');
    });
    
    // Set up discard pile click to show contents
    document.querySelector('.discard-pile').addEventListener('click', () => {
        if (discardPile.length > 0) {
            const cardNames = discardPile.map(c => c.name).join(', ');
            showMessage(`Discard: ${cardNames}`, 'info');
        } else {
            showMessage('Discard pile is empty', 'info');
        }
    });
};
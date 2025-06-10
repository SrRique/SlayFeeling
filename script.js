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

// ===== VARIÁVEIS GLOBAIS =====
let hand = [];
let cartaArrastando = null;
let offsetX = 0;
let offsetY = 0;
let energyManager = null;

// ===== FUNÇÕES DE GERENCIAMENTO DE CARTAS =====
function addCardToHand(card) {
    hand.push(card);
    const cardElement = card.createElement();
    document.getElementById('hand').appendChild(cardElement);
}

function reorganizeHand() {
    const cards = document.querySelectorAll('.hand .card');
    const handWidth = window.innerWidth;
    const cardWidth = 120;
    const spacing = Math.min(150, handWidth / cards.length);
    const totalWidth = cards.length * spacing;
    const startX = (handWidth - totalWidth) / 2;
    
    cards.forEach((card, index) => {
        // Posicionar horizontalmente
        card.style.left = `${startX + (index * spacing)}px`;
        card.style.bottom = '20px';
        
        // Adicionar rotação para efeito "leque"
        const rotation = (index - (cards.length - 1) / 2) * 3;
        card.style.transform = `rotate(${rotation}deg)`;
        
        // Z-index para sobreposição correta
        card.style.zIndex = index;
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
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // Adicionar classe para visual de arraste
    card.classList.add('dragging');
    
    // Guardar posição original
    cartaArrastando.originalLeft = card.style.left;
    cartaArrastando.originalBottom = card.style.bottom;
    cartaArrastando.originalTransform = card.style.transform;
}

function arrastar(e) {
    if (!cartaArrastando) return;
    
    cartaArrastando.style.left = (e.clientX - offsetX) + 'px';
    cartaArrastando.style.top = (e.clientY - offsetY) + 'px';
    
    // Verificar se está sobre a área de jogo
    const playArea = document.querySelector('.play-area');
    const playRect = playArea.getBoundingClientRect();
    
    if (e.clientX > playRect.left && e.clientX < playRect.right &&
        e.clientY > playRect.top && e.clientY < playRect.bottom) {
        playArea.classList.add('hover');
    } else {
        playArea.classList.remove('hover');
    }
}

function soltarCarta(e) {
    if (!cartaArrastando) return;
    
    const playArea = document.querySelector('.play-area');
    const playRect = playArea.getBoundingClientRect();
    
    // Verificar se soltou na área de jogo
    if (e.clientX > playRect.left && e.clientX < playRect.right &&
        e.clientY > playRect.top && e.clientY < playRect.bottom) {
        
        // Tentar jogar a carta
        playCard(cartaArrastando);
    } else {
        // Voltar para a mão
        returnCardToHand(cartaArrastando);
    }
    
    // Limpar estados
    cartaArrastando.classList.remove('dragging');
    playArea.classList.remove('hover');
    cartaArrastando = null;
}

// ===== FUNÇÕES DE GAMEPLAY =====
function returnCardToHand(cardElement) {
    cardElement.style.left = cardElement.originalLeft;
    cardElement.style.bottom = cardElement.originalBottom;
    cardElement.style.transform = cardElement.originalTransform;
    cardElement.style.top = 'auto';
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
    
    // Remover carta do array e do DOM
    const index = hand.findIndex(c => c === cardData);
    if (index > -1) {
        hand.splice(index, 1);
        cardElement.remove();
        
        // Reorganizar mão
        reorganizeHand();
        
        // Aplicar efeito da carta
        applyCardEffect(cardData);
    }
}

function showCardEffect(card) {
    // Criar mensagem temporária
    const message = document.createElement('div');
    message.className = 'card-effect-message';
    message.textContent = `${card.name}: ${card.description}`;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 2000);
}

// ===== EVENT LISTENERS =====
document.addEventListener('mousedown', iniciarDrag);
document.addEventListener('mousemove', arrastar);
document.addEventListener('mouseup', soltarCarta);

// ===== INICIALIZAÇÃO =====
window.onload = () => {
    // Criar gerenciador de energia
    energyManager = new EnergyManager(3);
    
    // Criar deck inicial
    addCardToHand(new Card('Strike', 1, 'damage', 6, 'Deal 6 damage'));
    addCardToHand(new Card('Strike', 1, 'damage', 6, 'Deal 6 damage'));
    addCardToHand(new Card('Defend', 1, 'block', 5, 'Gain 5 block'));
    addCardToHand(new Card('Heavy Strike', 2, 'damage', 10, 'Deal 10 damage'));
    addCardToHand(new Card('Cheap Shot', 0, 'damage', 3, 'Deal 3 damage'));
    
    reorganizeHand();
    
    // Atualizar estado inicial das cartas
    energyManager.updateCardStates();
};

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
        dealDamageToEnemy(card.value);
        showMessage(`Dealt ${card.value} damage!`, 'damage');
    } else if (card.type === 'block') {
        // Por enquanto só mostra mensagem
        showMessage(`Gained ${card.value} block!`, 'block');
    }
}

function dealDamageToEnemy(damage) {
    const enemyHpElement = document.getElementById('enemy-hp');
    let currentHp = parseInt(enemyHpElement.textContent);
    currentHp = Math.max(0, currentHp - damage);
    enemyHpElement.textContent = currentHp;
    
    // Animação de dano
    showDamageNumber(damage);
    
    // Verificar vitória
    if (currentHp <= 0) {
        setTimeout(() => {
            showMessage('Victory! 🎉', 'victory');
        }, 500);
    }
}

function showDamageNumber(damage) {
    const enemyArea = document.querySelector('.enemy-area');
    const damageDiv = document.createElement('div');
    damageDiv.className = 'damage-number';
    damageDiv.textContent = `-${damage}`;
    enemyArea.appendChild(damageDiv);
    
    setTimeout(() => damageDiv.remove(), 1000);
}
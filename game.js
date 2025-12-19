// 게임 설정
const CARD_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

const GRID_SIZE = 4; // 4x4 그리드
const CARD_COUNT = GRID_SIZE * GRID_SIZE;
const PAIR_COUNT = CARD_COUNT / 2;

// Canvas 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas 크기 설정
const CARD_WIDTH = 100;
const CARD_HEIGHT = 120;
const CARD_SPACING = 15;
const CANVAS_WIDTH = GRID_SIZE * (CARD_WIDTH + CARD_SPACING) + CARD_SPACING;
const CANVAS_HEIGHT = GRID_SIZE * (CARD_HEIGHT + CARD_SPACING) + CARD_SPACING;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// 게임 상태
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let isFlipping = false;
let gameOver = false;
let gameStartTime = null;
let playerName = '';
let gameStarted = false; // 게임이 시작되었는지 여부

// 카드 클래스
class Card {
    constructor(x, y, color, index) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.index = index;
        this.isFlipped = false;
        this.isMatched = false;
        this.flipProgress = 0; // 0 = 뒷면, 1 = 앞면
        this.flipSpeed = 0.08;
        this.hoverScale = 1;
        this.matchGlow = 0;
        this.clickScale = 1;
    }

    draw() {
        ctx.save();
        
        // 카드 위치로 이동
        ctx.translate(this.x + CARD_WIDTH / 2, this.y + CARD_HEIGHT / 2);
        
        // 호버 효과
        const scale = this.clickScale * this.hoverScale;
        ctx.scale(scale, scale);
        
        // 뒤집기 애니메이션 (3D 회전 효과)
        const rotation = this.flipProgress * Math.PI;
        const flipScale = Math.abs(Math.cos(rotation));
        
        if (this.flipProgress < 0.5) {
            // 뒷면 그리기
            ctx.scale(flipScale, 1);
            this.drawBack();
        } else {
            // 앞면 그리기
            ctx.scale(flipScale, 1);
            this.drawFront();
        }
        
        ctx.restore();
    }

    drawBack() {
        // 그림자 효과
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 212, 255, 0.5)';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        
        // 카드 뒷면 그라데이션
        const gradient = ctx.createLinearGradient(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH / 2, CARD_HEIGHT / 2);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
        
        // 테두리 (네온 효과)
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
        ctx.strokeRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
        
        // 내부 패턴
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.fillRect(-CARD_WIDTH / 2 + 15 + i * 30, -CARD_HEIGHT / 2 + 15 + j * 25, 20, 20);
            }
        }
        
        // 중앙 심볼
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
        ctx.fillText('?', 0, 0);
        
        ctx.shadowBlur = 0;
    }

    drawFront() {
        // 그림자 효과
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.isMatched ? 'rgba(255, 215, 0, 0.8)' : 'rgba(0, 212, 255, 0.5)';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        
        // 카드 앞면 그라데이션
        const gradient = ctx.createLinearGradient(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH / 2, CARD_HEIGHT / 2);
        const rgb = this.hexToRgb(this.color);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, `rgb(${Math.min(255, rgb.r + 30)}, ${Math.min(255, rgb.g + 30)}, ${Math.min(255, rgb.b + 30)})`);
        gradient.addColorStop(1, this.color);
        ctx.fillStyle = gradient;
        ctx.fillRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
        
        // 테두리 (네온 효과)
        ctx.strokeStyle = this.isMatched ? '#FFD700' : '#fff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = this.isMatched ? 30 : 20;
        ctx.shadowColor = this.isMatched ? 'rgba(255, 215, 0, 1)' : 'rgba(255, 255, 255, 0.8)';
        ctx.strokeRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
        
        // 매칭된 카드는 빛나는 효과
        if (this.isMatched) {
            this.matchGlow = Math.min(1, this.matchGlow + 0.1);
            const glowAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;
            ctx.fillStyle = `rgba(255, 215, 0, ${glowAlpha})`;
            ctx.fillRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
            
            // 체크 표시
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(255, 215, 0, 1)';
            ctx.fillText('✓', 0, 0);
        } else {
            // 색상 원형 표시
            ctx.shadowBlur = 0;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, -20, 25, 0, Math.PI * 2);
            ctx.fill();
            
            // 흰색 테두리
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // 숫자 표시
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.fillText((this.index % 8) + 1, 0, 30);
        }
        
        ctx.shadowBlur = 0;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    flip() {
        if (this.isFlipping) return;
        this.isFlipping = true;
        this.isFlipped = !this.isFlipped;
        
        // 클릭 효과
        this.clickScale = 0.9;
        setTimeout(() => {
            this.clickScale = 1;
        }, 100);
        
        const animate = () => {
            if (this.isFlipped) {
                this.flipProgress += this.flipSpeed;
                if (this.flipProgress >= 1) {
                    this.flipProgress = 1;
                    this.isFlipping = false;
                }
            } else {
                this.flipProgress -= this.flipSpeed;
                if (this.flipProgress <= 0) {
                    this.flipProgress = 0;
                    this.isFlipping = false;
                }
            }
            
            if (this.isFlipping) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    updateHover(mouseX, mouseY) {
        if (this.contains(mouseX, mouseY) && !this.isMatched && !this.isFlipping) {
            this.hoverScale = Math.min(1.1, this.hoverScale + 0.05);
        } else {
            this.hoverScale = Math.max(1, this.hoverScale - 0.05);
        }
    }

    contains(x, y) {
        return x >= this.x && x <= this.x + CARD_WIDTH &&
               y >= this.y && y <= this.y + CARD_HEIGHT;
    }
}

// 카드 초기화
function initCards() {
    cards = [];
    
    // 색상 쌍 생성
    const colorPairs = [];
    for (let i = 0; i < PAIR_COUNT; i++) {
        colorPairs.push(CARD_COLORS[i]);
        colorPairs.push(CARD_COLORS[i]);
    }
    
    // 섞기
    for (let i = colorPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [colorPairs[i], colorPairs[j]] = [colorPairs[j], colorPairs[i]];
    }
    
    // 카드 생성
    let colorIndex = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const x = CARD_SPACING + col * (CARD_WIDTH + CARD_SPACING);
            const y = CARD_SPACING + row * (CARD_HEIGHT + CARD_SPACING);
            const card = new Card(x, y, colorPairs[colorIndex], colorIndex);
            cards.push(card);
            colorIndex++;
        }
    }
}

// 게임 시작
function startGame() {
    const nameInput = document.getElementById('player-name');
    const currentPlayerName = nameInput ? nameInput.value.trim() : '';
    
    // 이름이 없으면 게임 시작 불가
    if (!currentPlayerName) {
        const nameError = document.getElementById('name-error');
        if (nameError) {
            nameError.classList.remove('hidden');
        }
        if (nameInput) {
            nameInput.focus();
            nameInput.style.borderColor = '#FF6B6B';
        }
        return false;
    }
    
    // 에러 메시지 숨기기
    const nameError = document.getElementById('name-error');
    if (nameError) {
        nameError.classList.add('hidden');
    }
    if (nameInput) {
        nameInput.style.borderColor = '#667eea';
        nameInput.disabled = true; // 게임 시작 후 이름 변경 불가
    }
    
    // 게임 상태 초기화
    playerName = currentPlayerName;
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    isFlipping = false;
    gameOver = false;
    gameStarted = true;
    gameStartTime = Date.now();
    
    // 카드가 없으면 초기화
    if (cards.length === 0) {
        initCards();
    }
    
    updateUI();
    console.log('게임이 시작되었습니다!', { playerName, gameStarted });
    return true;
}

// 게임 초기화 (다시 시작)
function initGame() {
    // 이름 확인
    const nameInput = document.getElementById('player-name');
    const playerName = nameInput ? nameInput.value.trim() : '';
    
    if (!playerName) {
        const nameError = document.getElementById('name-error');
        if (nameError) {
            nameError.classList.remove('hidden');
        }
        if (nameInput) {
            nameInput.focus();
            nameInput.style.borderColor = '#FF6B6B';
        }
        return false;
    }
    
    // 에러 메시지 숨기기
    const nameError = document.getElementById('name-error');
    if (nameError) {
        nameError.classList.add('hidden');
    }
    if (nameInput) {
        nameInput.style.borderColor = '#667eea';
    }
    
    // 게임 상태 초기화
    playerName = nameInput.value.trim();
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    isFlipping = false;
    gameOver = false;
    gameStarted = true;
    gameStartTime = Date.now();
    
    // 이름 입력 필드 비활성화
    if (nameInput) {
        nameInput.disabled = true;
    }
    
    // 카드 재배치
    initCards();
    updateUI();
    return true;
}

// 마우스 위치 추적
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// 그리기
function draw() {
    // 배경 그라데이션
    const bgGradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#0f0c29');
    bgGradient.addColorStop(0.5, '#302b63');
    bgGradient.addColorStop(1, '#24243e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 그리드 패턴 배경
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        const x = CARD_SPACING + i * (CARD_WIDTH + CARD_SPACING);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let i = 0; i <= GRID_SIZE; i++) {
        const y = CARD_SPACING + i * (CARD_HEIGHT + CARD_SPACING);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
    
    // 이름 확인
    const nameInput = document.getElementById('player-name');
    const currentPlayerName = nameInput ? nameInput.value.trim() : '';
    
    // 이름이 입력되지 않았으면 메시지 표시
    if (!currentPlayerName) {
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
        ctx.fillText('이름을 입력하고 게임을 시작하세요!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.shadowBlur = 0;
        requestAnimationFrame(draw);
        return;
    }
    
    // 카드가 없으면 초기화
    if (cards.length === 0) {
        initCards();
    }
    
    // 게임이 시작되지 않았으면 카드는 보이지만 반투명하게 표시
    if (!gameStarted) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        
        // 카드 그리기
        cards.forEach(card => {
            card.updateHover(mouseX, mouseY);
            card.draw();
        });
        
        ctx.restore();
        
        // 안내 메시지 표시
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
        ctx.fillText('카드를 클릭하여 게임을 시작하세요!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.shadowBlur = 0;
        requestAnimationFrame(draw);
        return;
    }
    
    // 게임이 시작되었으면 정상적으로 카드 그리기
    cards.forEach(card => {
        if (!card.isMatched || card.flipProgress > 0) {
            card.updateHover(mouseX, mouseY);
            card.draw();
        }
    });
    
    requestAnimationFrame(draw);
}

// 카드 클릭 처리
canvas.addEventListener('click', (e) => {
    // 이름 확인 (항상 체크)
    const nameInput = document.getElementById('player-name');
    const currentPlayerName = nameInput ? nameInput.value.trim() : '';
    
    if (!currentPlayerName) {
        const nameError = document.getElementById('name-error');
        if (nameError) {
            nameError.classList.remove('hidden');
        }
        if (nameInput) {
            nameInput.focus();
            nameInput.style.borderColor = '#FF6B6B';
        }
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 게임이 시작되지 않았으면 먼저 게임 시작
    if (!gameStarted) {
        if (!startGame()) {
            return; // 게임 시작 실패 시 중단
        }
        // 게임 시작 후 클릭한 위치의 카드 찾기
    }
    
    if (gameOver || isFlipping) return;
    
    // 카드가 없으면 초기화
    if (cards.length === 0) {
        initCards();
    }
    
    const clickedCard = cards.find(card => 
        !card.isMatched && 
        !card.isFlipped && 
        card.contains(x, y)
    );
    
    if (!clickedCard) return;
    
    // 카드 뒤집기
    clickedCard.flip();
    flippedCards.push(clickedCard);
    
    // 두 장이 뒤집혔는지 확인
    if (flippedCards.length === 2) {
        isFlipping = true;
        moves++;
        updateUI();
        
        setTimeout(() => {
            checkMatch();
        }, 1000);
    }
});

// 매칭 확인
function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.color === card2.color) {
        // 매칭 성공
        card1.isMatched = true;
        card2.isMatched = true;
        matchedPairs++;
        
        // 매칭 성공 애니메이션
        card1.matchGlow = 0;
        card2.matchGlow = 0;
        
        // 성공 효과 (화면 흔들림)
        canvas.style.animation = 'matchSuccess 0.3s ease';
        setTimeout(() => {
            canvas.style.animation = '';
        }, 300);
        
        if (matchedPairs === PAIR_COUNT) {
            // 게임 완료
            setTimeout(() => {
                gameOver = true;
                saveScore();
                showGameOver();
                // 축하 애니메이션
                canvas.style.animation = 'celebrate 1s ease';
            }, 800);
        }
    } else {
        // 매칭 실패 - 빨간색 플래시 효과
        canvas.style.animation = 'matchFail 0.2s ease';
        setTimeout(() => {
            canvas.style.animation = '';
        }, 200);
        
        // 카드 다시 뒤집기
        setTimeout(() => {
            card1.flip();
            card2.flip();
        }, 1000);
    }
    
    flippedCards = [];
    isFlipping = false;
}

// UI 업데이트
function updateUI() {
    document.getElementById('moves').textContent = moves;
    document.getElementById('matches').textContent = `${matchedPairs} / ${PAIR_COUNT}`;
}

// 점수 저장
async function saveScore() {
    if (typeof supabase === 'undefined') {
        console.warn('Supabase가 로드되지 않았습니다.');
        return;
    }

    const gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
    
    // 사용자 이름 가져오기
    const nameInput = document.getElementById('player-name');
    playerName = nameInput ? nameInput.value.trim() : '';
    
    // 이름이 없으면 저장하지 않음
    if (!playerName) {
        console.warn('이름이 없어 점수를 저장할 수 없습니다.');
        return;
    }
    
    try {
        const scoreData = {
            player_name: playerName,
            moves: moves,
            matches: matchedPairs,
            total_pairs: PAIR_COUNT,
            game_time_seconds: gameTime
        };

        const result = await supabase.insert('game_scores', scoreData);
        console.log('점수가 저장되었습니다:', result);
        
        // 저장 성공 메시지 표시
        const scoreSaved = document.getElementById('score-saved');
        if (scoreSaved) {
            scoreSaved.classList.remove('hidden');
        }
        
        // 리더보드 새로고침
        loadLeaderboard();
    } catch (error) {
        console.error('점수 저장 실패:', error);
    }
}

// 게임 오버 화면
function showGameOver() {
    const gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    
    document.getElementById('final-moves').textContent = moves;
    const timeDisplay = document.getElementById('game-time-display');
    if (timeDisplay) {
        timeDisplay.textContent = `게임 시간: ${minutes}분 ${seconds}초`;
    }
    document.getElementById('game-over').classList.remove('hidden');
}

// 리더보드 로드
async function loadLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboard');
    if (!leaderboardDiv) {
        console.error('리더보드 div를 찾을 수 없습니다.');
        return;
    }
    
    // 로딩 표시
    leaderboardDiv.innerHTML = '<div class="loading">로딩 중...</div>';
    
    // Supabase 확인 (전역 변수 또는 window 객체에서)
    let supabaseClient = null;
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase;
    } else if (typeof window !== 'undefined' && window.supabase) {
        supabaseClient = window.supabase;
    }
    
    if (!supabaseClient) {
        leaderboardDiv.innerHTML = '<div class="error">Supabase가 로드되지 않았습니다.<br>페이지를 새로고침해주세요.</div>';
        console.error('Supabase가 정의되지 않았습니다.');
        return;
    }
    
    try {
        // game_scores 테이블에서 상위 10개 점수 가져오기
        // moves가 적을수록 좋은 점수이므로 오름차순 정렬
        const scores = await supabaseClient.select('game_scores', {
            orderBy: 'moves',
            orderDirection: 'asc',
            limit: 10
        });
        
        console.log('리더보드 데이터:', scores);
        
        if (!scores || scores.length === 0) {
            leaderboardDiv.innerHTML = '<div class="error">아직 기록이 없습니다.</div>';
            return;
        }
        
        let html = '';
        scores.forEach((score, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            const playerName = score.player_name || '익명';
            const minutes = score.game_time_seconds ? Math.floor(score.game_time_seconds / 60) : 0;
            const seconds = score.game_time_seconds ? score.game_time_seconds % 60 : 0;
            
            html += `
                <div class="leaderboard-item ${rankClass}">
                    <div class="rank-number">${rank}</div>
                    <div class="player-info">
                        <div class="player-name">${playerName}</div>
                        <div class="player-stats">매칭: ${score.matches}/${score.total_pairs}</div>
                    </div>
                    <div class="score-info">
                        <div class="moves-count">${score.moves}회</div>
                        ${score.game_time_seconds ? `<div class="time-info">${minutes}분 ${seconds}초</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        leaderboardDiv.innerHTML = html;
    } catch (error) {
        console.error('리더보드 로드 실패:', error);
        leaderboardDiv.innerHTML = `<div class="error">리더보드를 불러올 수 없습니다.<br>${error.message || '알 수 없는 오류'}</div>`;
    }
}

// 리더보드 새로고침 버튼
const refreshBtn = document.getElementById('refresh-leaderboard');
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        loadLeaderboard();
    });
}

// 게임 시작 버튼과 다시 시작 버튼
const startGameBtn = document.getElementById('start-game-btn');
const resetBtn = document.getElementById('reset-btn');

// 게임 시작 버튼
if (startGameBtn) {
    startGameBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('게임 시작 버튼 클릭됨');
        
        const nameInput = document.getElementById('player-name');
        const currentPlayerName = nameInput ? nameInput.value.trim() : '';
        
        console.log('플레이어 이름:', currentPlayerName);
        
        // 이름이 없으면 게임 시작 불가
        if (!currentPlayerName) {
            const nameError = document.getElementById('name-error');
            if (nameError) {
                nameError.classList.remove('hidden');
            }
            if (nameInput) {
                nameInput.focus();
                nameInput.style.borderColor = '#FF6B6B';
            }
            console.log('이름이 없어 게임을 시작할 수 없습니다.');
            return;
        }
        
        if (startGame()) {
            console.log('게임 시작 성공');
            // 게임 시작 버튼 숨기고 다시 시작 버튼 표시
            startGameBtn.style.display = 'none';
            if (resetBtn) {
                resetBtn.classList.add('show');
            }
        } else {
            console.log('게임 시작 실패');
        }
    });
} else {
    console.error('게임 시작 버튼을 찾을 수 없습니다.');
}

// 다시 시작 버튼
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('player-name');
        const currentPlayerName = nameInput ? nameInput.value.trim() : '';
        
        // 이름이 없으면 게임 시작 불가
        if (!currentPlayerName) {
            const nameError = document.getElementById('name-error');
            if (nameError) {
                nameError.classList.remove('hidden');
            }
            if (nameInput) {
                nameInput.focus();
                nameInput.style.borderColor = '#FF6B6B';
            }
            return;
        }
        
        // 이름 입력 필드 비활성화
        if (nameInput) {
            nameInput.disabled = true;
        }
        
        if (initGame()) {
            // 게임이 성공적으로 시작되면 게임 오버 화면 숨기기
            document.getElementById('game-over').classList.add('hidden');
            document.getElementById('score-saved').classList.add('hidden');
        }
    });
}

document.getElementById('play-again-btn').addEventListener('click', () => {
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('score-saved').classList.add('hidden');
    
    // 이름 입력 필드 다시 활성화
    const nameInput = document.getElementById('player-name');
    if (nameInput) {
        nameInput.disabled = false;
    }
    
    // 게임 상태 초기화 (게임 시작 안 함)
    gameStarted = false;
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    isFlipping = false;
    gameOver = false;
    updateUI();
    
    // 게임 시작 버튼 표시하고 다시 시작 버튼 숨기기
    if (startGameBtn) {
        startGameBtn.style.display = 'block';
    }
    if (resetBtn) {
        resetBtn.classList.remove('show');
    }
});

// 이름 입력 필드 이벤트 리스너
const nameInput = document.getElementById('player-name');
if (nameInput) {
    nameInput.addEventListener('input', () => {
        const nameError = document.getElementById('name-error');
        if (nameInput.value.trim()) {
            if (nameError) {
                nameError.classList.add('hidden');
            }
            nameInput.style.borderColor = '#667eea';
        }
    });
    
    nameInput.addEventListener('blur', () => {
        if (!nameInput.value.trim()) {
            const nameError = document.getElementById('name-error');
            if (nameError) {
                nameError.classList.remove('hidden');
            }
            nameInput.style.borderColor = '#FF6B6B';
        }
    });
    
    // Enter 키로 게임 시작
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && nameInput.value.trim() && !gameStarted) {
            startGame();
        }
    });
}

// 페이지 로드 시 리더보드 로드
window.addEventListener('load', () => {
    // Supabase가 로드될 때까지 대기
    setTimeout(() => {
        loadLeaderboard();
    }, 500);
    
    // 이름 입력 필드에 포커스
    const nameInput = document.getElementById('player-name');
    if (nameInput) {
        nameInput.focus();
    }
    
    // 게임은 시작하지 않음 (이름 입력 대기)
    draw();
});


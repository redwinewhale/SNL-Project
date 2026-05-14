export default class DesktopUIManager {
    constructor(scene) {
        // Phaser Scene(DesktopScene)의 참조를 저장하여 씬 전환이나 타이머를 사용할 수 있게 함
        this.scene = scene;
    }

    // UI 전체 초기화
    initialize() {
        this.setupDesktopIcons();
        this.setupSystemTray();
        this.setupUserProfile();

        this.scene.time.delayedCall(500, () => {
            this.showMailNotification();
        });
    }

    // ==========================================
    // 1. 바탕화면 기본 UI 설정 (아이콘, 프로필, 시계)
    // ==========================================
    setupDesktopIcons() {
        const iconsContainer = document.querySelector('.desktop-icons');
        if (!iconsContainer) return;
        iconsContainer.innerHTML = '';

        const iconData = [
            { id: 'icon-info', name: '게임 설명', iconClass: 'book-icon' },
            { id: 'icon-mail', name: '메일함', iconClass: 'mail-icon' },
            { id: 'icon-history', name: '문제 풀이 기록', iconClass: 'folder-icon' },
            { id: 'icon-vuln', name: '취약점 분석', iconClass: 'browser-icon' },
            { id: 'icon-practice', name: '실습 복습', iconClass: 'drive-icon' },
            { id: 'icon-ranking', name: '랭킹 / 업적', iconClass: 'recycle-icon' }
        ];

        iconData.forEach(data => {
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'desktop-icon';
            iconWrapper.style.cursor = 'pointer'; 
            iconWrapper.id = data.id;

            iconWrapper.innerHTML = `
                <div class="icon-art ${data.iconClass}"></div>
                <span>${data.name}</span>
            `;

            iconsContainer.appendChild(iconWrapper);

            iconWrapper.addEventListener('click', () => {
                this.handleIconClick(data.id, data.name);
            });
        });
    }

    handleIconClick(iconId, iconName) {
        console.log(`[SYSTEM] ${iconName} 클릭됨 (ID: ${iconId})`);
        switch(iconId) {
            case 'icon-info': this.showGameInfoModal(); break;
            case 'icon-mail': this.showMailDetailModal(); break;
            case 'icon-history': this.showHistoryModal(); break;
            case 'icon-vuln': this.showVulnModal(); break;
            case 'icon-practice': alert("실습 복습 기능은 아직 준비 중입니다."); break;
            case 'icon-ranking': this.showRankingModal(); break;
        }
    }

    setupSystemTray() {
        const taskbarRight = document.querySelector('.taskbar-right');
        if (!taskbarRight) return;

        const wifiIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`;
        const volumeIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
        const batteryIcon = `<svg width="22" height="12" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line><rect x="3" y="8" width="12" height="8" fill="#a7f3d0" stroke="none"></rect></svg>`;

        taskbarRight.innerHTML = `
            <div class="tray-icons">${wifiIcon}${volumeIcon}${batteryIcon}</div>
            <div class="clock-block">
                <strong id="current-time">00:00</strong>
                <span id="current-date">0000. 00. 00.</span>
            </div>
        `;

        this.updateClock();
        this.scene.time.addEvent({ delay: 60000, callback: this.updateClock, callbackScope: this, loop: true });
    }

    updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const timeEl = document.getElementById('current-time');
        const dateEl = document.getElementById('current-date');
        
        if (timeEl) timeEl.innerText = `${hours}:${minutes}`;
        if (dateEl) dateEl.innerText = `${year}. ${month}. ${day}.`;
    }

    setupUserProfile() {
        const desktopShell = document.getElementById('desktop-shell');
        if (!desktopShell) return;

        const userData = {
            nickname: 'Player_One', level: 4, currentExp: 75,
            securityRank: '주니어 화이트해커', aiStatus: "'포트 스캐닝' 집중 학습 중", clearCount: 12
        };

        const profileContainer = document.createElement('div');
        profileContainer.className = 'profile-container';

        profileContainer.innerHTML = `
            <div class="profile-avatar-btn">👤</div>
            <div class="profile-dropdown">
                <div class="dropdown-header">
                    <div class="dropdown-avatar">👤</div>
                    <div class="dropdown-user-info">
                        <div class="dropdown-name">${userData.nickname} <span class="edit-icon" title="이름 변경">✏️</span></div>
                        <div class="dropdown-rank">${userData.securityRank}</div>
                    </div>
                </div>
                <div class="dropdown-body">
                    <div class="dropdown-section">
                        <div class="section-label-row">
                            <span>Lv.${userData.level} (샌드박스 해금까지 1업)</span>
                            <span>${userData.currentExp}%</span>
                        </div>
                        <div class="dropdown-exp-bg"><div class="dropdown-exp-fill" style="width: ${userData.currentExp}%;"></div></div>
                    </div>
                    <div class="dropdown-section">
                        <div class="info-row"><span class="info-label">🤖 AI 분석:</span><span class="info-value ai-highlight">${userData.aiStatus}</span></div>
                        <div class="info-row"><span class="info-label">🏆 총 클리어:</span><span class="info-value">${userData.clearCount}회</span></div>
                    </div>
                </div>
                <div class="dropdown-footer">
                    <button class="logout-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        로그아웃
                    </button>
                </div>
            </div>
        `;

        desktopShell.appendChild(profileContainer);

        const profileBtn = profileContainer.querySelector('.profile-avatar-btn');
        const dropdown = profileContainer.querySelector('.profile-dropdown');

        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        desktopShell.addEventListener('click', () => dropdown.classList.remove('show'));
        dropdown.addEventListener('click', (e) => e.stopPropagation());

        dropdown.querySelector('.logout-btn').addEventListener('click', () => this.handleLogout(profileContainer));
        dropdown.querySelector('.edit-icon').addEventListener('click', () => {
            const newName = prompt("새로운 닉네임을 입력하세요:", userData.nickname);
            if (newName) {
                dropdown.querySelector('.dropdown-name').innerHTML = `${newName} <span class="edit-icon" title="이름 변경">✏️</span>`;
                alert("닉네임이 변경되었습니다.");
            }
        });
    }

    handleLogout(profileContainer) {
        if (profileContainer) profileContainer.remove();
        document.querySelectorAll('.mail-notification, .modal-overlay').forEach(el => el.remove());
        
        const desktopShell = document.getElementById('desktop-shell');
        if (desktopShell) {
            desktopShell.style.display = 'none';
            desktopShell.style.pointerEvents = 'none';
        }
        this.scene.scene.start('LoginScene');
    }

    // ==========================================
    // 2. 메세지 및 알림 기능
    // ==========================================
    showMailNotification() {
        const desktopShell = document.getElementById('desktop-shell');
        if (!desktopShell) return;

        const notiDiv = document.createElement('div');
        notiDiv.className = 'mail-notification';
        notiDiv.innerHTML = `
            <div class="mail-noti-title">새로운 메세지 도착</div>
            <div class="mail-noti-desc">[긴급] 1층 로비 출입 보안 점검 지시<br>클릭하여 확인하세요.</div>
        `;

        desktopShell.appendChild(notiDiv);
        void notiDiv.offsetWidth;
        notiDiv.classList.add('show');

        notiDiv.addEventListener('click', () => {
            notiDiv.classList.remove('show');
            setTimeout(() => notiDiv.remove(), 500);
            this.showMailDetailModal();
        });
    }

    showMailDetailModal() {
        const body = this.createBaseModal('안내 메일', 'mail-modal-window', 'mail-modal-overlay');
        
        const fieldData = [
            { id: 'network', name: '네트워크 보안', difficulty: 2 },
            { id: 'web', name: '웹 보안', difficulty: 4 },
            { id: 'system', name: '리눅스', difficulty: 1 },
            { id: 'crypto', name: '보안 법규', difficulty: 5 }
        ];

        let buttonsHtml = fieldData.map(field => `
            <button class="mail-field-btn" data-field="${field.id}">
                <span class="field-name">${field.name}</span>
                <span class="field-stars">${'★'.repeat(field.difficulty) + '☆'.repeat(5 - field.difficulty)}</span>
            </button>
        `).join('');

        body.innerHTML = `
            <div class="mail-content-scroll">
                <p><strong>[보안 점검 안내]</strong></p>
                <p>최근 사내 시스템을 대상으로 한 신원 미상의 사이버 공격 시도가 여러 차례 탐지되었습니다.</p>
                <p>본 훈련 프로그램은 귀하의 현재 보안 취약점을 AI가 분석하여 <strong>맞춤형 난이도</strong>로 제공됩니다.</p>
                <ol>
                    <li>제한 시간 내에 맵을 탐색하고 직원들을 클릭하여 보안 문제를 해결하십시오.</li>
                    <li>오답을 제출할 경우 시스템에 시간 패널티가 누적되므로 주의가 필요합니다.</li>
                    <li>단서를 조합하여 사내에 숨어든 '스파이'를 색출하십시오.</li>
                </ol>
            </div>
            <div class="mail-action-area">
                <div class="mail-action-title">실행할 프로그램을 선택하세요 (AI 추천 난이도)</div>
                <div class="mail-buttons-grid">${buttonsHtml}</div>
            </div>
        `;

        body.querySelectorAll('.mail-field-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fieldId = e.currentTarget.getAttribute('data-field');
                
                document.getElementById('mail-modal-overlay').querySelector('.mail-modal-close').click();
                
                if (fieldId === 'web') {
                    this.scene.scene.start('WebSecurityScene', { floor: 1, time: 600 });
                } else if (fieldId === 'network') {
                    this.scene.scene.start('NetworkSecurityScene', { floor: 1, time: 600 });
                } else if (fieldId === 'system') {
                    this.scene.scene.start('SystemSecurityScene', { floor: 1, time: 600 });
                } else if (fieldId === 'crypto') {
                    this.scene.scene.start('CryptoSecurityScene', { floor: 1, time: 600 });
                }
            });
        });
    }

    // ==========================================
    // 3. 앱(아이콘) 클릭 시 뜨는 모달 창들
    // ==========================================
    showGameInfoModal() {
        const body = this.createBaseModal('게임 설명', 'modal-window', 'info-modal-overlay');
        body.parentElement.querySelector('.modal-title').style.color = '#a78bfa';

        body.innerHTML = `
            <div class="info-content-scroll" style="padding: 15px 30px;">
                <h3>[ 🔍 게임 개요 ]</h3>
                <p>사내 시스템을 대상으로 한 공격 시도를 막고, 숨어든 스파이를 찾아내세요!</p>
                <br>
                <h3>[ 🎮 훈련 수칙 ]</h3>
                <ul>
                    <li><strong>문제 풀이:</strong> 맵에서 직원을 클릭하여 보안 문제를 해결하십시오.</li>
                    <li><strong>단서 획득:</strong> 문제를 풀 때마다 스파이를 찾을 수 있는 랜덤 단서를 얻습니다.</li>
                </ul>
                <br>
                <h3>[ ⚠️ 주의 사항 및 패널티 ]</h3>
                <ul>
                    <li>문제를 틀리면 정답을 맞힐 때까지 <strong>반복해서 풀어야 합니다.</strong></li>
                    <li>오답 제출 시 <strong>시간 단축 및 점수 감소 패널티</strong>가 실시간으로 누적됩니다.</li>
                </ul>
            </div>
        `;
    }

    showHistoryModal() {
        const body = this.createBaseModal('문제 풀이 기록', 'modal-window', 'history-modal-overlay');
        this.renderHistorySummary(body);
    }

    renderHistorySummary(bodyElement) {
        bodyElement.innerHTML = '<div class="loading-text">서버에서 기록을 불러오는 중...</div>';
        this.fetchHistoryDataFromServer().then(data => {
            bodyElement.innerHTML = ''; 
            data.forEach(item => {
                const row = document.createElement('div');
                row.className = 'history-row clickable-row';
                row.innerHTML = `
                    <div class="history-field">${item.field}</div>
                    <div class="history-stats">
                        <span>총 문제 <span class="stat-highlight">${item.totalCount}</span>개</span>
                        <span>정답률 <span class="stat-highlight">${item.accuracy}%</span></span>
                    </div>
                `;
                row.addEventListener('click', () => this.renderDetailedHistory(item.field, bodyElement));
                bodyElement.appendChild(row);
            });
        });
    }

    renderDetailedHistory(fieldName, bodyElement) {
        bodyElement.innerHTML = '<div class="loading-text">상세 내역을 불러오는 중...</div>';
        this.fetchDetailedLogsFromServer(fieldName).then(logs => {
            let html = `
                <div class="detail-header-nav">
                    <button class="nav-back-btn">◀ 뒤로가기</button>
                    <span class="detail-category-title">${fieldName} 분야 상세 기록</span>
                </div>
                <div class="detail-list">
            `;
            logs.forEach(log => {
                const statusClass = log.is_cleared ? 'status-correct' : 'status-wrong';
                const statusText = log.is_cleared ? '정답' : '오답';
                html += `
                    <div class="detail-item">
                        <div class="detail-info">
                            <div class="detail-question">[${log.sub_category}] ${log.question}</div>
                            <div class="detail-answer"><span class="answer-label">정답:</span> ${log.answer}</div>
                            <div class="detail-attempts">시도 횟수: ${log.attempt_count}회</div>
                        </div>
                        <div class="detail-status ${statusClass}">${statusText}</div>
                    </div>
                `;
            });
            bodyElement.innerHTML = html + `</div>`;
            bodyElement.querySelector('.nav-back-btn').addEventListener('click', () => this.renderHistorySummary(bodyElement));
        });
    }

    showVulnModal() {
        const body = this.createBaseModal('취약점 종합 분석');
        body.innerHTML = '<div class="loading-text">AI가 취약점을 분석 중입니다...</div>';

        this.fetchVulnDataFromServer().then(data => {
            let html = '<div class="vuln-scroll-container">';
            data.forEach((field, index) => {
                html += `
                    <div class="vuln-field-group">
                        <div class="vuln-field-header" data-index="${index}">
                            <div class="vuln-field-title">${field.fieldName}</div>
                            <svg class="vuln-toggle-icon toggle-icon-${index}" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                        </div>
                        <div class="vuln-field-content expanded" id="vuln-content-${index}">
                `;
                field.subCategories.forEach(sub => {
                    let icon, statusText, statusColor;
                    if (sub.accuracy <= 50 && sub.difficulty <= 3) { icon = '🚨'; statusText = '심각 (기초 취약)'; statusColor = '#ef4444'; } 
                    else if (sub.accuracy <= 60 && sub.difficulty >= 4) { icon = '⚠️'; statusText = '주의 (심화 필요)'; statusColor = '#f59e0b'; } 
                    else if (sub.accuracy >= 80) { icon = '✅'; statusText = '우수 (마스터)'; statusColor = '#22c55e'; } 
                    else { icon = '➖'; statusText = '보통 (복습 권장)'; statusColor = '#38bdf8'; }

                    const stars = '★'.repeat(sub.difficulty) + '☆'.repeat(5 - sub.difficulty);
                    html += `
                        <div class="vuln-item">
                            <div class="vuln-item-left">
                                <div class="vuln-sub-name">${sub.name}</div>
                                <div class="vuln-status" style="color: ${statusColor};">${icon} ${statusText}</div>
                            </div>
                            <div class="vuln-item-right">
                                <span class="vuln-metrics-text">평균 출제 난이도: <span class="vuln-stars">${stars}</span> 정답률: <strong style="color: ${statusColor};">${sub.accuracy}%</strong></span>
                                <div class="vuln-tiny-bar" style="background-color: ${statusColor};"></div>
                            </div>
                        </div>
                    `;
                });
                html += `</div></div>`;
            });
            body.innerHTML = html + '</div>';

            body.querySelectorAll('.vuln-field-header').forEach(header => {
                header.addEventListener('click', (e) => {
                    const index = e.currentTarget.getAttribute('data-index');
                    const content = body.querySelector(`#vuln-content-${index}`);
                    const icon = body.querySelector(`.toggle-icon-${index}`);
                    content.classList.toggle('expanded');
                    content.classList.toggle('collapsed');
                    icon.style.transform = content.classList.contains('expanded') ? 'rotate(0deg)' : 'rotate(-90deg)';
                });
            });
        });
    }

    showRankingModal() {
        const body = this.createBaseModal('랭킹 및 업적');
        body.innerHTML = '<div class="loading-text">서버에서 랭킹을 불러오는 중...</div>';

        Promise.all([this.fetchRankingData(), this.fetchAchievementData()]).then(([rankings, achievements]) => {
            let html = `<div class="rank-achieve-container"><div class="section-half"><div class="section-title">🏆 실시간 랭킹</div><div class="ranking-list">`;
            rankings.forEach(rank => {
                let rankClass = rank.rank === 1 ? 'rank-1st' : rank.rank === 2 ? 'rank-2nd' : rank.rank === 3 ? 'rank-3rd' : '';
                const isMe = rank.isMe ? '<span class="rank-me-badge">ME</span>' : '';
                html += `
                    <div class="ranking-item ${rankClass}">
                        <div class="rank-num">${rank.rank}</div>
                        <div class="rank-name">${rank.nickname} ${isMe}</div>
                        <div class="rank-score">${rank.score} pts</div>
                    </div>`;
            });

            html += `</div></div><div class="section-half"><div class="section-title">🌟 나의 업적</div><div class="achieve-list">`;
            achievements.forEach(achieve => {
                const statusClass = achieve.unlocked ? 'achieve-unlocked' : 'achieve-locked';
                const icon = achieve.unlocked ? '🏅' : '🔒';
                html += `
                    <div class="achieve-item ${statusClass}">
                        <div class="achieve-icon">${icon}</div>
                        <div class="achieve-info">
                            <div class="achieve-title">${achieve.title}</div>
                            <div class="achieve-desc">${achieve.desc}</div>
                        </div>
                    </div>`;
            });
            body.innerHTML = html + `</div></div></div>`;
        });
    }

    // ==========================================
    // 4. 공통 헬퍼(Helper) 함수
    // ==========================================
    createBaseModal(titleText, windowClass = 'modal-window', overlayId = 'dynamic-modal-overlay') {
        const existingModal = document.getElementById(overlayId);
        if (existingModal) existingModal.remove();

        const desktopShell = document.getElementById('desktop-shell');
        const overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.className = 'modal-overlay';

        const modalWindow = document.createElement('div');
        modalWindow.className = windowClass;

        const headerClass = windowClass === 'mail-modal-window' ? 'mail-modal-header' : 'modal-header';
        const titleClass = windowClass === 'mail-modal-window' ? 'mail-modal-title' : 'modal-title';
        const closeClass = windowClass === 'mail-modal-window' ? 'mail-modal-close' : 'modal-close';
        const bodyClass = windowClass === 'mail-modal-window' ? 'mail-modal-body' : 'modal-body';

        modalWindow.innerHTML = `
            <div class="${headerClass}">
                <div class="${titleClass}">${titleText}</div>
                <button class="${closeClass}">&times;</button>
            </div>
            <div class="${bodyClass}"></div>
        `;

        overlay.appendChild(modalWindow);
        desktopShell.appendChild(overlay);

        void overlay.offsetWidth; 
        overlay.classList.add('active');

        overlay.querySelector(`.${closeClass}`).addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 200);
        });

        return overlay.querySelector(`.${bodyClass}`);
    }

    // ==========================================
    // 5. 가짜 API (Mock Data) 함수들
    // ==========================================
    async fetchHistoryDataFromServer() {
        return new Promise(resolve => setTimeout(() => resolve([
            { field: '네트워크', totalCount: 45, accuracy: 82 },
            { field: '웹 보안', totalCount: 30, accuracy: 65 },
            { field: '리눅스', totalCount: 20, accuracy: 90 },
            { field: '보안 법규', totalCount: 15, accuracy: 40 }
        ]), 500));
    }

    async fetchDetailedLogsFromServer(fieldName) {
        return new Promise(resolve => setTimeout(() => resolve([
            { sub_category: 'SSL/TLS', question: '핸드쉐이크 과정 중 서버가 클라이언트에게 전달하는 것은?', answer: '서버 인증서', attempt_count: 1, is_cleared: true },
            { sub_category: '포트 스캐닝', question: '은밀하게 열린 포트를 확인하는 스캔 기법은?', answer: 'Stealth Scan', attempt_count: 3, is_cleared: false },
            { sub_category: '방화벽', question: 'Stateless와 Stateful 방화벽의 가장 큰 차이점은?', answer: 'Session 추적 여부', attempt_count: 2, is_cleared: true }
        ]), 600));
    }

    async fetchVulnDataFromServer() {
        return new Promise(resolve => setTimeout(() => resolve([
            { fieldName: '네트워크', subCategories: [
                { name: 'SSL/TLS 핸드쉐이크', accuracy: 85, difficulty: 4 },
                { name: '포트 스캐닝', accuracy: 40, difficulty: 2 },
                { name: '방화벽 룰셋 구조', accuracy: 55, difficulty: 5 }
            ]},
            { fieldName: '웹 보안', subCategories: [
                { name: 'SQL Injection', accuracy: 90, difficulty: 3 },
                { name: 'XSS', accuracy: 65, difficulty: 4 }
            ]}
        ]), 600));
    }

    async fetchRankingData() {
        return new Promise(resolve => setTimeout(() => resolve([
            { rank: 1, nickname: 'HackMaster99', score: 12500, isMe: false },
            { rank: 2, nickname: 'SecuPro', score: 11200, isMe: false },
            { rank: 3, nickname: 'Alice', score: 10500, isMe: false },
            { rank: 4, nickname: 'Bob', score: 9800, isMe: false },
            { rank: 15, nickname: 'Player(나)', score: 4500, isMe: true }
        ]), 500));
    }

    async fetchAchievementData() {
        return new Promise(resolve => setTimeout(() => resolve([
            { title: '첫 걸음', desc: '첫 문제를 해결했습니다.', unlocked: true },
            { title: '네트워크 마스터', desc: '네트워크 분야의 스파이를 찾았습니다.', unlocked: true },
            { title: '퍼펙트 클리어', desc: '오답 없이 클리어했습니다.', unlocked: false }
        ]), 500));
    }
}
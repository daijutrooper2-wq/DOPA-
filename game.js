        const firebaseConfig = {
            apiKey: "AIzaSyDcg_dK3F59_A-paZq4tjIW4ie1LNjLucA",
            authDomain: "dopa-b5f00.firebaseapp.com",
            projectId: "dopa-b5f00",
            storageBucket: "dopa-b5f00.firebasestorage.app",
            messagingSenderId: "945171468237",
            appId: "1:945171468237:web:08e2cfe173e65a5693be84",
            measurementId: "G-KT3YCNWLPR"
        };
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'dopa-kingdom-rpg';
        window.fbAppId = appId;
        window.fbUser = null;

        const firebaseReady = (async () => {
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
            const { getAuth, signInAnonymously, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
            const { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, deleteDoc, collection, addDoc, getDocs, query, orderBy, limit } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

            window.fbApp = initializeApp(firebaseConfig);
            window.fbDb = getFirestore(window.fbApp);
            window.fbAuth = getAuth(window.fbApp);

            window.fbDoc = doc;
            window.fbSetDoc = setDoc;
            window.fbGetDoc = getDoc;
            window.fbUpdateDoc = updateDoc;
            window.fbOnSnapshot = onSnapshot;
            window.fbDeleteDoc = deleteDoc;
            window.fbCollection = collection;
            window.fbAddDoc = addDoc;
            window.fbGetDocs = getDocs;
            window.fbQuery = query;
            window.fbOrderBy = orderBy;
            window.fbLimit = limit;

            window._firebaseAuthHelpers = { signInAnonymously, onAuthStateChanged };
        })().catch((err) => {
            console.warn("Firebase SDK load error:", err);
        });

        window.initFirebaseOnline = async function() {
            await firebaseReady;
            if (!window.fbAuth || !window._firebaseAuthHelpers) return false;
            const { signInAnonymously, onAuthStateChanged } = window._firebaseAuthHelpers;
            return new Promise((resolve) => {
                onAuthStateChanged(window.fbAuth, async (user) => {
                    if (user) {
                        window.fbUser = user;
                        resolve(true);
                    } else {
                        try {
                            const userCred = await signInAnonymously(window.fbAuth);
                            window.fbUser = userCred.user;
                            resolve(true);
                        } catch (err) {
                            console.warn("Firebase Auth Error:", err);
                            resolve(false);
                        }
                    }
                });
            });
        };

        class CharacterRenderer {
            // 4. 画像のキャッシュ管理用オブジェクト
            static imageCache = {};

            static getImage(src) {
                if (!src) return null;
                if (!this.imageCache[src]) {
                    const img = new Image();
                    img.isLoaded = false;
                    img.hasError = false;
                    img.onload = () => { 
                        img.isLoaded = true; 
                        if (typeof updateBattleUI === 'function') updateBattleUI();
                        // DOM上の全キャンバスを再描画して最新画像を確実に反映
                        document.querySelectorAll('canvas').forEach(cvs => {
                            const id = cvs.id;
                            if (id.startsWith('select-cvs-') || id.startsWith('new-select-cvs-')) {
                                const charId = id.replace('select-cvs-', '').replace('new-select-cvs-', '');
                                CharacterRenderer.drawCharacter(cvs, charId);
                            } else if (id.startsWith('zukan-cvs-')) {
                                const charId = id.replace('zukan-cvs-', '');
                                CharacterRenderer.drawCharacter(cvs, charId);
                            } else if (id.startsWith('icon-sel-cvs-')) {
                                CharacterRenderer.drawCharacter(cvs, id.replace('icon-sel-cvs-', ''));
                            } else if (id.startsWith('usage-cvs-')) {
                                CharacterRenderer.drawCharacter(cvs, id.replace('usage-cvs-', ''));
                            } else if (id.startsWith('op-cvs-')) {
                                CharacterRenderer.drawCharacter(cvs, id.replace('op-cvs-', ''));
                            } else if ((id === 'header-profile-icon' || id === 'home-profile-icon' || id === 'new-battle-profile-icon') && typeof playerState !== 'undefined') {
                                CharacterRenderer.drawCharacter(cvs, playerState.selectedIcon || 'courtney');
                            } else if (id === 'profile-main-icon' && typeof playerState !== 'undefined') {
                                CharacterRenderer.drawCharacter(cvs, playerState.selectedIcon || 'courtney');
                            } else if (id === 'zukan-detail-cvs') {
                                const currentDetailId = window.lastZukanDetailId || 'courtney';
                                CharacterRenderer.drawCharacter(cvs, currentDetailId);
                            } else if (id === 'gacha-reveal-cvs') {
                                const currentGachaId = window.lastGachaRevealId || 'courtney';
                                CharacterRenderer.drawCharacter(cvs, currentGachaId);
                            } else if (id === 'opp-profile-cvs') {
                                CharacterRenderer.drawCharacter(cvs, window.lastOppIcon || 'pasha');
                            } else if (id === 'p1-canvas' && typeof activeBattle !== 'undefined' && activeBattle && activeBattle.p1) {
                                const isCharged = (activeBattle.p1.id === 'courtney' && (activeBattle.p1.courtneyChargeCount || 0) > 0) || (activeBattle.p1.id === 'dopagaking' && (activeBattle.p1.dopaChargeCount || 0) > 0 && (activeBattle.p1.dopaChargeCount || 0) < 6);
                                const renderId = (activeBattle.p1.id === 'dopagaking' && (activeBattle.p1.dopaChargeCount || 0) >= 6 && activeBattle.p1.selectedInheritChar) ? activeBattle.p1.selectedInheritChar : ((activeBattle.p1.id === 'pasha' && activeBattle.p1.isDarkMode) ? 'pasha_dark' : activeBattle.p1.id);
                                CharacterRenderer.drawCharacter(cvs, renderId, activeBattle.p1.isMiniZou, isCharged, activeBattle.p1.hp <= 0);
                            } else if (id === 'p2-canvas' && typeof activeBattle !== 'undefined' && activeBattle && activeBattle.p2) {
                                const isCharged = (activeBattle.p2.id === 'courtney' && (activeBattle.p2.courtneyChargeCount || 0) > 0) || (activeBattle.p2.id === 'dopagaking' && (activeBattle.p2.dopaChargeCount || 0) > 0 && (activeBattle.p2.dopaChargeCount || 0) < 6);
                                const renderId = (activeBattle.p2.id === 'dopagaking' && (activeBattle.p2.dopaChargeCount || 0) >= 6 && activeBattle.p2.selectedInheritChar) ? activeBattle.p2.selectedInheritChar : ((activeBattle.p2.id === 'pasha' && activeBattle.p2.isDarkMode) ? 'pasha_dark' : activeBattle.p2.id);
                                CharacterRenderer.drawCharacter(cvs, renderId, activeBattle.p2.isMiniZou, isCharged, activeBattle.p2.hp <= 0);
                            }
                        });
                        if (typeof renderNewBattleScreen === 'function' && typeof activeNewBattle !== 'undefined' && activeNewBattle) {
                            renderNewBattleScreen();
                        }
                    };
                    img.onerror = () => { 
                        img.hasError = true; 
                    };
                    img.src = src;
                    this.imageCache[src] = img;
                }
                return this.imageCache[src];
            }

            static drawCharacter(canvas, charId, isMiniZou = false, isCharged = false, isDead = false) {
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                const w = canvas.width;
                const h = canvas.height;

                const canvasId = canvas && canvas.id ? canvas.id : '';
                const isBattleCanvas = (canvasId === 'p1-canvas' || canvasId === 'p2-canvas');

                // 7. 特殊状態（王冠、チャージ、ミニぞう等）に応じた画像パスの判定
                let targetCharId = charId;
                if (isMiniZou && !(CHARACTER_DATA[charId] && CHARACTER_DATA[charId].chargedImage)) targetCharId = 'minizou';

                const charData = CHARACTER_DATA[targetCharId] || CHARACTER_DATA[charId] || EXTRA_ICONS[targetCharId] || EXTRA_ICONS[charId];
                let imagePath = null;
                if (charData) {
                    if (isBattleCanvas) {
                        if (isCharged && charData.chargedImage) {
                            imagePath = charData.chargedImage;
                        } else if (isDead && charData.dieImage) {
                            imagePath = charData.dieImage;
                        } else {
                            imagePath = charData.image;
                        }
                    } else {
                        if (isCharged && charData.chargedImage) {
                            imagePath = charData.chargedImage;
                        } else {
                            imagePath = charData.image || charData.allImage;
                        }
                    }
                }

                const img = this.getImage(imagePath);

                // 5. 画像が設定されており、読み込み成功している場合は画像を描画
                if (img && img.isLoaded && !img.hasError) {
                    ctx.clearRect(0, 0, w, h);
                    ctx.imageSmoothingEnabled = false; // 8. ピクセルアートがぼやけない設定

                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(0, 0, w, h);

                    // 影の描画（既存演出を維持）
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.beginPath();
                    ctx.ellipse(w / 2, h - 10, w * 0.38, h * 0.09, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // 8. 縦横比を維持してCanvas内に収める
                    const hRatio = w / img.width;
                    const vRatio = h / img.height;
                    const ratio = Math.min(hRatio, vRatio) * 1.25;
                    const centerShiftX = (w - img.width * ratio) / 2;
                    const centerShiftY = (h - img.height * ratio) / 2;

                    ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
                    return;
                }

                // 3, 5. 画像未設定・ロード失敗時のフォールバック（従来のドット絵描画）
                ctx.clearRect(0, 0, w, h);
                ctx.imageSmoothingEnabled = false;

                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, w, h);

                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.beginPath();
                ctx.ellipse(w / 2, h - 10, w * 0.38, h * 0.09, 0, 0, Math.PI * 2);
                ctx.fill();

                const pixelSize = Math.max(2, Math.floor(w / 24));
                const offsetX = Math.floor((w - 32 * pixelSize) / 2);
                const offsetY = Math.floor((h - 32 * pixelSize) / 2);

                const drawPx = (x, y, color, sizeX = 1, sizeY = 1) => {
                    ctx.fillStyle = color;
                    ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, sizeX * pixelSize, sizeY * pixelSize);
                };

                if (isMiniZou) {
                    this.drawMiniZou(drawPx);
                    return;
                }

                switch (charId) {
                    case 'dopagaking': this.drawDopagaking(drawPx, false); break;
                    case 'dopagaking_charged': this.drawDopagaking(drawPx, true); break;
                    case 'dopagaking_crown': this.drawCrown(drawPx); break;
                    case 'courtney': this.drawCourtney(drawPx); break;
                    case 'courtney_charged': this.drawCourtneyCharged(drawPx); break;
                    case 'ndaihyo': this.drawNdaihyo(drawPx); break;
                    case 'pasha': this.drawPasha(drawPx); break;
                    case 'pasha_dark': this.drawPashaDark(drawPx); break;
                    case 'iwaba': this.drawIwaba(drawPx); break;
                    case 'momo': this.drawMomo(drawPx); break;
                    case 'moenan': this.drawMoenan(drawPx); break;
                    case 'asaiomizu': this.drawAsaiomizu(drawPx); break;
                    default: this.drawGeneric(drawPx); break;
                }
            }

            // --- 以下の従来の描画メソッド（drawCrown, drawDopagaking, drawCourtney 等）はそのまま残す ---

static drawCrown(p) {
                if (typeof p !== 'function') return;
                // 王冠アイコンの描画処理（チャージ1～4回目用）
                for (let y = 14; y <= 22; y++) { for (let x = 6; x <= 25; x++) p(x, y, '#f59e0b'); }
                for (let y = 18; y <= 22; y++) { for (let x = 8; x <= 23; x++) p(x, y, '#d97706'); }
                p(6, 8, '#fde047', 3, 6); p(14, 8, '#fde047', 4, 6); p(23, 8, '#fde047', 3, 6);
                p(7, 10, '#ef4444', 1, 2); p(15, 10, '#3b82f6', 2, 2); p(24, 10, '#ef4444', 1, 2);
            }


static drawDopagaking(p, isCharged) {
    if (typeof p !== 'function') return;
    // 頭部・王冠の描画
    for (let y = 6; y <= 11; y++) { for (let x = 10; x <= 21; x++) p(x, y, isCharged ? '#3b82f6' : '#f59e0b'); }
    // 王冠のトゲ
    p(10, 4, '#fde047', 2, 2); p(15, 4, '#fde047', 2, 2); p(20, 4, '#fde047', 2, 2);
    // 顔・ヒゲ・体
    for (let y = 12; y <= 26; y++) { for (let x = 9; x <= 22; x++) p(x, y, '#1e293b'); }
    p(12, 14, '#ffffff', 3, 2); p(17, 14, '#ffffff', 3, 2); // 目
    p(14, 18, '#cbd5e1', 4, 3); // ヒゲ
}




            static drawCourtney(p) {
                if (typeof p !== 'function') return;
                for (let y = 14; y <= 27; y++) { for (let x = 10; x <= 21; x++) p(x, y, '#f472b6'); }
                for (let y = 6; y <= 13; y++) { for (let x = 10; x <= 21; x++) p(x, y, '#fbcfe8'); }
                for (let x = 9; x <= 22; x++) p(x, 5, '#db2777');
                p(12, 9, '#831843', 2, 2); p(17, 9, '#831843', 2, 2);
                p(14, 12, '#e11d48', 4, 1);
            }

            static drawCourtneyCharged(p) {
                if (typeof p !== 'function') return;
                // 専用アイコン：ピンク色の円形が二つ並んでおり、それぞれの円の真ん中に「濃いピンク色の小さい点」
                for (let y = 10; y <= 22; y++) {
                    for (let x = 6; x <= 15; x++) {
                        let dx = x - 10.5; let dy = y - 16;
                        if (dx*dx + dy*dy <= 20) p(x, y, '#f472b6');
                    }
                    for (let x = 16; x <= 25; x++) {
                        let dx = x - 20.5; let dy = y - 16;
                        if (dx*dx + dy*dy <= 20) p(x, y, '#f472b6');
                    }
                }
                p(10, 16, '#831843', 2, 2);
                p(20, 16, '#831843', 2, 2);
            }

            static drawNdaihyo(p) {
                for (let y = 14; y <= 27; y++) { for (let x = 9; x <= 22; x++) p(x, y, '#1e293b'); }
                for (let y = 14; y <= 24; y++) p(15, y, '#ffffff', 2, 1);
                p(15, 16, '#ef4444', 2, 3);
                for (let y = 6; y <= 13; y++) { for (let x = 10; x <= 21; x++) p(x, y, '#fde047'); }
                for (let x = 9; x <= 22; x++) p(x, 5, '#0f172a');
                for (let y = 6; y <= 9; y++) { p(9, y, '#0f172a'); p(22, y, '#0f172a'); }
                p(12, 6, '#0f172a', 3, 2);
                p(11, 8, '#38bdf8', 3, 2); p(17, 8, '#38bdf8', 3, 2); p(14, 8, '#94a3b8', 3, 1);
                for (let i = 0; i < 9; i++) { p(6 - Math.floor(i/3), 21 - i, '#b45309', 2, 2); }
                p(6, 22, '#f87171', 2, 3);
            }

            static drawPasha(p) {
                for (let y = 14; y <= 28; y++) { for (let x = 8; x <= 23; x++) p(x, y, '#2e1065'); }
                for (let x = 8; x <= 23; x++) p(x, 28, '#f59e0b');
                for (let y = 14; y <= 28; y++) p(15, y, '#f59e0b');
                for (let y = 6; y <= 13; y++) { for (let x = 11; x <= 20; x++) p(x, y, '#fde047'); }
                for (let x = 10; x <= 21; x++) p(x, 5, '#1e1b4b');
                for (let y = 6; y <= 11; y++) { p(10, y, '#1e1b4b'); p(21, y, '#1e1b4b'); }
                p(15, 6, '#1e1b4b'); p(15, 7, '#1e1b4b');
                p(13, 9, '#ef4444'); p(18, 9, '#ef4444');
                p(6, 16, '#38bdf8', 3, 5); p(7, 17, '#ffffff', 1, 3);
                p(22, 16, '#94a3b8', 3, 3); p(23, 15, '#c084fc', 2, 2);
            }

            static drawPashaDark(p) {
                for (let y = 14; y <= 28; y++) { for (let x = 8; x <= 23; x++) p(x, y, '#0f0728'); }
                for (let x = 8; x <= 23; x++) p(x, 28, '#7c3aed');
                for (let y = 14; y <= 28; y++) p(15, y, '#7c3aed');
                for (let y = 6; y <= 13; y++) { for (let x = 11; x <= 20; x++) p(x, y, '#fde047'); }
                for (let x = 10; x <= 21; x++) p(x, 5, '#090514');
                for (let y = 6; y <= 11; y++) { p(10, y, '#090514'); p(21, y, '#090514'); }
                p(13, 9, '#dc2626'); p(18, 9, '#dc2626');
                p(6, 16, '#c084fc', 3, 5); p(7, 17, '#ffffff', 1, 3);
                p(22, 16, '#7c3aed', 3, 3); p(23, 15, '#ef4444', 2, 2);
            }

            static drawIwaba(p) {
                for (let y = 14; y <= 27; y++) { for (let x = 9; x <= 22; x++) p(x, y, '#15803d'); }
                for (let y = 15; y <= 26; y++) { p(9, y, '#f97316', 3, 1); p(20, y, '#f97316', 3, 1); }
                for (let y = 6; y <= 13; y++) { for (let x = 10; x <= 21; x++) p(x, y, '#4ade80'); }
                for (let x = 9; x <= 22; x++) p(x, 5, '#94a3b8');
                for (let y = 6; y <= 10; y++) { p(9, y, '#94a3b8'); p(22, y, '#94a3b8'); }
                p(15, 6, '#475569');
                p(12, 8, '#000000', 8, 3); p(13, 9, '#38bdf8', 2, 1); p(17, 9, '#38bdf8', 2, 1);
                p(13, 14, '#facc15', 6, 2); p(6, 17, '#64748b', 3, 4);
            }

            static drawMomo(p) {
                for (let y = 13; y <= 28; y++) { for (let x = 7; x <= 24; x++) p(x, y, '#ec4899'); }
                for (let y = 15; y <= 26; y++) { for (let x = 12; x <= 19; x++) p(x, y, '#be185d'); }
                p(14, 18, '#fef08a', 4, 4);
                for (let y = 5; y <= 12; y++) { for (let x = 10; x <= 21; x++) p(x, y, '#fbcfe8'); }
                for (let x = 9; x <= 22; x++) p(x, 4, '#db2777');
                for (let y = 5; y <= 9; y++) { p(9, y, '#db2777'); p(22, y, '#db2777'); }
                p(15, 5, '#9d174d');
                p(12, 8, '#831843', 2, 2); p(18, 8, '#831843', 2, 2);
                p(5, 14, '#7e22ce', 3, 4); p(6, 13, '#22c55e', 2, 1);
            }

            static drawMiniZou(p) {
                for (let y = 10; y <= 26; y++) { for (let x = 8; x <= 24; x++) p(x, y, '#60a5fa'); }
                for (let y = 8; y <= 18; y++) { p(4, y, '#93c5fd', 4, 1); p(24, y, '#93c5fd', 4, 1); }
                p(12, 12, '#1e3a8a', 2, 3); p(20, 12, '#1e3a8a', 2, 3);
                p(13, 13, '#ffffff', 1, 1); p(21, 13, '#ffffff', 1, 1);
                p(15, 16, '#3b82f6', 3, 7); p(16, 21, '#3b82f6', 4, 3);
                p(20, 20, '#7e22ce', 4, 5); p(21, 19, '#22c55e', 2, 1);
            }

            static drawMoenan(p) {
                for (let y = 14; y <= 27; y++) { for (let x = 10; x <= 21; x++) p(x, y, '#991b1b'); }
                p(13, 16, '#f87171', 6, 2);
                for (let y = 7; y <= 13; y++) { for (let x = 10; x <= 21; x++) p(x, y, '#ffedd5'); }
                p(15, 1, '#ef4444', 2, 6); p(15, 1, '#fde047', 2, 2);
                p(11, 3, '#ef4444', 3, 5); p(8, 5, '#ef4444', 3, 4); p(7, 4, '#fde047', 2, 2);
                p(18, 3, '#ef4444', 3, 5); p(21, 5, '#ef4444', 3, 4); p(22, 4, '#fde047', 2, 2);
                p(12, 9, '#000000', 3, 2); p(17, 9, '#000000', 3, 2); p(13, 9, '#ef4444', 1, 1);
                p(7, 18, '#dc2626', 3, 3); p(22, 18, '#dc2626', 3, 3);
            }

            static drawAsaiomizu(p) {
                for (let y = 3; y <= 9; y++) {
                    for (let x = 8; x <= 23; x++) {
                        if ((x + y) % 2 === 0) p(x, y, '#78350f');
                        else p(x, y, '#451a03');
                    }
                }
                p(7, 4, '#78350f', 2, 2); p(23, 4, '#78350f', 2, 2);
                p(6, 6, '#451a03', 2, 3); p(24, 6, '#451a03', 2, 3);
                for (let y = 9; y <= 15; y++) { for (let x = 10; x <= 21; x++) p(x, y, '#fed7aa'); }
                p(12, 11, '#000000', 2, 2); p(18, 11, '#000000', 2, 1); p(15, 13, '#f43f5e', 2, 1);
                for (let y = 16; y <= 27; y++) { for (let x = 9; x <= 22; x++) p(x, y, '#0284c7'); }
                p(14, 16, '#ffffff', 4, 6);
                p(20, 24, '#ffffff', 5, 5); p(21, 25, '#000000', 3, 3);
            }

            static drawGeneric(p) {
                for (let y = 8; y <= 24; y++) { for (let x = 8; x <= 24; x++) p(x, y, '#6b7280'); }
            }
        }

        window.batteryState = {
            supported: false,
            level: 100,
            charging: false
        };

        function initBatteryManager() {
            if (window._batteryManagerInitialized) {
                updateBatteryDisplay();
                return;
            }
            window._batteryManagerInitialized = true;

            if (typeof navigator !== 'undefined' && typeof navigator.getBattery === 'function') {
                navigator.getBattery().then(battery => {
                    window.batteryState.supported = true;
                    const syncBattery = () => {
                        window.batteryState.level = Math.round((battery.level || 1) * 100);
                        window.batteryState.charging = !!battery.charging;
                        updateBatteryDisplay();
                    };
                    syncBattery();
                    try {
                        battery.addEventListener('levelchange', syncBattery);
                        battery.addEventListener('chargingchange', syncBattery);
                    } catch (e) {}
                }).catch(() => {
                    window.batteryState.supported = false;
                    updateBatteryDisplay();
                });
            } else {
                window.batteryState.supported = false;
                updateBatteryDisplay();
            }
        }

        function updateBatteryDisplay() {
            const el = document.getElementById('battle-battery-status');
            if (!el) return;

            const { supported, level, charging } = window.batteryState;
            if (!supported) {
                el.innerHTML = `<span class="text-slate-400 font-mono text-[9px] sm:text-[10px] flex items-center gap-0.5" title="バッテリー非対応">🔋 --%</span>`;
                return;
            }

            let icon = '🔋';
            let colorClass = 'text-emerald-400';
            if (charging) {
                icon = '⚡🔋';
                colorClass = 'text-amber-300 animate-pulse';
            } else if (level <= 20) {
                icon = '🪫';
                colorClass = 'text-red-400 font-bold animate-bounce';
            } else if (level <= 50) {
                icon = '🔋';
                colorClass = 'text-amber-300';
            }

            el.innerHTML = `<span class="${colorClass} font-mono text-[9px] sm:text-[10px] font-bold flex items-center gap-0.5 drop-shadow-sm" title="${charging ? '充電中' : 'バッテリー残量'}">${icon} ${level}%</span>`;
        }
        window.initBatteryManager = initBatteryManager;
        window.updateBatteryDisplay = updateBatteryDisplay;

        class SoundSystem {
            constructor() {
                this.ctx = null;
                this.enabled = true;
                this.bgmEnabled = false;
                this.bgmInterval = null;
                this.bgmStep = 0;
                this.volume = 0.5;
                this.hasUserInteracted = false;

                const unlockAudio = () => {
                    this.hasUserInteracted = true;
                    if (this.ctx && this.ctx.state === 'suspended') {
                        this.ctx.resume().catch(() => {});
                    }
                    ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
                        window.removeEventListener(evt, unlockAudio);
                    });
                };
                ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
                    window.addEventListener(evt, unlockAudio, { once: true });
                });
            }

            init() {
                if (!this.enabled || !this.hasUserInteracted) return;
                if (!this.ctx) {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) {
                        try {
                            this.ctx = new AudioCtx();
                        } catch (e) {}
                    }
                }
                if (this.ctx && this.ctx.state === 'suspended') {
                    try {
                        this.ctx.resume().catch(() => {});
                    } catch (e) {}
                }
            }

            toggleSound() {
                this.enabled = !this.enabled;
                const statusEl = document.getElementById('sound-status');
                if (statusEl) statusEl.innerText = this.enabled ? 'ON' : 'OFF';
                if (this.enabled) this.playSelect();
            }

            toggleBGM() {
                this.bgmEnabled = !this.bgmEnabled;
                const statusEl = document.getElementById('bgm-status');
                if (statusEl) statusEl.innerText = this.bgmEnabled ? 'ON' : 'OFF';
                if (this.bgmEnabled) this.startBGM(); else this.stopBGM();
            }

            startBGM() {
                this.stopBGM();
                if (!this.bgmEnabled) return;
                this.init();
                if (!this.ctx) return;

                const melody = [261.63, 293.66, 329.63, 392.00, 329.63, 392.00, 440.00, 523.25];
                const bass = [130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00];

                this.bgmStep = 0;
                let nextNoteTime = this.ctx.currentTime + 0.05;
                const noteDuration = 0.12;
                const intervalTime = 0.16;

                this.bgmInterval = setInterval(() => {
                    if (!this.bgmEnabled || !this.ctx) return;
                    if (this.ctx.state === 'suspended') return;

                    try {
                        while (nextNoteTime < this.ctx.currentTime + 0.4) {
                            const note = melody[this.bgmStep % melody.length];
                            const bassNote = bass[Math.floor(this.bgmStep / 2) % bass.length];
                            
                            this.playScheduledTone(note, noteDuration, 'square', 0.03, nextNoteTime);
                            this.playScheduledTone(bassNote, 0.15, 'triangle', 0.05, nextNoteTime);
                            
                            this.bgmStep++;
                            nextNoteTime += intervalTime;
                        }
                    } catch (e) {}
                }, 100);
            }

            stopBGM() {
                if (this.bgmInterval) {
                    clearInterval(this.bgmInterval);
                    this.bgmInterval = null;
                }
            }

            playScheduledTone(freq, duration, type = 'square', gainValue = 0.08, startTime) {
                if (!this.enabled || !this.ctx) return;
                try {
                    const startT = startTime !== undefined ? startTime : this.ctx.currentTime;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = type;
                    osc.frequency.setValueAtTime(freq, startT);
                    const finalGain = gainValue * (this.volume !== undefined ? this.volume : 0.5);
                    gain.gain.setValueAtTime(finalGain, startT);
                    gain.gain.exponentialRampToValueAtTime(0.0001, startT + duration);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(startT);
                    osc.stop(startT + duration);
                } catch(e) {}
            }

            playTone(freq, duration, type = 'square', gainValue = 0.08) {
                this.playScheduledTone(freq, duration, type, gainValue, this.ctx ? this.ctx.currentTime : null);
            }

            playSelect() { this.playTone(440, 0.08, 'square', 0.08); }
            playHit() {
                if (!this.enabled) return;
                this.init();
                try {
                    const bufferSize = this.ctx.sampleRate * 0.12;
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const output = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
                    const whiteNoise = this.ctx.createBufferSource();
                    whiteNoise.buffer = buffer;
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(900, this.ctx.currentTime);
                    const gain = this.ctx.createGain();
                    const hitGain = 0.25 * (this.volume !== undefined ? this.volume : 0.5);
                    gain.gain.setValueAtTime(hitGain, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
                    whiteNoise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
                    whiteNoise.start();
                } catch(e) {}
            }
            playHeal() {
                if (!this.enabled) return;
                this.playTone(523.25, 0.09, 'sine', 0.1);
                setTimeout(() => this.playTone(659.25, 0.09, 'sine', 0.1), 70);
                setTimeout(() => this.playTone(783.99, 0.12, 'sine', 0.1), 140);
                setTimeout(() => this.playTone(1046.50, 0.22, 'sine', 0.1), 210);
            }
            playBuff() {
                if (!this.enabled) return;
                this.playTone(300, 0.08, 'sawtooth', 0.08);
                setTimeout(() => this.playTone(450, 0.08, 'sawtooth', 0.08), 60);
                setTimeout(() => this.playTone(600, 0.12, 'sawtooth', 0.08), 120);
            }
            playSpecial() {
                if (!this.enabled) return;
                this.playTone(220, 0.1, 'sawtooth', 0.12);
                setTimeout(() => this.playTone(440, 0.1, 'square', 0.12), 90);
                setTimeout(() => this.playTone(330, 0.1, 'sawtooth', 0.12), 180);
                setTimeout(() => this.playTone(660, 0.2, 'square', 0.15), 270);
            }
            playVictory() {
                if (!this.enabled) return;
                const notes = [523.25, 659.25, 783.99, 1046.50, 880.00, 1046.50];
                notes.forEach((freq, idx) => setTimeout(() => this.playTone(freq, 0.18, 'triangle', 0.15), idx * 130));
            }
            playDefeat() {
                if (!this.enabled) return;
                const notes = [440, 392, 349, 220];
                notes.forEach((freq, idx) => setTimeout(() => this.playTone(freq, 0.25, 'sawtooth', 0.15), idx * 180));
            }
            playCharacterSound(charId) {
                if (!this.enabled) return;
                switch (charId) {
                    case 'courtney':
                        this.playTone(587.33, 0.08, 'sine', 0.1);
                        setTimeout(() => this.playTone(880.00, 0.15, 'sine', 0.12), 60);
                        break;
                    case 'pasha':
                    case 'pasha_dark':
                        this.playTone(1200, 0.04, 'square', 0.15);
                        setTimeout(() => this.playTone(800, 0.06, 'sawtooth', 0.1), 30);
                        break;
                    case 'ndaihyo':
                        this.playTone(880, 0.05, 'square', 0.15);
                        setTimeout(() => this.playTone(1760, 0.08, 'triangle', 0.15), 40);
                        break;
                    case 'dopagaking':
                        [523, 659, 783, 1046].forEach((f, i) => setTimeout(() => this.playTone(f, 0.06, 'triangle', 0.08), i * 50));
                        break;
                    case 'iwaba':
                        this.playTone(110, 0.1, 'sawtooth', 0.12);
                        setTimeout(() => this.playTone(220, 0.1, 'square', 0.1), 80);
                        break;
                    case 'momo':
                        this.playTone(150, 0.15, 'sine', 0.15);
                        setTimeout(() => this.playTone(100, 0.2, 'triangle', 0.12), 100);
                        break;
                    case 'moenan':
                        this.playTone(300, 0.06, 'sawtooth', 0.12);
                        setTimeout(() => this.playTone(150, 0.12, 'square', 0.15), 50);
                        break;
                    case 'asaiomizu':
                        this.playTone(660, 0.05, 'sine', 0.12);
                        setTimeout(() => this.playTone(990, 0.1, 'triangle', 0.12), 50);
                        break;
                    default:
                        this.playHit();
                        break;
                }
            }

            playOpeningMelody() {
                if (!this.enabled) return;
                const notes = [220, 246.94, 261.63, 329.63, 392.00, 440.00, 523.25, 659.25];
                notes.forEach((freq, idx) => setTimeout(() => this.playTone(freq, 0.12, 'square', 0.08), idx * 110));
            }

            playAwakeningSound() {
                if (!this.enabled) return;
                this.playTone(150, 0.3, 'sawtooth', 0.1);
                setTimeout(() => this.playTone(300, 0.3, 'triangle', 0.12), 150);
                setTimeout(() => this.playTone(600, 0.4, 'sine', 0.15), 300);
            }

            playCutinSound() {
                if (!this.enabled) return;
                this.playTone(440, 0.08, 'square', 0.15);
                setTimeout(() => this.playTone(880, 0.12, 'sawtooth', 0.15), 60);
            }

            playClashSound() {
                if (!this.enabled) return;
                this.playTone(100, 0.25, 'sawtooth', 0.2);
                setTimeout(() => this.playTone(200, 0.15, 'square', 0.15), 100);
                setTimeout(() => this.playTone(80, 0.35, 'triangle', 0.25), 200);
            }

            playTitleSound() {
                if (!this.enabled) return;
                const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                notes.forEach((freq, idx) => setTimeout(() => this.playTone(freq, 0.22, 'triangle', 0.18), idx * 120));
            }

            playCrit() {
                if (!this.enabled) return;
                this.playTone(440, 0.08, 'square', 0.15);
                setTimeout(() => this.playTone(880, 0.12, 'square', 0.2), 60);
                setTimeout(() => this.playTone(1320, 0.2, 'triangle', 0.25), 120);
            }

            playEvade() {
                if (!this.enabled) return;
                this.init();
                try {
                    const bufferSize = this.ctx.sampleRate * 0.1;
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const output = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
                    }
                    const whiteNoise = this.ctx.createBufferSource();
                    whiteNoise.buffer = buffer;
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'highpass';
                    filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
                    const gain = this.ctx.createGain();
                    gain.gain.setValueAtTime(0.2 * (this.volume !== undefined ? this.volume : 0.5), this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
                    whiteNoise.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.ctx.destination);
                    whiteNoise.start();

                    const osc = this.ctx.createOscillator();
                    const oscGain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
                    oscGain.gain.setValueAtTime(0.15 * (this.volume !== undefined ? this.volume : 0.5), this.ctx.currentTime);
                    oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
                    osc.connect(oscGain);
                    oscGain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.1);
                } catch(e) {}
            }
        }
        const audioSystem = new SoundSystem();

        let playerState = {
            dopa: 1000,
            unlockedChars: [], 
            unlockedIcons: ['dopagaking'],
            selectedPlayerChar: null,
            selectedEnemyChar: 'pasha',
            playerName: '名無しファイター',
            playerId: 'DP-' + Math.floor(1000 + Math.random() * 9000),
            startDate: new Date().toLocaleDateString('ja-JP'),
            selectedIcon: 'dopagaking',
            isFirstTime: true,
            skipOpening: false,
            totalBattles: 0,
            wins: 0,
            losses: 0,
            charUsage: {},
            battleHistory: [],
            lastDailyBonusDate: null,
            volume: 0.5,
            newBattleCustomStats: {}
        };

        // 経済システム・DOPA管理用変数



        let openingTimer = null;
        let openingKeyHandler = null;
        let activeBattle = null;

        function cleanupOpening() {
            if (openingTimer) {
                clearTimeout(openingTimer);
                openingTimer = null;
            }
            if (openingKeyHandler) {
                window.removeEventListener('keydown', openingKeyHandler);
                openingKeyHandler = null;
            }
        }

        function finishOpening() {
            cleanupOpening();
            if (playerState.isFirstTime) {
                promptFirstTimeProfileName();
            } else {
                renderHomeScreen();
            }
        }

        function playOpeningAgain() {
            closeSettingsPanel();
            renderOpeningScreen();
        }

        function toggleSkipOpening() {
            playerState.skipOpening = !playerState.skipOpening;
            savePlayerState();
            openSettingsPanel();
        }

        function promptFirstTimeProfileName() {
            audioSystem.playSelect();
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const overlay = document.getElementById('modal-overlay');
            const actionsEl = document.getElementById('modal-actions');

            if (titleEl) titleEl.innerText = "🌟 ファイター登録";
            if (bodyEl) {
                bodyEl.innerHTML = `
                    <div class="text-center space-y-2 py-1">
                        <div class="text-left mb-2">
                            <label class="text-xs text-amber-300 font-bold block mb-1">あなたのファイター名を入力してください：</label>
                            <input id="first-name-input" type="text" value="${playerState.playerName || '名無しファイター'}" maxlength="12" class="pixel-box bg-slate-950 px-3 py-1.5 text-sm font-bold text-amber-300 w-full outline-none border-amber-600">
                        </div>
                        <p class="text-[11px] text-amber-300 font-bold font-pixel">🎉 新規プレイヤー特典！ 🎉</p>
                        <p class="text-[11px] text-slate-200 leading-normal font-mono">
                            ドパガキングダムへようこそ！<br>
                            新規特典として <b class="text-amber-400">1000 DOPA</b> をプレゼントしました！
                        </p>
                    </div>
                `;
            }
            if (actionsEl) {
                actionsEl.innerHTML = `<button onclick="completeFirstTimeSetup()" class="pixel-btn pixel-btn-primary px-8 py-2 font-bold text-sm">冒険へ出発！ ▶</button>`;
            }
            if (overlay) {
                overlay.classList.remove('hidden');
                document.body.classList.add('modal-open');
            }
        }

        async function completeFirstTimeSetup() {
            audioSystem.playSelect();
            const input = document.getElementById('first-name-input');
            if (input) {
                const name = input.value.trim();
                if (name) playerState.playerName = name;
            }
            playerState.isFirstTime = false;
            playerState.dopa = 1000;
            playerState.unlockedChars = [];
            playerState.unlockedIcons = ['dopagaking'];
            playerState.selectedPlayerChar = null;
            playerState.selectedIcon = 'dopagaking';
            await savePlayerState();
            updateHeaderProfile();
            const dopaEl = document.getElementById('dopa-count');
            if (dopaEl) dopaEl.innerText = formatDopa(playerState.dopa);
            closeModal();
            renderHomeScreen();
        }

        function renderOpeningScreen(startScene = 1) {
            if (activeBattle) {
                activeBattle.destroy();
                activeBattle = null;
            }
            cleanupOpening();

            const container = document.getElementById('screen-container');
            if (!container) {
                setTimeout(() => renderOpeningScreen(startScene), 50);
                return;
            }
            
            const handleSkip = () => {
                cleanupOpening();
                finishOpening();
            };

            openingKeyHandler = (e) => {
                if (['Enter', 'Space', 'Escape'].includes(e.code) || e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleSkip();
                }
            };
            window.addEventListener('keydown', openingKeyHandler);

            const renderScene = (sceneNum) => {
                const currentContainer = document.getElementById('screen-container');
                if (!currentContainer || !currentContainer.innerHTML || !currentContainer.innerHTML.includes('opening-stage')) {
                    return;
                }

                const stage = document.getElementById('opening-stage');
                if (!stage) return;

                switch (sceneNum) {
                    case 1:
                        audioSystem.playAwakeningSound();
                        stage.innerHTML = `
                            <div class="flex flex-col items-center justify-center space-y-6 animate-cutin w-full px-2 sm:px-4">
                                <div class="pixel-box-gold p-8 bg-black/90 w-full text-center relative overflow-hidden border-amber-400">
                                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div class="w-32 h-32 bg-amber-500/20 rounded-full animate-opening-pulse blur-xl"></div>
                                    </div>
                                    <h3 class="text-xs sm:text-sm text-amber-300 font-mono tracking-widest mb-2">SCENE 1 : AWAKENING</h3>
                                    <h2 class="text-xl sm:text-2xl font-bold text-amber-400 font-pixel mb-4">🌟 DOPAエネルギーの覚醒 🌟</h2>
                                    <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
                                        静まり返った宇宙の闇から、王国を包み込む<br>神聖なるエネルギー「DOPA」の核が今、目覚めようとしている……！
                                    </p>
                                </div>
                            </div>
                        `;
                        openingTimer = setTimeout(() => renderScene(2), 3500);
                        break;

                    case 2:
                        audioSystem.playOpeningMelody();
                        stage.innerHTML = `
                            <div class="flex flex-col items-center justify-center space-y-6 animate-cutin w-full">
                                <div class="pixel-box p-8 bg-slate-950 w-full max-w-lg text-center relative overflow-hidden border-blue-500">
                                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                                        <div class="w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                    </div>
                                    <h3 class="text-xs sm:text-sm text-blue-300 font-mono tracking-widest mb-2">SCENE 2 : DOPAGA KINGDOM</h3>
                                    <h2 class="text-xl sm:text-2xl font-bold text-blue-400 font-pixel mb-4">👑 黄金と光のドパガ王国 👑</h2>
                                    <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
                                        溢れるDOPAの光に導かれ、<br>栄光あるドパガキングダムの城塞が悠然と姿を現す！
                                    </p>
                                </div>
                            </div>
                        `;
                        openingTimer = setTimeout(() => renderScene(3), 3500);
                        break;

                    case 3:
                        audioSystem.playCutinSound();
                        stage.innerHTML = `
                            <div class="flex flex-col items-center justify-center space-y-4 animate-cutin w-full">
                                <h3 class="text-xs sm:text-sm text-pink-400 font-mono tracking-widest">SCENE 3 : FIGHTERS ASSEMBLE</h3>
                                <h2 class="text-lg sm:text-xl font-bold text-amber-300 font-pixel mb-2">⚡ 伝説のファイターたち集結 ⚡</h2>
                                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
                                     <div class="pixel-box p-3 bg-slate-900 flex flex-col items-center animate-cutin border-pink-400">
                                        <canvas id="op-cvs-courtney" width="92" height="92" class="pixel-box bg-slate-950 mb-1"></canvas>
                                        <span class="text-xs font-bold text-pink-300">コートニー</span>
                                    </div>
                                    <div class="pixel-box p-3 bg-slate-900 flex flex-col items-center animate-cutin border-yellow-400">
                                        <canvas id="op-cvs-ndaihyo" width="92" height="92" class="pixel-box bg-slate-950 mb-1"></canvas>
                                        <span class="text-xs font-bold text-yellow-300">N高代表</span>
                                    </div>
                                    <div class="pixel-box p-3 bg-slate-900 flex flex-col items-center animate-cutin border-purple-400">
                                        <canvas id="op-cvs-pasha" width="92" height="92" class="pixel-box bg-slate-950 mb-1"></canvas>
                                        <span class="text-xs font-bold text-purple-300">パシャ憎</span>
                                    </div>
                                    <div class="pixel-box p-3 bg-slate-900 flex flex-col items-center animate-cutin border-amber-400">
                                        <canvas id="op-cvs-dopagaking" width="92" height="92" class="pixel-box bg-slate-950 mb-1"></canvas>
                                        <span class="text-xs font-bold text-amber-400">SPドパガキング</span>
                                    </div>
                                </div>
                                <p class="text-xs text-slate-300 font-mono mt-2">王国に迫る闇を払うため、<br>個性豊かな最強の挑戦者たちが今ここに立ち上がる！</p>
                            </div>
                        `;
                        setTimeout(() => {
                            ['courtney', 'ndaihyo', 'pasha', 'dopagaking'].forEach(id => {
                                const cvs = document.getElementById(`op-cvs-${id}`);
                                if (cvs) CharacterRenderer.drawCharacter(cvs, id);
                            });
                        }, 50);
                        openingTimer = setTimeout(() => renderScene(4), 4000);
                        break;

                    case 4:
                        audioSystem.playClashSound();
                        stage.innerHTML = `
                            <div class="flex flex-col items-center justify-center space-y-6 animate-opening-shake w-full">
                                <div class="pixel-box p-8 bg-red-950/90 w-full max-w-lg text-center border-red-500 shadow-2xl">
                                    <h3 class="text-xs sm:text-sm text-red-300 font-mono tracking-widest mb-2">SCENE 4 : CLASH</h3>
                                    <h2 class="text-xl sm:text-2xl font-bold text-yellow-300 font-pixel mb-4">💥 激突・光と闇の決戦 💥</h2>
                                     <p class="text-xs sm:text-sm text-slate-100 leading-relaxed font-mono">
                                         交錯するエネルギーと熱気！<br>熱き激闘の幕が、今まさに切って落とされる！
                                     </p>
                                </div>
                            </div>
                        `;
                        openingTimer = setTimeout(() => renderScene(5), 3000);
                        break;

                    case 5:
                        audioSystem.playTitleSound();
                        stage.innerHTML = `
                            <div class="flex flex-col items-center justify-center space-y-6 animate-logo-glow w-full">
                                <div class="pixel-box-gold p-8 bg-amber-950/95 w-full max-w-lg text-center border-4 border-amber-300 shadow-2xl relative">
                                    <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-pixel text-[10px] px-3 py-1 rounded font-bold">
                                        🌟 決定版・神バランス調整版 EX 🌟
                                    </div>
                                     <img src="images/title-1.webp" alt="DOPAGA KINGDOM" class="w-full max-w-lg sm:max-w-xl mx-auto object-contain mb-3">
                                    <p class="text-xs sm:text-sm text-amber-100 font-mono mb-6">
                                        王国に真の平和を取り戻せ！<br>最強の王者の座を掴むのは誰だ――？
                                    </p>
                                    <button onclick="finishOpening()" class="pixel-btn pixel-btn-primary px-8 py-3 text-base font-bold font-pixel shadow-lg">
                                        冒険へ出発！ ▶
                                    </button>
                                </div>
                            </div>
                        `;
                        break;
                }
            };

            container.innerHTML = `
                <div class="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto">
                    <button onclick="audioSystem.toggleSound(); updateOpeningSoundBtn();" id="opening-sound-btn" class="absolute top-2 left-2 pixel-btn text-xs px-3 py-1 font-bold z-50">
                        ${audioSystem.enabled ? '🔊 音声:ON' : '🔇 音声:OFF'}
                    </button>
                    <button onclick="finishOpening()" class="absolute top-2 right-2 pixel-btn pixel-btn-danger text-xs px-3 py-1 font-bold z-50">
                        ⏩ スキップ
                    </button>
                    <div id="opening-stage" class="w-full flex flex-col items-center justify-center my-auto">
                    </div>
                </div>
            `;

            renderScene(startScene);
        }

        function updateOpeningSoundBtn() {
            const btn = document.getElementById('opening-sound-btn');
            if (btn) {
                btn.innerHTML = audioSystem.enabled ? '🔊 音声:ON' : '🔇 音声:OFF';
            }
        }

        function formatDopa(n) {
            if (typeof n !== 'number' || isNaN(n)) return n;
            const abs = Math.abs(n);
            const sign = n < 0 ? '-' : '';
            if (abs < 10000) {
                return sign + abs.toLocaleString();
            }
            const units = ['', '万', '億', '兆', '京', '垓'];
            let unitIdx = 0;
            let val = abs;
            while (val >= 10000 && unitIdx < units.length - 1) {
                val /= 10000;
                unitIdx++;
            }
            let formatted = val.toFixed(1);
            if (formatted.endsWith('.0')) {
                formatted = formatted.slice(0, -2);
            } else if (formatted.includes('.')) {
                formatted = parseFloat(val.toFixed(2)).toString();
            }
            return sign + formatted + units[unitIdx];
        }

        async function addDopa(amount) {
            playerState.dopa += amount;
            const el = document.getElementById('dopa-count');
            if (el) el.innerText = formatDopa(playerState.dopa);
            await savePlayerState();
        }

        function updateHeaderProfile() {
            const nameEl = document.getElementById('home-profile-name') || document.getElementById('header-profile-name');
            const iconCvs = document.getElementById('home-profile-icon') || document.getElementById('header-profile-icon');
            const dopaEl = document.getElementById('home-dopa-count') || document.getElementById('dopa-count');
            if (nameEl) nameEl.innerText = playerState.playerName || '名無しファイター';
            if (iconCvs) {
                CharacterRenderer.drawCharacter(iconCvs, playerState.selectedIcon || 'dopagaking');
            }
            if (dopaEl) dopaEl.innerText = formatDopa(playerState.dopa);
        }

        async function savePlayerState() {
            if (window.fbUser && window.fbDb) {
                try {
                    const userDocRef = window.fbDoc(window.fbDb, 'users', window.fbUser.uid);
                    await window.fbSetDoc(userDocRef, {
                        dopa: playerState.dopa,
                        unlockedChars: playerState.unlockedChars,
                        unlockedIcons: playerState.unlockedIcons,
                        playerName: playerState.playerName,
                        playerId: playerState.playerId,
                        startDate: playerState.startDate,
                        selectedIcon: playerState.selectedIcon,
                        skipOpening: !!playerState.skipOpening,
                        totalBattles: playerState.totalBattles,
                        wins: playerState.wins,
                        losses: playerState.losses,
                        charUsage: playerState.charUsage,
                        battleHistory: playerState.battleHistory,
                        volume: playerState.volume,
                        updatedAt: Date.now()
                    }, { merge: true });
                } catch(e){
                    console.error("Firestore Save Player State Error:", e);
                }
            }
            try {
                localStorage.setItem('dopa_player_state', JSON.stringify(playerState));
                if (playerState.playerId) {
                    localStorage.setItem('dopa_backup_' + playerState.playerId, JSON.stringify(playerState));
                }
            } catch(e){}
        }

        async function loadPlayerState() {
            try {
                const local = localStorage.getItem('dopa_player_state');
                if (local) {
                    const parsed = JSON.parse(local);
                    Object.assign(playerState, parsed);
                    if (playerState.volume !== undefined) {
                        audioSystem.volume = playerState.volume;
                    }
                }
            } catch(e){}

            if (window.fbUser && window.fbDb) {
                try {
                    const userDocRef = window.fbDoc(window.fbDb, 'users', window.fbUser.uid);
                    const docSnap = await window.fbGetDoc(userDocRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.dopa !== undefined) playerState.dopa = data.dopa;
                        if (data.skipOpening !== undefined) playerState.skipOpening = data.skipOpening;
                        if (data.unlockedChars && Array.isArray(data.unlockedChars)) {
                            playerState.unlockedChars = data.unlockedChars;
                        }
                        if (data.unlockedIcons && Array.isArray(data.unlockedIcons)) {
                            playerState.unlockedIcons = data.unlockedIcons;
                        }
                        if (data.playerName) playerState.playerName = data.playerName;
                        if (data.playerId) playerState.playerId = data.playerId;
                        if (data.startDate) playerState.startDate = data.startDate;
                        if (data.selectedIcon) playerState.selectedIcon = data.selectedIcon;
                        if (data.totalBattles !== undefined) playerState.totalBattles = data.totalBattles;
                        if (data.wins !== undefined) playerState.wins = data.wins;
                        if (data.losses !== undefined) playerState.losses = data.losses;
                        if (data.charUsage) playerState.charUsage = data.charUsage;
                        if (data.battleHistory) playerState.battleHistory = data.battleHistory;
                        if (data.volume !== undefined) {
                            playerState.volume = data.volume;
                            audioSystem.volume = data.volume;
                        }
                    } else {
                        await savePlayerState();
                    }
                } catch(e){
                    console.error("Firestore Load Player State Error:", e);
                }
            }
            if (!playerState.playerId) {
                playerState.playerId = 'DP-' + Math.floor(1000 + Math.random() * 9000);
            }
            if (!playerState.startDate) {
                playerState.startDate = new Date().toLocaleDateString('ja-JP');
            }
            if (!playerState.unlockedIcons || !Array.isArray(playerState.unlockedIcons) || playerState.unlockedIcons.length === 0) {
                playerState.unlockedIcons = ['dopagaking'];
            }
            if (playerState.unlockedChars.length > 0 && (!playerState.selectedPlayerChar || !playerState.unlockedChars.includes(playerState.selectedPlayerChar))) {
                playerState.selectedPlayerChar = playerState.unlockedChars[0];
            }
            if (!playerState.selectedIcon || !playerState.unlockedIcons.includes(playerState.selectedIcon)) {
                playerState.selectedIcon = playerState.unlockedIcons[0] || 'dopagaking';
            }
            const el = document.getElementById('dopa-count') || document.getElementById('home-dopa-count');
            if (el) el.innerText = formatDopa(playerState.dopa);
            updateHeaderProfile();
        }

        function getMyProfileSnapshot() {
            const winRate = playerState.totalBattles > 0 ? ((playerState.wins / playerState.totalBattles) * 100).toFixed(1) : 0;
            return {
                playerName: playerState.playerName || '名無しファイター',
                selectedIcon: playerState.selectedIcon || 'courtney',
                totalBattles: playerState.totalBattles || 0,
                wins: playerState.wins || 0,
                losses: playerState.losses || 0,
                winRate: winRate,
                charUsage: playerState.charUsage || {},
                dopa: playerState.dopa
            };
        }

        async function recordGlobalMatchResult(myCharId, oppCharId, result, isBot) {
            if (!window.fbDb || !window.fbCollection || !window.fbAddDoc) return;
            try {
                const colRef = window.fbCollection(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'global_matches');
                await window.fbAddDoc(colRef, {
                    timestamp: Date.now(),
                    isBot: isBot,
                    myChar: myCharId,
                    oppChar: oppCharId,
                    result: result
                });
            } catch(e) {
                console.error("Global Match Record Error:", e);
            }
        }

        async function recordBattleResult(result, myCharId, opponentName, opponentIcon, isBot, opponentId = null, opponentProfile = null, oppCharId = null) {
            playerState.totalBattles++;
            if (result === 'win') playerState.wins++;
            else if (result === 'lose') playerState.losses++;

            playerState.charUsage[myCharId] = (playerState.charUsage[myCharId] || 0) + 1;

            const historyItem = {
                date: new Date().toLocaleString(),
                result: result,
                myChar: myCharId,
                opponentName: opponentName,
                opponentIcon: opponentIcon || 'pasha',
                isBot: isBot,
                opponentId: opponentId || (isBot ? 'bot_cpu' : 'online_player'),
                opponentProfile: opponentProfile
            };
            playerState.battleHistory.unshift(historyItem);
            if (playerState.battleHistory.length > 50) {
                playerState.battleHistory.pop();
            }

            await savePlayerState();
            updateHeaderProfile();
            await recordGlobalMatchResult(myCharId, oppCharId || opponentIcon, result, isBot);
        }

        function showModal(title, body) {
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const overlay = document.getElementById('modal-overlay');
            const actionsEl = document.getElementById('modal-actions');
            if (titleEl) titleEl.innerText = title;
            if (bodyEl) bodyEl.innerHTML = body;
            if (actionsEl) {
                actionsEl.innerHTML = `<button onclick="closeModal()" class="pixel-btn pixel-btn-primary px-6 py-2 font-bold text-sm">閉じる</button>`;
            }
            if (overlay) {
                overlay.classList.remove('hidden');
                document.body.classList.add('modal-open');
            }
        }

        function showConfirmModal(title, body, onConfirm, confirmText = '決定') {
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const overlay = document.getElementById('modal-overlay');
            const actionsEl = document.getElementById('modal-actions');
            if (titleEl) titleEl.innerText = title;
            if (bodyEl) bodyEl.innerHTML = body;
            if (actionsEl) {
                actionsEl.innerHTML = `
                    <button onclick="closeModal()" class="pixel-btn px-4 py-2 font-bold text-sm">キャンセル</button>
                    <button id="modal-confirm-btn" class="pixel-btn pixel-btn-danger px-4 py-2 font-bold text-sm">${confirmText}</button>
                `;
                document.getElementById('modal-confirm-btn').onclick = () => {
                    closeModal();
                    onConfirm();
                };
            }
            if (overlay) {
                overlay.classList.remove('hidden');
                document.body.classList.add('modal-open');
            }
        }

        function closeModal() {
            const overlay = document.getElementById('modal-overlay');
            if (overlay) overlay.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }

        function confirmRetireBattle() {
            audioSystem.playSelect();
            showConfirmModal("バトル中断", "本当にバトルを中断して降参しますか？\n（ホーム画面に戻ります）", () => {
                if (activeBattle) {
                    activeBattle.destroy();
                    activeBattle = null;
                }
                renderHomeScreen();
            }, "降参する");
        }

        function openGachaModal() {
            audioSystem.playSelect();
            const allCharIds = Object.keys(CHARACTER_DATA);
            const allExtraIconIds = Object.keys(EXTRA_ICONS);
            const allIconIds = [...allCharIds, ...allExtraIconIds];

            const lockedChars = allCharIds.filter(id => !playerState.unlockedChars.includes(id));
            const lockedIcons = allIconIds.filter(id => !(playerState.unlockedIcons || []).includes(id));
            const totalRemaining = lockedChars.length + lockedIcons.length;
            const isCompleted = totalRemaining === 0;
            const canTenPull = totalRemaining >= 10;

            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const overlay = document.getElementById('modal-overlay');
            const actionsEl = document.getElementById('modal-actions');

            if (titleEl) titleEl.innerText = "🎰 DOPAガチャ";
            if (bodyEl) {
                if (isCompleted) {
                    bodyEl.innerHTML = `
                        <div class="text-center space-y-4 py-4">
                            <p class="text-amber-300 font-bold text-base font-pixel">🏆 完全コンプリート！</p>
                            <p class="text-xs text-slate-200 leading-relaxed font-mono">
                                すべてのキャラクターとプロフィールアイコンをコンプリートしました！<br>
                                アイコン画像、新キャラクター追加をお待ちください。
                            </p>
                        </div>
                    `;
                } else {
                    bodyEl.innerHTML = `
                        <div class="text-center space-y-3 py-1">
                            <div class="flex flex-col gap-2.5 w-full">
                                ${canTenPull ? `
                                 <button onclick="executeGacha(10)" class="pixel-btn pixel-btn-warning w-full py-3.5 font-bold text-sm sm:text-base shadow-lg animate-pulse">
                                     🌟 10連ガチャ (${formatDopa(1000)} DOPA)
                                 </button>
                                 ` : `
                                 <button class="pixel-btn pixel-btn-disabled w-full py-3.5 font-bold text-sm sm:text-base cursor-not-allowed opacity-60">
                                     🌟 10連ガチャ (ストック不足)
                                 </button>
                                 <p class="text-[10px] text-amber-300 font-mono">※残りストックが10未満のため10連不可（1回ガチャのみ可能）</p>
                                 `}
                                 <button onclick="executeGacha(1)" class="pixel-btn pixel-btn-primary w-full py-2.5 font-bold text-xs sm:text-sm">
                                     1回ガチャ (${formatDopa(100)} DOPA)
                                 </button>
                             </div>
                             <div class="flex justify-between items-center gap-2">
                                 <button onclick="openGachaLineupModal()" class="pixel-btn px-3 py-1 text-xs font-bold bg-slate-800 border-slate-600">
                                     📋 ラインナップ・確率
                                 </button>
                                 <div class="text-[11px] text-slate-300 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                                     所持: <b class="text-amber-400">${formatDopa(playerState.dopa)}</b> DOPA | 残り: <b class="text-amber-300">${totalRemaining}</b>個
                                 </div>
                            </div>
                        </div>
                    `;
                }
            }
            if (actionsEl) {
                actionsEl.innerHTML = `<button onclick="closeModal()" class="pixel-btn px-6 py-1.5 font-bold text-xs">もどる</button>`;
            }
            if (overlay) {
                overlay.classList.remove('hidden');
                document.body.classList.add('modal-open');
            }
        }

        function openGachaLineupModal() {
            audioSystem.playSelect();
            const allChars = Object.values(CHARACTER_DATA);
            const allExtras = Object.values(EXTRA_ICONS);

            let html = `
                <div class="text-left space-y-3 max-h-96 overflow-y-auto pr-1 text-xs font-mono">
                    <div class="bg-slate-950 p-2.5 rounded border border-amber-600/50 space-y-1">
                        <div class="text-amber-300 font-bold">📊 ガチャ仕様・獲得確率</div>
                        <p class="text-[11px] text-slate-300">・10連ガチャ: キャラクター3〜5体（ランダム） ＋ 残りプロフィールアイコン・チャージアイコン等</p>
                        <p class="text-[11px] text-slate-300">・1回ガチャ: キャラクター または プロフィールアイコン・チャージアイコン等</p>
                        <p class="text-[11px] text-slate-300">・重複なし（コンプリートするとガチャ利用不可）</p>
                        <p class="text-[11px] text-amber-300">・残りストックが10未満の場合、10連ガチャは利用できません（1回ガチャのみ）。</p>
                    </div>

                    <div class="space-y-2">
                        <div class="text-amber-300 font-bold border-b border-slate-800 pb-1">🌟 キャラクター ラインナップ (${allChars.length}種)</div>
                        <div class="grid grid-cols-1 gap-1.5">
            `;

            allChars.forEach(c => {
                const hasChar = playerState.unlockedChars.includes(c.id);
                const hasIcon = (playerState.unlockedIcons || []).includes(c.id);
                html += `
                    <div class="bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                            <b class="text-amber-200">${c.name}</b>
                            <span class="text-[10px] text-slate-400 ml-1">(${c.title})</span>
                        </div>
                        <div class="flex gap-2 text-[10px]">
                            <span class="${hasChar ? 'text-emerald-400 font-bold' : 'text-slate-500'}">キャラ:${hasChar ? '所持' : '未所持'}</span>
                            <span class="${hasIcon ? 'text-cyan-400 font-bold' : 'text-slate-500'}">アイコン:${hasIcon ? '所持' : '未所持'}</span>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;

            html += `
                <div class="space-y-2 pt-2">
                    <div class="text-amber-300 font-bold border-b border-slate-800 pb-1">🌟 チャージアイコン・その他 ラインナップ (${allExtras.length}種)</div>
                    <div class="grid grid-cols-1 gap-1.5">
            `;

            allExtras.forEach(item => {
                const hasIcon = (playerState.unlockedIcons || []).includes(item.id);
                html += `
                    <div class="bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                            <b class="text-cyan-200">${item.name}</b>
                            <span class="text-[10px] text-slate-400 ml-1">(${item.title})</span>
                        </div>
                        <div class="text-[10px]">
                            <span class="${hasIcon ? 'text-cyan-400 font-bold' : 'text-slate-500'}">アイコン:${hasIcon ? '所持' : '未所持'}</span>
                        </div>
                    </div>
                `;
            });

            html += `</div></div></div>`;
            showModal("📋 ガチャラインナップ・確率", html);
        }

        async function executeGacha(count) {
            audioSystem.playSelect();
            if (playerState.dopa < 0) {
                showModal("破産救済中（借金制限）", "現在、所持DOPAがマイナス（借金状態）のため、ガチャを利用できません！\nバトルに勝利してDOPAを稼ぎ、借金を返済してください。");
                return;
            }
            const cost = count * 100;
            if (playerState.dopa < cost) {
                showModal("DOPA不足", `ガチャを ${count}回 引くには ${formatDopa(cost)} DOPA が必要です！（現在: ${formatDopa(playerState.dopa)} DOPA）`);
                return;
            }

            const allCharIds = Object.keys(CHARACTER_DATA);
            const allExtraIconIds = Object.keys(EXTRA_ICONS);
            const allIconIds = [...allCharIds, ...allExtraIconIds];

            let lockedChars = allCharIds.filter(id => !playerState.unlockedChars.includes(id));
            let lockedIcons = allIconIds.filter(id => !(playerState.unlockedIcons || []).includes(id));
            const totalRemaining = lockedChars.length + lockedIcons.length;

            if (totalRemaining === 0) {
                showModal("コンプリート", "すべてのキャラクターとプロフィールアイコンをコンプリートしています！\nアイコン画像、新キャラクター追加をお待ちください。");
                return;
            }

            if (count === 10 && totalRemaining < 10) {
                showModal("10連不可", "残りストックが10未満のため、10連ガチャは利用できません。\n「1回ガチャ」をご利用ください。");
                return;
            }

            await addDopa(-cost);

            let results = [];

            if (count === 10) {
                const targetCharCount = Math.min(lockedChars.length, Math.floor(Math.random() * 3) + 3);

                for (let i = 0; i < targetCharCount; i++) {
                    if (lockedChars.length === 0) break;
                    const idx = Math.floor(Math.random() * lockedChars.length);
                    const charId = lockedChars.splice(idx, 1)[0];
                    if (!playerState.unlockedChars.includes(charId)) playerState.unlockedChars.push(charId);
                    if (!playerState.unlockedIcons.includes(charId)) playerState.unlockedIcons.push(charId);
                    results.push({
                        type: 'character',
                        id: charId,
                        name: CHARACTER_DATA[charId].name,
                        title: CHARACTER_DATA[charId].title
                    });
                }

                const neededIcons = 10 - results.length;
                for (let i = 0; i < neededIcons; i++) {
                    if (lockedIcons.length > 0) {
                        const idx = Math.floor(Math.random() * lockedIcons.length);
                        const iconId = lockedIcons.splice(idx, 1)[0];
                        if (!playerState.unlockedIcons.includes(iconId)) playerState.unlockedIcons.push(iconId);
                        const itemData = CHARACTER_DATA[iconId] || EXTRA_ICONS[iconId];
                        results.push({
                            type: 'icon',
                            id: iconId,
                            name: itemData.name,
                            title: itemData.title
                        });
                    } else if (lockedChars.length > 0) {
                        const idx = Math.floor(Math.random() * lockedChars.length);
                        const charId = lockedChars.splice(idx, 1)[0];
                        if (!playerState.unlockedChars.includes(charId)) playerState.unlockedChars.push(charId);
                        if (!playerState.unlockedIcons.includes(charId)) playerState.unlockedIcons.push(charId);
                        results.push({
                            type: 'character',
                            id: charId,
                            name: CHARACTER_DATA[charId].name,
                            title: CHARACTER_DATA[charId].title
                        });
                    }
                }
            } else {
                let getChar = false;
                if (lockedChars.length > 0 && (lockedIcons.length === 0 || Math.random() < 0.45)) {
                    getChar = true;
                }

                if (getChar && lockedChars.length > 0) {
                    const idx = Math.floor(Math.random() * lockedChars.length);
                    const charId = lockedChars.splice(idx, 1)[0];
                    if (!playerState.unlockedChars.includes(charId)) playerState.unlockedChars.push(charId);
                    if (!playerState.unlockedIcons.includes(charId)) playerState.unlockedIcons.push(charId);
                    results.push({
                        type: 'character',
                        id: charId,
                        name: CHARACTER_DATA[charId].name,
                        title: CHARACTER_DATA[charId].title
                    });
                } else if (lockedIcons.length > 0) {
                    const idx = Math.floor(Math.random() * lockedIcons.length);
                    const iconId = lockedIcons.splice(idx, 1)[0];
                    if (!playerState.unlockedIcons.includes(iconId)) playerState.unlockedIcons.push(iconId);
                    const itemData = CHARACTER_DATA[iconId] || EXTRA_ICONS[iconId];
                    results.push({
                        type: 'icon',
                        id: iconId,
                        name: itemData.name,
                        title: itemData.title
                    });
                } else if (lockedChars.length > 0) {
                    const idx = Math.floor(Math.random() * lockedChars.length);
                    const charId = lockedChars.splice(idx, 1)[0];
                    if (!playerState.unlockedChars.includes(charId)) playerState.unlockedChars.push(charId);
                    if (!playerState.unlockedIcons.includes(charId)) playerState.unlockedIcons.push(charId);
                    results.push({
                        type: 'character',
                        id: charId,
                        name: CHARACTER_DATA[charId].name,
                        title: CHARACTER_DATA[charId].title
                    });
                }
            }

            // 10連の場合: ①獲得したキャラクターを順番に演出を入れながら表示その後②アイテム(プロフィールで使用できるキャラクターアイコン)の順番で表示する
            results.sort((a, b) => {
                if (a.type === 'character' && b.type !== 'character') return -1;
                if (a.type !== 'character' && b.type === 'character') return 1;
                return 0;
            });

            await savePlayerState();

            showGachaSuspenseModal(results, () => {
                showGachaRevealStep(results, 0);
            });
        }

        function showGachaSuspenseModal(results, onComplete) {
            window._currentGachaResults = results;
            audioSystem.playOpeningMelody();
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const actionsEl = document.getElementById('modal-actions');

            if (titleEl) titleEl.innerText = "🎰 抽選中... (DEXING)";
            if (bodyEl) {
                bodyEl.innerHTML = `
                    <div class="text-center space-y-4 py-8">
                        <div class="w-24 h-24 mx-auto pixel-box bg-amber-950 flex items-center justify-center animate-opening-shake border-4 border-amber-400 shadow-2xl">
                            <span class="text-4xl animate-bounce">⚡</span>
                        </div>
                        <p class="text-amber-300 font-pixel text-sm animate-pulse">DOPAエネルギーが最高潮に達する……！</p>
                    </div>
                `;
            }
            if (actionsEl) {
                actionsEl.innerHTML = `<button onclick="skipGachaSuspense()" class="pixel-btn pixel-btn-danger px-4 py-1.5 font-bold text-xs">スキップ ⏩</button>`;
            }

            window._gachaSuspenseTimeout = setTimeout(() => {
                window._gachaSuspenseTimeout = null;
                onComplete();
            }, 2200);
        }

        window.skipGachaSuspense = function() {
            if (window._gachaSuspenseTimeout) {
                clearTimeout(window._gachaSuspenseTimeout);
                window._gachaSuspenseTimeout = null;
            }
            if (window._currentGachaResults && window._currentGachaResults.length > 0) {
                showGachaRevealStep(window._currentGachaResults, 0);
            }
        };

        function showGachaRevealStep(results, index) {
            window._currentGachaResults = results;
            if (index >= results.length) {
                showGachaSummaryModal(results);
                return;
            }

            const res = results[index];
            const isChar = res.type === 'character';

            if (isChar) {
                audioSystem.playVictory();
            } else {
                audioSystem.playBuff();
            }

            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const actionsEl = document.getElementById('modal-actions');

            if (titleEl) titleEl.innerText = `🎰 ガチャ結果 (${index + 1}/${results.length})`;
            if (bodyEl) {
                bodyEl.innerHTML = `
                    <div class="text-center space-y-3 py-2 animate-cutin">
                        <div class="flex justify-center mb-1">
                            ${isChar ? '<span class="bg-amber-500 text-slate-950 px-3 py-1 rounded font-bold text-xs font-pixel shadow">✨ 新キャラクター</span>' : '<span class="bg-blue-600 text-white px-3 py-1 rounded font-bold text-xs font-pixel shadow">👤 プロフィールアイコン</span>'}
                        </div>
                        <div class="cursor-pointer inline-block group" onclick="closeModal(); openCharDetail('${res.id}', 'gacha_reveal', ${index});" title="タップして図鑑内容を表示">
                            <canvas id="gacha-reveal-cvs" width="140" height="140" class="pixel-box bg-slate-950 border-2 border-amber-400 mx-auto shadow-lg group-hover:scale-105 transition-transform"></canvas>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-amber-300 font-pixel">${res.name}</h3>
                            <p class="text-xs text-slate-300 mt-0.5">${res.title}</p>
                        </div>
                        <p class="text-[11px] text-cyan-300 font-mono">💡 アイコンをタップすると図鑑（解説・ステータス）が表示されます</p>
                    </div>
                `;
            }
            if (actionsEl) {
                actionsEl.innerHTML = `
                    <button onclick="skipGachaRevealAll()" class="pixel-btn pixel-btn-danger px-3 py-1.5 font-bold text-xs">すべてスキップ ⏩</button>
                    <button onclick="showGachaRevealStep(window._currentGachaResults, ${index + 1})" class="pixel-btn pixel-btn-primary px-6 py-1.5 font-bold text-xs">次へ ▶</button>
                `;
            }

            setTimeout(() => {
                const cvs = document.getElementById('gacha-reveal-cvs');
                if (cvs) CharacterRenderer.drawCharacter(cvs, res.id);
            }, 50);
        }

        window.skipGachaRevealAll = function() {
            if (window._currentGachaResults) {
                showGachaSummaryModal(window._currentGachaResults);
            }
        };

        function showGachaSummaryModal(results) {
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const actionsEl = document.getElementById('modal-actions');

            if (titleEl) titleEl.innerText = `🎉 ガチャ結果一覧 (${results.length}連)`;
            if (bodyEl) {
                let html = `<div class="text-center p-1 space-y-2 max-h-72 overflow-y-auto"><div class="grid grid-cols-1 gap-2 text-left">`;
                results.forEach((res) => {
                    const isChar = res.type === 'character';
                    html += `
                        <div class="pixel-box p-2.5 ${isChar ? 'bg-amber-950/60 border-amber-400' : 'bg-blue-950/40 border-blue-500'} flex items-center justify-between text-xs cursor-pointer hover:opacity-90" onclick="closeModal(); openCharDetail('${res.id}', 'gacha_summary');" title="タップして図鑑を表示">
                            <div class="flex items-center gap-2">
                                <span class="${isChar ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'} px-2 py-0.5 rounded font-bold text-[10px]">${isChar ? 'キャラ' : 'アイコン'}</span>
                                <div>
                                    <b class="${isChar ? 'text-amber-300' : 'text-cyan-300'} text-sm">${res.name}</b>
                                    <span class="text-slate-300 ml-1">(${res.title})</span>
                                </div>
                            </div>
                            <span class="text-emerald-400 font-bold text-[11px]">✨ ゲット!</span>
                        </div>
                    `;
                });
                html += `</div></div>`;
                bodyEl.innerHTML = html;
            }
            if (actionsEl) {
                actionsEl.innerHTML = `
                    <button onclick="openGachaModal()" class="pixel-btn pixel-btn-warning px-4 py-1.5 font-bold text-xs">もう一度引く 🎰</button>
                    <button onclick="closeModal(); renderHomeScreen();" class="pixel-btn pixel-btn-primary px-6 py-1.5 font-bold text-xs">ホームに戻る</button>
                `;
            }
        }

        function renderZukanScreen(sortOrder = 'default', sortDir = 'desc') {
            audioSystem.playSelect();
            const container = document.getElementById('screen-container');
            if (!container) return;

            let chars = Object.values(CHARACTER_DATA);
            if (sortOrder === 'hp') {
                chars.sort((a, b) => sortDir === 'desc' ? b.hp - a.hp : a.hp - b.hp);
            } else if (sortOrder === 'atk') {
                chars.sort((a, b) => sortDir === 'desc' ? b.atk - a.atk : a.atk - b.atk);
            } else if (sortOrder === 'critRate') {
                chars.sort((a, b) => sortDir === 'desc' ? b.critRate - a.critRate : a.critRate - b.critRate);
            }

            const unlockedCount = chars.filter(c => playerState.unlockedChars.includes(c.id)).length;
            const totalCount = chars.length;

            let html = `
                <div class="w-full flex flex-col items-center max-w-4xl mx-auto py-2 px-2">
                    <div class="flex justify-between items-center w-full mb-2 sm:mb-3 px-1 flex-wrap gap-2">
                        <h2 class="text-sm sm:text-lg font-bold text-amber-300 font-pixel">📖 キャラクター図鑑</h2>
                        <div class="text-[10px] sm:text-xs font-mono text-amber-200 bg-slate-900 px-2.5 py-1 rounded border border-amber-600/50">
                            獲得済み: <b class="text-emerald-400">${unlockedCount}</b> / ${totalCount} 体
                        </div>
                    </div>

                    <div class="flex items-center justify-between w-full mb-2 sm:mb-3 px-1 gap-2 flex-wrap">
                        <div class="flex items-center gap-1.5 text-xs">
                            <span class="text-slate-400 font-bold">並び替え:</span>
                            <select id="zukan-sort-order" onchange="onZukanSortChange()" class="pixel-box bg-slate-900 text-amber-300 px-2 py-1 text-xs outline-none border-amber-600">
                                <option value="default" ${sortOrder === 'default' ? 'selected' : ''}>登録順</option>
                                <option value="hp" ${sortOrder === 'hp' ? 'selected' : ''}>HPが高い順</option>
                                <option value="atk" ${sortOrder === 'atk' ? 'selected' : ''}>攻撃力が高い順</option>
                                <option value="critRate" ${sortOrder === 'critRate' ? 'selected' : ''}>クリティカル率が高い順</option>
                            </select>
                            <button onclick="toggleZukanSortDir('${sortOrder}', '${sortDir}')" class="pixel-btn px-2 py-1 text-xs font-bold bg-slate-800 border-slate-600">
                                ${sortDir === 'desc' ? '🔽 降順(高)' : '🔼 昇順(低)'}
                            </button>
                        </div>
                        <button onclick="renderHomeScreen()" class="pixel-btn px-3 py-1.5 text-xs">ホームに戻る</button>
                    </div>

                    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 w-full mb-2 sm:mb-4 px-1 max-h-[220px] sm:max-h-[400px] overflow-y-auto">
            `;

            chars.forEach(c => {
                const isUnlocked = playerState.unlockedChars.includes(c.id);
                html += `
                    <div onclick="renderZukanDetailScreen('${c.id}', 'zukan', '${sortOrder}', '${sortDir}')" 
                         class="pixel-box p-2 sm:p-3 bg-slate-900 cursor-pointer flex flex-col items-center justify-between border-2 transition-all hover:border-amber-400 ${!isUnlocked ? 'opacity-50 grayscale' : 'border-slate-700'}">
                        <canvas id="zukan-cvs-${c.id}" width="100" height="100" class="pixel-box bg-slate-950 mb-1 w-16 h-16 sm:w-24 sm:h-24"></canvas>
                        <span class="text-[11px] sm:text-xs font-bold ${isUnlocked ? 'text-amber-300' : 'text-slate-400'} truncate max-w-full">${c.name}</span>
                        <span class="text-[9px] text-slate-400 truncate max-w-full">${c.title}</span>
                        <span class="text-[9px] mt-0.5 font-bold ${isUnlocked ? 'text-emerald-400' : 'text-red-400'}">
                            ${isUnlocked ? '✨ 所持済み' : '🔒 未所持'}
                        </span>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;

            container.innerHTML = html;

            setTimeout(() => {
                chars.forEach(c => {
                    const cvs = document.getElementById(`zukan-cvs-${c.id}`);
                    if (cvs) CharacterRenderer.drawCharacter(cvs, c.id);
                });
            }, 50);
        }

        function onZukanSortChange() {
            const select = document.getElementById('zukan-sort-order');
            if (select) {
                renderZukanScreen(select.value, 'desc');
            }
        }

        function toggleZukanSortDir(currentOrder, currentDir) {
            const newDir = currentDir === 'desc' ? 'asc' : 'desc';
            renderZukanScreen(currentOrder, newDir);
        }

        function getNewBattleCustomStats(charId) {
            if (!playerState.newBattleCustomStats) {
                playerState.newBattleCustomStats = {};
            }
            const master = CHARACTER_DATA[charId];
            if (!master) return null;

            if (!playerState.newBattleCustomStats[charId]) {
                const baseHp = master.hp;
                const baseAtk = master.atk;
                const baseDef = master.def;
                const baseCrit = Math.round((master.critRate || 0.05) * 100);
                const baseEva = master.eva;
                const baseSum = baseHp + baseAtk + baseDef + baseCrit + baseEva;
                const diff = 240 - baseSum;
                playerState.newBattleCustomStats[charId] = {
                    hp: baseHp + diff,
                    atk: baseAtk,
                    def: baseDef,
                    critRate: baseCrit,
                    eva: baseEva
                };
            }
            return playerState.newBattleCustomStats[charId];
        }

        function adjustNewBattleStat(charId, statKey, delta, sortOrder, sortDir, onlyOwned) {
            const stats = getNewBattleCustomStats(charId);
            if (!stats) return;

            const currentTotal = stats.hp + stats.atk + stats.def + stats.critRate + stats.eva;
            
            let minVal = 1;
            let maxVal = 300;
            if (statKey === 'hp') { minVal = 50; maxVal = 300; }
            else if (statKey === 'atk') { minVal = 5; maxVal = 45; }
            else if (statKey === 'def') { minVal = 5; maxVal = 80; }
            else if (statKey === 'critRate') { minVal = 1; maxVal = 40; }
            else if (statKey === 'eva') { minVal = 1; maxVal = 60; }

            const newVal = stats[statKey] + delta;
            if (newVal < minVal || newVal > maxVal) return;

            const newTotal = currentTotal + delta;
            if (newTotal > 240) return;

            stats[statKey] = newVal;
            savePlayerState();

            renderZukanDetailScreen(charId, 'new_select', sortOrder, sortDir, onlyOwned);
        }

        function resetNewBattleStats(charId, sortOrder, sortDir, onlyOwned) {
            if (playerState.newBattleCustomStats) {
                delete playerState.newBattleCustomStats[charId];
            }
            getNewBattleCustomStats(charId);
            savePlayerState();
            renderZukanDetailScreen(charId, 'new_select', sortOrder, sortDir, onlyOwned);
        }

        function renderZukanDetailScreen(charId, returnSource = 'zukan', arg1 = 'default', arg2 = 'desc', arg3 = 'desc', arg4 = false) {
            audioSystem.playSelect();
            const container = document.getElementById('screen-container');
            if (!container) return;

            const c = CHARACTER_DATA[charId] || EXTRA_ICONS[charId];
            if (!c) return;

            const isExtra = !!EXTRA_ICONS[charId];
            const isUnlocked = isExtra ? (playerState.unlockedIcons && playerState.unlockedIcons.includes(c.id)) : playerState.unlockedChars.includes(c.id);

            let backAction = "";
            let backLabel = "🔙 戻る";
            if (returnSource === 'gacha_reveal') {
                const index = typeof arg1 === 'number' ? arg1 : 0;
                backAction = `document.getElementById('modal-overlay').classList.remove('hidden'); document.body.classList.add('modal-open'); showGachaRevealStep(window._currentGachaResults || [], ${index})`;
            } else if (returnSource === 'gacha_summary') {
                backAction = `document.getElementById('modal-overlay').classList.remove('hidden'); document.body.classList.add('modal-open'); showGachaSummaryModal(window._currentGachaResults || [])`;
            } else if (returnSource === 'select' || returnSource === 'new_select') {
                const sortOrder = arg1 || arg2 || 'default';
                const sortDir = arg2 || arg3 || 'desc';
                const onlyOwned = !!arg3 || !!arg4;
                backAction = `renderNewBattleCharSelectScreen('${sortOrder}', '${sortDir}', ${onlyOwned})`;
            } else {
                const sortOrder = arg1 || 'default';
                const sortDir = arg2 || 'desc';
                backAction = `renderZukanScreen('${sortOrder}', '${sortDir}')`;
            }

            let html = `
                <div id="zukan-detail-wrapper" class="w-full flex flex-col items-center max-w-5xl mx-auto py-1 px-2 h-full max-h-[92vh] sm:max-h-[88vh]">
                    <div class="flex justify-between items-center w-full mb-1 flex-shrink-0">
                        <button onclick="${backAction}" class="pixel-btn px-3 py-1 text-xs">${backLabel}</button>
                        <span class="text-xs font-bold text-amber-300 font-pixel">📖 キャラクター詳細図鑑</span>
                        <div></div>
                    </div>

                    <div class="pixel-box-gold p-3 sm:p-5 bg-amber-950/90 w-full flex-1 flex flex-col md:flex-row gap-4 relative min-h-0 overflow-hidden">
                        <!-- Left Column: Icon, Basic Info & Select Button (Fixed Display Area) -->
                        <div class="w-full md:w-[280px] lg:w-[320px] flex flex-col items-center flex-shrink-0 relative overflow-y-auto pr-1">
                            <div class="absolute top-0 right-0 text-xs font-mono font-bold px-2.5 py-1 rounded border ${isUnlocked ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-red-950 text-red-300 border-red-600'}">
                                ${isUnlocked ? '✨ 所持済み' : '🔒 未所持'}
                            </div>

                            <canvas id="zukan-detail-cvs" width="180" height="180" class="pixel-box bg-slate-950 shadow-xl border-2 border-amber-500 w-32 h-32 sm:w-40 sm:h-40 mb-3 mt-1"></canvas>
                            
                            <div class="text-center w-full mb-4">
                                <h2 class="text-lg sm:text-xl font-bold text-amber-300 font-pixel mb-1">${c.name}</h2>
                                <p class="text-xs sm:text-sm text-amber-200 mb-1">${c.title}</p>
                                <p class="text-[11px] text-slate-300">${isExtra ? 'プロフィールアイコン / チャージアイテム' : c.type}</p>
                            </div>
            `;

            if ((returnSource === 'select' || returnSource === 'new_select') && !isExtra) {
                const sortOrder = arg1 || 'default';
                const sortDir = arg2 || 'desc';
                const onlyOwned = !!arg3;
                if (isUnlocked) {
                    const isSelected = window.selectedNewBattleChar === c.id;
                    const isEligibleCustom = !['dopagaking', 'courtney', 'pasha_dark'].includes(c.id);
                    if (isEligibleCustom) {
                        html += `
                            <button onclick="
                                const cust = getNewBattleCustomStats('${c.id}');
                                const total = cust.hp + cust.atk + cust.def + cust.critRate + cust.eva;
                                if (cust.atk > 45) {
                                    showModal('攻撃力オーバー', '攻撃力は最大45までです（現在: ' + cust.atk + '）。45以下に調整してください！');
                                } else if (total > 240) {
                                    showModal('ポイント超過', 'ステータスポイントの合計が240ポイントを超えています（現在: ' + total + 'Pt）。240ポイント以下に調整してください！');
                                } else {
                                    window.selectedNewBattleChar = '${c.id}';
                                    renderNewBattleCharSelectScreen('${sortOrder}', '${sortDir}', ${onlyOwned});
                                }
                            " class="pixel-btn ${isSelected ? 'pixel-btn-success' : 'pixel-btn-primary'} w-full py-2.5 font-bold text-xs sm:text-sm shadow-lg mt-auto">
                                ${isSelected ? '✨ 選択中 (戻る)' : '⚔ このキャラで出陣'}
                            </button>
                        `;
                    } else {
                        html += `
                            <button onclick="window.selectedNewBattleChar = '${c.id}'; renderNewBattleCharSelectScreen('${sortOrder}', '${sortDir}', ${onlyOwned});" class="pixel-btn ${isSelected ? 'pixel-btn-success' : 'pixel-btn-primary'} w-full py-2.5 font-bold text-xs sm:text-sm shadow-lg mt-auto">
                                ${isSelected ? '✨ 選択中 (戻る)' : '⚔ このキャラで出陣'}
                            </button>
                        `;
                    }
                } else {
                    html += `
                        <div class="w-full text-center py-2 text-xs text-red-400 font-bold bg-slate-950 rounded border border-red-900 mt-auto">
                            🔒 未所持 (ガチャで入手)
                        </div>
                    `;
                }
            }

            html += `
                        </div>

                        <!-- Right Column: Details, Stats, Description, Skills (Vertical Scrolling Area) -->
                        <div class="w-full md:flex-1 flex flex-col gap-3 min-w-0 overflow-y-auto pr-2 h-full">
            `;

            if (!isExtra) {
                const isEligibleCustom = (returnSource === 'new_select') && !['dopagaking', 'courtney', 'pasha_dark'].includes(c.id);
                if (isEligibleCustom) {
                    const custStats = getNewBattleCustomStats(c.id);
                    const totalUsed = custStats.hp + custStats.atk + custStats.def + custStats.critRate + custStats.eva;
                    const remPts = 240 - totalUsed;
                    const sortOrder = arg1 || 'default';
                    const sortDir = arg2 || 'desc';
                    const onlyOwned = !!arg3;

                    const hpMin = 50, hpMax = 300;
                    const atkMin = 5, atkMax = 45;
                    const defMin = 5, defMax = 80;
                    const critMin = 1, critMax = 40;
                    const evaMin = 1, evaMax = 60;

                    const hpMinusDisabled = custStats.hp <= hpMin;
                    const hpPlusDisabled = totalUsed + 5 > 240 || custStats.hp + 5 > hpMax;

                    const atkMinusDisabled = custStats.atk <= atkMin;
                    const atkPlusDisabled = custStats.atk >= atkMax || totalUsed + 1 > 240;

                    const defMinusDisabled = custStats.def <= defMin;
                    const defPlusDisabled = totalUsed + 1 > 240 || custStats.def + 1 > defMax;

                    const critMinusDisabled = custStats.critRate <= critMin;
                    const critPlusDisabled = totalUsed + 1 > 240 || custStats.critRate + 1 > critMax;

                    const evaMinusDisabled = custStats.eva <= evaMin;
                    const evaPlusDisabled = totalUsed + 1 > 240 || custStats.eva + 1 > evaMax;

                    html += `
                                <div class="w-full bg-slate-950 p-3.5 rounded border border-amber-800 space-y-2.5 text-xs font-mono flex-shrink-0">
                                    <div class="flex justify-between items-center border-b border-amber-900 pb-1">
                                        <span class="text-amber-300 font-bold">📊 ステータス自由割り当て (最大240Pt)</span>
                                        <span class="text-xs">残り: <span id="rem-pts" class="${remPts < 0 ? 'text-red-400' : (remPts === 0 ? 'text-emerald-400' : 'text-amber-300')} font-bold">${remPts}</span> Pt</span>
                                    </div>
                                    <div class="space-y-1.5">
                                        <!-- HP -->
                                        <div class="flex items-center justify-between bg-slate-900 p-2 rounded">
                                            <span class="text-slate-300 font-bold">HP</span>
                                            <div class="flex items-center gap-2">
                                                <span class="text-emerald-400 font-bold w-10 text-right">${custStats.hp}</span>
                                                <button ${hpMinusDisabled ? 'disabled class="pixel-btn px-2 py-0.5 text-xs bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustNewBattleStat('${c.id}', 'hp', -5, '${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2 py-0.5 text-xs bg-slate-800"`}>-5</button>
                                                <button ${hpPlusDisabled ? 'disabled class="pixel-btn px-2 py-0.5 text-xs bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustNewBattleStat('${c.id}', 'hp', 5, '${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2 py-0.5 text-xs bg-slate-800"`}>+5</button>
                                            </div>
                                        </div>
                                        <!-- 攻撃力 -->
                                        <div class="flex items-center justify-between bg-slate-900 p-2 rounded">
                                            <span class="text-slate-300 font-bold">攻撃力</span>
                                            <div class="flex items-center gap-2">
                                                <span class="text-red-400 font-bold w-10 text-right">${custStats.atk}</span>
                                                <button ${atkMinusDisabled ? 'disabled class="pixel-btn px-2 py-0.5 text-xs bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustNewBattleStat('${c.id}', 'atk', -1, '${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2 py-0.5 text-xs bg-slate-800"`}>-1</button>
                                                <button ${atkPlusDisabled ? 'disabled class="pixel-btn px-2 py-0.5 text-xs bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustNewBattleStat('${c.id}', 'atk', 1, '${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2 py-0.5 text-xs bg-slate-800"`}>+1</button>
                                            </div>
                                        </div>
                                        <!-- 防御力 -->
                                        <div class="flex items-center justify-between bg-slate-900 p-2 rounded">
                                            <span class="text-slate-300 font-bold">防御力</span>
                                            <div class="flex items-center gap-2">
                                                <span class="text-blue-400 font-bold w-10 text-right">${custStats.def}</span>
                                                <button ${defMinusDisabled ? 'disabled class="pixel-btn px-2 py-0.5 text-xs bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustNewBattleStat('${c.id}', 'def', -1, '${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2 py-0.5 text-xs bg-slate-800"`}>-1</button>
                                                <button ${defPlusDisabled ? 'disabled class="pixel-btn px-2 py-0.5 text-xs bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustNewBattleStat('${c.id}', 'def', 1, '${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2 py-0.5 text-xs bg-slate-800"`}>+1</button>
                                            </div>
                                        </div>
                                        <!-- クリティカル率 -->
                                        <div class="flex items-center justify-between bg-slate-900 p-2 rounded">
                                            <span class="text-slate-300 font-bold">クリティカル率</span>
                                            <div class="flex items-center gap-2">
                                                <span class="text-yellow-400 font-bold w-10 text-right">${custStats.critRate}%</span>
                                                <button ${critMinusDisabled ? 'disabled class="pixel-btn px-2 py-0.5 text-xs bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustNewBattleStat('${c.id}', 'critRate', -1, '${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2 py-0.5 text-xs bg-slate-800"`}>-1</button>
                                                <button ${critPlusDisabled ? 'disabled class="pixel-btn px-2 py-0.5 text-xs bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustNewBattleStat('${c.id}', 'critRate', 1, '${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2 py-0.5 text-xs bg-slate-800"`}>+1</button>
                                            </div>
                                        </div>
                                        <!-- 回避率 -->
                                        <div class="flex items-center justify-between bg-slate-900 p-2 rounded">
                                            <span class="text-slate-300 font-bold">回避率</span>
                                            <div class="flex items-center gap-2">
                                                <span class="text-purple-400 font-bold w-10 text-right">${custStats.eva}%</span>
                                                <button ${evaMinusDisabled ? 'disabled class="pixel-btn px-2 py-0.5 text-xs bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustNewBattleStat('${c.id}', 'eva', -1, '${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2 py-0.5 text-xs bg-slate-800"`}>-1</button>
                                                <button ${evaPlusDisabled ? 'disabled class="pixel-btn px-2 py-0.5 text-xs bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustNewBattleStat('${c.id}', 'eva', 1, '${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2 py-0.5 text-xs bg-slate-800"`}>+1</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex justify-end pt-1">
                                        <button onclick="resetNewBattleStats('${c.id}', '${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2.5 py-1 text-[11px] bg-slate-800 text-slate-300 border-slate-600">初期値に戻す</button>
                                    </div>
                                </div>
                    `;
                } else {
                    html += `
                                <div class="w-full bg-slate-950 p-3.5 rounded border border-amber-800 space-y-2 text-xs font-mono flex-shrink-0">
                                    <div class="text-amber-300 font-bold mb-1.5 border-b border-amber-900 pb-1">📊 ステータス ${!['dopagaking', 'courtney', 'pasha_dark'].includes(c.id) ? '' : '(※カスタマイズ対象外)'}</div>
                                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        <div class="flex justify-between bg-slate-900 p-1.5 rounded"><span class="text-slate-400">HP:</span><span class="text-emerald-400 font-bold">${c.id === 'dopagaking' ? '？' : c.hp}</span></div>
                                        <div class="flex justify-between bg-slate-900 p-1.5 rounded"><span class="text-slate-400">攻撃力:</span><span class="text-red-400 font-bold">${c.id === 'dopagaking' ? '？' : c.atk}</span></div>
                                        <div class="flex justify-between bg-slate-900 p-1.5 rounded"><span class="text-slate-400">防御力:</span><span class="text-blue-400 font-bold">${c.id === 'dopagaking' ? '？' : c.def}</span></div>
                                        <div class="flex justify-between bg-slate-900 p-1.5 rounded"><span class="text-slate-400">クリ率:</span><span class="text-yellow-400 font-bold">${c.id === 'dopagaking' ? '？%' : Math.round(c.critRate * 100) + '%'}</span></div>
                                        <div class="flex justify-between bg-slate-900 p-1.5 rounded col-span-2 sm:col-span-2"><span class="text-slate-400">回避率:</span><span class="text-purple-400 font-bold">${c.id === 'dopagaking' ? '？%' : c.eva + '%'}</span></div>
                                    </div>
                                </div>
                    `;
                }

                html += `
                            <div class="w-full bg-slate-950 p-3.5 rounded border border-amber-800 space-y-2 text-xs font-mono flex-shrink-0">
                                <div class="text-amber-300 font-bold mb-1.5 border-b border-amber-900 pb-1">📖 キャラクター解説</div>
                                <p class="text-slate-200 leading-relaxed whitespace-pre-line">${c.zukanDesc || c.desc}</p>
                            </div>
                `;

                if (c.id === 'pasha') {
                    html += `
                            <div class="w-full bg-amber-950/60 p-3.5 rounded border border-amber-400 space-y-2 text-xs font-mono flex-shrink-0">
                                <div class="text-amber-300 font-bold mb-1.5 border-b border-amber-600 pb-1">✨ 固有スキル1: カメラフラッシュ仕様</div>
                                <p class="text-amber-200 leading-relaxed font-bold">【解放条件】開幕1ターン待機（2ターン目以降に使用可能）</p>
                                <p class="text-slate-200 leading-relaxed">【効果詳細】敵全体に小ダメージを与え、選択した敵1体を1ターンの間行動不能にする（CD: 3T）。</p>
                            </div>
                            <div class="w-full bg-amber-950/60 p-3.5 rounded border border-amber-400 space-y-2 text-xs font-mono flex-shrink-0">
                                <div class="text-amber-300 font-bold mb-1.5 border-b border-amber-600 pb-1">✨ 固有パッシブスキル: 対・半浸闇化特効</div>
                                <p class="text-amber-200 leading-relaxed font-bold">【パッシブ効果】敵チームに「SPパシャ憎・半浸闇化状態」がいる場合、自身のクリティカル率がバトル開始時から終了時まで10上昇する。</p>
                                <p class="text-slate-200 leading-relaxed">【発動判定】バトル開始時および毎ターン自動判定され、敵チームに対象が存在する場合、パシャ憎のクリティカル率が常時+10%上昇します。</p>
                            </div>
                    `;
                }

                html += `
                            <div class="w-full bg-slate-950 p-3.5 rounded border border-amber-800 space-y-2 text-xs font-mono flex-shrink-0">
                                <div class="text-amber-300 font-bold mb-1.5 border-b border-amber-900 pb-1">⚔ 所持スキル</div>
                                <div class="space-y-2">
                `;

                c.skills.forEach(s => {
                    const cdStr = s.cooldown > 0 ? ` [CT: ${s.cooldown}T]` : '';
                    html += `
                        <div class="bg-slate-900 p-2.5 rounded border border-slate-800">
                            <div class="font-bold text-amber-200">${s.name}${cdStr}</div>
                            <div class="text-[10px] text-slate-400 mt-0.5">${s.desc}</div>
                        </div>
                    `;
                });

                html += `</div></div>`;
            } else {
                html += `
                            <div class="w-full bg-slate-950 p-3.5 rounded border border-amber-800 space-y-2 text-xs font-mono flex-shrink-0">
                                <div class="text-amber-300 font-bold mb-1.5 border-b border-amber-900 pb-1">📖 アイテム解説</div>
                                <p class="text-slate-200 leading-relaxed whitespace-pre-line">ドパガキングダムの特別なチャージアイコン・記念アイテムです。プロフィールアイコンとして設定してアピールできます！</p>
                            </div>
                `;
            }

            html += `
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            setTimeout(() => {
                const cvs = document.getElementById('zukan-detail-cvs');
                if (cvs) CharacterRenderer.drawCharacter(cvs, c.id);
            }, 50);
        }

        function openCharacterListModal() {
            renderZukanScreen();
        }

        function openCharDetail(id, returnSource = 'zukan', arg1 = 'default', arg2 = 'desc', arg3 = 'desc', arg4 = false) {
            renderZukanDetailScreen(id, returnSource, arg1, arg2, arg3, arg4);
        }

        const EXTRA_ICONS = {
            dopagakingcharge: {
                id: 'dopagakingcharge',
                name: 'ドパガキングチャージ',
                title: '王の覚醒チャージアイコン',
                image: 'dopagaking/dopagakingcharge.webp'
            },
            ALT2: {
                id: 'ALT2',
                name: 'コートニーチャージ',
                title: 'メロメロチャージアイコン',
                image: 'courtney/ALT2.webp'
            },
            chargenasu: {
                id: 'chargenasu',
                name: 'ナスチャージ',
                title: '要塞ナスチャージアイコン',
                image: 'momopin/chargenasu.webp'
            },
            moenancat: {
                id: 'moenancat',
                name: 'もえなんキャット',
                title: '愛猫アイコン',
                image: 'moenan/moenancat.webp'
            },
            dopagakingdom: {
                id: 'dopagakingdom',
                name: 'ドパガキングダム紋章',
                title: '王国聖印アイコン',
                image: 'images/DOPAGAKINGDOM.png'
            }
        };

        const CHARACTER_DATA = {


            dopagaking: {
                id: 'dopagaking',
                name: 'SPドパガキング',
                title: 'ドパガキングダムの国王',
                type: '運属性 / アタッカー・ギャンブル特化',
                hp: 200, // ※キャラクター選択画面では「？」表示。バトル開始時に 130 〜 250 の間でランダム決定
                atk: 18, def: 12, critRate: 0.05, eva: 15,
                dopaChargeCount: 0,
                selectedInheritChar: null,
                maxHpRandom: 200,
                image: 'dopagaking/dopagaking.webp',
                allImage: 'dopagaking/dopagakingALL.webp',
                dieImage: 'dopagaking/dopagakingDIE.webp',
                chargedImage: 'dopagaking/dopagakingcharge.webp',
                desc: 'すべてを運に任せる完全ランダム型の国王。6回チャージで「王に従え」が解放され、ランダムなキャラの姿に変身して全スキルをCD無視で1つ選択して発動できる。',
                skills: [
                    { id: 'dopa_juggler', name: 'ジャグラー', type: 'dopa_juggler_skill', power: 1.0, isNormalAttack: true, cooldown: 0, initialCooldown: 0, targetType: 'single_enemy', desc: '【CD: 0 / 通常攻撃】0〜40の完全ランダムダメージを単体に与える。' },
                    { id: 'dopa_charge', name: 'チャージ', type: 'dopa_charge_skill', cooldown: 0, initialCooldown: 0, targetType: 'self', desc: '【CD: 0 / 特殊】「王に従え」のチャージを1つ行う（最大6回）。6回チャージ後は使用不可となり、「王に従え」発動後に再度チャージ可能。' },
                    { id: 'dopa_majesty', name: '王の威厳', type: 'dopa_majesty_skill', cooldown: 2, initialCooldown: 0, targetType: 'self', desc: '【CD: 2T / 補助・防御】70%で敵の攻撃を絶対回避（1T）、30%で自身のHPを60回復する。' },
                    { id: 'dopa_godluck', name: '神頼み', type: 'dopa_godluck_skill', cooldown: 4, initialCooldown: 0, targetType: 'single_enemy', desc: '【CD: 4T / 特殊・一撃】95%で自分が50ダメージ、5%で相手に1000ダメージ（HP50%以上ならHP1耐え）。' },
                    { id: 'dopa_obey', name: '王に従え', type: 'dopa_obey_skill', cooldown: 0, initialCooldown: 0, targetType: 'self', desc: '【CD: 0 / 6回チャージ時のみ】ランダムなキャラに変身し、CD無視で任意のスキルを選び発動！発動後チャージは0にリセット。' }
                ]
            },




            courtney: {
                id: 'courtney',
                name: 'SPコートニー',
                title: 'メロメロ海外ガール',
                type: '恋属性 / タンク・一発特化',
                hp: 190, atk: 18, def: 15, critRate: 0.04, eva: 18,
                courtneyChargeCount: 0,
                image: 'courtney/ALT.webp',
                allImage: 'courtney/ALT11.webp',
                dieImage: 'courtney/ALT3.webp',
                chargedImage: 'courtney/ALTchange2.webp',
                desc: '相手をメロメロにして戦う海外ガール。「溜め技」を駆使し、最大8回までチャージして一撃の爆発力を高める。',
                skills: [
                    { id: 'courtney_attack', name: 'ミツメル', type: 'courtney_attack_skill', power: 1.0, isNormalAttack: true, cooldown: 0, targetType: 'all_enemies', desc: '【CD: 0 / 全体攻撃】相手チーム全員をじっと見つめて攻撃する（固定ダメージ13）。' },
                    { id: 'courtney_charge', name: 'チャージ', type: 'courtney_charge_only', cooldown: 0, initialCooldown: 0, targetType: 'self', desc: '【CD: 0 / 特殊】「FEEL SO HOT ///」のチャージを行う（最大8回）。使用すると出番が終了する。' },
                    { id: 'courtney_yoseru', name: 'ヨセル', type: 'courtney_yoseru_skill', power: 0.3, isNormalAttack: false, cooldown: 1, targetType: 'single_enemy', desc: '【CD: 1T / デバフ攻撃】少量のダメージ（攻撃力の30%）を与えつつ、1ターンの間相手の防御力を0にする！' },
                    { id: 'courtney_aegu', name: 'アエグ', type: 'courtney_aegu_skill', healRate: 0.45, cooldown: 3, targetType: 'self', desc: '【CD: 3T / 回復・防御】最大HPの45%（85.5）を回復し、次の相手の攻撃を絶対回避する！' },
                    { id: 'courtney_feel', name: 'FEEL SO HOT ///', type: 'courtney_charge_release', cooldown: 0, targetType: 'single_enemy', desc: '【CD: 0 / 条件付き】チャージ1回以上で選択可能。最大8チャージで150大ダメージ！' }
                ]
            },
             ndaihyo: {
                id: 'ndaihyo',
                name: 'N高代表',
                title: 'クリケット部の天才',
                type: '頭脳・デバフ型',
                hp: 179, atk: 23, def: 15, critRate: 0.05, eva: 16,
                image: 'ndaihyo/ndaihyou.webp',
                allImage: 'ndaihyo/ndaihyouALL.webp',
                dieImage: 'ndaihyo/ndaihyouDIE.webp',
                desc: 'N高クリケット部代表。高い知性と緻密な戦術で相手の能力を下げつつ優位に立つ。',
                skills: [
                    { id: 'ndaihyo_attack', name: 'バッティング', type: 'attack', power: 1.05, isNormalAttack: true, cooldown: 0, targetType: 'single_enemy', desc: '敵単体に標準ダメージを与える通常攻撃。' },
                    { id: 'ndaihyo_analysis', name: '弱点分析', type: 'debuff_attack', power: 1.30, isNormalAttack: false, cooldown: 2, targetType: 'single_enemy', desc: '敵単体の攻撃力と防御力を次のターン終了まで小低下させる。' },
                    { id: 'ndaihyo_tactics', name: 'パシャ憎絶許', type: 'debuff', cooldown: 4, initialCooldown: 1, targetType: 'all_enemies', desc: '敵全体の攻撃力・防御力を2ターン中低下。相手にパシャ憎がいる場合は攻撃力を大幅低下！' },
                     { id: 'ndaihyo_mind', name: '消しゴム回復', type: 'heal_cleanse', healRate: 0.20, cooldown: 3, targetType: 'single_ally', desc: '味方全員のHPを小回復し、選択した味方1人のデバフを解除する。' }
                ]
            },
             pasha: {
                id: 'pasha',
                name: 'パシャ憎',
                title: '暗黒スマホ僧侶',
                type: '闇属性 / サポーター・回復特化',
                hp: 178, atk: 24, def: 19, critRate: 0.06, eva: 21,
                image: 'pasha/pasha.webp',
                allImage: 'pasha/pashaALL.webp',
                dieImage: 'pasha/pashaDIE.webp',
                desc: 'スマホとカメラを駆使するサポーター・回復特化。\n※パッシブ効果: 敵チームに「SPパシャ憎・半浸闇化状態」がいる場合、自身のクリティカル率がバトル開始時から終了時まで10上昇する。\n※ダークモード: バトル中にHPが50を下回ったとき、見た目のみ半浸闇化状態へチェンジし攻撃力が15%アップ！（スキル・性能はパシャ憎を維持）',
                skills: [
                    { id: 'pasha_attack', name: '睨みつける', type: 'attack', power: 1.0, isNormalAttack: true, cooldown: 0, targetType: 'single_enemy', desc: '敵単体に標準ダメージを与える通常攻撃。' },
                    { id: 'pasha_flash', name: 'カメラフラッシュ', type: 'attack', power: 1.10, isNormalAttack: false, cooldown: 3, initialCooldown: 1, targetType: 'all_enemies', desc: '敵全体に小ダメージ＋選択した敵1体を1ターンの間行動不能にする。（開幕1T待機 / CD: 3T）' },
                    { id: 'pasha_roll', name: 'カメラロール', type: 'heal', healAmount: 60, cooldown: 5, initialCooldown: 2, targetType: 'all_allies', desc: '味方全員のHPを60回復。低確率で倒れた味方1人をHP40%で復活（1試合2回まで）。' },
                    { id: 'pasha_darkness', name: '暗黒封印解除', type: 'special', power: 0, isNormalAttack: false, cooldown: 3, initialCooldown: 0, targetType: 'single_ally', desc: '選択した味方1人に暗黒パワーを付与。3ターンの間、そのキャラクターがコマンド実行時にHPが少量ずつランダム回復する。' }
                ]
            },

pasha_dark: {
                id: 'pasha_dark',
                name: 'SPパシャ憎・半浸闇化状態',
                title: '闇に染まりかけし黒き僧侶',
                type: '闇属性 / 超火力・回避特化',
                hp: 163, atk: 25, def: 17, critRate: 0.07, eva: 25,
                image: 'pasha/pasha-dark.webp',
                allImage: 'pasha-dark/pasha-darkALL.webp',
                dieImage: 'pasha-dark/pasha-darkDIE.webp',
                desc: '圧倒的な攻撃力と高回避を誇る超攻撃型。回避するたびに攻撃力が跳ね上がるアビリティを持ち、ハマれば一撃で全てを破壊するロマンと脅威を兼ね備えています。※回避率の上昇量はバトル中累計で最大+50%まで。',
                skills: [
                    { id: 'pasha_dark_attack', name: 'ダークネスフィンガー', type: 'attack', power: 1.0, isNormalAttack: true, cooldown: 0, initialCooldown: 0, targetType: 'single_enemy', desc: '【CD: 0 / 通常攻撃】カメラのフラッシュで単体攻撃。5%の確率で自身の回避率が3%アップする。' },
                    { id: 'pasha_dark_stealth', name: 'ステルスオブダーク', type: 'attack', power: 1.25, isNormalAttack: false, cooldown: 3, initialCooldown: 0, targetType: 'single_enemy', desc: '【CD: 3T / 必中攻撃】敵はこの攻撃を絶対に回避できない。さらに自身の回避率を2%アップする(永続)。' },
                    { id: 'pasha_dark_crime', name: 'パーフェクトクライム', type: 'pasha_crime_skill', cooldown: 2, initialCooldown: 0, targetType: 'self', desc: '【CD: 2T / 回復・デメリット】HPを110回復。だが次の一ターンの間自身の防御力ダウン。' },
                    { id: 'pasha_dark_nightmare', name: 'アブソリュートナイトメア', type: 'pasha_nightmare_skill', power: 1.3, cooldown: 4, initialCooldown: 4, targetType: 'single_enemy', desc: '【CD: 4T / 強力攻撃・デバフ】通常攻撃の1.3倍のダメージを単体に与え、さらに3ターンの間、対象の敵の防御力を大幅ダウンさせる。' }
                ]
            },

            
            iwaba: {
                id: 'iwaba',
                name: '岩盤星人',
                title: '不屈のラップラッパー',
                type: '岩属性 / タンク・耐久強化',
                hp: 195, atk: 22, def: 18, critRate: 0.03, eva: 8,
                image: 'iwaba/ganban.webp',
                allImage: 'iwaba/ganbanALL.webp',
                dieImage: 'iwaba/ganbanDIE.webp',
                desc: 'ダンスとラップと岩盤浴を愛するタンク・耐久強化。パッシブ: ブレイクダンスはごく稀に2回連続ヒットする。',
                skills: [
                    { id: 'iwaba_dance', name: 'ブレイクダンス', type: 'attack', power: 1.15, isNormalAttack: true, cooldown: 0, targetType: 'single_enemy', desc: 'リズムに乗った攻撃。パッシブ効果でごく稀に2回連続ヒットする。' },
                    { id: 'iwaba_rap', name: 'フリースタイル', type: 'buff', buffType: 'def', amount: 1.40, cooldown: 3, targetType: 'all_allies', desc: '魂のラップで3ターンの間、味方全員の防御力を大幅に強化する！' },
                    { id: 'iwaba_song', name: 'ソウルソング', type: 'shield', cooldown: 4, initialCooldown: 1, targetType: 'single_ally', desc: '魂の歌声で傷を癒やす。選択した味方1人は次の相手からの攻撃を1回だけ完全に無効化する。' },
                    { id: 'iwaba_bath', name: '岩盤浴ブースト', type: 'heal_buff', healRate: 0.20, cooldown: 3, targetType: 'all_allies', desc: '温まり効果で2ターンの間、味方全員のHPを毎ターン少量回復＋回避率を中強化！' }
                ]
            },
            momo: {
                id: 'momo',
                name: '桃ピン',
                title: 'ナスを統べる守護要塞',
                type: '土属性 / タンク・一発特化',
                hp: 210, atk: 18, def: 25, critRate: 0.03, eva: 9,
                image: 'momopin/momopin.webp',
                allImage: 'momopin/momopinALL.webp',
                dieImage: 'momopin/momopinDIE.webp',
                chargedImage: 'momopin/chargenasu.webp',
                desc: '圧倒的タフさを誇る要塞。「ナス準備中」で変身し、次ターンに「超ナスちん乱舞」を発動！',
                skills: [
                    { id: 'momo_attack', name: 'ポカポカ叩く', type: 'attack', power: 1.0, isNormalAttack: true, cooldown: 0, targetType: 'single_enemy', desc: '敵単体に標準ダメージを与える通常攻撃。' },
                    { id: 'momo_prep', name: 'ナス準備中', type: 'charge', cooldown: 4, targetType: 'self', desc: '1ターン溜めに入り行動終了。次ターンに「超ナスちん乱舞」が発動（3ターン全味方のクリティカル大幅UP＆敵全体の回避率を3ターンの間ダウン）！' },
                    { id: 'momo_chie', name: 'チエを呼ぶ', type: 'momo_chie_skill', healRate: 0.35, cooldown: 2, targetType: 'self', desc: 'チエを呼び出し自身のHPを小回復＋2ターンの間、自身の回避率を向上させる。' },
                    { id: 'momo_gk', name: 'ゴールキーパー', type: 'defend_buff', initialCooldown: 1, cooldown: 4, targetType: 'all_allies', desc: '1ターンの間、鉄壁の守りで味方全員が受けるすべてのダメージを70%カットする！' }
                ]
            },
            moenan: {
                id: 'moenan',
                name: 'もえなん',
                title: 'トゲ髪のアタッカー',
                type: '火属性 / アタッカー・超攻撃特化',
                hp: 155, atk: 28, def: 14, critRate: 0.18, eva: 12,
                image: 'moenan/moenan.webp',
                allImage: 'moenan/moenanALL.webp',
                dieImage: 'moenan/moenanDIE.webp',
                desc: '鋭い爪の通常攻撃はクリティカル率が高い。「筋トレ追い込み」からの全力投球で敵を圧倒する。',
                skills: [
                    { id: 'moenan_cat', name: '高速猫パンチ', type: 'attack', power: 1.10, isNormalAttack: true, cooldown: 0, targetType: 'single_enemy', desc: '鋭い爪の通常攻撃。他の通常攻撃よりもクリティカル率が高い。' },
                    { id: 'moenan_play', name: 'こももと遊ぶ', type: 'heal_cleanse', healRate: 0.30, cooldown: 2, targetType: 'self', desc: '愛猫に癒やされて自身のHPを小回復＋自身のかかっているデバフを全解除する。' },
                    { id: 'moenan_handball', name: '全力投球', type: 'attack', power: 1.60, isNormalAttack: false, cooldown: 2, targetType: 'single_enemy', desc: '唸りをあげるハンドボールシュートを叩き込み、敵単体に中ダメージを与える！' },
                    { id: 'moenan_workout', name: '筋トレ追い込み', type: 'buff', buffType: 'atk', amount: 2.0, turns: 1, cooldown: 3, targetType: 'self', desc: '筋肉を限界まで追い込み、次の1ターンの間、自分の攻撃力を大幅に向上させる！' }
                ]
            },
            asaiomizu: {
                id: 'asaiomizu',
                name: 'ASAIOMIZU',
                title: 'パーマなナルシスト',
                type: '水属性 / アタッカー・カウンター特化',
                hp: 182, atk: 28, def: 20, critRate: 0.06, eva: 17,
                image: 'asaiomizu/asaiomizu.webp',
                allImage: 'asaiomizu/asaiomizu2.webp',
                dieImage: 'asaiomizu/asaiomizu3.webp',
                desc: '攻撃を受けた際50%でカウンターが発動。「ディグ」で相手の技を偽装・コピーし、「クラブに行く」でクリティカル率を大幅アップ！',
                skills: [
                    { id: 'asaiomizu_attack', name: '髪をかきあげる', type: 'attack', power: 1.15, isNormalAttack: true, cooldown: 0, targetType: 'single_enemy', desc: 'スタイリッシュな動作で敵単体に標準ダメージを与える通常攻撃。' },
                    { id: 'asaiomizu_shoot', name: 'サッカーシュート', type: 'attack', power: 1.80, isNormalAttack: false, cooldown: 2, targetType: 'single_enemy', desc: 'サッカーボールを強烈に蹴り出し、敵単体に特大ダメージを与える！' },
                    { id: 'asaiomizu_dig', name: 'ディグ', type: 'asaiomizu_dig_skill', initialCooldown: 1, cooldown: 3, targetType: 'single_enemy', desc: '通常攻撃に偽装してダメージを与えつつ受けた攻撃技を保存、次ターンにコピー発動する！' },
                    { id: 'asaiomizu_club', name: 'クラブに行く', type: 'asaiomizu_club_skill', cooldown: 3, targetType: 'self', desc: 'クラブでアゲアゲに踊り狂う！2ターンの間、自身のクリティカル率を大幅に向上させる。' }
                ]
            }
        };

        const BOT_ACTION_DELAY = 1700; // 1.5秒〜2秒程度の行動ディレイ（倍速調整対応用定数）

        if (typeof window.BotInputAdapter === 'undefined') {
            window.BotInputAdapter = class BotInputAdapter {
                getDecision(botChar, opponentChar) {
                    if (botChar.isResting) return 'rest';
                    if (botChar.eggplantReady) return 'momo_eggplant_burst';
                    if (botChar.recordedSkill) return 'asaiomizu_copied';

                    if (botChar.id === 'courtney') {
                        const charges = botChar.courtneyChargeCount || 0;
                        if (charges < 8 && Math.random() < 0.6) {
                            return 'courtney_charge_only';
                        }
                    }

                    if (botChar.id === 'dopagaking') {
                        const charges = botChar.dopaChargeCount || 0;
                        if (charges >= 6) {
                            const obey = botChar.skills.find(s => s.id === 'dopa_obey');
                            if (obey) return obey.id;
                        } else if (Math.random() < 0.6) {
                            const charge = botChar.skills.find(s => s.id === 'dopa_charge');
                            if (charge) return charge.id;
                        }
                    }

                    const availableSkills = botChar.skills.filter(s => {
                        const cd = botChar.cooldowns?.[s.id] || 0;
                        if (cd > 0) return false;
                        if (s.id === 'pasha_roll' && (botChar.pashaRollUsedCount || 0) >= 2) return false;
                        if (botChar.id === 'dopagaking' && (s.id === 'dopa_charge' || s.id === 'dopa_charge_skill') && (botChar.dopaChargeCount || 0) >= 6) return false;
                        if (botChar.id === 'dopagaking' && (s.id === 'dopa_obey' || s.id === 'dopa_inheritance') && (botChar.dopaChargeCount || 0) < 6) return false;
                        return true;
                    });
                    const skills = availableSkills.length > 0 ? availableSkills : botChar.skills;
                    const hpRatio = botChar.hp / botChar.maxHp;

                    if (botChar.id === 'ndaihyo') {
                        if (opponentChar.buffAtk >= 1.0) {
                            const tactics = skills.find(s => s.id === 'ndaihyo_tactics');
                            if (tactics) return tactics.id;
                        }
                        if (hpRatio < 0.4) {
                            const mind = skills.find(s => s.id === 'ndaihyo_mind');
                            if (mind) return mind.id;
                        }
                        const analysis = skills.find(s => s.id === 'ndaihyo_analysis');
                        if (analysis) return analysis.id;
                    }

                    if (botChar.id === 'moenan') {
                        const hadDebuff = (botChar.buffAtk < 1.0) || (botChar.buffDef < 1.0) || ((botChar.evaDebuff || 0) > 0);
                        if (hpRatio < 0.6 || hadDebuff) {
                            const play = skills.find(s => s.id === 'moenan_play');
                            if (play) return play.id;
                        }
                    }

                    if (botChar.id === 'pasha') {
                        if (hpRatio < 0.5) {
                            const rollSkill = skills.find(s => s.id === 'pasha_roll');
                            if (rollSkill) return rollSkill.id;
                        }
                        const darknessSkill = skills.find(s => s.id === 'pasha_darkness');
                        if (darknessSkill && (!botChar.darknessPowerTurns || botChar.darknessPowerTurns <= 0)) {
                            if (Math.random() < 0.65) {
                                return darknessSkill.id;
                            }
                        }
                    }

                    if (botChar.id === 'momo') {
                        const prepSkill = skills.find(s => s.id === 'momo_prep');
                        if (prepSkill && !botChar.eggplantReady) {
                            if (Math.random() < 0.6) {
                                return prepSkill.id;
                            }
                        }
                    }

                    const chosen = skills[Math.floor(Math.random() * skills.length)];
                    return chosen ? chosen.id : botChar.skills[0].id;
                }
            };
        }

        class BattleEngine {
            constructor(p1CharId, p2CharId, isOnline = false, myPlayerNum = 1, roomId = null, isNewBattle = false) {
                this.isOnline = isOnline;
                this.myPlayerNum = myPlayerNum;
                this.roomId = roomId;
                this.isNewBattle = isNewBattle;
                this.turn = 1;
                this.turnTimer = 15;
                this.timerId = null;
                this.battleEnded = false;
                this.isSuddenDeath = false;
                this.waitingForOpponent = false;
                this.isProcessing = false;
                this.currentAttacker = null;
                this.turnJustStarted = true;

                this.p1 = this.createBattlePlayer(p1CharId, isOnline ? 'Player 1' : 'Player 1', 1);
                this.p2 = this.createBattlePlayer(p2CharId, isOnline ? 'Player 2' : 'BOT (CPU)', 2);
                this.activeAllyIndex = 0;
                this.waitingForChoice = false;
                this.battleData = { pashaRollUsedCount: 0, pashaRollReviveCount: 0 };

                if (this.isNewBattle) {
                    const allIds = Object.keys(CHARACTER_DATA);
                    const otherAllyIds = allIds.filter(id => id !== p1CharId);
                    const ally2Id = otherAllyIds[Math.floor(Math.random() * otherAllyIds.length)] || 'courtney';
                    const ally3Id = otherAllyIds.filter(id => id !== ally2Id)[Math.floor(Math.random() * (otherAllyIds.length - 1))] || 'ndaihyo';

                    const enemy2Id = allIds[Math.floor(Math.random() * allIds.length)];
                    const enemy3Id = allIds[Math.floor(Math.random() * allIds.length)];

                    this.allies = [
                        this.p1,
                        this.createBattlePlayer(ally2Id, '味方2', 1),
                        this.createBattlePlayer(ally3Id, '味方3', 1)
                    ];
                    this.enemies = [
                        this.p2,
                        this.createBattlePlayer(enemy2Id, '敵2', 2),
                        this.createBattlePlayer(enemy3Id, '敵3', 2)
                    ];
                } else {
                    this.allies = [this.p1];
                    this.enemies = [this.p2];
                }

                this.p1Action = null;
                this.p2Action = null;
                this.p1TargetIndex = null;
                this.p1TargetChar = null;

                this.botAdapter = isOnline ? null : new BotInputAdapter();

                this.onLogUpdate = null;
                this.onTimerUpdate = null;
                this.onStateChange = null;
                this.onVisualEffect = null;
                this.onBattleEnd = null;
                this.onCutin = null;

                this.firestoreUnsub = null;
                this.lastProcessedTurn = 0;
                this.heartbeatTimer = null;
                this.currentTurnLogs = [];
                this.battleLogs = [];
                this.onlineSyncStarted = false;
                this.latestRoomData = null;

                this.elapsedSeconds = 0;
                this.elapsedTimerId = null;
                this.onElapsedTimerUpdate = null;
            }

            startElapsedTimer() {
                this.stopElapsedTimer();
                this.elapsedSeconds = 0;
                this.elapsedTimerId = setInterval(() => {
                    this.elapsedSeconds++;
                    if (this.onElapsedTimerUpdate) {
                        this.onElapsedTimerUpdate(this.elapsedSeconds);
                    }
                }, 1000);
            }

            stopElapsedTimer() {
                if (this.elapsedTimerId) {
                    clearInterval(this.elapsedTimerId);
                    this.elapsedTimerId = null;
                }
            }

            checkActiveAllyStatus() {
                if (!this.isNewBattle || this.battleEnded || this.waitingForChoice) return false;
                const currentActiveAlly = this.allies[this.activeAllyIndex || 0];
                if (currentActiveAlly && currentActiveAlly.hp <= 0) {
                    if (this.allies.every(a => a.hp <= 0)) {
                        this.battleEnded = true;
                        this.stopTimer();
                        this.stopElapsedTimer();
                        if (this.onBattleEnd) this.onBattleEnd('💀 敵チームの勝利！');
                        return true;
                    } else {
                        this.stopTimer();
                        this.stopElapsedTimer();
                        this.waitingForChoice = true;
                        if (this.onStateChange) this.onStateChange(this);
                        return true;
                    }
                }
                return false;
            }

            getCharacterTeam(char) {
                if (!char) return 'system';
                if (this.allies && this.allies.includes(char)) return 'ally';
                if (this.enemies && this.enemies.includes(char)) return 'enemy';
                if (char === this.p1) return 'ally';
                if (char === this.p2) return 'enemy';
                return 'system';
            }



            logTeam(actor, msg, colorClass = 'text-slate-200') {
                const teamType = this.getCharacterTeam(actor);
                const prefix = teamType === 'ally' ? '【味方】' : (teamType === 'enemy' ? '【敵】' : '');
                if (actor && actor.id === 'asaiomizu' && (msg.includes('ディグ') || msg.includes('dig'))) {
                    if (teamType === 'enemy') {
                        this.log(`${prefix}${actor.charName} の 「髪をかきあげる」！`, 'text-slate-200', teamType);
                        return;
                    }
                }
                this.log(`${prefix}${actor ? actor.charName : ''} ${msg}`, colorClass, teamType);
            }

            log(msg, colorClass = 'text-slate-200', teamType = 'system') {
                if (this.currentTurnLogs) {
                    this.currentTurnLogs.push({ msg, colorClass, teamType });
                }
                if (this.battleLogs) {
                    this.battleLogs.push({ msg, colorClass, teamType });
                }
                if (this.onLogUpdate) {
                    this.onLogUpdate(msg, colorClass, teamType);
                }
            }













            createBattlePlayer(charId, displayName, playerNum = 1) {
                const master = CHARACTER_DATA[charId] || CHARACTER_DATA.pasha;

                let hp = master.hp;
                let atk = master.atk;
                let def = master.def;
                let critRate = master.critRate || 0.05;
                let eva = master.eva;

                if (this.isNewBattle && playerNum === 1 && !['dopagaking', 'courtney', 'pasha_dark'].includes(charId)) {
                    const custom = playerState.newBattleCustomStats && playerState.newBattleCustomStats[charId];
                    if (custom) {
                        hp = custom.hp;
                        atk = custom.atk;
                        def = custom.def;
                        critRate = custom.critRate / 100;
                        eva = custom.eva;
                    }
                } else if (charId === 'dopagaking') {
                    hp = Math.floor(Math.random() * (250 - 130 + 1)) + 130;
                    atk = Math.floor(Math.random() * (28 - 7 + 1)) + 7;
                    def = Math.floor(Math.random() * (17 - 7 + 1)) + 7;
                    eva = Math.floor(Math.random() * (22 - 8 + 1)) + 8;
                    critRate = 0.05;
                }

                return {
                    id: master.id,
                    name: displayName,
                    charName: master.name,
                    title: master.title,
                    type: master.type,
                    hp: hp,
                    maxHp: hp,
                    atk: atk,
                    def: def,
                    critRate: critRate,
                    eva: eva,
                    skills: master.skills.map(s => ({ ...s })),
                    cooldowns: (() => {
                        const cds = {};
                        master.skills.forEach(s => {
                            if (s.initialCooldown) cds[s.id] = s.initialCooldown;
                        });
                        return cds;
                    })(),
                    buffAtk: 1.0,
                    buffDef: 1.0,
                    buffAtkTurns: 0,
                    dopaChargeCount: charId === 'dopagaking' ? 0 : 0,
                    selectedInheritChar: null,
                    maxHpRandom: hp,
                    courtneyChargeCount: master.id === 'courtney' ? 0 : 0,
                    tempEvadeNext: false,
                    pashaKillerUsed: false,
                    isResting: false,
                    digActive: false,
                    digUsedTurn: 0,
                    recordedSkill: null,
                    eggplantReady: false,
                    isMiniZou: false,
                    momoRevived: false,
                    isDarkMode: false,
                    defendBuffTurns: 0,
                    crimeDefDownTurns: 0,
                    nightmareDefTurns: 0,
                    yoseruZeroDefTurns: 0,
                    nightmareAtkActive: false,
                    critRateBonus: 0,
                    critBuffTurns: 0,
                    evaDebuff: 0,
                    enemyEvaTurns: 0,
                    momoEvaTurns: 0,
                    asaiomizuCritTurns: 0,
                    pashaPassiveActive: false,
                    stunTurns: 0,
                    darknessPowerTurns: 0,
                    darknessAppliedTurn: 0,
                    pashaRollUsedCount: 0,
                    pashaRollReviveCount: 0,
                    iwabaBathTurns: 0,
                    iwabaEvaBonus: 0,
                    ndaihyoTacticsTurns: 0
                };
            }

            checkPashaPassive() {
                const alliesList = this.allies || [this.p1];
                const enemiesList = this.enemies || [this.p2];

                const checkTeamForPashaDark = (team) => {
                    return team && team.some(c => c.hp > 0 && c.id === 'pasha_dark');
                };

                const checkAndApply = (pashaChar, opposingTeam) => {
                    if (!pashaChar || pashaChar.hp <= 0) return;
                    const hasPashaDark = checkTeamForPashaDark(opposingTeam);
                    const wasActive = pashaChar.pashaPassiveActive;
                    pashaChar.pashaPassiveActive = hasPashaDark;

                    if (hasPashaDark) {
                        if (!wasActive) {
                            this.log(`✨ パシャ憎のパッシブスキル発動！対パシャ憎効果によりクリティカル率が上昇した！`, 'text-yellow-300 font-bold');
                            const side = (this.allies && this.allies.includes(pashaChar)) || pashaChar === this.p1 ? 'Player' : 'Enemy';
                            this.triggerEffect(side, 'buff', 'パッシブ発動!');
                            if (typeof this.triggerCutin === 'function') {
                                this.triggerCutin('✨ パッシブスキル発動！', '対パシャ憎効果によりクリティカル率上昇！');
                            }
                            if (typeof triggerNewBattleCharacterEffect === 'function') {
                                triggerNewBattleCharacterEffect(pashaChar, 'buff', 'パッシブ!');
                            } else if (typeof triggerCharacterEffect === 'function') {
                                triggerCharacterEffect(pashaChar, 'buff', 'パッシブ!');
                            }
                        }
                    }
                };

                alliesList.forEach(a => {
                    if (a.id === 'pasha') {
                        checkAndApply(a, enemiesList);
                    }
                });
                enemiesList.forEach(e => {
                    if (e.id === 'pasha') {
                        checkAndApply(e, alliesList);
                    }
                });
            }

            checkPashaDarkMode(char) {
                if (char && char.id === 'pasha' && char.hp > 0 && char.hp < 50 && !char.isDarkMode) {
                    char.isDarkMode = true;
                    char.image = 'pasha/pasha-dark.webp';
                    char.allImage = 'pasha-dark/pasha-darkALL.webp';
                    char.dieImage = 'pasha-dark/pasha-darkDIE.webp';
                    char.atk = Math.round(char.atk * 1.15);

                    this.log(`🌙 ${char.charName} はHPが50を下回り、ダークモード（半浸闇化状態）に覚醒した！ 攻撃力が15%アップし、姿が変化した！`, 'text-purple-300 font-bold text-base');
                    if (typeof audioSystem !== 'undefined' && audioSystem.playAwakening) audioSystem.playAwakening();
                    if (typeof this.triggerCutin === 'function') {
                        this.triggerCutin('🌙 ダークモード覚醒！', `${char.charName}が半浸闇化状態へチェンジ＆攻撃力15%アップ！`);
                    }
                    const side = (this.allies && this.allies.includes(char)) || char === this.p1 ? 'Player' : 'Enemy';
                    this.triggerEffect(side, 'buff', 'ダークモード', char);
                    if (this.onStateChange) this.onStateChange(this);
                }
            }

            startBattle() {
                this.log(`⚔️ バトル開始！ 【${this.p1.charName}】 VS 【${this.p2.charName}】`, 'text-amber-300 font-bold');
                this.checkPashaPassive();
                
                // 先攻決定ロジック (所持DOPAが多い方が先攻。同額の場合およびBOT戦では50%のランダム判定)
                let firstStrikerNum = 1;
                if (!this.isOnline) {
                    firstStrikerNum = Math.random() < 0.5 ? 1 : 2;
                    this.log(`🎲 BOT戦のため、50%のランダム判定により【${firstStrikerNum === 1 ? this.p1.charName : this.p2.charName}】が先攻を獲得！`, 'text-amber-300 font-bold');
                } else {
                    const p1Dopa = (this.myPlayerNum === 1) ? playerState.dopa : (this.latestRoomData?.p1Profile?.dopa ?? 1000);
                    const p2Dopa = (this.myPlayerNum === 2) ? playerState.dopa : (this.latestRoomData?.p2Profile?.dopa ?? 1000);
                    if (p1Dopa > p2Dopa) {
                        firstStrikerNum = 1;
                        this.log(`💰 所持DOPA比較 (自分:${formatDopa(p1Dopa)} vs 相手:${formatDopa(p2Dopa)}) により、【${this.p1.charName}】が先攻を獲得！`, 'text-amber-300 font-bold');
                    } else if (p2Dopa > p1Dopa) {
                        firstStrikerNum = 2;
                        this.log(`💰 所持DOPA比較 (自分:${formatDopa(p1Dopa)} vs 相手:${formatDopa(p2Dopa)}) により、【${this.p2.charName}】が先攻を獲得！`, 'text-amber-300 font-bold');
                    } else {
                        firstStrikerNum = Math.random() < 0.5 ? 1 : 2;
                        this.log(`💰 所持DOPA同額のため、50%のランダム判定により【${firstStrikerNum === 1 ? this.p1.charName : this.p2.charName}】が先攻を獲得！`, 'text-amber-300 font-bold');
                    }
                }
                this.firstStrikerPlayerNum = firstStrikerNum;

                const myChar = (this.isOnline && this.myPlayerNum === 2) ? this.p2 : this.p1;
                if (myChar.id === 'dopagaking') {
                    const statusBody = `【SPドパガキングのステータス決定！】\n` +
                        `HP：${myChar.hp}\n` +
                        `攻撃力：${myChar.atk}\n` +
                        `防御力：${myChar.def}\n` +
                        `回避率：${myChar.eva}%\n` +
                        `クリティカル率：${Math.round(myChar.critRate * 100)}%`;
                    
                    showModal("👑 SPドパガキング参戦", statusBody);
                }

                if (this.isOnline && this.roomId) {
                    this.initOnlineSync();
                } else {
                    this.startTimer();
                }
                this.startElapsedTimer();
                
                if (this.onStateChange) this.onStateChange(this);
            }

            async initOnlineSync() {

                     if (this.onlineSyncStarted) return;
                     this.onlineSyncStarted = true;
                const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', this.roomId);
                
                if (this.myPlayerNum === 1) {
                    try {
                        await window.fbUpdateDoc(roomRef, {
                            currentTurn: 1,
                            p1Action: null,
                            p2Action: null,
                            p1ActionTurn: 0,
                            p2ActionTurn: 0,
                            lastProcessedTurn: 0,
                            p1State: this.serializePlayer(this.p1),
                            p2State: this.serializePlayer(this.p2),
                            isSuddenDeath: false,
                            battleEnded: false,
                            p1LastSeen: Date.now()
                        });
                    } catch(e) {
                        console.error("Init online doc error", e);
                    }
                }

                this.heartbeatTimer = setInterval(async () => {
                    if (this.battleEnded || !this.isOnline) return;
                    try {
                        const field = this.myPlayerNum === 1 ? 'p1LastSeen' : 'p2LastSeen';
                        await window.fbUpdateDoc(roomRef, { [field]: Date.now() });
                    } catch(e){}
                }, 4000);

                this.firestoreUnsub = window.fbOnSnapshot(roomRef, (snapshot) => {
                    const data = snapshot.data();
                    if (!data) return;
                    this.latestRoomData = data;

                    const oppLastSeen = this.myPlayerNum === 1 ? data.p2LastSeen : data.p1LastSeen;
                    if (oppLastSeen && (Date.now() - oppLastSeen > 20000) && !this.battleEnded && this.isOnline) {
                        this.log('⚠️ 相手との接続が切断されたため、BOT戦へ切り替えます。', 'text-amber-400 font-bold');
                        this.fallbackToBotMode();
                        return;
                    }

                    if (this.myPlayerNum === 1) {
                        if (data.p1ActionTurn === this.turn && data.p2ActionTurn === this.turn && this.lastProcessedTurn < this.turn) {
                            this.p1Action = data.p1Action;
                            this.p2Action = data.p2Action;
                            this.lastProcessedTurn = this.turn;
                            this.stopTimer();
                            this.processTurn();
                        }
                    } else {
                        if (data.lastProcessedTurn >= this.turn) {
                            this.deserializePlayer(this.p1, data.p1State);
                            this.deserializePlayer(this.p2, data.p2State);
                            this.isSuddenDeath = data.isSuddenDeath;
                            this.turn = data.currentTurn;
                this.p1Action = null;
                this.p2Action = null;
                this.p1TargetIndex = null;
                            this.waitingForOpponent = false;

                            if (data.logs && data.logs.length > 0) {
                                data.logs.forEach(l => {
                                    if (this.battleLogs) {
                                        this.battleLogs.push({ msg: l.msg, colorClass: l.colorClass, teamType: l.teamType || 'system' });
                                    }
                                    if (this.onLogUpdate) this.onLogUpdate(l.msg, l.colorClass, l.teamType || 'system');
                                    if (l.effect && this.onVisualEffect) this.onVisualEffect(l.effect.side, l.effect.type, l.effect.text);
                                    if (l.cutin && this.onCutin) this.onCutin(l.cutin.title, l.cutin.subtitle);
                                });
                            }

                            if (data.battleEnded) {
                                if (!this.statsRecorded) {
                                    this.statsRecorded = true;
                                    let result = 'draw';
                                    if (this.p2.hp > 0 && this.p1.hp <= 0) result = 'win';
                                    else if (this.p2.hp <= 0 && this.p1.hp > 0) result = 'lose';
                                    else result = 'draw';

                                     const myCharId = this.p2.id;
                                     const oppChar = this.p1;
                                     const oppCharId = oppChar.id;
                                     const oppName = data.p1Profile?.playerName || oppChar.charName || '対戦相手';
                                     const oppIcon = data.p1Profile?.selectedIcon || oppChar.id;
                                     const oppProfile = data.p1Profile || null;

                                     if (typeof recordBattleResult === 'function') {
                                         recordBattleResult(result, myCharId, oppName, oppIcon, false, 'online_p1', oppProfile, oppCharId);
                                     }
                                }

                                this.battleEnded = true;
                                this.stopTimer();
                                if (this.onBattleEnd) this.onBattleEnd(data.winnerText);
                            } else {
                                this.startTimer();
                            }

                            if (this.onStateChange) this.onStateChange(this);
                        }
                    }
                }, (err) => {
                    console.error("Firestore listener error:", err);
                    this.fallbackToBotMode();
                });

                this.startTimer();
            }

            fallbackToBotMode() {
                this.isOnline = false;
                this.botAdapter = new BotInputAdapter();
                if (this.firestoreUnsub) {
                    this.firestoreUnsub();
                    this.firestoreUnsub = null;
                }
                if (this.heartbeatTimer) {
                    clearInterval(this.heartbeatTimer);
                    this.heartbeatTimer = null;
                }
                this.waitingForOpponent = false;
                this.startTimer();
                if (this.onStateChange) this.onStateChange(this);
            }

            serializePlayer(p) {
    return {
        hp: p.hp,
        maxHp: p.maxHp,
        atk: p.atk,
        def: p.def,
        critRate: p.critRate !== undefined ? p.critRate : 0.05,
        eva: p.eva,
        buffAtk: p.buffAtk,
        buffDef: p.buffDef,
        buffAtkTurns: p.buffAtkTurns || 0,
        cooldowns: { ...p.cooldowns },
        courtneyChargeCount: p.courtneyChargeCount !== undefined ? p.courtneyChargeCount : 0,
        dopaChargeCount: p.dopaChargeCount !== undefined ? p.dopaChargeCount : 0,
        selectedInheritChar: p.selectedInheritChar || null,
        tempEvadeNext: p.tempEvadeNext,
        pashaKillerUsed: p.pashaKillerUsed,
        isResting: p.isResting,
        digActive: p.digActive,
        digUsedTurn: p.digUsedTurn,
        recordedSkill: p.recordedSkill ? { ...p.recordedSkill } : null,
        eggplantReady: p.eggplantReady,
        isMiniZou: p.isMiniZou,
        momoRevived: p.momoRevived,
        isDarkMode: p.isDarkMode,
        defendBuffTurns: p.defendBuffTurns,
        crimeDefDownTurns: p.crimeDefDownTurns || 0,
        nightmareDefTurns: p.nightmareDefTurns || 0,
        nightmareAtkActive: !!p.nightmareAtkActive
    };
}

            deserializePlayer(p, state) {
                if (!state) return;
                p.hp = state.hp;
                p.maxHp = state.maxHp;
                if (state.atk !== undefined) p.atk = state.atk;
                if (state.def !== undefined) p.def = state.def;
                if (state.critRate !== undefined) p.critRate = state.critRate;
                if (state.eva !== undefined) p.eva = state.eva;
                p.buffAtk = state.buffAtk;
                p.buffDef = state.buffDef;
                p.buffAtkTurns = state.buffAtkTurns || 0;
                p.cooldowns = { ...state.cooldowns };
                p.courtneyChargeCount = state.courtneyChargeCount;
                p.dopaChargeCount = state.dopaChargeCount !== undefined ? state.dopaChargeCount : 0;
                p.selectedInheritChar = state.selectedInheritChar || null;
                p.tempEvadeNext = state.tempEvadeNext;
                p.pashaKillerUsed = state.pashaKillerUsed;
                p.isResting = state.isResting;
                p.digActive = state.digActive;
                p.digUsedTurn = state.digUsedTurn;
                p.recordedSkill = state.recordedSkill ? { ...state.recordedSkill } : null;
                p.eggplantReady = state.eggplantReady;
                p.isMiniZou = state.isMiniZou;
                p.momoRevived = state.momoRevived;
                p.isDarkMode = state.isDarkMode;
                p.defendBuffTurns = state.defendBuffTurns;
                p.crimeDefDownTurns = state.crimeDefDownTurns || 0;
                p.nightmareDefTurns = state.nightmareDefTurns || 0;
                p.nightmareAtkActive = !!state.nightmareAtkActive;
            }

            startTimer() {
                this.stopTimer();
                if (this.p1.hp > 0 && this.p1.eggplantReady && !this.p1Action && !this.battleEnded) {
                    setTimeout(() => {
                        if (this.p1.eggplantReady && !this.p1Action) {
                            this.submitAction(1, 'momo_eggplant_burst');
                        }
                    }, 400);
                    return;
                }
                this.turnTimer = 15;
                if (this.onTimerUpdate) this.onTimerUpdate(this.turnTimer);

                this.timerId = setInterval(() => {
                    this.turnTimer--;
                    if (this.onTimerUpdate) this.onTimerUpdate(this.turnTimer);

                    if (this.turnTimer <= 0) {
                        this.stopTimer();
                        this.handleTimeOut();
                    }
                }, 1000);
            }

            stopTimer() {
                if (this.timerId) {
                    clearInterval(this.timerId);
                    this.timerId = null;
                }
            }

            handleTimeOut() {
                if (this.battleEnded) return;
                this.log('⏰ 制限時間切れ！自動選択します。', 'text-amber-400 font-bold');

                const p1Default = this.p1.isResting ? 'rest' : (this.p1.eggplantReady ? 'momo_eggplant_burst' : this.p1.skills[0].id);
                const p2Default = this.p2.isResting ? 'rest' : (this.p2.eggplantReady ? 'momo_eggplant_burst' : this.p2.skills[0].id);

                if (this.isOnline) {
                    if (this.myPlayerNum === 1 && !this.p1Action) this.submitAction(1, p1Default);
                    if (this.myPlayerNum === 2 && !this.p2Action) this.submitAction(2, p2Default);
                } else {
                    if (!this.p1Action) this.p1Action = p1Default;
                    if (!this.p2Action) this.p2Action = p2Default;
                    this.processTurn();
                }
            }

            async submitAction(pNum, skillId) {
                if (this.battleEnded) return;
                if (pNum === 1 && this.p1Action) return;
                if (pNum === 2 && this.p2Action) return;
                if (this.waitingForOpponent) return;







                if (this.isOnline) {
    if (pNum !== this.myPlayerNum) return;
    this.waitingForOpponent = true;
    if (this.onStateChange) this.onStateChange(this);

    const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', this.roomId);
    const updateObj = pNum === 1 
        ? { p1Action: skillId, p1ActionTurn: this.turn }
        : { p2Action: skillId, p2ActionTurn: this.turn };

                    try {
                        await window.fbUpdateDoc(roomRef, updateObj);
                    } catch (e) {
                        console.error("Action submit error", e);
                        this.fallbackToBotMode();
                    }
                } else {
                    if (pNum === 1) {
                        this.p1Action = skillId;
                        if (this.isNewBattle) {
                            this.stopTimer();
                            this.isProcessing = true;
                            this.turnJustStarted = false;
                            if (this.onStateChange) this.onStateChange(this);
                            this.processTurn();
                            return;
                        }
                    }
                    if (pNum === 2) this.p2Action = skillId;

                    if (this.p1Action && !this.p2Action) {
                        this.p2Action = this.botAdapter.getDecision(this.p2, this.p1);
                    }

                    if (this.p1Action && this.p2Action) {
                        this.stopTimer();
                        this.processTurn();
                    } else {
                        if (this.onStateChange) this.onStateChange(this);
                    }
                }
            }

            async processTurn() {
                this.isProcessing = true;
                this.turnJustStarted = false;
                this.currentTurnLogs = [];

                const allFighters = this.isNewBattle ? [...this.allies, ...this.enemies] : [this.p1, this.p2];
                allFighters.forEach(p => {
                    if (p && p.hp > 0) {
                        this.checkPashaDarkMode(p);
                    }
                });

                this.checkPashaPassive();

                if (this.isSuddenDeath) {
                    this.log(`--- [ ターン ${this.turn} (🔥サドンデス) ] ---`, 'text-red-400 font-bold text-center');
                } else {
                    this.log(`--- [ ターン ${this.turn} ] ---`, 'text-slate-400 font-bold text-center');
                }

                if (this.isNewBattle) {
                    const ally1Action = this.p1Action || (this.p1.isResting ? 'rest' : this.p1.skills[0].id);

                    // 1. プレイヤーのキャラクター (p1) はボタンを押した瞬間に遅延なく即座に行動を実行・ダメージ反映・HPバー更新を行う
                    if (this.p1.hp > 0) {
                        this.currentAttacker = this.p1;
                        if (this.onStateChange) this.onStateChange(this);

                        const opponents = this.enemies.filter(e => e.hp > 0);
                        if (opponents.length > 0) {
                            const recordedRec = (this.p1.id === 'asaiomizu') ? this.p1.recordedSkill : null;
                            const skill = (this.p1.id === 'asaiomizu' && ally1Action === 'asaiomizu_copied' && recordedRec) ? { targetType: recordedRec.targetType || 'single_enemy', ...recordedRec } : (this.p1.skills.find(s => s.id === ally1Action) || this.p1.skills[0]);
                            const targetList = (skill.targetType === 'single_ally') ? this.allies.filter(a => a.hp > 0) : opponents;
                            const targetTeamArr = (skill.targetType === 'single_ally') ? this.allies : this.enemies;

                            let defender = targetList && targetList.length > 0 ? targetList[Math.floor(Math.random() * targetList.length)] : opponents[0];
                            if (this.p1TargetChar && this.p1TargetChar.hp > 0 && targetList.includes(this.p1TargetChar)) {
                                defender = this.p1TargetChar;
                            } else if (this.p1TargetIndex !== null && targetTeamArr[this.p1TargetIndex] && targetTeamArr[this.p1TargetIndex].hp > 0 && targetList.includes(targetTeamArr[this.p1TargetIndex])) {
                                defender = targetTeamArr[this.p1TargetIndex];
                            } else if (targetList.length > 0) {
                                defender = targetList[0];
                            }

                            this.executePlayerAction(this.p1, defender, ally1Action);
                            if (this.onStateChange) this.onStateChange(this);

                            if (await this.checkWinner()) return;
                        }
                    }

                    // 2. 残りの味方 (ally2, ally3) と敵チームの行動を処理
                    const executeTeamRest = async (teamList, isAllyTeam) => {
                        for (let i = 0; i < teamList.length; i++) {
                            const attacker = teamList[i];
                            if (isAllyTeam && attacker === this.p1) continue;
                            if (attacker.hp <= 0) continue;

                            this.currentAttacker = attacker;
                            if (this.onStateChange) this.onStateChange(this);

                            await new Promise(resolve => setTimeout(resolve, BOT_ACTION_DELAY));

                            const targetPool = isAllyTeam ? this.enemies.filter(e => e.hp > 0) : this.allies.filter(a => a.hp > 0);
                            const defaultOpponent = targetPool[0] || (isAllyTeam ? this.enemies[0] : this.allies[0]);
                            const skillId = this.botAdapter.getDecision(attacker, defaultOpponent);

                            const skill = attacker.skills.find(s => s.id === skillId) || attacker.skills[0];
                            const tList = isAllyTeam ? this.allies : this.enemies;
                            const opposingTeam = isAllyTeam ? this.enemies : this.allies;
                            const opponents = (skill.targetType === 'single_ally') ? tList.filter(a => a.hp > 0) : opposingTeam.filter(e => e.hp > 0);
                            if (opponents.length === 0) break;
                            let defender = opponents[Math.floor(Math.random() * opponents.length)];
                            if (skill.targetType === 'single_ally') {
                                const unbuffed = opponents.filter(a => !a.darknessPowerTurns || a.darknessPowerTurns <= 0);
                                defender = unbuffed.length > 0 ? unbuffed[Math.floor(Math.random() * unbuffed.length)] : opponents[Math.floor(Math.random() * opponents.length)];
                            } else if (isAllyTeam) {
                                if (this.p1TargetChar && this.p1TargetChar.hp > 0 && opponents.includes(this.p1TargetChar)) {
                                    defender = this.p1TargetChar;
                                } else if (this.p1TargetIndex !== null && this.enemies[this.p1TargetIndex] && opponents.includes(this.enemies[this.p1TargetIndex])) {
                                    defender = this.enemies[this.p1TargetIndex];
                                }
                            }

                            this.executePlayerAction(attacker, defender, skillId);
                            if (this.onStateChange) this.onStateChange(this);

                            if (await this.checkWinner()) return true;
                        }
                        return false;
                    };

                    const isAlliesFirst = (this.turn % 2 === 1) ? (this.firstStrikerPlayerNum === 1) : (this.firstStrikerPlayerNum !== 1);

                    if (isAlliesFirst) {
                        if (await executeTeamRest(this.allies, true)) return;
                        if (await executeTeamRest(this.enemies, false)) return;
                    } else {
                        if (await executeTeamRest(this.enemies, false)) return;
                        if (await executeTeamRest(this.allies, true)) return;
                    }

                    this.p1TargetIndex = null;
                    this.endTurnPhase();
                } else {
                    // 2ターン目以降は完全交互ターン制で進行（奇数ターン:先攻が先、偶数ターン:後攻が先）
                    const isP1FirstThisTurn = (this.turn % 2 === 1) ? (this.firstStrikerPlayerNum === 1) : (this.firstStrikerPlayerNum !== 1);

                    let first, second, firstAction, secondAction;
                    if (isP1FirstThisTurn) {
                        first = this.p1; firstAction = this.p1Action;
                        second = this.p2; secondAction = this.p2Action;
                    } else {
                        first = this.p2; firstAction = this.p2Action;
                        second = this.p1; secondAction = this.p1Action;
                    }

                    this.executePlayerAction(first, second, firstAction);
                    if (!await this.checkWinner()) {
                        if (firstAction === 'pasha_dark_nightmare' && first.id === 'pasha_dark') {
                            this.endTurnPhase();
                        } else {
                            this.executePlayerAction(second, first, secondAction);
                            if (!await this.checkWinner()) {
                                this.endTurnPhase();
                            }
                        }
                    }
                }

                if (this.isOnline && this.myPlayerNum === 1) {
                    const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', this.roomId);
                    try {
                        await window.fbUpdateDoc(roomRef, {
                            currentTurn: this.turn,
                            lastProcessedTurn: this.lastProcessedTurn,
                            p1State: this.serializePlayer(this.p1),
                            p2State: this.serializePlayer(this.p2),
                            isSuddenDeath: this.isSuddenDeath,
                            battleEnded: this.battleEnded,
                            winnerText: this.winnerText || '',
                            logs: this.currentTurnLogs,
                            p1Action: null,
                            p2Action: null,
                            p1ActionTurn: 0,
                            p2ActionTurn: 0
                        });
                    } catch(e) {
                        console.error("Sync host state error", e);
                    }
                }

                this.currentAttacker = null;
                this.isProcessing = false;
                this.turnJustStarted = true;
                this.p1Action = null;
                this.p2Action = null;
                this.p1TargetIndex = null;
                this.p1TargetChar = null;
                this.waitingForOpponent = false;

                if (this.onStateChange) this.onStateChange(this);
                if (!this.battleEnded) {
                    this.startTimer();
                    if (this.isNewBattle && this.onCutin) {
                        this.onCutin("🟢 自分のターンです！", `ターン ${this.turn} - 味方チームの行動を選択してください`);
                    }
                }
            }

          executePlayerAction(attacker, defender, skillId) {
                if (attacker.hp <= 0) return;

                if (attacker.darknessPowerTurns && attacker.darknessPowerTurns > 0 && attacker.hp > 0) {
                    if (skillId !== 'pasha_darkness' || attacker.darknessAppliedTurn !== this.turn) {
                        attacker.darknessPowerTurns--;
                        const hAmt = Math.floor(Math.random() * 16) + 15;
                        const prevHp = attacker.hp;
                        attacker.hp = Math.min(attacker.maxHp, attacker.hp + hAmt);
                        const actualHeal = attacker.hp - prevHp;
                        if (actualHeal > 0) {
                            this.log(`🦇 ${attacker.charName} は暗黒パワーにより、コマンド実行時にHPが ${actualHeal} 回復した！（残り ${attacker.darknessPowerTurns}T）`, 'text-purple-300 font-bold');
                            this.triggerEffect((this.getCharacterTeam && this.getCharacterTeam(attacker) === 'ally') || attacker === this.p1 ? 'Player' : 'Enemy', 'heal', `+${actualHeal}`, attacker);
                            if (typeof audioSystem !== 'undefined' && audioSystem.playHeal) audioSystem.playHeal();
                            if (typeof this.checkPashaDarkMode === 'function') this.checkPashaDarkMode(attacker);
                        }
                    }
                }

                if (attacker.stunTurns > 0) {
                    attacker.stunTurns--;
                    this.log(`💫 ${attacker.charName} は行動不能で動けない！`, 'text-amber-400 font-bold');
                    this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'miss', '行動不能');
                    if (typeof triggerNewBattleCharacterEffect === 'function') {
                        triggerNewBattleCharacterEffect(attacker, 'miss', '行動不能');
                    }
                    return;
                }

                if (attacker.eggplantReady) {
                    skillId = 'momo_eggplant_burst';
                }

                if (attacker.isResting) {
                    attacker.isResting = false;
                    this.log(`💤 ${attacker.charName} は前ターンの反動で動けない！（行動不能）`, 'text-slate-400 font-bold');
                    this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'miss', '行動不能');
                    return;
                }

                if (skillId === 'courtney_charge_only' || skillId === 'courtney_charge') {
                    if ((attacker.courtneyChargeCount || 0) < 8) {
                        attacker.courtneyChargeCount = (attacker.courtneyChargeCount || 0) + 1;
                    }

                    const side = (this.getCharacterTeam && this.getCharacterTeam(attacker) === 'ally') || attacker === this.p1 ? 'Player' : 'Enemy';
                    this.log(`⚡ ${attacker.charName} は 「FEEL SO HOT ///」 のチャージを進めた！（現在チャージ: ${attacker.courtneyChargeCount}/8回）`, 'text-pink-400 font-bold font-pixel');
                    if (typeof audioSystem !== 'undefined' && audioSystem.playBuff) audioSystem.playBuff();
                    
                    // チャージ加算時のポップアップ表示
                    this.triggerEffect(side, 'pink', `💖 チャージ+1 (${attacker.courtneyChargeCount}/8)`, attacker);
                    
                    if (attacker.courtneyChargeCount >= 8) {
                        if (typeof this.triggerCutin === 'function') {
                            this.triggerCutin('💖 MAXチャージ完了！', '「FEEL SO HOT ///」最大威力解放可能！（150ダメージ）');
                        }
                    }
                    return;
                }

                if (skillId === 'dopa_charge' || skillId === 'dopa_charge_skill' || skillId === 'dopa_charge_step') {
                    if ((attacker.dopaChargeCount || 0) >= 6) {
                        this.log(`👑 ${attacker.charName} はすでに最大チャージ（6/6）です！「王に従え」を発動してください！`, 'text-amber-400 font-bold');
                        return;
                    }
                }

                let skill = null;


                if (skillId === 'momo_eggplant_burst') {
                    skill = {
                        id: 'momo_eggplant_burst',
                        name: '🍆 超ナスちん乱舞',
                        type: 'eggplant_burst',
                        power: 1.5,
                        isNormalAttack: false,
                        cooldown: 0,
                        targetType: 'all_enemies'
                    };
                } else if (skillId === 'dopa_obey_copy' && window.newBattleTargetSelectCopiedSkill) {
                    const rec = window.newBattleTargetSelectCopiedSkill;
                    skill = {
                        id: 'dopa_obey_copy',
                        name: `👑【王に従え】${rec.name}`,
                        type: rec.type || 'attack',
                        power: rec.power || 1.0,
                        isNormalAttack: false,
                        cooldown: 0,
                        targetType: rec.targetType || 'single_enemy',
                        ...rec
                    };
                } else if (skillId === 'asaiomizu_copied' && attacker.id === 'asaiomizu' && attacker.recordedSkill) {
                    const rec = attacker.recordedSkill;
                    skill = {
                        ...rec,
                        id: 'asaiomizu_copied',
                        originalId: rec.id,
                        name: `📋【コピー】${rec.name}`,
                        isNormalAttack: false,
                        cooldown: 0
                    };
                } else {
                    skill = attacker.skills.find(s => s.id === skillId);
                }

                if (!skill) skill = attacker.skills[0];

                if (skill.cooldown > 0 && skill.id !== 'asaiomizu_copied' && skill.id !== 'momo_eggplant_burst' && skill.id !== 'dopa_obey_copy') {
                    attacker.cooldowns[skill.id] = skill.cooldown + 1;
                }

                this.applySkill(attacker, defender, skill);

                if (skillId === 'asaiomizu_copied' || (skill && skill.id === 'asaiomizu_copied')) {
                    attacker.recordedSkill = null;
                    if (this.p1 && attacker.id === 'asaiomizu') {
                        this.p1.recordedSkill = null;
                    }
                }
                if (skillId === 'dopa_obey_copy' || skillId === 'dopa_obey') {
                    attacker.dopaChargeCount = 0;
                    attacker.selectedInheritChar = null;
                    attacker.selectedObeyEnemy = null;
                    window.newBattleTargetSelectCopiedSkill = null;
                    if (this.p1 && attacker === this.p1) {
                        this.p1.dopaChargeCount = 0;
                        this.p1.selectedInheritChar = null;
                        this.p1.selectedObeyEnemy = null;
                    }
                }
            }

           applySkill(attacker, defender, skill) {
                this.log(`💥 ${attacker.charName} の 「${skill.name}」！`, 'text-emerald-300 font-bold');
                audioSystem.playCharacterSound(attacker.id);

                if (skill.id === 'asaiomizu_copied') {
                    attacker.recordedSkill = null;
                    if (this.p1 && attacker.id === 'asaiomizu') this.p1.recordedSkill = null;
                }

                if (skill.id === 'ndaihyo_analysis') {
                    this.applyDamageSkill(attacker, defender, skill);
                    defender.buffAtk *= 0.86;
                    defender.buffDef *= 0.86;
    
                    this.log(`N高代表 は【弱点分析】を行った！ ${defender.charName} の攻撃力と防御力が低下！`, 'text-cyan-300 font-bold');
                    return;
                }
                if (skill.id === 'ndaihyo_tactics') {
                    const targetTeam = (this.getCharacterTeam(attacker) === 'ally') ? this.enemies : this.allies;
                    let hasPasha = false;

                    targetTeam.forEach(e => {
                        if (e.hp > 0 && (e.id === 'pasha' || e.id === 'pasha_dark')) {
                            hasPasha = true;
                        }
                    });

                    targetTeam.forEach(e => {
                        if (e.hp > 0) {
                            const isPashaType = (e.id === 'pasha' || e.id === 'pasha_dark');
                            e.ndaihyoTacticsTurns = 2;
                            if (isPashaType) {
                                e.buffAtk *= 0.35;
                                e.buffDef *= 0.80;
                                this.triggerEffect(this.getCharacterTeam(e) === 'ally' ? 'Player' : 'Enemy', 'buff', '攻撃大幅DOWN!', e);
                            } else {
                                e.buffAtk *= 0.80;
                                e.buffDef *= 0.80;
                                this.triggerEffect(this.getCharacterTeam(e) === 'ally' ? 'Player' : 'Enemy', 'buff', '能力DOWN', e);
                            }
                        }
                    });

                    if (hasPasha) {
                        this.log(`🎯 ${attacker.charName} の【パシャ憎絶許】発動！！ パシャ憎の存在により敵全体の攻撃力が大幅低下し、防御力も低下した！（持続2T）`, 'text-yellow-300 font-bold text-base');
                        if (typeof this.triggerCutin === 'function') {
                            this.triggerCutin('🎯 パシャ憎絶許！', 'パシャ憎特効発動！ 攻撃力大幅低下＆防御低下！');
                        }
                    } else {
                        this.log(`📉 ${attacker.charName} の【パシャ憎絶許】！ 敵全体の攻撃力と防御力が2ターンの間低下した！`, 'text-cyan-300 font-bold text-base');
                        if (typeof this.triggerCutin === 'function') {
                            this.triggerCutin('📉 パシャ憎絶許！', '敵全体の攻撃力・防御力が2ターン低下！');
                        }
                    }
                    if (typeof audioSystem !== 'undefined' && audioSystem.playBuff) {
                        audioSystem.playBuff();
                    }
                    return;
                }
                if (skill.id === 'ndaihyo_mind') {
                    const healRate = skill.healRate || 0.20;
                    const teamList = (this.getCharacterTeam(attacker) === 'ally') ? this.allies : this.enemies;
                    teamList.forEach(a => {
                        if (a.hp > 0) {
                            const hAmt = Math.floor(a.maxHp * healRate);
                            a.hp = Math.min(a.maxHp, a.hp + hAmt);
                            if (typeof triggerCharacterEffect === 'function') {
                                triggerCharacterEffect(a, 'heal', `+${hAmt}`);
                            } else if (typeof triggerNewBattleCharacterEffect === 'function') {
                                triggerNewBattleCharacterEffect(a, 'heal', `+${hAmt}`);
                            }
                        }
                    });
                    const targetAlly = (defender && this.getCharacterTeam(defender) === this.getCharacterTeam(attacker) && defender.hp > 0) ? defender : attacker;
                    const hadDebuff = (targetAlly.buffAtk < 1.0) || (targetAlly.buffDef < 1.0) || ((targetAlly.stunTurns || 0) > 0);
                    targetAlly.buffAtk = Math.max(1.0, targetAlly.buffAtk);
                    targetAlly.buffDef = Math.max(1.0, targetAlly.buffDef);
                    targetAlly.buffAtkTurns = 0;
                    targetAlly.stunTurns = 0;
                    if (typeof triggerCharacterEffect === 'function') {
                        triggerCharacterEffect(targetAlly, 'buff', 'デバフ解除');
                    } else if (typeof triggerNewBattleCharacterEffect === 'function') {
                        triggerNewBattleCharacterEffect(targetAlly, 'buff', 'デバフ解除');
                    }
                    const targetName = targetAlly.charName;
                    if (hadDebuff) {
                        this.log(`N高代表 は消しゴム回復を使用した！ 味方全体のHPが回復し、${targetName}のデバフが完全に解除された！`, 'text-emerald-400 font-bold');
                    } else {
                        this.log(`N高代表 は消しゴム回復を使用した！ 味方全体のHPが回復し、${targetName}のデバフ解除を行った（対象にデバフなし）`, 'text-emerald-400 font-bold');
                    }
                    audioSystem.playHeal();
                    return;
                }
                if (skill.id === 'pasha_flash') {
                    const targetTeam = (this.getCharacterTeam(attacker) === 'ally') ? this.enemies : this.allies;
                    targetTeam.forEach(e => {
                        if (e.hp > 0) {
                            this.applyDamageSkill(attacker, e, skill);
                        }
                    });
                    const stunTarget = (defender && this.getCharacterTeam(defender) !== this.getCharacterTeam(attacker) && defender.hp > 0) ? defender : targetTeam.find(e => e.hp > 0);
                    if (stunTarget && stunTarget.hp > 0) {
                        stunTarget.stunTurns = 1;
                        this.triggerEffect(this.getCharacterTeam(stunTarget) === 'ally' ? 'Player' : 'Enemy', 'miss', '行動不能', stunTarget);
                    }
                    if (typeof triggerCameraFlashGlobalEffect === 'function') {
                        triggerCameraFlashGlobalEffect();
                    }
                    const targetName = stunTarget ? stunTarget.charName : '敵';
                    this.log(`📸 ${attacker.charName} はカメラフラッシュを放った！ 敵全体に小ダメージを与え、${targetName} を1ターンの間行動不能にした！`, 'text-yellow-300 font-bold');
                    return;
                }
                if (skill.id === 'pasha_roll') {
                    this.battleData = this.battleData || { pashaRollUsedCount: 0, pashaRollReviveCount: 0 };

                    const hAmt = skill.healAmount || 60;
                    const teamList = (this.getCharacterTeam(attacker) === 'ally') ? this.allies : this.enemies;
                    teamList.forEach(a => {
                        if (a.hp > 0) {
                            a.hp = Math.min(a.maxHp, a.hp + hAmt);
                            this.triggerEffect(this.getCharacterTeam(a) === 'ally' ? 'Player' : 'Enemy', 'heal', `+${hAmt}`, a);
                        }
                    });

                    this.log(`📸 ${attacker.charName} はカメラロールを使用した！ 味方全員のHPが ${hAmt} 回復した！`, 'text-emerald-400 font-bold text-base');
                    if (typeof audioSystem !== 'undefined' && audioSystem.playHeal) audioSystem.playHeal();
                    if (typeof triggerCameraFlashGlobalEffect === 'function') {
                        triggerCameraFlashGlobalEffect();
                    }
                    if (typeof this.triggerCutin === 'function') {
                        this.triggerCutin('📸 カメラロール発動！', '味方全員のHP60回復 ＆ 思い出のシャッター！');
                    }

                    const deadAllies = teamList.filter(a => a.hp <= 0);
                    const maxReviveTotal = 2;
                    if (deadAllies.length > 0 && (this.battleData.pashaRollReviveCount || 0) < maxReviveTotal) {
                        if (Math.random() < 0.30) {
                            this.battleData.pashaRollReviveCount = (this.battleData.pashaRollReviveCount || 0) + 1;
                            const targetDead = deadAllies[Math.floor(Math.random() * deadAllies.length)];
                            const revivedHp = Math.floor(targetDead.maxHp * 0.40);
                            targetDead.hp = revivedHp;

                            this.triggerEffect(this.getCharacterTeam(targetDead) === 'ally' ? 'Player' : 'Enemy', 'heal', '復活！', targetDead);
                            const remainingRevive = maxReviveTotal - this.battleData.pashaRollReviveCount;
                            if (typeof this.triggerCutin === 'function') {
                                this.triggerCutin('✨ カメラロールの奇跡！', `${targetDead.charName}がHP40%で復活！`);
                            }
                            this.log(`✨ カメラロールの奇跡が起きた！ 倒れていた${targetDead.charName}がHP40%で復活した！（残り復活可能回数: ${remainingRevive}回）`, 'text-yellow-300 font-bold text-base');
                        }
                    }
                    return;
                }
                if (skill.id === 'pasha_darkness') {
                    const target = (defender && this.getCharacterTeam(defender) === this.getCharacterTeam(attacker) && defender.hp > 0) ? defender : attacker;
                    target.darknessPowerTurns = 3;
                    target.darknessAppliedTurn = this.turn;
                    this.log(`🦇 ${attacker.charName} は暗黒封印を解除し、${target.charName} に暗黒パワーを付与した！ 3ターンの間、コマンド実行時にHPがランダム回復する！`, 'text-purple-300 font-bold text-base');
                    if (typeof audioSystem !== 'undefined' && audioSystem.playSpecial) audioSystem.playSpecial();
                    this.triggerEffect(this.getCharacterTeam(target) === 'ally' ? 'Player' : 'Enemy', 'buff', '暗黒パワー', target);
                    if (typeof this.triggerCutin === 'function') {
                        this.triggerCutin('🦇 暗黒封印解除！', `${target.charName} に暗黒パワー付与＆コマンド実行時回復！`);
                    }
                    return;
                }
                if (skill.id === 'iwaba_rap') {
                    const teamList = (this.getCharacterTeam(attacker) === 'ally') ? this.allies : this.enemies;
                    const side = this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy';
                    const targets = (teamList && teamList.length > 0) ? teamList : [attacker];

                    targets.forEach(a => {
                        if (a.hp > 0) {
                            a.buffDef *= 1.40;
                            a.defendBuffTurns = 3;
                            this.triggerEffect(side, 'buff', '防御UP!', a);
                        }
                    });

                    this.log(`🎤 ${attacker.charName} の【フリースタイル】！ 魂のラップで3ターンの間、味方全員の防御力が大幅に強化された！`, 'text-emerald-300 font-bold text-base');
                    if (typeof audioSystem !== 'undefined' && audioSystem.playBuff) {
                        audioSystem.playBuff();
                    }
                    if (typeof this.triggerCutin === 'function') {
                        this.triggerCutin('🎤 フリースタイル発動！', '魂のラップで味方全員の防御力大幅強化！');
                    }
                    return;
                }
                if (skill.id === 'iwaba_song') {
                    const target = defender || attacker;
                    const side = this.getCharacterTeam(target) === 'ally' ? 'Player' : 'Enemy';
                    target.tempEvadeNext = true;
                    this.log(`🎵 ${attacker.charName} の【ソウルソング】！ 魂の歌声が響き渡り、${target.charName} は次の相手からの攻撃を1回だけ完全に無効化するバリアを纏った！`, 'text-emerald-300 font-bold text-base');
                    if (typeof audioSystem !== 'undefined' && audioSystem.playSpecial) {
                        audioSystem.playSpecial();
                    }
                    this.triggerEffect(side, 'buff', '無効化バリア', target);
                    if (typeof this.triggerCutin === 'function') {
                        this.triggerCutin('🎵 ソウルソング発動！', `${target.charName} に攻撃1回無効化バリア付与！`);
                    }
                    return;
                }
                if (skill.id === 'iwaba_bath') {
                    const teamList = (this.getCharacterTeam(attacker) === 'ally') ? this.allies : this.enemies;
                    const side = this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy';
                    const targets = (teamList && teamList.length > 0) ? teamList : [attacker];

                    targets.forEach(a => {
                        if (a.hp > 0) {
                            a.iwabaBathTurns = 2;
                            a.iwabaEvaBonus = 15;
                            const hAmt = Math.max(15, Math.floor(a.maxHp * 0.10));
                            a.hp = Math.min(a.maxHp, a.hp + hAmt);
                            this.triggerEffect(side, 'heal', `+${hAmt}`, a);
                        }
                    });

                    this.log(`♨️ ${attacker.charName} の【岩盤浴ブースト】！ 温まり効果で2ターンの間、味方全員のHPを毎ターン少量回復＆回避率を中強化（+15%）！`, 'text-emerald-300 font-bold text-base');
                    if (typeof audioSystem !== 'undefined' && audioSystem.playHeal) {
                        audioSystem.playHeal();
                    }
                    if (typeof this.triggerCutin === 'function') {
                        this.triggerCutin('♨️ 岩盤浴ブースト！', '2ターンの間 味方全員持続回復 ＆ 回避率+15%！');
                    }
                    return;
                }

                if (skill.id === 'moenan_play') {
                    const healRate = skill.healRate || 0.30;
                    const hAmt = Math.floor(attacker.maxHp * healRate);
                    attacker.hp = Math.min(attacker.maxHp, attacker.hp + hAmt);

                    const hadDebuff = (attacker.buffAtk < 1.0) || 
                                      (attacker.buffDef < 1.0) || 
                                      ((attacker.stunTurns || 0) > 0) || 
                                      ((attacker.evaDebuff || 0) > 0) || 
                                      ((attacker.crimeDefDownTurns || 0) > 0) || 
                                      ((attacker.nightmareDefTurns || 0) > 0) || 
                                      attacker.isResting;

                    attacker.buffAtk = Math.max(1.0, attacker.buffAtk);
                    attacker.buffDef = Math.max(1.0, attacker.buffDef);
                    attacker.buffAtkTurns = 0;
                    attacker.crimeDefDownTurns = 0;
                    attacker.nightmareDefTurns = 0;
                    attacker.stunTurns = 0;
                    attacker.evaDebuff = 0;
                    attacker.enemyEvaTurns = 0;
                    attacker.isResting = false;

                    const side = this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy';
                    this.triggerEffect(side, 'heal', `+${hAmt}`, attacker);

                    if (hadDebuff) {
                        setTimeout(() => {
                            if (typeof triggerNewBattleCharacterEffect === 'function') {
                                triggerNewBattleCharacterEffect(attacker, 'buff', 'デバフ全解除');
                            } else if (typeof triggerCharacterEffect === 'function') {
                                triggerCharacterEffect(attacker, 'buff', 'デバフ全解除');
                            }
                        }, 350);
                    }

                    this.log(`🐱 ${attacker.charName} の【こももと遊ぶ】！ 愛猫に癒やされてHPが ${hAmt} 回復！${hadDebuff ? 'かかっていたデバフを全解除した！' : '（解除するデバフなし）'}`, 'text-emerald-300 font-bold text-base');
                    if (typeof audioSystem !== 'undefined' && audioSystem.playHeal) {
                        audioSystem.playHeal();
                    }
                    if (typeof this.triggerCutin === 'function') {
                        this.triggerCutin('🐱 こももと遊ぶ！', '愛猫に癒やされHP小回復＆デバフ全解除！');
                    }
                    return;
                }

               if (attacker.id === 'dopagaking' && skill.id === 'dopa_inheritance') {
                    if ((attacker.dopaChargeCount || 0) < 5 || !attacker.selectedInheritChar) {
                        this.log(`👑 チャージが完了していないか、キャラクターが選択されていません！`, 'text-amber-300 font-bold');
                        return;
                    }

                    const chosenMaster = CHARACTER_DATA[attacker.selectedInheritChar];
                    const baseNormalDmg = Math.floor(chosenMaster.atk * 1.0);
                    const inheritDmg = baseNormalDmg * 4;

                    audioSystem.playSpecial();
                    this.triggerCutin(`👑 王位継承発動！！`, `${chosenMaster.name}の力 × 4 ＝ ${inheritDmg} ダメージ！`);
                    
                    defender.hp = Math.max(0, defender.hp - inheritDmg);
                    if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(defender);
    
                    this.log(`👑🔥 SPドパガキングの「王位継承」発動！！ ${chosenMaster.name}の力を借りて ${defender.charName} に ${inheritDmg} の大ダメージを与えた！！`, 'text-amber-400 font-black text-base');
                    this.triggerEffect(defender === this.p1 ? 'Player' : 'Enemy', 'damage', `-${inheritDmg}`);

                    // 攻撃後の状態リセット
                    attacker.dopaChargeCount = 0;
                    attacker.selectedInheritChar = null;
                    return;
                }



                if (defender.id === 'asaiomizu' && defender.digActive && defender.digUsedTurn === this.turn && !defender.recordedSkill) {
                    if (skill.type === 'attack' || skill.type === 'special' || skill.type === 'debuff_attack' || skill.type === 'eggplant_burst' || (skill.power && skill.power > 0)) {
                        defender.recordedSkill = { ...skill, targetType: skill.targetType || 'single_enemy' };
                        defender.digActive = false;
                        this.log(`${defender.charName} は受けていた相手の最初の攻撃技 [${skill.name}] を内部保存した！`, 'text-cyan-300 font-bold');
                        this.triggerEffect(defender === this.p1 ? 'Player' : 'Enemy', 'buff', 'スキルコピー成功！');
                    }
                }

                switch (skill.type) {
                    case 'attack':
                    case 'special':
                        this.applyDamageSkill(attacker, defender, skill);
                        break;



        case 'dopa_juggler_skill':
            // 0〜40の完全ランダムダメージ
            const jugglerDmg = Math.floor(Math.random() * 41);
            defender.hp = Math.max(0, defender.hp - jugglerDmg);
            if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(defender);

            this.log(`🃏 SPドパガキングの「ジャグラー」！ 完全ランダムダメージ ⇒ ${defender.charName} に ${jugglerDmg} のダメージ！`, 'text-purple-300 font-bold');
            this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'damage', `-${jugglerDmg}`);
            audioSystem.playHit();
            break;

        case 'dopa_charge_skill':
            if ((attacker.dopaChargeCount || 0) >= 6) {
                this.log(`👑 ${attacker.charName} はすでに最大チャージ（6/6）です！「王に従え」を発動してください！`, 'text-amber-400 font-bold');
                break;
            }
            attacker.dopaChargeCount = Math.min(6, (attacker.dopaChargeCount || 0) + 1);
            if (attacker.dopaChargeCount === 6) {
                const allOtherIds = Object.keys(CHARACTER_DATA).filter(id => id !== 'dopagaking');
                const randomId = allOtherIds[Math.floor(Math.random() * allOtherIds.length)];
                const chosenTarget = this.createBattlePlayer(randomId, CHARACTER_DATA[randomId].name, this.getCharacterTeam(attacker) === 'ally' ? 2 : 1);
                attacker.selectedObeyEnemy = chosenTarget;
                attacker.selectedInheritChar = chosenTarget.id;

                this.log(`👑 ${attacker.charName} は6回目のチャージを完了！【${chosenTarget.charName}】の姿に変身し、「王に従え」が解禁された！`, 'text-amber-300 font-bold font-pixel');
                this.triggerCutin('👑「王に従え」解禁！', `変身: ${chosenTarget.charName}の力！`);
                this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'buff', `「王に従え」解禁 (${chosenTarget.charName})！`);
            } else {
                this.log(`👑 ${attacker.charName} の「チャージ」！ （現在チャージ: ${attacker.dopaChargeCount}/6）`, 'text-amber-300 font-bold');
                this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'buff', `チャージ+1 (${attacker.dopaChargeCount}/6)`);
            }
            audioSystem.playBuff();
            break;

        case 'dopa_majesty_skill':
            // 70%で相手のターンで受ける攻撃を絶対回避（1T）、30%で自身のHPを60回復
            if (Math.random() < 0.7) {
                attacker.tempEvadeNext = true;
                this.log(`👑 ${attacker.charName} の「王の威厳」！ 70%の確率に当選し、相手のターンで受ける攻撃を絶対回避する構えをとった！（効果継続1ターン）`, 'text-amber-300 font-bold');
                this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'buff', '絶対回避構え');
                audioSystem.playBuff();
            } else {
                attacker.hp = Math.min(attacker.maxHp, attacker.hp + 60);
                this.log(`👑 ${attacker.charName} の「王の威厳」！ 30%の確率に当選し、自身のHPが 60 回復した！`, 'text-emerald-400 font-bold');
                this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'heal', '+60');
                audioSystem.playHeal();
            }
            break;

        case 'dopa_godluck_skill':
            // 95%で自分が50ダメージ、5%で相手に1000ダメージ（HP50%以上ならHP1耐え）
            if (Math.random() < 0.05) {
                const isHp50OrMore = (defender.hp / defender.maxHp) >= 0.5;
                if (isHp50OrMore) {
                    const hitDmg = defender.hp - 1;
                    defender.hp = 1;
                    this.log(`✨⚡【神頼み 5%的中！！】 ${defender.charName} に ${hitDmg} の超絶ダメージ！！（相手のHPが50%以上だったためHP1で踏みとどまった！）`, 'text-yellow-300 font-black font-pixel text-base');
                    this.triggerCutin('⚡ 神頼み 5%的中！！', '超絶ダメージ！(HP50%以上耐え)');
                    this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'damage', `-${hitDmg}`);
                } else {
                    defender.hp = 0;
                    this.log(`✨⚡【神頼み 5%的中！！】 ${defender.charName} に 1000 の必殺ダメージ！！`, 'text-yellow-300 font-black font-pixel text-base');
                    this.triggerCutin('⚡ 神頼み 5%的中！！', '奇跡の1000ダメージで撃破！');
                    this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'damage', '-1000');
                }
                if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(defender);
                audioSystem.playSpecial();
            } else {
                attacker.hp = Math.max(0, attacker.hp - 50);
                this.log(`🎲 ${attacker.charName} の「神頼み」… 運悪く失敗し、自分に 50 のダメージを受けた！`, 'text-red-400 font-bold');
                this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'damage', '-50');
                if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(attacker);
                audioSystem.playHit();
            }
            break;

        case 'dopa_obey_skill':
            if ((attacker.dopaChargeCount || 0) < 6) {
                this.log(`👑 チャージが6回に達していないため、「王に従え」を発動できません！（現在 ${attacker.dopaChargeCount || 0}/6回）`, 'text-amber-400 font-bold');
                break;
            }
            let chosenEnemy = attacker.selectedObeyEnemy;
            if (!chosenEnemy) {
                const allOtherIds = Object.keys(CHARACTER_DATA).filter(id => id !== 'dopagaking');
                const randomId = allOtherIds[Math.floor(Math.random() * allOtherIds.length)];
                chosenEnemy = this.createBattlePlayer(randomId, CHARACTER_DATA[randomId].name, this.getCharacterTeam(attacker) === 'ally' ? 2 : 1);
                attacker.selectedObeyEnemy = chosenEnemy;
                attacker.selectedInheritChar = chosenEnemy.id;
            }

            // 「王に従え」使用によりチャージ回数をゼロにリセット
            attacker.dopaChargeCount = 0;
            if (this.p1 && attacker.id === 'dopagaking') this.p1.dopaChargeCount = 0;
            
            if (attacker === this.p1 && typeof openDopaObeyModal === 'function') {
                openDopaObeyModal(attacker, chosenEnemy);
                return; 
            } else {
                const enemySkills = chosenEnemy.skills || [];
                if (enemySkills.length > 0) {
                    const pickedSkill = enemySkills[Math.floor(Math.random() * enemySkills.length)];
                    this.log(`👑【王に従え】${attacker.charName} は【${chosenEnemy.charName}】の技「${pickedSkill.name}」を発動！`, 'text-amber-300 font-bold');
                    this.applySkill(attacker, chosenEnemy, pickedSkill);
                } else {
                    this.log(`👑 ${attacker.charName} は「王に従え」を試みたが、相手に使えるスキルがなかった！`, 'text-slate-400');
                }
                attacker.dopaChargeCount = 0;
                attacker.selectedObeyEnemy = null;
                attacker.selectedInheritChar = null;
            }
            break;


                    case 'courtney_charge':
                    case 'courtney_charge_only': {
                        if ((attacker.courtneyChargeCount || 0) < 8) {
                            attacker.courtneyChargeCount = (attacker.courtneyChargeCount || 0) + 1;
                        }
                        const side = (this.getCharacterTeam && this.getCharacterTeam(attacker) === 'ally') || attacker === this.p1 ? 'Player' : 'Enemy';
                        this.log(`⚡ ${attacker.charName} は 「FEEL SO HOT ///」 のチャージを進めた！（現在チャージ: ${attacker.courtneyChargeCount}/8回）`, 'text-pink-400 font-bold font-pixel');
                        if (typeof audioSystem !== 'undefined' && audioSystem.playBuff) audioSystem.playBuff();
                        this.triggerEffect(side, 'pink', `💖 チャージ+1 (${attacker.courtneyChargeCount}/8)`, attacker);
                        if (attacker.courtneyChargeCount >= 8) {
                            if (typeof this.triggerCutin === 'function') {
                                this.triggerCutin('💖 MAXチャージ完了！', '「FEEL SO HOT ///」最大威力解放可能！（150ダメージ）');
                            }
                        }
                        break;
                    }
                    case 'courtney_attack_skill':
                    case 'courtney_attack': {
                        const opposingTeamC = (this.getCharacterTeam(attacker) === 'ally' ? this.enemies : this.allies).filter(e => e.hp > 0);
                        audioSystem.playHit();
                        opposingTeamC.forEach(e => {
                            e.hp = Math.max(0, e.hp - 13);
                            if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(e);
                            this.triggerEffect(this.getCharacterTeam(e) === 'ally' ? 'Player' : 'Enemy', 'damage', '-13', e);
                        });
                        this.log(`💖 ${attacker.charName} の「ミツメル」！ 相手チーム全員をじっと見つめて13の固定ダメージを与えた！`, 'text-pink-300 font-bold');
                        break;
                    }
                    case 'courtney_charge_release': {
                        const charges = attacker.courtneyChargeCount || 0;
                        if (charges < 1) {
                            this.log(`💖 チャージが1回以上必要です！`, 'text-pink-300');
                            break;
                        }
                        let releaseDmg = 18;
                        if (charges >= 8) releaseDmg = 150;
                        else if (charges === 7) releaseDmg = 130;
                        else if (charges === 6) releaseDmg = 110;
                        else if (charges === 5) releaseDmg = 90;
                        else if (charges === 4) releaseDmg = 70;
                        else if (charges === 3) releaseDmg = 50;
                        else if (charges === 2) releaseDmg = 32;
                        else releaseDmg = 18;

                        audioSystem.playSpecial();
                        this.triggerEffect(defender === this.p1 ? 'Player' : 'Enemy', 'damage', `🔥 ${releaseDmg} DMG!`);
                        defender.hp = Math.max(0, defender.hp - releaseDmg);
                        if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(defender);
        
                        this.log(`💖🔥 SPコートニーの 「FEEL SO HOT ///」解放！！ (溜め ${charges}回) ⇒ ${defender.charName} に ${releaseDmg} の爆発ダメージ！！`, 'text-pink-400 font-black text-base');
                        attacker.courtneyChargeCount = 0;
                        break;
                    }
                    case 'courtney_yoseru_skill': {
                        this.applyDamageSkill(attacker, defender, skill);
                        defender.buffDef = 0.0;
                        defender.yoseruZeroDefTurns = 1;
                        this.log(`💋 ${attacker.charName} の「ヨセル」！ 1ターンの間 ${defender.charName} の防御力を 0 にした！`, 'text-pink-300 font-bold');
                        this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'buff', '防御0!', defender);
                        break;
                    }
                    case 'courtney_aegu_skill': {
                        attacker.tempEvadeNext = true;
                        const healAmtAegu = Math.floor(attacker.maxHp * 0.45);
                        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmtAegu);
                        this.log(`✨ ${attacker.charName} の「アエグ」！ ライフを ${healAmtAegu} (45%) 回復し、次の相手の攻撃を絶対回避する構えをとった！`, 'text-pink-300 font-bold');
                        this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'heal', `+${healAmtAegu}`);
                        audioSystem.playHeal();
                        break;
                    }
                    case 'eggplant_burst':
                        this.log(`🐘 ${attacker.charName} の「超ナスちん乱舞」発動！！ 3ターンの間、全味方のクリティカル大幅UP ＆ 敵全体の回避率中DOWN！`, 'text-purple-300 font-bold text-base');
                        if (typeof this.triggerCutin === 'function') {
                            this.triggerCutin('🍆 超ナスちん乱舞！', '敵全体に大ダメージ ＆ 味方会心大幅UP・敵回避DOWN！');
                        }
                        const targetTeamEgg = (this.getCharacterTeam(attacker) === 'ally') ? (this.enemies || [this.p2]) : (this.allies || [this.p1]);
                        targetTeamEgg.forEach(e => {
                            if (e.hp > 0) {
                                this.applyDamageSkill(attacker, e, skill);
                            }
                        });
                        const alliesListEgg = (this.getCharacterTeam(attacker) === 'ally') ? (this.allies || [this.p1]) : (this.enemies || [this.p2]);
                        alliesListEgg.forEach(a => {
                            if (a.hp > 0) {
                                a.critRateBonus = (a.critRateBonus || 0) + 0.35;
                                a.critBuffTurns = 3;
                                this.triggerEffect(this.getCharacterTeam(a) === 'ally' ? 'Player' : 'Enemy', 'buff', '会心大幅UP', a);
                            }
                        });
                        const enemiesListEgg = (this.getCharacterTeam(attacker) === 'ally') ? (this.enemies || [this.p2]) : (this.allies || [this.p1]);
                        enemiesListEgg.forEach(e => {
                            if (e.hp > 0) {
                                e.evaDebuff = (e.evaDebuff || 0) + 15;
                                e.enemyEvaTurns = 3;
                                this.triggerEffect(this.getCharacterTeam(e) === 'ally' ? 'Player' : 'Enemy', 'damage', '回避DOWN', e);
                            }
                        });
                        attacker.isMiniZou = false;
                        attacker.eggplantReady = false;
                        this.log(`✨ ${attacker.charName} は元の姿に戻った。`, 'text-slate-400');
                        break;
                    case 'momo_chie_skill':
                        const hChie = Math.floor(attacker.maxHp * (skill.healRate || 0.35));
                        attacker.hp = Math.min(attacker.maxHp, attacker.hp + hChie);
                        attacker.momoEvaTurns = 2;
                        this.log(`🩷 ${attacker.charName} は「チエを呼ぶ」！ HPが ${hChie} 回復し、2ターンの間自身の回避率がアップ！`, 'text-pink-300 font-bold');
                        this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'heal', `+${hChie}`);
                        audioSystem.playHeal();
                        break;
                    case 'asaiomizu_dig_skill':
                        const dummyAttack = { name: '髪をかきあげる', type: 'attack', power: 1.15, isNormalAttack: true };
                        const isAllyDig = this.getCharacterTeam(attacker) === 'ally';
                        attacker.recordedSkill = null;
                        if (this.p1 && attacker.id === 'asaiomizu') this.p1.recordedSkill = null;
                        if (isAllyDig) {
                            this.applyDamageSkill(attacker, defender, dummyAttack);
                            attacker.digActive = true;
                            attacker.digUsedTurn = this.turn;
                            this.logTeam(attacker, `はディグを発動！（通常攻撃に偽装しつつ相手の攻撃を待ち構える）`, 'text-cyan-300 font-bold');
                            this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'buff', 'ディグ構え');
                        } else {
                            // 敵側のディグ：敵チームには通常の髪をかきあげるとして完全に偽装して表示（一切の特殊表示・ログを出さない）
                            this.applyDamageSkill(attacker, defender, dummyAttack);
                            attacker.digActive = true;
                            attacker.digUsedTurn = this.turn;
                            this.logTeam(attacker, `の 「髪をかきあげる」！`, 'text-slate-200 font-bold');
                            this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'damage', 'ヒット');
                        }
                        break;
                    case 'asaiomizu_club_skill':
                        attacker.critRateBonus = (attacker.critRateBonus || 0) + 0.40;
                        attacker.asaiomizuCritTurns = 2;
                        this.log(`🎵 ${attacker.charName} は「クラブに行く」でアゲアゲに踊り狂う！2ターンの間、クリティカル率が大幅向上！`, 'text-cyan-300 font-bold');
                        this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'buff', 'クリティカル大幅UP!');
                        audioSystem.playBuff();
                        break;
                    case 'debuff_attack':
                        this.applyDamageSkill(attacker, defender, skill);
                        if (attacker.id === 'ndaihyo') {
                            defender.buffAtk *= 0.86;
                            defender.buffDef *= 0.86;
                        } else {
                            defender.buffAtk *= 0.82;
                            defender.buffDef *= 0.82;
                        }
                        this.log(`📉 ${defender.charName} の弱点を突いて攻撃力・防御力を低下させた！`, 'text-cyan-300 font-bold');
                        this.triggerEffect(defender === this.p1 ? 'Player' : 'Enemy', 'miss', '能力DOWN');
                        audioSystem.playHit();
                        break;
                    case 'debuff':
                        if (attacker.id === 'ndaihyo') {
                            defender.buffAtk *= 0.80;
                            defender.buffDef *= 0.80;
                        } else {
                            defender.buffAtk *= 0.72;
                            defender.buffDef *= 0.72;
                        }
                        this.log(`🎯 ${attacker.charName} の頭脳戦術が炸裂！ ${defender.charName} の攻撃力と防御力をカット！`, 'text-cyan-300 font-bold');
                        this.triggerEffect(defender === this.p1 ? 'Player' : 'Enemy', 'miss', '大幅DOWN');
                        audioSystem.playBuff();
                        break;
                    case 'heal_cleanse':
                        const hCleanseAmt = Math.floor(attacker.maxHp * (skill.healRate || 0.30));
                        attacker.hp = Math.min(attacker.maxHp, attacker.hp + hCleanseAmt);
                        attacker.buffAtk = Math.max(1.0, attacker.buffAtk);
                        attacker.buffDef = Math.max(1.0, attacker.buffDef);
                        attacker.buffAtkTurns = 0;
                        attacker.crimeDefDownTurns = 0;
                        attacker.nightmareDefTurns = 0;
                        attacker.stunTurns = 0;
                        attacker.evaDebuff = 0;
                        attacker.enemyEvaTurns = 0;
                        attacker.isResting = false;
                        this.log(`🐱 ${attacker.charName} は愛猫に癒やされて HP${hCleanseAmt} 回復！デバフを全解除！`, 'text-emerald-400 font-bold');
                        this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'heal', `+${hCleanseAmt}`, attacker);
                        audioSystem.playHeal();
                        break;
                    case 'dig':
                        attacker.digActive = true;
                        attacker.digUsedTurn = this.turn;
                        this.log(`🕳️ ${attacker.charName} はディグを発動！身を潜めて相手の攻撃を待ち構える！`, 'text-cyan-300 font-bold');
                        this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'buff', 'ディグ準備');
                        break;
                    case 'heal':
                    case 'heal_club':
                        const healAmt = Math.floor(attacker.maxHp * (skill.healRate || 0.3));
                        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmt);
                        this.log(`💚 ${attacker.charName} は HPを ${healAmt} 回復！`, 'text-emerald-400');
                        this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'heal', `+${healAmt}`);
                        audioSystem.playHeal();
                        break;
                    case 'buff':
                        if (skill.buffType === 'atk') {
                            attacker.buffAtk = skill.amount || 1.4;
                            attacker.buffAtkTurns = 2;
                        }
                        this.log(`⚡ ${attacker.charName} の攻撃力がアップ！`, 'text-amber-300');
                        this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'buff', '攻撃UP!');
                        audioSystem.playBuff();
                        break;
                    case 'charge':
                        attacker.isMiniZou = true;
                        attacker.eggplantReady = true;
                        this.log(`🐘 ${attacker.charName} は「ミニぞうさん」に変身し、大量のナスを蓄積した！`, 'text-purple-300 font-bold');
                        this.log(`✨ 次ターン、コマンドから「超ナスちん乱舞」が手動で発動可能！`, 'text-amber-300 font-bold');
                        this.triggerCutin('🐘 ゾウ変身＆ナス溜め完了！', '次ターン「超ナスちん乱舞」が選択可能！');
                        this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'buff', 'ゾウ変身！');
                        audioSystem.playBuff();
                        break;
                    case 'sacrifice_buff':
                        const cost = Math.floor(attacker.hp * (skill.hpCostRate || 0.2));
                        attacker.hp = Math.max(1, attacker.hp - cost);
                        attacker.buffAtk = 2.3;
                        attacker.buffAtkTurns = 3;
                        this.log(`🔥 ${attacker.charName} は HPを${cost}消費し、次の2ターンの間攻撃力を2.3倍に跳ね上げた！`, 'text-red-400 font-bold');
                        this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'buff', '攻撃2.3倍!');
                        audioSystem.playBuff();
                        break;
                    case 'defend_buff':
                        const alliesTeam = (this.getCharacterTeam && this.getCharacterTeam(attacker) === 'ally') ? (this.allies || [this.p1]) : (this.enemies || [this.p2]);
                        const gkSide = (this.getCharacterTeam && this.getCharacterTeam(attacker) === 'ally') || attacker === this.p1 ? 'Player' : 'Enemy';
                        alliesTeam.forEach(member => {
                            if (member && member.hp > 0) {
                                member.defendBuffTurns = 1;
                                this.triggerEffect(gkSide, 'buff', '鉄壁ガード!', member);
                            }
                        });
                        this.log(`🛡️ ${attacker.charName} は「ゴールキーパー」発動！ 1ターンの間、味方全員が受けるすべてのダメージを70%カット！`, 'text-blue-300 font-bold text-base');
                        if (typeof this.triggerCutin === 'function') {
                            this.triggerCutin('🛡️ ゴールキーパー！', '1ターンの間、味方全員の被ダメージ70%カット！');
                        }
                        if (typeof audioSystem !== 'undefined' && audioSystem.playBuff) audioSystem.playBuff();
                        break;
                    case 'heal_buff':
                        const hAmt = Math.floor(attacker.maxHp * (skill.healRate || 0.32));
                        attacker.hp = Math.min(attacker.maxHp, attacker.hp + hAmt);
                        attacker.buffDef *= 1.35;
                        this.log(`♨️ ${attacker.charName} は HPを${hAmt}回復し、防御力も高めた！`, 'text-emerald-300');
                        this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'heal', `+${hAmt}`);
                        audioSystem.playHeal();
                        break;
                    case 'pasha_crime_skill':
                        attacker.hp = Math.min(attacker.maxHp, attacker.hp + 110);
                        attacker.buffDef *= 0.7;
                        attacker.crimeDefDownTurns = 1;
                        this.log(`🖤 ${attacker.charName} の「パーフェクトクライム」！ HPを 110 回復！ (次ターン防御力ダウン)`, 'text-purple-300 font-bold');
                        this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'heal', '+110');
                        audioSystem.playHeal();
                        break;
                    case 'pasha_nightmare_skill':
                        defender.buffDef *= 0.5;
                        defender.nightmareDefTurns = 3;
                        this.log(`🖤💥 ${attacker.charName} の「アブソリュートナイトメア」！ 通常攻撃の1.3倍ダメージを与え、3ターンの間 ${defender.charName} の防御力を大幅ダウンさせた！`, 'text-purple-400 font-black text-base');
                        this.triggerCutin('🖤 アブソリュートナイトメア！', '強力攻撃 ＆ 敵の防御大幅ダウン！');
                        this.applyDamageSkill(attacker, defender, skill);
                        break;
                }
            }

            applyDamageSkill(attacker, defender, skill, isCounter = false) {
                if (defender.id === 'asaiomizu' && defender.digActive && defender.digUsedTurn === this.turn && !defender.recordedSkill) {
                    if (skill && (skill.type === 'attack' || skill.type === 'special' || skill.type === 'debuff_attack' || skill.type === 'eggplant_burst' || (skill.power && skill.power > 0))) {
                        defender.recordedSkill = { ...skill, targetType: skill.targetType || 'single_enemy' };
                        defender.digActive = false;
                        this.log(`${defender.charName} は受けていた相手の最初の攻撃技 [${skill.name}] を内部保存した！`, 'text-cyan-300 font-bold');
                        this.triggerEffect(defender === this.p1 ? 'Player' : 'Enemy', 'buff', 'スキルコピー成功！');
                    }
                }
                const isStealth = (skill.id === 'pasha_dark_stealth');

                if (defender.tempEvadeNext && !isStealth) {
                    defender.tempEvadeNext = false;
                    if (defender.id === 'dopagaking') {
                        this.log(`👑✨ ${defender.charName} の「王の威厳」による絶対回避！ 相手のターンでの攻撃を完全に回避した！`, 'text-amber-300 font-bold text-base');
                        triggerCharacterEffect(defender, 'miss', '絶対回避!');
                        this.triggerEffect(defender === this.p1 ? 'Player' : 'Enemy', 'miss', '絶対回避!');
                    } else {
                        this.log(`✨ ${defender.charName} は無効化バリアにより、相手からの攻撃を1回完全に無効化した！`, 'text-emerald-300 font-bold text-base');
                        triggerCharacterEffect(defender, 'miss', '完全無効化!');
                        this.triggerEffect(defender === this.p1 ? 'Player' : 'Enemy', 'miss', '完全無効化!');
                    }
                    audioSystem.playEvade();
                    return;
                }

                if (attacker.id === 'ndaihyo' && skill.isNormalAttack && defender.id === 'pasha' && !attacker.pashaKillerUsed) {
                    attacker.pashaKillerUsed = true;
                    const killerDamage = Math.max(1, Math.floor(defender.hp * 0.5));
                    defender.hp = Math.max(0, defender.hp - killerDamage);
                    if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(defender);
                    const targetSide = defender === this.p1 ? 'Player' : 'Enemy';

                    this.log(`🎯💥【パシャ憎キラー発動！！】`, 'text-yellow-300 font-black font-pixel text-sm text-center');
                    this.log(`N高代表の頭脳分析がパシャ憎の弱点を完全に見破った！ 現在HPの50% (${killerDamage} DMG) を粉砕！！`, 'text-red-400 font-bold');
                    this.triggerCutin('🎯 パシャ憎キラー発動！！', '弱点分析完了！ 現在HP 50% を粉砕！');
                    this.triggerEffect(targetSide, 'damage', `-${killerDamage} (50%)`);
                    audioSystem.playSpecial();
                    return;
                }

                if (!isStealth) {
                    const momoEvaBonus = (defender.momoEvaTurns > 0) ? 20 : 0;
                    const effectiveEva = Math.max(0, (defender.eva || 10) + (defender.iwabaEvaBonus || 0) + momoEvaBonus - (defender.evaDebuff || 0));
                    const hitRate = 100 - effectiveEva;
                    if (Math.random() * 100 > hitRate) {
                        this.log(`🌀 ${defender.charName} は攻撃を回避した！`, 'text-sky-300');
                        audioSystem.playEvade();
                        triggerCharacterEffect(defender, 'miss', '回避');
                        if (this.currentTurnLogs && this.currentTurnLogs.length > 0) {
                            this.currentTurnLogs[this.currentTurnLogs.length - 1].effect = { side: defender === this.p1 ? 'Player' : 'Enemy', type: 'miss', text: '回避' };
                        }
                        if (defender.id === 'pasha_dark') {
                            defender.buffAtk *= 1.1;
                            this.log(`✨🦇 パシャ憎の回避アビリティ発動！ 攻撃力が 1.1倍 に跳ね上がった！（現在倍率: ${defender.buffAtk.toFixed(2)}倍）`, 'text-purple-300 font-bold');
                            this.triggerEffect(defender === this.p1 ? 'Player' : 'Enemy', 'buff', '攻撃力1.1倍!');
                        }
                        return;
                    }
                } else {
                    if (defender.tempEvadeNext) defender.tempEvadeNext = false;
                    const bonus = 2;
                    const currentBonus = attacker.pashaDarkEvaBonus || 0;
                    const actualBonus = Math.min(bonus, Math.max(0, 50 - currentBonus));
                    
                    if (actualBonus > 0) {
                        attacker.eva = (attacker.eva || 10) + actualBonus;
                        attacker.pashaDarkEvaBonus = currentBonus + actualBonus;
                        const side = (this.getCharacterTeam && this.getCharacterTeam(attacker) === 'ally') ? 'Player' : 'Enemy';
                        this.log(`🖤 ${attacker.charName} の「ステルスオブダーク」！ 相手の回避を完全に無視して命中！ 自身の回避率が ${actualBonus}% アップ（現在: ${attacker.eva}% / 強化計: +${attacker.pashaDarkEvaBonus}%）`, 'text-purple-300 font-bold');
                        this.triggerEffect(side, 'buff', `回避率+${actualBonus}%`, attacker);
                    } else {
                        this.log(`🖤 ${attacker.charName} の「ステルスオブダーク」！ 相手の回避を完全に無視して命中！ (回避率強化は既に最大値+50%に達しています)`, 'text-purple-300');
                    }
                }

                if (attacker.id === 'pasha_dark' && skill.id === 'pasha_dark_attack') {
                    if (Math.random() < 0.05) {
                        const bonus = 3;
                        const currentBonus = attacker.pashaDarkEvaBonus || 0;
                        const actualBonus = Math.min(bonus, Math.max(0, 50 - currentBonus));
                        
                        if (actualBonus > 0) {
                            attacker.eva = (attacker.eva || 10) + actualBonus;
                            attacker.pashaDarkEvaBonus = currentBonus + actualBonus;
                            const side = (this.getCharacterTeam && this.getCharacterTeam(attacker) === 'ally') ? 'Player' : 'Enemy';
                            this.log(`📸 ${attacker.charName} の「ダークネスフィンガー」追加効果！ 回避率 +${actualBonus}% （累計ボーナス: +${attacker.pashaDarkEvaBonus}% / 現在: ${attacker.eva}%）`, 'text-purple-300 font-bold');
                            this.triggerEffect(side, 'buff', `回避率+${actualBonus}%`, attacker);
                        }
                    }
                }

                let baseDmg = (attacker.atk * (skill.power || 1.0) * attacker.buffAtk) - (defender.def * 0.4 * defender.buffDef);
                let damage = Math.max(8, Math.floor(baseDmg + (Math.random() * 4 - 2)));

                let isCrit = false;
                let effectiveCritRate = (attacker.critRate || 0.05) + (attacker.critRateBonus || 0);
                if (attacker.id === 'pasha' && attacker.pashaPassiveActive) {
                    effectiveCritRate += 0.10;
                }
                if (Math.random() < effectiveCritRate) {
                    isCrit = true;
                    damage = Math.floor(damage * 1.5);
                    audioSystem.playCrit();
                    this.log(`🔥✨【クリティカルヒット発動！！】 1.5倍の会心ダメージ (${damage})！！`, 'text-yellow-300 font-black text-base');
                    this.triggerCutin('🔥 クリティカルヒット！！', '会心の一撃！ 1.5倍ダメージ炸裂！');
                    triggerCharacterEffect(defender, 'crit', 'クリティカル！');
                    this.triggerEffect(defender === this.p1 ? 'Player' : 'Enemy', 'crit', 'クリティカル！');

                    const defCvsId = defender === this.p1 ? 'p1-canvas' : 'p2-canvas';
                    const defCvs = document.getElementById(defCvsId);
                    if (defCvs) {
                        defCvs.classList.add('animate-opening-shake');
                        setTimeout(() => defCvs.classList.remove('animate-opening-shake'), 350);
                    }
                }

                if (defender.defendBuffTurns > 0) {
                    damage = Math.max(3, Math.floor(damage * 0.3));
                    this.log(`🛡 ${defender.charName} の鉄壁ガード！ 被ダメージ激減！`, 'text-blue-300');
                }

                if (this.isSuddenDeath) {
                    damage = Math.floor(damage * 1.35);
                }

                let extraHitTriggered = false;
                if (attacker.id === 'iwaba' && skill.isNormalAttack && defender.hp > 0) {
                    if (Math.random() < 0.20) {
                        extraHitTriggered = true;
                    }
                }

                defender.hp = Math.max(0, defender.hp - damage);

                const side = defender === this.p1 ? 'Player' : 'Enemy';
                if (this.isNewBattle && (defender.buffDef > 1.0 || defender.defendBuffTurns > 0)) {
                    this.triggerEffect(side, 'def', '防御', defender);
                }
                let damageLog = `⚔ ${defender.charName} に ${damage} のダメージ！`;
                if (attacker.id === 'ndaihyo' && skill.isNormalAttack) {
                    damageLog = `N高代表 の【バッティング】！ ${defender.charName} に ${damage} のダメージ！`;
                } else if (attacker.id === 'pasha' && skill.isNormalAttack) {
                    damageLog = `パシャ憎 の【睨みつける】！ ${defender.charName} に ${damage} のダメージ！`;
                } else if (attacker.id === 'iwaba' && skill.isNormalAttack) {
                    damageLog = `岩盤星人 の【ブレイクダンス】！ ${defender.charName} に ${damage} のダメージ！`;
                }
                this.log(`${damageLog}${isCrit ? ' (🔥会心)' : ''}${this.isSuddenDeath ? ' (🔥サドンデスUP)' : ''}`, 'text-red-400 font-bold');
                this.triggerEffect(side, isCounter ? 'counter_damage' : 'damage', `-${damage}`, defender);
                audioSystem.playHit();
                if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(defender);

                if (extraHitTriggered && defender.hp > 0) {
                    this.log(`✨【パッシブ発動！】 岩盤星人のブレイクダンスが2回連続ヒットした！`, 'text-yellow-300 font-bold text-base');
                    if (typeof this.triggerCutin === 'function') {
                        this.triggerCutin('✨ ブレイクダンス2回ヒット！', 'リズムに乗った連続攻撃！');
                    }
                    let extraDmg = Math.max(8, Math.floor(damage * 0.8));
                    defender.hp = Math.max(0, defender.hp - extraDmg);
                    this.log(`⚔️ 岩盤星人の【ブレイクダンス追加ヒット】！ ${defender.charName} に ${extraDmg} の追加ダメージ！`, 'text-red-400 font-bold');
                    this.triggerEffect(side, 'damage', `-${extraDmg}`, defender);
                    audioSystem.playHit();
                    if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(defender);
                }

                if (this.checkActiveAllyStatus()) return;

                if (defender.hp <= 0 && defender.id === 'momo' && !defender.momoRevived) {
                    defender.momoRevived = true;
                    defender.hp = Math.floor(defender.maxHp * 0.35);
                    this.log(`✨ 桃ピンは諦めない！要塞の底力でHP ${defender.hp} で復活！！`, 'text-amber-300 font-bold');
                    this.triggerCutin('✨ ナス要塞不屈の復活！', '桃ピンは倒れない！ HP35%で復活！');
                    this.triggerEffect(side, 'heal', '不屈復活!!');
                    audioSystem.playSpecial();
                    return;
                }

                if (!isCounter && defender.id === 'asaiomizu' && defender.hp > 0 && Math.random() < 0.5) {
                    this.executeCounter(defender, attacker);
                }
                this.checkPashaDarkMode(defender);
            }

            executeCounter(defender, attacker) {
                if (defender.hp <= 0) return;
                this.log(`⚡ ${defender.charName}のカウンター発動！ ${attacker.charName} に少量ダメージを与えた！`, 'text-cyan-300 font-bold');
                triggerCharacterEffect(defender, 'counter', 'カウンター');
                const counterSkill = defender.skills.find(s => s.isNormalAttack) || defender.skills[0];
                this.applyDamageSkill(defender, attacker, counterSkill, true);
            }

            async checkWinner() {
                if (this.battleEnded) return true;

                let winnerText = '';
                let isEnded = false;

                const livingAllies = this.allies ? this.allies.filter(a => a.hp > 0) : [this.p1].filter(a => a.hp > 0);
                const livingEnemies = this.enemies ? this.enemies.filter(e => e.hp > 0) : [this.p2].filter(e => e.hp > 0);

                if (livingAllies.length === 0 && livingEnemies.length === 0) {
                    winnerText = '⚔️ 引き分け！相討ちとなりました！';
                    isEnded = true;
                    this.log(winnerText, 'text-yellow-400 font-bold text-center text-sm');
                    this.log(`🤝 引き分けとなりました。`, 'text-yellow-400 font-bold text-center');
                } else if (livingEnemies.length === 0) {
                    winnerText = `🎉 【${this.p1.charName}】チームの勝利！`;
                    isEnded = true;
                    this.log(winnerText, 'text-emerald-400 font-bold text-center text-sm');
                    audioSystem.playVictory();
                    if (!this.isOnline || this.myPlayerNum === 1) {
                        const earnedDopa = 150;
                        await addDopa(earnedDopa);
                        this.log(`🎁 勝利報酬: +${formatDopa(earnedDopa)} DOPA 獲得！`, 'text-amber-300 font-bold text-center');
                    }
                } else if (livingAllies.length === 0) {
                    winnerText = `💀 敵チームの勝利！`;
                    isEnded = true;
                    this.log(winnerText, 'text-red-400 font-bold text-center text-sm');
                    audioSystem.playDefeat();
                    this.log(`💀 敗北… 次回は勝利を目指そう！`, 'text-red-400 font-bold text-center');
                    if (this.isOnline && this.myPlayerNum === 2) {
                        const earnedDopa = 150;
                        await addDopa(earnedDopa);
                        this.log(`🎁 勝利報酬: +${formatDopa(earnedDopa)} DOPA 獲得！`, 'text-amber-300 font-bold text-center');
                    }
                }

                if (isEnded && !this.statsRecorded) {
                    this.statsRecorded = true;
                    this.battleEnded = true;
                    this.winnerText = winnerText;
                    this.stopTimer();
                    this.stopElapsedTimer();

                    let result = 'draw';
                    if (this.p1.hp > 0 && this.p2.hp <= 0) {
                        result = (this.isOnline && this.myPlayerNum === 2) ? 'lose' : 'win';
                    } else if (this.p1.hp <= 0 && this.p2.hp > 0) {
                        result = (this.isOnline && this.myPlayerNum === 2) ? 'win' : 'lose';
                    } else if (this.p1.hp <= 0 && this.p2.hp <= 0) {
                        result = 'draw';
                    }

                    const myCharId = (this.isOnline && this.myPlayerNum === 2) ? this.p2.id : this.p1.id;
                    const oppChar = (this.isOnline && this.myPlayerNum === 2) ? this.p1 : this.p2;
                    const oppCharId = oppChar.id;
                    const oppProfile = this.latestRoomData ? (this.myPlayerNum === 1 ? this.latestRoomData.p2Profile : this.latestRoomData.p1Profile) : null;
                    const oppName = oppProfile?.playerName || oppChar.charName || '対戦相手';
                    const oppIcon = oppProfile?.selectedIcon || oppChar.id;
                    const isBot = !this.isOnline;

                    if (typeof recordBattleResult === 'function') {
                        recordBattleResult(result, myCharId, oppName, oppIcon, isBot, isBot ? null : 'online_opp', oppProfile, oppCharId);
                    }

                    if (this.onBattleEnd) this.onBattleEnd(winnerText);
                    return true;
                }

                return false;
            }

            endTurnPhase() {
                const allFighters = [...(this.allies || [this.p1]), ...(this.enemies || [this.p2])];
                this.turn++;

                allFighters.forEach(p => {
                    if (p.hp <= 0) return;
                    Object.keys(p.cooldowns).forEach(key => {
                        if (p.cooldowns[key] > 0) p.cooldowns[key]--;
                    });
                    if (p.iwabaBathTurns > 0) {
                        // 回復処理
                        const hAmt = Math.max(15, Math.floor(p.maxHp * 0.10));
                        p.hp = Math.min(p.maxHp, p.hp + hAmt);
                        this.log(`♨️ ${p.charName} は岩盤浴の温まり効果でHPが ${hAmt} 回復した！（持続残り ${p.iwabaBathTurns}T）`, 'text-emerald-300 font-bold');
                        this.triggerEffect(this.getCharacterTeam(p) === 'ally' ? 'Player' : 'Enemy', 'heal', `+${hAmt}`, p);
                        if (typeof audioSystem !== 'undefined' && audioSystem.playHeal) audioSystem.playHeal();

                        p.iwabaBathTurns--;
                        if (p.iwabaBathTurns === 0) {
                            p.iwabaEvaBonus = 0;
                            this.log(`♨️ ${p.charName} の岩盤浴の温まり効果が終了した。`, 'text-slate-400 text-xs');
                        }
                    }
                    if (p.ndaihyoTacticsTurns > 0) {
                        p.ndaihyoTacticsTurns--;
                        if (p.ndaihyoTacticsTurns === 0) {
                            p.buffAtk = Math.max(1.0, p.buffAtk);
                            p.buffDef = Math.max(1.0, p.buffDef);
                            this.log(`📉 ${p.charName} の「パシャ憎絶許」による能力低下効果が終了した。`, 'text-slate-400 text-xs');
                        }
                    }
                    if (p.defendBuffTurns > 0) {
                        p.defendBuffTurns--;
                        if (p.defendBuffTurns === 0) {
                            p.buffDef = 1.0;
                        }
                    }
                    if (p.yoseruZeroDefTurns > 0) {
                        p.yoseruZeroDefTurns--;
                        if (p.yoseruZeroDefTurns === 0) {
                            p.buffDef = 1.0;
                            this.log(`📉 ${p.charName} の「ヨセル」による防御力0効果が終了した。`, 'text-slate-400 text-xs');
                        }
                    }

                    if (p.buffAtkTurns > 0) {
                        p.buffAtkTurns--;
                        if (p.buffAtkTurns === 0) {
                            p.buffAtk = 1.0;
                        }
                    }

                    if (p.crimeDefDownTurns > 0) {
                        p.crimeDefDownTurns--;
                        if (p.crimeDefDownTurns === 0) {
                            p.buffDef = Math.max(1.0, p.buffDef);
                        }
                    } else if (p.buffDef < 1.0 && !p.nightmareDefTurns) {
                        p.buffDef = 1.0;
                    }

                    if (p.nightmareDefTurns > 0) {
                        p.nightmareDefTurns--;
                        if (p.nightmareDefTurns === 0) {
                            p.buffDef = 1.0;
                        }
                    }

                    if (p.nightmareAtkActive) {
                        p.nightmareAtkActive = false;
                        p.buffAtk /= 1.3;
                    }

                    if (p.critBuffTurns > 0) {
                        p.critBuffTurns--;
                        if (p.critBuffTurns === 0) p.critRateBonus = 0;
                    }
                    if (p.enemyEvaTurns > 0) {
                        p.enemyEvaTurns--;
                        if (p.enemyEvaTurns === 0) p.evaDebuff = 0;
                    }
                    if (p.momoEvaTurns > 0) {
                        p.momoEvaTurns--;
                        if (p.momoEvaTurns === 0) {
                            this.log(`🩷 ${p.charName} の「チエを呼ぶ」回避アップ効果が終了した。`, 'text-slate-400 text-xs');
                        }
                    }
                    if (p.digActive) {
                        p.digActive = false;
                    }
                });

                if (this.turn >= 30 && !this.isSuddenDeath) {
                    this.isSuddenDeath = true;
                    this.log('🔥 30ターン経過！サドンデスモード突入！（与ダメージ1.35倍）', 'text-red-500 font-black text-center');
                    this.triggerCutin('🔥 サドンデス突入！', '30ターン突破！ 全攻撃のダメージ上昇！');
                }
            }

            triggerEffect(side, type, text, targetChar = null) {
                if (this.currentTurnLogs && this.currentTurnLogs.length > 0) {
                    this.currentTurnLogs[this.currentTurnLogs.length - 1].effect = { side, type, text };
                }
                if (this.onVisualEffect) this.onVisualEffect(side, type, text);
                if (!targetChar) {
                    if (side === 'Player') {
                        targetChar = this.currentAttacker && this.getCharacterTeam && this.getCharacterTeam(this.currentAttacker) === 'ally' ? this.currentAttacker : (this.p1 || this.allies?.[0]);
                    } else if (side === 'Enemy') {
                        targetChar = this.currentAttacker && this.getCharacterTeam && this.getCharacterTeam(this.currentAttacker) === 'enemy' ? this.currentAttacker : (this.p1TargetChar && this.p1TargetChar.hp > 0 ? this.p1TargetChar : (this.p2 || (this.enemies ? this.enemies.find(e => e.hp > 0) || this.enemies[0] : null)));
                    }
                }
                if (targetChar && typeof triggerCharacterEffect === 'function') {
                    triggerCharacterEffect(targetChar, type, text);
                }
            }

            triggerCutin(title, subtitle) {
                if (this.currentTurnLogs && this.currentTurnLogs.length > 0) {
                    this.currentTurnLogs[this.currentTurnLogs.length - 1].cutin = { title, subtitle };
                }
                if (this.onCutin) this.onCutin(title, subtitle);
            }

            destroy() {
                this.stopTimer();
                if (this.firestoreUnsub) {
                    this.firestoreUnsub();
                    this.firestoreUnsub = null;
                    this.onlineSyncStarted = false;
                }
                if (this.heartbeatTimer) {
                    clearInterval(this.heartbeatTimer);
                    this.heartbeatTimer = null;
                }
            }
        }

        
        function getCharacterShakeElement(char) {
            if (!activeNewBattle || !char) return null;
            if (activeNewBattle.enemies) {
                const idx = activeNewBattle.enemies.findIndex(e => e === char);
                if (idx !== -1) return document.getElementById(`enemy-shake-${idx}`) || document.getElementById(`new-enemy-char-${idx}`);
            }
            if (activeNewBattle.allies) {
                const idx = activeNewBattle.allies.findIndex(a => a === char);
                if (idx !== -1) return document.getElementById(`ally-shake-${idx}`) || document.getElementById(`new-ally-char-${idx}`);
            }
            return null;
        }

        function getCharacterDOMElement(char) {
            if (!activeNewBattle || !char) {
                if (activeBattle) {
                    if (char === activeBattle.p1) return document.getElementById('p1-canvas');
                    if (char === activeBattle.p2) return document.getElementById('p2-canvas');
                }
                return document.getElementById('p1-canvas') || document.getElementById('screen-container');
            }

            if (activeNewBattle.enemies) {
                const idx = activeNewBattle.enemies.findIndex(e => e === char);
                if (idx !== -1) {
                    const el = document.getElementById(`enemy-char-${idx}`) || document.getElementById(`new-enemy-char-${idx}`);
                    if (el) return el;
                }
            }
            if (activeNewBattle.allies) {
                const idx = activeNewBattle.allies.findIndex(a => a === char);
                if (idx !== -1) {
                    const el = document.getElementById(`ally-char-${idx}`) || document.getElementById(`new-ally-char-${idx}`);
                    if (el) return el;
                }
            }

            return document.getElementById('screen-container');
        }

        function triggerCharacterEffect(targetChar, type, text) {
            const targetEl = getCharacterDOMElement(targetChar);
            console.log("キャラエフェクト実行 (game.js):", { targetChar, type, text, targetEl });
            if (!targetEl) return;

            const pop = document.createElement('div');
            pop.className = 'absolute font-pixel font-bold floating-text pointer-events-none';
            pop.style.zIndex = '9999';
            pop.style.pointerEvents = 'none';

            let color = 'text-white text-base';
            if (type === 'damage') {
                color = 'text-red-400 text-base sm:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
            } else if (type === 'heal') {
                color = 'text-emerald-400 text-base sm:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
            } else if (type === 'buff') {
                color = 'text-amber-300 text-base sm:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
            } else if (type === 'counter') {
                color = 'text-cyan-300 text-xs sm:text-sm font-bold font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
            } else if (type === 'counter_damage') {
                color = 'text-cyan-400 text-base sm:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
            } else if (type === 'miss') {
                color = 'text-sky-300 text-xs sm:text-sm font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
            } else if (type === 'crit') {
                color = 'text-yellow-300 text-xs sm:text-sm font-bold font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
            } else if (type === 'def' || type === 'defense') {
                color = 'text-blue-300 text-xs sm:text-sm font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
            } else if (type === 'pink') {
                color = 'text-pink-400 text-base sm:text-lg font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
            }

            pop.classList.add(...color.split(' '));
            pop.innerText = text;

            const rect = targetEl.getBoundingClientRect();
            pop.style.position = 'fixed';
            pop.style.left = `${rect.left + rect.width / 2}px`;
            
            if (type === 'miss' || type === 'crit' || type === 'def' || type === 'defense') {
                pop.style.top = `${rect.top + rect.height / 3}px`;
            } else {
                pop.style.top = `${rect.top - 10}px`;
            }
            pop.style.transform = 'translateX(-50%)';

            document.body.appendChild(pop);

            setTimeout(() => pop.remove(), 1200);
        }

        function triggerVisualEffect(side, type, text) {
            const canvasId = side === 'Player' ? 'p1-canvas' : 'p2-canvas';
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;

            const pop = document.createElement('div');
            pop.className = 'absolute font-pixel font-bold text-base sm:text-lg z-30 floating-text pointer-events-none';
            
            let color = 'text-white';
            if (type === 'damage') color = 'text-red-400 drop-shadow-[0_2px_0_rgba(0,0,0,1)]';
            else if (type === 'heal') color = 'text-emerald-400 drop-shadow-[0_2px_0_rgba(0,0,0,1)]';
            else if (type === 'buff') color = 'text-amber-300 drop-shadow-[0_2px_0_rgba(0,0,0,1)]';
            else if (type === 'miss') color = 'text-sky-300 drop-shadow-[0_2px_0_rgba(0,0,0,1)]';
            else if (type === 'def' || type === 'defense') color = 'text-blue-300 drop-shadow-[0_2px_0_rgba(0,0,0,1)]';

            pop.classList.add(...color.split(' '));
            pop.innerText = text;
            pop.style.left = `${canvas.offsetLeft + canvas.offsetWidth / 2 - 20}px`;
            pop.style.top = `${canvas.offsetTop + 10}px`;

            canvas.parentElement.appendChild(pop);
            setTimeout(() => pop.remove(), 1100);
        }

        function triggerCutinBanner(title, subtitle) {
            const stage = document.getElementById('battle-stage');
            if (!stage) return;

            const banner = document.createElement('div');
            banner.className = 'absolute inset-x-0 top-1/3 bg-gradient-to-r from-red-950 via-amber-600 to-red-950 text-white p-3 text-center z-50 shadow-2xl border-y-4 border-amber-300 animate-cutin pointer-events-none';
            banner.innerHTML = `
                <div class="font-pixel text-yellow-300 text-lg sm:text-2xl font-black drop-shadow-[0_3px_0_rgba(0,0,0,1)] tracking-widest">${title}</div>
                <div class="text-xs sm:text-sm font-bold text-white mt-1">${subtitle}</div>
            `;
            stage.appendChild(banner);
            setTimeout(() => banner.remove(), 1700);
        }

        function renderHomeScreen() {
            if (activeBattle) {
                activeBattle.destroy();
                activeBattle = null;
            }

            const container = document.getElementById('screen-container');
            if (!container) return;
            container.innerHTML = `
                <div class="relative w-full h-full flex flex-col justify-between p-3 pb-0 sm:p-5 sm:pb-0 select-none overflow-hidden">
                    
                    <!-- 背景画像 "screen" (エンドレスにゆっくり横へスクロール、ボタンやroughよりも後ろ) -->
                    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        <div class="absolute inset-y-0 left-0 flex animate-endless-scroll h-full w-[200%]">
                            <img src="images/screen.webp" alt="screen" class="w-1/2 h-full object-cover">
                            <img src="images/screen.webp" alt="screen" class="w-1/2 h-full object-cover">
                        </div>
                    </div>

                    <!-- 画面左上角に小さく表示する「設定」ボタンと「リロード」ボタン -->
                    <div class="absolute top-2 left-2 flex items-center gap-1.5 z-30">
                        <button onclick="openSettingsPanel()" class="pixel-btn text-[10px] px-2 py-0.5 font-bold shadow-md">
                            ⚙️ 設定
                        </button>
                        <button onclick="forceReloadApp()" class="pixel-btn pixel-btn-warning text-[10px] px-2 py-0.5 font-bold shadow-md" title="最新状態に更新">
                            🔄 更新
                        </button>
                    </div>

                    <!-- 画像 "rough" を画面右下に配置 -->
                    <img src="dopaAI/rough.webp" alt="rough" class="absolute bottom-0 right-2 sm:right-4 w-36 sm:w-52 object-contain pointer-events-none z-10 opacity-95">

                    <!-- 画面上端：DOPA、プロフィール (設定ボタンの下/右に配置) -->
                    <div class="w-full flex justify-between items-start relative z-20 shrink-0 pt-6">
                        <!-- 左上周辺：プロフィール と DOPA -->
                        <div class="flex items-center gap-3">
                            <!-- プロフィール -->
                            <div onclick="openProfileScreen()" class="flex items-center gap-2 bg-slate-900/90 pixel-box p-2 cursor-pointer hover:opacity-90 transition-opacity border-amber-400">
                                <canvas id="home-profile-icon" width="48" height="48" class="pixel-box bg-slate-950 rounded w-12 h-12 shrink-0"></canvas>
                                <div class="flex flex-col text-left">
                                    <span id="home-profile-name" class="text-amber-300 text-xs font-bold truncate max-w-[110px]">${playerState.playerName || '名無しファイター'}</span>
                                    <span class="text-[9px] text-slate-400 font-mono">ID: ${playerState.playerId || 'DP-1004'}</span>
                                </div>
                            </div>

                            <!-- DOPAの数 -->
                            <div class="pixel-box-gold px-3 py-1.5 flex flex-col items-center justify-center">
                                <span class="text-[9px] text-amber-300 font-bold">DOPA</span>
                                <span id="home-dopa-count" class="text-amber-400 font-bold text-xs sm:text-sm font-pixel">${formatDopa(playerState.dopa)}</span>
                            </div>
                        </div>

                        <div></div>
                    </div>

                    <!-- 画面中央 -->
                    <div class="flex-1 w-full my-auto relative pointer-events-none">
                    </div>

                    <!-- 画面下端：ドパガキングダム、ガチャ、ストア、フレンド のボタン群 (画像roughと同様に下にずらして配置) -->
                    <div class="absolute bottom-2 sm:bottom-4 left-3 sm:left-6 flex flex-col items-start z-20">
                        <div class="flex flex-col space-y-2.5 w-full max-w-sm">
                            <!-- 1行目: ドパガキングダム と ストア (正方形) -->
                            <div class="flex gap-2.5 w-full items-center">
                                <button onclick="handleDopagaKingdomClick()" class="pixel-btn pixel-btn-primary flex-1 py-3 px-4 text-xs sm:text-sm font-bold font-pixel flex items-center justify-center gap-2 shadow-md">
                                    <span>👑 ドパガキングダム</span>
                                </button>
                                <button onclick="openStoreModal()" class="pixel-btn pixel-btn-warning w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center text-xs font-bold shrink-0">
                                    <span class="text-sm sm:text-base">🛒</span>
                                    <span class="text-[8px] sm:text-[9px]">ストア</span>
                                </button>
                            </div>

                            <!-- 2行目: ガチャ と フレンド (正方形) -->
                            <div class="flex gap-2.5 w-full items-center">
                                <button onclick="openGachaModal()" class="pixel-btn pixel-btn-success flex-1 py-3 px-4 text-xs sm:text-sm font-bold font-pixel flex items-center justify-center gap-2 shadow-md">
                                    <span>🎰 ガチャ</span>
                                </button>
                                <button onclick="openFriendModal()" class="pixel-btn pixel-btn-purple w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center text-xs font-bold shrink-0">
                                    <span class="text-sm sm:text-base">👥</span>
                                    <span class="text-[8px] sm:text-[9px]">フレンド</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            `;

            const cvs = document.getElementById('home-profile-icon');
            if (cvs) CharacterRenderer.drawCharacter(cvs, playerState.selectedIcon || 'dopagaking');
        }

        function handleDopagaKingdomClick() {
            audioSystem.playSelect();
            renderDopagaKingdomScreen();
        }

        function renderDopagaKingdomScreen() {
            const container = document.getElementById('screen-container');
            if (!container) return;
            container.innerHTML = `
                <div class="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden bg-slate-950">
                    <!-- 背景エフェクトや装飾 -->
                    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
                        <div class="absolute inset-y-0 left-0 flex animate-endless-scroll h-full w-[200%]">
                            <img src="images/screen.webp" alt="screen" class="w-1/2 h-full object-cover">
                            <img src="images/screen.webp" alt="screen" class="w-1/2 h-full object-cover">
                        </div>
                    </div>

                    <!-- ヘッダー部分：戻るボタンとタイトル -->
                    <div class="flex items-center justify-between relative z-10 w-full mb-4">
                        <button onclick="renderHomeScreen()" class="pixel-btn pixel-btn-danger px-3 py-1.5 text-xs font-bold">
                            ◀ ホームに戻る
                        </button>
                        <h2 class="text-amber-400 font-pixel text-base sm:text-xl font-bold tracking-wider drop-shadow-md">👑 ドパガキングダム</h2>
                        <div class="w-20"></div>
                    </div>

                    <!-- 中央：2つの大きめの正方形ボタン -->
                    <div class="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10 my-auto">
                        <!-- BOTと戦うボタン -->
                        <button onclick="handleBotBattleClick()" class="pixel-box bg-slate-900 border-amber-400 hover:border-amber-300 w-44 h-44 sm:w-56 sm:h-56 flex flex-col items-center justify-center gap-3 p-4 cursor-pointer transform hover:scale-105 transition-all shadow-xl group">
                            <span class="text-4xl sm:text-5xl group-hover:scale-110 transition-transform">🤖</span>
                            <span class="text-amber-300 font-pixel font-bold text-sm sm:text-lg tracking-wide">BOTと戦う</span>
                            <span class="text-[10px] text-slate-400 text-center">AIファイターと手軽に対戦！</span>
                        </button>

                        <!-- オンラインで戦うボタン -->
                        <button onclick="handleOnlineBattleClick()" class="pixel-box bg-slate-900 border-emerald-400 hover:border-emerald-300 w-44 h-44 sm:w-56 sm:h-56 flex flex-col items-center justify-center gap-3 p-4 cursor-pointer transform hover:scale-105 transition-all shadow-xl group">
                            <span class="text-4xl sm:text-5xl group-hover:scale-110 transition-transform">🌐</span>
                            <span class="text-emerald-300 font-pixel font-bold text-sm sm:text-lg tracking-wide">オンラインで戦う</span>
                            <span class="text-[10px] text-slate-400 text-center">全国のライバルとリアルタイム対戦！</span>
                        </button>
                    </div>

                    <!-- フッターメッセージ -->
                    <div class="text-center relative z-10 pb-2">
                        <p class="text-xs text-slate-400 font-pixel">戦うモードを選択してください</p>
                    </div>
                </div>
            `;
        }

        function openStaffCodeModal() {
            audioSystem.playSelect();
            closeSettingsPanel();
            showModal("🔐 関係者認証", `
                <div class="space-y-3 text-center">
                    <p class="text-xs text-slate-300">関係者コードを入力してください:</p>
                    <input id="staff-code-input" type="password" maxlength="6" placeholder="4桁のコード" class="pixel-box bg-slate-950 px-3 py-2 text-center text-amber-300 text-sm font-mono tracking-widest outline-none border-amber-600 w-40 mx-auto block">
                    <div id="staff-code-error" class="text-red-400 text-[11px] h-4"></div>
                    <button onclick="verifyStaffCode()" class="pixel-btn pixel-btn-primary px-6 py-2 text-xs font-bold font-pixel mx-auto">認証する</button>
                </div>
            `, null);
        }

        function verifyStaffCode() {
            audioSystem.playSelect();
            const input = document.getElementById('staff-code-input');
            const err = document.getElementById('staff-code-error');
            if (!input) return;

            if (input.value === '1234') {
                closeModal();
                renderMetaScreen();
            } else {
                if (err) err.innerText = '⚠️ コードが違います (正解: 1234)';
                input.value = '';
            }
        }

        function handleBotBattleClick() {
            audioSystem.playSelect();
            renderBotModesScreen();
        }

        function renderBotModesScreen() {
            const container = document.getElementById('screen-container');
            if (!container) return;
            container.innerHTML = `
                <div class="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden bg-slate-950">
                    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
                        <div class="absolute inset-y-0 left-0 flex animate-endless-scroll h-full w-[200%]">
                            <img src="images/screen.webp" alt="screen" class="w-1/2 h-full object-cover">
                            <img src="images/screen.webp" alt="screen" class="w-1/2 h-full object-cover">
                        </div>
                    </div>

                    <div class="flex items-center justify-between relative z-10 w-full mb-3">
                        <button onclick="renderDopagaKingdomScreen()" class="pixel-btn pixel-btn-danger px-3 py-1.5 text-xs font-bold">
                            ◀ 王国に戻る
                        </button>
                        <h2 class="text-amber-400 font-pixel text-base sm:text-xl font-bold tracking-wider drop-shadow-md">🤖 3対3バトルモード選択</h2>
                        <div class="w-20"></div>
                    </div>

                    <div class="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10 my-auto items-center justify-center max-w-4xl mx-auto w-full">
                        <button onclick="renderNewBattleCharSelectScreen()" class="pixel-box bg-slate-900 border-emerald-400 hover:border-emerald-300 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transform hover:scale-105 transition-all shadow-xl h-28 sm:h-36 group">
                            <span class="text-2xl sm:text-3xl">✨</span>
                            <span class="text-emerald-300 font-pixel font-bold text-xs sm:text-sm text-center">3対3バトルモード</span>
                            <span class="text-[9px] text-slate-400 text-center">3対3のチームバトル！</span>
                        </button>

                        <button onclick="showModal('準備中', 'このモードは現在準備中です。')" class="pixel-box bg-slate-900 border-slate-700 hover:border-amber-400 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transform hover:scale-105 transition-all shadow-xl h-28 sm:h-36 group opacity-80">
                            <span class="text-2xl sm:text-3xl">🛡️</span>
                            <span class="text-slate-300 font-pixel font-bold text-xs sm:text-sm text-center">サバイバル</span>
                            <span class="text-[9px] text-slate-400 text-center">連戦勝ち抜き戦</span>
                        </button>

                        <button onclick="showModal('準備中', 'このモードは現在準備中です。')" class="pixel-box bg-slate-900 border-slate-700 hover:border-amber-400 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transform hover:scale-105 transition-all shadow-xl h-28 sm:h-36 group opacity-80">
                            <span class="text-2xl sm:text-3xl">⚡</span>
                            <span class="text-slate-300 font-pixel font-bold text-xs sm:text-sm text-center">タイムアタック</span>
                            <span class="text-[9px] text-slate-400 text-center">最速撃破を目指せ</span>
                        </button>

                        <button onclick="showModal('準備中', 'このモードは現在準備中です。')" class="pixel-box bg-slate-900 border-slate-700 hover:border-amber-400 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transform hover:scale-105 transition-all shadow-xl h-28 sm:h-36 group opacity-80">
                            <span class="text-2xl sm:text-3xl">🎯</span>
                            <span class="text-slate-300 font-pixel font-bold text-xs sm:text-sm text-center">ボスラッシュ</span>
                            <span class="text-[9px] text-slate-400 text-center">歴代ボス連戦</span>
                        </button>

                        <button onclick="showModal('準備中', 'このモードは現在準備中です。')" class="pixel-box bg-slate-900 border-slate-700 hover:border-amber-400 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transform hover:scale-105 transition-all shadow-xl h-28 sm:h-36 group opacity-80">
                            <span class="text-2xl sm:text-3xl">🎲</span>
                            <span class="text-slate-300 font-pixel font-bold text-xs sm:text-sm text-center">運試しルーレット</span>
                            <span class="text-[9px] text-slate-400 text-center">運命のDOPA勝負</span>
                        </button>

                        <button onclick="showModal('準備中', 'このモードは現在準備中です。')" class="pixel-box bg-slate-900 border-slate-700 hover:border-amber-400 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transform hover:scale-105 transition-all shadow-xl h-28 sm:h-36 group opacity-80">
                            <span class="text-2xl sm:text-3xl">💎</span>
                            <span class="text-slate-300 font-pixel font-bold text-xs sm:text-sm text-center">トレジャーハント</span>
                            <span class="text-[9px] text-slate-400 text-center">財宝を発掘しよう</span>
                        </button>

                        <button onclick="showModal('準備中', 'このモードは現在準備中です。')" class="pixel-box bg-slate-900 border-slate-700 hover:border-amber-400 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transform hover:scale-105 transition-all shadow-xl h-28 sm:h-36 group opacity-80">
                            <span class="text-2xl sm:text-3xl">🔥</span>
                            <span class="text-slate-300 font-pixel font-bold text-xs sm:text-sm text-center">激闘チャレンジ</span>
                            <span class="text-[9px] text-slate-400 text-center">特殊ルールの試練</span>
                        </button>

                        <button onclick="showModal('準備中', 'このモードは現在準備中です。')" class="pixel-box bg-slate-900 border-slate-700 hover:border-amber-400 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transform hover:scale-105 transition-all shadow-xl h-28 sm:h-36 group opacity-80">
                            <span class="text-2xl sm:text-3xl">🌟</span>
                            <span class="text-slate-300 font-pixel font-bold text-xs sm:text-sm text-center">トレーニング</span>
                            <span class="text-[9px] text-slate-400 text-center">自由に練習しよう</span>
                        </button>
                    </div>

                    <div class="text-center relative z-10 pb-2">
                        <p class="text-xs text-slate-400 font-pixel">プレイしたいモードを選んでください</p>
                    </div>
                </div>
            `;
        }



        function selectNewBattleTarget(targetIdx, isAllySide) {
            if (!activeNewBattle) return;
            let skill = null;
            const recordedRec = (activeNewBattle.p1 && activeNewBattle.p1.id === 'asaiomizu' && activeNewBattle.p1.recordedSkill) ? activeNewBattle.p1.recordedSkill : null;
            if (newBattleTargetSelectSkillId === 'asaiomizu_copied' && recordedRec) {
                const rec = recordedRec;
                skill = { ...rec, id: 'asaiomizu_copied', name: `📋【コピー】${rec.name}` };
            } else if (newBattleTargetSelectSkillId === 'dopa_obey_copy' && window.newBattleTargetSelectCopiedSkill) {
                skill = window.newBattleTargetSelectCopiedSkill;
            } else {
                skill = activeNewBattle.p1.skills.find(s => s.id === newBattleTargetSelectSkillId) || activeNewBattle.p1.skills.find(s => s.isNormalAttack);
            }
            const tType = skill ? (skill.targetType || 'single_enemy') : 'single_enemy';
            if (tType === 'single_ally' && !isAllySide) return;
            if ((tType === 'single_enemy' || newBattleTargetSelectSkillId === 'asaiomizu_copied' || (newBattleTargetSelectSkillId === 'dopa_obey_copy' && tType === 'single_enemy')) && isAllySide && tType !== 'single_ally') return;

            activeNewBattle.p1TargetIndex = targetIdx;
            activeNewBattle.p1TargetChar = isAllySide ? activeNewBattle.allies[targetIdx] : activeNewBattle.enemies[targetIdx];
            newBattleViewMode = 'main';

            activeNewBattle.submitAction(1, newBattleTargetSelectSkillId);
            newBattleTargetSelectSkillId = null;
            newBattleTargetSelectType = null;
            renderNewBattleScreen();
        }

        function renderNewBattleCharSelectScreen(sortOrder = 'default', sortDir = 'desc', onlyOwned = false) {
            audioSystem.playSelect();
            const existingOverlay = document.getElementById('battle-result-overlay');
            if (existingOverlay) existingOverlay.remove();

            const container = document.getElementById('screen-container');
            if (!container) return;
            container.scrollTop = 0;

            const selected = window.selectedNewBattleChar || 'asaiomizu';
            let chars = Object.values(CHARACTER_DATA);

            if (onlyOwned) {
                chars = chars.filter(c => playerState.unlockedChars.includes(c.id));
            }

            chars.sort((a, b) => {
                let valA = 0;
                let valB = 0;
                if (sortOrder === 'hp') {
                    valA = a.hp;
                    valB = b.hp;
                } else if (sortOrder === 'atk') {
                    valA = a.atk;
                    valB = b.atk;
                } else if (sortOrder === 'def') {
                    valA = a.def;
                    valB = b.def;
                } else if (sortOrder === 'critRate') {
                    valA = a.critRate;
                    valB = b.critRate;
                } else if (sortOrder === 'eva') {
                    valA = a.eva;
                    valB = b.eva;
                } else {
                    const keys = Object.keys(CHARACTER_DATA);
                    return keys.indexOf(a.id) - keys.indexOf(b.id);
                }

                if (sortDir === 'desc') {
                    return valB - valA;
                } else {
                    return valA - valB;
                }
            });

            const unlockedCount = playerState.unlockedChars.length;
            const totalCount = Object.keys(CHARACTER_DATA).length;

            let html = `
                <div class="w-full h-full flex flex-col items-center justify-between max-w-4xl mx-auto py-1 px-2 overflow-hidden select-none bg-slate-950 text-white">
                    <div class="pixel-box-gold p-1.5 sm:p-2 bg-amber-950/90 w-full text-center space-y-0.5 border-amber-400 mb-1.5 flex-shrink-0">
                        <div class="flex items-center justify-between">
                            <button onclick="renderBotModesScreen()" class="pixel-btn pixel-btn-danger px-2.5 py-0.5 text-xs font-bold">
                                ◀ モード選択
                            </button>
                            <h2 class="text-xs sm:text-base font-bold text-amber-300 font-pixel">
                                 ✨ 3v3バトルモード - キャラ選択
                            </h2>
                            <div class="w-16"></div>
                        </div>
                        <p class="text-[9px] sm:text-[11px] text-amber-200 font-mono">アイコンをタップして詳細確認・出陣ファイターを選択せよ！</p>
                    </div>

                    <div class="flex items-center justify-between w-full mb-1.5 px-1 gap-2 flex-wrap flex-shrink-0">
                        <div class="flex items-center gap-1.5 text-xs">
                            <span class="text-slate-400 font-bold">並び替え:</span>
                            <select id="new-char-select-sort-order" onchange="onNewCharSelectSortChange('${sortDir}', ${onlyOwned})" class="pixel-box bg-slate-900 text-amber-300 px-2 py-1 text-xs outline-none border-amber-600">
                                <option value="default" ${sortOrder === 'default' ? 'selected' : ''}>登録順</option>
                                <option value="hp" ${sortOrder === 'hp' ? 'selected' : ''}>HPが高い順</option>
                                <option value="atk" ${sortOrder === 'atk' ? 'selected' : ''}>攻撃力が高い順</option>
                                <option value="def" ${sortOrder === 'def' ? 'selected' : ''}>防御力が高い順</option>
                                <option value="critRate" ${sortOrder === 'critRate' ? 'selected' : ''}>クリティカル率が高い順</option>
                                <option value="eva" ${sortOrder === 'eva' ? 'selected' : ''}>回避率が高い順</option>
                            </select>
                            <button onclick="toggleNewCharSelectSortDir('${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2 py-1 text-xs font-bold bg-slate-800 border-slate-600">
                                ${sortDir === 'desc' ? '🔽 降順(高)' : '🔼 昇順(低)'}
                            </button>
                            <button onclick="toggleNewCharSelectOwnedFilter('${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn px-2 py-1 text-xs font-bold ${onlyOwned ? 'pixel-btn-success border-emerald-400 text-emerald-200' : 'bg-slate-800 border-slate-600 text-slate-300'}">
                                ${onlyOwned ? '✨ 入手済みのみ: ON' : '📦 入手済みのみ: OFF'}
                            </button>
                        </div>
                        <div class="text-[10px] sm:text-xs font-mono text-amber-200 bg-slate-900 px-2.5 py-1 rounded border border-amber-600/50">
                            所持: <b class="text-emerald-400">${unlockedCount}</b> / ${totalCount} 体
                        </div>
                    </div>

                    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 w-full mb-1.5 px-1 overflow-y-auto flex-1 min-h-0">
            `;

            chars.forEach(c => {
                const isUnlocked = playerState.unlockedChars.includes(c.id);
                const isSelected = selected === c.id;

                let statDisplay = '';
                if (c.id === 'dopagaking') {
                    if (sortOrder === 'hp') statDisplay = `<span class="text-[9px] sm:text-[10px] text-emerald-400 font-bold">HP: ？</span>`;
                    else if (sortOrder === 'atk') statDisplay = `<span class="text-[9px] sm:text-[10px] text-amber-400 font-bold">攻: ？</span>`;
                    else if (sortOrder === 'def') statDisplay = `<span class="text-[9px] sm:text-[10px] text-cyan-400 font-bold">防: ？</span>`;
                    else if (sortOrder === 'critRate') statDisplay = `<span class="text-[9px] sm:text-[10px] text-purple-400 font-bold">クリ: ？%</span>`;
                    else if (sortOrder === 'eva') statDisplay = `<span class="text-[9px] sm:text-[10px] text-blue-400 font-bold">避: ？%</span>`;
                } else {
                    if (sortOrder === 'hp') statDisplay = `<span class="text-[9px] sm:text-[10px] text-emerald-400 font-bold">HP: ${c.hp}</span>`;
                    else if (sortOrder === 'atk') statDisplay = `<span class="text-[9px] sm:text-[10px] text-amber-400 font-bold">攻: ${c.atk}</span>`;
                    else if (sortOrder === 'def') statDisplay = `<span class="text-[9px] sm:text-[10px] text-cyan-400 font-bold">防: ${c.def}</span>`;
                    else if (sortOrder === 'critRate') statDisplay = `<span class="text-[9px] sm:text-[10px] text-purple-400 font-bold">クリ: ${Math.round(c.critRate * 100)}%</span>`;
                    else if (sortOrder === 'eva') statDisplay = `<span class="text-[9px] sm:text-[10px] text-blue-400 font-bold">避: ${c.eva}%</span>`;
                }

                html += `
                    <div onclick="openCharDetail('${c.id}', 'new_select', '${sortOrder}', '${sortDir}', ${onlyOwned})" 
                         class="pixel-box p-2 sm:p-3 bg-slate-900 cursor-pointer flex flex-col items-center justify-between border-2 transition-all ${isSelected ? 'border-amber-400 bg-amber-950/40 scale-105 shadow-lg' : 'border-slate-700 hover:border-slate-400'} ${!isUnlocked ? 'opacity-60 grayscale' : ''}">
                        <canvas id="new-select-cvs-${c.id}" width="95" height="95" class="pixel-box bg-slate-950 mb-1 w-16 h-16 sm:w-24 sm:h-24"></canvas>
                        <span class="text-[11px] sm:text-xs font-bold ${isSelected ? 'text-amber-300 font-pixel' : 'text-slate-200'} truncate max-w-full">${c.name}</span>
                        <span class="text-[9px] text-slate-400 truncate max-w-full">${c.title}</span>
                        ${statDisplay}
                        ${!isUnlocked ? '<span class="text-[9px] text-red-400 font-bold mt-0.5">🔒 未解放</span>' : (isSelected ? '<span class="text-[9px] text-amber-400 font-pixel font-bold mt-0.5">✨ 選択中</span>' : '<span class="text-[9px] text-slate-400 font-bold mt-0.5">タップで詳細</span>')}
                    </div>
                `;
            });

            html += `
                    </div>
                    <div class="flex gap-3 w-full justify-center pb-1 flex-shrink-0">
                        <button onclick="
                            const pChar = window.selectedNewBattleChar || 'asaiomizu';
                            const otherIds = Object.keys(CHARACTER_DATA).filter(id => id !== pChar);
                            const eChar = otherIds[Math.floor(Math.random() * otherIds.length)] || 'pasha';
                            startNewBattleMode(pChar, eChar);
                        " class="pixel-btn pixel-btn-primary px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold font-pixel shadow-lg">
                            このキャラクターで出陣！ ▶
                        </button>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            setTimeout(() => {
                chars.forEach(c => {
                    const cvs = document.getElementById(`new-select-cvs-${c.id}`);
                    if (cvs) CharacterRenderer.drawCharacter(cvs, c.id);
                });
            }, 50);
        }

        function onNewCharSelectSortChange(currentDir, onlyOwned) {
            const select = document.getElementById('new-char-select-sort-order');
            if (select) {
                renderNewBattleCharSelectScreen(select.value, currentDir, onlyOwned);
            }
        }

        function toggleNewCharSelectSortDir(currentOrder, currentDir, onlyOwned) {
            const newDir = currentDir === 'desc' ? 'asc' : 'desc';
            renderNewBattleCharSelectScreen(currentOrder, newDir, onlyOwned);
        }

        function toggleNewCharSelectOwnedFilter(currentOrder, currentDir, onlyOwned) {
            renderNewBattleCharSelectScreen(currentOrder, currentDir, !onlyOwned);
        }

        window.renderNewCharSelectScreen = renderNewBattleCharSelectScreen;
        window.onNewCharSelectSortChange = onNewCharSelectSortChange;
        window.toggleNewCharSelectSortDir = toggleNewCharSelectSortDir;
        window.toggleNewCharSelectOwnedFilter = toggleNewCharSelectOwnedFilter;

        function executeNewBattleCourtneyCharge() {
            if (!activeNewBattle || activeNewBattle.battleEnded || activeNewBattle.isProcessing || activeNewBattle.p1Action !== null || activeNewBattle.waitingForOpponent || activeNewBattle.p1.isResting) return;
            if (activeNewBattle.p1.id !== 'courtney') return;
            if ((activeNewBattle.p1.courtneyChargeCount || 0) < 8) {
                activeNewBattle.submitAction(1, 'courtney_charge_only');
            } else {
                showModal("MAXチャージ", "これ以上溜められません！スキルから「FEEL SO HOT ///」を選択して解放してください！");
            }
        }
        window.executeNewBattleCourtneyCharge = executeNewBattleCourtneyCharge;

        function formatElapsedTime(totalSeconds) {
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        function startNewBattleMode(playerCharId = 'asaiomizu', enemyCharId = 'asaiomizu') {
            audioSystem.playSelect();
            newBattleViewMode = 'main';
            isNewBattleSkillModalOpen = false;

            if (activeNewBattle) {
                activeNewBattle.stopTimer();
                activeNewBattle.stopElapsedTimer();
                activeNewBattle = null;
            }

            activeNewBattle = new BattleEngine(playerCharId, enemyCharId, false, 1, null, true);

            activeNewBattle.onLogUpdate = (msg, colorClass) => {
                appendNewBattleLog(msg, colorClass);
            };

            activeNewBattle.onTimerUpdate = (sec) => {
                const timerEl = document.getElementById('new-battle-timer');
                if (timerEl) {
                    timerEl.innerText = sec;
                    if (sec <= 5) timerEl.className = 'font-pixel text-xs sm:text-sm font-bold text-red-500 animate-ping';
                    else timerEl.className = 'font-pixel text-xs sm:text-sm font-bold text-emerald-400';
                }
            };

            activeNewBattle.onElapsedTimerUpdate = (sec) => {
                const elapsedEl = document.getElementById('new-battle-elapsed-timer');
                if (elapsedEl) {
                    elapsedEl.innerText = formatElapsedTime(sec);
                }
            };

            activeNewBattle.onStateChange = (engine) => {
                renderNewBattleScreen();
            };

            activeNewBattle.onCutin = (title, subtitle) => {
                if (typeof triggerCutinBanner === 'function') triggerCutinBanner(title, subtitle);
            };

            activeNewBattle.onBattleEnd = (winner) => {
                updateNewBattleUIValues();
                handleNewBattleEnd();
            };

            activeNewBattle.startBattle();
            renderNewBattleScreen();
        }

        function handleNewBattleEnd() {
            if (!activeNewBattle) return;
            const p1 = activeNewBattle.p1;
            const p2 = activeNewBattle.p2;

            setTimeout(() => {
                const existing = document.getElementById('battle-result-overlay');
                if (existing) existing.remove();

                if (p1.hp <= 0 && p2.hp > 0) {
                    audioSystem.playDefeat();
                    const html = `
                        <div id="battle-result-overlay" class="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4 sm:p-6 text-center opacity-0 transition-opacity duration-1000">
                            <div class="pixel-box-dark p-6 sm:p-8 bg-slate-950/95 border-red-500 shadow-2xl max-w-md w-full flex flex-col items-center">
                                <div class="text-4xl sm:text-6xl font-pixel font-black text-red-500 mb-3 animate-pulse">LOSE</div>
                                <p class="text-xs sm:text-sm text-slate-300 font-mono mb-6">力尽きてしまいました……次こそは勝利を掴ろう！</p>
                                <button onclick="renderNewBattleCharSelectScreen()" class="pixel-btn pixel-btn-primary px-8 py-3 text-sm font-bold font-pixel shadow-xl">
                                    バトル選択画面へ戻る ▶
                                </button>
                            </div>
                        </div>
                    `;
                    document.body.insertAdjacentHTML('beforeend', html);
                    setTimeout(() => {
                        const overlay = document.getElementById('battle-result-overlay');
                        if (overlay) overlay.classList.remove('opacity-0');
                    }, 50);
                } else if (p2.hp <= 0 && p1.hp > 0) {
                    audioSystem.playVictory();
                    addDopa(150);
                    const html = `
                        <div id="battle-result-overlay" class="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-cutin">
                            <div class="pixel-box-gold p-6 sm:p-8 bg-amber-950/95 border-amber-400 shadow-2xl max-w-md w-full flex flex-col items-center">
                                <div class="text-4xl sm:text-6xl font-pixel font-black text-amber-300 mb-2 animate-bounce">WIN</div>
                                <p class="text-xs sm:text-sm text-amber-200 font-mono mb-4">お見事！見事に勝利を収めました！<br><b class="text-amber-400">+150 DOPA</b> を獲得！</p>
                                <button onclick="renderNewBattleCharSelectScreen()" class="pixel-btn pixel-btn-primary px-8 py-3 text-sm font-bold font-pixel shadow-xl">
                                    バトル選択画面へ戻る ▶
                                </button>
                            </div>
                        </div>
                    `;
                    document.body.insertAdjacentHTML('beforeend', html);
                } else {
                    const html = `
                        <div id="battle-result-overlay" class="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-cutin">
                            <div class="pixel-box p-6 sm:p-8 bg-slate-900 border-yellow-400 shadow-2xl max-w-md w-full flex flex-col items-center">
                                <div class="text-2xl sm:text-4xl font-pixel font-black text-yellow-300 mb-2">DRAW</div>
                                <p class="text-xs sm:text-sm text-slate-300 font-mono mb-4">相討ちとなりました！</p>
                                <button onclick="renderNewBattleCharSelectScreen()" class="pixel-btn pixel-btn-primary px-8 py-3 text-sm font-bold font-pixel shadow-xl">
                                    バトル選択画面へ戻る ▶
                                </button>
                            </div>
                        </div>
                    `;
                    document.body.insertAdjacentHTML('beforeend', html);
                }
            }, 1000);
        }

        function handleNewBattleContinueChoice(action) {
            audioSystem.playSelect();
            if (!activeNewBattle) return;

            if (action === 'skip') {
                activeNewBattle.waitingForChoice = false;
                activeNewBattle.isRunModalOpen = false;
                activeNewBattle.battleEnded = true;
                activeNewBattle.stopTimer();
                activeNewBattle.stopElapsedTimer();
                activeNewBattle.winnerText = '💀 敵チームの勝利！';
                if (activeNewBattle.onBattleEnd) {
                    activeNewBattle.onBattleEnd(activeNewBattle.winnerText);
                }
                renderNewBattleScreen();
            } else if (action === 'switch') {
                let nextIdx = -1;
                if (activeNewBattle.allies) {
                    for (let i = 0; i < activeNewBattle.allies.length; i++) {
                        if (activeNewBattle.allies[i].hp > 0 && activeNewBattle.allies[i] !== activeNewBattle.p1) {
                            nextIdx = i;
                            break;
                        }
                    }
                    if (nextIdx === -1) {
                        for (let i = 0; i < activeNewBattle.allies.length; i++) {
                            if (activeNewBattle.allies[i].hp > 0) {
                                nextIdx = i;
                                break;
                            }
                        }
                    }
                }

                if (nextIdx === -1 || (activeNewBattle.allies && activeNewBattle.allies.every(a => a.hp <= 0))) {
                    handleNewBattleContinueChoice('skip');
                    return;
                }

                activeNewBattle.activeAllyIndex = nextIdx;
                activeNewBattle.p1 = activeNewBattle.allies[nextIdx];
                activeNewBattle.waitingForChoice = false;
                activeNewBattle.isRunModalOpen = false;
                activeNewBattle.p1Action = null;
                activeNewBattle.p1TargetIndex = null;
                activeNewBattle.p1TargetChar = null;

                activeNewBattle.log(`🔄 ${activeNewBattle.p1.charName} に操作権が引き継がれた！`, 'text-amber-300 font-bold');
                if (activeNewBattle.onCutin) {
                    activeNewBattle.onCutin('🔄 キャラクター交代！', `${activeNewBattle.p1.charName} が戦闘を引き継ぎます！`);
                }

                audioSystem.playBuff();
                activeNewBattle.startTimer();
                renderNewBattleScreen();
            } else if (action === 'cancel') {
                activeNewBattle.isRunModalOpen = false;
                renderNewBattleScreen();
            }
        }
        window.handleNewBattleContinueChoice = handleNewBattleContinueChoice;

        function renderNewBattleScreen() {
            const container = document.getElementById('screen-container');
            if (!container || !activeNewBattle) return;
            if (typeof refreshActiveBattleTooltip === 'function') {
                refreshActiveBattleTooltip();
            }

            const p1 = activeNewBattle.p1;
            const p2 = activeNewBattle.p2;
            const allies = activeNewBattle.allies || [p1];
            const enemies = activeNewBattle.enemies || [p2];

            const getCharImg = (player, isPlayerSide) => {
                const isC = player.id === 'courtney';
                const isA = player.id === 'asaiomizu';
                const isD = player.id === 'dopagaking';
                const charData = CHARACTER_DATA[player.id] || {};

                if (player.hp <= 0) {
                    if (charData.dieImage) return charData.dieImage;
                    if (isA) return 'asaiomizu/asaiomizu3.webp';
                    return charData.image || player.image;
                }

                if (isD && (player.dopaChargeCount || 0) >= 6 && player.selectedInheritChar) {
                    const targetData = CHARACTER_DATA[player.selectedInheritChar];
                    if (targetData) return targetData.image || targetData.allImage || player.image;
                }

                const isCharged = (isC && (player.courtneyChargeCount || 0) > 0) ||
                                  (isD && (player.dopaChargeCount || 0) > 0);

                if (isCharged && charData.chargedImage) {
                    return charData.chargedImage;
                }

                if (isA) return 'asaiomizu/asaiomizu2.webp';

                return charData.allImage || charData.image || player.image;
            };

            const pImg = getCharImg(p1, true);
            const eImg = getCharImg(p2, false);

            const p1IsCharging = (p1.id === 'courtney' && (p1.courtneyChargeCount || 0) > 0 && p1.hp > 0) || (p1.id === 'dopagaking' && (p1.dopaChargeCount || 0) > 0 && (p1.dopaChargeCount || 0) < 6 && p1.hp > 0);
            const p2IsCharging = (p2.id === 'courtney' && (p2.courtneyChargeCount || 0) > 0 && p2.hp > 0) || (p2.id === 'dopagaking' && (p2.dopaChargeCount || 0) > 0 && (p2.dopaChargeCount || 0) < 6 && p2.hp > 0);

            const isMyTurn = !activeNewBattle.battleEnded && !activeNewBattle.isProcessing && activeNewBattle.p1Action === null && !activeNewBattle.waitingForOpponent && !p1.isResting;

            let actorIndicator = '';
            if (activeNewBattle.isProcessing && activeNewBattle.currentAttacker) {
                const actor = activeNewBattle.currentAttacker;
                const isAlly = activeNewBattle.getCharacterTeam(actor) === 'ally';
                const actorName = (actor.charName || '').replace(/SPパシャ憎・半浸闇化状態|パシャ憎・半浸闇化状態/g, 'パシャ憎・半浸闇化');
                actorIndicator = `
                    <div class="px-2 py-0.5 rounded border text-[10px] sm:text-xs font-bold font-pixel animate-pulse shadow ${isAlly ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300' : 'bg-red-950/90 border-red-500 text-red-300'}">
                        ⚡ 現在行動中：${isAlly ? '【味方】' : '【敵】'} ${actorName}
                    </div>
                `;
            } else if (isMyTurn) {
                const p1Name = (p1.charName || '').replace(/SPパシャ憎・半浸闇化状態|パシャ憎・半浸闇化状態/g, 'パシャ憎・半浸闇化');
                actorIndicator = `
                    <div class="px-2 py-0.5 rounded border border-emerald-400 bg-emerald-950/90 text-emerald-300 text-[10px] sm:text-xs font-bold font-pixel animate-pulse shadow">
                        🟢 自分のターン (${p1Name})
                    </div>
                `;
            } else {
                actorIndicator = `
                    <div class="px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-400 text-[10px] sm:text-xs font-bold font-pixel">
                        ⏳ 相手のターン
                    </div>
                `;
            }

            let commandAreaContent = '';
            if (newBattleViewMode === 'target_select') {
                commandAreaContent = `
                    <div class="flex flex-col gap-1 w-full h-full justify-center text-center">
                        <div class="font-pixel text-[11px] text-amber-300 font-bold animate-bounce">🎯 対象を選択してください</div>
                        <button onclick="newBattleViewMode='main'; renderNewBattleScreen();" class="pixel-btn pixel-btn-danger py-1 px-2 text-[10px] font-bold font-pixel">
                            ✕ キャンセル
                        </button>
                    </div>
                `;
            } else if (newBattleViewMode === 'attack_select') {
                const normalSkill = p1.skills.find(s => s.isNormalAttack) || p1.skills[0];
                commandAreaContent = `
                    <div class="flex flex-col gap-1 w-full h-full justify-center">
                        <button onclick="executeNewBattleAction('${normalSkill.id}')" class="pixel-box bg-slate-900 border border-amber-400 hover:border-amber-300 p-1.5 text-left cursor-pointer shadow">
                            <div class="font-pixel text-[11px] text-amber-300 font-bold">${normalSkill.name}</div>
                            <div class="text-[9px] text-slate-300 font-mono truncate">${normalSkill.desc}</div>
                        </button>
                        <button onclick="executeNewBattleAction('back_to_main')" class="pixel-btn pixel-btn-warning py-1 px-2 text-[10px] font-bold font-pixel">
                            ◀ 戻る
                        </button>
                    </div>
                `;
            } else {
                const actionDisabledClass = !isMyTurn ? 'opacity-50 pointer-events-none filter grayscale' : '';
                commandAreaContent = `
                    <div class="grid grid-cols-2 gap-1 w-full h-full relative z-20">
                        <button onclick="executeNewBattleAction('normal_attack_click')" class="pixel-btn pixel-btn-primary py-1 px-1 text-[11px] font-bold flex flex-col items-center justify-center text-center shadow cursor-pointer ${actionDisabledClass}">
                            <span>⚔️ 通常攻撃</span>
                        </button>
                        <button onclick="executeNewBattleAction('run')" class="pixel-btn pixel-btn-danger py-1 px-1 text-[11px] font-bold flex flex-col items-center justify-center text-center shadow cursor-pointer relative z-30 pointer-events-auto">
                            <span>🏃 逃げる</span>
                        </button>
                        <button onclick="executeNewBattleAction('skill_click')" class="pixel-btn pixel-btn-success py-1 px-1 text-[11px] font-bold flex flex-col items-center justify-center text-center shadow cursor-pointer ${actionDisabledClass}">
                            <span>✨ スキル</span>
                        </button>
                        <button onclick="executeNewBattleAction('setting')" class="pixel-btn pixel-btn-warning py-1 px-1 text-[11px] font-bold flex flex-col items-center justify-center text-center shadow cursor-pointer relative z-30 pointer-events-auto">
                            <span>⚙️ 設定</span>
                        </button>
                    </div>
                `;
            }

            let skillModalHtml = '';
            if (isNewBattleSkillModalOpen) {
                const skills = [];
                p1.skills.forEach(s => {
                    if (!s.isNormalAttack) {
                        skills.push(s);
                    }
                });
                const asaiomizuAlly = (p1.id === 'asaiomizu' && p1.recordedSkill) ? p1 : null;
                if (asaiomizuAlly && asaiomizuAlly.recordedSkill) {
                    const rec = asaiomizuAlly.recordedSkill;
                    skills.unshift({
                        ...rec,
                        id: 'asaiomizu_copied',
                        originalId: rec.id,
                        name: `📋【コピー】${rec.name}`,
                        isNormalAttack: false,
                        cooldown: 0,
                        desc: `【ディグコピー技】${rec.name}（${rec.desc || '相手からコピーしたスキル'}）`
                    });
                }
                let skillsHtml = skills.map(s => {
                    const cd = p1.cooldowns[s.id] || 0;
                    const isCd = cd > 0;
                    const isDopaChargeFull = (p1.id === 'dopagaking' && (s.id === 'dopa_charge' || s.id === 'dopa_charge_skill' || s.type === 'dopa_charge_skill') && (p1.dopaChargeCount || 0) >= 6);
                    const isDopaObeyLocked = (p1.id === 'dopagaking' && (s.id === 'dopa_obey' || s.id === 'dopa_inheritance') && (p1.dopaChargeCount || 0) < 6);
                    const disabled = isCd || isDopaChargeFull || isDopaObeyLocked ||
                                     (p1.id === 'courtney' && (s.id === 'courtney_feel' || s.id === 'courtney_charge_release') && (p1.courtneyChargeCount || 0) < 1);
                    return `
                        <button onclick="${disabled ? '' : `executeNewBattleAction('${s.id}')`}" class="pixel-box bg-slate-900 border ${disabled ? 'border-slate-700 opacity-60 cursor-not-allowed' : 'border-emerald-400 hover:border-emerald-300 cursor-pointer'} p-3 text-left shadow flex flex-col justify-between w-full transition-all">
                            <div class="flex justify-between items-center w-full mb-1">
                                <span class="font-pixel text-xs sm:text-sm text-emerald-300 font-bold flex items-center gap-2">
                                    <span>✨</span>
                                    <span>${s.name}</span>
                                    ${isCd ? `<span class="text-amber-400 text-xs font-mono">(CT:${cd})</span>` : ''}
                                    ${s.id === 'pasha_roll' ? `<span class="text-sky-400 text-xs font-mono">(復活残り: ${2 - (activeNewBattle.battleData?.pashaRollReviveCount || 0)}回)</span>` : ''}
                                    ${isDopaChargeFull ? `<span class="text-amber-400 text-xs font-mono font-bold">(MAX 6/6)</span>` : ''}
                                    ${isDopaObeyLocked ? `<span class="text-slate-400 text-xs font-mono">(要6チャージ: ${p1.dopaChargeCount || 0}/6)</span>` : ''}
                                </span>
                                ${disabled && isCd ? `<span class="text-xs text-red-400 font-mono font-bold">CT:${cd}</span>` : ''}
                                ${isDopaChargeFull ? `<span class="text-xs text-amber-400 font-mono font-bold">MAX</span>` : ''}
                            </div>
                            <div class="text-[11px] sm:text-xs text-slate-200 font-mono leading-relaxed">${s.desc}</div>
                        </button>
                    `;
                }).join('');

                skillModalHtml = `
                    <div class="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fadeIn" onclick="if(event.target === this) { isNewBattleSkillModalOpen = false; renderNewBattleScreen(); }">
                        <div class="pixel-box bg-slate-900 border-emerald-400 max-w-lg w-full p-4 sm:p-6 text-center relative shadow-2xl flex flex-col max-h-[85vh]">
                            <div class="flex justify-between items-center border-b border-emerald-600/50 pb-3 mb-4">
                                <h3 class="text-base sm:text-lg font-bold text-emerald-300 font-pixel flex items-center gap-2">
                                    <span>✨</span>
                                    <span>バトルスキル一覧</span>
                                </h3>
                                <button onclick="isNewBattleSkillModalOpen = false; renderNewBattleScreen();" class="pixel-btn pixel-btn-danger px-3 py-1 text-xs font-bold">✕ 閉じる</button>
                            </div>
                            <div class="space-y-2.5 flex-1 overflow-y-auto pr-1 text-left">
                                ${skillsHtml}
                            </div>
                            <div class="mt-4 pt-2 border-t border-slate-800 flex justify-center">
                                <button onclick="isNewBattleSkillModalOpen = false; renderNewBattleScreen();" class="pixel-btn pixel-btn-warning px-6 py-2 text-xs font-bold font-pixel">
                                    ◀ もどる
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }

            let choicePopupHtml = '';
            if (activeNewBattle && (activeNewBattle.waitingForChoice || activeNewBattle.isRunModalOpen)) {
                const isRun = activeNewBattle.isRunModalOpen && !activeNewBattle.waitingForChoice;
                const livingAlliesCount = activeNewBattle.allies ? activeNewBattle.allies.filter(a => a.hp > 0).length : 1;
                const hasOtherAlly = activeNewBattle.allies 
                    ? activeNewBattle.allies.some(a => a.hp > 0 && a !== activeNewBattle.p1) 
                    : false;
                const canSwitch = hasOtherAlly || (isRun && livingAlliesCount > 0);

                const titleText = isRun ? '🏃 戦闘離脱・選択' : '⚠️ 操作キャラクター戦闘不能！';
                const bodyText = isRun 
                    ? '逃げ出しますか？ バトルをスキップして結果を見るか、残っているキャラクターで戦い続けるか選択できます。' 
                    : '現在の操作キャラクターが倒れました。<br>どう行動しますか？';

                choicePopupHtml = `
                    <div class="fixed inset-0 bg-black/85 z-[999] flex items-center justify-center p-4 animate-fadeIn">
                        <div class="pixel-box-gold bg-slate-900 border-amber-400 max-w-md w-full p-5 sm:p-6 text-center relative shadow-2xl flex flex-col items-center space-y-4">
                            <div class="text-xl sm:text-2xl font-pixel font-black text-red-500 animate-bounce">${titleText}</div>
                            <p class="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">${bodyText}</p>
                            <div class="flex flex-col gap-3 w-full mt-2">
                                <button onclick="handleNewBattleContinueChoice('skip')" class="pixel-btn pixel-btn-danger py-3 px-4 text-xs sm:text-sm font-bold font-pixel flex items-center justify-center gap-2 shadow-lg cursor-pointer">
                                    <span>🏁 結果を見る（バトルをスキップ）</span>
                                </button>
                                ${canSwitch ? `
                                <button onclick="handleNewBattleContinueChoice('switch')" class="pixel-btn pixel-btn-primary py-3 px-4 text-xs sm:text-sm font-bold font-pixel flex items-center justify-center gap-2 shadow-lg cursor-pointer">
                                    <span>🔄 残っているキャラを使用し戦い続ける</span>
                                </button>
                                ` : ''}
                                ${isRun ? `
                                <button onclick="handleNewBattleContinueChoice('cancel')" class="pixel-btn pixel-btn-warning py-2 px-4 text-xs font-bold font-pixel flex items-center justify-center gap-2 shadow-lg cursor-pointer">
                                    <span>✕ キャンセルして戻る</span>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }

            container.innerHTML = `
                <div class="w-full h-full flex flex-col justify-between bg-slate-950 text-white relative select-none pt-0 px-1 pb-0 sm:pt-0 sm:px-2 sm:pb-0 overflow-hidden">
                    ${skillModalHtml}
                    ${choicePopupHtml}
                    <!-- 背景画像 -->
                    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        <img src="images/backnormal.webp" alt="backnormal" class="w-full h-full object-cover opacity-80">
                    </div>
                    <!-- 1. 上部エリア（タイトル・行動状態・ターン・制限時間） -->
                    <div class="w-full flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-slate-900/95 rounded-lg border border-slate-700 shadow-md z-20 shrink-0">
                        <div class="flex items-center gap-1 text-[10px] sm:text-xs font-pixel text-amber-300 shrink-0">
                            <span>⚔️ 3v3</span>
                        </div>
                        <div class="flex items-center justify-center flex-1 px-1">
                            ${actorIndicator}
                        </div>
                        <div class="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono shrink-0">
                            <div class="flex items-center gap-0.5 text-sky-400">
                                <span>⏱</span>
                                <strong id="new-battle-elapsed-timer" class="font-pixel">${activeNewBattle ? formatElapsedTime(activeNewBattle.elapsedSeconds) : '00:00'}</strong>
                            </div>
                            <span class="text-slate-600">|</span>
                            <div class="flex items-center gap-0.5">
                                <span class="text-slate-400">T:</span>
                                <strong id="new-battle-turn" class="text-amber-400 font-pixel">${activeNewBattle.turn}</strong>
                            </div>
                            <span class="text-slate-600">|</span>
                            <div class="flex items-center gap-0.5">
                                <span class="text-slate-400">限:</span>
                                <strong id="new-battle-timer" class="text-emerald-400 font-pixel">${activeNewBattle.turnTimer}</strong>s
                            </div>
                        </div>
                    </div>

                    <!-- 2. 中央エリア：味方3体と敵3体の独立した3カラム隊列バトルステージ (重なり・当たり判定重複を完全に解消) -->
                    <div class="flex-1 flex items-center justify-between px-2 sm:px-6 py-2 relative z-10 overflow-visible w-full max-w-full">
                        <!-- 左側：味方チーム (3カラム分離レイアウト) -->
                        <div class="relative w-[47%] sm:w-[48%] h-full flex items-end justify-between px-1 sm:px-2 pb-2">
                            <div class="absolute left-1 top-1 text-[9px] text-emerald-400 font-pixel font-bold z-30">🛡️ 味方チーム (隊列)</div>
                             ${(() => {
                                 const currentActor = activeNewBattle.currentAttacker;
                                 const visualOrder = [
                                     { c: allies[1], origIdx: 1, posType: 'left' },
                                     { c: allies[0], origIdx: 0, posType: 'center' },
                                     { c: allies[2], origIdx: 2, posType: 'right' }
                                 ];

                                 return visualOrder.map(({ c, origIdx, posType }) => {
                                     if (!c) return '';
                                     const pct = Math.max(0, Math.min(100, Math.round((c.hp / c.maxHp) * 100)));
                                     const img = getCharImg(c, true);
                                     const isLeader = origIdx === 0;
                                     const isTargetSelecting = (newBattleViewMode === 'target_select');
                                     const isSelectable = isTargetSelecting && newBattleTargetSelectType === 'single_ally' && c.hp > 0;
                                     const cardClickAttr = isSelectable 
                                         ? `onclick="selectNewBattleTarget(${origIdx}, true)" style="cursor: pointer;"` 
                                         : `onclick="if(typeof toggleBattleCharTooltip === 'function') toggleBattleCharTooltip('ally', ${origIdx}, event)" style="cursor: pointer;"`;
                                     const isCurrentActor = currentActor === c;

                                     let posClasses = 'flex flex-col items-center justify-end relative transition-all duration-300 ';
                                     if (posType === 'center') {
                                         posClasses += 'w-[36%] h-[82%] z-30 scale-105 translate-y-3';
                                      } else {
                                          posClasses += 'w-[30%] h-[72%] z-25 opacity-95 -translate-y-6';
                                      }

                                     const interactiveStyle = isSelectable ? 'cursor-pointer ring-4 ring-amber-400 bg-amber-950/40 rounded-xl' : 'hover:brightness-110';
                                     const deadStyle = c.hp <= 0 ? 'opacity-40 grayscale' : '';
                                     const hpBarPosClass = 'absolute -top-6 left-1/2 -translate-x-1/2 w-[95%] min-w-[65px] z-40 flex flex-col items-center bg-black/85 backdrop-blur-md px-1 py-0.5 rounded border border-white/20 shadow-lg';

                                     return `
                                         <div id="ally-char-${origIdx}" ${cardClickAttr} data-char-team="ally" data-char-idx="${origIdx}" class="${posClasses} ${interactiveStyle} ${deadStyle}" title="タップして詳細を表示">
                                            ${isCurrentActor ? '<div class="absolute -top-12 left-1/2 -translate-x-1/2 text-amber-400 font-bold text-sm animate-arrow-float z-50 drop-shadow-md">▼</div>' : ''}
                                            
                                             <!-- 頭上のステータスUI -->
                                             <div class="${hpBarPosClass}">
                                                 <div class="flex justify-between items-center w-full text-[8px] sm:text-[9px] font-bold text-emerald-300 px-0.5">
                                                     <span class="truncate">${c.charName}</span>
                                                     <span class="font-mono">${c.hp}/${c.maxHp}</span>
                                                 </div>
                                                 <div class="w-full bg-slate-900 h-1 rounded-full overflow-hidden my-0.5 border border-white/20">
                                                     <div class="bg-emerald-400 h-full hp-bar-fill shadow-[0_0_4px_rgba(52,211,153,0.8)]" style="width: ${pct}%;"></div>
                                                 </div>
                                             </div>

                                            <!-- 全身スプライト -->
                                            <div id="ally-shake-${origIdx}" class="w-full flex-1 flex items-center justify-center relative drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] ${c.isShaking ? 'char-shake' : ''}">
                                               <img src="${img}" alt="${c.charName}" class="w-full h-full object-contain pointer-events-none">
                                               ${isLeader ? '<div class="absolute bottom-0 right-0 bg-emerald-600 text-white px-1 py-0.5 rounded text-[7px] font-pixel shadow">LEADER</div>' : ''}
                                               <div class="absolute bottom-1 left-1 z-30 flex flex-col gap-0.5 items-start pointer-events-none">
                                                   ${getStatusBadgesHtml(c, true)}
                                               </div>
                                           </div>
                                      </div>
                                  `;
                                 }).join('');
                            })()}
                        </div>

                        <!-- 中央：VS -->
                        <div class="w-[6%] sm:w-[4%] flex flex-col items-center justify-center text-center z-20">
                            <div class="text-amber-400 font-pixel font-black text-lg sm:text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse">VS</div>
                        </div>

                        <!-- 右側：敵チーム (3カラム分離レイアウト) -->
                        <div class="relative w-[47%] sm:w-[48%] h-full flex items-end justify-between px-1 sm:px-2 pb-2">
                            <div class="absolute right-1 top-1 text-[9px] text-red-400 font-pixel font-bold z-30 text-right">⚔️ 敵チーム</div>
                             ${(() => {
                                 const currentActor = activeNewBattle.currentAttacker;
                                 const visualOrder = [
                                     { c: enemies[2], origIdx: 2, posType: 'left' },
                                     { c: enemies[0], origIdx: 0, posType: 'center' },
                                     { c: enemies[1], origIdx: 1, posType: 'right' }
                                 ];

                                 return visualOrder.map(({ c, origIdx, posType }) => {
                                     if (!c) return '';
                                     const pct = Math.max(0, Math.min(100, Math.round((c.hp / c.maxHp) * 100)));
                                     const img = getCharImg(c, false);
                                     const isLeader = origIdx === 0;
                                     const isTargetSelecting = (newBattleViewMode === 'target_select');
                                     const isSelectable = isTargetSelecting && (newBattleTargetSelectType === 'single_enemy' || newBattleTargetSelectSkillId === 'asaiomizu_copied') && c.hp > 0;
                                     const cardClickAttr = isSelectable 
                                         ? `onclick="selectNewBattleTarget(${origIdx}, false)" style="cursor: pointer;"` 
                                         : `onclick="if(typeof toggleBattleCharTooltip === 'function') toggleBattleCharTooltip('enemy', ${origIdx}, event)" style="cursor: pointer;"`;
                                     const isCurrentActor = currentActor === c;
                                     const flipStyle = 'transform: scaleX(-1);';

                                     let posClasses = 'flex flex-col items-center justify-end relative transition-all duration-300 ';
                                     if (posType === 'center') {
                                         posClasses += 'w-[36%] h-[82%] z-30 scale-105 translate-y-3';
                                      } else {
                                          posClasses += 'w-[30%] h-[72%] z-25 opacity-95 -translate-y-6';
                                      }

                                     const interactiveStyle = isSelectable ? 'cursor-pointer ring-4 ring-amber-400 bg-amber-950/40 rounded-xl' : 'hover:brightness-110';
                                     const deadStyle = c.hp <= 0 ? 'opacity-40 grayscale' : '';
                                     const hpBarPosClass = 'absolute -top-6 left-1/2 -translate-x-1/2 w-[95%] min-w-[65px] z-40 flex flex-col items-center bg-black/85 backdrop-blur-md px-1 py-0.5 rounded border border-white/20 shadow-lg';

                                     return `
                                         <div id="enemy-char-${origIdx}" ${cardClickAttr} data-char-team="enemy" data-char-idx="${origIdx}" class="${posClasses} ${interactiveStyle} ${deadStyle}" title="タップして詳細を表示">
                                           ${isCurrentActor ? '<div class="absolute -top-12 left-1/2 -translate-x-1/2 text-amber-400 font-bold text-sm animate-arrow-float z-50 drop-shadow-md">▼</div>' : ''}
                                           
                                             <!-- 頭上のステータスUI -->
                                             <div class="${hpBarPosClass}">
                                                 <div class="flex justify-between items-center w-full text-[8px] sm:text-[9px] font-bold text-red-300 px-0.5">
                                                     <span class="truncate">${c.charName}</span>
                                                     <span class="font-mono">${c.hp}/${c.maxHp}</span>
                                                 </div>
                                                 <div class="w-full bg-slate-900 h-1 rounded-full overflow-hidden my-0.5 border border-white/20">
                                                     <div class="bg-red-500 h-full hp-bar-fill shadow-[0_0_4px_rgba(239,68,68,0.8)]" style="width: ${pct}%;"></div>
                                                 </div>
                                             </div>

                                           <!-- 全身スプライト -->
                                           <div id="enemy-shake-${origIdx}" class="w-full flex-1 flex items-center justify-center relative drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] ${c.isShaking ? 'char-shake' : ''}">
                                               <img src="${img}" alt="${c.charName}" class="w-full h-full object-contain" style="${flipStyle}">
                                               ${isLeader ? '<div class="absolute bottom-0 left-0 bg-red-600 text-white px-1 py-0.5 rounded text-[7px] font-pixel shadow">BOSS</div>' : ''}
                                               <div class="absolute bottom-1 left-1 z-30 flex flex-col gap-0.5 items-start pointer-events-none">
                                                   ${getStatusBadgesHtml(c, false)}
                                               </div>
                                           </div>
                                      </div>
                                  `;
                                 }).join('');
                            })()}
                        </div>
                    </div>

                    <!-- 3. 画面下部エリア：プロフィール・ログ・コマンド操作枠 -->
                    <div class="w-full grid grid-cols-1 sm:grid-cols-12 gap-1.5 h-20 sm:h-24 shrink-0 z-10">
                        <div class="sm:col-span-3 bg-slate-900/95 border-2 border-slate-700 rounded-lg p-1.5 flex items-center gap-2 shadow-md h-full overflow-hidden relative backdrop-blur-sm">
                            <canvas id="new-battle-profile-icon" width="40" height="40" class="pixel-box bg-slate-950 rounded shrink-0 w-9 h-9 sm:w-10 sm:h-10 border border-amber-500/50 shadow-inner object-contain"></canvas>
                            <div class="flex flex-col justify-between overflow-hidden flex-1 min-w-0 h-full py-0.5">
                                <div class="text-[11px] sm:text-xs font-bold text-amber-300 font-pixel truncate drop-shadow-sm" title="${playerState.playerName || '名無しファイター'}">
                                    ${playerState.playerName || '名無しファイター'}
                                </div>
                                <div class="flex items-center justify-between gap-1 w-full border-t border-slate-800/80 pt-1 mt-auto">
                                    <div class="text-[9px] sm:text-[10px] text-slate-300 font-mono truncate flex items-center gap-1">
                                        <span class="text-amber-400 font-bold">DOPA</span>
                                        <span class="text-amber-300 font-bold font-pixel">${formatDopa(playerState.dopa)}</span>
                                    </div>
                                    <div id="battle-battery-status" class="shrink-0 bg-slate-950/80 border border-slate-800 px-1 py-0.5 rounded flex items-center justify-center">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="sm:col-span-5 bg-slate-900/95 border-2 border-slate-700 rounded-lg p-1.5 flex flex-col h-full shadow-md overflow-hidden">
                            <div class="text-[9px] text-amber-400 font-bold font-pixel mb-0.5 shrink-0">📜 BATTLE LOG</div>
                            <div class="w-full flex-1 bg-slate-950 border border-slate-800 rounded p-1 text-[9px] sm:text-[10px] font-mono text-slate-200 overflow-y-auto shadow-inner" id="new-battle-log">
                                ${(activeNewBattle.battleLogs && activeNewBattle.battleLogs.length > 0) ? activeNewBattle.battleLogs.map(l => renderLogItem(l)).join('') : "3v3バトルモードが開始しました！コマンドを選択してください。"}
                            </div>
                        </div>

                        <div class="sm:col-span-4 bg-slate-900/95 border-2 border-slate-700 rounded-lg p-1.5 flex flex-col justify-center h-full shadow-md relative overflow-hidden">
                            ${commandAreaContent}
                        </div>
                    </div>
                </div>
            `;

            const profileIconCvs = document.getElementById('new-battle-profile-icon');
            if (profileIconCvs) {
                CharacterRenderer.drawCharacter(profileIconCvs, playerState.selectedIcon || 'dopagaking');
            }

            if (typeof initBatteryManager === 'function') {
                initBatteryManager();
            }

            const logEl = document.getElementById('new-battle-log');
            if (logEl) {
                logEl.scrollTop = logEl.scrollHeight;
            }
        }

        function getStatusBadgesHtml(p, isAlly = true) {
            let badges = '';
            if (p.buffAtk && p.buffAtk !== 1.0) {
                if (p.buffAtk > 1.0) {
                    badges += `<span class="bg-emerald-950/95 text-emerald-300 border-2 border-emerald-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform -rotate-3 inline-block">攻撃UP [${p.buffAtkTurns || 1}T]</span>`;
                } else {
                    badges += `<span class="bg-red-950/95 text-red-300 border-2 border-red-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform -rotate-3 inline-block">攻撃DOWN [${p.buffAtkTurns || 1}T]</span>`;
                }
            }
            if (p.buffDef && p.buffDef !== 1.0) {
                if (p.buffDef > 1.0) {
                    badges += `<span class="bg-emerald-950/95 text-emerald-300 border-2 border-emerald-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform rotate-2 inline-block">防御UP</span>`;
                } else {
                    badges += `<span class="bg-red-950/95 text-red-300 border-2 border-red-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform rotate-2 inline-block">防御DOWN</span>`;
                }
            }
            if (p.darknessPowerTurns && p.darknessPowerTurns > 0) {
                badges += `<span class="bg-purple-950/95 text-purple-300 border-2 border-purple-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform rotate-2 inline-block">暗黒パワー [${p.darknessPowerTurns}T]</span>`;
            }
            if (p.defendBuffTurns && p.defendBuffTurns > 0) {
                badges += `<span class="bg-amber-950/95 text-amber-300 border-2 border-amber-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform -rotate-2 inline-block">鉄壁 [${p.defendBuffTurns}T]</span>`;
            }
            if (p.yoseruZeroDefTurns && p.yoseruZeroDefTurns > 0) {
                badges += `<span class="bg-red-950/95 text-red-300 border-2 border-red-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform rotate-2 inline-block">防御0 [${p.yoseruZeroDefTurns}T]</span>`;
            }
            if (p.critBuffTurns && p.critBuffTurns > 0) {
                badges += `<span class="bg-emerald-950/95 text-emerald-300 border-2 border-emerald-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform rotate-3 inline-block">会+ [${p.critBuffTurns}T]</span>`;
            }
            if (p.asaiomizuCritTurns && p.asaiomizuCritTurns > 0) {
                badges += `<span class="bg-emerald-950/95 text-emerald-300 border-2 border-emerald-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform rotate-3 inline-block">会+ [${p.asaiomizuCritTurns}T]</span>`;
            }
            if (p.tempEvadeNext) {
                badges += `<span class="bg-cyan-950/95 text-cyan-300 border-2 border-cyan-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform -rotate-4 inline-block">完全回避</span>`;
            }
            if (p.digActive && isAlly) {
                badges += `<span class="bg-cyan-950/95 text-cyan-300 border-2 border-cyan-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform -rotate-3 inline-block">ディグ中</span>`;
            }
            if (p.isResting) {
                badges += `<span class="bg-slate-800/95 text-slate-300 border-2 border-slate-500 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform rotate-1 inline-block">休み</span>`;
            }
            if (p.stunTurns && p.stunTurns > 0) {
                badges += `<span class="bg-red-950/95 text-red-300 border-2 border-red-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform -rotate-2 inline-block">行動不能 [${p.stunTurns}T]</span>`;
            }
            if (p.eggplantReady) {
                badges += `<span class="bg-purple-950/95 text-purple-300 border-2 border-purple-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform -rotate-3 inline-block">ゾウ変身</span>`;
            }
            if (p.courtneyChargeCount && p.courtneyChargeCount > 0) {
                if (p.courtneyChargeCount >= 8) {
                    badges += `<span class="bg-pink-600 text-white border-2 border-pink-300 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-pixel font-bold shadow-lg animate-bounce inline-block">🔥 MAXチャージ(8/8)</span>`;
                } else {
                    badges += `<span class="bg-pink-900/95 text-pink-200 border-2 border-pink-400 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-pixel font-bold shadow-lg animate-pulse inline-block">💖 チャージ(${p.courtneyChargeCount}/8)</span>`;
                }
            }
            if (p.pashaPassiveActive) {
                badges += `<span class="bg-yellow-950/95 text-yellow-300 border border-yellow-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md inline-block">特効[会心+10%]</span>`;
            }
            if (p.isDarkMode) {
                badges += `<span class="bg-purple-950/95 text-purple-300 border-2 border-purple-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform rotate-1 inline-block">🌙 ダークモード(ATK+15%)</span>`;
            }
            if (p.pashaDarkEvaBonus && p.pashaDarkEvaBonus > 0) {
                badges += `<span class="bg-purple-950/95 text-purple-300 border-2 border-purple-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform rotate-1 inline-block">闇の回避強化 [避+${p.pashaDarkEvaBonus}% / 最大+50%]</span>`;
            }
            if (p.dopaChargeCount && p.dopaChargeCount > 0) {
                if (p.dopaChargeCount >= 6) {
                    badges += `<span class="bg-amber-600 text-white border-2 border-amber-300 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-pixel font-bold shadow-lg animate-bounce inline-block">👑 MAXチャージ(6/6)</span>`;
                } else {
                    badges += `<span class="bg-amber-950/95 text-amber-300 border-2 border-amber-400 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-pixel font-bold shadow-md transform -rotate-2 inline-block">チャージ(${p.dopaChargeCount}/6)</span>`;
                }
            }
            if (p.iwabaBathTurns && p.iwabaBathTurns > 0) {
                badges += `<span class="bg-amber-950/95 text-amber-300 border border-amber-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md inline-block">岩盤浴[${p.iwabaBathTurns}T]</span>`;
            }
            if (p.momoEvaTurns && p.momoEvaTurns > 0) {
                badges += `<span class="bg-emerald-950/95 text-emerald-300 border-2 border-emerald-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform -rotate-2 inline-block">回避UP [${p.momoEvaTurns}T]</span>`;
            }
            if (p.enemyEvaTurns && p.enemyEvaTurns > 0 && p.evaDebuff && p.evaDebuff > 0) {
                badges += `<span class="bg-red-950/95 text-red-300 border-2 border-red-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform rotate-2 inline-block">回避DOWN [${p.enemyEvaTurns}T]</span>`;
            }
            return badges;
        }
        window.getStatusBadgesHtml = getStatusBadgesHtml;

        function renderLogItem(l) {
            let bgStyle = 'bg-slate-900/80 border border-slate-700/80 text-amber-300 text-center font-bold';
            if (l.teamType === 'ally') {
                bgStyle = 'bg-emerald-950/60 border-l-4 border-emerald-500 text-emerald-100';
            } else if (l.teamType === 'enemy') {
                bgStyle = 'bg-red-950/60 border-l-4 border-red-500 text-red-100';
            }
            return `<div class="p-1 mb-1 rounded text-[10px] sm:text-[11px] font-mono ${bgStyle} shadow-sm ${l.colorClass || ''}">${l.msg}</div>`;
        }

        function appendNewBattleLog(text, colorClass = 'text-slate-200', teamType = 'system') {
            if (!activeNewBattle) return;
            const logEl = document.getElementById('new-battle-log');
            if (logEl) {
                let bgStyle = 'bg-slate-900/80 border border-slate-700/80 text-amber-300 text-center font-bold';
                if (teamType === 'ally') {
                    bgStyle = 'bg-emerald-950/60 border-l-4 border-emerald-500 text-emerald-100';
                } else if (teamType === 'enemy') {
                    bgStyle = 'bg-red-950/60 border-l-4 border-red-500 text-red-100';
                }
                const line = document.createElement('div');
                line.className = `p-1 mb-1 rounded text-[10px] sm:text-[11px] font-mono ${bgStyle} shadow-sm ${colorClass}`;
                line.innerHTML = text;
                logEl.appendChild(line);
                logEl.scrollTop = logEl.scrollHeight;
            }
        }

        function executeNewBattleAction(actionType) {
            if (actionType === 'setting') {
                openNewBattleSettingsPanel();
                return;
            }
            if (actionType === 'run') {
                audioSystem.playSelect();
                if (!activeNewBattle || activeNewBattle.battleEnded) return;
                activeNewBattle.isRunModalOpen = true;
                renderNewBattleScreen();
                return;
            }
            if (!activeNewBattle || activeNewBattle.battleEnded || activeNewBattle.isProcessing || activeNewBattle.p1Action !== null || activeNewBattle.waitingForOpponent || activeNewBattle.p1.isResting) return;
            audioSystem.playSelect();

            if (actionType === 'normal_attack_click') {
                newBattleViewMode = 'attack_select';
                isNewBattleSkillModalOpen = false;
                renderNewBattleScreen();
                return;
            }
            if (actionType === 'skill_click') {
                isNewBattleSkillModalOpen = true;
                renderNewBattleScreen();
                return;
            }
            if (actionType === 'back_to_main') {
                newBattleViewMode = 'main';
                isNewBattleSkillModalOpen = false;
                renderNewBattleScreen();
                return;
            }
            if (actionType === 'setting') {
                openNewBattleSettingsPanel();
                return;
            }

            isNewBattleSkillModalOpen = false;

            if (activeNewBattle && activeNewBattle.p1 && activeNewBattle.p1.id === 'dopagaking') {
                if ((actionType === 'dopa_charge' || actionType === 'dopa_charge_skill') && (activeNewBattle.p1.dopaChargeCount || 0) >= 6) {
                    showModal("MAXチャージ", "チャージは最大（6回）に達しています！「王に従え」を発動してください！");
                    return;
                }
            }

            if (actionType === 'dopa_obey' || actionType === 'dopa_obey_skill') {
                if ((activeNewBattle.p1.dopaChargeCount || 0) < 6) {
                    showModal("チャージ不足", "「王に従え」は6チャージ時にのみ発動可能です！");
                    return;
                }
                let obeyTarget = activeNewBattle.p1.selectedObeyEnemy;
                if (!obeyTarget) {
                    const allOtherIds = Object.keys(CHARACTER_DATA).filter(id => id !== 'dopagaking');
                    const randomId = allOtherIds[Math.floor(Math.random() * allOtherIds.length)];
                    obeyTarget = activeNewBattle.createBattlePlayer(randomId, CHARACTER_DATA[randomId].name, 2);
                    activeNewBattle.p1.selectedObeyEnemy = obeyTarget;
                    activeNewBattle.p1.selectedInheritChar = obeyTarget.id;
                }
                openDopaObeyModal(activeNewBattle.p1, obeyTarget);
                return;
            }

            let skill = null;
            const recordedRec = (activeNewBattle.p1 && activeNewBattle.p1.id === 'asaiomizu' && activeNewBattle.p1.recordedSkill) ? activeNewBattle.p1.recordedSkill : null;
            if (actionType === 'asaiomizu_copied' && recordedRec) {
                const rec = recordedRec;
                skill = {
                    ...rec,
                    id: 'asaiomizu_copied',
                    originalId: rec.id,
                    name: `📋【コピー】${rec.name}`,
                    isNormalAttack: false,
                    cooldown: 0
                };
            } else if (actionType === 'dopa_obey_copy' && window.newBattleTargetSelectCopiedSkill) {
                skill = window.newBattleTargetSelectCopiedSkill;
            } else {
                skill = activeNewBattle.p1.skills.find(s => s.id === actionType) || (actionType === activeNewBattle.p1.skills.find(s => s.isNormalAttack)?.id ? activeNewBattle.p1.skills.find(s => s.isNormalAttack) : null);
            }
            if (activeNewBattle.isNewBattle && skill && (skill.targetType === 'single_enemy' || skill.targetType === 'single_ally' || skill.id === 'pasha_flash' || actionType === 'asaiomizu_copied' || actionType === 'dopa_obey_copy' || (!['self', 'all_enemies', 'all_allies'].includes(skill.targetType) && skill.type !== 'heal' && skill.type !== 'buff'))) {
                newBattleTargetSelectSkillId = actionType;
                newBattleTargetSelectType = skill.targetType === 'single_ally' ? 'single_ally' : 'single_enemy';
                newBattleViewMode = 'target_select';
                renderNewBattleScreen();
                return;
            }

            newBattleViewMode = 'main';
            activeNewBattle.submitAction(1, actionType);
            renderNewBattleScreen();
        }

        function updateNewBattleUIValues() {
            if (!activeNewBattle) return;
            const p1 = activeNewBattle.p1;
            const p2 = activeNewBattle.p2;

            const pPercent = Math.max(0, Math.min(100, Math.round((p1.hp / p1.maxHp) * 100)));
            const ePercent = Math.max(0, Math.min(100, Math.round((p2.hp / p2.maxHp) * 100)));

            const pHpEl = document.getElementById('new-player-hp');
            const eHpEl = document.getElementById('new-enemy-hp');
            const pBarEl = document.getElementById('new-player-hp-bar');
            const eBarEl = document.getElementById('new-enemy-hp-bar');
            const turnEl = document.getElementById('new-battle-turn');
            const pMaxHpEl = document.getElementById('new-player-maxhp');
            const eMaxHpEl = document.getElementById('new-enemy-maxhp');

            if (pHpEl) pHpEl.innerText = p1.hp;
            if (eHpEl) eHpEl.innerText = p2.hp;
            if (pMaxHpEl) pMaxHpEl.innerText = p1.maxHp;
            if (eMaxHpEl) eMaxHpEl.innerText = p2.maxHp;
            if (pBarEl) pBarEl.style.width = pPercent + '%';
            if (eBarEl) eBarEl.style.width = ePercent + '%';
            if (turnEl) turnEl.innerText = activeNewBattle.turn;
        }

        function openNewBattleSettingsPanel() {
            audioSystem.playSelect();
            const backdrop = document.getElementById('settings-backdrop');
            const panel = document.getElementById('settings-slide-panel');
            const body = document.getElementById('settings-panel-body');

            if (body) {
                const volVal = Math.round((audioSystem.volume !== undefined ? audioSystem.volume : 0.5) * 100);
                body.innerHTML = `
                    <div class="space-y-2 text-left py-1 text-xs">
                        <div class="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5">
                            <div class="flex justify-between items-center">
                                <span class="text-slate-300 font-bold">音量調節:</span>
                                <span id="volume-val-label" class="text-amber-400 font-mono font-bold">${volVal}%</span>
                            </div>
                            <input type="range" min="0" max="100" value="${volVal}" oninput="onVolumeSliderChange(this.value)" class="w-full accent-amber-400 cursor-pointer">
                        </div>

                        <div class="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-800">
                            <span class="text-slate-300 font-bold">BGM:</span>
                            <button onclick="audioSystem.toggleBGM(); openNewBattleSettingsPanel();" class="pixel-btn text-xs px-3 py-1 font-bold">
                                ${audioSystem.bgmEnabled ? '🎵 ON' : '🔇 OFF'}
                            </button>
                        </div>

                        <div class="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-800">
                            <span class="text-slate-300 font-bold">効果音（SE）:</span>
                            <button onclick="audioSystem.toggleSound(); openNewBattleSettingsPanel();" class="pixel-btn text-xs px-3 py-1 font-bold">
                                ${audioSystem.enabled ? '🔊 ON' : '🔇 OFF'}
                            </button>
                        </div>
                    </div>
                `;
            }

            if (backdrop) backdrop.classList.remove('hidden');
            if (panel) panel.classList.remove('translate-x-full');
        }

        function handleOnlineBattleClick() {
            audioSystem.playSelect();
            showModal("🌐 オンラインで戦う", "オンライン対戦モードは現在準備中です。\n今後のアップデートをお楽しみに！");
        }

        function openStoreModal() {
            audioSystem.playSelect();
            showModal("🛒 ストア", "DOPAストア機能は現在準備中です。\nガチャや毎日のボーナスでDOPAを集めてお待ちください！");
        }

        function openFriendModal() {
            audioSystem.playSelect();
            showModal("👥 フレンド", "フレンド・ランキング機能は現在準備中です。\n今後のアップデートをお楽しみに！");
        }

        function forceReloadApp() {
            audioSystem.playSelect();
            // セーブデータ（localStorage）は絶対に削除・リセットせず、キャッシュを無視して最新のWebファイルを強制再読み込みする
            window.location.reload(true);
        }

        function openSettingsModal() {
            openSettingsPanel();
        }

        function openSettingsPanel() {
            audioSystem.playSelect();
            const backdrop = document.getElementById('settings-backdrop');
            const panel = document.getElementById('settings-slide-panel');
            const body = document.getElementById('settings-panel-body');

            if (body) {
                const volVal = Math.round((audioSystem.volume !== undefined ? audioSystem.volume : 0.5) * 100);
                body.innerHTML = `
                    <div class="space-y-1.5 text-left py-1 text-xs">
                        <div class="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                            <div class="flex justify-between items-center">
                                <span class="text-slate-300 font-bold">音量調節 (つまみ):</span>
                                <span id="volume-val-label" class="text-amber-400 font-mono font-bold">${volVal}%</span>
                            </div>
                            <input type="range" min="0" max="100" value="${volVal}" oninput="onVolumeSliderChange(this.value)" class="w-full accent-amber-400 cursor-pointer">
                        </div>

                        <div class="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                            <span class="text-slate-300 font-bold">BGM:</span>
                            <button onclick="audioSystem.toggleBGM(); openSettingsPanel();" class="pixel-btn text-xs px-3 py-1 font-bold">
                                ${audioSystem.bgmEnabled ? '🎵 ON' : '🔇 OFF'}
                            </button>
                        </div>

                        <div class="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                            <span class="text-slate-300 font-bold">効果音（SE）:</span>
                            <button onclick="audioSystem.toggleSound(); openSettingsPanel();" class="pixel-btn text-xs px-3 py-1 font-bold">
                                ${audioSystem.enabled ? '🔊 ON' : '🔇 OFF'}
                            </button>
                        </div>

                        <div class="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                            <span class="text-slate-300 font-bold">再ログイン (データ復元):</span>
                            <button onclick="openReloginModal()" class="pixel-btn pixel-btn-primary text-xs px-3 py-1 font-bold">
                                🔑 再ログイン
                            </button>
                        </div>

                        <div class="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                            <span class="text-slate-300 font-bold">オープニング:</span>
                            <button onclick="playOpeningAgain()" class="pixel-btn pixel-btn-primary text-xs px-3 py-1 font-bold">
                                🎬 もう一度見る
                            </button>
                        </div>

                        <div class="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                            <span class="text-slate-300 font-bold">オープニング再生停止:</span>
                            <button onclick="toggleSkipOpening()" class="pixel-btn text-xs px-3 py-1 font-bold">
                                ${playerState.skipOpening ? 'ON' : 'OFF'}
                            </button>
                        </div>

                        <div class="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                            <span class="text-slate-300 font-bold">アプリ更新 (リロード):</span>
                            <button onclick="forceReloadApp()" class="pixel-btn pixel-btn-warning text-xs px-3 py-1 font-bold">
                                🔄 最新版に更新
                            </button>
                        </div>

                        <div class="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                            <span class="text-slate-300 font-bold">データ初期化:</span>
                            <button onclick="confirmResetPlayerProfile()" class="pixel-btn pixel-btn-danger text-xs px-3 py-1 font-bold">
                                🗑️ データを初期化
                            </button>
                        </div>

                        <div class="flex justify-between items-center bg-slate-950 p-2 rounded border border-amber-600/70">
                            <span class="text-amber-300 font-bold">管理者ページ:</span>
                            <button onclick="openAdminPasswordModal()" class="pixel-btn pixel-btn-warning text-xs px-3 py-1 font-bold">
                                🔒 管理者パネル
                            </button>
                        </div>
                    </div>
                `;
            }

            if (backdrop) backdrop.classList.remove('hidden');
            if (panel) panel.classList.remove('translate-x-full');
            document.body.classList.add('modal-open');
        }

        function closeSettingsPanel() {
            audioSystem.playSelect();
            const backdrop = document.getElementById('settings-backdrop');
            const panel = document.getElementById('settings-slide-panel');
            if (panel) panel.classList.add('translate-x-full');
            if (backdrop) backdrop.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }

        window.onVolumeSliderChange = function(val) {
            const num = parseInt(val, 10);
            audioSystem.volume = num / 100;
            playerState.volume = audioSystem.volume;
            const label = document.getElementById('volume-val-label');
            if (label) label.innerText = num + '%';
            savePlayerState();
        };

        window.addEventListener('DOMContentLoaded', async () => {
            window.addEventListener('resize', () => {
                const app = document.getElementById('app');
                if (app) {
                    app.style.height = window.innerHeight + 'px';
                }
            });
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    window.scrollTo(0, 0);
                    window.dispatchEvent(new Event('resize'));
                }, 300);
            });

            // 全キャラクターの画像・専用画像を事前プリロード
            Object.values(CHARACTER_DATA).forEach(c => {
                if (c.image) CharacterRenderer.getImage(c.image);
                if (c.chargedImage) CharacterRenderer.getImage(c.chargedImage);
            });
            Object.values(EXTRA_ICONS).forEach(item => {
                if (item.image) CharacterRenderer.getImage(item.image);
            });

            await loadPlayerState();
            if (playerState.skipOpening && !playerState.isFirstTime) {
                renderOpeningScreen(5);
            } else {
                renderOpeningScreen(1);
            }
        });

        function openProfileScreen() {
            audioSystem.playSelect();
            const container = document.getElementById('screen-container');
            if (!container) return;
            
            const winRate = playerState.totalBattles > 0 ? ((playerState.wins / playerState.totalBattles) * 100).toFixed(1) : 0;
            
            let usageHtml = '';
            const totalChoices = Object.values(playerState.charUsage).reduce((a, b) => a + b, 0);
            if (totalChoices === 0) {
                usageHtml = `<p class="text-slate-400 text-xs text-center py-6">使用記録はありません</p>`;
            } else {
                usageHtml = `<div class="space-y-2 pr-1">`;
                Object.entries(playerState.charUsage).sort((a, b) => b[1] - a[1]).forEach(([cId, count]) => {
                    const cData = CHARACTER_DATA[cId] || { name: cId };
                    const rate = ((count / totalChoices) * 100).toFixed(1);
                    usageHtml += `
                        <div class="pixel-box p-3 bg-slate-950 flex items-center justify-between text-xs">
                            <div class="flex items-center gap-3">
                                <canvas id="usage-cvs-${cId}" width="48" height="48" class="pixel-box bg-slate-900 rounded shrink-0"></canvas>
                                <div>
                                    <b class="text-amber-300 text-sm font-bold">${cData.name}</b>
                                    <div class="text-[11px] text-slate-400 font-mono">使用回数: ${count}回</div>
                                </div>
                            </div>
                            <div class="text-right font-mono">
                                <div class="text-emerald-400 font-bold text-sm">${rate}%</div>
                                <div class="w-20 bg-slate-950 rounded-full h-1.5 mt-1 border border-slate-800 overflow-hidden">
                                    <div class="bg-emerald-500 h-full rounded-full" style="width: ${rate}%"></div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                usageHtml += `</div>`;
            }

            let historyHtml = '';
            if (playerState.battleHistory.length === 0) {
                historyHtml = `<p class="text-slate-400 text-xs text-center py-4">対戦記録はありません</p>`;
            } else {
                historyHtml = `<div class="space-y-2 pr-1">`;
                playerState.battleHistory.forEach((h, idx) => {
                    let resultBadge = h.result === 'win' ? '<span class="text-emerald-400 font-bold">勝利</span>' : (h.result === 'lose' ? '<span class="text-red-400 font-bold">敗北</span>' : '<span class="text-yellow-400 font-bold">引き分け</span>');
                    let opponentDisplay = h.isBot ? `<span class="text-purple-300">[BOT] ${h.opponentName}</span>` : `<button onclick="openOpponentProfileModal(${idx})" class="text-cyan-300 underline font-bold hover:text-cyan-200">[対戦相手] ${h.opponentName}</button>`;
                    
                    historyHtml += `
                        <div class="pixel-box p-2.5 bg-slate-950 flex items-center justify-between text-xs">
                            <div class="space-y-0.5">
                                <div class="flex items-center gap-2">
                                    ${resultBadge}
                                    <span class="text-slate-400 text-[10px]">${h.date}</span>
                                </div>
                                <div class="text-slate-200">
                                    使用: <b class="text-amber-300">${(CHARACTER_DATA[h.myChar] || {}).name || h.myChar}</b> VS ${opponentDisplay}
                                </div>
                            </div>
                        </div>
                    `;
                });
                historyHtml += `</div>`;
            }

            const showUsage = window._profileShowUsage || false;

            container.innerHTML = `
                <div class="flex flex-col items-center justify-start w-full max-w-6xl mx-auto py-2 px-2 space-y-2 h-full overflow-hidden">
                    <div class="flex justify-between items-center w-full px-1 flex-shrink-0">
                        <h2 class="text-base sm:text-lg font-bold text-amber-300 font-pixel">👑 プレイヤープロフィール</h2>
                        <button onclick="renderHomeScreen()" class="pixel-btn px-4 py-1 text-xs font-bold">ホームに戻る</button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 w-full flex-1 min-h-0 items-stretch">
                        <!-- 左側エリア：プロフィール・勝利数等 ＆ 切り替えボタン -->
                        <div class="flex flex-col space-y-2.5 overflow-y-auto max-h-full pr-1">
                            <div class="pixel-box-gold p-4 bg-amber-950/80 w-full space-y-3">
                                <div class="flex items-center gap-4 w-full">
                                    <div class="flex flex-col items-center gap-1.5 shrink-0">
                                        <canvas id="profile-main-icon" width="80" height="80" class="pixel-box bg-slate-950 rounded cursor-pointer border-2 border-amber-400 w-20 h-20 shadow-lg" onclick="openIconSelectModal()" title="クリックしてアイコン変更"></canvas>
                                        <button onclick="openIconSelectModal()" class="pixel-btn pixel-btn-primary px-3 py-1 text-[10px] font-bold">変更</button>
                                    </div>
                                    <div class="flex flex-col justify-center space-y-1.5 text-left flex-1 min-w-0">
                                        <div class="flex items-center gap-1.5 flex-wrap">
                                            <input id="profile-name-input" type="text" value="${playerState.playerName || ''}" maxlength="12" class="pixel-box bg-slate-950 px-2.5 py-1 text-sm font-bold text-amber-300 w-32 sm:w-40 outline-none border-amber-600">
                                            <button onclick="savePlayerName()" class="pixel-btn pixel-btn-primary px-2.5 py-1 text-xs font-bold shrink-0">保存</button>
                                        </div>
                                         <div class="flex items-center gap-2 flex-wrap">
                                             <span class="text-xs text-slate-300 font-mono">ID: <span id="profile-player-id-text">${playerState.playerId || 'DP-1004'}</span></span>
                                             <button onclick="copyPlayerId('${playerState.playerId || 'DP-1004'}')" class="pixel-btn pixel-btn-primary px-2 py-0.5 text-[10px] font-bold">📋 コピー</button>
                                         </div>
                                    </div>
                                </div>

                                <div class="flex flex-col justify-center space-y-2 w-full font-mono text-xs border-t border-amber-800/60 pt-3">
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs text-slate-300">始めた日: <b class="text-amber-300">${playerState.startDate || '2026/10/14'}</b></span>
                                        <span class="text-xs text-amber-200">DOPA: <b class="text-amber-400 font-pixel">${formatDopa(playerState.dopa)}</b></span>
                                    </div>
                                    <div class="grid grid-cols-4 gap-2 text-center text-xs">
                                        <div class="bg-slate-950 px-1 py-1.5 rounded border border-amber-800/50">
                                            <div class="text-slate-400 text-[10px]">総対戦</div>
                                            <div class="text-amber-300 font-bold text-sm">${playerState.totalBattles}</div>
                                        </div>
                                        <div class="bg-slate-950 px-1 py-1.5 rounded border border-amber-800/50">
                                            <div class="text-slate-400 text-[10px]">勝利</div>
                                            <div class="text-emerald-400 font-bold text-sm">${playerState.wins}</div>
                                        </div>
                                        <div class="bg-slate-950 px-1 py-1.5 rounded border border-amber-800/50">
                                            <div class="text-slate-400 text-[10px]">敗北</div>
                                            <div class="text-red-400 font-bold text-sm">${playerState.losses}</div>
                                        </div>
                                        <div class="bg-slate-950 px-1 py-1.5 rounded border border-amber-800/50">
                                            <div class="text-slate-400 text-[10px]">勝率</div>
                                            <div class="text-cyan-400 font-bold text-sm">${winRate}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- キャラクター使用率 / 過去の戦績 切り替えボタン -->
                            <div class="w-full grid grid-cols-2 gap-2">
                                <button onclick="setProfileTab('history')" class="pixel-btn ${!showUsage ? 'pixel-btn-primary border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'} py-2 text-xs font-bold flex items-center justify-center gap-1.5">
                                    <span>📜 過去の戦績</span>
                                </button>
                                <button onclick="setProfileTab('usage')" class="pixel-btn ${showUsage ? 'pixel-btn-warning border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'} py-2 text-xs font-bold flex items-center justify-center gap-1.5">
                                    <span>📊 キャラ使用率</span>
                                </button>
                            </div>

                            <div class="pt-2">
                                <button onclick="confirmResetPlayerProfile()" class="pixel-btn pixel-btn-danger px-4 py-1.5 text-xs font-bold w-full">⚠️ データ初期化</button>
                            </div>
                        </div>

                        <!-- 右側エリア：切り替え表示 (戦績 ⇔ キャラクター使用率) とスクロール対応 -->
                        <div class="pixel-box p-3 bg-slate-900 w-full flex flex-col h-full max-h-[calc(100vh-100px)] md:max-h-full">
                            <h3 class="text-xs font-bold text-amber-300 font-pixel mb-2 flex-shrink-0">${showUsage ? '📊 キャラクター使用率' : '📜 過去の戦歴 (最大50件)'}</h3>
                            <div class="flex-1 min-h-0 overflow-y-auto pr-1">
                                ${showUsage ? usageHtml : historyHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const mainIconCvs = document.getElementById('profile-main-icon');
            if (mainIconCvs) CharacterRenderer.drawCharacter(mainIconCvs, playerState.selectedIcon || 'courtney');

            if (showUsage) {
                Object.keys(playerState.charUsage).forEach(cId => {
                    const uCvs = document.getElementById(`usage-cvs-${cId}`);
                    if (uCvs) CharacterRenderer.drawCharacter(uCvs, cId);
                });
            }
        }

        window.toggleProfileUsage = function() {
            audioSystem.playSelect();
            window._profileShowUsage = !window._profileShowUsage;
            openProfileScreen();
        };

        window.setProfileTab = function(tabName) {
            audioSystem.playSelect();
            window._profileShowUsage = (tabName === 'usage');
            openProfileScreen();
        };

        function confirmResetPlayerProfile() {
            audioSystem.playSelect();
            showConfirmModal("データ初期化の確認", "本当にすべてのデータを初期化しますか？（※元に戻せません）", () => {
                executeResetPlayerProfile();
            }, "初期化する");
        }

        async function executeResetPlayerProfile() {
            audioSystem.playSelect();
            playerState = {
                dopa: 1000,
                unlockedChars: [],
                unlockedIcons: ['dopagaking'],
                selectedPlayerChar: null,
                selectedEnemyChar: 'pasha',
                playerName: '名無しファイター',
                selectedIcon: 'dopagaking',
                isFirstTime: true,
                totalBattles: 0,
                wins: 0,
                losses: 0,
                charUsage: {},
                battleHistory: []
            };

            try {
                localStorage.removeItem('dopa_player_state');
            } catch(e){}

            await savePlayerState();
            updateHeaderProfile();
            showModal("初期化完了", "データを初期状態にリセットしました。");
            setTimeout(() => {
                closeModal();
                renderOpeningScreen();
            }, 1500);
        }

        function openAdminPasswordModal() {
            audioSystem.playSelect();
            closeSettingsPanel();
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const overlay = document.getElementById('modal-overlay');
            const actionsEl = document.getElementById('modal-actions');
            if (titleEl) titleEl.innerText = "🔒 管理者認証";
            if (bodyEl) {
                bodyEl.innerHTML = `
                    <div class="space-y-3 py-2 text-center">
                        <p class="text-xs text-amber-300">管理者パスワードを入力してください。</p>
                        <input type="password" id="admin-password-input" placeholder="パスワード (1234)" class="pixel-box bg-slate-950 px-3 py-2 text-center text-amber-400 text-sm font-mono w-full max-w-xs mx-auto outline-none border-amber-600">
                        <div id="admin-pass-error" class="text-red-400 text-xs font-mono hidden">パスワードが違います</div>
                    </div>
                `;
            }
            if (actionsEl) {
                actionsEl.innerHTML = `
                    <button onclick="closeModal()" class="pixel-btn px-4 py-2 font-bold text-xs">キャンセル</button>
                    <button onclick="verifyAdminPassword()" class="pixel-btn pixel-btn-primary px-6 py-2 font-bold text-xs">認証する</button>
                `;
            }
            if (overlay) {
                overlay.classList.remove('hidden');
                document.body.classList.add('modal-open');
            }
            setTimeout(() => {
                const input = document.getElementById('admin-password-input');
                if (input) {
                    input.focus();
                    input.onkeydown = (e) => {
                        if (e.key === 'Enter') verifyAdminPassword();
                    };
                }
            }, 100);
        }

        function verifyAdminPassword() {
            audioSystem.playSelect();
            const input = document.getElementById('admin-password-input');
            const errEl = document.getElementById('admin-pass-error');
            if (input && input.value === '1234') {
                closeModal();
                openAdminPanel();
            } else {
                if (errEl) errEl.classList.remove('hidden');
                if (input) {
                    input.classList.add('border-red-500');
                    input.value = '';
                }
            }
        }

        function openAdminPanel() {
            audioSystem.playSelect();
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const overlay = document.getElementById('modal-overlay');
            const actionsEl = document.getElementById('modal-actions');
            if (titleEl) titleEl.innerText = "🛠️ 管理者パネル";
            if (bodyEl) {
                bodyEl.innerHTML = `
                    <div class="space-y-4 py-2">
                        <div class="pixel-box bg-slate-950 p-3 space-y-2 border-amber-600">
                            <h4 class="text-amber-300 font-bold text-xs font-pixel">👑 キャラクター全解放</h4>
                            <p class="text-[11px] text-slate-300">すべてのキャラクターおよびアイコンを強制解放します。</p>
                            <button onclick="adminUnlockAllChars()" class="pixel-btn pixel-btn-primary text-xs px-4 py-1.5 font-bold w-full">
                                ✨ すべてのキャラを解放する
                            </button>
                        </div>

                        <div class="pixel-box bg-slate-950 p-3 space-y-2 border-amber-600">
                            <h4 class="text-amber-300 font-bold text-xs font-pixel">📊 現環境データの閲覧</h4>
                            <p class="text-[11px] text-slate-300">現在のメタデータ（勝率ランキング・相性表・インサイト）を閲覧します。</p>
                            <button onclick="closeModal(); renderMetaScreen();" class="pixel-btn pixel-btn-warning text-xs px-4 py-1.5 font-bold w-full">
                                📊 現環境データを表示する
                            </button>
                        </div>
                    </div>
                `;
            }
            if (actionsEl) {
                actionsEl.innerHTML = `<button onclick="closeModal()" class="pixel-btn px-6 py-2 font-bold text-xs">閉じる</button>`;
            }
            if (overlay) {
                overlay.classList.remove('hidden');
                document.body.classList.add('modal-open');
            }
        }

        async function adminUnlockAllChars() {
            audioSystem.playSelect();
            const allCharIds = Object.keys(CHARACTER_DATA);
            const allExtraIconIds = Object.keys(EXTRA_ICONS);
            const allIconIds = [...allCharIds, ...allExtraIconIds];

            playerState.unlockedChars = [...allCharIds];
            playerState.unlockedIcons = [...allIconIds];
            await savePlayerState();

            showModal("管理者モード", "✨ すべてのキャラクターおよびアイコンを解放しました！");
        }

        function savePlayerName() {
            audioSystem.playSelect();
            const input = document.getElementById('profile-name-input');
            if (!input) return;
            const newName = input.value.trim();
            if (!newName) {
                showModal("エラー", "ファイター名を入力してください！");
                return;
            }
            if (newName.length > 12) {
                showModal("エラー", "ファイター名は12文字以内で入力してください！");
                return;
            }
            playerState.playerName = newName;
            savePlayerState();
            updateHeaderProfile();
            showModal("保存完了", `ファイター名を「${newName}」に更新しました！`);
        }

        function openIconSelectModal() {
            audioSystem.playSelect();
            let html = `
                <div class="flex flex-col space-y-3 w-full">
                    <div class="border-b border-slate-800 pb-2 text-center sm:text-left">
                        <p class="text-xs text-slate-300 font-mono">所持しているお気に入りのアイコンを選択してください。</p>
                    </div>
                    <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 pr-1 w-full">
            `;

            const allItems = { ...CHARACTER_DATA, ...EXTRA_ICONS };

            Object.values(allItems).forEach(item => {
                const isIconUnlocked = playerState.unlockedIcons && playerState.unlockedIcons.includes(item.id);
                const isSelected = playerState.selectedIcon === item.id;
                if (!isIconUnlocked) return;

                html += `
                    <div onclick="setProfileIcon('${item.id}')" class="pixel-box p-2.5 bg-slate-950 cursor-pointer flex flex-col items-center justify-center relative border-2 transition-all ${isSelected ? 'border-amber-400 bg-amber-950/50 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40' : 'border-slate-700 hover:border-slate-400 hover:bg-slate-900'}">
                        ${isSelected ? '<span class="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded shadow font-pixel">選択中</span>' : ''}
                        <canvas id="icon-sel-cvs-${item.id}" width="88" height="88" class="pixel-box bg-slate-900 mb-2 w-16 h-16 sm:w-20 sm:h-20 rounded"></canvas>
                        <span class="text-[11px] font-bold text-slate-200 truncate max-w-full text-center">${item.name}</span>
                    </div>
                `;
            });

            html += `</div></div>`;
            showModal("アイコン選択", html);

            setTimeout(() => {
                Object.values(allItems).forEach(item => {
                    if (playerState.unlockedIcons && playerState.unlockedIcons.includes(item.id)) {
                        const cvs = document.getElementById(`icon-sel-cvs-${item.id}`);
                        if (cvs) CharacterRenderer.drawCharacter(cvs, item.id);
                    }
                });
            }, 50);
        }

        function setProfileIcon(charId) {
            audioSystem.playSelect();
            playerState.selectedIcon = charId;
            savePlayerState();
            updateHeaderProfile();
            closeModal();
            openProfileScreen();
        }

        function openOpponentProfileModal(historyIndex) {
            audioSystem.playSelect();
            const h = playerState.battleHistory[historyIndex];
            if (!h || h.isBot) return;

            const p = h.opponentProfile;
            let usageHtml = '';
            if (p && p.charUsage && Object.keys(p.charUsage).length > 0) {
                const totalC = Object.values(p.charUsage).reduce((a, b) => a + b, 0);
                usageHtml = `<div class="pixel-box p-3 bg-slate-900 w-full space-y-1 text-left"><h4 class="text-xs font-bold text-amber-300 font-pixel mb-1">📊 相手の使用キャラ傾向</h4><div class="space-y-1 max-h-36 overflow-y-auto pr-1">`;
                Object.entries(p.charUsage).forEach(([cId, cnt]) => {
                    const cData = CHARACTER_DATA[cId] || { name: cId };
                    const pct = totalC > 0 ? ((cnt / totalC) * 100).toFixed(1) : 0;
                    usageHtml += `
                        <div class="bg-slate-950 p-1.5 rounded flex items-center justify-between text-xs font-mono">
                            <span class="text-slate-200">${cData.name} (${cnt}回)</span>
                            <span class="text-emerald-400 font-bold">${pct}%</span>
                        </div>
                    `;
                });
                usageHtml += `</div></div>`;
            } else {
                usageHtml = `<div class="pixel-box p-3 bg-slate-900 w-full text-xs text-slate-400 font-mono">使用キャラクター記録なし</div>`;
            }

            let oppWinRate = p && p.totalBattles > 0 ? ((p.wins / p.totalBattles) * 100).toFixed(1) : (p?.winRate || 0);
            let oppBattles = p ? p.totalBattles : '非公開';
            let oppWins = p ? p.wins : '非公開';
            let oppLosses = p ? p.losses : '非公開';

            let html = `
                <div class="flex flex-col items-center justify-center space-y-3 p-1 w-full max-w-sm mx-auto">
                    <div class="flex items-center gap-3 bg-slate-950 p-3 rounded border border-cyan-500/50 w-full">
                        <canvas id="opp-profile-cvs" width="92" height="92" class="pixel-box bg-slate-900 rounded"></canvas>
                        <div class="text-left">
                            <h3 class="text-sm font-bold text-cyan-300 font-pixel">${h.opponentName}</h3>
                            <span class="text-[10px] text-slate-400 font-mono">オンライン対戦プレイヤー</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-4 gap-1.5 w-full text-center font-mono text-xs">
                        <div class="bg-slate-950 p-2 rounded border border-slate-800">
                            <div class="text-slate-400 text-[10px]">総対戦</div>
                            <div class="text-amber-300 font-bold">${oppBattles}</div>
                        </div>
                        <div class="bg-slate-950 p-2 rounded border border-slate-800">
                            <div class="text-slate-400 text-[10px]">勝利</div>
                            <div class="text-emerald-400 font-bold">${oppWins}</div>
                        </div>
                        <div class="bg-slate-950 p-2 rounded border border-slate-800">
                            <div class="text-slate-400 text-[10px]">敗北</div>
                            <div class="text-red-400 font-bold">${oppLosses}</div>
                        </div>
                        <div class="bg-slate-950 p-2 rounded border border-slate-800">
                            <div class="text-slate-400 text-[10px]">勝率</div>
                            <div class="text-cyan-400 font-bold">${oppWinRate}%</div>
                        </div>
                    </div>

                    ${usageHtml}
                </div>
            `;
            showModal("対戦相手プロフィール", html);

            setTimeout(() => {
                const cvs = document.getElementById('opp-profile-cvs');
                if (cvs) CharacterRenderer.drawCharacter(cvs, h.opponentIcon || 'pasha');
            }, 50);
        }

        async function renderMetaScreen() {
            audioSystem.playSelect();
            const container = document.getElementById('screen-container');
            if (!container) return;
            container.innerHTML = `
                <div class="flex flex-col items-center w-full max-w-4xl mx-auto py-2 px-2 h-full overflow-hidden">
                    <div class="flex justify-between items-center w-full px-1 flex-shrink-0 mb-2">
                        <h2 class="text-base sm:text-xl font-bold text-amber-300 font-pixel">📊 現環境データ (META ANALYSIS)</h2>
                        <button onclick="renderHomeScreen()" class="pixel-btn px-4 py-1 text-xs font-bold">ホームに戻る</button>
                    </div>
                    
                    <div class="flex-1 min-h-0 w-full overflow-y-auto pr-1 space-y-4">
                        <div class="pixel-box-gold p-4 bg-amber-950/90 w-full space-y-3">
                            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800 pb-3">
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-amber-200 font-bold">集計期間:</span>
                                    <select id="meta-period-select" onchange="loadAndRenderMeta()" class="pixel-box bg-slate-950 text-amber-300 text-xs px-2 py-1 outline-none border-amber-600">
                                        <option value="all">全期間 (All Time)</option>
                                        <option value="30">直近 30日</option>
                                        <option value="7">直近 7日</option>
                                    </select>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-amber-200 font-bold">対戦モード:</span>
                                    <select id="meta-mode-select" onchange="loadAndRenderMeta()" class="pixel-box bg-slate-950 text-amber-300 text-xs px-2 py-1 outline-none border-amber-600">
                                        <option value="all">すべて (All)</option>
                                        <option value="pvp">オンライン対戦 (PvP)</option>
                                        <option value="bot">BOT戦 (Solo)</option>
                                    </select>
                                </div>
                            </div>

                            <div id="meta-content-area" class="space-y-4">
                                <div class="text-center py-8 text-amber-300 font-mono animate-pulse">
                                    🔄 グローバル環境データを読み込み中...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            await loadAndRenderMetaContent();
        }

        async function loadAndRenderMetaContent() {
            const area = document.getElementById('meta-content-area');
            if (!area) return;

            const periodSel = document.getElementById('meta-period-select');
            const modeSel = document.getElementById('meta-mode-select');
            const period = periodSel ? periodSel.value : 'all';
            const mode = modeSel ? modeSel.value : 'all';

            let matches = [];
            if (window.fbDb && window.fbCollection && window.fbGetDocs) {
                try {
                    const colRef = window.fbCollection(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'global_matches');
                    const snap = await window.fbGetDocs(colRef);
                    snap.forEach(doc => {
                        const d = doc.data();
                        if (d) matches.push(d);
                    });
                } catch(e) {
                    console.error("Fetch Global Matches Error:", e);
                }
            }

            if (matches.length === 0 && playerState.battleHistory && playerState.battleHistory.length > 0) {
                playerState.battleHistory.forEach(h => {
                    matches.push({
                        timestamp: Date.now(),
                        isBot: h.isBot,
                        myChar: h.myChar,
                        oppChar: h.opponentProfile?.selectedIcon || h.opponentIcon || 'pasha',
                        result: h.result
                    });
                });
            }

            if (mode === 'pvp') {
                matches = matches.filter(m => m.isBot === false);
            } else if (mode === 'bot') {
                matches = matches.filter(m => m.isBot === true);
            }

            const now = Date.now();
            if (period === '7') {
                const limitTime = now - 7 * 24 * 60 * 60 * 1000;
                matches = matches.filter(m => m.timestamp && m.timestamp >= limitTime);
            } else if (period === '30') {
                const limitTime = now - 30 * 24 * 60 * 60 * 1000;
                matches = matches.filter(m => m.timestamp && m.timestamp >= limitTime);
            }

            const totalCount = matches.length;

            if (totalCount < 5) {
                area.innerHTML = `
                    <div class="pixel-box p-6 bg-slate-900 text-center space-y-3">
                        <p class="text-amber-400 font-bold font-pixel text-sm">⚠️ データ不足 (INSUFFICIENT DATA)</p>
                        <p class="text-xs text-slate-300">十分な対戦データが集まっていません（現在の対象試合数: ${totalCount}件 / 最低5件必要）。</p>
                        <p class="text-[11px] text-slate-400">オンライン対戦やBOT戦をプレイして、環境データ蓄積にご協力ください！架空のデータは表示されません。</p>
                    </div>
                `;
                return;
            }

            const charStats = {};
            const usageCounts = {};
            let totalUsage = 0;
            const matchupData = {};

            const charIds = Object.keys(CHARACTER_DATA);
            charIds.forEach(id => {
                charStats[id] = { matches: 0, wins: 0, losses: 0, draws: 0 };
                usageCounts[id] = 0;
                matchupData[id] = {};
                charIds.forEach(otherId => {
                    matchupData[id][otherId] = { matches: 0, wins: 0 };
                });
            });

            matches.forEach(m => {
                const my = m.myChar;
                const opp = m.oppChar;
                const res = m.result;

                if (my && charStats[my]) {
                    charStats[my].matches++;
                    usageCounts[my]++;
                    totalUsage++;
                    if (res === 'win') charStats[my].wins++;
                    else if (res === 'lose') charStats[my].losses++;
                    else charStats[my].draws++;
                }

                if (my && opp && matchupData[my] && matchupData[my][opp]) {
                    matchupData[my][opp].matches++;
                    if (res === 'win') {
                        matchupData[my][opp].wins++;
                    }
                }
            });

            const rankedChars = charIds.map(id => {
                const s = charStats[id];
                const winRate = s.matches > 0 ? (s.wins / s.matches) * 100 : 0;
                const usageRate = totalUsage > 0 ? (usageCounts[id] / totalUsage) * 100 : 0;
                return { id, ...s, winRate, usageRate };
            }).sort((a, b) => b.winRate - a.winRate || b.matches - a.matches);

            let statsHtml = `
                <div class="space-y-3">
                    <h3 class="text-xs font-bold text-amber-300 font-pixel">🏆 キャラ別成績ランキング (総対戦: ${totalCount}件)</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs font-mono border-collapse">
                            <thead>
                                <tr class="bg-slate-950 text-amber-400 border-b border-amber-800">
                                    <th class="p-2">順位 / キャラ</th>
                                    <th class="p-2 text-center">対戦数</th>
                                    <th class="p-2 text-center">勝利数</th>
                                    <th class="p-2 text-center">勝率</th>
                                    <th class="p-2 text-center">使用率</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800">
            `;

            rankedChars.forEach((c, idx) => {
                const cData = CHARACTER_DATA[c.id] || { name: c.id };
                let rankBadge = `${idx + 1}位`;
                if (idx === 0) rankBadge = '👑 1位';
                else if (idx === 1) rankBadge = '🥈 2位';
                else if (idx === 2) rankBadge = '🥉 3位';

                statsHtml += `
                    <tr class="hover:bg-slate-900/60">
                        <td class="p-2 flex items-center gap-2">
                            <span class="w-10 text-amber-300 font-bold">${rankBadge}</span>
                            <span class="font-bold text-slate-100">${cData.name}</span>
                        </td>
                        <td class="p-2 text-center text-slate-300">${c.matches}</td>
                        <td class="p-2 text-center text-emerald-400">${c.wins}</td>
                        <td class="p-2 text-center font-bold text-cyan-400">${c.winRate.toFixed(1)}%</td>
                        <td class="p-2 text-center text-amber-200">${c.usageRate.toFixed(1)}%</td>
                    </tr>
                `;
            });

            statsHtml += `</tbody></table></div></div>`;

            let matchupHtml = `
                <div class="space-y-3 pt-4 border-t border-amber-800">
                    <h3 class="text-xs font-bold text-amber-300 font-pixel">⚔️ キャラ相性表 (行: 自分 VS 列: 相手の勝率)</h3>
                    <p class="text-[10px] text-amber-200/70 font-mono">💡 左右にスライドして表全体を閲覧できます</p>
                    <div class="overflow-x-auto">
                        <table class="w-full text-center text-[10px] font-mono border-collapse">
                            <thead>
                                <tr class="bg-slate-950 text-amber-400 border-b border-amber-800">
                                    <th class="p-1.5 text-left">自分 \\ 相手</th>
            `;
            charIds.forEach(id => {
                const c = CHARACTER_DATA[id];
                matchupHtml += `<th class="p-1.5 truncate max-w-[60px]">${c ? c.name : id}</th>`;
            });
            matchupHtml += `</tr></thead><tbody class="divide-y divide-slate-800">`;

            charIds.forEach(myId => {
                const myC = CHARACTER_DATA[myId];
                matchupHtml += `<tr class="hover:bg-slate-900/60"><td class="p-1.5 text-left font-bold text-slate-200 truncate max-w-[80px]">${myC ? myC.name : myId}</td>`;
                charIds.forEach(oppId => {
                    if (myId === oppId) {
                        matchupHtml += `<td class="p-1.5 bg-slate-950 text-slate-600">---</td>`;
                    } else {
                        const m = matchupData[myId][oppId];
                        if (m.matches === 0) {
                            matchupHtml += `<td class="p-1.5 text-slate-500">データなし</td>`;
                        } else {
                            const wr = (m.wins / m.matches) * 100;
                            let colorClass = 'bg-slate-900 text-slate-200';
                            if (wr >= 55) colorClass = 'bg-emerald-950/80 text-emerald-300 font-bold';
                            else if (wr <= 45) colorClass = 'bg-red-950/80 text-red-300 font-bold';
                            matchupHtml += `<td class="p-1.5 ${colorClass}">${wr.toFixed(0)}%<br><span class="text-[9px] text-slate-400">(${m.matches}戦)</span></td>`;
                        }
                    }
                });
                matchupHtml += `</tr>`;
            });
            matchupHtml += `</tbody></table></div></div>`;

            const topChar = rankedChars[0];
            const bottomChar = rankedChars[rankedChars.length - 1];
            const popularChar = [...rankedChars].sort((a, b) => b.usageRate - a.usageRate)[0];

            let analysisHtml = `
                <div class="space-y-3 pt-4 border-t border-amber-800">
                    <h3 class="text-xs font-bold text-amber-300 font-pixel">📊 環境分析インサイト (ENVIRONMENT INSIGHTS)</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div class="pixel-box p-3 bg-slate-950 space-y-1">
                            <span class="text-[10px] text-emerald-400 font-bold">👑 勝率トップ (強キャラ)</span>
                            <div class="font-bold text-amber-300 text-sm">${CHARACTER_DATA[topChar.id]?.name || topChar.id}</div>
                            <div class="text-[11px] text-slate-300">勝率: <span class="text-cyan-400 font-bold">${topChar.winRate.toFixed(1)}%</span> (${topChar.matches}戦)</div>
                        </div>
                        <div class="pixel-box p-3 bg-slate-950 space-y-1">
                            <span class="text-[10px] text-purple-400 font-bold">🔥 使用率トップ (人気)</span>
                            <div class="font-bold text-amber-300 text-sm">${CHARACTER_DATA[popularChar.id]?.name || popularChar.id}</div>
                            <div class="text-[11px] text-slate-300">使用率: <span class="text-amber-400 font-bold">${popularChar.usageRate.toFixed(1)}%</span> (${popularChar.matches}戦)</div>
                        </div>
                        <div class="pixel-box p-3 bg-slate-950 space-y-1">
                            <span class="text-[10px] text-red-400 font-bold">⚡ 要研究・苦戦キャラ</span>
                            <div class="font-bold text-amber-300 text-sm">${CHARACTER_DATA[bottomChar.id]?.name || bottomChar.id}</div>
                            <div class="text-[11px] text-slate-300">勝率: <span class="text-red-400 font-bold">${bottomChar.winRate.toFixed(1)}%</span> (${bottomChar.matches}戦)</div>
                        </div>
                    </div>
                </div>
            `;

            area.innerHTML = statsHtml + matchupHtml + analysisHtml;
        }
        function openInBattleCharDetail(charObjOrId, event) {
            if (typeof toggleBattleCharTooltip === 'function') {
                toggleBattleCharTooltip(charObjOrId, true, event || window.event);
            }
        }

        let _activeDopaObeyAttacker = null;
        let _activeDopaObeyTarget = null;

        function openDopaObeyModal(attacker, targetEnemy) {
            if (!targetEnemy || !targetEnemy.skills) return;
            _activeDopaObeyAttacker = attacker;
            _activeDopaObeyTarget = targetEnemy;

            let modal = document.getElementById('dopa-obey-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'dopa-obey-modal';
                document.body.appendChild(modal);
            }

            let skillButtonsHtml = targetEnemy.skills.map(s => `
                <button onclick="executeDopaObeySkill('${s.id}')" class="pixel-box bg-slate-900 border border-amber-400 hover:border-amber-300 p-3 text-left shadow flex flex-col justify-between w-full transition-all cursor-pointer">
                    <div class="flex justify-between items-center w-full mb-1">
                        <span class="font-pixel text-xs sm:text-sm text-amber-300 font-bold flex items-center gap-2">
                            <span>👑</span>
                            <span>${s.name}</span>
                        </span>
                    </div>
                    <div class="text-[11px] sm:text-xs text-slate-200 font-mono leading-relaxed">${s.desc}</div>
                </button>
            `).join('');

            modal.className = "fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4 animate-fadeIn";
            modal.innerHTML = `
                <div class="pixel-box bg-slate-900 border-2 border-amber-400 max-w-md w-full p-4 text-center relative shadow-2xl flex flex-col max-h-[85vh]">
                    <div class="text-amber-400 font-pixel text-sm sm:text-base font-bold mb-1">👑【王に従え】発動！</div>
                    <div class="text-xs text-slate-300 font-mono mb-3">相手の【<b class="text-amber-300">${targetEnemy.charName}</b>】の全スキルから1つ選択して発動！（CD無視）</div>
                    <div class="space-y-2 overflow-y-auto flex-1 pr-1">
                        ${skillButtonsHtml}
                    </div>
                </div>
            `;
            modal.style.display = 'flex';
        }

        function executeDopaObeySkill(skillId) {
            const modal = document.getElementById('dopa-obey-modal');
            if (modal) modal.style.display = 'none';
            if (activeNewBattle && _activeDopaObeyAttacker && _activeDopaObeyTarget) {
                const skill = _activeDopaObeyTarget.skills.find(s => s.id === skillId) || { id: skillId, name: skillId, type: 'attack', power: 1.0, targetType: 'single_enemy' };
                
                window.newBattleTargetSelectCopiedSkill = skill;
                _activeDopaObeyAttacker.pendingObeySkill = skill;

                // スキルタイプに応じて対象選択フェーズかアクション送信へ
                if (skill.targetType === 'single_enemy' || skill.targetType === 'single_ally') {
                    window.newBattleViewMode = 'target_select';
                    window.newBattleTargetSelectType = skill.targetType === 'single_ally' ? 'single_ally' : 'single_enemy';
                    window.newBattleTargetSelectSkillId = 'dopa_obey_copy';
                    if (typeof renderNewBattleScreen === 'function') renderNewBattleScreen();
                    return;
                }

                window.newBattleViewMode = 'main';
                activeNewBattle.submitAction(1, 'dopa_obey_copy');
                _activeDopaObeyAttacker = null;
                _activeDopaObeyTarget = null;
                if (typeof renderNewBattleScreen === 'function') renderNewBattleScreen();
            }
        }

        window.openDopaObeyModal = openDopaObeyModal;
        window.executeDopaObeySkill = executeDopaObeySkill;

        // HTML の onclick 属性から参照される関数をグローバル公開
        window.audioSystem = audioSystem;
        window.renderOpeningScreen = renderOpeningScreen;
        window.finishOpening = finishOpening;
        window.renderHomeScreen = renderHomeScreen;
        window.openCharDetail = openCharDetail;
        window.openInBattleCharDetail = openInBattleCharDetail;
        window.openGachaModal = openGachaModal;
        window.executeGacha = executeGacha;
        window.openCharacterListModal = openCharacterListModal;
        window.confirmRetireBattle = confirmRetireBattle;
        window.closeModal = closeModal;
        window.showModal = showModal;
        window.showConfirmModal = showConfirmModal;
        window.openProfileScreen = openProfileScreen;
        window.savePlayerName = savePlayerName;
        window.openIconSelectModal = openIconSelectModal;
        window.setProfileIcon = setProfileIcon;
        window.openOpponentProfileModal = openOpponentProfileModal;
        window.renderMetaScreen = renderMetaScreen;
        window.loadAndRenderMeta = loadAndRenderMetaContent;
        window.renderZukanScreen = renderZukanScreen;
        window.renderZukanDetailScreen = renderZukanDetailScreen;
        window.onZukanSortChange = onZukanSortChange;
        window.toggleZukanSortDir = toggleZukanSortDir;
        window.openGachaLineupModal = openGachaLineupModal;

        function claimDailyBonus() {
            showToast("デイリーボーナスは現在準備中です！");
        }

        window.claimDailyBonus = claimDailyBonus;
        window.confirmResetPlayerProfile = confirmResetPlayerProfile;
        window.executeResetPlayerProfile = executeResetPlayerProfile;
        window.handleDopagaKingdomClick = handleDopagaKingdomClick;
        window.openStoreModal = openStoreModal;
        window.openFriendModal = openFriendModal;
        window.openSettingsModal = openSettingsModal;
        window.playOpeningAgain = playOpeningAgain;
        window.openAdminPasswordModal = openAdminPasswordModal;
        window.verifyAdminPassword = verifyAdminPassword;
        window.openAdminPanel = openAdminPanel;
        window.adminUnlockAllChars = adminUnlockAllChars;
        function showToast(message) {
            let toast = document.getElementById('app-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'app-toast';
                toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[10000] pixel-box bg-slate-900 border-amber-400 text-amber-300 px-4 py-2 text-xs font-bold font-pixel shadow-2xl transition-all opacity-0 pointer-events-none';
                document.body.appendChild(toast);
            }
            toast.innerText = message;
            toast.classList.remove('opacity-0', 'pointer-events-none');
            toast.classList.add('opacity-100');
            
            if (window._toastTimer) clearTimeout(window._toastTimer);
            window._toastTimer = setTimeout(() => {
                toast.classList.remove('opacity-100');
                toast.classList.add('opacity-0', 'pointer-events-none');
            }, 2000);
        }

        function copyPlayerId(id) {
            audioSystem.playSelect();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(id).then(() => {
                    showToast("IDをコピーしました！");
                }).catch(() => {
                    fallbackCopyText(id);
                });
            } else {
                fallbackCopyText(id);
            }
        }

        function fallbackCopyText(text) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                showToast("IDをコピーしました！");
            } catch (err) {
                showToast("コピーに失敗しました");
            }
            document.body.removeChild(textArea);
        }

        function openReloginModal() {
            audioSystem.playSelect();
            closeSettingsPanel();
            
            let savedIds = [];
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('dopa_backup_')) {
                        savedIds.push(key.replace('dopa_backup_', ''));
                    }
                }
            } catch(e){}
            
            let savedIdsHtml = '';
            if (savedIds.length > 0) {
                savedIdsHtml = `
                    <div class="mt-3 text-left">
                        <p class="text-[11px] text-amber-300 font-bold mb-1">📂 この端末に保存されているID履歴:</p>
                        <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto bg-slate-950 p-2 rounded border border-slate-800">
                            ${savedIds.map(id => `<button onclick="document.getElementById('relogin-id-input').value='${id}';" class="pixel-btn px-2 py-1 text-[10px] bg-slate-900 border-slate-700 text-amber-200">${id}</button>`).join('')}
                        </div>
                    </div>
                `;
            }

            const bodyHtml = `
                <div class="text-center space-y-3 py-1">
                    <p class="text-xs text-slate-200 leading-relaxed font-mono">
                        過去に使用していた<b class="text-amber-400">「プレイヤーID」</b>を入力してください。<br>
                        該当するバックアップデータが存在する場合、データを復元してゲームを再開できます。
                    </p>
                    <div class="text-left space-y-1">
                        <label class="text-xs text-amber-300 font-bold block">プレイヤーID:</label>
                        <input id="relogin-id-input" type="text" placeholder="例: DP-1234" class="pixel-box bg-slate-950 px-3 py-2 text-sm font-bold text-amber-300 w-full outline-none border-amber-600">
                    </div>
                    ${savedIdsHtml}
                </div>
            `;

            showConfirmModal("🔑 プレイヤー再ログイン (データ復元)", bodyHtml, async () => {
                const input = document.getElementById('relogin-id-input');
                if (!input) return;
                const targetId = input.value.trim();
                if (!targetId) {
                    showModal("エラー", "プレイヤーIDを入力してください！");
                    return;
                }

                let restoredData = null;
                try {
                    const localBackup = localStorage.getItem('dopa_backup_' + targetId);
                    if (localBackup) {
                        restoredData = JSON.parse(localBackup);
                    }
                } catch(e){}

                if (!restoredData && window.fbDb && window.fbCollection && window.fbGetDocs && window.fbQuery) {
                    try {
                        const { collection, getDocs, query, where } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
                        const usersRef = collection(window.fbDb, 'users');
                        const q = query(usersRef, where('playerId', '==', targetId));
                        const querySnapshot = await getDocs(q);
                        if (!querySnapshot.empty) {
                            restoredData = querySnapshot.docs[0].data();
                        }
                    } catch(e) {
                        console.warn("Firestore relogin query error:", e);
                    }
                }

                if (restoredData) {
                    Object.assign(playerState, restoredData);
                    await savePlayerState();
                    updateHeaderProfile();
                    showModal("復元成功！", `プレイヤーID「${targetId}」のデータを正常に復元しました！\nようこそおかえりなさい、${playerState.playerName}さん！`);
                    setTimeout(() => {
                        closeModal();
                        renderHomeScreen();
                    }, 1500);
                } else {
                    showModal("データが見つかりません", `プレイヤーID「${targetId}」に該当するバックアップデータが見つかりませんでした。\nIDが正しいかご確認ください。`);
                }
            }, "データを復元してログイン");
        }

        window.copyPlayerId = copyPlayerId;
        window.openReloginModal = openReloginModal;
        window.renderBotModesScreen = renderBotModesScreen;
        window.renderNewBattleCharSelectScreen = renderNewBattleCharSelectScreen;
        window.forceReloadApp = forceReloadApp;
        window.getNewBattleCustomStats = getNewBattleCustomStats;
        window.adjustNewBattleStat = adjustNewBattleStat;
        window.resetNewBattleStats = resetNewBattleStats;

        // 画像・Canvas・ゲーム画面内でのコンテキストメニュー（長押し・右クリック）の禁止対策
        document.addEventListener('contextmenu', (e) => {
            const target = e.target;
            if (target.tagName === 'IMG' || target.tagName === 'CANVAS' || target.closest('#app') || target.closest('#screen-container')) {
                e.preventDefault();
            }
        }, { passive: false });

        function preventContextMenuForMedia() {
            document.querySelectorAll('img, canvas').forEach(el => {
                if (!el._hasContextMenuPrevented) {
                    el._hasContextMenuPrevented = true;
                    el.addEventListener('contextmenu', e => e.preventDefault(), { passive: false });
                }
            });
        }
        window.addEventListener('load', preventContextMenuForMedia);
        const mediaObserver = new MutationObserver(() => {
            preventContextMenuForMedia();
        });
        mediaObserver.observe(document.body, { childList: true, subtree: true });

        // スマホ横画面等での画面拡大（ピンチズーム・ダブルタップズーム）の完全防止
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        }, { passive: false });
        document.addEventListener('gesturechange', (e) => {
            e.preventDefault();
        }, { passive: false });
        document.addEventListener('gestureend', (e) => {
            e.preventDefault();
        }, { passive: false });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

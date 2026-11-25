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
            const { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, deleteDoc, collection, addDoc, getDocs, query, orderBy, limit, where, runTransaction } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

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
            window.fbWhere = where;
            window.fbRunTransaction = runTransaction;

            window._firebaseAuthHelpers = { signInAnonymously, onAuthStateChanged };
        })().catch((err) => {
            console.warn("Firebase SDK load error:", err);
        });

        window.getOnlineClientId = function() {
            let cid = null;
            try {
                cid = sessionStorage.getItem('dopa_online_tab_client_id');
                if (!cid) {
                    const baseId = (typeof playerState !== 'undefined' && playerState.playerId) ? playerState.playerId : 'DP';
                    cid = `${baseId}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
                    sessionStorage.setItem('dopa_online_tab_client_id', cid);
                }
            } catch (e) {
                if (!window._fallbackOnlineClientId) {
                    window._fallbackOnlineClientId = `DP_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
                }
                cid = window._fallbackOnlineClientId;
            }
            return cid;
        };

        window.setOnlineClientId = function(cid) {
            if (!cid || typeof cid !== 'string') return;
            window._fallbackOnlineClientId = cid;
            try {
                sessionStorage.setItem('dopa_online_tab_client_id', cid);
            } catch (e) {}
        };

        window.saveOnlineRejoinTicket = function(roomId, roomCode, uid, extra = {}) {
            if (!uid || (!roomCode && !roomId)) return;
            try {
                const payload = {
                    roomId: roomId || null,
                    roomCode: roomCode ? String(roomCode).trim() : null,
                    uid: uid,
                    playerId: (typeof playerState !== 'undefined' && playerState.playerId) ? playerState.playerId : null,
                    savedAt: Date.now(),
                    ...extra
                };
                const raw = JSON.stringify(payload);
                if (payload.roomCode) {
                    localStorage.setItem('dopa_rejoin_ticket_' + payload.roomCode, raw);
                }
                if (payload.roomId) {
                    localStorage.setItem('dopa_rejoin_room_' + payload.roomId, raw);
                }
            } catch (e) {}
        };

        window.getOnlineRejoinTicket = function(roomCode) {
            if (!roomCode) return null;
            try {
                const raw = localStorage.getItem('dopa_rejoin_ticket_' + String(roomCode).trim());
                if (!raw) return null;
                const data = JSON.parse(raw);
                if (!data || !data.uid) return null;
                if (data.savedAt && (Date.now() - data.savedAt > 6 * 60 * 60 * 1000)) {
                    localStorage.removeItem('dopa_rejoin_ticket_' + String(roomCode).trim());
                    return null;
                }
                return data;
            } catch (e) {
                return null;
            }
        };

        window.clearOnlineRejoinTicket = function(roomCode, roomId) {
            try {
                if (roomId) {
                    const raw = localStorage.getItem('dopa_rejoin_room_' + roomId);
                    if (raw && !roomCode) {
                        const parsed = JSON.parse(raw);
                        if (parsed && parsed.roomCode) roomCode = parsed.roomCode;
                    }
                    localStorage.removeItem('dopa_rejoin_room_' + roomId);
                }
                if (roomCode) {
                    localStorage.removeItem('dopa_rejoin_ticket_' + String(roomCode).trim());
                }
            } catch (e) {}
        };

        window.initFirebaseOnline = async function() {
            await firebaseReady;
            if (!window.fbAuth || !window._firebaseAuthHelpers) return !!window.fbDb;
            if (window.fbUser) return true;
            const { signInAnonymously, onAuthStateChanged } = window._firebaseAuthHelpers;
            return new Promise((resolve) => {
                let settled = false;
                const finish = (ok) => {
                    if (!settled) {
                        settled = true;
                        resolve(ok);
                    }
                };
                setTimeout(() => finish(!!window.fbDb), 4000);
                const unsub = onAuthStateChanged(window.fbAuth, async (user) => {
                    if (typeof unsub === 'function') unsub();
                    if (user) {
                        window.fbUser = user;
                        finish(true);
                    } else {
                        try {
                            const userCred = await signInAnonymously(window.fbAuth);
                            window.fbUser = userCred.user;
                            finish(true);
                        } catch (err) {
                            console.warn("Firebase Auth Error:", err);
                            finish(!!window.fbDb);
                        }
                    }
                });
            });
        };

        const ASSET_CACHE_NAME = 'dopakin-site-assets-v2.3.14';
        const STATIC_IMAGE_ASSETS = [
            'assets/aistudio/image_6db88de4.png',
            'images/backnormal.webp',
            'images/screen.webp',
            'images/title-1.webp',
            'images/DOPAGAKINGDOM.png',
            'dopaAI/normal.webp',
            'dopaAI/rough.webp',
            'asaiomizu/asaiomizu.webp',
            'asaiomizu/asaiomizu2.webp',
            'asaiomizu/asaiomizu3.webp',
            'courtney/ALT.webp',
            'courtney/ALT11.webp',
            'courtney/ALT2.webp',
            'courtney/ALT3.webp',
            'courtney/ALTchange2.webp',
            'dopagaking/dopagaking.webp',
            'dopagaking/dopagakingALL.webp',
            'dopagaking/dopagakingDIE.webp',
            'dopagaking/dopagakingchange.webp',
            'dopagaking/dopagakingcharge.webp',
            'dopagaking/dopakaking11.webp',
            'iwaba/ganban.webp',
            'iwaba/ganbanALL.webp',
            'iwaba/ganbanDIE.webp',
            'moenan/moenan.webp',
            'moenan/moenanALL.webp',
            'moenan/moenanDIE.webp',
            'moenan/moenancat.webp',
            'momopin/momopin.webp',
            'momopin/momopinALL.webp',
            'momopin/momopinDIE.webp',
            'momopin/momopinNASU.webp',
            'momopin/chargenasu.webp',
            'ndaihyo/ndaihyou.webp',
            'ndaihyo/ndaihyouALL.webp',
            'ndaihyo/ndaihyouDIE.webp',
            'pasha/pasha.webp',
            'pasha/pashaALL.webp',
            'pasha/pashaDIE.webp',
            'pasha/pasha-dark.webp',
            'pasha/pasha-darkALL.webp',
            'pasha/pasha-darkDIE.webp',
            'pasha-dark/pasha-dark.webp',
            'pasha-dark/pasha-darkALL.webp',
            'pasha-dark/pasha-darkDIE.webp'
        ];
        const SHELL_SITE_ASSETS = [
            'manifest.json',
            'style.css?v=2.3.14',
            'battle-3v3.js?v=2.3.14',
            'game.js?v=2.3.14'
        ];

        const AssetPreloader = {
            blobMap: {},
            isComplete: false,
            loadedCount: 0,
            totalCount: 0,
            _activePromise: null,
            _badgeHideTimer: null,

            normalizePath(src) {
                if (!src || typeof src !== 'string') return '';
                return src.trim().replace(/^\.\//, '').replace(/^\//, '');
            },

            resolve(src) {
                if (!src || typeof src !== 'string') return src;
                if (src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('http')) return src;
                const clean = this.normalizePath(src);
                if (clean && this.blobMap[clean]) {
                    return this.blobMap[clean];
                }
                return src;
            },

            getAllImageAssets() {
                const set = new Set();
                STATIC_IMAGE_ASSETS.forEach(p => {
                    const clean = this.normalizePath(p);
                    if (clean) set.add(clean);
                });
                if (typeof CHARACTER_DATA === 'object' && CHARACTER_DATA) {
                    Object.values(CHARACTER_DATA).forEach(c => {
                        if (!c) return;
                        [c.image, c.allImage, c.dieImage, c.chargedImage].forEach(p => {
                            const clean = this.normalizePath(p);
                            if (clean) set.add(clean);
                        });
                    });
                }
                if (typeof EXTRA_ICONS === 'object' && EXTRA_ICONS) {
                    Object.values(EXTRA_ICONS).forEach(item => {
                        if (!item || !item.image) return;
                        const clean = this.normalizePath(item.image);
                        if (clean) set.add(clean);
                    });
                }
                return Array.from(set);
            },

            updateProgressUI(doneCount, totalCount, finished = false) {
                const existing = document.getElementById('asset-preload-badge');
                if (finished) {
                    if (existing) {
                        existing.innerHTML = `<span class="text-emerald-300 font-bold">✅ 端末データ読込完了 (${totalCount}/${totalCount})</span>`;
                        if (this._badgeHideTimer) clearTimeout(this._badgeHideTimer);
                        this._badgeHideTimer = setTimeout(() => {
                            const el = document.getElementById('asset-preload-badge');
                            if (el) el.remove();
                        }, 1400);
                    }
                    return;
                }
                const pct = totalCount > 0 ? Math.min(100, Math.round((doneCount / totalCount) * 100)) : 0;
                let el = existing;
                if (!el && document.body) {
                    el = document.createElement('div');
                    el.id = 'asset-preload-badge';
                    el.className = 'fixed bottom-2 right-2 z-[9990] pointer-events-none bg-slate-950/95 border border-sky-400/80 text-sky-200 px-2.5 py-1.5 rounded-lg shadow-xl text-[10px] font-mono flex flex-col gap-1 min-w-[170px]';
                    document.body.appendChild(el);
                }
                if (el) {
                    el.innerHTML = `
                        <div class="flex items-center justify-between gap-2">
                            <span>📦 データ読込中</span>
                            <span class="text-amber-300 font-bold">${doneCount}/${totalCount} (${pct}%)</span>
                        </div>
                        <div class="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div class="h-full bg-emerald-400 transition-all duration-150" style="width:${pct}%"></div>
                        </div>
                    `;
                }
            },

            async fetchAssetToMemory(cleanPath, cacheStorage) {
                let response = null;
                const retryDelays = [0, 250, 650];
                for (let attempt = 0; attempt < retryDelays.length; attempt++) {
                    if (retryDelays[attempt] > 0) {
                        await new Promise(r => setTimeout(r, retryDelays[attempt]));
                    }
                    try {
                        const res = await fetch(cleanPath, { cache: 'no-cache', credentials: 'same-origin' });
                        if (res && res.ok) {
                            response = res;
                            break;
                        }
                    } catch (e) {}
                }

                if (response && cacheStorage) {
                    try {
                        await cacheStorage.put(cleanPath, response.clone());
                    } catch (e) {}
                } else if (!response && cacheStorage) {
                    try {
                        const cachedRes = await cacheStorage.match(cleanPath);
                        if (cachedRes && cachedRes.ok) {
                            response = cachedRes;
                        }
                    } catch (e) {}
                }

                if (response) {
                    try {
                        const blob = await response.blob();
                        if (blob && blob.size > 0) {
                            const newBlobUrl = URL.createObjectURL(blob);
                            this.blobMap[cleanPath] = newBlobUrl;
                        }
                    } catch (e) {}
                }

                const resolvedSrc = this.blobMap[cleanPath] || cleanPath;
                await new Promise((resolve) => {
                    const img = new Image();
                    let done = false;
                    const finish = (ok) => {
                        if (done) return;
                        done = true;
                        img.isLoaded = ok;
                        img.hasError = !ok;
                        if (ok && typeof CharacterRenderer !== 'undefined') {
                            CharacterRenderer.imageCache[cleanPath] = img;
                        }
                        resolve();
                    };
                    img.onload = async () => {
                        try {
                            if (typeof img.decode === 'function') {
                                await img.decode();
                            }
                        } catch (e) {}
                        finish(true);
                    };
                    img.onerror = () => finish(false);
                    img.src = resolvedSrc;
                    setTimeout(() => finish(!!img.complete && img.naturalWidth > 0), 4000);
                });
            },

            async cacheShellAssets(cacheStorage) {
                if (!cacheStorage) return;
                await Promise.all(SHELL_SITE_ASSETS.map(async (url) => {
                    try {
                        const res = await fetch(url, { cache: 'no-cache', credentials: 'same-origin' });
                        if (res && res.ok) {
                            await cacheStorage.put(url, res.clone());
                        }
                    } catch (e) {}
                }));
            },

            async preloadAll(opts = {}) {
                const { showBanner = true, forceRefresh = false } = opts || {};
                if (this._activePromise && !forceRefresh) {
                    return this._activePromise;
                }
                const run = (async () => {
                    this.isComplete = false;
                    let cacheStorage = null;
                    try {
                        if (typeof caches !== 'undefined' && caches.open) {
                            const keys = await caches.keys();
                            await Promise.all(keys.map(k => k !== ASSET_CACHE_NAME ? caches.delete(k) : Promise.resolve()));
                            cacheStorage = await caches.open(ASSET_CACHE_NAME);
                        }
                    } catch (e) {}

                    const allImages = this.getAllImageAssets();
                    this.totalCount = allImages.length;
                    this.loadedCount = 0;
                    if (showBanner) {
                        this.updateProgressUI(0, this.totalCount, false);
                    }

                    const shellPromise = this.cacheShellAssets(cacheStorage);
                    const queue = [...allImages];
                    const concurrency = 6;
                    const workers = Array.from({ length: Math.min(concurrency, Math.max(1, queue.length)) }, async () => {
                        while (queue.length > 0) {
                            const nextPath = queue.shift();
                            if (!nextPath) break;
                            await this.fetchAssetToMemory(nextPath, cacheStorage);
                            this.loadedCount++;
                            if (showBanner) {
                                this.updateProgressUI(this.loadedCount, this.totalCount, false);
                            }
                        }
                    });

                    await Promise.all([...workers, shellPromise]);
                    this.isComplete = true;
                    if (showBanner) {
                        this.updateProgressUI(this.totalCount, this.totalCount, true);
                    }
                    if (typeof renderNewBattleScreen === 'function' && typeof activeNewBattle !== 'undefined' && activeNewBattle) {
                        renderNewBattleScreen();
                    }
                })();

                this._activePromise = run;
                try {
                    await run;
                } finally {
                    if (this._activePromise === run) {
                        this._activePromise = null;
                    }
                }
                return true;
            },

            async ensureReady(maxWaitMs = 5000) {
                if (this.isComplete) return true;
                const p = this._activePromise || this.preloadAll({ showBanner: true });
                await Promise.race([
                    p,
                    new Promise(resolve => setTimeout(resolve, maxWaitMs))
                ]);
                return this.isComplete;
            }
        };
        window.AssetPreloader = AssetPreloader;
        window.resolveAssetSrc = (src) => AssetPreloader.resolve(src);

        class CharacterRenderer {
            // 4. 画像のキャッシュ管理用オブジェクト
            static imageCache = {};

            static getImage(src) {
                if (!src) return null;
                const cleanKey = AssetPreloader.normalizePath(src) || src;
                const cached = this.imageCache[cleanKey];
                if (cached && cached.hasError) {
                    delete this.imageCache[cleanKey];
                }
                if (!this.imageCache[cleanKey]) {
                    const img = new Image();
                    img.isLoaded = false;
                    img.hasError = false;
                    img.onload = () => { 
                        img.isLoaded = true;
                        img.hasError = false;
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
                            } else if ((id === 'header-profile-icon' || id === 'home-profile-icon' || id === 'new-battle-profile-icon' || id === 'friend-self-cvs') && typeof playerState !== 'undefined') {
                                CharacterRenderer.drawCharacter(cvs, playerState.selectedIcon || 'courtney');
                            } else if (id === 'profile-main-icon' && typeof playerState !== 'undefined') {
                                CharacterRenderer.drawCharacter(cvs, playerState.selectedIcon || 'courtney');
                            } else if ((id.startsWith('friend-item-cvs-') || id === 'friend-detail-cvs') && cvs.dataset && cvs.dataset.charId) {
                                CharacterRenderer.drawCharacter(cvs, cvs.dataset.charId);
                            } else if (id === 'zukan-detail-cvs') {
                                const currentDetailId = window.lastZukanDetailId || 'courtney';
                                CharacterRenderer.drawCharacter(cvs, currentDetailId);
                            } else if (id === 'gacha-reveal-cvs') {
                                const currentGachaId = window.lastGachaRevealId || 'courtney';
                                CharacterRenderer.drawCharacter(cvs, currentGachaId);
                            } else if (id === 'opp-profile-cvs') {
                                CharacterRenderer.drawCharacter(cvs, window.lastOppIcon || 'pasha');
                            } else if (id === 'p1-canvas' && typeof activeBattle !== 'undefined' && activeBattle && activeBattle.p1) {
                                const isCharged = (activeBattle.p1.id === 'courtney' && (activeBattle.p1.courtneyChargeCount || 0) > 0) || 
                                                  (activeBattle.p1.id === 'dopagaking' && (activeBattle.p1.dopaChargeCount || 0) > 0 && (activeBattle.p1.dopaChargeCount || 0) < 6) ||
                                                  ((activeBattle.p1.id === 'momopin' || activeBattle.p1.id === 'momo') && (activeBattle.p1.eggplantReady || activeBattle.p1.isMiniZou || activeBattle.p1Action === 'momo_prep'));
                                const renderId = (activeBattle.p1.id === 'dopagaking' && (activeBattle.p1.dopaChargeCount || 0) >= 6 && activeBattle.p1.selectedInheritChar) ? activeBattle.p1.selectedInheritChar : ((activeBattle.p1.id === 'pasha' && activeBattle.p1.isDarkMode) ? 'pasha_dark' : activeBattle.p1.id);
                                CharacterRenderer.drawCharacter(cvs, renderId, activeBattle.p1.isMiniZou, isCharged, activeBattle.p1.hp <= 0);
                            } else if (id === 'p2-canvas' && typeof activeBattle !== 'undefined' && activeBattle && activeBattle.p2) {
                                const isCharged = (activeBattle.p2.id === 'courtney' && (activeBattle.p2.courtneyChargeCount || 0) > 0) || 
                                                  (activeBattle.p2.id === 'dopagaking' && (activeBattle.p2.dopaChargeCount || 0) > 0 && (activeBattle.p2.dopaChargeCount || 0) < 6) ||
                                                  ((activeBattle.p2.id === 'momopin' || activeBattle.p2.id === 'momo') && (activeBattle.p2.eggplantReady || activeBattle.p2.isMiniZou || activeBattle.p2Action === 'momo_prep'));
                                const renderId = (activeBattle.p2.id === 'dopagaking' && (activeBattle.p2.dopaChargeCount || 0) >= 6 && activeBattle.p2.selectedInheritChar) ? activeBattle.p2.selectedInheritChar : ((activeBattle.p2.id === 'pasha' && activeBattle.p2.isDarkMode) ? 'pasha_dark' : activeBattle.p2.id);
                                CharacterRenderer.drawCharacter(cvs, renderId, activeBattle.p2.isMiniZou, isCharged, activeBattle.p2.hp <= 0);
                            }
                        });
                        if (typeof renderNewBattleScreen === 'function' && typeof activeNewBattle !== 'undefined' && activeNewBattle) {
                            renderNewBattleScreen();
                        }
                    };
                    img.onerror = () => { 
                        if (img.src && img.src.startsWith('blob:') && cleanKey && img.dataset.fallbackTried !== '1') {
                            img.dataset.fallbackTried = '1';
                            img.src = cleanKey;
                            return;
                        }
                        img.hasError = true; 
                    };
                    img.src = AssetPreloader.resolve(src);
                    this.imageCache[cleanKey] = img;
                }
                return this.imageCache[cleanKey];
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
                const isMomoId = (charId === 'momopin' || charId === 'momo');
                if (isMomoId && isCharged) {
                    targetCharId = charId;
                } else if (isMiniZou && !(CHARACTER_DATA[charId] && CHARACTER_DATA[charId].chargedImage)) {
                    targetCharId = 'minizou';
                }

                const charData = CHARACTER_DATA[targetCharId] || CHARACTER_DATA[charId] || (isMomoId ? (CHARACTER_DATA.momo || CHARACTER_DATA.momopin) : null) || EXTRA_ICONS[targetCharId] || EXTRA_ICONS[charId];
                let imagePath = null;
                if (charData) {
                    if (isBattleCanvas) {
                        if (isCharged && (charData.chargedImage || (isMomoId && 'momopin/momopinNASU.webp'))) {
                            imagePath = charData.chargedImage || 'momopin/momopinNASU.webp';
                        } else if (isDead && charData.dieImage) {
                            imagePath = charData.dieImage;
                        } else {
                            imagePath = charData.image;
                        }
                    } else {
                        if (isCharged && (charData.chargedImage || (isMomoId && 'momopin/momopinNASU.webp'))) {
                            imagePath = charData.chargedImage || 'momopin/momopinNASU.webp';
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

        function initBatteryManager() {}
        function updateBatteryDisplay() {}
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
                    <div class="text-center space-y-2.5 py-1">
                        <p class="text-[11px] text-slate-200 leading-normal font-mono">
                            ドパガキングダムへようこそ！<br>
                            まずはあなたのファイター名を登録してください。
                        </p>
                        <div class="text-left">
                            <label class="text-xs text-amber-300 font-bold block mb-1">あなたのファイター名を入力してください：</label>
                            <input id="first-name-input" type="text" value="${playerState.playerName || '名無しファイター'}" maxlength="12" onkeydown="if(event.key==='Enter'){event.preventDefault();completeFirstTimeSetup();}" class="pixel-box bg-slate-950 px-3 py-1.5 text-sm font-bold text-amber-300 w-full outline-none border-amber-600">
                        </div>
                    </div>
                `;
            }
            if (actionsEl) {
                actionsEl.innerHTML = `<button onclick="completeFirstTimeSetup()" class="pixel-btn pixel-btn-primary px-8 py-2 font-bold text-sm">名前を登録する ▶</button>`;
            }
            if (overlay) {
                overlay.classList.remove('hidden');
                document.body.classList.add('modal-open');
            }
        }

        async function completeFirstTimeSetup() {
            const input = document.getElementById('first-name-input');
            const rawName = input ? input.value.trim() : '';
            playerState.playerName = rawName ? rawName.slice(0, 12) : '名無しファイター';
            playerState.isFirstTime = false;
            playerState.dopa = 1000;
            playerState.unlockedChars = [];
            playerState.unlockedIcons = ['dopagaking'];
            playerState.selectedPlayerChar = null;
            playerState.lastSelectedChar = null;
            playerState.lastSelectedTeam = [null, null, null];
            playerState.selectedIcon = 'dopagaking';
            window.selectedNewBattleTeam = [null, null, null];
            window.selectedNewBattleChar = null;
            window.selectedOnlineMultiChar = null;
            try {
                localStorage.removeItem('dopa_last_selected_team');
                localStorage.removeItem('dopa_last_selected_char');
                localStorage.removeItem('dopa_online_multi_char');
            } catch(e){}
            await savePlayerState();
            renderHomeScreen();
            updateHeaderProfile();
            const dopaEl = document.getElementById('dopa-count');
            if (dopaEl) dopaEl.innerText = formatDopa(playerState.dopa);

            if (typeof audioSystem.playTitleSound === 'function') {
                audioSystem.playTitleSound();
            } else {
                audioSystem.playSelect();
            }

            const safeDisplayName = String(playerState.playerName)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const overlay = document.getElementById('modal-overlay');
            const actionsEl = document.getElementById('modal-actions');

            if (titleEl) titleEl.innerText = "🎁 1000 DOPA プレゼント！";
            if (bodyEl) {
                bodyEl.innerHTML = `
                    <div class="text-center space-y-3 py-1">
                        <p class="text-xs sm:text-sm text-emerald-300 font-bold font-mono">
                            ようこそ、<span class="text-amber-300">${safeDisplayName}</span> さん！
                        </p>
                        <div class="pixel-box bg-amber-950/70 border-2 border-amber-400 p-3 space-y-1.5 shadow-lg">
                            <p class="text-xs text-amber-300 font-bold font-pixel">🎉 新規プレイヤー特典 🎉</p>
                            <div class="text-xl sm:text-2xl font-black text-amber-300 font-pixel tracking-wider">+ 1,000 DOPA</div>
                            <p class="text-[11px] text-slate-200 leading-relaxed font-mono">
                                初回登録プレゼントとして <b class="text-amber-300">1000 DOPA</b> を贈りました！<br>
                                ガチャやストアでキャラクターをゲットしてバトルしよう！
                            </p>
                        </div>
                    </div>
                `;
            }
            if (actionsEl) {
                actionsEl.innerHTML = `<button onclick="audioSystem.playSelect(); closeModal();" class="pixel-btn pixel-btn-success px-8 py-2 font-bold text-sm">冒険へ出発！ ▶</button>`;
            }
            if (overlay) {
                overlay.classList.remove('hidden');
                document.body.classList.add('modal-open');
            }
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
                                     <img src="${resolveAssetSrc('images/title-1.webp')}" alt="DOPAGA KINGDOM" class="w-full max-w-lg sm:max-w-xl mx-auto object-contain mb-3">
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
            if (!playerState.playerId) {
                playerState.playerId = 'DP-' + Math.floor(1000 + Math.random() * 9000);
            }
            if (!playerState.startDate) {
                playerState.startDate = new Date().toLocaleDateString('ja-JP');
            }
            if (!Array.isArray(playerState.unlockedChars)) {
                playerState.unlockedChars = [];
            }
            if (!Array.isArray(playerState.unlockedIcons) || playerState.unlockedIcons.length === 0) {
                playerState.unlockedIcons = ['dopagaking'];
            }
            if (!playerState.selectedIcon) {
                playerState.selectedIcon = playerState.unlockedIcons[0] || 'dopagaking';
            }
            if (!playerState.playerName) {
                playerState.playerName = '名無しファイター';
            }
            if (typeof playerState.volume !== 'number') {
                playerState.volume = 0.5;
            }

            if (window.fbUser && window.fbDb) {
                try {
                    const userDocRef = window.fbDoc(window.fbDb, 'users', window.fbUser.uid);
                    const safePayload = JSON.parse(JSON.stringify({
                        dopa: typeof playerState.dopa === 'number' ? playerState.dopa : 1000,
                        unlockedChars: playerState.unlockedChars,
                        unlockedIcons: playerState.unlockedIcons,
                        playerName: playerState.playerName,
                        playerId: playerState.playerId,
                        startDate: playerState.startDate,
                        selectedIcon: playerState.selectedIcon,
                        skipOpening: !!playerState.skipOpening,
                        totalBattles: typeof playerState.totalBattles === 'number' ? playerState.totalBattles : 0,
                        wins: typeof playerState.wins === 'number' ? playerState.wins : 0,
                        losses: typeof playerState.losses === 'number' ? playerState.losses : 0,
                        charUsage: (playerState.charUsage && typeof playerState.charUsage === 'object') ? playerState.charUsage : {},
                        battleHistory: Array.isArray(playerState.battleHistory) ? playerState.battleHistory : [],
                        volume: playerState.volume,
                        updatedAt: Date.now()
                    }));
                    await window.fbSetDoc(userDocRef, safePayload, { merge: true });
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

            if (!playerState.playerId) {
                playerState.playerId = 'DP-' + Math.floor(1000 + Math.random() * 9000);
            }
            if (!playerState.startDate) {
                playerState.startDate = new Date().toLocaleDateString('ja-JP');
            }

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
            } else if (playerState.unlockedChars.length === 0) {
                playerState.selectedPlayerChar = null;
                playerState.lastSelectedChar = null;
                playerState.lastSelectedTeam = [null, null, null];
                window.selectedNewBattleChar = null;
                window.selectedNewBattleTeam = [null, null, null];
                window.selectedOnlineMultiChar = null;
            }
            if (!playerState.selectedIcon || !playerState.unlockedIcons.includes(playerState.selectedIcon)) {
                playerState.selectedIcon = playerState.unlockedIcons[0] || 'dopagaking';
            }
            const el = document.getElementById('dopa-count') || document.getElementById('home-dopa-count');
            if (el) el.innerText = formatDopa(playerState.dopa);
            const lastChar = getLastSelectedChar();
            window.selectedNewBattleChar = lastChar || null;
            updateHeaderProfile();
        }

        function getUnlockedCharIds() {
            const list = Array.isArray(playerState && playerState.unlockedChars) ? playerState.unlockedChars : [];
            const seen = new Set();
            return list.filter(id => {
                if (!id || seen.has(id)) return false;
                if (typeof CHARACTER_DATA !== 'undefined' && !CHARACTER_DATA[id]) return false;
                seen.add(id);
                return true;
            });
        }

        function showGachaRequiredModal(title, message) {
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const overlay = document.getElementById('modal-overlay');
            const actionsEl = document.getElementById('modal-actions');
            const safeMsg = String(message || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            if (titleEl) titleEl.innerText = title || '🎰 ガチャでキャラクターを入手しよう';
            if (bodyEl) {
                bodyEl.innerHTML = `<div class="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-mono text-center py-1">${safeMsg}</div>`;
            }
            if (actionsEl) {
                actionsEl.innerHTML = `
                    <button type="button" onclick="closeModal()" class="pixel-btn px-4 py-2 font-bold text-xs sm:text-sm">閉じる</button>
                    <button type="button" onclick="closeModal(); if (typeof openGachaModal === 'function') openGachaModal();" class="pixel-btn pixel-btn-warning px-5 py-2 font-bold text-xs sm:text-sm">🎰 ガチャを引く</button>
                `;
            }
            if (overlay) {
                overlay.classList.remove('hidden');
                document.body.classList.add('modal-open');
            }
        }

        function saveLastSelectedChar(charId) {
            if (!charId) return;
            const unlocked = getUnlockedCharIds();
            if (!unlocked.includes(charId)) return;
            window.selectedNewBattleChar = charId;
            playerState.selectedPlayerChar = charId;
            playerState.lastSelectedChar = charId;
            try {
                localStorage.setItem('dopa_last_selected_char', charId);
            } catch(e){}
            if (typeof savePlayerState === 'function') {
                savePlayerState();
            }
        }

        function getLastSelectedChar() {
            const unlocked = getUnlockedCharIds();
            if (unlocked.length === 0) {
                window.selectedNewBattleChar = null;
                return null;
            }
            const unlockedSet = new Set(unlocked);
            if (window.selectedNewBattleChar && unlockedSet.has(window.selectedNewBattleChar)) {
                return window.selectedNewBattleChar;
            }
            let stored = null;
            try {
                stored = localStorage.getItem('dopa_last_selected_char');
            } catch(e){}
            if (stored && unlockedSet.has(stored)) {
                window.selectedNewBattleChar = stored;
                return stored;
            }
            if (playerState.lastSelectedChar && unlockedSet.has(playerState.lastSelectedChar)) {
                window.selectedNewBattleChar = playerState.lastSelectedChar;
                return playerState.lastSelectedChar;
            }
            if (playerState.selectedPlayerChar && unlockedSet.has(playerState.selectedPlayerChar)) {
                window.selectedNewBattleChar = playerState.selectedPlayerChar;
                return playerState.selectedPlayerChar;
            }
            window.selectedNewBattleChar = unlocked[0];
            return unlocked[0];
        }

        window.getUnlockedCharIds = getUnlockedCharIds;
        window.showGachaRequiredModal = showGachaRequiredModal;
        window.saveLastSelectedChar = saveLastSelectedChar;
        window.getLastSelectedChar = getLastSelectedChar;

        function getSelectedNewBattleTeam() {
            const unlocked = getUnlockedCharIds();
            const unlockedSet = new Set(unlocked);
            if (unlocked.length === 0) {
                window.selectedNewBattleTeam = [null, null, null];
                return [null, null, null];
            }

            let raw = null;
            if (Array.isArray(window.selectedNewBattleTeam) && window.selectedNewBattleTeam.length === 3) {
                raw = window.selectedNewBattleTeam;
            }
            if (!Array.isArray(raw)) {
                try {
                    const stored = localStorage.getItem('dopa_last_selected_team');
                    if (stored) raw = JSON.parse(stored);
                } catch(e) {}
            }
            if (!Array.isArray(raw) && Array.isArray(playerState.lastSelectedTeam)) {
                raw = playerState.lastSelectedTeam;
            }
            const team = [null, null, null];
            if (Array.isArray(raw)) {
                const seen = new Set();
                for (let i = 0; i < 3; i++) {
                    const id = raw[i];
                    if (id && unlockedSet.has(id) && !seen.has(id)) {
                        team[i] = id;
                        seen.add(id);
                    }
                }
            }
            if (!team[0] && !team[1] && !team[2]) {
                const lastChar = getLastSelectedChar();
                if (lastChar && unlockedSet.has(lastChar)) {
                    team[0] = lastChar;
                } else if (unlocked[0]) {
                    team[0] = unlocked[0];
                }
            }
            window.selectedNewBattleTeam = team;
            return [...team];
        }

        function saveSelectedNewBattleTeam(team) {
            const unlockedSet = new Set(getUnlockedCharIds());
            const seen = new Set();
            const normalized = [0, 1, 2].map(i => {
                const id = Array.isArray(team) ? team[i] : null;
                if (id && unlockedSet.has(id) && (typeof CHARACTER_DATA === 'undefined' || CHARACTER_DATA[id]) && !seen.has(id)) {
                    seen.add(id);
                    return id;
                }
                return null;
            });
            window.selectedNewBattleTeam = normalized;
            playerState.lastSelectedTeam = [...normalized];
            if (normalized[0]) {
                window.selectedNewBattleChar = normalized[0];
                playerState.selectedPlayerChar = normalized[0];
                playerState.lastSelectedChar = normalized[0];
                try {
                    localStorage.setItem('dopa_last_selected_char', normalized[0]);
                } catch(e) {}
            } else {
                window.selectedNewBattleChar = null;
                if (unlockedSet.size === 0) {
                    playerState.selectedPlayerChar = null;
                    playerState.lastSelectedChar = null;
                }
                try {
                    localStorage.removeItem('dopa_last_selected_char');
                } catch(e) {}
            }
            try {
                localStorage.setItem('dopa_last_selected_team', JSON.stringify(normalized));
            } catch(e) {}
            if (typeof savePlayerState === 'function') {
                savePlayerState();
            }
            return normalized;
        }

        function getActiveTeamSlotIndex() {
            const team = getSelectedNewBattleTeam();
            if (typeof window.activeTeamSlotIndex === 'number' && window.activeTeamSlotIndex >= 0 && window.activeTeamSlotIndex < 3) {
                return window.activeTeamSlotIndex;
            }
            const firstEmpty = team.indexOf(null);
            window.activeTeamSlotIndex = firstEmpty !== -1 ? firstEmpty : 0;
            return window.activeTeamSlotIndex;
        }

        function validateCharCustomStats(charId) {
            if (['dopagaking', 'courtney', 'pasha_dark'].includes(charId)) return true;
            if (typeof getNewBattleCustomStats !== 'function') return true;
            const cust = getNewBattleCustomStats(charId);
            const total = cust.hp + cust.atk + cust.def + cust.critRate + cust.eva;
            const cName = (typeof CHARACTER_DATA !== 'undefined' && CHARACTER_DATA[charId]) ? CHARACTER_DATA[charId].name : charId;
            if (cust.atk > 45) {
                showModal('攻撃力オーバー', `${cName} の攻撃力は最大45までです（現在: ${cust.atk}）。詳細画面で45以下に調整してください！`);
                return false;
            }
            if (total > 240) {
                showModal('ポイント超過', `${cName} のステータスポイント合計が240ポイントを超えています（現在: ${total}Pt）。詳細画面で240ポイント以下に調整してください！`);
                return false;
            }
            return true;
        }

        function setActiveTeamSlotIndex(slotIdx, sortOrder = 'default', sortDir = 'desc', onlyOwned = false, isOnline = false) {
            audioSystem.playSelect();
            window.activeTeamSlotIndex = Math.max(0, Math.min(2, slotIdx));
            renderNewBattleCharSelectScreen(sortOrder, sortDir, onlyOwned, isOnline);
        }

        function assignNewBattleTeamSlot(slotIdx, charId) {
            const unlocked = getUnlockedCharIds();
            if (!unlocked.includes(charId)) {
                showGachaRequiredModal('未解放キャラクター', 'このキャラクターはまだ所持していません。ガチャで解放してください！');
                return getSelectedNewBattleTeam();
            }
            const team = getSelectedNewBattleTeam();
            const targetIdx = (typeof slotIdx === 'number' && slotIdx >= 0 && slotIdx < 3) ? slotIdx : getActiveTeamSlotIndex();
            const existingIdx = team.indexOf(charId);
            if (existingIdx !== -1 && existingIdx !== targetIdx) {
                team[existingIdx] = team[targetIdx];
            }
            team[targetIdx] = charId;
            const saved = saveSelectedNewBattleTeam(team);
            const nextEmpty = saved.indexOf(null);
            window.activeTeamSlotIndex = nextEmpty !== -1 ? nextEmpty : targetIdx;
            return saved;
        }

        function clearNewBattleTeamSlot(slotIdx, sortOrder = 'default', sortDir = 'desc', onlyOwned = false, isOnline = false) {
            audioSystem.playSelect();
            const team = getSelectedNewBattleTeam();
            if (slotIdx >= 0 && slotIdx < 3) {
                team[slotIdx] = null;
                saveSelectedNewBattleTeam(team);
                window.activeTeamSlotIndex = slotIdx;
            }
            renderNewBattleCharSelectScreen(sortOrder, sortDir, onlyOwned, isOnline);
        }

        function clearAllNewBattleTeam(sortOrder = 'default', sortDir = 'desc', onlyOwned = false, isOnline = false) {
            audioSystem.playSelect();
            saveSelectedNewBattleTeam([null, null, null]);
            window.activeTeamSlotIndex = 0;
            renderNewBattleCharSelectScreen(sortOrder, sortDir, onlyOwned, isOnline);
        }

        function toggleNewBattleTeamChar(charId, sortOrder = 'default', sortDir = 'desc', onlyOwned = false, isOnline = false) {
            audioSystem.playSelect();
            if (!getUnlockedCharIds().includes(charId)) {
                showGachaRequiredModal('未解放キャラクター', 'このキャラクターはまだ所持していません。ガチャで解放してください！');
                return;
            }
            const team = getSelectedNewBattleTeam();
            const existingIdx = team.indexOf(charId);
            if (existingIdx !== -1) {
                team[existingIdx] = null;
                saveSelectedNewBattleTeam(team);
                window.activeTeamSlotIndex = existingIdx;
            } else {
                if (!validateCharCustomStats(charId)) return;
                const activeSlot = getActiveTeamSlotIndex();
                assignNewBattleTeamSlot(activeSlot, charId);
            }
            renderNewBattleCharSelectScreen(sortOrder, sortDir, onlyOwned, isOnline);
        }

        function autoFillNewBattleTeam(sortOrder = 'default', sortDir = 'desc', onlyOwned = false, isOnline = false) {
            audioSystem.playSelect();
            const unlocked = getUnlockedCharIds();
            const unlockedSet = new Set(unlocked);

            if (unlocked.length === 0) {
                saveSelectedNewBattleTeam([null, null, null]);
                window.activeTeamSlotIndex = 0;
                renderNewBattleCharSelectScreen(sortOrder, sortDir, onlyOwned, isOnline);
                showGachaRequiredModal('ガチャ未実施（未所持）', '所持しているキャラクターがいません！\n「おまかせ」編成や3対3バトルへの参加には、ガチャを引いてキャラクターを手に入れる必要があります。');
                return;
            }

            const team = getSelectedNewBattleTeam().map(id => (id && unlockedSet.has(id)) ? id : null);
            const allFull = team.every(Boolean);
            const nextTeam = allFull ? [null, null, null] : [...team];

            const pickRandomFrom = (pool, excludeSet) => {
                const candidates = pool.filter(id => unlockedSet.has(id) && !excludeSet.has(id));
                if (candidates.length === 0) return null;
                return candidates[Math.floor(Math.random() * candidates.length)];
            };

            const used = new Set(nextTeam.filter(Boolean));
            for (let i = 0; i < 3; i++) {
                if (!nextTeam[i]) {
                    const chosen = pickRandomFrom(unlocked, used);
                    if (chosen) {
                        nextTeam[i] = chosen;
                        used.add(chosen);
                    }
                }
            }
            saveSelectedNewBattleTeam(nextTeam);
            window.activeTeamSlotIndex = 0;
            renderNewBattleCharSelectScreen(sortOrder, sortDir, onlyOwned, isOnline);

            if (unlocked.length < 3) {
                const filledCount = nextTeam.filter(Boolean).length;
                showGachaRequiredModal('所持キャラクター不足', `所持しているキャラクター（${unlocked.length}体）のみでおまかせ編成しました（${filledCount}/3体）。\n3対3バトルに参加するには、ガチャを引いてキャラクターを3体以上集めてください！`);
            }
        }

        function startSelectedNewBattleTeam(isOnline = false) {
            audioSystem.playSelect();
            const unlocked = getUnlockedCharIds();
            const unlockedSet = new Set(unlocked);

            if (unlocked.length === 0) {
                saveSelectedNewBattleTeam([null, null, null]);
                showGachaRequiredModal('ガチャ未実施（参加不可）', '所持しているキャラクターがいないためバトルに参加できません！\nまずはガチャを引いてキャラクターを3体以上手に入れてください。');
                return;
            }
            if (unlocked.length < 3) {
                showGachaRequiredModal('所持キャラクター不足（参加不可）', `3対3バトルに参加するには、所持キャラクターが3体以上必要です！（現在 ${unlocked.length}/3 体所持）\nガチャを引いてキャラクターを増やしてください。`);
                return;
            }

            const rawTeam = getSelectedNewBattleTeam();
            const team = rawTeam.map(id => (id && unlockedSet.has(id)) ? id : null);
            if (team.some((id, idx) => id !== rawTeam[idx])) {
                saveSelectedNewBattleTeam(team);
                renderNewBattleCharSelectScreen('default', 'desc', false, isOnline);
            }

            const selectedCount = team.filter(Boolean).length;
            if (selectedCount < 3) {
                showModal('味方チーム未完了', `味方チームの所持キャラクターを3体選択してください！（現在 ${selectedCount}/3 体選択中）\n\n各キャラクターの「+ 編成」ボタン、詳細画面、または上部の「🎲 おまかせ」から3体を選べます。`);
                return;
            }
            for (let i = 0; i < 3; i++) {
                if (!team[i] || !unlockedSet.has(team[i])) {
                    showGachaRequiredModal('未解放キャラクター', '未所持のキャラクターが含まれているためバトルに参加できません！');
                    return;
                }
                if (!validateCharCustomStats(team[i])) return;
            }
            if (isOnline) {
                window.pendingOnline2pTeam = [...team];
                saveSelectedNewBattleTeam(team);
                renderOnlineMatchmakingScreen('2p');
            } else {
                const allIds = Object.keys(CHARACTER_DATA);
                const otherIds = allIds.filter(id => id !== team[0]);
                const eChar = otherIds[Math.floor(Math.random() * otherIds.length)] || 'pasha';
                startNewBattleMode(team, eChar);
            }
        }

        window.getSelectedNewBattleTeam = getSelectedNewBattleTeam;
        window.saveSelectedNewBattleTeam = saveSelectedNewBattleTeam;
        window.getActiveTeamSlotIndex = getActiveTeamSlotIndex;
        window.setActiveTeamSlotIndex = setActiveTeamSlotIndex;
        window.assignNewBattleTeamSlot = assignNewBattleTeamSlot;
        window.clearNewBattleTeamSlot = clearNewBattleTeamSlot;
        window.clearAllNewBattleTeam = clearAllNewBattleTeam;
        window.toggleNewBattleTeamChar = toggleNewBattleTeamChar;
        window.autoFillNewBattleTeam = autoFillNewBattleTeam;
        window.startSelectedNewBattleTeam = startSelectedNewBattleTeam;
        window.validateCharCustomStats = validateCharCustomStats;

        window.onlineBattleConfig = window.onlineBattleConfig || {
            matchMode: '2p',
            allyHumanCount: 1,
            enemyHumanCount: 1,
            allySlots: ['human', 'human', 'bot'],
            enemySlots: ['human', 'human', 'bot']
        };

        function normalizeTeamSlots(slots, humanCount, lockFirstHuman = false) {
            if (Array.isArray(slots) && slots.length === 3) {
                const res = slots.map(s => (s === 'bot' ? 'bot' : 'human'));
                if (lockFirstHuman) res[0] = 'human';
                return res;
            }
            const count = Math.max(lockFirstHuman ? 1 : 0, Math.min(3, parseInt(humanCount, 10) || (lockFirstHuman ? 2 : 2)));
            return [0, 1, 2].map(i => (i < count ? 'human' : 'bot'));
        }

        function getOnlineBattleConfig() {
            const raw = window.onlineBattleConfig || {};
            const matchMode = raw.matchMode === 'multi' ? 'multi' : '2p';
            if (matchMode === '2p') {
                return {
                    matchMode: '2p',
                    allyHumanCount: 1,
                    enemyHumanCount: 1,
                    allyBotCount: 0,
                    enemyBotCount: 0,
                    allySlots: ['human', 'human', 'human'],
                    enemySlots: ['human', 'human', 'human'],
                    totalHumans: 2,
                    controlSingleAllyOnly: false,
                    isOnlineBattleMode: true
                };
            }
            const allySlots = normalizeTeamSlots(raw.allySlots, raw.allyHumanCount, true);
            const enemySlots = normalizeTeamSlots(raw.enemySlots, raw.enemyHumanCount, false);
            const allyHumanCount = allySlots.filter(s => s === 'human').length;
            const enemyHumanCount = enemySlots.filter(s => s === 'human').length;
            return {
                matchMode: 'multi',
                allyHumanCount,
                enemyHumanCount,
                allyBotCount: 3 - allyHumanCount,
                enemyBotCount: 3 - enemyHumanCount,
                allySlots,
                enemySlots,
                totalHumans: allyHumanCount + enemyHumanCount,
                controlSingleAllyOnly: true,
                isOnlineBattleMode: true
            };
        }

        function setOnlineMatchFormat(matchMode = 'multi', allyHumanCount = 2, enemyHumanCount = 2, customAllySlots = null, customEnemySlots = null) {
            audioSystem.playSelect();
            const allySlots = normalizeTeamSlots(customAllySlots, allyHumanCount, true);
            const enemySlots = normalizeTeamSlots(customEnemySlots, enemyHumanCount, false);
            window.onlineBattleConfig = {
                matchMode: 'multi',
                allyHumanCount: allySlots.filter(s => s === 'human').length,
                enemyHumanCount: enemySlots.filter(s => s === 'human').length,
                allySlots,
                enemySlots
            };
            renderOnlineModesScreen();
        }

        function toggleOnlineTeamSlot(side, slotIdx) {
            if (side === 'ally' && slotIdx === 0) return;
            if (slotIdx < 0 || slotIdx > 2) return;
            audioSystem.playSelect();
            const cfg = getOnlineBattleConfig();
            const allySlots = [...cfg.allySlots];
            const enemySlots = [...cfg.enemySlots];
            if (side === 'ally') {
                allySlots[slotIdx] = allySlots[slotIdx] === 'human' ? 'bot' : 'human';
            } else {
                enemySlots[slotIdx] = enemySlots[slotIdx] === 'human' ? 'bot' : 'human';
            }
            window.onlineBattleConfig = {
                matchMode: 'multi',
                allyHumanCount: allySlots.filter(s => s === 'human').length,
                enemyHumanCount: enemySlots.filter(s => s === 'human').length,
                allySlots,
                enemySlots
            };
            renderOnlineModesScreen();
        }

        function getSelectedOnlineMultiChar() {
            const unlocked = getUnlockedCharIds();
            if (unlocked.length === 0) {
                window.selectedOnlineMultiChar = null;
                return null;
            }
            let charId = window.selectedOnlineMultiChar;
            if (!charId) {
                try {
                    charId = localStorage.getItem('dopa_online_multi_char');
                } catch(e) {}
            }
            if (!charId || !unlocked.includes(charId)) {
                const last = getLastSelectedChar();
                charId = (last && unlocked.includes(last)) ? last : unlocked[0];
            }
            window.selectedOnlineMultiChar = charId;
            return charId;
        }

        function saveSelectedOnlineMultiChar(charId) {
            if (!charId || (typeof CHARACTER_DATA !== 'undefined' && !CHARACTER_DATA[charId])) return null;
            window.selectedOnlineMultiChar = charId;
            saveLastSelectedChar(charId);
            try {
                localStorage.setItem('dopa_online_multi_char', charId);
            } catch(e) {}
            return charId;
        }

        function selectOnlineMultiChar(charId, sortOrder = 'default', sortDir = 'desc', onlyOwned = false) {
            audioSystem.playSelect();
            if (!playerState.unlockedChars.includes(charId)) {
                showModal('未解放キャラクター', 'このキャラクターはまだ所持していません。ガチャで解放してください！');
                return false;
            }
            if (!validateCharCustomStats(charId)) return false;
            saveSelectedOnlineMultiChar(charId);
            renderNewBattleCharSelectScreen(sortOrder, sortDir, onlyOwned, true);
            return true;
        }

        function startSelectedOnlineMultiChar() {
            audioSystem.playSelect();
            const selectedCharId = getSelectedOnlineMultiChar();
            if (!selectedCharId || !CHARACTER_DATA[selectedCharId]) {
                showModal('キャラクター未選択', 'バトルで操作するキャラクターを1体選択してください！');
                return;
            }
            if (!playerState.unlockedChars.includes(selectedCharId)) {
                showModal('未解放キャラクター', '所持しているキャラクターから1体選択してください！');
                return;
            }
            if (!validateCharCustomStats(selectedCharId)) return;
            renderOnlineModesScreen();
        }

        function buildOnlineCharConfig(charId) {
            const safeId = (charId && CHARACTER_DATA[charId]) ? charId : 'asaiomizu';
            let customStats = null;
            if (!['dopagaking', 'courtney', 'pasha_dark'].includes(safeId)) {
                const cust = typeof getNewBattleCustomStats === 'function' ? getNewBattleCustomStats(safeId) : null;
                if (cust) {
                    customStats = {
                        hp: cust.hp,
                        atk: cust.atk,
                        def: cust.def,
                        critRate: cust.critRate,
                        eva: cust.eva
                    };
                }
            }
            return { charId: safeId, customStats };
        }

        window._onlineLobbyState = window._onlineLobbyState || {
            unsub: null,
            heartbeatId: null,
            launchTimeoutId: null,
            roomId: null,
            launchedRoomId: null,
            isSoloLocal: false,
            soloRoomData: null,
            latestRoomData: null,
            selectedMoveUid: null,
            drawLobbyViewFn: null,
            waitStartAt: 0,
            waitTimerId: null
        };

        function cleanupOnlineLobby() {
            const st = window._onlineLobbyState;
            if (st.unsub) {
                try { st.unsub(); } catch (e) {}
                st.unsub = null;
            }
            if (st.heartbeatId) {
                clearInterval(st.heartbeatId);
                st.heartbeatId = null;
            }
            if (st.waitTimerId) {
                clearInterval(st.waitTimerId);
                st.waitTimerId = null;
            }
            if (st.launchTimeoutId) {
                clearTimeout(st.launchTimeoutId);
                st.launchTimeoutId = null;
            }
            st.roomId = null;
            st.launchedRoomId = null;
            st.isSoloLocal = false;
            st.soloRoomData = null;
            st.latestRoomData = null;
            st.selectedMoveUid = null;
            st.drawLobbyViewFn = null;
            if (typeof closeOnlineLobbyCharDetailModal === 'function') {
                closeOnlineLobbyCharDetailModal();
            }
        }

        function setOnlineMatchStatus(msg, colorClass = 'text-amber-300') {
            const el = document.getElementById('online-match-status-msg');
            if (el) {
                el.className = `text-xs font-mono text-center min-h-[20px] ${colorClass}`;
                el.innerText = msg;
            }
        }

        function generateSixDigitRoomCode() {
            return String(Math.floor(100000 + Math.random() * 900000));
        }

        function pickUniqueCharId(excludeSet, preferredPool = []) {
            const allIds = typeof CHARACTER_DATA !== 'undefined' ? Object.keys(CHARACTER_DATA) : ['asaiomizu', 'pasha', 'courtney', 'ndaihyo', 'iwaba', 'momo', 'moenan', 'dopagaking'];
            const seenExclude = excludeSet instanceof Set ? excludeSet : new Set(excludeSet || []);
            if (Array.isArray(preferredPool) && preferredPool.length > 0) {
                const prefCandidates = preferredPool.filter(id => id && CHARACTER_DATA[id] && !seenExclude.has(id));
                if (prefCandidates.length > 0) {
                    return prefCandidates[Math.floor(Math.random() * prefCandidates.length)];
                }
            }
            const candidates = allIds.filter(id => !seenExclude.has(id));
            if (candidates.length > 0) {
                return candidates[Math.floor(Math.random() * candidates.length)];
            }
            return allIds[0] || 'pasha';
        }

        function getTeamCharIdsExceptSlot(teamSlots, excludeSlotIdx = -1) {
            const set = new Set();
            (teamSlots || []).forEach((s, idx) => {
                if (idx === excludeSlotIdx) return;
                const cid = s && s.charConfig && s.charConfig.charId;
                if (cid && CHARACTER_DATA[cid]) set.add(cid);
            });
            return set;
        }

        function deduplicateTeamSlots(teamSlots, teamLabel = '味方', options = {}) {
            const fillEmptyHumansAsBots = !!options.fillEmptyHumansAsBots;
            const src = [0, 1, 2].map(i => (teamSlots && teamSlots[i]) ? { ...teamSlots[i] } : { type: 'bot', uid: null, playerName: `${teamLabel}BOT ${i + 1}`, selectedIcon: 'pasha', charConfig: null, ready: true, lastSeen: Date.now() });
            const used = new Set();
            const result = [null, null, null];

            // Pass 1: Keep active human slots first (with valid unique charConfig)
            src.forEach((s, idx) => {
                const isActiveHuman = s && s.type === 'human' && !!s.uid;
                if (!isActiveHuman) return;
                let cid = (s.charConfig && s.charConfig.charId && CHARACTER_DATA[s.charConfig.charId]) ? s.charConfig.charId : null;
                let customStats = (s.charConfig && s.charConfig.customStats) ? s.charConfig.customStats : null;
                if (!cid || used.has(cid)) {
                    cid = pickUniqueCharId(used);
                    customStats = null;
                }
                used.add(cid);
                result[idx] = { ...s, charConfig: { charId: cid, customStats } };
            });

            // Pass 2: Assign BOT slots (and empty human slots) keeping every character unique
            src.forEach((s, idx) => {
                if (result[idx]) return;
                if (s && s.type === 'human' && !s.uid && !fillEmptyHumansAsBots) {
                    result[idx] = { ...s };
                    return;
                }
                const existingCid = (s && s.charConfig && s.charConfig.charId && CHARACTER_DATA[s.charConfig.charId]) ? s.charConfig.charId : null;
                const botCharId = (existingCid && !used.has(existingCid)) ? existingCid : pickUniqueCharId(used);
                used.add(botCharId);
                result[idx] = {
                    ...(s || {}),
                    type: 'bot',
                    uid: null,
                    playerName: (s && s.playerName) ? s.playerName : `${teamLabel}BOT ${idx + 1}`,
                    selectedIcon: botCharId,
                    charConfig: { charId: botCharId, customStats: null },
                    ready: true,
                    lastSeen: (s && s.lastSeen) || Date.now()
                };
            });

            return result;
        }

        function createMultiInitialSlots(allySlotTypes, enemySlotTypes, hostCharConfig, hostUid, hostName, hostIcon) {
            const t1Used = new Set();
            if (hostCharConfig && hostCharConfig.charId) t1Used.add(hostCharConfig.charId);
            const t2Used = new Set();

            const t1 = (allySlotTypes || ['human', 'human', 'bot']).map((type, idx) => {
                if (idx === 0) {
                    const hostPid = (typeof playerState !== 'undefined' && playerState.playerId) ? playerState.playerId : null;
                    return {
                        type: 'human',
                        uid: hostUid,
                        originalUid: hostUid,
                        playerId: hostPid,
                        originalPlayerId: hostPid,
                        playerName: hostName,
                        originalPlayerName: hostName,
                        selectedIcon: hostIcon,
                        charConfig: hostCharConfig,
                        ready: false,
                        lastSeen: Date.now()
                    };
                }
                if (type === 'bot') {
                    const botCharId = pickUniqueCharId(t1Used);
                    t1Used.add(botCharId);
                    return {
                        type: 'bot',
                        uid: null,
                        playerName: `味方BOT ${idx + 1}`,
                        selectedIcon: botCharId,
                        charConfig: { charId: botCharId, customStats: null },
                        ready: true,
                        lastSeen: Date.now()
                    };
                }
                return {
                    type: 'human',
                    uid: null,
                    playerName: '',
                    selectedIcon: 'courtney',
                    charConfig: null,
                    ready: false,
                    lastSeen: 0
                };
            });

            const t2 = (enemySlotTypes || ['human', 'human', 'bot']).map((type, idx) => {
                if (type === 'bot') {
                    const botCharId = pickUniqueCharId(t2Used);
                    t2Used.add(botCharId);
                    return {
                        type: 'bot',
                        uid: null,
                        playerName: `敵BOT ${idx + 1}`,
                        selectedIcon: botCharId,
                        charConfig: { charId: botCharId, customStats: null },
                        ready: true,
                        lastSeen: Date.now()
                    };
                }
                return {
                    type: 'human',
                    uid: null,
                    playerName: '',
                    selectedIcon: 'courtney',
                    charConfig: null,
                    ready: false,
                    lastSeen: 0
                };
            });

            return { t1, t2 };
        }

        function countHumanSlotStats(roomData) {
            const allSlots = [...(roomData.team1Slots || []), ...(roomData.team2Slots || [])];
            const humanSlots = allSlots.filter(s => s && s.type === 'human');
            const joined = humanSlots.filter(s => !!s.uid);
            const ready = joined.filter(s => !!s.ready);
            return {
                requiredHumans: humanSlots.length,
                joinedHumans: joined.length,
                readyHumans: ready.length,
                allJoined: humanSlots.length > 0 && joined.length === humanSlots.length,
                allReady: humanSlots.length > 0 && joined.length === humanSlots.length && ready.length === humanSlots.length
            };
        }

        function findMySlotInRoom(roomData, myUid) {
            const t1 = roomData.team1Slots || [];
            for (let i = 0; i < t1.length; i++) {
                if (t1[i] && t1[i].uid === myUid) return { teamNum: 1, slotIdx: i, slot: t1[i] };
            }
            const t2 = roomData.team2Slots || [];
            for (let i = 0; i < t2.length; i++) {
                if (t2[i] && t2[i].uid === myUid) return { teamNum: 2, slotIdx: i, slot: t2[i] };
            }
            return null;
        }

        function findMyRejoinableSlotInRoom(roomData, candidateUids = [], playerId = null) {
            const teams = [
                { teamNum: 1, arr: roomData.team1Slots || [] },
                { teamNum: 2, arr: roomData.team2Slots || [] }
            ];
            for (let cIdx = 0; cIdx < candidateUids.length; cIdx++) {
                const cand = candidateUids[cIdx];
                if (!cand) continue;
                for (let t = 0; t < teams.length; t++) {
                    const { teamNum, arr } = teams[t];
                    for (let i = 0; i < arr.length; i++) {
                        const s = arr[i];
                        if (s && (s.uid === cand || s.originalUid === cand)) {
                            return { teamNum, slotIdx: i, slot: s };
                        }
                    }
                }
            }
            if (playerId) {
                for (let t = 0; t < teams.length; t++) {
                    const { teamNum, arr } = teams[t];
                    for (let i = 0; i < arr.length; i++) {
                        const s = arr[i];
                        if (s && (s.playerId === playerId || s.originalPlayerId === playerId)) {
                            return { teamNum, slotIdx: i, slot: s };
                        }
                    }
                }
            }
            return null;
        }

        function proceedFromMultiSetupToMatchmaking() {
            renderOnlineModesScreen();
        }

        function renderOnlineMatchmakingScreen(mode = 'multi') {
            renderOnlineModesScreen();
        }

        function fallbackLaunchBotFromMatchmaking(mode) {
            audioSystem.playSelect();
            cleanupOnlineLobby();
            const unlocked = getUnlockedCharIds();
            if (mode === '2p') {
                if (unlocked.length < 3) {
                    showGachaRequiredModal('所持キャラクター不足', `3対3バトルに参加するには、所持キャラクターが3体以上必要です！（現在 ${unlocked.length}/3 体所持）\nガチャを引いてキャラクターを増やしてください。`);
                    return;
                }
                const rawTeam = window.pendingOnline2pTeam || getSelectedNewBattleTeam();
                const team = rawTeam.filter(id => id && unlocked.includes(id));
                if (team.length < 3) {
                    showModal('味方チーム未完了', '所持しているキャラクターから3体選択してください！');
                    return;
                }
                const allIds = Object.keys(CHARACTER_DATA);
                const otherIds = allIds.filter(id => id !== team[0]);
                const eChar = otherIds[Math.floor(Math.random() * otherIds.length)] || 'pasha';
                startOnlineBattleMode(team, eChar, { matchMode: '2p', controlSingleAllyOnly: false, isOnlineBattleMode: true });
            } else {
                const cfg = getOnlineBattleConfig();
                const charId = getSelectedOnlineMultiChar();
                if (!charId || !unlocked.includes(charId)) {
                    showGachaRequiredModal('ガチャ未実施（参加不可）', '所持しているキャラクターがいないためバトルに参加できません！\nまずはガチャを引いてキャラクターを入手してください。');
                    return;
                }
                const allIds = Object.keys(CHARACTER_DATA);
                const otherIds = allIds.filter(id => id !== charId);
                const eChar = otherIds[Math.floor(Math.random() * otherIds.length)] || 'pasha';
                startOnlineBattleMode(charId, eChar, { ...cfg, isOnlineBattleMode: true });
            }
        }

        function startSoloMultiReadyLobby() {
            audioSystem.playSelect();
            cleanupOnlineLobby();
            const cfg = getOnlineBattleConfig();
            const myUid = window.getOnlineClientId();
            const myName = playerState.playerName || '名無しファイター';
            const myIcon = playerState.selectedIcon || 'courtney';
            const myChar = buildOnlineCharConfig(getSelectedOnlineMultiChar());
            const { t1, t2 } = createMultiInitialSlots(cfg.allySlots, cfg.enemySlots, myChar, myUid, myName, myIcon);
            const roomData = {
                roomId: 'LOCAL_SOLO',
                roomCode: null,
                mode: 'multi',
                matchType: 'solo',
                status: 'preparing',
                hostUid: myUid,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                team1Slots: t1,
                team2Slots: t2
            };
            window._onlineLobbyState.isSoloLocal = true;
            window._onlineLobbyState.soloRoomData = roomData;
            renderOnlineMultiReadyScreen('LOCAL_SOLO', roomData);
        }

        async function createOnlineCodeRoom(mode = 'multi', inviteFriendId = null, inviteFriendName = '') {
            audioSystem.playSelect();
            setOnlineMatchStatus('🔑 ルームコードを発行中...', 'text-amber-300 font-bold');

            await window.initFirebaseOnline();
            if (!window.fbDb || !window.fbSetDoc) {
                if (inviteFriendId) {
                    showModal('接続エラー', 'オンラインサーバーに接続できませんでした。');
                } else {
                    setOnlineMatchStatus('⚠️ オンラインサーバーに接続できませんでした。', 'text-red-400 font-bold');
                }
                return;
            }

            const myUid = window.getOnlineClientId();
            const myPlayerId = (typeof playerState !== 'undefined' && playerState.playerId) ? playerState.playerId : null;
            const myName = playerState.playerName || '名無しファイター';
            const myIcon = playerState.selectedIcon || 'courtney';
            const roomCode = generateSixDigitRoomCode();
            const newRoomId = 'code_' + roomCode + '_' + Date.now().toString(36);
            const newRoomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', newRoomId);

            try {
                const now = Date.now();
                const myChar = buildOnlineCharConfig(getSelectedOnlineMultiChar());
                const roomPayload = {
                    roomId: newRoomId,
                    roomCode: roomCode,
                    mode: 'multi',
                    matchType: 'code',
                    status: 'waiting',
                    hostUid: myUid,
                    hostLastSeen: now,
                    battleHeartbeats: { [myUid]: now },
                    slotLeaveFlags: {},
                    slotRejoinAt: {},
                    createdAt: now,
                    updatedAt: now,
                    team1Slots: [
                        { type: 'human', uid: myUid, originalUid: myUid, playerId: myPlayerId, originalPlayerId: myPlayerId, playerName: myName, originalPlayerName: myName, selectedIcon: myIcon, charConfig: myChar, ready: false, lastSeen: now },
                        { type: 'human', uid: null, playerName: '', selectedIcon: 'courtney', charConfig: null, ready: false, lastSeen: 0 },
                        { type: 'human', uid: null, playerName: '', selectedIcon: 'courtney', charConfig: null, ready: false, lastSeen: 0 }
                    ],
                    team2Slots: [
                        { type: 'human', uid: null, playerName: '', selectedIcon: 'courtney', charConfig: null, ready: false, lastSeen: 0 },
                        { type: 'human', uid: null, playerName: '', selectedIcon: 'courtney', charConfig: null, ready: false, lastSeen: 0 },
                        { type: 'human', uid: null, playerName: '', selectedIcon: 'courtney', charConfig: null, ready: false, lastSeen: 0 }
                    ],
                    battleState: null,
                    pendingAction: null
                };
                await window.fbSetDoc(newRoomRef, roomPayload);
                window.saveOnlineRejoinTicket(newRoomId, roomCode, myUid, { teamNum: 1, slotIdx: 0 });

                if (inviteFriendId && playerState.playerId) {
                    try {
                        const targetBoxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', inviteFriendId);
                        await window.fbSetDoc(targetBoxRef, {
                            roomInvites: {
                                [playerState.playerId]: {
                                    roomId: newRoomId,
                                    roomCode: roomCode,
                                    fromId: playerState.playerId,
                                    fromName: myName,
                                    fromIcon: myIcon,
                                    sentAt: Date.now()
                                }
                            },
                            updatedAt: Date.now()
                        }, { merge: true });
                    } catch (invErr) {
                        console.warn('Friend room invite notify failed:', invErr);
                    }
                }

                renderOnlineMultiReadyScreen(newRoomId, roomPayload);
                if (inviteFriendId) {
                    const toastEl = document.getElementById('room-code-copy-toast');
                    if (toastEl) {
                        toastEl.innerText = `✓ ${inviteFriendName || inviteFriendId}に招待を送信しました！`;
                        setTimeout(() => { if (toastEl) toastEl.innerText = ''; }, 3000);
                    }
                }
            } catch (err) {
                console.error('Create code room error:', err);
                if (inviteFriendId) {
                    showModal('作成失敗', '対戦ルームの作成に失敗しました。もう一度お試しください。');
                } else {
                    setOnlineMatchStatus('⚠️ ルーム作成に失敗しました。もう一度お試しください。', 'text-red-400 font-bold');
                }
            }
        }

        async function joinOnlineRoomByCode(mode = 'multi', directCode = null) {
            audioSystem.playSelect();
            const input = document.getElementById('online-room-code-input');
            const code = directCode ? String(directCode).trim() : (input ? input.value.trim() : '');
            const notifyJoinError = (msg) => {
                if (directCode) {
                    showModal('⚠️ ルーム参加エラー', msg);
                } else {
                    setOnlineMatchStatus(msg, 'text-red-400 font-bold');
                }
            };
            if (!code || code.length < 4) {
                notifyJoinError('⚠️ 6桁のルームコードを入力してください！');
                return;
            }
            if (!directCode) {
                setOnlineMatchStatus(`🔍 コード「${code}」のルームを検索中...`, 'text-sky-300 font-bold');
            }

            await window.initFirebaseOnline();
            if (!window.fbDb || !window.fbCollection || !window.fbWhere || !window.fbRunTransaction) {
                notifyJoinError('⚠️ オンラインサーバーに接続できませんでした。');
                return;
            }

            const myUid = window.getOnlineClientId();
            const myPlayerId = (typeof playerState !== 'undefined' && playerState.playerId) ? playerState.playerId : null;
            const rejoinTicket = window.getOnlineRejoinTicket(code);
            const candidateUids = [myUid];
            if (rejoinTicket && rejoinTicket.uid && !candidateUids.includes(rejoinTicket.uid)) {
                candidateUids.push(rejoinTicket.uid);
            }
            const myName = playerState.playerName || '名無しファイター';
            const myIcon = playerState.selectedIcon || 'courtney';
            const roomsCol = window.fbCollection(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms');

            try {
                const q = window.fbQuery(roomsCol, window.fbWhere('roomCode', '==', code));
                const snap = await window.fbGetDocs(q);
                const matches = [];
                snap.forEach(d => {
                    const rd = d.data();
                    if (!rd) return;
                    const isEnded = rd.status === 'ended' || (rd.battleState && rd.battleState.battleEnded === true);
                    if (!isEnded && (rd.status === 'waiting' || rd.status === 'preparing' || rd.status === 'playing')) {
                        matches.push({ id: d.id, data: rd });
                    }
                });
                matches.sort((a, b) => (b.data.createdAt || 0) - (a.data.createdAt || 0));

                if (matches.length === 0) {
                    notifyJoinError(`⚠️ コード「${code}」の参加・復帰可能なルームが見つかりませんでした。`);
                    return;
                }

                const target = matches[0];
                const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', target.id);
                const joinRes = await window.fbRunTransaction(window.fbDb, async (tx) => {
                    const rSnap = await tx.get(roomRef);
                    if (!rSnap.exists()) return { error: 'ルームが存在しません。' };
                    const rd = rSnap.data();
                    const now = Date.now();
                    if (rd.status === 'ended' || (rd.battleState && rd.battleState.battleEnded === true)) {
                        return { error: 'このルームの対戦はすでに終了しています。' };
                    }

                    // 進行中のバトルへの再接続・途中復帰処理
                    if (rd.status === 'playing') {
                        const found = findMyRejoinableSlotInRoom(rd, candidateUids, myPlayerId);
                        if (!found) {
                            return { error: 'このルームはすでに対戦開始しています（元の参加者のみ同じルームIDでバトル復帰できます）。' };
                        }
                        const slotUid = found.slot.originalUid || found.slot.uid || (rejoinTicket && rejoinTicket.uid) || myUid;
                        const t1 = (rd.team1Slots || []).map(s => (s ? { ...s } : s));
                        const t2 = (rd.team2Slots || []).map(s => (s ? { ...s } : s));
                        const targetArr = found.teamNum === 1 ? t1 : t2;
                        targetArr[found.slotIdx] = {
                            ...found.slot,
                            type: 'human',
                            uid: slotUid,
                            originalUid: found.slot.originalUid || slotUid,
                            playerId: myPlayerId || found.slot.playerId || null,
                            originalPlayerId: found.slot.originalPlayerId || myPlayerId || found.slot.playerId || null,
                            playerName: myName,
                            originalPlayerName: myName,
                            selectedIcon: myIcon,
                            botTakeover: false,
                            ready: true,
                            lastSeen: now
                        };

                        const heartbeats = { ...(rd.battleHeartbeats || {}), [slotUid]: now };
                        const leaveFlags = { ...(rd.slotLeaveFlags || {}), [slotUid]: 0 };
                        const rejoinMap = { ...(rd.slotRejoinAt || {}), [slotUid]: now };

                        const curHostUid = rd.hostUid;
                        const hostLeft = !!(rd.hostLeftAt && rd.hostLeftAt > (rd.hostReclaimedAt || 0));
                        const hostHb = (curHostUid && heartbeats[curHostUid]) ? Math.max(heartbeats[curHostUid], rd.hostLastSeen || 0) : (rd.hostLastSeen || 0);
                        const hostLeaveFlag = (curHostUid && leaveFlags[curHostUid]) ? leaveFlags[curHostUid] : 0;
                        const hostRejoinFlag = (curHostUid && rejoinMap[curHostUid]) ? rejoinMap[curHostUid] : 0;
                        const isCurrentHostAlive = !!(
                            curHostUid &&
                            curHostUid !== slotUid &&
                            !hostLeft &&
                            !(hostLeaveFlag > hostRejoinFlag) &&
                            (hostHb > 0 ? (now - hostHb < 16000) : (now - (rd.startedAt || now) < 16000))
                        );

                        const txUpdates = {
                            team1Slots: t1,
                            team2Slots: t2,
                            battleHeartbeats: heartbeats,
                            slotLeaveFlags: leaveFlags,
                            slotRejoinAt: rejoinMap,
                            updatedAt: now
                        };

                        if (!isCurrentHostAlive) {
                            const markInactiveSlotBot = (s) => {
                                if (!s || s.type !== 'human' || !s.uid || s.uid === slotUid) return s;
                                const sHb = Math.max(heartbeats[s.uid] || 0, s.lastSeen || 0);
                                const sLeave = leaveFlags[s.uid] || 0;
                                const sRejoin = rejoinMap[s.uid] || 0;
                                const isStaleOrLeft = (s.uid === curHostUid) || (sLeave > sRejoin) || (now - (sHb || rd.startedAt || now) > 16000);
                                if (!isStaleOrLeft) return s;
                                return {
                                    ...s,
                                    type: 'bot',
                                    botTakeover: true,
                                    originalUid: s.originalUid || s.uid,
                                    originalPlayerId: s.originalPlayerId || s.playerId || null,
                                    originalPlayerName: s.originalPlayerName || s.playerName || ''
                                };
                            };
                            txUpdates.team1Slots = t1.map(markInactiveSlotBot);
                            txUpdates.team2Slots = t2.map(markInactiveSlotBot);
                            txUpdates.hostUid = slotUid;
                            txUpdates.hostLastSeen = now;
                            txUpdates.hostReclaimedAt = now;
                        }

                        tx.update(roomRef, txUpdates);
                        return {
                            isResume: true,
                            resolvedUid: slotUid,
                            teamNum: found.teamNum,
                            slotIdx: found.slotIdx,
                            roomData: { ...rd, ...txUpdates, roomId: target.id }
                        };
                    }

                    // 待機・準備中ロビーへの参加処理
                    const existing = findMySlotInRoom(rd, myUid);
                    if (existing) {
                        return { resolvedUid: myUid, teamNum: existing.teamNum, slotIdx: existing.slotIdx, roomData: rd };
                    }
                    const t1 = (rd.team1Slots || []).map(s => (s ? { ...s } : s));
                    const t2 = (rd.team2Slots || []).map(s => (s ? { ...s } : s));
                    let myChar = buildOnlineCharConfig(getSelectedOnlineMultiChar());
                    let placed = false;
                    let placedTeamNum = 2;
                    let placedSlotIdx = 0;

                    const placeInTeam = (targetArr, teamNum, teamLabel) => {
                        for (let i = 0; i < 3; i++) {
                            if (targetArr[i] && targetArr[i].type === 'human' && !targetArr[i].uid) {
                                const humanUsed = new Set();
                                targetArr.forEach((s, idx) => {
                                    if (idx !== i && s && s.type === 'human' && s.uid && s.charConfig && s.charConfig.charId) {
                                        humanUsed.add(s.charConfig.charId);
                                    }
                                });
                                if (humanUsed.has(myChar.charId)) {
                                    const altId = pickUniqueCharId(humanUsed, playerState.unlockedChars || []);
                                    myChar = buildOnlineCharConfig(altId);
                                }
                                targetArr[i] = { ...targetArr[i], uid: myUid, originalUid: myUid, playerId: myPlayerId, originalPlayerId: myPlayerId, playerName: myName, originalPlayerName: myName, selectedIcon: myIcon, charConfig: myChar, ready: false, lastSeen: now };
                                const usedNow = new Set([myChar.charId]);
                                targetArr.forEach((s, idx) => {
                                    if (idx !== i && s && s.type === 'human' && s.uid && s.charConfig && s.charConfig.charId) {
                                        usedNow.add(s.charConfig.charId);
                                    }
                                });
                                targetArr.forEach((s, idx) => {
                                    if (idx !== i && s && s.type === 'bot') {
                                        const bId = s.charConfig && s.charConfig.charId;
                                        if (!bId || usedNow.has(bId)) {
                                            const newBotId = pickUniqueCharId(usedNow);
                                            usedNow.add(newBotId);
                                            targetArr[idx] = { ...s, playerName: s.playerName || `${teamLabel}BOT ${idx + 1}`, selectedIcon: newBotId, charConfig: { charId: newBotId, customStats: null }, ready: true };
                                        } else {
                                            usedNow.add(bId);
                                        }
                                    }
                                });
                                placed = true;
                                placedTeamNum = teamNum;
                                placedSlotIdx = i;
                                return true;
                            }
                        }
                        return false;
                    };

                    if (!placeInTeam(t2, 2, '敵')) {
                        placeInTeam(t1, 1, '味方');
                    }
                    if (!placed) return { error: 'このルームのプレイヤー枠は満員です。' };
                    const allHumansJoined = [...t1, ...t2].filter(s => s && s.type === 'human').every(s => !!s.uid);
                    const nextStatus = allHumansJoined ? 'preparing' : 'waiting';
                    tx.update(roomRef, {
                        team1Slots: t1,
                        team2Slots: t2,
                        status: nextStatus,
                        updatedAt: now
                    });
                    return { resolvedUid: myUid, teamNum: placedTeamNum, slotIdx: placedSlotIdx, roomData: { ...rd, team1Slots: t1, team2Slots: t2, status: nextStatus } };
                });

                if (joinRes && joinRes.error) {
                    notifyJoinError('⚠️ ' + joinRes.error);
                    return;
                }
                if (joinRes && joinRes.roomData) {
                    const resolvedUid = joinRes.resolvedUid || myUid;
                    window.setOnlineClientId(resolvedUid);
                    window.saveOnlineRejoinTicket(
                        target.id,
                        joinRes.roomData.roomCode || code,
                        resolvedUid,
                        { teamNum: joinRes.teamNum, slotIdx: joinRes.slotIdx }
                    );
                    if (joinRes.isResume) {
                        await launchOnlineSyncedBattle(target.id, joinRes.roomData, false, { isResume: true });
                    } else {
                        renderOnlineMultiReadyScreen(target.id, joinRes.roomData);
                    }
                }
            } catch (err) {
                console.error('Join by code error:', err);
                notifyJoinError('⚠️ ルーム参加中にエラーが発生しました。');
            }
        }

        function copyTextSilently(text) {
            return new Promise((resolve) => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(() => resolve(true)).catch(() => {
                        try {
                            const ta = document.createElement('textarea');
                            ta.value = text;
                            ta.style.position = 'fixed';
                            ta.style.opacity = '0';
                            document.body.appendChild(ta);
                            ta.select();
                            document.execCommand('copy');
                            ta.remove();
                            resolve(true);
                        } catch (e) {
                            resolve(false);
                        }
                    });
                } else {
                    try {
                        const ta = document.createElement('textarea');
                        ta.value = text;
                        ta.style.position = 'fixed';
                        ta.style.opacity = '0';
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        ta.remove();
                        resolve(true);
                    } catch (e) {
                        resolve(false);
                    }
                }
            });
        }

        function copyOnlineRoomCode(code, customToast = '✓ コピーしました！') {
            audioSystem.playSelect();
            const showToast = () => {
                const el = document.getElementById('room-code-copy-toast');
                if (el) {
                    el.innerText = customToast;
                    setTimeout(() => { if (el) el.innerText = ''; }, 1800);
                }
            };
            copyTextSilently(code).then((ok) => {
                if (ok) showToast();
            });
        }

        async function shareOnlineRoomCode(code) {
            audioSystem.playSelect();
            const shareText = `【ドパキン】オンライン対戦のルームを作成しました！\nルームID: ${code}\n「ルームIDを入力して参加」から ${code} を入力して参加してね！`;

            if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
                try {
                    await navigator.share({
                        title: 'ドパキン オンライン対戦招待',
                        text: shareText
                    });
                    const el = document.getElementById('room-code-copy-toast');
                    if (el) {
                        el.innerText = '✓ 共有しました！';
                        setTimeout(() => { if (el) el.innerText = ''; }, 1800);
                    }
                    return;
                } catch (err) {
                    if (err && err.name === 'AbortError') {
                        return;
                    }
                    // Web Share unsupported or blocked in iframe -> fall through to share modal + copy
                }
            }

            copyTextSilently(shareText);
            const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(shareText)}`;
            const safeEscapedText = shareText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            showModal('📤 ルームIDを共有', `
                <div class="space-y-3 text-center">
                    <div class="text-xs text-slate-300 font-mono">下のメッセージをLINEやSNSでフレンドに送信できます（コピー済み）</div>
                    <textarea readonly rows="3" class="pixel-box bg-slate-950 border-sky-500 text-amber-200 text-xs font-mono w-full p-2 outline-none resize-none">${safeEscapedText}</textarea>
                    <div class="flex flex-wrap justify-center gap-2">
                        <a href="${lineUrl}" target="_blank" rel="noopener noreferrer" class="pixel-btn pixel-btn-success px-4 py-2 text-xs font-bold font-pixel inline-flex items-center gap-1.5 no-underline">
                            💬 LINEで送る
                        </a>
                        <button type="button" onclick="copyOnlineRoomInviteText('${code}')" class="pixel-btn pixel-btn-primary px-4 py-2 text-xs font-bold font-pixel">
                            📋 文章コピー
                        </button>
                    </div>
                </div>
            `);
        }

        function copyOnlineRoomInviteText(code) {
            const shareText = `【ドパキン】オンライン対戦のルームを作成しました！\nルームID: ${code}\n「ルームIDを入力して参加」から ${code} を入力して参加してね！`;
            copyOnlineRoomCode(shareText, '✓ 招待文をコピーしました！');
        }

        async function cancelOnlineRoomAndReturn(mode = 'multi') {
            audioSystem.playSelect();
            const st = window._onlineLobbyState;
            const roomId = st.roomId;
            const isSolo = st.isSoloLocal;
            const latestRd = st.latestRoomData;
            cleanupOnlineLobby();
            closeOnlineLobbyBotCharPicker();
            if (typeof window.clearOnlineRejoinTicket === 'function') {
                window.clearOnlineRejoinTicket(latestRd?.roomCode, roomId);
            }
            if (!isSolo && roomId && window.fbDb && window.fbDoc && !(latestRd && (latestRd.status === 'playing' || latestRd.status === 'ended'))) {
                try {
                    const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', roomId);
                    const myUid = window.getOnlineClientId();
                    const snap = await window.fbGetDoc(roomRef);
                    if (snap.exists()) {
                        const rd = snap.data();
                        if (rd.hostUid === myUid && rd.status !== 'playing') {
                            await window.fbUpdateDoc(roomRef, { status: 'ended', updatedAt: Date.now() });
                        } else if (rd.status !== 'playing') {
                            const t1 = (rd.team1Slots || []).map(s => (s && s.uid === myUid ? { ...s, uid: null, originalUid: null, playerId: null, originalPlayerId: null, playerName: '', charConfig: null, ready: false } : s));
                            const t2 = (rd.team2Slots || []).map(s => (s && s.uid === myUid ? { ...s, uid: null, originalUid: null, playerId: null, originalPlayerId: null, playerName: '', charConfig: null, ready: false } : s));
                            await window.fbUpdateDoc(roomRef, { team1Slots: t1, team2Slots: t2, status: 'waiting', updatedAt: Date.now() });
                        }
                    }
                } catch (e) {}
            }
            renderOnlineModesScreen();
        }

        async function hostFill2pWithBotsAndStart(roomId) {
            const myUid = window.getOnlineClientId();
            if (!window.fbDb || !window.fbDoc || !window.fbRunTransaction) {
                fallbackLaunchBotFromMatchmaking('2p');
                return;
            }
            const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', roomId);
            const allIds = Object.keys(CHARACTER_DATA);
            try {
                await window.fbRunTransaction(window.fbDb, async (tx) => {
                    const snap = await tx.get(roomRef);
                    if (!snap.exists()) return;
                    const rd = snap.data();
                    if (rd.hostUid !== myUid || rd.status === 'playing' || rd.status === 'ended') return;
                    const t1 = deduplicateTeamSlots((rd.team1Slots || []).map(s => ({ ...s, ready: true })), '味方', { fillEmptyHumansAsBots: true });
                    const usedInT1 = new Set(t1.map(s => s?.charConfig?.charId).filter(Boolean));
                    const usedInT2 = new Set();
                    const t2 = [0, 1, 2].map((idx) => {
                        const existing = rd.team2Slots && rd.team2Slots[idx];
                        if (existing && existing.type === 'human' && existing.uid) {
                            const hCid = (existing.charConfig && existing.charConfig.charId && CHARACTER_DATA[existing.charConfig.charId] && !usedInT2.has(existing.charConfig.charId))
                                ? existing.charConfig.charId
                                : pickUniqueCharId(usedInT2);
                            usedInT2.add(hCid);
                            return { ...existing, charConfig: { ...(existing.charConfig || {}), charId: hCid }, ready: true };
                        }
                        const existBotCid = (existing && existing.charConfig && existing.charConfig.charId && CHARACTER_DATA[existing.charConfig.charId]) ? existing.charConfig.charId : null;
                        let botCharId;
                        if (existBotCid && !usedInT2.has(existBotCid)) {
                            botCharId = existBotCid;
                        } else {
                            const combinedExclude = new Set([...usedInT2, ...usedInT1]);
                            const nonMirrorPool = allIds.filter(id => !combinedExclude.has(id));
                            botCharId = nonMirrorPool.length > 0
                                ? nonMirrorPool[Math.floor(Math.random() * nonMirrorPool.length)]
                                : pickUniqueCharId(usedInT2);
                        }
                        usedInT2.add(botCharId);
                        return {
                            type: 'bot',
                            uid: null,
                            playerName: `敵BOT ${idx + 1}`,
                            selectedIcon: botCharId,
                            charConfig: { charId: botCharId, customStats: null },
                            ready: true,
                            lastSeen: Date.now()
                        };
                    });
                    tx.update(roomRef, { team1Slots: t1, team2Slots: t2, status: 'playing', startedAt: Date.now(), updatedAt: Date.now() });
                });
            } catch (e) {
                console.warn('2p auto-BOT fill error:', e);
                fallbackLaunchBotFromMatchmaking('2p');
            }
        }

        function renderOnlineWaitingRoomScreen(roomId, initialData = null) {
            cleanupOnlineLobby();
            window._onlineLobbyState.roomId = roomId;
            window._onlineLobbyState.waitStartAt = Date.now();
            let latestRoomSnapshot = initialData;
            let lastWaitSig = '';

            const drawWaitingView = (roomData) => {
                latestRoomSnapshot = roomData;
                const container = document.getElementById('screen-container');
                if (!container || !roomData) return;
                const sig = JSON.stringify({
                    st: roomData.status,
                    rc: roomData.roomCode,
                    t1: (roomData.team1Slots || []).map(s => [s?.type, s?.uid, s?.charConfig?.charId, s?.ready]),
                    t2: (roomData.team2Slots || []).map(s => [s?.type, s?.uid, s?.charConfig?.charId, s?.ready])
                });
                if (sig === lastWaitSig) return;
                lastWaitSig = sig;

                const myUid = window.getOnlineClientId();
                const isHost = roomData.hostUid === myUid;
                const mySlots = isHost ? (roomData.team1Slots || []) : (roomData.team2Slots || []);
                const oppSlots = isHost ? (roomData.team2Slots || []) : (roomData.team1Slots || []);
                const isMatched = (roomData.status === 'matched' || roomData.status === 'playing') && oppSlots.some(s => s && (s.uid || s.type === 'bot'));
                const hasHumanOpp = oppSlots.some(s => s && s.type === 'human' && !!s.uid);
                const oppName = hasHumanOpp ? (oppSlots.find(s => s && s.uid)?.playerName || '対戦相手') : 'CPU (自動補充BOT)';
                const elapsedSec = Math.floor((Date.now() - window._onlineLobbyState.waitStartAt) / 1000);

                container.innerHTML = `
                    <div class="relative w-full h-full flex flex-col justify-between p-3 sm:p-5 select-none overflow-y-auto bg-slate-950 text-white">
                        <div class="flex items-center justify-between gap-2 w-full mb-2 shrink-0">
                            <button onclick="cancelOnlineRoomAndReturn('2p')" class="pixel-btn pixel-btn-danger px-3 py-1 text-xs font-bold whitespace-nowrap">
                                ✕ キャンセル
                            </button>
                            <h2 class="text-emerald-300 font-pixel text-xs sm:text-lg font-bold whitespace-nowrap truncate">
                                ${isMatched ? '⚡ マッチ成立！バトル開始準備中...' : '🔑 フレンド対戦ルーム待機中'}
                            </h2>
                            <div id="waiting-elapsed-badge" class="text-xs font-mono text-amber-300 whitespace-nowrap">${elapsedSec}秒</div>
                        </div>

                        <div class="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center gap-4">
                            ${roomData.matchType === 'code' && roomData.roomCode ? `
                                <div class="pixel-box-gold bg-amber-950/70 border-2 border-amber-400 p-3 text-center space-y-1.5">
                                    <div class="text-[11px] font-pixel text-amber-200">フレンドに共有するルームID（コード）</div>
                                    <div class="flex items-center justify-center gap-3">
                                        <span class="text-2xl sm:text-4xl font-mono font-black tracking-[0.25em] text-amber-300">${roomData.roomCode}</span>
                                        <button type="button" onclick="copyOnlineRoomCode('${roomData.roomCode}')" class="pixel-btn pixel-btn-primary px-3 py-1.5 text-xs font-bold whitespace-nowrap">📋 コピー</button>
                                    </div>
                                    <div id="room-code-copy-toast" class="text-[11px] text-emerald-300 font-bold min-h-[16px]"></div>
                                </div>
                            ` : ''}

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                                <div class="pixel-box bg-emerald-950/40 border-2 border-emerald-500 p-3 space-y-2">
                                    <div class="text-xs font-pixel font-bold text-emerald-300 text-center">🛡️ あなた：${playerState.playerName || 'Player'}</div>
                                    <div class="grid grid-cols-3 gap-1.5">
                                        ${mySlots.map((s, idx) => {
                                            const cId = s?.charConfig?.charId || 'asaiomizu';
                                            const cData = CHARACTER_DATA[cId] || {};
                                            return `
                                                <div class="bg-slate-950/90 border border-emerald-700/70 rounded p-1.5 flex flex-col items-center">
                                                    <canvas id="wait-my-cvs-${idx}" width="44" height="44" class="w-10 h-10 rounded bg-slate-900"></canvas>
                                                    <span class="text-[10px] font-bold text-white truncate max-w-full mt-1">${cData.name || cId}</span>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>

                                <div class="pixel-box ${isMatched ? 'bg-red-950/45 border-2 border-red-400' : 'bg-slate-900/90 border-2 border-slate-700 border-dashed'} p-3 flex flex-col justify-center space-y-2">
                                    ${isMatched ? `
                                        <div class="text-xs font-pixel font-bold text-red-300 text-center">⚔️ 相手：${oppName}</div>
                                        <div class="grid grid-cols-3 gap-1.5">
                                            ${oppSlots.map((s, idx) => {
                                                const cId = s?.charConfig?.charId || 'pasha';
                                                const cData = CHARACTER_DATA[cId] || {};
                                                return `
                                                    <div class="bg-slate-950/90 border border-red-700/70 rounded p-1.5 flex flex-col items-center">
                                                        <canvas id="wait-opp-cvs-${idx}" width="44" height="44" class="w-10 h-10 rounded bg-slate-900"></canvas>
                                                        <span class="text-[10px] font-bold text-white truncate max-w-full mt-1">${cData.name || cId}</span>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    ` : `
                                        <div class="text-center space-y-2 py-4">
                                            <div class="text-3xl animate-bounce">⏳</div>
                                            <div class="text-xs sm:text-sm font-pixel text-amber-300 animate-pulse">対戦相手の参加を待っています...</div>
                                            <div class="text-[10px] text-slate-400 font-mono">
                                                ${roomData.matchType === 'code' ? '相手が上記の6桁コードを入力するとマッチします' : '別プレイヤーが見つからない場合は自動BOT補充で開始します'}
                                            </div>
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-wrap justify-center gap-3 pt-2 shrink-0">
                            ${!isMatched && isHost ? `
                                <button type="button" onclick="hostFill2pWithBotsAndStart('${roomId}')" class="pixel-btn pixel-btn-success px-6 py-2.5 text-xs sm:text-sm font-bold font-pixel shadow-xl">
                                    ⚔️ 対戦開始（相手枠にBOTを補充してスタート）
                                </button>
                            ` : (!isMatched ? `
                                <div class="text-xs font-pixel text-slate-400">⏳ マッチ待機中...</div>
                            ` : `
                                <div class="text-sm font-pixel font-bold text-amber-300 animate-pulse">⚔️ まもなくバトル開始！</div>
                            `)}
                        </div>
                    </div>
                `;

                setTimeout(() => {
                    mySlots.forEach((s, idx) => {
                        const cvs = document.getElementById(`wait-my-cvs-${idx}`);
                        if (cvs && s?.charConfig?.charId) CharacterRenderer.drawCharacter(cvs, s.charConfig.charId);
                    });
                    if (isMatched) {
                        oppSlots.forEach((s, idx) => {
                            const cvs = document.getElementById(`wait-opp-cvs-${idx}`);
                            if (cvs && s?.charConfig?.charId) CharacterRenderer.drawCharacter(cvs, s.charConfig.charId);
                        });
                    }
                }, 30);
            };

            if (initialData) {
                drawWaitingView(initialData);
            }

            window._onlineLobbyState.waitTimerId = setInterval(() => {
                if (window._onlineLobbyState.roomId !== roomId || !latestRoomSnapshot) return;
                const elapsed = Math.floor((Date.now() - window._onlineLobbyState.waitStartAt) / 1000);
                const elBadge = document.getElementById('waiting-elapsed-badge');
                if (elBadge) elBadge.innerText = `${elapsed}秒`;
            }, 1000);

            if (window.fbDb && window.fbDoc && window.fbOnSnapshot) {
                const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', roomId);

                window._onlineLobbyState.unsub = window.fbOnSnapshot(roomRef, (snap) => {
                    if (!snap.exists()) return;
                    const rd = snap.data();
                    if (!rd || rd.status === 'ended') {
                        cleanupOnlineLobby();
                        showModal('ルーム終了', 'ホストがルームを解散しました。');
                        renderOnlineMatchmakingScreen('2p');
                        return;
                    }
                    drawWaitingView(rd);
                    const oppReady = rd.team2Slots && rd.team2Slots[0] && (!!rd.team2Slots[0].uid || rd.team2Slots[0].type === 'bot');
                    if ((rd.status === 'matched' || rd.status === 'playing') && oppReady) {
                        if (window._onlineLobbyState.launchedRoomId !== roomId) {
                            window._onlineLobbyState.launchedRoomId = roomId;
                            window._onlineLobbyState.launchTimeoutId = setTimeout(() => {
                                launchOnlineSyncedBattle(roomId, rd);
                            }, 700);
                        }
                    }
                });
            }
        }

        async function selectOnlineMultiLobbyChar(roomId, charId) {
            audioSystem.playSelect();
            if (!playerState.unlockedChars.includes(charId)) {
                showModal('未解放キャラクター', 'このキャラクターはまだ所持していません！');
                return false;
            }
            if (!validateCharCustomStats(charId)) return false;

            const st = window._onlineLobbyState;
            const myUid = window.getOnlineClientId();
            const charConfig = buildOnlineCharConfig(charId);

            const applyTeamSelection = (teamArr, teamLabel) => {
                const myIdx = (teamArr || []).findIndex(s => s && s.uid === myUid);
                if (myIdx === -1) return { found: false, slots: teamArr };
                const humanConflict = teamArr.find((s, idx) => idx !== myIdx && s && s.type === 'human' && s.uid && s.charConfig && s.charConfig.charId === charId);
                if (humanConflict) {
                    return { found: true, error: 'human_conflict', conflictName: humanConflict.playerName || '味方プレイヤー' };
                }
                const usedSet = new Set([charId]);
                teamArr.forEach((s, idx) => {
                    if (idx !== myIdx && s && s.type === 'human' && s.uid && s.charConfig && s.charConfig.charId) {
                        usedSet.add(s.charConfig.charId);
                    }
                });
                const next = teamArr.map((s, idx) => {
                    if (idx === myIdx) {
                        return { ...s, charConfig, ready: false, lastSeen: Date.now() };
                    }
                    if (s && s.type === 'bot') {
                        const botCid = s.charConfig && s.charConfig.charId;
                        if (!botCid || usedSet.has(botCid)) {
                            const newBotId = pickUniqueCharId(usedSet);
                            usedSet.add(newBotId);
                            return { ...s, playerName: s.playerName || `${teamLabel}BOT ${idx + 1}`, selectedIcon: newBotId, charConfig: { charId: newBotId, customStats: null }, ready: true };
                        }
                        usedSet.add(botCid);
                    }
                    return s;
                });
                return { found: true, slots: next };
            };

            if (st.isSoloLocal && st.soloRoomData) {
                saveSelectedOnlineMultiChar(charId);
                const r1 = applyTeamSelection(st.soloRoomData.team1Slots, '味方');
                if (r1.found && r1.slots) st.soloRoomData.team1Slots = r1.slots;
                renderOnlineMultiReadyScreen(roomId, st.soloRoomData);
                return true;
            }

            if (st.latestRoomData) {
                const curFound = findMySlotInRoom(st.latestRoomData, myUid);
                if (curFound) {
                    const teamArr = curFound.teamNum === 1 ? st.latestRoomData.team1Slots : st.latestRoomData.team2Slots;
                    const humanConflict = (teamArr || []).find((s, idx) => idx !== curFound.slotIdx && s && s.type === 'human' && s.uid && s.charConfig && s.charConfig.charId === charId);
                    if (humanConflict) {
                        const cName = (CHARACTER_DATA[charId] && CHARACTER_DATA[charId].name) || charId;
                        showModal('同じチームで重複不可', `「${cName}」は同じチームの ${humanConflict.playerName || '味方プレイヤー'} がすでに選択しています。\n\n敵・味方とも各チーム3体はそれぞれ別のキャラクターにしてください。`);
                        return false;
                    }
                    const botConflict = (teamArr || []).some((s, idx) => idx !== curFound.slotIdx && s && s.type === 'bot' && s.charConfig && s.charConfig.charId === charId);
                    if (!botConflict && curFound.slot && curFound.slot.charConfig &&
                        curFound.slot.charConfig.charId === charId &&
                        JSON.stringify(curFound.slot.charConfig.customStats || null) === JSON.stringify(charConfig.customStats || null) &&
                        !curFound.slot.ready) {
                        saveSelectedOnlineMultiChar(charId);
                        return true;
                    }
                }
            }

            saveSelectedOnlineMultiChar(charId);
            let txConflict = null;
            if (window.fbDb && window.fbDoc && window.fbRunTransaction) {
                const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', roomId);
                await window.fbRunTransaction(window.fbDb, async (tx) => {
                    const snap = await tx.get(roomRef);
                    if (!snap.exists()) return;
                    const rd = snap.data();
                    if (rd.status === 'playing' || rd.status === 'ended') return;
                    const curFound = findMySlotInRoom(rd, myUid);
                    if (!curFound) return;
                    const r1 = curFound.teamNum === 1 ? applyTeamSelection(rd.team1Slots, '味方') : { found: false, slots: rd.team1Slots };
                    const r2 = curFound.teamNum === 2 ? applyTeamSelection(rd.team2Slots, '敵') : { found: false, slots: rd.team2Slots };
                    if (r1.error === 'human_conflict' || r2.error === 'human_conflict') {
                        txConflict = r1.conflictName || r2.conflictName || '味方プレイヤー';
                        return;
                    }
                    tx.update(roomRef, { team1Slots: r1.slots, team2Slots: r2.slots, updatedAt: Date.now() });
                }).catch(e => console.warn('Select lobby char error:', e));
            }
            if (txConflict) {
                const cName = (CHARACTER_DATA[charId] && CHARACTER_DATA[charId].name) || charId;
                showModal('同じチームで重複不可', `「${cName}」は同じチームの ${txConflict} がすでに選択しています。\n\n敵・味方とも各チーム3体はそれぞれ別のキャラクターにしてください。`);
                return false;
            }
            return true;
        }

        async function toggleOnlineMultiLobbyReady(roomId) {
            audioSystem.playSelect();
            const st = window._onlineLobbyState;
            const myUid = window.getOnlineClientId();

            if (st.isSoloLocal && st.soloRoomData) {
                const s0 = st.soloRoomData.team1Slots[0];
                if (!s0.charConfig) s0.charConfig = buildOnlineCharConfig(getSelectedOnlineMultiChar());
                s0.ready = !s0.ready;
                if (s0.ready) {
                    const launchedData = { ...st.soloRoomData, status: 'playing' };
                    launchOnlineSyncedBattle(roomId, launchedData, true);
                } else {
                    renderOnlineMultiReadyScreen(roomId, st.soloRoomData);
                }
                return;
            }

            if (window.fbDb && window.fbDoc && window.fbRunTransaction) {
                const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', roomId);
                await window.fbRunTransaction(window.fbDb, async (tx) => {
                    const snap = await tx.get(roomRef);
                    if (!snap.exists()) return;
                    const rd = snap.data();
                    if (rd.status === 'playing') return;
                    const myChar = buildOnlineCharConfig(getSelectedOnlineMultiChar());
                    const toggleSlot = (s) => {
                        if (!s || s.uid !== myUid) return s;
                        const nextChar = s.charConfig || myChar;
                        return { ...s, charConfig: nextChar, ready: !s.ready, lastSeen: Date.now() };
                    };
                    const t1 = (rd.team1Slots || []).map(toggleSlot);
                    const t2 = (rd.team2Slots || []).map(toggleSlot);
                    tx.update(roomRef, { team1Slots: t1, team2Slots: t2, updatedAt: Date.now() });
                }).catch(e => console.warn('Toggle ready error:', e));
            }
        }

        function selectOnlineLobbyMovePlayer(uid) {
            audioSystem.playSelect();
            const st = window._onlineLobbyState;
            const myUid = window.getOnlineClientId();
            if (!st.latestRoomData || st.latestRoomData.hostUid !== myUid) return;
            st.selectedMoveUid = uid;
            if (typeof st.drawLobbyViewFn === 'function') {
                st.drawLobbyViewFn(st.latestRoomData, true);
            }
        }

        async function moveOnlineMultiLobbySlot(roomId, targetTeamNum, targetSlotIdx) {
            audioSystem.playSelect();
            const st = window._onlineLobbyState;
            if (st.isSoloLocal) return;
            const myUid = window.getOnlineClientId();
            if (st.latestRoomData) {
                if (st.latestRoomData.hostUid !== myUid || st.latestRoomData.status === 'playing' || st.latestRoomData.status === 'ended') return;
                const destCacheArr = targetTeamNum === 1 ? (st.latestRoomData.team1Slots || []) : (st.latestRoomData.team2Slots || []);
                const destCacheSlot = destCacheArr[targetSlotIdx];
                if (!destCacheSlot || destCacheSlot.type !== 'human' || destCacheSlot.uid) return;
            }
            if (!window.fbDb || !window.fbDoc || !window.fbRunTransaction) return;
            const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', roomId);
            let moveConflictName = null;
            await window.fbRunTransaction(window.fbDb, async (tx) => {
                const snap = await tx.get(roomRef);
                if (!snap.exists()) return;
                const rd = snap.data();
                if (rd.hostUid !== myUid || rd.status === 'playing' || rd.status === 'ended') return;
                let targetUid = st.selectedMoveUid || myUid;
                let found = findMySlotInRoom(rd, targetUid);
                if (!found) {
                    targetUid = myUid;
                    found = findMySlotInRoom(rd, targetUid);
                }
                if (!found) return;
                const t1 = (rd.team1Slots || []).map(s => (s ? { ...s } : s));
                const t2 = (rd.team2Slots || []).map(s => (s ? { ...s } : s));
                const destArr = targetTeamNum === 1 ? t1 : t2;
                const destSlot = destArr[targetSlotIdx];
                if (!destSlot || destSlot.type !== 'human' || destSlot.uid) return;
                const srcArr = found.teamNum === 1 ? t1 : t2;
                const movedData = { ...found.slot, lastSeen: Date.now() };
                const movedCharId = movedData.charConfig && movedData.charConfig.charId;
                if (movedCharId && found.teamNum !== targetTeamNum) {
                    const humanConflict = destArr.find(s => s && s.type === 'human' && s.uid && s.charConfig && s.charConfig.charId === movedCharId);
                    if (humanConflict) {
                        moveConflictName = (CHARACTER_DATA[movedCharId] && CHARACTER_DATA[movedCharId].name) || movedCharId;
                        return;
                    }
                }
                srcArr[found.slotIdx] = { type: 'human', uid: null, playerName: '', selectedIcon: 'courtney', charConfig: null, ready: false, lastSeen: 0 };
                destArr[targetSlotIdx] = movedData;
                if (movedCharId) {
                    const usedInDest = new Set();
                    destArr.forEach(s => {
                        if (s && s.type === 'human' && s.uid && s.charConfig && s.charConfig.charId) {
                            usedInDest.add(s.charConfig.charId);
                        }
                    });
                    const teamLabel = targetTeamNum === 1 ? '味方' : '敵';
                    destArr.forEach((s, idx) => {
                        if (s && s.type === 'bot') {
                            const bId = s.charConfig && s.charConfig.charId;
                            if (!bId || usedInDest.has(bId)) {
                                const newBotId = pickUniqueCharId(usedInDest);
                                usedInDest.add(newBotId);
                                destArr[idx] = { ...s, playerName: s.playerName || `${teamLabel}BOT ${idx + 1}`, selectedIcon: newBotId, charConfig: { charId: newBotId, customStats: null }, ready: true };
                            } else {
                                usedInDest.add(bId);
                            }
                        }
                    });
                }
                tx.update(roomRef, { team1Slots: t1, team2Slots: t2, updatedAt: Date.now() });
            }).catch(e => console.warn('Move slot error:', e));
            if (moveConflictName) {
                showModal('移動できません', `移動先のチームにすでに「${moveConflictName}」が編成されているため移動できません。\n別のキャラクターに変更してから移動してください。`);
            }
        }

        async function toggleOnlineMultiLobbySlotType(roomId, targetTeamNum, targetSlotIdx) {
            audioSystem.playSelect();
            const myUid = window.getOnlineClientId();
            const st = window._onlineLobbyState;
            if (!st.isSoloLocal && st.latestRoomData && st.latestRoomData.hostUid !== myUid) return;

            const transformSlots = (rd) => {
                const t1 = [...(rd.team1Slots || [])];
                const t2 = [...(rd.team2Slots || [])];
                const arr = targetTeamNum === 1 ? t1 : t2;
                const slot = arr[targetSlotIdx];
                if (!slot) return null;
                if (slot.uid === myUid || (slot.type === 'human' && slot.uid)) return null;
                const teamLabel = targetTeamNum === 1 ? '味方' : '敵';
                if (slot.type === 'bot') {
                    arr[targetSlotIdx] = { type: 'human', uid: null, playerName: '', selectedIcon: 'courtney', charConfig: null, ready: false, lastSeen: 0 };
                } else {
                    const otherUsed = getTeamCharIdsExceptSlot(arr, targetSlotIdx);
                    const existingCharId = slot.charConfig?.charId;
                    const botCharId = (existingCharId && CHARACTER_DATA[existingCharId] && !otherUsed.has(existingCharId))
                        ? existingCharId
                        : pickUniqueCharId(otherUsed);
                    arr[targetSlotIdx] = {
                        type: 'bot',
                        uid: null,
                        playerName: `${teamLabel}BOT ${targetSlotIdx + 1}`,
                        selectedIcon: botCharId,
                        charConfig: { charId: botCharId, customStats: null },
                        ready: true,
                        lastSeen: Date.now()
                    };
                }
                const allHumansJoined = [...t1, ...t2].filter(s => s && s.type === 'human').every(s => !!s.uid);
                return { t1, t2, nextStatus: allHumansJoined ? 'preparing' : 'waiting' };
            };

            if (st.isSoloLocal && st.soloRoomData) {
                const res = transformSlots(st.soloRoomData);
                if (!res) return;
                st.soloRoomData.team1Slots = res.t1;
                st.soloRoomData.team2Slots = res.t2;
                st.soloRoomData.status = res.nextStatus;
                renderOnlineMultiReadyScreen(roomId, st.soloRoomData);
                return;
            }

            if (!window.fbDb || !window.fbDoc || !window.fbRunTransaction) return;
            const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', roomId);
            await window.fbRunTransaction(window.fbDb, async (tx) => {
                const snap = await tx.get(roomRef);
                if (!snap.exists()) return;
                const rd = snap.data();
                if (rd.hostUid !== myUid || rd.status === 'playing' || rd.status === 'ended') return;
                const res = transformSlots(rd);
                if (!res) return;
                tx.update(roomRef, { team1Slots: res.t1, team2Slots: res.t2, status: res.nextStatus, updatedAt: Date.now() });
            }).catch(e => console.warn('Toggle slot type error:', e));
        }

        async function assignOnlineLobbyBotChar(roomId, targetTeamNum, targetSlotIdx, botCharId) {
            audioSystem.playSelect();
            if (!CHARACTER_DATA[botCharId]) return;
            const myUid = window.getOnlineClientId();
            const st = window._onlineLobbyState;
            if (!st.isSoloLocal && st.latestRoomData) {
                if (st.latestRoomData.hostUid !== myUid) return;
                const curArr = targetTeamNum === 1 ? (st.latestRoomData.team1Slots || []) : (st.latestRoomData.team2Slots || []);
                const curSlot = curArr[targetSlotIdx];
                if (!curSlot || curSlot.type !== 'bot' || curSlot.charConfig?.charId === botCharId) return;
            }
            const charConfig = { charId: botCharId, customStats: null };

            const applyBotChar = (rd) => {
                const t1 = [...(rd.team1Slots || [])];
                const t2 = [...(rd.team2Slots || [])];
                const arr = targetTeamNum === 1 ? t1 : t2;
                const slot = arr[targetSlotIdx];
                if (!slot || slot.type !== 'bot' || slot.charConfig?.charId === botCharId) return null;
                const otherUsed = getTeamCharIdsExceptSlot(arr, targetSlotIdx);
                if (otherUsed.has(botCharId)) return 'duplicate';
                arr[targetSlotIdx] = { ...slot, selectedIcon: botCharId, charConfig, ready: true, lastSeen: Date.now() };
                return { t1, t2 };
            };

            if (st.isSoloLocal && st.soloRoomData) {
                const res = applyBotChar(st.soloRoomData);
                if (res === 'duplicate') {
                    showModal('同じチームで重複不可', 'このキャラクターは同じチームの別枠ですでに選択されているため設定できません。');
                    return;
                }
                if (!res) return;
                st.soloRoomData.team1Slots = res.t1;
                st.soloRoomData.team2Slots = res.t2;
                renderOnlineMultiReadyScreen(roomId, st.soloRoomData);
                return;
            }

            if (!window.fbDb || !window.fbDoc || !window.fbRunTransaction) return;
            const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', roomId);
            let botDupError = false;
            await window.fbRunTransaction(window.fbDb, async (tx) => {
                const snap = await tx.get(roomRef);
                if (!snap.exists()) return;
                const rd = snap.data();
                if (rd.hostUid !== myUid || rd.status === 'playing' || rd.status === 'ended') return;
                const res = applyBotChar(rd);
                if (res === 'duplicate') {
                    botDupError = true;
                    return;
                }
                if (!res) return;
                tx.update(roomRef, { team1Slots: res.t1, team2Slots: res.t2, updatedAt: Date.now() });
            }).catch(e => console.warn('Assign BOT char error:', e));
            if (botDupError) {
                showModal('同じチームで重複不可', 'このキャラクターは同じチームの別枠ですでに選択されているため設定できません。');
            }
        }

        function closeOnlineLobbyCharDetailModal() {
            const existing = document.getElementById('online-lobby-char-detail-modal');
            if (existing) existing.remove();
        }

        function adjustOnlineLobbyCharStat(charId, statKey, delta, roomId = '', mode = 'player') {
            if (typeof getNewBattleCustomStats !== 'function') return;
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
            if (currentTotal + delta > 240) return;

            audioSystem.playSelect();
            stats[statKey] = newVal;
            savePlayerState();
            openOnlineLobbyCharDetailModal(charId, roomId, mode, true);
        }

        function resetOnlineLobbyCharStat(charId, roomId = '', mode = 'player') {
            audioSystem.playSelect();
            if (playerState.newBattleCustomStats) {
                delete playerState.newBattleCustomStats[charId];
            }
            if (typeof getNewBattleCustomStats === 'function') {
                getNewBattleCustomStats(charId);
            }
            savePlayerState();
            openOnlineLobbyCharDetailModal(charId, roomId, mode, true);
        }

        async function selectOnlineLobbyCharFromDetailModal(roomId, charId) {
            if (!validateCharCustomStats(charId)) return;
            if (roomId) {
                const ok = await selectOnlineMultiLobbyChar(roomId, charId);
                if (ok === false) return;
            }
            closeOnlineLobbyCharDetailModal();
        }

        function openOnlineLobbyCharDetailModal(charId, roomId = '', mode = 'player', silent = false) {
            const c = CHARACTER_DATA[charId];
            if (!c) return;
            if (!silent) audioSystem.playSelect();

            const prevRightEl = document.getElementById('online-lobby-detail-right');
            const prevScrollTop = prevRightEl ? prevRightEl.scrollTop : 0;

            closeOnlineLobbyCharDetailModal();

            const st = window._onlineLobbyState || {};
            const myUid = typeof window.getOnlineClientId === 'function' ? window.getOnlineClientId() : null;
            const activeRoom = st.isSoloLocal ? st.soloRoomData : st.latestRoomData;
            const mySlotFound = (activeRoom && myUid) ? findMySlotInRoom(activeRoom, myUid) : null;
            const currentLobbyCharId = (mySlotFound && mySlotFound.slot && mySlotFound.slot.charConfig && mySlotFound.slot.charConfig.charId)
                ? mySlotFound.slot.charConfig.charId
                : (typeof getSelectedOnlineMultiChar === 'function' ? getSelectedOnlineMultiChar() : 'asaiomizu');
            const isSelectedInLobby = mode === 'player' && currentLobbyCharId === c.id;
            const isUnlocked = playerState.unlockedChars.includes(c.id);
            const isEligibleCustom = (mode === 'player') && !['dopagaking', 'courtney', 'pasha_dark'].includes(c.id);

            let statsHtml = '';
            if (isEligibleCustom && typeof getNewBattleCustomStats === 'function') {
                const custStats = getNewBattleCustomStats(c.id);
                const totalUsed = custStats.hp + custStats.atk + custStats.def + custStats.critRate + custStats.eva;
                const remPts = 240 - totalUsed;
                const hpMinusDisabled = custStats.hp <= 50;
                const hpPlusDisabled = totalUsed + 5 > 240 || custStats.hp + 5 > 300;
                const atkMinusDisabled = custStats.atk <= 5;
                const atkPlusDisabled = custStats.atk >= 45 || totalUsed + 1 > 240;
                const defMinusDisabled = custStats.def <= 5;
                const defPlusDisabled = totalUsed + 1 > 240 || custStats.def + 1 > 80;
                const critMinusDisabled = custStats.critRate <= 1;
                const critPlusDisabled = totalUsed + 1 > 240 || custStats.critRate + 1 > 40;
                const evaMinusDisabled = custStats.eva <= 1;
                const evaPlusDisabled = totalUsed + 1 > 240 || custStats.eva + 1 > 60;

                statsHtml = `
                    <div class="w-full bg-slate-950 p-2.5 sm:p-3 rounded border border-amber-800 space-y-2 text-xs font-mono">
                        <div class="flex justify-between items-center border-b border-amber-900 pb-1 gap-2 flex-wrap">
                            <span class="text-amber-300 font-bold">📊 ステータス調整 (最大240Pt)</span>
                            <span class="text-[11px]">残り: <span class="${remPts < 0 ? 'text-red-400' : (remPts === 0 ? 'text-emerald-400' : 'text-amber-300')} font-bold">${remPts}</span> Pt</span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            <div class="flex items-center justify-between bg-slate-900 px-2 py-1.5 rounded">
                                <span class="text-slate-300 font-bold">HP</span>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-emerald-400 font-bold w-8 text-right">${custStats.hp}</span>
                                    <button type="button" ${hpMinusDisabled ? 'disabled class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustOnlineLobbyCharStat('${c.id}', 'hp', -5, '${roomId}', '${mode}')" class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-800"`}>-5</button>
                                    <button type="button" ${hpPlusDisabled ? 'disabled class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustOnlineLobbyCharStat('${c.id}', 'hp', 5, '${roomId}', '${mode}')" class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-800"`}>+5</button>
                                </div>
                            </div>
                            <div class="flex items-center justify-between bg-slate-900 px-2 py-1.5 rounded">
                                <span class="text-slate-300 font-bold">攻撃力</span>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-red-400 font-bold w-8 text-right">${custStats.atk}</span>
                                    <button type="button" ${atkMinusDisabled ? 'disabled class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustOnlineLobbyCharStat('${c.id}', 'atk', -1, '${roomId}', '${mode}')" class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-800"`}>-1</button>
                                    <button type="button" ${atkPlusDisabled ? 'disabled class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustOnlineLobbyCharStat('${c.id}', 'atk', 1, '${roomId}', '${mode}')" class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-800"`}>+1</button>
                                </div>
                            </div>
                            <div class="flex items-center justify-between bg-slate-900 px-2 py-1.5 rounded">
                                <span class="text-slate-300 font-bold">防御力</span>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-blue-400 font-bold w-8 text-right">${custStats.def}</span>
                                    <button type="button" ${defMinusDisabled ? 'disabled class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustOnlineLobbyCharStat('${c.id}', 'def', -1, '${roomId}', '${mode}')" class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-800"`}>-1</button>
                                    <button type="button" ${defPlusDisabled ? 'disabled class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustOnlineLobbyCharStat('${c.id}', 'def', 1, '${roomId}', '${mode}')" class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-800"`}>+1</button>
                                </div>
                            </div>
                            <div class="flex items-center justify-between bg-slate-900 px-2 py-1.5 rounded">
                                <span class="text-slate-300 font-bold">クリ率</span>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-yellow-400 font-bold w-8 text-right">${custStats.critRate}%</span>
                                    <button type="button" ${critMinusDisabled ? 'disabled class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustOnlineLobbyCharStat('${c.id}', 'critRate', -1, '${roomId}', '${mode}')" class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-800"`}>-1</button>
                                    <button type="button" ${critPlusDisabled ? 'disabled class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustOnlineLobbyCharStat('${c.id}', 'critRate', 1, '${roomId}', '${mode}')" class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-800"`}>+1</button>
                                </div>
                            </div>
                            <div class="flex items-center justify-between bg-slate-900 px-2 py-1.5 rounded sm:col-span-2">
                                <span class="text-slate-300 font-bold">回避率</span>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-purple-400 font-bold w-8 text-right">${custStats.eva}%</span>
                                    <button type="button" ${evaMinusDisabled ? 'disabled class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustOnlineLobbyCharStat('${c.id}', 'eva', -1, '${roomId}', '${mode}')" class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-800"`}>-1</button>
                                    <button type="button" ${evaPlusDisabled ? 'disabled class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"' : `onclick="adjustOnlineLobbyCharStat('${c.id}', 'eva', 1, '${roomId}', '${mode}')" class="pixel-btn px-1.5 py-0.5 text-[11px] bg-slate-800"`}>+1</button>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <button type="button" onclick="resetOnlineLobbyCharStat('${c.id}', '${roomId}', '${mode}')" class="pixel-btn px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 border-slate-600">初期値に戻す</button>
                        </div>
                    </div>
                `;
            } else {
                const isCustomExcluded = ['dopagaking', 'courtney', 'pasha_dark'].includes(c.id);
                statsHtml = `
                    <div class="w-full bg-slate-950 p-2.5 sm:p-3 rounded border border-amber-800 space-y-2 text-xs font-mono">
                        <div class="text-amber-300 font-bold border-b border-amber-900 pb-1">📊 ステータス ${isCustomExcluded ? '(※カスタマイズ対象外)' : ''}</div>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <div class="flex justify-between bg-slate-900 p-1.5 rounded"><span class="text-slate-400">HP:</span><span class="text-emerald-400 font-bold">${c.id === 'dopagaking' ? '？' : c.hp}</span></div>
                            <div class="flex justify-between bg-slate-900 p-1.5 rounded"><span class="text-slate-400">攻撃力:</span><span class="text-red-400 font-bold">${c.id === 'dopagaking' ? '？' : c.atk}</span></div>
                            <div class="flex justify-between bg-slate-900 p-1.5 rounded"><span class="text-slate-400">防御力:</span><span class="text-blue-400 font-bold">${c.id === 'dopagaking' ? '？' : c.def}</span></div>
                            <div class="flex justify-between bg-slate-900 p-1.5 rounded"><span class="text-slate-400">クリ率:</span><span class="text-yellow-400 font-bold">${c.id === 'dopagaking' ? '？%' : Math.round(c.critRate * 100) + '%'}</span></div>
                            <div class="flex justify-between bg-slate-900 p-1.5 rounded col-span-2 sm:col-span-2"><span class="text-slate-400">回避率:</span><span class="text-purple-400 font-bold">${c.id === 'dopagaking' ? '？%' : c.eva + '%'}</span></div>
                        </div>
                    </div>
                `;
            }

            const pashaExtraHtml = c.id === 'pasha' ? `
                <div class="w-full bg-amber-950/60 p-2.5 sm:p-3 rounded border border-amber-400 space-y-1.5 text-xs font-mono">
                    <div class="text-amber-300 font-bold border-b border-amber-600 pb-1">✨ 固有スキル1: カメラフラッシュ仕様</div>
                    <p class="text-amber-200 leading-relaxed font-bold">【解放条件】開幕1ターン待機（2ターン目以降に使用可能）</p>
                    <p class="text-slate-200 leading-relaxed">【効果詳細】敵全体に小ダメージを与え、選択した敵1体を1ターンの間行動不能にする（CD: 3T）。</p>
                </div>
                <div class="w-full bg-amber-950/60 p-2.5 sm:p-3 rounded border border-amber-400 space-y-1.5 text-xs font-mono">
                    <div class="text-amber-300 font-bold border-b border-amber-600 pb-1">✨ 固有パッシブスキル: 対・半浸闇化特効</div>
                    <p class="text-amber-200 leading-relaxed font-bold">【パッシブ効果】敵チームに「SPパシャ憎・半浸闇化状態」がいる場合、自身のクリティカル率がバトル開始時から終了時まで10上昇する。</p>
                    <p class="text-slate-200 leading-relaxed">【発動判定】バトル開始時および毎ターン自動判定され、敵チームに対象が存在する場合、パシャ憎のクリティカル率が常時+10%上昇します。</p>
                </div>
            ` : '';

            const skillsHtml = (c.skills || []).map(s => {
                const cdStr = s.cooldown > 0 ? ` [CT: ${s.cooldown}T]` : '';
                return `
                    <div class="bg-slate-900 p-2 rounded border border-slate-800">
                        <div class="font-bold text-amber-200">${s.name}${cdStr}</div>
                        <div class="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 leading-relaxed">${s.desc}</div>
                    </div>
                `;
            }).join('');

            const actionBtnHtml = (mode === 'player' && roomId && isUnlocked) ? `
                <button type="button" onclick="selectOnlineLobbyCharFromDetailModal('${roomId}', '${c.id}')" class="pixel-btn ${isSelectedInLobby ? 'pixel-btn-success' : 'pixel-btn-primary'} w-full py-2 px-3 text-xs font-bold shadow-lg">
                    ${isSelectedInLobby ? '✓ 選択中（変更を確定）' : '⚔️ このキャラを出陣キャラにする'}
                </button>
            ` : '';

            const modal = document.createElement('div');
            modal.id = 'online-lobby-char-detail-modal';
            modal.className = 'fixed inset-0 bg-black/85 z-[10000] flex items-center justify-center p-2 sm:p-4 select-none';
            modal.onclick = (e) => { if (e.target === modal) closeOnlineLobbyCharDetailModal(); };
            modal.innerHTML = `
                <div class="pixel-box-gold bg-slate-900 border-2 border-amber-400 max-w-4xl w-full p-2.5 sm:p-4 flex flex-col max-h-[92vh] shadow-2xl overflow-hidden text-white">
                    <div class="flex items-center justify-between border-b border-amber-500/40 pb-2 mb-2.5 shrink-0 gap-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="font-pixel text-xs sm:text-base font-bold text-amber-300 truncate">📖 キャラクター詳細${mode === 'bot' ? '（BOT候補）' : ''}</span>
                            ${isSelectedInLobby ? '<span class="bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">★ 選択中</span>' : ''}
                        </div>
                        <button type="button" onclick="closeOnlineLobbyCharDetailModal()" class="pixel-btn pixel-btn-danger px-3 py-1 text-xs font-bold shrink-0">✕ 閉じる</button>
                    </div>

                    <div class="flex-1 min-h-0 flex flex-col sm:flex-row gap-3 overflow-hidden">
                        <div class="w-full sm:w-[215px] md:w-[245px] flex flex-row sm:flex-col items-center sm:justify-between gap-2.5 shrink-0 bg-slate-950/75 p-2.5 rounded border border-slate-800">
                            <div class="flex flex-row sm:flex-col items-center gap-2.5 min-w-0 flex-1 sm:flex-none w-full">
                                <canvas id="online-lobby-detail-cvs" width="140" height="140" class="pixel-box bg-slate-950 border-2 border-amber-500 w-20 h-20 sm:w-32 sm:h-32 shrink-0"></canvas>
                                <div class="text-left sm:text-center min-w-0 flex-1">
                                    <h3 class="text-sm sm:text-lg font-bold text-amber-300 font-pixel truncate">${c.name}</h3>
                                    <p class="text-[11px] sm:text-xs text-amber-200 truncate">${c.title}</p>
                                    <p class="text-[10px] text-slate-300 mt-0.5">${c.type}</p>
                                </div>
                            </div>
                            ${actionBtnHtml ? `<div class="w-auto sm:w-full shrink-0">${actionBtnHtml}</div>` : ''}
                        </div>

                        <div id="online-lobby-detail-right" class="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5 text-xs font-mono">
                            ${statsHtml}
                            <div class="w-full bg-slate-950 p-2.5 sm:p-3 rounded border border-amber-800 space-y-1.5">
                                <div class="text-amber-300 font-bold border-b border-amber-900 pb-1">📖 キャラクター解説</div>
                                <p class="text-slate-200 leading-relaxed whitespace-pre-line">${c.zukanDesc || c.desc}</p>
                            </div>
                            ${pashaExtraHtml}
                            <div class="w-full bg-slate-950 p-2.5 sm:p-3 rounded border border-amber-800 space-y-2">
                                <div class="text-amber-300 font-bold border-b border-amber-900 pb-1">⚔ 所持スキル</div>
                                <div class="space-y-1.5">${skillsHtml}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            setTimeout(() => {
                const cvs = document.getElementById('online-lobby-detail-cvs');
                if (cvs) CharacterRenderer.drawCharacter(cvs, c.id);
                if (prevScrollTop > 0) {
                    const rightEl = document.getElementById('online-lobby-detail-right');
                    if (rightEl) rightEl.scrollTop = prevScrollTop;
                }
            }, 15);
        }

        function closeOnlineLobbyBotCharPicker() {
            const existing = document.getElementById('online-bot-picker-modal');
            if (existing) existing.remove();
        }

        function selectOnlineLobbyBotCharFromPicker(roomId, teamNum, slotIdx, botCharId) {
            closeOnlineLobbyBotCharPicker();
            assignOnlineLobbyBotChar(roomId, teamNum, slotIdx, botCharId);
        }

        function openOnlineLobbyBotCharPicker(roomId, teamNum, slotIdx, currentCharId = 'pasha') {
            audioSystem.playSelect();
            const st = window._onlineLobbyState;
            const myUid = window.getOnlineClientId();
            if (!st.isSoloLocal && st.latestRoomData && st.latestRoomData.hostUid !== myUid) return;
            closeOnlineLobbyBotCharPicker();
            const activeRd = st.isSoloLocal ? st.soloRoomData : st.latestRoomData;
            const teamArr = activeRd ? (teamNum === 1 ? activeRd.team1Slots : activeRd.team2Slots) : [];
            const usedByOthers = getTeamCharIdsExceptSlot(teamArr, slotIdx);
            const chars = Object.values(CHARACTER_DATA);
            const modal = document.createElement('div');
            modal.id = 'online-bot-picker-modal';
            modal.className = 'fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-3 sm:p-5';
            modal.onclick = (e) => { if (e.target === modal) closeOnlineLobbyBotCharPicker(); };
            modal.innerHTML = `
                <div class="pixel-box bg-slate-900 border-2 border-amber-400 max-w-2xl w-full p-4 sm:p-5 flex flex-col max-h-[88vh] shadow-2xl">
                    <div class="flex items-center justify-between border-b border-amber-500/40 pb-2.5 mb-3 shrink-0">
                        <div>
                            <h3 class="font-pixel text-sm sm:text-base font-bold text-amber-300">🤖 BOT割り当てキャラクター選択</h3>
                            <p class="text-[11px] font-mono text-slate-300">同じチーム内で重複しないキャラを選択（画像タップで詳細）</p>
                        </div>
                        <button type="button" onclick="closeOnlineLobbyBotCharPicker()" class="pixel-btn pixel-btn-danger px-3 py-1 text-xs font-bold">✕ 閉じる</button>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto pr-1 flex-1">
                        ${chars.map(c => {
                            const isCurrent = c.id === currentCharId;
                            const isUsedInTeam = !isCurrent && usedByOthers.has(c.id);
                            return `
                                <div ${isUsedInTeam ? '' : `role="button" tabindex="0" onclick="selectOnlineLobbyBotCharFromPicker('${roomId}', ${teamNum}, ${slotIdx}, '${c.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectOnlineLobbyBotCharFromPicker('${roomId}', ${teamNum}, ${slotIdx}, '${c.id}');}"`} class="pixel-box p-2 flex flex-col items-center gap-1 transition-all text-center relative ${isUsedInTeam ? 'border border-slate-800 bg-slate-950/60 opacity-50 cursor-not-allowed' : (isCurrent ? 'border-2 border-amber-400 bg-amber-950/60 shadow-lg cursor-pointer' : 'border border-slate-700 bg-slate-950 hover:border-sky-400 cursor-pointer')}">
                                    ${isUsedInTeam ? '<span class="absolute top-1 left-1 bg-red-900/90 text-red-200 border border-red-500/70 px-1 py-0.5 rounded text-[8px] font-bold z-10">使用中</span>' : ''}
                                    <button type="button" onclick="event.stopPropagation(); openOnlineLobbyCharDetailModal('${c.id}', '${roomId}', 'bot')" title="画像をタップで詳細を表示" aria-label="${c.name}の詳細を表示" class="relative group rounded overflow-hidden border border-slate-700 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer shrink-0">
                                        <canvas id="bot-picker-cvs-${c.id}" width="84" height="84" class="w-16 h-16 sm:w-[72px] sm:h-[72px] block bg-slate-900"></canvas>
                                        <span class="absolute bottom-0.5 right-0.5 bg-slate-950/80 text-sky-300 border border-sky-500/50 rounded px-1 text-[8px] leading-tight pointer-events-none">🔍</span>
                                    </button>
                                    <div class="text-xs font-bold ${isCurrent ? 'text-amber-300' : 'text-white'} truncate max-w-full">${c.name}</div>
                                    <div class="text-[9px] font-mono text-slate-400">${c.id === 'dopagaking' ? 'HP:？ 攻:？ 防:？' : `HP:${c.hp} 攻:${c.atk} 防:${c.def}`}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            setTimeout(() => {
                chars.forEach(c => {
                    const cvs = document.getElementById(`bot-picker-cvs-${c.id}`);
                    if (cvs) CharacterRenderer.drawCharacter(cvs, c.id);
                });
            }, 20);
        }

        async function hostStartOnlineBattleNow(roomId) {
            audioSystem.playSelect();
            const myUid = window.getOnlineClientId();
            const st = window._onlineLobbyState;
            const allIds = Object.keys(CHARACTER_DATA);

            const finalizeSlotsAndStatus = (rd) => {
                const t1 = deduplicateTeamSlots(rd.team1Slots || [], '味方', { fillEmptyHumansAsBots: true }).map(s => ({ ...s, ready: true }));
                const t2 = deduplicateTeamSlots(rd.team2Slots || [], '敵', { fillEmptyHumansAsBots: true }).map(s => ({ ...s, ready: true }));
                return { t1, t2 };
            };

            if (st.isSoloLocal && st.soloRoomData) {
                const res = finalizeSlotsAndStatus(st.soloRoomData);
                const launchedData = { ...st.soloRoomData, team1Slots: res.t1, team2Slots: res.t2, status: 'playing', startedAt: Date.now() };
                launchOnlineSyncedBattle(roomId, launchedData, true);
                return;
            }

            if (!window.fbDb || !window.fbDoc || !window.fbRunTransaction) return;
            const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', roomId);
            await window.fbRunTransaction(window.fbDb, async (tx) => {
                const snap = await tx.get(roomRef);
                if (!snap.exists()) return;
                const rd = snap.data();
                if (rd.hostUid !== myUid || rd.status === 'playing' || rd.status === 'ended') return;
                const now = Date.now();
                const res = finalizeSlotsAndStatus(rd);
                const heartbeats = { ...(rd.battleHeartbeats || {}) };
                [...res.t1, ...res.t2].forEach(s => {
                    if (s && s.type === 'human' && s.uid) heartbeats[s.uid] = now;
                });
                tx.update(roomRef, {
                    team1Slots: res.t1,
                    team2Slots: res.t2,
                    battleHeartbeats: heartbeats,
                    hostLastSeen: now,
                    slotLeaveFlags: {},
                    slotRejoinAt: {},
                    status: 'playing',
                    startedAt: now,
                    updatedAt: now
                });
            }).catch(e => console.warn('Host start battle error:', e));
        }

        async function hostFillEmptySlotsWithBotsAndStart(roomId) {
            return hostStartOnlineBattleNow(roomId);
        }

        function renderOnlineMultiReadyScreen(roomId, initialData = null) {
            const prevSolo = window._onlineLobbyState.isSoloLocal;
            const prevSoloData = window._onlineLobbyState.soloRoomData;
            cleanupOnlineLobby();
            window._onlineLobbyState.roomId = roomId;
            window._onlineLobbyState.waitStartAt = Date.now();
            let latestLobbyData = initialData;
            let lastLobbySig = '';
            if (prevSolo) {
                window._onlineLobbyState.isSoloLocal = true;
                window._onlineLobbyState.soloRoomData = prevSoloData;
            }

            const drawLobbyView = (roomData, forceRedraw = false) => {
                latestLobbyData = roomData;
                window._onlineLobbyState.latestRoomData = roomData;
                window._onlineLobbyState.drawLobbyViewFn = drawLobbyView;
                const container = document.getElementById('screen-container');
                if (!container || !roomData) return;
                const myUid = window.getOnlineClientId();
                const isHost = roomData.hostUid === myUid;
                if (isHost) {
                    const selUid = window._onlineLobbyState.selectedMoveUid;
                    if (!selUid || !findMySlotInRoom(roomData, selUid)) {
                        window._onlineLobbyState.selectedMoveUid = myUid;
                    }
                } else {
                    window._onlineLobbyState.selectedMoveUid = null;
                }
                const moveTargetUid = isHost ? (window._onlineLobbyState.selectedMoveUid || myUid) : '';
                const sig = JSON.stringify({
                    st: roomData.status,
                    rc: roomData.roomCode,
                    hu: roomData.hostUid,
                    mt: moveTargetUid,
                    t1: (roomData.team1Slots || []).map(s => [s?.type, s?.uid, s?.playerName, s?.charConfig?.charId, s?.ready]),
                    t2: (roomData.team2Slots || []).map(s => [s?.type, s?.uid, s?.playerName, s?.charConfig?.charId, s?.ready])
                });
                if (!forceRedraw && sig === lastLobbySig) return;
                lastLobbySig = sig;
                const myFound = findMySlotInRoom(roomData, myUid);
                const myTeamNum = myFound ? myFound.teamNum : 1;
                const mySlot = myFound ? myFound.slot : null;
                const myCharId = mySlot?.charConfig?.charId || getSelectedOnlineMultiChar();
                const isMyReady = !!(mySlot && mySlot.ready);

                const stats = countHumanSlotStats(roomData);
                const allyTeamNum = myTeamNum;
                const enemyTeamNum = myTeamNum === 1 ? 2 : 1;
                const allySlots = allyTeamNum === 1 ? (roomData.team1Slots || []) : (roomData.team2Slots || []);
                const enemySlots = enemyTeamNum === 1 ? (roomData.team1Slots || []) : (roomData.team2Slots || []);

                const renderLobbySlotList = (slots, teamNum, isAllySide) => slots.map((s, idx) => {
                    if (!s || s.type === 'bot') {
                        const botCharId = (s && s.charConfig && s.charConfig.charId) || 'pasha';
                        const botChar = CHARACTER_DATA[botCharId] || {};
                        return `
                            <div class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded border-2 border-amber-500/70 bg-slate-900/95">
                                <div class="flex items-center gap-2 min-w-0">
                                    <canvas id="lobby-bot-cvs-${teamNum}-${idx}" width="32" height="32" class="w-8 h-8 rounded bg-slate-950 border border-amber-500/70 shrink-0"></canvas>
                                    <div class="min-w-0">
                                        <div class="text-xs font-bold text-amber-300 truncate">🤖 ${isAllySide ? '味方BOT' : '敵BOT'} ${idx + 1}：${botChar.name || botCharId}</div>
                                        <div class="text-[10px] text-slate-400 font-mono">HP:${botChar.hp || '?'} 攻:${botChar.atk || '?'} 防:${botChar.def || '?'}</div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-1 shrink-0">
                                    ${isHost ? `
                                        <button type="button" onclick="openOnlineLobbyBotCharPicker('${roomId}', ${teamNum}, ${idx}, '${botCharId}')" class="pixel-btn pixel-btn-primary px-2 py-0.5 text-[10px] font-bold whitespace-nowrap" title="BOTキャラクターを指定・変更">🎭 キャラ</button>
                                        <button type="button" onclick="toggleOnlineMultiLobbySlotType('${roomId}', ${teamNum}, ${idx})" class="pixel-btn px-2 py-0.5 text-[10px] bg-slate-800 border-slate-500 text-sky-300 font-bold whitespace-nowrap" title="空き人間枠へ切り替え">⇄ 人間</button>
                                    ` : `<span class="text-[10px] font-pixel px-2 py-0.5 rounded bg-amber-900/70 text-amber-200 border border-amber-500/60 shrink-0">🤖 BOT</span>`}
                                </div>
                            </div>
                        `;
                    }
                    if (!s.uid) {
                        return `
                            <div class="flex items-center justify-between gap-2 px-2.5 py-2 rounded border border-dashed border-slate-600 bg-slate-950/85">
                                <div class="flex items-center gap-2 min-w-0">
                                    <span class="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-xs text-slate-400 shrink-0">⏳</span>
                                    <div class="min-w-0">
                                        <div class="text-xs font-bold text-slate-300 truncate">空きプレイヤー枠</div>
                                        <div class="text-[10px] text-slate-500 font-mono">参加待機中（開始時にBOT補充可）</div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-1 shrink-0">
                                    ${isHost ? `
                                        ${!window._onlineLobbyState.isSoloLocal ? `
                                            <button type="button" onclick="moveOnlineMultiLobbySlot('${roomId}', ${teamNum}, ${idx})" class="pixel-btn px-2 py-0.5 text-[10px] bg-slate-800 border-slate-500 text-sky-300 font-bold whitespace-nowrap">⇄ 移動</button>
                                        ` : ''}
                                        <button type="button" onclick="toggleOnlineMultiLobbySlotType('${roomId}', ${teamNum}, ${idx})" class="pixel-btn px-2 py-0.5 text-[10px] bg-amber-950 border-amber-500 text-amber-300 font-bold whitespace-nowrap" title="この枠をBOTに切り替え">⇄ BOT</button>
                                    ` : `<span class="text-[10px] font-mono text-slate-500 px-1.5">空き枠</span>`}
                                </div>
                            </div>
                        `;
                    }
                    const isMe = s.uid === myUid;
                    const charId = s.charConfig?.charId || 'asaiomizu';
                    const charName = (CHARACTER_DATA[charId] && CHARACTER_DATA[charId].name) || charId;
                    const isSlotHost = s.uid === roomData.hostUid;
                    const isSelectedForMove = isHost && !window._onlineLobbyState.isSoloLocal && stats.joinedHumans >= 2 && s.uid === moveTargetUid;
                    const borderColor = isSelectedForMove
                        ? 'border-sky-400 bg-sky-950/50'
                        : (isMe ? 'border-emerald-400 bg-emerald-950/60' : (isAllySide ? 'border-emerald-600/80 bg-emerald-950/35' : 'border-red-500/80 bg-red-950/35'));
                    return `
                        <div class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded border-2 ${borderColor}">
                            <div class="flex items-center gap-2 min-w-0">
                                <canvas id="lobby-slot-cvs-${teamNum}-${idx}" width="32" height="32" class="w-8 h-8 rounded bg-slate-950 border border-slate-700 shrink-0"></canvas>
                                <div class="min-w-0">
                                    <div class="text-xs font-bold ${isMe ? 'text-emerald-300' : 'text-white'} truncate">
                                        ${isMe ? 'あなた（操作）' : (s.playerName || 'プレイヤー')}${isSlotHost && isMe ? ' 🔒' : ''}
                                    </div>
                                    <div class="text-[10px] text-amber-300 font-mono truncate">使用: ${charName}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-1 shrink-0">
                                ${isHost && !window._onlineLobbyState.isSoloLocal && stats.joinedHumans >= 2 ? (
                                    isSelectedForMove
                                        ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-700 text-white border border-sky-300 whitespace-nowrap">✓ 移動対象</span>`
                                        : `<button type="button" onclick="selectOnlineLobbyMovePlayer('${s.uid}')" class="pixel-btn px-1.5 py-0.5 text-[10px] bg-slate-800 border-sky-500 text-sky-300 font-bold whitespace-nowrap" title="このプレイヤーを空き枠へ移動対象に選択">⇄ 選択</button>`
                                ) : ''}
                                <span class="text-[10px] font-pixel font-bold px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ${s.ready ? 'bg-emerald-700 text-white border-emerald-300' : 'bg-slate-800 text-amber-300 border-amber-500/60'}">
                                    ${isSlotHost && !s.ready ? '🔒 ホスト' : (s.ready ? '✅ 完了' : '⏳ 準備中')}
                                </span>
                            </div>
                        </div>
                    `;
                }).join('');

                let bannerText = '';
                let bannerStyle = '';
                if (!stats.allJoined) {
                    bannerText = isHost
                        ? `⏳ 参加者待機中 (${stats.joinedHumans}/${stats.requiredHumans}人参加) — ホストはプレイヤー移動・BOT設定・対戦開始が可能です`
                        : `⏳ 参加者待機中 (${stats.joinedHumans}/${stats.requiredHumans}人参加) — キャラを選んで「完了」でお待ちください（配置・BOT設定はホストのみ）`;
                    bannerStyle = 'bg-amber-950/70 border-amber-500 text-amber-200';
                } else if (!stats.allReady) {
                    bannerText = `🎉 メンバー揃いました！(${stats.joinedHumans}/${stats.requiredHumans}人) — キャラを選んで「✅ 完了」またはホストが「⚔️ 対戦開始」を押してください`;
                    bannerStyle = 'bg-sky-950/80 border-sky-400 text-sky-200';
                } else {
                    bannerText = '⚔️ 全員準備完了！まもなくバトルを開始します！';
                    bannerStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 animate-pulse';
                }

                const unlockedList = Object.values(CHARACTER_DATA).filter(c => playerState.unlockedChars.includes(c.id));

                container.innerHTML = `
                    <div class="relative w-full h-full flex flex-col justify-between p-2.5 sm:p-4 select-none overflow-hidden bg-slate-950 text-white">
                        <div class="flex items-center justify-between gap-2 w-full mb-1.5 shrink-0">
                            <button onclick="cancelOnlineRoomAndReturn('multi')" class="pixel-btn pixel-btn-danger px-2.5 py-1 text-xs font-bold whitespace-nowrap shrink-0">
                                ◀ 退出
                            </button>
                            <div class="flex items-center gap-2 min-w-0">
                                <h2 class="text-sky-300 font-pixel text-xs sm:text-base font-bold whitespace-nowrap truncate">🛡️ 対戦準備画面（編成・BOT設定）</h2>
                                ${roomData.roomCode ? `
                                    <span class="bg-amber-950 border border-amber-400 text-amber-300 font-mono font-bold text-xs px-2 py-0.5 rounded whitespace-nowrap">ID: ${roomData.roomCode}</span>
                                    <button type="button" onclick="shareOnlineRoomCode('${roomData.roomCode}')" class="pixel-btn pixel-btn-primary px-2 py-0.5 text-[10px] font-bold whitespace-nowrap inline-flex items-center justify-center" title="ルームIDを共有" aria-label="ルームIDを共有">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                                            <circle cx="18" cy="5" r="3"></circle>
                                            <circle cx="6" cy="12" r="3"></circle>
                                            <circle cx="18" cy="19" r="3"></circle>
                                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                        </svg>
                                    </button>
                                    <span id="room-code-copy-toast" class="text-[10px] text-emerald-300 font-bold"></span>
                                ` : `<span class="bg-slate-900 border border-sky-500/60 text-sky-300 font-mono text-[10px] px-2 py-0.5 rounded whitespace-nowrap">${roomData.matchType === 'solo' ? 'ソロ練習' : 'フレンド対戦'}</span>`}
                            </div>
                            <div class="text-[11px] font-mono text-amber-300 whitespace-nowrap shrink-0">${stats.readyHumans}/${stats.requiredHumans} 完了</div>
                        </div>

                        <div class="px-3 py-1.5 rounded border text-[11px] font-mono text-center mb-2 shrink-0 ${bannerStyle}">
                            ${bannerText}
                        </div>

                        <div class="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto pr-0.5">
                            <!-- 上段: 味方3枠 vs 敵3枠 -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
                                <div class="pixel-box bg-slate-900/90 border border-emerald-700/80 p-2 space-y-1.5">
                                    <div class="text-[11px] font-pixel font-bold text-emerald-300">🛡️ あなたのチーム (3枠)</div>
                                    <div class="space-y-1">${renderLobbySlotList(allySlots, allyTeamNum, true)}</div>
                                </div>
                                <div class="pixel-box bg-slate-900/90 border border-red-700/80 p-2 space-y-1.5">
                                    <div class="text-[11px] font-pixel font-bold text-red-300">⚔️ 相手チーム (3枠)</div>
                                    <div class="space-y-1">${renderLobbySlotList(enemySlots, enemyTeamNum, false)}</div>
                                </div>
                            </div>

                            <!-- 下段: 自分の出陣キャラ1体選択 -->
                            <div class="pixel-box bg-slate-900/95 border border-slate-700 p-2 space-y-1.5">
                                <div class="flex items-center justify-between gap-2 flex-wrap">
                                    <span class="text-[11px] font-pixel font-bold text-amber-300">⚔️ あなたの出陣キャラ (1体選択・画像タップで詳細)</span>
                                    <div class="flex items-center gap-2">
                                        <span class="text-[10px] font-mono text-emerald-300">選択中: <b>${(CHARACTER_DATA[myCharId] || {}).name || myCharId}</b></span>
                                        <button type="button" onclick="openOnlineLobbyCharDetailModal('${myCharId}', '${roomId}', 'player')" class="pixel-btn px-2 py-0.5 text-[10px] font-bold bg-sky-900/90 border-sky-400 text-sky-200 hover:bg-sky-800">🔍 詳細</button>
                                    </div>
                                </div>
                                <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
                                    ${(() => {
                                        const allyHumanUsed = new Set();
                                        const allyBotUsed = new Set();
                                        (allySlots || []).forEach(s => {
                                            if (!s || s.uid === myUid) return;
                                            const cid = s.charConfig && s.charConfig.charId;
                                            if (!cid) return;
                                            if (s.type === 'human' && s.uid) allyHumanUsed.add(cid);
                                            else if (s.type === 'bot') allyBotUsed.add(cid);
                                        });
                                        return unlockedList.map(c => {
                                            const selected = c.id === myCharId;
                                            const usedByAllyHuman = !selected && allyHumanUsed.has(c.id);
                                            const usedByAllyBot = !selected && !usedByAllyHuman && allyBotUsed.has(c.id);
                                            return `
                                                <div role="button" tabindex="0" onclick="selectOnlineMultiLobbyChar('${roomId}', '${c.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectOnlineMultiLobbyChar('${roomId}', '${c.id}');}" class="p-1.5 rounded border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${selected ? 'border-emerald-400 bg-emerald-950/70 shadow' : (usedByAllyHuman ? 'border-red-800/70 bg-slate-950/60 opacity-65' : 'border-slate-700 bg-slate-950 hover:border-slate-400')}">
                                                    ${usedByAllyHuman ? '<span class="absolute top-0.5 left-0.5 bg-red-900/90 text-red-200 border border-red-500/70 px-1 rounded text-[8px] font-bold z-10 pointer-events-none">味方使用中</span>' : (usedByAllyBot ? '<span class="absolute top-0.5 left-0.5 bg-amber-900/90 text-amber-200 border border-amber-500/70 px-1 rounded text-[8px] font-bold z-10 pointer-events-none">味方BOT</span>' : '')}
                                                    <button type="button" onclick="event.stopPropagation(); openOnlineLobbyCharDetailModal('${c.id}', '${roomId}', 'player')" title="画像をタップで詳細を表示" aria-label="${c.name}の詳細を表示" class="relative rounded overflow-hidden border border-slate-700/80 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer shrink-0">
                                                        <canvas id="lobby-pick-cvs-${c.id}" width="84" height="84" class="w-14 h-14 sm:w-16 sm:h-16 block bg-slate-900"></canvas>
                                                        <span class="absolute bottom-0.5 right-0.5 bg-slate-950/80 text-sky-300 border border-sky-500/50 rounded px-1 text-[8px] leading-tight pointer-events-none">🔍</span>
                                                    </button>
                                                    <span class="text-[10px] sm:text-[11px] font-bold truncate max-w-full ${selected ? 'text-emerald-300' : 'text-slate-200'}">${c.name}</span>
                                                </div>
                                            `;
                                        }).join('');
                                    })()}
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center justify-center gap-2 pt-2 shrink-0">
                            <button type="button" onclick="toggleOnlineMultiLobbyReady('${roomId}')" class="pixel-btn ${isMyReady ? 'pixel-btn-warning' : 'pixel-btn-primary'} px-6 py-2 text-xs sm:text-sm font-bold font-pixel shadow-lg whitespace-nowrap">
                                ${isMyReady ? '⏳ 準備完了を解除する' : '✅ 完了（準備OK）'}
                            </button>
                            ${isHost ? `
                                <button type="button" onclick="hostStartOnlineBattleNow('${roomId}')" class="pixel-btn pixel-btn-success px-8 py-2 text-xs sm:text-sm font-bold font-pixel shadow-xl whitespace-nowrap">
                                    ${stats.allJoined ? '⚔️ 対戦開始！' : '⚔️ 対戦開始（空き枠は自動BOT補充）'}
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;

                setTimeout(() => {
                    allySlots.forEach((s, idx) => {
                        if (s && s.type === 'human' && s.uid) {
                            const cvs = document.getElementById(`lobby-slot-cvs-${allyTeamNum}-${idx}`);
                            if (cvs) CharacterRenderer.drawCharacter(cvs, s.charConfig?.charId || 'asaiomizu');
                        } else if (s && s.type === 'bot') {
                            const cvs = document.getElementById(`lobby-bot-cvs-${allyTeamNum}-${idx}`);
                            if (cvs) CharacterRenderer.drawCharacter(cvs, s.charConfig?.charId || 'pasha');
                        }
                    });
                    enemySlots.forEach((s, idx) => {
                        if (s && s.type === 'human' && s.uid) {
                            const cvs = document.getElementById(`lobby-slot-cvs-${enemyTeamNum}-${idx}`);
                            if (cvs) CharacterRenderer.drawCharacter(cvs, s.charConfig?.charId || 'asaiomizu');
                        } else if (s && s.type === 'bot') {
                            const cvs = document.getElementById(`lobby-bot-cvs-${enemyTeamNum}-${idx}`);
                            if (cvs) CharacterRenderer.drawCharacter(cvs, s.charConfig?.charId || 'pasha');
                        }
                    });
                    unlockedList.forEach(c => {
                        const cvs = document.getElementById(`lobby-pick-cvs-${c.id}`);
                        if (cvs) CharacterRenderer.drawCharacter(cvs, c.id);
                    });
                }, 30);
            };

            if (initialData) {
                drawLobbyView(initialData);
            }

            if (window._onlineLobbyState.isSoloLocal || !window.fbDb || !window.fbDoc || !window.fbOnSnapshot) {
                return;
            }


            const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', roomId);

            window._onlineLobbyState.unsub = window.fbOnSnapshot(roomRef, (snap) => {
                if (!snap.exists()) return;
                const rd = snap.data();
                if (!rd || rd.status === 'ended') {
                    cleanupOnlineLobby();
                    closeOnlineLobbyBotCharPicker();
                    showModal('ルーム解散', 'ホストがルームを終了しました。');
                    renderOnlineModesScreen();
                    return;
                }
                drawLobbyView(rd);
                const stats = countHumanSlotStats(rd);
                const myUid = window.getOnlineClientId();
                if (stats.allReady && rd.hostUid === myUid && rd.status !== 'playing') {
                    const now = Date.now();
                    const dedupT1 = deduplicateTeamSlots(rd.team1Slots || [], '味方', { fillEmptyHumansAsBots: true });
                    const dedupT2 = deduplicateTeamSlots(rd.team2Slots || [], '敵', { fillEmptyHumansAsBots: true });
                    const heartbeats = { ...(rd.battleHeartbeats || {}) };
                    [...dedupT1, ...dedupT2].forEach(s => {
                        if (s && s.type === 'human' && s.uid) heartbeats[s.uid] = now;
                    });
                    window.fbUpdateDoc(roomRef, {
                        team1Slots: dedupT1,
                        team2Slots: dedupT2,
                        status: 'playing',
                        startedAt: now,
                        hostLastSeen: now,
                        battleHeartbeats: heartbeats,
                        slotLeaveFlags: {},
                        slotRejoinAt: {},
                        updatedAt: now
                    }).catch(() => {});
                }
                if ((rd.status === 'playing' || stats.allReady) && window._onlineLobbyState.launchedRoomId !== roomId) {
                    if (rd.status === 'playing') {
                        closeOnlineLobbyBotCharPicker();
                        window._onlineLobbyState.launchedRoomId = roomId;
                        window._onlineLobbyState.launchTimeoutId = setTimeout(() => {
                            launchOnlineSyncedBattle(roomId, rd, false, { isResume: !!rd.battleState });
                        }, 600);
                    }
                }
            });
        }

        async function launchOnlineSyncedBattle(roomId, roomData, isLocalSolo = false, launchOptions = {}) {
            audioSystem.playSelect();
            cleanupOnlineLobby();
            closeOnlineLobbyBotCharPicker();
            closeOnlineLobbyCharDetailModal();
            window.isOnlineBattleMode = true;
            newBattleViewMode = 'main';
            isNewBattleSkillModalOpen = false;
            const isResume = !!(launchOptions && launchOptions.isResume && roomData && roomData.battleState);

            const launchToken = (window._onlineBattleLaunchSeq = (window._onlineBattleLaunchSeq || 0) + 1);
            if (window.AssetPreloader && !window.AssetPreloader.isComplete) {
                const container = document.getElementById('screen-container');
                if (container) {
                    container.innerHTML = `
                        <div class="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center gap-3">
                            <div class="text-3xl animate-bounce">📦</div>
                            <div class="text-sm sm:text-base font-pixel font-bold text-amber-300">バトルデータを端末に読み込み中...</div>
                            <div class="text-xs font-mono text-slate-400">表示エラー防止のため全キャラクター・背景画像を準備しています</div>
                        </div>
                    `;
                }
                await window.AssetPreloader.ensureReady(5000);
                if (launchToken !== window._onlineBattleLaunchSeq) return;
            }

            if (activeNewBattle) {
                activeNewBattle.battleEnded = true;
                activeNewBattle.destroy();
                activeNewBattle.stopElapsedTimer();
                activeNewBattle = null;
            }

            const myUid = window.getOnlineClientId();
            const isHost = isLocalSolo ? true : (roomData.hostUid === myUid);
            const is2p = roomData.mode === '2p';
            let myTeamNum = 1;
            let myControlSlots = [0, 1, 2];

            if (!is2p) {
                const found = findMySlotInRoom(roomData, myUid)
                    || findMyRejoinableSlotInRoom(roomData, [myUid], (typeof playerState !== 'undefined' && playerState.playerId) ? playerState.playerId : null);
                myTeamNum = found ? found.teamNum : 1;
                myControlSlots = found ? [found.slotIdx] : [0];
            } else {
                myTeamNum = isHost ? 1 : 2;
                myControlSlots = [0, 1, 2];
            }

            if (!isLocalSolo && roomData && roomData.roomCode && typeof window.saveOnlineRejoinTicket === 'function') {
                window.saveOnlineRejoinTicket(roomId, roomData.roomCode, myUid, { teamNum: myTeamNum, slotIdx: myControlSlots[0] || 0 });
            }

            const fillBotCharConfigs = (slots, teamLabel) => deduplicateTeamSlots(slots, teamLabel, { fillEmptyHumansAsBots: true });

            const t1Slots = fillBotCharConfigs(roomData.team1Slots || [], '味方');
            const t2Slots = fillBotCharConfigs(roomData.team2Slots || [], '敵');
            const hasRemoteHuman = !isLocalSolo && [...t1Slots, ...t2Slots].some(s => s && s.type === 'human' && s.uid && s.uid !== myUid);
            const hadBotTakeover = [...t1Slots, ...t2Slots].some(s => s && s.botTakeover);
            const useSyncedFirestore = !isLocalSolo && (hasRemoteHuman || isResume || roomData.matchType === 'code' || hadBotTakeover);
            const myTeamConfigs = (myTeamNum === 1 ? t1Slots : t2Slots).map(s => s.charConfig.charId);
            const oppLeadId = (myTeamNum === 1 ? t2Slots : t1Slots)[0]?.charConfig?.charId || 'pasha';

            const battleOptions = {
                isOnlineBattleMode: true,
                isOnlineSynced: useSyncedFirestore,
                isOnlineHost: isHost,
                onlineClientId: myUid,
                roomCode: roomData.roomCode || null,
                isResume: isResume,
                resumeBattleState: isResume ? roomData.battleState : null,
                resumeStartedAt: roomData.startedAt || null,
                myTeamNum: myTeamNum,
                myControlSlots: myControlSlots,
                matchMode: is2p ? '2p' : 'multi',
                controlSingleAllyOnly: !is2p,
                controlledAllyIndex: myControlSlots[0] || 0,
                team1Slots: t1Slots,
                team2Slots: t2Slots,
                allySlots: (myTeamNum === 1 ? t1Slots : t2Slots).map(s => s.type),
                enemySlots: (myTeamNum === 1 ? t2Slots : t1Slots).map(s => s.type),
                allyHumanCount: (myTeamNum === 1 ? t1Slots : t2Slots).filter(s => s.type === 'human' && !s.botTakeover).length,
                enemyHumanCount: (myTeamNum === 1 ? t2Slots : t1Slots).filter(s => s.type === 'human' && !s.botTakeover).length
            };

            activeNewBattle = new BattleEngine(
                myTeamConfigs,
                oppLeadId,
                useSyncedFirestore,
                myTeamNum,
                useSyncedFirestore ? roomId : null,
                true,
                battleOptions
            );
            activeNewBattle.latestRoomData = roomData;

            activeNewBattle.onLogUpdate = (msg, colorClass, teamType) => {
                appendNewBattleLog(msg, colorClass, teamType);
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
            activeNewBattle.onStateChange = () => {
                renderNewBattleScreen();
            };
            activeNewBattle.onCutin = (title, subtitle) => {
                if (typeof triggerCutinBanner === 'function') triggerCutinBanner(title, subtitle);
            };
            activeNewBattle.onBattleEnd = () => {
                updateNewBattleUIValues();
                handleNewBattleEnd();
            };

            activeNewBattle.startBattle();
            renderNewBattleScreen();
        }

        window.proceedFromMultiSetupToMatchmaking = proceedFromMultiSetupToMatchmaking;
        window.renderOnlineMatchmakingScreen = renderOnlineMatchmakingScreen;
        window.fallbackLaunchBotFromMatchmaking = fallbackLaunchBotFromMatchmaking;
        window.startSoloMultiReadyLobby = startSoloMultiReadyLobby;
        window.createOnlineCodeRoom = createOnlineCodeRoom;
        window.joinOnlineRoomByCode = joinOnlineRoomByCode;
        window.copyOnlineRoomCode = copyOnlineRoomCode;
        window.shareOnlineRoomCode = shareOnlineRoomCode;
        window.copyOnlineRoomInviteText = copyOnlineRoomInviteText;
        window.cancelOnlineRoomAndReturn = cancelOnlineRoomAndReturn;
        window.hostFill2pWithBotsAndStart = hostFill2pWithBotsAndStart;
        window.renderOnlineWaitingRoomScreen = renderOnlineWaitingRoomScreen;
        window.renderOnlineMultiReadyScreen = renderOnlineMultiReadyScreen;
        window.selectOnlineMultiLobbyChar = selectOnlineMultiLobbyChar;
        window.toggleOnlineMultiLobbyReady = toggleOnlineMultiLobbyReady;
        window.selectOnlineLobbyMovePlayer = selectOnlineLobbyMovePlayer;
        window.moveOnlineMultiLobbySlot = moveOnlineMultiLobbySlot;
        window.toggleOnlineMultiLobbySlotType = toggleOnlineMultiLobbySlotType;
        window.assignOnlineLobbyBotChar = assignOnlineLobbyBotChar;
        window.openOnlineLobbyBotCharPicker = openOnlineLobbyBotCharPicker;
        window.closeOnlineLobbyBotCharPicker = closeOnlineLobbyBotCharPicker;
        window.selectOnlineLobbyBotCharFromPicker = selectOnlineLobbyBotCharFromPicker;
        window.openOnlineLobbyCharDetailModal = openOnlineLobbyCharDetailModal;
        window.closeOnlineLobbyCharDetailModal = closeOnlineLobbyCharDetailModal;
        window.adjustOnlineLobbyCharStat = adjustOnlineLobbyCharStat;
        window.resetOnlineLobbyCharStat = resetOnlineLobbyCharStat;
        window.selectOnlineLobbyCharFromDetailModal = selectOnlineLobbyCharFromDetailModal;
        window.hostStartOnlineBattleNow = hostStartOnlineBattleNow;
        window.hostFillEmptySlotsWithBotsAndStart = hostFillEmptySlotsWithBotsAndStart;
        window.launchOnlineSyncedBattle = launchOnlineSyncedBattle;
        window.cleanupOnlineLobby = cleanupOnlineLobby;

        window.getOnlineBattleConfig = getOnlineBattleConfig;
        window.setOnlineMatchFormat = setOnlineMatchFormat;
        window.toggleOnlineTeamSlot = toggleOnlineTeamSlot;
        window.getSelectedOnlineMultiChar = getSelectedOnlineMultiChar;
        window.saveSelectedOnlineMultiChar = saveSelectedOnlineMultiChar;
        window.selectOnlineMultiChar = selectOnlineMultiChar;
        window.startSelectedOnlineMultiChar = startSelectedOnlineMultiChar;

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

        function resetBattleUIAndModals() {
            if (typeof isNewBattleSkillModalOpen !== 'undefined') {
                isNewBattleSkillModalOpen = false;
            }
            if (typeof newBattleViewMode !== 'undefined') {
                newBattleViewMode = 'main';
            }
            if (typeof newBattleTargetSelectSkillId !== 'undefined') {
                newBattleTargetSelectSkillId = null;
            }
            if (typeof newBattleTargetSelectType !== 'undefined') {
                newBattleTargetSelectType = null;
            }

            try { window.isNewBattleSkillModalOpen = false; } catch(e) {}
            try { window.newBattleViewMode = 'main'; } catch(e) {}
            try { window.newBattleTargetSelectSkillId = null; } catch(e) {}
            try { window.newBattleTargetSelectType = null; } catch(e) {}

            const obeyModal = document.getElementById('dopa-obey-modal');
            if (obeyModal) {
                obeyModal.style.display = 'none';
                obeyModal.remove();
            }
            if (typeof _activeDopaObeyAttacker !== 'undefined') window._activeDopaObeyAttacker = null;
            if (typeof _activeDopaObeyTarget !== 'undefined') window._activeDopaObeyTarget = null;

            if (typeof hideBattleCharTooltip === 'function') {
                hideBattleCharTooltip();
            } else {
                const tooltip = document.getElementById('battle-char-tooltip');
                if (tooltip) tooltip.remove();
            }

            if (typeof closeSettingsPanel === 'function') {
                closeSettingsPanel();
            } else {
                const backdrop = document.getElementById('settings-backdrop');
                const panel = document.getElementById('settings-slide-panel');
                if (backdrop) backdrop.style.display = 'none';
                if (panel) panel.style.display = 'none';
            }

            closeModal();

            if (typeof renderNewBattleScreen === 'function') {
                renderNewBattleScreen();
            }
        }
        window.resetBattleUIAndModals = resetBattleUIAndModals;

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

            renderZukanDetailScreen(charId, 'new_select', sortOrder, sortDir, onlyOwned, !!window.isOnlineBattleMode);
        }

        function resetNewBattleStats(charId, sortOrder, sortDir, onlyOwned) {
            if (playerState.newBattleCustomStats) {
                delete playerState.newBattleCustomStats[charId];
            }
            getNewBattleCustomStats(charId);
            savePlayerState();
            renderZukanDetailScreen(charId, 'new_select', sortOrder, sortDir, onlyOwned, !!window.isOnlineBattleMode);
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
                const sortOrder = arg1 || 'default';
                const sortDir = arg2 || 'desc';
                const onlyOwned = (arg3 === true || arg3 === 'true');
                const isOnline = (arg4 === true || arg4 === 'true' || !!window.isOnlineBattleMode);
                backAction = `renderNewBattleCharSelectScreen('${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline})`;
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
                const onlyOwned = (arg3 === true || arg3 === 'true');
                const isOnline = (arg4 === true || arg4 === 'true' || !!window.isOnlineBattleMode);
                const onlineCfg = typeof getOnlineBattleConfig === 'function' ? getOnlineBattleConfig() : { matchMode: '2p' };
                const isOnlineMultiSingle = isOnline && onlineCfg.matchMode === 'multi';
                if (isUnlocked) {
                    const isEligibleCustom = !['dopagaking', 'courtney', 'pasha_dark'].includes(c.id);
                    if (isOnlineMultiSingle) {
                        const currentSingle = typeof getSelectedOnlineMultiChar === 'function' ? getSelectedOnlineMultiChar() : null;
                        const isCurrentlyChosen = currentSingle === c.id;
                        html += `
                            <button onclick="
                                ${isEligibleCustom ? `if (validateCharCustomStats('${c.id}')) { saveSelectedOnlineMultiChar('${c.id}'); renderNewBattleCharSelectScreen('${sortOrder}', '${sortDir}', ${onlyOwned}, true); }` : `saveSelectedOnlineMultiChar('${c.id}'); renderNewBattleCharSelectScreen('${sortOrder}', '${sortDir}', ${onlyOwned}, true);`}
                            " class="pixel-btn ${isCurrentlyChosen ? 'pixel-btn-success' : 'pixel-btn-primary'} w-full py-2.5 font-bold text-xs sm:text-sm shadow-lg mt-auto">
                                ${isCurrentlyChosen ? '✓ 操作キャラに設定中 (戻る)' : '⚔ この1体を操作キャラにする'}
                            </button>
                        `;
                    } else {
                        const team = typeof getSelectedNewBattleTeam === 'function' ? getSelectedNewBattleTeam() : [window.selectedNewBattleChar || null, null, null];
                        const existingSlotIdx = team.indexOf(c.id);
                        const targetSlotIdx = existingSlotIdx !== -1 ? existingSlotIdx : (typeof getActiveTeamSlotIndex === 'function' ? getActiveTeamSlotIndex() : 0);
                        if (existingSlotIdx !== -1) {
                            html += `
                                <div class="w-full flex flex-col gap-1.5 mt-auto">
                                    <button onclick="${isEligibleCustom ? `if (validateCharCustomStats('${c.id}')) { renderNewBattleCharSelectScreen('${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline}); }` : `renderNewBattleCharSelectScreen('${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline});`}" class="pixel-btn pixel-btn-success w-full py-2.5 font-bold text-xs sm:text-sm shadow-lg">
                                        ✓ ${existingSlotIdx + 1}体目に編成中 (戻る)
                                    </button>
                                    <button onclick="clearNewBattleTeamSlot(${existingSlotIdx}, '${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline});" class="pixel-btn pixel-btn-danger w-full py-1.5 font-bold text-xs shadow">
                                        ✕ チームから外す
                                    </button>
                                </div>
                            `;
                        } else if (isEligibleCustom) {
                            html += `
                                <button onclick="
                                    if (validateCharCustomStats('${c.id}')) {
                                        assignNewBattleTeamSlot(${targetSlotIdx}, '${c.id}');
                                        renderNewBattleCharSelectScreen('${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline});
                                    }
                                " class="pixel-btn pixel-btn-primary w-full py-2.5 font-bold text-xs sm:text-sm shadow-lg mt-auto">
                                    ⚔ ${targetSlotIdx + 1}体目に編成する
                                </button>
                            `;
                        } else {
                            html += `
                                <button onclick="assignNewBattleTeamSlot(${targetSlotIdx}, '${c.id}'); renderNewBattleCharSelectScreen('${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline});" class="pixel-btn pixel-btn-primary w-full py-2.5 font-bold text-xs sm:text-sm shadow-lg mt-auto">
                                    ⚔ ${targetSlotIdx + 1}体目に編成する
                                </button>
                            `;
                        }
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
                    const onlyOwned = (arg3 === true || arg3 === 'true');

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
                chargedImage: 'momopin/momopinNASU.webp',
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

        // Removed duplicate momopin definition
        window.CHARACTER_DATA = CHARACTER_DATA;

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
            constructor(p1CharId, p2CharId, isOnline = false, myPlayerNum = 1, roomId = null, isNewBattle = false, battleOptions = null) {
                this.isOnline = isOnline;
                this.myPlayerNum = myPlayerNum;
                this.roomId = roomId;
                this.isNewBattle = isNewBattle;
                const opts = battleOptions || {};
                this.isOnlineBattleMode = !!opts.isOnlineBattleMode;
                this.isOnlineSynced = !!(opts.isOnlineSynced && isOnline && roomId);
                this.isOnlineHost = !!opts.isOnlineHost;
                this.onlineClientId = opts.onlineClientId || (typeof window.getOnlineClientId === 'function' ? window.getOnlineClientId() : 'local');
                this.roomCode = opts.roomCode || null;
                this.isResume = !!opts.isResume;
                this.resumeBattleState = opts.resumeBattleState || null;
                this.resumeStartedAt = opts.resumeStartedAt || null;
                this.myTeamNum = opts.myTeamNum || myPlayerNum || 1;
                this.onlineMatchMode = opts.matchMode || '2p';
                this.allySlots = Array.isArray(opts.allySlots) && opts.allySlots.length === 3 ? [...opts.allySlots] : ['human', 'human', 'human'];
                this.enemySlots = Array.isArray(opts.enemySlots) && opts.enemySlots.length === 3 ? [...opts.enemySlots] : ['human', 'human', 'human'];
                this.allyHumanCount = typeof opts.allyHumanCount === 'number' ? opts.allyHumanCount : this.allySlots.filter(s => s === 'human').length;
                this.enemyHumanCount = typeof opts.enemyHumanCount === 'number' ? opts.enemyHumanCount : this.enemySlots.filter(s => s === 'human').length;
                this.allyBotCount = Math.max(0, 3 - this.allyHumanCount);
                this.enemyBotCount = Math.max(0, 3 - this.enemyHumanCount);
                this.controlSingleAllyOnly = !!opts.controlSingleAllyOnly;
                this.myControlSlots = Array.isArray(opts.myControlSlots) && opts.myControlSlots.length > 0
                    ? [...opts.myControlSlots]
                    : (this.controlSingleAllyOnly ? [opts.controlledAllyIndex || 0] : [0, 1, 2]);
                this.controlledAllyIndex = this.myControlSlots[0] || 0;
                this.team1Slots = Array.isArray(opts.team1Slots) ? opts.team1Slots.map(s => ({ ...s })) : null;
                this.team2Slots = Array.isArray(opts.team2Slots) ? opts.team2Slots.map(s => ({ ...s })) : null;
                this.turn = 1;
                this.turnTimer = 15;
                this.timerId = null;
                this._autoActionTimeoutId = null;
                this._hostRemoteWaitTimeout = null;
                this._stepGen = 0;
                this.battleEnded = false;
                this.isSuddenDeath = false;
                this.waitingForOpponent = false;
                this.isProcessing = false;
                this.currentAttacker = null;
                this.turnJustStarted = true;

                this.onlineStepSeq = 0;
                this.lastAppliedOnlineSeq = -1;
                this.lastAppliedOnlineEventSeq = 0;
                this._onlineEventSeq = 0;
                this._onlineEventBuffer = [];
                this.onlineAwaitingTeam = null;
                this.onlineAwaitingSlot = null;
                this.onlineAwaitingUid = null;
                this.firstStrikerTeam = 1;
                this.turnCanonicalPhase = 0;
                this.turnCanonicalSlot = 0;
                this.turnCanonicalOrder = [1, 2];
                this._processingRemoteAction = false;
                this._lastRemotePromptKey = null;

                const isTeamArray = Array.isArray(p1CharId);
                const ally1Id = isTeamArray ? (p1CharId[0] || 'asaiomizu') : (p1CharId || 'asaiomizu');

                this.p1 = this.createBattlePlayer(ally1Id, isOnline ? 'Player 1' : 'Player 1', 1);
                this.p2 = this.createBattlePlayer(p2CharId, isOnline ? 'Player 2' : 'BOT (CPU)', 2);
                this.activeAllyIndex = 0;
                this.waitingForChoice = false;
                this.battleData = { pashaRollUsedCount: 0, pashaRollReviveCount: 0 };

                if (this.isNewBattle && this.team1Slots && this.team2Slots) {
                    const ensureUniqueSlotIds = (slots) => {
                        const used = new Set();
                        const allIds = Object.keys(CHARACTER_DATA);
                        return slots.map(slot => {
                            const rawId = (slot && slot.charConfig && slot.charConfig.charId && CHARACTER_DATA[slot.charConfig.charId])
                                ? slot.charConfig.charId
                                : null;
                            let cId = rawId;
                            let cStats = (slot && slot.charConfig && slot.charConfig.customStats) ? slot.charConfig.customStats : null;
                            if (!cId || used.has(cId)) {
                                cId = allIds.find(id => !used.has(id)) || 'asaiomizu';
                                cStats = null;
                            }
                            used.add(cId);
                            return { ...(slot || {}), charConfig: { charId: cId, customStats: cStats } };
                        });
                    };
                    this.team1Slots = ensureUniqueSlotIds(this.team1Slots);
                    this.team2Slots = ensureUniqueSlotIds(this.team2Slots);

                    const buildTeamFromSlots = (slots, teamNum) => slots.map((slot, idx) => {
                        const cId = (slot && slot.charConfig && slot.charConfig.charId && CHARACTER_DATA[slot.charConfig.charId])
                            ? slot.charConfig.charId
                            : 'asaiomizu';
                        const cStats = (slot && slot.charConfig && slot.charConfig.customStats) ? slot.charConfig.customStats : null;
                        const isMyTeam = (teamNum === this.myTeamNum);
                        const isSlotBot = !slot || slot.type === 'bot' || !slot.uid;
                        const defaultName = isMyTeam
                            ? (isSlotBot ? `味方BOT${idx + 1}` : (slot.playerName || `味方${idx + 1}`))
                            : (isSlotBot ? `敵BOT${idx + 1}` : (slot.playerName || `敵${idx + 1}`));
                        const fighter = this.createBattlePlayer(cId, defaultName, isMyTeam ? 1 : 2, cStats);
                        fighter.canonicalTeam = teamNum;
                        fighter.canonicalSlot = idx;
                        fighter.ownerUid = slot ? (slot.uid || null) : null;
                        fighter.ownerName = slot ? (slot.playerName || '') : '';
                        if (isMyTeam) {
                            if (!this.controlSingleAllyOnly) {
                                fighter.roleType = 'you';
                                fighter.roleBadge = idx === 0 ? 'LEADER' : `${idx + 1}体目`;
                                fighter.isBot = false;
                            } else if (this.myControlSlots.includes(idx)) {
                                fighter.roleType = 'you';
                                fighter.roleBadge = 'YOU';
                                fighter.isBot = false;
                            } else if (isSlotBot) {
                                fighter.roleType = 'bot';
                                fighter.roleBadge = 'BOT';
                                fighter.isBot = true;
                            } else {
                                fighter.roleType = 'ally_player';
                                fighter.roleBadge = slot.playerName ? slot.playerName.slice(0, 6) : `味方P${idx + 1}`;
                                fighter.isBot = false;
                            }
                        } else {
                            if (!this.controlSingleAllyOnly) {
                                if (isSlotBot) {
                                    fighter.roleType = 'bot';
                                    fighter.roleBadge = 'BOT';
                                    fighter.isBot = true;
                                } else {
                                    fighter.roleType = (this.isOnlineSynced || this.isOnlineBattleMode) ? 'enemy_player' : 'bot';
                                    fighter.roleBadge = idx === 0 ? 'BOSS' : ((this.isOnlineSynced || this.isOnlineBattleMode) ? `敵${idx + 1}` : 'BOT');
                                    fighter.isBot = !(this.isOnlineSynced || this.isOnlineBattleMode);
                                }
                            } else if (isSlotBot) {
                                fighter.roleType = 'bot';
                                fighter.roleBadge = 'BOT';
                                fighter.isBot = true;
                            } else {
                                fighter.roleType = 'enemy_player';
                                fighter.roleBadge = slot.playerName ? slot.playerName.slice(0, 6) : `敵P${idx + 1}`;
                                fighter.isBot = false;
                            }
                        }
                        return fighter;
                    });

                    this.team1Fighters = buildTeamFromSlots(this.team1Slots, 1);
                    this.team2Fighters = buildTeamFromSlots(this.team2Slots, 2);
                    this.allies = this.myTeamNum === 1 ? this.team1Fighters : this.team2Fighters;
                    this.enemies = this.myTeamNum === 1 ? this.team2Fighters : this.team1Fighters;
                    this.activeAllyIndex = this.myControlSlots[0] || 0;
                    this.currentControllingAllyIndex = this.myControlSlots[0] || 0;
                    this.controlledAllyIndex = this.myControlSlots[0] || 0;
                    this.p1 = this.allies[this.activeAllyIndex] || this.allies[0];
                    this.p2 = this.enemies[0];
                } else if (this.isNewBattle) {
                    const allIds = Object.keys(CHARACTER_DATA);
                    const unlockedPool = typeof getUnlockedCharIds === 'function'
                        ? getUnlockedCharIds()
                        : (Array.isArray(playerState && playerState.unlockedChars) ? playerState.unlockedChars.filter(id => CHARACTER_DATA[id]) : []);
                    const isLocalSolo3v3 = !this.isOnlineSynced && !this.isOnlineBattleMode;
                    const allowedAllyPool = (isLocalSolo3v3 && unlockedPool.length > 0) ? unlockedPool : allIds;
                    const rawTeam = isTeamArray ? p1CharId.filter(id => id && CHARACTER_DATA[id]) : [];
                    const allyIds = [];
                    const allySeen = new Set();
                    [ally1Id, rawTeam[1], rawTeam[2]].forEach(id => {
                        if (id && CHARACTER_DATA[id] && !allySeen.has(id) && (!isLocalSolo3v3 || allowedAllyPool.includes(id))) {
                            allySeen.add(id);
                            allyIds.push(id);
                        }
                    });
                    while (allyIds.length < 3) {
                        const pool = allowedAllyPool.filter(id => !allySeen.has(id));
                        const picked = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : (allowedAllyPool[0] || 'asaiomizu');
                        allySeen.add(picked);
                        allyIds.push(picked);
                    }
                    const ally2Id = allyIds[1];
                    const ally3Id = allyIds[2];

                    const enemy1Id = (p2CharId && CHARACTER_DATA[p2CharId]) ? p2CharId : (allIds[Math.floor(Math.random() * allIds.length)] || 'pasha');
                    const enemySeen = new Set([enemy1Id]);
                    const pickUniqueEnemy = () => {
                        const pool = allIds.filter(id => !enemySeen.has(id));
                        const picked = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'pasha';
                        enemySeen.add(picked);
                        return picked;
                    };
                    const enemy2Id = pickUniqueEnemy();
                    const enemy3Id = pickUniqueEnemy();

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
                    this.team1Fighters = this.allies;
                    this.team2Fighters = this.enemies;

                    if (this.isOnlineBattleMode && this.controlSingleAllyOnly) {
                        this.allies.forEach((a, idx) => {
                            a.canonicalTeam = 1;
                            a.canonicalSlot = idx;
                            if (idx === 0) {
                                a.roleType = 'you';
                                a.roleBadge = 'YOU';
                                a.isBot = false;
                            } else if (this.allySlots[idx] === 'human') {
                                a.roleType = 'ally_player';
                                a.roleBadge = `味方P${idx + 1}`;
                                a.isBot = false;
                            } else {
                                a.roleType = 'bot';
                                a.roleBadge = 'BOT';
                                a.isBot = true;
                            }
                        });
                        this.enemies.forEach((e, idx) => {
                            e.canonicalTeam = 2;
                            e.canonicalSlot = idx;
                            if (this.enemySlots[idx] === 'human') {
                                e.roleType = 'enemy_player';
                                e.roleBadge = `敵P${idx + 1}`;
                                e.isBot = false;
                            } else {
                                e.roleType = 'bot';
                                e.roleBadge = 'BOT';
                                e.isBot = true;
                            }
                        });
                    } else {
                        this.allies.forEach((a, idx) => {
                            a.canonicalTeam = 1;
                            a.canonicalSlot = idx;
                            a.roleType = 'you';
                            a.roleBadge = idx === 0 ? 'LEADER' : `${idx + 1}体目`;
                            a.isBot = false;
                        });
                        this.enemies.forEach((e, idx) => {
                            e.canonicalTeam = 2;
                            e.canonicalSlot = idx;
                            e.roleType = this.isOnlineBattleMode ? 'enemy_player' : 'bot';
                            e.roleBadge = idx === 0 ? 'BOSS' : (this.isOnlineBattleMode ? `敵${idx + 1}` : 'BOT');
                            e.isBot = !this.isOnlineBattleMode;
                        });
                    }
                } else {
                    this.allies = [this.p1];
                    this.enemies = [this.p2];
                }

                this.p1Action = null;
                this.p2Action = null;
                this.p1TargetIndex = null;
                this.p1TargetChar = null;
                this.allyActions = this.isNewBattle ? new Array(this.allies.length).fill(null) : [null];
                this.allyTargets = this.isNewBattle ? new Array(this.allies.length).fill(null) : [null];
                this.currentControllingAllyIndex = this.myControlSlots[0] || 0;

                this.botAdapter = new BotInputAdapter();

                this.onLogUpdate = null;
                this.onTimerUpdate = null;
                this.onStateChange = null;
                this.onVisualEffect = null;
                this.onBattleEnd = null;
                this.onCutin = null;

                this.firestoreUnsub = null;
                this.lastProcessedTurn = 0;
                this.heartbeatTimer = null;
                this.healthMonitorTimer = null;
                this._listenerRetryTimer = null;
                this._listenerRetryCount = 0;
                this._netFailCount = 0;
                this._hostReclaimAttemptedAt = 0;
                this._pageHideHandler = null;
                this.currentTurnLogs = [];
                this.battleLogs = [];
                this.onlineSyncStarted = false;
                this.latestRoomData = null;

                this.elapsedSeconds = 0;
                this.elapsedTimerId = null;
                this.onElapsedTimerUpdate = null;

                if (this.isResume && this.resumeBattleState && this.isNewBattle) {
                    const bs = this.resumeBattleState;
                    this.turn = bs.turn || 1;
                    this.isSuddenDeath = !!bs.isSuddenDeath;
                    this.firstStrikerTeam = bs.firstStrikerTeam || 1;
                    this.firstStrikerPlayerNum = (this.firstStrikerTeam === this.myTeamNum) ? 1 : 2;
                    this.turnCanonicalOrder = Array.isArray(bs.turnCanonicalOrder) && bs.turnCanonicalOrder.length === 2
                        ? [...bs.turnCanonicalOrder]
                        : (this.firstStrikerTeam === 1 ? [1, 2] : [2, 1]);
                    this.turnCanonicalPhase = bs.turnCanonicalPhase || 0;
                    this.turnCanonicalSlot = bs.turnCanonicalSlot || 0;
                    this.onlineStepSeq = bs.stepSeq || 0;
                    this._onlinePublishSeq = bs.seq || 0;
                    this.lastAppliedOnlineSeq = bs.seq || 0;
                    this.onlineAwaitingTeam = bs.awaitingTeam !== undefined ? bs.awaitingTeam : null;
                    this.onlineAwaitingSlot = bs.awaitingSlot !== undefined ? bs.awaitingSlot : null;
                    this.onlineAwaitingUid = bs.awaitingUid || null;
                    this.isProcessing = false;
                    this.waitingForOpponent = (!this.isOnlineHost && this.onlineAwaitingUid !== null && this.onlineAwaitingUid !== this.onlineClientId);
                    if (bs.battleData && typeof bs.battleData === 'object') {
                        this.battleData = { ...this.battleData, ...bs.battleData };
                    }
                    if (Array.isArray(bs.team1Chars) && this.team1Fighters) {
                        bs.team1Chars.forEach((st, idx) => {
                            if (this.team1Fighters[idx]) this.deserializePlayer(this.team1Fighters[idx], st);
                        });
                    }
                    if (Array.isArray(bs.team2Chars) && this.team2Fighters) {
                        bs.team2Chars.forEach((st, idx) => {
                            if (this.team2Fighters[idx]) this.deserializePlayer(this.team2Fighters[idx], st);
                        });
                    }
                    if (this.team1Slots && this.team1Fighters) {
                        this.team1Slots.forEach((sl, idx) => this.applySlotMetaToFighter(this.team1Fighters[idx], sl, 1, idx));
                    }
                    if (this.team2Slots && this.team2Fighters) {
                        this.team2Slots.forEach((sl, idx) => this.applySlotMetaToFighter(this.team2Fighters[idx], sl, 2, idx));
                    }
                    this.updateOnlineRoleCounts();

                    if (this.onlineAwaitingTeam === this.myTeamNum && this.myControlSlots.includes(this.onlineAwaitingSlot)) {
                        this.activeAllyIndex = this.onlineAwaitingSlot;
                        this.currentControllingAllyIndex = this.onlineAwaitingSlot;
                        this.p1 = this.allies[this.onlineAwaitingSlot] || this.allies[0];
                    } else {
                        const fallbackIdx = this.controlSingleAllyOnly
                            ? (this.myControlSlots[0] || 0)
                            : (this.myControlSlots.find(idx => this.allies[idx] && this.allies[idx].hp > 0) ?? (this.myControlSlots[0] || 0));
                        this.p1 = this.allies[fallbackIdx] || this.allies[0];
                    }

                    if (Array.isArray(bs.events)) {
                        this._onlineEventBuffer = [...bs.events];
                        bs.events.forEach(ev => {
                            if (!ev || typeof ev.seq !== 'number') return;
                            if (ev.seq > this._onlineEventSeq) this._onlineEventSeq = ev.seq;
                            if (ev.seq > this.lastAppliedOnlineEventSeq) this.lastAppliedOnlineEventSeq = ev.seq;
                            if (ev.type === 'log') {
                                const localTeamType = ev.canonicalTeam === 0
                                    ? 'system'
                                    : (ev.canonicalTeam === this.myTeamNum ? 'ally' : 'enemy');
                                let msgText = ev.msg || '';
                                if (ev.hostTeamNum && ev.hostTeamNum !== this.myTeamNum) {
                                    msgText = msgText
                                        .replace(/【味方】/g, '[[TMP_ENEMY]]')
                                        .replace(/【敵】/g, '【味方】')
                                        .replace(/\[\[TMP_ENEMY\]\]/g, '【敵】')
                                        .replace(/【味方チーム】/g, '[[TMP_ENEMY_T]]')
                                        .replace(/【敵チーム】/g, '【味方チーム】')
                                        .replace(/\[\[TMP_ENEMY_T\]\]/g, '【敵チーム】')
                                        .replace(/味方チーム/g, '[[TMP_E_PLAIN]]')
                                        .replace(/敵チーム/g, '味方チーム')
                                        .replace(/\[\[TMP_E_PLAIN\]\]/g, '敵チーム');
                                }
                                this.battleLogs.push({ msg: msgText, colorClass: ev.colorClass, teamType: localTeamType });
                            }
                        });
                    }
                    this.battleLogs.push({
                        msg: `🟢 ルームID${this.roomCode ? `「${this.roomCode}」` : ''}から進行中のバトルに復帰しました！（ターン ${this.turn}）`,
                        colorClass: 'text-emerald-300 font-bold',
                        teamType: 'system'
                    });
                    if (this.resumeStartedAt) {
                        this.elapsedSeconds = Math.max(0, Math.floor((Date.now() - this.resumeStartedAt) / 1000));
                    }
                }
            }

            applySlotMetaToFighter(fighter, slot, teamNum, slotIdx) {
                if (!fighter) return;
                const isMyTeam = (teamNum === this.myTeamNum);
                const isSlotBot = !slot || slot.type === 'bot' || !!slot.botTakeover || !slot.uid;
                fighter.ownerUid = slot ? (slot.uid || slot.originalUid || null) : null;
                fighter.ownerName = slot ? (slot.playerName || slot.originalPlayerName || '') : '';
                if (isMyTeam) {
                    if (!this.controlSingleAllyOnly) {
                        fighter.roleType = 'you';
                        fighter.roleBadge = slotIdx === 0 ? 'LEADER' : `${slotIdx + 1}体目`;
                        fighter.isBot = false;
                    } else if (this.myControlSlots.includes(slotIdx) && !isSlotBot) {
                        fighter.roleType = 'you';
                        fighter.roleBadge = 'YOU';
                        fighter.isBot = false;
                    } else if (isSlotBot) {
                        fighter.roleType = 'bot';
                        fighter.roleBadge = (slot && slot.botTakeover) ? 'BOT(代打)' : 'BOT';
                        fighter.isBot = true;
                    } else {
                        fighter.roleType = 'ally_player';
                        fighter.roleBadge = slot.playerName ? slot.playerName.slice(0, 6) : `味方P${slotIdx + 1}`;
                        fighter.isBot = false;
                    }
                } else {
                    if (isSlotBot) {
                        fighter.roleType = 'bot';
                        fighter.roleBadge = (slot && slot.botTakeover) ? 'BOT(代打)' : 'BOT';
                        fighter.isBot = true;
                    } else {
                        fighter.roleType = (this.isOnlineSynced || this.isOnlineBattleMode) ? 'enemy_player' : 'bot';
                        fighter.roleBadge = !this.controlSingleAllyOnly
                            ? (slotIdx === 0 ? 'BOSS' : ((this.isOnlineSynced || this.isOnlineBattleMode) ? `敵${slotIdx + 1}` : 'BOT'))
                            : (slot.playerName ? slot.playerName.slice(0, 6) : `敵P${slotIdx + 1}`);
                        fighter.isBot = !(this.isOnlineSynced || this.isOnlineBattleMode);
                    }
                }
            }

            updateOnlineRoleCounts() {
                if (!this.allies || !this.enemies) return;
                this.allyHumanCount = this.allies.filter(a => a && !a.isBot).length;
                this.allyBotCount = Math.max(0, 3 - this.allyHumanCount);
                this.enemyHumanCount = this.enemies.filter(e => e && !e.isBot).length;
                this.enemyBotCount = Math.max(0, 3 - this.enemyHumanCount);
            }

            isMyTurnOnline() {
                if (this.battleEnded || this.isProcessing || this.waitingForOpponent) return false;
                if (!this.p1 || this.p1.hp <= 0 || this.p1.isResting) return false;
                if (this.isOnlineSynced && this.isNewBattle) {
                    return this.onlineAwaitingTeam === this.myTeamNum && this.myControlSlots.includes(this.onlineAwaitingSlot);
                }
                return this.p1Action === null;
            }

            startElapsedTimer(initialSeconds = 0) {
                this.stopElapsedTimer();
                this.elapsedSeconds = Math.max(0, Math.floor(initialSeconds || 0));
                if (this.onElapsedTimerUpdate) {
                    this.onElapsedTimerUpdate(this.elapsedSeconds);
                }
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
                if (this.isOnlineSynced || this.isOnlineBattleMode) return false;
                if (!this.isNewBattle || this.battleEnded || this.waitingForChoice) return false;
                if (this.isProcessing) return false;
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
                if (this.isOnlineSynced && this.isOnlineHost) {
                    const oppTeamNum = this.myTeamNum === 1 ? 2 : 1;
                    const canonicalTeam = teamType === 'ally' ? this.myTeamNum : (teamType === 'enemy' ? oppTeamNum : 0);
                    this._onlineEventSeq = (this._onlineEventSeq || 0) + 1;
                    this._onlineEventBuffer.push({
                        seq: this._onlineEventSeq,
                        type: 'log',
                        msg,
                        colorClass,
                        canonicalTeam,
                        hostTeamNum: this.myTeamNum
                    });
                    if (this._onlineEventBuffer.length > 45) {
                        this._onlineEventBuffer = this._onlineEventBuffer.slice(-45);
                    }
                }
                if (this.onLogUpdate) {
                    this.onLogUpdate(msg, colorClass, teamType);
                }
            }













            createBattlePlayer(charId, displayName, playerNum = 1, customStatsOverride = null) {
                const master = CHARACTER_DATA[charId] || CHARACTER_DATA.pasha;

                let hp = master.hp;
                let atk = master.atk;
                let def = master.def;
                let critRate = master.critRate || 0.05;
                let eva = master.eva;

                if (customStatsOverride && !['dopagaking', 'courtney', 'pasha_dark'].includes(charId)) {
                    hp = customStatsOverride.hp;
                    atk = customStatsOverride.atk;
                    def = customStatsOverride.def;
                    critRate = customStatsOverride.critRate > 1 ? (customStatsOverride.critRate / 100) : customStatsOverride.critRate;
                    eva = customStatsOverride.eva;
                } else if (this.isNewBattle && playerNum === 1 && !this.isOnlineSynced && !['dopagaking', 'courtney', 'pasha_dark'].includes(charId)) {
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
                    char.image = 'pasha-dark/pasha-dark.webp';
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
                    if (typeof renderNewBattleScreen === 'function') {
                        renderNewBattleScreen();
                    }
                }
            }

            startBattle() {
                if (this.isNewBattle && this.isOnlineSynced) {
                    this.checkPashaPassive();
                    this.initOnline3v3Sync();
                    this.startElapsedTimer(this.elapsedSeconds || 0);
                    if (this.onStateChange) this.onStateChange(this);
                    return;
                }

                if (this.isNewBattle) {
                    const alliesList = this.allies || [this.p1];
                    const enemiesList = this.enemies || [this.p2];
                    const alliesTotalHp = alliesList.reduce((sum, c) => sum + (c ? (c.maxHp || c.hp || 0) : 0), 0);
                    const enemiesTotalHp = enemiesList.reduce((sum, c) => sum + (c ? (c.maxHp || c.hp || 0) : 0), 0);
                    if (this.isOnlineBattleMode && this.controlSingleAllyOnly) {
                        this.log(`🌐 オンラインマルチ対戦 (${this.allyHumanCount}vs${this.enemyHumanCount}) 開始！ 味方BOT:${this.allyBotCount}体 / 敵BOT:${this.enemyBotCount}体（操作キャラ: ${this.p1.charName}）`, 'text-emerald-300 font-bold');
                    } else if (this.isOnlineBattleMode) {
                        this.log(`🌐 オンライン2人対戦（3体操作）開始！`, 'text-emerald-300 font-bold');
                    }
                    this.log(`⚔️ バトル開始！ 味方チーム (合計HP: ${alliesTotalHp}) VS 敵チーム (合計HP: ${enemiesTotalHp})`, 'text-amber-300 font-bold');
                    this.checkPashaPassive();

                    let firstStrikerNum = 1;
                    if (alliesTotalHp < enemiesTotalHp) {
                        firstStrikerNum = 1;
                        this.log(`❤️ 3体合計HP比較 (味方:${alliesTotalHp} vs 敵:${enemiesTotalHp}) により、合計HPが低い【味方チーム】が先攻！（以降は先攻→後攻の交代制）`, 'text-emerald-300 font-bold');
                    } else if (enemiesTotalHp < alliesTotalHp) {
                        firstStrikerNum = 2;
                        this.log(`❤️ 3体合計HP比較 (味方:${alliesTotalHp} vs 敵:${enemiesTotalHp}) により、合計HPが低い【敵チーム】が先攻！（以降は先攻→後攻の交代制）`, 'text-red-300 font-bold');
                    } else {
                        firstStrikerNum = Math.random() < 0.5 ? 1 : 2;
                        this.log(`❤️ 3体合計HP同値 (${alliesTotalHp}) のため、ランダム判定により【${firstStrikerNum === 1 ? '味方チーム' : '敵チーム'}】が先攻！（以降は先攻→後攻の交代制）`, 'text-amber-300 font-bold');
                    }
                    this.firstStrikerPlayerNum = firstStrikerNum;
                } else {
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
                }

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
                    this.startElapsedTimer();
                    if (this.onStateChange) this.onStateChange(this);
                } else if (this.isNewBattle) {
                    this.startElapsedTimer();
                    this.startNewBattleTurn();
                } else {
                    this.startTimer();
                    this.startElapsedTimer();
                    if (this.onStateChange) this.onStateChange(this);
                }
            }

            async notifyOnlineDeparture(reason = 'exit', useTx = false) {
                if (!this.roomId || !window.fbDb || !window.fbDoc || !this.onlineClientId) return;
                const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', this.roomId);
                const myUid = this.onlineClientId;
                const now = Date.now();
                const baseUpdates = {
                    [`slotLeaveFlags.${myUid}`]: now,
                    [`battleHeartbeats.${myUid}`]: 0,
                    updatedAt: now
                };
                if (this.isOnlineHost) {
                    baseUpdates.hostLeftAt = now;
                }
                if (!useTx || !this.isOnlineHost || !window.fbRunTransaction) {
                    try {
                        await window.fbUpdateDoc(roomRef, baseUpdates);
                    } catch (e) {}
                    return;
                }
                try {
                    await window.fbRunTransaction(window.fbDb, async (tx) => {
                        const snap = await tx.get(roomRef);
                        if (!snap.exists()) return;
                        const rd = snap.data();
                        if (!rd || rd.status === 'ended' || (rd.battleState && rd.battleState.battleEnded)) return;

                        const t1 = (rd.team1Slots || []).map(s => {
                            if (s && s.uid === myUid && s.type === 'human') {
                                return {
                                    ...s,
                                    type: 'bot',
                                    botTakeover: true,
                                    originalUid: s.originalUid || s.uid,
                                    originalPlayerId: s.originalPlayerId || s.playerId || null,
                                    originalPlayerName: s.originalPlayerName || s.playerName || ''
                                };
                            }
                            return s;
                        });
                        const t2 = (rd.team2Slots || []).map(s => {
                            if (s && s.uid === myUid && s.type === 'human') {
                                return {
                                    ...s,
                                    type: 'bot',
                                    botTakeover: true,
                                    originalUid: s.originalUid || s.uid,
                                    originalPlayerId: s.originalPlayerId || s.playerId || null,
                                    originalPlayerName: s.originalPlayerName || s.playerName || ''
                                };
                            }
                            return s;
                        });

                        const heartbeats = { ...(rd.battleHeartbeats || {}), [myUid]: 0 };
                        const leaveFlags = { ...(rd.slotLeaveFlags || {}), [myUid]: now };
                        const rejoinMap = rd.slotRejoinAt || {};

                        let nextHostUid = rd.hostUid;
                        let promoted = false;
                        if (rd.hostUid === myUid) {
                            const candidates = [...t1, ...t2].filter(s => {
                                if (!s || s.type !== 'human' || !s.uid || s.uid === myUid || s.botTakeover) return false;
                                if ((leaveFlags[s.uid] || 0) > (rejoinMap[s.uid] || 0)) return false;
                                const hb = Math.max(heartbeats[s.uid] || 0, s.lastSeen || 0);
                                return hb === 0 ? (now - (rd.startedAt || now) < 16000) : (now - hb < 16000);
                            });
                            if (candidates.length > 0) {
                                nextHostUid = candidates[0].uid;
                                promoted = true;
                            }
                        }

                        const bsUpdate = rd.battleState ? { ...rd.battleState } : null;
                        if (bsUpdate) {
                            if (Array.isArray(bsUpdate.team1Chars)) {
                                bsUpdate.team1Chars = bsUpdate.team1Chars.map((c, idx) =>
                                    (t1[idx] && t1[idx].botTakeover) ? { ...c, isBot: true } : c
                                );
                            }
                            if (Array.isArray(bsUpdate.team2Chars)) {
                                bsUpdate.team2Chars = bsUpdate.team2Chars.map((c, idx) =>
                                    (t2[idx] && t2[idx].botTakeover) ? { ...c, isBot: true } : c
                                );
                            }
                        }

                        const txPayload = {
                            team1Slots: t1,
                            team2Slots: t2,
                            battleHeartbeats: heartbeats,
                            slotLeaveFlags: leaveFlags,
                            updatedAt: now
                        };
                        if (bsUpdate) txPayload.battleState = bsUpdate;
                        if (promoted) {
                            txPayload.hostUid = nextHostUid;
                            txPayload.hostLastSeen = now;
                            txPayload.hostReclaimedAt = now;
                        } else if (rd.hostUid === myUid) {
                            txPayload.hostLeftAt = now;
                        }
                        tx.update(roomRef, txPayload);
                    });
                } catch (e) {
                    try { await window.fbUpdateDoc(roomRef, baseUpdates); } catch (_) {}
                }
            }

            syncRejoinedHumansFromRoomData(data) {
                if (!data || !this.team1Slots || !this.team2Slots) return false;
                let changed = false;
                const checkTeam = (teamNum, remoteSlots, localSlots, fighters) => {
                    if (!Array.isArray(remoteSlots) || !Array.isArray(fighters)) return;
                    for (let i = 0; i < remoteSlots.length; i++) {
                        const rSlot = remoteSlots[i];
                        const lSlot = localSlots[i];
                        const fighter = fighters[i];
                        if (!rSlot || !fighter) continue;
                        if (rSlot.type === 'human' && !rSlot.botTakeover && rSlot.uid && (fighter.isBot || (lSlot && lSlot.botTakeover))) {
                            localSlots[i] = { ...rSlot };
                            this.applySlotMetaToFighter(fighter, rSlot, teamNum, i);
                            this.log(`🟢 ${rSlot.playerName || fighter.charName} がオンライン対戦に復帰しました！（BOT → 人間操作）`, 'text-emerald-300 font-bold');
                            changed = true;
                        } else if (rSlot.type === 'bot' && rSlot.botTakeover && !fighter.isBot && lSlot && lSlot.type === 'human') {
                            localSlots[i] = { ...rSlot };
                            this.applySlotMetaToFighter(fighter, rSlot, teamNum, i);
                            changed = true;
                        }
                    }
                };
                checkTeam(1, data.team1Slots, this.team1Slots, this.team1Fighters);
                checkTeam(2, data.team2Slots, this.team2Slots, this.team2Fighters);
                if (changed) {
                    this.updateOnlineRoleCounts();
                    if (this.onStateChange) this.onStateChange(this);
                }
                return changed;
            }

            async checkOnlineParticipantHealth(data) {
                if (!this.isOnlineSynced || !this.isOnlineHost || !data || this.battleEnded) return;
                if (this._checkingHealth) return;
                this._checkingHealth = true;
                try {
                    const now = Date.now();
                    const heartbeats = data.battleHeartbeats || {};
                    const leaveFlags = data.slotLeaveFlags || {};
                    const rejoinMap = data.slotRejoinAt || {};
                    const graceFloor = Math.max(data.startedAt || 0, data.hostReclaimedAt || 0, this._hostStartedAt || 0);
                    let convertedAny = false;
                    let awaitedConverted = null;

                    const scanTeam = (teamNum, localSlots, fighters) => {
                        if (!Array.isArray(localSlots) || !Array.isArray(fighters)) return;
                        for (let i = 0; i < localSlots.length; i++) {
                            const sl = localSlots[i];
                            const fighter = fighters[i];
                            if (!sl || sl.type !== 'human' || !sl.uid || sl.uid === this.onlineClientId || sl.botTakeover) continue;

                            const uid = sl.uid;
                            const rejoinedAt = rejoinMap[uid] || 0;
                            const leaveAt = leaveFlags[uid] || 0;
                            const explicitlyLeft = leaveAt > rejoinedAt && leaveAt >= (data.startedAt || 0) - 5000;
                            const lastHb = Math.max(heartbeats[uid] || 0, sl.lastSeen || 0, rejoinedAt);
                            const refGrace = Math.max(graceFloor, rejoinedAt);
                            const hbTimedOut = (now - refGrace > 15000) && (now - (lastHb || refGrace) > 15000);

                            if (explicitlyLeft || hbTimedOut) {
                                const displayName = sl.originalPlayerName || sl.playerName || (fighter ? fighter.charName : `P${i + 1}`);
                                localSlots[i] = {
                                    ...sl,
                                    type: 'bot',
                                    botTakeover: true,
                                    originalUid: sl.originalUid || uid,
                                    originalPlayerId: sl.originalPlayerId || sl.playerId || null,
                                    originalPlayerName: displayName
                                };
                                if (fighter) {
                                    this.applySlotMetaToFighter(fighter, localSlots[i], teamNum, i);
                                }
                                this.log(
                                    `🤖 ${displayName} (${fighter ? fighter.charName : ''}) の${explicitlyLeft ? '退出/サイト終了' : '通信切断'}を検知したため、自動でBOT操作に切り替えました！（ルームID再入力で復帰可能）`,
                                    'text-amber-300 font-bold'
                                );
                                convertedAny = true;
                                if (this.onlineAwaitingTeam === teamNum && this.onlineAwaitingSlot === i && this.onlineAwaitingUid === uid) {
                                    awaitedConverted = { teamNum, slotIdx: i, uid, fighter };
                                }
                            }
                        }
                    };

                    scanTeam(1, this.team1Slots, this.team1Fighters);
                    scanTeam(2, this.team2Slots, this.team2Fighters);

                    if (convertedAny) {
                        this.updateOnlineRoleCounts();
                        const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', this.roomId);
                        if (awaitedConverted && !this._processingRemoteAction && !this.battleEnded) {
                            if (this._hostRemoteWaitTimeout) {
                                clearTimeout(this._hostRemoteWaitTimeout);
                                this._hostRemoteWaitTimeout = null;
                            }
                            const { teamNum, slotIdx, uid, fighter } = awaitedConverted;
                            const teamArr = teamNum === 1 ? this.team1Fighters : this.team2Fighters;
                            const oppArr = teamNum === 1 ? this.team2Fighters : this.team1Fighters;
                            const livingOpp = oppArr.filter(o => o && o.hp > 0);
                            const stepSeqSnap = this.onlineStepSeq;
                            if (!fighter || fighter.hp <= 0 || livingOpp.length === 0) {
                                await this.publishOnlineBattleState(roomRef, { team1Slots: this.team1Slots, team2Slots: this.team2Slots });
                                this.turnCanonicalSlot++;
                                await this.advanceOnlineHostStep();
                            } else {
                                if (!this.botAdapter) this.botAdapter = new BotInputAdapter();
                                const botSkill = fighter.eggplantReady
                                    ? 'momo_eggplant_burst'
                                    : (fighter.isResting ? 'rest' : this.botAdapter.getDecision(fighter, livingOpp[0]));
                                const skill = (fighter.skills && fighter.skills.find(s => s.id === botSkill)) || (fighter.skills && fighter.skills[0]);
                                const targetPool = (skill && skill.targetType === 'single_ally') ? teamArr.filter(a => a && a.hp > 0) : livingOpp;
                                let defender = targetPool[Math.floor(Math.random() * Math.max(1, targetPool.length))] || livingOpp[0];
                                const targetTeam = (skill && skill.targetType === 'single_ally') ? teamNum : (teamNum === 1 ? 2 : 1);
                                const targetArr = targetTeam === 1 ? this.team1Fighters : this.team2Fighters;
                                const targetSlot = Math.max(0, targetArr.indexOf(defender));

                                await this.publishOnlineBattleState(roomRef, { team1Slots: this.team1Slots, team2Slots: this.team2Slots });
                                this._processingRemoteAction = true;
                                try {
                                    await this.processOnlineHostHumanAction({
                                        stepSeq: stepSeqSnap,
                                        uid,
                                        teamNum,
                                        slotIdx,
                                        skillId: botSkill,
                                        targetTeam,
                                        targetSlot
                                    });
                                } finally {
                                    this._processingRemoteAction = false;
                                }
                            }
                        } else {
                            await this.publishOnlineBattleState(roomRef, { team1Slots: this.team1Slots, team2Slots: this.team2Slots });
                            if (this.onStateChange) this.onStateChange(this);
                        }
                    }
                } finally {
                    this._checkingHealth = false;
                }
            }

            async checkHostHealthAndMigrate(data) {
                if (!this.isOnlineSynced || this.isOnlineHost || !data || this.battleEnded) return;
                if (this._attemptingHostTakeover) return;

                if (data.hostUid === this.onlineClientId) {
                    await this.promoteToOnlineHost(data);
                    return;
                }

                const now = Date.now();
                const curHostUid = data.hostUid;
                const heartbeats = data.battleHeartbeats || {};
                const leaveFlags = data.slotLeaveFlags || {};
                const rejoinMap = data.slotRejoinAt || {};

                const hostLeft = !!(data.hostLeftAt && data.hostLeftAt > (data.hostReclaimedAt || 0));
                const hostLeaveFlag = (curHostUid && (leaveFlags[curHostUid] || 0) > (rejoinMap[curHostUid] || 0));
                const hostHb = Math.max(
                    (curHostUid && heartbeats[curHostUid]) ? heartbeats[curHostUid] : 0,
                    data.hostLastSeen || 0
                );
                const graceRef = Math.max(data.startedAt || 0, data.hostReclaimedAt || 0);
                const hostTimedOut = (now - graceRef > 15000) && (hostHb > 0 ? (now - hostHb > 15000) : true);

                if (!hostLeft && !hostLeaveFlag && !hostTimedOut) return;

                const allSlots = [...(data.team1Slots || []), ...(data.team2Slots || [])];
                const activeCandidates = allSlots.filter(s => {
                    if (!s || s.type !== 'human' || !s.uid || s.uid === curHostUid || s.botTakeover) return false;
                    if ((leaveFlags[s.uid] || 0) > (rejoinMap[s.uid] || 0)) return false;
                    const hb = Math.max(heartbeats[s.uid] || 0, s.lastSeen || 0, rejoinMap[s.uid] || 0);
                    return hb > 0 ? (now - hb < 16000) : (now - graceRef < 16000);
                });

                const primaryUid = activeCandidates.length > 0 ? activeCandidates[0].uid : this.onlineClientId;
                const deadSince = Math.max(data.hostLeftAt || 0, hostHb || graceRef);
                if (primaryUid !== this.onlineClientId && (now - deadSince < 19000)) {
                    return;
                }
                if (now - (this._hostReclaimAttemptedAt || 0) < 3500) return;

                this._attemptingHostTakeover = true;
                this._hostReclaimAttemptedAt = now;
                try {
                    const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', this.roomId);
                    const result = await window.fbRunTransaction(window.fbDb, async (tx) => {
                        const snap = await tx.get(roomRef);
                        if (!snap.exists()) return null;
                        const rd = snap.data();
                        if (!rd || rd.status === 'ended' || (rd.battleState && rd.battleState.battleEnded)) return null;
                        if (rd.hostUid === this.onlineClientId) return { rd, alreadyHost: true };

                        const txNow = Date.now();
                        const txHb = (rd.hostUid && rd.battleHeartbeats?.[rd.hostUid]) ? Math.max(rd.battleHeartbeats[rd.hostUid], rd.hostLastSeen || 0) : (rd.hostLastSeen || 0);
                        const txLeft = !!(rd.hostLeftAt && rd.hostLeftAt > (rd.hostReclaimedAt || 0));
                        const txHostFlag = !!(rd.hostUid && (rd.slotLeaveFlags?.[rd.hostUid] || 0) > (rd.slotRejoinAt?.[rd.hostUid] || 0));
                        if (!txLeft && !txHostFlag && txHb > 0 && (txNow - txHb < 14000)) {
                            return null;
                        }

                        const markOldHostBot = (arr) => (arr || []).map(s => {
                            if (s && s.uid === rd.hostUid && s.type === 'human') {
                                return {
                                    ...s,
                                    type: 'bot',
                                    botTakeover: true,
                                    originalUid: s.originalUid || s.uid,
                                    originalPlayerId: s.originalPlayerId || s.playerId || null,
                                    originalPlayerName: s.originalPlayerName || s.playerName || ''
                                };
                            }
                            return s;
                        });
                        const t1 = markOldHostBot(rd.team1Slots);
                        const t2 = markOldHostBot(rd.team2Slots);
                        const txPayload = {
                            hostUid: this.onlineClientId,
                            hostLastSeen: txNow,
                            hostReclaimedAt: txNow,
                            team1Slots: t1,
                            team2Slots: t2,
                            [`battleHeartbeats.${this.onlineClientId}`]: txNow,
                            updatedAt: txNow
                        };
                        tx.update(roomRef, txPayload);
                        return { rd: { ...rd, ...txPayload, team1Slots: t1, team2Slots: t2 } };
                    });
                    if (result && result.rd) {
                        await this.promoteToOnlineHost(result.rd);
                    }
                } catch (e) {
                    console.warn('Host migration attempt error:', e);
                } finally {
                    this._attemptingHostTakeover = false;
                }
            }

            async promoteToOnlineHost(data) {
                if (!this.isOnlineSynced || this.isOnlineHost || this.battleEnded) return;
                if (data && data.battleState && typeof data.battleState.seq === 'number' && data.battleState.seq > this.lastAppliedOnlineSeq) {
                    await this.applyOnlineBattleState(data.battleState, data);
                }
                if (this.battleEnded) return;
                this.isOnlineHost = true;
                this._hostStartedAt = Date.now();
                this._processingRemoteAction = false;
                this.waitingForOpponent = false;
                this.isProcessing = false;
                if (data) {
                    this.latestRoomData = data;
                    this.syncRejoinedHumansFromRoomData(data);
                }
                this.log('👑 前のホストの接続が切れたため、あなたが進行ホストを引き継ぎました！（旧ホストはBOT操作）', 'text-amber-300 font-bold');
                await this.resumeOnlineHostLoop();
            }

            async resumeOnlineHostLoop() {
                if (!this.isOnlineSynced || !this.isOnlineHost || this.battleEnded) return;
                const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', this.roomId);
                this._stepGen = (this._stepGen || 0) + 1;
                const myGen = this._stepGen;

                if (this._hostRemoteWaitTimeout) {
                    clearTimeout(this._hostRemoteWaitTimeout);
                    this._hostRemoteWaitTimeout = null;
                }

                if (this.onlineAwaitingTeam !== null && typeof this.onlineAwaitingSlot === 'number') {
                    const teamNum = this.onlineAwaitingTeam;
                    const slotIdx = this.onlineAwaitingSlot;
                    const teamArr = teamNum === 1 ? this.team1Fighters : this.team2Fighters;
                    const slotsArr = teamNum === 1 ? this.team1Slots : this.team2Slots;
                    const actor = teamArr && teamArr[slotIdx];
                    const slotMeta = slotsArr && slotsArr[slotIdx];

                    if (!actor || actor.hp <= 0) {
                        this.turnCanonicalSlot++;
                        await this.advanceOnlineHostStep();
                        return;
                    }

                    const isNowBot = !slotMeta || slotMeta.type === 'bot' || !!slotMeta.botTakeover || actor.isBot || !slotMeta.uid;
                    if (isNowBot) {
                        const oppArr = teamNum === 1 ? this.team2Fighters : this.team1Fighters;
                        const livingOpp = oppArr.filter(o => o && o.hp > 0);
                        if (livingOpp.length === 0) {
                            await this.checkWinner();
                            await this.publishOnlineBattleState(roomRef, { team1Slots: this.team1Slots, team2Slots: this.team2Slots, pendingAction: null });
                            return;
                        }
                        if (!this.botAdapter) this.botAdapter = new BotInputAdapter();
                        const botSkill = actor.eggplantReady
                            ? 'momo_eggplant_burst'
                            : (actor.isResting ? 'rest' : this.botAdapter.getDecision(actor, livingOpp[0]));
                        const skill = (actor.skills && actor.skills.find(s => s.id === botSkill)) || (actor.skills && actor.skills[0]);
                        const targetPool = (skill && skill.targetType === 'single_ally') ? teamArr.filter(a => a && a.hp > 0) : livingOpp;
                        const defender = targetPool[Math.floor(Math.random() * Math.max(1, targetPool.length))] || livingOpp[0];
                        const targetTeam = (skill && skill.targetType === 'single_ally') ? teamNum : (teamNum === 1 ? 2 : 1);
                        const targetArr = targetTeam === 1 ? this.team1Fighters : this.team2Fighters;
                        const targetSlot = Math.max(0, targetArr.indexOf(defender));

                        this._processingRemoteAction = true;
                        try {
                            await this.publishOnlineBattleState(roomRef, { team1Slots: this.team1Slots, team2Slots: this.team2Slots });
                            await this.processOnlineHostHumanAction({
                                stepSeq: this.onlineStepSeq,
                                uid: this.onlineAwaitingUid || slotMeta?.uid || 'bot',
                                teamNum,
                                slotIdx,
                                skillId: botSkill,
                                targetTeam,
                                targetSlot
                            });
                        } finally {
                            this._processingRemoteAction = false;
                        }
                        return;
                    }

                    if (teamNum === this.myTeamNum && this.myControlSlots.includes(slotIdx)) {
                        this.activeAllyIndex = slotIdx;
                        this.currentControllingAllyIndex = slotIdx;
                        this.p1 = actor;
                        this.isProcessing = false;
                        this.waitingForOpponent = false;
                        this.onlineAwaitingUid = slotMeta.uid;
                        await this.publishOnlineBattleState(roomRef, { team1Slots: this.team1Slots, team2Slots: this.team2Slots, pendingAction: null });
                        this.startTimer();
                        if (this.onStateChange) this.onStateChange(this);
                        return;
                    }

                    // 他のリモート人間プレイヤーの行動を待機中にホストを引き継いだ場合
                    this.isProcessing = false;
                    this.waitingForOpponent = true;
                    this.onlineAwaitingUid = slotMeta.uid;
                    const waitSeq = this.onlineStepSeq;
                    await this.publishOnlineBattleState(roomRef, { team1Slots: this.team1Slots, team2Slots: this.team2Slots, pendingAction: null });
                    if (this.onStateChange) this.onStateChange(this);
                    this._hostRemoteWaitTimeout = setTimeout(async () => {
                        this._hostRemoteWaitTimeout = null;
                        if (this.battleEnded || myGen !== this._stepGen || this.onlineStepSeq !== waitSeq) return;
                        if (this.onlineAwaitingTeam !== teamNum || this.onlineAwaitingSlot !== slotIdx) return;
                        const oppArr = teamNum === 1 ? this.team2Fighters : this.team1Fighters;
                        const livingOpp = oppArr.filter(o => o && o.hp > 0);
                        const defTarget = livingOpp[Math.floor(Math.random() * Math.max(1, livingOpp.length))] || oppArr[0];
                        const fallbackSkill = this.botAdapter.getDecision(actor, defTarget);
                        this.log(`⏰ ${actor.charName} の応答がないため自動選択を実行します！`, 'text-amber-300');
                        await this.processOnlineHostHumanAction({
                            stepSeq: waitSeq,
                            uid: slotMeta.uid,
                            teamNum,
                            slotIdx,
                            skillId: fallbackSkill,
                            targetTeam: teamNum === 1 ? 2 : 1,
                            targetSlot: oppArr.indexOf(defTarget) >= 0 ? oppArr.indexOf(defTarget) : 0
                        });
                    }, 24000);
                    return;
                }

                this.isProcessing = false;
                this.waitingForOpponent = false;
                await this.publishOnlineBattleState(roomRef, { team1Slots: this.team1Slots, team2Slots: this.team2Slots });
                if (this.turnCanonicalPhase >= 2) {
                    this.endTurnPhase();
                    this.onlineStepSeq++;
                    await this.publishOnlineBattleState(roomRef, { pendingAction: null });
                    await this.startOnlineHostTurn();
                } else {
                    await this.advanceOnlineHostStep();
                }
            }

            async initOnline3v3Sync() {
                if (this.onlineSyncStarted || !this.roomId || !window.fbDb) return;
                this.onlineSyncStarted = true;
                this._hostStartedAt = Date.now();
                const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', this.roomId);

                this._pageHideHandler = () => {
                    if (!this.battleEnded && this.isOnlineSynced) {
                        this.notifyOnlineDeparture('pagehide', false);
                    }
                };
                window.addEventListener('pagehide', this._pageHideHandler);

                this.heartbeatTimer = setInterval(async () => {
                    if (this.battleEnded || !this.isOnlineSynced) return;
                    const now = Date.now();
                    const hbPayload = { [`battleHeartbeats.${this.onlineClientId}`]: now };
                    if (this.isOnlineHost) hbPayload.hostLastSeen = now;
                    try {
                        await window.fbUpdateDoc(roomRef, hbPayload);
                        this._netFailCount = 0;
                    } catch (e) {
                        this._netFailCount = (this._netFailCount || 0) + 1;
                        if (this._netFailCount === 1) {
                            this.log('⚠️ 通信が不安定です… 再接続を試みています', 'text-amber-300 text-xs');
                        }
                        if (this._netFailCount >= 4 && !this.battleEnded && this.isOnlineSynced) {
                            this.log('⚠️ インターネット通信エラーが継続したため、一時的にBOTモードへ切り替えます（同じルームIDを入力すると復帰できます）。', 'text-amber-400 font-bold');
                            this.fallbackToBotMode();
                        }
                    }
                }, 4000);

                this.healthMonitorTimer = setInterval(() => {
                    if (this.battleEnded || !this.isOnlineSynced || !this.latestRoomData) return;
                    if (this.isOnlineHost) {
                        this.checkOnlineParticipantHealth(this.latestRoomData);
                    } else {
                        this.checkHostHealthAndMigrate(this.latestRoomData);
                    }
                }, 3000);

                const attachOnlineListener = () => {
                    if (this.battleEnded || !this.isOnlineSynced) return;
                    if (this.firestoreUnsub) {
                        this.firestoreUnsub();
                        this.firestoreUnsub = null;
                    }
                    this.firestoreUnsub = window.fbOnSnapshot(roomRef, async (snapshot) => {
                        const data = snapshot.data ? snapshot.data() : null;
                        if (!data) return;
                        this._listenerRetryCount = 0;
                        this._netFailCount = 0;
                        this.latestRoomData = data;

                        if (this.isOnlineHost) {
                            const hadSlotChange = this.syncRejoinedHumansFromRoomData(data);
                            if (hadSlotChange && !this._processingRemoteAction && !this.battleEnded) {
                                await this.publishOnlineBattleState(roomRef);
                            }
                            this.checkOnlineParticipantHealth(data);
                            const pa = data.pendingAction;
                            if (
                                pa &&
                                pa.stepSeq === this.onlineStepSeq &&
                                this.onlineAwaitingTeam !== null &&
                                pa.uid === this.onlineAwaitingUid &&
                                !this._processingRemoteAction &&
                                !this.battleEnded
                            ) {
                                this._processingRemoteAction = true;
                                this.processOnlineHostHumanAction(pa).finally(() => {
                                    this._processingRemoteAction = false;
                                });
                            }
                        } else {
                            this.syncRejoinedHumansFromRoomData(data);
                            if (data.battleState && typeof data.battleState.seq === 'number' && data.battleState.seq > this.lastAppliedOnlineSeq) {
                                await this.applyOnlineBattleState(data.battleState, data);
                            }
                            if (!this.battleEnded && this.isOnlineSynced) {
                                await this.checkHostHealthAndMigrate(data);
                            }
                        }
                    }, (err) => {
                        console.error('Online 3v3 listener error:', err);
                        this._listenerRetryCount = (this._listenerRetryCount || 0) + 1;
                        if (this._listenerRetryCount <= 3 && !this.battleEnded && this.isOnlineSynced) {
                            this.log(`⚠️ 通信エラーにより再同期を試行中 (${this._listenerRetryCount}/3)...`, 'text-amber-300 text-xs');
                            if (this._listenerRetryTimer) clearTimeout(this._listenerRetryTimer);
                            this._listenerRetryTimer = setTimeout(() => {
                                this._listenerRetryTimer = null;
                                attachOnlineListener();
                            }, 2500);
                        } else {
                            this.log('⚠️ インターネットエラーが続いたためBOT進行へ切り替えます（再度ルームIDを入力すると復帰できます）。', 'text-amber-400 font-bold');
                            this.fallbackToBotMode();
                        }
                    });
                };

                attachOnlineListener();

                const initNow = Date.now();
                const initHb = {
                    [`battleHeartbeats.${this.onlineClientId}`]: initNow,
                    [`slotLeaveFlags.${this.onlineClientId}`]: 0,
                    [`slotRejoinAt.${this.onlineClientId}`]: initNow
                };
                if (this.isOnlineHost) initHb.hostLastSeen = initNow;
                window.fbUpdateDoc(roomRef, initHb).catch(() => {});

                if (this.isResume) {
                    if (this.isOnlineHost) {
                        await this.resumeOnlineHostLoop();
                    } else if (this.isMyTurnOnline()) {
                        this.startTimer();
                    }
                    return;
                }

                if (this.isOnlineHost) {
                    const t1Total = (this.team1Fighters || []).reduce((sum, c) => sum + (c ? (c.maxHp || c.hp || 0) : 0), 0);
                    const t2Total = (this.team2Fighters || []).reduce((sum, c) => sum + (c ? (c.maxHp || c.hp || 0) : 0), 0);
                    const myTotal = this.myTeamNum === 1 ? t1Total : t2Total;
                    const oppTotal = this.myTeamNum === 1 ? t2Total : t1Total;

                    if (t1Total < t2Total) {
                        this.firstStrikerTeam = 1;
                    } else if (t2Total < t1Total) {
                        this.firstStrikerTeam = 2;
                    } else {
                        this.firstStrikerTeam = Math.random() < 0.5 ? 1 : 2;
                    }
                    this.firstStrikerPlayerNum = (this.firstStrikerTeam === this.myTeamNum) ? 1 : 2;

                    if (this.controlSingleAllyOnly) {
                        this.log(`🌐 オンラインマルチ対戦 開始！（操作キャラ: ${this.p1.charName}）`, 'text-emerald-300 font-bold');
                    } else {
                        this.log(`🌐 オンライン2人対戦（3体操作）開始！`, 'text-emerald-300 font-bold');
                    }
                    this.log(`⚔️ バトル開始！ 味方チーム (合計HP: ${myTotal}) VS 敵チーム (合計HP: ${oppTotal})`, 'text-amber-300 font-bold');
                    const firstIsMyTeam = this.firstStrikerTeam === this.myTeamNum;
                    this.log(`❤️ 3体合計HP比較により、【${firstIsMyTeam ? '味方チーム' : '敵チーム'}】が先攻！（以降は先攻→後攻の交代制）`, firstIsMyTeam ? 'text-emerald-300 font-bold' : 'text-red-300 font-bold');

                    await this.startOnlineHostTurn();
                }
            }

            async publishOnlineBattleState(roomRef, extraFields = null) {
                if (!this.isOnlineSynced || !this.isOnlineHost) return;
                this._onlinePublishSeq = (this._onlinePublishSeq || 0) + 1;
                const payload = {
                    battleState: {
                        seq: this._onlinePublishSeq,
                        stepSeq: this.onlineStepSeq,
                        turn: this.turn,
                        isSuddenDeath: !!this.isSuddenDeath,
                        firstStrikerTeam: this.firstStrikerTeam,
                        turnCanonicalOrder: Array.isArray(this.turnCanonicalOrder) ? [...this.turnCanonicalOrder] : [1, 2],
                        turnCanonicalPhase: this.turnCanonicalPhase,
                        turnCanonicalSlot: this.turnCanonicalSlot,
                        awaitingTeam: this.onlineAwaitingTeam,
                        awaitingSlot: this.onlineAwaitingSlot,
                        awaitingUid: this.onlineAwaitingUid,
                        isProcessing: !!this.isProcessing,
                        currentAttackerTeam: this.currentAttacker ? this.currentAttacker.canonicalTeam : null,
                        currentAttackerSlot: (this.currentAttacker && typeof this.currentAttacker.canonicalSlot === 'number') ? this.currentAttacker.canonicalSlot : null,
                        battleEnded: !!this.battleEnded,
                        winningTeam: this.winningTeam !== undefined ? this.winningTeam : null,
                        winnerText: this.winnerText || '',
                        battleData: { ...(this.battleData || {}) },
                        team1Chars: (this.team1Fighters || []).map(f => this.serializePlayer(f)),
                        team2Chars: (this.team2Fighters || []).map(f => this.serializePlayer(f)),
                        events: [...(this._onlineEventBuffer || [])],
                        updatedAt: Date.now()
                    },
                    hostLastSeen: Date.now(),
                    updatedAt: Date.now()
                };
                if (this.battleEnded) {
                    payload.status = 'ended';
                }
                if (extraFields && typeof extraFields === 'object') {
                    Object.assign(payload, extraFields);
                }
                try {
                    await window.fbUpdateDoc(roomRef, payload);
                    this._netFailCount = 0;
                } catch (e) {
                    console.error('publishOnlineBattleState error:', e);
                }
            }

            async startOnlineHostTurn() {
                if (!this.isOnlineSynced || !this.isOnlineHost || this.battleEnded) return;
                this.currentTurnLogs = [];

                const allFighters = [...(this.team1Fighters || []), ...(this.team2Fighters || [])];
                allFighters.forEach(p => {
                    if (p && p.hp > 0) this.checkPashaDarkMode(p);
                });
                this.checkPashaPassive();

                if (this.isSuddenDeath) {
                    this.log(`--- [ ターン ${this.turn} (🔥サドンデス) ] ---`, 'text-red-400 font-bold text-center');
                } else {
                    this.log(`--- [ ターン ${this.turn} ] ---`, 'text-slate-400 font-bold text-center');
                }

                this.turnCanonicalOrder = this.firstStrikerTeam === 1 ? [1, 2] : [2, 1];
                this.turnCanonicalPhase = 0;
                this.turnCanonicalSlot = 0;

                const firstIsMyTeam = this.turnCanonicalOrder[0] === this.myTeamNum;
                this.log(
                    `⚡ ターン ${this.turn}：${firstIsMyTeam ? '【味方チーム】' : '【敵チーム】'}から1体ずつ行動し、続いて${firstIsMyTeam ? '【敵チーム】' : '【味方チーム】'}が行動します！`,
                    firstIsMyTeam ? 'text-emerald-300 font-bold' : 'text-red-300 font-bold'
                );

                await this.advanceOnlineHostStep();
            }

            async advanceOnlineHostStep() {
                if (!this.isOnlineSynced || !this.isOnlineHost || this.battleEnded) return;
                if (!this.botAdapter) this.botAdapter = new BotInputAdapter();
                const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', this.roomId);
                this._stepGen = (this._stepGen || 0) + 1;
                const myGen = this._stepGen;

                if (this._hostRemoteWaitTimeout) {
                    clearTimeout(this._hostRemoteWaitTimeout);
                    this._hostRemoteWaitTimeout = null;
                }

                while (this.turnCanonicalPhase < 2) {
                    if (this.battleEnded || myGen !== this._stepGen) return;
                    const teamNum = this.turnCanonicalOrder[this.turnCanonicalPhase];
                    const teamArr = teamNum === 1 ? this.team1Fighters : this.team2Fighters;
                    const slotsArr = teamNum === 1 ? this.team1Slots : this.team2Slots;

                    while (this.turnCanonicalSlot < teamArr.length && (!teamArr[this.turnCanonicalSlot] || teamArr[this.turnCanonicalSlot].hp <= 0)) {
                        this.turnCanonicalSlot++;
                    }

                    if (this.turnCanonicalSlot >= teamArr.length) {
                        this.turnCanonicalPhase++;
                        this.turnCanonicalSlot = 0;
                        if (this.turnCanonicalPhase < 2) {
                            const nextTeam = this.turnCanonicalOrder[this.turnCanonicalPhase];
                            const nextIsMy = nextTeam === this.myTeamNum;
                            this.log(
                                `🔄 続いて ${nextIsMy ? '【味方チーム】' : '【敵チーム】'}の行動フェーズへ！`,
                                nextIsMy ? 'text-emerald-300 font-bold' : 'text-red-300 font-bold'
                            );
                        }
                        continue;
                    }

                    const actor = teamArr[this.turnCanonicalSlot];
                    const slotMeta = (slotsArr && slotsArr[this.turnCanonicalSlot]) || { type: 'bot' };
                    const isHumanSlot = slotMeta.type === 'human' && !!slotMeta.uid && !actor.isBot;

                    if (isHumanSlot && (actor.isResting || actor.eggplantReady)) {
                        this.onlineAwaitingTeam = null;
                        this.onlineAwaitingSlot = null;
                        this.onlineAwaitingUid = null;
                        this.waitingForOpponent = false;
                        this.isProcessing = true;
                        this.currentAttacker = actor;
                        this.onlineStepSeq++;
                        await this.publishOnlineBattleState(roomRef, { pendingAction: null });
                        if (this.onStateChange) this.onStateChange(this);

                        await new Promise(resolve => setTimeout(resolve, 450));
                        if (this.battleEnded || myGen !== this._stepGen) return;

                        const oppArr = teamNum === 1 ? this.team2Fighters : this.team1Fighters;
                        const livingOpp = oppArr.filter(o => o && o.hp > 0);
                        const forcedSkill = actor.eggplantReady ? 'momo_eggplant_burst' : 'rest';
                        this.executePlayerAction(actor, livingOpp[0] || actor, forcedSkill);
                        this.onlineStepSeq++;
                        if (await this.checkWinner() || myGen !== this._stepGen) {
                            await this.publishOnlineBattleState(roomRef, { pendingAction: null });
                            if (this.onStateChange) this.onStateChange(this);
                            return;
                        }
                        await this.publishOnlineBattleState(roomRef, { pendingAction: null });
                        if (this.onStateChange) this.onStateChange(this);
                        this.turnCanonicalSlot++;
                        continue;
                    }

                    if (isHumanSlot) {
                        const isMine = (teamNum === this.myTeamNum && this.myControlSlots.includes(this.turnCanonicalSlot));
                        this.stopTimer();
                        this.isProcessing = false;
                        this.currentAttacker = null;
                        this.onlineAwaitingTeam = teamNum;
                        this.onlineAwaitingSlot = this.turnCanonicalSlot;
                        this.onlineAwaitingUid = slotMeta.uid;
                        this.waitingForOpponent = !isMine;
                        this.p1Action = null;
                        this.p1TargetIndex = null;
                        this.p1TargetChar = null;

                        if (isMine) {
                            this.activeAllyIndex = this.turnCanonicalSlot;
                            this.currentControllingAllyIndex = this.turnCanonicalSlot;
                            this.p1 = actor;
                            if (typeof newBattleViewMode !== 'undefined') newBattleViewMode = 'main';
                            if (typeof isNewBattleSkillModalOpen !== 'undefined') isNewBattleSkillModalOpen = false;
                            if (typeof newBattleTargetSelectSkillId !== 'undefined') newBattleTargetSelectSkillId = null;
                            if (typeof newBattleTargetSelectType !== 'undefined') newBattleTargetSelectType = null;
                            this.log(`👉 【味方 ${actor.charName}】のコマンドを選択してください！`, 'text-emerald-300 font-bold');
                        } else {
                            this.p1 = this.allies[this.myControlSlots[0] || 0] || this.allies[0];
                            const actorLabel = slotMeta.playerName || actor.charName;
                            this.log(`⏳ ${actorLabel} (${actor.charName}) の行動を待っています...`, 'text-slate-300');
                        }

                        this.onlineStepSeq++;
                        await this.publishOnlineBattleState(roomRef, { pendingAction: null });
                        if (this.onStateChange) this.onStateChange(this);

                        if (isMine) {
                            if (this.onCutin) {
                                this.onCutin('🟢 自分のターン！', `ターン ${this.turn} - ${actor.charName} の行動を選択してください`);
                            }
                            this.startTimer();
                        } else {
                            const waitSeq = this.onlineStepSeq;
                            const waitTeam = teamNum;
                            const waitSlot = this.turnCanonicalSlot;
                            this._hostRemoteWaitTimeout = setTimeout(async () => {
                                this._hostRemoteWaitTimeout = null;
                                if (this.battleEnded || myGen !== this._stepGen || this.onlineStepSeq !== waitSeq) return;
                                if (this.onlineAwaitingTeam !== waitTeam || this.onlineAwaitingSlot !== waitSlot) return;
                                const oppArr = waitTeam === 1 ? this.team2Fighters : this.team1Fighters;
                                const livingOpp = oppArr.filter(o => o && o.hp > 0);
                                const defTarget = livingOpp[Math.floor(Math.random() * Math.max(1, livingOpp.length))] || oppArr[0];
                                const fallbackSkill = this.botAdapter.getDecision(actor, defTarget);
                                this.log(`⏰ ${actor.charName} の応答がないため自動選択を実行します！`, 'text-amber-300');
                                await this.processOnlineHostHumanAction({
                                    stepSeq: waitSeq,
                                    uid: slotMeta.uid,
                                    teamNum: waitTeam,
                                    slotIdx: waitSlot,
                                    skillId: fallbackSkill,
                                    targetTeam: waitTeam === 1 ? 2 : 1,
                                    targetSlot: oppArr.indexOf(defTarget) >= 0 ? oppArr.indexOf(defTarget) : 0
                                });
                            }, 24000);
                        }
                        return;
                    }

                    // BOT スロットの行動
                    this.onlineAwaitingTeam = null;
                    this.onlineAwaitingSlot = null;
                    this.onlineAwaitingUid = null;
                    this.waitingForOpponent = false;
                    this.isProcessing = true;
                    this.currentAttacker = actor;
                    this.onlineStepSeq++;
                    await this.publishOnlineBattleState(roomRef, { pendingAction: null });
                    if (this.onStateChange) this.onStateChange(this);

                    await new Promise(resolve => setTimeout(resolve, BOT_ACTION_DELAY));
                    if (this.battleEnded || myGen !== this._stepGen) return;
                    if (!actor || actor.hp <= 0) {
                        this.turnCanonicalSlot++;
                        continue;
                    }

                    const opposingTeam = teamNum === 1 ? this.team2Fighters : this.team1Fighters;
                    const ownTeam = teamArr;
                    const livingOpposing = opposingTeam.filter(o => o && o.hp > 0);
                    if (livingOpposing.length > 0) {
                        const skillId = this.botAdapter.getDecision(actor, livingOpposing[0]);
                        const skill = actor.skills.find(s => s.id === skillId) || actor.skills[0];
                        const targetPool = (skill && skill.targetType === 'single_ally')
                            ? ownTeam.filter(a => a && a.hp > 0)
                            : livingOpposing;
                        if (targetPool.length > 0) {
                            let defender = targetPool[Math.floor(Math.random() * targetPool.length)];
                            if (skill && skill.targetType === 'single_ally') {
                                const unbuffed = targetPool.filter(a => !a.darknessPowerTurns || a.darknessPowerTurns <= 0);
                                defender = unbuffed.length > 0 ? unbuffed[Math.floor(Math.random() * unbuffed.length)] : defender;
                            }
                            this.executePlayerAction(actor, defender, skillId);
                            this.onlineStepSeq++;
                            if (await this.checkWinner() || myGen !== this._stepGen) {
                                await this.publishOnlineBattleState(roomRef, { pendingAction: null });
                                if (this.onStateChange) this.onStateChange(this);
                                return;
                            }
                            await this.publishOnlineBattleState(roomRef, { pendingAction: null });
                            if (this.onStateChange) this.onStateChange(this);
                        }
                    }

                    this.turnCanonicalSlot++;
                }

                if (!this.battleEnded && myGen === this._stepGen) {
                    this.p1TargetIndex = null;
                    this.p1TargetChar = null;
                    this.currentAttacker = null;
                    this.endTurnPhase();
                    this.onlineStepSeq++;
                    await this.publishOnlineBattleState(roomRef, { pendingAction: null });
                    await this.startOnlineHostTurn();
                }
            }

            async processOnlineHostHumanAction(actionObj) {
                if (!this.isOnlineSynced || !this.isOnlineHost || this.battleEnded || !actionObj) return;
                if (this._hostRemoteWaitTimeout) {
                    clearTimeout(this._hostRemoteWaitTimeout);
                    this._hostRemoteWaitTimeout = null;
                }
                const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', this.roomId);
                const teamNum = actionObj.teamNum;
                const slotIdx = actionObj.slotIdx;
                const skillId = actionObj.skillId;
                const teamArr = teamNum === 1 ? this.team1Fighters : this.team2Fighters;
                const oppArr = teamNum === 1 ? this.team2Fighters : this.team1Fighters;
                const attacker = teamArr[slotIdx];

                if (!attacker || attacker.hp <= 0) {
                    this.turnCanonicalSlot++;
                    await this.advanceOnlineHostStep();
                    return;
                }

                this.stopTimer();
                this.onlineAwaitingTeam = null;
                this.onlineAwaitingSlot = null;
                this.onlineAwaitingUid = null;
                this.waitingForOpponent = false;
                this.isProcessing = true;
                this.turnJustStarted = false;
                this.currentAttacker = attacker;
                if (this.onStateChange) this.onStateChange(this);

                if (skillId === 'dopa_obey_copy' && actionObj.copiedObeySkill) {
                    window.newBattleTargetSelectCopiedSkill = { ...actionObj.copiedObeySkill };
                }

                const livingOpp = oppArr.filter(o => o && o.hp > 0);
                if (livingOpp.length > 0) {
                    const recordedRec = (attacker.id === 'asaiomizu') ? attacker.recordedSkill : null;
                    let skill = null;
                    if (skillId === 'dopa_obey_copy' && window.newBattleTargetSelectCopiedSkill) {
                        skill = { ...window.newBattleTargetSelectCopiedSkill, id: 'dopa_obey_copy' };
                    } else if (attacker.id === 'asaiomizu' && skillId === 'asaiomizu_copied' && recordedRec) {
                        skill = { targetType: recordedRec.targetType || 'single_enemy', ...recordedRec };
                    } else {
                        skill = attacker.skills.find(s => s.id === skillId) || attacker.skills[0];
                    }

                    const isAllyTarget = skill && skill.targetType === 'single_ally';
                    const targetPool = isAllyTarget ? teamArr.filter(a => a && a.hp > 0) : livingOpp;
                    const canonicalTargetTeam = actionObj.targetTeam === 1 ? this.team1Fighters : this.team2Fighters;
                    const chosenByCoord = (canonicalTargetTeam && typeof actionObj.targetSlot === 'number')
                        ? canonicalTargetTeam[actionObj.targetSlot]
                        : null;
                    const defender = (chosenByCoord && chosenByCoord.hp > 0 && targetPool.includes(chosenByCoord))
                        ? chosenByCoord
                        : (targetPool[0] || livingOpp[0]);

                    this.executePlayerAction(attacker, defender, skillId);
                }

                if (skillId === 'dopa_obey_copy') {
                    window.newBattleTargetSelectCopiedSkill = null;
                }
                this.p1Action = null;
                this.p1TargetIndex = null;
                this.p1TargetChar = null;
                this.onlineStepSeq++;

                if (await this.checkWinner()) {
                    await this.publishOnlineBattleState(roomRef, { pendingAction: null });
                    if (this.onStateChange) this.onStateChange(this);
                    return;
                }

                await this.publishOnlineBattleState(roomRef, { pendingAction: null });
                if (this.onStateChange) this.onStateChange(this);

                const actionGen = this._stepGen || 0;
                await new Promise(resolve => setTimeout(resolve, 650));
                if (this.battleEnded || actionGen !== (this._stepGen || 0)) return;

                this.turnCanonicalSlot++;
                await this.advanceOnlineHostStep();
            }

            async applyOnlineBattleState(bs, roomData) {
                if (!bs) return;
                this.latestRoomData = roomData || this.latestRoomData;
                this.lastAppliedOnlineSeq = bs.seq;
                this.onlineStepSeq = bs.stepSeq || 0;
                this.turn = bs.turn || 1;
                this.isSuddenDeath = !!bs.isSuddenDeath;
                this.firstStrikerTeam = bs.firstStrikerTeam || 1;
                this.turnCanonicalPhase = bs.turnCanonicalPhase || 0;
                this.turnCanonicalSlot = bs.turnCanonicalSlot || 0;
                this.onlineAwaitingTeam = bs.awaitingTeam !== undefined ? bs.awaitingTeam : null;
                this.onlineAwaitingSlot = bs.awaitingSlot !== undefined ? bs.awaitingSlot : null;
                this.onlineAwaitingUid = bs.awaitingUid || null;
                this.isProcessing = !!bs.isProcessing;

                if (Array.isArray(bs.team1Chars) && this.team1Fighters) {
                    bs.team1Chars.forEach((st, idx) => {
                        if (this.team1Fighters[idx]) this.deserializePlayer(this.team1Fighters[idx], st);
                    });
                }
                if (Array.isArray(bs.team2Chars) && this.team2Fighters) {
                    bs.team2Chars.forEach((st, idx) => {
                        if (this.team2Fighters[idx]) this.deserializePlayer(this.team2Fighters[idx], st);
                    });
                }

                if (bs.currentAttackerTeam === 1 && typeof bs.currentAttackerSlot === 'number') {
                    this.currentAttacker = this.team1Fighters[bs.currentAttackerSlot] || null;
                } else if (bs.currentAttackerTeam === 2 && typeof bs.currentAttackerSlot === 'number') {
                    this.currentAttacker = this.team2Fighters[bs.currentAttackerSlot] || null;
                } else {
                    this.currentAttacker = null;
                }

                if (this.onlineAwaitingTeam === this.myTeamNum && this.myControlSlots.includes(this.onlineAwaitingSlot)) {
                    this.activeAllyIndex = this.onlineAwaitingSlot;
                    this.currentControllingAllyIndex = this.onlineAwaitingSlot;
                    this.p1 = this.allies[this.onlineAwaitingSlot] || this.allies[0];
                } else {
                    const fallbackIdx = this.controlSingleAllyOnly
                        ? (this.myControlSlots[0] || 0)
                        : (this.myControlSlots.find(idx => this.allies[idx] && this.allies[idx].hp > 0) ?? (this.myControlSlots[0] || 0));
                    this.p1 = this.allies[fallbackIdx] || this.allies[0];
                }

                const pendingShakeTargets = [];
                const shakenKeys = new Set();

                if (Array.isArray(bs.events)) {
                    bs.events.forEach(ev => {
                        if (!ev || typeof ev.seq !== 'number' || ev.seq <= this.lastAppliedOnlineEventSeq) return;
                        this.lastAppliedOnlineEventSeq = ev.seq;

                        if (ev.type === 'log') {
                            const localTeamType = ev.canonicalTeam === 0
                                ? 'system'
                                : (ev.canonicalTeam === this.myTeamNum ? 'ally' : 'enemy');
                            let msgText = ev.msg || '';
                            if (ev.hostTeamNum && ev.hostTeamNum !== this.myTeamNum) {
                                msgText = msgText
                                    .replace(/【味方】/g, '[[TMP_ENEMY]]')
                                    .replace(/【敵】/g, '【味方】')
                                    .replace(/\[\[TMP_ENEMY\]\]/g, '【敵】')
                                    .replace(/【味方チーム】/g, '[[TMP_ENEMY_T]]')
                                    .replace(/【敵チーム】/g, '【味方チーム】')
                                    .replace(/\[\[TMP_ENEMY_T\]\]/g, '【敵チーム】')
                                    .replace(/味方チーム/g, '[[TMP_E_PLAIN]]')
                                    .replace(/敵チーム/g, '味方チーム')
                                    .replace(/\[\[TMP_E_PLAIN\]\]/g, '敵チーム');
                            }
                            if (this.battleLogs) {
                                this.battleLogs.push({ msg: msgText, colorClass: ev.colorClass, teamType: localTeamType });
                            }
                            if (this.onLogUpdate) this.onLogUpdate(msgText, ev.colorClass, localTeamType);
                        } else if (ev.type === 'shake') {
                            const targetChar = ev.canonicalTeam === 1
                                ? this.team1Fighters?.[ev.canonicalSlot]
                                : (ev.canonicalTeam === 2 ? this.team2Fighters?.[ev.canonicalSlot] : null);
                            if (targetChar) {
                                shakenKeys.add(`${ev.canonicalTeam}_${ev.canonicalSlot}`);
                                pendingShakeTargets.push(targetChar);
                            }
                        } else if (ev.type === 'effect') {
                            const targetChar = ev.canonicalTeam === 1
                                ? this.team1Fighters?.[ev.canonicalSlot]
                                : (ev.canonicalTeam === 2 ? this.team2Fighters?.[ev.canonicalSlot] : null);
                            if (targetChar && typeof triggerCharacterEffect === 'function') {
                                triggerCharacterEffect(targetChar, ev.effectType, ev.text);
                            }
                            if (
                                targetChar &&
                                (ev.effectType === 'damage' || ev.effectType === 'counter_damage') &&
                                ev.text !== '回避DOWN' &&
                                !shakenKeys.has(`${ev.canonicalTeam}_${ev.canonicalSlot}`)
                            ) {
                                shakenKeys.add(`${ev.canonicalTeam}_${ev.canonicalSlot}`);
                                pendingShakeTargets.push(targetChar);
                            }
                            if (this.onVisualEffect) {
                                const sideLabel = ev.canonicalTeam === this.myTeamNum ? 'Player' : 'Enemy';
                                this.onVisualEffect(sideLabel, ev.effectType, ev.text);
                            }
                        } else if (ev.type === 'cutin') {
                            if (this.onCutin) this.onCutin(ev.title, ev.subtitle);
                        }
                    });
                }

                const triggerPendingShakes = () => {
                    if (pendingShakeTargets.length > 0 && typeof triggerNewBattleShake === 'function') {
                        pendingShakeTargets.forEach(tc => {
                            triggerNewBattleShake(tc, { skipOnlineEmit: true, skipRender: true });
                        });
                    }
                };

                if (bs.battleEnded) {
                    this.stopTimer();
                    this.stopElapsedTimer();
                    this.waitingForOpponent = false;
                    this.battleEnded = true;
                    if (typeof window.clearOnlineRejoinTicket === 'function') {
                        window.clearOnlineRejoinTicket(this.roomCode, this.roomId);
                    }
                    const livingAllies = (this.allies || []).filter(a => a && a.hp > 0);
                    const livingEnemies = (this.enemies || []).filter(e => e && e.hp > 0);
                    let result = 'draw';
                    if (typeof bs.winningTeam === 'number') {
                        if (bs.winningTeam === 0) result = 'draw';
                        else result = (bs.winningTeam === this.myTeamNum) ? 'win' : 'lose';
                    } else if (livingAllies.length > 0 && livingEnemies.length === 0) {
                        result = 'win';
                    } else if (livingAllies.length === 0 && livingEnemies.length > 0) {
                        result = 'lose';
                    }
                    if (!this.statsRecorded) {
                        this.statsRecorded = true;
                        const myLead = this.allies?.[this.myControlSlots[0] || 0] || this.p1;
                        const oppLead = this.enemies?.[0] || this.p2;
                        if (typeof recordBattleResult === 'function') {
                            recordBattleResult(result, myLead?.id || 'asaiomizu', oppLead?.ownerName || oppLead?.charName || '対戦相手', oppLead?.id || 'pasha', false, 'online_3v3', null, oppLead?.id || 'pasha');
                        }
                    }
                    this.winnerText = result === 'win' ? '🎉 味方チームの勝利！' : (result === 'lose' ? '💀 敵チームの勝利！' : '⚔️ 引き分け！');
                    if (this.onBattleEnd) this.onBattleEnd(this.winnerText);
                    if (this.onStateChange) this.onStateChange(this);
                    triggerPendingShakes();
                    return;
                }

                const myTurnNow = (this.onlineAwaitingTeam === this.myTeamNum && this.myControlSlots.includes(this.onlineAwaitingSlot));
                const promptKey = `${this.onlineStepSeq}_${this.onlineAwaitingTeam}_${this.onlineAwaitingSlot}`;
                if (myTurnNow) {
                    this.waitingForOpponent = false;
                    this.p1Action = null;
                    if (this._lastRemotePromptKey !== promptKey) {
                        this._lastRemotePromptKey = promptKey;
                        if (typeof newBattleViewMode !== 'undefined') newBattleViewMode = 'main';
                        if (typeof isNewBattleSkillModalOpen !== 'undefined') isNewBattleSkillModalOpen = false;
                        if (typeof newBattleTargetSelectSkillId !== 'undefined') newBattleTargetSelectSkillId = null;
                        if (typeof newBattleTargetSelectType !== 'undefined') newBattleTargetSelectType = null;
                        const actor = this.allies[this.onlineAwaitingSlot] || this.p1;
                        if (this.onCutin && actor) {
                            this.onCutin('🟢 自分のターン！', `ターン ${this.turn} - ${actor.charName} の行動を選択してください`);
                        }
                        this.startTimer();
                    }
                } else {
                    this.stopTimer();
                    this.waitingForOpponent = (this.onlineAwaitingUid !== null && this.onlineAwaitingUid !== this.onlineClientId);
                }

                if (this.onStateChange) this.onStateChange(this);
                triggerPendingShakes();
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
                this.isOnlineSynced = false;
                this.botAdapter = new BotInputAdapter();
                if (this._hostRemoteWaitTimeout) {
                    clearTimeout(this._hostRemoteWaitTimeout);
                    this._hostRemoteWaitTimeout = null;
                }
                if (this._listenerRetryTimer) {
                    clearTimeout(this._listenerRetryTimer);
                    this._listenerRetryTimer = null;
                }
                if (this.firestoreUnsub) {
                    this.firestoreUnsub();
                    this.firestoreUnsub = null;
                }
                if (this.heartbeatTimer) {
                    clearInterval(this.heartbeatTimer);
                    this.heartbeatTimer = null;
                }
                if (this.healthMonitorTimer) {
                    clearInterval(this.healthMonitorTimer);
                    this.healthMonitorTimer = null;
                }
                if (this._pageHideHandler) {
                    window.removeEventListener('pagehide', this._pageHideHandler);
                    this._pageHideHandler = null;
                }
                this.waitingForOpponent = false;
                if (this.isNewBattle) {
                    this.onlineAwaitingTeam = null;
                    this.onlineAwaitingSlot = null;
                    this.onlineAwaitingUid = null;
                    this.enemies.forEach(e => { if (e) e.isBot = true; });
                    this.allies.forEach((a, i) => {
                        if (a) a.isBot = (this.controlSingleAllyOnly && !this.myControlSlots.includes(i));
                    });
                    if (!this.battleEnded) {
                        this.startNewBattleTurn();
                    }
                } else {
                    this.startTimer();
                }
                if (this.onStateChange) this.onStateChange(this);
            }

            serializePlayer(p) {
                return {
                    id: p.id,
                    hp: p.hp,
                    maxHp: p.maxHp,
                    atk: p.atk,
                    def: p.def,
                    critRate: p.critRate !== undefined ? p.critRate : 0.05,
                    eva: p.eva,
                    buffAtk: p.buffAtk,
                    buffDef: p.buffDef,
                    buffAtkTurns: p.buffAtkTurns || 0,
                    cooldowns: { ...(p.cooldowns || {}) },
                    courtneyChargeCount: p.courtneyChargeCount !== undefined ? p.courtneyChargeCount : 0,
                    dopaChargeCount: p.dopaChargeCount !== undefined ? p.dopaChargeCount : 0,
                    selectedInheritChar: p.selectedInheritChar || null,
                    tempEvadeNext: !!p.tempEvadeNext,
                    pashaKillerUsed: !!p.pashaKillerUsed,
                    isResting: !!p.isResting,
                    digActive: !!p.digActive,
                    digUsedTurn: p.digUsedTurn || 0,
                    recordedSkill: p.recordedSkill ? { ...p.recordedSkill } : null,
                    eggplantReady: !!p.eggplantReady,
                    isMiniZou: !!p.isMiniZou,
                    momoRevived: !!p.momoRevived,
                    isDarkMode: !!p.isDarkMode,
                    defendBuffTurns: p.defendBuffTurns || 0,
                    crimeDefDownTurns: p.crimeDefDownTurns || 0,
                    nightmareDefTurns: p.nightmareDefTurns || 0,
                    yoseruZeroDefTurns: p.yoseruZeroDefTurns || 0,
                    nightmareAtkActive: !!p.nightmareAtkActive,
                    critRateBonus: p.critRateBonus || 0,
                    critBuffTurns: p.critBuffTurns || 0,
                    evaDebuff: p.evaDebuff || 0,
                    enemyEvaTurns: p.enemyEvaTurns || 0,
                    momoEvaTurns: p.momoEvaTurns || 0,
                    asaiomizuCritTurns: p.asaiomizuCritTurns || 0,
                    pashaPassiveActive: !!p.pashaPassiveActive,
                    stunTurns: p.stunTurns || 0,
                    darknessPowerTurns: p.darknessPowerTurns || 0,
                    darknessAppliedTurn: p.darknessAppliedTurn || 0,
                    pashaRollUsedCount: p.pashaRollUsedCount || 0,
                    pashaRollReviveCount: p.pashaRollReviveCount || 0,
                    iwabaBathTurns: p.iwabaBathTurns || 0,
                    iwabaEvaBonus: p.iwabaEvaBonus || 0,
                    ndaihyoTacticsTurns: p.ndaihyoTacticsTurns || 0,
                    pashaDarkEvaBonus: p.pashaDarkEvaBonus || 0,
                    image: p.image || null,
                    allImage: p.allImage || null,
                    dieImage: p.dieImage || null,
                    roleType: p.roleType || null,
                    roleBadge: p.roleBadge || null,
                    isBot: !!p.isBot
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
                p.cooldowns = { ...(state.cooldowns || {}) };
                p.courtneyChargeCount = state.courtneyChargeCount || 0;
                p.dopaChargeCount = state.dopaChargeCount !== undefined ? state.dopaChargeCount : 0;
                p.selectedInheritChar = state.selectedInheritChar || null;
                p.tempEvadeNext = !!state.tempEvadeNext;
                p.pashaKillerUsed = !!state.pashaKillerUsed;
                p.isResting = !!state.isResting;
                p.digActive = !!state.digActive;
                p.digUsedTurn = state.digUsedTurn || 0;
                p.recordedSkill = state.recordedSkill ? { ...state.recordedSkill } : null;
                p.eggplantReady = !!state.eggplantReady;
                p.isMiniZou = !!state.isMiniZou;
                p.momoRevived = !!state.momoRevived;
                p.isDarkMode = !!state.isDarkMode;
                p.defendBuffTurns = state.defendBuffTurns || 0;
                p.crimeDefDownTurns = state.crimeDefDownTurns || 0;
                p.nightmareDefTurns = state.nightmareDefTurns || 0;
                p.yoseruZeroDefTurns = state.yoseruZeroDefTurns || 0;
                p.nightmareAtkActive = !!state.nightmareAtkActive;
                p.critRateBonus = state.critRateBonus || 0;
                p.critBuffTurns = state.critBuffTurns || 0;
                p.evaDebuff = state.evaDebuff || 0;
                p.enemyEvaTurns = state.enemyEvaTurns || 0;
                p.momoEvaTurns = state.momoEvaTurns || 0;
                p.asaiomizuCritTurns = state.asaiomizuCritTurns || 0;
                p.pashaPassiveActive = !!state.pashaPassiveActive;
                p.stunTurns = state.stunTurns || 0;
                p.darknessPowerTurns = state.darknessPowerTurns || 0;
                p.darknessAppliedTurn = state.darknessAppliedTurn || 0;
                p.pashaRollUsedCount = state.pashaRollUsedCount || 0;
                p.pashaRollReviveCount = state.pashaRollReviveCount || 0;
                p.iwabaBathTurns = state.iwabaBathTurns || 0;
                p.iwabaEvaBonus = state.iwabaEvaBonus || 0;
                p.ndaihyoTacticsTurns = state.ndaihyoTacticsTurns || 0;
                p.pashaDarkEvaBonus = state.pashaDarkEvaBonus || 0;
                if (state.image) p.image = state.image;
                if (state.allImage) p.allImage = state.allImage;
                if (state.dieImage) p.dieImage = state.dieImage;
                if (state.isBot !== undefined) p.isBot = !!state.isBot;
            }

            startTimer() {
                this.stopTimer();
                if (typeof isNewBattleSkillModalOpen !== 'undefined') isNewBattleSkillModalOpen = false;
                if (typeof newBattleViewMode !== 'undefined') newBattleViewMode = 'main';
                if (typeof newBattleTargetSelectSkillId !== 'undefined') newBattleTargetSelectSkillId = null;
                if (typeof newBattleTargetSelectType !== 'undefined') newBattleTargetSelectType = null;
                try { window.isNewBattleSkillModalOpen = false; } catch(e) {}
                try { window.newBattleViewMode = 'main'; } catch(e) {}
                try { window.newBattleTargetSelectSkillId = null; } catch(e) {}
                try { window.newBattleTargetSelectType = null; } catch(e) {}

                const expectedGen = this._stepGen || 0;
                if (this.battleEnded || (this.isNewBattle && this.p1 && this.p1.hp <= 0)) return;
                if (this.p1.hp > 0 && this.p1.eggplantReady && !this.p1Action && !this.battleEnded) {
                    this._autoActionTimeoutId = setTimeout(() => {
                        this._autoActionTimeoutId = null;
                        if (this._stepGen === expectedGen && !this.isProcessing && this.p1.eggplantReady && !this.p1Action && !this.battleEnded) {
                            this.submitAction(1, 'momo_eggplant_burst');
                        }
                    }, 400);
                    return;
                }
                if (this.isNewBattle && this.p1.hp > 0 && this.p1.isResting && !this.p1Action && !this.battleEnded) {
                    this._autoActionTimeoutId = setTimeout(() => {
                        this._autoActionTimeoutId = null;
                        if (this._stepGen === expectedGen && !this.isProcessing && this.p1.isResting && !this.p1Action && !this.battleEnded) {
                            this.submitAction(1, 'rest');
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
                if (this._autoActionTimeoutId) {
                    clearTimeout(this._autoActionTimeoutId);
                    this._autoActionTimeoutId = null;
                }
            }

            resetBattleUIAndModals() {
                if (typeof window.resetBattleUIAndModals === 'function') {
                    window.resetBattleUIAndModals();
                }
            }

            handleTimeOut() {
                if (this.battleEnded || this.isProcessing || this.waitingForOpponent) return;
                if (this.isOnlineSynced && this.isNewBattle && !this.isMyTurnOnline()) return;
                this.resetBattleUIAndModals();
                this.log('⏰ 制限時間切れ！自動選択します。', 'text-amber-400 font-bold');

                // ランダムな生きている敵を選択
                const aliveEnemies = (this.enemies || [this.p2]).filter(e => e && e.hp > 0);
                if (aliveEnemies.length > 0) {
                    const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                    this.p1TargetChar = randomEnemy;
                    this.p1TargetIndex = (this.enemies || [this.p2]).indexOf(randomEnemy);
                }

                // 行動決定（休み等の状態異常には従う）
                let p1Default = null;
                if (this.p1.isResting) {
                    p1Default = 'rest';
                } else if (this.p1.eggplantReady) {
                    p1Default = 'momo_eggplant_burst';
                } else {
                    const normalSkill = (this.p1.skills && this.p1.skills.find(s => s.isNormalAttack)) || (this.p1.skills && this.p1.skills[0]);
                    p1Default = normalSkill ? normalSkill.id : (this.p1.skills && this.p1.skills[0] ? this.p1.skills[0].id : 'momo_attack');
                }

                let p2Default = null;
                if (this.p2.isResting) {
                    p2Default = 'rest';
                } else if (this.p2.eggplantReady) {
                    p2Default = 'momo_eggplant_burst';
                } else {
                    const normalSkill = (this.p2.skills && this.p2.skills.find(s => s.isNormalAttack)) || (this.p2.skills && this.p2.skills[0]);
                    p2Default = normalSkill ? normalSkill.id : (this.p2.skills && this.p2.skills[0] ? this.p2.skills[0].id : 'momo_attack');
                }

                if (this.isOnlineSynced && this.isNewBattle) {
                    if (this.isMyTurnOnline()) this.submitAction(1, p1Default);
                } else if (this.isOnline) {
                    if (this.myPlayerNum === 1 && !this.p1Action) this.submitAction(1, p1Default);
                    if (this.myPlayerNum === 2 && !this.p2Action) this.submitAction(2, p2Default);
                } else if (this.isNewBattle) {
                    if (!this.p1Action) this.submitAction(1, p1Default);
                } else {
                    if (!this.p1Action) this.p1Action = p1Default;
                    if (!this.p2Action) this.p2Action = p2Default;
                    this.processTurn();
                }

                if (typeof renderNewBattleScreen === 'function') {
                    renderNewBattleScreen();
                }
            }

            async submitAction(pNum, skillId) {
                if (this.battleEnded) return;
                if (this.isOnlineSynced && this.isNewBattle) {
                    if (!this.isMyTurnOnline()) return;

                    const activeSlotIdx = (typeof this.onlineAwaitingSlot === 'number')
                        ? this.onlineAwaitingSlot
                        : (this.myControlSlots[0] || 0);
                    const tgtIdx = this.p1TargetIndex;
                    const tgtChar = this.p1TargetChar;
                    const copiedObeySkill = (skillId === 'dopa_obey_copy' && window.newBattleTargetSelectCopiedSkill)
                        ? { ...window.newBattleTargetSelectCopiedSkill }
                        : null;

                    let targetTeam = this.myTeamNum === 1 ? 2 : 1;
                    let targetSlot = 0;
                    if (tgtChar && typeof tgtChar.canonicalTeam === 'number' && typeof tgtChar.canonicalSlot === 'number') {
                        targetTeam = tgtChar.canonicalTeam;
                        targetSlot = tgtChar.canonicalSlot;
                    } else if (typeof tgtIdx === 'number' && this.enemies && this.enemies[tgtIdx]) {
                        targetTeam = this.enemies[tgtIdx].canonicalTeam || (this.myTeamNum === 1 ? 2 : 1);
                        targetSlot = tgtIdx;
                    } else {
                        const firstLivingOpp = (this.enemies || []).findIndex(e => e && e.hp > 0);
                        targetSlot = firstLivingOpp >= 0 ? firstLivingOpp : 0;
                    }

                    this.p1TargetIndex = null;
                    this.p1TargetChar = null;
                    if (skillId === 'dopa_obey_copy') {
                        window.newBattleTargetSelectCopiedSkill = null;
                    }

                    const actionObj = {
                        stepSeq: this.onlineStepSeq,
                        uid: this.onlineClientId,
                        teamNum: this.myTeamNum,
                        slotIdx: activeSlotIdx,
                        skillId: skillId,
                        targetTeam: targetTeam,
                        targetSlot: targetSlot,
                        copiedObeySkill: copiedObeySkill,
                        submittedAt: Date.now()
                    };

                    if (this.isOnlineHost) {
                        await this.processOnlineHostHumanAction(actionObj);
                    } else {
                        this.stopTimer();
                        this.waitingForOpponent = true;
                        this.p1Action = skillId;
                        if (this.onStateChange) this.onStateChange(this);
                        const roomRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'rooms', this.roomId);
                        let sentOk = false;
                        for (let attempt = 0; attempt < 3; attempt++) {
                            try {
                                await window.fbUpdateDoc(roomRef, { pendingAction: actionObj });
                                sentOk = true;
                                this._netFailCount = 0;
                                break;
                            } catch (e) {
                                console.warn(`Online 3v3 pendingAction submit error (attempt ${attempt + 1}):`, e);
                                await new Promise(r => setTimeout(r, 450 * (attempt + 1)));
                            }
                        }
                        if (!sentOk) {
                            this._netFailCount = (this._netFailCount || 0) + 2;
                            this.log('⚠️ 送信エラーが発生しました（通信が切れた場合は自動でBOT操作になり、ルームID再入力で復帰できます）', 'text-amber-400 text-xs');
                            if (this._netFailCount >= 4) {
                                this.fallbackToBotMode();
                            }
                        }
                    }
                    return;
                }

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
                        if (this.isNewBattle) {
                            if (this.isProcessing) return;
                            const idx = typeof this.turnCharIndex === 'number' ? this.turnCharIndex : (this.currentControllingAllyIndex || 0);
                            const attacker = this.allies[idx] || this.p1;
                            if (!attacker || attacker.hp <= 0) {
                                await this.advanceNewBattleStep();
                                return;
                            }

                            this.p1Action = skillId;
                            const tgtIdx = this.p1TargetIndex;
                            const tgtChar = this.p1TargetChar;
                            const copiedObeySkill = (skillId === 'dopa_obey_copy' && window.newBattleTargetSelectCopiedSkill)
                                ? { ...window.newBattleTargetSelectCopiedSkill }
                                : null;

                            this.p1TargetIndex = null;
                            this.p1TargetChar = null;
                            if (skillId === 'dopa_obey_copy') {
                                window.newBattleTargetSelectCopiedSkill = null;
                            }
                            this.stopTimer();

                            this.isProcessing = true;
                            this.turnJustStarted = false;
                            this.currentAttacker = attacker;
                            if (this.onStateChange) this.onStateChange(this);

                            const opponents = this.enemies.filter(e => e && e.hp > 0);
                            if (opponents.length > 0) {
                                const recordedRec = (attacker.id === 'asaiomizu') ? attacker.recordedSkill : null;
                                if (copiedObeySkill && skillId === 'dopa_obey_copy') {
                                    window.newBattleTargetSelectCopiedSkill = copiedObeySkill;
                                }
                                let skill = null;
                                if (skillId === 'dopa_obey_copy' && copiedObeySkill) {
                                    skill = { ...copiedObeySkill, id: 'dopa_obey_copy' };
                                } else if (attacker.id === 'asaiomizu' && skillId === 'asaiomizu_copied' && recordedRec) {
                                    skill = { targetType: recordedRec.targetType || 'single_enemy', ...recordedRec };
                                } else {
                                    skill = attacker.skills.find(s => s.id === skillId) || attacker.skills[0];
                                }
                                const targetList = (skill && skill.targetType === 'single_ally') ? this.allies.filter(a => a && a.hp > 0) : opponents;
                                const targetTeamArr = (skill && skill.targetType === 'single_ally') ? this.allies : this.enemies;

                                let defender = (targetList && targetList.length > 0) ? targetList[0] : opponents[0];
                                if (tgtChar && tgtChar.hp > 0 && targetList.includes(tgtChar)) {
                                    defender = tgtChar;
                                } else if (tgtIdx !== null && tgtIdx !== undefined && targetTeamArr[tgtIdx] && targetTeamArr[tgtIdx].hp > 0 && targetList.includes(targetTeamArr[tgtIdx])) {
                                    defender = targetTeamArr[tgtIdx];
                                }

                                this.executePlayerAction(attacker, defender, skillId);
                            }

                            this.p1Action = null;
                            if (this.onStateChange) this.onStateChange(this);
                            if (await this.checkWinner()) return;

                            const submitGen = this._stepGen || 0;
                            await new Promise(resolve => setTimeout(resolve, 650));
                            if (this.battleEnded || submitGen !== (this._stepGen || 0)) return;

                            this.turnCharIndex = idx + 1;
                            await this.advanceNewBattleStep();
                            return;
                        }
                        this.p1Action = skillId;
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

            async startNewBattleTurn() {
                if (!this.isNewBattle || this.battleEnded) return;
                this.currentTurnLogs = [];

                const allFighters = [...this.allies, ...this.enemies];
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

                const isAlliesFirst = (this.firstStrikerPlayerNum === 1);
                this.turnTeamOrder = isAlliesFirst ? ['ally', 'enemy'] : ['enemy', 'ally'];
                this.turnPhaseIndex = 0;
                this.turnCharIndex = 0;
                this._allyPhaseCutinShownThisTurn = false;
                this.allyActions = new Array(this.allies.length).fill(null);
                this.allyTargets = new Array(this.allies.length).fill(null);

                this.log(`⚡ ターン ${this.turn}：${isAlliesFirst ? '【味方チーム】' : '【敵チーム】'}から1体ずつ行動し、続いて${isAlliesFirst ? '【敵チーム】' : '【味方チーム】'}が行動します！`, isAlliesFirst ? 'text-emerald-300 font-bold' : 'text-red-300 font-bold');

                await this.advanceNewBattleStep();
            }

            async advanceNewBattleStep() {
                if (!this.isNewBattle || this.battleEnded) return;
                if (!this.botAdapter) this.botAdapter = new BotInputAdapter();
                this._stepGen = (this._stepGen || 0) + 1;
                const myGen = this._stepGen;

                while (this.turnPhaseIndex < 2) {
                    if (this.battleEnded || myGen !== this._stepGen) return;
                    const currentTeamType = this.turnTeamOrder[this.turnPhaseIndex];
                    const teamList = currentTeamType === 'ally' ? this.allies : this.enemies;

                    while (this.turnCharIndex < teamList.length && (!teamList[this.turnCharIndex] || teamList[this.turnCharIndex].hp <= 0)) {
                        this.turnCharIndex++;
                    }

                    if (this.turnCharIndex >= teamList.length) {
                        this.turnPhaseIndex++;
                        this.turnCharIndex = 0;
                        if (this.turnPhaseIndex < 2) {
                            const nextTeamType = this.turnTeamOrder[this.turnPhaseIndex];
                            this.log(`🔄 続いて ${nextTeamType === 'ally' ? '【味方チーム】' : '【敵チーム】'}の行動フェーズへ！`, nextTeamType === 'ally' ? 'text-emerald-300 font-bold' : 'text-red-300 font-bold');
                        }
                        continue;
                    }

                    if (currentTeamType === 'ally' && this.controlSingleAllyOnly && !this.isOnlineBattleMode) {
                        const ctrlIdx = this.controlledAllyIndex || 0;
                        const ctrlAlly = this.allies[ctrlIdx];
                        if (ctrlAlly && ctrlAlly.hp <= 0 && !this.waitingForChoice && this.allies.some(a => a && a.hp > 0)) {
                            this.isProcessing = false;
                            this.activeAllyIndex = ctrlIdx;
                            this.currentControllingAllyIndex = ctrlIdx;
                            this.p1 = ctrlAlly;
                            this.checkActiveAllyStatus();
                            return;
                        }
                    }

                    const actor = teamList[this.turnCharIndex];
                    const isHumanControlled = currentTeamType === 'ally' && (!this.controlSingleAllyOnly || this.turnCharIndex === (this.controlledAllyIndex || 0));

                    if (isHumanControlled) {
                        this.currentAttacker = null;
                        this.isProcessing = false;
                        this.turnJustStarted = true;
                        this.activeAllyIndex = this.turnCharIndex;
                        this.currentControllingAllyIndex = this.turnCharIndex;
                        this.p1 = actor;
                        this.p1Action = null;
                        this.p1TargetIndex = null;
                        this.p1TargetChar = null;
                        this.waitingForOpponent = false;
                        if (typeof newBattleViewMode !== 'undefined') newBattleViewMode = 'main';
                        if (typeof isNewBattleSkillModalOpen !== 'undefined') isNewBattleSkillModalOpen = false;
                        if (typeof newBattleTargetSelectSkillId !== 'undefined') newBattleTargetSelectSkillId = null;
                        if (typeof newBattleTargetSelectType !== 'undefined') newBattleTargetSelectType = null;

                        const orderLabel = this.controlSingleAllyOnly ? '' : `${this.turnCharIndex + 1}体目: `;
                        this.log(`👉 【味方 ${orderLabel}${actor.charName}】のコマンドを選択してください！`, 'text-emerald-300 font-bold');

                        if (this.onStateChange) this.onStateChange(this);
                        if (!this._allyPhaseCutinShownThisTurn && this.onCutin) {
                            this._allyPhaseCutinShownThisTurn = true;
                            const cutinSub = this.controlSingleAllyOnly
                                ? `ターン ${this.turn} - あなたの操作キャラ ${actor.charName} の行動を選択してください`
                                : `ターン ${this.turn} - 味方チームが1体ずつ行動します (${actor.charName}から)`;
                            this.onCutin("🟢 味方チームのターン！", cutinSub);
                        }
                        this.startTimer();
                        return;
                    }

                    this.isProcessing = true;
                    this.turnJustStarted = false;
                    this.currentAttacker = actor;
                    if (this.onStateChange) this.onStateChange(this);

                    await new Promise(resolve => setTimeout(resolve, BOT_ACTION_DELAY));
                    if (this.battleEnded || myGen !== this._stepGen) return;
                    if (!actor || actor.hp <= 0) {
                        this.turnCharIndex++;
                        continue;
                    }

                    const opposingTeam = currentTeamType === 'ally' ? this.enemies : this.allies;
                    const ownTeam = currentTeamType === 'ally' ? this.allies : this.enemies;
                    const livingOpposing = opposingTeam.filter(o => o && o.hp > 0);
                    if (livingOpposing.length > 0) {
                        const defaultOpponent = livingOpposing[0];
                        const skillId = this.botAdapter.getDecision(actor, defaultOpponent);
                        const skill = actor.skills.find(s => s.id === skillId) || actor.skills[0];
                        const targetPool = (skill && skill.targetType === 'single_ally')
                            ? ownTeam.filter(a => a && a.hp > 0)
                            : livingOpposing;
                        if (targetPool.length > 0) {
                            let defender = targetPool[Math.floor(Math.random() * targetPool.length)];
                            if (skill && skill.targetType === 'single_ally') {
                                const unbuffed = targetPool.filter(a => !a.darknessPowerTurns || a.darknessPowerTurns <= 0);
                                defender = unbuffed.length > 0 ? unbuffed[Math.floor(Math.random() * unbuffed.length)] : defender;
                            }
                            this.executePlayerAction(actor, defender, skillId);
                            if (this.onStateChange) this.onStateChange(this);
                            if (await this.checkWinner() || myGen !== this._stepGen) return;
                        }
                    }

                    this.turnCharIndex++;
                }

                if (!this.battleEnded && myGen === this._stepGen) {
                    this.p1TargetIndex = null;
                    this.p1TargetChar = null;
                    this.currentAttacker = null;
                    this.endTurnPhase();
                    await this.startNewBattleTurn();
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
                    if (!this.botAdapter) this.botAdapter = new BotInputAdapter();
                    const executeAlliesTurn = async () => {
                        for (let i = 0; i < this.allies.length; i++) {
                            const attacker = this.allies[i];
                            if (!attacker || attacker.hp <= 0) continue;

                            const isHumanControlled = !this.controlSingleAllyOnly || (i === (this.controlledAllyIndex || 0));
                            this.currentAttacker = attacker;
                            if (this.onStateChange) this.onStateChange(this);

                            if (i > 0 || this.firstStrikerPlayerNum !== 1) {
                                await new Promise(resolve => setTimeout(resolve, BOT_ACTION_DELAY));
                            }

                            const opponents = this.enemies.filter(e => e.hp > 0);
                            if (opponents.length > 0) {
                                if (!isHumanControlled) {
                                    const defaultOpponent = opponents[0] || this.enemies[0];
                                    const autoSkillId = this.botAdapter.getDecision(attacker, defaultOpponent);
                                    const autoSkill = attacker.skills.find(s => s.id === autoSkillId) || attacker.skills[0];
                                    const autoOpponents = (autoSkill && autoSkill.targetType === 'single_ally') ? this.allies.filter(a => a.hp > 0) : opponents;
                                    if (autoOpponents.length > 0) {
                                        let autoDefender = autoOpponents[Math.floor(Math.random() * autoOpponents.length)];
                                        if (autoSkill && autoSkill.targetType === 'single_ally') {
                                            const unbuffed = autoOpponents.filter(a => !a.darknessPowerTurns || a.darknessPowerTurns <= 0);
                                            autoDefender = unbuffed.length > 0 ? unbuffed[Math.floor(Math.random() * unbuffed.length)] : autoOpponents[Math.floor(Math.random() * autoOpponents.length)];
                                        }
                                        this.executePlayerAction(attacker, autoDefender, autoSkillId);
                                        if (this.onStateChange) this.onStateChange(this);
                                        if (await this.checkWinner()) return true;
                                    }
                                    continue;
                                }

                                const allyAction = (this.allyActions && this.allyActions[i]) || (attacker.isResting ? 'rest' : attacker.skills[0].id);
                                const savedTarget = (this.allyTargets && this.allyTargets[i]) ? this.allyTargets[i] : null;
                                const recordedRec = (attacker.id === 'asaiomizu') ? attacker.recordedSkill : null;
                                const copiedObeySkill = (savedTarget && savedTarget.copiedObeySkill) ? savedTarget.copiedObeySkill : window.newBattleTargetSelectCopiedSkill;
                                if (copiedObeySkill && allyAction === 'dopa_obey_copy') {
                                    window.newBattleTargetSelectCopiedSkill = copiedObeySkill;
                                }
                                let skill = null;
                                if (allyAction === 'dopa_obey_copy' && copiedObeySkill) {
                                    skill = { ...copiedObeySkill, id: 'dopa_obey_copy' };
                                } else if (attacker.id === 'asaiomizu' && allyAction === 'asaiomizu_copied' && recordedRec) {
                                    skill = { targetType: recordedRec.targetType || 'single_enemy', ...recordedRec };
                                } else {
                                    skill = attacker.skills.find(s => s.id === allyAction) || attacker.skills[0];
                                }
                                const targetList = (skill && skill.targetType === 'single_ally') ? this.allies.filter(a => a.hp > 0) : opponents;
                                const targetTeamArr = (skill && skill.targetType === 'single_ally') ? this.allies : this.enemies;

                                const tgtChar = savedTarget ? savedTarget.targetChar : this.p1TargetChar;
                                const tgtIdx = savedTarget ? savedTarget.targetIndex : this.p1TargetIndex;
                                let defender = targetList && targetList.length > 0 ? targetList[Math.floor(Math.random() * targetList.length)] : opponents[0];
                                if (tgtChar && tgtChar.hp > 0 && targetList.includes(tgtChar)) {
                                    defender = tgtChar;
                                } else if (tgtIdx !== null && tgtIdx !== undefined && targetTeamArr[tgtIdx] && targetTeamArr[tgtIdx].hp > 0 && targetList.includes(targetTeamArr[tgtIdx])) {
                                    defender = targetTeamArr[tgtIdx];
                                } else if (targetList.length > 0) {
                                    defender = targetList[0];
                                }

                                this.executePlayerAction(attacker, defender, allyAction);
                                if (this.onStateChange) this.onStateChange(this);

                                if (await this.checkWinner()) return true;
                            }
                        }
                        return false;
                    };

                    const executeTeamRest = async (teamList, isAllyTeam) => {
                        for (let i = 0; i < teamList.length; i++) {
                            const attacker = teamList[i];
                            if (isAllyTeam) continue;
                            if (attacker.hp <= 0) continue;

                            this.currentAttacker = attacker;
                            if (this.onStateChange) this.onStateChange(this);

                            await new Promise(resolve => setTimeout(resolve, BOT_ACTION_DELAY));

                            const targetPool = this.allies.filter(a => a.hp > 0);
                            const defaultOpponent = targetPool[0] || this.allies[0];
                            const skillId = this.botAdapter.getDecision(attacker, defaultOpponent);

                            const skill = attacker.skills.find(s => s.id === skillId) || attacker.skills[0];
                            const tList = this.enemies;
                            const opposingTeam = this.allies;
                            const opponents = (skill.targetType === 'single_ally') ? tList.filter(a => a.hp > 0) : opposingTeam.filter(e => e.hp > 0);
                            if (opponents.length === 0) break;
                            let defender = opponents[Math.floor(Math.random() * opponents.length)];
                            if (skill.targetType === 'single_ally') {
                                const unbuffed = opponents.filter(a => !a.darknessPowerTurns || a.darknessPowerTurns <= 0);
                                defender = unbuffed.length > 0 ? unbuffed[Math.floor(Math.random() * unbuffed.length)] : opponents[Math.floor(Math.random() * opponents.length)];
                            }

                            this.executePlayerAction(attacker, defender, skillId);
                            if (this.onStateChange) this.onStateChange(this);

                            if (await this.checkWinner()) return true;
                        }
                        return false;
                    };

                    const isAlliesFirst = (this.firstStrikerPlayerNum === 1);

                    if (isAlliesFirst) {
                        if (await executeAlliesTurn()) return;
                        if (await executeTeamRest(this.enemies, false)) return;
                    } else {
                        if (await executeTeamRest(this.enemies, false)) return;
                        if (await executeAlliesTurn()) return;
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
                if (this.isNewBattle && this.allies) {
                    this.allyActions = new Array(this.allies.length).fill(null);
                    this.allyTargets = new Array(this.allies.length).fill(null);
                    if (this.controlSingleAllyOnly) {
                        const cIdx = this.controlledAllyIndex || 0;
                        this.activeAllyIndex = cIdx;
                        this.currentControllingAllyIndex = cIdx;
                        this.p1 = this.allies[cIdx];
                    } else {
                        let firstLiving = 0;
                        for (let i = 0; i < this.allies.length; i++) {
                            if (this.allies[i] && this.allies[i].hp > 0) {
                                firstLiving = i;
                                break;
                            }
                        }
                        this.activeAllyIndex = firstLiving;
                        this.currentControllingAllyIndex = firstLiving;
                        this.p1 = this.allies[firstLiving];
                    }
                }
                this.p1Action = null;
                this.p2Action = null;
                this.p1TargetIndex = null;
                this.p1TargetChar = null;
                this.waitingForOpponent = false;

                if (this.isNewBattle && this.controlSingleAllyOnly && !this.battleEnded && this.p1 && this.p1.hp <= 0) {
                    if (this.isOnlineBattleMode) {
                        this.stopTimer();
                        if (this.onStateChange) this.onStateChange(this);
                        return;
                    }
                    if (this.checkActiveAllyStatus()) return;
                }

                if (this.onStateChange) this.onStateChange(this);
                if (!this.battleEnded) {
                    this.startTimer();
                    if (this.isNewBattle && this.onCutin) {
                        const turnSub = this.controlSingleAllyOnly
                            ? `ターン ${this.turn} - あなたの操作キャラ ${this.p1.charName} の行動を選択してください`
                            : `ターン ${this.turn} - 味方 ${this.p1.charName} の行動を選択してください`;
                        this.onCutin("🟢 自分のターンです！", turnSub);
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

                if (attacker.eggplantReady && skillId !== 'momo_prep') {
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
                        ...rec,
                        id: 'dopa_obey_copy',
                        originalId: rec.id,
                        name: `👑【王に従え】${rec.name}`,
                        isNormalAttack: false,
                        cooldown: 0,
                        targetType: rec.targetType || 'single_enemy'
                    };
                    if (rec.id === 'courtney_charge_release') {
                        skill.power = 2.5;
                        skill.type = 'attack';
                    } else if (rec.id === 'courtney_feel' || rec.id === 'courtney_charge_only') {
                        skill.type = 'buff';
                        skill.buffType = 'atk';
                        skill.amount = 1.5;
                    }
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
        if (skill && skill.id === 'dopa_obey_copy') {
            this.log(`👑【王に従え】${attacker.charName} は ${skill.name} を発動！`, 'text-amber-300 font-bold text-base');
            if (typeof audioSystem !== 'undefined' && audioSystem.playSpecial) audioSystem.playSpecial();
            if (skill.originalId) {
                skill.id = skill.originalId;
            }
        }
    
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
                            if (typeof triggerNewBattleCharacterEffect === 'function') {
                                triggerNewBattleCharacterEffect(a, 'heal', `+${hAmt}`);
                            } else {
                                this.triggerEffect(this.getCharacterTeam(a) === 'ally' ? 'Player' : 'Enemy', 'heal', `+${hAmt}`, a);
                            }
                            if (typeof this.checkPashaDarkMode === 'function') {
                                this.checkPashaDarkMode(a);
                            }
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
                            targetDead.isResting = false;
                            targetDead.stunTurns = 0;

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
                    this.triggerEffect(defender === this.p1 ? 'Player' : 'Enemy', 'damage', `-${inheritDmg}`, defender);

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
            this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'damage', `-${jugglerDmg}`, defender);
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
                    this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'damage', `-${hitDmg}`, defender);
                } else {
                    defender.hp = 0;
                    this.log(`✨⚡【神頼み 5%的中！！】 ${defender.charName} に 1000 の必殺ダメージ！！`, 'text-yellow-300 font-black font-pixel text-base');
                    this.triggerCutin('⚡ 神頼み 5%的中！！', '奇跡の1000ダメージで撃破！');
                    this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'damage', '-1000', defender);
                }
                if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(defender);
                audioSystem.playSpecial();
            } else {
                attacker.hp = Math.max(0, attacker.hp - 50);
                this.log(`🎲 ${attacker.charName} の「神頼み」… 運悪く失敗し、自分に 50 のダメージを受けた！`, 'text-red-400 font-bold');
                this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'damage', '-50', attacker);
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

            // 「王に従え」使用によりチャージ回数と変身状態をゼロにリセット
            attacker.dopaChargeCount = 0;
            attacker.selectedInheritChar = null;
            if (this.p1 && attacker.id === 'dopagaking') {
                this.p1.dopaChargeCount = 0;
                this.p1.selectedInheritChar = null;
            }
            
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
                        this.triggerEffect(defender === this.p1 ? 'Player' : 'Enemy', 'damage', `🔥 ${releaseDmg} DMG!`, defender);
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
                        this.log(`🍆 ${attacker.charName} の「超ナスちん乱舞」発動！！ 3ターンの間、全味方のクリティカル大幅UP ＆ 敵全体の回避率中DOWN！`, 'text-purple-300 font-bold text-base');
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
                        this.log(`🍆 ${attacker.charName} はナスを構えて「ナス準備中」に入った！（チャージ完了）`, 'text-purple-300 font-bold');
                        this.log(`✨ 次ターン、自動的に「超ナスちん乱舞」が発動する！`, 'text-amber-300 font-bold');
                        if (typeof this.triggerCutin === 'function') {
                            this.triggerCutin('🍆 ナス準備完了！', '次ターン「超ナスちん乱舞」発動！');
                        }
                        this.triggerEffect(attacker === this.p1 ? 'Player' : 'Enemy', 'buff', 'ナス準備中！');
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
                    this.triggerEffect(targetSide, 'damage', `-${killerDamage} (50%)`, defender);
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

                if (defender.hp <= 0 && defender.id === 'momo' && !defender.momoRevived) {
                    defender.momoRevived = true;
                    defender.hp = Math.floor(defender.maxHp * 0.35);
                    this.log(`✨ 桃ピンは諦めない！要塞の底力でHP ${defender.hp} で復活！！`, 'text-amber-300 font-bold');
                    this.triggerCutin('✨ ナス要塞不屈の復活！', '桃ピンは倒れない！ HP35%で復活！');
                    this.triggerEffect(side, 'heal', '不屈復活!!', defender);
                    audioSystem.playSpecial();
                    return;
                }

                if (this.checkActiveAllyStatus()) return;

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
                const isOwnPerspective = !(this.isOnline && !this.isOnlineSynced && this.myPlayerNum === 2);

                if (livingAllies.length === 0 && livingEnemies.length === 0) {
                    winnerText = '⚔️ 引き分け！相討ちとなりました！';
                    isEnded = true;
                    this.winningTeam = 0;
                    this.log(winnerText, 'text-yellow-400 font-bold text-center text-sm');
                    this.log(`🤝 引き分けとなりました。`, 'text-yellow-400 font-bold text-center');
                } else if (livingEnemies.length === 0) {
                    winnerText = `🎉 【${(this.allies && this.allies[0]) ? this.allies[0].charName : this.p1.charName}】チームの勝利！`;
                    isEnded = true;
                    this.winningTeam = this.myTeamNum || 1;
                    this.log(winnerText, 'text-emerald-400 font-bold text-center text-sm');
                    audioSystem.playVictory();
                    if (!this.isOnline || isOwnPerspective || this.myPlayerNum === 1) {
                        const earnedDopa = 150;
                        await addDopa(earnedDopa);
                        this.log(`🎁 勝利報酬: +${formatDopa(earnedDopa)} DOPA 獲得！`, 'text-amber-300 font-bold text-center');
                    }
                } else if (livingAllies.length === 0) {
                    winnerText = `💀 敵チームの勝利！`;
                    isEnded = true;
                    this.winningTeam = (this.myTeamNum === 1) ? 2 : 1;
                    this.log(winnerText, 'text-red-400 font-bold text-center text-sm');
                    audioSystem.playDefeat();
                    this.log(`💀 敗北… 次回は勝利を目指そう！`, 'text-red-400 font-bold text-center');
                    if (this.isOnline && !this.isOnlineSynced && this.myPlayerNum === 2) {
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
                    if (typeof window.clearOnlineRejoinTicket === 'function') {
                        window.clearOnlineRejoinTicket(this.roomCode, this.roomId);
                    }

                    let result = 'draw';
                    if (this.isNewBattle) {
                        if (livingAllies.length > 0 && livingEnemies.length === 0) {
                            result = (this.isOnline && !this.isOnlineSynced && this.myPlayerNum === 2) ? 'lose' : 'win';
                        } else if (livingAllies.length === 0 && livingEnemies.length > 0) {
                            result = (this.isOnline && !this.isOnlineSynced && this.myPlayerNum === 2) ? 'win' : 'lose';
                        }
                    } else if (this.p1.hp > 0 && this.p2.hp <= 0) {
                        result = (this.isOnline && this.myPlayerNum === 2) ? 'lose' : 'win';
                    } else if (this.p1.hp <= 0 && this.p2.hp > 0) {
                        result = (this.isOnline && this.myPlayerNum === 2) ? 'win' : 'lose';
                    } else if (this.p1.hp <= 0 && this.p2.hp <= 0) {
                        result = 'draw';
                    }

                    const useLegacySwap = (this.isOnline && !this.isOnlineSynced && this.myPlayerNum === 2);
                    const myCharId = useLegacySwap ? this.p2.id : this.p1.id;
                    const oppChar = useLegacySwap ? this.p1 : this.p2;
                    const oppCharId = oppChar.id;
                    const oppProfile = this.latestRoomData ? (this.myPlayerNum === 1 ? this.latestRoomData.p2Profile : this.latestRoomData.p1Profile) : null;
                    const oppName = oppProfile?.playerName || oppChar.ownerName || oppChar.charName || '対戦相手';
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

            recordOnlineShake(targetChar) {
                if (!this.isOnlineSynced || !this.isOnlineHost || !targetChar || typeof targetChar.canonicalTeam !== 'number') return;
                this._onlineEventSeq = (this._onlineEventSeq || 0) + 1;
                this._onlineEventBuffer.push({
                    seq: this._onlineEventSeq,
                    type: 'shake',
                    canonicalTeam: targetChar.canonicalTeam,
                    canonicalSlot: targetChar.canonicalSlot || 0
                });
                if (this._onlineEventBuffer.length > 45) {
                    this._onlineEventBuffer = this._onlineEventBuffer.slice(-45);
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
                if (this.isOnlineSynced && this.isOnlineHost && targetChar && typeof targetChar.canonicalTeam === 'number') {
                    this._onlineEventSeq = (this._onlineEventSeq || 0) + 1;
                    this._onlineEventBuffer.push({
                        seq: this._onlineEventSeq,
                        type: 'effect',
                        canonicalTeam: targetChar.canonicalTeam,
                        canonicalSlot: targetChar.canonicalSlot || 0,
                        effectType: type,
                        text
                    });
                    if (this._onlineEventBuffer.length > 45) {
                        this._onlineEventBuffer = this._onlineEventBuffer.slice(-45);
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
                if (this.isOnlineSynced && this.isOnlineHost) {
                    this._onlineEventSeq = (this._onlineEventSeq || 0) + 1;
                    this._onlineEventBuffer.push({
                        seq: this._onlineEventSeq,
                        type: 'cutin',
                        title,
                        subtitle
                    });
                    if (this._onlineEventBuffer.length > 45) {
                        this._onlineEventBuffer = this._onlineEventBuffer.slice(-45);
                    }
                }
                if (this.onCutin) this.onCutin(title, subtitle);
            }

            destroy() {
                this.stopTimer();
                if (this._hostRemoteWaitTimeout) {
                    clearTimeout(this._hostRemoteWaitTimeout);
                    this._hostRemoteWaitTimeout = null;
                }
                if (this._listenerRetryTimer) {
                    clearTimeout(this._listenerRetryTimer);
                    this._listenerRetryTimer = null;
                }
                if (this.firestoreUnsub) {
                    this.firestoreUnsub();
                    this.firestoreUnsub = null;
                    this.onlineSyncStarted = false;
                }
                if (this.heartbeatTimer) {
                    clearInterval(this.heartbeatTimer);
                    this.heartbeatTimer = null;
                }
                if (this.healthMonitorTimer) {
                    clearInterval(this.healthMonitorTimer);
                    this.healthMonitorTimer = null;
                }
                if (this._pageHideHandler) {
                    window.removeEventListener('pagehide', this._pageHideHandler);
                    this._pageHideHandler = null;
                }
            }
        }

        
        function getCharacterShakeElement(char) {
            if (!activeNewBattle || !char) return null;
            if (activeNewBattle.enemies) {
                const idx = activeNewBattle.enemies.findIndex(e => e === char);
                if (idx !== -1) return document.getElementById(`enemy-shake-${idx}`) || document.getElementById(`new-enemy-img-${idx}`) || document.getElementById(`new-enemy-char-${idx}`);
            }
            if (activeNewBattle.allies) {
                const idx = activeNewBattle.allies.findIndex(a => a === char);
                if (idx !== -1) return document.getElementById(`ally-shake-${idx}`) || document.getElementById(`new-ally-img-${idx}`) || document.getElementById(`new-ally-char-${idx}`);
            }
            return null;
        }
        window.getCharacterShakeElement = getCharacterShakeElement;

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
                            <img src="${resolveAssetSrc('images/screen.webp')}" alt="screen" class="w-1/2 h-full object-cover">
                            <img src="${resolveAssetSrc('images/screen.webp')}" alt="screen" class="w-1/2 h-full object-cover">
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
                    <img src="${resolveAssetSrc('dopaAI/rough.webp')}" alt="rough" class="absolute bottom-0 right-2 sm:right-4 w-36 sm:w-52 object-contain pointer-events-none z-10 opacity-95">

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
                            <img src="${resolveAssetSrc('images/screen.webp')}" alt="screen" class="w-1/2 h-full object-cover">
                            <img src="${resolveAssetSrc('images/screen.webp')}" alt="screen" class="w-1/2 h-full object-cover">
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
                            <img src="${resolveAssetSrc('images/screen.webp')}" alt="screen" class="w-1/2 h-full object-cover">
                            <img src="${resolveAssetSrc('images/screen.webp')}" alt="screen" class="w-1/2 h-full object-cover">
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

        function renderNewBattleCharSelectScreen(sortOrder = 'default', sortDir = 'desc', onlyOwned = false, isOnline = false) {
            audioSystem.playSelect();
            if (isOnline) window.isOnlineBattleMode = true;
            else window.isOnlineBattleMode = false;
            const existingOverlay = document.getElementById('battle-result-overlay');
            if (existingOverlay) existingOverlay.remove();

            const container = document.getElementById('screen-container');
            if (!container) return;
            container.scrollTop = 0;

            const onlineCfg = (isOnline && typeof getOnlineBattleConfig === 'function') ? getOnlineBattleConfig() : { matchMode: '2p', allyHumanCount: 1, enemyHumanCount: 1, allyBotCount: 0, enemyBotCount: 0, totalHumans: 2, controlSingleAllyOnly: false };
            const isOnlineMultiSingle = !!(isOnline && onlineCfg.matchMode === 'multi');

            const team = getSelectedNewBattleTeam();
            const activeSlot = getActiveTeamSlotIndex();
            const selectedCount = team.filter(Boolean).length;
            const selectedMultiCharId = isOnlineMultiSingle && typeof getSelectedOnlineMultiChar === 'function' ? getSelectedOnlineMultiChar() : null;
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

            let teamSlotsHtml = '';
            if (isOnlineMultiSingle) {
                const chosenData = selectedMultiCharId ? CHARACTER_DATA[selectedMultiCharId] : null;
                teamSlotsHtml = [0, 1, 2].map(idx => {
                    if (idx === 0) {
                        if (chosenData) {
                            return `
                                <div class="flex-1 min-w-0 flex items-center gap-1.5 px-2 py-1 rounded border-2 border-emerald-400 bg-emerald-950/60 shadow-[0_0_8px_rgba(52,211,153,0.45)]">
                                    <canvas id="team-slot-cvs-0" width="36" height="36" class="w-7 h-7 sm:w-9 sm:h-9 rounded bg-slate-950 border border-emerald-500 shrink-0"></canvas>
                                    <div class="min-w-0 flex-1 text-left leading-tight">
                                        <div class="text-[8px] sm:text-[9px] font-pixel text-emerald-300 font-bold truncate">★あなた (操作1体)</div>
                                        <div class="text-[10px] sm:text-xs font-bold text-white truncate">${chosenData.name}</div>
                                    </div>
                                </div>
                            `;
                        }
                        return `
                            <div class="flex-1 min-w-0 flex items-center gap-1.5 px-2 py-1 rounded border-2 border-emerald-400 border-dashed bg-emerald-950/40">
                                <div class="w-7 h-7 sm:w-9 sm:h-9 rounded bg-slate-900 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">?</div>
                                <div class="min-w-0 flex-1 text-left leading-tight">
                                    <div class="text-[8px] sm:text-[9px] font-pixel text-emerald-300 font-bold truncate">★あなた (操作1体)</div>
                                    <div class="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">1体選択...</div>
                                </div>
                            </div>
                        `;
                    }
                    const isHumanAlly = (Array.isArray(onlineCfg.allySlots) && onlineCfg.allySlots.length === 3)
                        ? onlineCfg.allySlots[idx] === 'human'
                        : idx < onlineCfg.allyHumanCount;
                    return `
                        <div class="flex-1 min-w-0 flex items-center gap-1.5 px-2 py-1 rounded border ${isHumanAlly ? 'border-emerald-500/70 bg-emerald-950/40' : 'border-amber-500/60 bg-slate-900/90'}">
                            <div class="w-7 h-7 sm:w-9 sm:h-9 rounded bg-slate-950 border border-slate-700 flex items-center justify-center text-sm shrink-0">${isHumanAlly ? '👤' : '🤖'}</div>
                            <div class="min-w-0 flex-1 text-left leading-tight">
                                <div class="text-[8px] sm:text-[9px] font-pixel ${isHumanAlly ? 'text-emerald-300' : 'text-amber-300'} font-bold truncate">${isHumanAlly ? `味方プレイヤー${idx + 1}` : '味方BOT (CPU)'}</div>
                                <div class="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">${isHumanAlly ? '別プレイヤー自動' : 'CPU自動参戦'}</div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                teamSlotsHtml = [0, 1, 2].map(idx => {
                    const cId = team[idx];
                    const cData = cId ? CHARACTER_DATA[cId] : null;
                    const isFocused = activeSlot === idx;
                    const slotLabel = idx === 0 ? '★1体目(L)' : `${idx + 1}体目`;
                    const slotBorderClass = isFocused
                        ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_8px_rgba(52,211,153,0.45)]'
                        : (cData ? 'border-amber-500/80 bg-slate-900 hover:border-amber-300' : 'border-slate-700 border-dashed bg-slate-950/80 hover:border-slate-500');

                    if (cData) {
                        return `
                            <div onclick="setActiveTeamSlotIndex(${idx}, '${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline})" class="flex-1 min-w-0 flex items-center gap-1.5 px-1.5 py-1 rounded border-2 cursor-pointer transition-all ${slotBorderClass}">
                                <canvas id="team-slot-cvs-${idx}" width="36" height="36" class="w-7 h-7 sm:w-9 sm:h-9 rounded bg-slate-950 border border-slate-700 shrink-0"></canvas>
                                <div class="min-w-0 flex-1 text-left leading-tight">
                                    <div class="text-[8px] sm:text-[9px] font-pixel ${isFocused ? 'text-emerald-300' : 'text-amber-300'} font-bold truncate">${slotLabel}</div>
                                    <div class="text-[10px] sm:text-xs font-bold text-white truncate">${cData.name}</div>
                                </div>
                                <button onclick="event.stopPropagation(); clearNewBattleTeamSlot(${idx}, '${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline})" class="text-[10px] text-slate-400 hover:text-red-400 px-1 font-bold shrink-0" title="外す">✕</button>
                            </div>
                        `;
                    }
                    return `
                        <div onclick="setActiveTeamSlotIndex(${idx}, '${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline})" class="flex-1 min-w-0 flex items-center gap-1.5 px-1.5 py-1 rounded border-2 cursor-pointer transition-all ${slotBorderClass}">
                            <div class="w-7 h-7 sm:w-9 sm:h-9 rounded bg-slate-900 border border-dashed border-slate-600 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">+</div>
                            <div class="min-w-0 flex-1 text-left leading-tight">
                                <div class="text-[8px] sm:text-[9px] font-pixel ${isFocused ? 'text-emerald-300' : 'text-slate-400'} font-bold truncate">${slotLabel}</div>
                                <div class="text-[9px] sm:text-[10px] text-slate-500 font-mono truncate">${isFocused ? '選択中...' : '未選択'}</div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            const headerBackBtn = isOnline ? 'renderOnlineModesScreen()' : 'renderBotModesScreen()';
            const headerBackLabel = isOnline ? '◀ モード選択' : '◀ モード選択';
            const headerTitle = isOnlineMultiSingle
                ? `🌐 オンライン${onlineCfg.totalHumans}人戦 (${onlineCfg.allyHumanCount}vs${onlineCfg.enemyHumanCount}) - 1体選択`
                : (isOnline ? '🌐 オンライン2人戦 (3体操作) - 3体編成' : '✨ 3v3バトルモード - 3体チーム編成');
            const headerSub = isOnlineMultiSingle
                ? `操作する1体を選択せよ！（残り枠は味方BOT:${onlineCfg.allyBotCount}体・敵BOT:${onlineCfg.enemyBotCount}体が自動参戦）`
                : '出陣する味方3体を選択せよ！（カードで詳細・能力調整 / ボタンで編成）';
            const headerCountText = isOnlineMultiSingle
                ? (selectedMultiCharId ? '1/1 体' : '0/1 体')
                : `${selectedCount}/3 体`;
            const headerCountDone = isOnlineMultiSingle ? !!selectedMultiCharId : (selectedCount === 3);

            let html = `
                <div class="w-full h-full flex flex-col items-center justify-between max-w-4xl mx-auto py-1 px-2 overflow-hidden select-none bg-slate-950 text-white">
                    <div class="pixel-box-gold p-1.5 sm:p-2 bg-amber-950/90 w-full text-center space-y-0.5 ${isOnline ? 'border-emerald-500' : 'border-amber-400'} mb-1 flex-shrink-0">
                        <div class="flex items-center justify-between">
                            <button onclick="${headerBackBtn}" class="pixel-btn pixel-btn-danger px-2.5 py-0.5 text-xs font-bold">
                                ${headerBackLabel}
                            </button>
                            <h2 class="text-xs sm:text-base font-bold ${isOnline ? 'text-emerald-300' : 'text-amber-300'} font-pixel truncate px-2">
                                 ${headerTitle}
                            </h2>
                            <div class="text-[10px] font-mono font-bold ${headerCountDone ? 'text-emerald-300' : 'text-amber-300'} shrink-0">
                                ${headerCountText}
                            </div>
                        </div>
                        <p class="text-[9px] sm:text-[11px] ${isOnline ? 'text-emerald-200' : 'text-amber-200'} font-mono">${headerSub}</p>
                    </div>

                    <!-- 味方チーム編成スロット -->
                    <div class="w-full flex items-center gap-1.5 mb-1 px-0.5 flex-shrink-0">
                        <div class="flex-1 flex items-center gap-1.5 min-w-0">
                            ${teamSlotsHtml}
                        </div>
                        ${isOnlineMultiSingle ? '' : `
                        <div class="flex flex-col sm:flex-row gap-1 shrink-0">
                            <button onclick="autoFillNewBattleTeam('${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline})" class="pixel-btn pixel-btn-warning px-2 py-1 text-[10px] font-bold" title="${unlockedCount === 0 ? '所持キャラがいません（ガチャで入手）' : '所持キャラのみから空きスロットを自動編成'}">
                                🎲 おまかせ
                            </button>
                            <button onclick="clearAllNewBattleTeam('${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline})" class="pixel-btn bg-slate-800 border-slate-600 px-2 py-1 text-[10px] font-bold text-slate-300" title="編成をクリア">
                                🗑️
                            </button>
                        </div>
                        `}
                    </div>

                    <div class="flex items-center justify-between w-full mb-1 px-1 gap-2 flex-wrap flex-shrink-0">
                        <div class="flex items-center gap-1.5 text-xs">
                            <span class="text-slate-400 font-bold">並び替え:</span>
                            <select id="new-char-select-sort-order" onchange="onNewCharSelectSortChange('${sortDir}', ${onlyOwned}, ${isOnline})" class="pixel-box bg-slate-900 text-amber-300 px-2 py-1 text-xs outline-none border-amber-600">
                                <option value="default" ${sortOrder === 'default' ? 'selected' : ''}>登録順</option>
                                <option value="hp" ${sortOrder === 'hp' ? 'selected' : ''}>HPが高い順</option>
                                <option value="atk" ${sortOrder === 'atk' ? 'selected' : ''}>攻撃力が高い順</option>
                                <option value="def" ${sortOrder === 'def' ? 'selected' : ''}>防御力が高い順</option>
                                <option value="critRate" ${sortOrder === 'critRate' ? 'selected' : ''}>クリティカル率が高い順</option>
                                <option value="eva" ${sortOrder === 'eva' ? 'selected' : ''}>回避率が高い順</option>
                            </select>
                            <button onclick="toggleNewCharSelectSortDir('${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline})" class="pixel-btn px-2 py-1 text-xs font-bold bg-slate-800 border-slate-600">
                                ${sortDir === 'desc' ? '🔽 降順(高)' : '🔼 昇順(低)'}
                            </button>
                            <button onclick="toggleNewCharSelectOwnedFilter('${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline})" class="pixel-btn px-2 py-1 text-xs font-bold ${onlyOwned ? 'pixel-btn-success border-emerald-400 text-emerald-200' : 'bg-slate-800 border-slate-600 text-slate-300'}">
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
                const slotIdx = isOnlineMultiSingle ? (selectedMultiCharId === c.id ? 0 : -1) : team.indexOf(c.id);
                const isSelected = slotIdx !== -1;

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

                let quickActionBtn = '';
                if (!isUnlocked) {
                    quickActionBtn = `<span class="text-[9px] text-red-400 font-bold mt-1">🔒 未解放</span>`;
                } else if (isOnlineMultiSingle) {
                    quickActionBtn = `<button onclick="event.stopPropagation(); selectOnlineMultiChar('${c.id}', '${sortOrder}', '${sortDir}', ${onlyOwned})" class="pixel-btn ${isSelected ? 'pixel-btn-success' : 'pixel-btn-primary'} w-full py-0.5 px-1 text-[9px] sm:text-[10px] font-bold mt-1">${isSelected ? '✓ 操作キャラ中' : '⚔ この1体を選ぶ'}</button>`;
                } else {
                    quickActionBtn = `<button onclick="event.stopPropagation(); toggleNewBattleTeamChar('${c.id}', '${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline})" class="pixel-btn ${isSelected ? 'pixel-btn-success' : 'pixel-btn-primary'} w-full py-0.5 px-1 text-[9px] sm:text-[10px] font-bold mt-1">${isSelected ? `✓ ${slotIdx + 1}体目 (外す)` : `+ ${activeSlot + 1}体目に編成`}</button>`;
                }

                const badgeText = isOnlineMultiSingle ? 'YOU' : `${slotIdx + 1}体目`;

                html += `
                    <div onclick="openCharDetail('${c.id}', 'new_select', '${sortOrder}', '${sortDir}', ${onlyOwned}, ${isOnline})" 
                         class="pixel-box p-2 sm:p-2.5 bg-slate-900 cursor-pointer flex flex-col items-center justify-between border-2 transition-all relative ${isSelected ? 'border-emerald-400 bg-emerald-950/35 shadow-lg' : 'border-slate-700 hover:border-slate-400'} ${!isUnlocked ? 'opacity-60 grayscale' : ''}">
                        ${isSelected ? `<div class="absolute top-1 left-1 bg-emerald-600 text-white px-1 py-0.5 rounded text-[8px] font-pixel font-bold z-10 shadow">${badgeText}</div>` : ''}
                        <canvas id="new-select-cvs-${c.id}" width="95" height="95" class="pixel-box bg-slate-950 mb-1 w-14 h-14 sm:w-20 sm:h-20"></canvas>
                        <span class="text-[11px] sm:text-xs font-bold ${isSelected ? 'text-emerald-300 font-pixel' : 'text-slate-200'} truncate max-w-full">${c.name}</span>
                        <span class="text-[9px] text-slate-400 truncate max-w-full">${c.title}</span>
                        ${statDisplay}
                        ${quickActionBtn}
                    </div>
                `;
            });

            html += `
                    </div>
                    <div class="flex gap-3 w-full justify-center pb-1 flex-shrink-0">
                        ${isOnlineMultiSingle ? `
                        <button onclick="startSelectedOnlineMultiChar()" class="pixel-btn ${selectedMultiCharId ? 'pixel-btn-success' : 'bg-slate-800 border-slate-600 text-slate-300'} px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-bold font-pixel shadow-lg">
                            ${selectedMultiCharId ? `この1体で出陣！ (${onlineCfg.allyHumanCount}vs${onlineCfg.enemyHumanCount}) ▶` : (unlockedCount === 0 ? '🎰 ガチャを引いてキャラを入手しよう (所持 0体)' : '操作するキャラクターを1体選んでください')}
                        </button>
                        ` : `
                        <button onclick="startSelectedNewBattleTeam(${isOnline})" class="pixel-btn ${unlockedCount < 3 ? 'bg-slate-800 border-red-500/70 text-amber-200' : (selectedCount === 3 ? (isOnline ? 'pixel-btn-success' : 'pixel-btn-primary') : 'bg-slate-800 border-slate-600 text-slate-300')} px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-bold font-pixel shadow-lg">
                            ${unlockedCount === 0 ? '🎰 ガチャを引いてキャラを3体入手しよう (所持 0/3)' : (unlockedCount < 3 ? `🔒 参加には所持キャラ3体以上が必要 (所持 ${unlockedCount}/3体)` : (selectedCount === 3 ? (isOnline ? 'この3体でマッチングへ ▶' : 'この3体で出陣！ ▶') : `あと${3 - selectedCount}体選択してください (${selectedCount}/3)`))}
                        </button>
                        `}
                    </div>
                </div>
            `;

            container.innerHTML = html;

            setTimeout(() => {
                if (isOnlineMultiSingle) {
                    if (selectedMultiCharId) {
                        const slotCvs = document.getElementById('team-slot-cvs-0');
                        if (slotCvs) CharacterRenderer.drawCharacter(slotCvs, selectedMultiCharId);
                    }
                } else {
                    [0, 1, 2].forEach(idx => {
                        const cId = team[idx];
                        if (cId) {
                            const slotCvs = document.getElementById(`team-slot-cvs-${idx}`);
                            if (slotCvs) CharacterRenderer.drawCharacter(slotCvs, cId);
                        }
                    });
                }
                chars.forEach(c => {
                    const cvs = document.getElementById(`new-select-cvs-${c.id}`);
                    if (cvs) CharacterRenderer.drawCharacter(cvs, c.id);
                });
            }, 50);
        }

        function onNewCharSelectSortChange(currentDir, onlyOwned, isOnline = false) {
            const select = document.getElementById('new-char-select-sort-order');
            if (select) {
                renderNewBattleCharSelectScreen(select.value, currentDir, onlyOwned, isOnline);
            }
        }

        function toggleNewCharSelectSortDir(currentOrder, currentDir, onlyOwned, isOnline = false) {
            const newDir = currentDir === 'desc' ? 'asc' : 'desc';
            renderNewBattleCharSelectScreen(currentOrder, newDir, onlyOwned, isOnline);
        }

        function toggleNewCharSelectOwnedFilter(currentOrder, currentDir, onlyOwned, isOnline = false) {
            renderNewBattleCharSelectScreen(currentOrder, currentDir, !onlyOwned, isOnline);
        }
        function renderOnlineModesScreen() {
            audioSystem.playSelect();
            cleanupOnlineLobby();
            window.isOnlineBattleMode = true;
            const container = document.getElementById('screen-container');
            if (!container) return;
            const isConnected = !!(window.fbDb && window.fbAuth && window.fbAuth.currentUser);
            container.innerHTML = `
                <div class="relative w-full h-full flex flex-col justify-between px-2.5 py-1.5 md:px-6 md:py-3 select-none overflow-hidden bg-slate-950 text-white">
                    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
                        <div class="absolute inset-y-0 left-0 flex animate-endless-scroll h-full w-[200%]">
                            <img src="${resolveAssetSrc('images/screen.webp')}" alt="screen" class="w-1/2 h-full object-cover">
                            <img src="${resolveAssetSrc('images/screen.webp')}" alt="screen" class="w-1/2 h-full object-cover">
                        </div>
                    </div>

                    <div class="flex items-center justify-between relative z-10 w-full gap-2 pb-1 shrink-0">
                        <button onclick="renderDopagaKingdomScreen()" class="pixel-btn pixel-btn-danger px-2.5 py-1 text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0">
                            ◀ 王国に戻る
                        </button>
                        <h2 class="text-emerald-400 font-pixel text-xs sm:text-sm md:text-lg font-bold tracking-wider drop-shadow-md truncate text-center">🌐 オンライン対戦 モード選択</h2>
                        <div id="online-server-status-badge" class="text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ${isConnected ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300' : 'bg-amber-950/90 border-amber-500 text-amber-300'}">
                            ${isConnected ? '🟢 サーバー接続OK' : '🔄 サーバー接続中...'}
                        </div>
                    </div>

                    <div class="w-full flex-1 min-h-0 overflow-y-auto flex flex-col relative z-10">
                        <div class="w-full max-w-3xl mx-auto my-auto py-1">
                            <div class="grid grid-cols-1 min-[480px]:grid-cols-2 gap-2.5 sm:gap-3.5 items-stretch">
                                <!-- カード1: フレンドと遊ぶ（ルーム作成） -->
                                <div class="pixel-box bg-slate-900/95 border-2 border-amber-400 p-2.5 sm:p-3 md:p-4 flex flex-col justify-between gap-2 shadow-xl">
                                    <div class="flex flex-col items-center text-center gap-1">
                                        <div class="text-2xl md:text-4xl leading-none">🔑</div>
                                        <h3 class="font-pixel text-xs sm:text-sm md:text-base font-bold text-amber-300 leading-tight">フレンドと遊ぶ（ルーム作成）</h3>
                                        <p class="text-[10px] sm:text-[11px] md:text-xs text-slate-300 font-mono leading-snug">
                                            6桁のルームIDを発行して招待！
                                        </p>
                                    </div>
                                    <button type="button" onclick="createOnlineCodeRoom()" class="pixel-btn pixel-btn-primary w-full py-2 px-3 text-[11px] sm:text-xs md:text-sm font-bold font-pixel shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all whitespace-nowrap">
                                        🏠 フレンド用ルームを作成 ▶
                                    </button>
                                </div>

                                <!-- カード2: ルームIDを入力して参加 -->
                                <div class="pixel-box bg-slate-900/95 border-2 border-sky-400 p-2.5 sm:p-3 md:p-4 flex flex-col justify-between gap-2 shadow-xl">
                                    <div class="flex flex-col items-center text-center gap-1">
                                        <div class="text-2xl md:text-4xl leading-none">🚪</div>
                                        <h3 class="font-pixel text-xs sm:text-sm md:text-base font-bold text-sky-300 leading-tight">ルームIDを入力して参加</h3>
                                        <p class="text-[10px] sm:text-[11px] md:text-xs text-slate-300 font-mono leading-snug">
                                            共有された6桁コードを入力して参加
                                        </p>
                                    </div>

                                    <div class="flex gap-1.5 sm:gap-2 items-center">
                                        <input id="online-room-code-input" type="text" maxlength="6" inputmode="numeric" placeholder="6桁コード" class="pixel-box bg-slate-950 border-sky-500 text-amber-300 font-mono font-bold text-sm sm:text-base text-center tracking-widest px-2 py-1.5 flex-1 min-w-0 outline-none">
                                        <button type="button" onclick="joinOnlineRoomByCode()" class="pixel-btn pixel-btn-warning px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs md:text-sm font-bold font-pixel whitespace-nowrap shrink-0">
                                            参加 ▶
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="w-full flex flex-col items-center gap-1 pt-1 relative z-10 shrink-0">
                        <div id="online-match-status-msg" class="text-[10px] sm:text-xs font-mono text-center text-slate-300 leading-tight min-h-[16px]">
                            「フレンド用ルームを作成」または「ルームIDを入力して参加」を選択してください
                        </div>
                        <button type="button" onclick="fallbackLaunchBotFromMatchmaking('multi')" class="text-[11px] sm:text-xs font-mono text-slate-400 hover:text-amber-300 underline cursor-pointer leading-tight">
                            🤖 すぐにBOT相手に練習バトルを開始する
                        </button>
                    </div>
                </div>
            `;

            if (!isConnected && typeof window.initFirebaseOnline === 'function') {
                window.initFirebaseOnline().then((ok) => {
                    const el = document.getElementById('online-server-status-badge');
                    if (!el) return;
                    if (ok || (window.fbDb && window.fbAuth && window.fbAuth.currentUser)) {
                        el.className = 'text-[10px] font-mono px-2 py-1 rounded border whitespace-nowrap bg-emerald-950/90 border-emerald-500 text-emerald-300';
                        el.innerText = '🟢 サーバー接続OK';
                    } else {
                        el.className = 'text-[10px] font-mono px-2 py-1 rounded border whitespace-nowrap bg-red-950/90 border-red-500 text-red-300';
                        el.innerText = '⚠️ オフライン/再試行';
                    }
                }).catch(() => {});
            }
        }

        function renderOnlineMultiSetupScreen() {
            renderOnlineModesScreen();
        }
        function renderOnlineBattleCharSelectScreen(sortOrder = 'default', sortDir = 'desc', onlyOwned = false) {
            renderNewBattleCharSelectScreen(sortOrder, sortDir, onlyOwned, true);
        }

        function startOnlineBattleMode(playerCharId = 'asaiomizu', enemyCharId = 'asaiomizu', battleOptions = null) {
            window.isOnlineBattleMode = true;
            const cfg = battleOptions || getOnlineBattleConfig();
            startNewBattleMode(playerCharId, enemyCharId, { ...cfg, isOnlineBattleMode: true });
            if (activeNewBattle) {
                activeNewBattle.isOnlineBattleMode = true;
            }
        }

        window.renderOnlineModesScreen = renderOnlineModesScreen;
        window.renderOnlineMultiSetupScreen = renderOnlineMultiSetupScreen;
        window.renderOnlineBattleCharSelectScreen = renderOnlineBattleCharSelectScreen;
        window.startOnlineBattleMode = startOnlineBattleMode;

        window.renderNewCharSelectScreen = renderNewBattleCharSelectScreen;
        window.onNewCharSelectSortChange = onNewCharSelectSortChange;
        window.toggleNewCharSelectSortDir = toggleNewCharSelectSortDir;
        window.toggleNewCharSelectOwnedFilter = toggleNewCharSelectOwnedFilter;

        function executeNewBattleCourtneyCharge() {
            if (!activeNewBattle || !activeNewBattle.isMyTurnOnline()) return;
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

        const BattleNetMonitor = {
            rttMs: null,
            downlinkMbps: null,
            effectiveType: null,
            pingFailed: false,
            _timer: null,
            _pending: false,
            _lastMeasuredAt: 0,
            _listenersBound: false,

            readConnectionApi() {
                const conn = (typeof navigator !== 'undefined')
                    ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection)
                    : null;
                if (conn) {
                    this.downlinkMbps = (typeof conn.downlink === 'number' && conn.downlink > 0) ? conn.downlink : null;
                    this.effectiveType = conn.effectiveType || null;
                    if (this.rttMs === null && typeof conn.rtt === 'number' && conn.rtt > 0) {
                        this.rttMs = Math.round(conn.rtt);
                    }
                } else {
                    this.downlinkMbps = null;
                    this.effectiveType = null;
                }
            },

            bindListeners() {
                if (this._listenersBound || typeof window === 'undefined') return;
                this._listenersBound = true;
                window.addEventListener('online', () => {
                    this.pingFailed = false;
                    this.updateUI();
                    this.measurePing(true);
                });
                window.addEventListener('offline', () => {
                    this.updateUI();
                });
                const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                if (conn && typeof conn.addEventListener === 'function') {
                    conn.addEventListener('change', () => {
                        this.readConnectionApi();
                        this.updateUI();
                        this.measurePing(true);
                    });
                }
            },

            async measurePing(force = false) {
                if (this._pending) return;
                if (!force && this._lastMeasuredAt && (Date.now() - this._lastMeasuredAt < 2500)) return;
                this.readConnectionApi();
                if (typeof navigator !== 'undefined' && navigator.onLine === false) {
                    this.updateUI();
                    return;
                }
                this._pending = true;
                const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
                const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
                const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;
                try {
                    const res = await fetch(`version.json?ping=${Date.now()}`, {
                        method: 'GET',
                        cache: 'no-store',
                        signal: controller ? controller.signal : undefined
                    });
                    if (res && res.ok) {
                        const elapsed = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - start;
                        this.rttMs = Math.max(1, Math.round(elapsed));
                        this.pingFailed = false;
                    } else {
                        this.pingFailed = true;
                    }
                } catch (e) {
                    this.pingFailed = true;
                } finally {
                    if (timeoutId) clearTimeout(timeoutId);
                    this._pending = false;
                    this._lastMeasuredAt = Date.now();
                    this.updateUI();
                }
            },

            getBadgeData() {
                this.readConnectionApi();
                const online = (typeof navigator === 'undefined') ? true : navigator.onLine !== false;
                if (!online) {
                    return {
                        colorClass: 'text-red-400',
                        html: '<span>📵</span><span>切断</span>',
                        title: 'オフライン（ネットワーク未接続）'
                    };
                }
                if (this.pingFailed) {
                    return {
                        colorClass: 'text-red-400',
                        html: '<span>⚠️</span><span>不安定</span>',
                        title: '通信応答なし・タイムアウト'
                    };
                }

                const dl = this.downlinkMbps;
                const rtt = this.rttMs;
                let colorClass = 'text-emerald-400';

                if ((dl !== null && dl < 1.5) || (rtt !== null && rtt >= 350) || this.effectiveType === '2g' || this.effectiveType === 'slow-2g') {
                    colorClass = 'text-red-400';
                } else if ((dl !== null && dl < 5) || (rtt !== null && rtt >= 150) || this.effectiveType === '3g') {
                    colorClass = 'text-amber-300';
                }

                if (dl !== null) {
                    const speedText = dl >= 10 ? `${Math.round(dl)}Mbps` : `${dl.toFixed(1)}Mbps`;
                    const rttSub = rtt !== null ? `<span class="hidden sm:inline text-slate-400 font-normal">(${rtt}ms)</span>` : '';
                    return {
                        colorClass,
                        html: `<span>📶</span><span>${speedText}</span>${rttSub}`,
                        title: `推定回線速度: ${dl.toFixed(1)} Mbps${rtt !== null ? ` / 応答: ${rtt}ms` : ''}`
                    };
                }

                if (rtt !== null) {
                    const tier = rtt < 120 ? '高速' : (rtt < 300 ? '普通' : '低速');
                    return {
                        colorClass,
                        html: `<span>📶</span><span class="hidden sm:inline">${tier}</span><span>${rtt}ms</span>`,
                        title: `通信状態: ${tier}（応答速度: ${rtt}ms）`
                    };
                }

                return {
                    colorClass: 'text-sky-300',
                    html: '<span>📶</span><span>計測中</span>',
                    title: '回線速度を計測中...'
                };
            },

            getBadgeHtml() {
                return this.getBadgeData().html;
            },

            getBadgeColorClass() {
                return this.getBadgeData().colorClass;
            },

            getBadgeTitle() {
                return this.getBadgeData().title;
            },

            updateUI() {
                const el = document.getElementById('new-battle-net-speed');
                if (!el) {
                    if (this._timer) this.stop();
                    return;
                }
                const data = this.getBadgeData();
                el.className = `flex items-center gap-0.5 ${data.colorClass} font-pixel`;
                el.innerHTML = data.html;
                el.title = data.title;
            },

            start() {
                this.bindListeners();
                this.updateUI();
                if (!this._timer) {
                    this._timer = setInterval(() => {
                        if (!document.getElementById('new-battle-net-speed')) {
                            this.stop();
                            return;
                        }
                        this.measurePing();
                    }, 5000);
                }
                if (!this._lastMeasuredAt || (Date.now() - this._lastMeasuredAt > 3000)) {
                    this.measurePing();
                }
            },

            stop() {
                if (this._timer) {
                    clearInterval(this._timer);
                    this._timer = null;
                }
            }
        };
        window.BattleNetMonitor = BattleNetMonitor;

        function startNewBattleMode(playerCharId = null, enemyCharId = 'asaiomizu', battleOptions = null) {
            const opts = battleOptions || {};
            if (!opts.isOnlineSynced) {
                const unlocked = getUnlockedCharIds();
                if (opts.controlSingleAllyOnly) {
                    const singleId = Array.isArray(playerCharId) ? playerCharId[0] : playerCharId;
                    if (!singleId || !unlocked.includes(singleId)) {
                        showGachaRequiredModal('未解放キャラクター', '所持しているキャラクターがいないためバトルに参加できません！\nガチャを引いてキャラクターを入手してください。');
                        return;
                    }
                } else {
                    if (unlocked.length < 3) {
                        showGachaRequiredModal('所持キャラクター不足（参加不可）', `3対3バトルに参加するには、ガチャでキャラクターを3体以上手に入れる必要があります！（現在 ${unlocked.length}/3 体所持）`);
                        return;
                    }
                    const teamArr = Array.isArray(playerCharId) ? playerCharId : [playerCharId];
                    const uniqueOwned = [...new Set(teamArr.filter(id => id && CHARACTER_DATA[id] && unlocked.includes(id)))];
                    if (uniqueOwned.length < 3) {
                        showGachaRequiredModal('未解放キャラクター', '所持しているキャラクターを3体編成しないとバトルに参加できません！');
                        return;
                    }
                    playerCharId = uniqueOwned.slice(0, 3);
                }
            }
            audioSystem.playSelect();
            const leaderCharId = Array.isArray(playerCharId) ? (playerCharId[0] || null) : playerCharId;
            if (leaderCharId) {
                if (typeof saveLastSelectedChar === 'function') {
                    saveLastSelectedChar(leaderCharId);
                } else {
                    window.selectedNewBattleChar = leaderCharId;
                }
            }
            if (Array.isArray(playerCharId) && typeof saveSelectedNewBattleTeam === 'function') {
                saveSelectedNewBattleTeam(playerCharId);
            }
            newBattleViewMode = 'main';
            isNewBattleSkillModalOpen = false;

            if (activeNewBattle) {
                activeNewBattle.battleEnded = true;
                activeNewBattle.stopTimer();
                activeNewBattle.stopElapsedTimer();
                activeNewBattle = null;
            }

            activeNewBattle = new BattleEngine(playerCharId, enemyCharId, false, 1, null, true, battleOptions);

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

        async function returnFromNewBattle() {
            audioSystem.playSelect();
            const existing = document.getElementById('battle-result-overlay');
            if (existing) existing.remove();
            const wasOnline = (window.isOnlineBattleMode || (activeNewBattle && activeNewBattle.isOnlineBattleMode));
            if (activeNewBattle) {
                const shouldNotifyLeave = !!(activeNewBattle.isOnlineSynced && !activeNewBattle.battleEnded);
                activeNewBattle.battleEnded = true;
                if (shouldNotifyLeave) {
                    try {
                        await Promise.race([
                            activeNewBattle.notifyOnlineDeparture('exit', true),
                            new Promise(r => setTimeout(r, 1200))
                        ]);
                    } catch (e) {}
                }
                activeNewBattle.destroy();
                activeNewBattle.stopElapsedTimer();
                activeNewBattle = null;
            }
            if (typeof BattleNetMonitor !== 'undefined') {
                BattleNetMonitor.stop();
            }
            if (typeof cleanupOnlineLobby === 'function') {
                cleanupOnlineLobby();
            }
            if (wasOnline) {
                renderOnlineModesScreen();
            } else {
                renderNewBattleCharSelectScreen();
            }
        }
        window.returnFromNewBattle = returnFromNewBattle;

        function handleNewBattleEnd() {
            if (!activeNewBattle) return;
            const p1 = activeNewBattle.p1;
            const p2 = activeNewBattle.p2;
            const allAlliesDead = (activeNewBattle.isNewBattle && activeNewBattle.allies) ? activeNewBattle.allies.every(a => a.hp <= 0) : (p1.hp <= 0);
            const allEnemiesDead = (activeNewBattle.isNewBattle && activeNewBattle.enemies) ? activeNewBattle.enemies.every(e => e.hp <= 0) : (p2.hp <= 0);
            const isOnline = (window.isOnlineBattleMode || (activeNewBattle && activeNewBattle.isOnlineBattleMode));
            const backBtnLabel = isOnline ? 'オンライン対戦選択へ戻る ▶' : 'バトル選択画面へ戻る ▶';

            setTimeout(() => {
                const existing = document.getElementById('battle-result-overlay');
                if (existing) existing.remove();

                if (allAlliesDead && !allEnemiesDead) {
                    audioSystem.playDefeat();
                    const html = `
                        <div id="battle-result-overlay" class="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4 sm:p-6 text-center opacity-0 transition-opacity duration-1000">
                            <div class="pixel-box-dark p-6 sm:p-8 bg-slate-950/95 border-red-500 shadow-2xl max-w-md w-full flex flex-col items-center">
                                <div class="text-4xl sm:text-6xl font-pixel font-black text-red-500 mb-3 animate-pulse">LOSE</div>
                                <p class="text-xs sm:text-sm text-slate-300 font-mono mb-6">力尽きてしまいました……次こそは勝利を掴ろう！</p>
                                <button onclick="returnFromNewBattle()" class="pixel-btn pixel-btn-primary px-8 py-3 text-sm font-bold font-pixel shadow-xl">
                                    ${backBtnLabel}
                                </button>
                            </div>
                        </div>
                    `;
                    document.body.insertAdjacentHTML('beforeend', html);
                    setTimeout(() => {
                        const overlay = document.getElementById('battle-result-overlay');
                        if (overlay) overlay.classList.remove('opacity-0');
                    }, 50);
                } else if (allEnemiesDead && !allAlliesDead) {
                    audioSystem.playVictory();
                    addDopa(150);
                    const html = `
                        <div id="battle-result-overlay" class="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-cutin">
                            <div class="pixel-box-gold p-6 sm:p-8 bg-amber-950/95 border-amber-400 shadow-2xl max-w-md w-full flex flex-col items-center">
                                <div class="text-4xl sm:text-6xl font-pixel font-black text-amber-300 mb-2 animate-bounce">WIN</div>
                                <p class="text-xs sm:text-sm text-amber-200 font-mono mb-4">お見事！見事に勝利を収めました！<br><b class="text-amber-400">+150 DOPA</b> を獲得！</p>
                                <button onclick="returnFromNewBattle()" class="pixel-btn pixel-btn-primary px-8 py-3 text-sm font-bold font-pixel shadow-xl">
                                    ${backBtnLabel}
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
                                <button onclick="returnFromNewBattle()" class="pixel-btn pixel-btn-primary px-8 py-3 text-sm font-bold font-pixel shadow-xl">
                                    ${backBtnLabel}
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

            const isOnlineBattle = !!(activeNewBattle.isOnlineSynced || activeNewBattle.isOnlineBattleMode);
            if (isOnlineBattle && (action === 'skip' || action === 'switch')) {
                activeNewBattle.waitingForChoice = false;
                activeNewBattle.isRunModalOpen = false;
                renderNewBattleScreen();
                return;
            }

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
                if (!activeNewBattle.waitingForChoice && activeNewBattle.isRunModalOpen) {
                    activeNewBattle.isRunModalOpen = false;
                    if (!activeNewBattle.isProcessing && activeNewBattle.p1 && activeNewBattle.p1.hp > 0) {
                        activeNewBattle.startTimer();
                    }
                    renderNewBattleScreen();
                    return;
                }

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
                activeNewBattle.currentControllingAllyIndex = nextIdx;
                activeNewBattle.controlledAllyIndex = nextIdx;
                activeNewBattle.turnCharIndex = nextIdx;
                activeNewBattle.p1 = activeNewBattle.allies[nextIdx];
                activeNewBattle.waitingForChoice = false;
                activeNewBattle.isRunModalOpen = false;
                activeNewBattle.isProcessing = false;
                activeNewBattle.p1Action = null;
                activeNewBattle.p1TargetIndex = null;
                activeNewBattle.p1TargetChar = null;
                if (activeNewBattle.allies) {
                    activeNewBattle.allyActions = new Array(activeNewBattle.allies.length).fill(null);
                    activeNewBattle.allyTargets = new Array(activeNewBattle.allies.length).fill(null);
                }

                activeNewBattle.log(`🔄 ${activeNewBattle.p1.charName} に操作権が引き継がれた！`, 'text-amber-300 font-bold');
                if (activeNewBattle.onCutin) {
                    activeNewBattle.onCutin('🔄 キャラクター交代！', `${activeNewBattle.p1.charName} が戦闘を引き継ぎます！`);
                }

                audioSystem.playBuff();
                if (activeNewBattle.isNewBattle) {
                    activeNewBattle.advanceNewBattleStep();
                } else {
                    activeNewBattle.startTimer();
                    renderNewBattleScreen();
                }
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
                    if (player.isDarkMode || player.id === 'pasha_dark') return player.dieImage || 'pasha-dark/pasha-darkDIE.webp';
                    if (player.dieImage) return player.dieImage;
                    if (charData.dieImage) return charData.dieImage;
                    if (isA) return 'asaiomizu/asaiomizu3.webp';
                    return player.image || charData.image;
                }

                if (player.isDarkMode || player.id === 'pasha_dark') {
                    return player.allImage || player.image || 'pasha-dark/pasha-darkALL.webp';
                }

                if (isD && (player.dopaChargeCount || 0) >= 6 && player.selectedInheritChar) {
                    const targetData = CHARACTER_DATA[player.selectedInheritChar];
                    if (targetData) return targetData.image || targetData.allImage || player.image;
                }

                const isMomo = player.id === 'momo' || player.id === 'momopin' || player.charName === '桃ピン';
                const isMomoCharging = isMomo && (player.eggplantReady || player.isMiniZou || (activeNewBattle && ((activeNewBattle.p1 === player && activeNewBattle.p1Action === 'momo_prep') || (activeNewBattle.currentAttacker === player && activeNewBattle.p1Action === 'momo_prep'))));

                if (isMomoCharging) {
                    return charData.chargedImage || 'momopin/momopinNASU.webp';
                }

                const isCharged = (isC && (player.courtneyChargeCount || 0) > 0) ||
                                  (isD && (player.dopaChargeCount || 0) > 0);

                if (isCharged && charData.chargedImage) {
                    return charData.chargedImage;
                }

                if (isA) return 'asaiomizu/asaiomizu2.webp';

                return player.allImage || player.image || charData.allImage || charData.image;
            };

            const pImg = getCharImg(p1, true);
            const eImg = getCharImg(p2, false);

            const p1IsCharging = (p1.id === 'courtney' && (p1.courtneyChargeCount || 0) > 0 && p1.hp > 0) || (p1.id === 'dopagaking' && (p1.dopaChargeCount || 0) > 0 && (p1.dopaChargeCount || 0) < 6 && p1.hp > 0);
            const p2IsCharging = (p2.id === 'courtney' && (p2.courtneyChargeCount || 0) > 0 && p2.hp > 0) || (p2.id === 'dopagaking' && (p2.dopaChargeCount || 0) > 0 && (p2.dopaChargeCount || 0) < 6 && p2.hp > 0);

            const isMyTurn = activeNewBattle.isMyTurnOnline();
            const isSpectatingMulti = activeNewBattle.controlSingleAllyOnly && activeNewBattle.allies?.[activeNewBattle.controlledAllyIndex || 0]?.hp <= 0 && !activeNewBattle.battleEnded;

            let actorIndicator = '';
            if (activeNewBattle.isProcessing && activeNewBattle.currentAttacker) {
                const actor = activeNewBattle.currentAttacker;
                const isAlly = activeNewBattle.getCharacterTeam(actor) === 'ally';
                const actorName = (actor.charName || '').replace(/SPパシャ憎・半浸闇化状態|パシャ憎・半浸闇化状態/g, 'パシャ憎・半浸闇化');
                const botCue = (activeNewBattle.controlSingleAllyOnly && actor.roleBadge) ? ` [${actor.roleBadge}]` : '';
                actorIndicator = `
                    <div class="px-1.5 py-0.5 rounded border text-[9px] md:text-[11px] leading-tight font-bold font-pixel animate-pulse shadow whitespace-nowrap truncate max-w-full ${isAlly ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300' : 'bg-red-950/90 border-red-500 text-red-300'}">
                        ⚡ 現在行動中：${isAlly ? '【味方】' : '【敵】'}${botCue} ${actorName}
                    </div>
                `;
            } else if (isMyTurn) {
                const p1Name = (p1.charName || '').replace(/SPパシャ憎・半浸闇化状態|パシャ憎・半浸闇化状態/g, 'パシャ憎・半浸闇化');
                const allyOrderNum = (activeNewBattle.allies ? activeNewBattle.allies.indexOf(p1) + 1 : 1);
                const turnLabel = activeNewBattle.controlSingleAllyOnly
                    ? `🟢 自分のターン (${p1Name})`
                    : `🟢 自分のターン (${allyOrderNum}体目: ${p1Name})`;
                actorIndicator = `
                    <div class="px-1.5 py-0.5 rounded border border-emerald-400 bg-emerald-950/90 text-emerald-300 text-[9px] md:text-[11px] leading-tight font-bold font-pixel animate-pulse shadow whitespace-nowrap truncate max-w-full">
                        ${turnLabel}
                    </div>
                `;
            } else if (isSpectatingMulti) {
                actorIndicator = `
                    <div class="px-1.5 py-0.5 rounded border border-slate-600 bg-slate-900 text-slate-300 text-[9px] md:text-[11px] leading-tight font-bold font-pixel whitespace-nowrap truncate max-w-full">
                        👻 戦闘不能・観戦中
                    </div>
                `;
            } else {
                actorIndicator = `
                    <div class="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-400 text-[9px] md:text-[11px] leading-tight font-bold font-pixel whitespace-nowrap truncate max-w-full">
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
            } else if (isSpectatingMulti) {
                commandAreaContent = `
                    <div class="grid grid-cols-2 gap-1 w-full h-full relative z-20">
                        <div class="col-span-2 text-center text-[10px] font-pixel text-slate-300 flex items-center justify-center">👻 観戦中（復活または味方の決着を待機中）</div>
                        <button onclick="executeNewBattleAction('run')" class="pixel-btn pixel-btn-danger py-1 px-1 text-[11px] font-bold flex items-center justify-center text-center shadow cursor-pointer">
                            <span>🚪 退出</span>
                        </button>
                        <button onclick="executeNewBattleAction('setting')" class="pixel-btn pixel-btn-warning py-1 px-1 text-[11px] font-bold flex items-center justify-center text-center shadow cursor-pointer">
                            <span>⚙️ 設定</span>
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
            const isOnlineBattlePopup = !!(activeNewBattle && (activeNewBattle.isOnlineSynced || activeNewBattle.isOnlineBattleMode));
            if (activeNewBattle && isOnlineBattlePopup && activeNewBattle.waitingForChoice) {
                activeNewBattle.waitingForChoice = false;
            }
            if (activeNewBattle && ((activeNewBattle.waitingForChoice && !isOnlineBattlePopup) || activeNewBattle.isRunModalOpen)) {
                const isRun = activeNewBattle.isRunModalOpen && (!activeNewBattle.waitingForChoice || isOnlineBattlePopup);
                const livingAlliesCount = activeNewBattle.allies ? activeNewBattle.allies.filter(a => a.hp > 0).length : 1;
                const hasOtherAlly = activeNewBattle.allies 
                    ? activeNewBattle.allies.some(a => a.hp > 0 && a !== activeNewBattle.p1) 
                    : false;
                const canSwitch = !isOnlineBattlePopup && (hasOtherAlly || (isRun && livingAlliesCount > 0));

                const titleText = isOnlineBattlePopup
                    ? '🚪 オンライン対戦から退出'
                    : (isRun ? '🏃 戦闘離脱・選択' : '⚠️ 操作キャラクター戦闘不能！');
                const bodyText = isOnlineBattlePopup
                    ? ('現在のオンライン対戦を退出してモード選択へ戻りますか？' + (activeNewBattle && activeNewBattle.roomCode ? `<br><span class="text-amber-300 font-bold">※退出後は自動でBOT操作になり、ルームID「${activeNewBattle.roomCode}」を再入力すると途中復帰できます。</span>` : ''))
                    : (isRun
                        ? '逃げ出しますか？ バトルをスキップして結果を見るか、残っているキャラクターで戦い続けるか選択できます。'
                        : '現在の操作キャラクターが倒れました。<br>どう行動しますか？');

                choicePopupHtml = `
                    <div class="fixed inset-0 bg-black/85 z-[999] flex items-center justify-center p-4 animate-fadeIn">
                        <div class="pixel-box-gold bg-slate-900 border-amber-400 max-w-md w-full p-5 sm:p-6 text-center relative shadow-2xl flex flex-col items-center space-y-4">
                            <div class="text-xl sm:text-2xl font-pixel font-black text-red-500 animate-bounce">${titleText}</div>
                            <p class="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">${bodyText}</p>
                            <div class="flex flex-col gap-3 w-full mt-2">
                                ${isOnlineBattlePopup ? `
                                <button onclick="returnFromNewBattle()" class="pixel-btn pixel-btn-danger py-3 px-4 text-xs sm:text-sm font-bold font-pixel flex items-center justify-center gap-2 shadow-lg cursor-pointer">
                                    <span>🚪 退出してモード選択へ戻る</span>
                                </button>
                                ` : `
                                <button onclick="handleNewBattleContinueChoice('skip')" class="pixel-btn pixel-btn-danger py-3 px-4 text-xs sm:text-sm font-bold font-pixel flex items-center justify-center gap-2 shadow-lg cursor-pointer">
                                    <span>🏁 結果を見る（バトルをスキップ）</span>
                                </button>
                                `}
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
                        <img src="${resolveAssetSrc('images/backnormal.webp')}" alt="backnormal" class="w-full h-full object-cover opacity-80" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='images/backnormal.webp';}">
                    </div>
                    <!-- 1. 상部エリア（タイトル・行動状態・ターン・制限時間） -->
                    ${(() => {
                        const isOnline = (window.isOnlineBattleMode || (activeNewBattle && activeNewBattle.isOnlineBattleMode));
                        let modeLabel = '⚔️ 3v3';
                        if (isOnline && activeNewBattle && activeNewBattle.controlSingleAllyOnly) {
                            modeLabel = `🌐 ${activeNewBattle.allyHumanCount}vs${activeNewBattle.enemyHumanCount} (BOT味${activeNewBattle.allyBotCount}/敵${activeNewBattle.enemyBotCount})`;
                        } else if (isOnline) {
                            modeLabel = `🌐 オンライン2人戦 (3体操作)`;
                        }
                        return `
                    <div class="w-full h-7 md:h-9 flex items-center justify-between gap-1 md:gap-2 px-1.5 md:px-3 bg-slate-900/95 rounded-lg border border-slate-700 shadow-md z-20 shrink-0 overflow-hidden">
                        <div class="flex items-center gap-1 text-[9px] md:text-xs font-pixel ${isOnline ? 'text-emerald-300' : 'text-amber-300'} min-w-0 max-w-[28%] sm:max-w-[33%] shrink">
                            <span class="truncate whitespace-nowrap">${modeLabel}</span>
                        </div>
                        `;
                    })()}
                        <div class="flex items-center justify-center flex-1 min-w-0 overflow-hidden px-1">
                            ${actorIndicator}
                        </div>
                        <div class="flex items-center gap-1 md:gap-2 text-[9px] md:text-xs font-mono shrink-0 whitespace-nowrap">
                            <div id="new-battle-net-speed" class="flex items-center gap-0.5 ${typeof BattleNetMonitor !== 'undefined' ? BattleNetMonitor.getBadgeColorClass() : 'text-sky-300'} font-pixel" title="${typeof BattleNetMonitor !== 'undefined' ? BattleNetMonitor.getBadgeTitle() : '回線速度を計測中...'}">
                                ${typeof BattleNetMonitor !== 'undefined' ? BattleNetMonitor.getBadgeHtml() : '<span>📶</span><span>計測中</span>'}
                            </div>
                            <span class="text-slate-600">|</span>
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
                                         : '';
                                     const isCurrentActor = currentActor === c;
                                     const isCurrentControlling = isMyTurn && p1 === c;

                                     let allyRoleBadgeHtml = '';
                                     if (activeNewBattle.controlSingleAllyOnly) {
                                         if (origIdx === (activeNewBattle.controlledAllyIndex || 0)) {
                                             allyRoleBadgeHtml = '<div class="absolute bottom-0 right-0 bg-emerald-600 text-white px-1 py-0.5 rounded text-[7px] font-pixel shadow">YOU</div>';
                                         } else if (c.isBot) {
                                             allyRoleBadgeHtml = '<div class="absolute bottom-0 right-0 bg-amber-700 text-amber-100 px-1 py-0.5 rounded text-[7px] font-pixel shadow">🤖 BOT</div>';
                                         } else {
                                             allyRoleBadgeHtml = `<div class="absolute bottom-0 right-0 bg-sky-600 text-white px-1 py-0.5 rounded text-[7px] font-pixel shadow">${c.roleBadge || `味方P${origIdx + 1}`}</div>`;
                                         }
                                     } else if (isLeader) {
                                         allyRoleBadgeHtml = '<div class="absolute bottom-0 right-0 bg-emerald-600 text-white px-1 py-0.5 rounded text-[7px] font-pixel shadow">LEADER</div>';
                                     }

                                     let posClasses = 'flex flex-col items-center justify-end relative transition-all duration-300 ';
                                     if (posType === 'center') {
                                         posClasses += 'w-[36%] h-[82%] z-30 scale-105 translate-y-3';
                                      } else {
                                          posClasses += 'w-[30%] h-[72%] z-25 opacity-95 -translate-y-6';
                                      }

                                     const interactiveStyle = isSelectable ? 'cursor-pointer ring-4 ring-amber-400 bg-amber-950/40 rounded-xl' : (isCurrentControlling ? 'ring-2 ring-emerald-400/80 rounded-xl brightness-110' : 'hover:brightness-110');
                                     const deadStyle = c.hp <= 0 ? 'opacity-40 grayscale' : '';
                                     const hpBarPosClass = 'battle-char-status-bar absolute -top-6 left-1/2 -translate-x-1/2 w-[95%] min-w-[65px] z-40 flex flex-col items-center bg-black/85 backdrop-blur-md px-1 py-0.5 rounded border border-white/20 shadow-lg cursor-pointer hover:border-amber-400 hover:brightness-110 active:scale-95 transition-all select-none';

                                     return `
                                         <div id="ally-char-${origIdx}" ${cardClickAttr} data-char-team="ally" data-char-idx="${origIdx}" class="${posClasses} ${interactiveStyle} ${deadStyle}" >
                                            ${(isCurrentActor || isCurrentControlling) ? `<div class="absolute -top-12 left-1/2 -translate-x-1/2 ${isCurrentControlling && !isCurrentActor ? 'text-emerald-400' : 'text-amber-400'} font-bold text-sm animate-arrow-float z-50 drop-shadow-md">▼</div>` : ''}
                                            
                                             <!-- 頭上のステータスUI -->
                                             <div data-char-bar="true" data-bar-team="ally" data-bar-idx="${origIdx}" onclick="event.stopPropagation(); if(typeof toggleBattleCharTooltip === 'function') toggleBattleCharTooltip('ally', ${origIdx}, event);" class="${hpBarPosClass}" title="タップして詳細を表示">
                                                 <div class="flex justify-between items-center w-full text-[8px] sm:text-[9px] font-bold text-emerald-300 px-0.5">
                                                     <span class="truncate">${c.charName}</span>
                                                     <span class="font-mono">${c.hp}/${c.maxHp}</span>
                                                 </div>
                                                 <div class="w-full bg-slate-900 h-1 rounded-full overflow-hidden my-0.5 border border-white/20">
                                                     <div class="bg-emerald-400 h-full hp-bar-fill shadow-[0_0_4px_rgba(52,211,153,0.8)]" style="width: ${pct}%;"></div>
                                                 </div>
                                             </div>

                                             <!-- 全身スプライト -->
                                             ${(() => {
                                                 const isShakingNow = !!(c.isShaking && (!c._shakeUntil || Date.now() < c._shakeUntil));
                                                 const elapsedShake = (isShakingNow && c._shakeStartedAt) ? Math.max(0, Math.min(340, Date.now() - c._shakeStartedAt)) : 0;
                                                 const shakeStyleAttr = (isShakingNow && elapsedShake > 16) ? `style="animation-delay: -${elapsedShake}ms;"` : '';
                                                 return `<div id="ally-shake-${origIdx}" ${shakeStyleAttr} class="w-full flex-1 flex items-center justify-center relative drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] ${isShakingNow ? 'char-shake' : ''}">`;
                                             })()}
                                               <img src="${resolveAssetSrc(img)}" alt="${c.charName}" class="w-full h-full object-contain pointer-events-none" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='${img}';}else if(this.dataset.fb==='1'){this.dataset.fb='2';this.src=resolveAssetSrc('${(CHARACTER_DATA[c.id]?.allImage) || (CHARACTER_DATA[c.id]?.image) || 'momopin/momopin.webp'}');}">
                                               ${allyRoleBadgeHtml}
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
                                     const isSelectable = isTargetSelecting && (newBattleTargetSelectType === 'single_enemy' || newBattleTargetSelectSkillId === 'asaiomizu_copied' || newBattleTargetSelectSkillId === 'dopa_obey_copy' || newBattleTargetSelectSkillId === 'pasha_flash') && c.hp > 0;
                                     const cardClickAttr = isSelectable 
                                         ? `onclick="selectNewBattleTarget(${origIdx}, false)" style="cursor: pointer;"` 
                                         : '';
                                     const isCurrentActor = currentActor === c;
                                     const flipStyle = 'transform: scaleX(-1);';

                                     let enemyRoleBadgeHtml = '';
                                     if (activeNewBattle.controlSingleAllyOnly) {
                                         if (c.isBot) {
                                             enemyRoleBadgeHtml = '<div class="absolute bottom-0 left-0 bg-amber-700 text-amber-100 px-1 py-0.5 rounded text-[7px] font-pixel shadow">🤖 BOT</div>';
                                         } else {
                                             enemyRoleBadgeHtml = `<div class="absolute bottom-0 left-0 bg-red-600 text-white px-1 py-0.5 rounded text-[7px] font-pixel shadow">${c.roleBadge || `敵P${origIdx + 1}`}</div>`;
                                         }
                                     } else if (isLeader) {
                                         enemyRoleBadgeHtml = '<div class="absolute bottom-0 left-0 bg-red-600 text-white px-1 py-0.5 rounded text-[7px] font-pixel shadow">BOSS</div>';
                                     }

                                     let posClasses = 'flex flex-col items-center justify-end relative transition-all duration-300 ';
                                     if (posType === 'center') {
                                         posClasses += 'w-[36%] h-[82%] z-30 scale-105 translate-y-3';
                                      } else {
                                          posClasses += 'w-[30%] h-[72%] z-25 opacity-95 -translate-y-6';
                                      }

                                     const interactiveStyle = isSelectable ? 'cursor-pointer ring-4 ring-amber-400 bg-amber-950/40 rounded-xl' : 'hover:brightness-110';
                                     const deadStyle = c.hp <= 0 ? 'opacity-40 grayscale' : '';
                                     const hpBarPosClass = 'battle-char-status-bar absolute -top-6 left-1/2 -translate-x-1/2 w-[95%] min-w-[65px] z-40 flex flex-col items-center bg-black/85 backdrop-blur-md px-1 py-0.5 rounded border border-white/20 shadow-lg cursor-pointer hover:border-amber-400 hover:brightness-110 active:scale-95 transition-all select-none';

                                     return `
                                         <div id="enemy-char-${origIdx}" ${cardClickAttr} data-char-team="enemy" data-char-idx="${origIdx}" class="${posClasses} ${interactiveStyle} ${deadStyle}" >
                                           ${isCurrentActor ? '<div class="absolute -top-12 left-1/2 -translate-x-1/2 text-amber-400 font-bold text-sm animate-arrow-float z-50 drop-shadow-md">▼</div>' : ''}
                                           
                                             <!-- 頭上のステータスUI -->
                                             <div data-char-bar="true" data-bar-team="enemy" data-bar-idx="${origIdx}" onclick="event.stopPropagation(); if(typeof toggleBattleCharTooltip === 'function') toggleBattleCharTooltip('enemy', ${origIdx}, event);" class="${hpBarPosClass}" title="タップして詳細を表示">
                                                 <div class="flex justify-between items-center w-full text-[8px] sm:text-[9px] font-bold text-red-300 px-0.5">
                                                     <span class="truncate">${c.charName}</span>
                                                     <span class="font-mono">${c.hp}/${c.maxHp}</span>
                                                 </div>
                                                 <div class="w-full bg-slate-900 h-1 rounded-full overflow-hidden my-0.5 border border-white/20">
                                                     <div class="bg-red-500 h-full hp-bar-fill shadow-[0_0_4px_rgba(239,68,68,0.8)]" style="width: ${pct}%;"></div>
                                                 </div>
                                             </div>

                                           <!-- 全身スプライト -->
                                           ${(() => {
                                               const isShakingNow = !!(c.isShaking && (!c._shakeUntil || Date.now() < c._shakeUntil));
                                               const elapsedShake = (isShakingNow && c._shakeStartedAt) ? Math.max(0, Math.min(340, Date.now() - c._shakeStartedAt)) : 0;
                                               const shakeStyleAttr = (isShakingNow && elapsedShake > 16) ? `style="animation-delay: -${elapsedShake}ms;"` : '';
                                               return `<div id="enemy-shake-${origIdx}" ${shakeStyleAttr} class="w-full flex-1 flex items-center justify-center relative drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] ${isShakingNow ? 'char-shake' : ''}">`;
                                           })()}
                                               <img src="${resolveAssetSrc(img)}" alt="${c.charName}" class="w-full h-full object-contain" style="${flipStyle}" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='${img}';}else if(this.dataset.fb==='1'){this.dataset.fb='2';this.src=resolveAssetSrc('${(CHARACTER_DATA[c.id]?.image) || 'asaiomizu/asaiomizu.webp'}');}">
                                               ${enemyRoleBadgeHtml}
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

            const logEl = document.getElementById('new-battle-log');
            if (logEl) {
                logEl.scrollTop = logEl.scrollHeight;
            }

            if (typeof BattleNetMonitor !== 'undefined') {
                BattleNetMonitor.start();
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
            if (p.eggplantReady || ((p.id === 'momo' || p.id === 'momopin') && p.isMiniZou)) {
                badges += `<span class="bg-purple-950/95 text-purple-300 border-2 border-purple-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform -rotate-3 inline-block animate-pulse">🍆 ナス準備中</span>`;
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
            if (!activeNewBattle || !activeNewBattle.isMyTurnOnline()) return;
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
                const opponents = activeNewBattle.enemies.filter(e => e.hp > 0);
                if (opponents.length === 0) {
                    showModal("エラー", "対象となる相手がいません！");
                    return;
                }
                const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
                activeNewBattle.p1.selectedObeyEnemy = randomOpponent;
                activeNewBattle.p1.selectedInheritChar = randomOpponent.id;
                openDopaObeyModal(activeNewBattle.p1, randomOpponent);
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
            if (actionType === 'momo_prep' && activeNewBattle.p1 && (activeNewBattle.p1.id === 'momo' || activeNewBattle.p1.id === 'momopin')) {
                activeNewBattle.p1.isMiniZou = true;
            }
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
            if (typeof BattleNetMonitor !== 'undefined') BattleNetMonitor.updateUI();
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
            if (typeof window.initFirebaseOnline === 'function') {
                window.initFirebaseOnline().catch(() => {});
            }
            renderOnlineModesScreen();
        }

        function openStoreModal() {
            audioSystem.playSelect();
            showModal("🛒 ストア", "DOPAストア機能は現在準備中です。\nガチャや毎日のボーナスでDOPAを集めてお待ちください！");
        }

        window._friendState = window._friendState || {
            activeTab: 'list', // 'list' | 'incoming' | 'outgoing'
            loading: false,
            statusMsg: '',
            statusColor: 'text-slate-300',
            lastSyncedProfileSig: '',
            box: {
                friends: {},
                incomingRequests: {},
                outgoingRequests: {},
                roomInvites: {}
            }
        };

        function escapeFriendHtml(str) {
            return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

        function normalizeFriendPlayerId(raw) {
            const clean = String(raw || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
            if (!clean) return '';
            if (/^\d{4}$/.test(clean)) return 'DP-' + clean;
            if (/^DP\d{4}$/.test(clean)) return 'DP-' + clean.slice(2);
            return clean;
        }

        function getFriendBoxStorageKey(myId) {
            return 'dopa_friend_box_cache_' + (myId || 'DP-LOCAL');
        }

        function loadLocalFriendBoxCache() {
            const myId = playerState.playerId || 'DP-1004';
            try {
                const raw = localStorage.getItem(getFriendBoxStorageKey(myId));
                if (raw) {
                    const parsed = JSON.parse(raw);
                    window._friendState.box = {
                        friends: parsed.friends || {},
                        incomingRequests: parsed.incomingRequests || {},
                        outgoingRequests: parsed.outgoingRequests || {},
                        roomInvites: parsed.roomInvites || {}
                    };
                }
            } catch (e) {}
        }

        function saveLocalFriendBoxCache() {
            const myId = playerState.playerId || 'DP-1004';
            try {
                localStorage.setItem(getFriendBoxStorageKey(myId), JSON.stringify(window._friendState.box));
            } catch (e) {}
        }

        function setFriendActionStatus(msg, colorClass = 'text-amber-300') {
            window._friendState.statusMsg = msg;
            window._friendState.statusColor = colorClass;
            const el = document.getElementById('friend-action-status');
            if (el) {
                el.className = `text-[10px] font-mono min-h-[14px] ${colorClass}`;
                el.innerText = msg;
            }
        }

        async function syncMyPublicFriendProfile(force = false) {
            const myId = playerState.playerId;
            if (!myId || !window.fbDb || !window.fbDoc || !window.fbSetDoc) return;
            const payload = {
                playerId: myId,
                playerName: playerState.playerName || '名無しファイター',
                selectedIcon: playerState.selectedIcon || 'dopagaking',
                totalBattles: playerState.totalBattles || 0,
                wins: playerState.wins || 0,
                losses: playerState.losses || 0,
                startDate: playerState.startDate || '2026/10/14',
                updatedAt: Date.now()
            };
            const sig = JSON.stringify([payload.playerId, payload.playerName, payload.selectedIcon, payload.totalBattles, payload.wins, payload.losses]);
            if (!force && window._friendState.lastSyncedProfileSig === sig) return;
            try {
                const playerRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'players', myId);
                await window.fbSetDoc(playerRef, payload, { merge: true });
                window._friendState.lastSyncedProfileSig = sig;
            } catch (e) {
                console.warn('Sync friend public profile failed:', e);
            }
        }

        async function fetchMyFriendBoxFromServer(showLoadingStatus = false) {
            const myId = playerState.playerId;
            if (!myId) return;
            if (showLoadingStatus) {
                window._friendState.loading = true;
                renderFriendScreenContent();
            }
            const ok = await window.initFirebaseOnline();
            if (!ok || !window.fbDb || !window.fbDoc || !window.fbGetDoc) {
                window._friendState.loading = false;
                if (showLoadingStatus) {
                    setFriendActionStatus('⚠️ オンラインサーバーに接続できませんでした。', 'text-red-400');
                }
                renderFriendScreenContent();
                return;
            }
            await syncMyPublicFriendProfile(false);
            try {
                const boxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', myId);
                const snap = await window.fbGetDoc(boxRef);
                if (snap.exists()) {
                    const data = snap.data() || {};
                    window._friendState.box = {
                        friends: data.friends || {},
                        incomingRequests: data.incomingRequests || {},
                        outgoingRequests: data.outgoingRequests || {},
                        roomInvites: data.roomInvites || {}
                    };
                    saveLocalFriendBoxCache();
                }
                window._friendState.loading = false;
                if (showLoadingStatus) {
                    window._friendState.statusMsg = '✓ 最新のフレンド情報を取得しました';
                    window._friendState.statusColor = 'text-emerald-300';
                }
                renderFriendScreenContent();
            } catch (e) {
                console.warn('Fetch friend box failed:', e);
                window._friendState.loading = false;
                window._friendState.statusMsg = '⚠️ フレンド情報の取得に失敗しました';
                window._friendState.statusColor = 'text-red-400';
                renderFriendScreenContent();
            }
        }

        function setFriendScreenTab(tab) {
            audioSystem.playSelect();
            window._friendState.activeTab = tab;
            renderFriendScreenContent();
        }

        function refreshFriendScreenData() {
            audioSystem.playSelect();
            fetchMyFriendBoxFromServer(true);
        }

        async function shareMyFriendId() {
            audioSystem.playSelect();
            const myId = playerState.playerId || 'DP-1004';
            const myName = playerState.playerName || '名無しファイター';
            const shareText = `【ドパキン】フレンドになろう！\nプレイヤー名: ${myName}\nフレンドID: ${myId}\nホーム画面の「フレンド」からIDを入力して申請してね！`;
            if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
                try {
                    await navigator.share({
                        title: 'ドパキン フレンド招待',
                        text: shareText
                    });
                    setFriendActionStatus('✓ フレンドIDを共有しました！', 'text-emerald-300');
                    return;
                } catch (err) {
                    if (err && err.name === 'AbortError') return;
                }
            }
            copyTextSilently(shareText).then(() => {
                setFriendActionStatus('✓ 紹介テキストをコピーしました！', 'text-emerald-300');
            });
            const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(shareText)}`;
            const safeEscapedText = escapeFriendHtml(shareText);
            showModal('📤 フレンドIDを共有', `
                <div class="space-y-3 text-center">
                    <div class="text-xs text-slate-300 font-mono">下のメッセージをLINEやSNSで送れます（コピー済み）</div>
                    <textarea readonly rows="3" class="pixel-box bg-slate-950 border-purple-500 text-amber-200 text-xs font-mono w-full p-2 outline-none resize-none">${safeEscapedText}</textarea>
                    <div class="flex flex-wrap justify-center gap-2">
                        <a href="${lineUrl}" target="_blank" rel="noopener noreferrer" class="pixel-btn pixel-btn-success px-4 py-2 text-xs font-bold font-pixel inline-flex items-center gap-1.5 no-underline">
                            💬 LINEで送る
                        </a>
                        <button type="button" onclick="copyMyFriendInviteText()" class="pixel-btn pixel-btn-primary px-4 py-2 text-xs font-bold font-pixel">
                            📋 文章コピー
                        </button>
                    </div>
                </div>
            `);
        }

        function copyMyFriendInviteText() {
            audioSystem.playSelect();
            const myId = playerState.playerId || 'DP-1004';
            const myName = playerState.playerName || '名無しファイター';
            const shareText = `【ドパキン】フレンドになろう！\nプレイヤー名: ${myName}\nフレンドID: ${myId}\nホーム画面の「フレンド」からIDを入力して申請してね！`;
            copyTextSilently(shareText).then(() => {
                setFriendActionStatus('✓ 紹介テキストをコピーしました！', 'text-emerald-300');
                showToast('招待文をコピーしました！');
            });
        }

        async function sendFriendRequestById() {
            audioSystem.playSelect();
            const inputEl = document.getElementById('friend-search-id-input');
            const rawVal = inputEl ? inputEl.value : '';
            const targetId = normalizeFriendPlayerId(rawVal);
            const myId = playerState.playerId || 'DP-1004';
            if (!targetId) {
                setFriendActionStatus('⚠️ プレイヤーID（例: DP-1234）を入力してください', 'text-red-400');
                return;
            }
            if (targetId === myId) {
                setFriendActionStatus('⚠️ 自分自身のIDには申請できません', 'text-red-400');
                return;
            }
            const box = window._friendState.box;
            if (box.friends && box.friends[targetId]) {
                setFriendActionStatus(`⚠️ ${targetId} とはすでにフレンドです`, 'text-amber-300');
                return;
            }
            if (box.outgoingRequests && box.outgoingRequests[targetId]) {
                setFriendActionStatus(`⚠️ ${targetId} にはすでに申請済みです`, 'text-amber-300');
                return;
            }
            setFriendActionStatus(`🔍 ${targetId} を検索中...`, 'text-sky-300');

            const ok = await window.initFirebaseOnline();
            if (!ok || !window.fbDb || !window.fbDoc || !window.fbGetDoc || !window.fbSetDoc) {
                setFriendActionStatus('⚠️ サーバーに接続できませんでした', 'text-red-400');
                return;
            }
            await syncMyPublicFriendProfile(false);

            try {
                const targetPlayerRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'players', targetId);
                const targetSnap = await window.fbGetDoc(targetPlayerRef);
                if (!targetSnap.exists()) {
                    setFriendActionStatus(`⚠️ ID「${targetId}」が見つかりません（相手が一度フレンド画面を開くと登録されます）`, 'text-red-400');
                    return;
                }
                const tp = targetSnap.data() || {};
                const targetName = tp.playerName || '名無しファイター';
                const targetIcon = tp.selectedIcon || 'dopagaking';
                const now = Date.now();

                // If they already sent us a request, accept mutually immediately!
                if (box.incomingRequests && box.incomingRequests[targetId]) {
                    await acceptFriendRequest(targetId);
                    if (inputEl) inputEl.value = '';
                    return;
                }

                const myBoxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', myId);
                const targetBoxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', targetId);

                const outgoingEntry = {
                    playerId: targetId,
                    playerName: targetName,
                    selectedIcon: targetIcon,
                    requestedAt: now
                };
                const incomingEntry = {
                    playerId: myId,
                    playerName: playerState.playerName || '名無しファイター',
                    selectedIcon: playerState.selectedIcon || 'dopagaking',
                    requestedAt: now
                };

                await Promise.all([
                    window.fbSetDoc(myBoxRef, { outgoingRequests: { [targetId]: outgoingEntry }, updatedAt: now }, { merge: true }),
                    window.fbSetDoc(targetBoxRef, { incomingRequests: { [myId]: incomingEntry }, updatedAt: now }, { merge: true })
                ]);

                window._friendState.box.outgoingRequests = { ...(window._friendState.box.outgoingRequests || {}), [targetId]: outgoingEntry };
                saveLocalFriendBoxCache();
                if (inputEl) inputEl.value = '';
                window._friendState.statusMsg = `✓ ${targetName}（${targetId}）にフレンド申請を送りました！`;
                window._friendState.statusColor = 'text-emerald-300';
                renderFriendScreenContent();
            } catch (err) {
                console.warn('Send friend request error:', err);
                setFriendActionStatus('⚠️ フレンド申請の送信に失敗しました', 'text-red-400');
            }
        }

        async function acceptFriendRequest(fromId) {
            audioSystem.playSelect();
            const myId = playerState.playerId || 'DP-1004';
            if (!fromId || !window.fbDb || !window.fbRunTransaction) return;
            setFriendActionStatus('⏳ 承認処理中...', 'text-sky-300');
            try {
                const now = Date.now();
                const myBoxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', myId);
                const fromBoxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', fromId);
                const reqData = (window._friendState.box.incomingRequests && window._friendState.box.incomingRequests[fromId]) || {
                    playerId: fromId,
                    playerName: fromId,
                    selectedIcon: 'dopagaking'
                };

                await window.fbRunTransaction(window.fbDb, async (tx) => {
                    const mySnap = await tx.get(myBoxRef);
                    const fromSnap = await tx.get(fromBoxRef);
                    const myBox = mySnap.exists() ? { ...(mySnap.data() || {}) } : {};
                    const fromBox = fromSnap.exists() ? { ...(fromSnap.data() || {}) } : {};

                    const myFriends = { ...(myBox.friends || {}) };
                    const myIncoming = { ...(myBox.incomingRequests || {}) };
                    const myOutgoing = { ...(myBox.outgoingRequests || {}) };
                    const incEntry = myIncoming[fromId] || reqData;
                    myFriends[fromId] = {
                        playerId: fromId,
                        playerName: incEntry.playerName || reqData.playerName || fromId,
                        selectedIcon: incEntry.selectedIcon || reqData.selectedIcon || 'dopagaking',
                        addedAt: now
                    };
                    delete myIncoming[fromId];
                    delete myOutgoing[fromId];

                    const fromFriends = { ...(fromBox.friends || {}) };
                    const fromIncoming = { ...(fromBox.incomingRequests || {}) };
                    const fromOutgoing = { ...(fromBox.outgoingRequests || {}) };
                    fromFriends[myId] = {
                        playerId: myId,
                        playerName: playerState.playerName || '名無しファイター',
                        selectedIcon: playerState.selectedIcon || 'dopagaking',
                        addedAt: now
                    };
                    delete fromIncoming[myId];
                    delete fromOutgoing[myId];

                    tx.set(myBoxRef, {
                        friends: myFriends,
                        incomingRequests: myIncoming,
                        outgoingRequests: myOutgoing,
                        roomInvites: myBox.roomInvites || {},
                        updatedAt: now
                    });
                    tx.set(fromBoxRef, {
                        friends: fromFriends,
                        incomingRequests: fromIncoming,
                        outgoingRequests: fromOutgoing,
                        roomInvites: fromBox.roomInvites || {},
                        updatedAt: now
                    });
                });

                const box = window._friendState.box;
                const friends = { ...(box.friends || {}) };
                const incoming = { ...(box.incomingRequests || {}) };
                const outgoing = { ...(box.outgoingRequests || {}) };
                friends[fromId] = {
                    playerId: fromId,
                    playerName: reqData.playerName || fromId,
                    selectedIcon: reqData.selectedIcon || 'dopagaking',
                    addedAt: now
                };
                delete incoming[fromId];
                delete outgoing[fromId];
                window._friendState.box = { ...box, friends, incomingRequests: incoming, outgoingRequests: outgoing };
                saveLocalFriendBoxCache();
                window._friendState.statusMsg = `✓ ${reqData.playerName || fromId}とフレンドになりました！`;
                window._friendState.statusColor = 'text-emerald-300';
                window._friendState.activeTab = 'list';
                renderFriendScreenContent();
            } catch (err) {
                console.warn('Accept friend error:', err);
                setFriendActionStatus('⚠️ 承認に失敗しました', 'text-red-400');
            }
        }

        async function rejectFriendRequest(fromId) {
            audioSystem.playSelect();
            const myId = playerState.playerId || 'DP-1004';
            if (!fromId || !window.fbDb || !window.fbRunTransaction) return;
            try {
                const now = Date.now();
                const myBoxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', myId);
                const fromBoxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', fromId);
                await window.fbRunTransaction(window.fbDb, async (tx) => {
                    const mySnap = await tx.get(myBoxRef);
                    const fromSnap = await tx.get(fromBoxRef);
                    if (mySnap.exists()) {
                        const myBox = { ...(mySnap.data() || {}) };
                        const myIncoming = { ...(myBox.incomingRequests || {}) };
                        delete myIncoming[fromId];
                        tx.set(myBoxRef, { ...myBox, incomingRequests: myIncoming, updatedAt: now });
                    }
                    if (fromSnap.exists()) {
                        const fromBox = { ...(fromSnap.data() || {}) };
                        const fromOutgoing = { ...(fromBox.outgoingRequests || {}) };
                        delete fromOutgoing[myId];
                        tx.set(fromBoxRef, { ...fromBox, outgoingRequests: fromOutgoing, updatedAt: now });
                    }
                });
                const incoming = { ...(window._friendState.box.incomingRequests || {}) };
                delete incoming[fromId];
                window._friendState.box.incomingRequests = incoming;
                saveLocalFriendBoxCache();
                window._friendState.statusMsg = '申請を拒否しました';
                window._friendState.statusColor = 'text-slate-300';
                renderFriendScreenContent();
            } catch (err) {
                console.warn('Reject friend error:', err);
                setFriendActionStatus('⚠️ 操作に失敗しました', 'text-red-400');
            }
        }

        async function cancelOutgoingFriendRequest(toId) {
            audioSystem.playSelect();
            const myId = playerState.playerId || 'DP-1004';
            if (!toId || !window.fbDb || !window.fbRunTransaction) return;
            try {
                const now = Date.now();
                const myBoxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', myId);
                const toBoxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', toId);
                await window.fbRunTransaction(window.fbDb, async (tx) => {
                    const mySnap = await tx.get(myBoxRef);
                    const toSnap = await tx.get(toBoxRef);
                    if (mySnap.exists()) {
                        const myBox = { ...(mySnap.data() || {}) };
                        const myOutgoing = { ...(myBox.outgoingRequests || {}) };
                        delete myOutgoing[toId];
                        tx.set(myBoxRef, { ...myBox, outgoingRequests: myOutgoing, updatedAt: now });
                    }
                    if (toSnap.exists()) {
                        const toBox = { ...(toSnap.data() || {}) };
                        const toIncoming = { ...(toBox.incomingRequests || {}) };
                        delete toIncoming[myId];
                        tx.set(toBoxRef, { ...toBox, incomingRequests: toIncoming, updatedAt: now });
                    }
                });
                const outgoing = { ...(window._friendState.box.outgoingRequests || {}) };
                delete outgoing[toId];
                window._friendState.box.outgoingRequests = outgoing;
                saveLocalFriendBoxCache();
                window._friendState.statusMsg = 'フレンド申請を取り消しました';
                window._friendState.statusColor = 'text-slate-300';
                renderFriendScreenContent();
            } catch (err) {
                console.warn('Cancel outgoing error:', err);
                setFriendActionStatus('⚠️ 取り消しに失敗しました', 'text-red-400');
            }
        }

        function confirmRemoveFriend(friendId, friendName) {
            audioSystem.playSelect();
            showConfirmModal('フレンド解除', `「${friendName || friendId}」をフレンドから削除しますか？`, () => {
                removeFriendById(friendId);
            }, '削除する');
        }

        async function removeFriendById(friendId) {
            const myId = playerState.playerId || 'DP-1004';
            if (!friendId || !window.fbDb || !window.fbRunTransaction) return;
            try {
                const now = Date.now();
                const myBoxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', myId);
                const otherBoxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', friendId);
                await window.fbRunTransaction(window.fbDb, async (tx) => {
                    const mySnap = await tx.get(myBoxRef);
                    const otherSnap = await tx.get(otherBoxRef);
                    if (mySnap.exists()) {
                        const myBox = { ...(mySnap.data() || {}) };
                        const myFriends = { ...(myBox.friends || {}) };
                        delete myFriends[friendId];
                        tx.set(myBoxRef, { ...myBox, friends: myFriends, updatedAt: now });
                    }
                    if (otherSnap.exists()) {
                        const otherBox = { ...(otherSnap.data() || {}) };
                        const otherFriends = { ...(otherBox.friends || {}) };
                        delete otherFriends[myId];
                        tx.set(otherBoxRef, { ...otherBox, friends: otherFriends, updatedAt: now });
                    }
                });
                const friends = { ...(window._friendState.box.friends || {}) };
                delete friends[friendId];
                window._friendState.box.friends = friends;
                saveLocalFriendBoxCache();
                window._friendState.statusMsg = 'フレンドを削除しました';
                window._friendState.statusColor = 'text-slate-300';
                renderFriendScreenContent();
            } catch (err) {
                console.warn('Remove friend error:', err);
                setFriendActionStatus('⚠️ フレンド削除に失敗しました', 'text-red-400');
            }
        }

        async function openFriendDetailModal(friendId) {
            audioSystem.playSelect();
            const cached = (window._friendState.box.friends && window._friendState.box.friends[friendId]) || {
                playerId: friendId,
                playerName: friendId,
                selectedIcon: 'dopagaking'
            };
            let info = { ...cached, totalBattles: '-', wins: '-', losses: '-', winRate: '-', startDate: '-' };
            if (window.fbDb && window.fbDoc && window.fbGetDoc) {
                try {
                    const pRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'players', friendId);
                    const pSnap = await window.fbGetDoc(pRef);
                    if (pSnap.exists()) {
                        const d = pSnap.data() || {};
                        const tb = d.totalBattles || 0;
                        const w = d.wins || 0;
                        const l = d.losses || 0;
                        const wr = tb > 0 ? ((w / tb) * 100).toFixed(1) + '%' : '0.0%';
                        info = {
                            playerId: friendId,
                            playerName: d.playerName || cached.playerName,
                            selectedIcon: d.selectedIcon || cached.selectedIcon,
                            totalBattles: tb,
                            wins: w,
                            losses: l,
                            winRate: wr,
                            startDate: d.startDate || '-'
                        };
                        if (window._friendState.box.friends && window._friendState.box.friends[friendId]) {
                            window._friendState.box.friends[friendId].playerName = info.playerName;
                            window._friendState.box.friends[friendId].selectedIcon = info.selectedIcon;
                            saveLocalFriendBoxCache();
                        }
                    }
                } catch (e) {}
            }
            const safeName = escapeFriendHtml(info.playerName);
            const html = `
                <div class="flex flex-col items-center space-y-2.5 p-1 w-full">
                    <div class="flex items-center gap-3 bg-slate-950 p-2.5 rounded border border-purple-500/60 w-full">
                        <canvas id="friend-detail-cvs" data-char-id="${escapeFriendHtml(info.selectedIcon)}" width="64" height="64" class="pixel-box bg-slate-900 rounded w-14 h-14 shrink-0"></canvas>
                        <div class="text-left min-w-0 flex-1">
                            <h3 class="text-sm font-bold text-amber-300 font-pixel truncate">${safeName}</h3>
                            <div class="text-[11px] text-slate-300 font-mono">ID: ${escapeFriendHtml(info.playerId)}</div>
                            <div class="text-[10px] text-slate-400 font-mono">開始日: ${escapeFriendHtml(info.startDate)}</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-4 gap-1.5 w-full text-center font-mono text-xs">
                        <div class="bg-slate-950 p-1.5 rounded border border-slate-800">
                            <div class="text-slate-400 text-[9px]">総対戦</div>
                            <div class="text-amber-300 font-bold text-xs">${info.totalBattles}</div>
                        </div>
                        <div class="bg-slate-950 p-1.5 rounded border border-slate-800">
                            <div class="text-slate-400 text-[9px]">勝利</div>
                            <div class="text-emerald-400 font-bold text-xs">${info.wins}</div>
                        </div>
                        <div class="bg-slate-950 p-1.5 rounded border border-slate-800">
                            <div class="text-slate-400 text-[9px]">敗北</div>
                            <div class="text-red-400 font-bold text-xs">${info.losses}</div>
                        </div>
                        <div class="bg-slate-950 p-1.5 rounded border border-slate-800">
                            <div class="text-slate-400 text-[9px]">勝率</div>
                            <div class="text-cyan-400 font-bold text-xs">${info.winRate}</div>
                        </div>
                    </div>
                    <button type="button" onclick="closeModal(); inviteFriendToBattleRoom('${escapeFriendHtml(info.playerId)}', '${safeName}')" class="pixel-btn pixel-btn-success w-full py-2 text-xs font-bold font-pixel">
                        ⚔️ ルームを作成して対戦招待する
                    </button>
                </div>
            `;
            showModal('👥 フレンド詳細', html);
            setTimeout(() => {
                const cvs = document.getElementById('friend-detail-cvs');
                if (cvs) CharacterRenderer.drawCharacter(cvs, info.selectedIcon || 'dopagaking');
            }, 30);
        }

        async function dismissFriendRoomInvite(fromId) {
            const myId = playerState.playerId || 'DP-1004';
            const invites = { ...(window._friendState.box.roomInvites || {}) };
            delete invites[fromId];
            window._friendState.box.roomInvites = invites;
            saveLocalFriendBoxCache();
            renderFriendScreenContent();
            if (window.fbDb && window.fbDoc && window.fbGetDoc && window.fbSetDoc) {
                try {
                    const myBoxRef = window.fbDoc(window.fbDb, 'artifacts', window.fbAppId, 'public', 'data', 'friend_boxes', myId);
                    const snap = await window.fbGetDoc(myBoxRef);
                    if (snap.exists()) {
                        const myBox = { ...(snap.data() || {}) };
                        const nextInvites = { ...(myBox.roomInvites || {}) };
                        delete nextInvites[fromId];
                        await window.fbSetDoc(myBoxRef, { ...myBox, roomInvites: nextInvites, updatedAt: Date.now() });
                    }
                } catch (e) {}
            }
        }

        async function joinFriendRoomInvite(roomCode, fromId) {
            await dismissFriendRoomInvite(fromId);
            joinOnlineRoomByCode('multi', roomCode);
        }

        function inviteFriendToBattleRoom(friendId, friendName) {
            createOnlineCodeRoom('multi', friendId, friendName);
        }

        function renderFriendScreenContent() {
            const container = document.getElementById('screen-container');
            if (!container) return;

            const st = window._friendState;
            const box = st.box || {};
            const myId = playerState.playerId || 'DP-1004';
            const myName = playerState.playerName || '名無しファイター';
            const myIcon = playerState.selectedIcon || 'dopagaking';

            const friendsList = Object.values(box.friends || {}).sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
            const incomingList = Object.values(box.incomingRequests || {}).sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0));
            const outgoingList = Object.values(box.outgoingRequests || {}).sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0));
            const now = Date.now();
            const activeInvites = Object.values(box.roomInvites || {})
                .filter(inv => inv && inv.roomCode && (!inv.sentAt || (now - inv.sentAt) < 15 * 60 * 1000))
                .sort((a, b) => (b.sentAt || 0) - (a.sentAt || 0));

            let tabListHtml = '';
            if (st.loading && friendsList.length === 0 && incomingList.length === 0 && outgoingList.length === 0) {
                tabListHtml = `<div class="text-center py-6 text-xs font-mono text-sky-300 animate-pulse">⏳ フレンド情報を読み込み中...</div>`;
            } else if (st.activeTab === 'list') {
                if (friendsList.length === 0) {
                    tabListHtml = `
                        <div class="text-center py-5 space-y-1.5 text-slate-400">
                            <div class="text-2xl">👥</div>
                            <div class="text-xs font-bold text-slate-300">まだフレンドがいません</div>
                            <div class="text-[10px] font-mono">左のフォームに相手の「DP-XXXX」を入力して申請するか、<br>自分のIDを共有しよう！</div>
                        </div>
                    `;
                } else {
                    tabListHtml = friendsList.map(f => {
                        const fId = escapeFriendHtml(f.playerId);
                        const fName = escapeFriendHtml(f.playerName || f.playerId);
                        const fIcon = escapeFriendHtml(f.selectedIcon || 'dopagaking');
                        return `
                            <div class="pixel-box bg-slate-950 border-slate-700 px-2.5 py-1.5 flex items-center justify-between gap-2">
                                <div class="flex items-center gap-2 min-w-0">
                                    <canvas id="friend-item-cvs-list-${fId}" data-char-id="${fIcon}" width="36" height="36" class="w-9 h-9 rounded bg-slate-900 border border-purple-500/60 shrink-0"></canvas>
                                    <div class="min-w-0">
                                        <div class="text-xs font-bold text-amber-300 truncate">${fName}</div>
                                        <div class="text-[10px] text-slate-400 font-mono">ID: ${fId}</div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-1 shrink-0">
                                    <button type="button" onclick="inviteFriendToBattleRoom('${fId}', '${fName}')" class="pixel-btn pixel-btn-success px-2 py-1 text-[10px] font-bold whitespace-nowrap" title="対戦ルームを作って招待">⚔️ 対戦</button>
                                    <button type="button" onclick="openFriendDetailModal('${fId}')" class="pixel-btn pixel-btn-primary px-2 py-1 text-[10px] font-bold whitespace-nowrap">📊 詳細</button>
                                    <button type="button" onclick="confirmRemoveFriend('${fId}', '${fName}')" class="pixel-btn pixel-btn-danger px-2 py-1 text-[10px] font-bold whitespace-nowrap" title="フレンド削除">✕</button>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            } else if (st.activeTab === 'incoming') {
                if (incomingList.length === 0) {
                    tabListHtml = `<div class="text-center py-6 text-xs font-mono text-slate-400">届いているフレンド申請はありません</div>`;
                } else {
                    tabListHtml = incomingList.map(r => {
                        const rId = escapeFriendHtml(r.playerId);
                        const rName = escapeFriendHtml(r.playerName || r.playerId);
                        const rIcon = escapeFriendHtml(r.selectedIcon || 'dopagaking');
                        return `
                            <div class="pixel-box bg-slate-950 border-amber-500/70 px-2.5 py-1.5 flex items-center justify-between gap-2">
                                <div class="flex items-center gap-2 min-w-0">
                                    <canvas id="friend-item-cvs-in-${rId}" data-char-id="${rIcon}" width="36" height="36" class="w-9 h-9 rounded bg-slate-900 border border-amber-500/60 shrink-0"></canvas>
                                    <div class="min-w-0">
                                        <div class="text-xs font-bold text-white truncate">${rName}</div>
                                        <div class="text-[10px] text-amber-300 font-mono">ID: ${rId}</div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-1 shrink-0">
                                    <button type="button" onclick="acceptFriendRequest('${rId}')" class="pixel-btn pixel-btn-success px-2.5 py-1 text-[10px] font-bold whitespace-nowrap">✅ 承認</button>
                                    <button type="button" onclick="rejectFriendRequest('${rId}')" class="pixel-btn pixel-btn-danger px-2 py-1 text-[10px] font-bold whitespace-nowrap">✕ 拒否</button>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            } else {
                if (outgoingList.length === 0) {
                    tabListHtml = `<div class="text-center py-6 text-xs font-mono text-slate-400">送信中のフレンド申請はありません</div>`;
                } else {
                    tabListHtml = outgoingList.map(r => {
                        const rId = escapeFriendHtml(r.playerId);
                        const rName = escapeFriendHtml(r.playerName || r.playerId);
                        const rIcon = escapeFriendHtml(r.selectedIcon || 'dopagaking');
                        return `
                            <div class="pixel-box bg-slate-950 border-slate-700 px-2.5 py-1.5 flex items-center justify-between gap-2">
                                <div class="flex items-center gap-2 min-w-0">
                                    <canvas id="friend-item-cvs-out-${rId}" data-char-id="${rIcon}" width="36" height="36" class="w-9 h-9 rounded bg-slate-900 border border-slate-600 shrink-0"></canvas>
                                    <div class="min-w-0">
                                        <div class="text-xs font-bold text-slate-200 truncate">${rName}</div>
                                        <div class="text-[10px] text-slate-400 font-mono">ID: ${rId}（承認待ち）</div>
                                    </div>
                                </div>
                                <button type="button" onclick="cancelOutgoingFriendRequest('${rId}')" class="pixel-btn px-2 py-1 text-[10px] bg-slate-800 border-slate-500 text-slate-200 font-bold whitespace-nowrap shrink-0">取り消し</button>
                            </div>
                        `;
                    }).join('');
                }
            }

            const invitesBannerHtml = activeInvites.length > 0 ? `
                <div class="space-y-1 mb-1.5 shrink-0">
                    ${activeInvites.map(inv => `
                        <div class="pixel-box bg-emerald-950/85 border-emerald-400 px-2 py-1.5 flex items-center justify-between gap-2">
                            <div class="text-[10px] font-mono text-emerald-200 truncate min-w-0">
                                ⚔️ <b>${escapeFriendHtml(inv.fromName || inv.fromId)}</b> から対戦招待 (ID: <span class="text-amber-300 font-bold">${escapeFriendHtml(inv.roomCode)}</span>)
                            </div>
                            <div class="flex items-center gap-1 shrink-0">
                                <button type="button" onclick="joinFriendRoomInvite('${escapeFriendHtml(inv.roomCode)}', '${escapeFriendHtml(inv.fromId)}')" class="pixel-btn pixel-btn-success px-2 py-0.5 text-[10px] font-bold whitespace-nowrap">参加 ▶</button>
                                <button type="button" onclick="dismissFriendRoomInvite('${escapeFriendHtml(inv.fromId)}')" class="pixel-btn pixel-btn-danger px-1.5 py-0.5 text-[10px] font-bold">✕</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '';

            const tabTitle = st.activeTab === 'list'
                ? `👥 フレンド一覧 (${friendsList.length}人)`
                : (st.activeTab === 'incoming' ? `📩 届いた申請 (${incomingList.length}件)` : `⏳ 申請中 (${outgoingList.length}件)`);

            container.innerHTML = `
                <div class="flex flex-col w-full max-w-6xl mx-auto py-1 px-2 space-y-1.5 h-full overflow-hidden">
                    <div class="flex justify-between items-center w-full px-1 flex-shrink-0 gap-2">
                        <h2 class="text-xs sm:text-base font-bold text-purple-300 font-pixel whitespace-nowrap">👥 フレンド</h2>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" onclick="refreshFriendScreenData()" class="pixel-btn pixel-btn-primary px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap">${st.loading ? '⏳ 更新中' : '🔄 更新'}</button>
                            <button type="button" onclick="renderHomeScreen()" class="pixel-btn px-3 py-0.5 text-[11px] font-bold whitespace-nowrap">ホームに戻る</button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full flex-1 min-h-0 overflow-hidden">
                        <!-- 左カラム: 自分のID共有 + ID検索申請 + タブ切替 -->
                        <div class="flex flex-col space-y-1.5 overflow-y-auto max-h-full pr-0.5">
                            <div class="pixel-box-gold p-2 bg-amber-950/75 w-full flex items-center justify-between gap-2 shrink-0">
                                <div class="flex items-center gap-2 min-w-0">
                                    <canvas id="friend-self-cvs" width="44" height="44" class="pixel-box bg-slate-950 rounded w-11 h-11 border border-amber-400 shrink-0"></canvas>
                                    <div class="min-w-0 text-left">
                                        <div class="text-xs font-bold text-amber-300 truncate">${escapeFriendHtml(myName)}</div>
                                        <div class="text-[11px] text-slate-200 font-mono">あなたのID: <b class="text-amber-300">${escapeFriendHtml(myId)}</b></div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-1 shrink-0">
                                    <button type="button" onclick="copyPlayerId('${escapeFriendHtml(myId)}')" class="pixel-btn pixel-btn-primary px-2 py-1 text-[10px] font-bold whitespace-nowrap">📋 コピー</button>
                                    <button type="button" onclick="shareMyFriendId()" class="pixel-btn pixel-btn-purple px-2 py-1 text-[10px] font-bold whitespace-nowrap">📤 共有</button>
                                </div>
                            </div>

                            <div class="pixel-box p-2 bg-slate-900/95 border-purple-500/70 w-full space-y-1.5 shrink-0">
                                <div class="text-[11px] font-pixel font-bold text-purple-300">➕ フレンドIDで検索・申請</div>
                                <div class="flex items-center gap-1.5">
                                    <input id="friend-search-id-input" type="text" maxlength="10" placeholder="例: DP-1234" onkeydown="if(event.key==='Enter') sendFriendRequestById();" class="pixel-box bg-slate-950 px-2.5 py-1 text-xs font-mono font-bold text-amber-300 flex-1 min-w-0 outline-none border-purple-500/70 uppercase">
                                    <button type="button" onclick="sendFriendRequestById()" class="pixel-btn pixel-btn-purple px-3 py-1 text-xs font-bold whitespace-nowrap shrink-0">申請 ▶</button>
                                </div>
                                <div id="friend-action-status" class="text-[10px] font-mono min-h-[14px] ${st.statusColor || 'text-slate-300'}">${escapeFriendHtml(st.statusMsg || '相手の4桁数字またはDP-XXXXを入力してください')}</div>
                            </div>

                            <div class="grid grid-cols-3 gap-1 shrink-0">
                                <button type="button" onclick="setFriendScreenTab('list')" class="pixel-btn ${st.activeTab === 'list' ? 'pixel-btn-purple border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'} py-1.5 text-[10px] font-bold whitespace-nowrap">
                                    👥 一覧 (${friendsList.length})
                                </button>
                                <button type="button" onclick="setFriendScreenTab('incoming')" class="pixel-btn ${st.activeTab === 'incoming' ? 'pixel-btn-warning border-amber-400' : (incomingList.length > 0 ? 'bg-amber-950 text-amber-300 border-amber-500' : 'bg-slate-800 text-slate-300 border-slate-700')} py-1.5 text-[10px] font-bold whitespace-nowrap">
                                    📩 受信 (${incomingList.length})
                                </button>
                                <button type="button" onclick="setFriendScreenTab('outgoing')" class="pixel-btn ${st.activeTab === 'outgoing' ? 'pixel-btn-primary border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'} py-1.5 text-[10px] font-bold whitespace-nowrap">
                                    ⏳ 申請中 (${outgoingList.length})
                                </button>
                            </div>
                        </div>

                        <!-- 右カラム: フレンドリスト / 申請リスト + スクロール -->
                        <div class="pixel-box p-2 bg-slate-900/95 border-slate-700 w-full flex flex-col h-full min-h-0 overflow-hidden">
                            ${invitesBannerHtml}
                            <div class="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5 shrink-0">
                                <h3 class="text-[11px] font-bold text-purple-300 font-pixel">${tabTitle}</h3>
                            </div>
                            <div class="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1.5">
                                ${tabListHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            setTimeout(() => {
                const selfCvs = document.getElementById('friend-self-cvs');
                if (selfCvs) CharacterRenderer.drawCharacter(selfCvs, myIcon);
                document.querySelectorAll('canvas[id^="friend-item-cvs-"]').forEach(cvs => {
                    if (cvs.dataset && cvs.dataset.charId) {
                        CharacterRenderer.drawCharacter(cvs, cvs.dataset.charId);
                    }
                });
            }, 20);
        }

        function openFriendModal() {
            audioSystem.playSelect();
            loadLocalFriendBoxCache();
            window._friendState.statusMsg = '相手の4桁数字またはDP-XXXXを入力してください';
            window._friendState.statusColor = 'text-slate-300';
            renderFriendScreenContent();
            fetchMyFriendBoxFromServer(true);
        }

        async function forceReloadApp() {
            audioSystem.playSelect();
            // セーブデータ（localStorage）は絶対に削除・リセットせず、キャッシュを無視して最新のWebファイルを強制再読み込みする
            try {
                if (typeof caches !== 'undefined' && caches.keys) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(k => caches.delete(k)));
                }
            } catch (e) {}
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

                        <div class="bg-slate-950 p-2 rounded border border-sky-600/70 space-y-1.5">
                            <div class="flex justify-between items-center">
                                <span class="text-sky-300 font-bold">サイトを共有:</span>
                                <span class="text-[10px] text-slate-400 font-mono">URL / QRコード</span>
                            </div>
                            <div class="grid grid-cols-2 gap-1.5">
                                <button onclick="handleSettingsUrlShareClick()" class="pixel-btn pixel-btn-primary text-[11px] px-2 py-1 font-bold whitespace-nowrap">
                                    🔗 URLで共有
                                </button>
                                <button onclick="openFullscreenQrShare()" class="pixel-btn pixel-btn-success text-[11px] px-2 py-1 font-bold whitespace-nowrap">
                                    📱 QRで共有
                                </button>
                            </div>
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

        function closeSettingsPanel(silent = false) {
            if (!silent) audioSystem.playSelect();
            const backdrop = document.getElementById('settings-backdrop');
            const panel = document.getElementById('settings-slide-panel');
            if (panel) panel.classList.add('translate-x-full');
            if (backdrop) backdrop.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }

        const SITE_SHARE_URL = 'https://daijutrooper2-wq.github.io/DOPA-/';
        const SITE_SHARE_QR_IMAGE = 'assets/aistudio/image_6db88de4.png';

        function setSiteShareStatus(msg, colorClass = 'text-emerald-300') {
            const el = document.getElementById('site-share-status');
            if (!el) return;
            el.className = `text-[11px] font-bold min-h-[16px] text-center ${colorClass}`;
            el.innerText = msg || '';
        }

        function renderSiteShareModalContent() {
            const activeTab = window._siteShareActiveTab === 'qr' ? 'qr' : 'url';
            const qrZoomed = !!window._siteShareQrExpanded;
            const qrSrc = (typeof AssetPreloader !== 'undefined' && AssetPreloader.resolve)
                ? AssetPreloader.resolve(SITE_SHARE_QR_IMAGE)
                : SITE_SHARE_QR_IMAGE;
            const shareText = `ドパガキングダムの熱き3v3バトルRPG「ドパキン」で一緒に遊ぼう！\n${SITE_SHARE_URL}`;
            const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(shareText)}`;
            const mailSubject = encodeURIComponent('【ドパキン】一緒に3v3バトルで遊ぼう！');
            const mailBody = encodeURIComponent(`ドパガキングダムの熱き3v3バトルRPG「ドパキン」\nこちらからすぐ遊べます！\n${SITE_SHARE_URL}`);
            const mailUrl = `mailto:?subject=${mailSubject}&body=${mailBody}`;

            const urlTabBtnClass = activeTab === 'url'
                ? 'pixel-btn pixel-btn-primary text-xs px-3 py-1.5 font-bold flex-1 ring-2 ring-amber-300'
                : 'pixel-btn text-xs px-3 py-1.5 font-bold flex-1 opacity-75 hover:opacity-100';
            const qrTabBtnClass = activeTab === 'qr'
                ? 'pixel-btn pixel-btn-success text-xs px-3 py-1.5 font-bold flex-1 ring-2 ring-amber-300'
                : 'pixel-btn text-xs px-3 py-1.5 font-bold flex-1 opacity-75 hover:opacity-100';

            const urlSectionHtml = `
                <div class="pixel-box bg-slate-950/90 border border-sky-500/70 p-3 space-y-2.5 text-center">
                    <p class="text-[11px] text-slate-300 font-mono leading-relaxed">
                        LINE・メールなどでURLをそのまま共有できます。
                    </p>
                    <input type="text" id="site-share-url-input" readonly value="${SITE_SHARE_URL}" onclick="this.select()" class="pixel-box bg-slate-900 border-sky-600 text-amber-300 text-xs font-mono w-full px-2.5 py-2 text-center outline-none select-all">
                    <div class="flex flex-wrap justify-center gap-2">
                        <button type="button" onclick="shareSiteByUrl()" class="pixel-btn pixel-btn-primary px-3 py-1.5 text-xs font-bold font-pixel">
                            📤 共有画面を開く
                        </button>
                        <button type="button" onclick="copySiteShareUrl()" class="pixel-btn pixel-btn-warning px-3 py-1.5 text-xs font-bold font-pixel">
                            📋 URLコピー
                        </button>
                        <a href="${lineUrl}" target="_blank" rel="noopener noreferrer" class="pixel-btn pixel-btn-success px-3 py-1.5 text-xs font-bold font-pixel inline-flex items-center gap-1 no-underline">
                            💬 LINEで送る
                        </a>
                        <a href="${mailUrl}" class="pixel-btn bg-slate-800 border-sky-400 text-sky-200 px-3 py-1.5 text-xs font-bold font-pixel inline-flex items-center gap-1 no-underline">
                            ✉️ メールで送る
                        </a>
                    </div>
                </div>
            `;

            const qrSizeClass = qrZoomed ? 'w-44 h-44 sm:w-48 sm:h-48' : 'w-28 h-28 sm:w-32 sm:h-32';
            const qrSectionHtml = `
                <div class="pixel-box bg-slate-950/90 border border-emerald-500/70 p-3 space-y-2.5 text-center">
                    <p class="text-[11px] text-slate-300 font-mono leading-relaxed">
                        カメラで読み取るか、QR画像を共有・保存して友達に送れます。
                    </p>
                    <div class="flex flex-col items-center justify-center gap-1.5">
                        <div onclick="openFullscreenQrShare()" title="タップで横画面いっぱいに表示" class="bg-white p-2 rounded-lg inline-block shadow-lg border-2 border-amber-400 cursor-pointer transition-transform active:scale-95">
                            <img id="site-share-qr-img" src="${qrSrc}" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='/${SITE_SHARE_QR_IMAGE}';}" alt="ドパキン共有QRコード" class="${qrSizeClass} object-contain block mx-auto" style="image-rendering: pixelated;">
                        </div>
                        <button type="button" onclick="openFullscreenQrShare()" class="text-[10px] text-amber-300 underline font-mono">
                            🔍 横画面で大きく表示する
                        </button>
                    </div>
                    <div class="text-[10px] text-sky-300 font-mono break-all">${SITE_SHARE_URL}</div>
                    <div class="flex flex-wrap justify-center gap-2">
                        <button type="button" onclick="shareSiteByQrImage()" class="pixel-btn pixel-btn-success px-3.5 py-1.5 text-xs font-bold font-pixel">
                            📤 QR画像を共有
                        </button>
                        <button type="button" onclick="downloadSiteShareQrImage()" class="pixel-btn pixel-btn-primary px-3.5 py-1.5 text-xs font-bold font-pixel">
                            💾 QR画像を保存
                        </button>
                    </div>
                </div>
            `;

            return `
                <div class="space-y-2.5 text-center">
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="switchSiteShareTab('url')" class="${urlTabBtnClass}">
                            🔗 URLで共有
                        </button>
                        <button type="button" onclick="openFullscreenQrShare()" class="${qrTabBtnClass}">
                            📱 QRで大きく表示
                        </button>
                    </div>
                    ${activeTab === 'qr' ? qrSectionHtml : urlSectionHtml}
                    <div id="site-share-status" class="text-[11px] font-bold min-h-[16px] text-center text-emerald-300"></div>
                </div>
            `;
        }

        async function handleSettingsUrlShareClick(fromQrOverlay = false) {
            audioSystem.playSelect();
            const shareText = 'ドパガキングダムの熱き3v3バトルRPG「ドパキン」で一緒に遊ぼう！';
            if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
                try {
                    await navigator.share({
                        title: 'ドパキン (DOPAKIN RPG)',
                        text: shareText,
                        url: SITE_SHARE_URL
                    });
                    if (typeof showToast === 'function') showToast('✓ URLを共有しました！');
                    return;
                } catch (err) {
                    if (err && err.name === 'AbortError') return;
                }
            }
            if (fromQrOverlay) closeFullscreenQrShare(true);
            closeSettingsPanel(true);
            copyTextSilently(SITE_SHARE_URL);
            window._siteShareActiveTab = 'url';
            window._siteShareQrExpanded = false;
            showModal('📤 URLを共有', renderSiteShareModalContent());
            setSiteShareStatus('✓ URLをコピーしました！LINEやメールボタンからも送信できます', 'text-emerald-300');
        }

        function closeFullscreenQrShare(silent = false) {
            if (!silent) audioSystem.playSelect();
            const existing = document.getElementById('qr-fullscreen-overlay');
            if (existing) existing.remove();
            const modalOverlay = document.getElementById('modal-overlay');
            const settingsBackdrop = document.getElementById('settings-backdrop');
            const anyOpen = (modalOverlay && !modalOverlay.classList.contains('hidden')) || (settingsBackdrop && !settingsBackdrop.classList.contains('hidden'));
            if (!anyOpen) {
                document.body.classList.remove('modal-open');
            }
        }

        function openFullscreenQrShare() {
            audioSystem.playSelect();
            closeSettingsPanel(true);
            closeModal();
            const oldOverlay = document.getElementById('qr-fullscreen-overlay');
            if (oldOverlay) oldOverlay.remove();

            const qrSrc = (typeof AssetPreloader !== 'undefined' && AssetPreloader.resolve)
                ? AssetPreloader.resolve(SITE_SHARE_QR_IMAGE)
                : SITE_SHARE_QR_IMAGE;

            const overlay = document.createElement('div');
            overlay.id = 'qr-fullscreen-overlay';
            overlay.className = 'fixed inset-0 z-[9998] bg-slate-950/95 flex items-center justify-center p-3 sm:p-5 select-none';
            overlay.onclick = (e) => {
                if (e.target === overlay) closeFullscreenQrShare();
            };

            overlay.innerHTML = `
                <div class="w-full h-full max-w-4xl flex flex-row items-center justify-center gap-4 sm:gap-8 relative">
                    <div class="shrink-0 flex items-center justify-center">
                        <div class="bg-white p-2.5 sm:p-4 rounded-2xl border-4 border-amber-400 shadow-[0_0_32px_rgba(251,191,36,0.35)] flex items-center justify-center">
                            <img src="${qrSrc}" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='/${SITE_SHARE_QR_IMAGE}';}" alt="ドパキン共有QRコード" style="width: min(76vh, 52vw, 390px); height: min(76vh, 52vw, 390px); image-rendering: pixelated;" class="object-contain block">
                        </div>
                    </div>

                    <div class="flex-1 min-w-0 max-w-xs flex flex-col justify-center gap-2.5 text-left">
                        <div class="pixel-box bg-slate-900/95 border-2 border-emerald-400 p-3 space-y-2">
                            <div class="flex items-center justify-between gap-2">
                                <h3 class="text-sm sm:text-base font-bold text-amber-300 font-pixel">📱 QRコードで共有</h3>
                            </div>
                            <p class="text-[11px] sm:text-xs text-slate-200 font-mono leading-relaxed">
                                ほかの人のスマホカメラでこのQRコードを読み取ってもらうと、そのまま「ドパキン」を開けます！
                            </p>
                            <div class="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] text-sky-300 font-mono break-all select-all">
                                ${SITE_SHARE_URL}
                            </div>
                            <div id="site-share-status" class="text-[11px] font-bold min-h-[16px] text-emerald-300"></div>
                        </div>

                        <div class="grid grid-cols-2 gap-1.5">
                            <button type="button" onclick="shareSiteByQrImage()" class="pixel-btn pixel-btn-success py-2 px-2 text-[11px] font-bold font-pixel whitespace-nowrap">
                                📤 画像を共有
                            </button>
                            <button type="button" onclick="downloadSiteShareQrImage()" class="pixel-btn pixel-btn-primary py-2 px-2 text-[11px] font-bold font-pixel whitespace-nowrap">
                                💾 画像を保存
                            </button>
                        </div>
                        <button type="button" onclick="closeFullscreenQrShare()" class="pixel-btn pixel-btn-danger w-full py-2 px-3 text-xs font-bold font-pixel">
                            ✕ 閉じる
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            document.body.classList.add('modal-open');
        }

        function openSiteShareModal(tab = 'url') {
            if (tab === 'qr') {
                openFullscreenQrShare();
                return;
            }
            handleSettingsUrlShareClick();
        }

        function switchSiteShareTab(tab) {
            if (tab === 'qr') {
                openFullscreenQrShare();
                return;
            }
            audioSystem.playSelect();
            window._siteShareActiveTab = 'url';
            const bodyEl = document.getElementById('modal-body');
            if (bodyEl) {
                bodyEl.innerHTML = renderSiteShareModalContent();
            }
        }

        function toggleSiteShareQrZoom() {
            openFullscreenQrShare();
        }

        function copySiteShareUrl() {
            audioSystem.playSelect();
            const input = document.getElementById('site-share-url-input');
            if (input && typeof input.select === 'function') {
                try { input.select(); } catch (e) {}
            }
            copyTextSilently(SITE_SHARE_URL).then((ok) => {
                if (ok) {
                    setSiteShareStatus('✓ URLをコピーしました！', 'text-emerald-300');
                    if (typeof showToast === 'function') showToast('URLをコピーしました！');
                } else {
                    setSiteShareStatus('URLを選択してコピーしてください', 'text-amber-300');
                }
            });
        }

        async function shareSiteByUrl() {
            audioSystem.playSelect();
            const shareText = 'ドパガキングダムの熱き3v3バトルRPG「ドパキン」で一緒に遊ぼう！';
            if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
                try {
                    await navigator.share({
                        title: 'ドパキン (DOPAKIN RPG)',
                        text: shareText,
                        url: SITE_SHARE_URL
                    });
                    setSiteShareStatus('✓ サイトURLを共有しました！', 'text-emerald-300');
                    return;
                } catch (err) {
                    if (err && err.name === 'AbortError') return;
                }
            }
            copyTextSilently(SITE_SHARE_URL).then((ok) => {
                if (ok) {
                    setSiteShareStatus('✓ この端末では共有メニュー非対応のため、URLをコピーしました！', 'text-emerald-300');
                    if (typeof showToast === 'function') showToast('URLをコピーしました！');
                } else {
                    setSiteShareStatus('下の「URLコピー」または「LINEで送る」をご利用ください', 'text-amber-300');
                }
            });
        }

        async function fetchSiteShareQrBlob() {
            const candidates = [];
            if (typeof AssetPreloader !== 'undefined' && AssetPreloader.resolve) {
                candidates.push(AssetPreloader.resolve(SITE_SHARE_QR_IMAGE));
            }
            candidates.push(SITE_SHARE_QR_IMAGE, `/${SITE_SHARE_QR_IMAGE}`);
            for (const url of candidates) {
                try {
                    const res = await fetch(url);
                    if (res && res.ok) {
                        const blob = await res.blob();
                        if (blob && blob.size > 0) return blob;
                    }
                } catch (e) {}
            }
            return null;
        }

        async function shareSiteByQrImage() {
            audioSystem.playSelect();
            const blob = await fetchSiteShareQrBlob();
            if (blob && typeof File === 'function' && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
                try {
                    const file = new File([blob], 'dopakin-qr.png', { type: blob.type || 'image/png' });
                    if (!navigator.canShare || navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: 'ドパキン (DOPAKIN RPG) QRコード',
                            text: `QRコードまたはURLから「ドパキン」にアクセス！\n${SITE_SHARE_URL}`,
                            files: [file]
                        });
                        setSiteShareStatus('✓ QRコードを共有しました！', 'text-emerald-300');
                        return;
                    }
                } catch (err) {
                    if (err && err.name === 'AbortError') return;
                }
            }
            await downloadSiteShareQrImage(blob, 'この環境ではQR画像の直接共有に非対応のため、QR画像を保存しました！');
        }

        async function downloadSiteShareQrImage(preloadedBlob = null, customMsg = '✓ QR画像を保存しました！') {
            if (!preloadedBlob) audioSystem.playSelect();
            const blob = preloadedBlob || await fetchSiteShareQrBlob();
            let objectUrl = null;
            try {
                const a = document.createElement('a');
                if (blob) {
                    objectUrl = URL.createObjectURL(blob);
                    a.href = objectUrl;
                } else {
                    a.href = SITE_SHARE_QR_IMAGE;
                }
                a.download = 'dopakin-qr.png';
                document.body.appendChild(a);
                a.click();
                a.remove();
                setSiteShareStatus(customMsg, 'text-emerald-300');
                if (typeof showToast === 'function') showToast('QR画像を保存しました！');
            } catch (e) {
                setSiteShareStatus('画面のQRコードをそのままカメラで読み取ってください', 'text-amber-300');
            } finally {
                if (objectUrl) {
                    setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
                }
            }
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

            // 全キャラクターの画像・背景・UI素材を毎回すべてスマホ内に読み込み・キャッシュ＆事前デコード
            AssetPreloader.preloadAll({ showBanner: true });
            Object.values(CHARACTER_DATA).forEach(c => {
                if (c.image) CharacterRenderer.getImage(c.image);
                if (c.allImage) CharacterRenderer.getImage(c.allImage);
                if (c.dieImage) CharacterRenderer.getImage(c.dieImage);
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
                <div class="flex flex-col items-center justify-start w-full max-w-6xl mx-auto py-1 px-2 gap-1.5 h-full min-h-0 overflow-hidden select-none">
                    <div class="flex justify-between items-center w-full px-1 shrink-0">
                        <h2 class="text-xs sm:text-base font-bold text-amber-300 font-pixel truncate">👑 プレイヤープロフィール</h2>
                        <button onclick="renderHomeScreen()" class="pixel-btn px-3 py-1 text-[11px] font-bold shrink-0">ホームに戻る</button>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 sm:gap-3 w-full flex-1 min-h-0 items-stretch overflow-hidden">
                        <!-- 左側エリア：プロフィール・勝利数等 ＆ 切り替えボタン -->
                        <div class="flex flex-col justify-between gap-1.5 h-full min-h-0 overflow-y-auto pr-0.5">
                            <div class="pixel-box-gold p-2 sm:p-3 bg-amber-950/85 w-full flex-1 flex flex-col justify-between gap-1.5 min-h-0">
                                <div class="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                                    <div class="flex flex-col items-center gap-1 shrink-0">
                                        <canvas id="profile-main-icon" width="64" height="64" class="pixel-box bg-slate-950 rounded cursor-pointer border-2 border-amber-400 w-12 h-12 sm:w-16 sm:h-16 shadow-lg" onclick="openIconSelectModal()" title="クリックしてアイコン変更"></canvas>
                                        <button onclick="openIconSelectModal()" class="pixel-btn pixel-btn-primary px-2 py-0.5 text-[9px] sm:text-[10px] font-bold">変更</button>
                                    </div>
                                    <div class="flex flex-col justify-center gap-1 text-left flex-1 min-w-0">
                                        <div class="flex items-center gap-1 sm:gap-1.5 min-w-0">
                                            <input id="profile-name-input" type="text" value="${playerState.playerName || ''}" maxlength="12" class="pixel-box bg-slate-950 px-2 py-1 text-xs font-bold text-amber-300 flex-1 min-w-0 max-w-[150px] outline-none border-amber-600">
                                            <button onclick="savePlayerName()" class="pixel-btn pixel-btn-primary px-2 py-1 text-[10px] sm:text-[11px] font-bold shrink-0">保存</button>
                                        </div>
                                        <div class="flex items-center gap-1.5 flex-wrap">
                                            <span class="text-[10px] sm:text-[11px] text-slate-300 font-mono">ID: <span id="profile-player-id-text">${playerState.playerId || 'DP-1004'}</span></span>
                                            <button onclick="copyPlayerId('${playerState.playerId || 'DP-1004'}')" class="pixel-btn pixel-btn-primary px-1.5 py-0.5 text-[9px] font-bold">📋 コピー</button>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex flex-col justify-center gap-1.5 w-full font-mono text-xs border-t border-amber-800/60 pt-1.5">
                                    <div class="flex justify-between items-center text-[10px] sm:text-[11px] gap-2">
                                        <span class="text-slate-300 truncate">始めた日: <b class="text-amber-300">${playerState.startDate || '2026/10/14'}</b></span>
                                        <span class="text-amber-200 shrink-0">DOPA: <b class="text-amber-400 font-pixel">${formatDopa(playerState.dopa)}</b></span>
                                    </div>
                                    <div class="grid grid-cols-4 gap-1 sm:gap-1.5 text-center">
                                        <div class="bg-slate-950 px-1 py-1 sm:py-1.5 rounded border border-amber-800/55">
                                            <div class="text-slate-400 text-[9px]">総対戦</div>
                                            <div class="text-amber-300 font-bold text-xs sm:text-sm">${playerState.totalBattles}</div>
                                        </div>
                                        <div class="bg-slate-950 px-1 py-1 sm:py-1.5 rounded border border-amber-800/55">
                                            <div class="text-slate-400 text-[9px]">勝利</div>
                                            <div class="text-emerald-400 font-bold text-xs sm:text-sm">${playerState.wins}</div>
                                        </div>
                                        <div class="bg-slate-950 px-1 py-1 sm:py-1.5 rounded border border-amber-800/55">
                                            <div class="text-slate-400 text-[9px]">敗北</div>
                                            <div class="text-red-400 font-bold text-xs sm:text-sm">${playerState.losses}</div>
                                        </div>
                                        <div class="bg-slate-950 px-1 py-1 sm:py-1.5 rounded border border-amber-800/55">
                                            <div class="text-slate-400 text-[9px]">勝率</div>
                                            <div class="text-cyan-400 font-bold text-xs sm:text-sm">${winRate}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- キャラクター使用率 / 過去の戦績 切り替えボタン -->
                            <div class="w-full grid grid-cols-2 gap-1.5 shrink-0">
                                <button onclick="setProfileTab('history')" class="pixel-btn ${!showUsage ? 'pixel-btn-primary border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'} py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 whitespace-nowrap">
                                    <span>📜 過去の戦績</span>
                                </button>
                                <button onclick="setProfileTab('usage')" class="pixel-btn ${showUsage ? 'pixel-btn-warning border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'} py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 whitespace-nowrap">
                                    <span>📊 キャラ使用率</span>
                                </button>
                            </div>
                        </div>

                        <!-- 右側エリア：切り替え表示 (戦績 ⇔ キャラクター使用率) とスクロール対応 -->
                        <div class="pixel-box p-2 sm:p-2.5 bg-slate-900 w-full flex flex-col h-full min-h-0 overflow-hidden">
                            <h3 class="text-[10px] sm:text-xs font-bold text-amber-300 font-pixel mb-1.5 flex-shrink-0">${showUsage ? '📊 キャラクター使用率' : '📜 過去の戦歴 (最大50件)'}</h3>
                            <div class="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1.5">
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
                volume: typeof playerState.volume === 'number' ? playerState.volume : 0.5,
                newBattleCustomStats: {}
            };

            playerState.lastSelectedChar = null;
            playerState.lastSelectedTeam = [null, null, null];
            window.selectedNewBattleTeam = [null, null, null];
            window.selectedNewBattleChar = null;
            window.selectedOnlineMultiChar = null;
            try {
                localStorage.removeItem('dopa_player_state');
                localStorage.removeItem('dopa_last_selected_team');
                localStorage.removeItem('dopa_last_selected_char');
                localStorage.removeItem('dopa_online_multi_char');
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
                _activeDopaObeyAttacker.dopaChargeCount = 0;
                _activeDopaObeyAttacker.selectedInheritChar = null;
                if (activeNewBattle.p1) {
                    activeNewBattle.p1.dopaChargeCount = 0;
                    activeNewBattle.p1.selectedInheritChar = null;
                }

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

        
        let _activeDopaCharSelectAttacker = null;

        function openDopaCharSelectModal(attacker) {
            _activeDopaCharSelectAttacker = attacker;
            let modal = document.getElementById('dopa-obey-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'dopa-obey-modal';
                document.body.appendChild(modal);
            }

            const charEntries = Object.values(CHARACTER_DATA).filter(c => c.id !== 'dopagaking');
            let charCardsHtml = charEntries.map(c => {
                const img = c.image || c.allImage || 'momopin/momopin.webp';
                return `
                    <button onclick="executeDopaSelectChar('${c.id}')" class="pixel-box bg-slate-900 border border-amber-500 hover:border-amber-300 p-2 text-center shadow flex flex-col items-center justify-between transition-all cursor-pointer rounded-lg group">
                        <div class="w-12 h-12 flex items-center justify-center bg-slate-950 rounded mb-1 overflow-hidden">
                            <img src="${resolveAssetSrc(img)}" alt="${c.name}" class="w-full h-full object-contain pointer-events-none group-hover:scale-110 transition-transform" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='${img}';}">
                        </div>
                        <div class="font-pixel text-[10px] text-amber-300 font-bold truncate w-full">${c.name}</div>
                        <div class="text-[8px] text-slate-300 truncate w-full">${c.title || c.type || ''}</div>
                    </button>
                `;
            }).join('');

            modal.className = "fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4 animate-fadeIn";
            modal.innerHTML = `
                <div class="pixel-box bg-slate-900 border-2 border-amber-400 max-w-lg w-full p-4 text-center relative shadow-2xl flex flex-col max-h-[85vh]">
                    <div class="text-amber-400 font-pixel text-sm sm:text-base font-bold mb-1">👑【王に従え】キャラクター選択</div>
                    <div class="text-xs text-slate-300 font-mono mb-3">変身してスキルを借りたいキャラクターを1人選択してください！</div>
                    <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto flex-1 pr-1">
                        ${charCardsHtml}
                    </div>
                    <div class="mt-3">
                        <button onclick="const m=document.getElementById('dopa-obey-modal'); if(m) m.style.display='none';" class="pixel-btn pixel-btn-danger px-4 py-1.5 text-xs font-bold">✕ キャンセル</button>
                    </div>
                </div>
            `;
            modal.style.display = 'flex';
        }

        function executeDopaSelectChar(charId) {
            const modal = document.getElementById('dopa-obey-modal');
            if (modal) modal.style.display = 'none';
            const attacker = _activeDopaCharSelectAttacker || (activeNewBattle ? activeNewBattle.p1 : null);
            if (attacker && CHARACTER_DATA[charId]) {
                const charDef = CHARACTER_DATA[charId];
                const team = (activeNewBattle && activeNewBattle.getCharacterTeam ? activeNewBattle.getCharacterTeam(attacker) : 'ally');
                const targetTeamNum = team === 'ally' ? 2 : 1;
                const obeyTarget = activeNewBattle ? activeNewBattle.createBattlePlayer(charId, charDef.name, targetTeamNum) : null;
                if (obeyTarget) {
                    attacker.selectedObeyEnemy = obeyTarget;
                    attacker.selectedInheritChar = charId;
                    openDopaObeyModal(attacker, obeyTarget);
                }
            }
        }

        window.openDopaCharSelectModal = openDopaCharSelectModal;
        window.executeDopaSelectChar = executeDopaSelectChar;
        window.openDopaObeyModal = openDopaObeyModal;
        window.executeDopaObeySkill = executeDopaObeySkill;
    
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
        window.openFriendModal = openFriendModal;
        window.refreshFriendScreenData = refreshFriendScreenData;
        window.setFriendScreenTab = setFriendScreenTab;
        window.shareMyFriendId = shareMyFriendId;
        window.copyMyFriendInviteText = copyMyFriendInviteText;
        window.setFriendActionStatus = setFriendActionStatus;
        window.sendFriendRequestById = sendFriendRequestById;
        window.acceptFriendRequest = acceptFriendRequest;
        window.rejectFriendRequest = rejectFriendRequest;
        window.cancelOutgoingFriendRequest = cancelOutgoingFriendRequest;
        window.confirmRemoveFriend = confirmRemoveFriend;
        window.removeFriendById = removeFriendById;
        window.openFriendDetailModal = openFriendDetailModal;
        window.inviteFriendToBattleRoom = inviteFriendToBattleRoom;
        window.joinFriendRoomInvite = joinFriendRoomInvite;
        window.dismissFriendRoomInvite = dismissFriendRoomInvite;
        window.renderBotModesScreen = renderBotModesScreen;
        window.renderNewBattleCharSelectScreen = renderNewBattleCharSelectScreen;
        window.forceReloadApp = forceReloadApp;
        window.handleSettingsUrlShareClick = handleSettingsUrlShareClick;
        window.openFullscreenQrShare = openFullscreenQrShare;
        window.closeFullscreenQrShare = closeFullscreenQrShare;
        window.openSiteShareModal = openSiteShareModal;
        window.switchSiteShareTab = switchSiteShareTab;
        window.toggleSiteShareQrZoom = toggleSiteShareQrZoom;
        window.copySiteShareUrl = copySiteShareUrl;
        window.shareSiteByUrl = shareSiteByUrl;
        window.shareSiteByQrImage = shareSiteByQrImage;
        window.downloadSiteShareQrImage = downloadSiteShareQrImage;
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

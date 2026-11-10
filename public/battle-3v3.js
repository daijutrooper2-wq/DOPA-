// ==========================================
// 3v3バトルモード (3v3 Battle Mode) 専用コード
// 仕様・挙動・デザイン・UI・ロジック完全維持（独立モジュール）
// ==========================================

let activeNewBattle = null;
let isNewBattleSkillModalOpen = false;
let newBattleViewMode = 'main'; // 'main', 'attack_select', 'target_select'
let newBattleTargetSelectSkillId = null;
let newBattleTargetSelectType = null;

class Battle3v3Engine {
    constructor(p1CharId, p2CharId, isOnline = false, myPlayerNum = 1, roomId = null) {
        this.isOnline = isOnline;
        this.myPlayerNum = myPlayerNum;
        this.roomId = roomId;
        this.isNewBattle = true;
        this.turn = 1;
        this.turnTimer = 15;
        this.timerId = null;
        this.battleEnded = false;
        this.isSuddenDeath = false;
        this.waitingForOpponent = false;
        this.isProcessing = false;
        this.currentAttacker = null;
        this.turnJustStarted = true;

        this.p1 = this.createBattlePlayer(p1CharId, 'Player 1', 1);
        this.p2 = this.createBattlePlayer(p2CharId, 'BOT (CPU)', 2);
        this.activeAllyIndex = 0;
        this.waitingForChoice = false;
        this.battleData = { pashaRollUsedCount: 0, pashaRollReviveCount: 0 };

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

        this.p1Action = null;
        this.p2Action = null;
        this.p1TargetIndex = null;
        this.p1TargetChar = null;

        this.botAdapter = new BotInputAdapter();

        this.onLogUpdate = null;
        this.onTimerUpdate = null;
        this.onStateChange = null;
        this.onVisualEffect = null;
        this.onBattleEnd = null;
        this.onCutin = null;

        this.currentTurnLogs = [];
        this.battleLogs = [];

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
        if (this.battleEnded || this.waitingForChoice) return false;
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
        return 'system';
    }



    logTeam(actor, msg, colorClass = 'text-slate-200') {
        const teamType = this.getCharacterTeam(actor);
        const prefix = teamType === 'ally' ? '【味方】' : (teamType === 'enemy' ? '【敵】' : '');
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

        if (playerNum === 1 && !['dopagaking', 'courtney', 'pasha_dark'].includes(charId)) {
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
            dopaChargeCount: 0,
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
            isShaking: false,
            isMiniZou: false,
            momoRevived: false,
            isDarkMode: false,
            defendBuffTurns: 0,
            crimeDefDownTurns: 0,
            nightmareDefTurns: 0,
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
                    const side = this.getCharacterTeam(pashaChar) === 'ally' ? 'Player' : 'Enemy';
                    this.triggerEffect(side, 'buff', 'パッシブ発動!');
                    if (typeof this.triggerCutin === 'function') {
                        this.triggerCutin('✨ パッシブスキル発動！', '対パシャ憎効果によりクリティカル率上昇！');
                    }
                    if (typeof triggerNewBattleCharacterEffect === 'function') {
                        triggerNewBattleCharacterEffect(pashaChar, 'buff', 'パッシブ!');
                    }
                }
            }
        };

        if (this.allies) {
            this.allies.forEach(a => {
                if (a.id === 'pasha') {
                    checkAndApply(a, this.enemies);
                }
            });
        }
        if (this.enemies) {
            this.enemies.forEach(e => {
                if (e.id === 'pasha') {
                    checkAndApply(e, this.allies);
                }
            });
        }
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
            const side = this.getCharacterTeam(char) === 'ally' ? 'Player' : 'Enemy';
            this.triggerEffect(side, 'buff', 'ダークモード', char);
            if (this.onStateChange) this.onStateChange(this);
        }
    }

    startBattle() {
        this.log(`⚔️ 3v3バトル開始！ 味方チーム VS 敵チーム`, 'text-amber-300 font-bold');
        this.checkPashaPassive();
        this.firstStrikerPlayerNum = 1;
        this.startTimer();
        this.startElapsedTimer();
        if (this.onStateChange) this.onStateChange(this);
    }

    startTimer() {
        this.stopTimer();
        if (this.p1.hp > 0 && this.p1.eggplantReady && !this.p1Action && !this.waitingForOpponent && !this.battleEnded) {
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
        if (!this.p1Action) {
            this.submitAction(1, p1Default);
        }
    }

    submitAction(pNum, skillId) {
        if (this.battleEnded) return;
        if (pNum === 1 && this.p1Action) return;

        if (pNum === 1) {
            this.p1Action = skillId;
            this.stopTimer();
            this.isProcessing = true;
            this.turnJustStarted = false;
            if (this.onStateChange) this.onStateChange(this);
            this.processTurn();
        }
    }

    async processTurn() {
        this.isProcessing = true;
        this.turnJustStarted = false;
        this.currentTurnLogs = [];

        const allFighters = [...this.allies, ...this.enemies];
        allFighters.forEach(p => {
            if (p && p.hp > 0) {
                this.checkPashaDarkMode(p);
                if (p.iwabaBathTurns && p.iwabaBathTurns > 0) {
                    const hAmt = Math.max(15, Math.floor(p.maxHp * 0.10));
                    p.hp = Math.min(p.maxHp, p.hp + hAmt);
                    this.log(`♨️ ${p.charName} は岩盤浴の温まり効果でHPが ${hAmt} 回復した！（持続残り ${p.iwabaBathTurns}T）`, 'text-emerald-300 font-bold');
                    this.triggerEffect(this.getCharacterTeam(p) === 'ally' ? 'Player' : 'Enemy', 'heal', `+${hAmt}`, p);
                    if (typeof audioSystem !== 'undefined' && audioSystem.playHeal) audioSystem.playHeal();
                    this.checkPashaDarkMode(p);
                }
                if (p.darknessPowerTurns && p.darknessPowerTurns > 0) {
                    if (p.darknessAppliedTurn !== this.turn) {
                        p.darknessPowerTurns--;
                        const hAmt = Math.floor(Math.random() * 21) + 10;
                        p.hp = Math.min(p.maxHp, p.hp + hAmt);
                        this.log(`🦇 ${p.charName} の暗黒パワーにより、ターン開始時にHPが ${hAmt} 回復した！（残り ${p.darknessPowerTurns}T）`, 'text-purple-300 font-bold');
                        this.triggerEffect(this.getCharacterTeam(p) === 'ally' ? 'Player' : 'Enemy', 'heal', `+${hAmt}`, p);
                        if (typeof audioSystem !== 'undefined' && audioSystem.playHeal) audioSystem.playHeal();
                        this.checkPashaDarkMode(p);
                    }
                }
            }
        });

        this.checkPashaPassive();

        if (this.isSuddenDeath) {
            this.log(`--- [ ターン ${this.turn} (🔥サドンデス) ] ---`, 'text-red-400 font-bold text-center');
        } else {
            this.log(`--- [ ターン ${this.turn} ] ---`, 'text-slate-400 font-bold text-center');
        }

        const ally1Action = this.p1Action || (this.p1.isResting ? 'rest' : this.p1.skills[0].id);

        if (this.p1.hp > 0) {
            this.currentAttacker = this.p1;
            if (this.onStateChange) this.onStateChange(this);

            const opponents = this.enemies.filter(e => e.hp > 0);
            if (opponents.length > 0) {
                let defender = opponents[0];
                const recordedRec = (this.p1.id === 'asaiomizu' && this.p1.recordedSkill) ? this.p1.recordedSkill : null;
                const skill = (this.p1.id === 'asaiomizu' && ally1Action === 'asaiomizu_copied' && recordedRec) ? { ...recordedRec, targetType: 'single_enemy' } : (this.p1.skills.find(s => s.id === ally1Action) || this.p1.skills[0]);
                const targetList = (skill.targetType === 'single_ally') ? this.allies.filter(a => a.hp > 0) : opponents;
                const targetTeamArr = (skill.targetType === 'single_ally') ? this.allies : this.enemies;
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
                const teamList = isAllyTeam ? this.allies : this.enemies;
                const opposingTeam = isAllyTeam ? this.enemies : this.allies;
                const opponents = (skill.targetType === 'single_ally') ? teamList.filter(a => a.hp > 0) : opposingTeam.filter(e => e.hp > 0);
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

        const isAlliesFirst = (this.turn % 2 === 1);

        if (isAlliesFirst) {
            if (await executeTeamRest(this.allies, true)) return;
            if (await executeTeamRest(this.enemies, false)) return;
        } else {
            if (await executeTeamRest(this.enemies, false)) return;
            if (await executeTeamRest(this.allies, true)) return;
        }

        this.p1TargetIndex = null;
        this.p1TargetChar = null;
        this.endTurnPhase();

        this.currentAttacker = null;
        this.isProcessing = false;
        this.turnJustStarted = true;
        this.p1Action = null;
        this.p1TargetIndex = null;
        this.p1TargetChar = null;

        if (this.onStateChange) this.onStateChange(this);
        if (!this.battleEnded) {
            this.startTimer();
            if (this.onCutin) {
                this.onCutin("🟢 自分のターンです！", `ターン ${this.turn} - 味方チームの行動を選択してください`);
            }
        }
    }

    executePlayerAction(attacker, defender, skillId) {
        if (attacker.hp <= 0) return;

        if (attacker.stunTurns > 0) {
            attacker.stunTurns--;
            this.log(`💫 ${attacker.charName} は行動不能で動けない！`, 'text-amber-400 font-bold');
            this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'miss', '行動不能');
            triggerNewBattleCharacterEffect(attacker, 'miss', '行動不能');
            return;
        }

        if (attacker.eggplantReady) {
            skillId = 'momo_eggplant_burst';
        }

        if (attacker.isResting) {
            attacker.isResting = false;
            this.log(`💤 ${attacker.charName} は前ターンの反動で動けない！`, 'text-slate-400 font-bold');
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
            this.triggerEffect(side, 'pink', `💖 チャージ+1 (${attacker.courtneyChargeCount}/8)`, attacker);
            if (attacker.courtneyChargeCount >= 8) {
                if (typeof this.triggerCutin === 'function') {
                    this.triggerCutin('💖 MAXチャージ完了！', '「FEEL SO HOT ///」最大威力解放可能！（150ダメージ）');
                }
            }
            return;
        }

        let skill = null;
        if (skillId === 'momo_eggplant_burst') {
            skill = { id: 'momo_eggplant_burst', name: '🍆 超ナスちん乱舞', type: 'eggplant_burst', power: 1.5, isNormalAttack: false, cooldown: 0, targetType: 'all_enemies' };
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
        } else if (skillId === 'asaiomizu_copied' && attacker.recordedSkill) {
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

        if (skill.id === 'momo_prep' || skill.type === 'charge') {
            attacker.isMiniZou = true;
            attacker.eggplantReady = true;
            this.log(`🐘 ${attacker.charName} は「ミニぞうさん」に変身し、大量のナスを蓄積した！`, 'text-purple-300 font-bold');
            this.log(`✨ 次ターン、自動的に「超ナスちん乱舞」が発動する！`, 'text-amber-300 font-bold');
            this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'buff', 'ゾウ変身！');
            audioSystem.playBuff();
            if (skill.cooldown > 0) {
                attacker.cooldowns[skill.id] = skill.cooldown + 1;
            }
            return;
        }

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
            if (this.p1 && attacker.id === 'asaiomizu') {
                this.p1.recordedSkill = null;
            }
        }

        if (skill.id === 'courtney_charge' || skill.id === 'courtney_charge_only' || skill.type === 'courtney_charge_only') {
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
            return;
        }

        if (skill.id === 'courtney_feel' || skill.type === 'courtney_charge_release') {
            const charges = attacker.courtneyChargeCount || 0;
            if (charges < 1) {
                this.log(`💖 チャージが1回以上必要です！`, 'text-pink-300');
                return;
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

            if (typeof audioSystem !== 'undefined' && audioSystem.playSpecial) audioSystem.playSpecial();
            const targetSide = this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy';
            this.triggerEffect(targetSide, 'damage', `🔥 ${releaseDmg} DMG!`, defender);
            defender.hp = Math.max(0, defender.hp - releaseDmg);
            if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(defender);

            this.log(`💖🔥 SPコートニーの 「FEEL SO HOT ///」解放！！ (溜め ${charges}回) ⇒ ${defender.charName} に ${releaseDmg} の爆発ダメージ！！`, 'text-pink-400 font-black text-base');
            attacker.courtneyChargeCount = 0;
            return;
        }

        if (skill.id === 'courtney_attack' || skill.type === 'courtney_attack_skill') {
            const opposingTeam = (this.getCharacterTeam(attacker) === 'ally' ? this.enemies : this.allies).filter(e => e.hp > 0);
            if (typeof audioSystem !== 'undefined' && audioSystem.playHit) audioSystem.playHit();
            opposingTeam.forEach(e => {
                e.hp = Math.max(0, e.hp - 13);
                if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(e);
                this.triggerEffect(this.getCharacterTeam(e) === 'ally' ? 'Player' : 'Enemy', 'damage', '-13', e);
            });
            this.log(`💖 ${attacker.charName} の「ミツメル」！ 相手チーム全員をじっと見つめて13の固定ダメージを与えた！`, 'text-pink-300 font-bold');
            return;
        }

        if (skill.id === 'courtney_yoseru' || skill.type === 'courtney_yoseru_skill') {
            let yoseruDmg = Math.max(4, Math.floor(attacker.atk * 0.3));
            defender.hp = Math.max(0, defender.hp - yoseruDmg);
            if (typeof triggerNewBattleShake === 'function') triggerNewBattleShake(defender);
            defender.buffDef = 0.0;
            this.log(`💋 ${attacker.charName} の「ヨセル」！ ${yoseruDmg} ダメージを与え、1ターンの間 ${defender.charName} の防御力を 0 にした！`, 'text-pink-300 font-bold');
            this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'damage', `-${yoseruDmg}`, defender);
            if (typeof audioSystem !== 'undefined' && audioSystem.playHit) audioSystem.playHit();
            return;
        }

        if (skill.id === 'ndaihyo_mind') {
            const healRate = skill.healRate || 0.20;
            const teamList = (this.getCharacterTeam(attacker) === 'ally') ? this.allies : this.enemies;
            teamList.forEach(a => {
                if (a.hp > 0) {
                    const hAmt = Math.floor(a.maxHp * healRate);
                    a.hp = Math.min(a.maxHp, a.hp + hAmt);
                    if (typeof triggerNewBattleCharacterEffect === 'function') {
                        triggerNewBattleCharacterEffect(a, 'heal', `+${hAmt}`);
                    } else if (typeof triggerCharacterEffect === 'function') {
                        triggerCharacterEffect(a, 'heal', `+${hAmt}`);
                    }
                }
            });
            const targetAlly = (defender && this.getCharacterTeam(defender) === this.getCharacterTeam(attacker) && defender.hp > 0) ? defender : attacker;
            const hadDebuff = (targetAlly.buffAtk < 1.0) || (targetAlly.buffDef < 1.0) || ((targetAlly.stunTurns || 0) > 0);
            targetAlly.buffAtk = Math.max(1.0, targetAlly.buffAtk);
            targetAlly.buffDef = Math.max(1.0, targetAlly.buffDef);
            targetAlly.buffAtkTurns = 0;
            targetAlly.stunTurns = 0;
            if (typeof triggerNewBattleCharacterEffect === 'function') {
                triggerNewBattleCharacterEffect(targetAlly, 'buff', 'クレンズ');
            } else if (typeof triggerCharacterEffect === 'function') {
                triggerCharacterEffect(targetAlly, 'buff', 'デバフ解除');
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
            const hAmt = skill.healAmount || 60;
            const teamList = (this.getCharacterTeam(attacker) === 'ally') ? this.allies : this.enemies;
            teamList.forEach(a => {
                if (a.hp > 0) {
                    a.hp = Math.min(a.maxHp, a.hp + hAmt);
                }
            });

            this.log(`📸 ${attacker.charName} はカメラロールを使用した！ 味方全員のHPが ${hAmt} 回復した！`, 'text-emerald-400 font-bold text-base');
            teamList.forEach(a => {
                if (a.hp > 0) {
                    this.triggerEffect(this.getCharacterTeam(a) === 'ally' ? 'Player' : 'Enemy', 'heal', `+${hAmt}`, a);
                }
            });
            if (typeof audioSystem !== 'undefined' && audioSystem.playHeal) audioSystem.playHeal();
            if (typeof triggerCameraFlashGlobalEffect === 'function') {
                triggerCameraFlashGlobalEffect();
            }
            if (typeof this.triggerCutin === 'function') {
                this.triggerCutin('📸 カメラロール発動！', '味方全員のHP60回復 ＆ 思い出のシャッター！');
            }

            const deadAllies = teamList.filter(a => a.hp <= 0);
            const maxReviveTotal = 2;
            if (deadAllies.length > 0 && (attacker.pashaRollReviveCount || 0) < maxReviveTotal) {
                if (Math.random() < 0.30) {
                    attacker.pashaRollReviveCount = (attacker.pashaRollReviveCount || 0) + 1;
                    const targetDead = deadAllies[Math.floor(Math.random() * deadAllies.length)];
                    const revivedHp = Math.floor(targetDead.maxHp * 0.40);
                    targetDead.hp = revivedHp;

                    this.triggerEffect(this.getCharacterTeam(targetDead) === 'ally' ? 'Player' : 'Enemy', 'heal', '復活！', targetDead);
                    const remainingRevive = maxReviveTotal - attacker.pashaRollReviveCount;
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
            this.log(`🦇 ${attacker.charName} は暗黒封印を解除し、${target.charName} に暗黒パワーを付与した！ 3ターンの間、毎ターン開始・コマンド実行時にHPがランダム回復する！`, 'text-purple-300 font-bold text-base');
            if (typeof audioSystem !== 'undefined' && audioSystem.playSpecial) audioSystem.playSpecial();
            this.triggerEffect(this.getCharacterTeam(target) === 'ally' ? 'Player' : 'Enemy', 'buff', '暗黒パワー', target);
            if (typeof this.triggerCutin === 'function') {
                this.triggerCutin('🦇 暗黒封印解除！', `${target.charName} に暗黒パワー付与＆持続回復！`);
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
            audioSystem.playBuff();
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
            audioSystem.playSpecial();
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

        if (skill.type === 'heal' || skill.type === 'heal_cleanse' || skill.type === 'heal_buff' || skill.id === 'courtney_aegu' || skill.type === 'courtney_aegu_skill' || skill.type === 'momo_chie_skill' || skill.id === 'momo_chie') {
            const healRate = skill.healRate || 0.35;
            const hAmt = Math.floor(attacker.maxHp * healRate);
            attacker.hp = Math.min(attacker.maxHp, attacker.hp + hAmt);
            this.log(`🩷 ${attacker.charName} は「チエを呼ぶ」！ HPを ${hAmt} 回復し、2ターンの間自身の回避率がアップ！`, 'text-pink-300 font-bold');
            this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'heal', `+${hAmt}`);
            audioSystem.playHeal();
            if (skill.id === 'courtney_aegu' || skill.type === 'courtney_aegu_skill') {
                attacker.tempEvadeNext = true;
                this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'buff', '完全回避構え');
            }
            if (skill.type === 'momo_chie_skill' || skill.id === 'momo_chie') {
                attacker.momoEvaTurns = 2;
                this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'buff', '回避UP (2T)');
            } else if (skill.type === 'heal_buff') {
                attacker.buffDef *= 1.35;
                attacker.eva = Math.min(60, (attacker.eva || 10) + 15);
                this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'buff', '回避・防御UP!');
            }
            return;
        }

        if (skill.id === 'pasha_dark_nightmare' || skill.type === 'pasha_nightmare_skill') {
            defender.buffDef *= 0.5;
            defender.nightmareDefTurns = 3;
            this.log(`🖤💥 ${attacker.charName} の「アブソリュートナイトメア」！ 通常攻撃の1.3倍ダメージを与え、3ターンの間 ${defender.charName} の防御力を大幅ダウンさせた！`, 'text-purple-400 font-black text-base');
            if (typeof this.triggerCutin === 'function') {
                this.triggerCutin('🖤 アブソリュートナイトメア！', '強力攻撃 ＆ 敵の防御大幅ダウン！');
            }
            this.applyDamageSkill(attacker, defender, skill);
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
                    triggerNewBattleShake(e);
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

        if (skill.targetType === 'all_enemies' || skill.id === 'eggplant_burst' || skill.id === 'momo_eggplant_burst' || skill.type === 'eggplant_burst') {
            const targetTeam = (this.getCharacterTeam(attacker) === 'ally') ? this.enemies : this.allies;
            targetTeam.forEach(e => {
                if (e.hp > 0) {
                    if (skill.type === 'attack' || skill.type === 'special' || (skill.power && skill.power > 0) || skill.id === 'pasha_flash' || skill.id === 'eggplant_burst' || skill.id === 'momo_eggplant_burst' || skill.type === 'eggplant_burst') {
                        this.applyDamageSkill(attacker, e, skill);
                    } else {
                        e.buffAtk = Math.max(0.2, (e.buffAtk || 1.0) * 0.80);
                        e.buffDef = Math.max(0.2, (e.buffDef || 1.0) * 0.80);

                        this.log(`📉 ${e.charName} の攻撃力・防御力が低下した！`, 'text-cyan-300 font-bold');
                        this.triggerEffect(this.getCharacterTeam(e) === 'ally' ? 'Player' : 'Enemy', 'damage', 'DEBUFF');
                        triggerNewBattleShake(e);
                    }
                }
            });
            if (skill.id === 'eggplant_burst' || skill.id === 'momo_eggplant_burst' || skill.type === 'eggplant_burst') {
                this.log(`🐘 ${attacker.charName} の「超ナスちん乱舞」発動！！ 3ターンの間、全味方のクリティカル大幅UP ＆ 敵全体の回避率中DOWN！`, 'text-purple-300 font-bold text-base');
                if (typeof this.triggerCutin === 'function') {
                    this.triggerCutin('🍆 超ナスちん乱舞！', '敵全体に大ダメージ ＆ 味方会心大幅UP・敵回避DOWN！');
                }
                const alliesList = (this.getCharacterTeam(attacker) === 'ally') ? this.allies : this.enemies;
                alliesList.forEach(a => {
                    if (a.hp > 0) {
                        a.critRateBonus = (a.critRateBonus || 0) + 0.35;
                        a.critBuffTurns = 3;
                        this.triggerEffect(this.getCharacterTeam(a) === 'ally' ? 'Player' : 'Enemy', 'buff', '会心大幅UP', a);
                    }
                });
                const enemiesList = (this.getCharacterTeam(attacker) === 'ally') ? this.enemies : this.allies;
                enemiesList.forEach(e => {
                    if (e.hp > 0) {
                        e.evaDebuff = (e.evaDebuff || 0) + 15;
                        e.enemyEvaTurns = 3;
                        this.triggerEffect(this.getCharacterTeam(e) === 'ally' ? 'Player' : 'Enemy', 'damage', '回避DOWN', e);
                    }
                });
                attacker.isMiniZou = false;
                attacker.eggplantReady = false;
                this.log(`✨ ${attacker.charName} は元の姿に戻った。`, 'text-slate-400');
            }
            return;
        }

        if (skill.id === 'ndaihyo_analysis' || skill.type === 'debuff_attack') {
            this.applyDamageSkill(attacker, defender, skill);
            if (defender && defender.hp > 0) {
                defender.buffAtk = Math.max(0.2, (defender.buffAtk || 1.0) * 0.85);
                defender.buffDef = Math.max(0.2, (defender.buffDef || 1.0) * 0.85);

                this.log(`📉 ${defender.charName} の攻撃力・防御力が低下した！`, 'text-cyan-300 font-bold');
                this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'damage', 'DEBUFF');
                triggerNewBattleShake(defender);
            }
            return;
        }

        if (skill.id === 'asaiomizu_dig_skill' || skill.type === 'asaiomizu_dig_skill') {
            const dummyAttack = { name: '髪をかきあげる', type: 'attack', power: 1.15, isNormalAttack: true };
            const isAllyDig = this.getCharacterTeam(attacker) === 'ally';
            this.applyDamageSkill(attacker, defender, dummyAttack);
            attacker.digActive = true;
            attacker.digUsedTurn = this.turn;
            attacker.recordedSkill = null;
            if (this.p1 && attacker.id === 'asaiomizu') this.p1.recordedSkill = null;
            if (isAllyDig) {
                this.log(`🕳️ ${attacker.charName} はディグを発動！（通常攻撃に偽装しつつ相手の攻撃を待ち構える）`, 'text-cyan-300 font-bold');
                this.triggerEffect('Player', 'buff', 'ディグ構え');
            } else {
                this.log(`${attacker.charName} の 「髪をかきあげる」！`, 'text-slate-200 font-bold');
                this.triggerEffect('Enemy', 'damage', 'ヒット');
            }
            return;
        }

        if (skill.id === 'asaiomizu_club_skill' || skill.type === 'asaiomizu_club_skill') {
            attacker.critRateBonus = (attacker.critRateBonus || 0) + 0.40;
            attacker.asaiomizuCritTurns = 2;
            this.log(`🎵 ${attacker.charName} は「クラブに行く」でアゲアゲに踊り狂う！2ターンの間、クリティカル率が大幅向上！`, 'text-cyan-300 font-bold');
            this.triggerEffect(this.getCharacterTeam(attacker) === 'ally' ? 'Player' : 'Enemy', 'buff', 'クリティカル大幅UP!');
            audioSystem.playBuff();
            return;
        }

        if (skill.type === 'debuff') {
            if (defender && defender.hp > 0) {
                defender.buffAtk = Math.max(0.2, (defender.buffAtk || 1.0) * 0.80);
                defender.buffDef = Math.max(0.2, (defender.buffDef || 1.0) * 0.80);

                this.log(`📉 ${defender.charName} はデバフを受けた！`, 'text-cyan-300 font-bold');
                this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'damage', 'DEBUFF');
                triggerNewBattleShake(defender);
            }
            return;
        }

        if (skill.type === 'attack' || skill.type === 'special' || (skill.power && skill.power > 0)) {
            this.applyDamageSkill(attacker, defender, skill);
        } else {
            if (defender && this.getCharacterTeam(defender) !== this.getCharacterTeam(attacker)) {
                this.applyDamageSkill(attacker, defender, skill);
            } else {
                this.log(`✨ ${attacker.charName} の ${skill.name}！`, 'text-emerald-300 font-bold');
            }
        }
    }

    applyDamageSkill(attacker, defender, skill, isCounter = false) {
        if (defender.id === 'asaiomizu' && defender.digActive && defender.digUsedTurn === this.turn && !defender.recordedSkill) {
            if (skill.type === 'attack' || skill.type === 'special' || skill.type === 'debuff_attack' || skill.type === 'eggplant_burst' || (skill.power && skill.power > 0)) {
                defender.recordedSkill = { ...skill, targetType: skill.targetType || 'single_enemy' };
                defender.digActive = false;
                this.log(`${defender.charName} は受けていた相手の最初の攻撃技 [${skill.name}] を内部保存した！`, 'text-cyan-300 font-bold');
                this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'buff', 'スキルコピー成功！');
            }
        }
        const isStealth = (skill.id === 'pasha_dark_stealth');

        if (defender.tempEvadeNext && !isStealth) {
            defender.tempEvadeNext = false;
            this.log(`✨ ${defender.charName} は【ソウルソング】の無効化バリアにより、相手からの攻撃を1回完全に無効化した！`, 'text-emerald-300 font-bold text-base');
            audioSystem.playEvade();
            triggerNewBattleCharacterEffect(defender, 'miss', '完全無効化!');
            this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'miss', '完全無効化!');
            return;
        }

        if (!isStealth) {
            const momoEvaBonus = (defender.momoEvaTurns > 0) ? 20 : 0;
            const effectiveEva = Math.max(0, (defender.eva || 10) + (defender.iwabaEvaBonus || 0) + momoEvaBonus - (defender.evaDebuff || 0));
            const hitRate = 100 - effectiveEva;
            if (Math.random() * 100 > hitRate) {
                this.log(`🌀 ${defender.charName} は攻撃を回避した！`, 'text-sky-300');
                audioSystem.playEvade();
                triggerNewBattleCharacterEffect(defender, 'miss', '回避');
                if (this.currentTurnLogs && this.currentTurnLogs.length > 0) {
                    this.currentTurnLogs[this.currentTurnLogs.length - 1].effect = { side: this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', type: 'miss', text: '回避' };
                }
                if (defender.id === 'pasha_dark') {
                    defender.buffAtk *= 1.1;
                    this.log(`✨🦇 パシャ憎の回避アビリティ発動！ 攻撃力が 1.1倍 に跳ね上がった！（現在倍率: ${defender.buffAtk.toFixed(2)}倍）`, 'text-purple-300 font-bold');
                    this.triggerEffect(this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy', 'buff', '攻撃力1.1倍!');
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

        let effectiveCritRate = (attacker.critRate || 0.05) + (attacker.critRateBonus || 0);
        if (attacker.id === 'pasha' && attacker.pashaPassiveActive) {
            effectiveCritRate += 0.10;
        }
        if (Math.random() < effectiveCritRate) {
            damage = Math.floor(damage * 1.5);
            audioSystem.playCrit();
            this.log(`🔥✨ クリティカルヒット (${damage})！！`, 'text-yellow-300 font-bold');
            triggerNewBattleCharacterEffect(defender, 'crit', 'クリティカル！');
        }

        let extraHitTriggered = false;
        if (attacker.id === 'iwaba' && skill.isNormalAttack && defender.hp > 0) {
            if (Math.random() < 0.20) {
                extraHitTriggered = true;
            }
        }

        defender.hp = Math.max(0, defender.hp - damage);

        const side = this.getCharacterTeam(defender) === 'ally' ? 'Player' : 'Enemy';
        if (defender.buffDef > 1.0 || defender.defendBuffTurns > 0) {
            this.triggerEffect(side, 'def', '防御', defender);
        }
        let damageLog = skill.isNormalAttack ? `⚔️ ${attacker.charName}の${skill.name}！ ${defender.charName} に ${damage} のダメージ！` : `⚔ ${defender.charName} に ${damage} のダメージ！`;
        if (attacker.id === 'ndaihyo' && skill.isNormalAttack) {
            damageLog = `N高代表 の【バッティング】！ ${defender.charName} に ${damage} のダメージ！`;
        } else if (attacker.id === 'pasha' && skill.isNormalAttack) {
            damageLog = `パシャ憎 の【睨みつける】！ ${defender.charName} に ${damage} のダメージ！`;
        } else if (attacker.id === 'iwaba' && skill.isNormalAttack) {
            damageLog = `岩盤星人 の【ブレイクダンス】！ ${defender.charName} に ${damage} のダメージ！`;
        }
        this.log(damageLog, 'text-red-400 font-bold');
        this.triggerEffect(side, isCounter ? 'counter_damage' : 'damage', `-${damage}`, defender);
        audioSystem.playHit();
        triggerNewBattleShake(defender);

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
            triggerNewBattleShake(defender);
        }

        this.checkActiveAllyStatus();

        if (!isCounter && defender.id === 'asaiomizu' && defender.hp > 0 && Math.random() < 0.5) {
            this.executeCounter(defender, attacker);
        }
        this.checkPashaDarkMode(defender);
    }

    executeCounter(defender, attacker) {
        if (defender.hp <= 0) return;
        this.log(`⚡ ${defender.charName}のカウンター発動！ ${attacker.charName} に少量ダメージを与えた！`, 'text-cyan-300 font-bold');
        triggerNewBattleCharacterEffect(defender, 'counter', 'カウンター');
        const counterSkill = defender.skills.find(s => s.isNormalAttack) || defender.skills[0];
        this.applyDamageSkill(defender, attacker, counterSkill, true);
    }

    async checkWinner() {
        if (this.battleEnded) return true;

        const livingAllies = this.allies.filter(a => a.hp > 0);
        const livingEnemies = this.enemies.filter(e => e.hp > 0);

        let winnerText = '';
        let isEnded = false;

        if (livingAllies.length === 0 && livingEnemies.length === 0) {
            winnerText = '⚔️ 引き分け！';
            isEnded = true;
        } else if (livingEnemies.length === 0) {
            winnerText = `🎉 味方チームの勝利！`;
            isEnded = true;
            audioSystem.playVictory();
            await addDopa(150);
        } else if (livingAllies.length === 0) {
            winnerText = `💀 敵チームの勝利！`;
            isEnded = true;
            audioSystem.playDefeat();
        }

        if (isEnded) {
            this.battleEnded = true;
            this.stopTimer();
            this.stopElapsedTimer();
            if (this.onBattleEnd) this.onBattleEnd(winnerText);
            return true;
        }

        return false;
    }

    endTurnPhase() {
        this.turn++;
        const allFighters = [...this.allies, ...this.enemies];
        allFighters.forEach(p => {
            if (p.hp <= 0) return;
            Object.keys(p.cooldowns).forEach(key => {
                if (p.cooldowns[key] > 0) p.cooldowns[key]--;
            });
            if (p.iwabaBathTurns > 0) {
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
            if (p.buffAtkTurns > 0) {
                p.buffAtkTurns--;
                if (p.buffAtkTurns === 0) p.buffAtk = 1.0;
            }
            if (p.critBuffTurns > 0) {
                p.critBuffTurns--;
                if (p.critBuffTurns === 0) p.critRateBonus = 0;
            }
            if (p.enemyEvaTurns > 0) {
                p.enemyEvaTurns--;
                if (p.enemyEvaTurns === 0) p.evaDebuff = 0;
            }
            if (p.nightmareDefTurns > 0) {
                p.nightmareDefTurns--;
                if (p.nightmareDefTurns === 0) {
                    p.buffDef = Math.max(1.0, p.buffDef);
                    this.log(`📉 ${p.charName} の「アブソリュートナイトメア」による防御低下効果が終了した。`, 'text-slate-400 text-xs');
                }
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
            this.log('🔥 30ターン経過！サドンデスモード突入！', 'text-red-500 font-black text-center');
        }
    }

    triggerEffect(side, type, text, targetChar = null) {
        if (this.onVisualEffect) this.onVisualEffect(side, type, text);
        if (!targetChar) {
            if (side === 'Player') {
                targetChar = (this.currentAttacker && this.getCharacterTeam && this.getCharacterTeam(this.currentAttacker) === 'ally') ? this.currentAttacker : (this.p1 || this.allies?.[0]);
            } else if (side === 'Enemy') {
                targetChar = (this.currentAttacker && this.getCharacterTeam && this.getCharacterTeam(this.currentAttacker) === 'enemy') ? this.currentAttacker : (this.p1TargetChar && this.p1TargetChar.hp > 0 ? this.p1TargetChar : (this.enemies ? this.enemies.find(e => e.hp > 0) || this.enemies[0] : null));
            }
        }
        if (targetChar && typeof triggerNewBattleCharacterEffect === 'function') {
            triggerNewBattleCharacterEffect(targetChar, type, text);
        }
    }
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
        if (sortOrder === 'hp') { valA = a.hp; valB = b.hp; }
        else if (sortOrder === 'atk') { valA = a.atk; valB = b.atk; }
        else if (sortOrder === 'def') { valA = a.def; valB = b.def; }
        else if (sortOrder === 'critRate') { valA = a.critRate; valB = b.critRate; }
        else if (sortOrder === 'eva') { valA = a.eva; valB = b.eva; }
        else {
            const keys = Object.keys(CHARACTER_DATA);
            return keys.indexOf(a.id) - keys.indexOf(b.id);
        }
        return sortDir === 'desc' ? valB - valA : valA - valB;
    });

    const unlockedCount = playerState.unlockedChars.length;
    const totalCount = Object.keys(CHARACTER_DATA).length;

    let html = `
        <div class="w-full h-full flex flex-col items-center justify-between p-2 overflow-hidden select-none bg-slate-950 text-white">
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

        html += `
            <div onclick="openCharDetail('${c.id}', 'new_select', '${sortOrder}', '${sortDir}', ${onlyOwned})" 
                 class="pixel-box p-2 sm:p-3 bg-slate-900 cursor-pointer flex flex-col items-center justify-between border-2 transition-all ${isSelected ? 'border-amber-400 bg-amber-950/40 scale-105 shadow-lg' : 'border-slate-700 hover:border-slate-400'} ${!isUnlocked ? 'opacity-60 grayscale' : ''}">
                <canvas id="new-select-cvs-${c.id}" width="95" height="95" class="pixel-box bg-slate-950 mb-1 w-16 h-16 sm:w-24 sm:h-24"></canvas>
                <span class="text-[11px] sm:text-xs font-bold ${isSelected ? 'text-amber-300 font-pixel' : 'text-slate-200'} truncate max-w-full">${c.name}</span>
                <span class="text-[9px] text-slate-400 truncate max-w-full">${c.title}</span>
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

function executeNewBattleCourtneyCharge() {
    if (!activeNewBattle || activeNewBattle.battleEnded || activeNewBattle.isProcessing || activeNewBattle.p1Action !== null || activeNewBattle.waitingForOpponent || activeNewBattle.p1.isResting) return;
    if (activeNewBattle.p1.id !== 'courtney') return;
    if ((activeNewBattle.p1.courtneyChargeCount || 0) < 8) {
        activeNewBattle.submitAction(1, 'courtney_charge_only');
    } else {
        showModal("MAXチャージ", "これ以上溜められません！");
    }
}

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

    activeNewBattle = new Battle3v3Engine(playerCharId, enemyCharId, false, 1, null);

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

        const livingAllies = activeNewBattle.allies.filter(a => a.hp > 0);
        if (livingAllies.length === 0) {
            audioSystem.playDefeat();
            const html = `
                <div id="battle-result-overlay" class="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4 sm:p-6 text-center opacity-0 transition-opacity duration-1000">
                    <div class="pixel-box-dark p-6 sm:p-8 bg-slate-950/95 border-red-500 shadow-2xl max-w-md w-full flex flex-col items-center">
                        <div class="text-4xl sm:text-6xl font-pixel font-black text-red-500 mb-3 animate-pulse">LOSE</div>
                        <p class="text-xs sm:text-sm text-slate-300 font-mono mb-6">力尽きてしまいました……</p>
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
        } else {
            audioSystem.playVictory();
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
        if (activeNewBattle.onBattleEnd) activeNewBattle.onBattleEnd('💀 敵チームの勝利！');
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
        if (nextIdx === -1) {
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
                          (isD && (player.dopaChargeCount || 0) > 0) ||
                          player.eggplantReady;
        if (isCharged && charData.chargedImage) {
            return charData.chargedImage;
        }
        if (isA) return 'asaiomizu/asaiomizu2.webp';
        return charData.allImage || charData.image || player.image;
    };

    const isMyTurn = !activeNewBattle.battleEnded && !activeNewBattle.isProcessing && activeNewBattle.p1Action === null && !activeNewBattle.waitingForOpponent && !p1.isResting;

    let actorIndicator = '';
    if (activeNewBattle.isProcessing && activeNewBattle.currentAttacker) {
        const actor = activeNewBattle.currentAttacker;
        const isAlly = activeNewBattle.getCharacterTeam(actor) === 'ally';
        actorIndicator = `<div class="px-2 py-0.5 rounded border text-[10px] sm:text-xs font-bold font-pixel animate-pulse shadow ${isAlly ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300' : 'bg-red-950/90 border-red-500 text-red-300'}">⚡ 現在行動中：${isAlly ? '【味方】' : '【敵】'} ${actor.charName}</div>`;
    } else if (isMyTurn) {
        actorIndicator = `<div class="px-2 py-0.5 rounded border border-emerald-400 bg-emerald-950/90 text-emerald-300 text-[10px] sm:text-xs font-bold font-pixel animate-pulse shadow">🟢 自分のターン (${p1.charName})</div>`;
    } else {
        actorIndicator = `<div class="px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-400 text-[10px] sm:text-xs font-bold font-pixel">⏳ 相手のターン</div>`;
    }

    let commandAreaContent = '';
    if (newBattleViewMode === 'target_select') {
        commandAreaContent = `
            <div class="flex flex-col gap-1 w-full h-full justify-center text-center">
                <div class="font-pixel text-[11px] text-amber-300 font-bold animate-bounce">🎯 対象を選択してください</div>
                <button onclick="newBattleViewMode='main'; renderNewBattleScreen();" class="pixel-btn pixel-btn-danger py-1 px-2 text-[10px] font-bold font-pixel">✕ キャンセル</button>
            </div>
        `;
    } else if (newBattleViewMode === 'attack_select') {
        const normalSkill = p1.skills.find(s => s.isNormalAttack) || p1.skills[0];
        commandAreaContent = `
            <div class="flex flex-col gap-1 w-full h-full justify-center">
                <button onclick="executeNewBattleAction('${normalSkill.id}')" class="pixel-box bg-slate-900 border border-amber-400 p-1.5 text-left cursor-pointer shadow">
                    <div class="font-pixel text-[11px] text-amber-300 font-bold">${normalSkill.name}</div>
                    <div class="text-[9px] text-slate-300 font-mono truncate">${normalSkill.desc}</div>
                </button>
                <button onclick="executeNewBattleAction('back_to_main')" class="pixel-btn pixel-btn-warning py-1 px-2 text-[10px] font-bold font-pixel">◀ 戻る</button>
            </div>
        `;
    } else {
        const actionDisabledClass = !isMyTurn ? 'opacity-50 pointer-events-none filter grayscale' : '';
        commandAreaContent = `
            <div class="grid grid-cols-2 gap-1 w-full h-full relative z-20">
                <button onclick="executeNewBattleAction('normal_attack_click')" class="pixel-btn pixel-btn-primary py-1 px-1 text-[11px] font-bold flex flex-col items-center justify-center text-center shadow cursor-pointer ${actionDisabledClass}"><span>⚔️ 通常攻撃</span></button>
                <button onclick="executeNewBattleAction('run')" class="pixel-btn pixel-btn-danger py-1 px-1 text-[11px] font-bold flex flex-col items-center justify-center text-center shadow cursor-pointer relative z-30 pointer-events-auto"><span>🏃 逃げる</span></button>
                <button onclick="executeNewBattleAction('skill_click')" class="pixel-btn pixel-btn-success py-1 px-1 text-[11px] font-bold flex flex-col items-center justify-center text-center shadow cursor-pointer ${actionDisabledClass}"><span>✨ スキル</span></button>
                <button onclick="executeNewBattleAction('setting')" class="pixel-btn pixel-btn-warning py-1 px-1 text-[11px] font-bold flex flex-col items-center justify-center text-center shadow cursor-pointer relative z-30 pointer-events-auto"><span>⚙️ 設定</span></button>
            </div>
        `;
    }

    let skillModalHtml = '';
    if (isNewBattleSkillModalOpen) {
        const skills = [];
        p1.skills.forEach(s => {
            if (!s.isNormalAttack) skills.push(s);
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
            const isDopaChargeFull = (p1.id === 'dopagaking' && (s.id === 'dopa_charge' || s.id === 'dopa_charge_skill' || s.type === 'dopa_charge_skill') && (p1.dopaChargeCount || 0) >= 6);
            const isDopaObeyLocked = (p1.id === 'dopagaking' && (s.id === 'dopa_obey' || s.id === 'dopa_inheritance') && (p1.dopaChargeCount || 0) < 6);
            const isCourtneyLocked = (p1.id === 'courtney' && (s.id === 'courtney_feel' || s.id === 'courtney_charge_release') && (p1.courtneyChargeCount || 0) < 1);
            const disabled = cd > 0 || isDopaChargeFull || isDopaObeyLocked || isCourtneyLocked;
            return `
                <button onclick="${disabled ? '' : `executeNewBattleAction('${s.id}')`}" class="pixel-box bg-slate-900 border ${disabled ? 'border-slate-700 opacity-60 cursor-not-allowed' : 'border-emerald-400 hover:border-emerald-300 cursor-pointer'} p-3 text-left shadow flex flex-col justify-between w-full">
                    <div class="flex justify-between items-center w-full mb-1">
                        <span class="font-pixel text-xs text-emerald-300 font-bold">${s.name} ${cd > 0 ? `(CT:${cd})` : ''} ${s.id === 'pasha_roll' ? `(復活残り: ${2 - (p1.pashaRollReviveCount || 0)}回)` : ''} ${isDopaChargeFull ? '(MAX 6/6)' : ''}</span>
                    </div>
                    <div class="text-[11px] text-slate-200 font-mono">${s.desc}</div>
                </button>
            `;
        }).join('');

        skillModalHtml = `
            <div class="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onclick="if(event.target === this) { isNewBattleSkillModalOpen = false; renderNewBattleScreen(); }">
                <div class="pixel-box bg-slate-900 border-emerald-400 max-w-lg w-full p-4 text-center relative shadow-2xl flex flex-col max-h-[85vh]">
                    <div class="flex justify-between items-center border-b border-emerald-600/50 pb-3 mb-4">
                        <h3 class="text-base font-bold text-emerald-300 font-pixel">✨ スキル一覧</h3>
                        <button onclick="isNewBattleSkillModalOpen = false; renderNewBattleScreen();" class="pixel-btn pixel-btn-danger px-3 py-1 text-xs font-bold">✕ 閉じる</button>
                    </div>
                    <div class="space-y-2.5 flex-1 overflow-y-auto pr-1 text-left">${skillsHtml}</div>
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
        <div class="w-full h-full flex flex-col justify-between bg-slate-950 text-white relative select-none p-1 sm:p-2 overflow-hidden">
            ${skillModalHtml}
            ${choicePopupHtml}
            <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <img src="images/backnormal.webp" alt="backnormal" class="w-full h-full object-cover opacity-80">
            </div>
            <div class="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-900/95 rounded-lg border border-slate-700 shadow-md z-20 shrink-0">
                <div class="flex items-center gap-1.5 text-xs font-pixel text-amber-300"><span>⚔️ 3v3バトルモード</span></div>
                <div class="flex items-center justify-center flex-1">${actorIndicator}</div>
                <div class="flex items-center gap-2 text-xs font-mono">
                    <span>時間:<strong id="new-battle-elapsed-timer" class="text-sky-400 font-pixel">${activeNewBattle ? formatElapsedTime(activeNewBattle.elapsedSeconds) : '00:00'}</strong></span>
                    <span>T:<strong id="new-battle-turn" class="text-amber-400 font-pixel">${activeNewBattle.turn}</strong></span>
                    <span>制限:<strong id="new-battle-timer" class="text-emerald-400 font-pixel">${activeNewBattle.turnTimer}</strong>s</span>
                </div>
            </div>

            <div class="flex-1 flex items-center justify-between px-2 py-2 relative z-10 overflow-visible w-full">
                <!-- 味方チーム -->
                <div class="relative w-[47%] h-full flex items-end justify-between px-1 pb-2">
                    <div class="absolute left-1 top-1 text-[9px] text-emerald-400 font-pixel font-bold z-30">🛡️ 味方</div>
                    ${(() => {
                        const visualOrder = [
                            { c: allies[1], origIdx: 1, posType: 'left' },
                            { c: allies[0], origIdx: 0, posType: 'center' },
                            { c: allies[2], origIdx: 2, posType: 'right' }
                        ];
                        return visualOrder.map(({ c, origIdx, posType }) => {
                            if (!c) return '';
                            const pct = Math.max(0, Math.min(100, Math.round((c.hp / c.maxHp) * 100)));
                            const img = getCharImg(c, true);
                            const isTargetSelecting = (newBattleViewMode === 'target_select');
                            const isSelectable = isTargetSelecting && newBattleTargetSelectType === 'single_ally' && c.hp > 0;
                            const cardClickAttr = isSelectable 
                                ? `onclick="selectNewBattleTarget(${origIdx}, true)" style="cursor: pointer;"` 
                                : `onclick="if(typeof toggleBattleCharTooltip === 'function') toggleBattleCharTooltip('ally', ${origIdx}, event)" style="cursor: pointer;"`;
                            let posClasses = 'flex flex-col items-center justify-end relative transition-all duration-300 ';
                            if (posType === 'center') {
                                posClasses += 'w-[36%] h-[82%] z-30 scale-105 translate-y-3';
                            } else {
                                posClasses += 'w-[30%] h-[72%] z-25 opacity-95 -translate-y-6';
                            }
                            const interactiveStyle = isSelectable ? 'cursor-pointer ring-4 ring-amber-400 bg-amber-950/40 rounded-xl' : 'hover:brightness-110';
                            const deadStyle = c.hp <= 0 ? 'opacity-40 grayscale' : '';
                            return `
                                <div id="new-ally-char-${origIdx}" ${cardClickAttr} 
                                     data-char-team="ally" data-char-idx="${origIdx}"
                                     class="${posClasses} ${interactiveStyle} ${deadStyle}"
                                     title="タップして詳細を表示">
                                    <div class="absolute -top-5 left-1/2 -translate-x-1/2 w-[95%] min-w-[65px] z-40 bg-black/85 px-1 py-0.5 rounded border border-white/20 text-[8px] text-emerald-300 flex flex-col items-center">
                                        <div class="flex justify-between items-center w-full">
                                            <span class="truncate">${c.charName}</span>
                                            <span class="font-mono">${c.hp}/${c.maxHp}</span>
                                        </div>
                                        <div class="w-full bg-slate-900 h-1 rounded overflow-hidden mt-0.5"><div class="bg-emerald-400 h-full" style="width: ${pct}%;"></div></div>
                                    </div>
                                     <div id="new-ally-img-${origIdx}" class="w-full flex-1 flex items-center justify-center relative ${c.isShaking ? 'char-shake' : ''}">
                                         <img src="${img}" alt="${c.charName}" class="w-full h-full object-contain pointer-events-none" onerror="const fb='${charData.image || 'asaiomizu/asaiomizu.webp'}'; if(this.src!==fb) this.src=fb;">
                                         <div class="absolute bottom-0 left-0 z-30 flex flex-col gap-0.5 items-start pointer-events-none">
                                             ${typeof getStatusBadgesHtml === 'function' ? getStatusBadgesHtml(c, true) : ''}
                                         </div>
                                     </div>
                                </div>
                            `;
                        }).join('');
                    })()}
                </div>

                <div class="text-amber-400 font-pixel font-black text-lg">VS</div>

                <!-- 敵チーム -->
                <div class="relative w-[47%] h-full flex items-end justify-between px-1 pb-2">
                    <div class="absolute right-1 top-1 text-[9px] text-red-400 font-pixel font-bold z-30">⚔️ 敵</div>
                    ${(() => {
                        const visualOrder = [
                            { c: enemies[2], origIdx: 2, posType: 'left' },
                            { c: enemies[0], origIdx: 0, posType: 'center' },
                            { c: enemies[1], origIdx: 1, posType: 'right' }
                        ];
                        return visualOrder.map(({ c, origIdx, posType }) => {
                            if (!c) return '';
                            const pct = Math.max(0, Math.min(100, Math.round((c.hp / c.maxHp) * 100)));
                            const img = getCharImg(c, false);
                            const charData = CHARACTER_DATA[c.id] || {};
                            const isSelectable = newBattleViewMode === 'target_select' && (newBattleTargetSelectType === 'single_enemy' || newBattleTargetSelectSkillId === 'pasha_flash' || newBattleTargetSelectSkillId === 'asaiomizu_copied') && c.hp > 0;
                            const cardClickAttr = isSelectable 
                                ? `onclick="selectNewBattleTarget(${origIdx}, false)" style="cursor: pointer;"` 
                                : `onclick="if(typeof toggleBattleCharTooltip === 'function') toggleBattleCharTooltip('enemy', ${origIdx}, event)" style="cursor: pointer;"`;
                            let posClasses = 'flex flex-col items-center justify-end relative transition-all duration-300 ';
                            if (posType === 'center') {
                                posClasses += 'w-[36%] h-[82%] z-30 scale-105 translate-y-3';
                            } else {
                                posClasses += 'w-[30%] h-[72%] z-25 opacity-95 -translate-y-6';
                            }
                            const interactiveStyle = isSelectable ? 'cursor-pointer ring-4 ring-amber-400 bg-amber-950/40 rounded-xl' : 'hover:brightness-110';
                            const deadStyle = c.hp <= 0 ? 'opacity-40 grayscale' : '';
                            return `
                                <div id="new-enemy-char-${origIdx}" ${cardClickAttr} 
                                     data-char-team="enemy" data-char-idx="${origIdx}"
                                     class="${posClasses} ${interactiveStyle} ${deadStyle}"
                                     title="タップして詳細を表示">
                                    <div class="absolute -top-5 left-1/2 -translate-x-1/2 w-[95%] min-w-[65px] z-40 bg-black/85 px-1 py-0.5 rounded border border-white/20 text-[8px] text-red-300 flex flex-col items-center">
                                        <div class="flex justify-between items-center w-full">
                                            <span class="truncate">${c.charName}</span>
                                            <span class="font-mono">${c.hp}/${c.maxHp}</span>
                                        </div>
                                        <div class="w-full bg-slate-900 h-1 rounded overflow-hidden mt-0.5"><div class="bg-red-500 h-full" style="width: ${pct}%;"></div></div>
                                    </div>
                                     <div id="new-enemy-img-${origIdx}" class="w-full flex-1 flex items-center justify-center relative ${c.isShaking ? 'char-shake' : ''}">
                                         <img src="${img}" alt="${c.charName}" class="w-full h-full object-contain pointer-events-none" style="transform: scaleX(-1);" onerror="const fb='${charData.image || 'asaiomizu/asaiomizu.webp'}'; if(this.src!==fb) this.src=fb;">
                                         <div class="absolute bottom-0 right-0 z-30 flex flex-col gap-0.5 items-end pointer-events-none">
                                             ${typeof getStatusBadgesHtml === 'function' ? getStatusBadgesHtml(c, false) : ''}
                                         </div>
                                     </div>
                                </div>
                            `;
                        }).join('');
                    })()}
                </div>
            </div>

            <div class="w-full grid grid-cols-1 sm:grid-cols-12 gap-1.5 h-20 sm:h-24 shrink-0 z-10">
                <div class="sm:col-span-3 bg-slate-900/95 border-2 border-slate-700 rounded-lg p-1.5 flex items-center gap-2 shadow-md h-full overflow-hidden relative backdrop-blur-sm">
                    <canvas id="new-battle-profile-icon" width="40" height="40" class="pixel-box bg-slate-950 rounded shrink-0 w-9 h-9 sm:w-10 sm:h-10 border border-amber-500/50 shadow-inner object-contain"></canvas>
                    <div class="flex flex-col justify-between overflow-hidden flex-1 min-w-0 h-full py-0.5">
                        <div class="text-[11px] sm:text-xs font-bold text-amber-300 font-pixel truncate drop-shadow-sm" title="${playerState.playerName || 'ファイター'}">
                            ${playerState.playerName || 'ファイター'}
                        </div>
                        <div class="flex items-center justify-between gap-1 w-full border-t border-slate-800/80 pt-1 mt-auto">
                            <div class="text-[9px] sm:text-[10px] text-slate-300 font-mono truncate flex items-center gap-1">
                                <span class="text-amber-400 font-bold">DOPA</span>
                                <span class="text-amber-300 font-bold font-pixel">${typeof formatDopa === 'function' ? formatDopa(playerState.dopa) : (playerState.dopa || 0)}</span>
                            </div>
                            <div id="battle-battery-status" class="shrink-0 bg-slate-950/80 border border-slate-800 px-1 py-0.5 rounded flex items-center justify-center">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="sm:col-span-5 bg-slate-900/95 border-2 border-slate-700 rounded-lg p-1.5 flex flex-col h-full shadow-md overflow-hidden">
                    <div class="text-[9px] text-amber-400 font-bold font-pixel mb-0.5 shrink-0">📜 BATTLE LOG</div>
                    <div class="w-full flex-1 bg-slate-950 border border-slate-800 rounded p-1 text-[9px] sm:text-[10px] font-mono text-slate-200 overflow-y-auto shadow-inner" id="new-battle-log">
                        ${(activeNewBattle.battleLogs && activeNewBattle.battleLogs.length > 0) ? activeNewBattle.battleLogs.map(l => `<div class="p-0.5">${l.msg}</div>`).join('') : "3v3バトル開始！"}
                    </div>
                </div>
                <div class="sm:col-span-4 bg-slate-900/95 border-2 border-slate-700 rounded-lg p-1.5 flex flex-col justify-center h-full shadow-md relative overflow-hidden">
                    ${commandAreaContent}
                </div>
            </div>
        </div>
    `;

    const profileIconCvs = document.getElementById('new-battle-profile-icon');
    if (profileIconCvs && typeof CharacterRenderer !== 'undefined' && CharacterRenderer.drawCharacter) {
        CharacterRenderer.drawCharacter(profileIconCvs, playerState.selectedIcon || 'dopagaking');
    }

    if (typeof initBatteryManager === 'function') {
        initBatteryManager();
    }

    const logEl = document.getElementById('new-battle-log');
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
}

function appendNewBattleLog(text, colorClass = 'text-slate-200') {
    const logEl = document.getElementById('new-battle-log');
    if (logEl) {
        const line = document.createElement('div');
        line.className = `p-0.5 text-[9px] font-mono ${colorClass}`;
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
    if (!activeNewBattle || activeNewBattle.battleEnded || activeNewBattle.isProcessing || activeNewBattle.p1Action !== null) return;
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
    if (skill && (skill.targetType === 'single_enemy' || skill.targetType === 'single_ally' || skill.id === 'pasha_flash' || actionType === 'asaiomizu_copied' || actionType === 'dopa_obey_copy' || (!['self', 'all_enemies', 'all_allies'].includes(skill.targetType) && skill.type !== 'heal' && skill.type !== 'buff'))) {
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

function openNewBattleSettingsPanel() {
    audioSystem.playSelect();
    openSettingsPanel();
}



function getNewBattleCharacterDOMElement(char) {
    if (!activeNewBattle) return null;
    if (activeNewBattle.allies && activeNewBattle.allies.includes(char)) {
        const idx = activeNewBattle.allies.indexOf(char);
        return document.getElementById(`new-ally-char-${idx}`) || document.getElementById(`ally-char-${idx}`);
    }
    if (activeNewBattle.enemies && activeNewBattle.enemies.includes(char)) {
        const idx = activeNewBattle.enemies.indexOf(char);
        return document.getElementById(`new-enemy-char-${idx}`) || document.getElementById(`enemy-char-${idx}`);
    }
    return null;
}

function triggerNewBattleCharacterEffect(targetChar, type, text) {
    const targetEl = getNewBattleCharacterDOMElement(targetChar);
    console.log("エフェクト実行 (battle-3v3.js):", { targetChar, type, text, targetEl });
    if (!targetEl) return;

    const pop = document.createElement('div');
    pop.className = 'absolute font-pixel font-bold floating-text pointer-events-none';
    pop.style.zIndex = '9999';
    pop.style.pointerEvents = 'none';

    let color = 'text-white text-[10px]';
    if (type === 'miss') {
        color = 'text-sky-300 text-xs sm:text-sm font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
    } else if (type === 'crit') {
        color = 'text-yellow-300 text-xs sm:text-sm font-bold font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
    } else if (type === 'def' || type === 'defense') {
        color = 'text-blue-300 text-xs sm:text-sm font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
    } else if (type === 'damage') {
        color = 'text-red-400 text-sm sm:text-base font-bold font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
    } else if (type === 'heal') {
        color = 'text-emerald-400 text-sm sm:text-base font-bold font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
    } else if (type === 'buff') {
        color = 'text-amber-300 text-xs sm:text-sm font-bold font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
    } else if (type === 'counter') {
        color = 'text-cyan-300 text-xs sm:text-sm font-bold font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
    } else if (type === 'counter_damage') {
        color = 'text-cyan-400 text-sm sm:text-base font-bold font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
    } else if (type === 'pink') {
        color = 'text-pink-400 text-sm sm:text-base font-bold font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
    }

    pop.classList.add(...color.split(' '));
    pop.innerText = text;

    const rect = targetEl.getBoundingClientRect();
    pop.style.position = 'fixed';
    pop.style.left = `${rect.left + rect.width / 2}px`;
    if (type === 'miss' || type === 'crit' || type === 'def' || type === 'defense') {
        pop.style.top = `${rect.top + rect.height / 3}px`;
    } else if (type === 'damage' || type === 'heal') {
        pop.style.top = `${rect.top + rect.height / 4}px`;
    } else {
        pop.style.top = `${rect.top - 10}px`;
    }
    pop.style.transform = 'translateX(-50%)';

    document.body.appendChild(pop);

    setTimeout(() => pop.remove(), 1200);
}

if (typeof window.getStatusBadgesHtml === 'undefined') {
    window.getStatusBadgesHtml = function(p, isAlly = true) {
        let badges = '';
        if (p.isDarkMode) {
            badges += `<span class="bg-purple-950/95 text-purple-300 border-2 border-purple-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform rotate-1 inline-block">🌙 ダークモード(ATK+15%)</span>`;
        }
        if (p.pashaDarkEvaBonus && p.pashaDarkEvaBonus > 0) {
            badges += `<span class="bg-purple-950/95 text-purple-300 border-2 border-purple-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shadow-md transform rotate-1 inline-block">闇の回避強化 [避+${p.pashaDarkEvaBonus}% / 最大+50%]</span>`;
        }
        if (p.courtneyChargeCount && p.courtneyChargeCount > 0) {
            if (p.courtneyChargeCount >= 8) {
                badges += `<span class="bg-pink-600 text-white border-2 border-pink-300 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-pixel font-bold shadow-lg animate-bounce inline-block">🔥 MAXチャージ(8/8)</span>`;
            } else {
                badges += `<span class="bg-pink-900/95 text-pink-200 border-2 border-pink-400 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-pixel font-bold shadow-lg animate-pulse inline-block">💖 チャージ(${p.courtneyChargeCount}/8)</span>`;
            }
        }
        if (p.dopaChargeCount && p.dopaChargeCount > 0) {
            if (p.dopaChargeCount >= 6) {
                badges += `<span class="bg-amber-600 text-white border-2 border-amber-300 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-pixel font-bold shadow-lg animate-bounce inline-block">👑 MAXチャージ(6/6)</span>`;
            } else {
                badges += `<span class="bg-amber-950/95 text-amber-300 border-2 border-amber-400 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-pixel font-bold shadow-md transform -rotate-2 inline-block">チャージ(${p.dopaChargeCount}/6)</span>`;
            }
        }
        return badges;
    };
}

// Window bindings
window.renderNewCharSelectScreen = renderNewBattleCharSelectScreen;
window.onNewCharSelectSortChange = onNewCharSelectSortChange;
window.toggleNewCharSelectSortDir = toggleNewCharSelectSortDir;
window.toggleNewCharSelectOwnedFilter = toggleNewCharSelectOwnedFilter;
window.executeNewBattleCourtneyCharge = executeNewBattleCourtneyCharge;
window.handleNewBattleContinueChoice = handleNewBattleContinueChoice;
window.selectNewBattleTarget = selectNewBattleTarget;
window.triggerNewBattleShake = triggerNewBattleShake;

function getNewBattleCharacterKey(char) {
    if (!activeNewBattle || !char) return null;
    const enemyIdx = activeNewBattle.enemies.findIndex(e => e === char);
    if (enemyIdx !== -1) return `enemy_${enemyIdx}`;
    const allyIdx = activeNewBattle.allies.findIndex(a => a === char);
    if (allyIdx !== -1) return `ally_${allyIdx}`;
    return null;
}

function triggerNewBattleShake(targetChar) {
    if (!targetChar) return;
    targetChar.isShaking = true;
    if (activeNewBattle && activeNewBattle.onStateChange) {
        activeNewBattle.onStateChange(activeNewBattle);
    } else if (typeof renderNewBattleScreen === 'function') {
        renderNewBattleScreen();
    }

    setTimeout(() => {
        targetChar.isShaking = false;
        if (activeNewBattle && activeNewBattle.onStateChange) {
            activeNewBattle.onStateChange(activeNewBattle);
        } else if (typeof renderNewBattleScreen === 'function') {
            renderNewBattleScreen();
        }
    }, 350);
}

let battleTooltipTimer = null;
window._currentTooltipChar = null;

function refreshActiveBattleTooltip() {
    const tooltip = document.getElementById('battle-char-tooltip');
    if (tooltip && tooltip.style.display === 'block' && window._currentTooltipChar && activeNewBattle) {
        let team = 'ally';
        let idx = activeNewBattle.allies ? activeNewBattle.allies.indexOf(window._currentTooltipChar) : -1;
        if (idx === -1 && activeNewBattle.enemies) {
            team = 'enemy';
            idx = activeNewBattle.enemies.indexOf(window._currentTooltipChar);
        }
        if (idx !== -1) {
            showBattleCharTooltip(team, idx, null);
        }
    }
}
window.refreshActiveBattleTooltip = refreshActiveBattleTooltip;

function showBattleCharTooltip(teamOrChar, posIdxOrIsAlly, event) {
    if (typeof newBattleViewMode !== 'undefined' && newBattleViewMode === 'target_select') {
        hideBattleCharTooltip();
        return;
    }
    
    if (battleTooltipTimer) {
        clearTimeout(battleTooltipTimer);
        battleTooltipTimer = null;
    }

    let c = null;
    let isAlly = true;

    if (typeof teamOrChar === 'string' && activeNewBattle) {
        isAlly = (teamOrChar === 'ally');
        c = isAlly ? (activeNewBattle.allies && activeNewBattle.allies[posIdxOrIsAlly]) : (activeNewBattle.enemies && activeNewBattle.enemies[posIdxOrIsAlly]);
    } else {
        c = teamOrChar;
        isAlly = posIdxOrIsAlly;
    }

    let tooltip = document.getElementById('battle-char-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'battle-char-tooltip';
        tooltip.className = 'fixed pixel-box bg-slate-900 border-amber-400 p-2 text-xs text-slate-100 shadow-2xl z-[99999]';
        document.body.appendChild(tooltip);

        tooltip.addEventListener('mouseenter', () => {
            if (battleTooltipTimer) {
                clearTimeout(battleTooltipTimer);
                battleTooltipTimer = null;
            }
        });
        tooltip.addEventListener('mouseleave', () => {
            hideBattleCharTooltip();
        });
    }
    if (!c) return;

    const charTitle = c.title || (typeof CHARACTER_DATA !== 'undefined' && CHARACTER_DATA[c.id] && CHARACTER_DATA[c.id].title) || '';

    // 攻撃力計算
    const buffAtkMult = c.buffAtk || 1.0;
    const effectiveAtk = Math.max(1, Math.round(c.atk * buffAtkMult));
    let atkHtml = `<b class="text-amber-400 font-bold">${effectiveAtk}</b>`;
    if (buffAtkMult < 0.99) {
        atkHtml = `<b class="text-red-400 font-bold">${effectiveAtk}</b> <span class="text-[8px] text-red-400 font-sans">↓</span>`;
    } else if (buffAtkMult > 1.01) {
        atkHtml = `<b class="text-emerald-400 font-bold">${effectiveAtk}</b> <span class="text-[8px] text-emerald-400 font-sans">↑</span>`;
    }

    // 防御力計算
    const buffDefMult = c.buffDef || 1.0;
    const effectiveDef = Math.max(0, Math.round(c.def * buffDefMult));
    let defHtml = `<b class="text-blue-400 font-bold">${effectiveDef}</b>`;
    if (buffDefMult < 0.99) {
        defHtml = `<b class="text-red-400 font-bold">${effectiveDef}</b> <span class="text-[8px] text-red-400 font-sans">↓</span>`;
    } else if (buffDefMult > 1.01) {
        defHtml = `<b class="text-emerald-400 font-bold">${effectiveDef}</b> <span class="text-[8px] text-emerald-400 font-sans">↑</span>`;
    }

    // 会心率計算
    const critBonus = c.critRateBonus || 0;
    const effectiveCrit = Math.max(0, Math.round(((c.critRate || 0.05) + critBonus) * 100));
    let critHtml = `<b class="text-yellow-400 font-bold">${effectiveCrit}%</b>`;
    if (critBonus < -0.01) {
        critHtml = `<b class="text-red-400 font-bold">${effectiveCrit}%</b> <span class="text-[8px] text-red-400 font-sans">↓</span>`;
    } else if (critBonus > 0.01) {
        critHtml = `<b class="text-emerald-400 font-bold">${effectiveCrit}%</b> <span class="text-[8px] text-emerald-400 font-sans">↑</span>`;
    }

    // 回避率計算
    const evaDebuff = c.evaDebuff || 0;
    const iwabaEva = c.iwabaEvaBonus || 0;
    const momoEva = (c.momoEvaTurns > 0) ? 20 : 0;
    const netEvaChange = iwabaEva + momoEva - evaDebuff;
    const effectiveEva = Math.max(0, (c.eva || 10) + netEvaChange);
    let evaHtml = `<b class="text-sky-400 font-bold">${effectiveEva}%</b>`;
    if (netEvaChange < 0) {
        evaHtml = `<b class="text-red-400 font-bold">${effectiveEva}%</b> <span class="text-[8px] text-red-400 font-sans">↓</span>`;
    } else if (netEvaChange > 0) {
        evaHtml = `<b class="text-emerald-400 font-bold">${effectiveEva}%</b> <span class="text-[8px] text-emerald-400 font-sans">↑</span>`;
    }

    const badgesHtml = typeof getStatusBadgesHtml === 'function' ? getStatusBadgesHtml(c, isAlly) : '';

    let statsHtml = `
        <div class="font-bold text-amber-300 font-pixel text-xs mb-1 border-b border-amber-600/50 pb-1 flex justify-between items-center gap-2">
            <span>${c.charName}</span>
            <span class="text-[9px] text-slate-400 font-sans">${charTitle}</span>
        </div>
        <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-200 mb-1 font-mono">
            <div>HP: <b class="text-emerald-400">${c.hp}/${c.maxHp}</b></div>
            <div>攻撃: ${atkHtml}</div>
            <div>防御: ${defHtml}</div>
            <div>会率: ${critHtml}</div>
            <div>回避: ${evaHtml}</div>
        </div>
        ${c.pashaDarkEvaBonus ? `<div class="text-[9px] text-purple-300 font-bold mb-1 animate-pulse">🌙 闇の回避強化: +${c.pashaDarkEvaBonus}% (最大+50%)</div>` : ''}
        ${c.id === 'pasha' ? `<div class="text-[9px] text-purple-300 font-bold mb-1">🌙 ダークモード: HP50未満で半浸闇化へチェンジ＆ATK+15%</div>` : ''}
        ${badgesHtml ? `<div class="flex flex-wrap gap-1 my-1 border-t border-slate-800 pt-1">${badgesHtml}</div>` : ''}
        <div class="border-t border-slate-700 pt-1">
            <div class="text-[9px] font-bold text-amber-200 mb-1">✨ 所持スキル一覧</div>
            <div class="space-y-1 tooltip-skill-scroll">
    `;

    (c.skills || []).forEach(s => {
        let cdText = '';
        if (isAlly) {
            const cd = c.cooldowns && c.cooldowns[s.id] ? c.cooldowns[s.id] : 0;
            if (cd > 0) cdText = ` <span class="text-red-400">(CT:${cd})</span>`;
        }
        statsHtml += `
            <div class="bg-slate-950 p-1 rounded border border-slate-800">
                <div class="font-bold text-emerald-300 text-[10px]">${s.name}${cdText}</div>
                <div class="text-[9px] text-slate-300">${s.desc}</div>
            </div>
        `;
    });

    statsHtml += `
            </div>
        </div>
    `;

    tooltip.innerHTML = statsHtml;
    tooltip.classList.remove('hidden');
    tooltip.style.display = 'block';

    const clientX = event && (event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : (event.changedTouches && event.changedTouches[0] ? event.changedTouches[0].clientX : null)));
    const clientY = event && (event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : (event.changedTouches && event.changedTouches[0] ? event.changedTouches[0].clientY : null)));

    let left = (clientX !== null && clientX !== undefined) ? clientX + 15 : window.innerWidth / 2 - 140;
    let top = (clientY !== null && clientY !== undefined) ? clientY - 40 : window.innerHeight / 2 - 100;

    if (left + 260 > window.innerWidth) {
        left = Math.max(10, (clientX || window.innerWidth / 2) - 275);
    }
    if (top + 220 > window.innerHeight) {
        top = Math.max(10, window.innerHeight - 230);
    }
    if (top < 10) top = 10;

    tooltip.style.left = `${Math.max(10, left)}px`;
    tooltip.style.top = `${Math.max(10, top)}px`;
}

function toggleBattleCharTooltip(teamOrChar, posIdxOrIsAlly, event) {
    if (event) {
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }
    let targetChar = null;
    let isAlly = true;

    if (typeof teamOrChar === 'string' && activeNewBattle) {
        isAlly = (teamOrChar === 'ally');
        targetChar = isAlly ? (activeNewBattle.allies && activeNewBattle.allies[posIdxOrIsAlly]) : (activeNewBattle.enemies && activeNewBattle.enemies[posIdxOrIsAlly]);
    } else {
        targetChar = teamOrChar;
        isAlly = posIdxOrIsAlly;
    }

    const tooltip = document.getElementById('battle-char-tooltip');
    if (tooltip && tooltip.style.display === 'block' && window._currentTooltipChar === targetChar) {
        hideBattleCharTooltip();
        window._currentTooltipChar = null;
    } else {
        window._currentTooltipChar = targetChar;
        showBattleCharTooltip(teamOrChar, posIdxOrIsAlly, event);
    }
}

function hideBattleCharTooltip() {
    if (battleTooltipTimer) {
        clearTimeout(battleTooltipTimer);
        battleTooltipTimer = null;
    }
    const tooltip = document.getElementById('battle-char-tooltip');
    if (tooltip) {
        tooltip.classList.add('hidden');
        tooltip.style.display = 'none';
    }
    window._currentTooltipChar = null;
}

function triggerCameraFlashGlobalEffect() {
    audioSystem.playSpecial();
    const flashEl = document.createElement('div');
    flashEl.className = 'fixed inset-0 bg-white animate-screen-flash z-[99999]';
    document.body.appendChild(flashEl);
    setTimeout(() => flashEl.remove(), 500);
}
window.triggerCameraFlashGlobalEffect = triggerCameraFlashGlobalEffect;

window.showBattleCharTooltip = showBattleCharTooltip;
window.toggleBattleCharTooltip = toggleBattleCharTooltip;
window.hideBattleCharTooltip = hideBattleCharTooltip;

if (typeof window._battleTooltipInitialized === 'undefined') {
    window._battleTooltipInitialized = true;

    document.addEventListener('mouseover', (e) => {
        if (!activeNewBattle || activeNewBattle.battleEnded) return;
        if (typeof newBattleViewMode !== 'undefined' && newBattleViewMode === 'target_select') return;
        const charCard = e.target.closest('[data-char-team]');
        if (charCard) {
            const team = charCard.getAttribute('data-char-team');
            const idx = parseInt(charCard.getAttribute('data-char-idx'), 10);
            const c = team === 'ally' ? (activeNewBattle.allies && activeNewBattle.allies[idx]) : (activeNewBattle.enemies && activeNewBattle.enemies[idx]);
            if (c) {
                showBattleCharTooltip(c, team === 'ally', e);
            }
        }
    });

    document.addEventListener('mouseout', (e) => {
        const charCard = e.target.closest('[data-char-team]');
        if (charCard) {
            const tooltip = document.getElementById('battle-char-tooltip');
            if (tooltip && e.relatedTarget && tooltip.contains(e.relatedTarget)) {
                return;
            }
            hideBattleCharTooltip();
        }
    });

    document.addEventListener('click', (e) => {
        const charCard = e.target.closest('[data-char-team]');
        const tooltip = document.getElementById('battle-char-tooltip');
        if (!charCard && (!tooltip || !tooltip.contains(e.target))) {
            hideBattleCharTooltip();
        }
    });

    document.addEventListener('touchstart', (e) => {
        if (!activeNewBattle || activeNewBattle.battleEnded) return;
        if (typeof newBattleViewMode !== 'undefined' && newBattleViewMode === 'target_select') return;
        const charCard = e.target.closest('[data-char-team]');
        const tooltip = document.getElementById('battle-char-tooltip');

        if (charCard) {
            const team = charCard.getAttribute('data-char-team');
            const idx = parseInt(charCard.getAttribute('data-char-idx'), 10);
            const c = team === 'ally' ? (activeNewBattle.allies && activeNewBattle.allies[idx]) : (activeNewBattle.enemies && activeNewBattle.enemies[idx]);
            if (c) {
                showBattleCharTooltip(c, team === 'ally', e);
                battleTooltipTimer = setTimeout(() => {
                    hideBattleCharTooltip();
                }, 3000);
            }
        } else if (tooltip && tooltip.contains(e.target)) {
            if (battleTooltipTimer) {
                clearTimeout(battleTooltipTimer);
                battleTooltipTimer = setTimeout(() => {
                    hideBattleCharTooltip();
                }, 3000);
            }
        } else {
            hideBattleCharTooltip();
        }
    }, { passive: true });
}

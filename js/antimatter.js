function updateAntimatterDisplay() {
    document.getElementById('antimatter').textContent = Utils.formatOmegaNum(Game.state.antimatter);
    updateNewEraButtonState();
    // 更新反物质软上限提示
    updateAntimatterSoftCapNotice();
    // 更新反物质仓库升级按钮状态
    updateExpandAntimatterButtonState();
    // 更新反物质爆炸升级按钮状态
    updateAntimatterExplosionButtonState();
    // 更新反物质生成速率显示
    updateAntimatterProductionRate();
}

// 更新反物质生成速率显示
function updateAntimatterProductionRate() {
    const productionElement = document.getElementById('antimatterProduction');
    if (!productionElement || !Game || !Game.state) return;

    // 计算基础反物质生产速率
    let baseProduction = Game.state.currentMatter.div(new OmegaNum('5e8'));

    // 应用反物质爆炸升级效果
    if (Game.state.antimatterExplosionUnlocked) {
        baseProduction = baseProduction.mul(Game.state.antimatterMultiplier);
    }

    // 应用软上限
    if (Game.state.antimatter.gte(new OmegaNum(500))) {
        // 安全地计算对数值，避免超大数字导致的问题
        let logValue;
        try {
            const antimatterRatio = Game.state.antimatter.div(new OmegaNum(500));
            if (antimatterRatio.gte(new OmegaNum('1e100'))) {
                // 对于极大数字，使用固定的高对数值
                logValue = 100;
            } else {
                const antimatterValue = antimatterRatio.toNumber();
                if (isFinite(antimatterValue) && antimatterValue > 0) {
                    logValue = Math.log10(antimatterValue);
                } else {
                    logValue = 50; // 默认高对数值
                }
            }
        } catch (e) {
            logValue = 50; // 出错时使用默认值
        }
        
        // 如果有扩大反物质仓库升级，减益较为缓和
        if (Game.state.upgrades && Game.state.upgrades.antimatterWarehouse) {
            // 缓和的软上限计算公式
            if (logValue <= 0) {
                // 基础减益
                const softCapDebuff = 0.8; // 只削减20%
                baseProduction = baseProduction.mul(softCapDebuff);
            } else {
                // 使用较缓和的对数公式，限制最大减益
                const softCapDebuff = Math.max(0.1, 0.8 / (1 + 0.5 * Math.min(logValue, 20)));
                baseProduction = baseProduction.mul(softCapDebuff);
            }
        } else {
            // 未升级版本，减益较为明显但不过分
            if (logValue <= 0) {
                // 基础减益
                const softCapDebuff = 0.6; // 削减40%
                baseProduction = baseProduction.mul(softCapDebuff);
            } else {
                // 使用平方根而非平方，减轻减益强度，限制最大减益
                const softCapDebuff = Math.max(0.05, 0.6 / (1 + 0.7 * Math.min(logValue, 30)));
                baseProduction = baseProduction.mul(softCapDebuff);
            }
        }
    }
    
    // 挑战8奖励：反物质产量+50%
    if (Game.state.challenge8Reward) {
        baseProduction = baseProduction.mul(1.5);
    }
    
    // 应用时间能量增益
    if (Game.state.timeEnergyMultiplier && Game.state.timeEnergyMultiplier.gt(1)) {
        baseProduction = baseProduction.mul(Game.state.timeEnergyMultiplier);
    }
    
    // 应用黑洞升级的反物质增益效果
    if (window.BlackholeUpgrades) {
        const antimatterBoost = BlackholeUpgrades.getAntimatterBoostMultiplier();
        if (antimatterBoost.gt(1)) {
            baseProduction = baseProduction.mul(antimatterBoost);
        }
    }

    // 更新显示
    productionElement.textContent = Utils.formatOmegaNum(baseProduction);
}

// 新增函数：更新反物质软上限提示
function updateAntimatterSoftCapNotice() {
    const softCapNotice = document.getElementById('antimatterSoftCapNotice');
    if (!softCapNotice) return;
    
    // 检查反物质是否超过软上限阈值（500）
    if (Game.state.antimatter.gte(new OmegaNum(500))) {
        let debuff;
        
        // 安全地计算对数值，避免超大数字导致的问题
        let logValue;
        try {
            const antimatterRatio = Game.state.antimatter.div(new OmegaNum(500));
            if (antimatterRatio.gte(new OmegaNum('1e100'))) {
                // 对于极大数字，使用固定的高对数值
                logValue = 100;
            } else {
                const antimatterValue = antimatterRatio.toNumber();
                if (isFinite(antimatterValue) && antimatterValue > 0) {
                    logValue = Math.log10(antimatterValue);
                } else {
                    logValue = 50; // 默认高对数值
                }
            }
        } catch (e) {
            logValue = 50; // 出错时使用默认值
        }

        // 如果有扩大反物质仓库升级，减益较为缓和
        if (Game.state.upgrades && Game.state.upgrades.antimatterWarehouse) {
            // 缓和的软上限计算公式
            if (logValue <= 0) {
                // 基础减益
                debuff = 0.8; // 只削减20%
            } else {
                // 使用较缓和的对数公式，限制最大减益
                debuff = Math.max(0.1, 0.8 / (1 + 0.5 * Math.min(logValue, 20)));
            }
        } else {
            // 未升级版本，减益较为明显但不过分
            if (logValue <= 0) {
                // 基础减益
                debuff = 0.6; // 削减40%
            } else {
                // 使用更温和的公式，限制最大减益
                debuff = Math.max(0.05, 0.6 / (1 + 0.7 * Math.min(logValue, 30)));
            }
        }

        softCapNotice.style.display = '';
        softCapNotice.innerHTML = `反物质产量受软上限限制：×${Utils.formatOmegaNum ? Utils.formatOmegaNum(new OmegaNum(debuff), 4) : debuff.toFixed(4)}`;
    } else {
        softCapNotice.style.display = 'none';
    }
}



function updateNewEraButtonState() {
    if (!Game || !Game.state) return;
    const button = document.getElementById('newEraButton');

    if (!button) return;


    if (Game.state.newEraUnlocked) {
        button.textContent = '已购买';
        button.classList.add('purchased');
        button.classList.remove('affordable');
        button.disabled = true;


    } else if (Game.state.antimatter.gte(new OmegaNum('100'))) {
        button.textContent = '购买升级';
        button.classList.add('affordable');
        button.classList.remove('purchased');
        button.disabled = false;

    } else {
        button.textContent = '购买升级';
        button.classList.remove('affordable', 'purchased');
        button.disabled = false;
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function updateAllUpgradePrices() {
}

// 使用事件委托确保动态添加的按钮也能触发点击事件
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'newEraButton') {
        upgradeNewEra();
    } else if (event.target && event.target.closest('#newEraButton')) {
        upgradeNewEra();
    } else if (event.target && event.target.id === 'expandAntimatterButton') {
        upgradeExpandAntimatterWarehouse();
    } else if (event.target && event.target.id === 'antimatterExplosionButton') {
        upgradeAntimatterExplosion();
    }
});

// 反物质爆炸升级按钮状态更新函数
function updateAntimatterExplosionButtonState() {
    if (!Game || !Game.state) return;
    const button = document.getElementById('antimatterExplosionButton');

    if (!button) return;

    if (Game.state.antimatterExplosionUnlocked) {
        button.textContent = '已购买';
        button.classList.add('purchased');
        button.classList.remove('affordable');
        button.disabled = true;
    } else if (Game.state.antimatter.gte(new OmegaNum('500'))) {
        button.textContent = '购买升级';
        button.classList.add('affordable');
        button.classList.remove('purchased');
        button.disabled = false;
    } else {
        button.textContent = '购买升级';
        button.classList.remove('affordable', 'purchased');
        button.disabled = false;
    }
}

// 扩大反物质仓库升级
function upgradeExpandAntimatterWarehouse() {
    const COST = new OmegaNum(10000); // 1万反物质

    if (!Game.state.upgrades.antimatterWarehouse && Game.state.antimatter.gte(COST)) {
        Game.state.antimatter = Game.state.antimatter.sub(COST);
        Game.state.upgrades.antimatterWarehouse = true;

        // 更新按钮状态
        const button = document.getElementById('expandAntimatterButton');
        if (button) {
            button.textContent = '已购买';
            button.classList.add('purchased');
            button.classList.remove('affordable');
            button.disabled = true;
        }

        // 更新显示
        updateAntimatterDisplay();
        Utils.showNotification('已购买反物质仓库扩展！软上限减轻了。');
    }
}

// 反物质爆炸升级
function upgradeAntimatterExplosion() {
    const COST = new OmegaNum(500); // 500反物质

    if (!Game.state.antimatterExplosionUnlocked && Game.state.antimatter.gte(COST)) {
        Game.state.antimatter = Game.state.antimatter.sub(COST);
        Game.state.antimatterExplosionUnlocked = true;

        // 更新反物质生产倍率
        Game.state.antimatterMultiplier = (Game.state.antimatterMultiplier || new OmegaNum(1)).mul(2);

        // 更新按钮状态
        updateAntimatterExplosionButtonState();
        updateAntimatterDisplay();

        // 保存游戏状态
        if (window.SaveSystem && typeof SaveSystem.saveGameState === 'function') {
            SaveSystem.saveGameState();
        }

        Utils.showNotification('已购买反物质爆炸升级！反物质产量×2');
    }
}

// 扩大反物质仓库按钮状态更新
function updateExpandAntimatterButtonState() {
    const button = document.getElementById('expandAntimatterButton');
    if (!button) return;

    if (Game.state.upgrades.antimatterWarehouse) {
        button.textContent = '已购买';
        button.classList.add('purchased');
        button.classList.remove('affordable');
        button.disabled = true;
    } else if (Game.state.antimatter.gte(new OmegaNum(10000))) {
        button.textContent = '购买升级';
        button.classList.add('affordable');
        button.classList.remove('purchased');
        button.disabled = false;
    } else {
        button.textContent = '购买升级';
        button.classList.remove('affordable', 'purchased');
        button.disabled = false;
    }
}

// 坍缩解锁条件
const COLLAPSE_UNLOCK_COST = new OmegaNum(500); // 改为500反物质解锁
const CHALLENGE_UNLOCK_COST = new OmegaNum(5000); // 由1000改为5000

function updateCollapseTabUI() {
    const collapseTabBtn = document.getElementById('collapseTabBtn');
    const unlockSection = document.getElementById('collapseUnlockSection');
    const mainSection = document.getElementById('collapseMainSection');
    if (!Game || !Game.state) return;
    // 坍缩tab按钮始终显示
    if (collapseTabBtn) collapseTabBtn.style.display = '';
    if (Game.state.annihilationUnlocked) {
        if (unlockSection) unlockSection.style.display = 'none';
        if (mainSection) mainSection.style.display = '';
    } else {
        if (unlockSection) unlockSection.style.display = '';
        if (mainSection) mainSection.style.display = 'none';
    }
    updateAnnihilationUI();
    // 坍缩解锁按钮
    const unlockBtn = document.getElementById('unlockCollapseBtn');
    if (unlockBtn) {
        unlockBtn.textContent = `使用${COLLAPSE_UNLOCK_COST}反物质解锁`;
    }
    // 不再处理挑战按钮
}

function updateAnnihilationUI() {
    if (!Game || !Game.state) return;
    const energySpan = document.getElementById('annihilationEnergy');
    const bonusDiv = document.getElementById('annihilationBonus');
    if (!energySpan || !bonusDiv) return;
    const E = Game.state.annihilationEnergy;
    // 格式化显示
    energySpan.textContent = Utils.formatOmegaNum ? Utils.formatOmegaNum(E) : E.toString();
    // 使用game.js中的getAnnihilationBonus函数计算倍率
    try {
        const bonus = Game.getAnnihilationBonus();
        if (bonus && bonus.gt && bonus.gt(0)) {
            // 格式化显示大数字
            let bonusText;
            if (bonus.lt(1e6)) {
                bonusText = `当前产量倍率：×${Utils.formatOmegaNum ? Utils.formatOmegaNum(new OmegaNum(bonus), 3) : bonus.toFixed(3)}`;
            } else {
                bonusText = `当前产量倍率：×${Utils.formatOmegaNum ? Utils.formatOmegaNum(new OmegaNum(bonus), 3) : bonus.toExponential(3).replace('+', '')}`;
            }
            
            // 挑战9期间显示开平方提示
            if (Game.state.tempAnnihilationSqrt && typeof window.isChallenge9Active === 'function' && window.isChallenge9Active()) {
                bonusText += ' (已开平方)';
            }
            
            bonusDiv.textContent = bonusText;
        } else {
            bonusDiv.textContent = `当前产量倍率：×1.000`;
        }
    } catch (e) {
        console.error('计算产量倍率时出错:', e);
        bonusDiv.textContent = `当前产量倍率：×1.000`;
    }
}

// 挑战系统核心逻辑
let challengeState = {
    inChallenge: false,
    challengeId: null,
    completed: {},
};

// 挑战状态保存和加载
function saveChallengeState() {
    return {
        inChallenge: challengeState.inChallenge,
        challengeId: challengeState.challengeId,
        completed: { ...challengeState.completed }
    };
}

function loadChallengeState(data) {
    if (data) {
        challengeState.inChallenge = data.inChallenge || false;
        challengeState.challengeId = data.challengeId || null;
        challengeState.completed = data.completed || {};
    }
}

function updateChallengeTabUI() {
    if (!Game || !Game.state) return;
    const unlocked = Game.state.challengeUnlocked;
    const unlockSection = document.getElementById('challengeUnlockSection');
    const mainSection = document.getElementById('challengeMainSection');
    const completeArea = document.getElementById('challengeCompleteArea');
    
    // 挑战1相关元素
    const challenge1Status = document.getElementById('challenge1Status');
    const startBtn1 = document.getElementById('startChallenge1Btn');
    const giveUpBtn1 = document.getElementById('giveUpChallenge1Btn');
    
    // 挑战2相关元素
    const challenge2Status = document.getElementById('challenge2Status');
    const startBtn2 = document.getElementById('startChallenge2Btn');
    const giveUpBtn2 = document.getElementById('giveUpChallenge2Btn');
    
    // 挑战3相关元素
    const challenge3Status = document.getElementById('challenge3Status');
    const startBtn3 = document.getElementById('startChallenge3Btn');
    const giveUpBtn3 = document.getElementById('giveUpChallenge3Btn');
    
    if (unlocked) {
        if (unlockSection) unlockSection.style.display = 'none';
        if (mainSection) mainSection.style.display = 'flex';
        
        // 挑战1状态更新
        if (challenge1Status) {
            if (challengeState.inChallenge && challengeState.challengeId === 1) {
                challenge1Status.textContent = '正在进行中...';
            } else if (challengeState.completed[1]) {
                challenge1Status.textContent = '已完成！';
            } else {
                challenge1Status.textContent = '';
            }
        }
        
        // 挑战2状态更新
        if (challenge2Status) {
            if (challengeState.inChallenge && challengeState.challengeId === 2) {
                challenge2Status.textContent = '正在进行中...';
            } else if (challengeState.completed[2]) {
                challenge2Status.textContent = '已完成！';
            } else if (!challengeState.completed[1]) {
                challenge2Status.textContent = '需要先完成第一个挑战';
            } else {
                challenge2Status.textContent = '';
            }
        }
        
        // 挑战3状态更新
        if (challenge3Status) {
            if (challengeState.inChallenge && challengeState.challengeId === 3) {
                challenge3Status.textContent = '正在进行中...';
            } else if (challengeState.completed[3]) {
                challenge3Status.textContent = '已完成！';
            } else if (!challengeState.completed[1] || !challengeState.completed[2]) {
                challenge3Status.textContent = '需要先完成前两个挑战';
            } else {
                challenge3Status.textContent = '';
            }
        }
        
        // 完成区域显示逻辑
        if (completeArea) {
            if (false) {
                // 所有挑战完成文本已被移除
            } else {
                completeArea.style.display = 'none';
            }
        }
        
        // 挑战1按钮状态 - 已完成的挑战也显示开始按钮
        if (startBtn1) {
            if (challengeState.inChallenge && challengeState.challengeId === 1) {
                startBtn1.style.display = 'none';
            } else {
                startBtn1.style.display = '';
            }
        }
        if (giveUpBtn1) giveUpBtn1.style.display = (challengeState.inChallenge && challengeState.challengeId === 1) ? '' : 'none';
        
        // 挑战2按钮状态 - 已完成的挑战也显示开始按钮
        if (startBtn2) {
            if (challengeState.inChallenge && challengeState.challengeId === 2) {
                startBtn2.style.display = 'none';
            } else if (!challengeState.completed[1]) {
                startBtn2.style.display = 'none';
            } else {
                startBtn2.style.display = '';
            }
        }
        if (giveUpBtn2) giveUpBtn2.style.display = (challengeState.inChallenge && challengeState.challengeId === 2) ? '' : 'none';
        
        // 挑战3按钮状态 - 已完成的挑战也显示开始按钮
        if (startBtn3) {
            if (challengeState.inChallenge && challengeState.challengeId === 3) {
                startBtn3.style.display = 'none';
            } else if (!challengeState.completed[1] || !challengeState.completed[2]) {
                startBtn3.style.display = 'none';
            } else {
                startBtn3.style.display = '';
            }
        }
        if (giveUpBtn3) giveUpBtn3.style.display = (challengeState.inChallenge && challengeState.challengeId === 3) ? '' : 'none';
    } else {
        if (unlockSection) unlockSection.style.display = '';
        if (mainSection) mainSection.style.display = 'none';
        if (completeArea) completeArea.style.display = 'none';
        if (challenge1Status) challenge1Status.textContent = '';
        if (challenge2Status) challenge2Status.textContent = '';
        if (challenge3Status) challenge3Status.textContent = '';
        if (startBtn1) startBtn1.style.display = 'none';
        if (startBtn2) startBtn2.style.display = 'none';
        if (startBtn3) startBtn3.style.display = 'none';
        if (giveUpBtn1) giveUpBtn1.style.display = 'none';
        if (giveUpBtn2) giveUpBtn2.style.display = 'none';
        if (giveUpBtn3) giveUpBtn3.style.display = 'none';
    }
}

// 绑定挑战按钮
function bindChallengeButtons() {
    const startBtn1 = document.getElementById('startChallenge1Btn');
    const startBtn2 = document.getElementById('startChallenge2Btn');
    const startBtn3 = document.getElementById('startChallenge3Btn');
    const giveUpBtn1 = document.getElementById('giveUpChallenge1Btn');
    const giveUpBtn2 = document.getElementById('giveUpChallenge2Btn');
    const giveUpBtn3 = document.getElementById('giveUpChallenge3Btn');
    
    if (startBtn1) {
        startBtn1.onclick = function() {
            // 投喂黑洞期间禁用其他挑战
            if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) {
                Utils.showNotification('投喂黑洞期间无法启动其他挑战！', 'error');
                return;
            }
            
            challengeState.inChallenge = true;
            challengeState.challengeId = 1;
            // 保存当前的挑战奖励状态
            const savedChallengeRewards = {
                challenge1Reward: Game.state.challenge1Reward,
                challenge2Reward: Game.state.challenge2Reward,
                challenge3Reward: Game.state.challenge3Reward
            };
            
            Utils.resetGameProgressWithUpgrades();
            
            // 恢复挑战奖励状态
            Game.state.challenge1Reward = savedChallengeRewards.challenge1Reward;
            Game.state.challenge2Reward = savedChallengeRewards.challenge2Reward;
            Game.state.challenge3Reward = savedChallengeRewards.challenge3Reward;
            
            updateChallengeTabUI();
            if (window.UI && UI.updateUI) UI.updateUI();
            // 挑战期间完全禁用自动化
            const automationTabBtn = document.getElementById('automationTabBtn');
            if (automationTabBtn) {
                automationTabBtn.style.display = 'none';
            }
            // 挑战1期间隐藏升级选项卡
            const upgradesTab = document.querySelector('.tab[data-tab="upgrades"]');
            if (upgradesTab) {
                upgradesTab.style.display = 'none';
            }
        };
    }
    
    if (startBtn2) {
        startBtn2.onclick = function() {
            // 投喂黑洞期间禁用其他挑战
            if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) {
                Utils.showNotification('投喂黑洞期间无法启动其他挑战！', 'error');
                return;
            }
            
            challengeState.inChallenge = true;
            challengeState.challengeId = 2;
            // 保存当前的挑战奖励状态
            const savedChallengeRewards = {
                challenge1Reward: Game.state.challenge1Reward,
                challenge2Reward: Game.state.challenge2Reward,
                challenge3Reward: Game.state.challenge3Reward
            };
            
            Utils.resetGameProgressWithUpgrades();
            
            // 恢复挑战奖励状态
            Game.state.challenge1Reward = savedChallengeRewards.challenge1Reward;
            Game.state.challenge2Reward = savedChallengeRewards.challenge2Reward;
            Game.state.challenge3Reward = savedChallengeRewards.challenge3Reward;
            
            updateChallengeTabUI();
            if (window.UI && UI.updateUI) UI.updateUI();
            // 挑战期间完全禁用自动化
            const automationTabBtn = document.getElementById('automationTabBtn');
            if (automationTabBtn) {
                automationTabBtn.style.display = 'none';
            }
        };
    }
    
    if (startBtn3) {
        startBtn3.onclick = function() {
            // 投喂黑洞期间禁用其他挑战
            if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) {
                Utils.showNotification('投喂黑洞期间无法启动其他挑战！', 'error');
                return;
            }
            
            challengeState.inChallenge = true;
            challengeState.challengeId = 3;
            // 保存当前的挑战奖励状态
            const savedChallengeRewards = {
                challenge1Reward: Game.state.challenge1Reward,
                challenge2Reward: Game.state.challenge2Reward,
                challenge3Reward: Game.state.challenge3Reward
            };
            
            Utils.resetGameProgressWithUpgrades();
            
            // 恢复挑战奖励状态
            Game.state.challenge1Reward = savedChallengeRewards.challenge1Reward;
            Game.state.challenge2Reward = savedChallengeRewards.challenge2Reward;
            Game.state.challenge3Reward = savedChallengeRewards.challenge3Reward;
            
            updateChallengeTabUI();
            if (window.UI && UI.updateUI) UI.updateUI();
            // 挑战期间完全禁用自动化
            const automationTabBtn = document.getElementById('automationTabBtn');
            if (automationTabBtn) {
                automationTabBtn.style.display = 'none';
            }
            // 挑战3期间隐藏升级选项卡（因为升级无效）
            const upgradesTab = document.querySelector('.tab[data-tab="upgrades"]');
            if (upgradesTab) {
                upgradesTab.style.display = 'none';
            }
        };
    }
    
    if (giveUpBtn1) {
        giveUpBtn1.onclick = function() {
            if (challengeState.inChallenge && challengeState.challengeId === 1) {
                challengeState.inChallenge = false;
                challengeState.challengeId = null;
                Utils.resetGameProgressWithUpgrades();
                updateChallengeTabUI();
                if (window.UI && UI.updateUI) UI.updateUI();
                // 恢复自动化选项卡显示
                const automationTabBtn = document.getElementById('automationTabBtn');
                if (automationTabBtn && Game && Game.state && Game.state.automationUnlocked) {
                    automationTabBtn.style.display = '';
                }
                // 恢复升级选项卡显示
                const upgradesTab = document.querySelector('.tab[data-tab="upgrades"]');
                if (upgradesTab) {
                    upgradesTab.style.display = '';
                }
            }
        };
    }
    
    if (giveUpBtn2) {
        giveUpBtn2.onclick = function() {
            if (challengeState.inChallenge && challengeState.challengeId === 2) {
                challengeState.inChallenge = false;
                challengeState.challengeId = null;
                Utils.resetGameProgressWithUpgrades();
                updateChallengeTabUI();
                if (window.UI && UI.updateUI) UI.updateUI();
                // 恢复自动化选项卡显示
                const automationTabBtn = document.getElementById('automationTabBtn');
                if (automationTabBtn && Game && Game.state && Game.state.automationUnlocked) {
                    automationTabBtn.style.display = '';
                }
            }
        };
    }
    
    if (giveUpBtn3) {
        giveUpBtn3.onclick = function() {
            if (challengeState.inChallenge && challengeState.challengeId === 3) {
                challengeState.inChallenge = false;
                challengeState.challengeId = null;
                Utils.resetGameProgressWithUpgrades();
                updateChallengeTabUI();
                if (window.UI && UI.updateUI) UI.updateUI();
                // 恢复自动化选项卡显示
                const automationTabBtn = document.getElementById('automationTabBtn');
                if (automationTabBtn && Game && Game.state && Game.state.automationUnlocked) {
                    automationTabBtn.style.display = '';
                }
                // 恢复升级选项卡显示
                const upgradesTab = document.querySelector('.tab[data-tab="upgrades"]');
                if (upgradesTab) {
                    upgradesTab.style.display = '';
                }
            }
        };
    }
}

// 绑定挑战解锁按钮
function bindChallengeUnlockBtn() {
    const btn = document.getElementById('unlockChallengeBtn2');
    if (btn) {
        btn.onclick = function() {
            if (Game.state.antimatter.gte(CHALLENGE_UNLOCK_COST)) {
                Game.state.antimatter = Game.state.antimatter.sub(CHALLENGE_UNLOCK_COST);
                Game.state.challengeUnlocked = true;
                updateChallengeTabUI();
                if (window.UI && UI.updateUI) UI.updateUI();
            } else {
                btn.textContent = '反物质不足';
                setTimeout(() => btn.textContent = `使用${CHALLENGE_UNLOCK_COST}反物质解锁挑战`, 1200);
            }
        };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // 坍缩系统状态初始化
    if (Game && Game.state) {
        if (!Game.state.annihilationUnlocked) Game.state.annihilationUnlocked = false;
        if (!Game.state.annihilationEnergy) Game.state.annihilationEnergy = new OmegaNum(0);
        if (!Game.state.annihilationEnergyPeak) Game.state.annihilationEnergyPeak = new OmegaNum(0);
        if (!Game.state.annihilationTime) Game.state.annihilationTime = 0;
    }
    
    // 挑战状态初始化
    if (Game && Game.state) {
        if (!Game.state.challenge1Reward) Game.state.challenge1Reward = false;
        if (!Game.state.challenge2Reward) Game.state.challenge2Reward = false;
        if (!Game.state.challenge3Reward) Game.state.challenge3Reward = false;
    }
    updateNewEraButtonState();
    const newEraButton = document.getElementById('newEraButton');

    if (!newEraButton) {
        console.error('新纪元升级按钮不存在于DOM中，请检查HTML中是否有ID为"newEraButton"的元素');
    } else {
        // 移除可能存在的HTML硬编码disabled属性
        if (newEraButton.hasAttribute('disabled')) {

            newEraButton.removeAttribute('disabled');
        }
        
    }
    // 坍缩解锁按钮逻辑
    const unlockCollapseBtn = document.getElementById('unlockCollapseBtn');
    if (unlockCollapseBtn) {
        unlockCollapseBtn.addEventListener('click', function() {
            if (Game.state.antimatter.gte(COLLAPSE_UNLOCK_COST)) {
                Game.state.antimatter = Game.state.antimatter.sub(COLLAPSE_UNLOCK_COST);
                Game.state.annihilationUnlocked = true;
                // 移除距离系统解锁，距离系统应该通过湮灭能量解锁
                updateCollapseTabUI();
                if (window.UI && UI.updateUI) UI.updateUI();
            } else {
                unlockCollapseBtn.textContent = '反物质不足';
                setTimeout(() => unlockCollapseBtn.textContent = `使用${COLLAPSE_UNLOCK_COST}反物质解锁`, 1200);
            }
        });
    }
    // 挑战解锁按钮事件绑定（修复）
    bindChallengeUnlockBtn();
    // 挑战解锁按钮逻辑（预留）
    const unlockChallengeBtn = document.getElementById('unlockChallengeBtn');
    if (unlockChallengeBtn) {
        unlockChallengeBtn.addEventListener('click', function() {
            if (Game.state.antimatter.gte(CHALLENGE_UNLOCK_COST)) {
                Game.state.antimatter = Game.state.antimatter.sub(CHALLENGE_UNLOCK_COST);
                // 这里可以添加挑战解锁后的逻辑，例如显示挑战界面
                // 挑战解锁成功
                updateCollapseTabUI();
                if (window.UI && UI.updateUI) UI.updateUI();
            } else {
                unlockChallengeBtn.textContent = '反物质不足';
                setTimeout(() => unlockChallengeBtn.textContent = `使用${CHALLENGE_UNLOCK_COST}反物质解锁挑战（测试）`, 1200);
            }
        });
    }
    // 坍缩按钮逻辑
    const doCollapseBtn = document.getElementById('doCollapseBtn');
    if (doCollapseBtn) {
        doCollapseBtn.addEventListener('click', function() {
            // 计算湮灭能量（新公式：当前反物质*2）
            const totalAntimatter = Game.state.antimatter.clone(); // 克隆当前反物质值，确保我们使用重置前的值
            const gain = totalAntimatter.mul(2);
            // 坍缩调试: 反物质增益计算完成
            
            // 先计算奖励并添加到湮灭能量中，再进行重置
            Game.state.annihilationEnergy = Game.state.annihilationEnergy.add(gain);
            if (gain.gt(Game.state.annihilationEnergyPeak || new OmegaNum(0))) Game.state.annihilationEnergyPeak = gain;
            Game.state.annihilationTime = 0;
            
            // 保存关键状态
            console.log('[调试] 坍缩前状态保存:', {
                newEraUnlocked: Game.state.newEraUnlocked,
                matterMultiplier: Game.state.matterMultiplier ? (Utils.formatOmegaNum ? Utils.formatOmegaNum(Game.state.matterMultiplier) : Game.state.matterMultiplier.toString()) : '1',
                challengeRewards: {
                    C1: Game.state.challenge1Reward,
                    C2: Game.state.challenge2Reward,
                    C3: Game.state.challenge3Reward
                },
                antimatterUpgrades: {
                    explosion: Game.state.antimatterExplosionUnlocked,
                    multiplier: Game.state.antimatterMultiplier ? (Utils.formatOmegaNum ? Utils.formatOmegaNum(Game.state.antimatterMultiplier) : Game.state.antimatterMultiplier.toString()) : '1'
                }
            });
            
            const savedState = {
                newEraUnlocked: Game.state.newEraUnlocked,
                matterMultiplier: Game.state.matterMultiplier ? Game.state.matterMultiplier.clone() : new OmegaNum(1),
                challenge1Reward: Game.state.challenge1Reward,
                challenge2Reward: Game.state.challenge2Reward,
                challenge3Reward: Game.state.challenge3Reward,
                antimatterExplosionUnlocked: Game.state.antimatterExplosionUnlocked,
                antimatterMultiplier: Game.state.antimatterMultiplier ? Game.state.antimatterMultiplier.clone() : new OmegaNum(1)
            };
        
            // 安全协议：如果在挑战中进行坍缩，则先强制放弃挑战
            if (challengeState.inChallenge) {
                if (window.clearAllChallengeEffects) {
                    window.clearAllChallengeEffects(); // 清除所有挑战效果
                }
                challengeState.inChallenge = false;
                challengeState.challengeId = null;
                updateChallengeTabUI();
                Utils.showNotification('在挑战中坍缩，已自动为你放弃挑战。');
                Game.state.achievements.wastedCollapse = true; // 解锁“白干了”成就
            }

            // 调用坍缩重置函数
            if (typeof Game.collapseReset === 'function') {
                Game.collapseReset();
            }
            
            // 保存完整UI和升级状态
            const savedUIState = {
                // UI状态
                automationUnlocked: Game.state.automationUnlocked,
                antimatterUnlocked: Game.state.antimatterUnlocked,
                antimatterExplosionUnlocked: Game.state.antimatterExplosionUnlocked,
                
                // 升级效果
                upgradeMultipliers: Game.state.upgradeMultipliers ? {...Game.state.upgradeMultipliers} : {},
                permanentUpgrades: Array.isArray(Game.state.permanentUpgrades) ? [...Game.state.permanentUpgrades] : [],
                
                // 选项卡状态
                tabsUnlocked: {...Game.state.tabsUnlocked}
            };

            // 重置游戏状态
            if (window.Utils && Utils.resetGameProgress) {
                Utils.resetGameProgress();
                
                // 恢复保存的状态
                Object.assign(Game.state, {
                    automationUnlocked: savedUIState.automationUnlocked,
                    antimatterUnlocked: savedUIState.antimatterUnlocked,
                    antimatterExplosionUnlocked: savedUIState.antimatterExplosionUnlocked,
                    upgradeMultipliers: savedUIState.upgradeMultipliers,
                    permanentUpgrades: savedUIState.permanentUpgrades,
                    tabsUnlocked: savedUIState.tabsUnlocked
                });

                // 强制刷新UI
                if (window.updateUI) {
                    updateUI();
                }
            
                // 恢复关键状态
                // Game.state.newEraUnlocked = savedState.newEraUnlocked; // BUG: 根据用户指示，坍缩时，新时代状态也应该被重置，不应恢复。
                // Game.state.matterMultiplier = savedState.matterMultiplier; // BUG: 坍缩后不应该直接恢复倍率，应该基于新时代状态重新计算
                Game.state.challenge1Reward = savedState.challenge1Reward;
                Game.state.challenge2Reward = savedState.challenge2Reward;
                Game.state.challenge3Reward = savedState.challenge3Reward;
                Game.state.antimatterExplosionUnlocked = savedState.antimatterExplosionUnlocked;
                Game.state.antimatterMultiplier = savedState.antimatterMultiplier;
                
                // 如果之前已经解锁了新时代，恢复物质倍率 (已被注释掉，因为坍缩应该重置此状态)
                /* if (savedState.newEraUnlocked) {
                    Game.state.matterMultiplier = Game.state.matterMultiplier.mul(2);
                    // 坍缩调试: 已恢复新时代状态
                } */
            
                if (window.Game && Game.updateMatterPerSecond) Game.updateMatterPerSecond();
                if (window.UI && UI.updateUI) UI.updateUI();
            } else {
                // 兜底：完全重置逻辑
                Game.state.currentMatter = new OmegaNum(10);
                Game.state.generatorCount = 0;
                Game.state.generatorCost = new OmegaNum(10);
                Game.state.enhancerCount = 0;
                Game.state.enhancerCost = new OmegaNum(100);
                Game.state.enhancerMultiplier = new OmegaNum(1);
                Game.state.antimatter = new OmegaNum(0);
                Game.state.antimatterUnlocked = false;
                Game.state.antimatterExplosionUnlocked = false;
                Game.state.antimatterMultiplier = new OmegaNum(1);
            
                // 坍缩后，新时代状态应该被重置，不应该被恢复
                Game.state.newEraUnlocked = false;
                Game.state.matterMultiplier = new OmegaNum(1);
        
                // 确保反物质仓库升级也被重置
                if (Game.state.upgrades) {
                    Game.state.upgrades.antimatterWarehouse = false;
                }
        
                if (window.Game && Game.updateMatterPerSecond) Game.updateMatterPerSecond();
                if (window.UI && UI.updateUI) UI.updateUI();
            }
        
            // 坍缩调试: 已重置所有反物质升级和状态
            
            // 反物质升级2：打破质量守恒效果 - 重置时获得反物质*10^湮灭能量
            if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.antimatterUpgrade2 && Game.state.annihilationEnergy && Game.state.annihilationEnergy.gt(0)) {
                const antimatterBonus = new OmegaNum(10).pow(Game.state.annihilationEnergy);
                Game.state.antimatter = (Game.state.antimatter || new OmegaNum(0)).mul(antimatterBonus);
                Utils.showNotification(`反物质升级2效果：获得额外反物质×${Utils.formatOmegaNum(antimatterBonus)}！`, 'success');
            }
            
            updateAnnihilationUI();
        });
    }
    updateCollapseTabUI();
    updateChallengeTabUI();
    bindChallengeButtons();
    
    // 加载存档后更新自动化选项卡显示
    const automationTabBtn = document.getElementById('automationTabBtn');
    if (automationTabBtn && Game && Game.state && Game.state.automationUnlocked) {
        const inChallenge = (window.isUpgradeDisabled && isUpgradeDisabled && isUpgradeDisabled()) || 
                           (window.isChallenge2Active && isChallenge2Active && isChallenge2Active()) ||
                           (window.isChallenge3Active && isChallenge3Active && isChallenge3Active());
        automationTabBtn.style.display = inChallenge ? 'none' : '';
    }
    // 子选项卡切换逻辑已移至UI.js统一处理
});

function upgradeNewEra() {
      if (!Game.state.newEraUnlocked && Game.state.antimatter.gte(new OmegaNum('100'))) {
          Game.state.antimatter = Game.state.antimatter.minus(new OmegaNum(100));
          Game.state.matterMultiplier = (Game.state.matterMultiplier || new OmegaNum(1)).mul(2);
          Game.state.newEraUnlocked = true;
          document.querySelector('.upgrade-card').classList.add('unlocked');
          updateAntimatterDisplay();
    updateNewEraButtonState();
          if (window.Game && Game.updateMatterPerSecond) Game.updateMatterPerSecond();
          if (window.UI && UI.updateUI) UI.updateUI();
      } else if (Game.state.antimatter.lt(new OmegaNum('100'))) {
          // 反物质不足，需要100反物质才能升级
      }
  }

if (!window.UI) window.UI = {};
const oldUpdateUI = UI.updateUI;
UI.updateUI = function() {
    if (typeof oldUpdateUI === 'function') oldUpdateUI.apply(this, arguments);
    updateCollapseTabUI();
    updateChallengeTabUI();
};
if (window.SaveSystem) {
    const oldLoadGameState = SaveSystem.loadGameState;
    SaveSystem.loadGameState = function() {
        const result = oldLoadGameState.apply(this, arguments);
        updateCollapseTabUI();
        updateChallengeTabUI();
        return result;
    };
}

// 挑战期间升级无效的判定
function isUpgradeDisabled() {
    return challengeState.inChallenge && (challengeState.challengeId === 1 || challengeState.challengeId === 3);
}

// 挑战1期间的判定
function isChallenge1Active() {
    return challengeState.inChallenge && challengeState.challengeId === 1;
}

// 挑战2期间软上限极巨的判定
function isChallenge2Active() {
    return challengeState.inChallenge && (challengeState.challengeId === 2 || challengeState.challengeId === 3);
}

// 挑战3期间双重打击的判定
function isChallenge3Active() {
    return challengeState.inChallenge && challengeState.challengeId === 3;
}

// 修改升级和加成相关逻辑（示例，具体需在game.js等主逻辑中配合判断isUpgradeDisabled）
// 例如在计算matterMultiplier、compressEffect、warehouseEffect时判断isUpgradeDisabled
// 挑战完成检测
function checkChallenge1Complete() {
    if (challengeState.inChallenge && challengeState.challengeId === 1 && Game.state.currentMatter.gte(new OmegaNum('2e8'))) {
        challengeState.inChallenge = false;
        challengeState.completed[1] = true;
        challengeState.challengeId = null;
        // 发放奖励（示例：设置奖励标志，具体加成在主逻辑中实现）
        Game.state.challenge1Reward = true;
        
        // 挑战完成后执行坍缩重置
        if (typeof Game.collapseReset === 'function') {
            Game.collapseReset();
        }
        
        // 挑战完成后恢复升级状态（这里可以添加恢复逻辑）
        updateChallengeTabUI();
        if (window.UI && UI.updateUI) UI.updateUI();
        // 恢复自动化选项卡显示
        const automationTabBtn = document.getElementById('automationTabBtn');
        if (automationTabBtn && Game && Game.state && Game.state.automationUnlocked) {
            automationTabBtn.style.display = '';
        }
        // 恢复升级选项卡显示
        const upgradesTab = document.querySelector('.tab[data-tab="upgrades"]');
        if (upgradesTab) {
            upgradesTab.style.display = '';
        }
        Utils.showNotification('第1个挑战完成！密度和压缩物质升级效果×2');
    }
}

// 挑战2完成检测
function checkChallenge2Complete() {
    if (challengeState.inChallenge && challengeState.challengeId === 2 && Game.state.currentMatter.gte(new OmegaNum('5e8'))) {
        challengeState.inChallenge = false;
        challengeState.completed[2] = true;
        challengeState.challengeId = null;
        // 发放奖励：软上限消失
        Game.state.challenge2Reward = true;
        
        // 挑战完成后执行坍缩重置
        if (typeof Game.collapseReset === 'function') {
            Game.collapseReset();
        }
        
        updateChallengeTabUI();
        if (window.UI && UI.updateUI) UI.updateUI();
        // 恢复自动化选项卡显示
        const automationTabBtn = document.getElementById('automationTabBtn');
        if (automationTabBtn && Game && Game.state && Game.state.automationUnlocked) {
            automationTabBtn.style.display = '';
        }
        Utils.showNotification('第二个挑战完成！软上限已消失');
    }
}

// 挑战3完成检测

function checkChallenge3Complete() {
    if (challengeState.inChallenge && challengeState.challengeId === 3 && Game.state.currentMatter.gte(new OmegaNum('1e8'))) {
        challengeState.inChallenge = false;
        challengeState.completed[3] = true;
        challengeState.challengeId = null;
        // 发放奖励：自动化间隔变为2秒
        Game.state.challenge3Reward = true;
        
        // 挑战完成后执行坍缩重置
        if (typeof Game.collapseReset === 'function') {
            Game.collapseReset();
        }
        
        updateChallengeTabUI();
        if (window.UI && UI.updateUI) UI.updateUI();
        // 恢复自动化选项卡显示
        const automationTabBtn = document.getElementById('automationTabBtn');
        if (automationTabBtn && Game && Game.state && Game.state.automationUnlocked) {
            automationTabBtn.style.display = '';
        }
        // 恢复升级选项卡显示
        const upgradesTab = document.querySelector('.tab[data-tab="upgrades"]');
        if (upgradesTab) {
            upgradesTab.style.display = '';
        }
        Utils.showNotification('第3个挑战完成！自动化间隔已变为2秒，大幅提高自动操作速度');

        // 如果自动购买功能已启动，重新启动以应用新间隔
        if (Game.autoPurchaseInterval) {
            Game.startAutoPurchasing();
        }
    }
}
// 在主循环或antimatter产出后调用checkChallenge1Complete()


// 新增创新挑战代码
// 扩展挑战状态初始化
if (!challengeState.completed[4]) challengeState.completed[4] = false;
if (!challengeState.completed[5]) challengeState.completed[5] = false;
if (!challengeState.completed[6]) challengeState.completed[6] = false;
if (!challengeState.completed[7]) challengeState.completed[7] = false;
if (!challengeState.completed[8]) challengeState.completed[8] = false;
if (!challengeState.completed[9]) challengeState.completed[9] = false;

// 挑战4：维度折叠 - 生成器效率随时间递减
function isChallenge4Active() {
    return challengeState.inChallenge && challengeState.challengeId === 4;
}

// 挑战5：能量守恒 - 购买升级会消耗物质
function isChallenge5Active() {
    return challengeState.inChallenge && challengeState.challengeId === 5;
}

// 挑战6：量子隧穿 - 物质产量波动
function isChallenge6Active() {
    return challengeState.inChallenge && challengeState.challengeId === 6;
}

// 挑战7：熵增定律 - 生成器会自动降级
function isChallenge7Active() {
    return challengeState.inChallenge && challengeState.challengeId === 7;
}

// 挑战8：概率坍缩 - 随机重置部分进度
function isChallenge8Active() {
    return challengeState.inChallenge && challengeState.challengeId === 8;
}

// 挑战9：终极湮灭 - 禁止购买增强器，湮灭能量增益开平方
function isChallenge9Active() {
    return challengeState.inChallenge && challengeState.challengeId === 9;
}

// 挑战4完成检测：维度折叠
function checkChallenge4Complete() {
    if (challengeState.inChallenge && challengeState.challengeId === 4 && Game.state.currentMatter.gte(new OmegaNum('1e9'))) {
        // 挑战4完成，开始重置
        challengeState.inChallenge = false;
        challengeState.completed[4] = true;
        challengeState.challengeId = null;

        // 发放奖励：维度稳定 - 生成器效率不再递减，且基础效率+25%
        Game.state.challenge4Reward = true;
        
        // 挑战完成后执行坍缩重置
        if (typeof Game.collapseReset === 'function') {
            // 调用Game.collapseReset()
            Game.collapseReset();
            // 重置完成
        } else {
            // Game.collapseReset函数不存在
        }
        
        updateChallengeTabUI();
        if (window.UI && UI.updateUI) UI.updateUI();

        Utils.showNotification('维度折叠挑战完成！生成器效率稳定且基础效率+25%');
    }
}

// 挑战5完成检测：能量守恒
function checkChallenge5Complete() {
    if (challengeState.inChallenge && challengeState.challengeId === 5 && Game.state.currentMatter.gte(new OmegaNum('5e9'))) {
        // 挑战5完成，开始重置
        challengeState.inChallenge = false;
        challengeState.completed[5] = true;
        challengeState.challengeId = null;

        // 发放奖励：能量循环 - 购买升级时返还50%物质消耗
        Game.state.challenge5Reward = true;
        
        // 挑战完成后执行坍缩重置
        if (typeof Game.collapseReset === 'function') {
            // 调用Game.collapseReset()
            Game.collapseReset();
            // 重置完成
        } else {
            // Game.collapseReset函数不存在
        }
        
        updateChallengeTabUI();
        if (window.UI && UI.updateUI) UI.updateUI();

        Utils.showNotification('能量守恒挑战完成！购买升级时返还50%物质消耗');
    }
}

// 挑战6完成检测：二重软上限
function checkChallenge6Complete() {
    if (challengeState.inChallenge && challengeState.challengeId === 6 && Game.state.currentMatter.gte(new OmegaNum('5e8'))) {
        challengeState.inChallenge = false;
        challengeState.completed[6] = true;
        challengeState.challengeId = null;

        // 发放奖励：反物质对物质产生极低增幅效果
        Game.state.challenge6Reward = true;
        
        // 挑战完成后执行坍缩重置
        if (typeof Game.collapseReset === 'function') {
            Game.collapseReset();
        }
        
        updateChallengeTabUI();
        if (window.UI && UI.updateUI) UI.updateUI();

        Utils.showNotification('二重软上限挑战完成！反物质对物质产生极低增幅效果');
    }
}

// 挑战7完成检测：熵增定律
function checkChallenge7Complete() {
    if (challengeState.inChallenge && challengeState.challengeId === 7 && Game.state.currentMatter.gte(new OmegaNum('1e8'))) {
        challengeState.inChallenge = false;
        challengeState.completed[7] = true;
        challengeState.challengeId = null;

        // 发放奖励：熵减逆转 - 生成器不再降级，且每个生成器产量+20%
        Game.state.challenge7Reward = true;
        
        // 挑战完成后执行坍缩重置
        if (typeof Game.collapseReset === 'function') {
            Game.collapseReset();
        }
        
        updateChallengeTabUI();
        if (window.UI && UI.updateUI) UI.updateUI();

        Utils.showNotification('熵增定律挑战完成！生成器稳定且每个产量+20%');
    }
}

// 挑战9完成检测：终极湮灭
function checkChallenge9Complete() {
    if (challengeState.inChallenge && challengeState.challengeId === 9 && Game.state.currentMatter.gte(new OmegaNum('1e40'))) {
        challengeState.inChallenge = false;
        challengeState.completed[9] = true;
        challengeState.challengeId = null;

        // 发放奖励：解锁黑洞系统
        Game.state.challenge9Reward = true;
        Game.state.blackHoleUnlocked = true;
        
        // 清除挑战9状态
        Game.state.tempAnnihilationSqrt = false;
        
        // 挑战完成后执行坍缩重置
        if (typeof Game.collapseReset === 'function') {
            Game.collapseReset();
        }
        
        updateChallengeTabUI();
        if (window.UI && UI.updateUI) UI.updateUI();

        // 显示Antimar剧情对话（一次性）
        if (!Utils.oneTimeDialogs.has('antimar_challenge9_dialog')) {
            const antimarDialogs = [
                {
                    title: 'Antimar',
                    content: '噢，等等…你的破仓库好像不太稳定了？看！它被我的力量吓坏了？坍缩了？',
                    titleBgColor: '#8B0000',
                    width: '400px',
                    height: '400px',
                    waitTime: 1
                },
                {
                    title: 'Antimar',
                    content: '啊哈，变成这黑漆漆的一团了？有意思。前方似乎只剩这么一个了？要不要…去看看？',
                    titleBgColor: '#8B0000',
                    width: '400px',
                    height: '400px',
                    waitTime: 1
                },
                {
                    title: 'Antimar',
                    content: '放心，虽然看起来像会把你撕碎的黑洞…',
                    titleBgColor: '#8B0000',
                    width: '400px',
                    height: '400px',
                    waitTime: 1
                },
                {
                    title: 'Antimar',
                    content: '凭你现在的\'身体素质\'，或许能剩下一口气？',
                    titleBgColor: '#8B0000',
                    width: '400px',
                    height: '400px',
                    waitTime: 1
                },
                {
                    title: 'Antimar',
                    content: '我就先去打盹了。好运！',
                    titleBgColor: '#8B0000',
                    width: '400px',
                    height: '400px',
                    waitTime: 1
                }
            ];
            
            Utils.showDialogSequence(antimarDialogs, function() {
                // 对话完成后解锁黑洞选项卡
                const blackholeTabBtn = document.getElementById('blackholeTabBtn');
                if (blackholeTabBtn) {
                    blackholeTabBtn.style.display = '';
                }
            }, 'antimar_challenge9_dialog');
        } else {
            // 如果对话已经显示过，直接解锁黑洞选项卡
            const blackholeTabBtn = document.getElementById('blackholeTabBtn');
            if (blackholeTabBtn) {
                blackholeTabBtn.style.display = '';
            }
        }
        
        Utils.showNotification('终极湮灭挑战完成！黑洞投喂系统已解锁！');
    }
}

// 黑洞投喂系统
const blackholeChallenge = {
    inChallenge: false,
    startTime: 0
};

// 导出到全局
window.blackholeChallenge = blackholeChallenge;

// 启动投喂黑洞
function startBlackholeChallenge() {
    if (blackholeChallenge.inChallenge) return;
    
    blackholeChallenge.inChallenge = true;
    blackholeChallenge.startTime = Date.now();
    
    // 执行黑洞重置
    performBlackholeReset();
    
    Utils.showNotification('开始投喂黑洞！物质获取变为log10，升级被禁用，距离功能失效。');
    
    if (window.UI && UI.updateUI) UI.updateUI();
}

// 黑洞重置
function performBlackholeReset() {
    // 坍缩重置
    if (typeof Game.collapseReset === 'function') {
        Game.collapseReset();
    }
    
    // 重置距离相关（保留maxDistance以维持里程碑）
    Game.state.distance = new OmegaNum(0);
    Game.state.annihilationDistance = new OmegaNum(0);
    // 不重置maxDistance，保持距离里程碑有效
    // Game.state.maxDistance = new OmegaNum(0);
    // 不重置湮灭能量，但会在离开挑战时重置
    // Game.state.annihilationEnergy = new OmegaNum(0);
    Game.state.annihilatedDistance = new OmegaNum(0);
    
    // 重置距离能量系统
    Game.state.distanceEnergyBought = new OmegaNum(0);
    Game.state.distanceEnergyProduced = new OmegaNum(0);
    Game.state.distanceEnergyProduction = new OmegaNum(0);
    Game.state.distanceEnergyCost = new OmegaNum('1e6');
    
    // 重置跞禼能量系统
    Game.state.kuaEnergyBought = new OmegaNum(0);
    Game.state.kuaEnergyProduced = new OmegaNum(0);
    Game.state.kuaEnergyProduction = new OmegaNum(0);
    Game.state.kuaEnergyCost = new OmegaNum('1e10');
    Game.state.kuaEnergyGenerators = 0;
    
    // 重置跠禽能量系统
    Game.state.genQinEnergyBought = new OmegaNum(0);
    Game.state.genQinEnergyProduced = new OmegaNum(0);
    Game.state.genQinEnergyProduction = new OmegaNum(0);
    Game.state.genQinEnergyCost = new OmegaNum('1e15');
    Game.state.genQinEnergyGenerators = 0;
    
    // 重置跠禾能量系统
    Game.state.kuoHeEnergyBought = new OmegaNum(0);
    Game.state.kuoHeEnergyProduced = new OmegaNum(0);
    Game.state.kuoHeEnergyProduction = new OmegaNum(0);
    Game.state.kuoHeEnergyCost = new OmegaNum('9.461e18');
    Game.state.kuoHeEnergyGenerators = 0;
    
    // 重置四种能量
    Game.state.energy = new OmegaNum(0);
    Game.state.darkEnergy = new OmegaNum(0);
    Game.state.voidEnergy = new OmegaNum(0);
    Game.state.quantumEnergy = new OmegaNum(0);
    
    // 重置距离里程碑（虽然是动态计算的，但确保对象存在）
    if (Game.state.distanceMilestones) {
        Game.state.distanceMilestones = {};
    }
    
    // 重置距离系统相关的对话框状态
    Game.state.euclidarDialogShown = false;
    
    // 重置挑战状态（除了挑战9）
    challengeState.inChallenge = false;
    challengeState.challengeId = null;
    for (let i = 1; i <= 8; i++) { // 只重置挑战1-8
        challengeState.completed[i] = false;
    }
    // 保留挑战9的完成状态
    
    // 重置挑战奖励状态（保留挑战9奖励，因为它解锁黑洞投喂系统）
    Game.state.challenge1Reward = false;
    Game.state.challenge2Reward = false;
    Game.state.challenge3Reward = false;
    Game.state.challenge4Reward = false;
    Game.state.challenge5Reward = false;
    Game.state.challenge6Reward = false;
    Game.state.challenge7Reward = false;
    Game.state.challenge8Reward = false;
    // 注意：不重置challenge9Reward，因为它是解锁黑洞系统的关键
    
    // 重置物质为1
    Game.state.currentMatter = new OmegaNum(1);
    
    // 重置生成器和增强器数量
    Game.state.generatorCount = 1;
    Game.state.enhancerCount = 0;
    
    // 重置增强器倍率为1（修复投喂黑洞时物质无法生成的问题）
    Game.state.enhancerMultiplier = new OmegaNum(1);
    
    // 重置生成器和增强器对象
    Game.state.generators = {};
    Game.state.boosters = {};
}

// 检查是否可以停止投喂黑洞
function canExitBlackholeChallenge() {
    return blackholeChallenge.inChallenge && Game.state.currentMatter.gte(new OmegaNum(10));
}

// 停止投喂黑洞
function exitBlackholeChallenge() {
    if (!canExitBlackholeChallenge()) {
        Utils.showNotification('需要至少10物质才能停止投喂黑洞！');
        return;
    }
    
    blackholeChallenge.inChallenge = false;
    
    // 停止投喂黑洞时重置湮灭能量
    Game.state.annihilationEnergy = new OmegaNum(0);
    
    Utils.showNotification('成功停止投喂黑洞！湮灭能量已重置。');
    
    if (window.UI && UI.updateUI) UI.updateUI();
}

// 显示黑洞投喂描述
function showBlackholeDescription() {
    Utils.createCustomDialog({
        title: '投喂黑洞',
        content: '投喂黑洞：<br><br>• 将你的物质和反物质投入黑洞<br>• 黑洞质量增加，获得黑洞碎片<br>• 黑洞碎片可以兑换时间能量<br>• 时间能量提供强大的增益效果<br>• 投喂后会执行黑洞重置，保留挑战9奖励<br><br>这是一个永久性的进度系统，不是挑战！',
        titleBgColor: '#4a0e4e',
        bgColor: '#1a0d2e',
        contentColor: '#e0b3ff',
        width: '500px',
        height: '300px',
        buttons: [{
            text: '确定',
            color: '#ffffff',
            bgColor: '#8a2be2'
        }]
    });
}

// 挑战8完成检测：单一生成器
function checkChallenge8Complete() {
    if (challengeState.inChallenge && challengeState.challengeId === 8 && Game.state.currentMatter.gte(new OmegaNum('1e12'))) {
        challengeState.inChallenge = false;
        challengeState.completed[8] = true;
        challengeState.challengeId = null;

        // 设置挑战8奖励标志以触发成就
        Game.state.challenge8Reward = true;

        // 挑战完成后执行坍缩重置
        if (typeof Game.collapseReset === 'function') {
            Game.collapseReset();
        }
        
        updateChallengeTabUI();
        if (window.UI && UI.updateUI) UI.updateUI();

        // 显示反物质之神对话框序列
        const antimarDialogs = [
            {
                title: 'Antimar',
                content: '嘿！小家伙，干得不错嘛！我是Antimar，反物质之神。',
                titleBgColor: '#8B0000',
                width: '400px',
                height: '400px',
                waitTime: 1
            },
            {
                title: 'Antimar', 
                content: '我从第一粒物质出现就在观察你了。啧啧，居然完成了挑战8…',
                titleBgColor: '#8B0000',
                width: '400px',
                height: '400px',
                waitTime: 1
            },
            {
                title: 'Antimar',
                content: '真是令人，嗯，还算印象深刻？不过……',
                titleBgColor: '#8B0000', 
                width: '400px',
                height: '400px',
                waitTime: 1
            },
            {
                title: 'Antimar',
                content: '我其实设下了第九个挑战。嘘……别紧张，它就在… 几光年外？',
                titleBgColor: '#8B0000',
                width: '400px',
                height: '400px',
                waitTime: 1
            },
            {
                title: 'Antimar',
                content: '对人类而言遥不可及，对我而言么，一步之遥。想试试？',
                titleBgColor: '#8B0000',
                width: '400px',
                height: '400px',
                waitTime: 1
            },
            {
                title: 'Antimar',
                content: '我发现了你使用【湮灭能量】的才能。或许……它能帮你\'折叠\'距离？',
                titleBgColor: '#8B0000',
                width: '400px',
                height: '400px',
                waitTime: 1
            }
        ];
        
        Utils.showDialogSequence(antimarDialogs, function() {
            // 对话框序列结束后解锁距离系统
            if (!Game.state.distanceUnlocked) {
                Game.state.distanceUnlocked = true;
                // 挑战8完成，距离系统已解锁
                
                // 更新UI显示距离选项卡
                const distanceTabBtn = document.getElementById('distanceTabBtn');
                if (distanceTabBtn) {
                    distanceTabBtn.style.display = '';
                }
                
                if (window.UI && UI.updateUI) UI.updateUI();
            }
        }, 'antimar_challenge8_dialog');
    }
}

// 扩展挑战Tab UI更新函数
const oldUpdateChallengeTabUI = updateChallengeTabUI;
updateChallengeTabUI = function() {
    oldUpdateChallengeTabUI();
    
    // 确保Game和Game.state已初始化
    if (!window.Game || !Game.state) {
        return;
    }

    // 挑战9卡片显示控制 - 最大距离超过50光年就显示
    const challenge9Card = document.getElementById('challenge9Card');
    if (challenge9Card) {
        const fiftyLightYears = new OmegaNum('4.7305e17'); // 50光年
        if (Game.state.maxDistance && Game.state.maxDistance.gte(fiftyLightYears)) {
            challenge9Card.style.display = 'flex';
        } else {
            challenge9Card.style.display = 'none';
        }
    }

    // 挑战4-9的状态更新
    for (let i = 4; i <= 9; i++) {
        const challengeStatus = document.getElementById(`challenge${i}Status`);
        const startBtn = document.getElementById(`startChallenge${i}Btn`);
        const giveUpBtn = document.getElementById(`giveUpChallenge${i}Btn`);

        if (challengeStatus) {
            if (challengeState.inChallenge && challengeState.challengeId === i) {
                challengeStatus.textContent = '正在进行中...';
                if (startBtn) startBtn.style.display = 'none';
                if (giveUpBtn) giveUpBtn.style.display = '';
            } else if (challengeState.completed[i]) {
                challengeStatus.textContent = '已完成！';
                if (startBtn) startBtn.style.display = '';
                if (giveUpBtn) giveUpBtn.style.display = 'none';
            } else if ((i === 4 && !challengeState.completed[3]) || (i === 9 && !(Game.state.maxDistance && Game.state.maxDistance.gte(new OmegaNum('4.7305e17')))) || (i > 4 && i < 9 && !challengeState.completed[i-1])) {
                // 挑战4需要先完成挑战3，挑战9需要最大距离超过50光年，其他挑战需要按顺序完成
                if (i === 9) {
                    challengeStatus.textContent = '需要最大距离超过50光年';
                } else {
                    challengeStatus.textContent = `需要先完成第${i === 4 ? 3 : i-1}个挑战`;
                }
                if (startBtn) {
                    startBtn.style.display = '';
                    startBtn.disabled = true;
                    // 添加灰色样式
                    startBtn.style.opacity = '0.5';
                    startBtn.style.cursor = 'not-allowed';
                }
                if (giveUpBtn) giveUpBtn.style.display = 'none';
            } else {
                challengeStatus.textContent = '';
                if (startBtn) {
                    startBtn.style.display = '';
                    startBtn.disabled = false;
                    // 恢复正常样式
                    startBtn.style.opacity = '1';
                    startBtn.style.cursor = 'pointer';
                }
                if (giveUpBtn) giveUpBtn.style.display = 'none';
            }
        }
    }
};

// 导出挑战激活状态检测函数到全局
window.isChallenge1Active = isChallenge1Active;
window.isChallenge2Active = isChallenge2Active;
window.isChallenge3Active = isChallenge3Active;
window.isChallenge4Active = isChallenge4Active;
window.isChallenge5Active = isChallenge5Active;
window.isChallenge6Active = isChallenge6Active;
window.isChallenge7Active = isChallenge7Active;
window.isChallenge8Active = isChallenge8Active;
window.isChallenge9Active = isChallenge9Active;

// 创建挑战激活函数供Game.startChallenge调用
window.activateChallenge4 = function() {
    startChallengeInternal(4);
};

window.activateChallenge5 = function() {
    startChallengeInternal(5);
};

window.activateChallenge6 = function() {
    startChallengeInternal(6);
};

window.activateChallenge7 = function() {
    startChallengeInternal(7);
};

window.activateChallenge8 = function() {
    startChallengeInternal(8);
};

window.activateChallenge9 = function() {
    console.log('activateChallenge9被调用');
    startChallengeInternal(9);
};

// 添加挑战9状态检查函数
window.checkChallenge9Status = function() {
    console.log('=== 挑战9状态检查 ===');
    console.log('挑战状态 inChallenge:', challengeState.inChallenge);
    console.log('当前挑战ID:', challengeState.challengeId);
    console.log('挑战9是否激活:', isChallenge9Active());
    console.log('当前物质:', Utils.formatOmegaNum ? Utils.formatOmegaNum(Game.state.currentMatter) : Game.state.currentMatter.toString());
    console.log('tempAnnihilationSqrt:', Game.state.tempAnnihilationSqrt);
    console.log('挑战9完成状态:', challengeState.completed[9]);
    console.log('挑战9奖励状态:', Game.state.challenge9Reward);
    console.log('========================');
};

// 内部挑战启动函数
function startChallengeInternal(i) {
    // 投喂黑洞期间禁用其他挑战
    if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) {
        Utils.showNotification('投喂黑洞期间无法启动其他挑战！', 'error');
        return;
    }
    
    // 挑战前的检查，如果需要特殊条件可以在这里添加
    if ((i === 4 && !challengeState.completed[3]) || (i === 9 && !(Game.state.maxDistance && Game.state.maxDistance.gte(new OmegaNum('4.7305e17')))) || (i > 4 && i < 9 && !challengeState.completed[i-1])) {
        return;
    }

    // 通用的挑战启动逻辑
    challengeState.inChallenge = true;
    challengeState.challengeId = i;

    // 重置游戏状态为挑战初始状态
    Utils.resetGameProgressWithUpgrades();

    // 根据不同挑战设置特殊状态（在重置后设置）
    if (i === 4) {
        // 时间扭曲挑战初始化
        Game.state.tempMatterMultiplier = 0.1; // 物质产量÷10
    } else if (i === 7) {
        // 反物质扭曲挑战，确保有至少100反物质
        if (Game.state.antimatter.lt(new OmegaNum(100))) {
            Game.state.antimatter = new OmegaNum(100);
        }
        // 设置挑战7开始时间
        Game.state.challenge7StartTime = Date.now();
    } else if (i === 8) {
        // 单一生成器挑战：初始拥有1个生成器，禁止购买生成器，目标1e12物质，无奖励
        // 注意：collapseReset()将物质重置为10，生成器重置为0，所以需要重新设置
        Game.state.currentMatter = new OmegaNum(10); // 保持默认初始物质
        Game.state.generatorCount = 1; // 初始拥有1个生成器
    } else if (i === 9) {
        // 终极湮灭挑战：禁止购买增强器，湮灭能量增益开平方
        Game.state.currentMatter = new OmegaNum(10);
        Game.state.generatorCount = 1;
        Game.state.tempAnnihilationSqrt = true;
    }

    // 更新UI
    updateChallengeTabUI();
    saveChallengeState();
}

// 扩展绑定挑战按钮函数
const oldBindChallengeButtons = bindChallengeButtons;
bindChallengeButtons = function() {
    oldBindChallengeButtons();

    // 绑定挑战4-9的按钮
    for (let i = 4; i <= 9; i++) {
        const startBtn = document.getElementById(`startChallenge${i}Btn`);
        const giveUpBtn = document.getElementById(`giveUpChallenge${i}Btn`);

        if (startBtn) {
            startBtn.onclick = function() {
                startChallengeInternal(i);
            };
        }

        if (giveUpBtn) {
            giveUpBtn.onclick = function() {
                if (challengeState.inChallenge && challengeState.challengeId === i) {
                    if (window.clearAllChallengeEffects) {
                        window.clearAllChallengeEffects(); // 清除所有挑战效果
                    }
                    challengeState.inChallenge = false;
                    challengeState.challengeId = null;

                    // 清除特殊挑战状态
                    if (i === 4) {
                        delete Game.state.tempMatterMultiplier;
                    } else if (i === 9) {
                        Game.state.tempAnnihilationSqrt = false;
                    }

                    // 恢复正常游戏状态
                    Utils.resetGameProgressWithUpgrades();
                    updateChallengeTabUI();

                    // 恢复自动化选项卡显示
                    const automationTabBtn = document.getElementById('automationTabBtn');
                    if (automationTabBtn && Game && Game.state && Game.state.automationUnlocked) {
                        automationTabBtn.style.display = '';
                    }

                    // 恢复升级选项卡显示
                    const upgradesTab = document.querySelector('.tab[data-tab="upgrades"]');
                    if (upgradesTab) {
                        upgradesTab.style.display = '';
                    }

                    // 移除通知以减少干扰
                    saveChallengeState();
                }
            };
        }
    }
};

// 实现创新挑战效果的函数
function updateChallengeEffects(deltaTime) {
    // 投喂黑洞期间禁用所有其他挑战效果
    if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) {
        return;
    }
    
    // 挑战4：维度折叠 - 物质生产速度除以10，没有增强器效果
    if (isChallenge4Active()) {
        Game.state.tempMatterMultiplier = 0.1; // 物质生产速度除以10
        Game.state.tempBoosterDisabled = true; // 禁用增强器效果
    }

    // 挑战5：能量守恒 - 每次购买消耗全部物质，增强器效果不翻倍
    if (isChallenge5Active()) {
        Game.state.tempBoosterNoDouble = true; // 增强器效果不翻倍
        // 购买时消耗全部物质的逻辑在购买函数中处理
    }

    // 挑战6：二重软上限 - 物质超过1万时启动二重软上限
    if (isChallenge6Active()) {
        // 二重软上限逻辑在game.js中处理
        // 这里不需要额外的逻辑，因为二重软上限会在game.js的主循环中自动应用
    }

    // 挑战7：熵增定律 - 通知逻辑（减益逻辑已移至calculateMatterPerSecond）
    if (isChallenge7Active()) {
        if (!Game.state.challenge7StartTime) {
            Game.state.challenge7StartTime = Date.now();
        }
        const timeElapsed = (Date.now() - Game.state.challenge7StartTime) / 1000; // 秒
        const reductionRate = Math.min(0.99, 0.1 + timeElapsed * 0.01); // 生成速度减少10%+时间*1%，最高99%
        
        // 移除频繁通知以减少干扰
    }

    // 挑战8：单一生成器 - 只能使用一个生成器，禁止购买更多
    if (isChallenge8Active()) {
        // 禁止购买生成器的逻辑在购买函数中处理
        // 这里不需要额外的持续效果
    }

    // 挑战9：终极湮灭 - 禁止购买增强器，湮灭能量增益开平方
    if (isChallenge9Active()) {
        Game.state.tempAnnihilationSqrt = true;
    } else {
        Game.state.tempAnnihilationSqrt = false;
    }

    // 应用挑战奖励效果
    applyRewards(deltaTime);
}

// 应用创新挑战奖励效果
function applyRewards(deltaTime) {
    // 投喂黑洞期间禁用所有挑战奖励效果
    if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) {
        return;
    }
    
    // 挑战4奖励：维度稳定 - 生成器效率稳定且基础效率+25%
    if (Game.state.challenge4Reward) {
        if (!Game.state.tempGeneratorEfficiency || Game.state.tempGeneratorEfficiency < 1) {
            Game.state.tempGeneratorEfficiency = 1.25; // 基础效率+25%
        }
    }

    // 挑战5奖励：能量循环 - 购买升级时返还50%物质消耗（在购买时处理）
    if (Game.state.challenge5Reward) {
        // 效果在购买升级时触发
    }

    // 挑战6奖励：量子稳定 - 物质产量波动范围缩小，平均产量+30%
    if (Game.state.challenge6Reward) {
        if (!Game.state.tempMatterMultiplier || Game.state.tempMatterMultiplier < 1) {
            Game.state.tempMatterMultiplier = 1.3; // 平均产量+30%
        }
    }

    // 挑战7奖励：熵减逆转 - 生成器不再降级，且每个生成器产量+20%
    if (Game.state.challenge7Reward) {
        Game.state.tempGeneratorBonus = 1.2; // 每个生成器产量+20%
    }

    // 挑战8奖励：无

    // 挑战9奖励：解锁黑洞投喂系统
    if (Game.state.challenge9Reward) {
        // 黑洞系统已解锁，具体效果待实现
    }

}

// 清理临时效果变量的函数
function clearChallengeEffects() {
    delete Game.state.tempGeneratorEfficiency;
    delete Game.state.tempMatterMultiplier;
    delete Game.state.tempGeneratorBonus;
    delete Game.state.tempAllProductionBonus;
    delete Game.state.immuneToRandomReset;
    delete Game.state.challenge4StartTime;
    delete Game.state.challenge6LastUpdate;
    delete Game.state.challenge7LastDowngrade;
    delete Game.state.challenge8StartTime;
    delete Game.state.tempMatterReduction;
}

// 修改Game对象的update方法以应用挑战效果
const originalGameUpdate = Game.update;
Game.update = function(deltaTime) {
    // 时间扭曲挑战效果
    if (typeof isChallenge4Active === 'function' && isChallenge4Active()) {
        deltaTime *= 0.5; // 游戏时间流速降低
    }

    // 先应用所有挑战的持续效果和奖励（在原始更新之前）
    if (typeof updateChallengeEffects === 'function') {
        updateChallengeEffects(deltaTime);
    }

    // 然后调用原始更新
    if (originalGameUpdate) {
        originalGameUpdate.call(this, deltaTime);
    }

    // 检查所有挑战的完成状态
    if (typeof checkChallenge1Complete === 'function') checkChallenge1Complete();
    if (typeof checkChallenge2Complete === 'function') checkChallenge2Complete();
    if (typeof checkChallenge3Complete === 'function') checkChallenge3Complete();
    if (typeof checkChallenge4Complete === 'function') checkChallenge4Complete();
    if (typeof checkChallenge5Complete === 'function') checkChallenge5Complete();
    if (typeof checkChallenge6Complete === 'function') checkChallenge6Complete();
    if (typeof checkChallenge7Complete === 'function') checkChallenge7Complete();
    if (typeof checkChallenge8Complete === 'function') checkChallenge8Complete();
    if (typeof checkChallenge9Complete === 'function') {
        checkChallenge9Complete();
    }
};

// 挑战7效果已移至game.js的updateMatterPerSecond函数中

// 导出挑战6和挑战9激活状态检测函数到全局
window.isChallenge6Active = isChallenge6Active;
window.isChallenge9Active = isChallenge9Active;

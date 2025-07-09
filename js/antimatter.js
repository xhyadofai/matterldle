function updateAntimatterDisplay() {
    document.getElementById('antimatter').textContent = Utils.formatOmegaNum(Game.state.antimatter);
    updateNewEraButtonState();

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
    }
});

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
    let displayE;
    if (E.lt(1e6)) {
        displayE = E.round().toNumber().toLocaleString();
    } else {
        displayE = E.toExponential(3).replace('+', '');
    }
    energySpan.textContent = displayE;
    // 计算倍率
    const ln = Math.log;
    const bonus = 1 + (ln(E.plus(1).toNumber()) / ln(2e5 + 1)) * (1 + 0.5 * Math.sqrt(E.div(1e5).toNumber()));
    bonusDiv.textContent = `当前产量倍率：×${bonus.toFixed(3)}`;
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
            if (challengeState.completed[1] && challengeState.completed[2] && challengeState.completed[3]) {
                completeArea.style.display = '';
                completeArea.innerHTML = '所有挑战完成！奖励：软上限消失 + 自动化间隔2秒';
            } else if (challengeState.completed[1] && challengeState.completed[2]) {
                completeArea.style.display = '';
                completeArea.innerHTML = '挑战1和2完成！奖励：软上限消失';
            } else if (challengeState.completed[1]) {
                completeArea.style.display = '';
                completeArea.innerHTML = '挑战1完成！奖励：密度和压缩物质升级效果×2（密度×4，压缩物质sqrt(log(matter))×2，扩大仓库容量0.05）';
            } else {
                completeArea.style.display = 'none';
            }
        }
        
        // 挑战1按钮状态
        if (startBtn1) startBtn1.style.display = (challengeState.inChallenge || challengeState.completed[1]) ? 'none' : '';
        if (giveUpBtn1) giveUpBtn1.style.display = (challengeState.inChallenge && challengeState.challengeId === 1) ? '' : 'none';
        
        // 挑战2按钮状态
        if (startBtn2) startBtn2.style.display = (challengeState.inChallenge || !challengeState.completed[1] || challengeState.completed[2]) ? 'none' : '';
        if (giveUpBtn2) giveUpBtn2.style.display = (challengeState.inChallenge && challengeState.challengeId === 2) ? '' : 'none';
        
        // 挑战3按钮状态
        if (startBtn3) startBtn3.style.display = (challengeState.inChallenge || !challengeState.completed[1] || !challengeState.completed[2] || challengeState.completed[3]) ? 'none' : '';
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
            challengeState.inChallenge = true;
            challengeState.challengeId = 1;
            Utils.resetGameProgressWithUpgrades();
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
            challengeState.inChallenge = true;
            challengeState.challengeId = 2;
            Utils.resetGameProgressWithUpgrades();
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
            challengeState.inChallenge = true;
            challengeState.challengeId = 3;
            Utils.resetGameProgressWithUpgrades();
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
                console.log('挑战解锁成功！');
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
            const totalAntimatter = Game.state.antimatter;
            const gain = totalAntimatter.mul(2);
            console.log('[坍缩调试] 反物质:', totalAntimatter.toString(), 'gain:', gain.toString());
            Game.state.annihilationEnergy = Game.state.annihilationEnergy.add(gain);
            if (gain.gt(Game.state.annihilationEnergyPeak || new OmegaNum(0))) Game.state.annihilationEnergyPeak = gain;
            Game.state.annihilationTime = 0;
            
            // 保存升级状态和增益，坍缩不应该重置这些
            const savedUpgrades = { ...Game.state.upgrades };
            const savedMatterMultiplier = Game.state.matterMultiplier;
            const savedNewEraUnlocked = Game.state.newEraUnlocked;
            
            console.log('[坍缩调试] 保存的升级状态:', savedUpgrades);
            console.log('[坍缩调试] 保存的物质倍率:', savedMatterMultiplier.toString());
            
            // 重置一切
            if (window.Utils && Utils.resetGameProgress) {
                Utils.resetGameProgress();
            } else {
                // 兜底：保留原重置逻辑，但也要保存升级状态
                Game.state.currentMatter = new OmegaNum(10);
                Game.state.generatorCount = 0;
                Game.state.generatorCost = new OmegaNum(10);
                Game.state.enhancerCount = 0;
                Game.state.enhancerCost = new OmegaNum(100);
                Game.state.enhancerMultiplier = new OmegaNum(1);
                Game.state.antimatter = new OmegaNum(0);
                Game.state.antimatterUnlocked = false;
                
                // 恢复升级状态和增益
                Game.state.upgrades = savedUpgrades;
                Game.state.matterMultiplier = savedMatterMultiplier;
                Game.state.newEraUnlocked = savedNewEraUnlocked;
                
                if (window.Game && Game.updateMatterPerSecond) Game.updateMatterPerSecond();
                if (window.UI && UI.updateUI) UI.updateUI();
            }
            
            console.log('[坍缩调试] 重置后的升级状态:', Game.state.upgrades);
            console.log('[坍缩调试] 重置后的物质倍率:', Game.state.matterMultiplier.toString());
            
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
    // 反物质子选项卡切换逻辑
    document.querySelectorAll('.sub-tab').forEach(subTab => {
        subTab.addEventListener('click', () => {
            const parentTab = subTab.closest('.tab-content');
            parentTab.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
            subTab.classList.add('active');
            parentTab.querySelectorAll('.sub-tab-content').forEach(content => content.style.display = 'none');
            const subTabId = subTab.getAttribute('data-subtab') + '-content';
            const showContent = parentTab.querySelector('#' + subTabId);
            if (showContent) showContent.style.display = 'block';
            // 坍缩tab特殊处理
            if (subTab.getAttribute('data-subtab') === 'collapse') {
                updateCollapseTabUI();
            }
        });
    });
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
          console.log('反物质不足！需要100反物质才能升级。');
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
    if (challengeState.inChallenge && challengeState.challengeId === 1 && Game.state.currentMatter.gte(new OmegaNum('5e8'))) {
        challengeState.inChallenge = false;
        challengeState.completed[1] = true;
        challengeState.challengeId = null;
        // 发放奖励（示例：设置奖励标志，具体加成在主逻辑中实现）
        Game.state.challenge1Reward = true;
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
        Utils.showNotification('第一个挑战完成！奖励已发放');
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
    if (challengeState.inChallenge && challengeState.challengeId === 3 && Game.state.currentMatter.gte(new OmegaNum('5e8'))) {
        challengeState.inChallenge = false;
        challengeState.completed[3] = true;
        challengeState.challengeId = null;
        // 发放奖励：自动化间隔变为2秒
        Game.state.challenge3Reward = true;
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
        Utils.showNotification('第三个挑战完成！自动化间隔已变为2秒');
    }
}
// 在主循环或antimatter产出后调用checkChallenge1Complete()
// 在主循环中调用checkChallenge2Complete()
// 成就系统
const Achievements = {
    list: [
        { id: 1, name: '新的开始', desc: '购买一个生成器', check: () => Game.state.generatorCount >= 1 },
        { id: 2, name: '100个物质不是很多', desc: '达到100个物质', check: () => Game.state.currentMatter.gte(100) },
        { id: 3, name: '质量不守恒了', desc: '购买一个增强器', check: () => Game.state.enhancerCount >= 1 },
        { id: 4, name: '500个物质也不是很多', desc: '达到500个物质', check: () => Game.state.currentMatter.gte(500) },
        { id: 5, name: '增强器狂潮', desc: '购买7个增强器', check: () => Game.state.enhancerCount >= 7 },
        { id: 6, name: '这么早就自动化了？', desc: '解锁自动化', check: () => Game.state.automationUnlocked },
        { id: 7, name: '反物质?', desc: '获得反物质', check: () => Game.state.antimatter.gte(1) },
        { id: 8, name: '新时代!', desc: '购买新时代升级', check: () => Game.state.newEraUnlocked },
        { id: 9, name: '逆天膨胀', desc: '物质达到1e10', check: () => Game.state.currentMatter.gte('1e10') },
        { id: 10, name: '800个反物质不是很多', desc: '反物质达到800', check: () => Game.state.antimatter.gte(800) },
        { id: 11, name: '啥是坍缩', desc: '坍缩一次', check: () => Game.state.annihilationUnlocked },
        { id: 12, name: '这游戏还有挑战？', desc: '解锁挑战', check: () => Game.state.challengeUnlocked },
        { id: 13, name: '这挑战还行吧', desc: '通过挑战一', check: () => Game.state.challenge1Reward },
        { id: 14, name: '那很墙了', desc: '通过第二个挑战', check: () => Game.state.challenge2Reward },
        { id: 15, name: '三生万物', desc: '完成第三个挑战，证明你已掌握基础物质操控', check: () => Game.state.challenge3Reward },
        { id: 16, name: '维度折叠大师', desc: '在生成器效率不断衰减的维度折叠中达成目标', check: () => Game.state.challenge4Reward },
        { id: 17, name: '能量守恒专家', desc: '在每次升级都要消耗物质的能量守恒定律下完成挑战', check: () => Game.state.challenge5Reward },
        { id: 18, name: '反物质增幅大师', desc: '完成挑战6：获得反物质对物质的增幅效果', check: () => Game.state.challenge6Reward },
        { id: 19, name: '熵增抗争者', desc: '在生成器不断随机降级的熵增定律中坚持到底', check: () => Game.state.challenge7Reward },
        { id: 20, name: '概率大师', desc: '在概率坍缩的混沌中找到秩序，证明运气也是实力的一部分', check: () => Game.state.challenge8Reward },
        { id: 21, name: '距离之神', desc: '与距离之神Euclidar完成对话', check: () => Game && Game.state && Game.state.euclidarDialogCompleted },
        { id: 22, name: '你说多少？', desc: '购买11个增强器', check: () => Game.state.enhancerCount >= 11 },
        { id: 23, name: '指数爆炸', desc: '距离达到1e6光年', check: () => Game.state.maxDistance && Game.state.maxDistance.gte(new OmegaNum('9.461e21')) },
        { id: 24, name: '增强器棍母化', desc: '完成挑战9', check: () => Game.state.challenge9Reward },
    ],
    hidden: [
        { id: 101, name: '徒劳无功', desc: '乱输开发者模式密码，还指望自己能作弊', unlocked: false },
        { id: 102, name: 'wssjb', desc: '在开发者模式密码框里面输入 woshishenjingbing', unlocked: false },
        { id: 103, name: '彩蛋狂热者', desc: '在一次游戏中查看5次彩蛋页面', unlocked: false },
        { id: 104, name: '你是没事儿干吗？', desc: '在一次游戏中查看20次彩蛋页面', unlocked: false },
        { id: 105, name: '犹豫不决', desc: '点击5次捐款按钮却没有打开链接', unlocked: false },
        { id: 106, name: '全游戏最简单的成就', desc: '就是点一下这个成就', unlocked: false },
        { id: 107, name: '我是神经病', desc: '在开发者模式输入框输入"我是神经病"', unlocked: false },
        { id: 108, name: '全游戏最难的成就', desc: '点击这个成就50下', unlocked: false },
        { id: 109, name: '小丑', desc: '通过查看源码找到开发者密码并成功进入开发者模式', unlocked: false },
        { id: 111, name: '你想帮作者更新？', desc: '修改游戏版本号', unlocked: false },
        { id: 112, name: '2^1024年之后的一次更新', desc: '将版本号改为1.79e308', unlocked: false },
        { id: 113, name: '破碎之地', desc: '尝试使用已被删除的功能', unlocked: false },
        { id: 114, name: '尽力辩解', desc: '在开发者模式密码框输入"我不是神经病"', unlocked: false },
        { id: 115, name: '那是真的很无聊了', desc: '点击彩蛋里的"我很无聊"按钮5次', unlocked: false },
        { id: 116, name: '想得美', desc: '试图通过测试按钮解锁黑洞功能', unlocked: false },
        { id: 117, name: '白干了', desc: '在任意挑战中进行坍缩', check: () => Game && Game.state && Game.state.achievements && Game.state.achievements.wastedCollapse },
    ],
    unlocked: {},
    hiddenUnlocked: {},
    checkAll() {
        // 检查常规成就
        this.list.forEach(a => {
            if (!this.unlocked[a.id] && a.check()) {
                this.unlocked[a.id] = true;
                Utils.showNotification(`成就解锁: ${a.name}`, 'success');
                this.render();
            }
        });

        // 检查带有检查功能的隐藏成就
        this.hidden.forEach(a => {
            if (a.check && !this.hiddenUnlocked[a.id] && a.check()) {
                this.unlockHidden(a.id); // unlockHidden会处理通知和渲染
            }
        });
    },
    unlockHidden(id) {
        const ach = this.hidden.find(a => a.id === id);
        if (ach && !this.hiddenUnlocked[id]) {
            this.hiddenUnlocked[id] = true;
            this.render();
            Utils.showNotification('隐藏成就达成：' + ach.name, 'success');
        }
    },
    getSaveData() {
        return {
            unlocked: { ...this.unlocked },
            hiddenUnlocked: { ...this.hiddenUnlocked }
        };
    },
    loadSaveData(data) {
        if (data && data.unlocked) this.unlocked = { ...data.unlocked };
        if (data && data.hiddenUnlocked) this.hiddenUnlocked = { ...data.hiddenUnlocked };
        this.render();
    },
    render() {
        // 普通成就正方形格子
        const grid = document.getElementById('achievementsGrid');
        
        // 确保成就描述框存在
        let achievementDescBox = document.getElementById('achievementDescBox');
        if (!achievementDescBox) {
            // 创建成就描述框
            achievementDescBox = document.createElement('div');
            achievementDescBox.id = 'achievementDescBox';
            achievementDescBox.style.minHeight = '32px';
            achievementDescBox.style.textAlign = 'center';
            achievementDescBox.style.fontSize = '17px';
            achievementDescBox.style.color = '#FFD700';
            achievementDescBox.style.marginTop = '20px';
            achievementDescBox.style.marginBottom = '10px';
            achievementDescBox.style.width = '100%';
            achievementDescBox.style.display = 'none';
            achievementDescBox.style.padding = '10px';
            achievementDescBox.style.boxSizing = 'border-box';
            achievementDescBox.style.borderRadius = '8px';
            achievementDescBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            
            // 将描述框添加到成就选项卡内容的底部
            const achievementsTab = document.getElementById('achievementsTab');
            if (achievementsTab) {
                achievementsTab.appendChild(achievementDescBox);
            }
        }
        
        if (grid) {
            grid.innerHTML = '';
            this.list.forEach((a, i) => {
                const box = document.createElement('div');
                box.textContent = a.name;
                box.style.width = '90px';
                box.style.height = '90px';
                box.style.display = 'flex';
                box.style.alignItems = 'center';
                box.style.justifyContent = 'center';
                box.style.background = this.unlocked[a.id] ? '#FFD700' : '#333';
                box.style.color = this.unlocked[a.id] ? '#222' : '#aaa';
                box.style.fontWeight = 'bold';
                box.style.fontSize = '16px';
                box.style.borderRadius = '10px';
                box.style.boxShadow = this.unlocked[a.id] ? '0 0 8px #FFD700' : '0 0 4px #222';
                box.style.margin = '0';
                box.style.cursor = 'pointer';
                box.style.transition = 'background 0.2s, color 0.2s';
                box.style.userSelect = 'none';
                box.className = 'achievement-box';
                box.onclick = () => {
                    // 获取成就描述框元素
                    const achievementDescBox = document.getElementById('achievementDescBox');
                    
                    if (achievementDescBox) {
                        achievementDescBox.textContent = a.desc;
                        achievementDescBox.style.display = 'block';
                        
                        // 确保描述框可见
                        achievementDescBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                };
                grid.appendChild(box);
            });
        }
        // 隐藏成就
        const hlist = document.getElementById('hiddenAchievementsList');
        if (hlist) {
            hlist.innerHTML = '';
            this.hidden.forEach(a => {
                const box = document.createElement('div');
                box.textContent = a.name; // 始终显示真实名称
                box.style.width = '90px';
                box.style.height = '90px';
                box.style.display = 'inline-flex';
                box.style.alignItems = 'center';
                box.style.justifyContent = 'center';
                box.style.background = this.hiddenUnlocked[a.id] ? '#FFD700' : '#333';
                box.style.color = this.hiddenUnlocked[a.id] ? '#222' : '#aaa';
                box.style.fontWeight = 'bold';
                box.style.fontSize = '16px';
                box.style.borderRadius = '10px';
                box.style.boxShadow = this.hiddenUnlocked[a.id] ? '0 0 8px #FFD700' : '0 0 4px #222';
                box.style.margin = '6px';
                box.style.cursor = 'pointer';
                box.style.userSelect = 'none';
                
                // 为所有隐藏成就添加点击事件
                box.addEventListener('click', () => {
                    // 特殊成就106：全游戏最简单的成就
                    if (a.id === 106) {
                        this.unlockHidden(106);
                        this.render(); // 刷新显示
                    }
                    
                    // 获取成就描述框元素
                    const achievementDescBox = document.getElementById('achievementDescBox');
                    
                    // 只有已解锁的隐藏成就才能查看详情
                    if (this.hiddenUnlocked[a.id] && achievementDescBox) {
                        achievementDescBox.textContent = a.desc;
                        achievementDescBox.style.display = 'block';
                        
                        // 确保描述框可见
                        achievementDescBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                });
                
                if (a.id === 108) {
                    box.style.cursor = 'pointer';
                    box.addEventListener('click', () => {
                        // 隐藏成就108：全游戏最难的成就
                        if (!window.achievement108Clicks) window.achievement108Clicks = 0;
                        window.achievement108Clicks++;
                        
                        if (window.achievement108Clicks >= 50) {
                            this.unlockHidden(108);
                            this.render(); // 刷新显示
                        } else if (window.achievement108Clicks % 10 === 0) {
                            // 每点击10次显示一次提示
                            Utils.showNotification(`还需要点击${50 - window.achievement108Clicks}次`, 'info');
                        }
                    });
                }
                
                hlist.appendChild(box);
            });
        }
    }
};
// 每秒检测成就
setInterval(() => Achievements.checkAll(), 1000);
// 页面加载后渲染
window.addEventListener('DOMContentLoaded', () => Achievements.render());
// 暴露到全局
window.Achievements = Achievements;
// 兼容存档
Achievements.getSaveData = Achievements.getSaveData.bind(Achievements);
Achievements.loadSaveData = Achievements.loadSaveData.bind(Achievements);
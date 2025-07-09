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
    ],
    hidden: [
        { id: 101, name: '徒劳无功', desc: '乱输开发者模式密码，还指望自己能作弊', unlocked: false },
        { id: 102, name: 'woshishenjingbing', desc: '在开发者模式密码框里面输入woshishenjingbing', unlocked: false },
    ],
    unlocked: {},
    hiddenUnlocked: {},
    checkAll() {
        this.list.forEach(a => {
            if (!this.unlocked[a.id] && a.check()) {
                this.unlocked[a.id] = true;
                this.render();
                Utils.showNotification('成就达成：' + a.name, 'success');
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
        const descBox = document.getElementById('achievementDescBox');
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
                box.onmouseenter = () => {
                    if (descBox) descBox.textContent = a.desc;
                };
                box.onmouseleave = () => {
                    if (descBox) descBox.textContent = '';
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
                box.textContent = this.hiddenUnlocked[a.id] ? a.name : '???';
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
                box.style.cursor = 'default';
                box.style.userSelect = 'none';
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
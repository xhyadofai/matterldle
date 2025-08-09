// 时间统计模块
const TimeStats = {
    // 格式化时间显示（秒转为天/时/分/秒）
    formatTimeDisplay(totalSeconds) {
        // 处理小数部分，保留整数部分
        totalSeconds = Math.floor(totalSeconds);

        if (totalSeconds < 60) {
            return `${totalSeconds}秒`;
        }

        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);

        if (totalMinutes < 60) {
            return `${totalMinutes}分${seconds}秒`;
        }

        const minutes = totalMinutes % 60;
        const totalHours = Math.floor(totalMinutes / 60);

        if (totalHours < 24) {
            return `${totalHours}时${minutes}分${seconds}秒`;
        }

        const hours = totalHours % 24;
        const days = Math.floor(totalHours / 24);

        if (days < 365) {
            return `${days}天${hours}时${minutes}分${seconds}秒`;
        }

        const years = Math.floor(days / 365);
        const remainingDays = days % 365;

        return `${years}年${remainingDays}天${hours}时${minutes}分${seconds}秒`;
    },

    // 格式化日期显示
    formatDateDisplay(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    },

    // 更新时间统计显示
    updateTimeStats() {
        if (!Game || !Game.state) return;

        // 计算总游戏时长
        const totalPlayTime = Game.state.onlineTimeSeconds + Game.state.offlineTimeSeconds;

        // 更新各个时间统计显示
        const totalPlayTimeElement = document.getElementById('totalPlayTimeStat');
        const onlineTimeElement = document.getElementById('onlineTimeStat');
        const offlineTimeElement = document.getElementById('offlineTimeStat');
        const saveCreationTimeElement = document.getElementById('saveCreationTimeStat');

        if (totalPlayTimeElement) {
            totalPlayTimeElement.textContent = this.formatTimeDisplay(totalPlayTime);
        }

        if (onlineTimeElement) {
            onlineTimeElement.textContent = this.formatTimeDisplay(Game.state.onlineTimeSeconds);
        }

        if (offlineTimeElement) {
            offlineTimeElement.textContent = this.formatTimeDisplay(Game.state.offlineTimeSeconds);
        }

        if (saveCreationTimeElement) {
            saveCreationTimeElement.textContent = this.formatDateDisplay(Game.state.saveCreationTime);
        }
    },

    // 初始化时间统计模块
    init() {
        // 绑定时间统计子选项卡点击事件
        const timeStatsTabBtn = document.getElementById('timeStatsTabBtn');
        if (timeStatsTabBtn) {
            timeStatsTabBtn.addEventListener('click', () => this.updateTimeStats());
        }

        // 首次更新时间统计
        this.updateTimeStats();

        // 定期更新时间统计（每1秒）
        setInterval(() => this.updateTimeStats(), 1000);
    }
};

// 在页面加载完成后初始化时间统计模块
window.addEventListener('DOMContentLoaded', () => {
    TimeStats.init();
});

// 挂载到全局
window.TimeStats = TimeStats;

// 修改UI.updateUI，在每次UI更新时更新时间统计
if (window.UI) {
    const originalUpdateUI = UI.updateUI;
    UI.updateUI = function() {
        if (typeof originalUpdateUI === 'function') {
            originalUpdateUI.apply(this, arguments);
        }
        // 每10次UI更新更新一次时间统计（为了性能）
        if (UI.frameCounter === 0) {
            TimeStats.updateTimeStats();
        }
    };

    // 添加updateTimeStats方法到UI对象
    UI.updateTimeStats = function() {
        TimeStats.updateTimeStats();
    };
}

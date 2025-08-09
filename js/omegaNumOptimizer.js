// OmegaNum性能优化模块
const OmegaNumOptimizer = {
    // 对象池，用于重用OmegaNum实例
    pool: [],
    poolSize: 500, // 增加对象池大小
    
    // 常用值的缓存
    cache: new Map(),
    
    // 预定义的常用值
    constants: {
        ZERO: null,
        ONE: null,
        TWO: null,
        TEN: null,
        HUNDRED: null,
        THOUSAND: null,
        MILLION: null,
        BILLION: null,
        TRILLION: null,
        MAX_SAFE_INTEGER: null,
        HALF: null,
        QUARTER: null,
        TENTH: null,
        HUNDREDTH: null,
        THOUSANDTH: null
    },
    
    // 初始化常量和缓存
    init() {
        // 预定义常用值
        this.constants.ZERO = new OmegaNum(0);
        this.constants.ONE = new OmegaNum(1);
        this.constants.TWO = new OmegaNum(2);
        this.constants.TEN = new OmegaNum(10);
        this.constants.HUNDRED = new OmegaNum(100);
        this.constants.THOUSAND = new OmegaNum(1000);
        this.constants.MILLION = new OmegaNum(1e6);
        this.constants.BILLION = new OmegaNum(1e9);
        this.constants.TRILLION = new OmegaNum(1e12);
        this.constants.MAX_SAFE_INTEGER = new OmegaNum(Number.MAX_SAFE_INTEGER);
        this.constants.HALF = new OmegaNum(0.5);
        this.constants.QUARTER = new OmegaNum(0.25);
        this.constants.TENTH = new OmegaNum(0.1);
        this.constants.HUNDREDTH = new OmegaNum(0.01);
        this.constants.THOUSANDTH = new OmegaNum(0.001);
        
        // 缓存常用值
        this.cache.set('0', this.constants.ZERO);
        this.cache.set('1', this.constants.ONE);
        this.cache.set('2', this.constants.TWO);
        this.cache.set('10', this.constants.TEN);
        this.cache.set('100', this.constants.HUNDRED);
        this.cache.set('1000', this.constants.THOUSAND);
        this.cache.set('1e6', this.constants.MILLION);
        this.cache.set('1e8', new OmegaNum(1e8));
        this.cache.set('1e9', this.constants.BILLION);
        this.cache.set('5e8', new OmegaNum(5e8));
        this.cache.set('0.5', this.constants.HALF);
        this.cache.set('0.1', this.constants.TENTH);
        this.cache.set('0.05', new OmegaNum(0.05));
        this.cache.set('1.5', new OmegaNum(1.5));
        this.cache.set('1.1', new OmegaNum(1.1));
        this.cache.set('1023', new OmegaNum(1023));
        this.cache.set('1024', new OmegaNum(1024));
        this.cache.set('10000', new OmegaNum(10000));
        this.cache.set('1e-9', new OmegaNum(1e-9));
        this.cache.set('1e-16', new OmegaNum(1e-16));
        this.cache.set('1e-18', new OmegaNum(1e-18));
        
        // OmegaNum优化器已初始化
    },
    
    // 获取或创建OmegaNum实例
    get(value) {
        // 如果是字符串，先检查缓存
        if (typeof value === 'string') {
            if (this.cache.has(value)) {
                this.monitor.recordCall('cache');
                return this.cache.get(value);
            }
        }
        
        // 检查是否是常用数值
        if (typeof value === 'number') {
            const key = value.toString();
            if (this.cache.has(key)) {
                this.monitor.recordCall('cache');
                return this.cache.get(key);
            }
            
            // 对于常用的小数值，也缓存
            if (value === 0) {
                this.monitor.recordCall('cache');
                return this.constants.ZERO;
            }
            if (value === 1) {
                this.monitor.recordCall('cache');
                return this.constants.ONE;
            }
            if (value === 2) {
                this.monitor.recordCall('cache');
                return this.constants.TWO;
            }
            if (value === 10) {
                this.monitor.recordCall('cache');
                return this.constants.TEN;
            }
            if (value === 100) {
                this.monitor.recordCall('cache');
                return this.constants.HUNDRED;
            }
            if (value === 0.5) {
                this.monitor.recordCall('cache');
                return this.constants.HALF;
            }
            if (value === 0.1) {
                this.monitor.recordCall('cache');
                return this.constants.TENTH;
            }
        }
        
        // 从对象池获取或创建新实例
        if (this.pool.length > 0) {
            const instance = this.pool.pop();
            instance.fromValue(value);
            this.monitor.recordCall('pool');
            return instance;
        }
        
        this.monitor.recordCall('new');
        return new OmegaNum(value);
    },
    
    // 回收OmegaNum实例到对象池
    recycle(instance) {
        if (this.pool.length < this.poolSize * 2 && instance && typeof instance.reset === 'function') {
            instance.reset();
            this.pool.push(instance);
        }
    },
    
    // 批量创建常用值
    createBatch(values) {
        return values.map(v => this.get(v));
    },
    
    // 清理缓存（在内存不足时调用）
    clearCache() {
        this.cache.clear();
        this.pool.length = 0;
        // OmegaNum缓存已清理
    },
    
    // 获取缓存统计信息
    getStats() {
        return {
            poolSize: this.pool.length,
            cacheSize: this.cache.size,
            maxPoolSize: this.poolSize
        };
    }
};

// 重写OmegaNum构造函数以支持对象池
const originalOmegaNum = window.OmegaNum;
if (originalOmegaNum) {
    // 添加fromValue方法用于对象池重用
    originalOmegaNum.prototype.fromValue = function(value) {
        // 重置当前实例并设置新值
        this.array = [];
        this.sign = 1;
        
        if (typeof value === 'number') {
            if (value === 0) {
                this.array = [0];
                this.sign = 0;
            } else if (value < 0) {
                this.sign = -1;
                this.array = [Math.abs(value)];
            } else {
                this.sign = 1;
                this.array = [value];
            }
        } else if (typeof value === 'string') {
            // 解析字符串值
            this.fromString(value);
        } else if (Array.isArray(value)) {
            this.array = [...value];
            this.sign = 1;
        }
        
        return this;
    };
    
    // 添加reset方法用于对象池
    originalOmegaNum.prototype.reset = function() {
        this.array = [0];
        this.sign = 0;
        return this;
    };
    
    // 添加fromString方法
    originalOmegaNum.prototype.fromString = function(str) {
        // 简化的字符串解析
        const num = parseFloat(str);
        if (isNaN(num)) {
            this.array = [0];
            this.sign = 0;
        } else {
            this.fromValue(num);
        }
        return this;
    };
}

// 创建优化的OmegaNum工厂函数
window.OmegaNumOptimized = function(value) {
    return OmegaNumOptimizer.get(value);
};

// 导出到全局
window.OmegaNumOptimizer = OmegaNumOptimizer;

// 性能监控
OmegaNumOptimizer.monitor = {
    stats: {
        totalCalls: 0,
        cacheHits: 0,
        poolHits: 0,
        newInstances: 0,
        startTime: Date.now()
    },
    
    recordCall(type) {
        this.stats.totalCalls++;
        if (type === 'cache') this.stats.cacheHits++;
        else if (type === 'pool') this.stats.poolHits++;
        else if (type === 'new') this.stats.newInstances++;
    },
    
    getReport() {
        const runtime = Date.now() - this.stats.startTime;
        const cacheHitRate = this.stats.totalCalls > 0 ? (this.stats.cacheHits / this.stats.totalCalls * 100).toFixed(2) : 0;
        const poolHitRate = this.stats.totalCalls > 0 ? (this.stats.poolHits / this.stats.totalCalls * 100).toFixed(2) : 0;
        
        return {
            runtime: runtime,
            totalCalls: this.stats.totalCalls,
            cacheHits: this.stats.cacheHits,
            poolHits: this.stats.poolHits,
            newInstances: this.stats.newInstances,
            cacheHitRate: cacheHitRate + '%',
            poolHitRate: poolHitRate + '%',
            callsPerSecond: (this.stats.totalCalls / (runtime / 1000)).toFixed(2)
        };
    },
    
    logReport() {
        const report = this.getReport();
        // OmegaNum性能报告已生成
    }
};

// 自动初始化
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        OmegaNumOptimizer.init();
        
        // 每30秒输出一次性能报告
        setInterval(() => {
            OmegaNumOptimizer.monitor.logReport();
        }, 30000);
        
        // 在控制台暴露性能监控
        window.OmegaNumStats = () => OmegaNumOptimizer.monitor.getReport();
    });
}
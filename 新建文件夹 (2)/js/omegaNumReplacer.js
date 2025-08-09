// OmegaNum替换器 - 将原OmegaNum替换为轻量级版本
// 保持完全的API兼容性

(function() {
    'use strict';
    
    // 确保LightOmegaNum已加载
    if (typeof LightOmegaNum === 'undefined') {
        console.error('LightOmegaNum未找到，请先加载lightOmegaNum.js');
        return;
    }
    
    // 保存原始OmegaNum的引用
    const OriginalOmegaNum = window.OmegaNum;
    
    // 创建兼容层
    function CompatibleOmegaNum(value) {
        // 如果是通过new调用
        if (new.target) {
            return LightOmegaNum.getCached(value);
        }
        // 如果是直接调用
        return LightOmegaNum.getCached(value);
    }
    
    // 复制原OmegaNum的静态属性和方法
    if (OriginalOmegaNum) {
        // 复制常量
        CompatibleOmegaNum.ZERO = LightOmegaNum.COMMON_VALUES.ZERO;
        CompatibleOmegaNum.ONE = LightOmegaNum.COMMON_VALUES.ONE;
        CompatibleOmegaNum.TWO = LightOmegaNum.COMMON_VALUES.TWO;
        CompatibleOmegaNum.TEN = LightOmegaNum.COMMON_VALUES.TEN;
        
        // 添加更多常量以保持兼容性
        CompatibleOmegaNum.E = new LightOmegaNum(Math.E);
        CompatibleOmegaNum.PI = new LightOmegaNum(Math.PI);
        CompatibleOmegaNum.LN2 = new LightOmegaNum(Math.LN2);
        CompatibleOmegaNum.LN10 = new LightOmegaNum(Math.LN10);
        CompatibleOmegaNum.LOG2E = new LightOmegaNum(Math.LOG2E);
        CompatibleOmegaNum.LOG10E = new LightOmegaNum(Math.LOG10E);
        CompatibleOmegaNum.SQRT1_2 = new LightOmegaNum(Math.SQRT1_2);
        CompatibleOmegaNum.SQRT2 = new LightOmegaNum(Math.SQRT2);
        CompatibleOmegaNum.MAX_SAFE_INTEGER = new LightOmegaNum(Number.MAX_SAFE_INTEGER);
        CompatibleOmegaNum.MIN_SAFE_INTEGER = new LightOmegaNum(Number.MIN_SAFE_INTEGER);
        CompatibleOmegaNum.POSITIVE_INFINITY = new LightOmegaNum(Infinity);
        CompatibleOmegaNum.NEGATIVE_INFINITY = new LightOmegaNum(-Infinity);
        CompatibleOmegaNum.NaN = new LightOmegaNum(NaN);
        
        // 字符串常量
        CompatibleOmegaNum.E_MAX_SAFE_INTEGER = "e" + Number.MAX_SAFE_INTEGER;
        CompatibleOmegaNum.EE_MAX_SAFE_INTEGER = "ee" + Number.MAX_SAFE_INTEGER;
        CompatibleOmegaNum.TETRATED_MAX_SAFE_INTEGER = "10^^" + Number.MAX_SAFE_INTEGER;
        
        // 复制静态方法
        const staticMethods = [
            'abs', 'add', 'sub', 'mul', 'div', 'pow', 'log', 'log10', 'ln',
            'exp', 'sqrt', 'max', 'min', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
            'cmp', 'compare', 'floor', 'ceil', 'round', 'factorial', 'gamma'
        ];
        
        staticMethods.forEach(method => {
            if (OriginalOmegaNum[method]) {
                CompatibleOmegaNum[method] = function(x, y) {
                    const first = new LightOmegaNum(x);
                    if (y !== undefined) {
                        return first[method](y);
                    }
                    return first[method]();
                };
            }
        });
        
        // 特殊的静态方法
        CompatibleOmegaNum.fromString = function(str) {
            return new LightOmegaNum(str);
        };
        
        CompatibleOmegaNum.fromNumber = function(num) {
            return new LightOmegaNum(num);
        };
        
        CompatibleOmegaNum.fromObject = function(obj) {
            if (obj && obj.array && obj.sign !== undefined) {
                // 原OmegaNum格式
                return new LightOmegaNum(obj.array[0] || 0);
            }
            return new LightOmegaNum(obj);
        };
        
        // 复制配置属性
        CompatibleOmegaNum.maxArrow = OriginalOmegaNum.maxArrow || 1000;
        CompatibleOmegaNum.serializeMode = OriginalOmegaNum.serializeMode || 0;
        CompatibleOmegaNum.debug = OriginalOmegaNum.debug || 0;
        
        // JSON序列化模式常量
        CompatibleOmegaNum.JSON = 0;
        CompatibleOmegaNum.STRING = 1;
    }
    
    // 扩展LightOmegaNum原型以添加缺失的方法
    const prototypeMethods = {
        // 兼容性别名
        absoluteValue: function() { return this.abs(); },
        negate: function() { return this.neg(); },
        compareTo: function(other) { return this.cmp(other); },
        greaterThan: function(other) { return this.gt(other); },
        greaterThanOrEqualTo: function(other) { return this.gte(other); },
        lessThan: function(other) { return this.lt(other); },
        lessThanOrEqualTo: function(other) { return this.lte(other); },
        equalsTo: function(other) { return this.eq(other); },
        equal: function(other) { return this.eq(other); },
        notEqualsTo: function(other) { return this.neq(other); },
        notEqual: function(other) { return this.neq(other); },
        minimum: function(other) { return this.min(other); },
        maximum: function(other) { return this.max(other); },
        
        // 数学函数
        floor: function() {
            const num = this.toNumber();
            if (isFinite(num)) {
                return new LightOmegaNum(Math.floor(num));
            }
            return this.clone();
        },
        
        ceil: function() {
            const num = this.toNumber();
            if (isFinite(num)) {
                return new LightOmegaNum(Math.ceil(num));
            }
            return this.clone();
        },
        
        round: function() {
            const num = this.toNumber();
            if (isFinite(num)) {
                return new LightOmegaNum(Math.round(num));
            }
            return this.clone();
        },
        
        // 类型检查
        isNaN: function() {
            return isNaN(this.mantissa) || this.sign === undefined;
        },
        
        isFinite: function() {
            return isFinite(this.mantissa) && isFinite(this.exponent);
        },
        
        isInteger: function() {
            const num = this.toNumber();
            return Number.isInteger(num);
        },
        
        isint: function() {
            return this.isInteger();
        },
        
        // 序列化
        toJSON: function() {
            if (CompatibleOmegaNum.serializeMode === CompatibleOmegaNum.JSON) {
                return {
                    mantissa: this.mantissa,
                    exponent: this.exponent,
                    sign: this.sign
                };
            } else {
                return this.toString();
            }
        },
        
        // 其他格式化方法
        toHyperE: function() {
            if (this.sign === 0) return '0';
            if (this.sign < 0) return '-' + this.abs().toHyperE();
            
            if (this.lt(CompatibleOmegaNum.MAX_SAFE_INTEGER)) {
                return this.toString();
            }
            
            return 'E' + this.exponent;
        },
        
        toStringWithDecimalPlaces: function(places) {
            if (this.sign === 0) return '0';
            
            const prefix = this.sign < 0 ? '-' : '';
            
            if (this.exponent < 6 && this.exponent > -4) {
                const num = Math.abs(this.toNumber());
                return prefix + num.toFixed(places);
            }
            
            const mantissaStr = this.mantissa.toFixed(places);
            return `${prefix}${mantissaStr}e${this.exponent}`;
        },
        
        // 模运算
        mod: function(other) {
            other = new LightOmegaNum(other);
            const thisNum = this.toNumber();
            const otherNum = other.toNumber();
            
            if (isFinite(thisNum) && isFinite(otherNum) && otherNum !== 0) {
                return new LightOmegaNum(thisNum % otherNum);
            }
            
            // 对于大数，使用 a - floor(a/b) * b
            return this.sub(this.div(other).floor().mul(other));
        },
        
        modular: function(other) {
            return this.mod(other);
        },
        
        // 对数函数的别名
        logarithm: function(base) {
            return this.log(base || Math.E);
        },
        
        logBase: function(base) {
            return this.log(base || Math.E);
        },
        
        naturalLogarithm: function() {
            return this.ln();
        },
        
        generalLogarithm: function() {
            return this.log10();
        }
    };
    
    // 添加方法到LightOmegaNum原型
    Object.keys(prototypeMethods).forEach(method => {
        if (!LightOmegaNum.prototype[method]) {
            LightOmegaNum.prototype[method] = prototypeMethods[method];
        }
    });
    
    // 性能监控
    const PerformanceTracker = {
        startTime: Date.now(),
        operationCount: 0,
        
        trackOperation: function() {
            this.operationCount++;
        },
        
        getStats: function() {
            const runtime = Date.now() - this.startTime;
            return {
                runtime: runtime,
                operations: this.operationCount,
                opsPerSecond: Math.round(this.operationCount / (runtime / 1000))
            };
        }
    };
    
    // 包装主要操作以进行性能跟踪
    const trackedMethods = ['add', 'sub', 'mul', 'div', 'pow', 'log', 'log10'];
    trackedMethods.forEach(method => {
        const original = LightOmegaNum.prototype[method];
        LightOmegaNum.prototype[method] = function(...args) {
            PerformanceTracker.trackOperation();
            return original.apply(this, args);
        };
    });
    
    // 替换全局OmegaNum
    window.OmegaNum = CompatibleOmegaNum;
    
    // 添加性能报告功能
    window.OmegaNum.getPerformanceStats = function() {
        return PerformanceTracker.getStats();
    };
    
    // 添加缓存清理功能
    window.OmegaNum.clearCache = function() {
        LightOmegaNum.CACHE.clear();
        // OmegaNum缓存已清理
    };
    
    // 添加性能测试功能
    window.OmegaNum.performanceTest = function(iterations = 10000) {
        // 开始OmegaNum性能测试
        const startTime = Date.now();
        
        for (let i = 0; i < iterations; i++) {
            const a = new OmegaNum(Math.random() * 1e6);
            const b = new OmegaNum(Math.random() * 1e6);
            
            a.add(b).mul(new OmegaNum(2)).div(new OmegaNum(3)).toString();
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // 性能测试完成
        
        return {
            iterations,
            duration,
            avgPerOperation: duration / iterations,
            operationsPerSecond: Math.round(iterations / (duration / 1000))
        };
    };
    
    // OmegaNum已替换为轻量级版本
    
})();
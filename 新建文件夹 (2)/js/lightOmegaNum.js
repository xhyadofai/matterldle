// 轻量级大数类 - 专为模组树游戏优化
// 保持与原OmegaNum API兼容，但大幅提升性能

class LightOmegaNum {
    constructor(value) {
        // 内部表示：[mantissa, exponent] 科学计数法
        // 例如：1.23e45 表示为 [1.23, 45]
        this.mantissa = 1;
        this.exponent = 0;
        this.sign = 1;
        
        if (value !== undefined) {
            this._setValue(value);
        }
    }
    
    // 设置值的内部方法
    _setValue(value) {
        if (value instanceof LightOmegaNum) {
            this.mantissa = value.mantissa;
            this.exponent = value.exponent;
            this.sign = value.sign;
        } else if (typeof value === 'number') {
            if (value === 0) {
                this.mantissa = 0;
                this.exponent = 0;
                this.sign = 0;
            } else if (value < 0) {
                this.sign = -1;
                this._setFromNumber(Math.abs(value));
            } else {
                this.sign = 1;
                this._setFromNumber(value);
            }
        } else if (typeof value === 'string') {
            this._setFromString(value);
        }
        return this;
    }
    
    // 从数字设置值
    _setFromNumber(num) {
        if (num === 0) {
            this.mantissa = 0;
            this.exponent = 0;
            return;
        }
        
        if (num < 1e15) {
            // 小数字直接存储
            this.mantissa = num;
            this.exponent = 0;
        } else {
            // 大数字转换为科学计数法
            this.exponent = Math.floor(Math.log10(num));
            this.mantissa = num / Math.pow(10, this.exponent);
        }
    }
    
    // 从字符串设置值
    _setFromString(str) {
        str = str.trim();
        
        // 处理负号
        if (str.startsWith('-')) {
            this.sign = -1;
            str = str.substring(1);
        } else {
            this.sign = 1;
        }
        
        // 处理科学计数法 (1e10, 1.5e20等)
        const eMatch = str.match(/^([0-9]*\.?[0-9]+)e([+-]?[0-9]+)$/i);
        if (eMatch) {
            this.mantissa = parseFloat(eMatch[1]);
            this.exponent = parseInt(eMatch[2]);
            this._normalize();
            return;
        }
        
        // 普通数字
        const num = parseFloat(str);
        if (!isNaN(num)) {
            this._setFromNumber(num);
        } else {
            // 无效输入，设为0
            this.mantissa = 0;
            this.exponent = 0;
            this.sign = 0;
        }
    }
    
    // 标准化表示（确保mantissa在1-10之间）
    _normalize() {
        if (this.mantissa === 0) {
            this.exponent = 0;
            this.sign = 0;
            return;
        }
        
        while (this.mantissa >= 10) {
            this.mantissa /= 10;
            this.exponent++;
        }
        
        while (this.mantissa < 1 && this.mantissa > 0) {
            this.mantissa *= 10;
            this.exponent--;
        }
    }
    
    // 克隆
    clone() {
        const result = new LightOmegaNum();
        result.mantissa = this.mantissa;
        result.exponent = this.exponent;
        result.sign = this.sign;
        return result;
    }
    
    // 加法
    add(other) {
        other = new LightOmegaNum(other);
        
        // 零值处理
        if (this.sign === 0) return other.clone();
        if (other.sign === 0) return this.clone();
        
        // 符号相同的情况
        if (this.sign === other.sign) {
            return this._addSameSign(other);
        } else {
            // 符号不同，转换为减法
            const otherAbs = other.clone();
            otherAbs.sign = this.sign;
            return this._subtractSameSign(otherAbs);
        }
    }
    
    // 同符号加法
    _addSameSign(other) {
        const result = new LightOmegaNum();
        result.sign = this.sign;
        
        // 指数差异太大，直接返回较大的数
        const expDiff = this.exponent - other.exponent;
        if (expDiff > 15) {
            return this.clone();
        } else if (expDiff < -15) {
            return other.clone();
        }
        
        // 对齐指数进行加法
        if (this.exponent >= other.exponent) {
            result.exponent = this.exponent;
            result.mantissa = this.mantissa + other.mantissa * Math.pow(10, other.exponent - this.exponent);
        } else {
            result.exponent = other.exponent;
            result.mantissa = other.mantissa + this.mantissa * Math.pow(10, this.exponent - other.exponent);
        }
        
        result._normalize();
        return result;
    }
    
    // 减法
    sub(other) {
        other = new LightOmegaNum(other);
        
        // 零值处理
        if (other.sign === 0) return this.clone();
        if (this.sign === 0) {
            const result = other.clone();
            result.sign *= -1;
            return result;
        }
        
        // 符号相同的情况
        if (this.sign === other.sign) {
            return this._subtractSameSign(other);
        } else {
            // 符号不同，转换为加法
            const otherAbs = other.clone();
            otherAbs.sign = this.sign;
            return this._addSameSign(otherAbs);
        }
    }
    
    // 同符号减法
    _subtractSameSign(other) {
        // 比较绝对值大小
        const cmp = this._compareAbs(other);
        
        if (cmp === 0) {
            return new LightOmegaNum(0);
        }
        
        const result = new LightOmegaNum();
        
        if (cmp > 0) {
            // |this| > |other|
            result.sign = this.sign;
            const expDiff = this.exponent - other.exponent;
            if (expDiff > 15) {
                return this.clone();
            }
            result.exponent = this.exponent;
            result.mantissa = this.mantissa - other.mantissa * Math.pow(10, other.exponent - this.exponent);
        } else {
            // |this| < |other|
            result.sign = -this.sign;
            const expDiff = other.exponent - this.exponent;
            if (expDiff > 15) {
                const res = other.clone();
                res.sign = -this.sign;
                return res;
            }
            result.exponent = other.exponent;
            result.mantissa = other.mantissa - this.mantissa * Math.pow(10, this.exponent - other.exponent);
        }
        
        result._normalize();
        return result;
    }
    
    // 乘法
    mul(other) {
        other = new LightOmegaNum(other);
        
        // 零值处理
        if (this.sign === 0 || other.sign === 0) {
            return new LightOmegaNum(0);
        }
        
        const result = new LightOmegaNum();
        result.sign = this.sign * other.sign;
        result.mantissa = this.mantissa * other.mantissa;
        result.exponent = this.exponent + other.exponent;
        
        result._normalize();
        return result;
    }
    
    // 除法
    div(other) {
        other = new LightOmegaNum(other);
        
        // 零值处理
        if (other.sign === 0) {
            throw new Error('Division by zero');
        }
        if (this.sign === 0) {
            return new LightOmegaNum(0);
        }
        
        const result = new LightOmegaNum();
        result.sign = this.sign * other.sign;
        result.mantissa = this.mantissa / other.mantissa;
        result.exponent = this.exponent - other.exponent;
        
        result._normalize();
        return result;
    }
    
    // 幂运算
    pow(other) {
        other = new LightOmegaNum(other);
        
        // 特殊情况
        if (other.sign === 0) return new LightOmegaNum(1);
        if (this.sign === 0) return new LightOmegaNum(0);
        if (this.eq(1)) return new LightOmegaNum(1);
        
        // 简单整数幂
        if (other.exponent === 0 && Number.isInteger(other.mantissa) && other.mantissa < 1000) {
            const exp = other.mantissa * other.sign;
            if (exp < 0) {
                return this.pow(new LightOmegaNum(-exp)).recip();
            }
            
            let result = new LightOmegaNum(1);
            let base = this.clone();
            let power = exp;
            
            while (power > 0) {
                if (power % 2 === 1) {
                    result = result.mul(base);
                }
                base = base.mul(base);
                power = Math.floor(power / 2);
            }
            return result;
        }
        
        // 一般情况：使用对数
        // a^b = e^(b * ln(a))
        const lnThis = this.ln();
        const exponent = other.mul(lnThis);
        return exponent.exp();
    }
    
    // 自然对数
    ln() {
        if (this.sign <= 0) {
            throw new Error('Cannot take logarithm of non-positive number');
        }
        
        // ln(a * 10^b) = ln(a) + b * ln(10)
        const result = new LightOmegaNum();
        result.sign = 1;
        
        const lnMantissa = Math.log(this.mantissa);
        const lnValue = lnMantissa + this.exponent * Math.LN10;
        
        result._setFromNumber(lnValue);
        return result;
    }
    
    // 以10为底的对数
    log10() {
        if (this.sign <= 0) {
            throw new Error('Cannot take logarithm of non-positive number');
        }
        
        // log10(a * 10^b) = log10(a) + b
        const result = new LightOmegaNum();
        result.sign = 1;
        
        const log10Mantissa = Math.log10(this.mantissa);
        const logValue = log10Mantissa + this.exponent;
        
        result._setFromNumber(logValue);
        return result;
    }
    
    // 任意底数对数
    log(base) {
        return this.ln().div(new LightOmegaNum(base).ln());
    }
    
    // 指数函数
    exp() {
        // e^x
        const x = this.toNumber();
        
        // 处理特殊情况
        if (x === 0) return new LightOmegaNum(1);
        if (x < -700) return new LightOmegaNum(0); // 非常小的数
        
        if (x > 700) {
            // 大数情况，使用科学计数法
            // e^x = e^(a + b*ln(10)) = e^a * 10^b
            const result = new LightOmegaNum();
            result.sign = 1;
            
            // 将指数分解为整数部分和小数部分
            const exponentPart = Math.floor(x / Math.LN10);
            const mantissaPart = x - exponentPart * Math.LN10;
            
            result.exponent = exponentPart;
            result.mantissa = Math.exp(mantissaPart);
            result._normalize();
            return result;
        } else {
            return new LightOmegaNum(Math.exp(x));
        }
    }
    
    // 倒数
    recip() {
        return new LightOmegaNum(1).div(this);
    }
    
    // 幂运算
    pow(exponent) {
        exponent = new LightOmegaNum(exponent);
        
        // 特殊情况
        if (this.sign === 0) {
            if (exponent.sign > 0) return new LightOmegaNum(0);
            if (exponent.sign === 0) return new LightOmegaNum(1);
            throw new Error('0^(negative number) is undefined');
        }
        
        if (exponent.sign === 0) return new LightOmegaNum(1);
        if (exponent.eq(1)) return this.clone();
        
        // 负数的非整数幂
        if (this.sign < 0 && !this._isInteger(exponent)) {
            throw new Error('Negative base with non-integer exponent');
        }
        
        // 使用对数计算: a^b = e^(b * ln(a))
        const lnThis = this.abs().ln();
        const product = exponent.mul(lnThis);
        const result = product.exp();
        
        // 处理负数底数的情况
        if (this.sign < 0 && this._isOddInteger(exponent)) {
            result.sign *= -1;
        }
        
        return result;
    }
    
    // 检查是否为整数
    _isInteger(num) {
        const n = num.toNumber();
        return Number.isInteger(n) && Math.abs(n) < Number.MAX_SAFE_INTEGER;
    }
    
    // 检查是否为奇数整数
    _isOddInteger(num) {
        if (!this._isInteger(num)) return false;
        const n = Math.abs(num.toNumber());
        return n % 2 === 1;
    }
    
    // 平方根
    sqrt() {
        return this.pow(new LightOmegaNum(0.5));
    }
    
    // 最大值
    max(other) {
        return this.gte(other) ? this.clone() : new LightOmegaNum(other);
    }
    
    // 最小值
    min(other) {
        return this.lte(other) ? this.clone() : new LightOmegaNum(other);
    }
    
    // 绝对值比较
    _compareAbs(other) {
        if (this.exponent > other.exponent) return 1;
        if (this.exponent < other.exponent) return -1;
        if (this.mantissa > other.mantissa) return 1;
        if (this.mantissa < other.mantissa) return -1;
        return 0;
    }
    
    // 比较函数
    cmp(other) {
        other = new LightOmegaNum(other);
        
        // 符号比较
        if (this.sign > other.sign) return 1;
        if (this.sign < other.sign) return -1;
        if (this.sign === 0) return 0;
        
        // 同符号比较
        const absCompare = this._compareAbs(other);
        return this.sign * absCompare;
    }
    
    // 比较运算符
    eq(other) { return this.cmp(other) === 0; }
    neq(other) { return this.cmp(other) !== 0; }
    gt(other) { return this.cmp(other) > 0; }
    gte(other) { return this.cmp(other) >= 0; }
    lt(other) { return this.cmp(other) < 0; }
    lte(other) { return this.cmp(other) <= 0; }
    
    // 转换为数字
    toNumber() {
        if (this.sign === 0) return 0;
        if (this.exponent > 308) return this.sign > 0 ? Infinity : -Infinity;
        if (this.exponent < -308) return 0;
        
        return this.sign * this.mantissa * Math.pow(10, this.exponent);
    }
    
    // 转换为字符串（优化的格式化）
    toString() {
        if (this.sign === 0) return '0';
        
        const prefix = this.sign < 0 ? '-' : '';
        
        // 小数字直接显示
        if (this.exponent < 6 && this.exponent > -4) {
            const num = this.toNumber();
            return prefix + Math.abs(num).toString();
        }
        
        // 科学计数法
        const mantissaStr = this.mantissa.toFixed(2);
        return `${prefix}${mantissaStr}e${this.exponent}`;
    }
    
    // 指数表示法
    toExponential(digits = 2) {
        if (this.sign === 0) return '0';
        
        const prefix = this.sign < 0 ? '-' : '';
        const mantissaStr = this.mantissa.toFixed(digits);
        return `${prefix}${mantissaStr}e${this.exponent >= 0 ? '+' : ''}${this.exponent}`;
    }
    
    // 兼容性方法
    abs() {
        const result = this.clone();
        result.sign = Math.abs(result.sign);
        return result;
    }
    
    neg() {
        const result = this.clone();
        result.sign *= -1;
        return result;
    }
    
    // 静态方法
    static max(...args) {
        let result = new LightOmegaNum(args[0]);
        for (let i = 1; i < args.length; i++) {
            result = result.max(args[i]);
        }
        return result;
    }
    
    static min(...args) {
        let result = new LightOmegaNum(args[0]);
        for (let i = 1; i < args.length; i++) {
            result = result.min(args[i]);
        }
        return result;
    }
}

// 性能优化：常用值缓存
LightOmegaNum.CACHE = new Map();
LightOmegaNum.COMMON_VALUES = {
    ZERO: new LightOmegaNum(0),
    ONE: new LightOmegaNum(1),
    TWO: new LightOmegaNum(2),
    TEN: new LightOmegaNum(10),
    HUNDRED: new LightOmegaNum(100),
    THOUSAND: new LightOmegaNum(1000)
};

// 缓存常用字符串值
LightOmegaNum.getCached = function(value) {
    if (typeof value === 'string' && LightOmegaNum.CACHE.has(value)) {
        return LightOmegaNum.CACHE.get(value).clone();
    }
    
    const result = new LightOmegaNum(value);
    
    if (typeof value === 'string' && LightOmegaNum.CACHE.size < 1000) {
        LightOmegaNum.CACHE.set(value, result.clone());
    }
    
    return result;
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LightOmegaNum;
} else if (typeof window !== 'undefined') {
    window.LightOmegaNum = LightOmegaNum;
}
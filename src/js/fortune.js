// 移除导入语句，因为我们使用CDN加载
// import cnchar from 'cnchar';
// import 'cnchar-draw';
// import 'cnchar-radical';

// 运势等级
const FORTUNE_LEVELS = ['大凶', '凶', '平', '吉', '大吉'];

// 可能的活动
const ACTIVITIES = {
    good: [
        '工作', '学习', '运动', '旅行', '谈恋爱',
        '见朋友', '购物', '投资', '面试', '签合同',
        '搬家', '装修', '开会', '谈判', '创业'
    ],
    bad: [
        '熬夜', '赌博', '争吵', '冒险', '借钱',
        '大额消费', '重要决定', '激烈运动', '喝酒', '签约',
        '手术', '远行', '装修', '搬家', '结婚'
    ]
};

// 五行属性
const FIVE_ELEMENTS = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水'
};

// 天干地支五行对应
const STEMS_ELEMENTS = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
};

const BRANCHES_ELEMENTS = {
    '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
    '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
    '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water'
};

// 汉字笔画数据库（简化版）
const STROKE_COUNT = {
    '李': 7, '王': 4, '张': 11, '刘': 6, '陈': 10, '杨': 7, '黄': 12, '吴': 6,
    '赵': 9, '周': 8, '徐': 10, '孙': 10, '马': 10, '朱': 6, '胡': 9, '林': 8,
    '郭': 11, '何': 7, '高': 10, '罗': 8, '郑': 9, '梁': 11, '谢': 12, '宋': 7,
};

// 五行生克关系
const FIVE_ELEMENTS_RELATIONS = {
    wood: { generates: 'fire', weakens: 'earth' },
    fire: { generates: 'earth', weakens: 'metal' },
    earth: { generates: 'metal', weakens: 'water' },
    metal: { generates: 'water', weakens: 'wood' },
    water: { generates: 'wood', weakens: 'fire' }
};

// 汉字五行属性映射（基于部首）
const RADICAL_TO_ELEMENT = {
    // 木属性部首
    '木': 'wood', '林': 'wood', '森': 'wood', '竹': 'wood', '艹': 'wood', 
    '屮': 'wood', '韭': 'wood',
    
    // 火属性部首
    '火': 'fire', '灬': 'fire', '炎': 'fire', '焱': 'fire', '光': 'fire',
    
    // 土属性部首
    '土': 'earth', '石': 'earth', '山': 'earth', '田': 'earth', '里': 'earth',
    '艮': 'earth', '阜': 'earth',
    
    // 金属性部首
    '金': 'metal', '钅': 'metal', '釒': 'metal', '铝': 'metal', '钱': 'metal',
    '刀': 'metal', '刂': 'metal',
    
    // 水属性部首
    '水': 'water', '氵': 'water', '冫': 'water', '氺': 'water', '雨': 'water',
    '雪': 'water', '云': 'water'
};

// 计算生辰八字
function calculateBaZi(birthdate) {
    try {
        // 将日期字符串转换为Date对象
        const date = new Date(birthdate);
        if (isNaN(date.getTime())) {
            throw new Error('无效的日期格式');
        }
        
        // 使用lunar-javascript计算农历和八字
        const solar = Solar.fromDate(date);
        const lunar = solar.getLunar();
        
        // 获取八字信息
        const eightChar = lunar.getEightChar();
        
        return {
            year: { 
                stem: eightChar.getYearGan(), 
                branch: eightChar.getYearZhi()
            },
            month: { 
                stem: eightChar.getMonthGan(), 
                branch: eightChar.getMonthZhi()
            },
            day: { 
                stem: eightChar.getDayGan(), 
                branch: eightChar.getDayZhi()
            },
            time: { 
                stem: eightChar.getTimeGan(), 
                branch: eightChar.getTimeZhi()
            }
        };
    } catch (error) {
        console.error('计算八字时出错:', error);
        throw new Error('八字计算失败: ' + error.message);
    }
}

// 生成伪随机数（基于日期和个人信息）
function generateSeed(name, birthdate, date) {
    const str = `${name}${birthdate}${date}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// 计算汉字的五行属性
function calculateCharElement(char) {
    try {
        // 获取汉字的部首
        const radicals = cnchar.radical(char);
        if (!radicals || radicals.length === 0) {
            console.warn(`无法获取汉字 "${char}" 的部首，将使用笔画数计算`);
            const strokeCount = cnchar.stroke(char);
            const elements = ['wood', 'fire', 'earth', 'metal', 'water'];
            return elements[strokeCount % 5];
        }
        
        const radical = radicals[0];
        
        // 如果部首有对应的五行属性，直接返回
        if (RADICAL_TO_ELEMENT[radical]) {
            return RADICAL_TO_ELEMENT[radical];
        }
        
        // 如果没有部首对应，根据笔画数计算
        const strokeCount = cnchar.stroke(char);
        if (typeof strokeCount !== 'number') {
            throw new Error(`无法计算汉字 "${char}" 的笔画数`);
        }
        
        const elements = ['wood', 'fire', 'earth', 'metal', 'water'];
        return elements[strokeCount % 5];
    } catch (error) {
        console.error(`计算汉字 "${char}" 的五行属性时出错:`, error);
        // 返回默认值
        return 'wood';
    }
}

// 计算姓名五行属性
function calculateNameElements(name) {
    try {
        let totalStrokes = 0;
        let strokes = [];
        let elements = [];
        
        // 计算每个字的笔画和五行
        for (let char of name) {
            const strokeCount = cnchar.stroke(char);
            if (typeof strokeCount !== 'number') {
                throw new Error(`无法计算汉字 "${char}" 的笔画数`);
            }
            
            const element = calculateCharElement(char);
            
            totalStrokes += strokeCount;
            strokes.push(strokeCount);
            elements.push(element);
        }
        
        // 分析姓名整体五行属性
        let elementCounts = {
            wood: 0, fire: 0, earth: 0, metal: 0, water: 0
        };
        
        elements.forEach(element => {
            elementCounts[element]++;
        });
        
        // 找出最主要的五行属性
        let mainElement = 'wood';
        let maxCount = 0;
        
        for (let element in elementCounts) {
            if (elementCounts[element] > maxCount) {
                maxCount = elementCounts[element];
                mainElement = element;
            }
        }
        
        return {
            totalStrokes,
            strokes,
            elements,
            element: mainElement,
            elementDetails: elementCounts
        };
    } catch (error) {
        console.error('计算姓名五行属性时出错:', error);
        throw new Error('五行计算失败: ' + error.message);
    }
}

// 计算当日五行
function calculateDayElement(date) {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const dayGan = lunar.getDayGan();
    return STEMS_ELEMENTS[dayGan];
}

// 计算五行相生相克关系
function calculateElementRelations(personElement, dayElement) {
    if (FIVE_ELEMENTS_RELATIONS[personElement].generates === dayElement) {
        return 2; // 相生，很好
    } else if (FIVE_ELEMENTS_RELATIONS[personElement].weakens === dayElement) {
        return 0; // 相克，不好
    } else if (FIVE_ELEMENTS_RELATIONS[dayElement].weakens === personElement) {
        return -1; // 被克，很不好
    } else if (FIVE_ELEMENTS_RELATIONS[dayElement].generates === personElement) {
        return 1; // 被生，好
    }
    return 0.5; // 中性
}

// 生成运势
function generateFortune(name, birthdate) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 计算八字
    const bazi = calculateBaZi(birthdate);
    
    // 计算姓名五行
    const nameInfo = calculateNameElements(name);
    
    // 计算当日五行
    const dayElement = calculateDayElement(today);
    
    // 计算五行关系
    const elementRelation = calculateElementRelations(nameInfo.element, dayElement);
    
    // 计算运势指数（0-4，对应大凶到大吉）
    let fortuneScore = 2; // 默认为"平"
    
    // 根据五行关系调整运势
    fortuneScore += elementRelation;
    
    // 根据生辰八字调整运势
    const dayStemElement = STEMS_ELEMENTS[bazi.day.stem];
    const dayBranchElement = BRANCHES_ELEMENTS[bazi.day.branch];
    if (dayStemElement === dayElement || dayBranchElement === dayElement) {
        fortuneScore += 0.5;
    }
    
    // 确保运势指数在有效范围内
    fortuneScore = Math.max(0, Math.min(4, Math.round(fortuneScore)));
    
    // 生成宜忌事项
    const seed = generateSeed(name, birthdate, todayStr);
    const goodCount = 2 + (seed % 2);
    const badCount = 2 + ((seed >> 2) % 2);
    
    // 根据五行属性筛选适合的活动
    const suitableActivities = ACTIVITIES.good.filter(activity => {
        // 这里可以根据活动的性质与五行属性做更详细的匹配
        return true;
    });
    
    const unsuitableActivities = ACTIVITIES.bad.filter(activity => {
        // 这里可以根据活动的性质与五行属性做更详细的匹配
        return true;
    });
    
    const shuffledGood = suitableActivities.sort(() => (seed % 2) - 0.5);
    const shuffledBad = unsuitableActivities.sort(() => ((seed >> 2) % 2) - 0.5);
    
    return {
        level: FORTUNE_LEVELS[fortuneScore],
        good: shuffledGood.slice(0, goodCount),
        bad: shuffledBad.slice(0, badCount),
        details: {
            dayElement: FIVE_ELEMENTS[dayElement],
            personElement: FIVE_ELEMENTS[nameInfo.element],
            bazi: {
                year: bazi.year.stem + bazi.year.branch,
                month: bazi.month.stem + bazi.month.branch,
                day: bazi.day.stem + bazi.day.branch,
                time: bazi.time.stem + bazi.time.branch
            },
            elementDetails: nameInfo.elementDetails
        }
    };
}

// 处理表单提交
document.getElementById('userInfoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    try {
        const name = document.getElementById('name').value;
        const birthdate = document.getElementById('birthdate').value;
        
        if (!name || !birthdate) {
            alert('请填写完整的信息');
            return;
        }

        console.log('开始计算运势:', { name, birthdate });
        
        // 验证cnchar是否正确加载
        if (typeof cnchar === 'undefined') {
            throw new Error('cnchar 库未正确加载');
        }
        
        // 验证lunar-javascript是否正确加载
        if (typeof Solar === 'undefined') {
            throw new Error('lunar-javascript 库未正确加载');
        }
        
        const fortune = generateFortune(name, birthdate);
        console.log('运势计算结果:', fortune);
        
        // 更新运势等级
        document.getElementById('fortuneLevel').textContent = fortune.level;
        document.getElementById('fortuneLevel').className = `text-4xl font-bold mb-4 fortune-level-${fortune.level}`;
        
        // 更新八字信息
        document.getElementById('yearPillar').textContent = fortune.details.bazi.year;
        document.getElementById('monthPillar').textContent = fortune.details.bazi.month;
        document.getElementById('dayPillar').textContent = fortune.details.bazi.day;
        document.getElementById('timePillar').textContent = fortune.details.bazi.time;
        
        // 更新五行信息
        document.getElementById('dayElement').textContent = fortune.details.dayElement;
        document.getElementById('personElement').textContent = fortune.details.personElement;
        
        // 更新五行分布
        document.getElementById('woodCount').textContent = fortune.details.elementDetails.wood;
        document.getElementById('fireCount').textContent = fortune.details.elementDetails.fire;
        document.getElementById('earthCount').textContent = fortune.details.elementDetails.earth;
        document.getElementById('metalCount').textContent = fortune.details.elementDetails.metal;
        document.getElementById('waterCount').textContent = fortune.details.elementDetails.water;
        
        // 更新宜忌事项
        document.getElementById('goodActivities').textContent = fortune.good.join('、');
        document.getElementById('badActivities').textContent = fortune.bad.join('、');
        
        // 显示结果
        const resultDiv = document.getElementById('fortuneResult');
        resultDiv.classList.remove('hidden');
        resultDiv.classList.add('fade-in');
        
    } catch (error) {
        console.error('运势计算出错:', error);
        alert('计算运势时出现错误: ' + error.message);
    }
}); 
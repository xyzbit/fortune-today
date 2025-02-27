// 立即执行的日志，确认文件加载
console.log('Fortune.js loaded at:', new Date().toISOString());

// 移除导入语句，因为我们使用CDN加载
// import cnchar from 'cnchar';
// import 'cnchar-draw';
// import 'cnchar-radical';

// 从本地存储加载用户数据
function loadUserData() {
    try {
        const name = localStorage.getItem('fortune_name');
        const birthdate = localStorage.getItem('fortune_birthdate');
        const birthtime = localStorage.getItem('fortune_birthtime');

        const nameInput = document.getElementById('name');
        const birthdateInput = document.getElementById('birthdate');
        const birthtimeInput = document.getElementById('birthtime');

        if (!nameInput || !birthdateInput || !birthtimeInput) {
            console.error('Form inputs not found!');
            return;
        }

        if (name && name !== 'undefined' && name !== 'null' &&
            birthdate && birthdate !== 'undefined' && birthdate !== 'null') {
            nameInput.value = name;
            birthdateInput.value = birthdate;
            if (birthtime && birthtime !== 'undefined' && birthtime !== 'null') {
                birthtimeInput.value = birthtime;
            }
            // 自动计算运势
            calculateAndShowFortune(name, birthdate, birthtime);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// 保存用户数据到本地存储
function saveUserData(name, birthdate, birthtime) {
    try {
        if (!name && !birthdate) {
            return;
        }

        // 清理和验证名字
        const cleanName = name ? name.trim() : '';
        if (cleanName) {
            localStorage.setItem('fortune_name', cleanName);
        }

        // 验证和保存日期
        if (birthdate) {
            localStorage.setItem('fortune_birthdate', birthdate);
        }

        // 保存时间
        if (birthtime) {
            localStorage.setItem('fortune_birthtime', birthtime);
        }
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

// 更新运势指数点
function updateFortuneDots(score) {
    const dots = [
        document.getElementById('fortune-dot-1'),
        document.getElementById('fortune-dot-2'),
        document.getElementById('fortune-dot-3'),
        document.getElementById('fortune-dot-4'),
        document.getElementById('fortune-dot-5')
    ];

    const colors = {
        0: 'bg-red-500',    // 大凶
        1: 'bg-orange-500', // 凶
        2: 'bg-yellow-500', // 平
        3: 'bg-blue-500',   // 吉
        4: 'bg-green-500'   // 大吉
    };

    dots.forEach((dot, index) => {
        dot.className = 'w-4 h-4 rounded-full ' + (index <= score ? colors[score] : 'bg-gray-200');
        if (index <= score) {
            dot.classList.add('animate-pulse');
        }
    });
}

// 创建五行分布图表
function createElementChart(elementDetails) {
    try {
        // 检查 Chart 是否已加载
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }

        const ctx = document.getElementById('elementChart');
        if (!ctx) {
            console.error('Canvas element not found');
            return;
        }

        // 如果已经存在图表，先销毁它
        if (window.elementChart instanceof Chart) {
            window.elementChart.destroy();
            window.elementChart = null;
        }

        const data = {
            labels: ['木', '火', '土', '金', '水'],
            datasets: [{
                label: '五行分布',
                data: [
                    elementDetails.wood,
                    elementDetails.fire,
                    elementDetails.earth,
                    elementDetails.metal,
                    elementDetails.water
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.6)',  // 木 - 绿色
                    'rgba(239, 68, 68, 0.6)',  // 火 - 红色
                    'rgba(234, 179, 8, 0.6)',  // 土 - 黄色
                    'rgba(156, 163, 175, 0.6)', // 金 - 灰色
                    'rgba(59, 130, 246, 0.6)'   // 水 - 蓝色
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(239, 68, 68)',
                    'rgb(234, 179, 8)',
                    'rgb(156, 163, 175)',
                    'rgb(59, 130, 246)'
                ],
                borderWidth: 1
            }]
        };

        window.elementChart = new Chart(ctx, {
            type: 'radar',
            data: data,
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        min: 0,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating chart:', error);
    }
}

// 格式化宜忌事项显示
function formatActivities(activities) {
    return activities.map(activity =>
        `<div class="px-3 py-1 bg-white rounded-full inline-block mr-2 mb-2 shadow-sm">${activity}</div>`
    ).join('');
}

// 五行关系描述
const ELEMENT_RELATIONS_DESC = {
    2: '相生，运势大吉',
    1: '被生，运势向好',
    0.5: '平和，运势平稳',
    0: '相克，运势受阻',
    '-1': '被克，运势不佳'
};

// 运势指数描述
const FORTUNE_INDICATORS = {
    '大吉': '🌟🌟🌟🌟🌟',
    '吉': '🌟🌟🌟🌟',
    '平': '🌟🌟🌟',
    '凶': '🌟🌟',
    '大凶': '🌟'
};

// 生成每日建议
function generateDailyAdvice(fortuneLevel, dayElement, personElement, luckyItems) {
    const advices = [];

    // 基于运势等级的建议
    switch (fortuneLevel) {
        case '大吉':
            advices.push('今日运势极佳，适合大展宏图，把握机遇。');
            break;
        case '吉':
            advices.push('运势良好，可以尝试新的挑战。');
            break;
        case '平':
            advices.push('运势平稳，宜循序渐进，稳扎稳打。');
            break;
        case '凶':
            advices.push('运势欠佳，凡事需多加谨慎。');
            break;
        case '大凶':
            advices.push('运势不佳，建议低调行事，避免冒险。');
            break;
    }

    // 基于五行关系的建议
    if (FIVE_ELEMENTS_RELATIONS[personElement].generates === dayElement) {
        advices.push(`今日五行${FIVE_ELEMENTS[personElement]}生${FIVE_ELEMENTS[dayElement]}，利于发展个人事业。`);
    } else if (FIVE_ELEMENTS_RELATIONS[dayElement].generates === personElement) {
        advices.push(`今日五行受${FIVE_ELEMENTS[dayElement]}生，适合寻求贵人帮助。`);
    }

    // 幸运物品相关建议
    advices.push(`佩戴${luckyItems.item.name}或${luckyItems.color.name}饰品能增添好运。`);

    return advices.join('\n');
}

// 更新运势解读
function updateFortuneInterpretation(elementRelation, fortuneLevel) {
    // 更新五行关系描述
    const elementRelationElement = document.getElementById('elementRelation');
    elementRelationElement.textContent = ELEMENT_RELATIONS_DESC[elementRelation];

    // 更新吉凶指数
    const fortuneIndicatorElement = document.getElementById('fortune-indicator');
    fortuneIndicatorElement.textContent = FORTUNE_INDICATORS[fortuneLevel];
}

// 计算并显示运势
function calculateAndShowFortune(name, birthdate, birthtime) {
    try {
        if (!name || !birthdate) {
            return;
        }

        // 验证cnchar是否正确加载
        if (typeof cnchar === 'undefined') {
            throw new Error('cnchar 库未正确加载');
        }

        // 验证lunar-javascript是否正确加载
        if (typeof Solar === 'undefined') {
            throw new Error('lunar-javascript 库未正确加载');
        }

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // 计算八字
        const bazi = calculateBaZi(birthdate, birthtime);

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

        // 生成幸运物品
        const luckyItems = generateLuckyItems(seed, dayElement, nameInfo.element);

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

        const fortuneLevel = FORTUNE_LEVELS[fortuneScore];

        // 更新运势等级
        const fortuneLevelElement = document.getElementById('fortuneLevel');
        fortuneLevelElement.textContent = fortuneLevel;
        fortuneLevelElement.className = `text-6xl font-bold mb-4 fortune-level-${fortuneLevel}`;

        // 更新运势指数点
        updateFortuneDots(fortuneScore);

        // 更新八字信息
        document.getElementById('yearPillar').textContent = bazi.year.stem + bazi.year.branch;
        document.getElementById('monthPillar').textContent = bazi.month.stem + bazi.month.branch;
        document.getElementById('dayPillar').textContent = bazi.day.stem + bazi.day.branch;
        document.getElementById('timePillar').textContent = bazi.time.stem + bazi.time.branch;

        // 更新五行信息
        document.getElementById('dayElement').textContent = FIVE_ELEMENTS[dayElement];
        document.getElementById('personElement').textContent = FIVE_ELEMENTS[nameInfo.element];

        // 创建五行分布图表
        createElementChart(nameInfo.elementDetails);

        // 更新宜忌事项
        document.getElementById('goodActivities').innerHTML = formatActivities(shuffledGood.slice(0, goodCount));
        document.getElementById('badActivities').innerHTML = formatActivities(shuffledBad.slice(0, badCount));

        // 更新幸运物品
        updateLuckyItems(luckyItems);

        // 更新运势解读
        updateFortuneInterpretation(elementRelation, fortuneLevel);

        // 更新每日建议
        const dailyAdvice = document.getElementById('dailyAdvice');
        dailyAdvice.textContent = generateDailyAdvice(
            fortuneLevel,
            dayElement,
            nameInfo.element,
            luckyItems
        );

        // 显示结果
        const resultDiv = document.getElementById('fortuneResult');
        resultDiv.classList.remove('hidden');
        resultDiv.classList.add('fade-in');

    } catch (error) {
        console.error('运势计算出错:', error);
        alert('计算运势时出现错误: ' + error.message);
    }
}

// 处理表单提交
function handleFormSubmit(e) {
    e.preventDefault();

    try {
        const name = document.getElementById('name').value;
        const birthdate = document.getElementById('birthdate').value;
        const birthtime = document.getElementById('birthtime').value || null;

        if (!name || !birthdate) {
            alert('请填写姓名和出生日期');
            return;
        }

        // 保存用户输入的数据
        saveUserData(name, birthdate, birthtime);
        // 计算并显示运势
        calculateAndShowFortune(name, birthdate, birthtime);

    } catch (error) {
        console.error('运势计算出错:', error);
        alert('计算运势时出现错误: ' + error.message);
    }
}

// 初始化所有事件监听器
function initializeEventListeners() {
    const nameInput = document.getElementById('name');
    const birthdateInput = document.getElementById('birthdate');
    const birthtimeInput = document.getElementById('birthtime');
    const form = document.getElementById('userInfoForm');

    if (!nameInput || !birthdateInput || !birthtimeInput || !form) {
        console.error('Required elements not found:', {
            nameInput: !!nameInput,
            birthdateInput: !!birthdateInput,
            birthtimeInput: !!birthtimeInput,
            form: !!form
        });
        return;
    }

    // 监听姓名输入变化
    nameInput.addEventListener('input', function (e) {
        saveUserData(e.target.value, birthdateInput.value, birthtimeInput.value);
    });

    // 监听日期变化
    birthdateInput.addEventListener('change', function (e) {
        saveUserData(nameInput.value, e.target.value, birthtimeInput.value);
    });

    // 监听时间变化
    birthtimeInput.addEventListener('change', function (e) {
        saveUserData(nameInput.value, birthdateInput.value, e.target.value);
    });

    // 监听表单提交
    form.addEventListener('submit', handleFormSubmit);
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    loadUserData();
    initializeEventListeners();
});

// 为了双重保险，也监听 load 事件
window.addEventListener('load', function () {
    console.log('Window loaded, checking initialization...');
    // 检查是否已经初始化过
    const form = document.getElementById('userInfoForm');
    if (!form || !form.hasAttribute('data-initialized')) {
        console.log('Re-initializing on window load...');
        loadUserData();
        initializeEventListeners();
        form.setAttribute('data-initialized', 'true');
    }
});

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
function calculateBaZi(birthdate, birthtime) {
    try {
        // 将日期和时间字符串转换为Date对象
        const [year, month, day] = birthdate.split('-').map(Number);
        let hour = 12, minute = 0; // 默认使用中午12点

        if (birthtime) {
            [hour, minute] = birthtime.split(':').map(Number);
        }

        const date = new Date(year, month - 1, day, hour, minute);
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
        let elements = [];

        // 计算每个字的五行
        for (let char of name) {
            const element = calculateCharElement(char);
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

// 幸运物品数据（按五行属性分类）
const LUCKY_ITEMS = {
    colors: {
        wood: [
            { name: '翠绿色', emoji: '🌿' },
            { name: '青色', emoji: '🌱' },
            { name: '淡绿色', emoji: '🌲' },
            { name: '墨绿色', emoji: '🎋' }
        ],
        fire: [
            { name: '红色', emoji: '🔥' },
            { name: '玫瑰红', emoji: '🌹' },
            { name: '橙色', emoji: '🍊' },
            { name: '紫色', emoji: '🌸' }
        ],
        earth: [
            { name: '土黄色', emoji: '🌾' },
            { name: '棕色', emoji: '🪵' },
            { name: '米色', emoji: '🏔️' },
            { name: '卡其色', emoji: '🗻' }
        ],
        metal: [
            { name: '金色', emoji: '⭐' },
            { name: '银色', emoji: '🌙' },
            { name: '白色', emoji: '⚪' },
            { name: '铂金色', emoji: '✨' }
        ],
        water: [
            { name: '深蓝色', emoji: '🌊' },
            { name: '天蓝色', emoji: '💧' },
            { name: '墨蓝色', emoji: '🌌' },
            { name: '湖蓝色', emoji: '🌅' }
        ]
    },
    numbers: {
        wood: [1, 3, 5],
        fire: [2, 7, 9],
        earth: [5, 8, 10],
        metal: [4, 6, 9],
        water: [1, 6, 8]
    },
    items: {
        wood: [
            { name: '盆栽', emoji: '🪴' },
            { name: '木珠手串', emoji: '📿' },
            { name: '竹制品', emoji: '🎋' },
            { name: '木雕', emoji: '🗿' },
            { name: '绿植', emoji: '🌱' }
        ],
        fire: [
            { name: '红玛瑙', emoji: '💎' },
            { name: '香薰', emoji: '🕯️' },
            { name: '太阳能饰品', emoji: '☀️' },
            { name: '红绳手链', emoji: '🔮' },
            { name: '陶瓷品', emoji: '🏺' }
        ],
        earth: [
            { name: '黄水晶', emoji: '💎' },
            { name: '陶艺品', emoji: '🏺' },
            { name: '泥塑', emoji: '🗿' },
            { name: '砂器', emoji: '⏳' },
            { name: '石艺品', emoji: '🪨' }
        ],
        metal: [
            { name: '金属饰品', emoji: '⭐' },
            { name: '白玉', emoji: '💍' },
            { name: '铜器', emoji: '🔔' },
            { name: '银饰', emoji: '🌙' },
            { name: '金属风铃', emoji: '🎐' }
        ],
        water: [
            { name: '水晶', emoji: '💎' },
            { name: '玻璃艺品', emoji: '🥂' },
            { name: '喷泉', emoji: '⛲' },
            { name: '鱼缸', emoji: '🐠' },
            { name: '海螺贝壳', emoji: '🐚' }
        ]
    }
};

// 生成幸运物品
function generateLuckyItems(seed, dayElement, personElement) {
    // 选择主要五行属性（当日五行和个人五行的结合）
    const mainElement = (seed % 2 === 0) ? dayElement : personElement;

    // 选择次要五行属性（相生的五行）
    const secondaryElement = FIVE_ELEMENTS_RELATIONS[mainElement].generates;

    // 从主要五行和次要五行中选择物品
    const primaryProb = 0.7; // 主要五行的选择概率

    // 选择颜色
    const colorElement = (seed % 100 < primaryProb * 100) ? mainElement : secondaryElement;
    const colorList = LUCKY_ITEMS.colors[colorElement];
    const colorIndex = seed % colorList.length;

    // 选择数字（从主要五行中选择）
    const numberList = LUCKY_ITEMS.numbers[mainElement];
    const numberIndex = (seed >> 3) % numberList.length;

    // 选择物品
    const itemElement = ((seed >> 6) % 100 < primaryProb * 100) ? mainElement : secondaryElement;
    const itemList = LUCKY_ITEMS.items[itemElement];
    const itemIndex = (seed >> 9) % itemList.length;

    return {
        color: colorList[colorIndex],
        number: numberList[numberIndex],
        item: itemList[itemIndex],
        elements: {
            color: colorElement,
            number: mainElement,
            item: itemElement
        }
    };
}

// 更新幸运物品显示
function updateLuckyItems(luckyItems) {
    // 更新幸运色
    const colorElement = document.getElementById('luckyColor');
    const colorTextElement = document.getElementById('luckyColorText');
    colorElement.textContent = luckyItems.color.emoji;
    colorTextElement.textContent = luckyItems.color.name;
    colorElement.title = `五行属性：${FIVE_ELEMENTS[luckyItems.elements.color]}`;

    // 更新幸运数字
    const numberElement = document.getElementById('luckyNumber');
    const numberTextElement = document.getElementById('luckyNumberText');
    numberElement.textContent = luckyItems.number.toString();
    numberTextElement.textContent = luckyItems.number;
    numberElement.title = `五行属性：${FIVE_ELEMENTS[luckyItems.elements.number]}`;

    // 更新幸运物品
    const itemElement = document.getElementById('luckyItem');
    const itemTextElement = document.getElementById('luckyItemText');
    itemElement.textContent = luckyItems.item.emoji;
    itemTextElement.textContent = luckyItems.item.name;
    itemElement.title = `五行属性：${FIVE_ELEMENTS[luckyItems.elements.item]}`;
} 
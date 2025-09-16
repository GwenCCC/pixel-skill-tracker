// Experience Tracker JavaScript

// Data Storage and Management
class DataManager {
    constructor() {
        this.skills = JSON.parse(localStorage.getItem('exp_tracker_skills')) || [];
        this.expRecords = JSON.parse(localStorage.getItem('exp_tracker_records')) || [];
        this.nextSkillId = parseInt(localStorage.getItem('exp_tracker_next_skill_id') || '1');
        this.nextRecordId = parseInt(localStorage.getItem('exp_tracker_next_record_id') || '1');
        this.loadTheme();
    }

    saveSkills() {
        localStorage.setItem('exp_tracker_skills', JSON.stringify(this.skills));
        localStorage.setItem('exp_tracker_next_skill_id', this.nextSkillId.toString());
    }

    saveRecords() {
        localStorage.setItem('exp_tracker_records', JSON.stringify(this.expRecords));
        localStorage.setItem('exp_tracker_next_record_id', this.nextRecordId.toString());
    }

    createSkill(name, category, description) {
        const skill = {
            id: this.nextSkillId.toString(),
            name: name,
            category: category,
            description: description,
            total_exp: 0,
            level: 1,
            created_date: new Date().toLocaleDateString(),
            is_active: true
        };
        
        this.skills.push(skill);
        this.nextSkillId++;
        this.saveSkills();
        return skill;
    }
    
    updateSkill(skillId, name, category, description) {
        const skillIndex = this.skills.findIndex(s => s.id === skillId);
        if (skillIndex === -1) return false;
        
        this.skills[skillIndex].name = name;
        this.skills[skillIndex].category = category;
        this.skills[skillIndex].description = description;
        
        this.saveSkills();
        return true;
    }

    addExpRecord(skillId, expValue, note, date) {
        const record = {
            id: this.nextRecordId.toString(),
            skill_id: skillId,
            exp_value: expValue,
            note: note,
            date: date,
            timestamp: new Date().toISOString()
        };
        
        this.expRecords.push(record);
        this.nextRecordId++;
        
        // Update skill experience and level
        const skill = this.skills.find(s => s.id === skillId);
        if (skill) {
            skill.total_exp += expValue;
            skill.level = this.calculateLevel(skill.total_exp);
        }
        
        this.saveRecords();
        this.saveSkills();
        return record;
    }

    calculateLevel(totalExp) {
        // 指数增长模型：Lv(n) -> Lv(n+1) 所需经验 = 100 * (1.2)^(n-1)
        // 计算当前等级
        let level = 1;
        let expNeeded = 0;
        
        while (expNeeded <= totalExp) {
            const expForThisLevel = 100 * Math.pow(1.2, level - 1);
            if (expNeeded + expForThisLevel > totalExp) {
                break;
            }
            expNeeded += expForThisLevel;
            level++;
        }
        
        return level;
    }

    // 获取到达指定等级所需的总经验值
    getTotalExpForLevel(level) {
        let totalExp = 0;
        for (let i = 1; i < level; i++) {
            totalExp += 100 * Math.pow(1.2, i - 1);
        }
        return Math.floor(totalExp);
    }

    getExpForNextLevel(currentExp) {
        const currentLevel = this.calculateLevel(currentExp);
        const currentLevelTotalExp = this.getTotalExpForLevel(currentLevel);
        const nextLevelTotalExp = this.getTotalExpForLevel(currentLevel + 1);
        return nextLevelTotalExp - currentExp;
    }

    getExpForCurrentLevel(currentExp) {
        const currentLevel = this.calculateLevel(currentExp);
        const currentLevelTotalExp = this.getTotalExpForLevel(currentLevel);
        return currentExp - currentLevelTotalExp;
    }

    getExpNeededForCurrentLevel(currentExp) {
        const currentLevel = this.calculateLevel(currentExp);
        // 当前等级升级到下一等级所需的经验值
        return Math.floor(100 * Math.pow(1.2, currentLevel - 1));
    }

    getActiveSkills() {
        return this.skills.filter(skill => skill.is_active);
    }

    deleteSkill(skillId) {
        const skill = this.skills.find(s => s.id === skillId);
        if (skill) {
            skill.is_active = false;
            this.saveSkills();
        }
    }

    deleteRecord(recordId) {
        const recordIndex = this.expRecords.findIndex(r => r.id === recordId);
        if (recordIndex === -1) return false;
        
        const record = this.expRecords[recordIndex];
        const skill = this.skills.find(s => s.id === record.skill_id);
        
        if (skill) {
            // 扣除对应的经验值
            skill.total_exp -= record.exp_value;
            // 确保经验值不为负数
            if (skill.total_exp < 0) skill.total_exp = 0;
            // 重新计算等级
            skill.level = this.calculateLevel(skill.total_exp);
        }
        
        // 删除记录
        this.expRecords.splice(recordIndex, 1);
        
        // 保存数据
        this.saveRecords();
        this.saveSkills();
        
        return true;
    }

    getTotalExp() {
        return this.getActiveSkills().reduce((total, skill) => total + skill.total_exp, 0);
    }

    getAverageLevel() {
        const activeSkills = this.getActiveSkills();
        if (activeSkills.length === 0) return 0;
        const totalLevels = activeSkills.reduce((total, skill) => total + skill.level, 0);
        return Math.round(totalLevels / activeSkills.length * 10) / 10;
    }

    getHighestLevel() {
        const activeSkills = this.getActiveSkills();
        if (activeSkills.length === 0) return 0;
        return Math.max(...activeSkills.map(s => s.level));
    }

    getLastRecordDate(skillId) {
        const skillRecords = this.expRecords.filter(record => record.skill_id === skillId);
        if (skillRecords.length === 0) return 'No records';
        
        const lastRecord = skillRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        return lastRecord.date;
    }

    getTodayExp() {
        const today = new Date().toDateString();
        return this.expRecords.filter(record => {
            const recordDate = new Date(record.date).toDateString();
            return recordDate === today;
        }).reduce((total, record) => total + record.exp_value, 0);
    }

    loadTheme() {
        const theme = localStorage.getItem('exp_tracker_theme') || 'default';
        this.applyTheme(theme);
    }

    saveTheme(theme) {
        localStorage.setItem('exp_tracker_theme', theme);
    }

    applyTheme(theme) {
        document.body.className = theme === 'default' ? '' : `theme-${theme}`;
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = theme;
        }
    }

    resetAllData() {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            localStorage.removeItem('exp_tracker_skills');
            localStorage.removeItem('exp_tracker_records');
            localStorage.removeItem('exp_tracker_next_skill_id');
            localStorage.removeItem('exp_tracker_next_record_id');
            this.skills = [];
            this.expRecords = [];
            this.nextSkillId = 1;
            this.nextRecordId = 1;
            return true;
        }
        return false;
    }
}

// Global data manager instance
const dataManager = new DataManager();

// UI Update Functions
function updateDashboard() {
    const activeSkills = dataManager.getActiveSkills();
    
    // Update statistics
    document.getElementById('skill-count').textContent = activeSkills.length;
    document.getElementById('total-exp').textContent = dataManager.getTotalExp();
    document.getElementById('today-exp').textContent = dataManager.getTodayExp();
    document.getElementById('max-level').textContent = `Lv.${dataManager.getHighestLevel()}`;
    
    // Update skills display with progress bars
    updateDashboardSkillsList();
}

function updateDashboardSkillsList() {
    const skillsDisplay = document.getElementById('skills-display');
    skillsDisplay.innerHTML = '';
    
    const activeSkills = dataManager.getActiveSkills();
    
    if (activeSkills.length === 0) {
        skillsDisplay.innerHTML = '<p class="no-skills">No skills created yet. Go to Skills tab to create your first skill!</p>';
        return;
    }
    
    activeSkills.forEach((skill, index) => {
        const levelColorClass = getLevelColorClass(skill.level);
        const progress = {
            current: dataManager.getExpForCurrentLevel(skill.total_exp),
            needed: dataManager.getExpNeededForCurrentLevel(skill.total_exp)
        };
        const progressPercent = (progress.current / progress.needed) * 100;
        
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-progress-item';
        skillItem.style.animationDelay = `${index * 0.1}s`;
        
        const categoryIcon = getCategoryIcon(skill.category);
        
        skillItem.innerHTML = `
            <div class="skill-simple-header">
                <span class="skill-name">${skill.name}</span>
                <span class="skill-level ${levelColorClass}">Lv.${skill.level}</span>
            </div>
            <div class="skill-progress-bar">
                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                <div class="progress-text">${progress.current}/${progress.needed} EXP</div>
            </div>
        `;
        skillsDisplay.appendChild(skillItem);
    });
}

function updateSkillsList() {
    const skillsGrid = document.getElementById('skills-grid');
    // 保留第一个添加技能的卡片
    const addCard = skillsGrid.querySelector('.add-skill-card');
    skillsGrid.innerHTML = '';
    skillsGrid.appendChild(addCard);
    
    const activeSkills = dataManager.getActiveSkills();
    
    activeSkills.forEach((skill, index) => {
        const levelColorClass = getLevelColorClass(skill.level);
        const progress = {
            current: dataManager.getExpForCurrentLevel(skill.total_exp),
            needed: dataManager.getExpNeededForCurrentLevel(skill.total_exp)
        };
        const progressPercent = (progress.current / progress.needed) * 100;
        
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card existing-skill-card';
        skillCard.style.animationDelay = `${index * 0.1}s`;
        skillCard.onclick = () => showSkillDetails(skill.id);
        
        const categoryIcon = getCategoryIcon(skill.category);
        
        skillCard.innerHTML = `
            <div class="skill-card-content">
                <div class="skill-header">
                    <span class="skill-level ${levelColorClass}">Lv.${skill.level}</span>
                </div>
                <h4 class="skill-name">${skill.name}</h4>
                <div class="skill-category">${skill.category}</div>
                <div class="skill-progress">
                    <div class="progress-bar-mini">
                        <div class="progress-fill-mini" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="progress-text">${skill.total_exp} EXP</span>
                </div>
                <div class="skill-actions-mini">
                    <button class="action-btn edit-btn" onclick="event.stopPropagation(); editSkill('${skill.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="action-btn delete-btn" onclick="event.stopPropagation(); deleteSkill('${skill.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `;
        skillsGrid.appendChild(skillCard);
    });
}

function getCategoryIcon(category) {
    const icons = {
        'Learning': '📚',
        'Sports': '⚽',
        'Creative': '🎨',
        'Life': '🏠',
        'Other': '🔧'
    };
    return icons[category] || '🎯';
}

function showSkillDetails(skillId) {
    const skill = dataManager.skills.find(s => s.id === skillId);
    if (!skill) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal skill-detail-modal';
    modal.style.display = 'block';
    
    const progress = {
        current: dataManager.getExpForCurrentLevel(skill.total_exp),
        needed: dataManager.getExpNeededForCurrentLevel(skill.total_exp)
    };
    const progressPercent = (progress.current / progress.needed) * 100;
    const levelColorClass = getLevelColorClass(skill.level);
    
    modal.innerHTML = `
        <div class="modal-content skill-detail-content">
            <div class="modal-header">
                <h3>${getCategoryIcon(skill.category)} ${skill.name}</h3>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="skill-detail-body">
                <div class="skill-detail-stats">
                    <div class="stat-item">
                        <span class="stat-label">Level</span>
                        <span class="stat-value ${levelColorClass}">Lv.${skill.level}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total EXP</span>
                        <span class="stat-value">${skill.total_exp}</span>
                    </div>
                </div>
                
                <div class="skill-progress-detail">
                    <div class="skill-progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        <div class="progress-text">${progress.current} / ${progress.needed} EXP</div>
                    </div>
                </div>
                
                <div class="skill-time-info">
                    <div class="time-item">
                        <span class="time-label">Created:</span>
                        <span class="time-value">${skill.created_date}</span>
                    </div>
                    <div class="time-item">
                        <span class="time-label">Last Record:</span>
                        <span class="time-value">${dataManager.getLastRecordDate(skill.id)}</span>
                    </div>
                </div>
                
                <div class="skill-detail-actions">
                    <button class="btn btn-edit" onclick="editSkill('${skill.id}'); this.parentElement.parentElement.parentElement.parentElement.remove();">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteSkill('${skill.id}'); this.parentElement.parentElement.parentElement.parentElement.remove();">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 点击模态框外部关闭
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

function updateSkillSelect() {
    const skillSelect = document.getElementById('skill-select');
    skillSelect.innerHTML = '<option value="">Choose a skill</option>';
    
    dataManager.getActiveSkills().forEach(skill => {
        const option = document.createElement('option');
        option.value = skill.id;
        option.textContent = `${skill.name} (Lv.${skill.level})`;
        skillSelect.appendChild(option);
    });
}

function editSkill(skillId) {
    const skill = dataManager.skills.find(s => s.id === skillId);
    if (!skill) return;
    
    // Show modal
    const modal = document.getElementById('skill-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('skill-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Fill the form with current skill data
    document.getElementById('skill-name').value = skill.name;
    document.getElementById('skill-category').value = skill.category;
    document.getElementById('skill-description').value = skill.description || '';
    
    // Change to edit mode
    modalTitle.textContent = '✏️ Edit Skill';
    submitBtn.textContent = '✏️ Update Skill';
    submitBtn.className = 'btn btn-edit';
    
    // Store the skill ID for updating
    form.dataset.editingSkillId = skillId;
    
    // Show modal
    modal.style.display = 'block';
    showNotification('✏️ Editing skill. Make changes and click Update.');
}

function cancelEdit() {
    const modal = document.getElementById('skill-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('skill-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Reset form
    form.reset();
    delete form.dataset.editingSkillId;
    
    // Reset to create mode
    modalTitle.textContent = '🎯 Create New Skill';
    submitBtn.textContent = 'Create Skill';
    submitBtn.className = 'btn';
    
    // Hide modal
    modal.style.display = 'none';
    
    showNotification('Edit cancelled.');
}

function showCreateSkillModal() {
    const modal = document.getElementById('skill-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('skill-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Reset form
    form.reset();
    delete form.dataset.editingSkillId;
    
    // Set to create mode
    modalTitle.textContent = '🎯 Create New Skill';
    submitBtn.textContent = 'Create Skill';
    submitBtn.className = 'btn';
    
    // Show modal
    modal.style.display = 'block';
}

function deleteSkill(skillId) {
    if (confirm('Are you sure you want to delete this skill? Related records will be kept but marked as deleted skill.')) {
        dataManager.deleteSkill(skillId);
        updateSkillsList();
        updateSkillSelect();
        updateDashboard();
        showNotification('Skill deleted');
    }
}

function deleteRecord(recordId) {
    if (confirm('确定要删除这条记录吗？删除后将扣除对应的经验值。')) {
        const success = dataManager.deleteRecord(recordId);
        if (success) {
            // 更新所有相关的UI
            updateDashboard();
            updateSkillsList();
            updateRecordsList();
            showNotification('✅ 记录删除成功！');
        } else {
            showNotification('❌ 删除失败，记录不存在', true);
        }
    }
}

function updateRecordsList() {
    const recordsList = document.getElementById('records-list');
    recordsList.innerHTML = '';
    
    // Sort records by timestamp (newest first) for more precise ordering
    const sortedRecords = [...dataManager.expRecords].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    sortedRecords.forEach(record => {
        const skill = dataManager.skills.find(s => s.id === record.skill_id);
        const skillName = skill ? skill.name : 'Deleted Skill';
        
        // Format timestamp for display
        const recordTime = new Date(record.timestamp);
        const timeString = recordTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const recordDiv = document.createElement('div');
        recordDiv.className = 'record-item';
        recordDiv.innerHTML = `
            <div class="record-content">
                <div class="record-info">
                    <strong>${skillName}</strong> +${record.exp_value} EXP<br>
                    <small>${record.note || 'No notes'}</small>
                </div>
                <div class="record-date">
                    <small>${timeString}</small>
                </div>
            </div>
            <div class="record-actions">
                <button class="btn-delete" onclick="deleteRecord('${record.id}')" title="Delete Record">
                    🗑️
                </button>
            </div>
        `;
        recordsList.appendChild(recordDiv);
    });
}

function getLevelColorClass(level) {
    if (level <= 10) return 'level-1-10';
    if (level <= 25) return 'level-11-25';
    if (level <= 50) return 'level-26-50';
    if (level <= 75) return 'level-51-75';
    return 'level-76-99';
}

// Theme and Settings Functions
function applyTheme() {
    const theme = document.getElementById('theme-select').value;
    applyThemeFromSelect(theme);
    dataManager.applyTheme(theme);
    dataManager.saveTheme(theme);
    showNotification('Theme applied successfully');
}

function resetData() {
    if (dataManager.resetAllData()) {
        updateDashboard();
        updateSkillsList();
        updateSkillSelect();
        updateRecordsList();
        showNotification('All data has been reset');
    }
}

// Tab Management
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Find and activate the corresponding nav tab
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        if (tab.getAttribute('onclick').includes(tabName)) {
            tab.classList.add('active');
        }
    });
}

// Notification System
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : 'success'}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Set preset EXP value for quick buttons
function setExpValue(value) {
    document.getElementById('exp-value').value = value;
}

// Theme management
const themes = {
    default: {
        '--primary-color': '#07b979',
        '--secondary-color': '#fc932b',
        '--accent-color': '#03452e',
        '--text-color': '#000000',
        '--bg-color': '#ffffff',
        '--card-bg': '#f2f2f2',
        '--border-color': '#e0e0e0',
        '--shadow-color': 'rgba(7, 185, 121, 0.15)'
    },
    blue: {
        '--primary-color': '#3498db',
        '--secondary-color': '#f39c12',
        '--accent-color': '#2980b9',
        '--text-color': '#2c3e50',
        '--bg-color': '#ecf0f1',
        '--card-bg': '#ffffff',
        '--border-color': '#bdc3c7',
        '--shadow-color': 'rgba(52, 152, 219, 0.15)'
    },
    purple: {
        '--primary-color': '#9b59b6',
        '--secondary-color': '#e67e22',
        '--accent-color': '#8e44ad',
        '--text-color': '#2c3e50',
        '--bg-color': '#f8f9fa',
        '--card-bg': '#ffffff',
        '--border-color': '#d1c4e9',
        '--shadow-color': 'rgba(155, 89, 182, 0.15)'
    },
    red: {
        '--primary-color': '#e74c3c',
        '--secondary-color': '#f39c12',
        '--accent-color': '#c0392b',
        '--text-color': '#2c3e50',
        '--bg-color': '#fdf2f2',
        '--card-bg': '#ffffff',
        '--border-color': '#fadbd8',
        '--shadow-color': 'rgba(231, 76, 60, 0.15)'
    },
    dark: {
        '--primary-color': '#34495e',
        '--secondary-color': '#f39c12',
        '--accent-color': '#2c3e50',
        '--text-color': '#ecf0f1',
        '--bg-color': '#2c3e50',
        '--card-bg': '#34495e',
        '--border-color': '#4a6741',
        '--shadow-color': 'rgba(52, 73, 94, 0.3)'
    }
};

function applyThemeFromSelect(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    
    const root = document.documentElement;
    Object.keys(theme).forEach(property => {
        root.style.setProperty(property, theme[property]);
    });
    
    // Update active theme button if exists
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-theme="${themeName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Save theme preference
    localStorage.setItem('selectedTheme', themeName);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize interface
    updateDashboard();
    updateSkillSelect();
    updateSkillsList();
    updateRecordsList();
    
    // Load saved theme or default
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.value = savedTheme;
        applyThemeFromSelect(savedTheme);
    }
    
    // Add theme switcher event listeners for buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            applyThemeFromSelect(theme);
        });
    });
    
    // Add Create New Skill button event listener
    const addSkillCard = document.querySelector('.add-skill-card');
    if (addSkillCard) {
        addSkillCard.addEventListener('click', function() {
            showCreateSkillModal();
        });
    }
    
    // Show dashboard by default
    showTab('dashboard');
    
    // Settings button handler
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            showTab('settings');
        });
    }
    
    // Modal event listeners
    const modal = document.getElementById('skill-modal');
    const closeBtn = document.querySelector('.close');
    
    // Close modal when clicking X
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Skill form handler
    document.getElementById('skill-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('skill-name').value.trim();
        const category = document.getElementById('skill-category').value;
        const description = document.getElementById('skill-description').value.trim();
        const editingSkillId = this.dataset.editingSkillId;
        
        if (!name) {
            showNotification('Please enter skill name', true);
            return;
        }
        
        // Check if skill name already exists (except for current editing skill)
        const existingSkill = dataManager.getActiveSkills().find(s => s.name === name);
        if (existingSkill && existingSkill.id !== editingSkillId) {
            showNotification('Skill name already exists', true);
            return;
        }
        
        if (editingSkillId) {
            // Update existing skill
            if (dataManager.updateSkill(editingSkillId, name, category, description)) {
                showNotification('✅ Skill updated successfully!');
                this.reset();
                delete this.dataset.editingSkillId;
                modal.style.display = 'none';
            } else {
                showNotification('Failed to update skill', true);
                return;
            }
        } else {
            // Create new skill
            dataManager.createSkill(name, category, description);
            showNotification('✅ Skill created successfully!');
            this.reset();
            modal.style.display = 'none';
        }
        
        // Update interface
        updateSkillsList();
        updateSkillSelect();
        updateDashboard();
    });
    
    // Experience record form handler
    document.getElementById('exp-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const skillId = document.getElementById('skill-select').value;
        const expValue = parseInt(document.getElementById('exp-value').value);
        const note = document.getElementById('exp-note').value.trim();
        const date = new Date().toISOString().split('T')[0]; // Always use today's date
        
        if (!skillId) {
            showNotification('Please select a skill', true);
            return;
        }
        
        if (!expValue || expValue < 1 || expValue > 1000) {
            showNotification('EXP value must be between 1-1000', true);
            return;
        }
        
        dataManager.addExpRecord(skillId, expValue, note, date);
        
        // Clear form
        this.reset();
        
        // Update interface
        updateDashboard();
        updateSkillSelect();
        updateRecordsList();
        
        showNotification(`Successfully added ${expValue} EXP`);
    });
});
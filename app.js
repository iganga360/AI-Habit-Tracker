// AI Habit Tracker Application
class HabitTracker {
    constructor() {
        this.habits = this.loadHabits();
        this.editingHabitId = null;
        this.init();
    }

    init() {
        this.updateDate();
        this.renderHabits();
        this.renderTrending();
        this.renderAIInsights();
        this.renderStats();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add habit button
        document.getElementById('addHabitBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Form submit
        document.getElementById('habitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveHabit();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('habitModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    updateDate() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', options);
    }

    loadHabits() {
        const stored = localStorage.getItem('habits');
        return stored ? JSON.parse(stored) : this.getDefaultHabits();
    }

    getDefaultHabits() {
        // Sample habits to get started
        return [
            {
                id: Date.now() + 1,
                name: 'Morning Meditation',
                category: 'mindfulness',
                goal: '10 minutes',
                streak: 5,
                completedToday: false,
                completedDates: [],
                createdAt: Date.now()
            },
            {
                id: Date.now() + 2,
                name: 'Read a Book',
                category: 'learning',
                goal: '30 pages',
                streak: 3,
                completedToday: false,
                completedDates: [],
                createdAt: Date.now()
            },
            {
                id: Date.now() + 3,
                name: 'Exercise',
                category: 'health',
                goal: '30 minutes',
                streak: 7,
                completedToday: false,
                completedDates: [],
                createdAt: Date.now()
            }
        ];
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    renderHabits() {
        const habitsList = document.getElementById('habitsList');
        
        if (this.habits.length === 0) {
            habitsList.innerHTML = `
                <div class="empty-state">
                    <p>📝 No habits yet!</p>
                    <p style="font-size: 0.9rem;">Click "Add New Habit" to get started</p>
                </div>
            `;
            return;
        }

        habitsList.innerHTML = this.habits.map(habit => `
            <div class="habit-item ${habit.completedToday ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="habit-checkbox" 
                    ${habit.completedToday ? 'checked' : ''}
                    onchange="tracker.toggleHabit(${habit.id})"
                >
                <div class="habit-info">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-details">
                        <span class="habit-category category-${habit.category}">
                            ${this.getCategoryIcon(habit.category)} ${habit.category}
                        </span>
                        <span class="habit-goal">${habit.goal || 'Daily'}</span>
                        <span class="habit-streak">🔥 ${habit.streak} day streak</span>
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="btn-icon btn-edit" onclick="tracker.editHabit(${habit.id})" title="Edit">✏️</button>
                    <button class="btn-icon btn-delete" onclick="tracker.deleteHabit(${habit.id})" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    getCategoryIcon(category) {
        const icons = {
            health: '💪',
            productivity: '⚡',
            mindfulness: '🧘',
            learning: '📚',
            social: '👥',
            other: '⭐'
        };
        return icons[category] || '⭐';
    }

    toggleHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;

        const today = new Date().toDateString();
        
        if (habit.completedToday) {
            // Uncomplete
            habit.completedToday = false;
            habit.completedDates = habit.completedDates.filter(date => date !== today);
            if (habit.streak > 0) habit.streak--;
        } else {
            // Complete
            habit.completedToday = true;
            habit.completedDates.push(today);
            habit.streak++;
        }

        this.saveHabits();
        this.renderHabits();
        this.renderAIInsights();
        this.renderStats();
    }

    openModal(habitId = null) {
        const modal = document.getElementById('habitModal');
        const form = document.getElementById('habitForm');
        const title = document.getElementById('modalTitle');

        if (habitId) {
            const habit = this.habits.find(h => h.id === habitId);
            title.textContent = 'Edit Habit';
            document.getElementById('habitName').value = habit.name;
            document.getElementById('habitCategory').value = habit.category;
            document.getElementById('habitGoal').value = habit.goal || '';
            this.editingHabitId = habitId;
        } else {
            title.textContent = 'Add New Habit';
            form.reset();
            this.editingHabitId = null;
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('habitModal').style.display = 'none';
        document.getElementById('habitForm').reset();
        this.editingHabitId = null;
    }

    saveHabit() {
        const name = document.getElementById('habitName').value;
        const category = document.getElementById('habitCategory').value;
        const goal = document.getElementById('habitGoal').value;

        if (this.editingHabitId) {
            // Update existing habit
            const habit = this.habits.find(h => h.id === this.editingHabitId);
            habit.name = name;
            habit.category = category;
            habit.goal = goal;
        } else {
            // Create new habit
            const newHabit = {
                id: Date.now(),
                name,
                category,
                goal,
                streak: 0,
                completedToday: false,
                completedDates: [],
                createdAt: Date.now()
            };
            this.habits.push(newHabit);
        }

        this.saveHabits();
        this.renderHabits();
        this.renderTrending();
        this.renderAIInsights();
        this.renderStats();
        this.closeModal();
    }

    editHabit(id) {
        this.openModal(id);
    }

    deleteHabit(id) {
        if (confirm('Are you sure you want to delete this habit?')) {
            this.habits = this.habits.filter(h => h.id !== id);
            this.saveHabits();
            this.renderHabits();
            this.renderTrending();
            this.renderAIInsights();
            this.renderStats();
        }
    }

    renderTrending() {
        const trendingList = document.getElementById('trendingHabits');
        
        // Simulate trending habits based on popular categories
        const trendingHabits = [
            { name: 'Morning Workout', count: '2.5k users', category: 'health' },
            { name: 'Daily Journaling', count: '1.8k users', category: 'mindfulness' },
            { name: 'Learn New Skill', count: '1.5k users', category: 'learning' },
            { name: 'Healthy Breakfast', count: '1.2k users', category: 'health' },
            { name: 'Evening Walk', count: '950 users', category: 'health' }
        ];

        trendingList.innerHTML = trendingHabits.map(habit => `
            <div class="trending-item" onclick="tracker.addTrendingHabit('${habit.name}', '${habit.category}')">
                <span class="trending-name">${this.getCategoryIcon(habit.category)} ${habit.name}</span>
                <span class="trending-count">${habit.count}</span>
            </div>
        `).join('');
    }

    addTrendingHabit(name, category) {
        // Check if habit already exists
        const exists = this.habits.some(h => h.name.toLowerCase() === name.toLowerCase());
        if (exists) {
            alert('You already have this habit!');
            return;
        }

        const newHabit = {
            id: Date.now(),
            name,
            category,
            goal: 'Daily',
            streak: 0,
            completedToday: false,
            completedDates: [],
            createdAt: Date.now()
        };

        this.habits.push(newHabit);
        this.saveHabits();
        this.renderHabits();
        this.renderAIInsights();
        this.renderStats();
        
        // Scroll to habits section
        document.querySelector('.daily-habits').scrollIntoView({ behavior: 'smooth' });
    }

    renderAIInsights() {
        const insightsSection = document.getElementById('aiInsights');
        const insights = this.generateAIInsights();

        if (insights.length === 0) {
            insightsSection.innerHTML = `
                <div class="empty-state">
                    <p style="font-size: 0.9rem;">Complete habits to get AI insights!</p>
                </div>
            `;
            return;
        }

        insightsSection.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <p>${insight}</p>
            </div>
        `).join('');
    }

    generateAIInsights() {
        const insights = [];
        const completedToday = this.habits.filter(h => h.completedToday).length;
        const totalHabits = this.habits.length;
        const avgStreak = this.habits.reduce((sum, h) => sum + h.streak, 0) / totalHabits || 0;

        if (completedToday === totalHabits && totalHabits > 0) {
            insights.push('🎉 Amazing! You\'ve completed all your habits today! Keep up the excellent work!');
        } else if (completedToday > 0) {
            insights.push(`💪 You've completed ${completedToday} out of ${totalHabits} habits today. You're doing great!`);
        }

        if (avgStreak > 5) {
            insights.push('🔥 Your average streak is impressive! Consistency is key to building lasting habits.');
        } else if (avgStreak > 0) {
            insights.push('📈 Keep building those streaks! Small daily actions lead to big results.');
        }

        const healthHabits = this.habits.filter(h => h.category === 'health').length;
        if (healthHabits === 0) {
            insights.push('💡 Consider adding a health-related habit like exercise or drinking water to boost your wellbeing.');
        }

        const mindfulnessHabits = this.habits.filter(h => h.category === 'mindfulness').length;
        if (mindfulnessHabits === 0) {
            insights.push('🧘 Adding a mindfulness practice like meditation can improve focus and reduce stress.');
        }

        const bestStreak = Math.max(...this.habits.map(h => h.streak), 0);
        if (bestStreak >= 7) {
            const bestHabit = this.habits.find(h => h.streak === bestStreak);
            insights.push(`⭐ Your best streak is ${bestStreak} days with "${bestHabit.name}". Fantastic commitment!`);
        }

        return insights;
    }

    renderStats() {
        const statsSection = document.getElementById('statsSection');
        const totalHabits = this.habits.length;
        const completedToday = this.habits.filter(h => h.completedToday).length;
        const totalStreaks = this.habits.reduce((sum, h) => sum + h.streak, 0);
        const avgStreak = totalHabits > 0 ? Math.round(totalStreaks / totalHabits) : 0;
        const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

        statsSection.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Habits</span>
                <span class="stat-value">${totalHabits}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Completed Today</span>
                <span class="stat-value">${completedToday}/${totalHabits}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Today's Progress</span>
                <span class="stat-value">${completionRate}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Average Streak</span>
                <span class="stat-value">${avgStreak} days</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Streak Days</span>
                <span class="stat-value">${totalStreaks}</span>
            </div>
        `;
    }

    // Reset daily completions (would be called at midnight in production)
    resetDailyCompletions() {
        const today = new Date().toDateString();
        this.habits.forEach(habit => {
            if (!habit.completedDates.includes(today)) {
                habit.completedToday = false;
            }
        });
        this.saveHabits();
        this.renderHabits();
    }
}

// Initialize the app
const tracker = new HabitTracker();

// Check for daily reset every hour
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        tracker.resetDailyCompletions();
    }
}, 60000); // Check every minute

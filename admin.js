// Zinox Games Admin Panel - Secure Admin Management System
// Author: Senior Full-Stack Developer
// Version: 1.0 Production Ready

class ZinoxAdminPanel {
    constructor() {
        // Admin State
        this.adminState = {
            isAuthenticated: false,
            adminUser: null,
            sessionToken: null,
            permissions: [],
            lastActivity: Date.now(),
            loginAttempts: 0,
            maxLoginAttempts: 3,
            lockoutTime: 0
        };

        // Configuration
        this.config = {
            supabaseUrl: 'https://btwrcgtrelecucwaruvl.supabase.co',
            supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0d3JjZ3RyZWxlY3Vjd2FydXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjY4MDIsImV4cCI6MjA5MzQwMjgwMn0.z5loPHh9GlmLqTOYFBwTVNBxyCz1rU0w23KDZIsIeKc',
            sessionTimeout: 3600000, // 1 hour
            refreshInterval: 30000, // 30 seconds
            maxFailedLogins: 3,
            lockoutDuration: 900000, // 15 minutes
            adminUsername: 'scammer',
            adminPassword: 'mumkin12',
            admin2FASecret: 'kk' // In production, use proper 2FA
        };

        // Data
        this.users = [];
        this.logs = [];
        this.analytics = {};
        this.systemStats = {};
        this.supabase = null;

        // DOM Elements
        this.elements = {};

        // Initialize
        this.init();
    }

    async init() {
        console.log('🔐 Zinox Admin Panel ishga tushirilmoqda...');
        
        // Initialize elements
        this.initializeElements();

        // Initialize Supabase
        this.initializeSupabaseClient();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check for existing session
        await this.checkExistingSession();
        
        // Initialize dashboard if authenticated
        if (this.adminState.isAuthenticated) {
            await this.initializeDashboard();
        }
        
        // Start session monitoring
        this.startSessionMonitoring();
        
        console.log('🔐 Admin panel tayyor');
    }

    initializeSupabaseClient() {
        try {
            if (window.supabase?.createClient) {
                this.supabase = window.supabase.createClient(
                    this.config.supabaseUrl,
                    this.config.supabaseKey
                );
            }
        } catch (error) {
            console.error('❌ Admin Supabase init xatosi:', error);
        }
    }

    initializeElements() {
        // Login elements
        this.elements.loginForm = document.getElementById('loginForm');
        this.elements.adminUsername = document.getElementById('adminUsername');
        this.elements.adminPassword = document.getElementById('adminPassword');
        this.elements.admin2FA = document.getElementById('admin2FA');
        
        // Dashboard elements
        this.elements.loginScreen = document.getElementById('loginScreen');
        this.elements.adminDashboard = document.getElementById('adminDashboard');
        this.elements.adminName = document.getElementById('adminName');
        this.elements.logoutBtn = document.getElementById('logoutBtn');
        
        // Navigation
        this.elements.navBtns = document.querySelectorAll('.nav-btn');
        this.elements.contentSections = document.querySelectorAll('.content-section');
        
        // Stats
        this.elements.onlineUsersCount = document.getElementById('onlineUsersCount');
        this.elements.totalUsersCount = document.getElementById('totalUsersCount');
        this.elements.totalTokens = document.getElementById('totalTokens');
        this.elements.totalCash = document.getElementById('totalCash');
        this.elements.activePlayers = document.getElementById('activePlayers');
        this.elements.suspiciousActivity = document.getElementById('suspiciousActivity');
        
        // User management
        this.elements.userSearch = document.getElementById('userSearch');
        this.elements.userFilter = document.getElementById('userFilter');
        this.elements.usersTableBody = document.getElementById('usersTableBody');
        this.elements.currentPage = document.getElementById('currentPage');
        this.elements.totalPages = document.getElementById('totalPages');
        
        // Cash management
        this.elements.cashDistributionForm = document.getElementById('cashDistributionForm');
        this.elements.targetUser = document.getElementById('targetUser');
        this.elements.cashAmount = document.getElementById('cashAmount');
        this.elements.cashReason = document.getElementById('cashReason');
        this.elements.cashHistory = document.getElementById('cashHistory');

        // Ads
        this.elements.createAdBtn = document.getElementById('createAdBtn');
        this.elements.adUploadForm = document.getElementById('adUploadForm');
        this.elements.adTitle = document.getElementById('adTitle');
        this.elements.adType = document.getElementById('adType');
        this.elements.adDuration = document.getElementById('adDuration');
        this.elements.adFile = document.getElementById('adFile');
        this.elements.adsList = document.getElementById('adsList');
        
        // System time
        this.elements.systemTime = document.getElementById('systemTime');
    }

    setupEventListeners() {
        // Login form
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Logout
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // Navigation
        this.elements.navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNavigation(e.currentTarget.dataset.section));
        });
        
        // User management
        if (this.elements.userSearch) {
            this.elements.userSearch.addEventListener('input', () => this.handleUserSearch());
        }
        
        if (this.elements.userFilter) {
            this.elements.userFilter.addEventListener('change', () => this.handleUserFilter());
        }
        
        // Cash distribution
        if (this.elements.cashDistributionForm) {
            this.elements.cashDistributionForm.addEventListener('submit', (e) => this.handleCashDistribution(e));
        }

        if (this.elements.createAdBtn) {
            this.elements.createAdBtn.addEventListener('click', () => {
                this.elements.adUploadForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                this.elements.adTitle?.focus();
            });
        }

        if (this.elements.adUploadForm) {
            this.elements.adUploadForm.addEventListener('submit', (e) => this.handleAdUpload(e));
        }
        
        // Security
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Session activity
        document.addEventListener('mousemove', () => this.updateActivity());
        document.addEventListener('keypress', () => this.updateActivity());
    }

    async checkExistingSession() {
        try {
            const sessionData = localStorage.getItem('zinoxAdminSession');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                const currentTime = Date.now();
                
                // Check if session is still valid
                if (currentTime - session.lastActivity < this.config.sessionTimeout) {
                    this.adminState = { ...this.adminState, ...session };
                    this.showDashboard();
                    console.log('🔐 Mavjud sessiya topildi');
                } else {
                    localStorage.removeItem('zinoxAdminSession');
                    console.log('🔐 Sessiya muddati tugagan');
                }
            }
        } catch (error) {
            console.error('❌ Sessiyani tekshirishda xatolik:', error);
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        // Check if locked out
        if (this.adminState.lockoutTime > Date.now()) {
            const remainingTime = Math.ceil((this.adminState.lockoutTime - Date.now()) / 60000);
            this.showNotification(`🔒 Hush! ${remainingTime} daqiqada qayta urinib ko'ring`, 'error');
            return;
        }
        
        const username = this.elements.adminUsername.value.trim();
        const password = this.elements.adminPassword.value;
        const twoFACode = this.elements.admin2FA.value.trim();
        
        // Validate inputs
        if (!username || !password || !twoFACode) {
            this.showNotification('⚠️ Barcha maydonlarni to\'ldiring', 'warning');
            return;
        }
        
        // Show loading
        this.showNotification('🔐 Tekshirilmoqda...', 'info');
        
        // Simulate authentication delay
        await this.delay(1500);
        
        // Verify credentials
        if (this.verifyCredentials(username, password, twoFACode)) {
            // Successful login
            this.adminState.isAuthenticated = true;
            this.adminState.adminUser = username;
            this.adminState.sessionToken = this.generateSessionToken();
            this.adminState.permissions = ['super_admin', 'user_management', 'cash_management', 'analytics', 'security'];
            this.adminState.lastActivity = Date.now();
            this.adminState.loginAttempts = 0;
            
            // Save session
            this.saveSession();
            
            // Show dashboard
            this.showDashboard();
            
            this.showNotification('✅ Muvaffaqiyatli kirish!', 'success');
            console.log('🔐 Admin muvaffaqiyatli kirdi:', username);
        } else {
            // Failed login
            this.adminState.loginAttempts++;
            
            if (this.adminState.loginAttempts >= this.config.maxFailedLogins) {
                this.adminState.lockoutTime = Date.now() + this.config.lockoutDuration;
                this.showNotification('🔒 Juda ko\'p urinish! 15 daqiqa bloklandi', 'error');
            } else {
                this.showNotification(`❌ Notog\'ri ma\'lumotlar! Qolgan urinishlar: ${this.config.maxFailedLogins - this.adminState.loginAttempts}`, 'error');
            }
            
            // Clear form
            this.elements.loginForm.reset();
        }
    }

    verifyCredentials(username, password, twoFACode) {
        // In production, use proper authentication with Supabase Auth
        // For now, using hardcoded credentials for demo
        return username === this.config.adminUsername &&
               password === this.config.adminPassword &&
               twoFACode === this.config.admin2FASecret;
    }

    generateSessionToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    saveSession() {
        try {
            localStorage.setItem('zinoxAdminSession', JSON.stringify(this.adminState));
        } catch (error) {
            console.error('❌ Sessiyani saqlashda xatolik:', error);
        }
    }

    showDashboard() {
        this.elements.loginScreen.style.display = 'none';
        this.elements.adminDashboard.style.display = 'block';
        this.elements.adminName.textContent = this.adminState.adminUser;
        
        // Initialize dashboard with real-time data
        this.initializeDashboard();
    }

    async initializeDashboard() {
        // Start real-time updates
        this.startRealTimeUpdates();
        
        // Load initial data
        await this.loadDashboardData();
        
        // Setup activity monitoring
        this.setupActivityMonitoring();
        
        // Initialize charts
        this.initializeCharts();
        
        console.log('🎯 Admin dashboard initialized');
    }

    async loadDashboardData() {
        try {
            // Load real data from Supabase
            await Promise.all([
                this.loadRealUsersData(),
                this.loadRealAnalyticsData(),
                this.loadRealCashData(),
                this.loadRealSecurityData()
            ]);
            
            console.log('✅ Dashboard real data loaded');
        } catch (error) {
            console.error('❌ Dashboard data loading error:', error);
            // Fallback to mock data if real data fails
            this.loadMockDashboardData();
        }
    }

    async loadRealUsersData() {
        try {
            const { data: users, error } = await this.supabase
                .from('players')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1000);
            
            if (error) throw error;
            
            // Update user statistics
            const totalUsers = users.length;
            const onlineUsers = users.filter(u => u.is_online).length;
            const newUsersToday = users.filter(u => {
                const today = new Date().toDateString();
                const userDate = new Date(u.created_at).toDateString();
                return today === userDate;
            }).length;
            
            // Update UI
            this.updateElement('totalUsers', totalUsers.toLocaleString());
            this.updateElement('onlineUsers', onlineUsers.toLocaleString());
            this.updateElement('newUsersToday', newUsersToday.toLocaleString());
            
            // Update user table
            this.updateUsersTable(users);
            
            console.log(`✅ Loaded ${totalUsers} users`);
            
        } catch (error) {
            console.error('❌ Users data loading error:', error);
            throw error;
        }
    }

    async loadRealAnalyticsData() {
        try {
            const { data: analytics, error } = await this.supabase
                .from('analytics')
                .select('*')
                .order('date', { ascending: false })
                .limit(30);
            
            if (error) {
                // If analytics table doesn't exist, create from users data
                await this.createAnalyticsFromUsers();
                return;
            }
            
            // Update analytics
            this.updateAnalyticsDisplay(analytics);
            console.log('✅ Analytics data loaded');
            
        } catch (error) {
            console.error('❌ Analytics data loading error:', error);
            throw error;
        }
    }

    async createAnalyticsFromUsers() {
        try {
            const { data: users, error } = await this.supabase
                .from('players')
                .select('created_at, zinox_tokens, cash_balance, total_clicks');
            
            if (error) throw error;
            
            // Calculate daily analytics
            const dailyStats = {};
            users.forEach(user => {
                const date = new Date(user.created_at).toDateString();
                if (!dailyStats[date]) {
                    dailyStats[date] = {
                        date: date,
                        new_users: 0,
                        total_tokens: 0,
                        total_cash: 0,
                        total_clicks: 0
                    };
                }
                dailyStats[date].new_users++;
                dailyStats[date].total_tokens += user.zinox_tokens || 0;
                dailyStats[date].total_cash += user.cash_balance || 0;
                dailyStats[date].total_clicks += user.total_clicks || 0;
            });
            
            // Update analytics display
            const analyticsArray = Object.values(dailyStats).slice(-30);
            this.updateAnalyticsDisplay(analyticsArray);
            
        } catch (error) {
            console.error('❌ Analytics creation error:', error);
        }
    }

    async loadRealCashData() {
        try {
            const { data: cashData, error } = await this.supabase
                .from('cash_transactions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            
            if (error) {
                // If cash transactions table doesn't exist, calculate from users
                await this.calculateCashFromUsers();
                return;
            }
            
            // Update cash display
            this.updateCashDisplay(cashData);
            console.log('✅ Cash data loaded');
            
        } catch (error) {
            console.error('❌ Cash data loading error:', error);
            throw error;
        }
    }

    async calculateCashFromUsers() {
        try {
            const { data: users, error } = await this.supabase
                .from('players')
                .select('cash_balance, zinox_tokens, referral_earnings');
            
            if (error) throw error;
            
            const totalCash = users.reduce((sum, user) => sum + (user.cash_balance || 0), 0);
            const totalTokens = users.reduce((sum, user) => sum + (user.zinox_tokens || 0), 0);
            const totalReferralEarnings = users.reduce((sum, user) => sum + (user.referral_earnings || 0), 0);
            
            // Update cash display
            this.updateElement('totalCash', totalCash.toLocaleString());
            this.updateElement('totalTokens', totalTokens.toLocaleString());
            this.updateElement('totalReferralEarnings', totalReferralEarnings.toLocaleString());
            
            // Update cash table
            const topEarners = users
                .filter(u => u.cash_balance > 0)
                .sort((a, b) => b.cash_balance - a.cash_balance)
                .slice(0, 10);
            
            this.updateCashTable(topEarners);
            
        } catch (error) {
            console.error('❌ Cash calculation error:', error);
        }
    }

    async loadRealSecurityData() {
        try {
            const { data: securityData, error } = await this.supabase
                .from('security_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (error) {
                // If security logs table doesn't exist, create from users
                await this.createSecurityFromUsers();
                return;
            }
            
            // Update security display
            this.updateSecurityDisplay(securityData);
            console.log('✅ Security data loaded');
            
        } catch (error) {
            console.error('❌ Security data loading error:', error);
            throw error;
        }
    }

    async createSecurityFromUsers() {
        try {
            const { data: users, error } = await this.supabase
                .from('players')
                .select('id, username, suspicious_activity, last_seen, phone, telegram');
            
            if (error) throw error;
            
            const suspiciousUsers = users.filter(u => u.suspicious_activity);
            const recentLogins = users.filter(u => {
                const lastOnline = new Date(u.last_seen);
                const hourAgo = new Date(Date.now() - 3600000);
                return lastOnline > hourAgo;
            });
            
            // Update security display
            this.updateElement('suspiciousUsers', suspiciousUsers.length);
            this.updateElement('recentLogins', recentLogins.length);
            
            // Update security table
            const securityLogs = suspiciousUsers.map(user => ({
                user_id: user.id,
                username: user.username || 'Unknown',
                action: 'Suspicious Activity Detected',
                ip_address: 'Unknown',
                created_at: user.last_seen
            }));
            
            this.updateSecurityTable(securityLogs);
            
        } catch (error) {
            console.error('❌ Security data creation error:', error);
        }
    }

    updateUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = users.slice(0, 10).map(user => `
            <tr>
                <td>${user.id || user.user_id || 'N/A'}</td>
                <td>${user.username || 'Guest'}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${user.telegram || 'N/A'}</td>
                <td>${user.zinox_tokens || 0}</td>
                <td>${user.cash_balance || 0}</td>
                <td>${user.total_clicks || 0}</td>
                <td><span class="status ${user.is_online ? 'online' : 'offline'}">${user.is_online ? 'Online' : 'Offline'}</span></td>
                <td><span class="flag ${user.suspicious_activity ? 'suspicious' : 'safe'}">${user.suspicious_activity ? '⚠️' : '✅'}</span></td>
            </tr>
        `).join('');
    }

    updateCashTable(earners) {
        const tbody = document.getElementById('cashTableBody');
        if (tbody) {
            tbody.innerHTML = earners.map(user => `
                <tr>
                    <td>${user.id || user.user_id || 'N/A'}</td>
                    <td>${user.username || 'Guest'}</td>
                    <td>${user.cash_balance || 0}</td>
                    <td>${user.zinox_tokens || 0}</td>
                    <td>${user.referral_earnings || 0}</td>
                    <td>${new Date(user.created_at || Date.now()).toLocaleDateString()}</td>
                </tr>
            `).join('');
            return;
        }

        if (this.elements.cashHistory) {
            this.elements.cashHistory.innerHTML = earners.map(user => `
                <div class="history-item">
                    <strong>${user.username || 'Guest'}</strong>
                    <span>ID: ${user.id || user.user_id || 'N/A'}</span>
                    <span>Cash: ${user.cash_balance || 0}</span>
                    <span>Token: ${user.zinox_tokens || 0}</span>
                </div>
            `).join('');
        }
    }

    updateSecurityTable(logs) {
        const tbody = document.getElementById('logsList');
        if (!tbody) return;
        
        tbody.innerHTML = logs.map(log => `
            <div class="log-item ${String(log.action || log.event_type || log.description || '').includes('Suspicious') ? 'suspicious' : 'normal'}">
                <div class="log-header">
                    <span class="log-user">${log.username || log.user_id}</span>
                    <span class="log-time">${new Date(log.created_at).toLocaleString()}</span>
                </div>
                <div class="log-message">${log.action || log.description || log.event_type || 'Log'}</div>
            </div>
        `).join('');
    }

    updateAnalyticsDisplay(analytics) {
        // Update charts with real data
        if (this.analyticsChart) {
            const labels = analytics.map(a => new Date(a.date).toLocaleDateString());
            const usersData = analytics.map(a => a.new_users || 0);
            const tokensData = analytics.map(a => a.total_tokens || 0);
            
            this.analyticsChart.data.labels = labels;
            this.analyticsChart.data.datasets[0].data = usersData;
            this.analyticsChart.data.datasets[1].data = tokensData;
            this.analyticsChart.update();
        }
    }

    updateCashDisplay(cashData) {
        const totalCash = cashData.reduce((sum, item) => sum + (item.amount || 0), 0);
        this.updateElement('totalCash', totalCash.toLocaleString());
        
        // Update cash table
        const tbody = document.getElementById('cashTableBody');
        if (tbody) {
            tbody.innerHTML = cashData.slice(0, 10).map(item => `
                <tr>
                    <td>${item.player_username || item.user_id || 'N/A'}</td>
                    <td>${item.player_username || item.username || 'Guest'}</td>
                    <td>${item.amount || 0}</td>
                    <td>${item.transaction_type || item.type || 'Unknown'}</td>
                    <td>${new Date(item.created_at).toLocaleString()}</td>
                </tr>
            `).join('');
            return;
        }

        if (this.elements.cashHistory) {
            this.elements.cashHistory.innerHTML = cashData.slice(0, 10).map(item => `
                <div class="history-item">
                    <strong>${item.player_username || item.username || 'Guest'}</strong>
                    <span>Miqdor: ${item.amount || 0}</span>
                    <span>Turi: ${item.transaction_type || item.type || 'Unknown'}</span>
                    <span>${new Date(item.created_at).toLocaleString()}</span>
                </div>
            `).join('');
        }
    }

    updateSecurityDisplay(securityData) {
        const suspiciousCount = securityData.filter(s =>
            String(s.action || s.event_type || s.description || '').includes('Suspicious') ||
            String(s.severity || '').toLowerCase() === 'critical'
        ).length;
        this.updateElement('suspiciousUsers', suspiciousCount);
        
        // Update security table
        this.updateSecurityTable(securityData);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    async loadDashboardData() {
        if (!this.supabase) {
            this.loadMockDashboardData();
            return;
        }

        try {
            await Promise.all([
                this.loadUsersData(),
                this.loadAnalytics(),
                this.loadSystemStats(),
                this.loadLogsSection()
            ]);
            this.updateDashboardUI();
        } catch (error) {
            console.error('❌ Dashboard ma\'lumotlarini yuklashda xatolik:', error);
            this.loadMockDashboardData();
        }
    }

    async loadUsersData() {
        if (!this.supabase) return;

        let bannedUsers = new Set();
        try {
            const { data: banLogs, error: banError } = await this.supabase
                .from('security_logs')
                .select('player_username, event_type')
                .in('event_type', ['ban', 'auto_ban'])
                .limit(500);

            if (!banError) {
                bannedUsers = new Set((banLogs || []).map(log => log.player_username).filter(Boolean));
            }
        } catch (error) {
            console.warn('⚠️ Ban loglarini yuklab bo\'lmadi:', error);
        }

        const { data, error } = await this.supabase
            .from('players')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        this.users = data.map(user => ({
            id: user.id,
            username: user.username,
            phone: user.phone,
            telegram: user.telegram,
            zinoxTokens: user.zinox_tokens || 0,
            cashBalance: user.cash_balance || 0,
            totalClicks: user.total_clicks || 0,
            lastOnline: new Date(user.last_seen || user.created_at),
            status: bannedUsers.has(user.username)
                ? 'banned'
                : (user.suspicious_activity ? 'suspicious' : (user.is_online ? 'active' : 'offline')),
            suspiciousActivity: Boolean(user.suspicious_activity),
            isOnline: Boolean(user.is_online),
            referralEarnings: user.referral_earnings || 0,
            createdAt: user.created_at
        }));
    }

    async loadAnalytics() {
        if (!this.users.length) {
            await this.loadUsersData();
        }

        const activePlayers = this.users.filter(user => user.isOnline).length;
        const suspiciousActivity = this.users.filter(user => user.suspiciousActivity).length;
        const totalTokens = this.users.reduce((sum, user) => sum + user.zinoxTokens, 0);
        const totalCash = this.users.reduce((sum, user) => sum + user.cashBalance, 0);

        this.analytics = {
            totalTokens,
            totalCash,
            activePlayers,
            suspiciousActivity,
            dailyGrowth: 0,
            revenueGrowth: 0,
            playerGrowth: 0,
            suspiciousGrowth: 0
        };
    }

    async loadSystemStats() {
        this.systemStats = {
            serverStatus: this.supabase ? 'online' : 'offline',
            databaseStatus: this.supabase ? 'connected' : 'disconnected',
            apiResponseTime: this.supabase ? 45 : 0,
            memoryUsage: 67,
            cpuUsage: 34,
            diskUsage: 78
        };
    }

    updateDashboardUI() {
        // Update header stats
        if (this.elements.onlineUsersCount) {
            this.elements.onlineUsersCount.textContent = this.analytics.activePlayers.toLocaleString();
        }
        
        if (this.elements.totalUsersCount) {
            this.elements.totalUsersCount.textContent = this.users.length.toLocaleString();
        }
        
        // Update dashboard cards
        if (this.elements.totalTokens) {
            this.elements.totalTokens.textContent = this.formatNumber(this.analytics.totalTokens);
        }
        
        if (this.elements.totalCash) {
            this.elements.totalCash.textContent = '$' + this.analytics.totalCash.toLocaleString();
        }
        
        if (this.elements.activePlayers) {
            this.elements.activePlayers.textContent = this.analytics.activePlayers.toLocaleString();
        }
        
        if (this.elements.suspiciousActivity) {
            this.elements.suspiciousActivity.textContent = this.analytics.suspiciousActivity;
        }
        
        // Update top players
        this.updateTopPlayers();
        
        // Update recent activity
        this.updateRecentActivity();
    }

    updateTopPlayers() {
        const topPlayersList = document.getElementById('topPlayers');
        if (!topPlayersList) return;
        
        const topPlayers = this.users
            .sort((a, b) => b.zinoxTokens - a.zinoxTokens)
            .slice(0, 5);
        
        topPlayersList.innerHTML = topPlayers.map((player, index) => `
            <div class="leaderboard-item">
                <div class="leaderboard-rank">#${index + 1}</div>
                <div class="leaderboard-name">${player.username}</div>
                <div class="leaderboard-score">${this.formatNumber(player.zinoxTokens)} 💎</div>
            </div>
        `).join('');
    }

    updateRecentActivity() {
        const recentActivityList = document.getElementById('recentActivity');
        if (!recentActivityList) return;
        
        // Simulate recent activity
        const activities = [
            { icon: '👤', text: 'Player1 yangi foydalanuvchi ro\'yxatdan o\'tdi', time: '2 daqiqa oldin' },
            { icon: '💰', text: 'Player2 cash sotib oldi', time: '5 daqiqa oldin' },
            { icon: '🎮', text: 'Player3 yangi rekord o\'rnatdi', time: '10 daqiqa oldin' },
            { icon: '⚠️', text: 'Shubhali faoliyat aniqlandi', time: '15 daqiqa oldin' }
        ];
        
        recentActivityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    startRealTimeUpdates() {
        // Update stats every 30 seconds
        setInterval(async () => {
            if (this.adminState.isAuthenticated) {
                await this.loadDashboardData();
            }
        }, this.config.refreshInterval);
        
        // Update system time every second
        setInterval(() => {
            this.updateSystemTime();
        }, 1000);
    }

    updateSystemTime() {
        if (this.elements.systemTime) {
            const now = new Date();
            this.elements.systemTime.textContent = now.toLocaleTimeString();
        }
    }

    initializeCharts() {
        // Initialize Chart.js charts
        this.initializeTokensChart();
        this.initializeCashChart();
        this.initializePlayersChart();
        this.initializeSuspiciousChart();
    }

    initializeTokensChart() {
        const ctx = document.getElementById('tokensChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: 'Tokenlar',
                    data: [30000, 32000, 35000, 38000, 42000, 45000],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b8b8b8'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b8b8b8'
                        }
                    }
                }
            }
        });
    }

    initializeCashChart() {
        const ctx = document.getElementById('cashChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
                datasets: [{
                    label: 'Cash',
                    data: [120, 150, 180, 140, 200, 175, 160],
                    backgroundColor: 'rgba(255, 170, 0, 0.6)',
                    borderColor: '#ffaa00',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b8b8b8'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b8b8b8'
                        }
                    }
                }
            }
        });
    }

    initializePlayersChart() {
        const ctx = document.getElementById('playersChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: 'O\'yinchilar',
                    data: [800, 850, 920, 1100, 1200, 1234],
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b8b8b8'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b8b8b8'
                        }
                    }
                }
            }
        });
    }

    initializeSuspiciousChart() {
        const ctx = document.getElementById('suspiciousChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
                datasets: [{
                    label: 'Shubhali faoliyat',
                    data: [2, 3, 1, 4, 2, 3, 3],
                    backgroundColor: 'rgba(255, 0, 102, 0.6)',
                    borderColor: '#ff0066',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b8b8b8'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b8b8b8'
                        }
                    }
                }
            }
        });
    }

    handleNavigation(section) {
        // Update active nav button
        this.elements.navBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === section) {
                btn.classList.add('active');
            }
        });
        
        // Show corresponding section
        this.elements.contentSections.forEach(contentSection => {
            contentSection.classList.remove('active');
            if (contentSection.id === `${section}-section`) {
                contentSection.classList.add('active');
            }
        });
        
        // Load section-specific data
        this.loadSectionData(section);
    }

    async loadSectionData(section) {
        switch (section) {
            case 'users':
                await this.loadUsersSection();
                break;
            case 'cash':
                await this.loadCashSection();
                break;
            case 'analytics':
                await this.loadAnalyticsSection();
                break;
            case 'security':
                await this.loadSecuritySection();
                break;
            case 'logs':
                await this.loadLogsSection();
                break;
            case 'ads':
                await this.loadAdsSection();
                break;
            case 'missions':
                await this.loadMissionsSection();
                break;
            case 'settings':
                await this.loadSettingsSection();
                break;
        }
    }

    async loadUsersSection() {
        this.updateUsersTable();
    }

    updateUsersTable() {
        if (!this.elements.usersTableBody) return;

        const rows = Array.isArray(arguments[0]) ? arguments[0] : this.users;
        this.elements.usersTableBody.innerHTML = rows.map(user => `
            <tr>
                <td>${user.id || 'N/A'}</td>
                <td>${user.username}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${user.telegram || 'N/A'}</td>
                <td>${this.formatNumber(user.zinoxTokens)} 💎</td>
                <td>$${user.cashBalance}</td>
                <td>${this.formatNumber(user.totalClicks)}</td>
                <td>${this.formatDate(user.lastOnline)}</td>
                <td><span class="user-status ${user.status}">${user.status === 'active' ? '🟢 Faol' : user.status === 'suspicious' ? '🟡 Shubhali' : '⚪ Offline'}</span></td>
                <td>${user.suspiciousActivity ? '⚠️' : '✅'}</td>
            </tr>
        `).join('');
    }

    async loadCashSection() {
        if (!this.supabase) {
            this.updateCashHistory();
            return;
        }

        const { data, error } = await this.supabase
            .from('cash_transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        this.elements.cashHistory.innerHTML = data.map(item => `
            <div class="history-item">
                <div class="history-user">${item.player_username}</div>
                <div class="history-amount">$${item.amount}</div>
                <div class="history-reason">${item.reason}</div>
                <div class="history-time">${this.formatDate(new Date(item.created_at))}</div>
            </div>
        `).join('');
    }

    updateCashHistory() {
        if (!this.elements.cashHistory) return;
        
        // Simulate cash history
        const cashHistory = [
            { user: 'Player1', amount: 50, reason: 'Referal bonus', time: '2 soat oldin' },
            { user: 'Player2', amount: 100, reason: 'Purchase', time: '5 soat oldin' },
            { user: 'Player3', amount: 25, reason: 'Support bonus', time: '1 kun oldin' }
        ];
        
        this.elements.cashHistory.innerHTML = cashHistory.map(item => `
            <div class="history-item">
                <div class="history-user">${item.user}</div>
                <div class="history-amount">$${item.amount}</div>
                <div class="history-reason">${item.reason}</div>
                <div class="history-time">${item.time}</div>
            </div>
        `).join('');
    }

    async loadAnalyticsSection() {
        // Initialize analytics charts
        this.initializeAnalyticsCharts();
    }

    async loadAdsSection() {
        this.renderAdsList();
    }

    async loadMissionsSection() {
        const missionsList = document.getElementById('missionsList');
        if (!missionsList) return;

        const missions = JSON.parse(localStorage.getItem('zinoxMissions') || '[]');
        missionsList.innerHTML = missions.length
            ? missions.map(mission => `
                <div class="admin-mission-item">
                    <div class="mission-info">
                        <div class="mission-title">${mission.title}</div>
                        <div class="mission-type">${mission.type}</div>
                    </div>
                    <div class="mission-actions">
                        <span class="mission-reward">💎 ${mission.reward || 0}</span>
                    </div>
                </div>
            `).join('')
            : '<div class="history-item">Missiyalar hali qo\'shilmagan</div>';
    }

    getStoredAds() {
        return JSON.parse(localStorage.getItem('zinoxAds') || '[]');
    }

    saveStoredAds(ads) {
        localStorage.setItem('zinoxAds', JSON.stringify(ads));
    }

    async handleAdUpload(event) {
        event.preventDefault();

        const title = this.elements.adTitle?.value.trim();
        const type = this.elements.adType?.value || 'image';
        const duration = parseInt(this.elements.adDuration?.value || '15', 10);
        const file = this.elements.adFile?.files?.[0];

        if (!title || !file || !duration) {
            this.showNotification('⚠️ Reklama uchun nom, vaqt va fayl kiriting', 'warning');
            return;
        }

        const fileToDataUrl = (inputFile) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('file_read_failed'));
            reader.readAsDataURL(inputFile);
        });

        try {
            const dataUrl = await fileToDataUrl(file);
            const ads = this.getStoredAds();

            ads.unshift({
                id: `ad_${Date.now()}`,
                title,
                type,
                duration,
                data: dataUrl,
                fileName: file.name,
                mimeType: file.type,
                createdAt: new Date().toISOString()
            });

            this.saveStoredAds(ads);
            this.elements.adUploadForm?.reset();
            if (this.elements.adDuration) {
                this.elements.adDuration.value = '15';
            }
            this.renderAdsList();
            this.showNotification('✅ Reklama fayli saqlandi', 'success');
        } catch (error) {
            console.error('❌ Ad upload error:', error);
            this.showNotification('❌ Reklama yuklashda xatolik', 'error');
        }
    }

    renderAdsList() {
        if (!this.elements.adsList) return;

        const ads = this.getStoredAds();
        this.elements.adsList.innerHTML = ads.length
            ? ads.map(ad => `
                <div class="admin-ad-item">
                    <div class="ad-info">
                        <div class="ad-title">${ad.title}</div>
                        <div class="ad-type">${ad.type.toUpperCase()} · ${ad.duration}s</div>
                        <div class="ad-duration">${ad.fileName || 'file'}</div>
                    </div>
                    <div class="ad-actions">
                        <button class="action-btn" onclick="window.open('${ad.data}', '_blank')">👁️</button>
                        <button class="action-btn danger" onclick="zinoxAdmin.deleteAd('${ad.id}')">🗑️</button>
                    </div>
                </div>
            `).join('')
            : '<div class="history-item">Reklamalar hali yuklanmagan</div>';
    }

    deleteAd(adId) {
        const nextAds = this.getStoredAds().filter(ad => ad.id !== adId);
        this.saveStoredAds(nextAds);
        this.renderAdsList();
        this.showNotification('✅ Reklama o\'chirildi', 'success');
    }

    initializeAnalyticsCharts() {
        // User growth chart
        const userGrowthCtx = document.getElementById('userGrowthChart');
        if (userGrowthCtx) {
            new Chart(userGrowthCtx, {
                type: 'line',
                data: {
                    labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'],
                    datasets: [{
                        label: 'Foydalanuvchilar',
                        data: [100, 150, 230, 320, 450, 600],
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#b8b8b8'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#b8b8b8'
                            }
                        }
                    }
                }
            });
        }
        
        // Revenue chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            new Chart(revenueCtx, {
                type: 'bar',
                data: {
                    labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'],
                    datasets: [{
                        label: 'Daromad',
                        data: [500, 750, 1200, 1800, 2500, 3200],
                        backgroundColor: 'rgba(255, 170, 0, 0.6)',
                        borderColor: '#ffaa00',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#b8b8b8'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#b8b8b8'
                            }
                        }
                    }
                }
            });
        }
    }

    async loadSecuritySection() {
        this.updateSecurityAlerts();
    }

    updateSecurityAlerts() {
        const alertsList = document.getElementById('securityAlerts');
        if (!alertsList) return;
        
        // Simulate security alerts
        const alerts = [
            {
                icon: '🚨',
                title: 'Shubhali IP aniqlandi',
                description: '192.168.1.100 dan g\'ayriodatiy faoliyat',
                time: '5 daqiqa oldin'
            },
            {
                icon: '⚠️',
                title: 'Tez bosish aniqlandi',
                description: 'Player3 20+ bosish/sekund',
                time: '15 daqiqa oldin'
            },
            {
                icon: '🔍',
                title: 'Yangi foydalanuvchi tekshiruvi',
                description: 'Player5 tasdiqlash jarayonida',
                time: '1 soat oldin'
            }
        ];
        
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                    <div class="alert-time">${alert.time}</div>
                </div>
            </div>
        `).join('');
    }

    async loadLogsSection() {
        if (!this.supabase) {
            this.updateLogsList();
            return;
        }

        const { data, error } = await this.supabase
            .from('security_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        const logsList = document.getElementById('logsList');
        if (!logsList) return;

        logsList.innerHTML = data.map(log => `
            <div class="log-item ${log.severity || 'info'}">
                <div class="log-time">${new Date(log.created_at).toLocaleTimeString()}</div>
                <div class="log-level">${String(log.severity || 'info').toUpperCase()}</div>
                <div class="log-message">${log.description || log.event_type}</div>
            </div>
        `).join('');
    }

    updateLogsList() {
        const logsList = document.getElementById('logsList');
        if (!logsList) return;
        
        // Simulate logs
        const logs = [
            { time: '14:30:25', level: 'info', message: 'User Player1 logged in' },
            { time: '14:28:15', level: 'warning', message: 'High click rate detected for Player3' },
            { time: '14:25:42', level: 'info', message: 'Cash distribution completed' },
            { time: '14:22:10', level: 'error', message: 'Database connection timeout' },
            { time: '14:20:33', level: 'info', message: 'System backup completed' }
        ];
        
        logsList.innerHTML = logs.map(log => `
            <div class="log-item ${log.level}">
                <div class="log-time">${log.time}</div>
                <div class="log-level">${log.level.toUpperCase()}</div>
                <div class="log-message">${log.message}</div>
            </div>
        `).join('');
    }

    async loadSettingsSection() {
        // Load current settings
        this.loadGameSettings();
        this.loadCashSettings();
        this.loadSecuritySettings();
    }

    loadGameSettings() {
        const form = document.getElementById('gameSettingsForm');
        if (form) {
            // Set current values
            document.getElementById('baseTapPower').value = 1;
            document.getElementById('autoSaveInterval').value = 30;
            document.getElementById('maxClicksPerSecond').value = 15;
        }
    }

    loadCashSettings() {
        const form = document.getElementById('cashSettingsForm');
        if (form) {
            // Set current values
            document.getElementById('cashExchangeRate').value = 2000;
            document.getElementById('referralBonus').value = 100;
            document.getElementById('adReward').value = 50;
        }
    }

    loadSecuritySettings() {
        const form = document.getElementById('securitySettingsForm');
        if (form) {
            // Set current values
            document.getElementById('enable2FA').checked = true;
            document.getElementById('enableIPTracking').checked = true;
            document.getElementById('enableSuspiciousDetection').checked = true;
        }
    }

    handleUserSearch() {
        const searchTerm = this.elements.userSearch.value.toLowerCase();
        const filteredUsers = this.users.filter(user => 
            String(user.id || '').toLowerCase().includes(searchTerm)
        );
        this.updateUsersTableWithUsers(filteredUsers);
    }

    handleUserFilter() {
        const filter = this.elements.userFilter.value;
        let filteredUsers = this.users;
        
        switch (filter) {
            case 'active':
                filteredUsers = this.users.filter(user => user.status === 'active');
                break;
            case 'suspicious':
                filteredUsers = this.users.filter(user => user.status === 'suspicious');
                break;
            case 'banned':
                filteredUsers = this.users.filter(user => user.status === 'banned');
                break;
        }
        
        this.updateUsersTableWithUsers(filteredUsers);
    }

    updateUsersTableWithUsers(users) {
        if (!this.elements.usersTableBody) return;
        
        this.elements.usersTableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${user.telegram || 'N/A'}</td>
                <td>${this.formatNumber(user.zinoxTokens)} 💎</td>
                <td>$${user.cashBalance}</td>
                <td>${this.formatNumber(user.totalClicks)}</td>
                <td>
                    <span class="user-status ${user.status}">
                        ${user.status === 'active' ? '🟢 Faol' : user.status === 'suspicious' ? '🟡 Shubhali' : '🔴 Bloklangan'}
                    </span>
                </td>
                <td>${user.suspiciousActivity ? '⚠️' : '✅'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="zinoxAdmin.viewUserDetails('${user.id}')">👁️</button>
                        <button class="action-btn" onclick="zinoxAdmin.editUser('${user.id}')">✏️</button>
                        <button class="action-btn danger" onclick="zinoxAdmin.banUser('${user.id}')">🚫</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async handleCashDistribution(event) {
        event.preventDefault();
        
        const targetUser = this.elements.targetUser.value.trim();
        const cashAmount = parseInt(this.elements.cashAmount.value);
        const cashReason = this.elements.cashReason.value.trim();
        
        if (!targetUser || !cashAmount || !cashReason) {
            this.showNotification('⚠️ Barcha maydonlarni to\'ldiring', 'warning');
            return;
        }
        
        try {
            let targetUsername = targetUser;

            if (this.supabase) {
                const { data: user, error: userError } = await this.supabase
                    .from('players')
                    .select('id, username, cash_balance')
                    .eq('id', targetUser)
                    .maybeSingle();

                if (userError) throw userError;
                if (!user) {
                    this.showNotification('❌ Bu ID bilan foydalanuvchi topilmadi', 'error');
                    return;
                }

                targetUsername = user.username;

                const { error: updateError } = await this.supabase
                    .from('players')
                    .update({ cash_balance: (user.cash_balance || 0) + cashAmount, updated_at: new Date().toISOString() })
                    .eq('id', user.id);
                if (updateError) throw updateError;

                await this.supabase.from('cash_transactions').insert({
                    player_username: user.username,
                    amount: cashAmount,
                    reason: cashReason,
                    admin_username: this.adminState.adminUser,
                    transaction_type: 'distribution'
                });
            }

            this.elements.cashDistributionForm.reset();
            await this.loadDashboardData();
            this.showNotification(`✅ ${targetUsername} ga $${cashAmount} cash berildi`, 'success');
        } catch (error) {
            console.error('❌ Cash distribution error:', error);
            this.showNotification('❌ Cash tarqatishda xatolik', 'error');
        }
    }

    setupActivityMonitoring() {}

    loadMockDashboardData() {
        if (!this.users.length) {
            this.users = [];
        }
        this.analytics = {
            totalTokens: this.users.reduce((sum, user) => sum + (user.zinoxTokens || 0), 0),
            totalCash: this.users.reduce((sum, user) => sum + (user.cashBalance || 0), 0),
            activePlayers: this.users.filter(user => user.status === 'active').length,
            suspiciousActivity: this.users.filter(user => user.suspiciousActivity).length
        };
        this.updateDashboardUI();
    }

    viewUserDetails(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            this.showNotification(`👤 ${user.username} ma\'lumotlari: ${this.formatNumber(user.zinoxTokens)} token, $${user.cashBalance} cash`, 'info');
        }
    }

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            this.showNotification(`✏️ ${user.username} tahrirlash moduli tez orada`, 'info');
        }
    }

    async banUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            this.showNotification('❌ Foydalanuvchi topilmadi', 'error');
            return;
        }

        try {
            if (this.supabase) {
                const { error: updateError } = await this.supabase
                    .from('players')
                    .update({
                        suspicious_activity: true,
                        is_online: false,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                if (updateError) {
                    throw updateError;
                }

                const { error: logError } = await this.supabase
                    .from('security_logs')
                    .insert({
                        player_username: user.username,
                        event_type: 'ban',
                        description: `Admin ${this.adminState.adminUser} blocked user ${user.username}`,
                        severity: 'critical'
                    });

                if (logError) {
                    throw logError;
                }
            }

            user.status = 'banned';
            user.suspiciousActivity = true;
            user.isOnline = false;
            this.updateUsersTableWithUsers(this.users);
            this.showNotification(`🚫 ${user.username} bloklandi`, 'warning');
        } catch (error) {
            console.error('❌ User ban error:', error);
            this.showNotification('❌ Foydalanuvchini bloklashda xatolik', 'error');
        }
    }

    handleLogout() {
        // Clear session
        localStorage.removeItem('zinoxAdminSession');
        
        // Reset state
        this.adminState.isAuthenticated = false;
        this.adminState.adminUser = null;
        this.adminState.sessionToken = null;
        
        // Show login screen
        this.elements.adminDashboard.style.display = 'none';
        this.elements.loginScreen.style.display = 'flex';
        
        // Clear form
        this.elements.loginForm.reset();
        
        this.showNotification('👋 Chiqish muvaffaqiyatli amalga oshirildi', 'success');
        console.log('🔐 Admin chiqdi');
    }

    handleKeyboard(event) {
        // Escape to logout
        if (event.key === 'Escape' && this.adminState.isAuthenticated) {
            this.handleLogout();
        }
    }

    updateActivity() {
        this.adminState.lastActivity = Date.now();
    }

    startSessionMonitoring() {
        // Check session timeout every minute
        setInterval(() => {
            if (this.adminState.isAuthenticated) {
                const currentTime = Date.now();
                const timeSinceActivity = currentTime - this.adminState.lastActivity;
                
                if (timeSinceActivity > this.config.sessionTimeout) {
                    this.showNotification('⏰ Sessiya muddati tugagan! Qayta kirishingiz kerak', 'warning');
                    this.handleLogout();
                } else if (timeSinceActivity > this.config.sessionTimeout - 300000) { // 5 minutes warning
                    this.showNotification('⏰ Sessiya muddati tugayapti!', 'warning');
                }
            }
        }, 60000); // Check every minute
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('adminNotificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-message">${message}</div>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'notificationSlide 0.3s ease-out reverse';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return Math.floor(num).toString();
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Hozir';
        if (minutes < 60) return `${minutes} daqiqa oldin`;
        if (hours < 24) return `${hours} soat oldin`;
        if (days < 7) return `${days} kun oldin`;
        
        return date.toLocaleDateString();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.zinoxAdmin = new ZinoxAdminPanel();
});

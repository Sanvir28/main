// Global variables
const GITHUB_USERNAME = 'Sanvir28';
const GITHUB_API_URL = 'https://api.github.com';
let refreshInterval;
let countdownInterval;
let refreshTimer = 30;

// Terminal functionality
class Terminal {
    constructor() {
        this.userInputElement = document.getElementById('user-input');
        this.currentInput = '';
        this.initEventListeners();
    }

    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('terminal-screen').classList.contains('active')) {
                this.handleKeyPress(e);
            }
        });
    }

    handleKeyPress(e) {
        if (e.key === 'Backspace') {
            e.preventDefault();
            this.currentInput = this.currentInput.slice(0, -1);
            this.updateDisplay();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            this.handleCommand();
        } else if (e.key.length === 1) {
            e.preventDefault();
            this.currentInput += e.key;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.userInputElement.textContent = this.currentInput;
    }

    handleCommand() {
        if (this.currentInput.toLowerCase() === 'enter') {
            this.enterSite();
        } else {
            // Wrong command - show error
            this.showError();
        }
    }

    showError() {
        const terminalContent = document.querySelector('.terminal-content');
        const errorLine = document.createElement('div');
        errorLine.className = 'terminal-line';
        errorLine.innerHTML = `
            <span class="prompt">singh@studios:~$</span>
            <span class="command" style="color: #ff4444;">Command not found: ${this.currentInput}</span>
        `;
        terminalContent.insertBefore(errorLine, document.querySelector('.current-line'));
        
        // Clear input
        this.currentInput = '';
        this.updateDisplay();
    }

    enterSite() {
        const terminalScreen = document.getElementById('terminal-screen');
        const mainSite = document.getElementById('main-site');
        
        // Show loading animation
        const terminalContent = document.querySelector('.terminal-content');
        const loadingLine = document.createElement('div');
        loadingLine.className = 'terminal-line';
        loadingLine.innerHTML = `
            <span class="prompt">singh@studios:~$</span>
            <span class="command" style="color: #00ff88;">Entering Singh Studios...</span>
        `;
        terminalContent.insertBefore(loadingLine, document.querySelector('.current-line'));

        setTimeout(() => {
            terminalScreen.classList.remove('active');
            mainSite.classList.add('active');
            
            // Initialize the main application
            app.init();
        }, 1500);
    }
}

// GitHub API integration
class GitHubAPI {
    constructor(username) {
        this.username = username;
        this.cache = {
            repositories: null,
            user: null,
            lastFetch: null
        };
    }

    async fetchWithCache(url, cacheKey, maxAge = 30000) {
        const now = Date.now();
        
        if (this.cache[cacheKey] && this.cache.lastFetch && (now - this.cache.lastFetch) < maxAge) {
            return this.cache[cacheKey];
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            this.cache[cacheKey] = data;
            this.cache.lastFetch = now;
            
            return data;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            
            // Return cached data if available, otherwise return fallback
            if (this.cache[cacheKey]) {
                return this.cache[cacheKey];
            }
            
            return this.getFallbackData(cacheKey);
        }
    }

    getFallbackData(cacheKey) {
        const fallbacks = {
            user: {
                public_repos: 0,
                followers: 0,
                following: 0,
                bio: 'GitHub profile not available',
                name: 'Singh Studios'
            },
            repositories: []
        };
        
        return fallbacks[cacheKey] || null;
    }

    async getUserData() {
        const url = `${GITHUB_API_URL}/users/${this.username}`;
        return await this.fetchWithCache(url, 'user');
    }

    async getRepositories() {
        const url = `${GITHUB_API_URL}/users/${this.username}/repos?sort=updated&per_page=100`;
        return await this.fetchWithCache(url, 'repositories');
    }

    async getRepositoryViews(repoName) {
        try {
            const url = `${GITHUB_API_URL}/repos/${this.username}/${repoName}/traffic/views`;
            const response = await fetch(url);
            
            if (response.status === 403) {
                // This endpoint requires authentication - return placeholder
                return { count: 0, uniques: 0 };
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn(`Could not fetch views for ${repoName}:`, error);
            return { count: 0, uniques: 0 };
        }
    }

    async getLanguageStats(repositories) {
        const languageMap = {};
        let totalSize = 0;

        for (const repo of repositories) {
            if (repo.language) {
                if (!languageMap[repo.language]) {
                    languageMap[repo.language] = 0;
                }
                languageMap[repo.language] += repo.size || 1;
                totalSize += repo.size || 1;
            }
        }

        // Convert to percentage and sort
        const languageStats = Object.entries(languageMap)
            .map(([language, size]) => ({
                language,
                percentage: totalSize > 0 ? ((size / totalSize) * 100).toFixed(1) : 0
            }))
            .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
            .slice(0, 5); // Top 5 languages

        return languageStats;
    }
}

// Main application class
class App {
    constructor() {
        this.github = new GitHubAPI(GITHUB_USERNAME);
        this.lastUpdateTime = null;
        this.totalViews = 0;
        
        // Initialize navigation
        this.initNavigation();
    }

    initNavigation() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    async init() {
        try {
            // Load initial data
            await this.loadGitHubData();
            
            // Start auto-refresh
            this.startAutoRefresh();
            
            console.log('Singh Studios portfolio initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showErrorState();
        }
    }

    async loadGitHubData() {
        try {
            // Show loading states
            this.showLoadingStates();
            
            // Fetch user data and repositories simultaneously
            const [userData, repositories] = await Promise.all([
                this.github.getUserData(),
                this.github.getRepositories()
            ]);

            // Update UI with user data
            this.updateUserStats(userData);
            
            // Update repositories
            await this.updateRepositories(repositories);
            
            // Update language statistics
            const languageStats = await this.github.getLanguageStats(repositories);
            this.updateLanguageStats(languageStats);
            
            // Update last refresh time
            this.lastUpdateTime = new Date();
            this.updateLastRefreshTime();
            
        } catch (error) {
            console.error('Error loading GitHub data:', error);
            this.showErrorState();
        }
    }

    showLoadingStates() {
        // Show loading in stats
        document.getElementById('repo-count').textContent = '...';
        document.getElementById('total-views').textContent = '...';
        document.getElementById('followers-count').textContent = '...';
        document.getElementById('following-count').textContent = '...';
        document.getElementById('public-repos-count').textContent = '...';
    }

    updateUserStats(userData) {
        // Update basic stats
        document.getElementById('repo-count').textContent = userData.public_repos || 0;
        document.getElementById('followers-count').textContent = userData.followers || 0;
        document.getElementById('following-count').textContent = userData.following || 0;
        document.getElementById('public-repos-count').textContent = userData.public_repos || 0;
    }

    async updateRepositories(repositories) {
        const grid = document.getElementById('repositories-grid');
        
        if (!repositories || repositories.length === 0) {
            grid.innerHTML = `
                <div class="loading-card">
                    <p>No public repositories found for ${GITHUB_USERNAME}</p>
                </div>
            `;
            return;
        }

        // Sort repositories by updated date (most recent first)
        repositories.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        let totalViews = 0;
        
        // Create repository cards
        const repoCards = await Promise.all(
            repositories.map(async (repo) => {
                const views = await this.github.getRepositoryViews(repo.name);
                totalViews += views.count || 0;
                
                return this.createRepositoryCard(repo, views);
            })
        );

        // Update total views
        document.getElementById('total-views').textContent = totalViews;
        this.totalViews = totalViews;

        // Update the grid
        grid.innerHTML = repoCards.join('');
    }

    createRepositoryCard(repo, viewsData) {
        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        const truncateDescription = (description, maxLength = 100) => {
            if (!description) return 'No description available';
            return description.length > maxLength 
                ? description.substring(0, maxLength) + '...'
                : description;
        };

        return `
            <div class="repo-card">
                <a href="${repo.html_url}" target="_blank" class="repo-name">
                    ${repo.name}
                </a>
                <p class="repo-description">
                    ${truncateDescription(repo.description)}
                </p>
                <div class="repo-stats">
                    <div class="repo-stat">
                        <span>⭐</span>
                        <span>${repo.stargazers_count || 0}</span>
                    </div>
                    <div class="repo-stat">
                        <span>🍴</span>
                        <span>${repo.forks_count || 0}</span>
                    </div>
                    <div class="repo-stat">
                        <span>👁️</span>
                        <span>${viewsData.count || 0}</span>
                    </div>
                    <div class="repo-stat">
                        <span>📅</span>
                        <span>${formatDate(repo.updated_at)}</span>
                    </div>
                </div>
                ${repo.language ? `<span class="repo-language">${repo.language}</span>` : ''}
            </div>
        `;
    }

    updateLanguageStats(languageStats) {
        const container = document.getElementById('language-stats');
        
        if (!languageStats || languageStats.length === 0) {
            container.innerHTML = '<div class="loading-text">No language data available</div>';
            return;
        }

        const languageItems = languageStats.map(({ language, percentage }) => `
            <div class="language-item">
                <span class="language-name">${language}</span>
                <span class="language-percentage">${percentage}%</span>
            </div>
        `).join('');

        container.innerHTML = languageItems;
    }

    startAutoRefresh() {
        // Update countdown every second
        countdownInterval = setInterval(() => {
            refreshTimer--;
            document.getElementById('refresh-countdown').textContent = refreshTimer;
            
            if (refreshTimer <= 0) {
                refreshTimer = 30; // Reset timer
                this.loadGitHubData(); // Refresh data
            }
        }, 1000);

        // Also set up the main refresh interval as backup
        refreshInterval = setInterval(() => {
            this.loadGitHubData();
        }, 30000);
    }

    updateLastRefreshTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('last-updated').textContent = `Last updated: ${timeString}`;
    }

    showErrorState() {
        const grid = document.getElementById('repositories-grid');
        grid.innerHTML = `
            <div class="loading-card">
                <p style="color: #ff4444;">Error loading repository data</p>
                <p>Please check your internet connection or try again later.</p>
            </div>
        `;

        // Set error values for stats
        document.getElementById('repo-count').textContent = 'Error';
        document.getElementById('total-views').textContent = 'Error';
        document.getElementById('followers-count').textContent = 'Error';
        document.getElementById('following-count').textContent = 'Error';
        document.getElementById('public-repos-count').textContent = 'Error';
    }

    destroy() {
        // Clean up intervals when needed
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize terminal
    const terminal = new Terminal();
    
    // Initialize main app (but don't start it until terminal is completed)
    window.app = new App();
    
    // Add some dynamic effects
    addDynamicEffects();
});

// Dynamic visual effects
function addDynamicEffects() {
    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.home-section');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });

    // Add interactive cursor trail effect
    let mouseTrail = [];
    document.addEventListener('mousemove', (e) => {
        mouseTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
        
        // Limit trail length
        if (mouseTrail.length > 20) {
            mouseTrail.shift();
        }
    });

    // Typing indicator for terminal
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        setInterval(() => {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }, 500);
    }
}

// Handle page visibility changes to pause/resume auto-refresh
document.addEventListener('visibilitychange', () => {
    if (window.app) {
        if (document.hidden) {
            // Page is hidden, pause auto-refresh
            if (refreshInterval) clearInterval(refreshInterval);
            if (countdownInterval) clearInterval(countdownInterval);
        } else {
            // Page is visible, resume auto-refresh
            if (window.app && document.getElementById('main-site').classList.contains('active')) {
                window.app.startAutoRefresh();
            }
        }
    }
});

// Error handling for uncaught errors
window.addEventListener('error', (e) => {
    console.error('Uncaught error:', e.error);
});

// Handle network status
window.addEventListener('online', () => {
    console.log('Network connection restored');
    if (window.app && document.getElementById('main-site').classList.contains('active')) {
        window.app.loadGitHubData();
    }
});

window.addEventListener('offline', () => {
    console.log('Network connection lost');
});

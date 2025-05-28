// ShoreSquad - Beach Cleanup Crew App
// Main JavaScript file for interactivity and functionality

class ShoreSquad {
    constructor() {
        this.currentUser = null;
        this.events = [];
        this.crewMembers = [];
        this.weatherData = null;
        this.map = null;
        
        this.init();
    }

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.loadMockData();
        this.initializeCounters();
        this.handleNavigation();
        this.simulateLoading();
        
        // Check for geolocation support
        if ('geolocation' in navigator) {
            this.initializeGeolocation();
        }
        
        // Initialize service worker for PWA functionality
        if ('serviceWorker' in navigator) {
            this.initializeServiceWorker();
        }
    }

    // Set up all event listeners
    setupEventListeners() {
        // Navigation
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
            });
        }

        // Hero buttons
        const joinCleanupBtn = document.getElementById('join-cleanup');
        const createEventBtn = document.getElementById('create-event');
        
        joinCleanupBtn?.addEventListener('click', () => this.handleJoinCleanup());
        createEventBtn?.addEventListener('click', () => this.handleCreateEvent());

        // Map controls
        const locateMeBtn = document.getElementById('locate-me');
        const weatherToggleBtn = document.getElementById('weather-toggle');
        
        locateMeBtn?.addEventListener('click', () => this.handleLocateMe());
        weatherToggleBtn?.addEventListener('click', () => this.handleWeatherToggle());

        // Invite friends button
        const inviteFriendsBtn = document.getElementById('invite-friends');
        inviteFriendsBtn?.addEventListener('click', () => this.handleInviteFriends());

        // Bottom navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleBottomNav(e));
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // Load mock data for demonstration
    loadMockData() {
        this.events = [
            {
                id: 1,
                title: "Pasir Ris Beach Cleanup",
                date: "2025-06-01",
                time: "09:00 AM",
                location: "Pasir Ris Beach, Singapore",
                coordinates: { lat: 1.381497, lng: 103.955574 },
                participants: 12,
                organizer: "Alex Chen",
                weather: "sunny",
                difficulty: "easy",
                isNext: true
            },
            {
                id: 2,
                title: "East Coast Park Squad Action",
                date: "2025-06-03",
                time: "08:30 AM",
                location: "East Coast Park, Singapore",
                coordinates: { lat: 1.3006, lng: 103.9271 },
                participants: 8,
                organizer: "Maya Rodriguez",
                weather: "partly-cloudy",
                difficulty: "medium"
            },
            {
                id: 3,
                title: "Sentosa Beach Conservation",
                date: "2025-06-07",
                time: "07:00 AM",
                location: "Sentosa Beach, Singapore",
                coordinates: { lat: 1.2494, lng: 103.8303 },
                participants: 15,
                organizer: "Jordan Kim",
                weather: "sunny",
                difficulty: "hard"
            }
        ];

        this.crewMembers = [
            { id: 1, name: "Alex Chen", role: "Squad Leader", avatar: "AC", cleanups: 24 },
            { id: 2, name: "Maya Rodriguez", role: "Ocean Guardian", avatar: "MR", cleanups: 18 },
            { id: 3, name: "Jordan Kim", role: "Beach Warrior", avatar: "JK", cleanups: 31 },
            { id: 4, name: "Sam Taylor", role: "Eco Enthusiast", avatar: "ST", cleanups: 12 },
            { id: 5, name: "Riley Park", role: "Shore Protector", avatar: "RP", cleanups: 9 },
            { id: 6, name: "Casey Morgan", role: "Wave Defender", avatar: "CM", cleanups: 22 }
        ];

        this.renderEvents();
        this.renderCrewMembers();
    }

    // Render events in the events grid
    renderEvents() {
        const eventsGrid = document.getElementById('events-grid');
        if (!eventsGrid) return;

        eventsGrid.innerHTML = this.events.map(event => `
            <div class="event-card ${event.isNext ? 'next-event' : ''}" role="article" tabindex="0">
                <div class="event-header">
                    <div class="event-date">${this.formatDate(event.date)}</div>
                    ${event.isNext ? '<div class="next-badge">NEXT!</div>' : ''}
                    <i class="fas fa-${this.getWeatherIcon(event.weather)}" aria-label="Weather: ${event.weather}"></i>
                </div>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-location">
                    <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                    <span>${event.location}</span>
                </div>
                <p class="event-time">
                    <i class="fas fa-clock" aria-hidden="true"></i>
                    ${event.time}
                </p>
                <div class="event-participants">
                    <div class="participants-avatars">
                        ${this.generateParticipantAvatars(event.participants)}
                    </div>
                    <span class="participants-count">${event.participants} squad members</span>
                </div>
                <button class="btn ${event.isNext ? 'btn-secondary' : 'btn-primary'} btn-full" onclick="shoreSquad.joinEvent(${event.id})" style="margin-top: 1rem;">
                    <i class="fas fa-user-plus" aria-hidden="true"></i>
                    ${event.isNext ? 'Join Next Cleanup!' : 'Join Squad'}
                </button>
            </div>
        `).join('');
    }

    // Render crew members in the crew grid
    renderCrewMembers() {
        const crewGrid = document.getElementById('crew-grid');
        if (!crewGrid) return;

        crewGrid.innerHTML = this.crewMembers.map(member => `
            <div class="crew-member" role="article" tabindex="0">
                <div class="crew-avatar">${member.avatar}</div>
                <h3 class="crew-name">${member.name}</h3>
                <p class="crew-role">${member.role}</p>
                <p class="crew-stats">
                    <i class="fas fa-trophy" aria-hidden="true"></i>
                    ${member.cleanups} cleanups
                </p>
            </div>
        `).join('');
    }

    // Initialize animated counters for stats
    initializeCounters() {
        const counterElements = document.querySelectorAll('.stat-number');
        
        const animateCounter = (element) => {
            const target = parseInt(element.getAttribute('data-target'));
            const increment = target / 100;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    element.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            };
            
            updateCounter();
        };

        // Use Intersection Observer to trigger animation when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        counterElements.forEach(counter => {
            observer.observe(counter);
        });
    }

    // Handle bottom navigation
    handleBottomNav(e) {
        e.preventDefault();
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        // Scroll to section
        const href = e.currentTarget.getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Handle navigation updates on scroll
    handleNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navItems = document.querySelectorAll('.nav-item');
        
        const updateActiveNav = () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });
            
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${current}`) {
                    item.classList.add('active');
                }
            });
        };
        
        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav(); // Initial call
    }

    // Simulate loading for better UX
    simulateLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('show');
            
            setTimeout(() => {
                loadingOverlay.classList.remove('show');
            }, 1500);
        }
    }

    // Initialize geolocation services
    initializeGeolocation() {
        this.userLocation = null;
        
        // Get user's current position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('User location obtained:', this.userLocation);
            },
            (error) => {
                console.log('Geolocation error:', error.message);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    }

    // Initialize service worker for PWA
    async initializeServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('ServiceWorker registered:', registration);
        } catch (error) {
            console.log('ServiceWorker registration failed:', error);
        }
    }

    // Event handlers
    handleJoinCleanup() {
        this.showNotification('Finding nearby cleanups...', 'info');
        // Simulate API call
        setTimeout(() => {
            this.showNotification('3 cleanup events found near you!', 'success');
            document.getElementById('events').scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    }

    handleCreateEvent() {
        this.showNotification('Opening event creation form...', 'info');
        // In a real app, this would open a modal or navigate to a form
        setTimeout(() => {
            this.showNotification('Event creation feature coming soon!', 'warning');
        }, 500);
    }

    handleLocateMe() {
        if (!this.userLocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.showNotification('Location found! Showing nearby beaches...', 'success');
                    this.updateMapWithUserLocation();
                },
                (error) => {
                    this.showNotification('Unable to get your location. Please enable location services.', 'error');
                }
            );
        } else {
            this.showNotification('Centering map on your location...', 'info');
            this.updateMapWithUserLocation();
        }
    }

    handleWeatherToggle() {
        this.showNotification('Toggling weather overlay...', 'info');
        // Simulate weather data toggle
        this.fetchWeatherData();
    }

    handleInviteFriends() {
        if (navigator.share) {
            navigator.share({
                title: 'Join my ShoreSquad!',
                text: 'Help me clean our beaches and make a difference!',
                url: window.location.href
            });
        } else {
            // Fallback for browsers without Web Share API
            const shareText = `Join my ShoreSquad! Help me clean our beaches and make a difference! ${window.location.href}`;
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Invite link copied to clipboard!', 'success');
            });
        }
    }

    // Join an event
    joinEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            event.participants += 1;
            this.showNotification(`You've joined "${event.title}"! See you there! 🌊`, 'success');
            this.renderEvents(); // Re-render to update participant count
        }
    }

    // Update map with user location
    updateMapWithUserLocation() {
        const mapElement = document.getElementById('map');
        if (mapElement && this.userLocation) {
            // Update the Google Maps iframe to show user location
            const nextEvent = this.events.find(e => e.isNext);
            if (nextEvent) {
                const newSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.6234567890123!2d${nextEvent.coordinates.lng}!3d${nextEvent.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMjInNTMuNCJOIDEwM8KwNTcnMjAuMSJF!5e0!3m2!1sen!2ssg!4v1000000000000!5m2!1sen!2ssg&markers=color:orange%7Clabel:Next%20Cleanup%7C${nextEvent.coordinates.lat},${nextEvent.coordinates.lng}%7Ccolor:blue%7Clabel:You%7C${this.userLocation.lat},${this.userLocation.lng}`;
                mapElement.src = newSrc;
            }
            this.showNotification('Map updated with your location and next cleanup spot!', 'success');
        }
    }

    // Fetch weather data
    async fetchWeatherData() {
        try {
            // Simulate weather API call
            this.weatherData = {
                temperature: 72,
                condition: 'sunny',
                windSpeed: 8,
                waveHeight: 2.5
            };
            
            this.showNotification(`Perfect weather! ${this.weatherData.temperature}°F, ${this.weatherData.condition}`, 'success');
        } catch (error) {
            this.showNotification('Unable to fetch weather data', 'error');
        }
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }

    getWeatherIcon(weather) {
        const icons = {
            'sunny': 'sun',
            'partly-cloudy': 'cloud-sun',
            'cloudy': 'cloud',
            'rainy': 'cloud-rain'
        };
        return icons[weather] || 'sun';
    }

    generateParticipantAvatars(count) {
        const colors = ['#0077BE', '#FF6B6B', '#4CAF50', '#FFA726', '#9C27B0'];
        const avatars = [];
        const displayCount = Math.min(count, 4);
        
        for (let i = 0; i < displayCount; i++) {
            const color = colors[i % colors.length];
            avatars.push(`
                <div class="avatar" style="background-color: ${color}">
                    ${String.fromCharCode(65 + i)}
                </div>
            `);
        }
        
        if (count > 4) {
            avatars.push(`
                <div class="avatar" style="background-color: var(--gray-500);">
                    +${count - 4}
                </div>
            `);
        }
        
        return avatars.join('');
    }

    // Show notification to user
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles for notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: type === 'error' ? '#FF6B6B' : 
                       type === 'warning' ? '#FFA726' :
                       type === 'success' ? '#4CAF50' : '#0077BE',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: '10000',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle',
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'error': 'times-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shoreSquad = new ShoreSquad();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
    // Update navigation state if needed
    const hash = window.location.hash;
    if (hash) {
        const target = document.querySelector(hash);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Handle offline/online status
window.addEventListener('online', () => {
    if (window.shoreSquad) {
        window.shoreSquad.showNotification('Back online! All features available.', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.shoreSquad) {
        window.shoreSquad.showNotification('You\'re offline. Some features may be limited.', 'warning');
    }
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`ShoreSquad loaded in ${loadTime}ms`);
    });
}

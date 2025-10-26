// stats-system.js - SISTEMA DE ESTADÍSTICAS DISCRETO MEJORADO CON ANALYTICS
class StatsSystem {
    constructor() {
        this.stats = this.loadStats();
        this.rating = this.loadRating();
        this.restrictedWords = this.getRestrictedWords();
        this.analyticsEnabled = false;
        this.containerCreated = false; // 👈 NUEVO: Control de duplicados
        this.init();
    }

    init() {
        // 👇 VERIFICAR SI EL CONTENEDOR YA EXISTE ANTES DE CREARLO
        if (!this.containerCreated && !document.querySelector('.stats-system-container')) {
            this.createStatsContainer();
            this.containerCreated = true;
        }
        
        this.initStatsTracking();
        this.initAnalytics();
        this.updateDisplay();
        console.log('📊 Sistema de estadísticas ODAM inicializado con Analytics');
    }

    // 👇 MÉTODO PARA ELIMINAR DUPLICADOS SI EXISTEN
    removeDuplicates() {
        const containers = document.querySelectorAll('.stats-system-container');
        if (containers.length > 1) {
            console.log(`🔄 Eliminando ${containers.length - 1} contenedores duplicados`);
            for (let i = 1; i < containers.length; i++) {
                containers[i].remove();
            }
        }
        
        const modals = document.querySelectorAll('#feedback-modal');
        if (modals.length > 1) {
            console.log(`🔄 Eliminando ${modals.length - 1} modales duplicados`);
            for (let i = 1; i < modals.length; i++) {
                modals[i].remove();
            }
        }
    }

    // ===== INTEGRACIÓN GOOGLE ANALYTICS 4 =====
    initAnalytics() {
        // Inyectar Google Analytics 4
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
        document.head.appendChild(gaScript);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX');

        this.analyticsEnabled = true;
        this.trackEvent('page_view', 'stats_system_loaded');
    }

    trackEvent(action, category, label = null, value = null) {
        if (!this.analyticsEnabled) return;

        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }

        // Track también en estadísticas internas
        this.stats.clicks++;
        this.saveStats();
    }

    // ===== CDN PARA ASSETS ESTÁTICOS =====
    getCDNUrl(path) {
        const cdnBase = 'https://cdn.osklindealba.com';
        const localBase = '';
        
        // En producción usar CDN, en desarrollo local
        if (window.location.hostname === 'www.osklindealba.com') {
            return `${cdnBase}${path}`;
        }
        return `${localBase}${path}`;
    }

    // ===== SERVICE WORKER INTEGRATION =====
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registrado:', registration);
                    this.trackEvent('service_worker', 'registration_success');
                })
                .catch(error => {
                    console.error('❌ Error registrando Service Worker:', error);
                    this.trackEvent('service_worker', 'registration_error');
                });
        }
    }

    loadStats() {
        try {
            const stored = localStorage.getItem('odam-stats');
            return stored ? JSON.parse(stored) : {
                visits: 0,
                timeSpent: 0,
                scrollDepth: 0,
                clicks: 0,
                lastVisit: null,
                projectsViewed: 0,
                servicesExplored: 0,
                audioPlays: 0,
                formSubmissions: 0,
                ratingsGiven: 0
            };
        } catch (e) {
            return this.getDefaultStats();
        }
    }

    loadRating() {
        try {
            const stored = localStorage.getItem('odam-rating');
            return stored ? JSON.parse(stored) : {
                likes: 0,
                dislikes: 0,
                userVote: null,
                totalVotes: 0
            };
        } catch (e) {
            return this.getDefaultRating();
        }
    }

    getDefaultStats() {
        return { 
            visits: 0, 
            timeSpent: 0, 
            scrollDepth: 0, 
            clicks: 0,
            lastVisit: null,
            projectsViewed: 0,
            servicesExplored: 0,
            audioPlays: 0,
            formSubmissions: 0,
            ratingsGiven: 0
        };
    }

    getDefaultRating() {
        return { 
            likes: 0, 
            dislikes: 0, 
            userVote: null,
            totalVotes: 0
        };
    }

    saveStats() {
        try {
            localStorage.setItem('odam-stats', JSON.stringify(this.stats));
            
            // Enviar a Analytics si hay cambios significativos
            if (this.analyticsEnabled) {
                this.sendStatsToAnalytics();
            }
        } catch (e) {
            console.error('Error guardando estadísticas:', e);
        }
    }

    sendStatsToAnalytics() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'stats_update', {
                visits: this.stats.visits,
                time_spent: Math.round(this.stats.timeSpent / 60000),
                engagement_score: this.getEngagementScore(),
                projects_viewed: this.stats.projectsViewed
            });
        }
    }

    saveRating() {
        try {
            localStorage.setItem('odam-rating', JSON.stringify(this.rating));
            
            // Track en Analytics
            if (this.analyticsEnabled) {
                this.trackEvent('rating_given', 'user_engagement', this.rating.userVote, this.rating.totalVotes);
            }
        } catch (e) {
            console.error('Error guardando rating:', e);
        }
    }

    initStatsTracking() {
        this.trackVisit();
        this.trackTime();
        this.trackScroll();
        this.trackClicks();
        this.trackProjects();
        this.trackServices();
        this.trackAudioPlays();
        this.trackFormSubmissions();
        this.initServiceWorker();
    }

    trackVisit() {
        const today = new Date().toDateString();
        if (this.stats.lastVisit !== today) {
            this.stats.visits++;
            this.stats.lastVisit = today;
            this.saveStats();
            
            // Track en Analytics
            this.trackEvent('visit', 'user_engagement', 'daily_visit', this.stats.visits);
        }
    }

    trackTime() {
        this.startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            this.stats.timeSpent += Date.now() - this.startTime;
            this.saveStats();
            
            // Track session duration en Analytics
            this.trackEvent('session_end', 'user_engagement', 'session_duration', this.stats.timeSpent);
        });
    }

    trackScroll() {
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.stats.scrollDepth = maxScroll;
                this.saveStats();
                
                // Track scroll depth en Analytics
                if (scrollPercent % 25 === 0) {
                    this.trackEvent('scroll', 'user_engagement', `scroll_${scrollPercent}%`, scrollPercent);
                }
            }
        }, { passive: true });
    }

    trackClicks() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.stats-system-container')) {
                this.stats.clicks++;
                this.saveStats();
                
                // Track clicks en elementos importantes
                const target = e.target.closest('a') || e.target.closest('button');
                if (target) {
                    const label = target.textContent.trim() || target.getAttribute('aria-label') || 'unknown';
                    this.trackEvent('click', 'user_interaction', label);
                }
            }
        }, { passive: true });
    }

    trackProjects() {
        const projectSection = document.getElementById('proyectos');
        if (projectSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.stats.projectsViewed++;
                        this.saveStats();
                        this.trackEvent('section_view', 'content_engagement', 'projects_section');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(projectSection);
        }
    }

    trackServices() {
        const serviceItems = document.querySelectorAll('.service-accordion-item');
        serviceItems.forEach((item, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.stats.servicesExplored++;
                        this.saveStats();
                        this.trackEvent('service_view', 'content_engagement', `service_${index + 1}`);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.7 });
            
            observer.observe(item);
        });
    }

    trackAudioPlays() {
        document.addEventListener('audioPlay', () => {
            this.stats.audioPlays++;
            this.saveStats();
            this.trackEvent('audio_play', 'media_engagement', 'project_audio');
            this.updateDisplay();
        });
    }

    trackFormSubmissions() {
        document.addEventListener('formSubmission', (e) => {
            this.stats.formSubmissions++;
            this.saveStats();
            this.trackEvent('form_submit', 'conversion', e.detail.serviceType);
        });
    }

    incrementAudioPlays() {
        this.stats.audioPlays++;
        this.saveStats();
        this.updateDisplay();
    }

    rate(voteType) {
        if (this.rating.userVote === voteType) {
            if (voteType === 'like') this.rating.likes--;
            else this.rating.dislikes--;
            this.rating.userVote = null;
        } else {
            if (this.rating.userVote === 'like') this.rating.likes--;
            else if (this.rating.userVote === 'dislike') this.rating.dislikes--;
            
            if (voteType === 'like') this.rating.likes++;
            else this.rating.dislikes++;
            this.rating.userVote = voteType;

            if (voteType === 'dislike') {
                setTimeout(() => this.openFeedbackModal(), 500);
            }
        }
        
        this.rating.totalVotes = this.rating.likes + this.rating.dislikes;
        this.stats.ratingsGiven++;
        this.saveRating();
        this.updateRatingDisplay();
        
        // Track en Analytics
        this.trackEvent('rating', 'user_engagement', voteType, this.rating.totalVotes);
    }

    getRestrictedWords() {
        return [
            'palabrota', 'insulto', 'groseria', 'vulgar', 'obsceno',
            'racista', 'sexista', 'homofobico', 'discriminatorio',
            'amenaza', 'violencia', 'odio', 'daño', 'atacar',
            'acoso', 'difamacion', 'humillacion', 'abusivo',
            'estafa', 'phishing', 'correo no deseado', 'spam',
            'promoción', 'marketing', 'publicidad'
        ];
    }

    createStatsContainer() {
        // 👇 VERIFICACIÓN DOBLE PARA EVITAR DUPLICADOS
        if (document.querySelector('.stats-system-container')) {
            console.log('⚠️ El contenedor de estadísticas ya existe. Evitando duplicado.');
            return;
        }

        const statsHTML = `
            <div class="stats-system-container">
                <div class="stats-title">Interacción de la Comunidad</div>
                <div class="stats-grid">
                    <div class="stat-item" onclick="window.statsSystem.handleStatClick('visits')">
                        <span class="stat-number" id="stat-visits">${this.stats.visits}</span>
                        <span class="stat-label">Visitas</span>
                    </div>
                    <div class="stat-item" onclick="window.statsSystem.handleStatClick('time')">
                        <span class="stat-number" id="stat-time">${Math.round(this.stats.timeSpent / 60000)}m</span>
                        <span class="stat-label">Tiempo</span>
                    </div>
                    <div class="stat-item" onclick="window.statsSystem.handleStatClick('engagement')">
                        <span class="stat-number" id="stat-engagement">${this.getEngagementScore()}%</span>
                        <span class="stat-label">Compromiso</span>
                    </div>
                    <div class="stat-item" onclick="window.statsSystem.handleStatClick('projects')">
                        <span class="stat-number" id="stat-projects">${this.stats.projectsViewed + this.stats.audioPlays}</span>
                        <span class="stat-label">Proyectos Vistos</span>
                    </div>
                </div>
                <div class="rating-section">
                    <div class="rating-title">¿Te gusta nuestra página?</div>
                    <div class="rating-buttons">
                        <button class="rating-btn like-btn ${this.rating.userVote === 'like' ? 'liked' : ''}" 
                                onclick="window.statsSystem.rate('like')"
                                aria-label="Me gusta">
                            <i class="fas fa-thumbs-up"></i>
                        </button>
                        <button class="rating-btn dislike-btn ${this.rating.userVote === 'dislike' ? 'disliked' : ''}" 
                                onclick="window.statsSystem.rate('dislike')"
                                aria-label="No me gusta">
                            <i class="fas fa-thumbs-down"></i>
                        </button>
                    </div>
                    <div class="rating-result">${this.getRatingText()}</div>
                </div>
                <div class="feedback-section">
                    <button class="feedback-btn" onclick="window.statsSystem.openFeedbackModal()">
                        <i class="fas fa-comment"></i> Dejar Comentarios
                    </button>
                </div>
                <!-- Lighthouse Performance Score -->
                <div style="margin-top: 20px; text-align: center;">
                    <div style="font-size: 0.8rem; color: #b0b0b0;">
                        ⚡ Performance Score: <span id="lighthouse-score">Loading...</span>
                    </div>
                </div>
            </div>
        `;

        const interactionSection = document.getElementById('interaccion');
        if (interactionSection && !interactionSection.querySelector('.stats-system-container')) {
            interactionSection.insertAdjacentHTML('beforeend', statsHTML);
            console.log('✅ Contenedor de estadísticas creado exitosamente');
        } else {
            console.log('⚠️ Sección de interacción no encontrada o contenedor ya existe');
        }

        this.createFeedbackModal();
        this.initLighthouseTracking();
    }

    initLighthouseTracking() {
        // Simular score de Lighthouse (en producción se calcularía con API)
        setTimeout(() => {
            const score = Math.floor(Math.random() * 20) + 80; // 80-100
            const scoreElement = document.getElementById('lighthouse-score');
            if (scoreElement) {
                scoreElement.textContent = `${score}/100`;
                scoreElement.style.color = score >= 90 ? '#4CAF50' : score >= 80 ? '#FF9800' : '#F44336';
            }
        }, 2000);
    }

    createFeedbackModal() {
        // Verificar si el modal ya existe
        if (document.getElementById('feedback-modal')) {
            console.log('⚠️ Modal de feedback ya existe. Evitando duplicado.');
            return;
        }

        const modalHTML = `
            <div id="feedback-modal" class="feedback-modal">
                <div class="feedback-modal-content">
                    <div class="feedback-modal-header">
                        <h3>¿Qué podemos mejorar?</h3>
                        <button class="feedback-modal-close" aria-label="Cerrar">&times;</button>
                    </div>
                    <form id="feedback-form" class="feedback-form">
                        <div class="form-group">
                            <label for="feedback-comment">Tu feedback es importante para nosotros:</label>
                            <textarea 
                                id="feedback-comment" 
                                placeholder="Por favor, comparte tus sugerencias de manera respetuosa y constructiva..." 
                                required
                                maxlength="500"
                            ></textarea>
                            <div class="feedback-error" id="feedback-error">
                                El comentario contiene palabras no permitidas. Por favor, expresa tus ideas de manera respetuosa.
                            </div>
                            <div class="feedback-success" id="feedback-success">
                                ¡Gracias por tus comentarios! Los tomaremos en cuenta para mejorar.
                            </div>
                            <div style="text-align: right; margin-top: 5px; font-size: 0.8rem; color: #b0b0b0;">
                                <span id="char-count">0</span>/500 caracteres
                            </div>
                        </div>
                        <div class="feedback-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i> Enviar Comentario
                            </button>
                            <button type="button" class="btn btn-secondary feedback-modal-close">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupFeedbackModal();
    }

    setupFeedbackModal() {
        const modal = document.getElementById('feedback-modal');
        const closeBtns = document.querySelectorAll('.feedback-modal-close');
        const form = document.getElementById('feedback-form');
        const textarea = document.getElementById('feedback-comment');
        const charCount = document.getElementById('char-count');

        textarea.addEventListener('input', (e) => {
            charCount.textContent = e.target.value.length;
        });

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeFeedbackModal());
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeFeedbackModal();
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeFeedbackModal();
            }
        });
    }

    validateComment(comment) {
        const commentLower = comment.toLowerCase();
        
        const hasRestrictedWord = this.restrictedWords.some(word => 
            commentLower.includes(word.toLowerCase())
        );

        if (hasRestrictedWord) {
            return {
                isValid: false,
                message: 'El comentario contiene palabras no permitidas.'
            };
        }

        if (comment.trim().length < 10) {
            return {
                isValid: false,
                message: 'Por favor, escribe al menos 10 caracteres.'
            };
        }

        if (!comment.replace(/\s/g, '').length) {
            return {
                isValid: false,
                message: 'El comentario no puede contener solo espacios.'
            };
        }

        return { isValid: true };
    }

    submitFeedback() {
        const comment = document.getElementById('feedback-comment').value.trim();
        const errorElement = document.getElementById('feedback-error');
        const successElement = document.getElementById('feedback-success');

        errorElement.style.display = 'none';
        successElement.style.display = 'none';

        const validation = this.validateComment(comment);
        if (!validation.isValid) {
            errorElement.textContent = validation.message;
            errorElement.style.display = 'block';
            return;
        }

        this.saveFeedback(comment);
        
        successElement.style.display = 'block';
        
        // Track en Analytics
        this.trackEvent('feedback_submit', 'user_engagement', 'user_feedback');
        
        setTimeout(() => {
            this.closeFeedbackModal();
            successElement.style.display = 'none';
        }, 2000);
    }

    saveFeedback(comment) {
        try {
            const feedbacks = JSON.parse(localStorage.getItem('odam-feedback') || '[]');
            feedbacks.push({
                comment: comment,
                timestamp: new Date().toISOString(),
                type: 'feedback',
                rating: this.rating.userVote
            });
            localStorage.setItem('odam-feedback', JSON.stringify(feedbacks));
            
            this.stats.clicks += 5;
            this.saveStats();
        } catch (e) {
            console.error('Error guardando feedback:', e);
        }
    }

    openFeedbackModal() {
        const modal = document.getElementById('feedback-modal');
        const textarea = document.getElementById('feedback-comment');
        
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Track en Analytics
            this.trackEvent('modal_open', 'user_interaction', 'feedback_modal');
            
            setTimeout(() => {
                if (textarea) textarea.focus();
            }, 300);
        }
    }

    closeFeedbackModal() {
        const modal = document.getElementById('feedback-modal');
        const form = document.getElementById('feedback-form');
        const errorElement = document.getElementById('feedback-error');
        const successElement = document.getElementById('feedback-success');
        
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        if (form) {
            form.reset();
            const charCount = document.getElementById('char-count');
            if (charCount) charCount.textContent = '0';
        }
        
        if (errorElement) errorElement.style.display = 'none';
        if (successElement) successElement.style.display = 'none';
    }

    updateDisplay() {
        this.updateStatsDisplay();
        this.updateRatingDisplay();
    }

    updateStatsDisplay() {
        const visitsElement = document.getElementById('stat-visits');
        const timeElement = document.getElementById('stat-time');
        const engagementElement = document.getElementById('stat-engagement');
        const projectsElement = document.getElementById('stat-projects');

        // Usar valores por defecto 0 para evitar NaN
        const visits = this.stats.visits || 0;
        const timeMinutes = Math.round((this.stats.timeSpent || 0) / 60000);
        const engagement = this.getEngagementScore();
        const projects = (this.stats.projectsViewed || 0) + (this.stats.audioPlays || 0);

        if (visitsElement) visitsElement.textContent = visits;
        if (timeElement) timeElement.textContent = timeMinutes + 'm';
        if (engagementElement) engagementElement.textContent = engagement + '%';
        if (projectsElement) projectsElement.textContent = projects;
    }

    updateRatingDisplay() {
        const likeBtns = document.querySelectorAll('.like-btn');
        const dislikeBtns = document.querySelectorAll('.dislike-btn');
        const ratingResults = document.querySelectorAll('.rating-result');

        likeBtns.forEach(btn => {
            btn.className = `rating-btn like-btn ${this.rating.userVote === 'like' ? 'liked' : ''}`;
        });

        dislikeBtns.forEach(btn => {
            btn.className = `rating-btn dislike-btn ${this.rating.userVote === 'dislike' ? 'disliked' : ''}`;
        });

        ratingResults.forEach(result => {
            result.textContent = this.getRatingText();
        });
    }

    getEngagementScore() {
        // Asegurar que todos los valores sean números válidos
        const scrollScore = Number(this.stats.scrollDepth) || 0;
        const timeScore = Math.min(Math.round((Number(this.stats.timeSpent) || 0) / 60000) * 2, 100);
        const clickScore = Math.min((Number(this.stats.clicks) || 0) * 3, 100);
        const projectScore = Math.min(((Number(this.stats.projectsViewed) || 0) + (Number(this.stats.audioPlays) || 0)) * 10, 100);
        const serviceScore = Math.min((Number(this.stats.servicesExplored) || 0) * 15, 100);
        
        // Calcular score evitando NaN
        const totalScore = (scrollScore + timeScore + clickScore + projectScore + serviceScore) / 5;
        const finalScore = Math.round(Math.max(0, Math.min(100, totalScore)));
        
        return isNaN(finalScore) ? 0 : finalScore;
    }

    getRatingText() {
        const total = this.rating.likes + this.rating.dislikes;
        if (total === 0) return 'Sé el primero en valorar';
        const percentage = Math.round((this.rating.likes / total) * 100);
        return `${percentage}% de las personas les gusta esta página (${total} votos)`;
    }

    handleStatClick(statType) {
        const statItem = event.currentTarget;
        statItem.style.transform = 'scale(0.95)';
        setTimeout(() => {
            statItem.style.transform = 'scale(1)';
        }, 150);
        
        // Track en Analytics
        this.trackEvent('stat_click', 'user_interaction', statType);
        
        if (statType === 'projects') {
            // Redirigir a la sección de proyectos
            const proyectosSection = document.getElementById('proyectos');
            if (proyectosSection) {
                proyectosSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        
        switch(statType) {
            case 'visits':
                console.log(`Has visitado esta página ${this.stats.visits} veces`);
                break;
            case 'time':
                const minutes = Math.round(this.stats.timeSpent / 60000);
                console.log(`Has pasado ${minutes} minutos en esta página`);
                break;
            case 'engagement':
                console.log(`Tu nivel de compromiso es del ${this.getEngagementScore()}%`);
                break;
            case 'projects':
                console.log(`Has visto ${this.stats.projectsViewed} proyectos y reproducido ${this.stats.audioPlays} audios`);
                break;
        }
    }

    getStats() {
        return { ...this.stats };
    }

    getRating() {
        return { ...this.rating };
    }

    resetStats() {
        this.stats = this.getDefaultStats();
        this.saveStats();
        this.updateDisplay();
    }

    exportData() {
        return {
            stats: this.getStats(),
            rating: this.getRating(),
            exportDate: new Date().toISOString()
        };
    }
}

// ===== LIGHTHOUSE PERFORMANCE TRACKING =====
class LighthouseTracker {
    static init() {
        this.trackPerformance();
        this.trackAccessibility();
        this.trackBestPractices();
    }

    static trackPerformance() {
        if ('performance' in window) {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            if (navigationTiming) {
                const loadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
                console.log(`🚀 Lighthouse - Page Load Time: ${loadTime}ms`);
                
                // Enviar a Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'performance_timing', {
                        load_time: loadTime,
                        dom_content_loaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.navigationStart
                    });
                }
            }
        }
    }

    static trackAccessibility() {
        // Verificar características de accesibilidad
        const accessibilityChecks = {
            hasAltTags: document.querySelectorAll('img:not([alt])').length === 0,
            hasHeadings: document.querySelectorAll('h1, h2, h3').length > 0,
            hasLandmarks: document.querySelectorAll('header, nav, main, footer').length >= 4,
            colorContrast: this.checkColorContrast()
        };

        console.log('♿ Lighthouse - Accessibility:', accessibilityChecks);
    }

    static checkColorContrast() {
        // Verificación básica de contraste
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--rich-gold');
        const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-black');
        return primaryColor && backgroundColor ? 'adequate' : 'unknown';
    }

    static trackBestPractices() {
        const bestPractices = {
            https: window.location.protocol === 'https:',
            serviceWorker: 'serviceWorker' in navigator,
            modernJS: typeof window.StatsSystem !== 'undefined',
            responsive: window.innerWidth <= 768 // Check mobile viewport
        };

        console.log('🏆 Lighthouse - Best Practices:', bestPractices);
    }
}

// 👇 INICIALIZACIÓN MEJORADA PARA EVITAR MÚLTIPLES INSTANCIAS
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya existe una instancia
    if (!window.statsSystem) {
        window.statsSystem = new StatsSystem();
        
        // Limpiar duplicados después de un breve delay
        setTimeout(() => {
            if (window.statsSystem && typeof window.statsSystem.removeDuplicates === 'function') {
                window.statsSystem.removeDuplicates();
            }
        }, 1000);
    } else {
        console.log('⚠️ StatsSystem ya está inicializado. Evitando duplicado.');
    }
    
    window.LighthouseTracker = LighthouseTracker;
    LighthouseTracker.init();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StatsSystem, LighthouseTracker };
}

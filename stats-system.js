// stats-system.js - SISTEMA DE ESTADÍSTICAS DISCRETO MEJORADO
class StatsSystem {
    constructor() {
        this.stats = this.loadStats();
        this.rating = this.loadRating();
        this.restrictedWords = this.getRestrictedWords();
        this.init();
    }

    init() {
        this.createStatsContainer();
        this.initStatsTracking();
        this.updateDisplay();
        console.log('📊 Sistema de estadísticas ODAM inicializado');
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
                audioPlays: 0
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
            audioPlays: 0
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
        } catch (e) {
            console.error('Error guardando estadísticas:', e);
        }
    }

    saveRating() {
        try {
            localStorage.setItem('odam-rating', JSON.stringify(this.rating));
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
    }

    trackVisit() {
        const today = new Date().toDateString();
        if (this.stats.lastVisit !== today) {
            this.stats.visits++;
            this.stats.lastVisit = today;
            this.saveStats();
        }
    }

    trackTime() {
        this.startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            this.stats.timeSpent += Date.now() - this.startTime;
            this.saveStats();
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
            }
        }, { passive: true });
    }

    trackClicks() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.stats-system-container')) {
                this.stats.clicks++;
                this.saveStats();
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
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.7 });
            
            observer.observe(item);
        });
    }

    trackAudioPlays() {
        // Escuchar eventos de reproducción de audio
        document.addEventListener('audioPlay', () => {
            this.stats.audioPlays++;
            this.saveStats();
            this.updateDisplay();
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
        this.saveRating();
        this.updateRatingDisplay();
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
            </div>
        `;

        const interactionSection = document.getElementById('interaccion');
        if (interactionSection) {
            interactionSection.insertAdjacentHTML('beforeend', statsHTML);
        }

        this.createFeedbackModal();
    }

    createFeedbackModal() {
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

document.addEventListener('DOMContentLoaded', function() {
    window.statsSystem = new StatsSystem();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatsSystem;
}

// stats-system.js - SISTEMA DE ESTADÍSTICAS DISCRETO - SIN DUPLICACIÓN
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
                lastVisit: null
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
                userVote: null
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
            lastVisit: null
        };
    }

    getDefaultRating() {
        return { 
            likes: 0, 
            dislikes: 0, 
            userVote: null 
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
            // Ignorar clicks en elementos del sistema de estadísticas
            if (!e.target.closest('.stats-system-container')) {
                this.stats.clicks++;
                this.saveStats();
            }
        }, { passive: true });
    }

    rate(voteType) {
        if (this.rating.userVote === voteType) {
            // Quitar voto si es el mismo
            if (voteType === 'like') this.rating.likes--;
            else this.rating.dislikes--;
            this.rating.userVote = null;
        } else {
            // Remover voto anterior si existe
            if (this.rating.userVote === 'like') this.rating.likes--;
            else if (this.rating.userVote === 'dislike') this.rating.dislikes--;
            
            // Agregar nuevo voto
            if (voteType === 'like') this.rating.likes++;
            else this.rating.dislikes++;
            this.rating.userVote = voteType;

            // Mostrar modal si es dislike
            if (voteType === 'dislike') {
                setTimeout(() => this.openFeedbackModal(), 500);
            }
        }
        this.saveRating();
        this.updateRatingDisplay();
    }

    getRestrictedWords() {
        return [
            // === LISTA DE PALABRAS RESTRINGIDAS ===
            // Lenguaje vulgar u obsceno
            'palabrota1', 'palabrota2', 'insulto1', 'insulto2', 'groseria1', 'groseria2',
            // Discriminación
            'racista1', 'sexista1', 'homofobico1', 'discriminatorio1',
            // Violencia
            'amenaza1', 'violencia1', 'odio1', 'daño1',
            // Acoso
            'acoso1', 'difamacion1', 'humillacion1', 'abusivo1',
            // Spam
            'estafa', 'phishing', 'correo no deseado', 'spam1'
            // AGREGA AQUÍ TU LISTA COMPLETA DE PALABRAS RESTRINGIDAS
        ];
    }

    createStatsContainer() {
        // === SOLO UN CONTENEDOR - SIN DUPLICACIÓN ===
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

        // === INSERTAR SOLO DEBAJO DE LA SECCIÓN DE CONTACTO ===
        const contactSection = document.querySelector('.contact-section .contact-content');
        if (contactSection) {
            contactSection.insertAdjacentHTML('afterend', statsHTML);
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

        // Contador de caracteres
        textarea.addEventListener('input', (e) => {
            charCount.textContent = e.target.value.length;
        });

        // Cerrar modal
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeFeedbackModal());
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeFeedbackModal();
            }
        });

        // Enviar formulario
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeFeedbackModal();
            }
        });
    }

    validateComment(comment) {
        const commentLower = comment.toLowerCase();
        
        // Verificar palabras restringidas
        const hasRestrictedWord = this.restrictedWords.some(word => 
            commentLower.includes(word.toLowerCase())
        );

        if (hasRestrictedWord) {
            return {
                isValid: false,
                message: 'El comentario contiene palabras no permitidas.'
            };
        }

        // Verificar longitud mínima
        if (comment.trim().length < 10) {
            return {
                isValid: false,
                message: 'Por favor, escribe al menos 10 caracteres.'
            };
        }

        // Verificar contenido solo de espacios
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

        // Ocultar mensajes anteriores
        errorElement.style.display = 'none';
        successElement.style.display = 'none';

        // Validar comentario
        const validation = this.validateComment(comment);
        if (!validation.isValid) {
            errorElement.textContent = validation.message;
            errorElement.style.display = 'block';
            return;
        }

        // Guardar comentario
        this.saveFeedback(comment);
        
        // Mostrar éxito
        successElement.style.display = 'block';
        
        // Cerrar modal después de 2 segundos
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
                type: 'feedback'
            });
            localStorage.setItem('odam-feedback', JSON.stringify(feedbacks));
        } catch (e) {
            console.error('Error guardando feedback:', e);
        }
    }

    openFeedbackModal() {
        const modal = document.getElementById('feedback-modal');
        const textarea = document.getElementById('feedback-comment');
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Enfocar el textarea después de la animación
        setTimeout(() => textarea.focus(), 300);
    }

    closeFeedbackModal() {
        const modal = document.getElementById('feedback-modal');
        const form = document.getElementById('feedback-form');
        const errorElement = document.getElementById('feedback-error');
        const successElement = document.getElementById('feedback-success');
        
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Resetear formulario
        form.reset();
        document.getElementById('char-count').textContent = '0';
        errorElement.style.display = 'none';
        successElement.style.display = 'none';
    }

    updateDisplay() {
        // Actualizar números en tiempo real si es necesario
        this.updateStatsDisplay();
        this.updateRatingDisplay();
    }

    updateStatsDisplay() {
        // Actualizar solo los números, no el título
        const visitsElement = document.getElementById('stat-visits');
        const timeElement = document.getElementById('stat-time');
        const engagementElement = document.getElementById('stat-engagement');

        if (visitsElement) visitsElement.textContent = this.stats.visits;
        if (timeElement) timeElement.textContent = Math.round(this.stats.timeSpent / 60000) + 'm';
        if (engagementElement) engagementElement.textContent = this.getEngagementScore() + '%';
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
        const scrollScore = this.stats.scrollDepth;
        const timeScore = Math.min(Math.round(this.stats.timeSpent / 60000) * 2, 100);
        const clickScore = Math.min(this.stats.clicks * 5, 100);
        
        return Math.round((scrollScore + timeScore + clickScore) / 3);
    }

    getRatingText() {
        const total = this.rating.likes + this.rating.dislikes;
        if (total === 0) return 'Sé el primero en valorar';
        const percentage = Math.round((this.rating.likes / total) * 100);
        return `${percentage}% de las personas les gusta esta página`;
    }

    handleStatClick(statType) {
        // Efecto visual al hacer clic en estadísticas
        console.log(`Estadística clickeada: ${statType}`);
        
        // Podemos agregar más funcionalidades aquí
        switch(statType) {
            case 'visits':
                alert(`Has visitado esta página ${this.stats.visits} veces`);
                break;
            case 'time':
                alert(`Has pasado ${Math.round(this.stats.timeSpent / 60000)} minutos en esta página`);
                break;
            case 'engagement':
                alert(`Tu nivel de compromiso es del ${this.getEngagementScore()}%`);
                break;
        }
    }

    // Métodos públicos para acceso externo
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
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.statsSystem = new StatsSystem();
});

// Para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatsSystem;
}

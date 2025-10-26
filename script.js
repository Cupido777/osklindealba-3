// script.js - ODAM PRODUCCIÓN MUSICAL - SISTEMA COMPLETO OPTIMIZADO
// Integraciones: Service Worker, GA4, Formulario Backend, PWA, CDN, Lighthouse

// ===== SISTEMA DE TOKENS CSRF MEJORADO =====
class CSRFTokenManager {
    constructor() {
        this.token = null;
        this.tokenExpiry = null;
        this.init();
    }

    async init() {
        await this.generateCSRFToken();
        this.setupTokenRefresh();
    }

    async generateCSRFToken() {
        try {
            // Generar token seguro
            const randomBytes = new Uint8Array(32);
            crypto.getRandomValues(randomBytes);
            this.token = Array.from(randomBytes, byte => 
                byte.toString(16).padStart(2, '0')
            ).join('');
            
            // Establecer expiración (1 hora)
            this.tokenExpiry = Date.now() + (60 * 60 * 1000);
            
            // Guardar en sessionStorage
            sessionStorage.setItem('odam-csrf-token', this.token);
            sessionStorage.setItem('odam-csrf-expiry', this.tokenExpiry.toString());
            
            console.log('✅ Token CSRF generado correctamente');
            return this.token;
            
        } catch (error) {
            console.error('❌ Error generando token CSRF:', error);
            // Fallback a token básico
            this.token = Math.random().toString(36).substring(2) + Date.now().toString(36);
            return this.token;
        }
    }

    validateToken(token) {
        if (!this.token || !this.tokenExpiry) {
            console.warn('⚠️ Token CSRF no inicializado');
            return false;
        }

        // Verificar expiración
        if (Date.now() > this.tokenExpiry) {
            console.warn('⚠️ Token CSRF expirado');
            this.generateCSRFToken();
            return false;
        }

        // Verificar coincidencia
        const isValid = token === this.token;
        if (!isValid) {
            console.warn('⚠️ Token CSRF inválido');
        }
        
        return isValid;
    }

    setupTokenRefresh() {
        // Refrescar token cada 45 minutos
        setInterval(() => {
            this.generateCSRFToken();
        }, 45 * 60 * 1000);
    }

    getToken() {
        if (!this.token || Date.now() > this.tokenExpiry) {
            this.generateCSRFToken();
        }
        return this.token;
    }

    static getStoredToken() {
        try {
            const token = sessionStorage.getItem('odam-csrf-token');
            const expiry = sessionStorage.getItem('odam-csrf-expiry');
            
            if (token && expiry && Date.now() < parseInt(expiry)) {
                return token;
            }
        } catch (error) {
            console.error('Error obteniendo token almacenado:', error);
        }
        return null;
    }
}

// Instancia global del administrador de tokens CSRF
window.csrfTokenManager = new CSRFTokenManager();

class AudioPlayerSystem {
    constructor() {
        this.audioPlayers = new Map();
        this.currentlyPlaying = null;
        this.waveSystems = new Map();
        this.init();
    }

    init() {
        console.log('🎵 Sistema de audio inicializado');
        this.initializeAllAudioPlayers();
        this.setupGlobalEventListeners();
    }

    initializeAllAudioPlayers() {
        const audioConfigs = [
            { card: 'project-tu-me-sostendras', audio: 'audio-tu-me-sostendras' },
            { card: 'project-renovados-en-tu-voluntad', audio: 'audio-renovados-en-tu-voluntad' },
            { card: 'project-en-ti-confio-senor', audio: 'audio-en-ti-confio-senor' },
            { card: 'project-el-diezmo-es-del-senor-version-bachata', audio: 'audio-el-diezmo-es-del-senor-version-bachata' },
            { card: 'project-jonas-y-el-gran-pez', audio: 'audio-jonas-y-el-gran-pez' },
            { card: 'project-el-hijo-de-manoa', audio: 'audio-el-hijo-de-manoa' }
        ];

        audioConfigs.forEach(config => {
            this.setupAudioPlayer(config.card, config.audio);
        });

        console.log(`✅ ${audioConfigs.length} reproductores de audio inicializados`);
    }

    setupAudioPlayer(cardId, audioId) {
        const card = document.getElementById(cardId);
        const audio = document.getElementById(audioId);
        
        if (!card || !audio) {
            console.warn(`❌ No se pudo encontrar: ${cardId} o ${audioId}`);
            return;
        }

        const player = {
            card,
            audio,
            playBtn: card.querySelector('.audio-play-btn'),
            progressBar: card.querySelector('.audio-progress'),
            audioTime: card.querySelector('.audio-time'),
            waveform: card.querySelector('.audio-waveform'),
            waveBars: card.querySelectorAll('.wave-bar'),
            audioPlayer: card.querySelector('.audio-player-mini'),
            isPlaying: false
        };

        // Inicializar sistema de ondas para este audio
        const waveSystem = new InteractiveWaveSystem();
        this.waveSystems.set(audioId, waveSystem);

        this.audioPlayers.set(audioId, player);
        this.bindPlayerEvents(player, audioId);
    }

    bindPlayerEvents(player, audioId) {
        const { audio, playBtn, progressBar, audioTime, waveBars, audioPlayer } = player;
        const waveSystem = this.waveSystems.get(audioId);

        // Función para formatear tiempo
        const formatTime = (seconds) => {
            if (isNaN(seconds)) return '0:00';
            const min = Math.floor(seconds / 60);
            const sec = Math.floor(seconds % 60);
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        };

        // Actualizar progreso
        const updateProgress = () => {
            if (audio.duration && progressBar) {
                const percent = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = `${percent}%`;
            }
            if (audioTime) {
                audioTime.textContent = formatTime(audio.currentTime);
            }
        };

        // Inicializar analizador de audio cuando esté listo
        const initAudioAnalyser = () => {
            if (!waveSystem.initialized) {
                waveSystem.initAnalyser(audio);
            }
        };

        // Toggle reproducción
        const togglePlay = () => {
            // Si este audio ya está reproduciéndose, pausarlo
            if (player.isPlaying) {
                audio.pause();
                player.isPlaying = false;
                audioPlayer.classList.remove('playing');
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                waveSystem.stopWaveform();
                this.currentlyPlaying = null;
                return;
            }

            // Pausar cualquier audio que se esté reproduciendo
            if (this.currentlyPlaying && this.currentlyPlaying !== audioId) {
                const previousPlayer = this.audioPlayers.get(this.currentlyPlaying);
                const previousWaveSystem = this.waveSystems.get(this.currentlyPlaying);
                
                if (previousPlayer && previousWaveSystem) {
                    previousPlayer.audio.pause();
                    previousPlayer.isPlaying = false;
                    previousPlayer.audioPlayer.classList.remove('playing');
                    previousPlayer.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    previousWaveSystem.stopWaveform();
                }
            }

            // Inicializar analizador si es necesario
            initAudioAnalyser();

            // Reproducir este audio
            audio.play().then(() => {
                player.isPlaying = true;
                this.currentlyPlaying = audioId;
                audioPlayer.classList.add('playing');
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                waveSystem.updateWaveform(waveBars);
                
                // Disparar evento para estadísticas
                document.dispatchEvent(new CustomEvent('audioPlay'));
                
                // Track en Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'audio_play', {
                        event_category: 'media',
                        event_label: audioId,
                        value: 1
                    });
                }
                
            }).catch(error => {
                console.error('Error reproduciendo audio:', error);
                playBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                playBtn.style.color = '#ff6b6b';
                
                // Track error en Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'audio_error', {
                        event_category: 'media',
                        event_label: error.message
                    });
                }
            });
        };

        // Event listeners
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });

        audio.addEventListener('timeupdate', updateProgress);
        
        audio.addEventListener('ended', () => {
            audio.currentTime = 0;
            player.isPlaying = false;
            audioPlayer.classList.remove('playing');
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (progressBar) progressBar.style.width = '0%';
            if (audioTime) audioTime.textContent = '0:00';
            waveSystem.stopWaveform();
            this.currentlyPlaying = null;
        });

        audio.addEventListener('loadedmetadata', () => {
            if (audioTime) audioTime.textContent = '0:00';
            initAudioAnalyser();
        });

        audio.addEventListener('canplay', initAudioAnalyser);

        audio.addEventListener('error', (e) => {
            console.error(`Error en audio ${audioId}:`, e);
            playBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            playBtn.style.color = '#ff6b6b';
            audioPlayer.classList.add('error');
        });
    }

    setupGlobalEventListeners() {
        // Pausar todos los audios al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.audio-player-mini') && !e.target.closest('.audio-play-btn')) {
                this.pauseAll();
            }
        });

        // Manejar la visibilidad de la página para pausar audio
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAll();
            }
        });
    }

    pauseAll() {
        this.audioPlayers.forEach((player, audioId) => {
            if (player.isPlaying) {
                player.audio.pause();
                player.isPlaying = false;
                player.audioPlayer.classList.remove('playing');
                player.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                
                const waveSystem = this.waveSystems.get(audioId);
                if (waveSystem) {
                    waveSystem.stopWaveform();
                }
            }
        });
        this.currentlyPlaying = null;
    }

    // Método para limpiar recursos
    destroy() {
        this.pauseAll();
        this.waveSystems.forEach(waveSystem => {
            waveSystem.destroy();
        });
        this.waveSystems.clear();
        this.audioPlayers.clear();
    }
}

// ===== SISTEMA DE ONDAS INTERACTIVAS MEJORADO =====
class InteractiveWaveSystem {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.animationFrame = null;
        this.initialized = false;
        this.isPlaying = false;
    }

    initAnalyser(audioElement) {
        if (this.initialized) return;
        
        try {
            // Crear contexto de audio
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Crear analizador
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            
            // Conectar el audio al analizador
            const source = this.audioContext.createMediaElementSource(audioElement);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            // Preparar array para datos de frecuencia
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            this.initialized = true;
            console.log('✅ Analizador de audio inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando el analizador de audio:', error);
            this.initialized = false;
        }
    }

    updateWaveform(waveBars) {
        if (!this.analyser || !this.initialized) return;

        // Obtener datos de frecuencia
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Dividir el espectro en bandas para las barras
        const bandSize = Math.floor(this.dataArray.length / waveBars.length);
        
        waveBars.forEach((bar, index) => {
            const start = index * bandSize;
            let sum = 0;
            
            // Promediar los valores de frecuencia en esta banda
            for (let i = 0; i < bandSize; i++) {
                sum += this.dataArray[start + i];
            }
            
            const average = sum / bandSize;
            
            // Convertir a altura (0-100%)
            const height = Math.max(10, (average / 256) * 100);
            
            // Actualizar la barra
            bar.style.height = `${height}%`;
            bar.style.opacity = Math.max(0.4, Math.min(1, average / 150));
            
            // Efecto de color basado en la intensidad
            const intensity = average / 256;
            if (intensity > 0.8) {
                bar.style.background = 'linear-gradient(180deg, #ffd700, #ff6b00)';
            } else if (intensity > 0.6) {
                bar.style.background = 'linear-gradient(180deg, var(--vibrant-gold), #ffa500)';
            } else {
                bar.style.background = 'linear-gradient(180deg, var(--rich-gold), var(--vibrant-gold))';
            }
        });

        // Continuar la animación
        this.animationFrame = requestAnimationFrame(() => this.updateWaveform(waveBars));
    }

    stopWaveform() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    destroy() {
        this.stopWaveform();
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.initialized = false;
    }
}

// ===== SISTEMA DE SERVICE WORKER =====
class ServiceWorkerManager {
    constructor() {
        this.isRegistered = false;
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                this.isRegistered = true;
                console.log('✅ Service Worker registrado:', registration);
                
                // Track en Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'service_worker_registered', {
                        event_category: 'pwa',
                        event_label: 'success'
                    });
                }

                // Manejar actualizaciones del Service Worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 Nuevo Service Worker encontrado:', newWorker);
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

            } catch (error) {
                console.error('❌ Error registrando Service Worker:', error);
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'service_worker_error', {
                        event_category: 'pwa',
                        event_label: error.message
                    });
                }
            }
        }
    }

    showUpdateNotification() {
        // Mostrar notificación de actualización
        if (Notification.permission === 'granted') {
            new Notification('ODAM - Nueva Versión Disponible', {
                body: 'Hay una nueva versión disponible. Recarga la página para actualizar.',
                icon: '/logo-192x192.png',
                tag: 'update-notification'
            });
        }
    }

    static async getCacheStats() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            try {
                const response = await fetch('/api/cache-stats');
                return await response.json();
            } catch (error) {
                console.error('Error obteniendo stats de cache:', error);
                return null;
            }
        }
        return null;
    }
}

// ===== SISTEMA DE FORMULARIO CON BACKEND Y CSRF =====
class FormHandler {
    constructor() {
        this.init();
    }

    async init() {
        this.setupFormHandlers();
        this.setupCSRFProtection();
    }

    setupCSRFProtection() {
        // Inyectar token CSRF en todos los formularios
        document.addEventListener('DOMContentLoaded', () => {
            this.injectCSRFTokens();
        });
    }

    injectCSRFTokens() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const existingToken = form.querySelector('input[name="csrf_token"]');
            if (!existingToken) {
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = 'csrf_token';
                tokenInput.value = window.csrfTokenManager.getToken();
                form.appendChild(tokenInput);
            }
        });
    }

    setupFormHandlers() {
        // Formulario de contacto principal
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm(contactForm);
            });
        }

        // Formulario de feedback
        const feedbackForm = document.getElementById('feedback-form');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFeedbackForm(feedbackForm);
            });
        }

        // Modal de contacto
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('open-contact-modal') || 
                e.target.closest('.open-contact-modal')) {
                e.preventDefault();
                this.openContactModal();
            }
        });

        // Contador de caracteres para textareas
        this.setupCharacterCounters();
    }

    setupCharacterCounters() {
        const textareas = document.querySelectorAll('textarea[maxlength]');
        textareas.forEach(textarea => {
            const maxLength = parseInt(textarea.getAttribute('maxlength'));
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.style.cssText = `
                text-align: right;
                font-size: 0.8rem;
                color: #b0b0b0;
                margin-top: 5px;
            `;
            counter.textContent = `0/${maxLength}`;
            
            textarea.parentNode.appendChild(counter);
            
            textarea.addEventListener('input', (e) => {
                const length = e.target.value.length;
                counter.textContent = `${length}/${maxLength}`;
                
                if (length > maxLength * 0.9) {
                    counter.style.color = '#ff6b6b';
                } else if (length > maxLength * 0.75) {
                    counter.style.color = '#ffa500';
                } else {
                    counter.style.color = '#b0b0b0';
                }
            });
        });
    }

    async handleContactForm(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Validar token CSRF
        const csrfToken = formData.get('csrf_token');
        if (!window.csrfTokenManager.validateToken(csrfToken)) {
            this.showNotification('❌ Error de seguridad. Por favor, recarga la página.', 'error');
            return;
        }

        // Mostrar loading
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/form-handler.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-Token': csrfToken
                }
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('✅ Solicitud enviada correctamente. Te contactaremos pronto.', 'success');
                
                // Track en Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submission', {
                        event_category: 'contact',
                        event_label: formData.get('service-type'),
                        value: 1
                    });
                }

                // Disparar evento para estadísticas
                document.dispatchEvent(new CustomEvent('formSubmission', {
                    detail: {
                        serviceType: formData.get('service-type')
                    }
                }));

                // Cerrar modal y resetear formulario
                this.closeModal();
                form.reset();

                // Regenerar token CSRF
                window.csrfTokenManager.generateCSRFToken();

            } else {
                this.showNotification('❌ Error: ' + data.message, 'error');
                console.error('Error del servidor:', data);
            }

        } catch (error) {
            console.error('Error enviando formulario:', error);
            this.showNotification('❌ Error de conexión. Usando método alternativo...', 'warning');
            
            // Fallback a mailto
            this.fallbackToMailto(form);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleFeedbackForm(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Validar token CSRF
        const csrfToken = formData.get('csrf_token');
        if (!window.csrfTokenManager.validateToken(csrfToken)) {
            this.showNotification('❌ Error de seguridad. Por favor, recarga la página.', 'error');
            return;
        }

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/form-handler.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-Token': csrfToken
                }
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('✅ ¡Gracias por tus comentarios!', 'success');
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'feedback_submission', {
                        event_category: 'feedback',
                        event_label: 'user_feedback'
                    });
                }

                form.reset();
                this.closeFeedbackModal();

                // Regenerar token CSRF
                window.csrfTokenManager.generateCSRFToken();

            } else {
                this.showNotification('❌ Error: ' + data.message, 'error');
            }

        } catch (error) {
            console.error('Error enviando feedback:', error);
            this.showNotification('❌ Error enviando comentarios', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    fallbackToMailto(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        const subject = `Nueva solicitud de servicio: ${data['service-type']}`;
        const body = `
Solicitud de Cotización - ODAM Producción Musical

INFORMACIÓN DEL CLIENTE:
Nombre: ${data.name}
Email: ${data.email}
Teléfono/WhatsApp: ${data.phone}

DETALLES DEL SERVICIO:
Servicio solicitado: ${data['service-type']}
Tipo de proyecto: ${data['project-type'] || 'No especificado'}
Presupuesto estimado: ${data.budget || 'No especificado'}
Fecha límite: ${data.deadline || 'No especificada'}

DESCRIPCIÓN DEL PROYECTO:
${data.message}

---
Este mensaje fue enviado desde el formulario de contacto de ODAM Producción Musical.
        `.trim();

        const mailtoLink = `mailto:odeam@osklindealba.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    openContactModal() {
        const modal = document.getElementById('contact-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Inyectar token CSRF fresco
            this.injectCSRFTokens();
            
            // Track en Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'modal_open', {
                    event_category: 'ui',
                    event_label: 'contact_modal'
                });
            }
        }
    }

    closeModal() {
        const modal = document.getElementById('contact-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    closeFeedbackModal() {
        const modal = document.getElementById('feedback-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    showNotification(message, type = 'info') {
        // Crear notificación toast
        const toast = document.createElement('div');
        toast.className = `notification-toast notification-${type}`;
        toast.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Estilos para la notificación
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : type === 'warning' ? '#FF9800' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);

        // Cerrar al hacer click
        toast.querySelector('.notification-close').addEventListener('click', () => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        });
    }
}

// ===== SISTEMA DE GOOGLE ANALYTICS 4 =====
class GoogleAnalyticsManager {
    constructor() {
        this.measurementId = 'G-XXXXXXXXXX'; // Reemplazar con tu ID real
        this.init();
    }

    init() {
        this.injectGAScript();
        this.setupAutoTracking();
    }

    injectGAScript() {
        // Inyectar script de Google Analytics
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${this.measurementId}', {
                page_title: document.title,
                page_location: window.location.href,
                transport_type: 'beacon'
            });
        `;
        document.head.appendChild(script2);

        console.log('✅ Google Analytics inicializado');
    }

    setupAutoTracking() {
        // Track page views
        this.trackPageView();

        // Track clicks externos
        this.trackOutboundLinks();

        // Track descargas
        this.trackDownloads();

        // Track eventos de formulario
        this.trackFormInteractions();

        // Track scroll depth
        this.trackScrollDepth();

        // Track tiempo en página
        this.trackTimeOnPage();
    }

    trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    }

    trackOutboundLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.hostname !== window.location.hostname) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'outbound_click', {
                        event_category: 'outbound',
                        event_label: link.href,
                        transport_type: 'beacon'
                    });
                }
            }
        });
    }

    trackDownloads() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && /\.(mp3|wav|pdf|zip)$/i.test(link.href)) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'file_download', {
                        event_category: 'download',
                        event_label: link.href,
                        value: 1
                    });
                }
            }
        });
    }

    trackFormInteractions() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.id === 'contact-form' || form.id === 'feedback-form') {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        event_category: 'form',
                        event_label: form.id,
                        value: 1
                    });
                }
            }
        });
    }

    trackScrollDepth() {
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // Track cada 25%
                if (scrollPercent % 25 === 0) {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll_depth', {
                            event_category: 'engagement',
                            event_label: `${scrollPercent}%`,
                            value: scrollPercent
                        });
                    }
                }
            }
        });
    }

    trackTimeOnPage() {
        let startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - startTime;
            if (typeof gtag !== 'undefined') {
                gtag('event', 'time_on_page', {
                    event_category: 'engagement',
                    event_label: 'page_engagement',
                    value: Math.round(timeSpent / 1000) // en segundos
                });
            }
        });
    }

    static trackEvent(category, action, label, value = null) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
    }
}

// ===== SISTEMA PWA (PROGRESSIVE WEB APP) =====
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        this.setupInstallPrompt();
        this.setupBeforeInstallPrompt();
        this.checkStandaloneMode();
        this.setupAppBadge();
    }

    setupBeforeInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPromotion();
            console.log('✅ PWA - BeforeInstallPrompt event captured');
        });
    }

    setupInstallPrompt() {
        const installButton = document.createElement('button');
        installButton.id = 'pwa-install-button';
        installButton.innerHTML = '📱 Instalar App';
        installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #c8a25f, #d4af37);
            color: black;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(200, 162, 95, 0.4);
            z-index: 1000;
            display: none;
            animation: bounce 2s infinite;
        `;

        installButton.addEventListener('click', () => {
            this.promptInstallation();
        });

        document.body.appendChild(installButton);
    }

    setupAppBadge() {
        const appBadge = document.querySelector('.pwa-badge');
        if (appBadge) {
            appBadge.style.cursor = 'pointer';
            appBadge.setAttribute('title', 'Haz clic para instalar la app');
            appBadge.addEventListener('click', () => {
                this.promptInstallation();
            });
            
            // Agregar efectos hover
            appBadge.addEventListener('mouseenter', () => {
                appBadge.style.transform = 'scale(1.05)';
                appBadge.style.transition = 'transform 0.2s ease';
            });
            
            appBadge.addEventListener('mouseleave', () => {
                appBadge.style.transform = 'scale(1)';
            });
        }
    }

    showInstallPromotion() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton && this.deferredPrompt) {
            installButton.style.display = 'block';
            
            // Auto-ocultar después de 10 segundos
            setTimeout(() => {
                installButton.style.display = 'none';
            }, 10000);
        }

        // También mostrar el badge como interactivo
        const appBadge = document.querySelector('.pwa-badge');
        if (appBadge && this.deferredPrompt) {
            appBadge.style.display = 'inline-block';
        }
    }

    async promptInstallation() {
        if (!this.deferredPrompt) {
            this.showNotification('⚠️ La instalación no está disponible en este momento.', 'warning');
            return;
        }

        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`✅ PWA - User response to install prompt: ${outcome}`);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_install_prompt', {
                    event_category: 'pwa',
                    event_label: outcome
                });
            }

            if (outcome === 'accepted') {
                this.showNotification('✅ App instalada correctamente', 'success');
            }

            this.deferredPrompt = null;
            
            // Ocultar botón de instalación
            const installButton = document.getElementById('pwa-install-button');
            if (installButton) {
                installButton.style.display = 'none';
            }

        } catch (error) {
            console.error('Error durante la instalación PWA:', error);
            this.showNotification('❌ Error durante la instalación', 'error');
        }
    }

    checkStandaloneMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('✅ PWA - Running in standalone mode');
            document.body.classList.add('pwa-standalone');
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_launch', {
                    event_category: 'pwa',
                    event_label: 'standalone'
                });
            }
        }
    }

    showNotification(message, type = 'info') {
        // Implementación simple de notificación
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// ===== SISTEMA DE CDN =====
class CDNManager {
    constructor() {
        this.cdnBase = 'https://cdn.osklindealba.com';
        this.localBase = '';
        this.init();
    }

    init() {
        this.preconnectCDNs();
        this.optimizeResourceLoading();
    }

    preconnectCDNs() {
        const cdns = [
            'https://cdn.osklindealba.com',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdnjs.cloudflare.com',
            'https://cdn.jsdelivr.net'
        ];

        cdns.forEach(cdn => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = cdn;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    optimizeResourceLoading() {
        // Precargar recursos críticos
        const criticalResources = [
            this.getCDNUrl('/styles.css'),
            this.getCDNUrl('/script.js'),
            this.getCDNUrl('/logo.jpg'),
            this.getCDNUrl('/tu-foto.jpg'),
            this.getCDNUrl('/logo-192x192.png'),
            this.getCDNUrl('/logo-512x512.png')
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            
            if (resource.endsWith('.css')) {
                link.as = 'style';
            } else if (resource.endsWith('.js')) {
                link.as = 'script';
            } else {
                link.as = 'image';
            }
            
            document.head.appendChild(link);
        });
    }

    getCDNUrl(path) {
        // En producción usar CDN, en desarrollo local
        if (window.location.hostname === 'www.osklindealba.com' || 
            window.location.hostname === 'osklindealba.com') {
            return `${this.cdnBase}${path}`;
        }
        return `${this.localBase}${path}`;
    }

    static async checkCDNPerformance() {
        const testUrls = [
            'https://cdn.osklindealba.com/logo.jpg',
            'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
        ];

        const results = [];
        
        for (const url of testUrls) {
            try {
                const startTime = performance.now();
                await fetch(url, { method: 'HEAD', mode: 'no-cors' });
                const loadTime = performance.now() - startTime;
                results.push({ url, loadTime, status: 'success' });
            } catch (error) {
                results.push({ url, loadTime: 0, status: 'error', error: error.message });
            }
        }

        return results;
    }
}

// ===== SISTEMA DE ANIMACIONES =====
class AnimationSystem {
    constructor() {
        this.observer = null;
        this.animatedElements = new Set();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    entry.target.classList.add('show');
                    this.animatedElements.add(entry.target);
                    
                    // Track en Analytics
                    if (typeof gtag !== 'undefined' && entry.target.id) {
                        gtag('event', 'element_visible', {
                            event_category: 'engagement',
                            event_label: entry.target.id
                        });
                    }
                    
                    setTimeout(() => {
                        this.observer.unobserve(entry.target);
                    }, 1000);
                }
            });
        }, options);

        document.querySelectorAll('.fade-in').forEach(el => {
            this.observer.observe(el);
        });
    }

    setupScrollAnimations() {
        let ticking = false;
        
        const updateElements = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-parallax')) || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateElements);
                ticking = true;
            }
        });
    }
}

// ===== OPTIMIZACIÓN DE EVENT LISTENERS =====
function optimizeEventListeners() {
    // Delegación para acordeón de servicios
    document.addEventListener('click', function(e) {
        if (e.target.closest('.service-accordion-header')) {
            const header = e.target.closest('.service-accordion-header');
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            document.querySelectorAll('.service-accordion-item').forEach(accItem => {
                accItem.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
                
                // Track en Analytics
                if (typeof gtag !== 'undefined') {
                    const serviceName = item.querySelector('h3').textContent;
                    gtag('event', 'service_expand', {
                        event_category: 'engagement',
                        event_label: serviceName
                    });
                }
            }
        }
        
        // Delegación para cerrar modal
        if (e.target.classList.contains('modal-close') || 
            e.target.closest('.modal-close') ||
            e.target.id === 'contact-modal') {
            const modal = document.getElementById('contact-modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('contact-modal');
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            const feedbackModal = document.getElementById('feedback-modal');
            if (feedbackModal && feedbackModal.classList.contains('active')) {
                feedbackModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    });
}

// ===== VERSÍCULOS BÍBLICOS =====
const bibleVerses = [
    {
        text: "El temor del Señor es el principio de la sabiduría.",
        reference: "Proverbios 1:7"
    },
    {
        text: "Todo lo puedo en Cristo que me fortalece.",
        reference: "Filipenses 4:13"
    },
    {
        text: "Encomienda a Jehová tu camino, y confía en él; y él hará.",
        reference: "Salmos 37:5"
    },
    {
        text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito.",
        reference: "Juan 3:16"
    },
    {
        text: "Jesucristo es el mismo ayer, y hoy, y por los siglos.",
        reference: "Hebreos 13:8"
    }
];

function initBibleVerses() {
    const bibleVerseElement = document.getElementById('bible-verse');
    let currentVerseIndex = -1;

    function getRandomVerse() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * bibleVerses.length);
        } while (newIndex === currentVerseIndex && bibleVerses.length > 1);
        
        currentVerseIndex = newIndex;
        return bibleVerses[currentVerseIndex];
    }

    function displayVerse() {
        const verse = getRandomVerse();
        if (bibleVerseElement) {
            bibleVerseElement.style.opacity = '0';
            
            setTimeout(() => {
                bibleVerseElement.innerHTML = `
                    <div class="verse-text">${verse.text}</div>
                    <div class="verse-reference">${verse.reference}</div>
                `;
                bibleVerseElement.style.opacity = '1';
            }, 300);

            // Track en Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'bible_verse_view', {
                    event_category: 'content',
                    event_label: verse.reference
                });
            }
        }
    }
    
    // Mostrar versículo inicial
    setTimeout(displayVerse, 1000);

    // Cambiar versículo al interactuar
    if (bibleVerseElement) {
        bibleVerseElement.addEventListener('click', displayVerse);
        bibleVerseElement.addEventListener('touchstart', displayVerse);
    }

    // Cambiar automáticamente cada 30 segundos
    setInterval(displayVerse, 30000);
}

// ===== MENÚ MÓVIL =====
function initMobileMenu() {
    const toggle = document.getElementById('site-nav-toggle');
    const nav = document.getElementById('site-nav');
    
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('open');
        document.body.style.overflow = expanded ? 'auto' : 'hidden';
        
        // Track en Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'mobile_menu_toggle', {
                event_category: 'ui',
                event_label: expanded ? 'close' : 'open'
            });
        }
    });

    // Cerrar menú al hacer clic en enlaces
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
        });
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('open') && 
            !nav.contains(e.target) && 
            !toggle.contains(e.target)) {
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
        }
    });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offset = 80;
                
                window.scrollTo({
                    top: targetPosition - offset,
                    behavior: 'smooth'
                });

                // Track en Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'smooth_scroll', {
                        event_category: 'navigation',
                        event_label: href
                    });
                }

                history.pushState(null, null, href);
            }
        });
    });
}

// ===== HEADER SCROLL EFFECT =====
function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    function updateHeader() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        if (currentScroll > lastScroll && currentScroll > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
        ticking = false;
    }
    
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
}

// ===== LOADING SYSTEM =====
class LoadingSystem {
    constructor() {
        this.progress = 0;
        this.progressBar = document.getElementById('loading-progress');
        this.progressFill = document.querySelector('.progress-fill');
    }

    init() {
        this.startLoading();
        this.trackResources();
    }

    startLoading() {
        if (this.progressBar) {
            this.progressBar.classList.add('loading');
            this.updateProgress(10);
        }
    }

    trackResources() {
        const images = document.querySelectorAll('img');
        let loadedCount = 0;
        const totalCount = images.length;

        images.forEach(img => {
            if (img.complete) {
                loadedCount++;
            } else {
                img.addEventListener('load', () => {
                    loadedCount++;
                    this.updateProgress(10 + (loadedCount / totalCount) * 80);
                });
                img.addEventListener('error', () => {
                    loadedCount++;
                    this.updateProgress(10 + (loadedCount / totalCount) * 80);
                });
            }
        });

        // Forzar progreso
        setTimeout(() => {
            if (this.progress < 90) {
                this.updateProgress(90);
            }
        }, 1000);
    }

    updateProgress(percent) {
        this.progress = percent;
        if (this.progressFill) {
            this.progressFill.style.width = `${percent}%`;
        }

        if (percent >= 90) {
            setTimeout(() => this.completeLoading(), 300);
        }
    }

    completeLoading() {
        this.updateProgress(100);
        setTimeout(() => {
            if (this.progressBar) {
                this.progressBar.classList.remove('loading');
            }
            
            // Track en Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_loaded', {
                    event_category: 'performance',
                    event_label: 'full_load',
                    value: Math.round(performance.now())
                });
            }
        }, 500);
    }
}

// ===== ELIMINAR BOTÓN BLANCO =====
function fixWhiteButton() {
    const whiteButton = document.querySelector('.nav-toggle');
    if (whiteButton && window.innerWidth > 768) {
        whiteButton.style.display = 'none';
    }
}

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 ODAM - Inicializando sitio con todas las integraciones...');

    // Sistema de carga
    const loadingSystem = new LoadingSystem();
    loadingSystem.init();

    // Sistema de animaciones
    const animationSystem = new AnimationSystem();
    animationSystem.init();

    // Sistema de partículas
    const particlesSystem = new InteractiveParticles();
    particlesSystem.init();

    // Sistema de audio
    window.audioSystem = new AudioPlayerSystem();

    // Service Worker
    window.serviceWorkerManager = new ServiceWorkerManager();

    // Google Analytics
    window.gaManager = new GoogleAnalyticsManager();

    // Form Handler
    window.formHandler = new FormHandler();

    // PWA Manager
    window.pwaManager = new PWAManager();

    // CDN Manager
    window.cdnManager = new CDNManager();

    // Optimizar event listeners
    optimizeEventListeners();

    // Inicializar componentes
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    initBibleVerses();
    fixWhiteButton();

    // Lighthouse Config
    if (typeof LighthouseConfig !== 'undefined') {
        window.lighthouseAudit = new LighthouseConfig();
    }

    // Stats System
    if (typeof StatsSystem !== 'undefined') {
        window.statsSystem = new StatsSystem();
    }

    // Prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.fade-in').forEach(el => {
            el.style.transition = 'none';
            el.classList.add('show');
        });
    }

    console.log('🎵 ODAM - Sitio completamente inicializado con todas las integraciones');
});

// ===== PARTÍCULAS INTERACTIVAS (clase separada) =====
class InteractiveParticles {
    constructor() {
        this.particlesInstance = null;
        this.isMobile = window.innerWidth < 768;
    }

    init() {
        if (this.isMobile || typeof particlesJS === 'undefined') return;

        this.particlesInstance = particlesJS('particles-js', {
            particles: {
                number: { 
                    value: 40,
                    density: { 
                        enable: true, 
                        value_area: 800 
                    } 
                },
                color: { value: "#c8a25f" },
                shape: { type: "circle" },
                opacity: { 
                    value: 0.3,
                    random: true 
                },
                size: { 
                    value: 3,
                    random: true 
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#c8a25f",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { 
                        enable: true, 
                        mode: "grab" 
                    },
                    onclick: { 
                        enable: true, 
                        mode: "push" 
                    }
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.3
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
}

// ===== MANEJO DE ERRORES GLOBAL =====
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'javascript_error', {
            event_category: 'error',
            event_label: e.message,
            non_interaction: true
        });
    }
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rechazada:', e.reason);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'promise_rejection', {
            event_category: 'error',
            event_label: e.reason?.message || 'Unknown',
            non_interaction: true
        });
    }
});

// ===== OFFLINE DETECTION =====
window.addEventListener('online', () => {
    console.log('✅ Conexión restaurada');
    document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
    console.log('❌ Sin conexión');
    document.body.classList.add('offline');
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'offline_mode', {
            event_category: 'connection',
            event_label: 'offline'
        });
    }
});

// ===== EXPORTACIÓN PARA USO EXTERNO =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AudioPlayerSystem,
        ServiceWorkerManager,
        FormHandler,
        GoogleAnalyticsManager,
        PWAManager,
        CDNManager,
        AnimationSystem,
        LoadingSystem
    };
}

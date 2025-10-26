// script.js - ODAM PRODUCCIÓN MUSICAL - SISTEMA DE AUDIO CORREGIDO

class AudioPlayerSystem {
    constructor() {
        this.audioPlayers = new Map();
        this.currentlyPlaying = null;
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
            isPlaying: false,
            waveformInterval: null
        };

        this.audioPlayers.set(audioId, player);
        this.bindPlayerEvents(player, audioId);
    }

    bindPlayerEvents(player, audioId) {
        const { audio, playBtn, progressBar, audioTime, waveform, waveBars, audioPlayer } = player;

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

        // Animación de ondas mejorada
        const updateWaveform = () => {
            if (audio.paused || !waveBars.length) return;
            
            waveBars.forEach((bar, index) => {
                const baseHeight = [8, 16, 24, 28, 24, 16, 12, 8][index] || 12;
                const variation = Math.random() * 8;
                const height = baseHeight + variation;
                const opacity = 0.7 + Math.random() * 0.3;
                
                bar.style.height = `${height}px`;
                bar.style.opacity = opacity;
            });
        };

        // Iniciar animación de ondas
        const startWaveAnimation = () => {
            if (player.waveformInterval) {
                clearInterval(player.waveformInterval);
            }
            player.waveformInterval = setInterval(updateWaveform, 120);
        };

        // Detener animación de ondas
        const stopWaveAnimation = () => {
            if (player.waveformInterval) {
                clearInterval(player.waveformInterval);
                player.waveformInterval = null;
            }
            waveBars.forEach(bar => {
                bar.style.height = '';
                bar.style.opacity = '0.6';
            });
        };

        // Toggle reproducción - CORREGIDO
        const togglePlay = () => {
            // Si este audio ya está reproduciéndose, pausarlo
            if (player.isPlaying) {
                audio.pause();
                player.isPlaying = false;
                audioPlayer.classList.remove('playing');
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                stopWaveAnimation();
                this.currentlyPlaying = null;
                return;
            }

            // Pausar cualquier audio que se esté reproduciendo
            if (this.currentlyPlaying && this.currentlyPlaying !== audioId) {
                const previousPlayer = this.audioPlayers.get(this.currentlyPlaying);
                if (previousPlayer) {
                    previousPlayer.audio.pause();
                    previousPlayer.isPlaying = false;
                    previousPlayer.audioPlayer.classList.remove('playing');
                    previousPlayer.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    stopWaveAnimation.call(previousPlayer);
                }
            }

            // Reproducir este audio
            audio.play().then(() => {
                player.isPlaying = true;
                this.currentlyPlaying = audioId;
                audioPlayer.classList.add('playing');
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                startWaveAnimation();
                
                // Disparar evento para estadísticas
                document.dispatchEvent(new CustomEvent('audioPlay'));
                
            }).catch(error => {
                console.error('Error reproduciendo audio:', error);
                playBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                playBtn.style.color = '#ff6b6b';
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
            stopWaveAnimation();
            this.currentlyPlaying = null;
        });

        audio.addEventListener('loadedmetadata', () => {
            if (audioTime) audioTime.textContent = '0:00';
        });

        audio.addEventListener('error', (e) => {
            console.error(`Error en audio ${audioId}:`, e);
            playBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            playBtn.style.color = '#ff6b6b';
        });
    }

    setupGlobalEventListeners() {
        // Pausar todos los audios al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.audio-player-mini') && !e.target.closest('.audio-play-btn')) {
                this.pauseAll();
            }
        });

        // Pausar todos los audios al cambiar de sección
        window.addEventListener('scroll', () => {
            // Opcional: pausar al hacer scroll lejos del reproductor
        });
    }

    pauseAll() {
        this.audioPlayers.forEach((player, audioId) => {
            if (player.isPlaying) {
                player.audio.pause();
                player.isPlaying = false;
                player.audioPlayer.classList.remove('playing');
                player.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                
                // Detener animación de ondas
                if (player.waveformInterval) {
                    clearInterval(player.waveformInterval);
                    player.waveformInterval = null;
                }
                player.waveBars.forEach(bar => {
                    bar.style.height = '';
                    bar.style.opacity = '0.6';
                });
            }
        });
        this.currentlyPlaying = null;
    }
}

// === SISTEMA DE PARTÍCULAS INTERACTIVAS ===
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

// === SISTEMA DE ANIMACIONES ===
class AnimationSystem {
    constructor() {
        this.observer = null;
        this.animatedElements = new Set();
    }

    init() {
        this.setupIntersectionObserver();
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
}

// === OPTIMIZACIÓN DE EVENT LISTENERS ===
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
            }
        }
        
        // Delegación para modal de contacto
        if (e.target.classList.contains('open-contact-modal') || 
            e.target.closest('.open-contact-modal')) {
            e.preventDefault();
            const modal = document.getElementById('contact-modal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
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
        }
    });
}

// === VERSÍCULOS BÍBLICOS ===
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

// === FORMULARIO DE CONTACTO ===
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const modal = document.getElementById('contact-modal');

    if (!contactForm) return;

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        // Validar campos requeridos
        const requiredFields = contactForm.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#ff6b6b';
            } else {
                field.style.borderColor = '';
            }
        });
        
        if (!isValid) {
            alert('Por favor completa todos los campos obligatorios (*)');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        // Validar email
        const emailField = contactForm.querySelector('input[type="email"]');
        if (emailField && !isValidEmail(emailField.value)) {
            alert('Por favor ingresa un correo electrónico válido');
            emailField.focus();
            emailField.style.borderColor = '#ff6b6b';
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        // Obtener datos del formulario
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Construir email
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
        
        setTimeout(() => {
            window.location.href = mailtoLink;
            alert('¡Gracias! Se abrirá tu cliente de email para que envíes la solicitud.');
            
            setTimeout(() => {
                if (modal) modal.classList.remove('active');
                contactForm.reset();
                document.body.style.overflow = 'auto';
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }, 1000);
    });
}

// === MENÚ MÓVIL ===
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

// === SMOOTH SCROLL ===
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

                history.pushState(null, null, href);
            }
        });
    });
}

// === HEADER SCROLL EFFECT ===
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

// === LOADING SYSTEM ===
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
        }, 500);
    }
}

// === ELIMINAR BOTÓN BLANCO ===
function fixWhiteButton() {
    const whiteButton = document.querySelector('.nav-toggle');
    if (whiteButton && window.innerWidth > 768) {
        whiteButton.style.display = 'none';
    }
}

// === INICIALIZACIÓN PRINCIPAL ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 ODAM - Inicializando sitio...');

    // Sistema de carga
    const loadingSystem = new LoadingSystem();
    loadingSystem.init();

    // Sistema de animaciones
    const animationSystem = new AnimationSystem();
    animationSystem.init();

    // Sistema de partículas
    const particlesSystem = new InteractiveParticles();
    particlesSystem.init();

    // Sistema de audio - NUEVO Y MEJORADO
    window.audioSystem = new AudioPlayerSystem();

    // Optimizar event listeners
    optimizeEventListeners();

    // Inicializar componentes
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    initBibleVerses();
    initContactForm();
    fixWhiteButton();

    // Prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.fade-in').forEach(el => {
            el.style.transition = 'none';
            el.classList.add('show');
        });
    }

    console.log('🎵 ODAM - Sitio inicializado correctamente');
});

// === MANEJO DE ERRORES GLOBAL ===
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rechazada:', e.reason);
});

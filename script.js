// script.js - OPTIMIZADO PARA RENDIMIENTO

// === NUEVAS OPTIMIZACIONES DE PERFORMANCE ===

// Cargar recursos críticos primero
function loadCriticalResources() {
  // Preload de imágenes críticas
  const criticalImages = ['./logo.jpg', './tu-foto.jpg'];
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

// Optimizar event listeners
function optimizeEventListeners() {
  // Usar event delegation para mejor performance
  document.addEventListener('click', function(e) {
    // Delegación para acordeón
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
    
    // Delegación para modal
    if (e.target.classList.contains('open-contact-modal')) {
      const modal = document.getElementById('contact-modal');
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    
    if (e.target.classList.contains('modal-close')) {
      const modal = document.getElementById('contact-modal');
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
}

// === MANTENER TODO EL CÓDIGO EXISTENTE FUNCIONAL ===

document.addEventListener('DOMContentLoaded', function() {
  // Cargar recursos críticos
  loadCriticalResources();
  
  // Optimizar event listeners
  optimizeEventListeners();

  // 1. Menú móvil funcional
  const toggle = document.getElementById('site-nav-toggle');
  const nav = document.getElementById('site-nav');
  
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
      document.body.style.overflow = expanded ? 'auto' : 'hidden';
    });

    // Cerrar menú al hacer clic fuera (optimizado)
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // 2. Keyboard support para menú
  if(toggle){
    toggle.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        this.click();
      }
    });
  }

  // 3. Smooth scroll mejorado
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    });
  });

  // 4. Intersection Observer para animaciones (optimizado)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        // Dejar de observar después de la animación
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // 5. Optimización partículas para móviles (mejorado)
  if (typeof particlesJS !== 'undefined') {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) { // Solo cargar partículas en desktop
      particlesJS('particles-js', {
        particles: {
          number: { 
            value: 30, 
            density: { enable: true, value_area: 800 } 
          },
          color: { value: "#c8a25f" },
          shape: { type: "circle" },
          opacity: { value: 0.3, random: true },
          size: { value: 3, random: true },
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
            onhover: { enable: true, mode: "grab" },
            onclick: { enable: true, mode: "push" },
            resize: true
          }
        }
      });
    }
  }

  // 6. Header scroll effect (optimizado con throttling)
  let lastScroll = 0;
  const header = document.querySelector('header');
  
  function handleScroll() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }
  
  // Throttle del scroll para mejor performance
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
      }, 10);
    }
  });

  // 7. Prefers reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced){
    document.querySelectorAll('.fade-in').forEach(el => el.classList.add('show'));
  }

  // ===== FORMULARIO DE CONTACTO MODAL =====
  const modal = document.getElementById('contact-modal');
  const contactForm = document.getElementById('contact-form');

  // Cerrar modal al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  // Cerrar modal con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  // Envío del formulario
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
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
      return;
    }
    
    // Obtener datos del formulario
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Construir el cuerpo del email
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

    // Codificar para mailto
    const mailtoLink = `mailto:odeam@osklindealba.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Abrir cliente de email
    window.location.href = mailtoLink;
    
    // Mostrar mensaje de confirmación
    alert('¡Gracias! Se abrirá tu cliente de email para que envíes la solicitud. Por favor completa el envío del correo.');
    
    // Cerrar modal después de un tiempo
    setTimeout(() => {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
      contactForm.reset();
    }, 2000);
  });

  // ===== VERSÍCULOS BÍBLICOS ALEATORIOS =====
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
    },
    {
      text: "La paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones.",
      reference: "Filipenses 4:7"
    },
    {
      text: "Yo soy el camino, la verdad y la vida; nadie viene al Padre, sino por mí.",
      reference: "Juan 14:6"
    },
    {
      text: "Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.",
      reference: "Jeremías 33:3"
    },
    {
      text: "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.",
      reference: "Isaías 40:31"
    },
    {
      text: "El Señor es mi pastor; nada me faltará.",
      reference: "Salmos 23:1"
    }
  ];

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
      bibleVerseElement.innerHTML = `
        <span class="verse-text">${verse.text}</span>
        <br>
        <span class="verse-reference">${verse.reference}</span>
      `;
    }
  }

  // Mostrar versículo aleatorio al cargar la página
  displayVerse();

  // Cambiar versículo al hacer hover (desktop) o touch (móvil)
  if (bibleVerseElement) {
    // Para desktop - hover
    bibleVerseElement.addEventListener('mouseenter', function() {
      displayVerse();
    });

    // Para móvil - touch
    bibleVerseElement.addEventListener('touchstart', function(e) {
      e.preventDefault();
      displayVerse();
    });

    // También cambiar al hacer click
    bibleVerseElement.addEventListener('click', function() {
      displayVerse();
    });
  }

  // Cambiar versículo cada 30 segundos automáticamente
  setInterval(displayVerse, 30000);

  console.log('🎵 ODAM - Sitio optimizado cargado correctamente');
});

// Service Worker para caching (opcional futuro)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    // Esto se puede implementar en el futuro para PWA
    console.log('Service Worker listo para implementar');
  });
}

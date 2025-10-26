// =============================================
// ODAM Producción Musical - Lighthouse Configuration
// Performance, SEO, Accessibility & Best Practices
// Version: 1.0.0
// =============================================

class LighthouseConfig {
    constructor() {
        this.config = {
            extends: 'lighthouse:default',
            settings: {
                emulatedFormFactor: 'desktop',
                throttling: this.getThrottlingConfig(),
                audits: this.getAuditsConfig(),
                categories: this.getCategoriesConfig(),
                onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
                skipAudits: ['redirects-http'],
            },
            passes: [{
                passName: 'defaultPass',
                gatherers: this.getGatherers(),
                recordTrace: true,
                useThrottling: true,
                pauseAfterLoadMs: 5000,
                networkQuietThresholdMs: 3000,
                cpuQuietThresholdMs: 3000,
            }],
            audits: this.getCustomAudits(),
            groups: this.getGroupsConfig(),
        };
        
        this.metrics = {
            performance: {},
            accessibility: {},
            seo: {},
            bestPractices: {}
        };
        
        this.init();
    }

    init() {
        console.log('⚡ Lighthouse Config: Inicializando métricas de performance');
        this.setupPerformanceMonitoring();
        this.setupCoreWebVitals();
        this.setupCDNOptimizations();
    }

    // ===== CONFIGURACIÓN DE THROTTLING =====
    getThrottlingConfig() {
        return {
            rttMs: 40,
            throughputKbps: 10 * 1024,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
        };
    }

    // ===== CONFIGURACIÓN DE AUDITORÍAS =====
    getAuditsConfig() {
        return [
            'first-contentful-paint',
            'largest-contentful-paint',
            'first-meaningful-paint',
            'speed-index',
            'total-blocking-time',
            'cumulative-layout-shift',
            'interactive',
            'max-potential-fid',
            'server-response-time',
            'render-blocking-resources',
            'uses-responsive-images',
            'offscreen-images',
            'unminified-css',
            'unminified-javascript',
            'unused-css-rules',
            'unused-javascript',
            'modern-image-formats',
            'uses-optimized-images',
            'uses-text-compression',
            'uses-long-cache-ttl',
            'dom-size',
            'efficient-animated-content',
            'duplicated-javascript',
            'legacy-javascript',
            'preload-lcp-image',
            'third-party-summary',
            'third-party-facades'
        ];
    }

    // ===== CONFIGURACIÓN DE CATEGORÍAS =====
    getCategoriesConfig() {
        return {
            performance: {
                title: 'Performance',
                description: 'Métricas de rendimiento y velocidad de carga',
                auditRefs: [
                    { id: 'first-contentful-paint', weight: 10, group: 'metrics' },
                    { id: 'largest-contentful-paint', weight: 25, group: 'metrics' },
                    { id: 'speed-index', weight: 10, group: 'metrics' },
                    { id: 'cumulative-layout-shift', weight: 25, group: 'metrics' },
                    { id: 'total-blocking-time', weight: 30, group: 'metrics' },
                    { id: 'interactive', weight: 10, group: 'metrics' },
                    { id: 'render-blocking-resources', weight: 5, group: 'load-opportunities' },
                    { id: 'uses-responsive-images', weight: 5, group: 'load-opportunities' },
                    { id: 'offscreen-images', weight: 5, group: 'load-opportunities' },
                    { id: 'unminified-css', weight: 2, group: 'load-opportunities' },
                    { id: 'unminified-javascript', weight: 2, group: 'load-opportunities' },
                    { id: 'unused-css-rules', weight: 2, group: 'load-opportunities' },
                    { id: 'unused-javascript', weight: 2, group: 'load-opportunities' },
                    { id: 'modern-image-formats', weight: 3, group: 'load-opportunities' },
                    { id: 'uses-optimized-images', weight: 3, group: 'load-opportunities' },
                    { id: 'uses-text-compression', weight: 3, group: 'load-opportunities' },
                    { id: 'uses-long-cache-ttl', weight: 3, group: 'load-opportunities' },
                    { id: 'dom-size', weight: 3, group: 'load-opportunities' },
                    { id: 'efficient-animated-content', weight: 2, group: 'load-opportunities' },
                    { id: 'duplicated-javascript', weight: 2, group: 'load-opportunities' },
                    { id: 'legacy-javascript', weight: 2, group: 'load-opportunities' },
                    { id: 'preload-lcp-image', weight: 5, group: 'load-opportunities' },
                    { id: 'third-party-summary', weight: 5, group: 'load-opportunities' }
                ]
            },
            accessibility: {
                title: 'Accessibility',
                description: 'Accesibilidad y compatibilidad con diferentes usuarios',
                auditRefs: [
                    { id: 'aria-allowed-attr', weight: 5 },
                    { id: 'aria-command-name', weight: 3 },
                    { id: 'aria-hidden-body', weight: 5 },
                    { id: 'aria-hidden-focus', weight: 5 },
                    { id: 'aria-input-field-name', weight: 5 },
                    { id: 'aria-meter-name', weight: 3 },
                    { id: 'aria-progressbar-name', weight: 3 },
                    { id: 'aria-required-attr', weight: 5 },
                    { id: 'aria-required-children', weight: 5 },
                    { id: 'aria-required-parent', weight: 5 },
                    { id: 'aria-roles', weight: 5 },
                    { id: 'aria-toggle-field-name', weight: 5 },
                    { id: 'aria-tooltip-name', weight: 3 },
                    { id: 'aria-treeitem-name', weight: 3 },
                    { id: 'button-name', weight: 10 },
                    { id: 'bypass', weight: 5 },
                    { id: 'color-contrast', weight: 10 },
                    { id: 'definition-list', weight: 3 },
                    { id: 'dlitem', weight: 3 },
                    { id: 'document-title', weight: 5 },
                    { id: 'duplicate-id-active', weight: 5 },
                    { id: 'duplicate-id-aria', weight: 5 },
                    { id: 'form-field-multiple-labels', weight: 3 },
                    { id: 'frame-title', weight: 5 },
                    { id: 'html-has-lang', weight: 5 },
                    { id: 'html-lang-valid', weight: 5 },
                    { id: 'image-alt', weight: 10 },
                    { id: 'input-image-alt', weight: 5 },
                    { id: 'label', weight: 10 },
                    { id: 'link-name', weight: 10 },
                    { id: 'list', weight: 5 },
                    { id: 'listitem', weight: 5 },
                    { id: 'meta-refresh', weight: 5 },
                    { id: 'meta-viewport', weight: 5 },
                    { id: 'object-alt', weight: 3 },
                    { id: 'tabindex', weight: 5 },
                    { id: 'td-headers-attr', weight: 3 },
                    { id: 'th-has-data-cells', weight: 3 },
                    { id: 'valid-lang', weight: 5 },
                    { id: 'video-caption', weight: 5 }
                ]
            },
            'best-practices': {
                title: 'Best Practices',
                description: 'Prácticas recomendadas para desarrollo web moderno',
                auditRefs: [
                    { id: 'appcache-manifest', weight: 1 },
                    { id: 'errors-in-console', weight: 5 },
                    { id: 'image-aspect-ratio', weight: 1 },
                    { id: 'image-size-responsive', weight: 1 },
                    { id: 'no-document-write', weight: 1 },
                    { id: 'no-vulnerable-libraries', weight: 5 },
                    { id: 'notification-on-start', weight: 1 },
                    { id: 'password-inputs-can-be-pasted-into', weight: 1 },
                    { id: 'uses-http2', weight: 5 },
                    { id: 'uses-passive-event-listeners', weight: 1 },
                    { id: 'meta-description', weight: 1 },
                    { id: 'http-status-code', weight: 1 },
                    { id: 'font-size', weight: 1 },
                    { id: 'link-text', weight: 1 },
                    { id: 'crawlable-anchors', weight: 1 },
                    { id: 'is-crawlable', weight: 1 },
                    { id: 'robots-txt', weight: 1 },
                    { id: 'tap-targets', weight: 1 },
                    { id: 'hreflang', weight: 1 },
                    { id: 'plugins', weight: 1 },
                    { id: 'canonical', weight: 1 },
                    { id: 'structured-data', weight: 1 }
                ]
            },
            seo: {
                title: 'SEO',
                description: 'Optimización para motores de búsqueda',
                auditRefs: [
                    { id: 'viewport', weight: 5 },
                    { id: 'document-title', weight: 5 },
                    { id: 'meta-description', weight: 5 },
                    { id: 'http-status-code', weight: 5 },
                    { id: 'link-text', weight: 5 },
                    { id: 'crawlable-anchors', weight: 5 },
                    { id: 'is-crawlable', weight: 5 },
                    { id: 'robots-txt', weight: 5 },
                    { id: 'image-alt', weight: 5 },
                    { id: 'hreflang', weight: 5 },
                    { id: 'canonical', weight: 5 },
                    { id: 'font-size', weight: 5 },
                    { id: 'plugins', weight: 5 },
                    { id: 'tap-targets', weight: 5 },
                    { id: 'structured-data', weight: 10 }
                ]
            }
        };
    }

    // ===== GATHERERS PERSONALIZADOS =====
    getGatherers() {
        return [
            'css-usage',
            'js-usage',
            'viewport-dimensions',
            'runtime-exceptions',
            'console-messages',
            'anchor-elements',
            'image-elements',
            'link-elements',
            'meta-elements',
            'script-elements',
            'iframe-elements',
            'form-elements',
            'main-document-content',
            'global-listeners',
            'dobetterweb/response-compression',
            'dobetterweb/tags-blocking-first-paint',
            'seo/font-size',
            'seo/robots-txt',
            'seo/tap-targets',
            'accessibility/aria-allowed-attr',
            'accessibility/aria-required-attr',
            'accessibility/color-contrast'
        ];
    }

    // ===== AUDITORÍAS PERSONALIZADAS PARA ODAM =====
    getCustomAudits() {
        return [
            {
                id: 'odam-audio-performance',
                title: 'Los archivos de audio están optimizados para web',
                description: 'Los archivos de audio MP3 deben estar comprimidos y usar preload adecuado',
                failureTitle: 'Los archivos de audio no están optimizados',
                failureDescription: 'Optimiza los archivos de audio para mejor performance de carga',
                requiredArtifacts: ['AudioElements'],
                score: {
                    rawValue: 1,
                    score: 1
                }
            },
            {
                id: 'odam-cdn-assets',
                title: 'Los assets estáticos usan CDN',
                description: 'Imágenes, CSS y JS deben servirse desde CDN para mejor performance',
                failureTitle: 'Assets no están en CDN',
                failureDescription: 'Configura CDN para assets estáticos',
                requiredArtifacts: ['LinkElements', 'ScriptElements', 'ImageElements'],
                score: {
                    rawValue: 1,
                    score: 1
                }
            },
            {
                id: 'odam-service-worker',
                title: 'Service Worker está configurado correctamente',
                description: 'El Service Worker debe estar registrado y cacheando recursos críticos',
                failureTitle: 'Service Worker no configurado',
                failureDescription: 'Implementa Service Worker para caching offline',
                requiredArtifacts: ['ServiceWorker'],
                score: {
                    rawValue: 1,
                    score: 1
                }
            },
            {
                id: 'odam-pwa-features',
                title: 'Características PWA implementadas',
                description: 'Manifest, icons y meta tags para PWA',
                failureTitle: 'Faltan características PWA',
                failureDescription: 'Implementa todas las características PWA requeridas',
                requiredArtifacts: ['MetaElements', 'LinkElements'],
                score: {
                    rawValue: 1,
                    score: 1
                }
            }
        ];
    }

    // ===== CONFIGURACIÓN DE GRUPOS =====
    getGroupsConfig() {
        return {
            'metrics': {
                title: 'Métricas de Performance'
            },
            'load-opportunities': {
                title: 'Oportunidades de Mejora'
            },
            'budgets': {
                title: 'Presupuestos de Performance'
            },
            'diagnostics': {
                title: 'Diagnósticos'
            },
            'pwa-install': {
                title: 'Instalación PWA'
            },
            'pwa-optimized': {
                title: 'PWA Optimizado'
            },
            'a11y-color-contrast': {
                title: 'Contraste de Color'
            },
            'a11y-names-labels': {
                title: 'Nombres y Etiquetas'
            },
            'a11y-navigation': {
                title: 'Navegación'
            },
            'a11y-aria': {
                title: 'Atributos ARIA'
            },
            'a11y-language': {
                title: 'Idioma'
            },
            'a11y-audio-video': {
                title: 'Audio y Video'
            },
            'a11y-tables-lists': {
                title: 'Tablas y Listas'
            },
            'seo-content': {
                title: 'Contenido SEO'
            },
            'seo-crawl': {
                title: 'Rastreo SEO'
            },
            'seo-mobile': {
                title: 'SEO Móvil'
            }
        };
    }

    // ===== MONITOREO DE PERFORMANCE EN TIEMPO REAL =====
    setupPerformanceMonitoring() {
        if ('performance' in window) {
            // Monitorear Core Web Vitals
            this.monitorLCP();
            this.monitorFID();
            this.monitorCLS();
            this.monitorFCP();
            
            // Monitorear métricas personalizadas ODAM
            this.monitorAudioPerformance();
            this.monitorCDNPerformance();
            this.monitorServiceWorker();
        }
    }

    // ===== CORE WEB VITALS =====
    monitorLCP() {
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            this.metrics.performance.lcp = lastEntry.renderTime || lastEntry.loadTime;
            console.log('⚡ LCP:', this.metrics.performance.lcp);
            
            this.sendToAnalytics('lcp', this.metrics.performance.lcp);
        });
        
        observer.observe({entryTypes: ['largest-contentful-paint']});
    }

    monitorFID() {
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                this.metrics.performance.fid = entry.processingStart - entry.startTime;
                console.log('⚡ FID:', this.metrics.performance.fid);
                
                this.sendToAnalytics('fid', this.metrics.performance.fid);
            });
        });
        
        observer.observe({entryTypes: ['first-input']});
    }

    monitorCLS() {
        let clsValue = 0;
        let sessionValue = 0;
        
        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    sessionValue += entry.value;
                }
            }
            
            this.metrics.performance.cls = sessionValue;
            console.log('⚡ CLS:', this.metrics.performance.cls);
            
            this.sendToAnalytics('cls', this.metrics.performance.cls);
        });
        
        observer.observe({entryTypes: ['layout-shift']});
    }

    monitorFCP() {
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const firstPaint = entries[0];
            
            this.metrics.performance.fcp = firstPaint.startTime;
            console.log('⚡ FCP:', this.metrics.performance.fcp);
            
            this.sendToAnalytics('fcp', this.metrics.performance.fcp);
        });
        
        observer.observe({entryTypes: ['paint']});
    }

    // ===== MÉTRICAS PERSONALIZADAS ODAM =====
    monitorAudioPerformance() {
        const audioElements = document.querySelectorAll('audio');
        let totalLoadTime = 0;
        let loadedCount = 0;
        
        audioElements.forEach(audio => {
            const startTime = performance.now();
            
            audio.addEventListener('loadeddata', () => {
                const loadTime = performance.now() - startTime;
                totalLoadTime += loadTime;
                loadedCount++;
                
                const avgLoadTime = totalLoadTime / loadedCount;
                this.metrics.performance.audioLoadTime = avgLoadTime;
                
                console.log('🎵 Audio Load Time:', avgLoadTime);
                this.sendToAnalytics('audio_load_time', avgLoadTime);
            });
        });
    }

    monitorCDNPerformance() {
        // Verificar carga desde CDN
        const resources = performance.getEntriesByType('resource');
        let cdnResources = 0;
        let totalResources = 0;
        
        resources.forEach(resource => {
            totalResources++;
            if (resource.name.includes('cdn.osklindealba.com')) {
                cdnResources++;
            }
        });
        
        const cdnPercentage = (cdnResources / totalResources) * 100;
        this.metrics.performance.cdnUsage = cdnPercentage;
        
        console.log('🌐 CDN Usage:', cdnPercentage + '%');
        this.sendToAnalytics('cdn_usage', cdnPercentage);
    }

    monitorServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                this.metrics.performance.serviceWorker = true;
                console.log('🔧 Service Worker: Activo');
                this.sendToAnalytics('service_worker', 1);
            }).catch(() => {
                this.metrics.performance.serviceWorker = false;
                this.sendToAnalytics('service_worker', 0);
            });
        }
    }

    // ===== SETUP CORE WEB VITALS =====
    setupCoreWebVitals() {
        // Inyectar script de Core Web Vitals
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/web-vitals@2.1.4/dist/web-vitals.attribution.iife.js';
        script.onload = () => {
            this.initializeWebVitals();
        };
        document.head.appendChild(script);
    }

    initializeWebVitals() {
        if (typeof webVitals !== 'undefined') {
            webVitals.getCLS(this.sendToAnalytics.bind(this, 'cls'));
            webVitals.getFID(this.sendToAnalytics.bind(this, 'fid'));
            webVitals.getLCP(this.sendToAnalytics.bind(this, 'lcp'));
            webVitals.getFCP(this.sendToAnalytics.bind(this, 'fcp'));
            webVitals.getTTFB(this.sendToAnalytics.bind(this, 'ttfb'));
        }
    }

    // ===== OPTIMIZACIONES CDN =====
    setupCDNOptimizations() {
        // Preconectar a CDNs críticas
        this.preconnectCDN('https://cdn.osklindealba.com');
        this.preconnectCDN('https://fonts.googleapis.com');
        this.preconnectCDN('https://fonts.gstatic.com');
        this.preconnectCDN('https://cdnjs.cloudflare.com');
        
        // Precargar recursos críticos
        this.preloadCriticalResources();
    }

    preconnectCDN(url) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    preloadCriticalResources() {
        const criticalResources = [
            '/styles.css',
            '/script.js',
            '/logo.jpg',
            '/tu-foto.jpg'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            
            if (resource.endsWith('.css')) {
                link.as = 'style';
            } else if (resource.endsWith('.js')) {
                link.as = 'script';
            } else if (resource.endsWith('.jpg') || resource.endsWith('.png')) {
                link.as = 'image';
            }
            
            document.head.appendChild(link);
        });
    }

    // ===== ANALYTICS INTEGRATION =====
    sendToAnalytics(metricName, value) {
        // Enviar a Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'core_web_vital', {
                event_category: 'Web Vitals',
                event_label: metricName,
                value: Math.round(value),
                non_interaction: true
            });
        }
        
        // Enviar a sistema de estadísticas interno
        if (window.statsSystem) {
            window.statsSystem.trackEvent('performance_metric', 'lighthouse', metricName, value);
        }
        
        // Guardar en localStorage para reportes
        this.saveMetric(metricName, value);
    }

    saveMetric(metricName, value) {
        const metrics = JSON.parse(localStorage.getItem('odam-lighthouse-metrics') || '{}');
        metrics[metricName] = {
            value: value,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('odam-lighthouse-metrics', JSON.stringify(metrics));
    }

    // ===== REPORTES Y EXPORTACIÓN =====
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            metrics: this.metrics,
            performanceScore: this.calculatePerformanceScore(),
            accessibilityScore: this.calculateAccessibilityScore(),
            seoScore: this.calculateSEOScore(),
            bestPracticesScore: this.calculateBestPracticesScore(),
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    calculatePerformanceScore() {
        const weights = {
            lcp: 0.25,
            fid: 0.25,
            cls: 0.25,
            fcp: 0.15,
            audioLoadTime: 0.10
        };
        
        let score = 0;
        Object.keys(weights).forEach(metric => {
            if (this.metrics.performance[metric]) {
                score += this.normalizeMetric(metric, this.metrics.performance[metric]) * weights[metric];
            }
        });
        
        return Math.round(score * 100);
    }

    calculateAccessibilityScore() {
        // Simular score de accesibilidad basado en características implementadas
        let score = 100;
        
        // Verificar características críticas
        if (!document.documentElement.hasAttribute('lang')) score -= 10;
        if (document.querySelector('img:not([alt])')) score -= 15;
        if (!document.querySelector('meta[name="viewport"]')) score -= 10;
        if (document.querySelector('button:not([aria-label])')) score -= 10;
        
        return Math.max(0, score);
    }

    calculateSEOScore() {
        let score = 100;
        
        // Verificar elementos SEO críticos
        if (!document.querySelector('title')) score -= 20;
        if (!document.querySelector('meta[name="description"]')) score -= 15;
        if (!document.querySelector('meta[property="og:title"]')) score -= 10;
        if (!document.querySelector('link[rel="canonical"]')) score -= 10;
        if (!document.querySelector('script[type="application/ld+json"]')) score -= 15;
        
        return Math.max(0, score);
    }

    calculateBestPracticesScore() {
        let score = 100;
        
        // Verificar mejores prácticas
        if (document.querySelector('script[src*="http:"]')) score -= 10; // Mixed content
        if (!document.querySelector('link[rel="manifest"]')) score -= 10; // PWA manifest
        if (document.querySelector('console-messages')) score -= 5; // Console errors
        
        return Math.max(0, score);
    }

    normalizeMetric(metric, value) {
        const thresholds = {
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 },
            fcp: { good: 1000, poor: 3000 },
            audioLoadTime: { good: 1000, poor: 5000 }
        };
        
        const threshold = thresholds[metric];
        if (!threshold) return 1;
        
        if (value <= threshold.good) return 1;
        if (value >= threshold.poor) return 0;
        
        // Interpolación lineal entre good y poor
        return 1 - ((value - threshold.good) / (threshold.poor - threshold.good));
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Recomendaciones basadas en métricas
        if (this.metrics.performance.lcp > 2500) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'Optimizar Largest Contentful Paint',
                description: 'El LCP está por encima del umbral recomendado. Considera optimizar imágenes y reducir JavaScript bloqueante.',
                action: 'Usa imágenes WebP, implementa lazy loading y optimiza el CSS crítico.'
            });
        }
        
        if (this.metrics.performance.cls > 0.1) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'Reducir Cumulative Layout Shift',
                description: 'El CLS está afectando la experiencia de usuario. Los elementos se mueven durante la carga.',
                action: 'Define dimensiones explícitas para imágenes y reserva espacio para elementos dinámicos.'
            });
        }
        
        if (!this.metrics.performance.serviceWorker) {
            recommendations.push({
                category: 'pwa',
                priority: 'medium',
                title: 'Implementar Service Worker',
                description: 'El Service Worker no está activo. Esto afecta el caching offline y la performance.',
                action: 'Registra el Service Worker y configura estrategias de caching apropiadas.'
            });
        }
        
        return recommendations;
    }

    // ===== EXPORTACIÓN PARA USO EXTERNO =====
    exportConfig() {
        return {
            lighthouseConfig: this.config,
            currentMetrics: this.metrics,
            report: this.generateReport(),
            version: '1.0.0'
        };
    }

    // ===== MÉTODOS ESTÁTICOS PARA USO RÁPIDO =====
    static runQuickAudit() {
        const instance = new LighthouseConfig();
        return instance.generateReport();
    }

    static getPerformanceScore() {
        const instance = new LighthouseConfig();
        return instance.calculatePerformanceScore();
    }

    static getRecommendations() {
        const instance = new LighthouseConfig();
        return instance.generateRecommendations();
    }
}

// ===== INICIALIZACIÓN AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    window.LighthouseConfig = LighthouseConfig;
    window.lighthouseAudit = new LighthouseConfig();
    
    console.log('⚡ Lighthouse Config: Inicializado correctamente');
    console.log('📊 Métricas disponibles:', window.lighthouseAudit.metrics);
});

// ===== EXPORTACIÓN PARA MÓDULOS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LighthouseConfig;
}

// ===== POLYFILLS PARA NAVEGADORES ANTIGUOS =====
if (!window.PerformanceObserver) {
    console.warn('⚠️ PerformanceObserver no soportado - algunas métricas no estarán disponibles');
}

if (!window.LargestContentfulPaint) {
    console.warn('⚠️ LargestContentfulPaint no soportado - LCP no estará disponible');
}

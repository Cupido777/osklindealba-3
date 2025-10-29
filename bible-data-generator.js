// bible-data-generator.js - Generador de base de datos bíblica completa
class BibleDataGenerator {
    constructor() {
        this.books = this.getBibleStructure();
        this.verseCount = 0;
    }

    getBibleStructure() {
        return {
            "Génesis": 50, "Éxodo": 40, "Levítico": 27, "Números": 36, "Deuteronomio": 34,
            "Josué": 24, "Jueces": 21, "Rut": 4, "1 Samuel": 31, "2 Samuel": 24,
            "1 Reyes": 22, "2 Reyes": 25, "1 Crónicas": 29, "2 Crónicas": 36, "Esdras": 10,
            "Nehemías": 13, "Ester": 10, "Job": 42, "Salmos": 150, "Proverbios": 31,
            "Eclesiastés": 12, "Cantares": 8, "Isaías": 66, "Jeremías": 52, "Lamentaciones": 5,
            "Ezequiel": 48, "Daniel": 12, "Oseas": 14, "Joel": 3, "Amós": 9,
            "Abdías": 1, "Jonás": 4, "Miqueas": 7, "Nahúm": 3, "Habacuc": 3,
            "Sofonías": 3, "Hageo": 2, "Zacarías": 14, "Malaquías": 4,
            "Mateo": 28, "Marcos": 16, "Lucas": 24, "Juan": 21, "Hechos": 28,
            "Romanos": 16, "1 Corintios": 16, "2 Corintios": 13, "Gálatas": 6,
            "Efesios": 6, "Filipenses": 4, "Colosenses": 4, "1 Tesalonicenses": 5,
            "2 Tesalonicenses": 3, "1 Timoteo": 6, "2 Timoteo": 4, "Tito": 3,
            "Filemón": 1, "Hebreos": 13, "Santiago": 5, "1 Pedro": 5, "2 Pedro": 3,
            "1 Juan": 5, "2 Juan": 1, "3 Juan": 1, "Judas": 1, "Apocalipsis": 22
        };
    }

    generateSampleVerses(count = 31102) {
        const verses = [];
        let generated = 0;
        
        for (const [book, chapters] of Object.entries(this.books)) {
            for (let chapter = 1; chapter <= chapters; chapter++) {
                // Generar entre 10-50 versículos por capítulo (similar a la Biblia real)
                const versesInChapter = Math.floor(Math.random() * 41) + 10;
                
                for (let verse = 1; verse <= versesInChapter; verse++) {
                    if (generated >= count) break;
                    
                    verses.push({
                        book: book,
                        chapter: chapter,
                        verse: verse,
                        text: this.generateVerseText(book, chapter, verse)
                    });
                    generated++;
                }
                if (generated >= count) break;
            }
            if (generated >= count) break;
        }
        
        this.verseCount = verses.length;
        return verses;
    }

    generateVerseText(book, chapter, verse) {
        // Textos bíblicos genéricos que representan la estructura real
        const templates = [
            `Y habló Jehová a ${book} en el capítulo ${chapter}, versículo ${verse}, diciendo:`,
            `En ${book} ${chapter}:${verse} está escrito para nuestra enseñanza.`,
            `La palabra del Señor en ${book} capítulo ${chapter} versículo ${verse}.`,
            `Como dice la Escritura en ${book} ${chapter}:${verse}, "bendito el que confía en el Señor".`,
            `En el libro de ${book}, capítulo ${chapter}, versículo ${verse}, encontramos sabiduría.`,
            `La promesa divina se revela en ${book} ${chapter}:${verse} para los creyentes.`,
            `${book} ${chapter}:${verse} nos enseña sobre el amor y la misericordia de Dios.`,
            `La verdad eterna se manifiesta en ${book} capítulo ${chapter} versículo ${verse}.`,
            `En ${book} ${chapter}:${verse} descubrimos el camino de la salvación.`,
            `La luz de la palabra brilla en ${book} ${chapter}:${verse} para guiarnos.`
        ];
        
        return templates[Math.floor(Math.random() * templates.length)];
    }

    async saveToFile(verses, filename = 'bible-data.json') {
        const data = JSON.stringify(verses, null, 2);
        
        // En un entorno de navegador, ofrecemos descarga
        if (typeof window !== 'undefined') {
            this.downloadJSON(data, filename);
        } else {
            // En Node.js
            const fs = require('fs');
            fs.writeFileSync(filename, data);
            console.log(`✅ Archivo ${filename} generado con ${verses.length} versículos`);
        }
    }

    downloadJSON(data, filename) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Uso en el navegador
if (typeof window !== 'undefined') {
    window.generateBibleData = function() {
        const generator = new BibleDataGenerator();
        const verses = generator.generateSampleVerses(31102);
        generator.saveToFile(verses, 'bible-data-complete.json');
        alert(`✅ Base de datos generada con ${verses.length} versículos`);
    };
}

// Para usar en Node.js: node bible-data-generator.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BibleDataGenerator;
    
    // Ejecutar si es el archivo principal
    if (require.main === module) {
        const generator = new BibleDataGenerator();
        const verses = generator.generateSampleVerses(31102);
        generator.saveToFile(verses);
    }
}

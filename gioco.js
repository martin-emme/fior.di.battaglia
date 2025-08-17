class PlanciaEsagonale {
    constructor(rows = 14, cols = 19) {
        this.rows = rows;
        this.cols = cols;
        this.hexSize = 6; // 6mm
        this.spacing = 1; // 1mm
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        
        this.turno = 1; // 1 o 2
        this.pedinaAttiva = null;
        this.posizioneAttuale = null;
        this.posizioneIniziale = null;
        this.faseTurno = 'movimento'; // 'movimento' o 'combattimento'
        this.pedineAttaccanti = new Set(); // Set per tenere traccia delle pedine che hanno già attaccato
        this.rotazionePlancia = 0; // Rotazione in gradi (0, 90, 180, 270)
        
        // Sistema Audio
        this.audioFiles = [];
        this.currentAudioIndex = 0;
        this.audioPlayer = null;
        this.isAudioMuted = false; // Inizia con l'audio attivo
        
        this.init();
        
        // Tentativo immediato di autoplay
        setTimeout(() => {
            this.centerBoard();
            // Tentativo finale di autoplay dopo l'inizializzazione completa
            if (this.audioPlayer && this.isAudioMuted === false) {
                this.audioPlayer.play().then(() => {
                    console.log('Audio avviato dopo inizializzazione completa');
                }).catch(e => {
                    console.log('Autoplay fallito anche dopo inizializzazione:', e);
                });
            }
        }, 50);
        
        // Tentativo aggiuntivo di autoplay dopo un delay più lungo
        setTimeout(() => {
            if (this.audioPlayer && this.isAudioMuted === false) {
                this.audioPlayer.play().then(() => {
                    console.log('Audio avviato con delay aggiuntivo');
                }).catch(e => {
                    console.log('Autoplay fallito anche con delay aggiuntivo:', e);
                });
            }
        }, 500);
        
        // Tentativo con delay ancora più lungo
        setTimeout(() => {
            if (this.audioPlayer && this.isAudioMuted === false) {
                this.audioPlayer.play().then(() => {
                    console.log('Audio avviato con delay lungo');
                }).catch(e => {
                    console.log('Autoplay fallito anche con delay lungo:', e);
                });
            }
        }, 2000);
        
        // Event listener per il caricamento completo della pagina
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (this.audioPlayer && this.isAudioMuted === false) {
                    this.audioPlayer.play().then(() => {
                        console.log('Audio avviato dopo caricamento completo della pagina');
                    }).catch(e => {
                        console.log('Autoplay fallito anche dopo caricamento completo:', e);
                    });
                }
            }, 100);
        });
        
        // Event listener per quando la pagina diventa visibile
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.audioPlayer && this.isAudioMuted === false) {
                setTimeout(() => {
                    this.audioPlayer.play().then(() => {
                        console.log('Audio avviato quando pagina diventa visibile');
                    }).catch(e => {
                        console.log('Autoplay fallito quando pagina diventa visibile:', e);
                    });
                }, 100);
            }
        });
        
        // Crea un pulsante nascosto per forzare l'avvio dell'audio
        this.createHiddenAudioButton();
    }

    init() {
        this.viewport = document.getElementById('viewport');
        this.plancia = document.getElementById('plancia');
        this.turnoIndicatore = document.getElementById('turno-indicatore');
        this.fineTurnoBtn = document.getElementById('fine-turno');
        this.ruotaPlanciaBtn = document.getElementById('ruota-plancia');
        this.zoomSlider = document.getElementById('zoom-slider');
        this.faseIndicatore = document.createElement('div');
        this.faseIndicatore.id = 'fase-indicatore';
        this.ui = document.querySelector('.ui-container');
        this.ui.insertBefore(this.faseIndicatore, this.fineTurnoBtn);
        
        this.createGrid();
        this.createPedine();
        this.setupEvents();
        this.setupAudio();
        this.updateUI();
    }

    createGrid() {
        const hexWidth = this.hexSize - (this.spacing * 0.2);
        const hexHeight = this.hexSize - (this.spacing * 0.2);
        
        const horizontalSpacing = (hexWidth * 0.75) + (this.spacing * 0.75);
        const verticalSpacing = (hexHeight * 0.866) + this.spacing;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const hex = document.createElement('div');
                hex.className = 'hex';
                
                const x = col * horizontalSpacing;
                const y = row * verticalSpacing + (col % 2) * (verticalSpacing / 2);
                
                hex.style.left = `${x}mm`;
                hex.style.top = `${y}mm`;
                hex.dataset.row = row;
                hex.dataset.col = col;
                
                this.plancia.appendChild(hex);
            }
        }
    }

    createPedine() {
        // Pedine rosse (Giocatore 1) - Posizionate nell'angolo in basso a sinistra
        // Soldati in armatura (forza 3)
        this.createPedina(3, 2, 'rossa', 3, 2);  // Soldato 1
        this.createPedina(2, 3, 'rossa', 3, 2);  // Soldato 2
        this.createPedina(2, 4, 'rossa', 3, 2);  // Soldato 3
        this.createPedina(1, 5, 'rossa', 3, 2);  // Soldato 4

        // Fanteria con spada (forza 2, movimento 2)
        this.createPedina(5, 0, 'rossa', 2, 2, 'fanteria');  // Fanteria 1
        this.createPedina(4, 1, 'rossa', 2, 2, 'fanteria');  // Fanteria 2
        this.createPedina(3, 3, 'rossa', 2, 2, 'fanteria');  // Fanteria 3
        this.createPedina(2, 5, 'rossa', 2, 2, 'fanteria');  // Fanteria 4
        this.createPedina(1, 7, 'rossa', 2, 2, 'fanteria');  // Fanteria 5
        this.createPedina(1, 8, 'rossa', 2, 2, 'fanteria');  // Fanteria 6

        // Fanteria con lancia (forza 2, movimento 1)
        this.createPedina(4, 3, 'rossa', 2, 1, 'lancia');  // Lancia 1
        this.createPedina(4, 4, 'rossa', 2, 1, 'lancia');  // Lancia 2
        this.createPedina(3, 5, 'rossa', 2, 1, 'lancia');  // Lancia 3
        this.createPedina(3, 6, 'rossa', 2, 1, 'lancia');  // Lancia 4
        this.createPedina(4, 2, 'rossa', 2, 1, 'lancia');  // Lancia 5
        this.createPedina(2, 6, 'rossa', 2, 1, 'lancia');  // Lancia 6

        // Cavalleria (forza 2, movimento 3)
        this.createPedina(5, 1, 'rossa', 2, 3, 'cavalleria');  // Cavalleria 1
        this.createPedina(5, 2, 'rossa', 2, 3, 'cavalleria');  // Cavalleria 2
        this.createPedina(2, 7, 'rossa', 2, 3, 'cavalleria');  // Cavalleria 3
        this.createPedina(2, 8, 'rossa', 2, 3, 'cavalleria');  // Cavalleria 4

        // Re (forza 0, movimento 1)
        this.createPedina(3, 4, 'rossa', 0, 1, 're');  // Re
        
        // Capitano (forza 0, movimento 1)
        this.createPedina(1, 3, 'rossa', 0, 1, 'capitano');  // Capitano

        // Pedine gialle (Giocatore 2) - Posizionate simmetricamente nell'angolo in alto a destra
        // Soldati in armatura (forza 3)
        this.createPedina(11, 16, 'gialla', 3, 2);  // Soldato 1
        this.createPedina(11, 15, 'gialla', 3, 2);  // Soldato 2
        this.createPedina(12, 14, 'gialla', 3, 2);  // Soldato 3
        this.createPedina(12, 13, 'gialla', 3, 2);  // Soldato 4

        // Fanteria con spada (forza 2, movimento 2)
        this.createPedina(9, 18, 'gialla', 2, 2, 'fanteria');   // Fanteria 1
        this.createPedina(9, 17, 'gialla', 2, 2, 'fanteria');   // Fanteria 2
        this.createPedina(11, 13, 'gialla', 2, 2, 'fanteria');  // Fanteria 3
        this.createPedina(10, 15, 'gialla', 2, 2, 'fanteria');  // Fanteria 4
        this.createPedina(13, 10, 'gialla', 2, 2, 'fanteria');  // Fanteria 5
        this.createPedina(12, 11, 'gialla', 2, 2, 'fanteria');  // Fanteria 6

        // Fanteria con lancia (forza 2, movimento 1)
        this.createPedina(11, 12, 'gialla', 2, 1, 'lancia');  // Lancia 1
        this.createPedina(10, 13, 'gialla', 2, 1, 'lancia');  // Lancia 2
        this.createPedina(10, 14, 'gialla', 2, 1, 'lancia');  // Lancia 3
        this.createPedina(9, 15, 'gialla', 2, 1, 'lancia');   // Lancia 4
        this.createPedina(12, 12, 'gialla', 2, 1, 'lancia');  // Lancia 5
        this.createPedina(10, 16, 'gialla', 2, 1, 'lancia');  // Lancia 6

        // Cavalleria (forza 2, movimento 3)
        this.createPedina(8, 17, 'gialla', 2, 3, 'cavalleria');   // Cavalleria 1
        this.createPedina(9, 16, 'gialla', 2, 3, 'cavalleria');   // Cavalleria 2
        this.createPedina(12, 10, 'gialla', 2, 3, 'cavalleria');  // Cavalleria 3
        this.createPedina(11, 11, 'gialla', 2, 3, 'cavalleria');  // Cavalleria 4

        // Re giallo (forza 0, movimento 1)
        this.createPedina(11, 14, 'gialla', 0, 1, 're');  // Re giallo
        
        // Capitano giallo (forza 0, movimento 1)
        this.createPedina(12, 15, 'gialla', 0, 1, 'capitano');  // Capitano giallo
    }

    createPedina(row, col, tipo, forza, movimento, ruolo = 'soldato') {
        const pedina = document.createElement('div');
        pedina.className = `pedina pedina-${tipo}`;
        pedina.dataset.row = row;
        pedina.dataset.col = col;
        pedina.dataset.tipo = tipo;
        pedina.dataset.forza = forza;
        pedina.dataset.movimento = movimento;
        pedina.dataset.count = "1";
        pedina.dataset.ruolo = ruolo;

        // Aggiungi l'immagine del guerriero
        const immagine = document.createElement('div');
        immagine.className = 'pedina-immagine';
        
        if (ruolo === 'fanteria') {
            if (tipo === 'rossa') {
                immagine.style.backgroundImage = `url('fanteria.r.png')`;
            } else {
                immagine.style.backgroundImage = `url('fanteria.g.jpg')`;
            }
            immagine.style.backgroundSize = 'contain';
            immagine.style.backgroundRepeat = 'no-repeat';
            immagine.style.backgroundPosition = 'center';
        } else if (ruolo === 'lancia') {
            if (tipo === 'gialla') {
                immagine.style.backgroundImage = `url('fanteria.g2.png')`;
                immagine.style.backgroundSize = 'contain';
                immagine.style.backgroundRepeat = 'no-repeat';
                immagine.style.backgroundPosition = 'center';
                immagine.style.width = '100%';
                immagine.style.height = '100%';
            } else if (tipo === 'rossa') {
                immagine.style.backgroundImage = `url('fanteria.r2.png')`;
                immagine.style.backgroundSize = 'contain';
                immagine.style.backgroundRepeat = 'no-repeat';
                immagine.style.backgroundPosition = 'center';
                immagine.style.width = '100%';
                immagine.style.height = '100%';
            } else {
                immagine.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="%23003366" d="M25,20 L35,10 L45,20 L45,30 L25,30 Z"/><path fill="%23FFFF00" d="M25,30 L45,30 L47,60 L23,60 Z"/><path fill="%23003366" d="M23,60 L33,60 L31,80 L25,80 Z M37,60 L47,60 L45,80 L39,80 Z"/><path fill="%23C0C0C0" d="M20,90 L65,0 L69,0 L24,90 Z"/><path fill="%23000000" d="M65,0 L69,0 L67,-5 Z"/><path fill="%23003366" d="M55,20 L65,10 L75,20 L75,30 L55,30 Z"/><path fill="%23FFFF00" d="M55,30 L75,30 L77,60 L53,60 Z"/><path fill="%23003366" d="M53,60 L63,60 L61,80 L55,80 Z M67,60 L77,60 L75,80 L69,80 Z"/><path fill="%23C0C0C0" d="M50,90 L95,0 L99,0 L54,90 Z"/><path fill="%23000000" d="M95,0 L99,0 L97,-5 Z"/></svg>')`;
            }
        } else if (ruolo === 'capitano') {
            if (tipo === 'rossa') {
                immagine.style.backgroundImage = `url('capitano.r1.png')`;
                immagine.style.backgroundSize = 'contain';
                immagine.style.backgroundRepeat = 'no-repeat';
                immagine.style.backgroundPosition = 'center';
                immagine.style.width = '100%';
                immagine.style.height = '100%';
            } else if (tipo === 'gialla') {
                immagine.style.backgroundImage = `url('capitano.g1.png')`;
                immagine.style.backgroundSize = 'contain';
                immagine.style.backgroundRepeat = 'no-repeat';
                immagine.style.backgroundPosition = 'center';
                immagine.style.width = '100%';
                immagine.style.height = '100%';
            }
        } else if (ruolo === 're') {
            if (tipo === 'rossa') {
                immagine.style.backgroundImage = `url('re.r1.jpg')`;
                immagine.style.backgroundSize = 'contain';
                immagine.style.backgroundRepeat = 'no-repeat';
                immagine.style.backgroundPosition = 'center';
                immagine.style.width = '100%';
                immagine.style.height = '100%';
            } else if (tipo === 'gialla') {
                immagine.style.backgroundImage = `url('re.g.jpg')`;
                immagine.style.backgroundSize = 'contain';
                immagine.style.backgroundRepeat = 'no-repeat';
                immagine.style.backgroundPosition = 'center';
                immagine.style.width = '100%';
                immagine.style.height = '100%';
            }
        } else if (ruolo === 'cavalleria') {            
            if (tipo === 'gialla') {
                immagine.style.backgroundImage = `url('cavalleria.g1.png')`;
                immagine.style.backgroundSize = 'contain';
                immagine.style.backgroundRepeat = 'no-repeat';
                immagine.style.backgroundPosition = 'center';
                immagine.style.width = '100%';
                immagine.style.height = '100%';
            } else if (tipo === 'rossa') {
                immagine.style.backgroundImage = `url('cavalleria.r1.png')`;
                immagine.style.backgroundSize = 'contain';
                immagine.style.backgroundRepeat = 'no-repeat';
                immagine.style.backgroundPosition = 'center';
                immagine.style.width = '100%';
                immagine.style.height = '100%';
            } else {
                const coloreCavaliere = tipo === 'rossa' ? '%23FFFF00' : '%23FFD700';            
                const coloreBandiera = tipo === 'rossa' ? '%23FF1111' : '%23FFFF33';            
                immagine.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="%230066CC" d="M25,40 L45,35 L70,37 L82,45 L78,55 L73,58 L55,60 L45,62 L30,60 L20,55 Z"/><path fill="%230066CC" d="M73,58 L78,55 L82,58 L79,62 L75,65 L70,63 Z"/><path fill="%23663300" d="M78,55 L82,65 L79,70 L75,65"/><path fill="%23663300" d="M45,62 L48,75 L45,80"/><path fill="%23663300" d="M30,60 L33,73 L30,78"/><path fill="%23663300" d="M55,60 L58,70 L55,75"/><path fill="%230066CC" d="M20,37 L25,35 L30,37 L27,40 L23,41 Z"/><path fill="${coloreCavaliere}" d="M35,20 L50,15 L65,20 L60,45 L40,48 Z"/><path fill="%23C0C0C0" d="M15,15 L85,35 L83,38 L13,18 Z"/><path fill="${coloreBandiera}" d="M10,10 L35,15 L35,25 L10,20 Z"/><path fill="%23000000" d="M83,38 L85,35 L87,37 Z"/><path fill="%23003366" d="M45,20 L50,15 L55,20 L55,25 L45,25 Z"/></svg>')`;
            }
        } else {
            if (tipo === 'rossa') {
                immagine.style.backgroundImage = `url('soldato.r1.png')`;
                immagine.style.backgroundSize = 'contain';
                immagine.style.backgroundRepeat = 'no-repeat';
                immagine.style.backgroundPosition = 'center';
                immagine.style.width = '100%';
                immagine.style.height = '100%';
            } else if (tipo === 'gialla' && forza === 3 && movimento === 2) {
                immagine.style.backgroundImage = `url('soldato.g.png')`;
                immagine.style.backgroundSize = 'contain';
                immagine.style.backgroundRepeat = 'no-repeat';
                immagine.style.backgroundPosition = 'center';
                immagine.style.width = '100%';
                immagine.style.height = '100%';
            } else {
                immagine.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="%23003366" d="M40,20 L50,10 L60,20 L60,30 L40,30 Z"/><path fill="%23FFFF00" d="M40,30 L60,30 L65,60 L35,60 Z"/><path fill="%23FF0000" d="M35,35 L45,35 L40,55 Z"/><path fill="%2300BFFF" d="M45,35 L85,15 L75,25 L55,45 Z"/><path fill="%23003366" d="M35,60 L45,60 L43,80 L37,80 Z M55,60 L65,60 L63,80 L57,80 Z"/></svg>')`;
            }
        }
        
        const forzaEl = document.createElement('div');
        forzaEl.className = 'pedina-valore';
        forzaEl.textContent = forza;
        
        const movimentoEl = document.createElement('div');
        movimentoEl.className = 'pedina-valore';
        movimentoEl.textContent = movimento;
        
        pedina.appendChild(immagine);
        
        // Per il Re, mostra solo il movimento (forza 0)
        if (ruolo === 're') {
            // Modifica il valore visualizzato per il re
            movimentoEl.textContent = "3";
            
            // Colora il numero in base al tipo di pedina
            if (tipo === 'rossa') {
                movimentoEl.style.color = '#FF0000'; // Rosso brillante
                movimentoEl.style.fontWeight = 'bold';
            } else if (tipo === 'gialla') {
                movimentoEl.style.color = '#FFFF00'; // Giallo brillante
                movimentoEl.style.fontWeight = 'bold';
            }
            
            pedina.appendChild(movimentoEl);
        } else if (ruolo === 'capitano') {
            // Per il Capitano, mostra solo il raggio d'azione (2)
            movimentoEl.textContent = "2";
            
            // Colora il numero in base al tipo di pedina
            if (tipo === 'rossa') {
                movimentoEl.style.color = '#FF0000'; // Rosso brillante
                movimentoEl.style.fontWeight = 'bold';
            } else if (tipo === 'gialla') {
                movimentoEl.style.color = '#FFFF00'; // Giallo brillante
                movimentoEl.style.fontWeight = 'bold';
            }
            
            pedina.appendChild(movimentoEl);
        } else {
            pedina.appendChild(forzaEl);
            pedina.appendChild(movimentoEl);
        }
        
        this.plancia.appendChild(pedina);
        this.movePedinaTo(pedina, row, col);
        
        return pedina;
    }

    movePedinaTo(pedina, row, col) {
        const hex = document.querySelector(`.hex[data-row="${row}"][data-col="${col}"]`);
        if (hex) {
            const hexX = parseFloat(hex.style.left);
            const hexY = parseFloat(hex.style.top);
            const hexWidth = this.hexSize - (this.spacing * 0.2);
            const hexHeight = this.hexSize - (this.spacing * 0.2);
            
            const centerX = hexX + (hexWidth / 2);
            const centerY = hexY + (hexHeight / 2);
            
            pedina.style.left = `${centerX}mm`;
            pedina.style.top = `${centerY}mm`;
            pedina.dataset.row = row;
            pedina.dataset.col = col;
            
            // Aggiorna le sovrapposizioni nella nuova posizione
            this.aggiornaSovrapposizioni(row, col, pedina.dataset.tipo);
            
            if (this.pedinaAttiva === pedina) {
                this.posizioneAttuale = { row, col };
            }
        }
    }

    mmToPixels(mm) {
        return mm * 3.779527559;
    }

    centerBoard() {
        const gameBorder = document.querySelector('.game-border');
        const borderRect = gameBorder.getBoundingClientRect();
        
        const hexWidth = this.hexSize - (this.spacing * 0.2);
        const hexHeight = this.hexSize - (this.spacing * 0.2);
        const horizontalSpacing = (hexWidth * 0.75) + (this.spacing * 0.75);
        const verticalSpacing = (hexHeight * 0.866) + this.spacing;
        
        const totalWidth = (this.cols - 1) * horizontalSpacing + hexWidth;
        const totalHeight = (this.rows - 1) * verticalSpacing + hexHeight;
        
        const widthInPixels = this.mmToPixels(totalWidth);
        const heightInPixels = this.mmToPixels(totalHeight);
        
        this.panX = (borderRect.width - widthInPixels * this.scale) / 2;
        this.panY = (borderRect.height - heightInPixels * this.scale) / 2;
        
        this.updateTransform();
    }

    updateTransform() {
        this.plancia.style.transform = `
            translate(${this.panX}px, ${this.panY}px)
            scale(${this.scale})
            rotate(${this.rotazionePlancia}deg)
        `;
    }

    ruotaPlancia() {
        // Ruota di 90 gradi in senso orario
        this.rotazionePlancia = (this.rotazionePlancia + 90) % 360;
        this.updateTransform();
    }

    setupEvents() {
        this.viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomIntensity = 0.1;
            const delta = -e.deltaY * zoomIntensity * 0.01;
            const newScale = Math.max(0.2, Math.min(5, this.scale * (1 + delta)));
            
            const rect = this.viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Calcola la posizione del mouse rispetto alla plancia
            const mouseXRelative = (mouseX - this.panX) / this.scale;
            const mouseYRelative = (mouseY - this.panY) / this.scale;
            
            // Aggiorna la scala
            this.scale = newScale;
            
            // Aggiorna la posizione per mantenere il punto del mouse fisso
            this.panX = mouseX - mouseXRelative * this.scale;
            this.panY = mouseY - mouseYRelative * this.scale;
            
            // Sincronizza lo slider con il nuovo valore di zoom
            this.zoomSlider.value = this.scale;
            
            this.updateTransform();
        }, { passive: false });

        // Touch zoom per mobile
        let initialDistance = 0;
        let initialScale = 1;

        this.viewport.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                initialDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                initialScale = this.scale;
            }
        }, { passive: false });

        this.viewport.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                
                const scale = currentDistance / initialDistance;
                const newScale = Math.max(0.2, Math.min(5, initialScale * scale));
                
                this.scale = newScale;
                this.zoomSlider.value = this.scale;
                this.updateTransform();
            }
        }, { passive: false });

        // Mouse events per desktop
        this.viewport.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !e.target.closest('.pedina')) {
                this.isDragging = true;
                this.lastX = e.clientX;
                this.lastY = e.clientY;
                this.viewport.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            this.panX += (e.clientX - this.lastX);
            this.panY += (e.clientY - this.lastY);
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.updateTransform();
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.viewport.style.cursor = 'grab';
        });

        // Touch events per mobile
        this.viewport.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && !e.target.closest('.pedina')) {
                e.preventDefault();
                this.isDragging = true;
                this.lastX = e.touches[0].clientX;
                this.lastY = e.touches[0].clientY;
                this.viewport.style.cursor = 'grabbing';
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging || e.touches.length !== 1) return;
            e.preventDefault();
            this.panX += (e.touches[0].clientX - this.lastX);
            this.panY += (e.touches[0].clientY - this.lastY);
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
            this.updateTransform();
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            this.isDragging = false;
            this.viewport.style.cursor = 'grab';
        });

        // Click events per desktop e mobile
        this.plancia.addEventListener('click', (e) => {
            const pedina = e.target.closest('.pedina');
            if (pedina) {
                this.handlePedinaClick(pedina);
                return;
            }
            
            const hex = e.target.closest('.hex');
            if (hex && this.pedinaAttiva) {
                this.handleHexClick(hex);
            }
        });

        // Touch events per mobile
        this.plancia.addEventListener('touchend', (e) => {
            const pedina = e.target.closest('.pedina');
            if (pedina) {
                this.handlePedinaClick(pedina);
                return;
            }
            
            const hex = e.target.closest('.hex');
            if (hex && this.pedinaAttiva) {
                this.handleHexClick(hex);
            }
        });

        // Aggiungi gestore per il click destro
        this.plancia.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Previeni il menu contestuale del browser
            
            if (!this.pedinaAttiva) return;
            
            const pedinaTarget = e.target.closest('.pedina');
            if (!pedinaTarget) return;
            
            // Verifica che la pedina target sia dello stesso tipo
            if (pedinaTarget.dataset.tipo !== this.pedinaAttiva.dataset.tipo) return;
            
            // Verifica che la pedina target sia adiacente
            if (this.sonoPedineAdiacenti(this.pedinaAttiva, pedinaTarget)) {
                this.sovrapponiPedine(this.pedinaAttiva, pedinaTarget);
            }
        });

        // Long press per mobile (equivalente al click destro)
        let longPressTimer = null;
        let longPressTarget = null;

        this.plancia.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.pedina');
            if (target) {
                longPressTarget = target;
                longPressTimer = setTimeout(() => {
                    if (longPressTarget && this.pedinaAttiva) {
                        // Verifica che la pedina target sia dello stesso tipo
                        if (longPressTarget.dataset.tipo !== this.pedinaAttiva.dataset.tipo) return;
                        
                        // Verifica che la pedina target sia adiacente
                        if (this.sonoPedineAdiacenti(this.pedinaAttiva, longPressTarget)) {
                            this.sovrapponiPedine(this.pedinaAttiva, longPressTarget);
                        }
                    }
                }, 500); // 500ms per il long press
            }
        });

        this.plancia.addEventListener('touchend', (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            longPressTarget = null;
        });

        this.plancia.addEventListener('touchmove', (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            longPressTarget = null;
        });

        this.fineTurnoBtn.addEventListener('click', () => {
            this.passaTurno();
        });

        this.ruotaPlanciaBtn.addEventListener('click', () => {
            this.ruotaPlancia();
        });

        // Event listener per lo slider di zoom
        this.zoomSlider.addEventListener('input', (e) => {
            const newScale = parseFloat(e.target.value);
            this.scale = newScale;
            this.updateTransform();
        });

        // Sincronizza lo slider con il valore di zoom corrente
        this.zoomSlider.value = this.scale;
    }

    handlePedinaClick(pedina) {
        console.log('=== INIZIO VALIDAZIONE PEDINA ===');
        console.log(`Pedina cliccata: tipo=${pedina.dataset.tipo}, ruolo=${pedina.dataset.ruolo}, posizione=(${pedina.dataset.row}, ${pedina.dataset.col})`);
        console.log(`Fase turno: ${this.faseTurno}, Turno giocatore: ${this.turno}`);
        
        // Se siamo in fase combattimento, non permettere movimenti
        if (this.faseTurno === 'combattimento') {
            console.log('❌ Fase combattimento - movimento non consentito');
            return;
        }

        // Verifica che la pedina appartenga al giocatore corrente
        const tipoPedinaCorrente = this.turno === 1 ? 'rossa' : 'gialla';
        console.log(`Tipo pedina corrente: ${tipoPedinaCorrente}`);
        
        if (pedina.dataset.tipo !== tipoPedinaCorrente) {
            console.log('❌ Pedina non appartiene al giocatore corrente');
            return;
        }

        // NUOVA REGOLA: Verifica che la pedina sia nel raggio d'azione del capitano o re
        console.log(`🔍 Validazione raggio d'azione per pedina in (${pedina.dataset.row}, ${pedina.dataset.col})`);
        const inRaggio = this.isPedinaInRaggioCapitanoORe(pedina);
        console.log(`Risultato validazione raggio: ${inRaggio}`);
        
        if (!inRaggio) {
            console.log(`❌ Movimento bloccato: pedina fuori dal raggio d'azione`);
            // Mostra un messaggio di errore
            this.mostraMessaggioErrore('Questa pedina non può muoversi: deve essere nel raggio d\'azione del capitano o del re!');
            return;
        }
        console.log(`✅ Movimento consentito: pedina nel raggio d'azione`);

        const movimento = parseInt(pedina.dataset.movimento);
        // Se la pedina ha già fatto il numero massimo di mosse consentito dal suo valore movimento, non permettere ulteriori movimenti
        if (parseInt(pedina.dataset.mosseEffettuate || 0) >= movimento) {
            return;
        }

        // Controlla se ci sono pedine sovrapposte nella stessa posizione
        const row = parseInt(pedina.dataset.row);
        const col = parseInt(pedina.dataset.col);
        const pedineNellaStessaPosizione = document.querySelectorAll(
            `.pedina[data-row="${row}"][data-col="${col}"][data-tipo="${tipoPedinaCorrente}"]`
        );

        if (pedineNellaStessaPosizione.length > 1) {
            this.mostraPopupSelezione(Array.from(pedineNellaStessaPosizione));
            return;
        }

        if (this.pedinaAttiva === pedina) {
            this.deselectPedina();
            return;
        }

        if (this.pedinaAttiva) {
            this.deselectPedina();
        }

        this.pedinaAttiva = pedina;
        pedina.classList.add('active');
        this.posizioneAttuale = { row, col };
        this.posizioneIniziale = { row, col };
        
        this.showReachableHexes();
    }

    deselectPedina() {
        if (!this.pedinaAttiva) return;
        
        // Rimuovi la classe active da tutte le pedine
        document.querySelectorAll('.pedina.active').forEach(pedina => {
            pedina.classList.remove('active');
        });
        
        this.clearReachableHexes();
        this.pedinaAttiva = null;
        this.posizioneAttuale = null;
        this.posizioneIniziale = null;
    }

    handleHexClick(hex) {
        if (!this.pedinaAttiva) return;
        
        const row = parseInt(hex.dataset.row);
        const col = parseInt(hex.dataset.col);
        
        if (hex.classList.contains('reachable')) {
            // Trova tutte le pedine attive
            const pedineAttive = document.querySelectorAll('.pedina.active');
            
            // Calcola il numero massimo di mosse rimanenti tra tutte le pedine attive
            let mosseRimanentiMin = Infinity;
            pedineAttive.forEach(pedina => {
                const movimento = parseInt(pedina.dataset.movimento);
                const mosseEffettuate = parseInt(pedina.dataset.mosseEffettuate || 0);
                const mosseRimanenti = movimento - mosseEffettuate;
                mosseRimanentiMin = Math.min(mosseRimanentiMin, mosseRimanenti);
            });

            // Se non ci sono più mosse disponibili, non permettere il movimento
            if (mosseRimanentiMin <= 0) {
                this.deselectPedina();
                return;
            }
            
            // Muovi tutte le pedine attive
            pedineAttive.forEach(pedina => {
                // Aggiorna il contatore delle mosse per questa pedina
                const mosseEffettuate = parseInt(pedina.dataset.mosseEffettuate || 0) + 1;
                pedina.dataset.mosseEffettuate = mosseEffettuate;
                
                this.movePedinaTo(pedina, row, col);
            });
            
            // Se non ci sono più mosse disponibili dopo questo movimento, deseleziona tutte
            mosseRimanentiMin--;
            if (mosseRimanentiMin <= 0) {
                this.deselectPedina();
                // Rimuovi la classe active da tutte le altre pedine
                document.querySelectorAll('.pedina.active').forEach(p => {
                    if (p !== this.pedinaAttiva) {
                        p.classList.remove('active');
                    }
                });
            } else {
                this.clearReachableHexes();
                this.showReachableHexes();
            }
        } else if (hex.classList.contains('reachable-enemy')) {
            // Il re ha cliccato su una casella con nemici - non permettere il movimento
            console.log('Il re non può muoversi in una casella occupata da nemici');
        }
    }

    showReachableHexes() {
        if (!this.pedinaAttiva || !this.posizioneAttuale) return;
        
        this.clearReachableHexes();
        
        // Trova tutte le pedine attive
        const pedineAttive = document.querySelectorAll('.pedina.active');
        
        // Calcola il numero minimo di mosse rimanenti tra tutte le pedine attive
        let mosseRimanentiMin = Infinity;
        pedineAttive.forEach(pedina => {
            const movimento = parseInt(pedina.dataset.movimento);
            const mosseEffettuate = parseInt(pedina.dataset.mosseEffettuate || 0);
            const mosseRimanenti = movimento - mosseEffettuate;
            mosseRimanentiMin = Math.min(mosseRimanentiMin, mosseRimanenti);
        });
        
        // Se non ci sono più mosse disponibili, non mostrare esagoni raggiungibili
        if (mosseRimanentiMin <= 0) {
            this.deselectPedina();
            return;
        }
        
        const { row, col } = this.posizioneAttuale;
        const isColonnaDispari = col % 2 === 0;
        const tipoPedinaCorrente = this.turno === 1 ? 'rossa' : 'gialla';
    
        const directions = isColonnaDispari ? 
            [[0, 1], [0, -1], [1, 0], [-1, 1], [-1, 0], [-1, -1]] : // Colonne dispari
            [[0, 1], [0, -1], [1, 0], [1, -1], [-1, 0], [1, 1]];   // Colonne pari

        // Controlla se c'è un re o un capitano tra le pedine attive
        const hasReOrCapitano = Array.from(pedineAttive).some(pedina => 
            pedina.dataset.ruolo === 're' || pedina.dataset.ruolo === 'capitano'
        );
        
        if (hasReOrCapitano) {
            // Funzionalità speciale del re e capitano: evidenzia caselle adiacenti e a distanza 2
            // Il re e il capitano si comportano in modo speciale con movimento 1 ma raggio esteso
            
            // Caselle adiacenti (movimento normale)
            directions.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isValidHex(newRow, newCol)) {
                    const hex = document.querySelector(`.hex[data-row="${newRow}"][data-col="${newCol}"]`);
                    const pedineAmiche = document.querySelectorAll(
                        `.pedina[data-row="${newRow}"][data-col="${newCol}"][data-tipo="${tipoPedinaCorrente}"]`
                    );
                    const pedineNemiche = document.querySelectorAll(
                        `.pedina[data-row="${newRow}"][data-col="${newCol}"]:not([data-tipo="${tipoPedinaCorrente}"])`
                    );
                    
                    // Caselle raggiungibili per il movimento (solo senza nemici)
                    if (pedineNemiche.length === 0 && pedineAmiche.length < 3) {
                        hex.classList.add('reachable');
                        hex.classList.add('re-reachable'); // Classe speciale per re e capitano
                    }
                }
            });
            
            // Evidenzia anche le caselle adiacenti alle caselle evidenziate (distanza 2)
            this.evidenziaCaselleAdiacentiEvidenziate(row, col, tipoPedinaCorrente);
            
            // Evidenzia anche le caselle a distanza 3 SOLO per il re
            const hasRe = Array.from(pedineAttive).some(pedina => pedina.dataset.ruolo === 're');
            if (hasRe) {
                this.evidenziaCaselleDistanza3(row, col, tipoPedinaCorrente);
            }
            
        } else {
            // Comportamento normale per tutte le altre pedine
            directions.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isValidHex(newRow, newCol)) {
                    const hex = document.querySelector(`.hex[data-row="${newRow}"][data-col="${newCol}"]`);
                    const pedineAmiche = document.querySelectorAll(
                        `.pedina[data-row="${newRow}"][data-col="${newCol}"][data-tipo="${tipoPedinaCorrente}"]`
                    );
                    const pedineNemiche = document.querySelectorAll(
                        `.pedina[data-row="${newRow}"][data-col="${newCol}"]:not([data-tipo="${tipoPedinaCorrente}"])`
                    );
                    
                    // Permetti movimento se:
                    // 1. Non ci sono pedine nemiche E
                    // 2. Ci sono meno di 3 pedine amiche nella casella di destinazione
                    if (pedineNemiche.length === 0 && pedineAmiche.length < 3) {
                        hex.classList.add('reachable');
                    }
                }
            });
        }
    }

    isValidHex(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    hasPedina(row, col) {
        return !!document.querySelector(`.pedina[data-row="${row}"][data-col="${col}"]`);
    }

    evidenziaCerchioStrategico(row, col, distanza, classeCSS) {
        const isColonnaDispari = col % 2 === 0;
        const directions = isColonnaDispari ? 
            [[0, 1], [0, -1], [1, 0], [-1, 1], [-1, 0], [-1, -1]] : // Colonne dispari
            [[0, 1], [0, -1], [1, 0], [1, -1], [-1, 0], [1, 1]];   // Colonne pari
        
        // Calcola tutte le posizioni a distanza specificata
        const posizioni = this.calcolaPosizioniADistanza(row, col, distanza);
        
        posizioni.forEach(([r, c]) => {
            if (this.isValidHex(r, c)) {
                const hex = document.querySelector(`.hex[data-row="${r}"][data-col="${c}"]`);
                if (hex) {
                    hex.classList.add(classeCSS);
                }
            }
        });
    }

    evidenziaCaselleAdiacentiEvidenziate(row, col, tipoPedinaCorrente) {
        const isColonnaDispari = col % 2 === 0;
        const directions = isColonnaDispari ? 
            [[0, 1], [0, -1], [1, 0], [-1, 1], [-1, 0], [-1, -1]] : // Colonne dispari
            [[0, 1], [0, -1], [1, 0], [1, -1], [-1, 0], [1, 1]];   // Colonne pari
        
        // Per ogni casella adiacente al re o capitano, trova le caselle adiacenti a quella
        directions.forEach(([dr1, dc1]) => {
            const casellaAdiacenteRow = row + dr1;
            const casellaAdiacenteCol = col + dc1;
            
            if (this.isValidHex(casellaAdiacenteRow, casellaAdiacenteCol)) {
                // Trova le direzioni per la casella adiacente
                const isCasellaAdiacenteDispari = casellaAdiacenteCol % 2 === 0;
                const directionsCasellaAdiacente = isCasellaAdiacenteDispari ? 
                    [[0, 1], [0, -1], [1, 0], [-1, 1], [-1, 0], [-1, -1]] : // Colonne dispari
                    [[0, 1], [0, -1], [1, 0], [1, -1], [-1, 0], [1, 1]];   // Colonne pari
                
                // Evidenzia le caselle adiacenti alla casella adiacente al re
                directionsCasellaAdiacente.forEach(([dr2, dc2]) => {
                    const casellaDistanza2Row = casellaAdiacenteRow + dr2;
                    const casellaDistanza2Col = casellaAdiacenteCol + dc2;
                    
                    // Non evidenziare la posizione del re stesso
                    if (casellaDistanza2Row === row && casellaDistanza2Col === col) {
                        return;
                    }
                    
                    if (this.isValidHex(casellaDistanza2Row, casellaDistanza2Col)) {
                        const hex = document.querySelector(`.hex[data-row="${casellaDistanza2Row}"][data-col="${casellaDistanza2Col}"]`);
                        if (hex) {
                            // Evidenzia con un colore diverso per le caselle a distanza 2
                            hex.classList.add('re-reachable-distance2');
                        }
                    }
                });
            }
        });
    }

    evidenziaCaselleDistanza3(row, col, tipoPedinaCorrente) {
        const isColonnaDispari = col % 2 === 0;
        const directions = isColonnaDispari ? 
            [[0, 1], [0, -1], [1, 0], [-1, 1], [-1, 0], [-1, -1]] : // Colonne dispari
            [[0, 1], [0, -1], [1, 0], [1, -1], [-1, 0], [1, 1]];   // Colonne pari
        
        // Per ogni casella adiacente al re o capitano, trova le caselle adiacenti a quella
        directions.forEach(([dr1, dc1]) => {
            const casellaAdiacenteRow = row + dr1;
            const casellaAdiacenteCol = col + dc1;
            
            if (this.isValidHex(casellaAdiacenteRow, casellaAdiacenteCol)) {
                // Trova le direzioni per la casella adiacente
                const isCasellaAdiacenteDispari = casellaAdiacenteCol % 2 === 0;
                const directionsCasellaAdiacente = isCasellaAdiacenteDispari ? 
                    [[0, 1], [0, -1], [1, 0], [-1, 1], [-1, 0], [-1, -1]] : // Colonne dispari
                    [[0, 1], [0, -1], [1, 0], [1, -1], [-1, 0], [1, 1]];   // Colonne pari
                
                // Per ogni casella a distanza 2, trova le caselle adiacenti a quella
                directionsCasellaAdiacente.forEach(([dr2, dc2]) => {
                    const casellaDistanza2Row = casellaAdiacenteRow + dr2;
                    const casellaDistanza2Col = casellaAdiacenteCol + dc2;
                    
                    // Non considerare la posizione del re stesso
                    if (casellaDistanza2Row === row && casellaDistanza2Col === col) {
                        return;
                    }
                    
                    if (this.isValidHex(casellaDistanza2Row, casellaDistanza2Col)) {
                        // Trova le direzioni per la casella a distanza 2
                        const isCasellaDistanza2Dispari = casellaDistanza2Col % 2 === 0;
                        const directionsCasellaDistanza2 = isCasellaDistanza2Dispari ? 
                            [[0, 1], [0, -1], [1, 0], [-1, 1], [-1, 0], [-1, -1]] : // Colonne dispari
                            [[0, 1], [0, -1], [1, 0], [1, -1], [-1, 0], [1, 1]];   // Colonne pari
                        
                        // Evidenzia le caselle adiacenti alla casella a distanza 2
                        directionsCasellaDistanza2.forEach(([dr3, dc3]) => {
                            const casellaDistanza3Row = casellaDistanza2Row + dr3;
                            const casellaDistanza3Col = casellaDistanza2Col + dc3;
                            
                            // Non evidenziare la posizione del re stesso o caselle già evidenziate
                            if ((casellaDistanza3Row === row && casellaDistanza3Col === col) ||
                                this.isCasellaAdiacenteAlRe(casellaDistanza3Row, casellaDistanza3Col, row, col)) {
                                return;
                            }
                            
                            if (this.isValidHex(casellaDistanza3Row, casellaDistanza3Col)) {
                                const hex = document.querySelector(`.hex[data-row="${casellaDistanza3Row}"][data-col="${casellaDistanza3Col}"]`);
                                if (hex) {
                                    // Evidenzia con un colore diverso per le caselle a distanza 3
                                    hex.classList.add('re-reachable-distance3');
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    setupAudio() {
        // Carica automaticamente tutti i file .mp3 dalla cartella music
        this.audioFiles = [
            'music/A Day in the Life of a Gong Farmer.mp3',
            'music/A Strong Spice.mp3',
            'music/Pints a Flowin.mp3',
            'music/Sandal Maker.mp3',
            'music/The Piper.mp3',
            'music/Two Mandolins.mp3',
            'music/Under an Old Tree.mp3',
            'music/A l\'entrada del temps clar.mp3'
        ];
        
        if (this.audioFiles.length > 0) {
            // Scegli un brano casuale per iniziare
            this.currentAudioIndex = Math.floor(Math.random() * this.audioFiles.length);
            this.setupAudioControls();
            // Prova a far partire l'audio automaticamente
            this.startAudioAutoplay();
            // Assicurati che il pulsante mostri lo stato corretto
            this.updateAudioButton();
        }
    }

    startAudioAutoplay() {
        // Crea il primo player audio
        this.audioPlayer = new Audio(this.audioFiles[this.currentAudioIndex]);
        this.audioPlayer.volume = 0.3;
        this.audioPlayer.loop = false;
        
        // Event listener per quando finisce la canzone
        this.audioPlayer.addEventListener('ended', () => {
            // Scegli il prossimo brano in modo casuale
            this.currentAudioIndex = Math.floor(Math.random() * this.audioFiles.length);
            this.playNextAudio();
        });
        
        // Event listener per errori
        this.audioPlayer.addEventListener('error', (e) => {
            console.log('Errore nel caricamento audio:', e);
            // Scegli un brano casuale in caso di errore
            this.currentAudioIndex = Math.floor(Math.random() * this.audioFiles.length);
            this.playNextAudio();
        });
        
        // Strategia ultra-aggressiva per l'autoplay
        const tryAutoplay = () => {
            // Prova con user gesture
            this.audioPlayer.play().then(() => {
                console.log('Audio avviato automaticamente');
                this.isAudioMuted = false;
                this.updateAudioButton();
            }).catch(e => {
                console.log('Tentativo autoplay fallito:', e);
                // Riprova immediatamente
                setTimeout(() => {
                    this.audioPlayer.play().then(() => {
                        console.log('Audio avviato al secondo tentativo');
                        this.isAudioMuted = false;
                        this.updateAudioButton();
                    }).catch(e2 => {
                        console.log('Autoplay fallito al secondo tentativo:', e2);
                        // Riprova ancora
                        setTimeout(() => {
                            this.audioPlayer.play().then(() => {
                                console.log('Audio avviato al terzo tentativo');
                                this.isAudioMuted = false;
                                this.updateAudioButton();
                            }).catch(e3 => {
                                console.log('Autoplay definitivamente bloccato:', e3);
                                this.isAudioMuted = false;
                                this.updateAudioButton();
                            });
                        }, 200);
                    });
                }, 50);
            });
        };
        
        // Prova subito
        tryAutoplay();
        
        // Prova anche dopo che la pagina è completamente caricata
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryAutoplay);
        }
        
        // Prova anche quando la finestra diventa visibile
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.audioPlayer && this.isAudioMuted === false) {
                tryAutoplay();
            }
        });
        
        // Prova anche al primo click dell'utente
        const startOnFirstInteraction = () => {
            if (this.audioPlayer && this.isAudioMuted === false) {
                this.audioPlayer.play().then(() => {
                    console.log('Audio avviato al primo click');
                    this.isAudioMuted = false;
                    this.updateAudioButton();
                    // Rimuovi gli event listener dopo il successo
                    document.removeEventListener('click', startOnFirstInteraction);
                    document.removeEventListener('touchstart', startOnFirstInteraction);
                    document.removeEventListener('mousedown', startOnFirstInteraction);
                    document.removeEventListener('keydown', startOnFirstInteraction);
                    document.removeEventListener('mousemove', startOnFirstInteraction);
                    document.removeEventListener('scroll', startOnFirstInteraction);
                }).catch(e => {
                    console.log('Tentativo autoplay al primo click fallito:', e);
                });
            }
        };
        
        // Aggiungi event listener per il primo click
        document.addEventListener('click', startOnFirstInteraction);
        document.addEventListener('touchstart', startOnFirstInteraction);
        document.addEventListener('mousedown', startOnFirstInteraction);
        document.addEventListener('keydown', startOnFirstInteraction);
        document.addEventListener('mousemove', startOnFirstInteraction);
        document.addEventListener('scroll', startOnFirstInteraction);
        
        // Prova anche con eventi di focus
        document.addEventListener('focus', startOnFirstInteraction);
        window.addEventListener('focus', startOnFirstInteraction);
    }

    playNextAudio() {
        if (this.audioFiles.length === 0) return;
        
        // Ferma l'audio corrente se presente
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer = null;
        }
        
        // Crea nuovo player audio
        this.audioPlayer = new Audio(this.audioFiles[this.currentAudioIndex]);
        this.audioPlayer.volume = 0.3; // Volume al 30%
        this.audioPlayer.loop = false;
        
        // Event listener per quando finisce la canzone
        this.audioPlayer.addEventListener('ended', () => {
            // Scegli il prossimo brano in modo casuale
            this.currentAudioIndex = Math.floor(Math.random() * this.audioFiles.length);
            this.playNextAudio();
        });
        
        // Event listener per errori
        this.audioPlayer.addEventListener('error', (e) => {
            console.log('Errore nel caricamento audio:', e);
            // Scegli un brano casuale in caso di errore
            this.currentAudioIndex = Math.floor(Math.random() * this.audioFiles.length);
            this.playNextAudio();
        });
        
        // Riproduci se non è mutato
        if (!this.isAudioMuted) {
            this.audioPlayer.play().catch(e => {
                console.log('Errore nella riproduzione audio:', e);
            });
        }
    }

    updateAudioButton() {
        const audioToggle = document.getElementById('audio-toggle');
        const audioIcon = audioToggle.querySelector('.audio-icon');
        
        if (this.isAudioMuted) {
            audioIcon.textContent = '🔇';
            audioToggle.classList.add('muted');
        } else {
            audioIcon.textContent = '🔊';
            audioToggle.classList.remove('muted');
        }
        
        // Nascondi il pulsante nascosto se l'audio è attivo
        const hiddenButton = document.getElementById('hidden-audio-button');
        if (hiddenButton && this.audioPlayer && !this.audioPlayer.paused) {
            hiddenButton.style.display = 'none';
        }
    }

    setupAudioControls() {
        const audioToggle = document.getElementById('audio-toggle');
        
        audioToggle.addEventListener('click', () => {
            this.isAudioMuted = !this.isAudioMuted;
            
            if (this.isAudioMuted) {
                // Muta l'audio
                if (this.audioPlayer) {
                    this.audioPlayer.pause();
                }
            } else {
                // Riattiva l'audio
                if (this.audioPlayer) {
                    this.audioPlayer.play().catch(e => {
                        console.log('Errore nella riproduzione audio:', e);
                    });
                }
            }
            
            this.updateAudioButton();
        });
        
        // Gestisci il focus per evitare problemi con la tastiera
        audioToggle.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
        
        // Inizializza lo stato del pulsante
        this.updateAudioButton();
        
        // Gestisci l'interazione dell'utente per sbloccare l'autoplay
        const unlockAudio = () => {
            if (this.audioPlayer && this.isAudioMuted === false) {
                // Se l'audio è attivo ma non sta suonando, prova a farlo partire
                this.audioPlayer.play().then(() => {
                    console.log('Audio sbloccato dall\'interazione utente');
                }).catch(e => {
                    console.log('Errore nello sblocco audio:', e);
                });
            } else if (!this.audioPlayer && this.audioFiles.length > 0) {
                // Se non c'è un player audio ma ci sono file disponibili, creane uno nuovo
                this.currentAudioIndex = Math.floor(Math.random() * this.audioFiles.length);
                this.isAudioMuted = false;
                this.playNextAudio();
                this.updateAudioButton();
            }
        };
        
        // Funzione per tentare l'autoplay
        const tryAutoplayOnInteraction = () => {
            if (this.audioPlayer && this.isAudioMuted === false) {
                this.audioPlayer.play().then(() => {
                    console.log('Audio avviato tramite interazione');
                    // Rimuovi gli event listener dopo il successo
                    document.removeEventListener('click', tryAutoplayOnInteraction);
                    document.removeEventListener('touchstart', tryAutoplayOnInteraction);
                    document.removeEventListener('mousedown', tryAutoplayOnInteraction);
                    document.removeEventListener('keydown', tryAutoplayOnInteraction);
                }).catch(e => {
                    console.log('Tentativo autoplay tramite interazione fallito:', e);
                });
            }
        };
        
        // Aggiungi event listener per sbloccare l'audio al primo click/touch
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        
        // Aggiungi event listener per tentare l'autoplay tramite interazione
        document.addEventListener('click', tryAutoplayOnInteraction);
        document.addEventListener('touchstart', tryAutoplayOnInteraction);
        document.addEventListener('mousedown', tryAutoplayOnInteraction);
        document.addEventListener('keydown', tryAutoplayOnInteraction);
        
        // Prova anche con eventi di movimento del mouse
        document.addEventListener('mousemove', tryAutoplayOnInteraction);
        document.addEventListener('scroll', tryAutoplayOnInteraction);
        
        // Forza l'avvio dell'audio al primo click ovunque
        const forceAudioStart = () => {
            if (this.audioPlayer && this.isAudioMuted === false && this.audioPlayer.paused) {
                this.audioPlayer.play().then(() => {
                    console.log('Audio forzato al primo click ovunque');
                    this.isAudioMuted = false;
                    this.updateAudioButton();
                    // Rimuovi l'event listener dopo il successo
                    document.removeEventListener('click', forceAudioStart);
                    document.removeEventListener('touchstart', forceAudioStart);
                }).catch(e => {
                    console.log('Errore nel forzare l\'audio:', e);
                });
            }
        };
        
        document.addEventListener('click', forceAudioStart);
        document.addEventListener('touchstart', forceAudioStart);
    }

    createHiddenAudioButton() {
        // Crea un pulsante nascosto per forzare l'avvio dell'audio
        const audioButton = document.createElement('button');
        audioButton.id = 'hidden-audio-button';
        audioButton.style.position = 'fixed';
        audioButton.style.top = '10px';
        audioButton.style.left = '10px';
        audioButton.style.width = '50px';
        audioButton.style.height = '50px';
        audioButton.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        audioButton.style.border = 'none';
        audioButton.style.borderRadius = '50%';
        audioButton.style.cursor = 'pointer';
        audioButton.style.zIndex = '9999';
        audioButton.style.opacity = '0.3';
        audioButton.style.transition = 'opacity 0.3s';
        audioButton.innerHTML = '🎵';
        audioButton.title = 'Clicca per avviare la musica';
        
        // Mostra il pulsante solo se l'audio non è partito
        audioButton.addEventListener('mouseenter', () => {
            audioButton.style.opacity = '0.8';
        });
        
        audioButton.addEventListener('mouseleave', () => {
            audioButton.style.opacity = '0.3';
        });
        
        audioButton.addEventListener('click', () => {
            if (this.audioPlayer && this.isAudioMuted === false) {
                this.audioPlayer.play().then(() => {
                    console.log('Audio avviato tramite pulsante nascosto');
                    this.isAudioMuted = false;
                    this.updateAudioButton();
                    // Nascondi il pulsante dopo il successo
                    audioButton.style.display = 'none';
                }).catch(e => {
                    console.log('Errore nell\'avvio audio tramite pulsante:', e);
                });
            }
        });
        
        document.body.appendChild(audioButton);
        
        // Nascondi il pulsante dopo 10 secondi se l'audio è partito
        setTimeout(() => {
            if (this.audioPlayer && !this.audioPlayer.paused) {
                audioButton.style.display = 'none';
            }
        }, 10000);
    }

    mostraPopupVittoria(tipoReEliminato) {
        // Determina il giocatore vincitore (opposto al re eliminato)
        const giocatoreVincitore = tipoReEliminato === 'rossa' ? 'Giallo' : 'Rosso';
        const coloreVincitore = tipoReEliminato === 'rossa' ? '#FFD600' : '#FF5252';
        
        // Crea il popup di vittoria
        const popupVittoria = document.createElement('div');
        popupVittoria.className = 'popup-vittoria';
        popupVittoria.style.position = 'fixed';
        popupVittoria.style.top = '50%';
        popupVittoria.style.left = '50%';
        popupVittoria.style.transform = 'translate(-50%, -50%)';
        popupVittoria.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
        popupVittoria.style.color = coloreVincitore;
        popupVittoria.style.padding = '40px';
        popupVittoria.style.borderRadius = '15px';
        popupVittoria.style.border = `3px solid ${coloreVincitore}`;
        popupVittoria.style.zIndex = '2000';
        popupVittoria.style.fontSize = '24px';
        popupVittoria.style.fontWeight = 'bold';
        popupVittoria.style.textAlign = 'center';
        popupVittoria.style.boxShadow = `0 0 20px ${coloreVincitore}`;
        popupVittoria.style.animation = 'vittoriaPulse 2s infinite';
        
        popupVittoria.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 36px;">🏆</div>
            <div>VITTORIA DEL GIOCATORE</div>
            <div style="font-size: 32px; margin-top: 10px;">${giocatoreVincitore.toUpperCase()}</div>
            <div style="margin-top: 20px; font-size: 16px; color: white;">Il re ${tipoReEliminato === 'rossa' ? 'rosso' : 'giallo'} è stato eliminato!</div>
        `;
        
        // Aggiungi l'animazione CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes vittoriaPulse {
                0% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.05); }
                100% { transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(popupVittoria);
        
        // Il popup rimane visibile per sempre (o fino a ricaricare la pagina)
        // L'utente può chiudere la pagina e ricaricare per una nuova partita
    }

    isCasellaAdiacenteAlRe(row, col, reRow, reCol) {
        const isColonnaDispari = reCol % 2 === 0;
        const directions = isColonnaDispari ? 
            [[0, 1], [0, -1], [1, 0], [-1, 1], [-1, 0], [-1, -1]] : // Colonne dispari
            [[0, 1], [0, -1], [1, 0], [1, -1], [-1, 0], [1, 1]];   // Colonne pari
        
        return directions.some(([dr, dc]) => {
            return reRow + dr === row && reCol + dc === col;
        });
    }
    
    isCasellaAdiacenteAlCapitano(row, col, capitanoRow, capitanoCol) {
        // Il capitano ha lo stesso comportamento del re
        return this.isCasellaAdiacenteAlRe(row, col, capitanoRow, capitanoCol);
    }
    
    isPedinaInRaggioCapitanoORe(pedina) {
        const row = parseInt(pedina.dataset.row);
        const col = parseInt(pedina.dataset.col);
        const tipo = pedina.dataset.tipo;
        
        // Trova tutti i capitani e re della stessa squadra
        const capitaniERe = document.querySelectorAll(`.pedina[data-tipo="${tipo}"][data-ruolo="capitano"], .pedina[data-tipo="${tipo}"][data-ruolo="re"]`);
        
        // Debug: log delle posizioni
        console.log(`Controllo pedina in (${row}, ${col}) per squadra ${tipo}`);
        
        for (const unitaSpeciale of capitaniERe) {
            const unitaRow = parseInt(unitaSpeciale.dataset.row);
            const unitaCol = parseInt(unitaSpeciale.dataset.col);
            const ruolo = unitaSpeciale.dataset.ruolo;
            
            // Calcola la distanza dalla pedina all'unità speciale
            const distanza = this.calcolaDistanzaEuclidea(row, col, unitaRow, unitaCol);
            
            // Il capitano ha raggio 2, il re ha raggio 3
            const raggioMassimo = ruolo === 'capitano' ? 2 : 3;
            
            console.log(`  ${ruolo} in (${unitaRow}, ${unitaCol}): distanza=${distanza}, raggio=${raggioMassimo}, inRaggio=${distanza <= raggioMassimo}`);
            
            if (distanza <= raggioMassimo) {
                console.log(`  ✓ Pedina in (${row}, ${col}) è nel raggio del ${ruolo}`);
                return true; // La pedina è nel raggio d'azione
            }
        }
        
        console.log(`  ✗ Pedina in (${row}, ${col}) NON è nel raggio di nessuna unità speciale`);
        return false; // La pedina non è nel raggio d'azione di nessuna unità speciale
    }
    
    calcolaDistanzaEuclidea(row1, col1, row2, col2) {
        // Calcola la distanza esagonale tra due punti usando l'algoritmo corretto
        const dx = col2 - col1;
        const dy = row2 - row1;
        
        console.log(`  Calcolo distanza da (${row1}, ${col1}) a (${row2}, ${col2}): dx=${dx}, dy=${dy}`);
        
        // Algoritmo corretto per distanza esagonale su griglia offset
        // Per una griglia esagonale, la distanza è il massimo tra le differenze assolute
        // con un aggiustamento per la disposizione esagonale
        
        let distanza;
        
        // Se le colonne sono entrambe pari o entrambe dispari
        if ((col1 % 2 === 0) === (col2 % 2 === 0)) {
            // Calcolo standard per colonne dello stesso tipo
            distanza = Math.max(Math.abs(dx), Math.abs(dy));
            console.log(`  Colonne dello stesso tipo: distanza = max(|${dx}|, |${dy}|) = ${distanza}`);
        } else {
            // Una colonna è pari e l'altra dispari
            // Aggiustamento per la disposizione esagonale
            if (col1 % 2 === 0) {
                // col1 è pari, col2 è dispari
                if (dy > 0) {
                    distanza = Math.max(Math.abs(dx), Math.abs(dy) - 0.5);
                } else {
                    distanza = Math.max(Math.abs(dx), Math.abs(dy) + 0.5);
                }
                console.log(`  col1 pari, col2 dispari, dy>0: distanza = max(|${dx}|, |${dy}| ${dy > 0 ? '-0.5' : '+0.5'}) = ${distanza}`);
            } else {
                // col1 è dispari, col2 è pari
                if (dy < 0) {
                    distanza = Math.max(Math.abs(dx), Math.abs(dy) + 0.5);
                } else {
                    distanza = Math.max(Math.abs(dx), Math.abs(dy) - 0.5);
                }
                console.log(`  col1 dispari, col2 pari, dy<0: distanza = max(|${dx}|, |${dy}| ${dy < 0 ? '+0.5' : '-0.5'}) = ${distanza}`);
            }
        }
        
        console.log(`  Distanza finale calcolata: ${distanza}`);
        return distanza;
    }

    calcolaPosizioniADistanza(row, col, distanza) {
        const posizioni = new Set();
        const isColonnaDispari = col % 2 === 0;
        const directions = isColonnaDispari ? 
            [[0, 1], [0, -1], [1, 0], [-1, 1], [-1, 0], [-1, -1]] : // Colonne dispari
            [[0, 1], [0, -1], [1, 0], [1, -1], [-1, 0], [1, 1]];   // Colonne pari
        
        // Funzione ricorsiva per calcolare tutte le posizioni a distanza specificata
        const calcolaPosizioni = (r, c, distRimanente, percorso) => {
            if (distRimanente === 0) {
                posizioni.add(`${r},${c}`);
                return;
            }
            
            directions.forEach(([dr, dc]) => {
                const newR = r + dr;
                const newC = c + dc;
                const chiave = `${newR},${newC}`;
                
                if (this.isValidHex(newR, newC) && !percorso.has(chiave)) {
                    percorso.add(chiave);
                    calcolaPosizioni(newR, newC, distRimanente - 1, percorso);
                    percorso.delete(chiave);
                }
            });
        };
        
        calcolaPosizioni(row, col, distanza, new Set());
        
        // Converti le stringhe in array di coordinate
        return Array.from(posizioni).map(pos => {
            const [r, c] = pos.split(',').map(Number);
            return [r, c];
        });
    }

    clearReachableHexes() {
        document.querySelectorAll('.hex.reachable, .hex.reachable-enemy, .hex.re-reachable, .hex.re-reachable-distance2, .hex.re-reachable-distance3').forEach(hex => {
            hex.classList.remove('reachable', 'reachable-enemy', 're-reachable', 're-reachable-distance2', 're-reachable-distance3');
        });
    }

    passaTurno() {
        if (this.faseTurno === 'movimento') {
            // Se c'è una pedina selezionata, deselezionala prima di passare alla fase combattimento
            if (this.pedinaAttiva) {
                this.deselectPedina();
            }
            
            // Passa alla fase combattimento
            this.faseTurno = 'combattimento';
            this.pedineAttaccanti.clear(); // Reset delle pedine attaccanti all'inizio della fase di combattimento
            
            // Identifica e memorizza i combattimenti iniziali
            this.combattimentiInizialiRegistrati = new Set();
            const pedineGiocatoreAttuale = document.querySelectorAll(`.pedina-${this.turno === 1 ? 'rossa' : 'gialla'}`);
            
            pedineGiocatoreAttuale.forEach(pedina => {
                const row = parseInt(pedina.dataset.row);
                const col = parseInt(pedina.dataset.col);
                const direzioni = this.getDirezioni(col);
                
                direzioni.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    
                    if (this.isValidHex(newRow, newCol)) {
                        const pedineNemiche = document.querySelectorAll(
                            `.pedina[data-row="${newRow}"][data-col="${newCol}"]` +
                            `.pedina-${this.turno === 1 ? 'gialla' : 'rossa'}`
                        );
                        
                        if (pedineNemiche.length > 0) {
                            // Registra questo combattimento usando una chiave univoca
                            const chiaveCombattimento = `${row},${col}-${newRow},${newCol}`;
                            this.combattimentiInizialiRegistrati.add(chiaveCombattimento);
                        }
                    }
                });
            });
            
            // Mostra gli indicatori solo per i combattimenti registrati
            this.identificaCombattimentiPotenziali();
            this.updateUI();
        } else {
            // Verifica se ci sono ancora combattimenti da risolvere tra quelli iniziali
            const combattimentiRimanenti = document.querySelectorAll('.spade-combattimento');
            if (combattimentiRimanenti.length > 0) {
                // Se ci sono ancora combattimenti da risolvere, mostra un messaggio
                alert('Devi risolvere tutti i combattimenti prima di passare al turno successivo!');
                return;
            }

            // Resetta tutto e passa al turno successivo
            this.rimuoviIndicatoriCombattimento();
            // Resetta il contatore delle mosse per tutte le pedine del giocatore che ha appena finito
            const pedine = document.querySelectorAll(`.pedina-${this.turno === 1 ? 'rossa' : 'gialla'}`);
            pedine.forEach(pedina => {
                pedina.dataset.mosseEffettuate = '0';
                pedina.classList.remove('ha-attaccato'); // Rimuovi la classe che indica che la pedina ha attaccato
            });

            if (this.pedinaAttiva) {
                this.deselectPedina();
            }

            // Pulisci la lista dei combattimenti registrati e delle pedine attaccanti
            this.combattimentiInizialiRegistrati = null;
            this.pedineAttaccanti.clear();

            this.turno = this.turno === 1 ? 2 : 1;
            this.faseTurno = 'movimento';
            this.updateUI();
        }
    }

    identificaCombattimentiPotenziali() {
        this.rimuoviIndicatoriCombattimento();
        
        // Se non siamo in fase di combattimento o non ci sono combattimenti registrati, non fare nulla
        if (this.faseTurno !== 'combattimento' || !this.combattimentiInizialiRegistrati) {
            return;
        }

        const pedineGiocatoreAttuale = document.querySelectorAll(`.pedina-${this.turno === 1 ? 'rossa' : 'gialla'}`);
        
        pedineGiocatoreAttuale.forEach(pedina => {
            const row = parseInt(pedina.dataset.row);
            const col = parseInt(pedina.dataset.col);
            
            // Se la pedina ha già attaccato, non mostrare i suoi potenziali combattimenti
            if (this.pedineAttaccanti.has(pedina)) {
                return;
            }
            
            // Controlla gli esagoni adiacenti
            const direzioni = this.getDirezioni(col);
            
            direzioni.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isValidHex(newRow, newCol)) {
                    // Verifica se questo combattimento era stato registrato all'inizio della fase
                    const chiaveCombattimento = `${row},${col}-${newRow},${newCol}`;
                    
                    if (this.combattimentiInizialiRegistrati.has(chiaveCombattimento)) {
                        const pedineNemiche = document.querySelectorAll(
                            `.pedina[data-row="${newRow}"][data-col="${newCol}"]` +
                            `.pedina-${this.turno === 1 ? 'gialla' : 'rossa'}`
                        );
                        
                        if (pedineNemiche.length > 0) {
                            // Crea l'indicatore di combattimento (freccia)
                            const freccia = document.createElement('div');
                            freccia.className = 'spade-combattimento';
                            
                            // Trova l'esagono corrispondente alla pedina nemica
                            const hex = document.querySelector(`.hex[data-row="${newRow}"][data-col="${newCol}"]`);
                            if (hex) {
                                const x = parseFloat(hex.style.left) + this.hexSize / 2;
                                const y = parseFloat(hex.style.top) + this.hexSize / 2;
                                
                                freccia.style.left = `${x}mm`;
                                freccia.style.top = `${y}mm`;
                                
                                freccia.dataset.row1 = row;
                                freccia.dataset.col1 = col;
                                freccia.dataset.row2 = newRow;
                                freccia.dataset.col2 = newCol;
                                
                                freccia.addEventListener('click', () => {
                                    if (this.faseTurno === 'combattimento') {
                                        this.apriPopupCombattimento(row, col, newRow, newCol);
                                    }
                                });
                                
                                // Aggiungi supporto per touch screen
                                freccia.addEventListener('touchstart', (e) => {
                                    e.preventDefault(); // Previeni il comportamento di default
                                    if (this.faseTurno === 'combattimento') {
                                        this.apriPopupCombattimento(row, col, newRow, newCol);
                                    }
                                });
                                
                                this.plancia.appendChild(freccia);
                            }
                        }
                    }
                }
            });
        });
    }

    apriPopupCombattimento(row1, col1, row2, col2) {
        // Trova l'indicatore di combattimento specifico per questo scontro
        const indicatoreDaRimuovere = document.querySelector(
            `.spade-combattimento[data-row1="${row1}"][data-col1="${col1}"][data-row2="${row2}"][data-col2="${col2}"]`
        );

        // Identifica le pedine in difesa solo nella casella attaccata
        const pedineInDifesa = document.querySelectorAll(
            `.pedina[data-row="${row2}"][data-col="${col2}"]`
        );
        const tipoDifensore = pedineInDifesa[0].dataset.tipo;
        const tipoAttaccante = tipoDifensore === 'rossa' ? 'gialla' : 'rossa';
        
        // Calcola la forza totale di difesa (solo pedine nella casella attaccata)
        let forzaTotaleDifesa = 0;
        pedineInDifesa.forEach(pedina => {
            if (pedina.dataset.tipo === tipoDifensore) {
                forzaTotaleDifesa += parseInt(pedina.dataset.forza);
            }
        });

        // Calcola la forza totale di attacco considerando tutte le pedine adiacenti
        let forzaTotaleAttacco = 0;
        let pedineAttaccanti = new Set();

        // Trova tutte le pedine attaccanti adiacenti alla pedina in difesa
        const direzioni = this.getDirezioni(col2);
        direzioni.forEach(([dr, dc]) => {
            const newRow = parseInt(row2) + dr;
            const newCol = parseInt(col2) + dc;
            
            if (this.isValidHex(newRow, newCol)) {
                const pedineAttaccantiQui = document.querySelectorAll(
                    `.pedina[data-row="${newRow}"][data-col="${newCol}"][data-tipo="${tipoAttaccante}"]`
                );
                
                pedineAttaccantiQui.forEach(pedina => {
                    if (!pedineAttaccanti.has(pedina)) {
                        pedineAttaccanti.add(pedina);
                    }
                });
            }
        });

        // Converti il Set in Array per uso successivo
        pedineAttaccanti = Array.from(pedineAttaccanti);

        // Verifica se è una carica di cavalleria
        const isCaricaCavalleria = pedineAttaccanti.some(pedina => pedina.dataset.ruolo === 'cavalleria');

        // Se è una carica di cavalleria, considera solo le unità di cavalleria per la forza totale
        if (isCaricaCavalleria) {
            forzaTotaleAttacco = pedineAttaccanti
                .filter(pedina => pedina.dataset.ruolo === 'cavalleria')
                .reduce((totale, pedina) => totale + parseInt(pedina.dataset.forza), 0);
        } else {
            // Se non è una carica di cavalleria, considera tutte le unità
            forzaTotaleAttacco = pedineAttaccanti.reduce((totale, pedina) => totale + parseInt(pedina.dataset.forza), 0);
        }

        // Sistema di combattimento appropriato
        let battleSystem;
        if (isCaricaCavalleria) {
            battleSystem = {
                differences: [-1, 0, 1, 2, 3],
                outcomes: [
                    ["A3", "A2", "A1", "D1", "D1", "D2"], // -1
                    ["A2", "A1", "D1", "D1", "D2", "D2"], // 0
                    ["A1", "D1", "D1", "D2", "D2", "D3"], // 1
                    ["D1", "D1", "D2", "D2", "D3", "D4"], // 2
                    ["D1", "D2", "D2", "D3", "D4", "D5"]  // 3
                ]
            };
        } else {
            battleSystem = {
                ratios: [
                    { value: 1/6, label: "1:6" },
                    { value: 1/5, label: "1:5" },
                    { value: 1/4, label: "1:4" },
                    { value: 1/3, label: "1:3" },
                    { value: 1/2, label: "1:2" },
                    { value: 1/1, label: "1:1" },
                    { value: 1.5/1, label: "1.5:1" },
                    { value: 2/1, label: "2:1" },
                    { value: 2.5/1, label: "2.5:1" },
                    { value: 3/1, label: "3:1" },
                    { value: 4/1, label: "4:1" },
                    { value: 5/1, label: "5:1" },
                    { value: 6/1, label: "6:1" }
                ],
                outcomes: [
                    ["A6", "A5", "A4", "A3", "A2", "A2", "A1", "A1", "D1", "D1", "D2", "D2", "D3"],
                    ["A5", "A4", "A3", "A2", "A2", "A1", "A1", "D1", "D1", "D2", "D2", "D3", "D4"],
                    ["A4", "A3", "A2", "A2", "A1", "A1", "D1", "D1", "D2", "D2", "D3", "D4", "D5"],
                    ["A3", "A2", "A2", "A1", "A1", "D1", "D1", "D2", "D2", "D3", "D4", "D5", "D6"],
                    ["A2", "A2", "A1", "A1", "D1", "D1", "D2", "D2", "D3", "D4", "D5", "D6", "D7"],
                    ["A2", "A1", "A1", "D1", "D1", "D2", "D2", "D3", "D4", "D5", "D6", "D7", "D8"]
                ]
            };
        }

        const popup = document.createElement('div');
        popup.className = 'popup-combattimento';
        
        const titolo = document.createElement('h2');
        titolo.innerHTML = isCaricaCavalleria ? 'CARICA DI CAVALLERIA 🐎' : 'Risoluzione Combattimento';
        
        const chiudi = document.createElement('button');
        chiudi.textContent = '×';
        chiudi.className = 'chiudi-popup';
        chiudi.onclick = () => {
            popup.remove();
            // Rimuovi solo l'indicatore specifico di questo combattimento
            if (indicatoreDaRimuovere) {
                indicatoreDaRimuovere.remove();
            }
        };

        // Calcola il rapporto o la differenza di forza
        let combatValue, combatDisplay;
        if (isCaricaCavalleria) {
            combatValue = forzaTotaleAttacco - forzaTotaleDifesa;
            // Limita la differenza tra -1 e 3
            combatValue = Math.max(-1, Math.min(3, combatValue));
            combatDisplay = combatValue >= 0 ? `+${combatValue}` : combatValue.toString();
        } else {
        const ratio = forzaTotaleAttacco / forzaTotaleDifesa;
        const selectedRatio = battleSystem.ratios.reduce((prev, curr) => 
            Math.abs(curr.value - ratio) < Math.abs(prev.value - ratio) ? curr : prev
        );
            combatValue = selectedRatio;
            combatDisplay = selectedRatio.label;
        }

        // Crea il contenuto del popup
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="combat-details">
                <p><strong>Attaccante (${tipoAttaccante === 'rossa' ? 'Rosso' : 'Giallo'})</strong>: ${forzaTotaleAttacco}</p>
                <p><strong>Difensore (${tipoDifensore === 'rossa' ? 'Rosso' : 'Giallo'})</strong>: ${forzaTotaleDifesa}</p>
                <p><strong>${isCaricaCavalleria ? 'Differenza di Forza' : 'Rapporto di Forza'}</strong>: <span id="ratio-display">${combatDisplay}</span></p>
                <div class="dice-container">
                    <div class="dice" id="combat-dice">⚅</div>
                    <p>Risultato dado: <span id="dice-display">-</span></p>
                </div>
                <p><strong>Esito</strong>: <span id="outcome-display">-</span></p>
                <p><strong>Azione Richiesta</strong>: <span id="action-required">-</span></p>
                <button id="roll-dice" class="combat-button">Lancia il Dado</button>
            </div>
        `;

        popup.appendChild(titolo);
        popup.appendChild(chiudi);
        popup.appendChild(content);
        document.body.appendChild(popup);

        // Elementi per l'aggiornamento dinamico
        const diceDisplay = document.getElementById('dice-display');
        const outcomeDisplay = document.getElementById('outcome-display');
        const actionRequired = document.getElementById('action-required');
        const dice = document.getElementById('combat-dice');
        const rollButton = document.getElementById('roll-dice');

        // Gestione del lancio del dado
        rollButton.onclick = () => {
            dice.classList.add("rolling");
            rollButton.disabled = true;
            
            // Animazione del dado
            let counter = 0;
            const animationInterval = setInterval(() => {
                dice.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][Math.floor(Math.random() * 6)];
                counter++;
                if (counter > 10) {
                    clearInterval(animationInterval);
                    // Risultato finale del dado
                    const diceRoll = Math.floor(Math.random() * 6);
                    const diceValue = diceRoll + 1;
                    
                    dice.classList.remove("rolling");
                    dice.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][diceRoll];
                    
                    let outcome;
                    if (isCaricaCavalleria) {
                        const differenceIndex = battleSystem.differences.indexOf(combatValue);
                        outcome = battleSystem.outcomes[differenceIndex][diceRoll];
                    } else {
                        const ratioIndex = battleSystem.ratios.indexOf(combatValue);
                        outcome = battleSystem.outcomes[diceRoll][ratioIndex];
                    }
                    
                    diceDisplay.textContent = diceValue;
                    outcomeDisplay.textContent = outcome;

                    const danno = parseInt(outcome.substring(1)) || 0;
                    const tipoEsito = outcome.charAt(0);

                    let pedineCheDevonoRitirare = [];
                    let pedineEliminateCount = 0;
                    let pedineEliminateTotal = 0;

                    const eliminaPedinaConEffetto = (pedina) => {
                        // Controlla se la pedina eliminata è un re
                        const isRe = pedina.dataset.ruolo === 're';
                        const tipoRe = pedina.dataset.tipo;
                        
                        pedina.style.transition = 'opacity 1s ease-out';
                        pedina.style.opacity = '0';
                        setTimeout(() => {
                            pedina.remove();
                            pedineEliminateCount++;
                            
                            // Se è stato eliminato un re, mostra il popup di vittoria
                            if (isRe) {
                                this.mostraPopupVittoria(tipoRe);
                            }
                            
                            if (pedineEliminateCount === pedineEliminateTotal) {
                                // Rimuovi immediatamente l'indicatore se tutte le pedine sono state eliminate
                                if (pedineCheDevonoRitirare.length === 0) {
                                    // Rimuovi l'indicatore specifico e tutti gli altri indicatori associati a questo combattimento
                                    if (indicatoreDaRimuovere) {
                                        indicatoreDaRimuovere.remove();
                                    }
                                    // Cerca e rimuovi eventuali altri indicatori che coinvolgono le stesse coordinate
                                    document.querySelectorAll('.spade-combattimento').forEach(indicatore => {
                                        const row1 = parseInt(indicatore.dataset.row1);
                                        const col1 = parseInt(indicatore.dataset.col1);
                                        const row2 = parseInt(indicatore.dataset.row2);
                                        const col2 = parseInt(indicatore.dataset.col2);
                                        
                                        // Se l'indicatore coinvolge una delle posizioni del combattimento appena risolto
                                        if ((row1 === parseInt(indicatoreDaRimuovere.dataset.row1) && col1 === parseInt(indicatoreDaRimuovere.dataset.col1)) ||
                                            (row2 === parseInt(indicatoreDaRimuovere.dataset.row2) && col2 === parseInt(indicatoreDaRimuovere.dataset.col2))) {
                                            indicatore.remove();
                                        }
                                    });
                                    
                                    setTimeout(() => {
                                        popup.style.transition = 'opacity 1s ease-out';
                                        popup.style.opacity = '0';
                                        setTimeout(() => {
                                            popup.remove();
                                            // Verifica se ci sono altri combattimenti da risolvere
                                            const altriIndicatori = document.querySelectorAll('.spade-combattimento');
                                            if (altriIndicatori.length === 0) {
                                                this.faseTurno = 'movimento';
                                                this.updateUI();
                                            }
                                        }, 1000);
                                    }, 1000);
                                } else {
                                    setTimeout(() => {
                                        const bersaglio = tipoEsito === 'D' ? 'difensore' : 'attaccante';
                                        actionRequired.textContent = `Seleziona le pedine da ritirare insieme (${danno} esagoni ciascuna)`;
                                        this.mostraPopupSelezionePedineRitirata(pedineCheDevonoRitirare, danno, popup, indicatoreDaRimuovere);
                                    }, 1000);
                                }
                            }
                        }, 1000);
                    };

                    if (tipoEsito === 'D') {
                        // Se il difensore perde, tutte le pedine in difesa devono ritirarsi
                        pedineInDifesa.forEach(pedina => {
                            const movimentoPedina = parseInt(pedina.dataset.movimento);
                            if (danno > movimentoPedina) {
                                pedineEliminateTotal++;
                            } else {
                                pedineCheDevonoRitirare.push(pedina);
                            }
                        });
                        // Ora elimina le pedine con l'effetto
                        pedineInDifesa.forEach(pedina => {
                            if (danno > parseInt(pedina.dataset.movimento)) {
                                eliminaPedinaConEffetto(pedina);
                            }
                        });
                    } else {
                        // Se l'attaccante perde, tutte le pedine attaccanti devono ritirarsi
                        pedineAttaccanti.forEach(pedina => {
                            const movimentoPedina = parseInt(pedina.dataset.movimento);
                            if (danno > movimentoPedina) {
                                pedineEliminateTotal++;
                            } else {
                                pedineCheDevonoRitirare.push(pedina);
                            }
                        });
                        // Ora elimina le pedine con l'effetto
                        pedineAttaccanti.forEach(pedina => {
                            if (danno > parseInt(pedina.dataset.movimento)) {
                                eliminaPedinaConEffetto(pedina);
                            }
                        });
                    }

                    // Se non ci sono pedine da eliminare ma solo da ritirare
                    if (pedineEliminateTotal === 0 && pedineCheDevonoRitirare.length > 0) {
                        const bersaglio = tipoEsito === 'D' ? 'difensore' : 'attaccante';
                        actionRequired.textContent = `Seleziona le pedine da ritirare insieme (${danno} esagoni ciascuna)`;
                        this.mostraPopupSelezionePedineRitirata(pedineCheDevonoRitirare, danno, popup, indicatoreDaRimuovere);
                    } else if (pedineEliminateTotal > 0 && pedineCheDevonoRitirare.length === 0) {
                        // Se ci sono solo pedine da eliminare e nessuna da ritirare
                        // Rimuovi immediatamente l'indicatore
                        if (indicatoreDaRimuovere) {
                            indicatoreDaRimuovere.remove();
                        }
                        setTimeout(() => {
                            popup.style.transition = 'opacity 1s ease-out';
                            popup.style.opacity = '0';
                            setTimeout(() => {
                                popup.remove();
                            }, 1000);
                        }, 1000);
                    }
                }
            }, 100);
        };
    }

    mostraPopupSelezionePedineRitirata(pedine, movimentiRichiesti, combatPopup, indicatoreDaRimuovere) {
        // Crea il popup
        const popup = document.createElement('div');
        popup.className = 'popup-selezione-pedine';
        
        // Aggiungi il titolo
        const titolo = document.createElement('h2');
        titolo.textContent = 'Seleziona Pedine da Ritirare Insieme';
        
        // Aggiungi il pulsante di chiusura
        const chiudi = document.createElement('button');
        chiudi.textContent = '×';
        chiudi.className = 'chiudi-popup';
        chiudi.onclick = () => {
            popup.remove();
            combatPopup.remove();
            // Assicurati che l'indicatore venga rimosso
            if (indicatoreDaRimuovere) {
                indicatoreDaRimuovere.remove();
            }
            // Controlla se ci sono altri indicatori di combattimento
            const altriIndicatori = document.querySelectorAll('.spade-combattimento');
            if (altriIndicatori.length === 0) {
                // Se non ci sono altri combattimenti da risolvere, abilita il passaggio del turno
                this.faseTurno = 'movimento';
                this.updateUI();
            }
        };

        // Crea la lista delle pedine
        const listaPedine = document.createElement('div');
        listaPedine.className = 'lista-pedine';

        // Array per tenere traccia delle pedine selezionate
        const pedineSelezionate = new Set();
        
        pedine.forEach((pedina, index) => {
            const pedinaEl = document.createElement('div');
            pedinaEl.className = 'pedina-selezionabile';
            
            // Clona l'immagine della pedina per mostrarla nel popup
            const clonePedina = pedina.cloneNode(true);
            clonePedina.style.position = 'static';
            clonePedina.style.transform = 'none';
            
            const info = document.createElement('div');
            info.className = 'pedina-info';
            info.textContent = `Pedina ${index + 1}`;
            
            pedinaEl.appendChild(clonePedina);
            pedinaEl.appendChild(info);
            
            pedinaEl.onclick = () => {
                pedinaEl.classList.toggle('selected');
                if (pedinaEl.classList.contains('selected')) {
                    pedineSelezionate.add(pedina);
                } else {
                    pedineSelezionate.delete(pedina);
                }
                // Abilita/disabilita il pulsante di conferma in base alle selezioni
                conferma.disabled = pedineSelezionate.size === 0;
            };
            
            listaPedine.appendChild(pedinaEl);
        });

        // Aggiungi il pulsante di conferma
        const conferma = document.createElement('button');
        conferma.className = 'conferma-selezione';
        conferma.textContent = 'Conferma Selezione';
        conferma.disabled = true;
        
        conferma.onclick = () => {
            popup.remove();
            
            const pedineSelezionateArray = Array.from(pedineSelezionate);
            pedine = pedine.filter(p => !pedineSelezionate.has(p));

            this.gestisciRitirataMultipla(pedineSelezionateArray, movimentiRichiesti, () => {
                if (pedine.length > 0) {
                    this.mostraPopupSelezionePedineRitirata(pedine, movimentiRichiesti, combatPopup, indicatoreDaRimuovere);
                } else {
                    // Se tutte le pedine hanno completato la ritirata
                    combatPopup.style.transition = 'opacity 1s ease-out';
                    combatPopup.style.opacity = '0';
                    setTimeout(() => {
                        combatPopup.remove();
                        if (indicatoreDaRimuovere) {
                            indicatoreDaRimuovere.remove();
                        }
                    }, 1000);
                }
            });
        };

        // Assembla il popup
        popup.appendChild(titolo);
        popup.appendChild(chiudi);
        popup.appendChild(listaPedine);
        popup.appendChild(conferma);
        
        // Aggiungi il popup al documento
        document.body.appendChild(popup);
    }

    gestisciRitirataMultipla(pedine, movimentiRichiesti, onComplete) {
        // Per ogni pedina, il numero di movimenti richiesti non può superare il suo valore movimento
        const pedineConMovimenti = pedine.map(pedina => ({
            pedina,
            movimentiRimanenti: Math.min(movimentiRichiesti, parseInt(pedina.dataset.movimento))
        }));
        
        const gestisciMossa = () => {
            // Filtra le pedine che hanno ancora movimenti da fare
            const pedineAttive = pedineConMovimenti.filter(p => p.movimentiRimanenti > 0);
            
            if (pedineAttive.length > 0) {
                // Mostra gli esagoni disponibili solo per le pedine che hanno ancora movimenti
                pedineAttive.forEach(({pedina}) => {
                    this.mostraEsagoniRitirata(pedina);
                });

                const handleClick = (e) => {
                    const hex = e.target.closest('.hex.ritirata');
                    if (!hex) return;

                    const row = parseInt(hex.dataset.row);
                    const col = parseInt(hex.dataset.col);

                    // Muovi tutte le pedine attive nella nuova posizione e verifica il contatto nemico
                    const pedineEliminare = [];
                    pedineAttive.forEach(item => {
                        this.movePedinaTo(item.pedina, row, col);
                        item.movimentiRimanenti--;
                        
                        // Se la pedina è adiacente a un nemico dopo la ritirata, viene marcata per l'eliminazione
                        if (this.verificaContattoNemico(item.pedina, row, col)) {
                            pedineEliminare.push(item.pedina);
                        }
                    });

                    // Se ci sono pedine da eliminare, eliminale
                    if (pedineEliminare.length > 0) {
                        pedineEliminare.forEach(pedina => this.eliminaPedinaConMessaggio(pedina));
                        // Rimuovi queste pedine dalla lista delle pedine attive
                        pedineConMovimenti.forEach(item => {
                            if (pedineEliminare.includes(item.pedina)) {
                                item.movimentiRimanenti = 0;
                            }
                        });
                    }

                    this.rimuoviEsagoniRitirata();

                    // Rimuovi i listener prima di procedere
                    this.plancia.removeEventListener('click', handleClick);
                    this.plancia.removeEventListener('contextmenu', handleRightClick);

                    if (pedineAttive.some(p => p.movimentiRimanenti > 0)) {
                        // Aspetta un momento prima di mostrare il prossimo set di caselle
                        setTimeout(() => {
                            gestisciMossa();
                        }, 100);
                    } else {
                        // Rimuovi tutti gli indicatori di combattimento rimanenti
                        const indicatoriRimanenti = document.querySelectorAll('.spade-combattimento');
                        indicatoriRimanenti.forEach(indicatore => indicatore.remove());
                        
                        // Passa alla fase movimento se non ci sono altri combattimenti
                        const altriIndicatori = document.querySelectorAll('.spade-combattimento');
                        if (altriIndicatori.length === 0) {
                            this.faseTurno = 'movimento';
                            this.updateUI();
                        }
                        
                        onComplete();
                    }
                };

                const handleRightClick = (e) => {
                    e.preventDefault();
                    const hex = e.target.closest('.hex.ritirata-sovrapponibile');
                    if (!hex) return;

                    const row = parseInt(hex.dataset.row);
                    const col = parseInt(hex.dataset.col);

                    // Verifica che ci sia spazio per tutte le pedine
                    const pedineNellaCasella = document.querySelectorAll(
                        `.pedina[data-row="${row}"][data-col="${col}"]`
                    ).length;

                    if (pedineNellaCasella + pedineAttive.length <= 3) {
                        // Muovi tutte le pedine attive nella nuova posizione e verifica il contatto nemico
                        const pedineEliminare = [];
                        pedineAttive.forEach(item => {
                            this.movePedinaTo(item.pedina, row, col);
                            item.movimentiRimanenti--;
                            
                            // Se la pedina è adiacente a un nemico dopo la ritirata, viene marcata per l'eliminazione
                            if (this.verificaContattoNemico(item.pedina, row, col)) {
                                pedineEliminare.push(item.pedina);
                            }
                        });

                        // Se ci sono pedine da eliminare, eliminale
                        if (pedineEliminare.length > 0) {
                            pedineEliminare.forEach(pedina => this.eliminaPedinaConMessaggio(pedina));
                            // Rimuovi queste pedine dalla lista delle pedine attive
                            pedineConMovimenti.forEach(item => {
                                if (pedineEliminare.includes(item.pedina)) {
                                    item.movimentiRimanenti = 0;
                                }
                            });
                        }

                        this.rimuoviEsagoniRitirata();

                        // Rimuovi i listener prima di procedere
                        this.plancia.removeEventListener('click', handleClick);
                        this.plancia.removeEventListener('contextmenu', handleRightClick);

                        if (pedineAttive.some(p => p.movimentiRimanenti > 0)) {
                            // Aspetta un momento prima di mostrare il prossimo set di caselle
                            setTimeout(() => {
                                gestisciMossa();
                            }, 100);
                        } else {
                            // Rimuovi tutti gli indicatori di combattimento rimanenti
                            const indicatoriRimanenti = document.querySelectorAll('.spade-combattimento');
                            indicatoriRimanenti.forEach(indicatore => indicatore.remove());
                            
                            // Passa alla fase movimento se non ci sono altri combattimenti
                            const altriIndicatori = document.querySelectorAll('.spade-combattimento');
                            if (altriIndicatori.length === 0) {
                                this.faseTurno = 'movimento';
                                this.updateUI();
                            }
                            
                            onComplete();
                        }
                    }
                };

                this.plancia.addEventListener('click', handleClick);
                this.plancia.addEventListener('contextmenu', handleRightClick);
            } else {
                // Rimuovi tutti gli indicatori di combattimento rimanenti
                const indicatoriRimanenti = document.querySelectorAll('.spade-combattimento');
                indicatoriRimanenti.forEach(indicatore => indicatore.remove());
                
                // Passa alla fase movimento se non ci sono altri combattimenti
                const altriIndicatori = document.querySelectorAll('.spade-combattimento');
                if (altriIndicatori.length === 0) {
                    this.faseTurno = 'movimento';
                    this.updateUI();
                }
                
                onComplete();
            }
        };

        gestisciMossa();
    }

    mostraEsagoniRitirata(pedina) {
        const row = parseInt(pedina.dataset.row);
        const col = parseInt(pedina.dataset.col);
        const tipo = pedina.dataset.tipo;
        
        // Mostra solo gli esagoni adiacenti
        const direzioni = this.getDirezioni(col);
        direzioni.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidHex(newRow, newCol)) {
                const hex = document.querySelector(`.hex[data-row="${newRow}"][data-col="${newCol}"]`);
                if (hex) {
                    // Conta le pedine amiche nella casella di destinazione
                    const pedineAmicheNellaCasella = document.querySelectorAll(
                        `.pedina[data-row="${newRow}"][data-col="${newCol}"][data-tipo="${tipo}"]`
                    ).length;

                    // Se non ci sono pedine nemiche E (non ci sono pedine O ci sono meno di 3 pedine amiche)
                    const pedineNemiche = document.querySelectorAll(
                        `.pedina[data-row="${newRow}"][data-col="${newCol}"]:not([data-tipo="${tipo}"])`
                    ).length;

                    if (pedineNemiche === 0 && pedineAmicheNellaCasella < 3) {
                        hex.classList.add('ritirata');
                        
                        // Se ci sono pedine amiche ma meno di 3, aggiungi una classe speciale
                        if (pedineAmicheNellaCasella > 0) {
                            hex.classList.add('ritirata-sovrapponibile');
                        }
                    }
                }
            }
        });
        
        // Se è un re o capitano, mostra anche le caselle a distanza 2
        if (pedina.dataset.ruolo === 're' || pedina.dataset.ruolo === 'capitano') {
            this.evidenziaCaselleAdiacentiEvidenziate(row, col, tipo);
        }
        
        // Se è solo il re, mostra anche le caselle a distanza 3
        if (pedina.dataset.ruolo === 're') {
            this.evidenziaCaselleDistanza3(row, col, tipo);
        }
    }
    
    mostraMessaggioErrore(messaggio) {
        // Crea un messaggio di errore temporaneo
        const messaggioEl = document.createElement('div');
        messaggioEl.className = 'messaggio-errore';
        messaggioEl.textContent = messaggio;
        messaggioEl.style.position = 'fixed';
        messaggioEl.style.top = '50%';
        messaggioEl.style.left = '50%';
        messaggioEl.style.transform = 'translate(-50%, -50%)';
        messaggioEl.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
        messaggioEl.style.color = 'white';
        messaggioEl.style.padding = '15px 20px';
        messaggioEl.style.borderRadius = '8px';
        messaggioEl.style.fontSize = '16px';
        messaggioEl.style.fontWeight = 'bold';
        messaggioEl.style.zIndex = '3000';
        messaggioEl.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        messaggioEl.style.animation = 'fadeInOut 3s ease-in-out';
        
        document.body.appendChild(messaggioEl);
        
        // Rimuovi il messaggio dopo 3 secondi
        setTimeout(() => {
            messaggioEl.remove();
        }, 3000);
    }

    rimuoviEsagoniRitirata() {
        document.querySelectorAll('.hex.ritirata, .hex.ritirata-sovrapponibile').forEach(hex => {
            hex.classList.remove('ritirata', 'ritirata-sovrapponibile');
        });
    }

    applicaEsitoCombattimento(outcome, difensore, attaccanti) {
        if (outcome === 'E') {
            difensore.remove();
        }
        this.rimuoviIndicatoriCombattimento();
    }

    updateUI() {
        this.turnoIndicatore.textContent = `Turno: Giocatore ${this.turno}`;
        this.turnoIndicatore.style.color = this.turno === 1 ? '#FF5252' : '#FFD600';
        this.faseIndicatore.textContent = `Fase: ${this.faseTurno === 'movimento' ? 'Movimento' : 'Combattimento'}`;
        this.fineTurnoBtn.textContent = this.faseTurno === 'movimento' ? 'Passa a Fase Combattimento' : 'Fine Turno';
    }

    mostraPopupSelezione(pedine) {
        // Crea il popup
        const popup = document.createElement('div');
        popup.className = 'popup-selezione-pedine';
        
        // Aggiungi il titolo
        const titolo = document.createElement('h2');
        titolo.textContent = 'Seleziona Pedine';
        
        // Aggiungi il pulsante di chiusura
        const chiudi = document.createElement('button');
        chiudi.textContent = '×';
        chiudi.className = 'chiudi-popup';
        chiudi.onclick = () => {
            popup.remove();
            // Deseleziona tutte le pedine quando si chiude il popup
            if (this.pedinaAttiva) {
                this.deselectPedina();
            }
        };

        // Crea la lista delle pedine
        const listaPedine = document.createElement('div');
        listaPedine.className = 'lista-pedine';

        // Array per tenere traccia delle pedine selezionate
        const pedineSelezionate = new Set();
        
        pedine.forEach((pedina, index) => {
            const movimento = parseInt(pedina.dataset.movimento);
            const mosseEffettuate = parseInt(pedina.dataset.mosseEffettuate || 0);
            const pedinaEl = document.createElement('div');
            pedinaEl.className = 'pedina-selezionabile';
            
            // Verifica se la pedina è nel raggio d'azione del capitano o re
            const inRaggio = this.isPedinaInRaggioCapitanoORe(pedina);
            
            if (mosseEffettuate >= movimento || !inRaggio) {
                pedinaEl.classList.add('disabled');
            }
            
            // Clona l'immagine della pedina per mostrarla nel popup
            const clonePedina = pedina.cloneNode(true);
            clonePedina.style.position = 'static';
            clonePedina.style.transform = 'none';
            
            const info = document.createElement('div');
            info.className = 'pedina-info';
            
            if (!inRaggio) {
                info.textContent = `Pedina ${index + 1} - Fuori dal raggio d'azione`;
                info.style.color = '#FF6B6B';
            } else if (mosseEffettuate >= movimento) {
                info.textContent = `Pedina ${index + 1} (${mosseEffettuate}/${movimento} mosse)`;
            } else {
                info.textContent = `Pedina ${index + 1} (${mosseEffettuate}/${movimento} mosse)`;
            }
            
            pedinaEl.appendChild(clonePedina);
            pedinaEl.appendChild(info);
            
            if (!pedinaEl.classList.contains('disabled')) {
                pedinaEl.onclick = () => {
                    pedinaEl.classList.toggle('selected');
                    if (pedinaEl.classList.contains('selected')) {
                        pedineSelezionate.add(pedina);
                    } else {
                        pedineSelezionate.delete(pedina);
                    }
                    // Abilita/disabilita il pulsante di conferma in base alle selezioni
                    conferma.disabled = pedineSelezionate.size === 0;
                };
            }
            
            listaPedine.appendChild(pedinaEl);
        });

        // Aggiungi il pulsante di conferma
        const conferma = document.createElement('button');
        conferma.className = 'conferma-selezione';
        conferma.textContent = 'Conferma Selezione';
        conferma.disabled = true;
        
        conferma.onclick = () => {
            // Chiudi il popup
            popup.remove();
            
            // Deseleziona eventuali pedine attive
            if (this.pedinaAttiva) {
                this.deselectPedina();
            }
            
            // Attiva tutte le pedine selezionate
            pedineSelezionate.forEach(pedina => {
                pedina.classList.add('active');
            });
            
            // Imposta la prima pedina come pedina attiva principale
            const primaPedina = pedineSelezionate.values().next().value;
            this.pedinaAttiva = primaPedina;
            this.posizioneAttuale = {
                row: parseInt(primaPedina.dataset.row),
                col: parseInt(primaPedina.dataset.col)
            };
            this.posizioneIniziale = { ...this.posizioneAttuale };
            
            // Mostra gli esagoni raggiungibili
            this.showReachableHexes();
        };

        // Assembla il popup
        popup.appendChild(titolo);
        popup.appendChild(chiudi);
        popup.appendChild(listaPedine);
        popup.appendChild(conferma);
        
        // Aggiungi il popup al documento
        document.body.appendChild(popup);
    }

    aggiornaSovrapposizioni(row, col, tipo) {
        const pedineNellaStessaPosizione = document.querySelectorAll(
            `.pedina[data-row="${row}"][data-col="${col}"][data-tipo="${tipo}"]`
        );
        
        // Rimuovi tutte le classi di sovrapposizione
        pedineNellaStessaPosizione.forEach(p => {
            p.classList.remove('sovrapposta-1', 'sovrapposta-2', 'sovrapposta-3');
        });
        
        // Aggiungi le classi di sovrapposizione appropriate
        if (pedineNellaStessaPosizione.length > 1) {
            pedineNellaStessaPosizione.forEach((p, i) => {
                p.classList.add(`sovrapposta-${i + 1}`);
            });
        }
    }

    sonoPedineAdiacenti(pedina1, pedina2) {
        const row1 = parseInt(pedina1.dataset.row);
        const col1 = parseInt(pedina1.dataset.col);
        const row2 = parseInt(pedina2.dataset.row);
        const col2 = parseInt(pedina2.dataset.col);
        
        const direzioni = this.getDirezioni(col1);
        
        return direzioni.some(([dr, dc]) => {
            return row1 + dr === row2 && col1 + dc === col2;
        });
    }

    sovrapponiPedine(pedinaAttiva, pedinaTarget) {
        // Verifica che non ci siano già 3 pedine nella casella target
        const row = parseInt(pedinaTarget.dataset.row);
        const col = parseInt(pedinaTarget.dataset.col);
        const tipoPedinaCorrente = this.turno === 1 ? 'rossa' : 'gialla';
        const pedineNellaStessaPosizione = document.querySelectorAll(
            `.pedina[data-row="${row}"][data-col="${col}"][data-tipo="${tipoPedinaCorrente}"]`
        );
        
        if (pedineNellaStessaPosizione.length >= 3) {
            return; // Non permettere più di 3 pedine sovrapposte
        }

        // Aggiorna il contatore delle mosse per questa pedina
        const mosseEffettuate = parseInt(pedinaAttiva.dataset.mosseEffettuate || 0) + 1;
        pedinaAttiva.dataset.mosseEffettuate = mosseEffettuate;
        
        // Muovi la pedina attiva nella posizione della pedina target
        this.movePedinaTo(pedinaAttiva, row, col);
        
        // Calcola il numero minimo di mosse rimanenti tra tutte le pedine nella posizione
        let mosseRimanentiMin = Infinity;
        pedineNellaStessaPosizione.forEach(pedina => {
            const movimento = parseInt(pedina.dataset.movimento);
            const mosseEffettuatePedina = parseInt(pedina.dataset.mosseEffettuate || 0);
            const mosseRimanenti = movimento - mosseEffettuatePedina;
            mosseRimanentiMin = Math.min(mosseRimanentiMin, mosseRimanenti);
        });
        
        // Se non ci sono più mosse disponibili, deseleziona automaticamente
        if (mosseRimanentiMin <= 0) {
            this.deselectPedina();
        }
    }

    verificaContattoNemico(pedina, row, col) {
        const direzioni = this.getDirezioni(col);
        const tipoPedina = pedina.dataset.tipo;
        const tipoNemico = tipoPedina === 'rossa' ? 'gialla' : 'rossa';
        
        for (let [dr, dc] of direzioni) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidHex(newRow, newCol)) {
                const pedineNemiche = document.querySelectorAll(
                    `.pedina[data-row="${newRow}"][data-col="${newCol}"].pedina-${tipoNemico}`
                );
                
                if (pedineNemiche.length > 0) {
                    return true; // C'è contatto con il nemico
                }
            }
        }
        return false; // Non c'è contatto con il nemico
    }

    eliminaPedinaConMessaggio(pedina) {
        // Controlla se la pedina eliminata è un re
        const isRe = pedina.dataset.ruolo === 're';
        const tipoRe = pedina.dataset.tipo;
        
        pedina.style.transition = 'opacity 1s ease-out';
        pedina.style.opacity = '0';
        
        const messaggioEliminate = document.createElement('div');
        messaggioEliminate.className = 'messaggio-eliminazione';
        messaggioEliminate.textContent = 'Le unità in ritirata sono state eliminate perché ancora in contatto con il nemico!';
        messaggioEliminate.style.position = 'fixed';
        messaggioEliminate.style.top = '50%';
        messaggioEliminate.style.left = '50%';
        messaggioEliminate.style.transform = 'translate(-50%, -50%)';
        messaggioEliminate.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
        messaggioEliminate.style.color = 'white';
        messaggioEliminate.style.padding = '20px';
        messaggioEliminate.style.borderRadius = '5px';
        messaggioEliminate.style.zIndex = '1000';
        document.body.appendChild(messaggioEliminate);
        
        setTimeout(() => {
            pedina.remove();
            
            // Se è stato eliminato un re, mostra il popup di vittoria
            if (isRe) {
                this.mostraPopupVittoria(tipoRe);
            }
            
            messaggioEliminate.style.opacity = '0';
            setTimeout(() => messaggioEliminate.remove(), 1000);
        }, 1000);
    }

    getDirezioni(col) {
        return col % 2 === 0 ? 
            [[0, 1], [0, -1], [1, 0], [-1, 1], [-1, 0], [-1, -1]] : // Colonne dispari
            [[0, 1], [0, -1], [1, 0], [1, -1], [-1, 0], [1, 1]];   // Colonne pari
    }

    rimuoviIndicatoriCombattimento() {
        document.querySelectorAll('.spade-combattimento').forEach(el => el.remove());
    }

    trovaPedineAttaccantiAdiacenti(rowDifesa, colDifesa) {
        const pedineAttaccanti = new Set();
        const direzioni = this.getDirezioni(colDifesa);
        const tipoAttaccante = this.turno === 1 ? 'rossa' : 'gialla';

        // Verifica se c'è almeno una unità di cavalleria tra gli attaccanti
        let hasCavalleria = false;
        direzioni.forEach(([dr, dc]) => {
            const newRow = rowDifesa + dr;
            const newCol = colDifesa + dc;
            
            if (this.isValidHex(newRow, newCol)) {
                const pedineQui = document.querySelectorAll(
                    `.pedina[data-row="${newRow}"][data-col="${newCol}"].pedina-${tipoAttaccante}`
                );
                
                pedineQui.forEach(pedina => {
                    if (pedina.dataset.ruolo === 'cavalleria') {
                        hasCavalleria = true;
                    }
                });
            }
        });

        // Se c'è cavalleria, includi solo le unità di cavalleria
        if (hasCavalleria) {
            direzioni.forEach(([dr, dc]) => {
                const newRow = rowDifesa + dr;
                const newCol = colDifesa + dc;
                
                if (this.isValidHex(newRow, newCol)) {
                    const pedineQui = document.querySelectorAll(
                        `.pedina[data-row="${newRow}"][data-col="${newCol}"].pedina-${tipoAttaccante}[data-ruolo="cavalleria"]`
                    );
                    
                    pedineQui.forEach(pedina => pedineAttaccanti.add(pedina));
                }
            });
        } else {
            // Se non c'è cavalleria, includi tutte le unità come prima
            direzioni.forEach(([dr, dc]) => {
                const newRow = rowDifesa + dr;
                const newCol = colDifesa + dc;
                
                if (this.isValidHex(newRow, newCol)) {
                    const pedineQui = document.querySelectorAll(
                        `.pedina[data-row="${newRow}"][data-col="${newCol}"].pedina-${tipoAttaccante}`
                    );
                    
                    pedineQui.forEach(pedina => pedineAttaccanti.add(pedina));
                }
            });
        }

        return pedineAttaccanti;
    }
}

window.addEventListener('load', () => {
    window.game = new PlanciaEsagonale(14, 19);
});

window.addEventListener('resize', () => {
    if (window.game) {
        window.game.centerBoard();
    }
});
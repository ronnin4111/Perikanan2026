/**
 * Dashboard Perikanan Budidaya - Main Application Logic
 * Built with Alpine.js, Chart.js, Leaflet
 */

// Register Chart.js datalabels plugin
Chart.register(ChartDataLabels);

// Initialize default Chart colors for dark mode
Chart.defaults.color = '#1e293b';
Chart.defaults.borderColor = '#e2e8f0';

/**
 * Main Alpine.js Application
 * Must be defined BEFORE Alpine.init()
 */
function cleanBlueApp() {
    return {
        // Data
        rawData: [],
        filtered: [],
        isLoading: true,
        
        // Authentication
        isAuthenticated: window.Auth ? window.Auth.isAuthenticated() : false,
        passwordInput: '',
        passwordError: '',
        
        // UI State
        darkMode: localStorage.getItem('darkMode') === 'true',
        sidebarOpen: false,
        filterOpen: true,
        showMapLegend: true,
        
        // Clock
        currentTime: '',
        
        // Chart State
        chartType: 'pie', // 'pie' | 'bar'
        chartFilter: '',
        kecChartMode: 'pelaku_usaha',
        kecChartTitle: 'Pelaku Usaha per Kecamatan',
        kecChartHeight: 300,
        
        // Chart References
        distributionChart: null,
        kecamatanChart: null,
        
        // Filter State
        searchQuery: '',
        selected: {
            kecamatan: [],
            desa: [],
            kelompok: [],
            jenis_usaha: [],
            wadah_budidaya: [],
            jenis_ikan: []
        },
        filtersDef: {
            kecamatan: [],
            desa: [],
            kelompok: [],
            jenis_usaha: [],
            wadah_budidaya: [],
            jenis_ikan: []
        },
        cbibFilter: 'semua',
        mapFilter: '',
        
        // Kecamatan Chart Modes
        kecChartModes: [
            { key: 'pelaku_usaha', label: '👤 Pelaku Usaha' },
            { key: 'kelompok', label: '🏘️ Kelompok' },
            { key: 'wadah_budidaya', label: '🪣 Wadah' },
            { key: 'jenis_usaha', label: '🏭 Jenis Usaha' },
            { key: 'jenis_ikan', label: '🐟 Jenis Ikan' },
            { key: 'produksi', label: '⚖️ Produksi' }
        ],
        
        // Table Configuration
        tableColumns: [
            { key: 'no', label: 'No' },
            { key: 'nama', label: 'Nama' },
            { key: 'kelompok', label: 'Kelompok' },
            { key: 'kecamatan', label: 'Kecamatan' },
            { key: 'desa', label: 'Desa' },
            { key: 'jenis_usaha', label: 'Jenis Usaha' },
            { key: 'wadah_budidaya', label: 'Wadah' },
            { key: 'jenis_ikan', label: 'Jenis Ikan' },
            { key: 'produksi', label: 'Produksi' },
            { key: 'kolam', label: 'Kolam' }
        ],
        sortKey: 'nama',
        sortDir: 'asc',
        currentPage: 1,
        pageSize: 15,
        expandedRows: [],
        
        // Map
        map: null,
        markerCluster: null,
        
        // Jenis Usaha Colors
        jenisUsahaColors: {
            'Pembenihan': '#3B82F6',
            'Pembesaran': '#10B981',
            'Pembesaran & Pembenihan': '#8B5CF6',
            'Pembesaran & Pembenihan Pakan Alami': '#F59E0B',
            'default': '#6366f1'
        },
        
        // Computed Properties
        get totalPages() {
            return Math.ceil(this.filtered.length / this.pageSize) || 1;
        },
        
        get paginatedData() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.sortedData.slice(start, end);
        },
        
        get sortedData() {
            if (!this.sortKey || this.sortKey === 'no') {
                return this.filtered;
            }
            
            return [...this.filtered].sort((a, b) => {
                let valA = a[this.sortKey];
                let valB = b[this.sortKey];
                
                // Handle numeric values
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return this.sortDir === 'asc' ? valA - valB : valB - valA;
                }
                
                // Handle string values
                valA = String(valA || '').toLowerCase();
                valB = String(valB || '').toLowerCase();
                
                if (this.sortDir === 'asc') {
                    return valA.localeCompare(valB);
                } else {
                    return valB.localeCompare(valA);
                }
            });
        },
        
        get visiblePages() {
            const pages = [];
            const maxVisible = 5;
            let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
            let endPage = startPage + maxVisible - 1;
            
            if (endPage > this.totalPages) {
                endPage = this.totalPages;
                startPage = Math.max(1, endPage - maxVisible + 1);
            }
            
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            return pages;
        },
        
        // Initialization
        async initApp() {
            // Check authentication
            this.isAuthenticated = window.Auth ? window.Auth.isAuthenticated() : false;
            
            if (!this.isAuthenticated) {
                this.isLoading = false;
                return;
            }
            
            // Start clock
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
            
            // Load data
            await this.loadData();
            
            // Initialize UI after data is loaded
            this.$nextTick(() => {
                setTimeout(() => {
                    this.initMap();
                    this.updateDistributionChart();
                    this.updateKecamatanChart();
                    this.isLoading = false;
                }, 350);
            });
            
            // Watch dark mode changes
            this.$watch('darkMode', (value) => {
                localStorage.setItem('darkMode', value);
                this.updateChartsForDarkMode();
            });
            
            // Watch search query
            this.$watch('searchQuery', () => {
                this.currentPage = 1;
            });
        },
        
        // Clock
        updateClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            this.currentTime = `${hours}:${minutes}:${seconds}`;
        },
        
        // Authentication
        checkPassword() {
            if (!window.Auth) {
                this.passwordError = 'Authentication module not loaded';
                return;
            }
            
            const password = this.passwordInput.trim();
            
            if (window.Auth.validatePassword(password)) {
                this.passwordError = '';
                window.Auth.setAuthenticated(true);
                this.isAuthenticated = true;
                
                // Hide password gate
                const gate = document.getElementById('passwordGate');
                if (gate) {
                    gate.classList.add('fadeOutDown');
                    setTimeout(() => {
                        gate.style.display = 'none';
                        // Initialize app after authentication
                        this.initApp();
                    }, 400);
                }
            } else {
                this.passwordError = 'Password salah! Silakan coba lagi.';
                this.passwordInput = '';
                setTimeout(() => {
                    const input = document.getElementById('passwordInput');
                    if (input) input.focus();
                }, 100);
            }
        },
        
        // Data Loading
        async loadData() {
            try {
                const csvUrl = './sample-data.csv';
                const response = await fetch(csvUrl);

                if (!response.ok) {
                    throw new Error(`Failed to load CSV: ${response.status}`);
                }

                const csvText = await response.text();

                // Wrap Papa.parse in Promise to properly await it
                await new Promise((resolve, reject) => {
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            this.rawData = results.data.map(row => this.parseCSVRow(row));
                            this.filtered = [...this.rawData];
                            this.populateFilters();
                            resolve(results);
                        },
                        error: (error) => {
                            console.error('CSV parsing error:', error);
                            alert('Gagal memuat data. Silakan coba lagi.');
                            reject(error);
                        }
                    });
                });

            } catch (error) {
                console.error('Error loading data:', error);
                // Generate sample data if CSV fails
                this.generateSampleData();
            }
        },
        
        parseCSVRow(row) {
            return {
                nama: this.cleanString(row.NAMA || row['NAMA PELAKU USAHA'] || ''),
                kelompok: this.cleanString(row.KELOMPOK || row['NAMA KELOMPOK'] || ''),
                kecamatan: this.cleanString(row.KECAMATAN || ''),
                desa: this.cleanString(row.DESA || ''),
                jenis_usaha: this.cleanString(row['JENIS USAHA'] || ''),
                wadah_budidaya: this.cleanString(row['WADAH BUDIDAYA'] || ''),
                jenis_ikan: this.combineIkan(row),
                kolam: this.parseNumber(row['JUMLAH KOLAM'] || row.kolam || 0),
                lahan: this.parseNumber(row['LUAS LAHAN'] || row.lahan || 0),
                produksi: this.parseNumber(row.PRODUKSI || row['PRODUKSI (Kg)'] || 0),
                lat: this.parseFloat(row.LAT || row.Lat || 0),
                lng: this.parseFloat(row.LNG || row.LON || row.Lon || 0),
                cbib: this.parseNumber(row.CBIB || 0),
                kusuka_kelompok: this.parseNumber(row['KUSUKA KELOMPOK'] || 0)
            };
        },
        
        cleanString(str) {
            if (!str) return '';
            return String(str).trim();
        },
        
        parseNumber(str) {
            if (!str) return 0;
            if (typeof str === 'number') return str;
            // Handle comma as decimal separator (Indonesian format)
            const cleaned = String(str).replace(/\./g, '').replace(',', '.');
            return parseFloat(cleaned) || 0;
        },
        
        parseFloat(str) {
            return this.parseNumber(str);
        },
        
        combineIkan(row) {
            const ikanUtama = this.cleanString(row['JENIS IKAN UTAMA'] || '');
            const ikanTambahan1 = this.cleanString(row['TAMBAHAN 1'] || '');
            const ikanTambahan2 = this.cleanString(row['TAMBAHAN 2'] || '');
            
            const ikanList = [ikanUtama, ikanTambahan1, ikanTambahan2].filter(i => i);
            return ikanList.join(', ');
        },
        
        generateSampleData() {
            // Generate sample data if CSV loading fails
            const kecamatanList = ['Mempawah Hilir', 'Mempawah Hulu', 'Sungai Pinyuh', 'Toho', 'Sungai Kunyit'];
            const desaList = ['Pasir Wan', 'Senggabang', 'Penibung', 'Sungai Rasau', 'Sungai Duri'];
            const jenisUsahaList = ['Pembenihan', 'Pembesaran', 'Pembesaran & Pembenihan'];
            const wadahList = ['Kolam Tanah', 'Kolam Semen', 'Karamba', 'Kolam Jaring Apung'];
            const ikanList = ['Lele', 'Nila', 'Mas', 'Patin', 'Gurame'];
            const kelompokList = ['Mekar Jaya', 'Sinar Tani', 'Harapan Baru', 'Mandiri Sejahtera'];
            
            this.rawData = [];
            for (let i = 1; i <= 50; i++) {
                const idxKec = i % kecamatanList.length;
                const lat = 0.35 + (Math.random() - 0.5) * 0.1;
                const lng = 108.9 + (Math.random() - 0.5) * 0.1;
                
                this.rawData.push({
                    nama: `Pelaku Usaha ${i}`,
                    kelompok: kelompokList[i % kelompokList.length],
                    kecamatan: kecamatanList[idxKec],
                    desa: desaList[i % desaList.length],
                    jenis_usaha: jenisUsahaList[i % jenisUsahaList.length],
                    wadah_budidaya: wadahList[i % wadahList.length],
                    jenis_ikan: ikanList[i % ikanList.length],
                    kolam: Math.floor(Math.random() * 10) + 1,
                    lahan: Math.floor(Math.random() * 5000) + 500,
                    produksi: Math.floor(Math.random() * 10000) + 1000,
                    lat: lat,
                    lng: lng,
                    cbib: Math.random() > 0.5 ? 1 : 0,
                    kusuka_kelompok: Math.floor(Math.random() * 100)
                });
            }
            
            this.filtered = [...this.rawData];
            this.populateFilters();
        },
        
        // Filter Functions
        populateFilters() {
            this.filtersDef.kecamatan = [...new Set(this.rawData.map(d => d.kecamatan))].filter(Boolean).sort();
            this.filtersDef.desa = [...new Set(this.rawData.map(d => d.desa))].filter(Boolean).sort();
            this.filtersDef.kelompok = [...new Set(this.rawData.map(d => d.kelompok))].filter(Boolean).sort();
            this.filtersDef.jenis_usaha = [...new Set(this.rawData.map(d => d.jenis_usaha))].filter(Boolean).sort();
            this.filtersDef.wadah_budidaya = [...new Set(this.rawData.map(d => d.wadah_budidaya))].filter(Boolean).sort();
            
            // Get unique fish types (split by comma)
            const allIkan = this.rawData.flatMap(d => d.jenis_ikan.split(',').map(i => i.trim())).filter(Boolean);
            this.filtersDef.jenis_ikan = [...new Set(allIkan)].sort();
        },
        
        updateFilterOptions(nextFilter) {
            // Cascading filter - update options based on current selection
            const currentFiltered = this.applyFiltersToData(this.rawData);
            
            switch (nextFilter) {
                case 'desa':
                    this.filtersDef.desa = [...new Set(currentFiltered.map(d => d.desa))].filter(Boolean).sort();
                    this.selected.desa = [];
                case 'kelompok':
                    this.filtersDef.kelompok = [...new Set(currentFiltered.map(d => d.kelompok))].filter(Boolean).sort();
                    this.selected.kelompok = [];
                case 'jenis_usaha':
                    this.filtersDef.jenis_usaha = [...new Set(currentFiltered.map(d => d.jenis_usaha))].filter(Boolean).sort();
                    this.selected.jenis_usaha = [];
                case 'wadah_budidaya':
                    this.filtersDef.wadah_budidaya = [...new Set(currentFiltered.map(d => d.wadah_budidaya))].filter(Boolean).sort();
                    this.selected.wadah_budidaya = [];
                case 'jenis_ikan':
                    const allIkan = currentFiltered.flatMap(d => d.jenis_ikan.split(',').map(i => i.trim())).filter(Boolean);
                    this.filtersDef.jenis_ikan = [...new Set(allIkan)].sort();
                    this.selected.jenis_ikan = [];
            }
        },
        
        applyFilters() {
            this.filtered = this.applyFiltersToData(this.rawData);
            this.currentPage = 1;
            
            // Update map markers
            if (this.markerCluster) {
                this.updateMapMarkers();
            }
            
            // Update charts
            this.updateDistributionChart();
            this.updateKecamatanChart();
        },
        
        applyFiltersToData(data) {
            return data.filter(row => {
                // Search query
                if (this.searchQuery) {
                    const query = this.searchQuery.toLowerCase();
                    const searchableText = [
                        row.nama,
                        row.kelompok,
                        row.desa,
                        row.kecamatan
                    ].join(' ').toLowerCase();
                    
                    if (!searchableText.includes(query)) {
                        return false;
                    }
                }
                
                // Kecamatan filter
                if (this.selected.kecamatan.length > 0 && !this.selected.kecamatan.includes(row.kecamatan)) {
                    return false;
                }
                
                // Desa filter
                if (this.selected.desa.length > 0 && !this.selected.desa.includes(row.desa)) {
                    return false;
                }
                
                // Kelompok filter
                if (this.selected.kelompok.length > 0 && !this.selected.kelompok.includes(row.kelompok)) {
                    return false;
                }
                
                // Jenis Usaha filter
                if (this.selected.jenis_usaha.length > 0 && !this.selected.jenis_usaha.includes(row.jenis_usaha)) {
                    return false;
                }
                
                // Wadah Budidaya filter
                if (this.selected.wadah_budidaya.length > 0 && !this.selected.wadah_budidaya.includes(row.wadah_budidaya)) {
                    return false;
                }
                
                // Jenis Ikan filter
                if (this.selected.jenis_ikan.length > 0) {
                    const rowIkan = row.jenis_ikan.split(',').map(i => i.trim());
                    const hasMatch = this.selected.jenis_ikan.some(selected => rowIkan.includes(selected));
                    if (!hasMatch) return false;
                }
                
                // CBIB filter
                if (this.cbibFilter === 'ya' && row.cbib !== 1) {
                    return false;
                }
                if (this.cbibFilter === 'tidak' && row.cbib === 1) {
                    return false;
                }
                
                return true;
            });
        },
        
        resetFilters() {
            this.searchQuery = '';
            this.selected = {
                kecamatan: [],
                desa: [],
                kelompok: [],
                jenis_usaha: [],
                wadah_budidaya: [],
                jenis_ikan: []
            };
            this.cbibFilter = 'semua';
            this.mapFilter = '';
            
            this.populateFilters();
            this.applyFilters();
        },
        
        // Summary Functions
        getUniqueKelompokCount() {
            return new Set(this.filtered.map(d => d.kelompok)).size;
        },
        
        getTotalProduksi() {
            return this.filtered.reduce((sum, d) => sum + (d.produksi || 0), 0);
        },
        
        getTotalLahan() {
            return this.filtered.reduce((sum, d) => sum + (d.lahan || 0), 0);
        },
        
        formatNumber(num) {
            if (num === undefined || num === null) return '0';
            return new Intl.NumberFormat('id-ID').format(Math.round(num));
        },
        
        // Table Functions
        sortBy(key) {
            if (this.sortKey === key) {
                this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortKey = key;
                this.sortDir = 'asc';
            }
        },
        
        // Row Expansion
        toggleRowExpand(rowIndex, row) {
            const index = this.expandedRows.indexOf(rowIndex);
            if (index === -1) {
                this.expandedRows.push(rowIndex);
            } else {
                this.expandedRows.splice(index, 1);
            }
        },
        
        // Filter Chips Functions
        hasActiveFilters() {
            return this.searchQuery !== '' ||
                   this.selected.kecamatan.length > 0 ||
                   this.selected.desa.length > 0 ||
                   this.selected.kelompok.length > 0 ||
                   this.selected.jenis_usaha.length > 0 ||
                   this.selected.wadah_budidaya.length > 0 ||
                   this.selected.jenis_ikan.length > 0 ||
                   this.cbibFilter !== 'semua';
        },
        
        activeFilterList() {
            const filters = {};
            
            if (this.searchQuery) {
                filters['search'] = { label: `Search: "${this.searchQuery}"` };
            }
            if (this.selected.kecamatan.length > 0) {
                filters['kecamatan'] = { label: `Kecamatan: ${this.selected.kecamatan.join(', ')}` };
            }
            if (this.selected.desa.length > 0) {
                filters['desa'] = { label: `Desa: ${this.selected.desa.join(', ')}` };
            }
            if (this.selected.kelompok.length > 0) {
                filters['kelompok'] = { label: `Kelompok: ${this.selected.kelompok.join(', ')}` };
            }
            if (this.selected.jenis_usaha.length > 0) {
                filters['jenis_usaha'] = { label: `Usaha: ${this.selected.jenis_usaha.join(', ')}` };
            }
            if (this.selected.wadah_budidaya.length > 0) {
                filters['wadah'] = { label: `Wadah: ${this.selected.wadah_budidaya.join(', ')}` };
            }
            if (this.selected.jenis_ikan.length > 0) {
                filters['ikan'] = { label: `Ikan: ${this.selected.jenis_ikan.join(', ')}` };
            }
            if (this.cbibFilter !== 'semua') {
                filters['cbib'] = { label: `CBIB: ${this.cbibFilter === 'ya' ? 'Ya' : 'Tidak'}` };
            }
            
            return filters;
        },
        
        removeFilter(key) {
            switch (key) {
                case 'search':
                    this.searchQuery = '';
                    break;
                case 'kecamatan':
                    this.selected.kecamatan = [];
                    break;
                case 'desa':
                    this.selected.desa = [];
                    break;
                case 'kelompok':
                    this.selected.kelompok = [];
                    break;
                case 'jenis_usaha':
                    this.selected.jenis_usaha = [];
                    break;
                case 'wadah':
                    this.selected.wadah_budidaya = [];
                    break;
                case 'ikan':
                    this.selected.jenis_ikan = [];
                    break;
                case 'cbib':
                    this.cbibFilter = 'semua';
                    break;
            }
            this.applyFilters();
        },
        
        // Mobile Navigation
        scrollToSection(sectionId) {
            this.$nextTick(() => {
                let element;
                switch (sectionId) {
                    case 'dashboard':
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        break;
                    case 'map':
                        element = document.getElementById('map');
                        if (element) {
                            const offset = 120; // Account for header
                            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                            window.scrollTo({
                                top: elementPosition - offset,
                                behavior: 'smooth'
                            });
                        }
                        break;
                    case 'table':
                        // Find the table section and scroll to it
                        const tableSection = document.querySelector('[class*="table-container"]');
                        if (tableSection) {
                            const offset = 120;
                            const elementPosition = tableSection.getBoundingClientRect().top + window.pageYOffset;
                            window.scrollTo({
                                top: elementPosition - offset,
                                behavior: 'smooth'
                            });
                        }
                        break;
                    case 'export':
                        // Find the export buttons in sidebar
                        if (this.sidebarOpen) {
                            // Sidebar is already open
                            const exportButtons = document.querySelector('button[onclick*="exportToExcel"]');
                            if (exportButtons) {
                                exportButtons.scrollIntoView({ behavior: 'smooth' });
                            }
                        } else {
                            // Open sidebar first
                            this.sidebarOpen = true;
                        }
                        break;
                }
            });
        },
        
        // Dark Mode
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            document.documentElement.classList.toggle('dark', this.darkMode);
        },
        
        updateChartsForDarkMode() {
            const textColor = this.darkMode ? '#e2e8f0' : '#1e293b';
            const gridColor = this.darkMode ? '#334155' : '#e2e8f0';
            
            Chart.defaults.color = textColor;
            Chart.defaults.borderColor = gridColor;
            
            this.updateDistributionChart();
            this.updateKecamatanChart();
        },
        
        // Map Functions
        initMap() {
            if (typeof L === 'undefined') {
                console.error('Leaflet not loaded');
                return;
            }
            
            // Initialize map centered on Mempawah
            const map = L.map('map').setView([0.35, 108.9], 10);
            this.map = map;
            
            // Add Google Satellite tile layer
            L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                attribution: '© Google',
                maxZoom: 19
            }).addTo(map);
            
            // Initialize marker cluster group
            const markerCluster = L.markerClusterGroup({
                showCoverageOnHover: false,
                maxClusterRadius: 50
            });
            this.markerCluster = markerCluster;
            
            // Add markers
            this.updateMapMarkers();
            map.addLayer(markerCluster);
            
            // Try to load GeoJSON (optional)
            this.loadGeoJSON();
        },
        
        updateMapMarkers() {
            if (!this.markerCluster) return;
            
            // Clear existing markers
            this.markerCluster.clearLayers();
            
            // Filter data for map
            const mapData = this.filtered.filter(d => d.lat && d.lng);
            
            if (this.mapFilter) {
                mapData.filter(d => d.jenis_usaha === this.mapFilter);
            }
            
            // Add markers
            mapData.forEach(row => {
                const color = this.getJenisUsahaColor(row.jenis_usaha);
                
                // Create custom circle marker
                const marker = L.circleMarker([row.lat, row.lng], {
                    radius: 8,
                    fillColor: color,
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                });
                
                // Add popup
                const popupContent = `
                    <div class="text-sm">
                        <h3 class="font-bold text-lg mb-2">${row.nama}</h3>
                        <p><strong>Jenis Usaha:</strong> <span style="color: ${color}">${row.jenis_usaha}</span></p>
                        <p><strong>Kelompok:</strong> ${row.kelompok}</p>
                        <p><strong>Jenis Ikan:</strong> ${row.jenis_ikan}</p>
                        <p><strong>Wadah:</strong> ${row.wadah_budidaya}</p>
                        <p><strong>Lokasi:</strong> ${row.desa}, ${row.kecamatan}</p>
                        <a href="https://www.google.com/maps?q=${row.lat},${row.lng}" target="_blank" class="text-cyan-600 hover:underline mt-2 inline-block">Buka Google Maps →</a>
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                marker.bindTooltip(row.nama, {
                    direction: 'top',
                    offset: [0, -10]
                });
                
                this.markerCluster.addLayer(marker);
            });
        },
        
        filterMapMarkers() {
            this.updateMapMarkers();
        },
        
        loadGeoJSON() {
            // Try to load GeoJSON files for kecamatan boundaries
            const kecamatanList = [...new Set(this.filtered.map(d => d.kecamatan))];
            
            kecamatanList.forEach(kecamatan => {
                const filename = kecamatan.toLowerCase().replace(/\s+/g, '_');
                fetch(`./geojson/${filename}.geojson`)
                    .then(response => {
                        if (!response.ok) throw new Error('Not found');
                        return response.json();
                    })
                    .then(geojson => {
                        L.geoJSON(geojson, {
                            style: {
                                color: '#0891b2',
                                weight: 2,
                                opacity: 0.5,
                                fillOpacity: 0.1
                            },
                            onEachFeature: (feature, layer) => {
                                layer.bindPopup(kecamatan);
                                
                                layer.on('mouseover', function() {
                                    this.setStyle({
                                        weight: 3,
                                        opacity: 0.8
                                    });
                                });
                                
                                layer.on('mouseout', function() {
                                    this.setStyle({
                                        weight: 2,
                                        opacity: 0.5
                                    });
                                });
                            }
                        }).addTo(this.map);
                    })
                    .catch(() => {
                        // GeoJSON not found, skip silently
                    });
            });
        },
        
        getJenisUsahaColor(jenisUsaha) {
            return this.jenisUsahaColors[jenisUsaha] || this.jenisUsahaColors['default'];
        },
        
        // Chart Functions
        updateDistributionChart() {
            const canvas = document.getElementById('distributionChart');
            if (!canvas) return;
            
            // Destroy existing chart
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
            
            if (!this.chartFilter) {
                // Don't render if no filter selected
                return;
            }
            
            const data = this.getDistributionData();
            
            const textColor = this.darkMode ? '#e2e8f0' : '#1e293b';
            
            const config = {
                type: this.chartType,
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: this.chartType === 'bar' ? 'y' : 'x',
                    plugins: {
                        legend: {
                            display: this.chartType === 'bar',
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                boxWidth: 12,
                                padding: 8,
                                font: { size: 10 }
                            }
                        },
                        datalabels: {
                            display: this.chartType === 'pie',
                            color: this.darkMode ? '#e2e8f0' : '#1e293b',
                            font: {
                                weight: 'bold',
                                size: 10
                            },
                            formatter: (value) => value > 0 ? value : ''
                        }
                    }
                }
            };
            
            this.distributionChart = new Chart(canvas, config);
        },
        
        getDistributionData() {
            const labels = [];
            const values = [];
            const colors = [];
            
            const dataMap = {};
            
            this.filtered.forEach(row => {
                let key = '';
                
                switch (this.chartFilter) {
                    case 'jenis_usaha':
                        key = row.jenis_usaha;
                        break;
                    case 'wadah_budidaya':
                        key = row.wadah_budidaya;
                        break;
                    case 'jenis_ikan':
                        key = row.jenis_ikan.split(',').map(i => i.trim()).join(', ');
                        break;
                    case 'kecamatan':
                        key = row.kecamatan;
                        break;
                    default:
                        key = '-';
                }
                
                if (key) {
                    dataMap[key] = (dataMap[key] || 0) + 1;
                }
            });
            
            // Sort by value
            Object.entries(dataMap)
                .sort((a, b) => b[1] - a[1])
                .forEach(([key, value]) => {
                    labels.push(key);
                    values.push(value);
                    colors.push(this.getChartColor(key));
                });
            
            return {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: this.chartType === 'pie' ? 2 : 1,
                    borderColor: this.darkMode ? '#1e293b' : '#fff'
                }]
            };
        },
        
        switchKecChartMode(mode) {
            this.kecChartMode = mode;
            
            const modeConfig = this.kecChartModes.find(m => m.key === mode);
            if (modeConfig) {
                this.kecChartTitle = modeConfig.label.replace(/^[^\s]+\s/, '');
            }
            
            this.updateKecamatanChart();
        },
        
        updateKecamatanChart() {
            const canvas = document.getElementById('kecamatanChart');
            if (!canvas) return;
            
            // Destroy existing chart
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
            
            const { labels, datasets, isStacked } = this.getKecamatanData();
            
            // Calculate height
            const baseHeight = 50;
            const perRowHeight = 32;
            const legendHeight = isStacked ? 60 : 0;
            this.kecChartHeight = Math.max(300, labels.length * perRowHeight + baseHeight + legendHeight);
            
            const textColor = this.darkMode ? '#e2e8f0' : '#1e293b';
            const gridColor = this.darkMode ? '#334155' : '#e2e8f0';
            
            const config = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            stacked: isStacked,
                            ticks: {
                                color: textColor,
                                maxTicksLimit: 8
                            },
                            grid: {
                                color: gridColor
                            }
                        },
                        y: {
                            stacked: isStacked,
                            ticks: {
                                color: textColor
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: isStacked,
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                boxWidth: 12,
                                padding: 8,
                                font: { size: 10 }
                            }
                        },
                        datalabels: {
                            display: !isStacked,
                            anchor: 'end',
                            align: 'end',
                            color: textColor,
                            font: {
                                weight: 'bold',
                                size: 10
                            },
                            formatter: (value) => value > 0 ? value : ''
                        }
                    }
                }
            };
            
            this.kecamatanChart = new Chart(canvas, config);
        },
        
        getKecamatanData() {
            const labels = [...new Set(this.filtered.map(d => d.kecamatan))].filter(Boolean).sort();
            
            let datasets = [];
            let isStacked = false;
            
            switch (this.kecChartMode) {
                case 'pelaku_usaha':
                    const pelakuCounts = labels.map(kec => 
                        this.filtered.filter(d => d.kecamatan === kec).length
                    );
                    datasets = [{
                        data: pelakuCounts,
                        backgroundColor: '#0891b2'
                    }];
                    break;
                    
                case 'kelompok':
                    const kelompokCounts = labels.map(kec => 
                        new Set(this.filtered.filter(d => d.kecamatan === kec).map(d => d.kelompok)).size
                    );
                    datasets = [{
                        data: kelompokCounts,
                        backgroundColor: '#10b981'
                    }];
                    break;
                    
                case 'wadah_budidaya':
                    isStacked = true;
                    const wadahList = [...new Set(this.filtered.map(d => d.wadah_budidaya))].filter(Boolean);
                    datasets = wadahList.slice(0, 8).map((wadah, idx) => ({
                        label: wadah,
                        data: labels.map(kec => 
                            this.filtered.filter(d => d.kecamatan === kec && d.wadah_budidaya === wadah).length
                        ),
                        backgroundColor: this.getChartColor(wadah)
                    }));
                    break;
                    
                case 'jenis_usaha':
                    isStacked = true;
                    const jenisUsahaList = [...new Set(this.filtered.map(d => d.jenis_usaha))].filter(Boolean);
                    datasets = jenisUsahaList.slice(0, 8).map((jenis, idx) => ({
                        label: jenis,
                        data: labels.map(kec => 
                            this.filtered.filter(d => d.kecamatan === kec && d.jenis_usaha === jenis).length
                        ),
                        backgroundColor: this.getJenisUsahaColor(jenis)
                    }));
                    break;
                    
                case 'jenis_ikan':
                    isStacked = true;
                    const ikanList = [...new Set(this.filtered.flatMap(d => d.jenis_ikan.split(',').map(i => i.trim())))].filter(Boolean);
                    datasets = ikanList.slice(0, 8).map((ikan, idx) => ({
                        label: ikan,
                        data: labels.map(kec => 
                            this.filtered.filter(d => {
                                if (d.kecamatan !== kec) return false;
                                const rowIkan = d.jenis_ikan.split(',').map(i => i.trim());
                                return rowIkan.includes(ikan);
                            }).length
                        ),
                        backgroundColor: this.getChartColor(ikan)
                    }));
                    break;
                    
                case 'produksi':
                    const produksiTotal = labels.map(kec => 
                        this.filtered.filter(d => d.kecamatan === kec)
                            .reduce((sum, d) => sum + (d.produksi || 0), 0)
                    );
                    datasets = [{
                        data: produksiTotal,
                        backgroundColor: '#8b5cf6'
                    }];
                    break;
            }
            
            return { labels, datasets, isStacked };
        },
        
        getChartColor(str) {
            const colors = [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
            ];
            
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            
            return colors[Math.abs(hash) % colors.length];
        },
        
        // Export Functions
        exportToExcel() {
            const { jsPDF } = window.jspdf || {};
            if (!window.XLSX) {
                alert('Library Excel belum dimuat. Silakan refresh halaman.');
                return;
            }
            
            // Prepare data
            const exportData = this.filtered.map((row, index) => ({
                'No': index + 1,
                'Nama': row.nama,
                'Kelompok': row.kelompok,
                'Kecamatan': row.kecamatan,
                'Desa': row.desa,
                'Jenis Usaha': row.jenis_usaha,
                'Wadah Budidaya': row.wadah_budidaya,
                'Jenis Ikan': row.jenis_ikan,
                'Luas Lahan (m2)': row.lahan,
                'Jumlah Kolam': row.kolam,
                'Produksi (Kg)': row.produksi,
                'CBIB': row.cbib ? 'Ya' : 'Tidak'
            }));
            
            // Create workbook
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Data Perikanan');
            
            // Set column widths
            ws['!cols'] = [
                { wch: 5 },   // No
                { wch: 25 },  // Nama
                { wch: 20 },  // Kelompok
                { wch: 15 },  // Kecamatan
                { wch: 15 },  // Desa
                { wch: 15 },  // Jenis Usaha
                { wch: 15 },  // Wadah Budidaya
                { wch: 20 },  // Jenis Ikan
                { wch: 12 },  // Luas Lahan
                { wch: 10 },  // Jumlah Kolam
                { wch: 12 },  // Produksi
                { wch: 8 }    // CBIB
            ];
            
            // Generate filename with date
            const date = new Date().toISOString().split('T')[0];
            const filename = `data_perikanan_${date}.xlsx`;
            
            // Download
            XLSX.writeFile(wb, filename);
        },
        
        async exportToPDF() {
            if (!window.jspdf) {
                alert('Library PDF belum dimuat. Silakan refresh halaman.');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            
            // Helper function for header
            const addHeader = (doc, pageNum) => {
                // Cyan strip
                doc.setFillColor(8, 145, 178);
                doc.rect(0, 0, pageWidth, 16, 'F');
                
                // Logo circle
                doc.setFillColor(255, 255, 255);
                doc.circle(12, 8, 5, 'F');
                
                // Logo text
                doc.setTextColor(8, 145, 178);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('DKP', 12, 10.5, { align: 'center' });
                
                // Title
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12);
                doc.text('DATA PERIKANAN BUDIDAYA', 25, 7);
                
                // Subtitle
                doc.setFontSize(9);
                doc.text('Dinas Perikanan dan Kelautan Perikanan Kabupaten Mempawah', 25, 12);
                
                // Date (right)
                const date = new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                doc.setFontSize(8);
                doc.text(date, pageWidth - margin, 8, { align: 'right' });
            };
            
            // Helper function for footer
            const addFooter = (doc, pageNum, totalPages) => {
                const footerY = pageHeight - 10;
                
                // Line
                doc.setDrawColor(8, 145, 178);
                doc.setLineWidth(0.5);
                doc.line(margin, footerY, pageWidth - margin, footerY);
                
                // Footer text
                doc.setTextColor(100, 100, 100);
                doc.setFontSize(8);
                doc.text(
                    `Halaman ${pageNum} | ${new Date().toLocaleDateString('id-ID')} | © DPKPP Kab. Mempawah`,
                    pageWidth / 2,
                    footerY + 5,
                    { align: 'center' }
                );
            };
            
            // === PAGE 1: Ringkasan Eksekutif ===
            addHeader(doc, 1);
            
            let yPos = 25;
            
            // Filter info
            const activeFilters = this.getActiveFilters();
            if (activeFilters.length > 0) {
                doc.setFillColor(239, 246, 255);
                doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 1, 1, 'F');
                
                doc.setTextColor(8, 145, 178);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('Filter:', margin + 3, yPos + 6);
                
                doc.setTextColor(50, 50, 50);
                doc.setFont('helvetica', 'normal');
                doc.text(activeFilters.join(', '), margin + 15, yPos + 6);
                
                yPos += 18;
            }
            
            // Summary cards
            const cardWidth = (pageWidth - 2 * margin - 8) / 4;
            const cardHeight = 22;
            const cardColors = [
                { fill: [8, 145, 178], label: 'Total Pelaku Usaha', value: this.filtered.length },
                { fill: [16, 185, 129], label: 'Total Kelompok', value: this.getUniqueKelompokCount() },
                { fill: [139, 92, 246], label: 'Total Produksi (Kg)', value: this.formatNumber(this.getTotalProduksi()) },
                { fill: [245, 158, 11], label: 'Total Luas Lahan (m²)', value: this.formatNumber(this.getTotalLahan()) }
            ];
            
            cardColors.forEach((card, idx) => {
                const xPos = margin + idx * (cardWidth + 2);
                
                // Card background
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 1, 1, 'F');
                
                // Color strip
                doc.setFillColor(...card.fill);
                doc.rect(xPos, yPos, 3, cardHeight, 'F');
                
                // Label
                doc.setTextColor(100, 100, 100);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.text(card.label, xPos + 5, yPos + 10);
                
                // Value
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text(String(card.value), xPos + 5, yPos + 17);
            });
            
            yPos += cardHeight + 12;
            
            // Distribution chart
            const distribCanvas = document.getElementById('distributionChart');
            if (distribCanvas) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text('Distribusi Jenis Usaha', margin, yPos);
                
                yPos += 5;
                const distribImg = distribCanvas.toDataURL('image/png');
                doc.addImage(distribImg, 'PNG', margin, yPos, 85, 60);
            }
            
            // Kecamatan chart (pelaku usaha mode)
            if (this.kecChartMode !== 'pelaku_usaha') {
                // Switch to pelaku_usaha mode temporarily
                const oldMode = this.kecChartMode;
                this.kecChartMode = 'pelaku_usaha';
                await this.$nextTick();
                await new Promise(resolve => setTimeout(resolve, 200));
                this.updateKecamatanChart();
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            const kecCanvas = document.getElementById('kecamatanChart');
            if (kecCanvas) {
                doc.text('Pelaku Usaha per Kecamatan', pageWidth - 95, yPos);
                
                yPos += 5;
                const kecImg = kecCanvas.toDataURL('image/png');
                doc.addImage(kecImg, 'PNG', pageWidth - 95, yPos, 85, 60);
            }
            
            addFooter(doc, 1, 3);
            doc.addPage();
            
            // === PAGE 2: Analisis per Kecamatan ===
            addHeader(doc, 2);
            
            // Mini header
            doc.setFillColor(8, 145, 178);
            doc.rect(0, 0, pageWidth, 9, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text('Analisis per Kecamatan', margin, 6);
            
            yPos = 15;
            
            const chartModes = ['jenis_usaha', 'wadah_budidaya', 'jenis_ikan', 'produksi'];
            const chartTitles = ['Jenis Usaha', 'Wadah Budidaya', 'Jenis Ikan', 'Produksi (Kg)'];
            const positions = [
                { x: margin, y: yPos },
                { x: pageWidth / 2 + 2, y: yPos },
                { x: margin, y: yPos + 75 },
                { x: pageWidth / 2 + 2, y: yPos + 75 }
            ];
            
            for (let i = 0; i < chartModes.length; i++) {
                const mode = chartModes[i];
                const pos = positions[i];
                
                // Switch chart mode
                this.kecChartMode = mode;
                await this.$nextTick();
                await new Promise(resolve => setTimeout(resolve, 200));
                this.updateKecamatanChart();
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Get chart image
                const canvas = document.getElementById('kecamatanChart');
                if (canvas) {
                    const imgData = canvas.toDataURL('image/png');
                    
                    // Title
                    doc.setTextColor(0, 0, 0);
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'bold');
                    doc.text(chartTitles[i], pos.x, pos.y - 2);
                    
                    // Image
                    doc.addImage(imgData, 'PNG', pos.x, pos.y, 85, 65);
                }
            }
            
            addFooter(doc, 2, 3);
            doc.addPage();
            
            // === PAGE 3: Tabel Data ===
            addHeader(doc, 3);
            
            // Prepare table data
            const tableData = this.filtered.map((row, index) => [
                index + 1,
                row.nama,
                row.kelompok,
                row.kecamatan,
                row.desa,
                row.jenis_usaha,
                row.wadah_budidaya,
                row.jenis_ikan,
                this.formatNumber(row.produksi),
                row.kolam
            ]);
            
            // Calculate totals
            const totalProduksi = this.filtered.reduce((sum, d) => sum + (d.produksi || 0), 0);
            const totalKolam = this.filtered.reduce((sum, d) => sum + (d.kolam || 0), 0);
            
            doc.autoTable({
                startY: 20,
                head: [['No', 'Nama', 'Kelompok', 'Kecamatan', 'Desa', 'Jenis Usaha', 'Wadah', 'Jenis Ikan', 'Produksi (Kg)', 'Kolam']],
                body: tableData,
                foot: [['TOTAL', `${this.filtered.length} orang`, '', '', '', '', '', '', this.formatNumber(totalProduksi), totalKolam]],
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    font: 'helvetica'
                },
                headStyles: {
                    fillColor: [8, 145, 178],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                footStyles: {
                    fillColor: [8, 145, 178],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [239, 246, 255]
                },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center' },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 22 },
                    4: { cellWidth: 22 },
                    5: { cellWidth: 20 },
                    6: { cellWidth: 15 },
                    7: { cellWidth: 25 },
                    8: { cellWidth: 20, halign: 'right' },
                    9: { cellWidth: 12, halign: 'center' }
                },
                showFoot: 'lastPage',
                didDrawPage: (data) => {
                    // Add mini header to continuation pages
                    if (data.pageNumber > 3) {
                        doc.setFillColor(8, 145, 178);
                        doc.rect(0, 0, pageWidth, 9, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'bold');
                        doc.text('Data Pelaku Usaha', margin, 6);
                    }
                    
                    addFooter(doc, data.pageNumber, 3);
                }
            });
            
            // Signature area
            let sigY = doc.lastAutoTable.finalY + 20;
            if (sigY > pageHeight - 50) {
                doc.addPage();
                sigY = 30;
            }
            
            const sigX = pageWidth - margin - 70;
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Mempawah, ${new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })}`, sigX, sigY);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Kepala Dinas DPKPP', sigX, sigY + 8);
            doc.text('Kabupaten Mempawah', sigX, sigY + 14);
            
            // Signature box
            doc.setDrawColor(150, 150, 150);
            doc.roundedRect(sigX, sigY + 20, 70, 24, 0, 0, 'S');
            
            // Name line
            doc.setDrawColor(0, 0, 0);
            doc.line(sigX, sigY + 55, sigX + 70, sigY + 55);
            
            doc.setFontSize(9);
            doc.text('NIP.', sigX, sigY + 60);
            
            // Save PDF
            const date = new Date().toISOString().split('T')[0];
            doc.save(`laporan_perikanan_${date}.pdf`);
        },
        
        getActiveFilters() {
            const filters = [];
            
            if (this.selected.kecamatan.length > 0) {
                filters.push(`Kecamatan: ${this.selected.kecamatan.join(', ')}`);
            }
            if (this.selected.desa.length > 0) {
                filters.push(`Desa: ${this.selected.desa.join(', ')}`);
            }
            if (this.selected.kelompok.length > 0) {
                filters.push(`Kelompok: ${this.selected.kelompok.join(', ')}`);
            }
            if (this.selected.jenis_usaha.length > 0) {
                filters.push(`Jenis Usaha: ${this.selected.jenis_usaha.join(', ')}`);
            }
            if (this.selected.wadah_budidaya.length > 0) {
                filters.push(`Wadah: ${this.selected.wadah_budidaya.join(', ')}`);
            }
            if (this.selected.jenis_ikan.length > 0) {
                filters.push(`Jenis Ikan: ${this.selected.jenis_ikan.join(', ')}`);
            }
            if (this.cbibFilter !== 'semua') {
                filters.push(`CBIB: ${this.cbibFilter === 'ya' ? 'Ya' : 'Tidak'}`);
            }
            
            return filters;
        }
    };
}

// Classe principal da aplicação IRecycle
class IRecycleApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.init();
    }

    // Inicializa todos os componentes
    init() {
        this.initializeFormSteps();
        this.initializeMap();
        this.initializeEventListeners();
    }

    // Configura o sistema de steps do formulário
    initializeFormSteps() {
        this.steps = Array.from(document.querySelectorAll('.step'));
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.form = document.getElementById('residueForm');
        this.showStep(this.currentStep);
    }

    // Mostra um step específico e oculta os outros
    showStep(stepNumber) {
        this.steps.forEach(step => {
            const isActive = Number(step.dataset.step) === stepNumber;
            step.classList.toggle('active', isActive);
        });

        for (let i = 1; i <= this.totalSteps; i++) {
            const stepContent = document.getElementById(`step-${i}`);
            if (stepContent) {
                if (i === stepNumber) {
                    stepContent.style.display = 'block';
                } else {
                    stepContent.style.display = 'none';
                }
            }
        }

        this.prevBtn.style.display = stepNumber === 1 ? 'none' : 'block';
        this.nextBtn.style.display = stepNumber === this.totalSteps ? 'none' : 'block';
        this.submitBtn.style.display = stepNumber === this.totalSteps ? 'block' : 'none';
    }

    // Avança para o próximo step
    nextStep() {
        if (this.currentStep < this.totalSteps && this.validateStep(this.currentStep)) {
            this.currentStep++;
            this.showStep(this.currentStep);
        }
    }

    // Volta para o step anterior
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    // Valida os campos do step atual
    validateStep(step) {
        const errors = [];

        if (step === 1) {
            const nome = document.getElementById('nome');
            const email = document.getElementById('email');
            
            if (!nome.value.trim()) {
                errors.push({ field: 'nome', message: 'Nome é obrigatório' });
            }
            
            if (!email.value.trim()) {
                errors.push({ field: 'email', message: 'E-mail é obrigatório' });
            } else if (!this.isValidEmail(email.value)) {
                errors.push({ field: 'email', message: 'E-mail inválido' });
            }
        }

        if (step === 3) {
            const quantidade = document.getElementById('quantidade');
            if (quantidade.value && isNaN(quantidade.value)) {
                errors.push({ field: 'quantidade', message: 'Quantidade deve ser um número' });
            }
        }

        this.clearErrors();
        if (errors.length > 0) {
            errors.forEach(error => this.showError(error.field, error.message));
            this.showMessage('Por favor, corrija os erros destacados.', 'error');
            return false;
        }

        return true;
    }

    // Verifica se o email é válido
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Exibe mensagem de erro em um campo
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        if (field && errorElement) {
            field.style.borderColor = 'var(--error-red)';
            errorElement.textContent = message;
        }
    }

    // Limpa todas as mensagens de erro
    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.style.borderColor = '';
        });
    }

    // Processa o envio do formulário
    async handleFormSubmit(event) {
        event.preventDefault();
        
        for (let i = 1; i <= this.totalSteps; i++) {
            if (!this.validateStep(i)) {
                this.showStep(i);
                return;
            }
        }

        const formData = new FormData(this.form);
        const data = {
            nome: formData.get('nome').trim(),
            telefone: formData.get('telefone').trim(),
            email: formData.get('email').trim(),
            empresa: formData.get('empresa').trim(),
            cargo: formData.get('cargo').trim(),
            residuo: formData.get('residuo'),
            quantidade: formData.get('quantidade').trim(),
            observacoes: formData.get('observacoes').trim(),
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        this.setLoadingState(true);

        try {
            await this.submitToAPI(data);
            this.showMessage('Cadastro realizado com sucesso! Entraremos em contato em breve.', 'success');
            this.resetForm();
        } catch (error) {
            this.showMessage('Erro ao realizar cadastro. Tente novamente.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    // Simula envio para API
    async submitToAPI(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.1) {
                    reject(new Error('API timeout'));
                } else {
                    const existing = JSON.parse(localStorage.getItem('irecycle_submissions') || '[]');
                    existing.push(data);
                    localStorage.setItem('irecycle_submissions', JSON.stringify(existing));
                    resolve(data);
                }
            }, 1500);
        });
    }

    // Controla estado de loading do botão
    setLoadingState(loading) {
        const submitBtn = document.getElementById('submitBtn');
        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    // Reseta o formulário para o estado inicial
    resetForm() {
        this.form.reset();
        this.currentStep = 1;
        this.showStep(this.currentStep);
        this.clearErrors();
        this.updateCharacterCount();
    }

    // Inicializa o mapa com Leaflet
    initializeMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        const center = [-23.55052, -46.633308];
        this.map = L.map('map').setView(center, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        this.addSampleLocations();
    }

    // Adiciona locais de exemplo no mapa
    addSampleLocations() {
        const locations = [
            { 
                name: 'Ponto de Coleta Central', 
                type: 'Coleta', 
                lat: -23.5475, 
                lng: -46.6361, 
                description: 'Aceita plástico, metal e papel. Horário: Seg-Sex 8h-18h'
            },
            { 
                name: 'ONG ReciclaBem', 
                type: 'ONG', 
                lat: -23.5586, 
                lng: -46.6253, 
                description: 'Parceria para triagem e doação. Projetos educacionais.'
            },
            { 
                name: 'Empresa Verde Ltda', 
                type: 'Empresa', 
                lat: -23.544, 
                lng: -46.645, 
                description: 'Recebe resíduos eletrônicos. Certificado verde.'
            }
        ];

        const markers = [];
        const center = [-23.55052, -46.633308];
        
        locations.forEach(location => {
            const marker = L.marker([location.lat, location.lng])
                .addTo(this.map)
                .bindPopup(this.createPopupContent(location));
            markers.push(marker);
        });

        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            this.map.fitBounds(group.getBounds().pad(0.3));
        }

        L.circle(center, { 
            radius: 2000, 
            color: 'var(--green-dark)',
            fillColor: 'var(--green-dark)',
            fillOpacity: 0.06 
        }).addTo(this.map);
    }

    // Cria conteúdo do popup do mapa
    createPopupContent(location) {
        return `
            <div class="map-popup">
                <h3>${this.escapeHtml(location.name)}</h3>
                <p><strong>Tipo:</strong> ${this.escapeHtml(location.type)}</p>
                <p>${this.escapeHtml(location.description)}</p>
            </div>
        `;
    }

    // Escapa HTML para prevenir XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Exibe mensagens para o usuário
    showMessage(text, type = 'info') {
        const messageEl = document.getElementById('formMsg');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.className = `form-message ${type}`;
            messageEl.style.display = 'block';

            if (type === 'success') {
                setTimeout(() => {
                    messageEl.style.display = 'none';
                }, 5000);
            }
        }
    }

    // Configura todos os event listeners
    initializeEventListeners() {
        this.nextBtn.addEventListener('click', () => this.nextStep());
        this.prevBtn.addEventListener('click', () => this.prevStep());
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        this.steps.forEach(step => {
            step.addEventListener('click', () => {
                const stepNumber = parseInt(step.dataset.step);
                if (stepNumber < this.currentStep) {
                    this.currentStep = stepNumber;
                    this.showStep(this.currentStep);
                }
            });
        });

        this.initializeRealTimeValidation();
        this.initializePhoneFormatting();
        this.initializeCharacterCount();
    }

    // Configura validação em tempo real
    initializeRealTimeValidation() {
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('blur', () => {
                if (emailField.value && !this.isValidEmail(emailField.value)) {
                    this.showError('email', 'E-mail inválido');
                }
            });
        }

        const quantidadeField = document.getElementById('quantidade');
        if (quantidadeField) {
            quantidadeField.addEventListener('blur', () => {
                if (quantidadeField.value && isNaN(quantidadeField.value)) {
                    this.showError('quantidade', 'Deve ser um número');
                }
            });
        }
    }

    // Formata número de telefone
    initializePhoneFormatting() {
        const phoneField = document.getElementById('telefone');
        if (phoneField) {
            phoneField.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }
    }

    // Aplica máscara de telefone
    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d+)/, '($1) $2');
        }
        
        input.value = value;
    }

    // Configura contador de caracteres
    initializeCharacterCount() {
        const observacoesField = document.getElementById('observacoes');
        const charCountEl = document.getElementById('observacoes-count');
        
        if (observacoesField && charCountEl) {
            observacoesField.addEventListener('input', () => {
                this.updateCharacterCount();
            });
            this.updateCharacterCount();
        }
    }

    // Atualiza contador de caracteres
    updateCharacterCount() {
        const observacoesField = document.getElementById('observacoes');
        const charCountEl = document.getElementById('observacoes-count');
        
        if (observacoesField && charCountEl) {
            const count = observacoesField.value.length;
            charCountEl.textContent = `${count}/500`;
            
            charCountEl.className = 'char-count';
            if (count > 400) charCountEl.classList.add('warning');
            if (count > 500) charCountEl.classList.add('error');
        }
    }
}

// Função global para rolar até uma seção
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new IRecycleApp();
});

// Torna as funções globais disponíveis
window.app = app;
window.scrollToSection = scrollToSection;
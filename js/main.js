window.scrollToSection = function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

class IRecycleApp {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 3;
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.mapMarkers = [];
    this.contactCache = new Map();
    this.session = this.getStoredSession();
    this.currentUser = this.session?.user || null;
    this.authToken = this.session?.token || null;
    this.currentLocation = null;
    this.init();
  }

  init() {
    this.initializeFormSteps();
    this.initializeEventListeners();
    this.initializeAuthUI();
    this.initializeMap();
    this.initializeManagement();
    this.tryCaptureLocation();
    this.updateAuthStateUI();
    this.fetchStats();
  }

  tryCaptureLocation() {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      },
      () => {
        this.currentLocation = null;
      }
    );
  }

  initializeFormSteps() {
    this.steps = Array.from(document.querySelectorAll('.step'));
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.submitBtn = document.getElementById('submitBtn');
    this.form = document.getElementById('residueForm');
    this.showStep(this.currentStep);
  }

  showStep(stepNumber) {
    this.steps.forEach(step => {
      const isActive = Number(step.dataset.step) === stepNumber;
      step.classList.toggle('active', isActive);
    });

    for (let i = 1; i <= this.totalSteps; i++) {
      const stepContent = document.getElementById(`step-${i}`);
      if (stepContent) {
        stepContent.style.display = i === stepNumber ? 'block' : 'none';
      }
    }

    this.prevBtn.style.display = stepNumber === 1 ? 'none' : 'block';
    this.nextBtn.style.display = stepNumber === this.totalSteps ? 'none' : 'block';
    this.submitBtn.style.display = stepNumber === this.totalSteps ? 'block' : 'none';
  }

  nextStep() {
    if (this.currentStep < this.totalSteps && this.validateStep(this.currentStep)) {
      this.currentStep++;
      this.showStep(this.currentStep);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.showStep(this.currentStep);
    }
  }

  validateStep(step) {
    const errors = [];

    if (step === 1) {
      const nome = document.getElementById('nome');
      const email = document.getElementById('email');
      const senha = document.getElementById('senha');

      if (!nome.value.trim()) {
        errors.push({ field: 'nome', message: 'Nome é obrigatório' });
      }

      if (!email.value.trim()) {
        errors.push({ field: 'email', message: 'E-mail é obrigatório' });
      } else if (!this.isValidEmail(email.value)) {
        errors.push({ field: 'email', message: 'E-mail inválido' });
      }

      if (!senha.value.trim()) {
        errors.push({ field: 'senha', message: 'Crie uma senha para acompanhar o cadastro' });
      } else if (senha.value.trim().length < 6) {
        errors.push({ field: 'senha', message: 'A senha deve ter ao menos 6 caracteres' });
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

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (field && errorElement) {
      field.style.borderColor = 'var(--error-red)';
      errorElement.textContent = message;
    }
  }

  clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
    });

    document.querySelectorAll('input, select, textarea').forEach(field => {
      field.style.borderColor = '';
    });
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    for (let i = 1; i <= this.totalSteps; i++) {
      if (!this.validateStep(i)) {
        this.showStep(i);
        return;
      }
    }

    const formData = new FormData(this.form);
    const payload = {
      nome: formData.get('nome').trim(),
      telefone: formData.get('telefone').trim(),
      email: formData.get('email').trim(),
      senha: formData.get('senha').trim(),
      empresa: formData.get('empresa').trim(),
      cargo: formData.get('cargo').trim(),
      tipoResiduo: formData.get('residuo'),
      quantidadeKg: formData.get('quantidade') ? Number(formData.get('quantidade')) : null,
      observacoes: formData.get('observacoes').trim(),
      latitude: this.currentLocation?.latitude || null,
      longitude: this.currentLocation?.longitude || null
    };

    this.setLoadingState(true);

    try {
      await this.submitToAPI(payload);
      this.showMessage('Cadastro realizado com sucesso! Entraremos em contato em breve.', 'success');
      this.resetForm();
      this.loadResiduosFromAPI();
    } catch (error) {
      this.showMessage(error.message || 'Erro ao realizar cadastro. Tente novamente.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  async submitToAPI(data) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.apiBaseUrl}/pessoas`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        nome: data.nome,
        telefone: data.telefone || null,
        email: data.email,
        senha: data.senha,
        tipoResiduo: data.tipoResiduo || null,
        quantidadeKg: data.quantidadeKg,
        observacoes: data.observacoes || null,
        latitude: data.latitude,
        longitude: data.longitude
      })
    });

    if (!response.ok) {
      throw new Error('Não foi possível enviar os dados para a API');
    }

    return response.json();
  }

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

  resetForm() {
    this.form.reset();
    this.currentStep = 1;
    this.showStep(this.currentStep);
    this.clearErrors();
    this.updateCharacterCount();
  }

  initializeMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    const center = [-23.55052, -46.633308];
    this.map = L.map('map').setView(center, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.circle(center, {
      radius: 2000,
      color: 'var(--green-dark)',
      fillColor: 'var(--green-dark)',
      fillOpacity: 0.06
    }).addTo(this.map);

    this.loadResiduosFromAPI();
  }

  async loadResiduosFromAPI() {
    if (!this.map) return;

    this.clearMapMarkers();
    try {
      const response = await fetch(`${this.apiBaseUrl}/pessoas`);
      if (!response.ok) {
        throw new Error('Não foi possível carregar os registros');
      }
      const payload = await response.json();
      const registros = Array.isArray(payload) ? payload : payload.items || [];

      const markers = [];
      registros.forEach(registro => {
        if (registro.Latitude == null || registro.Longitude == null) {
          return;
        }
        const marker = this.addResiduoMarker(registro);
        if (marker) markers.push(marker);
      });

      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        this.map.fitBounds(group.getBounds().pad(0.3));
      }
    } catch (error) {
      console.error(error);
    }
  }

  addResiduoMarker(registro) {
    const marker = L.marker([registro.Latitude, registro.Longitude]).addTo(this.map);
    marker.bindPopup(this.createPopupContent(registro));
    marker.on('popupopen', () => this.handlePopupOpen(marker, registro));
    this.mapMarkers.push(marker);
    return marker;
  }

  clearMapMarkers() {
    this.mapMarkers.forEach(marker => this.map.removeLayer(marker));
    this.mapMarkers = [];
  }

  handlePopupOpen(marker, registro) {
    if (!this.currentUser || this.currentUser.tipo !== 'empresa') {
      return;
    }

    if (this.contactCache.has(registro.Id)) {
      marker.setPopupContent(this.createPopupContent(registro, this.contactCache.get(registro.Id)));
      marker.update();
      return;
    }

    marker.setPopupContent(this.createPopupContent(registro, { loading: true }));

    this.fetchContato(registro.Id)
      .then(contato => {
        if (contato) {
          this.contactCache.set(registro.Id, contato);
          marker.setPopupContent(this.createPopupContent(registro, contato));
          marker.update();
        }
      })
      .catch(() => {
        marker.setPopupContent(this.createPopupContent(registro));
        marker.update();
      });
  }

  async fetchContato(id) {
    if (!this.authToken) {
      throw new Error('Token inválido');
    }

    const response = await fetch(`${this.apiBaseUrl}/pessoas/${id}/contato`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Contato indisponível');
    }

    return response.json();
  }

  createPopupContent(registro, contato) {
    const nome = contato && !contato.loading
      ? this.escapeHtml(registro.Nome)
      : this.shouldShowFullName() ? this.escapeHtml(registro.Nome) : this.maskName(registro.Nome);

    const quantidade = registro.QuantidadeKg ? `${registro.QuantidadeKg} kg` : 'Não informado';
    const tipoResiduo = registro.TipoResiduo || 'Não informado';

    let contatoHtml = '<p class="map-note">Faça login como empresa para visualizar o contato.</p>';
    if (contato?.loading) {
      contatoHtml = '<p class="map-note">Carregando informações de contato...</p>';
    } else if (contato) {
      contatoHtml = `
        <p><strong>Telefone:</strong> ${this.escapeHtml(contato.Telefone || 'Não informado')}</p>
        <p><strong>E-mail:</strong> ${this.escapeHtml(contato.Email || 'Não informado')}</p>
      `;
    }

    // Botões de edição/exclusão (aparecem apenas para empresas logadas)
    let actionButtons = '';
    if (this.currentUser && this.currentUser.tipo === 'empresa') {
      actionButtons = `
        <div class="popup-actions" style="margin-top: 12px; display: flex; gap: 8px;">
          <button onclick="app.openEditModal(${registro.Id})" class="btn secondary small">Editar</button>
          <button onclick="app.confirmDelete(${registro.Id})" class="btn secondary small" style="background-color: var(--error-red); border-color: var(--error-red);">Excluir</button>
        </div>
      `;
    }

    return `
      <div class="map-popup">
        <h3>${nome}</h3>
        <p><strong>Resíduo:</strong> ${this.escapeHtml(tipoResiduo)}</p>
        <p><strong>Quantidade:</strong> ${this.escapeHtml(quantidade)}</p>
        ${contatoHtml}
        ${actionButtons}
      </div>
    `;
  }

  shouldShowFullName() {
    return this.currentUser && this.currentUser.tipo === 'empresa';
  }

  maskName(name) {
    if (!name) return 'Pessoa cadastrada';
    const parts = name.split(' ');
    if (parts.length === 1) return `${parts[0][0]}***`;
    return `${parts[0]} ${parts[1][0]}.`;
  }

  escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

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

  initializeEventListeners() {
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextStep());
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevStep());
    if (this.form) this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

    this.steps.forEach(step => {
      step.addEventListener('click', () => {
        const stepNumber = parseInt(step.dataset.step, 10);
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

  initializePhoneFormatting() {
    const phoneField = document.getElementById('telefone');
    if (phoneField) {
      phoneField.addEventListener('input', (e) => {
        this.formatPhoneNumber(e.target);
      });
    }
  }

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

  initializeAuthUI() {
    this.authModal = document.getElementById('authModal');
    this.authMessageEl = document.getElementById('authModalMsg');
    this.authForms = document.querySelectorAll('.auth-form');
    this.authTabs = document.querySelectorAll('[data-auth-tab]');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.authGreeting = document.getElementById('authGreeting');
    this.authMode = 'login';
    this.authUserType = 'pessoa';

    document.querySelectorAll('[data-open-auth]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openAuthModal(btn.dataset.openAuth);
      });
    });

    document.querySelectorAll('[data-close-auth]').forEach(btn => {
      btn.addEventListener('click', () => this.closeAuthModal());
    });

    this.authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.setAuthMode(tab.dataset.authTab);
      });
    });

    this.authForms.forEach(form => {
      form.addEventListener('submit', (event) => this.handleAuthSubmit(event));
    });

    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => this.logout());
    }

    this.updateAuthFormsVisibility();
  }

  openAuthModal(userType) {
    this.authUserType = userType;
    if (this.authModal) {
      this.authModal.classList.add('open');
      this.authModal.setAttribute('aria-hidden', 'false');
      this.updateAuthFormsVisibility();
      this.displayAuthMessage('');
    }
  }

  closeAuthModal() {
    if (this.authModal) {
      this.authModal.classList.remove('open');
      this.authModal.setAttribute('aria-hidden', 'true');
      this.displayAuthMessage('');
    }
  }

  setAuthMode(mode) {
    this.authMode = mode;
    this.authTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.authTab === mode);
    });
    this.updateAuthFormsVisibility();
  }

  updateAuthFormsVisibility() {
    this.authForms.forEach(form => {
      const matchesUserType = form.dataset.userType === this.authUserType;
      const matchesMode = form.dataset.mode === this.authMode;
      form.style.display = matchesUserType && matchesMode ? 'grid' : 'none';
    });

    const modalTitle = document.getElementById('authModalTitle');
    if (modalTitle) {
      const typeLabel = this.authUserType === 'pessoa' ? 'Pessoa Física' : 'Empresa';
      const modeLabel = this.authMode === 'login' ? 'Entrar' : 'Cadastrar';
      modalTitle.textContent = `${modeLabel} - ${typeLabel}`;
    }
  }

  async handleAuthSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const data = Object.fromEntries(new FormData(form).entries());
    const mode = form.dataset.mode;
    const userType = form.dataset.userType;

    try {
      let endpoint = '';
      let method = 'POST';
      let body = {};

      if (mode === 'register') {
        endpoint = userType === 'pessoa' ? `${this.apiBaseUrl}/pessoas` : `${this.apiBaseUrl}/empresas`;
        body = this.getPayloadForAuthForm(userType, data);
      } else {
        endpoint = `${this.apiBaseUrl}/auth/${userType === 'pessoa' ? 'login-pessoa' : 'login-empresa'}`;
        body = {
          email: data.email,
          senha: data.senha
        };
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Não foi possível completar a solicitação');
      }

      const payload = await response.json();

      if (mode === 'login') {
        // Normalizar diferentes convenções de maiúsculas retornadas pela API
        const token = payload.token || payload.Token;
        const user = payload.user || payload.User;
        // Normalizar propriedades do usuário para a estrutura usada no front
        const normalizedUser = user ? {
          id: user.id || user.Id || 0,
          nome: user.nome || user.Nome || user.nome || user.Nome || '',
          tipo: (user.tipo || user.Tipo || '').toLowerCase()
        } : null;

        this.saveSession({ token, user: normalizedUser });
        this.displayAuthMessage('Login realizado com sucesso!', 'success');
        setTimeout(() => {
          this.closeAuthModal();
          this.updateAuthStateUI();
        }, 700);
      } else {
        this.displayAuthMessage('Cadastro realizado! Você já pode fazer login.', 'success');
        form.reset();
      }
    } catch (error) {
      this.displayAuthMessage(error.message || 'Erro ao processar solicitação', 'error');
    }
  }

  getPayloadForAuthForm(userType, data) {
    if (userType === 'pessoa') {
      return {
        nome: data.nome,
        telefone: data.telefone || null,
        email: data.email,
        senha: data.senha,
        tipoResiduo: data.tipoResiduo || null,
        quantidadeKg: data.quantidadeKg ? Number(data.quantidadeKg) : null,
        observacoes: data.observacoes || null,
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null
      };
    }

    return {
      razaoSocial: data.razaoSocial,
      nomeContato: data.nomeContato,
      telefone: data.telefone,
      email: data.email,
      senha: data.senha,
      cnpj: data.cnpj || null
    };
  }

  displayAuthMessage(message, type = 'info') {
    if (this.authMessageEl) {
      this.authMessageEl.textContent = message;
      this.authMessageEl.className = `form-message ${type}`;
      this.authMessageEl.style.display = message ? 'block' : 'none';
    }
  }

  saveSession(payload) {
    if (!payload) return;
    const token = payload.token || payload.Token;
    const user = payload.user || payload.User;
    if (!token) return;

    const session = {
      token,
      user
    };
    localStorage.setItem('irecycle_auth', JSON.stringify(session));
    this.session = session;
    this.currentUser = session.user;
    this.authToken = session.token;
    this.contactCache.clear();
  }

  getStoredSession() {
    const raw = localStorage.getItem('irecycle_auth');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  logout() {
    localStorage.removeItem('irecycle_auth');
    this.session = null;
    this.currentUser = null;
    this.authToken = null;
    this.contactCache.clear();
    this.updateAuthStateUI();
  }

  updateAuthStateUI() {
    if (this.authGreeting) {
      if (this.currentUser) {
        const tipoLabel = this.currentUser.tipo === 'empresa' ? 'Empresa' : 'Pessoa';
        this.authGreeting.textContent = `Olá, ${this.currentUser.nome} (${tipoLabel})`;
      } else {
        this.authGreeting.textContent = 'Acesse sua conta para ter mais recursos';
      }
    }

    if (this.logoutBtn) {
      this.logoutBtn.style.display = this.currentUser ? 'inline-flex' : 'none';
    }

    // Mostrar/ocultar link de gerenciamento
    const navGerenciar = document.getElementById('navGerenciar');
    if (navGerenciar) {
      navGerenciar.style.display = this.currentUser ? 'block' : 'none';
    }

    this.loadResiduosFromAPI();
  }


  async fetchStats() {
    try {
      const resp = await fetch(`${this.apiBaseUrl}/stats`);
      if (!resp.ok) return;
      const s = await resp.json();
      const empresasEl = document.getElementById('empresas-count');
      const usuariosEl = document.getElementById('usuarios-count');
      const pontosEl = document.getElementById('pontos-count');
      if (empresasEl) empresasEl.innerText = (s.empresasCount ?? s.EmpresasCount ?? 0).toString();
      if (usuariosEl) usuariosEl.innerText = (s.usuariosCount ?? s.UsuariosCount ?? 0).toString();
      if (pontosEl) pontosEl.innerText = (s.pontosColetaCount ?? s.PontosColetaCount ?? 0).toString();
    } catch (e) {
      console.error('Erro ao carregar stats', e);
    }
  }

  // Management Panel Functions
  initializeManagement() {
    this.manageSection = document.getElementById('gerenciar');
    this.manageTable = document.getElementById('manageTableBody');
    this.searchInput = document.getElementById('searchInput');
    this.filterType = document.getElementById('filterType');
    this.refreshBtn = document.getElementById('refreshBtn');
    this.editModal = document.getElementById('editModal');
    this.editForm = document.getElementById('editForm');
    this.editModalMsg = document.getElementById('editModalMsg');
    this.registros = [];

    if (this.refreshBtn) {
      this.refreshBtn.addEventListener('click', () => this.loadManageData());
    }

    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.filterManageData());
    }

    if (this.filterType) {
      this.filterType.addEventListener('change', () => this.filterManageData());
    }

    if (this.editForm) {
      this.editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
    }

    // Close edit modal handlers
    document.querySelectorAll('[data-close-edit]').forEach(el => {
      el.addEventListener('click', () => this.closeEditModal());
    });

    // Navegação para gerenciar
    const navGerenciar = document.querySelector('a[href="#gerenciar"]');
    if (navGerenciar) {
      navGerenciar.addEventListener('click', (e) => {
        e.preventDefault();
        this.showManageSection();
      });
    }
  }

  showManageSection() {
    if (!this.currentUser) {
      alert('Você precisa estar logado para acessar o painel de gerenciamento.');
      return;
    }

    this.manageSection.style.display = 'block';
    this.loadManageData();
    this.manageSection.scrollIntoView({ behavior: 'smooth' });
  }

  async loadManageData() {
    if (!this.manageTable) return;

    this.manageTable.innerHTML = '<tr><td colspan="7" class="loading-row">Carregando registros...</td></tr>';

    try {
      const response = await fetch(`${this.apiBaseUrl}/pessoas`, {
        headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
      });

      if (!response.ok) throw new Error('Erro ao carregar registros');

      const payload = await response.json();
      this.registros = Array.isArray(payload) ? payload : payload.items || [];

      this.renderManageData(this.registros);
    } catch (error) {
      console.error(error);
      this.manageTable.innerHTML = '<tr><td colspan="7" class="loading-row">Erro ao carregar registros. Tente novamente.</td></tr>';
    }
  }

  filterManageData() {
    const searchTerm = this.searchInput?.value.toLowerCase() || '';
    const typeFilter = this.filterType?.value || '';

    const filtered = this.registros.filter(registro => {
      const matchesSearch = 
        (registro.Nome || '').toLowerCase().includes(searchTerm) ||
        (registro.Email || '').toLowerCase().includes(searchTerm) ||
        (registro.TipoResiduo || '').toLowerCase().includes(searchTerm);

      const matchesType = !typeFilter || (registro.TipoResiduo || '').toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });

    this.renderManageData(filtered);
  }

  renderManageData(data) {
    if (!this.manageTable) return;

    if (data.length === 0) {
      this.manageTable.innerHTML = '<tr><td colspan="7" class="loading-row">Nenhum registro encontrado.</td></tr>';
      return;
    }

    this.manageTable.innerHTML = data.map(registro => `
      <tr>
        <td>${registro.Id || '-'}</td>
        <td>${this.escapeHtml(registro.Nome || '-')}</td>
        <td>${this.escapeHtml(registro.Email || '-')}</td>
        <td>${this.escapeHtml(registro.TipoResiduo || '-')}</td>
        <td>${registro.QuantidadeKg || '-'}</td>
        <td>${registro.CreatedAt ? new Date(registro.CreatedAt).toLocaleDateString('pt-BR') : '-'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon edit" onclick="app.openEditModal(${registro.Id})" title="Editar">✏️</button>
            <button class="btn-icon delete" onclick="app.confirmDelete(${registro.Id})" title="Excluir">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  openEditModal(id) {
    const registro = this.registros.find(r => r.Id === id);
    if (!registro) return;

    document.getElementById('editId').value = registro.Id;
    document.getElementById('editNome').value = registro.Nome || '';
    document.getElementById('editTelefone').value = registro.Telefone || '';
    document.getElementById('editEmail').value = registro.Email || '';
    document.getElementById('editTipoResiduo').value = registro.TipoResiduo || '';
    document.getElementById('editQuantidade').value = registro.QuantidadeKg || '';
    document.getElementById('editObservacoes').value = registro.Observacoes || '';

    this.editModal.classList.add('open');
    this.editModal.setAttribute('aria-hidden', 'false');
  }

  closeEditModal() {
    this.editModal.classList.remove('open');
    this.editModal.setAttribute('aria-hidden', 'true');
    this.editForm.reset();
    this.editModalMsg.style.display = 'none';
  }

  async handleEditSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = document.getElementById('editId').value;

    const payload = {
      nome: formData.get('nome'),
      telefone: formData.get('telefone') || null,
      email: formData.get('email'),
      tipoResiduo: formData.get('tipoResiduo') || null,
      quantidadeKg: formData.get('quantidadeKg') ? Number(formData.get('quantidadeKg')) : null,
      observacoes: formData.get('observacoes') || null
    };

    try {
      const response = await fetch(`${this.apiBaseUrl}/pessoas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Erro ao atualizar registro');

      this.displayEditMessage('Registro atualizado com sucesso!', 'success');
      setTimeout(() => {
        this.closeEditModal();
        this.loadManageData();
        this.loadResiduosFromAPI();
      }, 1000);
    } catch (error) {
      this.displayEditMessage(error.message || 'Erro ao atualizar', 'error');
    }
  }

  async confirmDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
      const response = await fetch(`${this.apiBaseUrl}/pessoas/${id}`, {
        method: 'DELETE',
        headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
      });

      if (!response.ok) throw new Error('Erro ao excluir registro');

      alert('Registro excluído com sucesso!');
      this.loadManageData();
      this.loadResiduosFromAPI();
    } catch (error) {
      alert(error.message || 'Erro ao excluir');
    }
  }

  displayEditMessage(message, type = 'info') {
    if (this.editModalMsg) {
      this.editModalMsg.textContent = message;
      this.editModalMsg.className = `form-message ${type}`;
      this.editModalMsg.style.display = message ? 'block' : 'none';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new IRecycleApp();
});

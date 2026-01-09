const CryptoJS = require('crypto-js');
const { ipcRenderer } = require('electron');

console.log('Renderer process started');
// Variáveis de estado
let db = { masterHash: '', accounts: [] };
let masterKey = '';

// --- INICIALIZAÇÃO (CONEXÃO COM O DISCO) ---

// Essa função roda assim que o app abre
async function init() {
  // const savedData = await window.electronAPI.getData();
  const savedData = await ipcRenderer.invoke('get-data');
  if (savedData && savedData.masterHash) {
    db = savedData;
  }
}

// Essa função avisa o Main Process para salvar o arquivo data.json
async function saveToDisk() {
  // await window.electronAPI.saveData(JSON.parse(JSON.stringify(db)));
  await ipcRenderer.invoke('save-data', JSON.parse(JSON.stringify(db)));
}

init(); // Chama a inicialização

// --- FUNÇÕES DE INTERFACE E LOGIN ---

function handleLogin() {
  console.log('Tentando logar...');
  const passInput = document.getElementById('masterInput');
  const success = login(passInput.value);
  if (success) {
    passInput.value = '';
  }
}

function login(password) {
  if (!password) return showToast('Digite a Senha Master!');

  if (password.length > 30) return showToast('Crie uma senha menor que 30 caracteres!');

  const hash = CryptoJS.SHA256(password).toString();

  // Se é o primeiro acesso, cria a senha master
  if (!db.masterHash) {
    db.masterHash = hash;
    saveToDisk();
    showToast('Senha Master cadastrada com sucesso!', 'success');
  } else if (db.masterHash !== hash) {
    showToast('Senha Master Incorreta!');
    return false;
  }

  masterKey = password; // Guarda a chave para criptografar/descriptografar
  showMainApp();
  renderPasswords();
  return true;
}

function showMainApp() {
  document.getElementById('loginSection').style.display = 'none';
  // document.getElementById('mainSection').style.display = 'flex';
  // document.getElementById('mainSection').style.flexDirection = 'column';

  const mainSection = document.getElementById('mainSection');
  mainSection.style.display = 'flex';
  mainSection.style.flexDirection = 'row';
  mainSection.style.alignItems = 'flex-start';
  mainSection.style.gap = '10px';

  // display: flex;
  // flex-direction: row;
  // align-items: flex-start;
  // gap: 10px;
}

// --- SEGURANÇA ---

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, masterKey).toString();
}

function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, masterKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// --- GERENCIAMENTO DE SENHAS ---

function addAccount() {
  const description = document.getElementById('desc').value;
  const url = document.getElementById('url').value;
  const username = document.getElementById('user').value;
  const password = document.getElementById('pass').value;

  if (!description || !password) return showToast('Preencha ao menos Descrição e Senha');

  if (description.length > 50) return showToast('Descrição muito longa! Máximo de 50 caracteres.');
  if (url.length > 300) return showToast('URL muito longa! Máximo de 300 caracteres.');
  if (username.length > 50) return showToast('Nome de usuário muito longo! Máximo de 50 caracteres.');
  if (password.length > 50) return showToast('Senha muito longa! Máximo de 50 caracteres.');

  const newAccount = {
    id: Date.now(),
    description,
    url,
    username,
    password: encrypt(password),
  };

  db.accounts.push(newAccount);
  saveToDisk();
  renderPasswords();
  clearInputs();
}

// function deleteAccount(id) {
//   if (confirm('Tem certeza que deseja excluir?')) {
//     db.accounts = db.accounts.filter((acc) => acc.id !== id);
//     saveToDisk();
//     renderPasswords();
//   }
// }

// --- MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ---
let accountIdToDelete = null;

function deleteAccount(id) {
  accountIdToDelete = id; // Guarda o ID que o usuário quer deletar
  document.getElementById('confirmModal').style.display = 'flex';
}

// Configura os botões do modal (faça isso fora de qualquer função, no final do arquivo)
document.getElementById('cancelBtn').onclick = () => {
  document.getElementById('confirmModal').style.display = 'none';
  accountIdToDelete = null;
};

document.getElementById('confirmBtn').onclick = () => {
  if (accountIdToDelete) {
    db.accounts = db.accounts.filter((acc) => acc.id !== accountIdToDelete);
    saveToDisk();
    renderPasswords();

    // Feedback visual (usando o toast que criamos antes)
    if (typeof showToast === 'function') showToast('Registro excluído.', 'success');
  }
  document.getElementById('confirmModal').style.display = 'none';
};

// --- COPIAR SENHA ---

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  showToast('Senha copiada para a área de transferência!', 'success');
}

function clearInputs() {
  document.getElementById('desc').value = '';
  document.getElementById('url').value = '';
  document.getElementById('user').value = '';
  document.getElementById('pass').value = '';
}

// --- PESQUISA ---
function search() {
  const term = document.getElementById('searchInput').value.toLowerCase();
  renderPasswords(term);
}

function renderPasswords(filter = '') {
  const list = document.getElementById('passwordList');
  list.innerHTML = '';

  const filtered = db.accounts.filter(
    (acc) =>
      acc.description.toLowerCase().includes(filter) || acc.url.toLowerCase().includes(filter) || acc.username.toLowerCase().includes(filter)
  );

  filtered.forEach((acc) => {
    const item = document.createElement('div');
    item.className = 'card password-item';
    item.innerHTML = `
            <div class="info">
                <strong title="${acc.description}">${acc.description}</strong><br>
                <span 
                    class="url-text" 
                    title="${acc.url}"
                    onclick="copyTextOnly('${acc.url}')" 
                    style="cursor: pointer;">
                    ${acc.url}
                </span> • 
                <small 
                    title="Clique para copiar: ${acc.username}" 
                    onclick="copyTextOnly('${acc.username}')" 
                    style="cursor: pointer;">
                    ${acc.username}
                </small>
            </div>
            <div class="actions">
                <button class="btn-icon" title="Copiar Senha" onclick="copyToClipboard('${decrypt(acc.password)}')">
                    <i class="bi bi-copy"></i>
                </button>
                <button class="btn-icon btn-delete" title="Excluir" onclick="deleteAccount(${acc.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
    list.appendChild(item);
  });
}

function copyTextOnly(text) {
  navigator.clipboard.writeText(text);
  showToast('Copiado: ' + text, 'info');
}

// --- TOAST ---

// Mapeamento de cores do toast
const colors = {
  success: '#2ed573',
  error: '#ff4757',
  info: '#3742fa',
  warning: '#ffa502',
};

function showToast(message, type = 'error') {
  // Vermelho é o padrão se não enviar cor
  const toast = document.getElementById('toast');

  toast.innerText = message;
  toast.style.backgroundColor = colors[type] || colors.error;

  toast.className = 'show';

  // Usamos um identificador para o timer para evitar bugs se clicar várias vezes
  if (toast.timeout) clearTimeout(toast.timeout);

  toast.timeout = setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3000);
}

// Captura o Enter no campo de Senha Master
document.getElementById('masterInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    handleLogin();
  }
});

window.onload = () => {
  document.getElementById('masterInput').focus();
};
// document.getElementById('btn-login').addEventListener('click', handleLogin);
// document.getElementById('btn-add').addEventListener('click', addAccount);
// document.getElementById('btn-search').addEventListener('click', search);

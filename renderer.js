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
  const hash = CryptoJS.SHA256(password).toString();

  // Se é o primeiro acesso, cria a senha master
  if (!db.masterHash) {
    db.masterHash = hash;
    saveToDisk();
    alert('Senha Master cadastrada com sucesso!');
  } else if (db.masterHash !== hash) {
    alert('Senha Master Incorreta!');
    return false;
  }

  masterKey = password; // Guarda a chave para criptografar/descriptografar
  showMainApp();
  renderPasswords();
  return true;
}

function showMainApp() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('mainSection').style.display = 'flex';
  document.getElementById('mainSection').style.flexDirection = 'column';
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

  if (!description || !password) return alert('Preencha ao menos Descrição e Senha');

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

function deleteAccount(id) {
  if (confirm('Tem certeza que deseja excluir?')) {
    db.accounts = db.accounts.filter((acc) => acc.id !== id);
    saveToDisk();
    renderPasswords();
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  alert('Senha copiada para a área de transferência!');
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
                <strong>${acc.description}</strong><br>
                <span class="url-text">${acc.url}</span> • <small>${acc.username}</small>
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

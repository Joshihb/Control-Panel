// Dashboard API calls and DOM manipulation
// API_URL is set via inline script in index.php
// Fallback if not defined
if (typeof API_URL === 'undefined') {
  window.API_URL = 'http://localhost:4500';
}

console.log('[Dashboard] API_URL:', window.API_URL);

// Fetch wrapper with error handling
async function fetchAPI(endpoint) {
  try {
    const url = `${window.API_URL}${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return null;
  }
}

// Format bytes to readable size
function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// Format duration in seconds to human readable
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
}

// ============ DASHBOARD ============
async function loadDashboard() {
  console.log('[Dashboard] Loading dashboard...');
  const data = await fetchAPI('/api/system-info');
  console.log('[Dashboard] Response:', data);
  if (!data) {
    console.error('[Dashboard] Failed to fetch system info');
    return;
  }

  const grid = document.getElementById('dashboard-grid');
  if (!grid) {
    console.error('[Dashboard] dashboard-grid element not found');
    return;
  }

  grid.innerHTML = `
    <div class="stat-box">
      <label>Hostname</label>
      <div class="value">${data.hostname}</div>
    </div>
    <div class="stat-box">
      <label>CPU Cores</label>
      <div class="value">${data.cpuCount}</div>
    </div>
    <div class="stat-box">
      <label>Total Memory</label>
      <div class="value">${formatBytes(data.totalMemory)}</div>
    </div>
    <div class="stat-box">
      <label>Free Memory</label>
      <div class="value">${formatBytes(data.freeMemory)}</div>
    </div>
    <div class="stat-box">
      <label>Used Memory</label>
      <div class="value">${formatBytes(data.usedMemory)}</div>
    </div>
    <div class="stat-box">
      <label>System Uptime</label>
      <div class="value">${formatUptime(data.uptime)}</div>
    </div>
    <div class="stat-box">
      <label>CPU Load (avg)</label>
      <div class="value">${data.loadAverage[0].toFixed(2)}</div>
    </div>
    <div class="stat-box">
      <label>Platform</label>
      <div class="value">${data.platform}</div>
    </div>
  `;
}

// ============ SERVICES ============
async function loadServices() {
  const data = await fetchAPI('/api/services');
  if (!data) return;

  const tbody = document.getElementById('services-body');
  tbody.innerHTML = data.map(svc => `
    <tr>
      <td>${svc.unit || 'N/A'}</td>
      <td>${svc.load || 'N/A'}</td>
      <td>${svc.active || 'N/A'}</td>
      <td>${svc.sub || 'N/A'}</td>
      <td>${svc.description || 'N/A'}</td>
      <td>
        <button class="btn btn-success" onclick="serviceAction('start', '${svc.unit}')">Start</button>
        <button class="btn btn-danger" onclick="serviceAction('stop', '${svc.unit}')">Stop</button>
      </td>
    </tr>
  `).join('');

  // Search functionality
  document.getElementById('service-search').addEventListener('keyup', (e) => {
    const filter = e.target.value.toLowerCase();
    document.querySelectorAll('#services-body tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
  });
}

async function serviceAction(action, serviceName) {
  const result = await fetchAPI(`/api/service/${action}/${serviceName}`);
  if (result) {
    alert(`Service ${serviceName} ${action}ed successfully`);
    loadServices();
  }
}

// ============ PROCESSES ============
async function loadProcesses() {
  const data = await fetchAPI('/api/processes');
  if (!data) return;

  const tbody = document.getElementById('processes-body');
  tbody.innerHTML = data.map(proc => `
    <tr>
      <td>${proc.user}</td>
      <td>${proc.pid}</td>
      <td>${proc.cpu.toFixed(2)}</td>
      <td>${proc.memory.toFixed(2)}</td>
      <td>${proc.command.substring(0, 50)}</td>
      <td><button class="btn btn-danger" onclick="killProcess(${proc.pid})">Kill</button></td>
    </tr>
  `).join('');

  // Search
  document.getElementById('process-search').addEventListener('keyup', (e) => {
    const filter = e.target.value.toLowerCase();
    document.querySelectorAll('#processes-body tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
  });
}

async function killProcess(pid) {
  if (confirm(`Kill process ${pid}?`)) {
    const result = await fetchAPI(`/api/process/kill/${pid}`);
    if (result) {
      alert(`Process ${pid} killed`);
      loadProcesses();
    }
  }
}

// ============ PACKAGES ============
async function loadPackages() {
  const data = await fetchAPI('/api/packages');
  if (!data) return;

  const tbody = document.getElementById('packages-body');
  tbody.innerHTML = data.map(pkg => `
    <tr>
      <td>${pkg.name}</td>
      <td>${pkg.version}</td>
    </tr>
  `).join('');

  // Search
  document.getElementById('package-search').addEventListener('keyup', (e) => {
    const filter = e.target.value.toLowerCase();
    document.querySelectorAll('#packages-body tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
  });
}

// ============ OPEN PORTS ============
async function loadPorts() {
  const data = await fetchAPI('/api/ports');
  if (!data) return;

  const tbody = document.getElementById('ports-body');
  tbody.innerHTML = data.map(port => `
    <tr>
      <td><code>${port.connection}</code></td>
    </tr>
  `).join('');
}

// ============ USERS ============
async function loadUsers() {
  const data = await fetchAPI('/api/users');
  if (!data) return;

  const tbody = document.getElementById('users-body');
  tbody.innerHTML = data.map(user => `
    <tr>
      <td>${user.username}</td>
      <td>${user.uid}</td>
      <td>${user.fullname}</td>
    </tr>
  `).join('');
}

// ============ LOGS ============
async function loadLogs() {
  const data = await fetchAPI('/api/logs/system');
  if (!data) return;

  const container = document.getElementById('logs-container');
  container.innerHTML = data.slice(0, 50).map(log => 
    `<div class="log-line">${escapeHtml(log.message)}</div>`
  ).join('');
}

// ============ DISK ============
async function loadDisk() {
  const data = await fetchAPI('/api/disk');
  if (!data) return;

  const tbody = document.getElementById('disk-body');
  tbody.innerHTML = data.map(disk => `
    <tr>
      <td>${disk.filesystem}</td>
      <td>${disk.size}</td>
      <td>${disk.used}</td>
      <td>${disk.available}</td>
      <td><span style="color: ${getColor(disk.usePercent)}">${disk.usePercent}</span></td>
      <td>${disk.mountPoint}</td>
    </tr>
  `).join('');
}

// ============ FIREWALL ============
async function loadFirewall() {
  const status = await fetchAPI('/api/firewall/status');
  const rules = await fetchAPI('/api/firewall/rules');

  if (status) {
    document.getElementById('firewall-status').textContent = status.status || 'Unable to retrieve status';
  }
  if (rules) {
    document.getElementById('firewall-rules').textContent = rules.rules || 'No rules found';
  }
}

// ============ SSH ============
async function loadSSH() {
  const sessions = await fetchAPI('/api/ssh/active-sessions');
  const failed = await fetchAPI('/api/ssh/failed-logins');

  if (sessions) {
    document.getElementById('ssh-sessions').innerHTML = (sessions.sessions || [])
      .map(s => `<div class="log-line">${escapeHtml(s)}</div>`).join('') || 'No active sessions';
  }
  if (failed) {
    document.getElementById('ssh-failed').innerHTML = escapeHtml(failed.failedLogins);
  }
}

// ============ NETWORK ============
async function loadNetwork() {
  const data = await fetchAPI('/api/network');
  if (!data) return;

  const tbody = document.getElementById('network-body');
  tbody.innerHTML = data.map(net => `
    <tr>
      <td>${net.interface}</td>
      <td>${formatBytes(net.recvBytes)}</td>
      <td>${net.recvPackets}</td>
      <td>${formatBytes(net.sentBytes)}</td>
      <td>${net.sentPackets}</td>
    </tr>
  `).join('');
}

// ============ CRON ============
async function loadCron() {
  const data = await fetchAPI('/api/cron');
  if (!data) return;

  document.getElementById('cron-list').textContent = data.crons.join('\n') || 'No cron jobs found';
}

// ============ BACKUP ============
async function loadBackup() {
  const data = await fetchAPI('/api/backups');
  if (!data) return;

  const tbody = document.getElementById('backup-body');
  tbody.innerHTML = data.map(backup => `
    <tr>
      <td>${backup.name}</td>
      <td>${(backup.size / (1024 * 1024)).toFixed(2)}</td>
      <td>${new Date(backup.modified).toLocaleString()}</td>
    </tr>
  `).join('');
}

// ============ MONITORING (Real-time Charts) ============
let cpuChart, memoryChart;

async function initMonitoring() {
  const cpuCtx = document.getElementById('cpu-chart').getContext('2d');
  const memCtx = document.getElementById('memory-chart').getContext('2d');

  cpuChart = new Chart(cpuCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'CPU Usage %',
        data: [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: '#cbd5e1' },
          grid: { color: '#334155' }
        },
        x: { ticks: { color: '#cbd5e1' }, grid: { color: '#334155' } }
      },
      plugins: {
        legend: { labels: { color: '#cbd5e1' } }
      }
    }
  });

  memoryChart = new Chart(memCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Memory Usage %',
        data: [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: '#cbd5e1' },
          grid: { color: '#334155' }
        },
        x: { ticks: { color: '#cbd5e1' }, grid: { color: '#334155' } }
      },
      plugins: {
        legend: { labels: { color: '#cbd5e1' } }
      }
    }
  });

  updateMonitoring();
  setInterval(updateMonitoring, 5000);
}

async function updateMonitoring() {
  const data = await fetchAPI('/api/monitoring/stats');
  if (!data || data.length === 0) return;

  const labels = data.map((d, i) => i % 5 === 0 ? new Date(d.timestamp).toLocaleTimeString() : '');
  const cpuData = data.map(d => d.cpuLoad);
  const memData = data.map(d => d.memoryUsage);

  cpuChart.data.labels = labels;
  cpuChart.data.datasets[0].data = cpuData;
  cpuChart.update('none');

  memoryChart.data.labels = labels;
  memoryChart.data.datasets[0].data = memData;
  memoryChart.update('none');
}

// ============ HELPER FUNCTIONS ============
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function getColor(percentage) {
  const num = parseInt(percentage);
  if (num > 80) return '#ef4444';
  if (num > 50) return '#f59e0b';
  return '#10b981';
}

// ============ LOAD SECTION DATA ON CLICK ============
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('nav.sidebar a[data-section]');
  
  links.forEach(link => {
    link.addEventListener('click', async () => {
      const section = link.getAttribute('data-section');
      
      // Load data for this section
      switch (section) {
        case 'dashboard': loadDashboard(); break;
        case 'services': loadServices(); break;
        case 'processes': loadProcesses(); break;
        case 'packages': loadPackages(); break;
        case 'ports': loadPorts(); break;
        case 'users': loadUsers(); break;
        case 'logs': loadLogs(); break;
        case 'disk': loadDisk(); break;
        case 'firewall': loadFirewall(); break;
        case 'ssh': loadSSH(); break;
        case 'network': loadNetwork(); break;
        case 'cron': loadCron(); break;
        case 'backup': loadBackup(); break;
        case 'monitoring': initMonitoring(); break;
      }
    });
  });

  // Load dashboard on initial load
  loadDashboard();
});

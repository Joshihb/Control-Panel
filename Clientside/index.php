<?php
$server_ip = $_SERVER['SERVER_ADDR'] ?? gethostbyname(gethostname());
$api_url = "http://localhost:4500";
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Server Control Panel</title>
  <link rel="stylesheet" href="stylesheet.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
</head>
<body>

  <nav class="sidebar">
    <div class="sidebar-header">Control Panel</div>
    <a href="#dashboard" data-section="dashboard">📊 Dashboard</a>
    <a href="#services" data-section="services">⚙️ Services</a>
    <a href="#processes" data-section="processes">📋 Processes</a>
    <a href="#packages" data-section="packages">📦 Packages</a>
    <a href="#ports" data-section="ports">🌐 Open Ports</a>
    <a href="#users" data-section="users">👥 Users</a>
    <a href="#logs" data-section="logs">📝 Logs</a>
    <a href="#disk" data-section="disk">💾 Disk</a>
    <a href="#firewall" data-section="firewall">🔒 Firewall</a>
    <a href="#ssh" data-section="ssh">🔐 SSH</a>
    <a href="#network" data-section="network">📡 Network</a>
    <a href="#cron" data-section="cron">⏰ Cron Jobs</a>
    <a href="#backup" data-section="backup">📦 Backup</a>
    <a href="#monitoring" data-section="monitoring">📈 Monitoring</a>
    <a href="ftp://root:root123@<?php echo $server_ip; ?>" target="_blank" rel="noopener">📂 Open FTP</a>
  </nav>

  <main class="main">
    <h1>Server Control Panel</h1>
    <div id="content">

      <!-- DASHBOARD -->
      <div id="dashboard" class="content-section active">
        <h2>Dashboard</h2>
        <div class="dashboard-grid" id="dashboard-grid">Loading system info...</div>
      </div>

      <!-- SERVICES -->
      <div id="services" class="content-section">
        <h2>Services Management</h2>
        <div class="search-bar">
          <input type="text" id="service-search" placeholder="Search services...">
        </div>
        <div class="table-container">
          <table id="services-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Load</th>
                <th>Active</th>
                <th>Sub</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="services-body">
              <tr><td colspan="6">Loading services...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PROCESSES -->
      <div id="processes" class="content-section">
        <h2>Active Processes</h2>
        <div class="search-bar">
          <input type="text" id="process-search" placeholder="Search processes...">
        </div>
        <div class="table-container">
          <table id="processes-table">
            <thead>
              <tr>
                <th>User</th>
                <th>PID</th>
                <th>CPU %</th>
                <th>MEM %</th>
                <th>Command</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="processes-body">
              <tr><td colspan="6">Loading processes...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PACKAGES -->
      <div id="packages" class="content-section">
        <h2>Installed Packages</h2>
        <div class="search-bar">
          <input type="text" id="package-search" placeholder="Search packages...">
        </div>
        <div class="table-container">
          <table id="packages-table">
            <thead>
              <tr>
                <th>Package</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody id="packages-body">
              <tr><td colspan="2">Loading packages...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- OPEN PORTS -->
      <div id="ports" class="content-section">
        <h2>Open Ports</h2>
        <div class="table-container">
          <table id="ports-table">
            <thead>
              <tr>
                <th>Connection Info</th>
              </tr>
            </thead>
            <tbody id="ports-body">
              <tr><td>Loading ports...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- USERS -->
      <div id="users" class="content-section">
        <h2>System Users</h2>
        <div class="table-container">
          <table id="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>UID</th>
                <th>Full Name</th>
              </tr>
            </thead>
            <tbody id="users-body">
              <tr><td colspan="3">Loading users...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- LOGS -->
      <div id="logs" class="content-section">
        <h2>System Logs</h2>
        <div class="log-container" id="logs-container">Loading logs...</div>
      </div>

      <!-- DISK USAGE -->
      <div id="disk" class="content-section">
        <h2>Disk Usage</h2>
        <div class="table-container">
          <table id="disk-table">
            <thead>
              <tr>
                <th>Filesystem</th>
                <th>Size</th>
                <th>Used</th>
                <th>Available</th>
                <th>Used %</th>
                <th>Mount Point</th>
              </tr>
            </thead>
            <tbody id="disk-body">
              <tr><td colspan="6">Loading disk info...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- FIREWALL -->
      <div id="firewall" class="content-section">
        <h2>Firewall Status</h2>
        <div class="info-box" id="firewall-status">Loading firewall status...</div>
        <h3>Firewall Rules</h3>
        <pre id="firewall-rules">Loading rules...</pre>
      </div>

      <!-- SSH -->
      <div id="ssh" class="content-section">
        <h2>SSH Monitoring</h2>
        <h3>Active Sessions</h3>
        <div class="log-container" id="ssh-sessions">Loading sessions...</div>
        <h3>Failed Logins</h3>
        <div class="log-container" id="ssh-failed">Loading failed logins...</div>
      </div>

      <!-- NETWORK -->
      <div id="network" class="content-section">
        <h2>Network Interfaces</h2>
        <div class="table-container">
          <table id="network-table">
            <thead>
              <tr>
                <th>Interface</th>
                <th>Recv (Bytes)</th>
                <th>Recv (Packets)</th>
                <th>Sent (Bytes)</th>
                <th>Sent (Packets)</th>
              </tr>
            </thead>
            <tbody id="network-body">
              <tr><td colspan="5">Loading network info...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CRON JOBS -->
      <div id="cron" class="content-section">
        <h2>Scheduled Cron Jobs</h2>
        <pre id="cron-list">Loading cron jobs...</pre>
      </div>

      <!-- BACKUP -->
      <div id="backup" class="content-section">
        <h2>Backup Files</h2>
        <div class="table-container">
          <table id="backup-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Size (MB)</th>
                <th>Modified</th>
              </tr>
            </thead>
            <tbody id="backup-body">
              <tr><td colspan="3">Loading backups...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MONITORING (Real-time) -->
      <div id="monitoring" class="content-section">
        <h2>Real-time Monitoring</h2>
        <div class="monitoring-grid">
          <div class="chart-box">
            <h3>CPU Usage (%)</h3>
            <canvas id="cpu-chart"></canvas>
          </div>
          <div class="chart-box">
            <h3>Memory Usage (%)</h3>
            <canvas id="memory-chart"></canvas>
          </div>
        </div>
      </div>

    </div>
  </main>

  <script src="script.js"></script>
  <script>
    const API_URL = '<?php echo $api_url; ?>';
  </script>
  <script src="dashboard.js"></script>

</body>
</html>

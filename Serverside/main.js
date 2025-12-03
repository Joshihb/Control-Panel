const express = require('express');
const cors = require('cors');
const { execSync, exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4500;

app.use(cors());
app.use(express.json());

// Utility: Execute shell command (Promise-based)
const execCmd = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout.trim());
    });
  });
};

// ============ SYSTEM INFO ============
app.get('/api/system-info', (req, res) => {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const uptime = os.uptime();

    res.json({
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: cpus.length,
      totalMemory: totalMem,
      freeMemory: freeMem,
      usedMemory: totalMem - freeMem,
      uptime: uptime,
      loadAverage: os.loadavg(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ PROCESSES ============
app.get('/api/processes', async (req, res) => {
  try {
    const cmd = 'ps aux --sort=-%cpu';
    const output = await execCmd(cmd);
    const lines = output.split('\n').slice(1, 26); // Top 25
    const processes = lines.map(line => {
      const parts = line.split(/\s+/);
      return {
        user: parts[0],
        pid: parts[1],
        cpu: parseFloat(parts[2]),
        memory: parseFloat(parts[3]),
        command: parts.slice(10).join(' '),
      };
    });
    res.json(processes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/process/kill/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    await execCmd(`kill -9 ${pid}`);
    res.json({ success: true, message: `Process ${pid} killed` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SERVICES (systemd) ============
app.get('/api/services', async (req, res) => {
  try {
    const cmd = 'systemctl list-units --type=service --all --no-pager --output=json 2>/dev/null || echo "[]"';
    const output = await execCmd(cmd);
    try {
      const services = JSON.parse(output).slice(0, 30); // Top 30
      res.json(services);
    } catch (parseErr) {
      // If parsing fails, return empty array
      res.json([]);
    }
  } catch (err) {
    res.json([]);
  }
});

app.post('/api/service/:action/:name', async (req, res) => {
  try {
    const { action, name } = req.params;
    const validActions = ['start', 'stop', 'restart', 'enable', 'disable'];
    if (!validActions.includes(action)) throw new Error('Invalid action');
    await execCmd(`sudo systemctl ${action} ${name}`);
    res.json({ success: true, message: `Service ${name} ${action}ed` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ PACKAGES ============
app.get('/api/packages', async (req, res) => {
  try {
    const cmd = "dpkg -l | grep '^ii' | awk '{print $2, $3}'";
    const output = await execCmd(cmd);
    const packages = output.split('\n').slice(0, 50).map(line => {
      const [name, version] = line.split(/\s+/);
      return { name, version };
    });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ LOGS ============
app.get('/api/logs/system', async (req, res) => {
  try {
    const cmd = 'journalctl -n 50 --no-pager -o short-iso';
    const output = await execCmd(cmd);
    const logs = output.split('\n').map(line => ({ message: line }));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ OPEN PORTS ============
app.get('/api/ports', async (req, res) => {
  try {
    const cmd = 'sudo netstat -tulpn 2>/dev/null | grep LISTEN || ss -tulpn | grep LISTEN';
    const output = await execCmd(cmd);
    const ports = output.split('\n').filter(line => line).slice(0, 30).map(line => ({
      connection: line,
    }));
    res.json(ports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ FIREWALL ============
app.get('/api/firewall/status', async (req, res) => {
  try {
    const cmd = 'sudo ufw status 2>/dev/null || echo "UFW not available"';
    const output = await execCmd(cmd);
    res.json({ status: output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/firewall/rules', async (req, res) => {
  try {
    const cmd = 'sudo ufw show added 2>/dev/null || echo "No rules"';
    const output = await execCmd(cmd);
    res.json({ rules: output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ USERS ============
app.get('/api/users', async (req, res) => {
  try {
    const cmd = 'cut -d: -f1,3,5 /etc/passwd | grep -E ":[0-9]{4}:"';
    const output = await execCmd(cmd);
    const users = output.split('\n').map(line => {
      const [username, uid, fullname] = line.split(':');
      return { username, uid, fullname };
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ CRON JOBS ============
app.get('/api/cron', async (req, res) => {
  try {
    const cmd = 'for user in $(cut -f1 -d: /etc/passwd); do echo "=== $user ===" && crontab -l -u $user 2>/dev/null; done | head -50';
    const output = await execCmd(cmd);
    const crons = output.split('\n').filter(line => line);
    res.json({ crons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ DISK USAGE ============
app.get('/api/disk', async (req, res) => {
  try {
    const cmd = 'df -h | tail -n +2';
    const output = await execCmd(cmd);
    const disks = output.split('\n').map(line => {
      const parts = line.split(/\s+/);
      return {
        filesystem: parts[0],
        size: parts[1],
        used: parts[2],
        available: parts[3],
        usePercent: parts[4],
        mountPoint: parts[5],
      };
    });
    res.json(disks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SSH MONITORING ============
app.get('/api/ssh/failed-logins', async (req, res) => {
  try {
    const cmd = 'grep "Failed password" /var/log/auth.log 2>/dev/null | tail -20 || echo "No failed logins"';
    const output = await execCmd(cmd);
    res.json({ failedLogins: output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ssh/active-sessions', async (req, res) => {
  try {
    const cmd = 'who';
    const output = await execCmd(cmd);
    const sessions = output.split('\n').filter(line => line);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ NETWORK STATS ============
app.get('/api/network', async (req, res) => {
  try {
    const cmd = 'cat /proc/net/dev | tail -n +3';
    const output = await execCmd(cmd);
    const interfaces = output.split('\n').filter(line => line && !line.includes('lo:')).map(line => {
      const parts = line.split(/\s+/);
      return {
        interface: parts[0].replace(':', ''),
        recvBytes: parts[1],
        recvPackets: parts[2],
        sentBytes: parts[10],
        sentPackets: parts[11],
      };
    });
    res.json(interfaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ MONITORING (CPU, Memory, Disk over time) ============
const statsHistory = [];
setInterval(() => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const cpus = os.cpus();
  const avgLoad = os.loadavg()[0];

  statsHistory.push({
    timestamp: new Date().toISOString(),
    cpuLoad: (avgLoad / cpus.length) * 100,
    memoryUsage: ((totalMem - freeMem) / totalMem) * 100,
  });

  // Keep last 60 data points
  if (statsHistory.length > 60) statsHistory.shift();
}, 5000);

app.get('/api/monitoring/stats', (req, res) => {
  res.json(statsHistory);
});

// ============ DATABASE MANAGEMENT (MySQL/PostgreSQL) ============
app.get('/api/databases/mysql-status', async (req, res) => {
  try {
    const cmd = 'systemctl is-active mysql 2>/dev/null || systemctl is-active mariadb 2>/dev/null || echo "not-found"';
    const status = await execCmd(cmd);
    res.json({ status: status || 'inactive' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ BACKUP STATUS ============
app.get('/api/backups', (req, res) => {
  try {
    const backupDir = '/var/backups';
    const files = fs.readdirSync(backupDir).map(file => {
      const fullPath = path.join(backupDir, file);
      const stats = fs.statSync(fullPath);
      return {
        name: file,
        size: stats.size,
        modified: stats.mtime,
      };
    }).slice(0, 20);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server Dashboard API listening on port ${PORT}`);
});
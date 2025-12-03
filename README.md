# Server Control Panel

A comprehensive web-based server management dashboard with real-time monitoring, service control, and system analytics.

## Features

### Core Management
- **Dashboard**: Real-time system overview (CPU, memory, uptime, hostname)
- **Services Management**: View, start, stop, enable/disable systemd services
- **Process Management**: Monitor running processes, kill by PID
- **Package Management**: View installed packages
- **Open Ports**: List all listening ports and connections
- **Users**: System user management and details
- **Logs**: System journal and application logs
- **Disk Usage**: Filesystem overview and mount point details

### Security & Monitoring
- **Firewall**: UFW firewall status and rules
- **SSH Monitoring**: Active sessions and failed login attempts
- **Network Interfaces**: Network traffic statistics per interface
- **Cron Jobs**: View scheduled cron tasks
- **Backup Files**: List backup files in `/var/backups`
- **Real-time Monitoring**: Live CPU and memory usage charts

## Architecture

### Backend (Node.js/Express)
- **Port**: 4500
- **Location**: `Serverside/main.js`
- REST API endpoints for all system operations
- Uses child_process to execute system commands safely

### Frontend (PHP/JavaScript)
- **Location**: `Clientside/index.php`, `script.js`, `dashboard.js`, `stylesheet.css`
- Single-page application with dynamic section switching
- Chart.js for real-time monitoring visualizations
- Responsive design for mobile and desktop

## Installation & Setup

### Prerequisites
- Node.js and npm
- PHP with Apache/web server
- Linux system with systemd, dpkg, ufw (optional features gracefully degrade)

### Backend Setup
```bash
cd Serverside
npm install
npm start
# Server runs on http://localhost:4500
```

### Frontend Setup
```bash
# Using PHP built-in server (for testing)
cd Clientside
php -S 0.0.0.0:8000
# Open http://localhost:8000/index.php

# OR with Apache
# Copy Clientside/ to Apache document root and ensure:
# - Apache mod_rewrite is enabled
# - PHP is configured
# - Ensure the backend API is accessible at http://localhost:4500
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system-info` | System overview (CPU, memory, uptime, etc.) |
| GET | `/api/processes` | List top 25 processes by CPU usage |
| POST | `/api/process/kill/:pid` | Kill a process |
| GET | `/api/services` | List systemd services |
| POST | `/api/service/:action/:name` | Start/stop/restart/enable/disable service |
| GET | `/api/packages` | List installed packages |
| GET | `/api/logs/system` | System journal logs |
| GET | `/api/ports` | List open ports |
| GET | `/api/firewall/status` | Firewall status |
| GET | `/api/firewall/rules` | Firewall rules |
| GET | `/api/users` | System users |
| GET | `/api/cron` | Cron jobs |
| GET | `/api/disk` | Disk usage |
| GET | `/api/ssh/failed-logins` | Failed SSH login attempts |
| GET | `/api/ssh/active-sessions` | Active SSH sessions |
| GET | `/api/network` | Network interface statistics |
| GET | `/api/monitoring/stats` | Real-time CPU/memory stats (updated every 5s) |
| GET | `/api/backups` | Backup files list |
| GET | `/api/databases/mysql-status` | MySQL/MariaDB service status |
| GET | `/api/health` | Health check endpoint |

## Usage

1. **Start the backend** (if not already running):
   ```bash
   cd Serverside && npm start &
   ```

2. **Start the frontend**:
   ```bash
   cd Clientside && php -S 0.0.0.0:8000
   ```

3. **Open your browser** and navigate to `http://localhost:8000/index.php`

4. **Navigate sections** using the sidebar:
   - Click any section to view relevant data
   - Search tables for quick filtering
   - Use action buttons to control services and processes

## Key Files

- `Serverside/main.js` - Express API server with system command execution
- `Clientside/index.php` - Main HTML structure with all sections
- `Clientside/script.js` - Single-page app navigation logic
- `Clientside/dashboard.js` - API calls and data loading logic
- `Clientside/stylesheet.css` - Dark-themed, responsive styling

## Responsive Design

The dashboard is fully responsive:
- **Desktop (>900px)**: Vertical sidebar + main content
- **Tablet (600-900px)**: Horizontal sticky top bar + content
- **Mobile (<600px)**: Single column layout with compact styling

## Security Notes

⚠️ **This dashboard should only be used in secure, trusted environments.**

- No authentication implemented (add auth middleware for production)
- Some commands require `sudo` (runs with current process permissions)
- Ensure proper firewall rules to restrict access
- Consider running in a containerized environment with limited privileges
- API has no rate limiting or input validation (add for production)

## Troubleshooting

### API returns 500 errors
- Check that the backend process is running: `curl http://localhost:4500/api/health`
- Review backend logs for command execution errors
- Some endpoints require sudo (e.g., firewall, ufw)

### Frontend can't reach backend
- Ensure backend is running on port 4500
- Check CORS is enabled (it is by default in the Express app)
- Verify firewall allows localhost:4500

### Missing data in some sections
- Some features (firewall, SSH logs, cron) may need elevated permissions
- Run backend with: `sudo npm start` (for full functionality)

### Charts not showing in Monitoring
- Requires 12+ seconds to collect data points
- Wait ~1 minute for a full history
- Check browser console for JavaScript errors

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Database management UI (MySQL, PostgreSQL, MongoDB)
- [ ] Container/Docker management
- [ ] Backup & restore functionality
- [ ] Email/webhook alerts
- [ ] Historical analytics and reporting
- [ ] Custom dashboard widgets
- [ ] API rate limiting and security hardening

## License

ISC

## Contributing

Contributions welcome! Please ensure:
- Code follows existing style
- New features include error handling
- API endpoints are documented
- Frontend is responsive

---

**Questions or issues?** Check the TODO.MD for planned features or create an issue.

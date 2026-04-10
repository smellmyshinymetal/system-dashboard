(function() {
    'use strict';

    const CONFIG = {
        refreshRate: 2000,
        chartPoints: 20,
        maxTokens: 128000
    };

    const state = {
        sessionStart: Date.now(),
        tokenCount: 0,
        charts: {},
        terminalMessages: [
            'Initializing neural networks...',
            'Connecting to OpenClaw Gateway...',
            'Loading system metrics...',
            'Syncing with agent cluster...',
            'All systems operational',
            'Monitoring active agents...',
            'Collecting performance data...',
            'Optimizing resource allocation...',
            'Scanning for updates...',
            'JARVIS online and ready'
        ],
        currentMessage: 0
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    const formatNumber = (num) => new Intl.NumberFormat().format(num);

    function initCharts() {
        const ctx = document.getElementById('usageChart').getContext('2d');
        const tokenCtx = document.getElementById('tokenChart').getContext('2d');
        const networkCtx = document.getElementById('networkChart').getContext('2d');

        state.charts.usage = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(CONFIG.chartPoints).fill(''),
                datasets: [
                    {
                        label: 'CPU',
                        data: Array(CONFIG.chartPoints).fill(0),
                        borderColor: '#00f5ff',
                        backgroundColor: 'rgba(0, 245, 255, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0
                    },
                    {
                        label: 'Memory',
                        data: Array(CONFIG.chartPoints).fill(0),
                        borderColor: '#bc13fe',
                        backgroundColor: 'rgba(188, 19, 254, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#a0a0b8',
                            font: { family: 'JetBrains Mono', size: 11 }
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: {
                        min: 0, max: 100,
                        ticks: { color: '#606070', font: { family: 'JetBrains Mono', size: 10 } },
                        grid: { color: 'rgba(255, 255, 255, 0.03)' }
                    }
                },
                animation: { duration: 500 }
            }
        });

        state.charts.tokens = new Chart(tokenCtx, {
            type: 'doughnut',
            data: {
                labels: ['Used', 'Remaining'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['#bc13fe', 'rgba(188, 19, 254, 0.1)'],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });

        state.charts.network = new Chart(networkCtx, {
            type: 'bar',
            data: {
                labels: Array(10).fill(''),
                datasets: [{
                    data: Array(10).fill(0),
                    backgroundColor: '#00f5ff',
                    borderRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } },
                animation: { duration: 300 }
            }
        });
    }

    function updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' });

        document.getElementById('digital-clock').textContent = timeStr;
        document.getElementById('date-display').textContent = dateStr;

        const sessionUptime = Date.now() - state.sessionStart;
        document.getElementById('session-uptime').textContent = formatDuration(sessionUptime);
        document.getElementById('footer-uptime').textContent = `Session: ${formatDuration(sessionUptime)}`;
    }

    function updateSystemResources() {
        const cpuBase = 15;
        const cpuVariation = Math.random() * 30;
        const cpuSpike = Math.random() > 0.9 ? Math.random() * 20 : 0;
        const cpuUsage = Math.min(100, Math.floor(cpuBase + cpuVariation + cpuSpike));

        const ramBase = 40;
        const ramVariation = Math.random() * 15;
        const ramUsage = Math.floor(ramBase + ramVariation);
        const diskUsage = 67;

        document.getElementById('cpu-value').textContent = cpuUsage + '%';
        document.getElementById('cpu-bar').style.width = cpuUsage + '%';
        document.getElementById('cpu-cores').textContent = 'Cores: 8';
        document.getElementById('cpu-model').textContent = 'AMD Ryzen 7';

        const totalRAM = 32;
        const usedRAM = Math.floor((ramUsage / 100) * totalRAM);
        document.getElementById('ram-value').textContent = ramUsage + '%';
        document.getElementById('ram-bar').style.width = ramUsage + '%';
        document.getElementById('ram-used').textContent = `Used: ${usedRAM} GB`;
        document.getElementById('ram-total').textContent = `Total: ${totalRAM} GB`;

        document.getElementById('disk-value').textContent = diskUsage + '%';
        document.getElementById('disk-bar').style.width = diskUsage + '%';
        document.getElementById('disk-free').textContent = `Free: 356 GB`;
        document.getElementById('disk-total').textContent = `Total: 1 TB`;

        updateProgressBarColor('cpu-bar', cpuUsage);
        updateProgressBarColor('ram-bar', ramUsage);
        updateProgressBarColor('disk-bar', diskUsage);

        updateChartData('usage', 0, cpuUsage);
        updateChartData('usage', 1, ramUsage);

        const hours = Math.floor((Date.now() - state.sessionStart) / 3600000);
        document.getElementById('uptime-hours').textContent = hours + 'h';
    }

    function updateProgressBarColor(elementId, value) {
        const element = document.getElementById(elementId);
        element.classList.remove('warning', 'danger');
        if (value > 90) element.classList.add('danger');
        else if (value > 70) element.classList.add('warning');
    }

    function updateChartData(chartName, datasetIndex, value) {
        const chart = state.charts[chartName];
        if (!chart) return;
        const data = chart.data.datasets[datasetIndex].data;
        data.shift();
        data.push(value);
        chart.update('none');
    }

    function updateAgentStatus() {
        const agents = [
            { name: 'main', status: 'active', runtime: '2h 15m' },
            { name: 'coding-agent', status: 'idle', runtime: '45m' },
            { name: 'discord-bot', status: 'active', runtime: '12h 30m' },
            { name: 'whisper', status: 'idle', runtime: '5m' }
        ];

        const activeCount = agents.filter(a => a.status === 'active').length;
        document.getElementById('active-agents').textContent = activeCount;
        document.getElementById('total-agents').textContent = agents.length;

        const agentList = document.getElementById('agent-list');
        agentList.innerHTML = '';
        agents.forEach(agent => {
            const item = document.createElement('div');
            item.className = 'agent-item';
            item.innerHTML = `<span class="agent-name">${agent.name}</span><span class="agent-status ${agent.status}">${agent.status}</span>`;
            agentList.appendChild(item);
        });
    }

    function updateAIModel() {
        state.tokenCount += Math.floor(Math.random() * 500);
        const tokensUsed = Math.min(state.tokenCount, CONFIG.maxTokens);
        const tokenPercent = Math.floor((tokensUsed / CONFIG.maxTokens) * 100);

        document.getElementById('tokens-used').textContent = formatNumber(tokensUsed);
        document.getElementById('response-time').textContent = Math.floor(Math.random() * 800 + 200) + 'ms';

        state.charts.tokens.data.datasets[0].data = [tokenPercent, 100 - tokenPercent];
        state.charts.tokens.update();
    }

    function updateSystemInfo() {
        document.getElementById('os-info').textContent = 'Windows 11';
        document.getElementById('arch-info').textContent = 'x64';
        document.getElementById('node-info').textContent = 'v25.7.0';
        document.getElementById('shell-info').textContent = 'PowerShell';
        document.getElementById('hostname-info').textContent = 'SpencerPc';
    }

    function updateNetwork() {
        const latency = Math.floor(Math.random() * 50 + 20);
        const isOnline = navigator.onLine;

        document.getElementById('latency').textContent = latency + ' ms';
        document.getElementById('connection-type').textContent = 'WiFi';

        const statusDot = document.getElementById('network-status-dot');
        const statusText = document.getElementById('network-status-text');

        if (isOnline) {
            statusDot.classList.remove('offline');
            statusText.textContent = 'Connected';
            statusText.style.color = 'var(--neon-green)';
        } else {
            statusDot.classList.add('offline');
            statusText.textContent = 'Disconnected';
            statusText.style.color = '#ff006e';
        }

        updateChartData('network', 0, latency);
    }

    function updateTerminal() {
        const terminal = document.getElementById('terminal-text');
        const message = state.terminalMessages[state.currentMessage];
        let i = 0;
        terminal.textContent = '';
        
        const typeChar = () => {
            if (i < message.length) {
                terminal.textContent += message.charAt(i);
                i++;
                setTimeout(typeChar, 30);
            } else {
                setTimeout(() => {
                    state.currentMessage = (state.currentMessage + 1) % state.terminalMessages.length;
                    updateTerminal();
                }, 3000);
            }
        };
        typeChar();
    }

    function update() {
        updateClock();
        updateSystemResources();
        updateAgentStatus();
        updateAIModel();
        updateSystemInfo();
        updateNetwork();
    }

    function init() {
        initCharts();
        update();
        setInterval(update, CONFIG.refreshRate);
        setTimeout(updateTerminal, 1000);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
        window.addEventListener('online', updateNetwork);
        window.addEventListener('offline', updateNetwork);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

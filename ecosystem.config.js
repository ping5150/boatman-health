{
  "apps": [
    {
      "name": "boatman-health",
      "cwd": "/www/boatman-health/server",
      "script": "dist/app.js",
      "instances": 1,
      "exec_mode": "fork",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000
      },
      "error_file": "/www/logs/boatman-health/prod-error.log",
      "out_file": "/www/logs/boatman-health/prod-out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss",
      "merge_logs": true,
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "500M"
    }
  ]
}

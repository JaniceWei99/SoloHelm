# SoloHelm 部署指南

> 本文档覆盖从本地开发到生产环境的所有部署方式。

---

## 目录

1. [环境要求](#环境要求)
2. [环境变量](#环境变量)
3. [本地开发](#本地开发)
4. [Docker 部署](#docker-部署)
5. [Docker Compose](#docker-compose)
6. [Kubernetes 部署 (Helm)](#kubernetes-部署-helm)
7. [裸机 / 云主机部署](#裸机--云主机部署)
8. [数据备份与恢复](#数据备份与恢复)
9. [常见问题排查](#常见问题排查)

---

## 环境要求

| 部署方式 | 依赖 |
|----------|------|
| 本地开发 | Node.js >= 16 |
| Docker | Docker >= 20.10 |
| Kubernetes | kubectl + Helm 3 |
| 裸机生产 | Node.js >= 16, PM2 或 systemd, Nginx (可选) |

---

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | 服务监听端口 |
| `NODE_ENV` | — | 设为 `production` 关闭调试信息、启用缓存 |

数据库路径固定为 `<项目根>/data/board.db`（Docker 中为 `/app/data/board.db`），通过挂载 volume 实现持久化。

---

## 本地开发

```bash
git clone https://github.com/JaniceWei99/OPC-ProjectManagement.git
cd OPC-ProjectManagement
npm install
npm start
```

打开 http://localhost:3000 即可使用。首次启动会自动创建数据库并注入演示数据。

```bash
# 自定义端口
PORT=8080 npm start
```

> 修改前端文件后刷新浏览器即可；修改 `server.js` 后需重启 Node 进程。

---

## Docker 部署

### Dockerfile 概要

- **基础镜像**: `node:20-alpine` (多阶段构建)
- **安全**: 非 root 用户 `solohelm` 运行
- **健康检查**: 每 30s 请求 `/api/tasks`
- **数据卷**: `/app/data` (SQLite 持久化)

### 构建 & 运行

```bash
# 构建镜像
docker build -t solohelm:latest .

# 运行（数据持久化到 Docker volume）
docker run -d \
  --name solohelm \
  -p 3000:3000 \
  -v solohelm-data:/app/data \
  solohelm:latest
```

打开 http://localhost:3000 即可使用。

### 自定义端口

```bash
docker run -d \
  --name solohelm \
  -p 8080:8080 \
  -e PORT=8080 \
  -v solohelm-data:/app/data \
  solohelm:latest
```

### 推送到镜像仓库

Helm / Kubernetes 部署前需要先将镜像推到集群可访问的 registry。

```bash
# Docker Hub
docker tag solohelm:latest <your-dockerhub-user>/solohelm:latest
docker push <your-dockerhub-user>/solohelm:latest

# GitHub Container Registry (GHCR)
docker tag solohelm:latest ghcr.io/<your-github-user>/solohelm:latest
docker push ghcr.io/<your-github-user>/solohelm:latest
```

推送后在 `helm/solohelm/values.yaml` 中配置 `image.repository` 即可。

### 常用运维命令

```bash
docker logs -f solohelm          # 查看日志
docker stop solohelm             # 停止
docker start solohelm            # 启动
docker restart solohelm          # 重启
docker rm -f solohelm            # 删除容器（volume 数据不会丢失）

# 更新镜像并重启
docker build -t solohelm:latest . && docker rm -f solohelm
docker run -d --name solohelm -p 3000:3000 -v solohelm-data:/app/data solohelm:latest
```

---

## Docker Compose

```yaml
# docker-compose.yml
version: "3.8"
services:
  solohelm:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - solohelm-data:/app/data
    restart: unless-stopped

volumes:
  solohelm-data:
```

```bash
docker compose up -d        # 启动
docker compose logs -f      # 查看日志
docker compose down         # 停止（volume 保留）
```

---

## Kubernetes 部署 (Helm)

项目自带 Helm Chart (`helm/solohelm/`)，Chart 版本 `0.1.0`，应用版本 `1.0.0`。

### 快速部署

```bash
# 验证 Chart
helm lint ./helm/solohelm
helm template test-release ./helm/solohelm

# 安装
helm install solohelm ./helm/solohelm

# 查看状态
kubectl get pods -l app.kubernetes.io/name=solohelm

# 端口转发访问
kubectl port-forward svc/solohelm 3000:80
```

### 自定义配置

```bash
# 使用 Ingress 暴露服务
helm install solohelm ./helm/solohelm \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=solohelm.example.com \
  --set ingress.hosts[0].paths[0].path=/ \
  --set ingress.hosts[0].paths[0].pathType=Prefix

# 自定义存储大小
helm install solohelm ./helm/solohelm \
  --set persistence.size=5Gi

# 禁用持久化（仅测试）
helm install solohelm ./helm/solohelm \
  --set persistence.enabled=false

# 注入环境变量
helm install solohelm ./helm/solohelm \
  --set env.PORT=8080 \
  --set env.NODE_ENV=production
```

### values.yaml 关键配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `replicaCount` | `1` | 副本数（SQLite 不支持并发写入，生产环境保持 1） |
| `image.repository` | `solohelm` | 镜像地址（部署前需推送到集群可访问的 registry） |
| `image.tag` | `""` (= appVersion) | 镜像标签 |
| `service.type` | `ClusterIP` | Service 类型 |
| `service.port` | `80` | Service 端口 |
| `service.targetPort` | `3000` | 容器端口 |
| `ingress.enabled` | `false` | 是否启用 Ingress |
| `persistence.enabled` | `true` | 是否启用 PVC |
| `persistence.size` | `1Gi` | PVC 大小 |
| `autoscaling.enabled` | `false` | 是否启用 HPA |
| `resources.requests.cpu` | `50m` | CPU 请求 |
| `resources.requests.memory` | `64Mi` | 内存请求 |
| `resources.limits.cpu` | `200m` | CPU 限制 |
| `resources.limits.memory` | `256Mi` | 内存限制 |
| `env` | `{}` | 注入容器的环境变量 |

### Helm Chart 特性

| 特性 | 说明 |
|------|------|
| PersistentVolumeClaim | 默认 1Gi，SQLite 数据持久化 |
| Health Check | liveness (`/api/tasks`, 30s) + readiness (`/api/tasks`, 10s) 探针 |
| SecurityContext | 非 root (UID 1000)，drop ALL capabilities |
| Ingress | 可选，支持 TLS + cert-manager |
| HPA | 可选，CPU 自动扩缩（仅只读场景） |
| ServiceAccount | 自动创建 |

> **注意**：SQLite 不支持并发写入，HPA 扩缩仅适用于只读场景。生产环境建议 `replicaCount: 1`。

### 升级 / 回滚 / 卸载

```bash
helm upgrade solohelm ./helm/solohelm                    # 升级
helm upgrade solohelm ./helm/solohelm --set image.tag=v1.1.0  # 升级并修改镜像
helm history solohelm                                    # 查看历史
helm rollback solohelm                                   # 回滚到上一版本
helm rollback solohelm 2                                 # 回滚到指定版本
helm uninstall solohelm                                  # 卸载（PVC 默认保留）
```

---

## 裸机 / 云主机部署

适用于直接在 Linux 服务器上运行，建议使用进程管理器 + 反向代理。

### 方式一：PM2 进程管理

```bash
# 安装
npm install -g pm2

# 启动
pm2 start server.js --name solohelm

# 开机自启
pm2 startup
pm2 save

# 常用命令
pm2 status              # 查看状态
pm2 logs solohelm       # 查看日志
pm2 restart solohelm    # 重启
pm2 stop solohelm       # 停止
```

### 方式二：systemd 服务

创建 `/etc/systemd/system/solohelm.service`：

```ini
[Unit]
Description=SoloHelm Task Board
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/solohelm
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable solohelm
sudo systemctl start solohelm
sudo systemctl status solohelm
```

### Nginx 反向代理 + HTTPS

```nginx
server {
    listen 80;
    server_name solohelm.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name solohelm.example.com;

    ssl_certificate     /etc/letsencrypt/live/solohelm.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/solohelm.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

使用 [Certbot](https://certbot.eff.org/) 获取免费 Let's Encrypt 证书：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d solohelm.example.com
```

---

## 数据备份与恢复

```bash
# 备份数据库文件
cp data/board.db data/board-backup-$(date +%Y%m%d).db

# 通过 API 导出为 JSON
curl http://localhost:3000/api/export > tasks-backup.json

# 通过 API 导入 JSON
curl -X POST http://localhost:3000/api/import \
  -H 'Content-Type: application/json' \
  -d @tasks-backup.json
```

> 建议定期备份 `data/board.db` 或通过 `/api/export` 导出 JSON。Docker 部署时确保挂载了 volume。

---

## 常见问题排查

### 端口被占用

```
Error: listen EADDRINUSE: address already in use :::3000
```

```bash
lsof -i :3000           # 查找占用进程
PORT=3001 npm start     # 使用其他端口
```

### 数据库锁定 / 损坏

```bash
cp data/board.db data/board.db.bak     # 备份
rm data/board.db                        # 删除后重启会自动创建新库
npm start

# 恢复数据
curl -X POST http://localhost:3000/api/import \
  -H 'Content-Type: application/json' \
  -d @tasks-backup.json
```

### Docker 容器内数据丢失

确保使用了 volume 挂载：

```bash
# 错误 — 容器删除后数据丢失
docker run -d -p 3000:3000 solohelm:latest

# 正确 — 数据持久化到 volume
docker run -d -p 3000:3000 -v solohelm-data:/app/data solohelm:latest
```

### Helm 部署后无法访问

```bash
kubectl get pods -l app.kubernetes.io/name=solohelm   # 检查 Pod 状态
kubectl describe pod <pod-name>                        # 查看事件
kubectl logs <pod-name>                                # 查看日志
kubectl port-forward svc/solohelm 3000:80              # 临时端口转发
```

### npm install 失败

```bash
rm -rf node_modules package-lock.json
npm install

# 网络问题可使用镜像源
npm install --registry=https://registry.npmmirror.com
```

### 页面白屏 / 静态资源 404

- 确认 `public/` 目录下文件完整（index.html、app.js、style.css、sw.js、manifest.json）
- 确认从项目根目录启动 `node server.js`
- 清除浏览器缓存和 Service Worker（DevTools → Application → Service Workers → Unregister）

# Руководство по установке SberLab Hub

Подробная пошаговая инструкция по установке и настройке проекта для различных окружений.

---

## Содержание

- [Системные требования](#системные-требования)
- [Установка зависимостей](#установка-зависимостей)
- [Быстрый старт (Development)](#быстрый-старт-development)
- [Production установка](#production-установка)
- [Конфигурация](#конфигурация)
- [Troubleshooting](#troubleshooting)

---

## Системные требования

### Минимальные требования

| Компонент | Минимум | Рекомендуется |
|-----------|---------|---------------|
| **CPU** | 2 ядра | 4+ ядер |
| **RAM** | 4 GB | 8+ GB |
| **Диск** | 10 GB свободно | 20+ GB SSD |
| **ОС** | Linux/macOS/Windows | Linux |

### Требуемое ПО

| Софт | Версия | Обязательно |
|------|--------|-------------|
| **Docker** | 24+ | ✅ Да |
| **Docker Compose** | 2.20+ | ✅ Да |
| **Java** | 25 | ✅ Да |
| **Maven** | 3.9+ | ✅ Да (или используйте ./mvnw) |
| **Node.js** | 18+ | ✅ Да |
| **npm** | 9+ | ✅ Да |
| **Git** | 2.30+ | ✅ Да |

---

## Установка зависимостей

### 1. Docker и Docker Compose

#### Linux (Ubuntu/Debian)
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавить пользователя в группу docker
sudo usermod -aG docker $USER

# Перелогиниться для применения изменений
newgrp docker

# Проверка
docker --version
docker compose version
```

#### macOS
```bash
# Установка через Homebrew
brew install --cask docker

# Или скачать Docker Desktop:
# https://www.docker.com/products/docker-desktop

# Проверка
docker --version
docker compose version
```

#### Windows
1. Скачать [Docker Desktop для Windows](https://www.docker.com/products/docker-desktop)
2. Установить с WSL 2 backend
3. Перезагрузить компьютер
4. Запустить Docker Desktop

### 2. Java 25

#### Через SDKMAN (рекомендуется)
```bash
# Установка SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Установка Java 25
sdk install java 25-open

# Проверка
java --version
# Должно быть: openjdk 25 или выше
```

#### Альтернатива: Вручную
- **Linux:** [AdoptOpenJDK](https://adoptium.net/)
- **macOS:** `brew install openjdk@25`
- **Windows:** [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)

**⚠️ ВАЖНО:** Проект использует preview features Java 25!

### 3. Maven

Maven обычно идет с Java, но можно установить отдельно:

```bash
# Linux/macOS
sdk install maven

# Или использовать встроенный Maven Wrapper
./mvnw --version
```

### 4. Node.js и npm

#### Через NVM (рекомендуется)
```bash
# Установка NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Перезагрузить терминал
source ~/.bashrc  # или ~/.zshrc

# Установка Node.js 18
nvm install 18
nvm use 18

# Проверка
node --version
npm --version
```

#### Альтернатива
- **Linux:** `sudo apt install nodejs npm`
- **macOS:** `brew install node`
- **Windows:** [Официальный установщик](https://nodejs.org/)

---

## Быстрый старт (Development)

### Шаг 1: Клонирование репозитория

```bash
git clone <repository-url>
cd sberlab-hub
```

### Шаг 2: Запуск инфраструктуры

```bash
cd infra
docker compose up -d
```

**Проверка запуска:**
```bash
docker compose ps
```

Вы должны увидеть:
```
NAME                IMAGE                    STATUS
sberlab-postgres    pgvector/pgvector:pg16   Up
sberlab-redis       redis:7-alpine           Up
```

**Логи (если что-то не работает):**
```bash
docker compose logs postgres
docker compose logs redis
```

### Шаг 3: Настройка Backend

```bash
cd ../backend
```

#### Создание .env файла

```bash
# Копировать пример (если есть)
cp .env.example .env

# Или создать вручную
cat > .env <<EOF
# Database
DB_URL=jdbc:postgresql://localhost:5432/sberlab
DB_USER=sberlab
DB_PASS=sberlab

# Auth
DEV_AUTH=true
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
GOOGLE_CLIENT_ID=

# CORS
CORS_ORIGINS=http://localhost:5173

# GigaChat API (опционально для семантического поиска)
GIGACHAT_AUTH_KEY=your_base64_key_here
GIGACHAT_VERIFY_SSL=false

# Redis
REDIS_URL=redis://localhost:6379
EOF
```

#### Первая компиляция

```bash
./mvnw clean compile
```

**Ожидаемое время:** 1-3 минуты (скачивание зависимостей)

#### Запуск в Dev режиме

```bash
./mvnw quarkus:dev
```

**Успешный запуск:**
```
__  ____  __  _____   ___  __ ____  ______
 --/ __ \/ / / / _ | / _ \/ //_/ / / / __/
 -/ /_/ / /_/ / __ |/ , _/ ,< / /_/ /\ \
--\___\_\____/_/ |_/_/|_/_/|_|\____/___/

INFO  [io.quarkus] (Quarkus Main Thread) sberlab-hub-backend 1.0.0-SNAPSHOT on JVM (powered by Quarkus 3.31.1) started in 2.345s.
INFO  [io.quarkus] (Quarkus Main Thread) Profile dev activated. Live Coding activated.
INFO  [io.quarkus] (Quarkus Main Thread) Installed features: [agroal, cdi, flyway, hibernate-orm, hibernate-orm-panache, jdbc-postgresql, narayana-jta, redis-cache, redis-client, rest, rest-client, rest-jackson, smallrye-context-propagation, smallrye-jwt, smallrye-jwt-build, smallrye-openapi, swagger-ui, vertx]
```

**Endpoints:**
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/q/swagger-ui
- Dev UI: http://localhost:8080/q/dev/

### Шаг 4: Настройка Frontend

```bash
cd ../frontend
```

#### Установка зависимостей

```bash
npm install
```

**Ожидаемое время:** 30-60 секунд

#### Создание .env файла

```bash
# Копировать пример (если есть)
cp .env.example .env

# Или создать вручную
cat > .env <<EOF
# Backend URL (пустое = использовать Vite proxy)
VITE_API_URL=

# Google OAuth (опционально)
VITE_GOOGLE_CLIENT_ID=

# Dev Auth
VITE_DEV_AUTH=true
EOF
```

#### Запуск Dev сервера

```bash
npm run dev
```

**Успешный запуск:**
```
  VITE v5.4.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Шаг 5: Открыть приложение

Откройте браузер: **http://localhost:5173**

#### Тестовый вход

1. На странице логина введите:
   - Email: `admin@example.com`
   - Role: `ADMIN`
2. Нажмите "Войти"

**Готово!** Вы в системе как администратор.

---

## Production установка

### Опция 1: Docker Compose (рекомендуется)

#### 1. Создать production docker-compose.yml

```yaml
version: "3.9"

services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: sberlab-postgres-prod
    restart: always
    environment:
      POSTGRES_DB: sberlab
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: sberlab-redis-prod
    restart: always
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redisdata:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: src/main/docker/Dockerfile.jvm
    container_name: sberlab-backend-prod
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      DB_URL: jdbc:postgresql://postgres:5432/sberlab
      DB_USER: ${DB_USER}
      DB_PASS: ${DB_PASS}
      DEV_AUTH: false
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      REDIS_URL: redis://redis:6379
      GIGACHAT_AUTH_KEY: ${GIGACHAT_AUTH_KEY}
    ports:
      - "8080:8080"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: https://api.yourdomain.com
        VITE_GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
        VITE_DEV_AUTH: false
    container_name: sberlab-frontend-prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro

volumes:
  pgdata:
  redisdata:
```

#### 2. Создать .env для production

```bash
cat > .env <<EOF
DB_USER=sberlab_prod
DB_PASS=$(openssl rand -base64 32)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GIGACHAT_AUTH_KEY=your_gigachat_key
EOF
```

#### 3. Запустить

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Опция 2: Kubernetes

_(Здесь можно добавить K8s манифесты, если планируется поддержка)_

---

## Конфигурация

### Backend Environment Variables

| Переменная | Значение по умолчанию | Описание | Production |
|------------|----------------------|----------|------------|
| `DB_URL` | jdbc:postgresql://localhost:5432/sberlab | JDBC URL базы данных | Изменить host |
| `DB_USER` | sberlab | Пользователь БД | **Изменить!** |
| `DB_PASS` | sberlab | Пароль БД | **Изменить!** |
| `DEV_AUTH` | true | Dev режим логина | **false** |
| `ADMIN_BOOTSTRAP_EMAIL` | admin@example.com | Email первого админа | Ваш email |
| `GOOGLE_CLIENT_ID` | (пусто) | Google OAuth Client ID | **Обязательно!** |
| `CORS_ORIGINS` | http://localhost:5173 | Разрешенные CORS origins | Ваш домен |
| `GIGACHAT_AUTH_KEY` | (пусто) | GigaChat API ключ | Опционально |
| `GIGACHAT_VERIFY_SSL` | false | Проверка SSL для GigaChat | **true** |
| `REDIS_URL` | redis://localhost:6379 | Redis connection URL | Изменить host |

### Frontend Environment Variables

| Переменная | Значение по умолчанию | Описание | Production |
|------------|----------------------|----------|------------|
| `VITE_API_URL` | (пусто) | Backend URL | https://api.yourdomain.com |
| `VITE_GOOGLE_CLIENT_ID` | (пусто) | Google OAuth Client ID | **Обязательно!** |
| `VITE_DEV_AUTH` | true | Показывать dev login | **false** |

### Google OAuth настройка

#### 1. Создать проект в Google Cloud Console

1. Перейти: https://console.cloud.google.com/
2. Создать новый проект "SberLab Hub"
3. Включить "Google+ API"

#### 2. Создать OAuth 2.0 Client ID

1. Перейти: APIs & Services → Credentials
2. Create Credentials → OAuth client ID
3. Application type: Web application
4. Authorized JavaScript origins:
   - `http://localhost:5173` (dev)
   - `https://yourdomain.com` (production)
5. Authorized redirect URIs:
   - `http://localhost:5173` (dev)
   - `https://yourdomain.com` (production)

#### 3. Скопировать Client ID

Формат: `123456789-abcdefg.apps.googleusercontent.com`

Добавить в:
- `backend/.env` → `GOOGLE_CLIENT_ID`
- `frontend/.env` → `VITE_GOOGLE_CLIENT_ID`

### GigaChat API настройка

#### 1. Получить API ключ

1. Регистрация: https://developers.sber.ru/
2. Создать приложение
3. Получить Client ID и Client Secret

#### 2. Создать Base64 ключ

```bash
echo -n "client_id:client_secret" | base64
```

#### 3. Добавить в backend/.env

```bash
GIGACHAT_AUTH_KEY=<base64_строка>
```

---

## Troubleshooting

### Backend не запускается

#### Ошибка: "Port 8080 already in use"

**Проблема:** Порт занят другим процессом

**Решение:**
```bash
# Linux/macOS
lsof -i :8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

#### Ошибка: "Connection refused to PostgreSQL"

**Проблема:** PostgreSQL не запущен

**Решение:**
```bash
cd infra
docker compose ps
# Если postgres не запущен:
docker compose up -d postgres

# Проверка логов
docker compose logs postgres
```

#### Ошибка: "Preview features not enabled"

**Проблема:** Не включены preview features Java 25

**Решение:**
```bash
# Проверить версию Java
java --version

# Должна быть 25+

# Если запускаете из IDE, добавить VM options:
--enable-preview --add-modules jdk.incubator.vector
```

### Frontend не запускается

#### Ошибка: "npm ERR! peer dep missing"

**Проблема:** Конфликт версий зависимостей

**Решение:**
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Ошибка: "Failed to fetch dynamically imported module"

**Проблема:** Устаревший кеш браузера

**Решение:**
- Ctrl+Shift+R (hard refresh)
- Или:
```bash
npm run build
rm -rf dist
npm run dev
```

### Docker проблемы

#### Контейнер постоянно перезапускается

**Проблема:** Ошибка в логах

**Решение:**
```bash
docker compose logs <service_name>
# Например:
docker compose logs postgres
```

#### Ошибка: "no space left on device"

**Проблема:** Закончилось место на диске

**Решение:**
```bash
# Удалить неиспользуемые образы
docker system prune -a

# Проверить использование
docker system df
```

### Redis проблемы

#### Backend не может подключиться к Redis

**Проблема:** Redis не запущен или неправильный URL

**Решение:**
```bash
# Проверить, что Redis запущен
docker compose ps redis

# Проверить логи
docker compose logs redis

# Тест подключения
docker exec -it sberlab-redis redis-cli ping
# Должно вернуть: PONG
```

#### Кеш не работает

**Проблема:** Redis работает, но кеш не сохраняется

**Решение:**
```bash
# Проверить конфигурацию в application.properties
grep redis backend/src/main/resources/application.properties

# Проверить ключи в Redis
docker exec -it sberlab-redis redis-cli
127.0.0.1:6379> KEYS sberlab:*
```

### Database проблемы

#### Flyway migration failed

**Проблема:** Ошибка в миграции

**Решение:**
```bash
# Проверить логи Quarkus
# Если миграция провалилась, нужно откатить:

# 1. Подключиться к БД
docker exec -it sberlab-postgres psql -U sberlab

# 2. Проверить статус миграций
\c sberlab
SELECT * FROM flyway_schema_history;

# 3. Удалить последнюю запись (ТОЛЬКО для dev!)
DELETE FROM flyway_schema_history WHERE version = 'X';

# 4. Перезапустить backend
```

#### База данных заполнена старыми данными

**Проблема:** Нужен reset БД

**Решение (ТОЛЬКО для dev!):**
```bash
cd infra
docker compose down -v  # -v удаляет volumes
docker compose up -d
cd ../backend
./mvnw quarkus:dev  # Flyway заново создаст схему
```

---

## Проверка установки

### Checklist

- [ ] Docker и Docker Compose установлены
- [ ] Java 25 установлена (`java --version`)
- [ ] Node.js 18+ установлен (`node --version`)
- [ ] PostgreSQL контейнер запущен (`docker compose ps`)
- [ ] Redis контейнер запущен (`docker compose ps`)
- [ ] Backend запущен (http://localhost:8080/q/health)
- [ ] Frontend запущен (http://localhost:5173)
- [ ] Swagger UI доступен (http://localhost:8080/q/swagger-ui)
- [ ] Можно залогиниться в dev режиме
- [ ] Видны тестовые проекты в каталоге

### Команды проверки

```bash
# 1. Проверка Java
java --version
# Ожидается: openjdk 25

# 2. Проверка Docker
docker compose ps
# Ожидается: postgres и redis в статусе Up

# 3. Проверка Backend
curl http://localhost:8080/q/health
# Ожидается: {"status":"UP","checks":[...]}

# 4. Проверка Frontend
curl http://localhost:5173
# Ожидается: HTML код страницы

# 5. Проверка Redis
docker exec -it sberlab-redis redis-cli ping
# Ожидается: PONG

# 6. Проверка PostgreSQL
docker exec -it sberlab-postgres psql -U sberlab -c "SELECT version();"
# Ожидается: PostgreSQL 16.x
```

---

**Если проблемы не решаются**, создайте Issue в GitHub с:
1. Вашей ОС и версией
2. Полными логами ошибки
3. Выводом команд проверки

---

Документ актуален на: **Февраль 2026**

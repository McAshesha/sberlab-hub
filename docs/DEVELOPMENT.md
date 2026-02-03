# Руководство для разработчиков

Документ описывает процессы разработки, соглашения о коде, тестирование и debugging.

---

## Содержание

- [Настройка окружения разработки](#настройка-окружения-разработки)
- [Workflow разработки](#workflow-разработки)
- [Code Conventions](#code-conventions)
- [Тестирование](#тестирование)
- [Debugging](#debugging)
- [Git Flow](#git-flow)

---

## Настройка окружения разработки

### IDE Configuration

#### IntelliJ IDEA (рекомендуется для backend)

1. **Импорт проекта**
   - File → Open → Выбрать `backend/pom.xml`
   - Import as Maven project

2. **Настройка Java 25**
   - File → Project Structure → Project SDK → Java 25
   - Project language level → 25 (Preview)

3. **VM Options для запуска**
   - Run → Edit Configurations → Application
   - VM options: `--enable-preview --add-modules jdk.incubator.vector`

4. **Plugins**
   - Quarkus Tools (обязательно!)
   - Lombok (если будете использовать)
   - SonarLint (рекомендуется)

#### VS Code (для frontend)

1. **Расширения**
   - ESLint
   - Prettier
   - ES7+ React/Redux/React-Native snippets
   - Path Intellisense

2. **Настройки** (`.vscode/settings.json`)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "javascriptreact"],
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

---

## Workflow разработки

### Типичный день разработчика

```bash
# 1. Обновить код
git checkout main
git pull origin main

# 2. Создать feature branch
git checkout -b feature/new-awesome-feature

# 3. Запустить инфраструктуру
cd infra && docker compose up -d

# 4. Запустить backend в Dev Mode
cd ../backend
./mvnw quarkus:dev
# Dev mode дает:
# - Live reload при изменении кода
# - Dev UI: http://localhost:8080/q/dev/
# - Continuous testing (опционально)

# 5. Запустить frontend (в отдельном терминале)
cd frontend
npm run dev

# 6. Разработка с hot reload
# Backend: изменения применяются автоматически
# Frontend: Vite перезагружает страницу

# 7. Коммит изменений
git add .
git commit -m "Add awesome feature"

# 8. Push и создание PR
git push origin feature/new-awesome-feature
# Создать Pull Request на GitHub
```

### Quarkus Dev Mode features

**Continuous Testing:**
```bash
# В терминале с quarkus:dev нажать:
r  # Run tests
o  # Toggle test output
h  # Help
```

**Dev UI:**
- http://localhost:8080/q/dev/
- Config Editor — изменение application.properties
- Database — просмотр entities и запросы
- Cache — просмотр Redis кеша
- OpenAPI — просмотр API спецификации

---

## Code Conventions

### Backend (Java)

#### Naming

```java
// Классы: PascalCase
public class ProjectSearchService { }

// Методы: camelCase
public List<Project> findPublished() { }

// Константы: UPPER_SNAKE_CASE
private static final int MAX_RESULTS = 100;

// Переменные: camelCase
User currentUser = ...;

// Packages: lowercase
org.acme.service
```

#### Структура класса

```java
public class ExampleResource {
    // 1. Статические константы
    private static final Logger LOG = Logger.getLogger(...);

    // 2. Injected fields
    @Inject
    SomeService service;

    // 3. DTOs / Records
    public record CreateRequest(...) {}

    // 4. Public endpoints
    @GET
    @Path("/...")
    public Response list() { ... }

    // 5. Private helper methods
    private void helperMethod() { }
}
```

#### Аннотации

```java
// REST endpoints
@GET
@Path("/projects")
@RolesAllowed({"STUDENT", "TEACHER", "MENTOR", "ADMIN"})
@Transactional  // Если изменяет данные
public Response list() { }

// Validation
public record CreateRequest(
    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Max 500 characters")
    String title
) {}

// Caching
@CacheResult(cacheName = "project-details")
ProjectDto getCachedProjectDto(Long id) { }

@CacheInvalidate(cacheName = "project-details")
public Response update(@PathParam("id") Long id) { }
```

### Frontend (JavaScript)

#### Naming

```javascript
// Компоненты: PascalCase
function CatalogPage() { }

// Hooks: camelCase с префиксом 'use'
function useAuth() { }

// Константы: UPPER_SNAKE_CASE
const API_BASE_URL = '/api';

// Переменные/функции: camelCase
const handleSubmit = () => { };
```

#### Структура компонента

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Импорты
// ...

// 2. Константы
const MAX_ITEMS = 20;

// 3. Компонент
export default function ExamplePage() {
  // 4. Hooks
  const navigate = useNavigate();
  const { user } = useAuth();

  // 5. State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 6. Effects
  useEffect(() => {
    fetchData();
  }, []);

  // 7. Event handlers
  const handleSubmit = () => { };

  // 8. Render
  return (
    <div>...</div>
  );
}
```

#### Импорты

```javascript
// Группировка:
// 1. React
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. MUI
import { Box, Button } from '@mui/material';

// 3. Contexts/hooks
import { useAuth } from '../AuthContext';

// 4. API/utils
import api from '../api';

// 5. Локальные компоненты
import CustomDialog from '../components/CustomDialog';
```

---

## Тестирование

### Backend Testing

#### Unit тесты (JUnit 5)

```java
@QuarkusTest
class ProjectServiceTest {

    @Inject
    ProjectSearchService searchService;

    @Test
    void testSemanticSearch() {
        // Arrange
        String query = "machine learning";

        // Act
        List<Project> results = searchService.semanticSearch(query, 10);

        // Assert
        assertNotNull(results);
        assertTrue(results.size() <= 10);
    }
}
```

**Запуск:**
```bash
./mvnw test
# Или запустить один тест:
./mvnw test -Dtest=ProjectServiceTest#testSemanticSearch
```

#### REST Assured тесты

```java
@QuarkusTest
class ProjectResourceTest {

    @Test
    void testListProjects() {
        given()
            .header("Authorization", "Bearer " + getAdminToken())
        .when()
            .get("/api/projects")
        .then()
            .statusCode(200)
            .body("items.size()", greaterThan(0));
    }
}
```

### Frontend Testing

_(На данный момент тестов нет, но можно добавить)_

#### Рекомендации

**Библиотеки:**
- **Vitest** — test runner (быстрее Jest)
- **React Testing Library** — тестирование компонентов
- **MSW** — mock API requests

**Пример:**
```javascript
import { render, screen } from '@testing-library/react';
import CatalogPage from './CatalogPage';

test('renders catalog title', () => {
  render(<CatalogPage />);
  expect(screen.getByText('Каталог проектов')).toBeInTheDocument();
});
```

---

## Debugging

### Backend

#### IntelliJ IDEA Debugger

1. Поставить breakpoint (Ctrl+F8)
2. Run → Debug → Quarkus Dev
3. Или attach к запущенному процессу:
   - Port: 5005 (по умолчанию для quarkus:dev)

#### Логирование

```java
import org.jboss.logging.Logger;

private static final Logger LOG = Logger.getLogger(MyClass.class);

LOG.infof("Processing project ID: %d", projectId);
LOG.warn("Cache miss!");
LOG.errorf(exception, "Failed to fetch project %d", id);
```

**Уровни логирования** (application.properties):
```properties
quarkus.log.level=INFO
quarkus.log.category."org.acme".level=DEBUG
```

### Frontend

#### Browser DevTools

**Console:**
```javascript
console.log('User:', user);
console.error('API Error:', error);
console.table(projects);  // Таблица для массивов
```

**React DevTools:**
- Установить расширение для Chrome/Firefox
- Components tab → инспектировать state и props
- Profiler tab → профилирование производительности

**Network tab:**
- Проверка API запросов
- Посмотреть JWT токен в заголовках
- Проверить время отклика

#### Vite Source Maps

По умолчанию включены в dev режиме — можно ставить breakpoints в оригинальном коде.

---

## Git Flow

### Branch Naming

```
main              # Production-ready код
develop           # Development branch (опционально)

feature/<name>    # Новые фичи
bugfix/<name>     # Исправление багов
hotfix/<name>     # Срочные фиксы для production
refactor/<name>   # Рефакторинг
docs/<name>       # Документация
```

**Примеры:**
```
feature/semantic-search
feature/redis-cache
bugfix/login-redirect
hotfix/sql-injection
refactor/project-service
docs/installation-guide
```

### Commit Messages

**Формат:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` — новая фича
- `fix` — исправление бага
- `refactor` — рефакторинг
- `docs` — документация
- `style` — форматирование кода
- `test` — добавление тестов
- `chore` — обновление зависимостей, конфигов

**Примеры:**
```
feat(search): add semantic search with GigaChat

Implement semantic project search using GigaChat embeddings API
with Redis caching and RRF fusion.

Closes #42
```

```
fix(auth): redirect to login on 401

Previously stayed on same page after token expiration.
Now redirects to /login and clears localStorage.

Fixes #56
```

### Pull Request Process

1. **Создать PR** на GitHub
2. **Заполнить шаблон** (если есть):
   - Описание изменений
   - Related issues
   - Checklist (тесты, документация)
3. **Code Review** от минимум 1 разработчика
4. **CI Checks** (если настроены)
5. **Merge** в main/develop

**Перед merge:**
- [ ] Код прошел review
- [ ] Тесты зеленые
- [ ] Документация обновлена
- [ ] No merge conflicts

---

## Часто используемые команды

### Backend

```bash
# Компиляция
./mvnw compile

# Dev mode с live reload
./mvnw quarkus:dev

# Запуск тестов
./mvnw test

# Build JAR
./mvnw package

# Очистка
./mvnw clean

# Обновить зависимости
./mvnw versions:display-dependency-updates
```

### Frontend

```bash
# Установка зависимостей
npm install

# Dev сервер
npm run dev

# Build для production
npm run build

# Preview production build
npm run preview

# Линтинг (если настроен)
npm run lint
```

### Docker

```bash
# Запустить все сервисы
docker compose up -d

# Остановить
docker compose down

# Логи
docker compose logs -f <service>

# Перезапустить один сервис
docker compose restart postgres

# Удалить volumes (очистить БД)
docker compose down -v
```

### Database

```bash
# Подключиться к PostgreSQL
docker exec -it sberlab-postgres psql -U sberlab

# Внутри psql:
\l          # Список БД
\c sberlab  # Подключиться к БД
\dt         # Список таблиц
\d projects # Описание таблицы

# SQL запрос
SELECT COUNT(*) FROM projects;
```

### Redis

```bash
# Подключиться к Redis
docker exec -it sberlab-redis redis-cli

# Команды:
KEYS sberlab:*                     # Все ключи с префиксом
GET "sberlab:project-details:1"    # Получить значение
TTL "sberlab:query-embeddings:ml"  # TTL ключа
FLUSHDB                            # Очистить весь кеш
INFO stats                         # Статистика
```

---

## Best Practices

### Backend

1. **Всегда используйте @Transactional** для методов, изменяющих данные
2. **DTOs** — никогда не возвращайте entities напрямую в API
3. **Validation** — используйте Bean Validation аннотации
4. **Logging** — логируйте важные события (не debug spam)
5. **Exception handling** — не глотайте исключения без логирования
6. **Caching** — не забывайте инвалидировать кеш при изменениях

### Frontend

1. **Contexts** — разделяйте по доменам (Auth, Theme, Language)
2. **API errors** — всегда показывайте пользователю (snackbar)
3. **Loading states** — показывайте спиннеры для async операций
4. **Debounce** — для поисковых запросов (500ms)
5. **PropTypes** — документируйте props (опционально)
6. **Keys** — используйте стабильные ID для списков (не индексы)

---

Документ актуален на: **Февраль 2026**

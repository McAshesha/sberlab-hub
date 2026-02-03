# API Documentation

REST API документация для SberLab Hub.

**Base URL:** `http://localhost:8080/api`

**Swagger UI:** http://localhost:8080/q/swagger-ui

---

## Аутентификация

Все защищенные эндпоинты требуют JWT токен в заголовке:

```
Authorization: Bearer <jwt_token>
```

### POST `/api/auth/google`

Вход через Google OIDC.

**Request:**
```json
{
  "credential": "google_id_token_here"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

**Errors:**
- `403 Forbidden` — email не в allow list (для MENTOR/TEACHER/ADMIN)
- `400 Bad Request` — невалидный Google токен

---

### POST `/api/auth/dev-login`

Dev режим логина (только если `DEV_AUTH=true`).

**Request:**
```json
{
  "email": "test@example.com",
  "role": "STUDENT"
}
```

**Response:** То же, что `/api/auth/google`

---

### GET `/api/auth/me`

Получить текущего пользователя.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "STUDENT",
  "createdAt": "2026-02-01T10:00:00Z"
}
```

---

## Проекты

### GET `/api/projects`

Каталог проектов с поиском и фильтрами.

**Query Parameters:**
- `q` (string) — текстовый поиск (гибридный RRF)
- `page` (int, default: 0) — номер страницы
- `size` (int, default: 20) — размер страницы
- `difficulty` (enum) — `EASY`, `MEDIUM`, `HARD`
- `thesis` (boolean) — подходит для ВКР
- `practice` (boolean) — подходит для практики
- `coursework` (boolean) — подходит для курсовой
- `tags` (string) — фильтр по тегам (через запятую)
- `skills` (string) — фильтр по навыкам (через запятую)
- `mentorId` (long) — проекты конкретного ментора

**Example:**
```
GET /api/projects?q=machine learning&difficulty=MEDIUM&thesis=true&page=0&size=10
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "title": "ML для начинающих",
      "goal": "Изучить основы машинного обучения",
      "keyTasks": "1. Изучить Python\n2. Sklearn\n3. Keras",
      "tags": "ml,python,ai",
      "skills": "Python,NumPy",
      "difficulty": "MEDIUM",
      "status": "PUBLISHED",
      "thesisOk": true,
      "practiceOk": false,
      "courseworkOk": true,
      "mentor": {
        "id": 2,
        "name": "Ivan Petrov",
        "email": "mentor@example.com"
      },
      "createdAt": "2026-01-15T12:00:00Z"
    }
  ],
  "total": 42,
  "page": 0,
  "pageSize": 10
}
```

**Roles:** STUDENT, TEACHER, MENTOR, ADMIN

---

### GET `/api/projects/{id}`

Детали одного проекта.

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "ML для начинающих",
  "goal": "Изучить основы",
  "keyTasks": "...",
  "tags": "ml,python",
  "skills": "Python",
  "difficulty": "MEDIUM",
  "status": "PUBLISHED",
  "thesisOk": true,
  "practiceOk": false,
  "courseworkOk": true,
  "responsibilityBoundaries": "Студент работает самостоятельно",
  "contactPolicy": "Связь через Telegram",
  "mentor": {
    "id": 2,
    "name": "Ivan Petrov",
    "email": "mentor@example.com"
  },
  "createdAt": "2026-01-15T12:00:00Z"
}
```

**Errors:**
- `404 Not Found` — проект не существует
- `403 Forbidden` — неопубликованный проект, не ментор

**Roles:** STUDENT, TEACHER, MENTOR, ADMIN

---

### POST `/api/projects`

Создать новый проект.

**Request:**
```json
{
  "title": "Новый проект",
  "goal": "Цель проекта",
  "keyTasks": "1. Задача 1\n2. Задача 2",
  "tags": "java,quarkus",
  "skills": "Java,SQL",
  "difficulty": "HARD",
  "thesisOk": true,
  "practiceOk": false,
  "courseworkOk": true,
  "responsibilityBoundaries": "...",
  "contactPolicy": "Email"
}
```

**Response (201 Created):**
```json
{
  "id": 42,
  "status": "DRAFT",
  ...
}
```

**Roles:** MENTOR, ADMIN

---

### PUT `/api/projects/{id}`

Обновить проект.

**Request:** То же, что POST

**Response (200 OK):** Обновленный ProjectDto

**Roles:** MENTOR (только свой проект), ADMIN

---

### POST `/api/projects/{id}/publish`

Опубликовать проект (DRAFT → PUBLISHED).

**Response (200 OK):** ProjectDto со статусом PUBLISHED

**Roles:** MENTOR (только свой), ADMIN

---

### POST `/api/projects/{id}/archive`

Архивировать проект (любой статус → ARCHIVED).

**Response (200 OK):** ProjectDto со статусом ARCHIVED

**Roles:** MENTOR (только свой), ADMIN

---

## Заявки (Applications)

### POST `/api/projects/{id}/apply`

Подать заявку на проект.

**Request:**
```json
{
  "message": "Хочу участвовать в проекте, у меня есть опыт с Python..."
}
```

**Response (201 Created):**
```json
{
  "id": 10,
  "project": { "id": 1, "title": "..." },
  "student": { "id": 5, "name": "..." },
  "message": "Хочу участвовать...",
  "status": "PENDING",
  "createdAt": "2026-02-01T14:00:00Z"
}
```

**Errors:**
- `409 Conflict` — уже подана заявка на этот проект

**Roles:** STUDENT

---

### GET `/api/me/applications`

Список моих заявок (для студента).

**Response (200 OK):**
```json
[
  {
    "id": 10,
    "project": { "id": 1, "title": "ML проект" },
    "message": "...",
    "status": "PENDING",
    "createdAt": "2026-02-01T14:00:00Z"
  },
  {
    "id": 11,
    "project": { "id": 2, "title": "Web проект" },
    "status": "APPROVED",
    "createdAt": "2026-01-20T10:00:00Z"
  }
]
```

**Roles:** STUDENT

---

### GET `/api/projects/{id}/applications`

Список заявок на проект (для ментора).

**Response (200 OK):**
```json
[
  {
    "id": 10,
    "student": { "id": 5, "name": "John Doe", "email": "john@example.com" },
    "message": "Хочу участвовать...",
    "status": "PENDING",
    "createdAt": "2026-02-01T14:00:00Z"
  }
]
```

**Roles:** MENTOR (только свой проект), ADMIN

---

### POST `/api/applications/{id}/approve`

Одобрить заявку.

**Response (200 OK):** ApplicationDto со статусом APPROVED

**Roles:** MENTOR (только свой проект), ADMIN

---

### POST `/api/applications/{id}/reject`

Отклонить заявку.

**Response (200 OK):** ApplicationDto со статусом REJECTED

**Roles:** MENTOR (только свой проект), ADMIN

---

## Вопросы и ответы

### GET `/api/projects/{id}/questions`

Список вопросов по проекту.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "author": { "id": 5, "name": "John Doe" },
    "text": "Какие требования к опыту?",
    "visibility": "PUBLIC",
    "createdAt": "2026-02-01T10:00:00Z",
    "answer": {
      "id": 1,
      "responder": { "id": 2, "name": "Ivan Petrov" },
      "text": "Желателен опыт с Python",
      "createdAt": "2026-02-01T11:00:00Z"
    }
  },
  {
    "id": 2,
    "text": "Приватный вопрос",
    "visibility": "PRIVATE",
    "answer": null
  }
]
```

**Roles:** STUDENT, TEACHER, MENTOR, ADMIN
*(Приватные вопросы видны только автору, ментору проекта и админу)*

---

### POST `/api/projects/{id}/questions`

Задать вопрос.

**Request:**
```json
{
  "text": "Можно ли использовать Java вместо Python?",
  "visibility": "PUBLIC"
}
```

**Response (201 Created):** QuestionDto

**Roles:** STUDENT, TEACHER, MENTOR, ADMIN

---

### POST `/api/questions/{id}/answer`

Ответить на вопрос.

**Request:**
```json
{
  "text": "Да, можно использовать Java"
}
```

**Response (201 Created):** AnswerDto

**Errors:**
- `409 Conflict` — вопрос уже отвечен

**Roles:** MENTOR (только свой проект), ADMIN

---

## Обратная связь (Feedback)

### POST `/api/projects/{id}/feedback`

Дать обратную связь студенту.

**Request:**
```json
{
  "studentId": 5,
  "type": "INTERIM",
  "rating": 4,
  "comment": "Хорошая работа, но можно улучшить архитектуру"
}
```

**Response (201 Created):** FeedbackDto

**Roles:** MENTOR (только свой проект, только одобренным студентам), ADMIN

---

### GET `/api/projects/{id}/feedback`

Получить обратную связь по проекту.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "student": { "id": 5, "name": "John Doe" },
    "type": "INTERIM",
    "rating": 4,
    "comment": "Хорошая работа...",
    "createdAt": "2026-02-01T15:00:00Z"
  }
]
```

**Roles:**
- STUDENT — только своя обратная связь
- MENTOR (проект owner) — вся обратная связь
- ADMIN — вся обратная связь

---

## Админ API

### GET `/api/admin/users`

Список всех пользователей.

**Query Parameters:**
- `role` (enum) — фильтр по роли

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN",
    "createdAt": "2026-01-01T00:00:00Z"
  },
  ...
]
```

**Roles:** ADMIN

---

### PUT `/api/admin/users/{id}/role`

Изменить роль пользователя.

**Request:**
```json
{
  "role": "MENTOR"
}
```

**Response (200 OK):** UserDto с новой ролью

**Roles:** ADMIN

---

### DELETE `/api/admin/users/{id}`

Удалить пользователя (и все связанные данные).

**Response (204 No Content)**

**⚠️ ВАЖНО:** Каскадное удаление всех данных пользователя!

**Roles:** ADMIN

---

### GET `/api/admin/projects`

Список всех проектов (включая DRAFT и ARCHIVED).

**Response (200 OK):** То же, что `/api/projects`, но без фильтрации по статусу

**Roles:** ADMIN

---

### POST `/api/admin/projects/{id}/archive`

Архивировать любой проект (не только свой).

**Response (200 OK):** ProjectDto

**Roles:** ADMIN

---

### DELETE `/api/admin/projects/{id}`

Удалить проект.

**Response (204 No Content)**

**Cascade:** Удаляет questions, answers, applications, feedback

**Roles:** ADMIN

---

### GET `/api/admin/allow-list`

Список allow list entries.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "mentor@example.com",
    "role": "MENTOR"
  },
  {
    "id": 2,
    "email": "teacher@example.com",
    "role": "TEACHER"
  }
]
```

**Roles:** ADMIN

---

### POST `/api/admin/allow-list`

Добавить email в allow list.

**Request:**
```json
{
  "email": "newmentor@example.com",
  "role": "MENTOR"
}
```

**Response (201 Created):** AllowListEntryDto

**Errors:**
- `400 Bad Request` — нельзя добавить STUDENT
- `409 Conflict` — email уже существует

**Roles:** ADMIN

---

### DELETE `/api/admin/allow-list/{id}`

Удалить из allow list.

**Response (204 No Content)**

**Roles:** ADMIN

---

### POST `/api/admin/projects/regenerate-embeddings`

Регенерировать embeddings для всех проектов.

**Response (200 OK):**
```json
{
  "message": "Embeddings regeneration started for X projects"
}
```

**Roles:** ADMIN

---

## Error Responses

### Формат ошибки

```json
{
  "message": "Human-readable error message"
}
```

### HTTP коды

| Код | Описание | Пример |
|-----|----------|--------|
| `200` | OK | Успешный запрос |
| `201` | Created | Создан ресурс (POST) |
| `204` | No Content | Успешное удаление (DELETE) |
| `400` | Bad Request | Невалидные данные |
| `401` | Unauthorized | Нет или невалидный JWT токен |
| `403` | Forbidden | Нет прав доступа |
| `404` | Not Found | Ресурс не найден |
| `409` | Conflict | Конфликт (дубликат заявки, повторный ответ) |
| `500` | Internal Server Error | Ошибка сервера |

---

## Rate Limiting

_(На данный момент не реализовано, но рекомендуется для production)_

**Рекомендации:**
- 100 requests/minute для аутентифицированных пользователей
- 10 requests/minute для анонимных (только /auth/*)
- Особые лимиты для семантического поиска (дорогой)

---

## Примеры использования

### cURL

```bash
# Login
TOKEN=$(curl -X POST http://localhost:8080/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","role":"STUDENT"}' \
  | jq -r '.token')

# Get projects
curl http://localhost:8080/api/projects \
  -H "Authorization: Bearer $TOKEN"

# Apply to project
curl -X POST http://localhost:8080/api/projects/1/apply \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Хочу участвовать!"}'
```

### JavaScript (fetch)

```javascript
// Login
const { token } = await api.post('/auth/dev-login', {
  email: 'student@example.com',
  role: 'STUDENT'
});

// Save token
localStorage.setItem('token', token);

// Get projects
const projects = await api.get('/projects?q=machine learning');

// Apply
await api.post('/projects/1/apply', {
  message: 'Хочу участвовать!'
});
```

---

Документ актуален на: **Февраль 2026**

**Swagger UI:** http://localhost:8080/q/swagger-ui — интерактивная документация с возможностью тестирования API

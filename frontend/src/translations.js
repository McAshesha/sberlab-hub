export const translations = {
  en: {
    // Navigation
    nav: {
      catalog: 'Catalog',
      myApplications: 'My Applications',
      myProjects: 'My Projects',
      mentorDashboard: 'My Projects',
      createProject: 'Create Project',
      manageUsers: 'Manage Users',
      manageProjects: 'Manage Projects',
      allowList: 'Allow List',
      logout: 'Logout',
      expandSidebar: 'Expand sidebar',
      collapseSidebar: 'Collapse sidebar',
    },

    // Common
    common: {
      loading: 'Loading...',
      search: 'Search',
      filters: 'Filters',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      back: 'Back',
      actions: 'Actions',
      id: 'ID',
      email: 'Email',
      name: 'Name',
      created: 'Created',
      noData: 'No data available',
      confirm: 'Confirm',
      submit: 'Submit',
      add: 'Add',
      update: 'Update',
      close: 'Close',
    },

    // Roles
    roles: {
      STUDENT: 'Student',
      MENTOR: 'Mentor',
      TEACHER: 'Teacher',
      ADMIN: 'Admin',
      role: 'Role',
    },

    // Project Status
    projectStatus: {
      DRAFT: 'Draft',
      PUBLISHED: 'Published',
      ARCHIVED: 'Archived',
      status: 'Status',
    },

    // Application Status
    applicationStatus: {
      PENDING: 'Pending',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      status: 'Status',
    },

    // Difficulty
    difficulty: {
      EASY: 'Easy',
      MEDIUM: 'Medium',
      HARD: 'Hard',
      difficulty: 'Difficulty',
      allLevels: 'All levels',
    },

    // Project Types
    projectTypes: {
      thesis: 'Thesis',
      practice: 'Practice',
      coursework: 'Coursework',
      suitableForThesis: 'Suitable for Thesis',
      suitableForPractice: 'Suitable for Practice',
      suitableForCoursework: 'Suitable for Coursework',
    },

    // Login Page
    login: {
      title: 'Welcome to SberLab Hub',
      subtitle: 'Connect with mentors and explore exciting projects',
      googleSignIn: 'Sign in with Google',
      devMode: 'Development Mode',
      devLoginTitle: 'Development Login',
      devEmail: 'Email',
      devRole: 'Role',
      devLogin: 'Dev Login',
    },

    // Catalog Page
    catalog: {
      title: 'Project Catalog',
      subtitle: 'Browse available projects and find your perfect match',
      searchPlaceholder: 'Search projects by title, goal, or tasks...',
      tags: 'Tags',
      tagsPlaceholder: 'e.g. ML, Web',
      found: 'Found',
      projects: 'projects',
      project: 'project',
      noProjects: 'No projects found',
      tryAdjusting: 'Try adjusting your search or filter criteria',
      mentor: 'Mentor',
      viewDetails: 'View Details',
      noDescription: 'No description provided',
    },

    // Project Detail Page
    projectDetail: {
      backToCatalog: 'Back to Catalog',
      apply: 'Apply',
      applyTitle: 'Apply for Project',
      applyMessage: 'Why are you interested in this project?',
      applyPlaceholder: 'Tell the mentor about your motivation and relevant experience...',
      applicationSubmitted: 'Application submitted!',
      goal: 'Goal',
      keyTasks: 'Key Tasks',
      value: 'Scientific / Practical Value',
      requiredSkills: 'Required Skills',
      tags: 'Tags',
      curriculumMatch: 'Curriculum Match',
      responsibilityBoundaries: 'Responsibility Boundaries',
      contactPolicy: 'Contact Policy',
      questionsAnswers: 'Questions & Answers',
      askQuestion: 'Ask a Question',
      questionPlaceholder: 'Type your question here...',
      visibility: 'Visibility',
      visibilityPublic: 'Public',
      visibilityPrivate: 'Private',
      questionPosted: 'Question posted',
      answerPosted: 'Answer posted',
      answerPlaceholder: 'Type your answer...',
      noQuestions: 'No questions yet. Be the first to ask!',
      feedback: 'Student Feedback',
      noFeedback: 'No feedback available yet',
      rating: 'Rating',
    },

    // Create/Edit Project Page
    createProject: {
      createTitle: 'Create New Project',
      editTitle: 'Edit Project',
      titleRequired: 'Title is required',
      projectCreated: 'Project created',
      projectUpdated: 'Project updated',
      title: 'Title',
      goal: 'Goal',
      keyTasks: 'Key Tasks',
      value: 'Scientific / Practical Value',
      requiredSkills: 'Required Skills (comma-separated)',
      requiredSkillsPlaceholder: 'Python, SQL, React',
      tags: 'Tags (comma-separated)',
      tagsPlaceholder: 'ML, fintech, UX',
      curriculumMatch: 'Curriculum Match',
      responsibilityBoundaries: 'Responsibility Boundaries',
      contactPolicy: 'Contact Policy',
      contactPolicyPlaceholder: 'e.g. Telegram + weekly sync',
    },

    // My Applications Page
    myApplications: {
      title: 'My Applications',
      noApplications: "You haven't applied to any projects yet.",
      project: 'Project',
      message: 'Message',
      applied: 'Applied',
    },

    // Mentor Dashboard
    mentorDashboard: {
      title: 'My Projects',
      newProject: 'New Project',
      noProjects: 'No projects yet. Create your first one!',
      publish: 'Publish',
      archive: 'Archive',
      applications: 'Applications',
      projectPublished: 'Project published',
      projectArchived: 'Project archived',
    },

    // Mentor Project Applications
    mentorApplications: {
      title: 'Applications',
      noApplications: 'No applications yet.',
      student: 'Student',
      approve: 'Approve',
      reject: 'Reject',
      approved: 'Approved',
      rejected: 'Rejected',
      giveFeedback: 'Give Feedback',
      feedbackTitle: 'Give Feedback',
      feedbackType: 'Feedback Type',
      feedbackTypeInterim: 'Interim',
      feedbackTypeFinal: 'Final',
      feedbackRating: 'Rating',
      feedbackComment: 'Comment',
      feedbackSubmitted: 'Feedback submitted',
    },

    // Admin Users Page
    adminUsers: {
      title: 'Manage Users',
      roleUpdated: 'Role updated',
      userDeleted: 'User deleted',
      confirmDelete: 'Delete this user and all their data? This cannot be undone.',
    },

    // Admin Projects Page
    adminProjects: {
      title: 'Manage Projects (Admin)',
      projectArchived: 'Project archived',
      projectDeleted: 'Project deleted',
      confirmDelete: 'Delete this project and all related data? This cannot be undone.',
      mentor: 'Mentor',
      regenerateEmbeddings: 'Regenerate All Embeddings',
      embeddingsRegenerationStarted: 'Embeddings regeneration completed successfully',
    },

    // Admin Allow List Page
    adminAllowList: {
      title: 'Allow List',
      addEntry: 'Add Entry',
      addTitle: 'Add Allow List Entry',
      entryAdded: 'Entry added',
      roleUpdated: 'Role updated',
      entryRemoved: 'Entry removed',
      confirmRemove: 'Remove this allow list entry?',
      noEntries: 'No entries yet',
    },

    // Question visibility
    questionVisibility: {
      PUBLIC: 'Public',
      PRIVATE: 'Private',
    },

    // Feedback types
    feedbackType: {
      INTERIM: 'Interim',
      FINAL: 'Final',
    },
  },

  ru: {
    // Навигация
    nav: {
      catalog: 'Каталог',
      myApplications: 'Мои заявки',
      myProjects: 'Мои проекты',
      mentorDashboard: 'Мои проекты',
      createProject: 'Создать проект',
      manageUsers: 'Управление пользователями',
      manageProjects: 'Управление проектами',
      allowList: 'Белый список',
      logout: 'Выход',
      expandSidebar: 'Развернуть панель',
      collapseSidebar: 'Свернуть панель',
    },

    // Общее
    common: {
      loading: 'Загрузка...',
      search: 'Поиск',
      filters: 'Фильтры',
      cancel: 'Отмена',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Редактировать',
      view: 'Просмотр',
      back: 'Назад',
      actions: 'Действия',
      id: 'ID',
      email: 'Email',
      name: 'Имя',
      created: 'Создано',
      noData: 'Нет данных',
      confirm: 'Подтвердить',
      submit: 'Отправить',
      add: 'Добавить',
      update: 'Обновить',
      close: 'Закрыть',
    },

    // Роли
    roles: {
      STUDENT: 'Студент',
      MENTOR: 'Ментор',
      TEACHER: 'Преподаватель',
      ADMIN: 'Администратор',
      role: 'Роль',
    },

    // Статус проекта
    projectStatus: {
      DRAFT: 'Черновик',
      PUBLISHED: 'Опубликован',
      ARCHIVED: 'Архивирован',
      status: 'Статус',
    },

    // Статус заявки
    applicationStatus: {
      PENDING: 'Ожидание',
      APPROVED: 'Одобрено',
      REJECTED: 'Отклонено',
      status: 'Статус',
    },

    // Сложность
    difficulty: {
      EASY: 'Легкий',
      MEDIUM: 'Средний',
      HARD: 'Сложный',
      difficulty: 'Сложность',
      allLevels: 'Все уровни',
    },

    // Типы проектов
    projectTypes: {
      thesis: 'ВКР',
      practice: 'Практика',
      coursework: 'Курсовая',
      suitableForThesis: 'Подходит для ВКР',
      suitableForPractice: 'Подходит для практики',
      suitableForCoursework: 'Подходит для курсовой',
    },

    // Страница входа
    login: {
      title: 'Добро пожаловать в SberLab Hub',
      subtitle: 'Связывайтесь с менторами и исследуйте интересные проекты',
      googleSignIn: 'Войти через Google',
      devMode: 'Режим разработки',
      devLoginTitle: 'Вход для разработчиков',
      devEmail: 'Email',
      devRole: 'Роль',
      devLogin: 'Dev-вход',
    },

    // Каталог
    catalog: {
      title: 'Каталог проектов',
      subtitle: 'Просматривайте доступные проекты и находите идеальное совпадение',
      searchPlaceholder: 'Поиск проектов по названию, цели или задачам...',
      tags: 'Теги',
      tagsPlaceholder: 'например, ML, Web',
      found: 'Найдено',
      projects: 'проектов',
      project: 'проект',
      noProjects: 'Проекты не найдены',
      tryAdjusting: 'Попробуйте изменить критерии поиска или фильтры',
      mentor: 'Ментор',
      viewDetails: 'Подробнее',
      noDescription: 'Описание отсутствует',
    },

    // Детали проекта
    projectDetail: {
      backToCatalog: 'Назад к каталогу',
      apply: 'Подать заявку',
      applyTitle: 'Подать заявку на проект',
      applyMessage: 'Почему вас интересует этот проект?',
      applyPlaceholder: 'Расскажите ментору о своей мотивации и релевантном опыте...',
      applicationSubmitted: 'Заявка отправлена!',
      goal: 'Цель',
      keyTasks: 'Ключевые задачи',
      value: 'Научная / Практическая ценность',
      requiredSkills: 'Требуемые навыки',
      tags: 'Теги',
      curriculumMatch: 'Соответствие учебному плану',
      responsibilityBoundaries: 'Границы ответственности',
      contactPolicy: 'Политика контактов',
      questionsAnswers: 'Вопросы и ответы',
      askQuestion: 'Задать вопрос',
      questionPlaceholder: 'Введите ваш вопрос здесь...',
      visibility: 'Видимость',
      visibilityPublic: 'Публичный',
      visibilityPrivate: 'Приватный',
      questionPosted: 'Вопрос опубликован',
      answerPosted: 'Ответ опубликован',
      answerPlaceholder: 'Введите ваш ответ...',
      noQuestions: 'Вопросов пока нет. Будьте первым!',
      feedback: 'Отзывы о студентах',
      noFeedback: 'Отзывов пока нет',
      rating: 'Оценка',
    },

    // Создание/Редактирование проекта
    createProject: {
      createTitle: 'Создать новый проект',
      editTitle: 'Редактировать проект',
      titleRequired: 'Название обязательно',
      projectCreated: 'Проект создан',
      projectUpdated: 'Проект обновлен',
      title: 'Название',
      goal: 'Цель',
      keyTasks: 'Ключевые задачи',
      value: 'Научная / Практическая ценность',
      requiredSkills: 'Требуемые навыки (через запятую)',
      requiredSkillsPlaceholder: 'Python, SQL, React',
      tags: 'Теги (через запятую)',
      tagsPlaceholder: 'ML, fintech, UX',
      curriculumMatch: 'Соответствие учебному плану',
      responsibilityBoundaries: 'Границы ответственности',
      contactPolicy: 'Политика контактов',
      contactPolicyPlaceholder: 'например, Telegram + еженедельный созвон',
    },

    // Мои заявки
    myApplications: {
      title: 'Мои заявки',
      noApplications: 'Вы еще не подавали заявки на проекты.',
      project: 'Проект',
      message: 'Сообщение',
      applied: 'Подано',
    },

    // Дашборд ментора
    mentorDashboard: {
      title: 'Мои проекты',
      newProject: 'Новый проект',
      noProjects: 'Проектов пока нет. Создайте первый!',
      publish: 'Опубликовать',
      archive: 'Архивировать',
      applications: 'Заявки',
      projectPublished: 'Проект опубликован',
      projectArchived: 'Проект архивирован',
    },

    // Заявки на проект ментора
    mentorApplications: {
      title: 'Заявки',
      noApplications: 'Заявок пока нет.',
      student: 'Студент',
      approve: 'Одобрить',
      reject: 'Отклонить',
      approved: 'Одобрено',
      rejected: 'Отклонено',
      giveFeedback: 'Дать отзыв',
      feedbackTitle: 'Дать отзыв',
      feedbackType: 'Тип отзыва',
      feedbackTypeInterim: 'Промежуточный',
      feedbackTypeFinal: 'Финальный',
      feedbackRating: 'Оценка',
      feedbackComment: 'Комментарий',
      feedbackSubmitted: 'Отзыв отправлен',
    },

    // Управление пользователями
    adminUsers: {
      title: 'Управление пользователями',
      roleUpdated: 'Роль обновлена',
      userDeleted: 'Пользователь удален',
      confirmDelete: 'Удалить этого пользователя и все его данные? Это действие нельзя отменить.',
    },

    // Управление проектами
    adminProjects: {
      title: 'Управление проектами (Админ)',
      projectArchived: 'Проект архивирован',
      projectDeleted: 'Проект удален',
      confirmDelete: 'Удалить этот проект и все связанные данные? Это действие нельзя отменить.',
      mentor: 'Ментор',
      regenerateEmbeddings: 'Перегенерировать все эмбеддинги',
      embeddingsRegenerationStarted: 'Регенерация эмбеддингов завершена успешно',
    },

    // Белый список
    adminAllowList: {
      title: 'Белый список',
      addEntry: 'Добавить запись',
      addTitle: 'Добавить запись в белый список',
      entryAdded: 'Запись добавлена',
      roleUpdated: 'Роль обновлена',
      entryRemoved: 'Запись удалена',
      confirmRemove: 'Удалить эту запись из белого списка?',
      noEntries: 'Записей пока нет',
    },

    // Видимость вопроса
    questionVisibility: {
      PUBLIC: 'Публичный',
      PRIVATE: 'Приватный',
    },

    // Типы отзывов
    feedbackType: {
      INTERIM: 'Промежуточный',
      FINAL: 'Финальный',
    },
  },
};

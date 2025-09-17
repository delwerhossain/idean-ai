● API Endpoints Implemented in Frontend

  Authentication APIs

  Base Path: /auth

  | Method | Endpoint                   | Description                                     |
  |--------|----------------------------|-------------------------------------------------|
  | POST   | /auth/sync-user            | Sync user data with backend after Firebase auth |
  | GET    | /auth/me                   | Get current user data                           |
  | PATCH  | /auth/me                   | Update user data                                |
  | DELETE | /auth/me                   | Delete user account                             |
  | POST   | /auth/check-email          | Check email availability                        |
  | POST   | /auth/send-verification    | Send email verification                         |
  | POST   | /auth/verify-email         | Verify email with token                         |
  | POST   | /auth/forgot-password      | Request password reset                          |
  | POST   | /auth/reset-password       | Reset password with token                       |
  | POST   | /auth/change-password      | Change password (authenticated)                 |
  | GET    | /auth/sessions             | Get user's auth sessions                        |
  | DELETE | /auth/sessions/{sessionId} | Revoke specific session                         |
  | POST   | /auth/revoke-all-sessions  | Revoke all other sessions                       |

  Business Management APIs

  Base Path: /api/v1/businesses

  | Method | Endpoint                               | Description                             |
  |--------|----------------------------------------|-----------------------------------------|
  | GET    | /api/v1/businesses                     | Get all businesses (paginated)          |
  | POST   | /api/v1/businesses                     | Create new business                     |
  | GET    | /api/v1/businesses/{id}                | Get business by ID                      |
  | PUT    | /api/v1/businesses/{id}                | Update business                         |
  | DELETE | /api/v1/businesses/{id}                | Delete business                         |
  | GET    | /api/v1/businesses/me                  | Get current user's business             |
  | GET    | /api/v1/businesses/{id}/users          | Get business users                      |
  | POST   | /api/v1/businesses/{id}/users          | Add user to business                    |
  | DELETE | /api/v1/businesses/{id}/users/{userId} | Remove user from business               |
  | POST   | /api/v1/businesses/{id}/documents      | Upload business documents               |
  | GET    | /api/v1/businesses/{id}/documents      | Get business documents                  |
  | GET    | /api/v1/businesses/documents/search    | Search documents with vector similarity |

  Growth Co-pilot APIs (Strategy & Execution)

  Base Path: /api/v1/growthcopilots

  | Method | Endpoint                             | Description                           |
  |--------|--------------------------------------|---------------------------------------|
  | GET    | /api/v1/growthcopilots               | Get all growth frameworks (paginated) |
  | POST   | /api/v1/growthcopilots               | Create growth framework               |
  | GET    | /api/v1/growthcopilots/{id}          | Get framework by ID                   |
  | PUT    | /api/v1/growthcopilots/{id}          | Update framework                      |
  | DELETE | /api/v1/growthcopilots/{id}          | Delete framework                      |
  | POST   | /api/v1/growthcopilots/{id}/execute  | Execute growth strategy               |
  | POST   | /api/v1/growthcopilots/{id}/generate | Generate AI content                   |

  Branding Lab APIs (Brand Strategy)

  Base Path: /api/v1/brandinglabs

  | Method | Endpoint                           | Description                             |
  |--------|------------------------------------|-----------------------------------------|
  | GET    | /api/v1/brandinglabs               | Get all branding frameworks (paginated) |
  | POST   | /api/v1/brandinglabs               | Create branding framework               |
  | GET    | /api/v1/brandinglabs/{id}          | Get framework by ID                     |
  | PUT    | /api/v1/brandinglabs/{id}          | Update framework                        |
  | DELETE | /api/v1/brandinglabs/{id}          | Delete framework                        |
  | POST   | /api/v1/brandinglabs/{id}/execute  | Execute branding framework              |
  | POST   | /api/v1/brandinglabs/{id}/generate | Generate AI branding content            |

  Copywriting APIs (Content Generation)

  Base Path: /api/v1/copywriting

  | Method | Endpoint                          | Description                    |
  |--------|-----------------------------------|--------------------------------|
  | GET    | /api/v1/copywriting               | Get all copywriting frameworks |
  | POST   | /api/v1/copywriting               | Create copywriting framework   |
  | GET    | /api/v1/copywriting/{id}          | Get framework by ID            |
  | PUT    | /api/v1/copywriting/{id}          | Update framework               |
  | DELETE | /api/v1/copywriting/{id}          | Delete framework               |
  | POST   | /api/v1/copywriting/{id}/generate | Generate AI copy content       |

  Templates APIs (Reusable Frameworks)

  Base Path: /api/v1/templates

  | Method | Endpoint                              | Description                      |
  |--------|---------------------------------------|----------------------------------|
  | GET    | /api/v1/templates                     | Get all templates (paginated)    |
  | POST   | /api/v1/templates                     | Create template                  |
  | GET    | /api/v1/templates/{id}                | Get template by ID               |
  | PUT    | /api/v1/templates/{id}                | Update template                  |
  | DELETE | /api/v1/templates/{id}                | Delete template                  |
  | POST   | /api/v1/templates/{id}/use            | Use template to generate content |
  | GET    | /api/v1/templates/category/{category} | Get templates by category        |

  Documents APIs (Knowledge Base)

  Base Path: /api/v1/documents

  | Method | Endpoint               | Description                   |
  |--------|------------------------|-------------------------------|
  | GET    | /api/v1/documents      | Get all documents (paginated) |
  | POST   | /api/v1/documents      | Create document               |
  | GET    | /api/v1/documents/{id} | Get document by ID            |
  | PUT    | /api/v1/documents/{id} | Update document               |
  | DELETE | /api/v1/documents/{id} | Delete document               |

  User Management APIs

  Base Path: /api/v1/users

  | Method | Endpoint           | Description                           |
  |--------|--------------------|---------------------------------------|
  | GET    | /api/v1/users/me   | Get current user profile              |
  | PUT    | /api/v1/users/me   | Update current user profile           |
  | GET    | /api/v1/users/{id} | Get user by ID                        |
  | GET    | /api/v1/users      | Get all users (admin only, paginated) |

  Payments APIs

  Base Path: /api/v1/payments

  | Method | Endpoint              | Description                  |
  |--------|-----------------------|------------------------------|
  | GET    | /api/v1/payments      | Get all payments (paginated) |
  | POST   | /api/v1/payments      | Create payment               |
  | GET    | /api/v1/payments/{id} | Get payment by ID            |
  | GET    | /api/v1/payments/me   | Get current user's payments  |

  AI Generation APIs

  Base Path: /api/v1/ai

  | Method | Endpoint            | Description                            |
  |--------|---------------------|----------------------------------------|
  | POST   | /api/v1/ai/generate | Generate content using AI with context |
  | POST   | /api/v1/ai/chat     | Chat with AI using business context    |
  | POST   | /api/v1/ai/analyze  | Analyze existing content               |

  Analytics APIs

  Base Path: /api/v1/analytics

  | Method | Endpoint                                | Description             |
  |--------|-----------------------------------------|-------------------------|
  | GET    | /api/v1/analytics/dashboard             | Get user dashboard data |
  | GET    | /api/v1/analytics/usage                 | Get usage statistics    |
  | GET    | /api/v1/analytics/insights/{businessId} | Get business insights   |


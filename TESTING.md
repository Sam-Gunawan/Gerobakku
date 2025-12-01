# Testing Guide - Gerobakku

This document provides instructions for running unit tests in the Gerobakku project.

---

## Backend Tests (Python + pytest)

The backend uses **pytest** for unit testing with support for async operations and mocking.

### Prerequisites

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt  # Includes pytest, pytest-asyncio, pytest-mock
```

### Running Tests

**Run all tests:**
```bash
pytest
```

**Run with verbose output:**
```bash
pytest -v
```

**Run specific test file:**
```bash
pytest tests/test_security.py
pytest tests/test_auth_service.py
pytest tests/test_vendor_service.py
```

**Run with coverage report:**
```bash
pytest --cov=app --cov-report=html
```

### Test Coverage

- **test_security.py** - Password hashing, JWT token creation/validation (12 tests)
- **test_auth_service.py** - User registration, login, email verification (12 tests)
- **test_vendor_service.py** - Location interpolation, vendor registration, file uploads (13 tests)

### Expected Results

✅ **36 passed, 1 skipped**

---

## Frontend Tests (Angular + Jasmine/Karma)

The frontend uses **Jasmine** and **Karma** for unit testing Angular components and services.

### Prerequisites

```bash
cd frontend
npm install  # Installs all dev dependencies including Jasmine/Karma
```

### Running Tests

**Run all tests (watch mode):**
```bash
npm test
```

**Run tests once (no watch mode):**
```bash
npm test -- --no-watch --browsers=ChromeHeadless
```

**Run specific test file:**
```bash
npm test -- --include='**/auth.service.spec.ts'
```

### Test Coverage

- **auth.service.spec.ts** - User authentication, login, registration (12 tests)
- **routing.service.spec.ts** - OSRM route calculation, distance/duration formatting (40 tests)
- **Component specs** - Component creation and initialization tests (6 tests)

### Expected Results

✅ **All specs passing (~58 tests)**

---

## Test Structure

### Backend Test Files

```
backend/tests/
├── conftest.py                 # Shared pytest fixtures
├── test_security.py            # Password hashing & JWT tests
├── test_auth_service.py        # Authentication service tests
└── test_vendor_service.py      # Vendor service & geospatial tests
```

### Frontend Test Files

```
frontend/src/app/
├── services/
│   ├── auth.service.spec.ts        # Auth service tests
│   └── routing.service.spec.ts     # Routing service tests
└── [components]/
    └── *.component.spec.ts         # Component tests
```

---

## Troubleshooting

### Backend

**Issue:** `pytest: command not found`  
**Solution:** Ensure you've activated the virtual environment and installed dependencies:
```bash
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Issue:** Database connection errors during tests  
**Solution:** Tests use mocked database connections. Ensure test files import mocks correctly.

### Frontend

**Issue:** `ChromeHeadless not found`  
**Solution:** Install Chrome browser or use a different browser:
```bash
npm test -- --browsers=Firefox
```

**Issue:** Tests fail with module not found  
**Solution:** Reinstall node_modules:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

**Backend CI Example:**
```yaml
- name: Run Backend Tests
  run: |
    cd backend
    source venv/bin/activate
    pytest -v --cov=app
```

**Frontend CI Example:**
```yaml
- name: Run Frontend Tests  
  run: |
    cd frontend
    npm ci
    npm test -- --no-watch --browsers=ChromeHeadless
```

---

## Writing New Tests

### Backend Test Example

```python
def test_example():
    """Test description"""
    # Arrange - Set up test data
    input_data = "test"
    
    # Act - Execute the function
    result = function_to_test(input_data)
    
    # Assert - Verify the result
    assert result == expected_output
```

### Frontend Test Example

```typescript
it('should do something', () => {
  // Arrange
  const testData = 'test';
  
  // Act
  const result = service.methodToTest(testData);
  
  // Assert
  expect(result).toBe(expectedOutput);
});
```

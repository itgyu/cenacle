# E2E Test Fixtures

This directory contains test fixtures for E2E tests.

## Required Files

### test-image.jpg

A test image file for photo upload tests.

To create one:

```bash
# Using ImageMagick
convert -size 100x100 xc:gray test-image.jpg

# Or just copy any JPEG image and rename it
```

## Test User Credentials

The test user credentials are defined in `auth.fixture.ts`.

**Important**: These should match existing test accounts in your test database or be created as part of test setup.

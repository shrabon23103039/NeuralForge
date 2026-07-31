# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authority.spec.ts >> Authority Dashboard Workflow >> should filter reports by status
- Location: e2e\authority.spec.ts:70:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Routed Incident Queue')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Routed Incident Queue')

```

```yaml
- banner:
  - link "Nirapod Dhaka Safety Net":
    - /url: /
  - navigation:
    - link "Risk Map":
      - /url: /
    - link "Report Hazard":
      - /url: /report
    - link "Authority Portal":
      - /url: /authority
  - button "EMERGENCY SOS"
  - button "বাংলা"
- main:
  - link "Back to Map":
    - /url: /
  - heading "Sign In to Nirapod" [level=1]
  - paragraph: Dhaka Citizen & Authority Access Portal
  - text: Email Address
  - textbox "user@example.com"
  - text: Password
  - textbox "••••••••"
  - button "Sign In"
  - button "Need an account? Sign up"
- contentinfo: Nirapod Prototype © 2026 — Built for Dhaka Citizen Safety & Emergency Resilience.
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in Toorker, please follow these guidelines:

### Do Not

- **Do not** open a public GitHub issue
- **Do not** discuss the vulnerability publicly until it has been addressed

### Do

1. **Email us directly** at egeturker34@icloud.com with:
   - A description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

2. **Allow time for a fix**: We aim to respond within 48 hours and provide a fix within 7 days for critical issues.

3. **Coordinate disclosure**: We'll work with you on responsible disclosure timing.

## Security Measures

Toorker implements several security measures:

- **Code signing**: All releases are cryptographically signed
- **Auto-updates**: Secure, signed updates via GitHub Releases
- **Local-first**: No data is sent to external servers
- **Sandboxed**: Tauri's security model limits system access
- **Dependency scanning**: Regular audits via `npm audit`

## Key Management

- Private signing keys are **never** committed to version control
- The `.gitignore` file is configured to prevent accidental exposure
- Public keys are safe to share and are included in `tauri.conf.json`

## Best Practices for Contributors

- Never commit sensitive information (keys, tokens, credentials)
- Use environment variables for configuration
- Review dependencies before adding them
- Follow secure coding practices

---

Thank you for helping keep Toorker secure!

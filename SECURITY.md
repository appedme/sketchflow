# Security Policy


## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of SketchFlow seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do the following:

1. **DO NOT** open a public GitHub issue
2. Email us at: **security@sketchflow.space**
3. Include the following information:
   - Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
   - Full paths of source file(s) related to the manifestation of the issue
   - The location of the affected source code (tag/branch/commit or direct URL)
   - Any special configuration required to reproduce the issue
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue, including how an attacker might exploit it

### What to expect:

- We will acknowledge your email within 48 hours
- We will send a more detailed response within 7 days indicating the next steps
- We will keep you informed about the progress towards a fix
- We may ask for additional information or guidance

### Disclosure Policy

- We will coordinate with you on the disclosure timeline
- We prefer to fully remediate vulnerabilities before any disclosure
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices for Users

### For Self-Hosted Instances

1. **Environment Variables**: 
   - Never commit `.env` files to version control
   - Use strong, unique secrets for all API keys and tokens
   - Rotate secrets regularly

2. **Database Security**:
   - Use encrypted connections (TLS/SSL)
   - Implement proper backup strategies
   - Restrict database access to necessary services only

3. **Authentication**:
   - Use strong password policies
   - Enable two-factor authentication when available
   - Regularly review user access logs

4. **Updates**:
   - Keep dependencies up to date
   - Monitor security advisories
   - Apply security patches promptly

5. **Network Security**:
   - Use HTTPS in production
   - Implement rate limiting
   - Use a WAF (Web Application Firewall) if possible

### For Contributors

1. **Code Reviews**:
   - All code must be reviewed before merging
   - Security-sensitive code requires additional scrutiny

2. **Dependencies**:
   - Audit new dependencies before adding them
   - Keep dependencies updated
   - Remove unused dependencies

3. **Data Handling**:
   - Never log sensitive information
   - Sanitize user inputs
   - Use parameterized queries
   - Implement proper access controls

4. **Testing**:
   - Write security tests for sensitive features
   - Test authentication and authorization
   - Validate input sanitization

## Known Security Considerations

### Data Storage
- User data is stored in Turso database with encryption at rest
- File uploads are processed through third-party APIs (ImgBB, FreeImage)
- Always review third-party API security policies

### Authentication
- Stack Auth is used for authentication
- Sessions are managed securely
- Passwords are never stored in plain text

### Client-Side Security
- Content Security Policy (CSP) headers are implemented
- XSS protection is enabled
- Input validation on both client and server

## Security Update Process

1. **Assessment**: Evaluate the vulnerability severity
2. **Patch Development**: Develop and test the fix
3. **Disclosure**: Coordinate responsible disclosure
4. **Release**: Publish security update
5. **Communication**: Notify users through:
   - GitHub Security Advisory
   - Release notes
   - Email notification (for critical issues)

## Bug Bounty Program

We currently do not have a bug bounty program. However, we deeply appreciate security researchers who report vulnerabilities responsibly and will publicly acknowledge their contributions (with permission).

## Contact

For security concerns, please contact:
- **Email**: security@sketchflow.space
- **PGP Key**: Available upon request

---

**Last Updated**: October 2025

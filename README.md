<div align="center">

# <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/jenkins/jenkins-original.svg" width="30px"> Mini Jenkins Clone

**A lightweight, developer-friendly CI/CD automation platform**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://adoptopenjdk.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0+-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-13+-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg)](https://www.postgresql.org/)

</div>

---

<p align="center">
  <strong>Mini Jenkins Clone</strong> is a streamlined, self-hosted CI/CD automation tool designed for developers who need simplicity without sacrificing power.
  <br>Built with Spring Boot and Next.js, it delivers a modern alternative to complex enterprise CI/CD systems.
  <br>Currently optimized for Windows environments with plans for cross-platform support via Docker.
</p>

<br>

## 🚀 Key Features

- **Simplified Pipeline Creation** - Create build pipelines in minutes with an intuitive UI
- **GitHub Integration** - Seamlessly pull from GitHub repositories and execute builds
- **Webhook Support** - Automatic build triggering via GitHub webhooks on push/PR events
- **Scheduled Builds** - Built-in Quartz scheduler for time-based pipeline automation
- **Multi-Stage Builds** - Define complex build workflows with multiple sequential stages
- **Concurrent Execution** - Advanced executor service for running multiple builds simultaneously
- **Custom Shell Commands** - Run and chain custom shell commands with ease
- **Real-time Monitoring** - Watch build logs stream in real-time via SSE
- **Secure Access** - JWT authentication keeps your projects protected
- **Comprehensive History** - Review past builds and their detailed logs
- **Lightweight Footprint** - Minimal resource requirements compared to enterprise solutions
- **Windows Support** - Currently optimized for Windows environments

## 🔮 Coming Soon

- **Docker Support** - Cross-platform compatibility via containerization
- **Multi-OS Support** - Run builds on various operating systems
- **Pipeline Visualization** - Visual pipeline editor and execution flow
- **Branch-specific Builds** - Conditional builds based on Git branches

## 💻 Tech Stack

<table>
  <tr>
    <td align="center"><strong>Backend</strong></td>
    <td>
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg" width="20px">
      Java
      &nbsp;|&nbsp;
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/spring/spring-original.svg" width="20px">
      Spring Boot
      &nbsp;|&nbsp;
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/maven/maven-original.svg" width="20px">
      Maven
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Frontend</strong></td>
    <td>
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" width="20px">
      Next.js
      &nbsp;|&nbsp;
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="20px">
      TypeScript
      &nbsp;|&nbsp;
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="20px">
      React
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Database</strong></td>
    <td>
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" width="20px">
      PostgreSQL
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Scheduling & Execution</strong></td>
    <td>
      Quartz Scheduler
      &nbsp;|&nbsp;
      Java ExecutorService
      &nbsp;|&nbsp;
      GitHub Webhooks
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Communication</strong></td>
    <td>
      Server-Sent Events (SSE)
      &nbsp;|&nbsp;
      RESTful APIs
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Future Stack</strong></td>
    <td>
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" width="20px">
      Docker
      &nbsp;|&nbsp;
      Kubernetes
    </td>
  </tr>
</table>

## 📊 Dashboard Preview

![Mini Jenkins Dashboard](https://via.placeholder.com/800x450?text=Mini+Jenkins+Dashboard+Preview)

## 🏗️ Project Structure

```
mini_jenkins_clone/
├── backend/
│   └── src/main/java
│       └── com/mini_jenkins_clone
│           ├── config/       # Application configuration
│           ├── controller/   # REST endpoints
│           ├── model/        # Data models
│           ├── repository/   # Database access
│           ├── security/     # JWT & auth
│           ├── service/      # Business logic
│           ├── scheduler/    # Quartz scheduling
│           ├── executor/     # Build execution service
│           ├── webhook/      # GitHub webhook handling
│           └── util/         # Helper classes
│
└── frontend/
    └── src/
        ├── app/             # Next.js app directory
        ├── components/      # UI components
        ├── hooks/           # Custom React hooks 
        ├── lib/             # Utility functions
        ├── services/        # API integration
        └── types/           # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Java 17+ 
- Node.js 18+
- Maven
- Git
- PostgreSQL 14+

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/mini_jenkins_clone.git
cd mini_jenkins_clone
```

2. **Setup PostgreSQL database**

```sql
CREATE DATABASE mini_jenkins;
CREATE USER jenkins_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mini_jenkins TO jenkins_user;
```

3. **Configure the application**

Edit `backend/src/main/resources/application.properties`:

```properties
# Database configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/mini_jenkins
spring.datasource.username=jenkins_user
spring.datasource.password=your_password

# Webhook configuration (optional)
github.webhook.secret=your-webhook-secret
```

4. **Start the backend**

```bash
cd backend
./mvnw spring-boot:run
```

5. **Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

6. **Access the application**

Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Configuration

Mini Jenkins Clone can be configured through the `application.properties` file:

```properties
# Database configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/mini_jenkins
spring.datasource.username=postgres
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update

# JWT configuration
jwt.secret=your-secret-key
jwt.expiration=86400000

# Build workspace configuration
builds.workspace.path=C:/path/to/windows/workspace

# Executor service configuration
executor.core-pool-size=5
executor.max-pool-size=10
executor.queue-capacity=25

# Quartz scheduler configuration
quartz.enabled=true
quartz.thread-count=5

# GitHub webhook configuration
github.webhook.secret=your-webhook-secret
github.webhook.endpoint=/api/webhooks/github
```

## 📋 Core Functionality

### Pipeline Creation Process
1. Create a new pipeline with a name and description
2. Add GitHub repository URL (supports both public and private repositories)
3. Define multi-stage build process with sequential stages
4. Configure shell commands for each stage
5. Set up scheduling options (manual, scheduled, or webhook-triggered)
6. Configure build parameters and environment variables
7. Save and run the pipeline

### Advanced Build Features

#### Multi-Stage Builds
- Define multiple sequential build stages (e.g., Build → Test → Deploy)
- Each stage can have its own shell commands and configurations
- Automatic stage progression on success or halt on failure
- Stage-specific logging and status tracking

#### Scheduled Builds
- Configure builds to run at specific times using cron expressions
- Support for recurring schedules (daily, weekly, monthly)
- Timezone-aware scheduling
- Automatic build queue management

#### Webhook Integration
- Automatic build triggering on GitHub push events
- Support for pull request builds
- Secure webhook validation using GitHub secrets
- Branch-specific webhook filtering

#### Concurrent Execution
- Multiple builds can run simultaneously using ExecutorService
- Configurable thread pool for optimal resource utilization
- Build queue management with priority handling
- Resource isolation between concurrent builds

### Pipeline Execution
- Manual triggering through the UI
- Automatic triggering via webhooks or schedules
- Clones the specified GitHub repository
- Executes multi-stage build process sequentially
- Captures and streams real-time output via SSE
- Stores build results and logs for future reference
- Concurrent build support with resource management

### Build Status Monitoring
- Real-time status updates (Pending, Running, Success, Failed)
- Stage-by-stage progress tracking
- Live command output during execution
- Full build history with searchable logs
- Performance metrics for build duration and stage timing
- Build queue status and position

## 💡 Use Cases

- **Small to Medium Teams** - Perfect for teams who need enterprise-grade CI/CD capabilities with simplified management
- **Educational Environment** - Comprehensive platform for learning DevOps principles and advanced CI/CD concepts
- **Personal Projects** - Full-featured automation for individual developers with multiple repositories
- **Windows Development Environments** - Optimized for Windows-based development workflows
- **Automated Testing** - Scheduled and webhook-triggered test runs with multi-stage validation
- **Continuous Deployment** - Multi-stage pipelines for build, test, and deployment automation

## 🔐 Security

Mini Jenkins Clone uses JSON Web Tokens (JWT) for authentication and implements secure webhook validation for GitHub integration. All API endpoints except for login, registration, and webhooks require a valid JWT token.

## 🛣️ Roadmap

- **Q3 2025**: ✅ Webhook support for GitHub events (COMPLETED)
- **Q3 2025**: ✅ Quartz integration for scheduled builds (COMPLETED)
- **Q3 2025**: ✅ Multi-stage build pipelines (COMPLETED)
- **Q3 2025**: ✅ Advanced executor service (COMPLETED)
- **Q4 2025**: Docker support for cross-platform compatibility
- **Q1 2026**: Multi-OS build agents
- **Q2 2026**: Pipeline visualization and visual editor
- **Future**: Branch-specific builds and advanced Git integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <h3>Why Mini Jenkins Clone?</h3>
  <p>Jenkins is powerful but often too complex for smaller teams and projects.<br>
  Mini Jenkins Clone delivers enterprise-grade CI/CD features with the simplicity you need.</p>
  <br>
  Made with ❤️ for developers who appreciate powerful simplicity
</div>

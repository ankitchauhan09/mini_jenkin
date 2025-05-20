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
- **Custom Shell Commands** - Run and chain custom shell commands with ease
- **Real-time Monitoring** - Watch build logs stream in real-time via SSE
- **Secure Access** - JWT authentication keeps your projects protected
- **Comprehensive History** - Review past builds and their detailed logs
- **Lightweight Footprint** - Minimal resource requirements compared to enterprise solutions
- **Windows Support** - Currently optimized for Windows environments

## 🔮 Coming Soon

- **Scheduled Builds** - Quartz integration for time-based pipeline scheduling
- **Docker Support** - Cross-platform compatibility via containerization
- **Multi-OS Support** - Run builds on various operating systems

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
      Quartz Scheduler
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

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/mini_jenkins_clone.git
cd mini_jenkins_clone
```

2. **Start the backend**

```bash
cd backend
./mvnw spring-boot:run
```

3. **Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**

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
```

## 📋 Core Functionality

### Pipeline Creation Process
1. Create a new pipeline with a name and description
2. Add GitHub repository URL (supports both public and private repositories)
3. Define shell commands to be executed during the build process
4. Configure any build parameters or environment variables
5. Save and run the pipeline

### Pipeline Execution
- Manual triggering through the UI
- Clones the specified GitHub repository
- Executes the defined shell commands in sequence
- Captures and streams real-time output via SSE
- Stores build results and logs for future reference

### Build Status Monitoring
- Real-time status updates (Pending, Running, Success, Failed)
- Live command output during execution
- Full build history with searchable logs
- Performance metrics for build duration

## 💡 Use Cases

- **Small to Medium Teams** - Perfect for teams who need CI/CD capabilities but don't want the complexity of enterprise solutions
- **Educational Environment** - Great for learning DevOps principles and CI/CD concepts
- **Personal Projects** - Streamlined automation for individual developers with multiple repositories
- **Windows Development Environments** - Optimized for Windows-based development workflows

## 🔐 Security

Mini Jenkins Clone uses JSON Web Tokens (JWT) for authentication. All API endpoints except for login and registration require a valid JWT token.

## 🛣️ Roadmap

- **Q3 2025**: Quartz integration for scheduled builds
- **Q4 2025**: Docker support for cross-platform compatibility
- **Q1 2026**: Multi-OS build agents
- **Q2 2026**: Webhook support for GitHub events
- **Future**: Pipeline visualization and branch-specific builds

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <h3>Why Mini Jenkins Clone?</h3>
  <p>Jenkins is powerful but often too complex for smaller teams and projects.<br>
  Mini Jenkins Clone delivers the essential CI/CD features you need without the overhead.</p>
  <br>
  Made with ❤️ for developers who appreciate simplicity
</div>

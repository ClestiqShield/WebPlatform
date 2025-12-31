# Clestiq Shield Web Platform

The centralized dashboard for managing API keys, viewing metrics, and monitoring application health for the Clestiq Shield ecosystem.

## Features

- **Dashboard**
  - Real-time overview of active keys and total request volumes.
  - "Recent Applications" view for quick access to your latest projects.
  - Streamlined interface with focused metrics.

- **Metrics & Insights**
  - **Key Distribution**: Visual breakdown of Active vs. Disabled keys.
  - **Usage Statistics**: identifying top-performing applications.
  - **Top API Keys**: Global leaderboard of key usage to identify high-traffic sources.

- **App Management**
  - Create and manage applications.
  - Generate and revoke API keys.
  - Real-time status indicators for keys (Active/Disabled).

## Getting Started

First, clone the repository:

```bash
git clone <repository-url>
cd ClestiqShield-WebPlatform
```

Install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & Glassmorphism UI
- **Icons**: Lucide React
- **Data Integration**: Connects to Clestiq Shield Agent Core (Gateway & Eagle Eye)

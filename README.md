
## Overview

Shortlistr is an automated tool that streamlines the HR workflow by parsing resumes, matching them with job descriptions using AI, generating match scores with summaries, and sending result emails to candidates in one click.

## Features

- **Resume Upload**: Easy-to-use interface for uploading resume files in various formats (PDF, DOCX, etc.)
- **Resume Analysis**: View detailed analysis of uploaded resumes
- **Candidate Management**: Organize and track candidates throughout the screening process
- **Search & Filter**: Quickly find candidates based on skills, experience, and other criteria
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Technologies Used

- TypeScript
- React.js (Frontend framework)
- CSS/SCSS (Styling)
- Axios (API requests)
- Jest (Testing)

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Hverma1206/Resume_Screener_frontend.git
   cd Resume_Screener_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
src/
├── assets/        # Images, fonts, and other static files
├── components/    # Reusable UI components
├── pages/         # Application pages
├── services/      # API services and business logic
├── utils/         # Utility functions
├── styles/        # Global styles and theme variables
├── types/         # TypeScript type definitions
└── App.tsx        # Main application component
```

## Usage

1. **Upload a Resume**: Use the upload button to select and upload a resume file
2. **View Analysis**: Once uploaded, the system will analyze the resume and display the results
3. **Manage Candidates**: Add notes, change status, and organize candidates through the dashboard
4. **Export Data**: Export candidate information and analysis results as needed

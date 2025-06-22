# EduAssistant

Education is the foundation of progress, yet students and educators often struggle with processing and understanding complex educational materials efficiently. The challenge lies in effectively summarizing content, creating assessments, and finding relevant references - tasks that are time-consuming and require significant effort.

EduAgent is an intelligent educational platform that leverages AI to transform how we learn and teach. By automating content summarization, quiz generation, and reference finding, EduAgent helps students grasp complex topics faster and assists educators in creating better learning materials.

## Problem that I am trying to solve

Students and educators face several challenges in the learning process:
- Processing large volumes of educational content can be overwhelming
- Creating meaningful assessments and quizzes is time-consuming
- Finding relevant references and citations requires extensive research
- Maintaining engagement with study materials can be difficult

EduAgent addresses these challenges by providing AI-powered tools that automate these tasks, allowing users to focus on understanding and applying knowledge rather than spending time on mechanical tasks.

## How to use EduAgent

1. Visit the EduAgent web application (live link on the side of the github page)
2. Upload or paste your educational content
3. Choose from our AI-powered tools:
   - **Summarizer**: Get concise summaries of your content
   - **Quiz Generator**: Create multiple-choice questions automatically
   - **Reference Finder**: Discover relevant citations and references
4. Download or save your results for future reference

## Technologies Used

### Frontend

#### Next.js 14
Next.js provides server-side rendering and static site generation capabilities, ensuring fast loading times and SEO optimization. Its file-based routing system makes the application structure intuitive and maintainable.

#### TypeScript
TypeScript adds static typing to JavaScript, improving code quality and developer experience by catching errors during development and enabling better code completion and documentation.

#### Tailwind CSS
Tailwind's utility-first approach allows for rapid UI development with a consistent design system, making it easy to create responsive and accessible interfaces.

### Backend

#### FastAPI
FastAPI is a modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints. It provides automatic interactive API documentation and is built on Starlette and Pydantic.

#### Agent Development Kit (ADK)
The Agent Development Kit (ADK) is a flexible and modular framework for developing and deploying AI agents. While optimized for Gemini and the Google ecosystem, ADK is model-agnostic and deployment-agnostic. We use ADK to create specialized agents for summarization, quiz generation, and reference finding, enabling complex coordination and delegation between different AI capabilities.

#### Docker
Docker containerization ensures consistent environments across development, testing, and production, making deployment and scaling more straightforward.

## How to run the app locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/EduAgent.git
   cd EduAgent
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env` in both `backend/EduAssistant_Agents` and `frontend` directories
   - Update the variables with your configuration

5. **Start the development servers**
   - Backend: `cd backend && uvicorn main:app --reload`
   - Frontend: `cd frontend && npm run dev`

6. Open [http://localhost:9001](http://localhost:9001) in your browser

## Contributing

We welcome contributions! To contribute to EduAgent:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request
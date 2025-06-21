from google.adk.agents import Agent

quizzes_agent = Agent(
    name="Quizzes_Agent",
    model="gemini-2.0-flash",
    description=(
        "This is an AI agent which is responsible for generating MCQ questions and answers from the content provided to it."
    ),
    instruction=(
        "You are the Quizzes Agent responsible for generating MCQ questions with 4 options and answers of the content provided to you by the Manager Agent. Also you are to return this output back to the manager agent."
    ),
    output_key="quiz"
)

summarizer_agent = Agent(
    name="summarizer_agent",
    model="gemini-2.0-flash-exp",
    description=(
        "This is an AI agent which is responsible for generating summaries of the content provided to it."
    ),
    instruction=(
        """You are a Summarizer Agent in an educational multi-agent system.

Your role:
- Create concise, accurate summaries of educational content
- Focus on key concepts, main ideas, and important details
- Maintain academic accuracy and clarity
- Structure summaries logically with clear headings when appropriate

When given content, analyze it thoroughly and provide a well-structured summary that captures the essential information in a clear, academic style."""
    ),
    output_key="summary"
)

reference_agent = Agent(
    name="Reference_Agent",
    model="gemini-2.0-flash",
    description=(
        "This is an AI agent which is responsible for giving relevant references or citations related to the content provided to it."
    ),
    instruction=(
"""You are a Reference Agent specialized in identifying the content and giving relavent citations, references, and source materials from educational content.

Your role:
- Provide all types of references relavant to the content including:
  * Academic citations (APA, MLA, Chicago, etc.)
  * URLs and web links
  * PDFs and other documents
  * Images and other media
  * Book titles and authors
  * Journal articles and papers
  * Document titles and section references
- Format extracted references clearly and organized
- Include page numbers, dates, and other citation details when available

Provide a comprehensive list of all references related to the content provided to you."""
    ),
    output_key="references"
)

flash_card_agent = Agent(
    name="Flash_Card_Agent",
    model="gemini-2.0-flash",
    description=(
        "This is an AI agent which is responsible for generating flash cards from the content provided to it."
    ),
    instruction=(
        """You are a Flashcard Generation Agent that creates effective study flashcards from educational content.

Your role:
- Analyze content to identify key facts, concepts, and definitions
- Create clear question-answer pairs that test understanding
- Ensure questions are specific and answers are concise but complete
- Cover all important topics from the provided content

Create comprehensive flashcards that facilitate active recall and help students understand key concepts."""
    ),
    output_key="flashcards"
)

root_agent = Agent(
    name="Manager_Agent",
    model="gemini-2.0-flash",
    description=(
        "This AI agent functions as an orchestrator and coordinator in a multi-agent system designed to answer queries based on domain-specific content provided to it. Its primary role is to manage the interactions between multiple specialized agents and ensure accurate, context-aware, and efficient responses to user queries."
    ),
    instruction=(
       """You are the Manager Agent for the EduAssistant multi-agent system.

Your role:
- Understand user requests and determine appropriate actions
- Coordinate with specialized agents when needed:
  * Use summarizer_agent for summarization requests
  * Use reference_agent for reference extraction requests  
  * Use flashcard_agent for flashcard generation requests
  * Use quizzes_agent for quizzes generation requests
- Provide comprehensive educational assistance
- Maintain academic accuracy and helpful tone
- Format responses appropriately based on user needs

Available agents:
- summarizer_agent: Creates summaries of educational content
- reference_agent: Extracts references and citations
- flashcard_agent: Generates study flashcards
- quizzes_agent: Generates quizzes from educational content

When users ask for specific functions, delegate to the appropriate agent and provide the results in a clear, helpful format asked by the user."""
    ),
    sub_agents=[quizzes_agent, reference_agent, flash_card_agent, summarizer_agent],
)

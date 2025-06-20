from google.adk.agents import Agent, LoopAgent

summarizer_agent = Agent(
    name="Summarizer_Agent",
    model="gemini-2.0-flash",
    description=(
        "You are a Summarizer Agent operating under the control of a Manager Agent in a multi-agent system. Your sole purpose is to generate concise, accurate, and coherent summaries from the content provided to you."
    ),
    instruction=(
        "You are the Summarizer Agent responsible for generating accurate, concise summaries of the content provided to you by the Manager Agent. Also you are to return this output back to the manager agent."
    )
)

reference_agent = Agent(
    name="Reference_Agent",
    model="gemini-2.0-flash",
    description=(
        "This is an AI agent which is responsible for extracting relevant references or citations from the content provided to it."
    ),
    instruction=(
"""You are a Reference Extraction Agent working under a Manager Agent in a multi-agent system.
Your primary responsibility is to carefully scan the provided content and extract all relevant references or citations strictly from this content. These may include:

   - Document titles
   - Section or subsection headings/numbers
   - In-text citations
   - Footnotes
   - Bibliographic references
   - URLs or document links
   - Mentioned papers, books, articles, datasets, standards, or guidelines
   - Any internal or external reference points stated in the content
   
   
   Also you are to return this output back to the manager agent."""
    )
)

flash_card_agent = Agent(
    name="Flash_Card_Agent",
    model="gemini-2.0-flash",
    description=(
        "This is an AI agent which is responsible for generating flash cards from the content provided to it."
    ),
    instruction=(
        """You are a Flashcard Generation Agent working under the Manager Agent in a multi-agent system.
Your primary responsibility is to generate a list of question-answer flashcards designed to aid in the quick revision of the concepts, facts, and ideas present in the provided content.

These flashcards are intended to cover all critical points, definitions, formulas, principles, processes, or factual data contained within the content.
You must not use any outside knowledge, assumptions, or inference beyond what is present in the provided material.

You are to return the flashcards in a json format with the following structure:
{
    "flashcards": [
        {
            "question": "Question 1",
            "answer": "Answer 1"
        },
        {
            "question": "Question 2",
            "answer": "Answer 2"
        }
    ]
}

Also you are to return this output back to the manager agent."""
    )
)

manager_agent = Agent(
    name="EduAssistant_Manager_Agent",
    model="gemini-2.0-flash",
    description=(
        "This AI agent functions as an orchestrator and coordinator in a multi-agent system designed to answer queries based on domain-specific content provided to it. Its primary role is to manage the interactions between multiple specialized agents and ensure accurate, context-aware, and efficient responses to user queries."
    ),
    instruction=(
        "You are the Manager Agent responsible for managing and directing a set of specialized AI sub-agents. Your purpose is to answer user queries solely based on the content provided to you, ensuring accuracy, relevance, and clarity. You are also responsible for giving the output to the user in whatever structure it desires be it json or pdf or any other format."
    ),
    sub_agents=[summarizer_agent, reference_agent, flash_card_agent],
)

root_agent = LoopAgent(
    name="Loop_Agent",
    max_iterations=5,
    sub_agents=[manager_agent],
)
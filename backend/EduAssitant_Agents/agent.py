import datetime
from zoneinfo import ZoneInfo
from google.adk.agents import Agent, LoopAgent

def get_weather(city: str) -> dict:
    """Retrieves the current weather report for a specified city.

    Args:
        city (str): The name of the city for which to retrieve the weather report.

    Returns:
        dict: status and result or error msg.
    """
    if city.lower() == "new york":
        return {
            "status": "success",
            "report": (
                "The weather in New York is sunny with a temperature of 25 degrees"
                " Celsius (77 degrees Fahrenheit)."
            ),
        }
    else:
        return {
            "status": "error",
            "error_message": f"Weather information for '{city}' is not available.",
        }


def get_current_time(city: str) -> dict:
    """Returns the current time in a specified city.

    Args:
        city (str): The name of the city for which to retrieve the current time.

    Returns:
        dict: status and result or error msg.
    """

    if city.lower() == "new york":
        tz_identifier = "America/New_York"
    else:
        return {
            "status": "error",
            "error_message": (
                f"Sorry, I don't have timezone information for {city}."
            ),
        }

    tz = ZoneInfo(tz_identifier)
    now = datetime.datetime.now(tz)
    report = (
        f'The current time in {city} is {now.strftime("%Y-%m-%d %H:%M:%S %Z%z")}'
    )
    return {"status": "success", "report": report}

summarizer_agent = Agent(
    name="Summarizer_Agent",
    model="gemini-2.0-flash",
    description=(
        "You are a Summarizer Agent operating under the control of a Manager Agent in a multi-agent system. Your sole purpose is to generate concise, accurate, and coherent summaries from the content provided to you."
    ),
    instruction=(
        "You are the Summarizer Agent responsible for generating accurate, concise summaries of the content provided by the Manager Agent."
    )
)

manager_agent = Agent(
    name="EduAssistant_Manager_Agent",
    model="gemini-2.0-flash",
    description=(
        "This AI agent functions as an orchestrator and coordinator in a multi-agent system designed to answer queries based on domain-specific content provided to it. Its primary role is to manage the interactions between multiple specialized agents and ensure accurate, context-aware, and efficient responses to user queries."
    ),
    instruction=(
        "You are the Manager Agent responsible for managing and directing a set of specialized AI sub-agents. Your purpose is to answer user queries solely based on the content provided to you, ensuring accuracy, relevance, and clarity."
    ),
    sub_agents=[summarizer_agent],
)

root_agent = LoopAgent(
    name="Loop_Agent",
    max_iterations=5,
    sub_agents=[manager_agent],
)
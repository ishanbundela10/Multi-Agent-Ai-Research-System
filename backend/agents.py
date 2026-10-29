from langchain.agents import create_agent
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from tools import web_search, scrape_url
from dotenv import load_dotenv
load_dotenv()

# model setup
llm = ChatMistralAI(model = "open-mistral-7b", temperature=0)

# 1st agent
def build_search_agent():
    return create_agent(
        model = llm,
        tools=[web_search],

    )

# 2nd agent
def build_search_reader_agent():
    return create_agent(
        model=llm,
        tools=[scrape_url]
    )

# LCEL pipeline (writer chain)
writer_prompt = ChatPromptTemplate.from_messages([
    ('system', 'you are an expert research writer . Write clear, structured. and insightful reports.'),
    ('human',"""Write a detailed research report on the topic below.

Topic: {topic}

Research Gathered:
{research}

Structure the report as:
- Introduction
- Key Findings (minimum 3 well-explained points)
- Conclusion
- Sources (list all URLs found in the research)

Be detailed, factual and professional."""),
])

# when we do writer_chain.invoke('topic', 'research') we have to give topic and research
writer_chain = writer_prompt | llm | StrOutputParser()

#critic chain -> we want critisisum if any promblem is inside then report to me
critic_prompt = ChatPromptTemplate.from_messages([
    ('system', 'You are a sharp and constructive research critic. Be honest and specific.'),
    ('human', """Review the research report below and evaluate it strictly.

Report:
{report}

Respond in this exact format:

Score: X/10

Strengths:
- ...
- ...

Areas to Improve:
- ...
- ...

One line verdict:
..."""),
])

critic_chain = critic_prompt | llm | StrOutputParser()
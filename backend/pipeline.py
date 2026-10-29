import asyncio
import json
from typing import AsyncGenerator, Dict, Any

# Import agents and chains from user's agents.py
try:
    from agents import build_search_agent, build_search_reader_agent, critic_chain, writer_chain
except ImportError:
    # Fallback placeholder if agents.py is not yet placed in the directory
    build_search_agent = None
    build_search_reader_agent = None
    critic_chain = None
    writer_chain = None


def _clean_content_to_str(raw: Any) -> str:
    """Helper to convert message content (string, list of dicts, or text blocks) into a clean string."""
    if raw is None:
        return ""
    if isinstance(raw, str):
        return raw.strip()
    if isinstance(raw, list):
        parts = []
        for item in raw:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                # Handles LangChain/Mistral text blocks: {'type': 'text', 'text': '...'}
                if "text" in item and isinstance(item["text"], str):
                    parts.append(item["text"])
                elif "content" in item and isinstance(item["content"], str):
                    parts.append(item["content"])
                else:
                    parts.append(str(item))
            elif hasattr(item, "text"):
                parts.append(str(item.text))
            elif hasattr(item, "content"):
                parts.append(_clean_content_to_str(item.content))
            else:
                parts.append(str(item))
        return "\n".join(p for p in parts if p).strip()
    return str(raw).strip()


def extract_content(output: Any) -> str:
    """Helper to safely extract string content from LangChain agent/chain output."""
    if output is None:
        return ""

    # Case 1: Dict with 'messages' list (LangChain create_agent / Pregel state)
    if isinstance(output, dict) and "messages" in output:
        msgs = output["messages"]
        if msgs and len(msgs) > 0:
            last_msg = msgs[-1]
            raw = getattr(last_msg, "content", last_msg)
            return _clean_content_to_str(raw)
        return ""

    # Case 2: Dict with 'text'
    if isinstance(output, dict) and "text" in output:
        return _clean_content_to_str(output["text"])

    # Case 3: Object with 'content' (like AIMessage or BaseMessage)
    if hasattr(output, "content"):
        return _clean_content_to_str(output.content)

    return _clean_content_to_str(output)


def run_research_pipeline(topic: str) -> Dict[str, Any]:
    """
    Synchronous research pipeline matching the user's implementation.
    Executes search, reader (scraper), writer, and critic sequentially.
    """
    if build_search_agent is None:
        raise RuntimeError("Agents module not found. Make sure agents.py is in the Python path.")

    state = {
        "topic": topic,
        "search_results": "",
        "scraped_content": "",
        "report": "",
        "feedback": ""
    }

    # Step 1: Search Agent
    print("\n" + "=" * 50)
    print("Step 1: Search agent is working ...")
    print("=" * 50)
    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]
    })
    state["search_results"] = extract_content(search_result)
    print("\nSearch results:\n", state["search_results"][:300], "...")

    # Step 2: Reader Agent (Web Scraper)
    print("\n" + "=" * 50)
    print("Step 2: Reader agent is scraping top resources ...")
    print("=" * 50)
    reader_agent = build_search_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [(
            "user",
            f"Based on the following search results about '{topic}', "
            f"pick the most relevant URL and scrape it for deeper content.\n\n"
            f"Search Results:\n{state['search_results'][:800]}"
        )]
    })
    state["scraped_content"] = extract_content(reader_result)
    print("\nScraped content:\n", state["scraped_content"][:300], "...")

    # Step 3: Writer Chain
    print("\n" + "=" * 50)
    print("Step 3: Writer is drafting the report ...")
    print("=" * 50)
    research_combined = (
        f"SEARCH RESULT:\n{state['search_results']}\n\n"
        f"DETAILED SCRAPED CONTENT:\n{state['scraped_content']}"
    )
    writer_result = writer_chain.invoke({
        "topic": topic,
        "research": research_combined
    })
    state["report"] = extract_content(writer_result)
    print("\nFinal report preview:\n", state["report"][:300], "...")

    # Step 4: Critic Chain
    print("\n" + "=" * 50)
    print("Step 4: Critic is reviewing the report ...")
    print("=" * 50)
    critic_result = critic_chain.invoke({
        "report": state["report"]
    })
    state["feedback"] = extract_content(critic_result)
    print("\nCritic review preview:\n", state["feedback"][:300], "...")

    return state


async def run_research_pipeline_stream(topic: str) -> AsyncGenerator[str, None]:
    """
    Streaming generator for Server-Sent Events (SSE).
    Yields JSON event updates at each stage so the React frontend can render live progress.
    """
    if build_search_agent is None:
        yield f"event: error\ndata: {json.dumps({'error': 'agents.py not found or configured'})}\n\n"
        return

    state = {
        "topic": topic,
        "search_results": "",
        "scraped_content": "",
        "report": "",
        "feedback": ""
    }

    try:
        # Step 1: Search
        step1_payload = {
            "step": 1,
            "status": "running",
            "title": "Searching Tavily",
            "message": f"Searching latest reliable news for '{topic}'..."
        }
        yield f"event: step\ndata: {json.dumps(step1_payload)}\n\n"
        search_agent = build_search_agent()
        search_result = await asyncio.to_thread(
            search_agent.invoke,
            {"messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]}
        )
        state["search_results"] = extract_content(search_result)
        step1_done = {
            "step": 1,
            "status": "completed",
            "title": "Search Complete",
            "data": state["search_results"]
        }
        yield f"event: step_done\ndata: {json.dumps(step1_done)}\n\n"

        # Step 2: Scraping
        step2_payload = {
            "step": 2,
            "status": "running",
            "title": "Scraping Resources",
            "message": "Reader agent is extracting in-depth content from top URL..."
        }
        yield f"event: step\ndata: {json.dumps(step2_payload)}\n\n"
        reader_agent = build_search_reader_agent()
        reader_result = await asyncio.to_thread(
            reader_agent.invoke,
            {"messages": [(
                "user",
                f"Based on the following search results about '{topic}', "
                f"pick the most relevant URL and scrape it for deeper content.\n\n"
                f"Search Results:\n{state['search_results'][:800]}"
            )]}
        )
        state["scraped_content"] = extract_content(reader_result)
        step2_done = {
            "step": 2,
            "status": "completed",
            "title": "Scraping Complete",
            "data": state["scraped_content"]
        }
        yield f"event: step_done\ndata: {json.dumps(step2_done)}\n\n"

        # Step 3: Writer
        step3_payload = {
            "step": 3,
            "status": "running",
            "title": "Synthesizing Report",
            "message": "Writer is drafting comprehensive analysis report..."
        }
        yield f"event: step\ndata: {json.dumps(step3_payload)}\n\n"
        research_combined = (
            f"SEARCH RESULT:\n{state['search_results']}\n\n"
            f"DETAILED SCRAPED CONTENT:\n{state['scraped_content']}"
        )
        writer_result = await asyncio.to_thread(
            writer_chain.invoke,
            {"topic": topic, "research": research_combined}
        )
        state["report"] = extract_content(writer_result)
        step3_done = {
            "step": 3,
            "status": "completed",
            "title": "Draft Ready",
            "data": state["report"]
        }
        yield f"event: step_done\ndata: {json.dumps(step3_done)}\n\n"

        # Step 4: Critic
        step4_payload = {
            "step": 4,
            "status": "running",
            "title": "Critic Review",
            "message": "Critic agent is analyzing factual accuracy and coherence..."
        }
        yield f"event: step\ndata: {json.dumps(step4_payload)}\n\n"
        critic_result = await asyncio.to_thread(
            critic_chain.invoke,
            {"report": state["report"]}
        )
        state["feedback"] = extract_content(critic_result)
        step4_done = {
            "step": 4,
            "status": "completed",
            "title": "Review Complete",
            "data": state["feedback"]
        }
        yield f"event: step_done\ndata: {json.dumps(step4_done)}\n\n"

        # Final full payload
        yield f"event: complete\ndata: {json.dumps(state)}\n\n"

    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"


if __name__ == "__main__":
    topic_input = input("\nEnter a research topic: ")
    res = run_research_pipeline(topic_input)
    print("\nResult received:\n", res)

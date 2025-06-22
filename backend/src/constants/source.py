from datetime import datetime
from uuid import uuid4
from pytz import UTC
from typing import List
from src.models.source import Source
import json

DOCUMENT_TYPES = {"document", "pdf", "ppt", "pptx", "doc", "docx"}
AUDIO_TYPES = {"audio", "mp3", "mp4", "webm", "wav", "voice_note"}
TEXT_TYPES = {"txt", "md", "website"}

MEDIA_TYPE_MAP = {
    # Documents
    "pdf": "application/pdf",
    "document": "application/pdf",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "txt": "text/plain",
    "rtf": "application/rtf",
    "odt": "application/vnd.oasis.opendocument.text",
    "md": "text/markdown",
    "csv": "text/csv",
    "tsv": "text/tab-separated-values",
    "json": "application/json",
    "xml": "application/xml",
    # Images
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "bmp": "image/bmp",
    "webp": "image/webp",
    "tiff": "image/tiff",
    "svg": "image/svg+xml",
    # Audio
    "mp3": "audio/mpeg",
    "audio": "audio/mpeg",
    "voice_note": "audio/webm",  # internal voice note format
    "wav": "audio/wav",
    "aac": "audio/aac",
    "ogg": "audio/ogg",
    "flac": "audio/flac",
    "m4a": "audio/mp4",
    # Video
    "mp4": "video/mp4",
    "mov": "video/quicktime",
    "avi": "video/x-msvideo",
    "wmv": "video/x-ms-wmv",
    "webm": "video/webm",
    "mkv": "video/x-matroska",
    # Archives
    "zip": "application/zip",
    "tar": "application/x-tar",
    "gz": "application/gzip",
    "rar": "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    # Code
    "html": "text/html",
    "css": "text/css",
    "js": "application/javascript",
    "ts": "application/typescript",
    "py": "text/x-python",
    "java": "text/x-java-source",
    "c": "text/x-c",
    "cpp": "text/x-c++",
    # Fonts
    "woff": "font/woff",
    "woff2": "font/woff2",
    "ttf": "font/ttf",
    "otf": "font/otf",
}


def create_onboarding_sources(web_id: str, user_id: str):
    sources: List[Source] = []
    for source in ONBOARDING_SOURCES:
        sourceId = str(uuid4())
        source_to_insert = {
            "sourceId": sourceId,
            "webId": web_id,
            "userId": user_id,
            "name": source["name"],
            "content": source["content"],
            "description": source.get("description") or None,
            "type": source["type"],
            "url": source.get("url") or None,
            "created": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            "ogImage": source.get("ogImage") or None,
            "ogDescription": source.get("ogDescription") or None,
            "ogTitle": source.get("ogTitle") or None,
            "favicon": source.get("favicon") or None,
            "size": source.get("size") or 0,
        }
        source_to_insert = Source(**source_to_insert)
        sources.append(source_to_insert)
    return sources


MEMORY_TRANSCRIPT = [
    {
        "text": "Let&#39;s start with just simply your",
        "duration": "4.32",
        "offset": "0.08",
        "lang": "en",
    },
    {
        "text": "reaction to the AI infrastructure deals",
        "duration": "6.00",
        "offset": "1.76",
        "lang": "en",
    },
    {
        "text": "of the last 24 hours. US technology",
        "duration": "6.00",
        "offset": "4.40",
        "lang": "en",
    },
    {
        "text": "going to the Gulf and setting up data",
        "duration": "4.48",
        "offset": "7.76",
        "lang": "en",
    },
    {
        "text": "centers and AI development in that",
        "duration": "4.24",
        "offset": "10.40",
        "lang": "en",
    },
    {
        "text": "nation. Well, thank you Ed. It&#39;s always",
        "duration": "6.00",
        "offset": "12.24",
        "lang": "en",
    },
    {
        "text": "great to be here and these new deals are",
        "duration": "6.60",
        "offset": "14.64",
        "lang": "en",
    },
    {
        "text": "testament to the fact that AI artificial",
        "duration": "5.60",
        "offset": "18.24",
        "lang": "en",
    },
    {
        "text": "intelligence is not just a matter of",
        "duration": "4.84",
        "offset": "21.24",
        "lang": "en",
    },
    {
        "text": "corporate success. It is a matter of",
        "duration": "4.96",
        "offset": "23.84",
        "lang": "en",
    },
    {
        "text": "national imperative. It is a great sign",
        "duration": "5.28",
        "offset": "26.08",
        "lang": "en",
    },
    {
        "text": "of the importance of this industry. I",
        "duration": "5.52",
        "offset": "28.80",
        "lang": "en",
    },
    {
        "text": "think back to a decade ago and we had",
        "duration": "5.44",
        "offset": "31.36",
        "lang": "en",
    },
    {
        "text": "concerns about the US staying ahead of",
        "duration": "4.96",
        "offset": "34.32",
        "lang": "en",
    },
    {
        "text": "AI. There are really four key pillars to",
        "duration": "4.96",
        "offset": "36.80",
        "lang": "en",
    },
    {
        "text": "AI strength. There&#39;s the compute,",
        "duration": "4.88",
        "offset": "39.28",
        "lang": "en",
    },
    {
        "text": "there&#39;s the power, there&#39;s the data, and",
        "duration": "4.72",
        "offset": "41.76",
        "lang": "en",
    },
    {
        "text": "there&#39;s the algorithms. Thinking back to",
        "duration": "4.56",
        "offset": "44.16",
        "lang": "en",
    },
    {
        "text": "that last wave of AI, the reason why the",
        "duration": "4.72",
        "offset": "46.48",
        "lang": "en",
    },
    {
        "text": "United States has been so far ahead is",
        "duration": "5.44",
        "offset": "48.72",
        "lang": "en",
    },
    {
        "text": "that fourth pillar, those algorithms. So",
        "duration": "5.60",
        "offset": "51.20",
        "lang": "en",
    },
    {
        "text": "as we develop new technological allies",
        "duration": "7.04",
        "offset": "54.16",
        "lang": "en",
    },
    {
        "text": "around the world for compute, for power,",
        "duration": "6.32",
        "offset": "56.80",
        "lang": "en",
    },
    {
        "text": "for data, it&#39;s really important that we",
        "duration": "4.40",
        "offset": "61.20",
        "lang": "en",
    },
    {
        "text": "stay on the absolute forefront when it",
        "duration": "4.40",
        "offset": "63.12",
        "lang": "en",
    },
    {
        "text": "comes to algorithmic advancement. We",
        "duration": "3.52",
        "offset": "65.60",
        "lang": "en",
    },
    {
        "text": "have the best researchers in the world.",
        "duration": "3.04",
        "offset": "67.52",
        "lang": "en",
    },
    {
        "text": "We have the best engineers in the world.",
        "duration": "2.72",
        "offset": "69.12",
        "lang": "en",
    },
    {
        "text": "Okay, I&#39;m sorry to interrupt you,",
        "duration": "2.48",
        "offset": "70.56",
        "lang": "en",
    },
    {
        "text": "Constantine. We&#39;ve got some breaking",
        "duration": "3.36",
        "offset": "71.84",
        "lang": "en",
    },
    {
        "text": "news crossing the terminal from the",
        "duration": "4.40",
        "offset": "73.04",
        "lang": "en",
    },
    {
        "text": "White House. President Trump has secured",
        "duration": "5.76",
        "offset": "75.20",
        "lang": "en",
    },
    {
        "text": "$1.2 trillion in economic commitments in",
        "duration": "6.64",
        "offset": "77.44",
        "lang": "en",
    },
    {
        "text": "Qatar. Uh the Katar commitment is $1.2",
        "duration": "5.44",
        "offset": "80.96",
        "lang": "en",
    },
    {
        "text": "trillion according to the White House.",
        "duration": "5.00",
        "offset": "84.08",
        "lang": "en",
    },
    {
        "text": "There are economic deals worth",
        "duration": "4.72",
        "offset": "86.40",
        "lang": "en",
    },
    {
        "text": "$243.5 billion. This is something the",
        "duration": "3.72",
        "offset": "89.08",
        "lang": "en",
    },
    {
        "text": "president has announced on the ground in",
        "duration": "2.96",
        "offset": "91.12",
        "lang": "en",
    },
    {
        "text": "Doha. We were just speaking with",
        "duration": "3.28",
        "offset": "92.80",
        "lang": "en",
    },
    {
        "text": "Bloomberg&#39;s Amarie Hordern who is in",
        "duration": "4.88",
        "offset": "94.08",
        "lang": "en",
    },
    {
        "text": "Doha Qatar and she noted that this is",
        "duration": "4.00",
        "offset": "96.08",
        "lang": "en",
    },
    {
        "text": "what&#39;s pending. We don&#39;t have the",
        "duration": "3.28",
        "offset": "98.96",
        "lang": "en",
    },
    {
        "text": "specifics in terms of sector in terms of",
        "duration": "4.00",
        "offset": "100.08",
        "lang": "en",
    },
    {
        "text": "companies involved but as we get that",
        "duration": "3.36",
        "offset": "102.24",
        "lang": "en",
    },
    {
        "text": "we&#39;ll bring it to you and right now",
        "duration": "2.80",
        "offset": "104.08",
        "lang": "en",
    },
    {
        "text": "we&#39;ll go back to the conversation we",
        "duration": "3.12",
        "offset": "105.60",
        "lang": "en",
    },
    {
        "text": "were having which is there is US",
        "duration": "3.92",
        "offset": "106.88",
        "lang": "en",
    },
    {
        "text": "leadership in the field of AI",
        "duration": "4.16",
        "offset": "108.72",
        "lang": "en",
    },
    {
        "text": "infrastructure. You basically broke down",
        "duration": "4.72",
        "offset": "110.80",
        "lang": "en",
    },
    {
        "text": "the four categories. Yes. One that is",
        "duration": "5.68",
        "offset": "112.88",
        "lang": "en",
    },
    {
        "text": "increasingly crossing my desk is AI",
        "duration": "8.16",
        "offset": "115.52",
        "lang": "en",
    },
    {
        "text": "memory in the context of agentic AI.",
        "duration": "6.96",
        "offset": "118.56",
        "lang": "en",
    },
    {
        "text": "This is something that people say we",
        "duration": "4.08",
        "offset": "123.68",
        "lang": "en",
    },
    {
        "text": "need to invest in this and solve it. I",
        "duration": "3.84",
        "offset": "125.52",
        "lang": "en",
    },
    {
        "text": "personally don&#39;t have the expertise or",
        "duration": "3.52",
        "offset": "127.76",
        "lang": "en",
    },
    {
        "text": "academic grounding to understand it. Why",
        "duration": "3.60",
        "offset": "129.36",
        "lang": "en",
    },
    {
        "text": "is your industry talking about it?",
        "duration": "3.60",
        "offset": "131.28",
        "lang": "en",
    },
    {
        "text": "You&#39;re exactly right, Ed. So there&#39;s",
        "duration": "4.24",
        "offset": "132.96",
        "lang": "en",
    },
    {
        "text": "compute, there&#39;s obviously the data,",
        "duration": "3.76",
        "offset": "134.88",
        "lang": "en",
    },
    {
        "text": "there&#39;s obviously the power and the",
        "duration": "3.28",
        "offset": "137.20",
        "lang": "en",
    },
    {
        "text": "algorithms, but another important",
        "duration": "4.16",
        "offset": "138.64",
        "lang": "en",
    },
    {
        "text": "component is memory. Because when you",
        "duration": "4.40",
        "offset": "140.48",
        "lang": "en",
    },
    {
        "text": "interface with an agent, you want it to",
        "duration": "4.32",
        "offset": "142.80",
        "lang": "en",
    },
    {
        "text": "remember you, of course, but it also has",
        "duration": "4.96",
        "offset": "144.88",
        "lang": "en",
    },
    {
        "text": "to remember itself. Think about a",
        "duration": "4.56",
        "offset": "147.12",
        "lang": "en",
    },
    {
        "text": "physician, for example. Every time they",
        "duration": "4.24",
        "offset": "149.84",
        "lang": "en",
    },
    {
        "text": "interface with a patient, an agent is",
        "duration": "4.56",
        "offset": "151.68",
        "lang": "en",
    },
    {
        "text": "going to be able to help them think back",
        "duration": "4.16",
        "offset": "154.08",
        "lang": "en",
    },
    {
        "text": "to previous interactions, not just what",
        "duration": "4.24",
        "offset": "156.24",
        "lang": "en",
    },
    {
        "text": "the patient said, not just their vitals,",
        "duration": "4.00",
        "offset": "158.24",
        "lang": "en",
    },
    {
        "text": "not just data about the patient, but",
        "duration": "4.48",
        "offset": "160.48",
        "lang": "en",
    },
    {
        "text": "over time using tools and companies like",
        "duration": "4.56",
        "offset": "162.24",
        "lang": "en",
    },
    {
        "text": "open evidence, the physician&#39;s going to",
        "duration": "3.60",
        "offset": "164.96",
        "lang": "en",
    },
    {
        "text": "be able to remember exactly what the",
        "duration": "3.68",
        "offset": "166.80",
        "lang": "en",
    },
    {
        "text": "interaction was like, how to communicate",
        "duration": "3.60",
        "offset": "168.56",
        "lang": "en",
    },
    {
        "text": "to the patient, and memory is going to",
        "duration": "3.44",
        "offset": "170.48",
        "lang": "en",
    },
    {
        "text": "become more and more important. The",
        "duration": "2.96",
        "offset": "172.16",
        "lang": "en",
    },
    {
        "text": "question is, where does all of this",
        "duration": "3.12",
        "offset": "173.92",
        "lang": "en",
    },
    {
        "text": "activity take place? Right? The subject",
        "duration": "4.96",
        "offset": "175.12",
        "lang": "en",
    },
    {
        "text": "of today&#39;s Bloomberg big take is",
        "duration": "6.16",
        "offset": "177.04",
        "lang": "en",
    },
    {
        "text": "deepseek, right? And the big take",
        "duration": "5.76",
        "offset": "180.08",
        "lang": "en",
    },
    {
        "text": "presents the hypothesis that the",
        "duration": "5.12",
        "offset": "183.20",
        "lang": "en",
    },
    {
        "text": "company&#39;s sudden emergence last month",
        "duration": "5.60",
        "offset": "185.84",
        "lang": "en",
    },
    {
        "text": "illustrated how China&#39;s industry is",
        "duration": "6.80",
        "offset": "188.32",
        "lang": "en",
    },
    {
        "text": "thriving irrespective of US political",
        "duration": "5.52",
        "offset": "191.44",
        "lang": "en",
    },
    {
        "text": "policy. You know, Jensen told me in",
        "duration": "4.32",
        "offset": "195.12",
        "lang": "en",
    },
    {
        "text": "March more than 50% of AI researchers",
        "duration": "4.48",
        "offset": "196.96",
        "lang": "en",
    },
    {
        "text": "are in China. When you think about the",
        "duration": "4.08",
        "offset": "199.44",
        "lang": "en",
    },
    {
        "text": "issues you&#39;ve outlined, do you agree",
        "duration": "4.08",
        "offset": "201.44",
        "lang": "en",
    },
    {
        "text": "with that hypothesis presented that",
        "duration": "5.12",
        "offset": "203.52",
        "lang": "en",
    },
    {
        "text": "China&#39;s AI industry is thriving, but",
        "duration": "5.04",
        "offset": "205.52",
        "lang": "en",
    },
    {
        "text": "also looking at the same issues that",
        "duration": "4.32",
        "offset": "208.64",
        "lang": "en",
    },
    {
        "text": "your industry is looking at here? Well,",
        "duration": "3.92",
        "offset": "210.56",
        "lang": "en",
    },
    {
        "text": "it is true that they have amazing",
        "duration": "3.36",
        "offset": "212.96",
        "lang": "en",
    },
    {
        "text": "researchers there, but it&#39;s also true",
        "duration": "3.92",
        "offset": "214.48",
        "lang": "en",
    },
    {
        "text": "that we have some of the most creative,",
        "duration": "4.08",
        "offset": "216.32",
        "lang": "en",
    },
    {
        "text": "brilliant researchers on the planet.",
        "duration": "4.96",
        "offset": "218.40",
        "lang": "en",
    },
    {
        "text": "Here&#39;s an example. Just recently, we",
        "duration": "5.52",
        "offset": "220.40",
        "lang": "en",
    },
    {
        "text": "hosted our annual AI conference, Seoia",
        "duration": "4.96",
        "offset": "223.36",
        "lang": "en",
    },
    {
        "text": "AI Ascent. We brought together 150 of",
        "duration": "4.16",
        "offset": "225.92",
        "lang": "en",
    },
    {
        "text": "the top minds in the industry. This is",
        "duration": "3.84",
        "offset": "228.32",
        "lang": "en",
    },
    {
        "text": "everyone from Jensen Hang and Sam Alman",
        "duration": "4.80",
        "offset": "230.08",
        "lang": "en",
    },
    {
        "text": "to the young upandcomers. And the number",
        "duration": "5.52",
        "offset": "232.16",
        "lang": "en",
    },
    {
        "text": "one technical topic of the conference",
        "duration": "6.16",
        "offset": "234.88",
        "lang": "en",
    },
    {
        "text": "was a concept called tool use. Tool use",
        "duration": "5.76",
        "offset": "237.68",
        "lang": "en",
    },
    {
        "text": "is all about AIs working with each",
        "duration": "4.48",
        "offset": "241.04",
        "lang": "en",
    },
    {
        "text": "other. We&#39;re teaching the computer how",
        "duration": "4.48",
        "offset": "243.44",
        "lang": "en",
    },
    {
        "text": "to use the computer. And there was",
        "duration": "4.00",
        "offset": "245.52",
        "lang": "en",
    },
    {
        "text": "fortunately a big advancement in our",
        "duration": "3.60",
        "offset": "247.92",
        "lang": "en",
    },
    {
        "text": "industry over the past few months. A new",
        "duration": "5.20",
        "offset": "249.52",
        "lang": "en",
    },
    {
        "text": "protocol called model context protocol.",
        "duration": "6.40",
        "offset": "251.52",
        "lang": "en",
    },
    {
        "text": "Think about each AI agent as an expert.",
        "duration": "4.72",
        "offset": "254.72",
        "lang": "en",
    },
    {
        "text": "Think about every piece of software as",
        "duration": "4.16",
        "offset": "257.92",
        "lang": "en",
    },
    {
        "text": "an expert. Your CRM is really good at",
        "duration": "4.16",
        "offset": "259.44",
        "lang": "en",
    },
    {
        "text": "remembering your previous interactions",
        "duration": "3.76",
        "offset": "262.08",
        "lang": "en",
    },
    {
        "text": "with customers, for example. The issue",
        "duration": "4.80",
        "offset": "263.60",
        "lang": "en",
    },
    {
        "text": "is that those experts don&#39;t necessarily",
        "duration": "4.96",
        "offset": "265.84",
        "lang": "en",
    },
    {
        "text": "speak the the same language. What this",
        "duration": "5.04",
        "offset": "268.40",
        "lang": "en",
    },
    {
        "text": "new protocol allows is a universal",
        "duration": "5.20",
        "offset": "270.80",
        "lang": "en",
    },
    {
        "text": "translation mechanism so that all these",
        "duration": "4.64",
        "offset": "273.44",
        "lang": "en",
    },
    {
        "text": "AI agents and all these softwares can",
        "duration": "4.56",
        "offset": "276.00",
        "lang": "en",
    },
    {
        "text": "communicate. That is pivotal to us as",
        "duration": "4.48",
        "offset": "278.08",
        "lang": "en",
    },
    {
        "text": "the United States staying ahead. We have",
        "duration": "3.92",
        "offset": "280.56",
        "lang": "en",
    },
    {
        "text": "to be working together. I&#39;ll give an",
        "duration": "3.52",
        "offset": "282.56",
        "lang": "en",
    },
    {
        "text": "example of what this protocol could do",
        "duration": "3.52",
        "offset": "284.48",
        "lang": "en",
    },
    {
        "text": "for us. We have a portfolio company",
        "duration": "4.16",
        "offset": "286.08",
        "lang": "en",
    },
    {
        "text": "called Rocks. It helps the best sellers",
        "duration": "4.08",
        "offset": "288.00",
        "lang": "en",
    },
    {
        "text": "do really great research before meeting",
        "duration": "4.08",
        "offset": "290.24",
        "lang": "en",
    },
    {
        "text": "with a potential buyer. They can not",
        "duration": "4.72",
        "offset": "292.08",
        "lang": "en",
    },
    {
        "text": "only do that research now, they use MCP",
        "duration": "4.56",
        "offset": "294.32",
        "lang": "en",
    },
    {
        "text": "to connect and actually make a pitch",
        "duration": "4.80",
        "offset": "296.80",
        "lang": "en",
    },
    {
        "text": "deck directly on the specific needs of",
        "duration": "4.96",
        "offset": "298.88",
        "lang": "en",
    },
    {
        "text": "that user. They can even plug into",
        "duration": "4.72",
        "offset": "301.60",
        "lang": "en",
    },
    {
        "text": "cognition or cloud code and write an",
        "duration": "4.64",
        "offset": "303.84",
        "lang": "en",
    },
    {
        "text": "entire demo. That&#39;s how we stay ahead of",
        "duration": "4.24",
        "offset": "306.32",
        "lang": "en",
    },
    {
        "text": "the curve in AI collaboration and",
        "duration": "3.92",
        "offset": "308.48",
        "lang": "en",
    },
    {
        "text": "working together as researchers and",
        "duration": "4.08",
        "offset": "310.56",
        "lang": "en",
    },
    {"text": "engineers.", "duration": "2.24", "offset": "312.40", "lang": "en"},
]

ONBOARDING_SOURCES = [
    {
        "name": "Welcome to Spydr!",
        "content": (
            "## Welcome to Spydr, your personal memory store and digital navigator.\n"
            "### Some things to know:\n"
            "- Spydr is your universal context store, a centralized hub where all your context lives and can be accessed by ANY AI model, anywhere.\n"
            "- We're building toward an interoperable future where instead of paying for siloed apps, you store your memory centrally and bring it to whichever AI platform is most convenient.\n"
            "- Our platform transforms how you interact with information by creating dynamic 'webs' of knowledge that mirror your unique thought processes.\n"
            "- Share and collaborate with ease to aid in democratizing access to structured insights and context across all AI interactions.\n"
            "- Spydr bridges human understanding and AI reliability, positioning you ahead of the paradigm shift toward standardized AI tool and data integration.\n"
            "- Our Philosophy: Everything is Linkable.\n"
        ),
        "url": None,
        "type": "note",
    },
    {
        "name": "How to use Spydr and Charlotte AI",
        "content": (
            "### Create a new web:\n"
            "1. Create a new web on the sidebar (navbar if on mobile) by clicking the plus icon or '⌘ + x' on Mac ('^ + x' on Windows).\n"
            "2. Your AI assistant has access to all aspects of your web, so try to keep the title and description relevant and descriptive as possible.\n"
            "3. Using the '+' button, add any number of sources to your web.\n"
            "4. The Autolinker will automatically find relevant connections for your sources.\n"
            "5. You can also manually link sources as you see fit.\n"
            "**We are adding the ability to index a lot more types of content soon! Stay tuned.**\n"
            "### Iterate on other webs:\n"
            "1. Click on the 'iterate' button or icon (next to the like button) to iterate on it.\n"
            "2. This will create a copy of the original web that you can use as a starting point for a new context.\n"
            "### Charlotte\n"
            "- Charlotte is your personal AI assistant. She's here to help you understand, explore, and leverage your memory stores.\n"
            "- She is located in the bottom right corner of the screen.\n"
            "- Click on her to start a conversation.\n"
        ),
        "url": None,
        "type": "note",
    },
    {
        "name": "Yann Lecun On The Merits of Open Source Ideas",
        "type": "website",
        "url": "https://x.com/ylecun/status/1882946965761347885?s=61",
        "content": "You misunderstand how open research and source work.\n"
        "The idea is that everyone profits from everyone else's ideas.\n"
        "No one `outpaces` anyone and no country `loses` to another.\n"
        "No one has a monopoly on good ideas.",
        "ogImage": "",
        "ogDescription": "",
        "ogTitle": "",
        "favicon": "",
    },
    {
        "name": "Weaving the Annotated Web - Jon Udell",
        "type": "website",
        "url": "https://blog.jonudell.net/2017/05/05/weaving-the-annotated-web/",
        "content": """Weaving the Annotated Web - Jon Udell\nWeaving the annotated web – Jon Udell Skip to content Jon Udell Strategies for Internet citizens Menu index Weaving the annotated web 5 May 2017 1 Sep 2021 ~ Jon Udell In 1997, at the first Perl Conference, which became OSCON the following year, my friend Andrew Schulman and I both gave talks on how the web was becoming a platform not only for publishing, but also for networked software.
    Here’s the slide I remember from Andrew’s talk: http://wwwapps.ups.com/tracking/tracking.cgi?tracknum=1Z742E220310270799 The only thing on it was a UPS tracking URL. Andrew asked us to stare at it for a while and think about what it really meant. “This is amazing!” he kept saying, over and over. “Every UPS package now has its own home page on the world wide web!” It wasn’t just that the package had a globally unique identifier. It named a particular instance of a business process.
    It made the context surrounding the movement of that package through the UPS system available to UPS employees and customers who accessed it in their browsers. And it made that same context available to the Perl programs that some of us were writing to scrape web pages, extract their data, and repurpose it. As we all soon learned, URLs can point to many kinds of resources: documents, interactive forms, audio or video. The set of URL-addressable resources has two key properties: it’s
    infinite, and it’s interconnected. Twenty years later we’re still figuring out all the things you can do on a web of hyperlinked resources that are accessible at well-known global addresses and manipulated by a few simple commands like GET, POST, and DELETE. When you’re working in an infinitely large universe it can seem ungrateful to complain that it’s too small. But there’s an even larger universe of resources populated by segments of audio and video, regions of images, and most
    importantly, for many of us, text in web documents: paragraphs, sentences, words, table cells. So let’s stare in amazement at another interesting URL: https://hyp.is/LoaMFCSJEee3aAMJuXhO-w/www.ics.uci.edu/~fielding/pubs/dissertation/software_arch.htm Here’s what it looks like to a human who follows the link: You land on a web page, in this case Roy Fielding’s dissertation on web architecture, it scrolls to the place where I’ve highlighted a phrase, and the Hypothesis sidebar displays
    my annotation which includes a comment and a tag. And here’s what that resource looks like to a computer when it fetches a variant of that link: { "body": [ { "type": "TextualBody", "value": "components: web resources\n\nconnectors: links\n\ndata: data", "format": "text/markdown" }, { "type": "TextualBody", "purpose": "tagging", "value": "IAnnotate2017" } ], "target": [ { "source": "https://www.ics.uci.edu/~fielding/pubs/dissertation/software_arch.htm",
    "selector": [ { "type": "XPathSelector", "value": "/table[2]/tbody[1]/tr[1]/td[1]", "refinedBy": { "start": 82, "end": 114, "type": "TextPositionSelector" } }, { "type": "TextPositionSelector", "end": 4055, "start": 4023 }, { "exact": " components, connectors, and data ", "prefix": "tion of architectural elements--", "type": "TextQuoteSelector", "suffix": "--constrained in their relations" } ] } ], "created": "2017-04-18T22:48:46.756821+00:00", "@context": "http://www.w3.org/ns/anno.jsonld", "creator": "acct:judell@hypothes.is", "type": "Annotation", "id": "https://hypothes.is/a/LoaMFCSJEee3aAMJuXhO-w", "modified": "2017-04-18T23:03:54.502857+00:00" } The URL, which we call a direct link , isn’t itself a standard way to address a selection of text, it’s just a link that points to a web resource.
    But the resource it points to, which describes the highlighted text and its coordinates within the document, is — since February of this year — a W3C standard. The way I like to think about it is that the highlighted phrase — and every possible highlighted phrase — has its own home page on the web, a place where humans and machines can jointly focus attention. If we think of the web we’ve known as a kind of fabric woven together with links, the annotated web increases the thread count of that fabric. When we weave with pieces of URL-addressable documents, we can have conversations about those pieces, we can retrieve them, we can tag them, and we can interconnect them. Working with our panelists and others, it’s been my privilege to build a series of annotation-powered apps that begin to show
    what’s possible when every piece of the web is addressable in this way. I’ll show you some examples, then invite my collaborators — Beth Ruedi from AAAS, Mike Caulfield from Washington State University Vancouver, Anita Bandrowski from SciCrunch, and Maryann Martone from UCSD and Hypothesis — to talk about what these apps are doing for them now, and where we hope to take them next. Science in the Classroom First up is a AAAS project called Science in the Classroom, a collection of research papers from the Science family of journals that are annotated — by graduate students — so teachers can help younger students understand the methods and outcomes of scientific research. Here’s one of those annotated papers. A widget called the Learning Lens toggles layers of annotation and off. Here I’ve selected
    the Glossary layer, and I’ve clicked on the word “distal” to reveal the annotation attached to it. Now lets look behind the scenes: Hypothesis was used to annotate the word “distal”. But Learning Lens predated the use of Hypothesis, and the Science in the Classroom team wanted to keep using Learning Lens to display annotations. What they didn’t want was the workflow behind it, which required manual insertion of annotations into HTML pages. Here’s the solution we came up with. Use Hypothesis to create annotations, then use some JavaScript in Science in the Classroom pages to retrieve Hypothesis annotations and write them into the pages, using the same format that had been applied manually. The preexisting and unmodified Learning Lens JavaScript can then do what it does: pick up the annotations, assign color-coded
    highlights based on tags, and show the annotations when you click on the highlights. What made this possible was a JavaScript library that helps with the heavy lifting required to attach an annotation to its intended target in the document. That library is part of the Hypothesis client, but it’s also available as a standalone module that can be used for other purposes. It’s a nice example of how open source components can enable an ecosystem of interoperable annotation services. DigiPo / EIC Next up is a toolkit for student fact-checkers and investigative journalists. You’ve already heard from Mike Caulfield about the Digital Polarization Project, or DigiPo, and from Stefan Candea about the European Investigative Collaborations network. Let’s look at how we’ve woven annotation into their investigative workflows. These investigations are both written and displayed in a wiki. This is a DigiPo example: I did the investigation of this claim myself, to test out the process we were developing. It required me to gather a whole lot of supporting evidence before I could begin to analyze the claim. I used a Hypothesis tag to collect annotations related to the investigation, and you can see them in this Hypothesis view: I can be very disciplined about using tags this way, but it’s a lot to ask of students, or really almost anyone. So we created a tool that knows about the set of investigations underway in the wiki, and offers the names of those pages as selectable tags. Here I’ve selected a piece of evidence for that investigation. I’m going to annotate it, not by using Hypothesis directly, but instead by using a function in a separate DigiPo extension. That function uses the core anchoring libraries to create annotations in the same way the Hypothesis client does. But it leads the user through an interstitial page that asks which investigation the annotation belongs to, and assigns a corresponding tag to the annotation it creates. Back in the wiki, the page embeds the same Hypothesis view we’ve already seen, as a Related Annotations widget pinned to that particular tag: I had so much raw material for this article that I needed some help organizing it. So I added a Timeline widget that gathers a subset of the source annotations that are tagged with dates. To put something onto the timeline, you select a date on a page. Then you create an annotation with a tag corresponding to the date. Here’s what the annotation looks like in Hypothesis. Over in the wiki, our JavaScript finds annotations that have these date tags and arranges them on the Timeline. Publication dates aren’t always evident on web pages, sometimes you have to do some digging to find them. When you do find one, and annotate a page with it, you’ve done more than populate the Timeline in a DigiPo page. That date annotation is now attached to the source page for anyone to discover, using Hypothesis or any other annotation-aware viewer. And that’s true for all the annotations created by DigiPo investigators. They’re woven into DigiPo pages, but they’re also available for separate reuse and aggregation. The last and most popular annotation-related feature we added to the toolkit is called Footnotes. Once you’ve gathered your raw material into the Related Annotations bucket, and maybe organized some of it onto the Timeline, you’ll want to weave the most pertinent references into the analysis you’re writing. To do that, you find the annotation you gathered and use Copy to clipboard to capture the direct link. Then you wrap that link around some text in the article: When you refresh the page, here’s what you get. The direct link does what a direct link does: it takes you to the page, scrolls you to the annotation in context. But it can take a while to review a bunch of sources that way. So the page’s JavaScript also creates a link that points down into the Footnotes section. And there, as Ted Nelson would say, and as Nate Angell for some reason hates hearing me say, the footnote is “transcluded” into the page so all the supporting context is right there. One final point about this toolkit. Students don’t like the writing tools available in wikis, and for good reason, they’re pretty rough around the edges. So we want to enable them to write in Google Docs. We also want them to footnote their articles using direct links because that’s the best way to do it. So here’s a solution we’re trying. From the wiki you’ll launch into Google Docs where you can do your writing in a much more robust editor that makes it really easy to include images and charts. And if you use direct links in that Google Doc, they’ll still show up as Footnotes. We’re not yet sure this will pan out, but my colleague Maryann Martone, who uses Hypothesis to gather raw material for her scientific papers, and who writes them in Google Docs, would love to be able to flow annotations through her writing tool and into published footnotes. SciBot Maryann is the perfect segue to our next example. Along with Anita Bandrowski, she’s working to increase the thread count in the fabric of scientific literature. When neuroscientists write up the methods used in their experiments, the ingredients often include highly specific antibodies. These have colloquial names, and even vendor catalog numbers, but they still lacked unique identifiers. So the Neuroscience Information Framework, NIF for short, has defined a namespace called RRID (research resource identifier), built a registry for RRIDs, and convinced a growing number of authors to mention RRIDs in their papers. Here’s an article with RRIDs in it. They’re written directly into the text because the text is the scientific record, it’s the only artifact that’s guaranteed to be preserved. So if you’re talking about a goat polyclonal antibody, you look it up in the registery, capture its ID, and write it directly into the text. And if it’s not in the registry, please add it, you’ll make Anita very happy if you do! The first phase of a project we call SciBot was about validating those RRIDs. They’re just freetext, after all, typed in by authors. Were the identifiers spelled correctly? Did they point to actual registry entries? To find out we built a tool that automatically annotates occurrences of RRIDs. In this example, Anita is about to click on the SciBot tool, which launches from a bookmarklet, and sends the text of the paper to a backend service. It scans the text for RRIDs, looks up each one in the registry, and uses the Hypothesis API to create an annotation — bound to the occurrence in the text — that reports the results of the registry lookup. Here the Hypothesis realtime API is showing that SciBot has created three annotations on this page. And here are those three annotations, anchored to their occurrences in the page, with registry entries displayed in the sidebar. SciBot curators review these annotations and use tags to mark which are valid. When some aren’t, and need attention, the highlight focuses that attention on a specific occurrence. This hybrid of automatic entity recognition and interactive human curation is really powerful. Here’s an example where an antibody doesn’t have an RRID but should. Every automatic workflow needs human exception handling and error correction. Here the curator has marked an RRID that wasn’t written into the literature, but now is present in the annotation layer. These corrections are now available to train a next-gen entity recognizer. Iterating through that kind of feedback loop will be a powerful way to mine the implicit data that’s woven into the scientific literature and make it explicit. Here’s the Hypothesis dashboard for one of the SciBot curators. The tag cloud gives you a pretty good sense of how this process has been unfolding so far. Publishers have begun to link RRIDs to the NIF registry. Here’s an example at PubMed. If you follow the ZIRC_ZL1 link to the registry, you’ll find a list of other papers whose authors used the same experimental ingredient, which happens to be a particular strain of zebrafish. This is the main purpose of RRIDs. If that zebrafish is part of my experiment, I want to find who else has used it, and what their experiences have been — not just what they reported in their papers, but ideally also what’s been discussed in the annotation layer. Of course I can visit those papers, and search within them for ZIRC_ZLI, but with annotations we can do better. In DigiPo we saw how footnoted quotes from source documents can transclude into an article. Publishers could do the same here. Or we could do this. It’s a little tool that offers to look up an RRID selected in text. It just links to an instance of the Hypothesis dashboard that’s pinned to the tag for that RRID. Those search results offer direct links that take you to each occurrence in context. Claim Chart Finally, and to bring us full circle, I recently reconnected with Andrew Schulman who works nowadays as a software patent attorney. There’s a tool of his trade called a claim chart. It’s a two-column table. In column one you list claims that a patent is making, which are selections of text from the claims section of the patent. And in column two you assemble bits of evidence, gathered from other sources, that bear on specific claims. Those bits of evidence are selections of text in other documents. It’s tedious to build a claim chart, it involves a lot of copying and pasting, and the evidence you gather is typically trapped in whatever document you create. Andrew wondered if an annotation-powered app could help build claim charts, and also make the supporting evidence web-addressable for all the reasons we’ve discussed. If I’ve learned anything about annotation, it’s that when somebody asks “Can you do X with annotation?” the answer should always be: “I don’t know, should be possible, let’s find out.” So, here’s an annotation-powered claim chart. The daggers at top left in each cell are direct links. The ones in the first column go to patent claims in context. The ones in the second column go to related statements in other documents. And here’s how the columns are related. When you annotate a claim, you use a toolkit function called Add Selection as Claim. Your selection here identifies the target document (that is, the patent), the claim chart you’re building (here, it’s a wiki page called andrew_test), and the claim itself (for example, claim 1). Once you’ve identified the claims in this way, they’re available as targets of annotations in other documents. From a selection in another document, you use Add Selection as Claim-Related. Here you see all the claims you’ve marked up, so it’s easy to connect the two statements. The last time I read Vannevar Bush’s famous essay As We May Think, this was the quote that stuck with me. When statements in documents become addressable resources on the web, we can weave them together in the way Vannevar Bush imagined. Share this: Email Twitter Facebook Reddit Like this: Like Loading... Posted in . , hypothesis hypothesis Published by Jon Udell View all posts by Jon Udell Post navigation ‹ Previous Do Repeat Yourself, With Variations Next › Celebrating Infrastructure 5 thoughts on “ Weaving the annotated web ” grlloyd says: 5 May 2017 at 11:57 am Without the examples, this would have been a good blog post. With the examples, it’s a great reference that makes important points on weaving the web that anyone can understand. Thank you! In particular, I liked how the Digipo / EIC toolkit example shows how you evolved a simple toolkit over a thoughtfully designed base + universal web. It reduces the cost and pain of using a disciplined tag convention without dumbing down the solution and locking up the benefits in a closed app. It extends the historical record in a way that people, bots, AI’s – and the ghost of Vannevar Bush – can use and build on. I hope that someday we’ll come back to recognizing the value of a toolkit approach – call them micro apps, skills, or whatever – to move from a universe of what people what to do to a set of capabilities over a fabric that continuously evolves and improves. Here’s to finding the momentarily important item! Loading... Reply Bill Burcham says: 8 May 2017 at 9:28 am “If we think of the web we’ve known as a kind of fabric woven together with links, the annotated web increases the thread count of that fabric.” —so good! Loading... Reply Pingback: Annotating EdTech Terms of Service – Adam Croom Pingback: Small is Beautiful. Metaphors and Other Musings from #Domains17 – Adam Croom Pingback: Notes for an Annotation SDK by cxr - HackTech.news Leave a Reply Cancel reply Search for: All Posts Hypothesis annotations Bio Follow Blog via Email Enter your email address to follow this blog and receive notifications of new posts by email. Email Address Follow Feed RSS - Posts Strategies for Internet Citizens by Jon Udell is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License . index Powered by WordPress.com . Discover more from Jon Udell Subscribe now to keep reading and get access to the full archive. Type your email… Subscribe Continue reading %d""",
        "ogImage": "https://i0.wp.com/blog.jonudell.net/wp-content/uploads/2024/07/gravatar-jon.png?fit=256%2C256&ssl=1",
        "ogDescription": "In 1997, at the first Perl Conference, which became OSCON the following year, my friend Andrew Schulman and I both gave talks on how the web was becoming a platform not only for publishing, but als…",
        "ogTitle": "Weaving the annotated web",
        "favicon": "https://i0.wp.com/blog.jonudell.net/wp-content/uploads/2024/07/gravatar-jon.png?fit=32%2C32&ssl=1",
    },
    {
        "content": json.dumps(MEMORY_TRANSCRIPT, indent=2),
        "description": 'The US needs to stay at the forefront of algorithmic advancements, says Konstantine Buhler, partner at Sequoia Capital. He discusses the importance of developments in AI memory with Ed Ludlow on “Bloomberg Technology.”\r\n--------\r\nLike this video? Subscribe to Bloomberg Technology on YouTube:\r\nhttps://www.youtube.com/channel/UCrM7B7SL_g1edFOnmj-SDKg\r\n \r\nWatch the latest full episodes of "Bloomberg Technology" with Caroline Hyde and Ed Ludlow here:\r\nhttps://www.youtube.com/playlist?list=PLfAX25ZLrPGTygCwn55voYZ_LYyKjxokJ\r\n \r\nGet the latest in tech from Silicon Valley and around the world here:\r\nhttps://www.bloomberg.com/technology\r\nConnect with us on...\r\nX: https://twitter.com/technology\r\nFacebook: https://www.facebook.com/BloombergTechnology\r\nInstagram: https://www.instagram.com/bloombergbusiness/\r\n \r\nFollow Ed Ludlow on X here: https://twitter.com/EdLudlow\r\nFollow Caroline Hyde on X here: https://twitter.com/CarolineHydeTV\r\n \r\nListen to the daily Bloomberg Technology podcast here:\r\nhttps://www.bloomberg.com/podcasts/series/bloomberg-technology\r\n \r\nMore from Bloomberg Business\r\nConnect with us on...\r\nX: https://twitter.com/business\r\nFacebook: https://www.facebook.com/bloombergbusiness\r\nInstagram: https://www.instagram.com/bloombergbusiness/\r\nLinkedIn: https://www.linkedin.com/company/bloomberg-news/\r\nTikTok: https://www.tiktok.com/@bloombergbusiness',
        "name": "The Importance of AI Memory",
        "type": "youtube",
        "url": "https://www.youtube.com/watch?v=oc2Wb_8JgVA",
    },
]

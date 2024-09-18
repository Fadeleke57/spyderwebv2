import nltk
nltk.download('punkt')
from nltk.tokenize import sent_tokenize

def split_into_sentences_nltk(text):
    return sent_tokenize(text)

def highlight_match(match): #for frontend highlight
    return f'<span class="font-bold text-blue-400">{match.group(0)}</span>'
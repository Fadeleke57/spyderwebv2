import nltk
import os

current_dir = os.path.dirname(__file__)
nltk_data_path = os.path.join(current_dir, '..', 'nltk_data')
nltk.data.path.append(os.path.abspath(nltk_data_path))

from nltk.tokenize import sent_tokenize

def split_into_sentences_nltk(text):
    return sent_tokenize(text)

def highlight_match(match): #for frontend highlight
    return f'<span class="font-bold text-blue-400">{match.group(0)}</span>'
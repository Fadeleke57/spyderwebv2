import nltk
from nltk.tokenize import sent_tokenize
from gensim.parsing.preprocessing import preprocess_string, remove_stopwords, strip_punctuation, strip_numeric
from gensim.corpora import Dictionary
from gensim.models import TfidfModel
from gensim.similarities import MatrixSimilarity

nltk.download('punkt')

class RelevanceModel:
    def __init__(self, corpus : str, use_nltk=False):
        """
        Initializes the RelevanceModel with a given article (a large body of text).
        
        Parameters:
        - article (str): The initial corpus for the TF-IDF model.
        - use_nltk (bool): Whether to use NLTK for sentence tokenization.
        """
        self.use_nltk = use_nltk
        if use_nltk:
            self.texts = self.split_into_sentences_nltk(corpus)
        else:
            self.texts = self.split_into_sentences_simple(corpus)
        self.dictionary, self.corpus = self.create_corpus(self.texts)
        self.tfidf_model = self.train_tfidf(self.corpus)

    def split_into_sentences_nltk(self, text : str) -> list :
        """
        Splits the given text into sentences using NLTK's sentence tokenizer.
        
        Parameters:
        - text (str): The text to be split into sentences.
        
        Returns:
        - list: A list of sentences.
        """
        return sent_tokenize(text)

    def split_into_sentences_simple(self, text : str) -> list:
        """
        Splits the given text into sentences using simple string splitting.
        
        Parameters:
        - text (str): The text to be split into sentences.
        
        Returns:
        - list: A list of sentences.
        """
        import re
        return re.split(r'(?<=[.!?]) +', text)

    def preprocess(self, text : str) -> list:
        """
        Preprocesses the given text by applying a series of custom filters to remove punctuation, numeric characters, and stopwords.
        
        Parameters:
        - text (str): The text to be preprocessed.
        
        Returns:
        - list: The preprocessed text as a list of tokens.
        """
        CUSTOM_FILTERS = [strip_punctuation, strip_numeric, remove_stopwords]
        return preprocess_string(text, CUSTOM_FILTERS)

    def create_corpus(self, texts : str) -> tuple:
        """
        Creates a corpus from a list of texts by preprocessing and converting them into a bag-of-words representation.
        
        Parameters:
        - texts (list): A list of strings representing the texts.
        
        Returns:
        - tuple: A tuple containing the dictionary and corpus.
        """
        processed_texts = [self.preprocess(text) for text in texts]
        dictionary = Dictionary(processed_texts)
        corpus = [dictionary.doc2bow(text) for text in processed_texts]
        return dictionary, corpus

    def train_tfidf(self, corpus : list) -> TfidfModel:
        """
        Trains a TF-IDF model using the given corpus.
        
        Parameters:
        - corpus (list): A list of lists of word frequencies.
        
        Returns:
        - TfidfModel: The trained TF-IDF model.
        """
        return TfidfModel(corpus)

    def calculate_similarity(self, text1 : str, text2 : str) -> float:
        """
        Calculates the similarity score between two texts using TF-IDF and MatrixSimilarity.
        
        Parameters:
        - text1 (str): The first text.
        - text2 (str): The second text.
        
        Returns:
        - float: The similarity score between the two texts.
        """
        bow1 = self.dictionary.doc2bow(self.preprocess(text1))
        bow2 = self.dictionary.doc2bow(self.preprocess(text2))
        
        tfidf1 = self.tfidf_model[bow1]
        tfidf2 = self.tfidf_model[bow2]
        
        index = MatrixSimilarity([tfidf1], num_features=len(self.dictionary))
        sims = index[tfidf2]
        return sims[0]

    def get_relevance_score(self, text1 : str, text2 : str) -> float:
        """
        Calculates the relevance score between two texts.
        
        Parameters:
        - text1 (str): The first text.
        - text2 (str): The second text.
        
        Returns:
        - float: The relevance score between the two texts.
        """
        score = self.calculate_similarity(text1, text2)
        return score

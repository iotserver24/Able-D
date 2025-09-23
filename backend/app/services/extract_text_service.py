from document_extractor import SimpleDocumentExtractor

_extractor_instance = None


def get_extractor() -> SimpleDocumentExtractor:
    global _extractor_instance
    if _extractor_instance is None:
        _extractor_instance = SimpleDocumentExtractor()
    return _extractor_instance



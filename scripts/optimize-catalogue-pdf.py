"""Compress catalogue photographs while preserving searchable text and PDF tags."""
import pathlib
import sys

import pymupdf


path = pathlib.Path(sys.argv[1]).resolve()
if path.suffix != ".pending":
    raise ValueError("Only a newly generated .pending catalogue may be processed.")
optimized = path.with_suffix(".optimized")
try:
    with pymupdf.open(path) as document:
        document.rewrite_images(dpi_threshold=180, dpi_target=150, quality=85, bitonal=False)
        document.save(optimized, garbage=4, deflate=True)
    optimized.replace(path)
finally:
    optimized.unlink(missing_ok=True)

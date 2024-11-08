# File Structure:

## popular_packages_h/ 

contains samples of popular npm packages, presumed to be human-written

## popular_packages_l/

contains samples of llm-generated versions of popular npm packages, based on the READMEs of the original packages

note: every sample in popular_packages_l/ has a corresponding sample in popular_packages_h/; however, the inverse may not always be true as some original packages failed to generate a corresponding llm-written version.

## node_modules/ & TSED/

helper packages and dependencies

# Code Structure:

## llm_code.py

main file which contains the code used to implement llm-based package generation, llm-rewriting of code, and measure rewrite-similarity.

note: you may be missing some python dependencies to run this file, e.g., simcse, tree_sitter
note: the current implementation uses the OpenAI API to synthetically generate and rewrite package code. An API key is required to run such functions.

## TSED.py & string-similarity-wrapper.js

helper files for code similarity models

# Metadata Structure:

## classification_results.csv

results comparing average simcse code similarity across 4x llm-rewrites of corresponding llm-generated and (presumed) human-written popular packages

## popular_packages_h.txt

list of samples present in popular_packages_h/ alongside some basic metadata and their relative directory location
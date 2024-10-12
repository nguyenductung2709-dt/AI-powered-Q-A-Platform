from transformers import pipeline

generator = pipeline("text-generation", model="meta-llama/Llama-3.2-1B-Instruct")
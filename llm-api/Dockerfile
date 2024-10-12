FROM bitnami/pytorch

# Set the home directory explicitly
ENV HOME=/app

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY ./server/models.py /app/server/models.py

# Set the Transformers cache to a writable directory
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface

# Create the cache directory and set permissions
RUN mkdir -p /app/.cache/huggingface && chmod 777 /app/.cache/huggingface

# Define the Hugging Face token as an argument
ARG HUGGINGFACE_TOKEN

# Log in to Hugging Face with the token
RUN python -c "from huggingface_hub import login; login(token='${HUGGINGFACE_TOKEN}', write_permission=True)"

RUN python /app/server/models.py

COPY ./server/ /app/server/

CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "7000"]
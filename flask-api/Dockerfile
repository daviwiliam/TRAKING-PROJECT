FROM python:3.10-slim

WORKDIR /api-flask

COPY requirements.txt /api-flask/requirements.txt

RUN pip install --no-cache-dir -r /api-flask/requirements.txt

COPY . /api-flask/

COPY credentials.json /app/credentials.json

ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

EXPOSE 5000

CMD ["flask", "run"]

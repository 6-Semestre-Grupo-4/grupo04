FROM python:3.11-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    TZ=America/Sao_Paulo \
    LANG=C.UTF-8

RUN apk add --no-cache --update \
    build-base \
    libffi-dev \
    musl-dev \
    postgresql-dev \
    bash \
    tzdata \
    graphviz \
    graphviz-dev


WORKDIR /code

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY . /code

ENV DJANGO_SETTINGS_MODULE=config.settings.django

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

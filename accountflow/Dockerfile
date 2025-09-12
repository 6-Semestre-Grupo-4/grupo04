FROM python:3.11-alpine
WORKDIR /code
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
COPY . /code
EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

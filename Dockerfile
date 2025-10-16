FROM python:3.10

RUN apt-get update && apt-get install -y cron supervisor

WORKDIR /home/app/
COPY requirements.txt /home/app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /home/app/

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8000 8001

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
FROM swipl:stable

WORKDIR /app

COPY *.pl *.csv ./
COPY api/consulta.pl ./api/consulta.pl

EXPOSE 8080

CMD ["swipl", "-q", "-s", "api/consulta.pl", "-g", "consulta:start(8081), thread_get_message(stop)"]

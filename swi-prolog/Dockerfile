FROM swipl:stable

WORKDIR /app/swi-prolog

COPY swi-prolog/*.pl ./
COPY swi-prolog/api ./api

EXPOSE 8080

CMD ["swipl", "-q", "-s", "api/server.pl", "-g", "server:start(8080), thread_get_message(stop)"]

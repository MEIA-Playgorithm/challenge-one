"""Teste de integração: python3 api/test_http.py (requer portas locais)."""
import csv
import json
import os
import tempfile
from pathlib import Path
import socket
import subprocess
import time
import urllib.error
import urllib.request

root = Path(__file__).resolve().parent.parent
with socket.socket() as sock:
    sock.bind(('127.0.0.1', 0))
    port = sock.getsockname()[1]
users_file = tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False)
columns = ['user_id','age','watched','wishlist','preferred_genres','disliked_genres',
           'preferred_languages','disliked_languages','max_duration_minutes','session_min_age',
           'min_rating','rating_tolerance','rating_required']
writer = csv.DictWriter(users_file, fieldnames=columns)
writer.writeheader()
writer.writerow(dict(user_id='test_user',age=25,wishlist='tt0372784',preferred_genres='Action'))
writer.writerow(dict(user_id='alternative',age=25,preferred_genres='Action',min_rating=8.5,rating_tolerance=0.5))
writer.writerow(dict(user_id='strict',age=25,min_rating=8.5,rating_tolerance=0.5,rating_required='true'))
writer.writerow(dict(user_id='family',age=35,session_min_age=8,max_duration_minutes=100))
users_file.close()
env = dict(os.environ, USERS_CSV=users_file.name)
server = subprocess.Popen(['swipl', '-q', '-s', str(root / 'api/server.pl'),
    '-g', f'server:start({port}), thread_get_message(stop)'], cwd=tempfile.gettempdir(), env=env)
base = f'http://localhost:{port}/api/'
def get(path, status=200, method=None):
    try:
        response = urllib.request.urlopen(urllib.request.Request(
            base + path, data=b'' if method == 'POST' else None, method=method), timeout=30)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        assert response.status == status, (path, response.status, response.read())
        assert response.headers['Access-Control-Allow-Origin'] == '*'
        return json.load(response)
def dialogue(body, status=200):
    data = body.encode() if isinstance(body, str) else json.dumps(body).encode()
    request = urllib.request.Request(base + 'dialogo', data=data, method='POST',
                                     headers={'Content-Type': 'application/json'})
    try:
        response = urllib.request.urlopen(request, timeout=30)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        assert response.status == status, (body, response.status, response.read())
        return json.load(response)
try:
    for _ in range(300):
        if server.poll() is not None:
            raise RuntimeError('O servidor terminou antes de arrancar')
        try:
            get('health')
            break
        except urllib.error.URLError:
            time.sleep(0.1)
    else:
        raise RuntimeError('Timeout ao iniciar o servidor')
    personalized = get('recomendacoes_utilizador?user_id=test_user&limit=100')
    assert personalized['total'] > 0
    batman = next(x for x in personalized['items'] if x['movie']['id'] == 'tt0372784')
    assert batman['score'] == 70.6 and {'type': 'wishlist'} in batman['reasons']
    assert batman['status'] == 'main'
    assert round(sum(batman['score_breakdown'].values()), 2) == batman['score']
    alternatives = get('recomendacoes_utilizador?user_id=alternative&limit=100')['items']
    candidate = next(x for x in alternatives if x['movie']['id'] == 'tt0372784')
    assert candidate['status'] == 'alternative'
    assert {'type':'rating_below_target','arguments':[8.2,8.5]} in candidate['unmet_preferences']
    statuses = [x['status'] for x in alternatives]
    assert statuses == sorted(statuses, key=lambda s: s == 'alternative')
    strict = get('recomendacoes_utilizador?user_id=strict&limit=100')['items']
    assert all(x['movie']['id'] != 'tt0372784' for x in strict)
    family = get('recomendacoes_utilizador?user_id=family&limit=100')['items']
    assert family and all(x['movie']['rating_mpa'] in ['G','PG'] for x in family)
    assert all(any(c['type']=='duration' and c['arguments'][0]<=100
                   for c in x['satisfied_requirements']) for x in family)
    get('recomendacoes_utilizador?user_id=missing', 404)
    get('recomendacoes_utilizador', 400)
    # Why not: excluded movies list the engine's exclusion reasons; recommended ones have none.
    excluded = get('why-not?user_id=family&movie=tt0372784')
    assert excluded['explanation_type'] == 'why_not' and excluded['movie']['id'] == 'tt0372784'
    assert any(x['rule'] == 'duration_limit' and x['details'] == 'duration_limit(100)'
               for x in excluded['exclusions'])
    assert 'exclusions' not in get('why-not?user_id=test_user&movie=tt0372784')
    get('why-not?user_id=missing&movie=tt0372784', 404)
    get('why-not?user_id=test_user&movie=missing', 404)
    get('why-not?user_id=test_user', 400)
    result = get('recomendacoes?id=tt0372784&limit=5')
    scores = [item['score'] for item in result['items']]
    assert len(scores) == 5 and scores == sorted(scores, reverse=True)
    assert all(item['movie']['id'] != 'tt0372784' for item in result['items'])
    for path in ['recomendacoes?id=tt0372784&limit=0', 'recomendacoes?id=tt0372784&limit=x',
                 'recomendacoes', 'recomendacoes?id=tt0372784&min_score=12']:
        get(path, 400)
    get('recomendacoes?id=inexistente', 404)
    # Dialogue: the first question, its "why", and answers from one request don't
    # stay in the database for the next.
    start = dialogue({'user_id': 'test_user'})
    assert start['history'] == [] and start['conclusions'] == []
    assert start['question']['key'] == 'experiencia'
    why = start['question']['why']
    assert why['rule'] == 'dialogo_experiencia'
    assert why['conditions'][why['asking']]['text'] == 'escolha(experiencia(test_user),A)'
    assert start['picks'] == []
    comedy = dialogue({'user_id': 'test_user', 'answers': {'experiencia': 'comedia'}})
    assert [h['answer'] for h in comedy['history']] == ['comedia']
    assert comedy['question']['key'] == 'prefere_romance_com_humor'
    assert comedy['question']['why']['rule'] == 'dialogo_comedia_2'
    done = dialogue({'user_id': 'test_user',
                     'answers': {'experiencia': 'comedia', 'prefere_romance_com_humor': 'sim'}})
    assert done['question'] is None
    facts = [c['fact']['text'] for c in done['conclusions']]
    assert "sugerir_genero(test_user,'Romantic Comedy')" in facts
    # Picks: user recommendations meeting the suggestions, most matches first.
    picks = done['picks']
    assert picks and all('Comedy' in p['movie']['genre'] for p in picks)
    counts = [len(p['matches']) for p in picks]
    assert counts == sorted(counts, reverse=True)
    action = dialogue({'user_id': 'test_user', 'answers': {'experiencia': 'acao'}})
    assert all({'type': 'genre', 'value': 'Action'} in p['matches'] for p in action['picks'])
    assert dialogue({'user_id': 'test_user'})['history'] == []
    for body in ['x', '[]', {}, {'user_id': ''}, {'user_id': 1},
                 {'user_id': 'test_user', 'answers': []},
                 {'user_id': 'test_user', 'answers': {'desconhecida': 'sim'}},
                 {'user_id': 'test_user', 'answers': {'experiencia': 'sim'}},
                 {'user_id': 'test_user', 'answers': {'prefere_romance_com_humor': 'talvez'}}]:
        dialogue(body, 400)
    dialogue({'user_id': 'missing'}, 404)
    with urllib.request.urlopen(urllib.request.Request(base+'recomendacoes', method='OPTIONS')) as response:
        assert response.status == 200
    try:
        urllib.request.urlopen(urllib.request.Request(base+'recomendacoes', data=b'', method='POST'))
    except urllib.error.HTTPError as error:
        assert error.code == 405
    else:
        raise AssertionError('POST deveria devolver 405')
    for scope in ['reload', 'reload/users', 'reload/movies']:
        result = get(scope, method='POST')
        assert result['status'] == 'ok' and result['movies'] > 0 and result['users'] == 4
        try:
            urllib.request.urlopen(base + scope)
        except urllib.error.HTTPError as error:
            assert error.code == 405
        else:
            raise AssertionError('GET ' + scope + ' deveria devolver 405')
    # Novo utilizador no CSV só aparece depois do reload dos utilizadores.
    get('recomendacoes_utilizador?user_id=added', 404)
    with open(users_file.name, 'a', newline='') as handle:
        csv.DictWriter(handle, fieldnames=columns).writerow(dict(user_id='added', age=30))
    get('recomendacoes_utilizador?user_id=added', 404)
    assert get('reload/users', method='POST')['users'] == 5
    assert get('recomendacoes_utilizador?user_id=added')['total'] > 0
    # CSV inválido: 422 e a base anterior mantém-se.
    with open(users_file.name, 'a', newline='') as handle:
        csv.DictWriter(handle, fieldnames=columns).writerow(dict(user_id='added', age=30))
    get('reload/users', 422, method='POST')
    assert get('recomendacoes_utilizador?user_id=added')['total'] > 0
    print('OK: endpoints, filtros, paginação, recomendações, erros, CORS e métodos HTTP')
finally:
    server.terminate()
    server.wait(timeout=10)
    Path(users_file.name).unlink()

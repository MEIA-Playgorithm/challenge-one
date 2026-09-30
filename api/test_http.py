"""Teste de integração: python3 api/test_http.py (requer portas locais)."""
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
users_file.write('user_id,age,watched,wishlist,preferred_genres,disliked_genres,preferred_languages,disliked_languages\n')
users_file.write('test_user,25,,tt0372784,Action,,,\n')
users_file.close()
env = dict(os.environ, USERS_CSV=users_file.name)
server = subprocess.Popen(['swipl', '-q', '-s', str(root / 'api/consulta.pl'),
    '-g', f'consulta:start({port}), thread_get_message(stop)'], cwd='/tmp', env=env)
base = f'http://localhost:{port}/api/'
def get(path, status=200):
    try:
        response = urllib.request.urlopen(base + path, timeout=10)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        assert response.status == status, (path, response.status, response.read())
        assert response.headers['Access-Control-Allow-Origin'] == '*'
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
    assert batman['score'] == 10 and {'type': 'wishlist'} in batman['reasons']
    get('recomendacoes_utilizador?user_id=missing', 404)
    get('recomendacoes_utilizador', 400)
    result = get('filmes?pace=fast&limit=3')
    assert len(result['items']) == 3
    assert all(movie['pace'] == 'fast' for movie in result['items'])
    assert get('filmes?offset=10000')['items'] == []
    movie = get('filme?id=tt0372784')
    assert movie['title'] == 'Batman Begins' and 'Action' in movie['genre']
    result = get('recomendacoes?id=tt0372784&limit=5')
    scores = [item['score'] for item in result['items']]
    assert len(scores) == 5 and scores == sorted(scores, reverse=True)
    assert all(item['movie']['id'] != 'tt0372784' for item in result['items'])
    for path in ['filmes?limit=0', 'filmes?limit=x', 'filmes?pace=invalid',
                 'filme', 'recomendacoes?id=tt0372784&min_score=12']:
        get(path, 400)
    get('filme?id=inexistente', 404)
    with urllib.request.urlopen(urllib.request.Request(base+'filmes', method='OPTIONS')) as response:
        assert response.status == 200
    try:
        urllib.request.urlopen(urllib.request.Request(base+'filmes', data=b'', method='POST'))
    except urllib.error.HTTPError as error:
        assert error.code == 405
    else:
        raise AssertionError('POST deveria devolver 405')
    print('OK: endpoints, filtros, paginação, recomendações, erros, CORS e métodos HTTP')
finally:
    server.terminate()
    server.wait(timeout=10)
    Path(users_file.name).unlink()

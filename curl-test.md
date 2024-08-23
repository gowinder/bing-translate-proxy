
```shell
curl -X POST http://localhost:6600/translate \
-H 'Authorization: Bearer token' \
-H 'Content-Type: application/json' \
-d '{"text": "3\n00 : 01 : 00,000 --> 00 : 01 : 30,000\n1 가라테는 예로 시작하고 예로 끝나며, 2 가라테는 선례가 없으며, 3 가라테는 의의 도움임을 기억하십시오.  ", "target_language": "zh-Hans"}'
```

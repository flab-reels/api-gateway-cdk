import json
import requests

def handler(event, context):
    print('request: {}'.format(json.dumps(event)))
    # AUTH SERVICE 경로 붙이기
    security_url = 'http://AuthE-Autha-LQ2DL5R8TUAU-1733401156.ap-northeast-2.elb.amazonaws.com/auth/access'
    response = requests.get(security_url,
                            headers={'access_token': event['authorizationToken']})
    auth = 'DENY'
    json_data = response.json()
    id = json_data.get("id")
    picture = json_data.get("picture")

    if 200 <= response.status_code < 300:
        auth = 'ALLOW'

    authResponse = {
        "principalId": id,
        "policyDocument":
            {"Version": "2012-10-17",
             "Statement": [
                 {"Action": "execute-api:Invoke",
                  "Resource": ["arn:aws:execute-api:ap-northeast-2:087334185325:ic2m1oguzg/*/*"],
                  "Effect": auth
                  }]
             },
        "context": {
            "id": id,
            "picture": picture,
        }
    }
    return authResponse

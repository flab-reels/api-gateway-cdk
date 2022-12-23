import json
import requests


def handler(event, context):
    print('request: {}'.format(json.dumps(event)))
    security_url = 'http://authe-autha-1f7oejb8tj1so-41807832.ap-northeast-2.elb.amazonaws.com/auth/access'
    response = requests.get(security_url,
                            headers={'access_token': event['authorizationToken']})
    auth = 'DENY'
    json_data = response.json()
    id = json_data.get("id")

    if 200 <= response.status_code < 300:
        auth = 'ALLOW'

    authResponse = {
        "principalId": id,
        "policyDocument":
            {"Version": "2012-10-17",
             "Statement": [
                 {"Action": "execute-api:Invoke",
                  "Resource": ["arn:aws:execute-api:ap-northeast-2:788675236515:vmlafog2g3/*/*"],
                  "Effect": auth
                  }]
             },
        "context": {
            "id": id,
        }
    }
    return authResponse

# API GATEWAY WORKFLOW

## Sequence diagram for accessing inside AWS API GATEWAY

1. Implement OAuth2 and Jwt with Spring security https://github.com/flab-reels/auth
2. Create Lambda Authorizer for Service Access
3. Send a request to Spring security service to Lambda Authorizer to validate the token.
4. Access to each service via AWS API GATEWAY

<img width="4378" alt="API GATEWAY Sequence Diagram" src="https://user-images.githubusercontent.com/32415176/211599402-432bffc4-a9c0-458b-893c-68256c573e26.png">

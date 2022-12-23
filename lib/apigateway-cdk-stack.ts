import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as agw from 'aws-cdk-lib/aws-apigateway'
import * as lambda from 'aws-cdk-lib/aws-lambda'

export class ApigatewayCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaAuthorizer = new lambda.Function(this, 'lambda_authorizer',{
      functionName:'authorizer_demo_v1',
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'authorizer.handler',
      code: lambda.Code.fromAsset('lambda'),
    })

    const auth = new agw.TokenAuthorizer(this, "demo_authorizer",{
      handler : lambdaAuthorizer,
      authorizerName : "spring_security_auth"
    })

    const api = new agw.RestApi(this, "auth_demo_api",{
      restApiName : "auth_demo_api",
    })

    const getData = api.root.addResource("auth")
    getData.addMethod("GET",new agw.HttpIntegration('http://authe-autha-1f7oejb8tj1so-41807832.ap-northeast-2.elb.amazonaws.com/auth/authorize',{
      options:{
        requestParameters:{
      // header로 넘길것 http integration
          'integration.request.header.id':`context.authorizer.id`
        },
      }
    }),{
      authorizer :auth,
      authorizationType:agw.AuthorizationType.CUSTOM,
    })





  }
}

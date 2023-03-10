import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as agw from 'aws-cdk-lib/aws-apigateway'
import {AuthorizationType, IdentitySource} from 'aws-cdk-lib/aws-apigateway'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import {CfnOutput, Duration} from "aws-cdk-lib";

export class ApigatewayCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaAuthorizer = new lambda.Function(this, 'lambda_authorizer',{
      functionName:'authorizer_v1',
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'authorizer.handler',
      code: lambda.Code.fromAsset('lambda'),

    })

    const auth = new agw.TokenAuthorizer(this, "auth_authorizer",{
      handler : lambdaAuthorizer,
      authorizerName : "flab_reels_auth",
      identitySource : IdentitySource.header("authorizationToken")

    })
    const api = new agw.RestApi(this, "flab-reels-api-gateway",{
      restApiName : "flab-reels-api-gateway",
    })

    const mockIntegration = new agw.Integration({

      type: agw.IntegrationType.MOCK,
      integrationHttpMethod:"ANY",

      options: {

        requestParameters:{
          // header로 넘길것 http integration
          'integration.request.header.id':`context.authorizer.id`,
          'integration.request.header.picture':`context.authorizer.picture`,
          "integration.request.path.proxy": "method.request.path.proxy"
        }
      },
    });
    const mockResource = api.root.addResource("mock")
    mockResource.addProxy({
      anyMethod:true,
      defaultIntegration:mockIntegration,
      defaultMethodOptions:{
        authorizer:auth,
        authorizationType:AuthorizationType.CUSTOM,
        requestParameters:{
          'method.request.path.proxy': true,
        }
      },


    })


    /**
     *  USER SERVICE API GATEWAY ATTACH
     */

    // const userVpc = ec2.Vpc.fromLookup(this,"referenced-vpc",{
    //   vpcId: "vpc-074198c279776a046"
    // })
    // // URI NLB DNS 경로로 붙여서 사용할 것
    // const userNlbARN = "arn:aws:elasticloadbalancing:ap-northeast-2:087334185325:loadbalancer/net/UserE-usera-YTUNNTWNFLWO/2b767139c86750c2"
    // const userNlbDnsName = "UserE-usera-YTUNNTWNFLWO-2b767139c86750c2.elb.ap-northeast-2.amazonaws.com/"
    // const userNLB = elbv2.NetworkLoadBalancer.fromNetworkLoadBalancerAttributes(
    //     this,
    //     "user-apigateway-nlb",{
    //       loadBalancerDnsName: userNlbDnsName,
    //       loadBalancerArn: userNlbARN,
    //       vpc:userVpc
    //     }
    // )
    // const userVpcLink = new agw.VpcLink(this, 'user-vpc-link',{
    //   vpcLinkName:'user-vpc-link',
    //   targets:[userNLB],
    //
    // })
    //
    // const userIntegration = new agw.Integration({
    //   uri: "http://"+userNlbDnsName+"{proxy}",
    //   type: agw.IntegrationType.HTTP_PROXY,
    //   integrationHttpMethod:"ANY",
    //
    //   options: {
    //     connectionType: agw.ConnectionType.VPC_LINK,
    //     vpcLink: userVpcLink,
    //     timeout: Duration.seconds(15),
    //
    //     requestParameters:{
    //       // header로 넘길것 http integration
    //       'integration.request.header.id':`context.authorizer.id`,
    //       'integration.request.header.picture':`context.authorizer.picture`,
    //       "integration.request.path.proxy": "method.request.path.proxy"
    //     }
    //   },
    // });
    // const userResource = api.root.addResource("user")
    // userResource.addProxy({
    //   anyMethod:true,
    //   defaultIntegration:userIntegration,
    //   defaultMethodOptions:{
    //     authorizer:auth,
    //     authorizationType:AuthorizationType.CUSTOM,
    //     requestParameters:{
    //       'method.request.path.proxy': true,
    //     }
    //   },
    //
    //
    // })

    /**
     *  ATTACH FEED SERVICE TO API GATEWAY 
    */
    const feedVpc = ec2.Vpc.fromLookup(this,"feed-referenced-vpc",{
      vpcId: "vpc-096f2736cdce822b0"
    })

    // URI NLB DNS 경로로 붙여서 사용할 것
    const feedNlbARN = "arn:aws:elasticloadbalancing:ap-northeast-2:087334185325:loadbalancer/net/feed-nlb/3fd6fc05d192ad65"
    const feedNlbDnsName = "feed-nlb-3fd6fc05d192ad65.elb.ap-northeast-2.amazonaws.com/"
    const feedNLB = elbv2.NetworkLoadBalancer.fromNetworkLoadBalancerAttributes(
        this,
        "feed-apigateway-nlb",{
          loadBalancerDnsName: feedNlbDnsName,
          loadBalancerArn: feedNlbARN,
          vpc:feedVpc
        }
    )
    const feedVpcLink = new agw.VpcLink(this, 'feed-vpc-link',{
      vpcLinkName:'feed-vpc-link',
      targets:[feedNLB],
    
    })

    const feedServiceIntegration = new agw.Integration({
      integrationHttpMethod:"ANY",
      uri: "http://"+feedNlbDnsName+"{proxy}",
      type: agw.IntegrationType.HTTP_PROXY,
      options: {
        connectionType: agw.ConnectionType.VPC_LINK,
        vpcLink: feedVpcLink,
        timeout: Duration.seconds(15),

        requestParameters:{
          // header로 넘길것 http integration
          'integration.request.header.id':`context.authorizer.id`,
          'integration.request.header.picture':`context.authorizer.picture`,
          "integration.request.path.proxy": "method.request.path.proxy"
        }
      },
    });
    const feedServiceResource = api.root.addResource("feed")
    feedServiceResource.addProxy({
      anyMethod:true,
      defaultIntegration:feedServiceIntegration,
      defaultMethodOptions:{
        authorizer:auth,
        authorizationType:AuthorizationType.CUSTOM,
        requestParameters:{
          'method.request.path.proxy': true,
        }
      },

    })
    

    /**
     *  ATTACH DEMO SERIVICE TO APIGATEWAY 
     */
    const demoVpc = ec2.Vpc.fromLookup(this,"demo-referenced-vpc",{
      vpcId: "vpc-0ef341fcf14b1f320"
    })
    // URI NLB DNS 경로로 붙여서 사용할 것
    const demoNlbARN = "arn:aws:elasticloadbalancing:ap-northeast-2:087334185325:loadbalancer/net/DemoS-demos-1A8F4BTPV3GAV/4ea1dc4a2e7b0d81"
    const demoNlbDnsName = "DemoS-demos-1A8F4BTPV3GAV-4ea1dc4a2e7b0d81.elb.ap-northeast-2.amazonaws.com/"
    const demoNLB = elbv2.NetworkLoadBalancer.fromNetworkLoadBalancerAttributes(
        this,
        "demo-apigateway-nlb",{
          loadBalancerDnsName: demoNlbDnsName,
          loadBalancerArn: demoNlbARN,
          vpc:demoVpc
        }
    )
    const demoVpcLink = new agw.VpcLink(this, 'demo-vpc-link',{
      vpcLinkName:'demo-vpc-link',
      targets:[demoNLB],
    
    })

    const demoServiceIntegration = new agw.Integration({
      integrationHttpMethod:"ANY",
      uri: "http://"+demoNlbDnsName+"{proxy}",
      type: agw.IntegrationType.HTTP_PROXY,
      options: {
        connectionType: agw.ConnectionType.VPC_LINK,
        vpcLink: demoVpcLink,
        timeout: Duration.seconds(15),

        requestParameters:{
          // header로 넘길것 http integration
          'integration.request.header.id':`context.authorizer.id`,
          'integration.request.header.picture':`context.authorizer.picture`,
          "integration.request.path.proxy": "method.request.path.proxy"
        }
      },
    });
    const demoServiceResource = api.root.addResource("demo")
    demoServiceResource.addProxy({
      anyMethod:true,
      defaultIntegration:demoServiceIntegration,
      defaultMethodOptions:{
        authorizer:auth,
        authorizationType:AuthorizationType.CUSTOM,
        requestParameters:{
          'method.request.path.proxy': true,
        }
      },

    })




  }
}

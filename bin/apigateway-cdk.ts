#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApigatewayCdkStack } from '../lib/apigateway-cdk-stack';

const app = new cdk.App();
new ApigatewayCdkStack(app, 'ApigatewayCdkStack', {
});
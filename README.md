# chubbyjs-negotiation

[![CI](https://github.com/chubbyjs/chubbyjs-negotiation/workflows/CI/badge.svg?branch=master)](https://github.com/chubbyjs/chubbyjs-negotiation/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/chubbyjs/chubbyjs-negotiation/badge.svg?branch=master)](https://coveralls.io/github/chubbyjs/chubbyjs-negotiation?branch=master)
[![Infection MSI](https://badge.stryker-mutator.io/github.com/chubbyjs/chubbyjs-negotiation/master)](https://dashboard.stryker-mutator.io/reports/github.com/chubbyjs/chubbyjs-negotiation/master)
[![npm-version](https://img.shields.io/npm/v/@chubbyjs/chubbyjs-negotiation.svg)](https://www.npmjs.com/package/@chubbyjs/chubbyjs-negotiation)

[![bugs](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-negotiation&metric=bugs)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-negotiation)
[![code_smells](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-negotiation&metric=code_smells)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-negotiation)
[![coverage](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-negotiation&metric=coverage)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-negotiation)
[![duplicated_lines_density](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-negotiation&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-negotiation)
[![ncloc](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-negotiation&metric=ncloc)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-negotiation)
[![sqale_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-negotiation&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-negotiation)
[![alert_status](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-negotiation&metric=alert_status)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-negotiation)
[![reliability_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-negotiation&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-negotiation)
[![security_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-negotiation&metric=security_rating)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-negotiation)
[![sqale_index](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-negotiation&metric=sqale_index)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-negotiation)
[![vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-negotiation&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-negotiation)

## Description

A simple negotiation library.

## Requirements

 * node: 12
 * [@chubbyjs/psr-http-message][2]: ^1.2.1

## Installation

Through [NPM](https://www.npmjs.com) as [@chubbyjs/chubbyjs-negotiation][1].

```sh
npm i @chubbyjs/chubbyjs-negotiation@1.0.0
```

## Usage

### AcceptLanguageNegotiator

```ts
import AcceptLanguageNegotiator from '@chubbyjs/chubbyjs-negotiation/dist/AcceptLanguageNegotiator';

const request = ...withHeader('Accept-Language', 'de,en;q=0.3,en-US;q=0.7');

const negotiator = new AcceptLanguageNegotiator(['en', 'de']);
const value = negotiator.negotiate(request); // NegotiatedValue
value.getValue(); // de
value.getAttributes(); // new Map([['q' => '1.0']])
```

### AcceptNegotiator

```ts
import AcceptNegotiator from '@chubbyjs/chubbyjs-negotiation/dist/AcceptNegotiator';

const request = ...withHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q =0.8');

const negotiator = new AcceptNegotiator(['application/json', 'application/xml', 'application/x-yaml']);
const value = negotiator.negotiate(request); // NegotiatedValue
value.getValue(); // application/xml
value.getAttributes(); // new Map([['q' => '0.9']])
```

### ContentTypeNegotiator

```ts
import ContentTypeNegotiator from '@chubbyjs/chubbyjs-negotiation/dist/ContentTypeNegotiator';

const request = ...withHeader('Content-Type', 'application/xml; charset=UTF-8');

const negotiator = new ContentTypeNegotiator(['application/json', 'application/xml', 'application/x-yaml']);
const value = negotiator.negotiate($request); // NegotiatedValue
value->getValue(); // application/xml
value->getAttributes(); // new Map([['charset' => 'UTF-8']])
```

## Copyright

Dominik Zogg 2021

[1]: https://www.npmjs.com/package/@chubbyjs/chubbyjs-negotiation
[2]: https://www.npmjs.com/package/@chubbyjs/psr-http-message

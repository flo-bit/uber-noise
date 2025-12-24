from https://github.com/illumincrotty/alea-random/tree/main

# Alea Generator

<!-- Shields -->

![npm](https://img.shields.io/npm/l/alea-generator)
![size-badge](https://img.badgesize.io/https:/unpkg.com/alea-generator/dist/TODO?compression=brotli)
![Types](https://badgen.net/npm/types/alea-generator)
[![codecov](https://codecov.io/gh/illumincrotty/alea-random/branch/main/graph/badge.svg?token=W17SYOVM6T)](https://codecov.io/gh/illumincrotty/alea-random)

</div>

---

<p align="center"> A dead simple random number generator. Seedable, repeatable, and fast</p>

## 📝 Table of Contents

- [Alea Generator](#alea-generator)
  - [📝 Table of Contents](#-table-of-contents)
  - [🧐 About](#-about)
  - [Install](#install)
    - [Package Manager](#package-manager)
    - [CDN](#cdn)
  - [🔧 Running the tests](#-running-the-tests)
  - [🎈 Usage](#-usage)
  - [📃 License and Shoutouts](#-license-and-shoutouts)
  - [✍️ Authors](#️-authors)
  - [🔨 Similar Tools](#-similar-tools)

## 🧐 About

The default javascript random (Math.random()) is slow, inconsistent across browsers and platforms, and lack seedability, customizability, and state. This generator is a simple way to solve all these problems at once, and it manages that at the tiny cost of only a few hundred bytes. Not kilobytes, bytes. It's small, it's fast, and it's feature-rich. What more could you want?

## Install

### Package Manager

#### NPM <!-- omit in TOC -->

```sh
npm i alea-generator
```

#### PNPM <!-- omit in TOC -->

```sh
pnpm add alea-generator
```

#### Yarn <!-- omit in TOC -->

```sh
yarn add alea-generator
```

### CDN

#### Skypack <!-- omit in TOC -->

For Web and Deno, no install is required! Just put this line at the top of your file:

```typescript
import { inflate } from 'https://cdn.skypack.dev/alea-generator';
```

If you want type support with skypack, follow the directions [here]('https://docs.skypack.dev/skypack-cdn/code/javascript#using-skypack-urls-in-typescript')

#### UNPKG <!-- omit in TOC -->

```html
<script src="https://unpkg.com/alea-generator"></script>
```

And use it like you would any other package from UNPKG

## 🔧 Running the tests

The basic set of tests are in the test script and the coverage script. Just run those using your perferred package manager (npm, yarn, pnpm, etc.) if you want to make sure nothing has broken.

## 🎈 Usage

Here's the great part: thanks to [microbundle](https://github.com/developit/microbundle), this package supports CJS, UMD, and ESM formats.
That means that wherever and however you use this package — in browser or node, with import or require — you _should_ be set, no configuration required.

<!-- TODO -->

There are two exports from this package: alea and aleaFactory. If you just want to use a higher quality drop in replacement for Math.random, alea is the pick. For the notably expanded functionality, use aleaFactory.

```typescript
import { alea as random } from 'alea-generator';

console.log(random()); // 0.6198398587293923
console.log(random()); // 0.0231225231354864
console.log(random()); // 0.9802844453866831

// all outputs will be greater than or equal to 0 and less than 1
```

```typescript
import { aleaFactory } from 'alea-generator';

/********************************************/
/*               Seeding                    */
/********************************************/

// the aleaFactory is optionally seedable
const randomGeneratorNoSeed = aleaFactory();

// the seed can be a number
const randomGeneratorWithNumberSeed = aleaFactory(123);

// or the seed can be a string
const randomGeneratorWithTextSeed = aleaFactory('special seed');

// or any object with a toString method
const objectSeed = {
  num: 45,
  num2: 47,
  toString: () => `${objectSeed.num} + ${objectSeed.num2}`,
};
const randomGeneratorWithObjectSeed = aleaFactory(objectSeed);
// be careful with this, if you haven't implemented a toString method
// as it will inherit one from the prototype chain and default to [object Object]

/********************************************/
/*               Methods                    */
/********************************************/
const randomGenerator = aleaFactory('1277182878230');

// random is the drop in replacement for Math.random
// it will generate numbers greater than or equal to 0 and less than 1
console.log(randomGenerator.random()); // 0.6198398587293923
console.log(randomGenerator.random()); // 0.8385338634252548

// uint32 will generate integers greater than or equal to 0 and less than 2^32
console.log(randomGenerator.uint32()); // 715789690
console.log(randomGenerator.uint32()); // 4250

// Fract53 will generate a 53 bit number between 0 and 1 (like random but higher precision)
console.log(randomGenerator.fract53()); // 0.16665777435687268;
console.log(randomGenerator.fract53()); // 0.00011322738143160205;

// exportState and importState allow for exact state duplication
const stateBeforeRunning = randomGenerator.exportState();
console.log(randomGenerator.random()); // 0.7692187615214618
console.log(randomGenerator.random()); // 0.2316584344522553

randomGenerator.importState(stateBeforeRunning);
console.log(randomGenerator.random()); // 0.7692187615214618
console.log(randomGenerator.random()); // 0.2316584344522553

const otherGenerator = aleaFactory().importState(stateBeforeRunning);
console.log(otherGenerator.random()); // 0.7692187615214618
console.log(otherGenerator.random()); // 0.2316584344522553
```

<!-- LICENSE -->

## 📃 License and Shoutouts

Distributed under the MIT License. See `LICENSE` for more information. This is a typescript port of an [alea generator for javascript](https://github.com/coverslide/node-alea/) which was itself a packaged version of the implementation by Johannes Baagøe which you can read more about [here](https://web.archive.org/web/20120619002808/http://baagoe.org/en/wiki/Better_random_numbers_for_javascript)

## ✍️ Authors

Find me [@illumincrotty](https://github.com/illumincrotty) on github or [@illumincrotty](https://twitter.com/illumincrotty) on twitter

## 🔨 Similar Tools

If this tool isn't working for you, try one of these:

- [ISAAC, A cryptographically secure random number generator](https://github.com/macmcmeans/isaacCSPRNG)
- [The new standard crypto web api for cryptographically secure random numbers](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)
- [Prando](https://www.npmjs.com/package/prando)

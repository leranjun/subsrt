<!-- markdownlint-disable html -->

# subsrt-ts

<a name="readme-top"></a>

[![npm](https://img.shields.io/npm/v/subsrt-ts?logo=npm)](https://www.npmjs.com/package/subsrt-ts)
[![npm](https://img.shields.io/npm/dt/subsrt-ts?logo=npm)](https://www.npmjs.com/package/subsrt-ts)
[![Linting](https://img.shields.io/github/actions/workflow/status/leranjun/subsrt-ts/lint-and-test.yml?label=Lint%20and%20test&logo=github)](https://github.com/leranjun/subsrt-ts/actions/workflows/lint-and-test.yml)
[![DeepSource](https://app.deepsource.com/gh/leranjun/subsrt-ts.svg/?label=active+issues&show_trend=true&token=VSYfXgJAchNJCwJhEqwVhMlh)](https://app.deepsource.com/gh/leranjun/subsrt-ts/?ref=repository-badge)

<p align="center">
<a href="https://leranjun.github.io/subsrt-ts/"><strong>Docs</strong></a>
·
<a href="https://www.npmjs.com/package/subsrt-ts">npm package</a>
</p>

Subtitle JavaScript library and command line tool with no dependencies.

This is a rewrite of the original [subsrt](https://www.npmjs.com/package/subsrt) package in TypeScript and using ESM syntax.

<details>
    <summary>Table of Contents</summary>
    <ol>
        <li><a href="#getting-started">Getting started</a></li>
        <li><a href="#supported-subtitle-formats">Supported subtitle formats</a></li>
        <li><a href="#command-line-arguments">Command line arguments</a></li>
        <li>
            <a href="#using-in-javascript">Using in JavaScript</a>
            <ul>
                <li><a href="#list-supported-formats">List supported formats</a></li>
                <li><a href="#detect">Detect</a></li>
                <li><a href="#parse">Parse</a></li>
                <li><a href="#build">Build</a></li>
                <li><a href="#convert">Convert</a></li>
                <li><a href="#timeshift---offset">Timeshift (+/- offset)</a></li>
                <li><a href="#change-fps">Change FPS</a></li>
                <li><a href="#advanced-resync-options">Advanced resync options</a></li>
            </ul>
        </li>
        <li><a href="#source-code">Source code</a></li>
        <li><a href="#license">License</a></li>
    </ol>
</details>

## Getting started

Install the module

```console
npm install -g subsrt
```

Command line

```console
subsrt --help
subsrt convert sample.sub sample.srt
```

Using as Node.js library

```javascript
import subsrt from "subsrt";

// MicroDVD (.sub) content
const sub = "{14975}{104000}Hi, my name is...";

// Convert to SubRip (.srt) content
const srt = subsrt.convert(sub, { format: "srt", fps: 25 });
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Supported subtitle formats

-   [MicroDVD SUB](https://en.wikipedia.org/wiki/MicroDVD) (.sub)
-   [SubRip](https://en.wikipedia.org/wiki/SubRip) (.srt)
-   [SubViewer](https://en.wikipedia.org/wiki/SubViewer) (.sbv)
-   [WebVTT](https://w3c.github.io/webvtt/) (.vtt)
-   [SubStation Alpha](https://en.wikipedia.org/wiki/SubStation_Alpha) (.ssa and .ass)
-   [SAMI](https://en.wikipedia.org/wiki/SAMI) (.smi) aka Synchronized Accessible Media Interchange
-   [LRC](https://en.wikipedia.org/wiki/LRC_%28file_format%29) (.lrc) aka LyRiCs
-   JSON (.json)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Command line arguments

```text
Usage:
  subsrt [command] [options]

Commands:
  list                   List supported formats
  parse [src] [json]     Parse a subtitle file
  build [json] [dst]     Create a subtitle file from captions
  detect [src]           Detect subtitle file format, if supported
  resync [src] [dst]     Resync FPS or shift time (+/- offset)
  convert [src] [dst]    Converts a subtitle format

Options:
  --help                 Print this message
  --eol [chars]          End of line chars, e.g. \r\n
  --fps [fps]            Frames per second for .sub format
  --offset [time]        Resync time shift offset in ms
  --format [ext]         Subtitle format to convert/build/parse
  --verbose              Enable detailed logging
  --version              Print version number

Examples:
  subsrt parse sample.sbv
  subsrt parse sample.srt output.json
  subsrt parse sample.sub --fps 30
  subsrt build input.json output.vtt
  subsrt build input.json --format sbv
  subsrt detect unknown.txt
  subsrt convert sample.srt sample.vtt
  subsrt convert --offset -250 sample.srt sample.ssa
  subsrt resync --offset +3000 input.srt output.srt
  subsrt resync --fps 25-30 input.sub output.sub
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Using in JavaScript

The Node.js library supports converting, parsing and building subtitle file formats.
Subtitles can also be resynced by shifting time offset, extending the duration or changing FPS.

### List supported formats

```javascript
import subsrt from "subsrt";

const list = subsrt.list();

console.log(list.join(", "));
// vtt, lrc, smi, ssa, ass, sub, srt, sbv, json
```

Format name is used in conversion options, e.g. `{ format: "srt" }`

Use `subsrt.format.name` to access functions directly

```javascript
import subsrt from "subsrt";
const handler = subsrt.format.srt;
// handler = { name: 'srt', helper: [object], parse: [function], build: [function] }
```

To implement a new subtitle format handler do the following

```javascript
import subsrt from "subsrt";
subsrt.format.my = {
    // "my" is the format name
    name: "my",
    parse: (content, options) => {
        const captions = [];
        // ...
        return captions;
    },
    build: (captions, options) => {
        const content = "";
        // ...
        return content;
    },
    detect: (content) => {
        if (content.indexOf("my") > 0) {
            return true; // Recognized
        }
    },
};
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Detect

Recognizes format by content

```javascript
import subsrt from "subsrt";

let content = "";
content += "5" + "\r\n";
content += "00:00:16,700 --> 00:00:21,480" + "\r\n";
content += "Okay, so we have all the ingredients laid out here" + "\r\n";

const format = subsrt.detect(content);
// format = "srt"
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Parse

Parse a subtitle file

```javascript
import { readFileSync } from "fs";

import subsrt from "subsrt";

// Read a .srt file
const content = readFileSync("sample.srt", "utf8");

// Parse the content
const options = { verbose: true };
const captions = subsrt.parse(content, options);

// Output to console
console.log(captions);
```

Example of output

```json
[
    {
        "type": "caption", // "caption" or "meta"
        "index": 1, // Caption id, usually a sequential number
        "start": 599, // Time to show caption in milliseconds
        "end": 4160, // Time to hide caption in milliseconds
        "duration": 3561, // Calculated caption duration
        "content": ">> ALICE: Hi, my name is Alice Miller and this is John Brown", // Formatted content
        "text": "Hi, my name is Alice Miller and this is John Brown" // Plain text content
    },
    {
        "type": "caption",
        "index": 2,
        "start": 4160,
        "end": 6770,
        "duration": 2610,
        "content": ">> JOHN: and we're the owners of Miller Bakery.",
        "text": "and we're the owners of Miller Bakery."
    }
    // ...
]
```

List of options

-   `format`: explicitly select a parser, values: `sub`, `srt`, `sbv`, `vtt`, `lrc`, `smi`, `ssa`, `ass`, `json`, default is undefined to auto detect
-   `verbose`: set to true for extra messages, console only, default: `false`
-   `eol`: end of line character(s), default: `\r\n`
-   `fps`: frames per second, `sub` format only
-   `preserveSpaces`: keep white space lines, `smi` format only

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Build

Build a subtitle file

```javascript
import { writeFileSync } from "fs";

import subsrt from "subsrt";

// Sample captions
const captions = [
    {
        start: 599, // Time to show caption in milliseconds
        end: 4160, // Time to hide caption in milliseconds
        text: "Hi, my name is Alice Miller and this is John Brown", // Plain text content
    },
    {
        start: 4160,
        end: 6770,
        text: "and we're the owners of Miller Bakery.",
    },
];

// Build the WebVTT content
const options = { format: "vtt" };
const content = subsrt.build(captions, options);

// Write content to .vtt file
writeFileSync("generated.vtt", content);
```

List of options

-   `format`: required, output subtitle format, values: `sub`, `srt`, `sbv`, `vtt`, `lrc`, `smi`, `ssa`, `ass`, `json`, default: `srt`
-   `verbose`: set to true for extra messages, console only, default: `false`
-   `fps`: frames per second, `sub` format only
-   `closeTags`: set to true to close tags, `smi` format only

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Convert

Using a single action to convert from one to another subtitle format

```javascript
import { readFileSync, writeFileSync } from "fs";

import subsrt from "subsrt";

// Read a .srt file
const srt = readFileSync("sample.srt", "utf8");

// Convert .srt to .sbv
const sbv = subsrt.convert(srt, { format: "sbv" });

// Write content to .sbv file
writeFileSync("converted.sbv", sbv);
```

List of options

-   `format`: required, output subtitle format, values: `sub`, `srt`, `sbv`, `vtt`, `lrc`, `smi`, `ssa`, `ass`, `json`, default: `srt`
-   `verbose`: set to true for extra messages, console only, default: `false`
-   `eol`: end of line character(s), default: `\r\n`
-   `fps`: frames per second, `sub` format only
-   `resync`: resync options, see below

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Timeshift (+/- offset)

An example to make an extra 3-second delay

```javascript
import { readFileSync } from "fs";

import subsrt from "subsrt";

// Read a .srt file
const content = readFileSync("sample.srt", "utf8");
const captions = subsrt.parse(content);

// Returns updated captions
const resynced = subsrt.resync(captions, { offset: 3000 });
```

Use minus sign to display captions earlier

```javascript
const resynced = subsrt.resync(captions, { offset: -3000 });
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Change FPS

The .sub format has captions saved in frame units. To shift from 25 FPS to 30 FPS do the following

```javascript
import { readFileSync } from "fs";

import subsrt from "subsrt";

// Read a .sub file
const content = readFileSync("sample.sub", "utf8");
const captions = subsrt.parse(content, { fps: 25 }); // The .sub file content is saved in 25 FPS units

// Convert to 30 FPS, make sure to set 'frame' to true to convert frames instead of time
const resynced = subsrt.resync(content, { ratio: 30 / 25, frame: true });
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Advanced resync options

Extend caption duration by 500 ms

```javascript
// Argument 'a' is an array with two elements: [ start, end ]
// Return shifted [ start, end ] values
const resynced = subsrt.resync(content, (a) => [a[0], a[1] + 500]);
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Source code

Download the source code from the GitHub repository.

Install required packages if any

```console
yarn install
```

Run the unit tests

```console
yarn test
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See [LICENSE.txt](LICENSE.txt) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

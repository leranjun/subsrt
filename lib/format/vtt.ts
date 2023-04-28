import { buildHandler } from "../handler.js";
import { BuildOptions, Caption, ContentCaption, MetaCaption, ParseOptions } from "../types/handler.js";

const FORMAT_NAME = "vtt";

const helper = {
    toMilliseconds: (s: string) => {
        const match = /^\s*(\d{1,2}:)?(\d{1,2}):(\d{1,2})(?:[.,](\d{1,3}))?\s*$/.exec(s);
        if (!match) {
            throw new Error(`Invalid time format: ${s}`);
        }
        const hh = match[1] ? parseInt(match[1].replace(":", "")) : 0;
        const mm = parseInt(match[2]);
        const ss = parseInt(match[3]);
        const ff = match[4] ? parseInt(match[4]) : 0;
        const ms = hh * 3600 * 1000 + mm * 60 * 1000 + ss * 1000 + ff;
        return ms;
    },
    toTimeString: (ms: number) => {
        const hh = Math.floor(ms / 1000 / 3600);
        const mm = Math.floor((ms / 1000 / 60) % 60);
        const ss = Math.floor((ms / 1000) % 60);
        const ff = Math.floor(ms % 1000);
        const time = `${(hh < 10 ? "0" : "") + hh}:${mm < 10 ? "0" : ""}${mm}:${ss < 10 ? "0" : ""}${ss}.${ff < 100 ? "0" : ""}${
            ff < 10 ? "0" : ""
        }${ff}`;
        return time;
    },
};

/**
 * Parses captions in WebVTT format (Web Video Text Tracks Format)
 */
const parse = (content: string, options: ParseOptions) => {
    let index = 1;
    const captions: Caption[] = [];
    const parts = content.split(/\r?\n\s*\n/);
    for (const part of parts) {
        // WebVTT data
        const regex =
            /^([^\r\n]+\r?\n)?((?:\d{1,2}:)?\d{1,2}:\d{1,2}(?:[.,]\d{1,3})?)\s*-->\s*((?:\d{1,2}:)?\d{1,2}:\d{1,2}(?:[.,]\d{1,3})?)[^\S\r\n]?.*\r?\n([\s\S]*)$/;
        const match = regex.exec(part);
        if (match) {
            const caption = <ContentCaption>{};
            caption.type = "caption";
            caption.index = index++;
            if (match[1]) {
                caption.cue = match[1].replace(/[\r\n]*/g, "");
            }
            caption.start = helper.toMilliseconds(match[2]);
            caption.end = helper.toMilliseconds(match[3]);
            caption.duration = caption.end - caption.start;
            caption.content = match[4];
            caption.text = caption.content
                .replace(/<[^>]+>/g, "") // <b>bold</b> or <i>italic</i>
                .replace(/\{[^}]+\}/g, ""); // {b}bold{/b} or {i}italic{/i}
            captions.push(caption);
            continue;
        }

        // WebVTT meta
        // FIXME: prevent backtracking
        // eslint-disable-next-line regexp/no-super-linear-backtracking
        const meta = /^([A-Z]+)(\r?\n([\s\S]*))?$/.exec(part) || /^([A-Z]+)\s+([^\r\n]*)$/.exec(part);
        if (meta) {
            const caption = <MetaCaption>{};
            caption.type = "meta";
            caption.name = meta[1];
            if (meta[3]) {
                caption.data = meta[3];
            }
            captions.push(caption);
            continue;
        }

        if (options.verbose) {
            console.warn("Unknown part", part);
        }
    }
    return captions;
};

/**
 * Builds captions in WebVTT format (Web Video Text Tracks Format).
 */
const build = (captions: Caption[], options: BuildOptions) => {
    const eol = options.eol || "\r\n";
    let content = `WEBVTT${eol}${eol}`;
    for (let i = 0; i < captions.length; i++) {
        const caption = captions[i];
        if (caption.type === "meta") {
            if (caption.name === "WEBVTT") {
                continue;
            }
            content += caption.name + eol;
            content += typeof caption.data === "string" ? caption.data + eol : "";
            content += eol;
            continue;
        }

        if (!caption.type || caption.type === "caption") {
            content += (i + 1).toString() + eol;
            content += `${helper.toTimeString(caption.start)} --> ${helper.toTimeString(caption.end)}${eol}`;
            content += caption.text + eol;
            content += eol;
            continue;
        }

        if (options.verbose) {
            console.log("SKIP:", caption);
        }
    }

    return content;
};

/**
 * Detects a subtitle format from the content.
 */
const detect = (content: string) => {
    /*
    WEBVTT
    ...
    */
    return /^\s*WEBVTT\r?\n/.test(content);
};

export default buildHandler({ name: FORMAT_NAME, build, detect, helper, parse });
export { FORMAT_NAME as name, build, detect, helper, parse };

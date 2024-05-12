import { type Tokenizer, type Code } from "micromark-util-types";

export type WikiLinkSyntaxOptions = {
  aliasDivider?: string;
};

const codes = {
  horizontalTab: -2,
  virtualSpace: -1,
  nul: 0,
  eof: null,
  space: 32,
};

function markdownLineEndingOrSpace(code: Code) {
  return code !== codes.eof && (code < codes.nul || code === codes.space);
}

function markdownLineEnding(code: Code) {
  return code !== codes.eof && (code === null || code < codes.horizontalTab);
}

export function syntax(opts: WikiLinkSyntaxOptions = {}) {
  const aliasDivider = opts.aliasDivider || ":";

  const aliasMarker = aliasDivider;
  const startMarker = "[[";
  const endMarker = "]]";

  const tokenize: Tokenizer = (effects, ok, nok) => {
    let data: boolean;
    let alias: boolean;

    let aliasCursor = 0;
    let startMarkerCursor = 0;
    let endMarkerCursor = 0;

    return start;

    function start(code: Code) {
      if (code !== startMarker.charCodeAt(startMarkerCursor)) return nok(code);

      // @ts-expect-error
      effects.enter("wikiLink");
      // @ts-expect-error
      effects.enter("wikiLinkMarker");

      return consumeStart(code);
    }

    function consumeStart(code: Code) {
      if (startMarkerCursor === startMarker.length) {
        // @ts-expect-error
        effects.exit("wikiLinkMarker");
        return consumeData(code);
      }

      if (code !== startMarker.charCodeAt(startMarkerCursor)) {
        return nok(code);
      }

      effects.consume(code);
      startMarkerCursor++;

      return consumeStart;
    }

    function consumeData(code: Code) {
      if (markdownLineEnding(code) || code === codes.eof) {
        return nok(code);
      }

      // @ts-expect-error
      effects.enter("wikiLinkData");
      // @ts-expect-error
      effects.enter("wikiLinkTarget");
      return consumeTarget(code);
    }

    function consumeTarget(code: Code) {
      if (code === aliasMarker.charCodeAt(aliasCursor)) {
        if (!data) return nok(code);
        // @ts-expect-error
        effects.exit("wikiLinkTarget");
        // @ts-expect-error
        effects.enter("wikiLinkAliasMarker");
        return consumeAliasMarker(code);
      }

      if (code === endMarker.charCodeAt(endMarkerCursor)) {
        if (!data) return nok(code);
        // @ts-expect-error
        effects.exit("wikiLinkTarget");
        // @ts-expect-error
        effects.exit("wikiLinkData");
        // @ts-expect-error
        effects.enter("wikiLinkMarker");
        return consumeEnd(code);
      }

      if (markdownLineEnding(code) || code === codes.eof) {
        return nok(code);
      }

      if (!markdownLineEndingOrSpace(code)) {
        data = true;
      }

      effects.consume(code);

      return consumeTarget;
    }

    function consumeAliasMarker(code: Code) {
      if (aliasCursor === aliasMarker.length) {
        // @ts-expect-error
        effects.exit("wikiLinkAliasMarker");
        // @ts-expect-error
        effects.enter("wikiLinkAlias");
        return consumeAlias(code);
      }

      if (code !== aliasMarker.charCodeAt(aliasCursor)) {
        return nok(code);
      }

      effects.consume(code);
      aliasCursor++;

      return consumeAliasMarker;
    }

    function consumeAlias(code: Code) {
      if (code === endMarker.charCodeAt(endMarkerCursor)) {
        if (!alias) return nok(code);
        // @ts-expect-error
        effects.exit("wikiLinkAlias");
        // @ts-expect-error
        effects.exit("wikiLinkData");
        // @ts-expect-error
        effects.enter("wikiLinkMarker");
        return consumeEnd(code);
      }

      if (markdownLineEnding(code) || code === codes.eof) {
        return nok(code);
      }

      if (!markdownLineEndingOrSpace(code)) {
        alias = true;
      }

      effects.consume(code);

      return consumeAlias;
    }

    function consumeEnd(code: Code) {
      if (endMarkerCursor === endMarker.length) {
        // @ts-expect-error
        effects.exit("wikiLinkMarker");
        // @ts-expect-error
        effects.exit("wikiLink");
        return ok(code);
      }

      if (code !== endMarker.charCodeAt(endMarkerCursor)) {
        return nok(code);
      }

      effects.consume(code);
      endMarkerCursor++;

      return consumeEnd;
    }
  };

  return {
    text: { 91: { tokenize: tokenize } }, // left square bracket
  };
}

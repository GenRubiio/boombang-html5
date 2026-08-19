// design.md §16.3/§16.4 (tasks.md slice 11 tasks 5-7): per-frame SVG import — the reverse of
// svgFrameExport.cjs. Reads GEOMETRY from the SVG and SLOTS from the SIDECAR (authoritative —
// vector editors differ on whether they preserve `data-*` attributes), matched by document
// order. `d` strings pass through VERBATIM — never parsed/re-serialized, which is what makes
// R17b's exactness attainable. Rejects rather than guesses on every case design.md §16.3
// lists, naming the file/path index where practical.
//
// Regex-based element extraction rather than a full XML/DOM parser (no such dependency exists
// in this project) — sufficient for this controlled export/import contract, where geometry
// lives in simple `<path d="...">` elements this project's own exporter produces.

const { validateCommandAlphabet } = require('../../src/shared/assetPipeline/pathBounds.js');

function stripGuideGroups(svg) {
  return svg.replace(/<g\b[^>]*data-bb-role="guide"[^>]*>[\s\S]*?<\/g>/g, '');
}

// A <clipPath> def's own <path> (the clip SHAPE) is not one of the frame's own pieces — strip
// the whole <defs> block before extracting piece <path> elements, so it is never
// double-counted. Gradient defs contain no <path> at all, so this is always safe.
function stripDefs(svg) {
  return svg.replace(/<defs>[\s\S]*?<\/defs>/g, '');
}

function extractAttr(elementString, attrName) {
  const match = elementString.match(new RegExp(`${attrName}="([^"]*)"`));
  return match ? match[1] : undefined;
}

function extractOrigin(svg) {
  const match = svg.match(/data-bb-origin="([^"]+)"/);
  if (!match) {
    throw new Error('importFrameSvg: root <svg> is missing its authoritative data-bb-origin attribute');
  }
  return match[1].split(',').map(Number);
}

function extractGradientDef(svg, gradientId) {
  if (new RegExp(`<radialGradient\\b[^>]*id="${gradientId}"`).test(svg)) {
    throw new Error(`importFrameSvg: gradient "${gradientId}" is a radial gradient, which cannot be reduced back to {t:"l",...}`);
  }
  const defMatch = svg.match(new RegExp(`<linearGradient\\b([^>]*id="${gradientId}"[^>]*)>([\\s\\S]*?)<\\/linearGradient>`));
  if (!defMatch) {
    throw new Error(`importFrameSvg: no <linearGradient id="${gradientId}"> def found`);
  }
  const [, attrsString, bodyString] = defMatch;
  if (/gradientTransform=/.test(attrsString)) {
    throw new Error(`importFrameSvg: gradient "${gradientId}" carries a gradientTransform, which cannot be reduced back to {t:"l",...}`);
  }
  const gradientUnits = extractAttr(attrsString, 'gradientUnits');
  if (gradientUnits && gradientUnits !== 'userSpaceOnUse') {
    throw new Error(`importFrameSvg: gradient "${gradientId}" uses gradientUnits="${gradientUnits}" (objectBoundingBox is not reducible back to {t:"l",...})`);
  }

  const x1 = Number(extractAttr(attrsString, 'x1'));
  const y1 = Number(extractAttr(attrsString, 'y1'));
  const x2 = Number(extractAttr(attrsString, 'x2'));
  const y2 = Number(extractAttr(attrsString, 'y2'));

  const stops = [];
  const stopRegex = /<stop\b[^>]*\/?>/g;
  let stopMatch;
  while ((stopMatch = stopRegex.exec(bodyString))) {
    const stopEl = stopMatch[0];
    const offset = Number(extractAttr(stopEl, 'offset'));
    const color = extractAttr(stopEl, 'stop-color');
    stops.push([offset, color]);
  }

  return { t: 'l', st: stops, x1, y1, x2, y2 };
}

/**
 * @param {string} svg the (possibly hand-edited) SVG source
 * @param {{origin:[number,number], ss:number, paths:Array<{species:string,slot?:string,k?:number}>, cl:Record<string,string>}} sidecar
 * @param {Record<string,string>} colormetaDefaults
 * @returns {{frame: {o:[number,number], p:Array, cl:Record<string,string>}}}
 */
function importFrameSvg(svg, sidecar, colormetaDefaults) {
  const origin = extractOrigin(svg);
  const guidesStripped = stripGuideGroups(svg);
  const pathElements = stripDefs(guidesStripped).match(/<path\b[^>]*\/?>/g) || [];
  // Gradient defs live in <defs>, which was stripped above for piece-path extraction — but
  // extractGradientDef still needs to find them, so gradient lookups use the guides-stripped
  // (defs-INTACT) string, not the defs-stripped one.
  const strippedSvg = guidesStripped;

  if (pathElements.length !== sidecar.paths.length) {
    throw new Error(
      `importFrameSvg: path count mismatch — SVG has ${pathElements.length}, sidecar declares ${sidecar.paths.length}`
    );
  }

  const paths = pathElements.map((pathEl, index) => {
    const sidecarEntry = sidecar.paths[index];
    const d = extractAttr(pathEl, 'd');
    validateCommandAlphabet(d);

    const dataBbSlot = extractAttr(pathEl, 'data-bb-slot');
    if (dataBbSlot !== undefined && sidecarEntry.slot !== undefined && dataBbSlot !== sidecarEntry.slot) {
      throw new Error(
        `importFrameSvg: path ${index} — data-bb-slot="${dataBbSlot}" disagrees with the sidecar's declared slot "${sidecarEntry.slot}"`
      );
    }

    if (sidecarEntry.species === 'stroke') {
      return { d, s: extractAttr(pathEl, 'stroke'), w: Number(extractAttr(pathEl, 'stroke-width')) };
    }

    if (sidecarEntry.species === 'gradient') {
      const fillAttr = extractAttr(pathEl, 'fill') || '';
      const idMatch = fillAttr.match(/url\(#([^)]+)\)/);
      const gradientId = idMatch ? idMatch[1] : null;
      const g = extractGradientDef(strippedSvg, gradientId);
      const fillRule = extractAttr(pathEl, 'fill-rule');
      const piece = { d, g };
      if (fillRule === 'evenodd') piece.eo = 1;
      return piece;
    }

    // species === 'fill'
    const fillRule = extractAttr(pathEl, 'fill-rule');
    const piece = { d };
    if (fillRule === 'evenodd') piece.eo = 1;
    if (sidecarEntry.k !== undefined) piece.k = sidecarEntry.k;

    if (sidecarEntry.slot !== undefined) {
      // design.md §16.3: a slotted path's fill is DISCARDED on import (still neutralized to
      // white at compile time regardless, §5.2) — resolved from the slot default, never from
      // whatever the SVG visually shows. Warn, do not fail, when they disagree — a designer
      // recolouring a slotted path almost certainly meant a palette change (colormeta.json),
      // not the art.
      const expectedFill = `#${colormetaDefaults[sidecarEntry.slot]}`;
      const actualFill = extractAttr(pathEl, 'fill');
      if (actualFill && actualFill.toLowerCase() !== expectedFill.toLowerCase()) {
        console.warn(
          `importFrameSvg: path ${index} — SVG fill "${actualFill}" differs from the slot default "${expectedFill}" for slot "${sidecarEntry.slot}"; the slot default will be used (recolouring belongs in colormeta.json, not the art)`
        );
      }
      piece.f = expectedFill;
      piece.c = sidecarEntry.slot;
    } else {
      piece.f = extractAttr(pathEl, 'fill');
    }

    return piece;
  });

  return { frame: { o: sidecar.origin || origin, p: paths, cl: sidecar.cl || {} } };
}

module.exports = { importFrameSvg };

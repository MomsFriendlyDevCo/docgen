var defaultParsers = require('./paramParsers');
var response = require('./jsdoapiresponse');

module.exports = class JSDOAPIReader {

	/**
	* Various JSDoc parameters per line
	* Each key is the JSDOc param e.g. 'param', if no match is found the meta '@DEFAULT' is used instead
	* @type {Object}
	* @property {string} [as] Optional override to how the ID of the block should be referred to
	* @property {boolean} [enabled=true] Whether to accept this parameters input and add it to the current JSDOC block
	* @property {function} [handler] Optional function called as (operand) which returns the line payload, otherwise entire line is used
	* @property {boolean|string} [multiline=false] Whether the parameter can accept multiple line input until the next block (e.g. `@example`), if a string this specifies what property the multiline text should be appended to
	* @property {boolean} [isUnique=false] Only allow one of these items per block, if false all elements are appended as array items
	* @property {boolean} [endpoint='jsdoc'] How to handle the block once its extracted, sets the overall block.endpoint type so downstream can redirect it to the right endpoint
	*/
	params = {
		DEFAULT: {
			enabled: false,
		},
		description: {
			multiline: 'description',
		},
		example: {
			multiline: 'content',
			handler: defaultParsers.description,
		},
		param: {
			as: 'params',
			handler: defaultParsers.typeNameDescription,
		},
		returns: {
			isUnique: true,
			handler: defaultParsers.typeDescription,
		},
		route: {
			endpoint: 'oapi',
			isUnique: true,
			handler: defaultParsers.rest,
		},
	};


	/**
	* Attempt to parse an input string returning all extracted JSDoc + OAPI translactions
	* @param {string} input Input string to parse
	* @param {object} [options] Additional options to use when parsing
	* @returns {JSDOCAPIResponse} Response object
	* @see parseJSDoc() For futher option parsing
	*/
	parseString(input, options) {
		var out = new response();
		var blocks = this.parseJSDoc(input, options);

		return {
			oapi: blocks.filter(b => b.endpoint == 'oapi'),
			jsdoc: blocks.filter(b => b.endpoint != 'oapi'),
		};
	};


	/**
	* Attempt to parse an input string returning all extracted JSDoc blocks
	* @param {string} input Input string to parse
	* @param {object} [options] Additional options to use when parsing
	* @param {string} [options.initialBlock='description'] Start parsing within this block (must a multiline param)
	* @param {number} [options.lineOffset=1] Initial line offset (must be at least 1 to counnter zero based line numbering)
	* @returns {array<Object>} Collection of all extracted JSDoc blocks
	*/
	parseJSDoc(input, options) {
		var settings = {
			initialBlock: 'description',
			lineOffset: 1,
			...options,
		};

		var out = [];

		var inBlock = false;
		var inMultiline = false; // or the string pointer to the parameter in block to append to
		var block; // {desc, ...jsdocHeaders}

		input.split(/\s*\n\s*/)
			.forEach((line, lineOffset) => {
				if (/^\s*\/\*\*/.test(line)) { // Start of block
					if (inBlock) throw new Error(`Start of block when already in block at line ${lineOffset+settings.lineOffset}`);
					block = {};
					if (settings.initialBlock && this.params[settings.initialBlock]?.isMultiline) throw new Error('parseJSDoc({initialBlock}) must be a multiline param');
					if (settings.initialBlock) inMultiline = settings.initialBlock;
					inBlock = true;
				} else if (/^\s*\*\//.test(line)) { // End of comment block area
					if (!inBlock) throw new Error(`Attempt to close non-existant block at line ${lineOffset+settings.lineOffset}`);
					out.push(block);
					block = {};
					inBlock = false;
					inMultiline = false;
				} else if (inBlock) {
					var lineParsed = /^\s*\*\s*@(?<param>\w+) (?<operand>.*)$/.exec(line)?.groups;
					if (!lineParsed && inMultiline) { // Invalid parse + is in multiline - append to multiline data
						block[inMultiline] = (block[inMultiline] ? block[inMultiline] + '\n' : '') + line.replace(/^\s*\*\s*/, '');
					} else if (!lineParsed) { // Non-parsable - ignore
						// Pass - Nothing to extract, probably a blank line
					} else { // Single line JSDoc parameter - extract JSDoc line into block
						// Decide what parameter block to handle
						var paramSettings = this.params[lineParsed.param] || this.params.DEFAULT;
						var paramId = paramSettings.as || lineParsed.param;
						if (!(paramSettings.enabled ?? true)) return; // Don't handle this param

						var value = paramSettings.handler // Has a handler - glue output to existing block
							? paramSettings.handler(lineParsed.operand)
							: lineParsed.operand;

						if (paramSettings.isUnique && block[paramId]) { // Check if its supposed to be unique and we already have one
							throw new Error(`Block parameter already exists "${lineParsed.param}" at line ${lineOffset+settings.lineOffset} - it is supposed to be unique`);
						} else if (paramSettings.isUnique) { // Simple key=val
							block[paramId] = value;
						} else { // Assume arrays for everything else
							if (!block[paramId]) block[paramId] = [];
							block[paramId].push(value);
						}

						if (paramSettings.endpoint && paramSettings.endpoint != 'jsdoc') {
							if (block.endpoint) throw new Error(`Trying to overwrite existing JSDoc endpoint "${block.endpoint}" with "${paramSettings.endpoint}" on line ${lineOffset+settings.lineOffset} - can only use one eventual endpoint`);
							block.endpoint = paramSettings.endpoint;
						}
					}
				}
			});

		return out;
	};
}

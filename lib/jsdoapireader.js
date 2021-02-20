var _ = require('lodash');
var defaultParsers = require('./paramParsers');
var fs = require('fs');
var response = require('./jsdoapiresponse');

module.exports = class JSDOAPIReader {

	/**
	* Various JSDoc parameters per line
	* Each key is the JSDOc param e.g. 'param', if no match is found the meta '@DEFAULT' is used instead
	*
	* @type {Object}
	* @property {string} [as] Optional override to how the ID of the block should be referred to
	* @property {boolean} [enabled=true] Whether to accept this parameters input and add it to the current JSDOC block
	* @property {function} [handler] Optional function called as (operand) which returns the line payload, otherwise entire line is used
	* @property {boolean|string} [multiline=false] Whether the parameter can accept multiple line input until the next block (e.g. `@example`), if a string this specifies what property the multiline text should be appended to
	* @property {boolean} [isUnique=false] Only allow one of these items per block, if false all elements are appended as array items
	* @property {boolean} [endpoint='jsdoc'] How to handle the block once its extracted, sets the overall block.endpoint type so downstream can redirect it to the right endpoint
	*/
	params = {
		DEFAULT: {enabled: false},
		abstract: {handler: defaultParsers.flag, alias: 'virtual'},
		access: {handler: defaultParsers.enum('package', 'private', 'protected', 'public')},
		alias: {handler: defaultParsers.description},
		async: {handler: defaultParsers.flag},
		augments: {handler: defaultParsers.description, alias: 'extends'},
		author: {handler: defaultParsers.author},
		borrows: {handler: defaultParsers.description},
		callback: {handler: defaultParsers.description},
		classdesc: {handler: defaultParsers.description},
		class: {handler: defaultParsers.split('type', 'name'), alias: 'constructor'},
		constant: {handler: defaultParsers.split('type', 'name'), alias: 'const'},
		constucts: {handler: defaultParsers.name},
		copyright: {handler: defaultParsers.description},
		default: {handler: defaultParsers.value, alias: 'defaultvalue'},
		depreciated: {handler: defaultParsers.description},
		description: {multiline: 'description', alias: 'desc'},
		enum: {handler: defaultParsers.type},
		event: {handler: defaultParsers.pointer},
		example: {multiline: 'content', handler: defaultParsers.description},
		exports: {handler: defaultParsers.name},
		external: {handler: defaultParsers.name, alias: 'host'},
		file: {handler: defaultParsers.description, alias: ['fileoverview', 'overview']},
		fires: {handler: defaultParsers.pointer, alias: 'emits'},
		function: {handler: defaultParsers.flag},
		generator: {handler: defaultParsers.flag},
		global: {handler: defaultParsers.flag},
		hideconstructor: {handler: defaultParsers.flag},
		ignore: {handler: defaultParsers.flag},
		implements: {handler: defaultParsers.name},
		inheritdoc: {handler: defaultParsers.flag},
		inner: {handler: defaultParsers.flag},
		instance: {handler: defaultParsers.flag},
		interface: {handler: defaultParsers.flag},
		kind: {handler: defaultParsers.name},
		lends: {handler: defaultParsers.name},
		license: {handler: defaultParsers.name},
		listens: {handler: defaultParsers.name},
		member: {handler: defaultParsers.typeName},
		memberof: {handler: defaultParsers.name},
		mixes: {handler: defaultParsers.name},
		mixin: {handler: defaultParsers.name},
		module: {handler: defaultParsers.typeName},
		name: {handler: defaultParsers.name},
		namespace: {handler: defaultParsers.name},
		override: {handler: defaultParsers.flag},
		package: {handler: defaultParsers.flag},
		param: {as: 'params', handler: defaultParsers.typeNameDescription, alias: ['arg', 'argument']},
		private: {handler: defaultParsers.flag},
		property: {handler: defaultParsers.flag, alias: 'prop'},
		protected: {handler: defaultParsers.flag},
		public: {handler: defaultParsers.flag},
		readonly: {handler: defaultParsers.flag},
		requires: {handler: defaultParsers.name},
		returns: {isUnique: true, handler: defaultParsers.typeDescription, alias: 'return'},
		route: {endpoint: 'oapi', isUnique: true, handler: defaultParsers.rest},
		see: {handler: defaultParsers.description},
		since: {handler: defaultParsers.name},
		static: {handler: defaultParsers.flag},
		summary: {handler: defaultParsers.description},
		this: {handler: defaultParsers.name},
		throws: {handler: defaultParsers.name},
		todo: {handler: defaultParsers.description},
		tutorial: {handler: defaultParsers.description},
		typedef: {isUnique: true, handler: defaultParsers.typeName},
		type: {isUnique: true, handler: defaultParsers.description},
		variation: {isUnique: true, handler: defaultParsers.name},
		version: {isUnique: true, handler: defaultParsers.name},
		yields: {isUnique: true, handler: defaultParsers.typeDescription},
	};


	constructor() {
		// Expand this.params to include pointers for all aliases
		Object.values(this.params)
			.filter(param => param.alias)
			.forEach(param => _.castArray(param.alias).forEach(alias =>
				this.params[alias] = param
			))
	};


	/**
	* Parse file paths extracting all JSDoc + OAPI specs
	*
	* @param {string|array<string>} paths Path(s) to process
	* @param {object} [options] Additional options to use when parsing
	* @see parseJSDoc() For futher option parsing
	* @returns {Promise<object>} A promise which will resolve with the eventual response object
	*/
	parseFiles(paths, options) {
		return Promise.all(
			_.castArray(paths)
				.map(path => fs.promises.readFile(path, 'utf-8'))
		)
			.then(fileContents => fileContents.reduce((t, v) => t += v, ''))
			.then(mergedContents => this.parseString(mergedContents, options))
	};


	/**
	* Attempt to parse an input string returning all extracted JSDoc + OAPI translactions
	*
	* @param {string} input Input string to parse
	* @param {object} [options] Additional options to use when parsing
	* @returns {JSDOCAPIResponse} Response object
	* @see parseJSDoc() For futher option parsing
	*/
	parseString(input, options) {
		var blocks = this.parseJSDoc(input, options);

		return {
			jsdoc: blocks
				.filter(b => b.function || !b.route),

			oapi: {
				paths: _(blocks)
					.filter(b => !b.function && b.route)
					.mapKeys(b => b.route.path)
					.mapValues(b => ({
						[b.route.method]: {
							summary: b.description,
						},
					}))
					.value()
			},
		};
	};


	/**
	* Attempt to parse an input string returning all extracted JSDoc blocks
	*
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
			context: (block, lines) => lines
				.find(line => {
					var match;
					line = _.trimStart(line);
					if (!line || /\s*\/\//.test(line)) return false; // if blank || comment skip
					if (match = /^app\.(?<method>delete|get|post)\((?<speachmark>['"`])(?<path>.+?)\k<speachmark>\s*,/.exec(line)?.groups) { // Looks like a doop endpoint (e.g. `app.get('/api', (req, res) => ...)`)
						if (!block.route) block.route = {}; // No route manually set - assign stub
						block.route.method = match.method;
						block.route.path = match.path;
						return true;
					} else if (match = /^(?<function>app\..+?)\s*=/.exec(line)?.groups) { // Global Doop app.FUNC
						block.name = match.function;
						block.function = true;
						block.global = true;
						return true;
					} else if (match = /^(?<function>.+?)\s*=/.exec(line)?.groups) {
						block.name = match.function;
						block.function = true;
						return true;
					}
				}),
			postProcess: block => {
				// Clean up descriptions
				block.description = _.trim(block.description);

				// Extract missing req.params if they are omitted
				if (settings.warnRouteMissingArgs && block.route) {
					var definedParams = new Set((block.params ?? []).map(p => p.name));

					[...block.route.path.matchAll(/(?::(?<param>\w+))/g)]
						.map(m => `req.params.${m.groups.param}`)
						.filter(param => !definedParams.has(param))
						.forEach(param => settings.warn('warnRouteMissingArgs', `Param "${param}" missing from definition of route '${block.method} ${block.path}'`))
				}
			},
			warn: (type, ...msg) => {
				console.log('[WARN]', ...msg);
			},
			warnRouteMissingArgs: true, // Warn when a route has missing req.params (extacted from urls like `/api/widgets/:id`
			...options,
		};

		var out = [];

		var inBlock = false;
		var inMultiline = false; // or the string pointer to the parameter in block to append to
		var block; // {desc, ...jsdocHeaders}

		input.split(/\s*\n\s*/)
			.forEach((line, lineOffset, lines) => {
				if (/^\s*\/\*\*/.test(line)) { // Start of block
					if (inBlock) throw new Error(`Start of block when already in block at line ${lineOffset+settings.lineOffset}`);
					block = {};
					if (settings.initialBlock && this.params[settings.initialBlock]?.isMultiline) throw new Error('parseJSDoc({initialBlock}) must be a multiline param');
					if (settings.initialBlock) inMultiline = settings.initialBlock;
					inBlock = true;
				} else if (/^\s*\*\//.test(line)) { // End of comment block area
					if (!inBlock) throw new Error(`Attempt to close non-existant block at line ${lineOffset+settings.lineOffset}`);
					settings.context(block, lines.slice(lineOffset + 1));
					settings.postProcess(block);
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

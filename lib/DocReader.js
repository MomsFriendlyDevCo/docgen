import _ from 'lodash';
import fs from 'fs';
//import DocResponse from '@momsfriendlydevco/docgen';
//import {DefaultParsers as parsers} from '@momsfriendlydevco/docgen';
import parsers from './DefaultParsers.js';

import * as Debug from 'debug';
const debug = Debug('docgen:DocReader');

export default class DocReader {

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
		abstract: {handler: parsers.flag, alias: 'virtual'},
		access: {handler: parsers.enum('package', 'private', 'protected', 'public')},
		alias: {handler: parsers.description},
		async: {handler: parsers.flag},
		augments: {handler: parsers.description, alias: 'extends'},
		author: {handler: parsers.author},
		borrows: {handler: parsers.description},
		callback: {handler: parsers.description},
		classdesc: {handler: parsers.description},
		class: {handler: parsers.split('type', 'name'), alias: 'constructor'},
		constant: {handler: parsers.split('type', 'name'), alias: 'const'},
		constucts: {handler: parsers.name},
		copyright: {handler: parsers.description},
		default: {handler: parsers.value, alias: 'defaultvalue'},
		depreciated: {handler: parsers.description},
		description: {multiline: 'description', alias: 'desc'},
		enum: {handler: parsers.type},
		event: {handler: parsers.pointer},
		example: {multiline: 'content', handler: parsers.description},
		exports: {handler: parsers.name},
		external: {handler: parsers.name, alias: 'host'},
		file: {handler: parsers.description, alias: ['fileoverview', 'overview']},
		fires: {handler: parsers.pointer, alias: 'emits'},
		function: {handler: parsers.flag},
		generator: {handler: parsers.flag},
		global: {handler: parsers.flag},
		hideconstructor: {handler: parsers.flag},
		ignore: {handler: parsers.flag},
		implements: {handler: parsers.name},
		inheritdoc: {handler: parsers.flag},
		inner: {handler: parsers.flag},
		instance: {handler: parsers.flag},
		interface: {handler: parsers.flag},
		kind: {handler: parsers.name},
		lends: {handler: parsers.name},
		license: {handler: parsers.name},
		listens: {handler: parsers.name},
		member: {handler: parsers.typeName},
		memberof: {handler: parsers.name},
		mixes: {handler: parsers.name},
		mixin: {handler: parsers.name},
		module: {handler: parsers.typeName},
		name: {handler: parsers.name},
		namespace: {handler: parsers.name},
		override: {handler: parsers.flag},
		package: {handler: parsers.flag},
		param: {as: 'params', handler: parsers.typeNameDescription, alias: ['arg', 'argument']},
		private: {handler: parsers.flag},
		property: {handler: parsers.flag, alias: 'prop'},
		protected: {handler: parsers.flag},
		public: {handler: parsers.flag},
		readonly: {handler: parsers.flag},
		requires: {handler: parsers.name},
		returns: {isUnique: true, handler: parsers.typeDescription, alias: 'return'},
		route: {endpoint: 'oapi', isUnique: true, handler: parsers.rest},
		see: {handler: parsers.description},
		since: {handler: parsers.name},
		static: {handler: parsers.flag},
		summary: {handler: parsers.description},
		this: {handler: parsers.name},
		throws: {handler: parsers.name},
		todo: {handler: parsers.description},
		tutorial: {handler: parsers.description},
		typedef: {isUnique: true, handler: parsers.typeName},
		type: {isUnique: true, handler: parsers.description},
		variation: {isUnique: true, handler: parsers.name},
		version: {isUnique: true, handler: parsers.name},
		yields: {isUnique: true, handler: parsers.typeDescription},
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
				.map(path => fs.promises.readFile(path, 'utf-8')
					.then(contents => {
						debug('Processing: ', path)
						return this.parseString(contents, options);
					}))
		)
		.then(contents => contents.reduce((acc, cur) => _.merge(acc, cur), {}))	
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
							//...customisation,
							...(b.description ? {description: b.description} : {}),
							...(b.summary ? {summary: b.summary} : {}),
							...(b.security ? {security: b.security} : []),
							...(b.tags ? {tags: b.tags} : []),
							...(b.params ? {parameters: b.params
								.filter(param => _.isPlainObject(param) && Object.prototype.hasOwnProperty.call(param, 'name') && (
									param.name.startsWith('req.params.') || 
									param.name.startsWith('req.query.') || 
									param.name.startsWith('req.headers.')
								))
								.map(param => {
									// Accept node spec and return OAPI schema
									// e.g. '*', 'string', 'array<number>', 'array<object>', 'string|number'
									var schemaRender = node => {
										if (/\|/.test(node.type)) {
											return {oneOf: // Multiple types
												param.type.split(/\s*\|\s*/).map(schemaRender)
											};
										} else if (/^(<(?<wrapper>)>)(?<childType>.+)$/.exec(node)?.groups) { // e.g. `array<string>`
											throw new Error(`Only direct syntax types are supported now. Dont use "array<number>" style inputs for @route. Detected at "${node}`);
										} else if (node.type) {
											return {type: node.type};
										} else if (_.isString(node)) {
											return {type: node};
										} else {
											throw new Error(`Unable to parse schema for "${node}"`);
										}
									};

									var schema =
										param.type == '*' ? {} // Accept everything anyway
										: /\|/.test(param.type) ? {schema: {oneOf: // Multiple types
											param.type.split(/\s*\|\s*/).map(schemaRender)
										}}
										: {schema: schemaRender(param.type)}; // Single type


									// Extracting default from key="value" style names
									let match;
									if (match = /^(?<key>[\w\.]+)=(?<val>[^\s]+)$$/.exec(param.name)) {
										param.name = match.groups.key;			
										schema.schema.default = (
											/^\".*\"$/.exec(match.groups.val)
										)?match.groups.val:new Number(match.groups.val);

										// Include default in description to work-around widdershins user_templates failure
										param.description += ` (default: ${schema.schema.default})`;
									}

									if (param.name.startsWith('req.params.')) {
										return {
											name: param.name.replace(/^req\.params\./, ''),
											in: 'path',
											description: param.description,
											required: param.isRequired,
											...schema,
										};
									} else if (param.name.startsWith('req.query.')) {
										return {
											name: param.name.replace(/^req\.query\./, ''),
											in: 'query',
											description: param.description,
											required: param.isRequired,
											...schema,
										};
									} else if (param.name.startsWith('req.headers.')) {
										return {
											name: param.name.replace(/^req\.headers\./, ''),
											in: 'header',
											description: param.description,
											required: param.isRequired,
											...schema,
										};
									} else {
										console.log('[WARN]', 'Unrecognised param', param.name)
										return null;
									}
								})} : {}
							),
						},
					})
				)
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
			context: (block, lines) => { // Determine context from next code lines - return truthy when found or false if nothing
				return lines
					.find(line => {
						var match;
						line = _.trimStart(line);
						if (!line || /\s*\/\//.test(line)) return false; // if blank || comment skip
						if (match = /^app\.(?<method>delete|get|head|options|patch|post|put|trace)\((?<speachmark>['"`])(?<path>.+?)\k<speachmark>\s*,/.exec(line)?.groups) { // Looks like a doop endpoint (e.g. `app.get('/api', (req, res) => ...)`)
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
					});
			},
			contextLimit: 3, // Max number of lines to look ahead to auto-determine context before erroring out
			postProcess: block => {
				// Clean up descriptions
				block.description = _.trim(block.description);

				// Extract missing req.params if they are omitted
				if (settings.warnRouteMissingArgs && block.route) {
					var definedParams = new Set((block.params ?? []).map(p => p.name));

					[...block.route.path.matchAll(/(?::(?<param>\w+))/g)]
						.map(m => `req.params.${m.groups.param}`)
						.filter(param => !definedParams.has(param))
						.forEach(param => settings.warn('warnRouteMissingArgs', `Param "${param}" missing from definition of route '${block.route.method} ${block.route.path}'`))
				}
			},
			warn: (type, ...msg) => {
				console.log('[WARN]', ...msg);
			},
			warnNoAutoContext: false, // Warn when the context of a function cannot be determined
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
					if (inBlock) {
						debug('Opening line: ', lineOffset+settings.lineOffset);
						settings.warn(`warnStartWithinStart`, `Start of block when already in block at line ${lineOffset+settings.lineOffset}`);
						return;
					}
					block = {};
					if (settings.initialBlock && this.params[settings.initialBlock]?.isMultiline) throw new Error('parseJSDoc({initialBlock}) must be a multiline param');
					if (settings.initialBlock) inMultiline = settings.initialBlock;
					inBlock = true;
				} else if (/^\s*\*\//.test(line)) { // End of comment block area
					if (!inBlock) {
						debug('Closing line: ', lineOffset+settings.lineOffset);
						settings.warn(`warnClosingWithoutOpening`, `Attempt to close non-existant block at line ${lineOffset+settings.lineOffset}`);
						return;
					}

					if (
						!block.route // No manual route definition (OAPI)
						&& !block.name // No manual function name either (JSDOC)
						&& !settings.context(block, lines.slice(lineOffset + 1, lineOffset + 1 + settings.contextLimit)) // Could not determine anything from context
						&& settings.warnNoAutoContext // And we should warn
					) settings.warn(`warnNoAutoContext`, `Cannot determine context of block at line ${lineOffset+settings.lineOffset} - define @name or @route tags`)

					settings.postProcess(block);
					out.push(block);
					block = {};
					inBlock = false;
					inMultiline = false;
				} else if (inBlock) {
					//debug('Line: ' + line);
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

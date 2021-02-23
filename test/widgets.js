import {expect} from 'chai';
import DocReader from '@momsfriendlydevco/docgen/DocReader';
import fspath from 'path';

let __dirname = fspath.resolve(fspath.dirname(decodeURI(new URL(import.meta.url).pathname)));

describe('widgets E2E test', ()=> {

	it('should parse the widget example', async ()=> {
		var contents = await (new DocReader())
			.parseFiles([
				`${__dirname}/data/widgets.api.js`,
				`${__dirname}/data/widgets.rest.js`,
			]);

		expect(contents).to.be.deep.equal({
			jsdoc: [
				{
					name: 'app.db.widgets.find',
					description: 'List all widgets',
					function: true,
					global: true,
					params: [
						{type: 'object', name: 'query', description: 'Additional query parameters, if any', isRequired: false},
					],
					returns: {type: 'array<object>', description: 'Widgets matching the query'},
				},
				{
					name: 'app.db.widgets.findById',
					description: 'Fetch a specific widget',
					function: true,
					global: true,
					params: [
						{type: 'string', name: 'id', description: 'The widget ID to find', isRequired: true},
					],
					returns: {type: 'object', description: 'Found widget or undefined'},
				},
			],
			oapi: {
				paths: {
					'/api/widgets': {
						get: {
							description: 'List all widgets within the system',
						},
					},
					'/api/widgets/search': {
						get: {
							description: 'Search for specific widgets by a loose term',
							parameters: [{
								description: "Query to search by",
								in: 'query',
								name: 'q',
								required: true,
								schema: {type: 'string'},
							}],
						},
					},
					'/api/widgets/:id': {
						get: {
							description: 'Fetch a specific widget',
							parameters: [{
								description: "The ID of the widget to fetch",
								in: 'path',
								name: 'id',
								required: true,
								schema: {type: 'string'},
							}],
						},
					},
				},
			},
		});
	});

});

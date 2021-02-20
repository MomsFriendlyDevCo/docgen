var expect = require('chai').expect;
var {JSDOAPIReader} = require('..');

describe('widgets E2E test', ()=> {

	it('should parse the widget example', async ()=> {
		var contents = await (new JSDOAPIReader())
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
						{type: 'object', name: '[query]', description: 'Additional query parameters'},
					],
					returns: {type: 'array<object>', description: 'Widgets matching the query'},
				},
				{
					name: 'app.db.widgets.findById',
					description: 'Fetch a specific widget',
					function: true,
					global: true,
					params: [
						{type: 'string', name: 'id', description: 'The widget ID to find'},
					],
					returns: {type: 'object', description: 'Found widget or undefined'},
				},
			],
			oapi: {
				paths: {
					'/api/widgets': {
						get: {summary: 'List all widgets within the system'},
					},
					'/api/widgets/search': {
						get: {summary: 'Search for specific widgets by a loose term'},
					},
					'/api/widgets/:id': {
						get: {summary: 'Fetch a specific widget'},
					},
				},
			},
		});
	});

});

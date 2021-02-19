var expect = require('chai').expect;
var {JSDOAPIReader} = require('..');

describe('parseString', ()=> {

	it('should parse combined JSDoc /OAPI units', ()=> {
		expect(
			(new JSDOAPIReader())
				.parseString([
					'/**',
					'* Search for widgets',
					'* @route GET /api/widgets/search',
					'* @param {string} req.query.q Query to run',
					'* @returns {Object} Response object',
					'*/',
					'',
					'/**',
					'* Simple function that adds two numbers together',
					'* @param {number} a First number to add',
					'* @param {number} b Second number to add',
					'* @returns {number} The sum of both numbers',
					'*/',
				].join('\n')) // Split back into an array
		).to.be.deep.equal({
			jsdoc: [
				{
					description: 'Simple function that adds two numbers together',
					params: [
						{type: 'number', name: 'a', description: 'First number to add'},
						{type: 'number', name: 'b', description: 'Second number to add'},
					],
					returns: {type: 'number', description: 'The sum of both numbers'},
				},
			],
			oapi: {
				paths: {
					'/api/widgets/search': {
						get: {summary: 'Search for widgets'},
					},
				},
			},
		})
	});

});

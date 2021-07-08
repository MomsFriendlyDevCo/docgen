const expect = require('chai').expect;
const _ = require('lodash');
const DocReader  = require('../').DocReader;

describe('parseString', ()=> {

	it('should parse combined JSDoc /OAPI units', ()=> {
		expect(
			(new DocReader())
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
						{type: 'number', name: 'a', description: 'First number to add', isRequired: true},
						{type: 'number', name: 'b', description: 'Second number to add', isRequired: true},
					],
					returns: {type: 'number', description: 'The sum of both numbers'},
				},
			],
			oapi: {
				paths: {
					'/api/widgets/search': {
						get: {
							description: 'Search for widgets',
							parameters: [{
								description: 'Query to run',
								in: 'query',
								name: 'q',
								required: true,
								schema: {type: 'string'},
							}],
						},
					},
				},
			},
		})
	});

});

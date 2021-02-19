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
			oapi: {
				paths: {
					'/api/widgets/search': {
						get: {
							summary: 'Search for widgets',
							responses: {
								200: {
									description: '200 response',
								},
							},
						},
					},
				},
			},
		})
	});

});

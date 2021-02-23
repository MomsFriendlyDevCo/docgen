import {expect} from 'chai';
import DocReader from '@momsfriendlydevco/docgen/DocReader';

describe('parseString', ()=> {

	it('should parse combined JSDoc blocks', ()=> {
		expect(
			(new DocReader())
				.parseJSDoc([
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
		).to.be.deep.equal([
			{
				endpoint: 'oapi',
				description: 'Search for widgets',
				route: {method: 'get', path: '/api/widgets/search'},
				params: [
					{type: 'string', name: 'req.query.q', description: 'Query to run', isRequired: true},
				],
				returns: {type: 'Object', description: 'Response object'},
			},
			{
				description: 'Simple function that adds two numbers together',
				params: [
					{type: 'number', name: 'a', description: 'First number to add', isRequired: true},
					{type: 'number', name: 'b', description: 'Second number to add', isRequired: true},
				],
				returns: {type: 'number', description: 'The sum of both numbers'},
			},
		])
	});

});

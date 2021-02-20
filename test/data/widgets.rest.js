/**
* List all widgets within the system
*
* @route GET /api/widgets
* @returns {array<object>} Widget list
*/
app.get('/api/widgets', (req, res) => { });

/**
* Search for specific widgets by a loose term
*
* @route GET /api/widgets/search
* @param {string} req.query.q Query to search by
* @returns {array<object>} Widget results
*/
app.get('/api/widgets/search', (req, res) => { });


/**
* Fetch a specific widget
*
* @route GET /api/widgets/:id
* @param {string} req.params.id The ID of the widget to fetch
* @returns {object} The fetched widget
*/
app.get('/api/widgets/:id', (req, res) => { });

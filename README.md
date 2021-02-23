@MomsFriendlyDevCo/DocGen
=========================
Documentation generator for JSDoc + JSDoc-to-OpenAPI.

The purpose of this module is to parse inline JSDoc documentation + JSDoc for Express style endpoints. This data is then output into two destinations - regular JSDoc generated documentation and OpenAPI compatible documentation.


Regular JSDoc parsing is supported:

```javascript
/**
* List all widgets
* @param {object} [query] Additional query parameters, if any
* @returns {array<object>} Widgets matching the query
*/
app.db.widgets.find = query => { };
```


As well as Express-like route parsing (translated into OpenAPI / Swagger):

```javascript
/**
* List all widgets within the system
* @returns {array<object>} Widget list
*/
app.get('/api/widgets', (req, res) => { });


/**
* Search for specific widgets by a loose term
* @param {string} req.query.q Query to search by
* @returns {array<object>} Widget results
*/
app.get('/api/widgets/search', (req, res) => { });


/**
* Fetch a specific widget
* @param {string} req.params.id The ID of the widget to fetch
* @returns {object} The fetched widget
*/
app.get('/api/widgets/:id', (req, res) => { });
```

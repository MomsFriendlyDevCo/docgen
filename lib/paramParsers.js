module.exports = {
	// Parse `description` lines as {description: String}
	description(line) {
		return {description: line};
	},

	//
	// Parse `{type} description` as {type: String, description: String}
	typeDescription(line) {
		var parsed = /(\{(?<type>.+?)\})?\s*(?<description>.*)$/.exec(line)?.groups;
		if (!parsed) throw new Error(`Failed to parse "${line}" as type?+description`);
		return parsed;
	},


	// Parse @param style `{type} [name] description` as {type: String, name: String, description: String}
	typeNameDescription(line) {
		var parsed = /(\{(?<type>.+?)\})?\s*(?<name>.+?)\s+(?<description>.*)$/.exec(line)?.groups;
		if (!parsed) throw new Error(`Failed to parse "${line}" as type+name?+description`);
		return parsed;
	},


	// Parse @route style `GET /api/widgets` as {method: String, path: String}
	rest(line) {
		var parsed = /^(?<method>[A-Z]+)?\s*(?<path>.+)$/.exec(line)?.groups;
		if (!parsed) throw new Error(`Failed to parse "${line}" as ReST URL`);
		parsed.method = parsed.method ? parsed.method.toLowerCase() : 'get';
		return parsed;
	},
};

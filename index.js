const estreeWalker = require('estree-walker');
const MagicString = require('magic-string');
const pluginutils = require('@rollup/pluginutils');


function createPlugin(options) {
	if (!options) options = {};
	var { include, exclude, sourcemap, imported } = options
	var filter = pluginutils.createFilter(include, exclude);
	var sourceMap = options.sourceMap !== false && sourcemap !== false;

	return {
		name: "plugin-require",
		transform(code, id) {
			if (!filter(id)) { return null; }
			var ast = null;
			try {
				ast = this.parse(code);
			} catch (err) {
				this.warn({
					code: 'PARSE_ERROR',
					message: ("rollup-plugin-require: failed to parse " + id + ". Consider restricting the plugin to particular files via options.include")
				});
			}
			if (!ast) {
				return null;
			}

			var imports = new Set();
			ast.body.forEach(function (node) {
				if (node.type === 'ImportDeclaration') {
					node.specifiers.forEach(function (specifier) {
						imports.add(specifier.local.name);
					});
				}
			});

			var scope = pluginutils.attachScopes(ast, 'scope');
			var magicString = new MagicString(code);
			var scopeNames = new Array();

			estreeWalker.walk(ast, {
				enter: function enter(node, parent) {
					if (sourceMap) {
						magicString.addSourcemapLocation(node.start);
						magicString.addSourcemapLocation(node.end);
					}
					if (node.scope) {
						scope = node.scope;
					}
					if (node.type === "CallExpression") {
						var callee = node.callee;
						if (callee) {
							if (callee.type === "Identifier") {
								if (callee.name === "require") {
									let arguments = node.arguments;
									if (arguments && arguments.length === 1) {
										var arg1 = arguments[0];
										if (arg1 && arg1.type == "Literal") {
											var package = arg1.value;
											var varBase = "req_" + package.replace(/\W/g, "_");
											let i = 0
											do {
												i++
												var scopeName = varBase + "$" + i;
											} while (imports.has(scopeName) || scope.contains(scopeName));
											imports.add(scopeName)
											magicString.overwrite(node.start, node.end, scopeName);
											scopeNames.push([scopeName, package]);
										}
									}
								}
							}
						}
					}
				},
				leave: function leave(node) {
					if (node.scope) {
						scope = scope.parent;
					}
				}
			});
			if (scopeNames.length) {
				var prepend = scopeNames.map(([scopeName, package]) => {
					if (imported == 'default' || package.match(/[^\/]+\.[^\/]+(\?.*)?$/)) {
						return `import ${scopeName} from ${JSON.stringify(package)};`
					} else if (!imported || imported == '*') {
						return `import * as ${scopeName} from ${JSON.stringify(package)};`
					} else {
						return `import {${imported} as ${scopeName}} from ${JSON.stringify(package)};`
					}
				}).join("");
				magicString.prepend(prepend);
				return {
					code: magicString.toString(),
					map: sourceMap ? magicString.generateMap({ hires: true }) : null
				};
			}
			return {
				code: code,
				ast: ast,
				map: sourceMap ? magicString.generateMap({ hires: true }) : null
			};
		}
	}
}

createPlugin.default = createPlugin
module.exports = createPlugin
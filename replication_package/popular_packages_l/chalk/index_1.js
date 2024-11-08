const chalk = (() => {
	class Chalk {
		constructor(options = {}) {
			this.level = options.level ?? Chalk.defaultColorLevel();
		}

		applyStyle(styles, strings) {
			const applyAnsi = codes => `\x1b[${codes.open}m`;
			const open = styles.map(applyAnsi).join('');
			const close = styles.map(style => `\x1b[${style.close}m`).join('');
			return open + strings.join(' ') + close;
		}

		style(...styles) {
			return (...strings) => this.applyStyle(styles, strings);
		}

		static defaultColorLevel() {
			return process.stdout.isTTY ? 3 : 0;
		}
	}

	const styles = {
		modifier: {
			bold: { open: 1, close: 22 },
			dim: { open: 2, close: 22 },
			italic: { open: 3, close: 23 },
			underline: { open: 4, close: 24 },
			inverse: { open: 7, close: 27 },
			hidden: { open: 8, close: 28 },
			strikethrough: { open: 9, close: 29 },
		},
		color: {
			black: { open: 30, close: 39 },
			red: { open: 31, close: 39 },
			green: { open: 32, close: 39 },
			yellow: { open: 33, close: 39 },
			blue: { open: 34, close: 39 },
			magenta: { open: 35, close: 39 },
			cyan: { open: 36, close: 39 },
			white: { open: 37, close: 39 },
			gray: { open: 90, close: 39 },
		},
		bgColor: {
			bgBlack: { open: 40, close: 49 },
			bgRed: { open: 41, close: 49 },
			bgGreen: { open: 42, close: 49 },
			bgYellow: { open: 43, close: 49 },
			bgBlue: { open: 44, close: 49 },
			bgMagenta: { open: 45, close: 49 },
			bgCyan: { open: 46, close: 49 },
			bgWhite: { open: 47, close: 49 },
		}
	};

	const chalkInstance = new Chalk();

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			Object.defineProperty(Chalk.prototype, styleName, {
				get() {
					return this.style(style);
				}
			});
		}
	}

	return new Proxy(chalkInstance, {
		get(target, prop) {
			if (target[prop]) return target[prop];
			const combinedStyles = prop.split('.').map(name => 
				Object.values(styles).flat().find(style => style[name]) || 
				throw new Error(`Unknown style: ${name}`)
			);

			return (...strings) => target.applyStyle(combinedStyles, strings);
		}
	});
})();

console.log(chalk.blue('Hello world!'));
console.log(chalk.red.bold('Error!'));
console.log(chalk.green.whiteBright.bgRed('Success!'));

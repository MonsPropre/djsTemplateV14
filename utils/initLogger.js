const path = require("path");
const chalk = require("chalk");

function formatSegment(segment, {fileUpperCase, fileCapitalized}) {
	if (fileUpperCase) {
		return segment.toUpperCase();
	} else if (fileCapitalized && segment.length > 0) {
		return segment[0].toUpperCase() + segment.slice(1);
	}
	return segment;
}

function getPrefix({
					   showDate,
					   showFile,
					   showRelativePath,
					   fileUpperCase,
					   fileCapitalized,
					   projectRoot,
					   loggerFile
				   }) {
	let prefix = '';

	// Préfixe date
	if (showDate) {
		const pad = n => n.toString().padStart(2, '0');
		const now = new Date();
		const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)} - ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
		prefix += `[${date}]`;
	}

	// Préfixe fichier ou chemin relatif
	if (showFile) {
		const stack = new Error().stack.split('\n');
		// Cherche la première ligne de la stack qui ne contient PAS le nom du logger
		let callerLine = stack.find(line =>
			line.includes('(') &&
			!line.includes(loggerFile)
		);
		if (!callerLine) callerLine = stack[2] || '';
		const match = callerLine.match(/\((.*):\d+:\d+\)/) || callerLine.match(/at (.*):\d+:\d+/);
		let filePath = match ? match[1] : "unknown";
		let fileDisplay;

		if (showRelativePath) {
			let relPath = path.relative(projectRoot, filePath);
			fileDisplay = relPath
				.split(path.sep)
				.map(seg => formatSegment(seg, {fileUpperCase, fileCapitalized}))
				.join(path.sep);
		} else {
			let file = path.basename(filePath);
			file = formatSegment(file, {fileUpperCase, fileCapitalized});
			fileDisplay = file;
		}

		prefix += (prefix ? ' ' : '') + `[${fileDisplay}]`;
	}

	return prefix;
}

function initLogger({
						enabled = true,
						showDate = true,
						showFile = true,
						showRelativePath = false,
						fileUpperCase = false,
						fileCapitalized = true,
						enableLog = true,
						enableError = true
					} = {}) {
	if (!enabled) return;
	const origLog = console.log;
	const origError = console.error;
	const projectRoot = process.cwd();
	const loggerFile = path.basename(__filename); // nom du logger

	function customLog(origFn, ...args) {
		try {
			const prefix = getPrefix({
				showDate,
				showFile,
				showRelativePath,
				fileUpperCase,
				fileCapitalized,
				projectRoot,
				loggerFile
			});
			origFn(`${chalk.hex("#a9a9a9")(prefix)}`, ...args);
		} catch (e) {
			origFn("[console.log error]", ...args);
		}
	}

	if (enableLog) {
		console.log = function (...args) {
			customLog(origLog, ...args);
		};
	}

	if (enableError) {
		console.error = function (...args) {
			customLog(origError, ...args);
		};
	}
}

module.exports = initLogger;

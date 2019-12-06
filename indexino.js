/**
 * @name:    indexino.js
 * @version: 0.1
 * @author:  Hunter Paolini
 * @license: GNU GPLv2
 */


// length and case-insensitive sort
function indexSort (a, b) {
	return a["keyword"].toLowerCase().localeCompare(b["keyword"].toLowerCase());
}

function Index (name) {
	this.name = name || "";
	this.books = [];
	this.config = {
		sort: "keyword",
		showBook: true,
		showSection: true,
		floatSection: false
	};
}

Index.prototype = {
	setName: function (name) {
		this.name = name;
	},
	setSort: function (sort) {
		this.config.sort = (sort === "section") ? "section" : "keyword";
	},
	showBook: function (bool) {
		this.config.showBook = (bool);
	},
	showSection: function (bool) {
		this.config.showSection = (bool);
	},
	floatSection: function (bool) {
		this.config.floatSection = (bool);
	},
	addBook: function (book) {
		book.index = this;
		this.books.push(book);
	},
	getBooks: function () {
		return this.books;
	},
	getKeywords: function () {
		let keywords = [];
		for (let i in this.books) {
			keywords = keywords.concat(this.books[i].getKeywords());
		}
		return keywords.sort(indexSort);
	}
};

function Book (name) {
	this.name = name || "";
	this.sections = [];
}

Book.prototype = {
	setName: function (name) {
		this.name = name;
	},
	addSection: function (section) {
		section.book = this;
		this.sections.push(section);
	},
	getSections: function () {
		return this.sections;
	},
	getKeywords: function () {
		let keywords = [];
		for (let i in this.sections) {
			keywords = keywords.concat(this.sections[i].getKeywords());
		}
		return keywords.sort(indexSort);
	}
};

function Section (name) {
	this.name = name || "";
	this.color = "#eee";
	this.keywords = [];
}

Section.prototype = {
	setName: function (name) {
		this.name = name;
	},
	setColor: function (color) {
		this.color = color;
	},
	addKeyword: function (keyword) {
		keyword.section = this;
		this.keywords.push(keyword);
	},
	getKeywords: function () {
		return this.keywords.sort(indexSort);
	}
};

function Keyword (keyword, page) {
	this.keyword = keyword;
	this.page = page;
}

Keyword.prototype = {
	toString: function () {
		let parentDiv = document.createElement("div");

		let keywordSpan = document.createElement("span");
		let keywordText = document.createTextNode(this.keyword);

		keywordSpan.className = "keyword";
		keywordSpan.appendChild(keywordText);

		let sectionSpan = document.createElement("span");
		let sectionText = document.createTextNode(this.section.name);

		sectionSpan.className = (this.section.book.index.config.floatSection) ? "section right" : "section";
		sectionSpan.style.backgroundColor = this.section.color;
		sectionSpan.appendChild(sectionText);
		
		let bookSpan = document.createElement("span");
		let bookText = document.createTextNode(this.section.book.name);

		bookSpan.className = "book";
		bookSpan.appendChild(bookText);

		let pageSpan = document.createElement("span");
		let pageText = document.createTextNode(this.page);

		pageSpan.className = "page";
		pageSpan.appendChild(pageText);

		parentDiv.appendChild(keywordSpan);
		
		if (this.section.book.index.config.showBook) {
			parentDiv.appendChild(bookSpan);
		}

		parentDiv.appendChild(pageSpan);

		if (this.section.book.index.config.showSection) {
			parentDiv.appendChild(sectionSpan);
		}

		return parentDiv.innerHTML;
	}
};

function generateIndex (e) {
	let fileInput = document.getElementById('file-input')
	readFile(fileInput);
}

function readText () {
	let textArea = document.getElementById('text-input');

	if (!textArea.value.length) {
		return;
	}

	parseFile(textArea.value);
}

function readFile (file) {
	if (!file.files[0]) {
		readText();
		return;
	}

	let reader = new FileReader();

	reader.onload = function(e) {
		parseFile(e.target.result);
	};

	reader.readAsText(file.files[0]);
}

function parseFile (file) {
	let lines = file.split("\n");
	let mode = {
		book: false,
		section: false
	};

	let index = new Index();
	let book, section, page;
	
	for (let i in lines) {
		let line = lines[i];

		// skip empty lines and comments
		if (line.length === 0 || /^\s*\#/.test(line)) {
			continue;
		}

		if (/^\[book\]\s*$/i.test(line)) {
			book = new Book();
			index.addBook(book);

			mode.section = false;
			mode.book = true;
			continue;
		} else if (/^\[section\]\s*$/i.test(line)) {
			section = new Section();
			book.addSection(section);

			mode.book = false;
			mode.section = true;
			
			page = null;
			continue;
		}

		let name = line.replace(/^name\=\s*/i, "");
		if (name.length > 0 && name.length < line.length) {
			if (mode.book) {
				book.setName(name);
				continue;
			} else if (mode.section) {
				section.setName(name);
				continue;
			}
		}

		let color = line.replace(/^color\=\s*/i, "");
		if (mode.section && color.length > 0 && color.length < line.length) {
			section.setColor(color);
			continue;
		}

		if (mode.section) {
			if (Number.isInteger(Number.parseInt(line.split(",")[0].split("-")[0]))) {
				page = line.split(",")[0];
				line = line.split(",");
				line.shift();
				line = line.join(",");
			} else if (!page) {
				continue;
			}

			let keyword = new Keyword(line, page);
			section.addKeyword(keyword);
		}
	}

	generateBlob(index);
}

function loadUserConfig (index) {
	let sortSelect = document.getElementById('sort-select');
	index.setSort(sortSelect.value);
	
	let bookRef = document.getElementById('book-ref');
	index.showBook(bookRef.checked);

	let sectionRef = document.getElementById('section-ref');
	index.showSection(sectionRef.checked);
	
	let sectionFloatRef = document.getElementById('section-float-ref');
	index.floatSection(sectionFloatRef.checked);
}
	
function generateBlob (index) {

	loadUserConfig(index);

	let output, blob, url;

	switch (index.config.sort) {
		case "section":
			output = sortBySection(index);
			break;
		case "keyword" :
		default :
			output = sortByKeyword(index);
	}
	
	let s = [];
	for (let i in output) {
		s.push("<div class='keyword-container'><span>" + output[i] + "</span></div>");
	}

	const style = `
		<style> 
			div.keyword-container > span {
				display: block;
				unicode-bidi: embed;
				font-family: monospace;
				white-space: pre-wrap;
				white-space: -moz-pre-wrap;
				white-space: -pre-wrap;
				white-space: -o-pre-wrap;
				word-wrap: break-word;
			}
			div.keyword-container > span > h2 {
				margin-top: 20px;
			}
			div.keyword-container {
				display: inline-block;
				width: 100%;
			}
			span.book {
				font-style: italic;
			}
			span.book::after {
				content: ', ';
			}
			span.page {
				font-weight: 700;
			}
			span.page::after {
				content: ' ';
			}
			span.keyword::after {
				content: ': ';
			}
			span.right {
				float: right;
			}
		</style>
	`;

	let html = "<!DOCTYPE html><html><head>" + style + "</head><body><div id='index'>" + s.join("\n") + "</div></body></html>";
	blob = new Blob([html], {
		type: 'text/html;charset=utf-8'
	});

	url = window.URL.createObjectURL(blob);
	window.location.assign(url);
	window.URL.revokeObjectURL(url);
}

function prettifyIndex (keywords) {
	// add index letters
	let output = [], previousKeyword, firstChar;

	for (let i in keywords) {
		let div = document.createElement("div");
		div.innerHTML = keywords[i];

		let keyword = div.children[0].innerText;
		let _firstChar = keyword.charAt(0).toUpperCase();

		if (firstChar !== _firstChar) {
			firstChar = _firstChar;
			output.push(formatSubHeader(firstChar));
		}

		div.children[0].innerText = diffKeywords(previousKeyword, keyword);
		output.push(div.innerHTML);

		previousKeyword = keyword;
	}

	return output;
}

function diffKeywords (a, b) {
	let output = [];

	if (typeof a === "undefined") {
		return b;
	}

	let wordsA = a.split(" ");
	let wordsB = b.split(" ");

	for (let i in wordsA) {
		let wordA = wordsA[i].replace(",", "");
		let wordB = (typeof wordsB[i] !== "undefined") ? wordsB[i].replace(",", "") : "";

		if (wordA.toLowerCase() === wordB.toLowerCase()) {
			output.push("");
		} else {
			break;
		}
	}

	for (let i in output) {
		wordsB[i] = wordsB[i].split(/[^,]/u).join("·");
	}

	return wordsB.join(" ");
}

function sortByKeyword (index) {
	let output = [], keywords = index.getKeywords();

	for (let i in keywords) {
		output.push(keywords[i].toString());
	}

	return prettifyIndex(output);
}

function sortBySection (index) {
	let output = [], books = index.getBooks();

	for (let i in books) {
		let sections = books[i].getSections();
		for (let k in sections) { 
			let keywords = sections[k].getKeywords(), _keywords = [];
			for (let j in keywords) {
				_keywords.push(keywords[j].toString());
			}
			output.push(formatHeader(books[i].name, sections[k].name, sections[k].color));
			output = output.concat(prettifyIndex(_keywords));
		}
	}

	return output;
}

function formatHeader (book, section, color) {
	let parentDiv = document.createElement("div");
	let heading = document.createElement("h2");
	let bookText = document.createTextNode(book + ": ");
	let sectionText = document.createTextNode(section);
	let sectionSpan = document.createElement("span");

	heading.style.borderTop = "1px dotted #000";
	heading.style.borderBottom = "1px dotted #000";
	heading.style.paddingTop = "10px";
	heading.style.paddingBottom = "10px";

	sectionSpan.style.backgroundColor = color;
	sectionSpan.appendChild(sectionText);

	heading.appendChild(bookText);
	heading.appendChild(sectionSpan);

	parentDiv.appendChild(heading);

	return parentDiv.innerHTML;
}

function formatSubHeader (string) {
	let parentDiv = document.createElement("div");
	let heading = document.createElement("h3");
	let headingText = document.createTextNode(string);

	heading.style.backgroundColor = "#efefef";
	heading.appendChild(headingText);

	parentDiv.appendChild(heading);

	return parentDiv.innerHTML;
}


// listener hooks
window.addEventListener('load', function() {
	let blobButton = document.getElementById('generate-index-blob');
	blobButton.addEventListener('click', generateIndex, false);
});

# Indexino

Indexino parses book indexes from INI-like configuration files. It's a rapid alternative to CSV and Excel.

## Sample configuration

```
[book]
name=the animal book

#comment

[section]
name=domestic
color=#00ff00

1,dog
2,dog food
3,cat
cat food
4-6,bird

[section]
name=wild
color=red

10,snake
shark
8-9,bear
7,lion
```

## Sample output

#### Index sorted by keyword
![Index sorted by keyword](https://raw.githubusercontent.com/hpaolini/indexino-js/master/sample/keywordsort.png)

#### Index sorted by keyword with right-aligned sections
![Index sorted by keyword with right-aligned sections](https://raw.githubusercontent.com/hpaolini/indexino-js/master/sample/keywordsort2.png)

#### Index sorted by section
![Index sorted by section](https://raw.githubusercontent.com/hpaolini/indexino-js/master/sample/sectionsort.png)

## Syntax details

Each index must start with the `[book]` tag. Accepted properties are: `name`.

```
[book]
name=the animal book
```

A book is composed of one or more sections; use the `[section]` tag to group them. Accepted properties are: `name` and `color`.

```
[section]
name=domestic
color=#00ff00
```

A keyword must be preceded by a page (number or range) and a comma.

```
#page,keyword
1,dog
4-6,bird
```

You may omit the page when keywords are in the same page.

```
3,cat
cat food
```

Page order does not matter.

```
10,snake
shark
8-9,bear
7,lion
```

Comments are added with the `#` character at the beginning of the line.

```
#comment
```

## Installation (client)

Use [git](https://git-scm.com/) to clone the repository into an `indexino` folder.

```bash
git clone https://github.com/hpaolini/indexino-js.git indexino
```

## Usage

#### Client

```bash
cd indexino
open index.html
```

#### Live

[http://hpaolini.github.io/indexino-js](http://hpaolini.github.io/indexino-js)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[GNU GPLv2](https://choosealicense.com/licenses/gpl-2.0/)

# Strut JS

Strut JS is one lightweight class that parses HTML, looking for plain `{variable}` tags that it can update in the future.

## How to Use

Make a new template by passing an HTML element or [selector string](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors) to the constructor.

```js
const template = new StrutTemplate("#profile");
```

You now have access to three methods that change and modify the DOM to match plain JS object data.

### Update

`.update(data)` will replace all of the relevant `{variable}` tags based on an object you pass to the method. You can use tags like `{profile.name.first}` to access deeper values.

#### HTML

```html
<div id="profile">
  <p><b>Welcome, {person.name.first}!</b></p>
  <p>You have {msgCount} messages.</p>
</div>
```

#### JS

```js
const template = new StrutTemplate("#profile");

template.update({
  profile: {
    name: {
      first: "Chris",
      last: "Hallberg",
    }
  }
});
```

#### Result

```html
<div id="profile">
  <p><b>Welcome, Chris!</b></p>
  <p>You have {msgCount} messages.</p>
</div>
```

#### JS

```js
template.update({ msgCount: 4 });
```

#### Result

```html
<div id="profile">
  <p><b>Welcome, Chris!</b></p>
  <p>You have 4 messages.</p>
</div>
```

## Clone

When you want to use a template to make multiple elements, you can use `.clone(data, parent)`.

Passing in `data` will immediately update the new copy. Use `null` or `{}` to skip this.

Passing in a parent element or selector will insert the new element immediately, or you can use `template.el` yourself.

```js
const copy = template.clone();

const copyPaste = template.clone({}, "#newLocation");

const copy = template.clone(
  { profile: { name: { first: "Nicole" } } },
  template.el.parentNode // insert into the parent of the original template
);
```

## Map

`.map(data, parent)` takes an array of data and returns a new clone for each item, updated by that item.

Passing in a parent will replace all of the children of that parent with all of these clones. Helpful but use with care!

#### HTML

```html
<ul id="list">
  <li id="item-template">{box} {todo}</li>
</ul>
```

#### JS

```js
const itemTemplate = new StrutTemplate("#item-template");
itemTemplate.update({ box: "[ ]" });
const todos = itemTemplate.map(
  [
    { todo: "Get apples." },
    { todo: "Peel apples." },
    { todo: "Add to slow cooker." },
    { todo: "Add sugar and spice." },
    { todo: "Slow cook for 6 hours." },
  ],
  "#list"
)

todos[0].update({ box: "[X]" });
todos[1].update({ box: "[X]" });
```

#### Result

```html
<ul id="list">
    <li>[X] Get apples.</li>
    <li>[X] Peel apples.</li>
    <li>[ ] Add to slow cooker.</li>
    <li>[ ] Add sugar and spice.</li>
    <li>[ ] Slow cook for 6 hours.</li>
</ul>
```

## TypeScript types

[TypeScript](https://www.typescriptlang.org/) compatible types added via [JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) for compatibility with TS and browser compatibility out of the box.

## Limitations / Known Issues

- `{variable}` tags inside of tags ignored: `<p id={id}>Does nothing</p>`.
- All HTML is escaped: `<p>&lt;b&gt;bold&lt;/b&gt;</p>`.
- [Strut](http://strut.io/) is another JS project for making slides with markdown.

## Example

```html
<!DOCTYPE html>
<html>

<head>
  <!-- Load as normal dependency -->
  <script src="https://raw.githubusercontent.com/crhallberg/strut-js/dev/index.js"></script>
</head>

<body>
  <main>
    <div id="template" class="template">
      <p><b>Hello, {person.name}!</b></p>
      <p><a href="#">This</a> is going to {literally} be {adverb} {adj}!</p>
      <p>Nesting <span>is <span>{adj}</span>!</span></p>
    </div>
  </main>

  <div id="parent"></div>

  <script>
    const tplt = new StrutTemplate("#template");

    // initial data
    tplt.update({
      adj: "fun",
      adverb: "very",
      person: { name: "Chris" },
    });

    // Just for fun, another update
    tplt.update({ adj: "successful" });

    // make a clone
    const tplt2 = tplt.clone(
      { adverb: "quite", adj: "daft" },
      tplt.el.parentNode
    );

    // make a whole bunch of clones with map
    const ts = tplt.map(
      [
        { person: { name: "Chris" }, adj: "smart" },
        { person: { name: "Nicole" }, adj: "strong" },
        { person: { name: "Vince" }, adj: "suave" },
      ],
      "#parent"
    );
  </script>
</body>

</html>
```

## Inspiration

Inspired by [this tweet by Freya Holmér](https://twitter.com/FreyaHolmer/status/1449052877318668288). I hope this is the Level 2 solution that the next person is hoping for.

## Contributing

After making changes, you can run the integration tests by opening `mocha.html` in the browser of your choice.

A few useful package.json scripts for contributing developers:

| Script | Description |
| ------ | ----------- |
| `npm run check-types` | Runs TypeScript checks on JSDocs. |
| `npm run dev` | Runs type-checking in watch mode. |
| `npm run check-size` | Uses [size-limit](https://github.com/ai/size-limit) to check the gzipped size of the export. |
| `npm run format` | Runs [Prettier](https://prettier.io/) on all core JS and JSON files. |

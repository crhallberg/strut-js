const { suite } = require("uvu");
const assert = require('uvu/assert');
const testbedEl = document.getElementById("testbed");

function Strut(html, id = "testbed") {
  testbedEl.innerHTML = html;
  return new StrutTemplate("#" + id);
}

function get(sel) {
  return testbedEl.querySelector(sel);
}

function checkHTML(t, html) {
  assert.is(t.el.innerHTML, html);
}

const template = suite("template");

template("basic", () => {
  const t = Strut("<p>{msg}</p>");
  t.update({ msg: "YAY!" });
  checkHTML(t, "<p>YAY!</p>");
});

template("default value", () => {
  const t = Strut("<p>{msg=default} and {number=3}</p>");
  checkHTML(t, "<p>default and 3</p>");
  t.update({ msg: "YAY!" });
  checkHTML(t, "<p>YAY! and 3</p>");
});

template("html escaped", () => {
  const t = Strut("<p>{msg}</p>");
  t.update({ msg: "<b>bold</b>" });
  checkHTML(t, "<p>&lt;b&gt;bold&lt;/b&gt;</p>");
});

template("triple update", () => {
  const t = Strut("<p>{msg}</p>");
  t.update({ msg: "warm..." });
  t.update({ msg: "warmer..." });
  t.update({ msg: "HOT!" });
  checkHTML(t, "<p>HOT!</p>");
});

template("multi", () => {
  const t = Strut('<p>"{name} says {msg}" - {name}</p>');
  t.update({ msg: "YAY!", name: "Chris" });
  checkHTML(t, '<p>"Chris says YAY!" - Chris</p>');
});

template("literal", () => {
  const t = Strut("<p>{notouchy}</p>");
  t.update({ msg: "YAY!" });
  checkHTML(t, "<p>{notouchy}</p>");
});

template("empty update", () => {
  const t = Strut("<p>{notouchy}</p>");
  t.update();
  checkHTML(t, "<p>{notouchy}</p>");
});

template("no update", () => {
  const t = Strut("<p>{notouchy}</p>");
  checkHTML(t, "<p>{notouchy}</p>");
});

template("multi literal", () => {
  const t = Strut('<p>"{notouchy}" - {name}</p>');
  t.update({ name: "Chris" });
  checkHTML(t, '<p>"{notouchy}" - Chris</p>');
});

template("extra keys", () => {
  const t = Strut('<p>"{notouchy}" - {name}</p>');
  t.update({ nonce: "EXTRA!", name: "Chris" });
  checkHTML(t, '<p>"{notouchy}" - Chris</p>');
});

template("deep", () => {
  const t = Strut(
    '<p>{person.name.first} "{person.nickname}" {person.name.last}!</p>'
  );
  t.update({
    person: {
      name: { first: "Chris", last: "Hallberg" },
      nickname: "Iceberg",
    },
  });
  checkHTML(t, '<p>Chris "Iceberg" Hallberg!</p>');
});

template("handles brace spacing", () => {
  const t = Strut("<p>{good} { good } {   good } {   x =  yep     }</p>");
  t.update({ good: "yep" });
  checkHTML(t, "<p>yep yep yep yep</p>");
});

const clone = suite("clone");

clone("clones", () => {
  const t1 = Strut("<p>{num}</p>");
  t1.update({ num: 1 });
  const t2 = t1.clone();
  assert.is(t1.el.innerHTML, t2.el.innerHTML);
});

clone("clones with update", () => {
  const t1 = Strut("<p>{num}</p>");
  t1.update({ num: 1 });
  const t2 = t1.clone({ num: 2 });
  checkHTML(t1, "<p>1</p>");
  checkHTML(t2, "<p>2</p>");
});

clone("no quantum entanglement", () => {
  const t1 = Strut("<p>{num}</p>");
  t1.update({ num: 1 });
  const t2 = t1.clone({ num: 2 });
  t1.update({ num: "one" });
  checkHTML(t1, "<p>one</p>");
  checkHTML(t2, "<p>2</p>");
});

clone("removes ids", () => {
  const t1 = Strut('<p id="a"><b id="b">{num}</b></p>');
  t1.update({ num: 1 });
  const t2 = t1.clone({ num: 2 });
  checkHTML(t1, '<p id="a"><b id="b">1</b></p>');
  checkHTML(t2, "<p><b>2</b></p>");
});

const map = suite("map");

map("clones with update", () => {
  const origin = Strut("<p>{num}</p>");
  const ts = origin.map([{ num: 0 }, { num: 1 }, { num: 2 }]);
  assert.is(ts.length, 3);
  checkHTML(ts[0], "<p>0</p>");
  checkHTML(ts[1], "<p>1</p>");
  checkHTML(ts[2], "<p>2</p>");
});

map("no quantum entanglement", () => {
  const origin = Strut("<p>{num}</p>");
  const ts = origin.map([{ num: 0 }, { num: 1 }, { num: 2 }]);
  origin.update({ num: "BOOM" });
  checkHTML(ts[0], "<p>0</p>");
  checkHTML(ts[1], "<p>1</p>");
  checkHTML(ts[2], "<p>2</p>");
});

map("list example", () => {
  const item = Strut(
    '<ul id="list"><li id="item-template">{box=[ ]} {todo}</li></ul>',
    "item-template"
  );

  const todos = item.map(
    [
      { todo: "Get apples." },
      { todo: "Peel apples." },
      { todo: "Add to slow cooker." },
      { todo: "Add sugar and spice." },
      { todo: "Slow cook for 6 hours." },
    ],
    item.el.parentNode
  );

  todos[0].update({ box: "[X]" });
  todos[1].update({ box: "[X]" });

  assert.is(
    get("#list").innerHTML,
    "<li>[X] Get apples.</li><li>[X] Peel apples.</li><li>[ ] Add to slow cooker.</li><li>[ ] Add sugar and spice.</li><li>[ ] Slow cook for 6 hours.</li>"
  );
});
 
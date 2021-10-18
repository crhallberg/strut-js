const assert = chai.assert;
const el = document.getElementById("testbed");

function Strut(html) {
  el.innerHTML = html;
  return new StrutTemplate("#testbed");
}

function checkHTML(t, html) {
  assert.equal(t.el.innerHTML, html);
}

describe("template", () => {
  it("basic", () => {
    const t = Strut("<p>{msg}</p>");
    t.update({ msg: "YAY!" });
    checkHTML(t, "<p>YAY!</p>");
  });

  it("html escaped", () => {
    const t = Strut("<p>{msg}</p>");
    t.update({ msg: "<b>bold</b>" });
    checkHTML(t, "<p>&lt;b&gt;bold&lt;/b&gt;</p>");
  });

  it("triple update", () => {
    const t = Strut("<p>{msg}</p>");
    t.update({ msg: "warm..." });
    t.update({ msg: "warmer..." });
    t.update({ msg: "HOT!" });
    checkHTML(t, "<p>HOT!</p>");
  });

  it("multi", () => {
    const t = Strut('<p>"{name} says {msg}" - {name}</p>');
    t.update({ msg: "YAY!", name: "Chris" });
    checkHTML(t, '<p>"Chris says YAY!" - Chris</p>');
  });

  it("literal", () => {
    const t = Strut("<p>{notouchy}</p>");
    t.update({ msg: "YAY!" });
    checkHTML(t, "<p>{notouchy}</p>");
  });

  it("empty update", () => {
    const t = Strut("<p>{notouchy}</p>");
    t.update();
    checkHTML(t, "<p>{notouchy}</p>");
  });

  it("no update", () => {
    const t = Strut("<p>{notouchy}</p>");
    checkHTML(t, "<p>{notouchy}</p>");
  });

  it("multi literal", () => {
    const t = Strut('<p>"{notouchy}" - {name}</p>');
    t.update({ name: "Chris" });
    checkHTML(t, '<p>"{notouchy}" - Chris</p>');
  });

  it("extra keys", () => {
    const t = Strut('<p>"{notouchy}" - {name}</p>');
    t.update({ nonce: "EXTRA!", name: "Chris" });
    checkHTML(t, '<p>"{notouchy}" - Chris</p>');
  });

  it("deep", () => {
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

  it("handles brace spacing", () => {
    const t = Strut("<p>{good} { good } {   good } {   good     }</p>");
    t.update({ good: "yep" });
    checkHTML(t, "<p>yep yep yep yep</p>");
  });
});

describe("clone", () => {
  it("clones", () => {
    const t1 = Strut("<p>{num}</p>");
    t1.update({ num: 1 });
    const t2 = t1.clone();
    assert.equal(t1.el.innerHTML, t2.el.innerHTML);
  });

  it("clones with update", () => {
    const t1 = Strut("<p>{num}</p>");
    t1.update({ num: 1 });
    const t2 = t1.clone({ num: 2 });
    checkHTML(t1, "<p>1</p>");
    checkHTML(t2, "<p>2</p>");
  });

  it("no quantum entanglement", () => {
    const t1 = Strut("<p>{num}</p>");
    t1.update({ num: 1 });
    const t2 = t1.clone({ num: 2 });
    t1.update({ num: "one" });
    checkHTML(t1, "<p>one</p>");
    checkHTML(t2, "<p>2</p>");
  });

  it("removes element ids", () => {
    const t1 = Strut('<p id="a"><b id="b">{num}</b></p>');
    t1.update({ num: 1 });
    const t2 = t1.clone({ num: 2 });
    checkHTML(t1, '<p id="a"><b id="b">1</b></p>');
    checkHTML(t2, "<p><b>2</b></p>");
  });
});

describe("map", () => {
  it("clones with update", () => {
    const origin = Strut("<p>{num}</p>");
    const ts = origin.map([
      { num: 0 },
      { num: 1 },
      { num: 2 },
    ]);
    assert.equal(ts.length, 3);
    checkHTML(ts[0], "<p>0</p>");
    checkHTML(ts[1], "<p>1</p>");
    checkHTML(ts[2], "<p>2</p>");
  });

  it("no quantum entanglement", () => {
    const origin = Strut("<p>{num}</p>");
    const ts = origin.map([
      { num: 0 },
      { num: 1 },
      { num: 2 },
    ]);
    origin.update({ num: "BOOM" });
    checkHTML(ts[0], "<p>0</p>");
    checkHTML(ts[1], "<p>1</p>");
    checkHTML(ts[2], "<p>2</p>");
  });
});

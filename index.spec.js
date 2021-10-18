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
    const t = Strut(
      '<p>{good} { good } {   good } {   good     }</p>'
    );
    t.update({ good: "yep" });
    checkHTML(t, "<p>yep yep yep yep</p>");
  });
});

describe("clone", () => {});

describe("map", () => {});

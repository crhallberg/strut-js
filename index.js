class StrutTemplate {
  /** @type {Record<string, string | number | boolean>} */
  _data = {};

  /** @type {Record<string, number[]>} */
  _map = {};

  /**
   * @typedef {Object} ParsedNode
   * @prop {string[]} parts
   * @prop {Text} node
   * @prop {number[]} xpath
   */
  /** @type {ParsedNode[]} */
  _nodes = [];

  /**
   * @param {string | HTMLElement} el
   * @param {boolean} _parse (only for clone)
   */
  constructor(el, _parse = true) {
    this.el = this._el(el);

    if (this.el === null) {
      throw Error("StrutTemplate element not found: " + el);
    }

    if (_parse) {
      this._parse(this.el);
    }
  }

  /**
   * @param {string | HTMLElement | null} el
   * @return {HTMLElement | null}
   */
  _el(el) {
    if (el === null) return null;
    return el instanceof HTMLElement ? el : document.querySelector(el);
  }

  _RGX = /\{([^\}]+)\}/g;

  /**
   * @param  {HTMLElement} el
   * @param  {Record<string, Set<number>>} setMap (for recursion and _map)
   * @param  {number[]} _xpath (for recursion and _map)
   * @return void | Record<string, Set<number>>
   */
  _parse(el, setMap = {}, _xpath = []) {
    for (let i = 0; i < el.childNodes.length; i++) {
      const node = el.childNodes[i];
      const xpath = [..._xpath, i];

      if (node instanceof HTMLElement) {
        setMap = this._parse(node, setMap, xpath) ?? {};
      }

      if (node instanceof Text) {
        const text = node.textContent;
        if (text !== null && text.trim().length > 0) {
          const parts = text.split(this._RGX);

          if (parts.length < 2) {
            continue;
          }

          // Every odd-indexed part is a {tag}
          for (let j = 1; j < parts.length; j += 2) {
            const key = (parts[j] = parts[j].trim());
            this._data[key] = `{${key}}`;

            if (typeof setMap[key] == "undefined") {
              setMap[key] = new Set();
            }

            setMap[key].add(this._nodes.length);
          }

          this._nodes.push({ parts, node, xpath });
        }
      }
    }

    if (_xpath.length > 0) {
      return setMap;
    }

    for (let key in setMap) {
      this._map[key] = /** @type {number[]} */ Array.from(setMap[key]);
    }
  }

  /**
   * @param  {Record<string, any>} newData
   * @param  {string} path
   * @return {void | Set<number>}
   */
  update(newData, path = "") {
    let updatedNodes = new Set();

    for (const key in newData) {
      if (typeof newData[key] == "object") {
        const subNodes = /** @type {Set<number>} */ (
          this.update(newData[key], path + key + ".")
        );
        subNodes.forEach((index) => updatedNodes.add(index));
        continue;
      }

      if (typeof this._map[path + key] != "undefined") {
        this._map[path + key].forEach((index) => updatedNodes.add(index));
        this._data[path + key] = newData[key];
      }
    }

    // Recursive return
    if (path.length > 0) {
      return updatedNodes;
    }

    // Update nodes
    for (const index of updatedNodes) {
      const { node, parts } = this._nodes[index];
      let newContent = parts[0];
      for (let i = 1; i < parts.length; i++) {
        if (i % 2) {
          newContent += this._data[parts[i]];
        } else {
          newContent += parts[i];
        }
      }
      node.textContent = newContent;
    }
  }

  /**
   * @param  {number[]} path
   * @return {Text}
   */
  _xpath(path) {
    /** @type {ChildNode} */
    let el = this.el;
    for (let i = 0; i < path.length; i++) {
      el.removeAttribute("id");
      el = el.childNodes[path[i]];
    }
    return /** @type {Text} */ (el);
  }

  /**
   * @param  {Record<string, any>} data
   * @param  {HTMLElement | string | null} _parent
   * @return {StrutTemplate}
   */
  clone(data = {}, _parent = null) {
    let t = new StrutTemplate(
      /** @type {HTMLElement} */ (this.el.cloneNode(true)),
      false
    );

    t._map = Object.assign({}, this._map);
    t._nodes = this._nodes.map(({ parts, xpath }, index) => {
      return {
        node: t._xpath(xpath),
        parts: [...parts],
        xpath: [...xpath],
      };
    });

    t.update(data);

    if (_parent) {
      const parent = this._el(_parent);

      if (parent !== null) {
        parent.appendChild(t.el);
      }
    }

    return t;
  }

  /**
   * @param  {Record<string, any>[]} data
   * @param  {HTMLElement | string | null} _parent
   * @return {StrutTemplate[]}
   */
  map(data, _parent = null) {
    /** @type {StrutTemplate[]} */
    let templates = [];

    const parent = this._el(_parent);
    while (parent && parent.lastChild !== null) {
      parent.removeChild(parent.lastChild);
    }

    return data.map((datum) => this.clone(datum, parent));
  }
}

if (typeof module !== "undefined") {
  module.exports = StrutTemplate;
}

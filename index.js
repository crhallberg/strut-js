class StrutTemplate {
  /** @type {Record<string, any>} */
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
      throw Error("StrutTemplate el not found: " + el);
    }

    if (_parse) {
      this._parse(this.el);
    }
  }

  /**
   * @param {string | HTMLElement} el
   * @return {HTMLElement | null}
   */
  _el(el) {
    return el instanceof HTMLElement ? el : document.querySelector(el);
  }

  /**
   * @param  {Record<string, any>} obj
   * @param  {string} path
   * @return { { obj: Record<string, any>, key: string } }
   */
  _delve(obj, path) {
    if (path.indexOf(".") === -1) {
      return { obj, key: path };
    }

    const parts = path.split(".");
    const key = /** @type {string} */ (parts.pop());
    for (const p of parts) {
      if (typeof obj[p] == "undefined") {
        obj[p] = {};
      }
      obj = obj[p];
    }
    return { obj, key };
  }

  /**
   * @param  {Record<string, any>} _obj
   * @param  {string} path
   * @return {any}
   */
  _get(_obj, path) {
    const { obj, key } = this._delve(_obj, path);
    return obj[key];
  }

  /**
   * @param  {Record<string, any>} _obj
   * @param  {string} path
   * @param  {any} value
   * @return void
   */
  _set(_obj, path, value) {
    const { obj, key } = this._delve(_obj, path);
    obj[key] = value;
  }

  _RGX = /\{([^\\\}]+)\}/g;

  /**
   * @param  {HTMLElement} el
   * @param  {number[]} xpath (for recursion and _map)
   * @return void
   */
  _parse(el, xpath = []) {
    let isParent = false;
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i];
      if (child instanceof HTMLElement) {
        this._parse(child, [...xpath, i]);
      }
      if (child instanceof Text) {
        const text = child.textContent;
        if (text !== null && text.trim().length > 0) {
          const parts = text.split(this._RGX);
          if (parts.length < 2) {
            continue;
          }
          const index = this._nodes.length;
          this._nodes.push({ parts, node: child, xpath: [...xpath, i] });
          for (let i = 1; i < parts.length; i += 2) {
            const key = parts[i];
            this._set(this._data, key, `{${key}}`);

            if (typeof this._map[key] == "undefined") {
              this._map[key] = [];
            }
            this._map[key].push(index);
          }
        }
      }
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
        const subUpdates = /** @type {Set<number>} */ (
          this.update(newData[key], path + key + ".")
        );
        subUpdates.forEach((index) => updatedNodes.add(index));
        continue;
      }

      this._map[path + key].forEach((index) => updatedNodes.add(index));

      this._set(this._data, path + key, newData[key]);
    }

    // Recursive return
    if (path.length > 0) {
      return updatedNodes;
    }

    // Update nodes at the top
    for (const index of updatedNodes) {
      const { node, parts } = this._nodes[index];
      let newContent = parts[0];
      for (let i = 1; i < parts.length; i++) {
        if (i % 2 === 1) {
          newContent += this._get(this._data, parts[i]);
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
    let el = this.el.childNodes.item(path[0]);
    for (let i = 1; i < path.length; i++) {
      el = el.childNodes.item(path[i]);
    }
    return /** @type Text */ (el);
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

    t.el.removeAttribute("id");
    t._map = Object.assign({}, this._map);
    t._nodes = this._nodes.map(({ parts, xpath }, index) => {
      return {
        node: t._xpath(xpath),
        parts: parts.slice(),
        xpath: xpath.slice(),
      };
    });

    t.update(Object.assign({}, this._data, data));

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

    data.forEach((datum) => {
      const t = this.clone(datum);
      templates.push(t);
    });

    if (_parent) {
      const parent = this._el(_parent);

      if (parent === null) {
        return templates;
      }

      while (parent.lastChild !== null) {
        parent.removeChild(parent.lastChild);
      }

      templates.forEach((t) => parent.appendChild(t.el));
    }

    return templates;
  }
}

if (typeof exports != "undefined") {
  exports.StrutTemplate = StrutTemplate;
}

export const unflatten = (data: { [x: string]: any }): any => {
  if (Object(data) !== data || Array.isArray(data)) return data;
  const regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
    resultholder = {};
  for (var p in data) {
    var cur = resultholder,
      prop = '',
      m;
    while ((m = regex.exec(p))) {
      cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
      prop = m[2] || m[1];
    }
    cur[prop] = data[p];
  }
  return resultholder[''];
};

export const flatten = data => {
  let result = {};
  const recurse = (cur, prop) => {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++) recurse(cur[i], prop + '[' + i + ']');
      if (l == 0) result[prop] = [];
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + '.' + p : p);
      }
      if (isEmpty) result[prop] = {};
    }
  };
  recurse(data, '');
  return result;
};

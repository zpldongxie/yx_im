const storage = {
  set: (name, val) => {
    localStorage.setItem(name, val);
  },
  get: (name) => {
    return localStorage.getItem(name);
  },
  del: (name) => {
    localStorage.removeItem(name);
  }
};

export default storage;
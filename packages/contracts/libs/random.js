function getDistributions(num, min, max) {
  let total = Math.ceil(((max + min) / 2) * num);
  const res = [];
  const random = () => Math.floor(Math.random() * (max - min + 1) + min);

  while (res.length < num) {
    const value = random();
    if (value <= total) {
      res.push(value);
      total -= value;
    } else {
      let need = Math.ceil((num - res.length) * (max + min / 2)) - total;
      total = total + need;
      let i = 0;
      while (need > 0) {
        if (res[i] > min) {
          res[i] = res[i] - 1;
          need -= 1;
        }
        i = (i + 1) % res.length;
      }
    }
  }

  let i = 0;
  while (total > 0) {
    if (res[i] < max) {
      res[i] = res[i] + 1;
      total -= 1;
    }
    i = (i + 1) % res.length;
  }

  const r = {};

  for (i = 0; i < res.length; i++) {
    r[res[i]] = r[res[i]] ? r[res[i]] + 1 : 1;
  }

  return r;
}

const res = getDistributions(152, 10, 20);

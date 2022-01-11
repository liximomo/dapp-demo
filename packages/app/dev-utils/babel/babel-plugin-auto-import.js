module.exports = ({ types: t }) => {
  return {
    visitor: {
      CallExpression(path, state) {
        const name = path.node.callee.name;
        if (!name) {
          return;
        }

        if (state.opts[name]) {
          state.set(name, state.opts[name]);
        }
      },
      Program: {
        exit(path, state) {
          const keys = Object.keys(state.opts);
          for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            const module = state.get(key);
            if (module) {
              const importSpecifier = t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier(key))],
                t.stringLiteral(module)
              );
              path.unshiftContainer("body", importSpecifier);
            }
          }
        }
      }
    }
  };
};

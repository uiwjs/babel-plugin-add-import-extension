
import { declare } from '@babel/helper-plugin-utils';
import { existsSync, lstatSync } from 'fs';
import { resolve, extname, dirname } from 'path';
import { types } from '@babel/core';

const { importDeclaration, exportNamedDeclaration, exportAllDeclaration, stringLiteral } = types

// Checks if the module has an active extension
const isActiveExtension = (module, observedScriptExtensions) => {
  const ext = extname(module).toLowerCase().replace(/[^a-z]/, '');
  return observedScriptExtensions.includes(ext);
};

// Checks if the module is a Node module
export const isNodeModule = (module) => {
  if (module.startsWith('.') || module.startsWith('/')) {
    return false;
  }

  try {
    require.resolve(module);
    return true;
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      return false;
    }
    // console.error(e);
  }
};

const skipModule = (module, { replace, extension, skipUnlistedExtensions, observedScriptExtensions }) => {
  // If the module path does not start with "." (not a relative path) or is a Node module, skip it directly
  if (!module.startsWith('.') || isNodeModule(module)) {
    return true;
  }
  // Get the module's extension and convert it to lowercase
  const moduleExtension = extname(module).toLowerCase();
  const moduleExtensionWithoutDot = moduleExtension.replace(/^\./, '');
  // If the module's extension is not in the list of observed script extensions, skip it
  if (skipUnlistedExtensions == true && !observedScriptExtensions.includes(moduleExtensionWithoutDot)) {
    return true;
  }

  // If the module has no extension, do not skip it (because an extension might need to be added)
  if (!moduleExtension) {
    return false;
  }
  // If the module already has the target extension (after converting to lowercase), skip it
  if (moduleExtension === `.${extension.toLowerCase()}`) {
    return true;
  }
  // When replace is true, allow replacing the existing extension, so do not skip
  if (replace) {
    return false; // Do not skip, allow replacing the extension
  }
  // When replace is false, skip if the module has an "active" extension
  return isActiveExtension(module, observedScriptExtensions);
};
  
// Generates a module path declaration
export const makeDeclaration = ({ declaration, args }) => (path, state) => {
  const { node } = path;
  const { source, exportKind, importKind } = node;
  const { replace = false, extension = 'js', skipUnlistedExtensions = false, observedScriptExtensions = ['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs'] } = state.opts;

  // If there is no source or it's a type-only import/export, return directly
  const isTypeOnly = exportKind === 'type' || importKind === 'type';
  if (!source || isTypeOnly) return;

  const module = source.value;

  // If the module should be skipped, return directly
  if (skipModule(module, { replace, extension, skipUnlistedExtensions, observedScriptExtensions })) return;
  const dirPath = resolve(dirname(module), module)
  const hasModuleExt = extname(module).length && isActiveExtension(module, observedScriptExtensions);
  let newModuleName = hasModuleExt ? module.slice(0, -extname(module).length) : module;
  // Generates the new path based on the module path
  const pathLiteral = () => {
      if (existsSync(dirPath) && lstatSync(dirPath).isDirectory()) {
          return `${module}${newModuleName.endsWith('/') ? '' : '/'}index.${extension}`;
      }
      if (newModuleName.endsWith('/')) {
          newModuleName = `${module}index`;
      }
      return `${newModuleName}.${extension}`;
  };

  path.replaceWith(
      declaration(
      ...args(path),
      stringLiteral(pathLiteral())
      )
  );
};

export default declare((api, options) => {
    api.assertVersion(7);
    return {
        name: 'add-import-extension',
        visitor: {
            ImportDeclaration: makeDeclaration({
                ...options,
                declaration: importDeclaration,
                args: ({ node: { specifiers } }) => [specifiers]
            }),
            ExportNamedDeclaration: makeDeclaration({
                ...options,
                declaration: exportNamedDeclaration,
                args: ({ node: { declaration, specifiers } }) => [declaration, specifiers]
            }),
            ExportAllDeclaration: makeDeclaration({
                ...options,
                declaration: exportAllDeclaration,
                args: () => []
            })
        }
    };
})